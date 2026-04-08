"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, updateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { getCloudinaryPublicId } from "@/lib/cloudinary";
import {
  OFFERS_AUDIENCES_TAG,
  OFFERS_GROUPS_TAG,
} from "@/lib/offers-cache";
import {
  OFFERS_AUDIENCE_DEFAULTS,
  OFFERS_AUDIENCE_ORDER,
  parseJsonStringArray,
  serializeJsonStringArray,
  type OffersAudienceType,
} from "@/lib/offers-defaults";
import prisma from "@/lib/prisma";
import {
  audienceSchema,
  offerGroupSchema,
  pricingPlanSchema,
  planBillingOptionSchema,
  type AudienceInput,
  type OfferGroupInput,
  type PricingPlanInput,
  type PlanBillingOptionInput,
} from "@/lib/validators";

type ActionResult = { success: boolean; message: string };

const OFFERS_SCHEMA_MESSAGE =
  "Offers database schema is out of date. Run `pnpm prisma db push`, restart the dev server, then reload the page.";

type OffersRuntimePrisma = typeof prisma & {
  audience?: typeof prisma.audience;
  offerGroup?: typeof prisma.offerGroup;
  pricingPlan?: typeof prisma.pricingPlan;
  planBillingOption?: typeof prisma.planBillingOption;
};

// ── Row types exposed to the client ──────────────────────────────────────────

export type AudienceRow = {
  type: OffersAudienceType;
  tabLabel: string;
  emptyTitle: string;
  emptyBody: string;
  color: "cyan" | "blue" | "purple" | "green";
  isVisible: boolean;
  updatedAt: Date;
};

export type BillingOptionRow = {
  id: string;
  duration: string;
  priceNGN: number | null;
  priceUSD: number | null;
  label: string | null;
  isDefault: boolean;
  position: number;
};

export type PlanRow = {
  id: string;
  offerGroupId: string;
  name: string;
  subtitle: string | null;
  imagePublicId: string | null;
  features: string[];
  billingEnabled: boolean;
  isHighlighted: boolean;
  highlightBgColor: string | null;
  highlightTextColor: string | null;
  isVisible: boolean;
  position: number;
  billingOptions: BillingOptionRow[];
  createdAt: Date;
  updatedAt: Date;
};

