const API_BASE = (location.port && location.port !== '5050') ? 'http://localhost:5050' : '';
const PAGE_PARAMS = new URLSearchParams(location.search);
const PAGE_MICROSITE = PAGE_PARAMS.get('micrositeId') || '';

async function fetchCuratedIdeas(ids, { lang = 'NL', currency = 'EUR' } = {}) {
  const fields = ['id','title','description','thumb','priceFrom','duration','destinations','themes'];
  const qs = (p)=>Object.entries(p).filter(([,v])=>v!==undefined && v!==null && v!=='').map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const jobs = ids.map(id => fetch(`${API_BASE}/api/ideas/${encodeURIComponent(id)}/info?${qs({ lang, currency, fields: fields.join(','), micrositeId: PAGE_MICROSITE })}`)
    .then(r=>{ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
    .then(info => ({
      id: info.id || id,
      title: info.title || '',
      description: info.description || '',
      thumb: info.thumb || info.imageUrl || '',
      priceFrom: info.priceFrom ?? null,
      currency: info.currency || currency,
      duration: info.duration || null,
      destinations: info.destinations || [],
      themes: info.themes || [],
    }))
    .catch(err => ({ id, error: String(err) }))
  );
  return Promise.all(jobs);
}

function renderIdeaCard(it) {
  const el = document.createElement('article');
  el.className = 'idea-card';
  const desc = toPlainText(it.description || '');
  el.innerHTML = `
    <div class="idea-thumb">${it.thumb ? `<img src="${escapeHtml(it.thumb)}" alt="">` : `<div class="ph"></div>`}</div>
    <div class="idea-body">
      <h3 class="idea-title">${escapeHtml(it.title || '')}</h3>
      <div class="idea-meta">
        ${it.duration ? `<span>${it.duration} dagen</span>` : ''}
        ${Array.isArray(it.destinations) && it.destinations.length ? `<span>${escapeHtml(joinDestinations(it.destinations))}</span>` : ''}
      </div>
      ${desc ? `<p class="idea-desc">${escapeHtml(trimText(desc, 180))}</p>` : ''}
      <div class="idea-actions">
        ${it.priceFrom!=null ? `<div class="price">${formatPrice(it.priceFrom, it.currency)}</div>` : '<div></div>'}
        <a class="btn btn-primary" href="/public/ideas/detail.html?ideaId=${encodeURIComponent(it.id)}${PAGE_MICROSITE?`&micrositeId=${encodeURIComponent(PAGE_MICROSITE)}`:''}">Bekijk Reis</a>
      </div>
    </div>
  `;
  return el;
}

function joinDestinations(arr) {
  const names = arr.map(d=>d?.name || d?.title || d).filter(Boolean);
  return names.slice(0,3).join(', ');
}

function trimText(t, n) { return t.length>n ? t.slice(0,n-1)+'…' : t; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
function formatPrice(v, cur){ try{ return new Intl.NumberFormat('nl-NL',{style:'currency',currency:cur||'EUR',maximumFractionDigits:0}).format(Number(v)); }catch (e) {} return (cur||'EUR')+ ' '+ v; }
function toPlainText(s){
  try {
    const div = document.createElement('div');
    div.innerHTML = String(s);
    const text = div.textContent || div.innerText || '';
    return text.replace(/\s+/g,' ').trim();
  } catch (e) { return String(s); }
}
