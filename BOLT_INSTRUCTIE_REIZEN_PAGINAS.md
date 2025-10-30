# 📋 BOLT Instructie: Reizen Zoek & Overzicht Pagina's

## 🎯 Doel
Maak 2 pagina's voor het reizen systeem:
1. **Homepage** met zoekformulier
2. **Reizen pagina** met alle reizen en zoekresultaten

---

## 📄 STAP 1: Homepage Maken

### Actie: Maak nieuwe pagina "Home"

**Pagina Instellingen:**
```
Titel: Home
Slug: / (of laat leeg voor homepage)
Template: Standaard
```

### Componenten Toevoegen:

**1. Hero Travel Search (Zoekformulier)**
```
Component: "🔍 Hero Zoek & Boek Reizen"
Locatie: Hero Componenten sectie
Positie: Bovenaan pagina

Instellingen:
- Titel: "Vind Jouw Perfecte Reis"
- Subtitel: "Ontdek prachtige bestemmingen over de hele wereld"
- Badge: "Ontdek & Boek"
- Achtergrond: Kies mooie reisfoto via Media Picker
```

**2. Featured Reizen (Optioneel)**
```
Component: "Feature Highlight" of custom reizen cards
Positie: Onder hero
Doel: Toon 3 uitgelichte reizen
```

**3. Testimonials / USP's (Optioneel)**
```
Componenten naar keuze voor vertrouwen en conversie
```

---

## 📄 STAP 2: Reizen Pagina Maken

### Actie: Maak nieuwe pagina "Reizen"

**Pagina Instellingen:**
```
Titel: Reizen
Slug: /reizen
Template: Standaard
```

### Componenten Toevoegen:

**1. Travel Overview (Reizen Overzicht)**
```
Component: "🌍 Reizen Overzicht (Zoek & Boek)"
Locatie: Reis Componenten sectie
Positie: Bovenaan pagina (of onder kleine hero)

Instellingen:
- Badge: "Onze Reizen"
- Titel: "Ontdek Alle Bestemmingen"
- Zoekbalk: Actief (automatisch)
- Filters: Alle, Strandvakanties, Rondreizen, Stedentrips, etc.
```

**2. Optionele Hero (Klein)**
```
Component: "Hero Banner" (optioneel)
Positie: Boven Travel Overview
Doel: Kleine banner met "Alle Reizen" tekst
```

---

## 🔗 STAP 3: Flow Testen

### Test Scenario:

**1. Ga naar Homepage (/):**
```
✓ Hero Travel Search is zichtbaar
✓ Zoekformulier heeft 4 velden:
  - Bestemming
  - Type Reis
  - Duur
  - Budget
✓ "Zoek Reizen" button is zichtbaar
✓ Populaire bestemmingen links werken
```

**2. Vul Zoekformulier In:**
```
Bestemming: "Thailand"
Type Reis: "Strand"
Duur: "7 dagen"
Budget: "1500"
```

**3. Klik "Zoek Reizen":**
```
✓ Wordt doorgestuurd naar: /reizen?location=Thailand&type=Strand&duration=7%20dagen&price=1500
✓ URL bevat parameters
```

**4. Op Reizen Pagina (/reizen):**
```
✓ Travel Overview component is zichtbaar
✓ Zoekbalk toont automatisch: "Thailand"
✓ Filter "Strandvakanties" is automatisch actief
✓ Alleen Thailand strandreizen zijn zichtbaar
✓ Pagina scrollt smooth naar resultaten
```

---

## 🎨 STAP 4: Styling & Layout

### Homepage Layout:
```
┌─────────────────────────────────────┐
│  Hero Travel Search (Fullscreen)    │
│  - Achtergrondafbeelding            │
│  - Zoekformulier (wit, centered)    │
│  - Populaire bestemmingen           │
└─────────────────────────────────────┘
│  Featured Reizen (3 kaarten)        │
└─────────────────────────────────────┘
│  Testimonials / USP's               │
└─────────────────────────────────────┘
│  Footer                             │
└─────────────────────────────────────┘
```

