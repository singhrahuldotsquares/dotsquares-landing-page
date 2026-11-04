/*
 * "HubSpot services" coverflow slider.
 *
 * Markup:
 *   [data-services]               section root; optional data-autoplay="ms"
 *   [data-services-stage]         focusable region (arrow keys, swipe)
 *   [data-services-slide]         each card
 *   [data-services-prev|next]     arrow buttons
 *   [data-services-dots]          empty container; dot buttons are generated
 *
 * Each slide gets --d (signed circular distance from the active slide) and
 * --a (|d|); the CSS turns those into position / scale / rotation. Autoplay
 * pauses on hover, focus, when off-screen or tab hidden, and is disabled for
 * prefers-reduced-motion.
 */
(function (DS) {
  "use strict";

  function Services(root) {
    this.root = root;
    this.stage = DS.qs("[data-services-stage]", root);
    this.slides = DS.qsa("[data-services-slide]", root);
    this.dotsEl = DS.qs("[data-services-dots]", root);
    this.delay = parseInt(root.getAttribute("data-autoplay"), 10) || 0;
    this.index = 0;
    this.offsets = [];
    this.dots = [];
    this.timer = null;
    this.paused = false;
    this.inView = true;

    this.buildDots();
    this.bind();
    this.render(0, true);
    this.setupAutoplay();
  }

  // Signed shortest distance on a circle of n items, in [-n/2, n/2).
  Services.prototype.distance = function (i, active) {
    var n = this.slides.length;
    return ((i - active + n + Math.floor(n / 2)) % n) - Math.floor(n / 2);
  };

  Services.prototype.render = function (active, instant) {
    var self = this;
    this.index = ((active % this.slides.length) + this.slides.length) % this.slides.length;

    var set = function (slide, d, a, s) {
      slide.style.setProperty("--d", d);
      slide.style.setProperty("--a", a);
      slide.style.setProperty("--s", s);
    };

    this.slides.forEach(function (slide, i) {
      var d = self.distance(i, self.index);
      var a = Math.abs(d);
      var sign = d === 0 ? 0 : d < 0 ? -1 : 1;
      var prev = self.offsets[i];
      var hidden = a >= 3;
      var wasHidden = prev !== undefined && Math.abs(prev) >= 3;

      var apply = function () {
        slide.classList.toggle("is-active", d === 0);
        slide.classList.toggle("is-edge", a === 2);
        slide.classList.toggle("is-far", hidden);
        slide.setAttribute("aria-current", d === 0 ? "true" : "false");
      };

      if (instant || (hidden && wasHidden)) {
        // First paint, or moving between two hidden slots: no animation.
        slide.style.transition = "none";
        set(slide, d, a, sign);
        apply();
        void slide.offsetWidth;
        slide.style.transition = "";
      } else if (wasHidden) {
        // Entering: wait just outside the row on the side it will arrive from,
        // then glide in while fading up.
        slide.style.transition = "none";
        set(slide, sign * 3, 3, sign);
        slide.classList.add("is-far");
        void slide.offsetWidth;
        slide.style.transition = "";
        set(slide, d, a, sign);
        apply();
      } else if (hidden) {
        // Leaving: keep drifting out on the side it was already on.
        var side = prev < 0 ? -1 : 1;
        set(slide, side * a, a, side);
        apply();
      } else {
        set(slide, d, a, sign);
        apply();
      }
      self.offsets[i] = d;
    });

    this.dots.forEach(function (dot, n) {
      dot.setAttribute("aria-current", n === self.index ? "true" : "false");
    });
  };

  Services.prototype.userGo = function (i) {
    this.stage.setAttribute("aria-live", "polite");
    this.render(i);
    this.restart();
  };

  Services.prototype.buildDots = function () {
    if (!this.dotsEl) return;
    var self = this;
    var total = this.slides.length;

    this.dotsEl.classList.add("ds-dots");
    this.dotsEl.setAttribute("role", "group");
    this.dotsEl.setAttribute("aria-label", "Choose service");

    this.slides.forEach(function (_, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ds-dots__btn";
      btn.setAttribute("aria-label", "Show service " + (i + 1) + " of " + total);
      btn.addEventListener("click", function () {
        self.userGo(i);
      });
      self.dotsEl.appendChild(btn);
      self.dots.push(btn);
    });
  };

  Services.prototype.bind = function () {
    var self = this;
    var prev = DS.qs("[data-services-prev]", this.root);
    var next = DS.qs("[data-services-next]", this.root);
    if (prev) prev.addEventListener("click", function () { self.userGo(self.index - 1); });
    if (next) next.addEventListener("click", function () { self.userGo(self.index + 1); });

    // Clicking a neighbouring card brings it to the centre.
    this.slides.forEach(function (slide, i) {
      slide.addEventListener("click", function () {
        if (i !== self.index && !self.dragged) self.userGo(i);
      });
    });

    this.stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); self.userGo(self.index + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); self.userGo(self.index - 1); }
      if (e.key === "Home") { e.preventDefault(); self.userGo(0); }
      if (e.key === "End") { e.preventDefault(); self.userGo(self.slides.length - 1); }
    });

    // Swipe / drag (touch, pen and mouse).
    var startX = null;
    this.dragged = false;
    this.stage.addEventListener("pointerdown", function (e) {
      startX = e.clientX;
      self.dragged = false;
    });
    this.stage.addEventListener("pointerup", function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) {
        self.dragged = true; // swallow the click that follows a drag
        self.userGo(self.index + (dx < 0 ? 1 : -1));
        window.setTimeout(function () { self.dragged = false; }, 0);
      }
    });
    this.stage.addEventListener("pointercancel", function () { startX = null; });
  };

  Services.prototype.setupAutoplay = function () {
    if (!this.delay || DS.prefersReducedMotion()) return;
    var self = this;

    var pause = function () { self.paused = true; self.stop(); };
    var resume = function () { self.paused = false; self.restart(); };

    // Keeps looping regardless of the pointer; only keyboard focus pauses it.
    this.root.addEventListener("focusin", function (e) {
      if (e.target.matches && e.target.matches(":focus-visible")) pause();
    });
    this.root.addEventListener("focusout", function (e) {
      if (!self.root.contains(e.relatedTarget)) resume();
    });

    document.addEventListener("visibilitychange", function () {
      document.hidden ? self.stop() : self.restart();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        self.inView = entries[0].isIntersecting;
        self.restart();
      }).observe(this.root);
    }

    DS.onReducedMotionChange(function () {
      if (DS.prefersReducedMotion()) {
        self.delay = 0;
        self.stop();
      }
    });

    this.restart();
  };

  Services.prototype.stop = function () {
    window.clearInterval(this.timer);
    this.timer = null;
  };

  Services.prototype.restart = function () {
    this.stop();
    if (!this.delay || this.paused || !this.inView || document.hidden) return;
    var self = this;
    this.timer = window.setInterval(function () {
      self.render(self.index + 1);
    }, this.delay);
  };

  DS.initServices = function () {
    DS.qsa("[data-services]").forEach(function (root) {
      if (DS.qsa("[data-services-slide]", root).length > 1) new Services(root);
    });
  };
})(window.DS);
