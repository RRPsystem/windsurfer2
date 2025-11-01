# 🧪 Security Testing Guide

## Overzicht

Er zijn twee manieren om de beveiliging te testen:

1. **Browser Test Suite** - Visuele interface met real-time resultaten
2. **Command Line Tests** - Geautomatiseerde tests voor CI/CD

---

## 🌐 Browser Test Suite

### Starten:

1. **Start de server:**
   ```bash
   npm run dev
   ```

2. **Open test pagina:**
   ```
   http://localhost:5050/test-security.html
   ```

3. **Run tests:**
   - Klik op "🚀 Run Alle Tests" voor complete scan
   - Of test individuele componenten

### Wat wordt getest:

| Test | Beschrijving | Pass Criteria |
|------|--------------|---------------|
| 🚦 Rate Limiting | API rate limits actief | X-RateLimit headers aanwezig |
| 🛡️ Security Headers | Helmet headers | 3+ security headers |
| 🔒 HTTPS Check | API gebruikt HTTPS | TC_BASE_URL = https:// |
| 🗄️ Supabase RLS | Row Level Security | 401/403 zonder auth |
| 🔑 Env Vars | Geen credentials in frontend | Geen exposed secrets |
| 🔐 Auth Endpoint | Auth beveiliging | Token preview < 50 chars |

### Screenshot:

De test suite toont:
- ✅ Real-time status per test
- 📊 Security score (0-10)
- 📈 Pass/fail statistieken
- 🔍 Gedetailleerde error messages

---

## 💻 Command Line Tests

### Starten:

```bash
# Installeer dependencies eerst
npm install

# Run security tests
npm run test:security
```

Of direct:
```bash
node scripts/test-security.js
```

### Output Voorbeeld:

```
🔐 SECURITY TEST SUITE
Testing: http://localhost:5050

🔍 Test 1: Server Status
✓ Server Running: Server is bereikbaar
  Port: 5050

🚦 Test 2: Rate Limiting
✓ Rate Limiting: Rate limit headers aanwezig
  Limit: 100, Remaining: 99

🛡️  Test 3: Security Headers
✓ Security Headers: 4/4 headers gevonden
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 0
  Strict-Transport-Security: max-age=15552000

🔒 Test 4: HTTPS Configuration
✓ HTTPS Config: TC_BASE_URL gebruikt HTTPS
  https://online.travelcompositor.com

🔑 Test 5: Environment File
✓ Env File Exists: server/.env gevonden
✓ Env in Gitignore: server/.env staat in .gitignore

🔐 Test 6: Auth Endpoint
✓ Auth Endpoint: Auth endpoint veilig
  Token preview: eyJhbGciOiJI...
  Expires: 3570s

📦 Test 7: Security Dependencies
  ✓ helmet (Security headers): ^7.1.0
  ✓ express-rate-limit (Rate limiting): ^7.1.5
  ✓ dotenv (Environment variables): ^16.4.5
✓ Security Dependencies: Alle security packages geïnstalleerd

============================================================
📊 TEST SAMENVATTING
============================================================

Totaal tests: 9
Geslaagd: 9
Gefaald: 0

Security Score: 10/10

============================================================
✅ Beveiliging is goed!

Voor meer info: zie docs/SECURITY_SETUP.md
```

---

## 🔄 CI/CD Integration

### GitHub Actions

Voeg toe aan `.github/workflows/security.yml`:

```yaml
name: Security Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Start server
      run: npm run dev &
      env:
        TC_BASE_URL: ${{ secrets.TC_BASE_URL }}
        TC_USERNAME: ${{ secrets.TC_USERNAME }}
        TC_PASSWORD: ${{ secrets.TC_PASSWORD }}
    
    - name: Wait for server
      run: sleep 5
    
    - name: Run security tests
      run: npm run test:security
```

### Vercel Pre-deploy Hook

Voeg toe aan `vercel.json`:

