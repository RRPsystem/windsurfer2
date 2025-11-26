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

    // Extract brand slug from subdomain or query param
    const host = req.headers.host || '';
    const brandSlugFromSubdomain = host.split('.')[0]; // e.g., "testbrand" from "testbrand.ai-travelstudio.nl"
    const brandSlug = req.query.brand || brandSlugFromSubdomain;

    console.log('[page-api] Loading page:', slug, 'for brand:', brandSlug);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get brand first
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('slug', brandSlug)
      .single();

    if (brandError || !brand) {
      console.error('[page-api] Brand not found:', brandSlug);
      // Fallback: try to get page by slug only (for backward compatibility)
      const { data: page, error } = await supabase
        .from('pages')
        .select('id, brand_id, title, slug, body_html, status, description, analytics_id, template_category')
        .eq('slug', slug)
        .single();
      
      if (error || !page) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html>
            <head><title>Page Not Found</title></head>
            <body>
              <h1>404 - Page Not Found</h1>
              <p>Brand "${brandSlug}" or page "${slug}" not found.</p>
            </body>
          </html>
        `);
      }
      
      // Continue with page found
      console.log('[page-api] Page found (fallback):', page.title);
      const { data: menuItems } = await supabase
        .from('pages')
        .select('id, title, slug, menu_order')
        .eq('brand_id', page.brand_id)
        .eq('show_in_menu', true)
        .eq('status', 'published')
        .order('menu_order', { ascending: true });
      
      const html = buildHTML(page, menuItems || [], supabaseUrl, slug);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      return res.status(200).send(html);
    }

    // Get page from database for this brand
    const { data: page, error } = await supabase
      .from('pages')
      .select('id, brand_id, title, slug, body_html, status, description, analytics_id, template_category')
      .eq('slug', slug)
      .eq('brand_id', brand.id)
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

    // Get menu items for this brand
    const { data: menuItems } = await supabase
      .from('pages')
      .select('id, title, slug, menu_order')
      .eq('brand_id', page.brand_id)
      .eq('show_in_menu', true)
      .eq('status', 'published')
      .order('menu_order', { ascending: true });

    // Build HTML with dynamic menu
    const html = buildHTML(page, menuItems || [], supabaseUrl, slug);

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

function buildHTML(page, menuItems, supabaseUrl, currentSlug) {
  // Generate menu HTML with relative URLs (works on any domain)
  const menuHTML = menuItems.map(item => {
    const isActive = item.slug === currentSlug ? 'active' : '';
    return `<li class="menu-item ${isActive}"><a href="/${item.slug}">${escapeHtml(item.title)}</a></li>`;
  }).join('');

  // Use template_category from page, fallback to tripex
  const templateCategory = page.template_category === 'general' ? 'gowild' : (page.template_category || 'tripex');
  const templateBase = `/templates/${templateCategory}`;

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(page.description || '')}">
  <meta name="brand-id" content="${escapeHtml(page.brand_id || '')}">
  <title>${escapeHtml(page.title || 'Pagina')}</title>
  
  <!-- Favicon -->
  <link rel="shortcut icon" href="${templateBase}/assets/images/favicon.ico" type="image/png">
  
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- Template CSS -->
  <link rel="stylesheet" href="${templateBase}/assets/fonts/flaticon/flaticon_gowilds.css">
  <link rel="stylesheet" href="${templateBase}/assets/fonts/fontawesome/css/all.min.css">
  <link rel="stylesheet" href="${templateBase}/assets/vendor/bootstrap/css/bootstrap.min.css">
  <link rel="stylesheet" href="${templateBase}/assets/vendor/magnific-popup/dist/magnific-popup.css">
  <link rel="stylesheet" href="${templateBase}/assets/vendor/slick/slick.css">
  <link rel="stylesheet" href="${templateBase}/assets/vendor/jquery-ui/jquery-ui.min.css">
  <link rel="stylesheet" href="${templateBase}/assets/vendor/nice-select/css/nice-select.css">
  <link rel="stylesheet" href="${templateBase}/assets/vendor/animate.css">
  <link rel="stylesheet" href="${templateBase}/assets/css/default.css">
  <link rel="stylesheet" href="${templateBase}/assets/css/style.css">
  
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
  ${page.body_html || '<p>Geen content beschikbaar</p>'}
  
  <!-- Dynamic Menu Injection -->
  <script>
  (function() {
    'use strict';
    
    // Dynamic menu items from database
    const menuHTML = \`${menuHTML}\`;
    
    // Replace hardcoded menu with dynamic menu
    function injectDynamicMenu() {
      const menuNav = document.querySelector('.main-menu nav ul, .main-menu ul, nav.main-menu ul');
      if (menuNav && menuHTML) {
        menuNav.innerHTML = menuHTML;
        console.log('✅ Dynamic menu injected');
      } else {
        console.warn('⚠️ Menu navigation not found');
      }
    }
    
    // Run after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectDynamicMenu);
    } else {
      injectDynamicMenu();
    }
  })();
  </script>
  
  <!-- Template JavaScript -->
  <script src="${templateBase}/assets/vendor/jquery-3.6.0.min.js"></script>
  <script src="${templateBase}/assets/vendor/popper/popper.min.js"></script>
  <script src="${templateBase}/assets/vendor/bootstrap/js/bootstrap.min.js"></script>
  <script src="${templateBase}/assets/vendor/slick/slick.min.js"></script>
  <script src="${templateBase}/assets/vendor/magnific-popup/dist/jquery.magnific-popup.min.js"></script>
  <script src="${templateBase}/assets/vendor/jquery.counterup.min.js"></script>
  <script src="${templateBase}/assets/vendor/jquery.waypoints.js"></script>
  <script src="${templateBase}/assets/vendor/nice-select/js/jquery.nice-select.min.js"></script>
  <script src="${templateBase}/assets/vendor/jquery-ui/jquery-ui.min.js"></script>
  <script src="${templateBase}/assets/vendor/wow.min.js"></script>
  <script src="${templateBase}/assets/js/theme.js"></script>
  
  <!-- Universal Slider Init -->
  <script src="/widgets/slider-init-universal.js"></script>
  
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
