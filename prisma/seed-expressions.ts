import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

const expressions = [
  {
    name: "Example Project One",
    logoPublicId: null,
    description:
      "A brief description of what was built or designed for this client — the problem solved, the outcome delivered.",
    websiteUrl: "https://example.com",
    position: 0,
    isVisible: true,
  },
  {
    name: "Example Project Two",
    logoPublicId: null,
    description:
      "Another brief description of the work done — keep it punchy and outcome-focused.",
    websiteUrl: "https://example.com",
    position: 1,
    isVisible: true,
  },
];

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  for (const expression of expressions) {
    await prisma.expression.create({ data: expression });
  }

  console.log(`Seeded ${expressions.length} expressions.`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
