"use server";

import { updateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { sanitizeHeroContentInput } from "@/lib/hero-rich-text.server";
import type { HeroContent, HeroCard } from "@/lib/hero-types";
import prisma from "@/lib/prisma";
import {
  heroContentSchema,
  heroCardSchema,
  type HeroContentInput,
  type HeroCardInput,
} from "@/lib/validators";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionResult = { success: boolean; message: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function logHeroReadWarning(scope: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  console.warn(
    `[${scope}] Falling back because hero data could not be read: ${message}`,
  );
}

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

function revalidateHero() {
  updateTag("hero-content");
}

// ─── Get Hero Content ─────────────────────────────────────────────────────────

export async function getHeroContent(): Promise<HeroContent | null> {
  try {
    return await prisma.heroContent.findUnique({ where: { id: 1 } });
  } catch (error) {
    logHeroReadWarning("Get Hero Content", error);
    return null;
  }
}

export async function getHeroAdminData(): Promise<{
  cards: HeroCard[];
  content: HeroContent | null;
}> {
  try {
    const [content, cards] = await Promise.all([
      prisma.heroContent.findUnique({ where: { id: 1 } }),
      prisma.heroCard.findMany({ orderBy: { position: "asc" } }),
    ]);

    return { cards, content };
  } catch (error) {
    logHeroReadWarning("Get Hero Admin Data", error);
    return { cards: [], content: null };
  }
}

// ─── Update Hero Content ──────────────────────────────────────────────────────

export async function updateHeroContent(
  data: HeroContentInput,
): Promise<ActionResult> {
  try {
    await requireAuth();

    const parsed = heroContentSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    const sanitizedData = sanitizeHeroContentInput(parsed.data);

    await prisma.heroContent.upsert({
      where: { id: 1 },
      update: sanitizedData,
      create: { id: 1, ...sanitizedData },
    });

    revalidateHero();
    return { success: true, message: "Hero content updated successfully" };
  } catch (error) {
    console.error("[Update Hero Content]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update hero content",
    };
  }
}

// ─── Get Hero Cards ───────────────────────────────────────────────────────────

export async function getHeroCards(): Promise<HeroCard[]> {
  try {
    return await prisma.heroCard.findMany({ orderBy: { position: "asc" } });
  } catch (error) {
    logHeroReadWarning("Get Hero Cards", error);
    return [];
  }
}

// ─── Create Hero Card ─────────────────────────────────────────────────────────

export async function createHeroCard(
  data: HeroCardInput,
): Promise<ActionResult> {
  try {
    await requireAuth();

    const parsed = heroCardSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    // Place the new card after the last existing one
    const lastCard = await prisma.heroCard.findFirst({
      orderBy: { position: "desc" },
    });
    const position = lastCard ? lastCard.position + 1 : 0;

    await prisma.heroCard.create({ data: { ...parsed.data, position } });

    revalidateHero();
    return { success: true, message: "Card created successfully" };
  } catch (error) {
    console.error("[Create Hero Card]", error);
    return { success: false, message: "Failed to create card" };
  }
}

// ─── Update Hero Card ─────────────────────────────────────────────────────────

export async function updateHeroCard(
  id: string,
  data: HeroCardInput,
): Promise<ActionResult> {
  try {
    await requireAuth();

    const parsed = heroCardSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    await prisma.heroCard.update({ where: { id }, data: parsed.data });

    revalidateHero();
    return { success: true, message: "Card updated successfully" };
  } catch (error) {
    console.error("[Update Hero Card]", error);
    return { success: false, message: "Failed to update card" };
  }
}

// ─── Delete Hero Card ─────────────────────────────────────────────────────────

export async function deleteHeroCard(id: string): Promise<ActionResult> {
  try {
    await requireAuth();

    await prisma.heroCard.delete({ where: { id } });

    revalidateHero();
    return { success: true, message: "Card deleted successfully" };
  } catch (error) {
    console.error("[Delete Hero Card]", error);
    return { success: false, message: "Failed to delete card" };
  }
}

// ─── Reorder Hero Cards ───────────────────────────────────────────────────────

export async function reorderHeroCards(
  orderedIds: string[],
): Promise<ActionResult> {
  try {
    await requireAuth();

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.heroCard.update({
          where: { id },
          data: { position: index },
        }),
      ),
    );

    revalidateHero();
    return { success: true, message: "Cards reordered successfully" };
  } catch (error) {
    console.error("[Reorder Hero Cards]", error);
    return { success: false, message: "Failed to reorder cards" };
  }
}
