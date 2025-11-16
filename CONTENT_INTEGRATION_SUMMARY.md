# Content Integratie - Implementatie Samenvatting

## ✅ Wat is Gemaakt

### 1. API Endpoints

**`/api/content/destinations.js`**
- Haalt destinations op uit `pages` tabel
- Filtert op basis van slug patterns of metadata
- Transformeert naar template-friendly format
- Ondersteunt zowel lijst als detail views

**`/api/content/news.js`**
- Haalt nieuws/blog posts op uit `pages` tabel  
- Filtert op basis van slug patterns of metadata
- Transformeert naar blog card format
- Inclusief author, date, category extractie

### 2. Gotur Wrapper Pages

**Destinations:**
- `destinations-dynamic.html` - Grid overzicht
- `destination-detail-dynamic.html` - Detail pagina

**Blog/News:**
- `blog-dynamic.html` - Grid overzicht (nog te maken)
- `blog-detail-dynamic.html` - Detail pagina (nog te maken)

### 3. Features

✅ **Dynamic Content Loading**
- Laadt bestaande content via API
- Gotur styling behouden
- Responsive images
- Loading states

✅ **Content Transformation**
- Custom HTML → Gotur classes
- Image optimization
- Excerpt generation
- Gallery rendering

✅ **Navigation**
- Breadcrumbs
- Back buttons
- Menu integratie ready

## 🎯 Hoe het Werkt

### Flow: Destinations

```
1. User klikt "Bestemmingen" in menu
   ↓
2. Opens: destinations-dynamic.html
   ↓
3. Laadt: /api/content/destinations?brandId=XXX
   ↓
4. Toont: Grid met alle destinations (Gotur styling)
   ↓
5. User klikt destination
   ↓
6. Opens: destination-detail-dynamic.html?slug=bali
   ↓
7. Laadt: /api/content/destinations?brandId=XXX&slug=bali
   ↓
8. Toont: Detail pagina met content (Gotur styling)
```

### Flow: Blog/News

```
Zelfde flow als destinations, maar dan voor nieuws/blog posts
```

## 📝 Content Detectie

### Hoe API weet wat een Destination is:

```javascript
function isDestination(page) {
    // Optie 1: Slug pattern
    if (page.slug.startsWith('destination-')) return true;
    
    // Optie 2: Title keyword
    if (page.title.includes('bestemming')) return true;
    
    // Optie 3: Metadata (BESTE!)
    if (page.metadata?.type === 'destination') return true;
    
    return false;
}
```

### Hoe API weet wat een News Article is:

```javascript
function isNewsArticle(page) {
    // Optie 1: Slug pattern
    if (page.slug.startsWith('news-') || page.slug.startsWith('blog-')) return true;
    
    // Optie 2: Title keyword
    if (page.title.includes('nieuws') || page.title.includes('blog')) return true;
    
    // Optie 3: Metadata (BESTE!)
    if (page.metadata?.type === 'news' || page.metadata?.type === 'blog') return true;
    
    return false;
}
```

## 🔧 Metadata Toevoegen (Aanbevolen)

### In Website Builder

Wanneer je een pagina opslaat, voeg metadata toe:

```javascript
// In builder save functie
const pageData = {
    title: 'Bali - Paradijs in Indonesië',
    slug: 'bali-paradijs',
    html: '...',
    metadata: {
        type: 'destination',  // of 'news', 'blog'
        category: 'Azië',
        featured: true
    }
};
```

### In Template Editor

Bij publiceren, detecteer automatisch:

```javascript
function detectPageType(page) {
    // Detecteer op basis van content
    if (page.name.includes('Destination') || page.path.includes('destination')) {
        return 'destination';
    }
    if (page.name.includes('Blog') || page.path.includes('blog')) {
        return 'blog';
    }
    return 'page';
}
```

## 🎨 Styling Transformatie

### Content Transformer

```javascript
function transformToGoturStyling(html) {
    let content = html;
    
    // Maak images responsive
    content = content.replace(/<img/gi, '<img class="img-fluid"');
    
    // Transform custom classes
    content = content.replace(/class="hero-section"/g, 'class="banner-one"');
    content = content.replace(/class="content-block"/g, 'class="about-one"');
    
    // Remove wrapper divs
    content = content.replace(/<div[^>]*class="[^"]*container[^"]*"[^>]*>/gi, '');
    
    return content;
}
```

## 🚀 Volgende Stappen

### 1. Blog Pages Maken (Nu)
- [ ] `blog-dynamic.html` - Grid overzicht
- [ ] `blog-detail-dynamic.html` - Detail pagina

### 2. Menu Integratie
- [ ] Voeg links toe aan template menu
- [ ] Update menu in alle pagina's

### 3. Metadata Systeem
- [ ] Voeg `metadata` JSONB kolom toe aan `pages` tabel
- [ ] Update builder om metadata op te slaan
- [ ] Update API om metadata te gebruiken

### 4. Testing
- [ ] Test met echte destinations
- [ ] Test met echte nieuws posts
- [ ] Test styling transformatie

### 5. Reizen Integratie (Later)
- [ ] API endpoint voor trips
- [ ] Gotur tour wrapper pages
- [ ] Roadbook integratie

## 💡 Tips

### Voor Beste Resultaten:

1. **Gebruik Metadata** - Meest betrouwbaar
2. **Consistente Slugs** - Gebruik prefixes (destination-, news-, blog-)
3. **Goede Content** - Zorg voor goede images en excerpts
4. **Test Vaak** - Test met echte content

### Troubleshooting:

**Geen content zichtbaar?**
- Check of `brandId` correct is
- Check console voor API errors
- Verifieer dat pages bestaan in database

**Styling ziet er raar uit?**
- Check content transformer functie
- Verifieer dat Gotur CSS geladen is
- Test met simpele content eerst

**Images werken niet?**
- Check image URLs (absolute vs relative)
- Verifieer dat images toegankelijk zijn
- Gebruik placeholder als fallback

## 📞 Wat Nu?

Ik kan nu maken:

1. **Blog wrapper pages** - Compleet maken
2. **Menu integratie** - Links toevoegen
3. **Metadata systeem** - Database + Builder updates
4. **Test content** - Voorbeelden maken

**Wat wil je eerst?** 🚀
