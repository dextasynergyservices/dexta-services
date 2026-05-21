import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TEMPLATE_ROOT = path.join(
  process.cwd(),
  "src",
  "app",
  "(public)",
  "dexta-academy-3",
);

const CONTENT_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function injectBaseHref(html: string) {
  if (/<base\s/i.test(html)) {
    return html;
  }

  const baseMarkup = '<base href="/dexta-academy-3/">';
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(
      /<head[^>]*>/i,
      (match) => `${match}\n    ${baseMarkup}`,
    );
  }

  return `${baseMarkup}\n${html}`;
}

function getContentType(filePath: string) {
  return (
    CONTENT_TYPES[path.extname(filePath).toLowerCase()] ??
    "application/octet-stream"
  );
}

function isSafePathSegment(segment: string) {
  return (
    segment !== "" &&
    segment !== "." &&
    segment !== ".." &&
    !segment.includes("/") &&
    !segment.includes("\\")
  );
}

export async function GET(
  _request: globalThis.Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: pathSegments } = await params;

  if (!pathSegments.length || !pathSegments.every(isSafePathSegment)) {
    return NextResponse.json(
      { error: "Template asset not found" },
      { status: 404 },
    );
  }

  const requestedPath = path.resolve(TEMPLATE_ROOT, ...pathSegments);
  const rootWithSeparator = `${path.resolve(TEMPLATE_ROOT)}${path.sep}`;

  if (!requestedPath.startsWith(rootWithSeparator)) {
    return NextResponse.json(
      { error: "Template asset not found" },
      { status: 404 },
    );
  }

  try {
    const file = await readFile(requestedPath);
    const contentType = getContentType(requestedPath);

    return new NextResponse(
      contentType.startsWith("text/html")
        ? injectBaseHref(file.toString("utf8"))
        : new Uint8Array(file),
      {
        headers: {
          "Content-Type": contentType,
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Template asset not found" },
      { status: 404 },
    );
  }
}
