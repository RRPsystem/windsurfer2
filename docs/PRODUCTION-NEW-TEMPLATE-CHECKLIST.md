# 🎯 PRODUCTIE CHECKLIST: Nieuwe ThemeForest Template Toevoegen

**Laatst geupdate:** November 2025  
**Voor:** AI Website Studio / BOLT  
**Tijdsinvestering:** ~2-3 uur per template  

---

## ✅ PRE-FLIGHT CHECK

Voordat je begint:
- [ ] ThemeForest licentie gekocht en gedownload
- [ ] Template uitgepakt naar lokale machine
- [ ] Template getest in browser (sliders werken?)
- [ ] Budget: ~2-3 uur tijd

---

## 📥 STAP 1: Template Upload (15 min)

```bash
# 1. Unzip template
cd ~/Downloads
unzip template-name.zip

# 2. Verplaats naar project
cp -r template-folder/* /templates/[template-slug]/

# 3. Check structuur
ls /templates/[template-slug]/
# Verwacht: index.html, about.html, assets/, etc.
```

**Checklist:**
- [ ] Alle HTML bestanden aanwezig
- [ ] /assets/css/ folder aanwezig
- [ ] /assets/js/ folder aanwezig
- [ ] /assets/images/ folder aanwezig
- [ ] Template opent in browser

---

## 🔍 STAP 2: Dependency Analyse (30 min)

### 2A. Open index.html en zoek:

```bash
# In VSCode of text editor:
# Zoek naar deze patronen in <head> en voor </body>:
```

**CSS Dependencies:**
```html
<link rel="stylesheet" href="...slick.css">          → Slick Slider
<link rel="stylesheet" href="...owl.carousel.css">   → Owl Carousel
<link rel="stylesheet" href="...swiper.css">         → Swiper
<link rel="stylesheet" href="...aos.css">            → AOS Animations
<link rel="stylesheet" href="...bootstrap.css">      → Bootstrap
```

**JS Dependencies:**
```html
<script src="...jquery.js"></script>                 → jQuery (versie?)
<script src="...slick.min.js"></script>              → Slick
<script src="...theme.js"></script>                  → ⚠️ BELANGRIJK!
<script src="...main.js"></script>                   → ⚠️ BELANGRIJK!
```

### 2B. Maak Dependencies List

**Create:** `/templates/[template-slug]/DEPENDENCIES.txt`

```
Template: [Template Name]
Gekocht: [Datum]
ThemeForest Link: [URL]

CSS:
- Bootstrap 5.3.0
- Slick Slider 1.8.1
- Font Awesome 6.0.0
- AOS 2.3.4

JS:
- jQuery 3.6.0
- Slick Slider 1.8.1
- Bootstrap Bundle 5.3.0

Init Scripts:
- /assets/js/theme.js (MAIN INIT FILE!)
- /assets/js/main.js
```

**Checklist:**
- [ ] Alle CSS dependencies genoteerd
- [ ] Alle JS dependencies genoteerd
- [ ] jQuery versie gevonden
- [ ] Main init file gevonden (theme.js / main.js)

---

## 🎠 STAP 3: Slider Analyse (45 min)

### 3A. Vind Slider Type

```bash
# Open assets/js/theme.js of main.js
# Zoek naar:

# Slick Slider:
grep -n "\.slick(" assets/js/theme.js

# Owl Carousel:
grep -n "\.owlCarousel(" assets/js/theme.js

# Swiper:
grep -n "new Swiper(" assets/js/theme.js
```

### 3B. Vind Alle Slider Selectors

**Voorbeeld uit theme.js:**
```javascript
// Dit vinden:
$('.hero-slider').slick({ ... });
$('.tour-slider').slick({ ... });
$('.testimonial-slider').slick({ ... });

// Noteer selectors:
// - .hero-slider
// - .tour-slider  
// - .testimonial-slider
```

### 3C. Kopieer Complete Init Code

**Create:** `/widgets/slider-init-[template-slug].js`

