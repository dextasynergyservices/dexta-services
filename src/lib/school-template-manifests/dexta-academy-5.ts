import {
  backgroundImageField,
  imageField,
  linkField,
  textField,
  textareaField,
  type SchoolTemplateManifest,
} from "./types";

const heroLeafBackgroundImage =
  "https://res.cloudinary.com/dxoorukfj/image/upload/v1778264512/leave2_oyfyvg.png";

const pageHero = {
  id: "page-hero",
  label: "Page Hero",
  selector: ".page-hero",
  fields: [
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
  textField(
    "newsletterTitle",
    "Newsletter title",
    ".site-footer__grid > div:nth-of-type(4) h3",
  ),
  textareaField(
    "newsletterBody",
    "Newsletter body",
    ".site-footer__grid > div:nth-of-type(4) p",
  ),
  textField(
    "newsletterPlaceholder",
    "Newsletter placeholder",
    ".newsletter-form input",
    {
      target: "attribute",
      attribute: "placeholder",
    },
  ),
  textField(
    "newsletterButtonText",
    "Newsletter button label",
    ".newsletter-form button",
  ),
  textareaField("copyright", "Copyright", ".site-footer__bottom > p"),
  textField(
    "privacyText",
    "Privacy link label",
    ".site-footer__bottom a:nth-of-type(1)",
  ),
  linkField(
    "privacyHref",
    "Privacy link URL",
    ".site-footer__bottom a:nth-of-type(1)",
  ),
  textField(
    "termsText",
    "Terms link label",
    ".site-footer__bottom a:nth-of-type(2)",
  ),
  linkField(
    "termsHref",
    "Terms link URL",
    ".site-footer__bottom a:nth-of-type(2)",
  ),
];

export const dextaAcademy5Manifest = {
  templateSlug: "dexta-academy-5",
  templateName: "Dexta Academy 5",
  sourceDir: "public/dexta-academy-5",
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
      fields: sharedFooterFields,
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
            textField("eyebrow", "Eyebrow", ".hero__eyebrow"),
            textField(
              "titleLine1",
              "Title line 1",
              ".hero__title span:nth-of-type(1)",
            ),
            textField(
              "titleLine2",
              "Title line 2",
              ".hero__title span:nth-of-type(2)",
            ),
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
          ],
        },
        {
          id: "programmes",
          label: "Programmes",
          selector: ".programmes-section",
          fields: [
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
          fields: [textField("point", "Point", "li")],
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
          fields: [textField("label", "Badge label", "span")],
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
            textField("eyebrow", "Eyebrow", ".admission-modal__header p"),
            textField("title", "Title", ".admission-modal__header h2"),
            linkField("formUrl", "Google Form URL", "iframe", {
              attribute: "src",
            }),
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
            textField("eyebrow", "Eyebrow", ".admission-modal__header p"),
            textField("title", "Title", ".admission-modal__header h2"),
            linkField("formUrl", "Google Form URL", "iframe", {
              attribute: "src",
            }),
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
        pageHero,
        {
          id: "stats",
          label: "Stats",
          selector: ".page-stat-grid",
          fields: [
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
            textField("number", "Value number", ".value-card span"),
            textField("title", "Value title", ".value-card h3"),
            textareaField("body", "Value body", ".value-card p"),
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
        pageHero,
        {
          id: "school-life-overview",
          label: "School Life Overview",
          selector: ".school-life-overview",
          fields: [
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
            textField(
              "title",
              "Feature title",
              ".campus-feature-grid article h2",
            ),
            textareaField(
              "body",
              "Feature body",
              ".campus-feature-grid article p",
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
        pageHero,
        {
          id: "gallery-grid",
          label: "Gallery Grid",
          selector: ".gallery-grid",
          fields: [
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
        pageHero,
        {
          id: "contact-details",
          label: "Contact Details",
          selector: ".contact-panel",
          fields: [
            textField("label", "Detail label", "article span"),
            textField("title", "Detail title", "article h2"),
            textareaField("body", "Detail body", "article p"),
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
            textField("eyebrow", "Eyebrow", ".page-kicker"),
            textField("title", "Title", ".contact-form-panel__header h2"),
            linkField("formUrl", "Google Form URL", "iframe", {
              attribute: "src",
            }),
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
