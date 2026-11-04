/* Header: scrolled state + mobile menu behaviour on top of Bootstrap Collapse. */
(function (DS) {
  "use strict";

  var DESKTOP_QUERY = "(min-width: 992px)";

  DS.initNav = function () {
    var header = DS.qs("[data-site-header]");
    if (!header) return;

    var nav = DS.qs(".site-nav", header);
    var menu = DS.qs("#site-menu", header);
    var toggle = DS.qs(".site-nav__toggle", header);

    // Scrolled state (adds shadow, tucks the pill closer to the top).
    var ticking = false;
    var updateScrolled = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateScrolled);
          ticking = true;
        }
      },
      { passive: true }
    );
    updateScrolled();

    if (!menu || !toggle || !window.bootstrap) return;

    var collapse = window.bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false });
    var desktop = window.matchMedia(DESKTOP_QUERY);

    menu.addEventListener("show.bs.collapse", function () {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-label", "Close menu");
    });

    menu.addEventListener("hidden.bs.collapse", function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-label", "Open menu");
    });

    // Close after choosing a link (mobile only).
    menu.addEventListener("click", function (event) {
      if (!desktop.matches && event.target.closest("a") && menu.classList.contains("show")) {
        collapse.hide();
      }
    });

    // Escape closes the menu and returns focus to the toggle.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("show")) {
        collapse.hide();
        toggle.focus();
      }
    });

    // Clicking outside the pill closes it.
    document.addEventListener("click", function (event) {
      if (menu.classList.contains("show") && !nav.contains(event.target)) {
        collapse.hide();
      }
    });

    // Reset when resizing up to desktop.
    var onBreakpoint = function () {
      if (desktop.matches && menu.classList.contains("show")) {
        menu.classList.remove("show");
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    };
    if (desktop.addEventListener) {
      desktop.addEventListener("change", onBreakpoint);
    } else if (desktop.addListener) {
      desktop.addListener(onBreakpoint);
    }
  };
})(window.DS);
