/* Scroll-triggered reveals: adds .is-visible to [data-reveal] once in view. */
(function (DS) {
  "use strict";

  DS.initReveal = function () {
    var items = DS.qsa("[data-reveal]");
    if (!items.length) return;

    var showAll = function () {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
    };

    if (DS.prefersReducedMotion() || !("IntersectionObserver" in window)) {
      showAll();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });

    DS.onReducedMotionChange(function () {
      if (DS.prefersReducedMotion()) {
        observer.disconnect();
        showAll();
      }
    });
  };
})(window.DS);
