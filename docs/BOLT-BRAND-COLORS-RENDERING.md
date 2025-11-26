# 🎨 BOLT: Brand Kleuren Toepassen bij Subdomain Rendering

## Probleem
Wanneer een pagina wordt gerenderd op een brand subdomain (bijv. `delmondetravel.ai-travelstudio.nl`):
- ✅ Aangepaste **teksten** worden correct getoond (uit HTML)
- ❌ Brand **kleuren** worden NIET toegepast (uit `brand_settings`)

## Oorzaak
De Supabase Edge Function (`website-viewer`) laadt alleen de HTML uit de `pages` tabel, maar haalt geen `brand_settings` op om CSS variabelen toe te passen.

## ✅ Oplossing voor BOLT Team

### 1. Brand Settings Ophalen

In de Edge Function `/supabase/functions/website-viewer/index.ts`:

```typescript
// Na het ophalen van de brand
const { data: brand, error: brandError } = await supabaseClient
  .from('brands')
  .select('*')
  .eq('id', brandId)
  .single();

// OOK brand_settings ophalen
const { data: brandSettings, error: settingsError } = await supabaseClient
  .from('brand_settings')
  .select('*')
  .eq('brand_id', brandId)
  .single();

console.log('Brand settings loaded:', brandSettings);
```

### 2. CSS Variabelen Injecteren

Voeg een functie toe die CSS variabelen genereert:

```typescript
function generateBrandCSS(brandSettings: any): string {
  if (!brandSettings) {
    return ''; // Geen settings = gebruik template defaults
  }

  // Haal kleuren op uit settings
  const palette = brandSettings.color_palette || 'original';
  const primaryColor = brandSettings.color_primary || '#667eea';
  const secondaryColor = brandSettings.color_secondary || '#764ba2';

  // CSS variabelen voor verschillende templates
  return `
    <style id="brand-colors">
      :root {
        /* Primary & Secondary (universeel) */
        --primary-color: ${primaryColor};
        --secondary-color: ${secondaryColor};
        
        /* Tripex/Tailwind template variabelen */
        --primary: ${primaryColor};
        --secondary: ${secondaryColor};
        --heading-color: ${primaryColor};
        --body-color: ${primaryColor};
        
        /* Button kleuren */
        --button-bg: ${primaryColor};
        --button-hover: ${secondaryColor};
        
        /* Link kleuren */
        --link-color: ${primaryColor};
        --link-hover: ${secondaryColor};
      }
      
      /* Force colors on common elements */
      .btn-primary, .theme-btn, .button-primary {
        background: ${primaryColor} !important;
        border-color: ${primaryColor} !important;
      }
      
      .btn-primary:hover, .theme-btn:hover, .button-primary:hover {
        background: ${secondaryColor} !important;
        border-color: ${secondaryColor} !important;
      }
      
      /* Heading colors */
      h1, h2, h3, h4, h5, h6,
      .heading, .section-title h2, .section-title h3 {
        color: ${primaryColor} !important;
      }
      
      /* Link colors */
      a:not(.btn):not(.button) {
        color: ${primaryColor};
      }
      
      a:not(.btn):not(.button):hover {
        color: ${secondaryColor};
      }
    </style>
  `;
}
```

### 3. CSS Injecteren in HTML

Voor het retourneren van de HTML:

```typescript
// Genereer brand CSS
const brandCSS = generateBrandCSS(brandSettings);

// Inject in <head> (voor de bestaande styles)
if (brandCSS && html.includes('</head>')) {
  html = html.replace('</head>', `${brandCSS}\n</head>`);
  console.log('✅ Brand colors injected');
} else {
  console.log('⚠️ No brand settings or <head> not found');
}

// Return de aangepaste HTML
return new Response(html, {
  headers: { 'Content-Type': 'text/html' }
});
```

### 4. Logo Toepassen (bonus)

Als de brand een logo heeft opgeslagen:

