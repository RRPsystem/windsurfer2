# Debug Instructies voor JWT Authenticatie Probleem

## Probleem
Het opslaan/publiceren van nieuws in de Builder faalt met "Invalid JWT" error.

## Welke button gebruiken?

In `/mode/news` zijn er **2 buttons**:

1. **"Opslaan"** - Slaat alleen een draft op (status blijft 'draft')
2. **"Publiceer nieuws"** - Publiceert het nieuws (status wordt 'published')

**Gebruik "Opslaan" voor drafts en "Publiceer nieuws" om te publiceren.**

## Debug Stappen

### 1. Browser Console Logs Checken

Open de browser Developer Tools (F12) en ga naar de **Console** tab.

Zoek naar deze logs:
```
[newsSaveDraft] request
[newsPublish] (als je op Publiceer nieuws klikt)
```

Deze logs tonen:
- `hasToken`: of de JWT token aanwezig is
- `hasApiKey`: of de API key aanwezig is
- `brand_id`: welke brand_id wordt gebruikt
- `author_type`: admin of brand
- Headers (gemaskeerd voor veiligheid)

### 2. Network Tab Checken

Ga naar de **Network** tab in Developer Tools.

Klik op "Opslaan" of "Publiceer nieuws" en zoek naar:
- Request naar `/content-api/news/save` (voor opslaan)
- Request naar `/content-api/publish?type=news_items` (voor publiceren)

Klik op het request en check:

#### Headers tab:
```
Authorization: Bearer eyJhbGci... (de JWT token)
apikey: eyJhbGci... (de Supabase anon key)
Content-Type: application/json
```

**Deel deze informatie (ZONDER de volledige tokens):**
- Is de Authorization header aanwezig? (Ja/Nee)
- Is de apikey header aanwezig? (Ja/Nee)
- Wat zijn de eerste 10 karakters van de Authorization header?

#### Payload tab:
```json
{
  "brand_id": "...",
  "title": "...",
  "slug": "...",
  "content": {...},
  "status": "draft",
  "author_type": "admin",
  "author_id": "..."
}
```

**Check:**
- Welke `brand_id` staat in de payload?
- Welke `author_type` staat in de payload? (admin of brand)

#### Response tab:
Als het faalt, wat is de error response?
```json
{
  "error": "Invalid JWT",
  "message": "..."
}
```

### 3. Supabase Edge Function Logs

1. Open Supabase Dashboard
2. Ga naar **Edge Functions** → **content-api**
3. Klik op **"Logs"**
4. Probeer opnieuw te publishen in de Builder
5. Bekijk de error logs

**Zoek naar:**
- JWT validation errors
- Brand ID mismatch errors
- Authorization errors

### 4. JWT Token Decoderen

Kopieer de JWT token uit de Authorization header (zonder "Bearer ").

Ga naar https://jwt.io en plak de token.

**Check de payload:**
```json
{
  "brand_id": "...",
  "user_id": "...",
  "exp": 1234567890,
  ...
}
```

**Vergelijk:**
- Is de `brand_id` in de JWT hetzelfde als in het request body?
- Is de token verlopen? (check `exp` timestamp)

## Mogelijke Oplossingen

### Oplossing 1: Brand ID Mismatch

Als de `brand_id` in de JWT niet matcht met de `brand_id` in het request:

**In de Builder URL:**
```
?api=...&brand_id=SYSTEM_BRAND_ID&token=...
```

De `brand_id` in de URL moet hetzelfde zijn als de `brand_id` waarmee de JWT is gegenereerd.

### Oplossing 2: Token Expiratie

Als de JWT is verlopen, moet je een nieuwe JWT genereren in het Bolt systeem.

### Oplossing 3: Authorization Header Ontbreekt

Als de Authorization header niet wordt verstuurd, check of:
- De `token` parameter in de URL aanwezig is
- De `window.CURRENT_TOKEN` global is gezet

## Extra Debug Logging

Ik heb extra debug logging toegevoegd aan de Builder. Open de Console en je zou moeten zien:

```
[newsSaveDraft] request { base, url, brand_id, title, slug, hasToken, hasApiKey, ... }
```

Dit toont exact welke parameters worden gebruikt voor het request.

## Contact

Deel de volgende informatie:
1. Console logs (gemaskeerd)
2. Network request headers (gemaskeerd)
3. Network request payload
4. Network response
5. Supabase Edge Function logs
6. JWT payload (gedecodeerd, gemaskeerd)

Dan kan ik het probleem verder analyseren.
