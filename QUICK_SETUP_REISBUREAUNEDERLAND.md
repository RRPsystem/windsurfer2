# Quick Setup: Reisbureaunederland Microsite

## Probleem
Je hebt "reisbureaunederland" als tweede microsite toegevoegd in Vercel, maar krijgt een "User not authorized" error bij het importeren van reizen.

## Oorzaak
Het systeem heeft aparte credentials nodig voor elke microsite. Momenteel gebruikt het alleen de credentials van de eerste microsite.

## Oplossing: Voeg TC_MICROSITES toe in Vercel

### Stap 1: Ga naar Vercel Environment Variables

1. Open https://vercel.com/dashboard
2. Selecteer je project: **ai-websitestudio**
3. Ga naar **Settings** → **Environment Variables**

### Stap 2: Voeg TC_MICROSITES toe

Klik op **"Add New"** en vul in:

**Name:**
```
TC_MICROSITES
```

**Value:** (vervang de placeholders met je echte credentials)
```json
{"rondreis-planner":{"username":"BESTAANDE_USERNAME","password":"BESTAANDE_PASSWORD"},"reisbureaunederland":{"username":"NIEUWE_USERNAME","password":"NIEUWE_PASSWORD"}}
```

**Belangrijk:**
- Vervang `BESTAANDE_USERNAME` en `BESTAANDE_PASSWORD` met je huidige TC_USERNAME en TC_PASSWORD
- Vervang `NIEUWE_USERNAME` en `NIEUWE_PASSWORD` met de credentials voor reisbureaunederland
- Alles moet op **één regel** staan
- Gebruik **dubbele quotes** (geen enkele quotes)

**Environment:** Vink alle drie aan:
- ✅ Production
- ✅ Preview  
- ✅ Development

### Stap 3: Redeploy

1. Ga naar **Deployments**
2. Klik op de laatste deployment
3. Klik op **"..."** (drie puntjes)
4. Klik op **"Redeploy"**

### Stap 4: Test

Na de redeploy:

1. Ga naar je Travel Compositor import form
2. Vul in:
   - **Travel Compositor ID:** `26218581` (of een ander reis ID)
   - **Microsite ID:** `reisbureaunederland`
3. Klik op **"Reis Laden"**

Het zou nu moeten werken! ✅

## Voorbeeld TC_MICROSITES waarde

Als je huidige credentials zijn:
- Username: `apiuser`
- Password: `secret123`

En voor reisbureaunederland heb je:
- Username: `rbnl_user`
- Password: `rbnl_pass456`

Dan wordt de waarde:
```json
{"rondreis-planner":{"username":"apiuser","password":"secret123"},"reisbureaunederland":{"username":"rbnl_user","password":"rbnl_pass456"}}
```

## Troubleshooting

### "JSON parse error"
- Controleer of je dubbele quotes gebruikt (niet enkele)
- Controleer of alles op één regel staat
- Test je JSON op https://jsonlint.com/

### "User not authorized" blijft bestaan
- Controleer of de username/password correct zijn voor reisbureaunederland
- Test de credentials rechtstreeks in Travel Compositor
- Check Vercel deployment logs voor details

### Weet je de credentials niet?
- Neem contact op met Travel Compositor support
- Of check je Travel Compositor account settings

## Meer Info

Zie `docs/MULTIPLE_MICROSITES_SETUP.md` voor uitgebreide documentatie.
