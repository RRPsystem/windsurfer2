# 🎯 BOLT Opdracht: Reizen & Nieuws API Setup

## ⚠️ BELANGRIJK: Wat BOLT MOET doen

**BOLT = Backend/Database ALLEEN**
- ✅ Database tabellen maken
- ✅ API endpoints maken
- ✅ Data opslaan en ophalen
- ❌ GEEN frontend componenten
- ❌ GEEN React componenten
- ❌ GEEN routing in builder

**De Website Builder heeft al:**
- ✅ Hero Travel Search component (frontend)
- ✅ Travel Overview component (frontend)
- ✅ Nieuws componenten (frontend)
- ✅ TravelDataService (API calls)

**BOLT moet alleen zorgen dat de API endpoints werken!**

---

## 📊 Database Schema

### Tabel: `travels`

**BOLT: Maak deze tabel aan in Supabase**

```sql
CREATE TABLE IF NOT EXISTS travels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basis Info
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  duration TEXT,
  days INTEGER,
  
  -- Prijs
  price NUMERIC,
  currency TEXT DEFAULT 'EUR',
  
  -- Content
  description TEXT,
  image TEXT,
  
  -- Metadata
  tags TEXT, -- Comma separated: "strand,tropisch,luxe"
  featured BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 999,
  status TEXT DEFAULT 'published', -- published, draft, archived
  
  -- Tracking
  source TEXT, -- 'manual', 'import', 'api'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Extra data (JSON)
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes voor snelle queries
CREATE INDEX idx_travels_status ON travels(status);
CREATE INDEX idx_travels_featured ON travels(featured);
CREATE INDEX idx_travels_location ON travels(location);
CREATE INDEX idx_travels_tags ON travels USING gin(to_tsvector('simple', tags));
```

### Tabel: `news_articles`

**BOLT: Maak deze tabel aan in Supabase**

```sql
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basis Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  
  -- Content
  excerpt TEXT,
  content TEXT,
  image TEXT,
  
  -- Metadata
  author TEXT,
  category TEXT,
  tags TEXT, -- Comma separated
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  
  -- Tracking
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Extra
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_news_status ON news_articles(status);
CREATE INDEX idx_news_featured ON news_articles(featured);
CREATE INDEX idx_news_published ON news_articles(published_at DESC);
```

---

## 🔌 API Endpoints

### BOLT: Maak deze REST API endpoints

**Base URL:** `https://jouw-bolt-url.supabase.co/rest/v1/`

### 1. GET /travels - Alle reizen ophalen

**Endpoint:**
```
GET /travels?status=eq.published&order=priority.asc,created_at.desc
```

**Response:**
```json
[
  {
    "id": "uuid-123",
    "title": "Thailand Strandvakantie",
    "location": "Thailand",
    "duration": "7 dagen",
    "days": 7,
    "price": 1299,
    "currency": "EUR",
    "description": "Ontspan op de mooiste stranden",
    "image": "https://images.unsplash.com/photo-...",
    "tags": "strand,tropisch,luxe",
    "featured": false,
    "priority": 999,
    "status": "published",
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

### 2. GET /travels?id=eq.{id} - Enkele reis ophalen

**Endpoint:**
```
GET /travels?id=eq.uuid-123
```

**Response:**
```json
{
  "id": "uuid-123",
  "title": "Thailand Strandvakantie",
  ...
}
```

### 3. POST /travels - Nieuwe reis toevoegen

**Endpoint:**
```
POST /travels
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Bali Avontuur",
  "location": "Indonesië",
  "duration": "10 dagen",
  "days": 10,
  "price": 1599,
  "currency": "EUR",
  "description": "Ontdek de tempels en rijstvelden",
  "image": "https://images.unsplash.com/photo-...",
  "tags": "avontuur,cultuur,natuur",
  "featured": false,
  "status": "published",
  "source": "manual"
}
```

**Response:**
```json
{
  "id": "uuid-456",
  "title": "Bali Avontuur",
  ...
}
```

### 4. PATCH /travels?id=eq.{id} - Reis updaten

**Endpoint:**
```
PATCH /travels?id=eq.uuid-123
Content-Type: application/json
```

**Body:**
```json
{
  "featured": true,
  "priority": 1,
  "updated_at": "2025-01-15T12:00:00Z"
}
```

### 5. DELETE /travels?id=eq.{id} - Reis verwijderen

**Endpoint:**
```
DELETE /travels?id=eq.uuid-123
```

### 6. GET /news_articles - Alle nieuwsberichten

**Endpoint:**
```
GET /news_articles?status=eq.published&order=published_at.desc
```

**Response:**
```json
[
  {
    "id": "uuid-789",
    "title": "Nieuwe Bestemming: Malediven",
    "slug": "nieuwe-bestemming-malediven",
    "excerpt": "Ontdek ons nieuwe aanbod...",
    "content": "Volledige artikel tekst...",
    "image": "https://...",
    "author": "John Doe",
    "category": "Nieuws",
    "tags": "malediven,nieuw,strand",
    "featured": true,
    "status": "published",
    "published_at": "2025-01-15T10:00:00Z"
  }
]
```

---

## 🔐 BOLT: Supabase RLS Policies

**BOLT: Configureer deze security policies**

### Travels Policies:

```sql
-- Iedereen kan reizen lezen (published)
CREATE POLICY "Public read published travels"
ON travels FOR SELECT
USING (status = 'published');

