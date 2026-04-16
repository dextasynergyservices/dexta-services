import type { CSSProperties, ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Globe2,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCloudinaryUrl,
  isCloudinaryUrl,
  type TransformOptions,
} from "@/lib/cloudinary";
import { AboutSpaceSection } from "./about-space-section";
import type {
  AboutExpertiseItemData,
  AboutIconKey,
  AboutMilestoneData,
  AboutPageContentData,
  AboutSpaceItemData,
  AboutTeamMemberData,
  AboutValueItemData,
} from "@/lib/about-defaults";

const HERO_IMAGE_FALLBACK = "/images/about.png";

const ICON_MAP: Record<AboutIconKey, ComponentType<{ className?: string }>> = {
  TARGET: Target,
  LIGHTBULB: Lightbulb,
  GLOBE: Globe2,
  TRENDING_UP: TrendingUp,
  SPARKLES: Sparkles,
  ZAP: Zap,
  HEART_HANDSHAKE: HeartHandshake,
  SHIELD: ShieldCheck,
};

const CARD_IMAGE_TRANSFORMS = {
  c: "fill",
  f: "auto",
  g: "face",
  h: 960,
  q: "auto",
  w: 800,
} as const satisfies TransformOptions;

function resolveImage(
  publicId: string | null | undefined,
  fallback: string,
  options?: TransformOptions,
) {
  return publicId ? getCloudinaryUrl(publicId, options) : fallback;
}

function AboutVisual({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  if (isCloudinaryUrl(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
      />
    );
  }

  return (
    <Image src={src} alt={alt} fill priority={priority} className={className} />
  );
}

function TeamPortrait({ member }: { member: AboutTeamMemberData }) {
  if (member.imagePublicId) {
    const src = resolveImage(
      member.imagePublicId,
      HERO_IMAGE_FALLBACK,
      CARD_IMAGE_TRANSFORMS,
    );
    return (
      <AboutVisual
        src={src}
        alt={member.name}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--dexta-secondary)] text-3xl font-semibold text-white">
      {member.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)}
    </div>
  );
}

