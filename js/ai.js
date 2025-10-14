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

  async function generate(section, params={}) {
    const endpoint = getAiEndpoint();
    const payload = Object.assign({ section }, params);
    return post(endpoint, payload);
  }

  window.BuilderAI = {
    generate,
    guessCountry
  };
})();
