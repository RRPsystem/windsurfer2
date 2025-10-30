// BOLT Database Configuration
// Connects Website Builder to BOLT's Supabase trips-api

window.BOLT_DB = {
  url: 'https://huaaogdxxdcakxryecnw.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YWFvZ2R4eGRjYWt4cnllY253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MzY3MzMsImV4cCI6MjA3NDIxMjczM30.EqZK_6xjEAVwUtsYj6nENe4x8-7At_oRAVsPMDvJBSI',
  
  // Brand ID - Vraag aan BOLT welke brand_id je moet gebruiken
  // Of gebruik 'default' voor test data
  brandId: 'default' // ⚠️ WIJZIG DIT naar jouw brand_id
};

console.log('[BOLT] ✅ Configuration loaded:', {
  url: window.BOLT_DB.url,
  hasKey: !!window.BOLT_DB.anonKey,
  keyLength: window.BOLT_DB.anonKey.length
});

// Test connectie (optioneel)
if (window.location.search.includes('test-bolt')) {
  (async () => {
    try {
      console.log('[BOLT] Testing connection...');
      const response = await fetch(`${window.BOLT_DB.url}/functions/v1/trips-api?for_builder=true`, {
        headers: {
          'Authorization': `Bearer ${window.BOLT_DB.anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[BOLT] ✅ Connection successful! Found', data.length, 'trips');
      } else {
        console.error('[BOLT] ❌ Connection failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('[BOLT] ❌ Connection error:', error);
    }
  })();
}
