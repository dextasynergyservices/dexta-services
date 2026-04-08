import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
    }),
  });

  // --- Hero Content (singleton, id = 1) ---
  await prisma.heroContent.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      // Images — null means fall back to local /images/* files
      backgroundImagePublicId: null,
      cardFallbackImagePublicId: null,
      eyebrow: "Dexta Synergy Services",
      headline: "Saturating our world with Imprints of value",
      body: "From identity systems to digital products to premium print, we shape launches that feel sharp, connected, and impossible to ignore.",
      ctaText: "See Our Work",
      ctaHref: "/projects",
      stackBadge: "Dexta service stack",
      stackTitle: "Your brand, reimagined",
      stackBody:
        "Design sharper, ship faster, and carry one clear idea from screen to print without losing the visual thread in between.",
      stackCtaText: "Start a Project",
      stackCtaHref: "/contact",
    },
  });
  console.log("Hero content seeded.");

  // --- Hero Cards ---
  const heroCards = [
    {
      id: "hero-card-left",
      position: 0,
      href: "/projects?tab=design",
      imagePublicId: null,
      objectPosition: "center",
      label: "IDENTITY",
      title: "DESIGN",
      chip: "Brand systems",
      badge: "ID",
      metaTitle: "Brand identity",
      metaSubtitle: "Identity / UI / Motion",
      isVisible: true,
    },
    {
      id: "hero-card-center",
      position: 1,
      href: "/projects?tab=build",
      imagePublicId: null,
      objectPosition: "center",
      label: "DIGITAL",
      title: "BUILD",
      chip: "Product launches",
      badge: "WB",
      metaTitle: "Digital engineering",
      metaSubtitle: "Next.js / React / Conversion-first UX",
      isVisible: true,
    },
    {
      id: "hero-card-right",
      position: 2,
      href: "/projects?tab=print",
      imagePublicId: null,
      objectPosition: "center",
      label: "PHYSICAL",
      title: "PRINT",
      chip: "Campaign assets",
      badge: "PR",
      metaTitle: "Print and merch",
      metaSubtitle: "Banners / Packaging / Apparel",
      isVisible: true,
    },
  ];

  for (const card of heroCards) {
    await prisma.heroCard.upsert({
      where: { id: card.id },
      update: {},
      create: card,
    });
  }
  console.log("Hero cards seeded (3 cards).");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Hero seed failed:", e);
  process.exit(1);
});
