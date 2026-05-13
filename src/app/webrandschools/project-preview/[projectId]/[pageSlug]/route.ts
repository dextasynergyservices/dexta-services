import { NextResponse } from "next/server";
import {
  isSchoolTemplateSourceSnapshot,
  parseSchoolTemplateProjectContent,
  sanitizeSchoolTemplateProjectContent,
  syncSchoolTemplateProjectContentWithManifest,
  validateSchoolTemplateProjectContentReferences,
} from "@/lib/school-template-project-content";
import { isValidSchoolWebsiteProjectPreviewToken } from "@/lib/school-template-preview-links";
import { renderSchoolTemplatePreview } from "@/lib/school-template-preview-renderer";
import { weBrandSchoolsPrisma } from "@/lib/we-brand-schools-prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: globalThis.Request,
  { params }: { params: Promise<{ projectId: string; pageSlug: string }> },
) {
  const { projectId, pageSlug } = await params;
  const token = new URL(request.url).searchParams.get("token");

  if (!isValidSchoolWebsiteProjectPreviewToken({ projectId, token })) {
    return NextResponse.json(
      { error: "Invalid preview link" },
      { status: 404 },
    );
  }

  const project = await weBrandSchoolsPrisma.schoolWebsiteProject.findUnique({
    where: { id: projectId },
    select: {
      contentJson: true,
      sourceSnapshot: true,
    },
  });

  if (!project || !isSchoolTemplateSourceSnapshot(project.sourceSnapshot)) {
    return NextResponse.json({ error: "Preview not found" }, { status: 404 });
  }

  const parsedContent = parseSchoolTemplateProjectContent(project.contentJson);
  if (!parsedContent.success) {
    return NextResponse.json({ error: "Preview not found" }, { status: 404 });
  }

  const syncedProjectContent = syncSchoolTemplateProjectContentWithManifest({
    content: parsedContent.data,
    sourceSnapshot: project.sourceSnapshot,
    rawContent: project.contentJson,
  });

  const rawReferenceIssues = validateSchoolTemplateProjectContentReferences(
    syncedProjectContent.contentJson,
    syncedProjectContent.sourceSnapshot,
  );
  if (rawReferenceIssues.length > 0) {
    return NextResponse.json({ error: rawReferenceIssues[0] }, { status: 400 });
  }

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
