// js/publish.js

// If Bolt.new API base is provided, publish via Bolt.new Functions endpoints; otherwise fallback to Supabase.
function hasBoltApi() {
  return !!(window.BOLT_API && window.BOLT_API.baseUrl);
}

function boltFunctionsBase() {
  if (!hasBoltApi()) return null;
  const base = window.BOLT_API.baseUrl.replace(/\/$/, '');
  try {
    const u = new URL(base);
    // If given project base like xxxx.supabase.co, convert to functions domain
    if (u.hostname.endsWith('.supabase.co') && !u.hostname.includes('.functions.')) {
      const fnHost = u.hostname.replace('.supabase.co', '.functions.supabase.co');
      return `${u.protocol}//${fnHost}`;
    }
    return `${u.protocol}//${u.hostname}`;
  } catch {
    return base;
  }
}

// expose for other modules (e.g., layoutsBuilder.js)
try { window.boltFunctionsBase = boltFunctionsBase; } catch {}

function boltProjectBase() {
  if (!hasBoltApi()) return null;
  return window.BOLT_API.baseUrl.replace(/\/$/, '');
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

async function saveDraftBolt({ brand_id, page_id, title, slug, content_json }) {
  const base = boltProjectBase();
  const payload = { brand_id, title, slug, content_json };
  if (page_id) payload.page_id = page_id;
  const res = await fetch(`${base}/functions/v1/pages-api/saveDraft`, {
    method: 'POST',
    headers: boltHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`saveDraft failed: ${res.status}`);
  const data = await res.json();
  // Normalize for callers
  return { id: data.page_id || data.id, slug: data.slug, version: data.version, _raw: data };
}

async function publishPageBolt(pageId, htmlString) {
  const base = boltProjectBase();
  const res = await fetch(`${base}/functions/v1/pages-api/${encodeURIComponent(pageId)}/publish`, {
    method: 'POST',
    headers: boltHeaders(),
    body: JSON.stringify({ body_html: htmlString })
  });
  if (!res.ok) throw new Error(`publish failed: ${res.status}`);
  return await res.json(); // { ok: true, url }
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
    const res = await fetch(`${base}/header/saveDraft`, {
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
    const res = await fetch(`${base}/header/publish`, {
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
    const res = await fetch(`${base}/footer/saveDraft`, {
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
    const res = await fetch(`${base}/footer/publish`, {
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
    const res = await fetch(`${base}/menu/saveDraft`, {
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
    const res = await fetch(`${base}/menu/publish`, {
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
