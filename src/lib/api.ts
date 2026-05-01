import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { aboutPrisma } from "@/lib/about-prisma";
import {
  listSchoolWebsiteTestimonials,
  weBrandSchoolsPrisma,
} from "@/lib/we-brand-schools-prisma";
import { getCloudinaryPublicId } from "./cloudinary";
import {
  ABOUT_CONTENT_TAG,
  ABOUT_EXPERTISE_TAG,
  ABOUT_MILESTONES_TAG,
  ABOUT_SPACE_TAG,
  ABOUT_TEAM_TAG,
  ABOUT_VALUES_TAG,
} from "./about-cache";
import {
  ABOUT_EXPERTISE_DEFAULTS,
  ABOUT_MILESTONE_DEFAULTS,
  ABOUT_PAGE_CONTENT_DEFAULTS,
  ABOUT_TEAM_MEMBER_DEFAULTS,
  ABOUT_VALUE_DEFAULTS,
  parseJsonStringArray as parseAboutJsonStringArray,
  type AboutExpertiseItemData,
  type AboutIconKey,
  type AboutMilestoneData,
  type AboutPageContentData,
  type AboutSpaceItemData,
  type AboutTeamMemberData,
  type AboutValueItemData,
} from "./about-defaults";
import {
  CONTACT_PAGE_CONTENT_DEFAULTS,
  parseJsonStringArray as parseContactJsonStringArray,
  type ContactPageContentData,
  type ContactSocialLinkData,
  type ContactSocialPlatform,
} from "./contact-defaults";
import { CONTACT_CONTENT_TAG, CONTACT_SOCIALS_TAG } from "./contact-cache";
import {
  OFFERS_AUDIENCE_ORDER,
  OFFERS_PAGE_CONTENT_DEFAULTS,
  parseJsonStringArray,
  type AudienceColor,
  type BillingDuration,
  type OffersAudienceType,
  type OffersPageContentData,
} from "./offers-defaults";
import {
  SCHOOL_PORTAL_CARDS_TAG,
  SCHOOL_PORTAL_SECTION_TAG,
  WE_BRAND_SCHOOLS_CONTENT_TAG,
} from "./we-brand-schools-cache";
import {
  SCHOOL_PORTAL_SECTION_CONTENT_DEFAULTS,
  WE_BRAND_SCHOOLS_PAGE_CONTENT_DEFAULTS,
  parseJsonStringArray as parseWeBrandSchoolsJsonStringArray,
  type SchoolPortalFeatureCardData,
  type SchoolPortalSectionContentData,
  type SchoolWebsiteTestimonialData,
  type SchoolWebsiteTemplateData,
  withSchoolPortalSectionContentDefaults,
  type WeBrandSchoolsPageContentData,
  withWeBrandSchoolsPageContentDefaults,
} from "./we-brand-schools-defaults";
import { resolveProjectSectionCardColor } from "./project-section";

export const PORTFOLIO_TABS = ["design", "build", "print"] as const;

export type OffersServiceType = "DESIGN" | "BUILD" | "PRINT";

export type OffersServiceCardData = {
  id: string;
  type: OffersServiceType;
  title: string;
  description: string;
  iconPublicId: string | null;
  cardColor: string;
};

const OFFERS_SERVICE_ORDER: OffersServiceType[] = ["DESIGN", "BUILD", "PRINT"];

const OFFERS_SERVICE_DEFAULTS: Record<
  OffersServiceType,
  OffersServiceCardData
> = {
  DESIGN: {
    id: "default-design",
    type: "DESIGN",
    title: "DESIGN",
    description:
      "Visual Domination. We don't just make things pretty — we make them impossible to ignore.",
    iconPublicId: null,
    cardColor: resolveProjectSectionCardColor("DESIGN", null),
  },
  BUILD: {
    id: "default-build",
    type: "BUILD",
    title: "BUILD",
    description:
      "Digital Engineering. Websites and software that work as hard as you do and look better doing it.",
    iconPublicId: null,
    cardColor: resolveProjectSectionCardColor("BUILD", null),
  },
  PRINT: {
    id: "default-print",
    type: "PRINT",
    title: "PRINT",
    description:
      "Ink That Speaks. From paper to billboard, we put your brand in the real world, loud and proud.",
    iconPublicId: null,
    cardColor: resolveProjectSectionCardColor("PRINT", null),
  },
};

async function readOffersServiceCards(): Promise<OffersServiceCardData[]> {
  try {
    const rows = await prisma.serviceContent.findMany({
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        iconPublicId: true,
        cardColor: true,
      },
    });

    const rowMap = new Map(
      rows.map((row) => [
        row.type as OffersServiceType,
        {
          id: row.id,
          type: row.type as OffersServiceType,
          title: row.title,
          description: row.description,
          iconPublicId: row.iconPublicId,
          cardColor: resolveProjectSectionCardColor(
            row.type as OffersServiceType,
            row.cardColor,
          ),
        } satisfies OffersServiceCardData,
      ]),
    );

    return OFFERS_SERVICE_ORDER.map(
      (type) => rowMap.get(type) ?? OFFERS_SERVICE_DEFAULTS[type],
    );
  } catch {
    return OFFERS_SERVICE_ORDER.map((type) => OFFERS_SERVICE_DEFAULTS[type]);
  }
}

const fetchOffersServiceCardsCached = unstable_cache(
  readOffersServiceCards,
  ["offers-service-cards"],
  { tags: ["services-content"] },
);

export async function fetchOffersServiceCards(): Promise<
  OffersServiceCardData[]
> {
  return fetchOffersServiceCardsCached();
}

// ─── Projects Hero & Tab Content ─────────────────────────────────────────────

export type ProjectsHeroData = {
  eyebrow: string;
  headline: string;
  body: string;
  backgroundImagePublicId: string | null;
  ctaText: string;
  ctaHref: string;
  ctaSectionLabel: string;
  ctaSectionHeadline: string;
  ctaSectionBody: string;
  cta2Text: string;
  cta2Href: string;
};

