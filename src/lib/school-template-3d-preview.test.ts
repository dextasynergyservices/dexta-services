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
    assert.match(sourceHtml, HERO_3D_SCRIPT_PATTERN);

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
      /<script type="module" src="js\/hero-3d\.js\?dextaPreview=3d-config-v2" data-dexta-preview-hero-3d="external"><\/script>/,
    );
    assert.equal(html.match(/src="js\/hero-3d\.js/g)?.length, 1);
    assert.ok(
      html.indexOf("window.schoolHero3dConfig = ") <
        html.indexOf('data-dexta-preview-hero-3d="external"'),
      "Server-rendered 3D config should appear before the external module.",
    );
  });
});

describe("Dexta Academy 4 export 3D rendering", () => {
  it("keeps the uploaded model in the exported page and patches the hero module", async () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = CLOUD_NAME;
    const rawModelUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/school-models/cap.glb`;
    const { content, sourceSnapshot } =
      buildDextaAcademy4PreviewInput(rawModelUrl);
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
      assert.doesNotMatch(indexHtml, /\/api\/cloudinary\/raw/);
      assert.match(heroScript, /window\.schoolHero3dConfig\?\.model\?\.url/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
