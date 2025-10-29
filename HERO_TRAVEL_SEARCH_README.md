# Hero Travel Search Component

## 🎯 Overzicht

Een prachtige hero sectie met **werkende zoek & boek functionaliteit** voor reizen. Perfect voor de homepage om bezoekers direct te laten zoeken naar hun ideale reis.

## ✨ Features

### 🔍 Zoekfunctionaliteit
- **4 Zoekvelden:**
  - 📍 Bestemming (waar wil je naartoe?)
  - 🏷️ Type Reis (strand, rondreis, etc.)
  - 📅 Duur (aantal dagen)
  - 💰 Budget (max prijs)

### 🎨 Design
- Fullscreen hero met achtergrondafbeelding
- Gradient overlay voor leesbaarheid
- Witte zoekbox met schaduw
- Responsive grid layout
- Hover effecten op buttons

### ⚡ Interactie
- **Populaire Bestemmingen**: Quick links (Thailand, Spanje, Italië, Griekenland, Frankrijk)
- **Smooth Scroll**: Scrollt automatisch naar Travel Overview resultaten
- **Real-time Filtering**: Past filters toe op Travel Overview component
- **Custom Events**: Dispatcht `travelSearch` event voor advanced integraties

## 🚀 Gebruik

### In Website Builder

1. **Component Toevoegen**
   - Ga naar "Hero Componenten"
   - Sleep "🔍 Hero Zoek & Boek Reizen" naar de pagina
   - Plaats bovenaan de homepage

2. **Travel Overview Toevoegen**
   - Voeg "🌍 Reizen Overzicht" component toe onder de hero
   - De zoekfunctie werkt automatisch met dit component

3. **Aanpassen**
   - Klik op de hero om properties te openen
   - Pas titel, subtitel en badge aan
   - Wijzig achtergrondafbeelding via Media Picker

## 🎨 Customization

### Teksten Aanpassen
```javascript
ComponentFactory.createHeroTravelSearch({
    title: 'Jouw Droomreis Begint Hier',
    subtitle: 'Ontdek meer dan 1000 bestemmingen wereldwijd',
    background: 'https://jouw-afbeelding.jpg',
    overlayOpacity: 0.5
});
```

### Populaire Bestemmingen
```javascript
ComponentFactory.createHeroTravelSearch({
    popularDestinations: [
        'Bali', 'New York', 'Parijs', 'Tokyo', 'Malediven'
    ]
});
```

## 🔧 Hoe het Werkt

### Flow
```
1. Gebruiker vult zoekvelden in
   ↓
2. Klikt op "Zoek Reizen" button
   ↓
3. Component zoekt Travel Overview op pagina
   ↓
4. Past filters toe op Travel Overview
   ↓
5. Scrollt smooth naar resultaten
```

### Code Voorbeeld
```javascript
// Zoek button click handler
searchBtn.addEventListener('click', async () => {
    const location = document.getElementById('searchLocation')?.value.trim();
    const type = document.getElementById('searchType')?.value.trim();
    
    // Find Travel Overview component
    const travelOverview = document.querySelector('.wb-travel-overview');
    
    if (travelOverview) {
        // Apply location search
        const searchInput = travelOverview.querySelector('.travel-search-input');
        if (searchInput && location) {
            searchInput.value = location;
            searchInput.dispatchEvent(new Event('input'));
        }
        
        // Apply type filter
        if (type) {
            const filterBtns = travelOverview.querySelectorAll('.travel-filter-btn');
            filterBtns.forEach(btn => {
                if (btn.textContent.toLowerCase().includes(type.toLowerCase())) {
                    btn.click();
                }
            });
        }
        
        // Scroll to results
        travelOverview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});
```

## 📋 Properties Panel

### Beschikbare Opties
- ✏️ **Titel**: Hoofdtitel van de hero
- ✏️ **Subtitel**: Ondertitel/beschrijving
- ✏️ **Badge Tekst**: Kleine badge boven titel
- 🖼️ **Achtergrond Afbeelding**: Kies via Media Picker
- 🗑️ **Verwijderen**: Verwijder het component

### Info Box
Toont uitleg over de zoek & boek functionaliteit en herinnert om Travel Overview component toe te voegen.

## 🎯 Use Cases

### Homepage Setup
```
┌─────────────────────────────────┐
│  Hero Travel Search             │  ← Zoekfunctionaliteit
│  "Vind Jouw Perfecte Reis"     │
└─────────────────────────────────┘
         ↓ (smooth scroll)
┌─────────────────────────────────┐
│  Travel Overview                │  ← Resultaten
│  Grid met reizen                │
└─────────────────────────────────┘
```

