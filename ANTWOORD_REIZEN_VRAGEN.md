# 📋 Antwoord op je Vragen over BOLT → Website Reizen

## Vraag 1: Hoe komt een reis van BOLT op de website?

### ✅ Het Korte Antwoord

Wanneer je in BOLT de **toggle** aanzet bij een reis, wordt deze automatisch zichtbaar op de website via het **Travel Overview** component.

### 🔄 De Complete Flow

```
1. BOLT: Reis opslaan
   ↓
   trips tabel (Supabase)
   
2. BOLT: Toggle aanzetten "Toon op website"
   ↓
   trip_brand_assignments.is_published = true
   trip_brand_assignments.status = 'accepted'
   
3. Website: Automatisch ophalen
   ↓
   TravelDataService haalt reizen op
   Filter: is_published=true + status=accepted
   
4. Website: Tonen
   ↓
   Travel Overview component toont de reizen
```

### 📊 Database Structuur

```sql
-- Reis data
trips
├── id
├── title
├── destination
├── price
└── ...

-- Koppeling per brand
trip_brand_assignments
├── trip_id (FK → trips)
├── brand_id
├── is_published ← Toggle in BOLT
├── is_featured  ← Featured status
├── priority     ← Volgorde
└── status       ← 'accepted', 'draft', etc.
```

### 🎯 Wat Gebeurt Er Precies?

#### In BOLT:
- Je slaat een reis op → gaat naar `trips` tabel
- Je zet toggle aan → update `trip_brand_assignments`:
  - `is_published = true`
  - `status = 'accepted'`

#### Op de Website:
- `TravelDataService` maakt automatisch deze query:
  ```sql
  SELECT * FROM trip_brand_assignments
  JOIN trips ON trips.id = trip_brand_assignments.trip_id
  WHERE brand_id = 'jouw-brand'
    AND is_published = true
    AND status IN ('accepted', 'mandatory')
  ```
- Travel Overview component toont de resultaten

---

## Vraag 2: Hoe maak je uitgelichte (featured) reizen?

### ✅ Het Korte Antwoord

Klik op de **⭐ Featured** knop in BOLT bij een reis. Deze krijgt dan:
- Een gouden ⭐ badge op de website
- Een hogere positie in de lijst (bovenaan)
- Priority = 1 (in plaats van 999)

### 🛠️ Implementatie (3 Stappen)

#### Stap 1: Database Kolommen Toevoegen

Voer uit in Supabase SQL Editor:

```sql
ALTER TABLE trip_brand_assignments 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 999;

CREATE INDEX idx_trip_brand_assignments_featured 
ON trip_brand_assignments(is_featured);
```

#### Stap 2: BOLT Interface Toevoegen

Het bestand `js/views/travelManagementView.js` is al gemaakt! 

Voeg toe aan je BOLT HTML:
```html
<script src="/js/views/travelManagementView.js"></script>
```

En voeg menu item toe:
```html
<a href="#travel-management">
    <i class="fas fa-globe-europe"></i> Reizen Beheer
</a>
```

#### Stap 3: Gebruik het!

1. Open BOLT → Ga naar "Reizen Beheer"
2. Zie lijst van alle reizen
3. Klik op **⭐ Featured** knop bij een reis
4. Reis krijgt featured status en priority 1
5. Website toont reis bovenaan met ⭐ badge

### 📱 Hoe Ziet Het Eruit?

#### In BOLT:
```
┌─────────────────────────────────────────────┐
│ 🌍 Reizen Beheer                            │
├─────────────────────────────────────────────┤
│ Stats: Totaal: 5 | Featured: 2 | Published: 4│
├─────────────────────────────────────────────┤
│                                              │
│ 🖼️ Rondreis Thailand ⭐Featured             │
│    📍 Thailand • 8 dagen • € 1.299          │
│    Priority: 1                               │
│    [⭐ Unfeatured] [👁️ Published] [🗑️]      │
│                                              │
│ 🖼️ Stedentrip Barcelona                     │
│    📍 Spanje • 5 dagen • € 599              │
│    Priority: 999                             │
│    [⭐ Featured] [👁️ Published] [🗑️]        │
│                                              │
└─────────────────────────────────────────────┘
```

#### Op de Website:
```
┌──────────────────────────────────────┐
│ Onze Reizen                          │
├──────────────────────────────────────┤
│ ⭐ Rondreis Thailand (Featured)      │ ← Bovenaan!
│ 📍 Thailand • 8 dagen                │
│ € 1.299 p.p.                         │
│ [Bekijk Reis]                        │
├──────────────────────────────────────┤
│ Stedentrip Barcelona                 │
│ 📍 Spanje • 5 dagen                  │
│ € 599 p.p.                           │
│ [Bekijk Reis]                        │
└──────────────────────────────────────┘
```

---

## 🎨 Extra Features in BOLT Interface

De nieuwe "Reizen Beheer" pagina heeft:

### 1. **Stats Dashboard**
- Totaal aantal reizen
- Aantal featured reizen
- Aantal published reizen
- Aantal draft reizen

### 2. **Filters**
- Alle reizen
- Alleen published
- Alleen draft
- Alleen featured

### 3. **Acties per Reis**
- **⭐ Featured Toggle**: Maak featured / unfeatured
- **👁️ Publish Toggle**: Toon op website / verberg
- **🗑️ Delete**: Verwijder reis

