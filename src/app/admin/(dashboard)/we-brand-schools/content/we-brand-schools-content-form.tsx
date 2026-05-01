"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  ImageIcon,
  LayoutTemplate,
  Layers,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/events/image-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  normalizeHeroRichText,
  type HeroRichTextMode,
} from "@/lib/hero-rich-text";
import {
  weBrandSchoolsPageContentSchema,
  type WeBrandSchoolsPageContentInput,
} from "@/lib/validators";
import type { WeBrandSchoolsPageContentRow } from "../actions";
import { updateWeBrandSchoolsPageContent } from "../actions";

const PROCESS_FIELDS: Array<{
  field:
    | "processStep1Title"
    | "processStep1Body"
    | "processStep2Title"
    | "processStep2Body"
    | "processStep3Title"
    | "processStep3Body"
    | "processStep4Title"
    | "processStep4Body";
  label: string;
  isBody: boolean;
}> = [
  { field: "processStep1Title", label: "Step 1 title", isBody: false },
  { field: "processStep1Body", label: "Step 1 body", isBody: true },
  { field: "processStep2Title", label: "Step 2 title", isBody: false },
  { field: "processStep2Body", label: "Step 2 body", isBody: true },
  { field: "processStep3Title", label: "Step 3 title", isBody: false },
  { field: "processStep3Body", label: "Step 3 body", isBody: true },
  { field: "processStep4Title", label: "Step 4 title", isBody: false },
  { field: "processStep4Body", label: "Step 4 body", isBody: true },
];

const RICH_TEXT_FIELD_MODES = {
  heroEyebrow: "inline",
  heroHeadline: "inline",
  heroBody: "block",
  heroFeature1: "inline",
  heroFeature2: "inline",
  heroFeature3: "inline",
  overviewLabel: "inline",
  overviewTitle: "inline",
  overviewBody: "block",
  overviewBenefitsLabel: "inline",
  overviewBenefit1: "inline",
  overviewBenefit2: "inline",
  overviewBenefit3: "inline",
  overviewBenefit4: "inline",
  processLabel: "inline",
  processTitle: "inline",
  processBody: "block",
  processStep1Title: "inline",
  processStep1Body: "block",
  processStep2Title: "inline",
  processStep2Body: "block",
  processStep3Title: "inline",
  processStep3Body: "block",
  processStep4Title: "inline",
  processStep4Body: "block",
  templatesLabel: "inline",
  templatesTitle: "inline",
  templatesBody: "block",
} satisfies Partial<
  Record<keyof WeBrandSchoolsPageContentInput, HeroRichTextMode>
>;

type RichTextFieldName = keyof typeof RICH_TEXT_FIELD_MODES;