### Reizen Pagina Layout:
```
┌─────────────────────────────────────┐
│  Kleine Hero (Optioneel)            │
│  "Alle Reizen"                      │
└─────────────────────────────────────┘
│  Travel Overview                    │
│  ┌───────────────────────────────┐  │
│  │ Zoekbalk + Filters            │  │
│  └───────────────────────────────┘  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │Reis│ │Reis│ │Reis│ │Reis│      │
│  └────┘ └────┘ └────┘ └────┘      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │Reis│ │Reis│ │Reis│ │Reis│      │
│  └────┘ └────┘ └────┘ └────┘      │
└─────────────────────────────────────┘
│  Footer                             │
└─────────────────────────────────────┘
```

---

## ⚙️ STAP 5: Properties Aanpassen

### Hero Travel Search Properties:

**Klik op Hero → Properties Panel:**
```
✏️ Titel: Pas aan naar jouw tekst
✏️ Subtitel: Pas aan naar jouw tekst
✏️ Badge Tekst: Pas aan (bijv. "Boek Nu")
🖼️ Achtergrond Afbeelding: Kies via Media Picker
   - Aanbevolen: Unsplash reisfoto's
   - Zoek op: "travel", "beach", "mountains"
```

### Travel Overview Properties:

**Klik op Travel Overview → Properties Panel:**
```
✏️ Badge: Pas aan (bijv. "Onze Bestemmingen")
✏️ Titel: Pas aan (bijv. "Ontdek de Wereld")
🎨 Filters: Worden automatisch gegenereerd
   - Gebaseerd op tags in database
```

---

## 🗄️ STAP 6: Database Setup (Belangrijk!)

### Reizen Toevoegen aan Database:

**Optie A: Via Travel Compositor**
```
1. Ga naar "Reis Toevoegen" in builder
2. Kies "Travel Compositor"
3. Importeer reis
4. Reis wordt automatisch opgeslagen in BOLT
```

**Optie B: Handmatig in BOLT**
```
1. Ga naar BOLT CMS
2. Open "travels" tabel
3. Voeg reizen toe met velden:
   - title: "Thailand Strandvakantie"
   - location: "Thailand"
   - duration: "7 dagen"
   - price: 1299
   - tags: "strand,tropisch"
   - featured: false
   - priority: 999
   - status: "published"
```

**Optie C: Via SQL (Snelst)**
```sql
INSERT INTO travels (title, location, duration, days, price, currency, description, image, tags, featured, priority, status, source)
VALUES 
('Thailand Strandvakantie', 'Thailand', '7 dagen', 7, 1299, 'EUR', 'Ontspan op de mooiste stranden van Thailand', 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a', 'strand,tropisch', false, 999, 'published', 'manual'),
('Rondreis Italië', 'Italië', '10 dagen', 10, 1599, 'EUR', 'Ontdek de cultuur en geschiedenis van Italië', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9', 'rondreis,cultuur', false, 999, 'published', 'manual'),
('Stedentrip Barcelona', 'Spanje', '4 dagen', 4, 599, 'EUR', 'Geniet van de architectuur en het strand', 'https://images.unsplash.com/photo-1583422409516-2895a77efded', 'stedentrip,strand', false, 999, 'published', 'manual');
```

---

## ✅ STAP 7: Verificatie Checklist

### Homepage Checklist:
- [ ] Hero Travel Search component zichtbaar
- [ ] Zoekformulier heeft 4 velden
- [ ] Achtergrondafbeelding laadt correct
- [ ] "Zoek Reizen" button werkt
- [ ] Populaire bestemmingen klikbaar
- [ ] Klikken op "Zoek Reizen" → redirect naar /reizen

### Reizen Pagina Checklist:
- [ ] Travel Overview component zichtbaar
- [ ] Reizen worden geladen uit database
- [ ] Zoekbalk werkt (real-time filter)
- [ ] Filter buttons werken
- [ ] "Boek nu" buttons zichtbaar
- [ ] URL parameters worden gelezen
- [ ] Filters worden automatisch toegepast bij URL params
- [ ] Featured reizen hebben ⭐ badge

### Flow Checklist:
- [ ] Homepage → Zoeken → /reizen werkt
- [ ] URL bevat parameters: ?location=...&type=...
- [ ] Reizen pagina past filters automatisch toe
- [ ] Zoekresultaten kloppen met zoekopdracht
- [ ] Geen JavaScript errors in console

---

## 🐛 Troubleshooting

