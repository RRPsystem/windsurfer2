# 🎨 Website Builder - Twee Designers

## Overzicht

Er zijn **twee verschillende builders** in het systeem:

---

## 1. 🧱 **Travelweb Builder** (`builder.html`)

**Wat is het:**
- Block-based page builder vanaf scratch
- Custom designs zonder template
- Drag & drop componenten

**Gebruikt voor:**
- ✈️ Reizen importeren vanuit Travel Compositor
- 📰 Nieuwsberichten maken
- 🎥 Video's toevoegen  
- 🏝️ Custom bestemmingspagina's
- 📄 Pagina's vanaf nul bouwen

**Database tabellen:**
- `builder_categories` - Block categorieën
- `builder_blocks` - Beschikbare blokken
- `trips` - Reizen data
- `news` - Nieuwsberichten
- `destinations` - Bestemmingen

**URL:**
```
https://www.ai-websitestudio.nl/builder.html
```

**QuickStart flow:**
- User kiest "Start from scratch"
- Bouwt pagina met blokken
- Voegt reizen/nieuws toe via API's

---

## 2. ⚡ **Quick Designer** (`simple-template-editor.html`)

**Wat is het:**
- Template editor voor gekochte HTML templates
- WYSIWYG bewerking van bestaande templates
- Brand settings (logo, kleuren, fonts)

**Gebruikt voor:**
- 🎨 GoWild template aanpassen
- 🏔️ Tripex template aanpassen
- 🖼️ Logo vervangen
- 🎨 Kleuren & fonts aanpassen
- 💾 Snel een mooie site vanaf template

**Database tabellen:**
- `website_page_templates` - Template HTML storage
- `brand_settings` - Logo, kleuren, fonts
- `pages` - Individuele pagina's

**URL:**
```
https://www.ai-websitestudio.nl/simple-template-editor.html
```

**QuickStart flow:**
- User kiest "GoWild" of "Tripex" template
- Selecteert pagina's (Home, About, Tours, Contact)
- HTML wordt gekopieerd naar `pages` tabel
- User kan direct bewerken in Quick Designer

---

## 📊 Vergelijking

| Feature | Travelweb Builder | Quick Designer |
|---------|-------------------|----------------|
| **Type** | Block builder | Template editor |
| **Start punt** | Leeg canvas | Compleet template |
| **Moeilijkheid** | Medium | Makkelijk |
| **Tijd** | 30+ min | 5 min |
| **Flexibiliteit** | Heel flexibel | Beperkt tot template |
| **Best voor** | Custom designs | Snelle websites |
| **Reizen** | ✅ Ja | ❌ Nee* |
| **Templates** | ❌ Nee | ✅ Ja |

*Travelweb Builder kan reizen tonen, Quick Designer niet (maar kan wel manueel worden toegevoegd)

---

## 🚀 Welke builder voor welk scenario?

### Gebruik **Travelweb Builder** als:
- Je een uniek design wilt
- Je reizen wilt importeren
- Je blog/nieuws nodig hebt
- Je volledige controle wilt
- Je tijd hebt om te bouwen

### Gebruik **Quick Designer** als:
- Je snel een professionele site wilt
- Je een mooi template hebt gekocht
- Je alleen logo/kleuren wilt aanpassen
- Je geen technische kennis hebt
- Je binnen 5 minuten online wilt

---

## 🔄 Workflow voorbeeld

### Scenario 1: Reisorganisatie met custom design
```
BOLT → Kies "Travelweb Builder"
     → Start from scratch
     → Voeg hero block toe
     → Importeer reizen via TC
     → Voeg destinations toe
     → Publiceer
```

### Scenario 2: Snel een mooie site
```
BOLT → Kies "Quick Designer"  
     → Selecteer GoWild template
     → Kies Home + About + Tours pagina's
     → Upload logo
     → Kies kleuren
     → Publiceer → Klaar in 5 min! ✅
```

---

## 📝 Voor BOLT Development Team

### Belangrijke punten:

1. **Dit zijn TWEE APARTE SYSTEMEN**
   - Delen geen code
   - Gebruiken verschillende tabellen
   - Hebben andere workflows

2. **Quick Designer gebruikt GEEN `builder_categories`**
   - Gebruikt alleen `website_page_templates`
   - Templates zijn al gevuld met GoWild/Tripex
   - Hoeft niet opnieuw geregistreerd te worden

3. **Als QuickStart zegt "builder_categories is leeg"**
   - Dat klopt! Quick Designer gebruikt dat niet
   - Check `website_page_templates` in plaats daarvan
   - Zie SQL: `SELECT * FROM website_page_templates WHERE category = 'gowild';`

4. **URL structuur verschil**
   ```
   Travelweb: /builder.html?id=...&mode=travel
   Quick:     /simple-template-editor.html?page_id=...
   ```

5. **Database schema**
   - Beide gebruiken `pages` tabel
   - Maar vullen het anders:
     - Travelweb: User bouwt met blocks
     - Quick: Kopiëert HTML uit templates

---

## ✅ Checklist voor nieuwe features

### Als je iets toevoegt aan Travelweb Builder:
- [ ] Check `builder_blocks` tabel
- [ ] Test met trips/news/destinations
- [ ] Gebruik `builder.html` URL
- [ ] Zorg dat blocks opgeslagen worden

### Als je iets toevoegt aan Quick Designer:
- [ ] Check `website_page_templates` tabel
- [ ] Test logo/font/color aanpassingen
- [ ] Gebruik `simple-template-editor.html` URL
- [ ] Zorg dat brand settings werken

---

## 🎯 Huidige Focus

**Quick Designer:**
- ✅ Templates vullen met HTML
- ✅ Brand settings opslaan/laden
- 🔧 Image paden fixen (in progress)
- 🔧 Auto-apply logo na load (in progress)

**Travelweb Builder:**
- ✅ Trip import werkt
- ✅ Blocks opslaan werkt
- ⏸️ On hold tot Quick Designer klaar is

---

## 💬 Communicatie Tips

**Als BOLT vraagt:** "Welke template wil je toevoegen?"

**Bedoelen ze:**
- Travelweb Builder → "Welke blocks wil je?"
- Quick Designer → "Welke ThemeForest template? (GoWild/Tripex)"

**Vraag altijd:** "Welke builder bedoel je? Travelweb of Quick Designer?"

---

## 📞 Contact

Bij vragen over:
- **Travelweb Builder**: Kijk naar `builder.html` code
- **Quick Designer**: Kijk naar `simple-template-editor.html` code
- **Database**: Beide gebruiken Supabase, verschillende tabellen

**Wees specifiek over welke builder je bedoelt!** 🎯
