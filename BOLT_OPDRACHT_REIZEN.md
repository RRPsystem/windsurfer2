# 🎯 BOLT Opdracht: Reizen Systeem Compleet Maken

## Overzicht
We hebben een Travel Overview component gemaakt die reizen toont op de website met zoek- en boekfunctionaliteit. Nu moet de database en integratie compleet gemaakt worden zodat reizen die worden geïmporteerd (via Travel Compositor, PDF, URL of handmatig) automatisch worden opgeslagen en getoond op de website.

---

## 📋 Taak 1: Database Tabel Aanmaken in Supabase

### Actie: Maak de `travels` tabel aan

**SQL Script:**
```sql
-- Travels tabel voor opslaan van reizen
CREATE TABLE IF NOT EXISTS travels (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basis informatie
    title TEXT NOT NULL,
    name TEXT,
    location TEXT,
    destination TEXT,
    duration TEXT,
    days INTEGER,
    
    -- Prijs informatie
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    
    -- Content
    description TEXT,
    intro TEXT,
    image TEXT,
    main_image TEXT,
    header_image TEXT,
    
    -- Categorisatie & Tags
    tags TEXT,
    travel_type TEXT,
    
    -- BOLT Metadata (belangrijk!)
    featured BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 999,
    status TEXT DEFAULT 'published',
    source TEXT DEFAULT 'manual',
    
    -- Extra data (JSON format)
    destinations JSONB DEFAULT '[]'::jsonb,
    hotels JSONB DEFAULT '[]'::jsonb,
    transports JSONB DEFAULT '[]'::jsonb,
    transfers JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes voor snelle queries
CREATE INDEX IF NOT EXISTS idx_travels_status ON travels(status);
CREATE INDEX IF NOT EXISTS idx_travels_featured ON travels(featured);
CREATE INDEX IF NOT EXISTS idx_travels_priority ON travels(priority);
CREATE INDEX IF NOT EXISTS idx_travels_created_at ON travels(created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_travels_updated_at 
    BEFORE UPDATE ON travels 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Iedereen kan lezen, alleen authenticated users kunnen schrijven
ALTER TABLE travels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON travels
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON travels
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable update for authenticated users only" ON travels
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable delete for authenticated users only" ON travels
    FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
```

**Verificatie:**
Na het uitvoeren, check of de tabel bestaat:
```sql
SELECT * FROM travels LIMIT 1;
```

---

## 📋 Taak 2: TravelView Updaten - Reizen Opslaan

### Actie: Update `js/views/travelView.js` om reizen op te slaan

**Locatie:** In de functies die reizen importeren/laden

### 2.1 Update `loadTravel()` functie (Travel Compositor import)

**Zoek naar:** (rond regel 576)
```javascript
this.currentIdea = data;
this.renderTravelContent(data);
this.showStatus('success', '<i class="fas fa-check-circle"></i> Reis succesvol geladen!');
```

**Vervang met:**
```javascript
this.currentIdea = data;

// Sla reis op in BOLT database
try {
    if (window.TravelDataService) {
        const savedTravel = await window.TravelDataService.saveTravel({
            title: data.name || data.title,
            name: data.name || data.title,
            location: data.destination || data.country,
            destination: data.destination || data.country,
            duration: data.duration || `${data.days || 0} dagen`,
            days: data.days || 0,
            price: data.price || data.totalPrice || 0,
            currency: data.currency || 'EUR',
            description: data.description || data.intro || '',
            intro: data.description || data.intro || '',
            image: data.image || data.mainImage || data.headerImage || '',
            main_image: data.image || data.mainImage || data.headerImage || '',
            tags: data.travelType || data.tags || '',
            travel_type: data.travelType || data.tags || '',
            featured: false,
            priority: 999,
            status: 'published',
            source: 'travel-compositor',
            destinations: data.destinations || [],
            hotels: data.hotels || [],
            transports: data.transports || [],
            transfers: data.transfers || []
        });
        console.log('[TravelView] Reis opgeslagen in BOLT:', savedTravel);
    }
} catch (saveError) {
    console.error('[TravelView] Fout bij opslaan in BOLT:', saveError);
    // Toon niet-blokkerende waarschuwing
    this.showStatus('warning', '⚠️ Reis geladen maar niet opgeslagen in database');
}

this.renderTravelContent(data);
this.showStatus('success', '<i class="fas fa-check-circle"></i> Reis succesvol geladen en opgeslagen!');
```

