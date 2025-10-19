# Bolt CMS - Complete Implementation Guide
## Website Builder Integratie voor Reisbureau's

**Datum:** 19 Oktober 2025  
**Voor:** Bolt Development Team  
**Van:** Website Builder Team

---

## 📋 Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Pagina Beheer Interface](#pagina-beheer-interface)
3. [Domein Koppeling](#domein-koppeling)
4. [Reizen & Bestemmingen](#reizen--bestemmingen)
5. [Publicatie Flow](#publicatie-flow)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Test Scenario's](#test-scenarios)

---

## 1. Overzicht

### Wat werkt al ✅
- Builder opslaan naar Bolt (draft)
- News management (admin + brand)
- JWT authentication
- Security & RLS

### Wat moet nog ⚠️
- **Pagina Beheer Interface** (Priority 1)
- **Domein Koppeling** (Priority 2)
- **Reizen/Bestemmingen Deeplinks** (Priority 3)
- **Publieke URL Structuur** (Priority 2)

---

## 2. Pagina Beheer Interface

### Locatie: `/brand/website/pages`

### Interface Design:

```
┌────────────────────────────────────────────────────────────────┐
│  📄 Pagina's                                    [+ Nieuwe Pagina]│
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔍 [Zoeken...]                    Filter: [Alle ▼] [Status ▼] │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Titel              │ Slug           │ Status  │ Acties   │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ 📄 Thailand Reis   │ reizen/thai... │ 🟢 Live │ [⚙️][👁️] │ │
│  │ 📄 Over Ons        │ over-ons       │ 🟡 Conc │ [⚙️][👁️] │ │
│  │ 📄 Contact         │ contact        │ 🟢 Live │ [⚙️][👁️] │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Pagina 1 van 3                                    [< 1 2 3 >] │
└────────────────────────────────────────────────────────────────┘
```

### Kolommen:

1. **Titel** - Pagina titel (bijv. "Thailand Reis")
2. **Slug** - URL slug (bijv. "reizen/thailand")
3. **Status** - 
   - 🟢 **Gepubliceerd** (published)
   - 🟡 **Concept** (draft)
   - 🔴 **Offline** (unpublished)
4. **Acties**:
   - ⚙️ **Bewerken** → opent Builder
   - 👁️ **Preview** → opent preview URL
   - 🚀 **Publiceren** (alleen bij concept)
   - 🗑️ **Verwijderen**

### Buttons:

**[+ Nieuwe Pagina]**
```javascript
onClick: () => {
  const url = `/builder/index.html?brand_id=${brandId}&api=${apiBase}&token=${jwt}&apikey=${apiKey}`;
  window.open(url, '_blank');
}
```

**[⚙️ Bewerken]**
```javascript
onClick: (pageId) => {
  const url = `/builder/index.html?brand_id=${brandId}&page_id=${pageId}&api=${apiBase}&token=${jwt}&apikey=${apiKey}`;
  window.open(url, '_blank');
}
```

**[👁️ Preview]**
```javascript
onClick: (slug) => {
  const url = `https://${brandId}.ai-travelstudio.nl/${slug}`;
  window.open(url, '_blank');
}
```

**[🚀 Publiceren]**
```javascript
onClick: async (pageId) => {
  const response = await fetch(`/pages-api/${pageId}/publish`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${jwt}` }
  });
  if (response.ok) {
    showNotification('✅ Pagina gepubliceerd!');
    refreshList();
  }
}
```

---

## 3. Domein Koppeling

### Locatie: `/brand/settings/domain`

### Interface Design:

```
┌─────────────────────────────────────────────────────────────┐
│  🌐 Domein Instellingen                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Huidige URL:                                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ https://jouwreisbureau.ai-travelstudio.nl             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Eigen Domein:                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ jouwreisbureau.nl                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Status: ⚠️ Niet geverifieerd                               │
│                                                              │
│  [Verifiëren]  [DNS Instructies]                            │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  SSL Certificaat: ✅ Actief (Let's Encrypt)                 │
│  Geldig tot: 15 januari 2026                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### DNS Instructies Modal:

```
┌─────────────────────────────────────────────────────────────┐
│  🌐 DNS Instellingen                                    [✕]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Voeg deze DNS records toe bij je domein provider:          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Type  │ Naam │ Waarde                                  │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ CNAME │ www  │ jouwreisbureau.ai-travelstudio.nl      │ │
│  │ A     │ @    │ 185.199.108.153                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [📋 Kopieer CNAME]  [📋 Kopieer A Record]                  │
│                                                              │
│  ⚠️ DNS wijzigingen kunnen 24-48 uur duren                  │
│                                                              │
│  📚 Hulp nodig? support@ai-travelstudio.nl                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema:

```sql
-- Voeg toe aan brands table
ALTER TABLE brands ADD COLUMN IF NOT EXISTS custom_domain TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS domain_verified_at TIMESTAMP;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS ssl_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS ssl_expires_at TIMESTAMP;
```

### API Endpoint: DNS Verificatie

**POST** `/api/verify-domain`

```javascript
// Request
{
  "brand_id": "abc123",
  "domain": "jouwreisbureau.nl"
}

// Response (success)
{
  "verified": true,
  "cname_ok": true,
  "a_record_ok": true,
  "message": "Domein succesvol geverifieerd!"
}

// Response (failure)
{
  "verified": false,
  "cname_ok": false,
  "a_record_ok": true,
  "message": "CNAME record niet correct. Controleer je DNS instellingen."
}
```

### Implementatie (Node.js):

```javascript
const dns = require('dns').promises;

async function verifyDomain(brandId, domain) {
  try {
    // Check CNAME: www.domain.nl → brandId.ai-travelstudio.nl
    const cname = await dns.resolveCname(`www.${domain}`);
    const expectedCname = `${brandId}.ai-travelstudio.nl`;
    const cnameOk = cname.some(c => c === expectedCname);
    
    // Check A record: domain.nl → 185.199.108.153
    const aRecords = await dns.resolve4(domain);
    const aRecordOk = aRecords.includes('185.199.108.153');
    
    if (cnameOk && aRecordOk) {
      // Update database
      await db.query(`
        UPDATE brands 
        SET custom_domain = $1, 
            domain_verified = TRUE, 
            domain_verified_at = NOW()
        WHERE id = $2
      `, [domain, brandId]);
      
      // Trigger SSL certificate generation
      await generateSSLCertificate(domain);
    }
    
    return {
      verified: cnameOk && aRecordOk,
      cname_ok: cnameOk,
      a_record_ok: aRecordOk
    };
  } catch (error) {
    return {
      verified: false,
      error: error.message
    };
  }
}
```

### SSL Certificaat (Let's Encrypt):

**Optie A: Caddy (Aanbevolen)**
```
{domain} {
  reverse_proxy localhost:3000
  tls {
    dns cloudflare {env.CLOUDFLARE_API_TOKEN}
  }
}
```

**Optie B: Nginx + Certbot**
```bash
certbot --nginx -d jouwreisbureau.nl -d www.jouwreisbureau.nl --non-interactive --agree-tos -m admin@ai-travelstudio.nl
```

---

## 4. Reizen & Bestemmingen

### Locatie: `/brand/content/reizen` en `/brand/content/bestemmingen`

### Interface (vergelijkbaar met News):

```
┌────────────────────────────────────────────────────────────────┐
│  ✈️ Reizen                                     [+ Nieuwe Reis]  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Titel              │ Bestemming  │ Status  │ Acties      │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ ✈️ Thailand Reis   │ Bangkok     │ 🟢 Live │ [⚙️][👁️]   │ │
│  │ ✈️ Bali Avontuur   │ Bali        │ 🟡 Conc │ [⚙️][👁️]   │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Deeplinks naar Builder:

**Nieuwe Reis:**
```
/builder/index.html?brand_id=abc&content_type=travel&api=...&token=...&apikey=...
```

**Bewerk Reis:**
```
/builder/index.html?brand_id=abc&content_type=travel&travel_id=123&api=...&token=...&apikey=...
```

**Nieuwe Bestemming:**
```
/builder/index.html?brand_id=abc&content_type=destination&api=...&token=...&apikey=...
```

### Database Schema:

```sql
-- Travel table
CREATE TABLE IF NOT EXISTS travel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content_json JSONB,
  body_html TEXT,
  status TEXT DEFAULT 'draft', -- draft, published
  destinations TEXT[], -- Array van bestemming namen
  duration_days INTEGER,
  price_from DECIMAL,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(brand_id, slug)
);

-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content_json JSONB,
  body_html TEXT,
  status TEXT DEFAULT 'draft',
  country TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(brand_id, slug)
);
```

---

## 5. Publicatie Flow

### Complete Flow:

```
┌─────────────┐
│   Builder   │
│  (Content)  │
└──────┬──────┘
       │ Klik "Opslaan"
       ↓
┌─────────────┐
│  POST /api  │
│ /save-draft │
└──────┬──────┘
       │ Status: draft
       ↓
┌─────────────┐
│    Bolt     │
│ (Pagina's)  │
└──────┬──────┘
       │ Klik "Publiceren"
       ↓
┌─────────────┐
│  POST /api  │
│  /{id}/     │
│  publish    │
└──────┬──────┘
       │ Status: published
       ↓
┌─────────────┐
│  Publieke   │
│   Website   │
│ domain.nl/  │
│   {slug}    │
└─────────────┘
```

### Status Overgangen:

```
draft → published → unpublished
  ↑         ↓            ↓
  └─────────┴────────────┘
```

---

## 6. API Endpoints

### Overzicht:

| Endpoint | Method | Beschrijving | Status |
|----------|--------|--------------|--------|
| `/pages-api/save` | POST | Opslaan als concept | ✅ Live |
| `/pages-api/{id}/publish` | POST | Publiceren | ✅ Live |
| `/pages-api` | GET | Ophalen pagina | ✅ Live |
| `/pages-api/list` | GET | Lijst van pagina's | ⚠️ Nodig |
| `/content-api` | GET | Publieke content | ❌ TODO |
| `/api/verify-domain` | POST | DNS verificatie | ❌ TODO |

### Nieuw: `/pages-api/list`

**GET** `/pages-api/list?brand_id={id}`

```javascript
// Response
{
  "pages": [
    {
      "id": "abc123",
      "title": "Thailand Reis",
      "slug": "reizen/thailand",
      "status": "published",
      "content_type": "page",
      "published_at": "2025-10-15T10:00:00Z",
      "updated_at": "2025-10-18T14:30:00Z"
    },
    {
      "id": "def456",
      "title": "Over Ons",
      "slug": "over-ons",
      "status": "draft",
      "content_type": "page",
      "updated_at": "2025-10-19T09:15:00Z"
    }
  ],
  "total": 2
}
```

### Nieuw: `/content-api` (Publieke Content)

**GET** `/content-api?domain={domain}&slug={slug}`

```javascript
// Request
GET /content-api?domain=jouwreisbureau.nl&slug=reizen/thailand

// Response
{
  "title": "Thailand Reis",
  "slug": "reizen/thailand",
  "body_html": "<div class='wb-travel-hero'>...</div>",
  "meta": {
    "description": "Ontdek Thailand...",
    "image": "https://..."
  },
  "published_at": "2025-10-15T10:00:00Z"
}
```

**Implementatie:**
```javascript
app.get('/content-api', async (req, res) => {
  const { domain, slug } = req.query;
  
  // 1. Find brand by custom_domain
  const brand = await db.query(
    'SELECT id FROM brands WHERE custom_domain = $1 OR id = $2',
    [domain, domain.split('.')[0]] // Support subdomain too
  );
  
  if (!brand) {
    return res.status(404).json({ error: 'Brand not found' });
  }
  
  // 2. Find published page
  const page = await db.query(`
    SELECT title, slug, body_html, published_at 
    FROM pages 
    WHERE brand_id = $1 AND slug = $2 AND status = 'published'
  `, [brand.id, slug]);
  
  if (!page) {
    return res.status(404).json({ error: 'Page not found' });
  }
  
  res.json(page);
});
```

---

## 7. Database Schema

### Complete Schema Updates:

```sql
-- Brands table updates
ALTER TABLE brands ADD COLUMN IF NOT EXISTS custom_domain TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS domain_verified_at TIMESTAMP;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS ssl_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS ssl_expires_at TIMESTAMP;

-- Pages table (should already exist)
-- Ensure these columns exist:
ALTER TABLE pages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'page';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pages_brand_slug ON pages(brand_id, slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_brands_custom_domain ON brands(custom_domain);

-- Travel table (new)
CREATE TABLE IF NOT EXISTS travel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content_json JSONB,
  body_html TEXT,
  status TEXT DEFAULT 'draft',
  destinations TEXT[],
  duration_days INTEGER,
  price_from DECIMAL,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(brand_id, slug)
);

-- Destinations table (new)
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content_json JSONB,
  body_html TEXT,
  status TEXT DEFAULT 'draft',
  country TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(brand_id, slug)
);
```

---

## 8. Test Scenario's

### Test 1: Pagina Maken & Publiceren

1. **In Bolt:** Klik "Nieuwe Pagina"
2. **Builder opent:** Maak pagina met content
3. **Klik "Opslaan":** Status = draft in Bolt
4. **In Bolt:** Zie pagina in lijst met status "Concept"
5. **Klik "Publiceren":** Status = published
6. **Check URL:** `https://brand.ai-travelstudio.nl/pagina-slug`
7. **✅ Success:** Pagina is live

### Test 2: Domein Koppelen

1. **Registreer domein:** `testreisbureau.nl` bij TransIP
2. **DNS setup:**
   - CNAME: `www` → `test123.ai-travelstudio.nl`
   - A: `@` → `185.199.108.153`
3. **In Bolt:** Ga naar Domein Instellingen
4. **Voer domein in:** `testreisbureau.nl`
5. **Klik "Verifiëren":** Wacht op verificatie
6. **✅ Success:** Status = Geverifieerd
7. **SSL:** Automatisch binnen 5 minuten
8. **Check:** `https://testreisbureau.nl` werkt

### Test 3: Reis Maken

1. **In Bolt:** Ga naar Reizen
2. **Klik "Nieuwe Reis":** Builder opent met travel mode
3. **Importeer TC ID:** Reis data wordt geladen
4. **Bewerk & Opslaan:** Status = draft
5. **Publiceren:** Status = published
6. **Check URL:** `https://brand.nl/reizen/thailand`
7. **✅ Success:** Reis is live

---

## 9. Prioriteiten & Timeline

### Week 1 (Priority 1):
- [ ] Pagina Beheer Interface
- [ ] `/pages-api/list` endpoint
- [ ] Publiceer button functionaliteit

### Week 2 (Priority 2):
- [ ] Domein Instellingen pagina
- [ ] DNS verificatie API
- [ ] `/content-api` endpoint
- [ ] SSL setup (Caddy/Certbot)

### Week 3 (Priority 3):
- [ ] Reizen beheer interface
- [ ] Bestemmingen beheer interface
- [ ] Travel/Destinations deeplinks
- [ ] Database schema voor travel

### Week 4 (Testing):
- [ ] End-to-end testing
- [ ] Documentatie voor gebruikers
- [ ] Performance testing
- [ ] Security audit

---

## 10. Hulp & Contact

**Vragen over implementatie?**
- Email: support@ai-travelstudio.nl
- Builder Team: [Slack channel]

**Documentatie:**
- Builder API: `/docs/builder-api.md`
- Authentication: `/docs/jwt-auth.md`

---

**Succes met de implementatie!** 🚀
