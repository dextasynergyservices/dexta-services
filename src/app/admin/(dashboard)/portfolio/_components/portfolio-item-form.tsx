"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  ChevronUp,
  Film,
  Image as ImageIcon,
  Loader2,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/events/image-upload";
import {
  portfolioItemSchema,
  type PortfolioAssetInput,
  type PortfolioItemInput,
} from "@/lib/validators";
import type { PortfolioItemRow, ServiceType } from "../actions";

type PortfolioItemFormValues = z.input<typeof portfolioItemSchema>;

interface PortfolioItemFormProps {
  initialData?: PortfolioItemRow;
  defaultServiceType: ServiceType;
  onSubmit: (data: PortfolioItemInput) => Promise<void>;
  onCancel: () => void;
}

const PRIMARY_COVER_SELECTION = "__PRIMARY__";

function getInitialGalleryAssets(initialData?: PortfolioItemRow): PortfolioAssetInput[] {
  if (!initialData?.assets?.length) {
    return [];
  }

  const [firstAsset, ...restAssets] = initialData.assets;
  const coverMatchesFirstAsset =
    firstAsset.publicId === initialData.mediaPublicId &&
    firstAsset.mediaType === initialData.mediaType &&
    (firstAsset.thumbnailPublicId ?? null) === (initialData.thumbnailPublicId ?? null);

  const sourceAssets = coverMatchesFirstAsset ? restAssets : initialData.assets;

  return sourceAssets.map((asset, index) => ({
    publicId: asset.publicId,
    mediaType: asset.mediaType,
    thumbnailPublicId: asset.thumbnailPublicId ?? null,
    caption: asset.caption ?? null,
    position: index + 1,
  }));
}

function getInitialCoverAssetSelection(initialData?: PortfolioItemRow): string | null {
  if (!initialData?.assets?.length || !initialData.coverAssetId) {
    return null;
  }

  const matchedIndex = initialData.assets.findIndex(
    (asset) => asset.id === initialData.coverAssetId,
  );

  if (matchedIndex <= 0) {
    return PRIMARY_COVER_SELECTION;
  }

  return `gallery:${matchedIndex - 1}`;
}