export type PortfolioTabContentMap = Record<
  PortfolioTab,
  { portfolioEyebrow: string; portfolioDescription: string }
>;

const PROJECTS_HERO_DEFAULTS: ProjectsHeroData = {
  eyebrow: "Portfolio selection",
  headline:
    "Work that looks sharp, moves with intent, and lands where it matters.",
  body: "Explore selected projects across design, build, and print — all curated to show how ideas become real, useful, and memorable.",
  backgroundImagePublicId: null,
  ctaText: "Start a Project",
  ctaHref: "/contact",
  ctaSectionLabel: "Start something precise",
  ctaSectionHeadline:
    "If the work feels close to what you need, we should talk.",
  ctaSectionBody:
    "We take ideas from early direction through execution, across digital, print, and the spaces in between.",
  cta2Text: "Explore Services",
  cta2Href: "/#services",
};

const PORTFOLIO_TAB_CONTENT_DEFAULTS: PortfolioTabContentMap = {
  design: {
    portfolioEyebrow: "Identity systems, campaigns, and visual direction",
    portfolioDescription:
      "Brand worlds, interfaces, and design systems shaped to feel sharp, intentional, and unmistakably on-message.",
  },
  build: {
    portfolioEyebrow: "Web platforms, products, and digital experiences",
    portfolioDescription:
      "High-performance sites and software products built to convert, scale, and stay elegant under pressure.",
  },
  print: {
    portfolioEyebrow: "Physical touchpoints with real-world presence",
    portfolioDescription:
      "Editorial layouts, signage, packaging, and production-ready print work that carries the brand with confidence.",
  },
};

export async function fetchProjectsHeroContent(): Promise<ProjectsHeroData> {
  try {
    const row = await prisma.projectsHeroContent.findUnique({
      where: { id: 1 },
    });
    if (!row) return PROJECTS_HERO_DEFAULTS;
    return {
      eyebrow: row.eyebrow,
      headline: row.headline,
      body: row.body,
      backgroundImagePublicId: row.backgroundImagePublicId ?? null,
      ctaText: row.ctaText,
      ctaHref: row.ctaHref,
      ctaSectionLabel: row.ctaSectionLabel,
      ctaSectionHeadline: row.ctaSectionHeadline,
      ctaSectionBody: row.ctaSectionBody,
      cta2Text: row.cta2Text,
      cta2Href: row.cta2Href,
    };
  } catch {
    return PROJECTS_HERO_DEFAULTS;
  }
}

export async function fetchPortfolioTabContent(): Promise<PortfolioTabContentMap> {
  try {
    const rows = await prisma.serviceContent.findMany({
      select: {
        type: true,
        portfolioEyebrow: true,
        portfolioDescription: true,
      },
    });

    const result: PortfolioTabContentMap = {
      ...PORTFOLIO_TAB_CONTENT_DEFAULTS,
    };

    for (const row of rows) {
      const tab = SERVICE_TYPE_TO_TAB[row.type as PortfolioServiceType];
      result[tab] = {
        portfolioEyebrow:
          row.portfolioEyebrow ||
          PORTFOLIO_TAB_CONTENT_DEFAULTS[tab].portfolioEyebrow,
        portfolioDescription:
          row.portfolioDescription ||
          PORTFOLIO_TAB_CONTENT_DEFAULTS[tab].portfolioDescription,
      };
    }

    return result;
  } catch {
    return PORTFOLIO_TAB_CONTENT_DEFAULTS;
  }
}

export type PortfolioTab = (typeof PORTFOLIO_TABS)[number];
export type PortfolioServiceType = "DESIGN" | "BUILD" | "PRINT";
export type PortfolioMediaType = "IMAGE" | "VIDEO";

export type PortfolioAsset = {
  id: string;
  publicId: string;
  mediaType: PortfolioMediaType;
  thumbnailPublicId: string | null;
  caption: string | null;
  position: number;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  serviceType: PortfolioServiceType;
  serviceLabel: string;
  tab: PortfolioTab;
  mediaType: PortfolioMediaType;
  mediaPublicId: string;
  thumbnailPublicId: string | null;
  websiteUrl: string | null;
  coverAssetId: string | null;
  position: number;
  assets: PortfolioAsset[];
};

export type PortfolioTabCounts = Record<PortfolioTab, number>;

const TAB_TO_SERVICE_TYPE: Record<PortfolioTab, PortfolioServiceType> = {
  design: "DESIGN",
  build: "BUILD",
  print: "PRINT",
};

const SERVICE_TYPE_TO_TAB: Record<PortfolioServiceType, PortfolioTab> = {
  DESIGN: "design",
  BUILD: "build",
  PRINT: "print",
};

const SERVICE_TYPE_LABEL: Record<PortfolioServiceType, string> = {
  DESIGN: "Design",
  BUILD: "Build",
  PRINT: "Print",
};

