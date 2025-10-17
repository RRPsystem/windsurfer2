# Antwoord op je vraag over het opslaan van pagina's

## Vraag 1: Welke button moet je gebruiken in /mode/news?

In `/mode/news` zijn er **2 buttons**:

### 1. "Opslaan" Button (saveProjectBtn)
- **Functie**: Slaat het nieuws op als **draft** (concept)
- **Status**: Blijft 'draft'
- **API Call**: `POST /content-api/news/save`
- **Gebruik**: Voor tussentijds opslaan terwijl je nog aan het werken bent

### 2. "Publiceer nieuws" Button (newsPublishBtn)
- **Functie**: Publiceert het nieuws
- **Status**: Wordt 'published'
- **API Call**: `POST /content-api/publish?type=news_items`
- **Gebruik**: Als je klaar bent en het nieuws live wilt zetten

## Antwoord: Gebruik beide!

1. **Tijdens het werken**: Klik op "Opslaan" om je werk op te slaan als draft
2. **Als je klaar bent**: Klik op "Publiceer nieuws" om het live te zetten

---

## Probleem: JWT Authenticatie Faalt

Bolt zegt dat de JWT "Invalid" is. Dit kan verschillende oorzaken hebben:

### Mogelijke Oorzaken

1. **Token is verlopen** (exp timestamp)
2. **Brand ID mismatch**: JWT bevat andere brand_id dan het request
3. **Authorization header ontbreekt of is incorrect**
4. **API key ontbreekt**

---

## Wat ik heb toegevoegd

### 1. Debug Logging in publish.js

Ik heb extra debug logging toegevoegd aan:
- `newsSaveDraft()` - Logt alle request details
- `newsPublish()` - Logt alle request details en errors

**In de browser console zie je nu:**
```
[newsSaveDraft] request { base, url, brand_id, hasToken, hasApiKey, ... }
[newsPublish] request { base, url, brand_id, hasToken, hasApiKey, ... }
```

### 2. JWT Validatie Functies

Je kunt nu in de browser console deze commands gebruiken:

```javascript
// Check of JWT geldig is
window.BuilderPublishAPI.validateJWT()

// Decode JWT om payload te zien
window.BuilderPublishAPI.decodeJWT(token)

// Health check
await window.BuilderPublishAPI.healthCheck()
```

### 3. Documentatie

Ik heb 3 documenten aangemaakt:

1. **DEBUG_INSTRUCTIONS.md** - Stap-voor-stap debug instructies
2. **CONSOLE_COMMANDS.md** - Alle console commands die je kunt gebruiken
3. **ANTWOORD_OP_VRAAG.md** - Dit document

---

## Volgende Stappen voor Debugging

### Stap 1: Run Full Diagnostics

Open de browser console (F12) en run:

```javascript
async function fullDiagnostics() {
  console.group('🔍 Full Diagnostics');
  
  // 1. URL Parameters
  console.group('📋 URL Parameters');
  const url = new URL(window.location.href);
  console.log('API:', url.searchParams.get('api'));
  console.log('Brand ID:', url.searchParams.get('brand_id'));
  console.log('Token:', url.searchParams.get('token') ? 'SET' : 'NOT SET');
  console.log('API Key:', url.searchParams.get('apikey') ? 'SET' : 'NOT SET');
  console.groupEnd();
  
  // 2. JWT Validation
  console.group('🔐 JWT Validation');
  const jwtResult = window.BuilderPublishAPI.validateJWT();
  console.log('Valid:', jwtResult.valid);
  if (!jwtResult.valid) console.error('Reason:', jwtResult.reason);
  if (jwtResult.payload) {
    console.log('Brand ID in JWT:', jwtResult.payload.brand_id);
    console.log('Expires:', new Date(jwtResult.payload.exp * 1000));
  }
  console.groupEnd();
  
  // 3. Health Check
  console.group('🏥 Health Check');
  const health = await window.BuilderPublishAPI.healthCheck();
  console.log('Overall OK:', health.ok);
  console.log('Missing:', health.missing);
  console.groupEnd();
  
  console.groupEnd();
  
  return { jwtResult, health };
}

await fullDiagnostics();
```

### Stap 2: Probeer Opslaan/Publiceren

Klik op "Opslaan" of "Publiceer nieuws" en bekijk de console logs.

### Stap 3: Check Network Tab

1. Open Developer Tools (F12)
2. Ga naar **Network** tab
3. Klik op "Publiceer nieuws"
4. Zoek het request naar `/content-api/publish`
5. Check:
   - **Headers**: Is Authorization header aanwezig?
   - **Payload**: Welke brand_id wordt verstuurd?
   - **Response**: Wat is de error?

### Stap 4: Check Supabase Logs

1. Open Supabase Dashboard
2. Ga naar Edge Functions → content-api
3. Klik op "Logs"
4. Probeer opnieuw te publiceren
5. Bekijk de error logs

---

## Mogelijke Oplossingen

### Oplossing 1: Token is Verlopen

Als `validateJWT()` zegt "Token expired":
- Genereer een nieuwe JWT in het Bolt systeem
- Update de URL met de nieuwe token

### Oplossing 2: Brand ID Mismatch

Als `validateJWT()` zegt "Brand ID mismatch":
- Check welke brand_id in de JWT zit
- Check welke brand_id in de URL staat
- Deze moeten hetzelfde zijn!

**Fix**: Update de URL parameter:
```
?brand_id=<SAME_AS_JWT>&token=...
```

### Oplossing 3: Authorization Header Ontbreekt

Als de Network tab geen Authorization header toont:
- Check of `token` parameter in URL staat
- Check of `window.CURRENT_TOKEN` is gezet
- Herlaad de pagina met de correcte URL

---

## Contact/Hulp Nodig?

Deel de volgende informatie:

1. **Console output** van `fullDiagnostics()`
2. **Network tab** screenshot van het failed request
3. **Supabase Edge Function logs**
4. **JWT payload** (run `validateJWT()` en deel de output)

Dan kan ik het probleem verder analyseren!

---

## Samenvatting

✅ **Welke button**: Gebruik "Opslaan" voor drafts, "Publiceer nieuws" voor publiceren
✅ **Debug tools**: Toegevoegd aan publish.js
✅ **Documentatie**: 3 documenten met instructies
✅ **Volgende stap**: Run `fullDiagnostics()` in console en deel de output

Succes met debuggen! 🚀
