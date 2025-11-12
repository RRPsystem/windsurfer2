// Proxy for Travel Compositor API to avoid CORS issues
// Forwards requests to TC API and adds CORS headers

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Get the path from query parameter
  const path = req.query.path || '';
  
  // Get TC API URL from environment
  const tcApiUrl = process.env.TC_API_URL || 'https://online.travelcompositor.com/resources';
  
  // Construct full URL - preserve query string
  const queryString = new URLSearchParams(req.query).toString();
  const url = `${tcApiUrl}/${path}${queryString ? '?' + queryString : ''}`;
  
  console.log('[TC Proxy] Forwarding request to:', url);
  
  try {
    // Forward the request to TC API
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Forward any authorization headers if present
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
      },
      ...(req.method !== 'GET' && req.method !== 'HEAD' && req.body && { body: JSON.stringify(req.body) })
    });
    
    // Get response data
    const data = await response.text();
    
    console.log('[TC Proxy] Response status:', response.status);
    
    // Forward status
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
