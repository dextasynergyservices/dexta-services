"use server";

import { type Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath, updateTag } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";
import { getCloudinaryPublicId } from "@/lib/cloudinary";
import { uploadRawBufferToCloudinary } from "@/lib/cloudinary-server";
import { buildSchoolWebsiteProjectExportZip } from "@/lib/school-template-exporter";
import {
  buildSchoolTemplateProjectContent,
  buildSchoolTemplateSourceSnapshot,
  isSchoolTemplateSourceSnapshot,
  parseSchoolTemplateProjectContent,
  resolveSchoolTemplateManifestForSelection,
  sanitizeSchoolTemplateProjectContent,
  syncSchoolTemplateProjectContentWithManifest,
  validateSchoolTemplateProjectContentReferences,
  type SchoolTemplateProjectContent,
  type SchoolTemplateSourceSnapshot,
} from "@/lib/school-template-project-content";
import {
  createSchoolWebsiteTestimonialRecord,
  deleteSchoolWebsiteTestimonialRecord,
  listSchoolWebsiteTestimonials,
  updateSchoolWebsiteTestimonialRecord,
  weBrandSchoolsPrisma,
} from "@/lib/we-brand-schools-prisma";
import {
  SCHOOL_WEBSITE_TESTIMONIALS_TAG,
  SCHOOL_WEBSITE_APPLICATIONS_TAG,
  SCHOOL_WEBSITE_TEMPLATES_TAG,
  WE_BRAND_SCHOOLS_CONTENT_TAG,
} from "@/lib/we-brand-schools-cache";
import {
  WE_BRAND_SCHOOLS_PAGE_CONTENT_DEFAULTS,
  parseJsonStringArray,
  serializeJsonStringArray,
  type SchoolWebsiteApplicationData,
  type SchoolWebsiteTestimonialData,
  type SchoolWebsiteTemplateData,
  type WeBrandSchoolsPageContentData,
  withWeBrandSchoolsPageContentDefaults,
} from "@/lib/we-brand-schools-defaults";
import {
  schoolWebsiteApplicationStatusSchema,
  schoolWebsiteTestimonialSchema,
  schoolWebsiteTemplateSchema,
  weBrandSchoolsPageContentSchema,
  type SchoolWebsiteApplicationStatusInput,
  type SchoolWebsiteTestimonialInput,
  type SchoolWebsiteTemplateInput,
  type WeBrandSchoolsPageContentInput,
} from "@/lib/validators";

type ActionResult = { success: boolean; message: string };
type StartSchoolWebsiteProjectResult = ActionResult & {
  projectId?: string;
  redirectHref?: string;
};
type SaveSchoolWebsiteProjectOptions = {
  createRevision?: boolean;
  note?: string;
  applicationId?: string;
};
type SaveSchoolWebsiteProjectDraftResult = ActionResult & {
  updatedAt?: string;
};
type ExportSchoolWebsiteProjectResult = ActionResult & {
  exportZipUrl?: string;
  lastExportedAt?: string;
  status?: SchoolWebsiteProjectStatusRow;
  fileCount?: number;
  pageCount?: number;
};
type SchoolWebsiteProjectExportLogDelegate = {
  create(args: {
    data: {
      projectId: string;
      status: "STARTED" | "SUCCESS" | "FAILED";
      message: string;
      exportZipUrl: string | null;
      fileCount: number | null;
      pageCount: number | null;
      durationMs: number | null;
      detailsJson?: Record<string, unknown>;
    };
  }): Promise<unknown>;
};
type SchoolWebsiteProjectRevisionResult = ActionResult & {
  revisionId?: string;
};
type SchoolWebsiteProjectEditorDataResult = ActionResult & {
  project?: {
    id: string;
    applicationId: string;
    schoolName: string;
    status: SchoolWebsiteProjectStatusRow;
    contentJson: SchoolTemplateProjectContent;
    sourceSnapshot: SchoolTemplateSourceSnapshot;
    exportZipUrl: string | null;
    lastExportedAt: Date | null;
    updatedAt: Date;
  };
};
type SchoolWebsiteProjectAdminQueryRow = {
  id: string;
  applicationId: string;
  schoolName: string;
  templateName: string;
  templateSlug: string;
  contactEmail: string | null;
  status: SchoolWebsiteProjectStatusRow;
  contentJson: unknown;
  exportZipUrl: string | null;
  lastExportedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
type SchoolWebsiteProjectStatusRow =
  | "DRAFT"
  | "IN_PROGRESS"
  | "READY_FOR_EXPORT"
  | "EXPORTED"
  | "LIVE";

export type WeBrandSchoolsPageContentRow = WeBrandSchoolsPageContentData;
export type SchoolWebsiteTestimonialRow = SchoolWebsiteTestimonialData;
export type SchoolWebsiteTemplateRow = SchoolWebsiteTemplateData;
export type SchoolWebsiteApplicationRow = SchoolWebsiteApplicationData & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  template: {
    id: string;
    name: string;
  } | null;
  project: {
    id: string;
    status: SchoolWebsiteProjectStatusRow;
  } | null;
};
export type SchoolWebsiteProjectRow = {
  id: string;
  applicationId: string;
  schoolName: string;
  templateName: string;
  templateSlug: string;
  contactEmail: string | null;
  status: SchoolWebsiteProjectStatusRow;
  previewPageSlug: string;
  exportZipUrl: string | null;
  lastExportedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function revalidateWeBrandSchoolsAdmin() {
  updateTag(WE_BRAND_SCHOOLS_CONTENT_TAG);
  updateTag(SCHOOL_WEBSITE_TESTIMONIALS_TAG);
  updateTag(SCHOOL_WEBSITE_TEMPLATES_TAG);
  updateTag(SCHOOL_WEBSITE_APPLICATIONS_TAG);
  revalidatePath("/webrandschools");
  revalidatePath("/admin/we-brand-schools");
  revalidatePath("/admin/we-brand-schools/content");
  revalidatePath("/admin/we-brand-schools/testimonials");
  revalidatePath("/admin/we-brand-schools/templates");
  revalidatePath("/admin/we-brand-schools/applications");
  revalidatePath("/admin/we-brand-schools/projects");
}

function getSchoolWebsiteProjectEditorHref(projectId: string) {
  return `/admin/we-brand-schools/projects/${projectId}/editor`;
}

function slugifyExportFileName(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "school-website"
  );
}

