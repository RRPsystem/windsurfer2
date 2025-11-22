// Vercel Serverless Function: GET /api/ideas/test
// Test endpoint to verify Travel Compositor configuration

export default async function handler(req, res) {
  try {
    const {
      TC_BASE_URL = '',
      TC_MICROSITE_ID = '',
      TC_TOKEN = '',
      TC_USERNAME = '',
      TC_PASSWORD = '',
      TC_TENANT_ID = ''
    } = process.env;

    // Return configuration status (without exposing sensitive values)
    const config = {
      hasBaseUrl: !!TC_BASE_URL,
      baseUrl: TC_BASE_URL ? TC_BASE_URL.substring(0, 30) + '...' : 'NOT SET',
      hasMicrositeId: !!TC_MICROSITE_ID,
      micrositeId: TC_MICROSITE_ID ? TC_MICROSITE_ID.substring(0, 5) + '...' : 'NOT SET',
      hasToken: !!TC_TOKEN,
      hasUsername: !!TC_USERNAME,
      hasPassword: !!TC_PASSWORD,
      hasTenantId: !!TC_TENANT_ID,
      authMode: TC_TOKEN ? 'static_token' : (TC_USERNAME && TC_PASSWORD ? 'username_password' : 'none'),
      timestamp: new Date().toISOString()
    };

    // Check if minimum requirements are met
    const isConfigured = TC_BASE_URL && TC_MICROSITE_ID && (TC_TOKEN || (TC_USERNAME && TC_PASSWORD));

    return res.status(200).json({
      ok: isConfigured,
      message: isConfigured 
        ? 'Travel Compositor API is configured' 
        : 'Missing required environment variables',
      config,
      requiredVars: [
        'TC_BASE_URL',
        'TC_MICROSITE_ID',
        'TC_TOKEN or (TC_USERNAME + TC_PASSWORD)'
      ]
    });

  } catch (e) {
    return res.status(500).json({ 
      ok: false,
      error: 'Test endpoint failure', 
      detail: e?.message || String(e) 
    });
  }
}
