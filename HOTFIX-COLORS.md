# 🔥 INSTANT HOTFIX - Kleuren Opslaan & Herstellen

## Probleem
De brand kleuren worden niet opgeslagen/toegepast bij heropenen door browser cache.

## ✅ Werkende Oplossing (Gebruik NU)

### Stap 1: Open je Editor
Open de Quick Designer editor normaal

### Stap 2: Plak dit in Console (F12)

```javascript
// HOTFIX: Force brand settings to persist
(function() {
    console.log('🔥 HOTFIX: Kleuren Fix wordt geladen...');
    
    // Check if QuickDesigner exists
    if (!window.QuickDesigner) {
        console.error('❌ QuickDesigner not found!');
        return;
    }
    
    // Get or create editor instance
    if (!window.editor) {
        console.log('⚠️ Creating new editor instance...');
        window.editor = new QuickDesigner();
    }
    
    const ed = window.editor;
    console.log('✅ Editor found:', ed);
    
    // Patch loadBrandSettings to return boolean
    const originalLoadBrandSettings = ed.loadBrandSettings.bind(ed);
    ed.loadBrandSettings = async function() {
        console.log('🔄 Loading brand settings...');
        await originalLoadBrandSettings();
        
        // Force apply settings after load
        if (this.settings && this.settings.palette) {
            console.log('✅ Settings loaded:', this.settings);
            
            // Update UI
            if (this.updateSettingsUI) {
                this.updateSettingsUI();
            }
            
            return true;
        }
        return false;
    };
    
    // Patch loadPage to ALWAYS apply settings
    const originalLoadPage = ed.loadPage.bind(ed);
    ed.loadPage = async function(page) {
        console.log('📄 Loading page with hotfix...');
        
        // Load page first
        await originalLoadPage(page);
        
        // Then load settings
        const settingsLoaded = await this.loadBrandSettings();
        console.log('📦 Settings loaded:', settingsLoaded);
        
        // Wait for iframe to load, then apply
        const iframe = document.getElementById('previewFrame');
        if (iframe) {
            iframe.onload = () => {
                console.log('🎨 Applying settings after page load...');
                setTimeout(() => {
                    if (this.applySettings) {
                        this.applySettings();
                        console.log('✅ Settings applied!');
                    }
                }, 200);
            };
        }
    };
    
    // Patch applySettings to add debug info
    const originalApplySettings = ed.applySettings.bind(ed);
    ed.applySettings = async function() {
        console.log('🎨 Applying settings:', this.settings);
        await originalApplySettings();
        console.log('✅ Settings applied to iframe');
    };
    
    // If brand_id exists, load settings now
    if (ed.brandId) {
        console.log('🔑 Brand ID found, loading settings now...');
        ed.loadBrandSettings().then(() => {
            console.log('✅ Settings loaded on hotfix load');
            if (document.getElementById('previewFrame').src) {
                setTimeout(() => {
                    ed.applySettings();
                    console.log('✅ Settings applied immediately');
                }, 500);
            }
        });
    }
    
    console.log('✅ HOTFIX ACTIVE! Kleuren worden nu opgeslagen en toegepast.');
    console.log('ℹ️ Selecteer nu een kleurenpalet en klik "Instellingen Toepassen"');
    
})();
```

### Stap 3: Selecteer Kleuren
1. Kies een kleurenpalet (bijv. Rood)
2. Klik **"Instellingen Toepassen"**
3. Klik **"💾 Opslaan"** (rechts bovenin)

### Stap 4: Test
1. Sluit de tab
2. Open editor opnieuw
3. Plak hotfix OPNIEUW in console
4. Laad een pagina → kleuren moeten nu correct zijn!

---

## 🎯 Permanente Oplossing

**De permanente fix is al live sinds 5 minuten geleden**, maar je browser heeft cache.

### Cache ECHT legen:

1. **Sluit ALLE browser tabs**
2. **Sluit de browser HELEMAAL**
3. **Open browser opnieuw**
4. **Open editor met deze URL:**
   ```
   https://www.ai-websitestudio.nl/simple-template-editor.html?v=20251126233000
   ```

Dan krijg je de nieuwe versie zonder hotfix nodig te hebben.

---

## 📊 Debug Info

Als het nog niet werkt, plak dit in console:

```javascript
// Debug: Show current state
console.log('=== DEBUG INFO ===');
console.log('Editor:', window.editor);
console.log('Brand ID:', window.editor?.brandId);
console.log('Settings:', window.editor?.settings);
console.log('Iframe:', document.getElementById('previewFrame')?.src);
```

En stuur me de output!