function isCloudinaryFileSizeLimitError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const uploadError = error as {
    message?: unknown;
    http_code?: unknown;
  };

  return (
    uploadError.http_code === 400 &&
    String(uploadError.message ?? "")
      .toLowerCase()
      .includes("file size too large")
  );
}

async function writeExportZipToPublic({
  projectId,
  fileName,
  buffer,
}: {
  projectId: string;
  fileName: string;
  buffer: Buffer;
}) {
  const exportDirectory = path.join(
    process.cwd(),
    "public",
    "school-website-exports",
    projectId,
  );
  await mkdir(exportDirectory, { recursive: true });

  const filePath = path.join(exportDirectory, fileName);
  await writeFile(filePath, buffer);

  return `/school-website-exports/${encodeURIComponent(projectId)}/${encodeURIComponent(fileName)}`;
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function getContentValidationMessage(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>;
}) {
  const issue = error.issues[0];
  if (!issue) {
    return "Project content is not in the expected JSON format.";
  }

  const path = issue.path.length
    ? ` at ${issue.path.map(String).join(".")}`
    : "";
  return `Project content is invalid${path}: ${issue.message}`;
}

async function createSchoolWebsiteProjectRevisionRecord({
  projectId,
  contentJson,
  note,
}: {
  projectId: string;
  contentJson: SchoolTemplateProjectContent;
  note?: string;
}) {
  return weBrandSchoolsPrisma.schoolWebsiteProjectRevision.create({
    data: {
      projectId,
      contentJson,
      note: note ?? null,
    },
    select: {
      id: true,
    },
  });
}

async function requireAuth() {
  await requireAdminSession();
}

function getSafeProjectContent({
  contentJson,
  sourceSnapshot,
}: {
  contentJson: unknown;
  sourceSnapshot: unknown;
}) {
  const parsedContent = parseSchoolTemplateProjectContent(contentJson);
  if (!parsedContent.success) {
    return {
      success: false as const,
      message: getContentValidationMessage(parsedContent.error),
    };
  }

  if (!isSchoolTemplateSourceSnapshot(sourceSnapshot)) {
    return {
      success: false as const,
      message: "Project source snapshot is not in the expected format.",
    };
  }

  const syncedProjectContent = syncSchoolTemplateProjectContentWithManifest({
    content: parsedContent.data,
    sourceSnapshot,
  });

  const rawReferenceIssues = validateSchoolTemplateProjectContentReferences(
    syncedProjectContent.contentJson,
    syncedProjectContent.sourceSnapshot,
  );
  if (rawReferenceIssues.length > 0) {
    return {
      success: false as const,
      message: rawReferenceIssues[0],
    };
  }

  const sanitizedContent = sanitizeSchoolTemplateProjectContent(
    syncedProjectContent.contentJson,
    syncedProjectContent.sourceSnapshot,
  );
  const referenceIssues = validateSchoolTemplateProjectContentReferences(
    sanitizedContent,
    syncedProjectContent.sourceSnapshot,
  );

  if (referenceIssues.length > 0) {
    return {
      success: false as const,
      message: referenceIssues[0],
    };
  }

  return {
    success: true as const,
    contentJson: sanitizedContent,
    sourceSnapshot: syncedProjectContent.sourceSnapshot,
  };
}

async function createSchoolWebsiteProjectExportLog({
  projectId,
  status,
  message,
  exportZipUrl,
  fileCount,
  pageCount,
  durationMs,
  detailsJson,
}: {
  projectId: string;
  status: "STARTED" | "SUCCESS" | "FAILED";
  message: string;
  exportZipUrl?: string | null;
  fileCount?: number;
  pageCount?: number;
  durationMs?: number;
  detailsJson?: Record<string, unknown>;
}) {
  const exportLogDelegate = (
    weBrandSchoolsPrisma as typeof weBrandSchoolsPrisma & {
      schoolWebsiteProjectExportLog?: SchoolWebsiteProjectExportLogDelegate;
    }
  ).schoolWebsiteProjectExportLog;

  if (!exportLogDelegate) {
    return;
  }

  try {
    await exportLogDelegate.create({
      data: {
        projectId,
        status,
        message,
        exportZipUrl: exportZipUrl ?? null,
        fileCount: fileCount ?? null,
        pageCount: pageCount ?? null,
        durationMs: durationMs ?? null,
        detailsJson: detailsJson ?? undefined,
      },
    });
  } catch (error) {
    if (isMissingSchoolWebsiteProjectExportLogTableError(error)) {
      return;
    }

    console.error("[createSchoolWebsiteProjectExportLog]", error);
  }
}

