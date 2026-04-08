import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  await prisma.manifestoContent.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      text: "IF YOU'VE GOT A VISION, WE'VE GOT THE CREATIVE AUDACITY",
    },
  });

  console.log("Manifesto content seeded.");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
