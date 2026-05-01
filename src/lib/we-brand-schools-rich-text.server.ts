import "server-only";

import sanitizeHtml from "sanitize-html";
import { normalizeHeroRichText, type HeroRichTextMode } from "./hero-rich-text";
import type { WeBrandSchoolsPageContentInput } from "./validators";

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

function sanitizeTextField(value: string, rule: RichTextRule) {
  const normalized = normalizeHeroRichText(value, rule.mode);

  const sanitized = sanitizeHtml(normalized, {
    allowedAttributes: {
      "*": ["style"],
    },
    allowedStyles: TEXT_STYLE_RULES,
    allowedTags:
      rule.mode === "inline" ? INLINE_ALLOWED_TAGS : BLOCK_ALLOWED_TAGS,
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

export function sanitizeWeBrandSchoolsPageContentInput(
  data: WeBrandSchoolsPageContentInput,
): WeBrandSchoolsPageContentInput {
  return {
    ...data,
    heroEyebrow: sanitizeTextField(data.heroEyebrow, {
      label: "Hero eyebrow",
      maxVisibleLength: 120,
      mode: "inline",
    }),
    heroHeadline: sanitizeTextField(data.heroHeadline, {
      label: "Hero headline",
      maxVisibleLength: 220,
      mode: "inline",
    }),
    heroBody: sanitizeTextField(data.heroBody, {
      label: "Hero body",
      maxVisibleLength: 2000,
      mode: "block",
    }),
    heroFeature1: sanitizeTextField(data.heroFeature1, {
      label: "Hero feature 1",
      maxVisibleLength: 120,
      mode: "inline",
    }),
    heroFeature2: sanitizeTextField(data.heroFeature2, {
      label: "Hero feature 2",
      maxVisibleLength: 120,
      mode: "inline",
    }),
    heroFeature3: sanitizeTextField(data.heroFeature3, {
      label: "Hero feature 3",
      maxVisibleLength: 120,
      mode: "inline",
    }),
    overviewLabel: sanitizeTextField(data.overviewLabel, {
      label: "Overview label",
      maxVisibleLength: 120,
      mode: "inline",
    }),
    overviewTitle: sanitizeTextField(data.overviewTitle, {
      label: "Overview title",
      maxVisibleLength: 220,
      mode: "inline",
    }),
    overviewBody: sanitizeTextField(data.overviewBody, {
      label: "Overview body",
      maxVisibleLength: 2000,
      mode: "block",
    }),
    overviewBenefitsLabel: sanitizeTextField(data.overviewBenefitsLabel, {
      label: "Overview benefits label",
      maxVisibleLength: 120,
      mode: "inline",
    }),
    overviewBenefit1: sanitizeTextField(data.overviewBenefit1, {
      label: "Overview benefit 1",
      maxVisibleLength: 220,
      mode: "inline",
    }),
    overviewBenefit2: sanitizeTextField(data.overviewBenefit2, {
      label: "Overview benefit 2",
      maxVisibleLength: 220,
      mode: "inline",
    }),
    overviewBenefit3: sanitizeTextField(data.overviewBenefit3, {
      label: "Overview benefit 3",
      maxVisibleLength: 220,
      mode: "inline",
    }),
    overviewBenefit4: sanitizeTextField(data.overviewBenefit4, {
      label: "Overview benefit 4",
      maxVisibleLength: 220,
      mode: "inline",
    }),
    processLabel: sanitizeTextField(data.processLabel, {
      label: "Process label",
      maxVisibleLength: 120,
      mode: "inline",
    }),
    processTitle: sanitizeTextField(data.processTitle, {
      label: "Process title",
      maxVisibleLength: 220,
      mode: "inline",
    }),
    processBody: sanitizeTextField(data.processBody, {
      label: "Process body",
      maxVisibleLength: 1600,
      mode: "block",
    }),
    processStep1Title: sanitizeTextField(data.processStep1Title, {
      label: "Process step 1 title",
      maxVisibleLength: 120,
      mode: "inline",
    }),
    processStep1Body: sanitizeTextField(data.processStep1Body, {
      label: "Process step 1 body",
      maxVisibleLength: 600,
      mode: "block",
    }),
    processStep2Title: sanitizeTextField(data.processStep2Title, {
      label: "Process step 2 title",
      maxVisibleLength: 120,
      mode: "inline",
    }),
    processStep2Body: sanitizeTextField(data.processStep2Body, {
      label: "Process step 2 body",
      maxVisibleLength: 600,
      mode: "block",
    }),
    processStep3Title: sanitizeTextField(data.processStep3Title, {
      label: "Process step 3 title",
      maxVisibleLength: 120,
      mode: "inline",
    }),
    processStep3Body: sanitizeTextField(data.processStep3Body, {
      label: "Process step 3 body",
      maxVisibleLength: 600,
      mode: "block",
    }),
    processStep4Title: sanitizeTextField(data.processStep4Title, {
      label: "Process step 4 title",
      maxVisibleLength: 120,
      mode: "inline",
    }),
    processStep4Body: sanitizeTextField(data.processStep4Body, {
      label: "Process step 4 body",
      maxVisibleLength: 600,
      mode: "block",
    }),
    templatesLabel: sanitizeTextField(data.templatesLabel, {
      label: "Templates label",
      maxVisibleLength: 120,
      mode: "inline",
    }),
    templatesTitle: sanitizeTextField(data.templatesTitle, {
      label: "Templates title",
      maxVisibleLength: 220,
      mode: "inline",
    }),
    templatesBody: sanitizeTextField(data.templatesBody, {
      label: "Templates body",
      maxVisibleLength: 1600,
      mode: "block",
    }),
  };
}
