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

const heroDesktopTreeImage =
  "https://res.cloudinary.com/dxoorukfj/image/upload/v1776872764/Dexta_4_gxj3vr.png";
const heroDesktopBuildingImage =
  "https://res.cloudinary.com/dxoorukfj/image/upload/v1776872761/Dexta_3_adxpsg.png";
const heroMobileBackgroundImage =
  "https://res.cloudinary.com/dxoorukfj/image/upload/v1776960442/ChatGPT_Image_Apr_23_2026_05_07_07_PM_spaysy.png";
const heroStudentsImage =
  "https://res.cloudinary.com/dxoorukfj/image/upload/v1777044586/Untitled_design_6_foe65y.png";
const aboutLearningImage =
  "https://res.cloudinary.com/dxoorukfj/image/upload/v1777040923/ChatGPT_Image_Apr_24_2026_03_28_15_PM_afjcpv.png";
const aboutFamilyChoiceImage =
  "https://res.cloudinary.com/dxoorukfj/image/upload/v1777041124/ChatGPT_Image_Apr_24_2026_03_31_43_PM_ssnnin.png";
const aboutFamilyChoiceSecondaryImage =
  "https://res.cloudinary.com/dxoorukfj/image/upload/v1777041228/ChatGPT_Image_Apr_24_2026_03_33_32_PM_mbqpse.png";
const admissionFormUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSdSXga8Z8UfldowUxZDw8b_fylxfQThhZqiuZUZnWtKWRBeSQ/viewform?embedded=true";
const contactFormUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLScHSufroE92p8YNZ2MWkH1lrkH0lWt2aNTmHSM58UwdH7DO2g/viewform?embedded=true";
const formIframePlaceholder =
  '<iframe src="https://docs.google.com/forms/..." width="640" height="1602" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>';
const formIframeHelpText =
  "Paste the full Google Forms iframe embed code. Leave blank to use the Google Form URL field.";
const schoolAddress = "12 Excellence Drive, Lagos, Nigeria";
const schoolPhone = "+234 801 234 5678";
const schoolPhoneHref = "tel:+2348012345678";
const schoolEmail = "info@dxtacademy.edu.ng";
const schoolEmailHref = "mailto:info@dxtacademy.edu.ng";
const schoolHours = "Monday to Friday, 8:00 AM - 4:00 PM";
const footerDescription =
  "DXT Academy is committed to raising confident leaders through academic excellence, strong character, and a deep sense of purpose.";

function admissionFormFields({
  defaultFormUrl = admissionFormUrl,
  defaultFormTitle = "DXT Academy admission form",
}: {
  defaultFormUrl?: string;
  defaultFormTitle?: string;
} = {}) {
  return [
    linkField("formUrl", "Google Form URL", "iframe", {
      attribute: "data-src",
      defaultValue: defaultFormUrl,
      helpText:
        "Paste the Google Forms embedded URL for the admissions form. Use the iframe field below when you have the full embed code. Leave blank to keep using the shared admissions form.",
    }),
    textareaField("formIframe", "Google Form iframe embed code", "iframe", {
      target: "attribute",
      attribute: "data-src",
      defaultValue: "",
      placeholder: formIframePlaceholder,
      helpText: formIframeHelpText,
    }),
    textField("formTitle", "Iframe title", "iframe", {
      target: "attribute",
      attribute: "title",
      defaultValue: defaultFormTitle,
    }),
  ];
}

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

const templateTwoIconHelpText =
  "Use an installed icon name such as arrow, cap, people, book, trophy, integrity, excellence, respect, responsibility, stem, arts, or sport. Set icon border width to 0 to remove the border.";
const templateTwoFontImportHelpText =
  "Optional. Paste a Google Fonts stylesheet URL, then use that font family inside the rich text font menu.";

function templateTwoHeaderCssVariable(token: string) {
  return `--dexta-academy-2-header-${token}`;
}

function templateTwoPageCssVariable(
  pageKey: string,
  sectionKey: string,
  token: string,
) {
  return `--dexta-academy-2-${pageKey}-${sectionKey}-${token}`;
}

function templateTwoSectionStyleFields({
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
      cssVariable: templateTwoPageCssVariable(
        pageKey,
        sectionKey,
        "section-bg-color",
      ),
      defaultValue: defaultBackgroundColor,
      uiGroup: "Section background",
      uiOrder: 100,
    }),
    numberField("sectionBgOpacity", "Section background opacity", selector, {
      target: "cssVariable",
      cssVariable: templateTwoPageCssVariable(
        pageKey,
        sectionKey,
        "section-bg-opacity",
      ),
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
              cssVariable: templateTwoPageCssVariable(
                pageKey,
                sectionKey,
                "section-bg-image",
              ),
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
              cssVariable: templateTwoPageCssVariable(
                pageKey,
                sectionKey,
                "section-bg-position",
              ),
              defaultValue: "center center",
              uiGroup: "Section background",
              uiOrder: 103,
            },
          ),
          textField("sectionBgSize", "Background image size", selector, {
            target: "cssVariable",
            cssVariable: templateTwoPageCssVariable(
              pageKey,
              sectionKey,
              "section-bg-size",
            ),
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

function homeSectionStyleFields(
  options: Omit<Parameters<typeof templateTwoSectionStyleFields>[0], "pageKey">,
) {
  return templateTwoSectionStyleFields({ pageKey: "home", ...options });
}

function aboutSectionStyleFields(
  options: Omit<Parameters<typeof templateTwoSectionStyleFields>[0], "pageKey">,
) {
  return templateTwoSectionStyleFields({ pageKey: "about", ...options });
}

function academicsSectionStyleFields(
  options: Omit<Parameters<typeof templateTwoSectionStyleFields>[0], "pageKey">,
) {
  return templateTwoSectionStyleFields({ pageKey: "academics", ...options });
}

function admissionsSectionStyleFields(
  options: Omit<Parameters<typeof templateTwoSectionStyleFields>[0], "pageKey">,
) {
  return templateTwoSectionStyleFields({ pageKey: "admissions", ...options });
}

function studentLifeSectionStyleFields(
  options: Omit<Parameters<typeof templateTwoSectionStyleFields>[0], "pageKey">,
) {
  return templateTwoSectionStyleFields({ pageKey: "student-life", ...options });
}

function contactSectionStyleFields(
  options: Omit<Parameters<typeof templateTwoSectionStyleFields>[0], "pageKey">,
) {
  return templateTwoSectionStyleFields({ pageKey: "contact", ...options });
}

function homeTypographyFields({
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
      helpText: templateTwoFontImportHelpText,
      uiGroup: "Rich text fonts",
      uiOrder: 200,
    }),
  ];
}

function aboutTypographyFields(
  options: Parameters<typeof homeTypographyFields>[0],
) {
  return homeTypographyFields(options);
}

function academicsTypographyFields(
  options: Parameters<typeof homeTypographyFields>[0],
) {
  return homeTypographyFields(options);
}

function admissionsTypographyFields(
  options: Parameters<typeof homeTypographyFields>[0],
) {
  return homeTypographyFields(options);
}

function studentLifeTypographyFields(
  options: Parameters<typeof homeTypographyFields>[0],
) {
  return homeTypographyFields(options);
}

function contactTypographyFields(
  options: Parameters<typeof homeTypographyFields>[0],
) {
  return homeTypographyFields(options);
}

