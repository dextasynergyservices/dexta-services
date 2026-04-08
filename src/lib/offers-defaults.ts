export type OffersAudienceType =
  | "FOR_YOU"
  | "BUSINESS"
  | "SCHOOLS"
  | "CHURCHES";
export type BillingDuration =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY";
export type AudienceColor = "cyan" | "blue" | "purple" | "green";

// ── Page content ──────────────────────────────────────────────────────────────

export type OffersPageContentData = {
  heroEyebrow: string;
  heroHeadline: string;
  heroBody: string;
  heroBgImagePublicId: string | null;
  heroCtaText: string;
  heroCtaHref: string;
  servicesSectionLabel: string;
  servicesSectionTitle: string;
  servicesSectionBody: string;
  audienceSectionLabel: string;
  audienceSectionTitle: string;
  audienceSectionBody: string;
  popularBadgeText: string;
  featuresLabel: string;
  choosePlanText: string;
  requestQuoteText: string;
  ctaLabel: string;
  ctaTitle: string;
  ctaBody: string;
  cta1Text: string;
  cta1Href: string;
  cta2Text: string;
  cta2Href: string;
};

// ── Audience ──────────────────────────────────────────────────────────────────

export type AudienceContentData = {
  type: OffersAudienceType;
  tabLabel: string;
  emptyTitle: string;
  emptyBody: string;
  color: AudienceColor;
  isVisible: boolean;
};

// ── Offer groups + plans (used by seed) ──────────────────────────────────────

export type PlanBillingOptionSeedData = {
  duration: BillingDuration;
  priceNGN: number | null;
  priceUSD: number | null;
  label: string | null;
  isDefault: boolean;
  position: number;
};

export type PricingPlanSeedData = {
  name: string;
  subtitle: string | null;
  imagePublicId?: string | null;
  features: string[];
  billingEnabled: boolean;
  isHighlighted: boolean;
  highlightBgColor?: string | null;
  highlightTextColor?: string | null;
  isVisible: boolean;
  position: number;
  billingOptions: PlanBillingOptionSeedData[];
};

export type OfferGroupSeedData = {
  name: string;
  description: string | null;
  position: number;
  isVisible: boolean;
  plans: PricingPlanSeedData[];
};

// ── Defaults ──────────────────────────────────────────────────────────────────

export const OFFERS_AUDIENCE_ORDER: OffersAudienceType[] = [
  "FOR_YOU",
  "BUSINESS",
  "SCHOOLS",
  "CHURCHES",
];

export const OFFERS_PAGE_CONTENT_DEFAULTS: OffersPageContentData = {
  heroEyebrow: "Dexta Offers",
  heroHeadline: "Reach More. Build More. Stay Visible.",
  heroBody:
    "Dexta helps businesses, schools, and organizations stay visible with design, web, print, and recurring communication support.",
  heroBgImagePublicId: null,
  heroCtaText: "Explore Offers",
  heroCtaHref: "#audiences",
  servicesSectionLabel: "What We Do",
  servicesSectionTitle: "Design, build, and print under one clear direction.",
  servicesSectionBody:
    "From visual identity to digital delivery and print production, Dexta helps teams show up clearly across every channel.",
  audienceSectionLabel: "Who We Serve",
  audienceSectionTitle: "Choose the path that fits your audience.",
  audienceSectionBody:
    "Each offer path is shaped around real communication needs, from customer growth to school visibility and community engagement.",
  popularBadgeText: "Popular Pick",
  featuresLabel: "Includes",
  choosePlanText: "Choose Offer",
  requestQuoteText: "Request Quote",
  ctaLabel: "Need a tailored offer?",
  ctaTitle: "Let's shape the right mix for your team.",
  ctaBody:
    "Need something between packages? We can build a custom scope around your goals, timeline, and operating rhythm.",
  cta1Text: "Start a Conversation",
  cta1Href: "/contact",
  cta2Text: "View Recent Projects",
  cta2Href: "/projects",
};

export const OFFERS_AUDIENCE_DEFAULTS: Record<
  OffersAudienceType,
  AudienceContentData
