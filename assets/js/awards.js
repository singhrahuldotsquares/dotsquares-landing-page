/*
 * Partners & Awards — achievements slider (sliding track, one slide at a time).
 * Mirrors the live reference: 0.45s slide, autoplay every 3s, looping arrows.
 * Additionally pauses on hover/focus, off-screen, when the tab is hidden,
 * and is fully manual under prefers-reduced-motion.
 *
 * Markup hooks:
 *   [data-achv]            root
 *   [data-achv-track]      flex track of slides
 *   [data-achv-slide]      each slide
 *   [data-achv-prev|next]  arrow buttons
 *   [data-achv-toggle]     pause/play button (visible on keyboard focus)
 *   [data-achv-status]     visually hidden live region ("Slide 2 of 8")
 */
(function (DS) {
  "use strict";

  var INTERVAL = 3000;

  function Achievements(root) {
    this.root = root;
    this.track = DS.qs("[data-achv-track]", root);
    this.slides = DS.qsa("[data-achv-slide]", root);
    this.status = DS.qs("[data-achv-status]", root);
    this.toggle = DS.qs("[data-achv-toggle]", root);
    this.index = 0;
    this.timer = null;
    this.hovered = false;
    this.focused = false;
    this.inView = false;
    this.userPaused = false;
    if (!this.track || this.slides.length < 2) return;

    this.bind();
    this.go(0, false);
    this.restart();
  }

  Achievements.prototype.go = function (i, announce) {
    var total = this.slides.length;
    this.index = (i + total) % total;
    var current = this.index;
    this.track.style.transform = "translateX(" + current * -100 + "%)";
    this.slides.forEach(function (slide, n) {
      var on = n === current;
      slide.setAttribute("aria-hidden", on ? "false" : "true");
      if ("inert" in slide) slide.inert = !on;
    });

    // Slides sit off to the side, so lazy images would never start loading;
    // fetch the current and next slide ahead of time.
    [current, (current + 1) % total].forEach(function (n) {
      var img = DS.qs("img", this.slides[n]);
      if (img && img.loading === "lazy") img.loading = "eager";
    }, this);
    if (announce && this.status) {
      this.status.textContent = "Slide " + (current + 1) + " of " + total + ": " +
        DS.qs("h3", this.slides[current]).textContent;
    }
  };

  Achievements.prototype.step = function (delta) {
    this.go(this.index + delta, true);
    this.restart();
  };

  Achievements.prototype.restart = function () {
    window.clearInterval(this.timer);
    this.timer = null;
    var blocked = this.hovered || this.focused || this.userPaused || !this.inView ||
      document.hidden || DS.prefersReducedMotion();
    this.root.classList.toggle("is-paused", blocked);
    if (blocked) return;
    var self = this;
    this.timer = window.setInterval(function () {
      self.go(self.index + 1, false);
    }, INTERVAL);
  };

  Achievements.prototype.setUserPaused = function (paused) {
    this.userPaused = paused;
    if (this.toggle) {
      this.toggle.setAttribute("aria-pressed", paused ? "true" : "false");
      this.toggle.textContent = paused ? "Play slideshow" : "Pause slideshow";
    }
    this.restart();
  };

  Achievements.prototype.bind = function () {
    var self = this;
    var prev = DS.qs("[data-achv-prev]", this.root);
    var next = DS.qs("[data-achv-next]", this.root);
    if (prev) prev.addEventListener("click", function () { self.step(-1); });
    if (next) next.addEventListener("click", function () { self.step(1); });

    if (this.toggle) {
      this.toggle.addEventListener("click", function () {
        self.setUserPaused(!self.userPaused);
      });
    }

    this.root.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") { event.preventDefault(); self.step(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); self.step(1); }
    });

    this.root.addEventListener("mouseenter", function () { self.hovered = true; self.restart(); });
    this.root.addEventListener("mouseleave", function () { self.hovered = false; self.restart(); });
    this.root.addEventListener("focusin", function () { self.focused = true; self.restart(); });
    this.root.addEventListener("focusout", function (event) {
      if (!self.root.contains(event.relatedTarget)) { self.focused = false; self.restart(); }
    });

    // Swipe on touch / pen. The viewport has touch-action: pan-y, so vertical
    // drags still scroll the page while horizontal ones reach us. Gestures that
    // start on a button are ignored, taps never change the slide, and one
    // gesture can only move one slide.
    var start = null;
    var lockUntil = 0;
    var viewport = DS.qs(".achv__viewport", this.root) || this.root;
    viewport.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse" || event.target.closest("button, a")) return;
      start = { x: event.clientX, y: event.clientY };
    });
    viewport.addEventListener("pointerup", function (event) {
      if (!start) return;
      var dx = event.clientX - start.x;
      var dy = event.clientY - start.y;
      start = null;
      var now = Date.now();
      if (now < lockUntil) return;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        lockUntil = now + 450; // the slide transition length
        self.step(dx < 0 ? 1 : -1);
      }
    });
    viewport.addEventListener("pointercancel", function () { start = null; });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        self.inView = entries[0].isIntersecting;
        self.restart();
      }, { threshold: 0.25 }).observe(this.root);
    } else {
      this.inView = true;
    }

    document.addEventListener("visibilitychange", function () { self.restart(); });
    DS.onReducedMotionChange(function () { self.restart(); });
  };

  // Partnerships / Awards toggle: an ARIA tablist showing one logo panel.
  function initTabs(root) {
    var tabs = DS.qsa("[data-awards-tab]", root);
    if (!tabs.length) return;
    var select = function (index, focus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(tab.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
        if (on && focus) tab.focus();
      });
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(i, false); });
      tab.addEventListener("keydown", function (event) {
        var last = tabs.length - 1;
        var next = null;
        if (event.key === "ArrowRight") next = i === last ? 0 : i + 1;
        if (event.key === "ArrowLeft") next = i === 0 ? last : i - 1;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = last;
        if (next === null) return;
        event.preventDefault();
        select(next, true);
      });
    });
  }

  DS.initAwards = function () {
    DS.qsa("[data-achv]").forEach(function (root) {
      root.dsAchievements = new Achievements(root);
    });
    var section = DS.qs("#awards");
    if (section) initTabs(section);
  };
})(window.DS);
