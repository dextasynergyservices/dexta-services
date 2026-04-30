import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

const TEMPLATE_VIDEO_SEED_DATA = [
  {
    templateId: "school-template-bright-academy",
    templateSlug: "bright-academy",
    templatePosition: 1,
    assetId: "school-template-bright-academy-video",
    publicId:
      "https://res.cloudinary.com/dt7ozsctz/video/upload/v1777555462/School-A-Edited_mjoyki.mp4",
    caption: "School A video preview",
  },
  {
    templateId: "school-template-crown-college",
    templateSlug: "crown-college",
    templatePosition: 2,
    assetId: "school-template-crown-college-video",
    publicId:
      "https://res.cloudinary.com/dt7ozsctz/video/upload/v1777555457/School-B-Edited_yj471c.mp4",
    caption: "School B video preview",
  },
  {
    templateId: "school-template-hilltop-schools",
    templateSlug: "hilltop-schools",
    templatePosition: 3,
    assetId: "school-template-hilltop-schools-video",
    publicId:
      "https://res.cloudinary.com/dt7ozsctz/video/upload/v1777555464/School-C-Edited_npiasd.mp4",
    caption: "School C video preview",
  },
  {
    templateId: "school-template-greenfield-international",
    templateSlug: "greenfield-international",
    templatePosition: 4,
    assetId: "school-template-greenfield-international-video",
    publicId:
      "https://res.cloudinary.com/dt7ozsctz/video/upload/v1777555443/School-D-Edited_qpci7r.mp4",
    caption: "School D video preview",
  },
];

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    for (const videoSeed of TEMPLATE_VIDEO_SEED_DATA) {
      const template = await prisma.schoolWebsiteTemplate.findFirst({
        where: {
          OR: [
            { id: videoSeed.templateId },
            { slug: videoSeed.templateSlug },
            { position: videoSeed.templatePosition },
          ],
        },
        include: {
          assets: {
            orderBy: { position: "asc" },
          },
        },
      });

      if (!template) {
        console.warn(
          `Skipped ${videoSeed.caption}: no matching template found.`,
        );
        continue;
      }

      const thumbnailPublicId =
        template.assets.find((asset) => asset.id === template.coverAssetId)
          ?.publicId ??
        template.assets.find((asset) => asset.mediaType === "IMAGE")
          ?.publicId ??
        null;
      const existingVideoAsset = template.assets.find(
        (asset) =>
          asset.id === videoSeed.assetId ||
          asset.publicId === videoSeed.publicId,
      );
      const nextPosition =
        Math.max(-1, ...template.assets.map((asset) => asset.position)) + 1;

      await prisma.schoolWebsiteTemplateAsset.upsert({
        where: {
          id: existingVideoAsset?.id ?? videoSeed.assetId,
        },
        create: {
          id: videoSeed.assetId,
          templateId: template.id,
          publicId: videoSeed.publicId,
          mediaType: "VIDEO",
          thumbnailPublicId,
          caption: videoSeed.caption,
          position: nextPosition,
        },
        update: {
          publicId: videoSeed.publicId,
          mediaType: "VIDEO",
          thumbnailPublicId,
          caption: videoSeed.caption,
        },
      });

      console.log(
        `Seeded ${videoSeed.caption} into template ${template.position}: ${template.name}`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("We Brand Schools video seed failed:", error);
  process.exit(1);
});
