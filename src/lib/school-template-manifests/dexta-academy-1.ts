import {
  backgroundImageField,
  colorField,
  imageField,
  linkField,
  numberField,
  selectField,
  textField,
  textareaField,
  type SchoolTemplateField,
  type SchoolTemplateManifest,
} from "./types";

// ── CSS variable naming ───────────────────────────────────────
function t1CssVar(pageKey: string, sectionKey: string, token: string) {
  return `--dexta-academy-1-${pageKey}-${sectionKey}-${token}`;
}

// ── Section background style fields ──────────────────────────
function t1SectionStyleFields({
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
      cssVariable: t1CssVar(pageKey, sectionKey, "section-bg-color"),
      defaultValue: defaultBackgroundColor,
      uiGroup: "Section background",
      uiOrder: 100,
    }),
    numberField("sectionBgOpacity", "Section background opacity", selector, {
      target: "cssVariable",
      cssVariable: t1CssVar(pageKey, sectionKey, "section-bg-opacity"),
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
              cssVariable: t1CssVar(pageKey, sectionKey, "section-bg-image"),
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
              cssVariable: t1CssVar(pageKey, sectionKey, "section-bg-position"),
              defaultValue: "center center",
              uiGroup: "Section background",
              uiOrder: 103,
            },
          ),
          textField("sectionBgSize", "Background image size", selector, {
            target: "cssVariable",
            cssVariable: t1CssVar(pageKey, sectionKey, "section-bg-size"),
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

// ── Button style fields ──────────────────────────────────────
function t1ButtonStyleFields({
  pageKey,
  sectionKey,
  selector,
  defaultBackgroundColor = "#0d6efd",
  defaultBackgroundOpacity = 100,
  defaultTextColor = "#ffffff",
  defaultBorderColor = "#0d6efd",
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
      cssVariable: t1CssVar(pageKey, sectionKey, "button-bg-color"),
      defaultValue: defaultBackgroundColor,
      uiGroup: "Button style",
      uiOrder: 300,
    }),
    numberField("buttonBgOpacity", "Button background opacity", selector, {
      target: "cssVariable",
      cssVariable: t1CssVar(pageKey, sectionKey, "button-bg-opacity"),
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
      cssVariable: t1CssVar(pageKey, sectionKey, "button-text-color"),
      defaultValue: defaultTextColor,
      uiGroup: "Button style",
      uiOrder: 302,
    }),
    colorField("buttonBorderColor", "Button border color", selector, {
      target: "cssVariable",
      cssVariable: t1CssVar(pageKey, sectionKey, "button-border-color"),
      defaultValue: defaultBorderColor,
      uiGroup: "Button style",
      uiOrder: 303,
    }),
    numberField("buttonBorderWidth", "Button border width", selector, {
      target: "cssVariable",
      cssVariable: t1CssVar(pageKey, sectionKey, "button-border-width"),
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

// ── Icon style fields ────────────────────────────────────────
function t1IconStyleFields({
  pageKey,
  sectionKey,
  selector,
  defaultIconColor = "#0d6efd",
  defaultIconBgColor = "#ffffff",
  defaultIconBgOpacity = 100,
  defaultIconBorderColor = "#0d6efd",
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
      cssVariable: t1CssVar(pageKey, sectionKey, "icon-color"),
      defaultValue: defaultIconColor,
      uiGroup: "Icon style",
      uiOrder: 400,
    }),
    colorField("iconBgColor", "Icon background color", selector, {
      target: "cssVariable",
      cssVariable: t1CssVar(pageKey, sectionKey, "icon-bg-color"),
      defaultValue: defaultIconBgColor,
      uiGroup: "Icon style",
      uiOrder: 401,
    }),
    numberField("iconBgOpacity", "Icon background opacity", selector, {
      target: "cssVariable",
      cssVariable: t1CssVar(pageKey, sectionKey, "icon-bg-opacity"),
      defaultValue: defaultIconBgOpacity,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      uiGroup: "Icon style",
      uiOrder: 402,
    }),
    backgroundImageField("iconImage", "Icon image", selector, {
      target: "cssVariable",
      cssVariable: t1CssVar(pageKey, sectionKey, "icon-image"),
      defaultValue: "",
      uiGroup: "Icon style",
      uiOrder: 403,
      helpText:
        "Upload an image to replace the icon. Leave blank to keep the font icon.",
    }),
    colorField("iconBorderColor", "Icon border color", selector, {
      target: "cssVariable",
      cssVariable: t1CssVar(pageKey, sectionKey, "icon-border-color"),
      defaultValue: defaultIconBorderColor,
      uiGroup: "Icon style",
      uiOrder: 404,
    }),
    numberField("iconBorderWidth", "Icon border width", selector, {
      target: "cssVariable",
      cssVariable: t1CssVar(pageKey, sectionKey, "icon-border-width"),
      defaultValue: defaultIconBorderWidth,
      min: 0,
      max: 8,
      step: 1,
      unit: "px",
      helpText: "Set to 0 to remove the border.",
      uiGroup: "Icon style",
      uiOrder: 405,
    }),
  ];
}

// ── Typography / Rich text font fields ───────────────────────
function t1TypographyFields({
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
      helpText:
        "Paste a Google Fonts embed URL to change the font for this section.",
      uiGroup: "Rich text fonts",
      uiOrder: 200,
    }),
  ];
}

// ── Template 1 responsive logo controls ─────────────────────
function t1ResponsiveLogoFields(): SchoolTemplateField[] {
  const fieldBase = {
    selector: ".navbar",
    target: "cssVariable" as const,
    unit: "px",
    min: 24,
    max: 220,
    step: 1,
    uiGroup: "Responsive logo size",
  };

  return [
    numberField("logoWidthDesktop", "Logo width on desktop", ".navbar", {
      ...fieldBase,
      cssVariable: t1CssVar("shared", "navbar", "logo-width-desktop"),
      defaultValue: 72,
      uiOrder: 10,
    }),
    numberField("logoHeightDesktop", "Logo height on desktop", ".navbar", {
      ...fieldBase,
      cssVariable: t1CssVar("shared", "navbar", "logo-height-desktop"),
      defaultValue: 56,
      uiOrder: 11,
    }),
    numberField("logoWidthTablet", "Logo width on tablet", ".navbar", {
      ...fieldBase,
      cssVariable: t1CssVar("shared", "navbar", "logo-width-tablet"),
      defaultValue: 72,
      uiOrder: 12,
    }),
    numberField("logoHeightTablet", "Logo height on tablet", ".navbar", {
      ...fieldBase,
      cssVariable: t1CssVar("shared", "navbar", "logo-height-tablet"),
      defaultValue: 56,
      uiOrder: 13,
    }),
    numberField("logoWidthMobile", "Logo width on mobile", ".navbar", {
      ...fieldBase,
      cssVariable: t1CssVar("shared", "navbar", "logo-width-mobile"),
      defaultValue: 72,
      uiOrder: 14,
    }),
    numberField("logoHeightMobile", "Logo height on mobile", ".navbar", {
      ...fieldBase,
      cssVariable: t1CssVar("shared", "navbar", "logo-height-mobile"),
      defaultValue: 56,
      uiOrder: 15,
    }),
  ];
}

