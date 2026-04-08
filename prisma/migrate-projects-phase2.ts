import "dotenv/config";
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  projectsHeroDefaults,
  serviceContentDefaults,
} from "./seed-projects-data";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

const SERVICE_DEFAULTS = Object.fromEntries(
  serviceContentDefaults.map((service) => [
    service.type,
    {
      cardColor: service.cardColor,
      overlayColor: service.overlayColor,
    },
  ]),
) as Record<
  (typeof serviceContentDefaults)[number]["type"],
  {
    cardColor: string;
    overlayColor: string;
  }
>;

function slugifyWithSuffix(text: string) {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const safeBase = base || "project";
  return `${safeBase}-${randomBytes(2).toString("hex")}`;
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    await prisma.projectsHeroContent.upsert({
      where: { id: projectsHeroDefaults.id },
      update: {},
      create: projectsHeroDefaults,
    });

    const serviceRows = await prisma.serviceContent.findMany({
      select: {
        id: true,
        type: true,
        cardColor: true,
        overlayColor: true,
      },
    });

    let updatedServices = 0;

    for (const row of serviceRows) {
      const defaults = SERVICE_DEFAULTS[row.type];
      const nextCardColor = row.cardColor?.trim() || defaults.cardColor;
      const nextOverlayColor =
        row.overlayColor?.trim() || defaults.overlayColor;

      if (
        nextCardColor !== row.cardColor ||
        nextOverlayColor !== row.overlayColor
      ) {
        await prisma.serviceContent.update({
          where: { id: row.id },
          data: {
            cardColor: nextCardColor,
            overlayColor: nextOverlayColor,
          },
        });
        updatedServices += 1;
      }
    }

    const portfolioItems = await prisma.portfolioItem.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        mediaPublicId: true,
        mediaType: true,
        thumbnailPublicId: true,
        coverAssetId: true,
        assets: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            publicId: true,
            mediaType: true,
            thumbnailPublicId: true,
            position: true,
          },
        },
      },
    });

    let createdAssets = 0;
    let updatedItems = 0;

    for (const item of portfolioItems) {
      let coverAssetId = item.coverAssetId;

      if (item.assets.length === 0) {
        const createdAsset = await prisma.portfolioAsset.create({
          data: {
            portfolioItemId: item.id,
            publicId: item.mediaPublicId,
            mediaType: item.mediaType,
            thumbnailPublicId: item.thumbnailPublicId,
            position: 0,
          },
        });

        coverAssetId ??= createdAsset.id;
        createdAssets += 1;
      } else if (!coverAssetId) {
        const matchingAsset =
          item.assets.find((asset) => asset.publicId === item.mediaPublicId) ??
          item.assets[0];

        coverAssetId = matchingAsset?.id ?? null;
      }

      const nextSlug = item.slug?.trim() || slugifyWithSuffix(item.title);
      const shouldUpdate = nextSlug !== item.slug || coverAssetId !== item.coverAssetId;

      if (shouldUpdate) {
        await prisma.portfolioItem.update({
          where: { id: item.id },
          data: {
            slug: nextSlug,
            coverAssetId,
          },
        });
        updatedItems += 1;
      }
    }

    console.log("Projects Phase 2 migration complete.");
    console.log(`Projects hero singleton ensured.`);
    console.log(`Service rows normalized: ${updatedServices}`);
    console.log(`Portfolio assets created from legacy media: ${createdAssets}`);
    console.log(`Portfolio items updated with slug/cover asset: ${updatedItems}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Projects Phase 2 migration failed:", error);
  process.exit(1);
});
