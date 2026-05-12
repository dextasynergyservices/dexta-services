import {
  imageField,
  linkField,
  textField,
  textareaField,
  type SchoolTemplateManifest,
} from "./types";

export const dextaAcademy3Manifest = {
  templateSlug: "dexta-academy-3",
  templateName: "Dexta Academy 3",
  sourceDir: "public/dexta-academy-3",
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
        textareaField("footerBody", "Footer body", ".footer-brand p"),
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
            textField("headline", "Headline", ".hero__title"),
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
          ],
        },
        {
          id: "welcome",
          label: "Welcome",
          selector: ".welcome",
          fields: [
            textField("eyebrow", "Eyebrow", ".welcome__eyebrow"),
            textField("title", "Title", ".welcome__title"),
            textareaField("body", "Body", ".welcome__body"),
            imageField("image", "Image", ".welcome__media img"),
            textField("ctaText", "CTA text", ".welcome__cta"),
            linkField("ctaHref", "CTA link", ".welcome__cta"),
          ],
        },
        {
          id: "programmes",
          label: "Programmes",
          selector: ".programmes-showcase",
          fields: [
            textField("eyebrow", "Eyebrow", ".section-heading .eyebrow"),
            textField("title", "Title", ".section-heading h2"),
            textareaField("body", "Body", ".section-heading > p"),
            textField("ctaText", "CTA text", ".section-heading .button"),
            linkField("ctaHref", "CTA link", ".section-heading .button"),
            textField("programmeTitle", "Programme title", "h3"),
            textareaField("programmeBody", "Programme body", "article p"),
            imageField("programmeImage", "Programme image", "article img"),
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
            textField("eyebrow", "Eyebrow", ".eyebrow"),
            textField("title", "Title", ".home-apply__copy h2"),
            textareaField("body", "Body", ".home-apply__copy p:not(.eyebrow)"),
            textField("stepTitle", "Step title", ".home-apply-step h3"),
            textareaField("stepBody", "Step body", ".home-apply-step p"),
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
            textField("eyebrow", "Eyebrow", ".home-gallery__intro .eyebrow"),
            textField("title", "Title", ".home-gallery__intro h2"),
            textareaField("body", "Body", ".home-gallery__copy"),
            imageField(
              "galleryImage",
              "Gallery image",
              ".home-gallery-card img",
            ),
            textField(
              "galleryLabel",
              "Gallery label",
              ".home-gallery-card__eyebrow",
            ),
            textField(
              "galleryCaption",
              "Gallery caption",
              ".home-gallery-card strong",
            ),
            textField("ctaText", "CTA text", ".home-gallery__actions .button"),
            linkField("ctaHref", "CTA link", ".home-gallery__actions .button"),
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
            textField("eyebrow", "Eyebrow", ".eyebrow"),
            textField("title", "Title", "h1"),
            textareaField("body", "Body", ".about-hero__lead"),
            imageField("image", "Hero image", ".about-hero img"),
          ],
        },
        {
          id: "story",
          label: "Story, Mission & Vision",
          selector: ".about-story",
          fields: [
            textField("eyebrow", "Eyebrow", ".about-story__eyebrow"),
            textField("title", "Title", ".about-story__title"),
            textField(
              "cardEyebrow",
              "Card eyebrow",
              ".about-story-card__eyebrow",
            ),
            textField("cardTitle", "Card title", ".about-story-card h3"),
            textareaField(
              "cardBody1",
              "Preview paragraph 1",
              ".about-story-card__copy p:nth-of-type(2)",
            ),
            textareaField(
              "cardBody2",
              "Preview paragraph 2",
              ".about-story-card__copy p:nth-of-type(3)",
            ),
            textField("ctaText", "Read more button text", "button"),
            imageField("cardImage", "Card image", ".about-story-card img"),
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
            textField("eyebrow", "Eyebrow", ".story-modal__eyebrow"),
            textField("title", "Modal title", ".story-modal__header h2"),
            textareaField("bodyHtml", "Full story", ".story-modal__content", {
              type: "richText",
              target: "innerHTML",
              helpText:
                "Paste the full story here. The editor will shorten the visible story preview to fit this template.",
            }),
          ],
        },
        {
          id: "values",
          label: "Values",
          selector: ".about-values",
          fields: [
            textField("title", "Title", "h2"),
            textField("valueTitle", "Value title", ".about-value-card h3"),
            textareaField("valueBody", "Value body", ".about-value-card p"),
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
            textField("eyebrow", "Eyebrow", ".eyebrow"),
            textField("title", "Title", "h2"),
            textareaField(
              "body",
              "Body",
              ".about-approach__copy p:not(.eyebrow)",
            ),
          ],
        },
        {
          id: "impact",
          label: "Impact",
          selector: ".about-impact-band",
          fields: [
            textField("title", "Title", "h2"),
            textareaField("body", "Body", "p"),
            textField("statValue", "Stat value", ".about-impact-stat strong"),
            textField("statLabel", "Stat label", ".about-impact-stat span"),
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
            textField("title", "Title", "h2"),
            textareaField("body", "Body", "p"),
            textField("ctaText", "CTA text", ".button"),
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
            textField(
              "eyebrow",
              "Eyebrow",
              ".eyebrow, .gallery-hero-ref__eyebrow",
            ),
            textField("title", "Title", "h1"),
            textareaField("body", "Body", "p:not(.eyebrow)"),
            imageField("image", "Hero image", ".gallery-hero-ref__media img"),
          ],
        },
        {
          id: "gallery-filters",
          label: "Gallery Filters",
          selector: ".gallery-filter-bar",
          fields: [textField("filterLabel", "Filter label", ".filter-chip")],
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
            textField(
              "caption",
              "Caption",
              "figcaption, .gallery-card__caption",
            ),
          ],
          repeatable: {
            itemSelector: "figure, .gallery-card",
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
            textField("eyebrow", "Eyebrow", ".eyebrow"),
            textField("title", "Title", "h1"),
            textareaField("body", "Body", "p:not(.eyebrow)"),
            imageField("image", "Hero image", ".contact-hero img"),
          ],
        },
        {
          id: "contact-intro",
          label: "Contact Intro",
          selector: ".contact-intro",
          fields: [
            textField("eyebrow", "Eyebrow", "p:nth-of-type(1)"),
            textField("title", "Title", "h2"),
            textareaField("body", "Body", "p:nth-of-type(2)"),
          ],
        },
        {
          id: "contact-panel",
          label: "Contact Panel",
          selector: ".contact-panel",
          fields: [
            textField("title", "Title", "h2"),
            textareaField("body", "Body", "p"),
          ],
        },
        {
          id: "contact-message",
          label: "Contact Message Form",
          selector: ".contact-message-card",
          fields: [
            textField("title", "Title", "h2"),
            textareaField("body", "Body", ".contact-form-card__header p"),
          ],
        },
        {
          id: "contact-benefits",
          label: "Contact Benefits",
          selector: ".contact-benefits",
          fields: [
            textField("benefitTitle", "Benefit title", "h3"),
            textareaField("benefitBody", "Benefit body", "p"),
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
            imageField("logo", "Logo", "img"),
            textField("brandName", "Brand name", ".contact-brand strong"),
            textField("tagline", "Tagline", ".contact-brand small"),
            textareaField("body", "Body", "p"),
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
            textareaField("detail", "Detail", "p"),
          ],
          repeatable: {
            itemSelector: "p",
            labelSingular: "Contact detail",
            labelPlural: "Contact details",
          },
        },
      ],
    },
  ],
} satisfies SchoolTemplateManifest;
