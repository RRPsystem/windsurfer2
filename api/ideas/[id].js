// Vercel Serverless Function: GET /api/ideas/[id]
// Proxies Travel Compositor idea detail using env credentials (Bearer auth).
// Matches TC docs:
//   POST /resources/authentication/authenticate  -> token
//   GET  /resources/travelidea/{micrositeId}/{ideaId}  (with language/currency/adults)
//   Optional info endpoint via ?info=1 -> /resources/travelidea/{micrositeId}/info/{ideaId}

export default async function handler(req, res) {
  // DEBUG: Log invocation
  console.log('[TC API] Function invoked!');
  console.log('[TC API] req.query:', req.query);
  console.log('[TC API] req.url:', req.url);
  
  try {
    const {
      TC_BASE_URL = '', // e.g. https://online.travelcompositor.com
      TC_MICROSITE_ID = '',
      TC_TOKEN = '', // optional static token
      TC_USERNAME = '',
      TC_PASSWORD = '',
      TC_TENANT_ID = ''
    } = process.env;

    const { id } = req.query || {};
    console.log('[TC API] ID from query:', id);
    
    if (!id) {
      console.error('[TC API] Missing ID!');
      return res.status(400).json({ error: 'Missing id', received: { query: req.query, url: req.url } });
    }
    if (!TC_BASE_URL || !TC_MICROSITE_ID) {
      return res.status(500).json({ error: 'Missing TC_BASE_URL or TC_MICROSITE_ID' });
    }

    const micrositeId = String(req.query?.micrositeId || TC_MICROSITE_ID);
    const base = TC_BASE_URL.replace(/\/$/, '');
    const AUTH_PATH = (process.env.TC_AUTH_PATH || '/resources/authentication/authenticate');
    const IDEAS_PATH = (process.env.TC_TRAVELIDEA_PATH || '/resources/travelidea');

    // Query params
    const {
      language = 'NL',
      currency = 'EUR',
      adults = '2',
      info
    } = req.query || {};
    const params = new URLSearchParams();
    params.set('language', String(language));
    params.set('currency', String(currency));
    if (adults) params.set('adults', String(adults));

    // Acquire Bearer token
    const headers = { Accept: 'application/json' };
    if (TC_TENANT_ID) headers['X-Tenant-Id'] = String(TC_TENANT_ID);
    let bearer = TC_TOKEN;
    if (!bearer) {
      if (!TC_USERNAME || !TC_PASSWORD || !micrositeId) {
        return res.status(500).json({ error: 'Missing TC credentials to authenticate' });
      }
      const authBody = { 
        username: TC_USERNAME, 
        password: TC_PASSWORD, 
        micrositeId: parseInt(micrositeId) || micrositeId // Try both string and number
      };
      console.log('[TC API] Attempting auth with:', { 
        url: `${base}${AUTH_PATH}`, 
        username: TC_USERNAME,
        micrositeId: authBody.micrositeId 
      });
      
      const authRes = await fetch(`${base}${AUTH_PATH}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip'
        },
        body: JSON.stringify(authBody)
      });
      const authText = await authRes.text();
      let authJson; try { authJson = JSON.parse(authText); } catch (e) { authJson = null; }
      
      console.log('[TC API] Auth response:', {
        status: authRes.status,
        hasToken: !!authJson?.token,
        responseKeys: authJson ? Object.keys(authJson) : []
      });
      
      if (!authRes.ok || !authJson?.token) {
        console.error('[TC API] Auth failed:', {
          status: authRes.status,
          statusText: authRes.statusText,
          response: authJson || authText,
          url: `${base}${AUTH_PATH}`,
          username: TC_USERNAME,
          micrositeId
        });
        return res.status(authRes.status || 500).json({ 
          error: 'Auth failed', 
          detail: authJson || authText,
          status: authRes.status,
          authUrl: `${base}${AUTH_PATH}`
        });
      }
      bearer = authJson.token;
      console.log('[TC API] Auth successful, token received:', bearer ? `${bearer.substring(0, 20)}...` : 'EMPTY');
    }
    
    console.log('[TC API] Making request with token:', bearer ? `${bearer.substring(0, 20)}...` : 'EMPTY');
    // Travel Compositor uses 'auth-token' header (lowercase with dash), not Authorization Bearer
    headers['auth-token'] = bearer;

    // Build detail or info URL
    const path = info ? `${IDEAS_PATH}/${encodeURIComponent(micrositeId)}/info/${encodeURIComponent(id)}`
                      : `${IDEAS_PATH}/${encodeURIComponent(micrositeId)}/${encodeURIComponent(id)}`;
    const upstreamUrl = `${base}${path}?${params.toString()}`;

    const r = await fetch(upstreamUrl, { headers });
    const status = r.status;
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch (e) { data = null; }
    if (!r.ok) {
      return res.status(status).json({ error: 'Upstream error', status, upstreamUrl, authMode: 'bearer', detail: data || text || null });
    }

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Proxy failure', detail: e?.message || String(e) });
  }
}
