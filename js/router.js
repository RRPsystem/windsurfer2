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
      document.querySelector('.properties-panel')
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
      view.innerHTML = `
        <div style="display:grid;grid-template-columns:380px 1fr;gap:16px;align-items:start;">
          <div style="border:1px solid #e5e7eb;border-radius:10px;background:#fff;padding:14px;">
            <div style="font-weight:700;font-size:18px;margin-bottom:6px;">${info.title}</div>
            <div style="color:#475569;margin-bottom:12px;">${info.body}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
              <button id="openMenuEditor" class="btn btn-primary"><i class="fas fa-bars"></i> Open volledige editor</button>
              <button id="refreshMenuPreview" class="btn"><i class="fas fa-rotate"></i> Ververs preview</button>
            </div>
            <div style="font-size:12px;color:#64748b;">Tip: Gebruik de volledige editor voor importeren en geavanceerde bewerkingen. De preview aan de rechterkant wordt direct uit je laatste concept geladen.</div>
          </div>
          <div style="border:1px solid #e5e7eb;border-radius:10px;background:#fff;padding:14px;min-height:280px;">
            <div style="font-weight:700;margin-bottom:10px;">Live preview</div>
            <nav data-menu-key="main"></nav>
            <hr style="margin:16px 0;opacity:.2;"/>
            <nav data-menu-key="footer"></nav>
          </div>
        </div>`;
      const openBtn = view.querySelector('#openMenuEditor');
      if (openBtn){ openBtn.onclick = () => { try { document.getElementById('menuBuilderBtn')?.click(); } catch {} }; }
      const refreshBtn = view.querySelector('#refreshMenuPreview');
      if (refreshBtn){ refreshBtn.onclick = () => { try { window.MenuPreview?.render(); } catch {} }; }
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
    }

    view.style.display = '';
  }

  function setMode(mode){
    if (!MODES.some(x=>x.value===mode)) mode = 'page';
    saveMode(mode);

    // Update dropdown
    const sel = document.getElementById('modeSelect');
    if (sel) sel.value = mode;
    const topSel = document.getElementById('topModeSelect');
    if (topSel) topSel.value = mode;

    if (mode === 'page'){
      showPageWorkspace(true);
      const view = document.getElementById('modeView'); if (view) view.style.display = 'none';
    } else if (mode === 'menu'){
      showPageWorkspace(false);
      renderModeView('menu');
      history.replaceState(null, '', '#/mode/menu');
    } else {
      showPageWorkspace(false);
      renderModeView(mode);
      history.replaceState(null, '', `#/mode/${mode}`);
    }
  }

  function init(){
    ensureMiniMenu();
    const sel = document.getElementById('modeSelect');
    if (sel){ sel.onchange = () => setMode(sel.value); }
    const topSel = document.getElementById('topModeSelect');
    if (topSel){ topSel.onchange = () => setMode(topSel.value); }

    const hashMode = readModeFromHash();
    const storedMode = readModeFromStorage();
    setMode(hashMode || storedMode || 'page');

    window.addEventListener('hashchange', () => {
      const m = readModeFromHash();
      if (m) setMode(m);
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
