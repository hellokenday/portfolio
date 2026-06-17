/* Hero motion:
   1. Staggered word reveal on load.
   2. Pen-beside-"Ken" hover: the pen travels left under "Ken" drawing a wiggly
      line, holds, then returns to its resting place. Geometry is measured (the
      hero type is fluid) and animated with the Web Animations API so it can run
      there-and-back precisely. Respects prefers-reduced-motion. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = document.querySelector('.hero');
  if (!hero) return;

  // ---- 1. Staggered reveal on load ----------------------------------------
  var items = hero.querySelectorAll('.anim');
  if (reduce) {
    hero.classList.add('is-ready');
  } else {
    items.forEach(function (el, i) { el.style.transitionDelay = Math.min(i * 14, 620) + 'ms'; });
    setTimeout(function () { hero.classList.add('is-ready'); }, 80);
  }

  // ---- 2. Pen draws a wiggly line under "Ken" ------------------------------
  var pen = hero.querySelector('.hero-pen');
  var ken = hero.querySelector('.ken-word');
  var ul  = hero.querySelector('.ken-ul');
  if (!pen || !ken || !ul) return;

  var path = null, busy = false;

  // Build the wiggly underline path sized to "Ken" (px units → uniform stroke).
  function buildUnderline() {
    var w = ken.getBoundingClientRect().width;          // text width of "Ken"
    var fs = parseFloat(getComputedStyle(hero.querySelector('.display-xl')).fontSize) || 64;
    var amp = fs * 0.045;                                 // wave amplitude
    var h = amp * 2 + 6;
    var mid = h / 2;
    var humps = Math.max(3, Math.round(w / (fs * 0.32))); // ~3+ humps across the word
    var step = w / humps;
    // path starts at the LEFT edge and waves to the RIGHT, so the stroke draws
    // left → right as the pen sweeps across.
    var d = 'M 0 ' + mid.toFixed(1);
    var dir = -1;
    for (var i = 0; i < humps; i++) {
      var cx = (step * (i + 0.5)).toFixed(1);
      var cy = (mid + dir * amp * 1.6).toFixed(1);
      var ex = (step * (i + 1)).toFixed(1);
      d += ' Q ' + cx + ' ' + cy + ' ' + ex + ' ' + mid.toFixed(1);
      dir *= -1;
    }
    var svg = '<svg viewBox="0 0 ' + w.toFixed(1) + ' ' + h.toFixed(1) + '" preserveAspectRatio="none">'
            + '<path d="' + d + '"></path></svg>';
    ul.innerHTML = svg;
    // height of the overlay tracks the wave so stroke isn't squashed
    ul.style.height = h + 'px';
    path = ul.querySelector('path');
    var len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path._len = len;
  }

  function write() {
    if (busy || reduce) return;
    busy = true;
    buildUnderline();                                    // re-measure each time (responsive)

    var fs = parseFloat(getComputedStyle(hero.querySelector('.display-xl')).fontSize) || 64;
    var kenW = ken.getBoundingClientRect().width;
    var gap = fs * 0.16;                                  // margin between Ken and pen
    var penW = pen.getBoundingClientRect().width;
    var drop = fs * 0.10;                                 // dip down to the underline
    var leftX = -(kenW + gap);                            // pen at the start (left) of Ken
    var rightX = -(gap + penW * 0.2);                     // pen back near the right of Ken

    var DUR = 1250;
    // pen path: rest → (lift to left start) → sweep right drawing → hold → return
    pen.animate([
      { transform: 'translate(0,0) rotate(0deg)',                 offset: 0 },
      { transform: 'translate(' + leftX + 'px,' + drop + 'px) rotate(-9deg)',  offset: .16 },
      { transform: 'translate(' + rightX + 'px,' + drop + 'px) rotate(-9deg)', offset: .52 },
      { transform: 'translate(' + rightX + 'px,' + drop + 'px) rotate(-9deg)', offset: .62 },
      { transform: 'translate(0,0) rotate(0deg)',                 offset: 1 }
    ], { duration: DUR, easing: 'cubic-bezier(.5,.05,.3,1)' });

    // line draws as the pen sweeps right (.16→.52), then un-draws on the return.
    var len = path._len;
    path.animate([
      { strokeDashoffset: len, offset: 0 },
      { strokeDashoffset: len, offset: .16 },
      { strokeDashoffset: 0,   offset: .52 },
      { strokeDashoffset: 0,   offset: .64 },
      { strokeDashoffset: len, offset: 1 }
    ], { duration: DUR, easing: 'cubic-bezier(.5,.05,.3,1)' });

    setTimeout(function () { busy = false; }, DUR + 40);
  }

  pen.addEventListener('mouseenter', write);
  pen.addEventListener('focus', write);
})();
