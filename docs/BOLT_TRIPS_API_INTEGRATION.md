# 🔌 BOLT trips-api Integratie - Complete Uitleg

## 📖 Overzicht

Dit document legt uit hoe de Builder (website) trips ophaalt van BOLT via de **trips-api endpoint**.

---

## 🏗️ Architectuur

```
┌─────────────────────────────────────────────────────────────┐
│                         BOLT                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Trip Management                                    │    │
│  │  - Trips aanmaken/importeren                        │    │
│  │  - Trips goedkeuren per brand                       │    │
│  │  - is_published toggle                              │    │
│  │  - is_featured toggle                               │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                  │
│                          ↓                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  trips-api Edge Function                           │    │
│  │  GET /functions/v1/trips-api?for_builder=true      │    │
│  │  - Haalt alle trips op met brand_assignments       │    │
│  │  - Filtert op is_published                          │    │
│  │  - Retourneert JSON met trips + assignments         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP GET
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    BUILDER (Website)                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │  TravelDataService                                  │    │
│  │  - Doet API call naar trips-api                     │    │
│  │  - Filtert op brand_id                              │    │
│  │  - Merged featured/priority van assignment          │    │
│  │  - Cached resultaten (5 min TTL)                    │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                  │
│                          ↓                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Travel Overview Component                          │    │
│  │  - Toont trips in grid layout                       │    │
│  │  - Featured trips bovenaan met ⭐ badge            │    │
│  │  - Zoek & filter functionaliteit                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 De Flow: Van BOLT naar Website

### Stap 1: Trip Publiceren in BOLT

```javascript
// In BOLT: Brand keurt trip goed
UPDATE trip_brand_assignments 
SET is_published = true,
    status = 'accepted'
WHERE trip_id = 'abc-123' 
  AND brand_id = 'brand-a';
