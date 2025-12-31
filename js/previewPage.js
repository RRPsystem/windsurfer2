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

  try {
    const parseSlidesAttr = (raw) => {
      let s = String(raw || '').trim();
      if (!s) return [];
      try {
        s = s
          .replace(/&quot;/g, '"')
          .replace(/&#34;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&');
      } catch (e0) {}
      try {
        let decoded = decodeURIComponent(s);
        try {
          if (/%5B|%7B|%22/i.test(decoded)) decoded = decodeURIComponent(decoded);
        } catch (e11) {}
        const parsed = JSON.parse(decoded);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e1) {}
      try {
        const parsed = JSON.parse(s);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e2) {}
      try {
        const parts = s.split(/\s*[\|,]\s*/g).map(p => p.trim()).filter(Boolean);
        return parts;
      } catch (e3) {}
      return [];
    };

    const initRoadbookDestinationMedia = (root) => {
      const wraps = Array.from((root || document).querySelectorAll('.placeImg'));
      wraps.forEach((wrap) => {
        try {
          const imgEl = wrap.querySelector('img');
          const videoSrc = wrap.getAttribute('data-wb-video-src') || '';
          if (videoSrc) {
            let videoEl = wrap.querySelector('video');
            if (!videoEl) {
              videoEl = document.createElement('video');
              videoEl.muted = true;
              videoEl.loop = true;
              videoEl.playsInline = true;
              videoEl.autoplay = true;
              videoEl.controls = true;
              videoEl.style.width = '100%';
              videoEl.style.height = '100%';
              videoEl.style.objectFit = 'cover';
              videoEl.style.position = 'absolute';
              videoEl.style.inset = '0';
              try { wrap.insertBefore(videoEl, wrap.firstChild); } catch (e8) { wrap.appendChild(videoEl); }
            }
            try { videoEl.src = videoSrc; } catch (e9) {}
            try { videoEl.load(); } catch (e10) {}

            try {
              if (imgEl) {
                const pic = imgEl.closest ? imgEl.closest('picture') : null;
                if (pic) pic.style.display = 'none';
                else imgEl.style.display = 'none';
              }
            } catch (e11) {}
            try {
              const prevBtn = wrap.querySelector('.wb-slide-prev');
              const nextBtn = wrap.querySelector('.wb-slide-next');
              if (prevBtn) prevBtn.style.display = 'none';
              if (nextBtn) nextBtn.style.display = 'none';
            } catch (e12) {}
            try { videoEl.style.display = ''; } catch (e13) {}
            try { videoEl.play(); } catch (e14) {}
            return;
          }

          const slidesAttrRaw = wrap.getAttribute('data-wb-slides') || '';
          let slides = parseSlidesAttr(slidesAttrRaw);
          slides = Array.isArray(slides) ? slides.filter(Boolean) : [];
          if (slides.length <= 1 || !imgEl) return;

          wrap._wbSlides = slides;

          const setIdx = (nextIdx) => {
            const slidesNow = Array.isArray(wrap._wbSlides) ? wrap._wbSlides : slides;
            const n = slidesNow.length;
            let idx = parseInt(String(nextIdx), 10);
            if (Number.isNaN(idx)) idx = 0;
            idx = ((idx % n) + n) % n;
            wrap.setAttribute('data-wb-slide-idx', String(idx));
            imgEl.src = slidesNow[idx];
          };

          const stop = () => {
            try {
              if (wrap._wbSlideTimer) {
                clearInterval(wrap._wbSlideTimer);
                wrap._wbSlideTimer = null;
              }
            } catch (e5) {}
          };

          const start = () => {
            try {
              if (wrap._wbSlideTimer) return;
              wrap._wbSlideTimer = window.setInterval(() => {
                try {
                  const slidesNow = Array.isArray(wrap._wbSlides) ? wrap._wbSlides : slides;
                  if (!slidesNow || slidesNow.length <= 1) return;
                  const idx = parseInt(wrap.getAttribute('data-wb-slide-idx') || '0', 10) || 0;
                  setIdx(idx + 1);
                } catch (e3) {}
              }, 4500);
            } catch (e4) {}
          };

          try {
            const prevBtn = wrap.querySelector('.wb-slide-prev');
            const nextBtn = wrap.querySelector('.wb-slide-next');
            if (prevBtn) prevBtn.style.display = '';
            if (nextBtn) nextBtn.style.display = '';
          } catch (e20) {}

          try {
            const bindNav = (selector, delta) => {
              const b = wrap.querySelector(selector);
              if (!b || b.dataset.wbBound === '1') return;
              b.dataset.wbBound = '1';
              b.addEventListener('click', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                const idx = parseInt(wrap.getAttribute('data-wb-slide-idx') || '0', 10) || 0;
                setIdx(idx + delta);
                stop();
              }, true);
            };
            bindNav('.wb-slide-prev', -1);
            bindNav('.wb-slide-next', 1);
          } catch (e8) {}

          wrap.addEventListener('mouseenter', stop);
          wrap.addEventListener('mouseleave', start);

          setIdx(parseInt(wrap.getAttribute('data-wb-slide-idx') || '0', 10) || 0);
          start();
        } catch (eWrap) {}
      });
    };

    initRoadbookDestinationMedia(document);
    setTimeout(() => initRoadbookDestinationMedia(document), 600);
  } catch (e) {
    console.warn('roadbook media init failed', e);
  }

  try {
    if (window.ComponentFactory && typeof window.ComponentFactory.initRoadbookRouteMaps === 'function') {
      window.ComponentFactory.initRoadbookRouteMaps(document);
      setTimeout(() => { try { window.ComponentFactory.initRoadbookRouteMaps(document); } catch (e2) {} }, 800);
    }
  } catch (e) {
    console.warn('roadbook route map init failed', e);
  }
})();
