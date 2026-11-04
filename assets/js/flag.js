/*
 * Waving flag on the lead card.
 *
 * The flag is a normal <img> (always visible, so nothing is lost without JS or
 * with reduced motion). When motion is allowed, a <canvas> is laid over it and
 * the image is redrawn one device-pixel column at a time, each column shifted
 * up/down along a travelling sine wave. Columns are drawn 1:1 (no skew, no
 * filter, whole-pixel offsets), so the artwork stays as sharp as the original.
 *
 * Markup:  <span class="lead-card__flag" data-flag><img ...></span>
 */
(function (DS) {
  "use strict";

  DS.initFlag = function () {
    var host = DS.qs("[data-flag]");
    var img = host && DS.qs("img", host);
    if (!host || !img || DS.prefersReducedMotion()) return;

    var canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = 1;
    var W = 0; // canvas size in device pixels
    var H = 0;
    var raf = 0;
    var visible = true;
    var start = performance.now();

    function size() {
      var r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      W = Math.max(1, Math.round(r.width * dpr));
      H = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
    }

    function draw(now) {
      raf = 0;
      var t = (now - start) / 1000;
      var sw = img.naturalWidth;
      var sh = img.naturalHeight;
      if (!sw || !sh) {
        schedule();
        return;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      var colSrc = sw / W; // source pixels per destination column
      var amp = 4.2 * dpr; // peak vertical travel (device px) at the free end
      var wave = 0.072 / dpr; // radians per device px

      for (var x = 0; x < W; x++) {
        var p = x / W;
        var phase = x * wave - t * 4.6;
        // Quiet near the card edge, livelier towards the free end.
        var y = (Math.sin(phase) + 0.28 * Math.sin(phase * 2.1 + 1.3)) * amp * (0.18 + 0.82 * p);
        // Whole-pixel offset: no vertical resampling, so no softness.
        ctx.drawImage(img, x * colSrc, 0, colSrc + 0.0001, sh, x, Math.round(y), 1, H);
      }

      // Soft light running along the cloth, only on pixels that are already drawn.
      ctx.globalCompositeOperation = "source-atop";
      for (var c = 0; c < W; c++) {
        var d = Math.cos(c * wave - t * 4.6);
        if (d > 0) {
          ctx.fillStyle = "rgba(255,255,255," + (0.13 * d * (0.3 + 0.7 * (c / W))).toFixed(3) + ")";
          ctx.fillRect(c, 0, 1, H);
        }
      }
      ctx.globalCompositeOperation = "source-over";

      schedule();
    }

    function schedule() {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(draw);
    }

    function go() {
      size();
      host.classList.add("is-live");
      schedule();
    }

    if (img.complete && img.naturalWidth) go();
    else img.addEventListener("load", go, { once: true });

    window.addEventListener("resize", size);
    document.addEventListener("visibilitychange", schedule);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        schedule();
      }).observe(host);
    }

    DS.onReducedMotionChange(function () {
      if (DS.prefersReducedMotion()) {
        visible = false;
        host.classList.remove("is-live"); // back to the still <img>
      }
    });
  };
})(window.DS);
