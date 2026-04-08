import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { DEFAULT_HERO_CONTENT, DEFAULT_HERO_CARDS } from "@/lib/hero-defaults";
import Hero from "./hero";

async function fetchHeroData() {
  const [content, cards] = await Promise.all([
    prisma.heroContent.findUnique({ where: { id: 1 } }),
    prisma.heroCard.findMany({
      where: { isVisible: true },
      orderBy: { position: "asc" },
    }),
  ]);

  return {
    content: content ?? DEFAULT_HERO_CONTENT,
    cards: cards.length > 0 ? cards : DEFAULT_HERO_CARDS,
  };
}

const getCachedHeroData = unstable_cache(fetchHeroData, ["hero-content"], {
  tags: ["hero-content"],
  revalidate: 60,
});

async function getHeroData() {
  if (process.env.NODE_ENV === "development") {
    return fetchHeroData();
  }

  return getCachedHeroData();
}

// ─── Server component ─────────────────────────────────────────────────────────
export default async function HeroWrapper() {
  const heroData = await getHeroData().catch((error) => {
    const message =
      error instanceof Error ? error.message : "Unknown database error";

    console.warn(
      `[HeroWrapper] Falling back to default hero content because the database is unavailable: ${message}`,
    );

    return {
      content: DEFAULT_HERO_CONTENT,
      cards: DEFAULT_HERO_CARDS,
    };
  });

  return <Hero content={heroData.content} cards={heroData.cards} />;
}
