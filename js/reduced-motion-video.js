/* Case-study video playback — accessible by default.
   The case-study <video data-autoplay> clips would otherwise use native
   autoplay, which (a) ignores prefers-reduced-motion and (b) loops forever
   with no pause affordance (WCAG 2.2.2). This script takes control:
     • prefers-reduced-motion: reduce  → leave paused on the first frame.
     • otherwise                        → play only while in view, pause when
                                          scrolled away (also saves bandwidth).
   The HTML carries data-autoplay (not the native autoplay attribute), so a
   reduced-motion user never sees a flash of motion before JS runs. */
(function () {
  var vids = Array.prototype.slice.call(document.querySelectorAll('video[data-autoplay]'));
  if (!vids.length) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  vids.forEach(function (v) { v.muted = true; });

  if (reduce || !('IntersectionObserver' in window)) {
    // Static: make sure a frame is shown, never played.
    vids.forEach(function (v) { try { v.pause(); } catch (e) {} });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting && e.intersectionRatio >= 0.35) {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        v.pause();
      }
    });
  }, { threshold: [0, 0.35, 0.6] });

  vids.forEach(function (v) { io.observe(v); });

  // Pause everything when the tab is hidden.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) vids.forEach(function (v) { try { v.pause(); } catch (e) {} });
  });
})();
