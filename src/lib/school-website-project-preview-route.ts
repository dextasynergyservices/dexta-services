import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  buildSchoolTemplateSourceSnapshot,
  isSchoolTemplateSourceSnapshot,
  parseSchoolTemplateProjectContent,
  sanitizeSchoolTemplateProjectContent,
  syncSchoolTemplateProjectContentWithManifest,
  validateSchoolTemplateProjectContentReferences,
} from "@/lib/school-template-project-content";
import { getSchoolTemplateManifest } from "@/lib/school-template-manifests";
import { renderSchoolTemplatePreview } from "@/lib/school-template-preview-renderer";
import { weBrandSchoolsPrisma } from "@/lib/we-brand-schools-prisma";

export async function renderAdminSchoolWebsiteProjectPreview({
  projectId,
  pageSlug,
  previewSearch,
}: {
  projectId: string;
  pageSlug: string;
  previewSearch?: string;
}) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await weBrandSchoolsPrisma.schoolWebsiteProject.findUnique({
    where: { id: projectId },
    select: {
      templateSlug: true,
      contentJson: true,
      sourceSnapshot: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const parsedContent = parseSchoolTemplateProjectContent(project.contentJson);
  if (!parsedContent.success) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const manifest =
    getSchoolTemplateManifest(project.templateSlug) ??
    getSchoolTemplateManifest(parsedContent.data.templateSlug);
  const sourceSnapshot = isSchoolTemplateSourceSnapshot(project.sourceSnapshot)
    ? project.sourceSnapshot
    : manifest
      ? buildSchoolTemplateSourceSnapshot(manifest)
      : null;

  if (!sourceSnapshot) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const syncedProjectContent = syncSchoolTemplateProjectContentWithManifest({
    content: parsedContent.data,
    sourceSnapshot,
    rawContent: project.contentJson,
    templateSlug: project.templateSlug,
  });

  const content = sanitizeSchoolTemplateProjectContent(
    syncedProjectContent.contentJson,
    syncedProjectContent.sourceSnapshot,
  );
  const referenceIssues = validateSchoolTemplateProjectContentReferences(
    content,
    syncedProjectContent.sourceSnapshot,
  );

  if (referenceIssues.length > 0) {
    return NextResponse.json({ error: referenceIssues[0] }, { status: 400 });
  }

  try {
    const html = await renderSchoolTemplatePreview({
      content,
      sourceSnapshot: syncedProjectContent.sourceSnapshot,
      pageSlug,
      previewRouteBase: `/admin/we-brand-schools/projects/${encodeURIComponent(
        projectId,
      )}/preview`,
      previewSearch,
    });

    if (!html) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    console.error("[schoolWebsiteProjectPreview]", error);
    return NextResponse.json(
      { error: "Failed to render project preview" },
      { status: 500 },
    );
  }
}
