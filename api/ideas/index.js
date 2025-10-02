// Vercel Serverless Function: GET /api/ideas
// Proxies Travel Compositor ideas list using env credentials.
// Updated to match TC docs: authenticate to get Bearer token, then call /resources/travelidea/{micrositeId}

export default async function handler(req, res) {
  try {
    const {
      TC_BASE_URL = '', // e.g. https://online.travelcompositor.com
      TC_MICROSITE_ID = '',
      TC_TOKEN = '', // optional static token
      TC_USERNAME = '',
      TC_PASSWORD = '',
      TC_TENANT_ID = ''
    } = process.env;

    if (!TC_BASE_URL || !TC_MICROSITE_ID) {
      return res.status(500).json({ error: 'Missing TC_BASE_URL or TC_MICROSITE_ID' });
    }

    const micrositeId = String(req.query?.micrositeId || TC_MICROSITE_ID);
    const base = TC_BASE_URL.replace(/\/$/, '');
    const AUTH_PATH = (process.env.TC_AUTH_PATH || '/resources/authentication/authenticate');
    const IDEAS_PATH = (process.env.TC_TRAVELIDEA_PATH || '/resources/travelidea');
    const ideasUrl = `${base}${IDEAS_PATH}/${encodeURIComponent(micrositeId)}`;

    // Pass-through selected query params with safe defaults
    const {
      first = '0', // TC uses firstResult
      limit = '20',
      language = 'NL',
      currency = 'EUR',
      themes,
      destinations,
      fromCreationDate,
      toCreationDate,
      fields
    } = req.query || {};

    const params = new URLSearchParams();
    params.set('firstResult', String(first));
    params.set('limit', String(limit));
    params.set('language', String(language));
    params.set('currency', String(currency));
    if (themes) params.set('themes', String(themes));
    if (destinations) params.set('destinations', String(destinations));
    if (fromCreationDate) params.set('fromCreationDate', String(fromCreationDate));
    if (toCreationDate) params.set('toCreationDate', String(toCreationDate));

    const headers = { Accept: 'application/json' };
    if (TC_TENANT_ID) headers['X-Tenant-Id'] = String(TC_TENANT_ID);

    // Acquire token: prefer static TC_TOKEN; else authenticate
    let bearer = TC_TOKEN;
    if (!bearer) {
      if (!TC_USERNAME || !TC_PASSWORD || !micrositeId) {
        return res.status(500).json({ error: 'Missing TC credentials to authenticate' });
      }
      const authRes = await fetch(`${base}${AUTH_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username: TC_USERNAME, password: TC_PASSWORD, micrositeId })
      });
      const authText = await authRes.text();
      let authJson; try { authJson = JSON.parse(authText); } catch { authJson = null; }
      if (!authRes.ok || !authJson?.token) {
        return res.status(authRes.status || 500).json({ error: 'Auth failed', detail: authJson || authText });
      }
      bearer = authJson.token;
    }
    headers.Authorization = `Bearer ${bearer}`;

    // Call /resources/travelidea/{micrositeId}
    let upstreamUrl = `${ideasUrl}?${params.toString()}`;
    let r = await fetch(upstreamUrl, { headers });
    let status = r.status;
    let text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = null; }

    // No fallback needed per docs, but keep diagnostics detailed

    if (!r.ok) {
      return res.status(status).json({
        error: 'Upstream error',
        status,
        upstreamUrl,
        authMode: 'bearer',
        detail: data || text || null
      });
    }

    // Optional: field projection
    let items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : data?.ideas || [];
    if (fields) {
      const list = String(fields)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      items = items.map(it => {
        const out = {}; list.forEach(k => { if (k in it) out[k] = it[k]; }); return out;
      });
    }

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json({ items });
  } catch (e) {
    return res.status(500).json({ error: 'Proxy failure', detail: e?.message || String(e) });
  }
}
