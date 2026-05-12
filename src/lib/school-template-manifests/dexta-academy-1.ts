import {
  imageField,
  linkField,
  textField,
  textareaField,
  type SchoolTemplateManifest,
} from "./types";

const legacyPageHeader = {
  id: "legacy-page-header",
  label: "Page Header",
  selector: ".page-header, .container-xxl.py-5",
  fields: [
    textField("title", "Title", "h1"),
    textareaField("body", "Body", "p"),
  ],
};

export const dextaAcademy1Manifest = {
  templateSlug: "dexta-academy-1",
  templateName: "Dexta Academy 1",
  sourceDir: "public/dexta-academy-1",
  entryFile: "index.html",
  previewPath: "/dexta-academy-1/index.html",
  assetInventory: {
    directories: ["css", "js", "lib", "scss"],
    stylesheets: ["css/bootstrap.min.css", "css/style.css", "css/enhanced.css"],
    scripts: ["js/main.js"],
  },
  sharedSections: [
    {
      id: "navbar",
      label: "Navigation",
      selector: ".navbar",
      fields: [
        imageField("logo", "Logo", ".navbar-brand img"),
        textField("primaryCtaText", "Primary CTA text", ".navbar .btn-primary"),
        linkField("primaryCtaHref", "Primary CTA link", ".navbar .btn-primary"),
      ],
    },
    {
      id: "footer",
      label: "Footer",
      selector: ".footer",
      fields: [
        textField("contactTitle", "Contact title", ".footer h3"),
        textareaField("address", "Address", ".footer p:nth-of-type(1)"),
        textField("phone", "Phone", ".footer p:nth-of-type(2)"),
        textField("email", "Email", ".footer p:nth-of-type(3)"),
        textField(
          "copyrightName",
          "Copyright name",
          ".copyright a:nth-of-type(1)",
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
          selector: ".school-hero",
          fields: [
            textField("headline", "Headline", ".school-hero__title"),
            textareaField("body", "Body", ".school-hero__text"),
            imageField(
              "primaryImage",
              "Primary image",
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
            imageField("image", "Image", ".landing-about__media img"),
            textField("eyebrow", "Eyebrow", ".landing-eyebrow"),
            textField("title", "Title", ".landing-heading"),
            textareaField("body", "Body", ".landing-copy"),
          ],
        },
        {
          id: "academics",
          label: "Academics",
          selector: ".landing-section--academics",
          fields: [
            textField("eyebrow", "Eyebrow", ".landing-eyebrow"),
            textField("title", "Title", ".landing-heading"),
            textField("cardTitle", "Card title", ".landing-academics__card h3"),
            textareaField(
              "cardBody",
              "Card body",
              ".landing-academics__card p",
            ),
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
            textField("eyebrow", "Eyebrow", ".landing-eyebrow"),
            textField("title", "Title", ".landing-heading"),
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
            textField("title", "Section title", ".landing-heading"),
            textareaField("quote", "Quote", ".landing-testimonial p"),
            textField("author", "Author", ".landing-testimonial strong"),
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
            textField("title", "Title", ".landing-heading"),
            textareaField("body", "Body", ".landing-copy"),
            textField("ctaText", "CTA text", ".btn, a"),
            linkField("ctaHref", "CTA link", ".btn, a"),
          ],
        },
        {
          id: "contact",
          label: "Contact",
          selector: "#contact",
          fields: [
            textField("title", "Title", ".landing-heading, h2"),
            textField("phone", "Phone", "a[href^='tel:'], p"),
            textField("email", "Email", "a[href^='mailto:'], p"),
            textareaField("address", "Address", "address, p"),
          ],
        },
      ],
    },
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
            textField("title", "Title", "h1"),
            textareaField("body", "Body", "p"),
            imageField("image", "Image", "img"),
          ],
        },
        {
          id: "vision",
          label: "Vision",
          selector: ".about-page__section--vision",
          fields: [
            textField("title", "Title", "h2"),
            textareaField("body", "Body", "p"),
          ],
        },
        {
          id: "values",
          label: "Values",
          selector: ".about-page__section--values",
          fields: [
            textField("valueTitle", "Value title", "h3"),
            textareaField("valueBody", "Value body", "p"),
          ],
          repeatable: {
            itemSelector: "article, .about-value-card",
            labelSingular: "Value",
            labelPlural: "Values",
          },
        },
        {
          id: "story",
          label: "Story",
          selector: ".about-page__section--story",
          fields: [
            textField("eyebrow", "Eyebrow", ".about-page__eyebrow"),
            textField("title", "Title", "h2"),
            textareaField(
              "body1",
              "Preview paragraph 1",
              ".about-page__story-copy > p:nth-of-type(1)",
            ),
            textareaField(
              "body2",
              "Preview paragraph 2",
              ".about-page__story-copy > p:nth-of-type(2)",
            ),
            textField("statValue", "Stat value", ".about-page__stat strong"),
            textareaField("statLabel", "Stat label", ".about-page__stat span"),
            textField("ctaText", "Read more button text", "#readMoreBtn"),
            imageField("image", "Image", ".about-page__story-image img"),
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
            imageField("image", "Image", ".about-page__message-image img"),
            textField("eyebrow", "Eyebrow", ".about-page__eyebrow"),
            textField("title", "Title", "h2"),
            textareaField("body", "Body", ".about-page__copy"),
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
          label: "Reasons",
          selector: ".about-page__section--reasons",
          fields: [
            textField("eyebrow", "Eyebrow", ".about-page__eyebrow"),
            textField("title", "Title", "h2"),
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
          id: "faculty",
          label: "Faculty",
          selector: ".about-page__section--faculty",
          fields: [
            textField("title", "Title", "h2"),
            textField("memberName", "Member name", "h3"),
            textareaField("memberBio", "Member bio", "p"),
            imageField("memberImage", "Member image", "img"),
          ],
          repeatable: {
            itemSelector: "article, .faculty-card",
            labelSingular: "Faculty member",
            labelPlural: "Faculty members",
          },
        },
        {
          id: "about-cta",
          label: "About CTA",
          selector: ".about-page__cta",
          fields: [
            textField("eyebrow", "Eyebrow", ".about-page__eyebrow"),
            textField("title", "Title", "h2"),
            textareaField("body", "Body", ".about-page__copy"),
            textField("ctaText", "CTA text", ".about-page__button"),
          ],
        },
      ],
    },
    {
      slug: "classes",
      fileName: "classes.html",
      title: "Classes",
      sections: [
        legacyPageHeader,
        {
          id: "class-list",
          label: "Classes",
          selector: ".classes-item",
          fields: [
            imageField("image", "Class image", "img"),
            textField("title", "Class title", "a.h3, h3"),
            textField("teacher", "Teacher name", "h6"),
            textField("price", "Price", ".rounded-pill"),
          ],
          repeatable: {
            itemSelector: ".classes-item",
            labelSingular: "Class",
            labelPlural: "Classes",
          },
        },
      ],
    },
    {
      slug: "facility",
      fileName: "facility.html",
      title: "Facility",
      sections: [
        legacyPageHeader,
        {
          id: "facilities",
          label: "Facilities",
          selector: ".facility-item, .service-item",
          fields: [
            textField("title", "Facility title", "h3, h4"),
            textareaField("body", "Facility body", "p"),
            imageField("image", "Facility image", "img"),
          ],
          repeatable: {
            itemSelector: ".facility-item, .service-item",
            labelSingular: "Facility",
            labelPlural: "Facilities",
          },
        },
      ],
    },
    {
      slug: "team",
      fileName: "team.html",
      title: "Staff",
      sections: [
        {
          id: "hero",
          label: "Staff Hero",
          selector: ".staff-page__hero",
          fields: [
            textField("title", "Title", "h1"),
            textareaField("body", "Body", "p"),
          ],
        },
        {
          id: "leadership",
          label: "Leadership",
          selector: ".staff-page__section--leadership",
          fields: [
            textField("memberName", "Member name", "h3"),
            textareaField("memberBio", "Member bio", "p"),
            imageField("memberImage", "Member image", "img"),
          ],
          repeatable: {
            itemSelector: "article, .staff-card",
            labelSingular: "Staff member",
            labelPlural: "Staff members",
          },
        },
        {
          id: "specialists",
          label: "Academic Specialists",
          selector: ".staff-page__section--specialists",
          fields: [
            textField("memberName", "Member name", "h3"),
            textareaField("memberBio", "Member bio", "p"),
            imageField("memberImage", "Member image", "img"),
          ],
          repeatable: {
            itemSelector: "article, .staff-card",
            labelSingular: "Specialist",
            labelPlural: "Specialists",
          },
        },
        {
          id: "team-growth",
          label: "Team Growth",
          selector: ".staff-page__section--growth",
          fields: [
            textField("eyebrow", "Eyebrow", ".staff-page__eyebrow"),
            textField("title", "Title", "h2"),
            textareaField("body", "Body", ".staff-page__copy"),
            textField("ctaText", "CTA text", ".staff-page__button"),
            textField(
              "pointTitle",
              "Point title",
              ".staff-page__growth-point strong",
            ),
            textareaField(
              "pointBody",
              "Point body",
              ".staff-page__growth-point span",
            ),
          ],
          repeatable: {
            itemSelector: ".staff-page__growth-point",
            labelSingular: "Growth point",
            labelPlural: "Growth points",
          },
        },
      ],
    },
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
            textField("title", "Title", "h1"),
            textareaField("body", "Body", "p"),
          ],
        },
        {
          id: "success-story",
          label: "Featured Success Story",
          selector: ".testimonials-page__section--story",
          fields: [
            imageField("image", "Image", ".testimonials-page__video-card img"),
            textField(
              "duration",
              "Duration label",
              ".testimonials-page__video-duration",
            ),
            textareaField(
              "caption",
              "Caption",
              ".testimonials-page__story-caption",
            ),
            textField("eyebrow", "Eyebrow", ".testimonials-page__eyebrow"),
            textField("title", "Title", "h2"),
            textareaField("body", "Body", ".testimonials-page__story-copy p"),
          ],
        },
        {
          id: "testimonial-wall",
          label: "Testimonials",
          selector: ".testimonials-page__section--wall",
          fields: [
            textareaField("quote", "Quote", "p"),
            textField("author", "Author", "h3, strong"),
            imageField("image", "Image", "img"),
          ],
          repeatable: {
            itemSelector: "article, .testimonial-item",
            labelSingular: "Testimonial",
            labelPlural: "Testimonials",
          },
        },
        {
          id: "testimonials-cta",
          label: "Testimonials CTA",
          selector: ".testimonials-page__section--cta",
          fields: [
            textField("eyebrow", "Eyebrow", ".testimonials-page__eyebrow"),
            textField("title", "Title", "h2"),
            textareaField("body", "Body", "p"),
            textField("ctaText", "CTA text", ".testimonials-page__button"),
          ],
        },
      ],
    },
    {
      slug: "call-to-action",
      fileName: "call-to-action.html",
      title: "Call To Action",
      sections: [legacyPageHeader],
    },
  ],
} satisfies SchoolTemplateManifest;
