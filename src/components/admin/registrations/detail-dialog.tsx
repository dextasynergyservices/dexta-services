"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  acceptRegistration,
  declineRegistration,
} from "@/app/admin/(dashboard)/events/actions";

interface Registration {
  id: string;
  name: string;
  email: string;
  event: string;
  status: string;
  createdAt: Date;
}

interface DetailDialogProps {
  registration: Registration | null;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ACCEPTED: "bg-green-500/10 text-green-400 border-green-500/20",
  DECLINED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function DetailDialog({ registration, onClose }: DetailDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const handleAccept = async () => {
    if (!registration) return;
    setLoading(true);
    const result = await acceptRegistration(registration.id);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
      onClose();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleDecline = async () => {
    if (!registration) return;
    setLoading(true);
    const result = await declineRegistration(
      registration.id,
      declineReason || undefined,
    );
    if (result.success) {
      toast.success(result.message);
      router.refresh();
      onClose();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
    setShowDecline(false);
    setDeclineReason("");
  };

  const handleClose = () => {
    setShowDecline(false);
    setDeclineReason("");
    onClose();
  };

  return (
    <Dialog
      open={!!registration}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent className="border-[#2a2a2a] bg-[#111] text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Registration Details</DialogTitle>
        </DialogHeader>

        {registration && (
          <div className="space-y-4">
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-[#666] uppercase tracking-wider">
                  Name
                </dt>
                <dd className="mt-1 text-sm text-white">{registration.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#666] uppercase tracking-wider">
                  Email
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${registration.email}`}
                    className="text-sm text-cyan-400 hover:underline"
                  >
                    {registration.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#666] uppercase tracking-wider">
                  Event
                </dt>
                <dd className="mt-1">
                  <Badge
                    variant="secondary"
                    className="bg-[#1a1a1a] text-[#a0a0a0]"
                  >
                    {registration.event}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#666] uppercase tracking-wider">
                  Status
                </dt>
                <dd className="mt-1">
                  <Badge
                    variant="outline"
                    className={
                      statusColors[registration.status] ?? "text-[#666]"
                    }
                  >
                    {registration.status}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[#666] uppercase tracking-wider">
                  Registered
                </dt>
                <dd className="mt-1 text-sm text-white">
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "full",
                    timeStyle: "short",
                  }).format(registration.createdAt)}
                </dd>
              </div>
            </dl>

            {registration.status === "PENDING" && (
              <div className="border-t border-[#222] pt-4">
                {showDecline ? (
                  <div className="space-y-3">
                    <Label
                      htmlFor="decline-reason"
                      className="text-xs text-[#888]"
                    >
                      Reason (optional)
                    </Label>
                    <Input
                      id="decline-reason"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="e.g. Event capacity reached"
                      className="border-[#2a2a2a] bg-[#0d0d0d] text-white placeholder-[#444]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleDecline}
                        disabled={loading}
                        className="bg-red-600 text-white hover:bg-red-500"
                      >
                        {loading && (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        )}
                        Confirm Decline
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowDecline(false);
                          setDeclineReason("");
                        }}
                        className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={loading}
                      onClick={handleAccept}
                      className="bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      {loading ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading}
                      onClick={() => setShowDecline(true)}
                      className="border-red-800 text-red-400 hover:bg-red-950/30"
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
