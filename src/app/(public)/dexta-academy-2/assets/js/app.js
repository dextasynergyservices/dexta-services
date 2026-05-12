const navigationItems = [
  { href: "index.html", label: "Home", key: "home" },
  { href: "about.html", label: "About Us", key: "about" },
  { href: "academics.html", label: "Academics", key: "academics" },
  { href: "admissions.html", label: "Admissions", key: "admissions" },
  { href: "student-life.html", label: "Student Life", key: "student-life" },
  { href: "gallery.html", label: "Gallery", key: "gallery" },
  // { href: "news.html", label: "News & Events", key: "news" },
  { href: "contact.html", label: "Contact", key: "contact" },
];

const admissionFormUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSdSXga8Z8UfldowUxZDw8b_fylxfQThhZqiuZUZnWtKWRBeSQ/viewform?embedded=true";

function icon(name) {
  const icons = {
    menu: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7H20"></path>
        <path d="M4 12H20"></path>
        <path d="M4 17H20"></path>
      </svg>
    `,
    close: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6L18 18"></path>
        <path d="M18 6L6 18"></path>
      </svg>
    `,
    arrow: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12H19"></path>
        <path d="M13 6L19 12L13 18"></path>
      </svg>
    `,
    play: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 7L17 12L9 17Z" fill="currentColor" stroke="none"></path>
      </svg>
    `,
    shield: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 6L50 13V29C50 41 43 50 32 56C21 50 14 41 14 29V13L32 6Z"></path>
        <path d="M32 15V45"></path>
        <path d="M22 28C27 27 30 23 32 18C34 23 37 27 42 28"></path>
        <path d="M22 37C27 36 30 32 32 27C34 32 37 36 42 37"></path>
      </svg>
    `,
    cap: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10L12 5L21 10L12 15L3 10Z"></path>
        <path d="M7 12V16C7 17.8 9.2 19 12 19C14.8 19 17 17.8 17 16V12"></path>
      </svg>
    `,
    people: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="8" cy="9" r="3"></circle>
        <circle cx="16.5" cy="8.5" r="2.5"></circle>
        <path d="M3 19C3.8 15.8 6 14 8.8 14H10.2C13 14 15.2 15.8 16 19"></path>
        <path d="M14.5 14.8C16.5 15.3 18 16.7 18.7 19"></path>
      </svg>
    `,
    book: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.5 5.5H10.5C11.9 5.5 13 6.6 13 8V18.5H7.5C5.8 18.5 4.5 17.2 4.5 15.5V5.5Z"></path>
        <path d="M19.5 5.5H13.5C12.1 5.5 11 6.6 11 8V18.5H16.5C18.2 18.5 19.5 17.2 19.5 15.5V5.5Z"></path>
      </svg>
    `,
    trophy: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5H16V8C16 10.2 14.2 12 12 12C9.8 12 8 10.2 8 8V5Z"></path>
        <path d="M6 6H4C4 8.8 5.6 10.8 8 11"></path>
        <path d="M18 6H20C20 8.8 18.4 10.8 16 11"></path>
        <path d="M12 12V16"></path>
        <path d="M9 19H15"></path>
      </svg>
    `,
    integrity: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3L19 6V11C19 15.4 16.4 19.4 12 21C7.6 19.4 5 15.4 5 11V6L12 3Z"></path>
        <path d="M9.5 12L11.2 13.7L14.8 10.1"></path>
      </svg>
    `,
    excellence: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.5"></circle>
        <path d="M6 20C6 16.9 8.7 14.5 12 14.5C15.3 14.5 18 16.9 18 20"></path>
      </svg>
    `,
    respect: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20S4 15 4 9.5C4 6.9 6 5 8.4 5C10.1 5 11.4 5.8 12 7C12.6 5.8 13.9 5 15.6 5C18 5 20 6.9 20 9.5C20 15 12 20 12 20Z"></path>
      </svg>
    `,
    responsibility: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4V20"></path>
        <path d="M12 12C12 9 9.8 6.5 7 6"></path>
        <path d="M12 12C12 9 14.2 6.5 17 6"></path>
        <path d="M12 16C9 16 6.5 18 6 20"></path>
        <path d="M12 16C15 16 17.5 18 18 20"></path>
      </svg>
    `,
    stem: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 4H14"></path>
        <path d="M11 4V10L6.5 18.5C5.9 19.6 6.7 21 8 21H16C17.3 21 18.1 19.6 17.5 18.5L13 10V4"></path>
        <path d="M9 14H15"></path>
      </svg>
    `,
    arts: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 19C8 19 5 16.3 5 12.8C5 8.9 8 5 12.2 5C15.1 5 17 6.6 17 8.8C17 10.7 15.6 12 13.9 12C12.6 12 11.8 11.1 11.8 9.9C11.8 8.7 12.7 8 13.7 8"></path>
        <circle cx="8.5" cy="10" r="1"></circle>
        <circle cx="8" cy="13.5" r="1"></circle>
        <circle cx="10.5" cy="16" r="1"></circle>
      </svg>
    `,
    sport: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3C15.7 3 18.8 6 18.8 9.8C18.8 13.6 15.7 16.7 12 16.7C8.3 16.7 5.2 13.6 5.2 9.8C5.2 6 8.3 3 12 3Z"></path>
        <path d="M8 5.5L10 9.8L8.2 14"></path>
        <path d="M16 5.5L14 9.8L15.8 14"></path>
        <path d="M6.1 8H10"></path>
        <path d="M14 8H17.9"></path>
      </svg>
    `,
    calendar: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="6" width="16" height="14" rx="2"></rect>
        <path d="M8 4V8"></path>
        <path d="M16 4V8"></path>
        <path d="M4 10H20"></path>
      </svg>
    `,
    mail: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2"></rect>
        <path d="M4 7L12 13L20 7"></path>
      </svg>
    `,
    phone: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4H10L11.5 8L9.8 9.8C10.8 11.9 12.1 13.2 14.2 14.2L16 12.5L20 14V17C20 18.1 19.1 19 18 19C10.8 19 5 13.2 5 6C5 4.9 5.9 4 7 4Z"></path>
      </svg>
    `,
    pin: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21S18 14.7 18 9.8C18 6.1 15.3 3 12 3C8.7 3 6 6.1 6 9.8C6 14.7 12 21 12 21Z"></path>
        <circle cx="12" cy="9.5" r="2.5"></circle>
      </svg>
    `,
    facebook: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 20V12.8H16L16.4 10H13.5V8.2C13.5 7.4 13.8 6.8 15 6.8H16.5V4.3C16.2 4.2 15.3 4 14.2 4C11.8 4 10.2 5.4 10.2 8V10H7.8V12.8H10.2V20"></path>
      </svg>
    `,
    instagram: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="5"></rect>
        <circle cx="12" cy="12" r="3.5"></circle>
        <circle cx="17" cy="7" r="1"></circle>
      </svg>
    `,
    twitter: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 6.2C19.4 6.5 18.7 6.7 18 6.8C18.7 6.4 19.3 5.8 19.5 5C18.9 5.4 18.1 5.7 17.3 5.8C16.7 5.2 15.8 4.8 14.8 4.8C13 4.8 11.6 6.3 11.6 8C11.6 8.3 11.6 8.5 11.7 8.8C8.9 8.7 6.4 7.4 4.7 5.5C4.4 6 4.2 6.6 4.2 7.3C4.2 8.5 4.8 9.5 5.7 10.1C5.1 10.1 4.6 9.9 4.1 9.7V9.8C4.1 11.4 5.2 12.8 6.7 13.1C6.4 13.2 6 13.2 5.7 13.2C5.4 13.2 5.2 13.2 5 13.1C5.4 14.4 6.6 15.3 8 15.4C6.9 16.3 5.6 16.9 4.2 16.9C3.9 16.9 3.6 16.9 3.3 16.8C4.7 17.7 6.4 18.2 8.2 18.2C14.8 18.2 18.5 12.8 18.5 8.2V7.8C19.2 7.3 19.7 6.8 20 6.2Z"></path>
      </svg>
    `,
    linkedin: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.5 9.5V18"></path>
        <path d="M6.5 6.5C7.3 6.5 8 5.8 8 5C8 4.2 7.3 3.5 6.5 3.5C5.7 3.5 5 4.2 5 5C5 5.8 5.7 6.5 6.5 6.5Z"></path>
        <path d="M11 18V13.3C11 11.8 12 10.8 13.3 10.8C14.6 10.8 15.3 11.7 15.3 13.1V18"></path>
        <path d="M15.3 12C15.3 10.1 14.2 9 12.4 9C11 9 10 9.8 9.5 10.7V9.5H11"></path>
        <path d="M19 9.5V18"></path>
      </svg>
    `,
  };

  return icons[name] || "";
}

