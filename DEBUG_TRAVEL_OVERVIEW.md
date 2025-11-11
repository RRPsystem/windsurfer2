# 🔍 Debug: Waarom zie ik geen echte reizen?

## Stap 1: Open Browser Console

Druk op **F12** en ga naar **Console** tab.

## Stap 2: Check BOLT_DB Config

Plak dit in de console:

```javascript
console.log('BOLT_DB:', window.BOLT_DB);
```

**Verwacht resultaat:**
```javascript
{
  url: "https://huaaogdxxdcakxryecnw.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Als undefined:** Config is niet geladen!

### Oplossing:
Check of deze script tag in je HTML staat:
```html
<script src="/js/config.prod.js"></script>
```

## Stap 3: Check TravelDataService

```javascript
console.log('TravelDataService:', window.TravelDataService);
```

**Als undefined:** Service is niet geladen!

### Oplossing:
Check of deze script tag in je HTML staat:
```html
<script src="/js/services/travelDataService.js"></script>
```

## Stap 4: Test API Call Handmatig

```javascript
// Test trips-api endpoint
const response = await fetch(
  'https://huaaogdxxdcakxryecnw.supabase.co/functions/v1/trips-api?for_builder=true',
  {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YWFvZ2R4eGRjYWt4cnllY253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MzY3MzMsImV4cCI6MjA3NDIxMjczM30.EqZK_6xjEAVwUtsYj6nENe4x8-7At_oRAVsPMDvJBSI',
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
console.log('trips-api response:', data);
```

**Verwacht:** `{ trips: [...] }`

**Als error:** trips-api werkt nog niet of heeft geen data.

## Stap 5: Check Console Logs

Zoek naar deze logs:

```
[TravelDataService] Fetching travels from BOLT...
[TravelDataService] Using brand_id: xxx
[TravelDataService] Trying trips-api endpoint...
```

### Mogelijke Logs:

**✅ Succesvol:**
```
[TravelDataService] trips-api response: { trips: [...] }
[TravelDataService] Filtered travels from trips-api: 5
[TravelOverview] Loaded travels: 5
```

**⚠️ Fallback naar sample data:**
```
[TravelDataService] trips-api failed, falling back to direct query
[TravelDataService] BOLT_DB not configured, returning sample data
```

**❌ Geen reizen gevonden:**
```
[TravelDataService] Filtered travels from trips-api: 0
[TravelOverview] Loaded travels: 0
```

## Stap 6: Check Brand ID

```javascript
// Check welke brand_id wordt gebruikt
const urlParams = new URLSearchParams(window.location.search);
const brandId = urlParams.get('brand_id') || 
               window.websiteBuilder?._edgeCtx?.brand_id || 
               window.BOLT_DB?.brandId || 
               'default';
               
console.log('Brand ID:', brandId);
```

### Oplossing als brand_id verkeerd is:

**Optie 1:** Voeg toe aan URL
```
https://jouw-website.com/?brand_id=jouw-brand-id
```

**Optie 2:** Voeg toe aan config
```javascript
// In config.prod.js
window.BOLT_DB = {
  url: "...",
  anonKey: "...",
  brandId: "jouw-brand-id"  // ← Voeg toe
};
```

## Stap 7: Test TravelDataService Direct

```javascript
// Force refresh en haal reizen op
TravelDataService.clearCache();
const travels = await TravelDataService.getTravels({ forceRefresh: true });
console.log('Travels:', travels);
```

**Als je sample data ziet:**
```javascript
[
  {
    id: 'sample_1',
    title: 'Rondreis Bangkok & Eilanden',
    // ... sample data
  }
]
```
→ BOLT connectie werkt niet!

**Als je echte data ziet:**
```javascript
[
  {
    id: 'uuid-from-bolt',
    title: 'Echte reis uit BOLT',
    // ... echte data
  }
]
```
→ Het werkt! 🎉

## Veelvoorkomende Problemen

### Probleem 1: "BOLT_DB not configured"

**Oorzaak:** `config.prod.js` niet geladen

**Oplossing:**
```html
<!-- Voeg toe VOOR andere scripts -->
<script src="/js/config.prod.js"></script>
<script src="/js/services/travelDataService.js"></script>
<script src="/js/components.js"></script>
```

### Probleem 2: "trips-api returned 404"

**Oorzaak:** trips-api endpoint bestaat nog niet in BOLT

**Oplossing:** Fallback werkt automatisch, maar vraag BOLT om trips-api te deployen

### Probleem 3: "Filtered travels: 0"

**Oorzaak:** Geen reizen gepubliceerd voor deze brand

**Oplossing:** 
1. Ga naar BOLT
2. Publiceer een reis voor jouw brand
3. Zet `is_published = true`

### Probleem 4: Sample data blijft verschijnen

**Oorzaak:** Cache of script volgorde

**Oplossing:**
```javascript
// Clear cache
TravelDataService.clearCache();
localStorage.clear();
location.reload();
```

## Quick Fix Checklist

- [ ] `config.prod.js` geladen?
- [ ] `travelDataService.js` geladen?
- [ ] `BOLT_DB` bestaat in console?
- [ ] Brand ID correct?
- [ ] Reizen gepubliceerd in BOLT?
- [ ] trips-api endpoint werkt?
- [ ] Console errors gecheckt?

## Test Script (Alles in één)

Plak dit in console voor complete test:

```javascript
(async function testTravelOverview() {
  console.log('=== TRAVEL OVERVIEW DEBUG ===\n');
  
  // 1. Check config
  console.log('1. BOLT_DB:', window.BOLT_DB ? '✅ Loaded' : '❌ Not found');
  if (window.BOLT_DB) {
    console.log('   URL:', window.BOLT_DB.url);
    console.log('   Has anonKey:', !!window.BOLT_DB.anonKey);
  }
  
  // 2. Check service
  console.log('\n2. TravelDataService:', window.TravelDataService ? '✅ Loaded' : '❌ Not found');
  
  // 3. Check brand ID
  const urlParams = new URLSearchParams(window.location.search);
  const brandId = urlParams.get('brand_id') || 
                 window.websiteBuilder?._edgeCtx?.brand_id || 
                 window.BOLT_DB?.brandId || 
                 'default';
  console.log('\n3. Brand ID:', brandId);
  
  // 4. Test API
  if (window.BOLT_DB && window.TravelDataService) {
    console.log('\n4. Testing API...');
    try {
      TravelDataService.clearCache();
      const travels = await TravelDataService.getTravels({ forceRefresh: true });
      console.log('   Travels found:', travels.length);
      console.log('   First travel:', travels[0]);
      
      if (travels[0]?.id?.startsWith('sample_')) {
        console.log('\n⚠️ SHOWING SAMPLE DATA - BOLT connection failed');
      } else {
        console.log('\n✅ SHOWING REAL DATA from BOLT');
      }
    } catch (error) {
      console.error('   ❌ Error:', error.message);
    }
  }
  
  console.log('\n=== END DEBUG ===');
})();
```

## Verwacht Resultaat

**Als alles werkt:**
```
=== TRAVEL OVERVIEW DEBUG ===

1. BOLT_DB: ✅ Loaded
   URL: https://huaaogdxxdcakxryecnw.supabase.co
   Has anonKey: true

2. TravelDataService: ✅ Loaded

3. Brand ID: jouw-brand-id

4. Testing API...
   Travels found: 5
   First travel: { id: "uuid-123", title: "Echte reis", ... }

✅ SHOWING REAL DATA from BOLT

=== END DEBUG ===
```

**Als sample data:**
```
⚠️ SHOWING SAMPLE DATA - BOLT connection failed
```
→ Check stappen 1-6 hierboven!
