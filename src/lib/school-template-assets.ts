type SchoolTemplateAssetFieldLike = {
  type?: string;
};

type ResolveSchoolTemplateAssetOptions = {
  cloudName?: string;
  proxyCloudinaryRawModels?: boolean;
};

const TEMPLATE_ASSET_PATH_PATTERN =
  /^(assets|css|fonts|img|images|js|lib|scss|school-)/i;
const MODEL_TEMPLATE_ASSET_PATH_PATTERN =
  /^(assets|css|fonts|img|images|js|lib|scss)/i;
const URL_LIKE_ASSET_PATTERN = /^(https?:|data:|blob:|\/|\.\/|\.\.\/)/i;
const CLOUDINARY_RAW_MODEL_EXTENSION_PATTERN = /\.(glb|gltf)$/i;
const CLOUDINARY_RAW_MODEL_PROXY_PATH = "/api/cloudinary/raw";

function toAssetSource(value: unknown) {
  return value === null || value === undefined ? "" : String(value).trim();
}

export function isCloudinaryRawModelUrl(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      url.pathname.includes("/raw/upload/") &&
      CLOUDINARY_RAW_MODEL_EXTENSION_PATTERN.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export function getCloudinaryRawModelProxyUrl(value: string) {
  return `${CLOUDINARY_RAW_MODEL_PROXY_PATH}?url=${encodeURIComponent(value)}`;
}

export function getCloudinaryRawModelUrlFromProxy(
  value: string | null | undefined,
) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value, "https://dexta.local");
    const proxiedUrl = url.searchParams.get("url");

    if (
      url.pathname !== CLOUDINARY_RAW_MODEL_PROXY_PATH ||
      !isCloudinaryRawModelUrl(proxiedUrl)
    ) {
      return null;
    }

    return proxiedUrl;
  } catch {
    return null;
  }
}

export function resolveSchoolTemplateAsset(
  value: unknown,
  field: SchoolTemplateAssetFieldLike,
  options: ResolveSchoolTemplateAssetOptions = {},
) {
  const source = toAssetSource(value);
  const cloudName = options.cloudName ?? "";
  const isModel3d = field.type === "model3d";

  if (!source) {
    return "";
  }

  if (isModel3d) {
    const proxiedRawModelUrl = getCloudinaryRawModelUrlFromProxy(source);
    if (proxiedRawModelUrl) {
      return options.proxyCloudinaryRawModels
        ? getCloudinaryRawModelProxyUrl(proxiedRawModelUrl)
        : proxiedRawModelUrl;
    }

    if (isCloudinaryRawModelUrl(source)) {
      return options.proxyCloudinaryRawModels
        ? getCloudinaryRawModelProxyUrl(source)
        : source;
    }
  }

  if (URL_LIKE_ASSET_PATTERN.test(source)) {
    return source;
  }

  if (
    (isModel3d
      ? MODEL_TEMPLATE_ASSET_PATH_PATTERN
      : TEMPLATE_ASSET_PATH_PATTERN
    ).test(source)
  ) {
    return source;
  }

  if (field.type === "image" && cloudName) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${source}`;
  }

  if (isModel3d && cloudName) {
    const cloudinaryRawModelUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/${source}`;
    return options.proxyCloudinaryRawModels
      ? getCloudinaryRawModelProxyUrl(cloudinaryRawModelUrl)
      : cloudinaryRawModelUrl;
  }

  return source;
}

export function getSchoolTemplateAssetResolverBrowserScript(
  functionName = "resolveSchoolTemplateAsset",
) {
  const safeFunctionName = /^[A-Za-z_$][\w$]*$/.test(functionName)
    ? functionName
    : "resolveSchoolTemplateAsset";

  return `
function ${safeFunctionName}(value, field, options) {
  var source = value === null || value === undefined ? "" : String(value).trim();
  var cloudName = options && options.cloudName ? options.cloudName : "";
  var proxyCloudinaryRawModels = Boolean(options && options.proxyCloudinaryRawModels);
  var isModel3d = field && field.type === "model3d";

  function isCloudinaryRawModelUrl(value) {
    if (!value) return false;
    try {
      var url = new URL(value);
      return url.protocol === "https:" &&
        url.hostname === "res.cloudinary.com" &&
        url.pathname.indexOf("/raw/upload/") !== -1 &&
        /\\.(glb|gltf)$/i.test(url.pathname);
    } catch (error) {
      return false;
    }
  }

  function getCloudinaryRawModelProxyUrl(value) {
    return "/api/cloudinary/raw?url=" + encodeURIComponent(value);
  }

  function getCloudinaryRawModelUrlFromProxy(value) {
    if (!value) return null;
    try {
      var url = new URL(value, "https://dexta.local");
      var proxiedUrl = url.searchParams.get("url");
      if (url.pathname !== "/api/cloudinary/raw" || !isCloudinaryRawModelUrl(proxiedUrl)) {
        return null;
      }
      return proxiedUrl;
    } catch (error) {
      return null;
    }
  }

  if (!source) return "";

  if (isModel3d) {
    var proxiedRawModelUrl = getCloudinaryRawModelUrlFromProxy(source);
    if (proxiedRawModelUrl) {
      return proxyCloudinaryRawModels
        ? getCloudinaryRawModelProxyUrl(proxiedRawModelUrl)
        : proxiedRawModelUrl;
    }

    if (isCloudinaryRawModelUrl(source)) {
      return proxyCloudinaryRawModels
        ? getCloudinaryRawModelProxyUrl(source)
        : source;
    }
  }

  if (/^(https?:|data:|blob:|\\/|\\.\\/|\\.\\.\\/)/i.test(source)) return source;
  if ((isModel3d ? /^(assets|css|fonts|img|images|js|lib|scss)/i : /^(assets|css|fonts|img|images|js|lib|scss|school-)/i).test(source)) return source;
  if (field && field.type === "image" && cloudName) {
    return "https://res.cloudinary.com/" + cloudName + "/image/upload/f_auto,q_auto/" + source;
  }
  if (isModel3d && cloudName) {
    var cloudinaryRawModelUrl = "https://res.cloudinary.com/" + cloudName + "/raw/upload/" + source;
    return proxyCloudinaryRawModels
      ? getCloudinaryRawModelProxyUrl(cloudinaryRawModelUrl)
      : cloudinaryRawModelUrl;
  }
  return source;
}`;
}