function logoMarkup() {
  return `
    <a class="brand" href="index.html" aria-label="DXT Academy home">
      <span class="brand__mark">${icon("shield")}</span>
      <span class="brand__copy">
        <strong>DXT ACADEMY</strong>
        <span>Nurturing. Inspiring. Leading.</span>
      </span>
    </a>
  `;
}

function headerMarkup(activePage) {
  const links = navigationItems
    .map(
      (item) => `
        <li>
          <a class="site-nav__link ${item.key === activePage ? "is-active" : ""}" href="${item.href}">
            ${item.label}
          </a>
        </li>
      `,
    )
    .join("");

  return `
    <div class="container site-header__bar">
      ${logoMarkup()}
      <button class="mobile-toggle" type="button" data-mobile-toggle aria-expanded="false" aria-controls="mobile-panel">
        <span class="sr-only">Toggle navigation</span>
        ${icon("menu")}
      </button>
      <nav class="site-nav" aria-label="Primary navigation">
        <ul>${links}</ul>
      </nav>
      <div class="site-header__actions">
        <a class="button button--outline-light" href="#">
          <span>Portal</span>
          ${icon("arrow")}
        </a>
        <a class="button button--primary" href="admissions.html" data-admission-modal>
          <span>Apply Now</span>
          ${icon("arrow")}
        </a>
      </div>
    </div>
    <div class="mobile-panel" id="mobile-panel" data-mobile-panel>
      <div class="mobile-panel__top">
        ${logoMarkup()}
        <button class="mobile-toggle mobile-toggle--close" type="button" data-mobile-toggle aria-expanded="true" aria-controls="mobile-panel">
          <span class="sr-only">Close navigation</span>
          ${icon("close")}
        </button>
      </div>
      <nav class="mobile-nav" aria-label="Mobile navigation">
        ${navigationItems
          .map(
            (item) => `
              <a class="mobile-nav__link ${item.key === activePage ? "is-active" : ""}" href="${item.href}">
                ${item.label}
              </a>
            `,
          )
          .join("")}
      </nav>
      <div class="mobile-panel__actions">
        <a class="button button--outline-light mobile-panel__cta" href="#">
          <span>Portal</span>
          ${icon("arrow")}
        </a>
        <a class="button button--primary mobile-panel__cta" href="admissions.html" data-admission-modal>
          <span>Apply Now</span>
          ${icon("arrow")}
        </a>
      </div>
    </div>
  `;
}

