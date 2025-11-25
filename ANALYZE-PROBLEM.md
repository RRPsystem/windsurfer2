# Waarom werkt price/duration niet?

## Feit 1: Database kolommen bestaan WEL
Uit `travelDataService.js` regel 55:
```javascript
trips(id,title,description,featured_image,price,duration_days,status,content,slug,created_at)
```
De kolommen `price` en `duration_days` **bestaan** in de trips tabel.

## Feit 2: "Land cruise" HAD wel price/duration
De gebruiker zegt dat "Land cruise" wel price en duration had in BOLT.

## Vraag: Hoe is "Land cruise" aangemaakt?

### Mogelijkheid 1: Handmatig in BOLT toegevoegd
Misschien is "Land cruise" NIET via de Travel Compositor import gemaakt, maar:
- Direct in BOLT aangemaakt
- Of geïmporteerd en daarna handmatig aangepast

### Mogelijkheid 2: Andere import route
Misschien was er een eerdere versie van de import die WEL werkte.

### Mogelijkheid 3: content-api werkte toen wel
Misschien accepteerde content-api toen nog price/duration velden.

## Test om dit te achterhalen:

**Run deze SQL query in Supabase:**
```sql
SELECT 
    id,
    title,
    slug,
    price,
    duration_days,
    source,
    tc_idea_id,
    created_at,
    updated_at
FROM trips 
WHERE title ILIKE '%land%cruise%'
ORDER BY created_at DESC;
```

**Kijk naar:**
- `source`: Is het 'travel-compositor' of iets anders?
- `tc_idea_id`: Is die ingevuld?
- `created_at` vs `updated_at`: Verschil = handmatig aangepast?
- `price` en `duration_days`: Zijn deze wel ingevuld?

## Hypothese:

Ik vermoed dat "Land cruise" WEL price/duration heeft omdat:
1. Hij NIET via Travel Compositor is geïmporteerd
2. OF hij is handmatig aangepast in de database
3. OF content-api is gewijzigd sinds die trip

## Oplossing:

We moeten **content-api Edge Function** updaten om price/duration door te geven.
Of we blijven de dual-save strategie gebruiken (content-api + direct PATCH).
