# BOLT Quick Start - Korte Implementatie Gids

## ✅ Database Setup (KLAAR)
De `websites` tabel is aangemaakt in Supabase met alle policies.

## 🎯 Wat BOLT moet doen

### 1. Menu Item Toevoegen

Voeg toe aan Brand Content Menu:

```typescript
{
  label: '🚀 Quick Start Website',
  icon: 'rocket',
  route: '/brand/quickstart',
  description: 'Maak snel een complete website met templates'
}
```

### 2. Deeplink Functie

```typescript
function generateQuickStartDeeplink(brandId: string): string {
  const jwtToken = getJWTToken(); // Huidige JWT
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const apiUrl = 'https://huaaogdxxdcakxryecnw.supabase.co/functions/v1';
  const returnUrl = window.location.href;
  
  const params = new URLSearchParams({
    brand_id: brandId,
    token: jwtToken,
    apikey: supabaseKey,
    api: apiUrl,
    return_url: returnUrl
  });
  
  return `https://www.ai-websitestudio.nl/template-selector.html?${params.toString()}`;
}
```

### 3. Return Handler (Belangrijk!)

Voeg toe aan component die laadt na terugkeer:

```typescript
useEffect(() => {
  // Check localStorage voor export data
  const exportData = localStorage.getItem('template_export');
  
  if (exportData) {
    try {
      const data = JSON.parse(exportData);
      
      // Opslaan in Supabase
      await supabase
        .from('websites')
        .insert({
          brand_id: data.brandId,
          name: `${data.template.charAt(0).toUpperCase() + data.template.slice(1)} Website`,
          template_name: data.template,
          pages: data.pages,
          status: 'published',
          published_at: new Date().toISOString()
        });
      
      // Clear localStorage
      localStorage.removeItem('template_export');
      
      // Success melding
      toast.success('✅ Website succesvol geïmporteerd!');
      
    } catch (error) {
      console.error('Error importing website:', error);
      toast.error('❌ Fout bij importeren website');
    }
  }
}, []);
```

### 4. Websites Overzicht Pagina

Maak nieuwe pagina: `/brand/websites`

```typescript
export default function WebsitesPage() {
  const [websites, setWebsites] = useState([]);
  
  useEffect(() => {
    loadWebsites();
  }, []);
  
  async function loadWebsites() {
    const { data } = await supabase
      .from('websites')
      .select('*')
      .eq('brand_id', currentBrandId)
      .order('created_at', { ascending: false });
    
    setWebsites(data || []);
  }
  
  return (
    <div>
      <h1>Mijn Websites</h1>
      <button onClick={() => {
        window.location.href = generateQuickStartDeeplink(currentBrandId);
      }}>
        🚀 Nieuwe Website
      </button>
      
      {websites.map(website => (
        <div key={website.id}>
          <h3>{website.name}</h3>
          <p>{website.template_name} • {website.pages.length} pagina's</p>
          <button onClick={() => editWebsite(website.id)}>Bewerken</button>
          <button onClick={() => deleteWebsite(website.id)}>Verwijderen</button>
        </div>
      ))}
    </div>
  );
}

function editWebsite(id: string) {
  // TODO: Redirect naar template editor met website_id
  const url = `https://www.ai-websitestudio.nl/template-editor.html?website_id=${id}&brand_id=${currentBrandId}&token=${jwtToken}&apikey=${supabaseKey}`;
  window.location.href = url;
}

async function deleteWebsite(id: string) {
  if (!confirm('Weet je zeker dat je deze website wilt verwijderen?')) return;
  
  await supabase.from('websites').delete().eq('id', id);
  loadWebsites();
}
```

## 📊 Data Structuur

### Export Data (van Template Editor)

```json
{
  "template": "gotur",
  "pages": [
    {
      "name": "Home",
      "path": "index.html",
      "html": "<!DOCTYPE html>...",
      "modified": true,
      "order": 0
    }
  ],
  "timestamp": 1234567890,
  "brandId": "uuid"
}
```

### Websites Tabel

```typescript
interface Website {
  id: string;
  brand_id: string;
  name: string;
  template_name: 'gotur' | 'tripix';
  pages: Array<{
    name: string;
    path: string;
    html: string;
    modified: boolean;
    order: number;
  }>;
  status: 'draft' | 'published';
  domain?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}
```

## 🔄 Complete Flow

```
1. Gebruiker klikt "🚀 Quick Start Website" in BOLT
   ↓
2. BOLT genereert deeplink met auth params
   ↓
3. Redirect naar template-selector.html
   ↓
4. Gebruiker kiest template & bewerkt
   ↓
5. Klik "Publiceren" in Template Editor
   ↓
6. Data → localStorage['template_export']
   ↓
7. Redirect terug naar BOLT (return_url)
   ↓
8. BOLT leest localStorage in useEffect
   ↓
9. BOLT slaat op in 'websites' tabel
   ↓
10. Clear localStorage
    ↓
11. Success melding + redirect naar /brand/websites
```

## 🧪 Testen

### Test Flow:
1. Klik "Quick Start Website" in BOLT
2. Kies Gotur template
3. Bewerk iets (tekst of foto)
4. Klik "Publiceren"
5. Check of je terug bent in BOLT
6. Check of website in lijst staat
7. Check console voor errors

### Debug Checklist:
- [ ] JWT token is geldig
- [ ] Supabase key is correct
- [ ] localStorage wordt gelezen
- [ ] Website wordt opgeslagen
- [ ] RLS policies werken

## 📝 Belangrijke Notes

1. **Return URL**: Moet exact de BOLT URL zijn waar gebruiker vandaan kwam
2. **localStorage**: Wordt automatisch gecleared na verwerking
3. **Auth**: Template editor checkt brand_id + token, anders "Toegang Geweigerd"
4. **Beveiliging**: Templates preview is publiek, editor is beveiligd

## 🆘 Troubleshooting

**Probleem:** "Toegang Geweigerd" in Template Editor
- **Oplossing:** Check of brand_id en token in URL staan

**Probleem:** Export data niet gevonden
- **Oplossing:** Check timing, voeg setTimeout(100ms) toe in useEffect

**Probleem:** Website niet opgeslagen
- **Oplossing:** Check RLS policies en brand_user_assignments

## 📞 Contact

Voor vragen: check de volledige documentatie in `BOLT_QUICKSTART_INTEGRATION.md`