function parseTags(tags: string): string[] {
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function normalizePortfolioTab(tab?: string | null): PortfolioTab {
  const normalized = tab?.toLowerCase();

  return PORTFOLIO_TABS.find((value) => value === normalized) ?? "design";
}

export function portfolioTabToServiceType(
  tab: PortfolioTab,
): PortfolioServiceType {
  return TAB_TO_SERVICE_TYPE[tab];
}

export async function fetchPortfolioItems(
  serviceType?: PortfolioServiceType,
): Promise<PortfolioItem[]> {
  const rows = await prisma.portfolioItem.findMany({
    where: {
      isVisible: true,
      ...(serviceType ? { serviceType } : {}),
    },
    orderBy: [{ position: "asc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      tags: true,
      serviceType: true,
      mediaType: true,
      mediaPublicId: true,
      thumbnailPublicId: true,
      websiteUrl: true,
      coverAssetId: true,
      position: true,
      assets: {
        orderBy: { position: "asc" as const },
        select: {
          id: true,
          publicId: true,
          mediaType: true,
          thumbnailPublicId: true,
          caption: true,
          position: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    tags: parseTags(row.tags),
    serviceType: row.serviceType,
    serviceLabel: SERVICE_TYPE_LABEL[row.serviceType],
    tab: SERVICE_TYPE_TO_TAB[row.serviceType],
    mediaType: row.mediaType,
    mediaPublicId: row.mediaPublicId,
    thumbnailPublicId: row.thumbnailPublicId,
    websiteUrl: row.websiteUrl ?? null,
    coverAssetId: row.coverAssetId ?? null,
    position: row.position,
    assets: row.assets,
  }));
}

export async function fetchPortfolioTabCounts(): Promise<PortfolioTabCounts> {
  const counts = await prisma.portfolioItem.groupBy({
    by: ["serviceType"],
    where: { isVisible: true },
    _count: true,
  });

  const result: PortfolioTabCounts = {
    design: 0,
    build: 0,
    print: 0,
  };

  for (const row of counts) {
    result[SERVICE_TYPE_TO_TAB[row.serviceType]] = row._count;
  }

  return result;
}

// ─── Offers Page ──────────────────────────────────────────────────────────────

// ── Offers Page types ─────────────────────────────────────────────────────────

export type PlanBillingOptionData = {
  id: string;
  duration: BillingDuration;
  priceNGN: number | null;
  priceUSD: number | null;
  label: string | null;
  isDefault: boolean;
  position: number;
};

export type OffersPlanData = {
  id: string;
  name: string;
  subtitle: string | null;
  imagePublicId: string | null;
  features: string[];
  billingEnabled: boolean;
  isHighlighted: boolean;
  highlightBgColor: string | null;
  highlightTextColor: string | null;
  position: number;
  billingOptions: PlanBillingOptionData[];
};

export type OffersGroupData = {
  id: string;
  name: string;
  description: string | null;
  position: number;
  plans: OffersPlanData[];
};

export type OffersAudienceData = {
  type: OffersAudienceType;
  tabLabel: string;
  emptyTitle: string;
  emptyBody: string;
  color: AudienceColor;
  isVisible: boolean;
  updatedAt: Date;
};

export const OFFERS_AUDIENCE_SLUGS = [
  "for-you",
  "business",
  "schools",
  "churches",
] as const;

export type OffersAudienceSlug = (typeof OFFERS_AUDIENCE_SLUGS)[number];

export type OffersAudiencePanelData = {
  type: OffersAudienceType;
  slug: OffersAudienceSlug;
  tabLabel: string;
  emptyTitle: string;
  emptyBody: string;
  color: AudienceColor;
  offerGroups: OffersGroupData[];
};

export type UnifiedOffersPageProps = {
  content: OffersPageContentData;
  services: OffersServiceCardData[];
  audiences: OffersAudiencePanelData[];
  initialAudience: OffersAudienceSlug;
  offersWhatsAppHref: string | null;
};

type SqlOffersAudienceRow = {
  type: string;
  tabLabel: string;
  emptyTitle: string;
  emptyBody: string;
  color: string;
  isVisible: boolean;
  updatedAt: Date;
};

type SqlOffersGroupRow = {
  id: string;
  name: string;
  description: string | null;
  position: number;
};

type SqlOffersPlanRow = {
  id: string;
  offerGroupId: string;
  name: string;
  subtitle: string | null;
  imagePublicId: string | null;
  features: string;
  billingEnabled: boolean;
  isHighlighted: boolean;
  highlightBgColor: string | null;
  highlightTextColor: string | null;
  position: number;
};

type SqlOffersBillingRow = {
  id: string;
  planId: string;
  duration: string;
  priceNGN: number | null;
  priceUSD: number | null;
  label: string | null;
  isDefault: boolean;
  position: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeStoredCloudinaryValue(value: string | null | undefined) {
  return value ? (getCloudinaryPublicId(value) ?? value) : null;
}

function normalizeOfferCtaText(value: string) {
  return value === "Choose Plan" ? "Choose Offer" : value;
}

function normalizeHeroOfferText(value: string) {
  return value === "Explore Plans" ? "Explore Offers" : value;
}

function normalizeAudienceSectionBody(value: string) {
  return value ===
    "Whether you're scaling a business, building a school's reputation, or growing a faith community — we have a plan designed specifically for your context."
    ? "Whether you're scaling a business, building a school's reputation, or growing a faith community — we have an offer designed specifically for your context."
    : value;
}

const AUDIENCE_TYPE_TO_SLUG: Record<OffersAudienceType, OffersAudienceSlug> = {
  FOR_YOU: "for-you",
  BUSINESS: "business",
  SCHOOLS: "schools",
  CHURCHES: "churches",
};

function orderVisibleAudiences(audiences: OffersAudienceData[]) {
  const audienceMap = new Map(
    audiences.map((audience) => [audience.type, audience]),
  );

  return OFFERS_AUDIENCE_ORDER.flatMap((type) => {
    const audience = audienceMap.get(type);
    return audience?.isVisible ? [audience] : [];
  });
}

async function readOffersAudiencesViaSql(): Promise<OffersAudienceData[]> {
  const rows = await prisma.$queryRaw<SqlOffersAudienceRow[]>`
    SELECT
      "type",
      "tabLabel",
      "emptyTitle",
      "emptyBody",
      "color",
      "isVisible",
      "updatedAt"
    FROM "Audience"
  `;

  return orderVisibleAudiences(
    rows.map(
      (row) =>
        ({
          type: row.type as OffersAudienceType,
          tabLabel: row.tabLabel,
          emptyTitle: row.emptyTitle,
          emptyBody: row.emptyBody,
          color: row.color as AudienceColor,
          isVisible: row.isVisible,
          updatedAt: new Date(row.updatedAt),
        }) satisfies OffersAudienceData,
    ),
  );
}

async function readOfferGroupsViaSql(
  audienceType: OffersAudienceType,
): Promise<OffersGroupData[]> {
  const groups = await prisma.$queryRaw<SqlOffersGroupRow[]>`
    SELECT
      "id",
      "name",
      "description",
      "position"
    FROM "OfferGroup"
    WHERE "audienceType" = CAST(${audienceType} AS "AudienceType")
      AND "isVisible" = true
    ORDER BY "position" ASC
  `;

  if (groups.length === 0) {
    return [];
  }

  const groupIds = groups.map((group) => group.id);
  const plans = await prisma.$queryRaw<SqlOffersPlanRow[]>`
    SELECT
      "id",
      "offerGroupId",
      "name",
      "subtitle",
      "imagePublicId",
      "features",
      "billingEnabled",
      "isHighlighted",
      "highlightBgColor",
      "highlightTextColor",
      "position"
    FROM "PricingPlan"
    WHERE "offerGroupId" IN (${Prisma.join(groupIds)})
      AND "isVisible" = true
    ORDER BY "offerGroupId" ASC, "position" ASC
  `;

  const planIds = plans.map((plan) => plan.id);
  const billingOptions =
    planIds.length > 0
      ? await prisma.$queryRaw<SqlOffersBillingRow[]>`
          SELECT
            "id",
            "planId",
            "duration",
            "priceNGN",
            "priceUSD",
            "label",
            "isDefault",
            "position"
          FROM "PlanBillingOption"
          WHERE "planId" IN (${Prisma.join(planIds)})
          ORDER BY "planId" ASC, "position" ASC
        `
      : [];

  const billingByPlanId = new Map<string, PlanBillingOptionData[]>();
  for (const option of billingOptions) {
    const current = billingByPlanId.get(option.planId) ?? [];
    current.push({
      id: option.id,
      duration: option.duration as BillingDuration,
      priceNGN: option.priceNGN ?? null,
      priceUSD: option.priceUSD ?? null,
      label: option.label ?? null,
      isDefault: option.isDefault,
      position: option.position,
    });
    billingByPlanId.set(option.planId, current);
  }

  const plansByGroupId = new Map<string, OffersPlanData[]>();
  for (const plan of plans) {
    const current = plansByGroupId.get(plan.offerGroupId) ?? [];
    current.push({
      id: plan.id,
      name: plan.name,
      subtitle: plan.subtitle ?? null,
      imagePublicId: normalizeStoredCloudinaryValue(plan.imagePublicId),
      features: parseJsonStringArray(plan.features),
      billingEnabled: plan.billingEnabled,
      isHighlighted: plan.isHighlighted,
      highlightBgColor: plan.highlightBgColor ?? null,
      highlightTextColor: plan.highlightTextColor ?? null,
      position: plan.position,
      billingOptions: billingByPlanId.get(plan.id) ?? [],
    });
    plansByGroupId.set(plan.offerGroupId, current);
  }

  return groups.map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description ?? null,
    position: group.position,
    plans: plansByGroupId.get(group.id) ?? [],
  }));
}

// ── Offers page content ────────────────────────────────────────────────────────

async function readOffersPageContent(): Promise<OffersPageContentData> {
  try {
    const row = await prisma.offersPageContent.findUnique({ where: { id: 1 } });
    if (!row) return OFFERS_PAGE_CONTENT_DEFAULTS;
    return {
      heroEyebrow: row.heroEyebrow,
      heroHeadline: row.heroHeadline,
      heroBody: row.heroBody,
      heroBgImagePublicId: normalizeStoredCloudinaryValue(
        row.heroBgImagePublicId,
      ),
      heroCtaText: normalizeHeroOfferText(row.heroCtaText),
      heroCtaHref: row.heroCtaHref,
      servicesSectionLabel: row.servicesSectionLabel,
      servicesSectionTitle: row.servicesSectionTitle,
      servicesSectionBody: row.servicesSectionBody,
      audienceSectionLabel: row.audienceSectionLabel,
      audienceSectionTitle: row.audienceSectionTitle,
      audienceSectionBody: normalizeAudienceSectionBody(
        row.audienceSectionBody,
      ),
      popularBadgeText: row.popularBadgeText,
      featuresLabel: row.featuresLabel,
      choosePlanText: normalizeOfferCtaText(row.choosePlanText),
      requestQuoteText: row.requestQuoteText,
      ctaLabel: row.ctaLabel,
      ctaTitle: row.ctaTitle,
      ctaBody: row.ctaBody,
      cta1Text: row.cta1Text,
      cta1Href: row.cta1Href,
      cta2Text: row.cta2Text,
      cta2Href: row.cta2Href,
    };
  } catch {
    return OFFERS_PAGE_CONTENT_DEFAULTS;
  }
}

export async function fetchOffersPageContent(): Promise<OffersPageContentData> {
  return readOffersPageContent();
}

// ── Audiences ─────────────────────────────────────────────────────────────────

async function readAudiences(): Promise<OffersAudienceData[]> {
  try {
    const rows = await prisma.audience.findMany({
      select: {
        type: true,
        tabLabel: true,
        emptyTitle: true,
        emptyBody: true,
        color: true,
        isVisible: true,
        updatedAt: true,
      },
    });

    return orderVisibleAudiences(
      rows.map(
        (row) =>
          ({
            type: row.type as OffersAudienceType,
            tabLabel: row.tabLabel,
            emptyTitle: row.emptyTitle,
            emptyBody: row.emptyBody,
            color: row.color as AudienceColor,
            isVisible: row.isVisible,
            updatedAt: row.updatedAt,
          }) satisfies OffersAudienceData,
      ),
    );
  } catch {
    try {
      return await readOffersAudiencesViaSql();
    } catch {
      return [];
    }
  }
}

export async function fetchAudiences(): Promise<OffersAudienceData[]> {
  return readAudiences();
}

// ── Offer groups (with plans + billing options) ───────────────────────────────

async function readOfferGroups(
  audienceType: OffersAudienceType,
): Promise<OffersGroupData[]> {
  try {
    const rows = await prisma.offerGroup.findMany({
      where: { audienceType, isVisible: true },
      orderBy: { position: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        position: true,
        plans: {
          where: { isVisible: true },
          orderBy: { position: "asc" },
          select: {
            id: true,
            name: true,
            subtitle: true,
            imagePublicId: true,
            features: true,
            billingEnabled: true,
            isHighlighted: true,
            highlightBgColor: true,
            highlightTextColor: true,
            position: true,
            billingOptions: {
              orderBy: { position: "asc" },
              select: {
                id: true,
                duration: true,
                priceNGN: true,
                priceUSD: true,
                label: true,
                isDefault: true,
                position: true,
              },
            },
          },
        },
      },
    });

    if (rows.length === 0) return [];

    return rows.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description ?? null,
      position: g.position,
      plans: g.plans.map((p) => ({
        id: p.id,
        name: p.name,
        subtitle: p.subtitle ?? null,
        imagePublicId: normalizeStoredCloudinaryValue(p.imagePublicId),
        features: parseJsonStringArray(p.features),
        billingEnabled: p.billingEnabled,
        isHighlighted: p.isHighlighted,
        highlightBgColor: p.highlightBgColor ?? null,
        highlightTextColor: p.highlightTextColor ?? null,
        position: p.position,
        billingOptions: p.billingOptions.map((o) => ({
          id: o.id,
          duration: o.duration as BillingDuration,
          priceNGN: o.priceNGN ?? null,
          priceUSD: o.priceUSD ?? null,
          label: o.label ?? null,
          isDefault: o.isDefault,
          position: o.position,
        })),
      })),
    }));
  } catch {
    try {
      return await readOfferGroupsViaSql(audienceType);
    } catch {
      return [];
    }
  }
}

