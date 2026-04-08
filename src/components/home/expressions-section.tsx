"use client";

import { useState } from "react";
import { ArrowUpRight, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import type { ExpressionItem } from "./expressions-wrapper";

interface ExpressionsSectionProps {
  expressions: ExpressionItem[];
}

function getLogoSrc(publicId: string) {
  return getCloudinaryUrl(publicId, {
    f: "auto",
    q: "auto",
    w: 320,
    h: 160,
    c: "fit",
  });
}

function getModalLogoSrc(publicId: string) {
  return getCloudinaryUrl(publicId, {
    f: "auto",
    q: "auto",
    w: 480,
    h: 200,
    c: "fit",
  });
}

export function ExpressionsSection({ expressions }: ExpressionsSectionProps) {
  const [selected, setSelected] = useState<ExpressionItem | null>(null);

  return (
    <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* ── Section header ─────────────────────────────────────────────── */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-500">
            Our Expressions
          </p>
          <h2 className="text-2xl font-black tracking-tight text-primary-text sm:text-3xl lg:text-4xl">
            Work that speaks for itself
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500 sm:text-base">
            Every project is a statement. Tap any to see what we built and why
            it matters.
          </p>
        </div>

        {/* ── Grid ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {expressions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 sm:p-6"
              aria-label={`View ${item.name}`}
            >
              {/* Logo area */}
              <div className="flex h-16 w-full items-center justify-center sm:h-20">
                {item.logoPublicId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getLogoSrc(item.logoPublicId)}
                    alt={`${item.name} logo`}
                    className="max-h-full w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                    <Globe className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Name + arrow */}
              <div className="flex w-full items-center justify-between gap-1">
                <span className="truncate text-xs font-semibold text-gray-600 transition-colors duration-200 group-hover:text-gray-900 sm:text-sm">
                  {item.name}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-gray-300 transition-all duration-200 group-hover:text-cyan-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="border-gray-100 bg-white p-0 text-gray-900 sm:max-w-md">
          {selected && (
            <>
              {/* Logo banner */}
              <div className="flex items-center justify-center border-b border-gray-100 bg-gray-50 px-8 py-8">
                {selected.logoPublicId ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getModalLogoSrc(selected.logoPublicId)}
                    alt={`${selected.name} logo`}
                    className="max-h-24 w-auto max-w-[280px] object-contain"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                    <Globe className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-4 px-6 pb-6 pt-5">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-gray-900">
                    {selected.name}
                  </DialogTitle>
                </DialogHeader>

                <p className="text-sm leading-relaxed text-gray-500">
                  {selected.description}
                </p>

                <Button
                  asChild
                  className="w-full gap-2 bg-cyan-500 text-black hover:bg-cyan-400"
                >
                  <a
                    href={selected.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
