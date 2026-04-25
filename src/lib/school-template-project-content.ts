import { readFileSync } from "node:fs";
import path from "node:path";
import {
  getSchoolTemplateManifest,
  type SchoolTemplateField,
  type SchoolTemplateManifest,
  type SchoolTemplatePage,
  type SchoolTemplateSection,
} from "@/lib/school-template-manifests";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";

export type SchoolTemplateProjectFieldValue = string | number | boolean | null;

export type SchoolTemplateProjectTheme = {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
};

export type SchoolTemplateProjectAsset = {
  id: string;
  kind: "image" | "video" | "model3d" | "file";
  source: string;
  originalSource?: string;
  label?: string;
  pageSlug?: string;
  sectionId?: string;
  fieldKey?: string;
  createdAt: string;
};

export type SchoolTemplateProjectSectionContent = {
  id: string;
  label: string;
  fields: Record<string, SchoolTemplateProjectFieldValue>;
  repeatable?: {
    items: Array<Record<string, SchoolTemplateProjectFieldValue>>;
  };
};

export type SchoolTemplateProjectPageContent = {
  slug: string;
  fileName: string;
  title: string;
  isHome: boolean;
  sections: SchoolTemplateProjectSectionContent[];
};

export type SchoolTemplateProjectContent = {
  version: 1;
  templateSlug: string;
  templateName: string;
  generatedAt: string;
  theme: SchoolTemplateProjectTheme;
  assets: SchoolTemplateProjectAsset[];
  sharedSections: SchoolTemplateProjectSectionContent[];
  pages: SchoolTemplateProjectPageContent[];
};

export type SchoolTemplateProjectFieldSnapshot = {
  key: string;
  label: string;
  type: SchoolTemplateField["type"];
  selector: string;
  target: SchoolTemplateField["target"];
  defaultValue?: SchoolTemplateField["defaultValue"];
  attribute?: string;
  configPath?: string;
  cssVariable?: string;
  scope?: SchoolTemplateField["scope"];
  unit?: string;
  acceptedFileTypes?: string[];
  placeholder?: string;
  helpText?: string;
  uiGroup?: string;
  uiOrder?: number;
  min?: number;
  max?: number;
  step?: number;
};

export type SchoolTemplateProjectSectionSnapshot = {
  id: string;
  label: string;
  selector: string;
  description?: string;
  fields: SchoolTemplateProjectFieldSnapshot[];
  repeatable?: {
    itemSelector: string;
    labelSingular: string;
    labelPlural: string;
    minItems?: number;
    maxItems?: number;
  };
};

export type SchoolTemplateSourceSnapshot = {
  version: 1;
  capturedAt: string;
  templateSlug: string;
  templateName: string;
  sourceDir: string;
  entryFile: string;
  previewPath: string;
  assetInventory: SchoolTemplateManifest["assetInventory"];
  sharedSections: SchoolTemplateProjectSectionSnapshot[];
  pages: Array<{
    slug: string;
    fileName: string;
    title: string;
    isHome: boolean;
    sections: SchoolTemplateProjectSectionSnapshot[];
  }>;
};

type TemplateTextNode = {
  type: "text";
  content: string;
  parent: TemplateElementNode | null;
};

type TemplateRawNode = {
  type: "raw";
  content: string;
  parent: TemplateElementNode | null;
};

type TemplateElementNode = {
  type: "element";
  tagName: string;
  attrs: Array<{ name: string; value: string | null }>;
  children: TemplateNode[];
  parent: TemplateElementNode | null;
};

type TemplateNode = TemplateElementNode | TemplateTextNode | TemplateRawNode;

type SelectorStep = {
  raw: string;
  combinator: "descendant" | "child";
};

type ParsedSelector = {
  tagName?: string;
  id?: string;
  classes: string[];
  notClasses: string[];
  attrs: Array<{
    name: string;
    operator?: "=" | "^=";
    value?: string;
  }>;
  nthOfType?: number;
};

export const schoolTemplateProjectFieldValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const schoolTemplateProjectAssetSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["image", "video", "model3d", "file"]),
  source: z.string(),
  originalSource: z.string().optional(),
  label: z.string().optional(),
  pageSlug: z.string().optional(),
  sectionId: z.string().optional(),
  fieldKey: z.string().optional(),
  createdAt: z.string().min(1),
});

export const schoolTemplateProjectSectionContentSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  fields: z.record(z.string(), schoolTemplateProjectFieldValueSchema),
  repeatable: z
    .object({
      items: z.array(
        z.record(z.string(), schoolTemplateProjectFieldValueSchema),
      ),
    })
    .optional(),
});

