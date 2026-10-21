/* Ready Racing navigation — locally authored, no network requests. */
(() => {
  'use strict';
  document.querySelectorAll('.rr-current-year').forEach(node => {
    node.textContent = String(new Date().getFullYear());
  });
  const toggle = document.querySelector('.rr-menu-toggle');
  const menu = document.querySelector('.rr-site-nav');
  if (!toggle || !menu) return;
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
})();