export async function fetchOfferGroups(
  audienceType: OffersAudienceType,
): Promise<OffersGroupData[]> {
  return readOfferGroups(audienceType);
}

// ── Unified fetch for the /offers page ───────────────────────────────────────

export async function fetchUnifiedOffersPage(): Promise<UnifiedOffersPageProps> {
  const [content, services, audiences, socialLinks] = await Promise.all([
    fetchOffersPageContent(),
    fetchOffersServiceCards(),
    fetchAudiences(),
    fetchContactSocialLinks(),
  ]);

  const audiencePanels = await Promise.all(
    audiences.map(async (audience): Promise<OffersAudiencePanelData> => {
      const offerGroups = await fetchOfferGroups(audience.type);
      return {
        type: audience.type,
        slug: AUDIENCE_TYPE_TO_SLUG[audience.type],
        tabLabel: audience.tabLabel,
        emptyTitle: audience.emptyTitle,
        emptyBody: audience.emptyBody,
        color: audience.color,
        offerGroups,
      };
    }),
  );

  const initialAudience =
    (audiencePanels[0]?.slug as OffersAudienceSlug | undefined) ?? "for-you";

  const offersWhatsAppHref =
    socialLinks.find((social) => social.platform === "WHATSAPP")?.href ?? null;

  return {
    content,
    services,
    audiences: audiencePanels,
    initialAudience,
    offersWhatsAppHref,
  };
}

