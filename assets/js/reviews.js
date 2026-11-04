/*
 * "What Our Clients Say" — multi-card carousel driven by pagination dots,
 * matching the live reference (no arrows, no autoplay, 0.5s slide).
 * Cards per view: 3 (>= 1024px), 2 (>= 640px), 1 (phones); the card gap is
 * read from CSS. One dot per
 * reachable position, so 8 reviews give 6 / 7 / 8 dots.
 *
 * Markup hooks:
 *   [data-reviews]          root; optional data-reviews-start="index"
 *   [data-reviews-track]    flex track
 *   [data-reviews-slide]    each review
 *   [data-reviews-dots]     empty container for the dot buttons
 *   [data-reviews-status]   visually hidden live region
 */
(function (DS) {
  "use strict";

  var QUERIES = [
    { mq: window.matchMedia("(min-width: 1024px)"), per: 3 },
    { mq: window.matchMedia("(min-width: 640px)"), per: 2 }
  ];

  function perView() {
    for (var i = 0; i < QUERIES.length; i++) {
      if (QUERIES[i].mq.matches) return QUERIES[i].per;
    }
    return 1;
  }

  function Reviews(root) {
    this.root = root;
    this.track = DS.qs("[data-reviews-track]", root);
    this.slides = DS.qsa("[data-reviews-slide]", root);
    this.dotsEl = DS.qs("[data-reviews-dots]", root);
    this.status = DS.qs("[data-reviews-status]", root);
    this.per = 0;
    this.index = parseInt(root.getAttribute("data-reviews-start"), 10) || 0;
    if (!this.track || !this.slides.length) return;

    this.layout();
    this.bind();
  }

  Reviews.prototype.positions = function () {
    return Math.max(1, this.slides.length - this.per + 1);
  };

  // Recompute cards-per-view and rebuild the dots when the breakpoint changes.
  Reviews.prototype.layout = function () {
    var per = perView();
    if (per === this.per) {
      this.go(this.index, false); // gap may have changed at the 640px breakpoint
      return;
    }
    this.per = per;
    this.root.style.setProperty("--reviews-per", per);
    this.buildDots();
    this.go(Math.min(this.index, this.positions() - 1), false);
  };

  Reviews.prototype.buildDots = function () {
    var self = this;
    var total = this.slides.length;
    this.dotsEl.textContent = "";
    this.dots = [];
    for (var i = 0; i < this.positions(); i++) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "reviews__dot";
      var first = i + 1;
      var last = Math.min(i + this.per, total);
      dot.setAttribute("aria-label", first === last
        ? "Show review " + first + " of " + total
        : "Show reviews " + first + " to " + last + " of " + total);
      dot.addEventListener("click", this.onDot.bind(this, i));
      dot.addEventListener("keydown", this.onDotKey.bind(this, i));
      this.dotsEl.appendChild(dot);
      this.dots.push(dot);
    }
    // Hide the control row when everything already fits.
    this.dotsEl.hidden = this.dots.length < 2;
  };

  Reviews.prototype.onDot = function (i) {
    this.go(i, true);
  };

  Reviews.prototype.onDotKey = function (i, event) {
    var last = this.dots.length - 1;
    var next = null;
    if (event.key === "ArrowRight") next = Math.min(i + 1, last);
    if (event.key === "ArrowLeft") next = Math.max(i - 1, 0);
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    this.go(next, true);
    this.dots[next].focus();
  };

  Reviews.prototype.go = function (i, announce) {
    var max = this.positions() - 1;
    this.index = Math.max(0, Math.min(i, max));
    var per = this.per;
    var current = this.index;
    // Read the gap from CSS so breakpoint changes (32px / 16px) stay in sync.
    var gap = parseFloat(window.getComputedStyle(this.track).columnGap) || 0;

    this.track.style.transform = "translateX(calc(" + -current + " * ((100% - " +
      (per - 1) * gap + "px) / " + per + " + " + gap + "px)))";

    this.slides.forEach(function (slide, n) {
      var visible = n >= current && n < current + per;
      slide.setAttribute("aria-hidden", visible ? "false" : "true");
      if ("inert" in slide) slide.inert = !visible;
    });
    this.dots.forEach(function (dot, n) {
      var on = n === current;
      dot.classList.toggle("is-active", on);
      dot.setAttribute("aria-current", on ? "true" : "false");
    });

    if (announce && this.status) {
      var names = this.slides.slice(current, current + per).map(function (s) {
        return DS.qs(".review__name", s).textContent;
      });
      this.status.textContent = "Showing reviews from " + names.join(", ");
    }
  };

  Reviews.prototype.bind = function () {
    var self = this;
    QUERIES.forEach(function (q) {
      var onChange = function () { self.layout(); };
      if (q.mq.addEventListener) q.mq.addEventListener("change", onChange);
      else if (q.mq.addListener) q.mq.addListener(onChange);
    });

    // Swipe on touch / pen.
    var startX = null;
    var viewport = DS.qs(".reviews__viewport", this.root);
    viewport.addEventListener("pointerdown", function (event) {
      if (event.pointerType !== "mouse") startX = event.clientX;
    });
    viewport.addEventListener("pointerup", function (event) {
      if (startX === null) return;
      var dx = event.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) self.go(self.index + (dx < 0 ? 1 : -1), true);
    });
    viewport.addEventListener("pointercancel", function () { startX = null; });
  };

  DS.initReviews = function () {
    DS.qsa("[data-reviews]").forEach(function (root) {
      root.dsReviews = new Reviews(root);
    });
  };
})(window.DS);
