type TransformValue = string | number;

export type TransformOptions = Record<
  string,
  TransformValue | null | undefined
>;

const CLOUDINARY_IMAGE_UPLOAD_URL_PATTERN =
  /^https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\//i;

function getConfiguredCloudinaryCloudName() {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ?? "";
}

function getCloudinaryImageUploadBaseUrl(
  cloudName = getConfiguredCloudinaryCloudName(),
) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/`;
}

function serializeTransforms(options?: TransformOptions) {
  if (!options) {
    return "";
  }

  const transforms = Object.entries(options)
    .filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    )
    .map(([key, value]) => `${key}_${value}`)
    .join(",");

  return transforms ? `${transforms}/` : "";
}

export function getCloudinaryUrl(publicId: string, options?: TransformOptions) {
  const defaultOptions = {
    f: "auto",
    q: "auto",
    ...options,
  };

  return `${getCloudinaryImageUploadBaseUrl()}${serializeTransforms(defaultOptions)}${publicId}`;
}

export function isCloudinaryUrl(src: string) {
  return CLOUDINARY_IMAGE_UPLOAD_URL_PATTERN.test(src);
}

export function getCloudinaryPublicId(value: string) {
  if (!value) {
    return null;
  }

  const match = value.match(CLOUDINARY_IMAGE_UPLOAD_URL_PATTERN);
  if (!match) {
    return value;
  }

  const configuredCloudName = getConfiguredCloudinaryCloudName();
  if (!configuredCloudName || match[1] !== configuredCloudName) {
    return value;
  }

  try {
    const url = new URL(value);
    const uploadPath = url.pathname.split("/image/upload/")[1];

    if (!uploadPath) {
      return null;
    }

    const segments = uploadPath.split("/").filter(Boolean);
    let publicIdSegments = segments;

    if (
      publicIdSegments[0]?.includes("_") ||
      publicIdSegments[0]?.includes(",")
    ) {
      publicIdSegments = publicIdSegments.slice(1);
    }

    if (/^v\d+$/.test(publicIdSegments[0] ?? "")) {
      publicIdSegments = publicIdSegments.slice(1);
    }

    return publicIdSegments.length > 0 ? publicIdSegments.join("/") : null;
  } catch {
    return null;
  }
}