export type OfferGroupRow = {
  id: string;
  audienceType: OffersAudienceType;
  name: string;
  description: string | null;
  position: number;
  isVisible: boolean;
  plans: PlanRow[];
  createdAt: Date;
  updatedAt: Date;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function revalidateOffers() {
  updateTag(OFFERS_GROUPS_TAG);
  updateTag(OFFERS_AUDIENCES_TAG);
  revalidatePath("/offers");
  revalidatePath("/admin/offers/plans");
}

function getOffersPrisma() {
  return prisma as OffersRuntimePrisma;
}

type SqlAudienceRow = {
  type: string;
  tabLabel: string;
  emptyTitle: string;
  emptyBody: string;
  color: string;
  isVisible: boolean;
  updatedAt: Date;
};

type SqlOfferGroupRow = {
  id: string;
  audienceType: string;
  name: string;
  description: string | null;
  position: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type SqlOfferRow = {
  id: string;
  offerGroupId: string;
  name: string;
  subtitle: string | null;
  imagePublicId: string | null;
  features: string;
  billingEnabled: boolean;
  isHighlighted: boolean;
  highlightBgColor: string | null;
  highlightTextColor: string | null;
  isVisible: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

type SqlBillingOptionRow = {
  id: string;
  planId: string;
  duration: string;
  priceNGN: number | null;
  priceUSD: number | null;
  label: string | null;
  isDefault: boolean;
  position: number;
};

async function getNextOfferGroupPositionRaw(
  audienceType: OffersAudienceType,
): Promise<number> {
  const rows = await prisma.$queryRaw<Array<{ nextPosition: number | bigint }>>`
    SELECT COALESCE(MAX("position"), -1) + 1 AS "nextPosition"
    FROM "OfferGroup"
    WHERE "audienceType" = CAST(${audienceType} AS "AudienceType")
  `;

  return Number(rows[0]?.nextPosition ?? 0);
}

async function getNextOfferPositionRaw(groupId: string): Promise<number> {
  const rows = await prisma.$queryRaw<Array<{ nextPosition: number | bigint }>>`
    SELECT COALESCE(MAX("position"), -1) + 1 AS "nextPosition"
    FROM "PricingPlan"
    WHERE "offerGroupId" = ${groupId}
  `;

  return Number(rows[0]?.nextPosition ?? 0);
}

async function getNextBillingOptionPositionRaw(planId: string): Promise<number> {
  const rows = await prisma.$queryRaw<Array<{ nextPosition: number | bigint }>>`
    SELECT COALESCE(MAX("position"), -1) + 1 AS "nextPosition"
    FROM "PlanBillingOption"
    WHERE "planId" = ${planId}
  `;

  return Number(rows[0]?.nextPosition ?? 0);
}

async function updateAudienceSettingsRaw(
  type: OffersAudienceType,
  data: AudienceInput,
) {
  await prisma.$executeRaw`
    UPDATE "Audience"
    SET
      "tabLabel" = ${data.tabLabel},
      "emptyTitle" = ${data.emptyTitle},
      "emptyBody" = ${data.emptyBody},
      "color" = ${data.color},
      "isVisible" = ${data.isVisible},
      "updatedAt" = NOW()
    WHERE "type" = CAST(${type} AS "AudienceType")
  `;
}

async function createOfferGroupRaw(
  audienceType: OffersAudienceType,
  data: OfferGroupInput,
) {
  const position = await getNextOfferGroupPositionRaw(audienceType);
  await prisma.$executeRaw`
    INSERT INTO "OfferGroup" (
      "id",
      "audienceType",
      "name",
      "description",
      "position",
      "isVisible",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${crypto.randomUUID()},
      CAST(${audienceType} AS "AudienceType"),
      ${data.name},
      ${data.description ?? null},
      ${position},
      ${data.isVisible},
      NOW(),
      NOW()
    )
  `;
}

async function updateOfferGroupRaw(id: string, data: OfferGroupInput) {
  await prisma.$executeRaw`
    UPDATE "OfferGroup"
    SET
      "name" = ${data.name},
      "description" = ${data.description ?? null},
      "isVisible" = ${data.isVisible},
      "updatedAt" = NOW()
    WHERE "id" = ${id}
  `;
}

async function deleteOfferGroupRaw(id: string) {
  await prisma.$executeRaw`
    DELETE FROM "OfferGroup"
    WHERE "id" = ${id}
  `;
}

async function createPricingPlanRaw(groupId: string, data: PricingPlanInput) {
  const position = await getNextOfferPositionRaw(groupId);
  await prisma.$executeRaw`
    INSERT INTO "PricingPlan" (
      "id",
      "offerGroupId",
      "name",
      "subtitle",
      "imagePublicId",
      "features",
      "billingEnabled",
      "isHighlighted",
      "highlightBgColor",
      "highlightTextColor",
      "isVisible",
      "position",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${crypto.randomUUID()},
      ${groupId},
      ${data.name},
      ${data.subtitle ?? null},
      ${data.imagePublicId
        ? getCloudinaryPublicId(data.imagePublicId) ?? data.imagePublicId
        : null},
      ${serializeJsonStringArray(parseJsonStringArray(data.features))},
      ${data.billingEnabled},
      ${data.isHighlighted},
      ${data.highlightBgColor ?? null},
      ${data.highlightTextColor ?? null},
      ${data.isVisible},
      ${position},
      NOW(),
      NOW()
    )
  `;
}

async function updatePricingPlanRaw(id: string, data: PricingPlanInput) {
  await prisma.$executeRaw`
    UPDATE "PricingPlan"
    SET
      "name" = ${data.name},
      "subtitle" = ${data.subtitle ?? null},
      "imagePublicId" = ${data.imagePublicId
        ? getCloudinaryPublicId(data.imagePublicId) ?? data.imagePublicId
        : null},
      "features" = ${serializeJsonStringArray(parseJsonStringArray(data.features))},
      "billingEnabled" = ${data.billingEnabled},
      "isHighlighted" = ${data.isHighlighted},
      "highlightBgColor" = ${data.highlightBgColor ?? null},
      "highlightTextColor" = ${data.highlightTextColor ?? null},
      "isVisible" = ${data.isVisible},
      "updatedAt" = NOW()
    WHERE "id" = ${id}
  `;
}

async function deletePricingPlanRaw(id: string) {
  await prisma.$executeRaw`
    DELETE FROM "PricingPlan"
    WHERE "id" = ${id}
  `;
}

async function reorderPricingPlansRaw(groupId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((planId, index) =>
      prisma.$executeRaw`
        UPDATE "PricingPlan"
        SET "position" = ${index}, "updatedAt" = NOW()
        WHERE "id" = ${planId} AND "offerGroupId" = ${groupId}
      `,
    ),
  );
}

async function createBillingOptionRaw(
  planId: string,
  data: PlanBillingOptionInput,
) {
  const position = await getNextBillingOptionPositionRaw(planId);
  if (data.isDefault) {
    await prisma.$executeRaw`
      UPDATE "PlanBillingOption"
      SET "isDefault" = false, "updatedAt" = NOW()
      WHERE "planId" = ${planId}
    `;
  }
  await prisma.$executeRaw`
    INSERT INTO "PlanBillingOption" (
      "id",
      "planId",
      "duration",
      "priceNGN",
      "priceUSD",
      "label",
      "isDefault",
      "position",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${crypto.randomUUID()},
      ${planId},
      CAST(${data.duration} AS "BillingDuration"),
      ${data.priceNGN ?? null},
      ${data.priceUSD ?? null},
      ${data.label ?? null},
      ${data.isDefault},
      ${position},
      NOW(),
      NOW()
    )
  `;
}

async function updateBillingOptionRaw(id: string, data: PlanBillingOptionInput) {
  const rows = await prisma.$queryRaw<Array<{ planId: string }>>`
    SELECT "planId"
    FROM "PlanBillingOption"
    WHERE "id" = ${id}
    LIMIT 1
  `;
  const planId = rows[0]?.planId;
  if (planId && data.isDefault) {
    await prisma.$executeRaw`
      UPDATE "PlanBillingOption"
      SET "isDefault" = false, "updatedAt" = NOW()
      WHERE "planId" = ${planId}
    `;
  }
  await prisma.$executeRaw`
    UPDATE "PlanBillingOption"
    SET
      "duration" = CAST(${data.duration} AS "BillingDuration"),
      "priceNGN" = ${data.priceNGN ?? null},
      "priceUSD" = ${data.priceUSD ?? null},
      "label" = ${data.label ?? null},
      "isDefault" = ${data.isDefault},
      "updatedAt" = NOW()
    WHERE "id" = ${id}
  `;
}

async function deleteBillingOptionRaw(id: string) {
  await prisma.$executeRaw`
    DELETE FROM "PlanBillingOption"
    WHERE "id" = ${id}
  `;
}

function isOffersSchemaMismatch(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  ) {
    return true;
  }
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("public.Audience") ||
    msg.includes("public.OfferGroup") ||
    msg.includes("public.PricingPlan") ||
    msg.includes("DataMapperError") ||
    msg.includes("not found in enum 'AudienceType'") ||
    msg.includes("Invalid value for argument `type`") ||
    msg.includes("Invalid value for argument `audienceType`") ||
    msg.includes("Unknown argument `offerGroupId`") ||
    msg.includes("Unknown argument `planId`") ||
    msg.includes("Unknown argument `highlightBgColor`") ||
    msg.includes("Unknown argument `highlightTextColor`") ||
    msg.includes("Unknown argument `billingEnabled`") ||
    msg.includes("Unknown argument `duration`") ||
    msg.includes("Unknown argument `audienceType`") ||
    msg.includes("Unknown argument `planType`") ||
    msg.includes("Unknown argument `priceMonthlyUSD`") ||
    msg.includes("Unknown argument `priceQuarterlyUSD`") ||
    msg.includes("Expected AudienceType") ||
    msg.includes("Cannot read properties of undefined") ||
    msg.includes("PrismaClientValidationError") ||
    msg.includes("highlightBgColor") ||
    msg.includes("highlightTextColor")
  );
}

