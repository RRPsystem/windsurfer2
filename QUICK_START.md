# 🚀 Quick Start - Video Generator

## 5 Minuten Setup

### 1. Installeer Dependencies
```bash
npm install
```

### 2. Maak API Keys aan

#### Pexels (2 minuten)
1. Ga naar https://www.pexels.com/api/
2. Klik "Get Started"
3. Vul je email in
4. Kopieer je API key

#### Shotstack (3 minuten)
1. Ga naar https://shotstack.io
2. Klik "Sign Up Free"
3. Vul je gegevens in
4. Ga naar Dashboard → API Keys
5. Kopieer je API key

### 3. Configureer Environment
```bash
# Kopieer example
cp .env.example server/.env

# Bewerk server/.env
nano server/.env
```

Plak je keys:
```env
PEXELS_API_KEY=jouw_pexels_key_hier
SHOTSTACK_API_KEY=jouw_shotstack_key_hier
SHOTSTACK_ENV=stage
```

### 4. Start Server
```bash
npm run dev
```

Server draait op: http://localhost:5050

### 5. Test het!

#### Optie A: Via Reis Import
1. Open http://localhost:5050
2. Klik "Reizen" in menu
3. Importeer een reis (TC/PDF/URL)
4. Klik "Maak Video"
5. Wacht 1-2 minuten
6. Download!

#### Optie B: Standalone
1. Open http://localhost:5050/video-generator.html
2. Voer bestemmingen in:
   - Paris
   - Rome
   - Barcelona
3. Klik "Genereer Video"
4. Wacht 1-2 minuten
5. Download!

---

## ✅ Checklist

- [ ] Dependencies geïnstalleerd
- [ ] Pexels API key aangemaakt
- [ ] Shotstack API key aangemaakt
- [ ] `.env` bestand geconfigureerd
- [ ] Server gestart
- [ ] Test video gemaakt
- [ ] Video gedownload

---

## 🎯 Volgende Stappen

### Voor Development
- [ ] Test met verschillende bestemmingen
- [ ] Upload voice-over
- [ ] Pas clip duur aan
- [ ] Check video kwaliteit

### Voor Productie
- [ ] Deploy naar Vercel/Netlify
- [ ] Voeg environment variables toe in hosting
- [ ] Test productie URL
- [ ] Integreer in BOLT menu

### Voor Klanten
- [ ] Maak tutorial video
- [ ] Schrijf gebruikershandleiding
- [ ] Promoot feature
- [ ] Verzamel feedback

---

## 🐛 Problemen?

### Server start niet
```bash
# Check of poort 5050 vrij is
lsof -i :5050

# Of gebruik andere poort
PORT=3000 npm run dev
```

### API Keys werken niet
```bash
# Check of .env in juiste folder staat
ls server/.env

# Check of keys correct zijn
cat server/.env
```

### Video generatie faalt
1. Check Shotstack dashboard voor errors
2. Controleer of je binnen free tier zit (50/maand)
3. Bekijk browser console voor errors
4. Check server logs

---

## 📞 Support

- **Documentatie**: `VIDEO_GENERATOR_README.md`
- **BOLT Integratie**: `BOLT_INTEGRATION.md`
- **GitHub Issues**: [link]

---

## 🎉 Klaar!

Je kunt nu video's maken! 🚀

**Test video maken:**
```
1. Open: http://localhost:5050/video-generator.html
2. Voer in: Paris, Rome, Barcelona
3. Klik: Genereer Video
4. Wacht: 1-2 minuten
5. Download: MP4 bestand
```

**Veel succes!** 🎬