function isMissingSchoolWebsiteProjectExportLogTableError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const prismaError = error as {
    code?: unknown;
    message?: unknown;
    meta?: {
      table?: unknown;
    };
  };

  return (
    prismaError.code === "P2021" &&
    (String(prismaError.meta?.table ?? "").includes(
      "SchoolWebsiteProjectExportLog",
    ) ||
      String(prismaError.message ?? "").includes(
        "SchoolWebsiteProjectExportLog",
      ))
  );
}

function normalizeContentData(
  data: WeBrandSchoolsPageContentInput,
): WeBrandSchoolsPageContentRow {
  return {
    ...data,
    logoPublicId: data.logoPublicId
      ? (getCloudinaryPublicId(data.logoPublicId) ?? data.logoPublicId)
      : null,
    heroImagePublicId: data.heroImagePublicId
      ? (getCloudinaryPublicId(data.heroImagePublicId) ??
        data.heroImagePublicId)
      : null,
  };
}

function getUnsupportedWeBrandSchoolsContentFields(
  data: WeBrandSchoolsPageContentRow,
): string[] {
  const runtimeDataModel = (
    weBrandSchoolsPrisma as typeof weBrandSchoolsPrisma & {
      _runtimeDataModel?: {
        models?: Record<
          string,
          {
            fields?: Array<{
              name: string;
              kind?: string;
            }>;
          }
        >;
      };
    }
  )._runtimeDataModel;

  const model = runtimeDataModel?.models?.WeBrandSchoolsPageContent;
  if (!model?.fields?.length) {
    return [];
  }

  const supportedFields = new Set(
    model.fields
      .filter((field) => field.kind === "scalar")
      .map((field) => field.name),
  );

  return Object.keys(data).filter((field) => !supportedFields.has(field));
}

function normalizeTemplateData(data: SchoolWebsiteTemplateInput) {
  const assets = data.assets.map((asset, index) => ({
    id: asset.id?.trim() || randomUUID(),
    publicId: getCloudinaryPublicId(asset.publicId) ?? asset.publicId,
    mediaType: asset.mediaType,
    thumbnailPublicId: asset.thumbnailPublicId
      ? (getCloudinaryPublicId(asset.thumbnailPublicId) ??
        asset.thumbnailPublicId)
      : null,
    caption: asset.caption ?? null,
    position: index,
  }));

  const normalizedCoverAssetId =
    assets.find((asset) => asset.id === data.coverAssetId)?.id ??
    assets[0]?.id ??
    null;

  return {
    name: data.name,
    slug: data.slug,
    summary: data.summary,
    description: data.description ?? null,
    websiteUrl: data.websiteUrl ?? null,
    highlights: serializeJsonStringArray(parseJsonStringArray(data.highlights)),
    coverAssetId: normalizedCoverAssetId,
    isVisible: data.isVisible,
    position: data.position,
    assets,
  };
}

function normalizeTestimonialData(data: SchoolWebsiteTestimonialInput) {
  return {
    ...data,
    logoPublicId: data.logoPublicId
      ? (getCloudinaryPublicId(data.logoPublicId) ?? data.logoPublicId)
      : null,
  };
}

function mapTemplateRow(row: {
  id: string;
  name: string;
  slug: string;
  summary: string;
  description: string | null;
  websiteUrl: string | null;
  highlights: string;
  coverAssetId: string | null;
  isVisible: boolean;
  position: number;
  assets: Array<{
    id: string;
    publicId: string;
    mediaType: "IMAGE" | "VIDEO";
    thumbnailPublicId: string | null;
    caption: string | null;
    position: number;
  }>;
}): SchoolWebsiteTemplateRow {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    websiteUrl: row.websiteUrl,
    highlights: parseJsonStringArray(row.highlights),
    coverAssetId: row.coverAssetId,
    isVisible: row.isVisible,
    position: row.position,
    assets: row.assets.map((asset) => ({
      id: asset.id,
      publicId: asset.publicId,
      mediaType: asset.mediaType,
      thumbnailPublicId: asset.thumbnailPublicId,
      caption: asset.caption,
      position: asset.position,
    })),
  };
}