export function AboutPageView({
  content,
  milestones,
  expertiseItems,
  teamMembers,
  spaceItems,
  valueItems,
}: {
  content: AboutPageContentData;
  milestones: AboutMilestoneData[];
  expertiseItems: AboutExpertiseItemData[];
  teamMembers: AboutTeamMemberData[];
  spaceItems: AboutSpaceItemData[];
  valueItems: AboutValueItemData[];
}) {
  const heroImagePublicId = content.heroBackgroundImagePublicId;
  const heroImage =
    heroImagePublicId && /^https?:\/\//i.test(heroImagePublicId)
      ? heroImagePublicId
      : heroImagePublicId
        ? getCloudinaryUrl(heroImagePublicId, {
            c: "fill",
            f: "auto",
            g: "auto",
            q: "auto",
            w: 2200,
          })
        : HERO_IMAGE_FALLBACK;

  const pageStyle = {
    "--about-page-bg": "var(--background)",
    "--about-page-fg": "var(--dexta-secondary)",
    "--about-brand": "var(--dexta-primary)",
    "--about-brand-deep": "var(--dexta-secondary)",
    "--about-accent": "var(--dexta)",
    "--about-accent-contrast": "var(--primary-foreground)",
    "--about-card": "var(--card)",
    "--about-border": "var(--dexta-primary)",
  } as CSSProperties;

  return (
    <main
      style={pageStyle}
      className="bg-[var(--about-page-bg)] text-[var(--about-page-fg)]"
    >
      <section className="relative overflow-hidden bg-[var(--about-brand-deep)] text-white">
        <div className="absolute inset-0">
          {/* We intentionally match the project/offers hero layering here so
              the about image reads through the overlay the same way. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--about-brand-deep)_75%,transparent)]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-white bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--about-brand-deep)]">
              {content.heroEyebrow}
            </p>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(2.75rem,7vw,5.75rem)] leading-[0.92] tracking-[-0.05em]">
              {content.heroHeadline}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white sm:text-lg">
              {content.heroBody}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={content.heroPrimaryCtaHref}>
                <Button className="h-12 rounded-full bg-[var(--about-accent)] px-7 text-sm font-semibold text-[var(--about-accent-contrast)] transition-opacity hover:opacity-90">
                  {content.heroPrimaryCtaText}
                </Button>
              </Link>
              <Link href={content.heroSecondaryCtaHref}>
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-white bg-transparent px-7 text-sm font-semibold text-white hover:bg-white hover:text-[var(--about-brand-deep)]"
                >
                  {content.heroSecondaryCtaText}
                </Button>
              </Link>
            </div>
          </div>

          {/* <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white bg-white px-5 py-5"
              >
                <p className="text-3xl font-semibold tracking-[-0.04em] text-[var(--about-brand-deep)]">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--about-brand)]">{stat.label}</p>
              </div>
            ))}
          </div> */}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24 ">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--about-accent)]">
              {content.storyLabel}
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight tracking-[-0.04em] text-[var(--about-brand-deep)] sm:text-5xl">
              {content.storyTitle}
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-[var(--about-brand-deep)]">
              <p>{content.storyBody1}</p>
              <p>{content.storyBody2}</p>
            </div>
            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--about-brand)]">
                {content.storyTrustedLabel}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {content.storyTrustedItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[var(--about-brand)] bg-white px-4 py-2 text-sm text-[var(--about-brand-deep)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[32px] border border-[var(--about-brand)] bg-white p-7 ">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--about-accent)]">
                {content.storyHighlightLabel}
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--about-brand-deep)]">
                {content.storyHighlightTitle}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--about-brand-deep)]">
                {content.storyHighlightBody}
              </p>
            </div>

            <div className="space-y-4">
              {milestones.map((item) => (
                <div
                  key={`${item.position}-${item.year}-${item.title}`}
                  className="grid gap-4 rounded-3xl border border-[var(--about-border)] bg-white p-5 sm:grid-cols-[110px_minmax(0,1fr)]"
                >
                  <div className="inline-flex h-fit rounded-2xl bg-[var(--about-brand)] px-4 py-3 text-sm font-semibold text-white">
                    {item.year}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--about-brand-deep)]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--about-brand-deep)]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AboutSpaceSection
        label={content.spaceLabel}
        title={content.spaceTitle}
        body={content.spaceBody}
        items={spaceItems}
      />

      <section className="bg-[color-mix(in_srgb,var(--about-accent)_7%,white)] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--about-accent)]">
              {content.expertiseLabel}
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-[-0.04em] text-[var(--about-brand-deep)] sm:text-5xl">
              {content.expertiseTitle}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--about-brand-deep)]">
              {content.expertiseBody}
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {expertiseItems.map((item) => {
              const Icon = ICON_MAP[item.icon];

              return (
                <article
                  key={`${item.position}-${item.title}`}
                  className="flex h-full flex-col rounded-[30px] border border-[var(--about-border)] bg-white p-6"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--about-brand)] text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-[var(--about-brand-deep)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-[var(--about-brand-deep)]">
                    {item.description}
                  </p>
                  <div className="mt-6 rounded-2xl border border-[var(--about-brand)] bg-white px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--about-brand)]">
                      {item.metricLabel}
                    </p>
                    <p className="mt-2 text-base font-semibold text-[var(--about-brand-deep)]">
                      {item.metricValue}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 xl:grid-cols-[290px_minmax(0,1fr)] xl:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--about-accent)]">
              {content.teamLabel}
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-[-0.04em] text-[var(--about-brand-deep)]">
              {content.teamTitle}
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--about-brand-deep)]">
              {content.teamBody}
            </p>

            <div className="mt-7 rounded-[24px] border border-[var(--about-brand)] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--about-accent)]">
                {content.cultureTitle}
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--about-brand-deep)]">
                {content.cultureBody}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {teamMembers.map((member) => (
              <article
                key={`${member.position}-${member.name}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-[var(--about-border)] bg-white p-3 transition-[transform,border-color,background-color] duration-500 motion-reduce:transition-none motion-safe:hover:-translate-y-2 motion-safe:hover:border-[var(--about-brand)] sm:p-4"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[var(--about-brand)] transition-transform duration-500 motion-reduce:transition-none motion-safe:group-hover:scale-x-100" />
                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[16px] border border-[var(--about-brand)] bg-white sm:h-24 sm:w-24">
                    <div className="h-full w-full transition-transform duration-500 motion-reduce:transition-none motion-safe:group-hover:scale-110">
                      <TeamPortrait member={member} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold leading-tight text-[var(--about-brand-deep)] transition-[color,transform] duration-500 motion-reduce:transition-none motion-safe:group-hover:translate-x-1 motion-safe:group-hover:text-[var(--about-brand)] sm:text-lg">
                      {member.name}
                    </h3>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[var(--about-accent)] transition-[color,letter-spacing] duration-500 motion-reduce:transition-none motion-safe:group-hover:tracking-[0.2em] sm:text-[13px]">
                      {member.role}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--about-brand-deep)] transition-transform duration-500 motion-reduce:transition-none motion-safe:group-hover:translate-x-0.5">
                      {member.bio}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {member.expertise.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--about-brand)] bg-white px-2.5 py-1 text-[11px] text-[var(--about-brand-deep)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3 rounded-[16px] border border-[var(--about-brand)] bg-white px-3.5 py-3 transition-transform duration-500 motion-reduce:transition-none motion-safe:group-hover:translate-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--about-brand)]">
                    {content.teamNoteLabel}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--about-brand-deep)]">
                    {member.funFact}
                  </p>
                </div>
                {member.showPortfolioButton && member.portfolioUrl ? (
                  <div className="mt-3">
                    <Link href={member.portfolioUrl}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-full rounded-full border-[var(--about-brand)] bg-transparent text-[var(--about-brand-deep)] transition-[transform,color,background-color] duration-500 motion-reduce:transition-none motion-safe:group-hover:translate-y-0.5 hover:bg-[var(--about-brand)] hover:text-white"
                      >
                        {content.teamPortfolioButtonText}
                      </Button>
                    </Link>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color-mix(in_srgb,var(--about-accent)_7%,white)] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--about-accent)]">
              {content.valuesLabel}
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight tracking-[-0.04em] text-[var(--about-brand-deep)] sm:text-5xl">
              {content.valuesTitle}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--about-brand-deep)]">
              {content.valuesBody}
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {valueItems.map((item) => {
              const Icon = ICON_MAP[item.icon];

              return (
                <article
                  key={`${item.position}-${item.title}`}
                  className="rounded-[20px] border border-[var(--about-border)] bg-white p-6"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--about-brand-deep)] text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-[var(--about-brand-deep)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--about-brand-deep)]">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="overflow-hidden rounded-[10px] bg-[var(--about-brand-deep)] px-6 py-10 text-white sm:px-8 lg:px-12 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white">
                {content.ctaLabel}
              </p>
              <h2 className="mt-4 font-display text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">
                {content.ctaTitle}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white">
                {content.ctaBody}
              </p>
            </div>
            <div>
              <Link href={content.ctaHref}>
                <Button className="h-12 rounded-full bg-[var(--about-accent)] px-7 text-sm font-semibold text-[var(--about-accent-contrast)] transition-opacity hover:opacity-90">
                  {content.ctaText}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
