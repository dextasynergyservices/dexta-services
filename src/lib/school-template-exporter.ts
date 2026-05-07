import { Buffer } from "node:buffer";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { resolveSchoolTemplateAsset } from "@/lib/school-template-assets";
import {
  type SchoolTemplateProjectContent,
  type SchoolTemplateProjectFieldValue,
  type SchoolTemplateProjectPageContent,
  type SchoolTemplateProjectSectionContent,
  type SchoolTemplateProjectSectionSnapshot,
  type SchoolTemplateSourceSnapshot,
} from "@/lib/school-template-project-content";
import { createZipArchive } from "@/lib/zip-writer";

type HtmlNode = ElementNode | TextNode | RawNode;

type ElementNode = {
  type: "element";
  tagName: string;
  attrs: Array<{ name: string; value: string | null }>;
  children: HtmlNode[];
  parent: ElementNode | null;
};

type TextNode = {
  type: "text";
  content: string;
  parent: ElementNode | null;
};

type RawNode = {
  type: "raw";
  content: string;
  parent: ElementNode | null;
};

type SelectorStep = {
  raw: string;
  combinator: "descendant" | "child";
};

type ParsedCompoundSelector = {
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
  isRoot?: boolean;
};

type ExportFile = {
  path: string;
  data: Buffer | string;
};

type RenderedPage = {
  page: SchoolTemplateProjectPageContent;
  html: string;
};

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

const TEXT_FILE_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".htm",
  ".js",
  ".json",
  ".map",
  ".svg",
  ".txt",
  ".xml",
]);

