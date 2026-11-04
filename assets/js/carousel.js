/*
 * Single-view carousel (one slide visible at a time).
 *
 * Markup:
 *   [data-carousel]                 root; optional data-autoplay="ms", data-item-label="question"
 *   [data-carousel-slide]           each slide (first visible one gets .is-active)
 *   [data-carousel-dots]            empty container; dot buttons are generated
 *   [data-carousel-prev|next]       optional arrow buttons
 *
 * Autoplay pauses on hover/focus, when off-screen, when the tab is hidden,
 * and is disabled entirely under prefers-reduced-motion.
 */
(function (DS) {
  "use strict";

  function Carousel(root) {
    this.root = root;
    this.slides = DS.qsa("[data-carousel-slide]", root);
    this.dotsEl = DS.qs("[data-carousel-dots]", root);
    this.live = DS.qs("[data-carousel-live]", root) || root;
    this.delay = parseInt(root.getAttribute("data-autoplay"), 10) || 0;
    this.itemLabel = root.getAttribute("data-item-label") || "slide";
    this.index = Math.max(
      0,
      this.slides.findIndex(function (s) {
        return s.classList.contains("is-active");
      })
    );
    this.timer = null;
    this.paused = false;
    this.inView = true;
    this.dots = [];

    if (this.slides.length < 2) return;

    this.buildDots();
    this.bindControls();
    this.go(this.index, false);
    this.setupAutoplay();
  }

  Carousel.prototype.buildDots = function () {
    if (!this.dotsEl) return;
    var self = this;
    var total = this.slides.length;

    this.dotsEl.classList.add("ds-dots");
    this.dotsEl.setAttribute("role", "group");
    this.dotsEl.setAttribute("aria-label", "Choose " + this.itemLabel);

    this.slides.forEach(function (_, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ds-dots__btn";
      btn.setAttribute("aria-label", "Show " + self.itemLabel + " " + (i + 1) + " of " + total);
      btn.addEventListener("click", function () {
        self.userGo(i);
      });
      btn.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight") next = (i + 1) % total;
        if (event.key === "ArrowLeft") next = (i - 1 + total) % total;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = total - 1;
        if (next === null) return;
        event.preventDefault();
        self.userGo(next);
        self.dots[next].focus();
      });
      self.dotsEl.appendChild(btn);
      self.dots.push(btn);
    });
  };

  Carousel.prototype.bindControls = function () {
    var self = this;
    var prev = DS.qs("[data-carousel-prev]", this.root);
    var next = DS.qs("[data-carousel-next]", this.root);
    if (prev) prev.addEventListener("click", function () { self.userGo(self.index - 1); });
    if (next) next.addEventListener("click", function () { self.userGo(self.index + 1); });

    // Swipe on touch / pen.
    var startX = null;
    this.root.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") startX = e.clientX;
    });
    this.root.addEventListener("pointerup", function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) self.userGo(self.index + (dx < 0 ? 1 : -1));
    });
  };

  Carousel.prototype.go = function (i) {
    var total = this.slides.length;
    this.index = (i + total) % total;
    var current = this.index;

    this.slides.forEach(function (slide, n) {
      var active = n === current;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", active ? "false" : "true");
      if ("inert" in slide) slide.inert = !active;
    });

    this.dots.forEach(function (dot, n) {
      dot.setAttribute("aria-current", n === current ? "true" : "false");
    });
  };

  // User-initiated change: announce politely and restart the timer.
  Carousel.prototype.userGo = function (i) {
    this.live.setAttribute("aria-live", "polite");
    this.go(i);
    this.restart();
  };

  Carousel.prototype.setupAutoplay = function () {
    if (!this.delay) return;
    var self = this;

    var pause = function () { self.paused = true; self.stop(); };
    var resume = function () { self.paused = false; self.restart(); };

    this.root.addEventListener("mouseenter", pause);
    this.root.addEventListener("mouseleave", resume);
    this.root.addEventListener("focusin", pause);
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

    DS.onReducedMotionChange(function () { self.restart(); });
    this.restart();
  };

  Carousel.prototype.stop = function () {
    window.clearInterval(this.timer);
    this.timer = null;
  };

  Carousel.prototype.restart = function () {
    this.stop();
    if (!this.delay || this.paused || !this.inView || document.hidden || DS.prefersReducedMotion()) return;
    var self = this;
    this.live.setAttribute("aria-live", "off");
    this.timer = window.setInterval(function () {
      self.go(self.index + 1);
    }, this.delay);
  };

  DS.initCarousels = function () {
    DS.qsa("[data-carousel]").forEach(function (root) {
      root.dsCarousel = new Carousel(root);
    });
  };
})(window.DS);
