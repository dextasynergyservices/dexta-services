"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { manifestoSchema, type ManifestoInput } from "@/lib/validators";
import { updateManifestoContent } from "../actions";

interface ManifestoFormProps {
  text: string;
}

export function ManifestoForm({ text }: ManifestoFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ManifestoInput>({
    resolver: zodResolver(manifestoSchema),
    defaultValues: { text },
  });

  const currentText = watch("text") ?? "";

  const onSubmit = async (data: ManifestoInput) => {
    const result = await updateManifestoContent(data);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-[#222] bg-[#111] p-6">
        <h2 className="mb-1 text-sm font-semibold text-white">
          Scroll-Reveal Statement
        </h2>
        <p className="mb-5 text-xs text-[#555]">
          This text reveals word-by-word as the visitor scrolls through the
          manifesto section on the homepage. Write it as a single bold
          statement — all caps is applied automatically.
        </p>

        <div className="space-y-2">
          <Label htmlFor="manifesto-text" className="text-xs text-[#888]">
            Statement text
          </Label>
          <Textarea
            id="manifesto-text"
            rows={4}
            placeholder="e.g. IF YOU'VE GOT A VISION, WE'VE GOT THE CREATIVE AUDACITY"
            className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("text")}
          />
          <div className="flex items-center justify-between">
            {errors.text ? (
              <p className="text-xs text-red-400">{errors.text.message}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-[#555]">{currentText.length} / 500</p>
          </div>
        </div>

        {/* Live preview */}
        <div className="mt-6 rounded-lg border border-[#1a1a1a] bg-[#0a0a0a] p-4">
          <p className="mb-2 text-xs text-[#555]">Preview</p>
          <p className="text-sm font-black leading-snug tracking-tight text-[#333]">
            {currentText || (
              <span className="text-[#2a2a2a]">Your statement will appear here…</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
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
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