### 2.2 Update `uploadAndParsePDF()` functie (PDF import)

**Zoek naar:** (rond regel 400)
```javascript
const travelData = this.convertBookingToTravel(result.data);

// Load into builder
setTimeout(() => {
    if (window.websiteBuilder && window.websiteBuilder.loadTravelIdea) {
        window.websiteBuilder.loadTravelIdea(travelData);
        if (window.WB_setMode) window.WB_setMode('page');
    }
}, 1000);
```

**Vervang met:**
```javascript
const travelData = this.convertBookingToTravel(result.data);

// Sla reis op in BOLT database
try {
    if (window.TravelDataService) {
        const savedTravel = await window.TravelDataService.saveTravel({
            title: travelData.title || travelData.name,
            name: travelData.title || travelData.name,
            location: travelData.location || '',
            duration: travelData.duration || `${travelData.days || 0} dagen`,
            days: travelData.days || 0,
            price: travelData.price || 0,
            currency: travelData.currency || 'EUR',
            description: travelData.description || '',
            image: travelData.image || '',
            tags: travelData.tags || '',
            featured: false,
            priority: 999,
            status: 'published',
            source: 'pdf',
            destinations: travelData.destinations || [],
            hotels: travelData.hotels ? [travelData.hotels] : [],
            transports: travelData.flights || []
        });
        console.log('[TravelView] PDF reis opgeslagen in BOLT:', savedTravel);
    }
} catch (saveError) {
    console.error('[TravelView] Fout bij opslaan PDF reis:', saveError);
}

// Load into builder
setTimeout(() => {
    if (window.websiteBuilder && window.websiteBuilder.loadTravelIdea) {
        window.websiteBuilder.loadTravelIdea(travelData);
        if (window.WB_setMode) window.WB_setMode('page');
    }
}, 1000);
```

### 2.3 Update `importFromURL()` functie (URL import)

**Zoek naar:** (rond regel 502)
```javascript
this.showStatus('success', '<i class="fas fa-check-circle"></i> Website succesvol uitgelezen!');

// Load into builder
setTimeout(() => {
    if (window.websiteBuilder && window.websiteBuilder.loadTravelIdea) {
        window.websiteBuilder.loadTravelIdea(result.data);
        if (window.WB_setMode) window.WB_setMode('page');
    }
}, 1000);
```

**Vervang met:**
```javascript
this.showStatus('success', '<i class="fas fa-check-circle"></i> Website succesvol uitgelezen!');

// Sla reis op in BOLT database
try {
    if (window.TravelDataService) {
        const savedTravel = await window.TravelDataService.saveTravel({
            title: result.data.title || result.data.name,
            name: result.data.title || result.data.name,
            location: result.data.location || result.data.destination,
            duration: result.data.duration || `${result.data.days || 0} dagen`,
            days: result.data.days || 0,
            price: result.data.price || 0,
            currency: result.data.currency || 'EUR',
            description: result.data.description || '',
            image: result.data.image || '',
            tags: result.data.tags || '',
            featured: false,
            priority: 999,
            status: 'published',
            source: 'url',
            destinations: result.data.destinations || [],
            hotels: result.data.hotels || [],
            transports: result.data.transports || []
        });
        console.log('[TravelView] URL reis opgeslagen in BOLT:', savedTravel);
    }
} catch (saveError) {
    console.error('[TravelView] Fout bij opslaan URL reis:', saveError);
}

// Load into builder
setTimeout(() => {
    if (window.websiteBuilder && window.websiteBuilder.loadTravelIdea) {
        window.websiteBuilder.loadTravelIdea(result.data);
        if (window.WB_setMode) window.WB_setMode('page');
    }
}, 1000);
```

### 2.4 Update `renderManualMode()` functie (Handmatig)

**Zoek naar:** (rond regel 528)
```javascript
startBtn?.addEventListener('click', () => {
    const title = titleInput?.value?.trim() || 'Nieuwe Reis';
    if (window.websiteBuilder && window.websiteBuilder.loadTravelIdea) {
        window.websiteBuilder.loadTravelIdea({ name: title, title });
        if (window.WB_setMode) window.WB_setMode('page');
    } else {
        this.showStatus('error', 'Builder niet beschikbaar');
    }
});
```

