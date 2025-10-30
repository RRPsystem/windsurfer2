// Simple local dev server with a Git push endpoint
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
app.use(cors({ origin: true, credentials: false }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Serve static files so you can preview index.html
app.use(express.static(path.join(__dirname, '..')));

// POST /api/git/push { message?: string }
app.post('/api/git/push', (req, res) => {
  const commitMsg = (req.body && req.body.message) ? String(req.body.message) : 'chore: update';
  const repoCwd = path.join(__dirname, '..');

  // Run a small git pipeline: add ., commit, push
  const commands = [
    { cmd: 'git', args: ['add', '.'] },
    { cmd: 'git', args: ['commit', '-m', commitMsg] },
    { cmd: 'git', args: ['push', 'origin', 'main'] },
  ];

  let logs = '';

  const runNext = (i) => {
    if (i >= commands.length) {
      return res.json({ ok: true, output: logs });
    }
    const { cmd, args } = commands[i];
    const child = spawn(cmd, args, { cwd: repoCwd, shell: process.platform === 'win32' });
    child.stdout.on('data', d => { logs += d.toString(); });
    child.stderr.on('data', d => { logs += d.toString(); });
    child.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ ok: false, step: i, command: `${cmd} ${args.join(' ')}`, output: logs });
      }
      runNext(i + 1);
    });
  };

  runNext(0);
});

// Simple local dev proxy for Travel Compositor
// Do NOT expose keys in frontend. Put real keys in server/.env (not committed).

const axios = require('axios');
const qs = require('querystring');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const PORT = process.env.PORT || 5050;

