"use client";

import { useEffect, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  Layers3,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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

type SectionFormProps = {
  content: AboutPageContentRow;
};

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
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#222] bg-[#111] p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">{icon}</div>
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-[#666]">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SaveButton({
  isSubmitting,
  isDirty,
  label,
}: {
  isSubmitting: boolean;
  isDirty: boolean;
  label: string;
}) {
  return (
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
          label
        )}
      </Button>
    </div>
  );
}

const aboutStorySectionSchema = aboutPageContentSchema.pick({
  storyLabel: true,
  storyTitle: true,
  storyBody1: true,
  storyBody2: true,
  storyHighlightLabel: true,
  storyHighlightTitle: true,
  storyHighlightBody: true,
  storyTrustedLabel: true,
  storyTrustedItems: true,
});

type AboutStorySectionValues = z.infer<typeof aboutStorySectionSchema>;

export function AboutStoryContentForm({ content }: SectionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AboutStorySectionValues>({
    resolver: zodResolver(aboutStorySectionSchema),
    defaultValues: {
      storyLabel: content.storyLabel,
      storyTitle: content.storyTitle,
      storyBody1: content.storyBody1,
      storyBody2: content.storyBody2,
      storyHighlightLabel: content.storyHighlightLabel,
      storyHighlightTitle: content.storyHighlightTitle,
      storyHighlightBody: content.storyHighlightBody,
      storyTrustedLabel: content.storyTrustedLabel,
      storyTrustedItems: JSON.stringify(content.storyTrustedItems),
    },
  });
  const [trustedItemsText, setTrustedItemsText] = useState(
    content.storyTrustedItems.join("\n"),
  );

  useEffect(() => {
    reset({
      storyLabel: content.storyLabel,
      storyTitle: content.storyTitle,
      storyBody1: content.storyBody1,
      storyBody2: content.storyBody2,
      storyHighlightLabel: content.storyHighlightLabel,
      storyHighlightTitle: content.storyHighlightTitle,
      storyHighlightBody: content.storyHighlightBody,
      storyTrustedLabel: content.storyTrustedLabel,
      storyTrustedItems: JSON.stringify(content.storyTrustedItems),
    });
    setTrustedItemsText(content.storyTrustedItems.join("\n"));
  }, [content, reset]);

  const syncTrustedItems = (value: string) => {
    setTrustedItemsText(value);
    const normalized = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    setValue("storyTrustedItems", JSON.stringify(normalized), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: AboutStorySectionValues) => {
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
        title="Story Section Copy"
        description="Edit the story intro, highlight card content, and the trusted-by chip list that appears above the timeline cards."
        icon={<FileText className="h-5 w-5" />}
      >
        <input type="hidden" {...register("storyTrustedItems")} />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Section label</Label>
            <Input className="border-[#2a2a2a] bg-[#0d0d0d] text-white" {...register("storyLabel")} />
            <FieldError message={errors.storyLabel?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Trusted label</Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("storyTrustedLabel")}
            />
            <FieldError message={errors.storyTrustedLabel?.message} />
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Story title</Label>
          <Textarea
            rows={3}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("storyTitle")}
          />
          <FieldError message={errors.storyTitle?.message} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Paragraph 1</Label>
            <Textarea
              rows={6}
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("storyBody1")}
            />
            <FieldError message={errors.storyBody1?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Paragraph 2</Label>
            <Textarea
              rows={6}
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("storyBody2")}
            />
            <FieldError message={errors.storyBody2?.message} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Highlight label</Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("storyHighlightLabel")}
            />
            <FieldError message={errors.storyHighlightLabel?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Highlight title</Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("storyHighlightTitle")}
            />
            <FieldError message={errors.storyHighlightTitle?.message} />
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Highlight body</Label>
          <Textarea
            rows={4}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("storyHighlightBody")}
          />
          <FieldError message={errors.storyHighlightBody?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Trusted items</Label>
          <Textarea
            rows={5}
            value={trustedItemsText}
            onChange={(event) => syncTrustedItems(event.target.value)}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            placeholder={"Business\nEducation\nHealthcare\nCommunity"}
          />
          <p className="mt-1 text-xs text-[#555]">One item per line.</p>
          <FieldError message={errors.storyTrustedItems?.message} />
        </div>
      </SectionCard>

      <SaveButton
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        label="Save Story Section"
      />
    </form>
  );
}

