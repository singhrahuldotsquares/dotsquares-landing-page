/*
 * "CRM Migration": From -> To flow.
 *
 * Category chips pick which source tools are shown (logo tiles, from
 * DS.data.migration). A short loop then plays the migration story:
 *   step 0  tools appear
 *   step 1  Mapped
 *   step 2  De-duplicated
 *   step 3  Validated        (records tick off in HubSpot)
 *   step 4  Live in a clean Smart CRM
 * and moves on to the next category. The current step lives on the root as
 * data-step (CSS does the rest). Without JS, or with reduced motion, the
 * finished state (step 4) is simply shown.
 *
 * Markup hooks:
 *   [data-migration]            root (data-autoplay="on" to loop)
 *   [data-migration-tab]        role="tab" chips, in data order
 *   [data-migration-stage]      the tabpanel (hover / focus pauses the loop)
 *   [data-migration-title]      category heading
 *   [data-migration-tiles]      <ul> of logo tiles
 *   [data-migration-hub]        label inside the HubSpot circle
 *   .mg-step                    the four step markers
 */
(function (DS) {
  "use strict";

  // How long each step is held (ms), index = step. The five holds plus the
  // tile swap (SWITCH_MS) add up to 2000, so a new category starts every 2 s.
  var SWITCH_MS = 220;
  var HOLD = [250, 300, 300, 350, 580];

  function colsFor(n) {
    if (n <= 3) return n;
    if (n === 4) return 2;
    if (n <= 6) return 3;
    if (n <= 8) return 4;
    return n === 9 ? 3 : 4;
  }

  function Migration(root, categories) {
    this.root = root;
    this.categories = categories;
    this.tabs = DS.qsa("[data-migration-tab]", root);
    this.stage = DS.qs("[data-migration-stage]", root);
    this.titleEl = DS.qs("[data-migration-title]", root);
    this.tilesEl = DS.qs("[data-migration-tiles]", root);
    this.hubEl = DS.qs("[data-migration-hub]", root);
    this.steps = DS.qsa(".mg-step", root);
    this.autoplay = root.getAttribute("data-autoplay") === "on" && !DS.prefersReducedMotion();
    this.step = 4;
    this.timer = null;
    this.switchTimer = null;
    this.paused = false;
    this.inView = false;

    var initial = this.tabs.findIndex(function (t) {
      return t.getAttribute("aria-selected") === "true";
    });
    this.index = initial < 0 ? 0 : initial;

    this.bind();
    this.setStep(this.autoplay ? 0 : 4);
    if (this.autoplay) this.watch();
  }

  Migration.prototype.bind = function () {
    var self = this;
    this.tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        self.select(i);
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
        self.select(next);
        self.tabs[next].focus();
      });
    });
  };

  Migration.prototype.setStep = function (s) {
    this.step = s;
    this.root.setAttribute("data-step", s);
    this.steps.forEach(function (el, k) {
      el.classList.toggle("is-on", k < s);
      el.classList.toggle("is-now", k === s - 1);
    });
    this.root.style.setProperty("--mg-progress", (s / this.steps.length) * 100 + "%");
  };

  Migration.prototype.renderTiles = function (category) {
    var logos = category.logos || [];
    var list = this.tilesEl;
    list.style.setProperty("--cols", colsFor(logos.length));
    list.replaceChildren.apply(
      list,
      logos.map(function (item, n) {
        var li = document.createElement("li");
        li.className = "mg-tile";
        li.style.setProperty("--n", n);
        var img = document.createElement("img");
        img.src = item.src;
        img.alt = item.name;
        img.decoding = "async";
        li.appendChild(img);
        var ok = document.createElement("span");
        ok.className = "mg-tile__ok";
        ok.setAttribute("aria-hidden", "true");
        ok.innerHTML =
          '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M20 6 9 17l-5-5"/></svg>';
        li.appendChild(ok);
        return li;
      })
    );
    this.titleEl.textContent = category.label;
    this.hubEl.textContent = category.hub || "HubSpot";
  };

  Migration.prototype.select = function (index) {
    var self = this;
    var category = this.categories[index];
    var same = index === this.index;
    this.index = index;

    this.tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
      tab.classList.toggle("is-active", on);
    });
    this.stage.setAttribute("aria-labelledby", this.tabs[index].id);
    // keep the chosen chip in view in the sideways-scrolling strip
    var strip = this.tabs[index].parentNode;
    if (strip.scrollWidth > strip.clientWidth) {
      var tab = this.tabs[index];
      strip.scrollTo({
        left: tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2,
        behavior: DS.prefersReducedMotion() ? "auto" : "smooth"
      });
    }

    window.clearTimeout(this.timer);
    window.clearTimeout(this.switchTimer);

    if (DS.prefersReducedMotion() || same) {
      this.renderTiles(category);
      this.setStep(this.autoplay ? 0 : 4);
      this.schedule();
      return;
    }

    this.tilesEl.classList.add("is-out");
    this.setStep(0);
    this.switchTimer = window.setTimeout(function () {
      self.renderTiles(category);
      self.tilesEl.classList.remove("is-out");
      self.schedule();
    }, SWITCH_MS);
  };

  Migration.prototype.schedule = function () {
    var self = this;
    window.clearTimeout(this.timer);
    if (!this.autoplay || this.paused || !this.inView || document.hidden) return;
    this.timer = window.setTimeout(function () {
      if (self.step < 4) {
        self.setStep(self.step + 1);
        self.schedule();
      } else {
        self.select((self.index + 1) % self.categories.length);
      }
    }, HOLD[this.step]);
  };

  Migration.prototype.watch = function () {
    var self = this;
    var pause = function () {
      self.paused = true;
      window.clearTimeout(self.timer);
    };
    var resume = function () {
      self.paused = false;
      self.schedule();
    };

    // Reading the stage should not be interrupted.
    this.stage.addEventListener("mouseenter", pause);
    this.stage.addEventListener("mouseleave", resume);
    this.root.addEventListener("focusin", function (e) {
      if (e.target.matches && e.target.matches(":focus-visible")) pause();
    });
    this.root.addEventListener("focusout", function (e) {
      if (!self.root.contains(e.relatedTarget)) resume();
    });
    document.addEventListener("visibilitychange", function () {
      document.hidden ? window.clearTimeout(self.timer) : self.schedule();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          var was = self.inView;
          self.inView = entries[0].isIntersecting;
          if (self.inView && !was) {
            // replay the story from the top each time the section scrolls in
            self.setStep(0);
          }
          self.schedule();
        },
        { threshold: 0.3 }
      ).observe(this.root);
    } else {
      this.inView = true;
      this.schedule();
    }

    DS.onReducedMotionChange(function () {
      if (DS.prefersReducedMotion()) {
        self.autoplay = false;
        window.clearTimeout(self.timer);
        self.setStep(4);
      }
    });
  };

  DS.initMigration = function () {
    var root = DS.qs("[data-migration]");
    if (!root || !DS.data || !DS.data.migration) return;
    root.dsMigration = new Migration(root, DS.data.migration);
  };
})(window.DS);
