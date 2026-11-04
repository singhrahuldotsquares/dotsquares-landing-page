/* Soft 3D tilt: [data-tilt] hosts tilt their [data-tilt-inner] (or themselves)
   towards the pointer, then ease back on leave. Mouse / trackpad only, and
   skipped entirely for reduced-motion users. */
(function (DS) {
  "use strict";

  var MAX_DEG = 6; // maximum rotation on either axis
  var LIFT = 1.025; // slight scale-up while hovered
  var EASE = 0.12; // 0–1, higher = snappier follow

  DS.initTilt = function () {
    var hosts = DS.qsa("[data-tilt]");
    if (!hosts.length) return;
    if (DS.prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    hosts.forEach(function (host) {
      var target = DS.qs("[data-tilt-inner]", host) || host;
      var cur = { x: 0, y: 0, s: 1 };
      var goal = { x: 0, y: 0, s: 1 };
      var frame = 0;

      target.style.willChange = "transform";

      var render = function () {
        cur.x += (goal.x - cur.x) * EASE;
        cur.y += (goal.y - cur.y) * EASE;
        cur.s += (goal.s - cur.s) * EASE;

        var settled =
          Math.abs(goal.x - cur.x) < 0.01 &&
          Math.abs(goal.y - cur.y) < 0.01 &&
          Math.abs(goal.s - cur.s) < 0.0005;

        if (settled && goal.s === 1) {
          target.style.transform = "";
          frame = 0;
          return;
        }

        target.style.transform =
          "perspective(1000px) rotateX(" + cur.x.toFixed(2) + "deg) rotateY(" + cur.y.toFixed(2) +
          "deg) scale3d(" + cur.s.toFixed(4) + "," + cur.s.toFixed(4) + ",1)";
        frame = requestAnimationFrame(render);
      };

      var start = function () {
        if (!frame) frame = requestAnimationFrame(render);
      };

      host.addEventListener("pointermove", function (e) {
        if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
        var box = host.getBoundingClientRect();
        var px = (e.clientX - box.left) / box.width - 0.5;
        var py = (e.clientY - box.top) / box.height - 0.5;
        goal.x = -py * MAX_DEG * 2;
        goal.y = px * MAX_DEG * 2;
        goal.s = LIFT;
        start();
      });

      host.addEventListener("pointerleave", function () {
        goal.x = 0;
        goal.y = 0;
        goal.s = 1;
        start();
      });
    });
  };
})(window.DS);