export const schoolTemplateProjectContentSchema = z.object({
  version: z.literal(1),
  templateSlug: z.string().min(1),
  templateName: z.string().min(1),
  generatedAt: z.string().min(1),
  theme: z.object({
    primaryColor: z.string().min(1),
    secondaryColor: z.string().min(1),
    fontFamily: z.string().min(1),
  }),
  assets: z.array(schoolTemplateProjectAssetSchema),
  sharedSections: z.array(schoolTemplateProjectSectionContentSchema),
  pages: z.array(
    z.object({
      slug: z.string().min(1),
      fileName: z.string().min(1),
      title: z.string().min(1),
      isHome: z.boolean(),
      sections: z.array(schoolTemplateProjectSectionContentSchema),
    }),
  ),
});

export function parseSchoolTemplateProjectContent(value: unknown) {
  return schoolTemplateProjectContentSchema.safeParse(value);
}

export function isSchoolTemplateProjectContent(
  value: unknown,
): value is SchoolTemplateProjectContent {
  return schoolTemplateProjectContentSchema.safeParse(value).success;
}

export function isSchoolTemplateSourceSnapshot(
  value: unknown,
): value is SchoolTemplateSourceSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const snapshot = value as Partial<SchoolTemplateSourceSnapshot>;

  return (
    snapshot.version === 1 &&
    typeof snapshot.templateSlug === "string" &&
    typeof snapshot.sourceDir === "string" &&
    typeof snapshot.entryFile === "string" &&
    typeof snapshot.previewPath === "string" &&
    Array.isArray(snapshot.sharedSections) &&
    Array.isArray(snapshot.pages)
  );
}

const SAFE_RICH_TEXT_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "h2",
  "h3",
  "h4",
];

const DANGEROUS_TEXT_PATTERN =
  /<\s*\/?\s*script\b|<\s*\/?\s*(iframe|object|embed|link|meta|base|form|input|button|textarea|select|option)\b|on[a-z]+\s*=|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html/i;

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
]);
const ALLOWED_MODEL_EXTENSIONS = new Set([".glb", ".gltf"]);
const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);
const SECTION_LEVEL_REPEATABLE_KEYS = new Set([
  "body",
  "ctaHref",
  "ctaText",
  "eyebrow",
  "intro",
  "title",
]);

function sanitizePlainText(value: string) {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });
}

