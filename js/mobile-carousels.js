/* Mobile carousels — keyboard + screen-reader support.
   The photo triptychs, process-step cards, and reflection rows turn into
   horizontal scroll-snap carousels at ≤760px (see portfolio.css). A pure-CSS
   scroller isn't reachable by keyboard, so at mobile width we make each one
   focusable (tabindex=0) and labelled as a group; above 760px we strip those
   attributes again so there's no stray tab stop on the desktop grid. */
(function () {
  var SELECTOR = '.cs-screens--triptych, .process-grid, .sprint-grid, .reflect-row, .cs-screens--three, .cs-screens--pair, .cs-screens--quad, .cs-screens--hero, .cs-screen-tabs .cs-screens, .cs-tabpanel .cs-screens, .cs-figure--screens .cs-screens:not(.cs-screens--triptych), .cs-gallery, .cs-duo';
  var carousels = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
  if (!carousels.length) return;

  var mq = window.matchMedia('(max-width: 760px)');

  function labelFor(el) {
    if (el.classList.contains('cs-screens')) return 'Screens, scroll horizontally to see more';
    if (el.classList.contains('process-grid')) return 'Process steps, scroll horizontally to see more';
    return 'Cards, scroll horizontally to see more';
  }
  function enable(el) {
    if (el.getAttribute('data-carousel-a11y')) return;
    el.setAttribute('data-carousel-a11y', '1');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', labelFor(el));
  }
  function disable(el) {
    if (!el.getAttribute('data-carousel-a11y')) return;
    el.removeAttribute('data-carousel-a11y');
    el.removeAttribute('tabindex');
    el.removeAttribute('role');
    el.removeAttribute('aria-label');
  }
  function sync() {
    var on = mq.matches;
    carousels.forEach(function (el) { (on ? enable : disable)(el); });
  }
  sync();
  if (mq.addEventListener) mq.addEventListener('change', sync);
  else if (mq.addListener) mq.addListener(sync);
})();
