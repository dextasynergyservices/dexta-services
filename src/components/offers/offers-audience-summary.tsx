import type { OffersAudiencePanelData, OffersGroupData } from "@/lib/api";
import {
  getOffersAudienceLabel,
  OFFERS_AUDIENCE_META,
} from "./offers-constants";

interface OffersAudienceSummaryProps {
  audience: OffersAudiencePanelData;
  selectedGroup: OffersGroupData | null;
}

export function OffersAudienceSummary({
  audience,
  selectedGroup,
}: OffersAudienceSummaryProps) {
  const meta = OFFERS_AUDIENCE_META[audience.slug];
  const Icon = meta.icon;
  const audienceLabel = getOffersAudienceLabel(
    audience.slug,
    audience.tabLabel,
  );
  const totalPlans = audience.offerGroups.reduce(
    (count, group) => count + group.plans.length,
    0,
  );

  return (
    <div className="rounded-2xl border border-[var(--offers-page-border)] bg-[var(--offers-page-surface)] p-6 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <div>
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--offers-page-border)] bg-[var(--offers-page-surface-subtle)]">
              <Icon className="h-5 w-5 text-[var(--offers-page-fg-strong)]" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--offers-page-muted)]">
              {audienceLabel}
            </p>
          </div>

          <h3
            className="mt-4 font-display text-[clamp(1.8rem,4vw,2.5rem)] tracking-[-0.045em] text-[var(--offers-page-fg-strong)]"
            style={{ textWrap: "balance", overflowWrap: "anywhere" }}
          >
            {selectedGroup?.name ?? `${audienceLabel} Offers`}
          </h3>

          <p
            className="mt-3 max-w-3xl text-sm leading-7 text-[var(--offers-page-muted-soft)] sm:text-base"
            style={{ overflowWrap: "anywhere" }}
          >
            {selectedGroup?.description ??
              audience.emptyBody ??
              "Switch between the offer tabs below to explore the packages available for this audience."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--offers-page-border)] bg-[var(--offers-page-surface-subtle)] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--offers-page-muted)]">
              Offer Tabs
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--offers-page-fg-strong)]">
              {audience.offerGroups.length}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--offers-page-border)] bg-[var(--offers-page-surface-subtle)] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--offers-page-muted)]">
              Plans
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--offers-page-fg-strong)]">
              {totalPlans}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
