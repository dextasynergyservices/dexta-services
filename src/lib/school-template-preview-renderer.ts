import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  getSchoolTemplateAssetResolverBrowserScript,
  resolveSchoolTemplateAsset,
} from "@/lib/school-template-assets";
import {
  type SchoolTemplateProjectContent,
  type SchoolTemplateProjectPageContent,
  type SchoolTemplateProjectSectionContent,
  type SchoolTemplateProjectSectionSnapshot,
  type SchoolTemplateSourceSnapshot,
} from "@/lib/school-template-project-content";

type RenderSchoolTemplatePreviewInput = {
  content: SchoolTemplateProjectContent;
  sourceSnapshot: SchoolTemplateSourceSnapshot;
  pageSlug: string;
};

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

function getPreviewBootMarkup() {
  return `<script>document.documentElement.setAttribute("data-dexta-project-preview","loading");window.setTimeout(function(){if(document.documentElement.getAttribute("data-dexta-project-preview")==="loading"){document.documentElement.setAttribute("data-dexta-project-preview","ready");}},2500);</script><style>html[data-dexta-project-preview="loading"] body{opacity:0!important;}html[data-dexta-project-preview="ready"] body{opacity:1!important;transition:opacity .16s ease;}</style>`;
}

function removeHero3dModuleScript(html: string) {
  return html.replace(
    /<script\b(?=[^>]*\btype=["']module["'])(?=[^>]*\bsrc=["']js\/hero-3d\.js["'])[^>]*>\s*<\/script>/i,
    "",
  );
}

function assertSafeTemplatePath(sourceDir: string, fileName: string) {
  const workspaceRoot = process.cwd();
  const publicRoot = path.resolve(workspaceRoot, "public");
  const resolvedPath = path.resolve(workspaceRoot, sourceDir, fileName);

  if (!resolvedPath.startsWith(`${publicRoot}${path.sep}`)) {
    throw new Error("Template source path must stay inside the public folder.");
  }

  return resolvedPath;
}

function getPreviewHero3dModuleMarkup() {
  return '<script type="module" src="js/hero-3d.js?dextaPreview=3d-config-v2" data-dexta-preview-hero-3d="external"></script>';
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

	  function toInlineHtml(value) {
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

	    return parts.join("<br><br>");
	  }

	  function setElementHtml(node, value) {
	    var tagName = String(node.tagName || "").toLowerCase();
	    node.innerHTML = /^(h[1-6]|p)$/.test(tagName) ? toInlineHtml(value) : toText(value);
	  }

  function withUnit(value, unit) {
    if (value === null || value === undefined || value === "") return "";
    var text = String(value);
    if (!unit || /[a-z%]+$/i.test(text)) return text;
    return text + unit;
  }

${getSchoolTemplateAssetResolverBrowserScript()}

  function resolveAsset(value, field) {
    return resolveSchoolTemplateAsset(value, field, {
      cloudName: preview.cloudName,
      proxyCloudinaryRawModels: true
    });
  }
	
	  function getCssVariableValue(value, field) {
	    if (field.type === "image" || field.type === "model3d") {
	      var asset = resolveAsset(value, field).replace(/"/g, "&quot;");
	      return asset ? 'url("' + asset + '")' : "none";
	    }
	    return withUnit(value, field.unit);
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

	    document.querySelectorAll("a[href]").forEach(function (link) {
	      var target = getPreviewNavigationTarget(link.getAttribute("href"));
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

	    if (preview.content.templateSlug === "dexta-academy-2") {
	      addValue("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap");
	    }

	    function scanSection(section) {
	      Object.keys(section.fields || {}).forEach(function (key) {
	        var normalizedKey = key.toLowerCase();
	        if (normalizedKey.indexOf("fontstylesheeturl") >= 0 || normalizedKey.indexOf("googlefonturl") >= 0) {
	          addValue(section.fields[key]);
	        }
	      });
	      if (!section.repeatable || !section.repeatable.items) return;
	      section.repeatable.items.forEach(function (item) {
	        Object.keys(item || {}).forEach(function (key) {
	          var normalizedKey = key.toLowerCase();
	          if (normalizedKey.indexOf("fontstylesheeturl") >= 0 || normalizedKey.indexOf("googlefonturl") >= 0) {
	            addValue(item[key]);
	          }
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
	    if (field.target === "cssVariable" && (field.type === "image" || field.type === "model3d")) return true;
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

		  function applyField(node, field, value) {
		    if (field.target === "threeConfig") {
		      return;
	    }

	    if (field.target === "cssVariable" && field.cssVariable) {
	      var cssValue = getCssVariableValue(value, field);
	      node.style.setProperty(field.cssVariable, cssValue);
      if (field.cssVariable === "--cap-center-x") node.style.left = cssValue;
      if (field.cssVariable === "--cap-center-y") node.style.top = cssValue;
      return;
    }

    if (field.target === "innerHTML") {
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
      var backgroundAsset = resolveAsset(value, field).replace(/"/g, "&quot;");
      node.style.backgroundImage = backgroundAsset ? 'url("' + backgroundAsset + '")' : "none";
      return;
    }

    node.textContent = toText(value);
  }

	  function applySection(sectionContent, sectionSnapshot) {
	    if (!sectionContent || !sectionSnapshot) return;
	    var roots = getSectionRoots(sectionSnapshot);
	    sectionSnapshot.fields.forEach(function (field) {
	      var value = sectionContent.fields ? sectionContent.fields[field.key] : null;
      if (!shouldApplyField(value, field)) return;

      if (field.target === "threeConfig") {
        return;
      }

      roots.forEach(function (root) {
	        queryWithin(root, field.selector).forEach(function (node) {
	          applyField(node, field, value);
	        });
	      });
	    });

	    if (!sectionContent.repeatable || !sectionSnapshot.repeatable) return;
	    var itemContents = sectionContent.repeatable.items || [];
	    if (!itemContents.length) return;

	    roots.forEach(function (root) {
	      queryWithin(root, sectionSnapshot.repeatable.itemSelector).forEach(function (itemRoot, itemIndex) {
	        var itemContent = itemContents[itemIndex];
	        if (!itemContent) return;

	        sectionSnapshot.fields.forEach(function (field) {
	          var value = itemContent[field.key];
	          if (!shouldApplyField(value, field)) return;
	          if (field.target === "threeConfig") return;

	          queryWithin(itemRoot, field.selector).forEach(function (node) {
	            applyField(node, field, value);
	          });
	        });
	      });
	    });
	  }

	  function injectTheme() {
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
	    var primaryDark = mix(primary, 78, "#000");
	    var primarySoft = mix(primary, 16, "#fff");
	    var secondaryDark = mix(secondary, 82, "#000");
	    var secondarySoft = mix(secondary, 80, "#fff");
	    var common =
	      "--dexta-school-primary:" + primary + ";" +
	      "--dexta-school-secondary:" + secondary + ";" +
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
	        "--accent-2:" + secondarySoft + ";";
	    }
	
	    if (preview.content.templateSlug === "dexta-academy-3") {
	      return common +
	        "--navy:" + primary + ";" +
	        "--navy-deep:" + primaryDark + ";" +
	        "--gold:" + secondary + ";" +
	        "--gold-deep:" + secondaryDark + ";";
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
		      return [
		        ".button--navy{background:var(--navy)!important;}",
		        ".button--gold{background:var(--gold)!important;color:var(--navy-deep)!important;}",
		        ".button--gold,.button--outline-light:hover,.programme-card,.programme-tile,.contact-card,.info-card{border-color:var(--gold)!important;}",
		        ".button--navy,.site-header,.footer,.admission-modal__panel{border-color:var(--navy)!important;}",
		        ".programme-card--featured,.timeline__marker,.contact-hero,.about-cta{background:var(--navy)!important;}",
		        ".apply-card__badge,.gallery-filter.is-active{background:var(--gold)!important;border-color:var(--gold)!important;}"
		      ].join("");
		    }
		
		    if (preview.content.templateSlug === "dexta-academy-4") {
		      return [
		        ".btn-primary,.btn.btn-primary,.hero-apply-btn,.hero-primary-btn,.school-homepage .btn.btn-primary,.school-about-page .btn.btn-primary,.school-academics-page .btn.btn-primary,.school-admissions-page .btn.btn-primary,.school-contact-page .btn.btn-primary,.bg-primary{background:" + primary + "!important;border-color:" + primary + "!important;color:#fff!important;}",
		        ".btn-primary:hover,.btn.btn-primary:hover,.hero-apply-btn:hover,.hero-primary-btn:hover,.school-homepage .btn.btn-primary:hover,.school-about-page .btn.btn-primary:hover,.school-academics-page .btn.btn-primary:hover,.school-admissions-page .btn.btn-primary:hover,.school-contact-page .btn.btn-primary:hover,.school-about-page .btn.btn-primary:focus,.school-academics-page .btn.btn-primary:focus,.school-admissions-page .btn.btn-primary:focus,.school-contact-page .btn.btn-primary:focus{background:" + secondary + "!important;border-color:" + secondary + "!important;}",
		        ".btn-outline-primary{border-color:" + primary + "!important;color:" + primary + "!important;}",
		        ".btn-outline-primary:hover{background:" + primary + "!important;color:#fff!important;}",
		        ".text-primary,.school-homepage .section-label,.school-homepage .feature-icon,.heading-section .subheading,.school-about-page a:hover,.school-academics-page a:hover,.school-contact-page a:hover,.ftco-navbar-light .navbar-nav > .nav-item.active > a{color:" + primary + "!important;}",
		        ".bg-secondary{background:" + secondary + "!important;}",
		        ".text-secondary{color:" + secondaryDark + "!important;}",
		        "#ftco-loader .path{stroke:" + primary + "!important;}",
		        ".school-page-hero,.about-page-hero,.academics-page-hero,.admissions-page-hero,.contact-page-hero{background-color:" + primary + "!important;}",
		        ".gallery-pagination-btn:hover,.gallery-pagination-btn:focus,.gallery-pagination-number:hover,.gallery-pagination-number:focus,.gallery-pagination-number.is-active{background:" + primary + "!important;border-color:" + primary + "!important;color:#fff!important;}",
		        ".hero-secondary-btn,.btn-outline-primary,.school-card,.programme-card,.feature-card,.contact-detail-card,.gallery-pagination-btn,.gallery-pagination-number{border-color:" + primary + "!important;}"
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
	
		  function getThemeCss() {
			    return getThemeScopeSelector() + "{" + getThemeVariableCss() + "}" +
			      "body{font-family:" + JSON.stringify(preview.content.theme.fontFamily) + ", var(--font-family, inherit);}" +
			      getNavLinkFontCss() +
		      getGlobalAppearanceCss() +
		      getTemplateThemeCss() +
		      getTemplateOverrideCss();
		  }

		  function getTemplateChromeFont() {
		    var font = String(preview.content.theme.navLinkFontFamily || preview.content.theme.fontFamily || "").trim();
		    if (preview.content.templateSlug !== "dexta-academy-2") return font;

		    var normalized = font.replace(/["']/g, "").toLowerCase();
		    return !font || normalized.indexOf("plus jakarta sans") !== -1 ? "Montserrat" : font;
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

		    return selectors.join(",") + "{font-family:" + JSON.stringify(navLinkFont) + ", var(--font-family, inherit)!important;}";
		  }

		  function getGlobalAppearanceCss() {
		    var loadingBackground = preview.content.theme.loadingBackgroundColor || "#ffffff";
		    var loadingTextColor = preview.content.theme.loadingTextColor || "currentColor";
		    var isTemplateTwo = preview.content.templateSlug === "dexta-academy-2";
		    var navbarBackground = preview.content.theme.navBarTransparent
		      ? "transparent"
		      : (preview.content.theme.navBarColor || "#ffffff");
		    var navbarShadow = preview.content.theme.navBarTransparent
		      ? "none"
	      : "0 16px 40px rgba(0,0,0,.08)";
	    var logoBorder = preview.content.theme.logoBorderEnabled
	      ? "1px solid " + (preview.content.theme.logoBorderColor || "rgba(255,255,255,.35)")
	      : "0";
		    var logoRadius = (Number(preview.content.theme.logoBorderRadius || 0)) + "px";
	    var logoWidth = (Number(preview.content.theme.logoWidth || 56)) + "px";
	    var logoHeight = (Number(preview.content.theme.logoHeight || 56)) + "px";
	    var loadingLogoWidth = (Number(preview.content.theme.loadingLogoWidth || preview.content.theme.logoWidth || 56)) + "px";
	    var loadingLogoHeight = (Number(preview.content.theme.loadingLogoHeight || preview.content.theme.logoHeight || 56)) + "px";
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
		      !isTemplateTwo || getThemeLogoUrl() || (!templateTwoLegacyLogoDefaults && !templateTwoOriginalLogoDefaults);

			    if (shouldApplyLogoFrame) {
		      css.push(".brand__mark,.brand__crest,.site-loader__mark,.page-loader__crest,.contact-brand>img,.navbar-brand img,.hero-brand img,.school-footer-brand-logo,.site-preloader-logo{border:" + logoBorder + "!important;border-radius:" + logoRadius + "!important;width:" + logoWidth + "!important;height:" + logoHeight + "!important;max-width:" + logoWidth + "!important;}");
		      css.push(".dexta-theme-logo-mark{background:transparent!important;overflow:hidden;}.dexta-theme-logo-mark::before{content:none!important;}.dexta-theme-logo-mark svg,.dexta-theme-logo-mark .brand__crest-inner{display:none!important;}");
		      css.push(".brand__mark img,.brand__crest img,.site-loader__mark img,.page-loader__crest img{display:block;width:100%;height:100%;object-fit:contain;}");
			      css.push(".navbar-brand img,.hero-brand img,.school-footer-brand-logo,.site-preloader-logo,.contact-footer__brand img{object-fit:contain;}");
			    }

			    css.push("#spinner{flex-direction:column!important;gap:14px!important;}");
			    css.push("#spinner .dexta-loading-logo,#spinner .spinner-border,.site-loader__mark,.page-loader__crest,.dexta-generated-loader__logo{display:grid!important;place-items:center!important;width:" + loadingLogoWidth + "!important;height:" + loadingLogoHeight + "!important;max-width:" + loadingLogoWidth + "!important;object-fit:contain!important;}");
			    css.push(".site-preloader-logo{display:block!important;width:" + loadingLogoWidth + "!important;height:" + loadingLogoHeight + "!important;max-width:" + loadingLogoWidth + "!important;object-fit:contain!important;}");
			    css.push("#spinner .dexta-loading-logo img,.site-loader__mark img,.page-loader__crest img,.site-preloader-logo,.dexta-generated-loader__logo img{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;}");
			    css.push("#spinner .dexta-loading-text,.site-loader__text,.page-loader__copy,.site-preloader-content [data-dexta-loading-text],.dexta-generated-loader__text{color:" + loadingTextColor + "!important;font-size:.95rem;font-weight:700;line-height:1.4;}");

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
      '@media (max-width: 980px){body[data-page="home"] .hero-home{background:var(--bg)!important;}body[data-page="home"] .hero-home::before{background-image:var(--dexta-academy-2-hero-mobile-image)!important;background-position:var(--dexta-academy-2-hero-mobile-position,center top)!important;background-size:var(--dexta-academy-2-hero-mobile-size,cover)!important;background-repeat:no-repeat!important;}body[data-page="home"] .hero-home__building{display:none!important;}body[data-page="home"] .hero-home__students{right:0!important;bottom:auto!important;width:var(--dexta-academy-2-hero-students-mobile-width,min(100%,760px))!important;transform:scale(var(--dexta-academy-2-hero-students-mobile-scale,1.12))!important;}body:not([data-page="home"]) .page-hero{background-image:var(--dexta-academy-2-page-hero-mobile-background-image,var(--dexta-academy-2-page-hero-background-image))!important;background-position:var(--dexta-academy-2-page-hero-mobile-background-position,center center)!important;background-size:var(--dexta-academy-2-page-hero-mobile-background-size,cover)!important;background-repeat:no-repeat!important;}body:not([data-page="home"]) .page-hero::before{display:none!important;background-image:none!important;}}'
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
        return;
      }
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
		    var brandName = headerBrandName || String(preview.content.theme.brandName || "").trim();
		    var brandTagline = headerBrandTagline || String(preview.content.theme.brandTagline || "").trim();
		    var showText = Boolean(preview.content.theme.brandTextVisible);
		    var fullLoaderName = [brandName, brandTagline].filter(Boolean).join(" ");
		    var isTemplateTwo = preview.content.templateSlug === "dexta-academy-2";
		    var templateTwoDefaultText =
		      isTemplateTwo &&
		      (brandName === "DXT Academy" || brandName === "DXT ACADEMY") &&
		      brandTagline === "Nurturing. Inspiring. Leading.";

		    setImageLogo(".navbar-brand img, .hero-brand img, .school-footer-brand-logo, .site-preloader-logo, .contact-footer__brand img", logoUrl);
			    replaceMarkLogo(".brand__mark, .brand__crest, .site-loader__mark, .page-loader__crest", logoUrl);

				    setDisplay(".brand__name, .brand__copy, .brand__text, .contact-brand > span", showText);
				    setDisplay(".brand__name span, .brand__copy span, .brand__text span, .contact-brand small", showText && Boolean(brandTagline));

				    if (!templateTwoDefaultText) {
				      setText(".brand__name strong, .brand__copy strong, .brand__text strong, .contact-brand strong, .school-footer-brand h3", brandName);
				      setText(".brand__name span, .brand__copy span, .brand__text span, .contact-brand small", brandTagline);
				    }
			    applyLoadingIdentity(logoUrl, fullLoaderName);

	    document.querySelectorAll(".brand, .contact-brand, .hero-brand").forEach(function (brand) {
	      var label = fullLoaderName || brandName || "School";
	      brand.setAttribute("aria-label", label + " home");
	    });

	    if (logoUrl) {
      document.querySelectorAll("link[rel~='icon']").forEach(function (link) {
        link.setAttribute("href", logoUrl);
      });
    }
  }

  function applyPreviewContent() {
    var page = preview.content.pages.find(function (item) { return item.slug === preview.pageSlug; });
    var pageSnapshot = preview.sourceSnapshot.pages.find(function (item) { return item.slug === preview.pageSlug; });
    if (!page || !pageSnapshot) return;

    injectTheme();
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

		    applyTemplateTwoValuesStripIntro();
		    applyThemeIdentity();
		    applyTemplateTwoHeaderButtons();
		    applyTemplateTwoFooterVisibility();
	    applyTemplateTwoAdmissionForm();
	    rewritePreviewInternalLinks();
	    injectPreviewFontStylesheets();
	    refreshTemplateTwoIcons();
	    document.documentElement.setAttribute("data-dexta-project-preview", "ready");
	  }

  applyPreviewContent();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyPreviewContent, { once: true });
  }
	  window.setTimeout(applyPreviewContent, 80);
	  window.setTimeout(applyThemeIdentity, 350);
	  window.setTimeout(applyTemplateTwoHeaderButtons, 350);
	  window.setTimeout(applyTemplateTwoFooterVisibility, 350);
	  window.setTimeout(applyTemplateTwoAdmissionForm, 350);
	  window.setTimeout(rewritePreviewInternalLinks, 350);
	  window.setTimeout(injectPreviewFontStylesheets, 350);
	  window.setTimeout(refreshTemplateTwoIcons, 350);
	  window.setTimeout(applyThemeIdentity, 1000);
	  window.setTimeout(applyTemplateTwoHeaderButtons, 1000);
	  window.setTimeout(applyTemplateTwoFooterVisibility, 1000);
	  window.setTimeout(applyTemplateTwoAdmissionForm, 1000);
	  window.setTimeout(rewritePreviewInternalLinks, 1000);
	  window.setTimeout(injectPreviewFontStylesheets, 1000);
	  window.setTimeout(refreshTemplateTwoIcons, 1000);
	})();
	</script>`;
}

export async function renderSchoolTemplatePreview({
  content,
  sourceSnapshot,
  pageSlug,
}: RenderSchoolTemplatePreviewInput) {
  const page = content.pages.find((item) => item.slug === pageSlug);
  const pageSnapshot = sourceSnapshot.pages.find(
    (item) => item.slug === pageSlug,
  );

  if (!page || !pageSnapshot) {
    return null;
  }

  const sourcePath = assertSafeTemplatePath(
    sourceSnapshot.sourceDir,
    page.fileName,
  );
  let sourceHtml = await readFile(sourcePath, "utf8");
  const usesHero3d =
    sourceSnapshot.templateSlug === "dexta-academy-4" &&
    page.fileName === "index.html";
  const threeConfig = buildPreviewThreeConfig({
    content,
    sourceSnapshot,
    page,
  });
  const threeConfigMarkup = hasThreeConfig(threeConfig)
    ? renderThreeConfigMarkup(threeConfig)
    : "";
  const hero3dModuleMarkup = usesHero3d ? getPreviewHero3dModuleMarkup() : "";

  if (usesHero3d) {
    sourceHtml = removeHero3dModuleScript(sourceHtml);
  }

  const baseHref = getTemplateBaseHref(sourceSnapshot.previewPath);
  const baseMarkup = `<base href="${baseHref}">`;
  const noIndexMarkup =
    '<meta name="robots" content="noindex,nofollow"><meta name="dexta-preview" content="true">';

  const withHeadMarkup = injectIntoHead(
    sourceHtml,
    `${baseMarkup}\n${noIndexMarkup}\n${getPreviewBootMarkup()}`,
  );

  return injectBeforeBodyClose(
    withHeadMarkup,
    `${threeConfigMarkup}${getPreviewRuntimeScript({
      content,
      sourceSnapshot,
      page,
    })}${hero3dModuleMarkup}`,
  );
}
