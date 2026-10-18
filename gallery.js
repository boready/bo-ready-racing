(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const grid = $('gp-grid'), lb = $('lb'), img = $('lb-img');
  let filter = 'all', view = photos, idx = 0;
  const label = (p) => (p.g === 'action' ? 'On track' : 'Behind the scenes');

  const count = (g) => photos.filter((p) => g === 'all' || p.g === g).length;
  ['all', 'action', 'pits'].forEach((g) => { $('c-' + g).textContent = count(g); });
  $('gp-count').textContent = photos.length + ' photos.';
  $('year').textContent = new Date().getFullYear();

  function render() {
    view = photos.filter((p) => filter === 'all' || p.g === filter);
    grid.replaceChildren();
    const frag = document.createDocumentFragment();
    view.forEach((p, i) => {
      const b = document.createElement('button');
      b.className = 'gp-tile';
      b.setAttribute('aria-label', 'View photo ' + (i + 1) + ' of ' + view.length + ', ' + label(p).toLowerCase());
      const im = document.createElement('img');
      im.src = p.src; im.width = p.w; im.height = p.h; im.loading = 'lazy'; im.decoding = 'async';
      im.alt = 'Bo Ready Racing #38, ' + label(p).toLowerCase();
      b.append(im);
      b.addEventListener('click', () => open(i));
      frag.append(b);
    });
    grid.append(frag);
  }

  function show(i) {
    idx = (i + view.length) % view.length;
    const p = view[idx];
    img.src = p.src; img.alt = 'Bo Ready Racing #38, ' + label(p).toLowerCase();
    $('lb-cap').textContent = (idx + 1) + ' / ' + view.length + '  ·  ' + label(p).toUpperCase();
    // warm the neighbours so next/prev feel instant
    [idx + 1, idx - 1].forEach((n) => { const q = view[(n + view.length) % view.length]; new Image().src = q.src; });
  }
  function open(i) { show(i); lb.showModal(); }

  document.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => {
    document.querySelector('.gp-filters .active').classList.remove('active');
    b.classList.add('active'); filter = b.dataset.filter; render();
  }));
  $('lb-close').addEventListener('click', () => lb.close());
  $('lb-prev').addEventListener('click', () => show(idx - 1));
  $('lb-next').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'ArrowLeft') show(idx - 1);
  });
  let x0 = null;
  lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  });
  render();
})();
