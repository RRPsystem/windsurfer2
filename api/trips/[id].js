// Vercel Serverless Function: GET /api/trips/[id]
// Fetches trip data from Supabase for Video Studio deeplinks

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing trip id' });
    }

    // Get Supabase credentials from environment
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error('[trips/id] Missing Supabase credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Fetch trip from Supabase
    const tripUrl = `${SUPABASE_URL}/rest/v1/trips?id=eq.${encodeURIComponent(id)}&select=*`;
    
    const tripResponse = await fetch(tripUrl, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!tripResponse.ok) {
      console.error('[trips/id] Supabase error:', tripResponse.status);
      return res.status(tripResponse.status).json({ error: 'Failed to fetch trip' });
    }

    const trips = await tripResponse.json();
    
    if (!trips || trips.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const trip = trips[0];

    // Extract destinations from trip content
    let destinations = [];
    
    // Try to get destinations from various possible fields
    if (trip.content?.destinations) {
      destinations = trip.content.destinations;
    } else if (trip.content?.days) {
      // Extract destinations from days/itinerary
      destinations = trip.content.days
        .filter(day => day.destination || day.location || day.city)
        .map(day => ({
          name: day.destination || day.location || day.city,
          description: day.description || ''
        }));
    } else if (trip.content?.itinerary) {
      destinations = trip.content.itinerary
        .filter(item => item.destination || item.location || item.city)
        .map(item => ({
          name: item.destination || item.location || item.city,
          description: item.description || ''
        }));
    } else if (trip.destinations) {
      destinations = trip.destinations;
    }

    // Remove duplicates
    const uniqueDestinations = [];
    const seen = new Set();
    for (const dest of destinations) {
      const name = typeof dest === 'string' ? dest : dest.name;
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        uniqueDestinations.push(typeof dest === 'string' ? { name: dest } : dest);
      }
    }

    // Build response in format expected by Video Studio
    const response = {
      id: trip.id,
      title: trip.title || trip.name || 'Untitled Trip',
      name: trip.title || trip.name,
      slug: trip.slug,
      description: trip.description || trip.content?.description || '',
      destinations: uniqueDestinations,
      duration: trip.duration || trip.content?.duration,
      image: trip.image || trip.content?.image || trip.content?.hero_image,
      created_at: trip.created_at,
      updated_at: trip.updated_at
    };

    console.log('[trips/id] Returning trip:', response.title, 'with', uniqueDestinations.length, 'destinations');

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json(response);

  } catch (error) {
    console.error('[trips/id] Error:', error);
    return res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
}
