# BOLT Custom Domain Setup
## Complete Flow: Website Builder → BOLT Admin → Custom Domain

---

## 🎯 De Complete Flow

```
Website Builder (Jij)
  ↓ Bouwt pagina's, menu's, footers
  ↓ Export naar database
  ↓
BOLT Admin Dashboard
  ↓ Beheert content
  ↓ Koppelt custom domein
  ↓ Klikt "Publiceer"
  ↓
Site Renderer Edge Function (Jouw Systeem)
  ↓ Haalt data uit database
  ↓ Rendert met inline CSS
  ↓ Voegt menu/footer toe
  ↓
Custom Domein (bijv: reizen.nl)
  ✅ Perfect gerenderde website!
```

---

## 📋 Stap 1: Deploy Site Renderer Edge Function

### Deploy Command:
```bash
supabase functions deploy site-renderer
```

### Wat Doet Deze Function?
- Haalt pagina's uit `pages` table
- Haalt menu uit `menus` table (key='main')
- Haalt footer uit `menus` table (key='footer')
- Haalt CSS van Supabase Storage
- Rendert complete HTML met inline CSS
- Voegt header en footer toe
- Past brand kleuren toe

---

## 📋 Stap 2: Database Schema

### Benodigde Tables:

#### `sites` Table:
```sql
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  custom_domain TEXT,
  favicon TEXT,
  brand_colors JSONB DEFAULT '{"primary":"#4CAF50","secondary":"#2196F3","accent":"#FF9800"}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `pages` Table:
```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  html TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(site_id, slug)
);
```

#### `menus` Table:
```sql
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES sites(id),
  key TEXT NOT NULL, -- 'main' or 'footer'
  items JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(site_id, key)
);
```

---

## 📋 Stap 3: Custom Domain Koppelen

### In BOLT Admin Dashboard:

1. **Ga naar Site Settings**
2. **Voer custom domain in:**
   ```
   reizen.nl
   ```
3. **Klik "Opslaan"**

### DNS Configuratie (Voor Klant):

**A Record:**
```
Type: A
Name: @
Value: [Supabase IP]
TTL: 3600
```

**CNAME Record (voor www):**
```
Type: CNAME
Name: www
Value: [jouw-project].supabase.co
TTL: 3600
```

### Supabase Custom Domain Setup:

1. Ga naar Supabase Dashboard → Settings → Custom Domains
2. Voeg custom domain toe: `reizen.nl`
3. Verifieer DNS
4. Wacht op SSL certificaat (automatisch via Let's Encrypt)

---

## 📋 Stap 4: URL Routing

### Edge Function URL:
```
https://[project].supabase.co/functions/v1/site-renderer
```

### Custom Domain Routing:

**Optie A: Via Supabase (Aanbevolen)**
```
https://reizen.nl/ 
→ Routes naar site-renderer function
→ Function detecteert site via domain
→ Rendert correcte pagina
```

**Optie B: Via Cloudflare Workers**
```
Custom domain → Cloudflare Worker → site-renderer function
```

---

## 📋 Stap 5: Site Detection

### Hoe Function Site Detecteert:

**Via Custom Domain:**
```typescript
// In site-renderer function
const host = req.headers.get('host'); // 'reizen.nl'

// Lookup site by custom_domain
const { data: site } = await supabase
  .from('sites')
  .select('*')
  .eq('custom_domain', host)
  .single();
```

**Via Query Parameter (Fallback):**
```
https://[project].supabase.co/functions/v1/site-renderer?site=abc123
```

---

## 📋 Stap 6: Menu & Footer Data Format

### Menu Items Format (JSONB):
```json
[
  {
    "label": "Home",
    "href": "/"
  },
  {
    "label": "Reizen",
    "href": "/reizen",
    "children": [
      {
        "label": "Rondreizen",
        "href": "/reizen/rondreizen"
      },
      {
        "label": "Stedentrips",
        "href": "/reizen/stedentrips"
      }
    ]
  },
  {
    "label": "Contact",
    "href": "/contact"
  }
]
```

### Footer Items Format (JSONB):
```json
[
  {
    "section": "Over Ons",
    "label": "Onze Missie",
    "href": "/over-ons"
  },
  {
    "section": "Over Ons",
    "label": "Team",
    "href": "/team"
  },
  {
    "section": "Contact",
    "label": "Bel Ons",
    "href": "/contact"
  },
  {
    "section": "Contact",
    "label": "Email",
    "href": "mailto:info@reizen.nl"
  }
]
```

---

## 📋 Stap 7: Export Van Website Builder

### In Website Builder:

1. **Bouw pagina's** met componenten
2. **Klik "📥 Export"**
3. **Kies "Upload Naar Database"** (nieuwe optie)
4. **Data wordt opgeslagen in:**
   - `pages` table (HTML + metadata)
   - `menus` table (menu items)
   - `sites` table (brand colors, settings)

---

## 📋 Stap 8: BOLT Admin Workflow

### Voor BOLT Admin:

1. **Content Beheren:**
   - Bewerk pagina's via editor
   - Wijzig menu items
   - Update footer links

2. **Custom Domain Koppelen:**
   - Voer domain in
   - Verifieer DNS
   - Activeer

3. **Publiceren:**
   - Klik "Publiceer"
   - Site is live op custom domain!

---

## 🧪 Testing

### Test URL's:

**Via Function URL:**
```
https://[project].supabase.co/functions/v1/site-renderer?site=abc123
```

**Via Custom Domain:**
```
https://reizen.nl/
https://reizen.nl/reizen
https://reizen.nl/contact
```

### Check List:
- ✅ Pagina laadt met volledige styling
- ✅ Menu is zichtbaar en werkend
- ✅ Footer is zichtbaar
- ✅ Brand kleuren zijn toegepast
- ✅ Links werken
- ✅ Responsive design werkt

---

## 🔧 Troubleshooting

### Pagina Laadt Niet:
1. Check of site exists in database
2. Check of custom_domain is correct
3. Check DNS configuratie
4. Check function logs: `supabase functions logs site-renderer`

### CSS Laadt Niet:
1. Check of CSS files in Supabase Storage staan
2. Check public access op assets bucket
3. Check function CSS loading code

### Menu/Footer Niet Zichtbaar:
1. Check of menus table records heeft
2. Check of items JSONB correct format heeft
3. Check function menu rendering code

---

## 📊 Performance

### Caching:
```typescript
headers: {
  'Cache-Control': 'public, max-age=300' // 5 min cache
}
```

### CDN (Optioneel):
- Gebruik Cloudflare voor extra caching
- Edge caching voor snellere load times
- DDoS protection

---

## 🎯 Resultaat

**Na deze setup:**
- ✅ Custom domain werkt (bijv: reizen.nl)
- ✅ Alle pagina's perfect gerenderd
- ✅ Menu en footer overal zichtbaar
- ✅ Brand kleuren toegepast
- ✅ BOLT admin kan content beheren
- ✅ Jij hoeft niets meer te doen!

**De flow is compleet! 🚀**
