(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const pageStart = Date.now();

  // ---- anonymous visitor id (random, local only; never tied to identity) ----
  let visitor;
  try { visitor = localStorage.getItem('br_vid'); if (!visitor) { visitor = crypto.randomUUID(); localStorage.setItem('br_vid', visitor); } }
  catch { visitor = visitor || (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2)); }

  const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const track = (type, label = '', zone = '') => {
    try {
      const blob = new Blob([JSON.stringify({ type, label, zone, visitor })], { type: 'application/json' });
      if (!(navigator.sendBeacon && navigator.sendBeacon('/api/events', blob))) post('/api/events', { type, label, zone, visitor }).catch(() => {});
    } catch { /* analytics must never break the page */ }
  };

  track('view');
  if ('IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && !seen.has(e.target.id)) { seen.add(e.target.id); track('section', e.target.id); io.unobserve(e.target); }
    }), { threshold: 0.35 });
    ['story', 'gallery', 'partners', 'packages', 'season', 'nearby', 'inquiry'].forEach((id) => $(id) && io.observe($(id)));
  }
  document.querySelectorAll('[data-tier]').forEach((a) => a.addEventListener('click', () => {
    $('sponsor-form').elements.package.value = a.dataset.tier; track('tier_click', a.dataset.tier);
  }));
  $('photos')?.addEventListener('click', (e) => { if (e.target.closest('.tile')) track('gallery_open'); });
  document.querySelectorAll('.nav-cta,.hero-actions a,.tier-footer a,.contact a.button').forEach((a) => a.addEventListener('click', () => track('cta_click', (a.textContent || '').trim().slice(0, 40))));

  // ---- geofence / local sponsor match ----
  let lastFix = null; // kept in memory only, used for the optional check-in call
  const geoBtn = $('geo-btn'), zipForm = $('zip-form'), card = $('geo-result');
  const market = document.querySelector('#sponsor-form [name=market]'), marketTag = $('market-tag');

  function showResult(r, note) {
    card.hidden = false;
    const p = r.primary;
    const atVenue = r.zones.some((z) => z.kind !== 'market');
    $('geo-badge').textContent = atVenue ? 'AT A #38 VENUE' : p ? 'IN THE #38 TERRITORY' : 'OUTSIDE OUR CORE MARKET';
    $('geo-headline').textContent = p ? p.headline : "You're outside our core markets, for now.";
    $('geo-message').textContent = p ? p.message : "Online partners and in-kind support work from anywhere, and we race beyond Kansas. Tell us about your business and we'll find the right fit.";
    $('geo-cta').firstChild.textContent = (p ? p.cta : 'Talk partnership') + ' ';
    const v = $('geo-venue');
    if (r.nearestVenue && !atVenue) { v.hidden = false; v.textContent = `Nearest #38 venue on file: ${r.nearestVenue.name}, about ${r.nearestVenue.distKm} km away.`; } else v.hidden = true;
    if (note) { v.hidden = false; v.textContent = note; }
    $('geo-checkin').hidden = !(r.canCheckIn && lastFix);
    $('geo-checkin').disabled = false;
    $('geo-checkin').firstChild.textContent = 'CHECK IN AT THE TRACK ';
    if (p) { market.value = p.name; marketTag.hidden = false; marketTag.textContent = 'Market noted on your inquiry: ' + p.name; }
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function geoError(msg) {
    card.hidden = false;
    $('geo-badge').textContent = 'LOCATION UNAVAILABLE';
    $('geo-headline').textContent = "We couldn't get your location.";
    $('geo-message').textContent = msg + ' You can enter your ZIP code instead.';
    $('geo-venue').hidden = true; $('geo-checkin').hidden = true;
    $('geo-cta').firstChild.textContent = 'Talk partnership ';
  }

  geoBtn?.addEventListener('click', () => {
    if (!navigator.geolocation) return geoError('Your browser does not support location.');
    geoBtn.disabled = true; geoBtn.firstChild.textContent = 'LOCATING… ';
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      lastFix = { lat, lng, accuracy };
      try {
        const res = await post('/api/geo', { lat, lng, accuracy, visitor });
        if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
        showResult(await res.json());
      } catch (e) { geoError(e.message || 'Something went wrong.'); }
      geoBtn.disabled = false; geoBtn.firstChild.textContent = 'USE MY LOCATION ';
    }, (err) => {
      geoBtn.disabled = false; geoBtn.firstChild.textContent = 'USE MY LOCATION ';
      geoError(err.code === 1 ? 'Location permission was declined.' : err.code === 3 ? 'Location timed out.' : 'Your device could not determine a position.');
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  });

  $('geo-checkin')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget; if (!lastFix) return; btn.disabled = true;
    try {
      const res = await post('/api/geo', { ...lastFix, visitor, checkin: true });
      const r = await res.json();
      if (!res.ok) throw new Error(r.error);
      $('geo-badge').textContent = r.checkedIn ? 'CHECKED IN ✓' : 'ALREADY CHECKED IN TODAY ✓';
      btn.firstChild.textContent = 'THANKS FOR SHOWING UP ';
    } catch { btn.disabled = false; $('geo-venue').hidden = false; $('geo-venue').textContent = 'Check-in failed. Please try again.'; }
  });

  zipForm?.addEventListener('submit', async (e) => {
    e.preventDefault(); lastFix = null;
    const zip = $('zip').value.trim();
    if (!/^\d{5}$/.test(zip)) return geoError('That ZIP code does not look right.');
    try {
      const res = await post('/api/geo', { zip, visitor }); const r = await res.json();
      if (!res.ok) throw new Error(r.error);
      showResult(r);
    } catch (err) { geoError(err.message || 'Something went wrong.'); }
  });

  // ---- sponsor inquiry form ----
  const form = $('sponsor-form'); if (!form) return;
  let started = false;
  form.addEventListener('focusin', () => { if (!started) { started = true; track('form_start'); } });
  const setErrs = (fields = {}) => form.querySelectorAll('[data-err]').forEach((el) => {
    el.textContent = fields[el.dataset.err] || ''; const inp = form.elements[el.dataset.err];
    if (inp) inp.setAttribute('aria-invalid', fields[el.dataset.err] ? 'true' : 'false');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const f = {};
    if (!d.business?.trim()) f.business = 'Business name is required.';
    if (!d.contact?.trim()) f.contact = 'Contact name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email || '')) f.email = 'Enter a valid email address.';
    if (!form.elements.consent.checked) f.consent = 'Please confirm we may contact you.';
    setErrs(f);
    if (Object.keys(f).length) { form.querySelector('[aria-invalid=true]')?.focus(); return; }
    const btn = $('submit-btn'), status = $('form-status');
    btn.disabled = true; status.textContent = 'Sending…';
    const payload = { ...d, consent: true, elapsedMs: Date.now() - pageStart };
    try {
      const res = await post('/api/inquiries', payload);
      const r = await res.json().catch(() => ({}));
      if (res.status === 422) { setErrs(r.fields); status.textContent = r.error || ''; btn.disabled = false; return; }
      if (!res.ok) { status.textContent = r.error || 'Something went wrong. Please try again.'; btn.disabled = false; return; }
      track('form_submit', payload.package || '');
      form.innerHTML = '<div class="thanks" tabindex="-1"><span class="geo-badge">INQUIRY RECEIVED</span><h3>YOU\'RE ON THE GRID.</h3><p>Thanks, ' + '<span id="thanks-name"></span>. The #38 team will reach out at the email you provided. Nothing is promised until we confirm it together in writing.</p></div>';
      form.querySelector('#thanks-name').textContent = d.contact.trim();
      form.querySelector('.thanks').focus();
    } catch {
      // Network/server down: never lose the lead - hand them a copyable inquiry.
      btn.disabled = false; status.textContent = '';
      $('prepared').value = ['Bo Ready Racing #38 — 2027 Sponsorship Inquiry', 'Business: ' + d.business, 'Contact: ' + d.contact, 'Email: ' + d.email, d.phone ? 'Phone: ' + d.phone : '', 'Package: ' + d.package, 'Goals: ' + d.goals].filter(Boolean).join('\n');
      $('form-output').hidden = false;
    }
  });

  $('copy-inquiry')?.addEventListener('click', async () => {
    const t = $('prepared');
    try { await navigator.clipboard.writeText(t.value); $('copy-status').textContent = 'Copied'; }
    catch { t.focus(); t.select(); $('copy-status').textContent = 'Select the text and copy it'; }
  });
})();
