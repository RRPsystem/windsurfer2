# 🗺️ Animated Travel Route Map

## ✨ Wat is het?

Een **geanimeerde route kaart** component dat reisroutes visualiseert met bewegende iconen (vliegtuig, auto, trein, boot) tussen bestemmingen. Gebouwd met **Mapbox GL JS** voor professionele animaties.

---

## 🎯 Features

### **Basis**
- ✅ Geanimeerde routes tussen bestemmingen
- ✅ Custom transport iconen (✈️ 🚗 🚂 ⛴️ 🚌 🚴)
- ✅ Automatische camera positioning
- ✅ Smooth animaties
- ✅ Destination markers met labels

### **Advanced**
- ✅ Arc (gebogen) routes voor vluchten
- ✅ Rechte routes voor auto/trein
- ✅ Sequential animatie (route na route)
- ✅ Play/Reset controls
- ✅ Volledig responsive

---

## 🚀 Setup

### **1. Mapbox Account Aanmaken**

1. Ga naar https://www.mapbox.com/
2. Klik "Sign up" (gratis)
3. Verifieer je email
4. Ga naar https://account.mapbox.com/access-tokens/
5. Kopieer je "Default public token"

### **2. Token Toevoegen**

**Lokaal (Development):**
```bash
cp js/config.local.example.js js/config.local.js
```

Bewerk `js/config.local.js`:
```javascript
window.MEDIA_CONFIG = {
  mapboxToken: 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsZXhhbXBsZSJ9.example'
};
```

**Vercel (Production):**
```
Environment Variables:
MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsZXhhbXBsZSJ9.example
```

---

## 🎬 Gebruik in Website Builder

### **Component Toevoegen**
1. Open website builder
2. Ga naar sidebar → "Algemeen"
3. Sleep "Geanimeerde Route Kaart" naar pagina
4. Component wordt toegevoegd met voorbeeld routes

### **Routes Aanpassen**
Via Properties Panel (rechts):
- Voeg bestemmingen toe
- Kies transport type per route
- Pas animatie snelheid aan
- Wijzig kaart stijl

---

## 💻 Programmatisch Gebruik

### **Basis Voorbeeld**
```javascript
const routes = [
  {
    from: { name: 'Amsterdam', coords: [4.9041, 52.3676] },
    to: { name: 'New York', coords: [-74.0060, 40.7128] },
    mode: 'flight',
    duration: 3000
  },
  {
    from: { name: 'New York', coords: [-74.0060, 40.7128] },
    to: { name: 'Boston', coords: [-71.0589, 42.3601] },
    mode: 'car',
    duration: 2000
  }
];

const map = new AnimatedTravelMap(container, {
  routes: routes,
  autoplay: true,
  style: 'mapbox://styles/mapbox/light-v11'
});
```

### **Transport Types**
```javascript
mode: 'flight'  // ✈️ Vliegtuig (gebogen route)
mode: 'car'     // 🚗 Auto
mode: 'train'   // 🚂 Trein
mode: 'boat'    // ⛴️ Boot
mode: 'bus'     // 🚌 Bus
mode: 'bike'    // 🚴 Fiets
```

### **Kaart Stijlen**
```javascript
style: 'mapbox://styles/mapbox/streets-v12'      // Standaard
style: 'mapbox://styles/mapbox/light-v11'        // Licht
style: 'mapbox://styles/mapbox/dark-v11'         // Donker
style: 'mapbox://styles/mapbox/satellite-v9'     // Satelliet
style: 'mapbox://styles/mapbox/outdoors-v12'     // Outdoor
```

---

## 🎥 Video Generator Integratie

### **Automatische Route Video**
```javascript
// In video generator:
const destinations = ['Amsterdam', 'New York', 'Boston'];

// Generate animated map video
const mapVideo = await generateRouteMapVideo({
  destinations: destinations,
  duration: 10, // seconds
  style: 'light'
});

// Add to Shotstack timeline
timeline.tracks.push({
  clips: [{
    asset: {
      type: 'video',
      src: mapVideo.url
    },
    start: 0,
    length: 10
  }]
});
```

### **Export Frames**
```javascript
const map = new AnimatedTravelMap(container, { routes });

// Export as video frames
const frames = await map.exportFrames(30); // 30 FPS

// Frames kunnen naar Shotstack gestuurd worden
```

---

## 📊 Voorbeelden

### **Voorbeeld 1: Europa Rondreis**
```javascript
const europeTrip = [
  {
    from: { name: 'Amsterdam', coords: [4.9041, 52.3676] },
    to: { name: 'Paris', coords: [2.3522, 48.8566] },
    mode: 'train',
    duration: 2000
  },
  {
    from: { name: 'Paris', coords: [2.3522, 48.8566] },
    to: { name: 'Rome', coords: [12.4964, 41.9028] },
    mode: 'flight',
    duration: 3000
  },
  {
    from: { name: 'Rome', coords: [12.4964, 41.9028] },
    to: { name: 'Barcelona', coords: [2.1734, 41.3851] },
    mode: 'flight',
    duration: 3000
  }
];
```

