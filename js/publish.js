// js/publish.js

// If Bolt.new API base is provided, publish via Bolt.new; otherwise fallback to Supabase tables/RPC.
function hasBoltApi() {
  return !!(window.BOLT_API && window.BOLT_API.baseUrl);
}

async function saveDraftBolt({ brand_id, title, slug, content_json }) {
  const base = window.BOLT_API.baseUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/api/pages/saveDraft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(window.CURRENT_TOKEN ? { Authorization: `Bearer ${window.CURRENT_TOKEN}` } : {})
    },
    body: JSON.stringify({ brand_id, title, slug, content_json, html_snapshot: content_json?.htmlSnapshot || '' })
  });
  if (!res.ok) throw new Error(`saveDraft failed: ${res.status}`);
  return await res.json(); // expect { id/page_id, slug, ... }
}

async function publishPageBolt(pageId, htmlString) {
  const base = window.BOLT_API.baseUrl.replace(/\/$/, '');
  const res = await fetch(`${base}/api/pages/${encodeURIComponent(pageId)}/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(window.CURRENT_TOKEN ? { Authorization: `Bearer ${window.CURRENT_TOKEN}` } : {})
    },
    body: JSON.stringify({ body_html: htmlString })
  });
  if (!res.ok) throw new Error(`publish failed: ${res.status}`);
  return await res.json();
}

async function saveDraftSupabase({ brand_id, title, slug, content_json }) {
  const { data, error } = await window.db
    .from('pages')
    .upsert(
      { brand_id, title, slug, content_json, status: 'draft' },
      { onConflict: 'brand_id,slug' }
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