// ─── We Brand Schools ──────────────────────────────────────────────────────────

async function readWeBrandSchoolsPageContent(): Promise<WeBrandSchoolsPageContentData> {
  try {
    const row = await weBrandSchoolsPrisma.weBrandSchoolsPageContent.findFirst({
      orderBy: { id: "asc" },
    });

    if (!row) {
      return WE_BRAND_SCHOOLS_PAGE_CONTENT_DEFAULTS;
    }

    return withWeBrandSchoolsPageContentDefaults({
      logoPublicId: row.logoPublicId,
      heroImagePublicId: row.heroImagePublicId ?? null,
      heroEyebrow: row.heroEyebrow,
      heroHeadline: row.heroHeadline,
      heroBody: row.heroBody,
      heroPrimaryCtaText: row.heroPrimaryCtaText,
      heroPrimaryCtaHref: row.heroPrimaryCtaHref,
      heroSecondaryCtaText: row.heroSecondaryCtaText,
      heroSecondaryCtaHref: row.heroSecondaryCtaHref,
      heroFeature1: row.heroFeature1,
      heroFeature2: row.heroFeature2,
      heroFeature3: row.heroFeature3,
      overviewLabel: row.overviewLabel,
      overviewTitle: row.overviewTitle,
      overviewBody: row.overviewBody,
      overviewPrimaryCtaText: row.overviewPrimaryCtaText,
      overviewPrimaryCtaHref: row.overviewPrimaryCtaHref,
      overviewSecondaryCtaText: row.overviewSecondaryCtaText,
      overviewSecondaryCtaHref: row.overviewSecondaryCtaHref,
      overviewBenefitsLabel: row.overviewBenefitsLabel,
      overviewBenefit1: row.overviewBenefit1,
      overviewBenefit2: row.overviewBenefit2,
      overviewBenefit3: row.overviewBenefit3,
      overviewBenefit4: row.overviewBenefit4,
      processLabel: row.processLabel,
      processTitle: row.processTitle,
      processBody: row.processBody,
      processStep1Title: row.processStep1Title,
      processStep1Body: row.processStep1Body,
      processStep2Title: row.processStep2Title,
      processStep2Body: row.processStep2Body,
      processStep3Title: row.processStep3Title,
      processStep3Body: row.processStep3Body,
      processStep4Title: row.processStep4Title,
      processStep4Body: row.processStep4Body,
      templatesLabel: row.templatesLabel,
      templatesTitle: row.templatesTitle,
      templatesBody: row.templatesBody,
    });
  } catch {
    return WE_BRAND_SCHOOLS_PAGE_CONTENT_DEFAULTS;
  }
}

const fetchWeBrandSchoolsPageContentCached = unstable_cache(
  readWeBrandSchoolsPageContent,
  ["we-brand-schools-page-content"],
  { tags: [WE_BRAND_SCHOOLS_CONTENT_TAG] },
);

export async function fetchWeBrandSchoolsPageContent(): Promise<WeBrandSchoolsPageContentData> {
  return fetchWeBrandSchoolsPageContentCached();
}

async function readSchoolWebsiteTestimonials(): Promise<
  SchoolWebsiteTestimonialData[]
