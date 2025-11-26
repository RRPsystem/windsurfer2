// Vercel API: Serve single page by slug (simple route)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://huaaogdxxdcakxryecnw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ error: 'Slug is required' });
    }

    console.log('[page-api] Loading page:', slug);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get page from database
    const { data: page, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !page) {
      console.error('[page-api] Page not found:', slug, error);
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Page Not Found</title></head>
          <body>
            <h1>404 - Page Not Found</h1>
            <p>Page with slug "${slug}" does not exist.</p>
          </body>
        </html>
      `);
    }

    console.log('[page-api] Page found:', page.title);

    // Build HTML
    const html = buildHTML(page, supabaseUrl);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(html);

  } catch (error) {
    console.error('[page-api] Error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>500 - Internal Server Error</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
}

function buildHTML(page, supabaseUrl) {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(page.description || '')}">
  <meta name="brand-id" content="${escapeHtml(page.brand_id || '')}">
  <title>${escapeHtml(page.title || 'Pagina')}</title>
  
  <!-- Favicon -->
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='18' ry='18' fill='%234CAF50'/%3E%3Ctext x='50' y='62' font-size='60' text-anchor='middle' fill='white'%3EW%3C/text%3E%3C/svg%3E">
  
  <!-- CSS from Supabase Storage -->
  <link rel="stylesheet" href="${supabaseUrl}/storage/v1/object/public/assets/styles/main.css">
  <link rel="stylesheet" href="${supabaseUrl}/storage/v1/object/public/assets/styles/components.css">
  
  <!-- CDN Resources -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  
  <!-- Mapbox GL JS -->
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css" rel="stylesheet">
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js"></script>
  
  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  
  <!-- Travel Search Widget -->
  <script src="/widgets/travel-search.js"></script>
  
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      height: auto !important;
      overflow-x: hidden;
      overflow-y: auto !important;
    }
    
    body {
      background: #fff;
    }
    
    .wb-travel-hero,
    .wb-hero-banner,
    .wb-hero-cta {
      width: 100% !important;
      max-width: 100% !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
  </style>
</head>
<body>
  <!-- Page Content -->
  ${page.html || '<p>Geen content beschikbaar</p>'}
  
  ${page.analytics_id ? `
  <script async src="https://www.googletagmanager.com/gtag/js?id=${page.analytics_id}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${page.analytics_id}');
  </script>
  ` : ''}
</body>
</html>`;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}
