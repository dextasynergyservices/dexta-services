"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { planBillingOptionSchema, type PlanBillingOptionInput } from "@/lib/validators";
import type { BillingOptionRow } from "../actions";

type FormValues = z.input<typeof planBillingOptionSchema>;

interface Props {
  initialData?: BillingOptionRow;
  onSubmit: (data: PlanBillingOptionInput) => Promise<void>;
  onCancel: () => void;
}

function parseOptionalNumber(value: unknown) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function toFormValues(data?: BillingOptionRow): FormValues {
  return {
    duration: (data?.duration as FormValues["duration"]) ?? "MONTHLY",
    priceNGN: data?.priceNGN ?? undefined,
    priceUSD: data?.priceUSD ?? undefined,
    label: data?.label ?? "",
    isDefault: data?.isDefault ?? false,
  };
}

export function BillingOptionForm({ initialData, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, unknown, PlanBillingOptionInput>({
    resolver: zodResolver(planBillingOptionSchema),
    defaultValues: toFormValues(initialData),
  });

  useEffect(() => { reset(toFormValues(initialData)); }, [initialData, reset]);

  const duration = watch("duration");
  const isDefault = watch("isDefault");

  return (
    <form onSubmit={handleSubmit(async (data) => { await onSubmit(data); })} className="space-y-5">
      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">Billing duration</Label>
        <Select value={duration} onValueChange={(v) => setValue("duration", v as PlanBillingOptionInput["duration"], { shouldDirty: true, shouldValidate: true })}>
          <SelectTrigger className="h-10 w-full border-[#2a2a2a] bg-[#0d0d0d] text-white">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent className="border-[#222] bg-[#111] text-white">
            <SelectItem value="DAILY">Daily</SelectItem>
            <SelectItem value="WEEKLY">Weekly</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="QUARTERLY">Quarterly</SelectItem>
            <SelectItem value="YEARLY">Yearly</SelectItem>
          </SelectContent>
        </Select>
        {errors.duration ? <p className="mt-1 text-xs text-red-400">{errors.duration.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="opt-ngn" className="mb-1.5 block text-xs text-[#888]">Price NGN <span className="text-[#555]">(optional)</span></Label>
          <Input
            id="opt-ngn"
            type="number"
            min="0"
            step="500"
            placeholder="e.g. 25000"
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("priceNGN", { setValueAs: parseOptionalNumber })}
          />
          {errors.priceNGN ? <p className="mt-1 text-xs text-red-400">{errors.priceNGN.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="opt-usd" className="mb-1.5 block text-xs text-[#888]">Price USD <span className="text-[#555]">(optional)</span></Label>
          <Input
            id="opt-usd"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 29.99"
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("priceUSD", { setValueAs: parseOptionalNumber })}
          />
          {errors.priceUSD ? <p className="mt-1 text-xs text-red-400">{errors.priceUSD.message}</p> : null}
        </div>
      </div>

      <div>
        <Label htmlFor="opt-label" className="mb-1.5 block text-xs text-[#888]">Display label <span className="text-[#555]">(optional — overrides duration name)</span></Label>
        <Input id="opt-label" placeholder="e.g. Project-based" className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20" {...register("label")} />
        {errors.label ? <p className="mt-1 text-xs text-red-400">{errors.label.message}</p> : null}
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-[#222] bg-[#0d0d0d] px-4 py-3">
        <Switch id="opt-default" checked={isDefault} onCheckedChange={(c) => setValue("isDefault", c, { shouldDirty: true })} />
        <div>
          <Label htmlFor="opt-default" className="text-xs text-[#888]">Set as default selection</Label>
          <p className="text-[11px] text-[#555]">This option will be pre-selected when the card loads.</p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white">Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-60">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : initialData ? "Save Changes" : "Add Option"}
        </Button>
      </div>
    </form>
  );
}
