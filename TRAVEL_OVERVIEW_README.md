# Travel Overview Component - Documentatie

## Overzicht

De **Travel Overview** component is een krachtige pagina voor het tonen van reizen met zoek- en boekfunctionaliteit. Het component laadt reizen via de Travel Compositor API en biedt filtering en zoekfunctionaliteit.

## Features

### 🔍 Zoekfunctionaliteit
- Real-time zoeken in reis titels, locaties en beschrijvingen
- Zoekbalk met visuele feedback
- Instant filtering zonder page reload

### 🏷️ Filter Systeem
- Standaard filters: Alle, Strandvakanties, Rondreis, Stedentrip, Actief, Cultuur
- Klikbare filter buttons met actieve status
- Combineerbaar met zoekfunctie
- Filters zijn configureerbaar via component opties

### 💳 Boek Functionaliteit
- "Boek nu" button op elke reis kaart
- Prijs weergave met "Vanaf" label
- Duur badge (bijv. "8 dagen")
- Locatie badge met icoon

### 🎨 Design
- Responsive grid layout (min 320px per kaart)
- Hover effecten op kaarten
- Mooie afbeeldingen met overlay badges
- Professionele kleurenschema (blauw accent: #0284c7)

## Gebruik in Website Builder

### Component Toevoegen
1. Open de Website Builder
2. Ga naar **Reis Componenten** sectie
3. Sleep **🌍 Reizen Overzicht (Zoek & Boek)** naar de pagina

### Configuratie via Properties Panel
Wanneer je het component selecteert, kun je aanpassen:
- **Titel**: Hoofdtitel van de sectie
- **Badge Tekst**: Kleine badge boven de titel
- **Zoekbalk Placeholder**: Tekst in de zoekbalk

## Filters Configureren

### Methode 1: Via Component Opties (Code)
```javascript
ComponentFactory.createTravelOverview({
    filters: ['Alle', 'Strandvakanties', 'Rondreis', 'Stedentrip', 'Actief', 'Cultuur', 'Luxe'],
    showFilters: true,
    maxTravels: 9
});
```

### Methode 2: Via BOLT (Toekomstig)
In de toekomst kun je filters configureren via BOLT:
1. Selecteer Travel Overview component
2. Klik op **⚡ Configureer in BOLT** button
3. Voeg filters toe/verwijder filters
4. Stel filter regels in (tags matching)

### Filter Tags Systeem
Elke reis heeft tags die matchen met filters:
```javascript
{
    title: 'Rondreis Bangkok & Eilanden',
    tags: 'rondreis,strand,cultuur'  // Comma-separated tags
}
```

Filters matchen op basis van deze tags:
- Filter "Rondreis" toont alle reizen met tag "rondreis"
- Filter "Strand" toont alle reizen met tag "strand"
- Filter "Alle" toont altijd alle reizen

## Data Integratie met Travel Compositor

### Huidige Status
Het component toont momenteel **sample data** (3 voorbeeldreizen). 

### Toekomstige Integratie
De reizen worden automatisch geladen via Travel Compositor API:

```javascript
// Voorbeeld API call (wordt geïmplementeerd)
async function loadTravels() {
    const response = await fetch('/api/travels?micrositeId=XXX');
    const travels = await response.json();
    
    // Travels hebben deze structuur:
    // {
    //     id: '12345',
    //     title: 'Rondreis Thailand',
    //     location: 'Thailand',
    //     duration: '8 dagen',
    //     price: '€ 1.299',
    //     description: 'Ontdek de bruisende hoofdstad...',
    //     image: 'https://...',
    //     tags: 'rondreis,strand,cultuur'
    // }
}
```

### Data Mapping
Travel Compositor data wordt gemapped naar component format:
- `idea.name` → `title`
- `idea.destination` → `location`
- `idea.duration` → `duration` (bijv. "8 dagen")
- `idea.price` → `price` (bijv. "€ 1.299")
- `idea.description` → `description`
- `idea.mainImage` → `image`
- `idea.travelType` → `tags` (voor filtering)

## Customization

### Kleuren Aanpassen
De component gebruikt CSS variabelen die je kunt overschrijven:

```css
.wb-travel-overview {
    --travel-primary: #0284c7;      /* Hoofdkleur */
    --travel-primary-dark: #0369a1; /* Hover kleur */
    --travel-bg: #e0f2fe;           /* Badge achtergrond */
}
```

### Sample Data Aanpassen
Je kunt de sample data aanpassen in `components.js`:

```javascript
const sampleTravels = [
    { 
        image: 'https://...',
        duration: '8 dagen',
        location: 'Thailand',
        title: 'Jouw Reis Titel',
        description: 'Jouw beschrijving',
        price: '€ 1.299',
        tags: 'rondreis,strand'
    }
];
```

## Filter Configuratie Opties

### Standaard Filters
```javascript
['Alle', 'Strandvakanties', 'Rondreis', 'Stedentrip', 'Actief', 'Cultuur']
```

### Aanbevolen Filter Sets

**Voor Algemene Reisorganisatie:**
```javascript
['Alle', 'Strandvakanties', 'Rondreis', 'Stedentrip', 'Actief', 'Cultuur', 'Luxe', 'Budget']
```

**Voor Gespecialiseerde Organisatie:**
```javascript
// Avontuurlijke reizen
['Alle', 'Trekking', 'Safari', 'Duiken', 'Klimmen', 'Fietsen']

// Luxe reizen
['Alle', '5-Sterren', 'Private Tours', 'Cruise', 'Wellness']

// Familie reizen
['Alle', 'Kinderen', 'Tieners', 'Multi-generatie', 'All-Inclusive']
```

## BOLT Integratie (Toekomstig)

### Filter Management in BOLT
```json
{
    "component": "travel-overview",
    "filters": {
        "enabled": true,
        "options": [
            {
                "label": "Alle",
                "value": "alle",
                "default": true
            },
            {
                "label": "Strandvakanties",
                "value": "strand",
                "tags": ["strand", "beach", "zee"]
            },
            {
                "label": "Rondreis",
                "value": "rondreis",
                "tags": ["rondreis", "roadtrip", "tour"]
            }
        ]
    },
    "dataSource": {
        "type": "travel-compositor",
        "micrositeId": "YOUR_MICROSITE_ID",
        "filters": {
            "status": "published",
            "minPrice": 0,
            "maxPrice": 5000
        }
    }
}
```

### API Endpoints voor Filters
```
GET /api/travels/filters          # Haal beschikbare filters op
POST /api/travels/filters         # Maak nieuwe filter
PUT /api/travels/filters/:id      # Update filter
DELETE /api/travels/filters/:id   # Verwijder filter
```

## Troubleshooting

### Filters werken niet
- Check of de `tags` property correct is ingesteld op reis data
- Verifieer dat filter values lowercase zijn
- Controleer browser console voor JavaScript errors

### Zoeken werkt niet
- Zorg dat `.travel-card-title`, `.travel-card-location`, en `.travel-card-description` classes aanwezig zijn
- Check of de zoekfunctie correct is geïnitialiseerd

### Geen reizen zichtbaar
- Controleer of Travel Compositor API correct is geconfigureerd
- Verifieer dat `maxTravels` niet op 0 staat
- Check of er sample data aanwezig is

## Roadmap

- [ ] **BOLT Integratie**: Filter configuratie via BOLT interface
- [ ] **Travel Compositor API**: Automatisch laden van reizen
- [ ] **Advanced Filtering**: Prijs range, datum filters, aantal personen
- [ ] **Sorting**: Sorteer op prijs, populariteit, datum
- [ ] **Pagination**: Laad meer reizen bij scrollen
- [ ] **Favorieten**: Sla favoriete reizen op
- [ ] **Vergelijken**: Vergelijk meerdere reizen
- [ ] **Direct Boeken**: Integratie met boekingssysteem

## Support

Voor vragen of problemen:
1. Check deze documentatie
2. Bekijk de console voor error messages
3. Controleer de Travel Compositor API configuratie
4. Test met sample data eerst

## Changelog

### v1.0.0 (Huidig)
- ✅ Basis Travel Overview component
- ✅ Zoekfunctionaliteit
- ✅ Filter systeem
- ✅ Responsive design
- ✅ Sample data
- ✅ Properties panel configuratie
- ⏳ BOLT integratie (gepland)
- ⏳ Travel Compositor API (gepland)