### **Voorbeeld 2: Kroatië Road Trip**
```javascript
const croatiaRoadTrip = [
  {
    from: { name: 'Zagreb', coords: [15.9819, 45.8150] },
    to: { name: 'Plitvice', coords: [15.6214, 44.8654] },
    mode: 'car',
    duration: 2000
  },
  {
    from: { name: 'Plitvice', coords: [15.6214, 44.8654] },
    to: { name: 'Split', coords: [16.4402, 43.5081] },
    mode: 'car',
    duration: 2500
  },
  {
    from: { name: 'Split', coords: [16.4402, 43.5081] },
    to: { name: 'Dubrovnik', coords: [18.0944, 42.6507] },
    mode: 'car',
    duration: 3000
  }
];
```

### **Voorbeeld 3: Wereld Reis**
```javascript
const worldTrip = [
  {
    from: { name: 'Amsterdam', coords: [4.9041, 52.3676] },
    to: { name: 'Tokyo', coords: [139.6917, 35.6895] },
    mode: 'flight',
    duration: 4000
  },
  {
    from: { name: 'Tokyo', coords: [139.6917, 35.6895] },
    to: { name: 'Sydney', coords: [151.2093, -33.8688] },
    mode: 'flight',
    duration: 4000
  },
  {
    from: { name: 'Sydney', coords: [151.2093, -33.8688] },
    to: { name: 'Los Angeles', coords: [-118.2437, 34.0522] },
    mode: 'flight',
    duration: 4000
  }
];
```

---

## 💰 Kosten

### **Mapbox Pricing**
| Tier | Map Loads | Prijs |
|------|-----------|-------|
| **Gratis** | 50.000/maand | €0 |
| **Pay as you go** | 50.001+ | $5 per 1.000 |

**Voorbeeld:**
- 100 bezoekers/dag × 30 dagen = 3.000 loads/maand
- Ruim binnen gratis tier! ✅

---

## 🎨 Customization

### **Marker Styling**
```javascript
// In animatedTravelMap.js
const markerEl = document.createElement('div');
markerEl.innerHTML = `
  <div style="
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 16px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  ">${name}</div>
`;
```

### **Route Line Styling**
```javascript
paint: {
  'line-color': '#667eea',
  'line-width': 4,
  'line-opacity': 0.9,
  'line-dasharray': [2, 2] // Dotted line
}
```

### **Animation Speed**
```javascript
// Sneller
duration: 1500 // 1.5 seconden

// Langzamer
duration: 5000 // 5 seconden
```

---

## 🐛 Troubleshooting

### **Kaart laadt niet**
```
Probleem: Witte kaart of error
Oplossing: Check Mapbox token in config.local.js
```

### **Animatie start niet**
```
Probleem: Routes worden niet geanimeerd
Oplossing: Klik op "Afspelen" knop of set autoplay: true
```

### **Iconen tonen niet**
```
Probleem: Geen transport iconen zichtbaar
Oplossing: Check of Font Awesome is geladen
```

### **Performance issues**
```
Probleem: Langzame animaties
Oplossing: 
- Reduceer aantal routes
- Gebruik 'light' map style
- Verlaag FPS bij export
```

---

## 🚀 Roadmap

### **Phase 1: Basis** ✅
- [x] Mapbox GL JS integratie
- [x] Route animaties
- [x] Transport iconen
- [x] Component in builder

### **Phase 2: Video** (TODO)
- [ ] Frame export functie
- [ ] Shotstack integratie
- [ ] Automatische route video generatie
- [ ] Voeg toe aan video generator UI

### **Phase 3: Advanced** (TODO)
- [ ] Custom route kleuren
- [ ] Multiple simultaneous routes
- [ ] 3D terrain mode
- [ ] Interactive tooltips
- [ ] Route editing in properties panel

---

## 📚 Resources

- **Mapbox Docs**: https://docs.mapbox.com/mapbox-gl-js/
- **Examples**: https://docs.mapbox.com/mapbox-gl-js/example/
- **Pricing**: https://www.mapbox.com/pricing
- **Support**: https://support.mapbox.com/

---

## ✅ Checklist

### **Setup**
- [ ] Mapbox account aangemaakt
- [ ] Token toegevoegd aan config.local.js
- [ ] Component zichtbaar in sidebar
- [ ] Test route animatie werkt

### **Customization**
- [ ] Routes aangepast naar eigen reis
- [ ] Transport types gekozen
- [ ] Kaart stijl geselecteerd
- [ ] Animatie snelheid ingesteld

### **Deployment**
- [ ] MAPBOX_TOKEN in Vercel environment variables
- [ ] Test op live site
- [ ] Performance check

---

**Veel succes met je geanimeerde route kaarten!** 🗺️✈️🚗
