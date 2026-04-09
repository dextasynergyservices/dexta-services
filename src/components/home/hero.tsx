"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  normalizeHeroRichText,
  type HeroRichTextMode,
} from "@/lib/hero-rich-text";
import {
  getCloudinaryUrl,
  isCloudinaryUrl,
  type TransformOptions,
} from "@/lib/cloudinary";
import type { HeroContent, HeroCard } from "@/lib/hero-types";

// ─── Local fallback images (used when no Cloudinary ID is set) ────────────────
const LOCAL_BG_IMAGE = "/images/services.png";
const LOCAL_HERO_FOREGROUND_IMAGE = "/images/fprint.png";
const CARD_IMAGE_TRANSFORMS = {
  c: "fill",
  f: "auto",
  g: "auto",
  q: "auto",
  w: 1200,
} as const;
const CARD_IMAGE_SIZES =
  "(min-width: 1024px) 280px, (min-width: 768px) 220px, 76vw";
const HERO_CARD_OVERLAY_COLORS = [
  "var(--dexta-secondary)",
  "var(--dexta)",
  "var(--dexta-primary)",
] as const;
const HERO_CARD_BADGE_TONES = [
  "bg-sky-100 text-sky-950",
  "bg-violet-100 text-violet-950",
  "bg-emerald-100 text-emerald-950",
] as const;

function resolveImage(
  publicId: string | null | undefined,
  fallback: string,
  options?: TransformOptions,
): string {
  return publicId ? getCloudinaryUrl(publicId, options) : fallback;
}

function resolveCardImage(publicId: string | null | undefined) {
  return publicId ? getCloudinaryUrl(publicId, CARD_IMAGE_TRANSFORMS) : null;
}

type HeroImageProps = {
  src: string;
  alt: string;
  className?: string;
  objectPosition?: string;
  priority?: boolean;
  sizes?: string;
};

function HeroImage({
  src,
  alt,
  className,
  objectPosition = "center",
  priority = false,
  sizes,
}: HeroImageProps) {
  if (isCloudinaryUrl(src)) {
    return (
      // We intentionally bypass next/image here because the optimizer was timing
      // out on Cloudinary-backed hero assets in local/dev.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ objectFit: "cover", objectPosition }}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        sizes={sizes}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      style={{ objectPosition }}
    />
  );
}

type HeroCardImageProps = {
  src: string | null;
  alt: string;
  objectPosition?: string;
  sizes?: string;
};

function HeroCardImage({
  src,
  alt,
  objectPosition = "center",
  sizes,
}: HeroCardImageProps) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_55%),linear-gradient(160deg,#0f172a_0%,#111827_55%,#020617_100%)]"
      />
    );
  }

  return (
    <HeroImage
      src={src}
      alt={alt}
      sizes={sizes}
      className="absolute inset-0 h-full w-full object-cover"
      objectPosition={objectPosition}
    />
  );
}

type HeroRichTextProps = {
  as: "div" | "h1" | "h2" | "p" | "span";
  className?: string;
  mode: HeroRichTextMode;
  value: string;
};

function HeroRichText({
  as: Component,
  className,
  mode,
  value,
}: HeroRichTextProps) {
  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: normalizeHeroRichText(value, mode) }}
    />
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
type HeroProps = {
  content: HeroContent;
  cards: HeroCard[];
};

type Frame = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  radius: number;
};

type LayoutConfig = {
  bleed: Frame;
  intro: Frame;
  stage: Frame;
  final: Frame;
};

