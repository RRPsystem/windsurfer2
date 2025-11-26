# 🏗️ Website Builder Architecture

## ⚠️ KRITIEK: Lees dit EERST voordat je iets gaat fixen!

---

## 📦 Twee Vercel Projecten

### 1. **BOLT Project** (`bolt-versiedev`)
- **Gebruikt:** Supabase Edge Functions (`/supabase/functions/`)
- **Domains:** Alle brand subdomains via wildcard `*.ai-travelstudio.nl`
- **Code location:** `/supabase/functions/website-viewer/index.ts`
- **Deploy:** Via Supabase CLI (`supabase functions deploy`)
- **Wie fixed:** **BOLT** (niet Cascade!)

### 2. **Builder Project** (`builder`)
- **Gebruikt:** Vercel API Routes (`/api/`)
- **Domains:** `ai-websitestudio.nl`, `www.ai-websitestudio.nl`
- **Code location:** `/api/page/[slug].js`, `/api/pages/[brandSlug]/[pageSlug].js`
- **Deploy:** Automatisch via GitHub push
- **Wie fixed:** **Cascade**

---

## 🚨 Cruciale Regel:

### Als je een website-rendering probleem moet fixen:

**1. Check EERST:** Welk domein heeft het probleem?

- `*.ai-travelstudio.nl` (subdomains) → **BOLT project** → **BOLT moet fixen**
- `ai-websitestudio.nl` → **Builder project** → **Cascade moet fixen**

**2. Check de code:**

- **Supabase Edge Functions** (`/supabase/functions/`) → **BOLT**
- **Vercel API Routes** (`/api/`) → **Cascade**

---

## 📝 Verantwoordelijkheden

### BOLT Fixed:
- ✅ `/supabase/functions/website-viewer/index.ts` (Supabase Edge Function)
- ✅ Alle brand subdomain issues (`*.ai-travelstudio.nl`)
- ✅ HTML rendering voor websites
- ✅ Template asset loading voor websites
- ✅ Menu injection voor websites

### Cascade Fixed:
- ✅ `/api/page/[slug].js` (Vercel API)
- ✅ `/api/pages/[brandSlug]/[pageSlug].js` (Vercel API)
- ✅ Builder tool issues
- ✅ Admin panel
- ✅ Database schema changes
- ✅ Widgets (`/widgets/`)
- ✅ Documentation

---

## 🔄 Deployment Flows

### BOLT Project (Supabase Edge Functions)
```bash
# BOLT gebruikt Supabase CLI
cd supabase/functions/website-viewer
supabase functions deploy website-viewer

# Of via BOLT interface
```

### Builder Project (Vercel API)
```bash
# Cascade pushed naar GitHub
git add .
git commit -m "Fix"
git push

# Vercel deployt automatisch
```

---

## 🎯 Quick Reference

| Probleem | Check | Wie | Code |
|----------|-------|-----|------|
| Subdomain laadt niet | `golfvakantie-planner.ai-travelstudio.nl` | **BOLT** | `/supabase/functions/website-viewer/index.ts` |
| Styling ontbreekt op subdomain | `*.ai-travelstudio.nl` | **BOLT** | `/supabase/functions/website-viewer/index.ts` |
| Builder tool werkt niet | `ai-websitestudio.nl/builder.html` | **Cascade** | `/public/builder.html`, `/js/` |
| API endpoints | `ai-websitestudio.nl/api/*` | **Cascade** | `/api/` |
| Widgets | Any domain `/widgets/*` | **Cascade** | `/widgets/` |

---

## 💡 Wat we vandaag fout deden:

**Probleem:** `golfvakantie-planner.ai-travelstudio.nl` laadde niet correct

**Fout:** Cascade fixte `/api/page/[slug].js` de hele dag
- ❌ Dit werkt alleen voor `ai-websitestudio.nl`
- ❌ Subdomains gebruiken Supabase Edge Functions!

**Goed:** BOLT moet `/supabase/functions/website-viewer/index.ts` fixen
- ✅ Dit is wat BOLT project daadwerkelijk gebruikt
- ✅ Dit werkt voor alle subdomains

---

## 🔍 Hoe te checken welk systeem actief is:

### Test URL:
```
https://DOMAIN/api/page/home
```

**Als dit werkt:** Vercel API wordt gebruikt (Cascade territory)
**Als 404:** Supabase Edge Function wordt gebruikt (BOLT territory)

### Of check Vercel Domains:
1. BOLT project → Domains
2. Staat de domain daar? → BOLT gebruikt Supabase Edge Functions
3. Staat de domain in Builder project? → Cascade gebruikt Vercel API

---

## ✅ Checklist voor Fixes

Voordat je begint:

- [ ] Check welk domein het probleem heeft
- [ ] Check welk Vercel project dat domein host
- [ ] Check of het Supabase Edge Functions of Vercel API gebruikt
- [ ] Bepaal: BOLT of Cascade?
- [ ] Lees deze docs voordat je begint!

---

**Gemaakt:** 26 november 2024
**Reden:** Verspilde een hele dag door verkeerde code te fixen
**Lesson learned:** Check ALTIJD eerst welk systeem actief is!
