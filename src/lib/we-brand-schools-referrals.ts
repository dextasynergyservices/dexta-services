export const WE_BRAND_SCHOOLS_REFERRAL_COOKIE =
  "we_brand_schools_referral_code";

export const WE_BRAND_SCHOOLS_REFERRAL_COOKIE_MAX_AGE_SECONDS =
  60 * 60 * 24 * 90;

export type ReferralUsabilityInput = {
  status: "ACTIVE" | "INACTIVE";
  deletedAt: Date | null;
  expiresAt: Date | null;
};

export function getReferralCookieExpiry(expiresAt?: Date | null) {
  const maxExpiry = new Date(
    Date.now() + WE_BRAND_SCHOOLS_REFERRAL_COOKIE_MAX_AGE_SECONDS * 1000,
  );

  if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
    return maxExpiry;
  }

  return expiresAt < maxExpiry ? expiresAt : maxExpiry;
}

export function isReferralUsable(referral: ReferralUsabilityInput) {
  if (referral.status !== "ACTIVE") return false;
  if (referral.deletedAt) return false;
  if (referral.expiresAt && referral.expiresAt.getTime() <= Date.now()) {
    return false;
  }

  return true;
}
