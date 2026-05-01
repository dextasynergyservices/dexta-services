"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Star,
  Trash2,
  Video,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type {
  SchoolPortalFeatureCardInput,
  SchoolPortalSectionContentInput,
} from "@/lib/validators";
import {
  createSchoolPortalFeatureCard,
  deleteSchoolPortalFeatureCard,
  updateSchoolPortalFeatureCard,
  updateSchoolPortalSectionContent,
  type SchoolPortalFeatureCardRow,
  type SchoolPortalSectionContentRow,
} from "../actions";

type PortalSectionFormValues = {
  eyebrow: string;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  isVisible: boolean;
};

type PortalCardFormValues = {
  title: string;
  summary: string;
  description: string;
  features: string[];
  isVisible: boolean;
  position: number;
  coverAssetId: string | null;
  assets: Array<{
    id: string;
    publicId: string;
    mediaType: "IMAGE" | "VIDEO";
    thumbnailPublicId: string | null;
    caption: string;
    position: number;
  }>;
};

function resolvePreviewSource(value: string) {
  if (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${value}`;
}

function createAsset(mediaType: "IMAGE" | "VIDEO", position: number) {
  return {
    id:
      globalThis.crypto?.randomUUID?.() ??
      `portal-asset-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    publicId: "",
    mediaType,
    thumbnailPublicId: null,
    caption: "",
    position,
  };
}

function getInitialSectionValues(
  content: SchoolPortalSectionContentRow,
): PortalSectionFormValues {
  return {
    eyebrow: content.eyebrow,
    title: content.title,
    description: content.description,
    ctaText: content.ctaText ?? "",
    ctaHref: content.ctaHref ?? "",
    isVisible: content.isVisible,
  };
}

function getInitialCardValues(
  card?: SchoolPortalFeatureCardRow,
): PortalCardFormValues {
  return {
    title: card?.title ?? "",
    summary: card?.summary ?? "",
    description: card?.description ?? "",
    features: card?.features.length ? [...card.features] : [""],
    isVisible: card?.isVisible ?? true,
    position: card?.position ?? 0,
    coverAssetId: card?.coverAssetId ?? null,
    assets:
      card?.assets.map((asset) => ({
        id: asset.id,
        publicId: asset.publicId,
        mediaType: asset.mediaType,
        thumbnailPublicId: asset.thumbnailPublicId,
        caption: asset.caption ?? "",
        position: asset.position,
      })) ?? [],
  };
}

function getCardPayload(
  values: PortalCardFormValues,
): SchoolPortalFeatureCardInput {
  const features = values.features
    .map((feature) => feature.trim())
    .filter(Boolean);
  const assets = [...values.assets].sort((a, b) => a.position - b.position);

  return {
    title: values.title.trim(),
    summary: values.summary.trim(),
    description: values.description.trim(),
    features: JSON.stringify(features),
    coverAssetId: values.coverAssetId,
    youtubeUrl: null,
    isVisible: values.isVisible,
    position: values.position,
    assets: assets.map((asset, index) => ({
      id: asset.id,
      publicId: asset.publicId.trim(),
      mediaType: asset.mediaType,
      thumbnailPublicId: asset.thumbnailPublicId?.trim() || null,
      caption: asset.caption.trim() || null,
      position: index,
    })),
  };
}

function getCoverAsset(card: SchoolPortalFeatureCardRow) {
  return (
    card.assets.find((asset) => asset.id === card.coverAssetId) ??
    card.assets[0] ??
    null
  );
}

function portalStatusClassName(isVisible: boolean) {
  return isVisible
    ? "border-green-500/20 bg-green-500/10 text-green-400"
    : "border-[#2a2a2a] bg-[#0d0d0d] text-[#888]";
}

function PortalAssetPreview({
  title,
  asset,
}: {
  title: string;
  asset: {
    publicId: string;
    mediaType: "IMAGE" | "VIDEO";
    thumbnailPublicId: string | null;
  };
}) {
  if (asset.mediaType === "VIDEO") {
    const thumbnailSrc = asset.thumbnailPublicId
      ? resolvePreviewSource(asset.thumbnailPublicId)
      : null;

    return (
      <div className="relative flex h-full w-full items-center justify-center bg-[#0f0f0f] text-[#888]">
        {thumbnailSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailSrc}
            alt={`${title} video thumbnail`}
            className="h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/35 text-white">
          <Video className="h-5 w-5" />
          <span className="text-xs font-medium tracking-[0.2em] uppercase">
            Video
          </span>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolvePreviewSource(asset.publicId)}
      alt={title}
      className="h-full w-full bg-white object-cover"
    />
  );
}

