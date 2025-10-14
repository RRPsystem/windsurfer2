// Deeplink URL generator + Copy UI
(function(){
  'use strict';
  const qsVal = (u,k) => { try { return u.searchParams.get(k) || ''; } catch (e) { return ''; } };
  const curUrl = () => { try { return new URL(window.location.href); } catch (e) { return null; } };
  const getMode = () => {
    const h = String(location.hash||'').toLowerCase();
    if (/#\/mode\/news/.test(h)) return 'news';
    if (/#\/mode\/destination/.test(h)) return 'destination';
    return 'page';
  };
  const baseHref = () => {
    const u = curUrl();
    if (!u) return location.href;
    // Keep base path, drop existing query/hash
    return u.origin + u.pathname;
  };
  function readRuntime(){
    const u = curUrl();
    const api = (qsVal(u,'api') || (window.BOLT_API && window.BOLT_API.baseUrl) || '').replace(/\/$/, '');
    const brand_id = qsVal(u,'brand_id') || window.CURRENT_BRAND_ID || '';
    const token = qsVal(u,'token') || window.CURRENT_TOKEN || '';
    const apikey = qsVal(u,'apikey') || qsVal(u,'api_key') || (window.BOLT_API && window.BOLT_API.apiKey) || '';
    return { api, brand_id, token, apikey };
  }
  function createUrl(mode, key, opts={}){
    const { api, brand_id, token, apikey } = readRuntime();
    const safe = !!opts.safe;
    const u = new URL(baseHref());
    if (api) u.searchParams.set('api', api);
    if (brand_id) u.searchParams.set('brand_id', brand_id);
    if (token) u.searchParams.set('token', token);
    if (apikey) u.searchParams.set('apikey', apikey);
    if (safe) u.searchParams.set('safe','1');
    if (mode === 'page') {
      if (key) u.searchParams.set('page_id', key);
      u.hash = '#/mode/page';
    } else if (mode === 'news') {
      u.searchParams.set('content_type','news_items');
      if (key) u.searchParams.set('news_slug', key);
      u.hash = '#/mode/news';
    } else if (mode === 'destination') {
      u.searchParams.set('content_type','destinations');
      if (key) u.searchParams.set('slug', key);
      u.hash = '#/mode/destination';
    }
    return u.toString();
  }

  function showPopup(){
    const host = document.body;
    const wrap = document.createElement('div');
    wrap.className = 'modal';
    wrap.style.display = 'flex';
    const box = document.createElement('div');
    box.className = 'modal-content';
    box.style.maxWidth = '720px';
    box.innerHTML = `
      <div class="modal-header">
        <h3><i class="fas fa-link"></i> Deeplink maken</h3>
        <button class="modal-close"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body" style="display:grid; gap:12px;">
        <div style="display:grid; grid-template-columns: 120px 1fr; gap:10px; align-items:center;">
          <label>Mode</label>
          <select id="dlMode" class="form-control">
            <option value="page">PAGE (page_id)</option>
            <option value="news">NEWS (news_slug)</option>
            <option value="destination">DESTINATION (slug)</option>
          </select>
          <label id="dlKeyLabel">page_id</label>
          <input id="dlKey" class="form-control" type="text" placeholder="Bijv. 00000000-0000-0000-0000-000000000000" />
          <label>Safe Mode</label>
          <label style="display:flex;align-items:center;gap:8px;"><input id="dlSafe" type="checkbox" /> <span>?safe=1 toevoegen</span></label>
        </div>
        <div>
          <div style="font-weight:600;margin-bottom:6px;">URL</div>
          <textarea id="dlOut" class="form-control" style="width:100%;height:120px;resize:vertical;"></textarea>
          <div style="margin-top:8px;display:flex;gap:8px;">
            <button id="dlCopy" class="btn btn-primary"><i class="fas fa-copy"></i> Kopieer</button>
            <button id="dlOpen" class="btn btn-secondary"><i class="fas fa-external-link-alt"></i> Openen</button>
          </div>
        </div>
      </div>`;
    wrap.appendChild(box); host.appendChild(wrap);
    const close = ()=>{ try { host.removeChild(wrap); } catch (e) {} };
    box.querySelector('.modal-close').onclick = close;
    wrap.onclick = (e)=>{ if (e.target === wrap) close(); };

    // Prefill
    try {
      const modeSel = box.querySelector('#dlMode');
      const keyLabel = box.querySelector('#dlKeyLabel');
      const keyInput = box.querySelector('#dlKey');
      const out = box.querySelector('#dlOut');
      const safe = box.querySelector('#dlSafe');
      const initialMode = getMode();
      modeSel.value = initialMode;

      // Try to prefill keys from edgeCtx or header inputs
      let preKey = '';
      try {
        if (window.websiteBuilder && window.websiteBuilder._edgeCtx) {
          const { kind, key } = window.websiteBuilder._edgeCtx;
          if (kind === 'page' && initialMode==='page') preKey = key || '';
          if (kind === 'news' && initialMode==='news') preKey = key || '';
          if (kind === 'destination' && initialMode==='destination') preKey = key || '';
        }
      } catch (e) {}
      if (!preKey) {
        try {
          if (initialMode === 'news' || initialMode === 'destination') {
            const s = document.getElementById('pageSlugInput');
            if (s && s.value) preKey = s.value.trim();
          }
        } catch (e) {}
      }
      keyInput.value = preKey;

      const refresh = ()=>{
        const m = modeSel.value;
        keyLabel.textContent = (m==='page') ? 'page_id' : (m==='news' ? 'news_slug' : 'slug');
        const url = createUrl(m, keyInput.value.trim(), { safe: safe.checked });
        out.value = url;
      };

      modeSel.onchange = refresh;
      keyInput.oninput = refresh;
      safe.onchange = refresh;
      refresh();

      box.querySelector('#dlCopy').onclick = async ()=>{
        try { await navigator.clipboard.writeText(out.value); } catch (e) {}
      };
      box.querySelector('#dlOpen').onclick = ()=>{ try { window.open(out.value, '_blank'); } catch (e) {} };
    } catch (e) {}
  }

  function ensureHeaderButton(){
    document.addEventListener('DOMContentLoaded', () => {
      const right = document.querySelector('.app-header .header-right');
      if (!right) return;
      if (document.getElementById('deeplinkCopyBtn')) return;
      const btn = document.createElement('button');
      btn.id = 'deeplinkCopyBtn';
      btn.className = 'btn btn-secondary';
      btn.style.marginLeft = '8px';
      btn.innerHTML = '<i class="fas fa-link"></i> Link';
      btn.onclick = showPopup;
      right.appendChild(btn);
    });
  }

  ensureHeaderButton();
})();
