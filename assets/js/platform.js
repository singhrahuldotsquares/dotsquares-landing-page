/*
 * Platform section: customer-journey tabs.
 *
 * Markup:
 *   [data-platform]            section root; optional data-autoplay="ms"
 *   [role=tab] .pf-step        journey steps (in order)
 *   [role=tabpanel] .pf-panel  one panel per step (hidden unless active)
 *   .pf__steps                 gets --pf-progress (rail fill, 0-100%)
 *
 * Auto-advances while the section is on screen. Pauses on hover / keyboard
 * focus inside the stage, when the tab is hidden, and never runs under
 * prefers-reduced-motion. Without JS every panel is simply visible.
 */
(function (DS) {
  "use strict";

  function Platform(root) {
    this.root = root;
    this.tabs = DS.qsa('.pf-step[role="tab"]', root);
    this.panels = DS.qsa(".pf-panel", root);
    this.steps = DS.qs(".pf__steps", root);
    this.stage = DS.qs(".pf__stage", root);
    this.delay = parseInt(root.getAttribute("data-autoplay"), 10) || 0;
    this.index = Math.max(
      0,
      this.tabs.findIndex(function (t) {
        return t.getAttribute("aria-selected") === "true";
      })
    );
    this.timer = null;
    this.paused = false;
    this.inView = false;

    root.style.setProperty("--pf-dur", this.delay + "ms");
    this.bind();
    this.show(this.index, false);
    this.setupAutoplay();
  }

  Platform.prototype.show = function (i, scrollTab) {
    var n = this.tabs.length;
    this.index = ((i % n) + n) % n;
    var cur = this.index;

    this.tabs.forEach(function (tab, k) {
      var on = k === cur;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
      tab.classList.toggle("is-active", on);
      tab.classList.toggle("is-done", k < cur);
    });

    this.panels.forEach(function (panel, k) {
      panel.hidden = k !== cur;
    });

    if (this.steps) {
      this.steps.style.setProperty("--pf-progress", (cur / (n - 1)) * 100 + "%");
    }

    // On phones the step row scrolls sideways: keep the active step in view.
    if (scrollTab && this.steps && this.steps.scrollWidth > this.steps.clientWidth) {
      var tab = this.tabs[cur];
      var left = tab.offsetLeft - (this.steps.clientWidth - tab.offsetWidth) / 2;
      this.steps.scrollTo({ left: left, behavior: DS.prefersReducedMotion() ? "auto" : "smooth" });
    }
  };

  Platform.prototype.userGo = function (i) {
    this.show(i, true);
    this.restart();
  };

  Platform.prototype.bind = function () {
    var self = this;

    this.tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        self.userGo(i);
      });

      tab.addEventListener("keydown", function (e) {
        var last = self.tabs.length - 1;
        var next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i === last ? 0 : i + 1;
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i === 0 ? last : i - 1;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = last;
        if (next === null) return;
        e.preventDefault();
        self.userGo(next);
        self.tabs[next].focus();
      });
    });

    // Swipe the stage card on touch devices.
    if (this.stage) {
      var startX = null;
      this.stage.addEventListener("pointerdown", function (e) {
        if (e.pointerType !== "mouse") startX = e.clientX;
      });
      this.stage.addEventListener("pointerup", function (e) {
        if (startX === null) return;
        var dx = e.clientX - startX;
        startX = null;
        if (Math.abs(dx) > 50) self.userGo(self.index + (dx < 0 ? 1 : -1));
      });
    }
  };

  Platform.prototype.setupAutoplay = function () {
    if (!this.delay || DS.prefersReducedMotion()) return;
    var self = this;

    var pause = function () {
      self.paused = true;
      self.stop();
    };
    var resume = function () {
      self.paused = false;
      self.restart();
    };

    // Reading a card should not be interrupted.
    if (this.stage) {
      this.stage.addEventListener("mouseenter", pause);
      this.stage.addEventListener("mouseleave", resume);
    }
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
      new IntersectionObserver(
        function (entries) {
          self.inView = entries[0].isIntersecting;
          self.restart();
        },
        { threshold: 0.35 }
      ).observe(this.root);
    } else {
      this.inView = true;
      this.restart();
    }

    DS.onReducedMotionChange(function () {
      if (DS.prefersReducedMotion()) {
        self.delay = 0;
        self.stop();
      }
    });
  };

  Platform.prototype.stop = function () {
    window.clearInterval(this.timer);
    this.timer = null;
    this.root.classList.remove("is-playing");
  };

  Platform.prototype.restart = function () {
    this.stop();
    if (!this.delay || this.paused || !this.inView || document.hidden) return;
    var self = this;
    // Re-adding the class on the next frame restarts the timer-bar animation.
    window.requestAnimationFrame(function () {
      if (self.timer) self.root.classList.add("is-playing");
    });
    this.timer = window.setInterval(function () {
      self.show(self.index + 1, true);
      self.root.classList.remove("is-playing");
      window.requestAnimationFrame(function () {
        if (self.timer) self.root.classList.add("is-playing");
      });
    }, this.delay);
  };

  DS.initPlatform = function () {
    DS.qsa("[data-platform]").forEach(function (root) {
      if (DS.qsa(".pf-panel", root).length > 1) new Platform(root);
    });
  };
})(window.DS);
