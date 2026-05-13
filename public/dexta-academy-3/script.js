const testimonials = [
  {
    quote:
      "Our daughter settled in quickly, and now every school day starts with excitement instead of tears.",
    author: "Mrs. Chidinma Obi, Parent",
    image:
      "https://res.cloudinary.com/demo/image/fetch/f_auto,q_auto,w_900,h_780,c_fill,g_auto/https://images.unsplash.com/photo-1761208662734-fb46f1398551",
    alt: "Teacher guiding pupils in a classroom",
    preview:
      "Warm teachers, quick feedback, and a learning environment our family trusts.",
  },
  {
    quote:
      "The school keeps parents close to the journey. We always know what our son is learning and how to support him.",
    author: "Mr. and Mrs. Adeyemi, Parents",
    image:
      "https://res.cloudinary.com/demo/image/fetch/f_auto,q_auto,w_900,h_780,c_fill,g_auto/https://images.unsplash.com/photo-1755718669459-a8691dd613de",
    alt: "Teacher speaking near a classroom whiteboard",
    preview:
      "Strong communication and steady progress updates make a real difference.",
  },
  {
    quote:
      "DXT Academy blends structure with joy. Our child is reading more confidently and comes home eager to share.",
    author: "Mrs. Boma Eze, Parent",
    image:
      "https://res.cloudinary.com/demo/image/fetch/f_auto,q_auto,w_900,h_780,c_fill,g_auto/https://images.unsplash.com/photo-1473649085228-583485e6e4d7",
    alt: "Children sitting together inside a classroom",
    preview:
      "The balance of literacy, confidence, and care is exactly what we hoped for.",
  },
];

function createPageLoader() {
  if (!document.body) {
    return null;
  }

  const loader = document.createElement("div");
  loader.id = "page-loader";
  loader.className = "page-loader";
  loader.setAttribute("role", "status");
  loader.setAttribute("aria-live", "polite");

  loader.innerHTML = `
    <div class="page-loader__inner">
      <div class="page-loader__halo" aria-hidden="true"></div>
      <span class="page-loader__crest brand__crest" aria-hidden="true">
        <span class="brand__crest-inner"></span>
      </span>
      <div class="page-loader__track" aria-hidden="true">
        <span class="page-loader__bar"></span>
      </div>
    </div>
  `;

  document.body.prepend(loader);
  return loader;
}

const body = document.body;
const isHomePage = body?.classList.contains("home-page");
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const pageLoader = isHomePage
  ? document.getElementById("page-loader") || createPageLoader()
  : document.getElementById("page-loader");
const testimonialQuote = document.getElementById("testimonial-quote");
const testimonialAuthor = document.getElementById("testimonial-author");
const testimonialImage = document.getElementById("testimonial-image");
const testimonialThumbs = document.getElementById("testimonial-thumbs");
const prevButton = document.getElementById("testimonial-prev");
const nextButton = document.getElementById("testimonial-next");
const currentYear = document.getElementById("current-year");
const demoForms = document.querySelectorAll("[data-demo-form]");
const galleryFilterButtons = document.querySelectorAll("[data-gallery-filter]");
const galleryItems = document.querySelectorAll("[data-gallery-item]");
const galleryPagination = document.getElementById("gallery-pagination");
const scrollRevealSections = document.querySelectorAll("[data-scroll-reveal]");
const admissionModal = document.getElementById("admission-modal");
const admissionOpenButtons = document.querySelectorAll(
  "[data-admission-modal-open]",
);
const admissionCloseButtons = document.querySelectorAll(
  "[data-admission-modal-close]",
);
const storyModal = document.getElementById("story-modal");
const storyOpenButtons = document.querySelectorAll("[data-story-modal-open]");
const storyCloseButtons = document.querySelectorAll("[data-story-modal-close]");

const shouldUseLoader = Boolean(body && pageLoader && isHomePage);
const shouldResetScroll = !window.location.hash;
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const loaderStartedAt = performance.now();
const minimumLoaderDuration = 2200;
const loaderSlideDuration = 1600;
const galleryItemsPerPage = 9;

let activeTestimonial = 0;
let activeGalleryFilter = "all";
let activeGalleryPage = 1;
let hasRevealedPage = false;
let lastFocusedGalleryItem = null;
let lastFocusedAdmissionTrigger = null;