> = {
  FOR_YOU: {
    type: "FOR_YOU",
    tabLabel: "For You",
    emptyTitle: "Personalised offers are coming soon.",
    emptyBody:
      "We're putting together offers tailored to your specific context. Reach out and we'll shape something for you directly.",
    color: "blue",
    isVisible: true,
  },
  BUSINESS: {
    type: "BUSINESS",
    tabLabel: "Business",
    emptyTitle: "Business offers are being refreshed.",
    emptyBody:
      "Tell us what your business needs and we will shape a right-fit scope around your growth goals.",
    color: "blue",
    isVisible: true,
  },
  SCHOOLS: {
    type: "SCHOOLS",
    tabLabel: "Schools",
    emptyTitle: "School offers are being refreshed.",
    emptyBody:
      "Share your institution's priorities and we will recommend the right mix for admissions, communication, and delivery.",
    color: "cyan",
    isVisible: true,
  },
  CHURCHES: {
    type: "CHURCHES",
    tabLabel: "Churches",
    emptyTitle: "Church and community offers are being refreshed.",
    emptyBody:
      "Tell us about your ministry or organization and we will shape a scope that supports your communication rhythm.",
    color: "purple",
    isVisible: true,
  },
};

// ── Shared reach plan blueprints ──────────────────────────────────────────────

const REACH_PLANS: PricingPlanSeedData[] = [
  {
    name: "Reach Starter",
    subtitle:
      "Essential visibility support for teams building a steady public presence.",
    features: [
      "Up to 8 branded design assets each month",
      "Recurring content publishing support up to 3 times weekly",
      "Bulk SMS and campaign reminder support for active promotions",
      "One website or landing page update cycle each month",
      "Monthly performance and communication check-in",
    ],
    billingEnabled: true,
    isHighlighted: false,
    isVisible: true,
    position: 0,
    billingOptions: [
      {
        duration: "MONTHLY",
        priceNGN: 25000,
        priceUSD: null,
        label: null,
        isDefault: true,
        position: 0,
      },
      {
        duration: "QUARTERLY",
        priceNGN: 65000,
        priceUSD: null,
        label: null,
        isDefault: false,
        position: 1,
      },
    ],
  },
  {
    name: "Reach Pro",
    subtitle: "A stronger communication rhythm for teams growing steadily.",
    features: [
      "Up to 12 branded design assets each month",
      "Recurring content publishing support up to 5 times weekly",
      "Bulk SMS and campaign reminder support for wider audience pushes",
      "Two website or landing page update cycles each month",
      "Priority turnaround on active campaign tasks",
    ],
    billingEnabled: true,
    isHighlighted: true,
    highlightBgColor: "#000c99",
    highlightTextColor: "#ffffff",
    isVisible: true,
    position: 1,
    billingOptions: [
      {
        duration: "MONTHLY",
        priceNGN: 45000,
        priceUSD: null,
        label: null,
        isDefault: true,
        position: 0,
      },
      {
        duration: "QUARTERLY",
        priceNGN: 120000,
        priceUSD: null,
        label: null,
        isDefault: false,
        position: 1,
      },
    ],
  },
  {
    name: "Reach Max",
    subtitle:
      "High-output visibility support for teams running frequent campaigns.",
    features: [
      "Up to 20 branded design assets each month",
      "Recurring content publishing support up to 7 times weekly",
      "Expanded SMS communication support for larger campaigns",
      "Four website or landing page update cycles each month",
      "Campaign planning support for recurring launches and announcements",
    ],
    billingEnabled: true,
    isHighlighted: false,
    isVisible: true,
    position: 2,
    billingOptions: [
      {
        duration: "MONTHLY",
        priceNGN: 75000,
        priceUSD: null,
        label: null,
        isDefault: true,
        position: 0,
      },
      {
        duration: "QUARTERLY",
        priceNGN: 200000,
        priceUSD: null,
        label: null,
        isDefault: false,
        position: 1,
      },
    ],
  },
  {
    name: "Reach Mega",
    subtitle: "Scale-level visibility support across multiple active channels.",
    features: [
      "Up to 30 branded design assets each month",
      "Daily content publishing support across active channels",
      "High-volume SMS communication support for major campaigns",
      "Ongoing website update support with priority scheduling",
      "Strategy support for large announcements, events, and visibility pushes",
    ],
    billingEnabled: true,
    isHighlighted: false,
    isVisible: true,
    position: 3,
    billingOptions: [
      {
        duration: "MONTHLY",
        priceNGN: 120000,
        priceUSD: null,
        label: null,
        isDefault: true,
        position: 0,
      },
      {
        duration: "QUARTERLY",
        priceNGN: 320000,
        priceUSD: null,
        label: null,
        isDefault: false,
        position: 1,
      },
    ],
  },
];

