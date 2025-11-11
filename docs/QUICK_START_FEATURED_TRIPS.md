# 🚀 Quick Start: Featured Reizen Instellen

## 📝 Samenvatting

Dit document geeft een **snelle handleiding** voor het instellen van featured reizen.

---

## ✅ Stap 1: Database Kolommen Toevoegen

Voer deze SQL uit in Supabase SQL Editor:

```sql
-- Voeg featured kolommen toe
ALTER TABLE trip_brand_assignments 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 999;

-- Maak indexes
CREATE INDEX IF NOT EXISTS idx_trip_brand_assignments_featured 
ON trip_brand_assignments(is_featured);

CREATE INDEX IF NOT EXISTS idx_trip_brand_assignments_priority 
ON trip_brand_assignments(priority);
```

**Verificatie:**
```sql
-- Check of kolommen bestaan
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'trip_brand_assignments' 
AND column_name IN ('is_featured', 'priority');
```

✅ Je zou 2 rijen moeten zien: `is_featured` en `priority`

---

## ✅ Stap 2: BOLT Interface Toevoegen

### A. Voeg script toe aan HTML

In je BOLT admin HTML, voeg toe:

```html
<!-- Travel Management View -->
<script src="/js/views/travelManagementView.js"></script>
```

### B. Voeg route toe aan router

In `js/router.js` of je routing systeem:

```javascript
case 'travel-management':
    if (window.TravelManagementView) {
        window.TravelManagementView.mount(contentArea);
    }
    break;
```

### C. Voeg menu item toe

In je BOLT menu:

```html
<a href="#travel-management" class="menu-item">
    <i class="fas fa-globe-europe"></i>
    <span>Reizen Beheer</span>
</a>
```

---

## ✅ Stap 3: Test de Functionaliteit

### 1. Open BOLT Admin
Ga naar: `http://localhost:3000/#travel-management` (of je BOLT URL)

### 2. Zie je reizen lijst
Je zou moeten zien:
- ✅ Lijst van alle reizen
- ✅ Stats bovenaan (Totaal, Featured, Published, Draft)
- ✅ Filter knoppen
- ✅ ⭐ Featured knop bij elke reis

### 3. Maak een reis featured
1. Klik op **⭐ Featured** knop bij een reis
2. De knop wordt geel
3. De reis krijgt een "Featured" badge
4. De reis springt naar boven in de lijst

### 4. Check de website
1. Ga naar je website met Travel Overview component
2. Refresh de pagina (of wacht 5 minuten voor cache)
3. Featured reis staat bovenaan met ⭐ badge

---

## 🔍 Troubleshooting

### Probleem: "TravelDataService not available"

**Oplossing:** Voeg toe aan je HTML:
```html
<script src="/js/services/travelDataService.js"></script>
```

### Probleem: "BOLT_DB not configured"

**Oplossing:** Check of config geladen is:
```javascript
// In browser console
console.log(window.BOLT_DB);
// Moet tonen: { url: "...", anonKey: "..." }
```

Als niet geladen, voeg toe aan HTML:
```html
<script src="/js/config.prod.js"></script>
```

### Probleem: Featured werkt niet

**Check 1:** Kolommen bestaan?
```sql
SELECT * FROM trip_brand_assignments LIMIT 1;
-- Moet is_featured en priority kolommen tonen
```

**Check 2:** Waarde wordt gezet?
```sql
SELECT id, trip_id, is_featured, priority 
FROM trip_brand_assignments 
WHERE is_featured = true;
```

**Check 3:** Cache refresh
```javascript
// In browser console op website
TravelDataService.clearCache();
location.reload();
```

### Probleem: Reis verschijnt niet op website

**Check:** Is `is_published = true`?
```sql
SELECT id, trip_id, is_published, status 
FROM trip_brand_assignments 
WHERE trip_id = 'jouw-trip-id';
```

Als `is_published = false`, klik op de 👁️ knop in BOLT om te publiceren.

---

## 📊 Verwacht Resultaat

### In BOLT Admin:
```
┌────────────────────────────────────────────────────────┐
│ 🌍 Reizen Beheer                                       │
├────────────────────────────────────────────────────────┤
│ Totaal: 5  |  Featured: 2  |  Published: 4  |  Draft: 1│
├────────────────────────────────────────────────────────┤
│                                                         │
│ 🖼️ Rondreis Thailand ⭐Featured 🟢Published            │
│    📍 Thailand • 8 dagen • € 1.299                     │
│    [⭐ Unfeatured] [👁️] [🗑️]                           │
│                                                         │
│ 🖼️ Stedentrip Barcelona 🟢Published                    │
│    📍 Spanje • 5 dagen • € 599                         │
│    [⭐ Featured] [👁️] [🗑️]                             │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Op Website:
```
┌────────────────────────────────────────┐
│ Onze Reizen                            │
├────────────────────────────────────────┤
│ ⭐ Rondreis Thailand (Featured)        │ ← Priority 1
│ 📍 Thailand • 8 dagen • € 1.299        │
│ [Bekijk Reis]                          │
├────────────────────────────────────────┤
│ Stedentrip Barcelona                   │ ← Priority 999
│ 📍 Spanje • 5 dagen • € 599            │
│ [Bekijk Reis]                          │
└────────────────────────────────────────┘
```

---

## 🎯 Volgende Stappen

### Optioneel: Meerdere Featured Reizen

Je kunt meerdere reizen featured maken. Ze worden gesorteerd op priority:

```javascript
// Eerste featured reis
priority: 1

// Tweede featured reis  
priority: 2

// Derde featured reis
priority: 3

// Normale reizen
priority: 999
```

### Optioneel: Custom Priority

Je kunt handmatig priority aanpassen in Supabase:

```sql
UPDATE trip_brand_assignments 
SET priority = 5 
WHERE id = 'jouw-assignment-id';
```

Lagere nummers = hogere positie in lijst.

---

## 📞 Hulp Nodig?

1. **Check browser console** voor errors
2. **Check Supabase logs** voor database errors  
3. **Test handmatig** in browser console:

```javascript
// Test TravelDataService
await TravelDataService.getTravels({ forceRefresh: true });

// Test featured filter
await TravelDataService.getFeaturedTravels();

// Test database connectie
console.log(window.BOLT_DB);
```

---

## ✨ Klaar!

Je hebt nu een volledig werkend featured reizen systeem! 🎉

**Wat werkt:**
- ✅ Toggle featured status in BOLT
- ✅ Automatische priority management
- ✅ Featured badge op website
- ✅ Sortering op priority
- ✅ Real-time updates (na cache refresh)
