// Vercel Serverless Function: POST /api/travelbro/sync-travel
// Fetches Travel Compositor data by ID and writes directly to TravelBro's Supabase
//
// Usage: POST /api/travelbro/sync-travel
// Body: { "id": "12345", "micrositeId": "rondreis-planner", "trip_id": "uuid-optional" }
//
// This endpoint:
// 1. Fetches ALL data from Travel Compositor
// 2. Formats it for TravelBro AI
// 3. Writes directly to TravelBro's Supabase database
// 4. Returns the saved trip ID

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Webhook-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', allowed: ['POST'] });
  }

  try {
    // Validate webhook secret if provided
    const webhookSecret = req.headers['x-webhook-secret'];
    const expectedSecret = process.env.TRAVELBRO_WEBHOOK_SECRET;
    
    if (expectedSecret && webhookSecret !== expectedSecret) {
      console.warn('[TravelBro Sync] Invalid webhook secret');
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    // Parse request body
    const { 
      id,                    // TC Idea ID (required)
      micrositeId,           // TC Microsite ID (optional, uses default)
      language = 'NL',       // Language
      trip_id,               // Existing trip ID to update (optional)
      brand_id               // Brand ID for the trip (optional)
    } = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: id (Travel Compositor Idea ID)' 
      });
    }

    console.log('[TravelBro Sync] Starting sync for TC ID:', id);

    // ========================================
    // STEP 1: Fetch data from Travel Compositor
    // ========================================
    const tcData = await fetchTravelCompositorData(id, micrositeId, language);
    
    if (!tcData.success) {
      return res.status(tcData.status || 500).json({
        success: false,
        error: tcData.error,
        detail: tcData.detail
      });
    }

    console.log('[TravelBro Sync] TC data fetched successfully');

    // ========================================
    // STEP 2: Write to Supabase (same database as Website Builder)
    // ========================================
    const {
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    } = process.env;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      // If no Supabase credentials, just return the data
      console.log('[TravelBro Sync] No Supabase credentials, returning data only');
      return res.status(200).json({
        success: true,
        message: 'Data fetched but not saved (no Supabase credentials configured)',
        data: tcData.data,
        saved: false
      });
    }

    const savedTrip = await saveToTravelBro(
      tcData.data, 
      trip_id, 
      brand_id,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    if (!savedTrip.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to save to TravelBro',
        detail: savedTrip.error,
        data: tcData.data // Still return the data
      });
    }

    console.log('[TravelBro Sync] Saved to TravelBro:', savedTrip.trip_id);

    return res.status(200).json({
      success: true,
      message: 'Travel data synced successfully',
      trip_id: savedTrip.trip_id,
      tc_idea_id: id,
      saved: true,
      data: tcData.data
    });

  } catch (error) {
    console.error('[TravelBro Sync] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

/**
 * Fetch data from Travel Compositor API
 */
async function fetchTravelCompositorData(id, micrositeId, language) {
  const {
    TC_BASE_URL = '',
    TC_MICROSITE_ID = '',
    TC_MICROSITES = '',
    TC_TOKEN = '',
    TC_USERNAME = '',
    TC_PASSWORD = '',
    TC_TENANT_ID = ''
  } = process.env;

  if (!TC_BASE_URL) {
    return { success: false, error: 'TC_BASE_URL not configured', status: 500 };
  }

  const effectiveMicrositeId = micrositeId || TC_MICROSITE_ID;
  if (!effectiveMicrositeId) {
    return { success: false, error: 'Missing micrositeId', status: 400 };
  }

  // Get credentials
  let username = TC_USERNAME;
  let password = TC_PASSWORD;

  if (TC_MICROSITES) {
    try {
      const config = JSON.parse(TC_MICROSITES);
      if (config[effectiveMicrositeId]) {
        username = config[effectiveMicrositeId].username || username;
        password = config[effectiveMicrositeId].password || password;
      }
    } catch (e) {}
  }

  for (let i = 2; i <= 10; i++) {
    if (process.env[`TC_MICROSITE_ID_${i}`] === effectiveMicrositeId) {
      username = process.env[`TC_USERNAME_${i}`] || username;
      password = process.env[`TC_PASSWORD_${i}`] || password;
      break;
    }
  }

  const base = TC_BASE_URL.replace(/\/$/, '');
  const AUTH_PATH = process.env.TC_AUTH_PATH || '/resources/authentication/authenticate';
  const IDEAS_PATH = process.env.TC_TRAVELIDEA_PATH || '/resources/travelidea';

  // Authenticate
  let bearer = TC_TOKEN;
  if (!bearer) {
    if (!username || !password) {
      return { success: false, error: 'Missing TC credentials', status: 500 };
    }

    const authRes = await fetch(`${base}${AUTH_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        micrositeId: parseInt(effectiveMicrositeId) || effectiveMicrositeId
      })
    });

    const authData = await authRes.json().catch(() => null);
    if (!authRes.ok || !authData?.token) {
      return { success: false, error: 'TC authentication failed', status: 401 };
    }
    bearer = authData.token;
  }

  // Headers
  const headers = { 'Accept': 'application/json', 'auth-token': bearer };
  if (TC_TENANT_ID) headers['X-Tenant-Id'] = TC_TENANT_ID;

  const params = new URLSearchParams({
    language: String(language),
    lang: String(language),
    currency: 'EUR',
    adults: '2'
  });

  // Fetch both detail and info endpoints
  const detailUrl = `${base}${IDEAS_PATH}/${encodeURIComponent(effectiveMicrositeId)}/${encodeURIComponent(id)}?${params}`;
  const infoUrl = `${base}${IDEAS_PATH}/${encodeURIComponent(effectiveMicrositeId)}/info/${encodeURIComponent(id)}?${params}`;

  const [detailRes, infoRes] = await Promise.all([
    fetch(detailUrl, { headers }),
    fetch(infoUrl, { headers }).catch(() => null)
  ]);

  if (!detailRes.ok) {
    const errorText = await detailRes.text();
    return { success: false, error: `TC API error: ${detailRes.status}`, detail: errorText, status: detailRes.status };
  }

  const tcData = await detailRes.json();
  let tcInfo = null;
  if (infoRes && infoRes.ok) {
    try { tcInfo = await infoRes.json(); } catch (e) {}
  }

  // Format the data
  const formattedData = formatForTravelBroAI(tcData, tcInfo, id, language);

  return { success: true, data: formattedData, raw: { detail: tcData, info: tcInfo } };
}

/**
 * Save trip data to TravelBro's Supabase
 */
async function saveToTravelBro(data, existingTripId, brandId, supabaseUrl, serviceKey) {
  try {
    // Prepare the trip record
    const tripRecord = {
      // Use existing ID or let Supabase generate one
      ...(existingTripId && { id: existingTripId }),
      
      // Basic info
      title: data.title,
      slug: data.tc_idea_id, // Use TC ID as slug for easy lookup
      description: data.description,
      
      // Introduction texts
      intro_text: data.intro_text,
      short_description: data.short_description,
      
      // Media
      featured_image: data.featured_image,
      images: data.all_images,
      
      // Duration
      duration_days: data.duration_days,
      duration_nights: data.duration_nights,
      
      // Pricing
      total_price: data.total_price,
      price_per_person: data.price_per_person,
      currency: data.currency,
      price_breakdown: data.price_breakdown,
      
      // Locations
      destinations: data.destinations,
      destination_names: data.destination_names,
      countries: data.countries,
      
      // Components
      hotels: data.hotels,
      flights: data.flights,
      other_transports: data.other_transports,
      car_rentals: data.car_rentals,
      activities: data.activities,
      
      // Itinerary
      itinerary: data.itinerary,
      
      // Travelers
      travelers: data.travelers,
      
      // Included/excluded
      included: data.included,
      not_included: data.not_included,
      
      // Practical info
      practical_info: data.practical_info,
      
      // AI helpers
      ai_summary: data.ai_summary,
      all_texts: data.all_texts,
      trip_highlights: data.trip_highlights,
      selling_points: data.selling_points,
      
      // Metadata
      tc_idea_id: data.tc_idea_id,
      source: 'travel_compositor',
      language: data.language,
      
      // Brand association
      ...(brandId && { brand_id: brandId }),
      
      // Timestamps
      updated_at: new Date().toISOString()
    };

    // If no existing ID, add created_at
    if (!existingTripId) {
      tripRecord.created_at = new Date().toISOString();
    }

    // Upsert to Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(tripRecord)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TravelBro Sync] Supabase error:', response.status, errorText);
      return { success: false, error: errorText };
    }

    const savedData = await response.json();
    const savedTrip = Array.isArray(savedData) ? savedData[0] : savedData;

    return { success: true, trip_id: savedTrip?.id || existingTripId };

  } catch (error) {
    console.error('[TravelBro Sync] Save error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Format Travel Compositor data for TravelBro AI
 * (Same comprehensive formatting as get-travel.js)
 */
function formatForTravelBroAI(tcData, tcInfo, ideaId, language) {
  const tripName = tcData.name || tcData.title || tcInfo?.name || '';
  const tripDescription = tcData.description || tcInfo?.description || '';
  const introText = tcData.intro || tcData.introduction || tcInfo?.intro || tcInfo?.introduction || '';
  const shortDescription = tcData.shortDescription || tcData.summary || tcInfo?.shortDescription || '';
  const highlights = tcData.highlights || tcInfo?.highlights || [];
  const sellingPoints = tcData.sellingPoints || tcData.usps || tcInfo?.sellingPoints || [];

  const destinationNames = [...new Set(tcData.destinations?.map(d => d.name) || [])];
  const countries = [...new Set(tcData.destinations?.map(d => d.country).filter(Boolean) || [])];
  const totalNights = tcData.hotels?.reduce((sum, h) => sum + (h.nights || 0), 0) || 0;
  const totalDays = totalNights + 1;

  // Destinations
  const destinations = tcData.destinations?.map(d => ({
    name: d.name,
    country: d.country,
    region: d.region,
    description: d.description,
    highlights: d.highlights || [],
    images: d.imageUrls || d.images || [],
    latitude: d.latitude || d.lat,
    longitude: d.longitude || d.lng,
    nights: d.nights
  })) || [];

  // Hotels with full descriptions
  const hotels = tcData.hotels?.map(h => {
    const hotelData = h.hotelData || h.hotel || {};
    return {
      name: hotelData.name || h.name,
      stars: hotelData.stars || h.stars,
      category: hotelData.category,
      description: hotelData.description || h.description || '',
      shortDescription: hotelData.shortDescription || hotelData.summary || '',
      longDescription: hotelData.longDescription || hotelData.fullDescription || '',
      highlights: hotelData.highlights || [],
      address: hotelData.address || h.address,
      city: hotelData.city || h.city,
      country: hotelData.country,
      area: hotelData.area || hotelData.neighborhood,
      latitude: hotelData.latitude || hotelData.lat,
      longitude: hotelData.longitude || hotelData.lng,
      checkIn: h.checkIn,
      checkOut: h.checkOut,
      nights: h.nights,
      roomType: h.roomType || h.room?.type,
      roomName: h.roomName || h.room?.name,
      roomDescription: h.roomDescription || h.room?.description,
      mealPlan: h.mealPlan || h.board,
      mealPlanDescription: getMealPlanDescription(h.mealPlan || h.board, language),
      facilities: hotelData.facilities || hotelData.amenities || [],
      images: hotelData.images?.map(img => typeof img === 'string' ? img : img.url) || [],
      phone: hotelData.phone,
      email: hotelData.email,
      website: hotelData.website,
      price: h.priceBreakdown?.totalPrice?.microsite?.amount || h.price,
      checkInTime: hotelData.checkInTime || '15:00',
      checkOutTime: hotelData.checkOutTime || '11:00',
      rating: hotelData.rating || hotelData.guestRating
    };
  }) || [];

  // Flights
  const flights = tcData.transports?.filter(t => t.type === 'FLIGHT' || t.type === 'flight').map(f => ({
    type: 'flight',
    carrier: f.carrier || f.airline,
    carrierName: f.carrierName || f.airlineName,
    flightNumber: f.flightNumber || f.number,
    departureAirport: f.departure || f.from,
    departureAirportCode: f.departureCode || f.fromCode,
    departureDate: f.departureDate,
    departureTime: f.departureTime,
    arrivalAirport: f.arrival || f.to,
    arrivalAirportCode: f.arrivalCode || f.toCode,
    arrivalDate: f.arrivalDate,
    arrivalTime: f.arrivalTime,
    duration: f.duration,
    class: f.class || f.cabinClass,
    baggageIncluded: f.baggageIncluded,
    stops: f.stops || 0,
    price: f.priceBreakdown?.totalPrice?.microsite?.amount || f.price
  })) || [];

  // Other transports
  const otherTransports = tcData.transports?.filter(t => t.type !== 'FLIGHT' && t.type !== 'flight').map(t => ({
    type: t.type?.toLowerCase() || 'transport',
    carrier: t.carrier,
    from: t.departure || t.from,
    to: t.arrival || t.to,
    departureDate: t.departureDate,
    departureTime: t.departureTime,
    arrivalTime: t.arrivalTime,
    duration: t.duration,
    price: t.priceBreakdown?.totalPrice?.microsite?.amount || t.price
  })) || [];

  // Car rentals
  const carRentals = tcData.cars?.map(c => ({
    company: c.company || c.supplier,
    category: c.category,
    carType: c.carType || c.vehicle,
    pickupLocation: c.pickUp || c.pickup,
    pickupDate: c.pickupDate,
    dropoffLocation: c.dropOff || c.dropoff,
    dropoffDate: c.dropoffDate,
    days: c.days,
    transmission: c.transmission,
    mileage: c.mileage || 'unlimited',
    price: c.priceBreakdown?.totalPrice?.microsite?.amount || c.price
  })) || [];

  // Activities
  const activities = tcData.activities?.map(a => ({
    name: a.name || a.title,
    description: a.description,
    date: a.date,
    duration: a.duration,
    location: a.location,
    price: a.price,
    images: a.images || []
  })) || [];

  // Itinerary
  const itinerary = tcData.days?.map((day, index) => ({
    dayNumber: index + 1,
    date: day.date,
    title: day.title || day.name,
    description: day.description,
    destination: day.destination,
    hotel: day.hotel,
    activities: day.activities || [],
    highlights: day.highlights || []
  })) || [];

  // Pricing
  let totalPrice = 0;
  const priceBreakdown = { hotels: 0, flights: 0, otherTransport: 0, carRentals: 0, activities: 0 };
  hotels.forEach(h => { priceBreakdown.hotels += h.price || 0; });
  flights.forEach(f => { priceBreakdown.flights += f.price || 0; });
  otherTransports.forEach(t => { priceBreakdown.otherTransport += t.price || 0; });
  carRentals.forEach(c => { priceBreakdown.carRentals += c.price || 0; });
  activities.forEach(a => { priceBreakdown.activities += a.price || 0; });
  totalPrice = Object.values(priceBreakdown).reduce((sum, val) => sum + val, 0);
  if (tcData.totalPrice?.microsite?.amount) totalPrice = tcData.totalPrice.microsite.amount;

  // Travelers
  const travelers = {
    adults: tcData.adults || tcData.travelers?.adults || 2,
    children: tcData.children || tcData.travelers?.children || 0,
    infants: tcData.infants || tcData.travelers?.infants || 0
  };

  // Practical info
  const practicalInfo = {
    visaRequired: tcInfo?.visaRequired,
    passportRequired: tcInfo?.passportRequired,
    vaccinationsRecommended: tcInfo?.vaccinations || [],
    localCurrency: tcInfo?.currency,
    timezone: tcInfo?.timezone,
    plugType: tcInfo?.plugType
  };

  // Included
  const included = tcData.included || tcInfo?.included || [];
  const notIncluded = tcData.notIncluded || tcInfo?.notIncluded || [];

  // Images
  const allImages = [];
  destinations.forEach(d => allImages.push(...(d.images || [])));
  hotels.forEach(h => allImages.push(...(h.images || [])));
  const featuredImage = allImages[0] || '';

  // Title
  const title = tripName || (destinationNames.length > 0
    ? `Rondreis ${destinationNames.slice(0, 3).join(', ')}${destinationNames.length > 3 ? '...' : ''}`
    : `Reis ${ideaId}`);

  // AI Summary
  const aiSummary = buildAISummary({ title, totalDays, totalNights, destinationNames, countries, hotels, flights, carRentals, totalPrice, travelers });

  // All texts for AI
  const allTexts = {
    trip_intro: introText,
    trip_description: tripDescription,
    short_description: shortDescription,
    destination_descriptions: destinations.map(d => ({ name: d.name, description: d.description })),
    hotel_descriptions: hotels.map(h => ({ name: h.name, description: h.description, shortDescription: h.shortDescription, highlights: h.highlights })),
    day_descriptions: itinerary.map(d => ({ day: d.dayNumber, title: d.title, description: d.description }))
  };

  return {
    tc_idea_id: ideaId,
    title,
    description: tripDescription,
    intro_text: introText,
    short_description: shortDescription,
    trip_highlights: highlights,
    selling_points: sellingPoints,
    featured_image: featuredImage,
    all_images: [...new Set(allImages)],
    duration_days: totalDays,
    duration_nights: totalNights,
    destinations,
    destination_names: destinationNames,
    countries,
    hotels,
    flights,
    other_transports: otherTransports,
    car_rentals: carRentals,
    activities,
    itinerary,
    total_price: Math.round(totalPrice),
    price_breakdown: priceBreakdown,
    currency: 'EUR',
    price_per_person: travelers.adults > 0 ? Math.round(totalPrice / travelers.adults) : totalPrice,
    travelers,
    included,
    not_included: notIncluded,
    practical_info: practicalInfo,
    ai_summary: aiSummary,
    all_texts: allTexts,
    language
  };
}

function getMealPlanDescription(mealPlan, language) {
  const descriptions = {
    'RO': { NL: 'Logies', EN: 'Room Only' },
    'BB': { NL: 'Logies met ontbijt', EN: 'Bed & Breakfast' },
    'HB': { NL: 'Halfpension', EN: 'Half Board' },
    'FB': { NL: 'Volpension', EN: 'Full Board' },
    'AI': { NL: 'All Inclusive', EN: 'All Inclusive' }
  };
  return descriptions[mealPlan]?.[language] || descriptions[mealPlan]?.['EN'] || mealPlan;
}

function buildAISummary({ title, totalDays, totalNights, destinationNames, countries, hotels, flights, carRentals, totalPrice, travelers }) {
  const parts = [];
  parts.push(`${title} - ${totalDays} dagen / ${totalNights} nachten`);
  if (destinationNames.length > 0) parts.push(`Bestemmingen: ${destinationNames.join(', ')}`);
  if (countries.length > 0) parts.push(`Landen: ${countries.join(', ')}`);
  if (flights.length > 0) {
    const outbound = flights[0];
    if (outbound) parts.push(`Heenvlucht: ${outbound.departureAirport} → ${outbound.arrivalAirport} (${outbound.carrier} ${outbound.flightNumber || ''})`);
  }
  if (hotels.length > 0) {
    parts.push(`Accommodaties: ${hotels.map(h => `${h.name} (${h.nights} nachten)`).join('; ')}`);
  }
  if (carRentals.length > 0) {
    parts.push(`Huurauto: ${carRentals.map(c => `${c.company} ${c.category} (${c.days} dagen)`).join('; ')}`);
  }
  parts.push(`Totaalprijs: €${Math.round(totalPrice)} (€${Math.round(totalPrice / (travelers.adults || 1))} p.p.)`);
  return parts.join('\n');
}
