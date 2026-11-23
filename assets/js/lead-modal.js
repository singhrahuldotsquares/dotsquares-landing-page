/* Phones (< 768px): the hero lead form becomes a popup opened from the floating
   "Contact us" button (or any #contact link). Above that width the form stays in
   the page and this module does nothing. */
(function (DS) {
  "use strict";

  var PHONE_QUERY = "(max-width: 767.98px)";

  DS.initLeadModal = function () {
    var modal = DS.qs("[data-lead-modal]");
    var card = modal && DS.qs(".lead-card", modal);
    if (!modal || !card) return;

    var phone = window.matchMedia(PHONE_QUERY);
    var fab = DS.qs("[data-lead-open]");
    var lastFocus = null;

    var open = function () {
      lastFocus = document.activeElement;
      modal.classList.add("is-open");
      card.classList.add("is-visible"); // skip the scroll-reveal while hidden
      document.documentElement.classList.add("lead-modal-open");
      if (fab) fab.setAttribute("aria-expanded", "true");
      modal.scrollTop = 0;
      var first = DS.qs("input, textarea", card);
      if (first) window.setTimeout(function () { first.focus({ preventScroll: true }); }, 50);
    };

    var close = function () {
      if (!modal.classList.contains("is-open")) return;
      modal.classList.remove("is-open");
      document.documentElement.classList.remove("lead-modal-open");
      if (fab) fab.setAttribute("aria-expanded", "false");
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };

    if (fab) fab.addEventListener("click", open);

    DS.qsa("[data-lead-close]", modal).forEach(function (btn) {
      btn.addEventListener("click", close);
    });

    // Click on the dark backdrop (outside the card) closes.
    modal.addEventListener("click", function (event) {
      if (event.target === modal) close();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });

    // Every "#contact" link opens the popup on phones instead of scrolling.
    document.addEventListener("click", function (event) {
      var link = event.target.closest && event.target.closest('a[href="#contact"]');
      if (!link || !phone.matches) return;
      event.preventDefault();
      open();
    });

    // Leaving phone width: make sure the page is not left locked.
    var onChange = function () {
      if (!phone.matches) close();
    };
    if (phone.addEventListener) phone.addEventListener("change", onChange);
    else if (phone.addListener) phone.addListener(onChange);
  };
})(window.DS);
