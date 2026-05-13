"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Eye, Loader2, Package, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
  exportSchoolWebsiteProject,
  type SchoolWebsiteProjectRow,
} from "../actions";

type ProjectsManagerProps = {
  projects: SchoolWebsiteProjectRow[];
};

function statusClassName(status: SchoolWebsiteProjectRow["status"]) {
  switch (status) {
    case "DRAFT":
      return "border-[#2a2a2a] bg-[#0d0d0d] text-[#888]";
    case "IN_PROGRESS":
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";
    case "READY_FOR_EXPORT":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    case "EXPORTED":
      return "border-green-500/20 bg-green-500/10 text-green-400";
    case "LIVE":
      return "border-cyan-500/20 bg-cyan-500/10 text-cyan-400";
    default:
      return "border-[#2a2a2a] bg-[#0d0d0d] text-[#888]";
  }
}

function formatDate(value: Date | null) {
  if (!value) {
    return "Not exported";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getProjectEditorHref(projectId: string) {
  return `/admin/we-brand-schools/projects/${projectId}/editor`;
}

function getProjectPreviewHref(project: SchoolWebsiteProjectRow) {
  return `/admin/we-brand-schools/projects/${project.id}/preview/${project.previewPageSlug}`;
}

export function ProjectsManager({ projects }: ProjectsManagerProps) {
  const router = useRouter();
  const [exportingProjectId, setExportingProjectId] = useState<string | null>(
    null,
  );

  const exportProject = async (project: SchoolWebsiteProjectRow) => {
    const projectId = project.id;
    setExportingProjectId(projectId);
    const result = await exportSchoolWebsiteProject(
      projectId,
      project.applicationId,
    );
    setExportingProjectId(null);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#222] bg-[#111]">
      <Table>
        <TableHeader>
          <TableRow className="border-[#222] hover:bg-transparent">
            <TableHead className="text-[#888]">School Name</TableHead>
            <TableHead className="text-[#888]">Template</TableHead>
            <TableHead className="text-[#888]">Contact Email</TableHead>
            <TableHead className="text-[#888]">Project Status</TableHead>
            <TableHead className="text-[#888]">Last Edited</TableHead>
            <TableHead className="text-[#888]">Last Exported</TableHead>
            <TableHead className="text-right text-[#888]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-12 text-center text-sm text-[#666]"
              >
                No website projects have been started yet.
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow
                key={project.id}
                className="border-[#222] hover:bg-[#171717]"
              >
                <TableCell>
                  <div>
                    <p className="font-medium text-white">
                      {project.schoolName}
                    </p>
                    <p className="mt-1 text-xs text-[#666]">
                      {project.templateSlug}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-[#b3b3b3]">
                  {project.templateName}
                </TableCell>
                <TableCell className="text-[#b3b3b3]">
                  {project.contactEmail ?? "Not provided"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusClassName(project.status)}
                  >
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#888]">
                  {formatDate(project.updatedAt)}
                </TableCell>
                <TableCell className="text-[#888]">
                  {formatDate(project.lastExportedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      asChild
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
                    >
                      <Link href={getProjectEditorHref(project.id)}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      asChild
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
                    >
                      <Link
                        href={getProjectPreviewHref(project)}
                        target="_blank"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Preview
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void exportProject(project)}
                      disabled={exportingProjectId === project.id}
                      className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
                    >
                      {exportingProjectId === project.id ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Package className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Export
                    </Button>
                    {project.exportZipUrl ? (
                      <Button
                        asChild
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
                      >
                        <a
                          href={project.exportZipUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" />
                          Download
                        </a>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled
                        className="border-[#2a2a2a] text-[#555]"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        Download
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
