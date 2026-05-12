const body = document.body;
const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.getElementById("site-nav");
const scrollTriggers = document.querySelectorAll("[data-scroll-target]");
const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const admissionModal = document.querySelector("[data-admission-modal]");
const admissionModalTriggers = document.querySelectorAll("[data-admission-modal-open]");
const admissionModalCloseButtons = document.querySelectorAll("[data-admission-modal-close]");
const contactModal = document.querySelector("[data-contact-modal]");
const contactModalTriggers = document.querySelectorAll("[data-contact-modal-open]");
const contactModalCloseButtons = document.querySelectorAll("[data-contact-modal-close]");
const imageModal = document.querySelector("[data-image-modal]");
const imageModalImage = imageModal?.querySelector("[data-image-modal-image]");
const imageModalCaption = imageModal?.querySelector("[data-image-modal-caption]");
const imageModalTriggers = document.querySelectorAll("[data-image-modal-open]");
const imageModalCloseButtons = document.querySelectorAll("[data-image-modal-close]");
const storyModal = document.querySelector("[data-story-modal]");
const storyModalTriggers = document.querySelectorAll("[data-story-modal-open]");
const storyModalCloseButtons = document.querySelectorAll("[data-story-modal-close]");
const scrollRevealTargets = document.querySelectorAll(
  [
    ".about-preview__content",
    ".about-preview__media",
    ".section-heading",
    ".programme-card",
    ".section-action",
    ".approach-section__content",
    ".approach-section__media",
    ".testimonial-card",
    ".testimonial-dots",
    ".journey-card",
    ".site-footer__grid > div",
    ".site-footer__bottom",
    ".page-hero__content",
    ".page-hero__media",
    ".page-hero__stack",
    ".page-stat",
    ".split-feature > *",
    ".value-card",
    ".gallery-card",
    ".campus-feature-grid article",
    ".campus-list li",
    ".contact-panel article",
    ".contact-form-panel",
  ].join(",")
);
let lastFocusedElement = null;

const closeMenu = () => {
  body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
};

navToggle?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

const scrollToTarget = (targetSelector) => {
  const target = document.querySelector(targetSelector);

  if (!target) {
    return;
  }

  target.scrollIntoView({ block: "start" });
};

const setupScrollReveal = () => {
  const directions = ["up", "left", "right"];

  scrollRevealTargets.forEach((element, index) => {
    element.classList.add("scroll-reveal");
    element.dataset.revealDirection = directions[index % directions.length];
    element.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
  });

  if (!("IntersectionObserver" in window)) {
    scrollRevealTargets.forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.16,
    }
  );

  scrollRevealTargets.forEach((element) => {
    revealObserver.observe(element);
  });
};

const openAdmissionModal = () => {
  if (!admissionModal) {
    return;
  }

  lastFocusedElement = document.activeElement;
  body.classList.add("modal-open");
  admissionModal.classList.add("is-open");
  admissionModal.setAttribute("aria-hidden", "false");
  closeMenu();

  const closeButton = admissionModal.querySelector("[data-admission-modal-close]");
  closeButton?.focus({ preventScroll: true });
};

const closeAdmissionModal = () => {
  if (!admissionModal || !admissionModal.classList.contains("is-open")) {
    return;
  }

  body.classList.remove("modal-open");
  admissionModal.classList.remove("is-open");
  admissionModal.setAttribute("aria-hidden", "true");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus({ preventScroll: true });
  }
};

const openContactModal = () => {
  if (!contactModal) {
    return;
  }

  lastFocusedElement = document.activeElement;
  body.classList.add("modal-open");
  contactModal.classList.add("is-open");
  contactModal.setAttribute("aria-hidden", "false");
  closeMenu();

  const closeButton = contactModal.querySelector("[data-contact-modal-close]");
  closeButton?.focus({ preventScroll: true });
};

