# BOLT Dynamic Menu Generator

## Probleem
Na template import staan er nog steeds hardcoded links in het menu (`index.html`, `about.html`, etc.) in plaats van dynamische links naar de database pagina's.

## Oplossing

### 1. Database Query voor Menu Items
Haal pagina's op die in het menu moeten staan:

```sql
SELECT 
  id,
  title,
  slug,
  menu_order,
  parent_id,
  show_in_menu
FROM pages
WHERE brand_id = 'BRAND_ID'
  AND show_in_menu = true
  AND status = 'published'
ORDER BY menu_order ASC, title ASC;
```

### 2. Menu HTML Generator Script

Voeg dit JavaScript toe in de website viewer **na het laden van de template HTML**:

```javascript
<script>
// Dynamic Menu Generator for BOLT websites
(function() {
    'use strict';
    
    // Menu items from database (injected server-side)
    const menuItems = [
        { title: 'Home', slug: 'home', order: 1 },
        { title: 'About', slug: 'about', order: 2 },
        { title: 'Tours', slug: 'tour-grid', order: 3 },
        { title: 'Contact', slug: 'contact', order: 4 }
    ];
    
    // Base URL for pages
    const baseUrl = '/api/page/';
    
    // Generate menu HTML
    function generateMenuHTML(items) {
        return items.map(item => {
            const url = baseUrl + item.slug;
            const isActive = window.location.pathname.includes(item.slug) ? 'active' : '';
            return `<li class="menu-item ${isActive}"><a href="${url}">${item.title}</a></li>`;
        }).join('');
    }
    
    // Find and replace menu
    function replaceMenu() {
        const menuNav = document.querySelector('.main-menu nav ul');
        if (menuNav) {
            // Keep the first <li> if it's the logo/home
            const firstItem = menuNav.querySelector('li:first-child');
            const keepFirstItem = firstItem && firstItem.querySelector('img, .brand-logo');
            
            // Generate new menu
            const newMenuHTML = generateMenuHTML(menuItems);
            
            // Replace menu content
            if (keepFirstItem) {
                menuNav.innerHTML = firstItem.outerHTML + newMenuHTML;
            } else {
                menuNav.innerHTML = newMenuHTML;
            }
            
            console.log('✅ Dynamic menu loaded');
        } else {
            console.warn('⚠️ Menu nav not found');
        }
    }
    
    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', replaceMenu);
    } else {
        replaceMenu();
    }
})();
</script>
```

### 3. Server-Side Implementation (pages-api/page-api)

In de Edge Function of Vercel API die de pagina serveert, inject het menu dynamisch:

```typescript
// Fetch menu items from database
const { data: menuItems } = await supabase
  .from('pages')
  .select('id, title, slug, menu_order')
  .eq('brand_id', page.brand_id)
  .eq('show_in_menu', true)
  .eq('status', 'published')
  .order('menu_order', { ascending: true });

// Generate menu HTML
const menuHTML = menuItems.map(item => 
  `<li class="menu-item"><a href="/api/page/${item.slug}">${item.title}</a></li>`
).join('');

// Replace hardcoded menu in template HTML
let html = page.html;

// Find menu nav and replace content
const menuRegex = /<nav class="main-menu">[\s\S]*?<ul>([\s\S]*?)<\/ul>[\s\S]*?<\/nav>/;
html = html.replace(menuRegex, (match) => {
  return match.replace(/<ul>[\s\S]*?<\/ul>/, `<ul>${menuHTML}</ul>`);
});
```

### 4. Alternatief: Client-Side met Fetch

Als server-side te complex is, fetch menu items via API:

```javascript
<script>
(async function() {
    'use strict';
    
    // Get brand_id from meta tag
    const brandId = document.querySelector('meta[name="brand-id"]')?.content;
    if (!brandId) return;
    
    // Fetch menu items
    const apiUrl = `https://huaaogdxxdcakxryecnw.supabase.co/rest/v1/pages?brand_id=eq.${brandId}&show_in_menu=eq.true&status=eq.published&order=menu_order.asc&select=id,title,slug,menu_order`;
    
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'apikey': 'YOUR_ANON_KEY',
                'Content-Type': 'application/json'
            }
        });
        
        const menuItems = await response.json();
        
        // Generate menu HTML
        const menuHTML = menuItems.map(item => 
            `<li class="menu-item"><a href="/api/page/${item.slug}">${item.title}</a></li>`
        ).join('');
        
        // Replace menu
        const menuNav = document.querySelector('.main-menu nav ul');
        if (menuNav) {
            menuNav.innerHTML = menuHTML;
            console.log('✅ Dynamic menu loaded:', menuItems.length, 'items');
        }
    } catch (error) {
        console.error('❌ Failed to load menu:', error);
    }
})();
</script>
```

## Best Practice: URL Structure

**Kies een consistente URL structuur:**

### Optie A: API Route (huidige)
- `https://example.com/api/page/tour-grid`
- `https://example.com/api/page/about`

### Optie B: Clean URLs (met vercel.json rewrite)
- `https://example.com/tour-grid`
- `https://example.com/about`

**Vercel.json rewrite voor Optie B:**
```json
{
  "rewrites": [
    {
      "source": "/:slug",
      "destination": "/api/page/:slug"
    }
  ]
}
```

## Testen

1. Import een template in BOLT
2. Zet `show_in_menu = true` voor relevante pagina's
3. Stel `menu_order` in (1, 2, 3, etc.)
4. Laad de website → menu toont database pagina's!

## Styling

Het gegenereerde menu gebruikt de **bestaande CSS classes** van de template:
- `.menu-item` → Menu item container
- `.main-menu` → Main navigation
- `.sub-menu` → Dropdown menu (voor later)

Dus de styling blijft intact! ✅
