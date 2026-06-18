/* Dark-mode toggle with a circular-reveal transition (View Transitions API).
   Palette + knob/icon motion follow the Clay design system. Persists to
   localStorage; honours system preference on first visit; reduced-motion safe. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function current() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }

  // persist=true only for explicit user toggles. With no saved choice the page
  // stays light (the pre-paint script defaults data-theme to "light").
  function apply(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (persist) { try { localStorage.setItem('theme', theme); } catch (e) {} }
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function toggle(ev) {
    var next = current() === 'dark' ? 'light' : 'dark';

    // Reduced motion or no Web Animations → instant swap.
    if (reduce || !document.body || typeof document.body.animate !== 'function') {
      apply(next, true);
      return;
    }

    // Origin = the toggle's centre, so the circle blooms from the button.
    var btn = document.querySelector('.theme-toggle');
    var r = btn ? btn.getBoundingClientRect() : { left: innerWidth - 24, top: 24, width: 0, height: 0 };
    var x = ev && ev.clientX ? ev.clientX : r.left + r.width / 2;
    var y = ev && ev.clientY ? ev.clientY : r.top + r.height / 2;
    var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    // Snapshot-free circular reveal: an overlay in the INCOMING canvas colour
    // blooms from the toggle, then the theme is applied under the full overlay
    // and the overlay removed. Avoids the View-Transitions snapshot glitches on
    // very tall pages / over playing videos, and works at any scroll position.
    var nextCanvas = next === 'dark' ? '#14201e' : '#fffaf0';   // --canvas in theme.css
    var from = 'circle(0px at ' + x + 'px ' + y + 'px)';
    var to = 'circle(' + Math.ceil(end) + 'px at ' + x + 'px ' + y + 'px)';

    var ov = document.createElement('div');
    ov.className = 'theme-reveal';
    ov.style.background = nextCanvas;
    ov.style.clipPath = from;
    document.body.appendChild(ov);

    var anim = ov.animate(
      { clipPath: [from, to] },
      { duration: 620, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }
    );

    var finished = false;
    var done = function () {
      if (finished) return;                                // run once
      finished = true;
      apply(next, true);                                   // recolour under the full overlay
      requestAnimationFrame(function () {                  // next frame, drop the overlay
        if (ov.parentNode) ov.parentNode.removeChild(ov);
      });
    };
    anim.finished.then(done).catch(done);
    setTimeout(done, 720);   // fallback: never leave the theme unapplied / overlay stuck
  }

  function init() {
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      apply(current(), false);                // sync aria to the pre-painted theme (don't persist)
      btn.addEventListener('click', toggle);
    }
  }

  // ---- Hide floating chrome (logo + toggle) on scroll-down, reveal on scroll-up -
  function initScrollChrome() {
    var root = document.documentElement;
    var lastY = window.pageYOffset || 0;
    var ticking = false;
    var SHOW_ABOVE = 80;   // never hide near the very top
    var DELTA = 6;         // ignore tiny jitters
    function update() {
      ticking = false;
      var y = window.pageYOffset || 0;
      if (Math.abs(y - lastY) < DELTA) { lastY = y; return; }
      if (y > lastY && y > SHOW_ABOVE) root.classList.add('chrome-up');   // scrolling down
      else root.classList.remove('chrome-up');                            // scrolling up (or near top)
      lastY = y;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; setTimeout(update, 16); }
    }, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initScrollChrome);
  else initScrollChrome();
})();