function resetScrollPosition() {
  if (!shouldResetScroll) {
    return;
  }

  window.scrollTo(0, 0);
}

function revealPage() {
  if (!shouldUseLoader || hasRevealedPage || !body) {
    return;
  }

  hasRevealedPage = true;

  const elapsed = performance.now() - loaderStartedAt;
  const remaining = Math.max(0, minimumLoaderDuration - elapsed);

  window.setTimeout(() => {
    const startPageAnimations = () => {
      if (!body.classList.contains("is-animated")) {
        body.classList.add("is-animated");
      }
    };

    const shouldStartAnimationsNow = prefersReducedMotion || !pageLoader;

    if (!shouldStartAnimationsNow) {
      const handleLoaderSlideEnd = (event) => {
        if (event.target !== pageLoader || event.propertyName !== "transform") {
          return;
        }

        startPageAnimations();
      };

      pageLoader.addEventListener("transitionend", handleLoaderSlideEnd, {
        once: true,
      });

      window.setTimeout(startPageAnimations, loaderSlideDuration + 100);
    }

    resetScrollPosition();
    body.classList.add("is-ready");
    pageLoader?.setAttribute("aria-hidden", "true");

    if (shouldStartAnimationsNow) {
      startPageAnimations();
    }
  }, remaining);
}

function revealScrollSection(section) {
  section.classList.add("is-revealed");
}

function setupScrollReveals() {
  if (!scrollRevealSections.length) {
    return;
  }

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    scrollRevealSections.forEach(revealScrollSection);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        revealScrollSection(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -12% 0px",
    },
  );

  scrollRevealSections.forEach((section) => {
    observer.observe(section);
  });
}

function setHeaderState(isOpen) {
  if (!header || !navToggle) {
    return;
  }

  header.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.textContent = isOpen ? "Close" : "Menu";
}

