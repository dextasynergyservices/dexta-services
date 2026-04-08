"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ImageUpload } from "@/components/admin/events/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { pricingPlanSchema, type PricingPlanInput } from "@/lib/validators";
import { parseJsonStringArray } from "@/lib/offers-defaults";
import type { PlanRow } from "../actions";

type FormValues = z.input<typeof pricingPlanSchema>;

interface Props {
  initialData?: PlanRow;
  onSubmit: (data: PricingPlanInput) => Promise<void>;
  onCancel: () => void;
}

function toFormValues(data?: PlanRow): FormValues {
  return {
    name: data?.name ?? "",
    subtitle: data?.subtitle ?? "",
    imagePublicId: data?.imagePublicId ?? null,
    features: data ? JSON.stringify(data.features) : "[]",
    billingEnabled: data?.billingEnabled ?? false,
    isHighlighted: data?.isHighlighted ?? false,
    highlightBgColor: data?.highlightBgColor ?? "",
    highlightTextColor: data?.highlightTextColor ?? "",
    isVisible: data?.isVisible ?? true,
  };
}

export function PlanForm({ initialData, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, unknown, PricingPlanInput>({
    resolver: zodResolver(pricingPlanSchema),
    defaultValues: toFormValues(initialData),
  });

  const [featureRows, setFeatureRows] = useState<string[]>(() => {
    const parsed = initialData ? parseJsonStringArray(JSON.stringify(initialData.features)) : [];
    return parsed.length ? parsed : [""];
  });

  useEffect(() => {
    reset(toFormValues(initialData));
    const parsed = initialData ? parseJsonStringArray(JSON.stringify(initialData.features)) : [];
    setFeatureRows(parsed.length ? parsed : [""]);
  }, [initialData, reset]);

  const syncFeatures = (rows: string[], shouldDirty: boolean) => {
    setFeatureRows(rows);
    setValue("features", JSON.stringify(rows.map((r) => r.trim()).filter(Boolean)), { shouldDirty, shouldValidate: shouldDirty });
  };

  const billingEnabled = watch("billingEnabled");
  const isHighlighted = watch("isHighlighted");
  const isVisible = watch("isVisible");
  const highlightBgColorValue = watch("highlightBgColor");
  const highlightTextColorValue = watch("highlightTextColor");
  const highlightBgColor =
    typeof highlightBgColorValue === "string" ? highlightBgColorValue : "";
  const highlightTextColor =
    typeof highlightTextColorValue === "string"
      ? highlightTextColorValue
      : "";

  return (
    <form
      onSubmit={handleSubmit(async (data) => { await onSubmit(data); })}
      className="max-h-[78vh] space-y-5 overflow-y-auto pr-1"
    >
      <input type="hidden" {...register("imagePublicId")} />
      <input type="hidden" {...register("features")} />
      <input type="hidden" {...register("highlightBgColor")} />
      <input type="hidden" {...register("highlightTextColor")} />

      <div>
        <Label htmlFor="plan-name" className="mb-1.5 block text-xs text-[#888]">Offer name</Label>
        <Input id="plan-name" placeholder="e.g. Reach Pro" className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20" {...register("name")} />
        {errors.name ? <p className="mt-1 text-xs text-red-400">{errors.name.message}</p> : null}
      </div>

      <div>
        <Label htmlFor="plan-subtitle" className="mb-1.5 block text-xs text-[#888]">Offer subtitle <span className="text-[#555]">(optional)</span></Label>
        <Textarea id="plan-subtitle" rows={2} placeholder="Short description under the offer name." className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20" {...register("subtitle")} />
        {errors.subtitle ? <p className="mt-1 text-xs text-red-400">{errors.subtitle.message}</p> : null}
      </div>

      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">
          Card image <span className="text-[#555]">(optional)</span>
        </Label>
        <ImageUpload
          value={watch("imagePublicId") ?? undefined}
          onChange={(value) =>
            setValue("imagePublicId", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          onRemove={() =>
            setValue("imagePublicId", null, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          emptyLabel="Upload offer card image"
          previewAlt={`${watch("name") || "Offer"} card image`}
          fallbackSrc="/images/services.png"
        />
        {errors.imagePublicId ? (
          <p className="mt-2 text-xs text-red-400">
            {errors.imagePublicId.message}
          </p>
        ) : null}
      </div>

      {/* Features */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <Label className="block text-xs text-[#888]">Features</Label>
          <Button type="button" variant="outline" size="sm" onClick={() => syncFeatures([...featureRows, ""], true)} className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {featureRows.map((feat, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={feat}
                onChange={(e) => {
                  const next = [...featureRows];
                  next[index] = e.target.value;
                  syncFeatures(next, true);
                }}
                placeholder={`Feature ${index + 1}`}
                className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => syncFeatures(featureRows.filter((_, i) => i !== index), true)}
                className="shrink-0 text-[#666] hover:bg-red-950/30 hover:text-red-400"
                aria-label={`Remove feature ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {errors.features ? <p className="mt-2 text-xs text-red-400">{errors.features.message}</p> : null}
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg border border-[#222] bg-[#0d0d0d] px-4 py-3">
          <Switch id="plan-billing" checked={billingEnabled} onCheckedChange={(c) => setValue("billingEnabled", c, { shouldDirty: true })} />
          <div>
            <Label htmlFor="plan-billing" className="text-xs text-[#888]">Enable billing options</Label>
            <p className="text-[11px] text-[#555]">Show a billing cycle selector inside this offer card.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-[#222] bg-[#0d0d0d] px-4 py-3">
          <Switch id="plan-highlighted" checked={isHighlighted} onCheckedChange={(c) => setValue("isHighlighted", c, { shouldDirty: true })} />
          <Label htmlFor="plan-highlighted" className="text-xs text-[#888]">Mark as recommended offer</Label>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-[#222] bg-[#0d0d0d] px-4 py-3">
          <Switch id="plan-visible" checked={isVisible} onCheckedChange={(c) => setValue("isVisible", c, { shouldDirty: true })} />
          <Label htmlFor="plan-visible" className="text-xs text-[#888]">Visible on /offers</Label>
        </div>
      </div>

      {isHighlighted ? (
        <div className="space-y-4 rounded-xl border border-[#222] bg-[#0d0d0d] p-4">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Recommended card colors
            </Label>
            <p className="text-[11px] text-[#555]">
              Choose the background and text color for this recommended offer card.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="offer-highlight-bg" className="mb-1.5 block text-xs text-[#888]">
                Background color
              </Label>
              <div className="flex items-center gap-3">
                <input
                  id="offer-highlight-bg"
                  type="color"
                  value={highlightBgColor || "#000c99"}
                  onChange={(event) =>
                    setValue("highlightBgColor", event.target.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className="h-11 w-14 cursor-pointer rounded border border-[#2a2a2a] bg-[#0d0d0d]"
                />
                <Input
                  value={highlightBgColor}
                  onChange={(event) =>
                    setValue("highlightBgColor", event.target.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  placeholder="#000c99"
                  className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                />
              </div>
              {errors.highlightBgColor ? <p className="mt-1 text-xs text-red-400">{errors.highlightBgColor.message}</p> : null}
            </div>

            <div>
              <Label htmlFor="offer-highlight-text" className="mb-1.5 block text-xs text-[#888]">
                Text color
              </Label>
              <div className="flex items-center gap-3">
                <input
                  id="offer-highlight-text"
                  type="color"
                  value={highlightTextColor || "#ffffff"}
                  onChange={(event) =>
                    setValue("highlightTextColor", event.target.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className="h-11 w-14 cursor-pointer rounded border border-[#2a2a2a] bg-[#0d0d0d]"
                />
                <Input
                  value={highlightTextColor}
                  onChange={(event) =>
                    setValue("highlightTextColor", event.target.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  placeholder="#ffffff"
                  className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                />
              </div>
              {errors.highlightTextColor ? <p className="mt-1 text-xs text-red-400">{errors.highlightTextColor.message}</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white">Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-60">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : initialData ? "Save Changes" : "Create Offer"}
        </Button>
      </div>
    </form>
  );
}
