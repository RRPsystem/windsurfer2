// Supabase Edge Function: site-renderer
// Renders complete website with menu, footer, and inline CSS on custom domain

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    // Get site ID from subdomain or query param
    const host = req.headers.get('host') || '';
    const siteId = url.searchParams.get('site') || extractSiteFromHost(host);
    
    if (!siteId) {
      return new Response('Site not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get site configuration
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single();

    if (siteError || !site) {
      return new Response('Site not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Get page by pathname (or home page if root)
    const slug = pathname === '/' ? 'home' : pathname.replace(/^\//, '').replace(/\/$/, '');
    
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('*')
      .eq('site_id', siteId)
      .eq('slug', slug)
      .single();

    if (pageError || !page) {
      return new Response('Page not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Get menu and footer
    const { data: menu } = await supabase
      .from('menus')
      .select('*')
      .eq('site_id', siteId)
      .eq('key', 'main')
      .single();

    const { data: footer } = await supabase
      .from('menus')
      .select('*')
      .eq('site_id', siteId)
      .eq('key', 'footer')
      .single();

    // Get CSS from Supabase Storage
    const css = await loadCSS(supabaseUrl);

    // Build complete HTML
    const html = buildCompleteHTML(page, site, menu, footer, css);

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

function extractSiteFromHost(host: string): string {
  // Extract site ID from subdomain or custom domain
  // Example: site123.supabase.co -> site123
  // Example: reizen.nl -> lookup in database
  const parts = host.split('.');
  return parts[0];
}

async function loadCSS(supabaseUrl: string): Promise<string> {
  try {
    const mainCSSUrl = `${supabaseUrl}/storage/v1/object/public/assets/styles/main.css`;
    const componentsCSSUrl = `${supabaseUrl}/storage/v1/object/public/assets/styles/components.css`;
    
    const [mainRes, compRes] = await Promise.all([
      fetch(mainCSSUrl),
      fetch(componentsCSSUrl)
    ]);
    
    const mainCSS = mainRes.ok ? await mainRes.text() : '';
    const componentsCSS = compRes.ok ? await compRes.text() : '';
    
    return mainCSS + '\n\n' + componentsCSS;
  } catch (e) {
    console.error('Failed to load CSS:', e);
    return '';
  }
}

function buildCompleteHTML(
  page: any,
  site: any,
  menu: any,
  footer: any,
  css: string
): string {
  // Build menu HTML
  const menuHTML = menu ? buildMenuHTML(menu.items || []) : '';
  
  // Build footer HTML
  const footerHTML = footer ? buildFooterHTML(footer.items || []) : '';
  
  // Get brand colors
  const brandColors = site.brand_colors || {
    primary: '#4CAF50',
    secondary: '#2196F3',
    accent: '#FF9800'
  };

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(page.description || '')}">
  <title>${escapeHtml(page.title || 'Pagina')}</title>
  
  <!-- Favicon -->
  <link rel="icon" href="${site.favicon || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' rx=\'18\' ry=\'18\' fill=\'%234CAF50\'/%3E%3Ctext x=\'50\' y=\'62\' font-size=\'60\' text-anchor=\'middle\' fill=\'white\'%3EW%3C/text%3E%3C/svg%3E'}">
  
  <!-- CDN Resources -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  
  <!-- Inline CSS -->
  <style>
/* Brand Colors */
:root {
  --brand-primary: ${brandColors.primary};
  --brand-secondary: ${brandColors.secondary};
  --brand-accent: ${brandColors.accent};
}

${css}

/* Site Specific Styles */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
}

body {
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* Full-width sections */
.wb-travel-hero,
.wb-hero-banner,
.wb-hero-cta {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* Header Styles */
.site-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.site-header .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-logo {
  font-size: 24px;
  font-weight: 700;
  color: var(--brand-primary);
  text-decoration: none;
}

.site-nav {
  display: flex;
  gap: 32px;
  align-items: center;
}

.site-nav a {
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.site-nav a:hover {
  color: var(--brand-primary);
}

/* Footer Styles */
.site-footer {
  background: #1f2937;
  color: white;
  padding: 48px 0 24px;
  margin-top: 80px;
}

.site-footer .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section h3 {
  margin-bottom: 16px;
  color: var(--brand-primary);
}

.footer-section a {
  color: #d1d5db;
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
  transition: color 0.2s;
}

.footer-section a:hover {
  color: white;
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding-top: 24px;
  text-align: center;
  color: #9ca3af;
}

/* Main Content */
.site-main {
  min-height: 60vh;
}
  </style>
</head>
<body>
  <!-- Header -->
  <header class="site-header">
    <div class="container">
      <a href="/" class="site-logo">${site.name || 'Website'}</a>
      <nav class="site-nav">
        ${menuHTML}
      </nav>
    </div>
  </header>

  <!-- Main Content -->
  <main class="site-main">
    ${page.html || page.content || '<p>Geen content beschikbaar</p>'}
  </main>

  <!-- Footer -->
  <footer class="site-footer">
    <div class="container">
      <div class="footer-content">
        ${footerHTML}
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${site.name || 'Website'}. Alle rechten voorbehouden.</p>
      </div>
    </div>
  </footer>

  <!-- Scripts -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</body>
</html>`;
}

function buildMenuHTML(items: any[]): string {
  return items.map(item => {
    if (item.children && item.children.length > 0) {
      // Dropdown menu
      return `
        <div class="dropdown">
          <a href="${item.href || '#'}">${escapeHtml(item.label)}</a>
          <div class="dropdown-menu">
            ${item.children.map((child: any) => 
              `<a href="${child.href || '#'}">${escapeHtml(child.label)}</a>`
            ).join('')}
          </div>
        </div>
      `;
    }
    return `<a href="${item.href || '#'}">${escapeHtml(item.label)}</a>`;
  }).join('');
}

function buildFooterHTML(items: any[]): string {
  // Group items by section
  const sections: { [key: string]: any[] } = {};
  
  items.forEach(item => {
    const section = item.section || 'Links';
    if (!sections[section]) sections[section] = [];
    sections[section].push(item);
  });
  
  return Object.entries(sections).map(([title, sectionItems]) => `
    <div class="footer-section">
      <h3>${escapeHtml(title)}</h3>
      ${sectionItems.map(item => 
        `<a href="${item.href || '#'}">${escapeHtml(item.label)}</a>`
      ).join('')}
    </div>
  `).join('');
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
