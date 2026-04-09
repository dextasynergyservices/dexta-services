"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  OffersAudiencePanelData,
  OffersAudienceSlug,
  OffersGroupData,
  UnifiedOffersPageProps,
} from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  getOffersAudienceLabel,
  OFFERS_AUDIENCE_META,
} from "./offers-constants";
import { OffersAudienceEmptyState } from "./offers-audience-empty-state";
import { OffersSectionIntro } from "./offers-section-intro";
import { PricingGrid } from "./pricing-grid";
import { getOffersAccentStyle } from "./offers-theme";

interface OffersAudienceTabsProps {
  content: UnifiedOffersPageProps["content"];
  audiences: OffersAudiencePanelData[];
  offersWhatsAppHref: UnifiedOffersPageProps["offersWhatsAppHref"];
  activeAudience: OffersAudienceSlug;
  onAudienceChange: (audience: OffersAudienceSlug) => void;
}

function getDefaultGroup(audience: OffersAudiencePanelData) {
  return audience.offerGroups[0] ?? null;
}

export function OffersAudienceTabs({
  content,
  audiences,
  offersWhatsAppHref,
  activeAudience,
  onAudienceChange,
}: OffersAudienceTabsProps) {
  const [activeGroups, setActiveGroups] = useState<Record<string, string>>({});

  useEffect(() => {
    setActiveGroups((current) => {
      const next = { ...current };
      let changed = false;

      for (const audience of audiences) {
        const selectedGroupId = next[audience.slug];
        const selectedStillExists = audience.offerGroups.some(
          (group) => group.id === selectedGroupId,
        );

        if (!selectedStillExists) {
          const fallbackGroup = getDefaultGroup(audience);
          next[audience.slug] = fallbackGroup?.id ?? "";
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [audiences]);

  const selectedGroups = useMemo(() => {
    return Object.fromEntries(
      audiences.map((audience) => {
        const selectedId = activeGroups[audience.slug];
        const selectedGroup =
          audience.offerGroups.find((group) => group.id === selectedId) ??
          getDefaultGroup(audience);
        return [audience.slug, selectedGroup ?? null];
      }),
    ) as Record<OffersAudienceSlug, OffersGroupData | null>;
  }, [activeGroups, audiences]);

  return (
    <section id="pricing" className="py-20 sm:py-24 lg:py-28">
      <div id="audiences" className="scroll-mt-24" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <OffersSectionIntro
          label={content.audienceSectionLabel}
          title={content.audienceSectionTitle}
          body={content.audienceSectionBody}
          align="left"
        />

        <Tabs
          value={activeAudience}
          onValueChange={(value) =>
            onAudienceChange(value as OffersAudienceSlug)
          }
          className="mt-10 gap-10 sm:mt-12"
        >
          <TabsList
            aria-label="Audience paths"
            className="flex h-auto w-full flex-wrap gap-2 bg-transparent p-0"
          >
            {audiences.map((audience) => {
              const meta = OFFERS_AUDIENCE_META[audience.slug];
              const Icon = meta.icon;
              const audienceLabel = getOffersAudienceLabel(
                audience.slug,
                audience.tabLabel,
              );

              return (
                <TabsTrigger
                  key={audience.slug}
                  value={audience.slug}
                  style={getOffersAccentStyle(audience.color)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--offers-page-border)] bg-[var(--offers-page-surface)] px-5 py-2 text-sm font-semibold text-[var(--offers-page-fg-strong)] transition-all focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--offers-page-bg)] data-[state=active]:border-[var(--dexta-primary)] data-[state=active]:bg-[var(--dexta-primary)] data-[state=active]:text-white"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {audienceLabel}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {audiences.map((audience) => {
            const selectedGroup = selectedGroups[audience.slug];
            const hasAnyGroups = audience.offerGroups.length > 0;
            const audienceLabel = getOffersAudienceLabel(
              audience.slug,
              audience.tabLabel,
            );

            return (
              <TabsContent
                key={audience.slug}
                value={audience.slug}
                className="mt-0 space-y-6 sm:space-y-8"
              >
                {hasAnyGroups ? (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--offers-page-muted)]">
                          Switch Offer
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {audience.offerGroups.map((group) => (
                            <button
                              key={group.id}
                              type="button"
                              onClick={() =>
                                setActiveGroups((current) => ({
                                  ...current,
                                  [audience.slug]: group.id,
                                }))
                              }
                              className={cn(
                                "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
                                selectedGroup?.id === group.id
                                  ? "border-[var(--dexta-secondary)] bg-[var(--dexta-primary)] text-white"
                                  : "border-[var(--offers-page-border)] bg-white text-[var(--offers-page-fg-strong)] hover:border-[var(--dexta-primary)] hover:text-[var(--dexta-secondary)]",
                              )}
                            >
                              {group.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {selectedGroup ? (
                        <div className="rounded-[var(--offers-radius-panel)] border border-[var(--offers-page-border)] bg-[var(--offers-page-surface)] p-5 sm:p-6">
                          <PricingGrid
                            title={selectedGroup.name}
                            description={selectedGroup.description}
                            plans={selectedGroup.plans}
                            audienceLabel={audienceLabel}
                            offerGroupName={selectedGroup.name}
                            offersWhatsAppHref={offersWhatsAppHref}
                            color={audience.color}
                            popularBadgeText={content.popularBadgeText}
                            featuresLabel={content.featuresLabel}
                            choosePlanText={content.choosePlanText}
                            requestQuoteText={content.requestQuoteText}
                          />
                        </div>
                      ) : (
                        <OffersAudienceEmptyState audience={audience} />
                      )}
                    </div>
                  </>
                ) : (
                  <OffersAudienceEmptyState audience={audience} />
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}
