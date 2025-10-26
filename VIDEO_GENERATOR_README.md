# 🎬 Video Generator voor Reizen

Automatisch promotievideo's genereren voor rondreizen met AI-geselecteerde clips.

## ✨ Features

- 🎥 **Automatische clip selectie** - Zoekt relevante video's per bestemming via Pexels
- 🎬 **Professionele compositie** - Shotstack API voor video rendering
- 🎤 **Voice-over support** - Upload je eigen audio
- ⚙️ **Aanpasbare instellingen** - Clip duur, transities, overlays
- 📊 **Real-time progress** - Live status updates tijdens rendering

## 🚀 Setup

### 1. Installeer Dependencies

```bash
npm install
```

Dit installeert:
- `shotstack-sdk` - Video rendering API
- `form-data` - File uploads

### 2. API Keys Aanmaken

#### Pexels API (GRATIS)
1. Ga naar https://www.pexels.com/api/
2. Maak een gratis account
3. Kopieer je API key

#### Shotstack API (GRATIS TRIAL)
1. Ga naar https://shotstack.io
2. Maak een gratis account (50 renders/maand)
3. Kopieer je API key van het dashboard

### 3. Environment Variables

Kopieer `.env.example` naar `server/.env`:

```bash
cp .env.example server/.env
```

Vul de keys in:

```env
# Pexels API (gratis)
PEXELS_API_KEY=your_pexels_api_key_here

# Shotstack API (gratis trial)
SHOTSTACK_API_KEY=your_shotstack_api_key_here
SHOTSTACK_ENV=stage
```

### 4. Start de Server

```bash
npm run dev
```

Server draait op http://localhost:5050

## 📖 Gebruik

### In de Builder

1. **Importeer een reis** via Travel Compositor, PDF of URL
2. **Klik op "Maak Video"** knop bij de reis
3. **Pas instellingen aan**:
   - Clip duur per bestemming (2-5 seconden)
   - Upload optionele voice-over
4. **Klik "Genereer Video"**
5. **Wacht 1-2 minuten** voor rendering
6. **Download** je video!

### Via API

```javascript
// Genereer video
const response = await fetch('/api/video/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    destinations: [
      { name: 'Paris' },
      { name: 'Rome' },
      { name: 'Barcelona' }
    ],
    title: 'Europa Rondreis',
    duration: 3, // seconden per clip
    voiceoverUrl: null // optioneel
  })
});

const { renderId } = await response.json();

// Check status
const status = await fetch(`/api/video/status/${renderId}`);
const { url, progress } = await status.json();
```

## 🎨 Video Specificaties

### Output
- **Format**: MP4
- **Resolutie**: 1280x720 (HD)
- **Aspect Ratio**: 16:9
- **FPS**: 25
- **Codec**: H.264

### Compositie
- **Clip duur**: 2-5 seconden (instelbaar)
- **Transities**: Fade in/out
- **Overlays**: 
  - Titel (eerste 3 seconden)
  - Bestemmingsnamen (per clip)
- **Audio**: Optionele voice-over

## 🔧 Geavanceerde Configuratie

### Custom Video Templates

Pas de timeline aan in `server/api/video-generate.js`:

```javascript
function createTimeline(clips, title, duration, voiceoverUrl) {
  // Voeg custom tracks toe
  // Pas transities aan
  // Wijzig text overlays
}
```

### Cloud Storage voor Voice-overs

Voor productie gebruik, configureer S3/Cloudinary in `server/api/voiceover-upload.js`:

```javascript
// Upload naar S3
const s3 = new AWS.S3();
await s3.upload({
  Bucket: process.env.AWS_S3_BUCKET,
  Key: filename,
  Body: fileBuffer
}).promise();
```

## 💰 Kosten

### Gratis Tier
- **Pexels**: Onbeperkt gratis
- **Shotstack**: 50 renders/maand gratis
- **Totaal**: €0/maand voor 50 video's

### Betaalde Opties
- **Shotstack Starter**: €19/maand (200 renders)
- **Shotstack Pro**: €49/maand (1000 renders)
- **Storyblocks API**: €149/maand (betere clips)

## 🐛 Troubleshooting

### "Missing PEXELS_API_KEY"
- Controleer of `PEXELS_API_KEY` in `server/.env` staat
- Herstart de server na het toevoegen

### "No clips found"
- Controleer of bestemmingsnamen correct zijn
- Probeer meer algemene termen (bijv. "Paris" ipv "Parijs")

### "Rendering failed"
- Check Shotstack API key
- Controleer of je binnen free tier limiet zit (50/maand)
- Bekijk Shotstack dashboard voor errors

### Video duurt te lang
- Verlaag clip duur naar 2-3 seconden
- Beperk aantal bestemmingen tot 5-7

## 📚 API Documentatie

### POST /api/video/generate

**Request:**
```json
{
  "destinations": [
    { "name": "Paris" },
    { "name": "Rome" }
  ],
  "title": "Europa Reis",
  "duration": 3,
  "voiceoverUrl": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "renderId": "abc123",
  "status": "queued",
  "message": "Video wordt gegenereerd...",
  "statusUrl": "/api/video/status/abc123"
}
```

### GET /api/video/status/:id

**Response:**
```json
{
  "id": "abc123",
  "status": "done",
  "progress": 100,
  "url": "https://cdn.shotstack.io/...",
  "thumbnail": "https://...",
  "duration": 15.0
}
```

## 🚀 Roadmap

- [ ] Achtergrondmuziek toevoegen
- [ ] Meer video templates
- [ ] AI voice-over generatie
- [ ] Batch video generatie
- [ ] Custom branding/watermarks
- [ ] Social media formaten (9:16, 1:1)

## 📝 Licentie

MIT

## 🤝 Support

Voor vragen of problemen, open een issue op GitHub.
