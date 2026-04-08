"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ImageIcon,
  Loader2,
  MousePointerClick,
  Type,
  Users2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/events/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  offersPageContentSchema,
  type OffersPageContentInput,
} from "@/lib/validators";
import type { OffersPageContentRow } from "../actions";
import { updateOffersPageContent } from "../actions";

interface OffersContentFormProps {
  content: OffersPageContentRow;
}

type SectionCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
};

function SectionCard({ title, description, children, icon }: SectionCardProps) {
  return (
    <div className="rounded-xl border border-[#222] bg-[#111] p-6">
      <div className="mb-5 flex items-start gap-3">
        {icon ? (
          <div className="rounded-lg bg-white/5 p-2 text-cyan-400">{icon}</div>
        ) : null}
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="mt-1 text-xs text-[#555]">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

function formDefaults(content: OffersPageContentRow): OffersPageContentInput {
  return {
    heroEyebrow: content.heroEyebrow,
    heroHeadline: content.heroHeadline,
    heroBody: content.heroBody,
    heroBgImagePublicId: content.heroBgImagePublicId,
    heroCtaText: content.heroCtaText,
    heroCtaHref: content.heroCtaHref,
    servicesSectionLabel: content.servicesSectionLabel,
    servicesSectionTitle: content.servicesSectionTitle,
    servicesSectionBody: content.servicesSectionBody,
    audienceSectionLabel: content.audienceSectionLabel,
    audienceSectionTitle: content.audienceSectionTitle,
    audienceSectionBody: content.audienceSectionBody,
    popularBadgeText: content.popularBadgeText,
    featuresLabel: content.featuresLabel,
    choosePlanText: content.choosePlanText,
    requestQuoteText: content.requestQuoteText,
    ctaLabel: content.ctaLabel,
    ctaTitle: content.ctaTitle,
    ctaBody: content.ctaBody,
    cta1Text: content.cta1Text,
    cta1Href: content.cta1Href,
    cta2Text: content.cta2Text,
    cta2Href: content.cta2Href,
  };
}

export function OffersContentForm({ content }: OffersContentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<OffersPageContentInput>({
    resolver: zodResolver(offersPageContentSchema),
    defaultValues: formDefaults(content),
  });
  const [isSavingHeroImage, setIsSavingHeroImage] = useState(false);

  useEffect(() => {
    reset(formDefaults(content));
  }, [content, reset]);

  const onSubmit = async (data: OffersPageContentInput) => {
    const result = await updateOffersPageContent(data);

    if (result.success) {
      reset(data);
      toast.success(result.message);
      return;
    }

    toast.error(result.message);
  };

  const persistHeroImage = async (heroBgImagePublicId: string | null) => {
    const nextData: OffersPageContentInput = {
      ...getValues(),
      heroBgImagePublicId,
    };

    setValue("heroBgImagePublicId", heroBgImagePublicId, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setIsSavingHeroImage(true);

    const result = await updateOffersPageContent(nextData);

    setIsSavingHeroImage(false);

    if (result.success) {
      reset(nextData);
      toast.success("Hero background saved");
      return;
    }

    toast.error(result.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <input type="hidden" {...register("servicesSectionLabel")} />
      <input type="hidden" {...register("servicesSectionTitle")} />
      <input type="hidden" {...register("servicesSectionBody")} />

      <SectionCard
        title="Hero"
        description="Edit the intro copy and optional background image at the top of the /offers page."
        icon={<ImageIcon className="h-5 w-5" />}
      >
        <div>
          <input type="hidden" {...register("heroBgImagePublicId")} />
          <Label className="mb-1.5 block text-xs text-[#888]">
            Background image
          </Label>
          <ImageUpload
            value={watch("heroBgImagePublicId") ?? undefined}
            onChange={(id) => {
              void persistHeroImage(id);
            }}
            onRemove={() => {
              void persistHeroImage(null);
            }}
            emptyLabel="Upload offers hero background"
            previewAlt="Offers hero background"
            fallbackSrc="/images/services.png"
          />
          <p className="mt-2 text-xs text-[#555]">
            Optional Cloudinary image for the hero section. Leave empty to use
            the default look.
          </p>
          {isSavingHeroImage ? (
            <p className="mt-2 text-xs text-cyan-400">
              Saving hero background...
            </p>
          ) : null}
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">
            Eyebrow badge
          </Label>
          <Input
            placeholder="e.g. Dexta Offer Suite"
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("heroEyebrow")}
          />
          <FieldError message={errors.heroEyebrow?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Headline</Label>
          <Textarea
            rows={3}
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("heroHeadline")}
          />
          <FieldError message={errors.heroHeadline?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Body</Label>
          <Textarea
            rows={4}
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("heroBody")}
          />
          <FieldError message={errors.heroBody?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">CTA text</Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("heroCtaText")}
            />
            <FieldError message={errors.heroCtaText?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">CTA href</Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("heroCtaHref")}
            />
            <FieldError message={errors.heroCtaHref?.message} />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Audience Section"
        description='Controls the "Who We Serve" heading above the audience and offer-group tabs.'
        icon={<Users2 className="h-5 w-5" />}
      >
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Label</Label>
          <Input
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("audienceSectionLabel")}
          />
          <FieldError message={errors.audienceSectionLabel?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Title</Label>
          <Textarea
            rows={2}
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("audienceSectionTitle")}
          />
          <FieldError message={errors.audienceSectionTitle?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Body</Label>
          <Textarea
            rows={4}
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("audienceSectionBody")}
          />
          <FieldError message={errors.audienceSectionBody?.message} />
        </div>
      </SectionCard>

      <SectionCard
        title="Offer Card Copy"
        description="Shared labels used inside the offer cards and offer-group pricing area."
        icon={<Type className="h-5 w-5" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Popular badge text
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("popularBadgeText")}
            />
            <FieldError message={errors.popularBadgeText?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Features label
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("featuresLabel")}
            />
            <FieldError message={errors.featuresLabel?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Priced offer CTA
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("choosePlanText")}
            />
            <FieldError message={errors.choosePlanText?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Quote CTA
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("requestQuoteText")}
            />
            <FieldError message={errors.requestQuoteText?.message} />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Bottom CTA"
        description="Controls the closing call-to-action block and both CTA buttons."
        icon={<MousePointerClick className="h-5 w-5" />}
      >
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Label</Label>
          <Input
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("ctaLabel")}
          />
          <FieldError message={errors.ctaLabel?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Title</Label>
          <Textarea
            rows={2}
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("ctaTitle")}
          />
          <FieldError message={errors.ctaTitle?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Body</Label>
          <Textarea
            rows={4}
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("ctaBody")}
          />
          <FieldError message={errors.ctaBody?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Primary CTA text
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("cta1Text")}
            />
            <FieldError message={errors.cta1Text?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Primary CTA href
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("cta1Href")}
            />
            <FieldError message={errors.cta1Href?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Secondary CTA text
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("cta2Text")}
            />
            <FieldError message={errors.cta2Text?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Secondary CTA href
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("cta2Href")}
            />
            <FieldError message={errors.cta2Href?.message} />
          </div>
        </div>
      </SectionCard>

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
            "Save Offers Page Content"
          )}
        </Button>
      </div>
    </form>
  );
}
