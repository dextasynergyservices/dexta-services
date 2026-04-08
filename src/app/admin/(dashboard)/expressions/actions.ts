"use server";

import { updateTag } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { expressionSchema, type ExpressionInput } from "@/lib/validators";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionResult = { success: boolean; message: string };

export type ExpressionRow = {
  id: string;
  name: string;
  logoPublicId: string | null;
  description: string;
  websiteUrl: string;
  position: number;
  isVisible: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

function revalidateExpressions() {
  updateTag("expressions-content");
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getExpressions(): Promise<ExpressionRow[]> {
  try {
    return await prisma.expression.findMany({
      orderBy: { position: "asc" },
      select: {
        id: true,
        name: true,
        logoPublicId: true,
        description: true,
        websiteUrl: true,
        position: true,
        isVisible: true,
      },
    });
  } catch (error) {
    console.warn("[Get Expressions] Failed to fetch:", error);
    return [];
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createExpression(
  data: ExpressionInput,
): Promise<ActionResult> {
  try {
    await requireAuth();

    const parsed = expressionSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    const last = await prisma.expression.findFirst({
      orderBy: { position: "desc" },
      select: { position: true },
    });
    const position = last ? last.position + 1 : 0;

    await prisma.expression.create({
      data: { ...parsed.data, position },
    });

    revalidateExpressions();
    return { success: true, message: "Expression created successfully" };
  } catch (error) {
    console.error("[Create Expression]", error);
    return { success: false, message: "Failed to create expression" };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateExpression(
  id: string,
  data: ExpressionInput,
): Promise<ActionResult> {
  try {
    await requireAuth();

    const parsed = expressionSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    await prisma.expression.update({ where: { id }, data: parsed.data });

    revalidateExpressions();
    return { success: true, message: "Expression updated successfully" };
  } catch (error) {
    console.error("[Update Expression]", error);
    return { success: false, message: "Failed to update expression" };
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteExpression(id: string): Promise<ActionResult> {
  try {
    await requireAuth();

    await prisma.expression.delete({ where: { id } });

    revalidateExpressions();
    return { success: true, message: "Expression deleted successfully" };
  } catch (error) {
    console.error("[Delete Expression]", error);
    return { success: false, message: "Failed to delete expression" };
  }
}

// ─── Reorder ──────────────────────────────────────────────────────────────────

export async function reorderExpressions(
  orderedIds: string[],
): Promise<ActionResult> {
  try {
    await requireAuth();

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.expression.update({
          where: { id },
          data: { position: index },
        }),
      ),
    );

    revalidateExpressions();
    return { success: true, message: "Expressions reordered successfully" };
  } catch (error) {
    console.error("[Reorder Expressions]", error);
    return { success: false, message: "Failed to reorder expressions" };
  }
}