```javascript
// [Template Name] Slider Initialization
// Generated: [Datum]

(function($) {
    'use strict';
    
    $(document).ready(function() {
        console.log('[Slider Init] Starting [template-name]...');
        
        // Destroy existing sliders
        try {
            $('.slick-initialized').slick('unslick');
        } catch(e) {
            // Ignore
        }
        
        // KOPIEER HIER ALLE SLIDER INIT CODE UIT theme.js
        // Voorbeeld:
        
        if ($('.hero-slider').length && !$('.hero-slider').hasClass('slick-initialized')) {
            $('.hero-slider').slick({
                dots: false,
                arrows: true,
                infinite: true,
                speed: 800,
                fade: true,
                autoplay: true,
                slidesToShow: 1,
                slidesToScroll: 1
            });
            console.log('[Slider Init] ✅ hero-slider');
        }
        
        // Herhaal voor ALLE sliders...
        
        console.log('[Slider Init] ✅ All sliders initialized!');
    });
})(window.jQuery);
```

**Checklist:**
- [ ] Slider type geïdentificeerd (Slick/Owl/Swiper)
- [ ] Alle slider selectors gevonden
- [ ] Complete init code gekopieerd naar /widgets/slider-init-[slug].js
- [ ] Console.log statements toegevoegd
- [ ] Script getest in browser console

---

## 🍔 STAP 4: Menu Analyse (30 min)

### 4A. Vind Menu HTML

Open index.html en zoek menu structuur:

```html
<!-- Voorbeeld 1: -->
<nav class="main-menu">
  <ul>
    <li><a href="index.html">Home</a></li>
    <li><a href="about.html">About</a></li>
  </ul>
</nav>

<!-- Voorbeeld 2: -->
<div class="header-navigation">
  <div class="nav-menu">
    <ul>
      <li><a href="index.html">Home</a></li>
    </ul>
  </div>
</div>
```

### 4B. Noteer Menu Selector

**In Browser Console test:**
```javascript
// Test verschillende selectors:
document.querySelector('.main-menu nav ul')
document.querySelector('.nav-menu ul')
document.querySelector('nav.main-menu ul')

// De selector die het <ul> element vindt is de juiste!
```

### 4C. Update Menu Config

**Noteer in DEPENDENCIES.txt:**
```
Menu Selector: .main-menu nav ul
Menu Structure: <li><a href="{{url}}">{{title}}</a></li>
Active Class: active (toegevoegd aan <li>)
```

**Checklist:**
- [ ] Menu selector gevonden
- [ ] Menu HTML structuur genoteerd
- [ ] Active class geïdentificeerd
- [ ] Selector getest in browser console

---

## 📝 STAP 5: Template Config File (30 min)

**Create:** `/templates/[template-slug]/config.json`

```json
{
  "template_name": "TemplateName",
  "template_slug": "template-slug",
  "themeforest_url": "https://themeforest.net/item/...",
  "version": "1.0",
  "date_added": "2025-11-26",
  "dependencies": {
    "jquery": "3.6.0",
    "bootstrap": "5.3.0",
    "slick-slider": "1.8.1",
    "font-awesome": "6.0.0",
    "aos": "2.3.4"
  },
  "cdn_links": {
    "css": [
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
      "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
    ],
    "js": [
      "https://code.jquery.com/jquery-3.6.0.min.js",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
      "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"
    ]
  },
  "menu": {
    "selector": ".main-menu nav ul",
    "item_template": "<li><a href='{{url}}'>{{title}}</a></li>",
    "active_class": "active"
  },
  "sliders": [
    {
      "name": "Hero Slider",
      "selector": ".hero-slider",
      "type": "slick"
    },
    {
      "name": "Tour Slider",
      "selector": ".tour-slider",
      "type": "slick"
    }
  ],
  "pages": [
    { "file": "index.html", "slug": "home", "title": "Home", "show_in_menu": true, "menu_order": 1 },
    { "file": "about.html", "slug": "about", "title": "About", "show_in_menu": true, "menu_order": 2 },
    { "file": "tours.html", "slug": "tours", "title": "Tours", "show_in_menu": true, "menu_order": 3 },
    { "file": "contact.html", "slug": "contact", "title": "Contact", "show_in_menu": true, "menu_order": 4 }
  ]
}
```

