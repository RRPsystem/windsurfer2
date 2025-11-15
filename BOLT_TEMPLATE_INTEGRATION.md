# BOLT Template Selector Integratie

## Overzicht

Voeg een "Quick Start Website" optie toe aan BOLT waarmee gebruikers snel een professionele reisbureau website kunnen maken met voorgebouwde templates.

## Integratie Stappen

### 1. Menu Item Toevoegen aan BOLT

Voeg een nieuwe menu optie toe in BOLT's content beheer sectie:

```javascript
// In BOLT's menu configuratie
{
    id: 'quick-start-website',
    label: '🚀 Quick Start Website',
    icon: 'rocket', // of andere passende icon
    description: 'Start snel met een professionele website template',
    action: 'openTemplateSelector',
    category: 'content',
    order: 1 // Bovenaan plaatsen voor zichtbaarheid
}
```

### 2. Template Selector URL Genereren

Wanneer gebruiker op "Quick Start Website" klikt:

```javascript
function openTemplateSelector() {
    const brandId = getCurrentBrandId(); // Huidige brand ID uit BOLT
    const token = getAuthToken(); // JWT token
    const apiKey = getSupabaseApiKey(); // Supabase anon key
    const apiUrl = 'https://huaaogdxxdcakxryecnw.supabase.co/functions/v1';
    const returnUrl = window.location.href; // Terug naar BOLT na voltooiing
    
    const params = new URLSearchParams({
        brand_id: brandId,
        token: token,
        apikey: apiKey,
        api: apiUrl,
        return_url: returnUrl
    });
    
    const url = `https://www.ai-websitestudio.nl/template-selector.html?${params.toString()}`;
    
    // Open in nieuwe tab of iframe
    window.open(url, '_blank');
    // OF
    // openInIframe(url);
}
```

### 3. Alternatief: Iframe Integratie

Voor naadloze ervaring binnen BOLT:

```javascript
function openInIframe(url) {
    // Creëer fullscreen iframe overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.cssText = `
        width: 95%;
        height: 95%;
        border: none;
        border-radius: 12px;
        background: white;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 24px;
        cursor: pointer;
        z-index: 10000;
    `;
    closeBtn.onclick = () => document.body.removeChild(overlay);
    
    overlay.appendChild(iframe);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
}
```

### 4. Return URL Handling

Wanneer gebruiker klaar is in de template selector, redirect terug naar BOLT:

```javascript
// In template-generator.html na succesvolle generatie
function returnToBolt() {
    const returnUrl = new URLSearchParams(window.location.search).get('return_url');
    
    if (returnUrl) {
        // Optioneel: stuur success bericht mee
        const successUrl = new URL(returnUrl);
        successUrl.searchParams.append('template_generated', 'true');
        successUrl.searchParams.append('template_name', templateName);
        
        window.location.href = successUrl.toString();
    }
}
```

### 5. Success Notificatie in BOLT

Toon bevestiging wanneer gebruiker terugkomt:

```javascript
// In BOLT's initialisatie
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get('template_generated') === 'true') {
    const templateName = urlParams.get('template_name');
    
    showNotification({
        type: 'success',
        title: '✅ Website Gegenereerd!',
        message: `Je ${templateName} website is succesvol aangemaakt en klaar voor gebruik.`,
        duration: 5000
    });
    
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
}
```

## UI Voorbeelden

### Menu Item in BOLT

```html
<!-- In BOLT's content menu -->
<div class="menu-section">
    <h3>Website Beheer</h3>
    
    <div class="menu-item featured" onclick="openTemplateSelector()">
        <div class="menu-icon">🚀</div>
        <div class="menu-content">
            <h4>Quick Start Website</h4>
            <p>Start snel met een professionele template</p>
            <span class="badge new">Nieuw</span>
        </div>
        <div class="menu-arrow">→</div>
    </div>
    
    <div class="menu-item" onclick="openBuilder()">
        <div class="menu-icon">🎨</div>
        <div class="menu-content">
            <h4>Custom Builder</h4>
            <p>Bouw je website vanaf scratch</p>
        </div>
        <div class="menu-arrow">→</div>
    </div>
</div>
```

### CSS Styling

```css
.menu-item.featured {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
}

.menu-item.featured:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.badge.new {
    background: #10b981;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
}
```

## Workflow Diagram

```
BOLT Dashboard
    ↓
[🚀 Quick Start Website] ← Gebruiker klikt
    ↓
Template Selector (nieuwe tab/iframe)
    ↓
Kies Template (Gotur/Tripix/etc)
    ↓
Configuratie (auto-fill brand data)
    ↓
Generatie (menu, footer, trips, kleuren)
    ↓
Resultaat
    ├─→ Preview Website
    ├─→ Open in Builder (voor aanpassingen)
    └─→ Terug naar BOLT ✅
```

## Vereiste Data in BOLT

Zorg dat BOLT de volgende data beschikbaar heeft:

```javascript
// Brand data die nodig is
const requiredBrandData = {
    id: 'uuid',                    // Brand ID
    name: 'Reisbureau Naam',       // Bedrijfsnaam
    email: 'info@example.com',     // Contact email
    phone: '+31 20 123 4567',      // Telefoon
    address: 'Straat 123, Amsterdam', // Adres
    primary_color: '#667eea',      // Primaire kleur (optioneel)
    secondary_color: '#764ba2',    // Secundaire kleur (optioneel)
    logo: 'url/to/logo.png',       // Logo URL (optioneel)
    tagline: 'Slogan'              // Tagline (optioneel)
};

// Trips data
const trips = [
    {
        id: 'uuid',
        title: 'Reis Titel',
        destination: 'Bestemming',
        hero_image: 'url/to/image.jpg',
        price: 1299,
        duration: '7 dagen',
        description: '...'
    }
    // ... meer reizen
];
```

## Security Overwegingen

### JWT Token
- Token moet geldig zijn voor Supabase API calls
- Minimale scopes: `read:brands`, `read:trips`
- Token expiry: check en refresh indien nodig

### API Key
- Gebruik Supabase anon key (public)
- RLS policies zorgen voor data isolatie
- Geen sensitive data in URL parameters

### CORS
- Zorg dat `ai-websitestudio.nl` toegang heeft tot Supabase
- Configureer CORS headers correct
- Test cross-origin requests

## Testing Checklist

- [ ] Menu item verschijnt in BOLT
- [ ] Klik opent template selector
- [ ] Brand ID wordt correct doorgegeven
- [ ] JWT token is geldig
- [ ] Brand data wordt opgehaald
- [ ] Trips worden geladen
- [ ] Template generatie werkt
- [ ] Preview functionaliteit werkt
- [ ] Return naar BOLT werkt
- [ ] Success notificatie wordt getoond

## Troubleshooting

### Template selector opent niet
```javascript
// Check console voor errors
console.log('Opening template selector...');
console.log('Brand ID:', brandId);
console.log('Token:', token ? 'Present' : 'Missing');
console.log('URL:', url);
```

### Brand data niet geladen
```javascript
// Verifieer Supabase connectie
const testUrl = `${supabaseUrl}/rest/v1/brands?id=eq.${brandId}`;
fetch(testUrl, {
    headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${token}`
    }
})
.then(r => r.json())
.then(data => console.log('Brand data:', data))
.catch(err => console.error('Error:', err));
```

### Return URL werkt niet
```javascript
// Check URL encoding
console.log('Return URL:', returnUrl);
console.log('Encoded:', encodeURIComponent(returnUrl));
```

## Voorbeeld Implementatie

### Volledige BOLT Integratie Code

```javascript
// bolt-template-integration.js

