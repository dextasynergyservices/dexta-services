import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import {
  projectsHeroDefaults,
  serviceContentDefaults,
} from "./seed-projects-data";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
    }),
  });

  const email = "admin@dexta.services";
  const password = "Dexta123!";
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      name: "Admin",
    },
  });

  for (const service of serviceContentDefaults) {
    await prisma.serviceContent.upsert({
      where: { type: service.type },
      update: service,
      create: service,
    });
  }

  await prisma.projectsHeroContent.upsert({
    where: { id: projectsHeroDefaults.id },
    update: projectsHeroDefaults,
    create: projectsHeroDefaults,
  });

  console.log(`Admin user seeded: ${email}`);
  console.log("Seeded homepage project section defaults.");
  console.log("Seeded projects hero defaults.");
  console.log("IMPORTANT: Change the default password after first login!");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
