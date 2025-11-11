# 🔄 BOLT naar Website Integratie - Complete Uitleg

## 📖 Overzicht

Dit document legt uit hoe reizen van BOLT naar de website komen en hoe je uitgelichte (featured) reizen maakt.

---

## 1️⃣ Hoe komt een reis van BOLT op de website?

### Database Structuur

```
┌─────────────────┐         ┌──────────────────────────┐
│     trips       │         │  trip_brand_assignments  │
├─────────────────┤         ├──────────────────────────┤
│ id (UUID)       │◄────────│ trip_id (FK)             │
│ title           │         │ brand_id                 │
│ destination     │         │ is_published (BOOLEAN)   │
│ price           │         │ is_featured (BOOLEAN)    │
│ duration        │         │ priority (INTEGER)       │
│ description     │         │ status (TEXT)            │
│ image           │         └──────────────────────────┘
│ ...             │
└─────────────────┘
```

### De Flow: Van BOLT naar Website

#### Stap 1: Reis opslaan in BOLT
Wanneer je een reis opslaat in BOLT (via import of handmatig), wordt deze opgeslagen in de `trips` tabel.

#### Stap 2: Toggle aanzetten voor website
In BOLT zet je de toggle aan om de reis op de website te plaatsen. Dit update:
- `trip_brand_assignments.is_published = true`
- `trip_brand_assignments.status = 'accepted'` of `'mandatory'`

#### Stap 3: Website haalt reizen op
De website gebruikt `TravelDataService` om reizen op te halen:

```javascript
// Automatische query in travelDataService.js
const response = await fetch(
  `${BOLT_DB.url}/rest/v1/trip_brand_assignments?` +
  `select=*,trips(*)&` +
  `brand_id=eq.${brandId}&` +
  `is_published=eq.true&` +
  `status=in.(accepted,mandatory)`
);
```

**Filters:**
- ✅ `is_published = true` → Toggle staat aan
- ✅ `status = accepted` OF `mandatory` → Reis is goedgekeurd
- ✅ `brand_id = jouw brand` → Alleen jouw reizen

#### Stap 4: Travel Overview toont reizen
Het `Travel Overview` component op de website toont automatisch alle reizen die aan bovenstaande criteria voldoen.

---

## 2️⃣ Hoe maak je uitgelichte (featured) reizen?

### Methode: Via trip_brand_assignments (AANBEVOLEN)

Dit is de beste methode omdat:
- Een reis featured kan zijn voor brand A maar niet voor brand B
- Je hebt volledige controle per brand
- Het is al geïntegreerd in de huidige structuur

### Database Kolommen

```sql
-- trip_brand_assignments tabel
is_featured BOOLEAN DEFAULT FALSE  -- Is deze reis featured voor deze brand?
priority INTEGER DEFAULT 999       -- Volgorde (1 = hoogste prioriteit)
```

### Hoe het werkt

#### In BOLT Interface:
1. Ga naar "Reizen Beheer"
2. Klik op de ⭐ "Featured" knop bij een reis
3. Dit update:
   - `is_featured = true`
   - `priority = 1` (of een lage waarde voor hoge prioriteit)

#### Op de Website:
1. `TravelDataService` haalt de `is_featured` en `priority` waarden op
2. Featured reizen krijgen:
   - Een ⭐ badge
   - Hogere positie in de lijst (gesorteerd op priority)
   - Optioneel: speciale styling

---

## 🛠️ Implementatie Stappen

### Stap 1: Database Kolommen Toevoegen

Voer deze SQL uit in Supabase:

```sql
-- Voeg featured en priority kolommen toe aan trip_brand_assignments
ALTER TABLE trip_brand_assignments 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

ALTER TABLE trip_brand_assignments 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 999;

-- Index voor snelle queries
CREATE INDEX IF NOT EXISTS idx_trip_brand_assignments_featured 
ON trip_brand_assignments(is_featured);

CREATE INDEX IF NOT EXISTS idx_trip_brand_assignments_priority 
ON trip_brand_assignments(priority);

-- Optioneel: Voeg ook toe aan trips tabel voor fallback
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 999;
```

### Stap 2: BOLT Interface Updaten

Maak een toggle knop in BOLT om featured status te wijzigen:

