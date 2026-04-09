import { AdminHeader } from "@/components/admin/header";
import { AboutSpaceSectionForm } from "../_components/about-section-content-forms";
import { SpaceManager } from "../_components/space-manager";
import { getAboutAdminData } from "../actions";

export const metadata = {
  title: "About Space — Admin",
};

export const dynamic = "force-dynamic";

export default async function AboutSpaceAdminPage() {
  const data = await getAboutAdminData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="About Our Space"
        description="Edit the Our Space section copy and manage the office space cards shown on the public About page."
      />
      <AboutSpaceSectionForm content={data.content} />
      <SpaceManager items={data.spaceItems} />
    </div>
  );
}
