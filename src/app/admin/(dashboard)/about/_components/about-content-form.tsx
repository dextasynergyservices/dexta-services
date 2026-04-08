"use client";

import { useEffect, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ImageUpload } from "@/components/admin/events/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  aboutPageContentSchema,
  type AboutPageContentInput,
} from "@/lib/validators";
import type { AboutPageContentRow } from "../actions";
import { updateAboutPageContentSection } from "../actions";

const aboutHeroContentSchema = aboutPageContentSchema.pick({
  heroEyebrow: true,
  heroHeadline: true,
  heroBody: true,
  heroBackgroundImagePublicId: true,
  heroPrimaryCtaText: true,
  heroPrimaryCtaHref: true,
  heroSecondaryCtaText: true,
  heroSecondaryCtaHref: true,
});

type AboutHeroContentValues = z.infer<typeof aboutHeroContentSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#222] bg-[#111] p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
          <ImageIcon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-[#666]">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function buildDefaultValues(
  content: AboutPageContentRow,
): AboutHeroContentValues {
  return {
    heroEyebrow: content.heroEyebrow,
    heroHeadline: content.heroHeadline,
    heroBody: content.heroBody,
    heroBackgroundImagePublicId: content.heroBackgroundImagePublicId,
    heroPrimaryCtaText: content.heroPrimaryCtaText,
    heroPrimaryCtaHref: content.heroPrimaryCtaHref,
    heroSecondaryCtaText: content.heroSecondaryCtaText,
    heroSecondaryCtaHref: content.heroSecondaryCtaHref,
  };
}

export function AboutContentForm({
  content,
}: {
  content: AboutPageContentRow;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AboutHeroContentValues>({
    resolver: zodResolver(aboutHeroContentSchema),
    defaultValues: buildDefaultValues(content),
  });

  useEffect(() => {
    reset(buildDefaultValues(content));
  }, [content, reset]);

  const onSubmit = async (data: AboutHeroContentValues) => {
    const result = await updateAboutPageContentSection(
      data as Partial<AboutPageContentInput>,
    );

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    reset(data);
    toast.success(result.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <SectionCard
        title="Hero Section"
        description="Edit only the public About page hero here. Story, expertise, team, values, and bottom CTA now live in their own About section pages."
      >
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">
            Hero background image
          </Label>
          <ImageUpload
            value={watch("heroBackgroundImagePublicId") ?? undefined}
            onChange={(value) =>
              setValue("heroBackgroundImagePublicId", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            onRemove={() =>
              setValue("heroBackgroundImagePublicId", null, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            emptyLabel="Upload about hero image"
            previewAlt="About hero background"
            fallbackSrc="/images/about.png"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Eyebrow</Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("heroEyebrow")}
            />
            <FieldError message={errors.heroEyebrow?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Primary CTA text
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("heroPrimaryCtaText")}
            />
            <FieldError message={errors.heroPrimaryCtaText?.message} />
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Headline</Label>
          <Textarea
            rows={3}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("heroHeadline")}
          />
          <FieldError message={errors.heroHeadline?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Body</Label>
          <Textarea
            rows={5}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("heroBody")}
          />
          <FieldError message={errors.heroBody?.message} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Primary CTA link
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("heroPrimaryCtaHref")}
            />
            <FieldError message={errors.heroPrimaryCtaHref?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Secondary CTA text
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("heroSecondaryCtaText")}
            />
            <FieldError message={errors.heroSecondaryCtaText?.message} />
          </div>
          <div className="md:col-span-2">
            <Label className="mb-1.5 block text-xs text-[#888]">
              Secondary CTA link
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("heroSecondaryCtaHref")}
            />
            <FieldError message={errors.heroSecondaryCtaHref?.message} />
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="min-w-40 rounded-full bg-cyan-500 text-[#03131d] hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving
            </>
          ) : (
            "Save Hero Section"
          )}
        </Button>
      </div>
    </form>
  );
}
