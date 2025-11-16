# BOLT Quick Start Website Integratie

## 📋 Overzicht

De Quick Start Templates feature stelt gebruikers in staat om snel een complete website te maken op basis van professionele templates (Gotur en Tripix). Deze websites worden opgeslagen in een aparte `websites` tabel en kunnen later worden uitgebreid met extra pagina's via de Website Builder.

## 🗄️ Database Schema

### Nieuwe Tabel: `websites`

```sql
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_name TEXT NOT NULL, -- 'gotur' of 'tripix'
  pages JSONB NOT NULL, -- Array van pagina objecten
  status TEXT DEFAULT 'draft', -- 'draft', 'published'
  domain TEXT, -- Optioneel: custom domain
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_template CHECK (template_name IN ('gotur', 'tripix')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published'))
);

-- Indexes
CREATE INDEX idx_websites_brand_id ON websites(brand_id);
CREATE INDEX idx_websites_status ON websites(status);
CREATE INDEX idx_websites_template ON websites(template_name);

-- RLS Policies
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own websites"
  ON websites FOR SELECT
  USING (brand_id IN (
    SELECT brand_id FROM brand_user_assignments 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own websites"
  ON websites FOR INSERT
  WITH CHECK (brand_id IN (
    SELECT brand_id FROM brand_user_assignments 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own websites"
  ON websites FOR UPDATE
  USING (brand_id IN (
    SELECT brand_id FROM brand_user_assignments 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own websites"
  ON websites FOR DELETE
  USING (brand_id IN (
    SELECT brand_id FROM brand_user_assignments 
    WHERE user_id = auth.uid()
  ));
```

### Pages JSONB Structuur

```json
{
  "pages": [
    {
      "name": "Home",
      "path": "index.html",
      "html": "<!DOCTYPE html>...",
      "modified": true,
      "order": 0
    },
    {
      "name": "About",
      "path": "about.html",
      "html": "<!DOCTYPE html>...",
      "modified": true,
      "order": 1
    }
  ]
}
```

## 🔗 BOLT Menu Integratie

### 1. Voeg Menu Item Toe

**Locatie:** Brand Content Menu

```typescript
// In BOLT menu configuratie
{
  label: '🚀 Quick Start Website',
  icon: 'rocket',
  route: '/brand/quickstart',
  description: 'Maak snel een complete website met templates',
  badge: 'NEW'
}
```

### 2. Deeplink Genereren

```typescript
// BOLT code om deeplink te genereren
function generateQuickStartDeeplink(brandId: string): string {
  const jwtToken = getJWTToken(); // Huidige gebruiker JWT
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const apiUrl = 'https://huaaogdxxdcakxryecnw.supabase.co/functions/v1';
  const returnUrl = window.location.href; // Huidige BOLT URL
  
  const params = new URLSearchParams({
    brand_id: brandId,
    token: jwtToken,
    apikey: supabaseKey,
    api: apiUrl,
    return_url: returnUrl
  });
  
  return `https://www.ai-websitestudio.nl/template-selector.html?${params.toString()}`;
}

// Gebruik in component
<button onClick={() => {
  const url = generateQuickStartDeeplink(currentBrandId);
  window.location.href = url;
}}>
  🚀 Start met Template
</button>
```

### 3. Return Data Verwerken

Wanneer gebruiker terugkomt van Template Editor:

```typescript
// BOLT code om export data te lezen
async function handleTemplateReturn() {
  // Check localStorage voor export data
  const exportData = localStorage.getItem('template_export');
  
  if (!exportData) {
    console.log('No template export data found');
    return;
  }
  
  try {
    const data = JSON.parse(exportData);
    console.log('Template export received:', data);
    
    // Structuur van data:
    // {
    //   template: 'gotur',
    //   pages: [...],
    //   timestamp: 1234567890,
    //   brandId: 'uuid'
    // }
    
    // Opslaan in Supabase
    await saveWebsiteToSupabase(data);
    
    // Clear localStorage
    localStorage.removeItem('template_export');
    
    // Toon success melding
    showNotification('✅ Website succesvol geïmporteerd!');
    
    // Redirect naar websites overzicht
    router.push('/brand/websites');
    
  } catch (error) {
    console.error('Error processing template export:', error);
    showNotification('❌ Fout bij importeren website', 'error');
  }
}

