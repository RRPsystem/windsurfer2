# 🎨 GrapesJS Template Editor

Visual HTML template editor voor ThemeForest templates met BOLT integratie.

## 📋 Overzicht

De GrapesJS editor maakt het mogelijk om:
- ✅ ThemeForest HTML templates te uploaden (ZIP format)
- ✅ Visueel te bewerken met drag & drop
- ✅ Templates op te slaan in Supabase
- ✅ Direct te deployen naar BOLT
- ✅ Responsive preview (desktop/tablet/mobile)

## 🚀 Gebruik

### 1. Editor Openen

**Nieuwe Template:**
```
http://localhost:8080/grapesjs-editor.html?api=SUPABASE_URL&apikey=SUPABASE_KEY&brand_id=BRAND_ID
```

**Bestaande Template Bewerken:**
```
http://localhost:8080/grapesjs-editor.html?api=SUPABASE_URL&apikey=SUPABASE_KEY&brand_id=BRAND_ID&template_id=TEMPLATE_ID
```

**Met BOLT Return URL:**
```
http://localhost:8080/grapesjs-editor.html?api=SUPABASE_URL&apikey=SUPABASE_KEY&brand_id=BRAND_ID&return_url=BOLT_URL
```

### 2. Template Uploaden

1. Klik op **"📁 Nieuwe Template"**
2. Sleep ZIP bestand in upload area of klik om te selecteren
3. Wacht tot template wordt geladen
4. Begin met bewerken!

### 3. Template Bewerken

**Componenten:**
- Sleep elementen vanuit linker sidebar
- Klik op element om te selecteren
- Bewerk eigenschappen in rechter sidebar
- Gebruik toolbar voor styling

**Responsive Preview:**
- 💻 Desktop view
- 📱 Tablet view
- 📱 Mobile view

**Acties:**
- **Opslaan** - Slaat template op in Supabase + download HTML
- **Deploy naar BOLT** - Stuurt template naar BOLT voor publicatie

## 📦 ThemeForest Template Structuur

### Ondersteunde ZIP Structuur

```
template.zip
├── index.html          ← Hoofdbestand (wordt automatisch gevonden)
├── css/
│   └── style.css
├── js/
│   └── script.js
├── images/
│   ├── logo.png
│   └── hero.jpg
└── fonts/
    └── custom-font.woff2
```

### Automatische Detectie

De editor zoekt automatisch naar:
1. `index.html`
2. `home.html`
3. `main.html`
4. `index-1.html`
5. Eerste HTML bestand in root
6. Eerste HTML bestand anywhere

## 🔧 Technische Details

### Gebruikte Libraries

- **GrapesJS** - Visual editor core
- **grapesjs-preset-webpage** - Preset voor webpagina's
- **JSZip** - ZIP file processing
- **Supabase** - Database & storage

### Asset Handling

**Afbeeldingen:**
- Worden geconverteerd naar base64 data URIs
- Inline in HTML opgeslagen
- Geen externe dependencies

**CSS:**
- Inline styles worden geëxtraheerd
- Externe CSS wordt samengevoegd
- Opgeslagen in aparte CSS sectie

**JavaScript:**
- Scripts worden verwijderd uit editor view
- Kunnen later worden toegevoegd via custom code

### Database Schema

```sql
CREATE TABLE website_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id),
    name TEXT NOT NULL,
    html_content TEXT NOT NULL,
    css_content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(brand_id, name)
);
```

## 🎯 Features

### ✅ Geïmplementeerd

- [x] ZIP upload met drag & drop
- [x] Automatische HTML detectie
- [x] Visual editing met GrapesJS
- [x] Asset extraction (images, fonts)
- [x] Base64 conversion voor assets
- [x] Responsive preview
- [x] Save to Supabase
- [x] Download als HTML
- [x] BOLT deployment integratie

### 🔄 In Development

- [ ] Media library integratie
- [ ] Brand customization (logo, kleuren)
- [ ] Template library (opgeslagen templates)
- [ ] Version history
- [ ] Collaborative editing

### 📋 Roadmap

- [ ] Custom component library (travel-specific)
- [ ] AI-powered content suggestions
- [ ] Multi-language support
- [ ] Advanced SEO tools
- [ ] Performance optimization
- [ ] A/B testing integration

## 🔗 BOLT Integratie

### Workflow

```
BOLT → GrapesJS Editor → Template Bewerken → Deploy → BOLT
```

### URL Parameters

**Van BOLT naar Editor:**
```
?api=SUPABASE_URL
&apikey=SUPABASE_KEY
&brand_id=BRAND_ID
&return_url=BOLT_CALLBACK_URL
&template_id=EXISTING_TEMPLATE_ID (optional)
```

**Van Editor terug naar BOLT:**
```
?template_html=FULL_HTML
&template_name=TEMPLATE_NAME
&status=success
```

### BOLT Integration Code

```javascript
// In BOLT: Open editor
function openTemplateEditor(brandId, templateId = null) {
    const params = new URLSearchParams({
        api: SUPABASE_URL,
        apikey: SUPABASE_KEY,
        brand_id: brandId,
        return_url: window.location.href
    });
    
    if (templateId) {
        params.append('template_id', templateId);
    }
    
    window.location.href = `/grapesjs-editor.html?${params.toString()}`;
}

// In BOLT: Handle return
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('status') === 'success') {
    const templateHtml = urlParams.get('template_html');
    const templateName = urlParams.get('template_name');
    
    // Deploy template
    deployTemplate(templateHtml, templateName);
}
```

## 🎨 Customization

### Custom Components

```javascript
// Add custom travel component
editor.BlockManager.add('travel-card', {
    label: 'Travel Card',
    content: `
        <div class="travel-card">
            <img src="placeholder.jpg" alt="Destination">
            <h3>Destination Name</h3>
            <p>Description</p>
            <button>Book Now</button>
        </div>
    `,
    category: 'Travel'
});
```

### Custom Styles

```javascript
// Add custom style manager fields
editor.StyleManager.addSector('travel-styles', {
    name: 'Travel Styles',
    properties: [
        {
            name: 'Brand Color',
            property: 'color',
            type: 'color'
        }
    ]
});
```

## 🐛 Troubleshooting

### Template niet geladen

**Probleem:** ZIP wordt niet verwerkt
**Oplossing:** 
- Check of ZIP valid is
- Controleer of index.html aanwezig is
- Kijk in browser console voor errors

### Assets niet zichtbaar

**Probleem:** Afbeeldingen/fonts worden niet getoond
**Oplossing:**
- Assets worden geconverteerd naar base64
- Check browser console voor conversion errors
- Grote assets (>1MB) kunnen problemen geven

### Opslaan faalt

**Probleem:** Template wordt niet opgeslagen in Supabase
**Oplossing:**
- Check Supabase credentials in URL
- Controleer brand_id parameter
- Kijk naar network tab voor API errors

## 📚 Resources

- [GrapesJS Documentation](https://grapesjs.com/docs/)
- [GrapesJS Plugins](https://grapesjs.com/docs/plugins/)
- [JSZip Documentation](https://stuk.github.io/jszip/)
- [ThemeForest](https://themeforest.net/)

## 🤝 Support

Voor vragen of problemen:
1. Check browser console voor errors
2. Controleer network tab voor API calls
3. Valideer URL parameters
4. Test met simpele HTML template eerst

## 📝 Changelog

### v1.0.0 (2024-11-21)
- ✅ Initial release
- ✅ ZIP upload support
- ✅ GrapesJS integration
- ✅ Supabase storage
- ✅ BOLT deployment

---

**Status:** ✅ Production Ready
**Last Updated:** 2024-11-21
