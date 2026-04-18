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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

function formDefaults(
  content: WeBrandSchoolsPageContentRow,
): WeBrandSchoolsPageContentInput {
  return { ...content };
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
            <Label className="mb-1.5 block text-xs text-[#888]">Hero image</Label>
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
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Eyebrow</Label>
          <Input
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
            {...register("heroEyebrow")}
          />
          <FieldError message={errors.heroEyebrow?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Headline</Label>
          <Textarea
            rows={3}
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
            {...register("heroHeadline")}
          />
          <FieldError message={errors.heroHeadline?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Body</Label>
          <Textarea
            rows={5}
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
            {...register("heroBody")}
          />
          <FieldError message={errors.heroBody?.message} />
        </div>
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
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Hero feature 1
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("heroFeature1")}
            />
            <FieldError message={errors.heroFeature1?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Hero feature 2
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("heroFeature2")}
            />
            <FieldError message={errors.heroFeature2?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Hero feature 3
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("heroFeature3")}
            />
            <FieldError message={errors.heroFeature3?.message} />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Overview Section"
        description="Control the post-hero introduction block, its action buttons, and the school benefits panel."
        icon={<LayoutTemplate className="h-5 w-5" />}
      >
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Label</Label>
          <Input
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
            {...register("overviewLabel")}
          />
          <FieldError message={errors.overviewLabel?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Title</Label>
          <Textarea
            rows={2}
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
            {...register("overviewTitle")}
          />
          <FieldError message={errors.overviewTitle?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Body</Label>
          <Textarea
            rows={5}
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
            {...register("overviewBody")}
          />
          <FieldError message={errors.overviewBody?.message} />
        </div>
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
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">
            Benefits panel label
          </Label>
          <Input
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
            {...register("overviewBenefitsLabel")}
          />
          <FieldError message={errors.overviewBenefitsLabel?.message} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Benefit 1</Label>
            <Textarea
              rows={3}
              className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("overviewBenefit1")}
            />
            <FieldError message={errors.overviewBenefit1?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Benefit 2</Label>
            <Textarea
              rows={3}
              className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("overviewBenefit2")}
            />
            <FieldError message={errors.overviewBenefit2?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Benefit 3</Label>
            <Textarea
              rows={3}
              className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("overviewBenefit3")}
            />
            <FieldError message={errors.overviewBenefit3?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Benefit 4</Label>
            <Textarea
              rows={3}
              className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
              {...register("overviewBenefit4")}
            />
            <FieldError message={errors.overviewBenefit4?.message} />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Process Section"
        description="Update the section intro and the four-step workflow shown on the page."
        icon={<Layers className="h-5 w-5" />}
      >
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Label</Label>
          <Input
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
            {...register("processLabel")}
          />
          <FieldError message={errors.processLabel?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Title</Label>
          <Textarea
            rows={2}
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
            {...register("processTitle")}
          />
          <FieldError message={errors.processTitle?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Body</Label>
          <Textarea
            rows={4}
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
            {...register("processBody")}
          />
          <FieldError message={errors.processBody?.message} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {PROCESS_FIELDS.map(({ field, label, isBody }) => {
            return (
              <div key={field}>
                <Label className="mb-1.5 block text-xs text-[#888]">{label}</Label>
                {isBody ? (
                  <Textarea
                    rows={4}
                    className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
                    {...register(field)}
                  />
                ) : (
                  <Input
                    className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
                    {...register(field)}
                  />
                )}
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
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Label</Label>
          <Input
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
            {...register("templatesLabel")}
          />
          <FieldError message={errors.templatesLabel?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Title</Label>
          <Textarea
            rows={2}
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
            {...register("templatesTitle")}
          />
          <FieldError message={errors.templatesTitle?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Body</Label>
          <Textarea
            rows={4}
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
            {...register("templatesBody")}
          />
          <FieldError message={errors.templatesBody?.message} />
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
            "Save Page Content"
          )}
        </Button>
      </div>
    </form>
  );
}