**Checklist:**
- [ ] config.json aangemaakt
- [ ] Alle dependencies genoteerd met versienummers
- [ ] CDN links toegevoegd
- [ ] Menu config compleet
- [ ] Alle pagina's genoteerd

---

## 🔌 STAP 6: Template API Update (15 min)

**Edit:** `/api/templates/list.js`

Voeg template toe aan export:

```javascript
const templates = {
  // ... bestaande templates (gowild, tripex)
  
  'template-slug': {
    name: 'TemplateName',
    category: 'template-slug',
    description: 'Modern travel & tours template',
    preview_url: 'https://www.ai-websitestudio.nl/templates/template-slug/index.html',
    themeforest_url: 'https://themeforest.net/item/...',
    dependencies: {
      jquery: '3.6.0',
      'slick-slider': '1.8.1',
      bootstrap: '5.3.0'
    },
    pages: [
      { name: 'index', title: 'Home', path: 'index.html', show_in_menu: true, menu_order: 1 },
      { name: 'about', title: 'About Us', path: 'about.html', show_in_menu: true, menu_order: 2 },
      { name: 'tours', title: 'Tours', path: 'tours.html', show_in_menu: true, menu_order: 3 },
      { name: 'contact', title: 'Contact', path: 'contact.html', show_in_menu: true, menu_order: 4 }
    ]
  }
};
```

**Checklist:**
- [ ] Template toegevoegd aan /api/templates/list.js
- [ ] Alle pagina's toegevoegd met correct menu_order
- [ ] Preview URL correct

---

## 📚 STAP 7: BOLT Documentatie (15 min)

**Create:** `/docs/BOLT-TEMPLATE-[SLUG].md`

```markdown
# [TemplateName] Setup voor BOLT

**Template:** [TemplateName]  
**ThemeForest:** [Link]  
**Toegevoegd:** [Datum]  

## Dependencies

Inject in Website Viewer voor `</body>`:

\```html
<!-- jQuery -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- Bootstrap -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- Slick Slider -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css">
<script src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"></script>

<!-- Template Slider Init -->
<script src="https://www.ai-websitestudio.nl/widgets/slider-init-[slug].js"></script>
\```

## Menu Selector

\```
.main-menu nav ul
\```

## Sliders

- `.hero-slider` - Main hero carousel
- `.tour-slider` - Tours grid
- `.testimonial-slider` - Client testimonials

## Pages

1. Home (index.html)
2. About (about.html)
3. Tours (tours.html)
4. Contact (contact.html)
```

**Checklist:**
- [ ] BOLT doc aangemaakt
- [ ] Dependencies sectie compleet
- [ ] Menu selector gedocumenteerd
- [ ] Alle sliders gedocumenteerd

---

## 🧪 STAP 8: Testing (30 min)

### 8A. Test Template API

```bash
# Test 1: Template lijst
curl https://www.ai-websitestudio.nl/api/templates/list | jq '.templates["template-slug"]'

# Test 2: HTML content
curl https://www.ai-websitestudio.nl/api/templates/template-slug/index
```

### 8B. Test in BOLT

1. Login BOLT admin: https://www.ai-travelstudio.nl
2. Ga naar Template Import
3. Selecteer nieuwe template
4. Import alle pagina's
5. Check database:
   ```sql
   SELECT title, slug, show_in_menu, menu_order 
   FROM pages 
   WHERE brand_id = 'TEST_BRAND_ID'
   ORDER BY menu_order;
   ```

### 8C. Test Live Website

