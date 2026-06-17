/* Strip behaviour — reproduced verbatim from the source (script.js).
   Desktop: horizontal strip, prev/next arrows, trackpad sideways-scroll.
   Videos (when present in .preview) autoplay in a staggered cascade only
   while in view. With placeholder tiles there are no videos, so the cascade
   stays dormant until real <video> elements are dropped into the previews. */
function initStrip() {
  const strip = document.querySelector("[data-strip]");
  const prev = document.querySelector("[data-strip-prev]");
  const next = document.querySelector("[data-strip-next]");
  if (!strip || !prev || !next) return;
  const mobileLayout = window.matchMedia("(max-width: 1100px)");
  const previews = Array.from(strip.querySelectorAll(".preview"));

  const syncStripState = () => {
    if (mobileLayout.matches) {
      prev.hidden = true;
      next.hidden = true;
      return;
    }

    const atStart = strip.scrollLeft <= 0;
    const maxScrollLeft = Math.max(0, strip.scrollWidth - strip.clientWidth);
    const lastPreview = previews[previews.length - 1];
    const stripRect = strip.getBoundingClientRect();
    const lastPreviewRect = lastPreview?.getBoundingClientRect();
    const lastPreviewInView =
      !!lastPreviewRect && lastPreviewRect.right <= stripRect.right - 1;
    const atEnd =
      lastPreviewInView || maxScrollLeft <= 1 || strip.scrollLeft >= maxScrollLeft - 1;

    prev.hidden = atStart;
    next.hidden = atEnd;
  };

  prev.addEventListener("click", () => {
    if (mobileLayout.matches) return;
    const amount = Math.max(320, Math.round(strip.clientWidth * 0.7));
    strip.scrollBy({ left: -amount, behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    if (mobileLayout.matches) return;
    const amount = Math.max(320, Math.round(strip.clientWidth * 0.7));
    strip.scrollBy({ left: amount, behavior: "smooth" });
  });

  // Make trackpad/mousewheel feel like "sideways scroll"
  strip.addEventListener(
    "wheel",
    (e) => {
      if (mobileLayout.matches) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      strip.scrollLeft += e.deltaY;
    },
    { passive: false }
  );

  strip.addEventListener("scroll", syncStripState, { passive: true });
  window.addEventListener("resize", syncStripState, { passive: true });

  syncStripState();
}

function initVisiblePreviewPlayback() {
  const strip = document.querySelector("[data-strip]");
  if (!strip) return;

  const videos = Array.from(strip.querySelectorAll(".preview video"));
  if (!videos.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const visibleVideos = new Set();
  const playTimers = new Map();
  const ratios = new Map();
  const mobileLayout = window.matchMedia("(max-width: 1100px)");
  const visibilityThreshold = mobileLayout.matches ? 0.2 : 0.65;
  const resetThreshold = mobileLayout.matches ? 0.1 : 0.2;
  const cascadeDelayMs = 180;

  const clearPlayTimer = (video) => {
    const timer = playTimers.get(video);
    if (timer) {
      window.clearTimeout(timer);
      playTimers.delete(video);
    }
  };

  const pauseVideo = (video, shouldReset = false) => {
    clearPlayTimer(video);
    video.pause();
    if (shouldReset) {
      video.currentTime = 0;
    }
  };

  // Desktop: the horizontal strip can show several tiles at once and the machine
  // has decoders to spare, so play every visible tile in a staggered cascade.
  const queueVisibleVideos = () => {
    const orderedVisibleVideos = videos.filter((video) => visibleVideos.has(video));

    orderedVisibleVideos.forEach((video, index) => {
      if (playTimers.has(video) || !video.paused) return;

      const delay = index * cascadeDelayMs;
      const timer = window.setTimeout(() => {
        playTimers.delete(video);
        if (!visibleVideos.has(video) || document.hidden) return;
        if (video.ended) {
          video.currentTime = 0;
        }
        void video.play().catch(() => {});
      }, delay);

      playTimers.set(video, timer);
    });
  };

  // Mobile: inline-video decoders are scarce (iOS plays only ~1–2 at a time), so
  // play ONLY the single most-visible tile and pause the rest. The paused tiles
  // keep showing their poster, which fixes "only the first video plays".
  const playMostVisibleMobile = () => {
    if (document.hidden) return;
    let best = null;
    let bestRatio = 0;
    videos.forEach((video) => {
      const r = ratios.get(video) || 0;
      if (r > bestRatio) {
        bestRatio = r;
        best = video;
      }
    });
    // Pause every other tile FIRST so its decoder is released, then start the
    // winner — iOS won't start a second clip while another still holds a decoder.
    videos.forEach((video) => {
      if (video !== best && !video.paused) video.pause();
    });
    if (best && bestRatio >= 0.4 && best.paused) {
      if (best.ended) best.currentTime = 0;
      void best.play().catch(() => {});
    }
  };

  const updatePlayback = () => {
    if (mobileLayout.matches) playMostVisibleMobile();
    else queueVisibleVideos();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        ratios.set(video, entry.intersectionRatio);
        const isVisible = entry.isIntersecting && entry.intersectionRatio >= visibilityThreshold;

        if (isVisible) {
          visibleVideos.add(video);
        } else {
          visibleVideos.delete(video);
          if (entry.intersectionRatio <= resetThreshold) {
            pauseVideo(video, true);
          }
        }
      });

      updatePlayback();
    },
    {
      root: null,
      threshold: mobileLayout.matches
        ? [0, 0.1, 0.25, 0.35, 0.5, 0.75, 1]
        : [0, resetThreshold, visibilityThreshold, 0.9],
    }
  );

  videos.forEach((video) => {
    // iOS needs muted set as a property (not just the attribute) for inline
    // autoplay, and playsinline so it doesn't go fullscreen.
    video.muted = true;
    video.setAttribute("playsinline", "");
    // Don't force preload="auto" on every clip — on iOS that makes all five load
    // at once and trips the concurrent-load limit, so some never appear. Leave
    // preload="metadata"; the in-view play() below loads each one on demand.

    pauseVideo(video);
    video.currentTime = 0;
    video.addEventListener("ended", () => {
      clearPlayTimer(video);
    });
    video.addEventListener("loadeddata", () => {
      updatePlayback();
    });
    observer.observe(video);
  });

  // iOS blocks a programmatic play() unless it runs close to a user gesture, so
  // the IntersectionObserver alone can't start later clips. Re-drive playback
  // from the scroll/touch handlers themselves (rAF-throttled) — this keeps each
  // play() within the gesture's activation window, so the centered clip starts.
  let kickScheduled = false;
  const kick = () => {
    if (kickScheduled) return;
    kickScheduled = true;
    requestAnimationFrame(() => {
      kickScheduled = false;
      updatePlayback();
    });
  };
  ["scroll", "touchstart", "touchmove", "touchend", "pointerdown"].forEach((ev) =>
    window.addEventListener(ev, kick, { passive: true })
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      videos.forEach((video) => pauseVideo(video));
      return;
    }

    updatePlayback();
  });
}

initStrip();
initVisiblePreviewPlayback();