> {
  try {
    const rows = await listSchoolWebsiteTestimonials({ visibleOnly: true });

    return rows.map((row: SchoolWebsiteTestimonialData) => ({
      id: row.id,
      schoolName: row.schoolName,
      logoPublicId: row.logoPublicId ?? null,
      quote: row.quote,
      authorName: row.authorName,
      authorPosition: row.authorPosition,
      isVisible: row.isVisible,
      position: row.position,
    }));
  } catch {
    return [];
  }
}

export async function fetchSchoolWebsiteTestimonials(): Promise<
  SchoolWebsiteTestimonialData[]
> {
  return readSchoolWebsiteTestimonials();
}

async function readSchoolWebsiteTemplates(): Promise<
  SchoolWebsiteTemplateData[]
> {
  try {
    const rows = await weBrandSchoolsPrisma.schoolWebsiteTemplate.findMany({
      where: { isVisible: true },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        summary: true,
        description: true,
        websiteUrl: true,
        highlights: true,
        coverAssetId: true,
        isVisible: true,
        position: true,
        assets: {
          orderBy: [{ position: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            publicId: true,
            mediaType: true,
            thumbnailPublicId: true,
            caption: true,
            position: true,
          },
        },
      },
    });

    if (!rows.length) {
      return [];
    }

    return rows.map(
      (row: {
        id: string;
        name: string;
        slug: string;
        summary: string;
        description: string | null;
        websiteUrl: string | null;
        highlights: string;
        coverAssetId: string | null;
        isVisible: boolean;
        position: number;
        assets: {
          id: string;
          publicId: string;
          mediaType: "IMAGE" | "VIDEO";
          thumbnailPublicId: string | null;
          caption: string | null;
          position: number;
        }[];
      }) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        summary: row.summary,
        description: row.description,
        websiteUrl: row.websiteUrl,
        highlights: parseWeBrandSchoolsJsonStringArray(row.highlights),
        coverAssetId: row.coverAssetId,
        isVisible: row.isVisible,
        position: row.position,
        assets: row.assets.map((asset) => ({
          id: asset.id,
          publicId: asset.publicId,
          mediaType: asset.mediaType,
          thumbnailPublicId: asset.thumbnailPublicId,
          caption: asset.caption,
          position: asset.position,
        })),
      }),
    );
  } catch {
    return [];
  }
}

export async function fetchSchoolWebsiteTemplates(): Promise<
  SchoolWebsiteTemplateData[]
> {
  return readSchoolWebsiteTemplates();
}

async function readSchoolPortalSectionContent(): Promise<SchoolPortalSectionContentData> {
  const row = await weBrandSchoolsPrisma.schoolPortalSectionContent.findFirst({
    orderBy: { id: "asc" },
    select: {
      eyebrow: true,
      title: true,
      description: true,
      ctaText: true,
      ctaHref: true,
      isVisible: true,
    },
  });

  if (!row) {
    return SCHOOL_PORTAL_SECTION_CONTENT_DEFAULTS;
  }

  return withSchoolPortalSectionContentDefaults({
    eyebrow: row.eyebrow,
    title: row.title,
    description: row.description,
    ctaText: row.ctaText ?? null,
    ctaHref: row.ctaHref ?? null,
    isVisible: row.isVisible,
  });
}

const fetchSchoolPortalSectionContentCached = unstable_cache(
  readSchoolPortalSectionContent,
  ["school-portal-section-content-v3"],
  { tags: [SCHOOL_PORTAL_SECTION_TAG] },
);

export async function fetchSchoolPortalSectionContent(): Promise<SchoolPortalSectionContentData> {
  try {
    return await fetchSchoolPortalSectionContentCached();
  } catch {
    return SCHOOL_PORTAL_SECTION_CONTENT_DEFAULTS;
  }
}

async function readSchoolPortalFeatureCards(): Promise<
  SchoolPortalFeatureCardData[]
> {
  const rows = await weBrandSchoolsPrisma.schoolPortalFeatureCard.findMany({
    where: { isVisible: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      summary: true,
      description: true,
      features: true,
      coverAssetId: true,
      youtubeUrl: true,
      isVisible: true,
      position: true,
      assets: {
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          publicId: true,
          mediaType: true,
          thumbnailPublicId: true,
          caption: true,
          position: true,
        },
      },
    },
  });

  if (!rows.length) {
    return [];
  }

  return rows.map(
    (row: {
      id: string;
      title: string;
      summary: string;
      description: string;
      features: string;
      coverAssetId: string | null;
      youtubeUrl: string | null;
      isVisible: boolean;
      position: number;
      assets: {
        id: string;
        publicId: string;
        mediaType: "IMAGE" | "VIDEO";
        thumbnailPublicId: string | null;
        caption: string | null;
        position: number;
      }[];
    }) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      description: row.description,
      features: parseWeBrandSchoolsJsonStringArray(row.features),
      coverAssetId: row.coverAssetId,
      youtubeUrl: row.youtubeUrl,
      isVisible: row.isVisible,
      position: row.position,
      assets: row.assets.map((asset) => ({
        id: asset.id,
        publicId: asset.publicId,
        mediaType: asset.mediaType,
        thumbnailPublicId: asset.thumbnailPublicId,
        caption: asset.caption,
        position: asset.position,
      })),
    }),
  );
}

const fetchSchoolPortalFeatureCardsCached = unstable_cache(
  readSchoolPortalFeatureCards,
  ["school-portal-feature-cards-v3"],
  { tags: [SCHOOL_PORTAL_CARDS_TAG] },
);

export async function fetchSchoolPortalFeatureCards(): Promise<
  SchoolPortalFeatureCardData[]
> {
  try {
    return await fetchSchoolPortalFeatureCardsCached();
  } catch {
    return [];
  }
}

// ─── Contact Page ─────────────────────────────────────────────────────────────

