import {
  backgroundImageField,
  colorField,
  imageField,
  linkField,
  numberField,
  textField,
  textareaField,
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
const schoolAddress = "12 Excellence Drive, Lagos, Nigeria";
const schoolPhone = "+234 801 234 5678";
const schoolPhoneHref = "tel:+2348012345678";
const schoolEmail = "info@dxtacademy.edu.ng";
const schoolEmailHref = "mailto:info@dxtacademy.edu.ng";
const schoolHours = "Monday to Friday, 8:00 AM - 4:00 PM";
const footerDescription =
  "DXT Academy is committed to raising confident leaders through academic excellence, strong character, and a deep sense of purpose.";

const academicsOverviewStyleFields = [
  colorField(
    "sectionBgColor",
    "Section background color",
    "main > section:nth-of-type(2)",
    {
      target: "cssVariable",
      cssVariable: "--dexta-academy-2-academics-overview-section-bg",
      defaultValue: "#ffffff",
      uiGroup: "Section style",
      uiOrder: 100,
    },
  ),
  colorField("cardBgColor", "Card background color", ".info-card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-overview-card-bg",
    defaultValue: "#ffffff",
    uiGroup: "Card style",
    uiOrder: 110,
  }),
  colorField("iconBgColor", "Icon background color", ".info-card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-overview-icon-bg",
    defaultValue: "#fff4cc",
    uiGroup: "Icon style",
    uiOrder: 120,
  }),
  colorField("iconColor", "Icon color", ".info-card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-overview-icon-color",
    defaultValue: "#9b7104",
    uiGroup: "Icon style",
    uiOrder: 121,
  }),
  colorField("titleColor", "Title color", ".info-card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-overview-title-color",
    defaultValue: "#102034",
    uiGroup: "Text style",
    uiOrder: 130,
  }),
  textField("titleFont", "Title font", ".info-card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-overview-title-font",
    defaultValue: "Manrope",
    uiGroup: "Text style",
    uiOrder: 131,
  }),
  textField("titleFontStyle", "Title font style", ".info-card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-overview-title-font-style",
    defaultValue: "normal",
    helpText: "Use normal, italic, or oblique.",
    uiGroup: "Text style",
    uiOrder: 132,
  }),
  colorField("descriptionColor", "Description color", ".info-card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-overview-description-color",
    defaultValue: "#58708a",
    uiGroup: "Description style",
    uiOrder: 140,
  }),
  textField("descriptionFont", "Description font", ".info-card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-overview-description-font",
    defaultValue: "Plus Jakarta Sans",
    uiGroup: "Description style",
    uiOrder: 141,
  }),
  textField("descriptionFontStyle", "Description font style", ".info-card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-overview-description-font-style",
    defaultValue: "normal",
    helpText: "Use normal, italic, or oblique.",
    uiGroup: "Description style",
    uiOrder: 142,
  }),
  colorField("borderColor", "Border color", ".info-card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-overview-border-color",
    defaultValue: "#e7edf3",
    uiGroup: "Border style",
    uiOrder: 150,
  }),
  numberField("borderWidth", "Border width", ".info-card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-overview-border-width",
    defaultValue: 1,
    min: 0,
    max: 12,
    step: 1,
    unit: "px",
    helpText: "Set to 0 to remove the border.",
    uiGroup: "Border style",
    uiOrder: 151,
  }),
];

const academicsSubjectsStyleFields = [
  colorField(
    "sectionBgColor",
    "Section background color",
    "main > section:nth-of-type(3)",
    {
      target: "cssVariable",
      cssVariable: "--dexta-academy-2-academics-subjects-section-bg",
      defaultValue: "#081827",
      uiGroup: "Section style",
      uiOrder: 100,
    },
  ),
  colorField("cardBgColor", "Card background color", ".card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-subjects-card-bg",
    defaultValue: "#ffffff",
    uiGroup: "Card style",
    uiOrder: 110,
  }),
  colorField("iconBgColor", "Icon background color", ".card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-subjects-icon-bg",
    defaultValue: "#ffc433",
    uiGroup: "Icon style",
    uiOrder: 120,
  }),
  colorField("iconColor", "Icon color", ".card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-subjects-icon-color",
    defaultValue: "#091624",
    uiGroup: "Icon style",
    uiOrder: 121,
  }),
  colorField("titleColor", "Title color", ".card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-subjects-title-color",
    defaultValue: "#102034",
    uiGroup: "Text style",
    uiOrder: 130,
  }),
  textField("titleFont", "Title font", ".card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-subjects-title-font",
    defaultValue: "Manrope",
    uiGroup: "Text style",
    uiOrder: 131,
  }),
  textField("titleFontStyle", "Title font style", ".card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-subjects-title-font-style",
    defaultValue: "normal",
    helpText: "Use normal, italic, or oblique.",
    uiGroup: "Text style",
    uiOrder: 132,
  }),
  colorField("descriptionColor", "Description color", ".card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-subjects-description-color",
    defaultValue: "#58708a",
    uiGroup: "Description style",
    uiOrder: 140,
  }),
  textField("descriptionFont", "Description font", ".card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-subjects-description-font",
    defaultValue: "Plus Jakarta Sans",
    uiGroup: "Description style",
    uiOrder: 141,
  }),
  textField("descriptionFontStyle", "Description font style", ".card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-subjects-description-font-style",
    defaultValue: "normal",
    helpText: "Use normal, italic, or oblique.",
    uiGroup: "Description style",
    uiOrder: 142,
  }),
  colorField("borderColor", "Border color", ".card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-subjects-border-color",
    defaultValue: "#e7edf3",
    uiGroup: "Border style",
    uiOrder: 150,
  }),
  numberField("borderWidth", "Border width", ".card", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-subjects-border-width",
    defaultValue: 1,
    min: 0,
    max: 12,
    step: 1,
    unit: "px",
    helpText: "Set to 0 to remove the border.",
    uiGroup: "Border style",
    uiOrder: 151,
  }),
];

