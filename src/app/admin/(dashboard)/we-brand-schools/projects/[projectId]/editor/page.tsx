import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { Button } from "@/components/ui/button";
import { WeBrandSchoolsAdminTabs } from "../../../_components/we-brand-schools-admin-tabs";
import { getSchoolWebsiteProject } from "../../../actions";
import { SchoolWebsiteProjectEditor } from "./school-website-project-editor";

export const metadata = {
  title: "School Website Editor — Admin",
};

export const dynamic = "force-dynamic";

export default async function SchoolWebsiteProjectEditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const result = await getSchoolWebsiteProject(projectId);
  const project = result.project;

  if (!result.success || !project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title={`${project.schoolName} Editor`}
        description="Edit the copied website project attached to this school application."
        actions={
          <Button
            asChild
            variant="outline"
            className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
          >
            <Link href="/admin/we-brand-schools/applications">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Applications
            </Link>
          </Button>
        }
      />

      <WeBrandSchoolsAdminTabs />

      <SchoolWebsiteProjectEditor
        projectId={project.id}
        applicationId={project.applicationId}
        projectStatus={project.status}
        content={project.contentJson}
        sourceSnapshot={project.sourceSnapshot}
        updatedAt={project.updatedAt.toISOString()}
        lastExportedAt={project.lastExportedAt?.toISOString() ?? null}
        exportZipUrl={project.exportZipUrl ?? null}
      />
    </div>
  );
}
