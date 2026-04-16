import { AdminHeader } from "@/components/admin/header";
import { getSchoolWebsiteTemplatesAdmin } from "../actions";
import { WeBrandSchoolsAdminTabs } from "../_components/we-brand-schools-admin-tabs";
import { TemplatesManager } from "./templates-manager";

export const metadata = {
  title: "We Brand Schools Templates — Admin",
};

export const dynamic = "force-dynamic";

export default async function WeBrandSchoolsTemplatesPage() {
  const templates = await getSchoolWebsiteTemplatesAdmin();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="School Templates"
        description="Add, edit, and remove the template catalog, including preview assets, videos, cover selection, and live site URLs."
      />
      <WeBrandSchoolsAdminTabs />
      <TemplatesManager templates={templates} />
    </div>
  );
}
