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

const fontImportHelpText =
  "Paste a Google Fonts embed URL to change the font for this section. Example: https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap";

const heroLeafBackgroundImage =
  "https://res.cloudinary.com/dxoorukfj/image/upload/v1778264512/leave2_oyfyvg.png";

// ── CSS variable naming ───────────────────────────────────────
function t5CssVar(pageKey: string, sectionKey: string, token: string) {
  return `--dexta-academy-5-${pageKey}-${sectionKey}-${token}`;
}

// ── Section background fields ─────────────────────────────────
function t5SectionStyleFields({
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
      cssVariable: t5CssVar(pageKey, sectionKey, "section-bg-color"),
      defaultValue: defaultBackgroundColor,
      uiGroup: "Section background",
      uiOrder: 100,
    }),
    numberField("sectionBgOpacity", "Section background opacity", selector, {
      target: "cssVariable",
      cssVariable: t5CssVar(pageKey, sectionKey, "section-bg-opacity"),
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
              cssVariable: t5CssVar(pageKey, sectionKey, "section-bg-image"),
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
              cssVariable: t5CssVar(pageKey, sectionKey, "section-bg-position"),
              defaultValue: "center center",
              uiGroup: "Section background",
              uiOrder: 103,
            },
          ),
          textField("sectionBgSize", "Background image size", selector, {
            target: "cssVariable",
            cssVariable: t5CssVar(pageKey, sectionKey, "section-bg-size"),
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

// ── Button style fields ───────────────────────────────────────
function t5ButtonStyleFields({
  pageKey,
  sectionKey,
  selector,
  defaultBackgroundColor = "#556b2f",
  defaultBackgroundOpacity = 100,
  defaultTextColor = "#ffffff",
  defaultBorderColor = "#556b2f",
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
      cssVariable: t5CssVar(pageKey, sectionKey, "button-bg-color"),
      defaultValue: defaultBackgroundColor,
      uiGroup: "Button style",
      uiOrder: 300,
    }),
    numberField("buttonBgOpacity", "Button background opacity", selector, {
      target: "cssVariable",
      cssVariable: t5CssVar(pageKey, sectionKey, "button-bg-opacity"),
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
      cssVariable: t5CssVar(pageKey, sectionKey, "button-text-color"),
      defaultValue: defaultTextColor,
      uiGroup: "Button style",
      uiOrder: 302,
    }),
    colorField("buttonBorderColor", "Button border color", selector, {
      target: "cssVariable",
      cssVariable: t5CssVar(pageKey, sectionKey, "button-border-color"),
      defaultValue: defaultBorderColor,
      uiGroup: "Button style",
      uiOrder: 303,
    }),
    numberField("buttonBorderWidth", "Button border width", selector, {
      target: "cssVariable",
      cssVariable: t5CssVar(pageKey, sectionKey, "button-border-width"),
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

// ── Icon style fields (section-level) ─────────────────────────
function t5IconStyleFields({
  pageKey,
  sectionKey,
  selector,
  defaultIconColor = "#556b2f",
  defaultIconBgColor = "#ffffff",
  defaultIconBgOpacity = 0,
  defaultIconBorderColor = "#556b2f",
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
    colorField("iconColor", "Icon color", selector, {
      target: "cssVariable",
      cssVariable: t5CssVar(pageKey, sectionKey, "icon-color"),
      defaultValue: defaultIconColor,
      uiGroup: "Icon style",
      uiOrder: 399,
    }),
    backgroundImageField("iconImage", "Upload icon image", selector, {
      target: "cssVariable",
      cssVariable: t5CssVar(pageKey, sectionKey, "icon-image"),
      defaultValue: "",
      helpText:
        "Upload a custom icon image (PNG, SVG) to replace the default icon.",
      uiGroup: "Icon style",
      uiOrder: 400,
    }),
    colorField("iconBgColor", "Icon background color", selector, {
      target: "cssVariable",
      cssVariable: t5CssVar(pageKey, sectionKey, "icon-bg-color"),
      defaultValue: defaultIconBgColor,
      uiGroup: "Icon style",
      uiOrder: 401,
    }),
    numberField("iconBgOpacity", "Icon background opacity", selector, {
      target: "cssVariable",
      cssVariable: t5CssVar(pageKey, sectionKey, "icon-bg-opacity"),
      defaultValue: defaultIconBgOpacity,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      uiGroup: "Icon style",
      uiOrder: 402,
    }),
    colorField("iconBorderColor", "Icon border color", selector, {
      target: "cssVariable",
      cssVariable: t5CssVar(pageKey, sectionKey, "icon-border-color"),
      defaultValue: defaultIconBorderColor,
      uiGroup: "Icon style",
      uiOrder: 403,
    }),
    numberField("iconBorderWidth", "Icon border width", selector, {
      target: "cssVariable",
      cssVariable: t5CssVar(pageKey, sectionKey, "icon-border-width"),
      defaultValue: defaultIconBorderWidth,
      min: 0,
      max: 12,
      step: 1,
      unit: "px",
      helpText: "Set to 0 to remove the icon border.",
      uiGroup: "Icon style",
      uiOrder: 404,
    }),
  ];
}

// ── Typography / font import ──────────────────────────────────
function t5TypographyFields({
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

// ── Per-page shorthand wrappers ───────────────────────────────
function homeSectionStyle(
  opts: Omit<Parameters<typeof t5SectionStyleFields>[0], "pageKey">,
) {
  return t5SectionStyleFields({ pageKey: "home", ...opts });
}
function homeButtonStyle(
  opts: Omit<Parameters<typeof t5ButtonStyleFields>[0], "pageKey">,
) {
  return t5ButtonStyleFields({ pageKey: "home", ...opts });
}
function homeIconStyle(
  opts: Omit<Parameters<typeof t5IconStyleFields>[0], "pageKey">,
) {
  return t5IconStyleFields({ pageKey: "home", ...opts });
}
function aboutSectionStyle(
  opts: Omit<Parameters<typeof t5SectionStyleFields>[0], "pageKey">,
) {
  return t5SectionStyleFields({ pageKey: "about", ...opts });
}
function aboutButtonStyle(
  opts: Omit<Parameters<typeof t5ButtonStyleFields>[0], "pageKey">,
) {
  return t5ButtonStyleFields({ pageKey: "about", ...opts });
}
function campusSectionStyle(
  opts: Omit<Parameters<typeof t5SectionStyleFields>[0], "pageKey">,
) {
  return t5SectionStyleFields({ pageKey: "campus-life", ...opts });
}
function _campusButtonStyle(
  opts: Omit<Parameters<typeof t5ButtonStyleFields>[0], "pageKey">,
) {
  return t5ButtonStyleFields({ pageKey: "campus-life", ...opts });
}
function gallerySectionStyle(
  opts: Omit<Parameters<typeof t5SectionStyleFields>[0], "pageKey">,
) {
  return t5SectionStyleFields({ pageKey: "gallery", ...opts });
}
function contactSectionStyle(
  opts: Omit<Parameters<typeof t5SectionStyleFields>[0], "pageKey">,
) {
  return t5SectionStyleFields({ pageKey: "contact", ...opts });
}
function _contactButtonStyle(
  opts: Omit<Parameters<typeof t5ButtonStyleFields>[0], "pageKey">,
) {
  return t5ButtonStyleFields({ pageKey: "contact", ...opts });
}

// ── Page hero factory (each page gets its own CSS variables) ──
function makePageHero(pageKey: string) {
  return {
    id: "page-hero",
    label: "Page Hero",
    selector: ".page-hero",
    fields: [
      ...t5SectionStyleFields({
        pageKey,
        sectionKey: "hero",
        selector: ".page-hero",
        defaultBackgroundColor: "#31401c",
      }),
      ...t5ButtonStyleFields({
        pageKey,
        sectionKey: "hero",
        selector: ".page-hero",
        defaultBackgroundColor: "#556b2f",
        defaultTextColor: "#ffffff",
        defaultBorderColor: "#556b2f",
      }),
      ...t5TypographyFields({ selector: ".page-hero" }),
      textField("eyebrow", "Eyebrow", ".page-kicker"),
      textField("title", "Title", "h1"),
      textareaField(
        "body",
        "Body",
        ".page-hero__content > p:not(.page-kicker), .page-hero__stack > p:not(.page-kicker)",
      ),
      imageField("image", "Hero image", ".page-hero__media img"),
      textField("primaryCtaText", "Primary CTA text", ".page-actions .button"),
      linkField("primaryCtaHref", "Primary CTA link", ".page-actions .button"),
      textField(
        "secondaryCtaText",
        "Secondary CTA text",
        ".page-actions .page-link",
      ),
      linkField(
        "secondaryCtaHref",
        "Secondary CTA link",
        ".page-actions .page-link",
      ),
    ],
  };
}

const sharedFooterFields = [
  textField("brandName", "Brand name", ".site-footer .brand__text strong"),
  textField("brandTagline", "Brand tagline", ".site-footer .brand__text span"),
  textareaField(
    "brandDescription",
    "Brand description",
    ".site-footer__brand > p",
  ),
  textField(
    "socialFacebookText",
    "Facebook social label",
    ".social-links a:nth-of-type(1)",
  ),
  linkField(
    "socialFacebookHref",
    "Facebook social link",
    ".social-links a:nth-of-type(1)",
  ),
  textField(
    "socialInstagramText",
    "Instagram social label",
    ".social-links a:nth-of-type(2)",
  ),
  linkField(
    "socialInstagramHref",
    "Instagram social link",
    ".social-links a:nth-of-type(2)",
  ),
  textField(
    "socialLinkedInText",
    "LinkedIn social label",
    ".social-links a:nth-of-type(3)",
  ),
  linkField(
    "socialLinkedInHref",
    "LinkedIn social link",
    ".social-links a:nth-of-type(3)",
  ),
  textField(
    "socialYoutubeText",
    "YouTube social label",
    ".social-links a:nth-of-type(4)",
  ),
  linkField(
    "socialYoutubeHref",
    "YouTube social link",
    ".social-links a:nth-of-type(4)",
  ),
  textField(
    "quickLinksTitle",
    "Quick links title",
    ".site-footer__grid > div:nth-of-type(2) h3",
  ),
  textField(
    "quickLink1Text",
    "Quick link 1 label",
    ".site-footer__grid > div:nth-of-type(2) a:nth-of-type(1)",
  ),
  linkField(
    "quickLink1Href",
    "Quick link 1 URL",
    ".site-footer__grid > div:nth-of-type(2) a:nth-of-type(1)",
  ),
  textField(
    "quickLink2Text",
    "Quick link 2 label",
    ".site-footer__grid > div:nth-of-type(2) a:nth-of-type(2)",
  ),
  linkField(
    "quickLink2Href",
    "Quick link 2 URL",
    ".site-footer__grid > div:nth-of-type(2) a:nth-of-type(2)",
  ),
  textField(
    "quickLink3Text",
    "Quick link 3 label",
    ".site-footer__grid > div:nth-of-type(2) a:nth-of-type(3)",
  ),
  linkField(
    "quickLink3Href",
    "Quick link 3 URL",
    ".site-footer__grid > div:nth-of-type(2) a:nth-of-type(3)",
  ),
  textField(
    "quickLink4Text",
    "Quick link 4 label",
    ".site-footer__grid > div:nth-of-type(2) a:nth-of-type(4)",
  ),
  linkField(
    "quickLink4Href",
    "Quick link 4 URL",
    ".site-footer__grid > div:nth-of-type(2) a:nth-of-type(4)",
  ),
  textField(
    "quickLink5Text",
    "Quick link 5 label",
    ".site-footer__grid > div:nth-of-type(2) a:nth-of-type(5)",
  ),
  linkField(
    "quickLink5Href",
    "Quick link 5 URL",
    ".site-footer__grid > div:nth-of-type(2) a:nth-of-type(5)",
  ),
  textField(
    "quickLink6Text",
    "Quick link 6 label",
    ".site-footer__grid > div:nth-of-type(2) a:nth-of-type(6)",
  ),
  linkField(
    "quickLink6Href",
    "Quick link 6 URL",
    ".site-footer__grid > div:nth-of-type(2) a:nth-of-type(6)",
  ),
  textField(
    "contactTitle",
    "Contact title",
    ".site-footer__grid > div:nth-of-type(3) h3",
  ),
  textareaField(
    "address",
    "Address",
    ".site-footer__grid > div:nth-of-type(3) p:nth-of-type(1)",
  ),
  textField(
    "phone",
    "Phone",
    ".site-footer__grid > div:nth-of-type(3) p:nth-of-type(2)",
  ),
  textField(
    "email",
    "Email",
    ".site-footer__grid > div:nth-of-type(3) p:nth-of-type(3)",
  ),
  textareaField("copyright", "Copyright", ".site-footer__bottom > p"),
];

export const dextaAcademy5Manifest = {
  templateSlug: "dexta-academy-5",
  templateName: "Dexta Academy 5",
  sourceDir: "src/app/(public)/dexta-academy-5",
  entryFile: "index.html",
  previewPath: "/dexta-academy-5/index.html",
  assetInventory: {
    directories: [],
    stylesheets: ["style.css"],
    scripts: ["script.js"],
  },
  sharedSections: [
    {
      id: "site-header",
      label: "Header",
      selector: ".site-header",
      fields: [
        ...t5SectionStyleFields({
          pageKey: "shared",
          sectionKey: "header",
          selector: ".site-header",
          defaultBackgroundColor: "#ffffff",
        }),
        ...t5ButtonStyleFields({
          pageKey: "shared",
          sectionKey: "header-cta",
          selector: ".site-header",
          defaultBackgroundColor: "#f8b533",
          defaultTextColor: "#0e1d45",
          defaultBorderColor: "#f8b533",
        }),
        colorField("navLinkColor", "Nav link color", ".site-header", {
          target: "cssVariable",
          cssVariable: "--dexta-academy-5-shared-header-nav-link-color",
          defaultValue: "#0e1d45",
          uiGroup: "Nav link style",
          uiOrder: 350,
        }),
        colorField("navBorderColor", "Navbar border color", ".site-header", {
          target: "cssVariable",
          cssVariable: "--dexta-academy-5-shared-header-nav-border-color",
          defaultValue: "transparent",
          uiGroup: "Nav link style",
          uiOrder: 351,
        }),
        ...t5TypographyFields({ selector: ".site-header" }),
        textField(
          "navHomeText",
          "Home nav label",
          ".site-nav a:nth-of-type(1)",
        ),
        linkField("navHomeHref", "Home nav link", ".site-nav a:nth-of-type(1)"),
        textField(
          "navAboutText",
          "About nav label",
          ".site-nav a:nth-of-type(2)",
        ),
        linkField(
          "navAboutHref",
          "About nav link",
          ".site-nav a:nth-of-type(2)",
        ),
        textField(
          "navGalleryText",
          "Gallery nav label",
          ".site-nav a:nth-of-type(3)",
        ),
        linkField(
          "navGalleryHref",
          "Gallery nav link",
          ".site-nav a:nth-of-type(3)",
        ),
        textField(
          "navAdmissionsText",
          "Admissions nav label",
          ".site-nav a:nth-of-type(4)",
        ),
        linkField(
          "navAdmissionsHref",
          "Admissions nav link",
          ".site-nav a:nth-of-type(4)",
        ),
        textField(
          "navSchoolLifeText",
          "School life nav label",
          ".site-nav a:nth-of-type(5)",
        ),
        linkField(
          "navSchoolLifeHref",
          "School life nav link",
          ".site-nav a:nth-of-type(5)",
        ),
        textField(
          "navContactText",
          "Contact nav label",
          ".site-nav a:nth-of-type(6)",
        ),
        linkField(
          "navContactHref",
          "Contact nav link",
          ".site-nav a:nth-of-type(6)",
        ),
        textField("portalText", "Portal label", ".header-portal"),
        linkField("portalHref", "Portal link", ".header-portal"),
        textField("applyText", "Apply button text", ".header-cta"),
        linkField("applyHref", "Apply button link", ".header-cta"),
      ],
    },
    {
      id: "site-footer",
      label: "Footer",
      selector: ".site-footer",
      fields: [
        ...t5SectionStyleFields({
          pageKey: "shared",
          sectionKey: "footer",
          selector: ".site-footer",
          defaultBackgroundColor: "#31401c",
        }),
        ...t5ButtonStyleFields({
          pageKey: "shared",
          sectionKey: "footer-newsletter",
          selector: ".site-footer",
          defaultBackgroundColor: "#d4a437",
          defaultTextColor: "#0e1d45",
          defaultBorderColor: "#d4a437",
        }),
        ...t5TypographyFields({ selector: ".site-footer" }),
        ...sharedFooterFields,
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
            ...homeSectionStyle({
              sectionKey: "hero",
              selector: ".hero",
              defaultBackgroundColor: "#ffffff",
            }),
            ...homeButtonStyle({
              sectionKey: "hero",
              selector: ".hero",
              defaultBackgroundColor: "#556b2f",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "#556b2f",
            }),
            ...homeIconStyle({
              sectionKey: "hero",
              selector: ".hero",
              defaultIconColor: "#556b2f",
              defaultIconBgColor: "#f3fae3",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "#f3fae3",
            }),
            ...t5TypographyFields({ selector: ".hero" }),
            backgroundImageField(
              "backgroundImage",
              "Leaf background image",
              ".hero",
              {
                defaultValue: heroLeafBackgroundImage,
                helpText:
                  "Overrides the leaf background used behind the homepage hero.",
              },
            ),
            textareaField("eyebrow", "Eyebrow", ".hero__eyebrow", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("title", "Title", ".hero__title", {
              type: "richText",
              target: "innerHTML",
            }),
            imageField(
              "studentImage",
              "Student image",
              ".hero__image-wrap img",
            ),
            textField(
              "studentImageAlt",
              "Student image alt text",
              ".hero__image-wrap img",
              {
                target: "attribute",
                attribute: "alt",
              },
            ),
            textField(
              "ctaText",
              "CTA text",
              ".hero__actions .button--primary > span:nth-of-type(1)",
            ),
            linkField("ctaHref", "CTA link", ".hero__actions .button--primary"),
          ],
        },
        {
          id: "hero-stats",
          label: "Hero Stats",
          selector: ".hero__visual",
          fields: [
            textField("value", "Stat value", ".stat-card strong"),
            textField("label", "Stat label", ".stat-card span"),
          ],
          repeatable: {
            itemSelector: ".stat-card",
            labelSingular: "Hero stat",
            labelPlural: "Hero stats",
          },
        },
        {
          id: "about-preview",
          label: "About Preview",
          selector: ".about-preview",
          fields: [
            ...homeSectionStyle({
              sectionKey: "about-preview",
              selector: ".about-preview",
              defaultBackgroundColor: "#f3fae3",
            }),
            ...homeButtonStyle({
              sectionKey: "about-preview",
              selector: ".about-preview",
              defaultBackgroundColor: "#556b2f",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "#556b2f",
            }),
            ...t5TypographyFields({ selector: ".about-preview" }),
            textField("eyebrow", "Eyebrow", ".about-preview__eyebrow"),
            textField(
              "titleLine1",
              "Title line 1",
              ".about-preview__content h2 span:nth-of-type(1)",
            ),
            textField(
              "titleLine2",
              "Title line 2",
              ".about-preview__content h2 span:nth-of-type(2)",
            ),
            textareaField("body", "Body", ".about-preview__lead"),
            textField("ctaText", "CTA text", ".about-preview__button span"),
            linkField("ctaHref", "CTA link", ".about-preview__button"),
            imageField("image", "Image", ".about-preview__media img"),
            textField(
              "imageAlt",
              "Image alt text",
              ".about-preview__media img",
              {
                target: "attribute",
                attribute: "alt",
              },
            ),
            textareaField("quote", "Quote", ".about-preview__quote p"),
            textField(
              "quoteAuthor",
              "Quote author",
              ".about-preview__quote cite",
            ),
            colorField(
              "quoteBgColor",
              "Quote background color",
              ".about-preview",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-5-home-about-preview-quote-bg-color",
                defaultValue: "#31401c",
                uiGroup: "Quote style",
                uiOrder: 500,
              },
            ),
          ],
        },
        {
          id: "programmes",
          label: "Programmes",
          selector: ".programmes-section",
          fields: [
            ...homeSectionStyle({
              sectionKey: "programmes",
              selector: ".programmes-section",
              defaultBackgroundColor: "#ffffff",
            }),
            ...homeButtonStyle({
              sectionKey: "programmes",
              selector: ".programmes-section",
              defaultBackgroundColor: "#556b2f",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "#556b2f",
            }),
            ...homeIconStyle({
              sectionKey: "programmes",
              selector: ".programmes-section",
              defaultIconColor: "#556b2f",
              defaultIconBgColor: "#f3fae3",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "#f3fae3",
            }),
            ...t5TypographyFields({ selector: ".programmes-section" }),
            textField("eyebrow", "Eyebrow", ".section-heading > p"),
            textField("title", "Title", ".section-heading h2"),
            textField(
              "programmeTitle",
              "Programme title",
              ".programme-card h3",
            ),
            textareaField(
              "programmeBody",
              "Programme body",
              ".programme-card p",
            ),
            textField(
              "programmeLinkText",
              "Programme link text",
              ".programme-card a",
            ),
            linkField(
              "programmeLinkHref",
              "Programme link URL",
              ".programme-card a",
            ),
            textField("ctaText", "Section CTA text", ".section-action .button"),
            linkField("ctaHref", "Section CTA link", ".section-action .button"),
          ],
          repeatable: {
            itemSelector: ".programme-card",
            labelSingular: "Programme card",
            labelPlural: "Programme cards",
          },
        },
        {
          id: "approach",
          label: "Approach",
          selector: ".approach-section",
          fields: [
            ...homeSectionStyle({
              sectionKey: "approach",
              selector: ".approach-section",
              defaultBackgroundColor: "#31401c",
            }),
            ...homeButtonStyle({
              sectionKey: "approach",
              selector: ".approach-section",
              defaultBackgroundColor: "#556b2f",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "#556b2f",
            }),
            ...homeIconStyle({
              sectionKey: "approach",
              selector: ".approach-section",
              defaultIconColor: "#ffffff",
              defaultIconBgColor: "#ffffff",
              defaultIconBgOpacity: 0,
              defaultIconBorderColor: "#ffffff",
            }),
            ...t5TypographyFields({ selector: ".approach-section" }),
            textField("eyebrow", "Eyebrow", ".section-kicker"),
            textField("title", "Title", ".approach-section__content h2"),
            textareaField(
              "body",
              "Body",
              ".approach-section__content > p:not(.section-kicker)",
            ),
            textField(
              "ctaText",
              "CTA text",
              ".approach-section__content .button",
            ),
            linkField(
              "ctaHref",
              "CTA link",
              ".approach-section__content .button",
            ),
            imageField("image", "Image", ".approach-section__media img"),
            textField(
              "imageAlt",
              "Image alt text",
              ".approach-section__media img",
              {
                target: "attribute",
                attribute: "alt",
              },
            ),
          ],
        },
        {
          id: "approach-points",
          label: "Approach Points",
          selector: ".approach-section__content ul",
          fields: [
            colorField(
              "pointColor",
              "Point text color",
              ".approach-section__content ul",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-5-home-approach-point-color",
                defaultValue: "#ffffff",
                uiGroup: "Point style",
                uiOrder: 100,
              },
            ),
            textField("point", "Point", "li"),
          ],
          repeatable: {
            itemSelector: "li",
            labelSingular: "Approach point",
            labelPlural: "Approach points",
          },
        },
        {
          id: "approach-badges",
          label: "Approach Badges",
          selector: ".approach-badges",
          fields: [
            colorField(
              "badgeBgColor",
              "Badge background color",
              ".approach-badges",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-5-home-approach-badge-bg-color",
                defaultValue: "#d4a437",
                uiGroup: "Badge style",
                uiOrder: 100,
              },
            ),
            colorField(
              "badgeTextColor",
              "Badge text color",
              ".approach-badges",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-5-home-approach-badge-text-color",
                defaultValue: "#fcfcfa",
                uiGroup: "Badge style",
                uiOrder: 101,
              },
            ),
            textField("label", "Badge label", "span"),
          ],
          repeatable: {
            itemSelector: "span",
            labelSingular: "Approach badge",
            labelPlural: "Approach badges",
          },
        },
        {
          id: "testimonials",
          label: "Testimonials",
          selector: ".testimonials-section",
          fields: [
            ...homeSectionStyle({
              sectionKey: "testimonials",
              selector: ".testimonials-section",
              defaultBackgroundColor: "#ffffff",
            }),
            ...t5TypographyFields({ selector: ".testimonials-section" }),
            textField("eyebrow", "Eyebrow", ".section-heading > p"),
            textField("title", "Title", ".section-heading h2"),
            textareaField("quote", "Quote", ".testimonial-card > p"),
            imageField("image", "Author image", ".testimonial-card img"),
            textField(
              "imageAlt",
              "Author image alt text",
              ".testimonial-card img",
              {
                target: "attribute",
                attribute: "alt",
              },
            ),
            textField("author", "Author", ".testimonial-card strong"),
            textField("meta", "Author meta", ".testimonial-card small"),
          ],
          repeatable: {
            itemSelector: ".testimonial-card",
            labelSingular: "Testimonial",
            labelPlural: "Testimonials",
          },
        },
        {
          id: "admissions-journey",
          label: "Admissions Journey",
          selector: ".journey-section",
          fields: [
            ...homeSectionStyle({
              sectionKey: "admissions-journey",
              selector: ".journey-section",
              defaultBackgroundColor: "#ffffff",
            }),
            ...homeButtonStyle({
              sectionKey: "admissions-journey",
              selector: ".journey-section",
              defaultBackgroundColor: "#31401c",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "#31401c",
            }),
            ...homeIconStyle({
              sectionKey: "admissions-journey",
              selector: ".journey-section",
              defaultIconColor: "#556b2f",
              defaultIconBgColor: "#f3fae3",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "#f3fae3",
            }),
            colorField(
              "containerBgColor",
              "Container background color",
              ".journey-section",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-5-home-admissions-journey-container-bg-color",
                defaultValue: "#31401c",
                uiGroup: "Container style",
                uiOrder: 150,
              },
            ),
            ...t5TypographyFields({ selector: ".journey-section" }),
            textField("title", "Title", ".journey-card__intro h2"),
            textareaField("body", "Body", ".journey-card__intro p"),
            textField("actionTitle", "Action title", ".journey-action strong"),
            textareaField("actionBody", "Action body", ".journey-action small"),
            linkField("actionHref", "Action link", ".journey-action"),
          ],
          repeatable: {
            itemSelector: ".journey-action",
            labelSingular: "Journey action",
            labelPlural: "Journey actions",
          },
        },
        {
          id: "admission-modal",
          label: "Admission Modal",
          selector:
            ".admission-modal:not(.contact-modal) .admission-modal__dialog",
          fields: [
            colorField(
              "sectionBgColor",
              "Section background color",
              ".admission-modal:not(.contact-modal) .admission-modal__dialog",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-5-admission-form-section-bg-color",
                defaultValue: "#ffffff",
                uiGroup: "Section background",
                uiOrder: 100,
              },
            ),
            numberField(
              "sectionBgOpacity",
              "Section background opacity",
              ".admission-modal:not(.contact-modal) .admission-modal__dialog",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-5-admission-form-section-bg-opacity",
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
              ".admission-modal:not(.contact-modal) .admission-modal__dialog",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-5-admission-form-section-bg-image",
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
              ".admission-modal:not(.contact-modal) .admission-modal__dialog",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-5-admission-form-section-bg-position",
                defaultValue: "center center",
                uiGroup: "Section background",
                uiOrder: 103,
              },
            ),
            textField(
              "sectionBgSize",
              "Background image size",
              ".admission-modal:not(.contact-modal) .admission-modal__dialog",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-5-admission-form-section-bg-size",
                defaultValue: "cover",
                helpText:
                  "Use cover, contain, or a custom CSS size such as 100% auto.",
                uiGroup: "Section background",
                uiOrder: 104,
              },
            ),
            textareaField("eyebrow", "Eyebrow", ".admission-modal__header p", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("title", "Title", ".admission-modal__header h2", {
              type: "richText",
              target: "innerHTML",
            }),
            linkField(
              "fontStylesheetUrl",
              "Google Fonts stylesheet URL",
              ".admission-modal:not(.contact-modal) .admission-modal__dialog",
              {
                target: "attribute",
                attribute: "data-dexta-font-stylesheet",
                defaultValue: "",
                placeholder:
                  "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
                helpText: fontImportHelpText,
                uiGroup: "Rich text fonts",
                uiOrder: 200,
              },
            ),
            linkField("formUrl", "Google Form URL", "iframe", {
              attribute: "src",
            }),
            textareaField(
              "formIframe",
              "Google Form iframe embed code",
              "iframe",
              {
                target: "attribute",
                attribute: "src",
                defaultValue: "",
                placeholder:
                  '<iframe src="https://docs.google.com/forms/..." width="640" height="1602" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>',
                helpText:
                  "Paste the full Google Forms iframe embed code. Leave blank to use the Google Form URL field.",
              },
            ),
            textField("formTitle", "Iframe title", "iframe", {
              target: "attribute",
              attribute: "title",
            }),
          ],
        },
        {
          id: "contact-modal",
          label: "Contact Modal",
          selector: ".contact-modal .admission-modal__dialog",
          fields: [
            colorField(
              "sectionBgColor",
              "Section background color",
              ".contact-modal .admission-modal__dialog",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-5-contact-modal-section-bg-color",
                defaultValue: "#ffffff",
                uiGroup: "Section background",
                uiOrder: 100,
              },
            ),
            numberField(
              "sectionBgOpacity",
              "Section background opacity",
              ".contact-modal .admission-modal__dialog",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-5-contact-modal-section-bg-opacity",
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
              ".contact-modal .admission-modal__dialog",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-5-contact-modal-section-bg-image",
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
              ".contact-modal .admission-modal__dialog",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-5-contact-modal-section-bg-position",
                defaultValue: "center center",
                uiGroup: "Section background",
                uiOrder: 103,
              },
            ),
            textField(
              "sectionBgSize",
              "Background image size",
              ".contact-modal .admission-modal__dialog",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-5-contact-modal-section-bg-size",
                defaultValue: "cover",
                helpText:
                  "Use cover, contain, or a custom CSS size such as 100% auto.",
                uiGroup: "Section background",
                uiOrder: 104,
              },
            ),
            textareaField("eyebrow", "Eyebrow", ".admission-modal__header p", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("title", "Title", ".admission-modal__header h2", {
              type: "richText",
              target: "innerHTML",
            }),
            linkField(
              "fontStylesheetUrl",
              "Google Fonts stylesheet URL",
              ".contact-modal .admission-modal__dialog",
              {
                target: "attribute",
                attribute: "data-dexta-font-stylesheet",
                defaultValue: "",
                placeholder:
                  "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
                helpText: fontImportHelpText,
                uiGroup: "Rich text fonts",
                uiOrder: 200,
              },
            ),
            linkField("formUrl", "Google Form URL", "iframe", {
              attribute: "src",
            }),
            textareaField(
              "formIframe",
              "Google Form iframe embed code",
              "iframe",
              {
                target: "attribute",
                attribute: "src",
                defaultValue: "",
                placeholder:
                  '<iframe src="https://docs.google.com/forms/..." width="640" height="1602" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>',
                helpText:
                  "Paste the full Google Forms iframe embed code. Leave blank to use the Google Form URL field.",
              },
            ),
            textField("formTitle", "Iframe title", "iframe", {
              target: "attribute",
              attribute: "title",
            }),
          ],
        },
      ],
    },
    {
      slug: "about",
      fileName: "about.html",
      title: "About",
      sections: [
        makePageHero("about"),
        {
          id: "stats",
          label: "Stats",
          selector: ".page-stat-grid",
          fields: [
            ...aboutSectionStyle({
              sectionKey: "stats",
              selector: ".page-stat-grid",
              defaultBackgroundColor: "#ffffff",
            }),
            ...t5IconStyleFields({
              pageKey: "about",
              sectionKey: "stats",
              selector: ".page-stat-grid",
              defaultIconColor: "#31401c",
              defaultIconBgColor: "#ffffff",
              defaultIconBgOpacity: 0,
              defaultIconBorderColor: "#31401c",
            }),
            colorField("textColor", "Stat text color", ".page-stat-grid", {
              target: "cssVariable",
              cssVariable: "--dexta-academy-5-about-stats-text-color",
              defaultValue: "#0e1d45",
              uiGroup: "Text style",
              uiOrder: 350,
            }),
            colorField("valueColor", "Stat value color", ".page-stat-grid", {
              target: "cssVariable",
              cssVariable: "--dexta-academy-5-about-stats-value-color",
              defaultValue: "#31401c",
              uiGroup: "Text style",
              uiOrder: 351,
            }),
            ...t5TypographyFields({ selector: ".page-stat-grid" }),
            textField("value", "Stat value", ".page-stat strong"),
            textField("label", "Stat label", ".page-stat span"),
          ],
          repeatable: {
            itemSelector: ".page-stat",
            labelSingular: "Stat",
            labelPlural: "Stats",
          },
        },
        {
          id: "story",
          label: "Story",
          selector: ".page-section--olive .split-feature",
          fields: [
            ...aboutSectionStyle({
              sectionKey: "story",
              selector: ".page-section--olive",
              defaultBackgroundColor: "#31401c",
            }),
            ...aboutButtonStyle({
              sectionKey: "story",
              selector: ".page-section--olive",
              defaultBackgroundColor: "#d4a437",
              defaultTextColor: "#0e1d45",
              defaultBorderColor: "#d4a437",
            }),
            ...t5TypographyFields({ selector: ".page-section--olive" }),
            textField("eyebrow", "Eyebrow", ".page-kicker"),
            textField("title", "Title", "h2"),
            textareaField(
              "body1",
              "Body paragraph 1",
              "div:nth-of-type(2) p:nth-of-type(1)",
            ),
            textareaField(
              "body2",
              "Body paragraph 2",
              "div:nth-of-type(2) p:nth-of-type(2)",
            ),
            textField("ctaText", "Read more button text", ".story-read-more"),
          ],
        },
        {
          id: "values",
          label: "Values",
          selector: ".value-grid",
          fields: [
            ...aboutSectionStyle({
              sectionKey: "values",
              selector: ".value-grid",
              defaultBackgroundColor: "#ffffff",
            }),
            ...t5TypographyFields({ selector: ".value-grid" }),
            textField("number", "Value number", ".value-card span"),
            textareaField("title", "Value title", ".value-card h3", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("body", "Value body", ".value-card p", {
              type: "richText",
              target: "innerHTML",
            }),
          ],
          repeatable: {
            itemSelector: ".value-card",
            labelSingular: "Value",
            labelPlural: "Values",
          },
        },
        {
          id: "story-modal",
          label: "Story Modal",
          selector: ".story-modal .admission-modal__dialog",
          fields: [
            ...aboutSectionStyle({
              sectionKey: "story-modal",
              selector: ".story-modal .admission-modal__dialog",
              defaultBackgroundColor: "#ffffff",
            }),
            ...t5TypographyFields({
              selector: ".story-modal .admission-modal__dialog",
            }),
            textField("eyebrow", "Eyebrow", ".admission-modal__header p"),
            textField("title", "Title", ".admission-modal__header h2"),
            textareaField("bodyHtml", "Full story", ".story-modal__body", {
              type: "richText",
              target: "innerHTML",
              helpText:
                "Paste the full story here. The editor will shorten the visible story preview to fit this template.",
            }),
          ],
        },
      ],
    },
    {
      slug: "campus-life",
      fileName: "campus-life.html",
      title: "School Life",
      sections: [
        makePageHero("campus-life"),
        {
          id: "school-life-overview",
          label: "School Life Overview",
          selector: ".school-life-overview",
          fields: [
            ...campusSectionStyle({
              sectionKey: "overview",
              selector: ".school-life-overview",
              defaultBackgroundColor: "#ffffff",
            }),
            ...t5TypographyFields({ selector: ".school-life-overview" }),
            imageField("image", "Image", ".campus-feature-grid article img"),
            textField(
              "imageAlt",
              "Image alt text",
              ".campus-feature-grid article img",
              {
                target: "attribute",
                attribute: "alt",
              },
            ),
            textareaField(
              "title",
              "Feature title",
              ".campus-feature-grid article h2",
              {
                type: "richText",
                target: "innerHTML",
              },
            ),
            textareaField(
              "body",
              "Feature body",
              ".campus-feature-grid article p",
              {
                type: "richText",
                target: "innerHTML",
              },
            ),
          ],
          repeatable: {
            itemSelector: ".campus-feature-grid article",
            labelSingular: "School life feature",
            labelPlural: "School life features",
          },
        },
        {
          id: "school-life-day",
          label: "A Day at School",
          selector: ".school-life-day",
          fields: [
            ...campusSectionStyle({
              sectionKey: "day",
              selector: ".school-life-day",
              defaultBackgroundColor: "#f3fae3",
            }),
            ...t5TypographyFields({ selector: ".school-life-day" }),
            textField("eyebrow", "Eyebrow", ".page-kicker"),
            textField("title", "Title", ".split-feature h2"),
            textField("item", "Routine item", ".campus-list li"),
          ],
          repeatable: {
            itemSelector: ".campus-list li",
            labelSingular: "Routine item",
            labelPlural: "Routine items",
          },
        },
      ],
    },
    {
      slug: "gallery",
      fileName: "gallery.html",
      title: "Gallery",
      sections: [
        makePageHero("gallery"),
        {
          id: "gallery-grid",
          label: "Gallery Grid",
          selector: ".gallery-grid",
          fields: [
            ...gallerySectionStyle({
              sectionKey: "grid",
              selector: ".gallery-grid",
              defaultBackgroundColor: "#ffffff",
            }),
            ...t5TypographyFields({ selector: ".gallery-grid" }),
            linkField("imageHref", "Image lightbox URL", ".gallery-card"),
            imageField("image", "Image", ".gallery-card img"),
            textField("imageAlt", "Image alt text", ".gallery-card img", {
              target: "attribute",
              attribute: "alt",
            }),
            textField("category", "Category", ".gallery-card span"),
            textField("title", "Title", ".gallery-card h2"),
          ],
          repeatable: {
            itemSelector: ".gallery-card",
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
        makePageHero("contact"),
        {
          id: "contact-details",
          label: "Contact Details",
          selector: ".contact-panel",
          fields: [
            ...contactSectionStyle({
              sectionKey: "details",
              selector: ".contact-panel",
              defaultBackgroundColor: "#ffffff",
            }),
            ...t5TypographyFields({ selector: ".contact-panel" }),
            textField("label", "Detail label", "article span"),
            textareaField("title", "Detail title", "article h2", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("body", "Detail body", "article p", {
              type: "richText",
              target: "innerHTML",
            }),
          ],
          repeatable: {
            itemSelector: "article",
            labelSingular: "Contact detail",
            labelPlural: "Contact details",
          },
        },
        {
          id: "contact-form",
          label: "Contact Form",
          selector: ".contact-form-panel",
          fields: [
            colorField(
              "sectionBgColor",
              "Section background color",
              ".contact-form-panel",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-5-contact-form-section-bg-color",
                defaultValue: "#ffffff",
                uiGroup: "Section background",
                uiOrder: 100,
              },
            ),
            numberField(
              "sectionBgOpacity",
              "Section background opacity",
              ".contact-form-panel",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-5-contact-form-section-bg-opacity",
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
              ".contact-form-panel",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-5-contact-form-section-bg-image",
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
              ".contact-form-panel",
              {
                target: "cssVariable",
                cssVariable:
                  "--dexta-academy-5-contact-form-section-bg-position",
                defaultValue: "center center",
                uiGroup: "Section background",
                uiOrder: 103,
              },
            ),
            textField(
              "sectionBgSize",
              "Background image size",
              ".contact-form-panel",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-5-contact-form-section-bg-size",
                defaultValue: "cover",
                helpText:
                  "Use cover, contain, or a custom CSS size such as 100% auto.",
                uiGroup: "Section background",
                uiOrder: 104,
              },
            ),
            textareaField("eyebrow", "Eyebrow", ".page-kicker", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("title", "Title", ".contact-form-panel__header h2", {
              type: "richText",
              target: "innerHTML",
            }),
            linkField(
              "fontStylesheetUrl",
              "Google Fonts stylesheet URL",
              ".contact-form-panel",
              {
                target: "attribute",
                attribute: "data-dexta-font-stylesheet",
                defaultValue: "",
                placeholder:
                  "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
                helpText: fontImportHelpText,
                uiGroup: "Rich text fonts",
                uiOrder: 200,
              },
            ),
            linkField("formUrl", "Google Form URL", "iframe", {
              attribute: "src",
            }),
            textareaField(
              "formIframe",
              "Google Form iframe embed code",
              "iframe",
              {
                target: "attribute",
                attribute: "src",
                defaultValue: "",
                placeholder:
                  '<iframe src="https://docs.google.com/forms/..." width="640" height="1602" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>',
                helpText:
                  "Paste the full Google Forms iframe embed code. Leave blank to use the Google Form URL field.",
              },
            ),
            textField("formTitle", "Iframe title", "iframe", {
              target: "attribute",
              attribute: "title",
            }),
          ],
        },
      ],
    },
  ],
} satisfies SchoolTemplateManifest;
