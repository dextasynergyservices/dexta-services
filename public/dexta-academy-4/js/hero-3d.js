import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const heroSection = document.querySelector(".school-hero");
const stage = document.getElementById("hero-3d-stage");
const canvas = document.getElementById("hero-3d-canvas");
const status = document.getElementById("hero-3d-status");
const pagePreloader = document.getElementById("site-preloader");
const pagePreloaderStatus = document.getElementById("site-preloader-status");
const headlineLines = heroSection
  ? Array.from(heroSection.querySelectorAll(".hero-display span"))
  : [];

if (!heroSection || !stage || !canvas || !status || headlineLines.length < 2) {
  // Exit quietly if hero markup is absent on another page.
  document.body.classList.remove("is-preloading");
  document.body.classList.add("is-ready");
  if (pagePreloader) pagePreloader.classList.add("is-hidden");
} else {
  const DEFAULT_MODEL_URL = new URL("../assets/3d/gr.glb", import.meta.url)
    .href;
  const MODEL_URL = resolveHero3dModelUrl(
    window.schoolHero3dConfig?.model?.url,
  );
  const HERO_IMAGE_URL =
    "https://res.cloudinary.com/dxoorukfj/image/upload/v1777041124/ChatGPT_Image_Apr_24_2026_03_31_43_PM_ssnnin.png";
  const PRELOAD_TIMEOUT_MS =
    window.schoolHero3dConfig?.preloadTimeoutMs ?? 10000;

  // ── Cap orientation ─────────────────────────────────────────
  // X: negative = tip top face toward viewer (show the board properly)
  // Y: slight yaw so it reads as 3-D
  // Z: ZERO — no sideways lean (was the main visual bug before)
  const BASE_ROTATION_X =
    window.schoolHero3dConfig?.transform?.rotation?.x ?? -0.2;
  const BASE_ROTATION_Y =
    window.schoolHero3dConfig?.transform?.rotation?.y ?? -0.21;
  const BASE_ROTATION_Z =
    window.schoolHero3dConfig?.transform?.rotation?.z ?? 0.2;

  const MODEL_SCALE_TARGET = window.schoolHero3dConfig?.transform?.scale ?? 4.5;
  const SCROLL_ROTATION_RANGE = Math.PI * 0.04;
  const ROTATION_DAMPING = 0.06;

  // Intro timings
  const CAP_DROP_DURATION_MS = 1280;
  const HEADLINE_DELAY_MS = 90;
  const HEADLINE_DURATION_MS = 1520;
  const WOBBLE_DELAY_MS = 40;
  const SPIN_DURATION_MS = 1680;
  const WOBBLE_DURATION_MS = 2860;

  // ── Cap colours (deep navy, blue sheen) ──────────────────────
  const CAP_BODY_COLOR = new THREE.Color(
    window.schoolHero3dConfig?.materials?.capBodyColor || 0x060d1e,
  ); // deep navy-black
  const CAP_BODY_EMISSIVE = new THREE.Color(
    window.schoolHero3dConfig?.materials?.capBodyEmissiveColor || 0x010408,
  );
  const TASSEL_CORD_COLOR = new THREE.Color(
    window.schoolHero3dConfig?.materials?.tasselCordColor || 0x2a5fc0,
  ); // blue tassel
  const TASSEL_TIP_COLOR = new THREE.Color(
    window.schoolHero3dConfig?.materials?.tasselTipColor || 0x1a3d8a,
  );

  const reduceMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  let heroImageReady = false;
  let modelReadyForReveal = false;
  let modelUnavailable = false;
  let pageRevealed = false;
  let preloadTimeoutId = null;
  let startIntro = () => revealHeroImmediately();

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
    if (!modelReadyForReveal) setStatus("3D cap failed to load.", "error");
    heroImageReady = true;
    modelReadyForReveal = true;
    modelUnavailable = true;
    setPreloaderStatus("Opening page…");
    revealPageAndMaybeStartIntro(true);
  }, PRELOAD_TIMEOUT_MS);

  function resolveHero3dModelUrl(configuredValue) {
    const rawValue =
      configuredValue === null || configuredValue === undefined
        ? ""
        : String(configuredValue).trim();

    if (!rawValue) return DEFAULT_MODEL_URL;

    if (/^(https?:|blob:|data:)/i.test(rawValue)) return rawValue;

    try {
      return new URL(rawValue.replace(/^\.\//, ""), document.baseURI).href;
    } catch (error) {
      console.warn("[Dexta] Invalid configured 3D model URL:", rawValue, error);
      return rawValue;
    }
  }

  function getHero3dModelFallbackUrls(primaryUrl) {
    const urls = [];

    function addUrl(value) {
      if (!value || urls.includes(value)) return;
      urls.push(value);
    }

    function isCloudinaryRawModelUrl(value) {
      try {
        const url = new URL(value);
        return (
          url.protocol === "https:" &&
          url.hostname === "res.cloudinary.com" &&
          url.pathname.includes("/raw/upload/") &&
          /\.(glb|gltf)$/i.test(url.pathname)
        );
      } catch (error) {
        return false;
      }
    }

    function getProxyUrl(value) {
      return new URL(
        "/api/cloudinary/raw?url=" + encodeURIComponent(value),
        window.location.origin,
      ).href;
    }

    addUrl(primaryUrl);
    if (isCloudinaryRawModelUrl(primaryUrl)) addUrl(getProxyUrl(primaryUrl));
    addUrl(DEFAULT_MODEL_URL);

    return urls;
  }

  function loadHeroModelWithFallback(
    loader,
    primaryUrl,
    onLoad,
    onProgress,
    onError,
  ) {
    const urls = getHero3dModelFallbackUrls(primaryUrl);
    const timeoutMs =
      window.schoolHero3dConfig?.model?.attemptTimeoutMs ?? 12000;
    let activeAttempt = 0;
    let completed = false;

    function tryUrl(index, previousError) {
      if (completed) return;

      if (index >= urls.length) {
        completed = true;
        onError(previousError);
        return;
      }

      const url = urls[index];
      const attempt = ++activeAttempt;
      let timedOut = false;
      const timeoutId = window.setTimeout(() => {
        timedOut = true;
        console.warn("[Dexta] Hero 3D model load timed out:", url);
        tryUrl(index + 1, new Error("3D model load timed out: " + url));
      }, timeoutMs);

      if (index > 0) {
        setStatus("Loading fallback 3D cap...", "loading");
      }

      console.info("[Dexta] Loading hero 3D model:", url);

      loader.load(
        url,
        (gltf) => {
          if (completed || attempt !== activeAttempt) return;
          window.clearTimeout(timeoutId);
          completed = true;
          if (index > 0) {
            console.warn("[Dexta] Hero 3D model loaded from fallback:", url);
          }
          onLoad(gltf);
        },
        onProgress,
        (error) => {
          if (completed || attempt !== activeAttempt) return;
          window.clearTimeout(timeoutId);
          if (!timedOut) {
            console.warn("[Dexta] Hero 3D model load failed:", url, error);
            tryUrl(index + 1, error);
          }
        },
      );
    }

    tryUrl(0);
  }

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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Environment (soft room IBL)
    const pmremGen = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGen.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;

    // ── Model pivot hierarchy ──────────────────────────────────
    const modelPivot = new THREE.Group();
    const modelAnchor = new THREE.Group();
    let modelRoot = null;
    let modelLoaded = false;

    scene.add(modelPivot);
    modelPivot.add(modelAnchor);
    modelPivot.rotation.x = BASE_ROTATION_X;
    modelPivot.rotation.y = BASE_ROTATION_Y;
    modelPivot.rotation.z = BASE_ROTATION_Z;

    // ── Lighting ─────────────────────────────────────────────
    // Hemisphere: sky = cool blue-white / ground = deep navy
    const hemiLight = new THREE.HemisphereLight(0xd0e4ff, 0x020a18, 1.8);
    scene.add(hemiLight);

    // Key light — slightly warm white from upper-left front
    const keyLight = new THREE.DirectionalLight(0xffffff, 5.2);
    keyLight.position.set(4.8, 7.0, 6.5);
    scene.add(keyLight);
    scene.add(keyLight.target);

    // Fill light — cool blue from the right
    const fillLight = new THREE.DirectionalLight(0x8ab8ff, 2.2);
    fillLight.position.set(-5.0, 3.0, 4.0);
    scene.add(fillLight);
    scene.add(fillLight.target);

    // Top light — pure white overhead sheen (makes the board face pop)
    const topLight = new THREE.DirectionalLight(0xffffff, 1.8);
    topLight.position.set(0.4, 9.0, 2.0);
    scene.add(topLight);
    scene.add(topLight.target);

    // Rim light — electric-blue edge wrap from behind-left
    const rimLight = new THREE.PointLight(0x3a7fff, 3.2, 22, 2);
    rimLight.position.set(-2.0, 2.8, -3.0);
    scene.add(rimLight);

    // Bounce light — subtle blue-cool from below-front
    const bounceLight = new THREE.PointLight(0x2255cc, 1.4, 14, 2);
    bounceLight.position.set(0, -1.2, 2.6);
    scene.add(bounceLight);

    // Subtle front-fill so the visor-edge never goes pure-black
    const frontFill = new THREE.PointLight(0xc8d8ff, 0.7, 18, 2);
    frontFill.position.set(0, 0.5, 5.5);
    scene.add(frontFill);

    // ── State vars ───────────────────────────────────────────
    let targetRotationY = BASE_ROTATION_Y;
    let currentRotationY = BASE_ROTATION_Y;
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
    loadHeroModelWithFallback(
      loader,
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

          const bb = child.geometry.boundingBox;
          const sz = bb ? bb.getSize(new THREE.Vector3()) : new THREE.Vector3();
          const isTassel = sz.z > Math.max(sz.x, sz.y) * 2;

          const mats = Array.isArray(child.material)
            ? child.material
            : [child.material];

          mats.forEach((mat) => {
            if (!mat) return;

            // Environment map intensity
            if ("envMapIntensity" in mat)
              mat.envMapIntensity = mat.map ? 1.3 : 2.1;

            // Surface finish — matte-satin cap board
            if ("roughness" in mat) mat.roughness = mat.map ? 0.68 : 0.4;
            if ("metalness" in mat) mat.metalness = mat.map ? 0.06 : 0.14;

            // Colour assignment
            const isWarm =
              mat.color &&
              mat.color.r > 0.4 &&
              mat.color.g > 0.12 &&
              mat.color.g < 0.5 &&
              mat.color.b < 0.14;

            if (isTassel && isWarm) {
              // Tassel → school blue
              if (mat.color) mat.color.copy(TASSEL_CORD_COLOR);
              if (mat.emissive) {
                mat.emissive.set(0x071428);
                mat.emissiveIntensity = 0.1;
              }
            } else {
              // Cap body → deep navy-black
              if (mat.color) mat.color.copy(CAP_BODY_COLOR);
              if (mat.emissive) {
                mat.emissive.copy(CAP_BODY_EMISSIVE);
                mat.emissiveIntensity = mat.map ? 0.07 : 0.09;
              }
            }

            mat.needsUpdate = true;
          });
        });

        modelAnchor.add(modelRoot);
        centerAndScaleModel(modelRoot);
        positionCameraToFit(modelPivot);

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
            if (modelLoaded) positionCameraToFit(modelPivot);
          })
        : null;

    if (resizeObserver) resizeObserver.observe(stage);
    else
      window.addEventListener(
        "resize",
        () => {
          updateRendererSize();
          if (modelLoaded) positionCameraToFit(modelPivot);
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

      currentRotationY +=
        (targetRotationY - currentRotationY) * ROTATION_DAMPING;

      modelPivot.rotation.x = BASE_ROTATION_X + intro.x + floatX;
      modelPivot.rotation.y = currentRotationY + intro.y;
      modelPivot.rotation.z = BASE_ROTATION_Z + intro.z;

      renderer.render(scene, camera);
    }
    animate();

    // ── Scroll parallax ──────────────────────────────────────
    function handleScroll() {
      const heroH = Math.max(heroSection.offsetHeight, window.innerHeight, 1);
      const progress = THREE.MathUtils.clamp(scrollY / (heroH * 1.2), 0, 1);
      targetRotationY = BASE_ROTATION_Y + progress * SCROLL_ROTATION_RANGE;
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
    function positionCameraToFit(object) {
      const bb = new THREE.Box3().setFromObject(object);
      const size = bb.getSize(new THREE.Vector3());
      const center = bb.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const dist = (maxDim / (2 * Math.tan(fov / 2))) * 1.05;

      camera.near = Math.max(dist / 100, 0.01);
      camera.far = dist * 20;

      // Slightly elevated, centered — no extreme side-angle
      camera.position.set(
        dist * 0.1, // just a hint of left-right
        dist * 0.48, // elevated to see the top face
        dist * 0.75, // pulled back enough to frame it
      );
      camera.lookAt(
        center.x + size.x * 0.04,
        center.y - size.y * 0.08,
        center.z,
      );
      camera.updateProjectionMatrix();

      // Point lights track the cap center
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
      const scale = MODEL_SCALE_TARGET / maxDim;

      obj.position.sub(center);
      obj.scale.setScalar(scale);

      // Slight re-centre after scale
      const bb2 = new THREE.Box3().setFromObject(obj);
      const sz2 = bb2.getSize(new THREE.Vector3());
      const ctr2 = bb2.getCenter(new THREE.Vector3());
      obj.position.sub(ctr2);
      obj.position.x +=
        sz2.x * (window.schoolHero3dConfig?.transform?.offset?.x ?? 0.1);
      obj.position.y -=
        sz2.y *
        Math.abs(window.schoolHero3dConfig?.transform?.offset?.y ?? -0.18);
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
