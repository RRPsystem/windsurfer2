# Content Integratie Plan - Bestaande Content in Templates

## 🎯 Doel
Bestaande content (destinations, nieuws, reizen) tonen in template styling (Gotur/Tripix) met behoud van functionaliteit.

## 📊 Content Types

### 1. Destinations (Bestemmingen)
**Bestaand:**
- Opgeslagen in `pages` tabel
- Custom HTML/CSS per bestemming
- Via Website Builder gemaakt

**Template:**
- Gotur: `destination-details.html`
- Mooie layout met gallery, info boxes, related tours

**Integratie:**
```javascript
// destination-template.html
// Hybrid: Template styling + Dynamic content

async function loadDestination(slug) {
    // Haal bestaande destination op
    const response = await fetch(`/api/pages/${brandId}/${slug}`);
    const destination = await response.json();
    
    // Map naar template structuur
    document.querySelector('.destination-title').textContent = destination.title;
    document.querySelector('.destination-description').innerHTML = destination.content;
    
    // Extract images uit bestaande content
    const images = extractImages(destination.html);
    renderGallery(images);
}
```

### 2. Nieuws/Blog
**Bestaand:**
- Mogelijk in `pages` tabel of aparte `news` tabel
- Custom styling

**Template:**
- Gotur: `blog-details.html`
- Blog grid: `blog-grid.html`

**Integratie:**
```javascript
// blog-template.html
async function loadBlogPosts() {
    const posts = await fetch(`/api/blog/${brandId}`);
    
    // Render in Gotur blog grid
    posts.forEach(post => {
        const card = createBlogCard(post); // Gotur styling
        document.querySelector('.blog-grid').appendChild(card);
    });
}
```

### 3. Reizen (Travel Compositor)
**Bestaand:**
- In `trips` tabel
- Roadbook data
- Route informatie

**Template:**
- Gotur: `tour-listing-details-1.html`
- Tour grid: `tour-listing-1.html`

**Integratie:**
```javascript
// tour-template.html
async function loadTrip(tripId) {
    const trip = await fetch(`/api/trips/${tripId}`);
    
    // Map trip data naar Gotur tour template
    document.querySelector('.tour-title').textContent = trip.title;
    document.querySelector('.tour-duration').textContent = trip.duration;
    document.querySelector('.tour-price').textContent = trip.price;
    
    // Render roadbook in Gotur styling
    renderRoadbook(trip.roadbook);
}
```

## 🔧 Implementatie Opties

### **Optie 1: Template Wrapper Pages** ⭐ (Aanbevolen)

**Voordelen:**
- ✅ Behoud template styling
- ✅ Bestaande content blijft werken
- ✅ Flexibel en schaalbaar

**Hoe:**
1. Maak "wrapper" pagina's in template
2. Laden bestaande content via API
3. Injecteren in template structuur
4. Menu linkt naar wrapper pages

**Voorbeeld structuur:**
```
Template Website:
├── index.html (Gotur home)
├── about.html (Gotur about)
├── destinations.html (Gotur grid) 
│   └── Laadt: /api/pages?type=destination
├── destination-detail.html (Gotur detail)
│   └── Laadt: /api/pages/{slug}
├── blog.html (Gotur blog grid)
│   └── Laadt: /api/blog
├── blog-detail.html (Gotur blog post)
│   └── Laadt: /api/blog/{slug}
├── tours.html (Gotur tour grid)
│   └── Laadt: /api/trips
└── tour-detail.html (Gotur tour detail)
    └── Laadt: /api/trips/{id}
```

### **Optie 2: Content Transformer**

**Voordelen:**
- ✅ Eenmalige conversie
- ✅ Sneller (geen API calls)

**Nadelen:**
- ❌ Updates niet automatisch
- ❌ Dubbele opslag

**Hoe:**
1. Script converteert bestaande content
2. Herstructureert naar template format
3. Slaat op in `websites.pages`

### **Optie 3: Hybrid Approach** ⭐⭐ (Beste!)

**Combinatie van beide:**
- Statische template pages voor marketing
- Dynamic pages voor content
- Beste van beide werelden

## 📝 Implementatie Stappen

### Stap 1: API Endpoints Maken

