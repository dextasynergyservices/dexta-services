"use client";

import { useState } from "react";
import { Check, X, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  declineReason: string | null;
  formData: string;
  createdAt: Date;
}

interface FormField {
  name: string;
  label: string;
  type: string;
}

interface RegistrationTableProps {
  registrations: Registration[];
  formFields: FormField[];
}

const statusConfig = {
  PENDING: { label: "Pending", className: "bg-amber-500/10 text-amber-400" },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-emerald-500/10 text-emerald-400",
  },
  DECLINED: { label: "Declined", className: "bg-red-500/10 text-red-400" },
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RegistrationTable({
  registrations,
  formFields,
}: RegistrationTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Registration | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [declineDialog, setDeclineDialog] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const handleAccept = async (id: string) => {
    setLoadingId(id);
    const result = await acceptRegistration(id);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setLoadingId(null);
  };

  const handleDecline = async () => {
    if (!declineDialog) return;
    setLoadingId(declineDialog);
    const result = await declineRegistration(
      declineDialog,
      declineReason || undefined,
    );
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setLoadingId(null);
    setDeclineDialog(null);
    setDeclineReason("");
  };

  const parseFormData = (json: string): Record<string, string> => {
    try {
      return JSON.parse(json);
    } catch {
      return {};
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-[#222] bg-[#111]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableHead scope="col" className="text-[#888]">
                Name
              </TableHead>
              <TableHead scope="col" className="text-[#888]">
                Email
              </TableHead>
              <TableHead scope="col" className="text-[#888]">
                Status
              </TableHead>
              <TableHead scope="col" className="text-[#888]">
                Date
              </TableHead>
              <TableHead scope="col" className="w-32 text-[#888]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-[#666]"
                >
                  No registrations yet
                </TableCell>
              </TableRow>
            ) : (
              registrations.map((reg) => {
                const config = statusConfig[reg.status];
                const isLoading = loadingId === reg.id;

                return (
                  <TableRow
                    key={reg.id}
                    className="border-[#1a1a1a] hover:bg-[#1a1a1a]"
                  >
                    <TableCell className="font-medium text-white">
                      {reg.name}
                    </TableCell>
                    <TableCell className="text-[#a0a0a0]">
                      {reg.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={config.className}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#666]">
                      {formatDate(reg.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelected(reg)}
                          className="h-8 w-8 p-0 text-[#666] hover:text-cyan-400"
                          aria-label={`View details for ${reg.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {reg.status === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isLoading}
                              onClick={() => handleAccept(reg.id)}
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-400"
                              aria-label={`Accept ${reg.name}`}
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isLoading}
                              onClick={() => setDeclineDialog(reg.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-400"
                              aria-label={`Decline ${reg.name}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto border-[#2a2a2a] bg-[#111] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid gap-3">
                <div>
                  <p className="text-xs text-[#666]">Email</p>
                  <a
                    href={`mailto:${selected.email}`}
                    className="text-sm text-cyan-400"
                  >
                    {selected.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-[#666]">Status</p>
                  <Badge
                    variant="secondary"
                    className={statusConfig[selected.status].className}
                  >
                    {statusConfig[selected.status].label}
                  </Badge>
                </div>
                {selected.declineReason && (
                  <div>
                    <p className="text-xs text-[#666]">Decline Reason</p>
                    <p className="text-sm text-[#a0a0a0]">
                      {selected.declineReason}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-[#666]">Registered</p>
                  <p className="text-sm text-[#a0a0a0]">
                    {formatDate(selected.createdAt)}
                  </p>
                </div>

                {/* Dynamic form data */}
                {formFields.map((field) => {
                  const data = parseFormData(selected.formData);
                  const value = data[field.name];
                  if (!value) return null;
                  return (
                    <div key={field.name}>
                      <p className="text-xs text-[#666]">{field.label}</p>
                      {field.type === "URL" && value ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-cyan-400"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm text-[#a0a0a0]">{value}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {selected.status === "PENDING" && (
                <div className="flex gap-2 border-t border-[#222] pt-4">
                  <Button
                    size="sm"
                    disabled={loadingId === selected.id}
                    onClick={() => {
                      handleAccept(selected.id);
                      setSelected(null);
                    }}
                    className="bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loadingId === selected.id}
                    onClick={() => {
                      setSelected(null);
                      setDeclineDialog(selected.id);
                    }}
                    className="border-red-800 text-red-400 hover:bg-red-950/30"
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Decline reason dialog */}
      <Dialog
        open={!!declineDialog}
        onOpenChange={(o) => !o && setDeclineDialog(null)}
      >
        <DialogContent className="border-[#2a2a2a] bg-[#111] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              Decline Registration
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="decline-reason"
                className="mb-1.5 text-xs text-[#888]"
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
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeclineDialog(null);
                  setDeclineReason("");
                }}
                className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDecline}
                disabled={!!loadingId}
                className="bg-red-600 text-white hover:bg-red-500"
              >
                {loadingId ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Decline
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
