/*
 * Click-to-play YouTube videos. A button with [data-yt-video="<id>"] shows a
 * thumbnail; on click it is replaced, in the same box, by the YouTube player
 * starting playback (allowed because the user clicked). Nothing is loaded
 * from YouTube until then.
 *
 * Markup hooks:
 *   [data-yt-video]   video ID
 *   [data-yt-title]   iframe title (optional)
 */
(function (DS) {
  "use strict";

  function play(button) {
    var id = button.getAttribute("data-yt-video");
    if (!id || button.dsPlaying) return;
    button.dsPlaying = true; // guard against a double click creating two players

    var params = "autoplay=1&rel=0&playsinline=1&enablejsapi=1";
    if (/^https?:/.test(window.location.protocol)) {
      params += "&origin=" + encodeURIComponent(window.location.origin);
    }

    var frame = document.createElement("iframe");
    frame.src = "https://www.youtube.com/embed/" + encodeURIComponent(id) + "?" + params;
    frame.title = button.getAttribute("data-yt-title") || "YouTube video";
    frame.width = 679;
    frame.height = 412;
    frame.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
    frame.setAttribute("allowfullscreen", "");
    frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");

    button.replaceWith(frame);
    frame.focus();
    ensurePlaying(frame);
  }

  // Some browsers (notably iOS Safari) block autoplay with sound inside the
  // embed even after a click. Listen to the player (enablejsapi); if it has
  // not started shortly after loading, start it muted — always allowed — so
  // the click still plays the video. The viewer can unmute in the player.
  function ensurePlaying(frame) {
    var started = false;
    var send = function (msg) {
      if (frame.contentWindow) frame.contentWindow.postMessage(JSON.stringify(msg), "https://www.youtube.com");
    };
    var onMessage = function (event) {
      if (event.source !== frame.contentWindow) return;
      var data;
      try { data = typeof event.data === "string" ? JSON.parse(event.data) : event.data; } catch (e) { return; }
      var info = data && data.info;
      if (info && (info.playerState === 1 || (info.currentTime && info.currentTime > 0))) {
        started = true;
        window.removeEventListener("message", onMessage);
      }
    };
    window.addEventListener("message", onMessage);
    frame.addEventListener("load", function () {
      send({ event: "listening", id: 1, channel: "widget" });
      window.setTimeout(function () {
        if (started) return;
        send({ event: "command", func: "mute", args: [] });
        send({ event: "command", func: "playVideo", args: [] });
      }, 2500);
    });
  }

  DS.initVideos = function () {
    DS.qsa("[data-yt-video]").forEach(function (button) {
      button.addEventListener("click", function () { play(button); });
    });
  };
})(window.DS);
