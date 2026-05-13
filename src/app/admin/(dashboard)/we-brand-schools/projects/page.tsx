import { AdminHeader } from "@/components/admin/header";
import {
  getSchoolWebsiteProjectsAdmin,
  type SchoolWebsiteProjectRow,
} from "../actions";
import { WeBrandSchoolsAdminTabs } from "../_components/we-brand-schools-admin-tabs";
import { ProjectsManager } from "./projects-manager";

export const metadata = {
  title: "School Website Projects — Admin",
};

export const dynamic = "force-dynamic";

export default async function WeBrandSchoolsProjectsPage() {
  const projects: SchoolWebsiteProjectRow[] =
    await getSchoolWebsiteProjectsAdmin();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Website Projects"
        description="Manage editable school website copies, exports, previews, and downloads."
      />
      <WeBrandSchoolsAdminTabs />
      <ProjectsManager projects={projects} />
    </div>
  );
}