export async function getWeBrandSchoolsPageContent(): Promise<WeBrandSchoolsPageContentRow> {
  try {
    const row = await weBrandSchoolsPrisma.weBrandSchoolsPageContent.findFirst({
      orderBy: { id: "asc" },
    });

    if (!row) {
      return WE_BRAND_SCHOOLS_PAGE_CONTENT_DEFAULTS;
    }

    return withWeBrandSchoolsPageContentDefaults({
      logoPublicId: row.logoPublicId ?? null,
      heroImagePublicId: row.heroImagePublicId ?? null,
      heroEyebrow: row.heroEyebrow,
      heroHeadline: row.heroHeadline,
      heroBody: row.heroBody,
      heroPrimaryCtaText: row.heroPrimaryCtaText,
      heroPrimaryCtaHref: row.heroPrimaryCtaHref,
      heroSecondaryCtaText: row.heroSecondaryCtaText,
      heroSecondaryCtaHref: row.heroSecondaryCtaHref,
      heroFeature1: row.heroFeature1,
      heroFeature2: row.heroFeature2,
      heroFeature3: row.heroFeature3,
      overviewLabel: row.overviewLabel,
      overviewTitle: row.overviewTitle,
      overviewBody: row.overviewBody,
      overviewPrimaryCtaText: row.overviewPrimaryCtaText,
      overviewPrimaryCtaHref: row.overviewPrimaryCtaHref,
      overviewSecondaryCtaText: row.overviewSecondaryCtaText,
      overviewSecondaryCtaHref: row.overviewSecondaryCtaHref,
      overviewBenefitsLabel: row.overviewBenefitsLabel,
      overviewBenefit1: row.overviewBenefit1,
      overviewBenefit2: row.overviewBenefit2,
      overviewBenefit3: row.overviewBenefit3,
      overviewBenefit4: row.overviewBenefit4,
      processLabel: row.processLabel,
      processTitle: row.processTitle,
      processBody: row.processBody,
      processStep1Title: row.processStep1Title,
      processStep1Body: row.processStep1Body,
      processStep2Title: row.processStep2Title,
      processStep2Body: row.processStep2Body,
      processStep3Title: row.processStep3Title,
      processStep3Body: row.processStep3Body,
      processStep4Title: row.processStep4Title,
      processStep4Body: row.processStep4Body,
      templatesLabel: row.templatesLabel,
      templatesTitle: row.templatesTitle,
      templatesBody: row.templatesBody,
    });
  } catch (error) {
    console.error("[getWeBrandSchoolsPageContent]", error);
    return WE_BRAND_SCHOOLS_PAGE_CONTENT_DEFAULTS;
  }
}

export async function updateWeBrandSchoolsPageContent(
  data: WeBrandSchoolsPageContentInput,
): Promise<ActionResult> {
  try {
    await requireAuth();

    const parsed = weBrandSchoolsPageContentSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    const normalized = normalizeContentData(parsed.data);
    const unsupportedFields =
      getUnsupportedWeBrandSchoolsContentFields(normalized);

    if (unsupportedFields.length > 0) {
      const formattedFields = unsupportedFields
        .map((field) => `\`${field}\``)
        .join(", ");

      return {
        success: false,
        message: `The running Prisma client is out of date and can't save ${formattedFields} yet. Restart the dev server and try again.`,
      };
    }

    const existing =
      await weBrandSchoolsPrisma.weBrandSchoolsPageContent.findFirst({
        orderBy: { id: "asc" },
        select: { id: true },
      });

    if (existing) {
      await weBrandSchoolsPrisma.weBrandSchoolsPageContent.update({
        where: { id: existing.id },
        data: normalized,
      });
    } else {
      await weBrandSchoolsPrisma.weBrandSchoolsPageContent.create({
        data: normalized,
      });
    }

    revalidateWeBrandSchoolsAdmin();
    return {
      success: true,
      message: "We Brand Schools content updated successfully.",
    };
  } catch (error) {
    console.error("[updateWeBrandSchoolsPageContent]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update We Brand Schools content.",
    };
  }
}

export async function getSchoolWebsiteTestimonialsAdmin(): Promise<
  SchoolWebsiteTestimonialRow[]
> {
  try {
    const rows = await listSchoolWebsiteTestimonials();

    return rows.map((row: SchoolWebsiteTestimonialRow) => ({
      id: row.id,
      schoolName: row.schoolName,
      logoPublicId: row.logoPublicId ?? null,
      quote: row.quote,
      authorName: row.authorName,
      authorPosition: row.authorPosition,
      isVisible: row.isVisible,
      position: row.position,
    }));
  } catch (error) {
    console.error("[getSchoolWebsiteTestimonialsAdmin]", error);
    return [];
  }
}

export async function createSchoolWebsiteTestimonial(
  data: SchoolWebsiteTestimonialInput,
): Promise<ActionResult> {
  try {
    await requireAuth();

    const parsed = schoolWebsiteTestimonialSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    await createSchoolWebsiteTestimonialRecord(
      normalizeTestimonialData(parsed.data),
    );

    revalidateWeBrandSchoolsAdmin();
    return {
      success: true,
      message: "Testimonial card created successfully.",
    };
  } catch (error) {
    console.error("[createSchoolWebsiteTestimonial]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create testimonial card.",
    };
  }
}

export async function updateSchoolWebsiteTestimonial(
  id: string,
  data: SchoolWebsiteTestimonialInput,
): Promise<ActionResult> {
  try {
    await requireAuth();

    const parsed = schoolWebsiteTestimonialSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    await updateSchoolWebsiteTestimonialRecord(
      id,
      normalizeTestimonialData(parsed.data),
    );

    revalidateWeBrandSchoolsAdmin();
    return {
      success: true,
      message: "Testimonial card updated successfully.",
    };
  } catch (error) {
    console.error("[updateSchoolWebsiteTestimonial]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update testimonial card.",
    };
  }
}

export async function deleteSchoolWebsiteTestimonial(
  id: string,
): Promise<ActionResult> {
  try {
    await requireAuth();

    await deleteSchoolWebsiteTestimonialRecord(id);

    revalidateWeBrandSchoolsAdmin();
    return {
      success: true,
      message: "Testimonial card deleted successfully.",
    };
  } catch (error) {
    console.error("[deleteSchoolWebsiteTestimonial]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete testimonial card.",
    };
  }
}

