import { AdminHeader } from "@/components/admin/header";
import { getReferralLinksAdmin } from "../actions";
import { WeBrandSchoolsAdminTabs } from "../_components/we-brand-schools-admin-tabs";
import { ReferralsManager } from "./referrals-manager";

export const metadata = {
  title: "We Brand Schools Referrals — Admin",
};

export const dynamic = "force-dynamic";

export default async function WeBrandSchoolsReferralsPage() {
  const referrals = await getReferralLinksAdmin();

  return (
    <div className="space-y-6">
      <AdminHeader
        title="We Brand Schools Referrals"
        description="Create and manage unique referral links for partners, people, and organizations."
      />
      <WeBrandSchoolsAdminTabs />
      <ReferralsManager referrals={referrals} />
    </div>
  );
}
