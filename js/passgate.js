/* Password gate overlay — centred modal (desktop) / bottom sheet (mobile).
   Replaces the dedicated password page: protected case studies open this overlay
   in-context. Reuses the original validation logic (demo password "portfolio" +
   sessionStorage unlock key) and preserves deep-linking.

   Two entry points:
   • Trigger links: any <a data-protected href="<target>" data-cs-title="…">.
     Click is intercepted → overlay opens → on success navigates to href.
   • Gate mode: PassGate.gate({target,title}) — called on the protected page itself
     when opened via a deep link while locked; on success it reveals the page.

   Accessibility: role="dialog" aria-modal, labelled + described, focus moves to the
   field on open, focus trapped while open, ESC closes, focus returns to the trigger.
*/
window.PassGate = (function () {
  var DEMO_PASSWORD = 'hellokenday';                 // reused validation secret
  var FOCUSABLE = 'a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])';
  var root, scrim, sheet, form, input, toggle, errEl, titleEl, msgEl, submitBtn, cancelBtn, liveEl;
  var lastFocus = null, opts = null, busy = false, built = false;

  function unlockKey(target) { return 'unlocked:' + target; }
  function isValid(pw) { return pw === DEMO_PASSWORD; }

  function build() {
    if (built) return;
    built = true;
    root = document.createElement('div');
    root.className = 'pg-root';
    root.setAttribute('hidden', '');
    root.innerHTML =
      '<div class="pg-scrim" data-pg-dismiss></div>' +
      '<div class="pg-sheet" role="dialog" aria-modal="true" aria-labelledby="pg-title" aria-describedby="pg-msg">' +
        '<div class="pg-handle" aria-hidden="true"></div>' +
        '<div class="pg-lock" aria-hidden="true">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>' +
        '</div>' +
        '<h2 class="pg-title" id="pg-title">Protected project</h2>' +
        '<p class="pg-msg" id="pg-msg">This case study is confidential and protected. Enter the password to view it.</p>' +
        '<form class="pg-form" novalidate>' +
          '<label class="pg-label" for="pg-input">Password</label>' +
          '<div class="pg-field">' +
            '<input class="pg-input" id="pg-input" type="password" name="pass" autocomplete="current-password" ' +
                   'aria-describedby="pg-error" placeholder="Enter password" inputmode="text" enterkeyhint="go">' +
            '<button class="pg-eye" type="button" aria-pressed="false" aria-label="Show password">' +
              '<svg class="pg-eye-on" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
              '<svg class="pg-eye-off" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"></path><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.4 4.3"></path><path d="M6.6 6.6A17.6 17.6 0 0 0 2 12s3.5 7 10 7a10.8 10.8 0 0 0 4.5-1"></path><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"></path></svg>' +
            '</button>' +
          '</div>' +
          '<p class="pg-error" id="pg-error" role="alert"></p>' +
          '<div class="pg-actions">' +
            '<button class="btn btn--ghost pg-cancel" type="button">Cancel</button>' +
            '<button class="btn btn--primary pg-submit" type="submit">' +
              '<span class="pg-submit-label">View case study</span>' +
              '<span class="pg-spinner" aria-hidden="true"></span>' +
            '</button>' +
          '</div>' +
        '</form>' +
        '<span class="pg-live" aria-live="polite"></span>' +
      '</div>';
    document.body.appendChild(root);

    scrim = root.querySelector('.pg-scrim');
    sheet = root.querySelector('.pg-sheet');
    form = root.querySelector('.pg-form');
    input = root.querySelector('.pg-input');
    toggle = root.querySelector('.pg-eye');
    errEl = root.querySelector('.pg-error');
    titleEl = root.querySelector('.pg-title');
    msgEl = root.querySelector('.pg-msg');
    submitBtn = root.querySelector('.pg-submit');
    cancelBtn = root.querySelector('.pg-cancel');
    liveEl = root.querySelector('.pg-live');

    form.addEventListener('submit', onSubmit);
    cancelBtn.addEventListener('click', function () { close('cancel'); });
    scrim.addEventListener('click', function () { close('scrim'); });
    toggle.addEventListener('click', toggleReveal);
    input.addEventListener('input', clearError);
    root.addEventListener('keydown', onKeydown);
  }

  function toggleReveal() {
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(show));
    toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    toggle.classList.toggle('is-shown', show);
    input.focus();
  }

  function clearError() {
    if (errEl.textContent) { errEl.textContent = ''; sheet.classList.remove('is-error'); input.removeAttribute('aria-invalid'); }
  }

  function setBusy(state) {
    busy = state;
    sheet.classList.toggle('is-loading', state);
    submitBtn.disabled = state;
    input.disabled = state;
    submitBtn.setAttribute('aria-busy', String(state));
  }

  function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    clearError();
    setBusy(true);
    liveEl.textContent = 'Checking password…';
    // Simulate validation latency (server round-trip on the real site).
    setTimeout(function () {
      if (isValid(input.value.trim())) {
        try { sessionStorage.setItem(unlockKey(opts.target), '1'); } catch (err) {}
        sheet.classList.remove('is-loading');
        sheet.classList.add('is-success');
        liveEl.textContent = 'Unlocked. Opening case study.';
        setBusy(false); submitBtn.disabled = true; input.disabled = true;
        setTimeout(function () {
          if (opts.mode === 'gate' && typeof opts.onSuccess === 'function') opts.onSuccess();
          else window.location.href = opts.target;
        }, 620);
      } else {
        setBusy(false);
        sheet.classList.add('is-error');
        input.setAttribute('aria-invalid', 'true');
        errEl.textContent = 'Incorrect password. Please try again.';
        liveEl.textContent = 'Incorrect password.';
        input.value = '';
        input.focus();
      }
    }, 560);
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { e.preventDefault(); close('esc'); return; }
    if (e.key !== 'Tab') return;
    var nodes = Array.prototype.filter.call(sheet.querySelectorAll(FOCUSABLE), function (n) {
      return n.offsetParent !== null && !n.disabled;
    });
    if (!nodes.length) return;
    var first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(o) {
    build();
    opts = o || {};
    lastFocus = document.activeElement;
    titleEl.textContent = opts.title || 'Protected project';
    msgEl.textContent = opts.message ||
      'This case study is confidential and protected. Enter the password to view it.';
    cancelBtn.textContent = opts.cancelLabel || 'Cancel';
    // reset state
    sheet.classList.remove('is-error', 'is-success', 'is-loading');
    errEl.textContent = ''; input.value = ''; input.type = 'password'; input.disabled = false;
    submitBtn.disabled = false;
    toggle.setAttribute('aria-pressed', 'false'); toggle.setAttribute('aria-label', 'Show password'); toggle.classList.remove('is-shown');
    cancelBtn.style.display = opts.dismissible === false ? 'none' : '';

    root.removeAttribute('hidden');
    document.documentElement.classList.add('pg-open');
    // next frame → enter transition
    requestAnimationFrame(function () { root.classList.add('is-open'); });
    // focus the field after the open transition begins
    setTimeout(function () { input.focus(); }, 90);
  }

  function close(reason) {
    if (!root || root.hasAttribute('hidden')) return;
    if (opts && opts.dismissible === false && reason !== 'success') {
      // non-dismissible gate: Cancel/Esc return to home rather than leaving a locked blank page
      if (reason === 'cancel' || reason === 'esc') { window.location.href = opts.cancelHref || 'index.html'; return; }
      if (reason === 'scrim') return;
    }
    root.classList.remove('is-open');
    document.documentElement.classList.remove('pg-open');
    var done = function () {
      root.setAttribute('hidden', '');
      root.removeEventListener('transitionend', onEnd);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    var onEnd = function (e) { if (e.target === sheet || e.target === scrim) done(); };
    root.addEventListener('transitionend', onEnd);
    setTimeout(done, 400);   // fallback if transitionend doesn't fire
  }

  // Intercept clicks on protected trigger links
  function initTriggers() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('a[data-protected]');
      if (!link) return;
      var target = link.getAttribute('href');
      // already unlocked this session → let the navigation through
      try { if (sessionStorage.getItem(unlockKey(target)) === '1') return; } catch (err) {}
      e.preventDefault();
      open({
        target: target,
        mode: 'navigate',
        title: link.getAttribute('data-cs-title') || 'Protected project',
        message: link.getAttribute('data-cs-message') || undefined,
        cancelLabel: 'Cancel'
      });
    });
  }

  function gate(o) { open(Object.assign({ mode: 'gate', dismissible: false }, o)); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTriggers);
  else initTriggers();

  return { open: open, close: close, gate: gate };
})();
