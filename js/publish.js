// js/publish.js

async function saveDraft({ brand_id, title, slug, content_json }) {
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

async function publishPage(pageId, htmlString) {
  const { error } = await window.db.rpc('publish_page', {
    p_page_id: pageId,
    p_html: htmlString
  });
  if (error) throw error;
}

window.BuilderPublishAPI = { saveDraft, publishPage };
