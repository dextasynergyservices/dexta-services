import {
  type SchoolTemplateProjectContent,
  type SchoolTemplateProjectFieldValue,
} from "@/lib/school-template-project-content";

const contactIconAliases: Record<string, string> = {
  location: "⌖",
  "location-pin": "⌖",
  "location-dot": "◎",
  "location-map": "⌂",
  phone: "☎",
  "phone-call": "✆",
  "phone-mobile": "☏",
  mail: "✉",
  email: "✉",
  "mail-open": "✎",
  "mail-send": "↗",
  clock: "◷",
  "clock-3": "◴",
  "calendar-clock": "◵",
  share: "↗",
  "share-alt": "⤴",
  "share-circle": "⟲",
  globe: "◎",
  "globe-grid": "◉",
  "globe-ring": "◌",
  chat: "☰",
  "chat-lines": "≡",
  "chat-box": "▤",
  support: "?",
  "support-circle": "ⓘ",
  "support-star": "✦",
  heart: "♡",
  "heart-fill": "♥",
  "heart-plus": "✚",
  users: "☷",
  "users-group": "▦",
  "users-circle": "◎",
  school: "⌂",
  "school-building": "▦",
  "school-flag": "⚑",
  book: "▭",
  "book-open": "▤",
  "book-mark": "▥",
  graduation: "△",
  "graduation-cap": "◇",
  "graduation-star": "✦",
  bolt: "ϟ",
  "bolt-circle": "⊙",
  "bolt-line": "↯",
  timer: "◷",
  "timer-fast": "◴",
  "timer-check": "✓",
  check: "✓",
  "check-circle": "◎",
  "check-square": "☑",
};

function normalizeIconName(value: SchoolTemplateProjectFieldValue) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^icon[:\s-]+/, "")
    .replace(/[\s_]+/g, "-");
}

function renderContactIconValue(value: SchoolTemplateProjectFieldValue) {
  const icon = contactIconAliases[normalizeIconName(value)];
  return icon ?? value;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripHtmlText(value: SchoolTemplateProjectFieldValue) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripRepeatedContactTitle(
  titleValue: SchoolTemplateProjectFieldValue,
  contentValue: SchoolTemplateProjectFieldValue,
) {
  const title = stripHtmlText(titleValue);
  const contentText = stripHtmlText(contentValue);
  if (!title || !contentText.toLowerCase().startsWith(title.toLowerCase())) {
    return contentValue;
  }

  const pattern = new RegExp(
    `^\\s*(?:<[^>]+>\\s*)*${escapeRegExp(title)}(?:\\s|<[^>]+>|&nbsp;|<br\\s*\\/?>)*`,
    "i",
  );
  return String(contentValue ?? "").replace(pattern, "").trim();
}

export function prepareDextaAcademyThreeContactRenderingContent(
  content: SchoolTemplateProjectContent,
): SchoolTemplateProjectContent {
  if (content.templateSlug !== "dexta-academy-3") {
    return content;
  }

  return {
    ...content,
    pages: content.pages.map((page) => {
      if (page.slug !== "contact") return page;

      return {
        ...page,
        sections: page.sections.map((section) => {
          if (section.id === "contact-panel" && section.repeatable) {
            return {
              ...section,
              repeatable: {
                ...section.repeatable,
                items: section.repeatable.items.map((item) => ({
                  ...item,
                  infoIcon: renderContactIconValue(item.infoIcon),
                  infoContent: stripRepeatedContactTitle(
                    item.infoTitle,
                    item.infoContent,
                  ),
                })),
              },
            };
          }

          if (section.id === "contact-benefits" && section.repeatable) {
            return {
              ...section,
              repeatable: {
                ...section.repeatable,
                items: section.repeatable.items.map((item) => ({
                  ...item,
                  benefitIcon: renderContactIconValue(item.benefitIcon),
                })),
              },
            };
          }

          return section;
        }),
      };
    }),
  };
}
