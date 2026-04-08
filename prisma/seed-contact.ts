import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  CONTACT_PAGE_CONTENT_DEFAULTS,
  CONTACT_SOCIAL_DEFAULTS,
} from "../src/lib/contact-defaults";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  await prisma.contactPageContent.upsert({
    where: { id: 1 },
    update: {
      homeEyebrow: CONTACT_PAGE_CONTENT_DEFAULTS.homeEyebrow,
      homeTitle: CONTACT_PAGE_CONTENT_DEFAULTS.homeTitle,
      homeBody: CONTACT_PAGE_CONTENT_DEFAULTS.homeBody,
      homeCtaText: CONTACT_PAGE_CONTENT_DEFAULTS.homeCtaText,
      homeCtaHref: CONTACT_PAGE_CONTENT_DEFAULTS.homeCtaHref,
      heroEyebrow: CONTACT_PAGE_CONTENT_DEFAULTS.heroEyebrow,
      heroTitle: CONTACT_PAGE_CONTENT_DEFAULTS.heroTitle,
      heroBody: CONTACT_PAGE_CONTENT_DEFAULTS.heroBody,
      infoEyebrow: CONTACT_PAGE_CONTENT_DEFAULTS.infoEyebrow,
      infoTitle: CONTACT_PAGE_CONTENT_DEFAULTS.infoTitle,
      infoBody: CONTACT_PAGE_CONTENT_DEFAULTS.infoBody,
      formEyebrow: CONTACT_PAGE_CONTENT_DEFAULTS.formEyebrow,
      formTitle: CONTACT_PAGE_CONTENT_DEFAULTS.formTitle,
      formBody: CONTACT_PAGE_CONTENT_DEFAULTS.formBody,
      addressLabel: CONTACT_PAGE_CONTENT_DEFAULTS.addressLabel,
      address: CONTACT_PAGE_CONTENT_DEFAULTS.address,
      emailLabel: CONTACT_PAGE_CONTENT_DEFAULTS.emailLabel,
      emails: JSON.stringify(CONTACT_PAGE_CONTENT_DEFAULTS.emails),
      phoneLabel: CONTACT_PAGE_CONTENT_DEFAULTS.phoneLabel,
      phones: JSON.stringify(CONTACT_PAGE_CONTENT_DEFAULTS.phones),
      socialsLabel: CONTACT_PAGE_CONTENT_DEFAULTS.socialsLabel,
    },
    create: {
      id: 1,
      homeEyebrow: CONTACT_PAGE_CONTENT_DEFAULTS.homeEyebrow,
      homeTitle: CONTACT_PAGE_CONTENT_DEFAULTS.homeTitle,
      homeBody: CONTACT_PAGE_CONTENT_DEFAULTS.homeBody,
      homeCtaText: CONTACT_PAGE_CONTENT_DEFAULTS.homeCtaText,
      homeCtaHref: CONTACT_PAGE_CONTENT_DEFAULTS.homeCtaHref,
      heroEyebrow: CONTACT_PAGE_CONTENT_DEFAULTS.heroEyebrow,
      heroTitle: CONTACT_PAGE_CONTENT_DEFAULTS.heroTitle,
      heroBody: CONTACT_PAGE_CONTENT_DEFAULTS.heroBody,
      infoEyebrow: CONTACT_PAGE_CONTENT_DEFAULTS.infoEyebrow,
      infoTitle: CONTACT_PAGE_CONTENT_DEFAULTS.infoTitle,
      infoBody: CONTACT_PAGE_CONTENT_DEFAULTS.infoBody,
      formEyebrow: CONTACT_PAGE_CONTENT_DEFAULTS.formEyebrow,
      formTitle: CONTACT_PAGE_CONTENT_DEFAULTS.formTitle,
      formBody: CONTACT_PAGE_CONTENT_DEFAULTS.formBody,
      addressLabel: CONTACT_PAGE_CONTENT_DEFAULTS.addressLabel,
      address: CONTACT_PAGE_CONTENT_DEFAULTS.address,
      emailLabel: CONTACT_PAGE_CONTENT_DEFAULTS.emailLabel,
      emails: JSON.stringify(CONTACT_PAGE_CONTENT_DEFAULTS.emails),
      phoneLabel: CONTACT_PAGE_CONTENT_DEFAULTS.phoneLabel,
      phones: JSON.stringify(CONTACT_PAGE_CONTENT_DEFAULTS.phones),
      socialsLabel: CONTACT_PAGE_CONTENT_DEFAULTS.socialsLabel,
    },
  });

  await prisma.contactSocialLink.deleteMany();
  await prisma.contactSocialLink.createMany({
    data: CONTACT_SOCIAL_DEFAULTS.map((item) => ({
      platform: item.platform,
      label: item.label,
      href: item.href,
      isVisible: item.isVisible,
      position: item.position,
    })),
  });

  console.log("Seeded Contact page content and social links.");

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Contact seed failed:", error);
  process.exit(1);
});
