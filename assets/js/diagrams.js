/*
 * Diagram helpers: pause ambient motion (CSS + SMIL sparks) while a diagram
 * is off-screen or the tab is hidden, and stop SMIL entirely under
 * prefers-reduced-motion. Entrance animations are driven by reveal.js.
 */
(function (DS) {
  "use strict";

  DS.initDiagrams = function () {
    var diagrams = DS.qsa("svg[data-diagram]");
    if (!diagrams.length) return;

    var visible = new Map();

    var apply = function (svg) {
      var run = visible.get(svg) && !document.hidden && !DS.prefersReducedMotion();
      svg.classList.toggle("is-paused", !run);
      if (typeof svg.pauseAnimations === "function") {
        run ? svg.unpauseAnimations() : svg.pauseAnimations();
      }
    };

    diagrams.forEach(function (svg) {
      visible.set(svg, false);
      apply(svg);
    });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible.set(entry.target, entry.isIntersecting);
          apply(entry.target);
        });
      });
      diagrams.forEach(function (svg) {
        observer.observe(svg);
      });
    } else {
      diagrams.forEach(function (svg) {
        visible.set(svg, true);
        apply(svg);
      });
    }

    var applyAll = function () {
      diagrams.forEach(apply);
    };
    document.addEventListener("visibilitychange", applyAll);
    DS.onReducedMotionChange(applyAll);
  };
})(window.DS);
