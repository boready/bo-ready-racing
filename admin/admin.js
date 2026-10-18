(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  let token = '';
  try { token = sessionStorage.getItem('br_admin') || ''; } catch {}
  const STATUSES = ['new', 'contacted', 'negotiating', 'won', 'lost'];
  const api = async (path, opts = {}) => {
    const r = await fetch(path, { ...opts, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', ...(opts.headers || {}) } });
    if (r.status === 401) { signOut(); throw new Error('Unauthorized'); }
    return r;
  };
  const el = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); kids.flat().forEach((k) => e.append(k)); return e; };
  const bars = (target, rows, labelKey, valKey, empty) => {
    const box = $(target); box.replaceChildren();
    if (!rows.length) return box.append(el('p', { className: 'note', textContent: empty }));
    const max = Math.max(...rows.map((r) => r[valKey]));
    rows.forEach((r) => box.append(el('div', { style: 'margin:8px 0' }, el('div', { textContent: `${r[labelKey] || '(none)'} — ${r[valKey]}` }), el('span', { className: 'bar', style: `width:${(r[valKey] / max) * 100}%` }))));
  };

  async function load() {
    const [inq, st] = await Promise.all([api('/api/admin/inquiries').then((r) => r.json()), api('/api/admin/stats').then((r) => r.json())]);
    $('login').hidden = true; $('app').hidden = false;
    const raceRes = await api('/api/admin/races');
    if (raceRes.ok) $('race-editor').value = JSON.stringify((await raceRes.json()).races, null, 2);
    const f = (t) => st.funnel.find((x) => x.type === t) || { n: 0, uniques: 0 };
    const cards = [['VISITORS (30D)', st.visitors30d], ['INQUIRIES', inq.inquiries.length], ['NEW / UNANSWERED', inq.inquiries.filter((i) => i.status === 'new').length], ['PACKAGE CLICKS', f('tier_click').n], ['FORM STARTS', f('form_start').uniques], ['LOCATION MATCHES', f('geo_match').uniques + f('geo_zip').uniques], ['TRACK CHECK-INS', st.checkins.reduce((a, c) => a + c.n, 0)]];
    $('cards').replaceChildren(...cards.map(([k, v]) => el('div', { className: 'card' }, el('small', { textContent: k }), el('b', { textContent: v }))));

    const rows = $('rows'); rows.replaceChildren();
    if (!inq.inquiries.length) rows.append(el('tr', {}, el('td', { colSpan: 7, className: 'note', textContent: 'No inquiries yet.' })));
    inq.inquiries.forEach((i) => {
      const sel = el('select', { 'aria-label': 'Status' }, STATUSES.map((s) => el('option', { value: s, textContent: s, selected: s === i.status })));
      sel.onchange = () => api('/api/admin/inquiries/' + i.id, { method: 'PATCH', body: JSON.stringify({ status: sel.value }) });
      const notes = el('textarea', { rows: 2, value: i.notes, 'aria-label': 'Notes' });
      notes.onchange = () => api('/api/admin/inquiries/' + i.id, { method: 'PATCH', body: JSON.stringify({ notes: notes.value }) });
      const mail = el('a', { href: 'mailto:' + i.email, textContent: i.email, style: 'color:#b9ff2b' });
      rows.append(el('tr', {},
        el('td', { textContent: new Date(i.created_at).toLocaleString() }),
        el('td', {}, el('strong', { textContent: i.business }), el('br'), document.createTextNode(i.contact), el('br'), mail, i.phone ? el('div', { textContent: i.phone }) : ''),
        el('td', { textContent: i.package }), el('td', { textContent: i.market }), el('td', { className: 'goals', textContent: i.goals }), el('td', {}, sel), el('td', {}, notes)));
    });
    bars('tiers', st.tiers, 'label', 'n', 'No package clicks yet.');
    bars('markets', st.markets, 'zone', 'visitors', 'No location checks yet.');
    bars('checkins', st.checkins, 'zone', 'n', 'No check-ins yet.');
    $('zones').replaceChildren(...st.zones.map((z) => el('div', { textContent: `${z.name} (${z.kind})${z.verified ? '' : ' — unverified coordinates'}` })));
  }

  function signOut() { token = ''; try { sessionStorage.removeItem('br_admin'); } catch {} $('app').hidden = true; $('login').hidden = false; }
  $('go').onclick = async () => {
    token = $('token').value.trim(); $('lerr').textContent = '';
    try { sessionStorage.setItem('br_admin', token); } catch {}
    try { await load(); } catch (e) { $('lerr').textContent = e.message === 'Unauthorized' ? 'Wrong token.' : 'Could not load data.'; }
  };
  $('token').addEventListener('keydown', (e) => e.key === 'Enter' && $('go').click());
  $('race-save').onclick = async () => {
    const feedback = $('race-feedback'); feedback.textContent = '';
    let races; try { races = JSON.parse($('race-editor').value); } catch { feedback.textContent = 'Invalid JSON. Nothing saved.'; return; }
    if (!Array.isArray(races)) { feedback.textContent = 'Provide a JSON array of races.'; return; }
    try {
      const r = await api('/api/admin/races', { method:'PUT', body:JSON.stringify({races}) });
      const d = await r.json();
      feedback.textContent = r.ok ? `${d.count} race entries published.` : (d.error || 'Could not publish.');
    } catch { feedback.textContent = 'Connection error. Nothing saved.'; }
  };
  $('out').onclick = signOut;
  $('csv').onclick = async () => {
    const r = await api('/api/admin/inquiries.csv'); const url = URL.createObjectURL(await r.blob());
    const a = el('a', { href: url, download: 'bo-ready-inquiries.csv' }); document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
  if (token) load().catch(() => {});
})();
