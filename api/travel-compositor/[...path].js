// Proxy for Travel Compositor API to avoid CORS issues
// Forwards all requests to TC API and adds CORS headers

export default async function handler(req, res) {
  // Get the path from the URL (everything after /api/travel-compositor/)
  const path = req.query.path ? req.query.path.join('/') : '';
  
  // Get TC API URL from environment
  const tcApiUrl = process.env.TC_API_URL || 'https://online.travelcompositor.com/resources';
  
  // Construct full URL
  const url = `${tcApiUrl}/${path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
  
  console.log('[TC Proxy] Forwarding request to:', url);
  
  try {
    // Forward the request to TC API
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward any authorization headers if present
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
      },
      ...(req.method !== 'GET' && req.method !== 'HEAD' && { body: JSON.stringify(req.body) })
    });
    
    // Get response data
    const data = await response.text();
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Forward status and response
    res.status(response.status);
    
    // Try to parse as JSON, otherwise send as text
    try {
      res.json(JSON.parse(data));
    } catch {
      res.send(data);
    }
    
  } catch (error) {
    console.error('[TC Proxy] Error:', error);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message 
    });
  }
}