async function readAudienceSettingsViaSql(): Promise<AudienceRow[]> {
  const rows = await prisma.$queryRaw<SqlAudienceRow[]>`
    SELECT
      "type",
      "tabLabel",
      "emptyTitle",
      "emptyBody",
      "color",
      "isVisible",
      "updatedAt"
    FROM "Audience"
    ORDER BY "type" ASC
  `;

  const rowMap = new Map(
    rows.map((row) => [row.type as OffersAudienceType, row]),
  );

  return OFFERS_AUDIENCE_ORDER.map((type) => {
    const row = rowMap.get(type);
    return row
      ? {
          type,
          tabLabel: row.tabLabel,
          emptyTitle: row.emptyTitle,
          emptyBody: row.emptyBody,
          color: row.color as AudienceRow["color"],
          isVisible: row.isVisible,
          updatedAt: new Date(row.updatedAt),
        }
      : {
          type,
          tabLabel: OFFERS_AUDIENCE_DEFAULTS[type].tabLabel,
          emptyTitle: OFFERS_AUDIENCE_DEFAULTS[type].emptyTitle,
          emptyBody: OFFERS_AUDIENCE_DEFAULTS[type].emptyBody,
          color: OFFERS_AUDIENCE_DEFAULTS[type].color as AudienceRow["color"],
          isVisible: OFFERS_AUDIENCE_DEFAULTS[type].isVisible,
          updatedAt: new Date(0),
        };
  });
}

