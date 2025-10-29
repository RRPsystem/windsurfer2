# Travel Data Flow - Van Import tot Website

## 🔄 Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    1. REIS IMPORTEREN                        │
│                     (Travel View)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├─► Handmatig opbouwen
                       ├─► Travel Compositor API
                       ├─► PDF uitlezen
                       └─► URL scannen
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              2. OPSLAAN IN SUPABASE/BOLT                     │
│              (TravelDataService.saveTravel)                  │
│                                                              │
│  Database tabel: `travels`                                   │
│  Velden:                                                     │
│  - id, title, location, duration, price                      │
│  - description, image, tags                                  │
│  - featured (boolean) ⭐                                     │
│  - priority (integer) - lagere = hoger                       │
│  - status (draft/published/archived)                         │
│  - source (manual/tc/pdf/url)                                │
│  - created_at, updated_at                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   3. BEHEREN IN BOLT                         │
│                  (BOLT Interface)                            │
│                                                              │
│  Acties:                                                     │
│  - ⭐ Featured toggle (uitgelicht op homepage)              │
│  - 🔢 Priority aanpassen (volgorde)                         │
│  - ✏️ Bewerken (titel, prijs, beschrijving)                │
│  - 🗑️ Verwijderen                                           │
│  - 📊 Status wijzigen (draft/published/archived)            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              4. TONEN OP WEBSITE                             │
│           (Travel Overview Component)                        │
│                                                              │
│  Features:                                                   │
│  - 🔍 Zoeken in titel/locatie/beschrijving                  │
│  - 🏷️ Filteren op tags (strand, rondreis, etc.)            │
│  - ⭐ Featured reizen bovenaan                              │
│  - 🔢 Gesorteerd op priority                                │
│  - 💳 "Boek nu" buttons                                     │
│  - 📱 Responsive grid layout                                │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Componenten

### 1. TravelDataService (`js/services/travelDataService.js`)
**Verantwoordelijk voor:** Data ophalen/opslaan uit Supabase

**Belangrijkste functies:**
```javascript
// Haal alle reizen op (met filtering)
await TravelDataService.getTravels({
    status: 'published',
    featured: true,
    limit: 10
});

// Haal featured reizen
await TravelDataService.getFeaturedTravels();

// Sla nieuwe reis op
await TravelDataService.saveTravel({
    title: 'Rondreis Thailand',
    location: 'Thailand',
    duration: '8 dagen',
    price: 1299,
    description: '...',
    tags: 'rondreis,strand',
    featured: false,
    priority: 999
});

// Update reis (bijv. featured toggle)
await TravelDataService.updateTravel('reis_id', {
    featured: true,
    priority: 1
});
```

### 2. Travel Overview Component (`js/components.js`)
**Verantwoordelijk voor:** Reizen tonen op website

**Features:**
- ✅ Laadt reizen dynamisch via TravelDataService
- ✅ Toont loading indicator tijdens laden
- ✅ Featured badge voor uitgelichte reizen
- ✅ Zoekfunctionaliteit (real-time)
- ✅ Filter systeem (tags)
- ✅ Sortering op priority + datum
- ✅ "Boek nu" buttons
- ✅ Responsive design

### 3. Travel View (`js/views/travelView.js`)
**Verantwoordelijk voor:** Reizen importeren/opbouwen

**Moet nog worden geüpdatet:**
```javascript
// Na importeren/opbouwen, sla op in BOLT:
const travelData = {
    title: data.name,
    location: data.destination,
    duration: `${data.days} dagen`,
    price: data.price,
    // ... etc
};

// Sla op via TravelDataService
await TravelDataService.saveTravel(travelData);
```

## 🗄️ Database Schema

### Supabase Tabel: `travels`

```sql
CREATE TABLE travels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basis info
    title TEXT NOT NULL,
    name TEXT,
    location TEXT,
    destination TEXT,
    duration TEXT,
    days INTEGER,
    
    -- Prijs
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    
    -- Content
    description TEXT,
    intro TEXT,
    image TEXT,
    main_image TEXT,
    
    -- Categorisatie
    tags TEXT,
    travel_type TEXT,
    
    -- BOLT Metadata
    featured BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 999,
    status TEXT DEFAULT 'published', -- draft, published, archived
    source TEXT DEFAULT 'manual', -- manual, tc, pdf, url
    
    -- Extra data (JSON)
    destinations JSONB,
    hotels JSONB,
    transports JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_travels_status (status),
    INDEX idx_travels_featured (featured),
    INDEX idx_travels_priority (priority)
);
```

## 🎯 Featured & Priority Systeem

### Featured Reizen
- **Featured = TRUE**: Reis wordt uitgelicht met ⭐ badge
- Verschijnt bovenaan in Travel Overview
- Kan gebruikt worden voor homepage highlights

### Priority Systeem
- **Lagere waarde = Hogere prioriteit**
- Priority 1 = Bovenaan
- Priority 999 = Standaard (onderaan)
- Reizen worden gesorteerd: `ORDER BY priority ASC, created_at DESC`

