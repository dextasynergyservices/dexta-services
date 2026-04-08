import { unstable_cache } from "next/cache";

import ProjectPage from "@/components/projectPage";
import {
  fetchPortfolioItems,
  fetchPortfolioTabCounts,
  fetchProjectsHeroContent,
  fetchPortfolioTabContent,
  portfolioTabToServiceType,
  type PortfolioItem,
  type PortfolioTab,
  type PortfolioTabCounts,
  type ProjectsHeroData,
  type PortfolioTabContentMap,
} from "@/lib/api";

type ProjectsWrapperProps = {
  activeTab: PortfolioTab;
};

type ProjectsPageData = {
  projects: PortfolioItem[];
  counts: PortfolioTabCounts;
  heroContent: ProjectsHeroData;
  tabContent: PortfolioTabContentMap;
};

const EMPTY_COUNTS: PortfolioTabCounts = {
  design: 0,
  build: 0,
  print: 0,
};

const EMPTY_HERO: ProjectsHeroData = {
  eyebrow: "Portfolio selection",
  headline: "Work that looks sharp, moves with intent, and lands where it matters.",
  body: "",
  backgroundImagePublicId: null,
  ctaText: "Start a Project",
  ctaHref: "/contact",
  ctaSectionLabel: "Start something precise",
  ctaSectionHeadline: "If the work feels close to what you need, we should talk.",
  ctaSectionBody: "We take ideas from early direction through execution, across digital, print, and the spaces in between.",
  cta2Text: "Explore Services",
  cta2Href: "/#services",
};

const EMPTY_TAB_CONTENT: PortfolioTabContentMap = {
  design: { portfolioEyebrow: "Identity systems, campaigns, and visual direction", portfolioDescription: "Brand worlds, interfaces, and design systems shaped to feel sharp, intentional, and unmistakably on-message." },
  build: { portfolioEyebrow: "Web platforms, products, and digital experiences", portfolioDescription: "High-performance sites and software products built to convert, scale, and stay elegant under pressure." },
  print: { portfolioEyebrow: "Physical touchpoints with real-world presence", portfolioDescription: "Editorial layouts, signage, packaging, and production-ready print work that carries the brand with confidence." },
};

async function fetchProjectsPageData(
  activeTab: PortfolioTab,
): Promise<ProjectsPageData> {
  const [projects, counts, heroContent, tabContent] = await Promise.all([
    fetchPortfolioItems(portfolioTabToServiceType(activeTab)),
    fetchPortfolioTabCounts(),
    fetchProjectsHeroContent(),
    fetchPortfolioTabContent(),
  ]);

  return { projects, counts, heroContent, tabContent };
}

const getCachedProjectsPageData = unstable_cache(
  fetchProjectsPageData,
  ["portfolio-content"],
  {
    tags: ["portfolio-content", "projects-hero-content"],
    revalidate: 60,
  },
);

async function getProjectsPageData(activeTab: PortfolioTab) {
  if (process.env.NODE_ENV === "development") {
    return fetchProjectsPageData(activeTab);
  }

  return getCachedProjectsPageData(activeTab);
}

export default async function ProjectsWrapper({
  activeTab,
}: ProjectsWrapperProps) {
  const { projects, counts, heroContent, tabContent } =
    await getProjectsPageData(activeTab).catch((error) => {
      const message =
        error instanceof Error ? error.message : "Unknown database error";

      console.warn(
        `[ProjectsWrapper] Falling back to empty portfolio data because the database is unavailable: ${message}`,
      );

      return {
        projects: [] as PortfolioItem[],
        counts: EMPTY_COUNTS,
        heroContent: EMPTY_HERO,
        tabContent: EMPTY_TAB_CONTENT,
      };
    });

  return (
    <ProjectPage
      activeTab={activeTab}
      projects={projects}
      counts={counts}
      heroContent={heroContent}
      tabContent={tabContent}
    />
  );
}
