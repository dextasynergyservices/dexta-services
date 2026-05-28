import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { dextaAcademy4Manifest } from "@/lib/school-template-manifests/dexta-academy-4";
import {
  buildSchoolTemplateProjectContent,
  buildSchoolTemplateSourceSnapshot,
  sanitizeSchoolTemplateProjectContent,
  validateSchoolTemplateProjectContentReferences,
} from "@/lib/school-template-project-content";

const ABOUT_STORY_IMAGE_URL =
  "https://res.cloudinary.com/dxoorukfj/image/upload/v1777039633/dxt2-about_ubzert.png";

function getAboutStorySection(
  content: ReturnType<typeof buildSchoolTemplateProjectContent>,
) {
  return content.pages
    .find((page) => page.slug === "about")
    ?.sections.find((section) => section.id === "story");
}

function getHomeGalleryPreviewSection(
  content: ReturnType<typeof buildSchoolTemplateProjectContent>,
) {
  return content.pages
    .find((page) => page.slug === "home")
    ?.sections.find((section) => section.id === "gallery-preview");
}

describe("Dexta Academy 4 manifest", () => {
  it("normalizes entity-quoted background image URLs from source markup", () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy4Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy4Manifest,
    );
    const storySection = getAboutStorySection(content);

    assert.ok(storySection, "Expected the About Story section to exist.");
    assert.equal(storySection.fields.image, ABOUT_STORY_IMAGE_URL);
    const sanitized = sanitizeSchoolTemplateProjectContent(
      content,
      sourceSnapshot,
    );

    assert.deepEqual(
      validateSchoolTemplateProjectContentReferences(sanitized, sourceSnapshot),
      [],
    );
  });

  it("normalizes existing entity-quoted image references during sanitization", () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy4Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy4Manifest,
    );
    const storySection = getAboutStorySection(content);

    assert.ok(storySection, "Expected the About Story section to exist.");
    storySection.fields.image = `&quot;${ABOUT_STORY_IMAGE_URL}&quot;`;

    const sanitized = sanitizeSchoolTemplateProjectContent(
      content,
      sourceSnapshot,
    );
    const sanitizedStorySection = getAboutStorySection(sanitized);

    assert.equal(sanitizedStorySection?.fields.image, ABOUT_STORY_IMAGE_URL);
    assert.deepEqual(
      validateSchoolTemplateProjectContentReferences(sanitized, sourceSnapshot),
      [],
    );
  });

  it("keeps the home gallery preview image-only with six-item pagination markup", () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy4Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy4Manifest,
    );
    const gallerySection = getHomeGalleryPreviewSection(content);
    const gallerySnapshot = sourceSnapshot.pages
      .find((page) => page.slug === "home")
      ?.sections.find((section) => section.id === "gallery-preview");
    const sourceHtml = readFileSync(
      path.resolve(
        process.cwd(),
        dextaAcademy4Manifest.sourceDir,
        dextaAcademy4Manifest.entryFile,
      ),
      "utf8",
    );

    assert.equal(gallerySection?.repeatable?.items.length, 10);
    assert.match(sourceHtml, /data-gallery-page-size="6"/);
    assert.match(sourceHtml, /data-gallery-pagination/);
    assert.doesNotMatch(sourceHtml, /<span class="gallery-preview-label"/);
    assert.equal(
      (
        sourceHtml.match(
          /class="gallery-preview-card"[\s\S]*?\bhidden\b|class="gallery-preview-card" hidden/g,
        ) ?? []
      ).length,
      4,
    );
    assert.ok(
      gallerySection?.repeatable?.items.every(
        (item) => "image" in item && !("label" in item) && !("caption" in item),
      ),
      "Home gallery cards should only expose image content.",
    );
    assert.ok(gallerySnapshot?.fields.some((field) => field.key === "image"));
    assert.ok(
      gallerySnapshot?.fields.every(
        (field) => field.key !== "label" && field.key !== "caption",
      ),
      "Home gallery snapshot should not expose per-image title or caption fields.",
    );
  });
});
