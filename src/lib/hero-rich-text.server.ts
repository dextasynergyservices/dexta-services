import "server-only";

import sanitizeHtml from "sanitize-html";
import { normalizeHeroRichText, type HeroRichTextMode } from "./hero-rich-text";
import type { HeroContentInput } from "./validators";

type RichTextRule = {
  label: string;
  maxVisibleLength: number;
  mode: HeroRichTextMode;
};

const INLINE_ALLOWED_TAGS = [
  "span",
  "strong",
  "em",
  "u",
  "s",
  "sup",
  "sub",
  "br",
];
const BLOCK_ALLOWED_TAGS = [...INLINE_ALLOWED_TAGS, "p"];

const TEXT_STYLE_RULES = {
  "*": {
    color: [
      /^#[0-9a-fA-F]{3,8}$/,
      /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
      /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0|0?\.\d+|1)\s*\)$/,
      /^[a-zA-Z]+$/,
    ],
    "font-family": [/^[\w\s,"'-]+$/],
    "font-size": [/^\d+(\.\d+)?(px|pt|rem|em|%)$/],
    "font-style": [/^(normal|italic|oblique)$/],
    "font-weight": [/^(normal|bold|bolder|lighter|[1-9]00)$/],
    "letter-spacing": [/^-?\d+(\.\d+)?(px|rem|em)$/],
    "line-height": [/^\d+(\.\d+)?(px|rem|em|%)?$/],
    "text-decoration": [/^(none|underline|line-through)$/],
    "text-transform": [/^(none|uppercase|lowercase|capitalize)$/],
  },
};

function getVisibleText(value: string) {
  return sanitizeHtml(value, {
    allowedAttributes: {},
    allowedTags: [],
  })
    .replace(/\s+/g, " ")
    .trim();
}

function flattenInlineMarkup(value: string) {
  return value
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>\s*<p[^>]*>/gi, "<br />")
    .replace(/<\/p>/gi, "")
    .replace(/(<br\s*\/?>\s*){3,}/gi, "<br /><br />")
    .trim();
}

function sanitizeHeroTextField(value: string, rule: RichTextRule) {
  const normalized = normalizeHeroRichText(value, rule.mode);

  const sanitized = sanitizeHtml(normalized, {
    allowedTags:
      rule.mode === "inline" ? INLINE_ALLOWED_TAGS : BLOCK_ALLOWED_TAGS,
    allowedAttributes: {
      "*": ["style"],
    },
    allowedStyles: TEXT_STYLE_RULES,
    disallowedTagsMode: "discard",
  });

  const html =
    rule.mode === "inline" ? flattenInlineMarkup(sanitized) : sanitized.trim();

  const visibleText = getVisibleText(html);

  if (!visibleText) {
    throw new Error(`${rule.label} is required`);
  }

  if (visibleText.length > rule.maxVisibleLength) {
    throw new Error(
      `${rule.label} must be ${rule.maxVisibleLength} characters or less`,
    );
  }

  return html;
}

export function sanitizeHeroContentInput(
  data: HeroContentInput,
): HeroContentInput {
  return {
    ...data,
    eyebrow: sanitizeHeroTextField(data.eyebrow, {
      label: "Eyebrow",
      maxVisibleLength: 100,
      mode: "inline",
    }),
    headline: sanitizeHeroTextField(data.headline, {
      label: "Headline",
      maxVisibleLength: 300,
      mode: "inline",
    }),
    body: sanitizeHeroTextField(data.body, {
      label: "Body text",
      maxVisibleLength: 1000,
      mode: "block",
    }),
    stackBadge: sanitizeHeroTextField(data.stackBadge, {
      label: "Stack badge",
      maxVisibleLength: 100,
      mode: "inline",
    }),
    stackTitle: sanitizeHeroTextField(data.stackTitle, {
      label: "Stack title",
      maxVisibleLength: 300,
      mode: "inline",
    }),
    stackBody: sanitizeHeroTextField(data.stackBody, {
      label: "Stack body",
      maxVisibleLength: 1000,
      mode: "block",
    }),
  };
}