// ── Offer group seed data per audience ───────────────────────────────────────

export const OFFERS_GROUP_DEFAULTS: Record<
  OffersAudienceType,
  OfferGroupSeedData[]
> = {
  FOR_YOU: [],

  BUSINESS: [
    {
      name: "Communication Reach",
      description:
        "Ongoing visibility support — design assets, SMS campaigns, and content publishing.",
      position: 0,
      isVisible: true,
      plans: REACH_PLANS,
    },
    {
      name: "Digital Setup",
      description:
        "One-time setup packages for web presence, email, and brand launch.",
      position: 1,
      isVisible: true,
      plans: [
        {
          name: "Business Launch",
          subtitle:
            "A focused setup for small businesses that need a credible digital foundation.",
          features: [
            "High-converting single-page business website",
            "1 year domain registration included",
            "1 year hosting included",
            "1 professional email inbox",
            "Google Business Profile setup",
            "Setup for 2 social media pages",
            "Basic brand assets for launch communication",
          ],
          billingEnabled: false,
          isHighlighted: false,
          isVisible: true,
          position: 0,
          billingOptions: [
            {
              duration: "MONTHLY",
              priceNGN: 180000,
              priceUSD: null,
              label: "Project-based",
              isDefault: true,
              position: 0,
            },
          ],
        },
        {
          name: "Business Growth",
          subtitle:
            "A fuller web and brand setup for businesses ready to scale.",
          features: [
            "Multipage business website",
            "1 year domain registration included",
            "1 year hosting included",
            "3 professional email inboxes",
            "Google Business Profile setup",
            "Setup for 5 social media pages",
            "Branded launch graphics for core channels",
            "1 month of post-launch web support",
          ],
          billingEnabled: false,
          isHighlighted: true,
          highlightBgColor: "#000c99",
          highlightTextColor: "#ffffff",
          isVisible: true,
          position: 1,
          billingOptions: [
            {
              duration: "MONTHLY",
              priceNGN: 320000,
              priceUSD: null,
              label: "Project-based",
              isDefault: true,
              position: 0,
            },
          ],
        },
        {
          name: "Business Scale",
          subtitle:
            "Custom setup for advanced products, platforms, or campaign systems.",
          features: [
            "Custom web platform or mobile app delivery",
            "Information architecture and conversion planning",
            "Expanded business email and workflow setup",
            "Advanced integrations based on business needs",
            "Post-launch support plan tailored to your operations",
          ],
          billingEnabled: false,
          isHighlighted: false,
          isVisible: true,
          position: 2,
          billingOptions: [],
        },
      ],
    },
  ],

  SCHOOLS: [
    {
      name: "Communication Reach",
      description:
        "Ongoing visibility support — design assets, SMS campaigns, and content publishing.",
      position: 0,
      isVisible: true,
      plans: REACH_PLANS,
    },
    {
      name: "Digital Setup",
      description:
        "One-time setup packages for school websites, email systems, and parent-facing digital presence.",
      position: 1,
      isVisible: true,
      plans: [
        {
          name: "School Launch",
          subtitle:
            "A clean first-step web presence for schools building public trust.",
          features: [
            "Single-page school website with admissions essentials",
            "1 year domain registration included",
            "1 year hosting included",
            "1 professional email inbox",
            "Google Business Profile setup",
            "Setup for 2 social media pages",
            "Starter school information pack for digital promotion",
          ],
          billingEnabled: false,
          isHighlighted: false,
          isVisible: true,
          position: 0,
          billingOptions: [
            {
              duration: "MONTHLY",
              priceNGN: 220000,
              priceUSD: null,
              label: "Project-based",
              isDefault: true,
              position: 0,
            },
          ],
        },
        {
          name: "School Growth",
          subtitle:
            "A stronger web and communication setup for growing schools.",
          features: [
            "Multipage school website",
            "1 year domain registration included",
            "1 year hosting included",
            "3 professional email inboxes",
            "Admissions and inquiry touchpoint setup",
            "Setup for 3 social media pages",
            "Google Workspace or Microsoft setup",
            "Basic staff onboarding support",
          ],
          billingEnabled: false,
          isHighlighted: true,
          highlightBgColor: "#00075d",
          highlightTextColor: "#ffffff",
          isVisible: true,
          position: 1,
          billingOptions: [
            {
              duration: "MONTHLY",
              priceNGN: 420000,
              priceUSD: null,
              label: "Project-based",
              isDefault: true,
              position: 0,
            },
          ],
        },
        {
          name: "School Digital Campus",
          subtitle:
            "Custom delivery for institutions needing portals, apps, or larger digital systems.",
          features: [
            "Student portal, LMS, or custom web app planning",
            "Advanced information architecture for institutional pages",
            "Expanded email and department structure setup",
            "Workflow and communication system recommendations",
            "Post-launch support tailored to your school operations",
          ],
          billingEnabled: false,
          isHighlighted: false,
          isVisible: true,
          position: 2,
          billingOptions: [],
        },
      ],
    },
  ],

  CHURCHES: [
    {
      name: "Communication Reach",
      description:
        "Ongoing visibility support — design assets, SMS campaigns, and content publishing.",
      position: 0,
      isVisible: true,
      plans: REACH_PLANS,
    },
    {
      name: "Digital Setup",
      description:
        "One-time setup packages for ministry websites, email, and community-facing digital presence.",
      position: 1,
      isVisible: true,
      plans: [
        {
          name: "Ministry Launch",
          subtitle:
            "A simple digital starting point for churches and community organizations.",
          features: [
            "Single-page ministry website",
            "1 year domain registration included",
            "1 year hosting included",
            "1 professional email inbox",
            "Setup for 2 social media pages",
            "Digital flyer and announcement starter pack",
            "1 month of launch support",
          ],
          billingEnabled: false,
          isHighlighted: false,
          isVisible: true,
          position: 0,
          billingOptions: [
            {
              duration: "MONTHLY",
              priceNGN: 160000,
              priceUSD: null,
              label: "Project-based",
              isDefault: true,
              position: 0,
            },
          ],
        },
        {
          name: "Ministry Growth",
          subtitle:
            "A stronger ministry foundation for recurring programs and multiple teams.",
          features: [
            "Multipage ministry website",
            "1 year domain registration included",
            "1 year hosting included",
            "3 professional email inboxes",
            "Setup for 3 social media pages",
            "Event and ministry page structure setup",
            "Branded announcement templates for recurring communication",
            "1 month of post-launch support",
          ],
          billingEnabled: false,
          isHighlighted: true,
          highlightBgColor: "#00075d",
          highlightTextColor: "#ffffff",
          isVisible: true,
          position: 1,
          billingOptions: [
            {
              duration: "MONTHLY",
              priceNGN: 280000,
              priceUSD: null,
              label: "Project-based",
              isDefault: true,
              position: 0,
            },
          ],
        },
        {
          name: "Ministry Platform",
          subtitle:
            "Custom setup for ministries needing apps, portals, or broader communication systems.",
          features: [
            "Custom ministry portal, app, or media platform planning",
            "Department and communication workflow setup",
            "Expanded email structure for teams and departments",
            "Audience engagement recommendations for events and follow-up",
            "Post-launch support tailored to ministry operations",
          ],
          billingEnabled: false,
          isHighlighted: false,
          isVisible: true,
          position: 2,
          billingOptions: [],
        },
      ],
    },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function parseJsonStringArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function serializeJsonStringArray(values: string[]): string {
  return JSON.stringify(
    values.map((value) => value.trim()).filter((value) => value.length > 0),
  );
}
