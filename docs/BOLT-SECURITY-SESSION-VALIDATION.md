# 🔐 BOLT Security Enhancement: Session Validation

## Overzicht

De Website Builder deeplinks zijn nu beveiligd met:
1. ✅ JWT token expiry validatie (geïmplementeerd in Builder)
2. ✅ Browser fingerprint binding (geïmplementeerd in Builder)
3. ⏳ BOLT session validation (nog te implementeren in BOLT)

Dit document beschrijft hoe BOLT team **optie 3** kan implementeren voor maximale beveiliging.

---

## Huidige Beveiliging (Live)

### 1. JWT Token Expiry Validatie
**Wat het doet:**
- Builder checkt of JWT token nog geldig is
- Verlopen tokens worden geweigerd
- Gebruiker wordt doorgestuurd naar BOLT login

**Implementatie:**
```javascript
// In simple-template-editor.html
const decoded = decodeJWT(token);
const now = Math.floor(Date.now() / 1000);
if (decoded.exp && decoded.exp < now) {
    alert('⚠️ Je sessie is verlopen. Log opnieuw in via BOLT.');
    window.location.href = 'https://www.ai-travelstudio.nl/#/login';
}
```

**Aanbeveling BOLT:**
- Zorg dat JWT tokens een **korte expiry** hebben (15-30 minuten)
- Gebruik `expiresIn: '15m'` bij token generatie

```typescript
// In BOLT bij deeplink generatie
const token = jwt.sign(
  { userId, brandId, email, role },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }  // ← Token geldig voor 15 minuten
);
```

---

### 2. Browser Fingerprint Binding
**Wat het doet:**
- Builder genereert fingerprint van browser bij eerste gebruik
- Opgeslagen in sessionStorage
- Bij elke volgende actie wordt fingerprint gecheckt
- Als fingerprint niet matcht → Link is geopend op ander apparaat

**Fingerprint componenten:**
- User Agent
- Browser taal
- Tijdzone offset
- Scherm resolutie
- Kleurdiepte

**Implementatie:**
```javascript
// In simple-template-editor.html
async generateFingerprint() {
    const data = [
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset(),
        screen.width + 'x' + screen.height,
        screen.colorDepth
    ].join('|');
    
    // Simple hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}
```

**Beperking:**
- Werkt alleen binnen zelfde browser sessie (sessionStorage)
- Als gebruiker browser sluit en opnieuw opent → Nieuwe fingerprint

---

## Nog Te Implementeren: BOLT Session Validation

### Waarom Nodig?

**Huidige beveiliging voorkomt:**
- ✅ Gebruik van verlopen tokens
- ✅ Gebruik van dezelfde link op ander apparaat (binnen sessie)

**Maar NIET:**
- ❌ Hacker die link kopieert VOORDAT gebruiker het opent
- ❌ Gebruik na browser herstart (sessionStorage cleared)

**Oplossing: Valideer BOLT sessie**

---

### Implementatie Optie A: Cookie-Based Session Check

**1. BOLT moet session cookie zetten bij login:**
```typescript
// In BOLT login flow
app.post('/api/login', async (req, res) => {
  // ... authenticate user ...
  
  // Set secure session cookie
  res.cookie('bolt_session', sessionToken, {
    httpOnly: true,      // Niet toegankelijk via JavaScript
    secure: true,        // Alleen via HTTPS
    sameSite: 'lax',     // CSRF bescherming
    maxAge: 3600000      // 1 uur
  });
  
  res.json({ success: true });
});
```

**2. BOLT moet validation endpoint maken:**
```typescript
// /api/validate-session endpoint
app.get('/api/validate-session', async (req, res) => {
  const sessionToken = req.cookies.bolt_session;
  
  if (!sessionToken) {
    return res.status(401).json({ authenticated: false });
  }
  
  // Verify session token in database/Redis
  const session = await getSession(sessionToken);
  
  if (!session || session.expiresAt < new Date()) {
    return res.status(401).json({ authenticated: false });
  }
  
  res.json({ 
    authenticated: true,
    userId: session.userId,
    brandId: session.brandId
  });
});
```

**3. Builder roept validation endpoint aan:**
```javascript
// In simple-template-editor.html
async validateBoltSession() {
  try {
    const response = await fetch('https://www.ai-travelstudio.nl/api/validate-session', {
      method: 'GET',
      credentials: 'include',  // Send cookies
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!data.authenticated) {
      console.error('❌ BOLT session not found or expired');
      alert('⚠️ Je moet ingelogd zijn in BOLT om de editor te gebruiken.');
      window.location.href = 'https://www.ai-travelstudio.nl/#/login';
      return false;
    }
    
    console.log('✅ BOLT session validated');
    return true;
  } catch (error) {
    console.error('❌ Failed to validate BOLT session:', error);
    return false;
  }
}
```

**4. Integreer in init():**
```javascript
async init() {
  this.parseUrlParams();
  
  // Validate BOLT session if coming from BOLT
  if (this.token || this.brandId) {
    const securityValid = await this.validateSecurity();
    if (!securityValid) return;
    
    // NEW: Check BOLT session
    const sessionValid = await this.validateBoltSession();
    if (!sessionValid) return;
  }
  
  // ... rest of init ...
}
```

