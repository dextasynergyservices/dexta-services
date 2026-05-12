import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dextaAcademy5Manifest } from "@/lib/school-template-manifests/dexta-academy-5";
import {
  buildSchoolTemplateProjectContent,
  buildSchoolTemplateSourceSnapshot,
} from "@/lib/school-template-project-content";
import { renderSchoolTemplatePreview } from "@/lib/school-template-preview-renderer";

const expectedPageSections = {
  home: [
    "hero",
    "hero-stats",
    "about-preview",
    "programmes",
    "approach",
    "approach-points",
    "approach-badges",
    "testimonials",
    "admissions-journey",
    "admission-modal",
    "contact-modal",
  ],
  about: ["page-hero", "stats", "story", "values", "story-modal"],
  "campus-life": ["page-hero", "school-life-overview", "school-life-day"],
  gallery: ["page-hero", "gallery-grid"],
  contact: ["page-hero", "contact-details", "contact-form"],
} as const;

const expectedRepeatableCounts = {
  "home:hero-stats": 3,
  "home:programmes": 4,
  "home:approach-points": 4,
  "home:approach-badges": 3,
  "home:testimonials": 3,
  "home:admissions-journey": 2,
  "about:stats": 3,
  "about:values": 3,
  "campus-life:school-life-overview": 3,
  "campus-life:school-life-day": 4,
  "gallery:gallery-grid": 6,
  "contact:contact-details": 3,
} as const;

describe("Dexta Academy 5 manifest", () => {
  it("exposes every page and editable section from the template", () => {
    assert.deepEqual(
      dextaAcademy5Manifest.sharedSections.map((section) => section.id),
      ["site-header", "site-footer"],
    );
    assert.deepEqual(
      dextaAcademy5Manifest.pages.map((page) => page.slug),
      Object.keys(expectedPageSections),
    );

    for (const [pageSlug, sectionIds] of Object.entries(expectedPageSections)) {
      const page = dextaAcademy5Manifest.pages.find(
        (item) => item.slug === pageSlug,
      );

      assert.ok(page, `Expected ${pageSlug} page in manifest.`);
      assert.deepEqual(
        page.sections.map((section) => section.id),
        sectionIds,
        `Expected all editable sections for ${pageSlug}.`,
      );
      assert.ok(
        page.sections.every((section) => section.fields.length > 0),
        `Expected each ${pageSlug} section to expose editable fields.`,
      );
    }
  });

  it("extracts repeatable items from the public source HTML", () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy5Manifest);

    for (const [key, count] of Object.entries(expectedRepeatableCounts)) {
      const [pageSlug, sectionId] = key.split(":");
      const section = content.pages
        .find((page) => page.slug === pageSlug)
        ?.sections.find((item) => item.id === sectionId);

      assert.equal(
        section?.repeatable?.items.length,
        count,
        `Expected ${key} to extract ${count} repeatable items.`,
      );
    }
  });

  it("exposes iframe embed code fields for admission and school contact forms", () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy5Manifest);
    const homePage = content.pages.find((page) => page.slug === "home");
    const contactPage = content.pages.find((page) => page.slug === "contact");
    const admissionModal = homePage?.sections.find(
      (section) => section.id === "admission-modal",
    );
    const contactModal = homePage?.sections.find(
      (section) => section.id === "contact-modal",
    );
    const contactForm = contactPage?.sections.find(
      (section) => section.id === "contact-form",
    );

    assert.equal(admissionModal?.fields.formIframe, "");
    assert.equal(contactModal?.fields.formIframe, "");
    assert.equal(contactForm?.fields.formIframe, "");
  });

  it("renders previews for all template pages", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy5Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy5Manifest,
    );

    for (const page of content.pages) {
      const html = await renderSchoolTemplatePreview({
        content,
        sourceSnapshot,
        pageSlug: page.slug,
      });

      assert.ok(html, `Expected preview HTML for ${page.slug}.`);
      assert.match(html, /<base href="\/dexta-academy-5\/">/);
      assert.match(html, /window\.__DEXTA_SCHOOL_PREVIEW__/);
    }
  });
});
