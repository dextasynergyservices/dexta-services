import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const heroSection = document.querySelector(".school-hero");
const stage = document.getElementById("hero-3d-stage");
const canvas = document.getElementById("hero-3d-canvas");
const status = document.getElementById("hero-3d-status");
const pagePreloader = document.getElementById("site-preloader");
const pagePreloaderStatus = document.getElementById("site-preloader-status");
const heroVisual = heroSection
  ? heroSection.querySelector(".hero-visual")
  : null;
const heroDisplay = heroVisual
  ? heroVisual.querySelector(".hero-display")
  : null;
const headlineLines = heroSection
  ? Array.from(heroSection.querySelectorAll(".hero-display span"))
  : [];

if (!heroSection || !stage || !canvas || !status) {
  // Exit quietly if hero markup is absent on another page.
  document.body.classList.remove("is-preloading");
  document.body.classList.add("is-ready");
  if (pagePreloader) pagePreloader.classList.add("is-hidden");
} else {
  const HERO_3D_CONFIG = window.schoolHero3dConfig || {};
  const TRANSFORM_CONFIG = HERO_3D_CONFIG.transform || {};
  const LIGHTING_CONFIG = HERO_3D_CONFIG.lighting || {};
  const VISIBILITY_CONFIG = HERO_3D_CONFIG.visibility || {};
  const RESPONSIVE_CONFIG = HERO_3D_CONFIG.responsive || {};
  const MOBILE_TRANSFORM_CONFIG = TRANSFORM_CONFIG.mobile || {};
  const MOBILE_RESPONSIVE_CONFIG = RESPONSIVE_CONFIG.mobile || {};
  const mobileViewportQuery =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(max-width: 767.98px)")
      : null;
  const headlineFontSizeOverrides = new WeakMap();

  function numberFromConfig(value, fallback) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
  }

  function clampedNumberFromConfig(value, fallback, min, max) {
    return Math.min(Math.max(numberFromConfig(value, fallback), min), max);
  }

  function stringFromConfig(value, fallback) {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  function isMobileViewport() {
    return mobileViewportQuery ? mobileViewportQuery.matches : false;
  }

  function placementFromConfig(value) {
    const placement = stringFromConfig(value, "overlay");
    return placement === "modelTop" || placement === "modelBottom"
      ? placement
      : "overlay";
  }

  function getActivePlacementConfig() {
    const latestConfig = window.schoolHero3dConfig || HERO_3D_CONFIG;
    const responsiveConfig = latestConfig.responsive || {};
    return isMobileViewport()
      ? responsiveConfig.mobile || {}
      : responsiveConfig.desktop || {};
  }

  function getMobileHeadlineFontSize(value) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) return null;
    return Math.min(Math.max(numberValue, 28), 120);
  }

  function setInlineOverride(node, property, value) {
    if (!node || !node.style) return;
    if (!headlineFontSizeOverrides.has(node)) {
      headlineFontSizeOverrides.set(node, {
        value: node.style.getPropertyValue(property),
        priority: node.style.getPropertyPriority(property),
      });
    }
    node.style.setProperty(property, value, "important");
  }

  function restoreInlineOverride(node, property) {
    if (!node || !node.style || !headlineFontSizeOverrides.has(node)) return;
    const original = headlineFontSizeOverrides.get(node);
    if (original.value) {
      node.style.setProperty(property, original.value, original.priority);
    } else {
      node.style.removeProperty(property);
    }
    headlineFontSizeOverrides.delete(node);
  }

  function applyMobileHeadlineFontSize(activeConfig) {
    if (!heroDisplay) return;

    const nodes = [heroDisplay, ...heroDisplay.querySelectorAll("*")];
    const fontSize = isMobileViewport()
      ? getMobileHeadlineFontSize(activeConfig.headlineFontSize)
      : null;

    if (fontSize) {
      nodes.forEach((node) => {
        setInlineOverride(node, "font-size", `${fontSize}px`);
      });
      return;
    }

    nodes.forEach((node) => {
      restoreInlineOverride(node, "font-size");
    });
  }

  function ensureResponsiveHeroLayoutStyles() {
    if (document.getElementById("school-hero-3d-responsive-layout")) return;

    const style = document.createElement("style");
    style.id = "school-hero-3d-responsive-layout";
    style.textContent = `
.school-homepage .school-hero.hero-model-stack-enabled .hero-visual{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:var(--hero-model-text-gap,18px)!important;}
.school-homepage .school-hero.hero-model-stack-enabled .hero-display{position:relative!important;inset:auto!important;order:2!important;width:100%!important;padding-top:0!important;transform:none;}
.school-homepage .school-hero.hero-model-stack-enabled:not(.hero-intro-enabled) .hero-display span:first-child,.school-homepage .school-hero.hero-model-stack-enabled:not(.hero-intro-enabled) .hero-display span:last-child,.school-homepage .school-hero.hero-model-stack-enabled.hero-intro-complete .hero-display span:first-child,.school-homepage .school-hero.hero-model-stack-enabled.hero-intro-complete .hero-display span:last-child{transform:none;}
.school-homepage .school-hero.hero-model-stack-enabled .hero-3d-stage{position:relative!important;left:auto!important;top:auto!important;flex:0 0 auto!important;margin-top:0!important;margin-bottom:0!important;transform:translate3d(calc(var(--cap-center-x,50%) - 50% + var(--cap-side-offset,0px)),0,0) scale(1);}
.school-homepage .school-hero.hero-model-stack-top .hero-3d-stage{order:1!important;margin-bottom:var(--hero-model-text-overlap,0px)!important;}
.school-homepage .school-hero.hero-model-stack-bottom .hero-3d-stage{order:3!important;margin-top:var(--hero-model-text-overlap,0px)!important;}
.school-homepage .school-hero.hero-model-stack-enabled.hero-intro-enabled .hero-3d-stage{transform:translate3d(calc(var(--cap-center-x,50%) - 50% + var(--cap-side-offset,0px)),calc(-68vh),0) scale(.92);}
.school-homepage .school-hero.hero-model-stack-enabled.hero-cap-drop-in .hero-3d-stage{animation-name:hero-cap-drop-stacked;}
.school-homepage .school-hero.hero-model-stack-enabled.hero-intro-complete .hero-3d-stage{transform:translate3d(calc(var(--cap-center-x,50%) - 50% + var(--cap-side-offset,0px)),0,0) scale(1);}
@keyframes hero-cap-drop-stacked{0%{opacity:0;transform:translate3d(calc(var(--cap-center-x,50%) - 50% + var(--cap-side-offset,0px)),calc(-68vh),0) scale(.92);}14%{opacity:1;}62%{opacity:1;transform:translate3d(calc(var(--cap-center-x,50%) - 50% + var(--cap-side-offset,0px)),18px,0) scale(1.012);}80%{transform:translate3d(calc(var(--cap-center-x,50%) - 50% + var(--cap-side-offset,0px)),-9px,0) scale(.997);}100%{opacity:1;transform:translate3d(calc(var(--cap-center-x,50%) - 50% + var(--cap-side-offset,0px)),0,0) scale(1);}}
@media (prefers-reduced-motion:reduce){.school-homepage .school-hero.hero-model-stack-enabled.hero-intro-enabled .hero-3d-stage{transform:translate3d(calc(var(--cap-center-x,50%) - 50% + var(--cap-side-offset,0px)),0,0) scale(1)!important;}}
@media (max-width:767.98px){.school-homepage .school-hero.hero-model-stack-enabled .hero-display{line-height:.82!important;transform:none;}}
`;
    document.head.appendChild(style);
  }

  function resolveModelUrl(value) {
    const fallback = new URL("../assets/3d/gr.glb", import.meta.url).href;
    const source = typeof value === "string" ? value.trim() : "";

    if (!source) return fallback;
    if (/^(https?:|data:|blob:)/i.test(source) || source.startsWith("/")) {
      return source;
    }

    return new URL(`../${source.replace(/^\.\//, "")}`, import.meta.url).href;
  }

  const MODEL_URL = resolveModelUrl(HERO_3D_CONFIG.model?.url);
  const HERO_IMAGE_URL =
    "https://res.cloudinary.com/dxoorukfj/image/upload/v1777041124/ChatGPT_Image_Apr_24_2026_03_31_43_PM_ssnnin.png";
  const PRELOAD_TIMEOUT_MS = 10000;
  const MODEL_VISIBLE =
    stringFromConfig(VISIBILITY_CONFIG.mode, "show") !== "hide";
  const MOBILE_LAYER_ORDER = stringFromConfig(
    MOBILE_RESPONSIVE_CONFIG.layer,
    "modelFront",
  );

  // ── Cap orientation ─────────────────────────────────────────
  // X: negative = tip top face toward viewer (show the board properly)
  // Y: slight yaw so it reads as 3-D
  // Z: ZERO — no sideways lean (was the main visual bug before)
  const ORIGINAL_ROTATION_X = -0.2;
  const ORIGINAL_ROTATION_Y = -0.21;
  const ORIGINAL_ROTATION_Z = 0.2;
  const MODEL_ROTATION_X = numberFromConfig(
    TRANSFORM_CONFIG.rotation?.x,
    ORIGINAL_ROTATION_X,
  );
  const MODEL_ROTATION_Y = numberFromConfig(
    TRANSFORM_CONFIG.rotation?.y,
    ORIGINAL_ROTATION_Y,
  );
  const MODEL_ROTATION_Z = numberFromConfig(
    TRANSFORM_CONFIG.rotation?.z,
    ORIGINAL_ROTATION_Z,
  );
  const BASE_ROTATION_X = numberFromConfig(
    TRANSFORM_CONFIG.spinRotation?.x,
    ORIGINAL_ROTATION_X,
  );
  const BASE_ROTATION_Y = numberFromConfig(
    TRANSFORM_CONFIG.spinRotation?.y,
    ORIGINAL_ROTATION_Y,
  );
  const BASE_ROTATION_Z = ORIGINAL_ROTATION_Z;

  const DESKTOP_MODEL_SCALE_TARGET = numberFromConfig(
    TRANSFORM_CONFIG.scale,
    4.5,
  );
  function getActiveModelScaleTarget() {
    const latestConfig = window.schoolHero3dConfig || HERO_3D_CONFIG;
    const transformConfig = latestConfig.transform || {};
    const mobileTransformConfig =
      transformConfig.mobile || MOBILE_TRANSFORM_CONFIG;
    const desktopScale = numberFromConfig(
      transformConfig.scale,
      DESKTOP_MODEL_SCALE_TARGET,
    );
    const mobileScale = numberFromConfig(
      mobileTransformConfig.scale,
      numberFromConfig(MOBILE_TRANSFORM_CONFIG.scale, desktopScale),
    );
    return isMobileViewport() ? mobileScale : desktopScale;
  }
  const MODEL_FRAME_REFERENCE_SIZE = 4.5;
  const MODEL_VISIBLE_SCALE_LIMIT = 1.45;
  const MODEL_FRAME_PADDING = 1.22;
  const MODEL_OFFSET_X = numberFromConfig(TRANSFORM_CONFIG.offset?.x, 0.1);
  const MODEL_OFFSET_Y = numberFromConfig(TRANSFORM_CONFIG.offset?.y, -0.18);
  const MODEL_BRIGHTNESS = clampedNumberFromConfig(
    LIGHTING_CONFIG.brightness,
    0.65,
    0.05,
    2,
  );
  const MODEL_EXPOSURE = clampedNumberFromConfig(
    LIGHTING_CONFIG.exposure,
    0.9,
    0.1,
    1.8,
  );
  const MODEL_ENVIRONMENT_INTENSITY = clampedNumberFromConfig(
    LIGHTING_CONFIG.environmentIntensity,
    0.45,
    0,
    1.5,
  );
  const MODEL_LIGHTING_MODE = stringFromConfig(
    LIGHTING_CONFIG.mode,
    "flatColor",
  );
  const USE_FLAT_COLOR_LIGHTING = MODEL_LIGHTING_MODE === "flatColor";
  const USE_TRUE_COLOR_LIGHTING = MODEL_LIGHTING_MODE !== "stylized";
  const SCROLL_ROTATION_RANGE = Math.PI * 0.04;
  const ROTATION_DAMPING = 0.06;

  heroSection.classList.toggle("hero-3d-hidden", !MODEL_VISIBLE);
  heroSection.classList.toggle(
    "hero-mobile-text-front",
    MOBILE_LAYER_ORDER === "textFront",
  );
  function applyResponsiveHeroState() {
    applyResponsiveHeroLayout();
    if (typeof window.reapplySchoolHero3dModelScale === "function") {
      window.reapplySchoolHero3dModelScale();
    }
  }

  applyResponsiveHeroLayout();
  window.applySchoolHero3dLayout = applyResponsiveHeroState;
  window.addEventListener(
    "schoolHero3dConfigChanged",
    applyResponsiveHeroState,
  );
  if (mobileViewportQuery) {
    const handleViewportChange = () => applyResponsiveHeroState();
    if (typeof mobileViewportQuery.addEventListener === "function") {
      mobileViewportQuery.addEventListener("change", handleViewportChange);
    } else if (typeof mobileViewportQuery.addListener === "function") {
      mobileViewportQuery.addListener(handleViewportChange);
    }
  }

  // Intro timings
  const CAP_DROP_DURATION_MS = 1280;
  const HEADLINE_DELAY_MS = 90;
  const HEADLINE_DURATION_MS = 1520;
  const WOBBLE_DELAY_MS = 40;
  const SPIN_DURATION_MS = 1680;
  const WOBBLE_DURATION_MS = 2860;

  const reduceMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  let heroImageReady = false;
  let modelReadyForReveal = false;
  let modelUnavailable = false;
  let pageRevealed = false;
  let preloadTimeoutId = null;
  let startIntro = () => revealHeroImmediately();

  if (!MODEL_VISIBLE) {
    modelReadyForReveal = true;
    modelUnavailable = true;
  }

  if (window.schoolHeroPreloaderFallback) {
    window.clearTimeout(window.schoolHeroPreloaderFallback);
    window.schoolHeroPreloaderFallback = null;
  }

  heroSection.classList.add("hero-intro-enabled");
  setPreloaderStatus("Loading hero image…");

  preloadHeroImage(HERO_IMAGE_URL)
    .catch(() => {
      setPreloaderStatus("Hero image unavailable. Opening page…");
    })
    .finally(() => {
      heroImageReady = true;
      if (!modelReadyForReveal) setPreloaderStatus("Preparing 3D animation…");
      maybeRevealPageAndStartIntro();
    });

  preloadTimeoutId = window.setTimeout(() => {
    heroImageReady = true;
    modelReadyForReveal = true;
    modelUnavailable = true;
    setPreloaderStatus("Opening page…");
    revealPageAndMaybeStartIntro(true);
  }, PRELOAD_TIMEOUT_MS);

  function revealHeroImmediately() {
    heroSection.classList.add("hero-intro-complete");
    heroSection.classList.remove("hero-cap-drop-in", "hero-headline-in");
  }

  function markModelUnavailable(message) {
    modelUnavailable = true;
    modelReadyForReveal = true;
    setPreloaderStatus(message);
    maybeRevealPageAndStartIntro();
  }

  function maybeRevealPageAndStartIntro() {
    if (pageRevealed || !heroImageReady || !modelReadyForReveal) return;
    revealPageAndMaybeStartIntro(modelUnavailable);
  }

  function revealPageAndMaybeStartIntro(skipIntro = false) {
    if (pageRevealed) return;
    pageRevealed = true;
    if (preloadTimeoutId) window.clearTimeout(preloadTimeoutId);
    if (window.schoolHeroPreloaderFallback) {
      window.clearTimeout(window.schoolHeroPreloaderFallback);
      window.schoolHeroPreloaderFallback = null;
    }

    requestAnimationFrame(() => {
      document.body.classList.remove("is-preloading");
      document.body.classList.add("is-ready");
      if (pagePreloader) {
        pagePreloader.classList.add("is-hidden");
        window.setTimeout(() => {
          pagePreloader.setAttribute("aria-hidden", "true");
        }, 450);
      }

      if (skipIntro || reduceMotionQuery.matches) {
        revealHeroImmediately();
      } else {
        window.setTimeout(startIntro, 120);
      }
    });
  }

  function preloadHeroImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.decoding = "async";
      img.src = url;
      if (img.complete) resolve();
    });
  }

  function setPreloaderStatus(message) {
    if (pagePreloaderStatus) pagePreloaderStatus.textContent = message;
  }

  function applyResponsiveHeroLayout() {
    ensureResponsiveHeroLayoutStyles();
    const activeConfig = getActivePlacementConfig();
    const placement = placementFromConfig(activeConfig.placement);
    const isStacked = placement !== "overlay";
    const gap = clampedNumberFromConfig(
      activeConfig.gap,
      isMobileViewport() ? 12 : 18,
      -120,
      220,
    );
    const layoutGap = Math.max(0, gap);
    const overlapGap = Math.min(0, gap);

    heroSection.classList.toggle(
      "hero-model-stack-top",
      placement === "modelTop",
    );
    heroSection.classList.toggle(
      "hero-model-stack-bottom",
      placement === "modelBottom",
    );
    heroSection.classList.toggle("hero-model-stack-enabled", isStacked);

    if (isStacked) {
      heroSection.style.setProperty("--hero-model-text-gap", `${layoutGap}px`);
      heroSection.style.setProperty(
        "--hero-model-text-overlap",
        `${overlapGap}px`,
      );
    } else {
      heroSection.style.removeProperty("--hero-model-text-gap");
      heroSection.style.removeProperty("--hero-model-text-overlap");
    }

    if (heroVisual && isStacked) {
      heroVisual.style.setProperty("--hero-model-text-gap", `${layoutGap}px`);
      heroVisual.style.setProperty(
        "--hero-model-text-overlap",
        `${overlapGap}px`,
      );
    } else if (heroVisual) {
      heroVisual.style.removeProperty("--hero-model-text-gap");
      heroVisual.style.removeProperty("--hero-model-text-overlap");
    }

    applyMobileHeadlineFontSize(activeConfig);
  }

  // ── Scene / renderer ────────────────────────────────────────
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (err) {
    console.error("WebGL init failed:", err);
    setStatus("3D view is not supported in this browser.", "error");
    markModelUnavailable("3D animation unavailable. Opening page…");
  }

  if (renderer) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = USE_FLAT_COLOR_LIGHTING
      ? THREE.NoToneMapping
      : USE_TRUE_COLOR_LIGHTING
        ? THREE.NeutralToneMapping
        : THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = MODEL_EXPOSURE;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Environment (soft room IBL)
    const pmremGen = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGen.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    if ("environmentIntensity" in scene) {
      scene.environmentIntensity = MODEL_ENVIRONMENT_INTENSITY;
    }

    // ── Model hierarchy ────────────────────────────────────────
    const modelPivot = new THREE.Group();
    const spinAxis = new THREE.Group();
    const spinMotion = new THREE.Group();
    const spinCounter = new THREE.Group();
    const modelAnchor = new THREE.Group();
    const spinAxisQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(BASE_ROTATION_X, BASE_ROTATION_Y, BASE_ROTATION_Z),
    );
    const inverseSpinAxisQuaternion = spinAxisQuaternion.clone().invert();
    let modelRoot = null;
    let modelLoaded = false;
    let neutralModelBounds = null;
    let modelSourceMaxDim = 1;

    scene.add(modelPivot);
    modelPivot.add(spinAxis);
    spinAxis.add(spinMotion);
    spinMotion.add(spinCounter);
    spinCounter.add(modelAnchor);
    spinAxis.quaternion.copy(spinAxisQuaternion);
    spinCounter.quaternion.copy(inverseSpinAxisQuaternion);
    modelAnchor.rotation.set(
      MODEL_ROTATION_X,
      MODEL_ROTATION_Y,
      MODEL_ROTATION_Z,
    );

    // ── Lighting ─────────────────────────────────────────────
    // Hemisphere: sky = cool blue-white / ground = deep navy
    const hemiLight = new THREE.HemisphereLight(
      USE_TRUE_COLOR_LIGHTING ? 0xffffff : 0xd0e4ff,
      USE_TRUE_COLOR_LIGHTING ? 0x2a2a2a : 0x020a18,
      (USE_TRUE_COLOR_LIGHTING ? 0.8 : 1.8) * MODEL_BRIGHTNESS,
    );
    scene.add(hemiLight);

    // Key light — slightly warm white from upper-left front
    const keyLight = new THREE.DirectionalLight(
      0xffffff,
      (USE_TRUE_COLOR_LIGHTING ? 2.6 : 5.2) * MODEL_BRIGHTNESS,
    );
    keyLight.position.set(4.8, 7.0, 6.5);
    scene.add(keyLight);
    scene.add(keyLight.target);

    // Fill light — cool blue from the right
    const fillLight = new THREE.DirectionalLight(
      USE_TRUE_COLOR_LIGHTING ? 0xffffff : 0x8ab8ff,
      (USE_TRUE_COLOR_LIGHTING ? 0.65 : 2.2) * MODEL_BRIGHTNESS,
    );
    fillLight.position.set(-5.0, 3.0, 4.0);
    scene.add(fillLight);
    scene.add(fillLight.target);

    // Top light — pure white overhead sheen (makes the board face pop)
    const topLight = new THREE.DirectionalLight(
      0xffffff,
      (USE_TRUE_COLOR_LIGHTING ? 0.55 : 1.8) * MODEL_BRIGHTNESS,
    );
    topLight.position.set(0.4, 9.0, 2.0);
    scene.add(topLight);
    scene.add(topLight.target);

    // Rim light — electric-blue edge wrap from behind-left
    const rimLight = new THREE.PointLight(
      USE_TRUE_COLOR_LIGHTING ? 0xffffff : 0x3a7fff,
      (USE_TRUE_COLOR_LIGHTING ? 0.25 : 3.2) * MODEL_BRIGHTNESS,
      22,
      2,
    );
    rimLight.position.set(-2.0, 2.8, -3.0);
    scene.add(rimLight);

    // Bounce light — subtle blue-cool from below-front
    const bounceLight = new THREE.PointLight(
      USE_TRUE_COLOR_LIGHTING ? 0xffffff : 0x2255cc,
      (USE_TRUE_COLOR_LIGHTING ? 0.15 : 1.4) * MODEL_BRIGHTNESS,
      14,
      2,
    );
    bounceLight.position.set(0, -1.2, 2.6);
    scene.add(bounceLight);

    // Subtle front-fill so the visor-edge never goes pure-black
    const frontFill = new THREE.PointLight(
      USE_TRUE_COLOR_LIGHTING ? 0xffffff : 0xc8d8ff,
      (USE_TRUE_COLOR_LIGHTING ? 0.35 : 0.7) * MODEL_BRIGHTNESS,
      18,
      2,
    );
    frontFill.position.set(0, 0.5, 5.5);
    scene.add(frontFill);

    // ── State vars ───────────────────────────────────────────
    let targetScrollRotationY = 0;
    let currentScrollRotationY = 0;
    let animationFrameId = null;

    // Gentle idle float
    let floatTime = 0;
    const FLOAT_SPEED = 0.55;
    const FLOAT_AMP_Y = 0.006;
    const FLOAT_AMP_X = 0.003;

    // Intro
    let introStarted = false;
    let headlineIntroStarted = false;
    let turnTriggeredByHeadline = false;
    let wobbleStartTime = 0;
    let wobbleActive = false;
    const introTimers = [];
    let introCompleteTimerId = null;

    // ── Loader ───────────────────────────────────────────────
    setStatus("Loading 3D cap…", "loading");
    updateRendererSize();

    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        modelRoot = gltf.scene || gltf.scenes[0];
        if (!modelRoot) {
          setStatus("3D cap could not be displayed.", "error");
          markModelUnavailable("3D model unavailable. Opening page…");
          return;
        }

        modelRoot.traverse((child) => {
          if (!child.isMesh) return;
          child.castShadow = false;
          child.receiveShadow = false;
          child.frustumCulled = false;
          child.geometry.computeBoundingBox();

          if (USE_FLAT_COLOR_LIGHTING) {
            child.material = cloneFlatOriginalMaterial(child.material);
          }
        });

        neutralModelBounds = centerAndScaleModel(modelRoot);
        modelAnchor.add(modelRoot);
        positionCameraToFit(neutralModelBounds);

        modelLoaded = true;
        setStatus("3D cap ready.", "ready");
        markModelReady();
      },
      undefined,
      (err) => {
        console.error("Hero model load failed:", err);
        setStatus("3D cap failed to load.", "error");
        markModelUnavailable("3D model unavailable. Opening page…");
      },
    );

    // ── Resize ───────────────────────────────────────────────
    const resizeObserver =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(() => {
            updateRendererSize();
            if (modelLoaded && neutralModelBounds) {
              positionCameraToFit(neutralModelBounds);
            }
          })
        : null;

    if (resizeObserver) resizeObserver.observe(stage);
    else
      window.addEventListener(
        "resize",
        () => {
          updateRendererSize();
          if (modelLoaded && neutralModelBounds) {
            positionCameraToFit(neutralModelBounds);
          }
        },
        { passive: true },
      );

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // ── Render loop ──────────────────────────────────────────
    let lastTime = 0;
    function animate(now = 0) {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      maybeStartTurnFromHeadlineProximity();

      const intro = getIntroMotion(now);

      // Idle float (starts after intro)
      if (!wobbleActive && !introStarted) {
        floatTime += dt * FLOAT_SPEED;
      } else if (heroSection.classList.contains("hero-intro-complete")) {
        floatTime += dt * FLOAT_SPEED;
      }
      const floatY = Math.sin(floatTime) * FLOAT_AMP_Y;
      const floatX = Math.sin(floatTime * 0.67 + 1) * FLOAT_AMP_X;

      currentScrollRotationY +=
        (targetScrollRotationY - currentScrollRotationY) * ROTATION_DAMPING;
      modelAnchor.rotation.x = MODEL_ROTATION_X + floatX;
      modelAnchor.rotation.y = MODEL_ROTATION_Y + currentScrollRotationY;
      modelAnchor.rotation.z = MODEL_ROTATION_Z;
      spinMotion.rotation.set(intro.x, intro.y, intro.z);

      renderer.render(scene, camera);
    }
    animate();

    // ── Scroll parallax ──────────────────────────────────────
    function handleScroll() {
      const heroH = Math.max(heroSection.offsetHeight, window.innerHeight, 1);
      const progress = THREE.MathUtils.clamp(scrollY / (heroH * 1.2), 0, 1);
      targetScrollRotationY = progress * SCROLL_ROTATION_RANGE;
    }

    // ── Renderer sizing ──────────────────────────────────────
    function updateRendererSize() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    // ── Camera fit ───────────────────────────────────────────
    function positionCameraToFit(bounds) {
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const modelOffset = modelPivot.position;
      const actualMaxDim = Math.max(size.x, size.y, size.z) || 1;
      const frameMaxDim = isMobileViewport()
        ? MODEL_FRAME_REFERENCE_SIZE
        : Math.max(
            MODEL_FRAME_REFERENCE_SIZE,
            actualMaxDim / MODEL_VISIBLE_SCALE_LIMIT,
          );
      const frameScale = frameMaxDim / actualMaxDim;
      const frameSize = size.clone().multiplyScalar(frameScale);
      frameSize.x += Math.abs(modelOffset.x) * 2;
      frameSize.y += Math.abs(modelOffset.y) * 2;
      const verticalFov = THREE.MathUtils.degToRad(camera.fov);
      const horizontalFov =
        2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
      const fitHeightDist = frameSize.y / (2 * Math.tan(verticalFov / 2));
      const fitWidthDist = frameSize.x / (2 * Math.tan(horizontalFov / 2));
      const fitDepthDist = frameMaxDim / (2 * Math.tan(verticalFov / 2));
      const dist =
        Math.max(fitHeightDist, fitWidthDist, fitDepthDist) *
        MODEL_FRAME_PADDING;

      camera.near = Math.max(dist / 100, 0.01);
      camera.far = Math.max(dist * 20, dist + size.z * 4);

      camera.position.set(dist * 0.1, dist * 0.48, dist * 0.75);
      const verticalLookOffset = isMobileViewport() ? -0.16 : -0.08;
      camera.lookAt(
        center.x + size.x * 0.04,
        center.y + size.y * verticalLookOffset,
        center.z,
      );
      camera.updateProjectionMatrix();

      keyLight.target.position.copy(center);
      fillLight.target.position.copy(center);
      topLight.target.position.copy(center);
    }

    // ── Model centre + scale ─────────────────────────────────
    function centerAndScaleModel(obj) {
      const bb = new THREE.Box3().setFromObject(obj);
      const center = bb.getCenter(new THREE.Vector3());
      const size = bb.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      modelSourceMaxDim = maxDim;
      obj.position.sub(center);
      return applyActiveModelScale(obj);
    }

    function applyActiveModelScale(obj) {
      const scale = getActiveModelScaleTarget() / modelSourceMaxDim;
      obj.scale.setScalar(scale);

      // Slight re-centre after scale
      const bb2 = new THREE.Box3().setFromObject(obj);
      const sz2 = bb2.getSize(new THREE.Vector3());
      const ctr2 = bb2.getCenter(new THREE.Vector3());
      obj.position.sub(ctr2);
      modelPivot.position.set(
        sz2.x * MODEL_OFFSET_X,
        sz2.y * MODEL_OFFSET_Y,
        0,
      );

      return new THREE.Box3().setFromObject(obj);
    }

    function reapplyActiveModelScale() {
      if (!modelLoaded || !modelRoot) return;
      updateRendererSize();
      neutralModelBounds = applyActiveModelScale(modelRoot);
      positionCameraToFit(neutralModelBounds);
    }

    window.reapplySchoolHero3dModelScale = reapplyActiveModelScale;

    function cloneFlatOriginalMaterial(material) {
      if (Array.isArray(material)) {
        return material.map(cloneFlatOriginalMaterial);
      }

      if (!material) {
        return material;
      }

      const flatMaterial = new THREE.MeshBasicMaterial({
        color: material.color
          ? material.color.clone()
          : new THREE.Color(1, 1, 1),
        map: material.map || null,
        alphaMap: material.alphaMap || null,
        transparent: Boolean(material.transparent),
        opacity: Number.isFinite(material.opacity) ? material.opacity : 1,
        side: material.side,
        vertexColors: Boolean(material.vertexColors),
      });

      flatMaterial.name = material.name || "";
      flatMaterial.needsUpdate = true;
      return flatMaterial;
    }

    // ── Intro orchestration ──────────────────────────────────
    function startHeroIntro() {
      if (introStarted) return;
      if (reduceMotionQuery.matches) {
        revealHeroImmediately();
        return;
      }
      introStarted = true;

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          heroSection.classList.add("hero-cap-drop-in");

          introTimers.push(
            setTimeout(() => {
              heroSection.classList.add("hero-headline-in");
              headlineIntroStarted = true;
            }, CAP_DROP_DURATION_MS + HEADLINE_DELAY_MS),
          );
        }),
      );
    }
    startIntro = startHeroIntro;

    function maybeStartTurnFromHeadlineProximity() {
      if (!headlineIntroStarted || turnTriggeredByHeadline || !modelLoaded)
        return;

      const capRect = stage.getBoundingClientRect();
      if (!capRect.width || !capRect.height) return;

      const thresh = Math.max(
        Math.min(capRect.width, capRect.height) * 0.34,
        70,
      );
      const allNear = headlineLines.every(
        (line) => Math.abs(getCurrentTranslateX(line)) <= thresh,
      );

      if (allNear) {
        turnTriggeredByHeadline = true;
        wobbleStartTime = performance.now() + WOBBLE_DELAY_MS;
        wobbleActive = true;

        introCompleteTimerId = setTimeout(() => {
          heroSection.classList.add("hero-intro-complete");
        }, WOBBLE_DELAY_MS + WOBBLE_DURATION_MS);
      }
    }

    // Celebratory spin + wobble when headlines land
    function getIntroMotion(now) {
      if (!wobbleActive) return { x: 0, y: 0, z: 0 };
      const elapsed = now - wobbleStartTime;
      if (elapsed <= 0) return { x: 0, y: 0, z: 0 };

      const progress = elapsed / WOBBLE_DURATION_MS;
      if (progress >= 1) {
        wobbleActive = false;
        return { x: 0, y: 0, z: 0 };
      }

      const decay = Math.exp(-3.4 * progress);
      const spinProg = Math.min(elapsed / SPIN_DURATION_MS, 1);
      const spinEase = 1 - Math.pow(1 - spinProg, 3);
      const fullSpin = Math.PI * 2 * spinEase;
      const microRoll =
        Math.sin(progress * Math.PI * 7.6 + 0.35) * 0.013 * decay;
      const microPitch =
        Math.sin(progress * Math.PI * 9.2 + 0.9) * 0.011 * decay;
      const yawWobble =
        Math.sin(progress * Math.PI * 4.1 + 0.22) * 0.052 * decay;
      const pitchWobble =
        Math.sin(progress * Math.PI * 4.5 + 0.92) * 0.072 * decay + microPitch;
      const rollWobble =
        Math.sin(progress * Math.PI * 5.4) * 0.155 * decay + microRoll;

      return { x: pitchWobble, y: fullSpin + yawWobble, z: rollWobble };
    }

    function getCurrentTranslateX(el) {
      const t = getComputedStyle(el).transform;
      if (!t || t === "none") return 0;
      try {
        return new DOMMatrixReadOnly(t).m41;
      } catch {
        return 0;
      }
    }

    function markModelReady() {
      requestAnimationFrame(() => {
        renderer.render(scene, camera);
        modelReadyForReveal = true;
        setPreloaderStatus("Starting animation…");
        maybeRevealPageAndStartIntro();
      });
    }

    // ── Cleanup ──────────────────────────────────────────────
    window.addEventListener("beforeunload", () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      introTimers.forEach(clearTimeout);
      if (introCompleteTimerId) clearTimeout(introCompleteTimerId);
      if (preloadTimeoutId) clearTimeout(preloadTimeoutId);
      if (resizeObserver) resizeObserver.disconnect();
      envTarget.dispose();
      pmremGen.dispose();
      renderer.dispose();
    });
  }

  function setStatus(msg, state) {
    status.textContent = msg;
    stage.dataset.state = state;
  }
}
