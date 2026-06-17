/* Adaptive HLS for the long case-study clips.
   Markup: <video data-hls="…/master.m3u8" src="…fallback.mp4" poster="…"> .
   • Safari / iOS  → native HLS: point the element straight at the manifest.
   • Other browsers → hls.js (vendored). Loading is deferred (autoStartLoad:false)
     until an IntersectionObserver reports the clip is near the viewport, so it
     stays lazy alongside js/lazy-media.js.
   • No JS / HLS unsupported → the plain-MP4 src plays as a fallback.
   Playback gating (in-view + prefers-reduced-motion) is still handled by
   js/reduced-motion-video.js, which keys off the same <video> element. */
(function () {
  var vids = document.querySelectorAll('video[data-hls]');
  if (!vids.length) return;
  var HlsLib = window.Hls;

  vids.forEach(function (v) {
    var src = v.getAttribute('data-hls');

    // Prefer hls.js wherever MSE is supported (Chrome/Firefox + desktop Safari).
    // It fetches the manifest/segments itself, so it doesn't depend on the host
    // sending the right .m3u8 / .ts MIME types (GitHub Pages is unreliable there).
    if (!HlsLib || !HlsLib.isSupported()) {
      // No MSE (e.g. iPhone Safari): use the browser's native HLS if present,
      // otherwise leave the existing MP4 src as the fallback.
      if (v.canPlayType('application/vnd.apple.mpegurl')) v.setAttribute('src', src);
      return;
    }

    var hls = new HlsLib({ capLevelToPlayerSize: true, autoStartLoad: false });
    hls.loadSource(src);
    hls.attachMedia(v);

    var started = false;
    var begin = function () { if (!started) { started = true; hls.startLoad(); } };

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { begin(); io.disconnect(); }
        });
      }, { rootMargin: '300px 0px' });
      io.observe(v);
    } else {
      begin();
    }
    // Safety: if the user hits play (controls) before the observer fires.
    v.addEventListener('play', begin);
  });
})();
