import ProjectsWrapper from "@/components/projects-wrapper";
import { normalizePortfolioTab } from "@/lib/api";

export const metadata = {
  title: "Projects | Our Work",
  description: "Explore our portfolio of design, print, and website projects",
};

interface ProjectsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const { tab } = await searchParams;
  const activeTab = normalizePortfolioTab(tab);

  return <ProjectsWrapper activeTab={activeTab} />;
}
