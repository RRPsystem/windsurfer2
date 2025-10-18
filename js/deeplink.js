// Deeplink v2 ”“ Non-blocking, local-first context and background sync
(function(){
  'use strict';
  const log  = (...a)=>{ try { console.log('[DeeplinkV2]', ...a); } catch (e) {} };
  const warn = (...a)=>{ try { console.warn('[DeeplinkV2]', ...a); } catch (e) {} };

  const parseUrl = () => {
    try { return new URL(window.location.href); } catch (e) { return null; }
  };
  const getParam = (u, k) => {
    try { return (u && (u.searchParams.get(k) || '')) || ''; } catch (e) { return ''; }
  };

  // --- canonicalSubset (keys alfabetisch, met ?? null) ---
  function canonicalSubset(ctx){
    const canonical = {
      api:         ctx.api ?? null,
      apikey:      ctx.apikey ?? null,
      author_id:   ctx.author_id ?? null,
      author_type: ctx.author_type ?? null,
      brand_id:    ctx.brand_id ?? null,
      content_type:ctx.content_type ?? null,
      ephemeral:   ctx.ephemeral ?? null,
      exp:         ctx.exp ?? null,
      footer_id:   ctx.footer_id ?? null,
      menu_id:     ctx.menu_id ?? null,
      mode:        ctx.mode ?? null,
      news_slug:   ctx.news_slug ?? null,
      page_id:     ctx.page_id ?? null,
      slug:        ctx.slug ?? null,
      template_id: ctx.template_id ?? null,
      token:       ctx.token ?? null,
    };
    return JSON.stringify(canonical);
  }

  async function verifySigIfPresent(ctx){
    try {
      if (!ctx.sig) return true;
      const pubPem = ctx.pub || window.WB_CTX_PUBLIC_KEY;
      if (!pubPem) return true;
      const b64 = pubPem.replace(/-----[^-]+-----/g,'').replace(/\s+/g,'');
      const raw = Uint8Array.from(atob(b64), c=>c.charCodeAt(0));
      const key = await crypto.subtle.importKey('spki', raw.buffer, { name:'RSASSA-PKCS1-v1_5', hash:'SHA-256' }, false, ['verify']);
      const enc = new TextEncoder();
      const data = enc.encode(canonicalSubset(ctx));
      const sigRaw = Uint8Array.from(atob(String(ctx.sig).replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0));
      const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sigRaw, data);
      return !!ok;
    } catch (e) { return false; }
  }

  // --- bootstrapCtx: eerst valideren, daarna pas URL-overrides toepassen ---
  async function bootstrapCtx(){
    const u = parseUrl(); if (!u) return {};
    let ctx = {};

    // Load compact ctx from cache/fetch
    const ctxId = getParam(u,'ctx');
    if (ctxId){
      try { ctx = JSON.parse(localStorage.getItem('wb_ctx_'+ctxId) || '{}'); } catch (e) {}
      if (!ctx || !ctx.api || !(ctx.token || ctx.news_slug)){
        const base = (getParam(u,'ctx_base')||'').replace(/\/$/, '');
        const candidates = [];
        if (base) candidates.push(`${base}/wbctx/${encodeURIComponent(ctxId)}`);
        candidates.push(`${location.origin}/wbctx/${encodeURIComponent(ctxId)}.json`);
        candidates.push(`${location.origin}/wbctx/${encodeURIComponent(ctxId)}`);
        for (const url of candidates){
          try {
            const r = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
            if (!r.ok) continue;
            const t = await r.text();
            if (!t) continue;
            let data = null; try { data = JSON.parse(t); } catch (e) { continue; }
            if (data && data.api && (data.token || data.news_slug)) { ctx = data; break; }
          } catch (e) {}
        }
      }
    }

    // 1) Expiry check op server-ctx
    try {
      if (ctx.exp && Number.isFinite(+ctx.exp) && Math.floor(Date.now()/1000) >= +ctx.exp) {
        warn('ctx expired'); return {};
      }
    } catch (e) {}

    // 2) Signature check VOOR overrides
    const sigOk = await verifySigIfPresent(ctx);
    if (!sigOk) { warn('invalid ctx signature'); return {}; }

    // 3) Pas HIERNA URL-overrides toe (niet opnieuw verifiëren)
    ['api','token','apikey','api_key','brand_id','page_id','news_slug','slug','content_type','exp','ephemeral'].forEach(k=>{
      const v = getParam(u,k); if (v) ctx[k] = v;
    });
    if (ctx.api_key && !ctx.apikey) ctx.apikey = ctx.api_key;

    // Persist non-ephemeral ctx
    const isEphemeral = (String(ctx.ephemeral)==='1') || (getParam(u,'ctx_ephemeral')==='1');
    if (ctxId && ctx.api && (ctx.token || ctx.news_slug) && !isEphemeral){
      try { localStorage.setItem('wb_ctx_'+ctxId, JSON.stringify(ctx)); } catch (e) {}
    }
    return ctx;
  }

  function determineKind(ctx){
    const ct = (ctx.content_type||'').toLowerCase();
    // Only classify as news when explicitly indicated by content_type or news_slug
    if (ct === 'news_items' || ctx.news_slug) return 'news';
    if (ct === 'destinations') return 'destination';
    // Default to page. Presence of a generic slug alone should NOT switch to news.
    return 'page';
  }

  function computeEdgeCtx(ctx){
    const api = (ctx.api||'').replace(/\/$/, '');
    const token = ctx.token || '';
    const kind = determineKind(ctx);
    let key = '';
    if (kind === 'news') {
      // For news, prefer news_slug; fall back to slug if provided
      key = ctx.news_slug || ctx.slug || '';
    } else if (kind === 'destination') {
      // For destinations, the canonical key is the slug
      key = ctx.slug || '';
    } else {
      // For pages, require a stable page_id for Edge save operations
      key = ctx.page_id || '';
    }
    if (!api || !token || !key) return null;
    return { api, token, kind, key };
  }

  function installEdgeCtx(edgeCtx){
    try { window.websiteBuilder = window.websiteBuilder || null; } catch (e) {}
    if (!window.websiteBuilder) {
      document.addEventListener('DOMContentLoaded', () => {
        if (window.websiteBuilder) {
          window.websiteBuilder._edgeCtx = edgeCtx;
          try { window.websiteBuilder.updateEdgeBadge && window.websiteBuilder.updateEdgeBadge(); } catch (e) {}
        }
      });
      return;
    }
    window.websiteBuilder._edgeCtx = edgeCtx;
    try { window.websiteBuilder.updateEdgeBadge && window.websiteBuilder.updateEdgeBadge(); } catch (e) {}
  }

  function setModeHash(kind){
    try {
      const map = { page: '#/mode/page', news: '#/mode/news', destination: '#/mode/destination' };
      if (!map[kind]) return;
      if (String(location.hash||'') !== map[kind]) { location.hash = map[kind]; }
    } catch (e) {}
  }

  function installSaveMonkeyPatch(){
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const btn = document.getElementById('saveProjectBtn');
      if (!btn) return;
      const orig = btn.onclick;
      btn.onclick = async (e) => {
        try { if (e && e.preventDefault) e.preventDefault(); } catch (e) {}
        try { window.websiteBuilder && window.websiteBuilder.saveProject && window.websiteBuilder.saveProject(true); } catch (e) {}
        try {
          if (window.websiteBuilder && typeof window.websiteBuilder.saveToEdgeIfPresent === 'function') {
            await window.websiteBuilder.saveToEdgeIfPresent();
          }
        } catch (e) {}
        // Call original as a no-op fallback
        try { if (typeof orig === 'function') orig.call(btn, e); } catch (e) {}
      };
    } catch (e) {}
  });
}

