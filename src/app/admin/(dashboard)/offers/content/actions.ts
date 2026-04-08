"use server";

import { revalidatePath, updateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { getCloudinaryPublicId } from "@/lib/cloudinary";
import { OFFERS_CONTENT_TAG } from "@/lib/offers-cache";
import prisma from "@/lib/prisma";
import {
  OFFERS_PAGE_CONTENT_DEFAULTS,
  type OffersPageContentData,
} from "@/lib/offers-defaults";
import {
  offersPageContentSchema,
  type OffersPageContentInput,
} from "@/lib/validators";

type ActionResult = { success: boolean; message: string };

export type OffersPageContentRow = OffersPageContentData;

function revalidateOffersContent() {
  updateTag(OFFERS_CONTENT_TAG);
  revalidatePath("/offers");
  revalidatePath("/admin/offers/content");
}

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

function normalizeOffersPageContent(
  data: OffersPageContentInput,
): OffersPageContentRow {
  return {
    heroEyebrow: data.heroEyebrow,
    heroHeadline: data.heroHeadline,
    heroBody: data.heroBody,
    heroBgImagePublicId: data.heroBgImagePublicId
      ? getCloudinaryPublicId(data.heroBgImagePublicId) ??
        data.heroBgImagePublicId
      : null,
    heroCtaText: data.heroCtaText,
    heroCtaHref: data.heroCtaHref,
    servicesSectionLabel: data.servicesSectionLabel,
    servicesSectionTitle: data.servicesSectionTitle,
    servicesSectionBody: data.servicesSectionBody,
    audienceSectionLabel: data.audienceSectionLabel,
    audienceSectionTitle: data.audienceSectionTitle,
    audienceSectionBody: data.audienceSectionBody,
    popularBadgeText: data.popularBadgeText,
    featuresLabel: data.featuresLabel,
    choosePlanText:
      data.choosePlanText === "Choose Plan"
        ? "Choose Offer"
        : data.choosePlanText,
    requestQuoteText: data.requestQuoteText,
    ctaLabel: data.ctaLabel,
    ctaTitle: data.ctaTitle,
    ctaBody: data.ctaBody,
    cta1Text: data.cta1Text,
    cta1Href: data.cta1Href,
    cta2Text: data.cta2Text,
    cta2Href: data.cta2Href,
  };
}

function normalizeStoredHeroImageValue(value: string | null | undefined) {
  return value ? getCloudinaryPublicId(value) ?? value : null;
}

function normalizeStoredHeroCtaText(value: string) {
  return value === "Explore Plans" ? "Explore Offers" : value;
}

function normalizeStoredAudienceBody(value: string) {
  return value ===
    "Whether you're scaling a business, building a school's reputation, or growing a faith community — we have a plan designed specifically for your context."
    ? "Whether you're scaling a business, building a school's reputation, or growing a faith community — we have an offer designed specifically for your context."
    : value;
}

function normalizeStoredChooseText(value: string) {
  return value === "Choose Plan" ? "Choose Offer" : value;
}

export async function getOffersPageContent(): Promise<OffersPageContentRow> {
  try {
    const row = await prisma.offersPageContent.findUnique({ where: { id: 1 } });

    if (!row) {
      return OFFERS_PAGE_CONTENT_DEFAULTS;
    }

    return {
      heroEyebrow: row.heroEyebrow,
      heroHeadline: row.heroHeadline,
      heroBody: row.heroBody,
      heroBgImagePublicId: normalizeStoredHeroImageValue(row.heroBgImagePublicId),
      heroCtaText: normalizeStoredHeroCtaText(row.heroCtaText),
      heroCtaHref: row.heroCtaHref,
      servicesSectionLabel: row.servicesSectionLabel,
      servicesSectionTitle: row.servicesSectionTitle,
      servicesSectionBody: row.servicesSectionBody,
      audienceSectionLabel: row.audienceSectionLabel,
      audienceSectionTitle: row.audienceSectionTitle,
      audienceSectionBody: normalizeStoredAudienceBody(row.audienceSectionBody),
      popularBadgeText: row.popularBadgeText,
      featuresLabel: row.featuresLabel,
      choosePlanText: normalizeStoredChooseText(row.choosePlanText),
      requestQuoteText: row.requestQuoteText,
      ctaLabel: row.ctaLabel,
      ctaTitle: row.ctaTitle,
      ctaBody: row.ctaBody,
      cta1Text: row.cta1Text,
      cta1Href: row.cta1Href,
      cta2Text: row.cta2Text,
      cta2Href: row.cta2Href,
    };
  } catch {
    return OFFERS_PAGE_CONTENT_DEFAULTS;
  }
}

export async function updateOffersPageContent(
  data: OffersPageContentInput,
): Promise<ActionResult> {
  try {
    await requireAuth();

    const parsed = offersPageContentSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    const normalizedData = normalizeOffersPageContent(parsed.data);

    await prisma.offersPageContent.upsert({
      where: { id: 1 },
      update: normalizedData,
      create: { id: 1, ...normalizedData },
    });

    revalidateOffersContent();
    return { success: true, message: "Offers page content updated successfully" };
  } catch (error) {
    console.error("[Update Offers Page Content]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update offers page content",
    };
  }
}