function footerMarkup() {
  const footerLinks = navigationItems
    .map(
      (item) => `
        <a href="${item.href}">${item.label}</a>
      `,
    )
    .join("");

  return `
    <div class="container footer__simple">
      <div class="footer__main">
        ${logoMarkup()}
        <p>
          DXT Academy is committed to raising confident leaders through academic excellence,
          strong character, and a deep sense of purpose.
        </p>
      </div>
      <nav class="footer__links" aria-label="Footer navigation">
        ${footerLinks}
      </nav>
      <div class="footer__contact">
        <span>12 Excellence Drive, Lagos, Nigeria</span>
        <a href="tel:+2348012345678">+234 801 234 5678</a>
        <a href="mailto:info@dxtacademy.edu.ng">info@dxtacademy.edu.ng</a>
      </div>
      <div class="footer__bottom">
        <p>&copy; <span data-year></span> DXT Academy. All rights reserved.</p>
        <div class="footer__legal">
          <a href="privacy.html">Privacy Policy</a>
          <a href="terms.html">Terms of Use</a>
        </div>
      </div>
    </div>
  `;
}

function admissionModalMarkup() {
  return `
    <div class="admission-modal" data-admission-modal-root aria-hidden="true">
      <div class="admission-modal__backdrop" data-admission-modal-close></div>
      <section class="admission-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="admission-modal-title">
        <div class="admission-modal__header">
          <div>
            <p class="eyebrow">Admissions Form</p>
            <h2 id="admission-modal-title">Apply to DXT Academy</h2>
          </div>
          <button class="icon-button admission-modal__close" type="button" data-admission-modal-close aria-label="Close admission form">
            ${icon("close")}
          </button>
        </div>
        <div class="google-form-frame google-form-frame--admission">
          <iframe
            data-src="${admissionFormUrl}"
            width="640"
            height="1886"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
            title="DXT Academy admission form"
          >Loading...</iframe>
        </div>
      </section>
    </div>
  `;
}

