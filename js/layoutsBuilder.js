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
    let topbarSocials = [];
    try { topbarSocials = JSON.parse(form.topbarSocials?.value || '[]'); } catch { topbarSocials = []; }
    return {
      preset: form.preset?.value || 'minimal',
      logo_url: form.logo?.value || '',
      logo_h: parseInt(form.headerLogoH?.value || '40', 10) || 40,
      brand_name: form.brand?.value || '',
      accent: form.accent?.value || '#16a34a',
      sticky: !!form.sticky?.checked,
      menu_binding: form.menuKey?.value || 'main',
      header_bg: form.headerBg?.value || '',
      topbar: {
        enabled: !!form.topbarEnabled?.checked,
        address: form.topbarAddress?.value || '',
        phone: form.topbarPhone?.value || '',
        socials: Array.isArray(topbarSocials) ? topbarSocials : [],
        bg: form.topbarBg?.value || ''
      }
    };
  }
  function exportHeaderAsHTML(cfg){
    const brand = (cfg.brand_name||'Brand');
    const logoH = parseInt(cfg.logo_h || 40, 10);
    const logo = cfg.logo_url ? `<img src="${cfg.logo_url}" alt="${brand}" style="height:${logoH}px;">` : `<span style="font-weight:800;">${brand}</span>`;
    const sticky = cfg.sticky ? 'position:sticky;top:0;z-index:50;' : '';
    const accent = cfg.accent || '#16a34a';

    const renderTopbar = () => {
      if (!cfg.topbar || !cfg.topbar.enabled) return '';
      const left = cfg.topbar.address ? `<div>${cfg.topbar.address}</div>` : '<div></div>';
      const phone = cfg.topbar.phone ? `<a href="tel:${cfg.topbar.phone}" style="color:#0f172a;text-decoration:none;margin-left:14px;">${cfg.topbar.phone}</a>` : '';
      const socials = (cfg.topbar.socials||[]).map(s => `<a href="${s.href||'#'}" style="color:#0f172a;text-decoration:none;margin-left:10px;"><i class="${s.icon||'fa-brands fa-circle'}"></i></a>`).join('');
      const right = `<div>${phone}${socials ? `<span style=\"margin-left:10px;\"></span>${socials}` : ''}</div>`;
      const topBg = cfg.topbar.bg || '#f1f5f9';
      return `
  <div class="wb-topbar" style="background:${topBg};color:#0f172a;font-size:12px;border-bottom:1px solid #e2e8f0;">
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

    const headerBg = cfg.header_bg || '#fff';
    return `
${renderTopbar()}
<header class="wb-header" style="${sticky}background:${headerBg};border-bottom:1px solid #e5e7eb;">
${body}
</header>`;
  }

  function exportFooterAsJSON(form){
    let cols;
    try { cols = JSON.parse(form.cols?.value || '[]'); } catch { cols = []; }
    return {
      preset: form.preset?.value || 'compact',
      accent: form.accent?.value || '#16a34a',
      columns: Array.isArray(cols) ? cols : [],
      menu_binding: form.menuKey?.value || 'footer',
      second_menu_key: form.secondMenuKey?.value || '',
      bg_from: form.bgFrom?.value || '',
      bg_to: form.bgTo?.value || '',
      bg_image: form.bgImage?.value || '',
      logo_url: form.logo?.value || '',
      logo_h: parseInt(form.footerLogoH?.value || '48', 10) || 48,
      address_html: form.address?.value || ''
    };
  }
  function exportFooterAsHTML(cfg){
    const cols = Array.isArray(cfg.columns) ? cfg.columns : [];
    const colsHtml = cols.map(col => {
      const links = Array.isArray(col.links) ? col.links.map(l => `<a href="${l.href||'#'}" style="color:#334155;text-decoration:none;display:block;margin:6px 0;">${l.label||'Link'}</a>`).join('') : '';
      return `<div><div style=\"font-weight:800;margin-bottom:8px;\">${col.title||''}</div>${links}</div>`;
    }).join('');
    const bgFrom = cfg.bg_from || '';
    const bgTo = cfg.bg_to || '';
    const footerBg = bgFrom && bgTo ? `linear-gradient(90deg, ${bgFrom}, ${bgTo})` : '#f8fafc';
    const bgImage = cfg.bg_image ? `background-image:url('${cfg.bg_image}');background-size:cover;background-position:center;` : '';
    const bindKey = cfg.menu_binding || 'footer';
    const secondKey = cfg.second_menu_key || '';
    const fLogoH = parseInt(cfg.logo_h || 48, 10);
    const logo = cfg.logo_url ? `<img src="${cfg.logo_url}" alt="logo" style="max-height:${fLogoH}px;">` : '';
    const address = cfg.address_html ? `<div style=\"color:#334155;\">${cfg.address_html}</div>` : '';
    const secondMenuHtml = secondKey ? `<nav data-menu-key="${secondKey}" style="display:flex;gap:12px;flex-wrap:wrap;margin-top:10px;"></nav>` : '';
    return `
<footer class="wb-footer" style="background:${footerBg};${bgImage}border-top:1px solid #e5e7eb;">
  <div style="max-width:1100px;margin:0 auto;padding:24px 16px;">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px;">
      <div>${logo}</div>
      <nav data-menu-key="${bindKey}" style="display:flex;gap:14px;flex-wrap:wrap;"></nav>
    </div>
    ${secondMenuHtml}
    <div style="display:grid;grid-template-columns:repeat(${Math.max(cols.length,1)},1fr);gap:16px;margin-top:12px;">
      ${colsHtml}
    </div>
    ${address}
  </div>
  <div style="text-align:center;color:#6b7280;font-size:12px;padding:10px;">\u00a9 ${new Date().getFullYear()} ${cfg.brand_name||'Brand'}</div>
</footer>`;
  }

  // ======= MENU STATE / HELPERS (visual builder) =======
  function normalizeMenu(arr){
    return (Array.isArray(arr)?arr:[]).map(it=>({
      label: it.label || 'Item',
      href: it.href || '#',
      target: it.target || '_self',
      children: normalizeMenu(it.children||[])
    }));
  }

  function exportMenuAsJSON(form){
    // Prefer map format if available
    if (form.__menuMap) return JSON.parse(JSON.stringify(form.__menuMap));
    if (form.__menuState) return JSON.parse(JSON.stringify(form.__menuState));
    try { return JSON.parse(form.menu?.value || '[]'); } catch { return []; }
  }

  function renderMenuTree(container, form, key){
    container.innerHTML = '';
    const list = document.createElement('div');
    list.style.cssText = 'display:flex;flex-direction:column;gap:6px;';

    const stateArr = key ? (form.__menuMap[key] = form.__menuMap[key] || []) : (form.__menuState = form.__menuState || []);

    const makeNode = (item, path=[]) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;';
      const label = document.createElement('input');
      label.className = 'form-control';
      label.placeholder = 'Label';
      label.style.width = '30%';
      label.value = item.label || '';
      const href = document.createElement('input');
      href.className = 'form-control';
      href.placeholder = '/pad-of-url';
      href.style.width = '40%';
      href.value = item.href || '';
      const addBtn = btn('➕', 'Add child');
      const upBtn = btn('⬆️', 'Move up');
      const downBtn = btn('⬇️', 'Move down');
      const indentBtn = btn('↳', 'Indent');
      const outdentBtn = btn('↰', 'Outdent');
      const delBtn = btn('🗑️', 'Delete');

      label.oninput = () => { item.label = label.value; };
      href.oninput = () => { item.href = href.value; };

      addBtn.onclick = () => { item.children.push({ label:'Nieuw', href:'#', children:[] }); renderMenuTree(container, form, key); };
      upBtn.onclick = () => { moveItem(stateArr, path, -1); renderMenuTree(container, form, key); };
      downBtn.onclick = () => { moveItem(stateArr, path, +1); renderMenuTree(container, form, key); };
      indentBtn.onclick = () => { indentItem(stateArr, path); renderMenuTree(container, form, key); };
      outdentBtn.onclick = () => { outdentItem(stateArr, path); renderMenuTree(container, form, key); };
      delBtn.onclick = () => { deleteAt(stateArr, path); renderMenuTree(container, form, key); };

      row.appendChild(label);
      row.appendChild(href);
      [addBtn, upBtn, downBtn, indentBtn, outdentBtn, delBtn].forEach(b=>row.appendChild(b));

      const childrenWrap = document.createElement('div');
      childrenWrap.style.cssText = 'margin-left:22px;display:flex;flex-direction:column;gap:6px;';
      (item.children||[]).forEach((ch, idx)=>{
        childrenWrap.appendChild(makeNode(ch, path.concat(['children', idx])));
      });

      const wrap = document.createElement('div');
      wrap.appendChild(row);
      if ((item.children||[]).length) wrap.appendChild(childrenWrap);
      return wrap;
    };

    (stateArr||[]).forEach((it, idx)=>{
      list.appendChild(makeNode(it, [idx]));
    });
    container.appendChild(list);

    const addRoot = btn('Nieuw hoofditem', 'Add root', 'btn btn-secondary');
    addRoot.style.marginTop = '8px';
    addRoot.onclick = () => { stateArr.push({ label:'Nieuw', href:'#', children:[] }); renderMenuTree(container, form, key); };
    container.appendChild(addRoot);
  }

  function btn(text, title, cls='btn'){
    const b = document.createElement('button');
    b.type = 'button'; b.className = cls; b.textContent = text; b.title = title || '';
    return b;
  }

  function getParentAndIndex(root, path){
    if (!path.length) return { parent: null, index: -1 };
    const last = path[path.length-1];
    if (typeof last === 'number') {
      return { parent: root, index: last };
    }
    // when path ends with ['children', idx]
    const idx = path[path.length-1];
    const arr = path.slice(0,-2).reduce((acc, key)=> key==='children'? acc.children : acc[key], root);
    return { parent: arr, index: idx };
  }

  function deleteAt(root, path){
    if (!path.length) return;
    if (typeof path[path.length-1] === 'number') {
      root.splice(path[path.length-1], 1);
      return;
    }
    const { parent, index } = getParentAndIndex(root, path);
    parent.splice(index,1);
  }

  function moveItem(root, path, dir){
    const { parent, index } = getParentAndIndex(root, path);
    if (!parent) return;
    const ni = index + dir;
    if (ni < 0 || ni >= parent.length) return;
    const [it] = parent.splice(index,1);
    parent.splice(ni,0,it);
  }

  function indentItem(root, path){
    const { parent, index } = getParentAndIndex(root, path);
    if (!parent || index<=0) return;
    const prev = parent[index-1];
    prev.children = prev.children || [];
    const [it] = parent.splice(index,1);
    prev.children.push(it);
  }

  function outdentItem(root, path){
    // move item one level up (after its parent)
    if (typeof path[path.length-1] === 'number') return; // already root
    const idx = path[path.length-1]; // child index
    const parentPath = path.slice(0,-2); // up to parent
    const gp = parentPath.length? parentPath.reduce((acc, key)=> typeof key==='number'? acc[key] : acc[key], root) : root;
    const parentArr = parentPath.length? (parentPath.length===1? root : parentPath.slice(0,-1).reduce((acc, key)=> typeof key==='number'? acc[key] : acc[key], root)).children : root;
    const parent = parentPath.length? parentArr : root;
    const fromArr = parentPath.length? gp.children : root;
    const [it] = fromArr.splice(idx,1);
    if (parent === root) {
      // insert after original parent in root array
      const parentIndex = root.indexOf(gp);
      root.splice(parentIndex+1, 0, it);
    } else {
      parent.push(it);
    }
  }

  async function doHeaderSavePublish(form, action){
    const brand_id = window.CURRENT_BRAND_ID;
    if (!brand_id) { window.websiteBuilder?.showErrorMessage('Geen brand_id'); return; }
    const json = exportHeaderAsJSON(form);
    try {
      toggleBusy(form, true);
      if (action === 'save') {
        const r = await window.BuilderPublishAPI.saveHeaderDraft({ brand_id, content_json: json });
        window.websiteBuilder?.showNotification(`✅ Header concept opgeslagen (v${r.version ?? '-'})`, 'success');
      } else if (action === 'publish') {
        const html = exportHeaderAsHTML(json);
        const r = await window.BuilderPublishAPI.publishHeader({ brand_id, body_html: html });
        window.websiteBuilder?.showNotification(`🚀 Header gepubliceerd (v${r.version ?? '-'})`, 'success');
      }
    } catch (e) {
      console.error('Header publish error', e);
      window.websiteBuilder?.showErrorMessage(`Header actie mislukt: ${e?.message || e}`);
    } finally {
      toggleBusy(form, false);
    }
  }

  async function doFooterSavePublish(form, action){
    const brand_id = window.CURRENT_BRAND_ID;
    if (!brand_id) { window.websiteBuilder?.showErrorMessage('Geen brand_id'); return; }
    const json = exportFooterAsJSON(form);
    try {
      toggleBusy(form, true);
      if (action === 'save') {
        const r = await window.BuilderPublishAPI.saveFooterDraft({ brand_id, content_json: json });
        window.websiteBuilder?.showNotification(`✅ Footer concept opgeslagen (v${r.version ?? '-'})`, 'success');
      } else if (action === 'publish') {
        const html = exportFooterAsHTML(json);
        const r = await window.BuilderPublishAPI.publishFooter({ brand_id, body_html: html });
        window.websiteBuilder?.showNotification(`🚀 Footer gepubliceerd (v${r.version ?? '-'})`, 'success');
      }
    } catch (e) {
      console.error('Footer publish error', e);
      window.websiteBuilder?.showErrorMessage(`Footer actie mislukt: ${e?.message || e}`);
    } finally {
      toggleBusy(form, false);
    }
  }

  async function doMenuSavePublish(form, action){
    const brand_id = window.CURRENT_BRAND_ID;
    if (!brand_id) { window.websiteBuilder?.showErrorMessage('Geen brand_id'); return; }
    const menuData = exportMenuAsJSON(form); // can be array (legacy) or map { key: [] }
    try {
      toggleBusy(form, true);
      if (action === 'save') {
        const payload = Array.isArray(menuData) ? { brand_id, menu_json: menuData } : { brand_id, menu_map: menuData };
        const r = await window.BuilderPublishAPI.saveMenuDraft(payload);
        window.websiteBuilder?.showNotification(`✅ Menu concept opgeslagen (v${r.version ?? '-'})`, 'success');
        try { window.MenuPreview?.render(menuData); } catch {}
      } else if (action === 'publish') {
        const r = await window.BuilderPublishAPI.publishMenu({ brand_id });
        window.websiteBuilder?.showNotification(`🚀 Menu gepubliceerd (v${r.version ?? '-'})`, 'success');
        try { window.MenuPreview?.render(menuData); } catch {}
      }
    } catch (e) {
      console.error('Menu publish error', e);
      window.websiteBuilder?.showErrorMessage(`Menu actie mislukt: ${e?.message || e}`);
    } finally {
      toggleBusy(form, false);
    }
  }

  function toggleBusy(form, on){
    const btns = form.querySelectorAll('button');
    btns.forEach(b => b.disabled = !!on);
    if (on) {
      if (!form.__status) {
        form.__status = document.createElement('div');
        form.__status.style.cssText = 'font-size:12px;color:#6b7280;margin-top:6px;';
        form.appendChild(form.__status);
      }
      form.__status.textContent = 'Bezig...';
    } else if (form.__status) {
      form.__status.textContent = '';
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
      '<label>Menu key (binding voor footer navigatie)</label>', h('input', { name:'menuKey', class:'form-control', type:'text', value:'footer' }),
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
    const form = h('form', { style:'display:grid;gap:10px;' }, []);

    // initial from JSON default
    const defaultMain = [
      { label: 'Home', href: '/' },
      { label: 'Reizen', href: '/reizen', children: [ { label:'Rondreizen', href:'/reizen/rondreizen' } ] }
    ];
    form.__menuMap = { main: normalizeMenu(defaultMain), footer: [] };

    // Menu key selector
    const keyWrap = document.createElement('div');
    keyWrap.style.cssText = 'display:flex;gap:8px;align-items:center;';
    keyWrap.innerHTML = '<label style="font-weight:700;color:#374151;">Menu key</label>';
    const sel = document.createElement('select'); sel.name = 'menuKey'; sel.className = 'form-control';
    sel.innerHTML = '<option value="main">main</option><option value="footer">footer</option><option value="custom">custom…</option>';
    const customInput = document.createElement('input'); customInput.className='form-control'; customInput.placeholder='custom key'; customInput.style.display='none';
    keyWrap.appendChild(sel); keyWrap.appendChild(customInput);

    const treeWrap = document.createElement('div');
    const currentKey = () => (sel.value === 'custom' ? (customInput.value || 'custom') : sel.value);
    const updateView = () => renderMenuTree(treeWrap, form, currentKey());
    updateView();
    // Auto-import once on first open for convenience
    (async () => {
      try { await importPagesFromBoltIntoForm(form, treeWrap, currentKey()); } catch {}
    })();

    const actions = h('div', { style:'display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;' }, [
      h('button', { type:'button', class:'btn', id:'mnuImport' }, ['Importeer uit Bolt']),
      h('button', { type:'button', class:'btn btn-secondary', id:'mnuSave' }, ['Opslaan (concept)']),
      h('button', { type:'button', class:'btn btn-primary', id:'mnuPublish' }, ['Publiceer'])
    ]);

    body.appendChild(keyWrap);
    body.appendChild(treeWrap);
    body.appendChild(actions);

    sel.onchange = () => { customInput.style.display = sel.value==='custom' ? '' : 'none'; updateView(); };
    customInput.oninput = () => updateView();

    body.querySelector('#mnuImport').onclick = async (e)=>{ e.preventDefault(); await importPagesFromBoltIntoForm(form, treeWrap, currentKey()); };
    body.querySelector('#mnuSave').onclick = (e)=>{ e.preventDefault(); doMenuSavePublish(form, 'save'); };
    body.querySelector('#mnuPublish').onclick = (e)=>{ e.preventDefault(); doMenuSavePublish(form, 'publish'); };
  }

  async function importPagesFromBoltIntoForm(form, treeWrap, menuKey){
    try {
      // Central fetch helper (adds headers + base /functions/v1)
      const callFn = (window.FnClient && window.FnClient.callFn) || null;
      const apiBase = (window.FnClient && window.FnClient.functionsBase && window.FnClient.functionsBase()) || ((window.BOLT_API && window.BOLT_API.baseUrl && (window.BOLT_API.baseUrl.replace(/\/$/, '') + '/functions/v1')) || '');
      const brand_id = window.CURRENT_BRAND_ID;
      if (!apiBase || !brand_id) throw new Error('Bolt API of brand_id ontbreekt');
      const pathList = `/pages-api/list?brand_id=${encodeURIComponent(brand_id)}${menuKey?`&menu_key=${encodeURIComponent(menuKey)}`:''}`;
      let data;
      const doFetch = async (fullUrl) => {
        const headers = buildBoltHeaders();
        const res = await fetch(fullUrl, { headers });
        const ct = res.headers.get('content-type')||'';
        const body = ct.includes('application/json') ? await res.json() : await res.text();
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${typeof body==='string'? body : JSON.stringify(body)}`);
        return body;
      };
      try {
        if (callFn) data = await callFn(pathList); else data = await doFetch(`${apiBase}${pathList}`);
      } catch (err) {
        // Fallback to legacy endpoint without /list
        const altPath = `/pages-api?brand_id=${encodeURIComponent(brand_id)}${menuKey?`&menu_key=${encodeURIComponent(menuKey)}`:''}`;
        if (callFn) data = await callFn(altPath); else data = await doFetch(`${apiBase}${altPath}`);
      }
      const pages = Array.isArray(data.pages) ? data.pages : [];
      // filter show_in_menu
      const shown = pages.filter(p => !!p.show_in_menu);
      if (!shown.length) {
        window.websiteBuilder?.showNotification('Geen pagina\'s gevonden met show_in_menu voor deze key.', 'info');
      }
      // map by slug
      const bySlug = new Map();
      shown.forEach(p => {
        bySlug.set(p.slug, { label: p.title || p.slug, href: p.url || `/${p.slug}`, children: [], _order: p.menu_order ?? p.order ?? 0, _parent: p.parent_slug || null });
      });
      // build hierarchy
      const roots = [];
      bySlug.forEach((node, slug) => {
        if (node._parent && bySlug.has(node._parent)) {
          bySlug.get(node._parent).children.push(node);
        } else {
          roots.push(node);
        }
      });
      const sortTree = (arr) => { arr.sort((a,b)=> (a._order||0)-(b._order||0)); arr.forEach(n => n.children && sortTree(n.children)); };
      sortTree(roots);
      // cleanup temp keys
      const clean = (arr) => arr.map(({label, href, children}) => ({ label, href, children: clean(children||[]) }));
      form.__menuMap = form.__menuMap || {};
      const key = menuKey || 'main';
      form.__menuMap[key] = clean(roots);
      renderMenuTree(treeWrap, form, key);
      window.websiteBuilder?.showNotification('✅ Menu geïmporteerd uit Bolt', 'success');
    } catch (e) {
      console.error('Import pages failed', e);
      window.websiteBuilder?.showErrorMessage(`Import mislukt: ${e?.message||e}`);
    }
  }

  function buildBoltHeaders(){
    const h = { 'Content-Type': 'application/json' };
    if (window.CURRENT_TOKEN) h.Authorization = `Bearer ${window.CURRENT_TOKEN}`;
    const apiKey = (window.BOLT_API && window.BOLT_API.apiKey) || (window.BOLT_DB && window.BOLT_DB.anonKey);
    if (apiKey) h.apikey = apiKey;
    return h;
  }

  window.LayoutsBuilder = {
    openHeaderBuilder,
    openFooterBuilder,
    openMenuBuilder,
    exportHeaderAsJSON, exportHeaderAsHTML,
    exportFooterAsJSON, exportFooterAsHTML,
    exportMenuAsJSON,
    // expose for dedicated view
    renderMenuTree,
    importPagesFromBoltIntoForm,
    doMenuSavePublish
  };
})();
