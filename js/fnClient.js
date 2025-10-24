// js/fnClient.js
(function(){
  function boltProjectBase(){
    if (!(window.BOLT_API && window.BOLT_API.baseUrl)) return null;
    return window.BOLT_API.baseUrl.replace(/\/$/, '');
  }
  function functionsBase(){
    // Use project domain with /functions/v1 to leverage Supabase proxy + CORS
    const base = boltProjectBase();
    if (!base) return null;
    // Check if base already ends with /functions/v1 (avoid double)
    if (base.endsWith('/functions/v1')) {
      return base;
    }
    return `${base}/functions/v1`;
  }
  async function callFn(path, options={}){
    const base = functionsBase();
    if (!base) throw new Error('Bolt API base ontbreekt');
    const url = `${base}${path.startsWith('/') ? path : '/'+path}`;
    console.log('[FnClient] Calling:', url); // Debug log
    const headers = Object.assign({
      'Content-Type': 'application/json',
    }, options.headers||{});
    // Auth headers
    const apiKey = (window.BOLT_API && window.BOLT_API.apiKey) || (window.BOLT_DB && window.BOLT_DB.anonKey);
    if (apiKey) headers.apikey = apiKey;
    if (window.CURRENT_TOKEN) headers.Authorization = `Bearer ${window.CURRENT_TOKEN}`;

    const res = await fetch(url, { method: 'GET', ...options, headers });
    const ct = res.headers.get('content-type') || '';
    const body = ct.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    return body;
  }

  window.FnClient = { functionsBase, callFn };
})();