function storyModalMarkup() {
  return `
    <div class="story-modal" data-story-modal-root aria-hidden="true">
      <div class="story-modal__backdrop" data-story-modal-close></div>
      <section class="story-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="story-modal-title">
        <div class="story-modal__header">
          <div>
            <p class="eyebrow">about us</p>
            <h2 id="story-modal-title">DXT Academy's Journey</h2>
          </div>
          <button class="icon-button story-modal__close" type="button" data-story-modal-close aria-label="Close story">
            ${icon("close")}
          </button>
        </div>
        <div class="story-modal__content">
          <p>
            DXT Academy was founded with a vision: to create an educational institution where rigorous academics, strong character development, and purposeful leadership converge. What began as a small initiative with a handful of passionate educators has blossomed into a thriving community of over 1,500 students.
          </p>
          <p>
            Our story is one of purposeful growth. From day one, we refused to settle for conventional education. We believed that schools should nurture not just brilliant minds but confident, compassionate leaders who understand their role in society. This philosophy became the foundation upon which DXT Academy was built.
          </p>
          <p>
            Over the years, we've invested in world-class facilities, recruited exceptional teachers, and developed innovative curricula that blend traditional excellence with 21st-century skills. Our students don't just excel in examinations—they thrive in life. With a 95% university progression rate and countless alumni making meaningful contributions across industries, we've proven that our approach works.
          </p>
          <p>
            But our greatest pride isn't our statistics. It's the students who leave our halls as thinkers, problem-solvers, and changemakers. It's the parent testimonials that speak of transformation. It's the teacher stories of breakthrough moments with learners. Every day, DXT Academy lives out its mission: nurturing inspired learners and courageous leaders.
          </p>
          <p>
            As we continue to grow, we remain committed to the values that define us—integrity, respect, responsibility, and excellence. We invite you to become part of our story.
          </p>
        </div>
      </section>
    </div>
  `;
}

function mountShell() {
  const page = document.body.dataset.page || "home";
  const header = document.querySelector("[data-site-header]");
  const footer = document.querySelector("[data-site-footer]");

  if (header) {
    header.innerHTML = headerMarkup(page);
  }

  if (footer) {
    footer.innerHTML = footerMarkup();
  }

  if (!document.querySelector("[data-admission-modal-root]")) {
    document.body.insertAdjacentHTML("beforeend", admissionModalMarkup());
  }

  if (!document.querySelector("[data-story-modal-root]")) {
    document.body.insertAdjacentHTML("beforeend", storyModalMarkup());
  }

  const year = document.querySelector("[data-year]");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
}

function bindMobileNavigation() {
  const header = document.querySelector("[data-site-header]");
  if (!header) {
    return;
  }

  const panel = header.querySelector("[data-mobile-panel]");
  const toggles = header.querySelectorAll("[data-mobile-toggle]");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const isOpen = panel.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", isOpen);
      toggles.forEach((button) => button.setAttribute("aria-expanded", String(isOpen)));
    });
  });

  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      panel.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      toggles.forEach((button) => button.setAttribute("aria-expanded", "false"));
    });
  });
}

