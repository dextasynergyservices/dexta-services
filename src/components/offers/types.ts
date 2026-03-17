export type AudienceId = "business" | "schools" | "churches";

export type OfferType = "REACH" | "SETUP";

export interface PricingPlan {
  name: string;
  priceMonthly: string;
  priceQuarterly: string;
  priceMonthlyNaira: string;
  priceQuarterlyNaira: string;
  description?: string;
  features: string[];
  reachCount?: string;
  highlighted?: boolean;
}

export interface AudienceConfig {
  id: AudienceId;
  title: string;
  subtitle: string;
  /** Icon is derived client-side from this key (keeps config serializable) */
  iconKey: AudienceId;
  color: "cyan" | "blue" | "purple";
  reachPlans: PricingPlan[];
  setupPlans: PricingPlan[];
}