class TemplateIntegration {
    constructor(config) {
        this.supabaseUrl = config.supabaseUrl;
        this.apiKey = config.apiKey;
        this.brandId = config.brandId;
    }
    
    async openTemplateSelector() {
        try {
            // Get fresh token
            const token = await this.getAuthToken();
            
            // Build URL
            const params = new URLSearchParams({
                brand_id: this.brandId,
                token: token,
                apikey: this.apiKey,
                api: `${this.supabaseUrl}/functions/v1`,
                return_url: window.location.href
            });
            
            const url = `https://www.ai-websitestudio.nl/template-selector.html?${params.toString()}`;
            
            // Open in new tab
            const win = window.open(url, '_blank');
            
            if (!win) {
                throw new Error('Popup geblokkeerd. Sta popups toe voor deze site.');
            }
            
            // Track event
            this.trackEvent('template_selector_opened');
            
        } catch (error) {
            console.error('Error opening template selector:', error);
            this.showError(error.message);
        }
    }
    
    async getAuthToken() {
        // Implementeer token ophalen logic
        // Bijvoorbeeld via Supabase auth
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token;
    }
    
    trackEvent(eventName) {
        // Analytics tracking
        if (window.analytics) {
            window.analytics.track(eventName, {
                brand_id: this.brandId,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    showError(message) {
        // Show error notification in BOLT
        alert(message); // Replace met BOLT's notification systeem
    }
}

// Initialiseer
const templateIntegration = new TemplateIntegration({
    supabaseUrl: 'https://huaaogdxxdcakxryecnw.supabase.co',
    apiKey: 'YOUR_SUPABASE_ANON_KEY',
    brandId: getCurrentBrandId()
});

// Expose globally
window.openTemplateSelector = () => templateIntegration.openTemplateSelector();
```

## Deployment

### Stap 1: Upload Template Files
Zorg dat alle template bestanden beschikbaar zijn op `ai-websitestudio.nl`:
```
/templates/gotur/
/templates/tripix-html/
```

### Stap 2: Deploy Template System Files
```
/template-selector.html
/template-configurator.html
/template-generator.html
/js/template-generator.js
```

### Stap 3: Update BOLT
Voeg menu item en integratie code toe aan BOLT.

### Stap 4: Test
Test complete flow van BOLT → Template Selector → Generatie → Return.

## Support

Bij problemen:
1. Check browser console voor errors
2. Verifieer alle URL parameters
3. Test Supabase connectie
4. Controleer JWT token geldigheid
5. Contact development team

## Changelog

### v1.0.0 (2024-11-15)
- Initial BOLT integration
- Menu item toegevoegd
- URL parameter handling
- Return URL functionaliteit
- Success notifications