// ── Template 1 hero-specific controls ───────────────────────
function t1HeroResponsiveTextFields(): SchoolTemplateField[] {
  const fieldBase = {
    selector: ".school-hero",
    target: "cssVariable" as const,
    unit: "px",
    min: 12,
    max: 120,
    step: 1,
    uiGroup: "Mobile and tablet hero text sizes",
    helpText:
      "Only the font size changes at this screen size. Other text styling stays the same.",
  };

  return [
    numberField(
      "headlineTabletFontSize",
      "Hero headline tablet size",
      ".school-hero",
      {
        ...fieldBase,
        cssVariable: t1CssVar("home", "hero", "headline-tablet-font-size"),
        defaultValue: 58,
        min: 24,
        max: 120,
        uiOrder: 220,
      },
    ),
    numberField(
      "headlineMobileFontSize",
      "Hero headline mobile size",
      ".school-hero",
      {
        ...fieldBase,
        cssVariable: t1CssVar("home", "hero", "headline-mobile-font-size"),
        defaultValue: 42,
        min: 22,
        max: 88,
        uiOrder: 221,
      },
    ),
    numberField("bodyTabletFontSize", "Hero body tablet size", ".school-hero", {
      ...fieldBase,
      cssVariable: t1CssVar("home", "hero", "body-tablet-font-size"),
      defaultValue: 22,
      min: 12,
      max: 48,
      uiOrder: 222,
    }),
    numberField("bodyMobileFontSize", "Hero body mobile size", ".school-hero", {
      ...fieldBase,
      cssVariable: t1CssVar("home", "hero", "body-mobile-font-size"),
      defaultValue: 18,
      min: 12,
      max: 40,
      uiOrder: 223,
    }),
  ];
}

function t1HeroAnimatedLineFields(): SchoolTemplateField[] {
  const colorBase = {
    selector: ".school-hero",
    target: "cssVariable" as const,
    uiGroup: "Animated hero lines",
  };
  const opacityBase = {
    selector: ".school-hero",
    target: "cssVariable" as const,
    defaultValue: 100,
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    uiGroup: "Animated hero lines",
    helpText: "100 is fully visible; 0 is transparent.",
  };

  return [
    colorField("lineOrangeColor", "Orange line color", ".school-hero", {
      ...colorBase,
      cssVariable: t1CssVar("home", "hero", "line-orange-color"),
      defaultValue: "#FF6B35",
      uiOrder: 240,
    }),
    numberField("lineOrangeOpacity", "Orange line opacity", ".school-hero", {
      ...opacityBase,
      cssVariable: t1CssVar("home", "hero", "line-orange-opacity"),
      uiOrder: 241,
    }),
    colorField("lineSkyColor", "Sky line color", ".school-hero", {
      ...colorBase,
      cssVariable: t1CssVar("home", "hero", "line-sky-color"),
      defaultValue: "#7fd0ff",
      uiOrder: 242,
    }),
    numberField("lineSkyOpacity", "Sky line opacity", ".school-hero", {
      ...opacityBase,
      cssVariable: t1CssVar("home", "hero", "line-sky-opacity"),
      uiOrder: 243,
    }),
    colorField("lineWhiteColor", "White line color", ".school-hero", {
      ...colorBase,
      cssVariable: t1CssVar("home", "hero", "line-white-color"),
      defaultValue: "#ffffff",
      uiOrder: 244,
    }),
    numberField("lineWhiteOpacity", "White line opacity", ".school-hero", {
      ...opacityBase,
      cssVariable: t1CssVar("home", "hero", "line-white-opacity"),
      uiOrder: 245,
    }),
    colorField("lineGreenBlueColor", "Green/blue line color", ".school-hero", {
      ...colorBase,
      cssVariable: t1CssVar("home", "hero", "line-green-blue-color"),
      defaultValue: "#07801b",
      uiOrder: 246,
    }),
    numberField(
      "lineGreenBlueOpacity",
      "Green/blue line opacity",
      ".school-hero",
      {
        ...opacityBase,
        cssVariable: t1CssVar("home", "hero", "line-green-blue-opacity"),
        uiOrder: 247,
      },
    ),
    colorField(
      "lineFineAccentColor",
      "Fine accent line color",
      ".school-hero",
      {
        ...colorBase,
        cssVariable: t1CssVar("home", "hero", "line-fine-accent-color"),
        defaultValue: "#acb893",
        uiOrder: 248,
      },
    ),
    numberField(
      "lineFineAccentOpacity",
      "Fine accent line opacity",
      ".school-hero",
      {
        ...opacityBase,
        cssVariable: t1CssVar("home", "hero", "line-fine-accent-opacity"),
        uiOrder: 249,
      },
    ),
  ];
}

function t1HeroCardBackgroundFields(): SchoolTemplateField[] {
  const colorBase = {
    selector: ".school-hero",
    target: "cssVariable" as const,
    uiGroup: "Hero image card backgrounds",
  };
  const opacityBase = {
    selector: ".school-hero",
    target: "cssVariable" as const,
    defaultValue: 100,
    min: 0,
    max: 100,
    step: 1,
    unit: "%",
    uiGroup: "Hero image card backgrounds",
    helpText: "100 is fully visible; 0 is transparent.",
  };

  return [
    colorField(
      "cardCenterBgColor",
      "Center image card background",
      ".school-hero",
      {
        ...colorBase,
        cssVariable: t1CssVar("home", "hero", "card-center-bg-color"),
        defaultValue: "#0a4d3c",
        uiOrder: 180,
      },
    ),
    numberField(
      "cardCenterBgOpacity",
      "Center image card opacity",
      ".school-hero",
      {
        ...opacityBase,
        cssVariable: t1CssVar("home", "hero", "card-center-bg-opacity"),
        uiOrder: 181,
      },
    ),
    colorField("cardTopBgColor", "Top image card background", ".school-hero", {
      ...colorBase,
      cssVariable: t1CssVar("home", "hero", "card-top-bg-color"),
      defaultValue: "#ff6b35",
      uiOrder: 182,
    }),
    numberField("cardTopBgOpacity", "Top image card opacity", ".school-hero", {
      ...opacityBase,
      cssVariable: t1CssVar("home", "hero", "card-top-bg-opacity"),
      uiOrder: 183,
    }),
    colorField(
      "cardBottomBgColor",
      "Bottom image card background",
      ".school-hero",
      {
        ...colorBase,
        cssVariable: t1CssVar("home", "hero", "card-bottom-bg-color"),
        defaultValue: "#dce5c8",
        uiOrder: 184,
      },
    ),
    numberField(
      "cardBottomBgOpacity",
      "Bottom image card opacity",
      ".school-hero",
      {
        ...opacityBase,
        cssVariable: t1CssVar("home", "hero", "card-bottom-bg-opacity"),
        uiOrder: 185,
      },
    ),
  ];
}

