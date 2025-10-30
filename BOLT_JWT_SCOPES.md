# 🔐 BOLT JWT Scopes Debug

## ❌ Veelvoorkomende Error:

```
{"error":"Invalid JWT: Missing required scope: pages:read"}
```

---

## ✅ Vereiste JWT Scopes

**De JWT token die BOLT genereert MOET deze scopes hebben:**

```json
{
  "brand_id": "xxx-xxx-xxx",
  "sub": "user-id",
  "scope": [
    "pages:read",       ← Voor templates/pagina's laden
    "pages:write",      ← Voor pagina's opslaan
    "layouts:read",     ← Voor layouts laden
    "layouts:write",    ← Voor layouts opslaan
    "menus:read",       ← Voor menu's laden
    "menus:write",      ← Voor menu's opslaan
    "content:read",     ← Voor content (news/trips) laden
    "content:write"     ← Voor content opslaan
  ],
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 🔍 Check JWT Token

**In browser console:**

```javascript
// Haal token uit URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// Decode JWT (base64)
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('JWT Payload:', payload);
console.log('Scopes:', payload.scope);
```

**Verwacht:**
```javascript
{
  brand_id: "xxx",
  scope: ["pages:read", "pages:write", "layouts:read", ...]
}
```

---

## 🐛 Veelvoorkomende Problemen:

### 1. Missing `pages:read`
```
Error: Invalid JWT: Missing required scope: pages:read
```

**Oplossing:** BOLT moet `pages:read` toevoegen aan JWT scopes

### 2. Missing `content:read`
```
Error: Invalid JWT: Missing required scope: content:read
```

**Oplossing:** BOLT moet `content:read` toevoegen voor news/trips

### 3. Token Expired
```
Error: JWT expired
```

**Oplossing:** Refresh pagina of login opnieuw in BOLT

---

## 🔧 BOLT Moet Fixen:

**In BOLT's JWT generator:**

```javascript
// FOUT - Incomplete scopes
const token = jwt.sign({
  brand_id: brandId,
  sub: userId,
  scope: ["pages:write", "layouts:read"] // ❌ Te weinig!
}, secret);

// GOED - Alle scopes
const token = jwt.sign({
  brand_id: brandId,
  sub: userId,
  scope: [
    "pages:read",      // ✅
    "pages:write",     // ✅
    "layouts:read",    // ✅
    "layouts:write",   // ✅
    "menus:read",      // ✅
    "menus:write",     // ✅
    "content:read",    // ✅
    "content:write"    // ✅
  ]
}, secret, {
  expiresIn: '24h'
});
```

---

## 📊 Scope Mapping:

| Scope | Gebruikt Voor | Vereist? |
|-------|---------------|----------|
| `pages:read` | Templates/pagina's laden | ✅ JA |
| `pages:write` | Pagina's opslaan | ✅ JA |
| `layouts:read` | Layouts laden | ✅ JA |
| `layouts:write` | Layouts opslaan | ✅ JA |
| `menus:read` | Menu's laden | ✅ JA |
| `menus:write` | Menu's opslaan | ✅ JA |
| `content:read` | News/Trips/Destinations laden | ✅ JA |
| `content:write` | Content opslaan | ✅ JA |

---

## 🚀 Quick Test:

**Test of scopes correct zijn:**

```javascript
// In console
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const requiredScopes = [
    'pages:read',
    'pages:write',
    'layouts:read',
    'layouts:write',
    'menus:read',
    'menus:write',
    'content:read',
    'content:write'
  ];
  
  const missingScopes = requiredScopes.filter(s => !payload.scope?.includes(s));
  
  if (missingScopes.length > 0) {
    console.error('❌ Missing scopes:', missingScopes);
  } else {
    console.log('✅ All scopes present!');
  }
} else {
  console.warn('No token in URL');
}
```

---

## 📞 Zeg Tegen BOLT:

**"De JWT token mist scopes. Voeg deze toe aan de token generator:"**

```
pages:read
pages:write
layouts:read
layouts:write
menus:read
menus:write
content:read
content:write
```

**Zonder deze scopes kan de builder geen templates/pagina's laden!**

---

## ✅ Checklist voor BOLT:

- [ ] JWT generator voegt alle 8 scopes toe
- [ ] Token expiry is minimaal 24 uur
- [ ] Token bevat `brand_id`
- [ ] Token bevat `sub` (user id)
- [ ] Test met deeplink URL
- [ ] Verify scopes in decoded JWT

---

**Na fix: Hard refresh browser (Ctrl + Shift + R)** 🔄
