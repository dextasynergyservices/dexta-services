"use client";

import { useState, useRef } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { ImagePlus, X, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (publicId: string) => void;
  onRemove: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [deleting, setDeleting] = useState(false);
  const oldPublicIdRef = useRef<string | null>(null);

  const handleDelete = async () => {
    if (!value) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: value }),
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
      signatureEndpoint="/api/cloudinary/sign"
      options={{ maxFiles: 1, resourceType: "image" }}
      onOpen={() => {
        // Remember the current image so we can delete it after replacement
        if (value) oldPublicIdRef.current = value;
      }}
      onSuccess={async (result) => {
        if (
          typeof result.info === "object" &&
          result.info !== null &&
          "public_id" in result.info
        ) {
          const newPublicId = result.info.public_id as string;

          // Delete old image if replacing
          if (
            oldPublicIdRef.current &&
            oldPublicIdRef.current !== newPublicId
          ) {
            try {
              await fetch("/api/cloudinary/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicId: oldPublicIdRef.current }),
              });
            } catch {
              // Old image cleanup is best-effort
            }
            oldPublicIdRef.current = null;
          }

          onChange(newPublicId);
        }
      }}
    >
      {({ open }) => (
        <div>
          {value ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl border border-[#222]">
                <Image
                  src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${value}`}
                  alt="Event image"
                  width={600}
                  height={300}
                  className="h-48 w-full object-cover"
                />
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
          ) : (
            <button
              type="button"
              onClick={() => open()}
              className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#333] bg-[#0d0d0d] text-[#666] transition-colors hover:border-cyan-500/30 hover:text-[#888]"
            >
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm">Click to upload event image</span>
            </button>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
}
