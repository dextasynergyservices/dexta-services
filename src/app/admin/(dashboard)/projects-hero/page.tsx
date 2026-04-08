import { AdminHeader } from "@/components/admin/header";
import { getProjectsHeroContent, getPortfolioTabContent } from "./actions";
import { ProjectsHeroForm } from "./_components/projects-hero-form";

export const metadata = {
  title: "Portfolio Page — Admin",
};

export const dynamic = "force-dynamic";

export default async function ProjectsHeroPage() {
  const [hero, tabs] = await Promise.all([
    getProjectsHeroContent(),
    getPortfolioTabContent(),
  ]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Portfolio Page"
        description="Edit the hero section, tab descriptions, and bottom CTA for the /projects portfolio page"
      />
      <ProjectsHeroForm hero={hero} tabs={tabs} />
    </div>
  );
}