### Probleem: "Geen reizen gevonden"
**Oplossing:**
```
1. Check of travels tabel bestaat in Supabase
2. Check of er reizen in database staan:
   SELECT * FROM travels WHERE status = 'published';
3. Check BOLT_DB connectie:
   console.log(window.BOLT_DB);
4. Check TravelDataService:
   await TravelDataService.getTravels();
```

### Probleem: Filters werken niet
**Oplossing:**
```
1. Check of tags correct zijn in database
2. Tags moeten lowercase zijn: "strand" niet "Strand"
3. Meerdere tags scheiden met komma: "strand,tropisch"
4. Refresh cache: Ctrl + Shift + R
```

### Probleem: URL parameters worden niet toegepast
**Oplossing:**
```
1. Check URL in browser: moet ?location=... bevatten
2. Check console voor errors
3. Wacht 1 seconde na page load (timing issue)
4. Verifieer dat Travel Overview op pagina staat
```

### Probleem: Hero niet zichtbaar
**Oplossing:**
```
1. Hard refresh: Ctrl + Shift + R
2. Check cache versie in index.html
3. Check console voor "Component type not found"
4. Verifieer component staat in sidebar
```

---

## 🎨 Styling Tips

### Hero Achtergrond Afbeeldingen:
**Aanbevolen Unsplash Zoektermen:**
```
- "tropical beach sunset"
- "mountain landscape"
- "travel adventure"
- "world map"
- "airplane window view"
```

**Aanbevolen Settings:**
```
Overlay Opacity: 0.5 (50%)
Titel Font Size: 56px
Subtitel Font Size: 20px
Badge Color: Goud (#fbbf24)
```

### Travel Overview Styling:
**Grid Layout:**
```
Desktop: 4 kolommen
Tablet: 2 kolommen
Mobile: 1 kolom
Gap: 24px
```

**Card Styling:**
```
Border Radius: 12px
Shadow: 0 4px 12px rgba(0,0,0,0.1)
Hover: translateY(-4px) + shadow boost
Transition: 0.3s ease
```

---

## 🚀 Advanced Features (Optioneel)

### Featured Reizen op Homepage:
```
1. Maak 3 reizen "featured" in database:
   UPDATE travels SET featured = true, priority = 1 WHERE id = '...';
2. Voeg Featured Reizen component toe op homepage
3. Toont automatisch top 3 featured reizen
```

### Breadcrumbs:
```
Homepage > Reizen > Thailand Strandvakanties
```

### Recent Searches:
```
Sla laatste 5 zoekopdrachten op in localStorage
Toon als quick links op /reizen pagina
```

### Analytics Tracking:
```javascript
// Track zoekacties
gtag('event', 'search', {
  search_term: location,
  category: 'Travel Search'
});

// Track "Boek nu" clicks
gtag('event', 'begin_checkout', {
  items: [{ item_name: travel.title }]
});
```

---

## 📊 Resultaat

### Wat je nu hebt:
✅ Professionele homepage met zoekfunctionaliteit  
✅ Reizen overzicht pagina met alle reizen  
✅ Werkende zoek & filter functionaliteit  
✅ URL parameters voor deep linking  
✅ Featured reizen support  
✅ Responsive design  
✅ Database integratie  
✅ Real-time zoeken  

### User Flow:
```
1. Bezoeker komt op homepage
2. Ziet mooie hero met zoekformulier
3. Vult bestemming en voorkeuren in
4. Klikt "Zoek Reizen"
5. Komt op /reizen met gefilterde resultaten
6. Ziet alleen relevante reizen
7. Klikt "Boek nu" op favoriete reis
8. Conversie! 🎉
```

---

## 📞 Support

**Als iets niet werkt:**
1. Check deze instructies nogmaals
2. Bekijk `HERO_TO_REIZEN_FLOW.md` voor technische details
3. Bekijk `TRAVEL_DATA_FLOW.md` voor database info
4. Check browser console voor errors
5. Verifieer cache versies zijn geüpdatet

**Belangrijke Files:**
- `js/components.js` - Hero & Travel Overview componenten
- `js/services/travelDataService.js` - Data management
- `js/properties.js` - Properties panel
- `index.html` - Component lijst & script loading

---

**Succes met het opzetten van je reizen systeem!** 🌍✈️🎉
