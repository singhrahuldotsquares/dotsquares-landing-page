/*
 * Client reviews carousel: arrows + pagination dots, 0.5s slide.
 * Cards per view: 3 (>= 1024px), 2 (>= 640px), 1 (phones); the card gap is
 * read from CSS. One dot per page of cards.
 *
 * It loops endlessly: after the last page it keeps sliding in the same
 * direction onto cloned first-page cards, then silently snaps back (and the
 * same in reverse for "previous" on the first page). It also advances by
 * itself every 5 seconds (paused on hover/focus/touch, when the tab or section
 * is not visible, and disabled for prefers-reduced-motion).
 *
 * Markup hooks:
 *   [data-reviews]          root; optional data-reviews-start="index"
 *   [data-reviews-track]    flex track
 *   [data-reviews-slide]    each review
 *   [data-reviews-dots]     empty container for the dot buttons
 *   [data-reviews-prev|next] arrow buttons
 *   [data-reviews-status]   visually hidden live region
 */
(function (DS) {
  "use strict";

  var AUTOPLAY_MS = 5000;

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
    this.prev = DS.qs("[data-reviews-prev]", root);
    this.next = DS.qs("[data-reviews-next]", root);
    this.timer = null;
    this.snapTimer = null;
    this.clones = [];
    this.paused = false;
    this.inView = true;
    this.per = 0;
    this.index = parseInt(root.getAttribute("data-reviews-start"), 10) || 0;
    if (!this.track || !this.slides.length) return;

    this.layout();
    this.bind();
  }

  // One position per "page" of cards; the last page is pulled back so it never
  // shows an empty slot (the final index is slides - per).
  Reviews.prototype.positions = function () {
    return Math.max(1, Math.ceil(this.slides.length / this.per));
  };

  Reviews.prototype.startOf = function (page) {
    return Math.min(page * this.per, Math.max(0, this.slides.length - this.per));
  };

  // Recompute cards-per-view and rebuild the dots when the breakpoint changes.
  Reviews.prototype.layout = function () {
    var per = perView();
    if (per === this.per) {
      this.go(this.index, false, false); // gap may have changed at the 640px breakpoint
      return;
    }
    this.per = per;
    this.root.style.setProperty("--reviews-per", per);
    this.buildClones();
    this.buildDots();
    this.go(Math.min(this.index, this.positions() - 1), false, false);
  };

  // Endless loop: the first `per` slides are cloned after the last one. Going
  // forward from the last page slides onto the clones (they look identical to
  // the first page), then the track silently snaps back to the real first page.
  Reviews.prototype.buildClones = function () {
    var track = this.track;
    this.clones.forEach(function (c) { track.removeChild(c); });
    this.clones = [];
    for (var i = 0; i < this.per && i < this.slides.length; i++) {
      var clone = this.slides[i].cloneNode(true);
      clone.removeAttribute("data-reviews-slide");
      clone.setAttribute("aria-hidden", "true");
      clone.setAttribute("data-reviews-clone", "");
      if ("inert" in clone) clone.inert = true;
      DS.qsa("[id]", clone).forEach(function (el) { el.removeAttribute("id"); });
      DS.qsa("[aria-labelledby]", clone).forEach(function (el) { el.removeAttribute("aria-labelledby"); });
      track.appendChild(clone);
      this.clones.push(clone);
    }
  };

  // Move the track to a slide offset; animate=false jumps without a transition.
  Reviews.prototype.place = function (pos, animate) {
    var per = this.per;
    // Read the gap from CSS so breakpoint changes (32px / 16px) stay in sync.
    var gap = parseFloat(window.getComputedStyle(this.track).columnGap) || 0;
    if (!animate) this.track.style.transition = "none";
    this.track.style.transform = "translateX(calc(" + -pos + " * ((100% - " +
      (per - 1) * gap + "px) / " + per + " + " + gap + "px)))";
    if (!animate) {
      void this.track.offsetWidth; // commit the jump before transitions return
      this.track.style.transition = "";
    }
  };

  // Finish a pending wrap-around instantly (clone position -> real first page).
  Reviews.prototype.flush = function () {
    if (!this.snapTimer) return;
    window.clearTimeout(this.snapTimer);
    this.snapTimer = null;
    this.place(this.startOf(this.index), false);
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
      var first = this.startOf(i) + 1;
      var last = Math.min(first + this.per - 1, total);
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

  // Update dots / aria / live region for page i (does not move the track).
  Reviews.prototype.setState = function (i, announce) {
    var max = this.positions() - 1;
    this.index = Math.max(0, Math.min(i, max));
    var per = this.per;
    var current = this.startOf(this.index);
    var self = this;

    this.slides.forEach(function (slide, n) {
      var visible = n >= current && n < current + per;
      slide.setAttribute("aria-hidden", visible ? "false" : "true");
      if ("inert" in slide) slide.inert = !visible;
    });
    this.dots.forEach(function (dot, n) {
      var on = n === self.index;
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

  Reviews.prototype.go = function (i, announce, animate) {
    this.flush();
    this.setState(i, announce);
    this.place(this.startOf(this.index), animate !== false);
  };

  // Step by one page. Wrapping is seamless: it keeps sliding in the same
  // direction instead of rewinding the whole track.
  Reviews.prototype.step = function (dir, announce) {
    var self = this;
    var n = this.positions();
    if (n < 2) return;
    this.flush();
    var last = n - 1;

    if (dir > 0 && this.index === last) {
      this.setState(0, announce);
      this.place(this.slides.length, true); // slide onto the cloned first page
      this.snapTimer = window.setTimeout(function () {
        self.snapTimer = null;
        self.place(self.startOf(self.index), false);
      }, 560);
    } else if (dir < 0 && this.index === 0) {
      this.place(this.slides.length, false); // same picture as page 1, off the end
      this.setState(last, announce);
      this.place(this.startOf(last), true);
    } else {
      this.go(this.index + dir, announce);
    }
  };

  Reviews.prototype.play = function () {
    var self = this;
    this.stop();
    if (this.paused || !this.inView || document.hidden) return;
    if (this.positions() < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    this.timer = window.setInterval(function () { self.step(1, false); }, AUTOPLAY_MS);
  };

  Reviews.prototype.stop = function () {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
  };

  Reviews.prototype.bind = function () {
    var self = this;

    // Arrows (manual navigation restarts the 5s timer).
    if (this.prev) this.prev.addEventListener("click", function () { self.step(-1, true); self.play(); });
    if (this.next) this.next.addEventListener("click", function () { self.step(1, true); self.play(); });
    this.dotsEl.addEventListener("click", function () { self.play(); });

    // Autoplay pauses while the user is interacting or the section is off screen.
    var pause = function () { self.paused = true; self.stop(); };
    var resume = function () { self.paused = false; self.play(); };
    this.root.addEventListener("mouseenter", pause);
    this.root.addEventListener("mouseleave", resume);
    this.root.addEventListener("focusin", pause);
    this.root.addEventListener("focusout", resume);
    this.root.addEventListener("touchstart", pause, { passive: true });
    this.root.addEventListener("touchend", function () {
      window.setTimeout(resume, 3000);
    }, { passive: true });
    document.addEventListener("visibilitychange", function () { self.play(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        self.inView = entries[0].isIntersecting;
        self.play();
      }, { threshold: 0.2 }).observe(this.root);
    }

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
      if (Math.abs(dx) > 40) { self.step(dx < 0 ? 1 : -1, true); self.play(); }
    });
    viewport.addEventListener("pointercancel", function () { startX = null; });

    this.play();
  };

  DS.initReviews = function () {
    DS.qsa("[data-reviews]").forEach(function (root) {
      root.dsReviews = new Reviews(root);
    });
  };
})(window.DS);
