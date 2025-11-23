# 🎨 Template Importeren - Super Simpel

## TL;DR

```bash
npm run import
```

Dat is alles! De wizard vraagt je wat je nodig hebt.

---

## Stappen

### 1. Download template van ThemeForest
- Koop template
- Download ZIP
- Unzip naar een folder

### 2. Run import commando
```bash
npm run import
```

### 3. Vul wizard in
```
📦 Template naam: Luxury Travel
📁 Template pad: ./templates/LuxuryTravel
✅ Doorgaan met importeren? ja
```

### 4. Klaar! ✅
Template is direct beschikbaar in BOLT Quick Start!

---

## Output voorbeeld

```
🎨 Template Import Wizard
══════════════════════════════════════════════════

📦 Template naam (bijv. "Luxury Travel"): Luxury Travel

💡 Tip: Gebruik relatief pad vanaf project root
   Bijvoorbeeld: ./templates/LuxuryTravel
   Of: C:/Downloads/travel-template-unzipped

📁 Template pad: ./templates/LuxuryTravel

📋 Samenvatting:
   Naam: Luxury Travel
   Pad: ./templates/LuxuryTravel
   Categorie: luxury-travel

✅ Doorgaan met importeren? (ja/nee): ja

🚀 Starting import...

📄 Found 12 HTML files

📝 Processing: Home (85.3 KB)
📝 Processing: About (62.1 KB)
📝 Processing: Tours (91.7 KB)
...

💾 Inserting into database...

✅ Import complete!
📊 Imported 12 pages

📋 Summary:
   - Home (luxury-travel)
   - About (luxury-travel)
   - Tours (luxury-travel)
   ...

🎉 Template is now available in BOLT Quick Start!

✅ Import succesvol!

📋 Volgende stappen:
   1. Check BOLT → Quick Start dropdown
   2. Template zou zichtbaar moeten zijn!
```

---

## Eenmalige setup (eerste keer)

```bash
# 1. Install dependencies
npm install

# 2. Set Supabase key
$env:SUPABASE_SERVICE_KEY = "jouw_service_role_key"
```

Daarna gewoon `npm run import` gebruiken! 🚀

---

## Troubleshooting

### "SUPABASE_SERVICE_KEY not found"
Zet environment variable:
```powershell
$env:SUPABASE_SERVICE_KEY = "service_role_key_hier"
```

### "Template path does not exist"
Check of pad klopt. Gebruik volledig pad als relatief niet werkt:
```
C:/Downloads/luxury-template
```

### "Database error"
Check Supabase connection en RLS policies.

---

## Geavanceerd (als je het commando toch wilt onthouden)

```bash
# Met alle opties direct
npm run import-template -- --name="Luxury Travel" --path="./templates/LuxuryTravel" --category="luxury"
```

Maar `npm run import` is veel makkelijker! 😄