function PortalSectionForm({
  content,
  onSaved,
}: {
  content: SchoolPortalSectionContentRow;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<PortalSectionFormValues>(() =>
    getInitialSectionValues(content),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const payload: SchoolPortalSectionContentInput = {
      eyebrow: values.eyebrow.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      ctaText: values.ctaText.trim() || null,
      ctaHref: values.ctaHref.trim() || null,
      isVisible: values.isVisible,
    };

    const result = await updateSchoolPortalSectionContent(payload);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    onSaved();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#222] bg-[#111] p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Portal Section Copy
          </h2>
          <p className="mt-1 text-xs leading-5 text-[#666]">
            Control the heading, intro copy, optional CTA, and visibility for
            the portal section.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#222] bg-[#0d0d0d] px-4 py-3">
          <Checkbox
            checked={values.isVisible}
            onCheckedChange={(checked) =>
              setValues((current) => ({
                ...current,
                isVisible: checked === true,
              }))
            }
          />
          <div>
            <p className="text-sm font-medium text-white">Visible</p>
            <p className="text-xs text-[#666]">Show this section publicly.</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Eyebrow</Label>
          <Input
            value={values.eyebrow}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                eyebrow: event.target.value,
              }))
            }
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Title</Label>
          <Input
            value={values.title}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
          />
        </div>
      </div>

      <div className="mt-4">
        <Label className="mb-1.5 block text-xs text-[#888]">
          Short description
        </Label>
        <Textarea
          rows={4}
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">CTA text</Label>
          <Input
            value={values.ctaText}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                ctaText: event.target.value,
              }))
            }
            placeholder="Optional"
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">CTA link</Label>
          <Input
            value={values.ctaHref}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                ctaHref: event.target.value,
              }))
            }
            placeholder="#school-portal"
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-cyan-500 text-black hover:bg-cyan-400"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Section"
          )}
        </Button>
      </div>
    </form>
  );
}

function PortalCardForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: SchoolPortalFeatureCardRow;
  onSubmit: (payload: SchoolPortalFeatureCardInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<PortalCardFormValues>(() =>
    getInitialCardValues(initialData),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedAssets = useMemo(
    () => [...values.assets].sort((a, b) => a.position - b.position),
    [values.assets],
  );

  const updateAsset = (
    assetId: string,
    updates: Partial<PortalCardFormValues["assets"][number]>,
  ) => {
    setValues((current) => ({
      ...current,
      assets: current.assets.map((asset) =>
        asset.id === assetId ? { ...asset, ...updates } : asset,
      ),
    }));
  };

  const addAsset = (mediaType: "IMAGE" | "VIDEO") => {
    setValues((current) => {
      const nextAsset = createAsset(mediaType, current.assets.length);

      return {
        ...current,
        coverAssetId: current.coverAssetId ?? nextAsset.id,
        assets: [...current.assets, nextAsset],
      };
    });
  };

  const removeAsset = (assetId: string) => {
    setValues((current) => {
      const nextAssets = current.assets
        .filter((asset) => asset.id !== assetId)
        .map((asset, index) => ({ ...asset, position: index }));

      return {
        ...current,
        coverAssetId:
          current.coverAssetId === assetId
            ? (nextAssets[0]?.id ?? null)
            : current.coverAssetId,
        assets: nextAssets,
      };
    });
  };

  const updateFeature = (index: number, value: string) => {
    setValues((current) => ({
      ...current,
      features: current.features.map((feature, featureIndex) =>
        featureIndex === index ? value : feature,
      ),
    }));
  };

  const moveFeature = (index: number, direction: -1 | 1) => {
    setValues((current) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= current.features.length) {
        return current;
      }

      const nextFeatures = [...current.features];
      const [feature] = nextFeatures.splice(index, 1);
      if (feature === undefined) return current;
      nextFeatures.splice(nextIndex, 0, feature);

      return {
        ...current,
        features: nextFeatures,
      };
    });
  };

  const removeFeature = (index: number) => {
    setValues((current) => ({
      ...current,
      features: current.features.filter(
        (_, featureIndex) => featureIndex !== index,
      ),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(getCardPayload(values));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save portal card.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Title</Label>
          <Input
            value={values.title}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Position</Label>
          <Input
            type="number"
            min={0}
            value={values.position}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                position: Number(event.target.value || 0),
              }))
            }
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
          />
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">
          Short card description
        </Label>
        <Textarea
          rows={3}
          value={values.summary}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              summary: event.target.value,
            }))
          }
          className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
        />
      </div>

      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">
          Full modal description
        </Label>
        <Textarea
          rows={5}
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          className="resize-none border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
        />
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-[#222] bg-[#0d0d0d] px-4 py-3">
          <Checkbox
            checked={values.isVisible}
            onCheckedChange={(checked) =>
              setValues((current) => ({
                ...current,
                isVisible: checked === true,
              }))
            }
          />
          <div>
            <p className="text-sm font-medium text-white">
              Visible on public page
            </p>
            <p className="text-xs text-[#666]">
              Hidden cards remain editable in admin.
            </p>
          </div>
      </div>

      <div className="rounded-2xl border border-[#222] bg-[#0d0d0d] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Features</h3>
            <p className="mt-1 text-xs text-[#666]">
              Add short benefit points. Use arrows to reorder them.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setValues((current) => ({
                ...current,
                features: [...current.features, ""],
              }))
            }
            className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Feature
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {values.features.map((feature, index) => (
            <div key={`feature-${index}`} className="flex items-center gap-2">
              <Input
                value={feature}
                onChange={(event) => updateFeature(index, event.target.value)}
                placeholder={`Feature ${index + 1}`}
                className="border-[#2a2a2a] bg-[#111] text-white placeholder-[#444]"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => moveFeature(index, -1)}
                disabled={index === 0}
                className="h-10 w-10 shrink-0 border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => moveFeature(index, 1)}
                disabled={index === values.features.length - 1}
                className="h-10 w-10 shrink-0 border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white disabled:opacity-40"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFeature(index)}
                className="h-10 w-10 shrink-0 text-[#666] hover:bg-red-950/30 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-[#222] bg-[#0d0d0d] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Portal Media</h3>
            <p className="mt-1 text-xs text-[#666]">
              Add gallery images, uploaded videos, and choose the cover image or
              thumbnail for this card.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addAsset("IMAGE")}
              className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
            >
              <ImagePlus className="mr-1.5 h-4 w-4" />
              Add Image
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addAsset("VIDEO")}
              className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
            >
              <Video className="mr-1.5 h-4 w-4" />
              Add Video
            </Button>
          </div>
        </div>

        {sortedAssets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#2a2a2a] px-4 py-8 text-center text-sm text-[#666]">
            No media yet. Add at least one image to give this card a cover.
          </div>
        ) : null}

        <div className="space-y-4">
          {sortedAssets.map((asset, index) => (
            <div
              key={asset.id}
              className="rounded-2xl border border-[#222] bg-[#111] p-4"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Asset {index + 1}
                  </p>
                  <p className="mt-1 text-xs text-[#666]">
                    {asset.mediaType === "IMAGE"
                      ? "Image gallery asset"
                      : "Uploaded video asset"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setValues((current) => ({
                        ...current,
                        coverAssetId: asset.id,
                      }))
                    }
                    className={
                      values.coverAssetId === asset.id
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/10"
                        : "border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
                    }
                  >
                    <Star className="mr-1.5 h-4 w-4" />
                    {values.coverAssetId === asset.id
                      ? "Cover"
                      : "Use as cover"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAsset(asset.id)}
                    className="h-9 w-9 text-[#666] hover:bg-red-950/30 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <Label className="mb-1.5 block text-xs text-[#888]">
                    Media type
                  </Label>
                  <Select
                    value={asset.mediaType}
                    onValueChange={(value) =>
                      updateAsset(asset.id, {
                        mediaType: value as "IMAGE" | "VIDEO",
                        thumbnailPublicId:
                          value === "IMAGE" ? null : asset.thumbnailPublicId,
                      })
                    }
                  >
                    <SelectTrigger className="w-full border-[#2a2a2a] bg-[#0d0d0d] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#222] bg-[#111] text-white">
                      <SelectItem value="IMAGE">Image</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs text-[#888]">
                    Position
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={asset.position}
                    onChange={(event) =>
                      updateAsset(asset.id, {
                        position: Number(event.target.value || 0),
                      })
                    }
                    className="border-[#2a2a2a] bg-[#0d0d0d] text-white"
                  />
                </div>
              </div>

              <div className="mt-4">
                {asset.mediaType === "IMAGE" ? (
                  <>
                    <Label className="mb-1.5 block text-xs text-[#888]">
                      Image
                    </Label>
                    <ImageUpload
                      value={asset.publicId || undefined}
                      onChange={(value) =>
                        updateAsset(asset.id, { publicId: value })
                      }
                      onRemove={() => updateAsset(asset.id, { publicId: "" })}
                      emptyLabel="Upload image"
                      previewAlt={`Portal asset ${index + 1}`}
                      deletePreviousOnReplace={false}
                    />
                  </>
                ) : (
                  <div>
                    <Label className="mb-1.5 block text-xs text-[#888]">
                      Video
                    </Label>
                    <ImageUpload
                      value={asset.publicId || undefined}
                      onChange={(value) =>
                        updateAsset(asset.id, { publicId: value })
                      }
                      onRemove={() => updateAsset(asset.id, { publicId: "" })}
                      emptyLabel="Upload video"
                      previewAlt={`Portal video ${index + 1}`}
                      resourceType="video"
                      allowedFormats={["mp4", "webm", "mov"]}
                      maxFileSize={10_000_000}
                      successMessage="Video uploaded successfully"
                    />
                  </div>
                )}
              </div>

              {asset.mediaType === "VIDEO" ? (
                <div className="mt-4">
                  <Label className="mb-1.5 block text-xs text-[#888]">
                    Video thumbnail
                  </Label>
                  <ImageUpload
                    value={asset.thumbnailPublicId || undefined}
                    onChange={(value) =>
                      updateAsset(asset.id, { thumbnailPublicId: value })
                    }
                    onRemove={() =>
                      updateAsset(asset.id, { thumbnailPublicId: null })
                    }
                    emptyLabel="Upload thumbnail"
                    previewAlt={`Portal video thumbnail ${index + 1}`}
                    deletePreviousOnReplace={false}
                  />
                </div>
              ) : null}

              <div className="mt-4">
                <Label className="mb-1.5 block text-xs text-[#888]">
                  Caption
                </Label>
                <Input
                  value={asset.caption}
                  onChange={(event) =>
                    updateAsset(asset.id, { caption: event.target.value })
                  }
                  className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
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
          className="bg-cyan-500 text-black hover:bg-cyan-400"
        >
          {isSubmitting
            ? "Saving..."
            : initialData
              ? "Save Portal Card"
              : "Create Portal Card"}
        </Button>
      </div>
    </form>
  );
}

export function PortalManager({
  sectionContent,
  cards,
}: {
  sectionContent: SchoolPortalSectionContentRow;
  cards: SchoolPortalFeatureCardRow[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SchoolPortalFeatureCardRow | null>(
    null,
  );
  const [deleting, setDeleting] = useState<SchoolPortalFeatureCardRow | null>(
    null,
  );

  const refresh = () => router.refresh();

  const handleCreate = async (payload: SchoolPortalFeatureCardInput) => {
    const result = await createSchoolPortalFeatureCard(payload);
    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setCreating(false);
    refresh();
  };

  const handleUpdate = async (payload: SchoolPortalFeatureCardInput) => {
    if (!editing) return;

    const result = await updateSchoolPortalFeatureCard(editing.id, payload);
    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setEditing(null);
    refresh();
  };

  const handleDelete = async () => {
    if (!deleting) return;

    const result = await deleteSchoolPortalFeatureCard(deleting.id);
    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setDeleting(null);
    refresh();
  };

  const openEditing = (card: SchoolPortalFeatureCardRow) => {
    setEditing(card);
  };

  return (
    <div className="space-y-6">
      <PortalSectionForm content={sectionContent} onSaved={refresh} />

      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Portal Feature Cards
            </h2>
            <p className="mt-1 text-xs leading-5 text-[#666]">
              Manage the cards that open into detailed portal demos on the
              public page.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setCreating(true)}
            className="bg-cyan-500 text-black hover:bg-cyan-400"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Portal Card
          </Button>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#0a0a0a] px-6 py-12 text-center">
            <p className="text-sm font-medium text-white">
              No portal cards in the database yet.
            </p>
            <p className="mt-2 text-xs leading-6 text-[#666]">
              Add the first portal feature card so the public section can show
              school owners what the free portal includes.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#222] bg-[#111]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#222] bg-[#0d0d0d] hover:bg-[#0d0d0d]">
                  <TableHead className="px-4 text-xs font-semibold tracking-[0.2em] text-[#777] uppercase">
                    Card
                  </TableHead>
                  <TableHead className="px-4 text-xs font-semibold tracking-[0.2em] text-[#777] uppercase">
                    Status
                  </TableHead>
                  <TableHead className="px-4 text-xs font-semibold tracking-[0.2em] text-[#777] uppercase">
                    Position
                  </TableHead>
                  <TableHead className="px-4 text-xs font-semibold tracking-[0.2em] text-[#777] uppercase">
                    Assets
                  </TableHead>
                  <TableHead className="px-4 text-xs font-semibold tracking-[0.2em] text-[#777] uppercase">
                    Features
                  </TableHead>
                  <TableHead className="px-4 text-right text-xs font-semibold tracking-[0.2em] text-[#777] uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.map((card) => {
                  const coverAsset = getCoverAsset(card);

                  return (
	                    <TableRow
	                      key={card.id}
	                      tabIndex={0}
	                      onClick={() => openEditing(card)}
	                      onKeyDown={(event) => {
	                        if (event.key === "Enter" || event.key === " ") {
	                          event.preventDefault();
	                          openEditing(card);
	                        }
	                      }}
	                      className="cursor-pointer border-[#222] bg-[#111] text-[#d5d5d5] hover:bg-[#171717] focus-visible:bg-[#171717] focus-visible:outline-none"
                    >
                      <TableCell className="px-4 py-3 align-top whitespace-normal">
                        <div className="flex min-w-[240px] items-start gap-3">
                          <div className="h-14 w-20 overflow-hidden rounded-xl border border-[#222] bg-[#0b0b0b]">
                            {coverAsset ? (
                              <PortalAssetPreview
                                title={card.title}
                                asset={coverAsset}
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[10px] tracking-[0.2em] text-[#666] uppercase">
                                No media
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-white">
                                {card.title}
                              </p>
	                              <span className="rounded-full border border-[#2a2a2a] bg-[#0d0d0d] px-2 py-0.5 text-[10px] tracking-[0.18em] text-[#777] uppercase">
	                                Click to edit
	                              </span>
                            </div>
                            <p className="max-w-md text-xs leading-6 text-[#8d8d8d]">
                              {card.summary}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 align-top">
                        <Badge
                          variant="outline"
                          className={portalStatusClassName(card.isVisible)}
                        >
                          {card.isVisible ? "Visible" : "Hidden"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 align-top text-sm text-[#b3b3b3]">
                        {card.position}
                      </TableCell>
                      <TableCell className="px-4 py-3 align-top text-sm text-[#b3b3b3]">
                        {card.assets.length}
                      </TableCell>
                      <TableCell className="px-4 py-3 align-top text-sm text-[#b3b3b3]">
                        {card.features.length}
                      </TableCell>
		                      <TableCell className="px-4 py-3 text-right align-top">
	                        <div className="flex justify-end gap-2">
	                          <Button
	                            type="button"
	                            variant="outline"
                            size="icon"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditing(card);
                            }}
                            className="h-9 w-9 border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(event) => {
                              event.stopPropagation();
                              setDeleting(card);
                            }}
                            className="h-9 w-9 text-[#666] hover:bg-red-950/30 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
	        )}
	      </section>

      <Dialog open={creating} onOpenChange={setCreating} modal={false}>
        <DialogContent
          className="max-h-[92vh] overflow-y-auto border-[#222] bg-[#111] text-white sm:max-w-4xl"
          onInteractOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-white">New Portal Card</DialogTitle>
          </DialogHeader>
          <PortalCardForm
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        modal={false}
      >
        <DialogContent
          className="max-h-[92vh] overflow-y-auto border-[#222] bg-[#111] text-white sm:max-w-4xl"
          onInteractOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-white">Edit Portal Card</DialogTitle>
          </DialogHeader>
          {editing ? (
            <PortalCardForm
              initialData={editing}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent className="border-[#222] bg-[#111] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete "{deleting?.title}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#666]">
              This removes the portal card and all image or video records tied
              to it. This action cannot be undone from the admin screen.
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
              Delete Portal Card
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
