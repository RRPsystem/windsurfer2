// js/publish.js

// If Bolt.new API base is provided, publish via Bolt.new Functions endpoints; otherwise fallback to Supabase.
function hasBoltApi() {
  return !!(window.BOLT_API && window.BOLT_API.baseUrl);
}

function sanitizeBaseUrl(raw) {
  if (!raw) return '';
  const base = String(raw).replace(/\/$/, '');
  try {
    const u = new URL(base);
    return `${u.protocol}//${u.hostname}`; // strip path/query/hash
  } catch (e) {
    // Fallback: strip query/hash manually
    return base.split('#')[0].split('?')[0];
  }
}

function boltFunctionsBase() {
  if (!hasBoltApi()) return null;
  const clean = sanitizeBaseUrl(window.BOLT_API.baseUrl);
  try {
    const u = new URL(clean);
    if (u.hostname.endsWith('.supabase.co') && !u.hostname.includes('.functions.')) {
      const fnHost = u.hostname.replace('.supabase.co', '.functions.supabase.co');
      return `${u.protocol}//${fnHost}`;
    }
    return `${u.protocol}//${u.hostname}`;
  } catch (e) {
    return clean;
  }
}

// expose for other modules (e.g., layoutsBuilder.js)
try { window.boltFunctionsBase = boltFunctionsBase; } catch (e) {}

function boltProjectBase() {
  if (!hasBoltApi()) return null;
  return sanitizeBaseUrl(window.BOLT_API.baseUrl);
}

function boltHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (window.CURRENT_TOKEN) h.Authorization = `Bearer ${window.CURRENT_TOKEN}`;
  // Supabase Edge Functions typically require an apikey header.
  // Prefer an explicit API key if provided, else fall back to Supabase anon key.
  const apiKey = (window.BOLT_API && window.BOLT_API.apiKey) || (window.BOLT_DB && window.BOLT_DB.anonKey);
  if (apiKey) h.apikey = apiKey;
  return h;
}

function withApiKey(url) {
  try {
    const apiKey = (window.BOLT_API && window.BOLT_API.apiKey) || '';
    if (!apiKey) return url;
    const hasQuery = url.includes('?');
    return url + (hasQuery ? '&' : '?') + 'apikey=' + encodeURIComponent(apiKey);
  } catch (e) { return url; }
}

// Prefer custom API and credentials from URL when present
function customApiBaseFromUrl() {
  try {
    const u = new URL(window.location.href);
    const api = (u.searchParams.get('api') || '').replace(/\/$/, '');
    return api || null;
  } catch (e) { return null; }
}

function authHeadersFromUrl() {
  try {
    const u = new URL(window.location.href);
    const token = (u.searchParams.get('token') || window.CURRENT_TOKEN || '').trim();
    const apikey = (u.searchParams.get('apikey') || u.searchParams.get('api_key') || (window.BOLT_API && window.BOLT_API.apiKey) || '').trim();
    const h = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    if (apikey) h.apikey = apikey;
    return h;
  } catch (e) { return { 'Content-Type': 'application/json' }; }
}

