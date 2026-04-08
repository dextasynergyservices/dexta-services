import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { projectsHeroDefaults } from "./seed-projects-data";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  await prisma.projectsHeroContent.upsert({
    where: { id: projectsHeroDefaults.id },
    update: projectsHeroDefaults,
    create: projectsHeroDefaults,
  });

  console.log("Seeded ProjectsHeroContent singleton.");

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Projects hero seed failed:", error);
  process.exit(1);
});
