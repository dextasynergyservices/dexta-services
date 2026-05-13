import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_VERSION = "v1";

function getPreviewLinkSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
}

function signProjectId(projectId: string) {
  const secret = getPreviewLinkSecret();

  if (!secret) {
    throw new Error("Preview links require AUTH_SECRET or NEXTAUTH_SECRET.");
  }

  return createHmac("sha256", secret).update(projectId).digest("base64url");
}

export function createSchoolWebsiteProjectPreviewToken(projectId: string) {
  return `${TOKEN_VERSION}.${signProjectId(projectId)}`;
}

export function isValidSchoolWebsiteProjectPreviewToken({
  projectId,
  token,
}: {
  projectId: string;
  token?: string | null;
}) {
  if (!token) return false;

  try {
    const expected = createSchoolWebsiteProjectPreviewToken(projectId);
    const tokenBuffer = Buffer.from(token);
    const expectedBuffer = Buffer.from(expected);

    return (
      tokenBuffer.length === expectedBuffer.length &&
      timingSafeEqual(tokenBuffer, expectedBuffer)
    );
  } catch {
    return false;
  }
}

export function getSchoolWebsiteProjectPreviewHref({
  projectId,
  pageSlug,
}: {
  projectId: string;
  pageSlug: string;
}) {
  const token = createSchoolWebsiteProjectPreviewToken(projectId);

  return `/webrandschools/project-preview/${encodeURIComponent(
    projectId,
  )}/${encodeURIComponent(pageSlug)}?token=${encodeURIComponent(token)}`;
}