function templateTwoButtonStyleFields({
  pageKey,
  sectionKey,
  selector,
  defaultBackgroundColor = "#ffc433",
  defaultBackgroundOpacity = 100,
  defaultTextColor = "#0c1d2d",
  defaultBorderColor = "#ffc433",
  defaultBorderWidth = 0,
  includeIcon = true,
  iconSelector = ".button [data-icon]",
}: {
  pageKey: string;
  sectionKey: string;
  selector: string;
  defaultBackgroundColor?: string;
  defaultBackgroundOpacity?: number;
  defaultTextColor?: string;
  defaultBorderColor?: string;
  defaultBorderWidth?: number;
  includeIcon?: boolean;
  iconSelector?: string;
}): SchoolTemplateField[] {
  return [
    colorField("buttonBgColor", "Button background color", selector, {
      target: "cssVariable",
      cssVariable: templateTwoPageCssVariable(
        pageKey,
        sectionKey,
        "button-bg-color",
      ),
      defaultValue: defaultBackgroundColor,
      uiGroup: "Button style",
      uiOrder: 300,
    }),
    numberField("buttonBgOpacity", "Button background opacity", selector, {
      target: "cssVariable",
      cssVariable: templateTwoPageCssVariable(
        pageKey,
        sectionKey,
        "button-bg-opacity",
      ),
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
      cssVariable: templateTwoPageCssVariable(
        pageKey,
        sectionKey,
        "button-text-color",
      ),
      defaultValue: defaultTextColor,
      uiGroup: "Button style",
      uiOrder: 302,
    }),
    colorField("buttonBorderColor", "Button border color", selector, {
      target: "cssVariable",
      cssVariable: templateTwoPageCssVariable(
        pageKey,
        sectionKey,
        "button-border-color",
      ),
      defaultValue: defaultBorderColor,
      uiGroup: "Button style",
      uiOrder: 303,
    }),
    numberField("buttonBorderWidth", "Button border width", selector, {
      target: "cssVariable",
      cssVariable: templateTwoPageCssVariable(
        pageKey,
        sectionKey,
        "button-border-width",
      ),
      defaultValue: defaultBorderWidth,
      min: 0,
      max: 12,
      step: 1,
      unit: "px",
      helpText: "Set to 0 to remove the border.",
      uiGroup: "Button style",
      uiOrder: 304,
    }),
    ...(includeIcon
      ? [
          textField("buttonIconName", "Button icon name", iconSelector, {
            target: "attribute",
            attribute: "data-icon",
            defaultValue: "arrow",
            helpText: templateTwoIconHelpText,
            uiGroup: "Button style",
            uiOrder: 305,
          }),
        ]
      : []),
  ];
}

function homeButtonStyleFields(
  options: Omit<Parameters<typeof templateTwoButtonStyleFields>[0], "pageKey">,
) {
  return templateTwoButtonStyleFields({ pageKey: "home", ...options });
}

function aboutButtonStyleFields(
  options: Omit<Parameters<typeof templateTwoButtonStyleFields>[0], "pageKey">,
) {
  return templateTwoButtonStyleFields({ pageKey: "about", ...options });
}

function admissionsButtonStyleFields(
  options: Omit<Parameters<typeof templateTwoButtonStyleFields>[0], "pageKey">,
) {
  return templateTwoButtonStyleFields({ pageKey: "admissions", ...options });
}

function headerButtonStyleFields({
  keyPrefix,
  labelPrefix,
  tokenPrefix,
  defaultBackgroundColor,
  defaultBackgroundOpacity,
  defaultTextColor,
  defaultBorderColor,
  defaultBorderWidth,
  uiGroup,
  uiOrder,
}: {
  keyPrefix: string;
  labelPrefix: string;
  tokenPrefix: string;
  defaultBackgroundColor: string;
  defaultBackgroundOpacity: number;
  defaultTextColor: string;
  defaultBorderColor: string;
  defaultBorderWidth: number;
  uiGroup: string;
  uiOrder: number;
}): SchoolTemplateField[] {
  return [
    colorField(
      `${keyPrefix}ButtonBgColor`,
      `${labelPrefix} background color`,
      ".site-header",
      {
        target: "cssVariable",
        cssVariable: templateTwoHeaderCssVariable(
          `${tokenPrefix}-button-bg-color`,
        ),
        defaultValue: defaultBackgroundColor,
        uiGroup,
        uiOrder,
      },
    ),
    numberField(
      `${keyPrefix}ButtonBgOpacity`,
      `${labelPrefix} background opacity`,
      ".site-header",
      {
        target: "cssVariable",
        cssVariable: templateTwoHeaderCssVariable(
          `${tokenPrefix}-button-bg-opacity`,
        ),
        defaultValue: defaultBackgroundOpacity,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        uiGroup,
        uiOrder: uiOrder + 1,
      },
    ),
    colorField(
      `${keyPrefix}ButtonTextColor`,
      `${labelPrefix} text color`,
      ".site-header",
      {
        target: "cssVariable",
        cssVariable: templateTwoHeaderCssVariable(
          `${tokenPrefix}-button-text-color`,
        ),
        defaultValue: defaultTextColor,
        uiGroup,
        uiOrder: uiOrder + 2,
      },
    ),
    colorField(
      `${keyPrefix}ButtonBorderColor`,
      `${labelPrefix} border color`,
      ".site-header",
      {
        target: "cssVariable",
        cssVariable: templateTwoHeaderCssVariable(
          `${tokenPrefix}-button-border-color`,
        ),
        defaultValue: defaultBorderColor,
        uiGroup,
        uiOrder: uiOrder + 3,
      },
    ),
    numberField(
      `${keyPrefix}ButtonBorderWidth`,
      `${labelPrefix} border width`,
      ".site-header",
      {
        target: "cssVariable",
        cssVariable: templateTwoHeaderCssVariable(
          `${tokenPrefix}-button-border-width`,
        ),
        defaultValue: defaultBorderWidth,
        min: 0,
        max: 12,
        step: 1,
        unit: "px",
        helpText: "Set to 0 to remove the border.",
        uiGroup,
        uiOrder: uiOrder + 4,
      },
    ),
  ];
}

