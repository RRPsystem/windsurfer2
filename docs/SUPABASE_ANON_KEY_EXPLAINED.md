# 🔐 Supabase Anon Key - Waarom het VEILIG is

## 💡 TL;DR

**De Supabase ANON key is BEDOELD om publiek te zijn en het is VEILIG om deze in je code te hebben!**

---

## 🤔 Waarom is dit veilig?

### 1. **Ontworpen voor Client-Side Gebruik**

De anon key is specifiek gemaakt om in browsers, mobile apps en andere client-side code te gebruiken.

### 2. **Beperkte Privileges**

De anon key heeft GEEN gevaarlijke privileges:
- ❌ Kan NIET alle data lezen
- ❌ Kan NIET alle data schrijven
- ❌ Kan NIET RLS bypassen
- ✅ Kan ALLEEN wat RLS policies toestaan

### 3. **Beveiliging zit in RLS**

De echte beveiliging komt van Row Level Security policies:

```sql
-- Voorbeeld: Alleen eigen data zien
CREATE POLICY "Users can view own data"
ON brands FOR SELECT
USING (auth.uid() = user_id);
```

Met deze policy kan de anon key ALLEEN data ophalen die bij de ingelogde user hoort.

---

## 🔑 Welke Keys zijn WEL Geheim?

### ❌ SERVICE_ROLE_KEY

**DIT is gevaarlijk om te exposen!**

```javascript
// NOOIT in frontend code:
const supabase = createClient(url, SERVICE_ROLE_KEY); // ❌ GEVAARLIJK!
```

**Waarom?**
- Bypassed alle RLS policies
- Volledige database toegang
- Kan alles lezen en schrijven

**Gebruik alleen:**
- In backend/server code
- In Edge Functions
- In CI/CD pipelines

### ❌ Private API Keys

Deze moeten ook geheim blijven:
- OpenAI API keys
- Shotstack API keys
- OAuth client secrets
- Wachtwoorden

---

## ✅ Welke Keys zijn Publiek OK?

### ✅ SUPABASE_ANON_KEY

```javascript
// VEILIG om publiek te zijn:
window.BOLT_DB = {
  url: 'https://xxx.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // ✅ OK!
};
```

### ✅ SUPABASE_URL

```javascript
// Ook veilig:
const url = 'https://xxx.supabase.co'; // ✅ OK!
```

### ✅ Andere Publieke Keys

- Mapbox public token
- Google Maps API key (met domain restrictions)
- Stripe publishable key

---

## 🛡️ Hoe werkt de beveiliging dan?

### Zonder RLS (ONVEILIG):

```sql
-- Geen RLS policies
SELECT * FROM brands; 
-- ❌ Iedereen ziet ALLE brands!
```

### Met RLS (VEILIG):

```sql
-- RLS policy actief
CREATE POLICY "own_brand_only" ON brands
FOR SELECT USING (auth.uid() = user_id);

-- Nu:
SELECT * FROM brands;
-- ✅ User ziet alleen EIGEN brand!
```

**De anon key maakt GEEN verschil** - RLS bepaalt wat er toegankelijk is!

---

## 📋 Checklist: Is mijn Supabase veilig?

### ✅ Anon Key Veiligheid

- [x] Anon key in frontend code → **OK!**
- [x] Anon key in Git repository → **OK!**
- [x] Anon key in public repo → **OK!**
- [x] Anon key in browser console → **OK!**

### ⚠️ RLS Veiligheid (KRITIEK!)

- [ ] RLS enabled op ALLE tabellen
- [ ] Policies voor SELECT queries
- [ ] Policies voor INSERT queries
- [ ] Policies voor UPDATE queries
- [ ] Policies voor DELETE queries
- [ ] Getest met verschillende users

### ❌ Service Role Key (GEHEIM!)

- [ ] Service role key NIET in frontend
- [ ] Service role key NIET in Git
- [ ] Service role key alleen in backend
- [ ] Service role key in environment variables

