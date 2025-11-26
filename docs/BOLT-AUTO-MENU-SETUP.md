# BOLT: Automatische Menu Setup

## Probleem
Handmatige SQL queries per brand schalen niet met 100+ brands.

## Oplossing: Automatisch tijdens template import

### Optie 1: BOLT doet het direct bij import (AANBEVOLEN)

Wanneer BOLT een template importeert, zet meteen de juiste velden:

```javascript
// In BOLT's template import functie:
async function importTemplatePage(brandId, templatePage, index) {
  const pageData = {
    brand_id: brandId,
    title: templatePage.title,
    slug: generateSlug(templatePage.filename), // 'index.html' -> 'home'
    html: templatePage.html,
    description: templatePage.description || '',
    status: 'published',
    
    // ✅ AUTO-SETUP MENU:
    show_in_menu: isMainPage(templatePage.filename), // true voor home, about, tours, contact
    menu_order: calculateMenuOrder(templatePage.filename, index), // 1, 2, 3...
    
    created_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('pages')
    .insert(pageData)
    .select()
    .single();
    
  return data;
}

// Helper: Check of het een hoofdpagina is
function isMainPage(filename) {
  const mainPages = ['index', 'home', 'about', 'tour', 'contact', 'destination'];
  return mainPages.some(page => filename.toLowerCase().includes(page));
}

// Helper: Bereken menu volgorde
function calculateMenuOrder(filename, fallbackIndex) {
  const priorities = {
    'index': 1, 'home': 1,
    'about': 2,
    'tour': 3, 'tours': 3,
    'destination': 4, 'destinations': 4,
    'contact': 5,
    'blog': 6,
    'gallery': 7
  };
  
  for (const [keyword, order] of Object.entries(priorities)) {
    if (filename.toLowerCase().includes(keyword)) {
      return order;
    }
  }
  
  return 10 + fallbackIndex; // Fallback: 10, 11, 12...
}
```

### Optie 2: API Endpoint na import

Als BOLT niet direct de velden kan zetten, call deze API na het importeren:

**Endpoint:** `POST /api/pages/setup-menu`

**Request:**
```json
{
  "brand_id": "e9c1a630-2d8f-4594-9b4b-08e3e6e0d209"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu configured with 5 items",
  "menu_items": [
    { "id": "...", "title": "Home", "slug": "home", "menu_order": 1 },
    { "id": "...", "title": "About", "slug": "about", "menu_order": 2 },
    { "id": "...", "title": "Tours", "slug": "tour-grid", "menu_order": 3 },
    { "id": "...", "title": "Destinations", "slug": "destinations-1", "menu_order": 4 },
    { "id": "...", "title": "Contact", "slug": "contact", "menu_order": 5 }
  ]
}
```

**JavaScript voorbeeld:**
```javascript
// In BOLT, na template import:
async function setupMenuAfterImport(brandId) {
  const response = await fetch('https://www.ai-websitestudio.nl/api/pages/setup-menu', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ brand_id: brandId })
  });
  
  const result = await response.json();
  console.log('Menu setup:', result.message);
  return result.menu_items;
}

// Usage:
await importAllTemplatePages(brandId, templatePages);
await setupMenuAfterImport(brandId); // ✅ Menu automatisch geconfigureerd!
```

## Logica: Welke pagina's komen in het menu?

De API detecteert automatisch belangrijke pagina's op basis van slug:

| Keyword in slug | Menu Order | In Menu |
|----------------|-----------|---------|
| `home`, `index` | 1 | ✅ Yes |
| `about` | 2 | ✅ Yes |
| `tour`, `tours` | 3 | ✅ Yes |
| `destination` | 4 | ✅ Yes |
| `contact` | 5 | ✅ Yes |
| `blog` | 6 | ✅ Yes |
| `gallery` | 7 | ✅ Yes |
| Eerste 5 pagina's | 10+ | ✅ Yes (fallback) |
| Rest | 99 | ❌ No |

## Testing

1. Import een template via BOLT
2. Call `/api/pages/setup-menu` met brand_id
3. Check database:
```sql
SELECT title, slug, menu_order, show_in_menu
FROM pages
WHERE brand_id = 'YOUR_BRAND_ID'
  AND show_in_menu = true
ORDER BY menu_order ASC;
```

## Voordelen

✅ **Schaalt automatisch** naar 1000+ brands  
✅ **Geen handmatige SQL** meer nodig  
✅ **Consistente menu's** voor alle brands  
✅ **Flexibel**: BOLT kan menu_order aanpassen via UI  

## File Locations

- API: `/api/pages/setup-menu.js`
- Docs: `/docs/BOLT-AUTO-MENU-SETUP.md`
