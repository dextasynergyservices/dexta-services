"use client";

import { useState, useRef, type MouseEvent } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { FileText, ImagePlus, X, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCloudinaryPublicId,
  getCloudinaryUrl,
  isCloudinaryUrl,
} from "@/lib/cloudinary";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (publicId: string) => void;
  onRemove: () => void;
  emptyLabel?: string;
  previewAlt?: string;
  resourceType?: "image" | "video" | "raw";
  /** Local/static image shown as a read-only preview when no Cloudinary ID is set */
  fallbackSrc?: string;
  allowedFormats?: string[];
  maxFileSize?: number;
  deletePreviousOnReplace?: boolean;
  successMessage?: string;
}

function getUploadErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    const maybeStatusText =
      "statusText" in error && typeof error.statusText === "string"
        ? error.statusText
        : null;
    const maybeMessage =
      "message" in error && typeof error.message === "string"
        ? error.message
        : null;

    return maybeStatusText || maybeMessage || "File upload failed";
  }

  return "File upload failed";
}

function getPreviewSrc(
  value?: string,
  resourceType: "image" | "video" | "raw" = "image",
) {
  if (!value) {
    return null;
  }

  if (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  if (resourceType === "image") {
    return isCloudinaryUrl(value) ? value : getCloudinaryUrl(value);
  }

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${value}`;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  emptyLabel = "Click to upload image",
  previewAlt = "Uploaded image",
  resourceType = "image",
  fallbackSrc,
  allowedFormats = ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"],
  maxFileSize = 8_000_000,
  deletePreviousOnReplace = true,
  successMessage,
}: ImageUploadProps) {
  const [deleting, setDeleting] = useState(false);
  const oldPublicIdRef = useRef<string | null>(null);
  const previewSrc = getPreviewSrc(value, resourceType);
  const isImageUpload = resourceType === "image";
  const isVideoUpload = resourceType === "video";
  const UploadIcon = isImageUpload ? ImagePlus : FileText;

  const handleDelete = async () => {
    const publicId = value ? getCloudinaryPublicId(value) : null;
    if (!publicId) return;

    if (
      publicId.startsWith("/") ||
      publicId.startsWith("http://") ||
      publicId.startsWith("https://")
    ) {
      onRemove();
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, resourceType }),
      });
      const data = await res.json();
      if (data.result === "ok" || data.result === "not found") {
        onRemove();
      } else {
        toast.error("Failed to delete image");
      }
    } catch {
      toast.error("Failed to delete image");
    } finally {
      setDeleting(false);
    }
  };

  return (
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
        resourceType,
        clientAllowedFormats: allowedFormats,
        maxFileSize,
        sources: isImageUpload ? ["local", "camera", "url"] : ["local", "url"],
        singleUploadAutoClose: true,
        showAdvancedOptions: false,
      }}
      onOpen={() => {
        if (deletePreviousOnReplace && value) oldPublicIdRef.current = value;
      }}
      onError={(error) => {
        console.error("[Cloudinary Upload]", error);
        toast.error(getUploadErrorMessage(error));
      }}
      onSuccess={async (result) => {
        if (
          typeof result.info === "object" &&
          result.info !== null &&
          "public_id" in result.info
        ) {
          const newPublicId =
            resourceType === "raw" && "secure_url" in result.info
              ? String(result.info.secure_url)
              : (result.info.public_id as string);
          const oldPublicId = oldPublicIdRef.current
            ? getCloudinaryPublicId(oldPublicIdRef.current)
            : null;

          // Delete old image if replacing. Template project editors opt out
          // because previous assets may still be referenced by drafts/revisions.
          if (
            deletePreviousOnReplace &&
            oldPublicId &&
            oldPublicId !== newPublicId
          ) {
            try {
              await fetch("/api/cloudinary/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicId: oldPublicId, resourceType }),
              });
            } catch {
              // Old image cleanup is best-effort
            }
          }

          oldPublicIdRef.current = null;
          onChange(newPublicId);
          toast.success(
            successMessage ??
              (isImageUpload
                ? "Image uploaded successfully"
                : isVideoUpload
                  ? "Video uploaded successfully"
                  : "File uploaded successfully"),
          );
        }
      }}
    >
      {({ open }) => {
        const openUploadWidget = (event: MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          event.stopPropagation();
          open?.();
        };

        return (
          <div>
            {value ? (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-xl border border-[#222]">
                  {isVideoUpload && previewSrc ? (
                    <video
                      src={previewSrc}
                      className="h-48 w-full bg-black object-cover"
                      controls
                      preload="metadata"
                    />
                  ) : !isImageUpload ? (
                    <div className="flex h-32 flex-col items-center justify-center gap-2 bg-[#0d0d0d] px-4 text-center">
                      <FileText className="h-8 w-8 text-cyan-300" />
                      <span className="max-w-full truncate text-sm text-[#d8d8d8]">
                        {value}
                      </span>
                      <span className="text-xs text-[#777]">
                        {resourceType === "raw"
                          ? "GLB model file"
                          : "Uploaded file"}
                      </span>
                    </div>
                  ) : previewSrc && isCloudinaryUrl(previewSrc) ? (
                    // We intentionally bypass next/image here because the optimizer
                    // was timing out on Cloudinary-backed admin previews in local/dev.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewSrc}
                      alt={previewAlt}
                      className="h-48 w-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <Image
                      src={previewSrc ?? ""}
                      alt={previewAlt}
                      width={600}
                      height={300}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="absolute right-2 top-2 h-8 w-8 rounded-full bg-black/60 p-0 text-white hover:bg-red-600/80"
                    aria-label="Delete image"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={openUploadWidget}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#333] bg-[#0d0d0d] px-4 py-2 text-sm text-[#888] transition-colors hover:border-cyan-500/30 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                  {isImageUpload ? "Replace image" : "Replace file"}
                </button>
              </div>
            ) : fallbackSrc ? (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-xl border border-dashed border-[#333]">
                  <Image
                    src={fallbackSrc}
                    alt={previewAlt}
                    width={600}
                    height={300}
                    className="h-48 w-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="rounded-md bg-black/70 px-2 py-1 text-xs text-[#888]">
                      Default — upload to override
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={openUploadWidget}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#333] bg-[#0d0d0d] px-4 py-2 text-sm text-[#888] transition-colors hover:border-cyan-500/30 hover:text-white"
                >
                  <UploadIcon className="h-4 w-4" />
                  {emptyLabel}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openUploadWidget}
                className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#333] bg-[#0d0d0d] text-[#666] transition-colors hover:border-cyan-500/30 hover:text-[#888]"
              >
                <UploadIcon className="h-8 w-8" />
                <span className="text-sm">{emptyLabel}</span>
              </button>
            )}
          </div>
        );
      }}
    </CldUploadWidget>
  );
}
