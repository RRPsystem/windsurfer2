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

    const url = `${TC_BASE_URL.replace(/\/$/, '')}/travelidea/${encodeURIComponent(TC_MICROSITE_ID)}`;

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

    const r = await fetch(`${url}?${params.toString()}`, { headers });
    const status = r.status;
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(status).json({ error: 'Upstream error', detail: data });

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
