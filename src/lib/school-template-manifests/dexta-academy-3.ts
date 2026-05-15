import {
  backgroundImageField,
  colorField,
  imageField,
  linkField,
  numberField,
  textField,
  textareaField,
  type SchoolTemplateField,
  type SchoolTemplateManifest,
} from "./types";

const formIframePlaceholder =
  '<iframe src="https://docs.google.com/forms/..." width="640" height="1602" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>';

const formIframeHelpText =
  "Paste the full Google Forms iframe embed code. Leave blank to use the Google Form URL field.";

const fontImportHelpText =
  "Paste a Google Fonts embed URL to change the font for this section. Example: https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap";

// ── Rich text helper ──────────────────────────────────────────
function richTextField(
  key: string,
  label: string,
  selector: string,
  overrides: Partial<SchoolTemplateField> = {},
): SchoolTemplateField {
  return textareaField(key, label, selector, {
    type: "richText",
    target: "innerHTML",
    ...overrides,
  });
}

// ── CSS variable naming ───────────────────────────────────────
function t3CssVar(pageKey: string, sectionKey: string, token: string) {
  return `--dexta-academy-3-${pageKey}-${sectionKey}-${token}`;
}

// ── Section background fields ─────────────────────────────────
function t3SectionStyleFields({
  pageKey,
  sectionKey,
  selector,
  defaultBackgroundColor,
  defaultBackgroundOpacity = 100,
  includeBackgroundImage = true,
}: {
  pageKey: string;
  sectionKey: string;
  selector: string;
  defaultBackgroundColor: string;
  defaultBackgroundOpacity?: number;
  includeBackgroundImage?: boolean;
}): SchoolTemplateField[] {
  return [
    colorField("sectionBgColor", "Section background color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "section-bg-color"),
      defaultValue: defaultBackgroundColor,
      uiGroup: "Section background",
      uiOrder: 100,
    }),
    numberField("sectionBgOpacity", "Section background opacity", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "section-bg-opacity"),
      defaultValue: defaultBackgroundOpacity,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      uiGroup: "Section background",
      uiOrder: 101,
    }),
    ...(includeBackgroundImage
      ? [
          backgroundImageField(
            "sectionBgImage",
            "Section background image",
            selector,
            {
              target: "cssVariable",
              cssVariable: t3CssVar(pageKey, sectionKey, "section-bg-image"),
              defaultValue: "",
              uiGroup: "Section background",
              uiOrder: 102,
              helpText:
                "Use the image control to add, replace, or remove this section background image.",
            },
          ),
          textField(
            "sectionBgPosition",
            "Background image position",
            selector,
            {
              target: "cssVariable",
              cssVariable: t3CssVar(pageKey, sectionKey, "section-bg-position"),
              defaultValue: "center center",
              uiGroup: "Section background",
              uiOrder: 103,
            },
          ),
          textField("sectionBgSize", "Background image size", selector, {
            target: "cssVariable",
            cssVariable: t3CssVar(pageKey, sectionKey, "section-bg-size"),
            defaultValue: "cover",
            helpText:
              "Use cover, contain, or a custom CSS size such as 100% auto.",
            uiGroup: "Section background",
            uiOrder: 104,
          }),
        ]
      : []),
  ];
}

// ── Typography / font import ──────────────────────────────────
function t3TypographyFields({
  selector,
}: {
  selector: string;
}): SchoolTemplateField[] {
  return [
    linkField("fontStylesheetUrl", "Google Fonts stylesheet URL", selector, {
      target: "attribute",
      attribute: "data-dexta-font-stylesheet",
      defaultValue: "",
      placeholder:
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
      helpText: fontImportHelpText,
      uiGroup: "Rich text fonts",
      uiOrder: 200,
    }),
  ];
}

// ── Button style fields ───────────────────────────────────────
function t3ButtonStyleFields({
  pageKey,
  sectionKey,
  selector,
  defaultBackgroundColor = "#122a56",
  defaultBackgroundOpacity = 100,
  defaultTextColor = "#ffffff",
  defaultBorderColor = "#122a56",
  defaultBorderWidth = 0,
}: {
  pageKey: string;
  sectionKey: string;
  selector: string;
  defaultBackgroundColor?: string;
  defaultBackgroundOpacity?: number;
  defaultTextColor?: string;
  defaultBorderColor?: string;
  defaultBorderWidth?: number;
}): SchoolTemplateField[] {
  return [
    colorField("buttonBgColor", "Button background color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "button-bg-color"),
      defaultValue: defaultBackgroundColor,
      uiGroup: "Button style",
      uiOrder: 300,
    }),
    numberField("buttonBgOpacity", "Button background opacity", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "button-bg-opacity"),
      defaultValue: defaultBackgroundOpacity,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      uiGroup: "Button style",
      uiOrder: 301,
    }),
    colorField("buttonTextColor", "Button text color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "button-text-color"),
      defaultValue: defaultTextColor,
      uiGroup: "Button style",
      uiOrder: 302,
    }),
    colorField("buttonBorderColor", "Button border color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "button-border-color"),
      defaultValue: defaultBorderColor,
      uiGroup: "Button style",
      uiOrder: 303,
    }),
    numberField("buttonBorderWidth", "Button border width", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "button-border-width"),
      defaultValue: defaultBorderWidth,
      min: 0,
      max: 12,
      step: 1,
      unit: "px",
      helpText: "Set to 0 to remove the border.",
      uiGroup: "Button style",
      uiOrder: 304,
    }),
  ];
}

