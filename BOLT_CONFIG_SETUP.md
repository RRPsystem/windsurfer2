# ⚙️ BOLT Configuratie Setup

## 🎯 Doel

Configureer de Website Builder om te verbinden met BOLT's trips-api.

---

## 📋 Stap 1: Verkrijg BOLT Credentials

**Van BOLT heb je nodig:**
1. **Supabase URL** - Bijvoorbeeld: `https://jouw-project.supabase.co`
2. **Anon Key** - De publieke API key

**Waar vind je deze?**
- In BOLT dashboard
- Of vraag aan BOLT om deze te delen

---

## 🔧 Stap 2: Configureer in Website Builder

### Optie A: Via Browser Console (Tijdelijk - voor testen)

```javascript
// Open browser console (F12)
// Plak dit:
window.BOLT_DB = {
  url: 'https://jouw-project.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};

// Test de connectie:
await TravelDataService.getTravels();
```

### Optie B: Via Config File (Permanent - aanbevolen)

**Maak bestand:** `config/bolt.js`

```javascript
// config/bolt.js
window.BOLT_DB = {
  url: 'https://jouw-project.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2plY3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjE2MTYxNiwiZXhwIjoxOTMxNzM3NjE2fQ.signature'
};

console.log('[BOLT] Configuration loaded:', {
  url: window.BOLT_DB.url,
  hasKey: !!window.BOLT_DB.anonKey
});
```

**Voeg toe aan `index.html`:**

```html
<!-- In <head> sectie, VOOR andere scripts -->
<script src="config/bolt.js"></script>
```

### Optie C: Via Environment Variables (Productie)

**Voor deployment:**

```javascript
// In build process of .env file
window.BOLT_DB = {
  url: process.env.BOLT_SUPABASE_URL,
  anonKey: process.env.BOLT_ANON_KEY
};
```

---

## ✅ Stap 3: Verificatie

### Test 1: Check Configuratie

```javascript
// In browser console:
console.log(window.BOLT_DB);

// Moet tonen:
// {
//   url: "https://...",
//   anonKey: "eyJ..."
// }
```

### Test 2: Test API Call

```javascript
// In browser console:
const travels = await TravelDataService.getTravels();
console.log('Aantal reizen:', travels.length);
console.log('Eerste reis:', travels[0]);
```

**Verwacht resultaat:**
```javascript
[TravelDataService] Fetching travels from BOLT...
[TravelDataService] Fetched travels: 8
Aantal reizen: 8
Eerste reis: {
  id: "uuid-123",
  title: "Thailand Strandparadijs",
  location: "Thailand",
  tags: "strand,tropisch,luxe",
  ...
}
```

### Test 3: Test in Travel Overview

1. Ga naar builder
2. Voeg Travel Overview component toe
3. Reizen moeten automatisch laden
4. Check console voor logs

**Verwacht:**
```
[TravelDataService] Fetching travels from BOLT...
[TravelDataService] Fetched travels: 8
[TravelOverview] Loaded 8 travels
```

---

## 🔌 API Endpoints

### BOLT trips-api Endpoints:

**Voor Builder (alleen gepubliceerde):**
```
GET https://jouw-project.supabase.co/functions/v1/trips-api?for_builder=true
Authorization: Bearer {anonKey}
```

**Voor Dashboard (alle reizen):**
```
GET https://jouw-project.supabase.co/functions/v1/trips-api
Authorization: Bearer {anonKey}
```

### Response Format:

```json
[
  {
    "id": "uuid-123",
    "title": "Thailand Strandvakantie",
    "location": "Thailand",
    "duration": "7 dagen",
    "days": 7,
    "price": 1299,
    "currency": "EUR",
    "description": "Ontspan op de mooiste stranden",
    "image": "https://images.unsplash.com/...",
    "tags": "strand,tropisch,luxe",
    "featured": false,
    "priority": 999,
    "status": "published",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
]
```

---

## 🐛 Troubleshooting

### Probleem: "BOLT_DB not configured"

**Oorzaak:** window.BOLT_DB is niet gezet

**Oplossing:**
1. Check of config/bolt.js is geladen
2. Check of script tag in index.html staat
3. Check browser console voor errors
4. Refresh pagina (Ctrl + Shift + R)

### Probleem: "HTTP 401 Unauthorized"

**Oorzaak:** Anon key is incorrect of verlopen

**Oplossing:**
1. Check of anon key correct is gekopieerd
2. Vraag BOLT om nieuwe key
3. Check of key geen extra spaties heeft

