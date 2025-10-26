# Vercel Blob Storage Setup

## 📦 Wat is het?

Vercel Blob Storage wordt gebruikt om gegenereerde video's op te slaan en beschikbaar te maken in de Media Picker.

## 🔑 Setup Stappen:

### 1. Installeer Dependencies

```bash
npm install
```

Dit installeert automatisch `@vercel/blob` en `formidable`.

### 2. Configureer Vercel Blob Storage

1. Ga naar je Vercel project dashboard
2. Klik op "Storage" tab
3. Klik "Create Database" → "Blob"
4. Geef het een naam (bijv. "video-storage")
5. Klik "Create"

### 3. Kopieer Environment Variable

Vercel genereert automatisch `BLOB_READ_WRITE_TOKEN`.

**Voor lokale development:**

1. Maak `.env` bestand aan in project root:
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

2. Of gebruik Vercel CLI:
```bash
vercel env pull .env.local
```

**Voor productie:**

De environment variable wordt automatisch toegevoegd aan je Vercel project.

## 🎬 Gebruik:

### Video Uploaden (vanuit Video Generator):

```javascript
// In Video Generator
const response = await fetch('/api/videos/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    videoData: base64VideoData,
    title: 'Amsterdam → Paris → Rome',
    type: 'animated-route',
    duration: 15,
    width: 1920,
    height: 1080,
    thumbnail: base64ThumbnailData
  })
});

const { video } = await response.json();
console.log('Video uploaded:', video.videoUrl);
```

### Video's Ophalen (in Media Picker):

```javascript
const response = await fetch('/api/videos/list');
const { videos } = await response.json();

videos.forEach(video => {
  console.log(video.title, video.videoUrl);
});
```

### Video Selecteren in Hero:

```javascript
// Hero component → Properties → Achtergrond modus: "Video"
// Media Picker opent → Tab "Mijn Video's"
// Klik op video → Video wordt gebruikt in Hero
```

## 📊 Data Structuur:

```javascript
{
  id: "vid_1730000000000",
  title: "Amsterdam → Paris → Rome",
  type: "animated-route", // of "ai-generated"
  videoUrl: "https://xxxxx.public.blob.vercel-storage.com/videos/...",
  thumbnail: "https://xxxxx.public.blob.vercel-storage.com/thumbnails/...",
  duration: 15,
  width: 1920,
  height: 1080,
  size: 5242880,
  createdAt: "2025-10-26T19:00:00Z"
}
```

## 💰 Kosten:

**Vercel Blob Storage Pricing:**
- **Hobby (gratis):** 1 GB storage, 100 GB bandwidth/maand
- **Pro:** $0.15/GB storage, $0.10/GB bandwidth

**Voorbeeld:**
- 1 video (10 MB) = ~100 videos in gratis tier
- Streaming (100 views × 10 MB) = 1 GB bandwidth

## 🔒 Security:

- Alle uploads zijn **public** (access: 'public')
- Geen authenticatie vereist voor lezen
- Alleen je API kan uploaden (via `BLOB_READ_WRITE_TOKEN`)

## 🚀 API Endpoints:

### POST /api/videos/upload
Upload een nieuwe video naar Blob Storage.

**Request:**
```json
{
  "videoData": "data:video/mp4;base64,...",
  "title": "My Video",
  "type": "generated",
  "duration": 15,
  "width": 1920,
  "height": 1080,
  "thumbnail": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "video": {
    "id": "vid_1730000000000",
    "videoUrl": "https://...",
    "thumbnail": "https://...",
    ...
  }
}
```

### GET /api/videos/list
Haal alle geüploade video's op.

**Response:**
```json
{
  "success": true,
  "videos": [...],
  "count": 5
}
```

## 🐛 Troubleshooting:

### "Blob Storage niet geconfigureerd"
→ Voeg `BLOB_READ_WRITE_TOKEN` toe aan environment variables

### "Upload mislukt"
→ Check of video niet te groot is (max 100MB)
→ Check of base64 data correct is

### "Geen video's zichtbaar"
→ Check of er video's zijn geüpload
→ Check browser console voor errors
→ Ververs de "Mijn Video's" tab

## 📝 TODO (toekomstige features):

- [ ] Video delete functie
- [ ] Video metadata editing
- [ ] User-specific video's (per reisagent)
- [ ] Video compression voor kleinere files
- [ ] Thumbnail generation from video
- [ ] Video duration detection
