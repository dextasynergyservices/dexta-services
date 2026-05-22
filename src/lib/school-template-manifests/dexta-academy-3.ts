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
    textField("fontFamily", "Font family", selector, {
      target: "inlineStyle",
      defaultValue: "",
      placeholder: "Poppins",
      helpText:
        "Leave blank to use the theme font. Enter a Google Font family name such as Poppins to override this section.",
      uiGroup: "Rich text fonts",
      uiOrder: 199,
    }),
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

function t3ButtonShadowStyleFields({
  pageKey,
  sectionKey,
  selector,
  defaultShadowColor,
  defaultShadowOpacity,
}: {
  pageKey: string;
  sectionKey: string;
  selector: string;
  defaultShadowColor: string;
  defaultShadowOpacity: number;
}): SchoolTemplateField[] {
  return [
    colorField("buttonShadowColor", "Button shadow color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "button-shadow-color"),
      defaultValue: defaultShadowColor,
      uiGroup: "Button shadow",
      uiOrder: 305,
    }),
    numberField("buttonShadowOpacity", "Button shadow opacity", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "button-shadow-opacity"),
      defaultValue: defaultShadowOpacity,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      helpText: "Set to 0 to hide the button shadow.",
      uiGroup: "Button shadow",
      uiOrder: 306,
    }),
  ];
}

function t3CardOverlayStyleFields({
  pageKey,
  sectionKey,
  selector,
  defaultOverlayColor = "#050e21",
  defaultOverlayOpacity = 96,
  defaultOverlayHeight = 76,
}: {
  pageKey: string;
  sectionKey: string;
  selector: string;
  defaultOverlayColor?: string;
  defaultOverlayOpacity?: number;
  defaultOverlayHeight?: number;
}): SchoolTemplateField[] {
  return [
    colorField("cardOverlayColor", "Card overlay color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "card-overlay-color"),
      defaultValue: defaultOverlayColor,
      uiGroup: "Programme card overlay",
      uiOrder: 360,
    }),
    numberField("cardOverlayOpacity", "Card overlay opacity", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "card-overlay-opacity"),
      defaultValue: defaultOverlayOpacity,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      helpText: "Set to 0 to remove the card overlay.",
      uiGroup: "Programme card overlay",
      uiOrder: 361,
    }),
    numberField("cardOverlayHeight", "Card overlay height", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "card-overlay-height"),
      defaultValue: defaultOverlayHeight,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      helpText:
        "Controls how far the overlay rises from the bottom of each card.",
      uiGroup: "Programme card overlay",
      uiOrder: 362,
    }),
  ];
}

function t3CardFrameStyleFields({
  pageKey,
  sectionKey,
  selector,
  labelPrefix = "Card",
  defaultBorderColor = "transparent",
  defaultBorderWidth = 0,
  defaultShadowColor = "#0d1c40",
  defaultShadowOpacity = 0,
  uiOrder = 500,
}: {
  pageKey: string;
  sectionKey: string;
  selector: string;
  labelPrefix?: string;
  defaultBorderColor?: string;
  defaultBorderWidth?: number;
  defaultShadowColor?: string;
  defaultShadowOpacity?: number;
  uiOrder?: number;
}): SchoolTemplateField[] {
  return [
    colorField("cardBorderColor", `${labelPrefix} border color`, selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "card-border-color"),
      defaultValue: defaultBorderColor,
      uiGroup: `${labelPrefix} border`,
      uiOrder,
    }),
    numberField("cardBorderWidth", `${labelPrefix} border width`, selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "card-border-width"),
      defaultValue: defaultBorderWidth,
      min: 0,
      max: 12,
      step: 1,
      unit: "px",
      helpText: "Set to 0 to remove the border.",
      uiGroup: `${labelPrefix} border`,
      uiOrder: uiOrder + 1,
    }),
    colorField("cardShadowColor", `${labelPrefix} shadow color`, selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "card-shadow-color"),
      defaultValue: defaultShadowColor,
      uiGroup: `${labelPrefix} shadow`,
      uiOrder: uiOrder + 2,
    }),
    numberField(
      "cardShadowOpacity",
      `${labelPrefix} shadow opacity`,
      selector,
      {
        target: "cssVariable",
        cssVariable: t3CssVar(pageKey, sectionKey, "card-shadow-opacity"),
        defaultValue: defaultShadowOpacity,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        helpText: "Set to 0 to hide the shadow.",
        uiGroup: `${labelPrefix} shadow`,
        uiOrder: uiOrder + 3,
      },
    ),
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

