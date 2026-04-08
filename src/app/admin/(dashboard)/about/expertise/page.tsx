import { AdminHeader } from "@/components/admin/header";
import { AboutExpertiseContentForm } from "../_components/about-section-content-forms";
import { ExpertiseManager } from "../_components/expertise-manager";
import { getAboutAdminData } from "../actions";

export const metadata = {
  title: "About Expertise — Admin",
};

export const dynamic = "force-dynamic";

export default async function AboutExpertiseAdminPage() {
  const data = await getAboutAdminData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="About Expertise"
        description="Edit the expertise section intro and the cards shown under it."
      />
      <AboutExpertiseContentForm content={data.content} />
      <ExpertiseManager items={data.expertiseItems} />
    </div>
  );
}
