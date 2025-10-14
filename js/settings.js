// Settings modal to configure API credentials and target without deeplinks
(function(){
  'use strict';
  const ls = {
    get: (k, d='') => { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const readStored = () => ({
    api: ls.get('wb_api',''),
    brand_id: ls.get('wb_brand_id',''),
    token: ls.get('wb_token',''),
    apikey: ls.get('wb_apikey',''),
    mode: ls.get('wb_mode_pref','page'),
    key: ls.get('wb_key',''),
    content_type: ls.get('wb_content_type','')
  });
  const computeEdgeCtx = (cfg) => {
    const api = (cfg.api||'').replace(/\/$/, '');
    const token = cfg.token||'';
    const mode = cfg.mode||'page';
    let key = cfg.key||'';
    if (mode==='page' && !key) key = ls.get('wb_last_page_id','');
    if (!api || !token || !key) return null;
    const kind = (mode==='news'||mode==='destination')? mode : 'page';
    return { api, token, kind, key };
  };
  const applyGlobals = (cfg) => {
    try {
      window.BOLT_API = window.BOLT_API || {}; window.BOLT_API.baseUrl = (cfg.api||'').replace(/\/$/,'');
      if (cfg.apikey) window.BOLT_API.apiKey = cfg.apikey;
      window.BOLT_DB = window.BOLT_DB || {}; window.BOLT_DB.url = window.BOLT_API.baseUrl;
      window.CURRENT_BRAND_ID = cfg.brand_id||'';
      window.CURRENT_TOKEN = cfg.token||'';
    } catch (e) {}
  };
  const installEdge = (edge) => {
    if (!edge) return;
    const set = ()=>{
      if (!window.websiteBuilder) return;
      window.websiteBuilder._edgeCtx = edge;
      try { window.websiteBuilder._edgeDisabled = false; } catch {}
      try { window.websiteBuilder.updateEdgeBadge && window.websiteBuilder.updateEdgeBadge(); } catch {}
    };
    if (window.websiteBuilder) set(); else document.addEventListener('DOMContentLoaded', set);
  };
  const setModeHash = (mode) => {
    try {
      const map = { page:'#/mode/page', news:'#/mode/news', destination:'#/mode/destination' };
      const h = map[mode]||map.page;
      if (String(location.hash||'') !== h) location.hash = h;
    } catch {}
  };

  function openSettings(){
    const cfg = readStored();
    const modal = document.createElement('div'); modal.className='modal'; modal.style.display='flex';
    const box = document.createElement('div'); box.className='modal-content'; box.style.maxWidth='760px';
    box.innerHTML = `
      <div class="modal-header">
        <h3><i class="fas fa-cog"></i> Instellingen (API)</h3>
        <button class="modal-close"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body" style="display:grid; gap:12px;">
        <div style="display:grid; grid-template-columns: 140px 1fr; gap:10px; align-items:center;">
          <label>API base</label><input id="stApi" class="form-control" type="text" placeholder="https://your-project.supabase.co" />
          <label>Brand ID</label><input id="stBrand" class="form-control" type="text" />
          <label>Token (JWT)</label><input id="stToken" class="form-control" type="text" />
          <label>API Key</label><input id="stKey" class="form-control" type="text" />
          <label>Mode</label>
          <select id="stMode" class="form-control">
            <option value="page">PAGE (page_id)</option>
            <option value="news">NEWS (news_slug)</option>
            <option value="destination">DESTINATION (slug)</option>
          </select>
          <label id="stKeyLbl">page_id</label><input id="stTarget" class="form-control" type="text" />
        </div>
        <div style="display:flex; gap:8px;">
          <button id="stApply" class="btn btn-primary"><i class="fas fa-save"></i> Opslaan</button>
          <button id="stClose" class="btn btn-secondary">Sluiten</button>
        </div>
      </div>`;
    modal.appendChild(box); document.body.appendChild(modal);
    const close = ()=>{ try { document.body.removeChild(modal); } catch {} };
    box.querySelector('.modal-close').onclick = close; box.querySelector('#stClose').onclick = close;

    // Prefill
    const apiEl = box.querySelector('#stApi'); const brandEl = box.querySelector('#stBrand'); const tokEl = box.querySelector('#stToken'); const keyEl = box.querySelector('#stKey');
    const modeEl = box.querySelector('#stMode'); const tgtEl = box.querySelector('#stTarget'); const lbl = box.querySelector('#stKeyLbl');
    apiEl.value = cfg.api; brandEl.value = cfg.brand_id; tokEl.value = cfg.token; keyEl.value = cfg.apikey; modeEl.value = cfg.mode; tgtEl.value = cfg.key;
    const syncLbl = ()=>{ lbl.textContent = (modeEl.value==='page')?'page_id':(modeEl.value==='news'?'news_slug':'slug'); };
    modeEl.onchange = syncLbl; syncLbl();

    box.querySelector('#stApply').onclick = () => {
      const newCfg = {
        api: apiEl.value.trim(), brand_id: brandEl.value.trim(), token: tokEl.value.trim(), apikey: keyEl.value.trim(),
        mode: modeEl.value, key: tgtEl.value.trim(), content_type: (modeEl.value==='news'?'news_items':(modeEl.value==='destination'?'destinations':''))
      };
      // Persist
      ls.set('wb_api', newCfg.api); ls.set('wb_brand_id', newCfg.brand_id); ls.set('wb_token', newCfg.token); ls.set('wb_apikey', newCfg.apikey);
      ls.set('wb_mode_pref', newCfg.mode); ls.set('wb_key', newCfg.key); if (newCfg.content_type) ls.set('wb_content_type', newCfg.content_type);
      // Apply globals
      applyGlobals(newCfg);
      // Install edge
      const edge = computeEdgeCtx(newCfg); installEdge(edge);
      // Set mode hash
      setModeHash(newCfg.mode);
      close();
    };
    modal.onclick = (e)=>{ if (e.target===modal) close(); };
  }

  function ensureButton(){
    document.addEventListener('DOMContentLoaded', () => {
      const right = document.querySelector('.app-header .header-right'); if (!right) return;
      if (document.getElementById('settingsBtn')) return;
      const btn = document.createElement('button'); btn.id='settingsBtn'; btn.className='btn btn-secondary'; btn.style.marginLeft='8px'; btn.innerHTML='<i class="fas fa-cog"></i> Instellingen';
      btn.onclick = openSettings; right.appendChild(btn);
    });
  }

  function bootFromStorage(){
    const cfg = readStored(); if (!cfg.api || !cfg.token) return;
    applyGlobals(cfg);
    const edge = computeEdgeCtx(cfg);
    if (edge) installEdge(edge);
    if (cfg.mode) setModeHash(cfg.mode);
  }

  ensureButton();
  bootFromStorage();
})();
