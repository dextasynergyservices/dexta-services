import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import TextParallaxSection from "./textParallaxSection";

const DEFAULT_TEXT = "IF YOU'VE GOT A VISION, WE'VE GOT THE CREATIVE AUDACITY";

async function fetchManifestoText(): Promise<string> {
  const row = await prisma.manifestoContent.findUnique({ where: { id: 1 } });
  return row?.text ?? DEFAULT_TEXT;
}

const getCachedManifestoText = unstable_cache(
  fetchManifestoText,
  ["manifesto-content"],
  { tags: ["manifesto-content"], revalidate: 60 },
);

export default async function ManifestoWrapper() {
  const text = await (
    process.env.NODE_ENV === "development"
      ? fetchManifestoText()
      : getCachedManifestoText()
  ).catch(() => DEFAULT_TEXT);

  return <TextParallaxSection text={text} />;
}
