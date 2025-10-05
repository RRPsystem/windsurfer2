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
    const grid = el('div', { style: 'display:grid;grid-template-columns:420px 1fr;gap:16px;align-items:start;' });

    // Left: editor panel
    const panel = el('div', { style: 'border:1px solid #e5e7eb;border-radius:10px;background:#fff;padding:14px;' });
    panel.appendChild(el('div', { style:'font-weight:700;font-size:18px;margin-bottom:6px;' }, 'Menu & Footer'));

    // Key selector
    const keyWrap = el('div', { style: 'display:flex;gap:8px;align-items:center;margin:8px 0;' });
    keyWrap.appendChild(el('label', { style:'font-weight:700;color:#374151;' }, 'Menu key'));
    const sel = el('select', { class: 'form-control' });
    sel.innerHTML = '<option value="main">main</option><option value="footer">footer</option><option value="custom">custom…</option>';
    const customInput = el('input', { class:'form-control', placeholder:'custom key', style:'display:none' });
    keyWrap.appendChild(sel);
    keyWrap.appendChild(customInput);
    panel.appendChild(keyWrap);

    // Tree container
    const treeWrap = el('div');
    panel.appendChild(treeWrap);

    // Actions
    const actions = el('div', { style:'display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;' });
    const btnImport = el('button', { class:'btn', type:'button', id:'mnuImport' }, 'Importeer uit Bolt');
    const btnSave = el('button', { class:'btn btn-secondary', type:'button', id:'mnuSave' }, 'Opslaan (concept)');
    const btnPublish = el('button', { class:'btn btn-primary', type:'button', id:'mnuPublish' }, 'Publiceer');
    actions.appendChild(btnImport); actions.appendChild(btnSave); actions.appendChild(btnPublish);
    panel.appendChild(actions);

    // Presets
    const presetBox = el('div', { style:'margin-top:12px;' });
    presetBox.appendChild(el('div', { style:'font-weight:700;margin-bottom:6px;color:#374151;' }, 'Presets'));
    const list = el('div', { style:'display:grid;grid-template-columns:1fr;gap:8px;' });
    presetsList().forEach(p => {
      const card = el('div', { class:'btn', style:'display:flex;justify-content:space-between;align-items:center;' });
      card.innerHTML = `<span>${p.label}</span><i class="fas fa-plus"></i>`;
      card.onclick = () => {
        try {
          const key = sel.value==='custom' ? (customInput.value || 'custom') : sel.value;
          form.__menuMap[key] = JSON.parse(JSON.stringify(p.items || []));
          window.LayoutsBuilder.renderMenuTree(treeWrap, form, key);
          window.websiteBuilder?.showNotification('Preset toegepast', 'success');
        } catch (e) { console.warn(e); }
      };
      list.appendChild(card);
    });
    presetBox.appendChild(list);
    panel.appendChild(presetBox);

    // Right: preview panel
    const preview = el('div', { style: 'border:1px solid #e5e7eb;border-radius:10px;background:#fff;padding:14px;min-height:280px;' });
    preview.appendChild(el('div', { style:'font-weight:700;margin-bottom:10px;' }, 'Live preview'));
    const navMain = el('nav', { 'data-menu-key':'main' });
    const hr = el('hr', { style:'margin:16px 0;opacity:.2;' });
    const navFooter = el('nav', { 'data-menu-key':'footer' });
    preview.appendChild(navMain);
    preview.appendChild(hr);
    preview.appendChild(navFooter);

    grid.appendChild(panel);
    grid.appendChild(preview);
    container.appendChild(grid);

    // Local form state compatible met LayoutsBuilder
    const form = el('form');
    form.__menuMap = { main: [], footer: [] };

    // Helpers
    const currentKey = () => sel.value==='custom' ? (customInput.value || 'custom') : sel.value;
    const updateView = () => window.LayoutsBuilder.renderMenuTree(treeWrap, form, currentKey());

    // Initialize
    updateView();
    // Auto-import (once)
    (async () => { try { await window.LayoutsBuilder.importPagesFromBoltIntoForm(form, treeWrap, currentKey()); } catch (e) {} })();

    // Wire controls
    sel.onchange = () => { customInput.style.display = sel.value==='custom' ? '' : 'none'; updateView(); };
    customInput.oninput = () => updateView();
    btnImport.onclick = async (e) => { e.preventDefault(); await window.LayoutsBuilder.importPagesFromBoltIntoForm(form, treeWrap, currentKey()); };
    btnSave.onclick = (e) => { e.preventDefault(); window.LayoutsBuilder.doMenuSavePublish(form, 'save'); try { window.MenuPreview?.render(form.__menuMap); } catch {} };
    btnPublish.onclick = (e) => { e.preventDefault(); window.LayoutsBuilder.doMenuSavePublish(form, 'publish'); try { window.MenuPreview?.render(form.__menuMap); } catch {} };

    // First render of preview from cache
    try { window.MenuPreview?.render(); } catch {}
  }

  window.MenuFooterView = { mount };
})();
