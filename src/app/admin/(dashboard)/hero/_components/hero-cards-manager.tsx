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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { HeroCard } from "@/lib/hero-types";
import { heroCardSchema, type HeroCardInput } from "@/lib/validators";
import { ImageUpload } from "@/components/admin/events/image-upload";
import {
  createHeroCard,
  updateHeroCard,
  deleteHeroCard,
  reorderHeroCards,
} from "../actions";

// ─── Card Form ────────────────────────────────────────────────────────────────

const OBJECT_POSITION_OPTIONS = [
  { value: "center", label: "Center" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

interface CardFormProps {
  initialData?: HeroCard;
  onSubmit: (data: HeroCardInput) => Promise<void>;
  onCancel: () => void;
}

function CardForm({ initialData, onSubmit, onCancel }: CardFormProps) {
  const initialObjectPosition =
    (initialData?.objectPosition as
      | HeroCardInput["objectPosition"]
      | undefined) ?? "center";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HeroCardInput>({
    resolver: zodResolver(heroCardSchema),
    defaultValues: {
      href: initialData?.href ?? "",
      imagePublicId: initialData?.imagePublicId ?? null,
      objectPosition: initialObjectPosition,
      label: initialData?.label ?? "",
      title: initialData?.title ?? "",
      chip: initialData?.chip ?? "",
      badge: initialData?.badge ?? "",
      metaTitle: initialData?.metaTitle ?? "",
      metaSubtitle: initialData?.metaSubtitle ?? "",
      isVisible: initialData?.isVisible ?? true,
    },
  });

  useEffect(() => {
    reset({
      href: initialData?.href ?? "",
      imagePublicId: initialData?.imagePublicId ?? null,
      objectPosition: initialObjectPosition,
      label: initialData?.label ?? "",
      title: initialData?.title ?? "",
      chip: initialData?.chip ?? "",
      badge: initialData?.badge ?? "",
      metaTitle: initialData?.metaTitle ?? "",
      metaSubtitle: initialData?.metaSubtitle ?? "",
      isVisible: initialData?.isVisible ?? true,
    });
  }, [initialData, initialObjectPosition, reset]);

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data);
      })}
      className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
    >
      {/* Image */}
      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">Card Image</Label>
        <ImageUpload
          value={watch("imagePublicId") ?? undefined}
          onChange={(id) => setValue("imagePublicId", id)}
          onRemove={() => setValue("imagePublicId", null)}
          emptyLabel="Click to upload card image"
          previewAlt={`${initialData?.title ?? "Hero card"} image preview`}
        />
        <p className="mt-1.5 text-xs text-[#555]">
          This preview shows only the image assigned to this card.
        </p>
      </div>

      {/* Object position */}
      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">
          Image position
        </Label>
        <Select
          value={watch("objectPosition")}
          onValueChange={(val) =>
            setValue("objectPosition", val as HeroCardInput["objectPosition"])
          }
        >
          <SelectTrigger className="border-[#2a2a2a] bg-[#0d0d0d] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-[#2a2a2a] bg-[#111]">
            {OBJECT_POSITION_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-white focus:bg-[#1a1a1a] focus:text-white"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Label */}
        <div>
          <Label
            htmlFor="card-label"
            className="mb-1.5 block text-xs text-[#888]"
          >
            Label
          </Label>
          <Input
            id="card-label"
            placeholder="e.g. IDENTITY"
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("label")}
          />
          {errors.label && (
            <p className="mt-1 text-xs text-red-400">{errors.label.message}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <Label
            htmlFor="card-title"
            className="mb-1.5 block text-xs text-[#888]"
          >
            Title
          </Label>
          <Input
            id="card-title"
            placeholder="e.g. DESIGN"
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("title")}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
          )}
        </div>

        {/* Badge */}
        <div>
          <Label
            htmlFor="card-badge"
            className="mb-1.5 block text-xs text-[#888]"
          >
            Badge (max 3 chars)
          </Label>
          <Input
            id="card-badge"
            placeholder="e.g. ID"
            maxLength={3}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("badge")}
          />
          {errors.badge && (
            <p className="mt-1 text-xs text-red-400">{errors.badge.message}</p>
          )}
        </div>

        {/* Chip */}
        <div>
          <Label
            htmlFor="card-chip"
            className="mb-1.5 block text-xs text-[#888]"
          >
            Chip text
          </Label>
          <Input
            id="card-chip"
            placeholder="e.g. Brand systems"
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("chip")}
          />
          {errors.chip && (
            <p className="mt-1 text-xs text-red-400">{errors.chip.message}</p>
          )}
        </div>

        {/* Meta title */}
        <div>
          <Label
            htmlFor="card-metaTitle"
            className="mb-1.5 block text-xs text-[#888]"
          >
            Meta title
          </Label>
          <Input
            id="card-metaTitle"
            placeholder="e.g. Brand identity"
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("metaTitle")}
          />
          {errors.metaTitle && (
            <p className="mt-1 text-xs text-red-400">
              {errors.metaTitle.message}
            </p>
          )}
        </div>

        {/* Meta subtitle */}
        <div>
          <Label
            htmlFor="card-metaSubtitle"
            className="mb-1.5 block text-xs text-[#888]"
          >
            Meta subtitle
          </Label>
          <Input
            id="card-metaSubtitle"
            placeholder="e.g. Identity / UI / Motion"
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("metaSubtitle")}
          />
          {errors.metaSubtitle && (
            <p className="mt-1 text-xs text-red-400">
              {errors.metaSubtitle.message}
            </p>
          )}
        </div>
      </div>

      {/* Link */}
      <div>
        <Label htmlFor="card-href" className="mb-1.5 block text-xs text-[#888]">
          Link (href)
        </Label>
        <Input
          id="card-href"
          placeholder="e.g. /projects?tab=design"
          className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
          {...register("href")}
        />
        {errors.href && (
          <p className="mt-1 text-xs text-red-400">{errors.href.message}</p>
        )}
      </div>

      {/* Visible */}
      <div className="flex items-center gap-3 rounded-lg border border-[#222] bg-[#0d0d0d] px-4 py-3">
        <Switch
          id="card-visible"
          checked={watch("isVisible")}
          onCheckedChange={(checked) => setValue("isVisible", checked)}
        />
        <Label htmlFor="card-visible" className="text-xs text-[#888]">
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
            "Add Card"
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── Hero Cards Manager ───────────────────────────────────────────────────────