function t3ApplyStepCardStyleFields(): SchoolTemplateField[] {
  const pageKey = "home";
  const sectionKey = "how-to-apply";
  const selector = ".home-apply-step";

  return [
    colorField("stepCardBgColor", "Step card background color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "step-card-bg-color"),
      defaultValue: "#ffffff",
      uiGroup: "Step card style",
      uiOrder: 500,
    }),
    numberField("stepCardBgOpacity", "Step card background opacity", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "step-card-bg-opacity"),
      defaultValue: 100,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      uiGroup: "Step card style",
      uiOrder: 501,
    }),
    colorField("stepCardTitleColor", "Step card title color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "step-card-title-color"),
      defaultValue: "#122a56",
      uiGroup: "Step card style",
      uiOrder: 502,
    }),
    colorField("stepCardBodyColor", "Step card body text color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "step-card-body-color"),
      defaultValue: "#536079",
      uiGroup: "Step card style",
      uiOrder: 503,
    }),
    colorField("stepCardBorderColor", "Step card border color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "step-card-border-color"),
      defaultValue: "rgba(17,34,70,0.09)",
      uiGroup: "Step card border",
      uiOrder: 504,
    }),
    numberField("stepCardBorderWidth", "Step card border width", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "step-card-border-width"),
      defaultValue: 1,
      min: 0,
      max: 12,
      step: 1,
      unit: "px",
      helpText: "Set to 0 to remove the step card border.",
      uiGroup: "Step card border",
      uiOrder: 505,
    }),
    numberField("stepCardBorderRadius", "Step card border radius", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "step-card-border-radius"),
      defaultValue: 18,
      min: 0,
      max: 48,
      step: 1,
      unit: "px",
      uiGroup: "Step card border",
      uiOrder: 506,
    }),
    colorField("stepCardShadowColor", "Step card shadow color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "step-card-shadow-color"),
      defaultValue: "#0d1c40",
      uiGroup: "Step card shadow",
      uiOrder: 507,
    }),
    numberField("stepCardShadowOpacity", "Step card shadow opacity", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "step-card-shadow-opacity"),
      defaultValue: 6,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      helpText: "Set to 0 to hide the step card shadow.",
      uiGroup: "Step card shadow",
      uiOrder: 508,
    }),
  ];
}

function t3ApplyNoteStyleFields(): SchoolTemplateField[] {
  const pageKey = "home";
  const sectionKey = "how-to-apply";
  const selector = ".home-apply__note";

  return [
    colorField("noteBgColor", "Ready list background color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "note-bg-color"),
      defaultValue: "#061f44",
      uiGroup: "Ready list style",
      uiOrder: 540,
    }),
    numberField("noteBgOpacity", "Ready list background opacity", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "note-bg-opacity"),
      defaultValue: 100,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      uiGroup: "Ready list style",
      uiOrder: 541,
    }),
    colorField("noteTitleColor", "Ready list title color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "note-title-color"),
      defaultValue: "#ffffff",
      uiGroup: "Ready list style",
      uiOrder: 542,
    }),
    colorField("noteTextColor", "Ready list text color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "note-text-color"),
      defaultValue: "rgba(255,255,255,0.82)",
      uiGroup: "Ready list style",
      uiOrder: 543,
    }),
    colorField("noteBulletColor", "Ready list bullet color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "note-bullet-color"),
      defaultValue: "#ffc43d",
      uiGroup: "Ready list style",
      uiOrder: 544,
    }),
    colorField("noteBorderColor", "Ready list border color", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "note-border-color"),
      defaultValue: "transparent",
      uiGroup: "Ready list border",
      uiOrder: 545,
    }),
    numberField("noteBorderWidth", "Ready list border width", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "note-border-width"),
      defaultValue: 0,
      min: 0,
      max: 12,
      step: 1,
      unit: "px",
      helpText: "Set to 0 to remove the ready list border.",
      uiGroup: "Ready list border",
      uiOrder: 546,
    }),
    numberField("noteBorderRadius", "Ready list border radius", selector, {
      target: "cssVariable",
      cssVariable: t3CssVar(pageKey, sectionKey, "note-border-radius"),
      defaultValue: 20,
      min: 0,
      max: 48,
      step: 1,
      unit: "px",
      uiGroup: "Ready list border",
      uiOrder: 547,
    }),
  ];
}