export async function getSchoolWebsiteTemplatesAdmin(): Promise<
  SchoolWebsiteTemplateRow[]
> {
  try {
    const rows = await weBrandSchoolsPrisma.schoolWebsiteTemplate.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        summary: true,
        description: true,
        websiteUrl: true,
        highlights: true,
        coverAssetId: true,
        isVisible: true,
        position: true,
        assets: {
          orderBy: [{ position: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            publicId: true,
            mediaType: true,
            thumbnailPublicId: true,
            caption: true,
            position: true,
          },
        },
      },
    });

    return rows.map(mapTemplateRow);
  } catch (error) {
    console.error("[getSchoolWebsiteTemplatesAdmin]", error);
    return [];
  }
}

export async function createSchoolWebsiteTemplate(
  data: SchoolWebsiteTemplateInput,
): Promise<ActionResult> {
  try {
    await requireAuth();

    const parsed = schoolWebsiteTemplateSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    const normalized = normalizeTemplateData(parsed.data);

    const created = await weBrandSchoolsPrisma.schoolWebsiteTemplate.create({
      data: {
        name: normalized.name,
        slug: normalized.slug,
        summary: normalized.summary,
        description: normalized.description,
        websiteUrl: normalized.websiteUrl,
        highlights: normalized.highlights,
        coverAssetId: null,
        isVisible: normalized.isVisible,
        position: normalized.position,
        assets: {
          create: normalized.assets.map((asset) => ({
            id: asset.id,
            publicId: asset.publicId,
            mediaType: asset.mediaType,
            thumbnailPublicId: asset.thumbnailPublicId,
            caption: asset.caption,
            position: asset.position,
          })),
        },
      },
      select: { id: true },
    });

    if (normalized.coverAssetId) {
      await weBrandSchoolsPrisma.schoolWebsiteTemplate.update({
        where: { id: created.id },
        data: { coverAssetId: normalized.coverAssetId },
      });
    }

    revalidateWeBrandSchoolsAdmin();
    return {
      success: true,
      message: "Template created successfully.",
    };
  } catch (error) {
    console.error("[createSchoolWebsiteTemplate]", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create template.",
    };
  }
}

export async function updateSchoolWebsiteTemplate(
  id: string,
  data: SchoolWebsiteTemplateInput,
): Promise<ActionResult> {
  try {
    await requireAuth();

    const parsed = schoolWebsiteTemplateSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    const normalized = normalizeTemplateData(parsed.data);

    await weBrandSchoolsPrisma.$transaction(async (tx) => {
      await tx.schoolWebsiteTemplate.update({
        where: { id },
        data: { coverAssetId: null },
      });

      await tx.schoolWebsiteTemplateAsset.deleteMany({
        where: { templateId: id },
      });

      await tx.schoolWebsiteTemplate.update({
        where: { id },
        data: {
          name: normalized.name,
          slug: normalized.slug,
          summary: normalized.summary,
          description: normalized.description,
          websiteUrl: normalized.websiteUrl,
          highlights: normalized.highlights,
          coverAssetId: null,
          isVisible: normalized.isVisible,
          position: normalized.position,
          assets: {
            create: normalized.assets.map((asset) => ({
              id: asset.id,
              publicId: asset.publicId,
              mediaType: asset.mediaType,
              thumbnailPublicId: asset.thumbnailPublicId,
              caption: asset.caption,
              position: asset.position,
            })),
          },
        },
      });

      if (normalized.coverAssetId) {
        await tx.schoolWebsiteTemplate.update({
          where: { id },
          data: { coverAssetId: normalized.coverAssetId },
        });
      }
    });

    revalidateWeBrandSchoolsAdmin();
    return {
      success: true,
      message: "Template updated successfully.",
    };
  } catch (error) {
    console.error("[updateSchoolWebsiteTemplate]", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update template.",
    };
  }
}

export async function deleteSchoolWebsiteTemplate(
  id: string,
): Promise<ActionResult> {
  try {
    await requireAuth();

    await weBrandSchoolsPrisma.schoolWebsiteTemplate.delete({
      where: { id },
    });

    revalidateWeBrandSchoolsAdmin();
    return {
      success: true,
      message: "Template deleted successfully.",
    };
  } catch (error) {
    console.error("[deleteSchoolWebsiteTemplate]", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete template.",
    };
  }
}

export async function getSchoolWebsiteApplicationsAdmin(): Promise<
  SchoolWebsiteApplicationRow[]