async function readContactPageContent(): Promise<ContactPageContentData> {
  try {
    const row = await prisma.contactPageContent.findUnique({
      where: { id: 1 },
    });

    if (!row) {
      return CONTACT_PAGE_CONTENT_DEFAULTS;
    }

    return {
      homeEyebrow: row.homeEyebrow,
      homeTitle: row.homeTitle,
      homeBody: row.homeBody,
      homeCtaText: row.homeCtaText,
      homeCtaHref: row.homeCtaHref,
      heroEyebrow: row.heroEyebrow,
      heroTitle: row.heroTitle,
      heroBody: row.heroBody,
      infoEyebrow: row.infoEyebrow,
      infoTitle: row.infoTitle,
      infoBody: row.infoBody,
      formEyebrow: row.formEyebrow,
      formTitle: row.formTitle,
      formBody: row.formBody,
      addressLabel: row.addressLabel,
      address: row.address,
      emailLabel: row.emailLabel,
      emails: parseContactJsonStringArray(row.emails),
      phoneLabel: row.phoneLabel,
      phones: parseContactJsonStringArray(row.phones),
      socialsLabel: row.socialsLabel,
    };
  } catch {
    return CONTACT_PAGE_CONTENT_DEFAULTS;
  }
}

const fetchContactPageContentCached = unstable_cache(
  readContactPageContent,
  ["contact-page-content"],
  { tags: [CONTACT_CONTENT_TAG] },
);

export async function fetchContactPageContent(): Promise<ContactPageContentData> {
  return fetchContactPageContentCached();
}

async function readContactSocialLinks(): Promise<ContactSocialLinkData[]> {
  try {
    const rows = await prisma.contactSocialLink.findMany({
      where: { isVisible: true },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      select: {
        platform: true,
        label: true,
        href: true,
        isVisible: true,
        position: true,
      },
    });

    if (!rows.length) {
      return [];
    }

    return rows.map((row) => ({
      platform: row.platform as ContactSocialPlatform,
      label: row.label,
      href: row.href,
      isVisible: row.isVisible,
      position: row.position,
    }));
  } catch {
    return [];
  }
}

const fetchContactSocialLinksCached = unstable_cache(
  readContactSocialLinks,
  ["contact-social-links"],
  { tags: [CONTACT_SOCIALS_TAG] },
);

export async function fetchContactSocialLinks(): Promise<
  ContactSocialLinkData[]
> {
  return fetchContactSocialLinksCached();
}

// ─── About Page ───────────────────────────────────────────────────────────────

async function readAboutPageContent(): Promise<AboutPageContentData> {
  try {
    const row = await aboutPrisma.aboutPageContent.findFirst({
      orderBy: { id: "asc" },
    });

    if (!row) {
      return ABOUT_PAGE_CONTENT_DEFAULTS;
    }

    return {
      heroEyebrow: row.heroEyebrow,
      heroHeadline: row.heroHeadline,
      heroBody: row.heroBody,
      heroBackgroundImagePublicId: row.heroBackgroundImagePublicId,
      heroPrimaryCtaText: row.heroPrimaryCtaText,
      heroPrimaryCtaHref: row.heroPrimaryCtaHref,
      heroSecondaryCtaText: row.heroSecondaryCtaText,
      heroSecondaryCtaHref: row.heroSecondaryCtaHref,
      heroStat1Value: row.heroStat1Value,
      heroStat1Label: row.heroStat1Label,
      heroStat2Value: row.heroStat2Value,
      heroStat2Label: row.heroStat2Label,
      heroStat3Value: row.heroStat3Value,
      heroStat3Label: row.heroStat3Label,
      heroStat4Value: row.heroStat4Value,
      heroStat4Label: row.heroStat4Label,
      storyLabel: row.storyLabel,
      storyTitle: row.storyTitle,
      storyBody1: row.storyBody1,
      storyBody2: row.storyBody2,
      storyHighlightLabel: row.storyHighlightLabel,
      storyHighlightTitle: row.storyHighlightTitle,
      storyHighlightBody: row.storyHighlightBody,
      storyTrustedLabel: row.storyTrustedLabel,
      storyTrustedItems: parseAboutJsonStringArray(row.storyTrustedItems),
      expertiseLabel: row.expertiseLabel,
      expertiseTitle: row.expertiseTitle,
      expertiseBody: row.expertiseBody,
      teamLabel: row.teamLabel,
      teamTitle: row.teamTitle,
      teamBody: row.teamBody,
      cultureTitle: row.cultureTitle,
      cultureBody: row.cultureBody,
      teamNoteLabel: row.teamNoteLabel,
      teamPortfolioButtonText: row.teamPortfolioButtonText,
      spaceLabel: row.spaceLabel,
      spaceTitle: row.spaceTitle,
      spaceBody: row.spaceBody,
      valuesLabel: row.valuesLabel,
      valuesTitle: row.valuesTitle,
      valuesBody: row.valuesBody,
      ctaLabel: row.ctaLabel,
      ctaTitle: row.ctaTitle,
      ctaBody: row.ctaBody,
      ctaText: row.ctaText,
      ctaHref: row.ctaHref,
    };
  } catch {
    return ABOUT_PAGE_CONTENT_DEFAULTS;
  }
}

const fetchAboutPageContentCached = unstable_cache(
  readAboutPageContent,
  ["about-page-content"],
  { tags: [ABOUT_CONTENT_TAG] },
);

export async function fetchAboutPageContent(): Promise<AboutPageContentData> {
  return fetchAboutPageContentCached();
}

async function readAboutMilestones(): Promise<AboutMilestoneData[]> {
  try {
    const rows = await aboutPrisma.aboutMilestone.findMany({
      where: { isVisible: true },
      orderBy: { position: "asc" },
    });

    if (!rows.length) {
      return ABOUT_MILESTONE_DEFAULTS.filter((item) => item.isVisible);
    }

    return rows.map(
      (row: {
        year: string;
        title: string;
        description: string;
        isVisible: boolean;
        position: number;
      }) => ({
        year: row.year,
        title: row.title,
        description: row.description,
        isVisible: row.isVisible,
        position: row.position,
      }),
    );
  } catch {
    return ABOUT_MILESTONE_DEFAULTS.filter((item) => item.isVisible);
  }
}