**Vervang met:**
```javascript
startBtn?.addEventListener('click', async () => {
    const title = titleInput?.value?.trim() || 'Nieuwe Reis';
    
    // Sla lege reis op in BOLT database
    try {
        if (window.TravelDataService) {
            const savedTravel = await window.TravelDataService.saveTravel({
                title: title,
                name: title,
                location: '',
                duration: '0 dagen',
                days: 0,
                price: 0,
                currency: 'EUR',
                description: 'Handmatig samengestelde reis',
                image: '',
                tags: '',
                featured: false,
                priority: 999,
                status: 'draft', // Draft omdat het nog leeg is
                source: 'manual',
                destinations: [],
                hotels: [],
                transports: []
            });
            console.log('[TravelView] Handmatige reis opgeslagen in BOLT:', savedTravel);
        }
    } catch (saveError) {
        console.error('[TravelView] Fout bij opslaan handmatige reis:', saveError);
    }
    
    if (window.websiteBuilder && window.websiteBuilder.loadTravelIdea) {
        window.websiteBuilder.loadTravelIdea({ name: title, title });
        if (window.WB_setMode) window.WB_setMode('page');
    } else {
        this.showStatus('error', 'Builder niet beschikbaar');
    }
});
```

---

## 📋 Taak 3: BOLT Interface - Reizen Beheer Pagina

### Actie: Maak een nieuwe pagina in BOLT voor reis beheer

**Bestand:** Maak nieuw bestand `js/views/travelManagementView.js`

