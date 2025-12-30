// Simple client for AI generation via serverless endpoint
(function(){
  const DEFAULT_ENDPOINT = '/api/ai-writer';

  async function post(url, payload) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!r.ok) {
      let detail = '';
      try { detail = await r.text(); } catch (e) {}
      throw new Error(`AI endpoint error ${r.status}: ${detail}`);
    }
    return r.json();
  }

  function getAiEndpoint() {
    try {
      const url = new URL(window.location.href);
      const qp = url.searchParams.get('ai_endpoint');
      if (qp) return qp;
    } catch (e) {}
    return DEFAULT_ENDPOINT;
  }

  function allowMockFallback() {
    try {
      const url = new URL(window.location.href);
      const q = url.searchParams.get('ai_mock');
      if (q === '1' || q === 'true') return true;
      const host = (url.hostname || '').toLowerCase();
      if (host === 'localhost' || host === '127.0.0.1') return true;
    } catch (e) {}
    return false;
  }

  function guessCountry() {
    // Try hero-page title, or content-flex title starting with 'Over '.
    try {
      const heroTitle = document.querySelector('.wb-hero-page .hero-title');
      if (heroTitle && heroTitle.textContent.trim()) return heroTitle.textContent.trim();
    } catch (e) {}
    try {
      const cfTitle = Array.from(document.querySelectorAll('.wb-content-flex .cf-title')).map(el=>el.textContent.trim()).find(t=>/^Over\s+/.test(t));
      if (cfTitle) return cfTitle.replace(/^Over\s+/,'').trim();
    } catch (e) {}
    // Fallback: current page name if available
    try {
      const cur = (window.Builder?.pages||[]).find(p=>p.id===window.Builder?.currentPageId) || null;
      if (cur && cur.name) return String(cur.name);
    } catch (e) {}
    return '';
  }

  // Country-specific mock data
  const countryData = {
    'japan': {
      highlights: ['Oude tempels en heiligdommen', 'Mount Fuji en natuurlijke schoonheid', 'Traditionele geisha cultuur', 'Moderne technologie en anime', 'Kersenbloesem seizoen', 'Authentieke sushi en ramen'],
      activities: ['Bezoek de Fushimi Inari tempel in Kyoto', 'Ervaar een traditionele theeceremonie', 'Wandel door bamboewoude van Arashiyama', 'Proef street food in Osaka', 'Bezoek het Ghibli Museum in Tokyo', 'Ontspan in een onsen (warmwaterbron)']
    },
    'spanje': {
      highlights: ['Sagrada Familia en Gaudí architectuur', 'Flamenco dans en muziek', 'Tapas en paella cultuur', 'Prachtige stranden aan de Costa', 'Historische Alhambra in Granada', 'Levendige festivals zoals La Tomatina'],
      activities: ['Proef tapas in Barcelona', 'Bezoek het Prado Museum in Madrid', 'Wandel door Park Güell', 'Ervaar een flamenco show', 'Ontdek de gotische wijk van Barcelona', 'Geniet van sangria op een terrasje']
    },
    'frankrijk': {
      highlights: ['Eiffeltoren en Parijse charme', 'Lavendelvelden in de Provence', 'Wijnstreken van Bordeaux', 'Côte d\'Azur en Franse Rivièra', 'Historische kastelen in Loire', 'Franse gastronomie en patisserie'],
      activities: ['Bezoek het Louvre museum', 'Proef wijn in Bordeaux', 'Wandel langs de Seine', 'Ontdek de lavendelvelden', 'Geniet van croissants in een café', 'Bezoek het Paleis van Versailles']
    },
    'italië': {
      highlights: ['Colosseum en Romeinse geschiedenis', 'Venetiaanse gondels en kanalen', 'Toscaanse heuvels en wijngaarden', 'Italiaanse pizza en pasta', 'Renaissance kunst in Florence', 'Amalfikust en Cinque Terre'],
      activities: ['Proef authentieke pizza in Napels', 'Bezoek het Vaticaan en Sixtijnse Kapel', 'Wandel door Venetië', 'Ontdek de Toscaanse wijngaarden', 'Bezoek de Toren van Pisa', 'Geniet van gelato in Rome']
    }
  };

  // Mock data for testing when API is not available
  const mockData = {
    content_block: (params) => {
      const topic = params.section_title || params.page_title || 'dit onderwerp';
      const subtitle = params.subtitle || '';
      
      // Generate more specific content based on subtitle
      let intro = '';
      let body = '';
      
      if (subtitle.toLowerCase().includes('doen') || subtitle.toLowerCase().includes('niet doen')) {
        intro = `${topic} is absoluut de moeite waard! Dit is een unieke bestemming die je niet mag missen.`;
        body = `Met zijn rijke cultuur, prachtige natuur en vriendelijke mensen biedt ${topic} een onvergetelijke ervaring. Of je nu op zoek bent naar avontuur, ontspanning of culturele verrijking, hier vind je het allemaal.\n\nDe beste tijd om te bezoeken is tijdens het droge seizoen, wanneer het weer perfect is voor outdoor activiteiten. Vergeet niet om lokale specialiteiten te proeven en de verborgen pareltjes te ontdekken die toeristen vaak missen.`;
      } else {
        intro = `${topic} is een fascinerend onderwerp met veel interessante aspecten.`;
        body = `Van de geschiedenis tot moderne ontwikkelingen, ${topic} biedt een unieke kijk op dit gebied. Of je nu geïnteresseerd bent in de achtergrond, praktische toepassingen, of toekomstige ontwikkelingen, ${topic} heeft voor elk wat wils.\n\nDe diversiteit en diepgang maken het tot een boeiend onderwerp om te verkennen. Met de juiste aanpak en kennis kun je hier veel uit halen.`;
      }
      
      return {
        text: `${intro}\n\n${body}`
      };
    },
    feature_media: (params) => {
      const topic = params.section_title || params.page_title || 'dit onderwerp';
      return {
        text: `Ontdek alles over ${topic}. Met jarenlange ervaring en expertise bieden wij de beste oplossingen en diensten. Ons team staat klaar om je te helpen met professioneel advies en persoonlijke aandacht.\n\nWe combineren kwaliteit met innovatie om de beste resultaten te leveren. Vertrouw op onze expertise en ervaring.`
      };
    },
    feature_highlight: (params) => {
      const topic = params.section_title || params.page_title || 'onze diensten';
      return {
        items: [
          { title: 'Professioneel', text: `Hoogwaardige ${topic} met aandacht voor detail` },
          { title: 'Betrouwbaar', text: 'Jarenlange ervaring en tevreden klanten' },
          { title: 'Innovatief', text: 'Moderne oplossingen en technieken' },
          { title: 'Persoonlijk', text: 'Maatwerk en persoonlijke aandacht' }
        ]
      };
    },
    news_article: (params) => {
      const topic = params.section_title || params.page_title || 'dit nieuws';
      return {
        text: `${topic} - In een recente ontwikkeling zijn er interessante veranderingen aangekondigd. Deze nieuwe ontwikkelingen bieden kansen en mogelijkheden voor de toekomst.\n\nExperts zijn positief over de vooruitzichten en verwachten dat dit een positieve impact zal hebben. Meer informatie volgt binnenkort.`
      };
    },
    feature_list: (params) => {
      const country = (params.page_title || 'dit land').toLowerCase();
      const title = params.section_title || '';
      
      // Try to find country-specific data
      const data = countryData[country] || countryData[Object.keys(countryData).find(k => country.includes(k))];
      
      // Check if it's highlights or activities based on title
      if (title.includes('Hoogtepunt')) {
        if (data && data.highlights) {
          return { items: data.highlights };
        }
        return {
          items: [
            `Historische bezienswaardigheden in ${params.page_title}`,
            `Prachtige natuurlijke landschappen`,
            `Unieke culinaire tradities`,
            `Levendige steden en cultuur`,
            `Vriendelijke lokale bevolking`,
            `Diverse activiteiten het hele jaar`
          ]
        };
      } else if (title.includes('Activiteit')) {
        if (data && data.activities) {
          return { items: data.activities };
        }
        return {
          items: [
            `Bezoek iconische monumenten en musea`,
            `Proef authentieke lokale gerechten`,
            `Wandel door natuurparken`,
            `Ervaar traditionele festivals`,
            `Verken lokale markten`,
            `Geniet van outdoor avonturen`
          ]
        };
      }
      
      return { items: [] };
    }
  };

  async function generate(section, params={}) {
    const endpoint = getAiEndpoint();
    const payload = Object.assign({ section }, params);
    
    console.log('[BuilderAI] Sending request to:', endpoint);
    console.log('[BuilderAI] Payload:', payload);
    
    try {
      const result = await post(endpoint, payload);
      console.log('[BuilderAI] API response:', result);
      
      // Check if response is generic/empty/unhelpful
      if (allowMockFallback() && result && result.text && (
        result.text.includes('Natuurlijk') || 
        result.text.includes('Zeker!') ||
        result.text.includes('Waarover wil je') ||
        result.text.includes('welk onderwerp') ||
        result.text.includes('Geef me een onderwerp') ||
        result.text.includes('waar zou je graag') ||
        result.text.length < 100
      )) {
        console.warn('[BuilderAI] Generic/empty response detected, using mock data instead');
        console.log('[BuilderAI] Using mock data for section:', section);
        if (mockData[section]) {
          const mockResult = mockData[section](params);
          console.log('[BuilderAI] Mock data result:', mockResult);
          return mockResult;
        }
      }
      
      return result;
    } catch (err) {
      console.warn('[BuilderAI] API failed:', err.message);
      if (allowMockFallback() && mockData[section]) {
        console.warn('[BuilderAI] Mock fallback enabled; using mock data');
        return mockData[section](params);
      }
      throw err;
    }
  }

  window.BuilderAI = {
    generate,
    guessCountry
  };

  try {
    let activeEl = null;
    let lastActiveEl = null;
    let btn = null;
    let modal = null;
    let keyHandler = null;

    function isCanvasEditable(el){
      try {
        if (!el || el.nodeType !== 1) return false;
        if (!el.isContentEditable) return false;
        const canvas = document.getElementById('canvas');
        if (!canvas) return false;
        return canvas.contains(el);
      } catch (e) {
        return false;
      }
    }

    function guessPlaceFromElement(el){
      try {
        const day = el.closest ? el.closest('.day') : null;
        if (day) {
          const h3 = day.querySelector('h3');
          if (h3 && h3.textContent.trim()) return h3.textContent.trim();
          const info = day.querySelector('.placeInfo h3');
          if (info && info.textContent.trim()) return info.textContent.trim();
        }
      } catch (e) {}

      try {
        const comp = el.closest ? el.closest('.wb-component, section, .roadbook-section') : null;
        if (comp) {
          const heading = comp.querySelector('h1, h2, h3, h4');
          if (heading && heading.textContent.trim()) return heading.textContent.trim();
        }
      } catch (e) {}

      try { return guessCountry(); } catch (e) {}
      return '';
    }

    function getRouteFromToForElement(el){
      try {
        const dayEl = (el && el.closest) ? el.closest('.day') : null;
        if (!dayEl) return { from: '', to: '' };
        const from = _cleanText(dayEl.querySelector('h3')?.textContent || '');
        const nextDay = dayEl.nextElementSibling;
        const to = nextDay && nextDay.matches && nextDay.matches('.day')
          ? _cleanText(nextDay.querySelector('h3')?.textContent || '')
          : '';
        return { from, to };
      } catch (e) {
        return { from: '', to: '' };
      }
    }

    function _cleanText(s){
      try {
        return String(s || '')
          .replace(/\s+/g, ' ')
          .replace(/[\u0000-\u001f\u007f]/g, '')
          .trim();
      } catch (e) {
        return '';
      }
    }

    function getTravelContextForElement(el){
      try {
        const rb = (el && el.closest) ? el.closest('.wb-roadbook') : null;
        const root = rb || document.querySelector('.wb-roadbook');
        const data = root && root._roadbookData ? root._roadbookData : null;
        if (!data) return { trip_title: '', travel_context: '' };

        const tripTitle = _cleanText(data.title || '');
        const dep = _cleanText(data.departureDate || '');
        const duration = _cleanText(data.duration || (data.itinerary && data.itinerary.length) || '');

        const lines = [];
        if (tripTitle) lines.push(`Titel: ${tripTitle}`);
        if (dep) lines.push(`Vertrekdatum: ${dep}`);
        if (duration) lines.push(`Duur: ${duration}`);

        const itinerary = Array.isArray(data.itinerary) ? data.itinerary : [];
        if (itinerary.length) {
          lines.push('Itinerary:');
          itinerary.slice(0, 14).forEach((d, idx) => {
            const t = _cleanText(d.title || d.destination || '') || `Dag ${idx + 1}`;
            const desc = _cleanText(d.description || '').slice(0, 140);
            lines.push(`- Dag ${idx + 1}: ${t}${desc ? ` — ${desc}` : ''}`);
          });
        }

        const hotels = Array.isArray(data.hotels) ? data.hotels : [];
        if (hotels.length) {
          lines.push('Hotels:');
          hotels.slice(0, 8).forEach((h) => {
            const name = _cleanText(h.name || '');
            const loc = _cleanText(h.location || '');
            const ci = _cleanText(h.checkIn || '');
            const co = _cleanText(h.checkOut || '');
            lines.push(`- ${name}${loc ? ` (${loc})` : ''}${(ci || co) ? ` ${ci}${co ? `–${co}` : ''}` : ''}`.trim());
          });
        }

        const transports = Array.isArray(data.transports) ? data.transports : [];
        if (transports.length) {
          lines.push('Transport:');
          transports.slice(0, 8).forEach((t) => {
            const type = _cleanText(t.type || '');
            const from = _cleanText(t.from || t.fromCity || '');
            const to = _cleanText(t.to || t.toCity || '');
            const date = _cleanText(t.date || t.departureDate || '');
            lines.push(`- ${type ? `${type}: ` : ''}${from}${to ? ` → ${to}` : ''}${date ? ` (${date})` : ''}`.trim());
          });
        }

        const cars = Array.isArray(data.cars) ? data.cars : [];
        if (cars.length) {
          lines.push('Huurauto:');
          cars.slice(0, 4).forEach((c) => {
            const veh = _cleanText(c.vehicle || '');
            const pu = _cleanText(c.pickupLocation || '');
            const pd = _cleanText(c.pickupDate || '');
            const dd = _cleanText(c.dropoffDate || '');
            lines.push(`- ${veh}${pu ? `, ophalen: ${pu}` : ''}${pd ? ` (${pd}${dd ? `–${dd}` : ''})` : ''}`.trim());
          });
        }

        const acts = Array.isArray(data.activities) ? data.activities : [];
        if (acts.length) {
          lines.push('Activiteiten/Excursies:');
          acts.slice(0, 10).forEach((a) => {
            const name = _cleanText(a.name || '');
            const loc = _cleanText(a.location || '');
            const date = _cleanText(a.date || a.startDate || '');
            lines.push(`- ${name}${loc ? ` (${loc})` : ''}${date ? ` (${date})` : ''}`.trim());
          });
        }

        // Keep payload small to avoid token bloat
        let ctx = lines.join('\n');
        if (ctx.length > 2200) ctx = ctx.slice(0, 2200) + '…';
        return { trip_title: tripTitle, travel_context: ctx };
      } catch (e) {
        return { trip_title: '', travel_context: '' };
      }
    }

    function setEditableContentPreserveLines(el, text){
      try {
        if (!el) return;
        const t = String(text || '');
        while (el.firstChild) el.removeChild(el.firstChild);
        const parts = t.split(/\n/);
        const frag = document.createDocumentFragment();
        parts.forEach((p, idx) => {
          frag.appendChild(document.createTextNode(p));
          if (idx < parts.length - 1) frag.appendChild(document.createElement('br'));
        });
        el.appendChild(frag);
      } catch (e) {
        try { el.textContent = String(text || ''); } catch (e2) {}
      }
    }

    function applyReadMoreToggle(el, text){
      try {
        if (!el) return;
        const raw = String(text || '');
        const tooLong = raw.length > 520 || (raw.split(/\n/).length > 10);

        // Cleanup existing
        const key = el.dataset.wbReadmoreKey || (el.dataset.wbReadmoreKey = `rm_${Date.now()}_${Math.random().toString(16).slice(2)}`);
        const existingBtn = document.querySelector(`button[data-wb-readmore="${key}"]`);
        if (existingBtn) existingBtn.remove();

        // Reset styles
        el.style.maxHeight = '';
        el.style.overflow = '';
        el.style.position = '';

        if (!tooLong) return;

        // Persist state on the element (so repeated AI runs won't create stale closures)
        if (el.dataset.wbReadmoreExpanded !== '1') el.dataset.wbReadmoreExpanded = '0';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('data-wb-readmore', key);
        btn.style.cssText = 'margin-top:8px;background:#ffffff;border:1px solid #e5e7eb;color:#374151;border-radius:10px;padding:7px 10px;font:700 12px system-ui,Segoe UI,Roboto,Arial;cursor:pointer;';

        const update = () => {
          try {
            const expanded = el.dataset.wbReadmoreExpanded === '1';
            if (expanded) {
              el.style.maxHeight = '';
              el.style.overflow = '';
              btn.textContent = 'Lees minder';
            } else {
              el.style.maxHeight = '9.5em';
              el.style.overflow = 'hidden';
              el.style.position = 'relative';
              btn.textContent = 'Lees verder';
            }
          } catch (e) {}
        };

        btn.addEventListener('click', (ev) => {
          try {
            ev.preventDefault();
            ev.stopPropagation();
            const expanded = el.dataset.wbReadmoreExpanded === '1';
            el.dataset.wbReadmoreExpanded = expanded ? '0' : '1';
            // If user manually toggles, stop treating it as auto-expanded
            el.dataset.wbReadmoreAutoExpanded = '0';
            update();
          } catch (e) {}
        });

        // Put button right after the element
        if (el.parentNode) {
          if (el.nextSibling) el.parentNode.insertBefore(btn, el.nextSibling);
          else el.parentNode.appendChild(btn);
        }

        // Auto-expand while editing (bind only once)
        if (el.dataset.wbReadmoreBound !== '1') {
          el.dataset.wbReadmoreBound = '1';
          el.addEventListener('focusin', () => {
            try {
              // Expand temporarily for editing
              el.dataset.wbReadmoreAutoExpanded = '1';
              el.dataset.wbReadmoreExpanded = '1';
              // Update current button if it exists
              const k = el.dataset.wbReadmoreKey;
              const b = k ? document.querySelector(`button[data-wb-readmore="${k}"]`) : null;
              if (b) {
                el.style.maxHeight = '';
                el.style.overflow = '';
                b.textContent = 'Lees minder';
              }
            } catch (e) {}
          }, true);
          el.addEventListener('focusout', () => {
            try {
              setTimeout(() => {
                try {
                  // If it was only auto-expanded (not manually toggled), collapse back
                  if (el.dataset.wbReadmoreAutoExpanded === '1') {
                    el.dataset.wbReadmoreExpanded = '0';
                    el.dataset.wbReadmoreAutoExpanded = '0';
                    const k = el.dataset.wbReadmoreKey;
                    const b = k ? document.querySelector(`button[data-wb-readmore="${k}"]`) : null;
                    if (b) {
                      el.style.maxHeight = '9.5em';
                      el.style.overflow = 'hidden';
                      el.style.position = 'relative';
                      b.textContent = 'Lees verder';
                    }
                  }
                } catch (e2) {}
              }, 0);
            } catch (e) {}
          }, true);
        }

        update();
      } catch (e) {}
    }

    function ensureButton(){
      if (btn) return btn;
      btn = document.createElement('button');
      btn.id = 'wb-ai-text-btn';
      btn.type = 'button';
      btn.textContent = '✨ AI tekst';
      btn.style.cssText = 'position:fixed;left:16px;top:16px;z-index:2147483646;background:#8b5cf6;color:#fff;border:1px solid #7c3aed;border-radius:999px;padding:10px 14px;font:800 14px system-ui,Segoe UI,Roboto,Arial;cursor:pointer;box-shadow:0 12px 26px rgba(0,0,0,.18);display:none;';
      // Open on pointerdown to avoid blur clearing active element before click fires
      btn.addEventListener('pointerdown', (ev) => {
        try {
          ev.preventDefault();
          ev.stopPropagation();
          const targetEl = activeEl || lastActiveEl;
          if (targetEl) openModal(targetEl);
        } catch (e) {}
      }, true);
      document.body.appendChild(btn);
      return btn;
    }

    function positionButtonNear(el){
      try {
        const b = ensureButton();
        if (!el || !el.getBoundingClientRect) {
          b.style.left = '';
          b.style.top = '';
          b.style.right = '16px';
          b.style.bottom = '16px';
          return;
        }
        const r = el.getBoundingClientRect();
        // Fallback if element is offscreen
        const off = (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth);
        if (off) {
          b.style.left = '';
          b.style.top = '';
          b.style.right = '16px';
          b.style.bottom = '16px';
          return;
        }

        b.style.right = '';
        b.style.bottom = '';

        // Temporarily show to measure width
        const prevVis = b.style.visibility;
        b.style.visibility = 'hidden';
        b.style.display = 'block';
        const bw = b.getBoundingClientRect().width || 160;
        const bh = b.getBoundingClientRect().height || 40;
        b.style.visibility = prevVis || '';

        const margin = 10;
        let top = Math.max(margin, r.top - bh - 8);
        let left = Math.min(window.innerWidth - bw - margin, Math.max(margin, r.left));
        // If not enough space above, pin below
        if (top <= margin + 2) top = Math.min(window.innerHeight - bh - margin, r.bottom + 8);

        b.style.left = Math.round(left) + 'px';
        b.style.top = Math.round(top) + 'px';
      } catch (e) {}
    }

    function closeModal(){
      try { if (keyHandler) document.removeEventListener('keydown', keyHandler, true); } catch (e) {}
      keyHandler = null;
      try { if (modal) modal.remove(); } catch (e) {}
      modal = null;
    }

    async function generateInto(el, opts){
      const currentText = (el && (el.textContent || '')).trim();
      const place = (opts.place || '').trim();
      const instruction = (opts.instruction || '').trim();
      const tone = (opts.tone || 'inspiring').trim();
      const language = (opts.language || 'nl').trim();
      const kind = (opts.kind || 'text').trim();

      const routeFrom = (opts.routeFrom || '').trim();
      const routeTo = (opts.routeTo || '').trim();
      const routeStops = parseInt(String(opts.routeStops || ''), 10) || 3;

      const ctx = getTravelContextForElement(el);

      const payload = {
        page_title: place,
        section_title: instruction || place || 'Tekst',
        tone,
        language,
        count: 1,
        useResearch: false,
        currentText,
        trip_title: ctx.trip_title || '',
        travel_context: ctx.travel_context || '',
        route_mode: kind === 'route',
        route_from: routeFrom,
        route_to: routeTo,
        route_stops: routeStops,
      };

      const res = await generate('content_block', payload);
      let text = '';
      if (res && Array.isArray(res.paragraphs) && res.paragraphs.length) text = String(res.paragraphs[0] || '');
      else if (res && typeof res.text === 'string') text = res.text;
      else if (res && typeof res.content === 'string') text = res.content;
      text = String(text || '').trim();
      if (!text) return;

      setEditableContentPreserveLines(el, text);
      applyReadMoreToggle(el, text);
      try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
      try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
    }

    function openModal(el){
      closeModal();
      const placeGuess = guessPlaceFromElement(el);
      const routeGuess = getRouteFromToForElement(el);
      const cur = (el && (el.textContent || '')).trim();

      modal = document.createElement('div');
      modal.id = 'wb-ai-text-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;';
      modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

      const panel = document.createElement('div');
      panel.style.cssText = 'width:min(720px, 100%);background:#fff;border-radius:14px;box-shadow:0 25px 60px rgba(0,0,0,.25);overflow:hidden;font-family:system-ui,Segoe UI,Roboto,Arial;';

      panel.innerHTML = `
        <div style="padding:14px 16px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:10px;">
          <div style="font-weight:800;color:#111827;">✨ AI tekst</div>
          <div style="margin-left:auto;display:flex;gap:8px;align-items:center;">
            <button type="button" data-close style="background:transparent;border:1px solid #e5e7eb;border-radius:10px;padding:8px 10px;cursor:pointer;color:#374151;font-weight:700;">Sluiten</button>
          </div>
        </div>
        <div style="padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <label style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#374151;">
            Type
            <select data-kind style="height:38px;border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;font-size:13px;">
              <option value="text" selected>Bestemmingstekst</option>
              <option value="route">Routedag (Google route)</option>
            </select>
          </label>
          <label data-stops-wrap style="display:none;flex-direction:column;gap:6px;font-size:12px;color:#374151;">
            Aantal stops onderweg
            <select data-stops style="height:38px;border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;font-size:13px;">
              <option value="3" selected>3 stops</option>
              <option value="4">4 stops</option>
              <option value="5">5 stops</option>
              <option value="6">6 stops</option>
            </select>
          </label>
          <div data-route-wrap style="display:none;grid-column:1 / -1;gap:12px;grid-template-columns:1fr 1fr;">
            <label style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#374151;">
              Van
              <input data-route-from type="text" value="${String(_cleanText(routeGuess.from) || '').replace(/\"/g, '&quot;')}" style="height:38px;border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;font-size:13px;" />
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#374151;">
              Naar
              <input data-route-to type="text" value="${String(_cleanText(routeGuess.to) || '').replace(/\"/g, '&quot;')}" style="height:38px;border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;font-size:13px;" />
            </label>
          </div>
          <label style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#374151;">
            Plaatsnaam (context)
            <input data-place type="text" value="${String(placeGuess || '').replace(/\"/g, '&quot;')}" style="height:38px;border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;font-size:13px;" />
          </label>
          <label style="display:flex;flex-direction:column;gap:6px;font-size:12px;color:#374151;">
            Tone
            <select data-tone style="height:38px;border:1px solid #d1d5db;border-radius:10px;padding:8px 10px;font-size:13px;">
              <option value="inspiring" selected>Inspirerend</option>
              <option value="informative">Informatief</option>
              <option value="luxury">Luxe</option>
              <option value="friendly">Vriendelijk</option>
            </select>
          </label>
          <label style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;font-size:12px;color:#374151;">
            Waarover moet de tekst gaan? (prompt)
            <textarea data-instruction rows="3" placeholder="Bijv. Schrijf een korte intro over de highlights in ${String(placeGuess||'deze plek').replace(/\"/g, '&quot;')}…" style="border:1px solid #d1d5db;border-radius:10px;padding:10px;font-size:13px;resize:vertical;"></textarea>
          </label>
          <label style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;font-size:12px;color:#374151;">
            Huidige tekst (context)
            <textarea data-current rows="4" style="border:1px solid #e5e7eb;background:#f9fafb;border-radius:10px;padding:10px;font-size:12px;resize:vertical;" readonly>${String(cur || '').replace(/</g, '&lt;')}</textarea>
          </label>
        </div>
        <div style="padding:14px 16px;border-top:1px solid #e5e7eb;display:flex;gap:10px;align-items:center;">
          <button type="button" data-generate style="background:#8b5cf6;border:1px solid #7c3aed;color:#fff;border-radius:10px;padding:10px 12px;font-weight:800;cursor:pointer;">Genereren & vervangen</button>
          <div data-status style="font-size:12px;color:#6b7280;"></div>
        </div>
      `;

      modal.appendChild(panel);
      document.body.appendChild(modal);

      const closeBtn = panel.querySelector('[data-close]');
      const genBtn = panel.querySelector('[data-generate]');
      const status = panel.querySelector('[data-status]');
      const kind = panel.querySelector('[data-kind]');
      const stopsWrap = panel.querySelector('[data-stops-wrap]');
      const stops = panel.querySelector('[data-stops]');
      const routeWrap = panel.querySelector('[data-route-wrap]');
      const routeFromInput = panel.querySelector('[data-route-from]');
      const routeToInput = panel.querySelector('[data-route-to]');
      const placeInput = panel.querySelector('[data-place]');
      const instr = panel.querySelector('[data-instruction]');
      const tone = panel.querySelector('[data-tone]');

      if (closeBtn) closeBtn.addEventListener('click', closeModal);

      const setDefaultInstruction = () => {
        try {
          if (!instr) return;
          const mode = kind ? kind.value : 'text';
          if (mode === 'route') {
            const n = parseInt((stops && stops.value) || '3', 10) || 3;
            const from = _cleanText((routeFromInput && routeFromInput.value) || routeGuess.from || placeGuess || 'de startlocatie');
            const to = _cleanText((routeToInput && routeToInput.value) || routeGuess.to || 'de volgende bestemming');
            instr.value = `Maak een routebeschrijving (rijdag) van ${from} naar ${to}.\n\nVereisten:\n- Gebruik de echte route (snelste route) als basis en geef afstand + reistijd\n- Licht ${n} leuke stops onderweg uit (naam + korte toelichting)\n- Voeg praktische tips toe (tankstop, pauzes, veiligheid, laatste boodschappen)\n\nStructuur (zoals in een roadbook):\nRoute-overzicht\n- Totale afstand: ...\n- Reistijd zonder stops: ...\n- Reistijd met stops: ...\n\nRoutebeschrijving\n- Stap-voor-stap (max 8 stappen, kort)\n\nStops onderweg\n1) ...\n2) ...\n3) ...\n\nTips onderweg\n- ...\n- ...\n- ...`;
          } else {
            const base = (placeGuess || '').trim();
            instr.value = base ? `Schrijf een aantrekkelijke tekst over ${base} voor een reisprogramma. Benoem highlights, sfeer en praktische tips.` : 'Schrijf een aantrekkelijke tekst voor een reisprogramma. Benoem highlights, sfeer en praktische tips.';
          }
        } catch (e) {}
      };

      if (instr && !instr.value) setDefaultInstruction();

      const syncUiForKind = () => {
        try {
          const mode = kind ? kind.value : 'text';
          if (stopsWrap) stopsWrap.style.display = (mode === 'route') ? 'flex' : 'none';
          if (routeWrap) routeWrap.style.display = (mode === 'route') ? 'grid' : 'none';
          // Only overwrite if user hasn't typed something custom
          if (instr && (!instr.value || instr.value.trim().length < 5)) setDefaultInstruction();
        } catch (e) {}
      };

      try { syncUiForKind(); } catch (e) {}

      try {
        if (kind) kind.addEventListener('change', syncUiForKind);
        if (stops) stops.addEventListener('change', () => {
          try {
            const mode = kind ? kind.value : 'text';
            if (mode === 'route') setDefaultInstruction();
          } catch (e) {}
        });
      } catch (e) {}

      if (genBtn) {
        genBtn.addEventListener('click', async () => {
          try {
            genBtn.disabled = true;
            const old = genBtn.textContent;
            genBtn.textContent = 'Genereren...';
            if (status) status.textContent = '';

            // If user selected route mode but left prompt empty, ensure a good default prompt
            try {
              const mode = kind ? kind.value : 'text';
              if (mode === 'route' && instr && (!instr.value || instr.value.trim().length < 5)) {
                setDefaultInstruction();
              }
            } catch (e) {}

            await generateInto(el, {
              place: placeInput ? placeInput.value : '',
              instruction: instr ? instr.value : '',
              tone: tone ? tone.value : 'inspiring',
              language: 'nl',
              kind: kind ? kind.value : 'text',
              routeFrom: routeFromInput ? routeFromInput.value : '',
              routeTo: routeToInput ? routeToInput.value : '',
              routeStops: stops ? stops.value : '3'
            });
            closeModal();
            try { el.focus(); } catch (e) {}
            try { el.blur(); } catch (e) {}
            genBtn.textContent = old;
          } catch (e) {
            try { if (status) status.textContent = 'Genereren mislukt. Probeer opnieuw.'; } catch (e2) {}
          } finally {
            try { genBtn.disabled = false; } catch (e) {}
            try { genBtn.textContent = 'Genereren & vervangen'; } catch (e) {}
          }
        });
      }

      keyHandler = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          closeModal();
        }
      };
      document.addEventListener('keydown', keyHandler, true);
    }

    function showButtonFor(el){
      activeEl = el;
      lastActiveEl = el;
      const b = ensureButton();
      b.style.display = 'block';
      positionButtonNear(el);
    }

    function hideButton(){
      try { if (btn) btn.style.display = 'none'; } catch (e) {}
      activeEl = null;
    }

    // Keep button positioned on scroll/resize while an element is active
    window.addEventListener('scroll', () => {
      try { if (activeEl && btn && btn.style.display !== 'none') positionButtonNear(activeEl); } catch (e) {}
    }, true);
    window.addEventListener('resize', () => {
      try { if (activeEl && btn && btn.style.display !== 'none') positionButtonNear(activeEl); } catch (e) {}
    });

    document.addEventListener('focusin', (e) => {
      try {
        const el = e && e.target;
        if (!isCanvasEditable(el)) return;
        showButtonFor(el);
      } catch (e2) {}
    }, true);

    document.addEventListener('focusout', (e) => {
      try {
        const el = e && e.target;
        if (!isCanvasEditable(el)) return;
        setTimeout(() => {
          try {
            const ae = document.activeElement;
            // If focus moved to our AI button or modal, keep last active element
            if (btn && (ae === btn)) {
              positionButtonNear(lastActiveEl);
              return;
            }
            if (modal && modal.contains(ae)) {
              positionButtonNear(lastActiveEl);
              return;
            }
            if (isCanvasEditable(ae)) {
              showButtonFor(ae);
              return;
            }
            hideButton();
          } catch (e3) {}
        }, 0);
      } catch (e2) {}
    }, true);
  } catch (e) {}
})();