**Voorbeeld:**
```javascript
// Top 3 featured reizen voor homepage
const featured = await TravelDataService.getTravels({
    featured: true,
    limit: 3
});

// Alle reizen, gesorteerd op priority
const all = await TravelDataService.getTravels({
    status: 'published'
});
```

## 🔧 Implementatie Stappen

### ✅ Klaar
1. ✅ TravelDataService gemaakt
2. ✅ Travel Overview component update (laadt data uit service)
3. ✅ Featured badge support
4. ✅ Priority sorting
5. ✅ Loading states
6. ✅ Error handling
7. ✅ Service geladen in index.html

### 🚧 Nog Te Doen
1. ⏳ Database tabel `travels` aanmaken in Supabase
2. ⏳ TravelView updaten om reizen op te slaan via service
3. ⏳ BOLT interface voor reis beheer
4. ⏳ Featured toggle in BOLT
5. ⏳ Priority drag & drop in BOLT

## 📝 Gebruik Voorbeelden

### Reis Opslaan (vanuit TravelView)
```javascript
// In travelView.js, na importeren:
async function saveImportedTravel(travelData) {
    try {
        const saved = await TravelDataService.saveTravel({
            title: travelData.name || travelData.title,
            location: travelData.destination,
            duration: `${travelData.days || 0} dagen`,
            days: travelData.days,
            price: travelData.price,
            currency: travelData.currency || 'EUR',
            description: travelData.description || travelData.intro,
            image: travelData.mainImage || travelData.image,
            tags: travelData.travelType || '',
            featured: false,
            priority: 999,
            status: 'published',
            source: 'tc', // of 'pdf', 'url', 'manual'
            destinations: travelData.destinations || [],
            hotels: travelData.hotels || [],
            transports: travelData.transports || []
        });
        
        console.log('Reis opgeslagen:', saved);
        return saved;
    } catch (error) {
        console.error('Fout bij opslaan:', error);
        throw error;
    }
}
```

### Featured Toggle (in BOLT)
```javascript
// Toggle featured status
async function toggleFeatured(travelId, currentFeatured) {
    await TravelDataService.updateTravel(travelId, {
        featured: !currentFeatured,
        priority: !currentFeatured ? 1 : 999 // Featured = priority 1
    });
}
```

### Priority Aanpassen (in BOLT)
```javascript
// Drag & drop handler
async function updatePriority(travelId, newPriority) {
    await TravelDataService.updateTravel(travelId, {
        priority: newPriority
    });
    
    // Refresh lijst
    TravelDataService.clearCache();
}
```

## 🎨 UI Features

### Travel Overview Component
- **Loading state**: Spinner tijdens laden
- **Empty state**: "Nog geen reizen beschikbaar" bericht
- **Error state**: Foutmelding met retry optie
- **Featured badge**: Gouden ⭐ badge voor featured reizen
- **Hover effects**: Cards tillen op bij hover
- **Responsive**: Grid past zich aan schermgrootte

### Zoeken & Filteren
```javascript
// Zoeken gebeurt client-side (real-time)
searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    cards.forEach(card => {
        const matches = 
            title.includes(searchTerm) ||
            location.includes(searchTerm) ||
            description.includes(searchTerm);
        card.style.display = matches ? 'block' : 'none';
    });
});

// Filteren op tags
filterBtn.addEventListener('click', function() {
    const filterValue = this.dataset.filter;
    cards.forEach(card => {
        const tags = card.dataset.tags;
        const matches = 
            filterValue === 'alle' || 
            tags.includes(filterValue);
        card.style.display = matches ? 'block' : 'none';
    });
});
```

## 🔍 Debugging

### Check of service werkt
```javascript
// In browser console:
console.log(window.TravelDataService);

// Test ophalen
const travels = await TravelDataService.getTravels();
console.log('Reizen:', travels);

// Test opslaan
const saved = await TravelDataService.saveTravel({
    title: 'Test Reis',
    location: 'Test',
    duration: '5 dagen',
    price: 500
});
console.log('Opgeslagen:', saved);
```

### Check database connectie
```javascript
// Check BOLT_DB config
console.log(window.BOLT_DB);
// Moet tonen: { url: "...", anonKey: "..." }
```

## 📚 Volgende Stappen

1. **Database Setup**
   - Maak `travels` tabel in Supabase
   - Stel permissions in (RLS policies)

2. **TravelView Update**
   - Integreer `saveTravel()` na import
   - Toon success/error messages

3. **BOLT Interface**
   - Reis lijst met featured toggle
   - Priority drag & drop
   - Edit/delete functies

4. **Homepage Integration**
   - Featured reizen component voor homepage
   - "Bekijk alle reizen" link naar Travel Overview

5. **Advanced Features**
   - Prijs range filter
   - Datum beschikbaarheid
   - Aantal personen
   - Sortering opties (prijs, populariteit)