```javascript
// In BOLT admin interface
async function toggleFeatured(assignmentId, currentFeatured) {
  const response = await fetch(
    `${BOLT_DB.url}/rest/v1/trip_brand_assignments?id=eq.${assignmentId}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': BOLT_DB.anonKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        is_featured: !currentFeatured,
        priority: !currentFeatured ? 1 : 999
      })
    }
  );
  
  return await response.json();
}
```

### Stap 3: Website Toont Featured Reizen

De `TravelDataService` is al geüpdatet om featured status te lezen:

```javascript
// In travelDataService.js (AL GEÏMPLEMENTEERD)
const travels = assignments.map(a => ({
  ...a.trips,
  featured: a.is_featured !== undefined ? a.is_featured : a.trips.featured,
  priority: a.priority !== undefined ? a.priority : a.trips.priority
}));
```

Featured reizen worden automatisch:
- Gesorteerd op priority (laagste eerst = hoogste prioriteit)
- Getoond met ⭐ badge
- Bovenaan in de lijst geplaatst

---

## 🎨 Featured Reizen Styling

### In Travel Overview Component

Featured reizen krijgen automatisch:

1. **⭐ Badge**
```javascript
if (travel.featured) {
  badge = '<span class="featured-badge">⭐ Featured</span>';
}
```

2. **Hogere Positie**
```javascript
// Automatische sortering op priority
travels.sort((a, b) => a.priority - b.priority);
```

3. **Optionele Speciale Styling**
```css
.travel-card.featured {
  border: 2px solid #fbbf24;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
}
```

---

## 📊 Voorbeeld Scenario

### Scenario: 3 reizen, 1 featured maken

**Database voor:**
```
trip_brand_assignments:
┌──────┬──────────┬──────────────┬────────────┬──────────┐
│ id   │ trip_id  │ is_published │ is_featured│ priority │
├──────┼──────────┼──────────────┼────────────┼──────────┤
│ 1    │ trip-a   │ true         │ false      │ 999      │
│ 2    │ trip-b   │ true         │ false      │ 999      │
│ 3    │ trip-c   │ true         │ false      │ 999      │
└──────┴──────────┴──────────────┴────────────┴──────────┘
```

**Actie in BOLT:**
Klik op ⭐ Featured knop bij "trip-b"

**Database na:**
```
trip_brand_assignments:
┌──────┬──────────┬──────────────┬────────────┬──────────┐
│ id   │ trip_id  │ is_published │ is_featured│ priority │
├──────┼──────────┼──────────────┼────────────┼──────────┤
│ 1    │ trip-a   │ true         │ false      │ 999      │
│ 2    │ trip-b   │ true         │ TRUE       │ 1        │ ⭐
│ 3    │ trip-c   │ true         │ false      │ 999      │
└──────┴──────────┴──────────────┴────────────┴──────────┘
```

**Website toont:**
```
┌─────────────────────────────────┐
│ ⭐ Rondreis Thailand (Featured) │ ← trip-b (priority 1)
├─────────────────────────────────┤
│ Stedentrip Barcelona            │ ← trip-a (priority 999)
├─────────────────────────────────┤
│ Fjorden Noorwegen               │ ← trip-c (priority 999)
└─────────────────────────────────┘
```

---

## 🔍 Troubleshooting

### Reis verschijnt niet op website

**Check 1: Is is_published = true?**
```sql
SELECT id, trip_id, is_published, status 
FROM trip_brand_assignments 
WHERE trip_id = 'jouw-trip-id';
```

**Check 2: Is status correct?**
Status moet `'accepted'` of `'mandatory'` zijn.

**Check 3: Is brand_id correct?**
```sql
SELECT brand_id FROM trip_brand_assignments WHERE trip_id = 'jouw-trip-id';
```

**Check 4: Browser console**
```javascript
// Open browser console op website
console.log(await TravelDataService.getTravels());
```

### Featured werkt niet

**Check 1: Kolom bestaat?**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'trip_brand_assignments' 
AND column_name IN ('is_featured', 'priority');
```

**Check 2: Waarde is gezet?**
```sql
SELECT id, trip_id, is_featured, priority 
FROM trip_brand_assignments 
WHERE is_featured = true;
```

**Check 3: Cache refresh**
```javascript
// In browser console
TravelDataService.clearCache();
await TravelDataService.getTravels({ forceRefresh: true });
```

---

## 🎯 Samenvatting

### Van BOLT naar Website:
1. ✅ Reis opslaan in BOLT → `trips` tabel
2. ✅ Toggle aanzetten → `is_published = true` in `trip_brand_assignments`
3. ✅ Website haalt automatisch op via `TravelDataService`
4. ✅ `Travel Overview` component toont de reizen

### Featured Reizen Maken:
1. ✅ Voeg `is_featured` en `priority` kolommen toe aan database
2. ✅ Maak toggle knop in BOLT interface
3. ✅ Klik op ⭐ Featured knop
4. ✅ Website toont automatisch met badge en hogere positie

### Voordelen van deze aanpak:
- ✅ **Per brand control**: Reis kan featured zijn voor brand A maar niet voor B
- ✅ **Flexibele volgorde**: Priority bepaalt exacte volgorde
- ✅ **Real-time**: Wijzigingen direct zichtbaar (na cache refresh)
- ✅ **Schaalbaar**: Makkelijk uit te breiden met meer filters

---

## 📞 Support

Vragen? Check:
1. Browser console voor errors
2. Supabase logs voor database errors
3. `TravelDataService` console logs voor debug info

```javascript
// Enable debug logging
localStorage.setItem('DEBUG', 'TravelDataService');
```
