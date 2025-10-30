# 🔍 Filter Systeem voor Reizen

## 🎯 Overzicht

Het filter systeem bestaat uit 3 onderdelen:
1. **Travel Filter Bar** - Standalone filter component
2. **Filter Presets** - Voor specifieke pagina's
3. **Auto-generated filters** - Uit database tags

---

## 📦 1. Travel Filter Bar Component

### Wat is het?

Een herbruikbaar filter component dat je op elke pagina kunt plaatsen.

```
┌─────────────────────────────────────┐
│         Filter Reizen               │
│                                     │
│  [Alle] [Strand] [Rondreis]        │
│  [Stedentrip] [Safari] [Cultuur]   │
│  [Natuur] [Avontuur] [Luxe]        │
└─────────────────────────────────────┘
```

### Hoe te gebruiken:

**In Builder:**
1. Ga naar "Reis Componenten"
2. Sleep "🔍 Reis Filters" naar pagina
3. Plaats boven of onder Travel Overview

**Filters aanpassen:**
1. Klik op component
2. Properties panel opent
3. Voeg filters toe of verwijder ze
4. Filters worden automatisch gekoppeld aan Travel Overview

### Standaard Filters:

- Alle
- Strand
- Rondreis
- Stedentrip
- Safari
- Cultuur
- Natuur
- Avontuur
- Luxe

---

## 🎨 2. Filter Presets

### Wat zijn het?

Vooraf ingestelde filters voor specifieke pagina's.

### Use Cases:

**Voorbeeld 1: Strandvakanties Pagina**
```
URL: /strandvakanties
Travel Overview: Filter Preset = "Strand"
Resultaat: Toont alleen strandvakanties
```

**Voorbeeld 2: Rondreizen Pagina**
```
URL: /rondreizen
Travel Overview: Filter Preset = "Rondreis"
Resultaat: Toont alleen rondreizen
```

**Voorbeeld 3: Luxe Reizen Pagina**
```
URL: /luxe-reizen
Travel Overview: Filter Preset = "Luxe"
Resultaat: Toont alleen luxe reizen
```

### Hoe instellen:

1. Klik op Travel Overview component
2. Properties panel → "Filter Preset"
3. Kies gewenste filter
4. Filter wordt automatisch toegepast bij page load

### Beschikbare Presets:

- Geen (toon alle reizen)
- Alleen Strandvakanties
- Alleen Rondreizen
- Alleen Stedentrips
- Alleen Safari's
- Alleen Cultuur
- Alleen Natuur
- Alleen Avontuur
- Alleen Luxe

---

## 🏷️ 3. Tags Systeem

### Hoe werkt het?

Reizen hebben `tags` in de database:

```javascript
{
  "title": "Thailand Strandvakantie",
  "tags": "strand,tropisch,luxe,zomer"
}
```

### Filter Matching:

```javascript
// Gebruiker klikt "Strand" filter
// Systeem zoekt reizen waar tags "strand" bevat
// Thailand reis matched! ✅

// Gebruiker klikt "Safari" filter  
// Thailand reis matched NIET ❌
```

### Tags Toevoegen:

**Optie A: Via Travel Compositor**
```
Travel Compositor themes worden automatisch geconverteerd:
themes: [{ name: "Strand" }, { name: "Luxe" }]
→ tags: "strand,luxe"
```

**Optie B: Handmatig in BOLT**
```sql
UPDATE travels 
SET tags = 'strand,tropisch,luxe' 
WHERE id = '...';
```

**Optie C: Via Builder (toekomstig)**
```
Properties panel → Tags → Voeg toe
```

---

## 🔄 Complete Flow

### Scenario: Gebruiker zoekt strandvakanties

```
1. Gebruiker komt op homepage
   ↓
2. Ziet Travel Filter Bar component
   ↓
3. Klikt op "Strand" filter
   ↓
4. Filter Bar dispatcht event: travelFilterChange
   ↓
5. Travel Overview luistert naar event
   ↓
6. Travel Overview filtert reizen:
   - Thailand (tags: "strand,tropisch") ✅
   - Safari Tanzania (tags: "safari,natuur") ❌
   - Barcelona (tags: "stedentrip,strand") ✅
   ↓
7. Alleen strand reizen zichtbaar
   ↓
8. Smooth scroll naar resultaten
```

---

## 🎯 Use Cases

### Use Case 1: Algemene Reizen Pagina

```
Pagina: /reizen
Componenten:
- Hero Travel Search (zoekformulier)
- Travel Filter Bar (alle filters)
- Travel Overview (alle reizen)

Gedrag:
- Gebruiker kan alle filters gebruiken
- Alle reizen zichtbaar
- Zoeken + filteren werkt
```

### Use Case 2: Specifieke Categorie Pagina

```
Pagina: /strandvakanties
Componenten:
- Kleine Hero ("Onze Strandvakanties")
- Travel Overview (preset: "Strand")

Gedrag:
- Alleen strandvakanties zichtbaar
- Filter is vooraf ingesteld
- Gebruiker kan niet naar andere categorieën
```

