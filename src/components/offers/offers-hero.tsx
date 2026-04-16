import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type {
  OffersAudiencePanelData,
  OffersAudienceSlug,
  UnifiedOffersPageProps,
} from "@/lib/api";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import {
  getOffersAudienceLabel,
  OFFERS_AUDIENCE_META,
  toAudienceHref,
} from "./offers-constants";

interface OffersHeroProps {
  content: UnifiedOffersPageProps["content"];
  audiences: OffersAudiencePanelData[];
  activeAudience: OffersAudienceSlug;
}

export function OffersHero({
  content,
  audiences,
  activeAudience,
}: OffersHeroProps) {
  const heroImagePublicId = content.heroBgImagePublicId;
  const hasHeroImage = Boolean(heroImagePublicId);
  const heroImageSrc =
    heroImagePublicId && /^https?:\/\//i.test(heroImagePublicId)
      ? heroImagePublicId
      : heroImagePublicId
        ? getCloudinaryUrl(heroImagePublicId, {
            w: 2200,
            h: 1400,
            c: "fill",
            f: "auto",
            g: "auto",
            q: "auto",
          })
        : null;

  return (
    <section className="relative overflow-hidden bg-[var(--offers-hero-bg)] text-white">
      {heroImageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroImageSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
      ) : null}
      <div
        className={cn(
          "absolute inset-0",
          hasHeroImage
            ? "bg-[color-mix(in_srgb,var(--offers-hero-bg)_75%,transparent)]"
            : "bg-[var(--offers-hero-bg)]",
        )}
      />
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-20 sm:py-24 lg:py-28 xl:py-32">
          <div className="max-w-[54rem] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-reduce:animate-none">
            {content.heroEyebrow ? (
              <p className="inline-flex rounded-full border border-white bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--offers-hero-bg)]">
                {content.heroEyebrow}
              </p>
            ) : null}

            <h1
              className="mt-6 max-w-[13ch] font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.92] tracking-[-0.05em]"
              style={{ textWrap: "balance", overflowWrap: "anywhere" }}
            >
              {content.heroHeadline}
            </h1>

            <p
              className="mt-6 max-w-[42rem] text-base leading-8 text-white/80 sm:text-lg"
              style={{ overflowWrap: "anywhere" }}
            >
              {content.heroBody}
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link
                href={content.heroCtaHref}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[var(--offers-hero-bg)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--offers-hero-bg)]"
              >
                {content.heroCtaText}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/30 bg-white/8 px-7 text-sm font-semibold text-white transition-colors hover:border-white/55 hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--offers-hero-bg)]"
              >
                Get a Quote
              </Link>
            </div>
          </div>

          <div className="mt-14 border-t border-white/15 pt-8 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-1000 motion-reduce:animate-none">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
              Choose your audience path
            </p>
            <div
              className="mt-4 flex flex-wrap gap-3"
              aria-label="Audience paths"
            >
              {audiences.map((audience) => {
                const meta = OFFERS_AUDIENCE_META[audience.slug];
                const Icon = meta.icon;
                const isActive = activeAudience === audience.slug;
                const audienceLabel = getOffersAudienceLabel(
                  audience.slug,
                  audience.tabLabel,
                );

                return (
                  <Link
                    key={audience.slug}
                    href={`${toAudienceHref(audience.slug)}#audiences`}
                    className={cn(
                      "inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--offers-hero-bg)]",
                      isActive
                        ? "border-white bg-white text-[var(--offers-hero-bg)]"
                        : "border-white/20 bg-white/8 text-white/80 hover:border-white/45 hover:bg-white/14 hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {audienceLabel}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
