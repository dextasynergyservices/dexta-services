import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dextaAcademy2Manifest } from "@/lib/school-template-manifests/dexta-academy-2";
import { schoolTemplateManifests } from "@/lib/school-template-manifests";
import {
  buildSchoolTemplateProjectContent,
  buildSchoolTemplateSourceSnapshot,
} from "@/lib/school-template-project-content";
import { renderSchoolTemplatePreview } from "@/lib/school-template-preview-renderer";

describe("school template preview renderer", () => {
  it("keeps internal page links inside the edited project preview for every template", async () => {
    for (const manifest of schoolTemplateManifests) {
      const content = buildSchoolTemplateProjectContent(manifest);
      const sourceSnapshot = buildSchoolTemplateSourceSnapshot(manifest);
      const page =
        content.pages.find((item) => item.isHome) ?? content.pages[0];

      assert.ok(page, `Expected ${manifest.templateSlug} to provide pages.`);

      const html = await renderSchoolTemplatePreview({
        content,
        sourceSnapshot,
        pageSlug: page.slug,
      });

      assert.ok(html, `Expected preview HTML for ${manifest.templateSlug}.`);
      assert.match(html, /function getPreviewRouteBase/);
      assert.match(html, /function getPreviewNavigationTarget/);
      assert.match(html, /function rewritePreviewInternalLinks/);
      assert.match(html, /document\.querySelectorAll\("a\[href\]"\)/);
      assert.match(html, /preview\.content\.pages\.find/);
      assert.ok(
        html.includes(
          String.raw`window.location.pathname.match(/^(.*\/admin\/we-brand-schools\/projects\/[^/]+\/preview)\/[^/]+$/)`,
        ),
        `Expected ${manifest.templateSlug} preview route matching regex to stay escaped.`,
      );
      assert.ok(
        html.includes(String.raw`if (/^https?:\/\//i.test(href))`),
        `Expected ${manifest.templateSlug} same-origin URL regex to stay escaped.`,
      );
      assert.ok(
        html.includes(
          String.raw`pathname = pathname.replace(/\\/g, "/").replace(/^\.\//, "");`,
        ),
        `Expected ${manifest.templateSlug} path normalization regexes to stay escaped.`,
      );
      assert.ok(
        html.includes(
          'routeBase + "/" + encodeURIComponent(target.slug) + window.location.search + target.hash',
        ),
        `Expected ${manifest.templateSlug} preview links to target project preview routes.`,
      );

      for (const contentPage of content.pages) {
        assert.ok(
          html.includes(`"fileName":"${contentPage.fileName}"`),
          `Expected ${manifest.templateSlug} preview runtime to include ${contentPage.fileName}.`,
        );
      }
    }
  });

  it("keeps Template 2 Values Strip intro title sourced from the title field, not the body field", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const values = content.pages
      .find((page) => page.slug === "home")
      ?.sections.find((section) => section.id === "values");

    assert.ok(values, "Expected Template 2 Values Strip content.");
    values.fields.title = "Correct legacy intro title";
    values.fields.introTitle = "Intro body leaked into title";
    values.fields.introBody = "Intro body leaked into title";

    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "home",
    });

    assert.ok(html, "Expected Template 2 home preview HTML.");
    assert.match(html, /function getTemplateTwoValuesIntroTitle/);
    assert.match(html, /function toComparableText/);
    assert.match(html, /function setElementHtml/);
    assert.match(html, /function toInlineHtml/);
    assert.match(
      html,
      /var title = getPageSectionField\("home", "values", "title"\)/,
    );
    assert.match(
      html,
      /toComparableText\(introTitle\) === toComparableText\(introBody\)/,
    );
    assert.match(html, /setElementHtml\(node, value\)/);
    assert.match(html, /Correct legacy intro title/);
  });
});
