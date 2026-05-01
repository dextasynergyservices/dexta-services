import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  SCHOOL_WEBSITE_TESTIMONIAL_DEFAULTS,
  WE_BRAND_SCHOOLS_PAGE_CONTENT_DEFAULTS,
  serializeJsonStringArray,
} from "../src/lib/we-brand-schools-defaults";
import { WE_BRAND_SCHOOLS_TEMPLATE_SEED_DATA } from "./seed-we-brand-schools-data";
import { seedSchoolPortalContent } from "./seed-we-brand-schools-portal";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  const existingContent = await prisma.weBrandSchoolsPageContent.findFirst({
    orderBy: { id: "asc" },
  });

  if (existingContent) {
    await prisma.weBrandSchoolsPageContent.update({
      where: { id: existingContent.id },
      data: WE_BRAND_SCHOOLS_PAGE_CONTENT_DEFAULTS,
    });
  } else {
    await prisma.weBrandSchoolsPageContent.create({
      data: WE_BRAND_SCHOOLS_PAGE_CONTENT_DEFAULTS,
    });
  }

  await prisma.schoolWebsiteTestimonial.deleteMany();

  for (const testimonial of SCHOOL_WEBSITE_TESTIMONIAL_DEFAULTS) {
    await prisma.schoolWebsiteTestimonial.create({
      data: testimonial,
    });
  }

  await prisma.schoolWebsiteTemplate.deleteMany();

  for (const template of WE_BRAND_SCHOOLS_TEMPLATE_SEED_DATA) {
    const createdTemplate = await prisma.schoolWebsiteTemplate.create({
      data: {
        id: template.id,
        name: template.name,
        slug: template.slug,
        summary: template.summary,
        description: template.description,
        websiteUrl: template.websiteUrl,
        highlights: serializeJsonStringArray(template.highlights),
        coverAssetId: null,
        isVisible: template.isVisible,
        position: template.position,
        assets: {
          create: template.assets.map((asset) => ({
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

    if (template.assets[0]?.id) {
      await prisma.schoolWebsiteTemplate.update({
        where: { id: createdTemplate.id },
        data: { coverAssetId: template.assets[0].id },
      });
    }
  }

  await seedSchoolPortalContent(prisma);

  console.log(
    "Seeded We Brand Schools landing page content, testimonials, templates, and portal cards.",
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("We Brand Schools seed failed:", error);
  process.exit(1);
});