// ── Icon style fields ─────────────────────────────────────────
function t3IconStyleFields({
  pageKey,
  sectionKey,
  selector,
  defaultIconColor = "#f3bf35",
  defaultIconBgColor = "transparent",
  defaultIconBgOpacity = 0,
  defaultIconBorderColor = "transparent",
  defaultIconBorderWidth = 0,
}: {
  pageKey: string;
  sectionKey: string;
  selector: string;
  defaultIconColor?: string;
  defaultIconBgColor?: string;
  defaultIconBgOpacity?: number;
  defaultIconBorderColor?: string;
  defaultIconBorderWidth?: number;
}): SchoolTemplateField[] {
  return [
    backgroundImageField("iconImage", "Upload icon image", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "icon-image"),
      defaultValue: "",
      helpText:
        "Upload a custom icon image (PNG, SVG) to replace the default icon.",
      uiGroup: "Icon style",
      uiOrder: 400,
    }),
    colorField("iconColor", "Icon color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "icon-color"),
      defaultValue: defaultIconColor,
      uiGroup: "Icon style",
      uiOrder: 401,
    }),
    colorField("iconBgColor", "Icon background color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "icon-bg-color"),
      defaultValue: defaultIconBgColor,
      uiGroup: "Icon style",
      uiOrder: 402,
    }),
    numberField("iconBgOpacity", "Icon background opacity", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "icon-bg-opacity"),
      defaultValue: defaultIconBgOpacity,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      uiGroup: "Icon style",
      uiOrder: 403,
    }),
    colorField("iconBorderColor", "Icon border color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "icon-border-color"),
      defaultValue: defaultIconBorderColor,
      uiGroup: "Icon style",
      uiOrder: 404,
    }),
    numberField("iconBorderWidth", "Icon border width", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "icon-border-width"),
      defaultValue: defaultIconBorderWidth,
      min: 0,
      max: 12,
      step: 1,
      unit: "px",
      helpText: "Set to 0 to remove the icon border.",
      uiGroup: "Icon style",
      uiOrder: 405,
    }),
  ];
}

// ── Per-page shorthand wrappers ───────────────────────────────
function homeSectionStyle(
  opts: Omit<Parameters<typeof t3SectionStyleFields>[0], "pageKey">,
) {
  return t3SectionStyleFields({ pageKey: "home", ...opts });
}
function homeButtonStyle(
  opts: Omit<Parameters<typeof t3ButtonStyleFields>[0], "pageKey">,
) {
  return t3ButtonStyleFields({ pageKey: "home", ...opts });
}
function homeTypography(opts: { selector: string }) {
  return t3TypographyFields(opts);
}
function homeIconStyle(
  opts: Omit<Parameters<typeof t3IconStyleFields>[0], "pageKey">,
) {
  return t3IconStyleFields({ pageKey: "home", ...opts });
}

function aboutSectionStyle(
  opts: Omit<Parameters<typeof t3SectionStyleFields>[0], "pageKey">,
) {
  return t3SectionStyleFields({ pageKey: "about", ...opts });
}
function aboutButtonStyle(
  opts: Omit<Parameters<typeof t3ButtonStyleFields>[0], "pageKey">,
) {
  return t3ButtonStyleFields({ pageKey: "about", ...opts });
}
function aboutTypography(opts: { selector: string }) {
  return t3TypographyFields(opts);
}
function aboutIconStyle(
  opts: Omit<Parameters<typeof t3IconStyleFields>[0], "pageKey">,
) {
  return t3IconStyleFields({ pageKey: "about", ...opts });
}

function gallerySectionStyle(
  opts: Omit<Parameters<typeof t3SectionStyleFields>[0], "pageKey">,
) {
  return t3SectionStyleFields({ pageKey: "gallery", ...opts });
}
function galleryTypography(opts: { selector: string }) {
  return t3TypographyFields(opts);
}

function contactSectionStyle(
  opts: Omit<Parameters<typeof t3SectionStyleFields>[0], "pageKey">,
) {
  return t3SectionStyleFields({ pageKey: "contact", ...opts });
}
function _contactButtonStyle(
  opts: Omit<Parameters<typeof t3ButtonStyleFields>[0], "pageKey">,
) {
  return t3ButtonStyleFields({ pageKey: "contact", ...opts });
}
function contactTypography(opts: { selector: string }) {
  return t3TypographyFields(opts);
}
function contactIconStyle(
  opts: Omit<Parameters<typeof t3IconStyleFields>[0], "pageKey">,
) {
  return t3IconStyleFields({ pageKey: "contact", ...opts });
}

