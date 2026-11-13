/* Miss L Gems: a Home button on activity pages, shown only on the teacher's signed-in device. */
(function () {
  try {
    fetch('/teacher-check', { credentials: 'same-origin', cache: 'no-store' }).then(function (r) {
      if (!r.ok) return;
      var a = document.createElement('a');
      a.href = '/';
      a.textContent = '← Home';
      a.setAttribute('aria-label', 'Back to the Miss L Gems home page');
      a.style.cssText = 'position:fixed;top:6px;left:6px;z-index:2147483647;background:rgba(31,77,64,.88);color:#fff;font:600 13px/1 system-ui,-apple-system,sans-serif;padding:8px 12px;border-radius:999px;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,.25)';
      document.body.appendChild(a);
    }).catch(function () {});
  } catch (e) {}
})();
