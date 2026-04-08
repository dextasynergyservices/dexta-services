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
import { Textarea } from "@/components/ui/textarea";
import { audienceSchema, type AudienceInput } from "@/lib/validators";
import type { AudienceRow } from "../actions";

type FormValues = z.input<typeof audienceSchema>;

interface Props {
  audience: AudienceRow;
  onSubmit: (data: AudienceInput) => Promise<void>;
  onCancel: () => void;
}

function toFormValues(audience: AudienceRow): FormValues {
  return {
    type: audience.type,
    tabLabel: audience.tabLabel,
    emptyTitle: audience.emptyTitle,
    emptyBody: audience.emptyBody,
    color: audience.color,
    isVisible: audience.isVisible,
  };
}

export function AudienceSettingsForm({ audience, onSubmit, onCancel }: Props) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues, unknown, AudienceInput>({
    resolver: zodResolver(audienceSchema),
    defaultValues: toFormValues(audience),
  });

  useEffect(() => { reset(toFormValues(audience)); }, [audience, reset]);

  const visible = watch("isVisible");
  const color = watch("color");

  return (
    <form onSubmit={handleSubmit(async (data) => { await onSubmit(data); })} className="space-y-5">
      <input type="hidden" {...register("type")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="aud-tab-label" className="mb-1.5 block text-xs text-[#888]">Tab label</Label>
          <Input id="aud-tab-label" className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20" {...register("tabLabel")} />
          {errors.tabLabel ? <p className="mt-1 text-xs text-red-400">{errors.tabLabel.message}</p> : null}
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Accent color</Label>
          <Select value={color} onValueChange={(v) => setValue("color", v as AudienceInput["color"], { shouldDirty: true, shouldValidate: true })}>
            <SelectTrigger className="h-10 w-full border-[#2a2a2a] bg-[#0d0d0d] text-white">
              <SelectValue placeholder="Choose a color" />
            </SelectTrigger>
            <SelectContent className="border-[#222] bg-[#111] text-white">
              <SelectItem value="blue">Blue</SelectItem>
              <SelectItem value="cyan">Cyan</SelectItem>
              <SelectItem value="purple">Purple</SelectItem>
              <SelectItem value="green">Green</SelectItem>
            </SelectContent>
          </Select>
          {errors.color ? <p className="mt-1 text-xs text-red-400">{errors.color.message}</p> : null}
        </div>
      </div>

      <div>
        <Label htmlFor="aud-empty-title" className="mb-1.5 block text-xs text-[#888]">Empty-state title</Label>
        <Input id="aud-empty-title" placeholder="e.g. School offers are being refreshed." className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20" {...register("emptyTitle")} />
        {errors.emptyTitle ? <p className="mt-1 text-xs text-red-400">{errors.emptyTitle.message}</p> : null}
      </div>

      <div>
        <Label htmlFor="aud-empty-body" className="mb-1.5 block text-xs text-[#888]">Empty-state body</Label>
        <Textarea id="aud-empty-body" rows={3} placeholder="Support text when this audience has no visible groups." className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20" {...register("emptyBody")} />
        {errors.emptyBody ? <p className="mt-1 text-xs text-red-400">{errors.emptyBody.message}</p> : null}
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-[#222] bg-[#0d0d0d] px-4 py-3">
        <Switch id="aud-visible" checked={visible} onCheckedChange={(checked) => setValue("isVisible", checked, { shouldDirty: true })} />
        <Label htmlFor="aud-visible" className="text-xs text-[#888]">Visible on /offers</Label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white">Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-60">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save"}
        </Button>
      </div>
    </form>
  );
}