function templateTwoIconContainerStyleFields({
  pageKey,
  sectionKey,
  selector,
  defaultIconColor,
  defaultIconBgColor = "#ffffff",
  defaultIconBgOpacity = 0,
  defaultIconBorderColor = "#ffc433",
  defaultIconBorderWidth = 1,
}: {
  pageKey: string;
  sectionKey: string;
  selector: string;
  defaultIconColor: string;
  defaultIconBgColor?: string;
  defaultIconBgOpacity?: number;
  defaultIconBorderColor?: string;
  defaultIconBorderWidth?: number;
}): SchoolTemplateField[] {
  return [
    colorField("iconColor", "Icon color", selector, {
      target: "cssVariable",
      cssVariable: templateTwoPageCssVariable(
        pageKey,
        sectionKey,
        "icon-color",
      ),
      defaultValue: defaultIconColor,
      uiGroup: "Icon style",
      uiOrder: 400,
    }),
    colorField("iconBgColor", "Icon background color", selector, {
      target: "cssVariable",
      cssVariable: templateTwoPageCssVariable(
        pageKey,
        sectionKey,
        "icon-bg-color",
      ),
      defaultValue: defaultIconBgColor,
      uiGroup: "Icon style",
      uiOrder: 401,
    }),
    numberField("iconBgOpacity", "Icon background opacity", selector, {
      target: "cssVariable",
      cssVariable: templateTwoPageCssVariable(
        pageKey,
        sectionKey,
        "icon-bg-opacity",
      ),
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
      cssVariable: templateTwoPageCssVariable(
        pageKey,
        sectionKey,
        "icon-border-color",
      ),
      defaultValue: defaultIconBorderColor,
      uiGroup: "Icon style",
      uiOrder: 403,
    }),
    numberField("iconBorderWidth", "Icon border width", selector, {
      target: "cssVariable",
      cssVariable: templateTwoPageCssVariable(
        pageKey,
        sectionKey,
        "icon-border-width",
      ),
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

function homeIconContainerStyleFields(
  options: Omit<
    Parameters<typeof templateTwoIconContainerStyleFields>[0],
    "pageKey"
  >,
) {
  return templateTwoIconContainerStyleFields({ pageKey: "home", ...options });
}

function aboutIconContainerStyleFields(
  options: Omit<
    Parameters<typeof templateTwoIconContainerStyleFields>[0],
    "pageKey"
  >,
) {
  return templateTwoIconContainerStyleFields({ pageKey: "about", ...options });
}

function academicsIconContainerStyleFields(
  options: Omit<
    Parameters<typeof templateTwoIconContainerStyleFields>[0],
    "pageKey"
  >,
) {
  return templateTwoIconContainerStyleFields({
    pageKey: "academics",
    ...options,
  });
}

function admissionsIconContainerStyleFields(
  options: Omit<
    Parameters<typeof templateTwoIconContainerStyleFields>[0],
    "pageKey"
  >,
) {
  return templateTwoIconContainerStyleFields({
    pageKey: "admissions",
    ...options,
  });
}

function studentLifeIconContainerStyleFields(
  options: Omit<
    Parameters<typeof templateTwoIconContainerStyleFields>[0],
    "pageKey"
  >,
) {
  return templateTwoIconContainerStyleFields({
    pageKey: "student-life",
    ...options,
  });
}

function contactIconContainerStyleFields(
  options: Omit<
    Parameters<typeof templateTwoIconContainerStyleFields>[0],
    "pageKey"
  >,
) {
  return templateTwoIconContainerStyleFields({
    pageKey: "contact",
    ...options,
  });
}

function templateTwoRepeatableIconFields({
  pageKey,
  sectionKey,
  selector,
  defaultIconName,
}: {
  pageKey: string;
  sectionKey: string;
  selector: string;
  defaultIconName: string;
}): SchoolTemplateField[] {
  return [
    textField("iconName", "Icon name", selector, {
      target: "attribute",
      attribute: "data-icon",
      defaultValue: defaultIconName,
      helpText: templateTwoIconHelpText,
      uiGroup: "Icon",
      uiOrder: 20,
    }),
    backgroundImageField("iconImage", "Upload icon image", selector, {
      target: "cssVariable",
      cssVariable: templateTwoPageCssVariable(
        pageKey,
        sectionKey,
        "item-icon-image",
      ),
      defaultValue: "",
      helpText:
        "Optional. Upload a custom icon image, then set SVG icon opacity to 0 if you want to hide the installed icon.",
      uiGroup: "Icon",
      uiOrder: 21,
    }),
    numberField("iconSvgOpacity", "SVG icon opacity", selector, {
      target: "cssVariable",
      cssVariable: templateTwoPageCssVariable(
        pageKey,
        sectionKey,
        "item-icon-opacity",
      ),
      defaultValue: 1,
      min: 0,
      max: 1,
      step: 0.05,
      uiGroup: "Icon",
      uiOrder: 22,
    }),
  ];
}

function homeRepeatableIconFields(
  options: Omit<
    Parameters<typeof templateTwoRepeatableIconFields>[0],
    "pageKey"
  >,
) {
  return templateTwoRepeatableIconFields({ pageKey: "home", ...options });
}

function aboutRepeatableIconFields(
  options: Omit<
    Parameters<typeof templateTwoRepeatableIconFields>[0],
    "pageKey"
  >,
) {
  return templateTwoRepeatableIconFields({ pageKey: "about", ...options });
}

function academicsRepeatableIconFields(
  options: Omit<
    Parameters<typeof templateTwoRepeatableIconFields>[0],
    "pageKey"
  >,
) {
  return templateTwoRepeatableIconFields({ pageKey: "academics", ...options });
}

function admissionsRepeatableIconFields(
  options: Omit<
    Parameters<typeof templateTwoRepeatableIconFields>[0],
    "pageKey"
  >,
) {
  return templateTwoRepeatableIconFields({ pageKey: "admissions", ...options });
}

function studentLifeRepeatableIconFields(
  options: Omit<
    Parameters<typeof templateTwoRepeatableIconFields>[0],
    "pageKey"
  >,
) {
  return templateTwoRepeatableIconFields({
    pageKey: "student-life",
    ...options,
  });
}

const academicsOverviewStyleFields = [
  ...academicsSectionStyleFields({
    sectionKey: "overview",
    selector: "main > section:nth-of-type(2)",
    defaultBackgroundColor: "#ffffff",
  }),
  ...academicsTypographyFields({ selector: "main > section:nth-of-type(2)" }),
  ...academicsIconContainerStyleFields({
    sectionKey: "overview",
    selector: "main > section:nth-of-type(2)",
    defaultIconColor: "#9b7104",
    defaultIconBgColor: "#fff4cc",
    defaultIconBgOpacity: 100,
    defaultIconBorderColor: "#fff4cc",
    defaultIconBorderWidth: 0,
  }),
  ...academicsRepeatableIconFields({
    sectionKey: "overview",
    selector: ".info-card__icon",
    defaultIconName: "book",
  }),
];

const academicsSubjectsStyleFields = [
  ...academicsSectionStyleFields({
    sectionKey: "subjects",
    selector: "main > section:nth-of-type(3)",
    defaultBackgroundColor: "#081827",
  }),
  ...academicsTypographyFields({ selector: "main > section:nth-of-type(3)" }),
  ...academicsIconContainerStyleFields({
    sectionKey: "subjects",
    selector: "main > section:nth-of-type(3)",
    defaultIconColor: "#091624",
    defaultIconBgColor: "#ffc433",
    defaultIconBgOpacity: 100,
    defaultIconBorderColor: "#ffc433",
    defaultIconBorderWidth: 0,
  }),
  ...academicsRepeatableIconFields({
    sectionKey: "subjects",
    selector: ".card__badge",
    defaultIconName: "book",
  }),
];

const academicsLearningStyleFields = [
  ...academicsSectionStyleFields({
    sectionKey: "learning",
    selector: "main > section:nth-of-type(4)",
    defaultBackgroundColor: "#ffffff",
  }),
  ...academicsTypographyFields({ selector: "main > section:nth-of-type(4)" }),
  ...academicsIconContainerStyleFields({
    sectionKey: "learning",
    selector: "main > section:nth-of-type(4)",
    defaultIconColor: "#9b7104",
    defaultIconBgColor: "#fff4cc",
    defaultIconBgOpacity: 100,
    defaultIconBorderColor: "#fff4cc",
    defaultIconBorderWidth: 0,
  }),
];

const pageHeroSection = {
  id: "page-hero",
  label: "Page Hero",
  selector: ".page-hero",
  fields: [
    colorField("sectionBgColor", "Section background color", ".page-hero", {
      target: "cssVariable",
      cssVariable: "--dexta-academy-2-page-hero-section-bg-color",
      defaultValue: "#081827",
      uiGroup: "Section background",
      uiOrder: 1,
    }),
    numberField(
      "sectionBgOpacity",
      "Section background opacity",
      ".page-hero",
      {
        target: "cssVariable",
        cssVariable: "--dexta-academy-2-page-hero-section-bg-opacity",
        defaultValue: 100,
        min: 0,
        max: 100,
        step: 1,
        unit: "%",
        uiGroup: "Section background",
        uiOrder: 2,
      },
    ),
    ...homeTypographyFields({
      selector: ".page-hero",
    }),
    textField("breadcrumbs", "Breadcrumbs", ".breadcrumbs"),
    richTextField("eyebrow", "Eyebrow", ".eyebrow"),
    richTextField("title", "Title", ".page-hero__title, h1"),
    richTextField("body", "Body", ".page-hero__copy"),
    backgroundImageField("backgroundImage", "Background image", ".page-hero", {
      target: "cssVariable",
      cssVariable: "--dexta-academy-2-page-hero-background-image",
      defaultValue: heroDesktopTreeImage,
      uiGroup: "Hero images",
      uiOrder: 10,
      helpText: "Main background layer behind the page title.",
    }),
    backgroundImageField(
      "buildingImage",
      "Building overlay image",
      ".page-hero",
      {
        target: "cssVariable",
        cssVariable: "--dexta-academy-2-page-hero-building-image",
        defaultValue: heroDesktopBuildingImage,
        uiGroup: "Hero images",
        uiOrder: 20,
        helpText: "Foreground building layer above the background image.",
      },
    ),
    backgroundImageField(
      "mobileBackgroundImage",
      "Mobile background image",
      ".page-hero",
      {
        target: "cssVariable",
        cssVariable: "--dexta-academy-2-page-hero-mobile-background-image",
        scope: "mobile",
        defaultValue: heroMobileBackgroundImage,
        uiGroup: "Mobile hero images",
        uiOrder: 25,
        helpText: "Small screens can use a separate page hero background.",
      },
    ),
    colorField("overlayColor", "Overlay color", ".page-hero", {
      target: "cssVariable",
      cssVariable: "--dexta-academy-2-page-hero-overlay-color",
      defaultValue: "#04111d",
      uiGroup: "Overlay",
      uiOrder: 30,
    }),
    numberField("overlayOpacity", "Overlay opacity", ".page-hero", {
      target: "cssVariable",
      cssVariable: "--dexta-academy-2-page-hero-overlay-opacity",
      defaultValue: 0.62,
      min: 0,
      max: 1,
      step: 0.05,
      uiGroup: "Overlay",
      uiOrder: 31,
    }),
  ],
};

export const dextaAcademy2Manifest = {
  templateSlug: "dexta-academy-2",
  templateName: "Dexta Academy 2",
  sourceDir: "public/dexta-academy-2",
  entryFile: "index.html",
  previewPath: "/dexta-academy-2/index.html",
  assetInventory: {
    directories: ["assets"],
    stylesheets: ["assets/css/styles.css"],
    scripts: ["assets/js/app.js"],
  },
  sharedSections: [
    {
      id: "site-header",
      label: "Header",
      selector: ".site-header",
      description:
        "Header is injected by assets/js/app.js and appears on every page.",
      fields: [
        textField("brandName", "Brand name", ".brand__copy strong"),
        textField("brandTagline", "Brand tagline", ".brand__copy span"),
        imageField("logo", "Logo", ".brand__mark", {
          helpText:
            "Used when the Navbar theme logo is empty. The Navbar tab logo still takes priority.",
        }),
        textField(
          "portalCtaText",
          "Portal CTA text",
          ".site-header__actions .button--outline-light span:nth-of-type(1), .mobile-panel__actions .button--outline-light span:nth-of-type(1)",
          {
            defaultValue: "Portal",
            uiGroup: "Portal button",
            uiOrder: 10,
          },
        ),
        linkField(
          "portalCtaHref",
          "Portal CTA link",
          ".site-header__actions .button--outline-light, .mobile-panel__actions .button--outline-light",
          {
            defaultValue: "#",
            uiGroup: "Portal button",
            uiOrder: 11,
          },
        ),
        ...headerButtonStyleFields({
          keyPrefix: "portal",
          labelPrefix: "Portal button",
          tokenPrefix: "portal",
          defaultBackgroundColor: "#ffc433",
          defaultBackgroundOpacity: 0,
          defaultTextColor: "#ffffff",
          defaultBorderColor: "#ffc433",
          defaultBorderWidth: 1,
          uiGroup: "Portal button style",
          uiOrder: 30,
        }),
        textField(
          "primaryCtaText",
          "Primary CTA text",
          ".site-header__actions .button--primary span:nth-of-type(1), .mobile-panel__actions .button--primary span:nth-of-type(1)",
          {
            defaultValue: "Apply Now",
            uiGroup: "Primary button",
            uiOrder: 20,
          },
        ),
        linkField(
          "primaryCtaHref",
          "Primary CTA link",
          ".site-header__actions .button--primary, .mobile-panel__actions .button--primary",
          {
            defaultValue: "admissions.html",
            uiGroup: "Primary button",
            uiOrder: 21,
          },
        ),
        ...headerButtonStyleFields({
          keyPrefix: "primary",
          labelPrefix: "Primary button",
          tokenPrefix: "primary",
          defaultBackgroundColor: "#ffc433",
          defaultBackgroundOpacity: 100,
          defaultTextColor: "#0c1d2d",
          defaultBorderColor: "#ffc433",
          defaultBorderWidth: 0,
          uiGroup: "Primary button style",
          uiOrder: 40,
        }),
      ],
    },
    {
      id: "site-footer",
      label: "Footer",
      selector: ".site-footer",
      description:
        "Footer is injected by assets/js/app.js and appears on every page.",
      fields: [
        textField("brandName", "Brand name", ".brand__copy strong", {
          defaultValue: "DXT ACADEMY",
          uiGroup: "Brand",
          uiOrder: 10,
        }),
        textField("brandTagline", "Brand tagline", ".brand__copy span", {
          defaultValue: "Nurturing. Inspiring. Leading.",
          uiGroup: "Brand",
          uiOrder: 11,
        }),
        textareaField("description", "Description", ".footer__main > p", {
          defaultValue: footerDescription,
          uiGroup: "Brand",
          uiOrder: 12,
        }),
        textField(
          "homeLinkText",
          "Home link label",
          ".footer__links a:nth-of-type(1)",
          {
            defaultValue: "Home",
            uiGroup: "Navigation",
            uiOrder: 20,
          },
        ),
        linkField(
          "homeLinkHref",
          "Home link URL",
          ".footer__links a:nth-of-type(1)",
          {
            defaultValue: "index.html",
            uiGroup: "Navigation",
            uiOrder: 21,
          },
        ),
        textField(
          "aboutLinkText",
          "About link label",
          ".footer__links a:nth-of-type(2)",
          {
            defaultValue: "About Us",
            uiGroup: "Navigation",
            uiOrder: 22,
          },
        ),
        linkField(
          "aboutLinkHref",
          "About link URL",
          ".footer__links a:nth-of-type(2)",
          {
            defaultValue: "about.html",
            uiGroup: "Navigation",
            uiOrder: 23,
          },
        ),
        textField(
          "academicsLinkText",
          "Academics link label",
          ".footer__links a:nth-of-type(3)",
          {
            defaultValue: "Academics",
            uiGroup: "Navigation",
            uiOrder: 24,
          },
        ),
        linkField(
          "academicsLinkHref",
          "Academics link URL",
          ".footer__links a:nth-of-type(3)",
          {
            defaultValue: "academics.html",
            uiGroup: "Navigation",
            uiOrder: 25,
          },
        ),
        textField(
          "admissionsLinkText",
          "Admissions link label",
          ".footer__links a:nth-of-type(4)",
          {
            defaultValue: "Admissions",
            uiGroup: "Navigation",
            uiOrder: 26,
          },
        ),
        linkField(
          "admissionsLinkHref",
          "Admissions link URL",
          ".footer__links a:nth-of-type(4)",
          {
            defaultValue: "admissions.html",
            uiGroup: "Navigation",
            uiOrder: 27,
          },
        ),
        textField(
          "studentLifeLinkText",
          "Student Life link label",
          ".footer__links a:nth-of-type(5)",
          {
            defaultValue: "Student Life",
            uiGroup: "Navigation",
            uiOrder: 28,
          },
        ),
        linkField(
          "studentLifeLinkHref",
          "Student Life link URL",
          ".footer__links a:nth-of-type(5)",
          {
            defaultValue: "student-life.html",
            uiGroup: "Navigation",
            uiOrder: 29,
          },
        ),
        textField(
          "galleryLinkText",
          "Gallery link label",
          ".footer__links a:nth-of-type(6)",
          {
            defaultValue: "Gallery",
            uiGroup: "Navigation",
            uiOrder: 30,
          },
        ),
        linkField(
          "galleryLinkHref",
          "Gallery link URL",
          ".footer__links a:nth-of-type(6)",
          {
            defaultValue: "gallery.html",
            uiGroup: "Navigation",
            uiOrder: 31,
          },
        ),
        textField(
          "contactLinkText",
          "Contact link label",
          ".footer__links a:nth-of-type(7)",
          {
            defaultValue: "Contact",
            uiGroup: "Navigation",
            uiOrder: 32,
          },
        ),
        linkField(
          "contactLinkHref",
          "Contact link URL",
          ".footer__links a:nth-of-type(7)",
          {
            defaultValue: "contact.html",
            uiGroup: "Navigation",
            uiOrder: 33,
          },
        ),
        textareaField("address", "Address", ".footer__contact span", {
          defaultValue: schoolAddress,
          uiGroup: "Contact",
          uiOrder: 40,
        }),
        textField("phone", "Phone", ".footer__contact a[href^='tel:']", {
          defaultValue: schoolPhone,
          uiGroup: "Contact",
          uiOrder: 41,
        }),
        linkField(
          "phoneHref",
          "Phone link",
          ".footer__contact a[href^='tel:']",
          {
            defaultValue: schoolPhoneHref,
            uiGroup: "Contact",
            uiOrder: 42,
          },
        ),
        textField("email", "Email", ".footer__contact a[href^='mailto:']", {
          defaultValue: schoolEmail,
          uiGroup: "Contact",
          uiOrder: 43,
        }),
        linkField(
          "emailHref",
          "Email link",
          ".footer__contact a[href^='mailto:']",
          {
            defaultValue: schoolEmailHref,
            uiGroup: "Contact",
            uiOrder: 44,
          },
        ),
        textareaField("copyright", "Copyright", ".footer__bottom > p", {
          defaultValue: "Copyright 2026 DXT Academy. All rights reserved.",
          uiGroup: "Legal",
          uiOrder: 50,
        }),
      ],
    },
    {
      id: "admission-modal",
      label: "Admission Modal",
      selector: ".admission-modal__dialog",
      description:
        "Admission modal is injected by assets/js/app.js and opens from the admission buttons.",
      fields: [
        textField("eyebrow", "Eyebrow", ".admission-modal__header .eyebrow", {
          defaultValue: "Admissions Form",
        }),
        textField("title", "Title", "#admission-modal-title", {
          defaultValue: "Apply to DXT Academy",
        }),
        ...admissionFormFields(),
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
          selector: ".hero-home",
          fields: [
            textField("eyebrow", "Eyebrow", ".eyebrow", {
              defaultValue: "Welcome to DXT Academy",
            }),
            richTextField("headline", "Headline", "h1", {
              defaultValue: "Education <span>That Inspires.</span>",
            }),
            richTextField("body", "Body", ".hero-home__lead", {
              defaultValue:
                "We nurture confident leaders with academic excellence, strong character, and a deep sense of purpose.",
            }),
            ...homeSectionStyleFields({
              sectionKey: "hero",
              selector: ".hero-home",
              defaultBackgroundColor: "#081827",
              includeBackgroundImage: false,
            }),
            ...homeTypographyFields({
              selector: ".hero-home",
            }),
            ...homeButtonStyleFields({
              sectionKey: "hero",
              selector: ".hero-home",
              defaultBackgroundColor: "#ffffff",
              defaultBackgroundOpacity: 0,
              defaultTextColor: "#ffffff",
              defaultBorderColor: "#ffffff",
              defaultBorderWidth: 1,
            }),
            backgroundImageField(
              "desktopTreeImage",
              "Layer 1: desktop tree background",
              ".hero-home",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-2-hero-desktop-tree-image",
                scope: "desktop",
                defaultValue: heroDesktopTreeImage,
                uiGroup: "Desktop background layers",
                uiOrder: 10,
                helpText:
                  "Large screens only. This is the back layer behind the school building.",
              },
            ),
            backgroundImageField(
              "desktopBuildingImage",
              "Layer 2: desktop school building",
              ".hero-home",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-2-hero-desktop-building-image",
                scope: "desktop",
                defaultValue: heroDesktopBuildingImage,
                uiGroup: "Desktop background layers",
                uiOrder: 20,
                helpText:
                  "Large screens only. This image sits above the tree layer and below the overlay/text.",
              },
            ),
            backgroundImageField(
              "mobileHeroImage",
              "Mobile-only background",
              ".hero-home",
              {
                target: "cssVariable",
                cssVariable: "--dexta-academy-2-hero-mobile-image",
                scope: "mobile",
                defaultValue: heroMobileBackgroundImage,
                uiGroup: "Mobile background layer",
                uiOrder: 30,
                helpText:
                  "Mobile screens use this single background image instead of the desktop tree/building stack.",
              },
            ),
            colorField("overlayColor", "Overlay color", ".hero-home", {
              target: "cssVariable",
              cssVariable: "--dexta-academy-2-hero-overlay-color",
              defaultValue: "#04111d",
              uiGroup: "Overlay",
              uiOrder: 40,
              helpText: "Color layer above the images and below the text.",
            }),
            numberField("overlayOpacity", "Overlay opacity", ".hero-home", {
              target: "cssVariable",
              cssVariable: "--dexta-academy-2-hero-overlay-opacity",
              defaultValue: 0.58,
              min: 0,
              max: 1,
              step: 0.05,
              uiGroup: "Overlay",
              uiOrder: 41,
            }),
            imageField(
              "studentsImage",
              "Foreground students image",
              ".hero-home__students",
              {
                defaultValue: heroStudentsImage,
                uiGroup: "Foreground students",
                uiOrder: 50,
                helpText:
                  "This foreground image appears on both large and small screens.",
              },
            ),
            textField(
              "studentsAlt",
              "Students image alt text",
              ".hero-home__students",
              {
                target: "attribute",
                attribute: "alt",
                defaultValue: "DXT Academy students",
                uiGroup: "Foreground students",
                uiOrder: 51,
              },
            ),
            textField("ctaText", "CTA text", ".hero-home__actions .button", {
              defaultValue: "Discover DXT Academy",
            }),
          ],
        },
        {
          id: "stats",
          label: "Hero Stats",
          selector: ".hero-home__stats",
          fields: [
            ...homeSectionStyleFields({
              sectionKey: "stats",
              selector: ".hero-home__stats",
              defaultBackgroundColor: "#081827",
              defaultBackgroundOpacity: 0,
            }),
            ...homeTypographyFields({
              selector: ".hero-home__stats",
            }),
            ...homeIconContainerStyleFields({
              sectionKey: "stats",
              selector: ".hero-home__stats",
              defaultIconColor: "#ffc433",
              defaultIconBgColor: "#081827",
              defaultIconBgOpacity: 0,
              defaultIconBorderColor: "#ffc433",
              defaultIconBorderWidth: 0,
            }),
            ...homeRepeatableIconFields({
              sectionKey: "stats",
              selector: "[data-icon]",
              defaultIconName: "cap",
            }),
            textField("value", "Value", "[data-stat]"),
            textField("label", "Label", ".hero-home__stat-label"),
          ],
          repeatable: {
            itemSelector: "li",
            labelSingular: "Stat",
            labelPlural: "Stats",
          },
        },
        {
          id: "values",
          label: "Values Strip",
          selector: ".values-strip",
          fields: [
            ...homeSectionStyleFields({
              sectionKey: "values",
              selector: ".values-strip",
              defaultBackgroundColor: "#ffffff",
            }),
            ...homeTypographyFields({
              selector: ".values-strip",
            }),
            ...homeIconContainerStyleFields({
              sectionKey: "values",
              selector: ".values-strip",
              defaultIconColor: "#f0b31f",
              defaultIconBgColor: "#ffffff",
              defaultIconBgOpacity: 0,
              defaultIconBorderColor: "#ffc433",
              defaultIconBorderWidth: 1.5,
            }),
            richTextField(
              "introTitle",
              "Intro title",
              ".values-strip__intro h2",
              {
                defaultValue: "Our Values. Their Future.",
              },
            ),
            richTextField("introBody", "Intro body", ".values-strip__intro p", {
              defaultValue:
                "At DXT Academy, values are not posters on walls. They shape decisions, relationships, and every learning moment.",
            }),
            ...homeRepeatableIconFields({
              sectionKey: "values",
              selector: ".value-item__icon",
              defaultIconName: "integrity",
            }),
            richTextField("valueTitle", "Value title", ".value-item h3"),
            richTextField("valueBody", "Value body", ".value-item p"),
          ],
          repeatable: {
            itemSelector: ".value-item",
            labelSingular: "Value",
            labelPlural: "Values",
          },
        },
        {
          id: "about-preview",
          label: "About Preview",
          selector: ".split-showcase",
          fields: [
            ...homeSectionStyleFields({
              sectionKey: "about",
              selector: ".split-showcase",
              defaultBackgroundColor: "#081827",
            }),
            ...homeTypographyFields({
              selector: ".split-showcase",
            }),
            ...homeButtonStyleFields({
              sectionKey: "about",
              selector: ".split-showcase",
            }),
            textField("eyebrow", "Eyebrow", ".eyebrow"),
            richTextField("title", "Title", ".section-title"),
            richTextField("body", "Body", ".section-copy"),
            imageField("image", "Image", ".media-card img"),
            textField("ctaText", "CTA text", ".button"),
          ],
        },
        {
          id: "programs",
          label: "Programs",
          selector: ".programs",
          fields: [
            ...homeSectionStyleFields({
              sectionKey: "programs",
              selector: ".programs",
              defaultBackgroundColor: "#ffffff",
            }),
            ...homeTypographyFields({
              selector: ".programs",
            }),
            ...homeButtonStyleFields({
              sectionKey: "programs",
              selector: ".programs",
            }),
            ...homeIconContainerStyleFields({
              sectionKey: "programs",
              selector: ".programs",
              defaultIconColor: "#091624",
              defaultIconBgColor: "#ffc433",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "#ffc433",
              defaultIconBorderWidth: 0,
            }),
            ...homeRepeatableIconFields({
              sectionKey: "programs",
              selector: ".card__badge",
              defaultIconName: "book",
            }),
            textField("eyebrow", "Eyebrow", ".eyebrow"),
            richTextField("title", "Title", ".section-title"),
            richTextField("body", "Body", ".section-copy"),
            imageField("programImage", "Program image", ".card__media img"),
            richTextField("programTitle", "Program title", ".card__title"),
            richTextField("programBody", "Program body", ".card__text"),
            linkField("programLink", "Program link", ".card__link"),
            richTextField(
              "ctaTitle",
              "Admission banner title",
              ".cta-banner__copy h2",
            ),
            richTextField(
              "ctaBody",
              "Admission banner body",
              ".cta-banner__copy p",
            ),
            textField(
              "ctaText",
              "Admission button text",
              ".cta-banner .button",
            ),
          ],
          repeatable: {
            itemSelector: ".card",
            labelSingular: "Program card",
            labelPlural: "Program cards",
          },
        },
        {
          id: "student-life-preview",
          label: "Student Life Preview",
          selector: "main > section:nth-of-type(5)",
          fields: [
            ...homeSectionStyleFields({
              sectionKey: "student-life",
              selector: "main > section:nth-of-type(5)",
              defaultBackgroundColor: "#ffffff",
            }),
            ...homeTypographyFields({
              selector: "main > section:nth-of-type(5)",
            }),
            ...homeButtonStyleFields({
              sectionKey: "student-life",
              selector: "main > section:nth-of-type(5)",
              defaultBackgroundColor: "#ffffff",
              defaultBackgroundOpacity: 0,
              defaultTextColor: "#12304d",
              defaultBorderColor: "#d6dde6",
              defaultBorderWidth: 1,
            }),
            textField("eyebrow", "Eyebrow", ".news-heading .eyebrow"),
            richTextField("title", "Title", ".news-heading .section-title"),
            richTextField("body", "Body", ".news-heading .section-copy"),
            textField("ctaText", "CTA text", ".button"),
          ],
        },
        {
          id: "student-life-cards",
          label: "Student Life Cards",
          selector: ".news-grid",
          fields: [
            ...homeSectionStyleFields({
              sectionKey: "student-life-cards",
              selector: ".news-grid",
              defaultBackgroundColor: "#ffffff",
              defaultBackgroundOpacity: 0,
            }),
            ...homeTypographyFields({
              selector: ".news-grid",
            }),
            ...homeIconContainerStyleFields({
              sectionKey: "student-life-cards",
              selector: ".news-grid",
              defaultIconColor: "#12304d",
              defaultIconBgColor: "#ffffff",
              defaultIconBgOpacity: 0,
              defaultIconBorderColor: "#12304d",
              defaultIconBorderWidth: 0,
            }),
            ...homeRepeatableIconFields({
              sectionKey: "student-life-cards",
              selector: ".card__link [data-icon]",
              defaultIconName: "arrow",
            }),
            imageField("image", "Image", ".news-card__media img"),
            textField("category", "Category", ".news-card__date"),
            richTextField("title", "Title", ".news-card__title"),
            richTextField("excerpt", "Excerpt", ".news-card__excerpt"),
            textField("ctaText", "CTA text", ".card__link"),
          ],
          repeatable: {
            itemSelector: ".news-card",
            labelSingular: "Student life card",
            labelPlural: "Student life cards",
          },
        },
      ],
    },
    {
      slug: "about",
      fileName: "about.html",
      title: "About",
      sections: [
        pageHeroSection,
        {
          id: "stats",
          label: "Stats",
          selector: "main > section:nth-of-type(2)",
          fields: [
            ...aboutSectionStyleFields({
              sectionKey: "stats",
              selector: "main > section:nth-of-type(2)",
              defaultBackgroundColor: "#ffffff",
            }),
            ...aboutTypographyFields({
              selector: "main > section:nth-of-type(2)",
            }),
            richTextField("value", "Value", ".stat-box strong"),
            richTextField("label", "Label", ".stat-box span"),
          ],
          repeatable: {
            itemSelector: ".stat-box",
            labelSingular: "Stat",
            labelPlural: "Stats",
          },
        },
        {
          id: "who-we-are",
          label: "Who We Are",
          selector: "main > section:nth-of-type(3)",
          fields: [
            ...aboutSectionStyleFields({
              sectionKey: "who-we-are",
              selector: "main > section:nth-of-type(3)",
              defaultBackgroundColor: "#081827",
            }),
            ...aboutTypographyFields({
              selector: "main > section:nth-of-type(3)",
            }),
            richTextField("eyebrow", "Eyebrow", ".eyebrow"),
            richTextField("title", "Title", ".section-title"),
            richTextField("body", "Body", ".section-copy"),
            textField(
              "featureNumber",
              "Feature number",
              ".feature-list__bullet",
            ),
            textField(
              "featureText",
              "Feature text",
              "span:not(.feature-list__bullet)",
              {
                type: "richText",
                target: "innerHTML",
              },
            ),
            imageField("image", "Image", ".feature-split__media img", {
              defaultValue: aboutLearningImage,
            }),
          ],
          repeatable: {
            itemSelector: ".feature-list li",
            labelSingular: "Feature",
            labelPlural: "Features",
          },
        },
        {
          id: "story",
          label: "Story",
          selector: ".about-story-section",
          fields: [
            ...aboutSectionStyleFields({
              sectionKey: "story",
              selector: ".about-story-section",
              defaultBackgroundColor: "#ffffff",
            }),
            ...aboutTypographyFields({
              selector: ".about-story-section",
            }),
            ...aboutButtonStyleFields({
              sectionKey: "story",
              selector: ".about-story-section",
              includeIcon: false,
            }),
            richTextField("eyebrow", "Eyebrow", ".eyebrow"),
            richTextField("title", "Title", ".section-title"),
            richTextField("body", "Preview body", ".section-copy"),
            textField("ctaText", "Read more button text", ".button"),
            imageField("image", "Image", ".feature-split__media img", {
              defaultValue: aboutLearningImage,
            }),
          ],
        },
        {
          id: "story-modal",
          label: "Story Modal",
          selector: ".story-modal__dialog",
          fields: [
            ...aboutSectionStyleFields({
              sectionKey: "story-modal",
              selector: ".story-modal__dialog",
              defaultBackgroundColor: "#ffffff",
            }),
            ...aboutTypographyFields({
              selector: ".story-modal__dialog",
            }),
            richTextField(
              "eyebrow",
              "Eyebrow",
              ".story-modal__header .eyebrow",
              {
                defaultValue: "about us",
              },
            ),
            richTextField("title", "Modal title", "#story-modal-title", {
              defaultValue: "DXT Academy's Journey",
            }),
            textareaField("bodyHtml", "Full story", ".story-modal__content", {
              type: "richText",
              target: "innerHTML",
              defaultValue:
                "<p>DXT Academy was founded with a vision: to create an educational institution where rigorous academics, strong character development, and purposeful leadership converge. What began as a small initiative with a handful of passionate educators has blossomed into a thriving community of over 1,500 students.</p><p>Our story is one of purposeful growth. From day one, we refused to settle for conventional education. We believed that schools should nurture not just brilliant minds but confident, compassionate leaders who understand their role in society. This philosophy became the foundation upon which DXT Academy was built.</p><p>Over the years, we've invested in world-class facilities, recruited exceptional teachers, and developed innovative curricula that blend traditional excellence with 21st-century skills. Our students don't just excel in examinations-they thrive in life. With a 95% university progression rate and countless alumni making meaningful contributions across industries, we've proven that our approach works.</p><p>But our greatest pride isn't our statistics. It's the students who leave our halls as thinkers, problem-solvers, and changemakers. It's the parent testimonials that speak of transformation. It's the teacher stories of breakthrough moments with learners. Every day, DXT Academy lives out its mission: nurturing inspired learners and courageous leaders.</p><p>As we continue to grow, we remain committed to the values that define us-integrity, respect, responsibility, and excellence. We invite you to become part of our story.</p>",
              helpText:
                "Paste the full story here. The editor will shorten the visible story preview to fit this template.",
            }),
          ],
        },
        {
          id: "mission-vision",
          label: "Mission, Vision, Promise",
          selector: "main > section:nth-of-type(5)",
          fields: [
            ...aboutSectionStyleFields({
              sectionKey: "mission-vision",
              selector: "main > section:nth-of-type(5)",
              defaultBackgroundColor: "#fff4cc",
            }),
            ...aboutTypographyFields({
              selector: "main > section:nth-of-type(5)",
            }),
            ...aboutIconContainerStyleFields({
              sectionKey: "mission-vision",
              selector: "main > section:nth-of-type(5)",
              defaultIconColor: "#091624",
              defaultIconBgColor: "#ffc433",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "#ffc433",
              defaultIconBorderWidth: 0,
            }),
            ...aboutRepeatableIconFields({
              sectionKey: "mission-vision",
              selector: ".info-card__icon",
              defaultIconName: "integrity",
            }),
            richTextField("cardTitle", "Card title", ".info-card h3"),
            richTextField("cardBody", "Card body", ".info-card p"),
          ],
          repeatable: {
            itemSelector: ".info-card",
            labelSingular: "Info card",
            labelPlural: "Info cards",
          },
        },
        {
          id: "family-choice",
          label: "Why Families Choose Us",
          selector: "main > section:nth-of-type(6)",
          fields: [
            ...aboutSectionStyleFields({
              sectionKey: "family-choice",
              selector: "main > section:nth-of-type(6)",
              defaultBackgroundColor: "#ffffff",
            }),
            ...aboutTypographyFields({
              selector: "main > section:nth-of-type(6)",
            }),
            imageField(
              "image",
              "Founder/family image",
              ".feature-split__media img",
              {
                defaultValue: aboutFamilyChoiceImage,
                helpText:
                  "Photo shown beside the Why Families Choose Us quote.",
              },
            ),
            backgroundImageField(
              "secondaryImage",
              "Quote side image",
              ".image-stack__block",
              {
                defaultValue: aboutFamilyChoiceSecondaryImage,
                helpText:
                  "Background image shown beside the quote card in this section.",
              },
            ),
            richTextField("eyebrow", "Eyebrow", ".eyebrow"),
            richTextField("title", "Title", ".section-title"),
            richTextField("body", "Body", ".section-copy"),
            richTextField("quote", "Quote", ".quote-card p"),
            richTextField("quoteAuthor", "Quote author", ".quote-card strong"),
          ],
        },
      ],
    },
    {
      slug: "academics",
      fileName: "academics.html",
      title: "Academics",
      sections: [
        pageHeroSection,
        {
          id: "overview",
          label: "Overview",
          selector: "main > section:nth-of-type(2)",
          fields: [
            ...academicsOverviewStyleFields,
            richTextField("overviewTitle", "Overview title", ".info-card h3"),
            richTextField("overviewBody", "Overview body", ".info-card p"),
          ],
          repeatable: {
            itemSelector: ".info-card",
            labelSingular: "Overview card",
            labelPlural: "Overview cards",
          },
        },
        {
          id: "subjects",
          label: "Subjects",
          selector: "main > section:nth-of-type(3)",
          fields: [
            ...academicsSubjectsStyleFields,
            imageField("subjectImage", "Subject image", ".card__media img"),
            textField(
              "subjectImageAlt",
              "Subject image alt text",
              ".card__media img",
              {
                target: "attribute",
                attribute: "alt",
              },
            ),
            richTextField("subjectTitle", "Subject title", ".card__title"),
            richTextField("subjectBody", "Subject body", ".card__text"),
          ],
          repeatable: {
            itemSelector: ".card",
            labelSingular: "Subject",
            labelPlural: "Subjects",
          },
        },
        {
          id: "learning-approach",
          label: "Learning Approach",
          selector: "main > section:nth-of-type(4)",
          fields: [
            ...academicsLearningStyleFields,
            richTextField("eyebrow", "Eyebrow", ".eyebrow"),
            richTextField("title", "Title", ".section-title"),
            richTextField("body", "Body", ".section-copy"),
            textField("stepNumber", "Step number", ".steps__number"),
            richTextField("stepText", "Step text", "span:not(.steps__number)"),
            imageField("image", "Image", ".feature-split__media img"),
            textField(
              "imageAlt",
              "Image alt text",
              ".feature-split__media img",
              {
                target: "attribute",
                attribute: "alt",
              },
            ),
          ],
          repeatable: {
            itemSelector: ".steps li",
            labelSingular: "Learning step",
            labelPlural: "Learning steps",
          },
        },
      ],
    },
    {
      slug: "admissions",
      fileName: "admissions.html",
      title: "Admissions",
      sections: [
        pageHeroSection,
        {
          id: "process",
          label: "Admissions Process",
          selector: "main > section:nth-of-type(2)",
          fields: [
            ...admissionsSectionStyleFields({
              sectionKey: "process",
              selector: "main > section:nth-of-type(2)",
              defaultBackgroundColor: "#ffffff",
            }),
            ...admissionsTypographyFields({
              selector: "main > section:nth-of-type(2)",
            }),
            ...admissionsIconContainerStyleFields({
              sectionKey: "process",
              selector: "main > section:nth-of-type(2)",
              defaultIconColor: "#9b7104",
              defaultIconBgColor: "#fff4cc",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "#fff4cc",
              defaultIconBorderWidth: 0,
            }),
            richTextField("title", "Title", "h2"),
            richTextField("stepTitle", "Step title", "h3"),
            richTextField("stepBody", "Step body", "p"),
          ],
          repeatable: {
            itemSelector: "article, .card",
            labelSingular: "Process step",
            labelPlural: "Process steps",
          },
        },
        {
          id: "admissions-support",
          label: "Admissions Support",
          selector: "#portal",
          fields: [
            ...admissionsSectionStyleFields({
              sectionKey: "support",
              selector: "#portal",
              defaultBackgroundColor: "#081827",
            }),
            ...admissionsTypographyFields({ selector: "#portal" }),
            ...admissionsIconContainerStyleFields({
              sectionKey: "support",
              selector: "#portal",
              defaultIconColor: "#091624",
              defaultIconBgColor: "#ffc433",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "#ffc433",
              defaultIconBorderWidth: 0,
            }),
            ...admissionsRepeatableIconFields({
              sectionKey: "support",
              selector: ".info-card__icon",
              defaultIconName: "calendar",
            }),
            richTextField("title", "Title", ".info-card h3"),
            richTextField("body", "Body", ".info-card p"),
          ],
          repeatable: {
            itemSelector: ".info-card",
            labelSingular: "Support card",
            labelPlural: "Support cards",
          },
        },
        {
          id: "admissions-cta",
          label: "Admissions CTA",
          selector: "main > section:nth-of-type(4)",
          fields: [
            ...admissionsSectionStyleFields({
              sectionKey: "cta",
              selector: "main > section:nth-of-type(4)",
              defaultBackgroundColor: "#ffffff",
            }),
            ...admissionsTypographyFields({
              selector: "main > section:nth-of-type(4)",
            }),
            ...admissionsButtonStyleFields({
              sectionKey: "cta",
              selector: ".cta-banner__panel",
              defaultBackgroundColor: "#ffc433",
              defaultBackgroundOpacity: 100,
              defaultTextColor: "#0c1d2d",
              defaultBorderColor: "#ffc433",
              defaultBorderWidth: 0,
            }),
            ...admissionsIconContainerStyleFields({
              sectionKey: "cta",
              selector: ".cta-banner__icon",
              defaultIconColor: "#091624",
              defaultIconBgColor: "#ffc433",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "#ffc433",
              defaultIconBorderWidth: 0,
            }),
            ...admissionsRepeatableIconFields({
              sectionKey: "cta",
              selector: ".cta-banner__icon",
              defaultIconName: "cap",
            }),
            richTextField("title", "Title", "h2"),
            richTextField("body", "Body", ".cta-banner__copy p"),
            textField("ctaText", "CTA text", ".button"),
          ],
        },
        {
          id: "admission-form",
          label: "Admission Form",
          selector: ".admission-modal__dialog",
          description:
            "Controls the Google Form opened by the Apply buttons. Use this admissions form separately from the Contact page form.",
          fields: [
            ...admissionsSectionStyleFields({
              sectionKey: "form",
              selector: ".admission-modal__dialog",
              defaultBackgroundColor: "#ffffff",
            }),
            ...admissionsTypographyFields({
              selector: ".admission-modal__dialog",
            }),
            textField("title", "Modal title", "#admission-modal-title", {
              defaultValue: "Apply to DXT Academy",
              uiGroup: "Modal copy",
              uiOrder: 0,
            }),
            ...admissionFormFields({
              defaultFormTitle: "",
              defaultFormUrl: "",
            }),
          ],
        },
      ],
    },
    {
      slug: "student-life",
      fileName: "student-life.html",
      title: "Student Life",
      sections: [
        pageHeroSection,
        {
          id: "life-highlights",
          label: "Life Highlights",
          selector: "main > section:nth-of-type(2)",
          fields: [
            ...studentLifeSectionStyleFields({
              sectionKey: "highlights",
              selector: "main > section:nth-of-type(2)",
              defaultBackgroundColor: "#ffffff",
            }),
            ...studentLifeTypographyFields({
              selector: "main > section:nth-of-type(2)",
            }),
            ...studentLifeIconContainerStyleFields({
              sectionKey: "highlights",
              selector: "main > section:nth-of-type(2)",
              defaultIconColor: "#091624",
              defaultIconBgColor: "#ffc433",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "#ffc433",
              defaultIconBorderWidth: 0,
            }),
            ...studentLifeRepeatableIconFields({
              sectionKey: "highlights",
              selector: ".info-card__icon",
              defaultIconName: "people",
            }),
            richTextField("title", "Title", "h2"),
            richTextField("highlightTitle", "Highlight title", "h3"),
            richTextField("highlightBody", "Highlight body", "p"),
            imageField("highlightImage", "Highlight image", "img"),
          ],
          repeatable: {
            itemSelector: "article, .card",
            labelSingular: "Highlight",
            labelPlural: "Highlights",
          },
        },
        {
          id: "leadership-character",
          label: "Leadership & Character",
          selector: "main > section:nth-of-type(3)",
          fields: [
            ...studentLifeSectionStyleFields({
              sectionKey: "leadership",
              selector: "main > section:nth-of-type(3)",
              defaultBackgroundColor: "#081827",
            }),
            ...studentLifeTypographyFields({
              selector: "main > section:nth-of-type(3)",
            }),
            ...studentLifeIconContainerStyleFields({
              sectionKey: "leadership",
              selector: "main > section:nth-of-type(3)",
              defaultIconColor: "#9b7104",
              defaultIconBgColor: "#fff4cc",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "#fff4cc",
              defaultIconBorderWidth: 0,
            }),
            imageField("image", "Image", ".feature-split__media img"),
            richTextField("eyebrow", "Eyebrow", ".eyebrow"),
            richTextField("title", "Title", ".section-title"),
            richTextField("body", "Body", ".section-copy"),
            richTextField("point", "Point", ".feature-list li span:last-child"),
          ],
          repeatable: {
            itemSelector: ".feature-list li",
            labelSingular: "Leadership point",
            labelPlural: "Leadership points",
          },
        },
        {
          id: "portal-events",
          label: "Portal & Events",
          selector: "main > section:nth-of-type(4)",
          fields: [
            ...studentLifeSectionStyleFields({
              sectionKey: "portal-events",
              selector: "main > section:nth-of-type(4)",
              defaultBackgroundColor: "#ffffff",
            }),
            ...studentLifeTypographyFields({
              selector: "main > section:nth-of-type(4)",
            }),
            ...studentLifeIconContainerStyleFields({
              sectionKey: "portal-events",
              selector: "main > section:nth-of-type(4)",
              defaultIconColor: "#091624",
              defaultIconBgColor: "#ffc433",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "#ffc433",
              defaultIconBorderWidth: 0,
            }),
            ...studentLifeRepeatableIconFields({
              sectionKey: "portal-events",
              selector: ".info-card__icon",
              defaultIconName: "calendar",
            }),
            richTextField(
              "eyebrow",
              "Eyebrow",
              ".portal-events__heading .eyebrow",
            ),
            richTextField(
              "title",
              "Title",
              ".portal-events__heading .section-title",
            ),
            richTextField(
              "body",
              "Body",
              ".portal-events__heading .section-copy",
            ),
            imageField("image", "Image", ".portal-events__media img"),
            richTextField("cardTitle", "Card title", ".info-card h3"),
            richTextField("cardBody", "Card body", ".info-card p"),
            richTextField("quote", "Quote", ".quote-card p"),
            richTextField("quoteAuthor", "Quote author", ".quote-card strong"),
          ],
          repeatable: {
            itemSelector: ".info-card",
            labelSingular: "Portal card",
            labelPlural: "Portal cards",
          },
        },
      ],
    },
    {
      slug: "gallery",
      fileName: "gallery.html",
      title: "Gallery",
      sections: [
        pageHeroSection,
        {
          id: "gallery-grid",
          label: "Gallery Grid",
          selector: ".gallery-section",
          fields: [
            imageField("image", "Image", "img"),
            textField("caption", "Caption", "figcaption, h3"),
          ],
          repeatable: {
            itemSelector: "figure, .gallery-card, article",
            labelSingular: "Gallery item",
            labelPlural: "Gallery items",
          },
        },
      ],
    },
    {
      slug: "news",
      fileName: "news.html",
      title: "News",
      sections: [
        pageHeroSection,
        {
          id: "news-list",
          label: "News List",
          selector: ".section",
          fields: [
            textField("title", "News title", "h3"),
            textareaField("excerpt", "Excerpt", "p"),
            linkField("link", "News link", "a"),
          ],
          repeatable: {
            itemSelector: "article, .card",
            labelSingular: "News item",
            labelPlural: "News items",
          },
        },
        {
          id: "calendar",
          label: "Calendar",
          selector: "#calendar .info-grid",
          fields: [
            textField("title", "Title", ".info-card h3"),
            textareaField("body", "Body", ".info-card p"),
          ],
          repeatable: {
            itemSelector: ".info-card",
            labelSingular: "Calendar item",
            labelPlural: "Calendar items",
          },
        },
      ],
    },
    {
      slug: "contact",
      fileName: "contact.html",
      title: "Contact",
      sections: [
        pageHeroSection,
        {
          id: "contact-form",
          label: "Contact Form",
          selector: ".google-form-card",
          fields: [
            ...contactSectionStyleFields({
              sectionKey: "form",
              selector: ".google-form-card",
              defaultBackgroundColor: "#ffffff",
            }),
            ...contactTypographyFields({ selector: ".google-form-card" }),
            richTextField("eyebrow", "Eyebrow", ".form-card__heading .eyebrow"),
            richTextField(
              "title",
              "Title",
              ".form-card__heading .section-title",
            ),
            richTextField("body", "Body", ".form-card__heading .section-copy"),
            linkField("formUrl", "Google Form URL", "iframe", {
              attribute: "src",
              defaultValue: contactFormUrl,
            }),
            textareaField(
              "formIframe",
              "Google Form iframe embed code",
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
              defaultValue: "DXT Academy contact form",
            }),
          ],
        },
        {
          id: "contact-details",
          label: "Contact Details",
          selector: ".accent-panel",
          fields: [
            ...contactSectionStyleFields({
              sectionKey: "details",
              selector: ".accent-panel",
              defaultBackgroundColor: "#fff4cc",
            }),
            ...contactTypographyFields({ selector: ".accent-panel" }),
            ...contactIconContainerStyleFields({
              sectionKey: "details",
              selector: ".feature-list__bullet",
              defaultIconColor: "#9b7104",
              defaultIconBgColor: "#ffffff",
              defaultIconBgOpacity: 100,
              defaultIconBorderColor: "#ffc433",
              defaultIconBorderWidth: 0,
            }),
            richTextField("heading", "Title", "h3"),
            richTextField(
              "address",
              "Address",
              ".simple-list li:nth-of-type(1) span:nth-of-type(2)",
              {
                defaultValue: schoolAddress,
              },
            ),
            textField("phone", "Phone", ".simple-list li:nth-of-type(2) a", {
              defaultValue: schoolPhone,
            }),
            linkField(
              "phoneHref",
              "Phone link",
              ".simple-list li:nth-of-type(2) a",
              {
                defaultValue: schoolPhoneHref,
              },
            ),
            textField("email", "Email", ".simple-list li:nth-of-type(3) a", {
              defaultValue: schoolEmail,
            }),
            linkField(
              "emailHref",
              "Email link",
              ".simple-list li:nth-of-type(3) a",
              {
                defaultValue: schoolEmailHref,
              },
            ),
            richTextField(
              "officeHours",
              "Office hours",
              ".simple-list li:nth-of-type(4) span:nth-of-type(2)",
              {
                defaultValue: schoolHours,
              },
            ),
            richTextField("quote", "Quote", ".quote-card p"),
            richTextField("quoteAuthor", "Quote author", ".quote-card strong"),
          ],
        },
      ],
    },
    {
      slug: "privacy",
      fileName: "privacy.html",
      title: "Privacy Policy",
      sections: [
        pageHeroSection,
        {
          id: "policy-content",
          label: "Policy Content",
          selector: ".section .container",
          fields: [
            textField("section1Title", "Section 1 title", "h2:nth-of-type(1)"),
            textareaField("section1Body", "Section 1 body", "p:nth-of-type(1)"),
            textField("section2Title", "Section 2 title", "h2:nth-of-type(2)"),
            textareaField("section2Body", "Section 2 body", "p:nth-of-type(2)"),
            textField("section3Title", "Section 3 title", "h2:nth-of-type(3)"),
            textareaField("section3Body", "Section 3 body", "p:nth-of-type(3)"),
            textField("section4Title", "Section 4 title", "h2:nth-of-type(4)"),
            textareaField("section4Body", "Section 4 body", "p:nth-of-type(4)"),
          ],
        },
      ],
    },
    {
      slug: "terms",
      fileName: "terms.html",
      title: "Terms",
      sections: [
        pageHeroSection,
        {
          id: "terms-content",
          label: "Terms Content",
          selector: ".section .container",
          fields: [
            textField("section1Title", "Section 1 title", "h2:nth-of-type(1)"),
            textareaField("section1Body", "Section 1 body", "p:nth-of-type(1)"),
            textField("section2Title", "Section 2 title", "h2:nth-of-type(2)"),
            textareaField("section2Body", "Section 2 body", "p:nth-of-type(2)"),
            textField("section3Title", "Section 3 title", "h2:nth-of-type(3)"),
            textareaField("section3Body", "Section 3 body", "p:nth-of-type(3)"),
            textField("section4Title", "Section 4 title", "h2:nth-of-type(4)"),
            textareaField("section4Body", "Section 4 body", "p:nth-of-type(4)"),
          ],
        },
      ],
    },
  ],
} satisfies SchoolTemplateManifest;