function bindAdmissionModal() {
  const modal = document.querySelector("[data-admission-modal-root]");
  if (!modal) {
    return;
  }

  const triggers = document.querySelectorAll('[data-admission-modal], a.button[href="admissions.html"]');
  const closeButtons = modal.querySelectorAll("[data-admission-modal-close]");
  const closeControl = modal.querySelector(".admission-modal__close");
  const admissionFrame = modal.querySelector("iframe");
  let previousFocus = null;

  const openModal = (trigger) => {
    previousFocus = trigger || document.activeElement;
    if (admissionFrame && !admissionFrame.getAttribute("src")) {
      admissionFrame.setAttribute("src", admissionFrame.dataset.src);
    }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    closeControl?.focus();
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(trigger);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function bindStoryModal() {
  const modal = document.querySelector("[data-story-modal-root]");
  if (!modal) {
    return;
  }

  const triggers = document.querySelectorAll("[data-story-modal-trigger]");
  const closeButtons = modal.querySelectorAll("[data-story-modal-close]");
  const closeControl = modal.querySelector(".story-modal__close");
  let previousFocus = null;

  const openModal = (trigger) => {
    previousFocus = trigger || document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    closeControl?.focus();
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(trigger);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function bindScrollState() {
  const header = document.querySelector("[data-site-header]");
  if (!header) {
    return;
  }

  const updateState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateState();
  window.addEventListener("scroll", updateState, { passive: true });
}

function animateStats() {
  const stats = document.querySelectorAll("[data-stat]");
  if (!stats.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const target = entry.target;
        const value = target.dataset.stat;
        const numeric = Number.parseInt(value.replace(/\D/g, ""), 10);
        const suffix = value.replace(/[0-9]/g, "");
        const start = performance.now();
        const duration = 900;

        const tick = (time) => {
          const progress = Math.min((time - start) / duration, 1);
          const current = Math.round(progress * numeric);
          target.textContent = `${current.toLocaleString()}${suffix}`;
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            target.textContent = value;
          }
        };

        requestAnimationFrame(tick);
        observer.unobserve(target);
      });
    },
    { threshold: 0.45 },
  );

  stats.forEach((stat) => observer.observe(stat));
}

function bindContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) {
    return;
  }

  const status = form.querySelector("[data-form-status]");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const name = form.querySelector('[name="name"]').value.trim();
    status.textContent = `Thank you, ${name}. Your message has been prepared successfully.`;
    form.reset();
  });
}

function bindGalleryPagination() {
  const gallery = document.querySelector("[data-gallery]");
  const pagination = document.querySelector("[data-gallery-pagination]");
  const summary = document.querySelector("[data-gallery-summary]");

  if (!gallery || !pagination) {
    return;
  }

  const items = Array.from(gallery.querySelectorAll("[data-gallery-item]"));
  const pageSize = Number(gallery.dataset.pageSize) || 9;
  const pageCount = Math.ceil(items.length / pageSize);
  let currentPage = 1;

  const renderPage = (page) => {
    currentPage = Math.min(Math.max(page, 1), pageCount);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;

    items.forEach((item, index) => {
      const isVisible = index >= start && index < end;
      item.hidden = !isVisible;
      item.setAttribute("aria-hidden", String(!isVisible));
    });

    if (summary) {
      summary.textContent = `Showing ${start + 1}-${Math.min(end, items.length)} of ${items.length}`;
    }

    pagination.innerHTML = `
      <button class="gallery-pagination__button" type="button" data-gallery-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>
        Previous
      </button>
      ${Array.from({ length: pageCount }, (_, index) => {
        const pageNumber = index + 1;
        return `
          <button
            class="gallery-pagination__button ${pageNumber === currentPage ? "is-active" : ""}"
            type="button"
            data-gallery-page="${pageNumber}"
            aria-current="${pageNumber === currentPage ? "page" : "false"}"
          >
            ${pageNumber}
          </button>
        `;
      }).join("")}
      <button class="gallery-pagination__button" type="button" data-gallery-page="${currentPage + 1}" ${currentPage === pageCount ? "disabled" : ""}>
        Next
      </button>
    `;
  };

  pagination.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery-page]");
    if (!button) {
      return;
    }

    renderPage(Number(button.dataset.galleryPage));
    gallery.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  renderPage(1);
}

