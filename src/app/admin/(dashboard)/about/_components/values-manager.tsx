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
  aboutValueItemSchema,
  type AboutValueItemInput,
} from "@/lib/validators";
import {
  createAboutValueItem,
  deleteAboutValueItem,
  reorderAboutValueItems,
  updateAboutValueItem,
  type AboutValueItemRow,
} from "../actions";
import {
  ABOUT_ICON_OPTIONS,
  CardActionButton,
  FormError,
  SectionShell,
  VisibilityPill,
} from "./about-manager-ui";

type ValueFormValues = z.input<typeof aboutValueItemSchema>;

function ValueForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: AboutValueItemRow;
  onSubmit: (data: AboutValueItemInput) => Promise<void>;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ValueFormValues, unknown, AboutValueItemInput>({
    resolver: zodResolver(aboutValueItemSchema),
    defaultValues: {
      icon: initialData?.icon ?? "SHIELD",
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      isVisible: initialData?.isVisible ?? true,
      position: initialData?.position ?? 0,
    },
  });

  useEffect(() => {
    reset({
      icon: initialData?.icon ?? "SHIELD",
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
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
            setValue("icon", value as ValueFormValues["icon"], {
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
      </div>

      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">Title</Label>
        <Input
          className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
          {...register("title")}
        />
        <FormError message={errors.title?.message} />
      </div>

      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">Description</Label>
        <Textarea
          rows={4}
          className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
          {...register("description")}
        />
        <FormError message={errors.description?.message} />
      </div>

      <label className="flex items-center justify-between rounded-xl border border-[#222] bg-[#0d0d0d] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">Visible on page</p>
          <p className="text-xs text-[#666]">
            Hide this value card without deleting it.
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
            "Save Value"
          )}
        </Button>
      </div>
    </form>
  );
}

export function ValuesManager({ items }: { items: AboutValueItemRow[] }) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AboutValueItemRow | null>(
    null,
  );
  const [deletingItem, setDeletingItem] = useState<AboutValueItemRow | null>(
    null,
  );
  const [movingKey, setMovingKey] = useState<string | null>(null);

  const handleCreate = async (data: AboutValueItemInput) => {
    const result = await createAboutValueItem(data);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setIsCreateOpen(false);
    router.refresh();
  };

  const handleUpdate = async (data: AboutValueItemInput) => {
    if (!editingItem) return;
    const result = await updateAboutValueItem(editingItem.id, data);
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
    const result = await deleteAboutValueItem(deletingItem.id);
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
    const result = await reorderAboutValueItems(id, direction);
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
        title="Values Cards"
        description="These cards hold the standards and principles section toward the end of the About page."
        action={
          <Button
            className="bg-cyan-500 text-[#03131d] hover:bg-cyan-400"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Value Card
          </Button>
        }
      >
        <div className="grid gap-4 xl:grid-cols-3">
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
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.22em] text-[#555]">
                  Position {index + 1}
                </p>
                <div className="flex items-center gap-2">
                  <CardActionButton
                    onClick={() => handleMove(item.id, "up")}
                    label="Move value card up"
                    disabled={index === 0 || movingKey === `${item.id}:up`}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </CardActionButton>
                  <CardActionButton
                    onClick={() => handleMove(item.id, "down")}
                    label="Move value card down"
                    disabled={
                      index === items.length - 1 ||
                      movingKey === `${item.id}:down`
                    }
                  >
                    <ArrowDown className="h-4 w-4" />
                  </CardActionButton>
                  <CardActionButton
                    onClick={() => setEditingItem(item)}
                    label="Edit value card"
                  >
                    <Pencil className="h-4 w-4" />
                  </CardActionButton>
                  <CardActionButton
                    onClick={() => setDeletingItem(item)}
                    label="Delete value card"
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
            <DialogTitle>Add Value Card</DialogTitle>
          </DialogHeader>
          <ValueForm
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
            <DialogTitle>Edit Value Card</DialogTitle>
          </DialogHeader>
          <ValueForm
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
              Delete value card?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#666]">
              This removes the card from the values section.
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
