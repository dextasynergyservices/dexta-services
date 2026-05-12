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
        "privacyText",
        "privacyHref",
        "termsText",
        "termsHref",
      ],
    );
    assert.equal(footer.fields.brandName, "DXT ACADEMY");
    assert.equal(footer.fields.brandTagline, "Nurturing. Inspiring. Leading.");
    assert.equal(footer.fields.address, "12 Excellence Drive, Lagos, Nigeria");
    assert.equal(footer.fields.phone, "+234 801 234 5678");
    assert.equal(footer.fields.phoneHref, "tel:+2348012345678");
    assert.equal(footer.fields.email, "info@dxtacademy.edu.ng");
    assert.equal(footer.fields.emailHref, "mailto:info@dxtacademy.edu.ng");
    assert.equal(footer.fields.privacyHref, "privacy.html");
    assert.equal(footer.fields.termsHref, "terms.html");
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
      contactDetails?.fields.location,
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
      "Admissions & Communications Office",
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

  it("carries admission modal edits into the preview runtime", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const admissionModal = content.sharedSections.find(
      (section) => section.id === "admission-modal",
    );

    assert.ok(admissionModal, "Expected admission modal shared section.");
    admissionModal.fields.eyebrow = "Apply Today";
    admissionModal.fields.title = "Join River Gate Academy";
    admissionModal.fields.formUrl =
      "https://docs.google.com/forms/d/e/example/viewform?embedded=true";
    admissionModal.fields.formTitle = "River Gate admission form";

    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "admissions",
    });

    assert.ok(html, "Expected admissions preview HTML.");
    assert.match(html, /"id":"admission-modal"/);
    assert.match(html, /Apply Today/);
    assert.match(html, /Join River Gate Academy/);
    assert.match(html, /River Gate admission form/);
    assert.match(html, /data-src/);
  });

  it("accepts full Google Forms iframe embed code for admission and contact forms", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy2Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy2Manifest,
    );
    const admissionModal = content.sharedSections.find(
      (section) => section.id === "admission-modal",
    );
    const contactPage = content.pages.find((page) => page.slug === "contact");
    const contactForm = contactPage?.sections.find(
      (section) => section.id === "contact-form",
    );

    assert.ok(admissionModal, "Expected admission modal shared section.");
    assert.ok(contactForm, "Expected contact form section.");

    admissionModal.fields.formIframe =
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
    const sanitizedAdmission = sanitized.sharedSections.find(
      (section) => section.id === "admission-modal",
    );
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
    content.theme.logoUrl = "";
    header.fields.logo = "custom/navbar-logo.png";
    header.fields.brandName = "River Gate Academy";
    header.fields.brandTagline = "Learn with purpose";

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
    assert.equal(whoWeAreSnapshot?.selector, ".section--dark .feature-split");

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

  it("exposes Academics page section and item style controls", async () => {
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

    assert.ok(overview, "Expected overview section.");
    assert.ok(subjects, "Expected subjects section.");
    assert.ok(learningApproach, "Expected learning approach section.");
    assert.equal(overviewSnapshot?.selector, "main > section:nth-of-type(2)");
    assert.ok(
      overviewSnapshot?.fields.some(
        (field) =>
          field.key === "borderWidth" &&
          field.cssVariable ===
            "--dexta-academy-2-academics-overview-border-width",
      ),
      "Expected overview border width control.",
    );

    overview.fields.sectionBgColor = "#f7fbff";
    overview.repeatable!.items[0].cardBgColor = "#fff7dd";
    overview.repeatable!.items[0].iconColor = "#0f766e";
    overview.repeatable!.items[0].titleColor = "#172554";
    overview.repeatable!.items[0].descriptionColor = "#475569";
    overview.repeatable!.items[0].titleFont = "Georgia";
    overview.repeatable!.items[0].borderColor = "#0f766e";
    overview.repeatable!.items[0].borderWidth = 0;

    subjects.fields.sectionBgColor = "#111827";
    subjects.repeatable!.items[0].cardBgColor = "#fefce8";
    subjects.repeatable!.items[0].iconBgColor = "#38bdf8";
    subjects.repeatable!.items[0].iconColor = "#082f49";
    subjects.repeatable!.items[0].titleFontStyle = "italic";
    subjects.repeatable!.items[0].borderWidth = 0;

    learningApproach.fields.sectionBgColor = "#f8fafc";
    learningApproach.fields.titleColor = "#7c2d12";
    learningApproach.fields.descriptionFontStyle = "italic";
    learningApproach.repeatable!.items[0].stepBgColor = "#ecfeff";
    learningApproach.repeatable!.items[0].stepNumberColor = "#155e75";
    learningApproach.repeatable!.items[0].stepBorderColor = "#06b6d4";
    learningApproach.repeatable!.items[0].stepBorderWidth = 2;

    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot,
      pageSlug: "academics",
    });

    assert.ok(html, "Expected academics preview HTML.");
    assert.match(html, /--dexta-academy-2-academics-overview-card-bg/);
    assert.match(html, /--dexta-academy-2-academics-subjects-icon-bg/);
    assert.match(
      html,
      /--dexta-academy-2-academics-learning-step-border-width/,
    );
    assert.match(html, /#fff7dd/);
    assert.match(html, /#38bdf8/);
    assert.match(html, /Georgia/);
    assert.match(html, /italic/);
    assert.match(html, /#06b6d4/);
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

    hero.fields.desktopTreeImage = "";
    hero.fields.desktopBuildingImage = "custom/river-building.png";
    hero.fields.mobileHeroImage = "";
    hero.fields.studentsImage = "custom/river-students.png";
    aboutHero.fields.backgroundImage = "";
    aboutHero.fields.buildingImage = "custom/about-building.png";
    aboutHero.fields.mobileBackgroundImage = "custom/about-mobile-bg.png";
    familyChoice.fields.image = "";
    familyChoice.fields.secondaryImage = "custom/family-quote-side.png";
    rawContent.theme.logoUrl = "";
    rawContent.theme.brandName = "";
    rawContent.theme.navBarColor = "#112233";
    rawContent.theme.navBarTransparent = false;
    siteHeader.fields.logo = "custom/navbar-logo.png";
    siteHeader.fields.brandName = "River Gate Academy";
    siteHeader.fields.brandTagline = "Learn with purpose";

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
    assert.equal(synced.contentJson.theme.logoUrl, "");
    assert.equal(synced.contentJson.theme.brandName, "");
    assert.equal(synced.contentJson.theme.navBarColor, "#112233");
    assert.equal(synced.contentJson.theme.navBarTransparent, false);
  });
});
