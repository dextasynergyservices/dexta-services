import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
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

  console.log(`Admin user seeded: ${email}`);
  console.log("IMPORTANT: Change the default password after first login!");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