type CenterCardMorph = {
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeInOut(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function mapRange(
  value: number,
  inputStart: number,
  inputEnd: number,
  eased = true,
) {
  const normalized = clamp01((value - inputStart) / (inputEnd - inputStart));
  return eased ? easeInOut(normalized) : normalized;
}

function measureRectWithoutTransform(element: HTMLElement) {
  const previousTransform = element.style.transform;
  element.style.transform = "none";
  const rect = element.getBoundingClientRect();
  element.style.transform = previousTransform;
  return rect;
}

function getCenterCardMorphMetrics(
  centerCardElement: HTMLElement,
  introFrameElement: HTMLElement,
): CenterCardMorph {
  const centerCardRect = measureRectWithoutTransform(centerCardElement);
  const introRect = introFrameElement.getBoundingClientRect();
  const introCenterX = introRect.left + introRect.width / 2;
  const introCenterY = introRect.top + introRect.height / 2;
  const centerFinalX = centerCardRect.left + centerCardRect.width / 2;
  const centerFinalY = centerCardRect.top + centerCardRect.height / 2;

  return {
    offsetX: introCenterX - centerFinalX,
    offsetY: introCenterY - centerFinalY,
    scaleX: introRect.width / centerCardRect.width,
    scaleY: introRect.height / centerCardRect.height,
  };
}

function getLayoutConfig(): LayoutConfig {
  if (window.innerWidth < 768) {
    return {
      bleed: { top: 39, right: 7, bottom: 12, left: 7, radius: 24 },
      intro: { top: 39, right: 10, bottom: 12, left: 10, radius: 24 },
      stage: { top: 12, right: 3, bottom: 6, left: 3, radius: 26 },
      final: { top: 0, right: 0, bottom: 0, left: 0, radius: 0 },
    };
  }

  if (window.innerWidth < 1024) {
    return {
      bleed: { top: 9, right: 28, bottom: 10, left: 38, radius: 28 },
      intro: { top: 9, right: 31, bottom: 10, left: 42, radius: 28 },
      stage: { top: 6, right: 12, bottom: 10, left: 12, radius: 32 },
      final: { top: 0, right: 0, bottom: 0, left: 0, radius: 0 },
    };
  }

  return {
    bleed: { top: 10, right: 29, bottom: 14, left: 40, radius: 28 },
    intro: { top: 10, right: 32, bottom: 14, left: 44, radius: 28 },
    stage: { top: 8, right: 16, bottom: 15, left: 16, radius: 34 },
    final: { top: 0, right: 0, bottom: 0, left: 0, radius: 0 },
  };
}

export default function Hero({ content, cards }: HeroProps) {
  const bgImage = resolveImage(
    content.backgroundImagePublicId,
    LOCAL_BG_IMAGE,
    {
      c: "fill",
      f: "auto",
      g: "auto",
      q: "auto",
      w: 2400,
    },
  );
  const heroForegroundImage = resolveImage(
    content.cardFallbackImagePublicId,
    LOCAL_HERO_FOREGROUND_IMAGE,
    {
      c: "fill",
      f: "auto",
      g: "auto",
      q: "auto",
      w: 1400,
    },
  );
  const leftCardImage = resolveCardImage(cards[0]?.imagePublicId);
  const centerCardImage = resolveCardImage(cards[1]?.imagePublicId);
  const rightCardImage = resolveCardImage(cards[2]?.imagePublicId);
  const heroCards = cards.slice(0, 3);
  const heroCardImages = [leftCardImage, centerCardImage, rightCardImage];
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const bleedImageRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const introFrameRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const shellCopyRef = useRef<HTMLDivElement>(null);
  const shellEyebrowRef = useRef<HTMLDivElement>(null);
  const shellTitleRef = useRef<HTMLDivElement>(null);
  const shellBodyRef = useRef<HTMLDivElement>(null);
  const shellButtonRef = useRef<HTMLDivElement>(null);
  const desktopCardsRowRef = useRef<HTMLDivElement>(null);
  const leftCardRef = useRef<HTMLElement>(null);
  const centerCardRef = useRef<HTMLElement>(null);
  const rightCardRef = useRef<HTMLElement>(null);
  const centerCardMorphRef = useRef<CenterCardMorph | null>(null);
  const mobileCardsRowRef = useRef<HTMLDivElement>(null);
  const mobileCardRefs = useRef<Array<HTMLElement | null>>([]);

  const scrollToCard = (index: number) => {
    const card = mobileCardRefs.current[index];

    if (!card) {
      return;
    }

    card.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
    setActiveCardIndex(index);
  };

  useEffect(() => {
    const scroller = mobileCardsRowRef.current;

    if (!scroller) {
      return;
    }

    let frameId = 0;

    const updateActiveCard = () => {
      frameId = 0;

      if (window.innerWidth >= 768) {
        return;
      }

      const scrollerRect = scroller.getBoundingClientRect();
      const paddingLeft =
        Number.parseFloat(window.getComputedStyle(scroller).paddingLeft) || 0;
      const targetLeft = scrollerRect.left + paddingLeft;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      mobileCardRefs.current.forEach((card, index) => {
        if (!card) {
          return;
        }

        const distance = Math.abs(
          card.getBoundingClientRect().left - targetLeft,
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveCardIndex((current) =>
        current === closestIndex ? current : closestIndex,
      );
    };

    const handleScroll = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateActiveCard);
    };

    updateActiveCard();
    scroller.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      scroller.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  useEffect(() => {
    setActiveCardIndex((current) => {
      if (heroCards.length === 0) {
        return 0;
      }

      return Math.min(current, heroCards.length - 1);
    });
  }, [heroCards.length]);

  useEffect(() => {
    let frameId = 0;

    const measureCenterCard = () => {
      frameId = 0;

      if (
        window.innerWidth < 768 ||
        !centerCardRef.current ||
        !introFrameRef.current
      ) {
        centerCardMorphRef.current = null;
        return;
      }

      centerCardMorphRef.current = getCenterCardMorphMetrics(
        centerCardRef.current,
        introFrameRef.current,
      );
    };

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(measureCenterCard);
    };

    scheduleMeasure();
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    window.addEventListener("load", scheduleMeasure);
    void document.fonts?.ready.then(scheduleMeasure);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("load", scheduleMeasure);
    };
  }, []);

  useEffect(() => {
    let frameId = 0;

    const updateMotion = () => {
      if (!containerRef.current) {
        return;
      }

      const container = containerRef.current;
      const viewportWidth = window.innerWidth;
      const isMobile = viewportWidth < 768;
      const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
      const totalDistance = Math.max(
        container.offsetHeight - window.innerHeight,
        1,
      );
      const progress = clamp01(
        -container.getBoundingClientRect().top / totalDistance,
      );
      const layout = getLayoutConfig();

      const bleedCut = mapRange(progress, 0.02, 0.16);
      const heroExit = mapRange(progress, 0.02, 0.22);
      const shellTopGrow = mapRange(progress, 0.08, 0.22);
      const shellSideGrow = mapRange(progress, 0.1, 0.24);
      const shellBottomGrow = mapRange(progress, 0.14, 0.28);
      const shellTopSettle = mapRange(progress, 0.22, 0.38);
      const shellSideSettle = mapRange(progress, 0.24, 0.4);
      const shellBottomSettle = mapRange(progress, 0.3, 0.44);
      const shellRadiusGrow = mapRange(progress, 0.1, 0.34);
      const shellRadiusSettle = mapRange(progress, 0.26, 0.44);
      const shellFill = mapRange(progress, 0.08, 0.24);
      const shellCopyReveal = mapRange(progress, 0.28, 0.4);
      const shellEyebrowReveal = mapRange(progress, 0.3, 0.38);
      const shellTitleReveal = mapRange(progress, 0.32, 0.42);
      const shellBodyReveal = mapRange(progress, 0.34, 0.46);
      const shellButtonReveal = mapRange(progress, 0.38, 0.5);
      const rowReveal = mapRange(
        progress,
        isTablet ? 0.17 : 0.12,
        isTablet ? 0.29 : 0.24,
      );
      const centerReveal = mapRange(
        progress,
        isTablet ? 0.08 : 0.06,
        isTablet ? 0.16 : 0.14,
      );
      const centerMorph = mapRange(
        progress,
        isTablet ? 0.08 : 0.06,
        isTablet ? 0.3 : 0.28,
      );
      const leftReveal = mapRange(
        progress,
        isTablet ? 0.17 : 0.12,
        isTablet ? 0.29 : 0.24,
      );
      const rightReveal = mapRange(
        progress,
        isTablet ? 0.19 : 0.14,
        isTablet ? 0.31 : 0.26,
      );
      const finalSettle = mapRange(progress, 0.5, 1);

      const stageFrame: Frame = {
        top: lerp(layout.intro.top, layout.stage.top, shellTopGrow),
        right: lerp(layout.intro.right, layout.stage.right, shellSideGrow),
        bottom: lerp(layout.intro.bottom, layout.stage.bottom, shellBottomGrow),
        left: lerp(layout.intro.left, layout.stage.left, shellSideGrow),
        radius: lerp(layout.intro.radius, layout.stage.radius, shellRadiusGrow),
      };

      const shellFrame: Frame = {
        top: lerp(stageFrame.top, layout.final.top, shellTopSettle),
        right: lerp(stageFrame.right, layout.final.right, shellSideSettle),
        bottom: lerp(stageFrame.bottom, layout.final.bottom, shellBottomSettle),
        left: lerp(stageFrame.left, layout.final.left, shellSideSettle),
        radius: lerp(stageFrame.radius, layout.final.radius, shellRadiusSettle),
      };
      const introDrop = lerp(0, isMobile ? 8 : 18, bleedCut);

      if (backgroundRef.current) {
        backgroundRef.current.style.transform = `translate3d(0, ${lerp(0, -34, heroExit)}px, 0) scale(${lerp(1, 1.1, finalSettle)})`;
        backgroundRef.current.style.filter = `saturate(${lerp(1.08, 0.82, finalSettle)}) blur(${lerp(0, 16, finalSettle)}px)`;
      }

      if (heroCopyRef.current) {
        heroCopyRef.current.style.opacity = `${lerp(1, 0, heroExit)}`;
        heroCopyRef.current.style.transform = `translate3d(0, ${lerp(0, -84, heroExit)}px, 0) scale(${lerp(1, 0.96, heroExit)})`;
      }

      if (bleedImageRef.current) {
        const bleedExit = mapRange(progress, 0.22, 0.36);
        const bleedYOffset = isMobile ? 26 : 72;
        bleedImageRef.current.style.opacity = `${lerp(1, 0, bleedExit)}`;
        bleedImageRef.current.style.transform = `translate3d(0, ${lerp(bleedYOffset, isMobile ? -8 : -10, heroExit)}px, 0) scale(${lerp(1.02, 0.98, heroExit)})`;
      }

      if (introFrameRef.current) {
        introFrameRef.current.style.top = `${layout.intro.top}%`;
        introFrameRef.current.style.right = `${layout.intro.right}%`;
        introFrameRef.current.style.bottom = `${layout.intro.bottom}%`;
        introFrameRef.current.style.left = `${layout.intro.left}%`;
        introFrameRef.current.style.borderRadius = `${layout.intro.radius}px`;
        introFrameRef.current.style.opacity = `${lerp(1, 0, mapRange(progress, 0.12, 0.24))}`;
        introFrameRef.current.style.transform = `translate3d(0, ${introDrop}px, 0) scale(${lerp(1, 0.985, heroExit)})`;
      }

      if (shellRef.current) {
        shellRef.current.style.top = `${shellFrame.top}%`;
        shellRef.current.style.right = `${shellFrame.right}%`;
        shellRef.current.style.bottom = `${shellFrame.bottom}%`;
        shellRef.current.style.left = `${shellFrame.left}%`;
        shellRef.current.style.borderRadius = `${shellFrame.radius}px`;
        shellRef.current.style.backgroundColor = `rgba(255, 255, 255, ${lerp(0, 0.98, shellFill)})`;
        shellRef.current.style.boxShadow = `0 40px 160px rgba(15, 23, 42, ${lerp(0.08, 0, finalSettle)})`;
      }

      if (shellCopyRef.current) {
        shellCopyRef.current.style.opacity = `${lerp(0, 1, shellCopyReveal)}`;
        shellCopyRef.current.style.transform = `translate3d(0, ${lerp(42, 0, shellCopyReveal)}px, 0)`;
      }

      if (shellEyebrowRef.current) {
        shellEyebrowRef.current.style.opacity = `${lerp(0, 1, shellEyebrowReveal)}`;
        shellEyebrowRef.current.style.transform = `translate3d(0, ${lerp(18, 0, shellEyebrowReveal)}px, 0)`;
      }

      if (shellTitleRef.current) {
        shellTitleRef.current.style.opacity = `${lerp(0, 1, shellTitleReveal)}`;
        shellTitleRef.current.style.transform = `translate3d(0, ${lerp(26, 0, shellTitleReveal)}px, 0)`;
      }

      if (shellBodyRef.current) {
        shellBodyRef.current.style.opacity = `${lerp(0, 1, shellBodyReveal)}`;
        shellBodyRef.current.style.transform = `translate3d(0, ${lerp(22, 0, shellBodyReveal)}px, 0)`;
      }

      if (shellButtonRef.current) {
        shellButtonRef.current.style.opacity = `${lerp(0, 1, shellButtonReveal)}`;
        shellButtonRef.current.style.transform = `translate3d(0, ${lerp(18, 0, shellButtonReveal)}px, 0)`;
      }

      if (desktopCardsRowRef.current) {
        desktopCardsRowRef.current.style.opacity = `${lerp(0, 1, rowReveal)}`;
        desktopCardsRowRef.current.style.transform = `translate3d(0, ${lerp(12, 0, rowReveal)}px, 0)`;
      }

      if (centerCardRef.current) {
        if (isMobile || !introFrameRef.current) {
          centerCardRef.current.style.opacity = `${lerp(0, 1, centerReveal)}`;
          centerCardRef.current.style.transformOrigin = "center center";
          centerCardRef.current.style.transform = `translate3d(0, ${lerp(36, 0, centerReveal)}px, 0) scale(${lerp(0.94, 1, centerReveal)})`;
        } else {
          const centerMorphMetrics =
            centerCardMorphRef.current ??
            getCenterCardMorphMetrics(
              centerCardRef.current,
              introFrameRef.current,
            );

          centerCardMorphRef.current = centerMorphMetrics;

          centerCardRef.current.style.opacity = `${lerp(0, 1, centerReveal)}`;
          centerCardRef.current.style.transformOrigin = "center center";
          centerCardRef.current.style.transform = `translate3d(${lerp(centerMorphMetrics.offsetX, 0, centerMorph)}px, ${lerp(centerMorphMetrics.offsetY, 0, centerMorph)}px, 0) scale(${lerp(centerMorphMetrics.scaleX, 1, centerMorph)}, ${lerp(centerMorphMetrics.scaleY, 1, centerMorph)})`;
        }
      }

      if (leftCardRef.current) {
        leftCardRef.current.style.opacity = `${lerp(0, 1, leftReveal)}`;
        leftCardRef.current.style.transform = isMobile
          ? `translate3d(0, ${lerp(42, 0, leftReveal)}px, 0) scale(${lerp(0.92, 1, leftReveal)})`
          : `translate3d(${lerp(-110, 0, leftReveal)}px, ${lerp(18, 0, leftReveal)}px, 0) scale(${lerp(0.94, 1, leftReveal)})`;
      }

      if (rightCardRef.current) {
        rightCardRef.current.style.opacity = `${lerp(0, 1, rightReveal)}`;
        rightCardRef.current.style.transform = isMobile
          ? `translate3d(0, ${lerp(52, 0, rightReveal)}px, 0) scale(${lerp(0.92, 1, rightReveal)})`
          : `translate3d(${lerp(110, 0, rightReveal)}px, ${lerp(18, 0, rightReveal)}px, 0) scale(${lerp(0.94, 1, rightReveal)})`;
      }
    };

    const handleScroll = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateMotion);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    updateMotion();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div className="bg-[#040b3a]">
      <section className="relative overflow-hidden md:hidden">
        <div className="absolute inset-0">
          <HeroImage
            key={bgImage}
            src={bgImage}
            alt="Dexta hero background"
            priority
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-20"
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "var(--dexta-primary)",
              opacity: 0.14,
            }}
          />
        </div>

        <div className="relative px-5 pb-10 pt-18 sm:px-6">
          <div className="mx-auto w-full max-w-[430px] text-center text-white sm:max-w-[560px]">
            <HeroRichText
              as="p"
              className="mb-4 text-[10px] font-semibold uppercase tracking-[0.34em] text-white/62"
              mode="inline"
              value={content.eyebrow}
            />
            <HeroRichText
              as="h1"
              className="font-display text-[clamp(2.65rem,13.5vw,6.1rem)] leading-[0.9] tracking-[-0.06em] text-white [&_span]:align-baseline"
              mode="inline"
              value={content.headline}
            />
            <HeroRichText
              as="div"
              className="mx-auto mt-5 max-w-[340px] text-[0.95rem] leading-6 text-white/76 sm:max-w-[560px] [&_p]:m-0 [&_p+p]:mt-4"
              mode="block"
              value={content.body}
            />
            <div className="mt-8 flex justify-center">
              <Link href={content.ctaHref}>
                <Button className="h-12 w-full max-w-[220px] rounded-full bg-white px-7 text-sm font-semibold text-[#050b3a] hover:bg-white/92 sm:w-auto sm:max-w-none">
                  {content.ctaText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-10 aspect-[4/5] w-full max-w-[320px]">
            <HeroImage
              src={heroForegroundImage}
              alt="Featured Dexta work"
              priority
              sizes="84vw"
              className="absolute inset-0 h-full w-full object-contain"
              objectPosition="center"
            />
          </div>
        </div>

        <div className="relative rounded-t-[32px] bg-white px-4 pb-8 pt-6 text-neutral-900 shadow-[0_-20px_60px_rgba(15,23,42,0.12)]">
          <div className="mx-auto max-w-[520px]">
            <div className="flex flex-col items-center text-center">
              <HeroRichText
                as="span"
                className="inline-flex rounded-full bg-black/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.38em] text-neutral-500"
                mode="inline"
                value={content.stackBadge}
              />
              <HeroRichText
                as="h2"
                className="mt-5 font-display text-[clamp(2.1rem,10vw,3.25rem)] leading-[0.92] tracking-[-0.055em] text-neutral-900 [&_span]:align-baseline"
                mode="inline"
                value={content.stackTitle}
              />
              <HeroRichText
                as="div"
                className="mt-4 text-sm leading-6 text-neutral-600 [&_p]:m-0 [&_p+p]:mt-4"
                mode="block"
                value={content.stackBody}
              />
              <div className="mt-6">
                <Link href={content.stackCtaHref}>
                  <Button className="h-11 rounded-full bg-[#050b3a] px-7 text-sm font-semibold text-white hover:bg-[#0a1560]">
                    {content.stackCtaText}
                  </Button>
                </Link>
              </div>
            </div>

            <div
              ref={mobileCardsRowRef}
              className="hero-card-scroller mt-6 flex w-full touch-auto snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 pt-1"
              style={{ scrollPaddingInline: "0.25rem" }}
            >
              {heroCards.map((card, index) => (
                <Link
                  key={card.id}
                  href={card.href ?? "#"}
                  ref={(node) => {
                    mobileCardRefs.current[index] = node;
                  }}
                  aria-label={`View ${card.label} projects`}
                  className="relative flex h-[286px] w-[80vw] max-w-[290px] shrink-0 snap-start overflow-hidden rounded-[28px] bg-neutral-950 text-white shadow-[0_30px_100px_rgba(15,23,42,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050b3a] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <div className="relative h-full w-full overflow-hidden">
                    <HeroCardImage
                      src={heroCardImages[index] ?? null}
                      alt={`${card.metaTitle ?? ""} preview`}
                      sizes={CARD_IMAGE_SIZES}
                      objectPosition={card.objectPosition ?? "center"}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor:
                          HERO_CARD_OVERLAY_COLORS[index] ??
                          "var(--dexta-primary)",
                        opacity: 0.38,
                      }}
                    />
                    <div className="absolute bottom-20 left-4 right-4">
                      <p className="text-[10px] font-semibold tracking-[0.34em] text-white/62">
                        {card.label}
                      </p>
                      <h3 className="mt-3 text-[1.9rem] font-black leading-none tracking-[-0.06em]">
                        {card.title}
                      </h3>
                      <span className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-950">
                        {card.chip}
                      </span>
                    </div>
                    <div className="absolute inset-x-2.5 bottom-2.5 flex items-center gap-2 rounded-[16px] bg-white/96 px-3 py-2.5 text-neutral-900 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold ${
                          HERO_CARD_BADGE_TONES[index] ??
                          "bg-neutral-100 text-neutral-950"
                        }`}
                      >
                        {card.badge}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold">
                          {card.metaTitle}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {card.metaSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {heroCards.length > 0 ? (
              <div className="mt-3 flex flex-col items-center gap-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
                  Swipe to explore
                </p>
                <div className="flex items-center gap-2">
                  {heroCards.map((card, index) => {
                    const isActive = activeCardIndex === index;

                    return (
                      <button
                        key={card.id}
                        type="button"
                        aria-label={`Show ${card.label} ${card.title}`}
                        aria-pressed={isActive}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          isActive ? "w-8 bg-[#050b3a]" : "w-2.5 bg-neutral-300"
                        }`}
                        onClick={() => scrollToCard(index)}
                      />
                    );
                  })}
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.26em] text-neutral-500">
                  {heroCards[activeCardIndex]?.label}{" "}
                  {heroCards[activeCardIndex]?.title}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section
        ref={containerRef}
        className="relative hidden h-[380vh] w-full md:block"
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <div
            ref={backgroundRef}
            className="absolute inset-0 will-change-transform"
          >
            <div className="absolute inset-0 z-0">
              <HeroImage
                key={bgImage}
                src={bgImage}
                alt="Dexta hero background"
                priority
                sizes="100vw"
                className="absolute inset-0 h-full w-full object-cover object-center opacity-20"
              />
            </div>
            <div
              className="absolute inset-0 z-10"
              style={{
                backgroundColor: "var(--dexta-primary)",
                opacity: 0.14,
              }}
            />
          </div>
          <div className="relative h-full w-full">
            {/*
              Image is positioned independently from the animated intro frame so its
              size never changes during scroll. Only opacity and a slight Y-translate
              are applied by JS — no clipping, shape preserved until it fades out.
            */}
            <div
              ref={bleedImageRef}
              className="pointer-events-none absolute z-[15] will-change-transform top-[35%] bottom-[8%] left-[3%] right-[3%] md:top-[4%] md:bottom-[8%] md:left-[36%] md:right-[24%] lg:top-[2%] lg:bottom-[6%] lg:left-[38%] lg:right-[27%]"
            >
              <div className="relative h-full w-full">
                <HeroImage
                  src={heroForegroundImage}
                  alt="Featured Dexta work"
                  priority
                  sizes="(min-width: 768px) 30vw, 84vw"
                  className="absolute inset-0 h-full w-full object-contain"
                  objectPosition="center"
                />
              </div>
            </div>

            <div
              ref={heroCopyRef}
              className="absolute left-0 right-0 top-0 z-30 will-change-transform"
            >
              <div className="mx-auto flex h-full max-w-[1360px] px-5 pt-[13svh] sm:px-6 md:px-12 md:pt-[calc(16vh-3rem)] lg:px-16 lg:pt-[calc(16vh-4rem)]">
                <div className="w-full max-w-[430px] text-center sm:max-w-[560px] md:max-w-[820px] md:text-left">
                  <HeroRichText
                    as="p"
                    className="mb-4 text-[10px] font-semibold uppercase tracking-[0.34em] text-white/62 md:tracking-[0.38em]"
                    mode="inline"
                    value={content.eyebrow}
                  />
                  <HeroRichText
                    as="h1"
                    className="font-display text-[clamp(2.65rem,13.5vw,6.1rem)] leading-[0.9] tracking-[-0.06em] text-white md:leading-[0.88] md:tracking-[-0.055em] [&_span]:align-baseline"
                    mode="inline"
                    value={content.headline}
                  />
                  <HeroRichText
                    as="div"
                    className="mx-auto mt-5 max-w-[340px] text-[0.95rem] leading-6 text-white/76 sm:max-w-[560px] md:mx-0 md:max-w-[660px] md:text-base md:leading-7 [&_p]:m-0 [&_p+p]:mt-4"
                    mode="block"
                    value={content.body}
                  />
                  <div className="mt-8 flex justify-center md:justify-start">
                    <Link href={content.ctaHref}>
                      <Button className="h-12 w-full max-w-[220px] rounded-full bg-white px-7 text-sm font-semibold text-[#050b3a] hover:bg-white/92 sm:w-auto sm:max-w-none">
                        {content.ctaText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={introFrameRef}
              className="pointer-events-none absolute z-[26] overflow-visible bg-transparent will-change-transform"
              style={{
                top: "10%",
                right: "32%",
                bottom: "14%",
                left: "44%",
                borderRadius: "28px",
              }}
            >
              {/* <div className="absolute inset-x-0 bottom-24 px-5 md:px-6">
                <p className="text-[10px] font-semibold tracking-[0.34em] text-white/62">
                  DIGITAL
                </p>
                <h2 className="mt-3 text-4xl font-black leading-none tracking-[-0.06em] text-white md:text-5xl">
                  BUILD
                </h2>
                <span className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#050b3a]">
                  Product launches
                </span>
              </div> */}
            </div>
          </div>

          <div
            ref={shellRef}
            className="absolute z-[24] overflow-hidden border border-white/60 will-change-[top,right,bottom,left,border-radius,background-color,box-shadow]"
            style={{
              top: "10%",
              right: "32%",
              bottom: "14%",
              left: "44%",
              borderRadius: "28px",
              backgroundColor: "rgba(255, 255, 255, 0)",
            }}
          >
            <div className="relative flex h-full flex-col overflow-hidden px-4 pb-6 pt-6 sm:px-6 md:px-8 md:pb-6 md:pt-8 lg:px-14 lg:pb-8 lg:pt-10">
              <div
                ref={shellCopyRef}
                className="mx-auto flex max-w-[780px] flex-col items-center text-center will-change-transform md:max-w-[680px] lg:max-w-[780px]"
                style={{ opacity: 0, transform: "translate3d(0, 42px, 0)" }}
              >
                <div
                  ref={shellEyebrowRef}
                  className="will-change-transform"
                  style={{ opacity: 0, transform: "translate3d(0, 18px, 0)" }}
                >
                  <HeroRichText
                    as="span"
                    className="inline-flex rounded-full bg-black/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.38em] text-neutral-500"
                    mode="inline"
                    value={content.stackBadge}
                  />
                </div>
                <div
                  ref={shellTitleRef}
                  className="mt-5 will-change-transform lg:mt-6"
                  style={{ opacity: 0, transform: "translate3d(0, 26px, 0)" }}
                >
                  <HeroRichText
                    as="h2"
                    className="font-display text-[clamp(2.2rem,5.1vw,4rem)] leading-[0.92] tracking-[-0.055em] text-neutral-900 md:text-[clamp(2.2rem,5.1vw,4rem)] lg:text-[clamp(2.7rem,6vw,5.2rem)] lg:leading-[0.9] lg:tracking-[-0.06em] [&_span]:align-baseline"
                    mode="inline"
                    value={content.stackTitle}
                  />
                </div>
                <div
                  ref={shellBodyRef}
                  className="mt-4 will-change-transform lg:mt-5"
                  style={{ opacity: 0, transform: "translate3d(0, 22px, 0)" }}
                >
                  <HeroRichText
                    as="div"
                    className="max-w-[620px] text-sm leading-6 text-neutral-600 md:text-base md:leading-7 lg:text-lg lg:leading-8 [&_p]:m-0 [&_p+p]:mt-4"
                    mode="block"
                    value={content.stackBody}
                  />
                </div>
                <div
                  ref={shellButtonRef}
                  className="mt-6 will-change-transform lg:mt-7"
                  style={{ opacity: 0, transform: "translate3d(0, 18px, 0)" }}
                >
                  <Link href={content.stackCtaHref}>
                    <Button className="h-11 rounded-full bg-[#050b3a] px-7 text-sm font-semibold text-white hover:bg-[#0a1560]">
                      {content.stackCtaText}
                    </Button>
                  </Link>
                </div>
              </div>

              <div
                ref={desktopCardsRowRef}
                className="hero-card-scroller relative mx-auto mt-5 flex w-full touch-pan-x snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 pt-1 will-change-transform md:mt-auto md:max-w-[760px] md:justify-center md:gap-4 md:overflow-visible md:px-0 md:pb-0 md:pt-6 lg:mt-10 lg:max-w-[1100px] lg:gap-6 lg:pt-0"
                style={{
                  opacity: 0,
                  transform: "translate3d(0, 44px, 0)",
                  scrollPaddingInline: "1rem",
                }}
              >
                <Link
                  href={cards[0]?.href ?? "#"}
                  ref={(node) => {
                    leftCardRef.current = node;
                  }}
                  aria-label={`View ${cards[0]?.label ?? ""} projects`}
                  className="relative z-10 flex h-[286px] w-[80vw] max-w-[290px] shrink-0 snap-start overflow-hidden rounded-[28px] bg-neutral-950 text-white shadow-[0_30px_100px_rgba(15,23,42,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050b3a] md:h-[340px] md:w-[220px] md:max-w-none lg:h-[430px] lg:w-[280px]"
                  style={{
                    opacity: 0,
                    transform: "translate3d(0, 42px, 0) scale(0.92)",
                  }}
                >
                  <div className="relative h-full w-full overflow-hidden">
                    {/* Left card*/}
                    <HeroCardImage
                      src={leftCardImage}
                      alt={`${cards[0]?.metaTitle ?? ""} preview`}
                      sizes={CARD_IMAGE_SIZES}
                      objectPosition={cards[0]?.objectPosition ?? "center"}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: "var(--dexta-secondary)",
                        opacity: 0.38,
                      }}
                    />
                    <div className="absolute bottom-20 left-4 right-4 md:bottom-24 md:left-5 md:right-5 lg:bottom-28">
                      <p className="text-[10px] font-semibold tracking-[0.34em] text-white/62">
                        {cards[0]?.label}
                      </p>
                      <h3 className="mt-3 text-[1.9rem] font-black leading-none tracking-[-0.06em] md:text-[2.2rem] lg:text-[2.6rem]">
                        {cards[0]?.title}
                      </h3>
                      <span className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-950">
                        {cards[0]?.chip}
                      </span>
                    </div>
                    <div className="absolute inset-x-2.5 bottom-2.5 flex items-center gap-2 rounded-[16px] bg-white/96 px-3 py-2.5 text-neutral-900 shadow-[0_20px_60px_rgba(15,23,42,0.18)] md:inset-x-3 md:bottom-3 md:gap-2.5 md:px-3.5 md:py-2.5 lg:inset-x-4 lg:bottom-4 lg:gap-3 lg:rounded-[18px] lg:px-4 lg:py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-[11px] font-bold text-sky-950 md:h-10 md:w-10 md:text-xs">
                        {cards[0]?.badge}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold md:text-sm">
                          {cards[0]?.metaTitle}
                        </p>
                        <p className="text-[11px] text-neutral-500 md:text-xs">
                          {cards[0]?.metaSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link
                  href={cards[1]?.href ?? "#"}
                  ref={(node) => {
                    centerCardRef.current = node;
                  }}
                  aria-label={`View ${cards[1]?.label ?? ""} projects`}
                  className="relative z-20 flex h-[286px] w-[80vw] max-w-[290px] shrink-0 snap-start overflow-hidden rounded-[28px] bg-neutral-950 text-white shadow-[0_36px_110px_rgba(15,23,42,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050b3a] will-change-transform md:h-[340px] md:w-[220px] md:max-w-none lg:h-[430px] lg:w-[280px]"
                  style={{
                    opacity: 0,
                    transform: "translate3d(0, 0, 0) scale(1)",
                  }}
                >
                  {/* Center card */}
                  <div className="relative h-full w-full overflow-hidden">
                    <HeroCardImage
                      src={centerCardImage}
                      alt={`${cards[1]?.metaTitle ?? ""} preview`}
                      sizes={CARD_IMAGE_SIZES}
                      objectPosition={cards[1]?.objectPosition ?? "center"}
                    />
                    <div
                      className="absolute inset-0 z-10"
                      style={{
                        backgroundColor: "var(--dexta)",
                        opacity: 0.38,
                      }}
                    />
                    <div className="absolute bottom-20 left-4 right-4 z-20 md:bottom-24 md:left-5 md:right-5 lg:bottom-28">
                      <p className="text-[10px] font-semibold tracking-[0.34em] text-white/62">
                        {cards[1]?.label}
                      </p>
                      <h3 className="mt-3 text-[1.9rem] font-black leading-none tracking-[-0.06em] md:text-[2.2rem] lg:text-[2.6rem]">
                        {cards[1]?.title}
                      </h3>
                      <span className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-950">
                        {cards[1]?.chip}
                      </span>
                    </div>
                    <div className="absolute inset-x-2.5 bottom-2.5 z-20 flex items-center gap-2 rounded-[16px] bg-white/96 px-3 py-2.5 text-neutral-900 shadow-[0_20px_60px_rgba(15,23,42,0.18)] md:inset-x-3 md:bottom-3 md:gap-2.5 md:px-3.5 md:py-2.5 lg:inset-x-4 lg:bottom-4 lg:gap-3 lg:rounded-[18px] lg:px-4 lg:py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-950 md:h-10 md:w-10 md:text-xs">
                        {cards[1]?.badge}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold md:text-sm">
                          {cards[1]?.metaTitle}
                        </p>
                        <p className="text-[11px] text-neutral-500 md:text-xs">
                          {cards[1]?.metaSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link
                  href={cards[2]?.href ?? "#"}
                  ref={(node) => {
                    rightCardRef.current = node;
                  }}
                  aria-label={`View ${cards[2]?.label ?? ""} projects`}
                  className="relative z-30 flex h-[286px] w-[80vw] max-w-[290px] shrink-0 snap-start overflow-hidden rounded-[28px] bg-neutral-950 text-white shadow-[0_30px_100px_rgba(15,23,42,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050b3a] md:h-[340px] md:w-[220px] md:max-w-none lg:h-[430px] lg:w-[280px]"
                  style={{
                    opacity: 0,
                    transform: "translate3d(0, 52px, 0) scale(0.92)",
                  }}
                >
                  <div className="relative h-full w-full overflow-hidden">
                    {/* Right card*/}
                    <HeroCardImage
                      src={rightCardImage}
                      alt={`${cards[2]?.metaTitle ?? ""} preview`}
                      sizes={CARD_IMAGE_SIZES}
                      objectPosition={cards[2]?.objectPosition ?? "center"}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: "var(--dexta-primary)",
                        opacity: 0.38,
                      }}
                    />
                    <div className="absolute bottom-20 left-4 right-4 md:bottom-24 md:left-5 md:right-5 lg:bottom-28">
                      <p className="text-[10px] font-semibold tracking-[0.34em] text-white/62">
                        {cards[2]?.label}
                      </p>
                      <h3 className="mt-3 text-[1.9rem] font-black leading-none tracking-[-0.06em] md:text-[2.2rem] lg:text-[2.6rem]">
                        {cards[2]?.title}
                      </h3>
                      <span className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-neutral-950">
                        {cards[2]?.chip}
                      </span>
                    </div>
                    <div className="absolute inset-x-2.5 bottom-2.5 flex items-center gap-2 rounded-[16px] bg-white/96 px-3 py-2.5 text-neutral-900 shadow-[0_20px_60px_rgba(15,23,42,0.18)] md:inset-x-3 md:bottom-3 md:gap-2.5 md:px-3.5 md:py-2.5 lg:inset-x-4 lg:bottom-4 lg:gap-3 lg:rounded-[18px] lg:px-4 lg:py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-950 md:h-10 md:w-10 md:text-xs">
                        {cards[2]?.badge}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold md:text-sm">
                          {cards[2]?.metaTitle}
                        </p>
                        <p className="text-[11px] text-neutral-500 md:text-xs">
                          {cards[2]?.metaSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
