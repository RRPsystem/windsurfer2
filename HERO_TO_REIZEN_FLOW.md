# Hero Search → /reizen Pagina Flow

## 🎯 Complete Flow Uitleg

### Scenario: Gebruiker zoekt op homepage, komt uit op /reizen pagina

```
┌─────────────────────────────────────────────────────────────┐
│                    HOMEPAGE (/)                              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Hero Travel Search                                 │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │ Bestemming: [Thailand____________]           │  │    │
│  │  │ Type Reis:  [Strand______________]           │  │    │
│  │  │ Duur:       [7 dagen_____________]           │  │    │
│  │  │ Budget:     [1500________________]           │  │    │
│  │  │                                              │  │    │
│  │  │         [🔍 Zoek Reizen]                     │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Click "Zoek Reizen"
                           ▼
              window.location.href = 
              "/reizen?location=Thailand&type=Strand&duration=7 dagen&price=1500"
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 REIZEN PAGINA (/reizen)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Travel Overview                                    │    │
│  │  ┌──────────────────────────────────────────────┐  │    │
│  │  │ Zoekbalk: [Thailand] ← Auto-ingevuld         │  │    │
│  │  │                                              │  │    │
│  │  │ Filters: [Alle] [Strand✓] [Rondreis] ...   │  │    │
│  │  │          ↑ Auto-actief                       │  │    │
│  │  └──────────────────────────────────────────────┘  │    │
│  │                                                     │    │
│  │  📍 Thailand Strandreizen (3 resultaten)           │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐                 │    │
│  │  │ Phuket │ │  Krabi │ │Koh Sam.│                 │    │
│  │  │ 7 dgn  │ │ 7 dgn  │ │ 7 dgn  │                 │    │
│  │  │ €1.299 │ │ €1.450 │ │ €1.399 │                 │    │
│  │  └────────┘ └────────┘ └────────┘                 │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Stap-voor-Stap

### 1️⃣ Homepage - Gebruiker vult formulier in
```javascript
// Gebruiker vult in:
Bestemming: "Thailand"
Type Reis: "Strand"
Duur: "7 dagen"
Budget: "1500"
```

### 2️⃣ Hero Search - Bouwt URL met parameters
```javascript
// In Hero Travel Search component:
searchBtn.addEventListener('click', () => {
    const location = 'Thailand';
    const type = 'Strand';
    const duration = '7 dagen';
    const price = '1500';
    
    // Bouw URL parameters
    const params = new URLSearchParams();
    params.set('location', location);
    params.set('type', type);
    params.set('duration', duration);
    params.set('price', price);
    
    // Redirect naar /reizen
    window.location.href = `/reizen?${params.toString()}`;
    // → /reizen?location=Thailand&type=Strand&duration=7%20dagen&price=1500
});
```

### 3️⃣ /reizen Pagina - Laadt met parameters
```
URL: /reizen?location=Thailand&type=Strand&duration=7%20dagen&price=1500
```

### 4️⃣ Travel Overview - Leest parameters en past filters toe
```javascript
// In Travel Overview component:
const applyUrlFilters = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const location = urlParams.get('location'); // "Thailand"
    const type = urlParams.get('type');         // "Strand"
    
    // Vul zoekbalk in
    searchInput.value = location;
    searchInput.dispatchEvent(new Event('input'));
    
    // Activeer filter
    filterBtns.forEach(btn => {
        if (btn.textContent.includes(type)) {
            btn.click(); // Activeer "Strand" filter
        }
    });
    
    // Scroll naar resultaten
    section.scrollIntoView({ behavior: 'smooth' });
};
```

### 5️⃣ Resultaat - Gefilterde reizen
```
✅ Zoekbalk toont: "Thailand"
✅ Filter "Strand" is actief
✅ Alleen Thailand strandreizen zichtbaar
✅ Pagina scrollt naar resultaten
```

## 🛠️ Setup Instructies

### Stap 1: Maak Homepage
```
1. Maak nieuwe pagina: "Home" (slug: /)
2. Voeg toe: Hero Travel Search component
3. Optioneel: Featured reizen, testimonials, etc.
```

### Stap 2: Maak Reizen Pagina
```
1. Maak nieuwe pagina: "Reizen" (slug: /reizen)
2. Voeg toe: Travel Overview component
3. Klaar! URL parameters worden automatisch verwerkt
```

### Stap 3: Test de Flow
```
1. Ga naar homepage (/)
2. Vul zoekformulier in
3. Klik "Zoek Reizen"
4. Wordt doorgestuurd naar /reizen met filters actief
```

## 🔧 Technische Details

### URL Parameters Format
```
/reizen?location=Thailand&type=Strand&duration=7%20dagen&price=1500

Parameters:
- location: Zoekterm voor bestemming
- type: Filter type (strand, rondreis, etc.)
- duration: Aantal dagen
- price: Max budget
```

### Timing & Delays
```javascript
// Travel Overview gebruikt delays om te wachten op data:
setTimeout(() => searchInput.dispatchEvent(new Event('input')), 500);  // Zoeken
setTimeout(() => filterBtn.click(), 600);                               // Filter
setTimeout(() => section.scrollIntoView(), 700);                        // Scroll
```

### Fallback Gedrag
```javascript
// Als Travel Overview OP DEZELFDE PAGINA staat:
if (travelOverview) {
    // Direct filters toepassen (geen redirect)
    searchInput.value = location;
    filterBtn.click();
    section.scrollIntoView();
} else {
    // Redirect naar /reizen
    window.location.href = `/reizen?location=${location}`;
}
```

## 📱 Use Cases

### Use Case 1: Aparte Pagina's (Aanbevolen)
```
Homepage (/)
└─ Hero Travel Search

