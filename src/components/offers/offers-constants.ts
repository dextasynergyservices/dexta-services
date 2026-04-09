import {
  Brush,
  Building2,
  Code2,
  GraduationCap,
  Landmark,
  Printer,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { OffersAudienceSlug } from "@/lib/api";

export const DEFAULT_OFFERS_AUDIENCE: OffersAudienceSlug = "for-you";

export const OFFERS_AUDIENCE_META: Record<
  OffersAudienceSlug,
  {
    icon: LucideIcon;
  }
> = {
  "for-you": {
    icon: UserRound,
  },
  business: {
    icon: Building2,
  },
  schools: {
    icon: GraduationCap,
  },
  churches: {
    icon: Landmark,
  },
};

export const OFFERS_SERVICE_ICONS: Record<
  "DESIGN" | "BUILD" | "PRINT",
  LucideIcon
> = {
  DESIGN: Brush,
  BUILD: Code2,
  PRINT: Printer,
};

export function getOffersAudienceLabel(
  slug: OffersAudienceSlug,
  fallbackLabel: string,
) {
  return slug === "churches" ? "Church/Organisation" : fallbackLabel;
}

export function toAudienceHref(slug: OffersAudienceSlug) {
  return slug === DEFAULT_OFFERS_AUDIENCE
    ? "/offers"
    : `/offers?audience=${slug}`;
}
