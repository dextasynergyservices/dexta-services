"use server";

import { updateTag } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { manifestoSchema, type ManifestoInput } from "@/lib/validators";

const DEFAULT_TEXT =
  "IF YOU'VE GOT A VISION, WE'VE GOT THE CREATIVE AUDACITY";

type ActionResult = { success: boolean; message: string };

function revalidateManifesto() {
  updateTag("manifesto-content");
}

export async function getManifestoContent(): Promise<string> {
  try {
    const row = await prisma.manifestoContent.findUnique({ where: { id: 1 } });
    return row?.text ?? DEFAULT_TEXT;
  } catch {
    return DEFAULT_TEXT;
  }
}

export async function updateManifestoContent(
  data: ManifestoInput,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    const parsed = manifestoSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Validation failed",
      };
    }

    await prisma.manifestoContent.upsert({
      where: { id: 1 },
      update: { text: parsed.data.text },
      create: { id: 1, text: parsed.data.text },
    });

    revalidateManifesto();
    return { success: true, message: "Manifesto updated successfully" };
  } catch (error) {
    console.error("[Update Manifesto Content]", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update manifesto",
    };
  }
}