export function PortfolioItemForm({
  initialData,
  defaultServiceType,
  onSubmit,
  onCancel,
}: PortfolioItemFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PortfolioItemFormValues, unknown, PortfolioItemInput>({
    resolver: zodResolver(portfolioItemSchema),
    defaultValues: {
      serviceType: initialData?.serviceType ?? defaultServiceType,
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      tags: initialData?.tags ?? "[]",
      websiteUrl: initialData?.websiteUrl ?? "",
      mediaPublicId: initialData?.mediaPublicId ?? "",
      mediaType: initialData?.mediaType ?? "IMAGE",
      thumbnailPublicId: initialData?.thumbnailPublicId ?? null,
      coverAssetId: getInitialCoverAssetSelection(initialData),
      assets: getInitialGalleryAssets(initialData),
      isFeatured: initialData?.isFeatured ?? false,
      isVisible: initialData?.isVisible ?? true,
    },
  });

  useEffect(() => {
    reset({
      serviceType: initialData?.serviceType ?? defaultServiceType,
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      tags: initialData?.tags ?? "[]",
      websiteUrl: initialData?.websiteUrl ?? "",
      mediaPublicId: initialData?.mediaPublicId ?? "",
      mediaType: initialData?.mediaType ?? "IMAGE",
      thumbnailPublicId: initialData?.thumbnailPublicId ?? null,
      coverAssetId: getInitialCoverAssetSelection(initialData),
      assets: getInitialGalleryAssets(initialData),
      isFeatured: initialData?.isFeatured ?? false,
      isVisible: initialData?.isVisible ?? true,
    });
  }, [initialData, defaultServiceType, reset]);

  // ── Tag input state ─────────────────────────────────────────────────────────
  const [tagInput, setTagInput] = useState("");
  const [galleryAssets, setGalleryAssets] = useState<PortfolioAssetInput[]>(
    () => getInitialGalleryAssets(initialData),
  );
  const tagsJson = watch("tags") ?? "[]";
  const tags: string[] = (() => {
    try { return JSON.parse(tagsJson); } catch { return []; }
  })();

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= 8) return;
    setValue("tags", JSON.stringify([...tags, trimmed]));
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setValue("tags", JSON.stringify(tags.filter((t) => t !== tag)));
  };

  const mediaType = watch("mediaType");
  const serviceType = watch("serviceType");
  const mediaPublicId = watch("mediaPublicId");
  const thumbnailPublicId = watch("thumbnailPublicId");
  const coverAssetId = watch("coverAssetId");
  const descriptionValue = watch("description") ?? "";

  useEffect(() => {
    const nextAssets = getInitialGalleryAssets(initialData);
    setGalleryAssets(nextAssets);
    setValue("assets", nextAssets, {
      shouldDirty: false,
      shouldValidate: false,
    });
    setValue("coverAssetId", getInitialCoverAssetSelection(initialData), {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [initialData, setValue]);

  const syncGalleryAssets = (
    updater:
      | PortfolioAssetInput[]
      | ((current: PortfolioAssetInput[]) => PortfolioAssetInput[]),
  ) => {
    const nextAssets =
      typeof updater === "function" ? updater(galleryAssets) : updater;
    const normalizedAssets = nextAssets.map((asset, index) => ({
      ...asset,
      position: index + 1,
    }));
    setGalleryAssets(normalizedAssets);
    setValue("assets", normalizedAssets, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const featurePreviewOptions = [
    ...(mediaPublicId
      ? [
          {
            value: PRIMARY_COVER_SELECTION,
            label: "Primary media",
            description: mediaType === "VIDEO" ? "Main video" : "Main image",
          },
        ]
      : []),
    ...galleryAssets
      .map((asset, index) =>
        asset.publicId.trim().length > 0
          ? {
              value: `gallery:${index}`,
              label: `Gallery item ${index + 1}`,
              description: asset.mediaType === "VIDEO" ? "Video asset" : "Image asset",
            }
          : null,
      )
      .filter((option): option is {
        value: string;
        label: string;
        description: string;
      } => option !== null),
  ];

  useEffect(() => {
    if (featurePreviewOptions.length <= 1) {
      if (coverAssetId !== null) {
        setValue("coverAssetId", null, {
          shouldDirty: false,
          shouldValidate: true,
        });
      }
      return;
    }

    const selectionIsValid = featurePreviewOptions.some(
      (option) => option.value === coverAssetId,
    );

    if (!selectionIsValid) {
      setValue("coverAssetId", PRIMARY_COVER_SELECTION, {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  }, [coverAssetId, featurePreviewOptions, setValue]);

  return (
    <form
      onSubmit={handleSubmit(async (data) => { await onSubmit(data); })}
      className="max-h-[75vh] space-y-5 overflow-y-auto pr-1"
    >
      {/* Service type */}
      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">Service tab</Label>
        <Select
          value={watch("serviceType")}
          onValueChange={(v) => setValue("serviceType", v as ServiceType)}
        >
          <SelectTrigger className="border-[#2a2a2a] bg-[#0d0d0d] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-[#2a2a2a] bg-[#111]">
            {(["DESIGN", "BUILD", "PRINT"] as ServiceType[]).map((t) => (
              <SelectItem key={t} value={t} className="text-white focus:bg-[#1a1a1a]">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Media type toggle */}
      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">Media type</Label>
        <div className="flex gap-2">
          {(["IMAGE", "VIDEO"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue("mediaType", t)}
              className={`flex-1 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${
                mediaType === t
                  ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                  : "border-[#2a2a2a] bg-[#0d0d0d] text-[#666] hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Media upload */}
      {mediaType === "IMAGE" ? (
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Image</Label>
          <ImageUpload
            value={mediaPublicId || undefined}
            onChange={(id) => setValue("mediaPublicId", id)}
            onRemove={() => setValue("mediaPublicId", "")}
            emptyLabel="Click to upload image"
            previewAlt={watch("title") || "Portfolio image"}
          />
          {errors.mediaPublicId && (
            <p className="mt-1 text-xs text-red-400">{errors.mediaPublicId.message}</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Video upload */}
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">Video</Label>
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
                if (typeof result.info === "object" && result.info !== null && "public_id" in result.info) {
                  setValue("mediaPublicId", result.info.public_id as string);
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
                      <span className="text-xs font-mono truncate max-w-[90%]">{mediaPublicId}</span>
                      <span className="text-xs text-[#555]">Click to replace</span>
                    </>
                  ) : (
                    <span>Click to upload video</span>
                  )}
                </button>
              )}
            </CldUploadWidget>
            {errors.mediaPublicId && (
              <p className="mt-1 text-xs text-red-400">{errors.mediaPublicId.message}</p>
            )}
          </div>

          {/* Thumbnail for video */}
          <div>
            <Label className="mb-1.5 block text-xs text-[#888]">
              Thumbnail image{" "}
              <span className="text-[#555]">(used as poster frame)</span>
            </Label>
            <ImageUpload
              value={thumbnailPublicId ?? undefined}
              onChange={(id) => setValue("thumbnailPublicId", id)}
              onRemove={() => setValue("thumbnailPublicId", null)}
              emptyLabel="Click to upload thumbnail"
              previewAlt="Video thumbnail"
            />
            {errors.thumbnailPublicId ? (
              <p className="mt-1 text-xs text-red-400">
                {errors.thumbnailPublicId.message}
              </p>
            ) : (
              <p className="mt-1 text-xs text-[#555]">
                Every video needs a thumbnail so the project viewer has a proper preview frame.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-[#222] bg-[#0d0d0d] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label className="block text-xs text-[#888]">Project gallery</Label>
            <p className="mt-1 text-xs text-[#555]">
              Add extra images and videos for this project. The main media above is always included in the project gallery.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                syncGalleryAssets((current) => [
                  ...current,
                  {
                    publicId: "",
                    mediaType: "IMAGE",
                    thumbnailPublicId: null,
                    caption: null,
                    position: current.length + 1,
                  },
                ])
              }
              className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
            >
              <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
              Add image
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                syncGalleryAssets((current) => [
                  ...current,
                  {
                    publicId: "",
                    mediaType: "VIDEO",
                    thumbnailPublicId: null,
                    caption: null,
                    position: current.length + 1,
                  },
                ])
              }
              className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
            >
              <Film className="mr-1.5 h-3.5 w-3.5" />
              Add video
            </Button>
          </div>
        </div>

        {galleryAssets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#2a2a2a] px-4 py-6 text-center text-sm text-[#555]">
            No extra gallery assets yet.
          </div>
        ) : (
          <div className="space-y-4">
            {galleryAssets.map((asset, index) => (
              <div
                key={`${asset.mediaType}-${asset.publicId || "new"}-${index}`}
                className="space-y-4 rounded-xl border border-[#222] bg-[#111] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Asset {index + 2}
                    </p>
                    <p className="text-xs text-[#666]">
                      {asset.mediaType === "VIDEO"
                        ? "Video asset with required thumbnail"
                        : "Image asset"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        syncGalleryAssets((current) => {
                          if (index === 0) return current;
                          const next = [...current];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          return next;
                        })
                      }
                      className="rounded p-1.5 text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-white disabled:opacity-30"
                      disabled={index === 0}
                      aria-label={`Move asset ${index + 2} up`}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        syncGalleryAssets((current) => {
                          if (index === current.length - 1) return current;
                          const next = [...current];
                          [next[index], next[index + 1]] = [next[index + 1], next[index]];
                          return next;
                        })
                      }
                      className="rounded p-1.5 text-[#666] transition-colors hover:bg-[#1a1a1a] hover:text-white disabled:opacity-30"
                      disabled={index === galleryAssets.length - 1}
                      aria-label={`Move asset ${index + 2} down`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        syncGalleryAssets((current) =>
                          current.filter((_, assetIndex) => assetIndex !== index),
                        )
                      }
                      className="rounded p-1.5 text-[#666] transition-colors hover:bg-red-950/30 hover:text-red-400"
                      aria-label={`Remove asset ${index + 2}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {asset.mediaType === "IMAGE" ? (
                  <div>
                    <Label className="mb-1.5 block text-xs text-[#888]">Image asset</Label>
                    <ImageUpload
                      value={asset.publicId || undefined}
                      onChange={(id) =>
                        syncGalleryAssets((current) =>
                          current.map((entry, assetIndex) =>
                            assetIndex === index ? { ...entry, publicId: id } : entry,
                          ),
                        )
                      }
                      onRemove={() =>
                        syncGalleryAssets((current) =>
                          current.map((entry, assetIndex) =>
                            assetIndex === index ? { ...entry, publicId: "" } : entry,
                          ),
                        )
                      }
                      emptyLabel="Click to upload image"
                      previewAlt={`Gallery image ${index + 2}`}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="mb-1.5 block text-xs text-[#888]">Video asset</Label>
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
                          const info = result.info;
                          if (
                            typeof info === "object" &&
                            info !== null &&
                            "public_id" in info
                          ) {
                            syncGalleryAssets((current) =>
                              current.map((entry, assetIndex) =>
                                assetIndex === index
                                  ? {
                                      ...entry,
                                      publicId: info.public_id as string,
                                    }
                                  : entry,
                              ),
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
                              asset.publicId
                                ? "border-cyan-500/30 bg-cyan-500/5 text-cyan-400"
                                : "border-[#333] bg-[#0d0d0d] text-[#666] hover:border-cyan-500/30 hover:text-[#888]"
                            }`}
                          >
                            {asset.publicId ? (
                              <>
                                <span className="max-w-[90%] truncate text-xs font-mono">
                                  {asset.publicId}
                                </span>
                                <span className="text-xs text-[#555]">Click to replace</span>
                              </>
                            ) : (
                              <span>Click to upload video</span>
                            )}
                          </button>
                        )}
                      </CldUploadWidget>
                    </div>

                    <div>
                      <Label className="mb-1.5 block text-xs text-[#888]">
                        Video thumbnail
                      </Label>
                      <ImageUpload
                        value={asset.thumbnailPublicId ?? undefined}
                        onChange={(id) =>
                          syncGalleryAssets((current) =>
                            current.map((entry, assetIndex) =>
                              assetIndex === index
                                ? { ...entry, thumbnailPublicId: id }
                                : entry,
                            ),
                          )
                        }
                        onRemove={() =>
                          syncGalleryAssets((current) =>
                            current.map((entry, assetIndex) =>
                              assetIndex === index
                                ? { ...entry, thumbnailPublicId: null }
                                : entry,
                            ),
                          )
                        }
                        emptyLabel="Click to upload thumbnail"
                        previewAlt={`Gallery video thumbnail ${index + 2}`}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label className="mb-1.5 block text-xs text-[#888]">
                    Caption <span className="text-[#555]">(optional)</span>
                  </Label>
                  <Textarea
                    rows={2}
                    value={asset.caption ?? ""}
                    onChange={(event) =>
                      syncGalleryAssets((current) =>
                        current.map((entry, assetIndex) =>
                          assetIndex === index
                            ? { ...entry, caption: event.target.value }
                            : entry,
                        ),
                      )
                    }
                    placeholder="Short note for this media item…"
                    className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {errors.assets ? (
          <p className="text-xs text-red-400">
            {errors.assets.message?.toString()}
          </p>
        ) : null}

        <div className="rounded-xl border border-[#222] bg-[#0b0b0b] p-4">
          <Label className="block text-xs text-[#888]">
            Homepage / card preview media
          </Label>
          {featurePreviewOptions.length <= 1 ? (
            <p className="mt-2 text-xs leading-6 text-[#555]">
              This project currently has one usable media item, so it will be picked automatically anywhere the project is featured.
            </p>
          ) : (
            <>
              <p className="mt-2 text-xs leading-6 text-[#555]">
                Choose which image or video should represent this project on the homepage and project cards.
              </p>
              <Select
                value={coverAssetId ?? PRIMARY_COVER_SELECTION}
                onValueChange={(value) =>
                  setValue("coverAssetId", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="mt-3 border-[#2a2a2a] bg-[#0d0d0d] text-white">
                  <SelectValue placeholder="Select preview media" />
                </SelectTrigger>
                <SelectContent className="border-[#2a2a2a] bg-[#111]">
                  {featurePreviewOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white focus:bg-[#1a1a1a]"
                    >
                      {option.label} · {option.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="pf-title" className="mb-1.5 block text-xs text-[#888]">Title</Label>
        <Input
          id="pf-title"
          placeholder="e.g. Brand Identity Suite"
          className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
          {...register("title")}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="pf-desc" className="mb-1.5 block text-xs text-[#888]">
          Description <span className="text-[#555]">(optional)</span>
        </Label>
        <Textarea
          id="pf-desc"
          rows={3}
          placeholder="Brief description shown on the /projects page…"
          className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
          {...register("description")}
        />
        <p className="mt-1 text-right text-xs text-[#555]">
          {descriptionValue.length} / 2000
        </p>
      </div>

      {serviceType === "BUILD" ? (
        <div>
          <Label htmlFor="pf-website" className="mb-1.5 block text-xs text-[#888]">
            Project link <span className="text-[#555]">(for build projects)</span>
          </Label>
          <Input
            id="pf-website"
            type="url"
            placeholder="https://example.com"
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
            {...register("websiteUrl")}
          />
          {errors.websiteUrl ? (
            <p className="mt-1 text-xs text-red-400">{errors.websiteUrl.message}</p>
          ) : (
            <p className="mt-1 text-xs text-[#555]">
              This link powers the public "Visit Website" button in the project viewer.
            </p>
          )}
        </div>
      ) : null}

      {/* Tags */}
      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">
          Tags <span className="text-[#555]">(max 8)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            placeholder="e.g. Branding"
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444] focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addTag}
            disabled={!tagInput.trim() || tags.length >= 8}
            className="shrink-0 border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
          >
            <Tag className="h-3.5 w-3.5" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-[#1a1a1a] px-2.5 py-1 text-xs text-[#aaa]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-[#555] hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Featured + Visible toggles */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg border border-[#222] bg-[#0d0d0d] px-4 py-3">
          <Switch
            id="pf-featured"
            checked={watch("isFeatured")}
            onCheckedChange={(v) => setValue("isFeatured", v)}
          />
          <Label htmlFor="pf-featured" className="text-xs text-[#888]">
            Featured on services card
          </Label>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-[#222] bg-[#0d0d0d] px-4 py-3">
          <Switch
            id="pf-visible"
            checked={watch("isVisible")}
            onCheckedChange={(v) => setValue("isVisible", v)}
          />
          <Label htmlFor="pf-visible" className="text-xs text-[#888]">
            Visible on /projects
          </Label>
        </div>
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
            "Add Item"
          )}
        </Button>
      </div>
    </form>
  );
}
