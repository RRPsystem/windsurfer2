# BOLT Content Integratie - Destinations & Blog

## 📋 Overzicht

De Template Editor kan nu **bestaande content** (destinations, nieuws) tonen in template styling. Dit werkt via dynamic wrapper pages die content laden uit de `pages` tabel.

## ✅ Wat is Live

### API Endpoints
- `/api/content/destinations` - Haalt destinations op
- `/api/content/news` - Haalt nieuws/blog posts op

### Gotur Wrapper Pages
- `destinations-dynamic.html` - Destinations grid
- `destination-detail-dynamic.html` - Destination detail
- `blog-dynamic.html` - Blog/nieuws grid
- `blog-detail-dynamic.html` - Blog detail

## 🔗 URL Structuur

```
https://www.ai-websitestudio.nl/templates/gotur/gotur-html-main/destinations-dynamic.html?brand_id=BRAND_ID

https://www.ai-websitestudio.nl/templates/gotur/gotur-html-main/blog-dynamic.html?brand_id=BRAND_ID
```

## 🎯 Hoe het Werkt

### Flow

```
1. User opent template website
   ↓
2. Klikt "Bestemmingen" of "Nieuws" in menu
   ↓
3. Wrapper page laadt content via API
   ↓
4. API haalt pages uit Supabase
   ↓
5. Filtert op type (destination/news)
   ↓
6. Transformeert naar template format
   ↓
7. Toont in Gotur styling ✨
```

### Content Detectie

API herkent content types op basis van:

**Destinations:**
- Slug pattern: `destination-*`
- Title keyword: "bestemming"
- Metadata: `page.metadata.type = 'destination'`

**News/Blog:**
- Slug pattern: `news-*` of `blog-*`
- Title keyword: "nieuws" of "blog"
- Metadata: `page.metadata.type = 'news'` of `'blog'`

## 💾 Database Aanpassingen (Optioneel)

### Metadata Kolom Toevoegen

Voor betere content detectie, voeg `metadata` JSONB kolom toe aan `pages` tabel:

```sql
-- Voeg metadata kolom toe
ALTER TABLE pages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Index voor snellere queries
CREATE INDEX IF NOT EXISTS idx_pages_metadata ON pages USING GIN (metadata);
```

### Metadata Structuur

```json
{
  "type": "destination",  // of "news", "blog", "page"
  "category": "Europa",
  "featured": true,
  "author": "Redactie",
  "tags": ["strand", "cultuur"]
}
```

## 🔧 BOLT Integratie Opties

### Optie A: Menu Links in Template (Simpelst)

Voeg links toe aan template menu tijdens publiceren:

```javascript
// In template editor publish functie
function addDynamicMenuLinks(pages) {
    // Voeg destinations link toe als er destinations zijn
    if (hasDestinations(brandId)) {
        pages.push({
            name: 'Bestemmingen',
            path: `destinations-dynamic.html?brand_id=${brandId}`,
            icon: 'globe'
        });
    }
    
    // Voeg blog link toe als er nieuws is
    if (hasNews(brandId)) {
        pages.push({
            name: 'Nieuws',
            path: `blog-dynamic.html?brand_id=${brandId}`,
            icon: 'newspaper'
        });
    }
    
    return pages;
}
```

### Optie B: BOLT Deeplink naar Content Pages

Voeg knoppen toe in BOLT om direct naar content te gaan:

```typescript
// In BOLT website overview
<div className="website-actions">
    <button onClick={() => openDestinations(website.brand_id)}>
        📍 Bestemmingen Beheren
    </button>
    <button onClick={() => openBlog(website.brand_id)}>
        📰 Nieuws Beheren
    </button>
</div>

function openDestinations(brandId: string) {
    const url = `https://www.ai-websitestudio.nl/templates/gotur/gotur-html-main/destinations-dynamic.html?brand_id=${brandId}`;
    window.open(url, '_blank');
}
```

### Optie C: Automatische Sync bij Page Save

Update template website automatisch wanneer nieuwe content wordt toegevoegd:

```typescript
// In BOLT page save handler
async function onPageSave(page: Page) {
    // Normale save
    await supabase.from('pages').insert(page);
    
    // Check of page een destination of nieuws is
    const type = detectPageType(page);
    
    if (type === 'destination' || type === 'news') {
        // Update metadata voor betere detectie
        await supabase
            .from('pages')
            .update({ 
                metadata: { 
                    ...page.metadata, 
                    type: type 
                } 
            })
            .eq('id', page.id);
        
        // Optioneel: Trigger website rebuild
        await triggerWebsiteUpdate(page.brand_id);
    }
}

