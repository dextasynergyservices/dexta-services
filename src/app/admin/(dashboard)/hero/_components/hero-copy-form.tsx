"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeHeroRichText } from "@/lib/hero-rich-text";
import { DEFAULT_HERO_CONTENT } from "@/lib/hero-defaults";
import type { HeroContent } from "@/lib/hero-types";
import { heroContentSchema, type HeroContentInput } from "@/lib/validators";
import { ImageUpload } from "@/components/admin/events/image-upload";
import { updateHeroContent } from "../actions";

interface HeroCopyFormProps {
  content: HeroContent | null;
}

export function HeroCopyForm({ content }: HeroCopyFormProps) {
  const initialContent = content ?? DEFAULT_HERO_CONTENT;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HeroContentInput>({
    resolver: zodResolver(heroContentSchema),
    defaultValues: {
      backgroundImagePublicId: initialContent.backgroundImagePublicId,
      cardFallbackImagePublicId: initialContent.cardFallbackImagePublicId,
      eyebrow: normalizeHeroRichText(initialContent.eyebrow, "inline"),
      headline: normalizeHeroRichText(initialContent.headline, "inline"),
      body: normalizeHeroRichText(initialContent.body, "block"),
      ctaText: initialContent.ctaText,
      ctaHref: initialContent.ctaHref,
      stackBadge: normalizeHeroRichText(initialContent.stackBadge, "inline"),
      stackTitle: normalizeHeroRichText(initialContent.stackTitle, "inline"),
      stackBody: normalizeHeroRichText(initialContent.stackBody, "block"),
      stackCtaText: initialContent.stackCtaText,
      stackCtaHref: initialContent.stackCtaHref,
    },
  });

  useEffect(() => {
    reset({
      backgroundImagePublicId: initialContent.backgroundImagePublicId,
      cardFallbackImagePublicId: initialContent.cardFallbackImagePublicId,
      eyebrow: normalizeHeroRichText(initialContent.eyebrow, "inline"),
      headline: normalizeHeroRichText(initialContent.headline, "inline"),
      body: normalizeHeroRichText(initialContent.body, "block"),
      ctaText: initialContent.ctaText,
      ctaHref: initialContent.ctaHref,
      stackBadge: normalizeHeroRichText(initialContent.stackBadge, "inline"),
      stackTitle: normalizeHeroRichText(initialContent.stackTitle, "inline"),
      stackBody: normalizeHeroRichText(initialContent.stackBody, "block"),
      stackCtaText: initialContent.stackCtaText,
      stackCtaHref: initialContent.stackCtaHref,
    });
  }, [initialContent, reset]);

  const onSubmit = async (data: HeroContentInput) => {
    const result = await updateHeroContent(data);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ── Images ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[#222] bg-[#111] p-6">
        <h2 className="mb-1 text-sm font-semibold text-white">Hero Images</h2>
        <p className="mb-5 text-xs text-[#555]">
          Upload via Cloudinary. Existing backend images will preview here so
          you can see what is live before replacing it.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Background Image
            </Label>
            <ImageUpload
              value={watch("backgroundImagePublicId") ?? undefined}
              onChange={(id) => setValue("backgroundImagePublicId", id)}
              onRemove={() => setValue("backgroundImagePublicId", null)}
              emptyLabel="Click to upload hero background"
              previewAlt="Hero background preview"
              fallbackSrc="/images/services.png"
            />
            <p className="mt-1.5 text-xs text-[#555]">
              Full-bleed background visible behind the headline. If empty, the
              local hero background is used.
            </p>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Hero Foreground Image
            </Label>
            <ImageUpload
              value={watch("cardFallbackImagePublicId") ?? undefined}
              onChange={(id) => setValue("cardFallbackImagePublicId", id)}
              onRemove={() => setValue("cardFallbackImagePublicId", null)}
              emptyLabel="Click to upload hero foreground image"
              previewAlt="Hero foreground preview"
              fallbackSrc="/images/fprint.png"
            />
            <p className="mt-1.5 text-xs text-[#555]">
              Used only for the featured foreground image in the hero section.
              Hero cards now use only their own uploaded images.
            </p>
          </div>
        </div>
      </div>

      {/* ── Zone 1: Main Hero Copy ──────────────────────────────────────── */}
      <div className="rounded-xl border border-[#222] bg-[#111] p-6">
        <h2 className="mb-1 text-sm font-semibold text-white">
          Main Hero Copy
        </h2>
        <p className="mb-5 text-xs text-[#555]">
          The headline and call-to-action visible above the fold. Use the rich
          text toolbar to style individual words, letters, and manual line
          breaks.
        </p>
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="eyebrow"
              className="mb-1.5 block text-xs text-[#888]"
            >
              Eyebrow text
            </Label>
            <RichTextEditor
              minHeight={180}
              placeholder="e.g. Dexta Synergy Services"
              value={watch("eyebrow") ?? ""}
              onChange={(value) =>
                setValue("eyebrow", value, {
                  shouldDirty: true,
                })
              }
            />
            {errors.eyebrow && (
              <p className="mt-1 text-xs text-red-400">
                {errors.eyebrow.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="headline"
              className="mb-1.5 block text-xs text-[#888]"
            >
              Headline (H1)
            </Label>
            <RichTextEditor
              minHeight={220}
              placeholder="e.g. Saturating our world with Imprints of value"
              value={watch("headline") ?? ""}
              onChange={(value) =>
                setValue("headline", value, {
                  shouldDirty: true,
                })
              }
            />
            {errors.headline && (
              <p className="mt-1 text-xs text-red-400">
                {errors.headline.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="body" className="mb-1.5 block text-xs text-[#888]">
              Body paragraph
            </Label>
            <RichTextEditor
              minHeight={260}
              placeholder="Supporting copy beneath the headline..."
              value={watch("body") ?? ""}
              onChange={(value) =>
                setValue("body", value, {
                  shouldDirty: true,
                })
              }
            />
            {errors.body && (
              <p className="mt-1 text-xs text-red-400">{errors.body.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="ctaText"
                className="mb-1.5 block text-xs text-[#888]"
              >
                CTA button text
              </Label>
              <Input
                id="ctaText"
                placeholder="e.g. See Our Work"
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
              <Label
                htmlFor="ctaHref"
                className="mb-1.5 block text-xs text-[#888]"
              >
                CTA link
              </Label>
              <Input
                id="ctaHref"
                placeholder="e.g. /projects"
                className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                {...register("ctaHref")}
              />
              {errors.ctaHref && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.ctaHref.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Zone 2: Service Stack Section ──────────────────────────────── */}
      <div className="rounded-xl border border-[#222] bg-[#111] p-6">
        <h2 className="mb-1 text-sm font-semibold text-white">
          Service Stack Section
        </h2>
        <p className="mb-5 text-xs text-[#555]">
          The white panel that animates in on scroll — sits over the cards. The
          text styling toolbar here only affects the text itself.
        </p>
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="stackBadge"
              className="mb-1.5 block text-xs text-[#888]"
            >
              Badge / eyebrow
            </Label>
            <RichTextEditor
              minHeight={180}
              placeholder="e.g. Dexta service stack"
              value={watch("stackBadge") ?? ""}
              onChange={(value) =>
                setValue("stackBadge", value, {
                  shouldDirty: true,
                })
              }
            />
            {errors.stackBadge && (
              <p className="mt-1 text-xs text-red-400">
                {errors.stackBadge.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="stackTitle"
              className="mb-1.5 block text-xs text-[#888]"
            >
              Title
            </Label>
            <RichTextEditor
              minHeight={220}
              placeholder="e.g. Your brand, reimagined"
              value={watch("stackTitle") ?? ""}
              onChange={(value) =>
                setValue("stackTitle", value, {
                  shouldDirty: true,
                })
              }
            />
            {errors.stackTitle && (
              <p className="mt-1 text-xs text-red-400">
                {errors.stackTitle.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="stackBody"
              className="mb-1.5 block text-xs text-[#888]"
            >
              Body paragraph
            </Label>
            <RichTextEditor
              minHeight={260}
              placeholder="Supporting copy..."
              value={watch("stackBody") ?? ""}
              onChange={(value) =>
                setValue("stackBody", value, {
                  shouldDirty: true,
                })
              }
            />
            {errors.stackBody && (
              <p className="mt-1 text-xs text-red-400">
                {errors.stackBody.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="stackCtaText"
                className="mb-1.5 block text-xs text-[#888]"
              >
                CTA button text
              </Label>
              <Input
                id="stackCtaText"
                placeholder="e.g. Start a Project"
                className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                {...register("stackCtaText")}
              />
              {errors.stackCtaText && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.stackCtaText.message}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="stackCtaHref"
                className="mb-1.5 block text-xs text-[#888]"
              >
                CTA link
              </Label>
              <Input
                id="stackCtaHref"
                placeholder="e.g. /contact"
                className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                {...register("stackCtaHref")}
              />
              {errors.stackCtaHref && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.stackCtaHref.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Submit ──────────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
