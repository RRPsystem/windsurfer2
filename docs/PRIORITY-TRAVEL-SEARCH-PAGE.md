# 🎯 PRIORITY: Travel Search & Booking Page

## **🔴 URGENT - Te maken na Quick Designer gereed is**

---

## **Doel:**
Een universele HTML pagina die reizen van Travel Compositor toont met zoek- en boekfunctionaliteit.
Deze pagina moet werken op ALLE websites (GoWild, Tripex, custom themes, etc.).

---

## **Requirements:**

### **1. Universal HTML Template**
- **Standalone HTML file** die op elke site kan worden geplaatst
- **Responsive** (desktop, tablet, mobile)
- **Theme-agnostic** (eigen styling, geen afhankelijkheden)
- **Modern design** (clean, professional)

### **2. Travel Compositor Integratie**
- **Fetch reizen** via API:
  ```javascript
  GET https://huaaogdxxdcakxryecnw.supabase.co/functions/v1/trips-api
  ```
- **Display alle reizen** met:
  - Titel
  - Bestemming
  - Prijs
  - Afbeelding
  - Korte beschrijving
  - "Meer info" button

### **3. Zoek Functionaliteit**
- **Zoek op:**
  - Bestemming (autocomplete)
  - Datum (datepicker)
  - Budget range (slider)
  - Categorie (strand, cultuur, avontuur, etc.)
- **Live filtering** (geen page reload)
- **Sort opties:**
  - Prijs (laag → hoog)
  - Prijs (hoog → laag)
  - Datum (vertrek)
  - Populariteit

### **4. Boek Functionaliteit**
- **"Boek Nu" button** → Opent:
  - **Optie A:** Modal met contact formulier
  - **Optie B:** Redirect naar detail pagina
  - **Optie C:** WhatsApp link met reis info
- **Enquiry form:**
  - Naam
  - Email
  - Telefoon
  - Aantal personen
  - Voorkeur datum
  - Bericht
- **Save naar database:**
  ```sql
  INSERT INTO trip_enquiries (
    trip_id, 
    brand_id, 
    customer_name, 
    customer_email, 
    ...
  )
  ```

---

## **Technical Specs:**

### **File Structure:**
```
/travel-search-page.html          - Main HTML file
/assets/css/travel-search.css     - Styling
/assets/js/travel-search.js       - Functionality
```

### **Dependencies:**
- **Geen jQuery** (vanilla JS)
- **Geen framework** (pure HTML/CSS/JS)
- **Optional:** Gebruik Tailwind CSS CDN voor styling

### **API Calls:**
```javascript
// Fetch trips
const trips = await fetch(
  'https://huaaogdxxdcakxryecnw.supabase.co/functions/v1/trips-api',
  {
    headers: {
      'Authorization': 'Bearer TOKEN',
      'Content-Type': 'application/json'
    }
  }
);

// Submit booking enquiry
const booking = await fetch(
  'https://huaaogdxxdcakxryecnw.supabase.co/functions/v1/bookings-api',
  {
    method: 'POST',
    body: JSON.stringify(enquiryData)
  }
);
```

---

## **Design Mockup:**

```
┌─────────────────────────────────────────────────┐
│  🔍 Zoek je droomreis                           │
│  ┌──────────┬──────────┬──────────┬──────────┐  │
│  │Bestemming│  Datum   │  Budget  │Categorie │  │
│  └──────────┴──────────┴──────────┴──────────┘  │
│                                      [Zoeken]    │
└─────────────────────────────────────────────────┘

┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐
│ IMG   │  │ IMG   │  │ IMG   │  │ IMG   │
│       │  │       │  │       │  │       │
│Bali   │  │Japan  │  │NYC    │  │Parijs │
│€1200  │  │€2500  │  │€1800  │  │€900   │
│[Boek] │  │[Boek] │  │[Boek] │  │[Boek] │
└───────┘  └───────┘  └───────┘  └───────┘

[Meer reizen laden...]
```

---

## **Integration met Quick Designer:**

### **Optie 1: Als nieuwe pagina toevoegen**
User kan in Quick Designer "Travel Search" pagina toevoegen:
- Template selecteren
- Automatisch reizen laden van hun brand
- Customize colors/logo

### **Optie 2: Als standalone widget**
Embed code die op elke pagina kan worden geplaatst:
```html
<div id="travel-search" data-brand-id="xxx"></div>
<script src="https://www.ai-websitestudio.nl/widgets/travel-search.js"></script>
```

---

## **Database Schema Needed:**

```sql
-- Trip enquiries tabel
CREATE TABLE trip_enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id),
  brand_id UUID REFERENCES brands(id),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  number_of_people INTEGER,
  preferred_date DATE,
  message TEXT,
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, booked, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index voor snelle lookups
CREATE INDEX idx_trip_enquiries_brand ON trip_enquiries(brand_id);
CREATE INDEX idx_trip_enquiries_trip ON trip_enquiries(trip_id);
CREATE INDEX idx_trip_enquiries_status ON trip_enquiries(status);
```

---

## **Testing Checklist:**

### **Desktop:**
- [ ] Search filters werken
- [ ] Sort functie werkt
- [ ] Cards tonen correct
- [ ] Booking form opent
- [ ] Form submit werkt
- [ ] Data komt in database

### **Mobile:**
- [ ] Responsive layout
- [ ] Touch-friendly buttons
- [ ] Swipe voor meer reizen
- [ ] Mobile keyboard optimized

### **Cross-browser:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## **Success Criteria:**

✅ **Universal:** Werkt op GoWild, Tripex, WordPress, custom sites
✅ **Fast:** Laadt in < 2 seconden
✅ **Beautiful:** Modern, clean design
✅ **Functional:** Zoek, filter, sort, book allemaal werkend
✅ **Mobile-first:** Perfect op telefoon
✅ **Data:** Alle enquiries in database

---

## **Timeline:**

**Day 1 (Morgen):**
1. ✅ HTML structuur + basic styling (2u)
2. ✅ API integratie + data display (2u)
3. ✅ Search filters basis (2u)

**Day 2:**
4. ✅ Booking form + submission (2u)
5. ✅ Mobile responsive maken (2u)
6. ✅ Testing + fixes (2u)

**Day 3:**
7. ✅ Integratie met Quick Designer
8. ✅ Documentation
9. ✅ Production deployment

---

## **Priority:** 🔴 **HIGHEST** - Start zodra Quick Designer save werkt!

---

## **Notes:**
- Keep it simple eerst - fancy features later
- Focus op functionality over perfectie
- Test met echte Travel Compositor data
- Ask user feedback early en vaak

---

**Start morgen zodra Quick Designer save getest is!** 🚀