async function readOfferGroupsViaSql(): Promise<OfferGroupRow[]> {
  const groups = await prisma.$queryRaw<SqlOfferGroupRow[]>`
    SELECT
      "id",
      "audienceType",
      "name",
      "description",
      "position",
      "isVisible",
      "createdAt",
      "updatedAt"
    FROM "OfferGroup"
    ORDER BY "audienceType" ASC, "position" ASC
  `;

  if (groups.length === 0) {
    return [];
  }

  const groupIds = groups.map((group) => group.id);
  const offers = await prisma.$queryRaw<SqlOfferRow[]>`
    SELECT
      "id",
      "offerGroupId",
      "name",
      "subtitle",
      "imagePublicId",
      "features",
      "billingEnabled",
      "isHighlighted",
      "highlightBgColor",
      "highlightTextColor",
      "isVisible",
      "position",
      "createdAt",
      "updatedAt"
    FROM "PricingPlan"
    WHERE "offerGroupId" IN (${Prisma.join(groupIds)})
    ORDER BY "offerGroupId" ASC, "position" ASC
  `;

  const offerIds = offers.map((offer) => offer.id);
  const billingOptions =
    offerIds.length > 0
      ? await prisma.$queryRaw<SqlBillingOptionRow[]>`
          SELECT
            "id",
            "planId",
            "duration",
            "priceNGN",
            "priceUSD",
            "label",
            "isDefault",
            "position"
          FROM "PlanBillingOption"
          WHERE "planId" IN (${Prisma.join(offerIds)})
          ORDER BY "planId" ASC, "position" ASC
        `
      : [];

  const billingByOfferId = new Map<string, BillingOptionRow[]>();
  for (const option of billingOptions) {
    const current = billingByOfferId.get(option.planId) ?? [];
    current.push({
      id: option.id,
      duration: option.duration,
      priceNGN: option.priceNGN ?? null,
      priceUSD: option.priceUSD ?? null,
      label: option.label ?? null,
      isDefault: option.isDefault,
      position: option.position,
    });
    billingByOfferId.set(option.planId, current);
  }

  const offersByGroupId = new Map<string, PlanRow[]>();
  for (const offer of offers) {
    const current = offersByGroupId.get(offer.offerGroupId) ?? [];
    current.push({
      id: offer.id,
      offerGroupId: offer.offerGroupId,
      name: offer.name,
      subtitle: offer.subtitle ?? null,
      imagePublicId: offer.imagePublicId
        ? getCloudinaryPublicId(offer.imagePublicId) ?? offer.imagePublicId
        : null,
      features: parseJsonStringArray(offer.features),
      billingEnabled: offer.billingEnabled,
      isHighlighted: offer.isHighlighted,
      highlightBgColor: offer.highlightBgColor ?? null,
      highlightTextColor: offer.highlightTextColor ?? null,
      isVisible: offer.isVisible,
      position: offer.position,
      billingOptions: billingByOfferId.get(offer.id) ?? [],
      createdAt: new Date(offer.createdAt),
      updatedAt: new Date(offer.updatedAt),
    });
    offersByGroupId.set(offer.offerGroupId, current);
  }

  return groups.map((group) => ({
    id: group.id,
    audienceType: group.audienceType as OffersAudienceType,
    name: group.name,
    description: group.description ?? null,
    position: group.position,
    isVisible: group.isVisible,
    plans: offersByGroupId.get(group.id) ?? [],
    createdAt: new Date(group.createdAt),
    updatedAt: new Date(group.updatedAt),
  }));
}

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

// ── Audience ──────────────────────────────────────────────────────────────────

async function ensureAudienceScaffold() {
  try {
    const client = getOffersPrisma();
    if (!client.audience) return false;

    for (const type of OFFERS_AUDIENCE_ORDER) {
      const defaults = OFFERS_AUDIENCE_DEFAULTS[type];
      await client.audience.upsert({
        where: { type },
        update: {},
        create: {
          type: defaults.type,
          tabLabel: defaults.tabLabel,
          emptyTitle: defaults.emptyTitle,
          emptyBody: defaults.emptyBody,
          color: defaults.color,
          isVisible: defaults.isVisible,
        },
      });
    }
    return true;
  } catch (error) {
    if (isOffersSchemaMismatch(error)) return false;
    throw error;
  }
}

