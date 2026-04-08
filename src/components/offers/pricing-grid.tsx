"use client";

import type { OffersPlanData } from "@/lib/api";
import type { AudienceColor } from "@/lib/offers-defaults";
import { cn } from "@/lib/utils";
import { PlanCard } from "./plan-card";

interface PricingGridProps {
  title: string;
  description: string | null;
  plans: OffersPlanData[];
  audienceLabel: string;
  offerGroupName: string;
  offersWhatsAppHref: string | null;
  color: AudienceColor;
  popularBadgeText: string;
  featuresLabel: string;
  choosePlanText: string;
  requestQuoteText: string;
}

export function PricingGrid({
  title,
  description,
  plans,
  audienceLabel,
  offerGroupName,
  offersWhatsAppHref,
  color,
  popularBadgeText,
  featuresLabel,
  choosePlanText,
  requestQuoteText,
}: PricingGridProps) {
  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--offers-page-border)] bg-[var(--offers-page-surface)] px-5 py-10 text-center">
        <p className="text-sm text-[var(--offers-page-muted-soft)]">
          No offers are in this group yet.
        </p>
      </div>
    );
  }

  const isSinglePlan = plans.length === 1;
  const gridCols =
    isSinglePlan
      ? "grid-cols-1"
      : plans.length === 2
        ? "grid-cols-1 lg:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className="space-y-6">
      <div>
        <span className="inline-flex rounded-full border border-[var(--offers-page-border)] bg-[var(--offers-page-surface)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--offers-page-muted)]">
          Offers
        </span>
        <h3
          className="mt-3 font-display text-[clamp(1.8rem,4vw,2.5rem)] tracking-[-0.045em] text-[var(--offers-page-fg-strong)]"
          style={{ textWrap: "balance", overflowWrap: "anywhere" }}
        >
          {title}
        </h3>
        {description ? (
          <p
            className="mt-3 max-w-3xl text-sm leading-7 text-[var(--offers-page-muted-soft)] sm:text-base"
            style={{ overflowWrap: "anywhere" }}
          >
            {description}
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          "grid items-stretch gap-5",
          gridCols,
          isSinglePlan && "justify-items-start",
        )}
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(isSinglePlan && "w-full max-w-[26rem]")}
          >
            <PlanCard
              plan={plan}
              audienceLabel={audienceLabel}
              offerGroupName={offerGroupName}
              offersWhatsAppHref={offersWhatsAppHref}
              audienceColor={color}
              popularBadgeText={popularBadgeText}
              featuresLabel={featuresLabel}
              choosePlanText={choosePlanText}
              requestQuoteText={requestQuoteText}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
