"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface SendConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipientCount: number;
  subject: string;
}

export function SendConfirmation({
  open,
  onClose,
  onConfirm,
  recipientCount,
  subject,
}: SendConfirmationProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-[#2a2a2a] bg-[#111] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Confirm Send
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-[#a0a0a0]">
            You are about to send an email to{" "}
            <span className="font-semibold text-white">
              {recipientCount} registrant{recipientCount !== 1 ? "s" : ""}
            </span>
            .
          </p>
          <div className="rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-4 py-3">
            <p className="text-xs text-[#666]">Subject</p>
            <p className="text-sm text-white">{subject || "No subject"}</p>
          </div>
          <p className="text-xs text-[#666]">This action cannot be undone.</p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-cyan-500 text-black hover:bg-cyan-400"
          >
            Send emails
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