```javascript
// api/content/destinations.js
export default async function handler(req, res) {
    const { brandId } = req.query;
    
    // Haal destinations uit pages tabel
    const { data } = await supabase
        .from('pages')
        .select('*')
        .eq('brand_id', brandId)
        .eq('type', 'destination'); // Of custom filter
    
    // Return in template-friendly format
    res.json(data.map(dest => ({
        slug: dest.slug,
        title: dest.title,
        excerpt: extractExcerpt(dest.html),
        image: extractFirstImage(dest.html),
        link: `/destination/${dest.slug}`
    })));
}
```

### Stap 2: Template Wrapper Maken

```html
<!-- destination-detail-wrapper.html -->
<!DOCTYPE html>
<html>
<head>
    <!-- Gotur CSS -->
    <link rel="stylesheet" href="assets/css/gotur.css">
</head>
<body>
    <!-- Gotur Header/Menu -->
    <header class="main-header">...</header>
    
    <!-- Dynamic Content Area -->
    <section class="destination-details">
        <div class="container">
            <div id="dynamic-content">
                <!-- Content wordt hier geladen -->
            </div>
        </div>
    </section>
    
    <!-- Gotur Footer -->
    <footer>...</footer>
    
    <script>
        // Laad destination data
        const slug = new URLSearchParams(window.location.search).get('slug');
        
        async function loadDestination() {
            const response = await fetch(`/api/pages/${brandId}/${slug}`);
            const data = await response.json();
            
            // Map naar Gotur structuur
            const content = document.getElementById('dynamic-content');
            content.innerHTML = `
                <div class="destination-header">
                    <h1 class="destination-title">${data.title}</h1>
                </div>
                <div class="destination-content">
                    ${transformContentToGotur(data.html)}
                </div>
            `;
        }
        
        function transformContentToGotur(html) {
            // Transform custom HTML naar Gotur classes
            // Bijv: <div class="custom"> → <div class="gotur-section">
            return html
                .replace(/class="custom-title"/g, 'class="section-title"')
                .replace(/class="custom-text"/g, 'class="section-text"');
        }
        
        loadDestination();
    </script>
</body>
</html>
```

### Stap 3: Menu Integratie

```javascript
// In template menu
<li><a href="destinations.html">Bestemmingen</a></li>
<li><a href="blog.html">Nieuws</a></li>
<li><a href="tours.html">Reizen</a></li>

// destinations.html laadt grid met alle destinations
// Klikt op destination → destination-detail.html?slug=bali
```

## 🎨 Styling Behoud

### Content Transformer Functie

```javascript
function transformToGoturStyling(customHTML) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(customHTML, 'text/html');
    
    // Map custom classes naar Gotur classes
    const mappings = {
        'hero-section': 'banner-one',
        'content-block': 'about-one',
        'image-gallery': 'gallery-one',
        'cta-section': 'cta-one'
    };
    
    Object.keys(mappings).forEach(oldClass => {
        const elements = doc.querySelectorAll(`.${oldClass}`);
        elements.forEach(el => {
            el.classList.remove(oldClass);
            el.classList.add(mappings[oldClass]);
        });
    });
    
    return doc.body.innerHTML;
}
```

## 🚀 Implementatie Prioriteit

### Phase 1: Basis Setup (Nu)
1. ✅ API endpoints voor content
2. ✅ Wrapper pages maken
3. ✅ Basis content loading

### Phase 2: Styling Mapping (Week 1)
1. Content transformer functie
2. Class mapping definities
3. Test met 1 destination

### Phase 3: Volledige Integratie (Week 2)
1. Alle content types
2. Menu integratie
3. Search functionaliteit

### Phase 4: Optimalisatie (Week 3)
1. Caching
2. Performance
3. SEO

## 🧪 Test Scenario

```
1. Maak template website (Gotur)
2. Voeg wrapper page toe: destinations.html
3. Laadt bestaande destinations via API
4. Toont in Gotur grid layout
5. Klik destination → detail page
6. Detail page gebruikt Gotur styling
7. Content komt van bestaande page
8. ✅ Perfect!
```

## 📞 Volgende Stappen

**Wat wil je eerst aanpakken?**

A. **Destinations** - Grid + Detail pages
B. **Blog/Nieuws** - Overzicht + Artikelen  
C. **Reizen** - Tours integratie
D. **Alles tegelijk** - Complete integratie

**Ik kan nu maken:**
- API endpoints
- Wrapper templates
- Content transformer
- Menu integratie

Zeg maar wat je wilt! 🚀
