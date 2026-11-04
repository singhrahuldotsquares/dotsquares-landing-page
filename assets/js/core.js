/* Shared namespace and helpers. Loaded before all other site scripts. */
(function () {
  "use strict";

  var DS = (window.DS = window.DS || {});

  DS.qs = function (selector, scope) {
    return (scope || document).querySelector(selector);
  };

  DS.qsa = function (selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  };

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  DS.prefersReducedMotion = function () {
    return motionQuery.matches;
  };

  DS.onReducedMotionChange = function (callback) {
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener("change", callback);
    } else if (motionQuery.addListener) {
      motionQuery.addListener(callback);
    }
  };
})();
