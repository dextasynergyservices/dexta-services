"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Film,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/events/image-upload";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import {
  aboutSpaceItemSchema,
  type AboutSpaceItemInput,
} from "@/lib/validators";
import {
  createAboutSpaceItem,
  deleteAboutSpaceItem,
  reorderAboutSpaceItems,
  updateAboutSpaceItem,
  type AboutSpaceItemRow,
} from "../actions";
import {
  CardActionButton,
  FormError,
  SectionShell,
  VisibilityPill,
} from "./about-manager-ui";

const SPACE_PREVIEW_FALLBACK = "/images/about.png";
const SPACE_PAGE_SIZE = 5;

type SpaceFormValues = z.input<typeof aboutSpaceItemSchema>;

function resolvePreviewSrc(
  value: string | null | undefined,
  options?: Record<string, string | number>,
) {
  if (!value) {
    return SPACE_PREVIEW_FALLBACK;
  }

  if (/^https?:\/\//i.test(value) || value.startsWith("/")) {
    return value;
  }

  return getCloudinaryUrl(
    value,
    options ?? {
      c: "fill",
      f: "auto",
      g: "auto",
      h: 700,
      q: "auto",
      w: 1000,
    },
  );
}

function getSpaceCardPreview(item: AboutSpaceItemRow) {
  return item.mediaType === "VIDEO"
    ? resolvePreviewSrc(item.thumbnailPublicId)
    : resolvePreviewSrc(item.mediaPublicId);
}

function getEditorMediaPreview(
  mediaType: AboutSpaceItemInput["mediaType"],
  mediaPublicId: string | null | undefined,
  thumbnailPublicId: string | null | undefined,
) {
  if (mediaType === "VIDEO") {
    return resolvePreviewSrc(thumbnailPublicId);
  }

  return resolvePreviewSrc(mediaPublicId, {
    c: "limit",
    f: "auto",
    h: 1200,
    q: "auto",
    w: 1800,
  });
}