### Probleem: "HTTP 404 Not Found"

**Oorzaak:** URL is incorrect of trips-api is niet deployed

**Oplossing:**
1. Check of URL eindigt op `.supabase.co`
2. Check of `/functions/v1/trips-api` bestaat
3. Vraag BOLT of API is deployed

### Probleem: "CORS Error"

**Oorzaak:** CORS niet correct ingesteld in BOLT

**Oplossing:**
1. BOLT moet CORS headers toevoegen
2. Check of `Access-Control-Allow-Origin: *` is gezet
3. Test in Postman eerst

### Probleem: Geen reizen zichtbaar

**Oorzaak:** Geen reizen in database of status != published

**Oplossing:**
1. Check in BOLT of er reizen zijn
2. Check of status = "published"
3. Test API direct: `curl https://...`

---

## 🔒 Security

### Anon Key vs Service Role Key:

**Anon Key (Publiek):**
- ✅ Gebruik in frontend/builder
- ✅ Alleen lezen van gepubliceerde data
- ✅ Veilig om te delen
- ❌ Geen schrijfrechten

**Service Role Key (Geheim):**
- ❌ NOOIT in frontend gebruiken
- ✅ Alleen in backend/server
- ✅ Volledige database toegang
- ⚠️ Geheim houden!

### Best Practices:

```javascript
// ✅ GOED - Anon key in frontend
window.BOLT_DB = {
  url: 'https://project.supabase.co',
  anonKey: 'eyJ...' // Publieke key
};

// ❌ FOUT - Service role key in frontend
window.BOLT_DB = {
  url: 'https://project.supabase.co',
  serviceKey: 'eyJ...' // NOOIT DOEN!
};
```

---

## 📊 Data Flow

### Complete Flow:

```
1. Browser laadt index.html
   ↓
2. config/bolt.js wordt geladen
   → window.BOLT_DB gezet
   ↓
3. TravelDataService wordt geladen
   ↓
4. Travel Overview component wordt toegevoegd
   ↓
5. Component roept TravelDataService.getTravels() aan
   ↓
6. Service maakt API call naar BOLT:
   GET /functions/v1/trips-api?for_builder=true
   ↓
7. BOLT returnt gepubliceerde reizen
   ↓
8. Service transformeert data
   ↓
9. Component toont reizen
   ✅ Klaar!
```

---

## 🚀 Deployment

### Voor Productie:

**1. Environment Variables:**
```bash
# .env file
BOLT_SUPABASE_URL=https://project.supabase.co
BOLT_ANON_KEY=eyJ...
```

**2. Build Script:**
```javascript
// build.js
const config = `
window.BOLT_DB = {
  url: '${process.env.BOLT_SUPABASE_URL}',
  anonKey: '${process.env.BOLT_ANON_KEY}'
};
`;

fs.writeFileSync('dist/config/bolt.js', config);
```

**3. Vercel/Netlify:**
```
Environment Variables toevoegen in dashboard:
- BOLT_SUPABASE_URL
- BOLT_ANON_KEY
```

---

## ✅ Checklist

### Setup Checklist:
- [ ] BOLT credentials ontvangen
- [ ] config/bolt.js aangemaakt
- [ ] Script tag toegevoegd aan index.html
- [ ] Browser refreshed (Ctrl + Shift + R)
- [ ] window.BOLT_DB getest in console
- [ ] TravelDataService.getTravels() getest
- [ ] Travel Overview component getest
- [ ] Reizen zijn zichtbaar

### Productie Checklist:
- [ ] Environment variables ingesteld
- [ ] Build script werkt
- [ ] Config niet in git committed
- [ ] CORS correct ingesteld
- [ ] SSL/HTTPS actief
- [ ] Error handling getest

---

## 📞 Support

**Als het niet werkt:**

1. Check browser console voor errors
2. Test API direct met curl:
   ```bash
   curl "https://project.supabase.co/functions/v1/trips-api?for_builder=true" \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```
3. Verifieer credentials met BOLT
4. Check network tab in DevTools

**Veelvoorkomende Errors:**

| Error | Oorzaak | Oplossing |
|-------|---------|-----------|
| `BOLT_DB not configured` | Config niet geladen | Check script tag |
| `401 Unauthorized` | Verkeerde key | Check anon key |
| `404 Not Found` | Verkeerde URL | Check Supabase URL |
| `CORS Error` | CORS niet ingesteld | BOLT moet fixen |
| `No travels found` | Geen data | Check BOLT database |

---

**Na setup werkt alles automatisch!** ⚙️✨
