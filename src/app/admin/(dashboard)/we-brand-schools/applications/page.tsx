import { AdminHeader } from "@/components/admin/header";
import { getSchoolWebsiteApplicationsAdmin } from "../actions";
import { WeBrandSchoolsAdminTabs } from "../_components/we-brand-schools-admin-tabs";
import { ApplicationsManager } from "./applications-manager";

export const metadata = {
  title: "We Brand Schools Applications — Admin",
};

export const dynamic = "force-dynamic";

export default async function WeBrandSchoolsApplicationsPage() {
  const applications = await getSchoolWebsiteApplicationsAdmin();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="School Applications"
        description="Review submissions, inspect full school details, and move each request through your delivery workflow."
      />
      <WeBrandSchoolsAdminTabs />
      <ApplicationsManager applications={applications} />
    </div>
  );
}
