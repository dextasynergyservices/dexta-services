"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Trash2, ImagePlus, Video, Star } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/events/image-upload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { SchoolWebsiteTemplateInput } from "@/lib/validators";
import type { SchoolWebsiteTemplateRow } from "../actions";

type TemplateFormValues = {
  name: string;
  slug: string;
  summary: string;
  description: string;
  websiteUrl: string;
  highlightsText: string;
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

function createAsset(mediaType: "IMAGE" | "VIDEO", position: number) {
  return {
    id:
      globalThis.crypto?.randomUUID?.() ??
      `asset-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    publicId: "",
    mediaType,
    thumbnailPublicId: null,
    caption: "",
    position,
  };
}

function getInitialValues(
  template?: SchoolWebsiteTemplateRow,
): TemplateFormValues {
  return {
    name: template?.name ?? "",
    slug: template?.slug ?? "",
    summary: template?.summary ?? "",
    description: template?.description ?? "",
    websiteUrl: template?.websiteUrl ?? "",
    highlightsText: (template?.highlights ?? []).join("\n"),
    isVisible: template?.isVisible ?? true,
    position: template?.position ?? 0,
    coverAssetId: template?.coverAssetId ?? null,
    assets:
      template?.assets.map((asset) => ({
        id: asset.id,
        publicId: asset.publicId,
        mediaType: asset.mediaType,
        thumbnailPublicId: asset.thumbnailPublicId,
        caption: asset.caption ?? "",
        position: asset.position,
      })) ?? [],
  };
}

function getPayload(values: TemplateFormValues): SchoolWebsiteTemplateInput {
  const highlights = values.highlightsText
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const assets = [...values.assets].sort((a, b) => a.position - b.position);

  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    summary: values.summary.trim(),
    description: values.description.trim() || null,
    websiteUrl: values.websiteUrl.trim() || null,
    highlights: JSON.stringify(highlights),
    coverAssetId: values.coverAssetId,
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

export function TemplateForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: SchoolWebsiteTemplateRow;
  onSubmit: (payload: SchoolWebsiteTemplateInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<TemplateFormValues>(() =>
    getInitialValues(initialData),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedAssets = useMemo(
    () => [...values.assets].sort((a, b) => a.position - b.position),
    [values.assets],
  );

  const updateAsset = (
    assetId: string,
    updates: Partial<TemplateFormValues["assets"][number]>,
  ) => {
    setValues((current) => ({
      ...current,
      assets: current.assets.map((asset) =>
        asset.id === assetId ? { ...asset, ...updates } : asset,
      ),
    }));
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(getPayload(values));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save template.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Name</Label>
          <Input
            value={values.name}
            onChange={(event) =>
              setValues((current) => ({ ...current, name: event.target.value }))
            }
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Slug</Label>
          <Input
            value={values.slug}
            onChange={(event) =>
              setValues((current) => ({ ...current, slug: event.target.value }))
            }
            className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
          />
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block text-xs text-[#888]">Summary</Label>
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
        <Label className="mb-1.5 block text-xs text-[#888]">Description</Label>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs text-[#888]">Live URL</Label>
          <Input
            value={values.websiteUrl}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                websiteUrl: event.target.value,
              }))
            }
            placeholder="https://example.com/template"
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
        <Label className="mb-1.5 block text-xs text-[#888]">Highlights</Label>
        <Textarea
          rows={4}
          value={values.highlightsText}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              highlightsText: event.target.value,
            }))
          }
          placeholder={"One highlight per line"}
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
            Hidden templates stay in admin but won’t show on `/webrandschools`.
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-[#222] bg-[#0d0d0d] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Preview Assets</h3>
            <p className="mt-1 text-xs text-[#666]">
              Add image or video assets for the template preview modal. Videos
              need a thumbnail image.
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
            No assets yet. Add at least one image so the template card and modal
            have media to display.
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
                      ? "Image preview asset"
                      : "Video preview asset"}
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
                      previewAlt={`Template asset ${index + 1}`}
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
                      previewAlt={`Template video ${index + 1}`}
                      resourceType="video"
                      allowedFormats={["mp4", "webm", "mov"]}
                      maxFileSize={100_000_000}
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
                    previewAlt={`Video thumbnail ${index + 1}`}
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
              ? "Save Template"
              : "Create Template"}
        </Button>
      </div>
    </form>
  );
}
