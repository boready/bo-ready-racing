(() => {
  'use strict';
  const buttons = [...document.querySelectorAll('[data-race-tab]')];
  const target = document.getElementById('race-hub-content');
  if (!target) return;
  let races = [];
  const formatDate = (value) => { const d = new Date(value + 'T12:00:00'); return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}).toUpperCase(); };
  const render = () => {
    target.replaceChildren();
    const items = races.filter(r => r.date?.startsWith('2027-') && r.status !== 'completed').sort((a,b) => a.date.localeCompare(b.date));
    if (!items.length) { const p=document.createElement('p');p.className='race-empty';p.textContent='2027 schedule coming soon. Confirmed race dates and tracks will be posted here.';target.append(p);return; }
    items.forEach(r => {
      const card=document.createElement('article'); card.className='race-card';
      const date=document.createElement('div');date.className='race-date';date.textContent=formatDate(r.date);
      const name=document.createElement('h3');name.textContent=r.name;
      const place=document.createElement('p');place.textContent=[r.venue,r.location].filter(Boolean).join(' · ');
      const status=document.createElement('div');status.className='race-status';status.textContent=(r.status === 'cancelled' ? 'CANCELLED' : 'SCHEDULED')+(r.notes ? ' · '+r.notes : '');
      card.append(date,name,place,status);target.append(card);
    });
  };
  fetch('/api/races',{headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw Error('Unable to load');return r.json()}).then(d=>{races=Array.isArray(d.races)?d.races:[];render()}).catch(()=>{target.replaceChildren();const p=document.createElement('p');p.className='race-empty';p.textContent='Race updates are temporarily unavailable.';target.append(p)});
})();
