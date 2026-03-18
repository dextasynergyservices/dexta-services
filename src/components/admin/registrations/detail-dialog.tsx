"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
  return (
    <Dialog open={!!registration} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-[#2a2a2a] bg-[#111] text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Registration Details</DialogTitle>
        </DialogHeader>

        {registration && (
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
                  className={statusColors[registration.status] ?? "text-[#666]"}
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
        )}
      </DialogContent>
    </Dialog>
  );
}