```

### Stap 2: trips-api Endpoint

De trips-api endpoint (in BOLT) retourneert:

```json
{
  "trips": [
    {
      "id": "abc-123",
      "title": "Rondreis Thailand",
      "destination": "Thailand",
      "price": 1299,
      "duration": "8 dagen",
      "image": "https://...",
      "brand_assignments": [
        {
          "id": "assignment-1",
          "brand_id": "brand-a",
          "is_published": true,
          "is_featured": false,
          "priority": 999,
          "status": "accepted"
        },
        {
          "id": "assignment-2",
          "brand_id": "brand-b",
          "is_published": false,
          "is_featured": false,
          "priority": 999,
          "status": "pending"
        }
      ]
    }
  ]
}
```

### Stap 3: Builder Haalt Op

```javascript
// In TravelDataService.js
const response = await fetch(
  `${BOLT_DB.url}/functions/v1/trips-api?for_builder=true`,
  {
    headers: {
      'Authorization': `Bearer ${BOLT_DB.anonKey}`,
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
```

### Stap 4: Filter op Brand

```javascript
// Filter voor deze brand en alleen published
const travels = data.trips
  .filter(t => {
    const assignment = t.brand_assignments?.find(a => a.brand_id === brandId);
    return assignment && assignment.is_published === true;
  })
  .map(t => {
    const assignment = t.brand_assignments?.find(a => a.brand_id === brandId);
    return {
      ...t,
      featured: assignment?.is_featured || false,
      priority: assignment?.priority || 999,
      assignmentId: assignment?.id
    };
  });
```

### Stap 5: Travel Overview Toont

```javascript
// In components.js
const travels = await TravelDataService.getTravels({
  status: 'published',
  limit: 999
});

// Render travel cards
travels.forEach(travel => {
  const card = this.createTravelCard(travel);
  grid.appendChild(card);
});
```

---

## 🎯 Implementatie Details

### TravelDataService.js - Dual Strategy

De service probeert eerst de trips-api, en valt terug op directe Supabase query:

```javascript
// STRATEGIE 1: trips-api endpoint (PREFERRED)
try {
  const apiResponse = await fetch(
    `${BOLT_DB.url}/functions/v1/trips-api?for_builder=true`,
    {
      headers: {
        'Authorization': `Bearer ${BOLT_DB.anonKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (apiResponse.ok) {
    const apiData = await apiResponse.json();
    // Filter en transform...
  }
} catch (apiError) {
  // STRATEGIE 2: Fallback naar directe query
  const response = await fetch(
    `${BOLT_DB.url}/rest/v1/trip_brand_assignments?...`,
    { ... }
  );
}
```

### Waarom Dual Strategy?

1. **trips-api** = Aanbevolen door BOLT, heeft business logic
2. **Direct query** = Fallback voor als trips-api niet beschikbaar is
3. **Backwards compatible** = Werkt met oude en nieuwe setups

---

## 🔑 Brand ID Detectie

De service detecteert automatisch de brand_id uit meerdere bronnen:

```javascript
const brandId = 
  urlParams.get('brand_id') ||              // 1. URL: ?brand_id=xyz
  window.websiteBuilder?._edgeCtx?.brand_id || // 2. Deeplink context
  window.edgeCtx?.brand_id ||               // 3. Legacy context
  window.BOLT_DB.brandId ||                 // 4. Config file
  window.BRAND_ID ||                        // 5. Global variable
  'default';                                // 6. Fallback
```

### Voorbeeld URLs:

```
// Directe brand parameter
https://website.com/?brand_id=tui

// Deeplink met brand context
https://website.com/deeplink/abc123
→ websiteBuilder._edgeCtx.brand_id = 'tui'

// Config in BOLT_DB
window.BOLT_DB = {
  url: "...",
  anonKey: "...",
  brandId: "tui"  // ← Hier
};
```

---

## ⭐ Featured Trips - Per Brand

### Database Structuur

```sql
trip_brand_assignments
├── trip_id          -- Welke trip
├── brand_id         -- Voor welke brand
├── is_published     -- Zichtbaar op website?
├── is_featured      -- Featured voor deze brand? ⭐
└── priority         -- Volgorde (1 = hoogste)
```

### Voorbeeld Data

```sql
-- Trip "Thailand" voor 3 brands
INSERT INTO trip_brand_assignments VALUES
  ('trip-1', 'brand-tui',      true,  true,  1),    -- Featured voor TUI
  ('trip-1', 'brand-corendon', true,  false, 999),  -- Niet featured voor Corendon
  ('trip-1', 'brand-sunweb',   false, false, 999);  -- Niet zichtbaar voor Sunweb
```

### Resultaat op Websites

**TUI Website:**
```
⭐ Rondreis Thailand (Featured)  ← Priority 1, bovenaan
📍 Thailand • 8 dagen • € 1.299
```

**Corendon Website:**
```
Rondreis Thailand  ← Priority 999, normale positie
📍 Thailand • 8 dagen • € 1.299
```

**Sunweb Website:**
```
(Niet zichtbaar - is_published = false)
```

---

## 🚀 Hoe te Gebruiken

### 1. In BOLT: Trip Publiceren

```
1. Ga naar Trip Management
2. Selecteer een trip
3. Klik op "Publiceren" voor een brand
   → is_published = true
4. (Optioneel) Klik op "⭐ Featured"
   → is_featured = true, priority = 1
```

### 2. In Builder: Travel Overview Toevoegen

```
1. Open Website Builder
2. Voeg "Travel Overview" component toe
3. Component haalt automatisch trips op via TravelDataService
4. Featured trips verschijnen bovenaan met ⭐ badge
```

### 3. Op Website: Automatisch Zichtbaar

```
- Gepubliceerde trips verschijnen automatisch
- Featured trips staan bovenaan
- Sortering op priority (1, 2, 3, ..., 999)
- Cache refresh elke 5 minuten
```

---

## 🔍 Troubleshooting

### Trips verschijnen niet op website

**Check 1: trips-api werkt?**
```javascript
// In browser console
const response = await fetch(
  'https://your-bolt.supabase.co/functions/v1/trips-api?for_builder=true',
  {
    headers: {
      'Authorization': 'Bearer YOUR_ANON_KEY',
      'Content-Type': 'application/json'
    }
  }
);
const data = await response.json();
console.log(data);
```

**Check 2: is_published = true?**
```sql
SELECT t.title, tba.brand_id, tba.is_published, tba.status
FROM trip_brand_assignments tba
JOIN trips t ON t.id = tba.trip_id
WHERE tba.brand_id = 'your-brand-id';
```

**Check 3: Brand ID correct?**
```javascript
// In browser console op website
console.log('Brand ID:', 
  new URLSearchParams(window.location.search).get('brand_id') ||
  window.websiteBuilder?._edgeCtx?.brand_id ||
  window.BOLT_DB?.brandId
);
```

**Check 4: Cache refresh**
```javascript
// In browser console
TravelDataService.clearCache();
const travels = await TravelDataService.getTravels({ forceRefresh: true });
console.log('Travels:', travels);
```

### trips-api geeft 404

**Oplossing:** Fallback naar directe query werkt automatisch.

Check console:
```
[TravelDataService] trips-api failed, falling back to direct query
[TravelDataService] Fetched assignments (fallback): 5
```

### Featured werkt niet

**Check:** Kolommen bestaan?
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'trip_brand_assignments' 
AND column_name IN ('is_featured', 'priority');
```

Als niet: voer SQL migration uit (zie `supabase/migrations/add_featured_columns.sql`)

---

## 📊 API Response Format

### trips-api Response

```json
{
  "trips": [
    {
      "id": "uuid",
      "title": "Rondreis Thailand",
      "destination": "Thailand",
      "price": 1299,
      "currency": "EUR",
      "duration": "8 dagen",
      "days": 8,
      "description": "...",
      "image": "https://...",
      "created_at": "2025-01-11T...",
      "brand_assignments": [
        {
          "id": "assignment-uuid",
          "brand_id": "brand-a",
          "is_published": true,
          "is_featured": false,
          "priority": 999,
          "status": "accepted"
        }
      ]
    }
  ]
}
```

### TravelDataService Output

```javascript
[
  {
    id: "uuid",
    title: "Rondreis Thailand",
    location: "Thailand",
    duration: "8 dagen",
    price: "€ 1.299",
    priceRaw: 1299,
    currency: "EUR",
    description: "...",
    image: "https://...",
    featured: false,      // ← Van assignment
    priority: 999,        // ← Van assignment
    assignmentId: "...",  // ← Assignment ID
    assignmentStatus: "accepted"
  }
]
```

---

## ✅ Checklist

- [x] TravelDataService gebruikt trips-api endpoint
- [x] Fallback naar directe query werkt
- [x] Brand ID detectie uit meerdere bronnen
- [x] Featured status per brand
- [x] Priority sortering
- [x] Cache mechanisme (5 min TTL)
- [x] Error handling en logging
- [x] Travel Overview component integreert

---

## 🎯 Samenvatting

### Hoe het werkt:

1. **BOLT**: Trip publiceren → `is_published = true` in `trip_brand_assignments`
2. **trips-api**: Endpoint retourneert trips met assignments
3. **TravelDataService**: Haalt op, filtert op brand, merged featured status
4. **Travel Overview**: Toont trips, featured bovenaan met ⭐

### Voordelen:

- ✅ **Centralized logic**: Business logic in BOLT trips-api
- ✅ **Per-brand control**: Featured en published per brand
- ✅ **Automatic fallback**: Werkt ook zonder trips-api
- ✅ **Caching**: Performance optimalisatie
- ✅ **Flexible brand detection**: Meerdere bronnen voor brand_id

### Volgende stappen:

1. Voeg `is_featured` en `priority` kolommen toe (SQL migration)
2. Test trips-api endpoint
3. Voeg Travel Overview component toe aan website
4. Publiceer trips in BOLT
5. Verifieer op website

Klaar! 🚀
