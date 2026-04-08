import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { UnifiedOffersPageProps } from "@/lib/api";

interface OffersBottomCtaProps {
  content: UnifiedOffersPageProps["content"];
}

export function OffersBottomCta({ content }: OffersBottomCtaProps) {
  return (
    <section className="pb-24 sm:pb-28 lg:pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--offers-hero-bg)] px-8 py-14 text-white sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/15" />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(240px,auto)] lg:items-center lg:gap-16">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/55">
                {content.ctaLabel}
              </p>
              <h2
                className="mt-4 max-w-[16ch] font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-[-0.045em]"
                style={{ textWrap: "balance", overflowWrap: "anywhere" }}
              >
                {content.ctaTitle}
              </h2>
              <p
                className="mt-5 max-w-[40rem] text-base leading-8 text-white/75 sm:text-lg"
                style={{ overflowWrap: "anywhere" }}
              >
                {content.ctaBody}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href={content.cta1Href}
                className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-normal rounded-full bg-white px-7 text-center text-sm font-semibold text-[var(--offers-hero-bg)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--offers-hero-bg)]"
              >
                {content.cta1Text}
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
              <Link
                href={content.cta2Href}
                className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-normal rounded-full border border-white/30 bg-white/8 px-7 text-center text-sm font-semibold text-white transition-colors hover:border-white/55 hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--offers-hero-bg)]"
              >
                {content.cta2Text}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
