// Storyblocks Video Search API Route
// Proxies requests to Storyblocks API using HMAC authentication
import crypto from 'crypto';

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

  const publicKey = process.env.STORYBLOCKS_PUBLIC_KEY;
  const privateKey = process.env.STORYBLOCKS_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.error('[Storyblocks API] API keys not configured');
    return res.status(500).json({ 
      error: 'Storyblocks API niet geconfigureerd',
      detail: 'Voeg STORYBLOCKS_PUBLIC_KEY en STORYBLOCKS_PRIVATE_KEY toe aan environment variables'
    });
  }

  try {
    // Storyblocks API v2 uses HMAC authentication
    // Resource path for video search
    const resource = '/api/v2/videos/search';
    
    // Expiration time (1 hour from now)
    const expires = Math.floor(Date.now() / 1000) + 3600;
    
    // Generate HMAC: SHA-256 of resource using (privateKey + expires) as key
    const hmacKey = privateKey + expires;
    const hmac = crypto.createHmac('sha256', hmacKey).update(resource).digest('hex');
    
    // Build URL with auth params
    const baseUrl = 'https://api.storyblocks.com';
    const url = `${baseUrl}${resource}?keywords=${encodeURIComponent(query)}&page=${page}&results_per_page=20&APIKEY=${publicKey}&EXPIRES=${expires}&HMAC=${hmac}`;
    
    console.log('[Storyblocks API] Searching:', query, 'page:', page);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AI-TravelVideo/1.0'
      }
    });

    console.log('[Storyblocks API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Storyblocks API] Error response:', errorText);
      
      let errorDetails = errorText;
      try {
        errorDetails = JSON.parse(errorText);
      } catch (e) {}
      
      return res.status(response.status).json({ 
        error: 'Storyblocks API error',
        status: response.status,
        details: errorDetails
      });
    }

    const data = await response.json();
    console.log('[Storyblocks API] Success:', data.info?.total_results || data.total_results || 0, 'results');

    // Normalize response format
    const results = data.results || data.videos || [];
    const normalizedResults = results.map(video => ({
      id: video.id,
      title: video.title || video.name,
      description: video.description,
      duration: video.duration,
      width: video.width,
      height: video.height,
      thumbnail_url: video.thumbnail_url || video.thumbnails?.large || video.thumbnails?.medium,
      preview_urls: {
        mp4_preview: video.preview_urls?.mp4 || video.preview_url || video.preview_mp4,
        webm_preview: video.preview_urls?.webm || video.preview_webm
      },
      download_url: video.formats?.['4k']?.url || video.formats?.hd?.url || video.formats?.sd?.url || video.preview_url
    }));

    return res.status(200).json({
      results: normalizedResults,
      info: {
        total_results: data.info?.total_results || data.total_results || results.length,
        page: parseInt(page),
        results_per_page: 20
      }
    });

  } catch (error) {
    console.error('[Storyblocks API] Exception:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}
