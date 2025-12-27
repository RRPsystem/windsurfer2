# Multiple Microsites Setup Guide

## Overzicht

Dit systeem ondersteunt meerdere Travel Compositor microsites met aparte credentials per microsite. Dit is nodig wanneer je meerdere reisbureaus of merken wilt bedienen, elk met hun eigen microsite.

## Configuratie in Vercel

### Optie 1: Enkele Microsite (Backward Compatible)

Voor één microsite gebruik je de bestaande environment variables:

```
TC_BASE_URL=https://online.travelcompositor.com
TC_MICROSITE_ID=rondreis-planner
TC_USERNAME=jouw_gebruikersnaam
TC_PASSWORD=jouw_wachtwoord
```

### Optie 2: Meerdere Microsites (Nieuw)

Voor meerdere microsites voeg je een nieuwe environment variable toe:

```
TC_BASE_URL=https://online.travelcompositor.com
TC_MICROSITES={"rondreis-planner":{"username":"user1","password":"pass1"},"reisbureaunederland":{"username":"user2","password":"pass2"}}
```

**Let op:** De `TC_MICROSITES` waarde moet een **geldige JSON string** zijn op één regel.

### Stap-voor-stap: Tweede Microsite Toevoegen

1. **Ga naar Vercel Dashboard**
   - Open je project: `ai-websitestudio`
   - Ga naar Settings → Environment Variables

2. **Voeg TC_MICROSITES toe**
   
   Klik op "Add New" en vul in:
   
   - **Name:** `TC_MICROSITES`
   - **Value:** 
   ```json
   {"rondreis-planner":{"username":"BESTAANDE_USER","password":"BESTAANDE_PASS"},"reisbureaunederland":{"username":"NIEUWE_USER","password":"NIEUWE_PASS"}}
   ```
   - **Environment:** Production, Preview, Development (alle drie aanvinken)

3. **Vervang de placeholders:**
   - `BESTAANDE_USER` → Je huidige TC_USERNAME
   - `BESTAANDE_PASS` → Je huidige TC_PASSWORD
   - `NIEUWE_USER` → Username voor reisbureaunederland microsite
   - `NIEUWE_PASS` → Password voor reisbureaunederland microsite

4. **Redeploy je applicatie**
   - Ga naar Deployments
   - Klik op de laatste deployment
   - Klik op "..." → "Redeploy"

## Gebruik in de Applicatie

### Travel Compositor Import

Wanneer je een reis importeert, geef je de microsite ID op:

```javascript
// In de Travel Compositor import form
micrositeId: "reisbureaunederland"
```

Het systeem zal automatisch de juiste credentials gebruiken voor die microsite.

### API Calls

Alle API endpoints accepteren nu een `micrositeId` parameter:

```javascript
// GET /api/ideas?micrositeId=reisbureaunederland
// GET /api/ideas/123456?micrositeId=reisbureaunederland
```

## Troubleshooting

### Error: "User not authorized to access"

**Oorzaak:** De credentials voor deze microsite zijn niet correct of ontbreken.

**Oplossing:**
1. Controleer of de microsite ID correct is gespeld in `TC_MICROSITES`
2. Controleer of username/password correct zijn voor deze microsite
3. Test de credentials rechtstreeks in Travel Compositor

### Error: "micrositeId parameter is required"

**Oorzaak:** Geen microsite ID opgegeven en geen default `TC_MICROSITE_ID`.

**Oplossing:**
1. Geef altijd een `micrositeId` parameter mee in API calls
2. Of zet een default `TC_MICROSITE_ID` in Vercel

### JSON Parse Error

**Oorzaak:** De `TC_MICROSITES` waarde is geen geldige JSON.

**Oplossing:**
1. Valideer je JSON op https://jsonlint.com/
2. Zorg dat alle quotes correct zijn (dubbele quotes, geen enkele)
3. Geen trailing comma's
4. Alles op één regel

## Voorbeeld Configuraties

### Twee Microsites

```json
{"rondreis-planner":{"username":"user1","password":"pass1"},"reisbureaunederland":{"username":"user2","password":"pass2"}}
```

### Drie Microsites

```json
{"rondreis-planner":{"username":"user1","password":"pass1"},"reisbureaunederland":{"username":"user2","password":"pass2"},"derde-microsite":{"username":"user3","password":"pass3"}}
```

## API Endpoint: Beschikbare Microsites

Je kunt de lijst van geconfigureerde microsites ophalen:

```
GET /api/config/microsites
```

Response:
```json
{
  "microsites": [
    {
      "id": "rondreis-planner",
      "hasCredentials": true
    },
    {
      "id": "reisbureaunederland",
      "hasCredentials": true
    }
  ],
  "baseUrl": "https://online.travelcompositor.com"
}
```

## Security Best Practices

1. **Nooit credentials in code:** Altijd via Vercel environment variables
2. **Aparte credentials per microsite:** Gebruik niet dezelfde credentials voor meerdere microsites
3. **Rotate passwords regelmatig:** Update credentials periodiek
4. **Test in Preview eerst:** Test nieuwe microsites eerst in Preview environment

## Migratie van Oude Setup

Als je al een werkende setup hebt met `TC_USERNAME` en `TC_PASSWORD`:

1. Laat de oude variables staan (backward compatible)
2. Voeg `TC_MICROSITES` toe voor nieuwe microsites
3. Het systeem gebruikt automatisch de juiste credentials

**Fallback logica:**
- Als `TC_MICROSITES` bestaat → gebruik microsite-specifieke credentials
- Anders → gebruik `TC_USERNAME` en `TC_PASSWORD` (oude manier)

## Vragen?

Bij problemen, check:
1. Vercel deployment logs voor error messages
2. Browser console voor API errors
3. `/api/config/microsites` endpoint om te zien welke microsites geconfigureerd zijn
