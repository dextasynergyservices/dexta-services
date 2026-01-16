"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export type CardStackItem = {
  id: string | number;
  title: string;
  description?: string;
  imageSrc?: string;
  href?: string;
  ctaLabel?: string;
  tag?: string;
};

export type CardStackProps<T extends CardStackItem> = {
  items: T[];

  /** Selected index on mount */
  initialIndex?: number;

  /** How many cards are visible around the active (odd recommended) */
  maxVisible?: number;

  /** Card sizing */
  cardWidth?: number;
  cardHeight?: number;

  /** Responsive card sizing (optional) */
  cardWidthMd?: number;
  cardHeightMd?: number;
  cardWidthLg?: number;
  cardHeightLg?: number;

  /** Responsive maxVisible cards */
  maxVisibleMd?: number;
  maxVisibleLg?: number;

  /** How much cards overlap each other (0..0.8). Higher = more overlap */
  overlap?: number;

  /** Total fan angle (deg). Higher = wider arc */
  spreadDeg?: number;

  /** Responsive spread degrees */
  spreadDegMd?: number;
  spreadDegLg?: number;

  /** 3D / depth feel */
  perspectivePx?: number;
  depthPx?: number;
  tiltXDeg?: number;

  /** Active emphasis */
  activeLiftPx?: number;
  activeScale?: number;
  inactiveScale?: number;

  /** Motion */
  springStiffness?: number;
  springDamping?: number;

  /** Behavior */
  loop?: boolean;
  autoAdvance?: boolean;
  intervalMs?: number;
  pauseOnHover?: boolean;

  /** UI */
  showDots?: boolean;

  /** Hooks */
  onChangeIndex?: (index: number, item: T) => void;

  /** Custom renderer (optional) */
  renderCard?: (item: T, state: { active: boolean }) => React.ReactNode;
};

function wrapIndex(n: number, len: number) {
  if (len <= 0) return 0;
  return ((n % len) + len) % len;
}

/** Minimal signed offset from active index to i, with wrapping (for loop behavior). */
function signedOffset(i: number, active: number, len: number, loop: boolean) {
  const raw = i - active;
  if (!loop || len <= 1) return raw;

  // consider wrapped alternative
  const alt = raw > 0 ? raw - len : raw + len;
  return Math.abs(alt) < Math.abs(raw) ? alt : raw;
}

