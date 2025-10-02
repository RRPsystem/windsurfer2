// Vercel Serverless Function: GET /api/ideas
// Proxies Travel Compositor ideas list using env credentials.

export default async function handler(req, res) {
  try {
    const {
      TC_BASE_URL = '',
      TC_MICROSITE_ID = '',
      TC_TOKEN = '',
      TC_USERNAME = '',
      TC_PASSWORD = '',
      TC_TENANT_ID = ''
    } = process.env;

    if (!TC_BASE_URL || !TC_MICROSITE_ID) {
      return res.status(500).json({ error: 'Missing TC_BASE_URL or TC_MICROSITE_ID' });
    }

    const micrositeId = String(req.query?.micrositeId || TC_MICROSITE_ID);
    const base = TC_BASE_URL.replace(/\/$/, '');
    const url = `${base}/travelidea/${encodeURIComponent(micrositeId)}`;

    // Pass-through selected query params with safe defaults
    const {
      first = '0',
      limit = '20',
      lang = 'NL',
      currency = 'EUR',
      themes,
      destinations,
      fromCreationDate,
      toCreationDate,
      fields
    } = req.query || {};

    const params = new URLSearchParams();
    params.set('first', String(first));
    params.set('limit', String(limit));
    params.set('lang', String(lang));
    params.set('currency', String(currency));
    if (themes) params.set('themes', String(themes));
    if (destinations) params.set('destinations', String(destinations));
    if (fromCreationDate) params.set('fromCreationDate', String(fromCreationDate));
    if (toCreationDate) params.set('toCreationDate', String(toCreationDate));

    const headers = { Accept: 'application/json' };
    if (TC_TENANT_ID) headers['X-Tenant-Id'] = String(TC_TENANT_ID);
    headers['X-Microsite-Id'] = String(TC_MICROSITE_ID);

    if (TC_TOKEN) {
      headers.Authorization = `Bearer ${TC_TOKEN}`;
    } else if (TC_USERNAME && TC_PASSWORD) {
      const basic = Buffer.from(`${TC_USERNAME}:${TC_PASSWORD}`).toString('base64');
      headers.Authorization = `Basic ${basic}`;
    }

    // Try primary path /travelidea/{micrositeId}
    let upstreamUrl = `${url}?${params.toString()}`;
    let r = await fetch(upstreamUrl, { headers });
    let status = r.status;
    let text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = null; }

    // If 404, try fallback path /travelidea (microsite only as header)
    if (status === 404) {
      const fallbackUrl = `${base}/travelidea?${params.toString()}`;
      r = await fetch(fallbackUrl, { headers });
      status = r.status;
      text = await r.text();
      try { data = JSON.parse(text); } catch { data = null; }
      upstreamUrl = fallbackUrl;
    }

    if (!r.ok) {
      return res.status(status).json({
        error: 'Upstream error',
        status,
        upstreamUrl,
        authMode: TC_TOKEN ? 'bearer' : (TC_USERNAME && TC_PASSWORD ? 'basic' : 'none'),
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