```typescript
function injectBrandLogo(html: string, brandSettings: any): string {
  if (!brandSettings?.logo_url) {
    return html;
  }

  // Vervang placeholder logo's met brand logo
  const logoReplacements = [
    'assets/images/logo.png',
    'assets/images/logo/logo.png',
    'images/logo.png',
    '/logo.png'
  ];

  let updatedHtml = html;
  for (const placeholder of logoReplacements) {
    updatedHtml = updatedHtml.replaceAll(
      `src="${placeholder}"`,
      `src="${brandSettings.logo_url}"`
    );
  }

  return updatedHtml;
}

// Gebruik:
html = injectBrandLogo(html, brandSettings);
```

### 5. Font Toepassen (bonus)

Als de brand een font heeft gekozen:

```typescript
function injectBrandFont(html: string, brandSettings: any): string {
  if (!brandSettings?.font_family) {
    return html;
  }

  const fontFamily = brandSettings.font_family;
  
  // Font import (Google Fonts)
  const fontImport = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=${fontFamily.charAt(0).toUpperCase() + fontFamily.slice(1)}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  `;

  // Font CSS
  const fontCSS = `
    <style id="brand-font">
      body, .body-text, p, div {
        font-family: '${fontFamily.charAt(0).toUpperCase() + fontFamily.slice(1)}', sans-serif !important;
      }
    </style>
  `;

  // Inject
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${fontImport}\n${fontCSS}\n</head>`);
  }

  return html;
}
```

---

## 📋 Complete Flow

```typescript
// 1. Haal brand op
const brand = await getBrand(brandSlug);

// 2. Haal brand_settings op
const brandSettings = await getBrandSettings(brand.id);

// 3. Haal pagina HTML op
let html = await getPageHTML(pageSlug, brand.id);

// 4. Inject brand styling
if (brandSettings) {
  const brandCSS = generateBrandCSS(brandSettings);
  html = html.replace('</head>', `${brandCSS}\n</head>`);
  
  // Optional: logo & font
  html = injectBrandLogo(html, brandSettings);
  html = injectBrandFont(html, brandSettings);
  
  console.log('✅ Brand styling applied');
}

// 5. Return HTML
return new Response(html, {
  headers: { 'Content-Type': 'text/html' }
});
```

---

## 🧪 Test Scenario

1. Open editor vanuit BOLT
2. Selecteer kleurenpalet "Rood" en klik "Instellingen Toepassen"
3. Klik "💾 Opslaan"
4. Open subdomain → `delmondetravel.ai-travelstudio.nl`
5. **Verwacht resultaat:** Rode kleuren overal zichtbaar
6. **Als het werkt:** Knoppen, headings, links zijn rood/rood-variant

---

## 📊 Database Schema

De `brand_settings` tabel heeft deze kolommen:

```sql
CREATE TABLE brand_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) NOT NULL,
  logo_url TEXT,
  font_family TEXT DEFAULT 'inter',
  color_palette TEXT DEFAULT 'original',
  color_primary TEXT DEFAULT '#667eea',
  color_secondary TEXT DEFAULT '#764ba2',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Opmerking:** `color_palette` is de naam (bijv. "red", "blue"), maar `color_primary` en `color_secondary` zijn de daadwerkelijke hex kleuren die moeten worden toegepast.

---

## ✅ Success Criteria

- Brand kiest kleuren in editor → worden opgeslagen ✅
- Brand bezoekt subdomain → kleuren worden toegepast ✅
- Logo & font ook correct toegepast ✅
- Werkt voor alle templates (Tripex, GoWild, etc.) ✅

---

## 🔗 Related Files

- Editor: `/simple-template-editor.html` (opslaan werkt al)
- BOLT Edge Function: `/supabase/functions/website-viewer/index.ts` (moet aangepast)
- Database: `brand_settings` tabel

---

**STATUS:** Wachtend op BOLT implementatie
**PRIORITY:** High - brand customization is core feature