export function CardStack<T extends CardStackItem>({
  items,
  initialIndex = 0,
  maxVisible = 3,

  cardWidth = 300,
  cardHeight = 200,
  cardWidthMd = 380,
  cardHeightMd = 240,
  cardWidthLg = 520,
  cardHeightLg = 320,

  maxVisibleMd = 5,
  maxVisibleLg = 7,

  overlap = 0.48,
  spreadDeg = 24,
  spreadDegMd = 36,
  spreadDegLg = 48,

  perspectivePx = 1100,
  depthPx = 140,
  tiltXDeg = 12,

  activeLiftPx = 22,
  activeScale = 1.03,
  inactiveScale = 0.94,

  springStiffness = 280,
  springDamping = 28,

  loop = true,
  autoAdvance = false,
  intervalMs = 2800,
  pauseOnHover = true,

  showDots = true,

  onChangeIndex,
  renderCard,
}: CardStackProps<T>) {
  const reduceMotion = useReducedMotion();
  const len = items.length;

  const [active, setActive] = React.useState(() =>
    wrapIndex(initialIndex, len),
  );
  const [hovering] = React.useState(false);
  const [screenSize, setScreenSize] = React.useState<"sm" | "md" | "lg">("sm");

  // Detect screen size for responsive card sizing
  React.useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth >= 1024) {
          setScreenSize("lg");
        } else if (window.innerWidth >= 768) {
          setScreenSize("md");
        } else {
          setScreenSize("sm");
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get responsive card dimensions and settings
  const getResponsiveSettings = () => {
    switch (screenSize) {
      case "lg":
        return {
          width: cardWidthLg,
          height: cardHeightLg,
          visible: maxVisibleLg,
          spread: spreadDegLg,
        };
      case "md":
        return {
          width: cardWidthMd,
          height: cardHeightMd,
          visible: maxVisibleMd,
          spread: spreadDegMd,
        };
      default:
        return {
          width: cardWidth,
          height: cardHeight,
          visible: maxVisible,
          spread: spreadDeg,
        };
    }
  };

  const {
    width: currentCardWidth,
    height: currentCardHeight,
    visible: currentMaxVisible,
    spread: currentSpreadDeg,
  } = getResponsiveSettings();

  // keep active in bounds if items change
  React.useEffect(() => {
    setActive((a) => wrapIndex(a, len));
  }, [len]);

  React.useEffect(() => {
    if (!len) return;
    onChangeIndex?.(active, items[active]!);
  }, [active]);

  const maxOffset = Math.max(0, Math.floor(currentMaxVisible / 2));

  const cardSpacing = Math.max(
    10,
    Math.round(currentCardWidth * (1 - overlap)),
  );
  const stepDeg = maxOffset > 0 ? currentSpreadDeg / maxOffset : 0;

  const canGoPrev = loop || active > 0;
  const canGoNext = loop || active < len - 1;

  const prev = React.useCallback(() => {
    if (!len) return;
    if (!canGoPrev) return;
    setActive((a) => wrapIndex(a - 1, len));
  }, [canGoPrev, len]);

  const next = React.useCallback(() => {
    if (!len) return;
    if (!canGoNext) return;
    setActive((a) => wrapIndex(a + 1, len));
  }, [canGoNext, len]);

  // keyboard navigation (when container focused)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  // autoplay
  React.useEffect(() => {
    if (!autoAdvance) return;
    if (reduceMotion) return;
    if (!len) return;
    if (pauseOnHover && hovering) return;

    const id = window.setInterval(
      () => {
        if (loop || active < len - 1) next();
      },
      Math.max(700, intervalMs),
    );

    return () => window.clearInterval(id);
  }, [
    autoAdvance,
    intervalMs,
    hovering,
    pauseOnHover,
    reduceMotion,
    len,
    loop,
    active,
    next,
  ]);

  if (!len) return null;

  return (
    <>
      {/* Stage */}
      <div
        className="relative w-full outline-none min-h-[320px] sm:min-h-[120px] md:min-h-[380px] lg:min-h-[500px]"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            perspective: `${perspectivePx}px`,
          }}
        >
          <div className="pointer-events-auto">
            <AnimatePresence initial={false}>
              {items.map((item, i) => {
                const off = signedOffset(i, active, len, loop);
                const abs = Math.abs(off);
                const visible = abs <= maxOffset;

                // hide far-away cards cleanly
                if (!visible) return null;

                // fan geometry
                const rotateZ = off * stepDeg;
                const x = off * cardSpacing;
                const y = abs * 10; // subtle arc-down feel
                const z = -abs * depthPx;

                const isActive = off === 0;

                const scale = isActive ? activeScale : inactiveScale;
                const lift = isActive ? -activeLiftPx : 0;

                const rotateX = isActive ? 0 : tiltXDeg;

                const zIndex = 100 - abs;

                // drag only on the active card
                const dragProps = isActive
                  ? {
                      drag: "x" as const,
                      dragConstraints: { left: 0, right: 0 },
                      dragElastic: 0.18,
                      onDragEnd: (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        _e: any,
                        info: {
                          offset: { x: number };
                          velocity: { x: number };
                        },
                      ) => {
                        if (reduceMotion) return;
                        const travel = info.offset.x;
                        const v = info.velocity.x;
                        const threshold = Math.min(
                          160,
                          currentCardWidth * 0.22,
                        );

                        // swipe logic
                        if (travel > threshold || v > 650) prev();
                        else if (travel < -threshold || v < -650) next();
                      },
                    }
                  : {};

                return (
                  <motion.div
                    key={item.id}
                    className={cn(
                      "absolute bottom-0 left-1/2 -translate-x-1/2 rounded-2xl border-4 border-black/10 dark:border-white/10 overflow-hidden shadow-xl",
                      "will-change-transform select-none",
                      isActive
                        ? "cursor-grab active:cursor-grabbing"
                        : "cursor-pointer",
                    )}
                    style={{
                      width: currentCardWidth,
                      height: currentCardHeight,
                      zIndex,
                      transformStyle: "preserve-3d",
                      transformOrigin: "bottom center",
                    }}
                    initial={
                      reduceMotion
                        ? false
                        : {
                            opacity: 0,
                            y: y + 40,
                            x: x,
                            rotateZ,
                            rotateX,
                            scale,
                          }
                    }
                    animate={{
                      opacity: 1,
                      x: x,
                      y: y + lift,
                      rotateZ,
                      rotateX,
                      scale,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: springStiffness,
                      damping: springDamping,
                    }}
                    // translateZ via style transform (kept stable w/ motion values above)
                    // We apply translateZ by using a CSS transform in a child wrapper.
                    onClick={() => {
                      setActive(i);
                    }}
                    {...dragProps}
                  >
                    <div
                      className="h-full w-full"
                      style={{
                        transform: `translateZ(${z}px)`,
                        transformStyle: "preserve-3d",
                      }}
                    >
                      {renderCard ? (
                        renderCard(item, { active: isActive })
                      ) : (
                        <DefaultFanCard item={item} active={isActive} />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Dots navigation centered at bottom */}
      {showDots ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            {items.map((it, idx) => {
              const on = idx === active;
              return (
                <button
                  key={it.id}
                  onClick={() => setActive(idx)}
                  className={cn(
                    "h-2 w-2 rounded-full transition",
                    on
                      ? "bg-foreground"
                      : "bg-foreground/30 hover:bg-foreground/50",
                  )}
                  aria-label={`Go to ${it.title}`}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}

function DefaultFanCard({ item }: { item: CardStackItem; active: boolean }) {
  return (
    <div className="relative h-full w-full">
      {/* image */}
      <div className="absolute inset-0">
        {item.imageSrc ? (
          <Image
            src={item.imageSrc}
            alt={item.title}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-sm text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {/* subtle gradient overlay at bottom for text readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* content */}
      <div className="relative z-10 flex h-full flex-col justify-end p-5">
        <div className="truncate text-lg font-semibold text-white">
          {item.title}
        </div>
        {item.description ? (
          <div className="mt-1 line-clamp-2 text-sm text-white/80">
            {item.description}
          </div>
        ) : null}
      </div>
    </div>
  );
}
