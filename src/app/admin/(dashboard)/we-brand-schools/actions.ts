"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { getCloudinaryPublicId } from "@/lib/cloudinary";
import { weBrandSchoolsPrisma } from "@/lib/we-brand-schools-prisma";
import {
  SCHOOL_WEBSITE_APPLICATIONS_TAG,
  SCHOOL_WEBSITE_TEMPLATES_TAG,
  WE_BRAND_SCHOOLS_CONTENT_TAG,
} from "@/lib/we-brand-schools-cache";
import {
  WE_BRAND_SCHOOLS_PAGE_CONTENT_DEFAULTS,
  parseJsonStringArray,
  serializeJsonStringArray,
  type SchoolWebsiteApplicationData,
  type SchoolWebsiteTemplateData,
  type WeBrandSchoolsPageContentData,
} from "@/lib/we-brand-schools-defaults";
import {
  schoolWebsiteApplicationStatusSchema,
  schoolWebsiteTemplateSchema,
  weBrandSchoolsPageContentSchema,
  type SchoolWebsiteApplicationStatusInput,
  type SchoolWebsiteTemplateInput,
  type WeBrandSchoolsPageContentInput,
} from "@/lib/validators";

type ActionResult = { success: boolean; message: string };

export type WeBrandSchoolsPageContentRow = WeBrandSchoolsPageContentData;
export type SchoolWebsiteTemplateRow = SchoolWebsiteTemplateData;
export type SchoolWebsiteApplicationRow = SchoolWebsiteApplicationData & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  template: {
    id: string;
    name: string;
  } | null;
};

function revalidateWeBrandSchoolsAdmin() {
  updateTag(WE_BRAND_SCHOOLS_CONTENT_TAG);
  updateTag(SCHOOL_WEBSITE_TEMPLATES_TAG);
  updateTag(SCHOOL_WEBSITE_APPLICATIONS_TAG);
  revalidatePath("/webrandschools");
  revalidatePath("/admin/we-brand-schools");
  revalidatePath("/admin/we-brand-schools/content");
  revalidatePath("/admin/we-brand-schools/templates");
  revalidatePath("/admin/we-brand-schools/applications");
}

async function requireAuth() {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
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
      ? (getCloudinaryPublicId(data.heroImagePublicId) ?? data.heroImagePublicId)
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
      ? (getCloudinaryPublicId(asset.thumbnailPublicId) ?? asset.thumbnailPublicId)
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

    return {
      logoPublicId: row.logoPublicId ?? null,
      heroImagePublicId: row.heroImagePublicId ?? null,
      heroEyebrow: row.heroEyebrow,
      heroHeadline: row.heroHeadline,
      heroBody: row.heroBody,
      heroPrimaryCtaText: row.heroPrimaryCtaText,
      heroPrimaryCtaHref: row.heroPrimaryCtaHref,
      heroSecondaryCtaText: row.heroSecondaryCtaText,
      heroSecondaryCtaHref: row.heroSecondaryCtaHref,
      overviewLabel: row.overviewLabel,
      overviewTitle: row.overviewTitle,
      overviewBody: row.overviewBody,
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
    };
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
    const unsupportedFields = getUnsupportedWeBrandSchoolsContentFields(normalized);

    if (unsupportedFields.length > 0) {
      const formattedFields = unsupportedFields
        .map((field) => `\`${field}\``)
        .join(", ");

      return {
        success: false,
        message: `The running Prisma client is out of date and can't save ${formattedFields} yet. Restart the dev server and try again.`,
      };
    }

    const existing = await weBrandSchoolsPrisma.weBrandSchoolsPageContent.findFirst({
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
        error instanceof Error
          ? error.message
          : "Failed to create template.",
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
        error instanceof Error
          ? error.message
          : "Failed to update template.",
    };
  }
}

export async function deleteSchoolWebsiteTemplate(id: string): Promise<ActionResult> {
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
        error instanceof Error
          ? error.message
          : "Failed to delete template.",
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
      },
    });

    return rows.map((row: {
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
    }));
  } catch (error) {
    console.error("[getSchoolWebsiteApplicationsAdmin]", error);
    return [];
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
