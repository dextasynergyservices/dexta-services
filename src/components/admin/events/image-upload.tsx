"use client";

import { useState, useRef } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { ImagePlus, X, RefreshCw, Loader2 } from "lucide-react";
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
  /** Local/static image shown as a read-only preview when no Cloudinary ID is set */
  fallbackSrc?: string;
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

    return maybeStatusText || maybeMessage || "Image upload failed";
  }

  return "Image upload failed";
}

function getPreviewSrc(value?: string) {
  if (!value) {
    return null;
  }

  return isCloudinaryUrl(value) ? value : getCloudinaryUrl(value);
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  emptyLabel = "Click to upload image",
  previewAlt = "Uploaded image",
  fallbackSrc,
}: ImageUploadProps) {
  const [deleting, setDeleting] = useState(false);
  const oldPublicIdRef = useRef<string | null>(null);
  const previewSrc = getPreviewSrc(value);

  const handleDelete = async () => {
    const publicId = value ? getCloudinaryPublicId(value) : null;
    if (!publicId) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
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
        resourceType: "image",
        sources: ["local", "camera", "url"],
        singleUploadAutoClose: true,
        showAdvancedOptions: false,
      }}
      onOpen={() => {
        // Remember the current image so we can delete it after replacement
        if (value) oldPublicIdRef.current = value;
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
          const newPublicId = result.info.public_id as string;
          const oldPublicId = oldPublicIdRef.current
            ? getCloudinaryPublicId(oldPublicIdRef.current)
            : null;

          // Delete old image if replacing
          if (oldPublicId && oldPublicId !== newPublicId) {
            try {
              await fetch("/api/cloudinary/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicId: oldPublicId }),
              });
            } catch {
              // Old image cleanup is best-effort
            }
          }

          oldPublicIdRef.current = null;
          onChange(newPublicId);
          toast.success("Image uploaded successfully");
        }
      }}
    >
      {({ open }) => (
        <div>
          {value ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl border border-[#222]">
                {previewSrc && isCloudinaryUrl(previewSrc) ? (
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
                onClick={() => open()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#333] bg-[#0d0d0d] px-4 py-2 text-sm text-[#888] transition-colors hover:border-cyan-500/30 hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Replace image
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
                onClick={() => open()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#333] bg-[#0d0d0d] px-4 py-2 text-sm text-[#888] transition-colors hover:border-cyan-500/30 hover:text-white"
              >
                <ImagePlus className="h-4 w-4" />
                {emptyLabel}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => open()}
              className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#333] bg-[#0d0d0d] text-[#666] transition-colors hover:border-cyan-500/30 hover:text-[#888]"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm">{emptyLabel}</span>
            </button>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
}
