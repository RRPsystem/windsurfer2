/**
 * Dynamic Menu Widget for GoWild Template
 * Automatically generates menu from Supabase pages table
 * 
 * Usage: Add this script to the end of <body> tag
 * <script src="https://www.ai-websitestudio.nl/widgets/dynamic-menu.js"></script>
 */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        supabaseUrl: 'https://huaaogdxxdcakxryecnw.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YWFvZ2R4eGRjYWt4cnllY253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDY2OTAsImV4cCI6MjA3OTI2NjY5MH0.ygqwQNOpbJqe9NHtlxLCIlmVk2j5Mkcw4qvMpkGyeY0'
    };
    
    /**
     * Get brand ID from meta tag or data attribute
     */
    function getBrandId() {
        // Check meta tag
        const metaTag = document.querySelector('meta[name="brand-id"]');
        if (metaTag) return metaTag.content;
        
        // Check body data attribute
        const bodyBrandId = document.body.dataset.brandId;
        if (bodyBrandId) return bodyBrandId;
        
        // Check URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const paramBrandId = urlParams.get('brand_id');
        if (paramBrandId) return paramBrandId;
        
        console.warn('⚠️ Dynamic Menu: No brand_id found. Add <meta name="brand-id" content="YOUR_BRAND_ID"> to <head>');
        return null;
    }
    
    /**
     * Fetch pages from Supabase
     */
    async function fetchPages(brandId) {
        try {
            const response = await fetch(
                `${CONFIG.supabaseUrl}/rest/v1/pages?brand_id=eq.${brandId}&show_in_menu=eq.true&order=menu_order.asc`,
                {
                    headers: {
                        'apikey': CONFIG.anonKey,
                        'Authorization': `Bearer ${CONFIG.anonKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const pages = await response.json();
            console.log('✅ Dynamic Menu: Loaded', pages.length, 'pages');
            return pages;
        } catch (error) {
            console.error('❌ Dynamic Menu: Failed to fetch pages', error);
            return [];
        }
    }
    
    /**
     * Build menu HTML
     */
    function buildMenuHTML(pages) {
        return pages.map(page => {
            const isActive = window.location.pathname === page.slug || 
                           (page.slug === '/' && window.location.pathname === '/index.html');
            
            return `
                <li class="menu-item ${isActive ? 'active' : ''}">
                    <a href="${page.slug}">${page.title}</a>
                </li>
            `;
        }).join('');
    }
    
    /**
     * Update menu in DOM
     */
    function updateMenu(pages) {
        // Find main menu container
        const menuContainer = document.querySelector('.main-menu > ul');
        
        if (!menuContainer) {
            console.warn('⚠️ Dynamic Menu: Menu container (.main-menu > ul) not found');
            return;
        }
        
        // Build and inject new menu
        const menuHTML = buildMenuHTML(pages);
        menuContainer.innerHTML = menuHTML;
        
        console.log('✅ Dynamic Menu: Updated with', pages.length, 'items');
    }
    
    /**
     * Initialize dynamic menu
     */
    async function initDynamicMenu() {
        console.log('🔄 Dynamic Menu: Initializing...');
        
        // Get brand ID
        const brandId = getBrandId();
        if (!brandId) {
            console.error('❌ Dynamic Menu: Cannot initialize without brand_id');
            return;
        }
        
        console.log('🔑 Dynamic Menu: Using brand_id:', brandId);
        
        // Fetch pages
        const pages = await fetchPages(brandId);
        
        if (pages.length === 0) {
            console.warn('⚠️ Dynamic Menu: No pages found for brand');
            return;
        }
        
        // Update menu
        updateMenu(pages);
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDynamicMenu);
    } else {
        initDynamicMenu();
    }
    
})();
