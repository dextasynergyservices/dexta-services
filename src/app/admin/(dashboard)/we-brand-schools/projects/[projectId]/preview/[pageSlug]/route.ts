import { renderAdminSchoolWebsiteProjectPreview } from "@/lib/school-website-project-preview-route";

export const dynamic = "force-dynamic";

export async function GET(
  _request: globalThis.Request,
  { params }: { params: Promise<{ projectId: string; pageSlug: string }> },
) {
  const { projectId, pageSlug } = await params;

  return renderAdminSchoolWebsiteProjectPreview({ projectId, pageSlug });
}
