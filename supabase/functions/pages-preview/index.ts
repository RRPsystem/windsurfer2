// Supabase Edge Function: pages-preview
// Serves pages with INLINE CSS for perfect rendering in iframes

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// INLINE CSS - Copy from your styles folder
const INLINE_CSS = `
/* Paste your main.css content here */
/* Paste your components.css content here */

/* Or load from Supabase Storage once and cache */
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pageId = url.searchParams.get('id');
    const slug = url.searchParams.get('slug');

    if (!pageId && !slug) {
      return new Response('Missing page id or slug', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get page from database
    let query = supabase.from('pages').select('*');
    
    if (pageId) {
      query = query.eq('id', pageId);
    } else {
      query = query.eq('slug', slug);
    }
    
    const { data: page, error } = await query.single();

    if (error || !page) {
      return new Response('Page not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Get CSS from Supabase Storage (cached)
    let css = INLINE_CSS;
    
    if (!css || css.trim() === '') {
      try {
        const mainCSSUrl = `${supabaseUrl}/storage/v1/object/public/assets/styles/main.css`;
        const componentsCSSUrl = `${supabaseUrl}/storage/v1/object/public/assets/styles/components.css`;
        
        const [mainRes, compRes] = await Promise.all([
          fetch(mainCSSUrl),
          fetch(componentsCSSUrl)
        ]);
        
        const mainCSS = mainRes.ok ? await mainRes.text() : '';
        const componentsCSS = compRes.ok ? await compRes.text() : '';
        
        css = mainCSS + '\n\n' + componentsCSS;
      } catch (e) {
        console.error('Failed to load CSS:', e);
      }
    }

    // Build HTML with inline CSS
    const html = buildHTMLWithInlineCSS(page, css);

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300' // 5 min cache
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: corsHeaders
    });
  }
});

function buildHTMLWithInlineCSS(page: any, css: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(page.description || '')}">
  <title>${escapeHtml(page.title || 'Pagina')}</title>
  
  <!-- Favicon -->
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='18' ry='18' fill='%234CAF50'/%3E%3Ctext x='50' y='62' font-size='60' text-anchor='middle' fill='white'%3EW%3C/text%3E%3C/svg%3E">
  
  <!-- CDN Resources -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  
  <!-- INLINE CSS for iframe compatibility -->
  <style>
${css}
  </style>
  
  <style>
    /* Ensure proper rendering in iframe */
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      height: auto !important; /* Allow content to expand */
      overflow-x: hidden;
      overflow-y: auto !important; /* Enable vertical scroll */
    }
    
    body {
      background: #fff;
    }
    
    /* Full-width hero sections */
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
${page.html || page.content || '<p>Geen content beschikbaar</p>'}

<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
