// js/layoutsBuilder.js
(function(){
  function h(tag, attrs={}, children=[]) {
    const el = document.createElement(tag);
    Object.entries(attrs||{}).forEach(([k,v]) => {
      if (k === 'class') el.className = v; else if (k === 'style') el.style.cssText = v; else el.setAttribute(k, v);
    });
    (children||[]).forEach(c => {
      if (typeof c === 'string') el.insertAdjacentHTML('beforeend', c);
      else if (c) el.appendChild(c);
    });
    return el;
  }

  function makeModal(title){
    const modal = h('div', { class: 'modal' });
    modal.style.display = 'block';
    const inner = h('div', { class: 'modal-content', style: 'max-width:760px' });
    inner.innerHTML = `
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close"><i class="fas fa-times"></i></button>
      </div>
      <div class="modal-body"></div>`;
    modal.appendChild(inner);
    document.body.appendChild(modal);
    const close = () => { try { document.body.removeChild(modal); } catch {} };
    inner.querySelector('.modal-close').onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };
    return { modal, inner, close };
  }

  // ========== EXPORT HELPERS ==========
  function exportHeaderAsJSON(form){
    let topbarLinks = [];
    try { topbarLinks = JSON.parse(form.topbarLinks?.value || '[]'); } catch { topbarLinks = []; }
    return {
      preset: form.preset?.value || 'minimal',
      logo_url: form.logo?.value || '',
      brand_name: form.brand?.value || '',
      accent: form.accent?.value || '#16a34a',
      sticky: !!form.sticky?.checked,
      menu_binding: form.menuKey?.value || 'main',
      topbar: {
        enabled: !!form.topbarEnabled?.checked,
        leftText: form.topbarLeft?.value || '',
        links: Array.isArray(topbarLinks) ? topbarLinks : []
      }
    };
  }
  function exportHeaderAsHTML(cfg){
    const brand = (cfg.brand_name||'Brand');
    const logo = cfg.logo_url ? `<img src="${cfg.logo_url}" alt="${brand}" style="height:28px;">` : `<span style="font-weight:800;">${brand}</span>`;
    const sticky = cfg.sticky ? 'position:sticky;top:0;z-index:50;' : '';
    const accent = cfg.accent || '#16a34a';

    const renderTopbar = () => {
      if (!cfg.topbar || !cfg.topbar.enabled) return '';
      const left = cfg.topbar.leftText ? `<div>${cfg.topbar.leftText}</div>` : '<div></div>';
      const right = (cfg.topbar.links||[]).map(l => `<a href="${l.href||'#'}" style="color:#0f172a;text-decoration:none;margin-left:14px;">${l.label||'Link'}</a>`).join('');
      return `
  <div class="wb-topbar" style="background:#f1f5f9;color:#0f172a;font-size:12px;border-bottom:1px solid #e2e8f0;">
    <div style="max-width:1100px;margin:0 auto;padding:6px 16px;display:flex;align-items:center;justify-content:space-between;">${left}<div>${right}</div></div>
  </div>`;
    };

    // Layout variants
    const layouts = {
      minimal: () => `
  <div style="max-width:1100px;margin:0 auto;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;gap:16px;">
    <div class="wb-header-left" style="display:flex;align-items:center;gap:10px;">${logo}</div>
    <nav class="wb-header-nav" data-menu-key="${cfg.menu_binding||'main'}" style="display:flex;gap:14px;"></nav>
    <div class="wb-header-cta"><a class="btn btn-primary" href="#" style="background:${accent};border:1px solid ${accent};color:#fff;border-radius:8px;padding:.55rem .9rem;font-weight:700;">Boek nu</a></div>
  </div>`,
      'logo-left': () => `
  <div style="max-width:1100px;margin:0 auto;padding:10px 16px;display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:center;">
    <div>${logo}</div>
    <nav class="wb-header-nav" data-menu-key="${cfg.menu_binding||'main'}" style="display:flex;gap:16px;justify-content:center;"></nav>
    <div style="text-align:right"><a class="btn btn-primary" href="#" style="background:${accent};border:1px solid ${accent};color:#fff;border-radius:8px;padding:.55rem .9rem;font-weight:700;">Boek nu</a></div>
  </div>`,
      'logo-center': () => `
  <div style="max-width:1100px;margin:0 auto;padding:10px 16px;display:flex;flex-direction:column;align-items:center;gap:8px;">
    <div>${logo}</div>
    <nav class="wb-header-nav" data-menu-key="${cfg.menu_binding||'main'}" style="display:flex;gap:16px;justify-content:center;"></nav>
  </div>`,
      'split': () => `
  <div style="max-width:1100px;margin:0 auto;padding:10px 16px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;">
    <nav class="wb-header-nav left" data-menu-key="${cfg.menu_binding||'main'}" style="display:flex;gap:12px;justify-content:flex-start;"></nav>
    <div style="text-align:center">${logo}</div>
    <div style="display:flex;gap:12px;justify-content:flex-end;">
      <a class="btn btn-primary" href="#" style="background:${accent};border:1px solid ${accent};color:#fff;border-radius:8px;padding:.55rem .9rem;font-weight:700;">Boek nu</a>
    </div>
  </div>`,
      'with-topbar': () => layouts['logo-left']()
    };

    const body = (layouts[cfg.preset] || layouts.minimal)();

    return `
${renderTopbar()}
<header class="wb-header" style="${sticky}background:#fff;border-bottom:1px solid #e5e7eb;">
${body}
</header>`;
  }

  function exportFooterAsJSON(form){
    let cols;
    try { cols = JSON.parse(form.cols?.value || '[]'); } catch { cols = []; }
    return {
      preset: form.preset?.value || 'compact',
      accent: form.accent?.value || '#16a34a',
      columns: Array.isArray(cols) ? cols : []
    };
  }
  function exportFooterAsHTML(cfg){
    const cols = Array.isArray(cfg.columns) ? cfg.columns : [];
    const colsHtml = cols.map(col => {
      const links = Array.isArray(col.links) ? col.links.map(l => `<a href="${l.href||'#'}" style="color:#334155;text-decoration:none;display:block;margin:6px 0;">${l.label||'Link'}</a>`).join('') : '';
      return `<div><div style=\"font-weight:800;margin-bottom:8px;\">${col.title||''}</div>${links}</div>`;
    }).join('');
    return `
<footer class="wb-footer" style="background:#f8fafc;border-top:1px solid #e5e7eb;">
  <div style="max-width:1100px;margin:0 auto;padding:24px 16px;display:grid;grid-template-columns:repeat(${Math.max(cols.length,1)},1fr);gap:16px;">
    ${colsHtml}
  </div>
  <div style="text-align:center;color:#6b7280;font-size:12px;padding:10px;">\u00a9 ${new Date().getFullYear()} ${cfg.brand_name||'Brand'}</div>
</footer>`;
  }

  function exportMenuAsJSON(form){
    try { return JSON.parse(form.menu?.value || '[]'); } catch { return []; }
  }

  async function doHeaderSavePublish(form, action){
    const brand_id = window.CURRENT_BRAND_ID;
    if (!brand_id) { window.websiteBuilder?.showErrorMessage('Geen brand_id'); return; }
    const json = exportHeaderAsJSON(form);
    if (action === 'save') {
      const r = await window.BuilderPublishAPI.saveHeaderDraft({ brand_id, content_json: json });
      window.websiteBuilder?.showNotification(`✅ Header concept opgeslagen (v${r.version ?? '-'})`, 'success');
    } else if (action === 'publish') {
      const html = exportHeaderAsHTML(json);
      const r = await window.BuilderPublishAPI.publishHeader({ brand_id, body_html: html });
      window.websiteBuilder?.showNotification(`🚀 Header gepubliceerd (v${r.version ?? '-'})`, 'success');
    }
  }

  async function doFooterSavePublish(form, action){
    const brand_id = window.CURRENT_BRAND_ID;
    if (!brand_id) { window.websiteBuilder?.showErrorMessage('Geen brand_id'); return; }
    const json = exportFooterAsJSON(form);
    if (action === 'save') {
      const r = await window.BuilderPublishAPI.saveFooterDraft({ brand_id, content_json: json });
      window.websiteBuilder?.showNotification(`✅ Footer concept opgeslagen (v${r.version ?? '-'})`, 'success');
    } else if (action === 'publish') {
      const html = exportFooterAsHTML(json);
      const r = await window.BuilderPublishAPI.publishFooter({ brand_id, body_html: html });
      window.websiteBuilder?.showNotification(`🚀 Footer gepubliceerd (v${r.version ?? '-'})`, 'success');
    }
  }

  async function doMenuSavePublish(form, action){
    const brand_id = window.CURRENT_BRAND_ID;
    if (!brand_id) { window.websiteBuilder?.showErrorMessage('Geen brand_id'); return; }
    const menu_json = exportMenuAsJSON(form);
    if (action === 'save') {
      const r = await window.BuilderPublishAPI.saveMenuDraft({ brand_id, menu_json });
      window.websiteBuilder?.showNotification(`✅ Menu concept opgeslagen (v${r.version ?? '-'})`, 'success');
    } else if (action === 'publish') {
      const r = await window.BuilderPublishAPI.publishMenu({ brand_id });
      window.websiteBuilder?.showNotification(`🚀 Menu gepubliceerd (v${r.version ?? '-'})`, 'success');
    }
  }

  function openHeaderBuilder(){
    const { inner, close } = makeModal('<i class="fas fa-heading"></i> Header Builder');
    const body = inner.querySelector('.modal-body');
    const form = h('form', { style: 'display:grid;gap:10px;' }, [
      '<div style="font-weight:700;color:#374151;">Instellingen</div>',
      '<label>Preset</label>', h('select', { name:'preset', class:'form-control' }, ['<option value="minimal">minimal</option><option value="logo-left">logo-left</option><option value="logo-center">logo-center</option><option value="split">split</option><option value="with-topbar">with-topbar</option>']),
      '<label>Logo URL</label>', h('input', { name:'logo', class:'form-control', type:'text', placeholder:'https://.../logo.png' }),
      '<label>Brand naam</label>', h('input', { name:'brand', class:'form-control', type:'text', placeholder:'Merk' }),
      '<label>Accent kleur</label>', h('input', { name:'accent', class:'form-control', type:'color', value:'#16a34a' }),
      h('label', {}, [ h('input', { name:'sticky', type:'checkbox', style:'margin-right:8px;' }), 'Sticky (bovenaan vast)' ]),
      '<label>Menu key (binding)</label>', h('input', { name:'menuKey', class:'form-control', type:'text', value:'main' }),
      '<hr/>',
      '<div style="font-weight:700;color:#374151;">Top bar</div>',
      h('label', {}, [ h('input', { name:'topbarEnabled', type:'checkbox', style:'margin-right:8px;' }), 'Top bar tonen' ]),
      '<label>Top bar links (JSON)</label>', h('textarea', { name:'topbarLinks', class:'form-control', style:'height:80px;' }, [
        `[
  { "label": "Bel ons", "href": "tel:+310000000" },
  { "label": "Mail", "href": "mailto:info@example.com" }
]`
      ]),
      '<label>Top bar links tekst links</label>', h('input', { name:'topbarLeft', class:'form-control', type:'text', value:'Welkom bij ons!' }),
      h('div', { style:'display:flex;gap:8px;margin-top:8px;' }, [
        h('button', { type:'button', class:'btn btn-secondary', id:'hdrSave' }, ['Opslaan (concept)']),
        h('button', { type:'button', class:'btn btn-primary', id:'hdrPublish' }, ['Publiceer'])
      ])
    ]);
    body.appendChild(form);
    body.insertAdjacentHTML('beforeend', '<div style="font-size:12px;color:#6b7280;">Publiceren stuurt HTML naar Bolt layouts-api</div>');

    body.querySelector('#hdrSave').onclick = (e)=>{ e.preventDefault(); doHeaderSavePublish(form, 'save'); };
    body.querySelector('#hdrPublish').onclick = (e)=>{ e.preventDefault(); doHeaderSavePublish(form, 'publish'); };
  }

  function openFooterBuilder(){
    const { inner } = makeModal('<i class="fas fa-window-maximize"></i> Footer Builder');
    const body = inner.querySelector('.modal-body');
    const form = h('form', { style: 'display:grid;gap:10px;' }, [
      '<div style="font-weight:700;color:#374151;">Instellingen</div>',
      '<label>Preset</label>', h('select', { name:'preset', class:'form-control' }, ['<option value="compact">compact</option><option value="columns">columns</option><option value="legal">legal</option>']),
      '<label>Accent kleur</label>', h('input', { name:'accent', class:'form-control', type:'color', value:'#16a34a' }),
      '<label>Kolommen JSON</label>', h('textarea', { name:'cols', class:'form-control', style:'height:140px;' }, [
        `[
  { "title": "Contact", "links": [ { "label":"Bel ons", "href":"tel:+310000000" } ] },
  { "title": "Over", "links": [ { "label":"Team", "href":"/team" } ] }
]`
      ]),
      h('div', { style:'display:flex;gap:8px;margin-top:8px;' }, [
        h('button', { type:'button', class:'btn btn-secondary', id:'ftrSave' }, ['Opslaan (concept)']),
        h('button', { type:'button', class:'btn btn-primary', id:'ftrPublish' }, ['Publiceer'])
      ])
    ]);
    body.appendChild(form);
    body.querySelector('#ftrSave').onclick = (e)=>{ e.preventDefault(); doFooterSavePublish(form, 'save'); };
    body.querySelector('#ftrPublish').onclick = (e)=>{ e.preventDefault(); doFooterSavePublish(form, 'publish'); };
  }

  function openMenuBuilder(){
    const { inner } = makeModal('<i class="fas fa-bars"></i> Menu Builder');
    const body = inner.querySelector('.modal-body');
    const form = h('form', { style:'display:grid;gap:10px;' }, [
      '<div style="font-weight:700;color:#374151;">Menu JSON</div>',
      h('textarea', { name:'menu', class:'form-control', style:'height:220px;' }, [
        `[
  { "label": "Home", "href": "/" },
  { "label": "Reizen", "href": "/reizen", "children": [
    { "label": "Rondreizen", "href": "/reizen/rondreizen" }
  ]}
]`
      ]),
      h('div', { style:'display:flex;gap:8px;margin-top:8px;' }, [
        h('button', { type:'button', class:'btn btn-secondary', id:'mnuSave' }, ['Opslaan (concept)']),
        h('button', { type:'button', class:'btn btn-primary', id:'mnuPublish' }, ['Publiceer'])
      ])
    ]);
    body.appendChild(form);
    body.querySelector('#mnuSave').onclick = (e)=>{ e.preventDefault(); doMenuSavePublish(form, 'save'); };
    body.querySelector('#mnuPublish').onclick = (e)=>{ e.preventDefault(); doMenuSavePublish(form, 'publish'); };
  }

  window.LayoutsBuilder = {
    openHeaderBuilder,
    openFooterBuilder,
    openMenuBuilder,
    exportHeaderAsJSON, exportHeaderAsHTML,
    exportFooterAsJSON, exportFooterAsHTML,
    exportMenuAsJSON
  };
})();
