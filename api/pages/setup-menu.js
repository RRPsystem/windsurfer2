// API: Setup menu for a brand's pages
// POST /api/pages/setup-menu
// Body: { brand_id: "uuid" }

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brand_id } = req.body;

    if (!brand_id) {
      return res.status(400).json({ error: 'brand_id is required' });
    }

    console.log('[setup-menu] Setting up menu for brand:', brand_id);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all pages for this brand
    const { data: pages, error: fetchError } = await supabase
      .from('pages')
      .select('id, title, slug, created_at')
      .eq('brand_id', brand_id)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('[setup-menu] Fetch error:', fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    if (!pages || pages.length === 0) {
      return res.status(404).json({ error: 'No pages found for this brand' });
    }

    console.log('[setup-menu] Found', pages.length, 'pages');

    // Auto-detect important pages and assign menu order
    const menuPriority = {
      home: 1,
      index: 1,
      about: 2,
      'about-us': 2,
      tour: 3,
      tours: 3,
      'tour-grid': 3,
      destination: 4,
      destinations: 4,
      'destinations-1': 4,
      contact: 5,
      blog: 6,
      gallery: 7
    };

    const updates = pages.map((page, index) => {
      // Find matching priority
      let order = 99; // Default low priority
      let showInMenu = false;

      for (const [keyword, priority] of Object.entries(menuPriority)) {
        if (page.slug.toLowerCase().includes(keyword)) {
          order = priority;
          showInMenu = true;
          break;
        }
      }

      // If still no match, check first 5 pages
      if (!showInMenu && index < 5) {
        showInMenu = true;
        order = 10 + index;
      }

      return {
        id: page.id,
        show_in_menu: showInMenu,
        menu_order: order,
        status: 'published'
      };
    });

    // Filter only pages that should be in menu
    const menuPages = updates.filter(u => u.show_in_menu);

    console.log('[setup-menu] Updating', menuPages.length, 'menu items');

    // Update each page
    const updatePromises = menuPages.map(update => 
      supabase
        .from('pages')
        .update({
          show_in_menu: update.show_in_menu,
          menu_order: update.menu_order,
          status: update.status
        })
        .eq('id', update.id)
    );

    const results = await Promise.all(updatePromises);

    // Check for errors
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('[setup-menu] Update errors:', errors);
      return res.status(500).json({ 
        error: 'Some updates failed', 
        details: errors 
      });
    }

    // Return updated pages
    const { data: updatedPages } = await supabase
      .from('pages')
      .select('id, title, slug, menu_order, show_in_menu, status')
      .eq('brand_id', brand_id)
      .eq('show_in_menu', true)
      .order('menu_order', { ascending: true });

    console.log('[setup-menu] Success:', updatedPages.length, 'menu items configured');

    return res.status(200).json({
      success: true,
      message: `Menu configured with ${updatedPages.length} items`,
      menu_items: updatedPages
    });

  } catch (error) {
    console.error('[setup-menu] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