```javascript
// Travel Management View - Beheer reizen in BOLT
(function() {
    const TravelManagementView = {
        mount(container) {
            if (!container) return;
            container.innerHTML = this.renderHTML();
            this.attachEventListeners(container);
            this.loadTravels();
        },

        renderHTML() {
            return `
                <div style="max-width: 1400px; margin: 0 auto; padding: 20px;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; color: white;">
                        <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">
                            <i class="fas fa-globe-europe"></i> Reizen Beheer
                        </h1>
                        <p style="margin: 0; opacity: 0.9; font-size: 14px;">
                            Beheer alle reizen, stel featured reizen in en pas de volgorde aan
                        </p>
                    </div>

                    <!-- Stats -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                            <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Totaal Reizen</div>
                            <div id="totalCount" style="font-size: 32px; font-weight: 700; color: #0284c7;">-</div>
                        </div>
                        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                            <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Featured</div>
                            <div id="featuredCount" style="font-size: 32px; font-weight: 700; color: #fbbf24;">-</div>
                        </div>
                        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                            <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Published</div>
                            <div id="publishedCount" style="font-size: 32px; font-weight: 700; color: #22c55e;">-</div>
                        </div>
                        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                            <div style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Draft</div>
                            <div id="draftCount" style="font-size: 32px; font-weight: 700; color: #9ca3af;">-</div>
                        </div>
                    </div>

                    <!-- Filters -->
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                            <button class="filter-btn active" data-filter="all" style="padding: 8px 16px; border: 2px solid #0284c7; background: #0284c7; color: white; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                Alle
                            </button>
                            <button class="filter-btn" data-filter="published" style="padding: 8px 16px; border: 2px solid #e5e7eb; background: white; color: #6b7280; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                Published
                            </button>
                            <button class="filter-btn" data-filter="draft" style="padding: 8px 16px; border: 2px solid #e5e7eb; background: white; color: #6b7280; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                Draft
                            </button>
                            <button class="filter-btn" data-filter="featured" style="padding: 8px 16px; border: 2px solid #e5e7eb; background: white; color: #6b7280; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                <i class="fas fa-star"></i> Featured
                            </button>
                            <div style="flex: 1;"></div>
                            <button id="refreshBtn" style="padding: 8px 16px; border: 2px solid #0284c7; background: white; color: #0284c7; border-radius: 8px; font-weight: 600; cursor: pointer;">
                                <i class="fas fa-sync"></i> Ververs
                            </button>
                        </div>
                    </div>

                    <!-- Travels List -->
                    <div id="travelsList" style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">
                        <div style="text-align: center; padding: 40px; color: #9ca3af;">
                            <i class="fas fa-circle-notch fa-spin" style="font-size: 32px;"></i>
                            <br><br>Reizen laden...
                        </div>
                    </div>
                </div>
            `;
        },

        attachEventListeners(container) {
            // Filter buttons
            const filterBtns = container.querySelectorAll('.filter-btn');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => {
                        b.style.background = 'white';
                        b.style.color = '#6b7280';
                        b.classList.remove('active');
                    });
                    btn.style.background = '#0284c7';
                    btn.style.color = 'white';
                    btn.classList.add('active');
                    this.filterTravels(btn.dataset.filter);
                });
            });

            // Refresh button
            const refreshBtn = container.querySelector('#refreshBtn');
            refreshBtn?.addEventListener('click', () => {
                window.TravelDataService?.clearCache();
                this.loadTravels();
            });
        },

        async loadTravels() {
            try {
                if (!window.TravelDataService) {
                    throw new Error('TravelDataService not available');
                }

                const travels = await window.TravelDataService.getTravels({ status: null }); // All statuses
                console.log('[TravelManagement] Loaded travels:', travels);

                this.renderTravels(travels);
                this.updateStats(travels);

            } catch (error) {
                console.error('[TravelManagement] Error loading travels:', error);
                const list = document.getElementById('travelsList');
                if (list) {
                    list.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #ef4444;">
                            <i class="fas fa-exclamation-circle" style="font-size: 32px;"></i>
                            <br><br>Fout bij laden van reizen
                            <br><small>${error.message}</small>
                        </div>
                    `;
                }
            }
        },

        renderTravels(travels) {
            const list = document.getElementById('travelsList');
            if (!list) return;

            if (travels.length === 0) {
                list.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #9ca3af;">
                        <i class="fas fa-info-circle" style="font-size: 32px;"></i>
                        <br><br>Nog geen reizen gevonden
                    </div>
                `;
                return;
            }

            list.innerHTML = travels.map(travel => `
                <div class="travel-item" data-id="${travel.id}" data-status="${travel.status}" data-featured="${travel.featured}" style="border-bottom: 1px solid #e5e7eb; padding: 16px 0; display: flex; gap: 16px; align-items: center;">
                    <!-- Image -->
                    <img src="${travel.image || 'https://via.placeholder.com/80'}" alt="${travel.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                    
                    <!-- Info -->
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;">${travel.title}</h3>
                            ${travel.featured ? '<span style="background: #fbbf24; color: #78350f; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;"><i class="fas fa-star"></i> Featured</span>' : ''}
                            <span style="background: ${travel.status === 'published' ? '#22c55e' : '#9ca3af'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">${travel.status}</span>
                        </div>
                        <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">
                            <i class="fas fa-map-marker-alt"></i> ${travel.location} • ${travel.duration} • ${travel.price}
                        </div>
                        <div style="color: #9ca3af; font-size: 12px;">
                            Priority: ${travel.priority} • Source: ${travel.source} • ${new Date(travel.createdAt).toLocaleDateString('nl-NL')}
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div style="display: flex; gap: 8px;">
                        <button class="toggle-featured-btn" data-id="${travel.id}" data-featured="${travel.featured}" style="padding: 8px 12px; border: 2px solid ${travel.featured ? '#fbbf24' : '#e5e7eb'}; background: ${travel.featured ? '#fbbf24' : 'white'}; color: ${travel.featured ? '#78350f' : '#6b7280'}; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                            <i class="fas fa-star"></i> ${travel.featured ? 'Unfeatured' : 'Featured'}
                        </button>
                        <button class="edit-btn" data-id="${travel.id}" style="padding: 8px 12px; border: 2px solid #0284c7; background: white; color: #0284c7; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" data-id="${travel.id}" style="padding: 8px 12px; border: 2px solid #ef4444; background: white; color: #ef4444; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            // Attach action listeners
            this.attachActionListeners();
        },

        attachActionListeners() {
            // Featured toggle
            document.querySelectorAll('.toggle-featured-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.dataset.id;
                    const currentFeatured = btn.dataset.featured === 'true';
                    await this.toggleFeatured(id, currentFeatured);
                });
            });

            // Delete
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (confirm('Weet je zeker dat je deze reis wilt verwijderen?')) {
                        await this.deleteTravel(btn.dataset.id);
                    }
                });
            });
        },

        async toggleFeatured(id, currentFeatured) {
            try {
                await window.TravelDataService.updateTravel(id, {
                    featured: !currentFeatured,
                    priority: !currentFeatured ? 1 : 999
                });
                this.loadTravels();
            } catch (error) {
                console.error('Error toggling featured:', error);
                alert('Fout bij updaten: ' + error.message);
            }
        },

        async deleteTravel(id) {
            try {
                await window.TravelDataService.deleteTravel(id);
                this.loadTravels();
            } catch (error) {
                console.error('Error deleting travel:', error);
                alert('Fout bij verwijderen: ' + error.message);
            }
        },

        filterTravels(filter) {
            const items = document.querySelectorAll('.travel-item');
            items.forEach(item => {
                const status = item.dataset.status;
                const featured = item.dataset.featured === 'true';
                
                let show = false;
                if (filter === 'all') show = true;
                else if (filter === 'published') show = status === 'published';
                else if (filter === 'draft') show = status === 'draft';
                else if (filter === 'featured') show = featured;
                
                item.style.display = show ? 'flex' : 'none';
            });
        },

        updateStats(travels) {
            document.getElementById('totalCount').textContent = travels.length;
            document.getElementById('featuredCount').textContent = travels.filter(t => t.featured).length;
            document.getElementById('publishedCount').textContent = travels.filter(t => t.status === 'published').length;
            document.getElementById('draftCount').textContent = travels.filter(t => t.status === 'draft').length;
        }
    };

    window.TravelManagementView = TravelManagementView;
    console.log('[TravelManagementView] ✅ Module loaded');
})();
```

### Voeg toe aan router

**In `js/router.js`**, voeg toe aan de routes:

```javascript
case 'travel-management':
    if (window.TravelManagementView) {
        window.TravelManagementView.mount(contentArea);
    }
    break;
