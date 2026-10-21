(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const grid = $('gp-grid'), lb = $('lb'), img = $('lb-img');
  let view = Array.isArray(photos) ? photos.filter((p, i, arr) => arr.findIndex(q => q.src === p.src) === i) : [], idx = 0;
  const label = () => 'Ready Racing #38';
  $('gp-count').textContent = view.length + ' photos';
  const year = $('year'); if (year) year.textContent = new Date().getFullYear();

  function render() {

    grid.replaceChildren();
    const frag = document.createDocumentFragment();
    view.forEach((p, i) => {
      const b = document.createElement('button');
      b.className = 'gp-tile'; if(i===0)b.classList.add('rg-featured');
      b.setAttribute('aria-label', 'View photo ' + (i + 1) + ' of ' + view.length + ', ' + label(p).toLowerCase());
      const im = document.createElement('img');
      im.src = p.src; im.width = p.w; im.height = p.h; im.loading = i < 5 ? 'eager' : 'lazy'; im.decoding = 'async';
      im.alt = 'Ready Racing #38 Kansas non-wing micro sprint racing — ' + label(p).toLowerCase() + ' photograph'; if(p.pos) im.style.objectPosition=p.pos;
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
  function open(i) { show(i); lb.showModal(); document.body.classList.add('rg-viewer-open'); }
  lb.addEventListener('close', () => { document.body.classList.remove('rg-viewer-open'); if (document.fullscreenElement === lb) document.exitFullscreen().catch(() => {}); });
  $('lb-share').addEventListener('click', async () => {
    const url = new URL('gallery.html', window.location.href);
    url.searchParams.set('photo', view[idx].src.split('/').pop());
    const status = $('lb-announcement');
    try { await navigator.clipboard.writeText(url.href); status.textContent = 'Photo link copied'; $('lb-share').textContent = 'LINK COPIED ✓'; }
    catch { status.textContent = 'Copy this link from your browser: ' + url.href; window.prompt('Copy photo link:', url.href); }
    setTimeout(() => { $('lb-share').textContent = 'COPY PHOTO LINK ↗'; }, 1800);
  });
  $('lb-fullscreen').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else if (lb.requestFullscreen) await lb.requestFullscreen(); }
    catch { $('lb-announcement').textContent = 'Full screen is not available in this browser'; }
  });
  const selectedPhoto = new URLSearchParams(window.location.search).get('photo');
  if (selectedPhoto) { const found = view.findIndex(p => p.src.split('/').pop() === selectedPhoto); if (found !== -1) { open(found); } }


  $('lb-close').addEventListener('click', () => lb.close());
  $('lb-prev').addEventListener('click', () => show(idx - 1));
  $('lb-next').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', (e) => {
    if (!lb.open) return;
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
