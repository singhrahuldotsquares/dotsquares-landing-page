/*
 * Seamless logo marquee.
 *
 * Markup:
 *   [data-marquee]                  root (.logo-marquee)
 *     [data-marquee-track]          flex track
 *       [data-marquee-group]        the original list of logos
 *     [data-marquee-toggle]         pause/play button
 *
 * The group is cloned (aria-hidden) until the track covers the viewport
 * twice, then the track is translated by exactly one group width so the
 * loop is seamless. Speed is constant in px/s across breakpoints.
 */
(function (DS) {
  "use strict";

  // Defaults match the client logo strip; a marquee can override them with
  // data-marquee-speed (px per second) and data-marquee-offset (start px).
  var SPEED = 42; // px per second
  var START_OFFSET = 15; // px — Figma's strip starts at x = -15

  function Marquee(root) {
    this.root = root;
    this.track = DS.qs("[data-marquee-track]", root);
    this.group = DS.qs("[data-marquee-group]", root);
    this.toggle = DS.qs("[data-marquee-toggle]", root);
    this.speed = parseFloat(root.getAttribute("data-marquee-speed")) || SPEED;
    this.offset = root.hasAttribute("data-marquee-offset")
      ? parseFloat(root.getAttribute("data-marquee-offset")) || 0
      : START_OFFSET;
    this.userPaused = false;
    if (!this.track || !this.group) return;

    this.bind();
    this.update();
  }

  Marquee.prototype.clearClones = function () {
    DS.qsa("[data-marquee-clone]", this.track).forEach(function (el) {
      el.remove();
    });
  };

  Marquee.prototype.update = function () {
    this.clearClones();

    if (DS.prefersReducedMotion()) {
      this.root.classList.remove("is-running");
      this.root.scrollLeft = 0;
      if (this.toggle) this.toggle.hidden = true;
      return;
    }

    var groupWidth = this.group.getBoundingClientRect().width;
    if (!groupWidth) return;

    // Enough copies that the visible area is always filled during the loop.
    var copies = Math.max(1, Math.ceil((this.root.clientWidth * 2) / groupWidth) - 1);
    for (var i = 0; i < copies; i++) {
      var clone = this.group.cloneNode(true);
      clone.setAttribute("data-marquee-clone", "");
      clone.setAttribute("aria-hidden", "true");
      clone.removeAttribute("aria-label");
      clone.removeAttribute("data-marquee-group");
      DS.qsa("img", clone).forEach(function (img) {
        img.alt = "";
      });
      this.track.appendChild(clone);
    }

    this.track.style.setProperty("--marquee-shift", -groupWidth + "px");
    this.track.style.setProperty("--marquee-duration", (groupWidth / this.speed).toFixed(2) + "s");
    this.track.style.setProperty("--marquee-delay", (-this.offset / this.speed).toFixed(3) + "s");
    this.root.classList.add("is-running");
    this.root.scrollLeft = 0;
    if (this.toggle) this.toggle.hidden = false;
  };

  Marquee.prototype.setPaused = function (paused) {
    this.userPaused = paused;
    this.root.classList.toggle("is-paused", paused);
    if (this.toggle) {
      this.toggle.setAttribute("aria-pressed", paused ? "true" : "false");
      this.toggle.textContent = paused ? "Play logo animation" : "Pause logo animation";
    }
  };

  Marquee.prototype.bind = function () {
    var self = this;

    if (this.toggle) {
      this.toggle.addEventListener("click", function () {
        self.setPaused(!self.userPaused);
      });
    }

    // Touch users have no hover: a tap on the strip toggles pause.
    this.root.addEventListener("pointerup", function (e) {
      if (e.pointerType === "touch" && e.target !== self.toggle) self.setPaused(!self.userPaused);
    });

    // Pause while off-screen to save work.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        self.root.classList.toggle("is-offscreen", !entries[0].isIntersecting);
      }).observe(this.root);
    }

    // Recalculate when card sizes change (breakpoints) or fonts/images settle.
    var lastWidth = window.innerWidth;
    var resizeTimer;
    window.addEventListener("resize", function () {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        self.update();
      }, 150);
    });
    window.addEventListener("load", function () {
      self.update();
    });

    DS.onReducedMotionChange(function () {
      self.update();
    });
  };

  DS.initMarquees = function () {
    DS.qsa("[data-marquee]").forEach(function (root) {
      root.dsMarquee = new Marquee(root);
    });
  };
})(window.DS);
