// Vercel Serverless Function: GET /api/accommodations
// List all hotels from Travel Compositor

export default async function handler(req, res) {
  try {
    const {
      TC_BASE_URL = '',
      TC_TOKEN = '',
      TC_USERNAME = '',
      TC_PASSWORD = '',
      TC_MICROSITE_ID = ''
    } = process.env;

    if (!TC_BASE_URL) {
      return res.status(500).json({ error: 'TC_BASE_URL not configured' });
    }

    const first = parseInt(req.query.first) || 0;
    const limit = Math.min(parseInt(req.query.limit) || 100, 20000);

    // Get auth token
    let token = TC_TOKEN;
    if (!token && TC_USERNAME && TC_PASSWORD && TC_MICROSITE_ID) {
      const origin = new URL(TC_BASE_URL).origin;
      const authUrl = `${origin}/resources/authentication/authenticate`;
      
      const authRes = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: TC_USERNAME, 
          password: TC_PASSWORD, 
          micrositeId: TC_MICROSITE_ID 
        })
      });
      
      if (authRes.ok) {
        const authData = await authRes.json();
        token = authData.token;
      }
    }

    if (!token) {
      return res.status(500).json({ error: 'Authentication failed' });
    }

    // Fetch accommodations
    const url = `${TC_BASE_URL}/accommodations?first=${first}&limit=${limit}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'auth-token': token
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('[Accommodations] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch accommodations', 
      detail: error.message 
    });
  }
}