```json
{
  "buildCommand": "npm run test:security && npm run build",
  "devCommand": "npm run dev"
}
```

---

## 🎯 Test Scenarios

### Scenario 1: Nieuwe Deployment

```bash
# 1. Installeer dependencies
npm install

# 2. Check environment
grep TC_BASE_URL server/.env

# 3. Start server
npm run dev

# 4. Run tests (andere terminal)
npm run test:security

# 5. Open browser test
open http://localhost:5050/test-security.html
```

### Scenario 2: Na Code Changes

```bash
# Quick check
npm run test:security

# Als tests falen:
# 1. Check error messages
# 2. Fix issues
# 3. Re-run tests
```

### Scenario 3: Production Verification

```bash
# Test tegen productie
API_BASE=https://jouw-app.vercel.app npm run test:security

# Of browser:
# Open: https://jouw-app.vercel.app/test-security.html?autorun
```

---

## 🐛 Troubleshooting

### "Server niet bereikbaar"

**Oorzaak:** Server draait niet

**Oplossing:**
```bash
# Start server in andere terminal
npm run dev

# Of check of port 5050 vrij is
netstat -ano | findstr :5050  # Windows
lsof -i :5050                 # Mac/Linux
```

### "Rate limit headers niet gevonden"

**Oorzaak:** express-rate-limit niet geïnstalleerd

**Oplossing:**
```bash
npm install express-rate-limit
# Restart server
```

### "Security headers ontbreken"

**Oorzaak:** helmet niet geïnstalleerd of niet actief

**Oplossing:**
```bash
npm install helmet
# Check server/index.js regel 5: require('helmet')
```

### "RLS test faalt"

**Oorzaak:** Supabase RLS niet actief

**Oplossing:**
1. Open Supabase dashboard
2. Database → Tables
3. Voor elke tabel: Enable RLS
4. Maak policies

### "HTTPS test faalt"

**Oorzaak:** TC_BASE_URL gebruikt HTTP

**Oplossing:**
```bash
# Edit server/.env
TC_BASE_URL=https://online.travelcompositor.com
# (niet http://)
```

---

## 📊 Interpreting Results

### Score Interpretatie:

| Score | Status | Actie |
|-------|--------|-------|
| 9-10 | ✅ Excellent | Maintain current security |
| 7-8 | ⚠️ Good | Fix minor issues |
| 5-6 | 🟡 Fair | Address failed tests |
| 0-4 | 🔴 Poor | URGENT: Fix critical issues |

### Kritieke Tests:

Deze tests **MOETEN** slagen:

1. ✅ **Supabase RLS** - Anders is database publiek toegankelijk
2. ✅ **HTTPS Config** - Anders onveilige data transmissie
3. ✅ **Env in Gitignore** - Anders credentials in Git

### Nice-to-have Tests:

Deze verbeteren beveiliging maar zijn niet kritiek:

- Rate Limiting (beschermt tegen brute force)
- Security Headers (extra browser beveiliging)
- Auth Endpoint (voorkomt token leaks)

---

## 🔄 Continuous Monitoring

### Dagelijks:

```bash
# Quick check
npm run test:security
```

### Wekelijks:

```bash
# Full audit
npm audit
npm run test:security

# Update dependencies
npm update
```

### Maandelijks:

```bash
# Check for security updates
npm outdated
npm audit fix

# Re-run tests
npm run test:security
```

---

## 📚 Meer Resources

- **Setup Guide:** `docs/SECURITY_SETUP.md`
- **Best Practices:** `docs/SECURITY.md`
- **Quick Start:** `SECURITY_QUICKSTART.md`

---

## 🆘 Support

Als tests blijven falen:

1. Check error messages in test output
2. Lees relevante sectie in `SECURITY_SETUP.md`
3. Verifieer `.env` configuratie
4. Check server logs: `npm run dev`
5. Open issue op GitHub met test output