---

## 🧪 Test je RLS

### Test 1: Zonder Authenticatie

```javascript
// In browser console:
const { data, error } = await supabase
  .from('brands')
  .select('*');

console.log(data);
// Verwacht: [] (lege array) of error
// Als je data ziet: RLS NIET actief! ⚠️
```

### Test 2: Met Authenticatie

```javascript
// Login eerst:
await supabase.auth.signIn({ email, password });

// Dan query:
const { data } = await supabase
  .from('brands')
  .select('*');

console.log(data);
// Verwacht: Alleen JOUW brands
```

### Test 3: Andere User's Data

```javascript
// Probeer data van andere user op te halen:
const { data } = await supabase
  .from('brands')
  .select('*')
  .eq('user_id', 'andere-user-id');

console.log(data);
// Verwacht: [] (lege array)
// Als je data ziet: RLS policy FOUT! ⚠️
```

---

## 🚨 Veelgemaakte Fouten

### ❌ Fout 1: Anon Key Verbergen

```javascript
// NIET nodig:
const ANON_KEY = process.env.SUPABASE_ANON_KEY; // ❌ Onnodig

// Gewoon doen:
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // ✅ OK!
```

### ❌ Fout 2: RLS Vergeten

```sql
-- Tabel aangemaakt maar RLS vergeten:
CREATE TABLE brands (...);
-- ❌ RLS is standaard UIT!

-- Altijd doen:
ALTER TABLE brands ENABLE ROW LEVEL SECURITY; -- ✅
CREATE POLICY "policy_name" ON brands ...;    -- ✅
```

### ❌ Fout 3: Service Role in Frontend

```javascript
// NOOIT doen:
const supabase = createClient(url, SERVICE_ROLE_KEY); // ❌ GEVAARLIJK!

// Altijd doen:
const supabase = createClient(url, ANON_KEY); // ✅ VEILIG
```

---

## 📚 Meer Informatie

### Officiële Documentatie

- [Supabase Auth Keys](https://supabase.com/docs/guides/api/api-keys)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Security Best Practices](https://supabase.com/docs/guides/platform/security)

### Supabase Blog Posts

- "Understanding Supabase API Keys"
- "Row Level Security Deep Dive"
- "Common Security Mistakes"

---

## 🎓 Samenvatting

| Key Type | Publiek OK? | Gebruik | Beveiliging |
|----------|-------------|---------|-------------|
| **Anon Key** | ✅ JA | Frontend, Mobile | RLS policies |
| **Service Role** | ❌ NEE | Backend only | Environment vars |
| **URL** | ✅ JA | Overal | Publiek endpoint |

**Onthoud:**
1. 🔓 Anon key = VEILIG om publiek te zijn
2. 🛡️ Beveiliging = RLS policies, niet de key
3. 🔒 Service role = GEHEIM houden
4. ✅ Test je RLS policies regelmatig

---

## ❓ FAQ

**Q: Kan iemand mijn database hacken met de anon key?**  
A: Nee, de anon key heeft alleen toegang tot wat RLS policies toestaan.

**Q: Moet ik de anon key in .gitignore zetten?**  
A: Nee, dat is niet nodig. Het is veilig om te committen.

**Q: Wat als iemand mijn anon key steelt?**  
A: Geen probleem! Ze kunnen alleen doen wat jouw RLS policies toestaan.

**Q: Moet ik de anon key regelmatig vervangen?**  
A: Niet nodig, tenzij je de service role key lekt (dan alles vervangen).

**Q: Hoe weet ik of mijn RLS goed is ingesteld?**  
A: Test met verschillende users en probeer data van anderen op te halen.

---

## 🆘 Hulp Nodig?

- **Supabase Discord:** https://discord.supabase.com
- **Supabase Support:** https://supabase.com/support
- **GitHub Issues:** Voor project-specifieke vragen