export async function getAudienceSettings(): Promise<AudienceRow[]> {
  try {
    const client = getOffersPrisma();
    await ensureAudienceScaffold();
    if (!client.audience) {
      return await readAudienceSettingsViaSql();
    }

    const rows = await client.audience.findMany({
      orderBy: { type: "asc" },
      select: { type: true, tabLabel: true, emptyTitle: true, emptyBody: true, color: true, isVisible: true, updatedAt: true },
    });
    const rowMap = new Map(rows.map((r) => [r.type as OffersAudienceType, r as AudienceRow]));
    return OFFERS_AUDIENCE_ORDER.map((type) => rowMap.get(type) ?? {
      type,
      tabLabel: OFFERS_AUDIENCE_DEFAULTS[type].tabLabel,
      emptyTitle: OFFERS_AUDIENCE_DEFAULTS[type].emptyTitle,
      emptyBody: OFFERS_AUDIENCE_DEFAULTS[type].emptyBody,
      color: OFFERS_AUDIENCE_DEFAULTS[type].color as AudienceRow["color"],
      isVisible: OFFERS_AUDIENCE_DEFAULTS[type].isVisible,
      updatedAt: new Date(0),
    });
  } catch (error) {
    if (isOffersSchemaMismatch(error)) {
      try {
        return await readAudienceSettingsViaSql();
      } catch {
        return OFFERS_AUDIENCE_ORDER.map((type) => ({
          type,
          tabLabel: OFFERS_AUDIENCE_DEFAULTS[type].tabLabel,
          emptyTitle: OFFERS_AUDIENCE_DEFAULTS[type].emptyTitle,
          emptyBody: OFFERS_AUDIENCE_DEFAULTS[type].emptyBody,
          color: OFFERS_AUDIENCE_DEFAULTS[type].color as AudienceRow["color"],
          isVisible: OFFERS_AUDIENCE_DEFAULTS[type].isVisible,
          updatedAt: new Date(0),
        }));
      }
    }
    throw error;
  }
}

export async function updateAudienceSettings(
  type: OffersAudienceType,
  data: AudienceInput,
): Promise<ActionResult> {
  const parsed = audienceSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Validation failed",
    };
  }

  try {
    const client = getOffersPrisma();
    await requireAuth();
    await ensureAudienceScaffold();
    if (!client.audience) {
      await updateAudienceSettingsRaw(type, parsed.data);
      revalidateOffers();
      return { success: true, message: "Audience updated." };
    }

    await client.audience.update({
      where: { type },
      data: {
        tabLabel: parsed.data.tabLabel,
        emptyTitle: parsed.data.emptyTitle,
        emptyBody: parsed.data.emptyBody,
        color: parsed.data.color,
        isVisible: parsed.data.isVisible,
      },
    });
    revalidateOffers();
    return { success: true, message: "Audience updated." };
  } catch (error) {
    if (isOffersSchemaMismatch(error)) {
      try {
        await updateAudienceSettingsRaw(type, parsed.data);
        revalidateOffers();
        return { success: true, message: "Audience updated." };
      } catch (fallbackError) {
        console.error("[updateAudienceSettings:fallback]", fallbackError);
      }
    }
    console.error("[updateAudienceSettings]", error);
    return {
      success: false,
      message: isOffersSchemaMismatch(error)
        ? OFFERS_SCHEMA_MESSAGE
        : "Failed to update audience.",
    };
  }
}

// ── Offer groups ──────────────────────────────────────────────────────────────

export async function getOfferGroups(): Promise<OfferGroupRow[]> {
  try {
    const client = getOffersPrisma();
    if (!client.offerGroup) {
      return await readOfferGroupsViaSql();
    }

    const rows = await client.offerGroup.findMany({
      orderBy: [{ audienceType: "asc" }, { position: "asc" }],
      select: {
        id: true,
        audienceType: true,
        name: true,
        description: true,
        position: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true,
        plans: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            offerGroupId: true,
            name: true,
            subtitle: true,
            imagePublicId: true,
            features: true,
            billingEnabled: true,
            isHighlighted: true,
            highlightBgColor: true,
            highlightTextColor: true,
            isVisible: true,
            position: true,
            createdAt: true,
            updatedAt: true,
            billingOptions: {
              orderBy: { position: "asc" },
              select: { id: true, duration: true, priceNGN: true, priceUSD: true, label: true, isDefault: true, position: true },
            },
          },
        },
      },
    });
    return rows.map((g) => ({
      ...g,
      audienceType: g.audienceType as OffersAudienceType,
      description: g.description ?? null,
      plans: g.plans.map((p) => ({
        ...p,
        subtitle: p.subtitle ?? null,
        imagePublicId: p.imagePublicId
          ? getCloudinaryPublicId(p.imagePublicId) ?? p.imagePublicId
          : null,
        features: parseJsonStringArray(p.features),
        highlightBgColor: p.highlightBgColor ?? null,
        highlightTextColor: p.highlightTextColor ?? null,
        billingOptions: p.billingOptions.map((o) => ({ ...o, label: o.label ?? null })),
      })),
    }));
  } catch (error) {
    if (isOffersSchemaMismatch(error)) {
      try {
        return await readOfferGroupsViaSql();
      } catch {
        return [];
      }
    }
    console.error("[getOfferGroups]", error);
    return [];
  }
}