-- Alleen authenticated users kunnen reizen toevoegen
CREATE POLICY "Authenticated users can insert travels"
ON travels FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Alleen authenticated users kunnen reizen updaten
CREATE POLICY "Authenticated users can update travels"
ON travels FOR UPDATE
USING (auth.role() = 'authenticated');

-- Alleen authenticated users kunnen reizen verwijderen
CREATE POLICY "Authenticated users can delete travels"
ON travels FOR DELETE
USING (auth.role() = 'authenticated');
```

### News Policies:

```sql
-- Iedereen kan nieuws lezen (published)
CREATE POLICY "Public read published news"
ON news_articles FOR SELECT
USING (status = 'published');

-- Alleen authenticated users kunnen nieuws beheren
CREATE POLICY "Authenticated users can manage news"
ON news_articles FOR ALL
USING (auth.role() = 'authenticated');
```

---

## 🔑 BOLT: API Keys Setup

**BOLT: Zorg dat deze keys beschikbaar zijn**

### Supabase Credentials:

```javascript
// Deze moeten in de Website Builder beschikbaar zijn:
window.BOLT_DB = {
  url: 'https://jouw-project.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

**BOLT: Geef deze credentials door:**
1. Supabase Project URL
2. Supabase Anon Key (public)
3. (Optioneel) Service Role Key voor admin functies

---

## 📝 BOLT: Test Data Toevoegen

**BOLT: Voeg test data toe via SQL**

### Voorbeeld Reizen:

```sql
INSERT INTO travels (title, location, duration, days, price, currency, description, image, tags, featured, priority, status, source)
VALUES 
-- Featured Reizen (top 3)
('Thailand Strandparadijs', 'Thailand', '7 dagen', 7, 1299, 'EUR', 
 'Ontspan op de witte stranden van Phuket en Krabi. Inclusief 4-sterren hotel en ontbijt.', 
 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800', 
 'strand,tropisch,luxe', true, 1, 'published', 'manual'),

('Rondreis Italië', 'Italië', '10 dagen', 10, 1599, 'EUR', 
 'Ontdek Rome, Florence en Venetië. Inclusief hotels, ontbijt en rondleidingen.', 
 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800', 
 'rondreis,cultuur,geschiedenis', true, 2, 'published', 'manual'),

('Stedentrip Barcelona', 'Spanje', '4 dagen', 4, 599, 'EUR', 
 'Geniet van Gaudí, tapas en het strand. Inclusief 3-sterren hotel en ontbijt.', 
 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', 
 'stedentrip,cultuur,strand', true, 3, 'published', 'manual'),

-- Reguliere Reizen
('Bali Avontuur', 'Indonesië', '12 dagen', 12, 1799, 'EUR', 
 'Tempels, rijstvelden en vulkanen. Inclusief hotels en excursies.', 
 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 
 'avontuur,cultuur,natuur', false, 999, 'published', 'manual'),

('Safari Tanzania', 'Tanzania', '8 dagen', 8, 2499, 'EUR', 
 'Big Five safari in Serengeti en Ngorongoro. Inclusief lodges en game drives.', 
 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800', 
 'safari,avontuur,natuur', false, 999, 'published', 'manual'),

('Griekenland Eilandhoppen', 'Griekenland', '14 dagen', 14, 1399, 'EUR', 
 'Santorini, Mykonos en Kreta. Inclusief hotels en ferry tickets.', 
 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800', 
 'strand,cultuur,eilanden', false, 999, 'published', 'manual'),

('IJsland Noorderlicht', 'IJsland', '6 dagen', 6, 1899, 'EUR', 
 'Jacht op noorderlicht, geisers en watervallen. Inclusief 4x4 en hotels.', 
 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800', 
 'natuur,avontuur,winter', false, 999, 'published', 'manual'),

('Japan Cultuur', 'Japan', '15 dagen', 15, 2799, 'EUR', 
 'Tokyo, Kyoto en Mount Fuji. Inclusief hotels, JR Pass en rondleidingen.', 
 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 
 'cultuur,stedentrip,natuur', false, 999, 'published', 'manual');
```

### Voorbeeld Nieuws:

```sql
INSERT INTO news_articles (title, slug, excerpt, content, image, author, category, tags, featured, status, published_at)
VALUES 
('Nieuwe Bestemming: Malediven', 'nieuwe-bestemming-malediven',
 'Ontdek ons nieuwe aanbod voor de Malediven met all-inclusive resorts',
 'Volledige artikel over Malediven reizen...',
 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
 'Redactie', 'Nieuws', 'malediven,nieuw,strand', true, 'published', NOW()),

('Top 10 Strandbestemmingen 2025', 'top-10-strandbestemmingen-2025',
 'Onze selectie van de mooiste stranden voor dit jaar',
 'Volledige artikel over stranden...',
 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
 'Redactie', 'Tips', 'strand,top10,tips', true, 'published', NOW()),

('Reistips: Veilig Reizen in 2025', 'reistips-veilig-reizen-2025',
 'Belangrijke tips voor een veilige en zorgeloze reis',
 'Volledige artikel over veilig reizen...',
 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
 'Redactie', 'Tips', 'tips,veiligheid,reizen', false, 'published', NOW());
```

---

## ✅ BOLT: Verificatie Checklist

**BOLT moet deze dingen kunnen:**

### Database:
- [ ] Tabel `travels` bestaat
- [ ] Tabel `news_articles` bestaat
- [ ] Indexes zijn aangemaakt
- [ ] RLS policies zijn actief
- [ ] Test data is toegevoegd

### API Endpoints:
- [ ] GET /travels werkt (returns array)
- [ ] GET /travels?id=eq.{id} werkt (returns single)
- [ ] POST /travels werkt (creates new)
- [ ] PATCH /travels werkt (updates existing)
- [ ] DELETE /travels werkt (deletes)
- [ ] GET /news_articles werkt

### Security:
- [ ] Anon key kan alleen lezen (published)
- [ ] Authenticated users kunnen schrijven
- [ ] CORS is correct ingesteld
- [ ] API keys zijn beschikbaar

### Test Queries:
```bash
# Test GET travels
curl 'https://jouw-project.supabase.co/rest/v1/travels?status=eq.published' \
  -H "apikey: JOUW_ANON_KEY" \
  -H "Authorization: Bearer JOUW_ANON_KEY"

# Test GET news
curl 'https://jouw-project.supabase.co/rest/v1/news_articles?status=eq.published' \
  -H "apikey: JOUW_ANON_KEY" \
  -H "Authorization: Bearer JOUW_ANON_KEY"

# Test POST travel (met auth)
curl -X POST 'https://jouw-project.supabase.co/rest/v1/travels' \
  -H "apikey: JOUW_ANON_KEY" \
  -H "Authorization: Bearer JOUW_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Reis","location":"Test","status":"published"}'
```

---

## 🔗 Hoe Website Builder de API Gebruikt

**Dit doet de builder AL (BOLT hoeft dit NIET te maken):**

### TravelDataService.js:

```javascript
// Website Builder heeft al:
class TravelDataService {
  async getTravels() {
    const response = await fetch(
      `${window.BOLT_DB.url}/rest/v1/travels?status=eq.published`,
      {
        headers: {
          'apikey': window.BOLT_DB.anonKey,
          'Authorization': `Bearer ${window.BOLT_DB.anonKey}`
        }
      }
    );
    return await response.json();
  }
  
  async saveTravel(travelData) {
    const response = await fetch(
      `${window.BOLT_DB.url}/rest/v1/travels`,
      {
        method: 'POST',
        headers: {
          'apikey': window.BOLT_DB.anonKey,
          'Authorization': `Bearer ${window.BOLT_DB.anonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(travelData)
      }
    );
    return await response.json();
  }
}
```

**BOLT hoeft alleen te zorgen dat deze API calls werken!**

---

## 🎯 Samenvatting voor BOLT

### Wat BOLT MOET doen:
1. ✅ Maak `travels` tabel in Supabase
2. ✅ Maak `news_articles` tabel in Supabase
3. ✅ Configureer RLS policies
4. ✅ Voeg test data toe (8 reizen, 3 nieuws)
5. ✅ Test API endpoints
6. ✅ Geef Supabase credentials door

### Wat BOLT NIET moet doen:
- ❌ GEEN React componenten
- ❌ GEEN frontend code
- ❌ GEEN routing
- ❌ GEEN builder aanpassingen

### Resultaat:
Na BOLT's werk kan de Website Builder:
- ✅ Reizen ophalen via API
- ✅ Reizen opslaan via API
- ✅ Nieuws ophalen via API
- ✅ Featured reizen tonen
- ✅ Zoeken en filteren werkt

**De builder heeft al alle frontend componenten klaar!**

---

## 📞 Vragen voor BOLT

**Als BOLT vragen heeft:**

**Q: Moet ik React componenten maken?**
A: NEE! De builder heeft al alle componenten.

**Q: Moet ik routing opzetten?**
A: NEE! De builder heeft al routing.

**Q: Wat moet ik dan doen?**
A: Alleen database + API endpoints in Supabase.

**Q: Welke framework?**
A: Supabase REST API (geen framework nodig).

**Q: Hoe test ik of het werkt?**
A: Gebruik de curl commands hierboven.

---

**BOLT: Maak alleen de database en API. De rest is al klaar!** ✅
