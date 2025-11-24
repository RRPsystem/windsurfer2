// Vercel Serverless Function: GET /api/ideas
// Proxies Travel Compositor ideas list using env credentials.
// Updated to match TC docs: authenticate to get Bearer token, then call /resources/travelidea/{micrositeId}
// Now supports brand_id filtering via Supabase

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const {
      TC_BASE_URL = '', // e.g. https://online.travelcompositor.com
      TC_MICROSITE_ID = '',
      TC_TOKEN = '', // optional static token
      TC_USERNAME = '',
      TC_PASSWORD = '',
      TC_TENANT_ID = '',
      SUPABASE_URL = '',
      SUPABASE_SERVICE_ROLE_KEY = ''
    } = process.env;

    if (!TC_BASE_URL || !TC_MICROSITE_ID) {
      return res.status(500).json({ error: 'Missing TC_BASE_URL or TC_MICROSITE_ID' });
    }

    const micrositeId = String(req.query?.micrositeId || TC_MICROSITE_ID);
    // TC_BASE_URL should be https://online.travelcompositor.com/resources
    const base = TC_BASE_URL.replace(/\/$/, '');
    const AUTH_PATH = (process.env.TC_AUTH_PATH || '/authentication/authenticate');
    const IDEAS_PATH = (process.env.TC_TRAVELIDEA_PATH || '/travelidea');
    const ideasUrl = `${base}${IDEAS_PATH}/${encodeURIComponent(micrositeId)}`;

    // Check if brand filtering is requested
    const brandId = req.query?.brand_id;
    let brandIdeaIds = null;

    if (brandId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      // Fetch active idea_ids for this brand from Supabase
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: ideas, error } = await supabase
        .from('brand_travelideas')
        .select('idea_id')
        .eq('brand_id', brandId)
        .eq('provider', 'travel_compositor')
        .eq('active', true);
      
      if (!error && ideas && ideas.length > 0) {
        brandIdeaIds = ideas.map(i => String(i.idea_id));
      } else if (error) {
        console.warn('[ideas] Supabase query error:', error);
      }
      
      // If brand filter requested but no ideas found, return empty
      if (!brandIdeaIds || brandIdeaIds.length === 0) {
        return res.status(200).json({ items: [] });
      }
    }

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
      let authJson; try { authJson = JSON.parse(authText); } catch (e) { authJson = null; }
      if (!authRes.ok || !authJson?.token) {
        return res.status(authRes.status || 500).json({ error: 'Auth failed', detail: authJson || authText });
      }
      bearer = authJson.token;
    }
    // TC uses auth-token header (lowercase with dash), not Authorization Bearer
    headers['auth-token'] = bearer;

    // Optional debug to verify auth and target URL without relying on upstream
    if (String(req.query?.debug) === '1') {
      return res.status(200).json({
        ok: true,
        authMode: 'auth-token',
        hasToken: !!bearer,
        ideasUrl,
        query: Object.fromEntries(params.entries())
      });
    }

    // Call /resources/travelidea/{micrositeId}
    let upstreamUrl = `${ideasUrl}?${params.toString()}`;
    let r = await fetch(upstreamUrl, { headers });
    let status = r.status;
    let text = await r.text();
    let data; try { data = JSON.parse(text); } catch (e) { data = null; }

    // No fallback needed per docs, but keep diagnostics detailed

    if (!r.ok) {
      return res.status(status).json({
        error: 'Upstream error',
        status,
        upstreamUrl,
        authMode: 'auth-token',
        detail: data || text || null
      });
    }

    // Optional: field projection
    let items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : data?.ideas || [];
    
    // Apply brand filtering if requested
    if (brandIdeaIds && brandIdeaIds.length > 0) {
      items = items.filter(item => {
        const itemId = String(item.id || item.ideaId || '');
        return brandIdeaIds.includes(itemId);
      });
    }
    
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
