export type AboutIconKey =
  | "ZAP"
  | "GLOBE"
  | "SPARKLES"
  | "TRENDING_UP"
  | "TARGET"
  | "LIGHTBULB"
  | "HEART_HANDSHAKE"
  | "SHIELD";

export type AboutPageContentData = {
  heroEyebrow: string;
  heroHeadline: string;
  heroBody: string;
  heroBackgroundImagePublicId: string | null;
  heroPrimaryCtaText: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaText: string;
  heroSecondaryCtaHref: string;
  heroStat1Value: string;
  heroStat1Label: string;
  heroStat2Value: string;
  heroStat2Label: string;
  heroStat3Value: string;
  heroStat3Label: string;
  heroStat4Value: string;
  heroStat4Label: string;
  storyLabel: string;
  storyTitle: string;
  storyBody1: string;
  storyBody2: string;
  storyHighlightLabel: string;
  storyHighlightTitle: string;
  storyHighlightBody: string;
  storyTrustedLabel: string;
  storyTrustedItems: string[];
  expertiseLabel: string;
  expertiseTitle: string;
  expertiseBody: string;
  teamLabel: string;
  teamTitle: string;
  teamBody: string;
  cultureTitle: string;
  cultureBody: string;
  teamNoteLabel: string;
  teamPortfolioButtonText: string;
  spaceLabel: string;
  spaceTitle: string;
  spaceBody: string;
  valuesLabel: string;
  valuesTitle: string;
  valuesBody: string;
  ctaLabel: string;
  ctaTitle: string;
  ctaBody: string;
  ctaText: string;
  ctaHref: string;
};

export type AboutMilestoneData = {
  year: string;
  title: string;
  description: string;
  isVisible: boolean;
  position: number;
};

export type AboutExpertiseItemData = {
  icon: AboutIconKey;
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  isVisible: boolean;
  position: number;
};

export type AboutTeamMemberData = {
  name: string;
  role: string;
  bio: string;
  expertise: string[];
  funFact: string;
  portfolioUrl: string;
  showPortfolioButton: boolean;
  imagePublicId: string | null;
  isVisible: boolean;
  position: number;
};

export type AboutValueItemData = {
  icon: AboutIconKey;
  title: string;
  description: string;
  isVisible: boolean;
  position: number;
};

export type AboutSpaceMediaType = "IMAGE" | "VIDEO";

export type AboutSpaceItemData = {
  title: string;
  description: string;
  mediaType: AboutSpaceMediaType;
  mediaPublicId: string | null;
  thumbnailPublicId: string | null;
  isVisible: boolean;
  position: number;
};

export const ABOUT_PAGE_CONTENT_DEFAULTS: AboutPageContentData = {
  heroEyebrow: "About Dexta",
  heroHeadline:
    "We build brand clarity, digital confidence, and public presence that lasts.",
  heroBody:
    "Dexta is a design-led creative and digital studio helping ambitious businesses, schools, and institutions communicate with more precision. We bring strategy, design, build, and rollout into one connected system so every touchpoint feels intentional.",
  heroBackgroundImagePublicId: null,
  heroPrimaryCtaText: "Start a Project",
  heroPrimaryCtaHref: "/contact",
  heroSecondaryCtaText: "View Our Work",
  heroSecondaryCtaHref: "/projects",
  heroStat1Value: "6+",
  heroStat1Label: "Years of steady growth",
  heroStat2Value: "200+",
  heroStat2Label: "Projects delivered",
  heroStat3Value: "3",
  heroStat3Label: "Core service pillars",
  heroStat4Value: "50+",
  heroStat4Label: "Brands and teams supported",
  storyLabel: "Our Story",
  storyTitle:
    "A modern studio built to help good ideas look sharper and move faster.",
  storyBody1:
    "Dexta started from a simple belief: strong organisations deserve better creative thinking, cleaner execution, and a more credible public-facing presence. We built the studio to bridge the usual gaps between strategy, design, digital delivery, and print rollout.",
  storyBody2:
    "Today we work with growing brands, schools, and institutions that need more than isolated deliverables. They need systems, momentum, and a team that can translate ambition into work people trust.",
  storyHighlightLabel: "Studio View",
  storyHighlightTitle: "Why teams keep choosing Dexta",
  storyHighlightBody:
    "We combine creative direction, technical delivery, and practical decision-making so the work feels elevated, useful, and ready for the real world.",
  storyTrustedLabel: "Trusted across",
  storyTrustedItems: ["Business", "Education", "Healthcare", "Community"],
  expertiseLabel: "What We Bring",
  expertiseTitle:
    "Integrated expertise across strategy, design, digital, and rollout.",
  expertiseBody:
    "Our work is strongest when every layer supports the next. That means the brand, the product, and the public presence all move in the same direction.",
  teamLabel: "Our Team",
  teamTitle:
    "The people shaping the thinking, systems, and execution behind the work.",
  teamBody:
    "We are a multidisciplinary team built around clarity, collaboration, and standards that hold up beyond launch day.",
  cultureTitle: "How We Work",
  cultureBody:
    "We care about sharp communication, thoughtful iteration, and work that remains useful long after the first delivery.",
  teamNoteLabel: "Professional note",
  teamPortfolioButtonText: "View Portfolio",
  spaceLabel: "Our Space",
  spaceTitle: "The rooms where Dexta records, builds, welcomes, and recharges.",
  spaceBody:
    "From the podcast studio to the reception, workspace, and wellness corners, our environment is designed to support focus, collaboration, and creative momentum.",
  valuesLabel: "Our Values",
  valuesTitle:
    "The principles that define how Dexta thinks, builds, and partners.",
  valuesBody:
    "These values guide our decisions across strategy, design, development, and the way we show up for the people we work with.",
  ctaLabel: "Let’s build something deliberate.",
  ctaTitle:
    "If you need work that feels clearer, stronger, and more joined up, we should talk.",
  ctaBody:
    "Tell us what you are building, where you feel stuck, and what kind of presence you want to create. We will help shape the next move.",
  ctaText: "Book a Discovery Call",
  ctaHref: "/contact",
};