### Use Case 3: Homepage met Quick Filters

```
Pagina: /
Componenten:
- Hero Travel Search
- Travel Filter Bar (populaire filters)
- Featured Reizen (3 kaarten)

Gedrag:
- Klikken op filter → redirect naar /reizen?filter=strand
- Featured reizen altijd zichtbaar
- Quick access tot categorieën
```

---

## 🛠️ Technische Details

### Event System:

```javascript
// Filter Bar dispatcht event
document.dispatchEvent(new CustomEvent('travelFilterChange', {
  bubbles: true,
  detail: { filter: 'strand' }
}));

// Travel Overview luistert
document.addEventListener('travelFilterChange', (event) => {
  const filter = event.detail.filter;
  applyFilter(filter);
});
```

### Filter Logic:

```javascript
// In Travel Overview
function filterTravels(filter) {
  const cards = document.querySelectorAll('.travel-card');
  
  cards.forEach(card => {
    const tags = card.dataset.tags || '';
    
    if (filter === 'alle' || tags.includes(filter)) {
      card.style.display = 'block'; // Toon
    } else {
      card.style.display = 'none'; // Verberg
    }
  });
}
```

### URL Parameters:

```javascript
// Van Hero Search naar /reizen met filter
window.location.href = '/reizen?filter=strand';

// Travel Overview leest parameter
const urlParams = new URLSearchParams(window.location.search);
const filter = urlParams.get('filter');
if (filter) applyFilter(filter);
```

---

## 📋 Setup Checklist

### Voor Algemene Reizen Pagina:
- [ ] Maak `/reizen` pagina
- [ ] Voeg Travel Filter Bar toe (optioneel)
- [ ] Voeg Travel Overview toe
- [ ] Test filters werken
- [ ] Test zoeken werkt

### Voor Categorie Pagina:
- [ ] Maak specifieke pagina (bijv. `/strandvakanties`)
- [ ] Voeg Travel Overview toe
- [ ] Stel Filter Preset in op "Strand"
- [ ] Test alleen strandvakanties zichtbaar
- [ ] Voeg custom hero toe met categorie naam

### Voor Homepage:
- [ ] Voeg Hero Travel Search toe
- [ ] Voeg Travel Filter Bar toe (optioneel)
- [ ] Link filters naar `/reizen` pagina
- [ ] Test redirect werkt

---

## 🎨 Styling

### Filter Buttons:

**Default State:**
```css
border: 2px solid #e5e7eb;
background: white;
color: #374151;
```

**Active State:**
```css
border: 2px solid #667eea;
background: #667eea;
color: white;
```

**Hover State:**
```css
border: 2px solid #667eea;
color: #667eea;
```

### Customization:

Alle styling is inline, dus makkelijk aan te passen in properties panel of direct in code.

---

## 🐛 Troubleshooting

### Probleem: Filters werken niet

**Oplossing:**
1. Check of Travel Overview op pagina staat
2. Check of reizen `tags` hebben in database
3. Check console voor errors
4. Verifieer tags zijn lowercase

### Probleem: Geen reizen na filteren

**Oplossing:**
1. Check of reizen de juiste tags hebben
2. Bijv. filter "strand" vereist tag "strand" in database
3. Controleer: `SELECT * FROM travels WHERE tags LIKE '%strand%';`

### Probleem: Filter Preset werkt niet

**Oplossing:**
1. Check of `data-filter-preset` attribute is gezet
2. Refresh pagina na preset wijzigen
3. Check of filter naam exact matched met tag

---

## 🚀 Toekomstige Features

### Geplande Verbeteringen:

- [ ] Multi-select filters (bijv. "Strand + Luxe")
- [ ] Filter counts (bijv. "Strand (12)")
- [ ] Saved filters in localStorage
- [ ] Filter URL sharing
- [ ] Advanced filters (prijs range, duur, etc.)
- [ ] Filter analytics tracking
- [ ] Custom filter colors per categorie

---

## 📊 Voorbeeld Pagina Structuren

### Structuur 1: Alles op 1 Pagina
```
/reizen
├─ Hero Travel Search
├─ Travel Filter Bar
└─ Travel Overview
```

### Structuur 2: Aparte Pagina's
```
/ (homepage)
├─ Hero Travel Search
└─ Travel Filter Bar (links naar /reizen)

/reizen
├─ Travel Filter Bar
└─ Travel Overview

/strandvakanties
└─ Travel Overview (preset: strand)

/rondreizen
└─ Travel Overview (preset: rondreis)
```

### Structuur 3: Homepage + Categorie
```
/ (homepage)
├─ Hero Travel Search
├─ Featured Reizen (3 kaarten)
└─ Travel Filter Bar (quick links)

/reizen
├─ Travel Filter Bar
└─ Travel Overview (alle reizen)

/strandvakanties
├─ Hero Banner ("Strandvakanties")
└─ Travel Overview (preset: strand)
```

---

**Perfect filter systeem voor professionele reiswebsite!** 🎯🔍✨
