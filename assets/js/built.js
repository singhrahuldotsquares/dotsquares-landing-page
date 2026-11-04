/*
 * "What We've Built" case-study carousel: one slide at a time, prev/next
 * arrows (wrapping), keyboard arrows, touch swipe, live announcement.
 * The arrows hide when there is only one slide.
 *
 * Markup hooks:
 *   [data-built]          root
 *   [data-built-slide]    each slide (.is-active = visible)
 *   [data-built-prev] / [data-built-next]
 *   [data-built-status]   visually hidden live region
 */
(function (DS) {
  "use strict";

  function Built(root) {
    this.root = root;
    this.slides = DS.qsa("[data-built-slide]", root);
    this.prev = DS.qs("[data-built-prev]", root);
    this.next = DS.qs("[data-built-next]", root);
    this.status = DS.qs("[data-built-status]", root);
    this.index = Math.max(0, this.slides.findIndex(function (s) {
      return s.classList.contains("is-active");
    }));
    if (!this.slides.length) return;

    if (this.slides.length < 2) {
      this.prev.hidden = true;
      this.next.hidden = true;
    }
    this.go(this.index, 0, false);
    this.bind();
  }

  Built.prototype.go = function (i, dir, announce) {
    var total = this.slides.length;
    this.index = (i + total) % total;
    var current = this.index;
    // Slide-in direction for the CSS entrance animation.
    this.root.style.setProperty("--built-dir", dir < 0 ? "-16px" : "16px");

    this.slides.forEach(function (slide, n) {
      var on = n === current;
      slide.classList.toggle("is-active", on);
      slide.setAttribute("aria-hidden", on ? "false" : "true");
    });

    // Load the neighbours' images ahead of time so navigation never shows a
    // blank image while a lazy image downloads.
    [current + 1, current - 1].forEach(function (n) {
      var img = DS.qs("img", this.slides[(n + total) % total]);
      if (img) img.loading = "eager";
    }, this);

    if (announce && this.status) {
      this.status.textContent = this.slides[current].getAttribute("aria-label");
    }
  };

  Built.prototype.step = function (dir) {
    this.go(this.index + dir, dir, true);
  };

  Built.prototype.bind = function () {
    var self = this;
    this.prev.addEventListener("click", function () { self.step(-1); });
    this.next.addEventListener("click", function () { self.step(1); });

    this.root.addEventListener("keydown", function (event) {
      if (self.slides.length < 2) return;
      if (event.key === "ArrowLeft") { event.preventDefault(); self.step(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); self.step(1); }
    });

    // Swipe on touch / pen.
    var startX = null;
    var track = DS.qs("[data-built-track]", this.root);
    track.addEventListener("pointerdown", function (event) {
      if (event.pointerType !== "mouse") startX = event.clientX;
    });
    track.addEventListener("pointerup", function (event) {
      if (startX === null || self.slides.length < 2) return;
      var dx = event.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) self.step(dx < 0 ? 1 : -1);
    });
    track.addEventListener("pointercancel", function () { startX = null; });
  };

  DS.initBuilt = function () {
    DS.qsa("[data-built]").forEach(function (root) {
      root.dsBuilt = new Built(root);
    });
  };
})(window.DS);