function formDefaults(
  content: WeBrandSchoolsPageContentRow,
): WeBrandSchoolsPageContentInput {
  const defaults = { ...content };

  for (const [field, mode] of Object.entries(RICH_TEXT_FIELD_MODES) as Array<
    [RichTextFieldName, HeroRichTextMode]
  >) {
    defaults[field] = normalizeHeroRichText(defaults[field], mode);
  }

  return defaults;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

function SectionCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#222] bg-[#111] p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-xl bg-white/5 p-2 text-cyan-400">{icon}</div>
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="mt-1 text-xs text-[#666]">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function WeBrandSchoolsContentForm({
  content,
}: {
  content: WeBrandSchoolsPageContentRow;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<WeBrandSchoolsPageContentInput>({
    resolver: zodResolver(weBrandSchoolsPageContentSchema),
    defaultValues: formDefaults(content),
  });
  const [isSavingMedia, setIsSavingMedia] = useState(false);

  useEffect(() => {
    reset(formDefaults(content));
  }, [content, reset]);

  const onSubmit = async (data: WeBrandSchoolsPageContentInput) => {
    const result = await updateWeBrandSchoolsPageContent(data);
    if (!result.success) {
      toast.error(result.message);
      return;
    }

    reset(data);
    toast.success(result.message);
  };

  const updateMediaField = async (
    field: "logoPublicId" | "heroImagePublicId",
    value: string | null,
  ) => {
    const currentValues = watch();
    const previousValue = currentValues[field] ?? null;

    setValue(field, value, {
      shouldDirty: true,
      shouldTouch: true,
    });

    const payload = {
      ...currentValues,
      [field]: value,
    };

    setIsSavingMedia(true);
    const result = await updateWeBrandSchoolsPageContent(payload);
    setIsSavingMedia(false);

    if (!result.success) {
      setValue(field, previousValue, {
        shouldDirty: false,
        shouldTouch: true,
      });
      toast.error(result.message);
      return;
    }

    reset(payload);
    toast.success(result.message);
  };

  const renderRichTextField = (
    field: RichTextFieldName,
    label: string,
    minHeight = RICH_TEXT_FIELD_MODES[field] === "block" ? 220 : 160,
  ) => (
    <div>
      <Label className="mb-1.5 block text-xs text-[#888]">{label}</Label>
      <RichTextEditor
        minHeight={minHeight}
        value={watch(field) ?? ""}
        onChange={(value) =>
          setValue(field, value, {
            shouldDirty: true,
            shouldTouch: true,
          })
        }
      />
      <FieldError message={errors[field]?.message} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <SectionCard
        title="Brand Media"
        description="Set the logo shown in the hero header area and the standalone hero media shown on larger screens."
        icon={<ImageIcon className="h-5 w-5" />}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <input type="hidden" {...register("logoPublicId")} />
            <Label className="mb-1.5 block text-xs text-[#888]">Logo</Label>
            <ImageUpload
              value={watch("logoPublicId") ?? undefined}
              onChange={(value) => {
                void updateMediaField("logoPublicId", value);
              }}
              onRemove={() => {
                void updateMediaField("logoPublicId", null);
              }}
              emptyLabel="Upload logo"
              previewAlt="We Brand Schools logo"
            />
          </div>
          <div>
            <input type="hidden" {...register("heroImagePublicId")} />
            <Label className="mb-1.5 block text-xs text-[#888]">
              Hero image
            </Label>
            <ImageUpload
              value={watch("heroImagePublicId") ?? undefined}
              onChange={(value) => {
                void updateMediaField("heroImagePublicId", value);
              }}
              onRemove={() => {
                void updateMediaField("heroImagePublicId", null);
              }}
              emptyLabel="Upload hero image"
              previewAlt="We Brand Schools hero image"
              fallbackSrc="/images/school1.jpg"
            />
          </div>
        </div>
        {isSavingMedia ? (
          <p className="text-xs text-cyan-400">Saving media changes...</p>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Hero Copy"
        description="Edit the intro messaging and CTA buttons shown at the top of the page."
        icon={<FileText className="h-5 w-5" />}
      >
        {renderRichTextField("heroEyebrow", "Eyebrow")}
        {renderRichTextField("heroHeadline", "Headline", 220)}
        {renderRichTextField("heroBody", "Body", 260)}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Primary CTA text
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("heroPrimaryCtaText")}
            />
            <FieldError message={errors.heroPrimaryCtaText?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Primary CTA href
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("heroPrimaryCtaHref")}
            />
            <FieldError message={errors.heroPrimaryCtaHref?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Secondary CTA text
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("heroSecondaryCtaText")}
            />
            <FieldError message={errors.heroSecondaryCtaText?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Secondary CTA href
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("heroSecondaryCtaHref")}
            />
            <FieldError message={errors.heroSecondaryCtaHref?.message} />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {renderRichTextField("heroFeature1", "Hero feature 1")}
          {renderRichTextField("heroFeature2", "Hero feature 2")}
          {renderRichTextField("heroFeature3", "Hero feature 3")}
        </div>
      </SectionCard>

      <SectionCard
        title="Overview Section"
        description="Control the post-hero introduction block, its action buttons, and the school benefits panel."
        icon={<LayoutTemplate className="h-5 w-5" />}
      >
        {renderRichTextField("overviewLabel", "Label")}
        {renderRichTextField("overviewTitle", "Title", 220)}
        {renderRichTextField("overviewBody", "Body", 260)}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Primary CTA text
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("overviewPrimaryCtaText")}
            />
            <FieldError message={errors.overviewPrimaryCtaText?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Primary CTA href
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("overviewPrimaryCtaHref")}
            />
            <FieldError message={errors.overviewPrimaryCtaHref?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Secondary CTA text
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("overviewSecondaryCtaText")}
            />
            <FieldError message={errors.overviewSecondaryCtaText?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Secondary CTA href
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("overviewSecondaryCtaHref")}
            />
            <FieldError message={errors.overviewSecondaryCtaHref?.message} />
          </div>
        </div>
        {renderRichTextField("overviewBenefitsLabel", "Benefits panel label")}
        <div className="grid gap-4 lg:grid-cols-2">
          {renderRichTextField("overviewBenefit1", "Benefit 1")}
          {renderRichTextField("overviewBenefit2", "Benefit 2")}
          {renderRichTextField("overviewBenefit3", "Benefit 3")}
          {renderRichTextField("overviewBenefit4", "Benefit 4")}
        </div>
      </SectionCard>

      <SectionCard
        title="Process Section"
        description="Update the section intro and the four-step workflow shown on the page."
        icon={<Layers className="h-5 w-5" />}
      >
        {renderRichTextField("processLabel", "Label")}
        {renderRichTextField("processTitle", "Title", 220)}
        {renderRichTextField("processBody", "Body", 240)}

        <div className="grid gap-4 lg:grid-cols-2">
          {PROCESS_FIELDS.map(({ field, label, isBody }) => {
            return (
              <div key={field}>
                <Label className="mb-1.5 block text-xs text-[#888]">
                  {label}
                </Label>
                <RichTextEditor
                  minHeight={isBody ? 220 : 160}
                  value={watch(field) ?? ""}
                  onChange={(value) =>
                    setValue(field, value, {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
                />
                <FieldError message={errors[field]?.message} />
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        title="Templates Section"
        description="Manage the heading copy above the template grid."
        icon={<LayoutTemplate className="h-5 w-5" />}
      >
        {renderRichTextField("templatesLabel", "Label")}
        {renderRichTextField("templatesTitle", "Title", 220)}
        {renderRichTextField("templatesBody", "Body", 240)}
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
            "Save Page Content"
          )}
        </Button>
      </div>
    </form>
  );
}
