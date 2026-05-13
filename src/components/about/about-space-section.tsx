"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import type { AboutSpaceItemData } from "@/lib/about-defaults";

const ABOUT_SPACE_FALLBACK = "/images/about.png";

function resolveImageSrc(
  value: string | null | undefined,
  options?: Record<string, string | number>,
) {
  if (!value) {
    return ABOUT_SPACE_FALLBACK;
  }

  if (/^https?:\/\//i.test(value) || value.startsWith("/")) {
    return value;
  }

  return getCloudinaryUrl(value, options);
}

function getVideoUrl(publicId: string) {
  if (/^https?:\/\//i.test(publicId) || publicId.startsWith("/")) {
    return publicId;
  }

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto/${publicId}`;
}

function getPreviewSrc(item: AboutSpaceItemData) {
  if (item.mediaType === "VIDEO") {
    return resolveImageSrc(item.thumbnailPublicId, {
      c: "fill",
      f: "auto",
      g: "auto",
      h: 900,
      q: "auto",
      w: 1400,
    });
  }

  return resolveImageSrc(item.mediaPublicId, {
    c: "fill",
    f: "auto",
    g: "auto",
    h: 900,
    q: "auto",
    w: 1400,
  });
}

function getFullImageSrc(item: AboutSpaceItemData) {
  return resolveImageSrc(item.mediaPublicId, {
    c: "limit",
    f: "auto",
    h: 1600,
    q: "auto",
    w: 2200,
  });
}

interface AboutSpaceSectionProps {
  label: string;
  title: string;
  body: string;
  items: AboutSpaceItemData[];
}

export function AboutSpaceSection({
  label,
  title,
  body,
  items,
}: AboutSpaceSectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedItem =
    selectedIndex === null ? null : (items[selectedIndex] ?? null);

  const previewSources = useMemo(
    () => items.map((item) => getPreviewSrc(item)),
    [items],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <section className="bg-[color-mix(in_srgb,var(--about-accent)_9%,white)] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--about-accent)]">
              {label}
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-[-0.04em] text-[var(--about-brand-deep)] sm:text-5xl">
              {title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--about-brand-deep)]">
              {body}
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => (
              <button
                key={`${item.position}-${item.title}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="group overflow-hidden rounded-[24px] border border-[var(--about-border)] bg-white text-left transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-[var(--about-brand)] hover:shadow-[0_24px_80px_-48px_rgba(0,12,153,0.45)]"
              >
                <div className="relative aspect-[16/11] overflow-hidden border-b border-[var(--about-border)] bg-[color-mix(in_srgb,var(--about-brand-deep)_8%,white)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSources[index]}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,19,57,0.72)] via-[rgba(7,19,57,0.18)] to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className="rounded-full border border-white/25 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--about-brand-deep)]">
                      {item.mediaType === "VIDEO"
                        ? "Video Tour"
                        : "Gallery View"}
                    </span>
                    {item.mediaType === "VIDEO" ? (
                      <span className="rounded-full border border-white/25 bg-white/90 p-2 text-[var(--about-brand-deep)]">
                        <Play className="h-3 w-3 fill-current" />
                      </span>
                    ) : null}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-xl font-semibold">{item.title}</p>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm leading-7 text-[var(--about-brand-deep)]/80">
                    {item.description}
                  </p>
                  <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--about-brand)]">
                    View Space
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Dialog
        open={selectedItem !== null}
        onOpenChange={(open) => !open && setSelectedIndex(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[var(--dexta-primary)]/70 bg-[var(--dexta-secondary)] p-0 text-white sm:max-w-5xl">
          {selectedItem ? (
            <div className="relative overflow-hidden rounded-lg">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -right-16 h-56 w-56 rounded-full bg-[color-mix(in_srgb,var(--dexta)_22%,transparent)] blur-3xl" />
                <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[color-mix(in_srgb,var(--dexta-primary)_30%,transparent)] blur-3xl" />
              </div>

              <div className="relative border-b border-white/10 bg-gradient-to-br from-[var(--dexta-secondary)] via-[var(--dexta-primary)] to-[var(--dexta-secondary)] px-6 py-5">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl font-semibold text-white">
                    {selectedItem.title}
                  </DialogTitle>
                </DialogHeader>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-white/80">
                  {selectedItem.description}
                </p>
              </div>

              <div className="relative bg-black/70 p-4 sm:p-6">
                {selectedItem.mediaType === "VIDEO" &&
                selectedItem.mediaPublicId ? (
                  <video
                    src={getVideoUrl(selectedItem.mediaPublicId)}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[70vh] w-full rounded-[24px] border border-white/10 bg-black object-contain shadow-[0_30px_90px_-45px_rgba(0,171,255,0.55)]"
                    poster={previewSources[selectedIndex ?? 0]}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getFullImageSrc(selectedItem)}
                    alt={selectedItem.title}
                    className="max-h-[78vh] w-full rounded-[24px] border border-white/10 object-contain shadow-[0_30px_90px_-45px_rgba(0,171,255,0.55)]"
                  />
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AboutSpaceSection;
