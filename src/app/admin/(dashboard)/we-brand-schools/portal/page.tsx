import { AdminHeader } from "@/components/admin/header";
import {
  getSchoolPortalFeatureCardsAdmin,
  getSchoolPortalSectionContentAdmin,
} from "../actions";
import { WeBrandSchoolsAdminTabs } from "../_components/we-brand-schools-admin-tabs";
import { PortalManager } from "./portal-manager";

export const metadata = {
  title: "We Brand Schools Portal — Admin",
};

export const dynamic = "force-dynamic";

export default async function WeBrandSchoolsPortalPage() {
  const [sectionContent, cards] = await Promise.all([
    getSchoolPortalSectionContentAdmin(),
    getSchoolPortalFeatureCardsAdmin(),
  ]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="School Portal"
        description="Manage the free portal section, feature cards, screenshots, videos, YouTube demos, and modal content shown on the We Brand Schools page."
      />
      <WeBrandSchoolsAdminTabs />
      <PortalManager sectionContent={sectionContent} cards={cards} />
    </div>
  );
}