export const ABOUT_MILESTONE_DEFAULTS: AboutMilestoneData[] = [
  {
    year: "2018",
    title: "Dexta takes shape",
    description:
      "The studio began with a focused design offering and a commitment to clearer, more useful creative work.",
    isVisible: true,
    position: 0,
  },
  {
    year: "2020",
    title: "Digital delivery expands",
    description:
      "We extended from brand execution into websites, product support, and broader digital systems.",
    isVisible: true,
    position: 1,
  },
  {
    year: "2022",
    title: "Cross-sector partnerships grow",
    description:
      "Dexta became a trusted partner for teams across business, education, and institution-led communication.",
    isVisible: true,
    position: 2,
  },
  {
    year: "Today",
    title: "A studio built for momentum",
    description:
      "We continue refining an end-to-end model that helps clients move from idea to execution with less friction.",
    isVisible: true,
    position: 3,
  },
];

export const ABOUT_EXPERTISE_DEFAULTS: AboutExpertiseItemData[] = [
  {
    icon: "TARGET",
    title: "Strategy & Positioning",
    description:
      "We help teams clarify what they are saying, who they are speaking to, and how the brand should show up.",
    metricLabel: "Approach",
    metricValue: "Clarity first",
    isVisible: true,
    position: 0,
  },
  {
    icon: "GLOBE",
    title: "Web & Product Delivery",
    description:
      "From high-conviction landing pages to structured digital platforms, we design and build for performance and trust.",
    metricLabel: "Build focus",
    metricValue: "Reliable systems",
    isVisible: true,
    position: 1,
  },
  {
    icon: "TRENDING_UP",
    title: "Campaign & Communication",
    description:
      "We shape recurring content, visibility systems, and launch support that keep organisations present and consistent.",
    metricLabel: "Outcome",
    metricValue: "Sustained reach",
    isVisible: true,
    position: 2,
  },
  {
    icon: "SPARKLES",
    title: "Brand & Print Rollout",
    description:
      "We carry ideas into polished brand systems, collateral, and physical touchpoints with the same level of care.",
    metricLabel: "Strength",
    metricValue: "Joined-up execution",
    isVisible: true,
    position: 3,
  },
];

export const ABOUT_TEAM_MEMBER_DEFAULTS: AboutTeamMemberData[] = [
  {
    name: "Daniel Azu",
    role: "Creative Director",
    bio: "Daniel leads brand direction, visual systems, and the creative decisions that give each Dexta project its edge and clarity.",
    expertise: ["Brand Systems", "Creative Direction", "Design Leadership"],
    funFact:
      "Known for turning scattered ideas into clear, high-conviction creative systems.",
    portfolioUrl: "/projects",
    showPortfolioButton: true,
    imagePublicId: null,
    isVisible: true,
    position: 0,
  },
  {
    name: "Alison Eyuren",
    role: "Technical Lead",
    bio: "Alison leads technical architecture and delivery, translating design ambition into dependable digital products and platforms.",
    expertise: ["Architecture", "Product Delivery", "Engineering Systems"],
    funFact:
      "Focused on building digital experiences that stay elegant under real-world pressure.",
    portfolioUrl: "/projects",
    showPortfolioButton: true,
    imagePublicId: null,
    isVisible: true,
    position: 1,
  },
  {
    name: "Chika Nwosu",
    role: "Growth & Communications Lead",
    bio: "Chika shapes messaging systems and campaign direction so brands stay visible, relevant, and easier to trust.",
    expertise: ["Campaign Planning", "Audience Growth", "Content Strategy"],
    funFact: "Brings a strong commercial lens to every communication decision.",
    portfolioUrl: "/projects",
    showPortfolioButton: true,
    imagePublicId: null,
    isVisible: true,
    position: 2,
  },
  {
    name: "Temi Adeyemi",
    role: "Product Engineer",
    bio: "Temi focuses on clean implementation, frontend systems, and digital experiences that feel fast, polished, and robust.",
    expertise: ["Frontend Systems", "Performance", "Experience Quality"],
    funFact:
      "Obsessed with the details that make digital products feel effortless to use.",
    portfolioUrl: "/projects",
    showPortfolioButton: true,
    imagePublicId: null,
    isVisible: true,
    position: 3,
  },
];

export const ABOUT_VALUE_DEFAULTS: AboutValueItemData[] = [
  {
    icon: "LIGHTBULB",
    title: "Thoughtful Clarity",
    description:
      "We value work that is well considered, easy to understand, and grounded in clear decisions.",
    isVisible: true,
    position: 0,
  },
  {
    icon: "HEART_HANDSHAKE",
    title: "Real Partnership",
    description:
      "We collaborate closely, communicate honestly, and care about helping the people around us make strong decisions.",
    isVisible: true,
    position: 1,
  },
  {
    icon: "SHIELD",
    title: "Standards That Hold",
    description:
      "We aim for work that remains durable, credible, and useful beyond the moment it ships.",
    isVisible: true,
    position: 2,
  },
];

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
