# CORS Probleem Diagnose

## Het Probleem

```
Access to fetch at 'https://huaaogdxxdcakxryecnw.supabase.co/functions/v1/content-api/news/save' 
from origin 'https://www.ai-websitestudio.nl' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
```

## Wat Gebeurt Er?

1. **Builder** (ai-websitestudio.nl) probeert nieuws op te slaan
2. **Browser** stuurt eerst een **OPTIONS preflight** request
3. **Edge Function** (content-api) geeft GEEN 200 OK terug op OPTIONS
4. **Browser** blokkeert het echte POST request

## De URL is Correct

```
https://huaaogdxxdcakxryecnw.supabase.co/functions/v1/content-api/news/save
```

Dit is correct! De Builder roept aan:
- Base: `https://huaaogdxxdcakxryecnw.supabase.co/functions/v1`
- Path: `/content-api/news/save`

## Het Probleem Zit in de Edge Function

De **content-api** Edge Function moet:

### 1. OPTIONS Request Afhandelen

```typescript
// MOET als eerste in de function staan!
if (req.method === 'OPTIONS') {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

### 2. CORS Headers op Alle Responses

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Op elke response:
return new Response(JSON.stringify(data), {
  status: 200,
  headers: {
    ...corsHeaders,
    'Content-Type': 'application/json',
  },
});
```

## Wat Bolt Moet Doen

### In `supabase/functions/content-api/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // EERST: Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    // ... rest van de code ...
    
    // Op elke response:
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Ook op errors:
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  }
});
```

## Test in Browser Console

Na de fix, test met:

```javascript
// Test OPTIONS request
fetch('https://huaaogdxxdcakxryecnw.supabase.co/functions/v1/content-api/news/save', {
  method: 'OPTIONS',
  headers: {
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'authorization, content-type, apikey',
  }
}).then(r => {
  console.log('OPTIONS status:', r.status);
  console.log('CORS headers:', {
    'Access-Control-Allow-Origin': r.headers.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': r.headers.get('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': r.headers.get('Access-Control-Allow-Headers'),
  });
});
```

**Verwacht:**
```
OPTIONS status: 200
CORS headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}
```

## Checklist voor Bolt

- [ ] OPTIONS handler toegevoegd als EERSTE in de function
- [ ] CORS headers gedefinieerd als constante
- [ ] CORS headers op ALLE responses (success + error)
- [ ] Edge function opnieuw gedeployed
- [ ] OPTIONS request getest (zie hierboven)
- [ ] POST request getest vanuit Builder

## Na de Fix

Als CORS correct is:
1. Builder kan opslaan zonder CORS error
2. Response komt terug met nieuws ID
3. Builder redirect naar return_url
4. Nieuws staat in Bolt News Management

## Extra: Network Tab Checken

In Browser DevTools → Network tab:

1. Filter op "save"
2. Klik op het OPTIONS request
3. Check Response Headers:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: ...`
   - `Access-Control-Allow-Headers: ...`
4. Status moet **200 OK** zijn

Als OPTIONS 200 OK is, maar POST nog steeds faalt, dan is er een ander probleem.