function t1AboutPreviewImageBorderFields(): SchoolTemplateField[] {
  const selector = ".landing-about__shape";

  return [
    selectField(
      "imageBorderStyle",
      "Image border pattern",
      selector,
      [
        { label: "Solid", value: "solid" },
        { label: "Dashed", value: "dashed" },
        { label: "Dotted", value: "dotted" },
        { label: "Double", value: "double" },
        { label: "None", value: "none" },
      ],
      {
        target: "cssVariable",
        cssVariable: t1CssVar("home", "about-preview", "image-border-style"),
        defaultValue: "solid",
        helpText: "Choose None to remove the border line.",
        uiGroup: "Who We Are image border",
        uiOrder: 420,
      },
    ),
    colorField("imageBorderColor", "Image border color", selector, {
      target: "cssVariable",
      cssVariable: t1CssVar("home", "about-preview", "image-border-color"),
      defaultValue: "#0a4d3c",
      uiGroup: "Who We Are image border",
      uiOrder: 421,
    }),
    numberField("imageBorderWidth", "Image border thickness", selector, {
      target: "cssVariable",
      cssVariable: t1CssVar("home", "about-preview", "image-border-width"),
      defaultValue: 0,
      min: 0,
      max: 24,
      step: 1,
      unit: "px",
      helpText: "Set to 0 to remove the border line.",
      uiGroup: "Who We Are image border",
      uiOrder: 422,
    }),
  ];
}

function t1AcademicsCardStyleFields(): SchoolTemplateField[] {
  const cardSelector = ".landing-academics__card";
  const iconSelector = ".landing-academics__card .landing-academics__icon";

  return [
    colorField("cardBgColor", "This card background color", cardSelector, {
      target: "cssVariable",
      cssVariable: t1CssVar("home", "academics", "card-bg-color"),
      defaultValue: "",
      uiGroup: "This academic card style",
      uiOrder: 360,
    }),
    colorField("cardIconColor", "This card icon color", iconSelector, {
      target: "cssVariable",
      cssVariable: t1CssVar("home", "academics", "card-icon-color"),
      defaultValue: "",
      uiGroup: "This academic card style",
      uiOrder: 361,
    }),
    colorField(
      "cardIconBgColor",
      "This card icon background color",
      iconSelector,
      {
        target: "cssVariable",
        cssVariable: t1CssVar("home", "academics", "card-icon-bg-color"),
        defaultValue: "",
        uiGroup: "This academic card style",
        uiOrder: 362,
      },
    ),
    imageField("cardIconImage", "This card icon image", iconSelector, {
      target: "cssVariable",
      cssVariable: t1CssVar("home", "academics", "card-icon-image"),
      defaultValue: "",
      helpText:
        "Upload an image to replace this card icon. Leave blank to keep the font icon.",
      uiGroup: "This academic card style",
      uiOrder: 363,
    }),
  ];
}

function t1AcademicsPerformanceFields(): SchoolTemplateField[] {
  return [
    colorField(
      "performanceBgColor",
      "Academic Performance background color",
      ".landing-performance",
      {
        target: "cssVariable",
        cssVariable: t1CssVar("home", "academics", "performance-bg-color"),
        defaultValue: "",
        uiGroup: "Academic Performance card",
        uiOrder: 430,
      },
    ),
    colorField(
      "performanceChartBgColor",
      "Academic Performance inner background color",
      ".landing-performance__chart",
      {
        target: "cssVariable",
        cssVariable: t1CssVar(
          "home",
          "academics",
          "performance-chart-bg-color",
        ),
        defaultValue: "",
        uiGroup: "Academic Performance card",
        uiOrder: 431,
      },
    ),
    textField(
      "performanceEyebrow",
      "Academic Performance label",
      ".landing-performance__header span",
      {
        uiGroup: "Academic Performance content",
        uiOrder: 432,
      },
    ),
    textField(
      "performanceTitle",
      "Academic Performance title",
      ".landing-performance__header strong",
      {
        uiGroup: "Academic Performance content",
        uiOrder: 433,
      },
    ),
    textareaField(
      "performanceBody",
      "Academic Performance writeup",
      ".landing-performance > p",
      {
        uiGroup: "Academic Performance content",
        uiOrder: 434,
      },
    ),
    textField(
      "performanceBarGreenLabel",
      "Chart label 1",
      ".landing-performance__bar--green small",
      {
        uiGroup: "Academic Performance chart",
        uiOrder: 440,
      },
    ),
    colorField(
      "performanceBarGreenColor",
      "Chart color 1",
      ".landing-performance__bar--green span",
      {
        target: "cssVariable",
        cssVariable: t1CssVar(
          "home",
          "academics",
          "performance-bar-green-color",
        ),
        defaultValue: "#0a4d3c",
        uiGroup: "Academic Performance chart",
        uiOrder: 441,
      },
    ),
    numberField(
      "performanceBarGreenHeight",
      "Chart height 1",
      ".landing-performance__bar--green span",
      {
        target: "cssVariable",
        cssVariable: t1CssVar(
          "home",
          "academics",
          "performance-bar-green-height",
        ),
        defaultValue: 82,
        min: 8,
        max: 100,
        step: 1,
        unit: "%",
        uiGroup: "Academic Performance chart",
        uiOrder: 442,
      },
    ),
    textField(
      "performanceBarOrangeLabel",
      "Chart label 2",
      ".landing-performance__bar--orange small",
      {
        uiGroup: "Academic Performance chart",
        uiOrder: 443,
      },
    ),
    colorField(
      "performanceBarOrangeColor",
      "Chart color 2",
      ".landing-performance__bar--orange span",
      {
        target: "cssVariable",
        cssVariable: t1CssVar(
          "home",
          "academics",
          "performance-bar-orange-color",
        ),
        defaultValue: "#ff6b35",
        uiGroup: "Academic Performance chart",
        uiOrder: 444,
      },
    ),
    numberField(
      "performanceBarOrangeHeight",
      "Chart height 2",
      ".landing-performance__bar--orange span",
      {
        target: "cssVariable",
        cssVariable: t1CssVar(
          "home",
          "academics",
          "performance-bar-orange-height",
        ),
        defaultValue: 72,
        min: 8,
        max: 100,
        step: 1,
        unit: "%",
        uiGroup: "Academic Performance chart",
        uiOrder: 445,
      },
    ),
    textField(
      "performanceBarChampagneLabel",
      "Chart label 3",
      ".landing-performance__bar--champagne small",
      {
        uiGroup: "Academic Performance chart",
        uiOrder: 446,
      },
    ),
    colorField(
      "performanceBarChampagneColor",
      "Chart color 3",
      ".landing-performance__bar--champagne span",
      {
        target: "cssVariable",
        cssVariable: t1CssVar(
          "home",
          "academics",
          "performance-bar-champagne-color",
        ),
        defaultValue: "#e9d7b1",
        uiGroup: "Academic Performance chart",
        uiOrder: 447,
      },
    ),
    numberField(
      "performanceBarChampagneHeight",
      "Chart height 3",
      ".landing-performance__bar--champagne span",
      {
        target: "cssVariable",
        cssVariable: t1CssVar(
          "home",
          "academics",
          "performance-bar-champagne-height",
        ),
        defaultValue: 64,
        min: 8,
        max: 100,
        step: 1,
        unit: "%",
        uiGroup: "Academic Performance chart",
        uiOrder: 448,
      },
    ),
  ];
}

