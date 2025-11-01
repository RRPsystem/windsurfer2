# 🔐 Security Quick Start

## ⚡ 3 Minuten Setup

### 1. Installeer packages
```bash
npm install
```

### 2. Check Supabase RLS ⚠️ KRITIEK
1. Open: https://app.supabase.com/project/huaaogdxxdcakxryecnw/database/tables
2. Voor elke tabel: Check dat RLS **enabled** is (groene toggle)
3. Als RLS UIT staat → **ACTIVEER NU!**

### 3. Verifieer HTTPS
```bash
grep TC_BASE_URL server/.env
# Moet zijn: https:// (NIET http://)
```

### 4. Start server
```bash
npm run dev
```

---

## ✅ Wat is nu beveiligd?

### ✅ Rate Limiting
- **API calls:** Max 100 per 15 minuten per IP
- **Auth calls:** Max 10 per 15 minuten per IP
- Beschermt tegen brute force attacks

### ✅ Security Headers (Helmet)
- `X-Frame-Options: SAMEORIGIN` - Voorkomt clickjacking
- `X-Content-Type-Options: nosniff` - Voorkomt MIME sniffing
- `Strict-Transport-Security` - Forceert HTTPS

### ✅ Sanitized Logging
- Geen wachtwoorden in logs
- Usernames gemaskeerd: `user= ***`
- Microsite IDs gemaskeerd: `microsite= ***`

### ✅ HTTPS Verificatie
- Waarschuwing als HTTP gebruikt wordt in productie
- Check bij server start

---

## ✅ Supabase Anon Key - Dit is VEILIG!

### 💡 Belangrijke Info over Anon Keys

**De Supabase ANON key is BEDOELD om publiek te zijn!**

**Locatie:** `config/bolt.js` regel 6

**Status:** ✅ Publiek (en dat is OK!)

**Waarom dit veilig is:**
- 🔓 Anon key is **ontworpen** voor client-side gebruik
- 🛡️ Heeft **geen gevaarlijke privileges** - kan alleen wat RLS toestaat
- ✅ **Veilig om te committen** - zelfs in public repos
- 🔐 Beveiliging zit in **RLS policies**, niet in de key

**Wat WEL geheim moet blijven:**
- ❌ `SERVICE_ROLE_KEY` - Bypassed RLS, volledige toegang
- ❌ OpenAI API keys
- ❌ Wachtwoorden en OAuth secrets

**Wat publiek mag:**
- ✅ `SUPABASE_ANON_KEY` - Veilig
- ✅ `SUPABASE_URL` - Moet publiek zijn

**Beveiliging zit in:**
1. RLS policies op database tabellen
2. Authentication checks
3. Role-based access control

---

## 🚨 Emergency Checklist

Als je denkt dat keys gelekt zijn:

### Onmiddellijk:
1. ~~**Supabase:** Regenerate anon key~~ (NIET nodig - anon key is veilig!)
2. **Travel Compositor:** Wijzig wachtwoord als gelekt
3. **API Keys:** Roteer alleen PRIVATE keys in `.env` (OpenAI, etc.)

### Binnen 24 uur:
4. Check Supabase logs voor verdachte activiteit
5. Review alle RLS policies
6. Deploy nieuwe versie met nieuwe keys

---

## 📊 Security Score

**Huidige status: 8/10**

| Feature | Status | Priority |
|---------|--------|----------|
| Environment variables | ✅ | - |
| Rate limiting | ✅ | - |
| Security headers | ✅ | - |
| HTTPS verification | ✅ | - |
| Sanitized logging | ✅ | - |
| Supabase anon key | ✅ Veilig (publiek OK) | - |
| Supabase RLS | ⚠️ Check policies! | 🔴 HIGH |
| OAuth 2.0 | ❌ | 🟡 MEDIUM |
| Private key rotation | ❌ | 🟡 MEDIUM |

---

## 📚 Meer Info

- **Volledige guide:** `docs/SECURITY_SETUP.md`
- **Best practices:** `docs/SECURITY.md`
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security

---

## ✨ Volgende Stappen

1. ✅ Verifieer Supabase RLS (5 min)
2. ✅ Test rate limiting (2 min)
3. ✅ Check HTTPS in productie (1 min)
4. 📅 Plan maandelijkse key rotation
5. 📅 Setup monitoring alerts

**Totale tijd:** ~10 minuten voor basis beveiliging
