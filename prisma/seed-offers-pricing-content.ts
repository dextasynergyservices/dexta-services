import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  OFFERS_AUDIENCE_DEFAULTS,
  OFFERS_AUDIENCE_ORDER,
  OFFERS_PAGE_CONTENT_DEFAULTS,
} from "../src/lib/offers-defaults";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  await prisma.offersPageContent.upsert({
    where: { id: 1 },
    update: {
      servicesSectionLabel: OFFERS_PAGE_CONTENT_DEFAULTS.servicesSectionLabel,
      servicesSectionTitle: OFFERS_PAGE_CONTENT_DEFAULTS.servicesSectionTitle,
      servicesSectionBody: OFFERS_PAGE_CONTENT_DEFAULTS.servicesSectionBody,
      popularBadgeText: OFFERS_PAGE_CONTENT_DEFAULTS.popularBadgeText,
      featuresLabel: OFFERS_PAGE_CONTENT_DEFAULTS.featuresLabel,
      choosePlanText: OFFERS_PAGE_CONTENT_DEFAULTS.choosePlanText,
      requestQuoteText: OFFERS_PAGE_CONTENT_DEFAULTS.requestQuoteText,
    },
    create: { id: 1, ...OFFERS_PAGE_CONTENT_DEFAULTS },
  });

  console.log("Seeded offers UI copy.");

  for (const audienceType of OFFERS_AUDIENCE_ORDER) {
    const audience = OFFERS_AUDIENCE_DEFAULTS[audienceType];

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

    console.log(`Seeded audience content for ${audienceType}.`);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Offers pricing content seed failed:", error);
  process.exit(1);
});
