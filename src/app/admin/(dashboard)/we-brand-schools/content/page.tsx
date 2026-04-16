import { AdminHeader } from "@/components/admin/header";
import { getWeBrandSchoolsPageContent } from "../actions";
import { WeBrandSchoolsAdminTabs } from "../_components/we-brand-schools-admin-tabs";
import { WeBrandSchoolsContentForm } from "./we-brand-schools-content-form";

export const metadata = {
  title: "We Brand Schools Content — Admin",
};

export const dynamic = "force-dynamic";

export default async function WeBrandSchoolsContentPage() {
  const content = await getWeBrandSchoolsPageContent();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="We Brand Schools"
        description="Manage the landing page copy, logo, hero media, and section text for the public offer page."
      />
      <WeBrandSchoolsAdminTabs />
      <WeBrandSchoolsContentForm content={content} />
    </div>
  );
}
