# Travel Compositor Integration - Roadmap

## ✅ Fase 1: Basis Integratie (VOLTOOID)
- [x] API authenticatie met Travel Compositor
- [x] Invoerveld voor Travel Compositor ID
- [x] Reis ophalen en tonen
- [x] Basis weergave van reisgegevens
- [x] "Bewerken in Builder" functie

## 🚧 Fase 2: Zoek & Listing (TODO)

### 2.1 Zoekpagina
- [ ] Zoekformulier met filters:
  - Bestemming
  - Datumbereik
  - Aantal personen
  - Prijsrange
  - Thema's
- [ ] Zoekresultaten tonen als cards
- [ ] Paginering voor resultaten
- [ ] Sorteren (prijs, datum, populariteit)

### 2.2 Listing Pagina
- [ ] Overzicht van alle beschikbare reizen
- [ ] Filter sidebar
- [ ] Grid/List view toggle
- [ ] Quick view modal voor snelle preview

### 2.3 Detail Pagina
- [ ] Volledige reis informatie
- [ ] Foto galerij
- [ ] Dag-voor-dag itinerary
- [ ] Prijs breakdown
- [ ] Boekingsformulier
- [ ] Reviews/ratings (indien beschikbaar)

## 🎨 Fase 3: Builder Integratie met Cards (TODO)

### 3.1 Card Componenten
Elk onderdeel van de reis wordt een aparte, bewerk bare card:

#### Transport Card
```
┌─────────────────────────────────┐
│ 🛫 Transport                    │
│ Amsterdam → Barcelona           │
│ KLM Flight KL1234              │
│ 10:30 - 13:45 (3u 15min)      │
│ € 250 per persoon              │
└─────────────────────────────────┘
```

#### Hotel/Accommodation Card
```
┌─────────────────────────────────┐
│ 🏨 Hotel                        │
│ Hotel Barcelona Plaza ⭐⭐⭐⭐    │
│ 3 nachten, 2 personen          │
│ Ontbijt inbegrepen             │
│ € 450 totaal                   │
└─────────────────────────────────┘
```

#### Destination/Activity Card
```
┌─────────────────────────────────┐
│ 📍 Bestemming                   │
│ Barcelona City Tour            │
│ Dag 2: Sagrada Familia         │
│ 3 uur, inclusief gids          │
│ € 45 per persoon               │
└─────────────────────────────────┘
```

#### Transfer Card
```
┌─────────────────────────────────┐
│ 🚕 Transfer                     │
│ Luchthaven → Hotel             │
│ Private transfer               │
│ 30 minuten                     │
│ € 35 per rit                   │
└─────────────────────────────────┘
```

### 3.2 Card Features
- [ ] Drag & drop om volgorde te wijzigen
- [ ] Inline editing van teksten
- [ ] Verwijderen van cards
- [ ] Dupliceren van cards
- [ ] Collapse/expand voor details
- [ ] Styling opties per card
- [ ] Icon picker voor card type

### 3.3 Layout Opties
- [ ] Verticale timeline layout (standaard)
- [ ] Grid layout (2 of 3 kolommen)
- [ ] Accordion layout (inklapbaar)
- [ ] Tabs layout (per dag)
- [ ] Custom spacing tussen cards

### 3.4 Card Componenten in ComponentFactory
```javascript
// Nieuwe component types toevoegen:
- 'travel-transport-card'
- 'travel-hotel-card'
- 'travel-destination-card'
- 'travel-transfer-card'
- 'travel-day-header'
```

## 🔄 Fase 4: Sync met Travel Compositor (TODO)

### 4.1 Real-time Updates
- [ ] Prijs updates ophalen
- [ ] Beschikbaarheid checken
- [ ] Wijzigingen detecteren

### 4.2 Booking Flow
- [ ] Quote aanvragen
- [ ] Confirm booking
- [ ] Prebook
- [ ] Final booking
- [ ] Voucher genereren

### 4.3 Data Sync
- [ ] Wijzigingen opslaan naar TC
- [ ] Conflict resolution
- [ ] Version control

## 📊 Fase 5: Analytics & Reporting (TODO)
- [ ] Populaire reizen tracking
- [ ] Conversie metrics
- [ ] Prijs trends
- [ ] Booking statistics

## 🎯 Prioriteit voor Volgende Sessie

**Meest urgent:**
1. Fix "Bewerken in Builder" functie (✅ GEDAAN)
2. Maak basis Travel Card componenten
3. Implementeer card layout in builder
4. Test met echte TC data

**Nice to have:**
5. Zoekpagina
6. Listing pagina
7. Filters

## 💡 Technische Overwegingen

### Data Structuur
```javascript
{
  id: "12345",
  name: "Barcelona Citytrip",
  days: [
    {
      dayNumber: 1,
      date: "2024-06-01",
      items: [
        { type: "transport", data: {...} },
        { type: "transfer", data: {...} },
        { type: "hotel", data: {...} }
      ]
    },
    {
      dayNumber: 2,
      date: "2024-06-02",
      items: [
        { type: "destination", data: {...} },
        { type: "activity", data: {...} }
      ]
    }
  ],
  price: {...},
  participants: {...}
}
```

### Component Naming Convention
- `travel-card-transport`
- `travel-card-hotel`
- `travel-card-destination`
- `travel-card-transfer`
- `travel-card-activity`
- `travel-timeline` (container)

### Styling
- Gebruik consistent color scheme per card type
- Icons van Font Awesome
- Responsive design (mobile-first)
- Smooth animations voor drag & drop

## 📝 Notes
- Alle TC data moet cached worden voor performance
- Implementeer error handling voor API failures
- Denk aan offline mode (cached data)
- Multilanguage support (NL/EN/DE/FR)
