# 🚀 Security Setup Guide

## Stap 1: Installeer Dependencies

```bash
npm install
```

Dit installeert:
- ✅ `helmet` - Security headers
- ✅ `express-rate-limit` - Rate limiting tegen brute force

---

## Stap 2: Controleer Supabase RLS

### ⚠️ KRITIEK - Doe dit EERST!

1. **Open Supabase Dashboard**
   - Ga naar: https://app.supabase.com
   - Login met je account
   - Selecteer project: `huaaogdxxdcakxryecnw`

2. **Controleer RLS Status**
   - Ga naar **Database** → **Tables**
   - Voor ELKE tabel, check:
     - ✅ RLS is **enabled** (groene toggle rechtsboven)
     - ✅ Er zijn policies (klik op tabel → **Policies** tab)

3. **Test RLS**
   ```sql
   -- Run in SQL Editor om te testen
   SELECT * FROM brands WHERE id = 'test';
   -- Moet ALLEEN jouw data tonen, niet alle brands
   ```

### Als RLS NIET actief is:

**⚠️ URGENT: Activeer RLS nu!**

```sql
-- Voor elke tabel:
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Maak basis policies:
CREATE POLICY "Users can view own brand"
ON brands FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own pages"
ON pages FOR ALL
USING (brand_id IN (
  SELECT id FROM brands WHERE user_id = auth.uid()
));
```

---

## Stap 3: Verifieer Environment Variables

### Server-side (.env)

Check `server/.env`:

```bash
# Verifieer HTTPS
grep TC_BASE_URL server/.env
# Output moet zijn: TC_BASE_URL=https://...
# NIET http://!

# Check of credentials aanwezig zijn
grep -E "TC_USERNAME|TC_PASSWORD|TC_TOKEN" server/.env
```

### ✅ Checklist:
- [ ] `TC_BASE_URL` begint met `https://`
- [ ] `TC_USERNAME` en `TC_PASSWORD` OF `TC_TOKEN` ingevuld
- [ ] `TC_MICROSITE_ID` ingevuld
- [ ] Geen credentials in Git (check met `git status`)

---

## Stap 4: Test Security Features

### Start de server:
```bash
npm run dev
```

### Test Rate Limiting:

**Test 1: Normale API calls (max 100 per 15 min)**
```bash
# Moet werken:
curl http://localhost:5050/api/debug

# Na 100+ calls binnen 15 min:
# {"error": "Too many requests from this IP, please try again later."}
```

**Test 2: Auth endpoint (max 10 per 15 min)**
```bash
# Moet werken:
curl http://localhost:5050/api/debug/auth

# Na 10+ calls binnen 15 min:
# {"error": "Too many authentication attempts, please try again later."}
```

### Test Security Headers:

```bash
curl -I http://localhost:5050/api/debug
```

Verwachte headers:
```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 0
Strict-Transport-Security: max-age=15552000; includeSubDomains
```

### Test Logging (geen credentials):

Check console output - moet tonen:
```
[Auth] POST https://... user= *** microsite= ***
[Proxy] GET https://... params= { micrositeId: '***', ... }
```

NIET:
```
❌ [Auth] POST ... as real_username microsite real_id
```

---

## Stap 5: Productie Deployment

### Vercel/Netlify:

1. **Environment Variables instellen:**
   - Ga naar project settings
   - Voeg toe: `TC_BASE_URL`, `TC_USERNAME`, `TC_PASSWORD`, etc.
   - ✅ Gebruik **HTTPS** URLs!

2. **NODE_ENV instellen:**
   ```
   NODE_ENV=production
   ```
   Dit activeert extra security checks.

3. **Deploy en test:**
   ```bash
   # Check security headers in productie
   curl -I https://jouw-app.vercel.app/api/debug
   ```

---

## Stap 6: Monitoring Setup

### Dagelijkse Checks:

1. **Supabase Dashboard**
   - Check **Logs** voor verdachte activiteit
   - Monitor **API Usage** voor spikes

2. **Rate Limit Alerts**
   - Check server logs voor rate limit hits
   - Onderzoek IPs die vaak geblokkeerd worden

### Wekelijkse Checks:

```bash
# Check voor security updates
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 🚨 Troubleshooting

### "Too many requests" error

**Oorzaak:** Rate limit bereikt

**Oplossing:**
1. Wacht 15 minuten
2. Of verhoog limit in `server/index.js`:
   ```javascript
   max: 100, // Verhoog naar 200 indien nodig
   ```

### "HTTPS warning" in logs

**Oorzaak:** `TC_BASE_URL` gebruikt HTTP in productie

**Oplossing:**
```bash
# Update .env:
TC_BASE_URL=https://online.travelcompositor.com
# NIET http://
```

### Supabase "permission denied"

**Oorzaak:** RLS policies blokkeren toegang

**Oplossing:**
1. Check of user ingelogd is
2. Verifieer RLS policies in Supabase dashboard
3. Test met SQL Editor

---

## 📋 Security Checklist

### Voor Go-Live:

- [ ] Supabase RLS actief op alle tabellen
- [ ] RLS policies getest met verschillende users
- [ ] Alle `.env` files gebruiken HTTPS
- [ ] `server/.env` NIET in Git
- [ ] Rate limiting getest
- [ ] Security headers actief
- [ ] Logging zonder credentials
- [ ] `NODE_ENV=production` in productie
- [ ] Backup strategie opgezet
- [ ] Monitoring actief

### Na Go-Live:

- [ ] Dagelijks logs checken
- [ ] Wekelijks `npm audit` runnen
- [ ] Maandelijks API keys roteren
- [ ] Kwartaal security audit

---

## 🆘 Noodhulp

### Bij security incident:

1. **Stop de schade:**
   ```bash
   # Revoke Supabase anon key:
   # Ga naar Supabase → Settings → API → Regenerate anon key
   
   # Roteer alle API keys in .env
   ```

2. **Assess:**
   - Check Supabase logs
   - Check server logs
   - Identificeer gelekte data

3. **Recover:**
   - Restore van backup
   - Update alle keys
   - Deploy nieuwe versie

4. **Prevent:**
   - Update RLS policies
   - Verhoog rate limits
   - Add extra monitoring

---

## 📞 Support

- **Supabase:** https://supabase.com/support
- **Vercel:** https://vercel.com/support
- **Security issues:** Maak GitHub issue met label `security`