function detectPageType(page: Page): string {
    if (page.slug.startsWith('destination-')) return 'destination';
    if (page.slug.startsWith('news-') || page.slug.startsWith('blog-')) return 'news';
    return 'page';
}
```

## 📝 Aanbevolen Workflow

### Voor Gebruikers:

1. **Template Website Maken**
   - Via Quick Start Template
   - Kies Gotur template
   - Bewerk en publiceer

2. **Content Toevoegen**
   - Maak destinations in Website Builder
   - Gebruik slug: `destination-naam`
   - Of maak nieuws met slug: `news-titel`

3. **Automatisch Zichtbaar**
   - Content verschijnt automatisch in template
   - Via destinations-dynamic.html
   - Via blog-dynamic.html

### Voor BOLT:

1. **Metadata Toevoegen bij Save**
   ```typescript
   page.metadata = {
       type: detectPageType(page),
       created_by: 'bolt',
       ...page.metadata
   };
   ```

2. **Menu Links Genereren**
   - Check of brand destinations heeft
   - Check of brand nieuws heeft
   - Voeg automatisch menu links toe

3. **UI Hints**
   - Toon badge: "Zichtbaar in template"
   - Link naar preview
   - Edit deeplink

## 🧪 Test Scenario

### Test 1: Destination

```typescript
// 1. Maak destination in BOLT
const destination = {
    brand_id: 'xxx',
    title: 'Bali - Paradijs',
    slug: 'destination-bali',
    html: '<h1>Bali</h1><p>Mooie bestemming...</p>',
    metadata: { type: 'destination', category: 'Azië' }
};

await supabase.from('pages').insert(destination);

// 2. Open template website
// https://ai-websitestudio.nl/templates/gotur/gotur-html-main/destinations-dynamic.html?brand_id=xxx

// 3. Zie Bali in grid ✅
```

### Test 2: Nieuws

```typescript
// 1. Maak nieuws in BOLT
const news = {
    brand_id: 'xxx',
    title: 'Nieuwe Reisbestemmingen 2024',
    slug: 'news-nieuwe-bestemmingen-2024',
    html: '<h1>Nieuws</h1><p>Ontdek onze nieuwe...</p>',
    metadata: { type: 'news', author: 'Redactie' }
};

await supabase.from('pages').insert(news);

// 2. Open blog
// https://ai-websitestudio.nl/templates/gotur/gotur-html-main/blog-dynamic.html?brand_id=xxx

// 3. Zie nieuws in grid ✅
```

## 🎨 Styling Behouden

Content wordt automatisch getransformeerd naar Gotur styling:

```javascript
// In wrapper pages
function transformContent(html) {
    // Maak images responsive
    html = html.replace(/<img/gi, '<img class="img-fluid"');
    
    // Remove wrapper divs
    html = html.replace(/<div[^>]*class="[^"]*container[^"]*"[^>]*>/gi, '');
    
    return html;
}
```

## 🔐 Beveiliging

API endpoints gebruiken brand_id voor filtering:

```javascript
// Alleen pages van deze brand
const { data } = await supabase
    .from('pages')
    .select('*')
    .eq('brand_id', brandId);
```

RLS policies zorgen voor extra beveiliging.

## 📊 Analytics (Optioneel)

Track content views:

```typescript
// In wrapper pages
async function trackView(pageSlug: string, brandId: string) {
    await fetch('/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({
            event: 'page_view',
            page: pageSlug,
            brand_id: brandId,
            source: 'template'
        })
    });
}
```

## 🚀 Deployment

Alles is al live op:
- https://www.ai-websitestudio.nl

API endpoints zijn automatisch beschikbaar via Vercel serverless functions.

## 📞 Support

Voor vragen of problemen:
- Check browser console voor errors
- Verifieer brand_id in URL
- Check of pages bestaan in database
- Test API endpoints direct

## 🎯 Volgende Stappen

1. **Metadata kolom toevoegen** (optioneel maar aanbevolen)
2. **Auto-detect implementeren** in BOLT page save
3. **Menu links genereren** bij template publish
4. **UI hints toevoegen** in BOLT
5. **Testen** met echte content

## ✅ Checklist voor BOLT Team

- [ ] Metadata kolom toevoegen aan `pages` tabel
- [ ] Page save handler updaten met type detectie
- [ ] Menu link generator maken
- [ ] UI badges toevoegen ("Zichtbaar in template")
- [ ] Preview links toevoegen
- [ ] Testen met test brand
- [ ] Documentatie voor gebruikers

**Alles is klaar om te integreren!** 🎊
