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
      } else if (mode === 'destination') {
      // Keep builder visible; auto-scaffold a destination page if empty
      showPageWorkspace(true);
      const view = document.getElementById('modeView'); if (view) view.style.display = 'none';
      history.replaceState(null, '', `#/mode/${mode}`);
      setTimeout(() => {
        try {
          const canvas = document.getElementById('canvas');
          const hasComponents = !!(canvas && canvas.querySelector('.wb-component'));
          if (!hasComponents && window.websiteBuilder && typeof window.websiteBuilder.createDestinationTemplate === 'function') {
            if (!window.__destinationTemplateAutoDone) {
              window.websiteBuilder.createDestinationTemplate({ title: 'Japan' });
              window.__destinationTemplateAutoDone = true;
            }
          }
        } catch (e) { console.warn('Auto scaffold destination failed', e); }
      }, 0);
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

    if (mode === 'destination') {
      // Show builder and auto-scaffold a destination template if canvas is empty
      showPageWorkspace(true);
      const view = document.getElementById('modeView'); if (view) view.style.display = 'none';
      history.replaceState(null, '', '#/mode/destination');
      setTimeout(() => {
        try {
          const canvas = document.getElementById('canvas');
          const hasComponents = !!(canvas && canvas.querySelector('.wb-component'));
          if (!hasComponents && window.websiteBuilder && typeof window.websiteBuilder.createDestinationTemplate === 'function') {
            if (!window.__destinationTemplateAutoDone) {
              window.websiteBuilder.createDestinationTemplate({ title: 'Bestemming' });
              window.__destinationTemplateAutoDone = true;
            }
          }
        } catch (e) { console.warn('Auto scaffold destination failed', e); }
      }, 0);
      return;
    }

    if (mode === 'news') {
      // Keep builder visible; scaffold news if empty
      showPageWorkspace(true);
      const view = document.getElementById('modeView'); if (view) view.style.display = 'none';
      history.replaceState(null, '', '#/mode/news');
      setTimeout(() => {
        try {
          const canvas = document.getElementById('canvas');
          const hasComponents = !!(canvas && canvas.querySelector('.wb-component'));
          if (!hasComponents && window.websiteBuilder && typeof window.websiteBuilder.createNewsArticleTemplate === 'function') {
            window.websiteBuilder.createNewsArticleTemplate();
          }
        } catch (e) { console.warn('Auto scaffold news failed', e); }
      }, 0);
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
      ['newPageQuickBtn','pagesBtn'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
      // Layout button only in page-like modes
      const layoutBtn = document.getElementById('layoutBtn');
      if (layoutBtn) layoutBtn.style.display = isPage ? '' : 'none';
      // Always keep essential buttons visible
      ['backToDashboardBtn','saveProjectBtn','previewBtn'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = ''; });
    } catch {}
  }

  function init(){
    ensureMiniMenu();
    const sel = document.getElementById('modeSelect');
    if (sel){ sel.onchange = () => setMode(sel.value); }
    const topSel = document.getElementById('topModeSelect');
    if (topSel){ topSel.onchange = () => setMode(topSel.value); }

    const hashMode = readModeFromHash();
    // Default to 'page' unless explicitly provided in hash
    setMode(hashMode || 'page');

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
