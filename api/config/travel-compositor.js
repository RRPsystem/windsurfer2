// API endpoint to expose Travel Compositor config from environment variables
// This keeps the TC API URL secure in Vercel environment variables

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return TC config from environment variables
  res.status(200).json({
    apiUrl: process.env.TC_API_URL || null,
    micrositeId: process.env.TC_MICROSITE_ID || 'rondreis-planner'
  });
}
