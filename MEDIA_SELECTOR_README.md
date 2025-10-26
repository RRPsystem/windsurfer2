# 🎨 Media Selector - Uitgebreid met Pexels Videos

## ✨ Nieuwe Features

De media selector ondersteunt nu **4 bronnen**:

1. **📤 Upload** - Lokale bestanden
2. **🖼️ Unsplash** - Gratis stock foto's
3. **🎬 Pexels** - Gratis stock video's (NIEUW!)
4. **▶️ YouTube** - Embedded video's

---

## 🚀 Setup

### 1. Kopieer Config File

```bash
cp js/config.local.example.js js/config.local.js
```

### 2. Voeg API Keys Toe

Bewerk `js/config.local.js`:

```javascript
window.MEDIA_CONFIG = {
  // Unsplash (voor foto's)
  unsplashAccessKey: 'jouw_unsplash_key',
  
  // Pexels (voor video's) - NIEUW!
  pexelsKey: 'jouw_pexels_key',
  
  // YouTube (voor embedded videos)
  youtubeApiKey: 'jouw_youtube_key'
};
```

### 3. API Keys Aanmaken

#### Pexels API (2 minuten, GRATIS)
1. Ga naar https://www.pexels.com/api/
2. Klik "Get Started"
3. Vul je email in
4. Kopieer API key
5. Plak in `config.local.js`

#### Unsplash API (3 minuten, GRATIS)
1. Ga naar https://unsplash.com/developers
2. Maak een app aan
3. Kopieer "Access Key"
4. Plak in `config.local.js`

#### YouTube API (5 minuten, GRATIS)
1. Ga naar https://console.cloud.google.com/
2. Maak een project
3. Enable "YouTube Data API v3"
4. Maak API key
5. Plak in `config.local.js`

---

## 📖 Gebruik

### In Code

```javascript
// Voor afbeeldingen (Unsplash)
const result = await MediaPicker.openImage();
if (result) {
  console.log(result.url); // Image URL
}

// Voor video's (Pexels of YouTube)
const result = await MediaPicker.openVideo();
if (result) {
  if (result.source === 'pexels') {
    console.log(result.videoUrl); // Direct MP4 link
    console.log(result.thumbnail); // Thumbnail
    console.log(result.duration); // Duration in seconds
  } else if (result.source === 'youtube') {
    console.log(result.embedUrl); // YouTube embed URL
    console.log(result.id); // Video ID
  }
}
```

### Met Default Tab

```javascript
// Open direct op Pexels tab
const result = await MediaPicker.openVideo({ defaultTab: 'pexels' });

// Open direct op YouTube tab
const result = await MediaPicker.openVideo({ defaultTab: 'youtube' });

// Open direct op Unsplash tab
const result = await MediaPicker.openImage({ defaultTab: 'unsplash' });
```

---

## 🎬 Pexels Videos

### Features
- ✅ HD kwaliteit (1280x720+)
- ✅ Direct MP4 download links
- ✅ Landscape orientation
- ✅ Thumbnail previews
- ✅ Duration display
- ✅ Pagination (12 per pagina)

### Response Format

```javascript
{
  source: 'pexels',
  type: 'video',
  url: 'https://player.vimeo.com/...',
  videoUrl: 'https://player.vimeo.com/...',
  thumbnail: 'https://images.pexels.com/...',
  duration: 15.5,
  width: 1920,
  height: 1080,
  id: 123456
}
```

### Gebruik in Builder

```javascript
// In properties.js of andere component
const videoBtn = this.createButton('🎬 Video Kiezen', async () => {
  const res = await MediaPicker.openVideo({ defaultTab: 'pexels' });
  if (!res) return;
  
  if (res.source === 'pexels') {
    // Direct MP4 video
    const videoEl = document.createElement('video');
    videoEl.src = res.videoUrl;
    videoEl.poster = res.thumbnail;
    videoEl.controls = true;
    videoEl.autoplay = true;
    videoEl.loop = true;
    videoEl.muted = true;
    
    // Of als achtergrond
    component.style.backgroundImage = `url(${res.thumbnail})`;
    component.dataset.videoUrl = res.videoUrl;
  }
});
```

---

## 🖼️ Unsplash Images

### Features
- ✅ Landmark & highlight focus
- ✅ Landscape orientation
- ✅ High quality
- ✅ Multiple resolutions (small, regular, full)
- ✅ Photographer credit

### Response Format

```javascript
{
  source: 'unsplash',
  type: 'image',
  url: 'https://images.unsplash.com/...',
  smallUrl: 'https://images.unsplash.com/...?w=400',
  regularUrl: 'https://images.unsplash.com/...?w=1080',
  fullUrl: 'https://images.unsplash.com/...?w=2400',
  credit: 'John Doe',
  link: 'https://unsplash.com/photos/...'
}
```

---

## ▶️ YouTube Videos

