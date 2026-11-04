/*
 * "The HubSpot Journey" (Section 7): accessible tabs driving the details
 * panel and the diagram highlight. Content comes from DS.data.journey.
 *
 * Markup hooks:
 *   [data-journey]                 section root
 *   [data-journey-tab="key"]       role="tab" buttons (in data order)
 *   [data-journey-panel]           role="tabpanel"; [data-j="…"] slots inside
 *   [data-map-key="key"]           diagram cards ("hub" = centre)
 *   [data-map-link="key"]          diagram connector paths
 */
(function (DS) {
  "use strict";

  var SWITCH_MS = 180;

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function Journey(root, stages) {
    this.root = root;
    this.stages = stages;
    this.tabs = DS.qsa("[data-journey-tab]", root);
    this.panel = DS.qs("[data-journey-panel]", root);
    this.content = DS.qs("[data-journey-content]", root);
    this.cards = DS.qsa("[data-map-key]", root);
    this.links = DS.qsa("[data-map-link]", root);
    this.slots = {};
    var self = this;
    DS.qsa("[data-j]", this.panel).forEach(function (slot) {
      self.slots[slot.getAttribute("data-j")] = slot;
    });
    this.timer = null;
    this.tablist = DS.qs(".journey-tabs", root);
    this.delay = parseInt(root.getAttribute("data-autoplay"), 10) || 0;
    this.auto = null;
    this.paused = false;
    this.inView = false;

    var initial = this.tabs.findIndex(function (t) {
      return t.getAttribute("aria-selected") === "true";
    });
    this.index = initial < 0 ? 0 : initial;

    this.bind();
    this.applyState(this.index);
    this.setupAutoplay();
  }

  Journey.prototype.bind = function () {
    var self = this;

    this.tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        self.select(i);
      });

      tab.addEventListener("keydown", function (event) {
        var last = self.tabs.length - 1;
        var next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = i === last ? 0 : i + 1;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = i === 0 ? last : i - 1;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = last;
        if (next === null) return;
        event.preventDefault();
        self.select(next);
        self.tabs[next].focus();
      });
    });

    // Diagram cards are a pointer shortcut to the matching tab.
    this.cards.forEach(function (card) {
      card.addEventListener("click", function () {
        var key = card.getAttribute("data-map-key");
        var i = self.stages.findIndex(function (s) {
          return s.map === key;
        });
        if (i >= 0) self.select(i);
      });
    });
  };

  // Tabs, panel labelling and diagram highlight.
  Journey.prototype.applyState = function (index) {
    var stage = this.stages[index];
    var activeTab = this.tabs[index];

    this.tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
      tab.classList.toggle("is-active", on);
    });

    if (activeTab) this.panel.setAttribute("aria-labelledby", activeTab.id);

    this.cards.forEach(function (card) {
      card.classList.toggle("is-active", card.getAttribute("data-map-key") === stage.map);
    });
    this.links.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("data-map-link") === stage.map);
    });
    this.root.setAttribute("data-active-stage", stage.key);
  };

  Journey.prototype.render = function (index) {
    var stage = this.stages[index];
    var s = this.slots;

    s.icon.src = stage.panelIcon || stage.icon;
    // A tab may supply its own label (e.g. "Foundation layer"); otherwise number it.
    s.stage.textContent = stage.stage || ("Stage " + pad(index + 1) + " of " + pad(this.stages.length));
    s.title.textContent = stage.title;
    s.desc.textContent = stage.desc;

    var list = s.features;
    var template = DS.qs("li", list);
    var items = stage.features.map(function (feature) {
      var li = template.cloneNode(true);
      var text = DS.qs(".journey-feature__text", li);
      text.textContent = "";
      text.appendChild(el("strong", "", feature[0]));
      text.appendChild(document.createElement("br"));
      text.appendChild(document.createTextNode(feature[1]));
      return li;
    });
    list.replaceChildren.apply(list, items);

    s.handoffIcon.src = stage.handoff.icon;
    s.handoffTitle.textContent = stage.handoff.title;
    s.handoffText.textContent = stage.handoff.text;
  };

  // Steps through the tabs on its own while the section is on screen. It
  // pauses while the details panel is hovered or a control has keyboard
  // focus, and never runs under prefers-reduced-motion.
  Journey.prototype.setupAutoplay = function () {
    if (!this.delay || DS.prefersReducedMotion()) return;
    var self = this;

    var pause = function () {
      self.paused = true;
      self.stopAuto();
    };
    var resume = function () {
      self.paused = false;
      self.startAuto();
    };

    this.panel.addEventListener("mouseenter", pause);
    this.panel.addEventListener("mouseleave", resume);
    this.root.addEventListener("focusin", function (e) {
      if (e.target.matches && e.target.matches(":focus-visible")) pause();
    });
    this.root.addEventListener("focusout", function (e) {
      if (!self.root.contains(e.relatedTarget)) resume();
    });

    document.addEventListener("visibilitychange", function () {
      document.hidden ? self.stopAuto() : self.startAuto();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          self.inView = entries[0].isIntersecting;
          self.startAuto();
        },
        { threshold: 0.35 }
      ).observe(this.root);
    } else {
      this.inView = true;
      this.startAuto();
    }

    DS.onReducedMotionChange(function () {
      if (DS.prefersReducedMotion()) {
        self.delay = 0;
        self.stopAuto();
      }
    });
  };

  Journey.prototype.stopAuto = function () {
    window.clearInterval(this.auto);
    this.auto = null;
  };

  Journey.prototype.startAuto = function () {
    this.stopAuto();
    if (!this.delay || this.paused || !this.inView || document.hidden) return;
    var self = this;
    this.auto = window.setInterval(function () {
      self.select((self.index + 1) % self.tabs.length);
    }, this.delay);
  };

  // On phones the tab row scrolls sideways: keep the active tab in view
  // without scrolling the page itself.
  Journey.prototype.revealTab = function (index) {
    var bar = this.tablist;
    var tab = this.tabs[index];
    if (!bar || !tab || bar.scrollWidth <= bar.clientWidth) return;
    var left = tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2;
    bar.scrollTo({ left: left, behavior: DS.prefersReducedMotion() ? "auto" : "smooth" });
  };

  Journey.prototype.select = function (index) {
    if (index === this.index) return;
    var self = this;
    this.index = index;
    this.applyState(index);
    this.revealTab(index);
    this.startAuto(); // a manual pick restarts the 2s countdown

    window.clearTimeout(this.timer);
    if (DS.prefersReducedMotion()) {
      this.render(index);
      return;
    }

    this.content.classList.add("is-switching");
    this.timer = window.setTimeout(function () {
      self.render(index);
      self.content.classList.remove("is-switching");
      self.content.classList.add("is-entering");
      window.setTimeout(function () {
        self.content.classList.remove("is-entering");
      }, 600);
    }, SWITCH_MS);
  };

  DS.initJourney = function () {
    var root = DS.qs("[data-journey]");
    if (!root || !DS.data || !DS.data.journey) return;
    root.dsJourney = new Journey(root, DS.data.journey);
  };
})(window.DS);
