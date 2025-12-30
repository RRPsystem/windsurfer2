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
    // First try: sessionStorage (works even without opener)
    try {
      const stored = sessionStorage.getItem('wb_preview_content');
      if (stored && stored.trim()) {
        console.log('✅ Using content from sessionStorage');
        sessionStorage.removeItem('wb_preview_content'); // Clean up
        return stored;
      }
    } catch (e) {
      console.warn('sessionStorage not available:', e);
    }
    
    // Second try: get from opener window (if opened from builder)
    if (window.opener) {
      try {
        const canvas = window.opener.document.getElementById('canvas');
        if (canvas && canvas.innerHTML && canvas.innerHTML.trim()) {
          console.log('✅ Using content from builder canvas (opener)');
          return canvas.innerHTML;
        } else {
          console.warn('Canvas is empty or not found');
        }
      } catch (e) {
        console.error('Cannot access opener:', e);
      }
    } else {
      console.warn('No window.opener available');
    }
    
    // Second try: API
    if (!api || !brandId) {
      return '<div class="pv-main" style="padding:40px;text-align:center;"><h2>Preview niet beschikbaar</h2><p>Open preview vanuit de builder om je pagina te zien.</p></div>';
    }
    
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
  document.getElementById('pv-header').innerHTML = headerHtml || '';
  document.getElementById('pv-body').innerHTML = pageHtml || '<div style="padding:40px;text-align:center;color:#64748b;"><h2>Geen content</h2><p>Open preview vanuit de builder om je pagina te zien.</p></div>';
  document.getElementById('pv-footer').innerHTML = footerHtml || '';

  // 4) Hydrate menus using BrandHydrator (header/footer contain nav[data-menu-key])
  try { await window.BrandHydrator.hydrate(); } catch (e){ console.warn('hydrate failed', e); }

  // 5) Preview injects HTML after DOMContentLoaded; initialize timeline behaviors manually.
  try {
    const timelines = document.querySelectorAll('.roadbook-animated-timeline-section');
    timelines.forEach((timeline) => {
      // Ensure the road height ends at the bottom of the last day (avoid preview whitespace).
      const itineraryWrap = timeline.querySelector('#itinerary-wrap');
      const tube = itineraryWrap ? itineraryWrap.querySelector('.roadbook-road') : null;
      const line = itineraryWrap ? itineraryWrap.querySelector('.roadbook-road-line') : null;
      const itinerary = itineraryWrap ? itineraryWrap.querySelector('.itinerary') : null;
      if (itineraryWrap && tube && line && itinerary) {
        const updateRoadHeight = () => {
          const days = Array.from(itinerary.querySelectorAll('.day'));
          let height = 500;
          if (days.length > 0) {
            const lastDay = days[days.length - 1];
            height = Math.max(lastDay.offsetTop + lastDay.offsetHeight, 500);
          }
          tube.style.height = height + 'px';
          line.style.height = height + 'px';
        };
        updateRoadHeight();
        setTimeout(updateRoadHeight, 500);
        setTimeout(updateRoadHeight, 1200);
        window.addEventListener('resize', updateRoadHeight);
      }

      // Initialize animation logic (car visibility / active days). This is safe to run multiple times.
      if (window.RoadbookTimelineAnimation) {
        new window.RoadbookTimelineAnimation(timeline);
      }
    });
  } catch (e) {
    console.warn('timeline init failed', e);
  }
})();
