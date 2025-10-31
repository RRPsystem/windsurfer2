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
        label: 'Main ”“ Basic',
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
        label: 'Main ”“ Mega (stub)',
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
        label: 'Footer ”“ Compact',
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

    // Full Page Preview Button
    const fullPreviewBtn = el('button', { 
      class: 'btn btn-primary', 
      style: 'margin-bottom:16px;width:100%;padding:12px;font-size:16px;font-weight:700;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border:none;' 
    }, '<i class="fas fa-eye"></i> Volledige Pagina Preview (Header + Content + Footer)');
    fullPreviewBtn.onclick = () => {
      // Open full page preview in new window
      const previewUrl = `preview.html?${new URLSearchParams(window.location.search).toString()}&v=${Date.now()}`;
      window.open(previewUrl, '_blank', 'noopener=no');
    };
    container.appendChild(fullPreviewBtn);

    // Top preview (full width): renders Header (with menu binding)
    const topPreview = el('div', { style: 'border:1px solid #e5e7eb;border-radius:10px;background:#fff;padding:0;margin-bottom:16px;overflow:visible;' });
    const topTitle = el('div', { style:'font-weight:700;margin:10px 14px;' }, 'Header preview');
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
    const grid = el('div', { style: 'display:grid;grid-template-columns:450px 1fr;gap:16px;align-items:stretch;min-height:600px;' });

    // Left: compact controls panel
    const panel = el('div', { style: 'border:1px solid #e5e7eb;border-radius:10px;background:#fff;padding:14px;overflow-y:auto;height:100%;max-height:calc(100vh - 200px);' });
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
          if (window.LayoutsBuilder && typeof window.LayoutsBuilder.renderMenuTree === 'function') {
            window.LayoutsBuilder.renderMenuTree(treeWrap, form, key);
          } else {
            console.warn('[menuFooterView] LayoutsBuilder not available, skipping tree render');
          }
          window.websiteBuilder?.showNotification('Preset toegepast', 'success');
          try { window.MenuPreview?.render(form.__menuMap); } catch (e) {}
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
    const hdrLogoH = el('input', { class:'form-control', type:'number', name:'headerLogoH', value:'40', min:'16', max:'160', placeholder:'Logo hoogte (px)' });
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
      let arr=[]; try { arr = JSON.parse(socialsHidden.value||'[]'); } catch (e) { arr=[]; }
      arr.forEach((it,idx)=>{
        const row = el('div', { style:'display:flex;gap:6px;align-items:center;margin:4px 0;' });
        const icon = el('input', { class:'form-control', placeholder:'fa-brands fa-facebook', value: it.icon||'' , style:'flex:1;' });
        const pick = el('button', { type:'button', class:'btn' }, 'Kies icoon');
        const href = el('input', { class:'form-control', placeholder:'https://...', value: it.href||'' , style:'flex:2;' });
        const del = el('button', { type:'button', class:'btn btn-secondary' }, 'X');
        del.onclick = () => { arr.splice(idx,1); socialsHidden.value = JSON.stringify(arr); redrawSocials(); renderTop(); };
        icon.oninput = () => { arr[idx].icon = icon.value; socialsHidden.value = JSON.stringify(arr); renderTop(); };
        pick.onclick = async () => { try { const { icon: ic } = await window.IconPicker.open({ current: icon.value, compact: true }); if (ic){ icon.value = ic; arr[idx].icon = ic; socialsHidden.value = JSON.stringify(arr); renderTop(); } } catch (e) {} };
        href.oninput = () => { arr[idx].href = href.value; socialsHidden.value = JSON.stringify(arr); renderTop(); };
        row.appendChild(icon); row.appendChild(pick); row.appendChild(href); row.appendChild(del);
        socialsList.appendChild(row);
      });
    }
    socialsAdd.onclick = () => {
      let arr=[]; try { arr = JSON.parse(socialsHidden.value||'[]'); } catch (e) { arr=[]; }
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
    hdrForm.appendChild(hdrLogoH);
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

    // Footer controls (enhanced)
    const footerBox = el('div', { style:'border-top:2px solid #8b5cf6;margin-top:16px;padding-top:16px;background:linear-gradient(to bottom, #faf5ff 0%, #ffffff 100%);padding:16px;border-radius:8px;' });
    footerBox.appendChild(el('div', { style:'font-weight:700;margin-bottom:12px;color:#7c3aed;font-size:16px;' }, '🎨 Footer Instellingen'));
    const ftrForm = el('form', { style:'display:grid;gap:12px;' });
    // Color section
    ftrForm.appendChild(el('div', { style:'font-weight:600;color:#6b7280;margin-top:8px;' }, '🎨 Kleuren'));
    const ftrAccent = el('input', { class:'form-control', type:'color', name:'accent', value:'#16a34a', style:'height:36px;padding:0 4px;' });
    const ftrBgFrom = el('input', { class:'form-control', type:'color', name:'bgFrom', value:'#f8fafc', style:'height:36px;padding:0 4px;' });
    const ftrBgTo = el('input', { class:'form-control', type:'color', name:'bgTo', value:'#ffffff', style:'height:36px;padding:0 4px;' });
    const ftrBgImageRow = el('div', { style:'display:flex;gap:8px;align-items:center;' });
    const ftrBgImage = el('input', { class:'form-control', name:'bgImage', placeholder:'Achtergrondafbeelding URL (optioneel)', style:'flex:1;' });
    const ftrBgUpload = el('input', { type:'file', accept:'image/*', style:'display:none' });
    const ftrBgBtn = el('button', { type:'button', class:'btn' }, 'Upload achtergrond');
    ftrBgBtn.onclick = () => ftrBgUpload.click();
    ftrBgUpload.onchange = () => { const f = ftrBgUpload.files && ftrBgUpload.files[0]; if (f){ ftrBgImage.value = URL.createObjectURL(f); renderFooter(); }};
    ftrBgImageRow.appendChild(ftrBgImage); ftrBgImageRow.appendChild(ftrBgBtn); ftrBgImageRow.appendChild(ftrBgUpload);
    // Overlay opacity slider
    const overlayLabel = el('label', { style:'font-weight:600;color:#6b7280;display:block;margin-top:8px;' }, '🖼️ Achtergrond Overlay Opacity');
    const ftrOverlay = el('input', { class:'form-control', type:'range', name:'bgOverlay', value:'0.7', min:'0', max:'1', step:'0.05', style:'width:100%;' });
    const overlayValue = el('span', { style:'margin-left:8px;color:#6b7280;font-size:14px;' }, '70%');
    ftrOverlay.oninput = () => { overlayValue.textContent = Math.round(ftrOverlay.value * 100) + '%'; renderFooter(); };
    const overlayRow = el('div', { style:'display:flex;align-items:center;gap:8px;' });
    overlayRow.appendChild(ftrOverlay); overlayRow.appendChild(overlayValue);
    const ftrMenuKey = el('input', { class:'form-control', name:'menuKey', value:'footer' });
    const ftrSecondMenu = el('input', { class:'form-control', name:'secondMenuKey', placeholder:'Tweede menu key (optioneel)' });
    const ftrLogoRow = el('div', { style:'display:flex;gap:8px;align-items:center;' });
    const ftrLogo = el('input', { class:'form-control', name:'logo', placeholder:'Footer logo URL (optioneel)', style:'flex:1;' });
    const ftrLogoUpload = el('input', { type:'file', accept:'image/*', style:'display:none' });
    const ftrLogoBtn = el('button', { type:'button', class:'btn' }, 'Upload footer logo');
    ftrLogoBtn.onclick = () => ftrLogoUpload.click();
    ftrLogoUpload.onchange = () => { const f = ftrLogoUpload.files && ftrLogoUpload.files[0]; if (f){ ftrLogo.value = URL.createObjectURL(f); renderFooter(); }};
    ftrLogoRow.appendChild(ftrLogo); ftrLogoRow.appendChild(ftrLogoBtn); ftrLogoRow.appendChild(ftrLogoUpload);
    const ftrLogoH = el('input', { class:'form-control', type:'number', name:'footerLogoH', value:'48', min:'16', max:'200', placeholder:'Footer logo hoogte (px)' });
    const ftrAddress = el('textarea', { class:'form-control', name:'address', placeholder:'Adresgegevens (HTML toegestaan)', style:'height:80px;' });
    // ----- Visual footer columns editor (defines colsWrap + ftrColsHidden) -----
    const ftrColsHidden = el('input', { type:'hidden', name:'cols', value:'[ { "title": "Contact", "links": [ { "label": "Bel ons", "href": "tel:+310000000" } ] } ]' });
    const colsWrap = el('div', { style:'border:2px solid #e5e7eb;border-radius:10px;padding:12px;background:#fafafa;margin-top:12px;' });
    const colsHead = el('div', { style:'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;' });
    colsHead.appendChild(el('div', { style:'font-weight:700;color:#374151;font-size:15px;' }, '📋 Footer Kolommen'));
    const addColBtn = el('button', { type:'button', class:'btn' }, 'Kolom toevoegen');
    colsHead.appendChild(addColBtn);
    const colsList = el('div');
    colsWrap.appendChild(colsHead);
    colsWrap.appendChild(colsList);

    function readCols(){
      try { const arr = JSON.parse(ftrColsHidden.value||'[]'); return Array.isArray(arr)?arr:[]; } catch (e) { return []; }
    }
    function writeCols(arr){ ftrColsHidden.value = JSON.stringify(arr); renderFooter(); }
    function redrawCols(){
      colsList.innerHTML='';
      const arr = readCols();
      arr.forEach((col, ci) => {
        const card = el('div', { style:'border:2px solid #d1d5db;border-radius:10px;padding:12px;margin:10px 0;background:white;box-shadow:0 2px 4px rgba(0,0,0,0.05);' });
        const row1 = el('div', { style:'display:flex;gap:8px;align-items:center;margin-bottom:10px;' });
        const typeLabel = el('label', { style:'font-weight:600;color:#6b7280;margin-right:8px;white-space:nowrap;' }, 'Type:');
        const typeSelect = el('select', { class:'form-control', style:'width:140px;' });
        typeSelect.innerHTML = '<option value="links">📌 Links</option><option value="text">📝 Tekst</option><option value="newsletter">📧 Nieuwsbrief</option>';
        typeSelect.value = col.type || 'links';
        typeSelect.onchange = () => { const a = readCols(); a[ci].type = typeSelect.value; writeCols(a); redrawCols(); };
        const title = el('input', { class:'form-control', placeholder:'Kolomtitel', value: col.title||'', style:'flex:1;' });
        const delCol = el('button', { type:'button', class:'btn btn-secondary' }, 'Verwijder kolom');
        delCol.onclick = () => { const a = readCols(); a.splice(ci,1); writeCols(a); redrawCols(); };
        title.oninput = () => { const a = readCols(); a[ci].title = title.value; writeCols(a); };
        row1.appendChild(typeLabel); row1.appendChild(typeSelect); row1.appendChild(title); row1.appendChild(delCol);
        card.appendChild(row1);
        const linksHead = el('div', { style:'display:flex;justify-content:space-between;align-items:center;margin:6px 0;' });
        linksHead.appendChild(el('div', { style:'font-weight:600;color:#475569;' }, 'Links'));
        const addLink = el('button', { type:'button', class:'btn' }, 'Link toevoegen');
        linksHead.appendChild(addLink);
        card.appendChild(linksHead);
        const linksList = el('div');
        card.appendChild(linksList);
        function redrawLinks(){
          linksList.innerHTML='';
          const a = readCols();
          const links = Array.isArray(a[ci].links)?a[ci].links:[];
          links.forEach((lk, li) => {
            const row = el('div', { style:'display:grid;grid-template-columns:1fr auto 1fr auto;gap:6px;align-items:center;margin:4px 0;' });
            const lab = el('input', { class:'form-control', placeholder:'Label', value: lk.label||'' });
            const pick = el('button', { type:'button', class:'btn' }, lk.icon ? 'Wijzig icoon' : 'Kies icoon');
            const href = el('input', { class:'form-control', placeholder:'URL of tel:...', value: lk.href||'' });
            const del = el('button', { type:'button', class:'btn btn-secondary' }, 'X');
            del.onclick = () => { const b = readCols(); b[ci].links.splice(li,1); writeCols(b); redrawLinks(); };
            lab.oninput = () => { const b = readCols(); b[ci].links[li].label = lab.value; writeCols(b); };
            pick.onclick = async () => { try { const { icon } = await window.IconPicker.open({ current: lk.icon||'', compact:true }); if (icon){ const b = readCols(); b[ci].links[li].icon = icon; writeCols(b); redrawLinks(); } } catch (e) {} };
            href.oninput = () => { const b = readCols(); b[ci].links[li].href = href.value; writeCols(b); };
            row.appendChild(lab); row.appendChild(pick); row.appendChild(href); row.appendChild(del);
            linksList.appendChild(row);
          });
        }
        addLink.onclick = () => { const a = readCols(); a[ci].links = a[ci].links||[]; a[ci].links.push({ label:'Nieuwe link', href:'#' }); writeCols(a); redrawLinks(); };
        redrawLinks();
        colsList.appendChild(card);
      });
    }
    addColBtn.onclick = () => { const a = readCols(); a.push({ title:'Nieuwe kolom', links:[] }); writeCols(a); redrawCols(); };
    redrawCols();
    const footerActions = el('div', { style:'display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;' });
    const ftrSave = el('button', { type:'button', class:'btn btn-secondary' }, 'Opslaan footer');
    const ftrPub = el('button', { type:'button', class:'btn btn-primary' }, 'Publiceer footer');
    footerActions.appendChild(ftrSave); footerActions.appendChild(ftrPub);
    // Add fields with labels in logical order
    ftrForm.appendChild(el('label', { style:'font-weight:600;color:#6b7280;margin-top:4px;' }, 'Accent kleur'));
    ftrForm.appendChild(ftrAccent);
    ftrForm.appendChild(el('label', { style:'font-weight:600;color:#6b7280;margin-top:4px;' }, 'Achtergrond kleur (van)'));
    ftrForm.appendChild(ftrBgFrom);
    ftrForm.appendChild(el('label', { style:'font-weight:600;color:#6b7280;margin-top:4px;' }, 'Achtergrond kleur (naar)'));
    ftrForm.appendChild(ftrBgTo);
    ftrForm.appendChild(el('div', { style:'font-weight:600;color:#6b7280;margin-top:12px;' }, '🖼️ Achtergrond Afbeelding'));
    ftrForm.appendChild(ftrBgImageRow);
    ftrForm.appendChild(overlayLabel);
    ftrForm.appendChild(overlayRow);
    ftrForm.appendChild(el('div', { style:'font-weight:600;color:#6b7280;margin-top:12px;' }, '📋 Logo & Content'));
    ftrForm.appendChild(ftrLogoRow);
    ftrForm.appendChild(el('label', { style:'font-weight:600;color:#6b7280;margin-top:4px;' }, 'Logo hoogte (px)'));
    ftrForm.appendChild(ftrLogoH);
    ftrForm.appendChild(el('label', { style:'font-weight:600;color:#6b7280;margin-top:4px;' }, 'Adresgegevens (HTML)'));
    ftrForm.appendChild(ftrAddress);
    ftrForm.appendChild(el('div', { style:'font-weight:600;color:#6b7280;margin-top:12px;' }, '🔗 Menu Koppelingen'));
    ftrForm.appendChild(el('label', { style:'font-weight:600;color:#6b7280;margin-top:4px;' }, 'Menu key'));
    ftrForm.appendChild(ftrMenuKey);
    ftrForm.appendChild(el('label', { style:'font-weight:600;color:#6b7280;margin-top:4px;' }, 'Tweede menu key (optioneel)'));
    ftrForm.appendChild(ftrSecondMenu);
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
    const updateView = () => {
      if (window.LayoutsBuilder && typeof window.LayoutsBuilder.renderMenuTree === 'function') {
        window.LayoutsBuilder.renderMenuTree(treeWrap, form, currentKey());
      } else {
        console.warn('[menuFooterView] LayoutsBuilder not available for updateView');
      }
    };
    const renderTop = () => {
      // Render Header HTML using current forms (footer los onderaan)
      try {
        const headerJson = window.LayoutsBuilder.exportHeaderAsJSON(hdrForm);
        const headerHtml = window.LayoutsBuilder.exportHeaderAsHTML(headerJson);
        topInner.innerHTML = headerHtml;
        // Populate menus inside header navs after injecting HTML
        try { window.MenuPreview?.render(form.__menuMap); } catch (e) {}
      } catch (e) { console.warn('Preview render failed', e); }
    };

    // Initialize
    updateView();
    renderTop();
    // Import function (inline since LayoutsBuilder might not be available)
    async function importPagesFromBolt() {
      try {
        const callFn = (window.FnClient && window.FnClient.callFn) || null;
        if (!callFn) {
          console.warn('[MenuFooterView] FnClient not available');
          return;
        }
        
        const brandId = (window.BOLT_CONFIG && window.BOLT_CONFIG.brand_id) || '';
        if (!brandId) {
          console.warn('[MenuFooterView] No brand_id configured');
          return;
        }
        
        const menuKey = currentKey();
        const resp = await callFn('pages-api/list', { brand_id: brandId, menu_key: menuKey });
        
        if (!resp || !resp.pages) {
          console.warn('[MenuFooterView] No pages returned');
          return;
        }
        
        // Build menu items from pages
        const items = resp.pages.map(p => ({
          label: p.title || p.slug,
          href: `/${p.slug}`,
          page_id: p.id
        }));
        
        // Update form
        if (!form.__menuMap) form.__menuMap = {};
        form.__menuMap[menuKey] = items;
        
        console.log(`[MenuFooterView] Imported ${items.length} pages for ${menuKey}`);
        
        // Update view if LayoutsBuilder is available
        if (window.LayoutsBuilder && typeof window.LayoutsBuilder.renderMenuTree === 'function') {
          window.LayoutsBuilder.renderMenuTree(treeWrap, form, menuKey);
        }
        
        return items;
      } catch (err) {
        console.error('[MenuFooterView] Import error:', err);
        throw err;
      }
    }
    
    // Auto-import (once)
    (async () => { 
      try { 
        await importPagesFromBolt();
        console.log('[MenuFooterView] Auto-import successful');
      } catch (e) {
        console.warn('[MenuFooterView] Auto-import failed:', e);
      }
    })();
    
    // Manual import button
    btnImport.onclick = async (e) => { 
      e.preventDefault(); 
      try {
        console.log('[MenuFooterView] Manual import started...');
        await importPagesFromBolt();
        console.log('[MenuFooterView] Manual import successful');
        try { window.MenuPreview?.render(form.__menuMap); } catch (e) {}
        renderTop();
        alert(`✅ Pagina's geïmporteerd! Check de menu structuur.`);
      } catch (err) {
        console.error('[MenuFooterView] Manual import failed:', err);
        alert('Pagina\'s importeren mislukt: ' + err.message);
      }
    };

    // Wire controls
    sel.onchange = () => { customInput.style.display = sel.value==='custom' ? '' : 'none'; updateView(); renderTop(); };
    customInput.oninput = () => updateView();
    btnPublish.onclick = (e) => { e.preventDefault(); window.LayoutsBuilder.doMenuSavePublish(form, 'publish'); try { window.MenuPreview?.render(form.__menuMap); } catch (e) {}; renderTop(); };

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
        try { window.MenuPreview?.render(form.__menuMap); } catch (e) {}
      } catch (e) { console.warn('Footer render failed', e); }
    };
    renderFooter();
    ;['input','change'].forEach(ev => ftrForm.addEventListener(ev, () => renderFooter()));

    // First render of preview from cache (header)
    try { window.MenuPreview?.render(); } catch (e) {}
  }

  window.MenuFooterView = { mount };
})();
