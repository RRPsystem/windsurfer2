// api/pages/[brandSlug]/[pageSlug].js
// Serverless viewer that serves published HTML by brandSlug/pageSlug
// Requires Vercel env vars: VITE_BOLT_DB_URL, VITE_BOLT_DB_ANON_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export default async function handler(req, res) {
  try {
    const { brandSlug, pageSlug } = req.query || {};
    if (!brandSlug || !pageSlug) return res.status(400).json({ error: 'Missing slugs' });

    const url = process.env.VITE_BOLT_DB_URL;
    const anon = process.env.VITE_BOLT_DB_ANON_KEY;
    if (!url || !anon) return res.status(500).json({ error: 'DB env vars missing' });

    const db = createClient(url, anon);

    // 1) Resolve brand_id by brandSlug
    const { data: brand, error: brandErr } = await db
      .from('brands')
      .select('id')
      .eq('slug', brandSlug)
      .single();
    if (brandErr || !brand) return res.status(404).send('Brand niet gevonden');

    // 2) Fetch published page
    const { data: page, error: pageErr } = await db
      .from('pages')
      .select('html_published')
      .eq('brand_id', brand.id)
      .eq('slug', pageSlug)
      .eq('status', 'published')
      .single();
    if (pageErr || !page) return res.status(404).send('Pagina niet gevonden');

    // 3) Serve HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).send(page.html_published || '<h1>Leeg</h1>');
  } catch (e) {
    console.error(e);
    return res.status(500).send('Serverfout');
  }
}