const closeContactModal = () => {
  if (!contactModal || !contactModal.classList.contains("is-open")) {
    return;
  }

  body.classList.remove("modal-open");
  contactModal.classList.remove("is-open");
  contactModal.setAttribute("aria-hidden", "true");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus({ preventScroll: true });
  }
};

const openImageModal = (trigger) => {
  if (!imageModal || !imageModalImage || !imageModalCaption) {
    return;
  }

  const image = trigger.querySelector("img");
  const title = trigger.querySelector("h2")?.textContent.trim() || image?.alt || "Gallery image";
  const imageSource = trigger.getAttribute("href") || image?.currentSrc || image?.src;

  if (!imageSource) {
    return;
  }

  lastFocusedElement = document.activeElement;
  imageModalImage.src = imageSource;
  imageModalImage.alt = image?.alt || title;
  imageModalCaption.textContent = title;
  body.classList.add("modal-open");
  imageModal.classList.add("is-open");
  imageModal.setAttribute("aria-hidden", "false");
  closeMenu();

  const closeButton = imageModal.querySelector("[data-image-modal-close]");
  closeButton?.focus({ preventScroll: true });
};

const closeImageModal = () => {
  if (!imageModal || !imageModal.classList.contains("is-open")) {
    return;
  }

  body.classList.remove("modal-open");
  imageModal.classList.remove("is-open");
  imageModal.setAttribute("aria-hidden", "true");

  if (imageModalImage) {
    imageModalImage.src = "";
    imageModalImage.alt = "";
  }

  if (imageModalCaption) {
    imageModalCaption.textContent = "";
  }

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus({ preventScroll: true });
  }
};

const openStoryModal = () => {
  if (!storyModal) {
    return;
  }

  lastFocusedElement = document.activeElement;
  body.classList.add("modal-open");
  storyModal.classList.add("is-open");
  storyModal.setAttribute("aria-hidden", "false");
  closeMenu();

  const closeButton = storyModal.querySelector(".admission-modal__close[data-story-modal-close]");
  closeButton?.focus({ preventScroll: true });
};

const closeStoryModal = () => {
  if (!storyModal || !storyModal.classList.contains("is-open")) {
    return;
  }

  body.classList.remove("modal-open");
  storyModal.classList.remove("is-open");
  storyModal.setAttribute("aria-hidden", "true");

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus({ preventScroll: true });
  }
};

scrollTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const targetSelector = trigger.getAttribute("data-scroll-target");

    if (targetSelector) {
      scrollToTarget(targetSelector);
    }
  });
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (link.hasAttribute("data-admission-modal-open")) {
      return;
    }

    const href = link.getAttribute("href");

    if (!href || !href.startsWith("#")) {
      return;
    }

    event.preventDefault();

    const target = document.querySelector(href);

    if (!target) {
      closeMenu();
      return;
    }

    scrollToTarget(href);
    closeMenu();
  });
});

admissionModalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openAdmissionModal();
  });
});

admissionModalCloseButtons.forEach((button) => {
  button.addEventListener("click", closeAdmissionModal);
});

contactModalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openContactModal();
  });
});

contactModalCloseButtons.forEach((button) => {
  button.addEventListener("click", closeContactModal);
});

imageModalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openImageModal(trigger);
  });
});

imageModalCloseButtons.forEach((button) => {
  button.addEventListener("click", closeImageModal);
});

storyModalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openStoryModal();
  });
});

storyModalCloseButtons.forEach((button) => {
  button.addEventListener("click", closeStoryModal);
});

setupScrollReveal();

window.addEventListener("resize", () => {
  if (window.innerWidth > 920) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    closeAdmissionModal();
    closeContactModal();
    closeImageModal();
    closeStoryModal();
  }
});

document.addEventListener("click", (event) => {
  if (!body.classList.contains("nav-open")) {
    return;
  }

  const target = event.target;

  if (
    target instanceof Node &&
    !siteNav?.contains(target) &&
    !navToggle?.contains(target)
  ) {
    closeMenu();
  }
});
