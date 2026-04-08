import { AdminHeader } from "@/components/admin/header";
import type { OffersAudienceType } from "@/lib/offers-defaults";
import { getAudienceSettings, getOfferGroups } from "./actions";
import { PlansManager } from "./_components/plans-manager";

export const metadata = {
  title: "Offers — Admin",
};

export const dynamic = "force-dynamic";

const VALID_TABS: OffersAudienceType[] = [
  "FOR_YOU",
  "BUSINESS",
  "SCHOOLS",
  "CHURCHES",
];

interface OffersPlansPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function OffersPlansPage({
  searchParams,
}: OffersPlansPageProps) {
  const { tab } = await searchParams;

  const [offerGroups, audiences] = await Promise.all([
    getOfferGroups(),
    getAudienceSettings(),
  ]);

  const requestedTab = VALID_TABS.find(
    (candidate) => candidate === tab?.toUpperCase(),
  );
  const firstAudienceWithOffers =
    VALID_TABS.find((candidate) =>
      offerGroups.some((group) => group.audienceType === candidate),
    ) ?? "FOR_YOU";
  const activeTab = requestedTab ?? firstAudienceWithOffers;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Offers"
        description="Manage audience tabs, offer groups, offer cards, and billing options."
      />
      <PlansManager
        offerGroups={offerGroups}
        audiences={audiences}
        activeTab={activeTab}
      />
    </div>
  );
}
