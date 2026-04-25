import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  type SchoolTemplateProjectContent,
  type SchoolTemplateProjectPageContent,
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

function patchHero3dPreviewScript(value: string) {
  return value
    .replace(
      /const MODEL_URL\s*=\s*new URL\("\.\.\/assets\/3d\/gr\.glb", import\.meta\.url\)\.href;/,
      'const MODEL_URL = window.schoolHero3dConfig?.model?.url ? (/^(https?:|blob:|data:)/i.test(window.schoolHero3dConfig.model.url) ? window.schoolHero3dConfig.model.url : new URL(window.schoolHero3dConfig.model.url.replace(/^\\.\\//, ""), document.baseURI).href) : new URL("assets/3d/gr.glb", document.baseURI).href;',
    )
    .replace(
      /const PRELOAD_TIMEOUT_MS\s*=\s*\d+;/,
      "const PRELOAD_TIMEOUT_MS = window.schoolHero3dConfig?.preloadTimeoutMs ?? 10000;",
    )
    .replace(
      /const BASE_ROTATION_X\s*=\s*-?[\d.]+;/,
      "const BASE_ROTATION_X = window.schoolHero3dConfig?.transform?.rotation?.x ?? -0.20;",
    )
    .replace(
      /const BASE_ROTATION_Y\s*=\s*-?[\d.]+;/,
      "const BASE_ROTATION_Y = window.schoolHero3dConfig?.transform?.rotation?.y ?? -0.21;",
    )
    .replace(
      /const BASE_ROTATION_Z\s*=\s*-?[\d.]+;/,
      "const BASE_ROTATION_Z = window.schoolHero3dConfig?.transform?.rotation?.z ?? 0.20;",
    )
    .replace(
      /const MODEL_SCALE_TARGET\s*=\s*[\d.]+;/,
      "const MODEL_SCALE_TARGET = window.schoolHero3dConfig?.transform?.scale ?? 4.5;",
    )
    .replace(
      /const CAP_BODY_COLOR\s*=\s*new THREE\.Color\(0x[0-9a-fA-F]+\);/,
      "const CAP_BODY_COLOR = new THREE.Color(window.schoolHero3dConfig?.materials?.capBodyColor || 0x060d1e);",
    )
    .replace(
      /const CAP_BODY_EMISSIVE\s*=\s*new THREE\.Color\(0x[0-9a-fA-F]+\);/,
      "const CAP_BODY_EMISSIVE = new THREE.Color(window.schoolHero3dConfig?.materials?.capBodyEmissiveColor || 0x010408);",
    )
    .replace(
      /const TASSEL_CORD_COLOR\s*=\s*new THREE\.Color\(0x[0-9a-fA-F]+\);/,
      "const TASSEL_CORD_COLOR = new THREE.Color(window.schoolHero3dConfig?.materials?.tasselCordColor || 0x2a5fc0);",
    )
    .replace(
      /const TASSEL_TIP_COLOR\s*=\s*new THREE\.Color\(0x[0-9a-fA-F]+\);/,
      "const TASSEL_TIP_COLOR = new THREE.Color(window.schoolHero3dConfig?.materials?.tasselTipColor || 0x1a3d8a);",
    )
    .replace(
      /obj\.position\.x \+= sz2\.x \* 0\.10;/,
      "obj.position.x += sz2.x * (window.schoolHero3dConfig?.transform?.offset?.x ?? 0.10);",
    )
    .replace(
      /obj\.position\.y -= sz2\.y \* 0\.18;/,
      "obj.position.y -= sz2.y * Math.abs(window.schoolHero3dConfig?.transform?.offset?.y ?? -0.18);",
    );
}