function sanitizeRichText(value: string) {
  return sanitizeHtml(value, {
    allowedTags: SAFE_RICH_TEXT_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: {
          href: attribs.href ?? "",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
    disallowedTagsMode: "discard",
  });
}

function getFileExtension(value: string) {
  try {
    const url = new URL(value, "https://example.com");
    const pathname = url.pathname.toLowerCase();
    const extension = pathname.match(/\.[a-z0-9]+$/i)?.[0];
    return extension ?? "";
  } catch {
    const extension = value
      .toLowerCase()
      .split("?")[0]
      ?.match(/\.[a-z0-9]+$/i)?.[0];
    return extension ?? "";
  }
}

function parseAttributes(rawAttributes: string) {
  const attrs: TemplateElementNode["attrs"] = [];
  const pattern =
    /([^\s"'=<>`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(rawAttributes))) {
    attrs.push({
      name: match[1],
      value: match[2] ?? match[3] ?? match[4] ?? null,
    });
  }

  return attrs;
}

function parseTemplateHtml(html: string) {
  const root: TemplateElementNode = {
    type: "element",
    tagName: "root",
    attrs: [],
    children: [],
    parent: null,
  };
  const stack: TemplateElementNode[] = [root];
  const tokenPattern =
    /<!--[\s\S]*?-->|<!doctype[\s\S]*?>|<!\[CDATA\[[\s\S]*?\]\]>|<\/?[a-zA-Z][^>]*>|[^<]+|</gi;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(html))) {
    const token = match[0];
    const parent = stack[stack.length - 1];

    if (/^<!--|^<!doctype|^<!\[CDATA\[/i.test(token)) {
      parent.children.push({ type: "raw", content: token, parent });
      continue;
    }

    if (/^<\//.test(token)) {
      const closingTag = token
        .match(/^<\/\s*([a-zA-Z][\w:-]*)/)?.[1]
        ?.toLowerCase();

      while (closingTag && stack.length > 1) {
        const current = stack.pop();
        if (current?.tagName === closingTag) break;
      }
      continue;
    }

    if (/^<[a-zA-Z]/.test(token)) {
      const openingTag = token.match(
        /^<\s*([a-zA-Z][\w:-]*)([\s\S]*?)\/?\s*>$/,
      );
      if (!openingTag) continue;

      const tagName = openingTag[1].toLowerCase();
      const element: TemplateElementNode = {
        type: "element",
        tagName,
        attrs: parseAttributes(openingTag[2] ?? ""),
        children: [],
        parent,
      };
      parent.children.push(element);

      if (!/\/\s*>$/.test(token) && !VOID_TAGS.has(tagName)) {
        stack.push(element);
      }
      continue;
    }

    parent.children.push({ type: "text", content: token, parent });
  }

  return root;
}

function serializeTemplateNode(node: TemplateNode): string {
  if (node.type === "text" || node.type === "raw") return node.content;

  if (node.tagName === "root") {
    return node.children.map(serializeTemplateNode).join("");
  }

  const attrs = node.attrs
    .map((attr) =>
      attr.value === null
        ? attr.name
        : `${attr.name}="${attr.value.replace(/"/g, "&quot;")}"`,
    )
    .join(" ");
  const openingTag = attrs ? `<${node.tagName} ${attrs}>` : `<${node.tagName}>`;

  if (VOID_TAGS.has(node.tagName)) return openingTag;

  return `${openingTag}${node.children.map(serializeTemplateNode).join("")}</${node.tagName}>`;
}

function getAttr(node: TemplateElementNode, name: string) {
  if (!Array.isArray(node.attrs)) return undefined;

  return node.attrs.find(
    (attr) => attr.name.toLowerCase() === name.toLowerCase(),
  )?.value;
}

function getTextContent(node: TemplateElementNode): string {
  return node.children
    .map((child) => {
      if (child.type === "text") return child.content;
      if (child.type === "raw") return "";
      if (child.tagName === "br") return "\n";
      return getTextContent(child);
    })
    .join("");
}

function normalizeExtractedText(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&mdash;/g, "-")
    .replace(/&ndash;/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSelectorGroups(selector: string) {
  const groups: string[] = [];
  let current = "";
  let bracketDepth = 0;
  let parenDepth = 0;
  let quote: string | null = null;

  for (const char of selector) {
    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === "[") bracketDepth += 1;
    if (char === "]") bracketDepth -= 1;
    if (char === "(") parenDepth += 1;
    if (char === ")") parenDepth -= 1;

    if (char === "," && bracketDepth === 0 && parenDepth === 0) {
      if (current.trim()) groups.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) groups.push(current.trim());
  return groups;
}

function parseSelector(selector: string): SelectorStep[] {
  const steps: SelectorStep[] = [];
  let current = "";
  let combinator: SelectorStep["combinator"] = "descendant";
  let bracketDepth = 0;
  let parenDepth = 0;
  let quote: string | null = null;

  function pushCurrent() {
    if (!current.trim()) return;
    steps.push({ raw: current.trim(), combinator });
    current = "";
    combinator = "descendant";
  }

  for (const char of selector.trim()) {
    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }

    if (char === "[") bracketDepth += 1;
    if (char === "]") bracketDepth -= 1;
    if (char === "(") parenDepth += 1;
    if (char === ")") parenDepth -= 1;

    if (
      bracketDepth === 0 &&
      parenDepth === 0 &&
      (char === " " || char === ">")
    ) {
      pushCurrent();
      if (char === ">") combinator = "child";
      continue;
    }

    current += char;
  }

  pushCurrent();
  return steps;
}

function parseCompoundSelector(rawSelector: string): ParsedSelector {
  let raw = rawSelector.trim();
  const selector: ParsedSelector = {
    classes: [],
    notClasses: [],
    attrs: [],
  };

  raw = raw.replace(/:not\(\.([a-zA-Z0-9_-]+)\)/g, (_match, className) => {
    selector.notClasses.push(className);
    return "";
  });

  raw = raw.replace(/:nth-of-type\((\d+)\)/g, (_match, value) => {
    selector.nthOfType = Number(value);
    return "";
  });

  raw = raw.replace(
    /\[([^\]=^]+)(\^=|=)?(?:"([^"]*)"|'([^']*)'|([^\]]*))?\]/g,
    (_match, name, operator, quotedDouble, quotedSingle, unquoted) => {
      selector.attrs.push({
        name: String(name).trim(),
        ...(operator ? { operator } : {}),
        ...(operator
          ? {
              value:
                quotedDouble ?? quotedSingle ?? String(unquoted ?? "").trim(),
            }
          : {}),
      });
      return "";
    },
  );

  const idMatch = raw.match(/#([a-zA-Z0-9_-]+)/);
  if (idMatch) selector.id = idMatch[1];

  selector.classes = Array.from(raw.matchAll(/\.([a-zA-Z0-9_-]+)/g)).map(
    (match) => match[1],
  );

  const tagMatch = raw
    .replace(/#[a-zA-Z0-9_-]+/g, "")
    .replace(/\.[a-zA-Z0-9_-]+/g, "")
    .trim()
    .match(/^[a-zA-Z][\w-]*/);
  if (tagMatch) selector.tagName = tagMatch[0].toLowerCase();

  return selector;
}

function getNthOfType(node: TemplateElementNode) {
  if (!node.parent) return 1;

  return (
    node.parent.children
      .filter(
        (child): child is TemplateElementNode =>
          child.type === "element" && child.tagName === node.tagName,
      )
      .indexOf(node) + 1
  );
}

function matchesCompound(node: TemplateElementNode, rawSelector: string) {
  const selector = parseCompoundSelector(rawSelector);
  const classList = (getAttr(node, "class") ?? "").split(/\s+/).filter(Boolean);

  if (selector.tagName && selector.tagName !== node.tagName) return false;
  if (selector.id && getAttr(node, "id") !== selector.id) return false;
  if (!selector.classes.every((className) => classList.includes(className))) {
    return false;
  }
  if (selector.notClasses.some((className) => classList.includes(className))) {
    return false;
  }
  if (selector.nthOfType && getNthOfType(node) !== selector.nthOfType) {
    return false;
  }

  return selector.attrs.every((attrSelector) => {
    const attrValue = getAttr(node, attrSelector.name);
    if (attrValue === undefined || attrValue === null) return false;
    if (!attrSelector.operator) return true;
    return attrSelector.operator === "="
      ? attrValue === attrSelector.value
      : attrValue.startsWith(attrSelector.value ?? "");
  });
}

function matchesSelectorGroup(node: TemplateElementNode, selector: string) {
  const steps = parseSelector(selector);
  if (!steps.length || !matchesCompound(node, steps[steps.length - 1].raw)) {
    return false;
  }

  let current: TemplateElementNode | null = node;
  for (let index = steps.length - 2; index >= 0; index -= 1) {
    const step = steps[index + 1];
    const expected = steps[index];
    if (step.combinator === "child") {
      current = current?.parent ?? null;
      if (!current || !matchesCompound(current, expected.raw)) return false;
      continue;
    }

    let ancestor: TemplateElementNode | null = current?.parent ?? null;
    while (ancestor && !matchesCompound(ancestor, expected.raw)) {
      ancestor = ancestor.parent;
    }
    if (!ancestor) return false;
    current = ancestor;
  }

  return true;
}

function matchesSelector(node: TemplateElementNode, selector: string) {
  return splitSelectorGroups(selector).some((group) =>
    matchesSelectorGroup(node, group),
  );
}

function queryAll(
  root: TemplateElementNode,
  selector: string,
  includeRoot = true,
) {
  const matches: TemplateElementNode[] = [];

  function visit(node: TemplateElementNode) {
    if ((node !== root || includeRoot) && matchesSelector(node, selector)) {
      matches.push(node);
    }

    for (const child of node.children) {
      if (child.type === "element") visit(child);
    }
  }

  visit(root);
  return matches;
}

function extractBackgroundImageUrl(value: string | null | undefined) {
  if (!value) return "";
  return (
    value.match(/background(?:-image)?\s*:\s*url\((["']?)(.*?)\1\)/i)?.[2] ??
    value.match(/url\((["']?)(.*?)\1\)/i)?.[2] ??
    ""
  ).trim();
}

function getFieldValueFromNode(
  node: TemplateElementNode,
  field: SchoolTemplateField,
) {
  const target = field.target ?? "textContent";

  if (target === "attribute") {
    return (
      getAttr(
        node,
        field.attribute ?? (field.type === "link" ? "href" : "src"),
      ) ?? ""
    );
  }

  if (target === "backgroundImage") {
    return extractBackgroundImageUrl(getAttr(node, "style"));
  }

  if (target === "innerHTML") {
    return node.children.map(serializeTemplateNode).join("").trim();
  }

  if (target === "textContent") {
    return normalizeExtractedText(getTextContent(node));
  }

  return field.defaultValue ?? getDefaultFieldValue(field);
}

function getSectionRoots(
  pageRoot: TemplateElementNode | null,
  section: SchoolTemplateSection,
) {
  if (!pageRoot) return [];
  const roots = queryAll(pageRoot, section.selector);
  return roots.length ? roots : [pageRoot];
}

function getFieldDefaultFromRoots(
  roots: TemplateElementNode[],
  field: SchoolTemplateField,
) {
  for (const root of roots) {
    const nodes = queryAll(root, field.selector);
    for (const node of nodes) {
      const value = getFieldValueFromNode(node, field);
      if (value !== "") return value;
    }
  }

  return getDefaultFieldValue(field);
}

function sectionTargetsRepeatableItems(section: SchoolTemplateSection) {
  const sectionSelector = section.selector.trim();
  const itemSelector = section.repeatable?.itemSelector.trim();
  if (!itemSelector) return false;

  return sectionSelector
    .split(",")
    .map((selector) => selector.trim())
    .includes(itemSelector);
}

function isRepeatableItemField(
  section: SchoolTemplateSection,
  field: SchoolTemplateField,
) {
  if (!section.repeatable) return false;
  if (sectionTargetsRepeatableItems(section)) return true;
  return !SECTION_LEVEL_REPEATABLE_KEYS.has(field.key);
}

function buildRepeatableItems(
  roots: TemplateElementNode[],
  section: SchoolTemplateSection,
) {
  if (!section.repeatable) return undefined;

  const items: Array<Record<string, SchoolTemplateProjectFieldValue>> = [];
  for (const root of roots) {
    for (const itemRoot of queryAll(root, section.repeatable.itemSelector)) {
      const item: Record<string, SchoolTemplateProjectFieldValue> = {};
      for (const field of section.fields) {
        if (!queryAll(itemRoot, field.selector).length) continue;
        item[field.key] = getFieldDefaultFromRoots([itemRoot], field);
      }
      items.push(item);
    }
  }

  return { items };
}

function getRepeatableItemFieldKeys(
  roots: TemplateElementNode[],
  section: SchoolTemplateSection,
) {
  const keys = new Set<string>();
  if (!section.repeatable) return keys;

  for (const root of roots) {
    for (const itemRoot of queryAll(root, section.repeatable.itemSelector)) {
      for (const field of section.fields) {
        if (queryAll(itemRoot, field.selector).length) {
          keys.add(field.key);
        }
      }
    }
  }

  return keys;
}

function readTemplatePageRoot(
  manifest: SchoolTemplateManifest,
  page: SchoolTemplatePage,
) {
  try {
    const publicRoot = path.resolve(process.cwd(), "public");
    const sourcePath = path.resolve(
      process.cwd(),
      manifest.sourceDir,
      page.fileName,
    );
    if (!sourcePath.startsWith(`${publicRoot}${path.sep}`)) return null;
    return parseTemplateHtml(readFileSync(sourcePath, "utf8"));
  } catch {
    return null;
  }
}

function isRelativeOrAllowedUrl(value: string) {
  return (
    value.startsWith("/") ||
    value.startsWith("./") ||
    value.startsWith("../") ||
    value.startsWith("#") ||
    /^[a-z0-9][a-z0-9/_-]*(\.[a-z0-9]+)?$/i.test(value) ||
    /^https?:\/\//i.test(value) ||
    /^mailto:/i.test(value) ||
    /^tel:/i.test(value)
  );
}

function validateLinkValue(value: string) {
  if (!value || isRelativeOrAllowedUrl(value)) {
    return null;
  }

  return "Links must be relative URLs, http(s), mailto, tel, or anchors.";
}

function validateAssetValue(
  value: string,
  field: SchoolTemplateProjectFieldSnapshot,
) {
  if (!value) {
    return null;
  }

  if (!isRelativeOrAllowedUrl(value)) {
    return `${field.label} must use a relative path, Cloudinary public ID, or http(s) URL.`;
  }

  const extension = getFileExtension(value);
  if (!extension && !value.includes("/")) {
    return null;
  }

  if (
    field.type === "image" &&
    extension &&
    !ALLOWED_IMAGE_EXTENSIONS.has(extension)
  ) {
    return `${field.label} must be an image file (${Array.from(ALLOWED_IMAGE_EXTENSIONS).join(", ")}).`;
  }

  if (
    field.type === "model3d" &&
    extension &&
    !ALLOWED_MODEL_EXTENSIONS.has(extension)
  ) {
    return `${field.label} must be a .glb or .gltf file.`;
  }

  return null;
}

function getFieldSnapshotMap(
  sourceSnapshot: SchoolTemplateSourceSnapshot,
  pageSlug?: string,
) {
  const fields = new Map<string, SchoolTemplateProjectFieldSnapshot>();
  const sections = pageSlug
    ? sourceSnapshot.pages.find((page) => page.slug === pageSlug)?.sections
    : sourceSnapshot.sharedSections;

  for (const section of sections ?? []) {
    for (const field of section.fields) {
      fields.set(`${section.id}:${field.key}`, field);
    }
  }

  return fields;
}

function sanitizeSectionContent(
  section: SchoolTemplateProjectSectionContent,
  fieldMap: Map<string, SchoolTemplateProjectFieldSnapshot>,
) {
  return {
    ...section,
    fields: Object.fromEntries(
      Object.entries(section.fields).map(([key, value]) => {
        if (typeof value !== "string") {
          return [key, value];
        }

        const field = fieldMap.get(`${section.id}:${key}`);
        const sanitized =
          field?.type === "richText" || field?.target === "innerHTML"
            ? sanitizeRichText(value)
            : sanitizePlainText(value);

        return [key, sanitized];
      }),
    ),
    repeatable: section.repeatable
      ? {
          items: section.repeatable.items.map((item) =>
            Object.fromEntries(
              Object.entries(item).map(([key, value]) => [
                key,
                typeof value === "string" ? sanitizePlainText(value) : value,
              ]),
            ),
          ),
        }
      : undefined,
  };
}

export function sanitizeSchoolTemplateProjectContent(
  content: SchoolTemplateProjectContent,
  sourceSnapshot: SchoolTemplateSourceSnapshot,
): SchoolTemplateProjectContent {
  const sharedFieldMap = getFieldSnapshotMap(sourceSnapshot);

  return {
    ...content,
    templateSlug: sanitizePlainText(content.templateSlug),
    templateName: sanitizePlainText(content.templateName),
    theme: {
      primaryColor: sanitizePlainText(content.theme.primaryColor),
      secondaryColor: sanitizePlainText(content.theme.secondaryColor),
      fontFamily: sanitizePlainText(content.theme.fontFamily),
    },
    assets: content.assets.map((asset) => ({
      ...asset,
      source: sanitizePlainText(asset.source),
      originalSource: asset.originalSource
        ? sanitizePlainText(asset.originalSource)
        : undefined,
      label: asset.label ? sanitizePlainText(asset.label) : undefined,
    })),
    sharedSections: content.sharedSections.map((section) =>
      sanitizeSectionContent(section, sharedFieldMap),
    ),
    pages: content.pages.map((page) => {
      const pageFieldMap = getFieldSnapshotMap(sourceSnapshot, page.slug);

      return {
        ...page,
        slug: sanitizePlainText(page.slug),
        fileName: sanitizePlainText(page.fileName),
        title: sanitizePlainText(page.title),
        sections: page.sections.map((section) =>
          sanitizeSectionContent(section, pageFieldMap),
        ),
      };
    }),
  };
}

function validateSectionContent(
  section: SchoolTemplateProjectSectionContent,
  fieldMap: Map<string, SchoolTemplateProjectFieldSnapshot>,
  location: string,
) {
  const issues: string[] = [];

  for (const [key, value] of Object.entries(section.fields)) {
    if (typeof value !== "string") {
      continue;
    }

    const field = fieldMap.get(`${section.id}:${key}`);
    const label = field?.label ?? key;

    if (DANGEROUS_TEXT_PATTERN.test(value)) {
      issues.push(`${location} ${label} contains blocked script-like content.`);
      continue;
    }

    if (!field) {
      continue;
    }

    if (field.type === "link") {
      const issue = validateLinkValue(value);
      if (issue) issues.push(`${location} ${label}: ${issue}`);
    }

    if (field.type === "image" || field.type === "model3d") {
      const issue = validateAssetValue(value, field);
      if (issue) issues.push(`${location} ${issue}`);
    }
  }

  for (const item of section.repeatable?.items ?? []) {
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === "string" && DANGEROUS_TEXT_PATTERN.test(value)) {
        issues.push(
          `${location} repeatable item "${key}" contains blocked script-like content.`,
        );
      }
    }
  }

  return issues;
}

export function validateSchoolTemplateProjectContentReferences(
  content: SchoolTemplateProjectContent,
  sourceSnapshot: SchoolTemplateSourceSnapshot,
) {
  const issues: string[] = [];
  const sharedFieldMap = getFieldSnapshotMap(sourceSnapshot);

  for (const section of content.sharedSections) {
    issues.push(
      ...validateSectionContent(
        section,
        sharedFieldMap,
        `Shared section "${section.label}"`,
      ),
    );
  }

  for (const page of content.pages) {
    const pageFieldMap = getFieldSnapshotMap(sourceSnapshot, page.slug);

    for (const section of page.sections) {
      issues.push(
        ...validateSectionContent(
          section,
          pageFieldMap,
          `Page "${page.title}" section "${section.label}"`,
        ),
      );
    }
  }

  return issues;
}

function getDefaultTheme(templateSlug: string): SchoolTemplateProjectTheme {
  switch (templateSlug) {
    case "dexta-academy-4":
      return {
        primaryColor: "#4a8fff",
        secondaryColor: "#6aaeff",
        fontFamily: "Manrope",
      };
    case "dexta-academy-3":
      return {
        primaryColor: "#061a40",
        secondaryColor: "#f5b82e",
        fontFamily: "Sora",
      };
    case "dexta-academy-2":
      return {
        primaryColor: "#081827",
        secondaryColor: "#facc15",
        fontFamily: "Plus Jakarta Sans",
      };
    case "dexta-academy-1":
      return {
        primaryColor: "#0f766e",
        secondaryColor: "#f97316",
        fontFamily: "Manrope",
      };
    default:
      return {
        primaryColor: "#0f766e",
        secondaryColor: "#facc15",
        fontFamily: "Inter",
      };
  }
}

function getDefaultFieldValue(field: SchoolTemplateField) {
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  switch (field.type) {
    case "number":
      return null;
    case "color":
      return "#000000";
    case "image":
    case "link":
    case "model3d":
    case "richText":
    case "textarea":
    case "text":
      return "";
    default:
      return null;
  }
}

function buildSectionContent(
  section: SchoolTemplateSection,
  pageRoot: TemplateElementNode | null = null,
): SchoolTemplateProjectSectionContent {
  const roots = getSectionRoots(pageRoot, section);
  const repeatableItemFieldKeys = getRepeatableItemFieldKeys(roots, section);

  return {
    id: section.id,
    label: section.label,
    fields: Object.fromEntries(
      section.fields.map((field) => [
        field.key,
        isRepeatableItemField(section, field) ||
        repeatableItemFieldKeys.has(field.key)
          ? getDefaultFieldValue(field)
          : getFieldDefaultFromRoots(roots, field),
      ]),
    ),
    ...(section.repeatable
      ? { repeatable: buildRepeatableItems(roots, section) ?? { items: [] } }
      : {}),
  };
}

function buildFieldSnapshot(
  field: SchoolTemplateField,
): SchoolTemplateProjectFieldSnapshot {
  return {
    key: field.key,
    label: field.label,
    type: field.type,
    selector: field.selector,
    target: field.target ?? "textContent",
    ...(field.defaultValue !== undefined
      ? { defaultValue: field.defaultValue }
      : {}),
    ...(field.attribute ? { attribute: field.attribute } : {}),
    ...(field.configPath ? { configPath: field.configPath } : {}),
    ...(field.cssVariable ? { cssVariable: field.cssVariable } : {}),
    ...(field.scope ? { scope: field.scope } : {}),
    ...(field.unit ? { unit: field.unit } : {}),
    ...(field.acceptedFileTypes
      ? { acceptedFileTypes: field.acceptedFileTypes }
      : {}),
    ...(field.placeholder ? { placeholder: field.placeholder } : {}),
    ...(field.helpText ? { helpText: field.helpText } : {}),
    ...(field.uiGroup ? { uiGroup: field.uiGroup } : {}),
    ...(field.uiOrder !== undefined ? { uiOrder: field.uiOrder } : {}),
    ...(field.min !== undefined ? { min: field.min } : {}),
    ...(field.max !== undefined ? { max: field.max } : {}),
    ...(field.step !== undefined ? { step: field.step } : {}),
  };
}

function buildSectionSnapshot(
  section: SchoolTemplateSection,
): SchoolTemplateProjectSectionSnapshot {
  return {
    id: section.id,
    label: section.label,
    selector: section.selector,
    ...(section.description ? { description: section.description } : {}),
    fields: section.fields.map(buildFieldSnapshot),
    ...(section.repeatable
      ? {
          repeatable: {
            itemSelector: section.repeatable.itemSelector,
            labelSingular: section.repeatable.labelSingular,
            labelPlural: section.repeatable.labelPlural,
            ...(section.repeatable.minItems !== undefined
              ? { minItems: section.repeatable.minItems }
              : {}),
            ...(section.repeatable.maxItems !== undefined
              ? { maxItems: section.repeatable.maxItems }
              : {}),
          },
        }
      : {}),
  };
}

function buildPageContent(
  manifest: SchoolTemplateManifest,
  page: SchoolTemplatePage,
): SchoolTemplateProjectPageContent {
  const pageRoot = readTemplatePageRoot(manifest, page);

  return {
    slug: page.slug,
    fileName: page.fileName,
    title: page.title,
    isHome: Boolean(page.isHome),
    sections: page.sections.map((section) =>
      buildSectionContent(section, pageRoot),
    ),
  };
}

export function buildSchoolTemplateProjectContent(
  manifest: SchoolTemplateManifest,
): SchoolTemplateProjectContent {
  return {
    version: 1,
    templateSlug: manifest.templateSlug,
    templateName: manifest.templateName,
    generatedAt: new Date().toISOString(),
    theme: getDefaultTheme(manifest.templateSlug),
    assets: [],
    sharedSections: manifest.sharedSections.map((section) =>
      buildSectionContent(section),
    ),
    pages: manifest.pages.map((page) => buildPageContent(manifest, page)),
  };
}

export function buildSchoolTemplateSourceSnapshot(
  manifest: SchoolTemplateManifest,
): SchoolTemplateSourceSnapshot {
  return {
    version: 1,
    capturedAt: new Date().toISOString(),
    templateSlug: manifest.templateSlug,
    templateName: manifest.templateName,
    sourceDir: manifest.sourceDir,
    entryFile: manifest.entryFile,
    previewPath: manifest.previewPath,
    assetInventory: manifest.assetInventory,
    sharedSections: manifest.sharedSections.map(buildSectionSnapshot),
    pages: manifest.pages.map((page) => ({
      slug: page.slug,
      fileName: page.fileName,
      title: page.title,
      isHome: Boolean(page.isHome),
      sections: page.sections.map(buildSectionSnapshot),
    })),
  };
}

function mergeSectionContent(
  freshSection: SchoolTemplateProjectSectionContent,
  existingSection?: SchoolTemplateProjectSectionContent,
): SchoolTemplateProjectSectionContent {
  const mergeFieldValue = (
    freshValue: SchoolTemplateProjectFieldValue,
    existingValue: SchoolTemplateProjectFieldValue | undefined,
  ) =>
    existingValue === undefined ||
    existingValue === null ||
    existingValue === ""
      ? freshValue
      : existingValue;

  const freshItems = freshSection.repeatable?.items ?? [];
  const existingItems = existingSection?.repeatable?.items ?? [];
  const itemCount = Math.max(freshItems.length, existingItems.length);

  return {
    ...freshSection,
    fields: {
      ...Object.fromEntries(
        Object.entries(freshSection.fields).map(([key, freshValue]) => [
          key,
          mergeFieldValue(freshValue, existingSection?.fields[key]),
        ]),
      ),
    },
    repeatable: freshSection.repeatable
      ? {
          items: Array.from({ length: itemCount }, (_item, index) => ({
            ...(freshItems[index] ?? {}),
            ...Object.fromEntries(
              Object.entries(existingItems[index] ?? {}).map(([key, value]) => [
                key,
                mergeFieldValue(freshItems[index]?.[key] ?? "", value),
              ]),
            ),
          })),
        }
      : undefined,
  };
}

export function syncSchoolTemplateProjectContentWithManifest({
  content,
  sourceSnapshot,
}: {
  content: SchoolTemplateProjectContent;
  sourceSnapshot: SchoolTemplateSourceSnapshot;
}) {
  const manifest =
    getSchoolTemplateManifest(content.templateSlug) ??
    getSchoolTemplateManifest(sourceSnapshot.templateSlug);

  if (!manifest) {
    return { contentJson: content, sourceSnapshot };
  }

  const freshContent = buildSchoolTemplateProjectContent(manifest);
  const freshSnapshot = buildSchoolTemplateSourceSnapshot(manifest);

  const syncedContent: SchoolTemplateProjectContent = {
    ...freshContent,
    generatedAt: content.generatedAt,
    theme: {
      ...freshContent.theme,
      ...content.theme,
    },
    assets: content.assets,
    sharedSections: freshContent.sharedSections.map((section) =>
      mergeSectionContent(
        section,
        content.sharedSections.find(
          (existingSection) => existingSection.id === section.id,
        ),
      ),
    ),
    pages: freshContent.pages.map((page) => {
      const existingPage = content.pages.find(
        (candidate) => candidate.slug === page.slug,
      );

      return {
        ...page,
        sections: page.sections.map((section) =>
          mergeSectionContent(
            section,
            existingPage?.sections.find(
              (existingSection) => existingSection.id === section.id,
            ),
          ),
        ),
      };
    }),
  };

  return {
    contentJson: syncedContent,
    sourceSnapshot: freshSnapshot,
  };
}

export function resolveSchoolTemplateManifestForSelection(input: {
  templateSlug?: string | null;
  websiteUrl?: string | null;
}) {
  const directManifest = input.templateSlug
    ? getSchoolTemplateManifest(input.templateSlug)
    : null;

  if (directManifest) {
    return directManifest;
  }

  const websiteUrl = input.websiteUrl?.trim();
  if (!websiteUrl) {
    return null;
  }

  const matchingSlug = websiteUrl
    .split(/[/?#]/)
    .find((part) => getSchoolTemplateManifest(part));

  return matchingSlug ? getSchoolTemplateManifest(matchingSlug) : null;
}