export async function createOfferGroup(
  audienceType: OffersAudienceType,
  data: OfferGroupInput,
): Promise<ActionResult> {
  const parsed = offerGroupSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Validation failed",
    };
  }

  try {
    const client = getOffersPrisma();
    await requireAuth();
    await ensureAudienceScaffold();
    if (!client.offerGroup) {
      await createOfferGroupRaw(audienceType, parsed.data);
      revalidateOffers();
      return { success: true, message: "Offer group created." };
    }

    const last = await client.offerGroup.findFirst({ where: { audienceType }, orderBy: { position: "desc" }, select: { position: true } });
    await client.offerGroup.create({
      data: {
        audienceType,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        position: last ? last.position + 1 : 0,
        isVisible: parsed.data.isVisible,
      },
    });
    revalidateOffers();
    return { success: true, message: "Offer group created." };
  } catch (error) {
    if (isOffersSchemaMismatch(error)) {
      try {
        await createOfferGroupRaw(audienceType, parsed.data);
        revalidateOffers();
        return { success: true, message: "Offer group created." };
      } catch (fallbackError) {
        console.error("[createOfferGroup:fallback]", fallbackError);
      }
    }
    console.error("[createOfferGroup]", error);
    return {
      success: false,
      message: isOffersSchemaMismatch(error)
        ? OFFERS_SCHEMA_MESSAGE
        : "Failed to create offer group.",
    };
  }
}

export async function updateOfferGroup(id: string, data: OfferGroupInput): Promise<ActionResult> {
  const parsed = offerGroupSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Validation failed",
    };
  }

  try {
    const client = getOffersPrisma();
    await requireAuth();
    if (!client.offerGroup) {
      await updateOfferGroupRaw(id, parsed.data);
      revalidateOffers();
      return { success: true, message: "Offer group updated." };
    }

    await client.offerGroup.update({
      where: { id },
      data: { name: parsed.data.name, description: parsed.data.description ?? null, isVisible: parsed.data.isVisible },
    });
    revalidateOffers();
    return { success: true, message: "Offer group updated." };
  } catch (error) {
    if (isOffersSchemaMismatch(error)) {
      try {
        await updateOfferGroupRaw(id, parsed.data);
        revalidateOffers();
        return { success: true, message: "Offer group updated." };
      } catch (fallbackError) {
        console.error("[updateOfferGroup:fallback]", fallbackError);
      }
    }
    console.error("[updateOfferGroup]", error);
    return {
      success: false,
      message: isOffersSchemaMismatch(error)
        ? OFFERS_SCHEMA_MESSAGE
        : "Failed to update offer group.",
    };
  }
}

export async function deleteOfferGroup(id: string): Promise<ActionResult> {
  try {
    const client = getOffersPrisma();
    await requireAuth();
    if (!client.offerGroup) {
      await deleteOfferGroupRaw(id);
      revalidateOffers();
      return { success: true, message: "Offer group deleted." };
    }

    await client.offerGroup.delete({ where: { id } });
    revalidateOffers();
    return { success: true, message: "Offer group deleted." };
  } catch (error) {
    if (isOffersSchemaMismatch(error)) {
      try {
        await deleteOfferGroupRaw(id);
        revalidateOffers();
        return { success: true, message: "Offer group deleted." };
      } catch (fallbackError) {
        console.error("[deleteOfferGroup:fallback]", fallbackError);
      }
    }
    console.error("[deleteOfferGroup]", error);
    return {
      success: false,
      message: isOffersSchemaMismatch(error)
        ? OFFERS_SCHEMA_MESSAGE
        : "Failed to delete offer group.",
    };
  }
}

// ── Pricing plans ─────────────────────────────────────────────────────────────

