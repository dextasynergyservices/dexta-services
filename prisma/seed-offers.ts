import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  OFFERS_AUDIENCE_DEFAULTS,
  OFFERS_AUDIENCE_ORDER,
  OFFERS_GROUP_DEFAULTS,
  OFFERS_PAGE_CONTENT_DEFAULTS,
  serializeJsonStringArray,
} from "../src/lib/offers-defaults";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  // Seed page-level content singleton
  await prisma.offersPageContent.upsert({
    where: { id: 1 },
    update: OFFERS_PAGE_CONTENT_DEFAULTS,
    create: { id: 1, ...OFFERS_PAGE_CONTENT_DEFAULTS },
  });
  console.log("Seeded OffersPageContent singleton.");

  for (const audienceType of OFFERS_AUDIENCE_ORDER) {
    const audience = OFFERS_AUDIENCE_DEFAULTS[audienceType];

    // Upsert audience row (simplified — just label, empty states, color)
    await prisma.audience.upsert({
      where: { type: audienceType },
      update: {
        tabLabel: audience.tabLabel,
        emptyTitle: audience.emptyTitle,
        emptyBody: audience.emptyBody,
        color: audience.color,
        isVisible: audience.isVisible,
      },
      create: {
        type: audience.type,
        tabLabel: audience.tabLabel,
        emptyTitle: audience.emptyTitle,
        emptyBody: audience.emptyBody,
        color: audience.color,
        isVisible: audience.isVisible,
      },
    });

    // Wipe and re-seed offer groups (cascades to plans + billing options)
    await prisma.offerGroup.deleteMany({ where: { audienceType } });

    const groups = OFFERS_GROUP_DEFAULTS[audienceType];
    for (const group of groups) {
      const createdGroup = await prisma.offerGroup.create({
        data: {
          audienceType,
          name: group.name,
          description: group.description ?? null,
          position: group.position,
          isVisible: group.isVisible,
        },
      });

      for (const plan of group.plans) {
        const createdPlan = await prisma.pricingPlan.create({
          data: {
            offerGroupId: createdGroup.id,
            name: plan.name,
            subtitle: plan.subtitle ?? null,
            imagePublicId: plan.imagePublicId ?? null,
            features: serializeJsonStringArray(plan.features),
            billingEnabled: plan.billingEnabled,
            isHighlighted: plan.isHighlighted,
            highlightBgColor: plan.highlightBgColor ?? null,
            highlightTextColor: plan.highlightTextColor ?? null,
            isVisible: plan.isVisible,
            position: plan.position,
          },
        });

        if (plan.billingOptions.length > 0) {
          await prisma.planBillingOption.createMany({
            data: plan.billingOptions.map((opt) => ({
              planId: createdPlan.id,
              duration: opt.duration,
              priceNGN: opt.priceNGN ?? null,
              priceUSD: opt.priceUSD ?? null,
              label: opt.label ?? null,
              isDefault: opt.isDefault,
              position: opt.position,
            })),
          });
        }
      }

      console.log(
        `Seeded offer group "${group.name}" for ${audienceType} (${group.plans.length} plans).`,
      );
    }

    if (groups.length === 0) {
      console.log(
        `No offer groups seeded for ${audienceType} (empty audience).`,
      );
    }
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Offers seed failed:", error);
  process.exit(1);
});