const CLOUDINARY_URL_PATTERN =
  /https:\/\/res\.cloudinary\.com\/(?:(?!&quot;|&#34;|&apos;|&#39;)[^\s"'()<>\\])+/gi;
const MAX_BUNDLED_REMOTE_ASSET_BYTES = 2 * 1024 * 1024;
const MAX_BUNDLED_REMOTE_ASSETS_TOTAL_BYTES = 5 * 1024 * 1024;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function escapeScriptJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function decodeUrlHtmlEntities(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&#x2f;|&#47;/gi, "/")
    .replace(/&#x3a;|&#58;/gi, ":");
}

function normalizeRemoteAssetUrl(url: string) {
  const decoded = decodeUrlHtmlEntities(url)
    .trim()
    .replace(/(?:["']|%22|%27)+$/gi, "");

  try {
    return new URL(decoded).toString();
  } catch {
    return decoded;
  }
}

function isFilled(value: SchoolTemplateProjectFieldValue | undefined) {
  return value !== null && value !== undefined && value !== "";
}

function toText(value: SchoolTemplateProjectFieldValue | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function withUnit(value: SchoolTemplateProjectFieldValue, unit?: string) {
  const text = toText(value);
  if (!unit || /[a-z%]+$/i.test(text)) {
    return text;
  }

  return `${text}${unit}`;
}

function getCssVariableValue(
  value: SchoolTemplateProjectFieldValue,
  field: SchoolTemplateProjectSectionSnapshot["fields"][number],
) {
  if (field.type === "image" || field.type === "model3d") {
    const asset = resolveAsset(value, field).replace(/"/g, "&quot;");
    return asset ? `url("${asset}")` : "";
  }

  return withUnit(value, field.unit);
}

function normalizeZipPath(filePath: string) {
  return filePath.replace(/\\/g, "/").replace(/^\/+/, "");
}

function getPublicRoot() {
  return path.resolve(process.cwd(), "public");
}

function assertSafeTemplatePath(sourceDir: string, fileName = "") {
  const publicRoot = getPublicRoot();
  const resolvedPath = path.resolve(process.cwd(), sourceDir, fileName);

  if (
    resolvedPath !== publicRoot &&
    !resolvedPath.startsWith(`${publicRoot}${path.sep}`)
  ) {
    throw new Error("Template source path must stay inside the public folder.");
  }

  return resolvedPath;
}

function slugifyFileName(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "school-website"
  );
}

function parseAttributes(rawAttributes: string) {
  const attrs: ElementNode["attrs"] = [];
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

function parseOpeningTag(token: string) {
  const match = token.match(/^<\s*([a-zA-Z][\w:-]*)([\s\S]*?)\/?\s*>$/);
  if (!match) {
    return null;
  }

  return {
    tagName: match[1].toLowerCase(),
    attrs: parseAttributes(match[2] ?? ""),
    selfClosing: /\/\s*>$/.test(token),
  };
}

function parseHtml(html: string) {
  const root: ElementNode = {
    type: "element",
    tagName: "root",
    attrs: [],
    children: [],
    parent: null,
  };
  const stack: ElementNode[] = [root];
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
      if (!closingTag) {
        parent.children.push({ type: "raw", content: token, parent });
        continue;
      }

      while (stack.length > 1) {
        const current = stack.pop();
        if (current?.tagName === closingTag) {
          break;
        }
      }
      continue;
    }

    if (/^<[a-zA-Z]/.test(token)) {
      const openingTag = parseOpeningTag(token);
      if (!openingTag) {
        parent.children.push({ type: "raw", content: token, parent });
        continue;
      }

      const element: ElementNode = {
        type: "element",
        tagName: openingTag.tagName,
        attrs: openingTag.attrs,
        children: [],
        parent,
      };
      parent.children.push(element);

      if (!openingTag.selfClosing && !VOID_TAGS.has(openingTag.tagName)) {
        stack.push(element);
      }
      continue;
    }

    parent.children.push({ type: "text", content: token, parent });
  }

  return root;
}

function serializeNode(node: HtmlNode): string {
  if (node.type === "text" || node.type === "raw") {
    return node.content;
  }

  if (node.tagName === "root") {
    return node.children.map(serializeNode).join("");
  }

  const attrs = node.attrs
    .map((attr) =>
      attr.value === null
        ? attr.name
        : `${attr.name}="${escapeAttribute(attr.value)}"`,
    )
    .join(" ");
  const openingTag = attrs ? `<${node.tagName} ${attrs}>` : `<${node.tagName}>`;

  if (VOID_TAGS.has(node.tagName)) {
    return openingTag;
  }

  return `${openingTag}${node.children.map(serializeNode).join("")}</${node.tagName}>`;
}

function getAttr(node: ElementNode, name: string) {
  return node.attrs.find(
    (attr) => attr.name.toLowerCase() === name.toLowerCase(),
  )?.value;
}

function setAttr(node: ElementNode, name: string, value: string) {
  const attr = node.attrs.find(
    (item) => item.name.toLowerCase() === name.toLowerCase(),
  );

  if (attr) {
    attr.value = value;
    return;
  }

  node.attrs.push({ name, value });
}

function removeNodes(
  root: ElementNode,
  predicate: (node: ElementNode) => boolean,
) {
  root.children = root.children.filter((child) => {
    if (child.type !== "element") {
      return true;
    }

    removeNodes(child, predicate);
    return !predicate(child);
  });
}

function setStyleDeclaration(
  node: ElementNode,
  property: string,
  value: string,
) {
  const currentStyle = getAttr(node, "style") ?? "";
  const declarations = currentStyle
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter(
      (item) =>
        item.split(":")[0]?.trim().toLowerCase() !== property.toLowerCase(),
    );
  declarations.push(`${property}: ${value}`);
  setAttr(node, "style", `${declarations.join("; ")};`);
}

function setTextContent(node: ElementNode, value: string) {
  node.children = [{ type: "text", content: escapeHtml(value), parent: node }];
}

function setInnerHtml(node: ElementNode, value: string) {
  const fragment = parseHtml(value);
  node.children = fragment.children;
  node.children.forEach((child) => {
    child.parent = node;
  });
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

function parseCompoundSelector(rawSelector: string): ParsedCompoundSelector {
  let raw = rawSelector.trim();
  const compound: ParsedCompoundSelector = {
    classes: [],
    notClasses: [],
    attrs: [],
  };

  if (raw === ":root") {
    return { ...compound, isRoot: true };
  }

  const notMatches = Array.from(raw.matchAll(/:not\(([^)]+)\)/g));
  for (const match of notMatches) {
    const notClass = match[1].match(/\.([\w-]+)/)?.[1];
    if (notClass) compound.notClasses.push(notClass);
  }
  raw = raw.replace(/:not\([^)]+\)/g, "");

  const nthMatch = raw.match(/:nth-of-type\((\d+)\)/);
  if (nthMatch) {
    compound.nthOfType = Number(nthMatch[1]);
    raw = raw.replace(/:nth-of-type\(\d+\)/g, "");
  }

  const attrMatches = Array.from(
    raw.matchAll(
      /\[([^\]=~|^$*\s]+)\s*(\^=|=)?\s*(?:"([^"]*)"|'([^']*)'|([^\]]*))?\]/g,
    ),
  );
  for (const match of attrMatches) {
    compound.attrs.push({
      name: match[1],
      operator: match[2] as "=" | "^=" | undefined,
      value: (match[3] ?? match[4] ?? match[5] ?? "").trim(),
    });
  }
  raw = raw.replace(/\[[^\]]+\]/g, "");

  const idMatch = raw.match(/#([\w-]+)/);
  if (idMatch) compound.id = idMatch[1];

  compound.classes = Array.from(raw.matchAll(/\.([\w-]+)/g)).map(
    (match) => match[1],
  );

  const tagMatch = raw.match(/^([a-zA-Z][\w:-]*|\*)/);
  if (tagMatch && tagMatch[1] !== "*") {
    compound.tagName = tagMatch[1].toLowerCase();
  }

  return compound;
}

function getClassList(node: ElementNode) {
  return (getAttr(node, "class") ?? "").split(/\s+/).filter(Boolean);
}

function getNthOfType(node: ElementNode) {
  if (!node.parent) {
    return 1;
  }

  return node.parent.children.filter(
    (child) =>
      child.type === "element" &&
      child.tagName === node.tagName &&
      node.parent &&
      node.parent.children.indexOf(child) <= node.parent.children.indexOf(node),
  ).length;
}

function matchesCompound(node: ElementNode, rawSelector: string) {
  const selector = parseCompoundSelector(rawSelector);
  const classList = getClassList(node);

  if (selector.isRoot) {
    return node.tagName === "html" || node.tagName === "root";
  }

  if (selector.tagName && node.tagName !== selector.tagName) {
    return false;
  }

  if (selector.id && getAttr(node, "id") !== selector.id) {
    return false;
  }

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
    if (attrValue === undefined) return false;
    if (!attrSelector.operator) return true;
    const comparableValue = attrValue ?? "";
    if (attrSelector.operator === "=")
      return comparableValue === attrSelector.value;
    return comparableValue.startsWith(attrSelector.value ?? "");
  });
}

function matchesSelectorGroup(node: ElementNode, selector: string) {
  const steps = parseSelector(selector);
  if (!steps.length || !matchesCompound(node, steps[steps.length - 1].raw)) {
    return false;
  }

  let cursor: ElementNode | null = node;

  for (let index = steps.length - 2; index >= 0; index -= 1) {
    const nextStep = steps[index + 1];
    const step = steps[index];

    if (nextStep.combinator === "child") {
      cursor = cursor.parent;
      if (!cursor || !matchesCompound(cursor, step.raw)) {
        return false;
      }
      continue;
    }

    cursor = cursor.parent;
    while (cursor && !matchesCompound(cursor, step.raw)) {
      cursor = cursor.parent;
    }

    if (!cursor) {
      return false;
    }
  }

  return true;
}

function matchesSelector(node: ElementNode, selector: string) {
  return splitSelectorGroups(selector).some((group) =>
    matchesSelectorGroup(node, group),
  );
}

function queryAll(root: ElementNode, selector: string, includeRoot = true) {
  const matches: ElementNode[] = [];

  function visit(node: ElementNode) {
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

function resolveAsset(
  value: SchoolTemplateProjectFieldValue,
  field: SchoolTemplateProjectSectionSnapshot["fields"][number],
) {
  return resolveSchoolTemplateAsset(value, field, {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
  });
}

function setDeep(
  target: Record<string, unknown>,
  pathName: string,
  value: unknown,
) {
  const parts = pathName.split(".");
  let cursor = target;

  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      cursor[part] = value;
      return;
    }

    if (!cursor[part] || typeof cursor[part] !== "object") {
      cursor[part] = {};
    }

    cursor = cursor[part] as Record<string, unknown>;
  });
}

function applySection(
  root: ElementNode,
  sectionContent: SchoolTemplateProjectSectionContent,
  sectionSnapshot: SchoolTemplateProjectSectionSnapshot | undefined,
  threeConfig: Record<string, unknown>,
) {
  if (!sectionSnapshot) {
    return;
  }

  const sectionRoots = queryAll(root, sectionSnapshot.selector);
  const roots = sectionRoots.length ? sectionRoots : [root];

  for (const field of sectionSnapshot.fields) {
    const value = sectionContent.fields[field.key];
    if (!isFilled(value)) {
      continue;
    }

    if (field.target === "threeConfig") {
      if (field.configPath) {
        setDeep(
          threeConfig,
          field.configPath,
          field.type === "model3d" ? resolveAsset(value, field) : value,
        );
      }
      continue;
    }

    for (const sectionRoot of roots) {
      for (const node of queryAll(sectionRoot, field.selector)) {
        if (field.target === "innerHTML") {
          setInnerHtml(node, toText(value));
        } else if (field.target === "attribute") {
          const attribute =
            field.attribute ?? (field.type === "link" ? "href" : "src");
          setAttr(node, attribute, resolveAsset(value, field));
        } else if (field.target === "backgroundImage") {
          setStyleDeclaration(
            node,
            "background-image",
            `url("${resolveAsset(value, field).replace(/"/g, "&quot;")}")`,
          );
        } else if (field.target === "cssVariable" && field.cssVariable) {
          setStyleDeclaration(
            node,
            field.cssVariable,
            getCssVariableValue(value, field),
          );
          if (field.cssVariable === "--cap-center-x") {
            setStyleDeclaration(node, "left", withUnit(value, field.unit));
          }
          if (field.cssVariable === "--cap-center-y") {
            setStyleDeclaration(node, "top", withUnit(value, field.unit));
          }
        } else {
          setTextContent(node, toText(value));
        }
      }
    }
  }

  if (!sectionContent.repeatable || !sectionSnapshot.repeatable) {
    return;
  }

  for (const sectionRoot of roots) {
    const itemRoots = queryAll(
      sectionRoot,
      sectionSnapshot.repeatable.itemSelector,
    );

    itemRoots.forEach((itemRoot, itemIndex) => {
      const itemContent = sectionContent.repeatable?.items[itemIndex];
      if (!itemContent) {
        return;
      }

      for (const field of sectionSnapshot.fields) {
        const value = itemContent[field.key];
        if (!isFilled(value)) {
          continue;
        }

        for (const node of queryAll(itemRoot, field.selector)) {
          if (field.target === "innerHTML") {
            setInnerHtml(node, toText(value));
          } else if (field.target === "attribute") {
            const attribute =
              field.attribute ?? (field.type === "link" ? "href" : "src");
            setAttr(node, attribute, resolveAsset(value, field));
          } else if (field.target === "backgroundImage") {
            setStyleDeclaration(
              node,
              "background-image",
              `url("${resolveAsset(value, field).replace(/"/g, "&quot;")}")`,
            );
          } else if (field.target === "cssVariable" && field.cssVariable) {
            setStyleDeclaration(
              node,
              field.cssVariable,
              getCssVariableValue(value, field),
            );
          } else {
            setTextContent(node, toText(value));
          }
        }
      }
    });
  }
}

function injectIntoHead(root: ElementNode, markup: string) {
  const head = queryAll(root, "head")[0] ?? root;
  const fragment = parseHtml(markup);
  const children = fragment.children;

  children.forEach((child) => {
    child.parent = head;
  });

  head.children = [...head.children, ...children];
}

function injectBeforeBodyClose(root: ElementNode, markup: string) {
  const body = queryAll(root, "body")[0] ?? root;
  const fragment = parseHtml(markup);
  const children = fragment.children;

  children.forEach((child) => {
    child.parent = body;
  });

  body.children = [...body.children, ...children];
}

function hasThreeConfig(config: Record<string, unknown>) {
  return Object.keys(config).length > 0;
}

const THEME_SCOPE_SELECTOR = [
  ":root",
  "body",
  ".home-page",
  ".school-homepage",
  ".staff-page",
  ".testimonials-page",
  ".about-page",
  ".gallery-page",
  ".contact-page",
  ".school-about-page",
  ".school-academics-page",
  ".school-admissions-page",
  ".school-contact-page",
  ".school-gallery-page",
].join(", ");

const THEME_LOGO_FIELD: SchoolTemplateProjectSectionSnapshot["fields"][number] =
  {
    key: "logoUrl",
    label: "Site logo",
    type: "image",
    selector: "img",
    target: "attribute",
    attribute: "src",
  };

function getThemeLogoUrl(content: SchoolTemplateProjectContent) {
  return resolveSchoolTemplateAsset(content.theme.logoUrl, THEME_LOGO_FIELD, {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
  });
}

function getThemeVariableDeclarations(content: SchoolTemplateProjectContent) {
  const primary = content.theme.primaryColor;
  const secondary = content.theme.secondaryColor;
  const primaryDark = `color-mix(in srgb, ${primary} 78%, #000)`;
  const primarySoft = `color-mix(in srgb, ${primary} 16%, #fff)`;
  const secondaryDark = `color-mix(in srgb, ${secondary} 82%, #000)`;
  const secondarySoft = `color-mix(in srgb, ${secondary} 80%, #fff)`;

  const common = `
  --dexta-school-primary: ${primary};
  --dexta-school-secondary: ${secondary};
  --bs-primary: ${primary};
  --bs-secondary: ${secondary};`;

  switch (content.templateSlug) {
    case "dexta-academy-1":
      return `${common}
  --primary: ${primary};
  --primary-dark: ${primaryDark};
  --primary-light: ${primarySoft};
  --accent: ${secondary};
  --staff-emerald: ${primary};
  --staff-forest: ${primaryDark};
  --staff-mint: ${primarySoft};
  --staff-coral: ${secondary};
  --testimonial-emerald: ${primary};
  --testimonial-forest: ${primaryDark};
  --testimonial-coral: ${secondary};
  --testimonial-mint: ${primarySoft};
  --testimonial-peach: ${secondarySoft};`;
    case "dexta-academy-2":
      return `${common}
  --bg: ${primary};
  --bg-deep: ${primaryDark};
  --accent: ${secondary};
  --accent-deep: ${secondaryDark};
  --accent-2: ${secondarySoft};`;
    case "dexta-academy-3":
      return `${common}
  --navy: ${primary};
  --navy-deep: ${primaryDark};
  --gold: ${secondary};
  --gold-deep: ${secondaryDark};`;
    case "dexta-academy-4":
      return `${common}
  --blue: ${primary};
  --blue-bright: ${secondary};
  --blue-dim: color-mix(in srgb, ${primary} 40%, transparent);
  --blue-glow: color-mix(in srgb, ${primary} 18%, transparent);
  --primary: ${primary};
  --orange: ${secondary};
  --warning: ${secondary};`;
    default:
      return common;
  }
}

function getGlobalAppearanceCss(content: SchoolTemplateProjectContent) {
  const loadingBackground = content.theme.loadingBackgroundColor;
  const isTemplateTwo = content.templateSlug === "dexta-academy-2";
  const navbarBackground = content.theme.navBarTransparent
    ? "transparent"
    : content.theme.navBarColor;
  const navbarShadow = content.theme.navBarTransparent
    ? "none"
    : "0 16px 40px rgba(0, 0, 0, 0.08)";
  const logoBorder = content.theme.logoBorderEnabled
    ? `1px solid ${content.theme.logoBorderColor}`
    : "0";
  const logoRadius = `${content.theme.logoBorderRadius}px`;
  const logoWidth = `${content.theme.logoWidth}px`;
  const logoHeight = `${content.theme.logoHeight}px`;
  const brandTextDisplay = content.theme.brandTextVisible ? "" : "none";
  const brandLine2Display =
    content.theme.brandTextVisible && content.theme.brandTagline.trim()
      ? ""
      : "none";
  const css = [
    `
#spinner,
.site-loader,
.site-preloader,
#ftco-loader,
#ftco-loader.fullscreen,
#ftco-loader.show.fullscreen {
  background: ${loadingBackground} !important;
  background-color: ${loadingBackground} !important;
}`,
  ];

  if (isTemplateTwo) {
    if (!content.theme.navBarTransparent) {
      css.push(`
.site-header,
.site-header.is-scrolled {
  background: ${navbarBackground} !important;
  background-color: ${navbarBackground} !important;
  box-shadow: ${navbarShadow} !important;
}
body[data-page="home"] .site-header__bar {
  background: ${navbarBackground} !important;
  background-color: ${navbarBackground} !important;
}`);
    }
  } else {
    css.push(`
.navbar,
.navbar.bg-white,
.site-header,
.site-header__bar,
.hero-header,
.hero-navbar,
.ftco-navbar-light {
  background: ${navbarBackground} !important;
  background-color: ${navbarBackground} !important;
  box-shadow: ${navbarShadow} !important;
}`);
  }

  const templateTwoLegacyLogoDefaults =
    !content.theme.logoUrl &&
    content.theme.logoWidth === 56 &&
    content.theme.logoHeight === 56 &&
    content.theme.logoBorderRadius === 18 &&
    content.theme.logoBorderColor.toLowerCase() === "#ffc433" &&
    content.theme.logoBorderEnabled;
  const templateTwoOriginalLogoDefaults =
    !content.theme.logoUrl &&
    content.theme.logoWidth === 48 &&
    content.theme.logoHeight === 48 &&
    content.theme.logoBorderRadius === 12 &&
    content.theme.logoBorderColor.toLowerCase() === "#ffc433" &&
    content.theme.logoBorderEnabled;
  const shouldApplyLogoFrame =
    !isTemplateTwo ||
    content.theme.logoUrl ||
    (!templateTwoLegacyLogoDefaults && !templateTwoOriginalLogoDefaults);

  if (shouldApplyLogoFrame) {
    css.push(`
.brand__mark,
.brand__crest,
.site-loader__mark,
.page-loader__crest,
.contact-brand > img,
.navbar-brand img,
.hero-brand img,
.school-footer-brand-logo,
.site-preloader-logo {
  border: ${logoBorder} !important;
  border-radius: ${logoRadius} !important;
  width: ${logoWidth} !important;
  height: ${logoHeight} !important;
  max-width: ${logoWidth} !important;
}
.dexta-theme-logo-mark {
  background: transparent !important;
  overflow: hidden;
}
.dexta-theme-logo-mark::before {
  content: none !important;
}
.dexta-theme-logo-mark svg,
.dexta-theme-logo-mark .brand__crest-inner {
  display: none !important;
}
.brand__mark img,
.brand__crest img,
.site-loader__mark img,
.page-loader__crest img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.navbar-brand img,
.hero-brand img,
.school-footer-brand-logo,
.site-preloader-logo,
.contact-footer__brand img {
  object-fit: contain;
}`);
  }

  css.push(`
.brand__name,
.brand__copy,
.contact-brand > span {
  display: ${brandTextDisplay} !important;
}
.brand__name span,
.brand__copy span,
.contact-brand small {
  display: ${brandLine2Display} !important;
}`);

  const templateTwoLegacyBrandDefaults =
    content.theme.brandNameColor.toLowerCase() === "#ffffff" &&
    content.theme.brandTaglineColor.toLowerCase() === "#d1d5db" &&
    content.theme.brandNameFontSize === 16 &&
    content.theme.brandTaglineFontSize === 12;
  const templateTwoOriginalBrandDefaults =
    content.theme.brandNameColor.toLowerCase() === "#ffffff" &&
    content.theme.brandTaglineColor.toLowerCase() === "#facc15" &&
    content.theme.brandNameFontSize === 26 &&
    content.theme.brandTaglineFontSize === 13;

  if (
    !isTemplateTwo ||
    (!templateTwoLegacyBrandDefaults && !templateTwoOriginalBrandDefaults)
  ) {
    css.push(`
.brand__name strong,
.brand__copy strong,
.contact-brand strong,
.school-footer-brand h3 {
  color: ${content.theme.brandNameColor} !important;
  font-size: ${content.theme.brandNameFontSize}px !important;
}
.brand__name span,
.brand__copy span,
.contact-brand small {
  color: ${content.theme.brandTaglineColor} !important;
  font-size: ${content.theme.brandTaglineFontSize}px !important;
}`);
  }

  return css.join("");
}

function getTemplateThemeCss(content: SchoolTemplateProjectContent) {
  const primary = content.theme.primaryColor;
  const secondary = content.theme.secondaryColor;
  const secondaryDark = `color-mix(in srgb, ${secondary} 82%, #000)`;
  const primaryFaint = `color-mix(in srgb, ${primary} 18%, transparent)`;

  switch (content.templateSlug) {
    case "dexta-academy-1":
      return `
.btn.btn-primary,
.school-hero__btn--primary,
.staff-page .btn.btn-primary,
.testimonials-page .btn.btn-primary {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
}
.btn.btn-primary:hover,
.school-hero__btn--primary:hover,
.staff-page .btn.btn-primary:hover,
.testimonials-page .btn.btn-primary:hover {
  background: var(--primary-dark) !important;
  border-color: var(--primary-dark) !important;
}
.school-hero__btn--secondary {
  color: var(--primary) !important;
}
.staff-page__hero,
.staff-page__growth-panel,
.testimonials-page__hero {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%) !important;
}
.staff-page [class*="card"],
.staff-page [class*="panel"],
.testimonials-page [class*="card"],
.testimonials-page [class*="panel"] {
  border-color: ${primaryFaint} !important;
}`;
    case "dexta-academy-2":
      return `
.button--primary,
.section--accent {
  background: var(--accent) !important;
}
.button--primary:hover {
  background: var(--accent-2) !important;
}
.section--dark {
  background: var(--bg) !important;
}
body[data-page="home"] .hero-home__actions .button--primary {
  background: transparent !important;
  color: var(--text-white) !important;
  border: 1px solid rgba(255, 255, 255, 0.9) !important;
}
body[data-page="home"] .hero-home__actions .button--primary:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: var(--text-white) !important;
}
.button--outline-light:hover,
.button--outline-dark:hover,
.stat-card,
.card,
.news-card {
  border-color: var(--accent) !important;
}`;
    case "dexta-academy-3":
      return `
.button--navy {
  background: var(--navy) !important;
}
.button--gold {
  background: var(--gold) !important;
  color: var(--navy-deep) !important;
}
.button--gold,
.button--outline-light:hover,
.programme-card,
.programme-tile,
.contact-card,
.info-card {
  border-color: var(--gold) !important;
}
.button--navy,
.site-header,
.footer,
.admission-modal__panel {
  border-color: var(--navy) !important;
}
.programme-card--featured,
.timeline__marker,
.contact-hero,
.about-cta {
  background: var(--navy) !important;
}
.apply-card__badge,
.gallery-filter.is-active {
  background: var(--gold) !important;
  border-color: var(--gold) !important;
}`;
    case "dexta-academy-4":
      return `
.btn-primary,
.btn.btn-primary,
.hero-apply-btn,
.hero-primary-btn,
.school-homepage .btn.btn-primary,
.school-about-page .btn.btn-primary,
.school-academics-page .btn.btn-primary,
.school-admissions-page .btn.btn-primary,
.school-contact-page .btn.btn-primary,
.bg-primary {
  background: ${primary} !important;
  border-color: ${primary} !important;
  color: #fff !important;
}
.btn-primary:hover,
.btn.btn-primary:hover,
.hero-apply-btn:hover,
.hero-primary-btn:hover,
.school-homepage .btn.btn-primary:hover,
.school-about-page .btn.btn-primary:hover,
.school-academics-page .btn.btn-primary:hover,
.school-admissions-page .btn.btn-primary:hover,
.school-contact-page .btn.btn-primary:hover,
.school-about-page .btn.btn-primary:focus,
.school-academics-page .btn.btn-primary:focus,
.school-admissions-page .btn.btn-primary:focus,
.school-contact-page .btn.btn-primary:focus {
  background: ${secondary} !important;
  border-color: ${secondary} !important;
}
.btn-outline-primary {
  border-color: ${primary} !important;
  color: ${primary} !important;
}
.btn-outline-primary:hover {
  background: ${primary} !important;
  color: #fff !important;
}
.text-primary,
.school-homepage .section-label,
.school-homepage .feature-icon,
.heading-section .subheading,
.school-about-page a:hover,
.school-academics-page a:hover,
.school-contact-page a:hover,
.ftco-navbar-light .navbar-nav > .nav-item.active > a {
  color: ${primary} !important;
}
.bg-secondary {
  background: ${secondary} !important;
}
.text-secondary {
  color: ${secondaryDark} !important;
}
#ftco-loader .path {
  stroke: ${primary} !important;
}
.school-page-hero,
.about-page-hero,
.academics-page-hero,
.admissions-page-hero,
.contact-page-hero {
  background-color: ${primary} !important;
}
.gallery-pagination-btn:hover,
.gallery-pagination-btn:focus,
.gallery-pagination-number:hover,
.gallery-pagination-number:focus,
.gallery-pagination-number.is-active {
  background: ${primary} !important;
  border-color: ${primary} !important;
  color: #fff !important;
}
.hero-secondary-btn,
.btn-outline-primary,
.school-card,
.programme-card,
.feature-card,
.contact-detail-card,
.gallery-pagination-btn,
.gallery-pagination-number {
  border-color: ${primary} !important;
}`;
    default:
      return "";
  }
}

function getTemplateOverrideCss(content: SchoolTemplateProjectContent) {
  const themeCss = getTemplateThemeCss(content);
  let templateCss = "";

  if (content.templateSlug === "dexta-academy-2") {
    templateCss = `
body[data-page="home"] .hero-home {
  background-image: var(--dexta-academy-2-hero-desktop-tree-image) !important;
  background-position: var(--dexta-academy-2-hero-desktop-tree-position, center center) !important;
  background-size: var(--dexta-academy-2-hero-desktop-tree-size, cover) !important;
  background-repeat: no-repeat !important;
}
body[data-page="home"] .hero-home__building {
  background-image: var(--dexta-academy-2-hero-desktop-building-image) !important;
  background-position: var(--dexta-academy-2-hero-desktop-building-position, center bottom) !important;
  background-size: var(--dexta-academy-2-hero-desktop-building-size, 100% auto) !important;
  background-repeat: no-repeat !important;
}
body[data-page="home"] .hero-home__overlay {
  background: var(--dexta-academy-2-hero-overlay-color, #04111d) !important;
  opacity: var(--dexta-academy-2-hero-overlay-opacity, .58) !important;
}
body[data-page="home"] .hero-home__students {
  right: var(--dexta-academy-2-hero-students-desktop-right, max(-3.5vw, -44px)) !important;
  bottom: var(--dexta-academy-2-hero-students-desktop-bottom, -78px) !important;
  width: var(--dexta-academy-2-hero-students-desktop-width, min(49vw, 790px)) !important;
}
@media (max-width: 980px) {
  body[data-page="home"] .hero-home {
    background: var(--bg) !important;
  }
  body[data-page="home"] .hero-home::before {
    background-image: var(--dexta-academy-2-hero-mobile-image) !important;
    background-position: var(--dexta-academy-2-hero-mobile-position, center top) !important;
    background-size: var(--dexta-academy-2-hero-mobile-size, cover) !important;
    background-repeat: no-repeat !important;
  }
  body[data-page="home"] .hero-home__building {
    display: none !important;
  }
  body[data-page="home"] .hero-home__students {
    right: 0 !important;
    bottom: auto !important;
    width: var(--dexta-academy-2-hero-students-mobile-width, min(100%, 760px)) !important;
    transform: scale(var(--dexta-academy-2-hero-students-mobile-scale, 1.12)) !important;
  }
}`;
  }

  return `${themeCss}${templateCss}`;
}

function getThemeMarkup(content: SchoolTemplateProjectContent) {
  return `<style data-dexta-export-theme="true">
${THEME_SCOPE_SELECTOR} {
${getThemeVariableDeclarations(content)}
}
body {
  font-family: ${JSON.stringify(content.theme.fontFamily)}, var(--font-family, inherit);
}
${getGlobalAppearanceCss(content)}
${getTemplateOverrideCss(content)}
</style>`;
}

function getThemeRuntimeMarkup(content: SchoolTemplateProjectContent) {
  const logoUrl = getThemeLogoUrl(content);
  const brandName = content.theme.brandName.trim();
  const brandTagline = content.theme.brandTagline.trim();

  if (!logoUrl && !brandName && !brandTagline) {
    return "";
  }

  return `<script data-dexta-export-theme-runtime="true">
(function () {
  var logoUrl = ${escapeScriptJson(logoUrl)};
  var brandName = ${escapeScriptJson(brandName)};
  var brandTagline = ${escapeScriptJson(brandTagline)};

  function setImageLogo(selector) {
    if (!logoUrl) return;
    document.querySelectorAll(selector).forEach(function (image) {
      image.setAttribute("src", logoUrl);
      if (!image.getAttribute("alt")) {
        image.setAttribute("alt", "School logo");
      }
    });
  }

  function replaceMarkLogo(selector) {
    document.querySelectorAll(selector).forEach(function (mark) {
      if (!logoUrl) {
        mark.classList.remove("dexta-theme-logo-mark");
        return;
      }
      mark.classList.add("dexta-theme-logo-mark");
      var image = mark.querySelector("img");
      if (!image) {
        mark.textContent = "";
        image = document.createElement("img");
        image.alt = "School logo";
        mark.appendChild(image);
      }
      image.src = logoUrl;
    });
  }

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(function (node) {
      node.textContent = value;
    });
  }

  function setDisplay(selector, visible) {
    document.querySelectorAll(selector).forEach(function (node) {
      node.style.display = visible ? "" : "none";
    });
  }

	  function applyThemeIdentity() {
	    var showText = ${escapeScriptJson(content.theme.brandTextVisible)};
	    var fullLoaderName = [brandName, brandTagline].filter(Boolean).join(" ");
	    var templateTwoDefaultText =
	      ${escapeScriptJson(content.templateSlug === "dexta-academy-2")} &&
	      (brandName === "DXT Academy" || brandName === "DXT ACADEMY") &&
	      brandTagline === "Nurturing. Inspiring. Leading.";

	    setImageLogo(".navbar-brand img, .hero-brand img, .school-footer-brand-logo, .site-preloader-logo, .contact-footer__brand img");
	    replaceMarkLogo(".brand__mark, .brand__crest, .site-loader__mark, .page-loader__crest");

    setDisplay(".brand__name, .brand__copy, .contact-brand > span", showText);
    setDisplay(".site-loader__text", showText && Boolean(fullLoaderName));
    setDisplay(".brand__name span, .brand__copy span, .contact-brand small", showText && Boolean(brandTagline));

	    if (!templateTwoDefaultText) {
	      setText(".brand__name strong, .brand__copy strong, .contact-brand strong, .school-footer-brand h3", brandName);
	      setText(".brand__name span, .brand__copy span, .contact-brand small", brandTagline);
	    }
	    setText(".site-loader__text", fullLoaderName ? "Loading " + fullLoaderName : "");

    document.querySelectorAll(".brand, .contact-brand, .hero-brand").forEach(function (brand) {
      var label = fullLoaderName || brandName || "School";
      brand.setAttribute("aria-label", label + " home");
    });

    if (logoUrl) {
      document.querySelectorAll("link[rel~='icon']").forEach(function (link) {
        link.setAttribute("href", logoUrl);
      });
    }
  }

  applyThemeIdentity();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyThemeIdentity, { once: true });
  }
  window.setTimeout(applyThemeIdentity, 80);
  window.setTimeout(applyThemeIdentity, 350);
  window.setTimeout(applyThemeIdentity, 1000);
})();
</script>`;
}

function renderThreeConfigMarkup(config: Record<string, unknown>) {
  return `<script>window.schoolHero3dConfig = ${escapeScriptJson(config)};</script>`;
}

function rewriteTemplateAbsolutePaths(
  value: string,
  sourceSnapshot: SchoolTemplateSourceSnapshot,
) {
  const templateBase = `/${sourceSnapshot.templateSlug}/`;

  return value
    .replace(
      new RegExp(`(["'(])${templateBase.replace(/\//g, "\\/")}`, "g"),
      "$1",
    )
    .replace(/<base\b[^>]*>/gi, "");
}

async function renderPage({
  content,
  sourceSnapshot,
  page,
}: {
  content: SchoolTemplateProjectContent;
  sourceSnapshot: SchoolTemplateSourceSnapshot;
  page: SchoolTemplateProjectPageContent;
}): Promise<RenderedPage> {
  const pageSnapshot = sourceSnapshot.pages.find(
    (item) => item.slug === page.slug,
  );
  const sourcePath = assertSafeTemplatePath(
    sourceSnapshot.sourceDir,
    page.fileName,
  );
  const sourceHtml = await readFile(sourcePath, "utf8");
  const root = parseHtml(sourceHtml);
  const threeConfig: Record<string, unknown> = {};

  removeNodes(root, (node) => node.tagName === "base");

  for (const sectionContent of content.sharedSections) {
    applySection(
      root,
      sectionContent,
      sourceSnapshot.sharedSections.find(
        (item) => item.id === sectionContent.id,
      ),
      threeConfig,
    );
  }

  if (pageSnapshot) {
    for (const sectionContent of page.sections) {
      applySection(
        root,
        sectionContent,
        pageSnapshot.sections.find((item) => item.id === sectionContent.id),
        threeConfig,
      );
    }
  }

  injectIntoHead(root, getThemeMarkup(content));

  if (hasThreeConfig(threeConfig)) {
    injectBeforeBodyClose(root, renderThreeConfigMarkup(threeConfig));
  }

  injectBeforeBodyClose(root, getThemeRuntimeMarkup(content));

  return {
    page,
    html: rewriteTemplateAbsolutePaths(serializeNode(root), sourceSnapshot),
  };
}

async function copyDirectoryFiles({
  sourceDir,
  directory,
  files,
}: {
  sourceDir: string;
  directory: string;
  files: Map<string, ExportFile>;
}) {
  const root = assertSafeTemplatePath(sourceDir, directory);
  const items = await readdir(root, { withFileTypes: true });

  for (const item of items) {
    if (item.name === ".DS_Store") {
      continue;
    }

    const relativePath = path.posix.join(
      directory.replace(/\\/g, "/"),
      item.name,
    );
    const absolutePath = path.join(root, item.name);

    if (item.isDirectory()) {
      await copyDirectoryFiles({ sourceDir, directory: relativePath, files });
      continue;
    }

    if (!item.isFile()) {
      continue;
    }

    files.set(relativePath, {
      path: relativePath,
      data: await readFile(absolutePath),
    });
  }
}

async function copyTemplateAssets(
  sourceSnapshot: SchoolTemplateSourceSnapshot,
) {
  const files = new Map<string, ExportFile>();
  const sourceRoot = assertSafeTemplatePath(sourceSnapshot.sourceDir);
  const rootItems = await readdir(sourceRoot, { withFileTypes: true });
  const trackedRootFiles = new Set([
    ...sourceSnapshot.assetInventory.stylesheets,
    ...sourceSnapshot.assetInventory.scripts,
  ]);

  for (const directory of sourceSnapshot.assetInventory.directories) {
    await copyDirectoryFiles({
      sourceDir: sourceSnapshot.sourceDir,
      directory,
      files,
    });
  }

  for (const item of rootItems) {
    if (
      !item.isFile() ||
      item.name.endsWith(".html") ||
      item.name === ".DS_Store"
    ) {
      continue;
    }

    trackedRootFiles.add(item.name);
  }

  for (const relativePath of trackedRootFiles) {
    if (files.has(relativePath)) {
      continue;
    }

    const absolutePath = assertSafeTemplatePath(
      sourceSnapshot.sourceDir,
      relativePath,
    );
    const fileStat = await stat(absolutePath).catch(() => null);
    if (!fileStat?.isFile()) {
      continue;
    }

    files.set(relativePath, {
      path: relativePath,
      data: await readFile(absolutePath),
    });
  }

  return files;
}

function patchHero3dScript(value: string) {
  return value
    .replace(
      /const MODEL_URL\s*=\s*new URL\("\.\.\/assets\/3d\/gr\.glb", import\.meta\.url\)\.href;/,
      'const MODEL_URL = window.schoolHero3dConfig?.model?.url ? (/^https?:/i.test(window.schoolHero3dConfig.model.url) ? window.schoolHero3dConfig.model.url : new URL("../" + window.schoolHero3dConfig.model.url.replace(/^\\.\\//, ""), import.meta.url).href) : new URL("../assets/3d/gr.glb", import.meta.url).href;',
    )
    .replace(
      /const BASE_ROTATION_X\s*=\s*-?[\d.]+;/,
      "const BASE_ROTATION_X = window.schoolHero3dConfig?.transform?.rotation?.x ?? -0.20;",
    )
    .replace(
      /const BASE_ROTATION_Y\s*=\s*-?[\d.]+;/,
      "const BASE_ROTATION_Y = window.schoolHero3dConfig?.transform?.rotation?.y ?? -0.21;",
    )
    .replace(
      /const BASE_ROTATION_Z\s*=\s*-?[\d.]+;/,
      "const BASE_ROTATION_Z = window.schoolHero3dConfig?.transform?.rotation?.z ?? 0.20;",
    )
    .replace(
      /const MODEL_SCALE_TARGET\s*=\s*[\d.]+;/,
      "const MODEL_SCALE_TARGET = window.schoolHero3dConfig?.transform?.scale ?? 4.5;",
    )
    .replace(
      /const CAP_BODY_COLOR\s*=\s*new THREE\.Color\(0x[0-9a-fA-F]+\);/,
      "const CAP_BODY_COLOR = new THREE.Color(window.schoolHero3dConfig?.materials?.capBodyColor || 0x060d1e);",
    )
    .replace(
      /const CAP_BODY_EMISSIVE\s*=\s*new THREE\.Color\(0x[0-9a-fA-F]+\);/,
      "const CAP_BODY_EMISSIVE = new THREE.Color(window.schoolHero3dConfig?.materials?.capBodyEmissiveColor || 0x010408);",
    )
    .replace(
      /const TASSEL_CORD_COLOR\s*=\s*new THREE\.Color\(0x[0-9a-fA-F]+\);/,
      "const TASSEL_CORD_COLOR = new THREE.Color(window.schoolHero3dConfig?.materials?.tasselCordColor || 0x2a5fc0);",
    )
    .replace(
      /const TASSEL_TIP_COLOR\s*=\s*new THREE\.Color\(0x[0-9a-fA-F]+\);/,
      "const TASSEL_TIP_COLOR = new THREE.Color(window.schoolHero3dConfig?.materials?.tasselTipColor || 0x1a3d8a);",
    )
    .replace(
      /obj\.position\.x \+= sz2\.x \* 0\.10;/,
      "obj.position.x += sz2.x * (window.schoolHero3dConfig?.transform?.offset?.x ?? 0.10);",
    )
    .replace(
      /obj\.position\.y -= sz2\.y \* 0\.18;/,
      "obj.position.y -= sz2.y * Math.abs(window.schoolHero3dConfig?.transform?.offset?.y ?? -0.18);",
    );
}

function isTextFile(filePath: string) {
  return TEXT_FILE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

async function readExportFileAsText(file: ExportFile) {
  return Buffer.isBuffer(file.data) ? file.data.toString("utf8") : file.data;
}

function getRemoteAssetPath(url: string, index: number) {
  const cleanPath =
    new URL(url).pathname.split("/").filter(Boolean).pop() ?? "asset";
  const extension = path.extname(cleanPath).split("?")[0] || ".bin";
  const kind = /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(extension)
    ? "images"
    : "files";

  return `assets/${kind}/exported-${String(index + 1).padStart(3, "0")}${extension}`;
}

async function downloadRemoteAsset(url: string, remainingBytes: number) {
  const cleanUrl = normalizeRemoteAssetUrl(url);
  if (remainingBytes <= 0) {
    return null;
  }

  const response = await fetch(cleanUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to download export asset: ${cleanUrl} (${response.status})`,
    );
  }

  const declaredLength = Number(response.headers.get("content-length"));
  const maxBytes = Math.min(MAX_BUNDLED_REMOTE_ASSET_BYTES, remainingBytes);

  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return null;
  }

  const data = Buffer.from(await response.arrayBuffer());
  return data.length > maxBytes ? null : data;
}

async function rewriteRemoteAssets(files: Map<string, ExportFile>) {
  const remoteAssetPaths = new Map<string, string>();
  const remoteAssetBuffers = new Map<string, Buffer>();
  const skippedRemoteAssets = new Set<string>();
  let bundledRemoteAssetBytes = 0;

  for (const file of Array.from(files.values())) {
    if (!isTextFile(file.path)) {
      continue;
    }

    let text = await readExportFileAsText(file);
    const urls = Array.from(new Set(text.match(CLOUDINARY_URL_PATTERN) ?? []));

    for (const rawUrl of urls) {
      const url = normalizeRemoteAssetUrl(rawUrl);

      if (skippedRemoteAssets.has(url)) {
        continue;
      }

      if (!remoteAssetPaths.has(url)) {
        const assetPath = getRemoteAssetPath(url, remoteAssetPaths.size);
        const data = await downloadRemoteAsset(
          url,
          MAX_BUNDLED_REMOTE_ASSETS_TOTAL_BYTES - bundledRemoteAssetBytes,
        );

        if (!data) {
          skippedRemoteAssets.add(url);
          continue;
        }

        bundledRemoteAssetBytes += data.length;
        remoteAssetPaths.set(url, assetPath);
        remoteAssetBuffers.set(assetPath, data);
      }

      const assetPath = remoteAssetPaths.get(url);
      if (!assetPath) {
        continue;
      }

      const relativePath = path.posix.relative(
        path.posix.dirname(file.path),
        assetPath,
      );
      text = text
        .split(rawUrl)
        .join(relativePath || path.posix.basename(assetPath));
    }

    file.data = text;
  }

  for (const [assetPath, data] of remoteAssetBuffers) {
    files.set(assetPath, { path: assetPath, data });
  }
}

async function rewriteTextAssets(
  files: Map<string, ExportFile>,
  sourceSnapshot: SchoolTemplateSourceSnapshot,
) {
  for (const file of files.values()) {
    if (!isTextFile(file.path)) {
      continue;
    }

    let text = await readExportFileAsText(file);
    text = rewriteTemplateAbsolutePaths(text, sourceSnapshot);

    if (file.path.replace(/\\/g, "/") === "js/hero-3d.js") {
      text = patchHero3dScript(text);
    }

    file.data = text;
  }
}

export async function buildSchoolWebsiteProjectExportZip({
  content,
  sourceSnapshot,
}: {
  content: SchoolTemplateProjectContent;
  sourceSnapshot: SchoolTemplateSourceSnapshot;
}) {
  const files = await copyTemplateAssets(sourceSnapshot);
  const renderedPages = await Promise.all(
    content.pages.map((page) => renderPage({ content, sourceSnapshot, page })),
  );

  for (const renderedPage of renderedPages) {
    files.set(renderedPage.page.fileName, {
      path: renderedPage.page.fileName,
      data: renderedPage.html,
    });
  }

  await rewriteTextAssets(files, sourceSnapshot);
  await rewriteRemoteAssets(files);

  return {
    fileName: `${slugifyFileName(content.templateName)}-website.zip`,
    buffer: createZipArchive(
      Array.from(files.values()).map((file) => ({
        path: normalizeZipPath(file.path),
        data: file.data,
      })),
    ),
    pageCount: renderedPages.length,
    fileCount: files.size,
  };
}
