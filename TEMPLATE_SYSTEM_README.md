# Template System - Quick Start Websites

## Overzicht

Het Template System biedt reisbureaus de mogelijkheid om snel te starten met een professionele website door te kiezen uit voorgebouwde templates. Dit is een aanvulling op de bestaande custom builder.

## Features

### ✨ Beschikbare Templates

1. **Gotur** (Premium)
   - Modern en luxe design
   - 60+ voorgebouwde pagina's
   - Uitgebreide animaties en effecten
   - Tour listings met filters
   - E-commerce integratie
   - Perfect voor premium reisbureaus

2. **Tripix** (Popular)
   - Clean en professioneel design
   - Focus op reizen en bestemmingen
   - Trip & destination pages
   - Blog functionaliteit
   - Responsive en snel
   - Ideaal voor middelgrote reisbureaus

3. **Adventure** (Binnenkort)
   - Dynamisch en actie-georiënteerd
   - Voor avontuurlijke reizen
   - Video backgrounds
   - Activity booking systeem

4. **Classic Travel** (Binnenkort)
   - Tijdloos en betrouwbaar
   - Traditionele uitstraling
   - Focus op service
   - Voor gevestigde reisbureaus

## Workflow

### 1. Template Selectie
```
URL: template-selector.html?brand_id=XXX&token=YYY&apikey=ZZZ&api=...
```

Gebruiker ziet:
- Visual preview van alle templates
- Feature lijst per template
- Preview en selectie knoppen

### 2. Configuratie
```
URL: template-configurator.html?template=gotur&brand_id=XXX&...
```

Automatisch ingevuld:
- ✅ Bedrijfsnaam (uit Supabase brands)
- ✅ Contact gegevens (email, telefoon, adres)
- ✅ Brand kleuren (primary/secondary)
- ✅ Alle reizen (uit Supabase trips)
- ✅ Logo (indien aanwezig)

Gebruiker kan aanpassen:
- Tagline/slogan
- Kleuren fine-tunen
- Contact info verifiëren

### 3. Generatie
```
URL: template-generator.html?template=gotur&brand_id=XXX&...
```

Automatische stappen:
1. Template HTML laden
2. Menu items updaten met reizen
3. Footer invullen met contact info
4. Brand kleuren toepassen
5. Trip cards genereren uit database
6. Contact info overal vervangen
7. Website finaliseren

### 4. Resultaat

Gebruiker krijgt:
- ✅ Complete website met menu
- ✅ Footer met contact info en social links
- ✅ Alle reizen automatisch ingeladen
- ✅ Brand kleuren toegepast
- ✅ Logo en bedrijfsnaam overal correct
- ✅ Mogelijkheid om verder aan te passen in builder

## Auto-Fill Functionaliteit

### Menu Structuur
```javascript
const menuItems = [
    { label: 'Home', url: 'index.html' },
    { label: 'Reizen', url: 'trips.html' },
    { label: 'Bestemmingen', url: 'destinations.html' },
    { label: 'Over Ons', url: 'about.html' },
    { label: 'Contact', url: 'contact.html' }
];
```

### Footer Elementen
- Bedrijfsnaam
- Adres, telefoon, email
- Social media links (Facebook, Instagram, LinkedIn, YouTube)
- Copyright met bedrijfsnaam en jaar
- Legal links (Privacy, Terms)

### Dynamic Content
- Logo (uit brand assets of tekst)
- Brand kleuren (CSS variables)
- Trip cards (uit Supabase)
- Contact formulieren (pre-filled)
- Testimonials (optioneel)

## Technische Details

### Bestanden

```
website-builder/
├── template-selector.html          # Template keuze UI
├── template-configurator.html      # Brand data configuratie
├── template-generator.html         # Website generatie UI
├── js/
│   └── template-generator.js       # Core generatie logic
└── templates/
    ├── gotur/
    │   └── gotur-html-main/
    │       ├── index.html
    │       ├── assets/
    │       └── ...
    └── tripix-html/
        ├── index.html
        ├── assets/
        └── ...
```

### Template Generator Class

```javascript
class TemplateGenerator {
    constructor(config) {
        this.config = config;
        this.template = config.template;
        this.brandData = { ... };
        this.trips = config.trips;
    }

    async generate() {
        // 7 stappen proces
        await this.loadTemplate();
        await this.updateNavigation();
        await this.updateFooter();
        await this.applyBranding();
        await this.addTrips();
        await this.updateContactInfo();
        await this.finalizeWebsite();
    }
}
```

### Brand Data Structuur

```javascript
{
    name: "Reisbureau Naam",
    tagline: "Jouw droomreis begint hier",
    email: "info@reisbureau.nl",
    phone: "+31 20 123 4567",
    address: "Straat 123, 1234 AB Amsterdam",
    primaryColor: "#667eea",
    secondaryColor: "#764ba2",
    logo: "url/to/logo.png" // optioneel
}
```

