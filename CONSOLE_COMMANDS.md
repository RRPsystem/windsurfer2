# Browser Console Commands voor Debugging

Open de browser Developer Tools (F12) en ga naar de **Console** tab.

## JWT Validatie Checken

```javascript
// Check of de JWT token geldig is
window.BuilderPublishAPI.validateJWT()
```

**Output voorbeeld (geldig):**
```javascript
{
  valid: true,
  payload: {
    brand_id: "...",
    user_id: "...",
    exp: 1234567890,
    ...
  }
}
```

**Output voorbeeld (ongeldig - expired):**
```javascript
{
  valid: false,
  reason: "Token expired",
  expiredAt: "2024-01-01T12:00:00.000Z",
  payload: {...}
}
```

**Output voorbeeld (ongeldig - brand mismatch):**
```javascript
{
  valid: false,
  reason: "Brand ID mismatch",
  jwtBrandId: "00000000-0000-0000-0000-000000000000",
  expectedBrandId: "11111111-1111-1111-1111-111111111111",
  payload: {...}
}
```

## JWT Token Decoderen

```javascript
// Decode de JWT token om de payload te zien
const headers = window.BuilderPublishAPI.contentApiHeaders();
window.BuilderPublishAPI.decodeJWT(headers.Authorization)
```

**Output:**
```javascript
{
  brand_id: "00000000-0000-0000-0000-000000000000",
  user_id: "...",
  exp: 1234567890,
  iat: 1234567890,
  ...
}
```

## Health Check

```javascript
// Check of alle vereiste parameters aanwezig zijn
await window.BuilderPublishAPI.healthCheck()
```

**Output:**
```javascript
{
  ok: true,
  missing: [],
  base: "https://xxx.supabase.co/functions/v1",
  hasAuth: true,
  hasApiKey: true,
  httpOk: true,
  status: 200
}
```

## Huidige Headers Bekijken

```javascript
// Bekijk welke headers worden gebruikt voor API calls
const headers = window.BuilderPublishAPI.contentApiHeaders();
console.log({
  hasAuthorization: !!headers.Authorization,
  hasApiKey: !!headers.apikey,
  authPreview: headers.Authorization ? headers.Authorization.substring(0, 20) + '...' : null,
  apikeyPreview: headers.apikey ? headers.apikey.substring(0, 20) + '...' : null
})
```

## API Base URL Bekijken

```javascript
// Check welke API base URL wordt gebruikt
console.log({
  customApi: window.BuilderPublishAPI.customApiBaseFromUrl?.() || null,
  boltApi: window.BOLT_API?.baseUrl || null,
  currentBrandId: window.CURRENT_BRAND_ID || null,
  currentToken: window.CURRENT_TOKEN ? 'SET' : 'NOT SET'
})
```

## Test News Save (Dry Run)

```javascript
// Test de news save functie met debug logging
// LET OP: Dit slaat ECHT op! Gebruik alleen voor testing.
const testData = {
  brand_id: new URL(window.location.href).searchParams.get('brand_id'),
  title: 'Test Artikel',
  slug: 'test-artikel-' + Date.now(),
  content: { json: {}, html: '<p>Test</p>' },
  status: 'draft'
};

console.log('Test data:', testData);
// Uncomment om echt te testen:
// await window.BuilderPublishAPI.news.saveDraft(testData)
```

## Alle URL Parameters Bekijken

```javascript
// Bekijk alle parameters in de huidige URL
const url = new URL(window.location.href);
const params = {};
url.searchParams.forEach((value, key) => {
  params[key] = key.includes('token') || key.includes('key') 
    ? value.substring(0, 10) + '...' 
    : value;
});
console.table(params);
```

## Edge Context Bekijken

```javascript
// Bekijk de edge context (als aanwezig)
console.log('Edge Context:', window.websiteBuilder?._edgeCtx || 'Not set');
```

## Volledige Diagnostics

```javascript
// Uitgebreide diagnostics
async function fullDiagnostics() {
  console.group('🔍 Full Diagnostics');
  
  // 1. URL Parameters
  console.group('📋 URL Parameters');
  const url = new URL(window.location.href);
  console.log('API:', url.searchParams.get('api'));
  console.log('Brand ID:', url.searchParams.get('brand_id'));
  console.log('Token:', url.searchParams.get('token') ? 'SET (length: ' + url.searchParams.get('token').length + ')' : 'NOT SET');
  console.log('API Key:', url.searchParams.get('apikey') ? 'SET' : 'NOT SET');
  console.log('Author Type:', url.searchParams.get('author_type'));
  console.log('Content Type:', url.searchParams.get('content_type'));
  console.groupEnd();
  
  // 2. JWT Validation
  console.group('🔐 JWT Validation');
  const jwtResult = window.BuilderPublishAPI.validateJWT();
  console.log('Valid:', jwtResult.valid);
  if (!jwtResult.valid) {
    console.error('Reason:', jwtResult.reason);
  }
  if (jwtResult.payload) {
    console.log('Brand ID in JWT:', jwtResult.payload.brand_id);
    console.log('User ID in JWT:', jwtResult.payload.user_id);
    console.log('Expires:', new Date(jwtResult.payload.exp * 1000));
  }
  console.groupEnd();
  
  // 3. Health Check
  console.group('🏥 Health Check');
  const health = await window.BuilderPublishAPI.healthCheck();
  console.log('Overall OK:', health.ok);
  console.log('Missing:', health.missing);
  console.log('API Base:', health.base);
  console.log('HTTP OK:', health.httpOk);
  console.log('Status:', health.status);
  console.groupEnd();
  
  // 4. Edge Context
  console.group('🌐 Edge Context');
  const edgeCtx = window.websiteBuilder?._edgeCtx;
  if (edgeCtx) {
    console.log('Kind:', edgeCtx.kind);
    console.log('Key:', edgeCtx.key);
    console.log('API:', edgeCtx.api);
    console.log('Token:', edgeCtx.token ? 'SET' : 'NOT SET');
  } else {
    console.log('Not set');
  }
  console.groupEnd();
  
  console.groupEnd();
  
  return {
    url: {
      api: url.searchParams.get('api'),
      brand_id: url.searchParams.get('brand_id'),
      hasToken: !!url.searchParams.get('token'),
      hasApiKey: !!url.searchParams.get('apikey')
    },
    jwt: jwtResult,
    health,
    edgeCtx
  };
}

// Run diagnostics
await fullDiagnostics();
```

## Gebruik

1. **Eerst altijd**: Run `fullDiagnostics()` om een compleet overzicht te krijgen
2. **Bij JWT problemen**: Run `validateJWT()` om te zien wat er mis is
3. **Bij API problemen**: Run `healthCheck()` om te zien welke parameters ontbreken

Deel de output van deze commands als je hulp nodig hebt met debugging!
