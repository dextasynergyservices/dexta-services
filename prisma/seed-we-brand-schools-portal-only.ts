import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedSchoolPortalContent } from "./seed-we-brand-schools-portal";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  await seedSchoolPortalContent(prisma);

  console.log("Seeded We Brand Schools portal section and starter cards.");

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("We Brand Schools portal seed failed:", error);
  process.exit(1);
});