### Trip Data Structuur

```javascript
{
    id: "uuid",
    title: "Reis Titel",
    destination: "Bestemming",
    hero_image: "url/to/image.jpg",
    price: 1299,
    duration: "7 dagen",
    description: "...",
    itinerary: [...],
    // ... meer velden
}
```

## Integratie met BOLT

### URL Parameters van BOLT

```
https://www.ai-websitestudio.nl/template-selector.html?
    brand_id=0766a61a-8f37-4a83-bf28-e15084d764fb&
    token=JWT_TOKEN&
    apikey=SUPABASE_ANON_KEY&
    api=https%3A%2F%2Fhuaaogdxxdcakxryecnw.supabase.co%2Ffunctions%2Fv1&
    return_url=https%3A%2F%2Fwww.ai-travelstudio.nl%2F%23%2Fbrand%2Fcontent%2Ftrips
```

### BOLT Menu Item

Voeg toe aan BOLT:
```javascript
{
    label: "🚀 Quick Start Website",
    action: "openTemplateSelector",
    url: "https://www.ai-websitestudio.nl/template-selector.html"
}
```

## CSS Customization

### Brand Colors Override

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
}

.btn-primary {
    background: var(--primary-color) !important;
}

.btn-secondary {
    background: var(--secondary-color) !important;
}
```

### Responsive Design

Alle templates zijn:
- ✅ Mobile-first
- ✅ Tablet optimized
- ✅ Desktop enhanced
- ✅ Touch-friendly

## Preview Functionaliteit

### Template Preview
```javascript
function previewTemplate(templateName) {
    const previewUrls = {
        'gotur': 'templates/gotur/gotur-html-main/index.html',
        'tripix': 'templates/tripix-html/index.html'
    };
    window.open(previewUrls[templateName], '_blank');
}
```

### Generated Website Preview
```javascript
function previewWebsite() {
    const blob = new Blob([generatedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}
```

## Deployment

### Opties

1. **Direct Preview**
   - Blob URL in nieuwe tab
   - Geen server nodig
   - Instant feedback

2. **Builder Integration**
   - Open in bestaande builder
   - Verder aanpassen mogelijk
   - Extra pagina's toevoegen

3. **Direct Publish** (toekomstig)
   - Deploy naar hosting
   - Custom domain
   - SSL certificaat

## Uitbreidingen (Roadmap)

### Fase 2
- [ ] Meer templates toevoegen (Adventure, Classic)
- [ ] Template preview met live brand data
- [ ] Drag & drop logo upload
- [ ] Social media links configuratie
- [ ] Custom menu items toevoegen

### Fase 3
- [ ] Template marketplace
- [ ] User-submitted templates
- [ ] Template rating systeem
- [ ] A/B testing templates
- [ ] Analytics integratie

### Fase 4
- [ ] AI-powered template suggestions
- [ ] Automatic SEO optimization
- [ ] Multi-language support
- [ ] Advanced customization options

## Testing

### Test Scenario

1. Start vanuit BOLT met brand_id
2. Kies template (bijv. Gotur)
3. Verifieer auto-fill van brand data
4. Controleer trips worden geladen
5. Pas kleuren aan
6. Genereer website
7. Preview resultaat
8. Open in builder voor aanpassingen

### Expected Results

- ✅ Alle brand data correct ingevuld
- ✅ Trips zichtbaar op homepage
- ✅ Menu werkt en bevat juiste links
- ✅ Footer heeft correcte contact info
- ✅ Kleuren zijn toegepast
- ✅ Logo/bedrijfsnaam overal zichtbaar
- ✅ Responsive op alle devices

## Troubleshooting

### Template laadt niet
- Controleer of template bestanden aanwezig zijn in `/templates/`
- Verifieer pad in `template-generator.js`

### Brand data niet ingevuld
- Controleer Supabase connectie
- Verifieer JWT token geldigheid
- Check brand_id bestaat in database

### Trips niet zichtbaar
- Controleer `trips` tabel in Supabase
- Verifieer `brand_id` match
- Check `trip_brand_assignments` tabel

### Kleuren niet toegepast
- Controleer CSS specificity
- Verifieer `!important` flags
- Check browser cache

## Support

Voor vragen of problemen:
- Check console logs in browser
- Verifieer URL parameters
- Test met demo brand_id
- Contact: development team

## Changelog

### v1.0.0 (2024-11-15)
- ✅ Template selector UI
- ✅ Gotur en Tripix templates
- ✅ Auto-fill brand data
- ✅ Dynamic menu & footer
- ✅ Trip cards generation
- ✅ Brand colors application
- ✅ Preview functionaliteit
- ✅ Builder integration