function getVideoSrc(publicId: string | null | undefined) {
  if (!publicId) {
    return null;
  }

  if (/^https?:\/\//i.test(publicId) || publicId.startsWith("/")) {
    return publicId;
  }

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto/${publicId}`;
}

function SpaceForm({
  initialData,
  onSubmit,
  onCancel,
  showMediaPanel = false,
}: {
  initialData?: AboutSpaceItemRow;
  onSubmit: (data: AboutSpaceItemInput) => Promise<void>;
  onCancel: () => void;
  showMediaPanel?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SpaceFormValues, unknown, AboutSpaceItemInput>({
    resolver: zodResolver(aboutSpaceItemSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      mediaType: initialData?.mediaType ?? "IMAGE",
      mediaPublicId: initialData?.mediaPublicId ?? null,
      thumbnailPublicId: initialData?.thumbnailPublicId ?? null,
      isVisible: initialData?.isVisible ?? true,
      position: initialData?.position ?? 0,
    },
  });

  useEffect(() => {
    reset({
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      mediaType: initialData?.mediaType ?? "IMAGE",
      mediaPublicId: initialData?.mediaPublicId ?? null,
      thumbnailPublicId: initialData?.thumbnailPublicId ?? null,
      isVisible: initialData?.isVisible ?? true,
      position: initialData?.position ?? 0,
    });
  }, [initialData, reset]);

  const mediaType = watch("mediaType");
  const mediaPublicId = watch("mediaPublicId");
  const thumbnailPublicId = watch("thumbnailPublicId");
  const previewTitle = watch("title") || initialData?.title || "Space preview";
  const previewDescription =
    watch("description") || initialData?.description || "";
  const editorPreviewSrc = getEditorMediaPreview(
    mediaType,
    mediaPublicId,
    thumbnailPublicId,
  );
  const editorVideoSrc =
    mediaType === "VIDEO" ? getVideoSrc(mediaPublicId) : null;

  return (
    <form onSubmit={handleSubmit(async (data) => onSubmit(data))}>
      <input type="hidden" {...register("position", { valueAsNumber: true })} />

      <div
        className={
          showMediaPanel
            ? "grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
            : "space-y-4"
        }
      >
        {showMediaPanel ? (
          <div className="space-y-4 rounded-2xl border border-[#222] bg-[#0d0d0d] p-4">
            <div className="overflow-hidden rounded-xl border border-[#222] bg-black">
              {mediaType === "VIDEO" && editorVideoSrc ? (
                <video
                  src={editorVideoSrc}
                  controls
                  playsInline
                  className="max-h-[26rem] w-full bg-black object-contain"
                  poster={editorPreviewSrc}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={editorPreviewSrc}
                  alt={previewTitle}
                  className="max-h-[26rem] w-full object-contain"
                />
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-400">
                  {mediaType === "VIDEO" ? "Video" : "Image"}
                </span>
                <VisibilityPill visible={watch("isVisible")} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {previewTitle}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#8d8d8d]">
                  {previewDescription ||
                    "Add a short description for this space."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="max-h-[78vh] space-y-4 overflow-y-auto pr-1">
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Space title
            </Label>
            <Input
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("title")}
            />
            <FormError message={errors.title?.message} />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Short description
            </Label>
            <Textarea
              rows={4}
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
              {...register("description")}
            />
            <FormError message={errors.description?.message} />
          </div>

          <div>
            <Label className="mb-2 block text-xs text-[#888]">Media type</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["IMAGE", "VIDEO"] as const).map((type) => {
                const active = mediaType === type;
                const Icon = type === "IMAGE" ? ImageIcon : Film;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setValue("mediaType", type, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });

                      if (type === "IMAGE") {
                        setValue("thumbnailPublicId", null, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                      active
                        ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                        : "border-[#2a2a2a] bg-[#0d0d0d] text-[#888] hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {type === "IMAGE" ? "Image" : "Video"}
                  </button>
                );
              })}
            </div>
          </div>

          {mediaType === "IMAGE" ? (
            <div>
              <Label className="mb-1.5 block text-xs text-[#888]">
                Image preview
              </Label>
              <ImageUpload
                value={mediaPublicId ?? undefined}
                onChange={(value) =>
                  setValue("mediaPublicId", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                onRemove={() =>
                  setValue("mediaPublicId", null, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                emptyLabel="Upload office image"
                previewAlt={previewTitle || "About space image"}
                fallbackSrc={SPACE_PREVIEW_FALLBACK}
              />
              <p className="mt-2 text-xs text-[#555]">
                Optional for draft items. If left empty, the public page uses
                the shared About fallback image until you upload one.
              </p>
              <FormError message={errors.mediaPublicId?.message} />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-xs text-[#888]">
                  Video
                </Label>
                <CldUploadWidget
                  config={{
                    cloud: {
                      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
                    },
                  }}
                  signatureEndpoint="/api/cloudinary/sign"
                  options={{
                    maxFiles: 1,
                    multiple: false,
                    resourceType: "video",
                    sources: ["local", "url"],
                    singleUploadAutoClose: true,
                  }}
                  onSuccess={(result) => {
                    if (
                      typeof result.info === "object" &&
                      result.info !== null &&
                      "public_id" in result.info
                    ) {
                      setValue(
                        "mediaPublicId",
                        result.info.public_id as string,
                        {
                          shouldDirty: true,
                          shouldValidate: true,
                        },
                      );
                      toast.success("Video uploaded successfully");
                    }
                  }}
                  onError={() => toast.error("Video upload failed")}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => open()}
                      className={`flex h-20 w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-sm transition-colors ${
                        mediaPublicId
                          ? "border-cyan-500/30 bg-cyan-500/5 text-cyan-400"
                          : "border-[#333] bg-[#0d0d0d] text-[#666] hover:border-cyan-500/30 hover:text-[#888]"
                      }`}
                    >
                      {mediaPublicId ? (
                        <>
                          <span className="max-w-[90%] truncate text-xs font-mono">
                            {mediaPublicId}
                          </span>
                          <span className="text-xs text-[#555]">
                            Click to replace
                          </span>
                        </>
                      ) : (
                        <span>Click to upload video</span>
                      )}
                    </button>
                  )}
                </CldUploadWidget>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <FormError message={errors.mediaPublicId?.message} />
                  {mediaPublicId ? (
                    <button
                      type="button"
                      onClick={() =>
                        setValue("mediaPublicId", null, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      className="text-xs text-[#888] transition-colors hover:text-white"
                    >
                      Remove video
                    </button>
                  ) : null}
                </div>
              </div>

              <div>
                <Label className="mb-1.5 block text-xs text-[#888]">
                  Thumbnail image
                </Label>
                <ImageUpload
                  value={thumbnailPublicId ?? undefined}
                  onChange={(value) =>
                    setValue("thumbnailPublicId", value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  onRemove={() =>
                    setValue("thumbnailPublicId", null, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  emptyLabel="Upload video thumbnail"
                  previewAlt={`${previewTitle || "Space"} thumbnail`}
                  fallbackSrc={SPACE_PREVIEW_FALLBACK}
                />
                <FormError message={errors.thumbnailPublicId?.message} />
              </div>
            </div>
          )}

          <label className="flex items-center justify-between rounded-xl border border-[#222] bg-[#0d0d0d] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Visible on page</p>
              <p className="text-xs text-[#666]">
                Hide this space card without deleting it.
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
                "Save Space"
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

export function SpaceManager({ items }: { items: AboutSpaceItemRow[] }) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AboutSpaceItemRow | null>(
    null,
  );
  const [deletingItem, setDeletingItem] = useState<AboutSpaceItemRow | null>(
    null,
  );
  const [movingKey, setMovingKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / SPACE_PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pageStart = (currentPageSafe - 1) * SPACE_PAGE_SIZE;
  const paginatedItems = items.slice(pageStart, pageStart + SPACE_PAGE_SIZE);
  const paginationLabel =
    items.length === 0
      ? "No space cards yet"
      : `Showing ${pageStart + 1}-${Math.min(pageStart + SPACE_PAGE_SIZE, items.length)} of ${items.length} space cards`;

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const handleCreate = async (data: AboutSpaceItemInput) => {
    const result = await createAboutSpaceItem(data);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setIsCreateOpen(false);
    router.refresh();
  };

  const handleUpdate = async (data: AboutSpaceItemInput) => {
    if (!editingItem) return;
    const result = await updateAboutSpaceItem(editingItem.id, data);
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
    const result = await deleteAboutSpaceItem(deletingItem.id);
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
    const result = await reorderAboutSpaceItems(id, direction);
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
        title="Our Space Cards"
        description="Manage the rooms and environments that appear in the About page studio tour section."
        action={
          <Button
            className="bg-cyan-500 text-[#03131d] hover:bg-cyan-400"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Space Card
          </Button>
        }
      >
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#111] p-8 text-center">
            <p className="text-base font-medium text-white">
              No space cards yet
            </p>
            <p className="mt-2 text-sm text-[#666]">
              Add the first office space card to start managing this section.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-[#222] bg-[#111]">
              <div className="grid grid-cols-[92px_minmax(0,1.2fr)_120px_110px_190px] gap-4 border-b border-[#222] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#666]">
                <p>Preview</p>
                <p>Space</p>
                <p>Media</p>
                <p>Status</p>
                <p className="text-right">Actions</p>
              </div>

              <div className="divide-y divide-[#222]">
                {paginatedItems.map((item) => {
                  const absoluteIndex = items.findIndex(
                    (entry) => entry.id === item.id,
                  );

                  return (
                    <article
                      key={item.id}
                      className="grid grid-cols-[92px_minmax(0,1.2fr)_120px_110px_190px] gap-4 px-4 py-4"
                    >
                      <div className="relative h-16 overflow-hidden rounded-xl border border-[#222] bg-[#0d0d0d]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getSpaceCardPreview(item)}
                          alt={item.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-white">
                              {item.title}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#8d8d8d]">
                              {item.description}
                            </p>
                          </div>
                          <p className="shrink-0 text-xs uppercase tracking-[0.22em] text-[#555]">
                            #{absoluteIndex + 1}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <span className="rounded-full border border-white/15 bg-[#0d0d0d] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">
                          {item.mediaType}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <VisibilityPill visible={item.isVisible} />
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <CardActionButton
                          onClick={() => handleMove(item.id, "up")}
                          label="Move space card up"
                          disabled={
                            absoluteIndex === 0 || movingKey === `${item.id}:up`
                          }
                        >
                          <ArrowUp className="h-4 w-4" />
                        </CardActionButton>
                        <CardActionButton
                          onClick={() => handleMove(item.id, "down")}
                          label="Move space card down"
                          disabled={
                            absoluteIndex === items.length - 1 ||
                            movingKey === `${item.id}:down`
                          }
                        >
                          <ArrowDown className="h-4 w-4" />
                        </CardActionButton>
                        <CardActionButton
                          onClick={() => setEditingItem(item)}
                          label="Edit space card"
                        >
                          <Pencil className="h-4 w-4" />
                        </CardActionButton>
                        <CardActionButton
                          onClick={() => setDeletingItem(item)}
                          label="Delete space card"
                        >
                          <Trash2 className="h-4 w-4" />
                        </CardActionButton>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {items.length > SPACE_PAGE_SIZE ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-[#222] bg-[#111] p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#8d8d8d]">{paginationLabel}</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPageSafe <= 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className="border-[#2a2a2a] bg-transparent text-white disabled:opacity-50"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPageSafe >= totalPages}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    className="border-[#2a2a2a] bg-transparent text-white disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#8d8d8d]">{paginationLabel}</p>
            )}
          </div>
        )}
      </SectionShell>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen} modal={false}>
        <DialogContent
          className="border-[#222] bg-[#111] text-white sm:max-w-3xl"
          onInteractOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Add Space Card</DialogTitle>
          </DialogHeader>
          <SpaceForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        modal={false}
      >
        <DialogContent
          className="border-[#222] bg-[#111] text-white sm:max-w-6xl"
          onInteractOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Edit Space Card</DialogTitle>
          </DialogHeader>
          <SpaceForm
            initialData={editingItem ?? undefined}
            onSubmit={handleUpdate}
            onCancel={() => setEditingItem(null)}
            showMediaPanel
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
              Delete space card?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#666]">
              This removes the selected office space from the public About page.
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

export default SpaceManager;
