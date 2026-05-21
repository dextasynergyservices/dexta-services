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

  it("uses Montserrat for Template 2 navbar, footer, and buttons when projects carry the old default font", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );

    content.theme.navLinkFontFamily =
      '"Plus Jakarta Sans", "Segoe UI", sans-serif';

    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "home",
    });

    assert.ok(html, "Expected Template 2 home preview HTML.");
    assert.match(html, /function getTemplateChromeFont/);
    assert.match(html, /\.site-footer/);
    assert.match(html, /\.button/);
    assert.match(
      html,
      /Montserrat:ital,wght@0,100\.\.900;1,100\.\.900&display=swap/,
    );
    assert.match(html, /normalized\.indexOf\("plus jakarta sans"\) !== -1/);
  });

  it("covers direct hero background images in the preview runtime", async () => {
    const manifest = schoolTemplateManifests.find(
      (item) => item.templateSlug === "dexta-academy-5",
    );

    assert.ok(manifest, "Expected Template 5 manifest.");

    const content = buildSchoolTemplateProjectContent(manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(manifest);

    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "home",
    });

    assert.ok(html, "Expected Template 5 home preview HTML.");
    assert.match(html, /function shouldCoverBackgroundImage/);
    assert.match(html, /node\.style\.backgroundSize = "cover"/);
    assert.match(html, /node\.style\.backgroundPosition = "center center"/);
    assert.match(html, /node\.style\.backgroundRepeat = "no-repeat"/);
  });

  it("renders Template 3 hero art through the main sky image layer", async () => {
    const manifest = schoolTemplateManifests.find(
      (item) => item.templateSlug === "dexta-academy-3",
    );

    assert.ok(manifest, "Expected Template 3 manifest.");
    const heroFields = manifest.pages
      .find((page) => page.slug === "home")
      ?.sections.find((section) => section.id === "hero")?.fields;

    assert.ok(heroFields, "Expected Template 3 home hero fields.");
    assert.ok(
      heroFields.some((field) => field.key === "skyImage"),
      "Expected Template 3 hero to expose the main sky image control.",
    );
    assert.ok(
      heroFields.every((field) => field.key !== "sectionBgImage"),
      "Template 3 hero should not expose a competing generic background image.",
    );

    const content = buildSchoolTemplateProjectContent(manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(manifest);

    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "home",
    });

    assert.ok(html, "Expected Template 3 home preview HTML.");
    assert.match(
      html,
      /\.hero__sky-image\{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center top!important;opacity:\.94!important;transform:scale\(1\.12\);transform-origin:center top!important;\}/,
    );
    assert.match(
      html,
      /@media \(max-width:560px\)\{\.hero__sky-layer\{top:0!important;right:0!important;bottom:0!important;left:0!important;height:auto!important;max-height:none!important;background(?:-color)?:[^}]+!important;background-image:none!important;\}\.hero__sky-image\{object-position:center 14%!important;\}\}/,
    );
    assert.match(
      html,
      /function applyAcademyThreeHeroBackgroundImage/,
    );
    assert.match(
      html,
      /skyLayer\.style\.setProperty\("background-image", "none", "important"\)/,
    );
    assert.match(
      html,
      /\.programme-tile::before\{height:var\(--dexta-academy-3-home-programmes-card-overlay-height,76%\)!important;background:linear-gradient/,
    );
    assert.match(
      html,
      /--dexta-academy-3-home-programmes-card-overlay-opacity,96%/,
    );
    assert.match(html, /function promoteInlineRichTextColorStyles/);
    assert.match(html, /function hasRichTextColorStyle/);
    assert.match(html, /!hasRichTextColorStyle\(value\)/);
    assert.match(
      html,
      /node\.style\.setProperty\("color", color, "important"\)/,
    );
    assert.match(
      html,
      /node\.style\.setProperty\("background-color", backgroundColor, "important"\)/,
    );
  });
});
