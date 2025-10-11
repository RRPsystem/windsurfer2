// Deeplink v2 – Non-blocking, local-first context and background sync
(function(){
  'use strict';
  const log  = (...a)=>{ try { console.log('[DeeplinkV2]', ...a); } catch {} };
  const warn = (...a)=>{ try { console.warn('[DeeplinkV2]', ...a); } catch {} };

  const parseUrl = () => {
    try { return new URL(window.location.href); } catch { return null; }
  };
  const getParam = (u, k) => {
    try { return (u && (u.searchParams.get(k) || '')) || ''; } catch { return ''; }
  };

  // UPDATED: canonicalSubset now includes all expected fields with ?? null (alphabetical keys)
  function canonicalSubset(ctx){
    // Must match exactly what wbctx-mint signs (alphabetically sorted)
    const canonical = {
      api: ctx.api ?? null,
      apikey: ctx.apikey ?? null,
      author_id: ctx.author_id ?? null,
      author_type: ctx.author_type ?? null,
      brand_id: ctx.brand_id ?? null,
      content_type: ctx.content_type ?? null,
      ephemeral: ctx.ephemeral ?? null,
      exp: ctx.exp ?? null,
      footer_id: ctx.footer_id ?? null,
      menu_id: ctx.menu_id ?? null,
      mode: ctx.mode ?? null,
      news_slug: ctx.news_slug ?? null,
      page_id: ctx.page_id ?? null,
      slug: ctx.slug ?? null,
      template_id: ctx.template_id ?? null,
      token: ctx.token ?? null,
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
    } catch { return false; }
  }

  // REORDERED: validate server ctx first, then (optionally) apply URL overrides
  async function bootstrapCtx(){
    const u = parseUrl(); if (!u) return {};
    let ctx = {};

    // Load compact ctx if provided and not locally cached
    let ctxId = getParam(u,'ctx');
    if (ctxId){
      try { ctx = JSON.parse(localStorage.getItem('wb_ctx_'+ctxId) || '{}'); } catch {}
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
            let data = null; try { data = JSON.parse(t); } catch { continue; }
            if (data && data.api && (data.token || data.news_slug)) { ctx = data; break; }
          } catch {}
        }
      }
    }

    // 1) Expiry check on server-provided ctx
    try {
      if (ctx.exp && Number.isFinite(+ctx.exp) && Math.floor(Date.now()/1000) >= +ctx.exp) {
        warn('ctx expired'); return {};
      }
    } catch {}

    // 2) Signature check BEFORE any URL overrides
    const sigOk = await verifySigIfPresent(ctx);
    if (!sigOk) { warn('invalid ctx signature'); return {}; }

    // 3) Only AFTER validation, allow URL overrides for convenience (do NOT re-verify)
    ['api','token','apikey','api_key','brand_id','page_id','news_slug','slug','content_type','exp','ephemeral'].forEach(k=>{
      const v = getParam(u,k); if (v) ctx[k] = v;
    });
    if (ctx.api_key && !ctx.apikey) ctx.apikey = ctx.api_key;

    // Persist non-ephemeral ctx
    const isEphemeral = (String(ctx.ephemeral)==='1') || (getParam(u,'ctx_ephemeral')==='1');
    if (ctxId && ctx.api && (ctx.token || ctx.news_slug) && !isEphemeral){
      try { localStorage.setItem('wb_ctx_'+ctxId, JSON.stringify(ctx)); } catch {}
    }
    return ctx;
  }

  function determineKind(ctx){
    const ct = (ctx.content_type||'').toLowerCase();
    if (ct === 'news_items' || ctx.news_slug || (ctx.slug && !ctx.page_id)) return 'news';
    if (ct === 'destinations') return 'destination';
    return 'page';
  }

  function computeEdgeCtx(ctx){
    const api = (ctx.api||'').replace(/\/$/, '');
    const token = ctx.token || '';
    const key = ctx.page_id || ctx.news_slug || ctx.slug || '';
    const kind = determineKind(ctx);
    if (!api || !token || !key) return null;
    return { api, token, kind, key };
  }

  function installEdgeCtx(edgeCtx){
    try { window.websiteBuilder = window.websiteBuilder || null; } catch {}
    if (!window.websiteBuilder) {
      // Wait until main.js initializes
      document.addEventLis
