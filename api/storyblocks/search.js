// Storyblocks Video Search API Route
// Proxies requests to Storyblocks API using server-side API key

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, page = 1 } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter required' });
  }

  const apiKey = process.env.STORYBLOCKS_PUBLIC_KEY;

  if (!apiKey) {
    console.error('[Storyblocks API] STORYBLOCKS_PUBLIC_KEY not found in environment variables');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Storyblocks API endpoint
    const url = `https://api.graphicstock.com/api/v2/videos/search?keywords=${encodeURIComponent(query)}&page=${page}&results_per_page=20&media_type=video`;
    
    console.log('[Storyblocks API] Searching:', query, 'page:', page);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Storyblocks API] Error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Storyblocks API error',
        details: errorText 
      });
    }

    const data = await response.json();
    console.log('[Storyblocks API] Success:', data.info?.total_results || 0, 'results');

    return res.status(200).json(data);

  } catch (error) {
    console.error('[Storyblocks API] Exception:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