> {
  try {
    const rows = await weBrandSchoolsPrisma.schoolWebsiteApplication.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        template: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    return rows.map(
      (row: {
        id: string;
        templateId: string | null;
        selectedTemplateName: string;
        schoolName: string;
        aboutSchool: string;
        vision: string;
        mission: string;
        coreValues: string;
        officialPhone: string;
        officialEmail: string;
        officialAddress: string;
        officialWebsiteUrl: string | null;
        officialContactName: string | null;
        officialContactRole: string | null;
        officialContactPhone: string | null;
        officialContactEmail: string | null;
        domainChoice: SchoolWebsiteApplicationRow["domainChoice"];
        existingDomain: string | null;
        preferredDomain1: string | null;
        preferredDomain2: string | null;
        status: SchoolWebsiteApplicationRow["status"];
        adminNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
        template: {
          id: string;
          name: string;
        } | null;
        project: {
          id: string;
          status: SchoolWebsiteProjectStatusRow;
        } | null;
      }) => ({
        id: row.id,
        templateId: row.templateId ?? null,
        selectedTemplateName: row.selectedTemplateName,
        schoolName: row.schoolName,
        aboutSchool: row.aboutSchool,
        vision: row.vision,
        mission: row.mission,
        coreValues: row.coreValues,
        officialPhone: row.officialPhone,
        officialEmail: row.officialEmail,
        officialAddress: row.officialAddress,
        officialWebsiteUrl: row.officialWebsiteUrl ?? null,
        officialContactName: row.officialContactName ?? null,
        officialContactRole: row.officialContactRole ?? null,
        officialContactPhone: row.officialContactPhone ?? null,
        officialContactEmail: row.officialContactEmail ?? null,
        domainChoice: row.domainChoice,
        existingDomain: row.existingDomain ?? null,
        preferredDomain1: row.preferredDomain1 ?? null,
        preferredDomain2: row.preferredDomain2 ?? null,
        status: row.status,
        adminNotes: row.adminNotes ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        template: row.template
          ? {
              id: row.template.id,
              name: row.template.name,
            }
          : null,
        project: row.project
          ? {
              id: row.project.id,
              status: row.project.status,
            }
          : null,
      }),
    );
  } catch (error) {
    console.error("[getSchoolWebsiteApplicationsAdmin]", error);
    return [];
  }
}

export async function getSchoolWebsiteProjectsAdmin(): Promise<
  SchoolWebsiteProjectRow[]
> {
  try {
    await requireAuth();

    const projects = (await weBrandSchoolsPrisma.schoolWebsiteProject.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        applicationId: true,
        schoolName: true,
        templateName: true,
        templateSlug: true,
        contactEmail: true,
        status: true,
        contentJson: true,
        exportZipUrl: true,
        lastExportedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })) as SchoolWebsiteProjectAdminQueryRow[];

    return projects.map((project) => {
      const parsedContent = parseSchoolTemplateProjectContent(
        project.contentJson,
      );
      const previewPageSlug = parsedContent.success
        ? (parsedContent.data.pages.find((page) => page.isHome)?.slug ??
          parsedContent.data.pages[0]?.slug ??
          "home")
        : "home";

      return {
        id: project.id,
        applicationId: project.applicationId,
        schoolName: project.schoolName,
        templateName: project.templateName,
        templateSlug: project.templateSlug,
        contactEmail: project.contactEmail,
        status: project.status as SchoolWebsiteProjectStatusRow,
        previewPageSlug,
        exportZipUrl: project.exportZipUrl,
        lastExportedAt: project.lastExportedAt,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    });
  } catch (error) {
    console.error("[getSchoolWebsiteProjectsAdmin]", error);
    return [];
  }
}

export async function startSchoolWebsiteProject(
  applicationId: string,
): Promise<StartSchoolWebsiteProjectResult> {
  try {
    await requireAuth();

    const application =
      await weBrandSchoolsPrisma.schoolWebsiteApplication.findUnique({
        where: { id: applicationId },
        include: {
          template: {
            select: {
              id: true,
              name: true,
              slug: true,
              websiteUrl: true,
            },
          },
          project: {
            select: {
              id: true,
            },
          },
        },
      });

    if (!application) {
      return {
        success: false,
        message: "School website application was not found.",
      };
    }

    if (application.project) {
      await weBrandSchoolsPrisma.$transaction([
        weBrandSchoolsPrisma.schoolWebsiteApplication.update({
          where: { id: application.id },
          data: { status: "IN_PROGRESS" },
        }),
        weBrandSchoolsPrisma.schoolWebsiteProject.update({
          where: { id: application.project.id },
          data: { status: "IN_PROGRESS" },
        }),
      ]);

      revalidateWeBrandSchoolsAdmin();

      return {
        success: true,
        message: "Project already exists. Opening editor.",
        projectId: application.project.id,
        redirectHref: getSchoolWebsiteProjectEditorHref(application.project.id),
      };
    }

    if (!application.template) {
      return {
        success: false,
        message:
          "This application is not attached to a template. Attach a template before starting.",
      };
    }

    const manifest = resolveSchoolTemplateManifestForSelection({
      templateSlug: application.template.slug,
      websiteUrl: application.template.websiteUrl,
    });

    if (!manifest) {
      return {
        success: false,
        message:
          "No editable manifest was found for this template. Use a template slug or URL that matches dexta-academy-1, dexta-academy-2, dexta-academy-3, or dexta-academy-4.",
      };
    }

    const contentJson = buildSchoolTemplateProjectContent(manifest);
    const sourceSnapshot = buildSchoolTemplateSourceSnapshot(manifest);

    const project = await weBrandSchoolsPrisma.$transaction(async (tx) => {
      const createdProject = await tx.schoolWebsiteProject.create({
        data: {
          applicationId: application.id,
          templateId: application.template.id,
          templateSlug: manifest.templateSlug,
          templateName: application.template.name,
          schoolName: application.schoolName,
          contactEmail:
            application.officialContactEmail ?? application.officialEmail,
          status: "IN_PROGRESS",
          contentJson,
          sourceSnapshot,
          revisions: {
            create: {
              contentJson,
              note: "Initial project copy created from template manifest.",
            },
          },
        },
        select: {
          id: true,
        },
      });

      await tx.schoolWebsiteApplication.update({
        where: { id: application.id },
        data: { status: "IN_PROGRESS" },
      });

      return createdProject;
    });

    revalidateWeBrandSchoolsAdmin();

    return {
      success: true,
      message: "Project created. Opening editor.",
      projectId: project.id,
      redirectHref: getSchoolWebsiteProjectEditorHref(project.id),
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const existingProject =
        await weBrandSchoolsPrisma.schoolWebsiteProject.findUnique({
          where: { applicationId },
          select: { id: true },
        });

      if (existingProject) {
        revalidateWeBrandSchoolsAdmin();
        return {
          success: true,
          message: "Project already exists. Opening editor.",
          projectId: existingProject.id,
          redirectHref: getSchoolWebsiteProjectEditorHref(existingProject.id),
        };
      }
    }

    console.error("[startSchoolWebsiteProject]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to start school website project.",
    };
  }
}