function getAdmissionModalFocusableElements() {
  if (!admissionModal) {
    return [];
  }

  return Array.from(
    admissionModal.querySelectorAll(
      'a[href], button:not([disabled]), iframe, input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.getAttribute("aria-hidden") !== "true");
}

function setAdmissionModalState(isOpen) {
  if (!admissionModal || !body) {
    return;
  }

  if (isOpen && !admissionModal.hidden) {
    return;
  }

  if (!isOpen && admissionModal.hidden) {
    return;
  }

  if (isOpen) {
    const activeElement = document.activeElement;
    lastFocusedAdmissionTrigger =
      activeElement instanceof HTMLElement && activeElement !== body
        ? activeElement
        : null;

    admissionModal.hidden = false;
    body.classList.add("is-admission-modal-open");
    setHeaderState(false);

    window.setTimeout(() => {
      const closeButton = admissionModal.querySelector(
        ".admission-modal__close",
      );
      const focusTarget =
        closeButton || getAdmissionModalFocusableElements()[0];
      focusTarget?.focus();
    }, 0);

    return;
  }

  admissionModal.hidden = true;
  body.classList.remove("is-admission-modal-open");

  if (
    lastFocusedAdmissionTrigger &&
    document.contains(lastFocusedAdmissionTrigger)
  ) {
    lastFocusedAdmissionTrigger.focus();
  }

  lastFocusedAdmissionTrigger = null;
}

function handleAdmissionModalKeydown(event) {
  if (!admissionModal || admissionModal.hidden) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    setAdmissionModalState(false);
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusableElements = getAdmissionModalFocusableElements();

  if (!focusableElements.length) {
    event.preventDefault();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (!admissionModal.contains(document.activeElement)) {
    event.preventDefault();
    firstElement.focus();
    return;
  }

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function getStoryModalFocusableElements() {
  if (!storyModal) {
    return [];
  }

  return Array.from(
    storyModal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function setStoryModalState(isOpen) {
  if (!storyModal || !body) {
    return;
  }

  if (isOpen && !storyModal.hidden) {
    return;
  }

  if (!isOpen && storyModal.hidden) {
    return;
  }

  if (isOpen) {
    storyModal.hidden = false;
    body.classList.add("is-story-modal-open");

    requestAnimationFrame(() => {
      const closeButton = storyModal.querySelector(".story-modal__close");
      const focusTarget = closeButton || getStoryModalFocusableElements()[0];
      focusTarget?.focus();
    });
  } else {
    storyModal.hidden = true;
    body.classList.remove("is-story-modal-open");
  }
}

function handleStoryModalKeydown(event) {
  if (!storyModal || storyModal.hidden) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    setStoryModalState(false);
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const focusableElements = getStoryModalFocusableElements();

  if (!focusableElements.length) {
    event.preventDefault();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (!storyModal.contains(document.activeElement)) {
    event.preventDefault();
    firstElement.focus();
    return;
  }

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function getFilteredGalleryItems() {
  return Array.from(galleryItems).filter((item) => {
    const categories = item.dataset.galleryItem.split(" ");
    return (
      activeGalleryFilter === "all" || categories.includes(activeGalleryFilter)
    );
  });
}

function createGalleryPaginationButton(label, page, options = {}) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "gallery-pagination__button";
  button.textContent = label;

  if (options.label) {
    button.setAttribute("aria-label", options.label);
  }

  if (options.current) {
    button.setAttribute("aria-current", "page");
  }

  button.disabled = Boolean(options.disabled);

  button.addEventListener("click", () => {
    if (button.disabled || activeGalleryPage === page) {
      return;
    }

    activeGalleryPage = page;
    updateGalleryDisplay({ shouldScroll: true });
  });

  return button;
}

function renderGalleryPagination(totalPages) {
  if (!galleryPagination) {
    return;
  }

  galleryPagination.replaceChildren();
  galleryPagination.hidden = false;

  const previousButton = createGalleryPaginationButton(
    "Previous",
    Math.max(1, activeGalleryPage - 1),
    {
      disabled: activeGalleryPage === 1,
      label: "Go to previous gallery page",
    },
  );

  galleryPagination.appendChild(previousButton);

  for (let page = 1; page <= totalPages; page += 1) {
    galleryPagination.appendChild(
      createGalleryPaginationButton(String(page), page, {
        current: page === activeGalleryPage,
        label: `Go to gallery page ${page}`,
      }),
    );
  }

  const nextButton = createGalleryPaginationButton(
    "Next",
    Math.min(totalPages, activeGalleryPage + 1),
    {
      disabled: activeGalleryPage === totalPages,
      label: "Go to next gallery page",
    },
  );

  const status = document.createElement("span");
  status.className = "gallery-pagination__status";
  status.textContent = `Page ${activeGalleryPage} of ${totalPages}`;

  galleryPagination.append(nextButton, status);
}

function updateGalleryDisplay(options = {}) {
  if (!galleryItems.length) {
    return;
  }

  const filteredItems = getFilteredGalleryItems();
  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / galleryItemsPerPage),
  );

  activeGalleryPage = Math.min(activeGalleryPage, totalPages);

  const pageStart = (activeGalleryPage - 1) * galleryItemsPerPage;
  const pageItems = new Set(
    filteredItems.slice(pageStart, pageStart + galleryItemsPerPage),
  );

  galleryItems.forEach((item) => {
    item.hidden = !pageItems.has(item);
  });

  renderGalleryPagination(totalPages);

  if (options.shouldScroll) {
    document.getElementById("gallery-grid")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }
}

function setupGalleryFilters() {
  if (!galleryItems.length) {
    return;
  }

  galleryFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeGalleryFilter = button.dataset.galleryFilter || "all";
      activeGalleryPage = 1;

      galleryFilterButtons.forEach((chip) => {
        const isActive = chip === button;
        chip.classList.toggle("is-active", isActive);
        chip.setAttribute("aria-pressed", String(isActive));
      });

      updateGalleryDisplay();
    });
  });

  updateGalleryDisplay();
}

function setupGalleryLightbox() {
  if (!galleryItems.length || !body) {
    return;
  }

  const lightbox = document.createElement("div");
  lightbox.className = "gallery-lightbox";
  lightbox.hidden = true;
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Gallery image viewer");
  lightbox.innerHTML = `
    <button class="gallery-lightbox__close" type="button" aria-label="Close image viewer">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </svg>
    </button>
    <figure class="gallery-lightbox__frame">
      <img alt="" />
      <figcaption></figcaption>
    </figure>
  `;

  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector("figcaption");
  const closeButton = lightbox.querySelector(".gallery-lightbox__close");

  const closeLightbox = () => {
    lightbox.hidden = true;
    body.classList.remove("is-gallery-lightbox-open");
    lightboxImage.removeAttribute("src");
    lastFocusedGalleryItem?.focus();
  };

  const openLightbox = (item) => {
    const image = item.querySelector("img");

    if (!image || !lightboxImage || !lightboxCaption) {
      return;
    }

    lastFocusedGalleryItem = item;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = image.alt;
    lightbox.hidden = false;
    body.classList.add("is-gallery-lightbox-open");
    closeButton?.focus();
  };

  galleryItems.forEach((item) => {
    const image = item.querySelector("img");

    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute(
      "aria-label",
      image?.alt ? `View photo: ${image.alt}` : "View gallery photo",
    );

    item.addEventListener("click", () => openLightbox(item));
    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      openLightbox(item);
    });
  });

  closeButton?.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
}

