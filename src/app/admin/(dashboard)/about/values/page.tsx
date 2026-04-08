import { AdminHeader } from "@/components/admin/header";
import { AboutValuesContentForm } from "../_components/about-section-content-forms";
import { ValuesManager } from "../_components/values-manager";
import { getAboutAdminData } from "../actions";

export const metadata = {
  title: "About Values — Admin",
};

export const dynamic = "force-dynamic";

export default async function AboutValuesAdminPage() {
  const data = await getAboutAdminData();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="About Values"
        description="Edit the values section intro and the values cards shown near the end of the About page."
      />
      <AboutValuesContentForm content={data.content} />
      <ValuesManager items={data.valueItems} />
    </div>
  );
}
