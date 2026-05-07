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

const pageHeroSection = {
  id: "page-hero",
  label: "Page Hero",
  selector: ".page-hero",
  fields: [
    textField("breadcrumbs", "Breadcrumbs", ".breadcrumbs"),
    textField("eyebrow", "Eyebrow", ".eyebrow"),
    textField("title", "Title", ".page-hero__title, h1"),
    textareaField("body", "Body", ".page-hero__copy"),
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
        textField("brandName", "Brand name", "[data-brand-name], .brand__name"),
        imageField("logo", "Logo", ".brand img, .site-logo"),
        textField("primaryCtaText", "Primary CTA text", ".site-header .button"),
        linkField("primaryCtaHref", "Primary CTA link", ".site-header .button"),
      ],
    },
    {
      id: "site-footer",
      label: "Footer",
      selector: ".site-footer",
      description:
        "Footer is injected by assets/js/app.js and appears on every page.",
      fields: [
        textField(
          "brandName",
          "Brand name",
          ".site-footer [data-brand-name], .footer-brand",
        ),
        textareaField("description", "Description", ".site-footer p"),
        textField("phone", "Phone", ".site-footer a[href^='tel:']"),
        textField("email", "Email", ".site-footer a[href^='mailto:']"),
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
          selector: ".feature-split",
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
            imageField("image", "Image", ".feature-split__media img"),
          ],
          repeatable: {
            itemSelector: ".feature-list li",
            labelSingular: "Feature",
            labelPlural: "Features",
          },
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
            imageField("image", "Image", ".feature-split__media img"),
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
          selector: ".section > .container.info-grid",
          fields: [
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
          selector: ".section--dark .programs__cards",
          fields: [
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
          selector: ".feature-split",
          fields: [
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
          id: "contact-details",
          label: "Contact Details",
          selector: ".section",
          fields: [
            textField("title", "Title", "h2"),
            textField("phone", "Phone", "a[href^='tel:']"),
            textField("email", "Email", "a[href^='mailto:']"),
            textareaField("address", "Address", "address, p"),
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