// ------- Ideas: Clean proxy routes -------
// GET /api/ideas?micrositeId=&first=&limit=&lang=&currency=&themes=&destinations=&onlyVisible=&fields=
app.get('/api/ideas', async (req, res) => {
  try {
    const hdr = await getAuthHeader();
    const micrositeId = req.query.micrositeId || TC_MICROSITE_ID;
    if (!micrositeId) return res.status(400).json({ error: 'micrositeId is required' });

    // Pagination with caps
    const first = clampInt(req.query.first, 0, 100000, 0);
    const limit = clampInt(req.query.limit, 1, 50, 20); // cap at 50

    // Allowed filters (pass-through to TC)
    const params = {
      lang: req.query.lang || 'NL',
      currency: req.query.currency || 'EUR',
      ...(req.query.themes ? { themes: req.query.themes } : {}),
      ...(req.query.destinations ? { destinations: req.query.destinations } : {}),
      ...(req.query.fromCreationDate ? { fromCreationDate: req.query.fromCreationDate } : {}),
      ...(req.query.toCreationDate ? { toCreationDate: req.query.toCreationDate } : {}),
      first, limit,
    };

    const url = `${TC_BASE_URL}/travelidea/${encodeURIComponent(micrositeId)}`;
    console.log('[Proxy] GET', url, 'params=', params);
    const r = await axios.get(url, { params, headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip', 'X-Microsite-Id': String(micrositeId), ...hdr } });
    const raw = r.data;
    const list = normalizeIdeaList(raw);

    const fields = parseFields(req.query.fields);
    const projected = fields ? list.map(i => pickFields(i, fields)) : list;

    applyCacheHeaders(res, 60);
    return res.json({ items: projected, first, limit, total: raw?.total || projected.length });
  } catch (err) {
    console.error('[TC] /api/ideas error', err?.response?.status, err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({ error: 'Failed to fetch ideas', detail: err?.response?.data || err.message });
  }

// --- Validation & Sanitization for Idea Update ---
function validateIdeaUpdate(payload) {
  const errors = [];
  if (payload.active !== undefined && typeof payload.active !== 'boolean') errors.push('active must be boolean');
  if (payload.visible !== undefined && typeof payload.visible !== 'boolean') errors.push('visible must be boolean');
  if (payload.autocancelable !== undefined && typeof payload.autocancelable !== 'boolean') errors.push('autocancelable must be boolean');
  if (payload.order !== undefined && !Number.isInteger(payload.order)) errors.push('order must be integer');
  const strFields = ['title','largeTitle','description','remarks'];
  for (const f of strFields) if (payload[f] !== undefined && typeof payload[f] !== 'string') errors.push(`${f} must be string`);
  if (payload.themes !== undefined) {
    if (!Array.isArray(payload.themes)) errors.push('themes must be array');
    else {
      for (const t of payload.themes) {
        if (typeof t !== 'object' || t === null) { errors.push('themes[] must be objects'); break; }
        if (t.id === undefined || !Number.isInteger(t.id)) { errors.push('themes[].id must be integer'); break; }
        if (t.name !== undefined && typeof t.name !== 'string') { errors.push('themes[].name must be string'); break; }
        if (t.imageUrl !== undefined && typeof t.imageUrl !== 'string') { errors.push('themes[].imageUrl must be string'); break; }
      }
    }
  }
  return { ok: errors.length === 0, errors };
}

function sanitizeIdeaUpdate(payload) {
  const out = {};
  const allow = ['active','title','largeTitle','description','remarks','visible','order','autocancelable','themes'];
  for (const k of allow) if (payload[k] !== undefined) out[k] = payload[k];
  // Compact themes to objects with id only if name/imageUrl not provided
  if (Array.isArray(out.themes)) out.themes = out.themes.map(t => (t && (t.name || t.imageUrl) ? t : { id: t.id }));
  return out;
}
});

// GET /api/ideas/:id (detail/day-to-day)
app.get('/api/ideas/:id', async (req, res) => {
  try {
    const hdr = await getAuthHeader();
    const micrositeId = req.query.micrositeId || TC_MICROSITE_ID;
    if (!micrositeId) return res.status(400).json({ error: 'micrositeId is required' });
    const { id } = req.params;

    const params = {
      lang: req.query.lang || 'NL',
      currency: req.query.currency || 'EUR',
    };
    const url = `${TC_BASE_URL}/travelidea/${encodeURIComponent(micrositeId)}/${encodeURIComponent(id)}`;
    console.log('[Proxy] GET', url, 'params=', params);
    const r = await axios.get(url, { params, headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip', 'X-Microsite-Id': String(micrositeId), ...hdr } });
    const normalized = normalizeIdeaDetail(r.data);
    const fields = parseFields(req.query.fields);
    const body = fields ? pickFields(normalized, fields) : normalized;
    applyCacheHeaders(res, 60);
    return res.json(body);
  } catch (err) {
    console.error('[TC] /api/ideas/:id error', err?.response?.status, err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({ error: 'Failed to fetch idea detail', detail: err?.response?.data || err.message });
  }
});

// ---------- Reference data & tickets ----------
// Facilities list
app.get('/api/facilities', async (req, res) => {
  try {
    const hdr = await getAuthHeader();
    const params = { lang: req.query.lang || 'NL' };
    const url = `${TC_BASE_URL}/facilites`;
    console.log('[Proxy] GET', url, 'params=', params);
    const r = await axios.get(url, { params, headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip', ...hdr } });
    const facilities = r?.data?.facilities || r?.data || [];
    applyCacheHeaders(res, 3600);
    return res.json({ facilities });
  } catch (err) {
    console.error('[TC] /api/facilities error', err?.response?.status, err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({ error: 'Failed to fetch facilities', detail: err?.response?.data || err.message });
  }
});

// Themes for microsite
app.get('/api/themes', async (req, res) => {
  try {
    const hdr = await getAuthHeader();
    const micrositeId = req.query.micrositeId || TC_MICROSITE_ID;
    if (!micrositeId) return res.status(400).json({ error: 'micrositeId is required' });
    const url = `${TC_BASE_URL}/theme/${encodeURIComponent(micrositeId)}`;
    console.log('[Proxy] GET', url);
    const r = await axios.get(url, { headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip', 'X-Microsite-Id': String(micrositeId), ...hdr } });
    const themes = r?.data?.theme || r?.data || [];
    applyCacheHeaders(res, 3600);
    return res.json({ themes });
  } catch (err) {
    console.error('[TC] /api/themes error', err?.response?.status, err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({ error: 'Failed to fetch themes', detail: err?.response?.data || err.message });
  }
});

// Ticket datasheet
app.get('/api/ticket/:ticketId/datasheet', async (req, res) => {
  try {
    const hdr = await getAuthHeader();
    const micrositeId = req.query.micrositeId || TC_MICROSITE_ID;
    if (!micrositeId) return res.status(400).json({ error: 'micrositeId is required' });
    const { ticketId } = req.params;
    const params = { ...(req.query.lang ? { lang: req.query.lang } : {}) };
    const url = `${TC_BASE_URL}/ticket/datasheet/${encodeURIComponent(micrositeId)}/${encodeURIComponent(ticketId)}`;
    console.log('[Proxy] GET', url, 'params=', params);
    const r = await axios.get(url, { params, headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip', 'X-Microsite-Id': String(micrositeId), ...hdr } });
    applyCacheHeaders(res, 300);
    return res.json(r.data);
  } catch (err) {
    console.error('[TC] /api/ticket/:ticketId/datasheet error', err?.response?.status, err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({ error: 'Failed to fetch ticket datasheet', detail: err?.response?.data || err.message });
  }
});

// Preferred tickets
app.get('/api/tickets/preferred', async (req, res) => {
  try {
    const hdr = await getAuthHeader();
    const micrositeId = req.query.micrositeId || TC_MICROSITE_ID;
    if (!micrositeId) return res.status(400).json({ error: 'micrositeId is required' });
    const first = clampInt(req.query.first, 0, 100000, 0);
    const limit = clampInt(req.query.limit, 1, 100, 20);
    const params = { lang: req.query.lang || 'NL', first, limit };
    const url = `${TC_BASE_URL}/ticket/preferred/${encodeURIComponent(micrositeId)}`;
    console.log('[Proxy] GET', url, 'params=', params);
    const r = await axios.get(url, { params, headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip', 'X-Microsite-Id': String(micrositeId), ...hdr } });
    applyCacheHeaders(res, 300);
    return res.json(r.data);
  } catch (err) {
    console.error('[TC] /api/tickets/preferred error', err?.response?.status, err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({ error: 'Failed to fetch preferred tickets', detail: err?.response?.data || err.message });
  }
});
// Transport bases (list)
app.get('/api/transportbases', async (req, res) => {
  try {
    const hdr = await getAuthHeader();
    const first = clampInt(req.query.first, 0, 100000, 0);
    const limit = clampInt(req.query.limit, 1, 200, 50);
    const params = { first, limit };
    const url = `${TC_BASE_URL}/transportbases`;
    console.log('[Proxy] GET', url, 'params=', params);
    const r = await axios.get(url, { params, headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip', ...hdr } });
    applyCacheHeaders(res, 3600);
    return res.json(r.data);
  } catch (err) {
    console.error('[TC] /api/transportbases error', err?.response?.status, err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({ error: 'Failed to fetch transport bases', detail: err?.response?.data || err.message });
  }
});

// Transport base by code
app.get('/api/transportbases/:code', async (req, res) => {
  try {
    const hdr = await getAuthHeader();
    const { code } = req.params;
    const url = `${TC_BASE_URL}/transportbases/${encodeURIComponent(code)}`;
    console.log('[Proxy] GET', url);
    const r = await axios.get(url, { headers: { Accept: 'application/json', 'Accept-Encoding': 'gzip', ...hdr } });
    applyCacheHeaders(res, 3600);
    return res.json(r.data);
  } catch (err) {
    console.error('[TC] /api/transportbases/:code error', err?.response?.status, err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({ error: 'Failed to fetch transport base', detail: err?.response?.data || err.message });
  }
});

// GET /api/ideas/:id/info (basic info/meta)
app.get('/api/ideas/:id/info', async (req, res) => {
  try {
    const hdr = await getAuthHeader();
    const micrositeId = req.query.micrositeId || TC_MICROSITE_ID;
    if (!micrositeId) return res.status(400).json({ error: 'micrositeId is required' });
    const { id } = req.params;

    const params = {
      ...(req.query.lang ? { lang: req.query.lang } : {}),
      ...(req.query.currency ? { currency: req.query.currency } : {}),
    };
    const url = `${TC_BASE_URL}/travelidea/${encodeURIComponent(micrositeId)}/info/${encodeURIComponent(id)}`;
    console.log('[Proxy] GET', url, 'params=', params);
    const r = await axios.get(url, { params, headers: { Accept: 'application/json', ...hdr } });
    const normalized = normalizeIdeaInfo(r.data);
    const fields = parseFields(req.query.fields);
    const body = fields ? pickFields(normalized, fields) : normalized;
    applyCacheHeaders(res, 120);
    return res.json(body);
  } catch (err) {
    console.error('[TC] /api/ideas/:id/info error', err?.response?.status, err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({ error: 'Failed to fetch idea info', detail: err?.response?.data || err.message });
  }
});

// PUT /api/ideas/:id (update basic info)
app.put('/api/ideas/:id', async (req, res) => {
  try {
    const hdr = await getAuthHeader();
    const micrositeId = req.query.micrositeId || TC_MICROSITE_ID;
    if (!micrositeId) return res.status(400).json({ error: 'micrositeId is required' });
    const { id } = req.params;

    // Validate & sanitize body
    const { ok, errors } = validateIdeaUpdate(req.body || {});
    if (!ok) return res.status(400).json({ error: 'Invalid payload', details: errors });
    const body = sanitizeIdeaUpdate(req.body || {});

    // Dry-run mode to validate without updating upstream
    if (String(req.query.dryRun).toLowerCase() === 'true') {
      return res.json({ dryRun: true, payload: body });
    }

    const params = {
      ...(req.query.lang ? { lang: req.query.lang } : {}),
    };
    const url = `${TC_BASE_URL}/travelidea/${encodeURIComponent(micrositeId)}/${encodeURIComponent(id)}`;
    console.log('[Proxy] PUT', url, 'params=', params);
    const r = await axios.put(url, body, { headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'Accept-Encoding': 'gzip', 'X-Microsite-Id': String(micrositeId), ...hdr }, params });
    // Return upstream response directly (or normalize if needed later)
    return res.status(r.status).json(r.data);
  } catch (err) {
    console.error('[TC] PUT /api/ideas/:id error', err?.response?.status, err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({ error: 'Failed to update idea', detail: err?.response?.data || err.message });
  }
});

// ------- Helpers -------
function clampInt(v, min, max, def) {
  const n = parseInt(v, 10);
  if (isNaN(n)) return def;
  return Math.max(min, Math.min(max, n));
}

function parseFields(fieldsParam) {
  if (!fieldsParam) return null;
  if (Array.isArray(fieldsParam)) return fieldsParam;
  return String(fieldsParam).split(',').map(s => s.trim()).filter(Boolean);
}

function pickFields(obj, fields) {
  const out = {};
  for (const k of fields) if (k in obj) out[k] = obj[k];
  return out;
}

function applyCacheHeaders(res, seconds) {
  res.set('Cache-Control', `public, max-age=${seconds}`);
}

function textOr(obj, keys, d='') {
  for (const k of keys) { const v = obj?.[k]; if (v !== undefined && v !== null && v !== '') return v; }
  return d;
}

function normalizeIdeaList(raw) {
  // Try to detect list container
  const items = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : raw?.ideas || [];
  return items.map(normalizeIdeaCard);
}

function normalizeIdeaCard(it) {
  const id = it?.id || it?.ideaId || it?.code || '';
  const title = textOr(it, ['title', 'name']);
  const description = textOr(it, ['shortDescription', 'description'], '');
  const images = extractImages(it);
  const thumb = images[0] || '';
  const priceFrom = it?.priceFrom || it?.fromPrice || it?.minPrice || null;
  const duration = it?.duration || it?.days || null;
  const destinations = it?.destinations || it?.destinationList || [];
  const themes = it?.themes || [];
  return { id, title, description, thumb, priceFrom, duration, destinations, themes };
}

function normalizeIdeaDetail(raw) {
  const base = normalizeIdeaCard(raw);
  const gallery = extractImages(raw, 100); // show many photos by default
  const itinerary = extractItinerary(raw);
  const inclusions = raw?.inclusions || raw?.included || [];
  const exclusions = raw?.exclusions || raw?.notIncluded || [];
  const mapSegments = extractSegments(raw);
  const hotels = extractHotels(raw);
  const transports = extractTransports(raw);
  const tickets = extractTickets(raw);
  const destinations = Array.isArray(raw?.destinations) ? raw.destinations.map(d => ({
    code: d?.code || null,
    name: d?.name || d?.title || '',
    description: d?.description || d?.text || '',
    imageUrls: Array.isArray(d?.imageUrls) ? d.imageUrls.map(u => (typeof u==='string'?u:(u?.url||''))).filter(Boolean) : [],
    fromDay: d?.fromDay ?? null,
    toDay: d?.toDay ?? null,
    geolocation: d?.geolocation || null,
  })) : [];
  const themes = Array.isArray(raw?.themes) ? raw.themes : [];
  return { ...base, gallery, itinerary, hotels, transports, tickets, destinations, themes, inclusions, exclusions, mapSegments };
}

function normalizeIdeaInfo(raw) {
  const id = raw?.id || raw?.ideaId || '';
  const title = textOr(raw, ['title', 'largeTitle', 'name']);
  // Show only explicit fields provided by TC (no inference)
  const priceFrom = (raw?.priceFrom !== undefined) ? raw.priceFrom : null;
  const currency = (raw?.currency !== undefined) ? raw.currency : null;
  const duration = (raw?.duration !== undefined) ? raw.duration : (raw?.days !== undefined ? raw.days : null);
  const description = textOr(raw, ['description', 'remarks'], '');
  const images = extractImages(raw, 1);
  const thumb = images[0] || (typeof raw?.imageUrl === 'string' ? raw.imageUrl : '');
  const destinations = Array.isArray(raw?.destinations) ? raw.destinations : [];
  const themes = Array.isArray(raw?.themes) ? raw.themes : [];
  return { id, title, description, thumb, priceFrom, currency, duration, destinations, themes };
}

function extractImages(obj, limit=6) {
  const imgs = [];
  const add = (u) => { if (u && typeof u === 'string') imgs.push(u); };
  if (Array.isArray(obj?.images)) {
    for (const im of obj.images) {
      add(im?.url || im?.href || im?.src || im);
      if (imgs.length >= limit) break;
    }
  }
  if (Array.isArray(obj?.imageUrls)) {
    for (const u of obj.imageUrls) { add(typeof u === 'string' ? u : u?.url); if (imgs.length>=limit) break; }
  }
  if (!imgs.length && obj?.image) add(obj.image);
  if (!imgs.length && obj?.imageUrl) add(obj.imageUrl);
  if (!imgs.length && typeof obj?.cover === 'string') add(obj.cover);
  // merge destination and hotel photos if present
  if (Array.isArray(obj?.destinations)) {
    for (const d of obj.destinations) {
      if (Array.isArray(d?.imageUrls)) {
        for (const u of d.imageUrls) { add(typeof u === 'string' ? u : u?.url); if (imgs.length>=limit) break; }
      }
      if (imgs.length>=limit) break;
    }
  }
  if (Array.isArray(obj?.hotels)) {
    for (const h of obj.hotels) {
      const images = h?.hotelData?.images || [];
      for (const im of images) { add(im?.url || im); if (imgs.length>=limit) break; }
      if (imgs.length>=limit) break;
    }
  }
  return imgs;
}

function extractItinerary(raw) {
  const out = [];
  const days = raw?.days || raw?.itinerary || raw?.dayToDay || [];
  for (let i = 0; i < days.length; i++) {
    const d = days[i];
    const coords = d?.geolocation || d?.coords || {};
    out.push({
      day: d?.day || i+1,
      title: textOr(d, ['title','name'], `Dag ${i+1}`),
      text: textOr(d, ['description','text'], ''),
      lat: Number(coords?.lat ?? coords?.latitude ?? 0) || null,
      lng: Number(coords?.lng ?? coords?.longitude ?? 0) || null,
    });
  }
  return out;
}

function extractSegments(raw) {
  const segs = raw?.segments || raw?.routes || [];
  return segs.map(s => ({
    type: s?.type || 'drive',
    polyline: s?.polyline || '',
    gpx: s?.gpx || '',
    color: s?.color || '#2563eb',
  }));
}

function extractTickets(raw) {
  const arr = Array.isArray(raw?.tickets) ? raw.tickets : (Array.isArray(raw?.activities) ? raw.activities : []);
  return arr.map(t => ({
    id: t?.id || t?.ticketId || null,
    name: t?.name || t?.title || '',
    description: t?.description || t?.text || '',
    duration: t?.duration || '',
    activityType: t?.activityType || '',
    meetingPoint: t?.meetingPoint || '',
    departureTime: t?.departureTime || '',
    imageUrls: Array.isArray(t?.imageUrls) ? t.imageUrls.flat().map(u => (typeof u==='string'?u:(u?.url||''))).filter(Boolean) : [],
    destination: t?.destination?.name || '',
    geolocation: t?.geolocation || null,
    city: t?.city || '',
    zipCode: t?.zipCode || ''
  }));
}

function extractHotels(raw) {
  const arr = Array.isArray(raw?.hotels) ? raw.hotels : [];
  return arr.map(h => {
    const data = h?.hotelData || {};
    const images = [];
    if (Array.isArray(data.images)) {
      for (const im of data.images) images.push(im?.url || im);
    }
    // description
    const description = textOr(data, ['description','remarks','notes'], textOr(h, ['description','remarks'], ''));
    // facilities normalization: accept array of ids, object map, or alternative fields
    let facilities = data?.facilities ?? data?.facilitiesIds ?? data?.amenities ?? data?.features ?? h?.facilities ?? {};
    if (facilities && typeof facilities === 'object' && !Array.isArray(facilities)) {
      const ids = [];
      for (const [k,v] of Object.entries(facilities)) { if (v) ids.push(String(k)); }
      facilities = ids;
    }
    return {
      id: h?.id || data?.id || null,
      day: h?.day || null,
      checkInDate: h?.checkInDate || null,
      checkOutDate: h?.checkOutDate || null,
      nights: h?.nights || null,
      name: data?.name || '',
      category: data?.category || '',
      address: data?.address || '',
      destination: data?.destination?.name || h?.destination?.name || '',
      roomTypes: h?.roomTypes || '',
      mealPlan: h?.mealPlan || '',
      description,
      facilities,
      images,
      price: h?.priceBreakdown?.totalPrice?.amount ?? null,
      currency: h?.priceBreakdown?.totalPrice?.currency || null
    };
  });
}

function extractTransports(raw) {
  const arr = Array.isArray(raw?.transports) ? raw.transports : [];
  return arr.map(t => ({
    id: t?.id || null,
    day: t?.day || null,
    transportType: t?.transportType || '',
    company: t?.company || '',
    origin: t?.originCode || t?.originDestinationCode || t?.origin || '',
    target: t?.targetCode || t?.targetDestinationCode || t?.target || '',
    departureDate: t?.departureDate || '',
    arrivalDate: t?.arrivalDate || '',
    departureTime: t?.departureTime || '',
    arrivalTime: t?.arrivalTime || '',
    numberOfSegments: t?.numberOfSegments || 0,
    price: t?.priceBreakdown?.totalPrice?.amount ?? null,
    currency: t?.priceBreakdown?.totalPrice?.currency || null,
    segments: Array.isArray(t?.segment) ? t.segment : []
  }));
}

// Debug endpoint to verify runtime config quickly
app.get('/api/debug', (req, res) => {
  res.json({
    port: PORT,
    TC_BASE_URL,
    TC_MICROSITE_ID,
    tokenCached: !!cachedToken,
    tokenExpiresInSec: Math.max(0, Math.floor((tokenExpiresAt - Date.now())/1000))
  });
});

// Try to force auth and report status
app.get('/api/debug/auth', async (req, res) => {
  try {
    // reset if requested
    if (String(req.query.reset).toLowerCase() === 'true') {
      cachedToken = null; tokenExpiresAt = 0;
    }
    const hdr = await getAuthHeader();
    const token = (hdr['auth-token'] || (hdr.Authorization||'').replace(/^Bearer\s+/i,'')) || '';
    res.json({
      ok: !!token,
      micrositeId: TC_MICROSITE_ID,
      headerKeys: Object.keys(hdr),
      tokenPreview: token ? token.slice(0,12) + '...' : '',
      expiresInSec: Math.max(0, Math.floor((tokenExpiresAt - Date.now())/1000))
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

// --- Env & helpers ---
const TC_BASE_URL = process.env.TC_BASE_URL || '';
const TC_CLIENT_ID = process.env.TC_CLIENT_ID || '';
const TC_CLIENT_SECRET = process.env.TC_CLIENT_SECRET || '';
const TC_TENANT_ID = process.env.TC_TENANT_ID || '';
const TC_TOKEN = process.env.TC_TOKEN || '';
const TC_MICROSITE_ID = process.env.TC_MICROSITE_ID || '';
const TC_USERNAME = process.env.TC_USERNAME || '';
const TC_PASSWORD = process.env.TC_PASSWORD || '';

if (!TC_BASE_URL) {
  console.warn('[TC] Missing TC_BASE_URL in server/.env');
}

// Optional: token cache if TC requires OAuth. Placeholder for later.
let cachedToken = null;
let tokenExpiresAt = 0;

async function getAuthHeader() {
  // Use static token if provided
  if (TC_TOKEN) return { Authorization: `Bearer ${TC_TOKEN}`, 'auth-token': TC_TOKEN };

  // Travel Compositor auth: POST to /resources/authentication/authenticate
  // Build origin from TC_BASE_URL (which is likely https://online.travelcompositor.com/api)
  try {
    const origin = new URL(TC_BASE_URL).origin; // e.g. https://online.travelcompositor.com
    if ((!cachedToken || Date.now() > tokenExpiresAt) && TC_USERNAME && TC_PASSWORD && TC_MICROSITE_ID) {
      const authUrl = `${origin}/resources/authentication/authenticate`;
      console.log('[Auth] POST', authUrl, 'as', TC_USERNAME, 'microsite', TC_MICROSITE_ID);
      const resp = await axios.post(authUrl, {
        username: TC_USERNAME,
        password: TC_PASSWORD,
        micrositeId: TC_MICROSITE_ID
      }, { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Accept-Encoding': 'gzip' } });
      const token = resp?.data?.token;
      const ttl = Number(resp?.data?.expirationInSeconds || 0);
      if (token) {
        cachedToken = token;
        tokenExpiresAt = Date.now() + Math.max(0, (ttl - 30)) * 1000; // refresh 30s early
        console.log('[Auth] Token obtained, expires in', ttl, 's');
      } else {
        console.warn('[Auth] No token in response');
      }
    }
    if (cachedToken) return { Authorization: `Bearer ${cachedToken}`, 'auth-token': cachedToken };
  } catch (e) {
    console.warn('[Auth] Failed to obtain token:', e?.response?.status, e?.response?.data || e.message);
  }

  // Basic auth fallback if username/password provided but token flow not available
  if (TC_USERNAME && TC_PASSWORD) {
    const base = Buffer.from(`${TC_USERNAME}:${TC_PASSWORD}`).toString('base64');
    return { Authorization: `Basic ${base}` };
  }

  // No auth
  return {};
}

// --- Example: fetch a tour by ID and normalize ---
app.get('/api/tours/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const hdr = await getAuthHeader();

    // Adjust path to actual TC endpoint once known
    const url = `${TC_BASE_URL}/tours/${encodeURIComponent(id)}`;
    console.log('[Proxy] GET', url);
    const r = await axios.get(url, {
      headers: {
        Accept: 'application/json',
        ...hdr,
        ...(TC_TENANT_ID ? { 'X-Tenant-Id': TC_TENANT_ID } : {}),
        ...(TC_MICROSITE_ID ? { 'X-Microsite-Id': TC_MICROSITE_ID } : {})
      }
      // If TC requires additional headers, add them here
    });

    const raw = r.data;
    // TODO: map TC response to normalized schema expected by the editor
    const normalized = normalizeTour(raw);
    res.json(normalized);
  } catch (err) {
    console.error('[TC] /api/tours/:id error', err?.response?.status, err?.response?.data || err.message);
    res.status(err?.response?.status || 500).json({ error: 'Failed to fetch tour', detail: err?.response?.data || err.message });
  }
});

// --- Pass-through endpoint if we need to experiment quickly ---
app.get('/api/tc/*', async (req, res) => {
  try {
    const hdr = await getAuthHeader();
    const tail = req.params[0];
    const url = `${TC_BASE_URL}/${tail}`;
    console.log('[Proxy] GET', url, 'params=', req.query);
    const r = await axios.get(url, {
      params: req.query,
      headers: {
        Accept: 'application/json',
        ...hdr,
        ...(TC_TENANT_ID ? { 'X-Tenant-Id': TC_TENANT_ID } : {}),
        ...(TC_MICROSITE_ID ? { 'X-Microsite-Id': TC_MICROSITE_ID } : {})
      }
    });
    res.status(r.status).json(r.data);
  } catch (err) {
    res.status(err?.response?.status || 500).json({ error: 'Proxy error', detail: err?.response?.data || err.message });
  }
});

// --- Normalizer (placeholder) ---
function normalizeTour(raw) {
  // Shape the response to what the builder will consume for the Tour Map
  // This is a safe default; replace field mappings once TC docs are available.
  return {
    id: raw?.id || raw?.tourId || '',
    title: raw?.title || raw?.name || '',
    description: raw?.description || '',
    cover: raw?.coverUrl || '',
    stops: (raw?.stops || raw?.itinerary || []).map((s, idx) => ({
      day: s?.day || idx + 1,
      title: s?.title || s?.name || `Stop ${idx + 1}`,
      lat: Number(s?.lat ?? s?.latitude ?? 0) || 0,
      lng: Number(s?.lng ?? s?.longitude ?? 0) || 0,
      description: s?.description || '',
      photo: s?.image || s?.photo || '',
      link: s?.url || '',
    })),
    segments: (raw?.segments || raw?.routes || []).map(seg => ({
      type: seg?.type || 'drive',
      polyline: seg?.polyline || '',
      gpx: seg?.gpx || '',
      color: seg?.color || '#2563eb',
    })),
  };
}

// POST /api/booking/parse - PDF booking confirmation parser
const { uploadMiddleware, handler: bookingParseHandler } = require('./api/booking-parse');
app.post('/api/booking/parse', uploadMiddleware, bookingParseHandler);

// POST /api/booking/url-import - URL booking import
const urlImportHandler = require('./api/url-import');
app.post('/api/booking/url-import', urlImportHandler);

// Video generation routes
const videoGenerateHandler = require('./api/video-generate');
const videoStatusHandler = require('./api/video-status');
const voiceoverUploadHandler = require('./api/voiceover-upload');
app.post('/api/video/generate', videoGenerateHandler);
app.get('/api/video/status/:id', videoStatusHandler);
app.post('/api/video/upload-voiceover', voiceoverUploadHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Static files: http://localhost:${PORT}/index.html`);
  console.log(`🔗 Travel Compositor API: /api/ideas`);
  console.log(`📄 PDF Parser: /api/booking/parse`);
  console.log(`🌐 URL Import: /api/booking/url-import`);
  console.log(`🎬 Video Generator: /api/video/generate`);
  console.log(`📤 Git Push: /api/git/push\n`);
});
