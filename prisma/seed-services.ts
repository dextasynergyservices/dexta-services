import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { serviceContentDefaults } from "./seed-projects-data";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  for (const service of serviceContentDefaults) {
    await prisma.serviceContent.upsert({
      where: { type: service.type },
      update: service,
      create: service,
    });
  }

  console.log("Seeded 3 ServiceContent rows with homepage project defaults.");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
