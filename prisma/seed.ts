import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import {
  ABOUT_EXPERTISE_DEFAULTS,
  ABOUT_MILESTONE_DEFAULTS,
  ABOUT_PAGE_CONTENT_DEFAULTS,
  ABOUT_TEAM_MEMBER_DEFAULTS,
  ABOUT_VALUE_DEFAULTS,
  serializeJsonStringArray,
} from "../src/lib/about-defaults";
import {
  projectsHeroDefaults,
  serviceContentDefaults,
} from "./seed-projects-data";

type SeedPrisma = PrismaClient & {
  aboutPageContent: any;
  aboutMilestone: any;
  aboutExpertiseItem: any;
  aboutTeamMember: any;
  aboutValueItem: any;
};

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
    }),
  }) as SeedPrisma;

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

  const existingAboutContent = await prisma.aboutPageContent.findFirst({
    orderBy: { id: "asc" },
  });
  const aboutContentData = {
    ...ABOUT_PAGE_CONTENT_DEFAULTS,
    storyTrustedItems: serializeJsonStringArray(
      ABOUT_PAGE_CONTENT_DEFAULTS.storyTrustedItems,
    ),
  };

  if (existingAboutContent) {
    await prisma.aboutPageContent.update({
      where: { id: existingAboutContent.id },
      data: aboutContentData,
    });
  } else {
    await prisma.aboutPageContent.create({
      data: aboutContentData,
    });
  }

  await prisma.aboutMilestone.deleteMany();
  await prisma.aboutMilestone.createMany({
    data: ABOUT_MILESTONE_DEFAULTS.map((item) => ({
      year: item.year,
      title: item.title,
      description: item.description,
      isVisible: item.isVisible,
      position: item.position,
    })),
  });

  await prisma.aboutExpertiseItem.deleteMany();
  await prisma.aboutExpertiseItem.createMany({
    data: ABOUT_EXPERTISE_DEFAULTS.map((item) => ({
      icon: item.icon,
      title: item.title,
      description: item.description,
      metricLabel: item.metricLabel,
      metricValue: item.metricValue,
      isVisible: item.isVisible,
      position: item.position,
    })),
  });

  await prisma.aboutTeamMember.deleteMany();
  await prisma.aboutTeamMember.createMany({
    data: ABOUT_TEAM_MEMBER_DEFAULTS.map((item) => ({
      name: item.name,
      role: item.role,
      bio: item.bio,
      expertise: serializeJsonStringArray(item.expertise),
      funFact: item.funFact,
      portfolioUrl: item.portfolioUrl,
      showPortfolioButton: item.showPortfolioButton,
      imagePublicId: item.imagePublicId,
      isVisible: item.isVisible,
      position: item.position,
    })),
  });

  await prisma.aboutValueItem.deleteMany();
  await prisma.aboutValueItem.createMany({
    data: ABOUT_VALUE_DEFAULTS.map((item) => ({
      icon: item.icon,
      title: item.title,
      description: item.description,
      isVisible: item.isVisible,
      position: item.position,
    })),
  });

  console.log(`Admin user seeded: ${email}`);
  console.log("Seeded homepage project section defaults.");
  console.log("Seeded projects hero defaults.");
  console.log("Seeded About page content and cards.");
  console.log("IMPORTANT: Change the default password after first login!");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
