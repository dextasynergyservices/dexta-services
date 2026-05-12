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
      node.innerHTML = toText(value);
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
	      getGlobalAppearanceCss() +
	      getTemplateThemeCss() +
	      getTemplateOverrideCss();
	  }

		  function getGlobalAppearanceCss() {
		    var loadingBackground = preview.content.theme.loadingBackgroundColor || "#ffffff";
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
		      "#spinner,.site-loader,.site-preloader,#ftco-loader,#ftco-loader.fullscreen,#ftco-loader.show.fullscreen{background:" + loadingBackground + "!important;background-color:" + loadingBackground + "!important;}"
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
			    css.push("#spinner .dexta-loading-text,.dexta-generated-loader__text{color:currentColor;font-size:.95rem;font-weight:700;line-height:1.4;}");

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
      'body:not([data-page="home"]) .page-hero{background-image:var(--dexta-academy-2-page-hero-background-image)!important;background-position:var(--dexta-academy-2-page-hero-background-position,center center)!important;background-size:var(--dexta-academy-2-page-hero-background-size,cover)!important;background-repeat:no-repeat!important;}',
      'body:not([data-page="home"]) .page-hero::before{background-image:var(--dexta-academy-2-page-hero-building-image)!important;background-position:var(--dexta-academy-2-page-hero-building-position,center bottom)!important;background-size:var(--dexta-academy-2-page-hero-building-size,100% auto)!important;background-repeat:no-repeat!important;}',
      'body:not([data-page="home"]) .page-hero::after{background:var(--dexta-academy-2-page-hero-overlay-color,#04111d)!important;opacity:var(--dexta-academy-2-page-hero-overlay-opacity,.62)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(2){background:var(--dexta-academy-2-academics-overview-section-bg,#fff)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(2) .info-card{background:var(--dexta-academy-2-academics-overview-card-bg,#fff)!important;border:var(--dexta-academy-2-academics-overview-border-width,1px) solid var(--dexta-academy-2-academics-overview-border-color,#e7edf3)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(2) .info-card__icon{background:var(--dexta-academy-2-academics-overview-icon-bg,#fff4cc)!important;color:var(--dexta-academy-2-academics-overview-icon-color,#9b7104)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(2) .info-card h3{color:var(--dexta-academy-2-academics-overview-title-color,#102034)!important;font-family:var(--dexta-academy-2-academics-overview-title-font,Manrope),"Segoe UI",sans-serif!important;font-style:var(--dexta-academy-2-academics-overview-title-font-style,normal)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(2) .info-card p{color:var(--dexta-academy-2-academics-overview-description-color,#58708a)!important;font-family:var(--dexta-academy-2-academics-overview-description-font,"Plus Jakarta Sans"),"Segoe UI",sans-serif!important;font-style:var(--dexta-academy-2-academics-overview-description-font-style,normal)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(3){background:var(--dexta-academy-2-academics-subjects-section-bg,#081827)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(3) .card{background:var(--dexta-academy-2-academics-subjects-card-bg,#fff)!important;border:var(--dexta-academy-2-academics-subjects-border-width,1px) solid var(--dexta-academy-2-academics-subjects-border-color,#e7edf3)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(3) .card__badge{background:var(--dexta-academy-2-academics-subjects-icon-bg,#ffc433)!important;color:var(--dexta-academy-2-academics-subjects-icon-color,#091624)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(3) .card__title{color:var(--dexta-academy-2-academics-subjects-title-color,#102034)!important;font-family:var(--dexta-academy-2-academics-subjects-title-font,Manrope),"Segoe UI",sans-serif!important;font-style:var(--dexta-academy-2-academics-subjects-title-font-style,normal)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(3) .card__text{color:var(--dexta-academy-2-academics-subjects-description-color,#58708a)!important;font-family:var(--dexta-academy-2-academics-subjects-description-font,"Plus Jakarta Sans"),"Segoe UI",sans-serif!important;font-style:var(--dexta-academy-2-academics-subjects-description-font-style,normal)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(4){background:var(--dexta-academy-2-academics-learning-section-bg,#fff)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(4) .section-title{color:var(--dexta-academy-2-academics-learning-title-color,#102034)!important;font-family:var(--dexta-academy-2-academics-learning-title-font,Manrope),"Segoe UI",sans-serif!important;font-style:var(--dexta-academy-2-academics-learning-title-font-style,normal)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(4) .section-copy{color:var(--dexta-academy-2-academics-learning-description-color,#58708a)!important;font-family:var(--dexta-academy-2-academics-learning-description-font,"Plus Jakarta Sans"),"Segoe UI",sans-serif!important;font-style:var(--dexta-academy-2-academics-learning-description-font-style,normal)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(4) .steps li{background:var(--dexta-academy-2-academics-learning-step-bg,#fff)!important;border:var(--dexta-academy-2-academics-learning-step-border-width,0px) solid var(--dexta-academy-2-academics-learning-step-border-color,#e7edf3)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(4) .steps__number{background:var(--dexta-academy-2-academics-learning-step-number-bg,#fff4cc)!important;color:var(--dexta-academy-2-academics-learning-step-number-color,#9b7104)!important;}',
      'body[data-page="academics"] main>section:nth-of-type(4) .steps li span:not(.steps__number){color:var(--dexta-academy-2-academics-learning-step-text-color,#58708a)!important;}',
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

		  function setDisplay(selector, visible) {
		    document.querySelectorAll(selector).forEach(function (node) {
		      node.style.display = visible ? "" : "none";
		    });
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

    applyThemeIdentity();
    document.documentElement.setAttribute("data-dexta-project-preview", "ready");
  }

  applyPreviewContent();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyPreviewContent, { once: true });
  }
  window.setTimeout(applyPreviewContent, 80);
  window.setTimeout(applyThemeIdentity, 350);
  window.setTimeout(applyThemeIdentity, 1000);
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
    `${baseMarkup}\n${noIndexMarkup}`,
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