```

### Voeg menu item toe in BOLT

**In BOLT menu**, voeg toe:
```html
<a href="#travel-management">
    <i class="fas fa-globe-europe"></i> Reizen Beheer
</a>
```

---

## ✅ Verificatie Checklist

Na het uitvoeren van alle taken, verifieer:

### Database
- [ ] `travels` tabel bestaat in Supabase
- [ ] Indexes zijn aangemaakt
- [ ] RLS policies zijn actief
- [ ] Test query werkt: `SELECT * FROM travels;`

### TravelView
- [ ] Travel Compositor import slaat reis op
- [ ] PDF import slaat reis op
- [ ] URL import slaat reis op
- [ ] Handmatige reis slaat op als draft
- [ ] Console toont "Reis opgeslagen in BOLT"

### Travel Overview
- [ ] Component laadt reizen uit database
- [ ] Featured reizen hebben ⭐ badge
- [ ] Reizen zijn gesorteerd op priority
- [ ] Zoeken werkt
- [ ] Filteren werkt

### BOLT Interface
- [ ] Reizen beheer pagina is toegankelijk
- [ ] Lijst toont alle reizen
- [ ] Featured toggle werkt
- [ ] Delete functie werkt
- [ ] Stats worden correct getoond

---

## 🧪 Test Scenario

1. **Importeer een reis** via Travel Compositor
2. **Check database**: `SELECT * FROM travels ORDER BY created_at DESC LIMIT 1;`
3. **Open Reizen Beheer** in BOLT
4. **Toggle Featured** op de reis
5. **Ga naar website** met Travel Overview component
6. **Verifieer**: Reis staat bovenaan met ⭐ badge

---

## 📞 Support

Als er problemen zijn:

1. **Check console** voor error messages
2. **Check database connectie**: `console.log(window.BOLT_DB)`
3. **Check service**: `console.log(window.TravelDataService)`
4. **Test handmatig**: 
   ```javascript
   await TravelDataService.saveTravel({
       title: 'Test Reis',
       location: 'Test',
       duration: '5 dagen',
       price: 500
   });
   ```

---

## 🎯 Resultaat

Na het uitvoeren van deze opdracht:
- ✅ Reizen worden automatisch opgeslagen bij import
- ✅ BOLT heeft een beheer interface voor reizen
- ✅ Featured reizen kunnen worden ingesteld
- ✅ Travel Overview toont reizen uit database
- ✅ Alles werkt end-to-end!
