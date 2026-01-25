# TravelBro API Instructies

## Overzicht

De Website Builder biedt twee endpoints voor TravelBro om Travel Compositor data op te halen:

| Endpoint | Methode | Doel |
|----------|---------|------|
| `/api/travelbro/get-travel` | GET | Alleen data ophalen |
| `/api/travelbro/sync-travel` | POST | Data ophalen + opslaan in Supabase |

---

## Endpoint 1: GET `/api/travelbro/get-travel`

**Gebruik:** Haal Travel Compositor data op zonder op te slaan.

### Request

```
GET https://www.ai-websitestudio.nl/api/travelbro/get-travel?id=12345&micrositeId=rondreis-planner&language=NL
```

### Parameters

| Parameter | Verplicht | Beschrijving | Default |
|-----------|-----------|--------------|---------|
| `id` | ✅ Ja | Travel Compositor Idea ID (bijv. `12345`) | - |
| `micrositeId` | ❌ Nee | TC Microsite ID | `rondreis-planner` |
| `language` | ❌ Nee | Taal: `NL`, `EN`, `DE`, `FR` | `NL` |

### Response (Success)

```json
{
  "success": true,
  "data": {
    "tc_idea_id": "12345",
    "title": "Rondreis Ierland",
    "description": "Ontdek het groene eiland...",
    "intro_text": "Welkom bij deze prachtige rondreis...",
    "short_description": "14-daagse rondreis door Ierland",
    "trip_highlights": ["Wild Atlantic Way", "Cliffs of Moher"],
    "selling_points": ["Inclusief huurauto", "4-sterren hotels"],
    "featured_image": "https://...",
    "all_images": ["https://...", "https://..."],
    "duration_days": 14,
    "duration_nights": 13,
    "destinations": [...],
    "destination_names": ["Dublin", "Galway", "Cork"],
    "countries": ["Ierland"],
    "hotels": [...],
    "flights": [...],
    "car_rentals": [...],
    "activities": [...],
    "itinerary": [...],
    "total_price": 2450,
    "price_per_person": 1225,
    "currency": "EUR",
    "price_breakdown": {...},
    "travelers": {...},
    "included": [...],
    "not_included": [...],
    "practical_info": {...},
    "ai_summary": "Rondreis Ierland - 14 dagen / 13 nachten\n...",
    "all_texts": {...},
    "language": "NL"
  },
  "raw": {
    "detail": {...},
    "info": {...}
  }
}
```

### Response (Error)

```json
{
  "success": false,
  "error": "Missing required parameter: id"
}
```

---

## Endpoint 2: POST `/api/travelbro/sync-travel`

**Gebruik:** Haal data op EN sla direct op in de Supabase `trips` tabel.

### Request

```bash
POST https://www.ai-websitestudio.nl/api/travelbro/sync-travel
Content-Type: application/json

{
  "id": "12345",
  "micrositeId": "rondreis-planner",
  "language": "NL",
  "brand_id": "uuid-van-de-brand",
  "trip_id": "bestaand-trip-uuid"
}
```

### Body Parameters

| Parameter | Verplicht | Beschrijving |
|-----------|-----------|--------------|
| `id` | ✅ Ja | Travel Compositor Idea ID |
| `micrositeId` | ❌ Nee | TC Microsite ID (default: `rondreis-planner`) |
| `language` | ❌ Nee | Taal (default: `NL`) |
| `brand_id` | ❌ Nee | Brand UUID om de trip aan te koppelen |
| `trip_id` | ❌ Nee | Bestaand trip UUID voor updates |

### Response (Success)

```json
{
  "success": true,
  "message": "Travel data synced successfully",
  "trip_id": "generated-or-existing-uuid",
  "tc_idea_id": "12345",
  "saved": true,
  "data": {...}
}
```

---

## BOLT Implementatie Voorbeeld

### JavaScript/TypeScript Code - Volledige Implementatie

```typescript
// ============================================
// STAP 1: Haal beschikbare microsites op
// ============================================
async function loadMicrosites() {
  const response = await fetch('https://www.ai-websitestudio.nl/api/config/microsites');
  const data = await response.json();
  return data.microsites; // [{id: "rondreis-planner", name: "Rondreis Planner", hasCredentials: true}, ...]
}

// ============================================
// STAP 2: Sync Travel Compositor data
// ============================================
async function syncTravelCompositor(tcIdeaId: string, micrositeId: string, brandId: string) {
  try {
    const response = await fetch('https://www.ai-websitestudio.nl/api/travelbro/sync-travel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: tcIdeaId,           // ✅ VERPLICHT: TC Idea ID (bijv. "12345")
        micrositeId: micrositeId, // ✅ VERPLICHT: Microsite ID (bijv. "rondreis-planner")
        language: 'NL',         // Optioneel: taal
        brand_id: brandId       // Optioneel: koppel aan brand
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Sync failed');
    }

    console.log('✅ Trip opgeslagen met ID:', result.trip_id);
    console.log('📊 Data:', result.data);

    return result;

  } catch (error) {
    console.error('❌ Sync error:', error);
    throw error;
  }
}

// ============================================
// GEBRUIK IN BOLT UI
// ============================================

// Bij laden van pagina:
const microsites = await loadMicrosites();
// → Vul dropdown met microsites

// Bij klik op "Synchroniseren":
const tcIdeaId = document.getElementById('tc-idea-input').value;      // "12345"
const micrositeId = document.getElementById('microsite-select').value; // "rondreis-planner"
const brandId = getCurrentBrandId();                                   // UUID van huidige brand

const result = await syncTravelCompositor(tcIdeaId, micrositeId, brandId);
// → result.trip_id bevat de opgeslagen trip UUID
// → result.data bevat alle reis data voor de AI bot
```

