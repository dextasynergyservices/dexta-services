import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dextaAcademy2Manifest } from "@/lib/school-template-manifests/dexta-academy-2";
import {
  buildSchoolTemplateProjectContent,
  buildSchoolTemplateSourceSnapshot,
  parseSchoolTemplateProjectContent,
  sanitizeSchoolTemplateProjectContent,
  syncSchoolTemplateProjectContentWithManifest,
  validateSchoolTemplateProjectContentReferences,
} from "@/lib/school-template-project-content";
import { renderSchoolTemplatePreview } from "@/lib/school-template-preview-renderer";

describe("Dexta Academy 2 manifest", () => {
  it("exposes the injected admission modal as editable shared content", () => {
    assert.deepEqual(
      dextaAcademy2Manifest.sharedSections.map((section) => section.id),
      ["site-header", "site-footer", "admission-modal"],
    );

    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const admissionModal = content.sharedSections.find(
      (section) => section.id === "admission-modal",
    );

    assert.equal(admissionModal?.fields.eyebrow, "Admissions Form");
    assert.equal(admissionModal?.fields.title, "Apply to DXT Academy");
    assert.match(
      String(admissionModal?.fields.formUrl),
      /^https:\/\/docs\.google\.com\/forms\/d\/e\//,
    );
    assert.equal(admissionModal?.fields.formIframe, "");
    assert.equal(
      admissionModal?.fields.formTitle,
      "DXT Academy admission form",
    );
  });

  it("exposes the injected footer details as complete editable shared content", () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const footer = content.sharedSections.find(
      (section) => section.id === "site-footer",
    );
    const footerSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    ).sharedSections.find((section) => section.id === "site-footer");

    assert.ok(footer, "Expected footer shared section.");
    assert.ok(footerSnapshot, "Expected footer source snapshot.");
    assert.deepEqual(
      footerSnapshot.fields.map((field) => field.key),
      [
        "brandName",
        "brandTagline",
        "description",
        "homeLinkText",
        "homeLinkHref",
        "aboutLinkText",
        "aboutLinkHref",
        "academicsLinkText",
        "academicsLinkHref",
        "admissionsLinkText",
        "admissionsLinkHref",
        "studentLifeLinkText",
        "studentLifeLinkHref",
        "galleryLinkText",
        "galleryLinkHref",
        "contactLinkText",
        "contactLinkHref",
        "address",
        "phone",
        "phoneHref",
        "email",
        "emailHref",
        "copyright",
      ],
    );
    assert.equal(footer.fields.brandName, "DXT ACADEMY");
    assert.equal(footer.fields.brandTagline, "Nurturing. Inspiring. Leading.");
    assert.equal(footer.fields.address, "12 Excellence Drive, Lagos, Nigeria");
    assert.equal(footer.fields.phone, "+234 801 234 5678");
    assert.equal(footer.fields.phoneHref, "tel:+2348012345678");
    assert.equal(footer.fields.email, "info@dxtacademy.edu.ng");
    assert.equal(footer.fields.emailHref, "mailto:info@dxtacademy.edu.ng");
    assert.equal(footer.fields.privacyHref, undefined);
    assert.equal(footer.fields.termsHref, undefined);
  });

  it("exposes the contact form and contact details as separate editable sections", () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const contactPage = content.pages.find((page) => page.slug === "contact");
    const contactForm = contactPage?.sections.find(
      (section) => section.id === "contact-form",
    );
    const contactDetails = contactPage?.sections.find(
      (section) => section.id === "contact-details",
    );

    assert.ok(contactPage, "Expected contact page content.");
    assert.deepEqual(
      contactPage.sections.map((section) => section.id),
      ["page-hero", "contact-form", "contact-details"],
    );
    assert.equal(contactForm?.fields.eyebrow, "School Enquiry Form");
    assert.equal(contactForm?.fields.title, "Send a Message");
    assert.equal(
      contactForm?.fields.body,
      "Complete the form below and our team will get back to you shortly.",
    );
    assert.match(
      String(contactForm?.fields.formUrl),
      /^https:\/\/docs\.google\.com\/forms\/d\/e\//,
    );
    assert.equal(contactForm?.fields.formIframe, "");
    assert.equal(contactForm?.fields.formTitle, "DXT Academy contact form");
    assert.equal(contactDetails?.fields.heading, "Contact Information");
    assert.equal(
      contactDetails?.fields.address,
      "12 Excellence Drive, Lagos, Nigeria",
    );
    assert.equal(contactDetails?.fields.phone, "+234 801 234 5678");
    assert.equal(contactDetails?.fields.phoneHref, "tel:+2348012345678");
    assert.equal(contactDetails?.fields.email, "info@dxtacademy.edu.ng");
    assert.equal(
      contactDetails?.fields.emailHref,
      "mailto:info@dxtacademy.edu.ng",
    );
    assert.equal(
      contactDetails?.fields.officeHours,
      "Monday to Friday, 8:00 AM - 4:00 PM",
    );
    assert.equal(
      contactDetails?.fields.quoteAuthor,
      "Admissions &amp; Communications Office",
    );
  });

  it("exposes homepage design controls for every homepage section", () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const homePage = content.pages.find((page) => page.slug === "home");
    const homeSnapshot = sourceSnapshot.pages.find(
      (page) => page.slug === "home",
    );

    assert.ok(homePage, "Expected home page content.");
    assert.ok(homeSnapshot, "Expected home page snapshot.");

    const expectedSectionIds = [
      "hero",
      "stats",
      "values",
      "about-preview",
      "programs",
      "student-life-preview",
      "student-life-cards",
    ];

    assert.deepEqual(
      homePage.sections.map((section) => section.id),
      expectedSectionIds,
    );

    for (const sectionId of expectedSectionIds) {
      const section = homePage.sections.find((item) => item.id === sectionId);
      const snapshot = homeSnapshot.sections.find(
        (item) => item.id === sectionId,
      );
      const fieldKeys = snapshot?.fields.map((field) => field.key) ?? [];

      assert.ok(section, `Expected ${sectionId} content.`);
      assert.ok(snapshot, `Expected ${sectionId} snapshot.`);
      assert.ok(
        fieldKeys.includes("sectionBgColor"),
        `Expected ${sectionId} to expose section background color.`,
      );
      assert.ok(
        sectionId === "hero" || fieldKeys.includes("sectionBgImage"),
        `Expected ${sectionId} to expose section background image.`,
      );
      assert.ok(
        fieldKeys.includes("fontStylesheetUrl"),
        `Expected ${sectionId} to expose Google font import URL.`,
      );
      assert.ok(
        !fieldKeys.includes("headingTextColor"),
        `Expected ${sectionId} heading color to stay inside rich text controls.`,
      );
      assert.ok(
        !fieldKeys.includes("bodyTextColor"),
        `Expected ${sectionId} body color to stay inside rich text controls.`,
      );
    }

    for (const sectionId of [
      "hero",
      "about-preview",
      "programs",
      "student-life-preview",
    ]) {
      const snapshot = homeSnapshot.sections.find(
        (item) => item.id === sectionId,
      );
      const fieldKeys = snapshot?.fields.map((field) => field.key) ?? [];

      assert.ok(
        fieldKeys.includes("buttonBgColor"),
        `Expected ${sectionId} to expose button background color.`,
      );
      assert.ok(
        fieldKeys.includes("buttonBorderWidth"),
        `Expected ${sectionId} to expose removable button borders.`,
      );
      assert.ok(
        fieldKeys.includes("buttonIconName"),
        `Expected ${sectionId} to expose button icon name.`,
      );
    }

    for (const sectionId of [
      "stats",
      "values",
      "programs",
      "student-life-cards",
    ]) {
      const snapshot = homeSnapshot.sections.find(
        (item) => item.id === sectionId,
      );
      const fieldKeys = snapshot?.fields.map((field) => field.key) ?? [];
      const section = homePage.sections.find((item) => item.id === sectionId);

      assert.ok(
        fieldKeys.includes("iconColor"),
        `Expected ${sectionId} to expose icon color.`,
      );
      assert.ok(
        fieldKeys.includes("iconBorderColor"),
        `Expected ${sectionId} to expose icon border color.`,
      );
      assert.ok(
        fieldKeys.includes("iconBorderWidth"),
        `Expected ${sectionId} to expose removable icon borders.`,
      );
      assert.ok(
        section?.repeatable?.items[0] &&
          "iconName" in section.repeatable.items[0],
        `Expected ${sectionId} repeatable items to expose icon names.`,
      );
      assert.ok(
        section?.repeatable?.items[0] &&
          "iconImage" in section.repeatable.items[0],
        `Expected ${sectionId} repeatable items to expose uploaded icons.`,
      );
    }

    const heroSnapshot = homeSnapshot.sections.find(
      (section) => section.id === "hero",
    );
    const heroHeadline = heroSnapshot?.fields.find(
      (field) => field.key === "headline",
    );
    const programsSnapshot = homeSnapshot.sections.find(
      (section) => section.id === "programs",
    );
    const programBody = programsSnapshot?.fields.find(
      (field) => field.key === "programBody",
    );

    assert.equal(heroHeadline?.type, "richText");
    assert.equal(heroHeadline?.target, "innerHTML");
    assert.equal(programBody?.type, "richText");
    assert.equal(programBody?.target, "innerHTML");
  });

  it("migrates legacy Values Strip intro fields without repeatable key collisions", () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const rawContent = JSON.parse(JSON.stringify(content));
    const values = rawContent.pages
      .find((page: { slug: string }) => page.slug === "home")
      ?.sections.find((section: { id: string }) => section.id === "values");

    assert.ok(values, "Expected Values Strip section.");
    values.fields.title = "Admin intro title";
    values.fields.body = "Admin intro body";
    values.repeatable.items[0].title = "Legacy item title";
    values.repeatable.items[0].body = "Legacy item body";
    delete values.fields.introTitle;
    delete values.fields.introBody;

    const parsed = parseSchoolTemplateProjectContent(rawContent);
    assert.ok(parsed.success, "Expected legacy values content to parse.");

    const synced = syncSchoolTemplateProjectContentWithManifest({
      content: parsed.data,
      sourceSnapshot,
      rawContent,
    });
    const syncedValues = synced.contentJson.pages
      .find((page) => page.slug === "home")
      ?.sections.find((section) => section.id === "values");

    assert.equal(syncedValues?.fields.introTitle, "Admin intro title");
    assert.equal(syncedValues?.fields.introBody, "Admin intro body");
    assert.equal(syncedValues?.repeatable?.items[0].valueTitle, "Integrity");
    assert.equal(
      syncedValues?.repeatable?.items[0].valueBody,
      "We uphold honesty, fairness, and strong moral principles in all we do.",
    );
  });

  it("repairs Values Strip intro title when it was saved with the intro body value", () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const rawContent = JSON.parse(JSON.stringify(content));
    const values = rawContent.pages
      .find((page: { slug: string }) => page.slug === "home")
      ?.sections.find((section: { id: string }) => section.id === "values");

    assert.ok(values, "Expected Values Strip section.");
    values.fields.title = "Correct admin intro title";
    values.fields.body = "Correct admin intro body";
    values.fields.introTitle = "Correct admin intro body";
    values.fields.introBody = "Correct admin intro body";

    const parsed = parseSchoolTemplateProjectContent(rawContent);
    assert.ok(parsed.success, "Expected values content to parse.");

    const synced = syncSchoolTemplateProjectContentWithManifest({
      content: parsed.data,
      sourceSnapshot,
      rawContent,
    });
    const syncedValues = synced.contentJson.pages
      .find((page) => page.slug === "home")
      ?.sections.find((section) => section.id === "values");

    assert.equal(syncedValues?.fields.introTitle, "Correct admin intro title");
    assert.equal(syncedValues?.fields.introBody, "Correct admin intro body");
  });

  it("exposes the admissions form as its own editable admissions page section", () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const admissionsPage = content.pages.find(
      (page) => page.slug === "admissions",
    );
    const admissionForm = admissionsPage?.sections.find(
      (section) => section.id === "admission-form",
    );

    assert.ok(admissionsPage, "Expected admissions page content.");
    assert.deepEqual(
      admissionsPage.sections.map((section) => section.id),
      [
        "page-hero",
        "process",
        "admissions-support",
        "admissions-cta",
        "admission-form",
      ],
    );
    assert.equal(admissionForm?.fields.title, "Apply to DXT Academy");
    assert.equal(admissionForm?.fields.formUrl, "");
    assert.equal(admissionForm?.fields.formIframe, "");
    assert.equal(admissionForm?.fields.formTitle, "");
  });

  it("hydrates the admissions page form section from existing shared admission edits", () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const admissionModal = content.sharedSections.find(
      (section) => section.id === "admission-modal",
    );
    const admissionsPage = content.pages.find(
      (page) => page.slug === "admissions",
    );

    assert.ok(admissionModal, "Expected admission modal shared section.");
    assert.ok(admissionsPage, "Expected admissions page.");

    admissionModal.fields.title = "Join Legacy Academy";
    admissionModal.fields.formIframe =
      '<iframe src="https://docs.google.com/forms/d/e/legacy-admission/viewform?embedded=true" width="640" height="1602">Loading...</iframe>';
    admissionsPage.sections = admissionsPage.sections.filter(
      (section) => section.id !== "admission-form",
    );

    const synced = syncSchoolTemplateProjectContentWithManifest({
      content,
      sourceSnapshot,
      rawContent: content,
    });
    const syncedAdmissionForm = synced.contentJson.pages
      .find((page) => page.slug === "admissions")
      ?.sections.find((section) => section.id === "admission-form");

    assert.equal(syncedAdmissionForm?.fields.title, "Join Legacy Academy");
    assert.match(
      String(syncedAdmissionForm?.fields.formIframe),
      /legacy-admission/,
    );
  });

  it("exposes non-home page hero images as editable fields", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const aboutPage = content.pages.find((page) => page.slug === "about");
    const aboutHero = aboutPage?.sections.find(
      (section) => section.id === "page-hero",
    );
    const aboutHeroSnapshot = sourceSnapshot.pages
      .find((page) => page.slug === "about")
      ?.sections.find((section) => section.id === "page-hero");

    assert.ok(aboutHero, "Expected about page hero section.");
    assert.deepEqual(
      aboutHeroSnapshot?.fields.map((field) => field.key),
      [
        "sectionBgColor",
        "sectionBgOpacity",
        "fontStylesheetUrl",
        "breadcrumbs",
        "eyebrow",
        "title",
        "body",
        "backgroundImage",
        "buildingImage",
        "mobileBackgroundImage",
        "overlayColor",
        "overlayOpacity",
      ],
    );

    aboutHero.fields.backgroundImage = "custom/about-bg.png";
    aboutHero.fields.buildingImage = "custom/about-building.png";
    aboutHero.fields.mobileBackgroundImage = "custom/about-mobile-bg.png";
    aboutHero.fields.overlayColor = "#102030";
    aboutHero.fields.overlayOpacity = 0.35;

    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "about",
    });

    assert.ok(html, "Expected about preview HTML.");
    assert.match(html, /--dexta-academy-2-page-hero-background-image/);
    assert.match(html, /--dexta-academy-2-page-hero-mobile-background-image/);
    assert.match(html, /custom\/about-bg\.png/);
    assert.match(html, /custom\/about-building\.png/);
    assert.match(html, /custom\/about-mobile-bg\.png/);
    assert.match(html, /#102030/);
    assert.match(html, /0\.35/);
  });

  it("carries homepage design controls into the preview runtime", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const homePage = content.pages.find((page) => page.slug === "home");
    const hero = homePage?.sections.find((section) => section.id === "hero");
    const values = homePage?.sections.find(
      (section) => section.id === "values",
    );
    const programs = homePage?.sections.find(
      (section) => section.id === "programs",
    );

    assert.ok(hero, "Expected home hero section.");
    assert.ok(values, "Expected values section.");
    assert.ok(programs, "Expected programs section.");

    hero.fields.buttonBgColor = "#112233";
    hero.fields.buttonBgOpacity = 55;
    hero.fields.buttonBorderWidth = 2;
    hero.fields.buttonIconName = "trophy";
    values.fields.sectionBgColor = "#f7fafc";
    values.fields.sectionBgImage = "custom/values-bg.png";
    values.fields.fontStylesheetUrl =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap";
    values.fields.introTitle = "Our Values. Their Future.";
    values.fields.introBody =
      "At DXT Academy, values are not posters on walls. They shape decisions, relationships, and every learning moment.";
    values.repeatable!.items[0].iconName = "respect";
    values.repeatable!.items[0].iconImage = "custom/value-icon.svg";
    values.repeatable!.items[0].iconSvgOpacity = 0;
    programs.fields.buttonBorderColor = "#445566";

    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "home",
    });

    assert.ok(html, "Expected home preview HTML.");
    assert.match(html, /--dexta-academy-2-home-hero-button-bg-color/);
    assert.match(html, /--dexta-academy-2-home-values-section-bg-image/);
    assert.doesNotMatch(html, /--dexta-academy-2-home-programs-heading-font/);
    assert.match(html, /injectPreviewFontStylesheets/);
    assert.match(html, /refreshTemplateTwoIcons/);
    assert.match(
      html,
      /https:\/\/fonts\.googleapis\.com\/css2\?family=Poppins/,
    );
    assert.match(html, /custom\/values-bg\.png/);
    assert.match(html, /custom\/value-icon\.svg/);
    assert.match(html, /Our Values\. Their Future\./);
    assert.match(html, /At DXT Academy, values are not posters on walls\./);
    assert.match(html, /#445566/);
  });

  it("exposes about page design controls for every about section", () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const aboutPage = content.pages.find((page) => page.slug === "about");
    const aboutSnapshot = sourceSnapshot.pages.find(
      (page) => page.slug === "about",
    );

    assert.ok(aboutPage, "Expected about page content.");
    assert.ok(aboutSnapshot, "Expected about page snapshot.");
    assert.deepEqual(
      aboutPage.sections.map((section) => section.id),
      [
        "page-hero",
        "stats",
        "who-we-are",
        "story",
        "story-modal",
        "mission-vision",
        "family-choice",
      ],
    );

    const pageHeroKeys =
      aboutSnapshot.sections
        .find((section) => section.id === "page-hero")
        ?.fields.map((field) => field.key) ?? [];
    assert.ok(pageHeroKeys.includes("sectionBgColor"));
    assert.ok(pageHeroKeys.includes("backgroundImage"));
    assert.ok(pageHeroKeys.includes("fontStylesheetUrl"));

    for (const sectionId of [
      "stats",
      "who-we-are",
      "story",
      "story-modal",
      "mission-vision",
      "family-choice",
    ]) {
      const snapshot = aboutSnapshot.sections.find(
        (section) => section.id === sectionId,
      );
      const fieldKeys = snapshot?.fields.map((field) => field.key) ?? [];

      assert.ok(snapshot, `Expected ${sectionId} snapshot.`);
      assert.ok(
        fieldKeys.includes("sectionBgColor"),
        `Expected ${sectionId} to expose section background color.`,
      );
      assert.ok(
        fieldKeys.includes("sectionBgImage"),
        `Expected ${sectionId} to expose section background image.`,
      );
      assert.ok(
        fieldKeys.includes("fontStylesheetUrl"),
        `Expected ${sectionId} to expose Google font import URL.`,
      );
    }

    const storyFields =
      aboutSnapshot.sections.find((section) => section.id === "story")
        ?.fields ?? [];
    const missionFields =
      aboutSnapshot.sections.find((section) => section.id === "mission-vision")
        ?.fields ?? [];
    const familyTitle = aboutSnapshot.sections
      .find((section) => section.id === "family-choice")
      ?.fields.find((field) => field.key === "title");

    assert.ok(storyFields.some((field) => field.key === "buttonBgColor"));
    assert.ok(storyFields.some((field) => field.key === "buttonBorderWidth"));
    assert.ok(missionFields.some((field) => field.key === "iconColor"));
    assert.ok(missionFields.some((field) => field.key === "iconImage"));
    assert.equal(familyTitle?.type, "richText");
    assert.equal(familyTitle?.target, "innerHTML");
  });

  it("carries about page design controls into the preview runtime", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const aboutPage = content.pages.find((page) => page.slug === "about");
    const pageHero = aboutPage?.sections.find(
      (section) => section.id === "page-hero",
    );
    const stats = aboutPage?.sections.find((section) => section.id === "stats");
    const whoWeAre = aboutPage?.sections.find(
      (section) => section.id === "who-we-are",
    );
    const story = aboutPage?.sections.find((section) => section.id === "story");
    const missionVision = aboutPage?.sections.find(
      (section) => section.id === "mission-vision",
    );
    const familyChoice = aboutPage?.sections.find(
      (section) => section.id === "family-choice",
    );

    assert.ok(pageHero, "Expected about page hero section.");
    assert.ok(stats, "Expected about stats section.");
    assert.ok(whoWeAre, "Expected about who-we-are section.");
    assert.ok(story, "Expected about story section.");
    assert.ok(missionVision?.repeatable?.items[0], "Expected mission card.");
    assert.ok(familyChoice, "Expected family choice section.");

    pageHero.fields.sectionBgColor = "#061321";
    stats.fields.sectionBgImage = "custom/about-stats-bg.png";
    whoWeAre.fields.fontStylesheetUrl =
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap";
    story.fields.buttonBgColor = "#123456";
    story.fields.buttonBgOpacity = 65;
    story.fields.buttonBorderColor = "#abcdef";
    story.fields.buttonBorderWidth = 3;
    missionVision.fields.iconColor = "#221144";
    missionVision.repeatable.items[0].iconName = "trophy";
    missionVision.repeatable.items[0].iconImage = "custom/mission-icon.svg";
    missionVision.repeatable.items[0].iconSvgOpacity = 0;
    familyChoice.fields.sectionBgColor = "#f4f8fb";

    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "about",
    });

    assert.ok(html, "Expected about preview HTML.");
    assert.match(html, /--dexta-academy-2-page-hero-section-bg-color/);
    assert.match(html, /--dexta-academy-2-about-stats-section-bg-image/);
    assert.match(html, /--dexta-academy-2-about-story-button-bg-color/);
    assert.match(html, /--dexta-academy-2-about-mission-vision-icon-color/);
    assert.match(html, /--dexta-academy-2-about-family-choice-section-bg/);
    assert.match(
      html,
      /https:\/\/fonts\.googleapis\.com\/css2\?family=Montserrat/,
    );
    assert.match(html, /custom\/about-stats-bg\.png/);
    assert.match(html, /custom\/mission-icon\.svg/);
    assert.match(html, /#abcdef/);
  });

  it("preserves safe rich text in homepage repeatable items", () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const programs = content.pages
      .find((page) => page.slug === "home")
      ?.sections.find((section) => section.id === "programs");

    assert.ok(programs?.repeatable?.items[0], "Expected program card item.");

    programs.repeatable.items[0].programBody =
      '<p><span style="color:#123456;font-size:18px;font-family:Poppins;font-style:italic">Styled programme copy</span><script>alert("bad")</script></p>';

    const sanitized = sanitizeSchoolTemplateProjectContent(
      content,
      sourceSnapshot,
    );
    const sanitizedProgram = sanitized.pages
      .find((page) => page.slug === "home")
      ?.sections.find((section) => section.id === "programs");
    const sanitizedBody =
      sanitizedProgram?.repeatable?.items[0].programBody?.toString() ?? "";

    assert.match(sanitizedBody, /Styled programme copy/);
    assert.match(sanitizedBody, /color:#123456/);
    assert.match(sanitizedBody, /font-style:italic/);
    assert.doesNotMatch(sanitizedBody, /script|alert/);
  });

  it("carries admission modal edits into the preview runtime", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const admissionModal = content.sharedSections.find(
      (section) => section.id === "admission-modal",
    );
    const admissionForm = content.pages
      .find((page) => page.slug === "admissions")
      ?.sections.find((section) => section.id === "admission-form");

    assert.ok(admissionModal, "Expected admission modal shared section.");
    assert.ok(admissionForm, "Expected admission form page section.");
    admissionModal.fields.eyebrow = "Apply Today";
    admissionModal.fields.title = "Legacy modal title";
    admissionForm.fields.title = "Join River Gate Academy";
    admissionModal.fields.formUrl =
      "https://docs.google.com/forms/d/e/example/viewform?embedded=true";
    admissionModal.fields.formTitle = "River Gate admission form";

    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "home",
    });

    assert.ok(html, "Expected home preview HTML.");
    assert.match(html, /"id":"admission-modal"/);
    assert.match(html, /Apply Today/);
    assert.match(html, /Join River Gate Academy/);
    assert.match(html, /getTemplateTwoAdmissionFormField\("title"\)/);
    assert.match(html, /River Gate admission form/);
    assert.match(html, /data-src/);
  });

  it("accepts full Google Forms iframe embed code for admission and contact forms", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const admissionsPage = content.pages.find(
      (page) => page.slug === "admissions",
    );
    const admissionForm = admissionsPage?.sections.find(
      (section) => section.id === "admission-form",
    );
    const contactPage = content.pages.find((page) => page.slug === "contact");
    const contactForm = contactPage?.sections.find(
      (section) => section.id === "contact-form",
    );

    assert.ok(admissionForm, "Expected admission form page section.");
    assert.ok(contactForm, "Expected contact form section.");

    admissionForm.fields.formIframe =
      '<iframe src="https://docs.google.com/forms/d/e/custom-admission/viewform?embedded=true" width="640" height="1602" frameborder="0" marginheight="0" marginwidth="0" onload="alert(1)">Loading...</iframe>';
    contactForm.fields.formIframe =
      '<iframe src="https://docs.google.com/forms/d/e/custom-contact/viewform?embedded=true" width="640" height="688" frameborder="0" marginheight="0" marginwidth="0">Loading...</iframe>';

    assert.deepEqual(
      validateSchoolTemplateProjectContentReferences(content, sourceSnapshot),
      [],
    );

    const sanitized = sanitizeSchoolTemplateProjectContent(
      content,
      sourceSnapshot,
    );
    const sanitizedAdmission = sanitized.pages
      .find((page) => page.slug === "admissions")
      ?.sections.find((section) => section.id === "admission-form");
    const sanitizedContact = sanitized.pages
      .find((page) => page.slug === "contact")
      ?.sections.find((section) => section.id === "contact-form");

    assert.match(
      String(sanitizedAdmission?.fields.formIframe),
      /custom-admission/,
    );
    assert.match(
      String(sanitizedAdmission?.fields.formIframe),
      /height="1602"/,
    );
    assert.doesNotMatch(
      String(sanitizedAdmission?.fields.formIframe),
      /onload/,
    );
    assert.match(String(sanitizedContact?.fields.formIframe), /custom-contact/);

    const html = await renderSchoolTemplatePreview({
      content: sanitized,
      sourceSnapshot,
      pageSlug: "contact",
    });

    assert.ok(html, "Expected contact preview HTML.");
    assert.match(html, /custom-admission/);
    assert.match(html, /custom-contact/);
    assert.match(html, /applyIframeEmbedAttribute/);
    assert.match(html, /applyTemplateTwoAdmissionForm/);
  });

  it("keeps template navigation inside the edited project preview", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );

    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "contact",
    });

    assert.ok(html, "Expected contact preview HTML.");
    assert.match(html, /rewritePreviewInternalLinks/);
    assert.match(html, /getPreviewNavigationTarget/);
    assert.match(html, /window\.location\.search/);
    assert.match(html, /encodeURIComponent\(target\.slug\)/);
  });

  it("carries Template 2 shared header logo and brand edits into preview runtime", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const header = content.sharedSections.find(
      (section) => section.id === "site-header",
    );

    assert.ok(header, "Expected header shared section.");
    assert.equal(header.fields.portalCtaText, "Portal");
    assert.equal(header.fields.portalCtaHref, "#");
    assert.equal(header.fields.primaryCtaText, "Apply Now");
    assert.equal(header.fields.primaryCtaHref, "admissions.html");
    content.theme.logoUrl = "";
    header.fields.logo = "custom/navbar-logo.png";
    header.fields.brandName = "River Gate Academy";
    header.fields.brandTagline = "Learn with purpose";
    header.fields.portalCtaText = "";
    header.fields.portalCtaHref = "";
    header.fields.primaryButtonBgColor = "#112233";
    header.fields.primaryButtonBorderWidth = 2;

    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "home",
    });

    assert.ok(html, "Expected home preview HTML.");
    assert.match(html, /custom\/navbar-logo\.png/);
    assert.match(html, /River Gate Academy/);
    assert.match(html, /Learn with purpose/);
    assert.match(html, /getSharedHeaderLogoUrl/);
    assert.match(html, /--dexta-academy-2-header-primary-button-bg-color/);
    assert.match(html, /applyTemplateTwoHeaderButtons/);
    assert.match(html, /primaryButtonBorderWidth/);
  });

  it("carries Template 2 footer link visibility into preview runtime", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const footer = content.sharedSections.find(
      (section) => section.id === "site-footer",
    );

    assert.ok(footer, "Expected footer shared section.");
    footer.fields.galleryLinkText = "";
    footer.fields.galleryLinkHref = "";
    footer.fields.description = "";

    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "home",
    });

    assert.ok(html, "Expected home preview HTML.");
    assert.match(html, /applyTemplateTwoFooterVisibility/);
    assert.match(html, /galleryLinkText/);
    assert.doesNotMatch(html, /footer__legal/);
  });

  it("carries the About family-choice images into preview runtime", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const aboutPage = content.pages.find((page) => page.slug === "about");
    const familyChoice = aboutPage?.sections.find(
      (section) => section.id === "family-choice",
    );
    const whoWeAreSnapshot = sourceSnapshot.pages
      .find((page) => page.slug === "about")
      ?.sections.find((section) => section.id === "who-we-are");

    assert.ok(familyChoice, "Expected family-choice section.");
    assert.equal(whoWeAreSnapshot?.selector, "main > section:nth-of-type(3)");

    familyChoice.fields.image = "custom/founder-family.png";
    familyChoice.fields.secondaryImage = "custom/family-quote-side.png";

    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "about",
    });

    assert.ok(html, "Expected about preview HTML.");
    assert.match(html, /custom\/founder-family\.png/);
    assert.match(html, /custom\/family-quote-side\.png/);
  });

  it("exposes requested page design controls separately", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const academicsPage = content.pages.find(
      (page) => page.slug === "academics",
    );
    const overview = academicsPage?.sections.find(
      (section) => section.id === "overview",
    );
    const subjects = academicsPage?.sections.find(
      (section) => section.id === "subjects",
    );
    const learningApproach = academicsPage?.sections.find(
      (section) => section.id === "learning-approach",
    );
    const overviewSnapshot = sourceSnapshot.pages
      .find((page) => page.slug === "academics")
      ?.sections.find((section) => section.id === "overview");
    const admissionsPage = content.pages.find(
      (page) => page.slug === "admissions",
    );
    const studentLifePage = content.pages.find(
      (page) => page.slug === "student-life",
    );
    const contactPage = content.pages.find((page) => page.slug === "contact");
    const admissionsProcess = admissionsPage?.sections.find(
      (section) => section.id === "process",
    );
    const admissionsSupport = admissionsPage?.sections.find(
      (section) => section.id === "admissions-support",
    );
    const admissionsCta = admissionsPage?.sections.find(
      (section) => section.id === "admissions-cta",
    );
    const studentHighlights = studentLifePage?.sections.find(
      (section) => section.id === "life-highlights",
    );
    const studentLeadership = studentLifePage?.sections.find(
      (section) => section.id === "leadership-character",
    );
    const portalEvents = studentLifePage?.sections.find(
      (section) => section.id === "portal-events",
    );
    const contactForm = contactPage?.sections.find(
      (section) => section.id === "contact-form",
    );
    const contactDetails = contactPage?.sections.find(
      (section) => section.id === "contact-details",
    );

    assert.ok(overview, "Expected overview section.");
    assert.ok(subjects, "Expected subjects section.");
    assert.ok(learningApproach, "Expected learning approach section.");
    assert.ok(admissionsProcess, "Expected admissions process section.");
    assert.ok(admissionsSupport, "Expected admissions support section.");
    assert.ok(admissionsCta, "Expected admissions CTA section.");
    assert.ok(studentHighlights, "Expected student highlights section.");
    assert.ok(studentLeadership, "Expected student leadership section.");
    assert.ok(portalEvents, "Expected portal events section.");
    assert.ok(contactForm, "Expected contact form section.");
    assert.ok(contactDetails, "Expected contact details section.");
    assert.equal(overviewSnapshot?.selector, "main > section:nth-of-type(2)");
    assert.ok(
      overviewSnapshot?.fields.some(
        (field) =>
          field.key === "sectionBgImage" &&
          field.cssVariable ===
            "--dexta-academy-2-academics-overview-section-bg-image",
      ),
      "Expected overview background image control.",
    );

    overview.fields.sectionBgColor = "#f7fbff";
    overview.fields.sectionBgImage = "custom/academics-overview-bg.png";
    overview.fields.iconColor = "#0f766e";
    overview.repeatable!.items[0].iconImage = "custom/overview-icon.svg";
    overview.repeatable!.items[0].iconSvgOpacity = 0;
    overview.repeatable!.items[0].overviewTitle =
      '<span style="color:#172554;font-family:Georgia">Balanced Curriculum</span>';

    subjects.fields.sectionBgColor = "#111827";
    subjects.fields.iconBgColor = "#38bdf8";
    subjects.fields.iconColor = "#082f49";
    subjects.repeatable!.items[0].subjectTitle =
      '<span style="font-style:italic">Secondary Education</span>';

    learningApproach.fields.sectionBgColor = "#f8fafc";
    learningApproach.fields.title =
      '<span style="color:#7c2d12">Challenging and supportive.</span>';
    learningApproach.fields.iconBorderColor = "#06b6d4";
    learningApproach.fields.iconBorderWidth = 2;

    admissionsProcess.fields.sectionBgColor = "#f0fdf4";
    admissionsProcess.fields.sectionBgImage =
      "custom/admissions-process-bg.png";
    admissionsProcess.fields.title =
      '<span style="color:#14532d">How to Apply</span>';
    admissionsSupport.fields.iconColor = "#db2777";
    admissionsSupport.fields.iconBgColor = "#fdf2f8";
    admissionsCta.fields.buttonBgColor = "#14b8a6";
    admissionsCta.fields.buttonTextColor = "#052e2b";
    admissionsCta.fields.buttonBorderWidth = 2;
    admissionsCta.fields.buttonBorderColor = "#0f766e";

    studentHighlights.fields.sectionBgColor = "#fefce8";
    studentHighlights.fields.iconColor = "#7c3aed";
    studentHighlights.fields.iconBgColor = "#ede9fe";
    studentHighlights.repeatable!.items[0].iconImage =
      "custom/student-life-icon.svg";
    studentLeadership.fields.iconColor = "#0f766e";
    studentLeadership.fields.iconBgColor = "#ccfbf1";
    portalEvents.fields.sectionBgColor = "#f8fafc";
    portalEvents.fields.iconColor = "#2563eb";
    portalEvents.fields.iconBgColor = "#dbeafe";
    portalEvents.repeatable!.items[0].cardTitle =
      '<span style="font-family:Georgia">Parent Portal</span>';

    contactForm.fields.sectionBgColor = "#ffffff";
    contactForm.fields.sectionBgImage = "custom/contact-form-bg.png";
    contactDetails.fields.iconBorderColor = "#0f766e";
    contactDetails.fields.iconBorderWidth = 2;
    contactDetails.fields.quote =
      '<span style="color:#475569">We welcome conversations.</span>';

    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "academics",
    });

    assert.ok(html, "Expected academics preview HTML.");
    assert.match(html, /--dexta-academy-2-academics-overview-section-bg-image/);
    assert.match(html, /--dexta-academy-2-academics-subjects-icon-bg-color/);
    assert.match(
      html,
      /--dexta-academy-2-academics-learning-icon-border-width/,
    );
    assert.match(html, /custom\/academics-overview-bg\.png/);
    assert.match(html, /#38bdf8/);
    assert.match(html, /Georgia/);
    assert.match(html, /italic/);
    assert.match(html, /#06b6d4/);

    const admissionsHtml = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "admissions",
    });
    const studentLifeHtml = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "student-life",
    });
    const contactHtml = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "contact",
    });

    assert.ok(admissionsHtml, "Expected admissions preview HTML.");
    assert.ok(studentLifeHtml, "Expected student-life preview HTML.");
    assert.ok(contactHtml, "Expected contact preview HTML.");
    assert.match(
      admissionsHtml,
      /--dexta-academy-2-admissions-cta-button-bg-color/,
    );
    assert.match(admissionsHtml, /custom\/admissions-process-bg\.png/);
    assert.match(admissionsHtml, /#db2777/);
    assert.equal(admissionsSupport.repeatable!.items[0].iconColor, undefined);
    assert.match(
      studentLifeHtml,
      /--dexta-academy-2-student-life-highlights-item-icon-image/,
    );
    assert.match(studentLifeHtml, /#7c3aed/);
    assert.match(studentLifeHtml, /#0f766e/);
    assert.match(studentLifeHtml, /#2563eb/);
    assert.equal(studentHighlights.repeatable!.items[0].iconColor, undefined);
    assert.match(studentLifeHtml, /Parent Portal/);
    assert.match(
      contactHtml,
      /--dexta-academy-2-contact-details-icon-border-width/,
    );
    assert.match(contactHtml, /custom\/contact-form-bg\.png/);
  });

  it("keeps cleared hero images and navbar edits during manifest sync", () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const rawContent = JSON.parse(JSON.stringify(content));
    const homePage = rawContent.pages.find(
      (page: { slug: string }) => page.slug === "home",
    );
    const aboutPage = rawContent.pages.find(
      (page: { slug: string }) => page.slug === "about",
    );
    const contactPage = rawContent.pages.find(
      (page: { slug: string }) => page.slug === "contact",
    );
    const hero = homePage.sections.find(
      (section: { id: string }) => section.id === "hero",
    );
    const aboutHero = aboutPage.sections.find(
      (section: { id: string }) => section.id === "page-hero",
    );
    const familyChoice = aboutPage.sections.find(
      (section: { id: string }) => section.id === "family-choice",
    );
    const siteHeader = rawContent.sharedSections.find(
      (section: { id: string }) => section.id === "site-header",
    );
    const siteFooter = rawContent.sharedSections.find(
      (section: { id: string }) => section.id === "site-footer",
    );
    const contactDetails = contactPage.sections.find(
      (section: { id: string }) => section.id === "contact-details",
    );

    hero.fields.desktopTreeImage = "";
    hero.fields.desktopBuildingImage = "custom/river-building.png";
    hero.fields.mobileHeroImage = "";
    hero.fields.studentsImage = "custom/river-students.png";
    aboutHero.fields.backgroundImage = "";
    aboutHero.fields.buildingImage = "custom/about-building.png";
    aboutHero.fields.mobileBackgroundImage = "custom/about-mobile-bg.png";
    familyChoice.fields.image = "";
    familyChoice.fields.secondaryImage = "custom/family-quote-side.png";
    delete contactDetails.fields.address;
    contactDetails.fields.location = "88 Admin Edited Road, Abuja";
    rawContent.theme.logoUrl = "";
    rawContent.theme.brandName = "";
    rawContent.theme.navBarColor = "#112233";
    rawContent.theme.navBarTransparent = false;
    siteHeader.fields.logo = "custom/navbar-logo.png";
    siteHeader.fields.brandName = "River Gate Academy";
    siteHeader.fields.brandTagline = "Learn with purpose";
    siteHeader.fields.portalCtaText = "";
    siteHeader.fields.portalCtaHref = "";
    siteHeader.fields.primaryCtaText = "";
    siteHeader.fields.primaryCtaHref = "";
    siteFooter.fields.address = "88 Admin Edited Road, Abuja";

    const parsed = parseSchoolTemplateProjectContent(rawContent);

    assert.ok(parsed.success, "Expected edited project content to parse.");

    const synced = syncSchoolTemplateProjectContentWithManifest({
      content: parsed.data,
      sourceSnapshot,
      rawContent,
    });
    const syncedHero = synced.contentJson.pages
      .find((page) => page.slug === "home")
      ?.sections.find((section) => section.id === "hero");
    const syncedAboutHero = synced.contentJson.pages
      .find((page) => page.slug === "about")
      ?.sections.find((section) => section.id === "page-hero");
    const syncedFamilyChoice = synced.contentJson.pages
      .find((page) => page.slug === "about")
      ?.sections.find((section) => section.id === "family-choice");
    const syncedContactDetails = synced.contentJson.pages
      .find((page) => page.slug === "contact")
      ?.sections.find((section) => section.id === "contact-details");

    assert.equal(syncedHero?.fields.desktopTreeImage, "");
    assert.equal(
      syncedHero?.fields.desktopBuildingImage,
      "custom/river-building.png",
    );
    assert.equal(syncedHero?.fields.mobileHeroImage, "");
    assert.equal(syncedHero?.fields.studentsImage, "custom/river-students.png");
    assert.equal(syncedAboutHero?.fields.backgroundImage, "");
    assert.equal(
      syncedAboutHero?.fields.buildingImage,
      "custom/about-building.png",
    );
    assert.equal(
      syncedAboutHero?.fields.mobileBackgroundImage,
      "custom/about-mobile-bg.png",
    );
    assert.equal(syncedFamilyChoice?.fields.image, "");
    assert.equal(
      syncedFamilyChoice?.fields.secondaryImage,
      "custom/family-quote-side.png",
    );
    const syncedSiteHeader = synced.contentJson.sharedSections.find(
      (section) => section.id === "site-header",
    );
    assert.equal(syncedSiteHeader?.fields.logo, "custom/navbar-logo.png");
    assert.equal(syncedSiteHeader?.fields.brandName, "River Gate Academy");
    assert.equal(syncedSiteHeader?.fields.brandTagline, "Learn with purpose");
    assert.equal(syncedSiteHeader?.fields.portalCtaText, "Portal");
    assert.equal(syncedSiteHeader?.fields.portalCtaHref, "#");
    assert.equal(syncedSiteHeader?.fields.primaryCtaText, "Apply Now");
    assert.equal(syncedSiteHeader?.fields.primaryCtaHref, "admissions.html");
    const syncedSiteFooter = synced.contentJson.sharedSections.find(
      (section) => section.id === "site-footer",
    );
    assert.equal(
      syncedSiteFooter?.fields.address,
      "88 Admin Edited Road, Abuja",
    );
    assert.equal(
      syncedContactDetails?.fields.address,
      "88 Admin Edited Road, Abuja",
    );
    assert.equal(synced.contentJson.theme.logoUrl, "");
    assert.equal(synced.contentJson.theme.brandName, "");
    assert.equal(synced.contentJson.theme.navBarColor, "#112233");
    assert.equal(synced.contentJson.theme.navBarTransparent, false);
  });
});
