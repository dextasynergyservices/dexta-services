import assert from "node:assert/strict";
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
});
