// js/previewPage.js
// Compose a full page preview: header + page content + footer for the given brand
(async function(){
  function qs(name){ try { return new URL(location.href).searchParams.get(name); } catch (e) { return null; } }
  const api = qs('api') || (window.BOLT_API && window.BOLT_API.baseUrl) || '';
  const brandId = qs('brand_id') || window.CURRENT_BRAND_ID || '';
  const token = qs('token') || window.CURRENT_TOKEN || '';
  const pageSlug = qs('page') || '';

  if (!api || !brandId){
    document.getElementById('pv-body').innerHTML = '<div style="color:#b91c1c;">Ontbrekende api of brand_id voor preview.</div>';
    return;
  }

  async function fetchJson(url, headers={}){
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // 1) Fetch header/footer layout HTML from layouts-api
  async function fetchLayout(type){
    // Expecting functions: /layouts-api/get?brand_id=...&type=header|footer returns { html }
    const u = `${api}/layouts-api/get?brand_id=${encodeURIComponent(brandId)}&type=${encodeURIComponent(type)}`;
    try {
      const data = await fetchJson(u, authHeaders);
      return (data && data.html) ? data.html : '';
    } catch (e){
      console.warn('layout fetch failed', type, e);
      return '';
    }
  }

  // 2) Fetch page HTML by slug (or fallback to local storage/opener)
  async function fetchPageHtml(){
    // First try: get from opener window (if opened from builder)
    if (window.opener && window.opener.document) {
      try {
        const canvas = window.opener.document.getElementById('canvas');
        if (canvas) {
          const html = canvas.innerHTML;
          if (html && html.trim()) {
            console.log('✅ Using content from builder canvas');
            return html;
          }
        }
      } catch (e) {
        console.warn('Cannot access opener:', e);
      }
    }
    
    // Second try: API
    let u = `${api}/pages-api/get?brand_id=${encodeURIComponent(brandId)}`;
    if (pageSlug) u += `&slug=${encodeURIComponent(pageSlug)}`;
    try {
      const data = await fetchJson(u, authHeaders);
      if (data && data.html) return data.html;
      // fallback: try homepage
      const u2 = `${api}/pages-api/get?brand_id=${encodeURIComponent(brandId)}&slug=home`;
      const data2 = await fetchJson(u2, authHeaders);
      return (data2 && data2.html) ? data2.html : '<div class="pv-main">(Geen pagina gevonden)</div>';
    } catch (e){
      console.warn('page fetch failed', e);
      return '<div class="pv-main">(Kon pagina niet laden)</div>';
    }
  }

  // 3) Inject header/footer and page
  const [headerHtml, pageHtml, footerHtml] = await Promise.all([
    fetchLayout('header'), fetchPageHtml(), fetchLayout('footer')
  ]);
  document.getElementById('pv-header').innerHTML = headerHtml || '<div style="padding:12px;color:#64748b;">(Geen header)</div>';
  document.getElementById('pv-body').innerHTML = pageHtml || '<div style="padding:12px;color:#64748b;">(Geen pagina)</div>';
  document.getElementById('pv-footer').innerHTML = footerHtml || '<div style="padding:12px;color:#64748b;">(Geen footer)</div>';

  // 4) Hydrate menus using BrandHydrator (header/footer contain nav[data-menu-key])
  try { await window.BrandHydrator.hydrate(); } catch (e){ console.warn('hydrate failed', e); }
})();
