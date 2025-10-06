// js/brandHydrator.js
// Populates all <nav data-menu-key> elements for a given brand by fetching menus from the API
// Reuses MenuPreview.render(map) to draw the menus consistently with the builder preview.
(function(){
  async function getQueryParam(name){
    try {
      const url = new URL(window.location.href);
      return url.searchParams.get(name);
    } catch { return null; }
  }

  async function detectContext(){
    const api = (window.BOLT_API && window.BOLT_API.baseUrl) || (await getQueryParam('api')) || '';
    const brandId = window.CURRENT_BRAND_ID || (await getQueryParam('brand_id')) || '';
    const token = window.BOLT_TOKEN || (await getQueryParam('token')) || '';
    return { api, brandId, token };
  }

  async function fetchMenu(api, brandId, key, token){
    const url = `${api}/menus-api/get?brand_id=${encodeURIComponent(brandId)}&key=${encodeURIComponent(key)}`;
    const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error(`Menu fetch failed (${res.status})`);
    // Expected shape: { items: [...] }
    const data = await res.json();
    return Array.isArray(data) ? data : (data.items || []);
  }

  async function hydrate(){
    const { api, brandId, token } = await detectContext();
    if (!api || !brandId){
      console.warn('[BrandHydrator] Missing api or brandId');
      return;
    }
    const navs = Array.from(document.querySelectorAll('nav[data-menu-key]'));
    if (navs.length === 0) return;

    // Collect unique keys
    const keys = Array.from(new Set(navs.map(n => n.getAttribute('data-menu-key') || 'main')));

    // Fetch all menus
    const map = {};
    for (const k of keys){
      try { map[k] = await fetchMenu(api, brandId, k, token); } catch (e) { console.warn('[BrandHydrator] fetchMenu failed for', k, e); map[k] = []; }
    }

    // Render using existing renderer if available
    try {
      if (window.MenuPreview && typeof window.MenuPreview.render === 'function'){
        window.MenuPreview.render(map);
        return;
      }
    } catch {}

    // Fallback: simple renderer (subset of js/menuRender.js)
    const buildMenuHtml = (items) => {
      const ul = document.createElement('ul');
      ul.style.cssText='list-style:none;display:flex;gap:12px;margin:0;padding:0;flex-wrap:wrap;';
      (items||[]).forEach(it => {
        const li = document.createElement('li'); li.style.position='relative';
        const a = document.createElement('a'); a.textContent = it.label || 'Link'; a.href = it.href || '#';
        a.style.cssText='text-decoration:none;color:#0f172a;padding:6px 8px;border-radius:6px;display:inline-block;';
        li.appendChild(a);
        if (Array.isArray(it.children) && it.children.length){
          const sub = document.createElement('ul');
          sub.style.cssText='list-style:none;position:absolute;left:0;top:100%;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:8px;margin:6px 0 0;min-width:180px;display:none;z-index:60;';
          it.children.forEach(ch => { const cli=document.createElement('li'); const ca=document.createElement('a'); ca.textContent=ch.label||'Link'; ca.href=ch.href||'#'; ca.style.cssText='text-decoration:none;color:#0f172a;padding:6px 8px;display:block;border-radius:6px;'; cli.appendChild(ca); sub.appendChild(cli); });
          li.appendChild(sub);
          li.onmouseenter=()=>sub.style.display='block';
          li.onmouseleave=()=>sub.style.display='none';
        }
        ul.appendChild(li);
      });
      return ul;
    };

    document.querySelectorAll('nav[data-menu-key]').forEach(nav => {
      const key = nav.getAttribute('data-menu-key') || 'main';
      const items = map[key] || [];
      nav.innerHTML = ''; nav.appendChild(buildMenuHtml(items));
    });
  }

  window.BrandHydrator = { hydrate };
  try { document.addEventListener('DOMContentLoaded', hydrate); } catch {}
})();
