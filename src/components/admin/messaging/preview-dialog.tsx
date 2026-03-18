"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  subject: string;
  body: string;
}

export function PreviewDialog({
  open,
  onClose,
  subject,
  body,
}: PreviewDialogProps) {
  const bodyHtml = body.replace(/\n/g, "<br />");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-[#2a2a2a] bg-[#0a0a0a] text-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-white">Email Preview</DialogTitle>
        </DialogHeader>

        <div className="rounded-xl border border-[#333] bg-[#1a1a1a] p-6">
          <p className="mb-2 text-xs tracking-widest text-cyan-400">
            DEXTA DEV DAY
          </p>
          <h2 className="mb-4 text-lg font-bold text-white">
            {subject || "No subject"}
          </h2>
          <p className="mb-1 text-sm text-[#a0a0a0]">Hi [Name],</p>
          <div
            className="text-sm leading-relaxed text-[#a0a0a0]"
            dangerouslySetInnerHTML={{
              __html: bodyHtml || "<em>No content</em>",
            }}
          />
          <div className="mt-6 border-t border-[#333] pt-4">
            <p className="text-xs text-[#444]">
              Dexta Synergy Services &middot; @hellodexta &middot; Port
              Harcourt, Nigeria
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
