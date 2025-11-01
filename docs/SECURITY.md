# 🔐 Security Checklist & Best Practices

## ✅ Supabase Row Level Security (RLS)

### 💡 Belangrijke Info: Anon Key is VEILIG

**De Supabase ANON key in `config/bolt.js` is BEDOELD om publiek te zijn!**

- ✅ Anon keys zijn **ontworpen** voor client-side gebruik
- ✅ Hebben **beperkte privileges** - alleen wat RLS policies toestaan
- ✅ **Veilig om te committen** - zelfs in public repositories
- 🔐 Beveiliging zit in **RLS policies**, niet in de key zelf

**Wat WEL geheim moet blijven:**
- ❌ `SERVICE_ROLE_KEY` - Heeft volledige database toegang, bypassed RLS
- ❌ Private API keys (OpenAI, Shotstack, etc.)
- ❌ Wachtwoorden en OAuth secrets

### Kritieke Controle
Hoewel de anon key veilig is, **MOET** Row Level Security (RLS) actief zijn om te bepalen wat de key kan doen!

### Hoe te controleren:
1. Open je Supabase dashboard: https://app.supabase.com
2. Ga naar je project: `huaaogdxxdcakxryecnw`
3. Navigeer naar **Authentication** → **Policies**
4. Controleer voor ELKE tabel:
   - ✅ RLS is **enabled** (groene toggle)
   - ✅ Er zijn policies voor SELECT, INSERT, UPDATE, DELETE

### Voorbeeld RLS Policies

```sql
-- Brands tabel: alleen eigen brand data
CREATE POLICY "Users can view own brand"
ON brands FOR SELECT
USING (auth.uid() = user_id OR is_public = true);

-- Pages tabel: alleen eigen pages
CREATE POLICY "Users can manage own pages"
ON pages FOR ALL
USING (brand_id IN (
  SELECT id FROM brands WHERE user_id = auth.uid()
));

-- Trips tabel: alleen eigen trips
CREATE POLICY "Users can view own trips"
ON trips FOR SELECT
USING (brand_id IN (
  SELECT id FROM brands WHERE user_id = auth.uid()
));
```

### Als RLS NIET actief is:
⚠️ **URGENT**: Zonder RLS policies kan iedereen (met of zonder de anon key) je database benaderen!

**Oplossing:**
1. Activeer RLS op alle tabellen (dit is de ECHTE beveiliging)
2. Maak policies voor elke tabel
3. Test met verschillende users
4. Overweeg server-side proxy voor extra gevoelige operaties

**Let op:** Het probleem is NIET de publieke anon key, maar het ontbreken van RLS policies!

---

## 🔒 Environment Variables

### Server-side (.env)
✅ Correct geïmplementeerd in `server/.env`

**Checklist:**
- [x] `server/.env` staat in `.gitignore`
- [x] Wachtwoorden via `process.env`
- [x] `.env.example` zonder echte credentials
- [ ] Productie secrets in Vercel/hosting platform

### Frontend (config.local.js)
✅ Correct geïmplementeerd

**Checklist:**
- [x] `js/config.local.js` in `.gitignore`
- [x] `config.local.example.js` als template
- [ ] Productie keys via build-time injection

---

## 🚦 Rate Limiting

### Status: ⚠️ NIET geïmplementeerd

**Risico:** Brute force attacks op auth endpoints

**Oplossing:** Zie `server/index.js` - rate limiting toegevoegd

---

## 🔐 HTTPS Verificatie

### Checklist:
- [ ] `TC_BASE_URL` gebruikt HTTPS (check `.env`)
- [ ] Productie deployment forceert HTTPS
- [ ] Geen mixed content warnings in browser

**Verifieer:**
```bash
# Check je .env file
grep TC_BASE_URL server/.env
# Moet beginnen met https://
```

---

## 📝 Logging Best Practices

### ⚠️ Huidige issues:
- Usernames worden gelogd in auth calls
- API endpoints loggen mogelijk gevoelige data

### ✅ Opgelost in nieuwe versie:
- Credentials gemaskeerd in logs
- Productie logs zonder debug info
- Geen tokens in console output

---

## 🛡️ Security Headers

### Status: ⚠️ NIET geïmplementeerd

**Oplossing:** Helmet.js toegevoegd aan server

**Headers:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy`

---

## 🔄 Key Rotation Strategy

### Aanbeveling:
1. **Maandelijks:** Roteer API keys voor externe services
2. **Per kwartaal:** Roteer database credentials
3. **Bij incident:** Onmiddellijk alle keys vervangen

### Procedure:
1. Genereer nieuwe keys in service dashboard
2. Update `.env` files (lokaal + productie)
3. Restart servers
4. Revoke oude keys
5. Test alle functionaliteit

---

## 📋 Security Audit Checklist

### Dagelijks
- [ ] Check Supabase logs voor verdachte activiteit
- [ ] Monitor rate limiting alerts

### Wekelijks
- [ ] Review access logs
- [ ] Check voor failed auth attempts
- [ ] Update dependencies (`npm audit`)

### Maandelijks
- [ ] Roteer API keys
- [ ] Review RLS policies
- [ ] Test backup & recovery

### Per kwartaal
- [ ] Volledige security audit
- [ ] Penetration testing
- [ ] Review alle permissions

---

## 🚨 Incident Response

### Bij verdachte activiteit:
1. **Stop:** Revoke compromised keys onmiddellijk
2. **Assess:** Check logs voor schade
3. **Contain:** Blokkeer verdachte IPs
4. **Recover:** Restore van backup indien nodig
5. **Learn:** Update security policies

### Contact:
- Supabase Support: https://supabase.com/support
- Vercel Security: security@vercel.com

---

## 📚 Resources

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