async function saveDraftBolt({ brand_id, page_id, title, slug, content_json, is_template, template_category, preview_image_url }) {
  // Build payload; always include brand_id per requirement
  const payload = { brand_id, title, slug, content_json };
  if (page_id) payload.page_id = page_id;
  if (is_template) {
    payload.is_template = true;
    if (template_category) payload.template_category = template_category;
    if (preview_image_url) payload.preview_image_url = preview_image_url;
  }

  // Determine base endpoint
  const custom = customApiBaseFromUrl();
  let base = '';
  if (custom) {
    base = custom; // expected to already include /functions/v1
  } else {
    // Fallback to previous logic if no custom API is provided
    const projectBase = boltProjectBase();
    if (!projectBase) throw new Error('API base URL ontbreekt');
    base = `${projectBase.replace(/\/$/, '')}/functions/v1`;
  }
  
  // Determine endpoint based on content_type from URL
  let url;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const contentType = urlParams.get('content_type');
    const mode = urlParams.get('mode');
    
    // Determine correct endpoint
    if (contentType === 'page' || mode?.includes('template') || is_template) {
      // For templates and regular pages
      url = `${base}/pages-api/save`;
    } else if (contentType === 'trip' || contentType === 'trips') {
      // For trips - use pages-api with content_type
      url = `${base}/pages-api/save`;
    } else if (contentType === 'news' || contentType === 'news_items') {
      // For news items
      url = `${base}/content-api/save?type=news_items`;
    } else if (contentType === 'destination' || contentType === 'destinations') {
      url = `${base}/content-api/save?type=destinations`;
    } else {
      // Fallback to pages-api
      console.warn('[saveDraftBolt] Unknown content_type, defaulting to pages-api. content_type:', contentType);
      url = `${base}/pages-api/save`;
    }
    
    console.log('[saveDraftBolt] Using endpoint:', url, 'for content_type:', contentType, 'is_template:', is_template);
  } catch (e) {
    console.warn('[saveDraftBolt] Error determining endpoint, using pages-api', e);
    url = `${base}/pages-api/save`;
  }
  
  const headers = authHeadersFromUrl();

  let res = null; let data = null;
  try {
    res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
    try { data = await res.clone().json(); } catch (e) { data = null; }
  } catch (e) {
    console.warn('[saveDraftBolt] network error', e);
    throw e;
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `saveDraft failed: ${res.status}`;
    const err = new Error(`${msg}`);
    try { err.status = res.status; } catch (e) {}
    throw err;
  }

  return {
    id: (data && (data.page_id || data.id)) || page_id || null,
    slug: data && data.slug,
    version: data && data.version,
    success: data ? !!data.success : true,
    message: data && data.message,
    _raw: data
  };
}

async function publishPageBolt(pageId, htmlString) {
  // Prefer custom API base from URL; else Bolt project base
  const base = (function(){
    const fromUrl = contentApiBase(); // already ends with /functions/v1
    if (fromUrl) return fromUrl;
    const proj = boltProjectBase();
    return proj ? `${proj.replace(/\/$/, '')}/functions/v1` : '';
  })();
  if (!base) throw new Error('API base URL ontbreekt');
  const url = `${base}/pages-api/${encodeURIComponent(pageId)}/publish`;
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeadersFromUrl(),
    body: JSON.stringify({ body_html: htmlString })
  });
  let data = null;
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `publish failed: ${res.status}`;
    console.error('[publishPageBolt] HTTP', res.status, msg, { url, data });
    const err = new Error(`${msg} (${res.status})`);
    try { err.status = res.status; } catch (e) {}
    throw err;
  }
  console.debug('[publishPageBolt] success', { url, data });
  // Expected: { success:true, page_id, slug, version, status:"published", preview_url, public_url, message }
  return {
    id: data && (data.page_id || data.id) || pageId,
    slug: data && data.slug,
    version: data && data.version,
    status: data && (data.status || (data.success ? 'published' : '')),
    preview_url: data && (data.preview_url || data.url),
    public_url: data && data.public_url,
    success: data ? !!data.success : true,
    message: data && data.message,
    _raw: data
  };
}

