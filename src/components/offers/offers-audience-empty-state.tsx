import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { OffersAudiencePanelData } from "@/lib/api";
import { getOffersAccentStyle } from "./offers-theme";

interface OffersAudienceEmptyStateProps {
  audience: OffersAudiencePanelData;
}

export function OffersAudienceEmptyState({
  audience,
}: OffersAudienceEmptyStateProps) {
  return (
    <div
      style={getOffersAccentStyle(audience.color)}
      className="rounded-[var(--offers-radius-panel)] border border-[var(--offers-accent-border-strong)] bg-[var(--offers-page-surface)] p-5 sm:p-6"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--offers-accent-strong)]">
        {audience.tabLabel}
      </p>
      <h3 className="mt-3 font-display text-2xl tracking-[-0.04em] text-[var(--offers-page-fg-strong)] sm:text-[2rem]">
        {audience.emptyTitle}
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--offers-page-muted-soft)] sm:text-base">
        {audience.emptyBody}
      </p>

      <div className="mt-6">
        <Link
          href="/contact"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--offers-radius-pill)] bg-[var(--offers-accent-strong)] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--offers-page-surface)]"
        >
          Request a tailored scope
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
