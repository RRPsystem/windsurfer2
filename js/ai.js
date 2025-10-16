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
      const country = params.page_title || params.section_title || 'dit land';
      return {
        text: `${country} is een fascinerend land met een rijke geschiedenis en cultuur. Van bruisende steden tot serene natuurlandschappen, ${country} biedt bezoekers een unieke ervaring die moderne voorzieningen combineert met eeuwenoude tradities.\n\nOf je nu geïnteresseerd bent in historische bezienswaardigheden, culinaire avonturen, of natuurlijke schoonheid, ${country} heeft voor elk wat wils. De gastvrijheid van de lokale bevolking en de diverse attracties maken het tot een onvergetelijke bestemming.`
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
      
      // Check if response is generic/empty
      if (result && result.text && result.text.includes('Natuurlijk!')) {
        console.warn('[BuilderAI] Generic response detected, using mock data instead');
        if (mockData[section]) {
          return mockData[section](params);
        }
      }
      
      return result;
    } catch (err) {
      console.warn('[BuilderAI] API failed, using mock data:', err.message);
      // Fallback to mock data
      if (mockData[section]) {
        return mockData[section](params);
      }
      return {};
    }
  }

  window.BuilderAI = {
    generate,
    guessCountry
  };
})();