const academicsLearningStyleFields = [
  colorField(
    "sectionBgColor",
    "Section background color",
    "main > section:nth-of-type(4)",
    {
      target: "cssVariable",
      cssVariable: "--dexta-academy-2-academics-learning-section-bg",
      defaultValue: "#ffffff",
      uiGroup: "Section style",
      uiOrder: 100,
    },
  ),
  colorField("titleColor", "Title color", ".feature-split", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-learning-title-color",
    defaultValue: "#102034",
    uiGroup: "Text style",
    uiOrder: 110,
  }),
  textField("titleFont", "Title font", ".feature-split", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-learning-title-font",
    defaultValue: "Manrope",
    uiGroup: "Text style",
    uiOrder: 111,
  }),
  textField("titleFontStyle", "Title font style", ".feature-split", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-learning-title-font-style",
    defaultValue: "normal",
    helpText: "Use normal, italic, or oblique.",
    uiGroup: "Text style",
    uiOrder: 112,
  }),
  colorField("descriptionColor", "Description color", ".feature-split", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-learning-description-color",
    defaultValue: "#58708a",
    uiGroup: "Description style",
    uiOrder: 120,
  }),
  textField("descriptionFont", "Description font", ".feature-split", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-learning-description-font",
    defaultValue: "Plus Jakarta Sans",
    uiGroup: "Description style",
    uiOrder: 121,
  }),
  textField(
    "descriptionFontStyle",
    "Description font style",
    ".feature-split",
    {
      target: "cssVariable",
      cssVariable:
        "--dexta-academy-2-academics-learning-description-font-style",
      defaultValue: "normal",
      helpText: "Use normal, italic, or oblique.",
      uiGroup: "Description style",
      uiOrder: 122,
    },
  ),
  colorField("stepBgColor", "Step background color", ".steps li", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-learning-step-bg",
    defaultValue: "#ffffff",
    uiGroup: "Step style",
    uiOrder: 130,
  }),
  colorField("stepNumberBgColor", "Step number background", ".steps li", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-learning-step-number-bg",
    defaultValue: "#fff4cc",
    uiGroup: "Step style",
    uiOrder: 131,
  }),
  colorField("stepNumberColor", "Step number color", ".steps li", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-learning-step-number-color",
    defaultValue: "#9b7104",
    uiGroup: "Step style",
    uiOrder: 132,
  }),
  colorField("stepTextColor", "Step text color", ".steps li", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-learning-step-text-color",
    defaultValue: "#58708a",
    uiGroup: "Step style",
    uiOrder: 133,
  }),
  colorField("stepBorderColor", "Step border color", ".steps li", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-learning-step-border-color",
    defaultValue: "#e7edf3",
    uiGroup: "Step style",
    uiOrder: 140,
  }),
  numberField("stepBorderWidth", "Step border width", ".steps li", {
    target: "cssVariable",
    cssVariable: "--dexta-academy-2-academics-learning-step-border-width",
    defaultValue: 0,
    min: 0,
    max: 12,
    step: 1,
    unit: "px",
    helpText: "Set to 0 to remove the border.",
    uiGroup: "Step style",
    uiOrder: 141,
  }),
];

