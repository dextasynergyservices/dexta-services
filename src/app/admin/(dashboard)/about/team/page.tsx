import { AdminHeader } from "@/components/admin/header";
import { AboutTeamSectionForm } from "../_components/about-section-content-forms";
import { TeamManager } from "../_components/team-manager";
import { getAboutAdminData } from "../actions";

export const metadata = {
  title: "About Team — Admin",
};

export const dynamic = "force-dynamic";

export default async function AboutTeamAdminPage() {
  const data = await getAboutAdminData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="About Team"
        description="Edit the team section copy and manage the public staff profiles."
      />
      <AboutTeamSectionForm content={data.content} />
      <TeamManager items={data.teamMembers} />
    </div>
  );
}
