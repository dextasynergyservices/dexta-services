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

			    css.push(".brand__name,.brand__copy,.contact-brand>span{display:" + brandTextDisplay + "!important;}");
			    css.push(".brand__name span,.brand__copy span,.contact-brand small{display:" + brandLine2Display + "!important;}");

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
		      css.push(".brand__name strong,.brand__copy strong,.contact-brand strong,.school-footer-brand h3{color:" + (preview.content.theme.brandNameColor || "#111827") + "!important;font-size:" + (Number(preview.content.theme.brandNameFontSize || 16)) + "px!important;}");
		      css.push(".brand__name span,.brand__copy span,.contact-brand small{color:" + (preview.content.theme.brandTaglineColor || "#6b7280") + "!important;font-size:" + (Number(preview.content.theme.brandTaglineFontSize || 12)) + "px!important;}");
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
      '@media (max-width: 980px){body[data-page="home"] .hero-home{background:var(--bg)!important;}body[data-page="home"] .hero-home::before{background-image:var(--dexta-academy-2-hero-mobile-image)!important;background-position:var(--dexta-academy-2-hero-mobile-position,center top)!important;background-size:var(--dexta-academy-2-hero-mobile-size,cover)!important;background-repeat:no-repeat!important;}body[data-page="home"] .hero-home__building{display:none!important;}body[data-page="home"] .hero-home__students{right:0!important;bottom:auto!important;width:var(--dexta-academy-2-hero-students-mobile-width,min(100%,760px))!important;transform:scale(var(--dexta-academy-2-hero-students-mobile-scale,1.12))!important;}}'
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

		  function applyThemeIdentity() {
		    var logoUrl = getThemeLogoUrl();
		    var brandName = String(preview.content.theme.brandName || "").trim();
		    var brandTagline = String(preview.content.theme.brandTagline || "").trim();
		    var showText = Boolean(preview.content.theme.brandTextVisible);
		    var fullLoaderName = [brandName, brandTagline].filter(Boolean).join(" ");
		    var isTemplateTwo = preview.content.templateSlug === "dexta-academy-2";
		    var templateTwoDefaultText =
		      isTemplateTwo &&
		      (brandName === "DXT Academy" || brandName === "DXT ACADEMY") &&
		      brandTagline === "Nurturing. Inspiring. Leading.";

		    setImageLogo(".navbar-brand img, .hero-brand img, .school-footer-brand-logo, .site-preloader-logo, .contact-footer__brand img", logoUrl);
		    replaceMarkLogo(".brand__mark, .brand__crest, .site-loader__mark, .page-loader__crest", logoUrl);

		    setDisplay(".brand__name, .brand__copy, .contact-brand > span", showText);
	    setDisplay(".site-loader__text", showText && Boolean(fullLoaderName));
	    setDisplay(".brand__name span, .brand__copy span, .contact-brand small", showText && Boolean(brandTagline));

		    if (!templateTwoDefaultText) {
		      setText(".brand__name strong, .brand__copy strong, .contact-brand strong, .school-footer-brand h3", brandName);
		      setText(".brand__name span, .brand__copy span, .contact-brand small", brandTagline);
		    }
		    setText(".site-loader__text", fullLoaderName ? "Loading " + fullLoaderName : "");

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