### Landingspagina
```
Hero Travel Search
    ↓
Featured Reizen (3 kaarten)
    ↓
Travel Overview (alle reizen)
    ↓
Footer
```

## 🔌 Advanced Integration

### Custom Event Listener
```javascript
// Listen voor zoek events
document.addEventListener('travelSearch', (event) => {
    const { location, type, duration, price } = event.detail;
    console.log('Zoeken naar:', location, type, duration, price);
    
    // Custom logic hier
    // Bijv. Google Analytics tracking
    gtag('event', 'travel_search', {
        destination: location,
        travel_type: type
    });
});
```

### API Integration
```javascript
// Zoek in externe API
searchBtn.addEventListener('click', async () => {
    const location = document.getElementById('searchLocation')?.value;
    
    // Call externe API
    const response = await fetch(`/api/travels/search?location=${location}`);
    const results = await response.json();
    
    // Update Travel Overview met resultaten
    updateTravelOverview(results);
});
```

## 🎨 Styling

### CSS Classes
- `.wb-hero-travel-search` - Main container
- `.hero-bg` - Background container
- `.travel-search-box` - Search box
- `.hero-content` - Content wrapper

### Inline Styles
Alle styling is inline voor maximale compatibiliteit en geen externe CSS dependencies.

## 📱 Responsive

### Breakpoints
- **Desktop (>1200px)**: 4 kolommen zoekbox
- **Tablet (768-1200px)**: 2 kolommen zoekbox
- **Mobile (<768px)**: 1 kolom zoekbox

### Grid Layout
```css
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
```

## 🚨 Troubleshooting

### Zoeken werkt niet
**Probleem**: Klikken op "Zoek Reizen" doet niets

**Oplossing**:
1. Check of Travel Overview component op pagina staat
2. Open console en kijk naar errors
3. Verifieer dat `.wb-travel-overview` class aanwezig is

### Geen resultaten
**Probleem**: Zoeken geeft geen resultaten

**Oplossing**:
1. Check of er reizen in database staan
2. Verifieer TravelDataService werkt: `console.log(window.TravelDataService)`
3. Test handmatig: `await TravelDataService.getTravels()`

### Styling issues
**Probleem**: Hero ziet er niet goed uit

**Oplossing**:
1. Check of achtergrondafbeelding laadt
2. Verifieer `min-height: 600px` is ingesteld
3. Test in verschillende browsers

## 📊 Analytics

### Track Zoekacties
```javascript
document.addEventListener('travelSearch', (event) => {
    // Google Analytics
    gtag('event', 'search', {
        search_term: event.detail.location,
        category: 'Travel Search'
    });
    
    // Facebook Pixel
    fbq('track', 'Search', {
        search_string: event.detail.location
    });
});
```

## 🔄 Updates & Roadmap

### Huidige Versie (v1.0)
- ✅ Basis zoekfunctionaliteit
- ✅ 4 zoekvelden
- ✅ Populaire bestemmingen
- ✅ Smooth scroll naar resultaten
- ✅ Custom events

### Toekomstige Features
- 🔲 Datepicker voor reisdatum
- 🔲 Aantal personen selector
- 🔲 Autocomplete voor bestemmingen
- 🔲 Prijs range slider
- 🔲 Geavanceerde filters (sterren, voorzieningen)
- 🔲 Opgeslagen zoekopdrachten
- 🔲 Zoekgeschiedenis

## 💡 Tips

1. **Afbeelding Keuze**: Gebruik high-quality afbeeldingen van Unsplash
2. **Overlay Opacity**: 0.4-0.6 werkt het beste voor leesbaarheid
3. **Populaire Bestemmingen**: Pas aan op basis van jouw aanbod
4. **Combineer met Featured**: Toon featured reizen direct onder hero
5. **A/B Testing**: Test verschillende titels en CTA's

## 📚 Gerelateerde Componenten

- **Travel Overview**: Toont zoekresultaten
- **Featured Reizen**: Highlight top reizen
- **Travel Cards**: Individuele reis kaarten
- **Filter Systeem**: Advanced filtering

## 🤝 Support

Voor vragen of problemen:
1. Check deze documentatie
2. Bekijk `TRAVEL_DATA_FLOW.md` voor data flow
3. Test met browser console
4. Verifieer database connectie

---

**Gemaakt voor**: Website Builder  
**Component Type**: Hero  
**Versie**: 1.0.0  
**Laatst Bijgewerkt**: 2025