async function getPreviewHero3dModuleMarkup(sourceDir: string) {
  const scriptPath = assertSafeTemplatePath(sourceDir, "js/hero-3d.js");
  const script = await readFile(scriptPath, "utf8");

  return `<script type="module" data-dexta-preview-hero-3d="true">
${patchHero3dPreviewScript(script)}
</script>`;
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
  cloudName: ${escapeScriptJson(cloudName)}
};
(function () {
  var preview = window.__DEXTA_SCHOOL_PREVIEW__;
  if (!preview) return;

	  function isFilled(value) {
	    return value !== null && value !== undefined && value !== "";
	  }

	  function isCloudinaryRawGlbUrl(value) {
	    try {
	      var url = new URL(value);
	      return url.protocol === "https:" &&
	        url.hostname === "res.cloudinary.com" &&
	        url.pathname.indexOf("/raw/upload/") !== -1 &&
	        /\\.glb$/i.test(url.pathname);
	    } catch (error) {
	      return false;
	    }
	  }

  function toText(value) {
    return value === null || value === undefined ? "" : String(value);
  }

  function withUnit(value, unit) {
    if (value === null || value === undefined || value === "") return "";
    var text = String(value);
    if (!unit || /[a-z%]+$/i.test(text)) return text;
    return text + unit;
  }

		function resolveAsset(value, field) {
	    var source = toText(value).trim();
	    if (!source) return "";
	    if (field.type === "model3d" && isCloudinaryRawGlbUrl(source)) {
	      return "/api/cloudinary/raw?url=" + encodeURIComponent(source);
	    }
	    if (/^(https?:|data:|blob:|\\/|\\.\\/|\\.\\.\\/)/i.test(source)) return source;
    if (/^(assets|css|fonts|img|images|js|lib|scss|school-)/i.test(source)) return source;
    if (field.type === "image" && preview.cloudName) {
      return "https://res.cloudinary.com/" + preview.cloudName + "/image/upload/f_auto,q_auto/" + source;
    }
    if (field.type === "model3d" && preview.cloudName) {
      return "https://res.cloudinary.com/" + preview.cloudName + "/raw/upload/" + source;
    }
    return source;
	  }
	
	  function getCssVariableValue(value, field) {
	    if (field.type === "image" || field.type === "model3d") {
	      var asset = resolveAsset(value, field).replace(/"/g, "&quot;");
	      return asset ? 'url("' + asset + '")' : "";
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

	  function applyField(node, field, value) {
	    if (field.target === "threeConfig") {
	      window.schoolHero3dConfig = window.schoolHero3dConfig || {};
	      setDeep(
	        window.schoolHero3dConfig,
	        field.configPath,
	        field.type === "model3d" ? resolveAsset(value, field) : value
	      );
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
      node.innerHTML = toText(value);
      return;
    }

    if (field.target === "attribute") {
      var attribute = field.attribute || (field.type === "link" ? "href" : "src");
      node.setAttribute(attribute, resolveAsset(value, field));
      return;
    }

    if (field.target === "backgroundImage") {
      node.style.backgroundImage = 'url("' + resolveAsset(value, field).replace(/"/g, "&quot;") + '")';
      return;
    }

    node.textContent = toText(value);
  }

	  function applySection(sectionContent, sectionSnapshot) {
	    if (!sectionContent || !sectionSnapshot) return;
	    var roots = getSectionRoots(sectionSnapshot);
	    sectionSnapshot.fields.forEach(function (field) {
	      var value = sectionContent.fields ? sectionContent.fields[field.key] : null;
      if (!isFilled(value)) return;

      if (field.target === "threeConfig") {
        applyField(document.documentElement, field, value);
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
	          if (!isFilled(value)) return;

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
		        ".section--dark,.site-header{background:var(--bg)!important;}",
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
	
	    return "";
	  }
	
		  function getThemeCss() {
		    return getThemeScopeSelector() + "{" + getThemeVariableCss() + "}" +
		      "body{font-family:" + JSON.stringify(preview.content.theme.fontFamily) + ", var(--font-family, inherit);}" +
	      getTemplateThemeCss() +
	      getTemplateOverrideCss();
	  }
		
	  function getTemplateOverrideCss() {
	    if (preview.content.templateSlug !== "dexta-academy-2") return "";
    return [
      'body[data-page="home"] .hero-home{background-image:var(--dexta-academy-2-hero-desktop-tree-image)!important;background-position:var(--dexta-academy-2-hero-desktop-tree-position,center center)!important;background-size:var(--dexta-academy-2-hero-desktop-tree-size,cover)!important;background-repeat:no-repeat!important;}',
      'body[data-page="home"] .hero-home__building{background-image:var(--dexta-academy-2-hero-desktop-building-image)!important;background-position:var(--dexta-academy-2-hero-desktop-building-position,center bottom)!important;background-size:var(--dexta-academy-2-hero-desktop-building-size,100% auto)!important;background-repeat:no-repeat!important;}',
      'body[data-page="home"] .hero-home__overlay{background:var(--dexta-academy-2-hero-overlay-color,#04111d)!important;opacity:var(--dexta-academy-2-hero-overlay-opacity,.58)!important;}',
      'body[data-page="home"] .hero-home__students{right:var(--dexta-academy-2-hero-students-desktop-right,max(-3.5vw,-44px))!important;bottom:var(--dexta-academy-2-hero-students-desktop-bottom,-78px)!important;width:var(--dexta-academy-2-hero-students-desktop-width,min(49vw,790px))!important;}',
      '@media (max-width: 980px){body[data-page="home"] .hero-home{background:var(--bg)!important;}body[data-page="home"] .hero-home::before{background-image:var(--dexta-academy-2-hero-mobile-image)!important;background-position:var(--dexta-academy-2-hero-mobile-position,center top)!important;background-size:var(--dexta-academy-2-hero-mobile-size,cover)!important;background-repeat:no-repeat!important;}body[data-page="home"] .hero-home__building{display:none!important;}body[data-page="home"] .hero-home__students{right:0!important;bottom:auto!important;width:var(--dexta-academy-2-hero-students-mobile-width,min(100%,760px))!important;transform:scale(var(--dexta-academy-2-hero-students-mobile-scale,1.12))!important;}}'
    ].join("");
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

    document.documentElement.setAttribute("data-dexta-project-preview", "ready");
  }

  applyPreviewContent();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyPreviewContent, { once: true });
  }
  window.setTimeout(applyPreviewContent, 80);
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
  const hero3dModuleMarkup = usesHero3d
    ? await getPreviewHero3dModuleMarkup(sourceSnapshot.sourceDir)
    : "";

  if (usesHero3d) {
    sourceHtml = removeHero3dModuleScript(sourceHtml);
  }

  const baseHref = getTemplateBaseHref(sourceSnapshot.previewPath);
  const baseMarkup = `<base href="${baseHref}">`;
  const noIndexMarkup =
    '<meta name="robots" content="noindex,nofollow"><meta name="dexta-preview" content="true">';

  const withHeadMarkup = injectIntoHead(
    sourceHtml,
    `${baseMarkup}\n${noIndexMarkup}`,
  );

  return injectBeforeBodyClose(
    withHeadMarkup,
    `${getPreviewRuntimeScript({
      content,
      sourceSnapshot,
      page,
    })}${hero3dModuleMarkup}`,
  );
}
