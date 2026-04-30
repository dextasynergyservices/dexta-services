import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";

type AllowedCloudinaryRawModelSource = {
  url: URL;
  extension: ".glb" | ".gltf";
};

const ALLOWED_MODEL_EXTENSIONS = new Set([".glb", ".gltf"]);
const PUBLIC_ID_PATTERN = /^[A-Za-z0-9/_.,-]+$/;

function getModelExtension(pathname: string) {
  const extension = pathname.toLowerCase().match(/\.(glb|gltf)$/)?.[0];
  return extension && ALLOWED_MODEL_EXTENSIONS.has(extension)
    ? (extension as ".glb" | ".gltf")
    : null;
}

function getDefaultContentType(extension: ".glb" | ".gltf") {
  return extension === ".gltf" ? "model/gltf+json" : "model/gltf-binary";
}

function getDevelopmentErrorDetails(details: Record<string, unknown>) {
  return process.env.NODE_ENV === "production" ? {} : { details };
}

function isAllowedPublicId(value: string) {
  if (
    !value ||
    value.startsWith("/") ||
    value.startsWith("\\") ||
    value.includes("?") ||
    value.includes("#") ||
    /^[a-z][a-z0-9+.-]*:/i.test(value)
  ) {
    return false;
  }

  return (
    PUBLIC_ID_PATTERN.test(value) &&
    !value.split("/").some((segment) => segment === "." || segment === "..") &&
    Boolean(getModelExtension(value))
  );
}

function getCloudinaryRawModelUrlFromPublicId(value: string | null) {
  const publicId = value?.trim();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();

  if (!publicId || !cloudName || !isAllowedPublicId(publicId)) {
    return null;
  }

  const encodedPublicId = publicId
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return new URL(
    `https://res.cloudinary.com/${cloudName}/raw/upload/${encodedPublicId}`,
  );
}

function getAllowedCloudinaryUrl(
  value: string | null,
): AllowedCloudinaryRawModelSource | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") {
      return null;
    }

    const pathSegments = url.pathname.split("/").filter(Boolean);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
    if (cloudName && pathSegments[0] !== cloudName) {
      return null;
    }

    if (pathSegments[1] !== "raw" || pathSegments[2] !== "upload") {
      return null;
    }

    const extension = getModelExtension(url.pathname);
    if (!extension) {
      return null;
    }

    return { url, extension };
  } catch {
    return null;
  }
}

function getAllowedCloudinaryRawModelSource(
  requestUrl: string,
): AllowedCloudinaryRawModelSource | null {
  const searchParams = new URL(requestUrl).searchParams;
  const urlValue = searchParams.get("url")?.trim() ?? null;
  const publicIdValue = searchParams.get("publicId")?.trim() ?? null;
  const sourceUrl =
    getAllowedCloudinaryUrl(urlValue) ??
    getAllowedCloudinaryUrl(
      getCloudinaryRawModelUrlFromPublicId(publicIdValue)?.toString() ?? null,
    ) ??
    getAllowedCloudinaryUrl(
      getCloudinaryRawModelUrlFromPublicId(urlValue)?.toString() ?? null,
    );

  return sourceUrl;
}

export async function GET(request: globalThis.Request) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const source = getAllowedCloudinaryRawModelSource(request.url);

  if (!source) {
    return NextResponse.json(
      {
        error: "Invalid model URL",
        ...getDevelopmentErrorDetails({
          acceptedExtensions: Array.from(ALLOWED_MODEL_EXTENSIONS),
          acceptedInputs:
            "Cloudinary raw model URL, publicId query parameter, or raw public ID in the url query parameter.",
        }),
      },
      { status: 400 },
    );
  }

  let response: globalThis.Response;
  try {
    response = await fetch(source.url);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to request model",
        ...getDevelopmentErrorDetails({
          sourceUrl: source.url.toString(),
          message: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");

    return NextResponse.json(
      {
        error: "Failed to load model",
        ...getDevelopmentErrorDetails({
          sourceUrl: source.url.toString(),
          status: response.status,
          statusText: response.statusText,
          body: body.slice(0, 500),
        }),
      },
      { status: response.status },
    );
  }

  const headers = new globalThis.Headers({
    "Cache-Control": "private, max-age=300",
    "Content-Type":
      response.headers.get("content-type") ??
      getDefaultContentType(source.extension),
  });
  const contentLength = response.headers.get("content-length");
  if (contentLength && /^\d+$/.test(contentLength)) {
    headers.set("Content-Length", contentLength);
  }

  return new NextResponse(response.body, {
    headers,
  });
}
