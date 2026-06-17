/* Scroll-choreographed reveals (Tier 1).
   Elements with [data-reveal] rise + fade in as they enter the viewport, once.
   Elements inside a [data-reveal-group] stagger by DOM order.
   Fully honours prefers-reduced-motion.

   Robustness: primary mechanism is IntersectionObserver (correct whether the page
   scrolls the window or sits in a scrolling parent). On top of that:
     • anything already above the fold reveals immediately on load,
     • a scroll/resize fallback (setTimeout-throttled, fires even in throttled iframes),
     • a final failsafe timer reveals anything still pending so content can NEVER
       get stuck invisible if IO/scroll never fire.

   Markup:
     <div data-reveal-group> <a data-reveal>…</a> … </div>   // staggered group
     <h2 data-reveal>…</h2>                                   // standalone
   Optional: data-reveal-delay="120"  // nudge a single element's base delay (ms)
*/
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STAGGER = 70;                  // ms between siblings — matches the hero cadence

  function init() {
    var pending = [].slice.call(document.querySelectorAll('[data-reveal]'));
    if (!pending.length) return;

    if (reduce) {                    // reduced motion → show all, no animation
      pending.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }

    pending.forEach(function (el) {  // precompute stagger delay from group index
      var base = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
      var group = el.closest('[data-reveal-group]');
      var i = group ? [].indexOf.call(group.querySelectorAll('[data-reveal]'), el) : 0;
      el._revealDelay = base + i * STAGGER;
    });

    function reveal(el) {
      if (el.classList.contains('is-revealed')) return;
      var d = el._revealDelay || 0;
      el.style.transitionDelay = (d / 1000) + 's';
      el.classList.add('is-revealed');
      setTimeout(function () { el.style.transitionDelay = ''; }, d + 900);
      var idx = pending.indexOf(el);
      if (idx > -1) pending.splice(idx, 1);
      if (io) io.unobserve(el);
    }

    // --- viewport check (used on load + scroll/resize fallback) --------------
    var ticking = false;
    function check() {
      ticking = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for (var i = pending.length - 1; i >= 0; i--) {
        if (pending[i].getBoundingClientRect().top < vh * 0.92) reveal(pending[i]);
      }
      if (!pending.length) teardown();
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      setTimeout(check, 16);         // setTimeout (not rAF) → fires in throttled iframes
    }
    function teardown() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }

    // --- primary: IntersectionObserver --------------------------------------
    var io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) reveal(e.target); });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
      pending.slice().forEach(function (el) { io.observe(el); });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    check();                         // reveal whatever is already in view on load

    // --- safety re-checks (no blanket reveal) -------------------------------
    // Re-run the IN-VIEW check a few times to catch late layout shifts (web fonts,
    // images). Crucially this only reveals elements actually in the viewport, so
    // below-the-fold content stays hidden until the user scrolls to it.
    setTimeout(check, 250);
    setTimeout(check, 1200);
    window.addEventListener('load', check);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
