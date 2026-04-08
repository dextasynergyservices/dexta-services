import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { ExpressionsSection } from "./expressions-section";

export type ExpressionItem = {
  id: string;
  name: string;
  logoPublicId: string | null;
  description: string;
  websiteUrl: string;
};

async function fetchExpressions(): Promise<ExpressionItem[]> {
  return prisma.expression.findMany({
    where: { isVisible: true },
    orderBy: { position: "asc" },
    select: {
      id: true,
      name: true,
      logoPublicId: true,
      description: true,
      websiteUrl: true,
    },
  });
}

const getCachedExpressions = unstable_cache(
  fetchExpressions,
  ["expressions-content"],
  { tags: ["expressions-content"], revalidate: 60 },
);

export default async function ExpressionsWrapper() {
  const expressions = await (
    process.env.NODE_ENV === "development"
      ? fetchExpressions()
      : getCachedExpressions()
  ).catch(() => [] as ExpressionItem[]);

  if (expressions.length === 0) return null;

  return <ExpressionsSection expressions={expressions} />;
}