Reizen Pagina (/reizen)
└─ Travel Overview

✅ Schone URL structuur
✅ SEO vriendelijk
✅ Betere user experience
```

### Use Case 2: Alles op Homepage
```
Homepage (/)
├─ Hero Travel Search
└─ Travel Overview

✅ Geen page load
✅ Instant resultaten
✅ Simpeler voor gebruiker
```

### Use Case 3: Meerdere Reizen Pagina's
```
Homepage (/)
└─ Hero Travel Search

Strandvakanties (/strandvakanties)
└─ Travel Overview (pre-filtered op "strand")

Rondreizen (/rondreizen)
└─ Travel Overview (pre-filtered op "rondreis")

→ Hero kan naar specifieke pagina's linken op basis van type
```

## 🎨 Customization

### Wijzig Target URL
```javascript
// In Hero Travel Search, wijzig:
const targetUrl = `/reizen?${queryString}`;

// Naar bijvoorbeeld:
const targetUrl = `/alle-reizen?${queryString}`;
// of
const targetUrl = `/zoekresultaten?${queryString}`;
```

### Extra Parameters Toevoegen
```javascript
// Voeg extra velden toe aan Hero:
const params = new URLSearchParams();
params.set('location', location);
params.set('type', type);
params.set('duration', duration);
params.set('price', price);
params.set('persons', persons);      // Nieuw
params.set('departure', departure);  // Nieuw

// Travel Overview moet deze ook lezen:
const persons = urlParams.get('persons');
const departure = urlParams.get('departure');
```

### Filter Mapping
```javascript
// Als filter namen niet exact matchen:
const filterMapping = {
    'strand': 'Strandvakanties',
    'rondreis': 'Rondreis',
    'city': 'Stedentrip'
};

const mappedType = filterMapping[type] || type;
// Gebruik mappedType voor filter matching
```

## 🐛 Troubleshooting

### Probleem: Filters worden niet toegepast
**Oorzaak**: Timing issues, filters laden te langzaam

**Oplossing**:
```javascript
// Verhoog delays in Travel Overview:
setTimeout(() => searchInput.dispatchEvent(new Event('input')), 1000);
setTimeout(() => filterBtn.click(), 1200);
```

### Probleem: URL parameters verdwijnen
**Oorzaak**: Page refresh of navigation

**Oplossing**:
```javascript
// Bewaar parameters in sessionStorage:
sessionStorage.setItem('travelSearch', JSON.stringify({
    location, type, duration, price
}));

// Lees bij page load:
const savedSearch = JSON.parse(sessionStorage.getItem('travelSearch'));
```

### Probleem: Geen resultaten na zoeken
**Oorzaak**: Geen reizen in database of filter te streng

**Oplossing**:
```javascript
// Check in console:
await TravelDataService.getTravels();
// Verifieer dat er reizen zijn met matching tags
```

## 📊 Analytics Tracking

### Track Zoekacties
```javascript
// In Hero Travel Search:
searchBtn.addEventListener('click', () => {
    // Google Analytics
    gtag('event', 'search', {
        search_term: location,
        category: 'Travel Search',
        label: type
    });
    
    // Facebook Pixel
    fbq('track', 'Search', {
        search_string: location,
        content_category: type
    });
});
```

### Track Conversions
```javascript
// In Travel Overview, bij "Boek nu" click:
bookBtn.addEventListener('click', () => {
    gtag('event', 'begin_checkout', {
        items: [{
            item_name: travel.title,
            item_category: travel.tags,
            price: travel.priceRaw
        }]
    });
});
```

## ✅ Checklist

### Setup Checklist
- [ ] Homepage gemaakt met Hero Travel Search
- [ ] /reizen pagina gemaakt met Travel Overview
- [ ] Test: Zoeken op homepage → komt uit op /reizen
- [ ] Test: URL parameters worden correct toegepast
- [ ] Test: Filters werken op /reizen pagina
- [ ] Test: Zoekbalk wordt automatisch ingevuld
- [ ] Test: Scroll naar resultaten werkt

### Optional Enhancements
- [ ] Loading indicator tijdens redirect
- [ ] "Geen resultaten" message
- [ ] Breadcrumbs (Home > Zoekresultaten)
- [ ] "Zoek opnieuw" button op /reizen
- [ ] Recent searches opslaan
- [ ] Suggesties tijdens typen

## 🚀 Live Example

### Homepage URL
```
https://jouw-website.nl/
```

### Zoekactie
```
Gebruiker vult in: "Bali" + "Strand"
Klikt: "Zoek Reizen"
```

### Resultaat URL
```
https://jouw-website.nl/reizen?location=Bali&type=Strand
```

### Wat Gebruiker Ziet
```
✅ URL: /reizen?location=Bali&type=Strand
✅ Zoekbalk: "Bali"
✅ Filter: "Strandvakanties" actief
✅ Resultaten: 5 Bali strandreizen
✅ Smooth scroll naar resultaten
```

---

**Perfect voor**: Professionele reiswebsites met aparte zoek- en resultaten pagina's  
**SEO Voordeel**: Elke zoekopdracht heeft unieke URL  
**User Experience**: Duidelijke flow van zoeken naar resultaten
