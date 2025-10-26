# 🎬 BOLT Integratie - Video Generator

## 2 Manieren om Video's te Maken

### 1️⃣ **Via Opgeslagen Reis** (Automatisch)
Wanneer een reis is opgeslagen in BOLT:
```javascript
// In reis detail pagina
<button onclick="openVideoFromTravel(reisData)">
  🎬 Maak Video van deze Reis
</button>
```

**Flow:**
1. Klant heeft reis in BOLT
2. Klik "Maak Video"
3. Bestemmingen worden automatisch ingelezen
4. Video wordt gegenereerd

---

### 2️⃣ **Standalone Generator** (Handmatig)
Voor reisagenten zonder website/BOLT pagina:

**Direct Link:**
```
https://jouw-domain.com/video-generator.html
```

**Of via BOLT Menu:**
```html
<!-- In BOLT hoofdmenu -->
<a href="/video-generator.html" target="_blank">
  <i class="fas fa-video"></i> Travel Video Maker
</a>
```

**Flow:**
1. Open standalone pagina
2. Voer bestemmingen handmatig in
3. Upload optionele voice-over
4. Genereer video
5. Download voor social media

---

## BOLT Menu Integratie

### Optie A: Nieuw Menu Item

Voeg toe aan BOLT navigatie:

```javascript
{
  id: 'video-generator',
  label: 'Travel Video',
  icon: 'fa-video',
  url: '/video-generator.html',
  target: '_blank',
  description: 'Maak promotievideo\'s voor social media'
}
```

### Optie B: In Content Type Menu

Onder "Reizen" sectie:

```html
<div class="content-type-card">
  <i class="fas fa-video"></i>
  <h3>Travel Video</h3>
  <p>Maak promotievideo voor social media</p>
  <button onclick="window.open('/video-generator.html')">
    Start Generator
  </button>
</div>
```

---

## Use Cases

### ✅ Use Case 1: Website Eigenaar
**Heeft:** Reis opgeslagen in BOLT
**Wil:** Video voor op website

**Actie:**
1. Open reis in BOLT
2. Klik "Maak Video"
3. Video wordt automatisch gemaakt
4. Embed op website

---

### ✅ Use Case 2: Social Media Manager
**Heeft:** Geen website, alleen social media
**Wil:** Video voor Instagram/Facebook

**Actie:**
1. Open `/video-generator.html`
2. Voer 5 bestemmingen in
3. Upload voice-over
4. Download MP4
5. Post op social media

---

### ✅ Use Case 3: Reisagent
**Heeft:** Klant wil offerte zien
**Wil:** Snelle preview video

**Actie:**
1. Open standalone generator
2. Voer bestemmingen in
3. Genereer in 2 minuten
4. Stuur naar klant via WhatsApp

---

## Technische Implementatie

### In BOLT Router

```javascript
// router.js
const routes = {
  '/video-generator': {
    title: 'Travel Video Generator',
    handler: () => {
      window.location.href = '/video-generator.html';
    }
  }
};
```

### Als iFrame (Embedded)

```html
<!-- In BOLT dashboard -->
<iframe 
  src="/video-generator.html" 
  style="width: 100%; height: 100vh; border: none;"
  title="Video Generator"
></iframe>
```

### Als Modal/Popup

```javascript
function openVideoGenerator() {
  const modal = document.createElement('div');
  modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; background: rgba(0,0,0,0.5);';
  
  const iframe = document.createElement('iframe');
  iframe.src = '/video-generator.html';
  iframe.style.cssText = 'width: 90%; height: 90%; margin: 5%; border: none; border-radius: 12px;';
  
  modal.appendChild(iframe);
  document.body.appendChild(modal);
  
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
}
```

---

## Marketing Copy voor BOLT

### Menu Beschrijving
```
🎬 Travel Video Generator
Maak professionele promotievideo's in minuten.
Perfect voor social media en website.
```

### Feature Highlight
```
✨ Nieuw: Video Generator
- Automatisch clips zoeken
- Voice-over toevoegen
- HD kwaliteit (720p)
- Klaar in 2 minuten
- Gratis 50 video's/maand
```

### Call-to-Action
```
Probeer de Video Generator →
Maak je eerste reis video gratis
```

---

## Voordelen voor Klanten

### Voor Website Eigenaren
- ✅ Automatisch video's van opgeslagen reizen
- ✅ Direct embedden op website
- ✅ Verhoogt conversie met visuele content

### Voor Social Media Managers
- ✅ Standalone tool, geen website nodig
- ✅ Perfect formaat voor social media
- ✅ Snel delen via WhatsApp/Email

### Voor Reisagenten
- ✅ Impress klanten met video's
- ✅ Sneller dan handmatig maken
- ✅ Professionele uitstraling

---

## Pricing Suggestie

### Gratis Tier
- 50 video's/maand
- HD kwaliteit (720p)
- Pexels clips
- Basis templates

### Pro Tier (€19/maand)
- 200 video's/maand
- Full HD (1080p)
- Premium clips (Storyblocks)
- Custom branding
- Achtergrondmuziek

### Enterprise (€99/maand)
- Onbeperkt video's
- 4K kwaliteit
- White-label
- API toegang
- Priority support

---

## Next Steps

1. ✅ Test standalone pagina lokaal
2. ✅ Deploy naar productie
3. ✅ Voeg menu item toe in BOLT
4. ✅ Maak tutorial video
5. ✅ Promoot naar klanten

---

## Support & Documentatie

- **Standalone URL**: `/video-generator.html`
- **API Docs**: `/VIDEO_GENERATOR_README.md`
- **Support**: help@jouw-domain.com
