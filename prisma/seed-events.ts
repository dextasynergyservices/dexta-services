import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
    }),
  });

  // Check if Dev Day event already exists
  const existing = await prisma.event.findFirst({
    where: { slug: { startsWith: "devs-day" } },
  });

  if (existing) {
    console.log("Dev Day event already migrated. Skipping.");
    await prisma.$disconnect();
    return;
  }

  // Create the Dev Day event
  const event = await prisma.event.create({
    data: {
      title: "Devs Day",
      slug: "devs-day",
      description:
        "An online space where developers connect, share what they've been building, discover new tools, and talk real experiences.",
      dateTime: new Date("2025-07-15T10:00:00Z"),
      location: "Online",
      status: "PUBLISHED",
      formFields: {
        create: [
          {
            name: "role",
            label: "Role",
            type: "SELECT",
            required: true,
            options: JSON.stringify([
              "Frontend Developer",
              "Backend Developer",
              "Full Stack Developer",
              "Mobile Developer",
              "DevOps Engineer",
              "UI/UX Designer",
              "Product Manager",
              "Student",
              "Other",
            ]),
            position: 0,
          },
          {
            name: "stack",
            label: "Tech Stack",
            type: "TEXT",
            placeholder: "e.g. React, Node.js, Python",
            required: false,
            position: 1,
          },
          {
            name: "expectation",
            label: "What are you looking forward to?",
            type: "TEXTAREA",
            placeholder: "Tell us what excites you about Dev Day...",
            required: false,
            position: 2,
          },
          {
            name: "profile",
            label: "GitHub / LinkedIn Profile",
            type: "URL",
            placeholder: "https://github.com/yourname",
            required: false,
            position: 3,
          },
        ],
      },
    },
  });

  console.log(`Created Dev Day event: ${event.id}`);

  // Migrate existing DevsDayRegistration data
  const registrations = await prisma.devsDayRegistration.findMany();
  let migrated = 0;

  for (const reg of registrations) {
    try {
      await prisma.eventRegistration.create({
        data: {
          eventId: event.id,
          email: reg.email,
          name: reg.name,
          status: "ACCEPTED",
          formData: JSON.stringify({
            role: reg.role,
            stack: reg.stack || "",
            expectation: reg.expectation || "",
            profile: reg.profile || "",
          }),
        },
      });
      migrated++;
    } catch {
      // Skip duplicates
      console.warn(`Skipped duplicate: ${reg.email}`);
    }
  }

  console.log(
    `Migrated ${migrated}/${registrations.length} registrations to event system.`,
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Event seed failed:", e);
  process.exit(1);
});