const pageHeroSection = {
  id: "page-hero",
  label: "Page Hero",
  selector: ".page-hero",
  fields: [
    textField("breadcrumbs", "Breadcrumbs", ".breadcrumbs"),
    textField("eyebrow", "Eyebrow", ".eyebrow"),
    textField("title", "Title", ".page-hero__title, h1"),
    textareaField("body", "Body", ".page-hero__copy"),
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
        ),
        linkField(
          "portalCtaHref",
          "Portal CTA link",
          ".site-header__actions .button--outline-light, .mobile-panel__actions .button--outline-light",
        ),
        textField(
          "primaryCtaText",
          "Primary CTA text",
          ".site-header__actions .button--primary span:nth-of-type(1), .mobile-panel__actions .button--primary span:nth-of-type(1)",
        ),
        linkField(
          "primaryCtaHref",
          "Primary CTA link",
          ".site-header__actions .button--primary, .mobile-panel__actions .button--primary",
        ),
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
        textField(
          "privacyText",
          "Privacy link label",
          ".footer__legal a:nth-of-type(1)",
          {
            defaultValue: "Privacy Policy",
            uiGroup: "Legal",
            uiOrder: 51,
          },
        ),
        linkField(
          "privacyHref",
          "Privacy link URL",
          ".footer__legal a:nth-of-type(1)",
          {
            defaultValue: "privacy.html",
            uiGroup: "Legal",
            uiOrder: 52,
          },
        ),
        textField(
          "termsText",
          "Terms link label",
          ".footer__legal a:nth-of-type(2)",
          {
            defaultValue: "Terms of Use",
            uiGroup: "Legal",
            uiOrder: 53,
          },
        ),
        linkField(
          "termsHref",
          "Terms link URL",
          ".footer__legal a:nth-of-type(2)",
          {
            defaultValue: "terms.html",
            uiGroup: "Legal",
            uiOrder: 54,
          },
        ),
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
        linkField("formUrl", "Google Form URL", "iframe", {
          attribute: "data-src",
          defaultValue: admissionFormUrl,
          helpText:
            "This template lazy-loads the form when the modal opens, so the preview updates the iframe data source.",
        }),
        textareaField("formIframe", "Google Form iframe embed code", "iframe", {
          target: "attribute",
          attribute: "data-src",
          defaultValue: "",
          placeholder:
            '<iframe src="https://docs.google.com/forms/..." width="640" height="1602" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>',
          helpText:
            "Paste the full Google Forms iframe embed code. Leave blank to use the Google Form URL field.",
        }),
        textField("formTitle", "Iframe title", "iframe", {
          target: "attribute",
          attribute: "title",
          defaultValue: "DXT Academy admission form",
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
          selector: ".hero-home",
          fields: [
            textField("eyebrow", "Eyebrow", ".eyebrow", {
              defaultValue: "Welcome to DXT Academy",
            }),
            textField("headline", "Headline", "h1", {
              defaultValue: "Education That Inspires.",
            }),
            textareaField("body", "Body", ".hero-home__lead", {
              defaultValue:
                "We nurture confident leaders with academic excellence, strong character, and a deep sense of purpose.",
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
            textField("title", "Intro title", ".values-strip__intro h2"),
            textareaField("body", "Intro body", ".values-strip__intro p"),
            textField("valueTitle", "Value title", ".value-item h3"),
            textareaField("valueBody", "Value body", ".value-item p"),
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
            textField("eyebrow", "Eyebrow", ".eyebrow"),
            textField("title", "Title", ".section-title"),
            textareaField("body", "Body", ".section-copy"),
            imageField("image", "Image", ".media-card img"),
            textField("ctaText", "CTA text", ".button"),
          ],
        },
        {
          id: "programs",
          label: "Programs",
          selector: ".programs",
          fields: [
            textField("eyebrow", "Eyebrow", ".eyebrow"),
            textField("title", "Title", ".section-title"),
            textareaField("body", "Body", ".section-copy"),
            imageField("programImage", "Program image", ".card__media img"),
            textField("programTitle", "Program title", ".card__title"),
            textareaField("programBody", "Program body", ".card__text"),
            linkField("programLink", "Program link", ".card__link"),
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
          selector: ".news-heading",
          fields: [
            textField("eyebrow", "Eyebrow", ".eyebrow"),
            textField("title", "Title", ".section-title"),
            textareaField("body", "Body", ".section-copy"),
            textField("ctaText", "CTA text", ".button"),
          ],
        },
        {
          id: "student-life-cards",
          label: "Student Life Cards",
          selector: ".news-grid",
          fields: [
            imageField("image", "Image", ".news-card__media img"),
            textField("category", "Category", ".news-card__date"),
            textField("title", "Title", ".news-card__title"),
            textareaField("excerpt", "Excerpt", ".news-card__excerpt"),
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
          selector: ".stats-grid",
          fields: [
            textField("value", "Value", ".stat-box strong"),
            textField("label", "Label", ".stat-box span"),
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
          selector: ".section--dark .feature-split",
          fields: [
            textField("eyebrow", "Eyebrow", ".eyebrow"),
            textField("title", "Title", ".section-title"),
            textareaField("body", "Body", ".section-copy"),
            textField(
              "featureNumber",
              "Feature number",
              ".feature-list__bullet",
            ),
            textField(
              "featureText",
              "Feature text",
              "span:not(.feature-list__bullet)",
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
            textField("eyebrow", "Eyebrow", ".eyebrow"),
            textField("title", "Title", ".section-title"),
            textareaField("body", "Preview body", ".section-copy"),
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
            textField("eyebrow", "Eyebrow", ".story-modal__header .eyebrow", {
              defaultValue: "about us",
            }),
            textField("title", "Modal title", "#story-modal-title", {
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
          selector: ".info-grid",
          fields: [
            textField("cardTitle", "Card title", ".info-card h3"),
            textareaField("cardBody", "Card body", ".info-card p"),
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
          selector: ".feature-split--reverse",
          fields: [
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
            textField("eyebrow", "Eyebrow", ".eyebrow"),
            textField("title", "Title", ".section-title"),
            textareaField("body", "Body", ".section-copy"),
            textareaField("quote", "Quote", ".quote-card p"),
            textField("quoteAuthor", "Quote author", ".quote-card strong"),
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
            textField("overviewIcon", "Overview icon", ".info-card__icon", {
              target: "attribute",
              attribute: "data-icon",
            }),
            textField("overviewTitle", "Overview title", ".info-card h3"),
            textareaField("overviewBody", "Overview body", ".info-card p"),
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
            textField("subjectIcon", "Subject icon", ".card__badge", {
              target: "attribute",
              attribute: "data-icon",
            }),
            textField("subjectTitle", "Subject title", ".card__title"),
            textareaField("subjectBody", "Subject body", ".card__text"),
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
            textField("eyebrow", "Eyebrow", ".eyebrow"),
            textField("title", "Title", ".section-title"),
            textareaField("body", "Body", ".section-copy"),
            textField("stepNumber", "Step number", ".steps__number"),
            textField("stepText", "Step text", "span:not(.steps__number)"),
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
          selector: ".section",
          fields: [
            textField("title", "Title", "h2"),
            textField("stepTitle", "Step title", "h3"),
            textareaField("stepBody", "Step body", "p"),
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
          selector: "#portal .info-grid",
          fields: [
            textField("title", "Title", ".info-card h3"),
            textareaField("body", "Body", ".info-card p"),
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
          selector: ".cta-banner__panel",
          fields: [
            textField("title", "Title", "h2"),
            textareaField("body", "Body", ".cta-banner__copy p"),
            textField("ctaText", "CTA text", ".button"),
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
          selector: ".section",
          fields: [
            textField("title", "Title", "h2"),
            textField("highlightTitle", "Highlight title", "h3"),
            textareaField("highlightBody", "Highlight body", "p"),
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
          selector: ".section--dark .feature-split",
          fields: [
            imageField("image", "Image", ".feature-split__media img"),
            textField("eyebrow", "Eyebrow", ".eyebrow"),
            textField("title", "Title", ".section-title"),
            textareaField("body", "Body", ".section-copy"),
            textField("point", "Point", ".feature-list li span:last-child"),
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
          selector: ".portal-events",
          fields: [
            textField("eyebrow", "Eyebrow", ".portal-events__heading .eyebrow"),
            textField(
              "title",
              "Title",
              ".portal-events__heading .section-title",
            ),
            textareaField(
              "body",
              "Body",
              ".portal-events__heading .section-copy",
            ),
            imageField("image", "Image", ".portal-events__media img"),
            textField("cardTitle", "Card title", ".info-card h3"),
            textareaField("cardBody", "Card body", ".info-card p"),
            textareaField("quote", "Quote", ".quote-card p"),
            textField("quoteAuthor", "Quote author", ".quote-card strong"),
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
            textField("eyebrow", "Eyebrow", ".form-card__heading .eyebrow"),
            textField("title", "Title", ".form-card__heading .section-title"),
            textareaField("body", "Body", ".form-card__heading .section-copy"),
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
                placeholder:
                  '<iframe src="https://docs.google.com/forms/..." width="640" height="1602" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>',
                helpText:
                  "Paste the full Google Forms iframe embed code. Leave blank to use the Google Form URL field.",
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
            textField("heading", "Title", "h3"),
            textareaField(
              "location",
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
            textField(
              "officeHours",
              "Office hours",
              ".simple-list li:nth-of-type(4) span:nth-of-type(2)",
              {
                defaultValue: schoolHours,
              },
            ),
            textareaField("quote", "Quote", ".quote-card p"),
            textField("quoteAuthor", "Quote author", ".quote-card strong"),
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
