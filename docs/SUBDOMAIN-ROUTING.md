# Subdomain Routing voor Multi-Brand Websites

## Hoe het werkt

Elke brand krijgt een eigen subdomain of custom domain:
- `brand1.ai-travelstudio.nl`
- `brand2.ai-travelstudio.nl`
- `mycustomdomain.com`

Alle menu links zijn **relatief** (`/home`, `/about`, etc.) zodat ze werken op elk domein.

---

## URL Structuur

### Voorbeeld: Brand met subdomain `testbrand.ai-travelstudio.nl`

**Homepage:**
```
https://testbrand.ai-travelstudio.nl/home
```

**About pagina:**
```
https://testbrand.ai-travelstudio.nl/about
```

**Contact pagina:**
```
https://testbrand.ai-travelstudio.nl/contact
```

---

## Achter de schermen

### 1. Vercel Rewrite
`vercel.json` herschrijft `/{slug}` naar `/api/page/{slug}`:

```json
{
  "source": "/:slug((?!api|widgets|templates|js|styles|public)[^/.]+)",
  "destination": "/api/page/:slug"
}
```

### 2. API detecteert brand via subdomain
`/api/page/[slug].js` haalt brand slug uit het subdomain:

```javascript
const host = req.headers.host; // "testbrand.ai-travelstudio.nl"
const brandSlug = host.split('.')[0]; // "testbrand"
```

### 3. Database lookup
API zoekt eerst de brand, dan de pagina:

```sql
-- Stap 1: Vind brand
SELECT id FROM brands WHERE slug = 'testbrand';

-- Stap 2: Vind pagina voor deze brand
SELECT * FROM pages 
WHERE brand_id = 'brand-uuid' 
  AND slug = 'home';
```

### 4. Menu generatie
Menu items krijgen relatieve URLs:

```html
<li><a href="/home">Home</a></li>
<li><a href="/about">Over ons</a></li>
<li><a href="/contact">Contact</a></li>
```

---

## Custom Domains

Als een brand een eigen domain aansluit (`mybrand.com`), werkt hetzelfde systeem:

1. DNS: `mybrand.com` → CNAME naar Vercel
2. Vercel: Detecteert host `mybrand.com`
3. Database: Lookup brand op basis van custom domain
4. Pages: Serveren met relatieve menu URLs

**Vereiste:** `brands` tabel moet een `custom_domain` kolom hebben.

---

## Fallback voor backward compatibility

Als brand niet gevonden wordt via subdomain, probeert de API de pagina op te halen zonder brand filter:

```javascript
if (!brand) {
  // Fallback: get page by slug only
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single();
}
```

Dit zorgt ervoor dat oude URLs blijven werken tijdens de migratie.

---

## Testing

### Test subdomain routing:
1. Maak brand aan met slug `testbrand`
2. Maak pagina aan met slug `home` voor deze brand
3. Bezoek: `http://testbrand.localhost:3000/home` (development)
4. Of: `https://testbrand.ai-travelstudio.nl/home` (productie)

### Test custom domain:
1. Voeg custom domain toe in Vercel dashboard
2. Stel CNAME in: `www.mybrand.com` → `cname.vercel-dns.com`
3. Update `brands.custom_domain = 'www.mybrand.com'`
4. Bezoek: `https://www.mybrand.com/home`

---

## Voordelen

✅ **Schaalbaar** - Onbeperkt aantal brands/domains  
✅ **Flexibel** - Subdomains OF custom domains  
✅ **SEO-vriendelijk** - Elk brand eigen domain  
✅ **Simpel** - Relatieve URLs, geen hardcoded domains  
✅ **Maintenance** - Eén codebase voor alle brands  

---

## Files

- `/api/page/[slug].js` - Main page API (subdomain-aware)
- `/vercel.json` - Rewrite rules
- `/docs/SUBDOMAIN-ROUTING.md` - Deze documentatie