const fetchAboutMilestonesCached = unstable_cache(
  readAboutMilestones,
  ["about-milestones"],
  { tags: [ABOUT_MILESTONES_TAG] },
);

export async function fetchAboutMilestones(): Promise<AboutMilestoneData[]> {
  return fetchAboutMilestonesCached();
}

async function readAboutExpertiseItems(): Promise<AboutExpertiseItemData[]> {
  try {
    const rows = await aboutPrisma.aboutExpertiseItem.findMany({
      where: { isVisible: true },
      orderBy: { position: "asc" },
    });

    if (!rows.length) {
      return ABOUT_EXPERTISE_DEFAULTS.filter((item) => item.isVisible);
    }

    return rows.map(
      (row: {
        icon: AboutIconKey;
        title: string;
        description: string;
        metricLabel: string;
        metricValue: string;
        isVisible: boolean;
        position: number;
      }) => ({
        icon: row.icon as AboutIconKey,
        title: row.title,
        description: row.description,
        metricLabel: row.metricLabel,
        metricValue: row.metricValue,
        isVisible: row.isVisible,
        position: row.position,
      }),
    );
  } catch {
    return ABOUT_EXPERTISE_DEFAULTS.filter((item) => item.isVisible);
  }
}

const fetchAboutExpertiseItemsCached = unstable_cache(
  readAboutExpertiseItems,
  ["about-expertise-items"],
  { tags: [ABOUT_EXPERTISE_TAG] },
);

export async function fetchAboutExpertiseItems(): Promise<
  AboutExpertiseItemData[]
> {
  return fetchAboutExpertiseItemsCached();
}

async function readAboutTeamMembers(): Promise<AboutTeamMemberData[]> {
  try {
    const rows = await aboutPrisma.aboutTeamMember.findMany({
      where: { isVisible: true },
      orderBy: { position: "asc" },
    });

    if (!rows.length) {
      return ABOUT_TEAM_MEMBER_DEFAULTS.filter((item) => item.isVisible);
    }

    return rows.map(
      (row: {
        name: string;
        role: string;
        bio: string;
        expertise: string;
        funFact: string;
        portfolioUrl: string;
        showPortfolioButton: boolean;
        imagePublicId: string | null;
        isVisible: boolean;
        position: number;
      }) => ({
        name: row.name,
        role: row.role,
        bio: row.bio,
        expertise: parseAboutJsonStringArray(row.expertise),
        funFact: row.funFact,
        portfolioUrl: row.portfolioUrl,
        showPortfolioButton: row.showPortfolioButton,
        imagePublicId: row.imagePublicId,
        isVisible: row.isVisible,
        position: row.position,
      }),
    );
  } catch {
    return ABOUT_TEAM_MEMBER_DEFAULTS.filter((item) => item.isVisible);
  }
}

const fetchAboutTeamMembersCached = unstable_cache(
  readAboutTeamMembers,
  ["about-team-members"],
  { tags: [ABOUT_TEAM_TAG] },
);

export async function fetchAboutTeamMembers(): Promise<AboutTeamMemberData[]> {
  return fetchAboutTeamMembersCached();
}

async function readAboutSpaceItems(): Promise<AboutSpaceItemData[]> {
  try {
    const aboutSpaceItem = (
      aboutPrisma as typeof aboutPrisma & {
        aboutSpaceItem?: {
          findMany: (args: {
            where: { isVisible: true };
            orderBy: { position: "asc" };
          }) => Promise<
            Array<{
              title: string;
              description: string;
              mediaType: AboutSpaceItemData["mediaType"];
              mediaPublicId: string | null;
              thumbnailPublicId: string | null;
              isVisible: boolean;
              position: number;
            }>
          >;
        };
      }
    ).aboutSpaceItem;

    if (!aboutSpaceItem) {
      return [];
    }

    const rows = await aboutSpaceItem.findMany({
      where: { isVisible: true },
      orderBy: { position: "asc" },
    });

    return rows.map(
      (row: {
        title: string;
        description: string;
        mediaType: AboutSpaceItemData["mediaType"];
        mediaPublicId: string | null;
        thumbnailPublicId: string | null;
        isVisible: boolean;
        position: number;
      }) => ({
        title: row.title,
        description: row.description,
        mediaType: row.mediaType,
        mediaPublicId: normalizeStoredCloudinaryValue(row.mediaPublicId),
        thumbnailPublicId: normalizeStoredCloudinaryValue(
          row.thumbnailPublicId,
        ),
        isVisible: row.isVisible,
        position: row.position,
      }),
    );
  } catch {
    return [];
  }
}

const fetchAboutSpaceItemsCached = unstable_cache(
  readAboutSpaceItems,
  ["about-space-items"],
  { tags: [ABOUT_SPACE_TAG] },
);

export async function fetchAboutSpaceItems(): Promise<AboutSpaceItemData[]> {
  return fetchAboutSpaceItemsCached();
}

async function readAboutValueItems(): Promise<AboutValueItemData[]> {
  try {
    const rows = await aboutPrisma.aboutValueItem.findMany({
      where: { isVisible: true },
      orderBy: { position: "asc" },
    });

    if (!rows.length) {
      return ABOUT_VALUE_DEFAULTS.filter((item) => item.isVisible);
    }

    return rows.map(
      (row: {
        icon: AboutIconKey;
        title: string;
        description: string;
        isVisible: boolean;
        position: number;
      }) => ({
        icon: row.icon as AboutIconKey,
        title: row.title,
        description: row.description,
        isVisible: row.isVisible,
        position: row.position,
      }),
    );
  } catch {
    return ABOUT_VALUE_DEFAULTS.filter((item) => item.isVisible);
  }
}

const fetchAboutValueItemsCached = unstable_cache(
  readAboutValueItems,
  ["about-value-items"],
  { tags: [ABOUT_VALUES_TAG] },
);

export async function fetchAboutValueItems(): Promise<AboutValueItemData[]> {
  return fetchAboutValueItemsCached();
}
