import { Buffer } from "node:buffer";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inflateRawSync } from "node:zlib";
import { buildSchoolWebsiteProjectExportZip } from "@/lib/school-template-exporter";
import { dextaAcademy3Manifest } from "@/lib/school-template-manifests/dexta-academy-3";
import {
  buildSchoolTemplateProjectContent,
  buildSchoolTemplateSourceSnapshot,
} from "@/lib/school-template-project-content";

function readZipEntries(buffer: Buffer) {
  const entries = new Map<string, Buffer>();
  let endOfCentralDirectoryOffset = -1;

  for (let offset = buffer.length - 22; offset >= 0; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      endOfCentralDirectoryOffset = offset;
      break;
    }
  }

  assert.notEqual(
    endOfCentralDirectoryOffset,
    -1,
    "Zip should include an end-of-central-directory record.",
  );

  const entryCount = buffer.readUInt16LE(endOfCentralDirectoryOffset + 10);
  let cursor = buffer.readUInt32LE(endOfCentralDirectoryOffset + 16);

  for (let index = 0; index < entryCount; index += 1) {
    assert.equal(buffer.readUInt32LE(cursor), 0x02014b50);

    const compressionMethod = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const uncompressedSize = buffer.readUInt32LE(cursor + 24);
    const fileNameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localHeaderOffset = buffer.readUInt32LE(cursor + 42);
    const fileName = buffer
      .subarray(cursor + 46, cursor + 46 + fileNameLength)
      .toString("utf8");

    assert.equal(buffer.readUInt32LE(localHeaderOffset), 0x04034b50);
    const localFileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart =
      localHeaderOffset + 30 + localFileNameLength + localExtraLength;
    const compressedData = buffer.subarray(
      dataStart,
      dataStart + compressedSize,
    );
    const data =
      compressionMethod === 8
        ? inflateRawSync(compressedData)
        : Buffer.from(compressedData);

    assert.equal(data.length, uncompressedSize);
    entries.set(fileName, data);

    cursor += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function getPage(
  content: ReturnType<typeof buildSchoolTemplateProjectContent>,
  slug: string,
) {
  const page = content.pages.find((item) => item.slug === slug);
  assert.ok(page, `Template 3 should include the ${slug} page.`);
  return page;
}

function getSection(
  content: ReturnType<typeof buildSchoolTemplateProjectContent>,
  pageSlug: string,
  sectionId: string,
) {
  const section = getPage(content, pageSlug).sections.find(
    (item) => item.id === sectionId,
  );
  assert.ok(
    section,
    `Template 3 ${pageSlug} page should include ${sectionId}.`,
  );
  return section;
}

function getSharedSection(
  content: ReturnType<typeof buildSchoolTemplateProjectContent>,
  sectionId: string,
) {
  const section = content.sharedSections.find((item) => item.id === sectionId);
  assert.ok(section, `Template 3 should include shared ${sectionId}.`);
  return section;
}

function setFirstRepeatableItem(
  section: ReturnType<typeof getSection>,
  fields: Record<string, unknown>,
) {
  assert.ok(section.repeatable, `${section.id} should be repeatable.`);
  assert.ok(
    section.repeatable.items.length > 0,
    `${section.id} should include repeatable items.`,
  );
  Object.assign(section.repeatable.items[0], fields);
}

describe("Dexta Academy 3 export", () => {
  it("does not download Cloudinary demo fetch wrappers from gallery data", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy3Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy3Manifest,
    );
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async (input) => {
      const url = String(input);
      assert.doesNotMatch(
        url,
        /https:\/\/res\.cloudinary\.com\/demo\/image\/fetch\//,
        "Template 3 export should not request Cloudinary demo fetch URLs.",
      );

      return new globalThis.Response(null, {
        status: 200,
        headers: {
          "content-length": String(3_000_000),
          "content-type": "image/jpeg",
        },
      });
    };

    try {
      const { buffer } = await buildSchoolWebsiteProjectExportZip({
        content,
        sourceSnapshot,
      });
      const entries = readZipEntries(buffer);
      const script = entries.get("script.js")?.toString("utf8") ?? "";

      assert.doesNotMatch(
        script,
        /https:\/\/res\.cloudinary\.com\/demo\/image\/fetch\//,
      );
      assert.match(
        script,
        /https:\/\/images\.unsplash\.com\/photo-1761208662734-fb46f1398551/,
      );
      assert.match(
        script,
        /https:\/\/images\.unsplash\.com\/photo-1755718669459-a8691dd613de/,
      );
      assert.match(
        script,
        /https:\/\/images\.unsplash\.com\/photo-1473649085228-583485e6e4d7/,
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("exports the preview-matched navbar styles and hero animation hooks", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy3Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy3Manifest,
    );
    content.theme.navBarColor = "#123456";
    content.theme.navBarTransparent = false;
    content.theme.brandNameColor = "#ffeedd";
    content.theme.brandTaglineColor = "#aabbcc";
    content.theme.navLinkColor = "#ddffaa";
    content.theme.navHoverColor = "#ff8800";
    content.theme.buttonOverlayEnabled = true;
    content.theme.buttonOverlayColor = "#abcdef";
    content.theme.brandName = "Pneuma";
    content.theme.brandTagline = "Academy Updated";
    content.theme.loadingText = "Loading Template 3";
    content.theme.loadingBackgroundColor = "#0f172a";
    content.theme.loadingTextColor = "#fde68a";
    content.theme.loadingBarColor = "#38bdf8";
    content.theme.loadingCardBorderColor = "#475569";
    content.theme.loadingCardShadowColor = "#020617";
    content.theme.loadingCardShadowOpacity = 35;
    Object.assign(getSharedSection(content, "site-header").fields, {
      headerCtaText: "Join Today",
      headerCtaHref: "contact.html",
      portalText: "Family Login",
      portalHref: "portal.html",
      buttonBgColor: "#fed766",
      buttonTextColor: "#111827",
      buttonBorderColor: "#111827",
      buttonBorderWidth: 2,
      portalButtonBgColor: "#0f172a",
      portalButtonBgOpacity: 80,
      portalButtonTextColor: "#e0f2fe",
      portalButtonBorderColor: "#38bdf8",
      portalButtonBorderWidth: 1,
    });
    const homeHero = content.pages
      .find((page) => page.slug === "home")
      ?.sections.find((section) => section.id === "hero");
    assert.ok(homeHero, "Template 3 should include a home hero section.");
    homeHero.fields.headline =
      '<span style="font-size: 96px;">Quality Learning Made Joyful and Bold</span>';
    homeHero.fields.headlineTextColor = "#101010";
    homeHero.fields.joyfulAccentColor = "#22cc88";
    homeHero.fields.boldAccentColor = "#ee3366";
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new globalThis.Response(null, {
        status: 200,
        headers: {
          "content-length": String(3_000_000),
          "content-type": "image/jpeg",
        },
      });

    try {
      const { buffer } = await buildSchoolWebsiteProjectExportZip({
        content,
        sourceSnapshot,
      });
      const entries = readZipEntries(buffer);
      const indexHtml = entries.get("index.html")?.toString("utf8") ?? "";
      const script = entries.get("script.js")?.toString("utf8") ?? "";

      assert.match(indexHtml, /<header\b[^>]*class="site-header"/);
      assert.doesNotMatch(indexHtml, /data-site-navbar/);
      assert.match(indexHtml, /id="page-loader"/);
      assert.match(indexHtml, /Loading Template 3/);
      assert.match(
        indexHtml,
        /class="brand__crest dexta-empty-logo-mark" hidden/,
      );
      assert.match(
        indexHtml,
        /class="page-loader__crest brand__crest dexta-empty-logo-mark" hidden/,
      );
      assert.match(
        indexHtml,
        /\.page-loader,\s*\.js body \.page-loader\s*{[^}]*background:\s*#0f172a !important/s,
      );
      assert.match(
        indexHtml,
        /\.page-loader__inner\s*{[^}]*background:\s*#0f172a !important/s,
      );
      assert.match(
        indexHtml,
        /\.page-loader__inner\s*{[^}]*border:\s*1px solid #475569 !important/s,
      );
      assert.match(indexHtml, /\.page-loader__bar\s*{[^}]*#38bdf8/s);
      assert.doesNotMatch(
        indexHtml,
        /#spinner \.dexta-loading-text,\s*\.site-loader__text,\s*\.page-loader__copy/s,
      );
      assert.match(indexHtml, /background:\s*#123456 !important/);
      assert.match(indexHtml, /color:\s*#ffeedd !important/);
      assert.match(indexHtml, /color:\s*#aabbcc !important/);
      assert.match(indexHtml, /color:\s*#ddffaa !important/);
      assert.match(indexHtml, /color:\s*#ff8800 !important/);
      assert.match(indexHtml, /Join Today/);
      assert.match(indexHtml, /href="contact\.html"/);
      assert.match(indexHtml, /Family Login/);
      assert.match(indexHtml, /href="portal\.html"/);
      assert.match(indexHtml, /background:\s*#fed766!important/);
      assert.match(indexHtml, /color:\s*#111827!important/);
      assert.match(indexHtml, /border:\s*2px solid #111827!important/);
      assert.match(indexHtml, /rgba\(15, 23, 42, 0\.8\)/);
      assert.match(indexHtml, /color:\s*#e0f2fe!important/);
      assert.match(indexHtml, /<strong\b[^>]*>Pneuma<\/strong>/);
      assert.match(indexHtml, /<span\b[^>]*>Academy Updated<\/span>/);
      assert.match(
        indexHtml,
        /class="hero__title"[^>]*style="[^"]*font-size:\s*clamp\(2\.85rem,\s*10vw,\s*96px\) !important/,
      );
      assert.match(indexHtml, /class="hero__title"[^>]*color:\s*#101010/);
      assert.match(indexHtml, /hero__accent--joyful[^>]*color:\s*#22cc88/);
      assert.match(indexHtml, /hero__accent--bold[^>]*color:\s*#ee3366/);
      assert.match(indexHtml, /hero__segment hero__segment--drop-top/);
      assert.match(indexHtml, /hero__accent hero__accent--fade/);
      assert.match(indexHtml, /\.site-nav a::after\s*{[^}]*#ff8800/s);
      assert.match(indexHtml, /\.button::before/s);
      assert.match(indexHtml, /background:\s*#abcdef !important/);
      assert.match(indexHtml, /padding-top:\s*96px !important/);
      assert.match(script, /body\.classList\.add\("is-animated"\)/);
      assert.match(
        indexHtml,
        /function promoteInlineRichTextColorStylesExport/,
      );
      assert.match(indexHtml, /function applyFontFamilyExport/);
      assert.match(indexHtml, /field\.target === "inlineStyle"/);
      assert.match(indexHtml, /<script src="script\.js" defer><\/script>/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("exports edited section text, text colors, backgrounds, and fonts across pages", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy3Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy3Manifest,
    );

    Object.assign(getSection(content, "home", "welcome").fields, {
      fontFamily: "Lora",
      sectionBgColor: "#f8e1ff",
      title:
        '<span style="color:#712345;font-size:44px;">Edited Welcome Section</span>',
    });
    Object.assign(getSection(content, "home", "how-to-apply").fields, {
      sectionBgColor: "#fff0f5",
      title: '<span style="color:#351a7a;">Edited Apply Title</span>',
      body: '<span style="color:#4a338a;">Edited Apply Body</span>',
      titleTextColor: "#351a7a",
      bodyTextColor: "#4a338a",
    });
    setFirstRepeatableItem(getSection(content, "home", "how-to-apply"), {
      stepNumber: "77",
      stepTitle: '<span style="color:#351a7a;">Edited Apply Step</span>',
      stepBody: '<span style="color:#4a338a;">Edited apply step body.</span>',
    });
    Object.assign(getSection(content, "about", "about-hero").fields, {
      fontFamily: "Nunito",
      sectionBgColor: "#102a43",
      title: '<span style="color:#fafafa;">Edited About Hero</span>',
    });
    const storySection = getSection(content, "about", "story");
    Object.assign(storySection.fields, {
      sectionBgColor: "#eef6ff",
    });
    setFirstRepeatableItem(storySection, {
      cardBorderColor: "#223344",
      cardShadowColor: "#445566",
      cardTitle: '<span style="color:#123abc;">Edited Story Card</span>',
      cardBody:
        '<p class="eyebrow about-story-card__eyebrow">Edited Story</p><h3><span style="color:#123abc;">Edited Story Card</span></h3><p>Edited story card body.</p>',
    });
    const valuesSection = getSection(content, "about", "values");
    Object.assign(valuesSection.fields, {
      sectionBgColor: "#ffe066",
    });
    setFirstRepeatableItem(valuesSection, {
      cardBorderColor: "#775500",
      iconColor: "#221100",
      valueTitle: '<span style="color:#3a2a00;">Edited Value Title</span>',
    });
    Object.assign(getSection(content, "about", "approach").fields, {
      sectionBgColor: "#f7fff7",
      body: '<span style="color:#204020;">Edited Approach Body</span>',
    });
    const impactSection = getSection(content, "about", "impact");
    Object.assign(impactSection.fields, {
      sectionBgColor: "#092635",
      title: '<span style="color:#ffffff;">Edited Impact Title</span>',
    });
    setFirstRepeatableItem(impactSection, {
      iconColor: "#f9d923",
    });
    Object.assign(getSection(content, "about", "tour-cta").fields, {
      sectionBgColor: "#fed766",
      body: '<span style="color:#1d3557;">Edited Tour CTA Body</span>',
    });
    Object.assign(getSection(content, "gallery", "gallery-hero").fields, {
      fontFamily: "Karla",
      sectionBgColor: "#1b1f3b",
      title: '<span style="color:#fff9c4;">Edited Gallery Hero</span>',
    });
    const galleryFiltersSection = getSection(
      content,
      "gallery",
      "gallery-filters",
    );
    Object.assign(galleryFiltersSection.fields, {
      sectionBgColor: "#fff7ed",
    });
    setFirstRepeatableItem(galleryFiltersSection, {
      filterLabel: "Edited Filter",
    });
    const galleryGridSection = getSection(content, "gallery", "gallery-grid");
    Object.assign(galleryGridSection.fields, {
      sectionBgColor: "#f4fff8",
    });
    setFirstRepeatableItem(galleryGridSection, {
      cardBorderColor: "#0f766e",
      cardShadowColor: "#134e4a",
      caption: "Edited Gallery Caption",
    });
    Object.assign(getSection(content, "contact", "contact-hero").fields, {
      fontFamily: "Rubik",
      sectionBgColor: "#081c2f",
      titleTextColor: "#fff7d6",
      bodyTextColor: "#ccf2ff",
      title: '<span style="color:#fff7d6;">Edited Contact Hero</span>',
    });
    Object.assign(getSection(content, "contact", "contact-message").fields, {
      sectionBgColor: "#f5fbff",
      titleTextColor: "#183153",
      bodyTextColor: "#415a77",
      messageCardBgColor: "#ffffff",
    });
    Object.assign(getSection(content, "contact", "admission-modal").fields, {
      headerBgColor: "#35012c",
      guideTitleColor: "#3c096c",
    });
    Object.assign(getSection(content, "contact", "contact-footer").fields, {
      sectionBgColor: "#081c2f",
      bottomTextColor: "#ffee99",
    });

    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new globalThis.Response(null, {
        status: 200,
        headers: {
          "content-length": String(3_000_000),
          "content-type": "image/jpeg",
        },
      });

    try {
      const { buffer } = await buildSchoolWebsiteProjectExportZip({
        content,
        sourceSnapshot,
      });
      const entries = readZipEntries(buffer);
      const indexHtml = entries.get("index.html")?.toString("utf8") ?? "";
      const aboutHtml = entries.get("about.html")?.toString("utf8") ?? "";
      const galleryHtml = entries.get("gallery.html")?.toString("utf8") ?? "";
      const contactHtml = entries.get("contact.html")?.toString("utf8") ?? "";

      assert.match(indexHtml, /Edited Welcome Section/);
      assert.match(indexHtml, /color:\s*#712345 !important/);
      assert.match(indexHtml, /font-size:\s*44px !important/);
      assert.match(
        indexHtml,
        /--dexta-academy-3-home-welcome-section-bg-color:\s*#f8e1ff/,
      );
      assert.match(
        indexHtml,
        /--dexta-academy-3-home-how-to-apply-title-text-color:\s*#351a7a/,
      );
      assert.match(indexHtml, /Edited Apply Title/);
      assert.match(indexHtml, /Edited Apply Body/);
      assert.match(indexHtml, /77/);
      assert.match(indexHtml, /Edited Apply Step/);
      assert.match(indexHtml, /Edited apply step body/);
      assert.match(indexHtml, /font-family:\s*&quot;Lora&quot;/);
      assert.match(indexHtml, /family=Lora/);

      assert.match(aboutHtml, /Edited About Hero/);
      assert.match(aboutHtml, /Edited Story Card/);
      assert.match(aboutHtml, /Edited Value Title/);
      assert.match(aboutHtml, /Edited Approach Body/);
      assert.match(aboutHtml, /Edited Impact Title/);
      assert.match(aboutHtml, /Edited Tour CTA Body/);
      assert.match(
        aboutHtml,
        /--dexta-academy-3-about-hero-section-bg-color:\s*#102a43/,
      );
      assert.match(
        aboutHtml,
        /--dexta-academy-3-about-story-section-bg-color:\s*#eef6ff/,
      );
      assert.match(
        aboutHtml,
        /--dexta-academy-3-about-story-card-border-color:\s*#223344/,
      );
      assert.match(
        aboutHtml,
        /--dexta-academy-3-about-values-section-bg-color:\s*#ffe066/,
      );
      assert.match(
        aboutHtml,
        /--dexta-academy-3-about-values-card-border-color:\s*#775500/,
      );
      assert.match(
        aboutHtml,
        /--dexta-academy-3-about-values-icon-icon-color:\s*#221100/,
      );
      assert.match(
        aboutHtml,
        /--dexta-academy-3-about-approach-section-bg-color:\s*#f7fff7/,
      );
      assert.match(
        aboutHtml,
        /--dexta-academy-3-about-impact-section-bg-color:\s*#092635/,
      );
      assert.match(
        aboutHtml,
        /--dexta-academy-3-about-impact-icon-icon-color:\s*#f9d923/,
      );
      assert.match(
        aboutHtml,
        /--dexta-academy-3-about-tour-cta-section-bg-color:\s*#fed766/,
      );
      assert.match(aboutHtml, /color:\s*#1d3557 !important/);
      assert.match(aboutHtml, /font-family:\s*&quot;Nunito&quot;/);
      assert.match(aboutHtml, /family=Nunito/);

      assert.match(galleryHtml, /Edited Gallery Hero/);
      assert.match(galleryHtml, /Edited Filter/);
      assert.match(galleryHtml, /Edited Gallery Caption/);
      assert.match(
        galleryHtml,
        /--dexta-academy-3-gallery-hero-section-bg-color:\s*#1b1f3b/,
      );
      assert.match(
        galleryHtml,
        /--dexta-academy-3-gallery-filters-section-bg-color:\s*#fff7ed/,
      );
      assert.match(
        galleryHtml,
        /--dexta-academy-3-gallery-grid-section-bg-color:\s*#f4fff8/,
      );
      assert.match(
        galleryHtml,
        /--dexta-academy-3-gallery-grid-card-border-color:\s*#0f766e/,
      );
      assert.match(
        galleryHtml,
        /--dexta-academy-3-gallery-grid-card-shadow-color:\s*#134e4a/,
      );
      assert.match(galleryHtml, /color:\s*#fff9c4 !important/);
      assert.match(galleryHtml, /font-family:\s*&quot;Karla&quot;/);
      assert.match(galleryHtml, /family=Karla/);

      assert.match(contactHtml, /Edited Contact Hero/);
      assert.match(
        contactHtml,
        /--dexta-academy-3-contact-hero-section-bg-color:\s*#081c2f/,
      );
      assert.match(
        contactHtml,
        /--dexta-academy-3-contact-hero-title-text-color:\s*#fff7d6/,
      );
      assert.match(
        contactHtml,
        /--dexta-academy-3-contact-message-title-text-color:\s*#183153/,
      );
      assert.match(
        contactHtml,
        /--dexta-academy-3-contact-admission-header-bg-color:\s*#35012c/,
      );
      assert.match(
        contactHtml,
        /--dexta-academy-3-contact-footer-bottom-text-color:\s*#ffee99/,
      );
      assert.match(contactHtml, /font-family:\s*&quot;Rubik&quot;/);
      assert.match(contactHtml, /family=Rubik/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("includes export CSS hooks for every Template 3 section style field", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy3Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy3Manifest,
    );
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new globalThis.Response(null, {
        status: 200,
        headers: {
          "content-length": String(3_000_000),
          "content-type": "image/jpeg",
        },
      });

    try {
      const { buffer } = await buildSchoolWebsiteProjectExportZip({
        content,
        sourceSnapshot,
      });
      const entries = readZipEntries(buffer);
      const exportedHtml = Array.from(entries.values())
        .map((entry) => entry.toString("utf8"))
        .join("\n");
      const cssVariables = new Set<string>();

      for (const section of [
        ...sourceSnapshot.sharedSections,
        ...sourceSnapshot.pages.flatMap((page) => page.sections),
      ]) {
        for (const field of section.fields) {
          if (field.target === "cssVariable" && field.cssVariable) {
            cssVariables.add(field.cssVariable);
          }
        }
      }

      const missingVariables = Array.from(cssVariables).filter(
        (variable) => !exportedHtml.includes(variable),
      );

      assert.deepEqual(missingVariables, []);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
