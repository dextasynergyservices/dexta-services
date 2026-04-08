"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventFormSchema, type EventFormData } from "@/lib/validators";
import { FormBuilder } from "./form-builder";
import { ImageUpload } from "./image-upload";

const TIMEZONE_OPTIONS = [
  { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg (SAST)" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi (EAT)" },
  { value: "Africa/Cairo", label: "Africa/Cairo (EET)" },
  { value: "America/New_York", label: "America/New_York (EST)" },
  { value: "America/Chicago", label: "America/Chicago (CST)" },
  { value: "America/Denver", label: "America/Denver (MST)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (BRT)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (NZST)" },
  { value: "UTC", label: "UTC" },
];

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface EventFormProps {
  initialData?: EventFormData & { id?: string };
  action: (
    data: EventFormData,
  ) => Promise<{ success: boolean; message: string; eventId?: string }>;
  submitLabel: string;
}

export function EventForm({
  initialData,
  action,
  submitLabel,
}: EventFormProps) {
  const router = useRouter();
  const [unlimited, setUnlimited] = useState(!initialData?.attendeeLimit);

  const [slugTouched, setSlugTouched] = useState(!!initialData?.slug);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      dateTime: initialData?.dateTime ?? "",
      timezone: initialData?.timezone ?? "Africa/Lagos",
      location: initialData?.location ?? "",
      imagePublicId: initialData?.imagePublicId ?? "",
      attendeeLimit: initialData?.attendeeLimit ?? null,
      status: initialData?.status ?? "DRAFT",
      formFields: initialData?.formFields ?? [],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: EventFormData) => {
    // Convert comma-separated options to JSON arrays for SELECT fields
    const processedData = {
      ...data,
      attendeeLimit: unlimited ? null : data.attendeeLimit,
      formFields: data.formFields.map((field, i) => ({
        ...field,
        position: i,
        options:
          field.type === "SELECT" && field.options
            ? JSON.stringify(
                field.options
                  .split(",")
                  .map((o: string) => o.trim())
                  .filter(Boolean),
              )
            : field.options,
      })),
    };

    const result = await action(processedData);

    if (result.success) {
      toast.success(result.message);
      router.push(
        result.eventId ? `/admin/events/${result.eventId}` : "/admin/events",
      );
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Info */}
      <div className="rounded-xl border border-[#222] bg-[#111] p-6">
        <h2 className="mb-4 text-sm font-semibold text-white">Event Details</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="mb-1.5 text-xs text-[#888]">
              Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. Dev Day 2025"
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("title", {
                onChange: (e) => {
                  if (!slugTouched) {
                    setValue("slug", toSlug(e.target.value), {
                      shouldValidate: true,
                    });
                  }
                },
              })}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="slug" className="mb-1.5 text-xs text-[#888]">
              Slug
            </Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                placeholder="e.g. dev-day-2025"
                className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                {...register("slug", {
                  onChange: () => setSlugTouched(true),
                })}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
                onClick={() => {
                  const title = watch("title");
                  if (title) {
                    setValue("slug", toSlug(title), { shouldValidate: true });
                    setSlugTouched(false);
                  }
                }}
              >
                Generate
              </Button>
            </div>
            <p className="mt-1 text-xs text-[#555]">
              URL: /events/{watch("slug") || "..."}
            </p>
            {errors.slug && (
              <p className="mt-1 text-xs text-red-400">{errors.slug.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="mb-1.5 text-xs text-[#888]">
              Description
            </Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Tell people what this event is about..."
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="dateTime" className="mb-1.5 text-xs text-[#888]">
                Date &amp; Time
              </Label>
              <Input
                id="dateTime"
                type="datetime-local"
                className="border-[#2a2a2a] bg-[#0d0d0d] text-white focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20 [color-scheme:dark]"
                {...register("dateTime")}
              />
              {errors.dateTime && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.dateTime.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-1.5 text-xs text-[#888]">Timezone</Label>
              <Select
                value={watch("timezone")}
                onValueChange={(val) => setValue("timezone", val)}
              >
                <SelectTrigger
                  className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
                  aria-label="Event timezone"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#2a2a2a] bg-[#111] max-h-60">
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem
                      key={tz.value}
                      value={tz.value}
                      className="text-white focus:bg-[#1a1a1a] focus:text-white"
                    >
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.timezone && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.timezone.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="location" className="mb-1.5 text-xs text-[#888]">
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g. Online, Port Harcourt"
                className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                {...register("location")}
              />
              {errors.location && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="rounded-xl border border-[#222] bg-[#111] p-6">
        <h2 className="mb-4 text-sm font-semibold text-white">Event Image</h2>
        <ImageUpload
          value={watch("imagePublicId") || undefined}
          onChange={(publicId) => setValue("imagePublicId", publicId)}
          onRemove={() => setValue("imagePublicId", "")}
          emptyLabel="Click to upload event image"
          previewAlt="Event image preview"
        />
      </div>

      {/* Settings */}
      <div className="rounded-xl border border-[#222] bg-[#111] p-6">
        <h2 className="mb-4 text-sm font-semibold text-white">Settings</h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Attendee Limit */}
            <div>
              <Label className="mb-1.5 text-xs text-[#888]">
                Attendee Limit
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  disabled={unlimited}
                  placeholder="e.g. 50"
                  className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] disabled:opacity-40 focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                  {...register("attendeeLimit", { valueAsNumber: true })}
                />
                <div className="flex shrink-0 items-center gap-2">
                  <Switch
                    id="unlimited"
                    checked={unlimited}
                    onCheckedChange={(checked) => {
                      setUnlimited(checked);
                      if (checked) setValue("attendeeLimit", null);
                    }}
                  />
                  <Label htmlFor="unlimited" className="text-xs text-[#888]">
                    Unlimited
                  </Label>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <Label className="mb-1.5 text-xs text-[#888]">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(val) =>
                  setValue("status", val as EventFormData["status"])
                }
              >
                <SelectTrigger
                  className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
                  aria-label="Event status"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#2a2a2a] bg-[#111]">
                  <SelectItem
                    value="DRAFT"
                    className="text-white focus:bg-[#1a1a1a] focus:text-white"
                  >
                    Draft
                  </SelectItem>
                  <SelectItem
                    value="PUBLISHED"
                    className="text-white focus:bg-[#1a1a1a] focus:text-white"
                  >
                    Published
                  </SelectItem>
                  <SelectItem
                    value="CLOSED"
                    className="text-white focus:bg-[#1a1a1a] focus:text-white"
                  >
                    Closed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Form Builder */}
      <div className="rounded-xl border border-[#222] bg-[#111] p-6">
        <FormBuilder form={form} />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
        >
          Cancel
        </Button>
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
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
