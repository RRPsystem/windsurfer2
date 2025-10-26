// Vercel Serverless Function: GET /api/config/media
// Returns media API keys from environment variables (for frontend use)

export default async function handler(req, res) {
  try {
    // Only return keys that are safe to expose to frontend
    const config = {
      pexelsKey: process.env.PEXELS_API_KEY || '',
      unsplashKey: process.env.UNSPLASH_ACCESS_KEY || '',
      youtubeKey: process.env.YOUTUBE_API_KEY || ''
    };

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    return res.status(200).json(config);
  } catch (error) {
    console.error('[MediaConfig] Error:', error);
    return res.status(500).json({ 
      error: 'Config load failed', 
      detail: error.message 
    });
  }
}
