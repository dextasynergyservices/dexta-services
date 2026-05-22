import { NextResponse } from "next/server";
import {
  applySchoolNameFallbackToProjectContent,
  buildSchoolTemplateSourceSnapshot,
  isSchoolTemplateSourceSnapshot,
  parseSchoolTemplateProjectContent,
  sanitizeSchoolTemplateProjectContent,
  syncSchoolTemplateProjectContentWithManifest,
  validateSchoolTemplateProjectContentReferences,
} from "@/lib/school-template-project-content";
import { getSchoolTemplateManifest } from "@/lib/school-template-manifests";
import { isValidSchoolWebsiteProjectPreviewToken } from "@/lib/school-template-preview-links";
import { renderSchoolTemplatePreview } from "@/lib/school-template-preview-renderer";
import { weBrandSchoolsPrisma } from "@/lib/we-brand-schools-prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: globalThis.Request,
  { params }: { params: Promise<{ projectId: string; pageSlug: string }> },
) {
  const { projectId, pageSlug } = await params;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!isValidSchoolWebsiteProjectPreviewToken({ projectId, token })) {
    return NextResponse.json(
      { error: "Invalid preview link" },
      { status: 404 },
    );
  }

  const project = await weBrandSchoolsPrisma.schoolWebsiteProject.findUnique({
    where: { id: projectId },
    select: {
      schoolName: true,
      templateSlug: true,
      contentJson: true,
      sourceSnapshot: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Preview not found" }, { status: 404 });
  }

  const parsedContent = parseSchoolTemplateProjectContent(project.contentJson);
  if (!parsedContent.success) {
    return NextResponse.json({ error: "Preview not found" }, { status: 404 });
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
    return NextResponse.json({ error: "Preview not found" }, { status: 404 });
  }

  const syncedProjectContent = syncSchoolTemplateProjectContentWithManifest({
    content: parsedContent.data,
    sourceSnapshot,
    rawContent: project.contentJson,
    templateSlug: project.templateSlug,
  });

  const content = applySchoolNameFallbackToProjectContent(
    sanitizeSchoolTemplateProjectContent(
      syncedProjectContent.contentJson,
      syncedProjectContent.sourceSnapshot,
    ),
    project.schoolName,
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
      previewRouteBase: `/webrandschools/project-preview/${encodeURIComponent(
        projectId,
      )}`,
      previewSearch: url.search,
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
    console.error("[schoolWebsitePublicProjectPreview]", error);
    return NextResponse.json(
      { error: "Failed to render project preview" },
      { status: 500 },
    );
  }
}