### 4. **Automatische Sortering**
- Featured reizen bovenaan
- Gesorteerd op priority (1, 2, 3, ..., 999)
- Binnen zelfde priority: nieuwste eerst

---

## 📁 Bestanden die zijn Aangemaakt/Gewijzigd

### ✅ Nieuw Aangemaakt:

1. **`docs/BOLT_WEBSITE_INTEGRATION.md`**
   - Complete uitleg van BOLT → Website flow
   - Featured reizen systeem
   - Troubleshooting guide

2. **`docs/QUICK_START_FEATURED_TRIPS.md`**
   - Snelle handleiding voor featured reizen
   - Stap-voor-stap instructies
   - Troubleshooting tips

3. **`supabase/migrations/add_featured_columns.sql`**
   - SQL script voor database kolommen
   - Indexes voor performance
   - Helper functie voor toggle

4. **`js/views/travelManagementView.js`**
   - BOLT interface voor reizen beheer
   - Featured toggle functionaliteit
   - Publish toggle functionaliteit
   - Stats dashboard

### ✅ Gewijzigd:

1. **`js/services/travelDataService.js`**
   - Leest nu `is_featured` en `priority` uit `trip_brand_assignments`
   - Merged featured status van assignment en trip
   - Automatische sortering op priority

---

## 🚀 Wat Moet Je Nu Doen?

### Stap 1: Database Updaten
```sql
-- Voer uit in Supabase SQL Editor
ALTER TABLE trip_brand_assignments 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 999;

CREATE INDEX idx_trip_brand_assignments_featured 
ON trip_brand_assignments(is_featured);
```

### Stap 2: BOLT Interface Toevoegen

Voeg toe aan je BOLT HTML (bijvoorbeeld `bolt.html` of `admin.html`):

```html
<!-- Travel Management View -->
<script src="/js/views/travelManagementView.js"></script>
```

En voeg route toe aan je router:
```javascript
case 'travel-management':
    if (window.TravelManagementView) {
        window.TravelManagementView.mount(contentArea);
    }
    break;
```

### Stap 3: Test het!

1. Open BOLT
2. Ga naar "Reizen Beheer" (of `#travel-management`)
3. Klik op ⭐ Featured bij een reis
4. Open je website
5. Zie de featured reis bovenaan met ⭐ badge

---

## 🔍 Verificatie Checklist

- [ ] Database kolommen toegevoegd (`is_featured`, `priority`)
- [ ] Indexes aangemaakt
- [ ] `travelManagementView.js` geladen in BOLT
- [ ] Menu item toegevoegd aan BOLT
- [ ] Route toegevoegd aan router
- [ ] Reizen Beheer pagina opent zonder errors
- [ ] Featured toggle werkt (knop wordt geel)
- [ ] Website toont featured reis bovenaan
- [ ] ⭐ badge verschijnt op website

---

## 💡 Tips & Tricks

### Meerdere Featured Reizen
Je kunt meerdere reizen featured maken. Ze worden automatisch gesorteerd op priority:
- Priority 1 = hoogste positie
- Priority 2 = tweede positie
- Priority 999 = normale positie

### Custom Volgorde
Je kunt handmatig priority aanpassen in Supabase:
```sql
UPDATE trip_brand_assignments 
SET priority = 5 
WHERE id = 'assignment-id';
```

### Cache Refresh
Als wijzigingen niet direct zichtbaar zijn op de website:
```javascript
// In browser console
TravelDataService.clearCache();
location.reload();
```

Of wacht 5 minuten (cache TTL).

---

## 📞 Hulp Nodig?

### Check Browser Console
```javascript
// Test TravelDataService
await TravelDataService.getTravels({ forceRefresh: true });

// Test featured filter
await TravelDataService.getFeaturedTravels();

// Check config
console.log(window.BOLT_DB);
```

### Check Database
```sql
-- Zie alle featured reizen
SELECT t.title, tba.is_featured, tba.priority, tba.is_published
FROM trip_brand_assignments tba
JOIN trips t ON t.id = tba.trip_id
WHERE tba.is_featured = true;
```

### Veelvoorkomende Problemen

**Probleem**: Reis verschijnt niet op website
- **Oplossing**: Check of `is_published = true` en `status = 'accepted'`

**Probleem**: Featured werkt niet
- **Oplossing**: Check of kolommen bestaan en waarde is gezet

**Probleem**: "TravelDataService not available"
- **Oplossing**: Voeg `<script src="/js/services/travelDataService.js"></script>` toe

---

## ✨ Samenvatting

### Vraag 1: Hoe komt reis op website?
**Antwoord**: Via toggle in BOLT → `is_published = true` → TravelDataService haalt op → Travel Overview toont

### Vraag 2: Hoe maak je featured reizen?
**Antwoord**: Klik op ⭐ Featured knop in BOLT → `is_featured = true` + `priority = 1` → Website toont bovenaan met badge

### Wat is er gemaakt?
- ✅ Complete documentatie
- ✅ SQL migration script
- ✅ BOLT interface voor reizen beheer
- ✅ Featured toggle functionaliteit
- ✅ Automatische sortering en badges
- ✅ Quick start guide

### Volgende stap?
Voer de SQL uit, voeg de scripts toe aan BOLT, en test het! 🚀
