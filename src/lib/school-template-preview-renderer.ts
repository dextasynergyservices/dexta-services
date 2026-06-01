import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  getSchoolTemplateAssetResolverBrowserScript,
  resolveSchoolTemplateAsset,
} from "@/lib/school-template-assets";
import { prepareDextaAcademyThreeContactRenderingContent } from "@/lib/dexta-academy-3-contact-rendering";
import {
  buildSchoolTemplateSourceSnapshot,
  type SchoolTemplateProjectContent,
  type SchoolTemplateProjectPageContent,
  type SchoolTemplateProjectSectionContent,
  type SchoolTemplateProjectSectionSnapshot,
  type SchoolTemplateSourceSnapshot,
} from "@/lib/school-template-project-content";
import { getSchoolTemplateManifest } from "@/lib/school-template-manifests";

type RenderSchoolTemplatePreviewInput = {
  content: SchoolTemplateProjectContent;
  sourceSnapshot: SchoolTemplateSourceSnapshot;
  pageSlug: string;
  previewRouteBase?: string;
  previewSearch?: string;
};

type PreviewNavigationContext = {
  routeBase: string;
  search?: string;
  currentPageSlug: string;
};

const FONT_AWESOME_SIX_CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css";

function escapeScriptJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function getTemplateBaseHref(previewPath: string) {
  const parts = previewPath.split("/");
  parts.pop();
  return `${parts.join("/") || ""}/`;
}

function injectIntoHead(html: string, markup: string) {
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (match) => `${match}\n${markup}`);
  }

  return `${markup}\n${html}`;
}

function injectBeforeBodyClose(html: string, markup: string) {
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${markup}\n</body>`);
  }

  return `${html}\n${markup}`;
}

function ensureTemplateOneFontAwesomeSix(html: string) {
  const fontAwesomeLink = `<link href="${FONT_AWESOME_SIX_CSS_URL}" rel="stylesheet">`;

  if (/font-awesome\/6\.[\d.]+\/css\/all\.min\.css/i.test(html)) {
    return html;
  }

  if (/font-awesome\/5\.[\d.]+\/css\/all\.min\.css/i.test(html)) {
    return html.replace(
      /https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/5\.[\d.]+\/css\/all\.min\.css/gi,
      FONT_AWESOME_SIX_CSS_URL,
    );
  }

  return injectIntoHead(html, fontAwesomeLink);
}

function injectAfterBodyOpen(html: string, markup: string) {
  if (/<body[^>]*>/i.test(html)) {
    return html.replace(/<body[^>]*>/i, (match) => `${match}\n${markup}`);
  }

  return `${markup}\n${html}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>]/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      default:
        return character;
    }
  });
}

function escapeHtmlAttribute(value: string) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function injectBeforeHeadClose(html: string, markup: string) {
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${markup}\n</head>`);
  }
  return `${markup}\n${html}`;
}

function getPreviewBootMarkup(templateSlug?: string) {
  if (templateSlug === "dexta-academy-3") {
    return "";
  }

  if (templateSlug === "dexta-academy-1") {
    return `<script>document.documentElement.setAttribute("data-dexta-project-preview","loading");window.setTimeout(function(){if(document.documentElement.getAttribute("data-dexta-project-preview")==="loading"){document.documentElement.setAttribute("data-dexta-project-preview","ready");}},30000);</script><style>html[data-dexta-project-preview="loading"] body{opacity:1!important;}html[data-dexta-project-preview="loading"] #spinner{display:flex!important;opacity:1!important;visibility:visible!important;pointer-events:auto!important;transition:opacity .55s ease-out,visibility 0s linear .55s!important;}html[data-dexta-project-preview="loading"] #spinner,html[data-dexta-project-preview="loading"] #spinner *{animation-play-state:running!important;}html[data-dexta-project-preview="ready"] body{opacity:1!important;}html[data-dexta-project-preview="ready"] #spinner.dexta-template-one-loader{display:flex!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important;transition:opacity .55s ease-out,visibility 0s linear .55s!important;}html[data-dexta-project-preview="ready"] #spinner.dexta-template-one-loader>*{opacity:1!important;visibility:visible!important;}</style>`;
  }

  return `<script>document.documentElement.setAttribute("data-dexta-project-preview","loading");window.setTimeout(function(){if(document.documentElement.getAttribute("data-dexta-project-preview")==="loading"){document.documentElement.setAttribute("data-dexta-project-preview","ready");}},2500);</script><style>html[data-dexta-project-preview="loading"] body{opacity:0!important;}html[data-dexta-project-preview="loading"] *{animation-play-state:paused!important;}html[data-dexta-project-preview="ready"] body{opacity:1!important;transition:opacity .16s ease;}</style>`;
}

function removeHero3dModuleScript(html: string) {
  return html.replace(
    /<script\b(?=[^>]*\btype=["']module["'])(?=[^>]*\bsrc=["']js\/hero-3d\.js["'])[^>]*>\s*<\/script>/i,
    "",
  );
}

function createDextaAcademyThreeHomeHref(anchorId: string, pageSlug: string) {
  return pageSlug === "home" ? `#${anchorId}` : `index.html#${anchorId}`;
}

function createDextaAcademyThreeNavLink({
  href,
  label,
  page,
  currentPage,
  style,
  currentStyle,
}: {
  href: string;
  label: string;
  page?: string;
  currentPage: string;
  style?: string;
  currentStyle?: string;
}) {
  if (!href || !label) {
    return "";
  }

  const currentAttribute = page === currentPage ? ' aria-current="page"' : "";
  const styleAttribute =
    style || (page === currentPage ? currentStyle : "")
      ? ` style="${escapeHtmlAttribute(
          page === currentPage && currentStyle ? currentStyle : (style ?? ""),
        )}"`
      : "";

  return `<a href="${escapeHtmlAttribute(
    href,
  )}"${currentAttribute}${styleAttribute}>${escapeHtml(label)}</a>`;
}

function getDextaAcademyThreeHeaderFields(
  content: SchoolTemplateProjectContent | undefined,
) {
  return content?.sharedSections.find((section) => section.id === "site-header")
    ?.fields;
}

function getDextaAcademyThreeHeaderFieldValue(
  content: SchoolTemplateProjectContent | undefined,
  key: string,
) {
  const fields = getDextaAcademyThreeHeaderFields(content);
  if (!fields || !Object.prototype.hasOwnProperty.call(fields, key)) {
    return undefined;
  }

  return fields[key];
}

function getDextaAcademyThreeHeaderText(
  content: SchoolTemplateProjectContent | undefined,
  key: string,
  fallback: string,
) {
  const value = getDextaAcademyThreeHeaderFieldValue(content, key);
  if (value === undefined) {
    return fallback;
  }

  return value === null ? "" : String(value).trim();
}

function getDextaAcademyThreeSectionFieldValue(
  content: SchoolTemplateProjectContent | undefined,
  pageSlug: string,
  sectionId: string,
  key: string,
) {
  const fields = content?.pages
    .find((page) => page.slug === pageSlug)
    ?.sections.find((section) => section.id === sectionId)?.fields;

  if (!fields || !Object.prototype.hasOwnProperty.call(fields, key)) {
    return undefined;
  }

  return fields[key];
}

function getDextaAcademyThreeSectionText(
  content: SchoolTemplateProjectContent | undefined,
  pageSlug: string,
  sectionId: string,
  key: string,
  fallback: string,
) {
  const value = getDextaAcademyThreeSectionFieldValue(
    content,
    pageSlug,
    sectionId,
    key,
  );
  if (value === undefined) {
    return fallback;
  }

  return value === null ? "" : String(value).trim();
}

function getDextaAcademyThreeNumber(
  content: SchoolTemplateProjectContent | undefined,
  key: string,
  fallback: number,
) {
  const value = getDextaAcademyThreeHeaderFieldValue(content, key);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function escapeCssValue(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  return text.replace(/[<>{};]/g, "");
}

function getGoogleFontFamilyName(value: unknown) {
  const text = String(value ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");
  if (!text) return "";
  const family =
    text
      .split(",")[0]
      ?.trim()
      .replace(/^["']|["']$/g, "") ?? "";
  if (
    !family ||
    /^(inherit|initial|unset|serif|sans-serif|monospace|cursive|fantasy|system-ui)$/i.test(
      family,
    )
  ) {
    return "";
  }

  return family;
}

function getGoogleFontStylesheetUrl(value: unknown) {
  const family = getGoogleFontFamilyName(value);
  if (!family) return "";
  const encodedFamily = encodeURIComponent(family).replace(/%20/g, "+");
  return `https://fonts.googleapis.com/css2?family=${encodedFamily}:ital,wght@0,100..900;1,100..900&display=swap`;
}

function collectRichTextFontFamilies(value: unknown) {
  const text = String(value ?? "");
  if (!text || !/font-family\s*:/i.test(text)) return [];

  const families = new Set<string>();
  const pattern = /font-family\s*:\s*([^;"']*(?:"[^"]*"|'[^']*')?[^;]*)/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    const family = getGoogleFontFamilyName(match[1]);
    if (family) families.add(family);
  }

  return Array.from(families);
}

function collectContentRichTextFontFamilies(
  content: SchoolTemplateProjectContent,
) {
  const families = new Set<string>();
  const scanFields = (fields: Record<string, unknown>) => {
    Object.values(fields).forEach((value) => {
      collectRichTextFontFamilies(value).forEach((family) =>
        families.add(family),
      );
    });
  };
  const scanSection = (section: SchoolTemplateProjectSectionContent) => {
    scanFields(section.fields);
    section.repeatable?.items.forEach(scanFields);
  };

  content.sharedSections.forEach(scanSection);
  content.pages.forEach((page) => page.sections.forEach(scanSection));

  return Array.from(families);
}

function getGoogleFontPreloadMarkup(content: SchoolTemplateProjectContent) {
  const urls = Array.from(
    new Set(
      [
        content.theme.fontFamily,
        content.theme.navLinkFontFamily,
        ...collectContentRichTextFontFamilies(content),
      ]
        .map(getGoogleFontStylesheetUrl)
        .filter(Boolean),
    ),
  );

  if (!urls.length) return "";

  return urls
    .map(
      (url) =>
        `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${escapeHtmlAttribute(
          url,
        )}" data-dexta-font-stylesheet="true">`,
    )
    .join("");
}

function getCssLength(value: unknown, fallback: number) {
  const parsed = Number(value);
  return `${Number.isFinite(parsed) ? parsed : fallback}px`;
}

function getCssColorWithOpacity(color: string, opacity: number) {
  const normalizedOpacity = clamp(opacity, 0, 100);
  if (normalizedOpacity >= 100) return color;
  const hexMatch = color.match(/^#([a-f\d]{3}|[a-f\d]{6})$/i);
  if (!hexMatch) {
    return `color-mix(in srgb, ${color} ${normalizedOpacity}%, transparent)`;
  }

  const hex =
    hexMatch[1].length === 3
      ? hexMatch[1]
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : hexMatch[1];
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const alpha = Number((normalizedOpacity / 100).toFixed(3));

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getDextaAcademyThreeBrandText(
  content: SchoolTemplateProjectContent | undefined,
  key: "brandName" | "brandTagline",
  headerKey: "brandPrimary" | "brandSecondary",
  fallback: string,
) {
  if (
    content?.theme &&
    Object.prototype.hasOwnProperty.call(content.theme, key)
  ) {
    const themeValue = content.theme[key];
    return themeValue === null || themeValue === undefined
      ? ""
      : String(themeValue).trim();
  }

  return getDextaAcademyThreeHeaderText(content, headerKey, fallback);
}

function getDextaAcademyThreeAnchorHref(
  content: SchoolTemplateProjectContent | undefined,
  key: string,
  anchorId: string,
  pageSlug: string,
) {
  const fallback = createDextaAcademyThreeHomeHref(anchorId, pageSlug);
  const value = getDextaAcademyThreeHeaderText(
    content,
    key,
    `index.html#${anchorId}`,
  );

  return value === `#${anchorId}` || value === `index.html#${anchorId}`
    ? fallback
    : value;
}

function getDextaAcademyThreePreviewHref(
  content: SchoolTemplateProjectContent | undefined,
  href: string,
  navigation?: PreviewNavigationContext,
) {
  if (!navigation) return href;

  const rawHref = href.trim();
  if (!rawHref || /^(mailto|tel|sms|javascript|data):/i.test(rawHref)) {
    return href;
  }

  const search = navigation.search ?? "";
  if (rawHref.startsWith("#")) {
    return `${navigation.routeBase}/${encodeURIComponent(
      navigation.currentPageSlug,
    )}${search}${rawHref}`;
  }

  let path = rawHref;
  let hash = "";
  const hashIndex = path.indexOf("#");
  if (hashIndex >= 0) {
    hash = path.slice(hashIndex);
    path = path.slice(0, hashIndex);
  }

  const queryIndex = path.indexOf("?");
  if (queryIndex >= 0) {
    path = path.slice(0, queryIndex);
  }

  if (!path) {
    return `${navigation.routeBase}/${encodeURIComponent(
      navigation.currentPageSlug,
    )}${search}${hash}`;
  }

  let pathname = path;
  if (/^https?:\/\//i.test(path)) {
    try {
      pathname = new URL(path).pathname;
    } catch {
      return href;
    }
  }

  pathname = pathname.replace(/\\/g, "/").replace(/^\.\//, "");
  const pathParts = pathname.split("/").filter(Boolean);
  const fileName = pathParts.length
    ? pathParts[pathParts.length - 1]
    : "index.html";
  const decodedFileName = (() => {
    try {
      return decodeURIComponent(fileName);
    } catch {
      return fileName;
    }
  })();

  const page = content?.pages.find((item) => item.fileName === decodedFileName);
  if (!page) return href;

  return `${navigation.routeBase}/${encodeURIComponent(page.slug)}${search}${hash}`;
}

function getResolvedPreviewThemeLogoUrl(content: SchoolTemplateProjectContent) {
  if (!content.theme.logoUrl) return "";
  const logoField = {
    key: "logoUrl",
    label: "Site logo",
    type: "image" as const,
    selector: "img",
    target: "attribute" as const,
    attribute: "src",
  };

  return resolveSchoolTemplateAsset(content.theme.logoUrl, logoField, {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
    proxyCloudinaryRawModels: true,
  });
}

function getPreviewDocumentTitle(
  content: SchoolTemplateProjectContent,
  page?: SchoolTemplateProjectPageContent,
) {
  const schoolName =
    content.theme.documentTitle?.trim() ||
    content.theme.brandName?.trim() ||
    content.templateName ||
    "School";
  const pageName = page?.title?.trim() || page?.slug?.trim() || "";

  if (!pageName || page?.isHome || page?.slug === "home") {
    return schoolName;
  }

  return `${schoolName} | ${pageName}`;
}

function applyPreviewDocumentIdentity(
  html: string,
  content: SchoolTemplateProjectContent,
  page?: SchoolTemplateProjectPageContent,
) {
  const title = getPreviewDocumentTitle(content, page);
  const logoUrl = getResolvedPreviewThemeLogoUrl(content);
  let output = html;

  if (title) {
    if (/<title\b[^>]*>/i.test(output)) {
      output = output.replace(
        /<title\b[^>]*>[\s\S]*?<\/title>/i,
        `<title>${escapeHtml(title)}</title>`,
      );
    } else {
      output = injectIntoHead(output, `<title>${escapeHtml(title)}</title>`);
    }
  }

  if (logoUrl) {
    if (
      /<link\b(?=[^>]*\brel=["'][^"']*\bicon\b[^"']*["'])[^>]*>/i.test(output)
    ) {
      output = output.replace(
        /<link\b(?=[^>]*\brel=["'][^"']*\bicon\b[^"']*["'])[^>]*>/i,
        (match) => {
          if (/\bhref\s*=/i.test(match)) {
            return match.replace(
              /\bhref\s*=\s*(["'])(.*?)\1/i,
              `href="${escapeHtmlAttribute(logoUrl)}"`,
            );
          }

          return match.replace(
            /\/?>$/,
            ` href="${escapeHtmlAttribute(logoUrl)}">`,
          );
        },
      );
    } else {
      output = injectIntoHead(
        output,
        `<link rel="icon" href="${escapeHtmlAttribute(logoUrl)}">`,
      );
    }
  }

  return output;
}

function getDextaAcademyThreeLogoMarkup(
  content?: SchoolTemplateProjectContent,
  className = "brand__crest",
) {
  const logoUrl = content ? getResolvedPreviewThemeLogoUrl(content) : "";
  const logoBackgroundColor =
    content?.theme.logoBackgroundColor?.trim() || "transparent";
  const isLoaderLogo = className.includes("page-loader");
  const logoWidth = getCssLength(
    isLoaderLogo
      ? content?.theme.loadingLogoWidth || content?.theme.logoWidth
      : content?.theme.logoWidth,
    46,
  );
  const logoHeight = getCssLength(
    isLoaderLogo
      ? content?.theme.loadingLogoHeight || content?.theme.logoHeight
      : content?.theme.logoHeight,
    46,
  );
  const logoBorder = content?.theme.logoBorderEnabled
    ? `1px solid ${escapeCssValue(content.theme.logoBorderColor, "#ffc43d")}`
    : "0";
  const logoShadow = "none";
  const renderedLogoBorder = isLoaderLogo ? "0" : logoBorder;
  const renderedLogoShadow = isLoaderLogo ? "none" : logoShadow;
  const logoBorderRadius = getCssLength(content?.theme.logoBorderRadius, 16);
  const logoStyle = logoUrl
    ? ` style="${escapeHtmlAttribute(
        `background:${escapeCssValue(logoBackgroundColor, "transparent")}!important;border:${renderedLogoBorder}!important;border-radius:${logoBorderRadius}!important;box-shadow:${renderedLogoShadow}!important;width:${logoWidth}!important;height:${logoHeight}!important;max-width:${logoWidth}!important;display:grid!important;place-items:center!important;overflow:hidden;`,
      )}"`
    : "";
  const logoClass = logoUrl
    ? ` class="${escapeHtmlAttribute(className)} dexta-theme-logo-mark"`
    : ` class="${escapeHtmlAttribute(className)} dexta-empty-logo-mark" hidden`;
  const logoImage = logoUrl
    ? `<img src="${escapeHtmlAttribute(logoUrl)}" alt="School logo">`
    : "";

  return `<span${logoClass}${logoStyle} aria-hidden="true">
          ${logoImage}
        </span>`;
}

function getDextaAcademyThreePageLoaderMarkup(
  content: SchoolTemplateProjectContent,
) {
  const loadingText = content.theme.loadingText?.trim();

  return `<div id="page-loader" class="page-loader" role="status" aria-live="polite">
      <div class="page-loader__inner">
        <div class="page-loader__halo" aria-hidden="true"></div>
        ${getDextaAcademyThreeLogoMarkup(
          content,
          "page-loader__crest brand__crest",
        )}
        ${loadingText ? `<p class="page-loader__copy">${escapeHtml(loadingText)}</p>` : ""}
        <div class="page-loader__track" aria-hidden="true">
          <span class="page-loader__bar"></span>
        </div>
      </div>
    </div>`;
}

function renderDextaAcademyOneLoaderFallback(
  html: string,
  content: SchoolTemplateProjectContent,
) {
  if (!/<div\b[^>]*\bid=["']spinner["'][^>]*>/i.test(html)) return html;

  const logoUrl = getResolvedPreviewThemeLogoUrl(content);
  const loadingText = content.theme.loadingText?.trim() ?? "";
  let output = html.replace(
    /<div\b([^>]*\bid=["']spinner["'][^>]*)>/i,
    (match, attrs: string) => {
      if (/\bdexta-template-one-loader\b/.test(match)) return match;
      if (/\bclass\s*=/i.test(attrs)) {
        return match.replace(
          /\bclass\s*=\s*(["'])(.*?)\1/i,
          (_classMatch, quote: string, className: string) =>
            `class=${quote}${className} dexta-template-one-loader${quote}`,
        );
      }

      return `<div${attrs} class="dexta-template-one-loader">`;
    },
  );

  if (logoUrl && !/\bdexta-loading-logo\b/.test(output)) {
    output = output.replace(
      /(<div\b(?=[^>]*\bclass=["'][^"']*\bspinner-border\b)[^>]*>)/i,
      `<span class="dexta-loading-logo" aria-hidden="true"><img src="${escapeHtmlAttribute(logoUrl)}" alt="School logo"></span>\n$1`,
    );
  }

  if (loadingText && !/\bdexta-loading-text\b/.test(output)) {
    output = output.replace(
      /(<div\b(?=[^>]*\bclass=["'][^"']*\bspinner-border\b)[^>]*>[\s\S]*?<\/div>)/i,
      `$1\n<span class="dexta-loading-text">${escapeHtml(loadingText)}</span>`,
    );
  }

  return output;
}

function getDextaAcademyOneStaticLoaderCss(
  content: SchoolTemplateProjectContent,
) {
  const loadingBackground = escapeCssValue(
    content.theme.loadingBackgroundColor,
    "#ffffff",
  );
  const loadingTextColor = escapeCssValue(
    content.theme.loadingTextColor,
    "#0f172a",
  );
  const loadingLogoWidth = getCssLength(
    content.theme.loadingLogoWidth || content.theme.logoWidth,
    72,
  );
  const loadingLogoHeight = getCssLength(
    content.theme.loadingLogoHeight || content.theme.logoHeight,
    56,
  );
  const logoBackground = escapeCssValue(
    content.theme.logoBackgroundColor,
    "transparent",
  );
  const logoRadius = getCssLength(content.theme.logoBorderRadius, 0);
  const loadingBarColor = escapeCssValue(content.theme.loadingBarColor);
  const css = [
    `#spinner.dexta-template-one-loader,#spinner.dexta-template-one-loader.show{background:${loadingBackground}!important;background-color:${loadingBackground}!important;color:${loadingTextColor}!important;}`,
    `#spinner.dexta-template-one-loader{flex-direction:column!important;gap:14px!important;}`,
    `#spinner.dexta-template-one-loader .dexta-loading-logo{display:grid!important;place-items:center!important;width:${loadingLogoWidth}!important;height:${loadingLogoHeight}!important;max-width:${loadingLogoWidth}!important;background:${logoBackground}!important;border-radius:${logoRadius}!important;overflow:hidden!important;}`,
    `#spinner.dexta-template-one-loader .dexta-loading-logo img{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;}`,
    `#spinner.dexta-template-one-loader .spinner-border{width:3rem!important;height:3rem!important;}`,
    loadingBarColor
      ? `#spinner.dexta-template-one-loader .spinner-border{color:${loadingBarColor}!important;}`
      : "",
    `#spinner.dexta-template-one-loader .dexta-loading-text{color:${loadingTextColor}!important;font-size:.95rem!important;font-weight:700!important;line-height:1.4!important;}`,
  ].filter(Boolean);

  return `<style data-dexta-template1-loader="true">${css.join("")}</style>`;
}

function getDextaAcademyThreeStaticPreviewCss(
  content: SchoolTemplateProjectContent,
) {
  const primary = escapeCssValue(content.theme.primaryColor, "#061a40");
  const secondary = escapeCssValue(content.theme.secondaryColor, "#f5b82e");
  const tertiary = escapeCssValue(content.theme.tertiaryColor, "#dc422e");
  const navbarColor = escapeCssValue(content.theme.navBarColor, "#020c20");
  const navbarOpacity = clamp(
    Number(content.theme.navBarOpacity ?? 100),
    0,
    100,
  );
  const navbarBackground = content.theme.navBarTransparent
    ? getCssColorWithOpacity(navbarColor, navbarOpacity)
    : navbarColor;
  const navbarBackdrop = content.theme.navBarTransparent
    ? "blur(18px)"
    : "none";
  const brandNameColor = escapeCssValue(
    content.theme.brandNameColor,
    "#061a40",
  );
  const brandTaglineColor = escapeCssValue(
    content.theme.brandTaglineColor,
    "#061a40",
  );
  const navHoverColor = escapeCssValue(content.theme.navHoverColor, secondary);
  const navLinkColor = escapeCssValue(
    content.theme.navLinkColor || content.theme.brandTaglineColor,
    "#ffffff",
  );
  const navActiveColor =
    content.theme.navHoverEnabled === false ? navLinkColor : navHoverColor;
  const logoBorder = content.theme.logoBorderEnabled
    ? `1px solid ${escapeCssValue(content.theme.logoBorderColor, "#ffc43d")}`
    : "0";
  const logoShadow = "none";
  const logoBackground = escapeCssValue(
    content.theme.logoBackgroundColor,
    "transparent",
  );
  const logoRadius = getCssLength(content.theme.logoBorderRadius, 16);
  const logoWidth = getCssLength(content.theme.logoWidth, 46);
  const logoHeight = getCssLength(content.theme.logoHeight, 46);
  const loadingLogoWidth = getCssLength(
    content.theme.loadingLogoWidth || content.theme.logoWidth,
    46,
  );
  const loadingLogoHeight = getCssLength(
    content.theme.loadingLogoHeight || content.theme.logoHeight,
    46,
  );
  const loadingBackground = escapeCssValue(
    content.theme.loadingBackgroundColor,
    "#fff7df",
  );
  const loadingTextColor = escapeCssValue(
    content.theme.loadingTextColor,
    "#061a40",
  );
  const loadingBarColor = escapeCssValue(content.theme.loadingBarColor);
  const loadingCardBorderColor = escapeCssValue(
    content.theme.loadingCardBorderColor,
    "rgba(255,255,255,0.1)",
  );
  const loadingCardBorderWidth = clamp(
    Number(content.theme.loadingCardBorderWidth ?? 1),
    0,
    12,
  );
  const loadingCardShadowColor = escapeCssValue(
    content.theme.loadingCardShadowColor,
    "#010814",
  );
  const loadingCardShadowOpacity = clamp(
    Number(content.theme.loadingCardShadowOpacity ?? 42),
    0,
    100,
  );
  const loadingCardInsetShadow =
    loadingCardShadowOpacity > 0 ? ",inset 0 1px 0 rgba(255,255,255,.06)" : "";
  const navFont = String(
    content.theme.navLinkFontFamily || content.theme.fontFamily || "",
  ).trim();
  const bodyFont = String(content.theme.fontFamily || "").trim();
  const headerButtonBg = escapeCssValue(
    getDextaAcademyThreeHeaderText(content, "buttonBgColor", "#f3bf35"),
    "#f3bf35",
  );
  const headerButtonBgOpacity = clamp(
    getDextaAcademyThreeNumber(content, "buttonBgOpacity", 100),
    0,
    100,
  );
  const headerButtonText = escapeCssValue(
    getDextaAcademyThreeHeaderText(content, "buttonTextColor", "#09142f"),
    "#09142f",
  );
  const headerButtonBorderColor = escapeCssValue(
    getDextaAcademyThreeHeaderText(content, "buttonBorderColor", "#f3bf35"),
    "#f3bf35",
  );
  const headerButtonBorderWidth = clamp(
    getDextaAcademyThreeNumber(content, "buttonBorderWidth", 0),
    0,
    12,
  );
  const portalButtonBg = escapeCssValue(
    getDextaAcademyThreeHeaderText(content, "portalButtonBgColor", "#ffffff"),
    "#ffffff",
  );
  const portalButtonBgOpacity = clamp(
    getDextaAcademyThreeNumber(content, "portalButtonBgOpacity", 0),
    0,
    100,
  );
  const portalButtonText = escapeCssValue(
    getDextaAcademyThreeHeaderText(content, "portalButtonTextColor", "#ffffff"),
    "#ffffff",
  );
  const portalButtonBorderColor = escapeCssValue(
    getDextaAcademyThreeHeaderText(
      content,
      "portalButtonBorderColor",
      "#ffffff",
    ),
    "#ffffff",
  );
  const portalButtonBorderWidth = clamp(
    getDextaAcademyThreeNumber(content, "portalButtonBorderWidth", 0),
    0,
    12,
  );
  const heroSectionBgColor = escapeCssValue(
    getDextaAcademyThreeSectionText(
      content,
      "home",
      "hero",
      "sectionBgColor",
      "#031225",
    ),
    "#031225",
  );
  const heroSectionBgOpacity = clamp(
    Number(
      getDextaAcademyThreeSectionFieldValue(
        content,
        "home",
        "hero",
        "sectionBgOpacity",
      ) ?? 100,
    ),
    0,
    100,
  );
  const heroSectionBackground = getCssColorWithOpacity(
    heroSectionBgColor,
    heroSectionBgOpacity,
  );
  const heroHeadlineTextColor = escapeCssValue(
    getDextaAcademyThreeSectionText(
      content,
      "home",
      "hero",
      "headlineTextColor",
      "#ffffff",
    ),
    "#ffffff",
  );
  const heroJoyfulAccentColor = escapeCssValue(
    getDextaAcademyThreeSectionText(
      content,
      "home",
      "hero",
      "joyfulAccentColor",
      "#ffc94c",
    ),
    "#ffc94c",
  );
  const heroBoldAccentColor = escapeCssValue(
    getDextaAcademyThreeSectionText(
      content,
      "home",
      "hero",
      "boldAccentColor",
      "#ffc94c",
    ),
    "#ffc94c",
  );
  const heroPrimaryButtonShadowColor = escapeCssValue(
    getDextaAcademyThreeSectionText(
      content,
      "home",
      "hero",
      "primaryButtonShadowColor",
      "#fac343",
    ),
    "#fac343",
  );
  const heroPrimaryButtonShadowOpacity = clamp(
    Number(
      getDextaAcademyThreeSectionText(
        content,
        "home",
        "hero",
        "primaryButtonShadowOpacity",
        "24",
      ),
    ),
    0,
    100,
  );
  const heroSecondaryButtonShadowColor = escapeCssValue(
    getDextaAcademyThreeSectionText(
      content,
      "home",
      "hero",
      "secondaryButtonShadowColor",
      "#ffffff",
    ),
    "#ffffff",
  );
  const heroSecondaryButtonShadowOpacity = clamp(
    Number(
      getDextaAcademyThreeSectionText(
        content,
        "home",
        "hero",
        "secondaryButtonShadowOpacity",
        "4",
      ),
    ),
    0,
    100,
  );
  const portalButtonShapeStyle =
    "display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;padding:12px 18px!important;border-radius:999px!important;font-weight:700!important;text-decoration:none!important;";
  const heroHeadlineLayoutStyle =
    "max-width:min(14.5ch,100%)!important;line-height:1.04!important;letter-spacing:0!important;overflow-wrap:break-word!important;text-wrap:balance;";
  const heroLineLayoutStyle =
    "display:flex!important;align-items:baseline!important;justify-content:center!important;flex-wrap:wrap!important;gap:0 .18em!important;min-height:1.04em!important;";
  const css = [
    `:root,body,.home-page,.about-page,.gallery-page,.contact-page{--dexta-school-primary:${primary};--dexta-school-secondary:${secondary};--dexta-school-tertiary:${tertiary};--navy:${primary};--navy-deep:${primary};--gold:${secondary};--gold-deep:${secondary};--red:${tertiary};--red-deep:${tertiary};}`,
    bodyFont
      ? `body,.page-shell,.hero,.welcome,.programmes-showcase,.home-apply,.home-gallery,.site-footer,.about-page,.gallery-page,.contact-page,h1,h2,h3,h4,h5,h6,p,li,a,span,label,input,textarea,button{font-family:${JSON.stringify(bodyFont)},"Segoe UI",sans-serif!important;}`
      : "",
    navFont
      ? `.site-header .site-nav a,.site-header .portal-link,.site-header .button,.site-footer,.site-footer a{font-family:${JSON.stringify(navFont)},"Segoe UI",sans-serif!important;}`
      : "",
    `.site-header,.home-page .site-header,.home-page.is-animated .site-header,.about-page .site-header,.gallery-page .site-header,.contact-page .site-header,.about-page .site-header.is-open,.gallery-page .site-header.is-open,.contact-page .site-header.is-open{background:${navbarBackground}!important;background-color:${navbarBackground}!important;background-image:none!important;box-shadow:0 16px 40px rgba(0,0,0,.08)!important;backdrop-filter:${navbarBackdrop}!important;}`,
    `.site-header .brand__name strong{color:${brandNameColor}!important;font-size:${Number(content.theme.brandNameFontSize || 16)}px!important;}.site-header .brand__name span{color:${brandTaglineColor}!important;font-size:${Number(content.theme.brandTaglineFontSize || 16)}px!important;}.site-header .brand{color:${brandNameColor}!important;}.site-header .site-nav a{color:${navLinkColor}!important;}.site-header .site-nav a[aria-current="page"],.site-header .site-nav a:hover,.site-header .site-nav a:focus-visible{color:${navActiveColor}!important;}.site-header .site-nav a::after{background:${navHoverColor}!important;}`,
    `.site-header .portal-link{${portalButtonShapeStyle}background:${getCssColorWithOpacity(portalButtonBg, portalButtonBgOpacity)}!important;background-color:${getCssColorWithOpacity(portalButtonBg, portalButtonBgOpacity)}!important;background-image:none!important;color:${portalButtonText}!important;border:${portalButtonBorderWidth}px solid ${portalButtonBorderColor}!important;}`,
    `.hero{background:#031225!important;background-color:#031225!important;}.hero__sky-layer,.hero::before,.hero::after{top:0!important;right:0!important;bottom:0!important;left:0!important;height:auto!important;max-height:none!important;}.hero__sky-layer{background:${heroSectionBackground}!important;overflow:hidden!important;}.hero::before{background:radial-gradient(circle at 50% 74%,color-mix(in srgb,${heroSectionBackground} 58%,transparent),transparent 24%),radial-gradient(circle at 50% 55%,color-mix(in srgb,${heroSectionBackground} 24%,transparent),transparent 18%),linear-gradient(180deg,color-mix(in srgb,${heroSectionBackground} 12%,transparent) 0%,color-mix(in srgb,${heroSectionBackground} 42%,transparent) 100%)!important;}.hero::after{background:linear-gradient(180deg,color-mix(in srgb,${heroSectionBackground} 16%,transparent) 0%,color-mix(in srgb,${heroSectionBackground} 42%,transparent) 63%,color-mix(in srgb,${heroSectionBackground} 72%,transparent) 100%)!important;}`,
    `@media (max-width:560px){.hero__sky-layer,.hero::before,.hero::after{top:0!important;right:0!important;bottom:0!important;left:0!important;height:auto!important;max-height:none!important;}.hero__sky-layer{background:${heroSectionBackground}!important;overflow:hidden!important;}.hero h1,.hero__title,.hero__title .hero__line,.hero__title .hero__segment{color:${heroHeadlineTextColor}!important;}.hero__title .hero__accent--joyful{color:${heroJoyfulAccentColor}!important;}.hero__title .hero__accent--bold{color:${heroBoldAccentColor}!important;}}`,
    `.hero__sky-layer{top:0!important;right:0!important;bottom:0!important;left:0!important;height:auto!important;max-height:none!important;background:${heroSectionBackground}!important;background-image:none!important;overflow:hidden!important;}.hero__sky-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center top!important;opacity:.94!important;transform:scale(1.12);transform-origin:center top!important;}@media (max-width:1080px){.hero__sky-image{object-position:center 18%!important;}}@media (max-width:840px){.hero__sky-image{object-position:center 16%!important;}}@media (max-width:560px){.hero__sky-layer{top:0!important;right:0!important;bottom:0!important;left:0!important;height:auto!important;max-height:none!important;background:${heroSectionBackground}!important;background-image:none!important;}.hero__sky-image{object-position:center 14%!important;}}`,
    `.hero h1,.hero__title{${heroHeadlineLayoutStyle}color:${heroHeadlineTextColor}!important;}.hero__line{${heroLineLayoutStyle}color:${heroHeadlineTextColor}!important;}.hero__segment,.hero__accent{line-height:1.04!important;white-space:normal!important;}.hero__segment{color:${heroHeadlineTextColor}!important;}.hero__accent--joyful{color:${heroJoyfulAccentColor}!important;}.hero__accent--bold{color:${heroBoldAccentColor}!important;}`,
    `.hero__cta-primary{box-shadow:0 18px 34px ${getCssColorWithOpacity(heroPrimaryButtonShadowColor, heroPrimaryButtonShadowOpacity)}!important;}.hero__cta-secondary{box-shadow:inset 0 0 0 1px ${getCssColorWithOpacity(heroSecondaryButtonShadowColor, heroSecondaryButtonShadowOpacity)}!important;}`,
    `.brand__crest{border:${logoBorder}!important;border-radius:${logoRadius}!important;box-shadow:${logoShadow}!important;width:${logoWidth}!important;height:${logoHeight}!important;max-width:${logoWidth}!important;background:${logoBackground}!important;}.page-loader__crest{border:0!important;border-radius:${logoRadius}!important;box-shadow:none!important;width:${loadingLogoWidth}!important;height:${loadingLogoHeight}!important;max-width:${loadingLogoWidth}!important;background:${logoBackground}!important;}`,
    `.brand__crest.dexta-empty-logo-mark,.page-loader__crest.dexta-empty-logo-mark{display:none!important;}.brand__crest.dexta-theme-logo-mark,.page-loader__crest.dexta-theme-logo-mark{display:grid!important;place-items:center!important;overflow:hidden;}.brand__crest.dexta-theme-logo-mark::before,.page-loader__crest.dexta-theme-logo-mark::before{content:none!important;}.brand__crest img,.page-loader__crest img{display:block;width:100%;height:100%;object-fit:contain;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;}`,
    `.header-actions .button--gold{background:${getCssColorWithOpacity(headerButtonBg, headerButtonBgOpacity)}!important;background-color:${getCssColorWithOpacity(headerButtonBg, headerButtonBgOpacity)}!important;background-image:none!important;color:${headerButtonText}!important;border:${headerButtonBorderWidth}px solid ${headerButtonBorderColor}!important;}`,
    `.page-loader,.js body .page-loader{background:${loadingBackground}!important;background-color:${loadingBackground}!important;color:${loadingTextColor}!important;}.page-loader__inner{background:${loadingBackground}!important;background-color:${loadingBackground}!important;border:${loadingCardBorderWidth}px solid ${loadingCardBorderColor}!important;box-shadow:0 34px 70px ${getCssColorWithOpacity(loadingCardShadowColor, loadingCardShadowOpacity)}${loadingCardInsetShadow}!important;}.page-loader__copy{color:${loadingTextColor}!important;}`,
    loadingBarColor
      ? `.page-loader__bar{background:${loadingBarColor}!important;}`
      : "",
  ].filter(Boolean);

  return `<style data-dexta-template3-preview-theme="true">${css.join("")}</style>`;
}

function getDextaAcademyThreeNavbarMarkup(
  pageSlug: string,
  content?: SchoolTemplateProjectContent,
  navigation?: PreviewNavigationContext,
) {
  const programmesHref = getDextaAcademyThreeAnchorHref(
    content,
    "navProgrammesHref",
    "programmes",
    pageSlug,
  );
  const applyHref = getDextaAcademyThreeAnchorHref(
    content,
    "navApplyHref",
    "how-to-apply",
    pageSlug,
  );
  const headerCtaHref = getDextaAcademyThreeAnchorHref(
    content,
    "headerCtaHref",
    "how-to-apply",
    pageSlug,
  );
  const headerCtaText = getDextaAcademyThreeHeaderText(
    content,
    "headerCtaText",
    "Apply Now",
  );
  const shouldOpenAdmissionModal =
    pageSlug === "contact" &&
    (headerCtaHref === "#how-to-apply" ||
      headerCtaHref === "index.html#how-to-apply");
  const hasHeaderCta = Boolean(headerCtaText && headerCtaHref);
  const applyAttributes = shouldOpenAdmissionModal
    ? 'href="#admission" data-admission-modal-open aria-controls="admission-modal"'
    : `href="${escapeHtmlAttribute(
        getDextaAcademyThreePreviewHref(content, headerCtaHref, navigation),
      )}"`;
  const brandPrimary = getDextaAcademyThreeBrandText(
    content,
    "brandName",
    "brandPrimary",
    "DXT",
  );
  const brandSecondary = getDextaAcademyThreeBrandText(
    content,
    "brandTagline",
    "brandSecondary",
    "Academy",
  );
  const brandLabel = [brandPrimary, brandSecondary].filter(Boolean).join(" ");
  const navbarColor = escapeCssValue(content?.theme.navBarColor, "#020c20");
  const navbarOpacity = clamp(
    Number(content?.theme.navBarOpacity ?? 100),
    0,
    100,
  );
  const navbarBackground = content?.theme.navBarTransparent
    ? getCssColorWithOpacity(navbarColor, navbarOpacity)
    : navbarColor;
  const navbarBackdrop = content?.theme.navBarTransparent
    ? "blur(18px)"
    : "none";
  const brandNameColor = escapeCssValue(
    content?.theme.brandNameColor,
    "#061a40",
  );
  const brandTaglineColor = escapeCssValue(
    content?.theme.brandTaglineColor,
    "#061a40",
  );
  const navActiveColor =
    content?.theme.navHoverEnabled === false
      ? escapeCssValue(
          content?.theme.navLinkColor || content?.theme.brandTaglineColor,
          "#ffffff",
        )
      : escapeCssValue(content?.theme.navHoverColor, "#f5b82e");
  const navLinkColor = escapeCssValue(
    content?.theme.navLinkColor || content?.theme.brandTaglineColor,
    "#ffffff",
  );
  const navFont = getGoogleFontFamilyName(
    content?.theme.navLinkFontFamily || content?.theme.fontFamily,
  );
  const navFontStyle = navFont
    ? `font-family:${JSON.stringify(navFont)},"Segoe UI",sans-serif!important;`
    : "";
  const headerStyle = `background:${navbarBackground}!important;background-color:${navbarBackground}!important;background-image:none!important;backdrop-filter:${navbarBackdrop}!important;`;
  const brandStrongStyle = `color:${brandNameColor}!important;font-size:${Number(
    content?.theme.brandNameFontSize || 16,
  )}px!important;`;
  const brandSpanStyle = `color:${brandTaglineColor}!important;font-size:${Number(
    content?.theme.brandTaglineFontSize || 16,
  )}px!important;`;
  const navLinkStyle = `color:${navLinkColor}!important;${navFontStyle}`;
  const currentNavLinkStyle = `color:${navActiveColor}!important;${navFontStyle}`;
  const portalText = getDextaAcademyThreeHeaderText(
    content,
    "portalText",
    "Portal",
  );
  const portalHref = getDextaAcademyThreeHeaderText(content, "portalHref", "#");
  const hasPortalLink = Boolean(portalText && portalHref);
  const portalButtonBg = escapeCssValue(
    getDextaAcademyThreeHeaderText(content, "portalButtonBgColor", "#ffffff"),
    "#ffffff",
  );
  const portalButtonBgOpacity = clamp(
    getDextaAcademyThreeNumber(content, "portalButtonBgOpacity", 0),
    0,
    100,
  );
  const portalButtonBackground = getCssColorWithOpacity(
    portalButtonBg,
    portalButtonBgOpacity,
  );
  const portalButtonText = escapeCssValue(
    getDextaAcademyThreeHeaderText(content, "portalButtonTextColor", "#ffffff"),
    "#ffffff",
  );
  const portalButtonBorderColor = escapeCssValue(
    getDextaAcademyThreeHeaderText(
      content,
      "portalButtonBorderColor",
      "#ffffff",
    ),
    "#ffffff",
  );
  const portalButtonBorderWidth = clamp(
    getDextaAcademyThreeNumber(content, "portalButtonBorderWidth", 0),
    0,
    12,
  );
  const portalButtonShapeStyle =
    "display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;padding:12px 18px!important;border-radius:999px!important;font-weight:700!important;text-decoration:none!important;";
  const portalButtonStyle = `${portalButtonShapeStyle}background:${portalButtonBackground}!important;background-color:${portalButtonBackground}!important;background-image:none!important;color:${portalButtonText}!important;border:${portalButtonBorderWidth}px solid ${portalButtonBorderColor}!important;${navFontStyle}`;
  const headerButtonBg = escapeCssValue(
    getDextaAcademyThreeHeaderText(content, "buttonBgColor", "#f3bf35"),
    "#f3bf35",
  );
  const headerButtonBgOpacity = clamp(
    getDextaAcademyThreeNumber(content, "buttonBgOpacity", 100),
    0,
    100,
  );
  const headerButtonBackground = getCssColorWithOpacity(
    headerButtonBg,
    headerButtonBgOpacity,
  );
  const headerButtonText = escapeCssValue(
    getDextaAcademyThreeHeaderText(content, "buttonTextColor", "#09142f"),
    "#09142f",
  );
  const headerButtonBorderColor = escapeCssValue(
    getDextaAcademyThreeHeaderText(content, "buttonBorderColor", "#f3bf35"),
    "#f3bf35",
  );
  const headerButtonBorderWidth = clamp(
    getDextaAcademyThreeNumber(content, "buttonBorderWidth", 0),
    0,
    12,
  );
  const headerButtonStyle = `background:${headerButtonBackground}!important;background-color:${headerButtonBackground}!important;background-image:none!important;color:${headerButtonText}!important;border:${headerButtonBorderWidth}px solid ${headerButtonBorderColor}!important;${navFontStyle}`;
  const links = [
    {
      href: getDextaAcademyThreePreviewHref(
        content,
        getDextaAcademyThreeHeaderText(content, "navHomeHref", "index.html"),
        navigation,
      ),
      label: getDextaAcademyThreeHeaderText(content, "navHomeText", "Home"),
      page: "home",
    },
    {
      href: getDextaAcademyThreePreviewHref(
        content,
        getDextaAcademyThreeHeaderText(content, "navAboutHref", "about.html"),
        navigation,
      ),
      label: getDextaAcademyThreeHeaderText(content, "navAboutText", "About"),
      page: "about",
    },
    {
      href: getDextaAcademyThreePreviewHref(
        content,
        programmesHref,
        navigation,
      ),
      label: getDextaAcademyThreeHeaderText(
        content,
        "navProgrammesText",
        "Programmes",
      ),
    },
    {
      href: getDextaAcademyThreePreviewHref(
        content,
        getDextaAcademyThreeHeaderText(
          content,
          "navGalleryHref",
          "gallery.html",
        ),
        navigation,
      ),
      label: getDextaAcademyThreeHeaderText(
        content,
        "navGalleryText",
        "Gallery",
      ),
      page: "gallery",
    },
    {
      href: getDextaAcademyThreePreviewHref(content, applyHref, navigation),
      label: getDextaAcademyThreeHeaderText(
        content,
        "navApplyText",
        "How To Apply",
      ),
    },
    {
      href: getDextaAcademyThreePreviewHref(
        content,
        getDextaAcademyThreeHeaderText(
          content,
          "navContactHref",
          "contact.html",
        ),
        navigation,
      ),
      label: getDextaAcademyThreeHeaderText(
        content,
        "navContactText",
        "Contact",
      ),
      page: "contact",
    },
  ];

  return `<header class="site-header" style="${escapeHtmlAttribute(headerStyle)}">
      <a class="brand" href="index.html" aria-label="${escapeHtmlAttribute(
        brandLabel || "School",
      )} home">
        ${getDextaAcademyThreeLogoMarkup(content)}
        <span class="brand__name">
          <strong style="${escapeHtmlAttribute(brandStrongStyle)}">${escapeHtml(
            brandPrimary,
          )}</strong>
          <span style="${escapeHtmlAttribute(brandSpanStyle)}">${escapeHtml(
            brandSecondary,
          )}</span>
        </span>
      </a>

      <button
        class="nav-toggle"
        type="button"
        aria-expanded="false"
        aria-controls="site-nav"
      >
        Menu
      </button>

      <nav class="site-nav" id="site-nav" aria-label="Primary navigation">
        ${links
          .map((link) =>
            createDextaAcademyThreeNavLink({
              ...link,
              currentPage: pageSlug,
              style: navLinkStyle,
              currentStyle: currentNavLinkStyle,
            }),
          )
          .join("")}
      </nav>

      <div class="header-actions">
        ${
          hasPortalLink
            ? `<a class="portal-link" href="${escapeHtmlAttribute(
                getDextaAcademyThreePreviewHref(
                  content,
                  portalHref,
                  navigation,
                ),
              )}" style="${escapeHtmlAttribute(
                portalButtonStyle,
              )}">${escapeHtml(portalText)}</a>`
            : ""
        }
        ${
          hasHeaderCta
            ? `<a class="button button--gold" ${applyAttributes} style="${escapeHtmlAttribute(
                headerButtonStyle,
              )}">${escapeHtml(headerCtaText)}</a>`
            : ""
        }
      </div>
    </header>`;
}

function renderDextaAcademyThreeNavbarFallback(
  html: string,
  pageSlug: string,
  content: SchoolTemplateProjectContent,
  navigation?: PreviewNavigationContext,
) {
  if (!/<[^>]+\sdata-site-navbar(?:\s|>|=)/i.test(html)) {
    return html;
  }

  const withoutMount = html.replace(
    /\s*<div\b[^>]*\sdata-site-navbar(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?[^>]*>\s*<\/div>\s*/gi,
    "\n",
  );

  if (/<header\b[^>]*\bclass=["'][^"']*\bsite-header\b/i.test(withoutMount)) {
    return withoutMount;
  }

  return injectAfterBodyOpen(
    withoutMount,
    getDextaAcademyThreeNavbarMarkup(pageSlug, content, navigation),
  );
}

function renderDextaAcademyThreeLoaderFallback(
  html: string,
  pageSlug: string,
  content: SchoolTemplateProjectContent,
) {
  if (pageSlug !== "home" || /<[^>]+\sid=["']page-loader["']/i.test(html)) {
    return html;
  }

  return injectAfterBodyOpen(
    html,
    getDextaAcademyThreePageLoaderMarkup(content),
  );
}

const dextaAcademyOneHeroLineStyleMap = [
  { className: "orange", token: "orange" },
  { className: "sky", token: "sky" },
  { className: "white", token: "white" },
  { className: "blue", token: "green-blue" },
  { className: "thin-white", token: "fine-accent" },
] as const;

type DextaAcademyOneHeroLineFallbacks = Record<
  (typeof dextaAcademyOneHeroLineStyleMap)[number]["token"],
  string
>;

const dextaAcademyOneHeroLineFallbacks: Record<
  "desktop" | "mobile",
  DextaAcademyOneHeroLineFallbacks
> = {
  desktop: {
    orange: "#FF6B35",
    sky: "#7fd0ff",
    white: "#ffffff",
    "green-blue": "#07801b",
    "fine-accent": "#acb893",
  },
  mobile: {
    orange: "#ea7c5f",
    sky: "#7fd0ff",
    white: "#f5f7ff",
    "green-blue": "#3e69d2",
    "fine-accent": "#ffffff",
  },
} as const;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getDextaAcademyOneHeroLineStrokeRule(
  className: string,
  token: string,
  fallback: string,
) {
  return `.${className} { stroke: color-mix(in srgb,var(--dexta-academy-1-home-hero-line-${token}-color,${fallback}) var(--dexta-academy-1-home-hero-line-${token}-opacity,100%),transparent); }`;
}

function prepareDextaAcademyOneHeroStreakSvg(
  svg: string,
  className: string,
  fallbacks: DextaAcademyOneHeroLineFallbacks,
) {
  let output = svg
    .replace(/\s*<title\b[\s\S]*?<\/title>\s*/i, "")
    .replace(/\s*<desc\b[\s\S]*?<\/desc>\s*/i, "");

  for (const item of dextaAcademyOneHeroLineStyleMap) {
    output = output.replace(
      new RegExp(
        `\\.${escapeRegExp(item.className)}\\s*\\{\\s*stroke:\\s*[^;]+;\\s*\\}`,
        "i",
      ),
      getDextaAcademyOneHeroLineStrokeRule(
        item.className,
        item.token,
        fallbacks[item.token],
      ),
    );
  }

  return output.replace(/<svg\b([^>]*)>/i, (_match, rawAttributes) => {
    const attributes = String(rawAttributes)
      .replace(/\srole=(["'])[^"']*\1/gi, "")
      .replace(/\saria-labelledby=(["'])[^"']*\1/gi, "")
      .replace(/\sclass=(["'])[^"']*\1/gi, "")
      .replace(/\saria-hidden=(["'])[^"']*\1/gi, "")
      .replace(/\sfocusable=(["'])[^"']*\1/gi, "");

    return `<svg${attributes} class="${className}" aria-hidden="true" focusable="false">`;
  });
}

async function inlineDextaAcademyOneHeroStreaks(
  html: string,
  sourceDir: string,
) {
  try {
    const [desktopSvg, mobileSvg] = await Promise.all([
      readFile(
        assertSafeTemplatePath(sourceDir, "school-hero-streaks.svg"),
        "utf8",
      ),
      readFile(
        assertSafeTemplatePath(sourceDir, "school-hero-streaks-mobile.svg"),
        "utf8",
      ),
    ]);

    return html
      .replace(
        /<img\b(?=[^>]*\bschool-hero__streaks--desktop\b)[^>]*>/i,
        prepareDextaAcademyOneHeroStreakSvg(
          desktopSvg,
          "school-hero__streaks school-hero__streaks--desktop",
          dextaAcademyOneHeroLineFallbacks.desktop,
        ),
      )
      .replace(
        /<img\b(?=[^>]*\bschool-hero__streaks--mobile\b)[^>]*>/i,
        prepareDextaAcademyOneHeroStreakSvg(
          mobileSvg,
          "school-hero__streaks school-hero__streaks--mobile",
          dextaAcademyOneHeroLineFallbacks.mobile,
        ),
      );
  } catch {
    return html;
  }
}

function assertSafeTemplatePath(sourceDir: string, fileName: string) {
  const workspaceRoot = process.cwd();
  const publicRoot = path.resolve(workspaceRoot, "public");
  const appPublicRoot = path.resolve(workspaceRoot, "src", "app", "(public)");
  const resolvedPath = path.resolve(workspaceRoot, sourceDir, fileName);

  const isInPublic = resolvedPath.startsWith(`${publicRoot}${path.sep}`);
  const isInAppPublic = resolvedPath.startsWith(`${appPublicRoot}${path.sep}`);

  if (!isInPublic && !isInAppPublic) {
    throw new Error(
      "Template source path must stay inside an allowed template folder.",
    );
  }

  return resolvedPath;
}

function getPreviewHero3dModuleMarkup() {
  return '<script type="module" src="js/hero-3d.js?dextaPreview=3d-config-v23" data-dexta-preview-hero-3d="external"></script>';
}

function isFilled(value: unknown) {
  return value !== null && value !== undefined && value !== "";
}

function setDeep(
  target: Record<string, unknown>,
  pathName: string,
  value: unknown,
) {
  const parts = pathName.split(".");
  let cursor = target;

  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      cursor[part] = value;
      return;
    }

    if (!cursor[part] || typeof cursor[part] !== "object") {
      cursor[part] = {};
    }

    cursor = cursor[part] as Record<string, unknown>;
  });
}

function applyThreeConfigSection(
  sectionContent: SchoolTemplateProjectSectionContent,
  sectionSnapshot: SchoolTemplateProjectSectionSnapshot | undefined,
  threeConfig: Record<string, unknown>,
) {
  if (!sectionSnapshot) {
    return;
  }

  for (const field of sectionSnapshot.fields) {
    if (field.target !== "threeConfig" || !field.configPath) {
      continue;
    }

    const value = sectionContent.fields[field.key];
    if (!isFilled(value)) {
      continue;
    }

    setDeep(
      threeConfig,
      field.configPath,
      field.type === "model3d"
        ? resolveSchoolTemplateAsset(value, field, {
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
            proxyCloudinaryRawModels: false,
          })
        : value,
    );
  }
}

function buildPreviewThreeConfig({
  content,
  sourceSnapshot,
  page,
}: {
  content: SchoolTemplateProjectContent;
  sourceSnapshot: SchoolTemplateSourceSnapshot;
  page: SchoolTemplateProjectPageContent;
}) {
  const threeConfig: Record<string, unknown> = {};
  const pageSnapshot = sourceSnapshot.pages.find(
    (item) => item.slug === page.slug,
  );

  for (const sectionContent of content.sharedSections) {
    applyThreeConfigSection(
      sectionContent,
      sourceSnapshot.sharedSections.find(
        (item) => item.id === sectionContent.id,
      ),
      threeConfig,
    );
  }

  if (pageSnapshot) {
    for (const sectionContent of page.sections) {
      applyThreeConfigSection(
        sectionContent,
        pageSnapshot.sections.find((item) => item.id === sectionContent.id),
        threeConfig,
      );
    }
  }

  return threeConfig;
}

function hasThreeConfig(config: Record<string, unknown>) {
  return Object.keys(config).length > 0;
}

function renderThreeConfigMarkup(config: Record<string, unknown>) {
  return `<script>window.schoolHero3dConfig = ${escapeScriptJson(config)};</script>`;
}

function getPreviewRuntimeScript(input: {
  content: SchoolTemplateProjectContent;
  sourceSnapshot: SchoolTemplateSourceSnapshot;
  page: SchoolTemplateProjectPageContent;
}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

  return `<script>
window.__DEXTA_SCHOOL_PREVIEW__ = {
  content: ${escapeScriptJson(input.content)},
  sourceSnapshot: ${escapeScriptJson(input.sourceSnapshot)},
  pageSlug: ${escapeScriptJson(input.page.slug)},
  environment: ${escapeScriptJson(process.env.NODE_ENV ?? "development")},
  cloudName: ${escapeScriptJson(cloudName)}
};
(function () {
  var preview = window.__DEXTA_SCHOOL_PREVIEW__;
  if (!preview) return;

	  function isFilled(value) {
	    return value !== null && value !== undefined && value !== "";
	  }

	  function toText(value) {
	    return value === null || value === undefined ? "" : String(value);
	  }

		  function toComparableText(value) {
	    var node = document.createElement("div");
	    node.innerHTML = toText(value);
	    return (node.textContent || node.innerText || "").replace(/\\s+/g, " ").trim();
	  }

	  function hasRichTextColorStyle(value) {
	    var node = document.createElement("div");
	    node.innerHTML = toText(value);
	    return Array.from(node.querySelectorAll("[style]")).some(function (item) {
	      return Boolean(item.style && (item.style.color || item.style.backgroundColor));
	    });
	  }

	  function hasRichTextFontStyle(value) {
	    var node = document.createElement("div");
	    node.innerHTML = toText(value);
	    if (node.querySelector("strong,b,em,i,u,s,strike,del")) return true;
	    return Array.from(node.querySelectorAll("[style]")).some(function (item) {
	      if (!item.style) return false;
	      return Boolean(
	        item.style.fontFamily ||
	        item.style.fontSize ||
	        item.style.fontStyle ||
	        item.style.fontWeight ||
	        item.style.textAlign ||
	        item.style.textDecoration ||
	        item.style.textTransform ||
	        item.style.letterSpacing
	      );
	    });
	  }

	  function serializeHtmlNode(node) {
	    var wrapper = document.createElement("div");
	    wrapper.appendChild(node.cloneNode(true));
	    return wrapper.innerHTML;
	  }

	  function isTextBlockElement(node) {
	    if (!node || node.nodeType !== 1) return false;
	    return /^(p|div|h[1-6]|blockquote)$/i.test(node.tagName || "");
	  }

	  function getUnwrappedTextBlockHtml(node) {
	    var style = node.getAttribute && node.getAttribute("style");
	    if (!style) return node.innerHTML;

	    var wrapper = document.createElement("span");
	    wrapper.setAttribute("style", style);
	    wrapper.innerHTML = node.innerHTML;
	    return serializeHtmlNode(wrapper);
	  }

	  function toInlineHtml(value, separator) {
	    var container = document.createElement("div");
	    container.innerHTML = toText(value);
	    var parts = [];

	    Array.from(container.childNodes).forEach(function (node) {
	      var html = isTextBlockElement(node)
	        ? getUnwrappedTextBlockHtml(node)
	        : serializeHtmlNode(node);
	      html = html.trim();
	      if (html) parts.push(html);
	    });

	    return parts.join(separator || "<br><br>");
	  }

	  function setElementHtml(node, value) {
	    var tagName = String(node.tagName || "").toLowerCase();
	    node.innerHTML = /^h[1-6]$/.test(tagName)
	      ? toInlineHtml(value, "<br>")
	      : tagName === "p"
	        ? toInlineHtml(value)
	        : toText(value);
	    promoteInlineRichTextColorStyles(node);
	  }

	  function promoteInlineRichTextColorStyles(root) {
	    if (!root || !root.querySelectorAll) return;
	    var isTemplateOneHomeHeroText =
	      preview.content.templateSlug === "dexta-academy-1" &&
	      root.classList &&
	      (root.classList.contains("school-hero__title") ||
	        root.classList.contains("school-hero__text"));
	    var styledNodes = [];
	    if (root.getAttribute && root.getAttribute("style")) {
	      styledNodes.push(root);
	    }
	    styledNodes = styledNodes.concat(Array.from(root.querySelectorAll("[style]")));
	    var promotedProperties = [
	      "color",
	      "background-color",
	      "font-family",
	      "font-size",
	      "font-style",
	      "font-weight",
	      "text-align",
	      "text-decoration",
	      "text-transform",
	      "letter-spacing"
	    ];
	    styledNodes.forEach(function (node) {
	      if (!node.style) return;
	      promotedProperties.forEach(function (property) {
	        if (isTemplateOneHomeHeroText && property === "font-size") return;
	        var value = node.style.getPropertyValue(property);
	        if (value) node.style.setProperty(property, value, "important");
	      });
	    });
	  }

	  function withUnit(value, unit) {
	    if (value === null || value === undefined || value === "") return "";
	    var text = String(value);
	    if (!unit || /[a-z%]+$/i.test(text)) return text;
	    return text + unit;
	  }

	  function getGoogleFontFamilyName(value) {
	    var text = String(value || "").trim().replace(/^["']|["']$/g, "");
	    if (!text) return "";
	    var family = String(text.split(",")[0] || "").trim().replace(/^["']|["']$/g, "");
	    if (!family || /^(inherit|initial|unset|serif|sans-serif|monospace|cursive|fantasy|system-ui)$/i.test(family)) return "";
	    return family;
	  }

	  function getGoogleFontStylesheetUrl(value) {
	    var family = getGoogleFontFamilyName(value);
	    if (!family) return "";
	    return "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(family).replace(/%20/g, "+") + ":ital,wght@0,100..900;1,100..900&display=swap";
	  }

	  function collectRichTextFontFamilies(value) {
	    var text = String(value || "");
	    if (!text || !/font-family\\s*:/i.test(text)) return [];
	    var families = [];
	    var pattern = /font-family\\s*:\\s*([^;"']*(?:"[^"]*"|'[^']*')?[^;]*)/gi;
	    var match;
	    while ((match = pattern.exec(text))) {
	      var family = getGoogleFontFamilyName(match[1]);
	      if (family && families.indexOf(family) < 0) families.push(family);
	    }
	    return families;
	  }

	  function applyFontFamily(node, value) {
	    var family = getGoogleFontFamilyName(value);
	    if (!family) return;
	    var fallback = preview.content.templateSlug === "dexta-academy-3"
	      ? ', "Segoe UI", sans-serif'
	      : ", var(--font-family, inherit)";
	    var stack = JSON.stringify(family) + fallback;
	    node.style.setProperty("font-family", stack, "important");
	    node.querySelectorAll("*").forEach(function (child) {
	      child.style.setProperty("font-family", stack, "important");
	    });
	  }

	  function applyNavFontFamily(node, value) {
	    var family = getGoogleFontFamilyName(value);
	    if (!family) return;
	    var stack = JSON.stringify(family) + ', "Segoe UI", sans-serif';
	    node.style.setProperty("font-family", stack, "important");
	    node.querySelectorAll("*").forEach(function (child) {
	      child.style.setProperty("font-family", stack, "important");
	    });
	  }

	  function applySectionFontOverrides() {
	    var styleId = "dexta-section-font-overrides";
	    var existing = document.getElementById(styleId);
	    if (existing) existing.remove();

	    var nodes = document.querySelectorAll("[data-dexta-font-stylesheet]");
	    for (var i = 0; i < nodes.length; i++) {
	      var node = nodes[i];
	      var url = node.getAttribute("data-dexta-font-stylesheet");
	      if (!url || url === "true") continue;
	      var match = url.match(/[?&]family=([^:&]+)/);
	      if (!match) continue;
	      var family;
	      try { family = decodeURIComponent(match[1].replace(/\\+/g, " ")).trim(); } catch (e) { continue; }
	      if (!family) continue;
	      var stack = JSON.stringify(family) + ', "Segoe UI", sans-serif';
	      node.style.setProperty("font-family", stack, "important");
	    }

	    var style = document.createElement("style");
	    style.id = styleId;
	    style.textContent = '[data-dexta-font-stylesheet]:not([data-dexta-font-stylesheet="true"]) *{font-family:inherit!important;}';
	    document.head.appendChild(style);
	  }

${getSchoolTemplateAssetResolverBrowserScript()}

	  function resolveAsset(value, field) {
	    return resolveSchoolTemplateAsset(value, field, {
	      cloudName: preview.cloudName,
	      proxyCloudinaryRawModels: true
	    });
	  }

	  function normalizeColorToken(value) {
	    return String(value || "").trim().toLowerCase();
	  }

	  function getTemplateThreeThemeColorForDefault(value, field) {
	    if (preview.content.templateSlug !== "dexta-academy-3") return "";
	    if (!field || field.type !== "color") return "";
	    var valueToken = normalizeColorToken(value);
	    var defaultToken = normalizeColorToken(field.defaultValue);
	    if (!valueToken || !defaultToken || valueToken !== defaultToken) return "";

	    var primaryDefaults = [
	      "#020c20",
	      "#031225",
	      "#061a40",
	      "#061f44",
	      "#07162f",
	      "#081427",
	      "#081730",
	      "#081b3a",
	      "#09142f",
	      "#10244b",
	      "#122a56"
	    ];
	    var secondaryDefaults = [
	      "#d69f11",
	      "#e6ae1d",
	      "#f1ad16",
	      "#f2b236",
	      "#f3bf35",
	      "#f5b82e",
	      "#f7c84d",
	      "#ffc43d",
	      "#ffd154",
	      "#ffd966"
	    ];
	    var tertiaryDefaults = [
	      "#b72d1f",
	      "#c12f1d",
	      "#dc422e",
	      "#ef523c",
	      "#ef613f"
	    ];

	    if (primaryDefaults.indexOf(defaultToken) >= 0) return "var(--navy)";
	    if (secondaryDefaults.indexOf(defaultToken) >= 0) return "var(--gold)";
	    if (tertiaryDefaults.indexOf(defaultToken) >= 0) return "var(--red)";
	    return "";
	  }
		
			  function getCssVariableValue(value, field) {
			    if (field.type === "image" || field.type === "model3d") {
			      var asset = resolveAsset(value, field).replace(/"/g, "&quot;");
			      return asset ? 'url("' + asset + '")' : "none";
			    }
			    var themeColor = getTemplateThreeThemeColorForDefault(value, field);
			    if (themeColor) return themeColor;
			    return withUnit(value, field.unit);
			  }

			  function isResponsiveScopeActive(field) {
			    var scope = field && field.scope ? String(field.scope) : "";
			    if (!scope || scope === "base") return true;
			    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
			      return scope === "desktop";
			    }
			    if (scope === "desktop") return window.matchMedia("(min-width: 992px)").matches;
			    if (scope === "tablet") return window.matchMedia("(min-width: 768px) and (max-width: 991.98px)").matches;
			    if (scope === "mobile") return window.matchMedia("(max-width: 767.98px)").matches;
			    return true;
			  }

			  function shouldCoverBackgroundImage(field) {
		    var key = String(field.key || "").toLowerCase();
		    var selector = String(field.selector || "").toLowerCase();

		    if (key.indexOf("icon") >= 0 || selector.indexOf("icon") >= 0) {
		      return false;
		    }

		    return (
		      key === "backgroundimage" ||
		      key.indexOf("hero") >= 0 ||
		      selector.indexOf("hero") >= 0
		    );
		  }
		
		  function setDeep(target, path, value) {
		    if (!path) return;
		    var parts = path.split(".");
		    var cursor = target;
	    parts.forEach(function (part, index) {
      if (index === parts.length - 1) {
        cursor[part] = value;
        return;
      }
      cursor[part] = cursor[part] || {};
		      cursor = cursor[part];
		    });
		  }

		  function notifyThreeConfigChanged() {
		    if (preview.content.templateSlug !== "dexta-academy-4") return;
		    if (typeof window.applySchoolHero3dLayout === "function") {
		      window.applySchoolHero3dLayout();
		    }
		    try {
		      window.dispatchEvent(
		        new CustomEvent("schoolHero3dConfigChanged", {
		          detail: { config: window.schoolHero3dConfig || {} }
		        })
		      );
		    } catch (error) {
		      window.dispatchEvent(new Event("schoolHero3dConfigChanged"));
		    }
		  }

		  function applyThreeConfigField(field, value) {
		    if (!field || field.target !== "threeConfig" || !field.configPath) {
		      return false;
		    }
		    window.schoolHero3dConfig = window.schoolHero3dConfig || {};
		    setDeep(
		      window.schoolHero3dConfig,
		      field.configPath,
		      field.type === "model3d" ? resolveAsset(value, field) : value
		    );
		    notifyThreeConfigChanged();
		    return true;
		  }

		  function getPreviewRouteBase() {
	    var match = window.location.pathname.match(/^(.*\\/admin\\/we-brand-schools\\/projects\\/[^/]+\\/preview)\\/[^/]+$/);
	    if (!match) {
	      match = window.location.pathname.match(/^(.*\\/webrandschools\\/project-preview\\/[^/]+)\\/[^/]+$/);
	    }
	    return match ? match[1] : "";
	  }

	  function getPreviewNavigationTarget(rawHref) {
	    var href = String(rawHref || "").trim();
	    if (!href || href.charAt(0) === "#") return null;
	    if (/^(mailto|tel|sms|javascript|data):/i.test(href)) return null;

	    var hash = "";
	    var hashIndex = href.indexOf("#");
	    if (hashIndex >= 0) {
	      hash = href.slice(hashIndex);
	      href = href.slice(0, hashIndex);
	    }

	    var queryIndex = href.indexOf("?");
	    if (queryIndex >= 0) {
	      href = href.slice(0, queryIndex);
	    }

	    if (!href) return null;

	    var pathname = href;
	    if (/^https?:\\/\\//i.test(href)) {
	      try {
	        var url = new URL(href);
	        if (url.origin !== window.location.origin) return null;
	        pathname = url.pathname;
	      } catch (error) {
	        return null;
	      }
	    }

	    pathname = pathname.replace(/\\\\/g, "/").replace(/^\\.\\//, "");
	    var pathParts = pathname.split("/").filter(Boolean);
	    var fileName = pathParts.length ? pathParts[pathParts.length - 1] : "index.html";

	    try {
	      fileName = decodeURIComponent(fileName);
	    } catch (error) {
	      return null;
	    }

	    if (!fileName || fileName === preview.content.templateSlug) {
	      fileName = "index.html";
	    }

	    var page = preview.content.pages.find(function (item) {
	      return item.fileName === fileName;
	    });
	    if (!page) return null;

	    return {
	      slug: page.slug,
	      hash: hash
	    };
	  }

	  function rewritePreviewInternalLinks() {
	    var routeBase = getPreviewRouteBase();
	    if (!routeBase) return;

	    var currentPageUrl = window.location.pathname + window.location.search;

	    document.querySelectorAll("a[href]").forEach(function (link) {
	      var rawHref = link.getAttribute("href") || "";

	      // Fix hash-only links so the <base href> tag does not redirect
	      // them away from the current preview page.
	      if (rawHref.charAt(0) === "#") {
	        link.setAttribute("href", currentPageUrl + rawHref);
	        return;
	      }

	      var target = getPreviewNavigationTarget(rawHref);
	      if (!target) return;

	      link.setAttribute(
	        "href",
	        routeBase + "/" + encodeURIComponent(target.slug) + window.location.search + target.hash
	      );
	    });
	  }

	  function isSafeFontStylesheetUrl(value) {
	    var text = String(value || "").trim();
	    if (!text) return false;
	    try {
	      var url = new URL(text, window.location.origin);
	      return url.protocol === "https:" || url.protocol === "http:";
	    } catch (error) {
	      return false;
	    }
	  }

	  function collectPreviewFontStylesheetUrls() {
	    var urls = [];
	    function addValue(value) {
	      var text = String(value || "").trim();
	      if (!text || !isSafeFontStylesheetUrl(text) || urls.indexOf(text) >= 0) return;
	      urls.push(text);
	    }

	    // Always load the admin's chosen theme fonts (all templates)
	    addValue(getGoogleFontStylesheetUrl(preview.content.theme.fontFamily));
	    addValue(getGoogleFontStylesheetUrl(preview.content.theme.navLinkFontFamily));

	    // Also load template defaults as fallback
	    if (preview.content.templateSlug === "dexta-academy-1" || preview.content.templateSlug === "dexta-academy-5") {
	      addValue("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap");
	    }
	    if (preview.content.templateSlug === "dexta-academy-2") {
	      addValue("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");
	    }
	    if (preview.content.templateSlug === "dexta-academy-4") {
	      addValue("https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap");
	    }

	    function scanSection(section) {
	      Object.keys(section.fields || {}).forEach(function (key) {
	        var normalizedKey = key.toLowerCase();
		        if (normalizedKey.indexOf("fontstylesheeturl") >= 0 || normalizedKey.indexOf("googlefonturl") >= 0) {
		          addValue(section.fields[key]);
		        }
		        if (normalizedKey === "fontfamily" || normalizedKey.indexOf("fontfamily") >= 0) {
		          addValue(getGoogleFontStylesheetUrl(section.fields[key]));
		        }
		        collectRichTextFontFamilies(section.fields[key]).forEach(function (family) {
		          addValue(getGoogleFontStylesheetUrl(family));
		        });
	      });
	      if (!section.repeatable || !section.repeatable.items) return;
	      section.repeatable.items.forEach(function (item) {
	        Object.keys(item || {}).forEach(function (key) {
	          var normalizedKey = key.toLowerCase();
		          if (normalizedKey.indexOf("fontstylesheeturl") >= 0 || normalizedKey.indexOf("googlefonturl") >= 0) {
		            addValue(item[key]);
		          }
		          if (normalizedKey === "fontfamily" || normalizedKey.indexOf("fontfamily") >= 0) {
		            addValue(getGoogleFontStylesheetUrl(item[key]));
		          }
		          collectRichTextFontFamilies(item[key]).forEach(function (family) {
		            addValue(getGoogleFontStylesheetUrl(family));
		          });
	        });
	      });
	    }

	    preview.content.sharedSections.forEach(scanSection);
	    preview.content.pages.forEach(function (page) {
	      page.sections.forEach(scanSection);
	    });
	    return urls;
	  }

	  function injectPreviewFontStylesheets() {
	    collectPreviewFontStylesheetUrls().forEach(function (href) {
	      if (document.querySelector('link[data-dexta-font-stylesheet][href="' + href.replace(/"/g, '\\"') + '"]')) return;
	      var link = document.createElement("link");
	      link.rel = "stylesheet";
	      link.href = href;
	      link.setAttribute("data-dexta-font-stylesheet", "true");
	      document.head.appendChild(link);
	    });
	  }

	  function refreshTemplateTwoIcons() {
	    if (preview.content.templateSlug !== "dexta-academy-2") return;
	    if (typeof window.icon !== "function") return;
	    document.querySelectorAll("[data-icon]").forEach(function (element) {
	      element.innerHTML = window.icon(element.getAttribute("data-icon") || "");
	    });
	  }

	  function queryWithin(root, selector) {
	    var nodes = [];
	    try {
      if (root.matches && root.matches(selector)) nodes.push(root);
      nodes = nodes.concat(Array.from(root.querySelectorAll(selector)));
    } catch (error) {
      console.warn("[Dexta preview] Invalid selector:", selector, error);
    }
    return Array.from(new Set(nodes));
  }

  function getSectionRoots(sectionSnapshot) {
    try {
      var roots = Array.from(document.querySelectorAll(sectionSnapshot.selector));
      return roots.length ? roots : [document.documentElement];
    } catch (error) {
      console.warn("[Dexta preview] Invalid section selector:", sectionSnapshot.selector, error);
      return [document.documentElement];
    }
  }

	  function shouldApplyField(value, field) {
	    if (isFilled(value)) return true;
	    if (
	      value !== null &&
	      value !== undefined &&
	      (field.target === "textContent" || field.target === "innerHTML")
	    ) return true;
	    if (field.type === "image" && field.defaultValue !== undefined && (field.target === "attribute" || field.target === "backgroundImage")) return true;
	    return false;
	  }

  function ensureImageChild(node) {
    var image = node.querySelector("img");
    if (image) return image;
    image = document.createElement("img");
    image.alt = "School logo";
    node.textContent = "";
    node.appendChild(image);
    return image;
  }

	  function applyImageAttribute(node, field, value, attribute) {
	    var asset = resolveAsset(value, field);
	    var tagName = String(node.tagName || "").toLowerCase();

    if (attribute === "src" && tagName !== "img") {
      if (!asset) {
        node.querySelectorAll("img").forEach(function (image) { image.remove(); });
        node.style.display = "none";
        return;
      }

      node.style.display = "";
      node.classList.add("dexta-theme-logo-mark");
      var image = ensureImageChild(node);
      image.src = asset;
      return;
    }

    if (!asset && field.type === "image") {
      node.removeAttribute(attribute);
      node.style.display = "none";
      return;
    }

	    node.style.display = "";
	    node.setAttribute(attribute, asset);
	  }

	  function isIframeEmbedField(field) {
	    return field && field.type === "textarea" && field.target === "attribute" && (
	      field.key === "formIframe" ||
	      field.key === "formEmbedCode" ||
	      field.key === "iframeEmbedCode"
	    );
	  }

	  function parseIframeEmbedValue(value) {
	    var text = toText(value).trim();
	    if (!text) return null;
	    if (text.toLowerCase().indexOf("<iframe") === -1) {
	      return { src: text, attrs: {} };
	    }

	    var template = document.createElement("template");
	    template.innerHTML = text;
	    var iframe = template.content.querySelector("iframe");
	    if (!iframe) return null;

	    var attrs = {};
	    [
	      "width",
	      "height",
	      "frameborder",
	      "marginheight",
	      "marginwidth",
	      "loading",
	      "referrerpolicy",
	      "allow",
	      "title"
	    ].forEach(function (name) {
	      var attrValue = iframe.getAttribute(name);
	      if (attrValue !== null && attrValue !== "") attrs[name] = attrValue;
	    });

	    return { src: iframe.getAttribute("src") || "", attrs: attrs };
	  }

	  function isSafeIframeSrc(value) {
	    return /^https?:\\/\\//i.test(value) || value.indexOf("/") === 0;
	  }

	  function applyIframeEmbedAttribute(node, field, value, attribute) {
	    if (!isIframeEmbedField(field)) return false;
	    if (String(node.tagName || "").toLowerCase() !== "iframe") return false;
	    if (attribute !== "src" && attribute !== "data-src") return false;

	    var embed = parseIframeEmbedValue(value);
	    if (!embed || !embed.src || !isSafeIframeSrc(embed.src)) return true;

	    node.setAttribute(attribute, embed.src);
	    [
	      "width",
	      "height",
	      "frameborder",
	      "marginheight",
	      "marginwidth",
	      "loading",
	      "referrerpolicy",
	      "allow",
	      "title"
	    ].forEach(function (name) {
	      if (embed.attrs[name]) node.setAttribute(name, embed.attrs[name]);
	    });

	    return true;
	  }

	  function normalizeAcademyThreeHeroLine(value) {
	    return String(value || "").replace(/\\s+/g, " ").trim();
	  }

	  function splitAcademyThreeHeroText(value) {
	    var words = normalizeAcademyThreeHeroLine(value).split(/\\s+/).filter(Boolean);
	    if (!words.length) return [];
	    if (words.length <= 4) return words;

	    var lines = [];
	    var remaining = words.slice();
	    for (var index = 0; index < 4; index += 1) {
	      var remainingSlots = 4 - index;
	      var take = Math.max(1, Math.ceil(remaining.length / remainingSlots));
	      lines.push(remaining.splice(0, take).join(" "));
	    }
	    return lines;
	  }

	  function getAcademyThreeHeroLines(value) {
	    var container = document.createElement("div");
	    container.innerHTML = toText(value);
	    container.querySelectorAll("br").forEach(function (breakNode) {
	      breakNode.replaceWith(document.createTextNode("\\n"));
	    });

	    var blockNodes = Array.from(container.children).filter(function (node) {
	      return isTextBlockElement(node);
	    });
	    var lines = blockNodes.length
	      ? blockNodes.map(function (node) {
	          return normalizeAcademyThreeHeroLine(node.textContent || "");
	        })
	      : String(container.textContent || "")
	          .split(/\\n+/)
	          .map(normalizeAcademyThreeHeroLine);

	    lines = lines.filter(Boolean);
	    if (lines.length > 1) return lines;
	    return splitAcademyThreeHeroText(lines[0] || "");
	  }

	  function escapeHtmlText(value) {
	    var span = document.createElement("span");
	    span.textContent = value || "";
	    return span.innerHTML;
	  }

	  function splitAtLastWord(value) {
	    var parts = normalizeAcademyThreeHeroLine(value).split(/\\s+/).filter(Boolean);
	    if (!parts.length) return { before: "", last: "" };
	    if (parts.length === 1) return { before: "", last: parts[0] };
	    return {
	      before: parts.slice(0, -1).join(" ") + " ",
	      last: parts[parts.length - 1]
	    };
	  }

		  function splitAtFirstWord(value) {
		    var parts = normalizeAcademyThreeHeroLine(value).split(/\\s+/).filter(Boolean);
		    if (!parts.length) return { first: "", after: "" };
		    if (parts.length === 1) return { first: parts[0], after: "" };
		    return {
		      first: parts[0],
		      after: " " + parts.slice(1).join(" ")
		    };
		  }

		  function getAcademyFourHeroHeadlineLines(value) {
		    var container = document.createElement("div");
		    container.innerHTML = toText(value);
		    container.querySelectorAll("br").forEach(function (breakNode) {
		      breakNode.replaceWith(document.createTextNode("\\n"));
		    });

		    var directSpanLines = Array.from(container.children)
		      .filter(function (node) {
		        return String(node.tagName || "").toLowerCase() === "span";
		      })
		      .map(function (node) {
		        return normalizeAcademyThreeHeroLine(node.textContent || "");
		      })
		      .filter(Boolean);
		    if (directSpanLines.length >= 2) {
		      return [directSpanLines[0], directSpanLines.slice(1).join(" ")];
		    }

		    var blockNodes = Array.from(container.children).filter(function (node) {
		      return isTextBlockElement(node);
		    });
		    var lines = blockNodes.length
		      ? blockNodes.map(function (node) {
		          return normalizeAcademyThreeHeroLine(node.textContent || "");
		        })
		      : String(container.textContent || "")
		          .split(/\\n+/)
		          .map(normalizeAcademyThreeHeroLine);

		    lines = lines.filter(Boolean);
		    if (lines.length >= 2) {
		      return [lines[0], lines.slice(1).join(" ")];
		    }

		    var words = normalizeAcademyThreeHeroLine(lines[0] || "")
		      .split(/\\s+/)
		      .filter(Boolean);
		    if (words.length <= 1) return [words[0] || "", ""];

		    var bestIndex = 1;
		    var bestScore = Infinity;
		    for (var index = 1; index < words.length; index += 1) {
		      var first = words.slice(0, index).join(" ");
		      var second = words.slice(index).join(" ");
		      var score = Math.abs(first.length - second.length);
		      if (score < bestScore) {
		        bestScore = score;
		        bestIndex = index;
		      }
		    }

		    return [
		      words.slice(0, bestIndex).join(" "),
		      words.slice(bestIndex).join(" ")
		    ];
		  }

		  function getAcademyFourHeroTextStyles(value) {
		    var container = document.createElement("div");
		    container.innerHTML = toText(value);
		    var styledNodes = Array.from(container.querySelectorAll("[style]"));
		    var styles = [];
		    var richTextProperties = [
		        "font-family",
		        "font-size",
		        "font-style",
		        "font-weight",
		        "text-decoration",
		        "text-transform",
		        "text-align",
		        "letter-spacing",
		        "color",
		        "background-color"
		      ];

		    richTextProperties.forEach(function (property) {
		      for (var index = 0; index < styledNodes.length; index += 1) {
		        var node = styledNodes[index];
		        var value = node.style && node.style.getPropertyValue(property);
		        if (value) {
		          styles.push({ property: property, value: value });
		          break;
		        }
		      }
		    });

		    if (container.querySelector("strong,b")) {
		      styles.push({ property: "font-weight", value: "700" });
		    }
		    if (container.querySelector("em,i")) {
		      styles.push({ property: "font-style", value: "italic" });
		    }
		    if (container.querySelector("u")) {
		      styles.push({ property: "text-decoration", value: "underline" });
		    }
		    if (container.querySelector("s,strike,del")) {
		      styles.push({ property: "text-decoration", value: "line-through" });
		    }

		    return styles.filter(function (item, index, items) {
		      return items.findIndex(function (candidate) {
		        return candidate.property === item.property;
		      }) === index;
		    });
		  }

		  function getAcademyFourHeroLineTextStyles(value, lines) {
		    var container = document.createElement("div");
		    container.innerHTML = toText(value);
		    var styledNodes = Array.from(container.querySelectorAll("[style]"));
		    var richTextProperties = [
		        "font-family",
		        "font-size",
		        "font-style",
		        "font-weight",
		        "text-decoration",
		        "text-transform",
		        "text-align",
		        "letter-spacing",
		        "color",
		        "background-color"
		      ];
		    var semanticSelectors = [
		      { selector: "strong,b", property: "font-weight", value: "700" },
		      { selector: "em,i", property: "font-style", value: "italic" },
		      { selector: "u", property: "text-decoration", value: "underline" },
		      { selector: "s,strike,del", property: "text-decoration", value: "line-through" }
		    ];

		    function normalizeText(text) {
		      return String(text || "").replace(/\\s+/g, " ").trim();
		    }

		    function nodeMatchesLine(node, line) {
		      var nodeText = normalizeText(node.textContent || "");
		      var lineText = normalizeText(line);
		      return Boolean(lineText && (nodeText === lineText || nodeText.indexOf(lineText) >= 0));
		    }

		    function getBestStyledNode(property, line) {
		      return styledNodes
		        .filter(function (node) {
		          return nodeMatchesLine(node, line) && node.style && node.style.getPropertyValue(property);
		        })
		        .sort(function (a, b) {
		          var aText = normalizeText(a.textContent || "");
		          var bText = normalizeText(b.textContent || "");
		          var lineText = normalizeText(line);
		          var aExact = aText === lineText ? 0 : 1;
		          var bExact = bText === lineText ? 0 : 1;
		          if (aExact !== bExact) return aExact - bExact;
		          return aText.length - bText.length;
		        })[0];
		    }

		    return lines.map(function (line) {
		      var styles = [];
		      richTextProperties.forEach(function (property) {
		        var node = getBestStyledNode(property, line);
		        var value = node && node.style && node.style.getPropertyValue(property);
		        if (value) styles.push({ property: property, value: value });
		      });

		      semanticSelectors.forEach(function (item) {
		        var node = Array.from(container.querySelectorAll(item.selector)).find(function (candidate) {
		          return nodeMatchesLine(candidate, line);
		        });
		        if (node) styles.push({ property: item.property, value: item.value });
		      });

		      return styles.filter(function (item, index, items) {
		        return items.findIndex(function (candidate) {
		          return candidate.property === item.property;
		        }) === index;
		      });
		    });
		  }

		  function applyAcademyFourHeroTextStyles(node, value) {
		    var styles = getAcademyFourHeroTextStyles(value);
		    if (!styles.length) return;

		    var targets = [node].concat(Array.from(node.querySelectorAll(":scope > span")));
		    targets.forEach(function (target) {
		      styles.forEach(function (item) {
		        target.style.setProperty(item.property, item.value, "important");
		      });
		    });
		  }

		  function applyAcademyFourHeroLineTextStyles(node, value, lines) {
		    var lineStyles = getAcademyFourHeroLineTextStyles(value, lines);
		    Array.from(node.querySelectorAll(":scope > span")).forEach(function (target, index) {
		      (lineStyles[index] || []).forEach(function (item) {
		        target.style.setProperty(item.property, item.value, "important");
		      });
		    });
		  }

		  function applyAcademyFourHeroDisplay(node, value) {
		    if (
		      preview.content.templateSlug !== "dexta-academy-4" ||
		      !node.classList ||
		      !node.classList.contains("hero-display")
		    ) {
		      return false;
		    }

		    var lines = getAcademyFourHeroHeadlineLines(value);
		    if (!lines[0] && !lines[1]) return false;

		    if (
		      node.querySelectorAll(":scope > span").length >= 2 &&
		      toComparableText(value) === toComparableText(node.innerHTML) &&
		      !hasRichTextColorStyle(value) &&
		      !hasRichTextFontStyle(value)
		    ) {
		      return true;
		    }

		    node.innerHTML = lines
		      .slice(0, 2)
		      .map(function (line) {
		        return "<span>" + escapeHtmlText(line) + "</span>";
		      })
		      .join("");
		    applyAcademyFourHeroTextStyles(node, value);
		    applyAcademyFourHeroLineTextStyles(node, value, lines.slice(0, 2));
		    return true;
		  }

		  function applyAcademyFourHeroEyebrow(node, value) {
		    if (
		      preview.content.templateSlug !== "dexta-academy-4" ||
		      !node.classList ||
		      !node.classList.contains("hero-eyebrow")
		    ) {
		      return false;
		    }

		    var container = document.createElement("div");
		    container.innerHTML = toText(value);
		    var text = normalizeAcademyThreeHeroLine(container.textContent || value);
		    if (!text) return false;

		    node.innerHTML =
		      '<span aria-hidden="true"></span>' +
		      escapeHtmlText(text) +
		      '<span aria-hidden="true"></span>';
		    applyAcademyFourHeroTextStyles(node, value);
		    return true;
		  }

			  function sanitizeAcademyThreeHeroFontSize(value) {
		    var text = String(value || "").trim();
		    return /^\\d+(?:\\.\\d+)?(?:px|rem|em|%)$/i.test(text) ? text : "";
		  }

		  function getAcademyThreeHeroFontSize(value) {
		    var container = document.createElement("div");
		    container.innerHTML = toText(value);
		    var styledNodes = Array.from(container.querySelectorAll("[style]"));
		    for (var index = 0; index < styledNodes.length; index += 1) {
		      var node = styledNodes[index];
		      var parsedSize = sanitizeAcademyThreeHeroFontSize(node.style && node.style.fontSize);
		      if (parsedSize) return parsedSize;
		      var style = node.getAttribute("style") || "";
		      var match = style.match(/font-size\\s*:\\s*([^;]+)/i);
		      var matchedSize = sanitizeAcademyThreeHeroFontSize(match && match[1]);
		      if (matchedSize) return matchedSize;
		    }
		    return "";
		  }

		  function getResponsiveAcademyThreeHeroFontSize(value) {
		    var size = getAcademyThreeHeroFontSize(value);
		    var pxMatch = size.match(/^(\\d+(?:\\.\\d+)?)px$/i);
		    if (!pxMatch) return size;

		    var pixels = Number(pxMatch[1]);
		    if (!Number.isFinite(pixels) || pixels <= 52) return size;
		    return "clamp(2.85rem, 10vw, " + size + ")";
		  }

		  function applyAcademyThreeHeroTitle(node, value) {
		    if (
	      preview.content.templateSlug !== "dexta-academy-3" ||
	      !node.classList ||
	      !node.classList.contains("hero__title")
	    ) {
	      return false;
	    }

	    var lines = getAcademyThreeHeroLines(value);
	    if (!lines.length) return false;

	    var lineOne = lines[0] || "";
	    var lineTwo = splitAtLastWord(lines[1] || "");
	    var lineThree = splitAtFirstWord(lines[2] || "");
	    var lineFour = lines.slice(3).join(" ");

	    node.innerHTML = [
	      '<span class="hero__line"><span class="hero__segment hero__segment--drop-top hero__step-3">' + escapeHtmlText(lineOne) + '</span></span>',
	      '<span class="hero__line"><span class="hero__segment hero__segment--drop-top hero__step-3">' + escapeHtmlText(lineTwo.before) + '</span><span class="hero__accent hero__accent--fade hero__accent--joyful hero__step-1">' + escapeHtmlText(lineTwo.last) + '</span></span>',
	      '<span class="hero__line"><span class="hero__accent hero__accent--fade hero__accent--bold hero__step-2">' + escapeHtmlText(lineThree.first) + '</span><span class="hero__segment hero__segment--drop-bottom hero__step-4">' + escapeHtmlText(lineThree.after) + '</span></span>',
	      '<span class="hero__line"><span class="hero__segment hero__segment--drop-bottom hero__step-4">' + escapeHtmlText(lineFour) + '</span></span>'
	    ].join("");
	    var heroFontSize = getResponsiveAcademyThreeHeroFontSize(value);
	    if (heroFontSize) {
	      node.style.setProperty("font-size", heroFontSize, "important");
	    } else {
	      node.style.removeProperty("font-size");
	    }
	    applyAcademyThreeHeroCurrentColors(node);

		    return true;
		  }

		  function getAcademyThreeHeroFieldText(fieldKey, fallback) {
		    var value = getPageSectionField("home", "hero", fieldKey);
		    return value === null || value === undefined || value === "" ? fallback : String(value).trim();
		  }

		  function applyAcademyThreeHeroCurrentColors(root) {
		    if (preview.content.templateSlug !== "dexta-academy-3") return;
		    var scope = root && root.matches && root.matches(".hero")
		      ? root
		      : root && root.closest
		        ? root.closest(".hero")
		        : document.querySelector(".hero");
		    if (!scope) return;

		    var headlineColor = getAcademyThreeHeroFieldText("headlineTextColor", "#fff");
		    var joyfulColor = getAcademyThreeHeroFieldText("joyfulAccentColor", "#ffc94c");
		    var boldColor = getAcademyThreeHeroFieldText("boldAccentColor", "#ffc94c");
		    queryWithin(scope, ".hero__title, .hero__line, .hero__segment").forEach(function (node) {
		      node.style.setProperty("color", headlineColor, "important");
		    });
		    queryWithin(scope, ".hero__accent--joyful").forEach(function (node) {
		      node.style.setProperty("color", joyfulColor, "important");
		    });
		    queryWithin(scope, ".hero__accent--bold").forEach(function (node) {
		      node.style.setProperty("color", boldColor, "important");
		    });
		  }

			  function applyAcademyThreeHeroColorField(root, field, cssValue) {
			    if (preview.content.templateSlug !== "dexta-academy-3" || !field || !field.key) return;
		    var selectors = [];
		    if (field.key === "headlineTextColor") {
		      selectors = [".hero__title", ".hero__line", ".hero__segment"];
		    }
		    if (field.key === "joyfulAccentColor") {
		      selectors = [".hero__accent--joyful"];
		    }
		    if (field.key === "boldAccentColor") {
		      selectors = [".hero__accent--bold"];
		    }
		    if (!selectors.length) return;

		    var scope = root && root.matches && root.matches(".hero")
		      ? root
		      : root && root.closest
		        ? root.closest(".hero")
		        : document.querySelector(".hero");
		    if (!scope) return;

		    selectors.forEach(function (selector) {
		      queryWithin(scope, selector).forEach(function (node) {
		        node.style.setProperty("color", cssValue, "important");
		      });
		    });
			    applyAcademyThreeHeroCurrentColors(scope);
			  }

			  function getCssUrl(value) {
			    var text = String(value || "").trim();
			    if (!text || text === "none") return "";
			    var start = text.toLowerCase().indexOf("url(");
			    if (start < 0) return "";
			    var raw = text.slice(start + 4);
			    var end = raw.lastIndexOf(")");
			    if (end >= 0) raw = raw.slice(0, end);
			    raw = raw.trim();
			    var quote = raw.charAt(0);
			    if ((quote === '"' || quote === "'") && raw.charAt(raw.length - 1) === quote) {
			      raw = raw.slice(1, -1);
			    }
			    return raw;
			  }

			  function applyAcademyThreeHeroBackgroundImage() {
			    if (preview.content.templateSlug !== "dexta-academy-3") return;
			    var hero = document.querySelector(".hero");
			    var skyImage = document.querySelector(".hero__sky-image");
			    if (!hero || !skyImage) return;

			    var bgImage = getComputedStyle(hero)
			      .getPropertyValue("--dexta-academy-3-home-hero-section-bg-image");
			    var asset = getCssUrl(bgImage);
			    if (!asset) return;

			    skyImage.setAttribute("src", asset);
			    hero.style.setProperty(
			      "--dexta-academy-3-home-hero-section-bg-image",
			      "none",
			    );
			    var skyLayer = document.querySelector(".hero__sky-layer");
			    if (skyLayer) {
			      skyLayer.style.setProperty("background-image", "none", "important");
			    }
			  }
		
					  function applyField(node, field, value) {
				    if (field.target === "threeConfig") {
				      applyThreeConfigField(field, value);
				      return;
			    }

		    if (preview.content.templateSlug === "dexta-academy-3") {
		      var isAcademyThreeHeroHeadline =
		        field.key === "headline" &&
		        node.classList &&
		        node.classList.contains("hero__title");
		      if (
		        !isAcademyThreeHeroHeadline &&
		        field.target === "textContent" &&
		        toComparableText(value) === toComparableText(node.innerHTML)
		      ) {
		        return;
		      }

		      if (
		        !isAcademyThreeHeroHeadline &&
		        field.target === "innerHTML" &&
		        !hasRichTextColorStyle(value) &&
		        !hasRichTextFontStyle(value) &&
		        toComparableText(value) === toComparableText(node.innerHTML)
		      ) {
	        return;
	      }
	    }

		    if (field.target === "cssVariable" && field.cssVariable) {
		      if (!isResponsiveScopeActive(field)) return;
		      var cssValue = getCssVariableValue(value, field);
		      node.style.setProperty(field.cssVariable, cssValue);
		      if (
		        preview.content.templateSlug === "dexta-academy-1" &&
		        String(field.cssVariable).indexOf("-icon-image") !== -1
		      ) {
		        node.querySelectorAll("i").forEach(function (icon) {
		          icon.style.opacity = cssValue && cssValue !== "none" ? "0" : "";
		        });
	      }
	      applyAcademyThreeHeroColorField(node, field, cssValue);
      if (field.cssVariable === "--cap-center-x") node.style.left = cssValue;
	      if (field.cssVariable === "--cap-center-y") node.style.top = cssValue;
	      return;
		    }

	    if (field.target === "innerHTML") {
	      if (field.key === "headline" && applyAcademyFourHeroDisplay(node, value)) {
	        return;
	      }
	      if (field.key === "eyebrow" && applyAcademyFourHeroEyebrow(node, value)) {
	        return;
	      }
	      if (field.key === "headline" && applyAcademyThreeHeroTitle(node, value)) {
	        return;
	      }
      setElementHtml(node, value);
      return;
    }

	    if (field.target === "attribute") {
	      var attribute = field.attribute || (field.type === "link" ? "href" : "src");
	      if (applyIframeEmbedAttribute(node, field, value, attribute)) return;
		      if (field.type === "image") {
	        applyImageAttribute(node, field, value, attribute);
	      } else {
        node.setAttribute(attribute, resolveAsset(value, field));
      }
      return;
    }

		    if (field.target === "backgroundImage") {
		      var rawBackgroundAsset = resolveAsset(value, field);
		      var backgroundAsset = rawBackgroundAsset.replace(/"/g, "&quot;");
		      node.style.backgroundImage = backgroundAsset ? 'url("' + backgroundAsset + '")' : "none";
		      if (
		        preview.content.templateSlug === "dexta-academy-4" &&
		        node.matches &&
		        node.matches(".gallery-preview-card, .gallery-page-card")
		      ) {
		        if (rawBackgroundAsset) {
		          node.setAttribute("href", rawBackgroundAsset);
		          node.setAttribute("data-dexta-lightbox-src", rawBackgroundAsset);
		        } else {
		          node.removeAttribute("data-dexta-lightbox-src");
		        }
		      }
		      if (shouldCoverBackgroundImage(field)) {
		        node.style.backgroundSize = "cover";
		        node.style.backgroundPosition = "center center";
		        node.style.backgroundRepeat = "no-repeat";
		      }
		      return;
		    }

	    if (field.target === "inlineStyle") {
	      if (String(field.key || "").toLowerCase().indexOf("fontfamily") >= 0) {
	        applyFontFamily(node, value);
	      }
	      return;
	    }

	    node.textContent = toText(value);
	  }

	  function applySection(sectionContent, sectionSnapshot) {
	    if (!sectionContent || !sectionSnapshot) return;
	    var roots = getSectionRoots(sectionSnapshot);

	    // Determine which fields are item-level when section is repeatable
	    var isTemplateOneFamilyNotes =
	      preview.content.templateSlug === "dexta-academy-1" &&
	      sectionContent.id === "testimonial-wall";
	    var repeatableSnapshot = sectionSnapshot.repeatable || (
	      isTemplateOneFamilyNotes
	        ? { itemSelector: ".testimonials-page__wall-card" }
	        : null
	    );
	    var isRepeatableSection = !!(
	      repeatableSnapshot &&
	      (sectionContent.repeatable || isTemplateOneFamilyNotes)
	    );
	    var itemLevelKeys = {};
	    if (isRepeatableSection) {
	      var itemSelector = isTemplateOneFamilyNotes
	        ? ".testimonials-page__wall-card"
	        : repeatableSnapshot.itemSelector;
	      roots.forEach(function (root) {
	        var sampleItems = queryWithin(root, itemSelector);
	        if (sampleItems.length > 0) {
	          var sampleItem = sampleItems[0];
	          sectionSnapshot.fields.forEach(function (field) {
	            // A field is item-level if it matches elements INSIDE an item
	            var matchesInItem = queryWithin(sampleItem, field.selector);
	            if (matchesInItem.length > 0) {
	              itemLevelKeys[field.key] = true;
	            }
	          });
	        }
	      });
	    }

	    // Apply section-level fields (skip item-level fields for repeatable sections)
	    sectionSnapshot.fields.forEach(function (field) {
	      var value = sectionContent.fields ? sectionContent.fields[field.key] : null;
      if (!shouldApplyField(value, field)) {
        // Hide social link anchors when their text label is cleared
	        if (
	          field.type === "text" &&
	          field.selector &&
	          field.selector.indexOf(".social-links a") !== -1
	        ) {
          roots.forEach(function (root) {
            queryWithin(root, field.selector).forEach(function (node) {
              node.style.display = isFilled(value) ? "" : "none";
            });
	          });
	        }
	        if (
	          field.type === "link" &&
	          field.selector &&
	          field.selector.indexOf(".landing-contact__socials a") !== -1
	        ) {
	          roots.forEach(function (root) {
	            queryWithin(root, field.selector).forEach(function (node) {
	              node.style.display = isFilled(value) && String(value).trim() !== "#" ? "" : "none";
	            });
	          });
	        }
	        return;
	      }

	      if (field.target === "threeConfig") {
	        applyThreeConfigField(field, value);
	        return;
	      }

      // Skip item-level fields at section level for repeatable sections
      if (isRepeatableSection && itemLevelKeys[field.key]) return;

      roots.forEach(function (root) {
	        queryWithin(root, field.selector).forEach(function (node) {
	          // Restore social links that were hidden
		          if (
		            field.selector &&
		            (field.selector.indexOf(".social-links a") !== -1 ||
		              field.selector.indexOf(".landing-contact__socials a") !== -1)
		          ) {
		            node.style.display = "";
		          }
		          applyField(node, field, value);
		          if (
		            field.type === "link" &&
		            field.selector &&
		            field.selector.indexOf(".landing-contact__socials a") !== -1
		          ) {
		            node.style.display = isFilled(value) && String(value).trim() !== "#" ? "" : "none";
		          }
		        });
	      });
	    });

	    if (!isRepeatableSection) return;
	    var itemContents =
	      sectionContent.repeatable && Array.isArray(sectionContent.repeatable.items)
	        ? sectionContent.repeatable.items
	        : [];
	    var shouldHideEmptyRepeatable =
	      preview.content.templateSlug === "dexta-academy-1" &&
	      (sectionContent.id === "testimonials" ||
	        sectionContent.id === "testimonial-wall");
	    if (!itemContents.length && !shouldHideEmptyRepeatable) return;

	    roots.forEach(function (root) {
	      var existingItems = queryWithin(root, itemSelector);
	      if (!existingItems.length) return;

	      if (!itemContents.length) {
	        existingItems.forEach(function (itemRoot) {
	          var hideTarget = itemRoot;
	          if (hideTarget.parentElement && hideTarget.parentElement !== root &&
	              hideTarget.parentElement.children.length === 1) {
	            hideTarget = hideTarget.parentElement;
	          }
	          itemRoot.setAttribute("data-dexta-repeatable-hidden", "true");
	          hideTarget.style.setProperty("display", "none", "important");
	        });
	        return;
	      }

	      // Only clone additional items if data has more items than the template
	      if (itemContents.length > existingItems.length) {
	        var lastItem = existingItems[existingItems.length - 1];
	        var cloneTarget = lastItem;
	        var insertParent = lastItem.parentNode;
	        // If the item is inside a single-child column wrapper, clone the wrapper too
	        if (lastItem.parentElement && lastItem.parentElement !== root &&
	            lastItem.parentElement.children.length === 1) {
	          cloneTarget = lastItem.parentElement;
	          insertParent = cloneTarget.parentNode;
	        }
	        for (var c = existingItems.length; c < itemContents.length; c++) {
	          var cloned = cloneTarget.cloneNode(true);
	          cloned.setAttribute("data-dexta-cloned", "true");
	          insertParent.appendChild(cloned);
	        }
	      }

	      // Re-query after cloning
	      var finalItems = queryWithin(root, itemSelector);

	      // Hide items beyond the data count
	      for (var h = itemContents.length; h < finalItems.length; h++) {
	        var hideTarget = finalItems[h];
	        if (hideTarget.parentElement && hideTarget.parentElement !== root &&
	            hideTarget.parentElement.children.length === 1) {
	          hideTarget = hideTarget.parentElement;
	        }
	        finalItems[h].setAttribute("data-dexta-repeatable-hidden", "true");
	        hideTarget.style.setProperty("display", "none", "important");
	      }

		      finalItems.forEach(function (itemRoot, itemIndex) {
		        var itemContent = itemContents[itemIndex];
		        if (!itemContent) return;
		        var activeItemDisplayTarget = itemRoot;
		        if (activeItemDisplayTarget.parentElement && activeItemDisplayTarget.parentElement !== root &&
		            activeItemDisplayTarget.parentElement.children.length === 1) {
		          activeItemDisplayTarget = activeItemDisplayTarget.parentElement;
		        }
		        itemRoot.removeAttribute("data-dexta-repeatable-hidden");
		        activeItemDisplayTarget.style.removeProperty("display");

		        if (
		          preview.content.templateSlug === "dexta-academy-1" &&
		          sectionContent.id === "values"
		        ) {
		          if (!isFilled(itemContent["valueTitle"])) {
		            itemContent["valueTitle"] = "New core value";
		          }
		          if (!isFilled(itemContent["valueBody"])) {
		            itemContent["valueBody"] = "Describe this core value.";
		          }
			          if (!isFilled(itemContent["iconClass"])) {
			            itemContent["iconClass"] = "fa fa-star";
			          }
			          itemRoot.removeAttribute("data-reveal");
			          itemRoot.removeAttribute("data-reveal-delay");
			          itemRoot.classList.remove("wow", "fadeInUp", "fadeInLeft", "fadeInRight");
			          itemRoot.style.setProperty("opacity", "1", "important");
			          itemRoot.style.setProperty("visibility", "visible", "important");
			          itemRoot.style.setProperty("transform", "none", "important");
			        }
	
		        // Auto-sync: if image is set but imageHref is not, copy image → imageHref
                if (itemContent["image"] && !itemContent["imageHref"]) {
                  itemContent["imageHref"] = itemContent["image"];
                }

                if (
                  preview.content.templateSlug === "dexta-academy-1" &&
                  sectionContent.id === "testimonial-wall" &&
                  !isFilled(itemContent["year"])
                ) {
                  var familyYear = itemRoot.querySelector(".testimonials-page__wall-meta span");
                  itemContent["year"] = familyYear ? familyYear.textContent : "";
                }

                sectionSnapshot.fields.forEach(function (field) {
	          if (field.target === "threeConfig") return;
	          if (!itemLevelKeys[field.key]) return;

	          var value = itemContent[field.key];

		          // Clear text/richText fields that are empty in per-item data
		          if (!isFilled(value)) {
		            if (field.target === "textContent" || field.target === "innerHTML") {
	              queryWithin(itemRoot, field.selector).forEach(function (node) {
	                if (field.target === "innerHTML") {
	                  setElementHtml(node, "");
	                } else {
	                  node.textContent = "";
	                }
	              });
	            }
	            return;
	          }

	          queryWithin(itemRoot, field.selector).forEach(function (node) {
	            applyField(node, field, value);
	          });
	        });
	      });
	    });
	  }

	  function injectTheme() {
	    var existing = document.querySelector('style[data-dexta-preview-theme]');
	    if (existing) existing.remove();
	    var style = document.createElement("style");
	    style.setAttribute("data-dexta-preview-theme", "true");
	    style.textContent = getThemeCss();
	    document.head.appendChild(style);
	  }

	  function mix(color, percent, fallback) {
	    return "color-mix(in srgb, " + color + " " + percent + "%, " + fallback + ")";
	  }

	  function getThemeScopeSelector() {
	    return [
	      ":root",
	      "body",
	      ".home-page",
	      ".school-homepage",
	      ".staff-page",
	      ".testimonials-page",
	      ".about-page",
	      ".gallery-page",
	      ".contact-page",
	      ".school-about-page",
	      ".school-academics-page",
	      ".school-admissions-page",
	      ".school-contact-page",
	      ".school-gallery-page"
	    ].join(", ");
	  }
	
	  function getThemeVariableCss() {
	    var primary = preview.content.theme.primaryColor;
	    var secondary = preview.content.theme.secondaryColor;
	    var tertiary = preview.content.theme.tertiaryColor || "#dc422e";
	    var templateGreen = preview.content.theme.templateGreenColor || "#378F00";
	    var templateLightGreen = preview.content.theme.templateLightGreenColor || "#91B900";
	    var templateYellow = preview.content.theme.templateYellowColor || "#E6AE00";
	    var templateOrange = preview.content.theme.templateOrangeColor || "#D98100";
	    var primaryDark = mix(primary, 78, "#000");
	    var primarySoft = mix(primary, 16, "#fff");
	    var secondaryDark = mix(secondary, 82, "#000");
	    var secondarySoft = mix(secondary, 80, "#fff");
	    var tertiaryDark = mix(tertiary, 82, "#000");
	    var common =
	      "--dexta-school-primary:" + primary + ";" +
	      "--dexta-school-secondary:" + secondary + ";" +
	      "--dexta-school-tertiary:" + tertiary + ";" +
	      "--dexta-school-green:" + templateGreen + ";" +
	      "--dexta-school-light-green:" + templateLightGreen + ";" +
	      "--dexta-school-yellow:" + templateYellow + ";" +
	      "--dexta-school-orange:" + templateOrange + ";" +
	      "--bs-primary:" + primary + ";" +
	      "--bs-secondary:" + secondary + ";";
	
	    if (preview.content.templateSlug === "dexta-academy-1") {
	      return common +
	        "--primary:" + primary + ";" +
	        "--primary-dark:" + primaryDark + ";" +
	        "--primary-light:" + primarySoft + ";" +
	        "--accent:" + secondary + ";" +
	        "--staff-emerald:" + primary + ";" +
	        "--staff-forest:" + primaryDark + ";" +
	        "--staff-mint:" + primarySoft + ";" +
	        "--staff-coral:" + secondary + ";" +
	        "--testimonial-emerald:" + primary + ";" +
	        "--testimonial-forest:" + primaryDark + ";" +
	        "--testimonial-coral:" + secondary + ";" +
	        "--testimonial-mint:" + primarySoft + ";" +
	        "--testimonial-peach:" + secondarySoft + ";";
	    }
	
	    if (preview.content.templateSlug === "dexta-academy-2") {
	      return common +
	        "--bg:" + primary + ";" +
	        "--bg-deep:" + primaryDark + ";" +
	        "--accent:" + secondary + ";" +
	        "--accent-deep:" + secondaryDark + ";" +
	        "--accent-2:" + secondarySoft + ";" +
	        "--dexta-academy-2-green:" + templateGreen + ";" +
	        "--dexta-academy-2-light-green:" + templateLightGreen + ";" +
	        "--dexta-academy-2-yellow:" + templateYellow + ";" +
	        "--dexta-academy-2-orange:" + templateOrange + ";";
	    }
	
	    if (preview.content.templateSlug === "dexta-academy-3") {
	      return common +
	        "--navy:" + primary + ";" +
	        "--navy-deep:" + primaryDark + ";" +
	        "--gold:" + secondary + ";" +
	        "--gold-deep:" + secondaryDark + ";" +
	        "--red:" + tertiary + ";" +
	        "--red-deep:" + tertiaryDark + ";";
	    }
	
	    if (preview.content.templateSlug === "dexta-academy-4") {
	      return common +
	        "--blue:" + primary + ";" +
	        "--blue-bright:" + secondary + ";" +
	        "--blue-dim:" + mix(primary, 40, "transparent") + ";" +
	        "--blue-glow:" + mix(primary, 18, "transparent") + ";" +
	        "--primary:" + primary + ";" +
	        "--orange:" + secondary + ";" +
	        "--warning:" + secondary + ";";
	    }

	    if (preview.content.templateSlug === "dexta-academy-5") {
	      return common +
	        "--navy:" + primary + ";" +
	        "--navy-soft:" + mix(primary, 78, "#fff") + ";" +
	        "--gold:" + secondary + ";" +
	        "--gold-deep:" + secondaryDark + ";";
	    }
	
	    return common;
	  }
	
		  function getTemplateThemeCss() {
		    var primary = preview.content.theme.primaryColor;
		    var secondary = preview.content.theme.secondaryColor;
		    var secondaryDark = mix(secondary, 82, "#000");
		    var primaryFaint = mix(primary, 18, "transparent");
		
		    if (preview.content.templateSlug === "dexta-academy-1") {
		      return [
		        ".btn.btn-primary,.school-hero__btn--primary,.staff-page .btn.btn-primary,.testimonials-page .btn.btn-primary{background:var(--primary)!important;border-color:var(--primary)!important;}",
		        ".btn.btn-primary:hover,.school-hero__btn--primary:hover,.staff-page .btn.btn-primary:hover,.testimonials-page .btn.btn-primary:hover{background:var(--primary-dark)!important;border-color:var(--primary-dark)!important;}",
		        ".school-hero__btn--secondary{color:var(--primary)!important;}",
		        ".staff-page__hero,.staff-page__growth-panel,.testimonials-page__hero{background:linear-gradient(135deg,var(--primary) 0%,var(--primary-dark) 100%)!important;}",
		        ".staff-page [class*='card'],.staff-page [class*='panel'],.testimonials-page [class*='card'],.testimonials-page [class*='panel']{border-color:" + primaryFaint + "!important;}"
		      ].join("");
		    }
		
			    if (preview.content.templateSlug === "dexta-academy-2") {
			      return [
			        ".button--primary,.section--accent{background:var(--accent)!important;}",
			        ".button--primary:hover{background:var(--accent-2)!important;}",
			        ".section--dark{background:var(--bg)!important;}",
			        "body[data-page='home'] .hero-home__actions .button--primary{background:transparent!important;color:var(--text-white)!important;border:1px solid rgba(255,255,255,.9)!important;}",
			        "body[data-page='home'] .hero-home__actions .button--primary:hover{background:rgba(255,255,255,.1)!important;border-color:var(--text-white)!important;}",
			        ".button--outline-light:hover,.button--outline-dark:hover,.stat-card,.card,.news-card{border-color:var(--accent)!important;}"
			      ].join("");
			    }
		
		    if (preview.content.templateSlug === "dexta-academy-3") {
		      var navHoverEnabled = preview.content.theme.navHoverEnabled !== false;
		      var navHoverColor = preview.content.theme.navHoverColor || secondary;
		      var buttonOverlayEnabled = preview.content.theme.buttonOverlayEnabled !== false;
		      var buttonOverlayColor = preview.content.theme.buttonOverlayColor || "#ffffff";
			      var buttonOverlaySelectorList = [
			        "button",
			        ".button",
			        ".contact-button",
			        ".filter-chip",
			        ".gallery-filter",
			        ".gallery-page .gallery-pagination__button",
			        ".gallery-lightbox__close",
			        ".circle-button",
			        ".nav-toggle",
			        ".admission-modal__close",
			        ".story-modal__close",
			        ".testimonial-thumb"
			      ];
			      var buttonOverlaySelectors = buttonOverlaySelectorList.join(",");
			      var buttonOverlayPseudoSelectors = buttonOverlaySelectorList.map(function(selector) {
			        return selector + "::before";
			      }).join(",");
			      var buttonOverlayHoverSelectors = buttonOverlaySelectorList.map(function(selector) {
			        return selector + ":hover::before," + selector + ":focus-visible::before";
			      }).join(",");
			      var buttonOverlayChildSelectors = buttonOverlaySelectorList.map(function(selector) {
			        return selector + ">*";
			      }).join(",");
		      return [
		        ".button--navy{background:var(--navy)!important;}",
		        ".button--gold{background:var(--gold)!important;color:var(--navy-deep)!important;}",
		        ".button--gold,.button--outline-light:hover,.programme-card,.programme-tile,.contact-card,.info-card{border-color:var(--gold)!important;}",
		        ".button--navy,.footer,.admission-modal__panel{border-color:var(--navy)!important;}",
		        ".programme-card--featured,.timeline__marker,.contact-hero,.about-cta{background:var(--navy)!important;}",
		        ".apply-card__badge,.gallery-filter.is-active{background:var(--gold)!important;border-color:var(--gold)!important;}",
			        navHoverEnabled
			          ? ".site-nav a:hover,.site-nav a:focus-visible{color:" + navHoverColor + "!important;}.site-nav a::after{display:block!important;background:" + navHoverColor + "!important;}"
			          : ".site-nav a::after{display:none!important;}.site-nav a:hover,.site-nav a:focus-visible{color:inherit!important;}",
				        buttonOverlayEnabled
				          ? buttonOverlaySelectors + '{position:relative!important;overflow:hidden!important;isolation:isolate;}' + buttonOverlayPseudoSelectors + '{content:""!important;position:absolute!important;inset:0!important;border-radius:inherit!important;background:' + buttonOverlayColor + '!important;opacity:0!important;pointer-events:none!important;transition:opacity 180ms ease!important;z-index:0!important;}' + buttonOverlayHoverSelectors + '{opacity:.24!important;}' + buttonOverlayChildSelectors + '{position:relative;z-index:1;}'
				          : buttonOverlayPseudoSelectors + "{display:none!important;content:none!important;}"
			      ].join("");
			    }
		
		    if (preview.content.templateSlug === "dexta-academy-4") {
		      return [
		        ".btn-primary,.btn.btn-primary,.hero-apply-btn,.hero-primary-btn,.school-homepage .btn.btn-primary,.school-about-page .btn.btn-primary,.school-admissions-page .btn.btn-primary,.school-contact-page .btn.btn-primary,.bg-primary{background:" + primary + "!important;border-color:" + primary + "!important;color:#fff!important;}",
		        ".btn-primary:hover,.btn.btn-primary:hover,.hero-apply-btn:hover,.hero-primary-btn:hover,.school-homepage .btn.btn-primary:hover,.school-about-page .btn.btn-primary:hover,.school-admissions-page .btn.btn-primary:hover,.school-contact-page .btn.btn-primary:hover,.school-about-page .btn.btn-primary:focus,.school-admissions-page .btn.btn-primary:focus,.school-contact-page .btn.btn-primary:focus{background:" + secondary + "!important;border-color:" + secondary + "!important;}",
		        ".hero-apply-btn,.hero-apply-btn:hover,.hero-apply-btn:focus,.hero-portal-btn,.hero-portal-btn:hover,.hero-portal-btn:focus,.school-about-page .hero-apply-btn,.school-about-page .hero-apply-btn:hover,.school-about-page .hero-portal-btn,.school-about-page .hero-portal-btn:hover,.school-admissions-page .hero-apply-btn,.school-admissions-page .hero-apply-btn:hover,.school-admissions-page .hero-portal-btn,.school-admissions-page .hero-portal-btn:hover,.school-contact-page .hero-apply-btn,.school-contact-page .hero-apply-btn:hover,.school-contact-page .hero-portal-btn,.school-contact-page .hero-portal-btn:hover,.school-gallery-page .hero-apply-btn,.school-gallery-page .hero-apply-btn:hover,.school-gallery-page .hero-portal-btn,.school-gallery-page .hero-portal-btn:hover{color:#fff!important;}",
		        ".btn-outline-primary{border-color:" + primary + "!important;color:" + primary + "!important;}",
		        ".btn-outline-primary:hover{background:" + primary + "!important;color:#fff!important;}",
		        ".text-primary,.school-homepage .section-label,.school-homepage .feature-icon,.heading-section .subheading,.school-about-page a:hover,.school-contact-page a:hover,.ftco-navbar-light .navbar-nav > .nav-item.active > a{color:" + primary + "!important;}",
		        ".bg-secondary{background:" + secondary + "!important;}",
		        ".text-secondary{color:" + secondaryDark + "!important;}",
		        "#ftco-loader .path{stroke:" + primary + "!important;}",
		        ".school-page-hero,.about-page-hero,.admissions-page-hero,.contact-page-hero{background-color:" + primary + "!important;}",
		        ".gallery-pagination-btn:hover,.gallery-pagination-btn:focus,.gallery-pagination-number:hover,.gallery-pagination-number:focus,.gallery-pagination-number.is-active{background:" + primary + "!important;border-color:" + primary + "!important;color:#fff!important;}",
		        ".hero-secondary-btn,.btn-outline-primary,.school-card,.programme-card,.feature-card,.contact-detail-card,.gallery-pagination-btn,.gallery-pagination-number{border-color:" + primary + "!important;}",
		        "@media(max-width:991.98px){.hero-header .navbar-collapse.show{max-height:calc(100vh - 80px);overflow-y:auto;}}",
		        "@media(min-width:992px){.navbar-collapse .hero-navbar-actions-mobile{display:none!important;}}"
		      ].join("");
		    }

		    if (preview.content.templateSlug === "dexta-academy-5") {
		      return [
		        ".hero,.site-footer,.page-hero--about,.page-hero--campus,.page-hero--contact,.page-hero--center,.page-section--olive,.value-card--dark,.contact-form-panel{background:" + primary + "!important;}",
		        ".button--primary,.hero .button--primary,.button--olive,.about-preview__button,.journey-action{background:" + primary + "!important;color:#fff!important;}",
		        ".header-cta,.approach-section .button--olive,.page-actions .button--olive,.journey-action__icon,.story-read-more{background:" + secondary + "!important;color:" + primary + "!important;}",
		        ".hero__eyebrow,.section-heading>p,.page-kicker,.about-preview__eyebrow,.programme-card--gold a,.gallery-card span,.contact-panel article span{color:" + secondary + "!important;}",
		        ".programme-card__icon,.value-card span,.testimonial-card>span{color:" + secondary + "!important;}",
		        ".site-nav a.is-active,.site-nav a:hover,.programme-card a{color:" + primary + "!important;}",
		        ".site-nav a:not(.site-nav__button)::after,.testimonial-dots span,.about-preview__quote-mark{background:" + secondary + "!important;}"
		      ].join("");
		    }
	
	    return "";
	  }
	
		  function getTemplateBodyFont() {
		    var font = String(preview.content.theme.fontFamily || "").trim();
		    if (preview.content.templateSlug === "dexta-academy-2") {
		      var normalized = font.replace(/["']/g, "").toLowerCase();
		      var isLegacyDefault = normalized.indexOf("plus jakarta sans") !== -1 || normalized.indexOf("manrope") !== -1;
		      return !font || isLegacyDefault ? "Montserrat" : font;
		    }
		    if (preview.content.templateSlug === "dexta-academy-1" || preview.content.templateSlug === "dexta-academy-5") {
		      return font || "Manrope";
		    }
		    if (preview.content.templateSlug === "dexta-academy-4") {
		      return font || "Manrope";
		    }
		    return font;
		  }

		  function getThemeCss() {
			    return getThemeScopeSelector() + "{" + getThemeVariableCss() + "}" +
			      getTemplateBodyFontCss() +
			      getNavLinkFontCss() +
		      getGlobalAppearanceCss() +
		      getTemplateThemeCss() +
		      getTemplateOverrideCss();
		  }

		  function getTemplateBodyFontCss() {
		    var bodyFont = getTemplateBodyFont();
			    if (!bodyFont) return "";
		    return "body,h1,h2,h3,h4,h5,h6,p,li,a,span,label,input,textarea,select,button{font-family:" + JSON.stringify(bodyFont) + ', "Segoe UI", sans-serif!important;}';
		  }

		  function getTemplateChromeFont() {
		    var font = String(preview.content.theme.navLinkFontFamily || preview.content.theme.fontFamily || "").trim();
		    if (preview.content.templateSlug === "dexta-academy-2") {
		      var normalized = font.replace(/["']/g, "").toLowerCase();
		      var isLegacyDefault = normalized.indexOf("plus jakarta sans") !== -1 || normalized.indexOf("manrope") !== -1;
		      return !font || isLegacyDefault ? "Montserrat" : font;
		    }
		    if (preview.content.templateSlug === "dexta-academy-1" || preview.content.templateSlug === "dexta-academy-5") {
		      return font || "Manrope";
		    }
		    if (preview.content.templateSlug === "dexta-academy-4") {
		      return font || "Manrope";
		    }
		    return font;
		  }

		  function getNavLinkFontCss() {
		    var navLinkFont = getTemplateChromeFont();
		    if (!navLinkFont) return "";
		    var selectors = [
		      ".navbar-nav .nav-link",
		      ".navbar-nav a",
		      ".site-nav a",
		      ".site-nav__link",
		      ".mobile-nav a",
		      ".mobile-nav__link",
		      ".site-header__nav a",
		      ".site-header__links a",
		      ".main-nav a",
		      ".site-footer",
		      ".site-footer a",
		      ".footer__links a",
		      ".footer__contact",
		      ".footer__bottom"
		    ];

		    if (preview.content.templateSlug === "dexta-academy-2") {
		      selectors = selectors.concat([
		        ".button",
		        ".site-header .button",
		        ".mobile-panel .button",
		        ".hero-home__actions .button",
		        ".cta-banner .button",
		        ".admission-modal .button",
		        ".story-modal .button",
		        ".card__link"
		      ]);
		    }

	    var fallback = ', "Segoe UI", sans-serif';
	    return selectors.join(",") + "{font-family:" + JSON.stringify(navLinkFont) + fallback + "!important;}";
	  }

	  function getGlobalAppearanceCss() {
		    var loadingBackground = preview.content.theme.loadingBackgroundColor || "#ffffff";
		    var loadingTextColor = preview.content.theme.loadingTextColor || "currentColor";
		    var isTemplateOne = preview.content.templateSlug === "dexta-academy-1";
		    var isTemplateTwo = preview.content.templateSlug === "dexta-academy-2";
		    var isTemplateThree = preview.content.templateSlug === "dexta-academy-3";
		    var navbarOpacity = Math.max(0, Math.min(100, Number(preview.content.theme.navBarOpacity == null ? 100 : preview.content.theme.navBarOpacity)));
		    var navbarColor = preview.content.theme.navBarColor || "#ffffff";
		    var navbarBackground = preview.content.theme.navBarTransparent
		      ? (isTemplateThree ? "color-mix(in srgb, " + navbarColor + " " + navbarOpacity + "%, transparent)" : "transparent")
		      : (isTemplateThree ? navbarColor : "color-mix(in srgb, " + navbarColor + " " + navbarOpacity + "%, transparent)");
		    var navbarShadow = preview.content.theme.navBarTransparent && !isTemplateThree
		      ? "none"
	      : "0 16px 40px rgba(0,0,0,.08)";
	    var logoBorder = preview.content.theme.logoBorderEnabled
	      ? "1px solid " + (preview.content.theme.logoBorderColor || "rgba(255,255,255,.35)")
	      : "0";
	    var logoShadow = "none";
	    var logoBackground = preview.content.theme.logoBackgroundColor || "transparent";
		    var logoRadius = (Number(preview.content.theme.logoBorderRadius || 0)) + "px";
	    var logoWidth = (Number(preview.content.theme.logoWidth || 56)) + "px";
		    var logoHeight = (Number(preview.content.theme.logoHeight || 56)) + "px";
		    var loadingLogoWidth = (Number(preview.content.theme.loadingLogoWidth || preview.content.theme.logoWidth || 56)) + "px";
		    var loadingLogoHeight = (Number(preview.content.theme.loadingLogoHeight || preview.content.theme.logoHeight || 56)) + "px";
		    var loadingCardBorderColor = preview.content.theme.loadingCardBorderColor || "rgba(255,255,255,0.1)";
		    var loadingCardBorderWidth = Math.max(0, Math.min(12, Number(preview.content.theme.loadingCardBorderWidth == null ? 1 : preview.content.theme.loadingCardBorderWidth)));
		    var loadingCardShadowColor = preview.content.theme.loadingCardShadowColor || "#010814";
		    var loadingCardShadowOpacity = Math.max(0, Math.min(100, Number(preview.content.theme.loadingCardShadowOpacity == null ? 42 : preview.content.theme.loadingCardShadowOpacity)));
		    var loadingCardInsetShadow = loadingCardShadowOpacity > 0 ? ",inset 0 1px 0 rgba(255,255,255,.06)" : "";
				    var brandTextDisplay = preview.content.theme.brandTextVisible ? "" : "none";
		    var brandLine2Display = preview.content.theme.brandTextVisible && String(preview.content.theme.brandTagline || "").trim() ? "" : "none";
		    var css = [
		      "#spinner,.site-loader,.site-preloader,#ftco-loader,#ftco-loader.fullscreen,#ftco-loader.show.fullscreen{background:" + loadingBackground + "!important;background-color:" + loadingBackground + "!important;color:" + loadingTextColor + "!important;}"
		    ];

			    if (isTemplateTwo) {
		      if (!preview.content.theme.navBarTransparent) {
		        css.push(".site-header,.site-header.is-scrolled{background:" + navbarBackground + "!important;background-color:" + navbarBackground + "!important;box-shadow:" + navbarShadow + "!important;}");
		        css.push("body[data-page='home'] .site-header__bar{background:" + navbarBackground + "!important;background-color:" + navbarBackground + "!important;}");
		      }
		    } else if (preview.content.templateSlug === "dexta-academy-4") {
		      // Template 4: only override .hero-header/.hero-navbar if user explicitly set a navBarColor
		      if (preview.content.theme.navBarColor && preview.content.theme.navBarColor !== "#ffffff" && !preview.content.theme.navBarTransparent) {
		        css.push(".hero-header,.hero-navbar{background:" + navbarBackground + "!important;background-color:" + navbarBackground + "!important;box-shadow:" + navbarShadow + "!important;}");
		      }
		      css.push(".navbar,.navbar.bg-white,.site-header,.site-header__bar,.ftco-navbar-light{background:" + navbarBackground + "!important;background-color:" + navbarBackground + "!important;box-shadow:" + navbarShadow + "!important;}");
		    } else if (preview.content.templateSlug === "dexta-academy-3") {
		      css.push(".site-header{background:" + navbarBackground + "!important;background-color:" + navbarBackground + "!important;background-image:none!important;box-shadow:" + navbarShadow + "!important;backdrop-filter:" + (preview.content.theme.navBarTransparent ? "blur(18px)" : "none") + "!important;}");
		      css.push(".navbar,.navbar.bg-white,.ftco-navbar-light{background:" + navbarBackground + "!important;background-color:" + navbarBackground + "!important;box-shadow:" + navbarShadow + "!important;}");
		    } else if (preview.content.templateSlug === "dexta-academy-5") {
		      // Template 5: .site-header is handled by getTemplateOverrideCss — skip it here
		      css.push(".navbar,.navbar.bg-white,.ftco-navbar-light{background:" + navbarBackground + "!important;background-color:" + navbarBackground + "!important;box-shadow:" + navbarShadow + "!important;}");
		    } else {
		      css.push(".navbar,.navbar.bg-white,.site-header,.site-header__bar,.hero-header,.hero-navbar,.ftco-navbar-light{background:" + navbarBackground + "!important;background-color:" + navbarBackground + "!important;box-shadow:" + navbarShadow + "!important;}");
		    }

			    var templateTwoLegacyLogoDefaults =
		      !getThemeLogoUrl() &&
		      Number(preview.content.theme.logoWidth || 56) === 56 &&
		      Number(preview.content.theme.logoHeight || 56) === 56 &&
		      Number(preview.content.theme.logoBorderRadius || 0) === 18 &&
		      String(preview.content.theme.logoBorderColor || "").toLowerCase() === "#ffc433" &&
		      Boolean(preview.content.theme.logoBorderEnabled);
		    var templateTwoOriginalLogoDefaults =
		      !getThemeLogoUrl() &&
		      Number(preview.content.theme.logoWidth || 48) === 48 &&
		      Number(preview.content.theme.logoHeight || 48) === 48 &&
		      Number(preview.content.theme.logoBorderRadius || 0) === 12 &&
		      String(preview.content.theme.logoBorderColor || "").toLowerCase() === "#ffc433" &&
		      Boolean(preview.content.theme.logoBorderEnabled);
			    var shouldApplyLogoFrame =
			      !isTemplateThree &&
			      (!isTemplateTwo || getThemeLogoUrl() || (!templateTwoLegacyLogoDefaults && !templateTwoOriginalLogoDefaults));

			    if (shouldApplyLogoFrame) {
		      css.push(".brand__mark,.brand__crest,.page-loader__crest,.contact-brand>img,.navbar-brand img,.hero-brand img,.school-footer-brand-logo,.site-preloader-logo{border:" + logoBorder + "!important;border-radius:" + logoRadius + "!important;width:" + logoWidth + "!important;height:" + logoHeight + "!important;max-width:" + logoWidth + "!important;}");
		      css.push(".dexta-theme-logo-mark{background:" + logoBackground + "!important;overflow:hidden;}.dexta-theme-logo-mark::before{content:none!important;}.dexta-theme-logo-mark svg,.dexta-theme-logo-mark .brand__crest-inner{display:none!important;}.site-loader__mark.dexta-theme-logo-mark{overflow:visible!important;}");
		      css.push(".brand__mark img,.brand__crest img,.site-loader__mark img,.page-loader__crest img{display:block;width:100%;height:100%;object-fit:contain;}");
			      css.push(".navbar-brand img,.hero-brand img,.school-footer-brand-logo,.site-preloader-logo,.contact-footer__brand img{object-fit:contain;}");
			    }

				    if (isTemplateThree) {
				      css.push(".brand__crest{border:" + logoBorder + "!important;border-radius:" + logoRadius + "!important;box-shadow:" + logoShadow + "!important;width:" + logoWidth + "!important;height:" + logoHeight + "!important;max-width:" + logoWidth + "!important;background:" + logoBackground + "!important;}");
				      css.push(".page-loader__crest{border:0!important;border-radius:" + logoRadius + "!important;box-shadow:none!important;width:" + loadingLogoWidth + "!important;height:" + loadingLogoHeight + "!important;max-width:" + loadingLogoWidth + "!important;background:" + logoBackground + "!important;}");
				      css.push(".brand__crest.dexta-empty-logo-mark,.page-loader__crest.dexta-empty-logo-mark{display:none!important;}");
				      css.push(".brand__crest.dexta-theme-logo-mark,.page-loader__crest.dexta-theme-logo-mark{display:grid!important;place-items:center!important;overflow:hidden;}");
				      css.push(".brand__crest.dexta-theme-logo-mark::before,.page-loader__crest.dexta-theme-logo-mark::before{content:none!important;}");
				      css.push(".brand__crest img,.page-loader__crest img{display:block;width:100%;height:100%;object-fit:contain;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;}");
				    }

			    if (isTemplateOne) {
			      css.push("#spinner.dexta-template-one-loader{flex-direction:column!important;gap:14px!important;}");
			      css.push("#spinner.dexta-template-one-loader .dexta-loading-logo{display:grid!important;place-items:center!important;width:" + loadingLogoWidth + "!important;height:" + loadingLogoHeight + "!important;max-width:" + loadingLogoWidth + "!important;background:" + logoBackground + "!important;border-radius:" + logoRadius + "!important;overflow:hidden!important;}");
			      css.push("#spinner.dexta-template-one-loader .dexta-loading-logo img{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;}");
			      css.push("#spinner.dexta-template-one-loader .spinner-border{width:3rem!important;height:3rem!important;}");
			      css.push("#spinner.dexta-template-one-loader .dexta-loading-text{color:" + loadingTextColor + "!important;font-size:.95rem!important;font-weight:700!important;line-height:1.4!important;}");
			    } else if (!isTemplateThree) {
			      css.push("#spinner{flex-direction:column!important;gap:14px!important;}");
			      css.push("#spinner .dexta-loading-logo,#spinner .spinner-border,.site-loader__mark,.page-loader__crest,.dexta-generated-loader__logo{display:grid!important;place-items:center!important;width:" + loadingLogoWidth + "!important;height:" + loadingLogoHeight + "!important;max-width:" + loadingLogoWidth + "!important;object-fit:contain!important;}");
			      css.push(".site-preloader-logo{display:block!important;width:" + loadingLogoWidth + "!important;height:" + loadingLogoHeight + "!important;max-width:" + loadingLogoWidth + "!important;object-fit:contain!important;}");
			      css.push("#spinner .dexta-loading-logo img,.site-loader__mark img,.page-loader__crest img,.site-preloader-logo,.dexta-generated-loader__logo img{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;}");
			      css.push("#spinner .dexta-loading-text,.site-loader__text,.page-loader__copy,.site-preloader-content [data-dexta-loading-text],.dexta-generated-loader__text{color:" + loadingTextColor + "!important;font-size:.95rem;font-weight:700;line-height:1.4;}");
			    }
		    var loadingBarColor = preview.content.theme.loadingBarColor || "";
		    if (loadingBarColor) {
		      css.push("#spinner.dexta-template-one-loader .spinner-border{color:" + loadingBarColor + "!important;}");
		      css.push(".site-loader__bar::after,.page-loader__bar{background:" + loadingBarColor + "!important;}");
		    }

				    if (isTemplateThree) {
				      css.push(".page-loader,.js body .page-loader{background:" + loadingBackground + "!important;background-color:" + loadingBackground + "!important;color:" + loadingTextColor + "!important;}");
				      css.push(".page-loader__inner{background:" + loadingBackground + "!important;background-color:" + loadingBackground + "!important;border:" + loadingCardBorderWidth + "px solid " + loadingCardBorderColor + "!important;box-shadow:0 34px 70px color-mix(in srgb," + loadingCardShadowColor + " " + loadingCardShadowOpacity + "%,transparent)" + loadingCardInsetShadow + "!important;}");
				      css.push(".page-loader__copy{color:" + loadingTextColor + "!important;}");
				    }

					    css.push(".brand__name,.brand__copy,.brand__text,.contact-brand>span{display:" + brandTextDisplay + "!important;}");
				    css.push(".brand__name span,.brand__copy span,.brand__text span,.contact-brand small{display:" + brandLine2Display + "!important;}");

			    var templateTwoLegacyBrandDefaults =
		      String(preview.content.theme.brandNameColor || "").toLowerCase() === "#ffffff" &&
		      String(preview.content.theme.brandTaglineColor || "").toLowerCase() === "#d1d5db" &&
		      Number(preview.content.theme.brandNameFontSize || 16) === 16 &&
		      Number(preview.content.theme.brandTaglineFontSize || 12) === 12;
		    var templateTwoOriginalBrandDefaults =
		      String(preview.content.theme.brandNameColor || "").toLowerCase() === "#ffffff" &&
		      String(preview.content.theme.brandTaglineColor || "").toLowerCase() === "#facc15" &&
		      Number(preview.content.theme.brandNameFontSize || 26) === 26 &&
		      Number(preview.content.theme.brandTaglineFontSize || 13) === 13;

	    if (!isTemplateTwo || (!templateTwoLegacyBrandDefaults && !templateTwoOriginalBrandDefaults)) {
	      css.push(".brand__name strong,.brand__copy strong,.brand__text strong,.contact-brand strong,.school-footer-brand h3{color:" + (preview.content.theme.brandNameColor || "#111827") + "!important;font-size:" + (Number(preview.content.theme.brandNameFontSize || 16)) + "px!important;}");
	      css.push(".brand__name span,.brand__copy span,.brand__text span,.contact-brand small{color:" + (preview.content.theme.brandTaglineColor || "#6b7280") + "!important;font-size:" + (Number(preview.content.theme.brandTaglineFontSize || 12)) + "px!important;}");
	    }

		    return css.join("");
		  }
		
	  function getTemplateOverrideCss() {
		    if (preview.content.templateSlug === "dexta-academy-1") {
		      var academyOneLogoWidth = (Number(preview.content.theme.logoWidth || 72)) + "px";
		      var academyOneLogoHeight = (Number(preview.content.theme.logoHeight || 56)) + "px";
			      function academyOneSectionBackground(selector, pageKey, sectionKey, defaultColor) {
			        var prefix = "--dexta-academy-1-" + pageKey + "-" + sectionKey + "-";
			        var overlay = "color-mix(in srgb,var(" + prefix + "section-bg-color," + defaultColor + ") var(" + prefix + "section-bg-opacity,100%),transparent)";
			        return selector + "{background-color:" + overlay + "!important;background-image:linear-gradient(" + overlay + "," + overlay + "),var(" + prefix + "section-bg-image,none)!important;background-position:var(" + prefix + "section-bg-position,center center)!important;background-size:var(" + prefix + "section-bg-size,cover)!important;background-repeat:no-repeat!important;}";
			      }
			      function academyOneHeroTextSize(fieldKey, fallback) {
			        var text = String(getPageSectionField("home", "hero", fieldKey) || "").trim();
			        if (/^\\d+(?:\\.\\d+)?(?:px|rem|em|%)$/i.test(text)) return text;
			        var parsed = Number(text);
			        return Number.isFinite(parsed) && parsed > 0 ? parsed + "px" : fallback;
			      }
			      var academyOneHeroHeadlineTabletSize = academyOneHeroTextSize("headlineTabletFontSize", "clamp(3.6rem,5vw,5.8rem)");
			      var academyOneHeroHeadlineMobileSize = academyOneHeroTextSize("headlineMobileFontSize", "clamp(2.6rem,10vw,3.7rem)");
			      var academyOneHeroBodyTabletSize = academyOneHeroTextSize("bodyTabletFontSize", "1.35rem");
			      var academyOneHeroBodyMobileSize = academyOneHeroTextSize("bodyMobileFontSize", "1.1rem");
			      var academyOneHeroButtonTabletFontSize = academyOneHeroTextSize("buttonTabletFontSize", "1rem");
			      var academyOneHeroButtonMobileFontSize = academyOneHeroTextSize("buttonMobileFontSize", "1rem");
			      var academyOneHeroButtonTabletMinHeight = academyOneHeroTextSize("buttonTabletMinHeight", "60px");
			      var academyOneHeroButtonMobileMinHeight = academyOneHeroTextSize("buttonMobileMinHeight", "56px");
			      return [
		        // ── Shared: Navbar ──
		        academyOneSectionBackground(".navbar", "shared", "navbar", "#fff"),
	        '.navbar .navbar-brand img{width:var(--dexta-academy-1-shared-navbar-logo-width-desktop,' + academyOneLogoWidth + ')!important;height:var(--dexta-academy-1-shared-navbar-logo-height-desktop,' + academyOneLogoHeight + ')!important;max-width:var(--dexta-academy-1-shared-navbar-logo-width-desktop,' + academyOneLogoWidth + ')!important;}',
	        '@media (min-width:768px) and (max-width:1199.98px){.navbar .navbar-brand img{width:var(--dexta-academy-1-shared-navbar-logo-width-tablet,' + academyOneLogoWidth + ')!important;height:var(--dexta-academy-1-shared-navbar-logo-height-tablet,' + academyOneLogoHeight + ')!important;max-width:var(--dexta-academy-1-shared-navbar-logo-width-tablet,' + academyOneLogoWidth + ')!important;}}',
	        '@media (max-width:767.98px){.navbar .navbar-brand img{width:var(--dexta-academy-1-shared-navbar-logo-width-mobile,' + academyOneLogoWidth + ')!important;height:var(--dexta-academy-1-shared-navbar-logo-height-mobile,' + academyOneLogoHeight + ')!important;max-width:var(--dexta-academy-1-shared-navbar-logo-width-mobile,' + academyOneLogoWidth + ')!important;}}',
	        '.navbar .btn-primary,.navbar .btn{background:color-mix(in srgb,var(--dexta-academy-1-shared-navbar-cta-button-bg-color,#0d6efd) var(--dexta-academy-1-shared-navbar-cta-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-1-shared-navbar-cta-button-text-color,#fff)!important;border:var(--dexta-academy-1-shared-navbar-cta-button-border-width,0px) solid var(--dexta-academy-1-shared-navbar-cta-button-border-color,#0d6efd)!important;}',
	        '.navbar-nav .nav-item.nav-link,.navbar-nav .nav-link,.navbar-nav a{color:var(--dexta-academy-1-shared-navbar-nav-link-color,#696969)!important;}',
		        '.navbar-nav .nav-item.nav-link:hover,.navbar-nav .nav-link:hover,.navbar-nav a:hover,.navbar-nav .nav-item.nav-link.active,.navbar-nav .nav-link.active{color:var(--dexta-academy-1-shared-navbar-nav-link-hover-color,#0d6efd)!important;}',
		        // ── Shared: Footer ──
		        academyOneSectionBackground(".landing-footer", "shared", "footer", "#1a1a2e"),
		        // ── Shared: Admission Modal ──
		        academyOneSectionBackground(".landing-admissions-modal", "shared", "admission", "#fff"),
		        // ── Home: Hero ──
		        academyOneSectionBackground(".school-hero", "home", "hero", "#fff"),
	        '.school-hero__card-bg--green{background:color-mix(in srgb,var(--dexta-academy-1-home-hero-card-center-bg-color,#0a4d3c) var(--dexta-academy-1-home-hero-card-center-bg-opacity,100%),transparent)!important;}',
	        '.school-hero__card-bg--orange{background:color-mix(in srgb,var(--dexta-academy-1-home-hero-card-top-bg-color,#ff6b35) var(--dexta-academy-1-home-hero-card-top-bg-opacity,100%),transparent)!important;}',
	        '.school-hero__card-bg--champagne{background:color-mix(in srgb,var(--dexta-academy-1-home-hero-card-bottom-bg-color,#dce5c8) var(--dexta-academy-1-home-hero-card-bottom-bg-opacity,100%),transparent)!important;}',
		        '@media (min-width:768px) and (max-width:1199.98px){.school-hero .school-hero__title,.school-hero .school-hero__title *{font-size:var(--dexta-academy-1-home-hero-headline-tablet-font-size,' + academyOneHeroHeadlineTabletSize + ')!important;}.school-hero .school-hero__text,.school-hero .school-hero__text *{font-size:var(--dexta-academy-1-home-hero-body-tablet-font-size,' + academyOneHeroBodyTabletSize + ')!important;}.school-hero .school-hero__btn{font-size:var(--dexta-academy-1-home-hero-button-tablet-font-size,' + academyOneHeroButtonTabletFontSize + ')!important;min-height:var(--dexta-academy-1-home-hero-button-tablet-min-height,' + academyOneHeroButtonTabletMinHeight + ')!important;}}',
		        '@media (max-width:767.98px){.school-hero .school-hero__title,.school-hero .school-hero__title *{font-size:var(--dexta-academy-1-home-hero-headline-mobile-font-size,' + academyOneHeroHeadlineMobileSize + ')!important;}.school-hero .school-hero__text,.school-hero .school-hero__text *{font-size:var(--dexta-academy-1-home-hero-body-mobile-font-size,' + academyOneHeroBodyMobileSize + ')!important;}.school-hero .school-hero__btn{font-size:var(--dexta-academy-1-home-hero-button-mobile-font-size,' + academyOneHeroButtonMobileFontSize + ')!important;min-height:var(--dexta-academy-1-home-hero-button-mobile-min-height,' + academyOneHeroButtonMobileMinHeight + ')!important;}}',
		        '.school-hero .school-hero__btn--primary,.school-hero .school-hero__btn--secondary{background:color-mix(in srgb,var(--dexta-academy-1-home-hero-button-bg-color,#0d6efd) var(--dexta-academy-1-home-hero-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-1-home-hero-button-text-color,#fff)!important;border:var(--dexta-academy-1-home-hero-button-border-width,0px) solid var(--dexta-academy-1-home-hero-button-border-color,#0d6efd)!important;}',
		        // ── Home: About Preview ──
		        academyOneSectionBackground(".landing-section--about", "home", "about-preview", "#fff"),
		        '.landing-section--about .landing-about__shape{border:var(--dexta-academy-1-home-about-preview-image-border-width,0px) var(--dexta-academy-1-home-about-preview-image-border-style,solid) var(--dexta-academy-1-home-about-preview-image-border-color,#0a4d3c)!important;}',
		        // ── Home: Academics ──
		        academyOneSectionBackground(".landing-section--academics", "home", "academics", "#f8f9fa"),
		        '.landing-section--academics .landing-academics__card{background:var(--dexta-academy-1-home-academics-card-bg-color,#fff)!important;}',
		        '.landing-section--academics .landing-academics__icon{color:var(--dexta-academy-1-home-academics-card-icon-color,#0d6efd)!important;background-color:var(--dexta-academy-1-home-academics-card-icon-bg-color,rgba(10,77,60,.08))!important;background-image:var(--dexta-academy-1-home-academics-card-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;}',
		        '.landing-section--academics .landing-academics__icon i{color:inherit!important;background:transparent!important;}',
		        '.landing-section--academics .landing-performance{background:var(--dexta-academy-1-home-academics-performance-bg-color,linear-gradient(180deg,#ffffff 0%,#fffaf1 100%))!important;}',
		        '.landing-section--academics .landing-performance__chart{background:var(--dexta-academy-1-home-academics-performance-chart-bg-color,rgba(10,77,60,.04))!important;}',
		        '.landing-section--academics .landing-performance__bar--green span{height:var(--dexta-academy-1-home-academics-performance-bar-green-height,82%)!important;background:var(--dexta-academy-1-home-academics-performance-bar-green-color,#0a4d3c)!important;}',
		        '.landing-section--academics .landing-performance__bar--orange span{height:var(--dexta-academy-1-home-academics-performance-bar-orange-height,72%)!important;background:var(--dexta-academy-1-home-academics-performance-bar-orange-color,#ff6b35)!important;}',
		        '.landing-section--academics .landing-performance__bar--champagne span{height:var(--dexta-academy-1-home-academics-performance-bar-champagne-height,64%)!important;background:var(--dexta-academy-1-home-academics-performance-bar-champagne-color,#e9d7b1)!important;}',
		        // ── Home: Gallery ──
		        academyOneSectionBackground(".landing-section--gallery", "home", "gallery", "#fff"),
		        '.landing-section--gallery .landing-gallery__page{background:var(--dexta-academy-1-home-gallery-pagination-bg-color,#fff)!important;color:var(--dexta-academy-1-home-gallery-pagination-text-color,rgba(30,30,46,.7))!important;}',
		        '.landing-section--gallery .landing-gallery__page.is-active{background:var(--dexta-academy-1-home-gallery-pagination-active-bg-color,#0a4d3c)!important;border-color:var(--dexta-academy-1-home-gallery-pagination-active-bg-color,#0a4d3c)!important;color:var(--dexta-academy-1-home-gallery-pagination-active-text-color,#fff)!important;}',
		        // ── Home: Testimonials ──
		        academyOneSectionBackground(".landing-section--testimonials", "home", "testimonials", "#fff"),
		        // ── Home: Admissions ──
		        academyOneSectionBackground("#admissions", "home", "admissions", "#fff"),
		        '#admissions .landing-step{background:var(--dexta-academy-1-home-admissions-step-card-bg-color,#fff)!important;}',
		        '#admissions .landing-step .landing-step__number{color:var(--dexta-academy-1-home-admissions-step-number-color,rgba(10,77,60,.42))!important;}#admissions .landing-step h3{color:var(--dexta-academy-1-home-admissions-step-title-color,#1e1e2e)!important;}#admissions .landing-step p{color:var(--dexta-academy-1-home-admissions-step-body-color,rgba(30,30,46,.72))!important;}',
		        '#admissions .btn{background:color-mix(in srgb,var(--dexta-academy-1-home-admissions-button-bg-color,#0d6efd) var(--dexta-academy-1-home-admissions-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-1-home-admissions-button-text-color,#fff)!important;border:var(--dexta-academy-1-home-admissions-button-border-width,0px) solid var(--dexta-academy-1-home-admissions-button-border-color,#0d6efd)!important;}',
		        // ── Home: Contact ──
		        academyOneSectionBackground("#contact", "home", "contact", "#fff"),
		        '#contact .landing-contact__detail i{color:var(--dexta-academy-1-home-contact-icon-color,#0d6efd)!important;background-color:color-mix(in srgb,var(--dexta-academy-1-home-contact-icon-bg-color,#fff) var(--dexta-academy-1-home-contact-icon-bg-opacity,0%),transparent)!important;background-image:var(--dexta-academy-1-home-contact-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-1-home-contact-icon-border-width,0px) solid var(--dexta-academy-1-home-contact-icon-border-color,#0d6efd)!important;}',
		        '#contact .landing-contact__detail:nth-of-type(1){background:var(--dexta-academy-1-home-contact-address-card-bg-color,rgba(255,255,255,.92))!important;}#contact .landing-contact__detail:nth-of-type(1) i{color:var(--dexta-academy-1-home-contact-address-icon-color,#0d6efd)!important;}',
		        '#contact .landing-contact__detail:nth-of-type(2){background:var(--dexta-academy-1-home-contact-phone-card-bg-color,rgba(255,255,255,.92))!important;}#contact .landing-contact__detail:nth-of-type(2) i{color:var(--dexta-academy-1-home-contact-phone-icon-color,#0d6efd)!important;}',
		        '#contact .landing-contact__detail:nth-of-type(3){background:var(--dexta-academy-1-home-contact-email-card-bg-color,rgba(255,255,255,.92))!important;}#contact .landing-contact__detail:nth-of-type(3) i{color:var(--dexta-academy-1-home-contact-email-icon-color,#0d6efd)!important;}',
		        // ── About: Hero ──
		        academyOneSectionBackground(".about-page__hero", "about", "hero", "#fff"),
			        // ── About: Vision ──
			        academyOneSectionBackground(".about-page__section--vision", "about", "vision", "#fff"),
			        '.about-page__section--vision .about-page__panel{background:var(--dexta-academy-1-about-vision-card-bg-color,#fff)!important;color:var(--dexta-academy-1-about-vision-card-text-color,#1e1e2e)!important;}',
			        '.about-page__section--vision .about-page__panel h3,.about-page__section--vision .about-page__panel p{color:inherit!important;}',
			        '.about-page__section--vision .about-page__panel-icon,.about-page__section--vision .about-page__panel-icon i{color:var(--dexta-academy-1-about-vision-icon-color,#0d6efd)!important;background-color:color-mix(in srgb,var(--dexta-academy-1-about-vision-icon-bg-color,#e8f0fe) var(--dexta-academy-1-about-vision-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-1-about-vision-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-1-about-vision-icon-border-width,0px) solid var(--dexta-academy-1-about-vision-icon-border-color,#0d6efd)!important;}',
			        '.about-page__section--vision .about-page__panel-icon{color:var(--dexta-academy-1-about-vision-card-icon-color,var(--dexta-academy-1-about-vision-icon-color,#0d6efd))!important;background-color:var(--dexta-academy-1-about-vision-card-icon-bg-color,#e8f0fe)!important;background-image:var(--dexta-academy-1-about-vision-card-icon-image,var(--dexta-academy-1-about-vision-icon-image,none))!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;}',
			        '.about-page__section--vision .about-page__panel-icon i{color:inherit!important;background:transparent!important;}',
			        // ── About: Values ──
			        academyOneSectionBackground(".about-page__section--values", "about", "values", "#f8f9fa"),
			        '.about-page__section--values .about-page__value{background:var(--dexta-academy-1-about-values-card-bg-color,#fff)!important;color:var(--dexta-academy-1-about-values-card-text-color,#1e1e2e)!important;}',
			        '.about-page__section--values .about-page__value h3,.about-page__section--values .about-page__value p{color:inherit!important;}',
			        '.about-page__section--values .about-page__value-icon,.about-page__section--values .about-page__value-icon i{color:var(--dexta-academy-1-about-values-icon-color,#0d6efd)!important;background-color:color-mix(in srgb,var(--dexta-academy-1-about-values-icon-bg-color,#e8f0fe) var(--dexta-academy-1-about-values-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-1-about-values-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-1-about-values-icon-border-width,0px) solid var(--dexta-academy-1-about-values-icon-border-color,#0d6efd)!important;}',
			        '.about-page__section--values .about-page__value-icon{color:var(--dexta-academy-1-about-values-card-icon-color,var(--dexta-academy-1-about-values-icon-color,#0d6efd))!important;background-color:var(--dexta-academy-1-about-values-card-icon-bg-color,#e8f0fe)!important;background-image:var(--dexta-academy-1-about-values-card-icon-image,var(--dexta-academy-1-about-values-icon-image,none))!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;}',
			        '.about-page__section--values .about-page__value-icon i{color:inherit!important;background:transparent!important;}',
		        // ── About: Story ──
		        academyOneSectionBackground(".about-page__section--story", "about", "story", "#fff"),
		        '.about-page__section--story #readMoreBtn,.about-page__section--story .btn{background:color-mix(in srgb,var(--dexta-academy-1-about-story-button-bg-color,#0d6efd) var(--dexta-academy-1-about-story-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-1-about-story-button-text-color,#fff)!important;border:var(--dexta-academy-1-about-story-button-border-width,0px) solid var(--dexta-academy-1-about-story-button-border-color,#0d6efd)!important;}',
		        // ── About: Head Message ──
		        academyOneSectionBackground(".about-page__message", "about", "head-message", "#fff"),
		        // ── About: Reasons ──
		        academyOneSectionBackground(".about-page__section--reasons", "about", "reasons", "#f8f9fa"),
			        // ── About: CTA ──
			        academyOneSectionBackground(".about-page__cta", "about", "cta", "#0d6efd"),
			        '.about-page__cta .about-page__cta-card{background:var(--dexta-academy-1-about-cta-card-bg-color,#0d6efd)!important;}',
			        '.about-page__cta .about-page__button{background:color-mix(in srgb,var(--dexta-academy-1-about-cta-button-bg-color,#fff) var(--dexta-academy-1-about-cta-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-1-about-cta-button-text-color,#0d6efd)!important;border:var(--dexta-academy-1-about-cta-button-border-width,0px) solid var(--dexta-academy-1-about-cta-button-border-color,#fff)!important;}',
		        // ── Testimonials: Hero ──
		        academyOneSectionBackground(".testimonials-page__hero", "testimonials", "hero", "#fff"),
		        // ── Testimonials: Success Story ──
		        academyOneSectionBackground(".testimonials-page__section--story", "testimonials", "success-story", "#fff"),
		        // ── Testimonials: Wall ──
		        academyOneSectionBackground(".testimonials-page__section--wall", "testimonials", "wall", "#f8f9fa"),
		        // ── Testimonials: CTA ──
		        academyOneSectionBackground(".testimonials-page__section--cta", "testimonials", "cta", "#0d6efd"),
	        '.testimonials-page__section--cta .btn-primary{background:color-mix(in srgb,var(--dexta-academy-1-testimonials-cta-button-bg-color,#fff) var(--dexta-academy-1-testimonials-cta-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-1-testimonials-cta-button-text-color,#0d6efd)!important;border:var(--dexta-academy-1-testimonials-cta-button-border-width,0px) solid var(--dexta-academy-1-testimonials-cta-button-border-color,#fff)!important;}',
	        '.testimonials-page__cta{background:var(--dexta-academy-1-testimonials-cta-card-bg-color,#0d6efd)!important;}'
	      ].join("");
	    }
		    if (preview.content.templateSlug === "dexta-academy-3") {
		      var academyThreeNavOpacity = Math.max(0, Math.min(100, Number(preview.content.theme.navBarOpacity == null ? 100 : preview.content.theme.navBarOpacity)));
		      var academyThreeNavbarBg = preview.content.theme.navBarTransparent
		        ? "color-mix(in srgb," + (preview.content.theme.navBarColor || "#ffffff") + " " + academyThreeNavOpacity + "%,transparent)"
		        : (preview.content.theme.navBarColor || "#ffffff");
		      var academyThreeNavbarBackdrop = preview.content.theme.navBarTransparent ? "blur(18px)" : "none";
		      var academyThreeBrandNameColor = preview.content.theme.brandNameColor || "#061a40";
		      var academyThreeBrandTaglineColor = preview.content.theme.brandTaglineColor || "#061a40";
		      var academyThreeBrandNameSize = Number(preview.content.theme.brandNameFontSize || 16);
		      var academyThreeBrandTaglineSize = Number(preview.content.theme.brandTaglineFontSize || 16);
		      var academyThreeNavColor = preview.content.theme.navLinkColor || preview.content.theme.brandTaglineColor || "#ffffff";
		      var academyThreeNavActiveColor = preview.content.theme.navHoverEnabled === false
		        ? academyThreeNavColor
		        : (preview.content.theme.navHoverColor || preview.content.theme.secondaryColor || "#f5b82e");
		      var academyThreeNavUnderlineColor = preview.content.theme.navHoverColor || preview.content.theme.secondaryColor || "#f5b82e";
		      return [
	        // ── Existing: contact-message + admission-modal ──
	        '.contact-message-card{background-color:color-mix(in srgb,var(--dexta-academy-3-contact-form-section-bg-color,#fff) var(--dexta-academy-3-contact-form-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-contact-form-section-bg-image,none)!important;background-position:var(--dexta-academy-3-contact-form-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-contact-form-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.admission-modal{background-color:color-mix(in srgb,var(--dexta-academy-3-admission-form-section-bg-color,#fff) var(--dexta-academy-3-admission-form-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-admission-form-section-bg-image,none)!important;background-position:var(--dexta-academy-3-admission-form-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-admission-form-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.contact-message-card{background-color:color-mix(in srgb,var(--dexta-academy-3-contact-message-card-bg-color,#fff) var(--dexta-academy-3-contact-message-card-bg-opacity,100%),transparent)!important;border:var(--dexta-academy-3-contact-message-card-border-width,1px) solid var(--dexta-academy-3-contact-message-card-border-color,rgba(6,26,58,.12))!important;border-radius:var(--dexta-academy-3-contact-message-card-border-radius,9px)!important;box-shadow:0 8px 22px color-mix(in srgb,var(--dexta-academy-3-contact-message-card-shadow-color,#061a3a) var(--dexta-academy-3-contact-message-card-shadow-opacity,3%),transparent)!important;}.contact-form-card__header{border-bottom-color:var(--dexta-academy-3-contact-message-divider-color,rgba(6,26,58,.1))!important;}.contact-form-card__header h2{color:var(--dexta-academy-3-contact-message-title-text-color,#061a3a)!important;}.contact-form-card__header p{color:var(--dexta-academy-3-contact-message-body-text-color,#4b5873)!important;}.contact-form-embed{background:linear-gradient(var(--dexta-academy-3-contact-message-form-frame-bg-color,#fff),var(--dexta-academy-3-contact-message-form-frame-bg-color,#fff)) padding-box,linear-gradient(135deg,rgba(255,196,61,.45),rgba(6,31,68,.16)) border-box!important;border-color:var(--dexta-academy-3-contact-message-form-frame-border-color,rgba(6,26,58,.12))!important;border-radius:var(--dexta-academy-3-contact-message-form-frame-border-radius,12px)!important;}',
	        '.admission-modal__panel{background-color:color-mix(in srgb,var(--dexta-academy-3-contact-admission-panel-card-bg-color,#fff) var(--dexta-academy-3-contact-admission-panel-card-bg-opacity,100%),transparent)!important;border:var(--dexta-academy-3-contact-admission-panel-card-border-width,1px) solid var(--dexta-academy-3-contact-admission-panel-card-border-color,rgba(255,255,255,.16))!important;border-radius:var(--dexta-academy-3-contact-admission-panel-card-border-radius,18px)!important;box-shadow:0 30px 90px color-mix(in srgb,var(--dexta-academy-3-contact-admission-panel-card-shadow-color,#010918) var(--dexta-academy-3-contact-admission-panel-card-shadow-opacity,38%),transparent)!important;}.admission-modal__header{background:var(--dexta-academy-3-contact-admission-header-bg-color,#061f44)!important;color:var(--dexta-academy-3-contact-admission-title-text-color,#fff)!important;}.admission-modal__eyebrow,.admission-modal__guide-kicker{color:var(--dexta-academy-3-contact-admission-eyebrow-text-color,#ffc43d)!important;}.admission-modal__header h2{color:var(--dexta-academy-3-contact-admission-title-text-color,#fff)!important;}.admission-modal__body{overflow-x:hidden!important;overflow-y:auto!important;background:var(--dexta-academy-3-contact-admission-body-bg-color,#fff8ed)!important;}.admission-modal__form{overflow:visible!important;}@media(max-width:720px){.admission-modal__form{height:auto!important;}}',
	        '.admission-modal__guide{background-color:color-mix(in srgb,var(--dexta-academy-3-contact-admission-guide-card-bg-color,#fff) var(--dexta-academy-3-contact-admission-guide-card-bg-opacity,100%),transparent)!important;border:var(--dexta-academy-3-contact-admission-guide-card-border-width,1px) solid var(--dexta-academy-3-contact-admission-guide-card-border-color,rgba(6,31,68,.1))!important;border-radius:var(--dexta-academy-3-contact-admission-guide-card-border-radius,14px)!important;box-shadow:0 12px 30px color-mix(in srgb,var(--dexta-academy-3-contact-admission-guide-card-shadow-color,#061a3a) var(--dexta-academy-3-contact-admission-guide-card-shadow-opacity,0%),transparent)!important;}.admission-modal__guide h3{color:var(--dexta-academy-3-contact-admission-guide-title-color,#061a3a)!important;}.admission-modal__guide li{color:var(--dexta-academy-3-contact-admission-guide-text-color,#33425f)!important;}.admission-modal__guide li::before{background:var(--dexta-academy-3-contact-admission-guide-bullet-color,#ffc43d)!important;}.admission-modal__page-link{background:color-mix(in srgb,var(--dexta-academy-3-contact-admission-guide-link-button-bg-color,#061f44) var(--dexta-academy-3-contact-admission-guide-link-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-contact-admission-guide-link-button-text-color,#fff)!important;border:var(--dexta-academy-3-contact-admission-guide-link-button-border-width,0px) solid var(--dexta-academy-3-contact-admission-guide-link-button-border-color,#061f44)!important;}',
	        // ── Shared Header ──
	        '.site-header,.home-page .site-header,.home-page.is-animated .site-header,.about-page .site-header,.gallery-page .site-header,.contact-page .site-header,.about-page .site-header.is-open,.gallery-page .site-header.is-open,.contact-page .site-header.is-open{position:fixed!important;top:0!important;left:0!important;right:0!important;width:100%!important;max-width:none!important;margin:0!important;margin-inline:0!important;padding:18px clamp(20px,5vw,84px)!important;transform:none!important;border-radius:0!important;z-index:1200!important;opacity:1!important;animation:none!important;will-change:auto!important;}',
			        '.site-header .brand__name strong{color:' + academyThreeBrandNameColor + '!important;font-size:' + academyThreeBrandNameSize + 'px!important;}.site-header .brand__name span{color:' + academyThreeBrandTaglineColor + '!important;font-size:' + academyThreeBrandTaglineSize + 'px!important;}.site-header .brand{color:' + academyThreeBrandNameColor + '!important;}.site-header .site-nav a{color:' + academyThreeNavColor + '!important;}.site-header .site-nav a[aria-current="page"],.site-header .site-nav a:hover,.site-header .site-nav a:focus-visible{color:' + academyThreeNavActiveColor + '!important;}.site-header .site-nav a::after{bottom:-14px!important;background:' + academyThreeNavUnderlineColor + '!important;}',
	        '.about-page #top,.gallery-page #top,.contact-page #top{padding-top:96px!important;}',
	        '@media (min-width:841px){.site-header .site-nav{display:inline-flex!important;}.site-header .header-actions{display:inline-flex!important;}.site-header .nav-toggle{display:none!important;}}',
	        '@media (max-width:840px){.site-header,.home-page .site-header,.about-page .site-header,.contact-page .site-header,.gallery-page .site-header,.site-header.is-open,.home-page .site-header.is-open,.about-page .site-header.is-open,.gallery-page .site-header.is-open,.contact-page .site-header.is-open{position:fixed!important;top:0!important;left:0!important;right:0!important;transform:none!important;width:100%!important;max-width:none!important;margin:0!important;margin-inline:0!important;padding:12px 14px!important;border-radius:0!important;}.about-page #top,.gallery-page #top,.contact-page #top{padding-top:82px!important;}.site-header.is-open .site-nav,.site-header.is-open .header-actions{width:100%!important;}}',
		        '.site-header{background:' + academyThreeNavbarBg + '!important;background-color:' + academyThreeNavbarBg + '!important;background-image:none!important;backdrop-filter:' + academyThreeNavbarBackdrop + '!important;}',
		        '.site-header .portal-link{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;padding:12px 18px!important;border-radius:999px!important;font-weight:700!important;text-decoration:none!important;background:color-mix(in srgb,var(--dexta-academy-3-shared-header-portal-button-bg-color,#fff) var(--dexta-academy-3-shared-header-portal-button-bg-opacity,0%),transparent)!important;color:var(--dexta-academy-3-shared-header-portal-button-text-color,#fff)!important;border:var(--dexta-academy-3-shared-header-portal-button-border-width,0px) solid var(--dexta-academy-3-shared-header-portal-button-border-color,#fff)!important;}',
		        '.header-actions .button--gold{background:color-mix(in srgb,var(--dexta-academy-3-shared-header-cta-button-bg-color,#f3bf35) var(--dexta-academy-3-shared-header-cta-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-shared-header-cta-button-text-color,#09142f)!important;border:var(--dexta-academy-3-shared-header-cta-button-border-width,0px) solid var(--dexta-academy-3-shared-header-cta-button-border-color,#f3bf35)!important;}',
	        // ── Shared Footer ──
		        '.site-footer{background-color:color-mix(in srgb,var(--dexta-academy-3-shared-footer-section-bg-color,#09142f) var(--dexta-academy-3-shared-footer-section-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-shared-footer-text-color,rgba(255,255,255,.8))!important;}.site-footer .footer-brand p,.site-footer .footer-bottom p{color:var(--dexta-academy-3-shared-footer-text-color,rgba(255,255,255,.8))!important;}.site-footer .footer-column a,.site-footer .footer-column p,.site-footer .footer-legal a{color:var(--dexta-academy-3-shared-footer-link-color,rgba(255,255,255,.72))!important;}.site-footer .footer-column a:hover,.site-footer .footer-column a:focus-visible,.site-footer .footer-legal a:hover,.site-footer .footer-legal a:focus-visible{color:var(--dexta-academy-3-shared-footer-link-hover-color,#fff)!important;}.site-footer .footer-column a:empty,.site-footer .footer-legal a:empty,.site-footer .footer-explore-links a[data-footer-link-visible="0"]{display:none!important;}',
		        // ── Home Hero ──
		        '.hero{--dexta-academy-3-home-hero-overlay-color:color-mix(in srgb,var(--dexta-academy-3-home-hero-section-bg-color,#031225) var(--dexta-academy-3-home-hero-section-bg-opacity,100%),transparent);background-color:#031225!important;background-image:none!important;}.hero__sky-layer,.hero::before,.hero::after{top:0!important;right:0!important;bottom:0!important;left:0!important;height:auto!important;max-height:none!important;}.hero__sky-layer{background-color:var(--dexta-academy-3-home-hero-overlay-color)!important;background-image:var(--dexta-academy-3-home-hero-section-bg-image,none)!important;background-position:var(--dexta-academy-3-home-hero-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-home-hero-section-bg-size,cover)!important;background-repeat:no-repeat!important;overflow:hidden!important;}.hero::before{background:radial-gradient(circle at 50% 74%,color-mix(in srgb,var(--dexta-academy-3-home-hero-overlay-color) 58%,transparent),transparent 24%),radial-gradient(circle at 50% 55%,color-mix(in srgb,var(--dexta-academy-3-home-hero-overlay-color) 24%,transparent),transparent 18%),linear-gradient(180deg,color-mix(in srgb,var(--dexta-academy-3-home-hero-overlay-color) 12%,transparent) 0%,color-mix(in srgb,var(--dexta-academy-3-home-hero-overlay-color) 42%,transparent) 100%)!important;}.hero::after{background:linear-gradient(180deg,color-mix(in srgb,var(--dexta-academy-3-home-hero-overlay-color) 16%,transparent) 0%,color-mix(in srgb,var(--dexta-academy-3-home-hero-overlay-color) 42%,transparent) 63%,color-mix(in srgb,var(--dexta-academy-3-home-hero-overlay-color) 72%,transparent) 100%)!important;}@media (max-width:560px){.hero__sky-layer,.hero::before,.hero::after{top:0!important;right:0!important;bottom:0!important;left:0!important;height:auto!important;max-height:none!important;}.hero__sky-layer{background-color:var(--dexta-academy-3-home-hero-overlay-color)!important;overflow:hidden!important;}.hero h1,.hero__title,.hero__title .hero__line,.hero__title .hero__segment{color:var(--dexta-academy-3-home-hero-headline-text-color,#fff)!important;}.hero__title .hero__accent--joyful{color:var(--dexta-academy-3-home-hero-joyful-accent-color,#ffc94c)!important;}.hero__title .hero__accent--bold{color:var(--dexta-academy-3-home-hero-bold-accent-color,#ffc94c)!important;}}',
			        '.hero__sky-layer{top:0!important;right:0!important;bottom:0!important;left:0!important;height:auto!important;max-height:none!important;background-color:var(--dexta-academy-3-home-hero-overlay-color)!important;background-image:none!important;overflow:hidden!important;}.hero__sky-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center top!important;opacity:.94!important;transform:scale(1.12);transform-origin:center top!important;}@media (max-width:1080px){.hero__sky-image{object-position:center 18%!important;}}@media (max-width:840px){.hero__sky-image{object-position:center 16%!important;}}@media (max-width:560px){.hero__sky-layer{top:0!important;right:0!important;bottom:0!important;left:0!important;height:auto!important;max-height:none!important;background-color:var(--dexta-academy-3-home-hero-overlay-color)!important;background-image:none!important;}.hero__sky-image{object-position:center 14%!important;}}',
		        '.hero h1,.hero__title{max-width:min(14.5ch,100%)!important;line-height:1.04!important;letter-spacing:0!important;color:var(--dexta-academy-3-home-hero-headline-text-color,#fff)!important;overflow-wrap:break-word!important;text-wrap:balance;}.hero__line{display:flex!important;align-items:baseline!important;justify-content:center!important;flex-wrap:wrap!important;gap:0 .18em!important;min-height:1.04em!important;color:var(--dexta-academy-3-home-hero-headline-text-color,#fff)!important;}.hero__segment,.hero__accent{line-height:1.04!important;white-space:normal!important;}.hero__segment{color:var(--dexta-academy-3-home-hero-headline-text-color,#fff)!important;}.hero__accent--joyful{color:var(--dexta-academy-3-home-hero-joyful-accent-color,#ffc94c)!important;}.hero__accent--bold{color:var(--dexta-academy-3-home-hero-bold-accent-color,#ffc94c)!important;}',
		        '.hero__cta-primary{background:color-mix(in srgb,var(--dexta-academy-3-home-hero-primary-button-bg-color,#f3bf35) var(--dexta-academy-3-home-hero-primary-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-home-hero-primary-button-text-color,#09142f)!important;border:var(--dexta-academy-3-home-hero-primary-button-border-width,0px) solid var(--dexta-academy-3-home-hero-primary-button-border-color,#f3bf35)!important;box-shadow:0 18px 34px color-mix(in srgb,var(--dexta-academy-3-home-hero-primary-button-shadow-color,#fac343) var(--dexta-academy-3-home-hero-primary-button-shadow-opacity,24%),transparent)!important;}',
	        '.hero__cta-secondary{background:color-mix(in srgb,var(--dexta-academy-3-home-hero-secondary-button-bg-color,rgba(255,255,255,0.78)) var(--dexta-academy-3-home-hero-secondary-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-home-hero-secondary-button-text-color,#112246)!important;border:var(--dexta-academy-3-home-hero-secondary-button-border-width,1px) solid var(--dexta-academy-3-home-hero-secondary-button-border-color,rgba(17,34,70,0.15))!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dexta-academy-3-home-hero-secondary-button-shadow-color,#fff) var(--dexta-academy-3-home-hero-secondary-button-shadow-opacity,4%),transparent)!important;}',
	        // ── Home Welcome ──
	        '.welcome{background-color:color-mix(in srgb,var(--dexta-academy-3-home-welcome-section-bg-color,#fff8ed) var(--dexta-academy-3-home-welcome-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-home-welcome-section-bg-image,none)!important;background-position:var(--dexta-academy-3-home-welcome-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-home-welcome-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.welcome__cta{background:color-mix(in srgb,var(--dexta-academy-3-home-welcome-cta-button-bg-color,#122a56) var(--dexta-academy-3-home-welcome-cta-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-home-welcome-cta-button-text-color,#fff)!important;border:var(--dexta-academy-3-home-welcome-cta-button-border-width,0px) solid var(--dexta-academy-3-home-welcome-cta-button-border-color,#122a56)!important;}',
	        // ── Home Programmes ──
		        '.programmes-showcase{background-color:color-mix(in srgb,var(--dexta-academy-3-home-programmes-section-bg-color,#081b3a) var(--dexta-academy-3-home-programmes-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-home-programmes-section-bg-image,none)!important;background-position:var(--dexta-academy-3-home-programmes-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-home-programmes-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
		        '.programmes-showcase .section-heading .button{background:color-mix(in srgb,var(--dexta-academy-3-home-programmes-cta-button-bg-color,rgba(255,255,255,0.04)) var(--dexta-academy-3-home-programmes-cta-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-home-programmes-cta-button-text-color,#fff)!important;border:var(--dexta-academy-3-home-programmes-cta-button-border-width,1px) solid var(--dexta-academy-3-home-programmes-cta-button-border-color,rgba(255,255,255,0.22))!important;}',
		        '.programme-tile{border:var(--dexta-academy-3-home-programmes-card-border-width,1px) solid var(--dexta-academy-3-home-programmes-card-border-color,rgba(243,191,53,.34))!important;box-shadow:0 24px 55px color-mix(in srgb,var(--dexta-academy-3-home-programmes-card-shadow-color,#0d1c40) var(--dexta-academy-3-home-programmes-card-shadow-opacity,0%),transparent)!important;}',
		        '.programme-tile::before{height:var(--dexta-academy-3-home-programmes-card-overlay-height,76%)!important;background:linear-gradient(180deg,color-mix(in srgb,var(--dexta-academy-3-home-programmes-card-overlay-color,#050e21) 0%,transparent) 0%,color-mix(in srgb,var(--dexta-academy-3-home-programmes-card-overlay-color,#050e21) var(--dexta-academy-3-home-programmes-card-overlay-opacity,96%),transparent) 42%,color-mix(in srgb,var(--dexta-academy-3-home-programmes-card-overlay-color,#050e21) var(--dexta-academy-3-home-programmes-card-overlay-opacity,96%),transparent) 100%)!important;}',
	        '.programme-tile__icon{color:var(--dexta-academy-3-home-programmes-icon-icon-color,#f3bf35)!important;background-color:color-mix(in srgb,var(--dexta-academy-3-home-programmes-icon-icon-bg-color,rgba(6,18,42,0.58)) var(--dexta-academy-3-home-programmes-icon-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-home-programmes-icon-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-3-home-programmes-icon-icon-border-width,0px) solid var(--dexta-academy-3-home-programmes-icon-icon-border-color,transparent)!important;}',
		        // ── Home How To Apply ──
	        '.home-apply{background-color:color-mix(in srgb,var(--dexta-academy-3-home-how-to-apply-section-bg-color,#fff8ed) var(--dexta-academy-3-home-how-to-apply-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-home-how-to-apply-section-bg-image,none)!important;background-position:var(--dexta-academy-3-home-how-to-apply-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-home-how-to-apply-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.home-apply__actions .button--gold{background:color-mix(in srgb,var(--dexta-academy-3-home-apply-primary-button-bg-color,#f3bf35) var(--dexta-academy-3-home-apply-primary-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-home-apply-primary-button-text-color,#09142f)!important;border:var(--dexta-academy-3-home-apply-primary-button-border-width,0px) solid var(--dexta-academy-3-home-apply-primary-button-border-color,#f3bf35)!important;}',
	        '.home-apply__actions .button--navy{background:color-mix(in srgb,var(--dexta-academy-3-home-apply-secondary-button-bg-color,#122a56) var(--dexta-academy-3-home-apply-secondary-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-home-apply-secondary-button-text-color,#fff)!important;border:var(--dexta-academy-3-home-apply-secondary-button-border-width,0px) solid var(--dexta-academy-3-home-apply-secondary-button-border-color,#122a56)!important;}',
	        '.home-apply__copy .eyebrow{color:var(--dexta-academy-3-home-how-to-apply-eyebrow-text-color,#c8971b)!important;}.home-apply__copy h2{color:var(--dexta-academy-3-home-how-to-apply-title-text-color,#122a56)!important;}.home-apply__copy p{color:var(--dexta-academy-3-home-how-to-apply-body-text-color,#536079)!important;}',
	        '.home-apply-step{background-color:color-mix(in srgb,var(--dexta-academy-3-home-how-to-apply-step-card-bg-color,#fff) var(--dexta-academy-3-home-how-to-apply-step-card-bg-opacity,100%),transparent)!important;border:var(--dexta-academy-3-home-how-to-apply-step-card-border-width,1px) solid var(--dexta-academy-3-home-how-to-apply-step-card-border-color,rgba(17,34,70,.09))!important;border-radius:var(--dexta-academy-3-home-how-to-apply-step-card-border-radius,18px)!important;box-shadow:0 16px 38px color-mix(in srgb,var(--dexta-academy-3-home-how-to-apply-step-card-shadow-color,#0d1c40) var(--dexta-academy-3-home-how-to-apply-step-card-shadow-opacity,6%),transparent)!important;}.home-apply-step h3{color:var(--dexta-academy-3-home-how-to-apply-step-card-title-color,#122a56)!important;}.home-apply-step p{color:var(--dexta-academy-3-home-how-to-apply-step-card-body-color,#536079)!important;}',
	        '.home-apply-step__number{color:var(--dexta-academy-3-home-how-to-apply-icon-color,#122a56)!important;background-color:color-mix(in srgb,var(--dexta-academy-3-home-how-to-apply-icon-bg-color,#fff2c9) var(--dexta-academy-3-home-how-to-apply-icon-bg-opacity,100%),transparent)!important;border:var(--dexta-academy-3-home-how-to-apply-icon-border-width,0px) solid var(--dexta-academy-3-home-how-to-apply-icon-border-color,transparent)!important;}',
	        '.home-apply__note{background-color:color-mix(in srgb,var(--dexta-academy-3-home-how-to-apply-note-bg-color,#061f44) var(--dexta-academy-3-home-how-to-apply-note-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-home-how-to-apply-note-text-color,#fff)!important;border:var(--dexta-academy-3-home-how-to-apply-note-border-width,0px) solid var(--dexta-academy-3-home-how-to-apply-note-border-color,transparent)!important;border-radius:var(--dexta-academy-3-home-how-to-apply-note-border-radius,20px)!important;}.home-apply__note h3{color:var(--dexta-academy-3-home-how-to-apply-note-title-color,#fff)!important;}.home-apply__note li{color:var(--dexta-academy-3-home-how-to-apply-note-text-color,rgba(255,255,255,.82))!important;}.home-apply__note li::before{background:var(--dexta-academy-3-home-how-to-apply-note-bullet-color,#ffc43d)!important;}',
	        // ── Home Gallery Preview ──
		        '.home-gallery{background-color:color-mix(in srgb,var(--dexta-academy-3-home-gallery-preview-section-bg-color,#fff) var(--dexta-academy-3-home-gallery-preview-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-home-gallery-preview-section-bg-image,none)!important;background-position:var(--dexta-academy-3-home-gallery-preview-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-home-gallery-preview-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
		        '.home-gallery__actions .button{background:color-mix(in srgb,var(--dexta-academy-3-home-gallery-cta-button-bg-color,#122a56) var(--dexta-academy-3-home-gallery-cta-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-home-gallery-cta-button-text-color,#fff)!important;border:var(--dexta-academy-3-home-gallery-cta-button-border-width,0px) solid var(--dexta-academy-3-home-gallery-cta-button-border-color,#122a56)!important;}',
		        '.home-gallery-card{border:var(--dexta-academy-3-home-gallery-preview-card-border-width,0px) solid var(--dexta-academy-3-home-gallery-preview-card-border-color,transparent)!important;box-shadow:0 24px 55px color-mix(in srgb,var(--dexta-academy-3-home-gallery-preview-card-shadow-color,#0d1c40) var(--dexta-academy-3-home-gallery-preview-card-shadow-opacity,0%),transparent)!important;}',
	        // ── About Hero ──
	        '.about-hero{background-color:color-mix(in srgb,var(--dexta-academy-3-about-hero-section-bg-color,#07162f) var(--dexta-academy-3-about-hero-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-about-hero-section-bg-image,none)!important;background-position:var(--dexta-academy-3-about-hero-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-about-hero-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.about-hero__button{background:color-mix(in srgb,var(--dexta-academy-3-about-hero-cta-button-bg-color,#f3bf35) var(--dexta-academy-3-about-hero-cta-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-about-hero-cta-button-text-color,#09142f)!important;border:var(--dexta-academy-3-about-hero-cta-button-border-width,0px) solid var(--dexta-academy-3-about-hero-cta-button-border-color,#f3bf35)!important;}',
		        // ── About Story ──
		        '.about-story{background-color:color-mix(in srgb,var(--dexta-academy-3-about-story-section-bg-color,#fff) var(--dexta-academy-3-about-story-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-about-story-section-bg-image,none)!important;background-position:var(--dexta-academy-3-about-story-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-about-story-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
		        '.about-story-card{border:var(--dexta-academy-3-about-story-card-border-width,0px) solid var(--dexta-academy-3-about-story-card-border-color,transparent)!important;box-shadow:0 24px 55px color-mix(in srgb,var(--dexta-academy-3-about-story-card-shadow-color,#0d1c40) var(--dexta-academy-3-about-story-card-shadow-opacity,0%),transparent)!important;}',
		        '.about-story-card .button{background:color-mix(in srgb,var(--dexta-academy-3-about-story-cta-button-bg-color,#f3bf35) var(--dexta-academy-3-about-story-cta-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-about-story-cta-button-text-color,#09142f)!important;border:var(--dexta-academy-3-about-story-cta-button-border-width,0px) solid var(--dexta-academy-3-about-story-cta-button-border-color,#f3bf35)!important;}',
	        // ── About Story Modal ──
	        '.story-modal__panel{background-color:color-mix(in srgb,var(--dexta-academy-3-about-story-modal-section-bg-color,#fff) var(--dexta-academy-3-about-story-modal-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-about-story-modal-section-bg-image,none)!important;background-position:var(--dexta-academy-3-about-story-modal-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-about-story-modal-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
		        // ── About Values ──
		        '.about-values{background-color:color-mix(in srgb,var(--dexta-academy-3-about-values-section-bg-color,#f3bf35) var(--dexta-academy-3-about-values-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-about-values-section-bg-image,none)!important;background-position:var(--dexta-academy-3-about-values-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-about-values-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
		        '.about-value-card{border:var(--dexta-academy-3-about-values-card-border-width,1px) solid var(--dexta-academy-3-about-values-card-border-color,rgba(17,34,70,.08))!important;box-shadow:0 18px 42px color-mix(in srgb,var(--dexta-academy-3-about-values-card-shadow-color,#0d1c40) var(--dexta-academy-3-about-values-card-shadow-opacity,9%),transparent)!important;}',
		        '.about-icon{color:var(--dexta-academy-3-about-values-icon-icon-color,#101f4a)!important;background-color:color-mix(in srgb,var(--dexta-academy-3-about-values-icon-icon-bg-color,transparent) var(--dexta-academy-3-about-values-icon-icon-bg-opacity,0%),transparent)!important;background-image:var(--dexta-academy-3-about-values-icon-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-3-about-values-icon-icon-border-width,0px) solid var(--dexta-academy-3-about-values-icon-icon-border-color,transparent)!important;}',
	        // ── About Approach ──
	        '.about-approach{background-color:color-mix(in srgb,var(--dexta-academy-3-about-approach-section-bg-color,#fff) var(--dexta-academy-3-about-approach-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-about-approach-section-bg-image,none)!important;background-position:var(--dexta-academy-3-about-approach-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-about-approach-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.about-approach__copy .button{background:color-mix(in srgb,var(--dexta-academy-3-about-approach-cta-button-bg-color,#122a56) var(--dexta-academy-3-about-approach-cta-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-about-approach-cta-button-text-color,#fff)!important;border:var(--dexta-academy-3-about-approach-cta-button-border-width,0px) solid var(--dexta-academy-3-about-approach-cta-button-border-color,#122a56)!important;}',
	        // ── About Impact ──
	        '.about-impact-band{background-color:color-mix(in srgb,var(--dexta-academy-3-about-impact-section-bg-color,#07162f) var(--dexta-academy-3-about-impact-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-about-impact-section-bg-image,none)!important;background-position:var(--dexta-academy-3-about-impact-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-about-impact-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.about-impact-stat__icon{color:var(--dexta-academy-3-about-impact-icon-icon-color,#f3bf35)!important;background-color:color-mix(in srgb,var(--dexta-academy-3-about-impact-icon-icon-bg-color,transparent) var(--dexta-academy-3-about-impact-icon-icon-bg-opacity,0%),transparent)!important;background-image:var(--dexta-academy-3-about-impact-icon-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-3-about-impact-icon-icon-border-width,0px) solid var(--dexta-academy-3-about-impact-icon-icon-border-color,transparent)!important;}',
	        // ── About Tour CTA ──
	        '.about-tour-band{background-color:color-mix(in srgb,var(--dexta-academy-3-about-tour-cta-section-bg-color,#ffd154) var(--dexta-academy-3-about-tour-cta-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-about-tour-cta-section-bg-image,none)!important;background-position:var(--dexta-academy-3-about-tour-cta-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-about-tour-cta-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.about-tour-band .button{background:color-mix(in srgb,var(--dexta-academy-3-about-tour-cta-btn-button-bg-color,#122a56) var(--dexta-academy-3-about-tour-cta-btn-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-about-tour-cta-btn-button-text-color,#fff)!important;border:var(--dexta-academy-3-about-tour-cta-btn-button-border-width,0px) solid var(--dexta-academy-3-about-tour-cta-btn-button-border-color,#122a56)!important;}',
	        '.about-tour-band__icon{color:var(--dexta-academy-3-about-tour-cta-icon-icon-color,#101f4a)!important;background-color:color-mix(in srgb,var(--dexta-academy-3-about-tour-cta-icon-icon-bg-color,transparent) var(--dexta-academy-3-about-tour-cta-icon-icon-bg-opacity,0%),transparent)!important;background-image:var(--dexta-academy-3-about-tour-cta-icon-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-3-about-tour-cta-icon-icon-border-width,0px) solid var(--dexta-academy-3-about-tour-cta-icon-icon-border-color,transparent)!important;}',
	        // ── Gallery Hero ──
	        '.gallery-hero-ref{background-color:color-mix(in srgb,var(--dexta-academy-3-gallery-hero-section-bg-color,#081a38) var(--dexta-academy-3-gallery-hero-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-gallery-hero-section-bg-image,none)!important;background-position:var(--dexta-academy-3-gallery-hero-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-gallery-hero-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        // ── Gallery Filters ──
	        '.gallery-filter-bar{background-color:color-mix(in srgb,var(--dexta-academy-3-gallery-filters-section-bg-color,#fff) var(--dexta-academy-3-gallery-filters-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-gallery-filters-section-bg-image,none)!important;background-position:var(--dexta-academy-3-gallery-filters-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-gallery-filters-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
		        // ── Gallery Grid ──
		        '.gallery-gallery-ref{background-color:color-mix(in srgb,var(--dexta-academy-3-gallery-grid-section-bg-color,#fff) var(--dexta-academy-3-gallery-grid-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-gallery-grid-section-bg-image,none)!important;background-position:var(--dexta-academy-3-gallery-grid-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-gallery-grid-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
		        '.gallery-page .gallery-reference-card{border:var(--dexta-academy-3-gallery-grid-card-border-width,0px) solid var(--dexta-academy-3-gallery-grid-card-border-color,transparent)!important;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dexta-academy-3-gallery-grid-card-shadow-color,#0a1833) var(--dexta-academy-3-gallery-grid-card-shadow-opacity,4%),transparent)!important;}.gallery-page .gallery-reference-card:hover,.gallery-page .gallery-reference-card:focus-within,.gallery-page .gallery-reference-card:focus-visible{box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dexta-academy-3-gallery-grid-card-shadow-color,#0a1833) var(--dexta-academy-3-gallery-grid-card-shadow-opacity,4%),transparent),0 18px 32px color-mix(in srgb,var(--dexta-academy-3-gallery-grid-card-shadow-color,#071a38) calc(var(--dexta-academy-3-gallery-grid-card-shadow-opacity,4%) * 3),transparent)!important;}',
	        // ── Contact Hero ──
	        '.contact-hero{background-color:color-mix(in srgb,var(--dexta-academy-3-contact-hero-section-bg-color,#061f44) var(--dexta-academy-3-contact-hero-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-contact-hero-section-bg-image,none)!important;background-position:var(--dexta-academy-3-contact-hero-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-contact-hero-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.contact-hero .contact-eyebrow{color:var(--dexta-academy-3-contact-hero-eyebrow-text-color,#ffc43d)!important;}.contact-hero h1{color:var(--dexta-academy-3-contact-hero-title-text-color,#fff)!important;}.contact-hero h1 span{color:var(--dexta-academy-3-contact-hero-accent-text-color,#ffc43d)!important;}.contact-hero__copy>p:not(.contact-eyebrow){color:var(--dexta-academy-3-contact-hero-body-text-color,rgba(255,255,255,.82))!important;}',
	        '.contact-hero .contact-button--dark{background:color-mix(in srgb,var(--dexta-academy-3-contact-hero-primary-button-bg-color,#ffc43d) var(--dexta-academy-3-contact-hero-primary-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-contact-hero-primary-button-text-color,#061a3a)!important;border:var(--dexta-academy-3-contact-hero-primary-button-border-width,1px) solid var(--dexta-academy-3-contact-hero-primary-button-border-color,rgba(6,31,68,.12))!important;}',
	        '.contact-hero .contact-button--light{background:color-mix(in srgb,var(--dexta-academy-3-contact-hero-secondary-button-bg-color,rgba(255,255,255,0.1)) var(--dexta-academy-3-contact-hero-secondary-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-3-contact-hero-secondary-button-text-color,#fff)!important;border:var(--dexta-academy-3-contact-hero-secondary-button-border-width,1px) solid var(--dexta-academy-3-contact-hero-secondary-button-border-color,rgba(255,255,255,0.2))!important;}',
	        // ── Contact Intro ──
	        '.contact-intro{background-color:color-mix(in srgb,var(--dexta-academy-3-contact-intro-section-bg-color,#fff) var(--dexta-academy-3-contact-intro-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-contact-intro-section-bg-image,none)!important;background-position:var(--dexta-academy-3-contact-intro-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-contact-intro-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.contact-intro>p:first-child{color:var(--dexta-academy-3-contact-intro-eyebrow-text-color,#f5ae00)!important;}.contact-intro h2{color:var(--dexta-academy-3-contact-intro-title-text-color,#061a3a)!important;}.contact-intro p:last-child{color:var(--dexta-academy-3-contact-intro-body-text-color,#1b2c4b)!important;}.contact-intro>span{background:var(--dexta-academy-3-contact-intro-divider-color,#f4b31d)!important;}',
	        // ── Contact Info Card ──
	        '.contact-info-card{background-color:color-mix(in srgb,var(--dexta-academy-3-contact-info-card-section-bg-color,#061f44) var(--dexta-academy-3-contact-info-card-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-contact-info-card-section-bg-image,none)!important;background-position:var(--dexta-academy-3-contact-info-card-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-contact-info-card-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.contact-info-card{background-color:color-mix(in srgb,var(--dexta-academy-3-contact-info-card-card-bg-color,#fff) var(--dexta-academy-3-contact-info-card-card-bg-opacity,100%),transparent)!important;border:var(--dexta-academy-3-contact-info-card-card-border-width,1px) solid var(--dexta-academy-3-contact-info-card-card-border-color,rgba(6,26,58,.12))!important;border-radius:var(--dexta-academy-3-contact-info-card-card-border-radius,9px)!important;box-shadow:0 8px 22px color-mix(in srgb,var(--dexta-academy-3-contact-info-card-card-shadow-color,#061a3a) var(--dexta-academy-3-contact-info-card-card-shadow-opacity,3%),transparent)!important;}.contact-info-card h2{color:var(--dexta-academy-3-contact-info-card-title-text-color,#061a3a)!important;}.contact-info-list strong{color:var(--dexta-academy-3-contact-info-card-item-title-color,#061a3a)!important;}.contact-info-list p{color:var(--dexta-academy-3-contact-info-card-item-text-color,#142340)!important;}.contact-socials a{color:var(--dexta-academy-3-contact-info-card-social-icon-color,#061a3a)!important;border-color:var(--dexta-academy-3-contact-info-card-social-icon-border-color,rgba(6,26,58,.18))!important;}',
	        '.contact-icon{color:var(--dexta-academy-3-contact-info-icon-icon-color,#f1ad16)!important;background-color:color-mix(in srgb,var(--dexta-academy-3-contact-info-icon-icon-bg-color,#fffaf1) var(--dexta-academy-3-contact-info-icon-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-contact-info-icon-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-3-contact-info-icon-icon-border-width,1px) solid var(--dexta-academy-3-contact-info-icon-icon-border-color,rgba(6,26,58,.1))!important;}',
	        // ── Contact Benefits ──
	        '.contact-benefits{background-color:color-mix(in srgb,var(--dexta-academy-3-contact-benefits-section-bg-color,#fffdfb) var(--dexta-academy-3-contact-benefits-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-3-contact-benefits-section-bg-image,none)!important;background-position:var(--dexta-academy-3-contact-benefits-section-bg-position,center center)!important;background-size:var(--dexta-academy-3-contact-benefits-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
		        '.contact-benefits{background-color:color-mix(in srgb,var(--dexta-academy-3-contact-benefits-wrap-card-bg-color,#fffdfb) var(--dexta-academy-3-contact-benefits-wrap-card-bg-opacity,100%),transparent)!important;border:var(--dexta-academy-3-contact-benefits-wrap-card-border-width,0px) solid var(--dexta-academy-3-contact-benefits-wrap-card-border-color,transparent)!important;border-radius:var(--dexta-academy-3-contact-benefits-wrap-card-border-radius,12px)!important;box-shadow:0 14px 35px color-mix(in srgb,var(--dexta-academy-3-contact-benefits-wrap-card-shadow-color,#061a3a) var(--dexta-academy-3-contact-benefits-wrap-card-shadow-opacity,4%),transparent)!important;}.contact-benefits article{background-color:color-mix(in srgb,var(--dexta-academy-3-contact-benefits-card-bg-color,transparent) var(--dexta-academy-3-contact-benefits-card-bg-opacity,0%),transparent)!important;border-right:var(--dexta-academy-3-contact-benefits-card-border-width,1px) solid var(--dexta-academy-3-contact-benefits-card-border-color,rgba(6,26,58,.08))!important;box-shadow:0 12px 28px color-mix(in srgb,var(--dexta-academy-3-contact-benefits-card-shadow-color,#061a3a) var(--dexta-academy-3-contact-benefits-card-shadow-opacity,0%),transparent)!important;}.contact-benefits strong{color:var(--dexta-academy-3-contact-benefits-title-text-color,#061a3a)!important;}.contact-benefits p{color:var(--dexta-academy-3-contact-benefits-body-text-color,#1d2d49)!important;}',
	        '.contact-benefit-icon{color:var(--dexta-academy-3-contact-benefits-icon-icon-color,#061a3a)!important;background-color:color-mix(in srgb,var(--dexta-academy-3-contact-benefits-icon-icon-bg-color,transparent) var(--dexta-academy-3-contact-benefits-icon-icon-bg-opacity,0%),transparent)!important;background-image:var(--dexta-academy-3-contact-benefits-icon-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-3-contact-benefits-icon-icon-border-width,0px) solid var(--dexta-academy-3-contact-benefits-icon-icon-border-color,transparent)!important;}',
	        // ── Contact Footer ──
		        '.contact-footer{background-color:color-mix(in srgb,var(--dexta-academy-3-shared-footer-section-bg-color,var(--dexta-academy-3-contact-footer-section-bg-color,#061f3f)) var(--dexta-academy-3-shared-footer-section-bg-opacity,var(--dexta-academy-3-contact-footer-section-bg-opacity,100%)),transparent)!important;color:var(--dexta-academy-3-shared-footer-text-color,var(--dexta-academy-3-contact-footer-body-text-color,#fff))!important;}.contact-brand--footer,.contact-brand--footer strong{color:var(--dexta-academy-3-contact-footer-brand-text-color,#fff)!important;}.contact-brand--footer small{color:var(--dexta-academy-3-contact-footer-tagline-text-color,#fff)!important;}.contact-footer h3{color:var(--dexta-academy-3-contact-footer-heading-color,#ffc43d)!important;}.contact-footer p,.contact-footer a{color:var(--dexta-academy-3-shared-footer-link-color,var(--dexta-academy-3-contact-footer-link-color,#fff))!important;}.contact-footer a:hover,.contact-footer a:focus-visible{color:var(--dexta-academy-3-shared-footer-link-hover-color,#fff)!important;}.contact-footer a:empty{display:none!important;}.contact-footer__bottom{border-top-color:var(--dexta-academy-3-contact-footer-divider-color,rgba(255,255,255,.2))!important;}.contact-footer__bottom p{color:var(--dexta-academy-3-shared-footer-text-color,var(--dexta-academy-3-contact-footer-bottom-text-color,#fff))!important;}'
	      ].join("");
	    }
	    if (preview.content.templateSlug === "dexta-academy-4") {
	      var templateFourNavbarOpacity = Math.max(0, Math.min(100, Number(preview.content.theme.navBarOpacity == null ? 100 : preview.content.theme.navBarOpacity)));
	      var templateFourNavbarBackground = preview.content.theme.navBarTransparent
	        ? "color-mix(in srgb," + (preview.content.theme.navBarColor || "#020810") + " " + templateFourNavbarOpacity + "%,transparent)"
	        : (preview.content.theme.navBarColor || "#020810");
	      return [
	        // ── Shared Header ──
	        '.hero-header,.hero-header .navbar-collapse.show{background:' + templateFourNavbarBackground + '!important;background-color:' + templateFourNavbarBackground + '!important;}',
	        '.hero-header .hero-navbar{background:transparent!important;background-color:transparent!important;box-shadow:none!important;}',
	        '.hero-header .hero-portal-btn{background:color-mix(in srgb,var(--dexta-academy-4-shared-header-portal-button-bg-color,transparent) var(--dexta-academy-4-shared-header-portal-button-bg-opacity,0%),transparent)!important;color:var(--dexta-academy-4-shared-header-portal-button-text-color,#ffffff)!important;border:var(--dexta-academy-4-shared-header-portal-button-border-width,2px) solid var(--dexta-academy-4-shared-header-portal-button-border-color,#4a8fff)!important;}',
	        '.hero-header .hero-apply-btn{background:color-mix(in srgb,var(--dexta-academy-4-shared-header-apply-button-bg-color,#4a8fff) var(--dexta-academy-4-shared-header-apply-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-4-shared-header-apply-button-text-color,#ffffff)!important;border:var(--dexta-academy-4-shared-header-apply-button-border-width,0px) solid var(--dexta-academy-4-shared-header-apply-button-border-color,#4a8fff)!important;}',
	        // ── Shared Footer ──
	        '.school-footer{background-color:color-mix(in srgb,var(--dexta-academy-4-shared-footer-section-bg-color,#0b1220) var(--dexta-academy-4-shared-footer-section-bg-opacity,100%),transparent)!important;}',
	        // ── Home Hero ──
	        '.school-hero{background-color:color-mix(in srgb,var(--dexta-academy-4-home-hero-section-bg-color,#020810) var(--dexta-academy-4-home-hero-section-bg-opacity,100%),transparent)!important;}',
	        '.school-hero .hero{background-image:linear-gradient(90deg,color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-home-hero-section-bg-color,#020810) 88%,transparent) var(--dexta-academy-4-home-hero-section-bg-opacity,100%),transparent) 0%,color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-home-hero-section-bg-color,#020810) 74%,transparent) var(--dexta-academy-4-home-hero-section-bg-opacity,100%),transparent) 40%,color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-home-hero-section-bg-color,#020810) 30%,transparent) var(--dexta-academy-4-home-hero-section-bg-opacity,100%),transparent) 100%),var(--dexta-academy-4-home-hero-bg-image,url("https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80"))!important;background-position:center!important;background-size:cover!important;background-repeat:no-repeat!important;}',
	        '.school-hero .hero::before{background:linear-gradient(180deg,color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-home-hero-section-bg-color,#020810) 34%,transparent) var(--dexta-academy-4-home-hero-section-bg-opacity,100%),transparent) 0%,color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-home-hero-section-bg-color,#020810) 76%,transparent) var(--dexta-academy-4-home-hero-section-bg-opacity,100%),transparent) 55%,color-mix(in srgb,var(--dexta-academy-4-home-hero-section-bg-color,#020810) var(--dexta-academy-4-home-hero-section-bg-opacity,100%),transparent) 100%)!important;}',
	        '.school-hero .hero-primary-btn{background:color-mix(in srgb,var(--dexta-academy-4-home-hero-primary-button-bg-color,#4a8fff) var(--dexta-academy-4-home-hero-primary-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-4-home-hero-primary-button-text-color,#ffffff)!important;border:var(--dexta-academy-4-home-hero-primary-button-border-width,0px) solid var(--dexta-academy-4-home-hero-primary-button-border-color,#4a8fff)!important;}',
	        '.school-hero .hero-secondary-btn{background:color-mix(in srgb,var(--dexta-academy-4-home-hero-secondary-button-bg-color,transparent) var(--dexta-academy-4-home-hero-secondary-button-bg-opacity,0%),transparent)!important;color:var(--dexta-academy-4-home-hero-secondary-button-text-color,#ffffff)!important;border:var(--dexta-academy-4-home-hero-secondary-button-border-width,2px) solid var(--dexta-academy-4-home-hero-secondary-button-border-color,#4a8fff)!important;}',
	        // ── Home About Preview ──
	        '.school-about-preview{background-color:color-mix(in srgb,var(--dexta-academy-4-home-about-preview-section-bg-color,#ffffff) var(--dexta-academy-4-home-about-preview-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-4-home-about-preview-section-bg-image,none)!important;background-position:var(--dexta-academy-4-home-about-preview-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-home-about-preview-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.school-about-preview .btn{background:color-mix(in srgb,var(--dexta-academy-4-home-about-preview-button-bg-color,#4a8fff) var(--dexta-academy-4-home-about-preview-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-4-home-about-preview-button-text-color,#ffffff)!important;border:var(--dexta-academy-4-home-about-preview-button-border-width,0px) solid var(--dexta-academy-4-home-about-preview-button-border-color,#4a8fff)!important;}',
	        // ── Home Programs ──
	        '.school-programs{background-color:color-mix(in srgb,var(--dexta-academy-4-home-programs-section-bg-color,#e8f4f1) var(--dexta-academy-4-home-programs-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-4-home-programs-section-bg-image,none)!important;background-position:var(--dexta-academy-4-home-programs-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-home-programs-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.school-programs .btn{background:color-mix(in srgb,var(--dexta-academy-4-home-programs-button-bg-color,#4a8fff) var(--dexta-academy-4-home-programs-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-4-home-programs-button-text-color,#ffffff)!important;border:var(--dexta-academy-4-home-programs-button-border-width,0px) solid var(--dexta-academy-4-home-programs-button-border-color,#4a8fff)!important;}',
	        // ── Home Gallery Preview ──
	        '.homepage-gallery-preview{background-color:color-mix(in srgb,var(--dexta-academy-4-home-gallery-preview-section-bg-color,#f7fafc) var(--dexta-academy-4-home-gallery-preview-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-4-home-gallery-preview-section-bg-image,none)!important;background-position:var(--dexta-academy-4-home-gallery-preview-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-home-gallery-preview-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.homepage-gallery-preview .btn{background:color-mix(in srgb,var(--dexta-academy-4-home-gallery-preview-button-bg-color,#4a8fff) var(--dexta-academy-4-home-gallery-preview-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-4-home-gallery-preview-button-text-color,#ffffff)!important;border:var(--dexta-academy-4-home-gallery-preview-button-border-width,0px) solid var(--dexta-academy-4-home-gallery-preview-button-border-color,#4a8fff)!important;}',
	        // ── Page Hero (shared across inner pages – each page sets its own CSS vars) ──
	        '.school-page-hero{background-color:color-mix(in srgb,var(--dexta-academy-4-about-page-hero-section-bg-color,var(--dexta-academy-4-admissions-page-hero-section-bg-color,var(--dexta-academy-4-gallery-page-hero-section-bg-color,var(--dexta-academy-4-contact-page-hero-section-bg-color,#102542)))) var(--dexta-academy-4-about-page-hero-section-bg-opacity,var(--dexta-academy-4-admissions-page-hero-section-bg-opacity,var(--dexta-academy-4-gallery-page-hero-section-bg-opacity,var(--dexta-academy-4-contact-page-hero-section-bg-opacity,100%)))),transparent)!important;}',
	        // ── Page Hero background images (per-page gradient + image variable) ──
	        '.about-page-hero{background-image:linear-gradient(90deg,color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-about-page-hero-section-bg-color,#102542) 88%,transparent) var(--dexta-academy-4-about-page-hero-section-bg-opacity,100%),transparent) 0%,color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-about-page-hero-section-bg-color,#102542) 74%,transparent) var(--dexta-academy-4-about-page-hero-section-bg-opacity,100%),transparent) 42%,color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-about-page-hero-section-bg-color,#102542) 46%,transparent) var(--dexta-academy-4-about-page-hero-section-bg-opacity,100%),transparent) 100%),var(--dexta-academy-4-about-page-hero-bg-image,url("https://res.cloudinary.com/dxoorukfj/image/upload/v1777039633/dxt2-about_ubzert.png"))!important;background-position:center!important;background-size:cover!important;background-repeat:no-repeat!important;}',
	        '.about-page-hero::before{background:linear-gradient(180deg,color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-about-page-hero-section-bg-color,#102542) 12%,transparent) var(--dexta-academy-4-about-page-hero-section-bg-opacity,100%),transparent) 0%,color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-about-page-hero-section-bg-color,#102542) 46%,transparent) var(--dexta-academy-4-about-page-hero-section-bg-opacity,100%),transparent) 100%)!important;}',
	        '.admissions-page-hero{background-image:var(--dexta-academy-4-admissions-page-hero-bg-image,url("https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1600&q=80"))!important;background-position:center!important;background-size:cover!important;background-repeat:no-repeat!important;}',
	        '.admissions-page-hero::before{background:color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-admissions-page-hero-section-bg-color,#102542) 70%,transparent) var(--dexta-academy-4-admissions-page-hero-section-bg-opacity,100%),transparent)!important;}',
	        '.gallery-page-hero{background-image:linear-gradient(90deg,color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-gallery-page-hero-section-bg-color,#102542) 88%,transparent) var(--dexta-academy-4-gallery-page-hero-section-bg-opacity,100%),transparent) 0%,color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-gallery-page-hero-section-bg-color,#102542) 72%,transparent) var(--dexta-academy-4-gallery-page-hero-section-bg-opacity,100%),transparent) 42%,color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-gallery-page-hero-section-bg-color,#102542) 42%,transparent) var(--dexta-academy-4-gallery-page-hero-section-bg-opacity,100%),transparent) 100%),var(--dexta-academy-4-gallery-page-hero-bg-image,url("https://res.cloudinary.com/dxoorukfj/image/upload/v1777041124/ChatGPT_Image_Apr_24_2026_03_31_43_PM_ssnnin.png"))!important;background-position:center!important;background-size:cover!important;background-repeat:no-repeat!important;}',
	        '.school-gallery-page .gallery-page-hero::before,.gallery-page-hero::before{background:linear-gradient(180deg,color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-gallery-page-hero-section-bg-color,#102542) 8%,transparent) var(--dexta-academy-4-gallery-page-hero-section-bg-opacity,100%),transparent) 0%,color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-gallery-page-hero-section-bg-color,#102542) 48%,transparent) var(--dexta-academy-4-gallery-page-hero-section-bg-opacity,100%),transparent) 100%)!important;}',
	        '.contact-page-hero{background-image:var(--dexta-academy-4-contact-page-hero-bg-image,url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80"))!important;background-position:center!important;background-size:cover!important;background-repeat:no-repeat!important;}',
	        '.contact-page-hero::before{background:color-mix(in srgb,color-mix(in srgb,var(--dexta-academy-4-contact-page-hero-section-bg-color,#102542) 72%,transparent) var(--dexta-academy-4-contact-page-hero-section-bg-opacity,100%),transparent)!important;}',
	        // ── About sections ──
	        '.about-story-section{background-color:color-mix(in srgb,var(--dexta-academy-4-about-story-section-bg-color,#ffffff) var(--dexta-academy-4-about-story-section-bg-opacity,100%),transparent)!important;background-image:linear-gradient(color-mix(in srgb,var(--dexta-academy-4-about-story-section-bg-color,#ffffff) var(--dexta-academy-4-about-story-section-bg-opacity,100%),transparent),color-mix(in srgb,var(--dexta-academy-4-about-story-section-bg-color,#ffffff) var(--dexta-academy-4-about-story-section-bg-opacity,100%),transparent)),var(--dexta-academy-4-about-story-section-bg-image,none)!important;background-position:var(--dexta-academy-4-about-story-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-about-story-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.about-principles-section{background-color:color-mix(in srgb,var(--dexta-academy-4-about-principles-section-bg-color,#f0f4f8) var(--dexta-academy-4-about-principles-section-bg-opacity,100%),transparent)!important;background-image:linear-gradient(color-mix(in srgb,var(--dexta-academy-4-about-principles-section-bg-color,#f0f4f8) var(--dexta-academy-4-about-principles-section-bg-opacity,100%),transparent),color-mix(in srgb,var(--dexta-academy-4-about-principles-section-bg-color,#f0f4f8) var(--dexta-academy-4-about-principles-section-bg-opacity,100%),transparent)),var(--dexta-academy-4-about-principles-section-bg-image,none)!important;background-position:var(--dexta-academy-4-about-principles-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-about-principles-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.principal-note-section{background-color:color-mix(in srgb,var(--dexta-academy-4-about-principal-note-section-bg-color,#ffffff) var(--dexta-academy-4-about-principal-note-section-bg-opacity,100%),transparent)!important;background-image:linear-gradient(color-mix(in srgb,var(--dexta-academy-4-about-principal-note-section-bg-color,#ffffff) var(--dexta-academy-4-about-principal-note-section-bg-opacity,100%),transparent),color-mix(in srgb,var(--dexta-academy-4-about-principal-note-section-bg-color,#ffffff) var(--dexta-academy-4-about-principal-note-section-bg-opacity,100%),transparent)),var(--dexta-academy-4-about-principal-note-section-bg-image,none)!important;background-position:var(--dexta-academy-4-about-principal-note-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-about-principal-note-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.principal-note-panel{background:color-mix(in srgb,var(--dexta-academy-4-about-principal-note-panel-bg-color,#102542) var(--dexta-academy-4-about-principal-note-panel-bg-opacity,100%),transparent)!important;}',
	        '.principal-note-signoff{align-self:start!important;background:color-mix(in srgb,var(--dexta-academy-4-about-principal-note-signoff-bg-color,#ffffff) var(--dexta-academy-4-about-principal-note-signoff-bg-opacity,8%),transparent)!important;}',
	        '.student-experience-section{background-color:color-mix(in srgb,var(--dexta-academy-4-about-student-experience-section-bg-color,#f7fafc) var(--dexta-academy-4-about-student-experience-section-bg-opacity,100%),transparent)!important;background-image:linear-gradient(color-mix(in srgb,var(--dexta-academy-4-about-student-experience-section-bg-color,#f7fafc) var(--dexta-academy-4-about-student-experience-section-bg-opacity,100%),transparent),color-mix(in srgb,var(--dexta-academy-4-about-student-experience-section-bg-color,#f7fafc) var(--dexta-academy-4-about-student-experience-section-bg-opacity,100%),transparent)),var(--dexta-academy-4-about-student-experience-section-bg-image,none)!important;background-position:var(--dexta-academy-4-about-student-experience-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-about-student-experience-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.about-facts-section{background-color:color-mix(in srgb,var(--dexta-academy-4-about-facts-section-bg-color,#ffffff) var(--dexta-academy-4-about-facts-section-bg-opacity,100%),transparent)!important;background-image:linear-gradient(color-mix(in srgb,var(--dexta-academy-4-about-facts-section-bg-color,#ffffff) var(--dexta-academy-4-about-facts-section-bg-opacity,100%),transparent),color-mix(in srgb,var(--dexta-academy-4-about-facts-section-bg-color,#ffffff) var(--dexta-academy-4-about-facts-section-bg-opacity,100%),transparent)),var(--dexta-academy-4-about-facts-section-bg-image,none)!important;background-position:var(--dexta-academy-4-about-facts-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-about-facts-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        // ── Existing admissions + contact form sections ──
	        '.admissions-process-section{background-color:color-mix(in srgb,var(--dexta-academy-4-admissions-process-section-bg-color,#ffffff) var(--dexta-academy-4-admissions-process-section-bg-opacity,100%),transparent)!important;background-image:linear-gradient(color-mix(in srgb,var(--dexta-academy-4-admissions-process-section-bg-color,#ffffff) var(--dexta-academy-4-admissions-process-section-bg-opacity,100%),transparent),color-mix(in srgb,var(--dexta-academy-4-admissions-process-section-bg-color,#ffffff) var(--dexta-academy-4-admissions-process-section-bg-opacity,100%),transparent)),var(--dexta-academy-4-admissions-process-section-bg-image,none)!important;background-position:var(--dexta-academy-4-admissions-process-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-admissions-process-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.admissions-side-panel{background:color-mix(in srgb,var(--dexta-academy-4-admissions-process-side-panel-bg-color,#102542) var(--dexta-academy-4-admissions-process-side-panel-bg-opacity,100%),transparent)!important;}',
	        '.admissions-contact-card{background:color-mix(in srgb,var(--dexta-academy-4-admissions-process-contact-card-bg-color,#ffffff) var(--dexta-academy-4-admissions-process-contact-card-bg-opacity,8%),transparent)!important;}',
	        '.admissions-step-card{background:color-mix(in srgb,var(--dexta-academy-4-admissions-process-step-card-bg-color,#f7fafc) var(--dexta-academy-4-admissions-process-step-card-bg-opacity,100%),transparent)!important;}',
	        '.admissions-step-number{color:var(--dexta-academy-4-admissions-process-step-number-color,#ffffff)!important;background:color-mix(in srgb,var(--dexta-academy-4-admissions-process-step-number-bg-color,#102542) var(--dexta-academy-4-admissions-process-step-number-bg-opacity,100%),transparent)!important;}',
	        '.admissions-form-section{background-color:color-mix(in srgb,var(--dexta-academy-4-admissions-form-section-bg-color,#fff) var(--dexta-academy-4-admissions-form-section-bg-opacity,100%),transparent)!important;background-image:linear-gradient(color-mix(in srgb,var(--dexta-academy-4-admissions-form-section-bg-color,#fff) var(--dexta-academy-4-admissions-form-section-bg-opacity,100%),transparent),color-mix(in srgb,var(--dexta-academy-4-admissions-form-section-bg-color,#fff) var(--dexta-academy-4-admissions-form-section-bg-opacity,100%),transparent)),var(--dexta-academy-4-admissions-form-section-bg-image,none)!important;background-position:var(--dexta-academy-4-admissions-form-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-admissions-form-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.admissions-form-link{background:color-mix(in srgb,var(--dexta-academy-4-admissions-form-button-bg-color,#102542) var(--dexta-academy-4-admissions-form-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-4-admissions-form-button-text-color,#ffffff)!important;border:var(--dexta-academy-4-admissions-form-button-border-width,0px) solid var(--dexta-academy-4-admissions-form-button-border-color,#102542)!important;}',
	        '.admissions-page-cta{background-color:color-mix(in srgb,var(--dexta-academy-4-admissions-admissions-cta-section-bg-color,#f0f4f8) var(--dexta-academy-4-admissions-admissions-cta-section-bg-opacity,100%),transparent)!important;background-image:linear-gradient(color-mix(in srgb,var(--dexta-academy-4-admissions-admissions-cta-section-bg-color,#f0f4f8) var(--dexta-academy-4-admissions-admissions-cta-section-bg-opacity,100%),transparent),color-mix(in srgb,var(--dexta-academy-4-admissions-admissions-cta-section-bg-color,#f0f4f8) var(--dexta-academy-4-admissions-admissions-cta-section-bg-opacity,100%),transparent)),var(--dexta-academy-4-admissions-admissions-cta-section-bg-image,none)!important;background-position:var(--dexta-academy-4-admissions-admissions-cta-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-admissions-admissions-cta-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.admissions-page-cta .cta-panel{background:color-mix(in srgb,var(--dexta-academy-4-admissions-admissions-cta-panel-bg-color,#102542) var(--dexta-academy-4-admissions-admissions-cta-panel-bg-opacity,100%),transparent)!important;}',
	        '.admissions-page-cta .btn{background:color-mix(in srgb,var(--dexta-academy-4-admissions-admissions-cta-button-bg-color,#4a8fff) var(--dexta-academy-4-admissions-admissions-cta-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-4-admissions-admissions-cta-button-text-color,#ffffff)!important;border:var(--dexta-academy-4-admissions-admissions-cta-button-border-width,0px) solid var(--dexta-academy-4-admissions-admissions-cta-button-border-color,#4a8fff)!important;}',
	        // ── Gallery sections ──
	        '.gallery-showcase-section{background-color:color-mix(in srgb,var(--dexta-academy-4-gallery-gallery-showcase-section-bg-color,#ffffff) var(--dexta-academy-4-gallery-gallery-showcase-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-4-gallery-gallery-showcase-section-bg-image,none)!important;background-position:var(--dexta-academy-4-gallery-gallery-showcase-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-gallery-gallery-showcase-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.gallery-page-card>span,.gallery-page-card>strong{display:none!important;}',
	        '.gallery-page-card::before{background:linear-gradient(180deg,transparent 0%,rgba(15,23,42,0.18) 100%)!important;}',
	        '.gallery-page-card:hover::before,.gallery-page-card:focus::before{background:linear-gradient(180deg,transparent 0%,rgba(15,23,42,0.28) 100%)!important;}',
	        '.gallery-page-cta{background-color:color-mix(in srgb,var(--dexta-academy-4-gallery-gallery-cta-section-bg-color,#f0f4f8) var(--dexta-academy-4-gallery-gallery-cta-section-bg-opacity,100%),transparent)!important;background-image:linear-gradient(color-mix(in srgb,var(--dexta-academy-4-gallery-gallery-cta-section-bg-color,#f0f4f8) var(--dexta-academy-4-gallery-gallery-cta-section-bg-opacity,100%),transparent),color-mix(in srgb,var(--dexta-academy-4-gallery-gallery-cta-section-bg-color,#f0f4f8) var(--dexta-academy-4-gallery-gallery-cta-section-bg-opacity,100%),transparent)),var(--dexta-academy-4-gallery-gallery-cta-section-bg-image,none)!important;background-position:var(--dexta-academy-4-gallery-gallery-cta-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-gallery-gallery-cta-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.gallery-page-cta .cta-panel{background:color-mix(in srgb,var(--dexta-academy-4-gallery-gallery-cta-panel-bg-color,#102542) var(--dexta-academy-4-gallery-gallery-cta-panel-bg-opacity,100%),transparent)!important;}',
	        '.gallery-page-cta .btn-primary{background:color-mix(in srgb,var(--dexta-academy-4-gallery-gallery-cta-primary-button-bg-color,#4a8fff) var(--dexta-academy-4-gallery-gallery-cta-primary-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-4-gallery-gallery-cta-primary-button-text-color,#ffffff)!important;border:var(--dexta-academy-4-gallery-gallery-cta-primary-button-border-width,0px) solid var(--dexta-academy-4-gallery-gallery-cta-primary-button-border-color,#4a8fff)!important;}',
	        '.gallery-page-cta .btn-outline-primary{background:color-mix(in srgb,var(--dexta-academy-4-gallery-gallery-cta-secondary-button-bg-color,transparent) var(--dexta-academy-4-gallery-gallery-cta-secondary-button-bg-opacity,0%),transparent)!important;color:var(--dexta-academy-4-gallery-gallery-cta-secondary-button-text-color,#ffffff)!important;border:var(--dexta-academy-4-gallery-gallery-cta-secondary-button-border-width,2px) solid var(--dexta-academy-4-gallery-gallery-cta-secondary-button-border-color,#ffffff)!important;}',
	        // ── Contact sections ──
	        '.contact-details-section{background-color:color-mix(in srgb,var(--dexta-academy-4-contact-contact-details-section-bg-color,#ffffff) var(--dexta-academy-4-contact-contact-details-section-bg-opacity,100%),transparent)!important;background-image:linear-gradient(color-mix(in srgb,var(--dexta-academy-4-contact-contact-details-section-bg-color,#ffffff) var(--dexta-academy-4-contact-contact-details-section-bg-opacity,100%),transparent),color-mix(in srgb,var(--dexta-academy-4-contact-contact-details-section-bg-color,#ffffff) var(--dexta-academy-4-contact-contact-details-section-bg-opacity,100%),transparent)),var(--dexta-academy-4-contact-contact-details-section-bg-image,none)!important;background-position:var(--dexta-academy-4-contact-contact-details-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-contact-contact-details-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.contact-detail-card{background:color-mix(in srgb,var(--dexta-academy-4-contact-contact-details-card-bg-color,#f7fafc) var(--dexta-academy-4-contact-contact-details-card-bg-opacity,100%),transparent)!important;border-color:var(--dexta-academy-4-contact-contact-details-card-border-color,rgba(15,23,42,0.06))!important;}.contact-detail-card strong{color:var(--dexta-academy-4-contact-contact-details-card-title-text-color,#102542)!important;}.contact-detail-card span,.contact-detail-card a{color:var(--dexta-academy-4-contact-contact-details-card-body-text-color,#5f6f81)!important;}',
	        '.contact-page-cta{background-color:color-mix(in srgb,var(--dexta-academy-4-contact-contact-cta-section-bg-color,#f0f4f8) var(--dexta-academy-4-contact-contact-cta-section-bg-opacity,100%),transparent)!important;background-image:linear-gradient(color-mix(in srgb,var(--dexta-academy-4-contact-contact-cta-section-bg-color,#f0f4f8) var(--dexta-academy-4-contact-contact-cta-section-bg-opacity,100%),transparent),color-mix(in srgb,var(--dexta-academy-4-contact-contact-cta-section-bg-color,#f0f4f8) var(--dexta-academy-4-contact-contact-cta-section-bg-opacity,100%),transparent)),var(--dexta-academy-4-contact-contact-cta-section-bg-image,none)!important;background-position:var(--dexta-academy-4-contact-contact-cta-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-contact-contact-cta-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.contact-page-cta .cta-panel{background:color-mix(in srgb,var(--dexta-academy-4-contact-contact-cta-panel-bg-color,#102542) var(--dexta-academy-4-contact-contact-cta-panel-bg-opacity,100%),transparent)!important;}',
	        '.contact-page-cta .btn-primary{background:color-mix(in srgb,var(--dexta-academy-4-contact-contact-cta-primary-button-bg-color,#4a8fff) var(--dexta-academy-4-contact-contact-cta-primary-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-4-contact-contact-cta-primary-button-text-color,#ffffff)!important;border:var(--dexta-academy-4-contact-contact-cta-primary-button-border-width,0px) solid var(--dexta-academy-4-contact-contact-cta-primary-button-border-color,#4a8fff)!important;}',
	        '.contact-page-cta .btn-outline-primary{background:color-mix(in srgb,var(--dexta-academy-4-contact-contact-cta-secondary-button-bg-color,transparent) var(--dexta-academy-4-contact-contact-cta-secondary-button-bg-opacity,0%),transparent)!important;color:var(--dexta-academy-4-contact-contact-cta-secondary-button-text-color,#ffffff)!important;border:var(--dexta-academy-4-contact-contact-cta-secondary-button-border-width,2px) solid var(--dexta-academy-4-contact-contact-cta-secondary-button-border-color,#ffffff)!important;}',
	        '.contact-form-section{background-color:color-mix(in srgb,var(--dexta-academy-4-contact-form-section-bg-color,#fff) var(--dexta-academy-4-contact-form-section-bg-opacity,100%),transparent)!important;background-image:linear-gradient(color-mix(in srgb,var(--dexta-academy-4-contact-form-section-bg-color,#fff) var(--dexta-academy-4-contact-form-section-bg-opacity,100%),transparent),color-mix(in srgb,var(--dexta-academy-4-contact-form-section-bg-color,#fff) var(--dexta-academy-4-contact-form-section-bg-opacity,100%),transparent)),var(--dexta-academy-4-contact-form-section-bg-image,none)!important;background-position:var(--dexta-academy-4-contact-form-section-bg-position,center center)!important;background-size:var(--dexta-academy-4-contact-form-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.contact-form-link{background:color-mix(in srgb,var(--dexta-academy-4-contact-form-button-bg-color,#102542) var(--dexta-academy-4-contact-form-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-4-contact-form-button-text-color,#ffffff)!important;border:var(--dexta-academy-4-contact-form-button-border-width,0px) solid var(--dexta-academy-4-contact-form-button-border-color,#102542)!important;}',
	        '.contact-side-panel{background:color-mix(in srgb,var(--dexta-academy-4-contact-form-side-panel-bg-color,#102542) var(--dexta-academy-4-contact-form-side-panel-bg-opacity,100%),transparent)!important;}.contact-panel-kicker{color:var(--dexta-academy-4-contact-form-side-panel-kicker-text-color,rgba(255,255,255,0.72))!important;}.contact-side-panel h2{color:var(--dexta-academy-4-contact-form-side-panel-title-text-color,#ffffff)!important;}.contact-side-panel>p{color:var(--dexta-academy-4-contact-form-side-panel-body-text-color,rgba(255,255,255,0.78))!important;}.contact-focus-list li{color:var(--dexta-academy-4-contact-form-side-panel-list-text-color,rgba(255,255,255,0.8))!important;}.contact-side-links a{color:var(--dexta-academy-4-contact-form-side-panel-link-text-color,#ffffff)!important;}'
	      ].join("");
	    }
	    if (preview.content.templateSlug === "dexta-academy-5") {
	      return [
	        // ── Shared Header ──
	        '.site-header{background-color:color-mix(in srgb,var(--dexta-academy-5-shared-header-section-bg-color,#ffffff) var(--dexta-academy-5-shared-header-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-shared-header-section-bg-image,none)!important;background-position:var(--dexta-academy-5-shared-header-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-shared-header-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.site-header .header-cta{background:color-mix(in srgb,var(--dexta-academy-5-shared-header-cta-button-bg-color,#f8b533) var(--dexta-academy-5-shared-header-cta-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-5-shared-header-cta-button-text-color,#0e1d45)!important;border:var(--dexta-academy-5-shared-header-cta-button-border-width,0px) solid var(--dexta-academy-5-shared-header-cta-button-border-color,#f8b533)!important;}',
	        '.site-header .site-header__nav a,.site-header .site-header__nav button{color:var(--dexta-academy-5-shared-header-nav-link-color,#333333)!important;}',
	        '.site-header .site-header__nav{border-color:var(--dexta-academy-5-shared-header-nav-border-color,#e5e5e5)!important;}',
	        // ── Shared Footer ──
	        '.site-footer{background-color:color-mix(in srgb,var(--dexta-academy-5-shared-footer-section-bg-color,#31401c) var(--dexta-academy-5-shared-footer-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-shared-footer-section-bg-image,none)!important;background-position:var(--dexta-academy-5-shared-footer-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-shared-footer-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        // ── Home Hero ──
	        '.hero{background-color:color-mix(in srgb,var(--dexta-academy-5-home-hero-section-bg-color,#ffffff) var(--dexta-academy-5-home-hero-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-home-hero-section-bg-image,none)!important;background-position:var(--dexta-academy-5-home-hero-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-home-hero-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.hero .hero__actions .button--primary{background:color-mix(in srgb,var(--dexta-academy-5-home-hero-button-bg-color,#556b2f) var(--dexta-academy-5-home-hero-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-5-home-hero-button-text-color,#ffffff)!important;border:var(--dexta-academy-5-home-hero-button-border-width,0px) solid var(--dexta-academy-5-home-hero-button-border-color,#556b2f)!important;}',
	        '.hero .stat-card__icon{color:var(--dexta-academy-5-home-hero-icon-color,#556b2f)!important;background-color:color-mix(in srgb,var(--dexta-academy-5-home-hero-icon-bg-color,#f3fae3) var(--dexta-academy-5-home-hero-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-home-hero-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-5-home-hero-icon-border-width,0px) solid var(--dexta-academy-5-home-hero-icon-border-color,#f3fae3)!important;}',
	        // ── Home About Preview ──
	        '.about-preview{background-color:color-mix(in srgb,var(--dexta-academy-5-home-about-preview-section-bg-color,#f3fae3) var(--dexta-academy-5-home-about-preview-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-home-about-preview-section-bg-image,none)!important;background-position:var(--dexta-academy-5-home-about-preview-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-home-about-preview-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.about-preview .about-preview__button{background:color-mix(in srgb,var(--dexta-academy-5-home-about-preview-button-bg-color,#556b2f) var(--dexta-academy-5-home-about-preview-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-5-home-about-preview-button-text-color,#ffffff)!important;border:var(--dexta-academy-5-home-about-preview-button-border-width,0px) solid var(--dexta-academy-5-home-about-preview-button-border-color,#556b2f)!important;}',
	        '.about-preview .about-preview__quote{background-color:var(--dexta-academy-5-home-about-preview-quote-bg-color,#31401c)!important;}',
	        // ── Home Programmes ──
	        '.programmes-section{background-color:color-mix(in srgb,var(--dexta-academy-5-home-programmes-section-bg-color,#ffffff) var(--dexta-academy-5-home-programmes-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-home-programmes-section-bg-image,none)!important;background-position:var(--dexta-academy-5-home-programmes-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-home-programmes-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.programmes-section .section-action .button{background:color-mix(in srgb,var(--dexta-academy-5-home-programmes-button-bg-color,#556b2f) var(--dexta-academy-5-home-programmes-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-5-home-programmes-button-text-color,#ffffff)!important;border:var(--dexta-academy-5-home-programmes-button-border-width,0px) solid var(--dexta-academy-5-home-programmes-button-border-color,#556b2f)!important;}',
	        '.programmes-section .programme-card__icon{color:var(--dexta-academy-5-home-programmes-icon-color,#556b2f)!important;background-color:color-mix(in srgb,var(--dexta-academy-5-home-programmes-icon-bg-color,#f3fae3) var(--dexta-academy-5-home-programmes-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-home-programmes-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-5-home-programmes-icon-border-width,0px) solid var(--dexta-academy-5-home-programmes-icon-border-color,#f3fae3)!important;}',
	        // ── Home Approach ──
	        '.approach-section{background-color:color-mix(in srgb,var(--dexta-academy-5-home-approach-section-bg-color,#31401c) var(--dexta-academy-5-home-approach-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-home-approach-section-bg-image,none)!important;background-position:var(--dexta-academy-5-home-approach-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-home-approach-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.approach-section .approach-section__content .button{background:color-mix(in srgb,var(--dexta-academy-5-home-approach-button-bg-color,#556b2f) var(--dexta-academy-5-home-approach-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-5-home-approach-button-text-color,#ffffff)!important;border:var(--dexta-academy-5-home-approach-button-border-width,0px) solid var(--dexta-academy-5-home-approach-button-border-color,#556b2f)!important;}',
	        '.approach-section .approach-badges span{color:var(--dexta-academy-5-home-approach-badge-text-color,var(--dexta-academy-5-home-approach-icon-color,#ffffff))!important;background-color:color-mix(in srgb,var(--dexta-academy-5-home-approach-icon-bg-color,#ffffff) var(--dexta-academy-5-home-approach-icon-bg-opacity,0%),transparent)!important;background-image:var(--dexta-academy-5-home-approach-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-5-home-approach-icon-border-width,0px) solid var(--dexta-academy-5-home-approach-icon-border-color,#ffffff)!important;}',
	        '.approach-section .approach-badges{background-color:var(--dexta-academy-5-home-approach-badge-bg-color,#d4a437)!important;}',
	        '.approach-section .approach-section__content ul li{color:var(--dexta-academy-5-home-approach-point-color,#ffffff)!important;}',
	        // ── Home Testimonials ──
	        '.testimonials-section{background-color:color-mix(in srgb,var(--dexta-academy-5-home-testimonials-section-bg-color,#ffffff) var(--dexta-academy-5-home-testimonials-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-home-testimonials-section-bg-image,none)!important;background-position:var(--dexta-academy-5-home-testimonials-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-home-testimonials-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        // ── Home Admissions Journey ──
	        '.journey-section{background-color:color-mix(in srgb,var(--dexta-academy-5-home-admissions-journey-section-bg-color,#ffffff) var(--dexta-academy-5-home-admissions-journey-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-home-admissions-journey-section-bg-image,none)!important;background-position:var(--dexta-academy-5-home-admissions-journey-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-home-admissions-journey-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.journey-section .journey-card{background-color:var(--dexta-academy-5-home-admissions-journey-container-bg-color,#31401c)!important;}',
	        '.journey-section .journey-action{background:color-mix(in srgb,var(--dexta-academy-5-home-admissions-journey-button-bg-color,#31401c) var(--dexta-academy-5-home-admissions-journey-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-5-home-admissions-journey-button-text-color,#ffffff)!important;border:var(--dexta-academy-5-home-admissions-journey-button-border-width,0px) solid var(--dexta-academy-5-home-admissions-journey-button-border-color,#31401c)!important;}',
	        '.journey-section .journey-action__icon{color:var(--dexta-academy-5-home-admissions-journey-icon-color,#556b2f)!important;background-color:color-mix(in srgb,var(--dexta-academy-5-home-admissions-journey-icon-bg-color,#f3fae3) var(--dexta-academy-5-home-admissions-journey-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-home-admissions-journey-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-5-home-admissions-journey-icon-border-width,0px) solid var(--dexta-academy-5-home-admissions-journey-icon-border-color,#f3fae3)!important;}',
	        // ── Home Admission Modal (existing) ──
	        '.admission-modal:not(.contact-modal) .admission-modal__dialog{background-color:color-mix(in srgb,var(--dexta-academy-5-admission-form-section-bg-color,#fff) var(--dexta-academy-5-admission-form-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-admission-form-section-bg-image,none)!important;background-position:var(--dexta-academy-5-admission-form-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-admission-form-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        // ── Home Contact Modal (existing) ──
	        '.contact-modal .admission-modal__dialog{background-color:color-mix(in srgb,var(--dexta-academy-5-contact-modal-section-bg-color,#fff) var(--dexta-academy-5-contact-modal-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-contact-modal-section-bg-image,none)!important;background-position:var(--dexta-academy-5-contact-modal-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-contact-modal-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        // ── About Hero ──
	        '.page-hero{background-color:color-mix(in srgb,var(--dexta-academy-5-about-hero-section-bg-color,var(--dexta-academy-5-campus-life-hero-section-bg-color,var(--dexta-academy-5-gallery-hero-section-bg-color,var(--dexta-academy-5-contact-hero-section-bg-color,#31401c)))) var(--dexta-academy-5-about-hero-section-bg-opacity,var(--dexta-academy-5-campus-life-hero-section-bg-opacity,var(--dexta-academy-5-gallery-hero-section-bg-opacity,var(--dexta-academy-5-contact-hero-section-bg-opacity,100%)))),transparent)!important;background-image:var(--dexta-academy-5-about-hero-section-bg-image,var(--dexta-academy-5-campus-life-hero-section-bg-image,var(--dexta-academy-5-gallery-hero-section-bg-image,var(--dexta-academy-5-contact-hero-section-bg-image,none))))!important;background-position:var(--dexta-academy-5-about-hero-section-bg-position,var(--dexta-academy-5-campus-life-hero-section-bg-position,var(--dexta-academy-5-gallery-hero-section-bg-position,var(--dexta-academy-5-contact-hero-section-bg-position,center center))))!important;background-size:var(--dexta-academy-5-about-hero-section-bg-size,var(--dexta-academy-5-campus-life-hero-section-bg-size,var(--dexta-academy-5-gallery-hero-section-bg-size,var(--dexta-academy-5-contact-hero-section-bg-size,cover))))!important;background-repeat:no-repeat!important;}',
	        '.page-hero .page-actions .button{background:color-mix(in srgb,var(--dexta-academy-5-about-hero-button-bg-color,var(--dexta-academy-5-campus-life-hero-button-bg-color,var(--dexta-academy-5-gallery-hero-button-bg-color,var(--dexta-academy-5-contact-hero-button-bg-color,#556b2f)))) var(--dexta-academy-5-about-hero-button-bg-opacity,var(--dexta-academy-5-campus-life-hero-button-bg-opacity,var(--dexta-academy-5-gallery-hero-button-bg-opacity,var(--dexta-academy-5-contact-hero-button-bg-opacity,100%)))),transparent)!important;color:var(--dexta-academy-5-about-hero-button-text-color,var(--dexta-academy-5-campus-life-hero-button-text-color,var(--dexta-academy-5-gallery-hero-button-text-color,var(--dexta-academy-5-contact-hero-button-text-color,#ffffff))))!important;border:var(--dexta-academy-5-about-hero-button-border-width,var(--dexta-academy-5-campus-life-hero-button-border-width,var(--dexta-academy-5-gallery-hero-button-border-width,var(--dexta-academy-5-contact-hero-button-border-width,0px)))) solid var(--dexta-academy-5-about-hero-button-border-color,var(--dexta-academy-5-campus-life-hero-button-border-color,var(--dexta-academy-5-gallery-hero-button-border-color,var(--dexta-academy-5-contact-hero-button-border-color,#556b2f))))!important;}',
	        // ── About Stats ──
	        '.page-stat-grid{background-color:color-mix(in srgb,var(--dexta-academy-5-about-stats-section-bg-color,#ffffff) var(--dexta-academy-5-about-stats-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-about-stats-section-bg-image,none)!important;background-position:var(--dexta-academy-5-about-stats-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-about-stats-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.page-stat-grid .stat-card__label{color:var(--dexta-academy-5-about-stats-text-color,#333333)!important;}',
	        '.page-stat-grid .stat-card__value{color:var(--dexta-academy-5-about-stats-value-color,#31401c)!important;}',
	        '.page-stat-grid .stat-card__icon{color:var(--dexta-academy-5-about-stats-icon-color,#556b2f)!important;background-color:color-mix(in srgb,var(--dexta-academy-5-about-stats-icon-bg-color,#f3fae3) var(--dexta-academy-5-about-stats-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-about-stats-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-5-about-stats-icon-border-width,0px) solid var(--dexta-academy-5-about-stats-icon-border-color,#f3fae3)!important;}',
	        // ── About Story ──
	        '.page-section--olive{background-color:color-mix(in srgb,var(--dexta-academy-5-about-story-section-bg-color,#31401c) var(--dexta-academy-5-about-story-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-about-story-section-bg-image,none)!important;background-position:var(--dexta-academy-5-about-story-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-about-story-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        '.page-section--olive .story-read-more{background:color-mix(in srgb,var(--dexta-academy-5-about-story-button-bg-color,#d4a437) var(--dexta-academy-5-about-story-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-5-about-story-button-text-color,#0e1d45)!important;border:var(--dexta-academy-5-about-story-button-border-width,0px) solid var(--dexta-academy-5-about-story-button-border-color,#d4a437)!important;}',
	        // ── About Values ──
	        '.value-grid{background-color:color-mix(in srgb,var(--dexta-academy-5-about-values-section-bg-color,#ffffff) var(--dexta-academy-5-about-values-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-about-values-section-bg-image,none)!important;background-position:var(--dexta-academy-5-about-values-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-about-values-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        // ── About Story Modal ──
	        '.story-modal .admission-modal__dialog{background-color:color-mix(in srgb,var(--dexta-academy-5-about-story-modal-section-bg-color,#ffffff) var(--dexta-academy-5-about-story-modal-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-about-story-modal-section-bg-image,none)!important;background-position:var(--dexta-academy-5-about-story-modal-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-about-story-modal-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        // ── Campus Life Overview ──
	        '.school-life-overview{background-color:color-mix(in srgb,var(--dexta-academy-5-campus-life-overview-section-bg-color,#ffffff) var(--dexta-academy-5-campus-life-overview-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-campus-life-overview-section-bg-image,none)!important;background-position:var(--dexta-academy-5-campus-life-overview-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-campus-life-overview-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        // ── Campus Life Day ──
	        '.school-life-day{background-color:color-mix(in srgb,var(--dexta-academy-5-campus-life-day-section-bg-color,#f3fae3) var(--dexta-academy-5-campus-life-day-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-campus-life-day-section-bg-image,none)!important;background-position:var(--dexta-academy-5-campus-life-day-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-campus-life-day-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        // ── Gallery Grid ──
	        '.gallery-grid{background-color:color-mix(in srgb,var(--dexta-academy-5-gallery-grid-section-bg-color,#ffffff) var(--dexta-academy-5-gallery-grid-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-gallery-grid-section-bg-image,none)!important;background-position:var(--dexta-academy-5-gallery-grid-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-gallery-grid-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        // ── Contact Details ──
	        '.contact-panel{background-color:color-mix(in srgb,var(--dexta-academy-5-contact-details-section-bg-color,#ffffff) var(--dexta-academy-5-contact-details-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-contact-details-section-bg-image,none)!important;background-position:var(--dexta-academy-5-contact-details-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-contact-details-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
	        // ── Contact Form (existing) ──
	        '.contact-form-panel{background-color:color-mix(in srgb,var(--dexta-academy-5-contact-form-section-bg-color,#fff) var(--dexta-academy-5-contact-form-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-5-contact-form-section-bg-image,none)!important;background-position:var(--dexta-academy-5-contact-form-section-bg-position,center center)!important;background-size:var(--dexta-academy-5-contact-form-section-bg-size,cover)!important;background-repeat:no-repeat!important;}'
	      ].join("");
	    }
	    if (preview.content.templateSlug !== "dexta-academy-2") return "";
    return [
      'body[data-page="home"] .hero-home{background-image:var(--dexta-academy-2-hero-desktop-tree-image)!important;background-position:var(--dexta-academy-2-hero-desktop-tree-position,center center)!important;background-size:var(--dexta-academy-2-hero-desktop-tree-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="home"] .hero-home__building{background-image:var(--dexta-academy-2-hero-desktop-building-image)!important;background-position:var(--dexta-academy-2-hero-desktop-building-position,center bottom)!important;background-size:var(--dexta-academy-2-hero-desktop-building-size,100% auto)!important;background-repeat:no-repeat!important;}',
      'body[data-page="home"] .hero-home__overlay{background:var(--dexta-academy-2-hero-overlay-color,#04111d)!important;opacity:var(--dexta-academy-2-hero-overlay-opacity,.58)!important;}',
      'body[data-page="home"] .hero-home__students{right:var(--dexta-academy-2-hero-students-desktop-right,max(-3.5vw,-44px))!important;bottom:var(--dexta-academy-2-hero-students-desktop-bottom,-78px)!important;width:var(--dexta-academy-2-hero-students-desktop-width,min(49vw,790px))!important;}',
      '.site-header .button--outline-light,.site-header .mobile-panel .button--outline-light{background:color-mix(in srgb,var(--dexta-academy-2-header-portal-button-bg-color,#ffc433) var(--dexta-academy-2-header-portal-button-bg-opacity,0%),transparent)!important;color:var(--dexta-academy-2-header-portal-button-text-color,#fff)!important;border:var(--dexta-academy-2-header-portal-button-border-width,1px) solid var(--dexta-academy-2-header-portal-button-border-color,#ffc433)!important;}',
      '.site-header .button--primary,.site-header .mobile-panel .button--primary{background:color-mix(in srgb,var(--dexta-academy-2-header-primary-button-bg-color,#ffc433) var(--dexta-academy-2-header-primary-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-2-header-primary-button-text-color,#0c1d2d)!important;border:var(--dexta-academy-2-header-primary-button-border-width,0px) solid var(--dexta-academy-2-header-primary-button-border-color,#ffc433)!important;}',
      'body[data-page="home"] .hero-home{background-color:color-mix(in srgb,var(--dexta-academy-2-home-hero-section-bg-color,#081827) var(--dexta-academy-2-home-hero-section-bg-opacity,100%),transparent)!important;}',
      'body[data-page="home"] .hero-home__actions .button{background:color-mix(in srgb,var(--dexta-academy-2-home-hero-button-bg-color,#fff) var(--dexta-academy-2-home-hero-button-bg-opacity,0%),transparent)!important;color:var(--dexta-academy-2-home-hero-button-text-color,#fff)!important;border:var(--dexta-academy-2-home-hero-button-border-width,1px) solid var(--dexta-academy-2-home-hero-button-border-color,#fff)!important;}',
      'body[data-page="home"] .hero-home__stats{background-color:color-mix(in srgb,var(--dexta-academy-2-home-stats-section-bg-color,#081827) var(--dexta-academy-2-home-stats-section-bg-opacity,0%),transparent)!important;background-image:var(--dexta-academy-2-home-stats-section-bg-image,none)!important;background-position:var(--dexta-academy-2-home-stats-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-home-stats-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="home"] .hero-home__stat-top [data-icon]{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:28px!important;height:28px!important;border-radius:999px!important;color:var(--dexta-academy-2-home-stats-icon-color,#ffc433)!important;background-color:color-mix(in srgb,var(--dexta-academy-2-home-stats-icon-bg-color,#081827) var(--dexta-academy-2-home-stats-icon-bg-opacity,0%),transparent)!important;background-image:var(--dexta-academy-2-home-stats-item-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-2-home-stats-icon-border-width,0px) solid var(--dexta-academy-2-home-stats-icon-border-color,#ffc433)!important;}',
      'body[data-page="home"] .hero-home__stat-top [data-icon] svg{opacity:var(--dexta-academy-2-home-stats-item-icon-opacity,1)!important;}',
      'body[data-page="home"] .values-strip{background-color:color-mix(in srgb,var(--dexta-academy-2-home-values-section-bg-color,#fff) var(--dexta-academy-2-home-values-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-home-values-section-bg-image,none)!important;background-position:var(--dexta-academy-2-home-values-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-home-values-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="home"] .value-item__icon{color:var(--dexta-academy-2-home-values-icon-color,#f0b31f)!important;background-color:color-mix(in srgb,var(--dexta-academy-2-home-values-icon-bg-color,#fff) var(--dexta-academy-2-home-values-icon-bg-opacity,0%),transparent)!important;background-image:var(--dexta-academy-2-home-values-item-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-2-home-values-icon-border-width,1.5px) solid var(--dexta-academy-2-home-values-icon-border-color,#ffc433)!important;}',
      'body[data-page="home"] .value-item__icon svg{opacity:var(--dexta-academy-2-home-values-item-icon-opacity,1)!important;}',
      'body[data-page="home"] .split-showcase{background-color:color-mix(in srgb,var(--dexta-academy-2-home-about-section-bg-color,#081827) var(--dexta-academy-2-home-about-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-home-about-section-bg-image,none)!important;background-position:var(--dexta-academy-2-home-about-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-home-about-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="home"] .split-showcase .button{background:color-mix(in srgb,var(--dexta-academy-2-home-about-button-bg-color,#ffc433) var(--dexta-academy-2-home-about-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-2-home-about-button-text-color,#0c1d2d)!important;border:var(--dexta-academy-2-home-about-button-border-width,0px) solid var(--dexta-academy-2-home-about-button-border-color,#ffc433)!important;}',
      'body[data-page="home"] .programs{background-color:color-mix(in srgb,var(--dexta-academy-2-home-programs-section-bg-color,#fff) var(--dexta-academy-2-home-programs-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-home-programs-section-bg-image,none)!important;background-position:var(--dexta-academy-2-home-programs-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-home-programs-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="home"] .programs .button{background:color-mix(in srgb,var(--dexta-academy-2-home-programs-button-bg-color,#ffc433) var(--dexta-academy-2-home-programs-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-2-home-programs-button-text-color,#0c1d2d)!important;border:var(--dexta-academy-2-home-programs-button-border-width,0px) solid var(--dexta-academy-2-home-programs-button-border-color,#ffc433)!important;}',
      'body[data-page="home"] .programs .card__badge,body[data-page="home"] .programs .cta-banner__icon{color:var(--dexta-academy-2-home-programs-icon-color,#091624)!important;background-color:color-mix(in srgb,var(--dexta-academy-2-home-programs-icon-bg-color,#ffc433) var(--dexta-academy-2-home-programs-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-home-programs-item-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-2-home-programs-icon-border-width,0px) solid var(--dexta-academy-2-home-programs-icon-border-color,#ffc433)!important;}',
      'body[data-page="home"] .programs .card__badge svg{opacity:var(--dexta-academy-2-home-programs-item-icon-opacity,1)!important;}',
      'body[data-page="home"] main>section:nth-of-type(5){background-color:color-mix(in srgb,var(--dexta-academy-2-home-student-life-section-bg-color,#fff) var(--dexta-academy-2-home-student-life-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-home-student-life-section-bg-image,none)!important;background-position:var(--dexta-academy-2-home-student-life-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-home-student-life-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="home"] .news-heading .button{background:color-mix(in srgb,var(--dexta-academy-2-home-student-life-button-bg-color,#fff) var(--dexta-academy-2-home-student-life-button-bg-opacity,0%),transparent)!important;color:var(--dexta-academy-2-home-student-life-button-text-color,#12304d)!important;border:var(--dexta-academy-2-home-student-life-button-border-width,1px) solid var(--dexta-academy-2-home-student-life-button-border-color,#d6dde6)!important;}',
      'body[data-page="home"] .news-grid{background-color:color-mix(in srgb,var(--dexta-academy-2-home-student-life-cards-section-bg-color,#fff) var(--dexta-academy-2-home-student-life-cards-section-bg-opacity,0%),transparent)!important;background-image:var(--dexta-academy-2-home-student-life-cards-section-bg-image,none)!important;background-position:var(--dexta-academy-2-home-student-life-cards-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-home-student-life-cards-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="home"] .news-card .card__link [data-icon]{display:inline-flex!important;align-items:center!important;justify-content:center!important;color:var(--dexta-academy-2-home-student-life-cards-icon-color,#12304d)!important;background-color:color-mix(in srgb,var(--dexta-academy-2-home-student-life-cards-icon-bg-color,#fff) var(--dexta-academy-2-home-student-life-cards-icon-bg-opacity,0%),transparent)!important;background-image:var(--dexta-academy-2-home-student-life-cards-item-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-2-home-student-life-cards-icon-border-width,0px) solid var(--dexta-academy-2-home-student-life-cards-icon-border-color,#12304d)!important;}',
      'body[data-page="home"] .news-card .card__link [data-icon] svg{opacity:var(--dexta-academy-2-home-student-life-cards-item-icon-opacity,1)!important;}',
      'body:not([data-page="home"]) .page-hero{background-color:color-mix(in srgb,var(--dexta-academy-2-page-hero-section-bg-color,#081827) var(--dexta-academy-2-page-hero-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-page-hero-background-image)!important;background-position:var(--dexta-academy-2-page-hero-background-position,center center)!important;background-size:var(--dexta-academy-2-page-hero-background-size,cover)!important;background-repeat:no-repeat!important;}',
      'body:not([data-page="home"]) .page-hero::before{background-image:var(--dexta-academy-2-page-hero-building-image)!important;background-position:var(--dexta-academy-2-page-hero-building-position,center bottom)!important;background-size:var(--dexta-academy-2-page-hero-building-size,100% auto)!important;background-repeat:no-repeat!important;}',
      'body:not([data-page="home"]) .page-hero::after{background:var(--dexta-academy-2-page-hero-overlay-color,#04111d)!important;opacity:var(--dexta-academy-2-page-hero-overlay-opacity,.62)!important;}',
      'body[data-page="about"] main>section:nth-of-type(2){background-color:color-mix(in srgb,var(--dexta-academy-2-about-stats-section-bg-color,#fff) var(--dexta-academy-2-about-stats-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-about-stats-section-bg-image,none)!important;background-position:var(--dexta-academy-2-about-stats-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-about-stats-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="about"] main>section:nth-of-type(3){background-color:color-mix(in srgb,var(--dexta-academy-2-about-who-we-are-section-bg-color,#081827) var(--dexta-academy-2-about-who-we-are-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-about-who-we-are-section-bg-image,none)!important;background-position:var(--dexta-academy-2-about-who-we-are-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-about-who-we-are-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="about"] .about-story-section{background-color:color-mix(in srgb,var(--dexta-academy-2-about-story-section-bg-color,#fff) var(--dexta-academy-2-about-story-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-about-story-section-bg-image,none)!important;background-position:var(--dexta-academy-2-about-story-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-about-story-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="about"] .about-story-section .button{background:color-mix(in srgb,var(--dexta-academy-2-about-story-button-bg-color,#ffc433) var(--dexta-academy-2-about-story-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-2-about-story-button-text-color,#0c1d2d)!important;border:var(--dexta-academy-2-about-story-button-border-width,0px) solid var(--dexta-academy-2-about-story-button-border-color,#ffc433)!important;}',
      '.story-modal__dialog{background-color:color-mix(in srgb,var(--dexta-academy-2-about-story-modal-section-bg-color,#fff) var(--dexta-academy-2-about-story-modal-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-about-story-modal-section-bg-image,none)!important;background-position:var(--dexta-academy-2-about-story-modal-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-about-story-modal-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="about"] main>section:nth-of-type(5){background-color:color-mix(in srgb,var(--dexta-academy-2-about-mission-vision-section-bg-color,#fff4cc) var(--dexta-academy-2-about-mission-vision-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-about-mission-vision-section-bg-image,none)!important;background-position:var(--dexta-academy-2-about-mission-vision-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-about-mission-vision-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="about"] .info-card__icon{color:var(--dexta-academy-2-about-mission-vision-icon-color,#091624)!important;background-color:color-mix(in srgb,var(--dexta-academy-2-about-mission-vision-icon-bg-color,#ffc433) var(--dexta-academy-2-about-mission-vision-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-about-mission-vision-item-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-2-about-mission-vision-icon-border-width,0px) solid var(--dexta-academy-2-about-mission-vision-icon-border-color,#ffc433)!important;}',
      'body[data-page="about"] .info-card__icon svg{opacity:var(--dexta-academy-2-about-mission-vision-item-icon-opacity,1)!important;}',
      'body[data-page="about"] main>section:nth-of-type(6){background-color:color-mix(in srgb,var(--dexta-academy-2-about-family-choice-section-bg-color,#fff) var(--dexta-academy-2-about-family-choice-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-about-family-choice-section-bg-image,none)!important;background-position:var(--dexta-academy-2-about-family-choice-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-about-family-choice-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="academics"] main>section:nth-of-type(2){background-color:color-mix(in srgb,var(--dexta-academy-2-academics-overview-section-bg-color,#fff) var(--dexta-academy-2-academics-overview-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-academics-overview-section-bg-image,none)!important;background-position:var(--dexta-academy-2-academics-overview-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-academics-overview-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="academics"] main>section:nth-of-type(2) .info-card__icon{color:var(--dexta-academy-2-academics-overview-icon-color,#9b7104)!important;background-color:color-mix(in srgb,var(--dexta-academy-2-academics-overview-icon-bg-color,#fff4cc) var(--dexta-academy-2-academics-overview-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-academics-overview-item-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-2-academics-overview-icon-border-width,0px) solid var(--dexta-academy-2-academics-overview-icon-border-color,#fff4cc)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(2) .info-card__icon svg{opacity:var(--dexta-academy-2-academics-overview-item-icon-opacity,1)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(3){background-color:color-mix(in srgb,var(--dexta-academy-2-academics-subjects-section-bg-color,#081827) var(--dexta-academy-2-academics-subjects-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-academics-subjects-section-bg-image,none)!important;background-position:var(--dexta-academy-2-academics-subjects-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-academics-subjects-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="academics"] main>section:nth-of-type(3) .card__badge{color:var(--dexta-academy-2-academics-subjects-icon-color,#091624)!important;background-color:color-mix(in srgb,var(--dexta-academy-2-academics-subjects-icon-bg-color,#ffc433) var(--dexta-academy-2-academics-subjects-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-academics-subjects-item-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-2-academics-subjects-icon-border-width,0px) solid var(--dexta-academy-2-academics-subjects-icon-border-color,#ffc433)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(3) .card__badge svg{opacity:var(--dexta-academy-2-academics-subjects-item-icon-opacity,1)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(4){background-color:color-mix(in srgb,var(--dexta-academy-2-academics-learning-section-bg-color,#fff) var(--dexta-academy-2-academics-learning-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-academics-learning-section-bg-image,none)!important;background-position:var(--dexta-academy-2-academics-learning-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-academics-learning-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="academics"] main>section:nth-of-type(4) .steps__number{color:var(--dexta-academy-2-academics-learning-icon-color,#9b7104)!important;background-color:color-mix(in srgb,var(--dexta-academy-2-academics-learning-icon-bg-color,#fff4cc) var(--dexta-academy-2-academics-learning-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-academics-learning-item-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-2-academics-learning-icon-border-width,0px) solid var(--dexta-academy-2-academics-learning-icon-border-color,#fff4cc)!important;}',
      'body[data-page="admissions"] main>section:nth-of-type(2){background-color:color-mix(in srgb,var(--dexta-academy-2-admissions-process-section-bg-color,#fff) var(--dexta-academy-2-admissions-process-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-admissions-process-section-bg-image,none)!important;background-position:var(--dexta-academy-2-admissions-process-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-admissions-process-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="admissions"] main>section:nth-of-type(2) .steps__number,body[data-page="admissions"] main>section:nth-of-type(2) .feature-list__bullet{color:var(--dexta-academy-2-admissions-process-icon-color,#9b7104)!important;background-color:color-mix(in srgb,var(--dexta-academy-2-admissions-process-icon-bg-color,#fff4cc) var(--dexta-academy-2-admissions-process-icon-bg-opacity,100%),transparent)!important;border:var(--dexta-academy-2-admissions-process-icon-border-width,0px) solid var(--dexta-academy-2-admissions-process-icon-border-color,#fff4cc)!important;}',
      'body[data-page="admissions"] #portal{background-color:color-mix(in srgb,var(--dexta-academy-2-admissions-support-section-bg-color,#081827) var(--dexta-academy-2-admissions-support-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-admissions-support-section-bg-image,none)!important;background-position:var(--dexta-academy-2-admissions-support-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-admissions-support-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="admissions"] #portal .info-card__icon{color:var(--dexta-academy-2-admissions-support-icon-color,#091624)!important;background-color:color-mix(in srgb,var(--dexta-academy-2-admissions-support-icon-bg-color,#ffc433) var(--dexta-academy-2-admissions-support-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-admissions-support-item-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-2-admissions-support-icon-border-width,0px) solid var(--dexta-academy-2-admissions-support-icon-border-color,#ffc433)!important;}',
      'body[data-page="admissions"] #portal .info-card__icon svg{opacity:var(--dexta-academy-2-admissions-support-item-icon-opacity,1)!important;}',
      'body[data-page="admissions"] main>section:nth-of-type(4){background-color:color-mix(in srgb,var(--dexta-academy-2-admissions-cta-section-bg-color,#fff) var(--dexta-academy-2-admissions-cta-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-admissions-cta-section-bg-image,none)!important;background-position:var(--dexta-academy-2-admissions-cta-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-admissions-cta-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="admissions"] .cta-banner__panel .button{background:color-mix(in srgb,var(--dexta-academy-2-admissions-cta-button-bg-color,#ffc433) var(--dexta-academy-2-admissions-cta-button-bg-opacity,100%),transparent)!important;color:var(--dexta-academy-2-admissions-cta-button-text-color,#0c1d2d)!important;border:var(--dexta-academy-2-admissions-cta-button-border-width,0px) solid var(--dexta-academy-2-admissions-cta-button-border-color,#ffc433)!important;}',
      'body[data-page="admissions"] .cta-banner__icon{color:var(--dexta-academy-2-admissions-cta-icon-color,#091624)!important;background-color:color-mix(in srgb,var(--dexta-academy-2-admissions-cta-icon-bg-color,#ffc433) var(--dexta-academy-2-admissions-cta-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-admissions-cta-item-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-2-admissions-cta-icon-border-width,0px) solid var(--dexta-academy-2-admissions-cta-icon-border-color,#ffc433)!important;}',
      'body[data-page="admissions"] .cta-banner__icon svg{opacity:var(--dexta-academy-2-admissions-cta-item-icon-opacity,1)!important;}',
      '.admission-modal__dialog{background-color:color-mix(in srgb,var(--dexta-academy-2-admissions-form-section-bg-color,#fff) var(--dexta-academy-2-admissions-form-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-admissions-form-section-bg-image,none)!important;background-position:var(--dexta-academy-2-admissions-form-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-admissions-form-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="student-life"] main>section:nth-of-type(2){background-color:color-mix(in srgb,var(--dexta-academy-2-student-life-highlights-section-bg-color,#fff) var(--dexta-academy-2-student-life-highlights-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-student-life-highlights-section-bg-image,none)!important;background-position:var(--dexta-academy-2-student-life-highlights-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-student-life-highlights-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="student-life"] main>section:nth-of-type(2) .info-card__icon{color:var(--dexta-academy-2-student-life-highlights-icon-color,#091624)!important;background-color:color-mix(in srgb,var(--dexta-academy-2-student-life-highlights-icon-bg-color,#ffc433) var(--dexta-academy-2-student-life-highlights-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-student-life-highlights-item-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-2-student-life-highlights-icon-border-width,0px) solid var(--dexta-academy-2-student-life-highlights-icon-border-color,#ffc433)!important;}',
      'body[data-page="student-life"] main>section:nth-of-type(2) .info-card__icon svg{opacity:var(--dexta-academy-2-student-life-highlights-item-icon-opacity,1)!important;}',
      'body[data-page="student-life"] main>section:nth-of-type(3){background-color:color-mix(in srgb,var(--dexta-academy-2-student-life-leadership-section-bg-color,#081827) var(--dexta-academy-2-student-life-leadership-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-student-life-leadership-section-bg-image,none)!important;background-position:var(--dexta-academy-2-student-life-leadership-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-student-life-leadership-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="student-life"] main>section:nth-of-type(3) .feature-list__bullet{color:var(--dexta-academy-2-student-life-leadership-icon-color,#9b7104)!important;background-color:color-mix(in srgb,var(--dexta-academy-2-student-life-leadership-icon-bg-color,#fff4cc) var(--dexta-academy-2-student-life-leadership-icon-bg-opacity,100%),transparent)!important;border:var(--dexta-academy-2-student-life-leadership-icon-border-width,0px) solid var(--dexta-academy-2-student-life-leadership-icon-border-color,#fff4cc)!important;}',
      'body[data-page="student-life"] main>section:nth-of-type(4){background-color:color-mix(in srgb,var(--dexta-academy-2-student-life-portal-events-section-bg-color,#fff) var(--dexta-academy-2-student-life-portal-events-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-student-life-portal-events-section-bg-image,none)!important;background-position:var(--dexta-academy-2-student-life-portal-events-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-student-life-portal-events-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="student-life"] main>section:nth-of-type(4) .info-card__icon{color:var(--dexta-academy-2-student-life-portal-events-icon-color,#091624)!important;background-color:color-mix(in srgb,var(--dexta-academy-2-student-life-portal-events-icon-bg-color,#ffc433) var(--dexta-academy-2-student-life-portal-events-icon-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-student-life-portal-events-item-icon-image,none)!important;background-position:center!important;background-repeat:no-repeat!important;background-size:contain!important;border:var(--dexta-academy-2-student-life-portal-events-icon-border-width,0px) solid var(--dexta-academy-2-student-life-portal-events-icon-border-color,#ffc433)!important;}',
      'body[data-page="student-life"] main>section:nth-of-type(4) .info-card__icon svg{opacity:var(--dexta-academy-2-student-life-portal-events-item-icon-opacity,1)!important;}',
      'body[data-page="contact"] .google-form-card{background-color:color-mix(in srgb,var(--dexta-academy-2-contact-form-section-bg-color,#fff) var(--dexta-academy-2-contact-form-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-contact-form-section-bg-image,none)!important;background-position:var(--dexta-academy-2-contact-form-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-contact-form-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="contact"] .accent-panel{background-color:color-mix(in srgb,var(--dexta-academy-2-contact-details-section-bg-color,#fff4cc) var(--dexta-academy-2-contact-details-section-bg-opacity,100%),transparent)!important;background-image:var(--dexta-academy-2-contact-details-section-bg-image,none)!important;background-position:var(--dexta-academy-2-contact-details-section-bg-position,center center)!important;background-size:var(--dexta-academy-2-contact-details-section-bg-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="contact"] .accent-panel .feature-list__bullet{color:var(--dexta-academy-2-contact-details-icon-color,#9b7104)!important;background-color:color-mix(in srgb,var(--dexta-academy-2-contact-details-icon-bg-color,#fff) var(--dexta-academy-2-contact-details-icon-bg-opacity,100%),transparent)!important;border:var(--dexta-academy-2-contact-details-icon-border-width,0px) solid var(--dexta-academy-2-contact-details-icon-border-color,#ffc433)!important;}',
      '@media (max-width: 980px){body[data-page="home"] .hero-home{background:var(--bg)!important;}body[data-page="home"] .hero-home::before{background-image:var(--dexta-academy-2-hero-mobile-image)!important;background-position:var(--dexta-academy-2-hero-mobile-position,center top)!important;background-size:var(--dexta-academy-2-hero-mobile-size,cover)!important;background-repeat:no-repeat!important;}body[data-page="home"] .hero-home__building{display:none!important;}body[data-page="home"] .hero-home__students{right:0!important;bottom:auto!important;width:var(--dexta-academy-2-hero-students-mobile-width,min(100%,760px))!important;transform:scale(var(--dexta-academy-2-hero-students-mobile-scale,1.12))!important;}body:not([data-page="home"]) .page-hero{background-image:var(--dexta-academy-2-page-hero-mobile-background-image,var(--dexta-academy-2-page-hero-background-image))!important;background-position:var(--dexta-academy-2-page-hero-mobile-background-position,center center)!important;background-size:var(--dexta-academy-2-page-hero-mobile-background-size,cover)!important;background-repeat:no-repeat!important;}body:not([data-page="home"]) .page-hero::before{display:none!important;background-image:none!important;}body[data-page="about"] main>section:nth-of-type(6) .feature-split__media{min-height:420px!important;}body[data-page="about"] main>section:nth-of-type(6) .feature-split__media img{height:100%!important;min-height:420px!important;object-fit:contain!important;}'
    ].join("");
  }

  function getThemeLogoUrl() {
    var logoField = {
      key: "logoUrl",
      label: "Site logo",
      type: "image",
      selector: "img",
      target: "attribute",
      attribute: "src"
    };
    return resolveSchoolTemplateAsset(preview.content.theme.logoUrl, logoField, {
      cloudName: preview.cloudName,
      proxyCloudinaryRawModels: true
    });
  }

	  function getSharedSectionField(sectionId, fieldKey) {
	    var section = preview.content.sharedSections.find(function (item) {
	      return item.id === sectionId;
	    });
	    return section && section.fields ? section.fields[fieldKey] : "";
	  }

	  function hasSharedSectionField(sectionId, fieldKey) {
	    var section = preview.content.sharedSections.find(function (item) {
	      return item.id === sectionId;
	    });
	    return Boolean(
	      section &&
	        section.fields &&
	        Object.prototype.hasOwnProperty.call(section.fields, fieldKey)
	    );
	  }

	  function getPageSectionField(pageSlug, sectionId, fieldKey) {
	    var page = preview.content.pages.find(function (item) {
	      return item.slug === pageSlug;
	    });
	    var section = page && page.sections ? page.sections.find(function (item) {
	      return item.id === sectionId;
	    }) : null;
	    return section && section.fields ? section.fields[fieldKey] : "";
	  }

		  function getTemplateTwoAdmissionFormField(fieldKey) {
		    var pageValue = getPageSectionField("admissions", "admission-form", fieldKey);
		    if (isFilled(pageValue)) return pageValue;
		    return getSharedSectionField("admission-modal", fieldKey);
		  }

		  function setTemplateTwoHtml(selector, value) {
		    document.querySelectorAll(selector).forEach(function (node) {
		      setElementHtml(node, value);
		    });
		  }

		  function getTemplateTwoValuesIntroBody() {
		    var introBody = getPageSectionField("home", "values", "introBody");
		    if (isFilled(introBody)) return introBody;
		    return getPageSectionField("home", "values", "body");
		  }

		  function getTemplateTwoValuesIntroTitle() {
		    var title = getPageSectionField("home", "values", "title");
		    var introTitle = getPageSectionField("home", "values", "introTitle");
		    var introBody = getTemplateTwoValuesIntroBody();
		    if (
		      isFilled(title) &&
		      (!isFilled(introTitle) || toComparableText(introTitle) === toComparableText(introBody))
		    ) {
		      return title;
		    }

		    return introTitle;
		  }

		  function applyTemplateTwoValuesStripIntro() {
		    if (preview.content.templateSlug !== "dexta-academy-2") return;
		    if (preview.pageSlug !== "home") return;

		    var title = getTemplateTwoValuesIntroTitle();
		    var body = getTemplateTwoValuesIntroBody();

		    if (isFilled(title)) {
		      setTemplateTwoHtml(".values-strip__intro h2", title);
		    }

		    if (isFilled(body)) {
		      setTemplateTwoHtml(".values-strip__intro p", body);
		    }
		  }

		  function applyTemplateTwoAdmissionForm() {
		    if (preview.content.templateSlug !== "dexta-academy-2") return;

	    var frame = document.querySelector("[data-admission-modal-root] iframe, .admission-modal iframe");
	    if (!frame) return;

	    var formIframe = getTemplateTwoAdmissionFormField("formIframe");
	    var formUrl = getTemplateTwoAdmissionFormField("formUrl");
	    var formTitle = String(getTemplateTwoAdmissionFormField("formTitle") || "").trim();
	    var modalTitle = String(getTemplateTwoAdmissionFormField("title") || "").trim();
	    var embed = parseIframeEmbedValue(formIframe) || parseIframeEmbedValue(formUrl);

	    if (modalTitle) {
	      setText("#admission-modal-title", modalTitle);
	    }

	    if (embed && embed.src && isSafeIframeSrc(embed.src)) {
	      frame.setAttribute("data-src", embed.src);
	      if (frame.getAttribute("src")) {
	        frame.setAttribute("src", embed.src);
	      }

	      [
	        "width",
	        "height",
	        "frameborder",
	        "marginheight",
	        "marginwidth",
	        "loading",
	        "referrerpolicy",
	        "allow",
	        "title"
	      ].forEach(function (name) {
	        if (embed.attrs[name]) frame.setAttribute(name, embed.attrs[name]);
	      });
	    }

	    if (formTitle) {
	      frame.setAttribute("title", formTitle);
	    }
	  }

	  function applyAdmissionForm() {
	    var configs = {
	      "dexta-academy-1": { pageSlug: "home", sectionId: "admission-modal", selector: ".landing-admissions-modal__body iframe" },
	      "dexta-academy-3": { pageSlug: "contact", sectionId: "admission-modal", selector: ".admission-modal__form iframe" },
	      "dexta-academy-4": { pageSlug: "admissions", sectionId: "application-form-intro", selector: ".admissions-form-frame iframe" },
	      "dexta-academy-5": { pageSlug: "home", sectionId: "admission-modal", selector: ".admission-modal[data-admission-modal] .admission-modal__frame iframe" }
	    };
	    var config = configs[preview.content.templateSlug];
	    if (!config) return;

	    var frame = document.querySelector(config.selector);
	    if (!frame) return;

	    var formIframe = getPageSectionField(config.pageSlug, config.sectionId, "formIframe");
	    var formUrl = getPageSectionField(config.pageSlug, config.sectionId, "formUrl");
	    var formTitle = String(getPageSectionField(config.pageSlug, config.sectionId, "formTitle") || "").trim();
	    var embed = parseIframeEmbedValue(formIframe) || parseIframeEmbedValue(formUrl);

	    if (embed && embed.src && isSafeIframeSrc(embed.src)) {
	      frame.setAttribute("data-src", embed.src);
	      if (frame.getAttribute("src")) {
	        frame.setAttribute("src", embed.src);
	      }

	      ["width", "height", "frameborder", "marginheight", "marginwidth", "loading", "referrerpolicy", "allow", "title"].forEach(function (name) {
	        if (embed.attrs[name]) frame.setAttribute(name, embed.attrs[name]);
	      });
	    }

	    if (formTitle) {
	      frame.setAttribute("title", formTitle);
	    }
	  }

	  function getSharedHeaderLogoUrl() {
	    var value = getSharedSectionField("site-header", "logo");
	    if (!isFilled(value)) return "";
    var logoField = {
      key: "logo",
      label: "Header logo",
      type: "image",
      selector: ".brand__mark",
      target: "attribute",
      attribute: "src"
    };
    return resolveSchoolTemplateAsset(value, logoField, {
      cloudName: preview.cloudName,
      proxyCloudinaryRawModels: true
    });
  }

	  function setImageLogo(selector, logoUrl) {
	    if (!logoUrl) return;
    document.querySelectorAll(selector).forEach(function (image) {
      image.setAttribute("src", logoUrl);
      if (!image.getAttribute("alt")) {
        image.setAttribute("alt", "School logo");
      }
    });
  }

	  function replaceMarkLogo(selector, logoUrl) {
	    document.querySelectorAll(selector).forEach(function (mark) {
	      if (!logoUrl) {
	        mark.classList.remove("dexta-theme-logo-mark");
	        if (preview.content.templateSlug === "dexta-academy-3") {
	          mark.classList.add("dexta-empty-logo-mark");
	          mark.querySelectorAll("img").forEach(function (image) { image.remove(); });
	          mark.setAttribute("hidden", "");
	          mark.style.display = "none";
	        }
	        return;
	      }
	      mark.classList.remove("dexta-empty-logo-mark");
	      mark.removeAttribute("hidden");
	      mark.style.display = "";
	      mark.classList.add("dexta-theme-logo-mark");
	      var image = mark.querySelector("img");
	      if (!image) {
	        mark.textContent = "";
        image = document.createElement("img");
        image.alt = "School logo";
        mark.appendChild(image);
      }
      image.src = logoUrl;
    });
  }

	  function setText(selector, value) {
	    document.querySelectorAll(selector).forEach(function (node) {
	      node.textContent = value;
	    });
	  }

		  function setAttribute(selector, name, value) {
		    document.querySelectorAll(selector).forEach(function (node) {
		      node.setAttribute(name, value);
		    });
		  }

		  function setDisplay(selector, visible) {
		    document.querySelectorAll(selector).forEach(function (node) {
		      node.style.display = visible ? "" : "none";
		    });
		  }

		  function setLink(selector, text, href) {
		    setText(selector, text);
		    setAttribute(selector, "href", href);
		  }

			  function getSharedFieldText(sectionId, fieldKey) {
			    return String(getSharedSectionField(sectionId, fieldKey) || "").trim();
			  }

			  function getSharedFieldTextWithFallback(sectionId, fieldKey, fallback) {
			    if (!hasSharedSectionField(sectionId, fieldKey)) return fallback;
			    var value = getSharedSectionField(sectionId, fieldKey);
			    return value === null || value === undefined ? "" : String(value).trim();
			  }

	      function getThemeFieldText(fieldKey) {
				    return String(preview.content.theme[fieldKey] || "").trim();
				  }

				  function hasThemeField(fieldKey) {
				    return Object.prototype.hasOwnProperty.call(preview.content.theme, fieldKey);
				  }

				  function getTemplateThreeHeaderText(fieldKey, fallback) {
				    return getSharedFieldTextWithFallback("site-header", fieldKey, fallback);
				  }

				  function getTemplateThreeBrandText(themeKey, headerKey, fallback) {
				    if (hasThemeField(themeKey)) {
				      var value = preview.content.theme[themeKey];
				      return value === null || value === undefined ? "" : String(value).trim();
				    }
				    return getTemplateThreeHeaderText(headerKey, fallback);
				  }

			  function getTemplateThreeAnchorHref(fieldKey, anchorId) {
			    var href = getTemplateThreeHeaderText(fieldKey, "index.html#" + anchorId);
			    if (href === "#" + anchorId || href === "index.html#" + anchorId) {
			      return preview.pageSlug === "home" ? "#" + anchorId : "index.html#" + anchorId;
			    }
			    return href;
			  }

				  function setTemplateThreeNavLink(index, text, href, pageKey) {
				    var link = document.querySelectorAll(".site-header .site-nav a")[index];
				    if (!link) return;
				    link.textContent = text;
				    link.setAttribute("href", href);
				    link.style.display = text && href ? "" : "none";
				    applyNavFontFamily(link, preview.content.theme.navLinkFontFamily || preview.content.theme.fontFamily);
				    if (pageKey && pageKey === preview.pageSlug) {
				      link.setAttribute("aria-current", "page");
				    } else {
			      link.removeAttribute("aria-current");
			    }
			  }

			  function applyTemplateThreeHeaderFields() {
			    if (preview.content.templateSlug !== "dexta-academy-3") return;

			    var brandPrimary = getTemplateThreeBrandText("brandName", "brandPrimary", "DXT");
			    var brandSecondary = getTemplateThreeBrandText("brandTagline", "brandSecondary", "Academy");
				    var brandLabel = [brandPrimary, brandSecondary].filter(Boolean).join(" ") || "School";

			    setText(".site-header .brand__name strong", brandPrimary);
			    setText(".site-header .brand__name span", brandSecondary);
			    document.querySelectorAll(".site-header .brand").forEach(function (brand) {
			      brand.setAttribute("aria-label", brandLabel + " home");
			    });

			    setTemplateThreeNavLink(
			      0,
			      getTemplateThreeHeaderText("navHomeText", "Home"),
			      getTemplateThreeHeaderText("navHomeHref", "index.html"),
			      "home"
			    );
			    setTemplateThreeNavLink(
			      1,
			      getTemplateThreeHeaderText("navAboutText", "About"),
			      getTemplateThreeHeaderText("navAboutHref", "about.html"),
			      "about"
			    );
			    setTemplateThreeNavLink(
			      2,
			      getTemplateThreeHeaderText("navProgrammesText", "Programmes"),
			      getTemplateThreeAnchorHref("navProgrammesHref", "programmes")
			    );
			    setTemplateThreeNavLink(
			      3,
			      getTemplateThreeHeaderText("navGalleryText", "Gallery"),
			      getTemplateThreeHeaderText("navGalleryHref", "gallery.html"),
			      "gallery"
			    );
			    setTemplateThreeNavLink(
			      4,
			      getTemplateThreeHeaderText("navApplyText", "How To Apply"),
			      getTemplateThreeAnchorHref("navApplyHref", "how-to-apply")
			    );
			    setTemplateThreeNavLink(
			      5,
			      getTemplateThreeHeaderText("navContactText", "Contact"),
			      getTemplateThreeHeaderText("navContactHref", "contact.html"),
			      "contact"
			    );

				    var portalText = getTemplateThreeHeaderText("portalText", "Portal");
				    var portalHref = getTemplateThreeHeaderText("portalHref", "#");
				    setLink(".site-header .portal-link", portalText, portalHref);
				    setDisplay(".site-header .portal-link", Boolean(portalText && portalHref));
				    document.querySelectorAll(".site-header .portal-link").forEach(function (link) {
				      applyNavFontFamily(link, preview.content.theme.navLinkFontFamily || preview.content.theme.fontFamily);
				    });

				    var rawHeaderCtaHref = hasSharedSectionField("site-header", "headerCtaHref")
				      ? getSharedFieldText("site-header", "headerCtaHref")
				      : "index.html#how-to-apply";
				    var headerCtaHref = getTemplateThreeAnchorHref("headerCtaHref", "how-to-apply");
				    var headerCtaText = getTemplateThreeHeaderText("headerCtaText", "Apply Now");
				    var useAdmissionModal =
				      preview.pageSlug === "contact" &&
				      document.getElementById("admission-modal") &&
				      (rawHeaderCtaHref === "#how-to-apply" ||
				        rawHeaderCtaHref === "index.html#how-to-apply");
	
				    document.querySelectorAll(".site-header .header-actions .button").forEach(function (button) {
				      button.textContent = headerCtaText;
				      button.style.display = headerCtaText && headerCtaHref ? "" : "none";
				      applyNavFontFamily(button, preview.content.theme.navLinkFontFamily || preview.content.theme.fontFamily);
				      if (useAdmissionModal) {
				        button.setAttribute("href", "#admission");
				        button.setAttribute("data-admission-modal-open", "");
			        button.setAttribute("aria-controls", "admission-modal");
			      } else {
			        button.setAttribute("href", headerCtaHref);
			        button.removeAttribute("data-admission-modal-open");
			        button.removeAttribute("aria-controls");
			      }
			    });
			  }

			  function applyTemplateTwoHeaderButtons() {
			    if (preview.content.templateSlug !== "dexta-academy-2") return;

		    var portalVisible =
		      Boolean(getSharedFieldText("site-header", "portalCtaText")) &&
		      Boolean(getSharedFieldText("site-header", "portalCtaHref"));
		    var primaryVisible =
		      Boolean(getSharedFieldText("site-header", "primaryCtaText")) &&
		      Boolean(getSharedFieldText("site-header", "primaryCtaHref"));

		    setText(
		      ".site-header__actions .button--outline-light span:nth-of-type(1), .mobile-panel__actions .button--outline-light span:nth-of-type(1)",
		      getSharedFieldText("site-header", "portalCtaText")
		    );
		    setAttribute(
		      ".site-header__actions .button--outline-light, .mobile-panel__actions .button--outline-light",
		      "href",
		      getSharedFieldText("site-header", "portalCtaHref")
		    );
		    setText(
		      ".site-header__actions .button--primary span:nth-of-type(1), .mobile-panel__actions .button--primary span:nth-of-type(1)",
		      getSharedFieldText("site-header", "primaryCtaText")
		    );
		    setAttribute(
		      ".site-header__actions .button--primary, .mobile-panel__actions .button--primary",
		      "href",
		      getSharedFieldText("site-header", "primaryCtaHref")
		    );
		    setDisplay(
		      ".site-header__actions .button--outline-light, .mobile-panel__actions .button--outline-light",
		      portalVisible
		    );
		    setDisplay(
		      ".site-header__actions .button--primary, .mobile-panel__actions .button--primary",
		      primaryVisible
		    );
		  }

		  function applyTemplateFourPortalButton() {
		    if (preview.content.templateSlug !== "dexta-academy-4") return;

		    var portalText = getSharedFieldText("header", "portalText") || "Portal";
		    var portalHref = getSharedFieldText("header", "portalHref") || "#";
		    var portalVisible = Boolean(getSharedFieldText("header", "portalText")) && Boolean(getSharedFieldText("header", "portalHref"));
		    var applyText = getSharedFieldText("header", "applyText") || "Apply Now";
		    var applyHref = getSharedFieldText("header", "applyHref") || "admissions.html";
		    var applyVisible = Boolean(applyText);

		    // Ensure mobile wrapper exists INSIDE .navbar-collapse (shows in hamburger menu on mobile)
		    var navCollapses = document.querySelectorAll(".hero-header .navbar-collapse");
		    navCollapses.forEach(function (collapse) {
		      var mobileWrapper = collapse.querySelector(".hero-navbar-actions-mobile");
		      if (!mobileWrapper) {
		        mobileWrapper = document.createElement("div");
		        mobileWrapper.className = "hero-navbar-actions-mobile d-lg-none";
		        collapse.appendChild(mobileWrapper);
		      }
		      ensureNavbarButton(mobileWrapper, "hero-portal-btn", portalText, portalHref, portalVisible);
		      ensureNavbarApplyButton(mobileWrapper, applyText, applyHref, applyVisible);
		    });

		    var navs = document.querySelectorAll(".hero-header nav.hero-navbar");
		    navs.forEach(function (nav) {
		      var desktopWrapper = nav.querySelector(".hero-navbar-actions");
		      if (!desktopWrapper) {
		        desktopWrapper = document.createElement("div");
		        desktopWrapper.className = "hero-navbar-actions d-none d-lg-flex";
		        nav.appendChild(desktopWrapper);
		      }
		      ensureNavbarButton(desktopWrapper, "hero-portal-btn", portalText, portalHref, portalVisible);
		      ensureNavbarApplyButton(desktopWrapper, applyText, applyHref, applyVisible);
		    });

		    // Also handle any standalone legacy apply buttons outside wrappers
		    document.querySelectorAll(".hero-header .hero-apply-btn").forEach(function (el) {
		      if (!el.closest(".hero-navbar-actions") && !el.closest(".hero-navbar-actions-mobile")) {
		        el.style.display = "none";
		      }
		    });
		  }

		  function ensureNavbarButton(wrapper, className, text, href, visible) {
		    var btn = wrapper.querySelector("." + className);
		    if (!btn) {
		      btn = document.createElement("a");
		      btn.className = className;
		      var applyBtn = wrapper.querySelector(".hero-apply-btn");
		      if (applyBtn) {
		        wrapper.insertBefore(btn, applyBtn);
		      } else {
		        wrapper.appendChild(btn);
		      }
		    }
		    btn.textContent = text;
		    btn.setAttribute("href", href);
		    btn.style.display = visible ? "" : "none";
		  }

		  function ensureNavbarApplyButton(wrapper, text, href, visible) {
		    var btn = wrapper.querySelector(".hero-apply-btn");
		    if (!btn) {
		      btn = document.createElement("a");
		      btn.className = "hero-apply-btn";
		      wrapper.appendChild(btn);
		    }
		    btn.setAttribute("href", href);
		    btn.style.display = visible ? "" : "none";
		    var textSpan = btn.querySelector(".hero-btn-text");
		    if (!textSpan) {
		      btn.textContent = "";
		      textSpan = document.createElement("span");
		      textSpan.className = "hero-btn-text";
		      btn.appendChild(textSpan);
		      var arrowSpan = document.createElement("span");
		      arrowSpan.className = "icon-long-arrow-right";
		      arrowSpan.setAttribute("aria-hidden", "true");
		      btn.appendChild(arrowSpan);
		    }
		    textSpan.textContent = text;
		  }

		  function initGalleryLightbox() {
		    if (preview.content.templateSlug !== "dexta-academy-4") return;
		    var overlay = document.getElementById("dexta-lightbox-overlay");
		    if (!overlay) {
		      var style = document.createElement("style");
		      style.textContent = [
		        "#dexta-lightbox-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.92);display:none;align-items:center;justify-content:center;cursor:zoom-out;}",
		        "#dexta-lightbox-overlay.active{display:flex;}",
		        "#dexta-lightbox-img{display:block!important;visibility:visible!important;opacity:1!important;max-width:90vw;max-height:90vh;width:auto;height:auto;object-fit:contain;border-radius:8px;transition:transform 0.2s ease;transform-origin:center center;cursor:grab;}",
		        "#dexta-lightbox-img.zoomed{max-width:none;max-height:none;cursor:move;}",
		        "#dexta-lightbox-close{position:absolute;top:20px;right:20px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);}",
		        "#dexta-lightbox-close:hover{background:rgba(255,255,255,0.3);}",
		      ].join("");
		      document.head.appendChild(style);

		      overlay = document.createElement("div");
		      overlay.id = "dexta-lightbox-overlay";
		      overlay.innerHTML = '<button id="dexta-lightbox-close" aria-label="Close">&times;</button><img id="dexta-lightbox-img" alt="Gallery image" />';
		      document.body.appendChild(overlay);
		    }

		    var img = document.getElementById("dexta-lightbox-img");
		    if (!img) return;
		    var zoomed = false;
		    var panX = 0, panY = 0, startX = 0, startY = 0, dragging = false;

		    function openLightbox(src) {
		      img.src = src;
		      img.style.transform = "";
		      img.classList.remove("zoomed");
		      zoomed = false;
		      panX = 0; panY = 0;
		      overlay.classList.add("active");
		    }

		    function getGalleryCardLightboxSource(card) {
		      var explicitSource = card.getAttribute("data-dexta-lightbox-src");
		      if (explicitSource) return explicitSource;
		      var href = card.getAttribute("href");
		      if (href && /^https?:\\/\\//.test(href)) return href;
		      var bgImage = window.getComputedStyle(card).backgroundImage || card.style.backgroundImage || "";
		      var match = bgImage.match(/url\\(["']?(.*?)["']?\\)/);
		      return match && match[1] ? match[1] : "";
		    }

		    function closeLightbox() {
		      overlay.classList.remove("active");
		      img.src = "";
		    }

		    if (overlay.getAttribute("data-dexta-lightbox-bound") !== "true") {
		      overlay.setAttribute("data-dexta-lightbox-bound", "true");
		      overlay.addEventListener("click", function (e) {
		        if (e.target === overlay) closeLightbox();
		      });
		      document.getElementById("dexta-lightbox-close").addEventListener("click", closeLightbox);

		      img.addEventListener("click", function (e) {
		        e.stopPropagation();
		        zoomed = !zoomed;
		        if (zoomed) {
		          img.classList.add("zoomed");
		          img.style.transform = "scale(2)";
		          panX = 0; panY = 0;
		        } else {
		          img.classList.remove("zoomed");
		          img.style.transform = "";
		          panX = 0; panY = 0;
		        }
		      });

		      img.addEventListener("mousedown", function (e) {
		        if (!zoomed) return;
		        dragging = true;
		        startX = e.clientX - panX;
		        startY = e.clientY - panY;
		        img.style.cursor = "grabbing";
		        e.preventDefault();
		      });

		      document.addEventListener("mousemove", function (e) {
		        if (!dragging) return;
		        panX = e.clientX - startX;
		        panY = e.clientY - startY;
		        img.style.transform = "scale(2) translate(" + (panX / 2) + "px," + (panY / 2) + "px)";
		      });

		      document.addEventListener("mouseup", function () {
		        if (dragging) {
		          dragging = false;
		          img.style.cursor = "grab";
		        }
		      });

		      document.addEventListener("keydown", function (e) {
		        if (e.key === "Escape") closeLightbox();
		      });
		    }

		    // Attach click handlers to gallery cards
		    document.querySelectorAll(".gallery-preview-card, .gallery-page-card").forEach(function (card) {
		      card.style.cursor = "pointer";
		      if (card.getAttribute("data-dexta-lightbox-card-bound") === "true") return;
		      card.setAttribute("data-dexta-lightbox-card-bound", "true");
		      card.addEventListener("click", function (e) {
		        e.preventDefault();
		        var source = getGalleryCardLightboxSource(card);
		        if (source) openLightbox(source);
		      });
		    });
		  }

		  function applyTemplateFourHomeGalleryPagination() {
		    if (preview.content.templateSlug !== "dexta-academy-4") return;
		    var section = document.querySelector(".homepage-gallery-preview");
		    if (!section) return;
		    var grid = section.querySelector("[data-gallery-grid]") || section.querySelector(".gallery-preview-grid");
		    if (!grid) return;

		    grid.setAttribute("data-gallery-page-size", "6");
		    grid.querySelectorAll(".gallery-preview-card").forEach(function (card) {
		      card.querySelectorAll(".gallery-preview-label,strong").forEach(function (node) {
		        node.remove();
		      });
		    });

		    var pagination = section.querySelector("[data-gallery-pagination]");
		    if (!pagination) {
		      pagination = document.createElement("nav");
		      pagination.className = "gallery-pagination";
		      pagination.setAttribute("data-gallery-pagination", "");
		      pagination.setAttribute("aria-label", "Gallery preview pagination");
		      pagination.innerHTML = '<button class="gallery-pagination-btn" type="button" data-gallery-page-prev>Previous</button><div class="gallery-pagination-numbers" data-gallery-page-numbers></div><button class="gallery-pagination-btn" type="button" data-gallery-page-next>Next</button><span class="gallery-pagination-status" data-gallery-page-status></span>';
		      var actionBlock = section.querySelector(".text-center.mt-4");
		      if (actionBlock && actionBlock.parentNode) {
		        actionBlock.parentNode.insertBefore(pagination, actionBlock);
		      } else if (grid.parentNode) {
		        grid.parentNode.insertBefore(pagination, grid.nextSibling);
		      }
		    }

		    var cards = Array.prototype.slice.call(grid.querySelectorAll(".gallery-preview-card"));
		    var pageSize = 6;
		    var totalPages = Math.max(1, Math.ceil(cards.length / pageSize));
		    var prevButton = pagination.querySelector("[data-gallery-page-prev]");
		    var nextButton = pagination.querySelector("[data-gallery-page-next]");
		    var numberWrap = pagination.querySelector("[data-gallery-page-numbers]");
		    var status = pagination.querySelector("[data-gallery-page-status]");
		    if (!prevButton || !nextButton || !numberWrap || !status) return;

		    var requestedPage = parseInt(section.getAttribute("data-dexta-gallery-page") || "1", 10) || 1;
		    var currentPage = Math.max(1, Math.min(requestedPage, totalPages));

		    function renderNumberButtons() {
		      numberWrap.innerHTML = "";
		      if (totalPages <= 1) return;
		      for (var page = 1; page <= totalPages; page += 1) {
		        var button = document.createElement("button");
		        button.type = "button";
		        button.className = "gallery-pagination-number";
		        button.textContent = page;
		        button.setAttribute("aria-label", "Show gallery page " + page);
		        button.setAttribute("data-page", page);
		        numberWrap.appendChild(button);
		      }
		    }

		    function showPage(page, shouldScroll) {
		      currentPage = Math.max(1, Math.min(page, totalPages));
		      section.setAttribute("data-dexta-gallery-page", String(currentPage));
		      var start = (currentPage - 1) * pageSize;
		      var end = Math.min(start + pageSize, cards.length);

		      cards.forEach(function (card, index) {
		        var isVisible = totalPages <= 1 || (index >= start && index < end);
		        card.hidden = !isVisible;
		        card.classList.toggle("is-gallery-hidden", !isVisible);
		        if (isVisible) {
		          card.style.removeProperty("display");
		        } else {
		          card.style.setProperty("display", "none", "important");
		        }
		      });

		      pagination.hidden = totalPages <= 1;
		      prevButton.disabled = currentPage === 1;
		      nextButton.disabled = currentPage === totalPages;
		      status.textContent = cards.length ? "Showing " + (start + 1) + "-" + end + " of " + cards.length : "";

		      Array.prototype.forEach.call(numberWrap.children, function (button) {
		        var isCurrent = Number(button.getAttribute("data-page")) === currentPage;
		        button.classList.toggle("is-active", isCurrent);
		        if (isCurrent) button.setAttribute("aria-current", "page");
		        else button.removeAttribute("aria-current");
		      });

		      if (shouldScroll) {
		        grid.scrollIntoView({ behavior: "smooth", block: "start" });
		      }
		    }

		    section.__dextaTemplateFourGalleryShowPage = showPage;
		    renderNumberButtons();
		    showPage(currentPage, false);

		    if (grid.getAttribute("data-dexta-preview-gallery-observed") !== "true") {
		      grid.setAttribute("data-dexta-preview-gallery-observed", "true");
		      var scheduled = false;
		      var observer = new MutationObserver(function () {
		        if (scheduled) return;
		        scheduled = true;
		        window.setTimeout(function () {
		          scheduled = false;
		          applyTemplateFourHomeGalleryPagination();
		          initGalleryLightbox();
		        }, 0);
		      });
		      observer.observe(grid, { childList: true, subtree: true });
		    }

		    if (pagination.getAttribute("data-dexta-preview-gallery-bound") === "true") return;
		    pagination.setAttribute("data-dexta-preview-gallery-bound", "true");
		    prevButton.addEventListener("click", function () {
		      var page = parseInt(section.getAttribute("data-dexta-gallery-page") || "1", 10) || 1;
		      if (typeof section.__dextaTemplateFourGalleryShowPage === "function") {
		        section.__dextaTemplateFourGalleryShowPage(page - 1, true);
		      }
		    });
		    nextButton.addEventListener("click", function () {
		      var page = parseInt(section.getAttribute("data-dexta-gallery-page") || "1", 10) || 1;
		      if (typeof section.__dextaTemplateFourGalleryShowPage === "function") {
		        section.__dextaTemplateFourGalleryShowPage(page + 1, true);
		      }
		    });
		    numberWrap.addEventListener("click", function (event) {
		      var button = event.target && event.target.closest ? event.target.closest("[data-page]") : null;
		      if (!button || typeof section.__dextaTemplateFourGalleryShowPage !== "function") return;
		      section.__dextaTemplateFourGalleryShowPage(Number(button.getAttribute("data-page")), true);
		    });
		  }

		  function applyTemplateTwoFooterVisibility() {
		    if (preview.content.templateSlug !== "dexta-academy-2") return;

		    var footerLinks = [
		      ["homeLinkText", "homeLinkHref", ".footer__links a:nth-of-type(1)"],
		      ["aboutLinkText", "aboutLinkHref", ".footer__links a:nth-of-type(2)"],
		      ["academicsLinkText", "academicsLinkHref", ".footer__links a:nth-of-type(3)"],
		      ["admissionsLinkText", "admissionsLinkHref", ".footer__links a:nth-of-type(4)"],
		      ["studentLifeLinkText", "studentLifeLinkHref", ".footer__links a:nth-of-type(5)"],
		      ["galleryLinkText", "galleryLinkHref", ".footer__links a:nth-of-type(6)"],
		      ["contactLinkText", "contactLinkHref", ".footer__links a:nth-of-type(7)"]
		    ];
		    var hasVisibleFooterLink = false;

		    footerLinks.forEach(function (item) {
		      var text = getSharedFieldText("site-footer", item[0]);
		      var href = getSharedFieldText("site-footer", item[1]);
		      var visible =
		        Boolean(text) &&
		        Boolean(href);
		      if (visible) hasVisibleFooterLink = true;
		      setLink(item[2], text, href);
		      setDisplay(item[2], visible);
		    });

		    var hasAddress = Boolean(getSharedFieldText("site-footer", "address"));
		    var hasPhone =
		      Boolean(getSharedFieldText("site-footer", "phone")) &&
		      Boolean(getSharedFieldText("site-footer", "phoneHref"));
		    var hasEmail =
		      Boolean(getSharedFieldText("site-footer", "email")) &&
		      Boolean(getSharedFieldText("site-footer", "emailHref"));

		    setDisplay(".footer__links", hasVisibleFooterLink);
		    setText(".footer__main > p", getSharedFieldText("site-footer", "description"));
		    setText(".footer__contact > span", getSharedFieldText("site-footer", "address"));
		    setText(".footer__contact a:nth-of-type(1)", getSharedFieldText("site-footer", "phone"));
		    setAttribute(".footer__contact a:nth-of-type(1)", "href", getSharedFieldText("site-footer", "phoneHref"));
		    setText(".footer__contact a:nth-of-type(2)", getSharedFieldText("site-footer", "email"));
		    setAttribute(".footer__contact a:nth-of-type(2)", "href", getSharedFieldText("site-footer", "emailHref"));
		    setText(".footer__bottom > p", getSharedFieldText("site-footer", "copyright"));
		    setDisplay(".footer__main > p", Boolean(getSharedFieldText("site-footer", "description")));
		    setDisplay(".footer__contact > span", hasAddress);
		    setDisplay(".footer__contact a:nth-of-type(1)", hasPhone);
		    setDisplay(".footer__contact a:nth-of-type(2)", hasEmail);
		    setDisplay(".footer__contact", hasAddress || hasPhone || hasEmail);
		    setDisplay(".footer__bottom > p", Boolean(getSharedFieldText("site-footer", "copyright")));
		  }

		  function ensureChild(parent, selector, tagName, className, beforeSelector) {
		    var node = parent.querySelector(selector);
		    if (node) return node;
		    node = document.createElement(tagName);
		    if (className) node.className = className;
		    var beforeNode = beforeSelector ? parent.querySelector(beforeSelector) : null;
		    if (beforeNode) {
		      parent.insertBefore(node, beforeNode);
		    } else {
		      parent.appendChild(node);
		    }
		    return node;
		  }

		  function applyLoadingIdentity(logoUrl, fullLoaderName) {
		    var configuredLoadingText = String(preview.content.theme.loadingText || "").trim();
		    var loadingText = configuredLoadingText || (fullLoaderName ? "Loading " + fullLoaderName : "");
		    var hasLoadingText = Boolean(loadingText);

		    setText(".site-loader__text", loadingText);
		    setText("#spinner .sr-only", loadingText);
		    setText(".dexta-generated-loader__text", loadingText);
		    setDisplay(".site-loader__text", hasLoadingText);
		    setDisplay(".dexta-generated-loader__text", hasLoadingText);

		    document.querySelectorAll("#spinner").forEach(function (spinner) {
		      if (logoUrl) {
		        var logo = ensureChild(spinner, ".dexta-loading-logo", "span", "dexta-loading-logo", ".spinner-border");
		        var image = ensureChild(logo, "img", "img", "");
		        image.alt = "School logo";
		        image.src = logoUrl;
		      }

		      if (hasLoadingText) {
		        var textNode = ensureChild(spinner, ".dexta-loading-text", "span", "dexta-loading-text");
		        textNode.textContent = loadingText;
		      }
		    });

			    document.querySelectorAll(".page-loader__inner").forEach(function (inner) {
			      if (!hasLoadingText) return;
			      var copy = ensureChild(inner, ".page-loader__copy", "p", "page-loader__copy", ".page-loader__track");
			      copy.textContent = loadingText;
			    });

		    document.querySelectorAll(".site-preloader-content").forEach(function (content) {
		      if (!hasLoadingText) return;
		      var status = ensureChild(content, "[data-dexta-loading-text]", "span", "", ".site-preloader-ring");
		      status.setAttribute("data-dexta-loading-text", "true");
		      status.textContent = loadingText;
		    });
		  }

		  function applyThemeIdentity() {
			    var logoUrl = getThemeLogoUrl() || getSharedHeaderLogoUrl();
			    var headerBrandName = String(getSharedSectionField("site-header", "brandName") || "").trim();
			    var headerBrandTagline = String(getSharedSectionField("site-header", "brandTagline") || "").trim();
			    var brandName = String(preview.content.theme.brandName || "").trim() || headerBrandName;
			    var brandTagline = String(preview.content.theme.brandTagline || "").trim() || headerBrandTagline;
		    var showText = Boolean(preview.content.theme.brandTextVisible);
		    var fullLoaderName = [brandName, brandTagline].filter(Boolean).join(" ");
		    var isTemplateTwo = preview.content.templateSlug === "dexta-academy-2";
		    var templateTwoDefaultText =
		      isTemplateTwo &&
		      (brandName === "DXT Academy" || brandName === "DXT ACADEMY") &&
		      brandTagline === "Nurturing. Inspiring. Leading.";

		    setImageLogo(".navbar-brand img, .hero-brand img, .school-footer-brand-logo, .site-preloader-logo, .contact-footer__brand img", logoUrl);
			    replaceMarkLogo(
			      ".brand__mark, .brand__crest, .site-loader__mark, .page-loader__crest",
			      logoUrl
			    );

				    setDisplay(".brand__name, .brand__copy, .brand__text, .contact-brand > span", showText);
				    setDisplay(".brand__name span, .brand__copy span, .brand__text span, .contact-brand small", showText && Boolean(brandTagline));
				    if (isTemplateTwo) {
				      setDisplay(".site-loader__name", showText);
				    }

				    if (!templateTwoDefaultText) {
				      var footerSchoolName = getSharedSectionField("footer", "schoolName");
				      var brandNameSelector = ".brand__name strong, .brand__copy strong, .brand__text strong, .contact-brand strong";
				      if (!isFilled(footerSchoolName)) brandNameSelector += ", .school-footer-brand h3";
				      setText(brandNameSelector, brandName);
				      setText(".brand__name span, .brand__copy span, .brand__text span, .contact-brand small", brandTagline);
				    }
				    if (isTemplateTwo && brandName) {
				      setText(".site-loader__name", brandName);
				    }
				    applyLoadingIdentity(logoUrl, fullLoaderName);

				    document.querySelectorAll(".brand, .contact-brand, .hero-brand").forEach(function (brand) {
				      var label = fullLoaderName || brandName || "School";
				      brand.setAttribute("aria-label", label + " home");
				    });

				    if (brandName || preview.content.theme.documentTitle) {
				      var currentTitlePage = preview.content.pages.find(function (item) { return item.slug === preview.pageSlug; });
				      var websiteTitle = String(preview.content.theme.documentTitle || "").trim() || brandName;
				      var pageTitle = currentTitlePage ? String(currentTitlePage.title || currentTitlePage.slug || "").trim() : "";
				      var isHomeTitle = currentTitlePage && (currentTitlePage.isHome || currentTitlePage.slug === "home");
				      document.title = pageTitle && !isHomeTitle ? websiteTitle + " | " + pageTitle : websiteTitle;
				    }

				    if (logoUrl) {
				      var iconLinks = document.querySelectorAll("link[rel~='icon']");
				      if (!iconLinks.length) {
				        var iconLink = document.createElement("link");
				        iconLink.setAttribute("rel", "icon");
				        document.head.appendChild(iconLink);
				        iconLinks = document.querySelectorAll("link[rel~='icon']");
				      }
				      iconLinks.forEach(function (link) {
				        link.setAttribute("href", logoUrl);
				      });
				    }
	  }

	  function getTemplateOneVideoEmbed(value) {
	    var raw = String(value || "").trim();
	    if (!raw || !/^https?:\\/\\//i.test(raw)) return null;
	    try {
	      var url = new URL(raw);
	      var host = url.hostname.replace(/^www\\./, "").toLowerCase();
	      var videoMatch = url.pathname.match(/\\.(mp4|webm|ogg)(?:$|\\?)/i);
	      if (videoMatch) return { type: "video", src: url.href };
	      if (host === "youtu.be") {
	        var shortId = url.pathname.split("/").filter(Boolean)[0];
	        if (shortId) return { type: "iframe", src: "https://www.youtube.com/embed/" + shortId + "?autoplay=1" };
	      }
	      if (host === "youtube.com" || host === "m.youtube.com") {
	        var watchId = url.searchParams.get("v");
	        var parts = url.pathname.split("/").filter(Boolean);
	        var embedId = watchId || ((parts[0] === "shorts" || parts[0] === "embed") ? parts[1] : "");
	        if (embedId) return { type: "iframe", src: "https://www.youtube.com/embed/" + embedId + "?autoplay=1" };
	      }
	      if (host === "vimeo.com" || host === "player.vimeo.com") {
	        var vimeoParts = url.pathname.split("/").filter(Boolean);
	        var vimeoId = vimeoParts[vimeoParts.length - 1];
	        if (/^\\d+$/.test(vimeoId)) return { type: "iframe", src: "https://player.vimeo.com/video/" + vimeoId + "?autoplay=1" };
	      }
	      return { type: "iframe", src: url.href };
	    } catch (error) {
	      return null;
	    }
	  }

	  function ensureTemplateOneVideoModal() {
	    var modal = document.getElementById("dexta-template1-video-modal");
	    if (modal) return modal;
	    var style = document.createElement("style");
	    style.setAttribute("data-dexta-template1-video-modal", "true");
	    style.textContent = ".dexta-template1-video-modal{position:fixed;inset:0;z-index:100000;display:none;place-items:center;padding:24px;background:rgba(3,7,18,.72);backdrop-filter:blur(10px)}.dexta-template1-video-modal.is-open{display:grid}.dexta-template1-video-modal__dialog{position:relative;width:min(960px,92vw);overflow:hidden;border-radius:22px;background:#070b12;box-shadow:0 28px 90px rgba(0,0,0,.48);border:1px solid rgba(255,255,255,.16)}.dexta-template1-video-modal__frame{aspect-ratio:16/9;background:#000}.dexta-template1-video-modal__frame iframe,.dexta-template1-video-modal__frame video{display:block;width:100%;height:100%;border:0}.dexta-template1-video-modal__close{position:absolute;top:12px;right:12px;z-index:2;width:42px;height:42px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(15,23,42,.82);color:#fff;font-size:28px;line-height:1;display:grid;place-items:center;cursor:pointer}.testimonials-page__video-card[data-video-url]{cursor:pointer}.testimonials-page__video-card[data-video-url]:focus{outline:3px solid rgba(249,115,22,.55);outline-offset:4px}";
	    document.head.appendChild(style);
	    modal = document.createElement("div");
	    modal.id = "dexta-template1-video-modal";
	    modal.className = "dexta-template1-video-modal";
	    modal.setAttribute("aria-hidden", "true");
	    modal.innerHTML = '<div class="dexta-template1-video-modal__dialog" role="dialog" aria-modal="true" aria-label="Featured success story video"><button class="dexta-template1-video-modal__close" type="button" aria-label="Close video">&times;</button><div class="dexta-template1-video-modal__frame"></div></div>';
	    document.body.appendChild(modal);
	    modal.addEventListener("click", function (event) {
	      if (event.target === modal || event.target.classList.contains("dexta-template1-video-modal__close")) {
	        closeTemplateOneVideoModal();
	      }
	    });
	    document.addEventListener("keydown", function (event) {
	      if (event.key === "Escape" && modal.classList.contains("is-open")) closeTemplateOneVideoModal();
	    });
	    return modal;
	  }

	  function closeTemplateOneVideoModal() {
	    var modal = document.getElementById("dexta-template1-video-modal");
	    if (!modal) return;
	    modal.classList.remove("is-open");
	    modal.setAttribute("aria-hidden", "true");
	    var frame = modal.querySelector(".dexta-template1-video-modal__frame");
	    if (frame) frame.innerHTML = "";
	  }

	  function openTemplateOneVideoModal(value) {
	    var media = getTemplateOneVideoEmbed(value);
	    if (!media) return;
	    var modal = ensureTemplateOneVideoModal();
	    var frame = modal.querySelector(".dexta-template1-video-modal__frame");
	    if (!frame) return;
	    if (media.type === "video") {
	      frame.innerHTML = '<video src="' + media.src.replace(/"/g, "&quot;") + '" controls autoplay playsinline></video>';
	    } else {
	      frame.innerHTML = '<iframe src="' + media.src.replace(/"/g, "&quot;") + '" title="Featured success story video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
	    }
	    modal.classList.add("is-open");
	    modal.setAttribute("aria-hidden", "false");
	    var closeButton = modal.querySelector(".dexta-template1-video-modal__close");
	    if (closeButton) closeButton.focus();
	  }

	  function applyTemplateOneSuccessStoryVideo() {
	    if (preview.content.templateSlug !== "dexta-academy-1") return;
	    document.querySelectorAll(".testimonials-page__video-card").forEach(function (card) {
	      var videoUrl = String(card.getAttribute("data-video-url") || "").trim();
	      if (!videoUrl) return;
	      card.setAttribute("role", "button");
	      card.setAttribute("tabindex", "0");
	      if (card.getAttribute("data-dexta-video-bound") === "true") return;
	      card.setAttribute("data-dexta-video-bound", "true");
	      card.addEventListener("click", function () {
	        openTemplateOneVideoModal(card.getAttribute("data-video-url"));
	      });
	      card.addEventListener("keydown", function (event) {
	        if (event.key === "Enter" || event.key === " ") {
	          event.preventDefault();
	          openTemplateOneVideoModal(card.getAttribute("data-video-url"));
	        }
	      });
	    });
	  }

	  function applyTemplateOneLandingGalleryPagination() {
	    if (preview.content.templateSlug !== "dexta-academy-1") return;
	    var section = document.querySelector(".landing-section--gallery");
	    if (!section) return;
	    var grid = section.querySelector(".landing-gallery");
	    if (!grid) return;

	    function closeTemplateOneGalleryModal(modalElement) {
	      modalElement.classList.remove("show");
	      modalElement.style.display = "none";
	      modalElement.setAttribute("aria-hidden", "true");
	      modalElement.removeAttribute("aria-modal");
	      modalElement.removeAttribute("role");
	      document.body.classList.remove("modal-open");
	      document.body.style.removeProperty("overflow");
	      document.body.style.removeProperty("padding-right");
	      var fallbackBackdrop = document.getElementById("dexta-template1-gallery-backdrop");
	      if (fallbackBackdrop && fallbackBackdrop.parentNode) {
	        fallbackBackdrop.parentNode.removeChild(fallbackBackdrop);
	      }
	    }

	    function openTemplateOneGalleryModal(modalElement) {
	      if (window.bootstrap && window.bootstrap.Modal) {
	        try {
	          window.bootstrap.Modal.getOrCreateInstance(modalElement).show();
	        } catch (_error) {}
	      }

	      modalElement.classList.add("show");
	      modalElement.style.display = "block";
	      modalElement.removeAttribute("aria-hidden");
	      modalElement.setAttribute("aria-modal", "true");
	      modalElement.setAttribute("role", "dialog");
	      document.body.classList.add("modal-open");
	      document.body.style.overflow = "hidden";

	      if (
	        !document.querySelector(".modal-backdrop.show") &&
	        !document.getElementById("dexta-template1-gallery-backdrop")
	      ) {
	        var fallbackBackdrop = document.createElement("div");
	        fallbackBackdrop.id = "dexta-template1-gallery-backdrop";
	        fallbackBackdrop.className = "modal-backdrop fade show";
	        document.body.appendChild(fallbackBackdrop);
	      }

	      if (modalElement.getAttribute("data-dexta-fallback-modal-bound") !== "true") {
	        modalElement.setAttribute("data-dexta-fallback-modal-bound", "true");
	        modalElement.addEventListener("click", function (event) {
	          var closeButton = event.target && event.target.closest ? event.target.closest('[data-bs-dismiss="modal"], .landing-gallery-modal__close') : null;
	          if (event.target === modalElement || closeButton) {
	            event.preventDefault();
	            closeTemplateOneGalleryModal(modalElement);
	          }
	        });
	        document.addEventListener("keydown", function (event) {
	          if (event.key === "Escape" && modalElement.classList.contains("show")) {
	            closeTemplateOneGalleryModal(modalElement);
	          }
	        });
	      }
	    }

	    var items = Array.prototype.slice.call(grid.querySelectorAll(".landing-gallery__item"));
	    if (!items.length) return;
	    var currentPreviewPage = preview.content.pages.find(function (item) {
	      return item.slug === preview.pageSlug;
	    });
	    var gallerySectionContent = currentPreviewPage && currentPreviewPage.sections
	      ? currentPreviewPage.sections.find(function (item) { return item.id === "gallery"; })
	      : null;
	    var galleryPayloadItems =
	      gallerySectionContent &&
	      gallerySectionContent.repeatable &&
	      Array.isArray(gallerySectionContent.repeatable.items)
	        ? gallerySectionContent.repeatable.items
	        : [];
	    var galleryImageField = {
	      key: "image",
	      label: "Gallery image",
	      type: "image",
	      selector: ".landing-gallery__trigger img",
	      target: "attribute",
	      attribute: "src"
	    };
	    var pageSize = 6;
	    var totalPages = Math.max(1, Math.ceil(items.length / pageSize));
	    var pagination = section.querySelector(".landing-gallery__pagination");
	    if (!pagination) {
	      pagination = document.createElement("div");
	      pagination.className = "landing-gallery__pagination";
	      pagination.setAttribute("aria-label", "Gallery pagination");
	      grid.parentNode.insertBefore(pagination, grid.nextSibling);
	    }

	    function getTemplateOneGalleryImageSource(image, index) {
	      var payloadImage =
	        galleryPayloadItems[index] && galleryPayloadItems[index].image
	          ? galleryPayloadItems[index].image
	          : "";
	      var resolvedPayloadImage = payloadImage
	        ? resolveAsset(payloadImage, galleryImageField)
	        : "";
	      return (
	        resolvedPayloadImage ||
	        image.getAttribute("data-original-src") ||
	        image.currentSrc ||
	        image.src ||
	        ""
	      );
	    }

	    function restoreTemplateOneGalleryItemImage(item, index) {
	      var image = item.querySelector(".landing-gallery__trigger img");
	      if (!image) return;
	      var source = getTemplateOneGalleryImageSource(image, index);
	      if (!source) return;
	      image.src = source;
	      image.setAttribute("data-original-src", source);
	      image.removeAttribute("loading");
	      image.style.removeProperty("display");
	      image.style.setProperty("opacity", "1", "important");
	      image.style.setProperty("visibility", "visible", "important");
	    }

	    items.forEach(function (item, index) {
	      item.style.position = item.style.position || "relative";
	      item.querySelectorAll(".landing-gallery__body").forEach(function (node) {
	        node.remove();
	      });
	      restoreTemplateOneGalleryItemImage(item, index);
	      var trigger = item.querySelector(".landing-gallery__trigger");
	      if (trigger) {
	        trigger.setAttribute("data-gallery-index", String(index));
	        trigger.setAttribute("aria-label", "Open gallery image " + (index + 1));
	        trigger.removeAttribute("data-dexta-preview-gallery-bound");
	        trigger.style.cursor = "pointer";
	        trigger.style.pointerEvents = "auto";
	        var triggerImage = trigger.querySelector("img");
	        if (triggerImage) {
	          triggerImage.style.pointerEvents = "auto";
	        }
	      }
	    });

	    var requestedPage = parseInt(section.getAttribute("data-dexta-gallery-page") || "1", 10) || 1;
	    var currentPage = Math.max(1, Math.min(requestedPage, totalPages));

	    function showPage(page) {
	      currentPage = Math.max(1, Math.min(page, totalPages));
	      section.setAttribute("data-dexta-gallery-page", String(currentPage));
	      grid.classList.add("dexta-template1-gallery-paginated");
	      var start = (currentPage - 1) * pageSize;
	      var end = Math.min(start + pageSize, items.length);
	      items.forEach(function (item, index) {
	        var isVisible = index >= start && index < end;
	        item.hidden = !isVisible;
	        if (isVisible) {
	          restoreTemplateOneGalleryItemImage(item, index);
	          item.style.removeProperty("display");
	          item.style.setProperty("opacity", "1", "important");
	          item.style.setProperty("visibility", "visible", "important");
	        } else {
	          item.style.setProperty("display", "none", "important");
	        }
	      });
	      pagination.hidden = totalPages <= 1;
	      pagination.innerHTML = "";
	      for (var pageIndex = 1; pageIndex <= totalPages; pageIndex += 1) {
	        var button = document.createElement("button");
	        button.type = "button";
	        button.className = "landing-gallery__page" + (pageIndex === currentPage ? " is-active" : "");
	        button.textContent = pageIndex;
	        button.setAttribute("aria-label", "Go to gallery page " + pageIndex);
	        button.setAttribute("data-page", String(pageIndex));
	        pagination.appendChild(button);
	      }
	    }

	    section.__dextaTemplateOneGalleryShowPage = showPage;
	    showPage(currentPage);

	    function handleTemplateOneGalleryClick(event) {
	      var target = event.target;
	      if (!target || !target.closest) return;
	      var item = target.closest(".landing-gallery__item");
	      if (!item || !grid.contains(item) || item.hidden) return;
	      var trigger = target.closest(".landing-gallery__trigger") || item.querySelector(".landing-gallery__trigger");
	      if (!trigger) return;
	      event.preventDefault();
	      event.stopPropagation();
	      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
	      var image = trigger.querySelector("img");
	      var modalImage = document.getElementById("landingGalleryModalImage");
	      var modalElement = document.getElementById("landingGalleryModal");
	      if (!image || !modalImage || !modalElement) return;
	      modalImage.src =
	        getTemplateOneGalleryImageSource(image, Number(trigger.getAttribute("data-gallery-index") || "0")) ||
	        image.currentSrc ||
	        image.src;
	      modalImage.alt = image.alt || "Gallery image";
	      openTemplateOneGalleryModal(modalElement);
	    }

	    if (grid.getAttribute("data-dexta-preview-gallery-delegated") !== "true") {
	      grid.setAttribute("data-dexta-preview-gallery-delegated", "true");
	      grid.addEventListener("click", handleTemplateOneGalleryClick, true);
	      grid.addEventListener("keydown", function (event) {
	        if (event.key !== "Enter" && event.key !== " ") return;
	        var target = event.target;
	        if (!target || !target.closest || !target.closest(".landing-gallery__trigger")) return;
	        event.preventDefault();
	        handleTemplateOneGalleryClick(event);
	      });
	    }

	    if (pagination.getAttribute("data-dexta-preview-gallery-bound") !== "true") {
	      pagination.setAttribute("data-dexta-preview-gallery-bound", "true");
	      pagination.addEventListener("click", function (event) {
	        var button = event.target && event.target.closest ? event.target.closest("[data-page]") : null;
	        if (!button || typeof section.__dextaTemplateOneGalleryShowPage !== "function") return;
	        section.__dextaTemplateOneGalleryShowPage(Number(button.getAttribute("data-page")));
	      });
	    }

	    if (grid.getAttribute("data-dexta-preview-gallery-observed") !== "true") {
	      grid.setAttribute("data-dexta-preview-gallery-observed", "true");
	      var scheduled = false;
	      var observer = new MutationObserver(function () {
	        if (scheduled) return;
	        scheduled = true;
	        window.setTimeout(function () {
	          scheduled = false;
	          applyTemplateOneLandingGalleryPagination();
	        }, 0);
	      });
	      observer.observe(grid, { childList: true, subtree: true });
	    }
	  }

	  function applyTemplateOneFamilyNotesPagination() {
	    if (preview.content.templateSlug !== "dexta-academy-1") return;
	    var section = document.querySelector(".testimonials-page__section--wall");
	    if (!section) return;
	    var grid = section.querySelector(".testimonials-page__wall");
	    if (!grid) return;
	    var allCards = Array.prototype.slice.call(grid.querySelectorAll(".testimonials-page__wall-card"));
	    var cards = allCards.filter(function (card) {
	      return card.getAttribute("data-dexta-repeatable-hidden") !== "true";
	    });

	    var pageSize = 6;
	    var totalPages = Math.max(1, Math.ceil(cards.length / pageSize));
	    var pagination = section.querySelector("[data-family-notes-pagination]");
	    if (!pagination) {
	      pagination = document.createElement("nav");
	      pagination.className = "testimonials-page__pagination";
	      pagination.setAttribute("data-family-notes-pagination", "");
	      pagination.setAttribute("aria-label", "Family notes pagination");
	      grid.parentNode.insertBefore(pagination, grid.nextSibling);
	    }

	    if (!cards.length) {
	      allCards.forEach(function (card) {
	        card.hidden = true;
	        card.style.setProperty("display", "none", "important");
	      });
	      pagination.hidden = true;
	      pagination.innerHTML = "";
	      return;
	    }

	    var requestedPage = parseInt(section.getAttribute("data-dexta-family-notes-page") || "1", 10) || 1;
	    var currentPage = Math.max(1, Math.min(requestedPage, totalPages));

	    function showPage(page) {
	      currentPage = Math.max(1, Math.min(page, totalPages));
	      section.setAttribute("data-dexta-family-notes-page", String(currentPage));
	      grid.classList.add("dexta-template1-wall-paginated");
	      var start = (currentPage - 1) * pageSize;
	      var end = Math.min(start + pageSize, cards.length);
	      allCards.forEach(function (card) {
	        if (cards.indexOf(card) === -1) {
	          card.hidden = true;
	          card.style.setProperty("display", "none", "important");
	        }
	      });
	      cards.forEach(function (card, index) {
	        var isVisible = index >= start && index < end;
	        card.hidden = !isVisible;
	        if (isVisible) {
	          card.style.removeProperty("display");
	        } else {
	          card.style.setProperty("display", "none", "important");
	        }
	      });
	      pagination.hidden = totalPages <= 1;
	      pagination.innerHTML = "";
	      for (var pageIndex = 1; pageIndex <= totalPages; pageIndex += 1) {
	        var button = document.createElement("button");
	        button.type = "button";
	        button.className = "testimonials-page__pagination-button" + (pageIndex === currentPage ? " is-active" : "");
	        button.textContent = pageIndex;
	        button.setAttribute("aria-label", "Show family notes page " + pageIndex);
	        button.setAttribute("data-page", String(pageIndex));
	        if (pageIndex === currentPage) button.setAttribute("aria-current", "page");
	        pagination.appendChild(button);
	      }
	    }

	    section.__dextaTemplateOneFamilyNotesShowPage = showPage;
	    showPage(currentPage);

	    if (pagination.getAttribute("data-dexta-preview-family-notes-bound") !== "true") {
	      pagination.setAttribute("data-dexta-preview-family-notes-bound", "true");
	      pagination.addEventListener("click", function (event) {
	        var button = event.target && event.target.closest ? event.target.closest("[data-page]") : null;
	        if (!button || typeof section.__dextaTemplateOneFamilyNotesShowPage !== "function") return;
	        section.__dextaTemplateOneFamilyNotesShowPage(Number(button.getAttribute("data-page")));
	      });
	    }

	    if (grid.getAttribute("data-dexta-preview-family-notes-observed") !== "true") {
	      grid.setAttribute("data-dexta-preview-family-notes-observed", "true");
	      var scheduled = false;
	      var observer = new MutationObserver(function () {
	        if (scheduled) return;
	        scheduled = true;
	        window.setTimeout(function () {
	          scheduled = false;
	          applyTemplateOneFamilyNotesPagination();
	        }, 0);
	      });
	      observer.observe(grid, { childList: true, subtree: true });
	    }
	  }

  function applyPreviewContent() {
    var page = preview.content.pages.find(function (item) { return item.slug === preview.pageSlug; });
    var pageSnapshot = preview.sourceSnapshot.pages.find(function (item) { return item.slug === preview.pageSlug; });
    if (!page || !pageSnapshot) return;

    // Remove is-preloading so homepage navbar is visible (template 4)
    document.body.className = document.body.className.replace(/\\bis-preloading\\b/g, "").trim();

    injectTheme();
    applyThemeIdentity();
    preview.content.sharedSections.forEach(function (sectionContent) {
      var sectionSnapshot = preview.sourceSnapshot.sharedSections.find(function (item) {
        return item.id === sectionContent.id;
      });
      applySection(sectionContent, sectionSnapshot);
    });

		    page.sections.forEach(function (sectionContent) {
		      var sectionSnapshot = pageSnapshot.sections.find(function (item) {
		        return item.id === sectionContent.id;
		      });
		      applySection(sectionContent, sectionSnapshot);
		    });

			    applyTemplateThreeHeaderFields();
			    applyTemplateTwoValuesStripIntro();
			    applyTemplateTwoHeaderButtons();
			    applyTemplateFourPortalButton();
		    applyTemplateTwoFooterVisibility();
	    applyTemplateTwoAdmissionForm();
		    applyAdmissionForm();
		    applyTemplateOneSuccessStoryVideo();
		    applyTemplateOneLandingGalleryPagination();
		    applyTemplateOneFamilyNotesPagination();
		    rewritePreviewInternalLinks();
	    injectPreviewFontStylesheets();
	    applySectionFontOverrides();
		    refreshTemplateTwoIcons();
		    applyAcademyThreeHeroBackgroundImage();
		    applyTemplateFourHomeGalleryPagination();
		    initGalleryLightbox();

	    // Template 3 home page: only override header bg if school customized it
	    if (preview.content.templateSlug === "dexta-academy-3" && document.body.classList.contains("home-page")) {
	      var headerBgColor = getSharedSectionField("site-header", "sectionBgColor");
	      if (headerBgColor && headerBgColor !== "rgba(255,255,255,0.9)") {
	        var headerEl = document.querySelector(".site-header");
	        if (headerEl) headerEl.style.setProperty("background", headerBgColor, "important");
	      } else {
	        // Reset inline --dexta-academy-3-shared-header-section-bg-color on .site-header so
	        // the original dark gradient from the template CSS is preserved
	        var headerEl = document.querySelector(".site-header");
	        if (headerEl) headerEl.style.removeProperty("--dexta-academy-3-shared-header-section-bg-color");
	      }
	    }

	    document.documentElement.setAttribute("data-dexta-project-preview", "ready");
	  }

	  applyPreviewContent();

	  var previewResponsiveUpdateQueued = false;
	  function queueResponsivePreviewContent() {
	    if (previewResponsiveUpdateQueued) return;
	    previewResponsiveUpdateQueued = true;
	    var schedule =
	      typeof window.requestAnimationFrame === "function"
	        ? window.requestAnimationFrame
	        : function (callback) { return window.setTimeout(callback, 16); };
	    schedule(function () {
	      previewResponsiveUpdateQueued = false;
	      applyPreviewContent();
	    });
	  }

	  function bindResponsivePreviewUpdates() {
	    if (typeof window.matchMedia !== "function") return;
	    [
	      "(min-width: 992px)",
	      "(min-width: 768px) and (max-width: 991.98px)",
	      "(max-width: 767.98px)"
	    ].forEach(function (query) {
	      var mediaQuery = window.matchMedia(query);
	      if (typeof mediaQuery.addEventListener === "function") {
	        mediaQuery.addEventListener("change", queueResponsivePreviewContent);
	      } else if (typeof mediaQuery.addListener === "function") {
	        mediaQuery.addListener(queueResponsivePreviewContent);
	      }
	    });
	    window.addEventListener("orientationchange", queueResponsivePreviewContent, { passive: true });
	  }

	  bindResponsivePreviewUpdates();
	  if (document.readyState === "loading") {
	    document.addEventListener("DOMContentLoaded", applyPreviewContent, { once: true });
	  }

	  // Ensure hamburger toggle works without Bootstrap jQuery plugin
	  document.querySelectorAll(".hero-menu-toggle, .navbar-toggler").forEach(function (btn) {
	    btn.removeAttribute("data-toggle");
	    btn.removeAttribute("data-bs-toggle");
	    var targetSel = btn.getAttribute("data-target") || btn.getAttribute("data-bs-target") || "#hero-nav-links";
	    btn.removeAttribute("data-target");
	    btn.removeAttribute("data-bs-target");
	    btn.addEventListener("click", function (e) {
	      e.preventDefault();
	      e.stopImmediatePropagation();
	      var target = document.querySelector(targetSel);
	      if (target) {
	        target.classList.toggle("show");
	        btn.setAttribute("aria-expanded", target.classList.contains("show") ? "true" : "false");
	      }
	    });
	  });
		  window.setTimeout(applyPreviewContent, 80);
		  window.setTimeout(applyThemeIdentity, 350);
		  window.setTimeout(applyTemplateThreeHeaderFields, 350);
		  window.setTimeout(applyTemplateTwoHeaderButtons, 350);
		  window.setTimeout(applyTemplateFourPortalButton, 350);
	  window.setTimeout(applyTemplateTwoFooterVisibility, 350);
	  window.setTimeout(applyTemplateTwoAdmissionForm, 350);
	  window.setTimeout(applyAdmissionForm, 350);
	  window.setTimeout(applyTemplateOneLandingGalleryPagination, 350);
	  window.setTimeout(applyTemplateOneFamilyNotesPagination, 350);
	  window.setTimeout(rewritePreviewInternalLinks, 350);
	  window.setTimeout(injectPreviewFontStylesheets, 350);
	  window.setTimeout(applySectionFontOverrides, 350);
	  window.setTimeout(refreshTemplateTwoIcons, 350);
		  window.setTimeout(applyTemplateFourHomeGalleryPagination, 350);
		  window.setTimeout(initGalleryLightbox, 350);
		  window.setTimeout(applyThemeIdentity, 1000);
		  window.setTimeout(applyTemplateThreeHeaderFields, 1000);
		  window.setTimeout(applyTemplateTwoHeaderButtons, 1000);
	  window.setTimeout(applyTemplateFourPortalButton, 1000);
	  window.setTimeout(applyTemplateTwoFooterVisibility, 1000);
	  window.setTimeout(applyTemplateTwoAdmissionForm, 1000);
	  window.setTimeout(applyAdmissionForm, 1000);
	  window.setTimeout(applyTemplateOneLandingGalleryPagination, 1000);
	  window.setTimeout(applyTemplateOneFamilyNotesPagination, 1000);
	  window.setTimeout(rewritePreviewInternalLinks, 1000);
	  window.setTimeout(injectPreviewFontStylesheets, 1000);
	  window.setTimeout(applySectionFontOverrides, 1000);
	  window.setTimeout(refreshTemplateTwoIcons, 1000);
	  window.setTimeout(applyTemplateFourHomeGalleryPagination, 1000);
	})();
	</script>`;
}

function getServerSideAnimationFixStyle(
  _content: SchoolTemplateProjectContent,
): string {
  return "";
}

function getServerSideFontOverrideStyle(
  content: SchoolTemplateProjectContent,
): string {
  if (content.templateSlug === "dexta-academy-1") {
    const bodyFont = (content.theme.fontFamily ?? "").trim() || "Manrope";
    const navFont =
      (
        content.theme.navLinkFontFamily ||
        content.theme.fontFamily ||
        ""
      ).trim() || "Manrope";
    return `<style data-dexta-font-override="true">
body,h1,h2,h3,h4,h5,h6,p,li,a,span,label,input,textarea,select,button{font-family:${JSON.stringify(bodyFont)},sans-serif!important;}
.navbar-nav .nav-link,.navbar-nav a,.site-nav a,.site-nav__link,.mobile-nav a,.mobile-nav__link,.site-header__nav a,.site-header__links a,.main-nav a,.site-footer,.site-footer a,.footer__links a,.footer__contact,.footer__bottom{font-family:${JSON.stringify(navFont)},sans-serif!important;}
.landing-section--gallery .landing-gallery:not(.dexta-template1-gallery-paginated) .landing-gallery__item:nth-of-type(n+7){display:none!important;}
.landing-section--gallery .landing-gallery__body{display:none!important;}
.testimonials-page__section--wall .testimonials-page__wall:not(.dexta-template1-wall-paginated) .testimonials-page__wall-card:nth-of-type(n+7){display:none!important;}
.testimonials-page__pagination{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:28px;}
.testimonials-page__pagination[hidden]{display:none!important;}
.testimonials-page__pagination-button{min-width:42px;height:42px;border-radius:999px;border:1px solid rgba(15,23,42,.14);background:#fff;color:#1f2937;font-weight:700;cursor:pointer;}
.testimonials-page__pagination-button.is-active{background:var(--dexta-academy-1-home-gallery-pagination-active-bg-color,#0d6efd);color:var(--dexta-academy-1-home-gallery-pagination-active-text-color,#fff);border-color:transparent;}
</style>`;
  }

  if (content.templateSlug === "dexta-academy-3") {
    const bodyFont = (content.theme.fontFamily ?? "").trim();
    const navFont = (
      content.theme.navLinkFontFamily ||
      content.theme.fontFamily ||
      ""
    ).trim();
    if (!bodyFont && !navFont) return "";
    const effectiveBodyFont = bodyFont || navFont;
    const effectiveNavFont = navFont || bodyFont;
    return `<style data-dexta-font-override="true">
body,.page-shell,.hero,.welcome,.programmes-showcase,.home-apply,.home-gallery,.site-footer,.about-page,.gallery-page,.contact-page,h1,h2,h3,h4,h5,h6,p,li,a,span,label,input,textarea,select,button{font-family:${JSON.stringify(effectiveBodyFont)},"Segoe UI",sans-serif!important;}
.site-nav a,.site-nav__link,.mobile-nav a,.mobile-nav__link,.site-header__nav a,.site-header__links a,.main-nav a,.site-footer,.site-footer a,.footer__links a,.footer__contact,.footer__bottom{font-family:${JSON.stringify(effectiveNavFont)},"Segoe UI",sans-serif!important;}
</style>`;
  }

  if (content.templateSlug === "dexta-academy-4") {
    const bodyFont = (content.theme.fontFamily ?? "").trim() || "Manrope";
    const navFont =
      (
        content.theme.navLinkFontFamily ||
        content.theme.fontFamily ||
        ""
      ).trim() || "Manrope";
    return `<style data-dexta-font-override="true">
body,h1,h2,h3,h4,h5,h6,p,li,a,span,label,input,textarea,select,button{font-family:${JSON.stringify(bodyFont)},"Segoe UI",sans-serif!important;}
.site-nav a,.site-nav__link,.mobile-nav a,.mobile-nav__link,.site-header__nav a,.site-header__links a,.main-nav a,.site-footer,.site-footer a,.footer__links a,.footer__contact,.footer__bottom{font-family:${JSON.stringify(navFont)},"Segoe UI",sans-serif!important;}
</style>`;
  }

  if (content.templateSlug === "dexta-academy-5") {
    const bodyFont = (content.theme.fontFamily ?? "").trim() || "Manrope";
    const navFont =
      (
        content.theme.navLinkFontFamily ||
        content.theme.fontFamily ||
        ""
      ).trim() || "Manrope";
    return `<style data-dexta-font-override="true">
body{font-family:${JSON.stringify(bodyFont)},sans-serif!important;}
.site-nav a,.site-nav__link,.mobile-nav a,.mobile-nav__link,.site-header__nav a,.site-header__links a,.main-nav a,.site-footer,.site-footer a,.footer__links a,.footer__contact,.footer__bottom{font-family:${JSON.stringify(navFont)},sans-serif!important;}
</style>`;
  }

  if (content.templateSlug !== "dexta-academy-2") return "";

  const rawBody = (content.theme.fontFamily ?? "").trim();
  const normalizedBody = rawBody.replace(/["']/g, "").toLowerCase();
  const isLegacyBody =
    !rawBody ||
    normalizedBody.includes("plus jakarta sans") ||
    normalizedBody.includes("manrope");
  const bodyFont = isLegacyBody ? "Montserrat" : rawBody;

  const rawNav = (
    content.theme.navLinkFontFamily ||
    content.theme.fontFamily ||
    ""
  ).trim();
  const normalizedNav = rawNav.replace(/["']/g, "").toLowerCase();
  const isLegacyNav =
    !rawNav ||
    normalizedNav.includes("plus jakarta sans") ||
    normalizedNav.includes("manrope");
  const navFont = isLegacyNav ? "Montserrat" : rawNav;

  const brandHideCss = !content.theme.brandTextVisible
    ? `.brand__name,.brand__copy,.brand__text,.contact-brand>span,.site-loader__name{display:none!important;}`
    : "";

  return `<style data-dexta-font-override="true">
body{font-family:${JSON.stringify(bodyFont)},"Segoe UI",sans-serif!important;}
.site-nav a,.site-nav__link,.mobile-nav a,.mobile-nav__link,.site-header__nav a,.site-header__links a,.main-nav a,.site-footer,.site-footer a,.footer__links a,.footer__contact,.footer__bottom,.button,.site-header .button,.mobile-panel .button,.hero-home__actions .button,.cta-banner .button,.admission-modal .button,.story-modal .button,.card__link{font-family:${JSON.stringify(navFont)},"Segoe UI",sans-serif!important;}
${brandHideCss}
</style>`;
}

function getLogoPreloadMarkup(content: SchoolTemplateProjectContent): string {
  if (!content.theme.logoUrl) return "";
  const logoField = {
    key: "logoUrl",
    label: "Site logo",
    type: "image" as const,
    selector: "img",
    target: "attribute" as const,
    attribute: "src",
  };
  const resolvedUrl = resolveSchoolTemplateAsset(
    content.theme.logoUrl,
    logoField,
    {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
      proxyCloudinaryRawModels: true,
    },
  );
  if (!resolvedUrl) return "";
  const safeUrl = resolvedUrl.replace(/"/g, "&quot;");
  return `<link rel="preload" as="image" href="${safeUrl}">`;
}

function getDextaAcademyOneRepeatableFallbackCss(
  content: SchoolTemplateProjectContent,
  page: SchoolTemplateProjectPageContent,
): string {
  if (content.templateSlug !== "dexta-academy-1") return "";

  const css: string[] = [];
  if (page.slug === "testimonials") {
    const familyNotesCount =
      page.sections.find((section) => section.id === "testimonial-wall")
        ?.repeatable?.items.length ?? 0;

    css.push(
      familyNotesCount <= 0
        ? ".testimonials-page__section--wall .testimonials-page__wall-card{display:none!important;}"
        : `.testimonials-page__section--wall .testimonials-page__wall-card:nth-of-type(n+${
            familyNotesCount + 1
          }){display:none!important;}`,
    );
  }

  return css.length
    ? `<style data-dexta-template1-repeatable-fallback="true">${css.join("")}</style>`
    : "";
}

export async function renderSchoolTemplatePreview({
  content,
  sourceSnapshot,
  pageSlug,
  previewRouteBase,
  previewSearch,
}: RenderSchoolTemplatePreviewInput) {
  const manifest = getSchoolTemplateManifest(content.templateSlug);
  const renderSourceSnapshot = manifest
    ? buildSchoolTemplateSourceSnapshot(manifest)
    : sourceSnapshot;
  const renderContent =
    prepareDextaAcademyThreeContactRenderingContent(content);
  const page = renderContent.pages.find((item) => item.slug === pageSlug);
  const pageSnapshot = renderSourceSnapshot.pages.find(
    (item) => item.slug === pageSlug,
  );

  if (!page || !pageSnapshot) {
    return null;
  }

  const sourcePath = assertSafeTemplatePath(
    renderSourceSnapshot.sourceDir,
    pageSnapshot.fileName,
  );
  let sourceHtml = await readFile(sourcePath, "utf8");
  const previewNavigation =
    previewRouteBase && renderSourceSnapshot.templateSlug === "dexta-academy-3"
      ? {
          routeBase: previewRouteBase,
          search: previewSearch,
          currentPageSlug: pageSlug,
        }
      : undefined;

  if (renderSourceSnapshot.templateSlug === "dexta-academy-3") {
    sourceHtml = renderDextaAcademyThreeNavbarFallback(
      sourceHtml,
      page.slug,
      renderContent,
      previewNavigation,
    );
    sourceHtml = renderDextaAcademyThreeLoaderFallback(
      sourceHtml,
      page.slug,
      renderContent,
    );
  }

  if (
    renderSourceSnapshot.templateSlug === "dexta-academy-1" &&
    page.slug === "home"
  ) {
    sourceHtml = await inlineDextaAcademyOneHeroStreaks(
      sourceHtml,
      renderSourceSnapshot.sourceDir,
    );
  }

  if (renderSourceSnapshot.templateSlug === "dexta-academy-1") {
    sourceHtml = ensureTemplateOneFontAwesomeSix(sourceHtml);
  }

  // Blank template img src values to prevent the browser from pre-fetching
  // default images before the runtime JS applies admin-configured images.
  if (renderSourceSnapshot.templateSlug !== "dexta-academy-3") {
    sourceHtml = sourceHtml.replace(
      /(<img\b[^>]*?\s)src\s*=\s*"(https?:\/\/[^"]*)"/gi,
      '$1src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-original-src="$2"',
    );
  }

  if (renderSourceSnapshot.templateSlug === "dexta-academy-1") {
    sourceHtml = renderDextaAcademyOneLoaderFallback(sourceHtml, renderContent);
  }

  const usesHero3d =
    renderSourceSnapshot.templateSlug === "dexta-academy-4" &&
    pageSnapshot.fileName === "index.html";
  const threeConfig = buildPreviewThreeConfig({
    content: renderContent,
    sourceSnapshot: renderSourceSnapshot,
    page,
  });
  const threeConfigMarkup = hasThreeConfig(threeConfig)
    ? renderThreeConfigMarkup(threeConfig)
    : "";
  const hero3dModuleMarkup = usesHero3d ? getPreviewHero3dModuleMarkup() : "";

  if (usesHero3d) {
    sourceHtml = removeHero3dModuleScript(sourceHtml);
  }

  const baseHref = getTemplateBaseHref(renderSourceSnapshot.previewPath);
  const baseMarkup = `<base href="${baseHref}">`;
  const noIndexMarkup =
    '<meta name="robots" content="noindex,nofollow"><meta name="dexta-preview" content="true">';

  const withDocumentIdentity = applyPreviewDocumentIdentity(
    sourceHtml,
    renderContent,
    page,
  );

  const withHeadMarkup = injectIntoHead(
    withDocumentIdentity,
    `${baseMarkup}\n${noIndexMarkup}\n${getPreviewBootMarkup(renderSourceSnapshot.templateSlug)}`,
  );

  const withFontOverride = injectBeforeHeadClose(
    withHeadMarkup,
    `${getGoogleFontPreloadMarkup(renderContent)}${getServerSideAnimationFixStyle(
      renderContent,
    )}${getServerSideFontOverrideStyle(renderContent)}${getLogoPreloadMarkup(
      renderContent,
    )}${getDextaAcademyOneRepeatableFallbackCss(renderContent, page)}${
      renderSourceSnapshot.templateSlug === "dexta-academy-1"
        ? getDextaAcademyOneStaticLoaderCss(renderContent)
        : ""
    }${
      renderSourceSnapshot.templateSlug === "dexta-academy-3"
        ? getDextaAcademyThreeStaticPreviewCss(renderContent)
        : ""
    }`,
  );

  return injectBeforeBodyClose(
    withFontOverride,
    `${threeConfigMarkup}${getPreviewRuntimeScript({
      content: renderContent,
      sourceSnapshot: renderSourceSnapshot,
      page,
    })}${hero3dModuleMarkup}`,
  );
}
