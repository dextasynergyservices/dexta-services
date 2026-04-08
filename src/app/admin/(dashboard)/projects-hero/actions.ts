"use server";

import { updateTag } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  projectsHeroContentSchema,
  portfolioTabContentSchema,
  type ProjectsHeroContentInput,
  type PortfolioTabContentInput,
} from "@/lib/validators";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionResult = { success: boolean; message: string };

export type ServiceType = "DESIGN" | "BUILD" | "PRINT";

export type ProjectsHeroRow = {
  eyebrow: string;
  headline: string;
  body: string;
  backgroundImagePublicId: string | null;
  ctaText: string;
  ctaHref: string;
  ctaSectionLabel: string;
  ctaSectionHeadline: string;
  ctaSectionBody: string;
  cta2Text: string;
  cta2Href: string;
};

export type PortfolioTabRow = {
  type: ServiceType;
  portfolioEyebrow: string;
  portfolioDescription: string;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const HERO_DEFAULTS: ProjectsHeroRow = {
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
};

const TAB_DEFAULTS: Record<ServiceType, PortfolioTabRow> = {
  DESIGN: {
    type: "DESIGN",
    portfolioEyebrow: "Identity systems, campaigns, and visual direction",
    portfolioDescription:
      "Brand worlds, interfaces, and design systems shaped to feel sharp, intentional, and unmistakably on-message.",
  },
  BUILD: {
    type: "BUILD",
    portfolioEyebrow: "Web platforms, products, and digital experiences",
    portfolioDescription:
      "High-performance sites and software products built to convert, scale, and stay elegant under pressure.",
  },
  PRINT: {
    type: "PRINT",
    portfolioEyebrow: "Physical touchpoints with real-world presence",
    portfolioDescription:
      "Editorial layouts, signage, packaging, and production-ready print work that carries the brand with confidence.",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function revalidate() {
  updateTag("projects-hero-content");
  updateTag("portfolio-content");
}

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getProjectsHeroContent(): Promise<ProjectsHeroRow> {
  try {
    const row = await prisma.projectsHeroContent.findUnique({
      where: { id: 1 },
    });
    if (!row) return HERO_DEFAULTS;
    return {
      eyebrow: row.eyebrow,
      headline: row.headline,
      body: row.body,
      backgroundImagePublicId: row.backgroundImagePublicId ?? null,
      ctaText: row.ctaText,
      ctaHref: row.ctaHref,
      ctaSectionLabel: row.ctaSectionLabel,
      ctaSectionHeadline: row.ctaSectionHeadline,
      ctaSectionBody: row.ctaSectionBody,
      cta2Text: row.cta2Text,
      cta2Href: row.cta2Href,
    };
  } catch {
    return HERO_DEFAULTS;
  }
}

export async function getPortfolioTabContent(): Promise<PortfolioTabRow[]> {
  try {
    const rows = await prisma.serviceContent.findMany({
      orderBy: { type: "asc" },
      select: {
        type: true,
        portfolioEyebrow: true,
        portfolioDescription: true,
      },
    });

    const ORDER: ServiceType[] = ["DESIGN", "BUILD", "PRINT"];
    const rowMap = new Map(rows.map((r) => [r.type as ServiceType, r]));

    return ORDER.map((type) => {
      const row = rowMap.get(type);
      return {
        type,
        portfolioEyebrow:
          row?.portfolioEyebrow || TAB_DEFAULTS[type].portfolioEyebrow,
        portfolioDescription:
          row?.portfolioDescription || TAB_DEFAULTS[type].portfolioDescription,
      };
    });
  } catch {
    return [TAB_DEFAULTS.DESIGN, TAB_DEFAULTS.BUILD, TAB_DEFAULTS.PRINT];
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProjectsHeroContent(
  data: ProjectsHeroContentInput,
): Promise<ActionResult> {
  try {
    await requireAuth();

    const parsed = projectsHeroContentSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    await prisma.projectsHeroContent.upsert({
      where: { id: 1 },
      update: parsed.data,
      create: { id: 1, ...parsed.data },
    });

    revalidate();
    return {
      success: true,
      message: "Portfolio page hero updated successfully",
    };
  } catch (error) {
    console.error("[Update Projects Hero]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update hero content",
    };
  }
}

export async function updatePortfolioTabContent(
  type: ServiceType,
  data: PortfolioTabContentInput,
): Promise<ActionResult> {
  try {
    await requireAuth();

    const parsed = portfolioTabContentSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    await prisma.serviceContent.upsert({
      where: { type },
      update: {
        portfolioEyebrow: parsed.data.portfolioEyebrow,
        portfolioDescription: parsed.data.portfolioDescription,
      },
      create: {
        type,
        title: type,
        description: TAB_DEFAULTS[type].portfolioDescription,
        portfolioEyebrow: parsed.data.portfolioEyebrow,
        portfolioDescription: parsed.data.portfolioDescription,
      },
    });

    revalidate();
    return {
      success: true,
      message: `${type} tab content updated successfully`,
    };
  } catch (error) {
    console.error("[Update Portfolio Tab Content]", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update tab content",
    };
  }
}
