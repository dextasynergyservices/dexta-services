(function ($) {
  "use strict";

  // Initiate the wowjs
  new WOW().init();

  // Spinner
  var spinner = function () {
    setTimeout(function () {
      if ($("#spinner").length > 0) {
        $("#spinner").removeClass("show");
      }
    }, 1);
  };
  spinner();

  // Sticky Navbar
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $(".sticky-top").addClass("shadow-sm").css("top", "0px");
    } else {
      $(".sticky-top").removeClass("shadow-sm").css("top", "-100px");
    }
  });

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $(".back-to-top").fadeIn("slow");
    } else {
      $(".back-to-top").fadeOut("slow");
    }
  });
  $(".back-to-top").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 1500, "easeInOutExpo");
    return false;
  });

  // Header carousel
  $(".header-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1500,
    items: 1,
    dots: true,
    loop: true,
    nav: true,
    navText: [
      '<i class="bi bi-chevron-left"></i>',
      '<i class="bi bi-chevron-right"></i>',
    ],
  });

  // Testimonials carousel
  $(".testimonial-carousel").owlCarousel({
    autoplay: true,
    smartSpeed: 1000,
    margin: 24,
    dots: false,
    loop: true,
    nav: true,
    navText: [
      '<i class="bi bi-arrow-left"></i>',
      '<i class="bi bi-arrow-right"></i>',
    ],
    responsive: {
      0: {
        items: 1,
      },
      992: {
        items: 2,
      },
    },
  });

  // Landing gallery pagination + lightbox
  const galleryItems = Array.from(
    document.querySelectorAll(".landing-gallery__item"),
  );
  const galleryPagination = document.querySelector(
    ".landing-gallery__pagination",
  );
  const galleryTriggers = Array.from(
    document.querySelectorAll(".landing-gallery__trigger"),
  );
  const galleryModalElement = document.getElementById("landingGalleryModal");
  const galleryModalImage = document.getElementById("landingGalleryModalImage");
  const galleryNavButtons = Array.from(
    document.querySelectorAll("[data-gallery-nav]"),
  );
  const galleryPageSize = 3;
  let galleryPage = 1;
  let activeGalleryIndex = 0;

  const updateGalleryPagination = () => {
    if (!galleryItems.length || !galleryPagination) {
      return;
    }

    const totalPages = Math.ceil(galleryItems.length / galleryPageSize);
    galleryPagination.innerHTML = "";

    galleryItems.forEach((item, index) => {
      const start = (galleryPage - 1) * galleryPageSize;
      const end = start + galleryPageSize;
      item.style.display = index >= start && index < end ? "" : "none";
    });

    if (totalPages <= 1) {
      return;
    }

    for (let pageIndex = 1; pageIndex <= totalPages; pageIndex += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `landing-gallery__page${pageIndex === galleryPage ? " is-active" : ""}`;
      button.textContent = pageIndex;
      button.setAttribute("aria-label", `Go to gallery page ${pageIndex}`);
      button.addEventListener("click", () => {
        galleryPage = pageIndex;
        updateGalleryPagination();
      });
      galleryPagination.appendChild(button);
    }
  };

  const updateGalleryModal = () => {
    if (!galleryModalImage || !galleryTriggers.length) {
      return;
    }

    const currentImage =
      galleryTriggers[activeGalleryIndex]?.querySelector("img");
    if (!currentImage) {
      return;
    }

    galleryModalImage.src = currentImage.src;
    galleryModalImage.alt = currentImage.alt;

    galleryNavButtons.forEach((button) => {
      if (button.dataset.galleryNav === "prev") {
        button.disabled = activeGalleryIndex === 0;
      }
      if (button.dataset.galleryNav === "next") {
        button.disabled = activeGalleryIndex === galleryTriggers.length - 1;
      }
    });
  };

  if (galleryItems.length) {
    updateGalleryPagination();
  }

  if (galleryModalElement && galleryTriggers.length) {
    const galleryModal = new bootstrap.Modal(galleryModalElement);

    galleryTriggers.forEach((trigger, index) => {
      trigger.addEventListener("click", () => {
        activeGalleryIndex = index;
        updateGalleryModal();
        galleryModal.show();
      });
    });

    galleryNavButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.galleryNav === "prev" && activeGalleryIndex > 0) {
          activeGalleryIndex -= 1;
        }

        if (
          button.dataset.galleryNav === "next" &&
          activeGalleryIndex < galleryTriggers.length - 1
        ) {
          activeGalleryIndex += 1;
        }

        updateGalleryModal();
      });
    });
  }

  // About page scroll reveal + parallax
  const aboutPage = document.querySelector(".about-page");
  const aboutRevealItems = Array.from(
    document.querySelectorAll(".about-page [data-reveal]"),
  );
  const aboutParallaxItems = Array.from(
    document.querySelectorAll(".about-page [data-parallax]"),
  );
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (aboutPage && aboutRevealItems.length) {
    aboutRevealItems.forEach((item) => {
      const revealDelay = item.getAttribute("data-reveal-delay");
      if (revealDelay) {
        item.style.setProperty("--reveal-delay", `${revealDelay}ms`);
      }
    });

    if (prefersReducedMotion) {
      aboutRevealItems.forEach((item) => item.classList.add("is-visible"));
    } else {
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
          threshold: 0.18,
          rootMargin: "0px 0px -10% 0px",
        },
      );

      aboutRevealItems.forEach((item) => revealObserver.observe(item));
    }
  }

  if (aboutPage && aboutParallaxItems.length && !prefersReducedMotion) {
    let parallaxFrame = null;

    const updateAboutParallax = () => {
      aboutParallaxItems.forEach((item) => {
        const strength = Number(item.getAttribute("data-parallax")) || 18;
        const bounds = item.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;
        const elementCenter = bounds.top + bounds.height / 2;
        const distance = (elementCenter - viewportCenter) / window.innerHeight;
        const offset = Math.max(
          Math.min(distance * -strength, strength),
          -strength,
        );

        item.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      });

      parallaxFrame = null;
    };

    const requestAboutParallax = () => {
      if (parallaxFrame !== null) {
        return;
      }

      parallaxFrame = window.requestAnimationFrame(updateAboutParallax);
    };

    requestAboutParallax();
    window.addEventListener("scroll", requestAboutParallax, { passive: true });
    window.addEventListener("resize", requestAboutParallax);
  }
})(jQuery);
