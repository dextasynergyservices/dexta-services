"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { OffersAudienceSlug, UnifiedOffersPageProps } from "@/lib/api";
import { toAudienceHref } from "./offers-constants";
import { OffersAudienceTabs } from "./offers-audience-tabs";
import { OffersBottomCta } from "./offers-bottom-cta";
import { OffersHero } from "./offers-hero";
import { OffersPageEmptyState } from "./offers-page-empty-state";
import { OFFERS_THEME_STYLE } from "./offers-theme";

export function OffersPage({
  content,
  audiences,
  initialAudience,
  offersWhatsAppHref,
}: UnifiedOffersPageProps) {
  const router = useRouter();
  const [activeAudience, setActiveAudience] =
    useState<OffersAudienceSlug>(initialAudience);

  useEffect(() => {
    setActiveAudience(initialAudience);
  }, [initialAudience]);

  const currentAudience = useMemo(
    () =>
      audiences.find((audience) => audience.slug === activeAudience) ??
      audiences[0] ??
      null,
    [activeAudience, audiences],
  );

  if (!currentAudience) {
    return <OffersPageEmptyState />;
  }

  return (
    <main
      style={OFFERS_THEME_STYLE}
      className="bg-[var(--offers-page-bg)] text-[var(--offers-page-fg)]"
    >
      <OffersHero
        content={content}
        audiences={audiences}
        activeAudience={currentAudience.slug}
      />

      <OffersAudienceTabs
        content={content}
        audiences={audiences}
        offersWhatsAppHref={offersWhatsAppHref}
        activeAudience={currentAudience.slug}
        onAudienceChange={(nextAudience) => {
          if (nextAudience === currentAudience.slug) return;

          setActiveAudience(nextAudience);
          startTransition(() => {
            router.replace(toAudienceHref(nextAudience), { scroll: false });
          });
        }}
      />

      <OffersBottomCta content={content} />
    </main>
  );
}
