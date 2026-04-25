"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  startSchoolWebsiteProject,
  updateSchoolWebsiteApplicationStatus,
  type SchoolWebsiteApplicationRow,
} from "../actions";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "LIVE", label: "Live" },
  { value: "DECLINED", label: "Declined" },
] as const;

function statusClassName(status: SchoolWebsiteApplicationRow["status"]) {
  switch (status) {
    case "PENDING":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    case "IN_PROGRESS":
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";
    case "LIVE":
      return "border-green-500/20 bg-green-500/10 text-green-400";
    case "DECLINED":
      return "border-red-500/20 bg-red-500/10 text-red-400";
    default:
      return "border-[#2a2a2a] bg-[#0d0d0d] text-[#888]";
  }
}

function domainStateLabel(application: SchoolWebsiteApplicationRow) {
  return application.domainChoice === "HAS_DOMAIN"
    ? "Has domain"
    : "Needs domain";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function ApplicationDetailDialog({
  application,
  onClose,
}: {
  application: SchoolWebsiteApplicationRow | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<SchoolWebsiteApplicationRow["status"]>(
    application?.status ?? "PENDING",
  );
  const [adminNotes, setAdminNotes] = useState(application?.adminNotes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setStatus(application?.status ?? "PENDING");
    setAdminNotes(application?.adminNotes ?? "");
  }, [application]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!application) return;

    setIsSaving(true);
    const result = await updateSchoolWebsiteApplicationStatus(application.id, {
      status,
      adminNotes,
    });
    setIsSaving(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
    onClose();
  };

  return (
    <Dialog open={Boolean(application)} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-[#222] bg-[#111] text-white sm:max-w-4xl">
        {application ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-white">
                {application.schoolName}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-[#222] bg-[#0d0d0d] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#666]">
                    Template
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {application.selectedTemplateName}
                  </p>
                </div>
                <div className="rounded-xl border border-[#222] bg-[#0d0d0d] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#666]">
                    Contact Person
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {application.officialContactName || "Not provided"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#222] bg-[#0d0d0d] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#666]">
                    Domain State
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {domainStateLabel(application)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#222] bg-[#0d0d0d] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#666]">
                    Submitted
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {formatDate(application.createdAt)}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-[#222] bg-[#0d0d0d] p-5">
                  <h3 className="text-sm font-semibold text-white">
                    School Profile
                  </h3>
                  <div className="mt-4 space-y-4 text-sm text-[#cfcfcf]">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                        About School
                      </p>
                      <p className="mt-2 leading-7">{application.aboutSchool}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                        Vision
                      </p>
                      <p className="mt-2 leading-7">{application.vision}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                        Mission
                      </p>
                      <p className="mt-2 leading-7">{application.mission}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                        Core Values
                      </p>
                      <p className="mt-2 leading-7">{application.coreValues}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-[#222] bg-[#0d0d0d] p-5">
                  <h3 className="text-sm font-semibold text-white">
                    Official Contacts
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                        School Email
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {application.officialEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                        School Phone
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {application.officialPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                        Contact Name
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {application.officialContactName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                        Contact Role
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {application.officialContactRole || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                        Contact Phone
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {application.officialContactPhone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                        Contact Email
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {application.officialContactEmail || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                      Address
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white">
                      {application.officialAddress}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                      Website
                    </p>
                    <p className="mt-2 text-sm text-white">
                      {application.officialWebsiteUrl || "Not provided"}
                    </p>
                  </div>
                </section>
              </div>

              <section className="rounded-2xl border border-[#222] bg-[#0d0d0d] p-5">
                <h3 className="text-sm font-semibold text-white">
                  Domain Information
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                      Domain Choice
                    </p>
                    <p className="mt-2 text-sm text-white">
                      {domainStateLabel(application)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                      Existing Domain
                    </p>
                    <p className="mt-2 text-sm text-white">
                      {application.existingDomain || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#666]">
                      Preferred Domains
                    </p>
                    <p className="mt-2 text-sm text-white">
                      {[application.preferredDomain1, application.preferredDomain2]
                        .filter(Boolean)
                        .join(", ") || "Not provided"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[#222] bg-[#0d0d0d] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">
                    Delivery Status
                  </h3>
                  <Badge
                    variant="outline"
                    className={statusClassName(application.status)}
                  >
                    {application.status}
                  </Badge>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                  <div>
                    <Label className="mb-1.5 block text-xs text-[#888]">
                      Status
                    </Label>
                    <Select
                      value={status}
                      onValueChange={(value) =>
                        setStatus(value as SchoolWebsiteApplicationRow["status"])
                      }
                    >
                      <SelectTrigger className="w-full border-[#2a2a2a] bg-[#111] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-[#222] bg-[#111] text-white">
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-1.5 block text-xs text-[#888]">
                      Admin Notes
                    </Label>
                    <Textarea
                      rows={5}
                      value={adminNotes}
                      onChange={(event) => setAdminNotes(event.target.value)}
                      className="resize-none border-[#2a2a2a] bg-[#111] text-white placeholder-[#444]"
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-cyan-500 text-black hover:bg-cyan-400"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Status"
                    )}
                  </Button>
                </div>
              </section>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function ApplicationsManager({
  applications,
}: {
  applications: SchoolWebsiteApplicationRow[];
}) {
  const router = useRouter();
  const [selectedApplication, setSelectedApplication] =
    useState<SchoolWebsiteApplicationRow | null>(null);
  const [quickActionId, setQuickActionId] = useState<string | null>(null);

  const openProjectEditor = (projectId: string) => {
    router.push(`/admin/we-brand-schools/projects/${projectId}/editor`);
  };

  const startProject = async (application: SchoolWebsiteApplicationRow) => {
    setQuickActionId(`${application.id}:START_PROJECT`);
    const result = await startSchoolWebsiteProject(application.id);
    setQuickActionId(null);

    if (!result.success || !result.projectId) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
    router.push(
      result.redirectHref ??
        `/admin/we-brand-schools/projects/${result.projectId}/editor`,
    );
  };

  const runQuickAction = async (
    application: SchoolWebsiteApplicationRow,
    status: SchoolWebsiteApplicationRow["status"],
  ) => {
    setQuickActionId(`${application.id}:${status}`);
    const result = await updateSchoolWebsiteApplicationStatus(application.id, {
      status,
      adminNotes: application.adminNotes ?? "",
    });
    setQuickActionId(null);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-[#222] bg-[#111]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableHead className="text-[#888]">School Name</TableHead>
              <TableHead className="text-[#888]">Template</TableHead>
              <TableHead className="text-[#888]">Contact Person</TableHead>
              <TableHead className="text-[#888]">Domain State</TableHead>
              <TableHead className="text-[#888]">Status</TableHead>
              <TableHead className="text-[#888]">Date Submitted</TableHead>
              <TableHead className="text-right text-[#888]">Quick Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-sm text-[#666]"
                >
                  No school website applications have been submitted yet.
                </TableCell>
              </TableRow>
            ) : (
              applications.map((application) => (
                <TableRow
                  key={application.id}
                  className="cursor-pointer border-[#222] hover:bg-[#171717]"
                  onClick={() => setSelectedApplication(application)}
                >
                  <TableCell className="font-medium text-white">
                    {application.schoolName}
                  </TableCell>
                  <TableCell className="text-[#b3b3b3]">
                    {application.selectedTemplateName}
                  </TableCell>
                  <TableCell className="text-[#b3b3b3]">
                    {application.officialContactName || "Not provided"}
                  </TableCell>
                  <TableCell className="text-[#b3b3b3]">
                    {domainStateLabel(application)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusClassName(application.status)}
                    >
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#888]">
                    {formatDate(application.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedApplication(application);
                        }}
                        className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Button>
                      {application.project ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            openProjectEditor(application.project!.id);
                          }}
                          className="bg-blue-600 text-white hover:bg-blue-500"
                        >
                          Continue Editing
                        </Button>
                      ) : application.status === "PENDING" ||
                        application.status === "IN_PROGRESS" ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            void startProject(application);
                          }}
                          disabled={
                            quickActionId === `${application.id}:START_PROJECT`
                          }
                          className="bg-blue-600 text-white hover:bg-blue-500"
                        >
                          {quickActionId ===
                          `${application.id}:START_PROJECT` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : application.status === "IN_PROGRESS" ? (
                            "Start Editing"
                          ) : (
                            "Start"
                          )}
                        </Button>
                      ) : null}
                      {application.status === "IN_PROGRESS" &&
                      application.project ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            void runQuickAction(application, "LIVE");
                          }}
                          disabled={quickActionId === `${application.id}:LIVE`}
                          className="bg-green-600 text-white hover:bg-green-500"
                        >
                          {quickActionId === `${application.id}:LIVE` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            "Go Live"
                          )}
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ApplicationDetailDialog
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
      />
    </div>
  );
}
