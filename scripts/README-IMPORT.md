# Template Import Script

Automatisch importeren van ThemeForest templates in de database.

## Setup

1. **Install dependencies:**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Set environment variable:**
   ```bash
   # Windows PowerShell
   $env:SUPABASE_SERVICE_KEY = "your-service-role-key-here"
   
   # Of maak .env file
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   SUPABASE_URL=https://huaaogdxxdcakxryecnw.supabase.co
   ```

## Usage

### Basic Import

```bash
node scripts/import-template.js --name="NieuweTemplate" --path="./templates/NieuweTemplate"
```

### Met custom category

```bash
node scripts/import-template.js --name="Luxury Travel" --path="./downloads/luxury-template" --category="luxury-travel"
```

### Via npm script

```bash
npm run import-template -- --name="NieuweTemplate" --path="./templates/NieuweTemplate"
```

## Wat doet het script?

1. ✅ Scant de template folder voor alle `.html` files
2. ✅ Leest de HTML content
3. ✅ Converteert filenames naar leesbare namen (index.html → Home)
4. ✅ Genereert preview URLs
5. ✅ Insert alles in `website_page_templates` tabel
6. ✅ Template is direct beschikbaar in BOLT!

## File name conversie

Script herkent automatisch:
- `index.html` → Home
- `index-2.html` → Home 2
- `about.html` → About
- `blog-details.html` → Blog Details
- `tour-details.html` → Tour Details
- etc.

## Folder structuur

Script skipt automatisch:
- `node_modules/`
- `assets/`
- `css/`
- `js/`
- `images/`
- `fonts/`
- `.git/`

## Output voorbeeld

```
🚀 Starting template import...
📦 Template: LuxuryTravel
📁 Path: ./templates/LuxuryTravel
🏷️  Category: luxury-travel

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
```

## Troubleshooting

### Error: SUPABASE_SERVICE_KEY not found
- Check environment variable is set
- Use service_role key, NOT anon key

### Error: Template path does not exist
- Check path is correct
- Use relative path from project root

### Error: Database error
- Check Supabase connection
- Verify table exists: `website_page_templates`
- Check RLS policies allow service_role

## Na import

Template is direct beschikbaar in:
1. ✅ BOLT Quick Start dropdown
2. ✅ Quick Designer template selector
3. ✅ API endpoint `/api/templates/list`

Geen extra stappen nodig! 🚀