function t3ContactCardStyleFields({
  sectionKey,
  selector,
  labelPrefix,
  defaultBackgroundColor = "#ffffff",
  defaultBorderColor = "rgba(6,26,58,0.12)",
  defaultBorderWidth = 1,
  defaultBorderRadius = 9,
  defaultShadowColor = "#061a3a",
  defaultShadowOpacity = 3,
  uiOrder = 620,
}: {
  sectionKey: string;
  selector: string;
  labelPrefix: string;
  defaultBackgroundColor?: string;
  defaultBorderColor?: string;
  defaultBorderWidth?: number;
  defaultBorderRadius?: number;
  defaultShadowColor?: string;
  defaultShadowOpacity?: number;
  uiOrder?: number;
}): SchoolTemplateField[] {
  return [
    colorField(
      `${sectionKey}CardBgColor`,
      `${labelPrefix} background color`,
      selector,
      {
        target: "cssVariable",
        cssVariable: t3CssVar("contact", sectionKey, "card-bg-color"),
        defaultValue: defaultBackgroundColor,
        uiGroup: `${labelPrefix} card style`,
        uiOrder,
      },
    ),
    numberField(
      `${sectionKey}CardBgOpacity`,
      `${labelPrefix} background opacity`,
      selector,
      {
        target: "cssVariable",
        cssVariable: t3CssVar("contact", sectionKey, "card-bg-opacity"),
        defaultValue: 100,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        uiGroup: `${labelPrefix} card style`,
        uiOrder: uiOrder + 1,
      },
    ),
    colorField(
      `${sectionKey}CardBorderColor`,
      `${labelPrefix} border color`,
      selector,
      {
        target: "cssVariable",
        cssVariable: t3CssVar("contact", sectionKey, "card-border-color"),
        defaultValue: defaultBorderColor,
        uiGroup: `${labelPrefix} card border`,
        uiOrder: uiOrder + 2,
      },
    ),
    numberField(
      `${sectionKey}CardBorderWidth`,
      `${labelPrefix} border width`,
      selector,
      {
        target: "cssVariable",
        cssVariable: t3CssVar("contact", sectionKey, "card-border-width"),
        defaultValue: defaultBorderWidth,
        min: 0,
        max: 12,
        step: 1,
        unit: "px",
        helpText: "Set to 0 to remove the border.",
        uiGroup: `${labelPrefix} card border`,
        uiOrder: uiOrder + 3,
      },
    ),
    numberField(
      `${sectionKey}CardBorderRadius`,
      `${labelPrefix} border radius`,
      selector,
      {
        target: "cssVariable",
        cssVariable: t3CssVar("contact", sectionKey, "card-border-radius"),
        defaultValue: defaultBorderRadius,
        min: 0,
        max: 48,
        step: 1,
        unit: "px",
        uiGroup: `${labelPrefix} card border`,
        uiOrder: uiOrder + 4,
      },
    ),
    colorField(
      `${sectionKey}CardShadowColor`,
      `${labelPrefix} shadow color`,
      selector,
      {
        target: "cssVariable",
        cssVariable: t3CssVar("contact", sectionKey, "card-shadow-color"),
        defaultValue: defaultShadowColor,
        uiGroup: `${labelPrefix} card shadow`,
        uiOrder: uiOrder + 5,
      },
    ),
    numberField(
      `${sectionKey}CardShadowOpacity`,
      `${labelPrefix} shadow opacity`,
      selector,
      {
        target: "cssVariable",
        cssVariable: t3CssVar("contact", sectionKey, "card-shadow-opacity"),
        defaultValue: defaultShadowOpacity,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        helpText: "Set to 0 to hide the shadow.",
        uiGroup: `${labelPrefix} card shadow`,
        uiOrder: uiOrder + 6,
      },
    ),
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
        textField(
          "navHomeText",
          "Home nav label",
          ".site-nav a[href='index.html']",
          { defaultValue: "Home", uiGroup: "Navigation links" },
        ),
        linkField(
          "navHomeHref",
          "Home nav link",
          ".site-nav a[href='index.html']",
          { defaultValue: "index.html", uiGroup: "Navigation links" },
        ),
        textField(
          "navAboutText",
          "About nav label",
          ".site-nav a[href='about.html']",
          { defaultValue: "About", uiGroup: "Navigation links" },
        ),
        linkField(
          "navAboutHref",
          "About nav link",
          ".site-nav a[href='about.html']",
          { defaultValue: "about.html", uiGroup: "Navigation links" },
        ),
        textField(
          "navProgrammesText",
          "Programmes nav label",
          ".site-nav a[href='#programmes'], .site-nav a[href='index.html#programmes']",
          { defaultValue: "Programmes", uiGroup: "Navigation links" },
        ),
        linkField(
          "navProgrammesHref",
          "Programmes nav link",
          ".site-nav a[href='#programmes'], .site-nav a[href='index.html#programmes']",
          {
            defaultValue: "index.html#programmes",
            uiGroup: "Navigation links",
          },
        ),
        textField(
          "navGalleryText",
          "Gallery nav label",
          ".site-nav a[href='gallery.html']",
          { defaultValue: "Gallery", uiGroup: "Navigation links" },
        ),
        linkField(
          "navGalleryHref",
          "Gallery nav link",
          ".site-nav a[href='gallery.html']",
          { defaultValue: "gallery.html", uiGroup: "Navigation links" },
        ),
        textField(
          "navApplyText",
          "How to apply nav label",
          ".site-nav a[href='#how-to-apply'], .site-nav a[href='index.html#how-to-apply']",
          { defaultValue: "How To Apply", uiGroup: "Navigation links" },
        ),
        linkField(
          "navApplyHref",
          "How to apply nav link",
          ".site-nav a[href='#how-to-apply'], .site-nav a[href='index.html#how-to-apply']",
          {
            defaultValue: "index.html#how-to-apply",
            uiGroup: "Navigation links",
          },
        ),
        textField(
          "navContactText",
          "Contact nav label",
          ".site-nav a[href='contact.html']",
          { defaultValue: "Contact", uiGroup: "Navigation links" },
        ),
        linkField(
          "navContactHref",
          "Contact nav link",
          ".site-nav a[href='contact.html']",
          { defaultValue: "contact.html", uiGroup: "Navigation links" },
        ),
        textField("brandPrimary", "Brand primary text", ".brand__name strong", {
          defaultValue: "DXT",
        }),
        textField(
          "brandSecondary",
          "Brand secondary text",
          ".brand__name span",
          { defaultValue: "Academy" },
        ),
        textField("portalText", "Portal label", ".portal-link", {
          defaultValue: "Portal",
          uiGroup: "Portal button",
        }),
        linkField("portalHref", "Portal link", ".portal-link", {
          defaultValue: "#",
          uiGroup: "Portal button",
        }),
        textField(
          "headerCtaText",
          "Apply button text",
          ".header-actions .button",
          { defaultValue: "Apply Now", uiGroup: "Apply button" },
        ),
        linkField(
          "headerCtaHref",
          "Apply button link",
          ".header-actions .button",
          { defaultValue: "index.html#how-to-apply", uiGroup: "Apply button" },
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
        }).map((field) => ({
          ...field,
          uiGroup: "Apply button style",
        })),
        ...t3ButtonStyleFields({
          pageKey: "shared",
          sectionKey: "header-portal",
          selector: ".portal-link",
          defaultBackgroundColor: "#ffffff",
          defaultBackgroundOpacity: 0,
          defaultTextColor: "#ffffff",
          defaultBorderColor: "#ffffff",
          defaultBorderWidth: 0,
        }).map((field) => ({
          ...field,
          key: `portal${field.key.charAt(0).toUpperCase()}${field.key.slice(1)}`,
          label: `Portal ${field.label.toLowerCase()}`,
          uiGroup: "Portal button style",
        })),
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
        richTextField(
          "footerAddress",
          "Footer address",
          ".footer-column:nth-of-type(2) p",
        ),
        textField(
          "footerPhone",
          "Footer phone",
          ".footer-column:nth-of-type(2) a:nth-of-type(1)",
        ),
        linkField(
          "footerPhoneHref",
          "Footer phone link",
          ".footer-column:nth-of-type(2) a:nth-of-type(1)",
        ),
        textField(
          "footerEmail",
          "Footer email",
          ".footer-column:nth-of-type(2) a:nth-of-type(2)",
        ),
        linkField(
          "footerEmailHref",
          "Footer email link",
          ".footer-column:nth-of-type(2) a:nth-of-type(2)",
        ),
        richTextField("copyright", "Copyright text", ".footer-bottom p"),
        textField(
          "footerLinkLabel",
          "Footer link text",
          ".footer-explore-links a",
          {
            uiGroup: "Footer links",
            uiOrder: 430,
          },
        ),
        linkField(
          "footerLinkHref",
          "Footer link URL",
          ".footer-explore-links a",
          {
            uiGroup: "Footer links",
            uiOrder: 431,
          },
        ),
        numberField(
          "footerLinkVisible",
          "Show footer link",
          ".footer-explore-links a",
          {
            target: "attribute",
            attribute: "data-footer-link-visible",
            defaultValue: 1,
            min: 0,
            max: 1,
            step: 1,
            unit: "0/1",
            helpText: "Use 1 to show this footer link or 0 to hide it.",
            uiGroup: "Footer links",
            uiOrder: 432,
          },
        ),
        colorField(
          "footerTextColor",
          "Footer text color",
          ".site-footer, .contact-footer",
          {
            target: "cssVariable",
            cssVariable: t3CssVar("shared", "footer", "text-color"),
            defaultValue: "rgba(255,255,255,0.8)",
            uiGroup: "Footer text style",
            uiOrder: 480,
          },
        ),
        colorField(
          "footerLinkColor",
          "Footer link color",
          ".site-footer, .contact-footer",
          {
            target: "cssVariable",
            cssVariable: t3CssVar("shared", "footer", "link-color"),
            defaultValue: "rgba(255,255,255,0.72)",
            uiGroup: "Footer text style",
            uiOrder: 481,
          },
        ),
        colorField(
          "footerLinkHoverColor",
          "Footer link hover color",
          ".site-footer, .contact-footer",
          {
            target: "cssVariable",
            cssVariable: t3CssVar("shared", "footer", "link-hover-color"),
            defaultValue: "#ffffff",
            uiGroup: "Footer text style",
            uiOrder: 482,
          },
        ),
        ...t3SectionStyleFields({
          pageKey: "shared",
          sectionKey: "footer",
          selector: ".site-footer, .contact-footer",
          defaultBackgroundColor: "#09142f",
          includeBackgroundImage: false,
        }),
      ],
      repeatable: {
        itemSelector: ".footer-explore-links a",
        labelSingular: "Footer link",
        labelPlural: "Footer links",
      },
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
              includeBackgroundImage: false,
            }),
            colorField("headlineTextColor", "Headline text color", ".hero", {
              target: "cssVariable",
              cssVariable: t3CssVar("home", "hero", "headline-text-color"),
              defaultValue: "#ffffff",
              uiGroup: "Hero headline style",
              uiOrder: 220,
            }),
            colorField("joyfulAccentColor", "Joyful accent color", ".hero", {
              target: "cssVariable",
              cssVariable: t3CssVar("home", "hero", "joyful-accent-color"),
              defaultValue: "#ffc94c",
              uiGroup: "Hero headline style",
              uiOrder: 221,
            }),
            colorField("boldAccentColor", "Bold accent color", ".hero", {
              target: "cssVariable",
              cssVariable: t3CssVar("home", "hero", "bold-accent-color"),
              defaultValue: "#ffc94c",
              uiGroup: "Hero headline style",
              uiOrder: 222,
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
            ...t3ButtonShadowStyleFields({
              pageKey: "home",
              sectionKey: "hero-primary",
              selector: ".hero__cta-primary",
              defaultShadowColor: "#fac343",
              defaultShadowOpacity: 24,
            }).map((f) => ({
              ...f,
              label: `Primary ${f.label}`,
              key: `primary${f.key.charAt(0).toUpperCase()}${f.key.slice(1)}`,
              uiGroup: "Primary CTA shadow",
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
            ...t3ButtonShadowStyleFields({
              pageKey: "home",
              sectionKey: "hero-secondary",
              selector: ".hero__cta-secondary",
              defaultShadowColor: "#ffffff",
              defaultShadowOpacity: 4,
            }).map((f) => ({
              ...f,
              label: `Secondary ${f.label}`,
              key: `secondary${f.key.charAt(0).toUpperCase()}${f.key.slice(1)}`,
              uiGroup: "Secondary CTA shadow",
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
            textField(
              "programmeIcon",
              "Programme icon text",
              ".programme-tile__icon",
              {
                helpText: "Use short text such as EY, ST, AR, or LW.",
              },
            ),
            richTextField("programmeTitle", "Programme title", "h3"),
            richTextField("programmeBody", "Programme body", "article p"),
            imageField("programmeImage", "Programme image", "img"),
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
            })
              .filter((field) => field.key !== "iconImage")
              .map((field) => ({
                ...field,
                uiGroup: "Programme card icon",
              })),
            ...t3CardOverlayStyleFields({
              pageKey: "home",
              sectionKey: "programmes",
              selector: ".programme-tile",
            }),
            ...t3CardFrameStyleFields({
              pageKey: "home",
              sectionKey: "programmes",
              selector: ".programme-tile",
              labelPrefix: "Programme card",
              defaultBorderColor: "rgba(243,191,53,0.34)",
              defaultBorderWidth: 1,
              defaultShadowColor: "#0d1c40",
              defaultShadowOpacity: 0,
              uiOrder: 370,
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
            textField(
              "primaryCtaText",
              "Primary CTA text",
              ".home-apply__actions .button--gold",
            ),
            linkField(
              "primaryCtaHref",
              "Primary CTA link",
              ".home-apply__actions .button--gold",
            ),
            textField(
              "secondaryCtaText",
              "Secondary CTA text",
              ".home-apply__actions .button--navy",
            ),
            linkField(
              "secondaryCtaHref",
              "Secondary CTA link",
              ".home-apply__actions .button--navy",
            ),
            textField("stepNumber", "Step number", ".home-apply-step__number"),
            richTextField("stepTitle", "Step title", ".home-apply-step h3"),
            richTextField("stepBody", "Step body", ".home-apply-step p"),
            richTextField("noteTitle", "Note title", ".home-apply__note h3"),
            richTextField("noteBody", "Note body", ".home-apply__note ul", {
              target: "innerHTML",
            }),
            colorField(
              "eyebrowTextColor",
              "Eyebrow text color",
              ".home-apply__copy .eyebrow",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "home",
                  "how-to-apply",
                  "eyebrow-text-color",
                ),
                defaultValue: "#c8971b",
                uiGroup: "Section text style",
                uiOrder: 480,
              },
            ),
            colorField("titleTextColor", "Title text color", ".home-apply", {
              target: "cssVariable",
              cssVariable: t3CssVar("home", "how-to-apply", "title-text-color"),
              defaultValue: "#122a56",
              uiGroup: "Section text style",
              uiOrder: 481,
            }),
            colorField("bodyTextColor", "Body text color", ".home-apply", {
              target: "cssVariable",
              cssVariable: t3CssVar("home", "how-to-apply", "body-text-color"),
              defaultValue: "#536079",
              uiGroup: "Section text style",
              uiOrder: 482,
            }),
            ...t3ApplyStepCardStyleFields(),
            ...homeIconStyle({
              sectionKey: "how-to-apply",
              selector: ".home-apply-step__number",
              defaultIconColor: "#122a56",
              defaultIconBgColor: "#fff2c9",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "transparent",
              defaultIconBorderWidth: 0,
            })
              .filter((field) => field.key !== "iconImage")
              .map((field) => ({
                ...field,
                uiGroup: "Step number icon style",
                uiOrder: (field.uiOrder ?? 400) + 120,
              })),
            ...t3ApplyNoteStyleFields(),
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
            ...t3CardFrameStyleFields({
              pageKey: "home",
              sectionKey: "gallery-preview",
              selector: ".home-gallery-card",
              labelPrefix: "Gallery card",
              defaultBorderColor: "transparent",
              defaultBorderWidth: 0,
              defaultShadowColor: "#0d1c40",
              defaultShadowOpacity: 0,
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
            ...t3CardFrameStyleFields({
              pageKey: "about",
              sectionKey: "story",
              selector: ".about-story-card",
              labelPrefix: "Story card",
              defaultBorderColor: "transparent",
              defaultBorderWidth: 0,
              defaultShadowColor: "#0d1c40",
              defaultShadowOpacity: 0,
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
            ...t3CardFrameStyleFields({
              pageKey: "about",
              sectionKey: "values",
              selector: ".about-value-card",
              labelPrefix: "Value card",
              defaultBorderColor: "rgba(17,34,70,0.08)",
              defaultBorderWidth: 1,
              defaultShadowColor: "#0d1c40",
              defaultShadowOpacity: 9,
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
            ...t3CardFrameStyleFields({
              pageKey: "gallery",
              sectionKey: "grid",
              selector: ".gallery-reference-card",
              labelPrefix: "Gallery item",
              defaultBorderColor: "transparent",
              defaultBorderWidth: 0,
              defaultShadowColor: "#0a1833",
              defaultShadowOpacity: 4,
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
              ".contact-button--dark .contact-button__label",
            ),
            linkField(
              "primaryCtaHref",
              "Apply button link",
              ".contact-button--dark",
            ),
            textField(
              "secondaryCtaText",
              "Call button text",
              ".contact-button--light .contact-button__label",
            ),
            linkField(
              "secondaryCtaHref",
              "Call button link",
              ".contact-button--light",
            ),
            colorField(
              "eyebrowTextColor",
              "Eyebrow text color",
              ".contact-hero",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "hero", "eyebrow-text-color"),
                defaultValue: "#ffc43d",
                uiGroup: "Hero text style",
                uiOrder: 480,
              },
            ),
            colorField("titleTextColor", "Title text color", ".contact-hero", {
              target: "cssVariable",
              cssVariable: t3CssVar("contact", "hero", "title-text-color"),
              defaultValue: "#ffffff",
              uiGroup: "Hero text style",
              uiOrder: 481,
            }),
            colorField(
              "accentTextColor",
              "Title accent color",
              ".contact-hero",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "hero", "accent-text-color"),
                defaultValue: "#ffc43d",
                uiGroup: "Hero text style",
                uiOrder: 482,
              },
            ),
            colorField("bodyTextColor", "Body text color", ".contact-hero", {
              target: "cssVariable",
              cssVariable: t3CssVar("contact", "hero", "body-text-color"),
              defaultValue: "rgba(255,255,255,0.82)",
              uiGroup: "Hero text style",
              uiOrder: 483,
            }),
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
              defaultBorderColor: "rgba(6,31,68,0.12)",
              defaultBorderWidth: 1,
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
            colorField(
              "eyebrowTextColor",
              "Eyebrow text color",
              ".contact-intro",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "intro", "eyebrow-text-color"),
                defaultValue: "#f5ae00",
                uiGroup: "Intro text style",
                uiOrder: 480,
              },
            ),
            colorField("titleTextColor", "Title text color", ".contact-intro", {
              target: "cssVariable",
              cssVariable: t3CssVar("contact", "intro", "title-text-color"),
              defaultValue: "#061a3a",
              uiGroup: "Intro text style",
              uiOrder: 481,
            }),
            colorField("bodyTextColor", "Body text color", ".contact-intro", {
              target: "cssVariable",
              cssVariable: t3CssVar("contact", "intro", "body-text-color"),
              defaultValue: "#1b2c4b",
              uiGroup: "Intro text style",
              uiOrder: 482,
            }),
            colorField(
              "dividerColor",
              "Divider color",
              ".contact-intro > span",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "intro", "divider-color"),
                defaultValue: "#f4b31d",
                uiGroup: "Intro text style",
                uiOrder: 483,
              },
            ),
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
            textField("infoIcon", "Icon text", ".contact-info-icon", {
              helpText:
                "Use a short symbol, emoji, or 1-2 letters. Example: Phone, @, or ?",
            }),
            richTextField("infoTitle", "Info item title", "strong"),
            richTextField("infoContent", "Info content", ".contact-info-text"),
            colorField(
              "titleTextColor",
              "Card title color",
              ".contact-info-card",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "info-card",
                  "title-text-color",
                ),
                defaultValue: "#061a3a",
                uiGroup: "Info card text style",
                uiOrder: 480,
              },
            ),
            colorField(
              "itemTitleColor",
              "Info item title color",
              ".contact-info-card",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "info-card",
                  "item-title-color",
                ),
                defaultValue: "#061a3a",
                uiGroup: "Info card text style",
                uiOrder: 481,
              },
            ),
            colorField(
              "itemTextColor",
              "Info item text color",
              ".contact-info-card",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "info-card",
                  "item-text-color",
                ),
                defaultValue: "#142340",
                uiGroup: "Info card text style",
                uiOrder: 482,
              },
            ),
            colorField(
              "socialIconColor",
              "Social icon color",
              ".contact-socials a",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "info-card",
                  "social-icon-color",
                ),
                defaultValue: "#061a3a",
                uiGroup: "Social icon style",
                uiOrder: 483,
              },
            ),
            colorField(
              "socialIconBorderColor",
              "Social icon border color",
              ".contact-socials a",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "info-card",
                  "social-icon-border-color",
                ),
                defaultValue: "rgba(6,26,58,0.18)",
                uiGroup: "Social icon style",
                uiOrder: 484,
              },
            ),
            ...contactSectionStyle({
              sectionKey: "info-card",
              selector: ".contact-info-card",
              defaultBackgroundColor: "#ffffff",
            }),
            ...t3ContactCardStyleFields({
              sectionKey: "info-card",
              selector: ".contact-info-card",
              labelPrefix: "Info",
              defaultBackgroundColor: "#ffffff",
              defaultBorderColor: "rgba(6,26,58,0.12)",
              defaultBorderRadius: 9,
              defaultShadowOpacity: 3,
            }),
            ...contactIconStyle({
              sectionKey: "info-icon",
              selector: ".contact-info-card",
              defaultIconColor: "#f1ad16",
              defaultIconBgColor: "#fffaf1",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "rgba(6,26,58,0.1)",
              defaultIconBorderWidth: 1,
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
          id: "contact-social-links",
          label: "Contact Social Links",
          selector: ".contact-socials",
          fields: [
            linkField("facebookHref", "Facebook URL", "a:nth-of-type(1)", {
              defaultValue: "#",
            }),
            linkField("instagramHref", "Instagram URL", "a:nth-of-type(2)", {
              defaultValue: "#",
            }),
            linkField("xHref", "X URL", "a:nth-of-type(3)", {
              defaultValue: "#",
            }),
            linkField("youtubeHref", "YouTube URL", "a:nth-of-type(4)", {
              defaultValue: "#",
            }),
            linkField("linkedinHref", "LinkedIn URL", "a:nth-of-type(5)", {
              defaultValue: "#",
            }),
          ],
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
            colorField(
              "titleTextColor",
              "Title text color",
              ".contact-message-card",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "message", "title-text-color"),
                defaultValue: "#061a3a",
                uiGroup: "Message card text style",
                uiOrder: 480,
              },
            ),
            colorField(
              "bodyTextColor",
              "Body text color",
              ".contact-message-card",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "message", "body-text-color"),
                defaultValue: "#4b5873",
                uiGroup: "Message card text style",
                uiOrder: 481,
              },
            ),
            colorField(
              "dividerColor",
              "Header divider color",
              ".contact-message-card",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "message", "divider-color"),
                defaultValue: "rgba(6,26,58,0.1)",
                uiGroup: "Message card text style",
                uiOrder: 482,
              },
            ),
            ...t3ContactCardStyleFields({
              sectionKey: "message",
              selector: ".contact-message-card",
              labelPrefix: "Message",
              defaultBackgroundColor: "#ffffff",
              defaultBorderColor: "rgba(6,26,58,0.12)",
              defaultBorderRadius: 9,
              defaultShadowOpacity: 3,
            }),
            colorField(
              "formFrameBgColor",
              "Form frame background color",
              ".contact-form-embed",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "message",
                  "form-frame-bg-color",
                ),
                defaultValue: "#ffffff",
                uiGroup: "Form frame style",
                uiOrder: 650,
              },
            ),
            colorField(
              "formFrameBorderColor",
              "Form frame border color",
              ".contact-form-embed",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "message",
                  "form-frame-border-color",
                ),
                defaultValue: "rgba(6,26,58,0.12)",
                uiGroup: "Form frame style",
                uiOrder: 651,
              },
            ),
            numberField(
              "formFrameBorderRadius",
              "Form frame border radius",
              ".contact-form-embed",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "message",
                  "form-frame-border-radius",
                ),
                defaultValue: 12,
                min: 0,
                max: 48,
                step: 1,
                unit: "px",
                uiGroup: "Form frame style",
                uiOrder: 652,
              },
            ),
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
            richTextField(
              "guideKicker",
              "Guide eyebrow",
              ".admission-modal__guide-kicker",
            ),
            richTextField(
              "guideTitle",
              "Guide title",
              ".admission-modal__guide h3",
            ),
            richTextField(
              "guideList",
              "Guide checklist",
              ".admission-modal__guide ul",
              {
                target: "innerHTML",
              },
            ),
            textField(
              "guideLinkText",
              "Guide link text",
              ".admission-modal__page-link-label",
            ),
            linkField(
              "guideLinkHref",
              "Guide link URL",
              ".admission-modal__page-link",
            ),
            colorField(
              "headerBgColor",
              "Modal header background color",
              ".admission-modal__header",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "admission",
                  "header-bg-color",
                ),
                defaultValue: "#061f44",
                uiGroup: "Modal header style",
                uiOrder: 480,
              },
            ),
            colorField(
              "eyebrowTextColor",
              "Modal eyebrow color",
              ".admission-modal__header",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "admission",
                  "eyebrow-text-color",
                ),
                defaultValue: "#ffc43d",
                uiGroup: "Modal header style",
                uiOrder: 482,
              },
            ),
            colorField(
              "titleTextColor",
              "Modal title color",
              ".admission-modal__header",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "admission",
                  "title-text-color",
                ),
                defaultValue: "#ffffff",
                uiGroup: "Modal header style",
                uiOrder: 483,
              },
            ),
            colorField(
              "bodyBgColor",
              "Modal body background color",
              ".admission-modal__body",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "admission", "body-bg-color"),
                defaultValue: "#fff8ed",
                uiGroup: "Modal body style",
                uiOrder: 484,
              },
            ),
            colorField(
              "guideTitleColor",
              "Guide title color",
              ".admission-modal__guide",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "admission",
                  "guide-title-color",
                ),
                defaultValue: "#061a3a",
                uiGroup: "Modal guide style",
                uiOrder: 485,
              },
            ),
            colorField(
              "guideTextColor",
              "Guide text color",
              ".admission-modal__guide",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "admission",
                  "guide-text-color",
                ),
                defaultValue: "#33425f",
                uiGroup: "Modal guide style",
                uiOrder: 486,
              },
            ),
            colorField(
              "guideBulletColor",
              "Guide bullet color",
              ".admission-modal__guide",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "admission",
                  "guide-bullet-color",
                ),
                defaultValue: "#ffc43d",
                uiGroup: "Modal guide style",
                uiOrder: 487,
              },
            ),
            ...t3ContactCardStyleFields({
              sectionKey: "admission-panel",
              selector: ".admission-modal__panel",
              labelPrefix: "Modal panel",
              defaultBackgroundColor: "#ffffff",
              defaultBorderColor: "rgba(255,255,255,0.16)",
              defaultBorderRadius: 18,
              defaultShadowColor: "#010918",
              defaultShadowOpacity: 38,
              uiOrder: 620,
            }),
            ...t3ContactCardStyleFields({
              sectionKey: "admission-guide",
              selector: ".admission-modal__guide",
              labelPrefix: "Modal guide",
              defaultBackgroundColor: "#ffffff",
              defaultBorderColor: "rgba(6,31,68,0.1)",
              defaultBorderRadius: 14,
              defaultShadowOpacity: 0,
              uiOrder: 650,
            }),
            ...t3ButtonStyleFields({
              pageKey: "contact",
              sectionKey: "admission-guide-link",
              selector: ".admission-modal__page-link",
              defaultBackgroundColor: "#061f44",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "#061f44",
            }).map((f) => ({
              ...f,
              label: `Guide link ${f.label}`,
              key: `guideLink${f.key.charAt(0).toUpperCase()}${f.key.slice(1)}`,
              uiGroup: "Modal guide link style",
            })),
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
            textField(
              "benefitIcon",
              "Benefit icon text",
              ".contact-benefit-icon",
              {
                helpText:
                  "Use a short text symbol or 1-2 letters for each benefit icon. Emoji icons may not follow the admin icon color.",
              },
            ),
            richTextField("benefitTitle", "Benefit title", "strong"),
            richTextField(
              "benefitBody",
              "Benefit body",
              ".contact-benefit-text",
            ),
            colorField(
              "benefitTitleColor",
              "Benefit title color",
              ".contact-benefits",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "benefits",
                  "title-text-color",
                ),
                defaultValue: "#061a3a",
                uiGroup: "Benefit text style",
                uiOrder: 480,
              },
            ),
            colorField(
              "benefitBodyColor",
              "Benefit body text color",
              ".contact-benefits",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "benefits", "body-text-color"),
                defaultValue: "#1d2d49",
                uiGroup: "Benefit text style",
                uiOrder: 481,
              },
            ),
            colorField(
              "benefitCardBgColor",
              "Benefit card background color",
              ".contact-benefits article",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "benefits", "card-bg-color"),
                defaultValue: "transparent",
                uiGroup: "Benefit card style",
                uiOrder: 500,
              },
            ),
            numberField(
              "benefitCardBgOpacity",
              "Benefit card background opacity",
              ".contact-benefits article",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "benefits", "card-bg-opacity"),
                defaultValue: 0,
                min: 0,
                max: 100,
                step: 1,
                unit: "%",
                uiGroup: "Benefit card style",
                uiOrder: 501,
              },
            ),
            colorField(
              "benefitCardBorderColor",
              "Benefit card divider color",
              ".contact-benefits article",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "benefits",
                  "card-border-color",
                ),
                defaultValue: "rgba(6,26,58,0.08)",
                uiGroup: "Benefit card border",
                uiOrder: 502,
              },
            ),
            numberField(
              "benefitCardBorderWidth",
              "Benefit card divider width",
              ".contact-benefits article",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "benefits",
                  "card-border-width",
                ),
                defaultValue: 1,
                min: 0,
                max: 12,
                step: 1,
                unit: "px",
                helpText: "Set to 0 to remove the divider.",
                uiGroup: "Benefit card border",
                uiOrder: 503,
              },
            ),
            colorField(
              "benefitCardShadowColor",
              "Benefit card shadow color",
              ".contact-benefits article",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "benefits",
                  "card-shadow-color",
                ),
                defaultValue: "#061a3a",
                uiGroup: "Benefit card shadow",
                uiOrder: 504,
              },
            ),
            numberField(
              "benefitCardShadowOpacity",
              "Benefit card shadow opacity",
              ".contact-benefits article",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "benefits",
                  "card-shadow-opacity",
                ),
                defaultValue: 0,
                min: 0,
                max: 100,
                step: 1,
                unit: "%",
                helpText: "Set to 0 to hide the shadow.",
                uiGroup: "Benefit card shadow",
                uiOrder: 505,
              },
            ),
            ...contactSectionStyle({
              sectionKey: "benefits",
              selector: ".contact-benefits",
              defaultBackgroundColor: "#fffdfb",
            }),
            ...t3ContactCardStyleFields({
              sectionKey: "benefits-wrap",
              selector: ".contact-benefits",
              labelPrefix: "Benefits wrapper",
              defaultBackgroundColor: "#fffdfb",
              defaultBorderColor: "transparent",
              defaultBorderWidth: 0,
              defaultBorderRadius: 12,
              defaultShadowOpacity: 4,
              uiOrder: 620,
            }),
            ...contactIconStyle({
              sectionKey: "benefits-icon",
              selector: ".contact-benefits",
              defaultIconColor: "#061a3a",
            }),
            ...contactTypography({ selector: ".contact-benefits" }),
          ],
          repeatable: {
            itemSelector: ".contact-benefit-item",
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
            colorField(
              "brandTextColor",
              "Brand name color",
              ".contact-footer__brand",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "footer", "brand-text-color"),
                defaultValue: "#ffffff",
                uiGroup: "Footer text style",
                uiOrder: 480,
              },
            ),
            colorField(
              "taglineTextColor",
              "Tagline color",
              ".contact-footer__brand",
              {
                target: "cssVariable",
                cssVariable: t3CssVar(
                  "contact",
                  "footer",
                  "tagline-text-color",
                ),
                defaultValue: "#ffffff",
                uiGroup: "Footer text style",
                uiOrder: 481,
              },
            ),
            colorField(
              "bodyTextColor",
              "Body text color",
              ".contact-footer__brand",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "footer", "body-text-color"),
                defaultValue: "#ffffff",
                uiGroup: "Footer text style",
                uiOrder: 482,
              },
            ),
          ],
        },
        {
          id: "contact-footer-explore",
          label: "Contact Footer Explore",
          selector: ".contact-footer__grid > section:nth-of-type(2)",
          fields: [
            textField("title", "Title", "h3"),
            textField("linkLabel", "Link label", "a"),
            linkField("linkHref", "Link URL", "a"),
            colorField(
              "headingColor",
              "Heading color",
              ".contact-footer__grid > section:nth-of-type(2)",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "footer", "heading-color"),
                defaultValue: "#ffc43d",
                uiGroup: "Footer text style",
                uiOrder: 480,
              },
            ),
            colorField(
              "linkColor",
              "Link color",
              ".contact-footer__grid > section:nth-of-type(2)",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "footer", "link-color"),
                defaultValue: "#ffffff",
                uiGroup: "Footer text style",
                uiOrder: 481,
              },
            ),
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
            colorField(
              "headingColor",
              "Heading color",
              ".contact-footer__grid > section:nth-of-type(3)",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "footer", "heading-color"),
                defaultValue: "#ffc43d",
                uiGroup: "Footer text style",
                uiOrder: 480,
              },
            ),
            colorField(
              "detailColor",
              "Detail text color",
              ".contact-footer__grid > section:nth-of-type(3)",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "footer", "link-color"),
                defaultValue: "#ffffff",
                uiGroup: "Footer text style",
                uiOrder: 481,
              },
            ),
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
            colorField(
              "bottomTextColor",
              "Bottom text color",
              ".contact-footer",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "footer", "bottom-text-color"),
                defaultValue: "#ffffff",
                uiGroup: "Footer bottom style",
                uiOrder: 480,
              },
            ),
            colorField(
              "dividerColor",
              "Footer divider color",
              ".contact-footer",
              {
                target: "cssVariable",
                cssVariable: t3CssVar("contact", "footer", "divider-color"),
                defaultValue: "rgba(255,255,255,0.2)",
                uiGroup: "Footer bottom style",
                uiOrder: 481,
              },
            ),
            ...contactSectionStyle({
              sectionKey: "footer",
              selector: ".contact-footer",
              defaultBackgroundColor: "#061f3f",
              includeBackgroundImage: false,
            }),
          ],
        },
      ],
    },
  ],
} satisfies SchoolTemplateManifest;