function t1GalleryPaginationFields(): SchoolTemplateField[] {
  const selector = ".landing-gallery__pagination";

  return [
    colorField("paginationBgColor", "Pagination button background", selector, {
      target: "cssVariable",
      cssVariable: t1CssVar("home", "gallery", "pagination-bg-color"),
      defaultValue: "#ffffff",
      uiGroup: "Gallery pagination buttons",
      uiOrder: 420,
    }),
    colorField(
      "paginationTextColor",
      "Pagination button text color",
      selector,
      {
        target: "cssVariable",
        cssVariable: t1CssVar("home", "gallery", "pagination-text-color"),
        defaultValue: "rgba(30,30,46,.7)",
        uiGroup: "Gallery pagination buttons",
        uiOrder: 421,
      },
    ),
    colorField(
      "paginationActiveBgColor",
      "Active pagination button background",
      selector,
      {
        target: "cssVariable",
        cssVariable: t1CssVar("home", "gallery", "pagination-active-bg-color"),
        defaultValue: "#0a4d3c",
        uiGroup: "Gallery pagination buttons",
        uiOrder: 422,
      },
    ),
    colorField(
      "paginationActiveTextColor",
      "Active pagination button text color",
      selector,
      {
        target: "cssVariable",
        cssVariable: t1CssVar(
          "home",
          "gallery",
          "pagination-active-text-color",
        ),
        defaultValue: "#ffffff",
        uiGroup: "Gallery pagination buttons",
        uiOrder: 423,
      },
    ),
  ];
}

function t1AdmissionsStepFields(): SchoolTemplateField[] {
  const stepSelector = ".landing-step";

  return [
    colorField("stepCardBgColor", "Step card background color", stepSelector, {
      target: "cssVariable",
      cssVariable: t1CssVar("home", "admissions", "step-card-bg-color"),
      defaultValue: "#ffffff",
      uiGroup: "Admission step card",
      uiOrder: 360,
    }),
    colorField(
      "stepNumberColor",
      "Step number text color",
      ".landing-step .landing-step__number",
      {
        target: "cssVariable",
        cssVariable: t1CssVar("home", "admissions", "step-number-color"),
        defaultValue: "rgba(10,77,60,.42)",
        uiGroup: "Admission step text colors",
        uiOrder: 361,
      },
    ),
    colorField("stepTitleColor", "Step title text color", ".landing-step h3", {
      target: "cssVariable",
      cssVariable: t1CssVar("home", "admissions", "step-title-color"),
      defaultValue: "#1e1e2e",
      uiGroup: "Admission step text colors",
      uiOrder: 362,
    }),
    colorField("stepBodyColor", "Step body text color", ".landing-step p", {
      target: "cssVariable",
      cssVariable: t1CssVar("home", "admissions", "step-body-color"),
      defaultValue: "rgba(30,30,46,.72)",
      uiGroup: "Admission step text colors",
      uiOrder: 363,
    }),
    textField(
      "stepNumber",
      "Step number",
      ".landing-step .landing-step__number",
      {
        uiGroup: "Admission step content",
        uiOrder: 370,
      },
    ),
    textField("stepTitle", "Step title", ".landing-step h3", {
      uiGroup: "Admission step content",
      uiOrder: 371,
    }),
    textareaField("stepBody", "Step body", ".landing-step p", {
      uiGroup: "Admission step content",
      uiOrder: 372,
    }),
  ];
}

function t1ContactInfoFields(): SchoolTemplateField[] {
  const contactDetails = [
    {
      key: "address",
      label: "Address",
      selector: ".landing-contact__detail:nth-of-type(1)",
    },
    {
      key: "phone",
      label: "Phone",
      selector: ".landing-contact__detail:nth-of-type(2)",
    },
    {
      key: "email",
      label: "Email",
      selector: ".landing-contact__detail:nth-of-type(3)",
    },
  ];

  return contactDetails.flatMap(({ key, label, selector }, index) => [
    textField(`${key}IconClass`, `${label} icon class`, `${selector} i`, {
      target: "attribute",
      attribute: "class",
      helpText:
        "Font Awesome icon class, e.g. fa-solid fa-phone or fa fa-phone-alt.",
      uiGroup: "Contact info icons and cards",
      uiOrder: 500 + index * 10,
    }),
    colorField(`${key}IconColor`, `${label} icon color`, `${selector} i`, {
      target: "cssVariable",
      cssVariable: t1CssVar("home", "contact", `${key}-icon-color`),
      defaultValue: "#0d6efd",
      uiGroup: "Contact info icons and cards",
      uiOrder: 501 + index * 10,
    }),
    colorField(`${key}CardBgColor`, `${label} info background`, selector, {
      target: "cssVariable",
      cssVariable: t1CssVar("home", "contact", `${key}-card-bg-color`),
      defaultValue: "rgba(255,255,255,.92)",
      uiGroup: "Contact info icons and cards",
      uiOrder: 502 + index * 10,
    }),
  ]);
}

// ── Page-scoped helpers ──────────────────────────────────────
function homeSectionStyle(
  opts: Omit<Parameters<typeof t1SectionStyleFields>[0], "pageKey">,
) {
  return t1SectionStyleFields({ pageKey: "home", ...opts });
}
function homeButtonStyle(
  opts: Omit<Parameters<typeof t1ButtonStyleFields>[0], "pageKey">,
) {
  return t1ButtonStyleFields({ pageKey: "home", ...opts });
}
function homeIconStyle(
  opts: Omit<Parameters<typeof t1IconStyleFields>[0], "pageKey">,
) {
  return t1IconStyleFields({ pageKey: "home", ...opts });
}
function aboutSectionStyle(
  opts: Omit<Parameters<typeof t1SectionStyleFields>[0], "pageKey">,
) {
  return t1SectionStyleFields({ pageKey: "about", ...opts });
}
function aboutButtonStyle(
  opts: Omit<Parameters<typeof t1ButtonStyleFields>[0], "pageKey">,
) {
  return t1ButtonStyleFields({ pageKey: "about", ...opts });
}
function aboutIconStyle(
  opts: Omit<Parameters<typeof t1IconStyleFields>[0], "pageKey">,
) {
  return t1IconStyleFields({ pageKey: "about", ...opts });
}
function t1AboutCardStyleFields({
  sectionKey,
  cardSelector,
  iconSelector,
  titlePrefix,
  defaultCardBgColor = "#ffffff",
  defaultTextColor = "#1e1e2e",
  defaultIconColor = "#0d6efd",
  defaultIconBgColor = "#e8f0fe",
}: {
  sectionKey: string;
  cardSelector: string;
  iconSelector: string;
  titlePrefix: string;
  defaultCardBgColor?: string;
  defaultTextColor?: string;
  defaultIconColor?: string;
  defaultIconBgColor?: string;
}): SchoolTemplateField[] {
  return [
    colorField("cardBgColor", `${titlePrefix} card background`, cardSelector, {
      target: "cssVariable",
      cssVariable: t1CssVar("about", sectionKey, "card-bg-color"),
      defaultValue: defaultCardBgColor,
      uiGroup: "Card style",
      uiOrder: 340,
    }),
    colorField("cardTextColor", `${titlePrefix} card text`, cardSelector, {
      target: "cssVariable",
      cssVariable: t1CssVar("about", sectionKey, "card-text-color"),
      defaultValue: defaultTextColor,
      uiGroup: "Card style",
      uiOrder: 341,
    }),
    colorField("cardIconColor", `${titlePrefix} icon color`, iconSelector, {
      target: "cssVariable",
      cssVariable: t1CssVar("about", sectionKey, "card-icon-color"),
      defaultValue: defaultIconColor,
      uiGroup: "Card style",
      uiOrder: 342,
    }),
    colorField(
      "cardIconBgColor",
      `${titlePrefix} icon background`,
      iconSelector,
      {
        target: "cssVariable",
        cssVariable: t1CssVar("about", sectionKey, "card-icon-bg-color"),
        defaultValue: defaultIconBgColor,
        uiGroup: "Card style",
        uiOrder: 343,
      },
    ),
    backgroundImageField(
      "cardIconImage",
      `${titlePrefix} icon image`,
      iconSelector,
      {
        target: "cssVariable",
        cssVariable: t1CssVar("about", sectionKey, "card-icon-image"),
        defaultValue: "",
        uiGroup: "Card style",
        uiOrder: 344,
        helpText:
          "Upload an image to replace this card icon. Leave blank to keep the font icon.",
      },
    ),
  ];
}
function testimonialsSectionStyle(
  opts: Omit<Parameters<typeof t1SectionStyleFields>[0], "pageKey">,
) {
  return t1SectionStyleFields({ pageKey: "testimonials", ...opts });
}
function testimonialsButtonStyle(
  opts: Omit<Parameters<typeof t1ButtonStyleFields>[0], "pageKey">,
) {
  return t1ButtonStyleFields({ pageKey: "testimonials", ...opts });
}