function renderTestimonial(index) {
  if (
    !testimonialQuote ||
    !testimonialAuthor ||
    !testimonialImage ||
    !testimonialThumbs
  ) {
    return;
  }

  const item = testimonials[index];
  activeTestimonial = index;

  testimonialQuote.textContent = item.quote;
  testimonialAuthor.textContent = item.author;
  testimonialImage.src = item.image;
  testimonialImage.alt = item.alt;

  const thumbButtons = testimonialThumbs.querySelectorAll(".testimonial-thumb");
  thumbButtons.forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === activeTestimonial);
    button.setAttribute(
      "aria-pressed",
      String(buttonIndex === activeTestimonial),
    );
  });
}

function createTestimonialThumbs() {
  if (!testimonialThumbs) {
    return;
  }

  testimonials.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "testimonial-thumb";
    button.setAttribute("aria-label", `Show testimonial from ${item.author}`);
    button.innerHTML = `
      <img src="${item.image}" alt="" />
      <div class="testimonial-thumb__copy">
        <strong>${item.author}</strong>
        <span>${item.preview}</span>
      </div>
    `;

    button.addEventListener("click", () => renderTestimonial(index));
    testimonialThumbs.appendChild(button);
  });
}

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  setHeaderState(!isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setHeaderState(false));
});

admissionOpenButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    setAdmissionModalState(true);
  });
});

admissionCloseButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    setAdmissionModalState(false);
  });
});

storyOpenButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    setStoryModalState(true);
  });
});

storyCloseButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    setStoryModalState(false);
  });
});

// Close story modal when clicking on backdrop
if (storyModal) {
  storyModal.addEventListener("click", (event) => {
    if (
      event.target === storyModal ||
      event.target.classList.contains("story-modal__backdrop")
    ) {
      setStoryModalState(false);
    }
  });
}

document.addEventListener("keydown", handleAdmissionModalKeydown);
document.addEventListener("keydown", handleStoryModalKeydown);

if (window.location.hash === "#admission") {
  setAdmissionModalState(true);
}

prevButton?.addEventListener("click", () => {
  const nextIndex =
    (activeTestimonial - 1 + testimonials.length) % testimonials.length;
  renderTestimonial(nextIndex);
});

nextButton?.addEventListener("click", () => {
  const nextIndex = (activeTestimonial + 1) % testimonials.length;
  renderTestimonial(nextIndex);
});

demoForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const fields = form.querySelectorAll("input, select, textarea, button");
    const successLabel =
      submitButton?.dataset.successLabel || "Thanks! We will reach out";

    if (submitButton) {
      submitButton.textContent = successLabel;
    }

    fields.forEach((field) => {
      field.disabled = true;
    });
  });
});

if (
  testimonialQuote &&
  testimonialAuthor &&
  testimonialImage &&
  testimonialThumbs &&
  prevButton &&
  nextButton
) {
  createTestimonialThumbs();
  renderTestimonial(activeTestimonial);
}

setupGalleryFilters();
setupGalleryLightbox();

if (shouldUseLoader) {
  resetScrollPosition();

  if (document.readyState === "complete") {
    revealPage();
  } else {
    window.addEventListener("load", revealPage, { once: true });
  }

  window.addEventListener("pageshow", revealPage, { once: true });
} else if (body) {
  body.classList.add("is-ready");
}

setupScrollReveals();

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}
