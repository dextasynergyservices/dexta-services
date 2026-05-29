import { Buffer } from "node:buffer";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inflateRawSync } from "node:zlib";
import { buildSchoolWebsiteProjectExportZip } from "@/lib/school-template-exporter";
import { dextaAcademy1Manifest } from "@/lib/school-template-manifests/dexta-academy-1";
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

  assert.notEqual(endOfCentralDirectoryOffset, -1);

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

describe("Dexta Academy 1 export", () => {
  it("lets homepage hero mobile text sizing override rich text font sizes", async () => {
    const content = buildSchoolTemplateProjectContent(dextaAcademy1Manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(
      dextaAcademy1Manifest,
    );
    const hero = content.pages
      .find((page) => page.slug === "home")
      ?.sections.find((section) => section.id === "hero");
    assert.ok(hero, "Expected Template 1 home hero content.");

    Object.assign(hero.fields, {
      headline:
        '<span style="font-size:88px;color:#123456">Responsive hero headline</span>',
      body: '<span style="font-size:28px;color:#654321">Responsive hero body.</span>',
      headlineMobileFontSize: 31,
      bodyMobileFontSize: 15,
      buttonMobileFontSize: 12,
      buttonMobileMinHeight: 42,
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

      assert.match(indexHtml, /Responsive hero headline/);
      assert.match(indexHtml, /font-size:\s*88px;/);
      assert.doesNotMatch(indexHtml, /font-size:\s*88px !important/);
      assert.match(indexHtml, /headline-mobile-font-size,\s*31px\)!important/);
      assert.match(indexHtml, /body-mobile-font-size,\s*15px\)!important/);
      assert.match(indexHtml, /button-mobile-font-size,\s*12px\)!important/);
      assert.match(indexHtml, /button-mobile-min-height,\s*42px\)!important/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
