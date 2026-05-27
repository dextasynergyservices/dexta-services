import { Buffer } from "node:buffer";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { inflateRawSync } from "node:zlib";
import {
  getCloudinaryRawModelProxyUrl,
  getCloudinaryRawModelUrlFromProxy,
  resolveSchoolTemplateAsset,
} from "@/lib/school-template-assets";
import { buildSchoolWebsiteProjectExportZip } from "@/lib/school-template-exporter";
import { dextaAcademy4Manifest } from "@/lib/school-template-manifests/dexta-academy-4";
import {
  buildSchoolTemplateProjectContent,
  buildSchoolTemplateSourceSnapshot,
  type SchoolTemplateProjectContent,
  type SchoolTemplateSourceSnapshot,
} from "@/lib/school-template-project-content";
import { renderSchoolTemplatePreview } from "@/lib/school-template-preview-renderer";

const CLOUD_NAME = "dexta-test";
const HERO_3D_SCRIPT_PATTERN =
  /<script\b(?=[^>]*\btype=["']module["'])(?=[^>]*\bsrc=["']js\/hero-3d\.js["'])[^>]*>\s*<\/script>/i;

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

function modelField() {
  return { type: "model3d" };
}

function buildDextaAcademy4PreviewInput(modelUrl: string): {
  content: SchoolTemplateProjectContent;
  sourceSnapshot: SchoolTemplateSourceSnapshot;
} {
  const content = buildSchoolTemplateProjectContent(dextaAcademy4Manifest);
  const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
    dextaAcademy4Manifest,
  );
  const homePage = content.pages.find((page) => page.slug === "home");
  const modelSection = homePage?.sections.find(
    (section) => section.id === "hero-3d-model",
  );

  assert.ok(homePage, "Dexta Academy 4 should include a home page.");
  assert.ok(
    modelSection,
    "Dexta Academy 4 should include the hero 3D model section.",
  );

  modelSection.fields.modelUrl = modelUrl;

  return { content, sourceSnapshot };
}

function getHero3dConfig(html: string) {
  const match = html.match(/window\.schoolHero3dConfig = ([^<]+);<\/script>/);
  assert.ok(match, "Preview HTML should include schoolHero3dConfig.");
  return JSON.parse(match[1]) as {
    model?: {
      url?: string;
    };
    materials?: Record<string, unknown>;
    transform?: {
      scale?: number;
      mobile?: {
        scale?: number;
      };
      offset?: {
        x?: number;
        y?: number;
      };
      rotation?: {
        x?: number;
        y?: number;
        z?: number;
      };
      spinRotation?: {
        x?: number;
        y?: number;
      };
    };
    visibility?: {
      mode?: string;
    };
    responsive?: {
      mobile?: {
        layer?: string;
      };
    };
  };
}

function assertRenderedHtml(value: string | null): string {
  assert.ok(value !== null, "Preview should render HTML.");
  return value;
}

describe("school template 3D asset normalization", () => {
  it("keeps local template model assets relative", () => {
    assert.equal(
      resolveSchoolTemplateAsset("assets/3d/gr.glb", modelField(), {
        cloudName: CLOUD_NAME,
        proxyCloudinaryRawModels: true,
      }),
      "assets/3d/gr.glb",
    );
  });

  it("converts model3d public IDs to Cloudinary raw URLs", () => {
    assert.equal(
      resolveSchoolTemplateAsset("school-models/cap.glb", modelField(), {
        cloudName: CLOUD_NAME,
      }),
      `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/school-models/cap.glb`,
    );
  });

  it("converts public IDs and raw URLs to preview proxy URLs", () => {
    const rawUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/v1777138472/school-models/cap.glb`;
    const proxyUrl = getCloudinaryRawModelProxyUrl(rawUrl);

    assert.equal(
      resolveSchoolTemplateAsset(rawUrl, modelField(), {
        cloudName: CLOUD_NAME,
        proxyCloudinaryRawModels: true,
      }),
      proxyUrl,
    );
    assert.equal(
      resolveSchoolTemplateAsset("school-models/cap.glb", modelField(), {
        cloudName: CLOUD_NAME,
        proxyCloudinaryRawModels: true,
      }),
      getCloudinaryRawModelProxyUrl(
        `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/school-models/cap.glb`,
      ),
    );
    assert.equal(getCloudinaryRawModelUrlFromProxy(proxyUrl), rawUrl);
  });

  it("supports future Cloudinary raw .gltf model URLs", () => {
    const rawUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/school-models/scene.gltf`;

    assert.equal(
      resolveSchoolTemplateAsset(rawUrl, modelField(), {
        cloudName: CLOUD_NAME,
        proxyCloudinaryRawModels: true,
      }),
      getCloudinaryRawModelProxyUrl(rawUrl),
    );
  });
});

describe("Dexta Academy 4 preview 3D rendering", () => {
  it("server-renders schoolHero3dConfig with the resolved model URL", async () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = CLOUD_NAME;
    const publicId = "school-models/cap.glb";
    const { content, sourceSnapshot } =
      buildDextaAcademy4PreviewInput(publicId);
    const html = assertRenderedHtml(
      await renderSchoolTemplatePreview({
        content,
        sourceSnapshot,
        pageSlug: "home",
      }),
    );
    const config = getHero3dConfig(html);

    assert.equal(
      config.model?.url,
      `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/${publicId}`,
    );
  });

  it("reinjects the external hero module after the server-rendered config", async () => {
    const sourceHtml = readFileSync(
      path.resolve(
        process.cwd(),
        dextaAcademy4Manifest.sourceDir,
        dextaAcademy4Manifest.entryFile,
      ),
      "utf8",
    );
    const sourceModule = readFileSync(
      path.resolve(
        process.cwd(),
        dextaAcademy4Manifest.sourceDir,
        "js",
        "hero-3d.js",
      ),
      "utf8",
    );
    const sourceCss = readFileSync(
      path.resolve(
        process.cwd(),
        dextaAcademy4Manifest.sourceDir,
        "css",
        "hero-3d.css",
      ),
      "utf8",
    );
    const sourceBaseCss = readFileSync(
      path.resolve(
        process.cwd(),
        dextaAcademy4Manifest.sourceDir,
        "css",
        "style.css",
      ),
      "utf8",
    );
    assert.match(sourceHtml, HERO_3D_SCRIPT_PATTERN);
    assert.match(sourceModule, /window\.schoolHero3dConfig/);
    assert.match(
      sourceCss,
      /@media \(max-width: 991\.98px\)[\s\S]*\.hero-nav-links \{\s*flex-direction: column;/,
    );
    assert.match(
      sourceCss,
      /@media \(max-width: 991\.98px\)[\s\S]*\.hero-navbar \.navbar-collapse \{\s*position: absolute;/,
    );
    assert.match(sourceCss, /\.hero-navbar \.navbar-collapse\.show \{/);
    assert.match(
      sourceCss,
      /\.school-homepage \.school-hero \.hero-eyebrow span \{[\s\S]*flex: 0 0 38px;/,
    );
    assert.match(sourceCss, /--dexta-academy-4-home-hero-eyebrow-dash-color/);
    assert.match(
      sourceBaseCss,
      /--dexta-academy-4-home-about-preview-eyebrow-text-color/,
    );
    assert.match(
      sourceBaseCss,
      /--dexta-academy-4-home-programs-eyebrow-text-color/,
    );
    assert.match(
      sourceBaseCss,
      /--dexta-academy-4-home-gallery-preview-eyebrow-text-color/,
    );
    assert.match(sourceCss, /\.hero-menu-toggle \.oi \{\s*display: none;/);
    assert.match(sourceCss, /\.hero-menu-toggle::before/);
    assert.match(
      sourceCss,
      /\.hero-menu-toggle\[aria-expanded="true"\]::after/,
    );
    assert.match(
      sourceModule,
      /resolveModelUrl\(HERO_3D_CONFIG\.model\?\.url\)/,
    );
    assert.doesNotMatch(
      sourceModule,
      /headlineLines\.length\s*<\s*2/,
      "Preview 3D should still load when rich text editing removes headline spans.",
    );
    assert.doesNotMatch(
      sourceModule,
      /mat\.color\.copy|CAP_BODY_COLOR|TASSEL_CORD_COLOR|MATERIAL_CONFIG/,
      "Template 4 should preserve the GLB model's original material colors.",
    );
    assert.match(
      sourceModule,
      /return \{ x: pitchWobble, y: fullSpin \+ yawWobble, z: rollWobble \};/,
    );
    assert.match(sourceModule, /neutralModelBounds = centerAndScaleModel/);
    assert.match(sourceModule, /positionCameraToFit\(neutralModelBounds\)/);
    assert.match(sourceModule, /MODEL_VISIBLE_SCALE_LIMIT/);
    assert.match(sourceModule, /MODEL_FRAME_PADDING/);
    assert.match(sourceModule, /fitWidthDist/);
    assert.match(sourceModule, /modelPivot\.position\.set/);
    assert.match(
      sourceModule,
      /frameSize\.x \+= Math\.abs\(modelOffset\.x\) \* 2/,
    );
    assert.doesNotMatch(
      sourceModule,
      /obj\.position\.x \+= sz2\.x \* MODEL_OFFSET_X/,
    );
    assert.match(sourceModule, /TRANSFORM_CONFIG\.spinRotation\?\.x/);
    assert.match(sourceModule, /TRANSFORM_CONFIG\.spinRotation\?\.y/);
    assert.match(sourceModule, /MOBILE_TRANSFORM_CONFIG\.scale/);
    assert.doesNotMatch(sourceModule, /MOBILE_TRANSFORM_CONFIG\.rotation\?\.z/);
    assert.match(sourceModule, /VISIBILITY_CONFIG\.mode/);
    assert.match(sourceModule, /MOBILE_RESPONSIVE_CONFIG\.layer/);
    assert.match(sourceModule, /hero-3d-hidden/);
    assert.match(sourceModule, /hero-mobile-text-front/);
    assert.match(sourceModule, /MODEL_ROTATION_Y/);
    assert.match(sourceModule, /spinAxisQuaternion/);
    assert.match(sourceModule, /inverseSpinAxisQuaternion/);
    assert.match(
      sourceModule,
      /modelAnchor\.rotation\.y = MODEL_ROTATION_Y \+ currentScrollRotationY/,
    );
    assert.match(
      sourceModule,
      /spinMotion\.rotation\.set\(intro\.x, intro\.y, intro\.z\)/,
    );
    assert.doesNotMatch(sourceModule, /targetFaceRotationY/);
    assert.doesNotMatch(sourceModule, /finalModelRotationActive/);
    assert.match(
      sourceModule,
      /camera\.position\.set\(dist \* 0\.1, dist \* 0\.48, dist \* 0\.75\)/,
    );
    assert.doesNotMatch(
      sourceModule,
      /modelStage|intro\.spin/,
      "Template 4 preview should keep the original pivot-based spin mechanics.",
    );

    const { content, sourceSnapshot } =
      buildDextaAcademy4PreviewInput("assets/3d/gr.glb");
    const html = assertRenderedHtml(
      await renderSchoolTemplatePreview({
        content,
        sourceSnapshot,
        pageSlug: "home",
      }),
    );

    assert.match(
      html,
      /<script type="module" src="js\/hero-3d\.js\?dextaPreview=3d-config-v17" data-dexta-preview-hero-3d="external"><\/script>/,
    );
    assert.equal(html.match(/src="js\/hero-3d\.js/g)?.length, 1);
    assert.ok(
      html.indexOf("window.schoolHero3dConfig = ") <
        html.indexOf('data-dexta-preview-hero-3d="external"'),
      "Server-rendered 3D config should appear before the external module.",
    );
  });

  it("keeps Template 4 preview hero markup compatible with the original animation", async () => {
    const { content, sourceSnapshot } =
      buildDextaAcademy4PreviewInput("assets/3d/gr.glb");
    const homePage = content.pages.find((page) => page.slug === "home");
    const heroSection = homePage?.sections.find(
      (section) => section.id === "hero",
    );
    const footerSection = content.sharedSections.find(
      (section) => section.id === "footer",
    );
    const aboutSection = homePage?.sections.find(
      (section) => section.id === "about-preview",
    );
    const programsSection = homePage?.sections.find(
      (section) => section.id === "programs",
    );
    const gallerySection = homePage?.sections.find(
      (section) => section.id === "gallery-preview",
    );
    assert.ok(heroSection);
    assert.ok(footerSection);
    assert.ok(aboutSection);
    assert.ok(programsSection);
    assert.ok(gallerySection);
    heroSection.fields.eyebrow =
      '<em><span style="font-family: Inter, sans-serif; color: #33ddff; font-size: 18px;">Welcome to School B</span></em>';
    heroSection.fields.eyebrowDashColor = "#ff44aa";
    heroSection.fields.headline =
      '<p style="font-family: \'Playfair Display\', Georgia, serif; font-size: 88px;"><strong><span style="color: #ffcc00;">Nurturing</span> <em><span style="color: #66ff99;">Excellence</span></em></strong></p>';
    aboutSection.fields.eyebrowTextColor = "#cc3366";
    aboutSection.fields.title =
      '<span style="color: #f97316;">Inspiring</span> <span style="color: #2563eb;">curious minds</span>';
    aboutSection.fields.body =
      '<span style="font-family: Inter, sans-serif; color: #0f766e;">About body text</span>';
    if (aboutSection.repeatable?.items[0]) {
      aboutSection.repeatable.items[0].statValue =
        '<span style="color: #dc2626;">98%</span>';
      aboutSection.repeatable.items[0].statLabel =
        '<span style="color: #7c3aed;">Exam Pass Rate</span>';
    }
    programsSection.fields.eyebrowTextColor = "#1188ff";
    programsSection.fields.title =
      '<span style="color: #0891b2;">Programs</span> <span style="color: #9333ea;">That Grow</span>';
    if (programsSection.repeatable?.items[0]) {
      programsSection.repeatable.items[0].programTitle =
        '<span style="color: #16a34a;">Early Years</span>';
    }
    gallerySection.fields.eyebrowTextColor = "#11aa77";
    gallerySection.fields.title =
      '<span style="color: #be123c;">Gallery</span> <span style="color: #1d4ed8;">Moments</span>';
    if (gallerySection.repeatable?.items[0]) {
      gallerySection.repeatable.items[0].caption =
        '<span style="color: #ca8a04;">Creative learning</span>';
    }
    footerSection.fields.description =
      "<span style=\"font-family: 'Playfair Display', Georgia, serif;\">A warm school community.</span>";
    const html = assertRenderedHtml(
      await renderSchoolTemplatePreview({
        content,
        sourceSnapshot,
        pageSlug: "home",
      }),
    );

    assert.match(html, /function applyAcademyFourHeroDisplay/);
    assert.match(html, /function applyAcademyFourHeroEyebrow/);
    assert.match(html, /function applyAcademyFourHeroTextStyles/);
    assert.match(html, /function getAcademyFourHeroLineTextStyles/);
    assert.match(html, /Playfair\+Display/);
    assert.match(html, /Inter/);
    assert.match(html, /--dexta-academy-4-home-hero-eyebrow-dash-color/);
    assert.match(html, /#ff44aa/);
    assert.match(
      html,
      /--dexta-academy-4-home-about-preview-eyebrow-text-color/,
    );
    assert.match(html, /#cc3366/);
    assert.match(html, /--dexta-academy-4-home-programs-eyebrow-text-color/);
    assert.match(html, /#1188ff/);
    assert.match(
      html,
      /--dexta-academy-4-home-gallery-preview-eyebrow-text-color/,
    );
    assert.match(html, /#11aa77/);
    assert.match(html, /fontFamily\)/);
    assert.match(
      html,
      /target\.style\.setProperty\(item\.property, item\.value, "important"\)/,
    );
    assert.match(html, /container\.querySelector\("strong,b"\)/);
    assert.match(html, /container\.querySelector\("em,i"\)/);
    assert.match(html, /node\.querySelector\("strong,b,em,i,u,s,strike,del"\)/);
    assert.match(html, /"font-size"/);
    assert.match(html, /"color"/);
    assert.match(
      html,
      /field\.key === "headline" && applyAcademyFourHeroDisplay/,
    );
    assert.match(
      html,
      /field\.key === "eyebrow" && applyAcademyFourHeroEyebrow/,
    );
    assert.match(html, /applyAcademyFourHeroTextStyles\(node, value\)/);
    assert.match(html, /applyAcademyFourHeroLineTextStyles\(node, value/);
    assert.match(html, /getBestStyledNode\(property, line\)/);
    assert.match(html, /node\.querySelectorAll\(":scope > span"\)\.length/);
  });

  it("exposes admin size and rotation controls to the 3D runtime", async () => {
    const { content, sourceSnapshot } =
      buildDextaAcademy4PreviewInput("assets/3d/gr.glb");
    const homePage = content.pages.find((page) => page.slug === "home");
    const modelSection = homePage?.sections.find(
      (section) => section.id === "hero-3d-model",
    );
    assert.ok(modelSection);

    modelSection.fields.modelScale = 8.2;
    modelSection.fields.mobileModelScale = 5.6;
    modelSection.fields.modelOffsetX = -0.44;
    modelSection.fields.modelOffsetY = 0.22;
    modelSection.fields.rotationX = -0.52;
    modelSection.fields.rotationY = 1.14;
    modelSection.fields.rotationZ = 0.33;
    modelSection.fields.spinRotationX = -0.16;
    modelSection.fields.spinRotationY = -0.48;
    modelSection.fields.modelVisibility = "hide";
    modelSection.fields.mobileLayerOrder = "textFront";

    const html = assertRenderedHtml(
      await renderSchoolTemplatePreview({
        content,
        sourceSnapshot,
        pageSlug: "home",
      }),
    );
    const config = getHero3dConfig(html);

    assert.equal(config.transform?.scale, 8.2);
    assert.equal(config.transform?.mobile?.scale, 5.6);
    assert.equal(config.transform?.offset?.x, -0.44);
    assert.equal(config.transform?.offset?.y, 0.22);
    assert.equal(config.transform?.rotation?.x, -0.52);
    assert.equal(config.transform?.rotation?.y, 1.14);
    assert.equal(config.transform?.rotation?.z, 0.33);
    assert.equal(config.transform?.spinRotation?.x, -0.16);
    assert.equal(config.transform?.spinRotation?.y, -0.48);
    assert.equal(config.visibility?.mode, "hide");
    assert.equal(config.responsive?.mobile?.layer, "textFront");
    assert.equal(config.materials, undefined);
    assert.match(html, /function isResponsiveScopeActive/);
    assert.match(html, /if \(!isResponsiveScopeActive\(field\)\) return;/);
  });
});

describe("Dexta Academy 4 export 3D rendering", () => {
  it("keeps the uploaded model in the exported page and patches the hero module", async () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = CLOUD_NAME;
    const rawModelUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/school-models/cap.glb`;
    const { content, sourceSnapshot } =
      buildDextaAcademy4PreviewInput(rawModelUrl);
    const homePage = content.pages.find((page) => page.slug === "home");
    const heroSection = homePage?.sections.find(
      (section) => section.id === "hero",
    );
    const footerSection = content.sharedSections.find(
      (section) => section.id === "footer",
    );
    const aboutSection = homePage?.sections.find(
      (section) => section.id === "about-preview",
    );
    const programsSection = homePage?.sections.find(
      (section) => section.id === "programs",
    );
    const gallerySection = homePage?.sections.find(
      (section) => section.id === "gallery-preview",
    );
    assert.ok(heroSection);
    assert.ok(footerSection);
    assert.ok(aboutSection);
    assert.ok(programsSection);
    assert.ok(gallerySection);
    heroSection.fields.eyebrow =
      '<em><span style="font-family: Inter, sans-serif; color: #33ddff; font-size: 18px;">Welcome to School B</span></em>';
    heroSection.fields.eyebrowDashColor = "#ff44aa";
    heroSection.fields.headline =
      '<p style="font-family: \'Playfair Display\', Georgia, serif; font-size: 88px;"><strong><span style="color: #ffcc00;">Nurturing</span> <em><span style="color: #66ff99;">Excellence</span></em></strong></p>';
    aboutSection.fields.eyebrowTextColor = "#cc3366";
    aboutSection.fields.title =
      '<span style="color: #f97316;">Inspiring</span> <span style="color: #2563eb;">curious minds</span>';
    aboutSection.fields.body =
      '<span style="font-family: Inter, sans-serif; color: #0f766e;">About body text</span>';
    if (aboutSection.repeatable?.items[0]) {
      aboutSection.repeatable.items[0].statValue =
        '<span style="color: #dc2626;">98%</span>';
      aboutSection.repeatable.items[0].statLabel =
        '<span style="color: #7c3aed;">Exam Pass Rate</span>';
    }
    programsSection.fields.eyebrowTextColor = "#1188ff";
    programsSection.fields.title =
      '<span style="color: #0891b2;">Programs</span> <span style="color: #9333ea;">That Grow</span>';
    if (programsSection.repeatable?.items[0]) {
      programsSection.repeatable.items[0].programTitle =
        '<span style="color: #16a34a;">Early Years</span>';
    }
    gallerySection.fields.eyebrowTextColor = "#11aa77";
    gallerySection.fields.title =
      '<span style="color: #be123c;">Gallery</span> <span style="color: #1d4ed8;">Moments</span>';
    if (gallerySection.repeatable?.items[0]) {
      gallerySection.repeatable.items[0].caption =
        '<span style="color: #ca8a04;">Creative learning</span>';
    }
    footerSection.fields.description =
      "<span style=\"font-family: 'Playfair Display', Georgia, serif;\">A warm school community.</span>";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new globalThis.Response(null, {
        status: 200,
        headers: {
          "content-length": String(3_000_000),
          "content-type": "model/gltf-binary",
        },
      });

    try {
      const { buffer } = await buildSchoolWebsiteProjectExportZip({
        content,
        sourceSnapshot,
      });
      const entries = readZipEntries(buffer);
      const indexHtml = entries.get("index.html")?.toString("utf8") ?? "";
      const heroScript = entries.get("js/hero-3d.js")?.toString("utf8") ?? "";

      assert.match(indexHtml, /window\.schoolHero3dConfig = /);
      assert.ok(indexHtml.includes(rawModelUrl));
      assert.match(indexHtml, /Playfair\+Display/);
      assert.match(
        indexHtml,
        /font-family: 'Playfair Display', Georgia, serif !important;/,
      );
      assert.match(
        indexHtml,
        /<h1\b[^>]*class="hero-display"[^>]*style="[^"]*Playfair Display[^"]*"[^>]*>/,
      );
      assert.match(indexHtml, /style="[^"]*color: #ffcc00 !important/);
      assert.match(indexHtml, /style="[^"]*color: #66ff99 !important/);
      assert.match(indexHtml, /style="[^"]*font-size: 88px !important/);
      assert.match(indexHtml, /style="[^"]*font-weight: 700 !important/);
      assert.match(indexHtml, /style="[^"]*font-style: italic !important/);
      assert.match(
        indexHtml,
        /<span style="(?=[^"]*Playfair Display)(?=[^"]*color: #ffcc00 !important)[^"]*">Nurturing<\/span>\s*<span style="(?=[^"]*Playfair Display)(?=[^"]*color: #66ff99 !important)[^"]*">Excellence<\/span>/,
      );
      assert.match(
        indexHtml,
        /--dexta-academy-4-home-hero-eyebrow-dash-color:\s*#ff44aa/,
      );
      assert.match(
        indexHtml,
        /--dexta-academy-4-home-about-preview-eyebrow-text-color:\s*#cc3366/,
      );
      assert.match(
        indexHtml,
        /--dexta-academy-4-home-programs-eyebrow-text-color:\s*#1188ff/,
      );
      assert.match(
        indexHtml,
        /--dexta-academy-4-home-gallery-preview-eyebrow-text-color:\s*#11aa77/,
      );
      assert.match(
        indexHtml,
        /<h2>\s*<span style="color: #f97316 !important;">Inspiring<\/span>\s*(?:<br><br>|\s)\s*<span style="color: #2563eb !important;">curious minds<\/span>\s*<\/h2>/,
      );
      assert.match(
        indexHtml,
        /<p><span style="font-family: Inter, sans-serif !important; color: #0f766e !important;">About body text<\/span><\/p>/,
      );
      assert.match(
        indexHtml,
        /<strong><span style="color: #dc2626 !important;">98%<\/span><\/strong>/,
      );
      assert.match(
        indexHtml,
        /<span><span style="color: #7c3aed !important;">Exam Pass Rate<\/span><\/span>/,
      );
      assert.match(
        indexHtml,
        /<h2>\s*<span style="color: #0891b2 !important;">Programs<\/span>\s*(?:<br><br>|\s)\s*<span style="color: #9333ea !important;">That Grow<\/span>\s*<\/h2>/,
      );
      assert.match(
        indexHtml,
        /<h3><span style="color: #16a34a !important;">Early Years<\/span><\/h3>/,
      );
      assert.match(
        indexHtml,
        /<h2>\s*<span style="color: #be123c !important;">Gallery<\/span>\s*(?:<br><br>|\s)\s*<span style="color: #1d4ed8 !important;">Moments<\/span>\s*<\/h2>/,
      );
      assert.match(
        indexHtml,
        /<strong><span style="color: #ca8a04 !important;">Creative learning<\/span><\/strong>/,
      );
      assert.match(
        indexHtml,
        /<p class="hero-eyebrow"[^>]*>\s*<span aria-hidden="true"><\/span>Welcome to School B<span aria-hidden="true"><\/span>\s*<\/p>/,
      );
      assert.match(
        indexHtml,
        /<p class="hero-eyebrow" style="(?=[^"]*font-family: Inter, sans-serif !important)(?=[^"]*font-size: 18px !important)(?=[^"]*font-style: italic !important)(?=[^"]*color: #33ddff !important)/,
      );
      assert.doesNotMatch(indexHtml, /\/api\/cloudinary\/raw/);
      assert.match(
        heroScript,
        /resolveModelUrl\(HERO_3D_CONFIG\.model\?\.url\)/,
      );
      assert.doesNotMatch(
        heroScript,
        /mat\.color\.copy|CAP_BODY_COLOR|TASSEL_CORD_COLOR|MATERIAL_CONFIG/,
      );
      assert.match(
        heroScript,
        /return \{ x: pitchWobble, y: fullSpin \+ yawWobble, z: rollWobble \};/,
      );
      assert.match(heroScript, /neutralModelBounds = centerAndScaleModel/);
      assert.match(heroScript, /positionCameraToFit\(neutralModelBounds\)/);
      assert.match(heroScript, /MODEL_VISIBLE_SCALE_LIMIT/);
      assert.match(heroScript, /fitWidthDist/);
      assert.match(heroScript, /MOBILE_TRANSFORM_CONFIG\.scale/);
      assert.match(heroScript, /hero-mobile-text-front/);
      assert.match(heroScript, /spinAxisQuaternion/);
      assert.match(
        heroScript,
        /spinMotion\.rotation\.set\(intro\.x, intro\.y, intro\.z\)/,
      );
      assert.match(
        heroScript,
        /camera\.position\.set\(dist \* 0\.1, dist \* 0\.48, dist \* 0\.75\)/,
      );
      assert.doesNotMatch(heroScript, /modelStage|intro\.spin/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
