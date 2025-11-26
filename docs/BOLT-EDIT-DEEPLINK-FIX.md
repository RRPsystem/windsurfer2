# BOLT Edit Deeplink Fix - Potloodje Probleem

## 🐛 Probleem

Wanneer gebruikers op het **potloodje (edit)** klikken in BOLT om een reis te bewerken, wordt een **verkeerde trip ID** gebruikt in de deeplink URL. Dit resulteert in **"Travel not found"** errors in de Website Builder.

---

## 🔍 Wat er mis gaat

1. ✅ Reis wordt opgeslagen met nieuw ID (bijv. `abc-123-def`)
2. ✅ BOLT toont reis in lijst
3. ❌ Gebruiker klikt potloodje → BOLT genereert link met **verkeerd/oud ID**
4. ❌ Builder kan reis niet vinden → "Travel not found"

---

## ✅ Vereiste Fix in BOLT

### 1. Correcte Trip ID in Edit Links

BOLT moet ervoor zorgen dat edit-links de **exacte trip ID** gebruiken die in de Supabase `trips` tabel staat.

**❌ Huidige (verkeerde) URL structuur:**
```
https://www.ai-websitestudio.nl/builder.html?...&id=VERKEERD_ID&slug=verkeerde-slug
```

**✅ Correcte URL structuur:**
```
https://www.ai-websitestudio.nl/builder.html?api=https%3A%2F%2Fhuaaogdxxdcakxryecnw.supabase.co%2Ffunctions%2Fv1&brand_id=0766a61a-8f37-4a83-bf28-e15084d764fb&token=JWT_TOKEN&apikey=SUPABASE_ANON_KEY&content_type=trips&return_url=https%3A%2F%2Fwww.ai-travelstudio.nl%2F%23%2Fbrand%2Fcontent%2Ftrips&id=CORRECTE_TRIP_ID#/mode/travel
```

---

### 2. Database Query voor Correcte ID

BOLT moet de trip ID ophalen uit de Supabase database **NA het opslaan**:

```sql
SELECT id, slug, title, created_at
FROM trips 
WHERE brand_id = 'BRAND_ID' 
  AND title = 'TRIP_TITLE'
ORDER BY created_at DESC 
LIMIT 1;
```

**Of beter:** Gebruik de `id` die je krijgt uit de save response!

---

### 3. Parameters die BOLT moet gebruiken

Bij het genereren van de edit deeplink:

| Parameter | Waarde | Bron |
|-----------|--------|------|
| `id` | Exacte UUID uit `trips.id` | Save response OF database query |
| `slug` | Exacte slug uit `trips.slug` | Save response OF database query |
| `content_type` | `trips` | Hardcoded |
| `brand_id` | Brand ID van gebruiker | Session/context |
| `token` | Geldige JWT token | User session |
| `apikey` | Supabase anon key | Config |
| `api` | `https://huaaogdxxdcakxryecnw.supabase.co/functions/v1` | Config |
| `return_url` | BOLT trips overzicht | Encoded URL |

---

### 4. Beste Implementatie

**Optie A: Gebruik save response (BESTE)**

```javascript
// Na het opslaan van een trip
const saveResponse = await saveTrip(tripData);
const tripId = saveResponse.id;        // ✅ Gebruik deze!
const tripSlug = saveResponse.slug;    // ✅ En deze!

// Genereer deeplink met correcte IDs
const editUrl = buildEditDeeplink({
  id: tripId,
  slug: tripSlug,
  brand_id: brandId,
  // ... other params
});
```

**Optie B: Database query (FALLBACK)**

```javascript
// Als save response geen ID bevat
const { data: trip } = await supabase
  .from('trips')
  .select('id, slug')
  .eq('brand_id', brandId)
  .eq('title', tripTitle)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

const editUrl = buildEditDeeplink({
  id: trip.id,
  slug: trip.slug,
  // ...
});
```

---

### 5. Test Scenario

**Voor de fix:**
1. ✅ Importeer reis vanuit Travel Compositor
2. ✅ Wacht tot "✅ Importeren gelukt!" melding
3. ❌ Klik op potloodje → "Travel not found" error

**Na de fix:**
1. ✅ Importeer reis vanuit Travel Compositor
2. ✅ Wacht tot "✅ Importeren gelukt!" melding
3. ✅ Klik op potloodje → Builder opent met correcte reis!

---

### 6. Debugging

Als edit-links nog steeds falen na de fix:

**Stap 1: Log de URL**
```javascript
console.log('Generated edit URL:', editUrl);
```

**Stap 2: Check database**
```sql
-- Bestaat de trip ID in de database?
SELECT id, title, slug, brand_id
FROM trips 
WHERE id = 'TRIP_ID_FROM_URL';
```

**Stap 3: Check assignments**
```sql
-- Heeft de trip een brand assignment?
SELECT * 
FROM trip_brand_assignments 
WHERE trip_id = 'TRIP_ID_FROM_URL';
```

**Stap 4: Check Builder logs**
Open Browser Console → Network tab → Bekijk API calls naar `/functions/v1/trips-api`

---

## 🎯 Verwacht Resultaat

✅ Gebruiker klikt potloodje → Builder opent met correcte reis geladen  
✅ Geen "Travel not found" errors meer  
✅ Naadloze workflow van BOLT naar Builder  
✅ Edit functie werkt 100% betrouwbaar  

---

## 📍 Related Files

- Website Builder: `/js/views/travelView.js` - Laadt trip op basis van ID
- Website Builder: `/js/services/travelDataService.js` - Trip API calls
- BOLT: Edit deeplink generator (te fixen)

---

## 📞 Support

Als BOLT team hulp nodig heeft bij implementatie:
1. Check deze doc
2. Test met voorbeeld trip ID
3. Vraag Website Builder team om specifieke trip ID voor debugging

**Laatst getest:** November 2025  
**Status:** Wacht op BOLT implementatie