(async function init(){
  const ctx = await bootstrapCtx();
  const u = parseUrl();
  const safeMode = !!(u && u.searchParams.get('safe') === '1');

  const edgeCtx = computeEdgeCtx(ctx);
  if (edgeCtx && !safeMode) {
    log('edgeCtx installed', edgeCtx);
    installEdgeCtx(edgeCtx);
    setModeHash(edgeCtx.kind);
  } else {
    log('no edgeCtx (or safe mode) ”“ working local-only');
    try { if (window.websiteBuilder) window.websiteBuilder._edgeDisabled = true; } catch (e) {}
    document.addEventListener('DOMContentLoaded', () => {
      try { if (window.websiteBuilder) window.websiteBuilder._edgeDisabled = true; } catch (e) {}
    });
  }

  // Always local-first save behavior
  installSaveMonkeyPatch();
  
  // Auto-load content if page_id is present
  if (ctx.page_id && ctx.api && ctx.token) {
    loadPageContent(ctx);
  }
})();

// Load page content from pages-api and auto-detect content_type
async function loadPageContent(ctx) {
  try {
    const api = (ctx.api || '').replace(/\/$/, '');
    const pageId = ctx.page_id;
    const brandId = ctx.brand_id;
    
    if (!api || !pageId) return;
    
    log('Loading page content for page_id:', pageId);
    
    // Build URL
    let url = `${api}/pages-api?page_id=${encodeURIComponent(pageId)}`;
    if (brandId) url += `&brand_id=${encodeURIComponent(brandId)}`;
    
    // Build headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (ctx.token) {
      headers['Authorization'] = `Bearer ${ctx.token}`;
    }
    if (ctx.apikey) {
      headers['apikey'] = ctx.apikey;
    }
    
    // Fetch page data
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      warn('Failed to load page:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    log('Page data loaded:', data);
    
    // Check content_type and switch mode if needed
    if (data.content_type === 'news_items') {
      log('Detected news content, switching to news mode');
      
      // Update hash to news mode
      if (location.hash !== '#/mode/news') {
        location.hash = '#/mode/news';
      }
      
      // Update mode selector if present
      document.addEventListener('DOMContentLoaded', () => {
        const modeSelect = document.getElementById('topModeSelect');
        if (modeSelect && modeSelect.value !== 'news') {
          modeSelect.value = 'news';
        }
      });
      
      // Update edgeCtx to news mode
      const newsEdgeCtx = {
        api: ctx.api,
        token: ctx.token,
        kind: 'news',
        key: data.slug || ctx.news_slug || ctx.slug || ''
      };
      installEdgeCtx(newsEdgeCtx);
    }
    
    // Load content into builder
    document.addEventListener('DOMContentLoaded', () => {
      try {
        if (data.content_json && window.websiteBuilder) {
          // Load the content - check both html and htmlSnapshot
          const canvas = document.getElementById('canvas');
          const htmlContent = data.content_json.html || data.content_json.htmlSnapshot || data.body_html;
          
          if (canvas && htmlContent) {
            canvas.innerHTML = htmlContent;
            log('Content HTML loaded into canvas');
          } else {
            warn('No HTML content found in response. Keys:', Object.keys(data.content_json || {}));
          }
          
          // Update page title/slug inputs
          const titleInput = document.getElementById('pageTitleInput');
          const slugInput = document.getElementById('pageSlugInput');
          if (titleInput && data.title) {
            titleInput.value = data.title;
            log('Title set to:', data.title);
          }
          if (slugInput && data.slug) {
            slugInput.value = data.slug;
            log('Slug set to:', data.slug);
          }
          
          // Reattach event listeners
          if (window.websiteBuilder.reattachEventListeners) {
            window.websiteBuilder.reattachEventListeners();
          }
          
          log('Content loaded into builder');
        }
      } catch (e) {
        warn('Failed to load content into builder:', e);
      }
    });
    
  } catch (error) {
    warn('Error loading page content:', error);
  }
}

})();