export async function createPricingPlan(groupId: string, data: PricingPlanInput): Promise<ActionResult> {
  const parsed = pricingPlanSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Validation failed",
    };
  }

  try {
    const client = getOffersPrisma();
    await requireAuth();
    if (!client.pricingPlan) {
      await createPricingPlanRaw(groupId, parsed.data);
      revalidateOffers();
      return { success: true, message: "Offer created." };
    }

    const last = await client.pricingPlan.findFirst({ where: { offerGroupId: groupId }, orderBy: { position: "desc" }, select: { position: true } });
    await client.pricingPlan.create({
      data: {
        offerGroupId: groupId,
        name: parsed.data.name,
        subtitle: parsed.data.subtitle ?? null,
        imagePublicId: parsed.data.imagePublicId
          ? getCloudinaryPublicId(parsed.data.imagePublicId) ??
            parsed.data.imagePublicId
          : null,
        features: serializeJsonStringArray(parseJsonStringArray(parsed.data.features)),
        billingEnabled: parsed.data.billingEnabled,
        isHighlighted: parsed.data.isHighlighted,
        highlightBgColor: parsed.data.highlightBgColor ?? null,
        highlightTextColor: parsed.data.highlightTextColor ?? null,
        isVisible: parsed.data.isVisible,
        position: last ? last.position + 1 : 0,
      },
    });
    revalidateOffers();
    return { success: true, message: "Offer created." };
  } catch (error) {
    if (isOffersSchemaMismatch(error)) {
      try {
        await createPricingPlanRaw(groupId, parsed.data);
        revalidateOffers();
        return { success: true, message: "Offer created." };
      } catch (fallbackError) {
        console.error("[createPricingPlan:fallback]", fallbackError);
      }
    }
    console.error("[createPricingPlan]", error);
    return {
      success: false,
      message: isOffersSchemaMismatch(error)
        ? OFFERS_SCHEMA_MESSAGE
        : "Failed to create offer.",
    };
  }
}

export async function updatePricingPlan(id: string, data: PricingPlanInput): Promise<ActionResult> {
  const parsed = pricingPlanSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Validation failed",
    };
  }

  try {
    const client = getOffersPrisma();
    await requireAuth();
    if (!client.pricingPlan) {
      await updatePricingPlanRaw(id, parsed.data);
      revalidateOffers();
      return { success: true, message: "Offer updated." };
    }

    await client.pricingPlan.update({
      where: { id },
      data: {
        name: parsed.data.name,
        subtitle: parsed.data.subtitle ?? null,
        imagePublicId: parsed.data.imagePublicId
          ? getCloudinaryPublicId(parsed.data.imagePublicId) ??
            parsed.data.imagePublicId
          : null,
        features: serializeJsonStringArray(parseJsonStringArray(parsed.data.features)),
        billingEnabled: parsed.data.billingEnabled,
        isHighlighted: parsed.data.isHighlighted,
        highlightBgColor: parsed.data.highlightBgColor ?? null,
        highlightTextColor: parsed.data.highlightTextColor ?? null,
        isVisible: parsed.data.isVisible,
      },
    });
    revalidateOffers();
    return { success: true, message: "Offer updated." };
  } catch (error) {
    if (isOffersSchemaMismatch(error)) {
      try {
        await updatePricingPlanRaw(id, parsed.data);
        revalidateOffers();
        return { success: true, message: "Offer updated." };
      } catch (fallbackError) {
        console.error("[updatePricingPlan:fallback]", fallbackError);
      }
    }
    console.error("[updatePricingPlan]", error);
    return {
      success: false,
      message: isOffersSchemaMismatch(error)
        ? OFFERS_SCHEMA_MESSAGE
        : "Failed to update offer.",
    };
  }
}

export async function deletePricingPlan(id: string): Promise<ActionResult> {
  try {
    const client = getOffersPrisma();
    await requireAuth();
    if (!client.pricingPlan) {
      await deletePricingPlanRaw(id);
      revalidateOffers();
      return { success: true, message: "Offer deleted." };
    }

    await client.pricingPlan.delete({ where: { id } });
    revalidateOffers();
    return { success: true, message: "Offer deleted." };
  } catch (error) {
    if (isOffersSchemaMismatch(error)) {
      try {
        await deletePricingPlanRaw(id);
        revalidateOffers();
        return { success: true, message: "Offer deleted." };
      } catch (fallbackError) {
        console.error("[deletePricingPlan:fallback]", fallbackError);
      }
    }
    console.error("[deletePricingPlan]", error);
    return {
      success: false,
      message: isOffersSchemaMismatch(error)
        ? OFFERS_SCHEMA_MESSAGE
        : "Failed to delete offer.",
    };
  }
}

export async function reorderPlans(groupId: string, orderedIds: string[]): Promise<ActionResult> {
  try {
    const client = getOffersPrisma();
    await requireAuth();
    if (!client.pricingPlan) {
      await reorderPricingPlansRaw(groupId, orderedIds);
      revalidateOffers();
      return { success: true, message: "Offers reordered." };
    }

    await prisma.$transaction(
      orderedIds.map((planId, index) => client.pricingPlan!.update({ where: { id: planId }, data: { position: index } })),
    );
    revalidateOffers();
    return { success: true, message: "Offers reordered." };
  } catch (error) {
    if (isOffersSchemaMismatch(error)) {
      try {
        await reorderPricingPlansRaw(groupId, orderedIds);
        revalidateOffers();
        return { success: true, message: "Offers reordered." };
      } catch (fallbackError) {
        console.error("[reorderPlans:fallback]", fallbackError);
      }
    }
    console.error("[reorderPlans]", error);
    return {
      success: false,
      message: isOffersSchemaMismatch(error)
        ? OFFERS_SCHEMA_MESSAGE
        : "Failed to reorder offers.",
    };
  }
}

