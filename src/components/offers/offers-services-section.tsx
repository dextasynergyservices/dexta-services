import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { UnifiedOffersPageProps } from "@/lib/api";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { hexToRgba } from "@/lib/color-utils";
import { OFFERS_SERVICE_ICONS } from "./offers-constants";
import { OffersSectionIntro } from "./offers-section-intro";

interface OffersServicesSectionProps {
  label: string;
  title: string;
  body: string;
  services: UnifiedOffersPageProps["services"];
}

export function OffersServicesSection({
  label,
  title,
  body,
  services,
}: OffersServicesSectionProps) {
  return (
    <section
      id="services"
      className="py-20 sm:py-24 lg:py-28 bg-[var(--offers-page-surface-subtle)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-4 motion-safe:duration-700 motion-reduce:animate-none">
          <OffersSectionIntro label={label} title={title} body={body} align="left" />
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {services.map((service) => {
            const Icon = OFFERS_SERVICE_ICONS[service.type];

            return (
              <article
                key={service.type}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--offers-page-border)] bg-[var(--offers-page-surface)] p-6 motion-safe:transition-all motion-safe:duration-300 motion-safe:hover:-translate-y-1 motion-reduce:transition-none lg:p-8"
              >
                <div
                  className="absolute left-0 top-0 h-[3px] w-full"
                  style={{ backgroundColor: service.cardColor }}
                />

                <div className="relative flex h-full flex-col">
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border"
                    style={{
                      backgroundColor: hexToRgba(service.cardColor, 0.1),
                      borderColor: hexToRgba(service.cardColor, 0.2),
                      color: service.cardColor,
                    }}
                  >
                    {service.iconPublicId ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getCloudinaryUrl(service.iconPublicId, {
                          w: 72,
                          h: 72,
                          c: "fit",
                        })}
                        alt={`${service.title} icon`}
                        className="h-8 w-8 object-contain"
                      />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--offers-page-muted)]">
                    {service.type}
                  </p>
                  <h3
                    className="mt-2 font-display text-2xl tracking-[-0.04em] text-[var(--offers-page-fg-strong)] lg:text-[1.65rem]"
                    style={{ textWrap: "balance", overflowWrap: "anywhere" }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="mt-3 flex-1 text-sm leading-7 text-[var(--offers-page-muted-soft)]"
                    style={{ overflowWrap: "anywhere" }}
                  >
                    {service.description}
                  </p>

                  <Link
                    href={`/projects?tab=${service.type.toLowerCase()}`}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--offers-page-fg-strong)] transition-colors hover:text-[var(--dexta-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--offers-page-surface)]"
                  >
                    See related work
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
