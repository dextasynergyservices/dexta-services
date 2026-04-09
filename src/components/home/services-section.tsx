"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brush,
  Code,
  Printer,
  type LucideIcon,
} from "lucide-react";
import { hexToRgba } from "@/lib/color-utils";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import { ServiceMediaRotator } from "./service-media-rotator";
import type { ServicePanelItem, ServiceType } from "./services-wrapper";

type ServicesSectionProps = {
  services: ServicePanelItem[];
  sectionBackgroundImagePublicId: string | null;
};

const SERVICE_ICONS: Record<ServiceType, LucideIcon> = {
  DESIGN: Brush,
  BUILD: Code,
  PRINT: Printer,
};

function DecorativeServicePanel({
  icon: Icon,
  color,
}: {
  icon: LucideIcon;
  color: string;
}) {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />
      <div
        className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/10 sm:h-40 sm:w-40 lg:h-64 lg:w-64"
        style={{ color }}
      >
        <div className="absolute inset-0 rounded-full border border-current opacity-20 animate-[spin_10s_linear_infinite]" />
        <Icon className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16" />
      </div>
    </>
  );
}

function getIconSrc(publicId: string) {
  return getCloudinaryUrl(publicId, {
    w: 80,
    h: 80,
    c: "fill",
    f: "auto",
    q: "auto",
  });
}

function getSectionBackgroundImageSrc(publicId: string) {
  return getCloudinaryUrl(publicId, {
    w: 1800,
    h: 1200,
    c: "fill",
    g: "auto",
    f: "auto",
    q: "auto",
  });
}

export function ServicesSection({
  services,
  sectionBackgroundImagePublicId,
}: ServicesSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const viewportHeight = window.innerHeight;

      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        const nextCard = cardsRef.current[index + 1];
        let scale = 1;
        let brightness = 1;
        let translateY = 0;

        if (nextCard) {
          const nextRect = nextCard.getBoundingClientRect();
          const distanceToTop = nextRect.top;

          if (distanceToTop > 0 && distanceToTop <= viewportHeight) {
            const progress = 1 - distanceToTop / viewportHeight;
            scale = 1 - progress * 0.1;
            brightness = 1 - progress * 0.5;
            translateY = progress * -20;
          } else if (distanceToTop <= 0) {
            scale = 0.9;
            brightness = 0.5;
            translateY = -20;
          }
        }

        const inner = card.querySelector(".card-inner") as HTMLElement | null;
        if (!inner) return;

        inner.style.transform = `scale(${scale}) translateY(${translateY}px)`;
        inner.style.filter = `brightness(${brightness})`;
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [services.length]);

  return (
    <section
      ref={containerRef}
      className="relative pb-16 pt-14 sm:pb-20 sm:pt-16"
      style={{ backgroundColor: "var(--dexta-primary)" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-screen overflow-hidden">
          {sectionBackgroundImagePublicId ? (
            // We intentionally bypass next/image here because this is a
            // decorative Cloudinary background behind a motion-heavy section.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getSectionBackgroundImageSrc(sectionBackgroundImagePublicId)}
              alt=""
              className="h-full w-full object-cover opacity-70"
              loading="lazy"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{ backgroundColor: "var(--primary-background)" }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "var(--primary-background)",
              opacity: 0.95,
            }}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="sticky top-3 z-30 mb-6 text-center sm:top-4 sm:mb-8 md:top-5 md:mb-10 lg:top-5 lg:mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            PROJECTS
          </h2>
        </div>

        <div className="flex flex-col items-center">
          {services.map((service, index) => {
            const Icon = SERVICE_ICONS[service.type];
            const cardColor = service.cardColor;

            return (
              <div
                key={service.type}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className="pointer-events-none sticky top-16 z-10 flex h-[calc(100vh-4rem)] w-full items-center justify-center sm:top-20 sm:h-[calc(100vh-5rem)] md:top-28 md:h-[calc(100vh-7rem)] lg:top-24 lg:h-[calc(100vh-6rem)]"
              >
                <div
                  className="card-inner pointer-events-auto w-full max-w-4xl overflow-hidden rounded-2xl p-[1px] transition-transform duration-200 ease-out will-change-transform sm:rounded-3xl lg:rounded-[32px]"
                  style={{ transformOrigin: "top center" }}
                >
                  <div
                    className="relative flex h-[68vh] min-h-[29rem] max-h-[34rem] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#050505] sm:h-[60vh] sm:min-h-0 sm:max-h-none sm:rounded-3xl md:h-[30rem] md:flex-row lg:h-[500px] lg:rounded-[32px]"
                    style={{
                      boxShadow: `0 0 50px -10px ${hexToRgba(cardColor, 0.3)}`,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: `linear-gradient(to bottom right, ${hexToRgba(cardColor, 0.4)}, transparent)`,
                      }}
                    />

                    <div className="relative z-10 flex flex-1 flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-12">
                      <div>
                        <div className="mb-4 flex items-center gap-3 sm:mb-6">
                          <div
                            className="rounded-xl border border-white/10 bg-white/5 p-2 sm:rounded-2xl sm:p-3"
                            style={{ color: cardColor }}
                          >
                            {service.iconPublicId ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={getIconSrc(service.iconPublicId)}
                                alt=""
                                className="h-10 w-10 object-contain"
                              />
                            ) : (
                              <Icon className="h-10 w-10" />
                            )}
                          </div>
                          <span className="font-mono text-xs tracking-[0.3em] text-gray-500">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <h3 className="mb-4 text-2xl font-bold text-white sm:mb-6 sm:text-3xl lg:text-4xl xl:text-5xl">
                          {service.title}
                        </h3>
                        <p className="max-w-md text-sm leading-relaxed text-gray-400 sm:text-base lg:text-lg">
                          {service.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="mt-6 flex items-center gap-2 text-xs font-mono text-gray-500 transition-colors hover:text-white sm:mt-8 sm:text-sm md:mt-6"
                        onClick={() =>
                          router.push(
                            `/projects?tab=${service.type.toLowerCase()}`,
                          )
                        }
                      >
                        <span className="uppercase tracking-widest">
                          Explore {service.title}
                        </span>
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>

                    <div
                      className={cn(
                        "relative z-10 flex flex-1 overflow-hidden sm:min-h-[300px] md:min-h-0",
                        service.featuredItems.length > 0
                          ? "items-stretch justify-stretch"
                          : "items-center justify-center border-t border-white/10 bg-white/5 p-6 sm:p-8 md:border-l md:border-t-0 md:p-10 lg:p-10",
                      )}
                    >
                      {service.featuredItems.length > 0 ? (
                        <>
                          <ServiceMediaRotator items={service.featuredItems} />
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                          <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.25em] text-white/70 backdrop-blur-sm sm:left-6 sm:top-6">
                            Featured work
                          </div>
                        </>
                      ) : (
                        <DecorativeServicePanel icon={Icon} color={cardColor} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-[45vh] sm:h-[55vh] md:h-[42vh]" />
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </section>
  );
}

export default ServicesSection;
