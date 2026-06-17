/* Lazy-load + skeleton shimmer for framed images & videos (site-wide).

   What it does, per eligible <img>/<video> inside a media frame:
   • Images get native loading="lazy" + decoding="async" (so lazy-loading still
     works with JS off — progressive enhancement, no blank images for no-JS).
   • Videos have their preload deferred (preload="none") until an
     IntersectionObserver reports the frame is near the viewport, then the
     original preload is restored so metadata/poster fetch only on approach.
   • A .media-shimmer skeleton is injected over each frame and fades out (via
     .is-media-loaded on the host) once the asset can paint — load for images,
     loadeddata/canplay for videos. This is also the buffering shimmer for the
     homepage loops and case-study clips.

   Failsafe: a timeout clears any shimmer that never received a load event, so
   content is never trapped behind a placeholder (matches the site's other
   reveal failsafes). Decorative imagery (aria-hidden, icons, in-button arrows)
   is skipped. */
(function () {
  'use strict';

  var FAILSAFE_MS = 8000;

  // Eligible media live in these framed containers only — skip icons/arrows.
  var HOST_SELECTOR = '.frame, .screen-frame, .preview-media, .about-portrait';

  function eligible(el) {
    if (el.getAttribute('aria-hidden') === 'true') return false;
    if (el.closest('button')) return false;
    if (!el.closest(HOST_SELECTOR)) return false;
    return true;
  }

  function hostFor(el) {
    return el.closest(HOST_SELECTOR) || el.parentElement;
  }

  var media = Array.prototype.filter.call(
    document.querySelectorAll('img, video'),
    eligible
  );
  if (!media.length) return;

  function markLoaded(host) {
    if (!host || host.classList.contains('is-media-loaded')) return;
    host.classList.add('is-media-loaded');
    var sh = host.querySelector(':scope > .media-shimmer');
    if (!sh) return;
    var drop = function () { if (sh && sh.parentNode) sh.parentNode.removeChild(sh); };
    sh.addEventListener('transitionend', drop, { once: true });
    setTimeout(drop, 600); // fallback if transitionend doesn't fire
  }

  media.forEach(function (el) {
    var host = hostFor(el);
    if (!host) return;

    // Shimmer host + overlay (only one per host).
    host.classList.add('is-shimmer-host');
    if (!host.querySelector(':scope > .media-shimmer')) {
      var sh = document.createElement('span');
      sh.className = 'media-shimmer';
      sh.setAttribute('aria-hidden', 'true');
      host.insertBefore(sh, host.firstChild);
    }

    if (el.tagName === 'IMG') {
      if (!el.hasAttribute('loading')) el.setAttribute('loading', 'lazy');
      if (!el.hasAttribute('decoding')) el.setAttribute('decoding', 'async');
      // Already cached / decoded → no shimmer flash.
      if (el.complete && el.naturalWidth > 0) {
        markLoaded(host);
      } else {
        el.addEventListener('load', function () { markLoaded(host); }, { once: true });
        el.addEventListener('error', function () { markLoaded(host); }, { once: true });
      }
    } else { // VIDEO
      // Don't touch preload/playback — cover-strip.js, reduced-motion-video.js and
      // hls-video.js already load lazily and play only in view. We just clear the
      // shimmer once something can paint. (Forcing preload="none" here broke
      // muted-autoplay loading on real iOS Safari, so it's been removed.)
      var clear = function () { markLoaded(host); };
      // Posters are the real placeholder: iOS doesn't preload video, so canplay
      // never fires until playback — clear the shimmer as soon as the poster is
      // ready so it doesn't sit for the full failsafe. The video plays over it.
      var poster = el.getAttribute('poster');
      if (poster) {
        // iOS often won't paint a <video poster> for a clip it hasn't loaded,
        // leaving a blank tile. Paint the poster as the host's CSS background
        // too — that always renders, and the video plays over it when it can.
        host.style.backgroundImage = 'url("' + poster.replace(/"/g, '\\"') + '")';
        host.style.backgroundSize = 'cover';
        host.style.backgroundPosition = 'center';
        var pi = new Image();
        pi.onload = clear;
        pi.onerror = clear;
        pi.src = poster;
      }
      el.addEventListener('loadedmetadata', clear, { once: true });
      el.addEventListener('loadeddata', clear, { once: true });
      el.addEventListener('canplay', clear, { once: true });
      el.addEventListener('playing', clear, { once: true });
      el.addEventListener('error', clear, { once: true });
      // A video that already has data (cached) won't re-fire — clear now.
      if (el.readyState >= 2) clear();
    }
  });

  // Failsafe: never leave a shimmer up forever.
  setTimeout(function () {
    document.querySelectorAll('.is-shimmer-host:not(.is-media-loaded)').forEach(markLoaded);
  }, FAILSAFE_MS);
})();