async function saveDraftSupabase({ brand_id, page_id, title, slug, content_json }) {
  const { data, error } = await window.db
    .from('pages')
    .upsert(
      { id: page_id, brand_id, title, slug, content_json, status: 'draft' },
      { onConflict: 'id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data; // bevat id
}

async function publishPageSupabase(pageId, htmlString) {
  const { error } = await window.db.rpc('publish_page', {
    p_page_id: pageId,
    p_html: htmlString
  });
  if (error) throw error;
  return { ok: true };
}

async function saveDraft(args) {
  // Use custom API (from URL) or Bolt API if available; otherwise fallback to direct Supabase client
  if (customApiBaseFromUrl() || hasBoltApi()) return saveDraftBolt(args);
  return saveDraftSupabase(args);
}

async function publishPage(pageId, htmlString) {
  if (customApiBaseFromUrl() || hasBoltApi()) return publishPageBolt(pageId, htmlString);
  return publishPageSupabase(pageId, htmlString);
}

window.BuilderPublishAPI = { saveDraft, publishPage };

// ------------------------------
// JWT Debug Helper
// ------------------------------
function decodeJWT(token) {
  try {
    if (!token) return null;
    // Remove 'Bearer ' prefix if present
    const clean = token.replace(/^Bearer\s+/i, '');
    const parts = clean.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch (e) {
    console.warn('[decodeJWT] failed', e);
    return null;
  }
}

function validateJWT() {
  try {
    const headers = contentApiHeaders();
    if (!headers.Authorization) {
      console.warn('[validateJWT] No Authorization header');
      return { valid: false, reason: 'No Authorization header' };
    }
    
    const payload = decodeJWT(headers.Authorization);
    if (!payload) {
      console.warn('[validateJWT] Failed to decode JWT');
      return { valid: false, reason: 'Failed to decode JWT' };
    }
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now >= payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      console.warn('[validateJWT] Token expired', { exp: payload.exp, expDate, now });
      return { valid: false, reason: 'Token expired', expiredAt: expDate, payload };
    }
    
    // Get brand_id from URL or globals
    let expectedBrandId = null;
    try {
      const u = new URL(window.location.href);
      expectedBrandId = u.searchParams.get('brand_id') || window.CURRENT_BRAND_ID;
    } catch (e) {}
    
    // Check brand_id match
    if (expectedBrandId && payload.brand_id && payload.brand_id !== expectedBrandId) {
      console.warn('[validateJWT] Brand ID mismatch', {
        jwtBrandId: payload.brand_id,
        expectedBrandId
      });
      return {
        valid: false,
        reason: 'Brand ID mismatch',
        jwtBrandId: payload.brand_id,
        expectedBrandId,
        payload
      };
    }
    
    console.debug('[validateJWT] Token valid', {
      brand_id: payload.brand_id,
      user_id: payload.user_id,
      exp: payload.exp,
      expiresAt: new Date(payload.exp * 1000),
      timeUntilExpiry: payload.exp ? `${Math.floor((payload.exp - now) / 60)} minutes` : 'N/A'
    });
    
    return { valid: true, payload };
  } catch (e) {
    console.error('[validateJWT] error', e);
    return { valid: false, reason: String(e.message || e) };
  }
}

// Expose JWT helpers and API functions
try {
  window.BuilderPublishAPI = window.BuilderPublishAPI || {};
  window.BuilderPublishAPI.decodeJWT = decodeJWT;
  window.BuilderPublishAPI.validateJWT = validateJWT;
  window.BuilderPublishAPI.contentApiHeaders = contentApiHeaders;
  window.BuilderPublishAPI.contentApiBase = contentApiBase;
  window.BuilderPublishAPI.customApiBaseFromUrl = customApiBaseFromUrl;
} catch (e) {}

// ==============================
// Health check for runtime config
// ==============================
async function healthCheck({ brand_id } = {}) {
  const base = contentApiBase();
  const headers = contentApiHeaders();
  const missing = [];
  if (!base) missing.push('api');
  if (!headers.Authorization) missing.push('token');
  if (!headers.apikey) missing.push('apikey');
  if (!brand_id) {
    try { brand_id = (new URL(window.location.href)).searchParams.get('brand_id') || window.CURRENT_BRAND_ID; } catch (e) {}
  }
  if (!brand_id) missing.push('brand_id');
  const result = { ok: missing.length === 0, missing, base, hasAuth: !!headers.Authorization, hasApiKey: !!headers.apikey };
  // If anything missing, return early without network call
  if (missing.length) return result;
  // Try a lightweight call (HEAD/GET). If HEAD unsupported, fall back to GET with minimal payload.
  try {
    const u = `${base}/content-api/list?type=news_items&brand_id=${encodeURIComponent(brand_id)}&status=draft`;
    const res = await fetch(u, { method: 'GET', headers });
    result.httpOk = res.ok;
    result.status = res.status;
    result.ok = result.ok && res.ok;
  } catch (e) {
    result.httpOk = false;
    result.status = 0;
    result.error = String(e && e.message || e);
    result.ok = false;
  }
  return result;
}

try { window.BuilderPublishAPI.healthCheck = healthCheck; } catch (e) {}

// ==============================
// Layouts (Header/Footer/Menu)
// Uses Bolt layouts-api when available
// ==============================

function layoutsApiBase() {
  if (!hasBoltApi()) return null;
  return `${window.BOLT_API.baseUrl.replace(/\/$/, '')}/functions/v1/layouts-api`;
}

// ---------- HEADER ----------
async function saveHeaderDraft({ brand_id, content_json }) {
  const base = layoutsApiBase();
  if (base) {
    const res = await fetch(withApiKey(`${base}/header/saveDraft`), {
      method: 'POST',
      headers: boltHeaders(),
      body: JSON.stringify({ brand_id, content_json })
    });
    if (!res.ok) throw new Error(`header saveDraft failed: ${res.status}`);
    return await res.json(); // { ok, version, updated_at }
  }
  // Fallback: store locally (no publish target)
  localStorage.setItem(`wb_header_${brand_id}`, JSON.stringify({ content_json, ts: Date.now() }));
  return { ok: true, version: 0, updated_at: new Date().toISOString() };
}

async function publishHeader({ brand_id, body_html }) {
  const base = layoutsApiBase();
  if (base) {
    const res = await fetch(withApiKey(`${base}/header/publish`), {
      method: 'POST',
      headers: boltHeaders(),
      body: JSON.stringify({ brand_id, body_html })
    });
    if (!res.ok) throw new Error(`header publish failed: ${res.status}`);
    return await res.json(); // { ok, version, updated_at }
  }
  return { ok: true };
}

// ---------- FOOTER ----------
async function saveFooterDraft({ brand_id, content_json }) {
  const base = layoutsApiBase();
  if (base) {
    const res = await fetch(withApiKey(`${base}/footer/saveDraft`), {
      method: 'POST',
      headers: boltHeaders(),
      body: JSON.stringify({ brand_id, content_json })
    });
    if (!res.ok) throw new Error(`footer saveDraft failed: ${res.status}`);
    return await res.json();
  }
  localStorage.setItem(`wb_footer_${brand_id}`, JSON.stringify({ content_json, ts: Date.now() }));
  return { ok: true, version: 0, updated_at: new Date().toISOString() };
}

async function publishFooter({ brand_id, body_html }) {
  const base = layoutsApiBase();
  if (base) {
    const res = await fetch(withApiKey(`${base}/footer/publish`), {
      method: 'POST',
      headers: boltHeaders(),
      body: JSON.stringify({ brand_id, body_html })
    });
    if (!res.ok) throw new Error(`footer publish failed: ${res.status}`);
    return await res.json();
  }
  return { ok: true };
}

// ---------- MENU ----------
async function saveMenuDraft({ brand_id, menu_json, menu_map }) {
  const base = layoutsApiBase();
  if (base) {
    const res = await fetch(withApiKey(`${base}/menu/saveDraft`), {
      method: 'POST',
      headers: boltHeaders(),
      body: JSON.stringify(menu_map ? { brand_id, menu_map } : { brand_id, menu_json })
    });
    if (!res.ok) throw new Error(`menu saveDraft failed: ${res.status}`);
    return await res.json();
  }
  const payload = menu_map ? { menu_map } : { menu_json };
  localStorage.setItem(`wb_menu_${brand_id}`, JSON.stringify({ ...payload, ts: Date.now() }));
  return { ok: true, version: 0, updated_at: new Date().toISOString() };
}

async function publishMenu({ brand_id }) {
  const base = layoutsApiBase();
  if (base) {
    const res = await fetch(withApiKey(`${base}/menu/publish`), {
      method: 'POST',
      headers: boltHeaders(),
      body: JSON.stringify({ brand_id })
    });
    if (!res.ok) throw new Error(`menu publish failed: ${res.status}`);
    return await res.json();
  }
  return { ok: true };
}

// Expose layouts API
window.BuilderPublishAPI.saveHeaderDraft = saveHeaderDraft;
window.BuilderPublishAPI.publishHeader = publishHeader;
window.BuilderPublishAPI.saveFooterDraft = saveFooterDraft;
window.BuilderPublishAPI.publishFooter = publishFooter;
window.BuilderPublishAPI.saveMenuDraft = saveMenuDraft;
window.BuilderPublishAPI.publishMenu = publishMenu;

// ==============================
// News (content-api: type=news_items)
// Base: {VITE_SUPABASE_URL}/functions/v1/content-api
// Endpoints:
//  - POST   /content-api/save?type=news_items
//  - POST   /content-api/publish?type=news_items
//  - GET    /content-api/list?type=news_items&brand_id=...&status=published
//  - GET    /content-api/{id}?type=news_items
//  - GET    /content-api?type=news_items&brand_id=...&slug=...
//  - DELETE /content-api/{id}?type=news_items
// All require Authorization: Bearer <token>
// ==============================

function contentApiBase() {
  // Prefer explicit custom API from URL, else Bolt API baseUrl, else fall back to BOLT_DB.url
  const fromUrl = customApiBaseFromUrl();
  if (fromUrl) {
    // If URL already includes /functions/v1, return as-is; otherwise append it
    const clean = fromUrl.replace(/\/$/, '');
    return /\/functions\/v1$/i.test(clean) ? clean : `${clean}/functions/v1`;
  }
  const boltBase = hasBoltApi() ? boltProjectBase() : '';
  if (boltBase) return `${boltBase.replace(/\/$/, '')}/functions/v1`;
  const dbUrl = (window.BOLT_DB && window.BOLT_DB.url) || '';
  if (dbUrl) return `${dbUrl.replace(/\/$/, '')}/functions/v1`;
  return '';
}

function contentApiHeaders() {
  // Prefer URL-provided credentials
  return authHeadersFromUrl();
}

function readQueryParam(name) {
  try {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  } catch (e) { return null; }
}

async function newsSaveDraft({ brand_id, id, title, slug, content, excerpt, featured_image, status = 'draft', author_type: arg_author_type, author_id: arg_author_id }) {
  const base = contentApiBase();
  if (!base) throw new Error('content-api base URL ontbreekt');
  // Use standard content-api endpoint with type parameter
  const url = `${base}/content-api/save?type=news_items`;
  const baseBody = { brand_id, title, slug, content: content || {}, excerpt: excerpt || '', featured_image: featured_image || '', status };
  // Tags support: from content.meta.tags (array) or URL ?tags=comma,separated
  try {
    const metaTags = Array.isArray(content?.meta?.tags) ? content.meta.tags : null;
    if (metaTags && metaTags.length) baseBody.tags = metaTags.map(String);
    // From a UI field stored globally
    const globalTags = (window.CURRENT_NEWS_TAGS && Array.isArray(window.CURRENT_NEWS_TAGS))
      ? window.CURRENT_NEWS_TAGS
      : (typeof window.CURRENT_NEWS_TAGS === 'string' ? window.CURRENT_NEWS_TAGS.split(',').map(s=>s.trim()).filter(Boolean) : null);
    if ((!baseBody.tags || !baseBody.tags.length) && globalTags && globalTags.length) {
      baseBody.tags = globalTags.map(String);
    }
    const qp = readQueryParam('tags');
    if ((!baseBody.tags || !baseBody.tags.length) && qp) {
      const arr = String(qp).split(',').map(s=>s.trim()).filter(Boolean);
      if (arr.length) baseBody.tags = arr;
    }
  } catch (e) {}
  // Attach author attribution if provided via URL or globals (for admin attribution in Bolt)
  const author_type = arg_author_type || readQueryParam('author_type') || (window.CURRENT_AUTHOR_TYPE || null);
  const author_id = arg_author_id || readQueryParam('author_id') || readQueryParam('user_id') || (window.CURRENT_USER_ID || null);
  if (author_type) baseBody.author_type = author_type;
  if (author_id) baseBody.author_id = author_id;
  if (id) baseBody.id = id;
  // Debug (mask secrets)
  try {
    const hdr = contentApiHeaders();
    const masked = {
      Authorization: hdr.Authorization ? 'Bearer ***' : undefined,
      apikey: hdr.apikey ? '***' : undefined,
      'Content-Type': hdr['Content-Type']
    };
    console.debug('[newsSaveDraft] request', {
      base,
      url,
      brand_id,
      title,
      slug,
      hasToken: !!hdr.Authorization,
      hasApiKey: !!hdr.apikey,
      tags: (baseBody.tags && baseBody.tags.join(',')) || null,
      author_type: baseBody.author_type || null,
      author_id: baseBody.author_id ? String(baseBody.author_id).slice(0,6) + '…' : null,
      headers: masked
    });
  } catch (e) {}

  const send = async (payload) => {
    let res; let data = null; let rawText = '';
    try {
      res = await fetch(url, { method: 'POST', headers: contentApiHeaders(), body: JSON.stringify(payload) });
    } catch (netErr) {
      console.warn('[newsSaveDraft] network error', netErr);
      throw netErr;
    }
    try { data = await res.json(); } catch (e) { /* may not be JSON */ }
    if (!res.ok) {
      try { rawText = await res.text(); } catch (e) {}
      const msg = (data && (data.error || data.message)) || rawText || `news save failed: ${res.status}`;
      throw new Error(msg);
    }
    return data;
  };

  // Try with tags first (if present); on schema error mentioning tags, retry without tags
  try {
    const first = await send(baseBody);
    console.debug('[newsSaveDraft] success', { id: first && first.id, slug: first && first.slug, status: first && first.status });
    return first;
  } catch (e) {
    const msg = String(e && e.message || e).toLowerCase();
    const hasTags = Array.isArray(baseBody.tags) && baseBody.tags.length > 0;
    const tagSchemaError = hasTags && (msg.includes("tags' column") || msg.includes('column "tags"') || (msg.includes('schema') && msg.includes('tags')));
    if (tagSchemaError) {
      console.warn('[newsSaveDraft] retrying without tags due to schema error');
      const fallback = { ...baseBody }; delete fallback.tags;
      const second = await send(fallback);
      try { window.websiteBuilder?.showNotification?.('Concept opgeslagen zonder tags (kolom ontbreekt in backend)', 'warning'); } catch (e) {}
      return second;
    }
    // Not a tags-related error: rethrow
    throw e;
  }
}

async function newsPublish({ brand_id, id, slug }) {
  const base = contentApiBase();
  if (!base) throw new Error('content-api base URL ontbreekt');
  const url = `${base}/content-api/publish?type=news_items`;
  const body = { brand_id };
  if (id) body.id = id; else if (slug) body.slug = slug;
  // Provide author_type hint so backend can decide brand/admin flow
  try {
    const at = readQueryParam('author_type') || (window.CURRENT_AUTHOR_TYPE || null);
    if (at) body.author_type = at;
  } catch (e) {}
  
  // Debug logging (mask secrets)
  try {
    const hdr = contentApiHeaders();
    const masked = {
      Authorization: hdr.Authorization ? `Bearer ${hdr.Authorization.substring(7, 17)}...` : undefined,
      apikey: hdr.apikey ? `${hdr.apikey.substring(0, 10)}...` : undefined,
      'Content-Type': hdr['Content-Type']
    };
    console.debug('[newsPublish] request', {
      base,
      url,
      brand_id,
      id: id || null,
      slug: slug || null,
      hasToken: !!hdr.Authorization,
      hasApiKey: !!hdr.apikey,
      author_type: body.author_type || null,
      headers: masked,
      body
    });
  } catch (e) {}
  
  const res = await fetch(url, { method: 'POST', headers: contentApiHeaders(), body: JSON.stringify(body) });
  let data = null; try { data = await res.json(); } catch (e) {}
  
  // Enhanced error logging
  if (!res.ok) {
    console.error('[newsPublish] HTTP error', {
      status: res.status,
      statusText: res.statusText,
      data,
      url
    });
    const msg = (data && (data.error || data.message)) || `news publish failed: ${res.status}`;
    throw new Error(msg);
  }
  
  console.debug('[newsPublish] success', { id: data && data.id, slug: data && data.slug, status: data && data.status });
  return data; // expect { id, slug, status: 'published', preview_url/public_url? }
}

async function newsList({ brand_id, status = 'published' }) {
  const base = contentApiBase();
  if (!base) throw new Error('content-api base URL ontbreekt');
  const u = `${base}/content-api/list?type=news_items&brand_id=${encodeURIComponent(brand_id)}&status=${encodeURIComponent(status)}`;
  const res = await fetch(u, { headers: contentApiHeaders() });
  let data = null; try { data = await res.json(); } catch (e) {}
  if (!res.ok) { const msg = (data && (data.error || data.message)) || `news list failed: ${res.status}`; throw new Error(msg); }
  return data;
}

async function newsGetById({ id }) {
  const base = contentApiBase();
  if (!base) throw new Error('content-api base URL ontbreekt');
  const u = `${base}/content-api/${encodeURIComponent(id)}?type=news_items`;
  const res = await fetch(u, { headers: contentApiHeaders() });
  let data = null; try { data = await res.json(); } catch (e) {}
  if (!res.ok) { const msg = (data && (data.error || data.message)) || `news get failed: ${res.status}`; throw new Error(msg); }
  return data;
}

async function newsGetBySlug({ brand_id, slug }) {
  const base = contentApiBase();
  if (!base) throw new Error('content-api base URL ontbreekt');
  const params = new URLSearchParams({ type: 'news_items', brand_id: brand_id || '', slug: slug || '' });
  const u = `${base}/content-api?${params.toString()}`;
  const res = await fetch(u, { headers: contentApiHeaders() });
  let data = null; try { data = await res.json(); } catch (e) {}
  if (!res.ok) { const msg = (data && (data.error || data.message)) || `news getBySlug failed: ${res.status}`; throw new Error(msg); }
  return data;
}

async function newsDelete({ id }) {
  const base = contentApiBase();
  if (!base) throw new Error('content-api base URL ontbreekt');
  const u = `${base}/content-api/${encodeURIComponent(id)}?type=news_items`;
  const res = await fetch(u, { method: 'DELETE', headers: contentApiHeaders() });
  if (!res.ok) { let data = null; try { data = await res.json(); } catch (e) {}; const msg = (data && (data.error || data.message)) || `news delete failed: ${res.status}`; throw new Error(msg); }
  return { ok: true };
}

// Expose news API
window.BuilderPublishAPI.news = {
  saveDraft: newsSaveDraft,
  publish: newsPublish,
  list: newsList,
  getById: newsGetById,
  getBySlug: newsGetBySlug,
  remove: newsDelete
};

// ==============================
// Destinations (content-api: type=destinations)
// ==============================
async function destinationsSaveDraft({ brand_id, id, title, slug, content, status = 'draft' }) {
  const base = contentApiBase();
  if (!base) throw new Error('content-api base URL ontbreekt');
  const url = `${base}/content-api/save?type=destinations`;
  const body = { brand_id, title, slug, content: content || {}, status };
  const author_type = readQueryParam('author_type') || (window.CURRENT_AUTHOR_TYPE || null);
  const author_id = readQueryParam('author_id') || readQueryParam('user_id') || (window.CURRENT_USER_ID || null);
  if (author_type) body.author_type = author_type;
  if (author_id) body.author_id = author_id;
  if (id) body.id = id;
  // Debug
  try {
    const hdr = contentApiHeaders();
    console.debug('[destinationsSaveDraft] request', {
      url,
      brand_id,
      title,
      slug,
      hasToken: !!hdr.Authorization,
      hasApiKey: !!hdr.apikey,
      author_type: body.author_type || null,
      author_id: body.author_id ? String(body.author_id).slice(0,6)+'…' : null
    });
  } catch (e) {}
  let res;
  try {
    res = await fetch(url, { method: 'POST', headers: contentApiHeaders(), body: JSON.stringify(body) });
  } catch (e) { console.warn('[destinationsSaveDraft] network error', e); throw e; }
  let data = null; try { data = await res.json(); } catch (e) {}
  if (!res.ok) {
    let text = ''; try { text = await res.text(); } catch (e) {}
    const msg = (data && (data.error || data.message)) || text || `destinations save failed: ${res.status}`;
    console.warn('[destinationsSaveDraft] HTTP error', { status: res.status, msg, data });
    throw new Error(msg);
  }
  console.debug('[destinationsSaveDraft] success', { id: data && data.id, slug: data && data.slug, status: data && data.status });
  return data;
}

// Expose destinations API
window.BuilderPublishAPI.destinations = {
  saveDraft: destinationsSaveDraft
};

// ==============================
// Universal Edge Save Function
// ==============================
window.websiteBuilder = window.websiteBuilder || {};
window.websiteBuilder.saveToEdgeIfPresent = async function() {
  try {
    const edgeCtx = this._edgeCtx;
    if (!edgeCtx || this._edgeDisabled) {
      console.log('[Edge] No edge context or disabled, skipping save');
      return;
    }

    const { kind, key } = edgeCtx;
    console.log('[Edge] Saving to edge:', { kind, key });

    // Get canvas content
    const canvas = document.getElementById('canvas');
    if (!canvas) {
      console.warn('[Edge] No canvas found');
      return;
    }

    const htmlContent = canvas.innerHTML;
    const titleInput = document.getElementById('pageTitleInput');
    const slugInput = document.getElementById('pageSlugInput');
    const title = titleInput ? titleInput.value : '';
    const slug = slugInput ? slugInput.value : key;

    // Get brand_id from URL or context
    const urlParams = new URLSearchParams(window.location.search);
    const brand_id = urlParams.get('brand_id') || edgeCtx.brand_id;

    // Save based on content type
    if (kind === 'destination') {
      console.log('[Edge] Saving destination:', { slug, title });
      
      // Get the destination ID from edgeCtx or loaded data
      const destinationId = edgeCtx.contentId || window._pendingPageLoad?.data?.id || null;
      console.log('[Edge] Destination ID:', destinationId);
      
      const result = await window.BuilderPublishAPI.destinations.saveDraft({
        brand_id,
        id: destinationId,  // Include ID for update
        slug,
        title,
        content: { html: htmlContent },
        status: 'draft'
      });
      console.log('[Edge] Destination saved:', result);
    } else if (kind === 'news') {
      console.log('[Edge] Saving news:', { slug, title });
      const result = await window.BuilderPublishAPI.news.saveDraft({
        brand_id,
        slug,
        title,
        content: { html: htmlContent },
        status: 'draft'
      });
      console.log('[Edge] News saved:', result);
    } else {
      console.log('[Edge] Page save not implemented yet for kind:', kind);
    }
  } catch (error) {
    console.error('[Edge] Save failed:', error);
    throw error;
  }
};
