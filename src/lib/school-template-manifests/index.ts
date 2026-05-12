import { dextaAcademy1Manifest } from "./dexta-academy-1";
import { dextaAcademy2Manifest } from "./dexta-academy-2";
import { dextaAcademy3Manifest } from "./dexta-academy-3";
import { dextaAcademy4Manifest } from "./dexta-academy-4";
import { dextaAcademy5Manifest } from "./dexta-academy-5";
import type { SchoolTemplateManifest } from "./types";

export type {
  SchoolTemplateAssetInventory,
  SchoolTemplateField,
  SchoolTemplateFieldTarget,
  SchoolTemplateFieldType,
  SchoolTemplateManifest,
  SchoolTemplatePage,
  SchoolTemplateRepeatableSection,
  SchoolTemplateResponsiveScope,
  SchoolTemplateSection,
} from "./types";

export const schoolTemplateManifests = [
  dextaAcademy1Manifest,
  dextaAcademy2Manifest,
  dextaAcademy3Manifest,
  dextaAcademy4Manifest,
  dextaAcademy5Manifest,
] as const satisfies readonly SchoolTemplateManifest[];

export type SchoolTemplateSlug =
  (typeof schoolTemplateManifests)[number]["templateSlug"];

const schoolTemplateManifestBySlug = new Map<string, SchoolTemplateManifest>(
  schoolTemplateManifests.map((manifest) => [manifest.templateSlug, manifest]),
);

export function listSchoolTemplateManifests(): readonly SchoolTemplateManifest[] {
  return schoolTemplateManifests;
}

export function getSchoolTemplateManifest(
  templateSlug: string,
): SchoolTemplateManifest | null {
  return schoolTemplateManifestBySlug.get(templateSlug) ?? null;
}

export function requireSchoolTemplateManifest(
  templateSlug: string,
): SchoolTemplateManifest {
  const manifest = getSchoolTemplateManifest(templateSlug);

  if (!manifest) {
    throw new Error(
      `School template manifest not found for "${templateSlug}".`,
    );
  }

  return manifest;
}

export function getSchoolTemplatePage(templateSlug: string, pageSlug: string) {
  const manifest = requireSchoolTemplateManifest(templateSlug);
  return manifest.pages.find((page) => page.slug === pageSlug) ?? null;
}
