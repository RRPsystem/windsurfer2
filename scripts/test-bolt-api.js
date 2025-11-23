// Quick test to check if BOLT API is reachable

const BOLT_API = 'https://huaaogdxxdcakxryecnw.supabase.co/functions/v1/register-external-templates';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YWFvZ2R4eGRjYWt4cnllY253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MDY2OTAsImV4cCI6MjA3OTI2NjY5MH0.ygqwQNOpbJqe9NHtlxLCIlmVk2j5Mkcw4qvMpkGyeY0';

async function testAPI() {
  console.log('🧪 Testing BOLT API...');
  console.log(`URL: ${BOLT_API}\n`);

  const testPayload = {
    builder_name: 'AI Website Studio Test',
    builder_url: 'https://www.ai-websitestudio.nl',
    templates: [
      {
        category: 'test',
        category_preview_url: 'https://example.com/preview.png',
        pages: [
          {
            template_name: 'Test Page',
            page_slug: 'test',
            preview_image_url: 'https://example.com/test.png',
            html_content: '<html><body><h1>Test</h1></body></html>',
            order_index: 0
          }
        ]
      }
    ]
  };

  console.log('📤 Sending test payload with apikey...');

  try {
    const response = await fetch(BOLT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`📡 Response status: ${response.status}`);
    
    const text = await response.text();
    console.log(`📄 Response body: ${text}\n`);

    if (response.ok) {
      console.log('✅ API is working!');
    } else {
      console.log('❌ API returned error');
    }
  } catch (error) {
    console.error('❌ FAILED:', error.message);
  }
}

testAPI().catch(console.error);
