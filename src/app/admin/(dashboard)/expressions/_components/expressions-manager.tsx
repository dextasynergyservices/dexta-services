"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/admin/events/image-upload";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { expressionSchema, type ExpressionInput } from "@/lib/validators";
import type { ExpressionRow } from "../actions";
import {
  createExpression,
  updateExpression,
  deleteExpression,
  reorderExpressions,
} from "../actions";

// ─── Expression Form ──────────────────────────────────────────────────────────

interface ExpressionFormProps {
  initialData?: ExpressionRow;
  onSubmit: (data: ExpressionInput) => Promise<void>;
  onCancel: () => void;
}

function ExpressionForm({
  initialData,
  onSubmit,
  onCancel,
}: ExpressionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpressionInput>({
    resolver: zodResolver(expressionSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      logoPublicId: initialData?.logoPublicId ?? null,
      description: initialData?.description ?? "",
      websiteUrl: initialData?.websiteUrl ?? "",
      isVisible: initialData?.isVisible ?? true,
    },
  });

  useEffect(() => {
    reset({
      name: initialData?.name ?? "",
      logoPublicId: initialData?.logoPublicId ?? null,
      description: initialData?.description ?? "",
      websiteUrl: initialData?.websiteUrl ?? "",
      isVisible: initialData?.isVisible ?? true,
    });
  }, [initialData, reset]);

  const descriptionValue = watch("description") ?? "";

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data);
      })}
      className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
    >
      {/* Logo */}
      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">Logo</Label>
        <ImageUpload
          value={watch("logoPublicId") ?? undefined}
          onChange={(id) => setValue("logoPublicId", id)}
          onRemove={() => setValue("logoPublicId", null)}
          emptyLabel="Click to upload logo"
          previewAlt={`${initialData?.name ?? "Expression"} logo`}
        />
      </div>

      {/* Name */}
      <div>
        <Label htmlFor="expr-name" className="mb-1.5 block text-xs text-[#888]">
          Name
        </Label>
        <Input
          id="expr-name"
          placeholder="e.g. Dexta Store"
          className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label
          htmlFor="expr-description"
          className="mb-1.5 block text-xs text-[#888]"
        >
          Description
        </Label>
        <Textarea
          id="expr-description"
          rows={4}
          placeholder="Describe what was built or designed — outcome-focused, punchy."
          className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
          {...register("description")}
        />
        <div className="mt-1 flex items-center justify-between">
          {errors.description ? (
            <p className="text-xs text-red-400">{errors.description.message}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-[#555]">{descriptionValue.length} / 1000</p>
        </div>
      </div>

      {/* Website URL */}
      <div>
        <Label
          htmlFor="expr-url"
          className="mb-1.5 block text-xs text-[#888]"
        >
          Website URL
        </Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555]" />
          <Input
            id="expr-url"
            placeholder="https://example.com"
            className="border-[#2a2a2a] bg-[#0d0d0d] pl-8 text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("websiteUrl")}
          />
        </div>
        {errors.websiteUrl && (
          <p className="mt-1 text-xs text-red-400">
            {errors.websiteUrl.message}
          </p>
        )}
      </div>

      {/* Visibility */}
      <div className="flex items-center gap-3 rounded-lg border border-[#222] bg-[#0d0d0d] px-4 py-3">
        <Switch
          id="expr-visible"
          checked={watch("isVisible")}
          onCheckedChange={(checked) => setValue("isVisible", checked)}
        />
        <Label htmlFor="expr-visible" className="text-xs text-[#888]">
          Visible on homepage
        </Label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
          ) : initialData ? (
            "Save Changes"
          ) : (
            "Add Expression"
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── Expressions Manager ──────────────────────────────────────────────────────

interface ExpressionsManagerProps {
  expressions: ExpressionRow[];
}

export function ExpressionsManager({
  expressions: initialExpressions,
}: ExpressionsManagerProps) {
  const router = useRouter();
  const [expressions, setExpressions] = useState(initialExpressions);
  const [editingItem, setEditingItem] = useState<ExpressionRow | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    setExpressions(initialExpressions);
  }, [initialExpressions]);

  // ── Reorder ──────────────────────────────────────────────────────────────────
  const moveItem = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= expressions.length) return;

    const reordered = [...expressions];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];

    setExpressions(reordered);
    setReordering(true);

    const result = await reorderExpressions(reordered.map((e) => e.id));
    setReordering(false);

    if (!result.success) {
      toast.error(result.message);
      setExpressions(expressions);
    }
  };

  // ── Visibility toggle ─────────────────────────────────────────────────────
  const toggleVisibility = async (item: ExpressionRow) => {
    const updated = expressions.map((e) =>
      e.id === item.id ? { ...e, isVisible: !e.isVisible } : e,
    );
    setExpressions(updated);

    const result = await updateExpression(item.id, {
      name: item.name,
      logoPublicId: item.logoPublicId,
      description: item.description,
      websiteUrl: item.websiteUrl,
      isVisible: !item.isVisible,
    });

    if (!result.success) {
      toast.error(result.message);
      setExpressions(expressions);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingId) return;
    const result = await deleteExpression(deletingId);
    if (result.success) {
      setExpressions((prev) => prev.filter((e) => e.id !== deletingId));
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setDeletingId(null);
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (data: ExpressionInput) => {
    const result = await createExpression(data);
    if (result.success) {
      toast.success(result.message);
      setIsAddOpen(false);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = async (data: ExpressionInput) => {
    if (!editingItem) return;
    const result = await updateExpression(editingItem.id, data);
    if (result.success) {
      setExpressions((prev) =>
        prev.map((e) => (e.id === editingItem.id ? { ...e, ...data } : e)),
      );
      toast.success(result.message);
      setEditingItem(null);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── List ─────────────────────────────────────────────────────────── */}
      <div className="divide-y divide-[#1a1a1a] rounded-xl border border-[#222] bg-[#111]">
        {expressions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[#555]">
              No expressions yet. Add one below.
            </p>
          </div>
        ) : (
          expressions.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-5 py-4 sm:gap-4"
            >
              {/* Logo thumbnail */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#0d0d0d]">
                {item.logoPublicId ? (
                  <img
                    src={getCloudinaryUrl(item.logoPublicId, {
                      w: 80,
                      h: 80,
                      c: "fit",
                      f: "auto",
                      q: "auto",
                    })}
                    alt={`${item.name} logo`}
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <Globe className="h-4 w-4 text-[#444]" />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {item.name}
                </p>
                <p className="truncate text-xs text-[#555]">{item.websiteUrl}</p>
              </div>

              {/* Visibility indicator */}
              {item.isVisible ? (
                <Eye className="h-3.5 w-3.5 shrink-0 text-cyan-500/60" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 shrink-0 text-[#444]" />
              )}

              {/* Visibility toggle */}
              <Switch
                checked={item.isVisible}
                onCheckedChange={() => toggleVisibility(item)}
                aria-label={`Toggle ${item.name} visibility`}
              />

              {/* Reorder arrows */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  disabled={index === 0 || reordering}
                  onClick={() => moveItem(index, "up")}
                  className="rounded p-0.5 text-[#555] transition-colors hover:bg-[#1a1a1a] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                  aria-label={`Move ${item.name} up`}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === expressions.length - 1 || reordering}
                  onClick={() => moveItem(index, "down")}
                  className="rounded p-0.5 text-[#555] transition-colors hover:bg-[#1a1a1a] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                  aria-label={`Move ${item.name} down`}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Edit */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingItem(item)}
                className="h-8 w-8 shrink-0 p-0 text-[#666] hover:bg-[#1a1a1a] hover:text-white"
                aria-label={`Edit ${item.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>

              {/* Delete */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeletingId(item.id)}
                className="h-8 w-8 shrink-0 p-0 text-[#666] hover:bg-red-950/30 hover:text-red-400"
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* ── Add button ───────────────────────────────────────────────────── */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsAddOpen(true)}
        className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Add Expression
      </Button>

      {/* ── Add dialog ───────────────────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen} modal={false}>
        <DialogContent
          className="border-[#222] bg-[#111] text-white sm:max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Add Expression</DialogTitle>
          </DialogHeader>
          <ExpressionForm
            onSubmit={handleCreate}
            onCancel={() => setIsAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ──────────────────────────────────────────────────── */}
      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        modal={false}
      >
        <DialogContent
          className="border-[#222] bg-[#111] text-white sm:max-w-lg"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Edit Expression</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <ExpressionForm
              initialData={editingItem}
              onSubmit={handleEdit}
              onCancel={() => setEditingItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ───────────────────────────────────────────── */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent className="border-[#222] bg-[#111]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete this expression?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#666]">
              This expression will be permanently removed from the homepage.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2a2a2a] bg-transparent text-[#888] hover:bg-[#1a1a1a] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