const formIframePlaceholder =
  '<iframe src="https://docs.google.com/forms/..." width="640" height="1602" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>';

const formIframeHelpText =
  "Paste the full Google Forms iframe embed code. Leave blank to use the Google Form URL field.";

// ── Admission Modal Section (reused across pages) ────────────
const admissionModalSection = {
  id: "admission-modal",
  label: "Admission Modal",
  selector: ".landing-admissions-modal",
  fields: [
    ...t1SectionStyleFields({
      pageKey: "shared",
      sectionKey: "admission",
      selector: ".landing-admissions-modal",
      defaultBackgroundColor: "#ffffff",
    }),
    ...t1TypographyFields({ selector: ".landing-admissions-modal" }),
    textareaField(
      "eyebrow",
      "Eyebrow",
      ".landing-admissions-modal__header .landing-eyebrow",
      { type: "richText", target: "innerHTML" },
    ),
    textareaField("title", "Title", "#admissionsModalLabel", {
      type: "richText",
      target: "innerHTML",
    }),
    linkField("formUrl", "Google Form URL", "iframe", {
      attribute: "src",
    }),
    textareaField("formIframe", "Google Form iframe embed code", "iframe", {
      target: "attribute",
      attribute: "src",
      defaultValue: "",
      placeholder: formIframePlaceholder,
      helpText: formIframeHelpText,
    }),
    textField("formTitle", "Iframe title", "iframe", {
      target: "attribute",
      attribute: "title",
    }),
  ],
};

// ══════════════════════════════════════════════════════════════
// ── MANIFEST ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════

