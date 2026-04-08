"use client";

import { useEffect, useRef, useState } from "react";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export type FeaturedMediaItem = {
  id: string;
  mediaPublicId: string;
  mediaType: "IMAGE" | "VIDEO";
  thumbnailPublicId: string | null;
  title: string;
  objectPosition?: string | null;
};

interface ServiceMediaRotatorProps {
  items: FeaturedMediaItem[];
  intervalMs?: number;
}

const FADE_DURATION_MS = 500;

function getImageSrc(publicId: string) {
  return getCloudinaryUrl(publicId, {
    c: "fill",
    f: "auto",
    g: "auto",
    q: "auto",
    w: 900,
    h: 700,
  });
}

function getVideoUrl(publicId: string) {
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto/${publicId}`;
}

export function ServiceMediaRotator({
  items,
  intervalMs = 4000,
}: ServiceMediaRotatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadingIndex, setFadingIndex] = useState<number | null>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
    setFadingIndex(null);
  }, [items]);

  useEffect(() => {
    if (items.length <= 1) return;

    advanceTimerRef.current = setTimeout(() => {
      const previousIndex = currentIndex;
      const nextIndex = (currentIndex + 1) % items.length;

      setFadingIndex(previousIndex);
      setCurrentIndex(nextIndex);

      fadeTimerRef.current = setTimeout(() => {
        setFadingIndex(null);
      }, FADE_DURATION_MS);
    }, intervalMs);

    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [currentIndex, intervalMs, items.length]);

  if (items.length === 0) return null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {items.map((item, index) => {
        const isActive = index === currentIndex;
        const isFading = index === fadingIndex;
        const visible = isActive || isFading;

        if (!visible) return null;

        const imgSrc =
          item.mediaType === "IMAGE"
            ? getImageSrc(item.mediaPublicId)
            : item.thumbnailPublicId
              ? getImageSrc(item.thumbnailPublicId)
              : null;

        return (
          <div
            key={item.id}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: isFading ? 0 : 1 }}
          >
            {item.mediaType === "VIDEO" ? (
              <video
                src={getVideoUrl(item.mediaPublicId)}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={imgSrc ?? undefined}
                className="h-full w-full object-cover"
                style={{ objectPosition: item.objectPosition ?? "center" }}
              />
            ) : imgSrc ? (
              <img
                src={imgSrc}
                alt={item.title}
                className="h-full w-full object-cover"
                loading="lazy"
                style={{ objectPosition: item.objectPosition ?? "center" }}
              />
            ) : null}
          </div>
        );
      })}

      {/* Dot indicators — only shown when more than one item */}
      {items.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 z-10">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (i === currentIndex) return;

                setFadingIndex(currentIndex);
                setCurrentIndex(i);

                if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
                fadeTimerRef.current = setTimeout(() => {
                  setFadingIndex(null);
                }, FADE_DURATION_MS);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "w-4 bg-white"
                  : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Show item ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