### Features
- ✅ Search met API
- ✅ Manual URL input
- ✅ Start time support
- ✅ Embed ready

### Response Format

```javascript
{
  source: 'youtube',
  type: 'video',
  embedUrl: 'https://www.youtube.com/embed/abc123?start=10',
  id: 'abc123',
  start: 10
}
```

---

## 🎨 UI Customization

### Tab Colors

```css
/* Unsplash - Orange */
.tab-btn[data-tab="unsplash"] { background: #ff7700; }

/* Pexels - Teal */
.tab-btn[data-tab="pexels"] { background: #05A081; }

/* YouTube - Red */
.tab-btn[data-tab="youtube"] { background: #ff0000; }

/* Upload - Gray */
.tab-btn[data-tab="upload"] { background: #f3f4f6; }
```

### Grid Layout

```css
/* Pexels & YouTube: 2 columns */
.pexels-grid, .yt-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

/* Unsplash: 3 columns */
.unsplash-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
```

---

## 🔧 Advanced Usage

### Video Background Component

```javascript
async function setVideoBackground(component) {
  const res = await MediaPicker.openVideo({ defaultTab: 'pexels' });
  if (!res) return;
  
  if (res.source === 'pexels') {
    // Create video element
    const video = document.createElement('video');
    video.src = res.videoUrl;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      min-width: 100%;
      min-height: 100%;
      width: auto;
      height: auto;
      transform: translate(-50%, -50%);
      object-fit: cover;
    `;
    
    component.appendChild(video);
  } else if (res.source === 'youtube') {
    // YouTube iframe
    const iframe = document.createElement('iframe');
    iframe.src = `${res.embedUrl}&autoplay=1&mute=1&loop=1&controls=0`;
    iframe.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 177.77777778vh;
      height: 100%;
      min-width: 100%;
      min-height: 56.25vw;
      transform: translate(-50%, -50%);
    `;
    
    component.appendChild(iframe);
  }
}
```

### Hero Section with Pexels

```javascript
const heroBtn = this.createButton('🎬 Hero Video', async () => {
  const res = await MediaPicker.openVideo({ defaultTab: 'pexels' });
  if (!res || res.source !== 'pexels') return;
  
  const hero = document.querySelector('.hero-section');
  hero.innerHTML = `
    <video autoplay loop muted playsinline>
      <source src="${res.videoUrl}" type="video/mp4">
    </video>
    <div class="hero-content">
      <h1>Jouw Titel</h1>
      <p>Jouw tekst</p>
    </div>
  `;
});
```

---

## 💰 Kosten

| Service | Gratis Tier | Kosten |
|---------|-------------|--------|
| **Pexels** | Onbeperkt | €0 |
| **Unsplash** | 50 requests/uur | €0 |
| **YouTube** | 10.000 units/dag | €0 |

**Totaal: €0/maand** 🎉

---

## 🐛 Troubleshooting

### Pexels tab toont "Geen API key"
1. Check of `js/config.local.js` bestaat
2. Check of `pexelsKey` is ingevuld
3. Herlaad de pagina

### Unsplash toont demo images
1. Voeg `unsplashAccessKey` toe aan config
2. Check of key correct is
3. Herlaad de pagina

### YouTube search werkt niet
1. Voeg `youtubeApiKey` toe aan config
2. Check of YouTube Data API v3 is enabled
3. Gebruik anders de URL input

---

## 📊 API Limits

### Pexels
- **Rate limit**: 200 requests/uur
- **Per page**: 1-80 results
- **Max**: Onbeperkt

### Unsplash
- **Rate limit**: 50 requests/uur (demo), 5000/uur (production)
- **Per page**: 1-30 results
- **Max**: Onbeperkt

### YouTube
- **Quota**: 10.000 units/dag
- **Search**: 100 units per request
- **Max**: ~100 searches/dag

---

## 🎯 Best Practices

### Voor Hero Sections
```javascript
// Gebruik Pexels voor achtergrond video's
const res = await MediaPicker.openVideo({ defaultTab: 'pexels' });
// Zoek op: "city aerial", "beach sunset", "mountain landscape"
```

### Voor Content Sections
```javascript
// Gebruik Unsplash voor foto's
const res = await MediaPicker.openImage({ defaultTab: 'unsplash' });
// Zoek op: "Paris landmark", "Rome colosseum", "Barcelona architecture"
```

### Voor Embedded Videos
```javascript
// Gebruik YouTube voor vlogs/reviews
const res = await MediaPicker.openVideo({ defaultTab: 'youtube' });
// Zoek op: "travel vlog", "hotel review", "destination guide"
```

---

## 🚀 Volgende Stappen

- [ ] Test Pexels video search
- [ ] Test Unsplash image search
- [ ] Integreer in hero components
- [ ] Integreer in video backgrounds
- [ ] Maak video gallery component

---

Veel succes! 🎬