export const dextaAcademy1Manifest = {
  templateSlug: "dexta-academy-1",
  templateName: "Dexta Academy 1",
  sourceDir: "src/app/(public)/dexta-academy-1",
  entryFile: "index.html",
  previewPath: "/dexta-academy-1/index.html",
  assetInventory: {
    directories: ["css", "js", "lib", "scss"],
    stylesheets: ["css/bootstrap.min.css", "css/style.css", "css/enhanced.css"],
    scripts: ["js/main.js"],
  },

  // ────────────────────────────────────────────────────────────
  // SHARED SECTIONS (Navbar + Footer)
  // ────────────────────────────────────────────────────────────
  sharedSections: [
    {
      id: "site-header",
      label: "Navigation",
      selector: ".navbar",
      fields: [
        ...t1SectionStyleFields({
          pageKey: "shared",
          sectionKey: "navbar",
          selector: ".navbar",
          defaultBackgroundColor: "#ffffff",
        }),
        ...t1ButtonStyleFields({
          pageKey: "shared",
          sectionKey: "navbar-cta",
          selector: ".navbar",
          defaultBackgroundColor: "#0d6efd",
          defaultTextColor: "#ffffff",
          defaultBorderColor: "#0d6efd",
        }),
        ...t1TypographyFields({ selector: ".navbar" }),
        imageField("logo", "Logo", ".navbar-brand img", {
          uiGroup: "Logo",
          uiOrder: 0,
        }),
        ...t1ResponsiveLogoFields(),
        colorField("navLinkColor", "Nav link color", ".navbar", {
          target: "cssVariable",
          cssVariable: t1CssVar("shared", "navbar", "nav-link-color"),
          defaultValue: "#696969",
          uiGroup: "Nav links",
          uiOrder: 50,
        }),
        colorField("navLinkHoverColor", "Nav link hover color", ".navbar", {
          target: "cssVariable",
          cssVariable: t1CssVar("shared", "navbar", "nav-link-hover-color"),
          defaultValue: "#0d6efd",
          uiGroup: "Nav links",
          uiOrder: 51,
        }),
        textField("primaryCtaText", "Primary CTA text", ".navbar .btn-primary"),
        linkField("primaryCtaHref", "Primary CTA link", ".navbar .btn-primary"),
        textField("portalCtaText", "Portal button text", ".navbar .btn-portal"),
        linkField("portalCtaHref", "Portal button link", ".navbar .btn-portal"),
      ],
    },
    {
      id: "site-footer",
      label: "Footer",
      selector: ".landing-footer",
      fields: [
        ...t1SectionStyleFields({
          pageKey: "shared",
          sectionKey: "footer",
          selector: ".landing-footer",
          defaultBackgroundColor: "#1a1a2e",
        }),
        ...t1TypographyFields({ selector: ".landing-footer" }),
        textareaField(
          "copyright",
          "Copyright text",
          ".landing-footer__inner p",
          {
            type: "richText",
            target: "innerHTML",
          },
        ),
      ],
    },
  ],

  // ────────────────────────────────────────────────────────────
  // PAGES
  // ────────────────────────────────────────────────────────────
  pages: [
    // ══════════════════════════════════════════════════════════
    // HOME PAGE
    // ══════════════════════════════════════════════════════════
    {
      slug: "home",
      fileName: "index.html",
      title: "Home",
      isHome: true,
      sections: [
        {
          id: "hero",
          label: "Hero",
          selector: ".school-hero",
          fields: [
            ...homeSectionStyle({
              sectionKey: "hero",
              selector: ".school-hero",
              defaultBackgroundColor: "#ffffff",
            }),
            ...homeButtonStyle({
              sectionKey: "hero",
              selector: ".school-hero",
              defaultBackgroundColor: "#0d6efd",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "#0d6efd",
            }),
            ...t1TypographyFields({ selector: ".school-hero" }),
            ...t1HeroResponsiveTextFields(),
            ...t1HeroAnimatedLineFields(),
            ...t1HeroCardBackgroundFields(),
            textareaField("headline", "Headline", ".school-hero__title", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("body", "Body", ".school-hero__text", {
              type: "richText",
              target: "innerHTML",
            }),
            imageField(
              "primaryImage",
              "Hero image",
              ".school-hero__photo-card--center img",
            ),
            imageField(
              "secondaryImage",
              "Secondary image",
              ".school-hero__photo-card--top img",
            ),
            imageField(
              "tertiaryImage",
              "Tertiary image",
              ".school-hero__photo-card--bottom img",
            ),
            textField(
              "primaryCtaText",
              "Primary CTA text",
              ".school-hero__btn--primary",
            ),
            linkField(
              "primaryCtaHref",
              "Primary CTA link",
              ".school-hero__btn--primary",
            ),
            textField(
              "secondaryCtaText",
              "Secondary CTA text",
              ".school-hero__btn--secondary",
            ),
            linkField(
              "secondaryCtaHref",
              "Secondary CTA link",
              ".school-hero__btn--secondary",
            ),
          ],
        },
        {
          id: "about-preview",
          label: "About Preview",
          selector: ".landing-section--about",
          fields: [
            ...homeSectionStyle({
              sectionKey: "about-preview",
              selector: ".landing-section--about",
              defaultBackgroundColor: "#ffffff",
            }),
            ...t1TypographyFields({ selector: ".landing-section--about" }),
            imageField("image", "Image", ".landing-about__media img"),
            ...t1AboutPreviewImageBorderFields(),
            textareaField("eyebrow", "Eyebrow", ".landing-eyebrow", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("title", "Title", ".landing-heading", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("body", "Body", ".landing-copy", {
              type: "richText",
              target: "innerHTML",
            }),
          ],
        },
        {
          id: "academics",
          label: "Academics",
          selector: ".landing-section--academics",
          fields: [
            ...homeSectionStyle({
              sectionKey: "academics",
              selector: ".landing-section--academics",
              defaultBackgroundColor: "#f8f9fa",
            }),
            ...t1TypographyFields({ selector: ".landing-section--academics" }),
            textareaField("eyebrow", "Eyebrow", ".landing-eyebrow", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("title", "Title", ".landing-heading", {
              type: "richText",
              target: "innerHTML",
            }),
            textField("cardTitle", "Card title", ".landing-academics__card h3"),
            textareaField(
              "cardBody",
              "Card body",
              ".landing-academics__card p",
            ),
            textField(
              "iconClass",
              "This card icon class",
              ".landing-academics__card .landing-academics__icon i",
              {
                target: "attribute",
                attribute: "class",
                helpText:
                  "Font Awesome icon class, e.g. fa-solid fa-book or fa fa-book.",
              },
            ),
            ...t1AcademicsCardStyleFields(),
            ...t1AcademicsPerformanceFields(),
          ],
          repeatable: {
            itemSelector: ".landing-academics__card",
            labelSingular: "Academic card",
            labelPlural: "Academic cards",
          },
        },
        {
          id: "gallery",
          label: "Gallery",
          selector: ".landing-section--gallery",
          fields: [
            ...homeSectionStyle({
              sectionKey: "gallery",
              selector: ".landing-section--gallery",
              defaultBackgroundColor: "#ffffff",
            }),
            ...t1TypographyFields({ selector: ".landing-section--gallery" }),
            textareaField("eyebrow", "Eyebrow", ".landing-eyebrow", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("title", "Title", ".landing-heading", {
              type: "richText",
              target: "innerHTML",
            }),
            ...t1GalleryPaginationFields(),
            imageField("image", "Image", ".landing-gallery__item img"),
            textField(
              "captionTitle",
              "Caption title",
              ".landing-gallery__body strong",
            ),
            textareaField(
              "captionBody",
              "Caption body",
              ".landing-gallery__body span",
            ),
          ],
          repeatable: {
            itemSelector: ".landing-gallery__item",
            labelSingular: "Gallery item",
            labelPlural: "Gallery items",
          },
        },
        {
          id: "testimonials",
          label: "Testimonials",
          selector: ".landing-section--testimonials",
          fields: [
            ...homeSectionStyle({
              sectionKey: "testimonials",
              selector: ".landing-section--testimonials",
              defaultBackgroundColor: "#ffffff",
            }),
            ...t1TypographyFields({
              selector: ".landing-section--testimonials",
            }),
            textareaField("title", "Section title", ".landing-heading", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("quote", "Quote", ".landing-testimonial p", {
              type: "richText",
              target: "innerHTML",
            }),
            textField("author", "Name", ".landing-testimonial strong"),
            selectField(
              "relationship",
              "Parent or guardian",
              ".landing-testimonial__person span",
              [
                { label: "Parent", value: "Parent" },
                { label: "Guardian", value: "Guardian" },
              ],
              {
                uiGroup: "Testimonial content",
                uiOrder: 360,
              },
            ),
          ],
          repeatable: {
            itemSelector: ".landing-testimonial",
            labelSingular: "Testimonial",
            labelPlural: "Testimonials",
          },
        },
        {
          id: "admissions",
          label: "Admissions",
          selector: "#admissions",
          fields: [
            ...homeSectionStyle({
              sectionKey: "admissions",
              selector: "#admissions",
              defaultBackgroundColor: "#ffffff",
            }),
            ...homeButtonStyle({
              sectionKey: "admissions",
              selector: "#admissions",
              defaultBackgroundColor: "#0d6efd",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "#0d6efd",
            }),
            ...t1TypographyFields({ selector: "#admissions" }),
            textareaField("title", "Title", ".landing-heading", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("eyebrow", "Eyebrow", ".landing-eyebrow", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("body", "Body", ".landing-copy", {
              type: "richText",
              target: "innerHTML",
            }),
            ...t1AdmissionsStepFields(),
            textField("ctaText", "CTA text", ".btn, a.btn"),
            linkField("ctaHref", "CTA link", ".btn, a.btn"),
          ],
          repeatable: {
            itemSelector: ".landing-step",
            labelSingular: "Admission step",
            labelPlural: "Admission steps",
          },
        },
        {
          id: "contact",
          label: "Contact",
          selector: "#contact",
          fields: [
            ...homeSectionStyle({
              sectionKey: "contact",
              selector: "#contact",
              defaultBackgroundColor: "#ffffff",
            }),
            ...homeIconStyle({
              sectionKey: "contact",
              selector: "#contact",
              defaultIconColor: "#0d6efd",
              defaultIconBgColor: "#ffffff",
              defaultIconBgOpacity: 0,
              defaultIconBorderColor: "#0d6efd",
              defaultIconBorderWidth: 0,
            }),
            ...t1TypographyFields({ selector: "#contact" }),
            textareaField("eyebrow", "Eyebrow", ".landing-eyebrow", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("title", "Title", ".landing-heading, h2", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("body", "Body", ".landing-copy", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField(
              "address",
              "Address",
              ".landing-contact__detail:nth-of-type(1) span",
            ),
            textField(
              "phone",
              "Phone number",
              ".landing-contact__detail:nth-of-type(2) span",
            ),
            linkField(
              "phoneHref",
              "Phone link",
              ".landing-contact__detail:nth-of-type(2)",
            ),
            textField(
              "email",
              "Email address",
              ".landing-contact__detail:nth-of-type(3) span",
            ),
            linkField(
              "emailHref",
              "Email link",
              ".landing-contact__detail:nth-of-type(3)",
            ),
            ...t1ContactInfoFields(),
            linkField(
              "socialInstagram",
              "Instagram link",
              ".landing-contact__socials a:nth-of-type(1)",
            ),
            linkField(
              "socialFacebook",
              "Facebook link",
              ".landing-contact__socials a:nth-of-type(2)",
            ),
            linkField(
              "socialLinkedin",
              "LinkedIn link",
              ".landing-contact__socials a:nth-of-type(3)",
            ),
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
        admissionModalSection,
      ],
    },

    // ══════════════════════════════════════════════════════════
    // ABOUT PAGE
    // ══════════════════════════════════════════════════════════
    {
      slug: "about",
      fileName: "about.html",
      title: "About",
      sections: [
        {
          id: "hero",
          label: "About Hero",
          selector: ".about-page__hero",
          fields: [
            ...aboutSectionStyle({
              sectionKey: "hero",
              selector: ".about-page__hero",
              defaultBackgroundColor: "#ffffff",
            }),
            ...t1TypographyFields({ selector: ".about-page__hero" }),
            textareaField("title", "Title", "h1", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("body", "Body", "p", {
              type: "richText",
              target: "innerHTML",
            }),
            imageField("image", "Image", "img"),
          ],
        },
        {
          id: "vision",
          label: "Vision & Mission",
          selector: ".about-page__section--vision",
          fields: [
            ...aboutSectionStyle({
              sectionKey: "vision",
              selector: ".about-page__section--vision",
              defaultBackgroundColor: "#ffffff",
            }),
            ...aboutIconStyle({
              sectionKey: "vision",
              selector: ".about-page__section--vision",
              defaultIconColor: "#0d6efd",
              defaultIconBgColor: "#e8f0fe",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "#0d6efd",
            }),
            ...t1TypographyFields({
              selector: ".about-page__section--vision",
            }),
            ...t1AboutCardStyleFields({
              sectionKey: "vision",
              cardSelector: ".about-page__panel",
              iconSelector: ".about-page__panel-icon",
              titlePrefix: "Panel",
            }),
            textField("panelTitle", "Panel title", "h3"),
            textareaField("panelBody", "Panel body", "p", {
              type: "richText",
              target: "innerHTML",
            }),
            textField("iconClass", "Icon class", ".about-page__panel-icon i", {
              target: "attribute",
              attribute: "class",
              helpText:
                "Font Awesome icon class, e.g. fa-solid fa-eye or fa fa-eye.",
            }),
          ],
          repeatable: {
            itemSelector: ".about-page__panel",
            labelSingular: "Panel",
            labelPlural: "Panels",
          },
        },
        {
          id: "values",
          label: "Core Values",
          selector: ".about-page__section--values",
          fields: [
            ...aboutSectionStyle({
              sectionKey: "values",
              selector: ".about-page__section--values",
              defaultBackgroundColor: "#f8f9fa",
            }),
            ...aboutIconStyle({
              sectionKey: "values",
              selector: ".about-page__section--values",
              defaultIconColor: "#0d6efd",
              defaultIconBgColor: "#e8f0fe",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "#0d6efd",
            }),
            ...t1TypographyFields({
              selector: ".about-page__section--values",
            }),
            textareaField(
              "eyebrow",
              "Eyebrow",
              ".about-page__section-intro .about-page__eyebrow",
              { type: "richText", target: "innerHTML" },
            ),
            textareaField(
              "title",
              "Section title",
              ".about-page__section-intro .about-page__heading",
              { type: "richText", target: "innerHTML" },
            ),
            ...t1AboutCardStyleFields({
              sectionKey: "values",
              cardSelector: ".about-page__value",
              iconSelector: ".about-page__value-icon",
              titlePrefix: "Value",
              defaultCardBgColor: "#ffffff",
            }),
            textField("valueTitle", "Value title", "h3"),
            textareaField("valueBody", "Value body", "p"),
            textField("iconClass", "Icon class", ".about-page__value-icon i", {
              target: "attribute",
              attribute: "class",
              helpText:
                "Font Awesome icon class, e.g. fa-solid fa-award or fa fa-award.",
            }),
          ],
          repeatable: {
            itemSelector: "article, .about-page__value",
            labelSingular: "Value",
            labelPlural: "Values",
          },
        },
        {
          id: "story",
          label: "Our Story",
          selector: ".about-page__section--story",
          fields: [
            ...aboutSectionStyle({
              sectionKey: "story",
              selector: ".about-page__section--story",
              defaultBackgroundColor: "#ffffff",
            }),
            ...aboutButtonStyle({
              sectionKey: "story",
              selector: ".about-page__section--story",
              defaultBackgroundColor: "#0d6efd",
              defaultTextColor: "#ffffff",
              defaultBorderColor: "#0d6efd",
            }),
            ...t1TypographyFields({
              selector: ".about-page__section--story",
            }),
            textareaField("eyebrow", "Eyebrow", ".about-page__eyebrow", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField(
              "title",
              "Title",
              ".about-page__story-copy > .about-page__heading",
              {
                type: "richText",
                target: "innerHTML",
              },
            ),
            textareaField(
              "body1",
              "Preview paragraph 1",
              ".about-page__story-copy > p:nth-of-type(1)",
              { type: "richText", target: "innerHTML" },
            ),
            textareaField(
              "body2",
              "Preview paragraph 2",
              ".about-page__story-copy > p:nth-of-type(2)",
              { type: "richText", target: "innerHTML" },
            ),
            textField("statValue", "Stat value", ".about-page__stat strong"),
            textareaField("statLabel", "Stat label", ".about-page__stat span"),
            textField("ctaText", "Read more button text", "#readMoreBtn"),
            imageField("image", "Image", ".about-page__story-image img"),
            textField(
              "quoteEyebrow",
              "Image overlay eyebrow",
              ".about-page__story-quote small",
            ),
            textareaField(
              "quoteText",
              "Image overlay quote",
              ".about-page__story-quote strong",
            ),
          ],
          repeatable: {
            itemSelector: ".about-page__stat",
            labelSingular: "Story stat",
            labelPlural: "Story stats",
          },
        },
        {
          id: "story-modal",
          label: "Story Modal",
          selector: "#storyModal .modal-content",
          fields: [
            textField("title", "Modal title", "#storyModalLabel"),
            textareaField(
              "bodyHtml",
              "Full story",
              ".about-page__story-modal-content",
              {
                type: "richText",
                target: "innerHTML",
                helpText:
                  "Paste the full story here. The editor will shorten the visible story preview to fit this template.",
              },
            ),
          ],
        },
        {
          id: "head-message",
          label: "Head of School Message",
          selector: ".about-page__message",
          fields: [
            ...aboutSectionStyle({
              sectionKey: "head-message",
              selector: ".about-page__message",
              defaultBackgroundColor: "#ffffff",
            }),
            ...t1TypographyFields({ selector: ".about-page__message" }),
            imageField("image", "Image", ".about-page__message-image img"),
            textareaField("eyebrow", "Eyebrow", ".about-page__eyebrow", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("title", "Title", "h2", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("body", "Body", ".about-page__copy", {
              type: "richText",
              target: "innerHTML",
            }),
            textField(
              "signatureName",
              "Signature name",
              ".about-page__signature strong",
            ),
            textField(
              "signatureMeta",
              "Signature meta",
              ".about-page__signature span",
            ),
          ],
        },
        {
          id: "reasons",
          label: "Why Families Choose Us",
          selector: ".about-page__section--reasons",
          fields: [
            ...aboutSectionStyle({
              sectionKey: "reasons",
              selector: ".about-page__section--reasons",
              defaultBackgroundColor: "#f8f9fa",
            }),
            ...t1TypographyFields({
              selector: ".about-page__section--reasons",
            }),
            textareaField("eyebrow", "Eyebrow", ".about-page__eyebrow", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("title", "Title", "h2", {
              type: "richText",
              target: "innerHTML",
            }),
            textField("reasonTitle", "Reason title", "h3"),
            textareaField("reasonBody", "Reason body", "p"),
          ],
          repeatable: {
            itemSelector: ".about-page__reason",
            labelSingular: "Reason",
            labelPlural: "Reasons",
          },
        },
        {
          id: "about-cta",
          label: "Call To Action",
          selector: ".about-page__cta",
          fields: [
            ...aboutSectionStyle({
              sectionKey: "cta",
              selector: ".about-page__cta",
              defaultBackgroundColor: "#0d6efd",
            }),
            colorField(
              "cardBgColor",
              "Card background",
              ".about-page__cta-card",
              {
                target: "cssVariable",
                cssVariable: t1CssVar("about", "cta", "card-bg-color"),
                defaultValue: "#0d6efd",
                uiGroup: "Card style",
                uiOrder: 120,
              },
            ),
            ...aboutButtonStyle({
              sectionKey: "cta",
              selector: ".about-page__cta",
              defaultBackgroundColor: "#ffffff",
              defaultTextColor: "#0d6efd",
              defaultBorderColor: "#ffffff",
            }),
            ...t1TypographyFields({ selector: ".about-page__cta" }),
            textareaField("eyebrow", "Eyebrow", ".about-page__eyebrow", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("title", "Title", "h2", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("body", "Body", ".about-page__copy", {
              type: "richText",
              target: "innerHTML",
            }),
            textField("ctaText", "CTA text", ".about-page__button"),
            linkField("ctaHref", "CTA link", ".about-page__button"),
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════
    // TESTIMONIALS PAGE
    // ══════════════════════════════════════════════════════════
    {
      slug: "testimonials",
      fileName: "testimonial.html",
      title: "Testimonials",
      sections: [
        {
          id: "hero",
          label: "Testimonials Hero",
          selector: ".testimonials-page__hero",
          fields: [
            ...testimonialsSectionStyle({
              sectionKey: "hero",
              selector: ".testimonials-page__hero",
              defaultBackgroundColor: "#ffffff",
            }),
            ...t1TypographyFields({ selector: ".testimonials-page__hero" }),
            textareaField("title", "Title", "h1", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("body", "Body", "p", {
              type: "richText",
              target: "innerHTML",
            }),
            imageField(
              "image",
              "Hero image",
              ".testimonials-page__hero-main img",
            ),
            textareaField(
              "quoteText",
              "Hero quote",
              ".testimonials-page__hero-quote div strong",
            ),
            textField(
              "quoteAuthor",
              "Hero quote author",
              ".testimonials-page__hero-quote div span",
            ),
          ],
        },
        {
          id: "success-story",
          label: "Featured Success Story",
          selector: ".testimonials-page__section--story",
          fields: [
            ...testimonialsSectionStyle({
              sectionKey: "success-story",
              selector: ".testimonials-page__section--story",
              defaultBackgroundColor: "#ffffff",
            }),
            ...t1TypographyFields({
              selector: ".testimonials-page__section--story",
            }),
            imageField("image", "Image", ".testimonials-page__video-card img"),
            linkField(
              "videoUrl",
              "Video link",
              ".testimonials-page__video-card",
              {
                attribute: "data-video-url",
                helpText:
                  "Paste a YouTube, Vimeo, or direct video link. The image and play icon will open it in a modal.",
              },
            ),
            textField(
              "duration",
              "Duration label",
              ".testimonials-page__video-duration",
            ),
            textareaField(
              "caption",
              "Caption",
              ".testimonials-page__story-caption",
              { type: "richText", target: "innerHTML" },
            ),
            textareaField(
              "eyebrow",
              "Eyebrow",
              ".testimonials-page__story-copy > .testimonials-page__eyebrow",
              {
                type: "richText",
                target: "innerHTML",
              },
            ),
            textareaField(
              "title",
              "Title",
              ".testimonials-page__story-copy > h2",
              {
                type: "richText",
                target: "innerHTML",
              },
            ),
            textareaField("body", "Body", ".testimonials-page__story-body", {
              type: "richText",
              target: "innerHTML",
            }),
            textField("since", "Since text", ".testimonials-page__since"),
          ],
        },
        {
          id: "testimonial-wall",
          label: "Family Notes",
          selector: ".testimonials-page__section--wall",
          fields: [
            ...testimonialsSectionStyle({
              sectionKey: "wall",
              selector: ".testimonials-page__section--wall",
              defaultBackgroundColor: "#f8f9fa",
            }),
            ...t1TypographyFields({
              selector: ".testimonials-page__section--wall",
            }),
            textareaField(
              "eyebrow",
              "Eyebrow",
              ".testimonials-page__section-intro .testimonials-page__eyebrow",
              { type: "richText", target: "innerHTML" },
            ),
            textareaField(
              "title",
              "Title",
              ".testimonials-page__section-intro .testimonials-page__heading",
              { type: "richText", target: "innerHTML" },
            ),
            textareaField(
              "body",
              "Intro text",
              ".testimonials-page__section-intro > p",
              { type: "richText", target: "innerHTML" },
            ),
            textareaField(
              "quote",
              "Quote",
              ".testimonials-page__wall-card > p",
              {
                type: "richText",
                target: "innerHTML",
              },
            ),
            textField(
              "author",
              "Family name",
              ".testimonials-page__wall-meta strong",
            ),
            textField("year", "Year", ".testimonials-page__wall-meta span"),
            imageField("image", "Image", ".testimonials-page__wall-avatar"),
          ],
          repeatable: {
            itemSelector: ".testimonials-page__wall-card",
            labelSingular: "Family note",
            labelPlural: "Family notes",
          },
        },
        {
          id: "testimonials-cta",
          label: "Call To Action",
          selector: ".testimonials-page__section--cta",
          fields: [
            ...testimonialsSectionStyle({
              sectionKey: "cta",
              selector: ".testimonials-page__section--cta",
              defaultBackgroundColor: "#0d6efd",
            }),
            ...testimonialsButtonStyle({
              sectionKey: "cta",
              selector: ".testimonials-page__section--cta",
              defaultBackgroundColor: "#ffffff",
              defaultTextColor: "#0d6efd",
              defaultBorderColor: "#ffffff",
            }),
            ...t1TypographyFields({
              selector: ".testimonials-page__section--cta",
            }),
            colorField(
              "ctaCardBgColor",
              "CTA card background color",
              ".testimonials-page__cta",
              {
                target: "cssVariable",
                cssVariable: t1CssVar("testimonials", "cta", "card-bg-color"),
                defaultValue: "#0d6efd",
                uiGroup: "CTA card style",
                uiOrder: 150,
              },
            ),
            textareaField("eyebrow", "Eyebrow", ".testimonials-page__eyebrow", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("title", "Title", "h2", {
              type: "richText",
              target: "innerHTML",
            }),
            textareaField("body", "Body", "p", {
              type: "richText",
              target: "innerHTML",
            }),
            textField("ctaText", "CTA text", ".btn-primary"),
          ],
        },
        admissionModalSection,
      ],
    },
  ],
} satisfies SchoolTemplateManifest;