function bindGalleryLightbox() {
  const gallery = document.querySelector("[data-gallery]");
  if (!gallery) {
    return;
  }

  const cards = Array.from(gallery.querySelectorAll("[data-gallery-item]"));
  if (!cards.length) {
    return;
  }

  if (!document.querySelector("[data-gallery-lightbox]")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div class="gallery-lightbox" data-gallery-lightbox aria-hidden="true">
          <button class="gallery-lightbox__backdrop" type="button" data-gallery-lightbox-close aria-label="Close image viewer"></button>
          <section class="gallery-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Gallery image viewer">
            <button class="icon-button gallery-lightbox__close" type="button" data-gallery-lightbox-close aria-label="Close image viewer">
              ${icon("close")}
            </button>
            <img src="" alt="" data-gallery-lightbox-image />
            <p data-gallery-lightbox-caption></p>
          </section>
        </div>
      `,
    );
  }

  const lightbox = document.querySelector("[data-gallery-lightbox]");
  const lightboxImage = lightbox.querySelector("[data-gallery-lightbox-image]");
  const lightboxCaption = lightbox.querySelector("[data-gallery-lightbox-caption]");
  const closeButtons = lightbox.querySelectorAll("[data-gallery-lightbox-close]");
  const closeControl = lightbox.querySelector(".gallery-lightbox__close");
  let previousFocus = null;

  cards.forEach((card) => {
    const image = card.querySelector("img");
    const caption = card.querySelector("figcaption")?.textContent.trim() || image?.alt || "Gallery image";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View ${caption}`);
  });

  const openLightbox = (card) => {
    const image = card.querySelector("img");
    const caption = card.querySelector("figcaption")?.textContent.trim() || image?.alt || "";

    if (!image) {
      return;
    }

    previousFocus = card;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = caption;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    closeControl?.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.removeAttribute("src");
    document.body.classList.remove("modal-open");

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  };

  gallery.addEventListener("click", (event) => {
    const card = event.target.closest("[data-gallery-item]");
    if (!card || card.hidden) {
      return;
    }

    openLightbox(card);
  });

  gallery.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const card = event.target.closest("[data-gallery-item]");
    if (!card || card.hidden) {
      return;
    }

    event.preventDefault();
    openLightbox(card);
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeLightbox);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
}

function imageUrlsFromBackground(backgroundImage) {
  if (!backgroundImage || backgroundImage === "none") {
    return [];
  }

  return Array.from(backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g), (match) => match[1]);
}

function waitForImageUrl(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve();
      return;
    }

    const image = new Image();
    let isDone = false;
    const finish = () => {
      if (isDone) {
        return;
      }

      isDone = true;
      if (image.decode) {
        image.decode().catch(() => {}).finally(resolve);
      } else {
        resolve();
      }
    };

    image.onload = finish;
    image.onerror = finish;
    image.src = url;

    if (image.complete) {
      finish();
    }
  });
}

function waitForImageElement(image) {
  return new Promise((resolve) => {
    if (!image) {
      resolve();
      return;
    }

    const decode = () => {
      if (image.decode) {
        image.decode().catch(() => {}).finally(resolve);
      } else {
        resolve();
      }
    };

    if (image.complete && image.naturalWidth > 0) {
      decode();
      return;
    }

    image.addEventListener("load", decode, { once: true });
    image.addEventListener("error", resolve, { once: true });
  });
}

function initHomePreloader() {
  const body = document.body;
  if (body.dataset.page !== "home" || !body.classList.contains("is-home-loading")) {
    return Promise.resolve();
  }

  const loader = document.querySelector("[data-home-loader]");
  const hero = document.querySelector(".hero-home");
  const heroBuilding = document.querySelector(".hero-home__building");
  const heroStudents = document.querySelector(".hero-home__students");
  const backgroundUrls = [
    ...imageUrlsFromBackground(hero ? getComputedStyle(hero).backgroundImage : ""),
    ...imageUrlsFromBackground(hero ? getComputedStyle(hero, "::before").backgroundImage : ""),
    ...imageUrlsFromBackground(heroBuilding ? getComputedStyle(heroBuilding).backgroundImage : ""),
  ];
  const uniqueBackgroundUrls = Array.from(new Set(backgroundUrls));
  const tasks = [
    ...uniqueBackgroundUrls.map(waitForImageUrl),
    waitForImageElement(heroStudents),
  ];
  const fallbackTimer = new Promise((resolve) => {
    window.setTimeout(resolve, 5000);
  });

  return Promise.race([Promise.all(tasks), fallbackTimer]).then(
    () =>
      new Promise((resolve) => {
        window.requestAnimationFrame(() => {
          body.classList.remove("is-home-loading");
          loader?.setAttribute("aria-hidden", "true");

          window.setTimeout(() => {
            loader?.remove();
            resolve();
          }, 500);
        });
      }),
  );
}

function decorateIcons() {
  document.querySelectorAll("[data-icon]").forEach((element) => {
    element.innerHTML = icon(element.dataset.icon);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  mountShell();
  decorateIcons();
  const homeReady = initHomePreloader();
  bindMobileNavigation();
  bindAdmissionModal();
  bindStoryModal();
  bindScrollState();
  bindContactForm();
  bindGalleryPagination();
  bindGalleryLightbox();
  homeReady.then(animateStats);
});