// ── Billing options ───────────────────────────────────────────────────────────

export async function createBillingOption(planId: string, data: PlanBillingOptionInput): Promise<ActionResult> {
  const parsed = planBillingOptionSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Validation failed",
    };
  }

  try {
    const client = getOffersPrisma();
    await requireAuth();
    if (!client.planBillingOption) {
      await createBillingOptionRaw(planId, parsed.data);
      revalidateOffers();
      return { success: true, message: "Billing option added." };
    }

    const last = await client.planBillingOption.findFirst({ where: { planId }, orderBy: { position: "desc" }, select: { position: true } });
    if (parsed.data.isDefault) {
      await client.planBillingOption.updateMany({ where: { planId }, data: { isDefault: false } });
    }
    await client.planBillingOption.create({
      data: {
        planId,
        duration: parsed.data.duration,
        priceNGN: parsed.data.priceNGN ?? null,
        priceUSD: parsed.data.priceUSD ?? null,
        label: parsed.data.label ?? null,
        isDefault: parsed.data.isDefault,
        position: last ? last.position + 1 : 0,
      },
    });
    revalidateOffers();
    return { success: true, message: "Billing option added." };
  } catch (error) {
    if (isOffersSchemaMismatch(error)) {
      try {
        await createBillingOptionRaw(planId, parsed.data);
        revalidateOffers();
        return { success: true, message: "Billing option added." };
      } catch (fallbackError) {
        console.error("[createBillingOption:fallback]", fallbackError);
      }
    }
    console.error("[createBillingOption]", error);
    return {
      success: false,
      message: isOffersSchemaMismatch(error)
        ? OFFERS_SCHEMA_MESSAGE
        : "Failed to add billing option.",
    };
  }
}

export async function updateBillingOption(id: string, data: PlanBillingOptionInput): Promise<ActionResult> {
  const parsed = planBillingOptionSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Validation failed",
    };
  }

  try {
    const client = getOffersPrisma();
    await requireAuth();
    if (!client.planBillingOption) {
      await updateBillingOptionRaw(id, parsed.data);
      revalidateOffers();
      return { success: true, message: "Billing option updated." };
    }

    const existing = await client.planBillingOption.findUnique({ where: { id }, select: { planId: true } });
    if (!existing) return { success: false, message: "Billing option not found." };
    if (parsed.data.isDefault) {
      await client.planBillingOption.updateMany({ where: { planId: existing.planId }, data: { isDefault: false } });
    }
    await client.planBillingOption.update({
      where: { id },
      data: {
        duration: parsed.data.duration,
        priceNGN: parsed.data.priceNGN ?? null,
        priceUSD: parsed.data.priceUSD ?? null,
        label: parsed.data.label ?? null,
        isDefault: parsed.data.isDefault,
      },
    });
    revalidateOffers();
    return { success: true, message: "Billing option updated." };
  } catch (error) {
    if (isOffersSchemaMismatch(error)) {
      try {
        await updateBillingOptionRaw(id, parsed.data);
        revalidateOffers();
        return { success: true, message: "Billing option updated." };
      } catch (fallbackError) {
        console.error("[updateBillingOption:fallback]", fallbackError);
      }
    }
    console.error("[updateBillingOption]", error);
    return {
      success: false,
      message: isOffersSchemaMismatch(error)
        ? OFFERS_SCHEMA_MESSAGE
        : "Failed to update billing option.",
    };
  }
}

export async function deleteBillingOption(id: string): Promise<ActionResult> {
  try {
    const client = getOffersPrisma();
    await requireAuth();
    if (!client.planBillingOption) {
      await deleteBillingOptionRaw(id);
      revalidateOffers();
      return { success: true, message: "Billing option removed." };
    }

    await client.planBillingOption.delete({ where: { id } });
    revalidateOffers();
    return { success: true, message: "Billing option removed." };
  } catch (error) {
    if (isOffersSchemaMismatch(error)) {
      try {
        await deleteBillingOptionRaw(id);
        revalidateOffers();
        return { success: true, message: "Billing option removed." };
      } catch (fallbackError) {
        console.error("[deleteBillingOption:fallback]", fallbackError);
      }
    }
    console.error("[deleteBillingOption]", error);
    return {
      success: false,
      message: isOffersSchemaMismatch(error)
        ? OFFERS_SCHEMA_MESSAGE
        : "Failed to remove billing option.",
    };
  }
}
