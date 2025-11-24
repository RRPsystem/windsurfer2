# BOLT Save API Fix

## Probleem
Quick Designer kan pagina's laden maar NIET opslaan. De `updated_at` timestamp verandert niet na een save poging.

## Wat Quick Designer stuurt

**Endpoint:** `POST {apiBase}/pages-api/save`

**Headers:**
```json
{
  "Authorization": "Bearer {JWT_TOKEN}",
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "page_id": "95956cee-885b-4c88-b0ee-51b3c3c0afc3",
  "title": "Home",
  "slug": "/",
  "content": "<!DOCTYPE html><html>...</html>",
  "body_html": "<!DOCTYPE html><html>...</html>"
}
```

## Wat BOLT moet fixen

### 1. Check of `/pages-api/save` endpoint bestaat

**Test:**
```bash
curl -X POST \
  https://huaaogdxxdcakxryecnw.supabase.co/functions/v1/pages-api/save \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"page_id":"95956cee-885b-4c88-b0ee-51b3c3c0afc3","title":"Home","slug":"/","content":"test"}'
```

Verwachte response: `200 OK` met updated page data

### 2. Als endpoint NIET bestaat - maak het aan

**Edge function:** `supabase/functions/pages-api/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    // GET /pages-api?page_id=xxx
    if (req.method === 'GET') {
      const page_id = url.searchParams.get('page_id')
      
      const { data, error } = await supabaseClient
        .from('pages')
        .select('id, brand_id, title, slug, body_html, template_category, created_at, updated_at')
        .eq('id', page_id)
        .single()

      if (error) throw error

      // Map body_html to content for Quick Designer
      return new Response(
        JSON.stringify({
          data: {
            ...data,
            content: data.body_html
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /pages-api/save
    if (req.method === 'POST' && path === 'save') {
      const { page_id, title, slug, content, body_html } = await req.json()

      // Validate required fields
      if (!page_id || !title || !slug) {
        return new Response(
          JSON.stringify({
            error: 'Invalid request data',
            details: [
              { code: 'invalid_type', path: ['page_id'], message: 'Required' },
              { code: 'invalid_type', path: ['title'], message: 'Required' },
              { code: 'invalid_type', path: ['slug'], message: 'Required' }
            ]
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Use either content or body_html
      const htmlContent = content || body_html

      const { data, error } = await supabaseClient
        .from('pages')
        .update({
          title,
          slug,
          body_html: htmlContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', page_id)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### 3. Deploy edge function

```bash
supabase functions deploy pages-api
```

## Alternatief: Direct database update (tijdelijk)

Als BOLT de API nog niet heeft, kan Quick Designer tijdelijk DIRECT naar Supabase schrijven:

**In Quick Designer:**
```javascript
// Fallback: direct Supabase update als API faalt
const { data, error } = await this.supabase
  .from('pages')
  .update({
    title: saveData.title,
    slug: saveData.slug,
    body_html: saveData.content,
    updated_at: new Date().toISOString()
  })
  .eq('id', this.pageId)
  .select()
  .single();
```

## Test na fix

1. Open Quick Designer vanuit BOLT
2. Wijzig tekst in de editor
3. Klik "Save to BOLT"
4. Refresh de pagina
5. Check of wijzigingen er nog zijn ✅

## SQL om te verifiëren

```sql
-- Check of save heeft gewerkt
SELECT 
  id,
  title,
  LENGTH(body_html) as html_size,
  updated_at,
  (body_html LIKE '%JOUW_WIJZIGING%') as has_your_edit
FROM pages
WHERE id = '95956cee-885b-4c88-b0ee-51b3c3c0afc3';
```

Als `has_your_edit = true` en `updated_at` is recent → Save werkt! ✅
