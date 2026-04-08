"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { offerGroupSchema, type OfferGroupInput } from "@/lib/validators";
import type { OfferGroupRow } from "../actions";

type FormValues = z.input<typeof offerGroupSchema>;

interface Props {
  initialData?: OfferGroupRow;
  onSubmit: (data: OfferGroupInput) => Promise<void>;
  onCancel: () => void;
}

function toFormValues(data?: OfferGroupRow): FormValues {
  return {
    name: data?.name ?? "",
    description: data?.description ?? "",
    isVisible: data?.isVisible ?? true,
  };
}

export function OfferGroupForm({ initialData, onSubmit, onCancel }: Props) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues, unknown, OfferGroupInput>({
    resolver: zodResolver(offerGroupSchema),
    defaultValues: toFormValues(initialData),
  });

  useEffect(() => { reset(toFormValues(initialData)); }, [initialData, reset]);

  const visible = watch("isVisible");

  return (
    <form onSubmit={handleSubmit(async (data) => { await onSubmit(data); })} className="space-y-5">
      <div>
        <Label htmlFor="group-name" className="mb-1.5 block text-xs text-[#888]">Group name</Label>
        <Input id="group-name" placeholder="e.g. Communication Reach" className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20" {...register("name")} />
        {errors.name ? <p className="mt-1 text-xs text-red-400">{errors.name.message}</p> : null}
      </div>

      <div>
        <Label htmlFor="group-description" className="mb-1.5 block text-xs text-[#888]">Description <span className="text-[#555]">(optional)</span></Label>
        <Textarea id="group-description" rows={3} placeholder="Brief description shown under the group heading." className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20" {...register("description")} />
        {errors.description ? <p className="mt-1 text-xs text-red-400">{errors.description.message}</p> : null}
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-[#222] bg-[#0d0d0d] px-4 py-3">
        <Switch id="group-visible" checked={visible} onCheckedChange={(checked) => setValue("isVisible", checked, { shouldDirty: true })} />
        <Label htmlFor="group-visible" className="text-xs text-[#888]">Visible on /offers</Label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white">Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-60">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : initialData ? "Save Changes" : "Create Group"}
        </Button>
      </div>
    </form>
  );
}
