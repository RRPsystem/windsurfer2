// js/router.js
(function(){
  const MODES = [
    { value: 'page', label: 'Web pagina' },
    { value: 'travel', label: 'Reizen' },
    { value: 'news', label: 'Nieuwsartikel' },
    { value: 'destination', label: 'Bestemmingspagina' },
    { value: 'menu', label: 'Menu & footer' }
  ];

  function readModeFromHash(){
    try {
      const m = (location.hash.match(/#\/mode\/([a-z]+)/i)||[])[1];
      return MODES.some(x=>x.value===m) ? m : null;
    } catch { return null; }
  }

  // Global scaffolding helper with extended retries
  function WB_tryScaffold(which, attempt = 0) {
    try {
      const maxAttempts = 100; // up to ~10s if 100ms intervals
      if (attempt > maxAttempts) return;
      const builder = (window.websiteBuilder || window.wb);
      const canvas = document.getElementById('canvas');
      const ready = !!(builder && canvas);
      if (!ready) return setTimeout(() => WB_tryScaffold(which, attempt + 1), 100);
      if (!isCanvasEffectivelyEmpty()) return;
      if (which === 'destination' && typeof builder.createDestinationTemplate === 'function') {
        builder.createDestinationTemplate({ title: 'Bestemming' });
        return;
      }
      if (which === 'news' && typeof builder.createNewsArticleTemplate === 'function') {
        builder.createNewsArticleTemplate();
        return;
      }
    } catch {}
  }
  try { window.WB_tryScaffold = WB_tryScaffold; } catch {}

  function hideHeaderPageButtonsNow(){
    try {
      ['newPageQuickBtn','pagesBtn'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
      document.querySelectorAll('button, a').forEach(el => {
        const txt = (el.textContent || '').trim().toLowerCase();
        if (txt === "nieuwe pagina" || txt === "pagina's" || txt === 'paginas' || txt === 'pagina’s') {
          el.style.display = 'none';
        }
      });
    } catch {}
  }

  function observeHeaderButtons(){
    try {
      const header = document.querySelector('.app-header') || document.body;
      if (!header || header.__wb_observing) return;
      const mo = new MutationObserver(() => hideHeaderPageButtonsNow());
      mo.observe(header, { childList: true, subtree: true });
      header.__wb_observing = true;
      hideHeaderPageButtonsNow();
    } catch {}
  }

  function isCanvasEffectivelyEmpty(){
    try {
      const canvas = document.getElementById('canvas');
      if (!canvas) return true;
      const hasComp = !!canvas.querySelector('.wb-component');
      return !hasComp;
    } catch { return true; }
  }

  function readModeFromStorage(){
    try { return localStorage.getItem('wb_mode') || null; } catch { return null; }
  }

  function saveMode(mode){
    try { localStorage.setItem('wb_mode', mode); } catch {}
  }

  function ensureMiniMenu(){
    if (document.getElementById('miniMenuBar')) return document.getElementById('miniMenuBar');
    // In Bolt deeplink context gebruiken we de dropdown in de header (#topModeSelect)
    // en maken we GEEN extra mini-balk aan.
    try {
      if ((window.BOLT_API && window.BOLT_API.baseUrl) || document.getElementById('topModeSelect')) return null;
    } catch {}
    const header = document.querySelector('.app-header');
    const bar = document.createElement('div');
    bar.id = 'miniMenuBar';
    bar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e5e7eb;';

    const label = document.createElement('div');
    label.textContent = 'Bouwtype:';
    label.style.cssText = 'font-size:12px;color:#334155;font-weight:600;';

    const sel = document.createElement('select');
    sel.id = 'modeSelect';
    sel.className = 'form-control';
    sel.style.cssText = 'height:30px;min-width:220px;';
    sel.innerHTML = MODES.map(m=>`<option value="${m.value}">${m.label}</option>`).join('');

    const right = document.createElement('div');
    right.style.cssText = 'margin-left:auto;display:flex;gap:8px;';

    bar.appendChild(label);
    bar.appendChild(sel);
    bar.appendChild(right);

    const container = document.querySelector('.app-container') || document.body;
    container.insertBefore(bar, container.children[1] || null);
    return bar;
  }

  function ensureModeView(){
    let v = document.getElementById('modeView');
    if (!v){
      v = document.createElement('div');
      v.id = 'modeView';
      v.style.cssText = 'display:none;padding:16px;';
      const appBody = document.querySelector('.app-body');
      if (appBody && appBody.parentNode){
        appBody.parentNode.insertBefore(v, appBody.nextSibling);
      } else {
        document.body.appendChild(v);
      }
    }
    return v;
  }

  function showPageWorkspace(show){
    const els = [
      document.querySelector('.sidebar'),
      document.querySelector('.canvas-area'),
      document.querySelector('.properties-panel'),
      document.querySelector('.app-body') // hide full builder grid to remove empty gray area
    ];
    els.forEach(el => { if (!el) return; el.style.display = show ? '' : 'none'; });
  }

  function renderModeView(mode){
    const view = ensureModeView();
    const info = {
      travel: {
        title: 'Reizen',
        body: 'Vul je Travel Compositor ID in en stel blokken samen (transport, hotels, kaart, etc.).'
      },
      news: {
        title: 'Nieuwsartikel',
        body: 'Schrijf een artikel met titel, intro en body. Publiceer via Bolt. (Preview hier)'
      },
      destination: {
        title: 'Bestemmingspagina',
        body: 'Bouw een bestemmingspagina met secties en AI-ondersteuning (stub).'
      },
      menu: {
        title: 'Menu & Footer',
        body: 'Beheer je menu\'s en footer. Gebruik live preview en open de volledige editor voor geavanceerde bewerking.'
      }
    }[mode];

    if (!info){ view.style.display = 'none'; return; }

    if (mode === 'menu'){
      // If dedicated view exists, mount it; else show basic info
      if (window.MenuFooterView && typeof window.MenuFooterView.mount === 'function') {
        window.MenuFooterView.mount(view);
      } else {
        view.innerHTML = `
          <div style=\"border:1px solid #e5e7eb;border-radius:10px;background:#fff;padding:16px;\">Menu-view wordt geladen...</div>`;
      }
    } else {
      view.innerHTML = `
        <div style="border:1px solid #e5e7eb;border-radius:10px;background:#fff;padding:16px;max-width:980px;">
          <div style="font-weight:700;font-size:18px;margin-bottom:6px;">${info.title}</div>
          <div style="color:#475569;margin-bottom:12px;">${info.body}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button id="backToPageMode" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Terug naar Web pagina</button>
          </div>
        </div>`;
      const back = view.querySelector('#backToPageMode');
      if (back){ back.onclick = () => setMode('page'); }

    view.style.display = '';
  }
  }

  function setMode(mode){
    if (!MODES.some(x=>x.value===mode)) mode = 'page';
    saveMode(mode);

    // Update dropdowns to reflect mode
    const sel = document.getElementById('modeSelect'); if (sel) sel.value = mode;
    const topSel = document.getElementById('topModeSelect'); if (topSel) topSel.value = mode;

    // Toggle header buttons
    toggleHeaderForMode(mode);

    if (mode === 'page') {
      // Always show full builder workspace
      showPageWorkspace(true);
      const view = document.getElementById('modeView'); if (view) view.style.display = 'none';
      history.replaceState(null, '', '#/mode/page');
      return;
    }

    const tryScaffold = (which, attempt=0) => {
      try {
        if (attempt > 100) return; // ~10s max if 100ms intervals
        // If Edge loader is active (news/page import), postpone scaffolding to avoid overwriting imported content
        if (window.__WB_LOADING_EDGE) return setTimeout(() => tryScaffold(which, attempt+1), 100);
        const builder = (window.websiteBuilder || window.wb);
        const ready = !!(builder && document.getElementById('canvas'));
        if (!ready) return setTimeout(() => tryScaffold(which, attempt+1), 100);
        if (!isCanvasEffectivelyEmpty()) return;
        if (which === 'destination' && builder && typeof builder.createDestinationTemplate === 'function') {
          builder.createDestinationTemplate({ title: 'Bestemming' });
        }
        if (which === 'news' && builder && typeof builder.createNewsArticleTemplate === 'function') {
          builder.createNewsArticleTemplate();
        }
      } catch {}
    };

    if (mode === 'destination') {
      // Show builder and auto-scaffold a destination template if canvas is empty
      showPageWorkspace(true);
      const view = document.getElementById('modeView'); if (view) view.style.display = 'none';
      history.replaceState(null, '', '#/mode/destination');
      tryScaffold('destination', 0);
      // Fallback delayed attempts
      setTimeout(() => WB_tryScaffold('destination', 0), 1000);
      setTimeout(() => WB_tryScaffold('destination', 0), 3000);
      return;
    }

    if (mode === 'news') {
      // Keep builder visible; scaffold news if empty
      showPageWorkspace(true);
      const view = document.getElementById('modeView'); if (view) view.style.display = 'none';
      history.replaceState(null, '', '#/mode/news');
      // Ensure the dedicated news scaffold is present. If canvas has other content but no news block, replace it.
      try {
        const builder = (window.websiteBuilder || window.wb);
        const canvas = document.getElementById('canvas');
        if (builder && canvas) {
          const hasNews = !!canvas.querySelector('.wb-news-article');
          if (!hasNews && typeof builder.createNewsArticleTemplate === 'function') {
            canvas.innerHTML = '';
            builder.createNewsArticleTemplate();
          }
        }
      } catch {}
      tryScaffold('news', 0);
      // Fallback delayed attempts
      setTimeout(() => WB_tryScaffold('news', 0), 1000);
      setTimeout(() => WB_tryScaffold('news', 0), 3000);
      return;
    }

    if (mode === 'menu') {
      showPageWorkspace(false);
      renderModeView('menu');
      history.replaceState(null, '', '#/mode/menu');
      return;
    }

    // Fallback info view
    showPageWorkspace(false);
    renderModeView(mode);
    history.replaceState(null, '', `#/mode/${mode}`);
  }

  function toggleHeaderForMode(mode){
    try {
      const isPage = (mode === 'page' || mode === 'destination');
      // Always hide page management buttons to avoid confusion with Bolt-managed pages
      hideHeaderPageButtonsNow();
      observeHeaderButtons();
      // Layout button only in page-like modes
      const layoutBtn = document.getElementById('layoutBtn');
      if (layoutBtn) layoutBtn.style.display = isPage ? '' : 'none';
      // Always keep essential buttons visible
      ['backToDashboardBtn','saveProjectBtn','previewBtn'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = ''; });
    } catch {}
  }

  function setupGlobalModeClickDelegation(){
    // Delegate clicks on elements that indicate a mode switch
    document.addEventListener('click', (e) => {
      try {
        const t = e.target.closest('[data-mode], a[href*="#/mode/"]');
        if (!t) return;
        let m = t.getAttribute('data-mode');
        if (!m) {
          const href = t.getAttribute('href') || '';
          const mm = href.match(/#\/mode\/([a-z]+)/i);
          if (mm) m = mm[1];
        }
        if (m && ['page','news','destination','menu','travel'].includes(m)) {
          e.preventDefault();
          setMode(m);
        }
      } catch {}
    }, true);
  }

  function init(){
    ensureMiniMenu();
    const sel = document.getElementById('modeSelect');
    if (sel){ sel.onchange = () => setMode(sel.value); }
    const topSel = document.getElementById('topModeSelect');
    if (topSel){ topSel.onchange = () => setMode(topSel.value); }
    setupGlobalModeClickDelegation();
    observeHeaderButtons();

    const hashMode = readModeFromHash();
    // Default to 'page' unless explicitly provided in hash
    setMode(hashMode || 'page');
    // If landing directly on news/destination, schedule extra scaffolding attempts
    if (hashMode === 'news' || hashMode === 'destination') {
      setTimeout(() => WB_tryScaffold(hashMode, 0), 500);
      setTimeout(() => WB_tryScaffold(hashMode, 0), 2500);
    }

    window.addEventListener('hashchange', () => {
      const m = readModeFromHash();
      if (m) setMode(m);
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  // Expose a safe global so other scripts (e.g., header UI) can force a mode
  try { window.WB_setMode = (m) => { try { setMode(m); } catch {} }; } catch {}
})();
