"use client";

import { useState, useRef, type ChangeEvent, type MouseEvent } from "react";
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

const MAX_UPLOAD_FILE_SIZE_BYTES = 10_000_000;
const IMAGE_COMPRESSION_THRESHOLD_BYTES = 9_000_000;
const IMAGE_COMPRESSION_TARGET_BYTES = 7_000_000;
const COMPRESSIBLE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function formatMegabytes(bytes: number) {
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
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

function loadImageFromFile(file: globalThis.File) {
  return new Promise<globalThis.HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image file"));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: globalThis.HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<globalThis.Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not compress image"));
        }
      },
      type,
      quality,
    );
  });
}

async function compressImageToTarget(file: globalThis.File) {
  if (file.size <= IMAGE_COMPRESSION_THRESHOLD_BYTES) {
    return file;
  }

  if (!COMPRESSIBLE_IMAGE_TYPES.has(file.type)) {
    throw new Error(
      "Images over 9 MB must be JPG, PNG, or WebP so they can be compressed.",
    );
  }

  const image = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Your browser could not prepare this image for upload.");
  }

  let scale = Math.min(
    1,
    3200 / Math.max(image.naturalWidth, image.naturalHeight),
  );
  let quality = 0.92;
  let compressedBlob: globalThis.Blob | null = null;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    compressedBlob = await canvasToBlob(canvas, "image/webp", quality);
    if (compressedBlob.size <= IMAGE_COMPRESSION_TARGET_BYTES) {
      break;
    }

    if (quality > 0.76) {
      quality -= 0.05;
    } else {
      scale *= 0.88;
      quality = 0.9;
    }
  }

  if (!compressedBlob) {
    throw new Error("Could not compress image");
  }

  return new globalThis.File(
    [compressedBlob],
    `${file.name.replace(/\.[^.]+$/, "") || "compressed-image"}.webp`,
    {
      type: "image/webp",
      lastModified: Date.now(),
    },
  );
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
  maxFileSize = MAX_UPLOAD_FILE_SIZE_BYTES,
  deletePreviousOnReplace = true,
  successMessage,
}: ImageUploadProps) {
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const oldPublicIdRef = useRef<string | null>(null);
  const fileInputRef = useRef<globalThis.HTMLInputElement>(null);
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

  const deleteReplacedFile = async (newPublicId: string) => {
    const oldPublicId = oldPublicIdRef.current
      ? getCloudinaryPublicId(oldPublicIdRef.current)
      : null;

    if (deletePreviousOnReplace && oldPublicId && oldPublicId !== newPublicId) {
      try {
        await fetch("/api/cloudinary/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: oldPublicId, resourceType }),
        });
      } catch {
        // Old image cleanup is best-effort.
      }
    }

    oldPublicIdRef.current = null;
  };

  const uploadLocalImage = async (file: globalThis.File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    if (!cloudName || !apiKey) {
      throw new Error("Cloudinary upload settings are missing.");
    }

    const timestamp = Math.round(Date.now() / 1000);
    const signatureResponse = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paramsToSign: { timestamp } }),
    });
    const signatureData = await signatureResponse.json();

    if (!signatureResponse.ok || !signatureData.signature) {
      throw new Error(signatureData.error ?? "Could not prepare image upload.");
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("api_key", apiKey);
    formData.set("timestamp", String(timestamp));
    formData.set("signature", String(signatureData.signature));

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );
    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok || !uploadData.public_id) {
      throw new Error(uploadData.error?.message ?? "Image upload failed.");
    }

    return String(uploadData.secure_url ?? uploadData.public_id);
  };

  const handleLocalImageChange = async (
    event: ChangeEvent<globalThis.HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.size > maxFileSize) {
      toast.error(
        `File is ${formatMegabytes(file.size)}. Maximum upload size is ${formatMegabytes(maxFileSize)}.`,
      );
      return;
    }

    oldPublicIdRef.current = deletePreviousOnReplace && value ? value : null;
    setUploading(true);

    try {
      const fileToUpload = await compressImageToTarget(file);
      const newPublicId = await uploadLocalImage(fileToUpload);

      await deleteReplacedFile(newPublicId);
      onChange(newPublicId);
      toast.success(
        file.size > IMAGE_COMPRESSION_THRESHOLD_BYTES
          ? `Image compressed to ${formatMegabytes(fileToUpload.size)} and uploaded successfully`
          : (successMessage ?? "Image uploaded successfully"),
      );
    } catch (error) {
      oldPublicIdRef.current = null;
      toast.error(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    } finally {
      setUploading(false);
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
        maxImageFileSize: maxFileSize,
        maxVideoFileSize: maxFileSize,
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
            (resourceType === "raw" || isImageUpload) &&
            "secure_url" in result.info
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
          if (isImageUpload) {
            fileInputRef.current?.click();
            return;
          }
          open?.();
        };

        return (
          <div>
            {isImageUpload ? (
              <input
                ref={fileInputRef}
                type="file"
                accept={allowedFormats.map((format) => `.${format}`).join(",")}
                className="sr-only"
                onChange={handleLocalImageChange}
              />
            ) : null}
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
                    disabled={deleting || uploading}
                    className="absolute right-2 top-2 h-8 w-8 rounded-full bg-black/60 p-0 text-white hover:bg-red-600/80"
                    aria-label="Delete image"
                  >
                    {deleting || uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={openUploadWidget}
                  disabled={uploading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#333] bg-[#0d0d0d] px-4 py-2 text-sm text-[#888] transition-colors hover:border-cyan-500/30 hover:text-white"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {uploading
                    ? "Uploading..."
                    : isImageUpload
                      ? "Replace image"
                      : "Replace file"}
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
                  disabled={uploading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#333] bg-[#0d0d0d] px-4 py-2 text-sm text-[#888] transition-colors hover:border-cyan-500/30 hover:text-white"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UploadIcon className="h-4 w-4" />
                  )}
                  {uploading ? "Uploading..." : emptyLabel}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openUploadWidget}
                disabled={uploading}
                className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#333] bg-[#0d0d0d] text-[#666] transition-colors hover:border-cyan-500/30 hover:text-[#888]"
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <UploadIcon className="h-8 w-8" />
                )}
                <span className="text-sm">
                  {uploading ? "Uploading..." : emptyLabel}
                </span>
              </button>
            )}
          </div>
        );
      }}
    </CldUploadWidget>
  );
}
