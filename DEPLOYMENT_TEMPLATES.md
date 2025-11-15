# Template System Deployment Guide

## Status: 🟡 Lokaal Klaar, Productie Pending

Het template systeem is **lokaal werkend** maar moet nog **gedeployed** worden naar productie.

## Lokaal Testen (NU)

### Stap 1: Start Server
```powershell
cd c:\Users\info\CascadeProjects\website-builder
.\start-server.ps1
```

### Stap 2: Open Test Pagina
```
http://localhost:8080/test-templates.html
```

### Stap 3: Vul Gegevens In
- Brand ID (uit Supabase)
- JWT Token (uit BOLT/Supabase auth)
- API Key (Supabase anon key)

### Stap 4: Test Flow
1. Klik "Open Template Selector"
2. Kies template (Gotur of Tripix)
3. Controleer auto-fill van brand data
4. Bekijk trips loading
5. Genereer website
6. Preview resultaat

## Productie Deployment

### Optie A: Vercel (Aanbevolen)

**Bestanden die gedeployed moeten worden:**
```
website-builder/
├── template-selector.html
├── template-configurator.html
├── template-generator.html
├── test-templates.html
├── js/
│   └── template-generator.js
└── templates/
    ├── gotur/
    └── tripix-html/
```

**Deploy commando:**
```powershell
# In project folder
vercel --prod
```

**Resultaat:**
```
https://www.ai-websitestudio.nl/template-selector.html
```

### Optie B: Handmatig Upload

**Upload naar hosting:**
1. FTP/SFTP naar `ai-websitestudio.nl`
2. Upload alle bestanden naar root
3. Zorg dat `/templates/` folder toegankelijk is

**Test URL's:**
```
https://www.ai-websitestudio.nl/template-selector.html
https://www.ai-websitestudio.nl/templates/gotur/gotur-html-main/index.html
https://www.ai-websitestudio.nl/templates/tripix-html/index.html
```

### Optie C: Git Push + Auto Deploy

**Als je auto-deploy hebt:**
```powershell
git add .
git commit -m "Add template selector system"
git push origin main
```

**Wacht op deployment:**
- GitHub Actions / Vercel / Netlify zal automatisch deployen

## Na Deployment

### 1. Test Productie URL's

```
✅ https://www.ai-websitestudio.nl/template-selector.html
✅ https://www.ai-websitestudio.nl/template-configurator.html
✅ https://www.ai-websitestudio.nl/template-generator.html
✅ https://www.ai-websitestudio.nl/templates/gotur/gotur-html-main/index.html
✅ https://www.ai-websitestudio.nl/templates/tripix-html/index.html
```

### 2. BOLT Integratie

**Voeg toe aan BOLT menu:**
```javascript
{
    label: '🚀 Quick Start Website',
    url: 'https://www.ai-websitestudio.nl/template-selector.html',
    params: {
        brand_id: '{CURRENT_BRAND_ID}',
        token: '{JWT_TOKEN}',
        apikey: '{SUPABASE_ANON_KEY}',
        api: 'https://huaaogdxxdcakxryecnw.supabase.co/functions/v1'
    }
}
```

### 3. Test Complete Flow

```
BOLT → Template Selector → Configurator → Generator → Success
```

## Checklist voor Deployment

### Pre-Deployment
- [x] Template bestanden aanwezig (Gotur, Tripix)
- [x] HTML bestanden gemaakt (selector, configurator, generator)
- [x] JavaScript logic compleet (template-generator.js)
- [x] Test pagina gemaakt (test-templates.html)
- [x] Documentatie geschreven (README's)

### Deployment
- [ ] Bestanden uploaden naar ai-websitestudio.nl
- [ ] Template folders uploaden (/templates/)
- [ ] Test URL's in browser
- [ ] Verifieer CORS settings
- [ ] Check SSL certificaat

### Post-Deployment
- [ ] Test vanuit BOLT
- [ ] Verifieer brand data loading
- [ ] Test trips loading
- [ ] Check template generatie
- [ ] Test preview functionaliteit
- [ ] Verifieer return URL naar BOLT

## Huidige Situatie

### ✅ Wat Werkt (Lokaal)
- Template selector UI
- Template configurator
- Template generator
- Brand data ophalen uit Supabase
- Trips loading
- Menu & footer generatie
- Preview functionaliteit

### 🟡 Wat Nog Moet (Productie)
- Deployment naar ai-websitestudio.nl
- BOLT menu integratie
- Productie testing
- CORS configuratie verificatie

### 🔜 Toekomstige Features
- Meer templates (Adventure, Classic)
- Direct publish naar hosting
- Custom domain support
- Template marketplace

## Snelle Deploy (Als je Vercel gebruikt)

```powershell
# Zorg dat je in de project folder bent
cd c:\Users\info\CascadeProjects\website-builder

# Check vercel config
cat vercel.json

# Deploy naar productie
vercel --prod

# Volg de URL die Vercel geeft
# Bijvoorbeeld: https://website-builder-xyz.vercel.app
```

## Troubleshooting

### "Template niet gevonden"
**Probleem:** Templates folder niet geüpload
**Oplossing:** Upload `/templates/` folder naar server

### "Brand data niet geladen"
**Probleem:** CORS of auth issues
**Oplossing:** Check Supabase CORS settings en JWT token

### "Kan niet openen vanuit BOLT"
**Probleem:** URL nog niet live
**Oplossing:** Deploy eerst naar productie

## Support

**Lokaal testen:**
```
http://localhost:8080/test-templates.html
```

**Productie URL (na deployment):**
```
https://www.ai-websitestudio.nl/template-selector.html
```

**Contact:** Development team voor deployment hulp