const aboutExpertiseSectionSchema = aboutPageContentSchema.pick({
  expertiseLabel: true,
  expertiseTitle: true,
  expertiseBody: true,
});

type AboutExpertiseSectionValues = z.infer<typeof aboutExpertiseSectionSchema>;

export function AboutExpertiseContentForm({ content }: SectionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AboutExpertiseSectionValues>({
    resolver: zodResolver(aboutExpertiseSectionSchema),
    defaultValues: {
      expertiseLabel: content.expertiseLabel,
      expertiseTitle: content.expertiseTitle,
      expertiseBody: content.expertiseBody,
    },
  });

  useEffect(() => {
    reset({
      expertiseLabel: content.expertiseLabel,
      expertiseTitle: content.expertiseTitle,
      expertiseBody: content.expertiseBody,
    });
  }, [content, reset]);

  const onSubmit = async (data: AboutExpertiseSectionValues) => {
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
        title="Expertise Section Copy"
        description="Edit the lead-in copy that sits above the expertise cards on the public About page."
        icon={<Layers3 className="h-5 w-5" />}
      >
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Section label</Label>
          <Input
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("expertiseLabel")}
          />
          <FieldError message={errors.expertiseLabel?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Title</Label>
          <Textarea
            rows={3}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("expertiseTitle")}
          />
          <FieldError message={errors.expertiseTitle?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Body</Label>
          <Textarea
            rows={5}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("expertiseBody")}
          />
          <FieldError message={errors.expertiseBody?.message} />
        </div>
      </SectionCard>

      <SaveButton
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        label="Save Expertise Section"
      />
    </form>
  );
}

const aboutTeamSectionSchema = aboutPageContentSchema.pick({
  teamLabel: true,
  teamTitle: true,
  teamBody: true,
  cultureTitle: true,
  cultureBody: true,
  teamNoteLabel: true,
  teamPortfolioButtonText: true,
});

type AboutTeamSectionValues = z.infer<typeof aboutTeamSectionSchema>;

export function AboutTeamSectionForm({ content }: SectionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AboutTeamSectionValues>({
    resolver: zodResolver(aboutTeamSectionSchema),
    defaultValues: {
      teamLabel: content.teamLabel,
      teamTitle: content.teamTitle,
      teamBody: content.teamBody,
      cultureTitle: content.cultureTitle,
      cultureBody: content.cultureBody,
      teamNoteLabel: content.teamNoteLabel,
      teamPortfolioButtonText: content.teamPortfolioButtonText,
    },
  });

  useEffect(() => {
    reset({
      teamLabel: content.teamLabel,
      teamTitle: content.teamTitle,
      teamBody: content.teamBody,
      cultureTitle: content.cultureTitle,
      cultureBody: content.cultureBody,
      teamNoteLabel: content.teamNoteLabel,
      teamPortfolioButtonText: content.teamPortfolioButtonText,
    });
  }, [content, reset]);

  const onSubmit = async (data: AboutTeamSectionValues) => {
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
        title="Team Section Copy"
        description="Edit the team intro, culture block, note label, and portfolio button text that appear around the team member cards."
        icon={<Users className="h-5 w-5" />}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Section label</Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("teamLabel")}
            />
            <FieldError message={errors.teamLabel?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Culture title</Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("cultureTitle")}
            />
            <FieldError message={errors.cultureTitle?.message} />
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Section title</Label>
          <Textarea
            rows={3}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("teamTitle")}
          />
          <FieldError message={errors.teamTitle?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Section body</Label>
          <Textarea
            rows={5}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("teamBody")}
          />
          <FieldError message={errors.teamBody?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Culture body</Label>
          <Textarea
            rows={4}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("cultureBody")}
          />
          <FieldError message={errors.cultureBody?.message} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Team note label</Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("teamNoteLabel")}
            />
            <FieldError message={errors.teamNoteLabel?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Portfolio button text
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("teamPortfolioButtonText")}
            />
            <FieldError message={errors.teamPortfolioButtonText?.message} />
          </div>
        </div>
      </SectionCard>

      <SaveButton
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        label="Save Team Section"
      />
    </form>
  );
}

