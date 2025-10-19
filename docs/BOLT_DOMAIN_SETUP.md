# Bolt CMS - Domain Setup Implementation

## ⚠️ BELANGRIJK: Dit hoort in BOLT, niet in Builder!

**Builder** = Content maken (pagina's, reizen, nieuws)  
**Bolt** = Website beheer (domein, instellingen, publiceren)

Deze functionaliteit moet volledig in Bolt CMS geïmplementeerd worden.

---

## 1. Database Schema

### Voeg toe aan `brands` table:

```sql
ALTER TABLE brands ADD COLUMN IF NOT EXISTS custom_domain TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS domain_verified_at TIMESTAMP;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS ssl_enabled BOOLEAN DEFAULT FALSE;
```

---

## 2. Bolt Interface: Domein Instellingen

### Locatie: `/brand/settings/domain`

```
┌─────────────────────────────────────────┐
│  🌐 Domein Instellingen                 │
├─────────────────────────────────────────┤
│                                         │
│  Huidige URL:                           │
│  ┌─────────────────────────────────┐   │
│  │ jouwreisbureau.ai-travelstudio.nl│   │
│  └─────────────────────────────────┘   │
│                                         │
│  Eigen Domein:                          │
│  ┌─────────────────────────────────┐   │
│  │ jouwreisbureau.nl               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Status: ⚠️ Niet geverifieerd          │
│                                         │
│  [Verifiëren]  [DNS Instructies]       │
│                                         │
└─────────────────────────────────────────┘
```

### Functionaliteit:

**Input field:**
- Domein naam (bijv. `jouwreisbureau.nl`)
- Validatie: moet geldig domein zijn

**Verifiëren button:**
- Check DNS records via API
- Update `domain_verified` = true
- Toon success/error message

**DNS Instructies button:**
- Toon dezelfde guide als in Builder
- Met copy buttons voor CNAME/A records

---

## 3. DNS Verificatie API

### Endpoint: `POST /api/verify-domain`

```javascript
// Input
{
  "brand_id": "abc123",
  "domain": "jouwreisbureau.nl"
}

// Process
1. Check CNAME record: www.jouwreisbureau.nl → abc123.ai-travelstudio.nl
2. Check A record: jouwreisbureau.nl → 185.199.108.153
3. If both correct → set domain_verified = true

// Output
{
  "verified": true,
  "cname_ok": true,
  "a_record_ok": true,
  "message": "Domein succesvol geverifieerd!"
}
```

### Implementatie (Node.js voorbeeld):

```javascript
const dns = require('dns').promises;

async function verifyDomain(brandId, domain) {
  try {
    // Check CNAME
    const cname = await dns.resolveCname(`www.${domain}`);
    const expectedCname = `${brandId}.ai-travelstudio.nl`;
    const cnameOk = cname.includes(expectedCname);
    
    // Check A record
    const aRecords = await dns.resolve4(domain);
    const aRecordOk = aRecords.includes('185.199.108.153');
    
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

---

## 4. SSL Certificaat (Let's Encrypt)

### Automatisch via Caddy/Nginx:

**Caddy config:**
```
{domain} {
  reverse_proxy localhost:3000
  tls {
    dns cloudflare {env.CLOUDFLARE_API_TOKEN}
  }
}
```

**Of Nginx + Certbot:**
```bash
certbot --nginx -d jouwreisbureau.nl -d www.jouwreisbureau.nl
```

### Database update na SSL:
```sql
UPDATE brands 
SET ssl_enabled = TRUE 
WHERE custom_domain = 'jouwreisbureau.nl';
```

---

## 5. Content Delivery

### Endpoint: `GET /content-api`

```javascript
// Query params
?domain=jouwreisbureau.nl&slug=reizen/thailand

// Process
1. Lookup brand by custom_domain
2. Find page by slug + brand_id
3. Return published HTML

// Response
{
  "title": "Thailand Reis",
  "slug": "reizen/thailand",
  "body_html": "<div>...</div>",
  "published_at": "2025-10-19T10:00:00Z"
}
```

### Routing:
```
jouwreisbureau.nl/reizen/thailand
  ↓
GET /content-api?domain=jouwreisbureau.nl&slug=reizen/thailand
  ↓
Return page HTML
```

---

## 6. Checklist voor Bolt Team

- [ ] Database schema update (custom_domain, domain_verified)
- [ ] Domein Instellingen pagina in Bolt
- [ ] DNS verificatie API endpoint
- [ ] SSL certificaat setup (Caddy/Certbot)
- [ ] Content delivery API (`/content-api`)
- [ ] URL routing voor custom domains
- [ ] Test met dummy domain

---

## 7. Test Scenario

1. **Reisbureau registreert domein:**
   - Koopt `testreisbureau.nl` bij TransIP

2. **DNS setup:**
   - CNAME: `www` → `test123.ai-travelstudio.nl`
   - A: `@` → `185.199.108.153`

3. **Bolt verificatie:**
   - Reisbureau vult domein in
   - Klikt "Verifiëren"
   - Status: ✅ Geverifieerd

4. **SSL activatie:**
   - Automatisch Let's Encrypt certificaat
   - HTTPS werkt binnen 5 minuten

5. **Website live:**
   - `https://testreisbureau.nl` → toont homepage
   - `https://testreisbureau.nl/reizen/thailand` → toont reis pagina

---

## Vragen?

Contact: support@ai-travelstudio.nl
