// js/views/menuFooterView.js
(function(){
  function el(tag, attrs={}, html){
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{
      if (k==='class') e.className=v; else if (k==='style') e.style.cssText=v; else e.setAttribute(k,v);
    });
    if (html!=null) e.innerHTML = html;
    return e;
  }

  function presetsList(){
    // A few simple presets the user can click to seed the tree
    return [
      {
        id: 'main-basic',
        label: 'Main – Basic',
        key: 'main',
        items: [
          { label: 'Home', href: '/' },
          { label: 'Reizen', href: '/reizen', children: [
            { label: 'Rondreizen', href: '/reizen/rondreizen' },
            { label: 'Stedentrips', href: '/reizen/stedentrips' }
          ]},
          { label: 'Over ons', href: '/over' }
        ]
      },
      {
        id: 'main-mega-stub',
        label: 'Main – Mega (stub)',
        key: 'main',
        items: [
          { label: 'Bestemmingen', href: '/bestemmingen', children: [
            { label: 'Europa', href: '/bestemmingen/europa' },
            { label: 'Azië', href: '/bestemmingen/azie' },
            { label: 'Amerika', href: '/bestemmingen/amerika' }
          ]},
          { label: 'Reizen', href: '/reizen' },
          { label: 'Inspiratie', href: '/inspiratie' }
        ]
      },
      {
        id: 'footer-compact',
        label: 'Footer – Compact',
        key: 'footer',
        items: [
          { label: 'Over ons', href: '/over' },
          { label: 'Privacy', href: '/privacy' },
          { label: 'Contact', href: '/contact' }
        ]
      }
    ];
  }

  function mount(container){
    container.innerHTML = '';

    // Top preview (full width): renders Header (with menu binding)
    const topPreview = el('div', { style: 'border:1px solid #e5e7eb;border-radius:10px;background:#fff;padding:0;margin-bottom:16px;overflow:visible;' });
    const topTitle = el('div', { style:'font-weight:700;margin:10px 14px;' }, 'Live preview');
    const topInner = el('div');
    topPreview.appendChild(topTitle);
    topPreview.appendChild(topInner);
    container.appendChild(topPreview);

    // Footer preview directly under header preview (more visible)
    const bottomPreview = el('div', { style: 'border:1px solid #e5e7eb;border-radius:10px;background:#fff;padding:0;margin:12px 0;overflow:hidden;' });
    const btmTitle = el('div', { style:'font-weight:700;margin:10px 14px;' }, 'Footer preview');
    const btmInner = el('div');
    bottomPreview.appendChild(btmTitle);
    bottomPreview.appendChild(btmInner);
    container.appendChild(bottomPreview);

    // Grid for sidebar (left) and editor canvas (right)
    const grid = el('div', { style: 'display:grid;grid-template-columns:320px 1fr;gap:16px;align-items:start;' });

    // Left: compact controls panel
    const panel = el('div', { style: 'border:1px solid #e5e7eb;border-radius:10px;background:#fff;padding:14px;max-height:calc(100vh - 220px);overflow:auto;' });
    panel.appendChild(el('div', { style:'font-weight:700;font-size:16px;margin-bottom:6px;' }, 'Menu & Footer'));

    // Key selector
    const keyWrap = el('div', { style: 'display:flex;gap:8px;align-items:center;margin:8px 0;' });
    keyWrap.appendChild(el('label', { style:'font-weight:700;color:#374151;' }, 'Menu key'));
    const sel = el('select', { class: 'form-control' });
    sel.innerHTML = '<option value="main">main</option><option value="footer">footer</option><option value="custom">custom…</option>';
    const customInput = el('input', { class:'form-control', placeholder:'custom key', style:'display:none' });
    keyWrap.appendChild(sel);
    keyWrap.appendChild(customInput);
    panel.appendChild(keyWrap);

    // Actions (Import + Publish only)
    const actions = el('div', { style:'display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;' });
    const btnImport = el('button', { class:'btn', type:'button', id:'mnuImport' }, 'Importeer mijn pagina\'s');
    const btnPublish = el('button', { class:'btn btn-primary', type:'button', id:'mnuPublish' }, 'Publiceer');
    actions.appendChild(btnImport); actions.appendChild(btnPublish);
    panel.appendChild(actions);

    // Presets
    const presetBox = el('div', { style:'margin-top:12px;' });
    presetBox.appendChild(el('div', { style:'font-weight:700;margin-bottom:6px;color:#374151;' }, 'Presets'));
    const list = el('div', { style:'display:grid;grid-template-columns:1fr;gap:8px;' });
    presetsList().forEach(p => {
      const card = el('div', { class:'btn', style:'display:flex;justify-content:space-between;align-items:center;' });
      card.innerHTML = `<span>${p.label}</span><i class=\"fas fa-plus\"></i>`;
      card.onclick = () => {
        try {
          const key = sel.value==='custom' ? (customInput.value || 'custom') : sel.value;
          form.__menuMap[key] = JSON.parse(JSON.stringify(p.items || []));
          window.LayoutsBuilder.renderMenuTree(treeWrap, form, key);
          window.websiteBuilder?.showNotification('Preset toegepast', 'success');
          try { window.MenuPreview?.render(form.__menuMap); } catch {}
        } catch (e) { console.warn(e); }
      };
      list.appendChild(card);
    });
    presetBox.appendChild(list);
    panel.appendChild(presetBox);

    // Header controls
    const headerBox = el('div', { style:'border-top:1px solid #e5e7eb;margin-top:12px;padding-top:12px;' });
    headerBox.appendChild(el('div', { style:'font-weight:700;margin-bottom:6px;color:#374151;' }, 'Header'));
    const hdrForm = el('form', { style:'display:grid;gap:8px;' });
    const hdrBrand = el('input', { class:'form-control', placeholder:'Brand naam', name:'brand', value:'Test Brand' });
    const logoRow = el('div', { style:'display:flex;gap:8px;align-items:center;' });
    const hdrLogo = el('input', { class:'form-control', placeholder:'Logo URL (optioneel)', name:'logo', style:'flex:1;' });
    const hdrLogoUpload = el('input', { type:'file', accept:'image/*', style:'display:none' });
    const hdrLogoBtn = el('button', { type:'button', class:'btn' }, 'Upload logo');
    hdrLogoBtn.onclick = () => hdrLogoUpload.click();
    hdrLogoUpload.onchange = () => {
      const file = hdrLogoUpload.files && hdrLogoUpload.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      hdrLogo.value = url; renderTop();
    };
    logoRow.appendChild(hdrLogo); logoRow.appendChild(hdrLogoBtn); logoRow.appendChild(hdrLogoUpload);
    const hdrAccent = el('input', { class:'form-control', type:'color', name:'accent', value:'#16a34a', style:'height:32px;padding:0 4px;' });
    const hdrHeaderBg = el('input', { class:'form-control', type:'color', name:'headerBg', value:'#ffffff', style:'height:32px;padding:0 4px;' });
    const hdrStickyWrap = el('label', { style:'display:flex;align-items:center;gap:6px;' });
    const hdrSticky = el('input', { type:'checkbox', name:'sticky' }); hdrStickyWrap.appendChild(hdrSticky); hdrStickyWrap.appendChild(el('span', {}, 'Sticky top'));
    const hdrTopbarWrap = el('label', { style:'display:flex;align-items:center;gap:6px;' });
    const hdrTopbar = el('input', { type:'checkbox', name:'topbarEnabled' }); hdrTopbarWrap.appendChild(hdrTopbar); hdrTopbarWrap.appendChild(el('span', {}, 'Top bar aan'));
    // Topbar simple fields: address, phone, socials (icon + href)
    const hdrTopbarBg = el('input', { class:'form-control', type:'color', name:'topbarBg', value:'#f1f5f9', style:'height:32px;padding:0 4px;' });
    const hdrTopbarAddress = el('input', { class:'form-control', name:'topbarAddress', placeholder:'Adres (korte tekst)' });
    const hdrTopbarPhone = el('input', { class:'form-control', name:'topbarPhone', placeholder:'Telefoon (bijv. +31...)' });
    const socialsWrap = el('div', { style:'border:1px dashed #e5e7eb;border-radius:8px;padding:8px;' });
    const socialsTitle = el('div', { style:'font-weight:700;color:#374151;margin-bottom:6px;' }, 'Social media');
    const socialsList = el('div', { });
    const socialsAdd = el('button', { type:'button', class:'btn' }, 'Voeg social toe');
    const socialsHidden = el('input', { type:'hidden', name:'topbarSocials' });
    function redrawSocials(){
      socialsList.innerHTML = '';
      let arr=[]; try { arr = JSON.parse(socialsHidden.value||'[]'); } catch { arr=[]; }
      arr.forEach((it,idx)=>{
        const row = el('div', { style:'display:flex;gap:6px;align-items:center;margin:4px 0;' });
        const icon = el('input', { class:'form-control', placeholder:'fa-brands fa-facebook', value: it.icon||'' , style:'flex:1;' });
        const href = el('input', { class:'form-control', placeholder:'https://...', value: it.href||'' , style:'flex:2;' });
        const del = el('button', { type:'button', class:'btn btn-secondary' }, 'X');
        del.onclick = () => { arr.splice(idx,1); socialsHidden.value = JSON.stringify(arr); redrawSocials(); renderTop(); };
        icon.oninput = () => { arr[idx].icon = icon.value; socialsHidden.value = JSON.stringify(arr); renderTop(); };
        href.oninput = () => { arr[idx].href = href.value; socialsHidden.value = JSON.stringify(arr); renderTop(); };
        row.appendChild(icon); row.appendChild(href); row.appendChild(del);
        socialsList.appendChild(row);
      });
    }
    socialsAdd.onclick = () => {
      let arr=[]; try { arr = JSON.parse(socialsHidden.value||'[]'); } catch { arr=[]; }
      arr.push({ icon:'fa-brands fa-facebook', href:'https://facebook.com' });
      socialsHidden.value = JSON.stringify(arr); redrawSocials(); renderTop();
    };
    socialsWrap.appendChild(socialsTitle);
    socialsWrap.appendChild(socialsList);
    socialsWrap.appendChild(socialsAdd);
    const headerActions = el('div', { style:'display:flex;gap:8px;flex-wrap:wrap;' });
    const hdrSave = el('button', { type:'button', class:'btn btn-secondary' }, 'Opslaan header');
    const hdrPub = el('button', { type:'button', class:'btn btn-primary' }, 'Publiceer header');
    headerActions.appendChild(hdrSave); headerActions.appendChild(hdrPub);
    hdrForm.appendChild(hdrBrand);
    hdrForm.appendChild(logoRow);
    hdrForm.appendChild(hdrAccent);
    hdrForm.appendChild(hdrHeaderBg);
    hdrForm.appendChild(hdrStickyWrap);
    hdrForm.appendChild(hdrTopbarWrap);
    hdrForm.appendChild(hdrTopbarBg);
    hdrForm.appendChild(hdrTopbarAddress);
    hdrForm.appendChild(hdrTopbarPhone);
    hdrForm.appendChild(socialsWrap);
    hdrForm.appendChild(socialsHidden);
    hdrForm.appendChild(headerActions);
    headerBox.appendChild(hdrForm);
    panel.appendChild(headerBox);

    // Footer controls (basic)
    const footerBox = el('div', { style:'border-top:1px solid #e5e7eb;margin-top:12px;padding-top:12px;' });
    footerBox.appendChild(el('div', { style:'font-weight:700;margin-bottom:6px;color:#374151;' }, 'Footer'));
    const ftrForm = el('form', { style:'display:grid;gap:8px;' });
    const ftrAccent = el('input', { class:'form-control', type:'color', name:'accent', value:'#16a34a', style:'height:32px;padding:0 4px;' });
    const ftrBgFrom = el('input', { class:'form-control', type:'color', name:'bgFrom', value:'#f8fafc', style:'height:32px;padding:0 4px;' });
    const ftrBgTo = el('input', { class:'form-control', type:'color', name:'bgTo', value:'#ffffff', style:'height:32px;padding:0 4px;' });
    const ftrBgImageRow = el('div', { style:'display:flex;gap:8px;align-items:center;' });
    const ftrBgImage = el('input', { class:'form-control', name:'bgImage', placeholder:'Achtergrondafbeelding URL (optioneel)', style:'flex:1;' });
    const ftrBgUpload = el('input', { type:'file', accept:'image/*', style:'display:none' });
    const ftrBgBtn = el('button', { type:'button', class:'btn' }, 'Upload achtergrond');
    ftrBgBtn.onclick = () => ftrBgUpload.click();
    ftrBgUpload.onchange = () => { const f = ftrBgUpload.files && ftrBgUpload.files[0]; if (f){ ftrBgImage.value = URL.createObjectURL(f); renderFooter(); }};
    ftrBgImageRow.appendChild(ftrBgImage); ftrBgImageRow.appendChild(ftrBgBtn); ftrBgImageRow.appendChild(ftrBgUpload);
    const ftrMenuKey = el('input', { class:'form-control', name:'menuKey', value:'footer' });
    const ftrSecondMenu = el('input', { class:'form-control', name:'secondMenuKey', placeholder:'Tweede menu key (optioneel)' });
    const ftrLogoRow = el('div', { style:'display:flex;gap:8px;align-items:center;' });
    const ftrLogo = el('input', { class:'form-control', name:'logo', placeholder:'Footer logo URL (optioneel)', style:'flex:1;' });
    const ftrLogoUpload = el('input', { type:'file', accept:'image/*', style:'display:none' });
    const ftrLogoBtn = el('button', { type:'button', class:'btn' }, 'Upload footer logo');
    ftrLogoBtn.onclick = () => ftrLogoUpload.click();
    ftrLogoUpload.onchange = () => { const f = ftrLogoUpload.files && ftrLogoUpload.files[0]; if (f){ ftrLogo.value = URL.createObjectURL(f); renderFooter(); }};
    ftrLogoRow.appendChild(ftrLogo); ftrLogoRow.appendChild(ftrLogoBtn); ftrLogoRow.appendChild(ftrLogoUpload);
    const ftrAddress = el('textarea', { class:'form-control', name:'address', placeholder:'Adresgegevens (HTML toegestaan)', style:'height:80px;' });
    const ftrCols = el('textarea', { class:'form-control', name:'cols', style:'height:100px;' }, '[\n  { "title": "Contact", "links": [ { "label": "Bel ons", "href": "tel:+310000000" } ] }\n]');
    const footerActions = el('div', { style:'display:flex;gap:8px;flex-wrap:wrap;' });
    const ftrSave = el('button', { type:'button', class:'btn btn-secondary' }, 'Opslaan footer');
    const ftrPub = el('button', { type:'button', class:'btn btn-primary' }, 'Publiceer footer');
    footerActions.appendChild(ftrSave); footerActions.appendChild(ftrPub);
    ftrForm.appendChild(ftrAccent);
    ftrForm.appendChild(ftrBgFrom);
    ftrForm.appendChild(ftrBgTo);
    ftrForm.appendChild(ftrBgImageRow);
    ftrForm.appendChild(ftrMenuKey);
    ftrForm.appendChild(ftrSecondMenu);
    ftrForm.appendChild(ftrLogoRow);
    ftrForm.appendChild(ftrAddress);
    ftrForm.appendChild(colsWrap);
    ftrForm.appendChild(ftrColsHidden);
    ftrForm.appendChild(footerActions);
    footerBox.appendChild(ftrForm);
    panel.appendChild(footerBox);

    // Right: large canvas with tree editor
    const canvas = el('div', { style: 'border:1px solid #e5e7eb;border-radius:10px;background:#fff;padding:14px;min-height:420px;' });
    canvas.appendChild(el('div', { style:'font-weight:700;margin-bottom:10px;' }, 'Bewerk menu-structuur'));
    const treeWrap = el('div');
    canvas.appendChild(treeWrap);

    grid.appendChild(panel);
    grid.appendChild(canvas);
    container.appendChild(grid);

    // Local form state compatible met LayoutsBuilder
    const form = el('form');
    form.__menuMap = { main: [], footer: [] };

    // Helpers
    const currentKey = () => sel.value==='custom' ? (customInput.value || 'custom') : sel.value;
    const updateView = () => window.LayoutsBuilder.renderMenuTree(treeWrap, form, currentKey());
    const renderTop = () => {
      // Render Header HTML using current forms (footer los onderaan)
      try {
        const headerJson = window.LayoutsBuilder.exportHeaderAsJSON(hdrForm);
        const headerHtml = window.LayoutsBuilder.exportHeaderAsHTML(headerJson);
        topInner.innerHTML = headerHtml;
        // Populate menus inside header navs after injecting HTML
        try { window.MenuPreview?.render(form.__menuMap); } catch {}
      } catch (e) { console.warn('Preview render failed', e); }
    };

    // Initialize
    updateView();
    renderTop();
    // Auto-import (once)
    (async () => { try { await window.LayoutsBuilder.importPagesFromBoltIntoForm(form, treeWrap, currentKey()); } catch (e) {} })();

    // Wire controls
    sel.onchange = () => { customInput.style.display = sel.value==='custom' ? '' : 'none'; updateView(); renderTop(); };
    customInput.oninput = () => updateView();
    btnImport.onclick = async (e) => { e.preventDefault(); await window.LayoutsBuilder.importPagesFromBoltIntoForm(form, treeWrap, currentKey()); try { window.MenuPreview?.render(form.__menuMap); } catch {}; renderTop(); };
    btnPublish.onclick = (e) => { e.preventDefault(); window.LayoutsBuilder.doMenuSavePublish(form, 'publish'); try { window.MenuPreview?.render(form.__menuMap); } catch {}; renderTop(); };

    // Header actions
    hdrSave.onclick = async (e) => { e.preventDefault(); await window.LayoutsBuilder.doHeaderSavePublish(hdrForm, 'save'); renderTop(); };
    hdrPub.onclick = async (e) => { e.preventDefault(); await window.LayoutsBuilder.doHeaderSavePublish(hdrForm, 'publish'); renderTop(); };
    ;['input','change'].forEach(ev => hdrForm.addEventListener(ev, () => renderTop()));

    // Footer actions
    ftrSave.onclick = async (e) => { e.preventDefault(); await window.LayoutsBuilder.doFooterSavePublish(ftrForm, 'save'); renderTop(); };
    ftrPub.onclick = async (e) => { e.preventDefault(); await window.LayoutsBuilder.doFooterSavePublish(ftrForm, 'publish'); renderTop(); };
    ;['input','change'].forEach(ev => ftrForm.addEventListener(ev, () => renderTop()));

    const renderFooter = () => {
      try {
        const footerJson = window.LayoutsBuilder.exportFooterAsJSON(ftrForm);
        const footerHtml = window.LayoutsBuilder.exportFooterAsHTML(footerJson);
        btmInner.innerHTML = footerHtml;
        try { window.MenuPreview?.render(form.__menuMap); } catch {}
      } catch (e) { console.warn('Footer render failed', e); }
    };
    renderFooter();
    ;['input','change'].forEach(ev => ftrForm.addEventListener(ev, () => renderFooter()));

    // First render of preview from cache (header)
    try { window.MenuPreview?.render(); } catch {}
  }

  window.MenuFooterView = { mount };
})();