// Roep aan bij component mount
useEffect(() => {
  handleTemplateReturn();
}, []);
```

### 4. Opslaan in Supabase

```typescript
async function saveWebsiteToSupabase(exportData: any) {
  const { data, error } = await supabase
    .from('websites')
    .insert({
      brand_id: exportData.brandId,
      name: `${exportData.template.charAt(0).toUpperCase() + exportData.template.slice(1)} Website`,
      template_name: exportData.template,
      pages: exportData.pages,
      status: 'published',
      published_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to save website: ${error.message}`);
  }
  
  return data;
}
```

## 📱 BOLT UI Componenten

### Websites Overzicht Pagina

```typescript
// /brand/websites/page.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function WebsitesPage() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadWebsites();
  }, []);
  
  async function loadWebsites() {
    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('brand_id', currentBrandId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading websites:', error);
      return;
    }
    
    setWebsites(data);
    setLoading(false);
  }
  
  async function deleteWebsite(id: string) {
    if (!confirm('Weet je zeker dat je deze website wilt verwijderen?')) {
      return;
    }
    
    const { error } = await supabase
      .from('websites')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting website:', error);
      return;
    }
    
    loadWebsites();
  }
  
  return (
    <div className="websites-page">
      <div className="header">
        <h1>Mijn Websites</h1>
        <button onClick={() => {
          const url = generateQuickStartDeeplink(currentBrandId);
          window.location.href = url;
        }}>
          🚀 Nieuwe Website
        </button>
      </div>
      
      {loading ? (
        <div>Laden...</div>
      ) : websites.length === 0 ? (
        <div className="empty-state">
          <h2>Nog geen websites</h2>
          <p>Start met een template om snel een complete website te maken</p>
          <button onClick={() => {
            const url = generateQuickStartDeeplink(currentBrandId);
            window.location.href = url;
          }}>
            🚀 Start met Template
          </button>
        </div>
      ) : (
        <div className="websites-grid">
          {websites.map(website => (
            <div key={website.id} className="website-card">
              <div className="website-preview">
                <img src={`/templates/${website.template_name}/preview.jpg`} alt={website.name} />
              </div>
              <div className="website-info">
                <h3>{website.name}</h3>
                <p>{website.template_name} • {website.pages.length} pagina's</p>
                <div className="website-meta">
                  <span className={`status ${website.status}`}>
                    {website.status === 'published' ? '✅ Gepubliceerd' : '📝 Concept'}
                  </span>
                  <span className="date">
                    {new Date(website.created_at).toLocaleDateString('nl-NL')}
                  </span>
                </div>
              </div>
              <div className="website-actions">
                <button onClick={() => editWebsite(website.id)}>
                  ✏️ Bewerken
                </button>
                <button onClick={() => previewWebsite(website.id)}>
                  👁️ Preview
                </button>
                <button onClick={() => deleteWebsite(website.id)} className="danger">
                  🗑️ Verwijderen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function editWebsite(id: string) {
  // Redirect naar template editor met website ID
  const url = `https://www.ai-websitestudio.nl/template-editor.html?website_id=${id}&brand_id=${currentBrandId}&token=${jwtToken}&apikey=${supabaseKey}`;
  window.location.href = url;
}

function previewWebsite(id: string) {
  // Open preview in nieuw tabblad
  window.open(`/preview/website/${id}`, '_blank');
}
```

## 🔄 Combineren met Losse Pagina's

### Menu Generatie

```typescript
// Functie om complete menu te genereren
async function generateCompleteMenu(brandId: string) {
  // 1. Haal website pagina's op
  const { data: website } = await supabase
    .from('websites')
    .select('pages')
    .eq('brand_id', brandId)
    .eq('status', 'published')
    .single();
  
  // 2. Haal extra pagina's op
  const { data: extraPages } = await supabase
    .from('pages')
    .select('title, slug')
    .eq('brand_id', brandId)
    .eq('published', true)
    .order('order');
  
  // 3. Combineer
  const menuItems = [];
  
  // Website pagina's
  if (website?.pages) {
    website.pages.forEach(page => {
      menuItems.push({
        label: page.name,
        url: `/${page.path}`,
        type: 'template',
        order: page.order
      });
    });
  }
  
  // Extra pagina's
  if (extraPages) {
    extraPages.forEach(page => {
      menuItems.push({
        label: page.title,
        url: `/${page.slug}`,
        type: 'custom',
        order: 100 + menuItems.length // Na template pagina's
      });
    });
  }
  
  // Sorteer op order
  menuItems.sort((a, b) => a.order - b.order);
  
  return menuItems;
}
```

## 🚀 Deployment & Hosting

### Website Publiceren

```typescript
async function publishWebsite(websiteId: string) {
  // 1. Haal website data op
  const { data: website } = await supabase
    .from('websites')
    .select('*')
    .eq('id', websiteId)
    .single();
  
  // 2. Genereer statische HTML bestanden
  const files = website.pages.map(page => ({
    path: page.path,
    content: page.html
  }));
  
  // 3. Upload naar hosting (bijv. Vercel, Netlify)
  // Of serveer via custom domain
  
  // 4. Update status
  await supabase
    .from('websites')
    .update({
      status: 'published',
      published_at: new Date().toISOString()
    })
    .eq('id', websiteId);
  
  return {
    success: true,
    url: `https://${website.domain || `${website.brand_id}.ai-websitestudio.nl`}`
  };
}
```

## 📊 Analytics & Tracking

### Website Statistieken

```sql
-- Voeg tracking toe aan websites tabel
ALTER TABLE websites ADD COLUMN views INTEGER DEFAULT 0;
ALTER TABLE websites ADD COLUMN last_viewed_at TIMESTAMP WITH TIME ZONE;

-- Functie om view te registreren
CREATE OR REPLACE FUNCTION increment_website_views(website_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE websites
  SET 
    views = views + 1,
    last_viewed_at = NOW()
  WHERE id = website_id;
END;
$$ LANGUAGE plpgsql;
```

## 🔐 Beveiliging

### Authenticatie Check

De Template Editor en Selector zijn beveiligd en vereisen:
- ✅ `brand_id` parameter
- ✅ `token` parameter (JWT)
- ✅ Geldige Supabase credentials

Zonder deze parameters krijgt de gebruiker een "Toegang Geweigerd" scherm.

### Template Preview

Template preview pagina's zijn **publiek toegankelijk**:
- ✅ `https://www.ai-websitestudio.nl/templates/gotur/gotur-html-main/index.html`
- ✅ `https://www.ai-websitestudio.nl/templates/tripix-html/index.html`

Dit is gewenst voor marketing doeleinden.

## 📝 Voorbeeld Flow

### Complete User Journey

```
1. Gebruiker logt in op BOLT
   ↓
2. Navigeert naar "🚀 Quick Start Website"
   ↓
3. Klik "Start met Template"
   ↓
4. Redirect naar Template Selector (met auth params)
   ↓
5. Kiest Gotur template
   ↓
6. Template Editor opent
   ↓
7. Gebruiker bewerkt:
   - Teksten (met AI)
   - Afbeeldingen (via Media Selector)
   - Verwijdert onnodige pagina's
   ↓
8. Klik "Opslaan" (Ctrl+S)
   ↓
9. Klik "Publiceren"
   ↓
10. Data wordt opgeslagen in localStorage
    ↓
11. Redirect terug naar BOLT
    ↓
12. BOLT leest localStorage
    ↓
13. BOLT slaat op in 'websites' tabel
    ↓
14. Success melding + redirect naar websites overzicht
    ↓
15. Gebruiker ziet nieuwe website in lijst
    ↓
16. Kan later extra pagina's toevoegen via Website Builder
```

## 🛠️ Troubleshooting

### Probleem: Export data niet gevonden

**Oorzaak:** localStorage wordt niet correct gelezen

**Oplossing:**
```typescript
// Check of data bestaat
const exportData = localStorage.getItem('template_export');
console.log('Export data:', exportData);

// Check timing - wacht tot component gemount is
useEffect(() => {
  setTimeout(() => {
    handleTemplateReturn();
  }, 100);
}, []);
```

### Probleem: Authenticatie faalt

**Oorzaak:** JWT token verlopen of ontbreekt

**Oplossing:**
```typescript
// Ververs token voor deeplink
const freshToken = await refreshJWTToken();
const url = generateQuickStartDeeplink(brandId, freshToken);
```

### Probleem: Pages niet zichtbaar in menu

**Oorzaak:** Menu combineert niet correct

**Oplossing:**
```typescript
// Zorg dat beide bronnen worden gecombineerd
const allPages = await generateCompleteMenu(brandId);
console.log('All menu items:', allPages);
```

## 📞 Support

Voor vragen of problemen:
- Check console logs in browser
- Controleer Supabase RLS policies
- Verifieer JWT token geldigheid
- Test met `test-templates.html` voor lokale debugging

## 🎯 Roadmap

Toekomstige features:
- [ ] Meerdere websites per brand
- [ ] Custom domains per website
- [ ] A/B testing tussen templates
- [ ] Template marketplace
- [ ] Automatische SEO optimalisatie
- [ ] Multi-language support
- [ ] Undo/Redo functionaliteit
- [ ] Real-time collaboration
