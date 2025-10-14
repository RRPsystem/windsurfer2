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
  } catch { return url; }
}

async function saveDraftBolt({ brand_id, page_id, title, slug, content_json, is_template, template_category, preview_image_url }) {
  const base = boltFunctionsBase();
  // Build payload conditionally: templates must NOT include brand_id
  const payload = { title, slug, content_json };
  if (page_id) payload.page_id = page_id;
  if (is_template) {
    payload.is_template = true;
    if (template_category) payload.template_category = template_category;
    if (preview_image_url) payload.preview_image_url = preview_image_url;
  } else {
    payload.brand_id = brand_id; // normal page draft
  }
  // Build headers once
  const hdrs = (function(){
    try {
      const u = new URL(window.location.href);
      const token = (u.searchParams.get('token') || window.CURRENT_TOKEN || '');
      const apikey = (u.searchParams.get('apikey') || u.searchParams.get('api_key') || (window.BOLT_API && window.BOLT_API.apiKey) || '');
      return { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}`, 'apikey': apikey };
    } catch { return { 'Content-Type':'application/json' }; }
  })();

  // Candidate endpoints: functions host first, then project host; try /saveDraft then /save
  const bases = [boltFunctionsBase(), boltProjectBase()].filter(Boolean);
  const paths = ['/functions/v1/pages-api/saveDraft', '/functions/v1/pages-api/save'];
  let res = null; let data = null; let url = '';
  for (const b of bases) {
    for (const p of paths) {
      try {
        url = withApiKey(`${b}${p}`);
        res = await fetch(url, { method: 'POST', headers: hdrs, body: JSON.stringify(payload) });
        // Try to parse body once (even on error) for better diagnostics
        try { data = await res.clone().json(); } catch { data = null; }
        if (res.ok) { console.debug('[saveDraftBolt] success', { url, data }); break; }
        console.warn('[saveDraftBolt] attempt failed', res.status, { url, data });
      } catch (e) {
        console.warn('[saveDraftBolt] network error', { url, error: String(e && e.message || e) });
        res = null; data = null;
      }
    }
    if (res && res.ok) break;
  }

  if (!res || !res.ok) {
    const status = res ? res.status : 'no_response';
    const msg = (data && (data.error || data.message)) || `saveDraft failed: ${status}`;
    console.error('[saveDraftBolt] all attempts failed', status, msg, { url, payload, data });
    const err = new Error(`${msg} (${status})`);
    try { err.status = status; } catch (e) {}
    throw err;
  }
  // Expected: { success:true, page_id, slug, version, message }
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
  const base = boltProjectBase();
  let url = `${base}/functions/v1/pages-api/${encodeURIComponent(pageId)}/publish`;
  url = withApiKey(url);
  const res = await fetch(url, {
    method: 'POST',
    headers: boltHeaders(),
    body: JSON.stringify({ body_html: htmlString })
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `publish failed: ${res.status}`;
    console.error('[publishPageBolt] HTTP', res.status, msg, { url, data });
    const err = new Error(`${msg} (${res.status})`);
    try { err.status = res.status; } catch {}
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
  if (hasBoltApi()) return saveDraftBolt(args);
  return saveDraftSupabase(args);
}

async function publishPage(pageId, htmlString) {
  if (hasBoltApi()) return publishPageBolt(pageId, htmlString);
  return publishPageSupabase(pageId, htmlString);
}

window.BuilderPublishAPI = { saveDraft, publishPage };

// ------------------------------
// Health check for runtime config
// ------------------------------
async function healthCheck({ brand_id } = {}) {
  const base = contentApiBase();
  const headers = contentApiHeaders();
  const missing = [];
  if (!base) missing.push('api');
  if (!headers.Authorization) missing.push('token');
  if (!headers.apikey) missing.push('apikey');
  if (!brand_id) {
    try { brand_id = (new URL(window.location.href)).searchParams.get('brand_id') || window.CURRENT_BRAND_ID; } catch {}
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

try { window.BuilderPublishAPI.healthCheck = healthCheck; } catch {}

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
  // Prefer explicit Bolt API baseUrl when present; otherwise fall back to BOLT_DB.url
  const supa = (hasBoltApi() ? boltProjectBase() : (window.BOLT_DB && window.BOLT_DB.url)) || '';
  if (!supa) return '';
  // Base should be .../functions/v1 ; endpoints will append /content-api/...
  return `${supa.replace(/\/$/, '')}/functions/v1`;
}

function contentApiHeaders() {
  const h = { 'Content-Type': 'application/json' };
  const token = window.CURRENT_TOKEN || '';
  if (token) h.Authorization = `Bearer ${token}`;
  const apiKey = (window.BOLT_API && window.BOLT_API.apiKey) || (window.BOLT_DB && window.BOLT_DB.anonKey);
  if (apiKey) h.apikey = apiKey;
  return h;
}

function readQueryParam(name) {
  try {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  } catch { return null; }
}

async function newsSaveDraft({ brand_id, id, title, slug, content, excerpt, featured_image, status = 'draft', author_type: arg_author_type, author_id: arg_author_id }) {
  const base = contentApiBase();
  if (!base) throw new Error('content-api base URL ontbreekt');
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
  } catch {}
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
      tags: (body.tags && body.tags.join(',')) || null,
      author_type: body.author_type || null,
      author_id: body.author_id ? String(body.author_id).slice(0,6) + '…' : null,
      headers: masked
    });
  } catch {}

  const send = async (payload) => {
    let res; let data = null; let rawText = '';
    try {
      res = await fetch(url, { method: 'POST', headers: contentApiHeaders(), body: JSON.stringify(payload) });
    } catch (netErr) {
      console.warn('[newsSaveDraft] network error', netErr);
      throw netErr;
    }
    try { data = await res.json(); } catch { /* may not be JSON */ }
    if (!res.ok) {
      try { rawText = await res.text(); } catch {}
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
      try { window.websiteBuilder?.showNotification?.('Concept opgeslagen zonder tags (kolom ontbreekt in backend)', 'warning'); } catch {}
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
  } catch {}
  const res = await fetch(url, { method: 'POST', headers: contentApiHeaders(), body: JSON.stringify(body) });
  let data = null; try { data = await res.json(); } catch {}
  if (!res.ok) { const msg = (data && (data.error || data.message)) || `news publish failed: ${res.status}`; throw new Error(msg); }
  return data; // expect { id, slug, status: 'published', preview_url/public_url? }
}

async function newsList({ brand_id, status = 'published' }) {
  const base = contentApiBase();
  if (!base) throw new Error('content-api base URL ontbreekt');
  const u = `${base}/content-api/list?type=news_items&brand_id=${encodeURIComponent(brand_id)}&status=${encodeURIComponent(status)}`;
  const res = await fetch(u, { headers: contentApiHeaders() });
  let data = null; try { data = await res.json(); } catch {}
  if (!res.ok) { const msg = (data && (data.error || data.message)) || `news list failed: ${res.status}`; throw new Error(msg); }
  return data;
}

async function newsGetById({ id }) {
  const base = contentApiBase();
  if (!base) throw new Error('content-api base URL ontbreekt');
  const u = `${base}/content-api/${encodeURIComponent(id)}?type=news_items`;
  const res = await fetch(u, { headers: contentApiHeaders() });
  let data = null; try { data = await res.json(); } catch {}
  if (!res.ok) { const msg = (data && (data.error || data.message)) || `news get failed: ${res.status}`; throw new Error(msg); }
  return data;
}

async function newsGetBySlug({ brand_id, slug }) {
  const base = contentApiBase();
  if (!base) throw new Error('content-api base URL ontbreekt');
  const params = new URLSearchParams({ type: 'news_items', brand_id: brand_id || '', slug: slug || '' });
  const u = `${base}/content-api?${params.toString()}`;
  const res = await fetch(u, { headers: contentApiHeaders() });
  let data = null; try { data = await res.json(); } catch {}
  if (!res.ok) { const msg = (data && (data.error || data.message)) || `news getBySlug failed: ${res.status}`; throw new Error(msg); }
  return data;
}

async function newsDelete({ id }) {
  const base = contentApiBase();
  if (!base) throw new Error('content-api base URL ontbreekt');
  const u = `${base}/content-api/${encodeURIComponent(id)}?type=news_items`;
  const res = await fetch(u, { method: 'DELETE', headers: contentApiHeaders() });
  if (!res.ok) { let data = null; try { data = await res.json(); } catch {}; const msg = (data && (data.error || data.message)) || `news delete failed: ${res.status}`; throw new Error(msg); }
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
  } catch {}
  let res;
  try {
    res = await fetch(url, { method: 'POST', headers: contentApiHeaders(), body: JSON.stringify(body) });
  } catch (e) { console.warn('[destinationsSaveDraft] network error', e); throw e; }
  let data = null; try { data = await res.json(); } catch {}
  if (!res.ok) {
    let text = ''; try { text = await res.text(); } catch {}
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
