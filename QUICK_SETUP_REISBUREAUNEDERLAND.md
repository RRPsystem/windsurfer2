# Quick Setup: Reisbureaunederland Microsite

## Probleem
Je hebt "reisbureaunederland" als tweede microsite toegevoegd in Vercel, maar krijgt een "User not authorized" error bij het importeren van reizen.

## Oorzaak
Het systeem heeft aparte credentials nodig voor elke microsite. Momenteel gebruikt het alleen de credentials van de eerste microsite.

## ✅ Oplossing: Numbered Suffix Pattern (Aanbevolen)

Het systeem ondersteunt nu automatisch genummerde environment variables!

### Wat je al hebt (Microsite 1):
```
TC_MICROSITE_ID = rondreis-planner
TC_USERNAME = [jouw username]
TC_PASSWORD = [jouw password]
```

### Wat je moet toevoegen (Microsite 2):
```
TC_MICROSITE_ID_2 = reisbureaunederland
TC_USERNAME_2 = [username voor reisbureaunederland]
TC_PASSWORD_2 = [password voor reisbureaunederland]
```

### Voor Microsite 3, 4, etc.:
```
TC_MICROSITE_ID_3 = derde-microsite
TC_USERNAME_3 = [username]
TC_PASSWORD_3 = [password]
```

**Het systeem herkent automatisch `_2`, `_3`, `_4` tot `_10`!**

## Stappen in Vercel

1. Open https://vercel.com/dashboard
2. Selecteer je project: **ai-websitestudio**
3. Ga naar **Settings** → **Environment Variables**
4. Klik **"Add New"** voor elke variable:
   - `TC_MICROSITE_ID_2` → waarde: `reisbureaunederland`
   - `TC_USERNAME_2` → waarde: [jouw username]
   - `TC_PASSWORD_2` → waarde: [jouw password]
5. Vink bij elke variable alle environments aan (Production, Preview, Development)
6. Ga naar **Deployments** → **Redeploy**

## Alternatieve Methode: JSON Format

Je kunt ook één `TC_MICROSITES` variable gebruiken met JSON:

**Name:**
```
TC_MICROSITES
```

**Value:**
```json
{"rondreis-planner":{"username":"user1","password":"pass1"},"reisbureaunederland":{"username":"user2","password":"pass2"}}
```

**Environment:** Alle drie aanvinken

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
