import { redirect } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import {
  DEFAULT_OFFERS_AUDIENCE,
  toAudienceHref,
} from "@/components/offers/offers-constants";
import { OffersPage } from "@/components/offers/offers-page";
import {
  fetchUnifiedOffersPage,
  type OffersAudienceSlug,
} from "@/lib/api";

export const metadata = {
  title: "Offers | Dexta Synergy Services",
  description:
    "Explore Dexta offers for the general public, businesses, schools, and churches from one unified page.",
};

export const dynamic = "force-dynamic";

function normalizeAudienceParam(
  value: string | string[] | undefined,
): OffersAudienceSlug | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  const normalized = candidate?.toLowerCase();

  if (
    normalized === "for-you" ||
    normalized === "business" ||
    normalized === "schools" ||
    normalized === "churches"
  ) {
    return normalized;
  }

  return null;
}

interface OffersPageRouteProps {
  searchParams: Promise<{ audience?: string | string[] }>;
}

export default async function OffersPageRoute({
  searchParams,
}: OffersPageRouteProps) {
  const params = await searchParams;
  const rawAudience = Array.isArray(params.audience)
    ? params.audience[0]
    : params.audience;
  const requestedAudience = normalizeAudienceParam(params.audience);
  const pageData = await fetchUnifiedOffersPage();

  const fallbackAudience =
    pageData.audiences.find((audience) => audience.slug === DEFAULT_OFFERS_AUDIENCE)
      ?.slug ??
    pageData.initialAudience ??
    pageData.audiences[0]?.slug ??
    DEFAULT_OFFERS_AUDIENCE;

  if (rawAudience && requestedAudience === null) {
    redirect(toAudienceHref(fallbackAudience));
  }

  const initialAudience =
    pageData.audiences.find((audience) => audience.slug === requestedAudience)
      ?.slug ?? fallbackAudience;

  if (requestedAudience && requestedAudience !== initialAudience) {
    redirect(toAudienceHref(initialAudience));
  }

  return (
    <PageTransition>
      <OffersPage {...pageData} initialAudience={initialAudience} />
    </PageTransition>
  );
}
