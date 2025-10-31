# BOLT Instructies: CSS Styling Fix Voor Dynamische Pagina's

## 🎯 Probleem
Pagina's die via de `pages-api` edge function worden geserveerd hebben geen CSS styling, omdat de CSS files lokaal zijn en niet beschikbaar op Supabase.

## ✅ Oplossing
Upload CSS files naar Supabase Storage en update de edge function om deze te linken.

---

## 📋 Stap 1: Upload CSS Naar Supabase Storage

### Optie A: Via Supabase Dashboard (Makkelijkst)

1. **Ga naar Supabase Dashboard**
   - Open je project
   - Ga naar "Storage"
   - Klik "Create bucket"

2. **Maak Assets Bucket**
   ```
   Bucket name: assets
   Public bucket: ✅ Yes
   File size limit: 50MB
   Allowed MIME types: text/css, application/javascript, image/*
   ```

3. **Upload CSS Files**
   - Open de `assets` bucket
   - Maak folder: `styles`
   - Upload deze files:
     - `styles/main.css` (uit lokaal project)
     - `styles/components.css` (uit lokaal project)

4. **Noteer De URLs**
   ```
   https://[jouw-project].supabase.co/storage/v1/object/public/assets/styles/main.css
   https://[jouw-project].supabase.co/storage/v1/object/public/assets/styles/components.css
   ```

### Optie B: Via Upload Script (Automatisch)

1. **Installeer Dependencies**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Set Environment Variables**
   ```bash
   export SUPABASE_URL="https://[jouw-project].supabase.co"
   export SUPABASE_SERVICE_KEY="[jouw-service-key]"
   ```

3. **Run Upload Script**
   ```bash
   node scripts/upload-css-to-supabase.js
   ```

---

## 📋 Stap 2: Deploy Bijgewerkte Edge Function

### Deploy pages-api Edge Function

1. **Zorg dat Supabase CLI is geïnstalleerd**
   ```bash
   npm install -g supabase
   supabase login
   ```

2. **Link Je Project**
   ```bash
   supabase link --project-ref [jouw-project-ref]
   ```

3. **Deploy De Edge Function**
   ```bash
   supabase functions deploy pages-api
   ```

4. **Set Environment Variables (als nog niet gedaan)**
   ```bash
   supabase secrets set SUPABASE_URL=https://[jouw-project].supabase.co
   supabase secrets set SUPABASE_ANON_KEY=[jouw-anon-key]
   ```

---

## 📋 Stap 3: Test De Setup

### Test URL
```
https://[jouw-project].supabase.co/functions/v1/pages-api/home
```

### Verwacht Resultaat
- ✅ Pagina laadt met volledige styling
- ✅ Hero sections hebben overlays
- ✅ Travel cards zijn mooi gestijld
- ✅ Fonts en icons laden correct

### Debug Als Het Niet Werkt

1. **Check Browser Console (F12)**
   - Kijk of CSS files laden
   - Check voor 404 errors
   - Kijk naar Network tab

2. **Check Edge Function Logs**
   ```bash
   supabase functions logs pages-api
   ```

3. **Verify CSS URLs**
   - Open CSS URL direct in browser
   - Moet CSS code tonen, niet 404

---

## 🔄 Updates Maken

### CSS Updaten
1. **Wijzig lokale CSS files**
2. **Upload opnieuw naar Supabase Storage**
   - Via dashboard: Upload met "Overwrite existing file"
   - Via script: Run `node scripts/upload-css-to-supabase.js`
3. **Clear browser cache** (Ctrl+Shift+R)

### Edge Function Updaten
1. **Wijzig `supabase/functions/pages-api/index.ts`**
2. **Deploy opnieuw**
   ```bash
   supabase functions deploy pages-api
   ```

---

## 📝 Belangrijke Notes

### Cache
- CSS files hebben 1 uur cache (`Cache-Control: 3600`)
- Bij updates: clear browser cache of wacht 1 uur
- Of: voeg versioning toe aan URLs (`main.css?v=2`)

### Performance
- CSS wordt gecached door browser
- Supabase Storage heeft CDN
- Eerste load: ~200ms
- Cached loads: ~10ms

### Kosten
- Supabase Storage: Gratis tot 1GB
- Edge Functions: Gratis tot 500K requests/maand
- Bandwidth: Gratis tot 5GB/maand

---

## ✅ Checklist

- [ ] Assets bucket aangemaakt in Supabase Storage
- [ ] main.css geüpload naar `assets/styles/main.css`
- [ ] components.css geüpload naar `assets/styles/components.css`
- [ ] CSS URLs genoteerd
- [ ] Edge function gedeployed
- [ ] Test URL werkt met styling
- [ ] Browser cache cleared
- [ ] Pagina's zien er mooi uit! 🎉

---

## 🆘 Hulp Nodig?

**Als iets niet werkt:**
1. Check Supabase logs: `supabase functions logs pages-api`
2. Check browser console (F12)
3. Verify CSS URLs in browser
4. Check edge function code in Supabase dashboard

**Veelvoorkomende Problemen:**
- **404 op CSS**: Bucket is niet public of files niet geüpload
- **CORS errors**: Edge function mist CORS headers (al toegevoegd in code)
- **Geen styling**: CSS URLs zijn incorrect in edge function
- **Oude styling**: Browser cache, doe Ctrl+Shift+R

---

## 🎉 Klaar!

Na deze stappen zouden alle pagina's mooi gestijld moeten zijn, net als in de lokale builder!