const aboutValuesSectionSchema = aboutPageContentSchema.pick({
  valuesLabel: true,
  valuesTitle: true,
  valuesBody: true,
});

type AboutValuesSectionValues = z.infer<typeof aboutValuesSectionSchema>;

export function AboutValuesContentForm({ content }: SectionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AboutValuesSectionValues>({
    resolver: zodResolver(aboutValuesSectionSchema),
    defaultValues: {
      valuesLabel: content.valuesLabel,
      valuesTitle: content.valuesTitle,
      valuesBody: content.valuesBody,
    },
  });

  useEffect(() => {
    reset({
      valuesLabel: content.valuesLabel,
      valuesTitle: content.valuesTitle,
      valuesBody: content.valuesBody,
    });
  }, [content, reset]);

  const onSubmit = async (data: AboutValuesSectionValues) => {
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
        title="Values Section Copy"
        description="Edit the intro copy that sits above the values cards on the About page."
        icon={<ShieldCheck className="h-5 w-5" />}
      >
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Section label</Label>
          <Input
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("valuesLabel")}
          />
          <FieldError message={errors.valuesLabel?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Title</Label>
          <Textarea
            rows={3}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("valuesTitle")}
          />
          <FieldError message={errors.valuesTitle?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Body</Label>
          <Textarea
            rows={5}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("valuesBody")}
          />
          <FieldError message={errors.valuesBody?.message} />
        </div>
      </SectionCard>

      <SaveButton
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        label="Save Values Section"
      />
    </form>
  );
}

const aboutCtaSectionSchema = aboutPageContentSchema.pick({
  ctaLabel: true,
  ctaTitle: true,
  ctaBody: true,
  ctaText: true,
  ctaHref: true,
});

type AboutCtaSectionValues = z.infer<typeof aboutCtaSectionSchema>;

export function AboutCtaContentForm({ content }: SectionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AboutCtaSectionValues>({
    resolver: zodResolver(aboutCtaSectionSchema),
    defaultValues: {
      ctaLabel: content.ctaLabel,
      ctaTitle: content.ctaTitle,
      ctaBody: content.ctaBody,
      ctaText: content.ctaText,
      ctaHref: content.ctaHref,
    },
  });

  useEffect(() => {
    reset({
      ctaLabel: content.ctaLabel,
      ctaTitle: content.ctaTitle,
      ctaBody: content.ctaBody,
      ctaText: content.ctaText,
      ctaHref: content.ctaHref,
    });
  }, [content, reset]);

  const onSubmit = async (data: AboutCtaSectionValues) => {
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
        title="Bottom CTA Section"
        description="Edit the closing call-to-action section at the end of the public About page."
        icon={<FileText className="h-5 w-5" />}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Label</Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("ctaLabel")}
            />
            <FieldError message={errors.ctaLabel?.message} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Button text</Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("ctaText")}
            />
            <FieldError message={errors.ctaText?.message} />
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Title</Label>
          <Textarea
            rows={3}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("ctaTitle")}
          />
          <FieldError message={errors.ctaTitle?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Body</Label>
          <Textarea
            rows={4}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("ctaBody")}
          />
          <FieldError message={errors.ctaBody?.message} />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Button link</Label>
          <Input
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("ctaHref")}
          />
          <FieldError message={errors.ctaHref?.message} />
        </div>
      </SectionCard>

      <SaveButton
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        label="Save Bottom CTA"
      />
    </form>
  );
}