export const dextaAcademy3Manifest = {
  templateSlug: "dexta-academy-3",
  templateName: "Dexta Academy 3",
  sourceDir: "src/app/(public)/dexta-academy-3",
  entryFile: "index.html",
  previewPath: "/dexta-academy-3/index.html",
  assetInventory: {
    directories: ["assets"],
    stylesheets: ["styles.css"],
    scripts: ["script.js"],
  },
  sharedSections: [
    {
      id: "site-header",
      label: "Header",
      selector: ".site-header",
      description: "Shared brand, navigation, portal link, and apply button.",
      fields: [
        textField("brandPrimary", "Brand primary text", ".brand__name strong"),
        textField(
          "brandSecondary",
          "Brand secondary text",
          ".brand__name span",
        ),
        textField("portalText", "Portal label", ".portal-link"),
        linkField("portalHref", "Portal link", ".portal-link"),
        textField(
          "headerCtaText",
          "Header CTA text",
          ".header-actions .button",
        ),
        linkField(
          "headerCtaHref",
          "Header CTA link",
          ".header-actions .button",
        ),
        ...t3SectionStyleFields({
          pageKey: "shared",
          sectionKey: "header",
          selector: ".site-header",
          defaultBackgroundColor: "rgba(255,255,255,0.9)",
          includeBackgroundImage: false,
        }),
        ...t3ButtonStyleFields({
          pageKey: "shared",
          sectionKey: "header-cta",
          selector: ".header-actions .button--gold",
          defaultBackgroundColor: "#f3bf35",
          defaultTextColor: "#09142f",
          defaultBorderColor: "#f3bf35",
          defaultBorderWidth: 0,
        }),
      ],
    },
    {
      id: "site-footer",
      label: "Footer",
      selector: ".site-footer",
      description: "Shared footer identity, contact details, and links.",
      fields: [
        textField(
          "footerBrandPrimary",
          "Footer brand primary text",
          ".brand--footer .brand__name strong",
        ),
        textField(
          "footerBrandSecondary",
          "Footer brand secondary text",
          ".brand--footer .brand__name span",
        ),
        richTextField("footerBody", "Footer body", ".footer-brand p"),
        textField(
          "footerPhone",
          "Footer phone",
          ".footer-column:nth-of-type(2) a:nth-of-type(1)",
        ),
        textField(
          "footerEmail",
          "Footer email",
          ".footer-column:nth-of-type(2) a:nth-of-type(2)",
        ),
        richTextField("copyright", "Copyright text", ".footer-bottom p"),
        ...t3SectionStyleFields({
          pageKey: "shared",
          sectionKey: "footer",
          selector: ".site-footer",
          defaultBackgroundColor: "#09142f",
          includeBackgroundImage: false,
        }),
      ],
    },
  ],
  pages: [
    {
      slug: "home",
      fileName: "index.html",
      title: "Home",
      isHome: true,
      sections: [
        {
          id: "hero",
          label: "Hero",
          selector: ".hero",
          fields: [
            richTextField("headline", "Headline", ".hero__title"),
            imageField("skyImage", "Sky image", ".hero__sky-image"),
            imageField(
              "studentImage",
              "Student lineup image",
              ".hero__student-lineup",
            ),
            textField(
              "primaryCtaText",
              "Primary CTA text",
              ".hero__cta-primary",
            ),
            linkField(
              "primaryCtaHref",
              "Primary CTA link",
              ".hero__cta-primary",
            ),
            textField(
              "secondaryCtaText",
              "Secondary CTA text",
              ".hero__cta-secondary",
            ),
            linkField(
              "secondaryCtaHref",
              "Secondary CTA link",
              ".hero__cta-secondary",
            ),
            ...homeSectionStyle({
              sectionKey: "hero",
              selector: ".hero",
              defaultBackgroundColor: "#031225",
            }),
            ...t3ButtonStyleFields({
              pageKey: "home",
              sectionKey: "hero-primary",
              selector: ".hero__cta-primary",
              defaultBackgroundColor: "#f3bf35",
              defaultTextColor: "#09142f",
              defaultBorderColor: "#f3bf35",
            }).map((f) => ({
              ...f,
              label: `Primary ${f.label}`,
              key: `primary${f.key.charAt(0).toUpperCase()}${f.key.slice(1)}`,
              uiGroup: "Primary CTA style",
            })),
            ...t3ButtonStyleFields({
              pageKey: "home",
              sectionKey: "hero-secondary",
              selector: ".hero__cta-secondary",
              defaultBackgroundColor: "rgba(255,255,255,0.78)",
              defaultTextColor: "#112246",
              defaultBorderColor: "rgba(17,34,70,0.15)",
              defaultBorderWidth: 1,
            }).map((f) => ({
              ...f,
              label: `Secondary ${f.label}`,
              key: `secondary${f.key.charAt(0).toUpperCase()}${f.key.slice(1)}`,
              uiGroup: "Secondary CTA style",
            })),
            ...homeTypography({ selector: ".hero" }),
          ],
        },
        {
          id: "welcome",
          label: "Welcome",
          selector: ".welcome",
          fields: [
            richTextField("eyebrow", "Eyebrow", ".welcome__eyebrow"),
            richTextField("title", "Title", ".welcome__title"),
            richTextField("body", "Body", ".welcome__body"),
            imageField("image", "Image", ".welcome__media img"),
            textField("ctaText", "CTA text", ".welcome__cta"),
            linkField("ctaHref", "CTA link", ".welcome__cta"),
            ...homeSectionStyle({
              sectionKey: "welcome",
              selector: ".welcome",
              defaultBackgroundColor: "#fff8ed",
            }),
            ...homeButtonStyle({
              sectionKey: "welcome-cta",
              selector: ".welcome__cta",
              defaultBackgroundColor: "#122a56",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "#122a56",
            }),
            ...homeTypography({ selector: ".welcome" }),
          ],
        },
        {
          id: "programmes",
          label: "Programmes",
          selector: ".programmes-showcase",
          fields: [
            richTextField("eyebrow", "Eyebrow", ".section-heading .eyebrow"),
            richTextField("title", "Title", ".section-heading h2"),
            richTextField("body", "Body", ".section-heading > p"),
            textField("ctaText", "CTA text", ".section-heading .button"),
            linkField("ctaHref", "CTA link", ".section-heading .button"),
            richTextField("programmeTitle", "Programme title", "h3"),
            richTextField("programmeBody", "Programme body", "article p"),
            imageField("programmeImage", "Programme image", "article img"),
            textField(
              "programmeLink",
              "Programme link text",
              ".programme-tile__link",
            ),
            ...homeSectionStyle({
              sectionKey: "programmes",
              selector: ".programmes-showcase",
              defaultBackgroundColor: "#081b3a",
            }),
            ...homeButtonStyle({
              sectionKey: "programmes-cta",
              selector: ".section-heading .button",
              defaultBackgroundColor: "rgba(255,255,255,0.04)",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "rgba(255,255,255,0.22)",
              defaultBorderWidth: 1,
            }),
            ...homeIconStyle({
              sectionKey: "programmes-icon",
              selector: ".programme-tile__icon",
              defaultIconColor: "#f3bf35",
              defaultIconBgColor: "rgba(6,18,42,0.58)",
              defaultIconBgOpacity: 100,
            }),
            ...homeTypography({ selector: ".programmes-showcase" }),
          ],
          repeatable: {
            itemSelector: ".programme-tile",
            labelSingular: "Programme card",
            labelPlural: "Programme cards",
          },
        },
        {
          id: "how-to-apply",
          label: "How To Apply",
          selector: ".home-apply",
          fields: [
            richTextField("eyebrow", "Eyebrow", ".home-apply__copy .eyebrow"),
            richTextField("title", "Title", ".home-apply__copy h2"),
            richTextField(
              "body",
              "Body",
              ".home-apply__copy > p:not(.eyebrow)",
            ),
            textField("stepNumber", "Step number", ".home-apply-step__number"),
            richTextField("stepTitle", "Step title", ".home-apply-step h3"),
            richTextField("stepBody", "Step body", ".home-apply-step p"),
            richTextField("noteTitle", "Note title", ".home-apply__note h3"),
            richTextField("noteBody", "Note body", ".home-apply__note ul", {
              target: "innerHTML",
            }),
            ...t3ButtonStyleFields({
              pageKey: "home",
              sectionKey: "apply-primary",
              selector: ".home-apply__actions .button--gold",
              defaultBackgroundColor: "#f3bf35",
              defaultTextColor: "#09142f",
              defaultBorderColor: "#f3bf35",
            }).map((f) => ({
              ...f,
              label: `Primary ${f.label}`,
              key: `primary${f.key.charAt(0).toUpperCase()}${f.key.slice(1)}`,
              uiGroup: "Primary CTA style",
            })),
            ...t3ButtonStyleFields({
              pageKey: "home",
              sectionKey: "apply-secondary",
              selector: ".home-apply__actions .button--navy",
              defaultBackgroundColor: "#122a56",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "#122a56",
            }).map((f) => ({
              ...f,
              label: `Secondary ${f.label}`,
              key: `secondary${f.key.charAt(0).toUpperCase()}${f.key.slice(1)}`,
              uiGroup: "Secondary CTA style",
            })),
            ...homeSectionStyle({
              sectionKey: "how-to-apply",
              selector: ".home-apply",
              defaultBackgroundColor: "#fff8ed",
            }),
            ...homeTypography({ selector: ".home-apply" }),
          ],
          repeatable: {
            itemSelector: ".home-apply-step",
            labelSingular: "Application step",
            labelPlural: "Application steps",
          },
        },
        {
          id: "gallery-preview",
          label: "Gallery Preview",
          selector: ".home-gallery",
          fields: [
            richTextField(
              "eyebrow",
              "Eyebrow",
              ".home-gallery__intro .eyebrow",
            ),
            richTextField("title", "Title", ".home-gallery__intro h2"),
            richTextField("body", "Body", ".home-gallery__copy"),
            imageField(
              "galleryImage",
              "Gallery image",
              ".home-gallery-card img",
            ),
            richTextField(
              "galleryLabel",
              "Gallery label",
              ".home-gallery-card__eyebrow",
            ),
            richTextField(
              "galleryCaption",
              "Gallery caption",
              ".home-gallery-card strong",
            ),
            richTextField(
              "galleryBody",
              "Gallery description",
              ".home-gallery-card__meta p",
            ),
            textField("ctaText", "CTA text", ".home-gallery__actions .button"),
            linkField("ctaHref", "CTA link", ".home-gallery__actions .button"),
            ...homeSectionStyle({
              sectionKey: "gallery-preview",
              selector: ".home-gallery",
              defaultBackgroundColor: "#ffffff",
            }),
            ...homeButtonStyle({
              sectionKey: "gallery-cta",
              selector: ".home-gallery__actions .button",
              defaultBackgroundColor: "#122a56",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "#122a56",
            }),
            ...homeTypography({ selector: ".home-gallery" }),
          ],
          repeatable: {
            itemSelector: ".home-gallery-card",
            labelSingular: "Gallery card",
            labelPlural: "Gallery cards",
          },
        },
      ],
    },
    {
      slug: "about",
      fileName: "about.html",
      title: "About",
      sections: [
        {
          id: "about-hero",
          label: "About Hero",
          selector: ".about-hero",
          fields: [
            richTextField("eyebrow", "Eyebrow", ".about-hero__copy .eyebrow"),
            richTextField("title", "Title", ".about-hero__copy h1"),
            imageField("image", "Hero image", ".about-hero__media img"),
            textField("ctaText", "CTA text", ".about-hero__button"),
            linkField("ctaHref", "CTA link", ".about-hero__button"),
            ...aboutSectionStyle({
              sectionKey: "hero",
              selector: ".about-hero",
              defaultBackgroundColor: "#07162f",
            }),
            ...aboutButtonStyle({
              sectionKey: "hero-cta",
              selector: ".about-hero__button",
              defaultBackgroundColor: "#f3bf35",
              defaultTextColor: "#09142f",
              defaultBorderColor: "#f3bf35",
            }),
            ...aboutTypography({ selector: ".about-hero" }),
          ],
        },
        {
          id: "story",
          label: "Story, Mission & Vision",
          selector: ".about-story",
          fields: [
            richTextField("eyebrow", "Eyebrow", ".about-story__eyebrow"),
            richTextField("title", "Title", ".about-story__title"),
            richTextField(
              "cardEyebrow",
              "Card eyebrow",
              ".about-story-card__eyebrow",
            ),
            richTextField("cardTitle", "Card title", ".about-story-card h3"),
            richTextField("cardBody", "Card body", ".about-story-card__copy"),
            textField("ctaText", "Read more button text", "button"),
            imageField("cardImage", "Card image", ".about-story-card img"),
            ...aboutSectionStyle({
              sectionKey: "story",
              selector: ".about-story",
              defaultBackgroundColor: "#ffffff",
            }),
            ...aboutButtonStyle({
              sectionKey: "story-cta",
              selector: ".about-story-card .button",
              defaultBackgroundColor: "#f3bf35",
              defaultTextColor: "#09142f",
              defaultBorderColor: "#f3bf35",
            }),
            ...aboutTypography({ selector: ".about-story" }),
          ],
          repeatable: {
            itemSelector: ".about-story-card",
            labelSingular: "Story card",
            labelPlural: "Story cards",
          },
        },
        {
          id: "story-modal",
          label: "Story Modal",
          selector: "#story-modal",
          fields: [
            richTextField("eyebrow", "Eyebrow", ".story-modal__eyebrow"),
            richTextField("title", "Modal title", ".story-modal__header h2"),
            richTextField("bodyHtml", "Full story", ".story-modal__content", {
              helpText:
                "Paste the full story here. The editor will shorten the visible story preview to fit this template.",
            }),
            ...aboutSectionStyle({
              sectionKey: "story-modal",
              selector: ".story-modal__panel",
              defaultBackgroundColor: "#ffffff",
            }),
            ...aboutTypography({ selector: ".story-modal__panel" }),
          ],
        },
        {
          id: "values",
          label: "Values",
          selector: ".about-values",
          fields: [
            richTextField("title", "Title", ".about-values__heading h2"),
            richTextField("valueTitle", "Value title", ".about-value-card h3"),
            richTextField("valueBody", "Value body", ".about-value-card p"),
            ...aboutSectionStyle({
              sectionKey: "values",
              selector: ".about-values",
              defaultBackgroundColor: "#f3bf35",
            }),
            ...aboutIconStyle({
              sectionKey: "values-icon",
              selector: ".about-icon",
              defaultIconColor: "#101f4a",
            }),
            ...aboutTypography({ selector: ".about-values" }),
          ],
          repeatable: {
            itemSelector: ".about-value-card",
            labelSingular: "Value card",
            labelPlural: "Value cards",
          },
        },
        {
          id: "approach",
          label: "Approach",
          selector: ".about-approach",
          fields: [
            richTextField(
              "eyebrow",
              "Eyebrow",
              ".about-approach__copy .eyebrow",
            ),
            richTextField("title", "Title", ".about-approach__copy h2"),
            richTextField(
              "body",
              "Body",
              ".about-approach__copy > p:not(.eyebrow)",
            ),
            richTextField("checklist", "Checklist", ".about-checks", {
              target: "innerHTML",
            }),
            imageField("image", "Image", ".about-approach__media img"),
            textField("ctaText", "CTA text", ".about-approach__copy .button"),
            linkField("ctaHref", "CTA link", ".about-approach__copy .button"),
            ...aboutSectionStyle({
              sectionKey: "approach",
              selector: ".about-approach",
              defaultBackgroundColor: "#ffffff",
            }),
            ...aboutButtonStyle({
              sectionKey: "approach-cta",
              selector: ".about-approach__copy .button",
              defaultBackgroundColor: "#122a56",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "#122a56",
            }),
            ...aboutTypography({ selector: ".about-approach" }),
          ],
        },
        {
          id: "impact",
          label: "Impact",
          selector: ".about-impact-band",
          fields: [
            richTextField(
              "eyebrow",
              "Eyebrow",
              ".about-impact-band__copy .eyebrow",
            ),
            richTextField("title", "Title", ".about-impact-band__copy h2"),
            textField("statValue", "Stat value", ".about-impact-stat strong"),
            textField("statLabel", "Stat label", ".about-impact-stat span"),
            imageField("image", "Image", ".about-impact-band__media img"),
            ...aboutSectionStyle({
              sectionKey: "impact",
              selector: ".about-impact-band",
              defaultBackgroundColor: "#07162f",
            }),
            ...aboutIconStyle({
              sectionKey: "impact-icon",
              selector: ".about-impact-stat__icon",
              defaultIconColor: "#f3bf35",
            }),
            ...aboutTypography({ selector: ".about-impact-band" }),
          ],
          repeatable: {
            itemSelector: ".about-impact-stat",
            labelSingular: "Impact stat",
            labelPlural: "Impact stats",
          },
        },
        {
          id: "tour-cta",
          label: "Tour CTA",
          selector: ".about-tour-band",
          fields: [
            richTextField("title", "Title", ".about-tour-band__copy h2"),
            richTextField("body", "Body", ".about-tour-band__copy p"),
            textField("ctaText", "CTA text", ".about-tour-band .button"),
            linkField("ctaHref", "CTA link", ".about-tour-band .button"),
            ...aboutSectionStyle({
              sectionKey: "tour-cta",
              selector: ".about-tour-band",
              defaultBackgroundColor: "#ffd154",
            }),
            ...aboutButtonStyle({
              sectionKey: "tour-cta-btn",
              selector: ".about-tour-band .button",
              defaultBackgroundColor: "#122a56",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "#122a56",
            }),
            ...aboutIconStyle({
              sectionKey: "tour-cta-icon",
              selector: ".about-tour-band__icon",
              defaultIconColor: "#101f4a",
            }),
            ...aboutTypography({ selector: ".about-tour-band" }),
          ],
        },
      ],
    },
    {
      slug: "gallery",
      fileName: "gallery.html",
      title: "Gallery",
      sections: [
        {
          id: "gallery-hero",
          label: "Gallery Hero",
          selector: ".gallery-hero-ref",
          fields: [
            richTextField("eyebrow", "Eyebrow", ".gallery-hero-ref__eyebrow"),
            richTextField("title", "Title", ".gallery-hero-ref__copy h1"),
            richTextField(
              "body",
              "Body",
              ".gallery-hero-ref__copy > p:not(.gallery-hero-ref__eyebrow)",
            ),
            imageField("image", "Hero image", ".gallery-hero-ref__media img"),
            ...gallerySectionStyle({
              sectionKey: "hero",
              selector: ".gallery-hero-ref",
              defaultBackgroundColor: "#081a38",
            }),
            ...galleryTypography({ selector: ".gallery-hero-ref" }),
          ],
        },
        {
          id: "gallery-filters",
          label: "Gallery Filters",
          selector: ".gallery-filter-bar",
          fields: [
            textField("filterLabel", "Filter label", ".filter-chip"),
            ...gallerySectionStyle({
              sectionKey: "filters",
              selector: ".gallery-filter-bar",
              defaultBackgroundColor: "#ffffff",
            }),
            ...galleryTypography({ selector: ".gallery-filter-bar" }),
          ],
          repeatable: {
            itemSelector: ".filter-chip",
            labelSingular: "Filter",
            labelPlural: "Filters",
          },
        },
        {
          id: "gallery-grid",
          label: "Gallery Grid",
          selector: ".gallery-gallery-ref",
          fields: [
            imageField("image", "Image", "img"),
            textField("caption", "Caption", "figcaption"),
            ...gallerySectionStyle({
              sectionKey: "grid",
              selector: ".gallery-gallery-ref",
              defaultBackgroundColor: "#ffffff",
            }),
          ],
          repeatable: {
            itemSelector: ".gallery-reference-card",
            labelSingular: "Gallery item",
            labelPlural: "Gallery items",
          },
        },
      ],
    },
    {
      slug: "contact",
      fileName: "contact.html",
      title: "Contact",
      sections: [
        {
          id: "contact-hero",
          label: "Contact Hero",
          selector: ".contact-hero",
          fields: [
            richTextField(
              "eyebrow",
              "Eyebrow",
              ".contact-hero__copy .contact-eyebrow",
            ),
            richTextField("title", "Title", ".contact-hero__copy h1"),
            richTextField(
              "body",
              "Body",
              ".contact-hero__copy > p:not(.contact-eyebrow)",
            ),
            imageField("image", "Hero image", ".contact-hero__art img"),
            textField(
              "primaryCtaText",
              "Apply button text",
              ".contact-button--dark",
            ),
            textField(
              "secondaryCtaText",
              "Call button text",
              ".contact-button--light",
            ),
            linkField(
              "secondaryCtaHref",
              "Call button link",
              ".contact-button--light",
            ),
            ...contactSectionStyle({
              sectionKey: "hero",
              selector: ".contact-hero",
              defaultBackgroundColor: "#061f44",
            }),
            ...t3ButtonStyleFields({
              pageKey: "contact",
              sectionKey: "hero-primary",
              selector: ".contact-button--dark",
              defaultBackgroundColor: "#ffc43d",
              defaultTextColor: "#061a3a",
              defaultBorderColor: "#ffc43d",
            }).map((f) => ({
              ...f,
              label: `Primary ${f.label}`,
              key: `primary${f.key.charAt(0).toUpperCase()}${f.key.slice(1)}`,
              uiGroup: "Primary CTA style",
            })),
            ...t3ButtonStyleFields({
              pageKey: "contact",
              sectionKey: "hero-secondary",
              selector: ".contact-button--light",
              defaultBackgroundColor: "rgba(255,255,255,0.1)",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "rgba(255,255,255,0.2)",
              defaultBorderWidth: 1,
            }).map((f) => ({
              ...f,
              label: `Secondary ${f.label}`,
              key: `secondary${f.key.charAt(0).toUpperCase()}${f.key.slice(1)}`,
              uiGroup: "Secondary CTA style",
            })),
            ...contactTypography({ selector: ".contact-hero" }),
          ],
        },
        {
          id: "contact-intro",
          label: "Contact Intro",
          selector: ".contact-intro",
          fields: [
            richTextField(
              "eyebrow",
              "Eyebrow",
              ".contact-intro > p:first-of-type",
            ),
            richTextField("title", "Title", ".contact-intro h2"),
            richTextField("body", "Body", ".contact-intro > p:last-of-type"),
            ...contactSectionStyle({
              sectionKey: "intro",
              selector: ".contact-intro",
              defaultBackgroundColor: "#ffffff",
            }),
            ...contactTypography({ selector: ".contact-intro" }),
          ],
        },
        {
          id: "contact-panel",
          label: "Contact Info",
          selector: ".contact-info-card",
          fields: [
            richTextField("title", "Title", ".contact-info-card h2"),
            richTextField(
              "infoContent",
              "Info content",
              ".contact-info-list article p",
            ),
            ...contactSectionStyle({
              sectionKey: "info-card",
              selector: ".contact-info-card",
              defaultBackgroundColor: "#061f44",
            }),
            ...contactIconStyle({
              sectionKey: "info-icon",
              selector: ".contact-icon",
              defaultIconColor: "#f1ad16",
              defaultIconBgColor: "#fffaf1",
              defaultIconBgOpacity: 100,
            }),
            ...contactTypography({ selector: ".contact-info-card" }),
          ],
          repeatable: {
            itemSelector: ".contact-info-list article",
            labelSingular: "Contact info",
            labelPlural: "Contact info items",
          },
        },
        {
          id: "contact-message",
          label: "Contact Message Form",
          selector: ".contact-message-card",
          fields: [
            colorField(
              "sectionBgColor",
              "Section background color",
              ".contact-message-card",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-3-contact-form-section-bg-color",
                defaultValue: "#ffffff",
                uiGroup: "Section background",
                uiOrder: 100,
              },
            ),
            numberField(
              "sectionBgOpacity",
              "Section background opacity",
              ".contact-message-card",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-3-contact-form-section-bg-opacity",
                defaultValue: 100,
                min: 0,
                max: 100,
                step: 1,
                unit: "%",
                uiGroup: "Section background",
                uiOrder: 101,
              },
            ),
            backgroundImageField(
              "sectionBgImage",
              "Section background image",
              ".contact-message-card",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-3-contact-form-section-bg-image",
                defaultValue: "",
                uiGroup: "Section background",
                uiOrder: 102,
                helpText:
                  "Use the image control to add, replace, or remove this section background image.",
              },
            ),
            textField(
              "sectionBgPosition",
              "Background image position",
              ".contact-message-card",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-3-contact-form-section-bg-position",
                defaultValue: "center center",
                uiGroup: "Section background",
                uiOrder: 103,
              },
            ),
            textField(
              "sectionBgSize",
              "Background image size",
              ".contact-message-card",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-3-contact-form-section-bg-size",
                defaultValue: "cover",
                helpText:
                  "Use cover, contain, or a custom CSS size such as 100% auto.",
                uiGroup: "Section background",
                uiOrder: 104,
              },
            ),
            richTextField("title", "Title", ".contact-form-card__header h2"),
            richTextField("body", "Body", ".contact-form-card__header p"),
            ...contactTypography({ selector: ".contact-message-card" }),
            linkField("formUrl", "School/contact Google Form URL", "iframe", {
              attribute: "src",
            }),
            textareaField(
              "formIframe",
              "School/contact iframe embed code",
              "iframe",
              {
                target: "attribute",
                attribute: "src",
                defaultValue: "",
                placeholder: formIframePlaceholder,
                helpText: formIframeHelpText,
              },
            ),
            textField("formTitle", "Iframe title", "iframe", {
              target: "attribute",
              attribute: "title",
            }),
          ],
        },
        {
          id: "admission-modal",
          label: "Admission Modal",
          selector: ".admission-modal",
          fields: [
            colorField(
              "sectionBgColor",
              "Section background color",
              ".admission-modal",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-3-admission-form-section-bg-color",
                defaultValue: "#ffffff",
                uiGroup: "Section background",
                uiOrder: 100,
              },
            ),
            numberField(
              "sectionBgOpacity",
              "Section background opacity",
              ".admission-modal",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-3-admission-form-section-bg-opacity",
                defaultValue: 100,
                min: 0,
                max: 100,
                step: 1,
                unit: "%",
                uiGroup: "Section background",
                uiOrder: 101,
              },
            ),
            backgroundImageField(
              "sectionBgImage",
              "Section background image",
              ".admission-modal",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-3-admission-form-section-bg-image",
                defaultValue: "",
                uiGroup: "Section background",
                uiOrder: 102,
                helpText:
                  "Use the image control to add, replace, or remove this section background image.",
              },
            ),
            textField(
              "sectionBgPosition",
              "Background image position",
              ".admission-modal",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-3-admission-form-section-bg-position",
                defaultValue: "center center",
                uiGroup: "Section background",
                uiOrder: 103,
              },
            ),
            textField(
              "sectionBgSize",
              "Background image size",
              ".admission-modal",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-3-admission-form-section-bg-size",
                defaultValue: "cover",
                helpText:
                  "Use cover, contain, or a custom CSS size such as 100% auto.",
                uiGroup: "Section background",
                uiOrder: 104,
              },
            ),
            richTextField("eyebrow", "Eyebrow", ".admission-modal__eyebrow"),
            richTextField("title", "Title", "#admission-modal-title"),
            ...contactTypography({ selector: ".admission-modal" }),
            linkField("formUrl", "Admission Google Form URL", "iframe", {
              attribute: "src",
            }),
            textareaField(
              "formIframe",
              "Admission iframe embed code",
              "iframe",
              {
                target: "attribute",
                attribute: "src",
                defaultValue: "",
                placeholder: formIframePlaceholder,
                helpText: formIframeHelpText,
              },
            ),
            textField("formTitle", "Iframe title", "iframe", {
              target: "attribute",
              attribute: "title",
            }),
          ],
        },
        {
          id: "contact-benefits",
          label: "Contact Benefits",
          selector: ".contact-benefits",
          fields: [
            richTextField("benefitTitle", "Benefit title", "article p strong"),
            richTextField("benefitBody", "Benefit body", "article p"),
            ...contactSectionStyle({
              sectionKey: "benefits",
              selector: ".contact-benefits",
              defaultBackgroundColor: "#fffdfb",
            }),
            ...contactIconStyle({
              sectionKey: "benefits-icon",
              selector: ".contact-benefits article > span",
              defaultIconColor: "#f1ad16",
            }),
            ...contactTypography({ selector: ".contact-benefits" }),
          ],
          repeatable: {
            itemSelector: "article",
            labelSingular: "Benefit",
            labelPlural: "Benefits",
          },
        },
        {
          id: "contact-footer-brand",
          label: "Contact Footer Brand",
          selector: ".contact-footer__brand",
          fields: [
            imageField("logo", "Logo", ".contact-footer__brand img"),
            textField("brandName", "Brand name", ".contact-brand strong"),
            textField("tagline", "Tagline", ".contact-brand small"),
            richTextField("body", "Body", ".contact-footer__brand > p"),
          ],
        },
        {
          id: "contact-footer-explore",
          label: "Contact Footer Explore",
          selector: ".contact-footer__grid > section:nth-of-type(2)",
          fields: [
            textField("title", "Title", "h3"),
            textField("linkLabel", "Link label", "a"),
          ],
          repeatable: {
            itemSelector: "a",
            labelSingular: "Explore link",
            labelPlural: "Explore links",
          },
        },
        {
          id: "contact-footer-details",
          label: "Contact Footer Details",
          selector: ".contact-footer__grid > section:nth-of-type(3)",
          fields: [
            textField("title", "Title", "h3"),
            richTextField("detail", "Detail", "p"),
          ],
          repeatable: {
            itemSelector: "p",
            labelSingular: "Contact detail",
            labelPlural: "Contact details",
          },
        },
        {
          id: "contact-footer",
          label: "Contact Footer",
          selector: ".contact-footer",
          fields: [
            richTextField(
              "copyright",
              "Copyright text",
              ".contact-footer__bottom p",
            ),
            ...contactSectionStyle({
              sectionKey: "footer",
              selector: ".contact-footer",
              defaultBackgroundColor: "#09142f",
              includeBackgroundImage: false,
            }),
          ],
        },
      ],
    },
  ],
} satisfies SchoolTemplateManifest;