1. Open: `https://test-brand.ai-websitestudio.nl/api/page/home`
2. Open Browser Console (F12)
3. Check:
   - [ ] Geen JavaScript errors
   - [ ] `✅ Universal sliders initialized` in console
   - [ ] `✅ Dynamic menu injected` in console
   - [ ] Sliders werken (slides bewegen)
   - [ ] Menu links klikbaar
   - [ ] Navigatie tussen pagina's werkt

**Checklist:**
- [ ] Template API werkt
- [ ] BOLT kan template importeren
- [ ] Pages in database met juiste velden
- [ ] Live website laadt
- [ ] Sliders werken
- [ ] Menu werkt
- [ ] Navigatie werkt

---

## 🚀 STAP 9: Deploy naar Productie (15 min)

```bash
# 1. Add alle nieuwe files
git add templates/[template-slug]/
git add widgets/slider-init-[slug].js
git add api/templates/list.js
git add docs/BOLT-TEMPLATE-[SLUG].md

# 2. Commit
git commit -m "Add [TemplateName] template support

- Template files uploaded
- Slider init script created
- Template API updated
- BOLT documentation added
- Config file created

Ready for production use."

# 3. Push
git push origin main

# 4. Wait for Vercel deployment (~2 min)
# Check: https://vercel.com/[your-project]/deployments

# 5. Verify production
curl https://www.ai-websitestudio.nl/api/templates/list | grep template-slug
```

**Checklist:**
- [ ] Alle files gecommit
- [ ] Gepushed naar GitHub
- [ ] Vercel deployment succesvol
- [ ] Template beschikbaar in productie

---

## 📋 POST-DEPLOY CHECKLIST

**Direct na deployment:**
- [ ] Template zichtbaar in BOLT template lijst
- [ ] Test import met test brand
- [ ] Live website werkt met nieuwe template
- [ ] Documentatie toegankelijk voor team

**Email naar BOLT team:**
```
Subject: Nieuwe Template Beschikbaar: [TemplateName]

Hi team,

Nieuwe template is live! 🎉

Template: [TemplateName]
URL: /api/templates/template-slug
Documentatie: /docs/BOLT-TEMPLATE-[SLUG].md

Dependencies auto-injecteren:
- jQuery 3.6.0
- Slick Slider 1.8.1
- Template init script

Alles getest en production ready!
```

---

## 🔧 TROUBLESHOOTING

### Sliders werken niet
1. Check browser console voor errors
2. Verify jQuery loaded: `typeof jQuery !== 'undefined'`
3. Verify Slick loaded: `typeof $.fn.slick !== 'undefined'`
4. Check selector: `$('.hero-slider').length > 0`
5. Check init: `$('.hero-slider').hasClass('slick-initialized')`

### Menu niet dynamisch
1. Check console: `✅ Dynamic menu injected`?
2. Test selector: `document.querySelector('.main-menu nav ul')`
3. Check pages in database: `show_in_menu = true`?

### Pagina's niet vindbaar
1. Check slug in database (geen leading slash!)
2. Test API: `/api/page/[slug]`
3. Check status: `published`

---

## 📞 SUPPORT

**Bij problemen:**
1. Check deze checklist opnieuw
2. Review `/docs/BOLT-TEMPLATE-[SLUG].md`
3. Check `/templates/[slug]/DEPENDENCIES.txt`
4. Test met browser DevTools
5. Email ontwikkelaar met specifieke error

---

## ✅ FINALE CHECKLIST

**Template is production-ready als:**
- [x] Config file compleet
- [x] Dependencies gedocumenteerd
- [x] Slider init script werkt
- [x] Menu selector correct
- [x] Template API updated
- [x] BOLT doc aangemaakt
- [x] Testing compleet
- [x] Deployed naar productie
- [x] BOLT team geïnformeerd

**🎉 KLAAR! Template is nu beschikbaar voor alle brands!**

---

**Versie:** 1.0  
**Laatst getest:** November 2025  
**Volgende review:** Over 6 maanden

---

**📍 Online Checklist:** https://www.ai-websitestudio.nl/api/checklist
