import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

const projectsHero = {
  id: 1,
  eyebrow: "Portfolio selection",
  headline:
    "Work that looks sharp, moves with intent, and lands where it matters.",
  body: "Explore selected projects across design, build, and print — all curated to show how ideas become real, useful, and memorable.",
  backgroundImagePublicId: null,
  ctaText: "Start a Project",
  ctaHref: "/contact",
  ctaSectionLabel: "Start something precise",
  ctaSectionHeadline:
    "If the work feels close to what you need, we should talk.",
  ctaSectionBody:
    "We take ideas from early direction through execution, across digital, print, and the spaces in between.",
  cta2Text: "Explore Services",
  cta2Href: "/#services",
} as const;

const portfolioTabContent = [
  {
    type: "DESIGN" as const,
    portfolioEyebrow: "Identity systems, campaigns, and visual direction",
    portfolioDescription:
      "Brand worlds, interfaces, and design systems shaped to feel sharp, intentional, and unmistakably on-message.",
  },
  {
    type: "BUILD" as const,
    portfolioEyebrow: "Web platforms, products, and digital experiences",
    portfolioDescription:
      "High-performance sites and software products built to convert, scale, and stay elegant under pressure.",
  },
  {
    type: "PRINT" as const,
    portfolioEyebrow: "Physical touchpoints with real-world presence",
    portfolioDescription:
      "Editorial layouts, signage, packaging, and production-ready print work that carries the brand with confidence.",
  },
] as const;

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  // Seed the /projects hero singleton
  await prisma.projectsHeroContent.upsert({
    where: { id: projectsHero.id },
    update: projectsHero,
    create: projectsHero,
  });
  console.log("Seeded ProjectsHeroContent.");

  // Seed portfolio tab content into ServiceContent (upsert preserves existing card fields)
  for (const tab of portfolioTabContent) {
    await prisma.serviceContent.upsert({
      where: { type: tab.type },
      update: {
        portfolioEyebrow: tab.portfolioEyebrow,
        portfolioDescription: tab.portfolioDescription,
      },
      create: {
        type: tab.type,
        title: tab.type,
        description: tab.portfolioDescription,
        portfolioEyebrow: tab.portfolioEyebrow,
        portfolioDescription: tab.portfolioDescription,
      },
    });
    console.log(`Seeded ${tab.type} portfolio tab content.`);
  }

  console.log("Portfolio page seed complete.");
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Portfolio page seed failed:", error);
  process.exit(1);
});