export async function getSchoolWebsiteProject(
  projectId: string,
): Promise<SchoolWebsiteProjectEditorDataResult> {
  try {
    await requireAuth();

    const project = await weBrandSchoolsPrisma.schoolWebsiteProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        applicationId: true,
        schoolName: true,
        status: true,
        contentJson: true,
        sourceSnapshot: true,
        exportZipUrl: true,
        lastExportedAt: true,
        updatedAt: true,
      },
    });

    if (!project) {
      return {
        success: false,
        message: "School website project was not found.",
      };
    }

    const safeProjectContent = getSafeProjectContent({
      contentJson: project.contentJson,
      sourceSnapshot: project.sourceSnapshot,
    });
    if (!safeProjectContent.success) return safeProjectContent;

    return {
      success: true,
      message: "Project loaded successfully.",
      project: {
        ...project,
        status: project.status as SchoolWebsiteProjectStatusRow,
        contentJson: safeProjectContent.contentJson,
        sourceSnapshot: safeProjectContent.sourceSnapshot,
      },
    };
  } catch (error) {
    console.error("[getSchoolWebsiteProject]", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to load project.",
    };
  }
}

export async function createSchoolWebsiteProjectRevision(
  projectId: string,
  contentJson?: unknown,
  note?: string,
): Promise<SchoolWebsiteProjectRevisionResult> {
  try {
    await requireAuth();

    let revisionContent: SchoolTemplateProjectContent;
    const project = await weBrandSchoolsPrisma.schoolWebsiteProject.findUnique({
      where: { id: projectId },
      select: { contentJson: true, sourceSnapshot: true },
    });

    if (!project) {
      return {
        success: false,
        message: "School website project was not found.",
      };
    }

    const safeProjectContent = getSafeProjectContent({
      contentJson: contentJson ?? project.contentJson,
      sourceSnapshot: project.sourceSnapshot,
    });

    if (!safeProjectContent.success) {
      return safeProjectContent;
    }

    revisionContent = safeProjectContent.contentJson;

    const revision = await createSchoolWebsiteProjectRevisionRecord({
      projectId,
      contentJson: revisionContent,
      note: note ?? "Revision created from admin editor.",
    });

    revalidatePath(`/admin/we-brand-schools/projects/${projectId}/editor`);

    return {
      success: true,
      message: "Revision created successfully.",
      revisionId: revision.id,
    };
  } catch (error) {
    console.error("[createSchoolWebsiteProjectRevision]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create project revision.",
    };
  }
}

