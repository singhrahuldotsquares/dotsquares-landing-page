/*
 * UK / US region switching.
 *
 * An inline script in <head> picks a region before first paint and stamps it on
 * <html data-region="uk|us" data-region-source="manual|auto">:
 *   1. ?region=uk|us in the URL                        -> manual
 *   2. a UK/US switch click earlier this session         -> manual
 *   3. the visitor's IP country, if looked up this session -> auto
 *   4. otherwise a first guess from the device timezone   -> auto
 *      (America/* = US, else UK)
 *
 * For "auto", this module then looks up the visitor's IP country (so a VPN or
 * a laptop set to another timezone still gets the right region): US -> US,
 * anything else -> UK. The result is cached for the session. A manual choice
 * is never overridden, and choices last for the browser session only, so the
 * next visit detects the location again.
 *
 * Copy and flags swap in CSS (assets/css/region.css) via [data-only="uk|us"].
 * This module handles what CSS cannot:
 *   [data-region-set="uk|us"]      header buttons that change the region
 *   [data-src-uk] / [data-src-us]  images whose src depends on the region
 *                                  (the waving flag on the lead card)
 *   [data-phone-cc]                the phone country code: always +44 for UK and
 *                                  +1 for US; picking one in the form switches region
 *
 * Privacy: the IP lookup sends the visitor's IP address to a third-party
 * service (api.country.is, falling back to get.geojs.io). Mention this in the
 * privacy notice, or replace lookupCountry() with a country header from your
 * host (e.g. Cloudflare's CF-IPCountry) if one is available.
 *
 * Must run before DS.initFlag() and DS.initForms() (see main.js).
 */
(function (DS) {
  "use strict";

  var KEY = "ds-region";
  var GEO_KEY = "ds-geo";
  var GEO_TIMEOUT = 3000;
  var GEO_SERVICES = [
    "https://api.country.is/",
    "https://get.geojs.io/v1/ip/country.json"
  ];
  var PHONE = { uk: "+44", us: "+1" };
  var root = document.documentElement;

  function current() {
    return root.getAttribute("data-region") === "us" ? "us" : "uk";
  }

  function isManual() {
    return root.getAttribute("data-region-source") === "manual";
  }

  function store(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch (e) { /* storage blocked */ }
  }

  function read(key) {
    try { return window.sessionStorage.getItem(key) || ""; } catch (e) { return ""; }
  }

  function apply(region) {
    root.setAttribute("data-region", region);
    root.lang = region === "us" ? "en-US" : "en-GB";

    DS.qsa("[data-src-" + region + "]").forEach(function (img) {
      var src = img.getAttribute("data-src-" + region);
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    });

    DS.qsa("[data-region-set]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-region-set") === region ? "true" : "false");
    });

    // The phone country code always follows the region (flag + code).
    DS.qsa("[data-phone-cc]").forEach(function (select) {
      var value = PHONE[region];
      // Read first: changing defaultSelected can itself move the selection.
      var before = select.value;
      Array.prototype.forEach.call(select.options, function (opt) {
        opt.defaultSelected = opt.value === value;
      });
      select.value = value;
      // Let forms.js redraw the flag/code; region.js ignores it (same region).
      if (before !== value) select.dispatchEvent(new Event("change"));
    });
  }

  function choose(region) {
    root.setAttribute("data-region-source", "manual");
    store(KEY, region);
    apply(region);
  }

  function regionForCountry(code) {
    return code === "US" ? "us" : "uk";
  }

  // Ask each service in turn for the visitor's two-letter country code.
  function lookupCountry(index, done) {
    if (index >= GEO_SERVICES.length || !window.fetch) return;
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = window.setTimeout(function () { if (ctrl) ctrl.abort(); }, GEO_TIMEOUT);

    window.fetch(GEO_SERVICES[index], { credentials: "omit", signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        window.clearTimeout(timer);
        var code = String((data && data.country) || "").toUpperCase();
        if (!/^[A-Z]{2}$/.test(code)) throw new Error("no country");
        done(code);
      })
      .catch(function () {
        window.clearTimeout(timer);
        lookupCountry(index + 1, done);
      });
  }

  DS.initRegion = function () {
    apply(current());

    DS.qsa("[data-region-set]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        choose(btn.getAttribute("data-region-set"));
      });
    });

    // Picking +44 / +1 in the phone field switches the whole page to match,
    // so the toggle, header number and flags never disagree with the form.
    DS.qsa("[data-phone-cc]").forEach(function (select) {
      select.addEventListener("change", function () {
        var region = select.value === PHONE.us ? "us" : "uk";
        if (region !== current()) choose(region);
      });
    });

    // Auto mode: correct the timezone guess with the visitor's IP country.
    if (!isManual() && !read(GEO_KEY)) {
      lookupCountry(0, function (code) {
        store(GEO_KEY, code);
        if (isManual()) return; // the visitor chose while we were waiting
        var region = regionForCountry(code);
        if (region !== current()) apply(region);
      });
    }
  };
})(window.DS);
