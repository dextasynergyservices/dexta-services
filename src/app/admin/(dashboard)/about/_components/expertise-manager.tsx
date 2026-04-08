"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  aboutExpertiseItemSchema,
  type AboutExpertiseItemInput,
} from "@/lib/validators";
import {
  createAboutExpertiseItem,
  deleteAboutExpertiseItem,
  reorderAboutExpertiseItems,
  updateAboutExpertiseItem,
  type AboutExpertiseItemRow,
} from "../actions";
import {
  ABOUT_ICON_OPTIONS,
  CardActionButton,
  FormError,
  SectionShell,
  VisibilityPill,
} from "./about-manager-ui";

type ExpertiseFormValues = z.input<typeof aboutExpertiseItemSchema>;

function ExpertiseForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: AboutExpertiseItemRow;
  onSubmit: (data: AboutExpertiseItemInput) => Promise<void>;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpertiseFormValues, unknown, AboutExpertiseItemInput>({
    resolver: zodResolver(aboutExpertiseItemSchema),
    defaultValues: {
      icon: initialData?.icon ?? "TARGET",
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      metricLabel: initialData?.metricLabel ?? "",
      metricValue: initialData?.metricValue ?? "",
      isVisible: initialData?.isVisible ?? true,
      position: initialData?.position ?? 0,
    },
  });

  useEffect(() => {
    reset({
      icon: initialData?.icon ?? "TARGET",
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      metricLabel: initialData?.metricLabel ?? "",
      metricValue: initialData?.metricValue ?? "",
      isVisible: initialData?.isVisible ?? true,
      position: initialData?.position ?? 0,
    });
  }, [initialData, reset]);

  return (
    <form
      onSubmit={handleSubmit(async (data) => onSubmit(data))}
      className="space-y-4"
    >
      <input type="hidden" {...register("position", { valueAsNumber: true })} />

      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">Icon</Label>
        <Select
          value={watch("icon")}
          onValueChange={(value) =>
            setValue("icon", value as ExpertiseFormValues["icon"], {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger className="w-full border-[#2a2a2a] bg-[#0d0d0d] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-[#222] bg-[#111] text-white">
            {ABOUT_ICON_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormError message={errors.icon?.message} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Title</Label>
          <Input
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("title")}
          />
          <FormError message={errors.title?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">
            Metric label
          </Label>
          <Input
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("metricLabel")}
          />
          <FormError message={errors.metricLabel?.message} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">
            Description
          </Label>
          <Textarea
            rows={5}
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("description")}
          />
          <FormError message={errors.description?.message} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">
            Metric value
          </Label>
          <Input
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
            {...register("metricValue")}
          />
          <FormError message={errors.metricValue?.message} />
        </div>
      </div>

      <label className="flex items-center justify-between rounded-xl border border-[#222] bg-[#0d0d0d] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">Visible on page</p>
          <p className="text-xs text-[#666]">
            Hide this expertise card without deleting it.
          </p>
        </div>
        <Switch
          checked={watch("isVisible")}
          onCheckedChange={(checked) =>
            setValue("isVisible", checked, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      </label>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-[#2a2a2a] bg-transparent text-[#aaa] hover:bg-[#1a1a1a] hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-cyan-500 text-[#03131d] hover:bg-cyan-400"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Save Expertise"
          )}
        </Button>
      </div>
    </form>
  );
}

export function ExpertiseManager({
  items,
}: {
  items: AboutExpertiseItemRow[];
}) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AboutExpertiseItemRow | null>(
    null,
  );
  const [deletingItem, setDeletingItem] =
    useState<AboutExpertiseItemRow | null>(null);
  const [movingKey, setMovingKey] = useState<string | null>(null);

  const handleCreate = async (data: AboutExpertiseItemInput) => {
    const result = await createAboutExpertiseItem(data);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setIsCreateOpen(false);
    router.refresh();
  };

  const handleUpdate = async (data: AboutExpertiseItemInput) => {
    if (!editingItem) return;
    const result = await updateAboutExpertiseItem(editingItem.id, data);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setEditingItem(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    const result = await deleteAboutExpertiseItem(deletingItem.id);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setDeletingItem(null);
    router.refresh();
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    setMovingKey(`${id}:${direction}`);
    const result = await reorderAboutExpertiseItems(id, direction);
    setMovingKey(null);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.refresh();
  };

  return (
    <>
      <SectionShell
        title="Expertise Cards"
        description="These cards explain what Dexta brings across brand, product, and rollout."
        action={
          <Button
            className="bg-cyan-500 text-[#03131d] hover:bg-cyan-400"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Expertise Card
          </Button>
        }
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item, index) => (
            <article
              key={item.id}
              className="rounded-2xl border border-[#222] bg-[#111] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-400">
                    {item.icon.replaceAll("_", " ")}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
                <VisibilityPill visible={item.isVisible} />
              </div>
              <p className="mt-3 text-sm leading-6 text-[#9d9d9d]">
                {item.description}
              </p>
              <div className="mt-4 rounded-xl border border-[#222] bg-[#0d0d0d] px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[#555]">
                  {item.metricLabel}
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  {item.metricValue}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.22em] text-[#555]">
                  Position {index + 1}
                </p>
                <div className="flex items-center gap-2">
                  <CardActionButton
                    onClick={() => handleMove(item.id, "up")}
                    label="Move expertise card up"
                    disabled={index === 0 || movingKey === `${item.id}:up`}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </CardActionButton>
                  <CardActionButton
                    onClick={() => handleMove(item.id, "down")}
                    label="Move expertise card down"
                    disabled={
                      index === items.length - 1 ||
                      movingKey === `${item.id}:down`
                    }
                  >
                    <ArrowDown className="h-4 w-4" />
                  </CardActionButton>
                  <CardActionButton
                    onClick={() => setEditingItem(item)}
                    label="Edit expertise card"
                  >
                    <Pencil className="h-4 w-4" />
                  </CardActionButton>
                  <CardActionButton
                    onClick={() => setDeletingItem(item)}
                    label="Delete expertise card"
                  >
                    <Trash2 className="h-4 w-4" />
                  </CardActionButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-[#222] bg-[#111] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Expertise Card</DialogTitle>
          </DialogHeader>
          <ExpertiseForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
      >
        <DialogContent className="border-[#222] bg-[#111] text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Expertise Card</DialogTitle>
          </DialogHeader>
          <ExpertiseForm
            initialData={editingItem ?? undefined}
            onSubmit={handleUpdate}
            onCancel={() => setEditingItem(null)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
      >
        <AlertDialogContent className="border-[#222] bg-[#111]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete expertise card?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#666]">
              This removes the card from the About page expertise section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2a2a2a] bg-transparent text-[#aaa] hover:bg-[#1a1a1a] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-400"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