export async function saveSchoolWebsiteProject(
  projectId: string,
  contentJson: unknown,
  options: SaveSchoolWebsiteProjectOptions = {},
): Promise<SaveSchoolWebsiteProjectDraftResult> {
  try {
    await requireAuth();

    const project = await weBrandSchoolsPrisma.schoolWebsiteProject.findUnique({
      where: { id: projectId },
      select: {
        applicationId: true,
        contentJson: true,
        sourceSnapshot: true,
      },
    });

    if (!project) {
      return {
        success: false,
        message: "School website project was not found.",
      };
    }

    if (
      options.applicationId &&
      project.applicationId !== options.applicationId
    ) {
      return {
        success: false,
        message: "Project does not belong to the selected application.",
      };
    }

    const safeProjectContent = getSafeProjectContent({
      contentJson,
      sourceSnapshot: project.sourceSnapshot,
    });

    if (!safeProjectContent.success) {
      return safeProjectContent;
    }

    const contentToSave: SchoolTemplateProjectContent = {
      ...safeProjectContent.contentJson,
      generatedAt: new Date().toISOString(),
    };

    if (options.createRevision) {
      const existingProjectContent = getSafeProjectContent({
        contentJson: project.contentJson,
        sourceSnapshot: project.sourceSnapshot,
      });

      if (existingProjectContent.success) {
        await createSchoolWebsiteProjectRevisionRecord({
          projectId,
          contentJson: existingProjectContent.contentJson,
          note: `Before ${options.note ?? "major project save"}`,
        });
      }
    }

    const updatedProject =
      await weBrandSchoolsPrisma.schoolWebsiteProject.update({
        where: { id: projectId },
        data: {
          status: "IN_PROGRESS",
          contentJson: contentToSave,
          sourceSnapshot: safeProjectContent.sourceSnapshot,
        },
        select: {
          updatedAt: true,
        },
      });

    revalidateWeBrandSchoolsAdmin();
    revalidatePath(`/admin/we-brand-schools/projects/${projectId}/editor`);

    return {
      success: true,
      message: "Draft saved successfully.",
      updatedAt: updatedProject.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("[saveSchoolWebsiteProject]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to save project draft.",
    };
  }
}

export async function saveSchoolWebsiteProjectDraft(
  projectId: string,
  contentJson: unknown,
  options: SaveSchoolWebsiteProjectOptions = { createRevision: true },
): Promise<SaveSchoolWebsiteProjectDraftResult> {
  return saveSchoolWebsiteProject(projectId, contentJson, options);
}

export async function exportSchoolWebsiteProject(
  projectId: string,
  applicationId?: string,
): Promise<ExportSchoolWebsiteProjectResult> {
  const startedAt = Date.now();
  try {
    await requireAuth();

    const project = await weBrandSchoolsPrisma.schoolWebsiteProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        applicationId: true,
        schoolName: true,
        contentJson: true,
        sourceSnapshot: true,
      },
    });

    if (!project) {
      return {
        success: false,
        message: "School website project was not found.",
      };
    }

    if (applicationId && project.applicationId !== applicationId) {
      return {
        success: false,
        message: "Project does not belong to the selected application.",
      };
    }

    await createSchoolWebsiteProjectExportLog({
      projectId: project.id,
      status: "STARTED",
      message: "Export started.",
    });

    const safeProjectContent = getSafeProjectContent({
      contentJson: project.contentJson,
      sourceSnapshot: project.sourceSnapshot,
    });

    if (!safeProjectContent.success) {
      await createSchoolWebsiteProjectExportLog({
        projectId: project.id,
        status: "FAILED",
        message: safeProjectContent.message,
        durationMs: Date.now() - startedAt,
      });
      return safeProjectContent;
    }

    await createSchoolWebsiteProjectRevisionRecord({
      projectId: project.id,
      contentJson: safeProjectContent.contentJson,
      note: "Before export.",
    });

    const exportZip = await buildSchoolWebsiteProjectExportZip({
      content: safeProjectContent.contentJson,
      sourceSnapshot: safeProjectContent.sourceSnapshot,
    });
    const exportFileName = `${slugifyExportFileName(project.schoolName)}-website.zip`;
    let exportZipUrl: string;

    try {
      const upload = await uploadRawBufferToCloudinary({
        buffer: exportZip.buffer,
        fileName: exportFileName,
        folder: `school-website-exports/${project.id}`,
      });
      exportZipUrl = upload.url;
    } catch (error) {
      if (!isCloudinaryFileSizeLimitError(error)) {
        throw error;
      }

      exportZipUrl = await writeExportZipToPublic({
        projectId: project.id,
        fileName: exportFileName,
        buffer: exportZip.buffer,
      });
    }
    const exportedAt = new Date();

    const updatedProject =
      await weBrandSchoolsPrisma.schoolWebsiteProject.update({
        where: { id: project.id },
        data: {
          status: "EXPORTED",
          exportZipUrl,
          lastExportedAt: exportedAt,
        },
        select: {
          exportZipUrl: true,
          lastExportedAt: true,
          status: true,
        },
      });

    await createSchoolWebsiteProjectExportLog({
      projectId: project.id,
      status: "SUCCESS",
      message: "Export zip generated successfully.",
      exportZipUrl: updatedProject.exportZipUrl ?? exportZipUrl,
      fileCount: exportZip.fileCount,
      pageCount: exportZip.pageCount,
      durationMs: Date.now() - startedAt,
    });

    revalidateWeBrandSchoolsAdmin();
    revalidatePath(`/admin/we-brand-schools/projects/${projectId}/editor`);

    return {
      success: true,
      message: "Export zip generated successfully.",
      exportZipUrl: updatedProject.exportZipUrl ?? exportZipUrl,
      lastExportedAt:
        updatedProject.lastExportedAt?.toISOString() ??
        exportedAt.toISOString(),
      status: updatedProject.status as SchoolWebsiteProjectStatusRow,
      fileCount: exportZip.fileCount,
      pageCount: exportZip.pageCount,
    };
  } catch (error) {
    console.error("[exportSchoolWebsiteProject]", error);
    await createSchoolWebsiteProjectExportLog({
      projectId,
      status: "FAILED",
      message:
        error instanceof Error
          ? error.message
          : "Failed to export school website project.",
      durationMs: Date.now() - startedAt,
      detailsJson: {
        name: error instanceof Error ? error.name : "UnknownError",
      },
    });
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to export school website project.",
    };
  }
}

export async function updateSchoolWebsiteApplicationStatus(
  id: string,
  data: SchoolWebsiteApplicationStatusInput,
): Promise<ActionResult> {
  try {
    await requireAuth();

    const parsed = schoolWebsiteApplicationStatusSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    await weBrandSchoolsPrisma.schoolWebsiteApplication.update({
      where: { id },
      data: {
        status: parsed.data.status,
        adminNotes: parsed.data.adminNotes ?? null,
      },
    });

    revalidateWeBrandSchoolsAdmin();
    return {
      success: true,
      message: "Application status updated successfully.",
    };
  } catch (error) {
    console.error("[updateSchoolWebsiteApplicationStatus]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update application status.",
    };
  }
}
