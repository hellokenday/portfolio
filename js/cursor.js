/* Custom cursor — designer-portfolio style (à la saracelik.design).
   • Hides the native cursor on fine-pointer devices.
   • A small dot tracks the pointer 1:1; a larger ring trails with eased lerp.
   • Over interactive elements the ring grows + fills and the dot hides.
   • mix-blend-mode: difference so it reads against light AND dark surfaces.
   • Disabled entirely on touch / coarse pointers and under reduced motion. */
(function () {
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine) return;                       // touch / stylus → keep native cursor

  var dot = document.createElement('div');
  var ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  dot.setAttribute('aria-hidden', 'true');
  ring.setAttribute('aria-hidden', 'true');

  function mount() {
    document.body.appendChild(ring);
    document.body.appendChild(dot);
    document.documentElement.classList.add('has-custom-cursor');

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;   // mouse target
    var rx = mx, ry = my;                                          // ring (eased)
    var visible = false;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      if (!visible) { visible = true; document.documentElement.classList.add('cursor-active'); }
      if (reduce) { rx = mx; ry = my; ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)'; }
    });

    // ring follows with smooth lerp (skipped under reduced motion → it snaps)
    if (!reduce) {
      (function loop() {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
        requestAnimationFrame(loop);
      })();
    }

    // hide when leaving the window, restore on return
    document.addEventListener('mouseleave', function () { document.documentElement.classList.remove('cursor-active'); });
    document.addEventListener('mouseenter', function () { document.documentElement.classList.add('cursor-active'); });

    // grow over interactive targets
    var INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, .work-card, .pill-link, .theme-toggle, .btn, summary';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(INTERACTIVE)) document.documentElement.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(INTERACTIVE) &&
          !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(INTERACTIVE))) {
        document.documentElement.classList.remove('cursor-hover');
      }
    });
    // press feedback
    document.addEventListener('mousedown', function () { document.documentElement.classList.add('cursor-down'); });
    document.addEventListener('mouseup', function () { document.documentElement.classList.remove('cursor-down'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
