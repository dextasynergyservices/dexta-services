"use server";

import { updateTag } from "next/cache";
import { auth } from "@/lib/auth";
import {
  getProjectSectionDefaultCardColor,
  resolveProjectSectionCardColor,
} from "@/lib/project-section";
import prisma from "@/lib/prisma";
import {
  projectSectionBackgroundSchema,
  serviceContentSchema,
  type ProjectSectionBackgroundInput,
  type ServiceContentInput,
} from "@/lib/validators";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionResult = { success: boolean; message: string };

export type ServiceType = "DESIGN" | "BUILD" | "PRINT";

export type ServiceContentRow = {
  id: string;
  type: ServiceType;
  title: string;
  description: string;
  iconPublicId: string | null;
  cardColor: string;
};

// ─── Defaults (fallback when DB unavailable) ──────────────────────────────────

const DEFAULTS: Record<ServiceType, ServiceContentRow> = {
  DESIGN: {
    id: "default-design",
    type: "DESIGN",
    title: "DESIGN",
    description:
      "Visual Domination. We don't just make things pretty — we make them impossible to ignore.",
    iconPublicId: null,
    cardColor: getProjectSectionDefaultCardColor("DESIGN"),
  },
  BUILD: {
    id: "default-build",
    type: "BUILD",
    title: "BUILD",
    description:
      "Digital Engineering. Websites and software that work as hard as you do and look better doing it.",
    iconPublicId: null,
    cardColor: getProjectSectionDefaultCardColor("BUILD"),
  },
  PRINT: {
    id: "default-print",
    type: "PRINT",
    title: "PRINT",
    description:
      "Ink That Speaks. From paper to billboard, we put your brand in the real world, loud and proud.",
    iconPublicId: null,
    cardColor: getProjectSectionDefaultCardColor("PRINT"),
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function revalidateProjectSection() {
  updateTag("services-content");
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getServicesContent(): Promise<ServiceContentRow[]> {
  try {
    const rows = await prisma.serviceContent.findMany({
      orderBy: { type: "asc" },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        iconPublicId: true,
        cardColor: true,
      },
    });

    // Ensure all 3 types are always returned, falling back to defaults for missing rows
    const ORDER: ServiceType[] = ["DESIGN", "BUILD", "PRINT"];

    const rowMap = new Map(
      rows.map((row) => [
        row.type as ServiceType,
        {
          id: row.id,
          type: row.type as ServiceType,
          title: row.title,
          description: row.description,
          iconPublicId: row.iconPublicId,
          cardColor: resolveProjectSectionCardColor(
            row.type as ServiceType,
            row.cardColor,
          ),
        } satisfies ServiceContentRow,
      ]),
    );

    return ORDER.map((type) => rowMap.get(type) ?? DEFAULTS[type]);
  } catch {
    return [DEFAULTS.DESIGN, DEFAULTS.BUILD, DEFAULTS.PRINT];
  }
}

export async function getProjectSectionBackgroundImage(): Promise<
  string | null
> {
  try {
    const row = await prisma.serviceContent.findFirst({
      where: {
        backgroundImagePublicId: {
          not: null,
        },
      },
      orderBy: { type: "asc" },
      select: {
        backgroundImagePublicId: true,
      },
    });

    return row?.backgroundImagePublicId ?? null;
  } catch {
    return null;
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateServiceContent(
  type: ServiceType,
  data: ServiceContentInput,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const parsed = serviceContentSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    await prisma.serviceContent.upsert({
      where: { type },
      update: parsed.data,
      create: { type, ...parsed.data },
    });

    revalidateProjectSection();
    return {
      success: true,
      message: `${type} project section updated successfully`,
    };
  } catch (error) {
    console.error("[Update Service Content]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update project section",
    };
  }
}

export async function updateProjectSectionBackgroundImage(
  data: ProjectSectionBackgroundInput,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const parsed = projectSectionBackgroundSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    const serviceTypes: ServiceType[] = ["DESIGN", "BUILD", "PRINT"];

    await prisma.$transaction(
      serviceTypes.map((type) =>
        prisma.serviceContent.upsert({
          where: { type },
          update: {
            backgroundImagePublicId:
              parsed.data.backgroundImagePublicId ?? null,
          },
          create: {
            ...DEFAULTS[type],
            type,
            backgroundImagePublicId:
              parsed.data.backgroundImagePublicId ?? null,
          },
        }),
      ),
    );

    revalidateProjectSection();
    return {
      success: true,
      message: "Project section background updated successfully",
    };
  } catch (error) {
    console.error("[Update Project Section Background]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update project section background",
    };
  }
}
