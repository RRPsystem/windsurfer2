// Debug helper for Bolt integration
// Run in browser console: checkBoltConfig()

window.checkBoltConfig = function() {
  console.log('=== BOLT CONFIGURATION CHECK ===');
  
  // Check URL parameters
  const url = new URL(window.location.href);
  console.log('\n📍 URL Parameters:');
  console.log('  brand_id:', url.searchParams.get('brand_id') || '❌ MISSING');
  console.log('  token:', url.searchParams.get('token') ? '✅ Present' : '❌ MISSING');
  console.log('  api:', url.searchParams.get('api') || '❌ MISSING');
  console.log('  apikey:', url.searchParams.get('apikey') || url.searchParams.get('api_key') || '❌ MISSING');
  
  // Check global variables
  console.log('\n🌍 Global Variables:');
  console.log('  window.CURRENT_BRAND_ID:', window.CURRENT_BRAND_ID || '❌ NOT SET');
  console.log('  window.CURRENT_TOKEN:', window.CURRENT_TOKEN ? '✅ Set' : '❌ NOT SET');
  console.log('  window.BOLT_API:', window.BOLT_API || '❌ NOT SET');
  if (window.BOLT_API) {
    console.log('    - baseUrl:', window.BOLT_API.baseUrl || '❌ NOT SET');
    console.log('    - apiKey:', window.BOLT_API.apiKey ? '✅ Set' : '❌ NOT SET');
  }
  console.log('  window.FnClient:', window.FnClient || '❌ NOT SET');
  if (window.FnClient) {
    console.log('    - functionsBase():', window.FnClient.functionsBase ? window.FnClient.functionsBase() : '❌ NOT SET');
  }
  
  // Check what's needed for import
  console.log('\n✅ Requirements for "Importeer mijn pagina\'s":');
  const hasAll = window.CURRENT_BRAND_ID && 
                 (window.FnClient?.functionsBase?.() || window.BOLT_API?.baseUrl);
  
  if (hasAll) {
    console.log('  ✅ All required config present!');
    console.log('  Ready to import pages from Bolt.');
  } else {
    console.log('  ❌ Missing required config!');
    console.log('\n🔧 To fix, add URL parameters:');
    console.log('  Example URL:');
    console.log('  ' + window.location.origin + window.location.pathname + 
                '?brand_id=YOUR_BRAND_ID&token=YOUR_TOKEN&api=https://your-bolt-api.com&apikey=YOUR_API_KEY');
  }
  
  console.log('\n=================================');
  
  return {
    urlParams: {
      brand_id: url.searchParams.get('brand_id'),
      token: url.searchParams.get('token'),
      api: url.searchParams.get('api'),
      apikey: url.searchParams.get('apikey') || url.searchParams.get('api_key')
    },
    globals: {
      CURRENT_BRAND_ID: window.CURRENT_BRAND_ID,
      CURRENT_TOKEN: window.CURRENT_TOKEN ? '[PRESENT]' : null,
      BOLT_API: window.BOLT_API,
      FnClient: window.FnClient ? 'Present' : null
    },
    ready: hasAll
  };
};

// Auto-run on load
if (document.readyState === 'complete') {
  setTimeout(() => {
    console.log('💡 Run checkBoltConfig() in console to debug Bolt integration');
  }, 1000);
} else {
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('💡 Run checkBoltConfig() in console to debug Bolt integration');
    }, 1000);
  });
}
