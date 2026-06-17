/* Homepage intro choreography:
   1. The copy + footer (contact + credentials) fade up FIRST.
   2. Just before they settle, the headline ("bio text") word-reveal and the
      thumbnails fade in.
   Word-splits .headline-name / .headline-title, then drives reveal via classes
   on #main. Reduced-motion safe; failsafe so nothing can stay hidden. */
(function () {
  var main = document.getElementById('main');
  var h = document.querySelector('.headline');
  if (!main) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Split the name + title into per-word spans (preserving the spaces between).
  if (h) {
    h.querySelectorAll('.headline-name, .headline-title').forEach(function (part) {
      var parts = part.textContent.split(/(\s+)/);
      part.textContent = '';
      parts.forEach(function (chunk) {
        if (chunk === '') return;
        if (/^\s+$/.test(chunk)) { part.appendChild(document.createTextNode(chunk)); return; }
        var w = document.createElement('span');
        w.className = 'hl-word';
        w.textContent = chunk;
        part.appendChild(w);
      });
    });
    h.querySelectorAll('.hl-word').forEach(function (w, i) {
      w.style.transitionDelay = Math.min(i * 38, 680) + 'ms';
    });
  }

  // Stagger the thumbnails left-to-right when the hero phase fires.
  var previews = main.querySelectorAll('.preview');
  previews.forEach(function (p, i) { p.style.transitionDelay = Math.min(i * 70, 420) + 'ms'; });

  function revealCopy() { main.classList.add('intro-ready'); }
  function revealHero() {
    main.classList.add('hero-ready');
    if (h) h.classList.add('is-ready');
  }

  if (reduce) { revealCopy(); revealHero(); return; }

  // Phase 1: copy + footer fade up immediately (double rAF so the hidden state paints first).
  requestAnimationFrame(function () {
    requestAnimationFrame(revealCopy);
  });
  // Phase 2: ~just before the copy settles, bring in the headline + thumbnails.
  setTimeout(revealHero, 360);
  // Failsafe: never leave anything hidden if rAF/timers are starved.
  setTimeout(function () { revealCopy(); revealHero(); }, 1400);
})();