interface HeroCardsManagerProps {
  cards: HeroCard[];
}

export function HeroCardsManager({
  cards: initialCards,
}: HeroCardsManagerProps) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [editingCard, setEditingCard] = useState<HeroCard | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  // Sync when server re-fetches and passes new initialCards
  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  // ── Reorder ────────────────────────────────────────────────────────────────
  const moveCard = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;

    const reordered = [...cards];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];

    setCards(reordered);
    setReordering(true);

    const result = await reorderHeroCards(reordered.map((c) => c.id));
    setReordering(false);

    if (!result.success) {
      toast.error(result.message);
      setCards(cards); // revert on failure
    }
  };

  // ── Visibility toggle ──────────────────────────────────────────────────────
  const toggleVisibility = async (card: HeroCard) => {
    const updated = cards.map((c) =>
      c.id === card.id ? { ...c, isVisible: !c.isVisible } : c,
    );
    setCards(updated); // optimistic update

    const result = await updateHeroCard(card.id, {
      href: card.href,
      imagePublicId: card.imagePublicId,
      objectPosition: card.objectPosition as HeroCardInput["objectPosition"],
      label: card.label,
      title: card.title,
      chip: card.chip,
      badge: card.badge,
      metaTitle: card.metaTitle,
      metaSubtitle: card.metaSubtitle,
      isVisible: !card.isVisible,
    });

    if (!result.success) {
      toast.error(result.message);
      setCards(cards); // revert on failure
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingId) return;
    const result = await deleteHeroCard(deletingId);
    if (result.success) {
      setCards((prev) => prev.filter((c) => c.id !== deletingId));
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setDeletingId(null);
  };

  // ── Create ─────────────────────────────────────────────────────────────────
  const handleCreate = async (data: HeroCardInput) => {
    const result = await createHeroCard(data);
    if (result.success) {
      toast.success(result.message);
      setIsAddOpen(false);
      router.refresh(); // server re-fetches, useEffect above syncs state
    } else {
      toast.error(result.message);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = async (data: HeroCardInput) => {
    if (!editingCard) return;
    const result = await updateHeroCard(editingCard.id, data);
    if (result.success) {
      setCards((prev) =>
        prev.map((c) => (c.id === editingCard.id ? { ...c, ...data } : c)),
      );
      toast.success(result.message);
      setEditingCard(null);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Card list ────────────────────────────────────────────────────── */}
      <div className="divide-y divide-[#1a1a1a] rounded-xl border border-[#222] bg-[#111]">
        {cards.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[#555]">No cards yet. Add one below.</p>
          </div>
        ) : (
          cards.map((card, index) => (
            <div
              key={card.id}
              className="flex items-center gap-3 px-5 py-4 sm:gap-4"
            >
              {/* Badge square */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1a1a1a] text-xs font-bold text-cyan-400">
                {card.badge}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {card.title}
                  </span>
                  <span className="text-xs text-[#555]">{card.label}</span>
                </div>
                <p className="truncate text-xs text-[#666]">{card.chip}</p>
              </div>

              {/* Visibility toggle */}
              <Switch
                checked={card.isVisible}
                onCheckedChange={() => toggleVisibility(card)}
                aria-label={`Toggle ${card.title} visibility`}
              />

              {/* Reorder arrows */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  disabled={index === 0 || reordering}
                  onClick={() => moveCard(index, "up")}
                  className="rounded p-0.5 text-[#555] transition-colors hover:bg-[#1a1a1a] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                  aria-label={`Move ${card.title} up`}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === cards.length - 1 || reordering}
                  onClick={() => moveCard(index, "down")}
                  className="rounded p-0.5 text-[#555] transition-colors hover:bg-[#1a1a1a] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                  aria-label={`Move ${card.title} down`}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Edit */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingCard(card)}
                className="h-8 w-8 shrink-0 p-0 text-[#666] hover:bg-[#1a1a1a] hover:text-white"
                aria-label={`Edit ${card.title}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>

              {/* Delete */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeletingId(card.id)}
                className="h-8 w-8 shrink-0 p-0 text-[#666] hover:bg-red-950/30 hover:text-red-400"
                aria-label={`Delete ${card.title}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* ── Add card button ───────────────────────────────────────────────── */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsAddOpen(true)}
        className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Add Card
      </Button>

      {/* ── Add dialog ───────────────────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen} modal={false}>
        <DialogContent
          className="border-[#222] bg-[#111] text-white sm:max-w-lg"
          onInteractOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Add Hero Card</DialogTitle>
          </DialogHeader>
          <CardForm
            onSubmit={handleCreate}
            onCancel={() => setIsAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ──────────────────────────────────────────────────── */}
      <Dialog
        open={!!editingCard}
        onOpenChange={(open) => !open && setEditingCard(null)}
        modal={false}
      >
        <DialogContent
          className="border-[#222] bg-[#111] text-white sm:max-w-lg"
          onInteractOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Edit Card</DialogTitle>
          </DialogHeader>
          {editingCard && (
            <CardForm
              initialData={editingCard}
              onSubmit={handleEdit}
              onCancel={() => setEditingCard(null)}
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
              Delete this card?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#666]">
              This card will be permanently removed from the hero section. This
              action cannot be undone.
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
