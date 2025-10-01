// Vercel Serverless Function: GET /api/ideas/[id]
// Proxies Travel Compositor idea detail using env credentials.

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

    const { id } = req.query || {};
    if (!id) return res.status(400).json({ error: 'Missing id' });
    if (!TC_BASE_URL || !TC_MICROSITE_ID) {
      return res.status(500).json({ error: 'Missing TC_BASE_URL or TC_MICROSITE_ID' });
    }

    const url = `${TC_BASE_URL.replace(/\/$/, '')}/travelidea/${encodeURIComponent(TC_MICROSITE_ID)}/${encodeURIComponent(id)}`;

    const headers = { Accept: 'application/json' };
    if (TC_TENANT_ID) headers['X-Tenant-Id'] = String(TC_TENANT_ID);
    headers['X-Microsite-Id'] = String(TC_MICROSITE_ID);

    if (TC_TOKEN) {
      headers.Authorization = `Bearer ${TC_TOKEN}`;
    } else if (TC_USERNAME && TC_PASSWORD) {
      const basic = Buffer.from(`${TC_USERNAME}:${TC_PASSWORD}`).toString('base64');
      headers.Authorization = `Basic ${basic}`;
    }

    const r = await fetch(url, { headers });
    const status = r.status;
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(status).json({ error: 'Upstream error', detail: data });

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Proxy failure', detail: e?.message || String(e) });
  }
}