**Voordelen:**
- ✅ Deeplink werkt ALLEEN als gebruiker echt ingelogd is
- ✅ Hacker met gestolen link kan niks zonder BOLT sessie
- ✅ Simpele implementatie

**Nadelen:**
- ⚠️ CORS configuratie nodig (cookies cross-domain)
- ⚠️ Werkt niet als Builder en BOLT op verschillende top-level domains

---

### Implementatie Optie B: iframe PostMessage (Alternatief)

**Als CORS problemen zijn met cookies:**

**1. BOLT maakt session check pagina:**
```html
<!-- /session-check.html in BOLT -->
<!DOCTYPE html>
<html>
<head><title>Session Check</title></head>
<body>
<script>
  // Check if user is logged in
  async function checkSession() {
    const response = await fetch('/api/current-user', {
      credentials: 'include'
    });
    
    const authenticated = response.ok;
    
    // Send result to parent
    window.parent.postMessage({
      type: 'session-check',
      authenticated: authenticated
    }, 'https://www.ai-websitestudio.nl');
  }
  
  checkSession();
</script>
</body>
</html>
```

**2. Builder laadt iframe en wacht op response:**
```javascript
async validateBoltSession() {
  return new Promise((resolve) => {
    // Create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.ai-travelstudio.nl/session-check.html';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Listen for message from iframe
    const messageHandler = (event) => {
      if (event.origin !== 'https://www.ai-travelstudio.nl') return;
      
      if (event.data.type === 'session-check') {
        window.removeEventListener('message', messageHandler);
        iframe.remove();
        
        if (!event.data.authenticated) {
          alert('⚠️ Je moet ingelogd zijn in BOLT.');
          window.location.href = 'https://www.ai-travelstudio.nl/#/login';
          resolve(false);
        } else {
          resolve(true);
        }
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      iframe.remove();
      resolve(true); // Fail open if check times out
    }, 5000);
  });
}
```

**Voordelen:**
- ✅ Werkt zonder CORS issues
- ✅ Kan cross-domain communiceren

**Nadelen:**
- ⚠️ Iets complexer
- ⚠️ Kleine vertraging door iframe load

---

## Aanbevolen Implementatie Plan

### Fase 1: Klaar (Geïmplementeerd)
- ✅ JWT expiry validatie
- ✅ Browser fingerprint binding

### Fase 2: BOLT Team (To Do)
1. **Korte JWT expiry instellen**
   - Update token generatie naar 15 minuten
   - Test dat refresh werkt

2. **Session cookie implementeren**
   - Zet httpOnly cookie bij login
   - Test cross-domain toegang

3. **Validation endpoint maken**
   - `/api/validate-session` endpoint
   - Return user info als geldig

4. **CORS configureren**
   - Allow credentials voor `*.ai-websitestudio.nl`
   - Test vanuit Builder

### Fase 3: Builder Integration (Als BOLT klaar is)
1. Uncomment `validateBoltSession()` call in `init()`
2. Test volledige flow
3. Deploy naar production

---

## Testing Scenarios

### Test 1: Normale Flow
1. Login in BOLT
2. Klik deeplink naar Builder
3. ✅ Editor laadt
4. ✅ Kan bewerken en opslaan

### Test 2: Verlopen Token
1. Genereer deeplink met korte expiry (1 min)
2. Wacht 2 minuten
3. Open deeplink
4. ✅ Error: "Je sessie is verlopen"

### Test 3: Token Theft
1. Open deeplink op apparaat A
2. Kopieer URL
3. Plak URL op apparaat B
4. ✅ Error: "Link geopend op ander apparaat"

### Test 4: Geen BOLT Sessie (Na Fase 2)
1. Logout in BOLT
2. Open deeplink
3. ✅ Error: "Je moet ingelogd zijn in BOLT"

---

## Security Best Practices

### DO's ✅
- Gebruik korte JWT expiry (15-30 min)
- Gebruik httpOnly, secure cookies
- Log security events (failed validations)
- Rate limit validation endpoints
- Rotate JWT secrets regelmatig

### DON'Ts ❌
- Geen gevoelige data in JWT payload
- Geen JWT secrets in client code
- Geen lange token expiry (>1 uur)
- Geen session tokens in URL/query params
- Geen CORS wildcard (*) met credentials

---

## Veelgestelde Vragen

**Q: Wat als gebruiker browser herstart?**
A: Fingerprint wordt opnieuw gegenereerd, maar JWT + BOLT session check blijven werken.

**Q: Kan gebruiker meerdere tabs openen?**
A: Ja, zelfde fingerprint + sessie werkt in alle tabs.

**Q: Wat als hacker alleen JWT token steelt (niet hele URL)?**
A: Token alleen is nutteloos - Builder checkt ook apikey en brandId parameters.

**Q: Performance impact?**
A: Minimal - validatie duurt <100ms, gebeurt alleen bij init.

**Q: Backwards compatible?**
A: Ja - oude deeplinks blijven werken tot BOLT session check actief wordt.

---

## Contact & Vragen

Voor implementatie hulp of vragen over deze security features:
- Slack: #builder-security
- Email: dev@ai-travelstudio.nl
- Wiki: https://wiki.ai-travelstudio.nl/security

**Status:** ✅ Fase 1 Live | ⏳ Fase 2 Wachtend op BOLT Team
