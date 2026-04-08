"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2, Palette, Code, Printer } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/events/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  projectsHeroContentSchema,
  portfolioTabContentSchema,
  type ProjectsHeroContentInput,
  type PortfolioTabContentInput,
} from "@/lib/validators";
import type { ProjectsHeroRow, PortfolioTabRow, ServiceType } from "../actions";
import {
  updateProjectsHeroContent,
  updatePortfolioTabContent,
} from "../actions";

// ─── Tab Config ───────────────────────────────────────────────────────────────

const TAB_UI: Record<
  ServiceType,
  { label: string; icon: typeof Palette; accent: string; border: string }
> = {
  DESIGN: {
    label: "Design",
    icon: Palette,
    accent: "text-purple-400",
    border: "border-purple-500/20",
  },
  BUILD: {
    label: "Build",
    icon: Code,
    accent: "text-cyan-400",
    border: "border-cyan-500/20",
  },
  PRINT: {
    label: "Print",
    icon: Printer,
    accent: "text-pink-400",
    border: "border-pink-500/20",
  },
};

// ─── Hero Content Form ────────────────────────────────────────────────────────

interface HeroContentFormProps {
  hero: ProjectsHeroRow;
}

function HeroContentForm({ hero }: HeroContentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProjectsHeroContentInput>({
    resolver: zodResolver(projectsHeroContentSchema),
    defaultValues: {
      eyebrow: hero.eyebrow,
      headline: hero.headline,
      body: hero.body,
      backgroundImagePublicId: hero.backgroundImagePublicId,
      ctaText: hero.ctaText,
      ctaHref: hero.ctaHref,
      ctaSectionLabel: hero.ctaSectionLabel,
      ctaSectionHeadline: hero.ctaSectionHeadline,
      ctaSectionBody: hero.ctaSectionBody,
      cta2Text: hero.cta2Text,
      cta2Href: hero.cta2Href,
    },
  });

  const onSubmit = async (data: ProjectsHeroContentInput) => {
    const result = await updateProjectsHeroContent(data);
    if (result.success) {
      reset(data);
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ── Background Image ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#222] bg-[#111] p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-white/5 p-2 text-[#8ab4ff]">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Background Image</h3>
            <p className="text-xs text-[#555]">
              Optional full-bleed image behind the hero. If empty, the solid
              color background is used.
            </p>
          </div>
        </div>
        <ImageUpload
          value={watch("backgroundImagePublicId") ?? undefined}
          onChange={(id) =>
            setValue("backgroundImagePublicId", id, { shouldDirty: true })
          }
          onRemove={() =>
            setValue("backgroundImagePublicId", null, { shouldDirty: true })
          }
          emptyLabel="Upload hero background image"
          previewAlt="Portfolio hero background"
        />
      </div>

      {/* ── Hero Copy ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#222] bg-[#111] p-6">
        <h3 className="mb-1 text-sm font-bold text-white">Hero Copy</h3>
        <p className="mb-5 text-xs text-[#555]">
          The badge, headline, and CTA for the top of the portfolio page.
        </p>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Headline (H1)
            </Label>
            <Textarea
              rows={3}
              placeholder="e.g. Work that looks sharp, moves with intent..."
              className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("headline")}
            />
            {errors.headline && (
              <p className="mt-1 text-xs text-red-400">
                {errors.headline.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom CTA Section ───────────────────────────────────────── */}
      <div className="rounded-xl border border-[#222] bg-[#111] p-6">
        <h3 className="mb-1 text-sm font-bold text-white">
          Bottom CTA Section
        </h3>
        <p className="mb-5 text-xs text-[#555]">
          The call-to-action panel at the bottom of the portfolio page.
        </p>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Section label (eyebrow)
            </Label>
            <Input
              placeholder="e.g. Start something precise"
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("ctaSectionLabel")}
            />
            {errors.ctaSectionLabel && (
              <p className="mt-1 text-xs text-red-400">
                {errors.ctaSectionLabel.message}
              </p>
            )}
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Section headline
            </Label>
            <Textarea
              rows={2}
              placeholder="e.g. If the work feels close to what you need, we should talk."
              className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("ctaSectionHeadline")}
            />
            {errors.ctaSectionHeadline && (
              <p className="mt-1 text-xs text-red-400">
                {errors.ctaSectionHeadline.message}
              </p>
            )}
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Section body
            </Label>
            <Textarea
              rows={3}
              placeholder="e.g. We take ideas from early direction through execution..."
              className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("ctaSectionBody")}
            />
            {errors.ctaSectionBody && (
              <p className="mt-1 text-xs text-red-400">
                {errors.ctaSectionBody.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs text-[#888]">
                Primary CTA text
              </Label>
              <Input
                placeholder="e.g. Start a Project"
                className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                {...register("ctaText")}
              />
              {errors.ctaText && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.ctaText.message}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-[#888]">
                Primary CTA link
              </Label>
              <Input
                placeholder="e.g. /contact"
                className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                {...register("ctaHref")}
              />
              {errors.ctaHref && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.ctaHref.message}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-[#888]">
                Secondary CTA text
              </Label>
              <Input
                placeholder="e.g. Explore Services"
                className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                {...register("cta2Text")}
              />
              {errors.cta2Text && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.cta2Text.message}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-[#888]">
                Secondary CTA link
              </Label>
              <Input
                placeholder="e.g. /#services"
                className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                {...register("cta2Href")}
              />
              {errors.cta2Href && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.cta2Href.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Hero & CTA"
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── Tab Content Form ─────────────────────────────────────────────────────────

interface TabContentFormProps {
  tab: PortfolioTabRow;
}

function TabContentForm({ tab }: TabContentFormProps) {
  const ui = TAB_UI[tab.type];
  const Icon = ui.icon;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PortfolioTabContentInput>({
    resolver: zodResolver(portfolioTabContentSchema),
    defaultValues: {
      portfolioEyebrow: tab.portfolioEyebrow,
      portfolioDescription: tab.portfolioDescription,
    },
  });

  const onSubmit = async (data: PortfolioTabContentInput) => {
    const result = await updatePortfolioTabContent(tab.type, data);
    if (result.success) {
      reset(data);
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className={`rounded-xl border ${ui.border} bg-[#111] p-6`}>
      <div className="mb-5 flex items-center gap-3">
        <div className={`rounded-lg bg-white/5 p-2 ${ui.accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className={`text-sm font-bold ${ui.accent}`}>{ui.label} Tab</h3>
          <p className="text-xs text-[#555]">
            Tab card subtitle and hero body text for the{" "}
            {ui.label.toLowerCase()} tab.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">
            Tab card subtitle (eyebrow)
          </Label>
          <Input
            placeholder="e.g. Identity systems, campaigns, and visual direction"
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("portfolioEyebrow")}
          />
          {errors.portfolioEyebrow && (
            <p className="mt-1 text-xs text-red-400">
              {errors.portfolioEyebrow.message}
            </p>
          )}
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">
            Hero body text (shown when this tab is active)
          </Label>
          <Textarea
            rows={3}
            placeholder="e.g. Brand worlds, interfaces, and design systems shaped to feel sharp..."
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("portfolioDescription")}
          />
          {errors.portfolioDescription && (
            <p className="mt-1 text-xs text-red-400">
              {errors.portfolioDescription.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              `Save ${ui.label} Tab`
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

interface ProjectsHeroFormProps {
  hero: ProjectsHeroRow;
  tabs: PortfolioTabRow[];
}

export function ProjectsHeroForm({ hero, tabs }: ProjectsHeroFormProps) {
  return (
    <div className="space-y-5">
      <HeroContentForm hero={hero} />
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#555]">
          Tab Content
        </p>
        <div className="space-y-4">
          {tabs.map((tab) => (
            <TabContentForm key={tab.type} tab={tab} />
          ))}
        </div>
      </div>
    </div>
  );
}
