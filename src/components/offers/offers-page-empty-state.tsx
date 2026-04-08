import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OFFERS_THEME_STYLE } from "./offers-theme";

export function OffersPageEmptyState() {
  return (
    <main
      style={OFFERS_THEME_STYLE}
      className="bg-[var(--offers-page-bg)] px-4 py-24 text-[var(--offers-page-fg)] sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl rounded-[var(--offers-radius-panel)] border border-[var(--offers-page-border)] bg-[var(--offers-page-surface)] px-6 py-16 text-center shadow-[var(--offers-shadow-soft)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--offers-page-muted)]">
          Offers
        </p>
        <h1 className="mt-4 font-display text-3xl tracking-[-0.04em] text-[var(--offers-page-fg-strong)] sm:text-4xl">
          Offers are unavailable right now.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--offers-page-muted-soft)] sm:text-base">
          We&apos;re updating the current offer paths. Reach out and we&apos;ll
          help you choose the right service mix for your team.
        </p>
        <div className="mt-8">
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--offers-radius-pill)] bg-[var(--dexta-primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
          >
            Contact Dexta
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
