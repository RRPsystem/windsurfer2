(function(){
  const API_BASE = (location.port && location.port !== '5050') ? 'http://localhost:5050' : '';
  const params = new URLSearchParams(location.search);
  const ideaId = params.get('ideaId');
  const micrositeId = params.get('micrositeId') || '';
  if (!ideaId) {
    document.getElementById('title').textContent = 'Geen ideaId opgegeven';
    return;
  }

  const titleEl = document.getElementById('title');
  const metaEl = document.getElementById('meta');
  const themesEl = document.getElementById('themes');
  const galleryEl = document.getElementById('gallery');
  const introEl = document.getElementById('intro');
  const priceEl = document.getElementById('price');
  const daysEl = document.getElementById('days');
  const hotelsEl = document.getElementById('hotels');
  const transportsEl = document.getElementById('transports');
  const destinationsEl = document.getElementById('destinations');
  const activitiesEl = document.getElementById('activities');

  const langSelect = document.getElementById('langSelect');
  const currencySelect = document.getElementById('currencySelect');
  const refreshBtn = document.getElementById('refreshBtn');
  const showMoreBtn = document.getElementById('showMoreBtn');

  async function load() {
    try {
      titleEl.textContent = 'Ladenâ€¦';
      metaEl.textContent = '';
      introEl.textContent = '';
      galleryEl.innerHTML = '';
      daysEl.innerHTML = '';

      const lang = langSelect.value; const currency = currencySelect.value;
      const ms = micrositeId ? `&micrositeId=${encodeURIComponent(micrositeId)}` : '';
      const info = await fetchJson(`${API_BASE}/api/ideas/${encodeURIComponent(ideaId)}/info?lang=${encodeURIComponent(lang)}&currency=${encodeURIComponent(currency)}&fields=id,title,priceFrom,currency,duration${ms}`);
      const detail = await fetchJson(`${API_BASE}/api/ideas/${encodeURIComponent(ideaId)}?lang=${encodeURIComponent(lang)}&fields=id,title,description,gallery,itinerary,hotels,transports,destinations,themes,tickets,inclusions,exclusions${ms}`);

      titleEl.textContent = detail.title || info.title || `Reis ${ideaId}`;
      metaEl.textContent = [info.duration ? `${info.duration} dagen` : null, info.currency && info.priceFrom!=null ? `${formatPrice(info.priceFrom, info.currency)} p.p.` : null].filter(Boolean).join(' â€¢ ');
      introEl.textContent = toPlainText(detail.description || '');

      const G = Array.isArray(detail.gallery) ? detail.gallery : [];
      renderGallery(G.slice(0,24));
      showMoreBtn.style.display = G.length>24 ? '' : 'none';
      showMoreBtn.onclick = () => { renderGallery(G); showMoreBtn.style.display = 'none'; };

      // themes
      renderThemes(detail.themes || []);

      // destinations
      destinationsEl.innerHTML = '';
      (detail.destinations || []).forEach(d => destinationsEl.appendChild(renderDestinationCard(d)));

      priceEl.textContent = info.priceFrom!=null ? formatPrice(info.priceFrom, info.currency) + ' p.p.' : '';

      (detail.itinerary || []).forEach(d => {
        const day = document.createElement('div');
        day.className = 'idea-day';
        day.innerHTML = `<h3>Dag ${d.day}: ${escapeHtml(d.title||'')}</h3>${d.text?`<p>${escapeHtml(d.text)}</p>`:''}`;
        daysEl.appendChild(day);
      });

      hotelsEl.innerHTML = '';
      const facilitiesLut = await getFacilitiesMap(lang);
      (detail.hotels || []).forEach(h => hotelsEl.appendChild(renderHotelCard(h, facilitiesLut)));

      transportsEl.innerHTML = '';
      (detail.transports || []).forEach(t => transportsEl.appendChild(renderTransportCard(t)));

      // activities
      activitiesEl.innerHTML = '';
      (detail.tickets || []).forEach(t => activitiesEl.appendChild(renderActivityCard(t)));
    } catch (e) {
      const box = document.createElement('div');
      box.style.background = '#fee2e2';
      box.style.border = '1px solid #ef4444';
      box.style.color = '#991b1b';
      box.style.padding = '12px';
      box.style.borderRadius = '8px';
      box.style.marginTop = '12px';
      box.textContent = `Fout bij laden van reis: ${e.message}`;
      daysEl.innerHTML = '';
      daysEl.appendChild(box);
      titleEl.textContent = `Reis ${ideaId}`;
    }
  }

  refreshBtn.addEventListener('click', load);
  load();

  function renderGallery(urls){ galleryEl.innerHTML=''; urls.forEach(u=>{ const img=document.createElement('img'); img.src=u; img.alt=''; galleryEl.appendChild(img); }); }

  function renderHotelCard(h, facilitiesLut){
    const el=document.createElement('article'); el.className='card';
    const img=(h.images&&h.images[0])||'';
    el.innerHTML=`${img?`<img src="${escapeHtml(img)}" alt="">`:`<div class="ph"></div>`}
    <div class="card-body">
      <h3 class="card-title">${escapeHtml(h.name||'')}</h3>
      <div class="card-meta">${escapeHtml(h.destination||'')}${h.nights?` â€¢ ${h.nights} nacht(en)`:''}${h.category?` â€¢ ${escapeHtml(h.category)}`:''}</div>
      ${h.address?`<div class="card-desc">${escapeHtml(h.address)}</div>`:''}
      ${h.description?`<div class="card-desc" style="margin-top:6px">${sanitizeHtml(h.description)}</div>`:''}
      <div class="chips">
        ${h.mealPlan?`<span class="chip">${escapeHtml(h.mealPlan)}</span>`:''}
        ${h.roomTypes?`<span class="chip">${escapeHtml(h.roomTypes)}</span>`:''}
        ${h.price!=null?`<span class="chip">${formatPrice(h.price, h.currency||'EUR')}</span>`:''}
      </div>
      ${renderFacilityChips(h.facilities, facilitiesLut)}
    </div>`;
    return el;
  }

  function renderTransportCard(t){
    const el=document.createElement('article'); el.className='card';
    el.innerHTML=`<div class="card-body">
      <h3 class="card-title">Dag ${t.day||'?'} â€¢ ${escapeHtml(t.transportType||'Vervoer')}</h3>
      <div class="card-meta">${escapeHtml(t.company||'')}${t.company?' â€¢ ':''}${escapeHtml(t.origin||'')} â†’ ${escapeHtml(t.target||'')}</div>
      <div class="chips">
        ${t.departureTime?`<span class="chip">Vertrek ${escapeHtml(t.departureTime)}</span>`:''}
        ${t.arrivalTime?`<span class="chip">Aankomst ${escapeHtml(t.arrivalTime)}</span>`:''}
        ${t.price!=null?`<span class="chip">${formatPrice(t.price, t.currency||'EUR')}</span>`:''}
      </div>
    </div>`;
    return el;
  }

  function renderThemes(themes){
    themesEl.innerHTML = '';
    (Array.isArray(themes)?themes:[]).forEach(t => {
      const span = document.createElement('span');
      span.className = 'theme-chip';
      span.textContent = t?.name || '';
      themesEl.appendChild(span);
    });
  }

  function renderDestinationCard(d){
    const el=document.createElement('article'); el.className='card dest-card';
    const img=(Array.isArray(d.imageUrls)&&d.imageUrls[0])||'';
    el.innerHTML=`${img?`<img src="${escapeHtml(img)}" alt="">`:`<div class="ph"></div>`}
    <div class="card-body">
      <h3 class="card-title">${escapeHtml(d.name||'')}</h3>
      <div class="card-desc">${sanitizeHtml(d.description||'')}</div>
      ${Array.isArray(d.imageUrls)&&d.imageUrls.length>1?`<div class="chips">${d.imageUrls.slice(1,5).map(u=>`<span class=\"chip\"><img src=\"${escapeHtml(u)}\" alt=\"\" style=\"width:28px;height:20px;object-fit:cover;border-radius:4px;\"></span>`).join('')}</div>`:''}
    </div>`;
    return el;
  }

  function renderActivityCard(t){
    const el=document.createElement('article'); el.className='card';
    const img=(Array.isArray(t.imageUrls)&&t.imageUrls[0])||'';
    const id = t.id;
    el.innerHTML=`${img?`<img src="${escapeHtml(img)}" alt="">`:`<div class="ph"></div>`}
    <div class="card-body">
      <h3 class="card-title">${escapeHtml(t.name||'')}</h3>
      <div class="card-meta">${escapeHtml(t.activityType||'')}${t.duration?` â€¢ ${escapeHtml(t.duration)}`:''}${t.meetingPoint?` â€¢ ${escapeHtml(t.meetingPoint)}`:''}</div>
      ${t.description?`<div class="card-desc">${sanitizeHtml(t.description)}</div>`:''}
      <div class="chips">
        ${t.departureTime?`<span class="chip">Vertrek ${escapeHtml(t.departureTime)}</span>`:''}
        ${t.city?`<span class="chip">${escapeHtml(t.city)}</span>`:''}
      </div>
      ${id?`<div style=\"margin-top:8px\"><button class=\"btn btn-outline\" data-ds=\"${escapeHtml(String(id))}\">Meer info</button></div>`:''}
      <div class="datasheet" id="ds-${escapeHtml(String(id||''))}" style="display:none;margin-top:8px"></div>
    </div>`;
    if (id) {
      const btn = el.querySelector('button[data-ds]');
      btn?.addEventListener('click', async () => {
        const box = el.querySelector(`#ds-${CSS.escape(String(id))}`);
        if (!box) return;
        if (box.dataset.loaded === '1') { box.style.display = box.style.display==='none'?'':'none'; return; }
        try {
          btn.disabled = true;
          btn.textContent = 'Ladenâ€¦';
          const ds = await fetchJson(`${API_BASE}/api/ticket/${encodeURIComponent(id)}/datasheet?micrositeId=${encodeURIComponent(micrositeId)}&lang=${encodeURIComponent(langSelect.value)}`);
          box.innerHTML = renderDatasheetHtml(ds);
          box.dataset.loaded = '1';
          box.style.display = '';
        } catch(e){ box.innerHTML = `<div style=\"color:#991b1b\">Kon datasheet niet laden: ${escapeHtml(e.message)}</div>`; box.style.display=''; }
        finally { btn.disabled = false; btn.textContent = 'Meer info'; }
      });
    }
    return el;
  }

  function renderDatasheetHtml(ds){
    const name = ds?.name||''; const desc = ds?.description||'';
    const mp = ds?.meetingPoint||''; const dur = ds?.duration||''; const at = ds?.activityType||'';
    const imgs = Array.isArray(ds?.imageUrls) ? ds.imageUrls.flat().filter(Boolean) : [];
    const head = `<div class=\"card-meta\">${escapeHtml(at)}${dur?` â€¢ ${escapeHtml(dur)}`:''}${mp?` â€¢ ${escapeHtml(mp)}`:''}</div>`;
    const gal = imgs.length?`<div class=\"chips\">${imgs.slice(0,8).map(u=>`<span class=\\\"chip\\\"><img src=\\\"${escapeHtml(u)}\\\" alt=\\\"\\\" style=\\\"width:28px;height:20px;object-fit:cover;border-radius:4px;\\\"></span>`).join('')}</div>`:'';
    return `<div><h4 style=\"margin:0 0 6px\">${escapeHtml(name)}</h4>${head}${desc?`<div class=\\\"card-desc\\\">${sanitizeHtml(desc)}<\\/div>`:''}${gal}</div>`;
  }

  async function getFacilitiesMap(lang){
    try {
      const r = await fetchJson(`${API_BASE}/api/facilities?lang=${encodeURIComponent(lang||'NL')}`);
      const map = new Map();
      const arr = Array.isArray(r?.facilities)?r.facilities:[];
      for (const f of arr) if (f?.id!=null) map.set(String(f.id), f?.description||'');
      return map;
    } catch (e) { return new Map(); }
  }

  function renderFacilityChips(fac, lut){
    if (!fac) return '';
    const chips = [];
    if (Array.isArray(fac)) {
      for (const id of fac) { const label = lut.get(String(id)); if (label) chips.push(`<span class=\"chip\">${escapeHtml(label)}<\/span>`); }
    } else if (typeof fac === 'object') {
      for (const [k,v] of Object.entries(fac)) { if (v) { const label = lut.get(String(k))||k; chips.push(`<span class=\"chip\">${escapeHtml(label)}<\/span>`); } }
    }
    return chips.length?`<div class=\"chips\">${chips.join('')}<\/div>`:'';
  }

  function sanitizeHtml(html){
    try{
      const allowed = new Set(['P','BR','STRONG','EM','UL','OL','LI','B','I']);
      const div = document.createElement('div');
      div.innerHTML = String(html);
      const walk = (node)=>{
        const kids = Array.from(node.childNodes);
        for (const n of kids){
          if (n.nodeType===1){
            if (!allowed.has(n.tagName)){
              const text = document.createTextNode(n.textContent||'');
              n.replaceWith(text);
            } else {
              for (const attr of Array.from(n.attributes||[])) n.removeAttribute(attr.name);
              walk(n);
            }
          }
        }
      };
      walk(div);
      return div.innerHTML;
    }catch (e) { return escapeHtml(toPlainText(html)); }
  }

  function toPlainText(s){
    try {
      const div = document.createElement('div');
      div.innerHTML = String(s);
      const text = div.textContent || div.innerText || '';
      return text.replace(/\s+/g,' ').trim();
    } catch(e) { return String(s||''); }
  }

  async function fetchJson(url){ const r = await fetch(url); if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }
  function formatPrice(v, cur){ try{ return new Intl.NumberFormat('nl-NL',{style:'currency',currency:cur||'EUR',maximumFractionDigits:0}).format(Number(v)); }catch(e){ return (cur||'EUR')+ ' '+ v; }}
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
})();
