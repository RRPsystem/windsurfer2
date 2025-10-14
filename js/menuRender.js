// js/menuRender.js
(function(){
  function ensureArray(x){ return Array.isArray(x) ? x : (x ? [x] : []); }

  function buildMenuHtml(items){
    const ul = document.createElement('ul');
    ul.style.cssText = 'list-style:none;display:flex;gap:12px;margin:0;padding:0;flex-wrap:wrap;';
    items.forEach(it => {
      const li = document.createElement('li');
      li.style.cssText = 'position:relative;';
      const a = document.createElement('a');
      a.textContent = it.label || 'Link';
      a.href = it.href || '#';
      a.style.cssText = 'text-decoration:none;color:#0f172a;padding:6px 8px;border-radius:6px;display:inline-block;';
      li.appendChild(a);
      if (it.children && it.children.length){
        const sub = document.createElement('ul');
        sub.style.cssText = 'list-style:none;position:absolute;left:0;top:100%;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px;margin:6px 0 0 0;min-width:180px;display:none;z-index:60;';
        it.children.forEach(ch => {
          const cli = document.createElement('li');
          const ca = document.createElement('a');
          ca.textContent = ch.label || 'Link';
          ca.href = ch.href || '#';
          ca.style.cssText = 'text-decoration:none;color:#0f172a;padding:6px 8px;border-radius:6px;display:block;';
          cli.appendChild(ca);
          sub.appendChild(cli);
        });
        li.appendChild(sub);
        li.onmouseenter = () => { sub.style.display = 'block'; };
        li.onmouseleave = () => { sub.style.display = 'none'; };
      }
      ul.appendChild(li);
    });
    return ul;
  }

  function normalizeMap(map){
    if (!map) return {};
    if (Array.isArray(map)) return { main: map }; // backward compatibility
    return map;
  }

  function readCachedMenu(){
    try {
      const bid = window.CURRENT_BRAND_ID;
      if (!bid) return null;
      const raw = localStorage.getItem(`wb_menu_${bid}`);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data.menu_map || (data.menu_json ? { main: data.menu_json } : null);
    } catch (e) { return null; }
  }

  function renderAll(menuMap){
    const map = normalizeMap(menuMap) || readCachedMenu() || {};
    const navs = document.querySelectorAll('nav[data-menu-key]');
    navs.forEach(nav => {
      const key = nav.getAttribute('data-menu-key') || 'main';
      const items = ensureArray(map[key] || []);
      nav.innerHTML = '';
      nav.appendChild(buildMenuHtml(items));
    });
  }

  window.MenuPreview = {
    render: renderAll
  };

  // Auto-render on load using cached menu if present
  try { document.addEventListener('DOMContentLoaded', () => renderAll()); } catch (e) {}
})();