---

## Stap 1: Beschikbare Microsites Ophalen

**BELANGRIJK:** Voordat je een TC ID kunt synchroniseren, moet je weten welke microsite het ID vandaan komt. Haal eerst de beschikbare microsites op:

### Request

```
GET https://www.ai-websitestudio.nl/api/config/microsites
```

### Response

```json
{
  "microsites": [
    {
      "id": "rondreis-planner",
      "name": "Rondreis Planner",
      "hasCredentials": true
    },
    {
      "id": "reisbureaunederland",
      "name": "Blauw Versie RRP",
      "hasCredentials": true
    }
  ],
  "baseUrl": "https://online.travelcompositor.com"
}
```

### BOLT UI Implementatie

1. **Bij laden van de pagina:** Haal microsites op via `GET /api/config/microsites`
2. **Toon dropdown:** Laat gebruiker kiezen uit beschikbare microsites
3. **Bij synchroniseren:** Stuur gekozen `micrositeId` mee in de request

### Voorbeeld Code

```typescript
// 1. Haal beschikbare microsites op
async function loadMicrosites() {
  const response = await fetch('https://www.ai-websitestudio.nl/api/config/microsites');
  const data = await response.json();
  return data.microsites; // Array van {id, name, hasCredentials}
}

// 2. Toon in dropdown
const microsites = await loadMicrosites();
// Render dropdown met microsites.map(m => <option value={m.id}>{m.name}</option>)

// 3. Bij synchroniseren: gebruik gekozen microsite
async function syncTravel(tcIdeaId: string, micrositeId: string, brandId: string) {
  const response = await fetch('https://www.ai-websitestudio.nl/api/travelbro/sync-travel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: tcIdeaId,
      micrositeId: micrositeId,  // ← Van dropdown
      brand_id: brandId
    })
  });
  return response.json();
}
```

### Huidige Microsites

| Microsite ID | Naam | Status |
|--------------|------|--------|
| `rondreis-planner` | Rondreis Planner | ✅ Actief |
| `reisbureaunederland` | Blauw Versie RRP | ✅ Actief |

> **Let op:** Gebruik altijd de `/api/config/microsites` endpoint om de actuele lijst op te halen. Er kunnen microsites worden toegevoegd of verwijderd.

---

## Data Structuur voor AI Bot

De response bevat speciaal geformatteerde data voor de AI bot:

### `ai_summary` - Kant-en-klare samenvatting
```
Rondreis Ierland - 14 dagen / 13 nachten
Bestemmingen: Dublin, Galway, Cork
Landen: Ierland
Heenvlucht: Amsterdam → Dublin (KL 123)
Accommodaties: Hotel A (3 nachten); Hotel B (4 nachten)
Huurauto: Hertz Compact (14 dagen)
Totaalprijs: €2450 (€1225 p.p.)
Reizigers: 2 volwassenen
```

### `all_texts` - Alle teksten gebundeld
```json
{
  "trip_intro": "Welkom bij...",
  "trip_description": "Ontdek het groene eiland...",
  "short_description": "14-daagse rondreis...",
  "destination_descriptions": [
    {"name": "Dublin", "description": "De bruisende hoofdstad..."}
  ],
  "hotel_descriptions": [
    {"name": "Hotel X", "description": "Luxe 4-sterren...", "highlights": [...]}
  ],
  "day_descriptions": [
    {"day": 1, "title": "Aankomst Dublin", "description": "..."}
  ]
}
```

### Hotels met volledige beschrijvingen
```json
{
  "name": "The Shelbourne Hotel",
  "stars": 5,
  "description": "Iconisch 5-sterren hotel in het hart van Dublin...",
  "shortDescription": "Luxe hotel aan St. Stephen's Green",
  "longDescription": "Uitgebreide beschrijving...",
  "highlights": ["Spa", "Michelin restaurant", "Historisch pand"],
  "address": "27 St Stephen's Green, Dublin",
  "checkIn": "2026-03-15",
  "checkOut": "2026-03-18",
  "nights": 3,
  "roomType": "Deluxe Double",
  "roomDescription": "Ruime kamer met uitzicht op het park...",
  "mealPlan": "BB",
  "mealPlanDescription": "Logies met ontbijt",
  "facilities": ["WiFi", "Spa", "Fitness", "Restaurant"],
  "rating": 9.2,
  "price": 450,
  "checkInTime": "15:00",
  "checkOutTime": "11:00"
}
```

---

## Foutafhandeling

| HTTP Status | Betekenis | Actie |
|-------------|-----------|-------|
| 200 | Success | Data verwerken |
| 400 | Missing parameters | Check of `id` is meegegeven |
| 401 | TC Auth failed | Check TC credentials in Vercel env |
| 404 | TC Idea not found | Check of ID correct is |
| 500 | Server error | Probeer opnieuw / check logs |

---

## Checklist voor BOLT

- [ ] Bij laden pagina: Haal microsites op via `GET /api/config/microsites`
- [ ] Toon dropdown met beschikbare microsites (naam + id)
- [ ] Gebruiker kan TC Idea ID invoeren
- [ ] Gebruiker selecteert microsite uit dropdown
- [ ] Bij "Synchroniseren" wordt `POST /api/travelbro/sync-travel` aangeroepen met:
  - [ ] `id` - TC Idea ID (verplicht)
  - [ ] `micrositeId` - Gekozen microsite (verplicht)
  - [ ] `brand_id` - UUID van huidige brand (optioneel)
- [ ] Success: toon bevestiging + `trip_id`
- [ ] Error: toon foutmelding aan gebruiker
- [ ] Data is beschikbaar voor AI bot via `ai_summary` en `all_texts`

---

## Contact

Vragen? Neem contact op met het Website Builder team.
