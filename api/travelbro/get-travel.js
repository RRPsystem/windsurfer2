// Vercel Serverless Function: GET /api/travelbro/get-travel
// COMPREHENSIVE endpoint for TravelBro AI Bot to fetch ALL Travel Compositor data by ID
//
// Usage: GET /api/travelbro/get-travel?id=12345&micrositeId=rondreis-planner
//
// Returns MAXIMUM data for AI bot to answer traveler questions:
// - Full trip details (destinations, hotels, flights, cars)
// - Day-by-day itinerary with activities
// - Pricing breakdown
// - Images and descriptions
// - Practical info (check-in times, meal plans, etc.)

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
    const { id, micrositeId, language = 'NL' } = req.query;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameter: id (Travel Compositor Idea ID)' 
      });
    }

    // Environment variables
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
      return res.status(500).json({ success: false, error: 'TC_BASE_URL not configured' });
    }

    const effectiveMicrositeId = micrositeId || TC_MICROSITE_ID;
    if (!effectiveMicrositeId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing micrositeId parameter or TC_MICROSITE_ID env var' 
      });
    }

    // Get credentials for this microsite
    let username = TC_USERNAME;
    let password = TC_PASSWORD;

    // Check TC_MICROSITES JSON config
    if (TC_MICROSITES) {
      try {
        const config = JSON.parse(TC_MICROSITES);
        if (config[effectiveMicrositeId]) {
          username = config[effectiveMicrositeId].username || username;
          password = config[effectiveMicrositeId].password || password;
        }
      } catch (e) {
        console.warn('[TravelBro] Failed to parse TC_MICROSITES');
      }
    }

    // Check numbered suffix pattern
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
        return res.status(500).json({ success: false, error: 'Missing TC credentials' });
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
        return res.status(401).json({ success: false, error: 'TC authentication failed' });
      }
      bearer = authData.token;
    }

    // Headers for TC API
    const headers = { 
      'Accept': 'application/json',
      'auth-token': bearer
    };
    if (TC_TENANT_ID) headers['X-Tenant-Id'] = TC_TENANT_ID;

    const params = new URLSearchParams({
      language: String(language),
      lang: String(language),
      currency: 'EUR',
      adults: '2'
    });

    // FETCH BOTH: Regular detail endpoint AND info endpoint for MAXIMUM data
    const detailUrl = `${base}${IDEAS_PATH}/${encodeURIComponent(effectiveMicrositeId)}/${encodeURIComponent(id)}?${params}`;
    const infoUrl = `${base}${IDEAS_PATH}/${encodeURIComponent(effectiveMicrositeId)}/info/${encodeURIComponent(id)}?${params}`;
    
    console.log('[TravelBro] Fetching detail:', detailUrl);
    console.log('[TravelBro] Fetching info:', infoUrl);

    // Fetch both in parallel for speed
    const [detailRes, infoRes] = await Promise.all([
      fetch(detailUrl, { headers }),
      fetch(infoUrl, { headers }).catch(() => null) // Info endpoint might not exist
    ]);
    
    if (!detailRes.ok) {
      const errorText = await detailRes.text();
      console.error('[TravelBro] TC API error:', detailRes.status, errorText);
      return res.status(detailRes.status).json({ 
        success: false, 
        error: `Travel Compositor error: ${detailRes.status}`,
        detail: errorText
      });
    }

    const tcData = await detailRes.json();
    let tcInfo = null;
    
    // Try to get info data (extra details)
    if (infoRes && infoRes.ok) {
      try {
        tcInfo = await infoRes.json();
        console.log('[TravelBro] Info data received:', Object.keys(tcInfo));
      } catch (e) {
        console.warn('[TravelBro] Could not parse info response');
      }
    }

    console.log('[TravelBro] TC data received:', {
      destinations: tcData.destinations?.length || 0,
      hotels: tcData.hotels?.length || 0,
      transports: tcData.transports?.length || 0,
      cars: tcData.cars?.length || 0,
      days: tcData.days?.length || 0,
      hasInfo: !!tcInfo
    });

    // Format COMPREHENSIVE data for TravelBro AI
    const travelBroData = formatForTravelBroAI(tcData, tcInfo, id, language);

    return res.status(200).json({
      success: true,
      data: travelBroData,
      raw: {
        detail: tcData,
        info: tcInfo
      }
    });

  } catch (error) {
    console.error('[TravelBro] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

/**
 * Format Travel Compositor data COMPREHENSIVELY for TravelBro AI Bot
 * Extracts ALL available data so the AI can answer any traveler question
 */
function formatForTravelBroAI(tcData, tcInfo, ideaId, language) {
  // ============================================
  // TRIP OVERVIEW - Basic info for quick answers
  // ============================================
  const tripName = tcData.name || tcData.title || tcInfo?.name || '';
  const tripDescription = tcData.description || tcInfo?.description || '';
  
  // Introduction texts - important for AI to set context
  const introText = tcData.intro || tcData.introduction || tcInfo?.intro || tcInfo?.introduction || '';
  const shortDescription = tcData.shortDescription || tcData.summary || tcInfo?.shortDescription || '';
  const highlights = tcData.highlights || tcInfo?.highlights || [];
  const sellingPoints = tcData.sellingPoints || tcData.usps || tcInfo?.sellingPoints || [];
  
  // Extract all destination names
  const destinationNames = [...new Set(tcData.destinations?.map(d => d.name) || [])];
  const countries = [...new Set(tcData.destinations?.map(d => d.country).filter(Boolean) || [])];
  
  // Calculate duration
  const totalNights = tcData.hotels?.reduce((sum, h) => sum + (h.nights || 0), 0) || 0;
  const totalDays = totalNights + 1;
  
  // ============================================
  // DESTINATIONS - Where they're going
  // ============================================
  const destinations = tcData.destinations?.map(d => ({
    name: d.name,
    country: d.country,
    region: d.region,
    description: d.description,
    highlights: d.highlights || [],
    images: d.imageUrls || d.images || [],
    // Coordinates for maps
    latitude: d.latitude || d.lat,
    longitude: d.longitude || d.lng,
    // Time spent here
    nights: d.nights,
    // Local info
    timezone: d.timezone,
    currency: d.currency,
    language: d.language
  })) || [];

  // ============================================
  // HOTELS - Accommodation details
  // ============================================
  const hotels = tcData.hotels?.map(h => {
    const hotelData = h.hotelData || h.hotel || {};
    return {
      // Basic info
      name: hotelData.name || h.name,
      stars: hotelData.stars || h.stars,
      category: hotelData.category,
      
      // DESCRIPTIONS - Multiple sources for AI
      description: hotelData.description || h.description || '',
      shortDescription: hotelData.shortDescription || hotelData.summary || '',
      longDescription: hotelData.longDescription || hotelData.fullDescription || '',
      highlights: hotelData.highlights || [],
      
      // Location
      address: hotelData.address || h.address,
      city: hotelData.city || h.city,
      country: hotelData.country,
      area: hotelData.area || hotelData.neighborhood || hotelData.district,
      distanceToCenter: hotelData.distanceToCenter || hotelData.distanceToCityCenter,
      distanceToBeach: hotelData.distanceToBeach,
      distanceToAirport: hotelData.distanceToAirport,
      latitude: hotelData.latitude || hotelData.lat,
      longitude: hotelData.longitude || hotelData.lng,
      
      // Stay details
      checkIn: h.checkIn,
      checkOut: h.checkOut,
      nights: h.nights,
      
      // Room info
      roomType: h.roomType || h.room?.type,
      roomName: h.roomName || h.room?.name,
      roomDescription: h.roomDescription || h.room?.description,
      roomSize: h.room?.size || h.roomSize,
      roomView: h.room?.view || h.roomView,
      bedType: h.room?.bedType || h.bedType,
      maxOccupancy: h.room?.maxOccupancy,
      roomAmenities: h.room?.amenities || h.roomAmenities || [],
      
      // Meals
      mealPlan: h.mealPlan || h.board,
      mealPlanDescription: getMealPlanDescription(h.mealPlan || h.board, language),
      mealsIncluded: h.mealsIncluded || [],
      restaurantInfo: hotelData.restaurants || hotelData.dining,
      
      // Hotel facilities - COMPREHENSIVE
      facilities: hotelData.facilities || hotelData.amenities || [],
      services: hotelData.services || [],
      spaInfo: hotelData.spa || hotelData.wellness,
      poolInfo: hotelData.pool || hotelData.pools,
      fitnessInfo: hotelData.fitness || hotelData.gym,
      wifiInfo: hotelData.wifi || hotelData.internet,
      parkingInfo: hotelData.parking,
      
      // Images
      images: hotelData.images?.map(img => typeof img === 'string' ? img : img.url) || [],
      
      // Contact
      phone: hotelData.phone || hotelData.telephone,
      email: hotelData.email,
      website: hotelData.website || hotelData.url,
      
      // Pricing
      price: h.priceBreakdown?.totalPrice?.microsite?.amount || h.price,
      pricePerNight: h.nights ? Math.round((h.priceBreakdown?.totalPrice?.microsite?.amount || h.price || 0) / h.nights) : null,
      
      // Check-in/out times
      checkInTime: hotelData.checkInTime || hotelData.checkIn?.time || '15:00',
      checkOutTime: hotelData.checkOutTime || hotelData.checkOut?.time || '11:00',
      earlyCheckIn: hotelData.earlyCheckIn,
      lateCheckOut: hotelData.lateCheckOut,
      
      // Policies
      cancellationPolicy: h.cancellationPolicy || hotelData.cancellationPolicy,
      childPolicy: hotelData.childPolicy,
      petPolicy: hotelData.petPolicy,
      dressCode: hotelData.dressCode,
      smokingPolicy: hotelData.smokingPolicy,
      
      // Reviews/ratings
      rating: hotelData.rating || hotelData.guestRating,
      reviewScore: hotelData.reviewScore,
      reviewCount: hotelData.reviewCount,
      tripadvisorRating: hotelData.tripadvisorRating
    };
  }) || [];

  // ============================================
  // FLIGHTS - Transport details
  // ============================================
  const flights = tcData.transports?.filter(t => t.type === 'FLIGHT' || t.type === 'flight').map(f => ({
    // Flight info
    type: 'flight',
    carrier: f.carrier || f.airline,
    carrierName: f.carrierName || f.airlineName,
    flightNumber: f.flightNumber || f.number,
    
    // Departure
    departureAirport: f.departure || f.from,
    departureAirportCode: f.departureCode || f.fromCode,
    departureCity: f.departureCity,
    departureDate: f.departureDate,
    departureTime: f.departureTime,
    departureTerminal: f.departureTerminal,
    
    // Arrival
    arrivalAirport: f.arrival || f.to,
    arrivalAirportCode: f.arrivalCode || f.toCode,
    arrivalCity: f.arrivalCity,
    arrivalDate: f.arrivalDate,
    arrivalTime: f.arrivalTime,
    arrivalTerminal: f.arrivalTerminal,
    
    // Flight details
    duration: f.duration,
    class: f.class || f.cabinClass,
    aircraft: f.aircraft,
    
    // Baggage
    baggageIncluded: f.baggageIncluded,
    baggageAllowance: f.baggageAllowance,
    handLuggage: f.handLuggage,
    
    // Stops
    stops: f.stops || 0,
    stopDetails: f.stopDetails || [],
    
    // Pricing
    price: f.priceBreakdown?.totalPrice?.microsite?.amount || f.price,
    
    // Booking reference
    pnr: f.pnr,
    bookingReference: f.bookingReference
  })) || [];

  // ============================================
  // OTHER TRANSPORTS - Trains, ferries, etc
  // ============================================
  const otherTransports = tcData.transports?.filter(t => t.type !== 'FLIGHT' && t.type !== 'flight').map(t => ({
    type: t.type?.toLowerCase() || 'transport',
    carrier: t.carrier,
    from: t.departure || t.from,
    to: t.arrival || t.to,
    departureDate: t.departureDate,
    departureTime: t.departureTime,
    arrivalDate: t.arrivalDate,
    arrivalTime: t.arrivalTime,
    duration: t.duration,
    class: t.class,
    price: t.priceBreakdown?.totalPrice?.microsite?.amount || t.price
  })) || [];

  // ============================================
  // CAR RENTALS
  // ============================================
  const carRentals = tcData.cars?.map(c => ({
    company: c.company || c.supplier,
    category: c.category,
    carType: c.carType || c.vehicle,
    
    // Pickup
    pickupLocation: c.pickUp || c.pickup,
    pickupDate: c.pickupDate,
    pickupTime: c.pickupTime,
    
    // Dropoff
    dropoffLocation: c.dropOff || c.dropoff,
    dropoffDate: c.dropoffDate,
    dropoffTime: c.dropoffTime,
    
    // Rental details
    days: c.days,
    transmission: c.transmission,
    fuelPolicy: c.fuelPolicy,
    mileage: c.mileage || 'unlimited',
    
    // Insurance
    insuranceIncluded: c.insuranceIncluded,
    insuranceType: c.insuranceType,
    
    // Extras
    extras: c.extras || [],
    
    // Pricing
    price: c.priceBreakdown?.totalPrice?.microsite?.amount || c.price,
    pricePerDay: c.days ? Math.round((c.priceBreakdown?.totalPrice?.microsite?.amount || c.price || 0) / c.days) : null
  })) || [];

  // ============================================
  // ACTIVITIES & EXCURSIONS
  // ============================================
  const activities = tcData.activities?.map(a => ({
    name: a.name || a.title,
    description: a.description,
    date: a.date,
    time: a.time,
    duration: a.duration,
    location: a.location,
    included: a.included,
    price: a.price,
    images: a.images || []
  })) || [];

  // ============================================
  // DAY-BY-DAY ITINERARY
  // ============================================
  const itinerary = tcData.days?.map((day, index) => ({
    dayNumber: index + 1,
    date: day.date,
    title: day.title || day.name,
    description: day.description,
    
    // What happens this day
    destination: day.destination,
    hotel: day.hotel,
    activities: day.activities || [],
    meals: day.meals || [],
    
    // Transport this day
    transport: day.transport,
    
    // Highlights
    highlights: day.highlights || [],
    
    // Tips
    tips: day.tips || day.notes
  })) || [];

  // ============================================
  // PRICING BREAKDOWN
  // ============================================
  let totalPrice = 0;
  const priceBreakdown = {
    hotels: 0,
    flights: 0,
    otherTransport: 0,
    carRentals: 0,
    activities: 0,
    other: 0
  };
  
  hotels.forEach(h => { priceBreakdown.hotels += h.price || 0; });
  flights.forEach(f => { priceBreakdown.flights += f.price || 0; });
  otherTransports.forEach(t => { priceBreakdown.otherTransport += t.price || 0; });
  carRentals.forEach(c => { priceBreakdown.carRentals += c.price || 0; });
  activities.forEach(a => { priceBreakdown.activities += a.price || 0; });
  
  totalPrice = Object.values(priceBreakdown).reduce((sum, val) => sum + val, 0);
  
  // Use TC total if available (more accurate)
  if (tcData.totalPrice?.microsite?.amount) {
    totalPrice = tcData.totalPrice.microsite.amount;
  }

  // ============================================
  // TRAVELERS INFO
  // ============================================
  const travelers = {
    adults: tcData.adults || tcData.travelers?.adults || 2,
    children: tcData.children || tcData.travelers?.children || 0,
    infants: tcData.infants || tcData.travelers?.infants || 0,
    childAges: tcData.childAges || tcData.travelers?.childAges || []
  };

  // ============================================
  // PRACTICAL INFO FOR TRAVELERS
  // ============================================
  const practicalInfo = {
    // Documents needed
    visaRequired: tcInfo?.visaRequired,
    passportRequired: tcInfo?.passportRequired,
    
    // Health
    vaccinationsRecommended: tcInfo?.vaccinations || [],
    healthAdvice: tcInfo?.healthAdvice,
    
    // Weather
    bestTimeToVisit: tcInfo?.bestTimeToVisit,
    climate: tcInfo?.climate,
    
    // Currency & money
    localCurrency: tcInfo?.currency || countries[0] ? getCurrencyForCountry(countries[0]) : 'EUR',
    tippingCustoms: tcInfo?.tipping,
    
    // Communication
    emergencyNumbers: tcInfo?.emergencyNumbers,
    usefulPhrases: tcInfo?.usefulPhrases,
    
    // Time
    timezone: tcInfo?.timezone,
    
    // Electricity
    plugType: tcInfo?.plugType,
    voltage: tcInfo?.voltage
  };

  // ============================================
  // INCLUDED / NOT INCLUDED
  // ============================================
  const included = tcData.included || tcInfo?.included || [];
  const notIncluded = tcData.notIncluded || tcInfo?.notIncluded || [];

  // ============================================
  // IMAGES - All images for the trip
  // ============================================
  const allImages = [];
  destinations.forEach(d => allImages.push(...(d.images || [])));
  hotels.forEach(h => allImages.push(...(h.images || [])));
  activities.forEach(a => allImages.push(...(a.images || [])));
  const featuredImage = allImages[0] || '';

  // ============================================
  // BUILD TITLE
  // ============================================
  const title = tripName || (destinationNames.length > 0
    ? `Rondreis ${destinationNames.slice(0, 3).join(', ')}${destinationNames.length > 3 ? '...' : ''}`
    : `Reis ${ideaId}`);

  // ============================================
  // AI-FRIENDLY SUMMARY
  // ============================================
  const aiSummary = buildAISummary({
    title, totalDays, totalNights, destinationNames, countries,
    hotels, flights, carRentals, totalPrice, travelers, language
  });

  return {
    // Identifiers
    tc_idea_id: ideaId,
    
    // Overview
    title,
    description: tripDescription,
    
    // INTRODUCTION TEXTS - For AI context setting
    intro_text: introText,
    short_description: shortDescription,
    trip_highlights: highlights,
    selling_points: sellingPoints,
    
    // Images
    featured_image: featuredImage,
    all_images: [...new Set(allImages)], // Deduplicated
    
    // Duration
    duration_days: totalDays,
    duration_nights: totalNights,
    
    // Locations
    destinations,
    destination_names: destinationNames,
    countries,
    
    // Accommodations
    hotels,
    
    // Transport
    flights,
    other_transports: otherTransports,
    car_rentals: carRentals,
    
    // Activities
    activities,
    
    // Day-by-day
    itinerary,
    
    // Pricing
    total_price: Math.round(totalPrice),
    price_breakdown: priceBreakdown,
    currency: 'EUR',
    price_per_person: travelers.adults > 0 ? Math.round(totalPrice / travelers.adults) : totalPrice,
    
    // Travelers
    travelers,
    
    // What's included
    included,
    not_included: notIncluded,
    
    // Practical info
    practical_info: practicalInfo,
    
    // AI-ready summary
    ai_summary: aiSummary,
    
    // RAW texts for AI - all text content in one place
    all_texts: {
      trip_intro: introText,
      trip_description: tripDescription,
      short_description: shortDescription,
      destination_descriptions: destinations.map(d => ({ name: d.name, description: d.description })),
      hotel_descriptions: hotels.map(h => ({ 
        name: h.name, 
        description: h.description,
        shortDescription: h.shortDescription,
        highlights: h.highlights
      })),
      day_descriptions: itinerary.map(d => ({ day: d.dayNumber, title: d.title, description: d.description }))
    },
    
    // Language
    language
  };
}

/**
 * Get meal plan description in the right language
 */
function getMealPlanDescription(mealPlan, language) {
  const descriptions = {
    'RO': { NL: 'Logies', EN: 'Room Only', DE: 'Nur Übernachtung' },
    'BB': { NL: 'Logies met ontbijt', EN: 'Bed & Breakfast', DE: 'Übernachtung mit Frühstück' },
    'HB': { NL: 'Halfpension', EN: 'Half Board', DE: 'Halbpension' },
    'FB': { NL: 'Volpension', EN: 'Full Board', DE: 'Vollpension' },
    'AI': { NL: 'All Inclusive', EN: 'All Inclusive', DE: 'All Inclusive' }
  };
  return descriptions[mealPlan]?.[language] || descriptions[mealPlan]?.['EN'] || mealPlan;
}

/**
 * Get currency for a country
 */
function getCurrencyForCountry(country) {
  const currencies = {
    'Nederland': 'EUR', 'Germany': 'EUR', 'France': 'EUR', 'Spain': 'EUR', 'Italy': 'EUR',
    'United Kingdom': 'GBP', 'UK': 'GBP',
    'United States': 'USD', 'USA': 'USD',
    'Thailand': 'THB', 'Japan': 'JPY', 'Australia': 'AUD',
    'South Africa': 'ZAR', 'Kenya': 'KES', 'Tanzania': 'TZS'
  };
  return currencies[country] || 'EUR';
}

/**
 * Build an AI-friendly text summary of the trip
 */
function buildAISummary({ title, totalDays, totalNights, destinationNames, countries, hotels, flights, carRentals, totalPrice, travelers, language }) {
  const parts = [];
  
  // Trip overview
  parts.push(`${title} - ${totalDays} dagen / ${totalNights} nachten`);
  
  if (destinationNames.length > 0) {
    parts.push(`Bestemmingen: ${destinationNames.join(', ')}`);
  }
  
  if (countries.length > 0) {
    parts.push(`Landen: ${countries.join(', ')}`);
  }
  
  // Flights summary
  if (flights.length > 0) {
    const outbound = flights[0];
    const inbound = flights[flights.length - 1];
    if (outbound) {
      parts.push(`Heenvlucht: ${outbound.departureAirport || outbound.departureCity} → ${outbound.arrivalAirport || outbound.arrivalCity} (${outbound.carrier} ${outbound.flightNumber || ''})`);
    }
    if (inbound && flights.length > 1) {
      parts.push(`Terugvlucht: ${inbound.departureAirport || inbound.departureCity} → ${inbound.arrivalAirport || inbound.arrivalCity} (${inbound.carrier} ${inbound.flightNumber || ''})`);
    }
  }
  
  // Hotels summary
  if (hotels.length > 0) {
    parts.push(`Accommodaties: ${hotels.map(h => `${h.name} (${h.nights} nachten, ${h.mealPlanDescription || h.mealPlan || 'logies'})`).join('; ')}`);
  }
  
  // Car rental summary
  if (carRentals.length > 0) {
    parts.push(`Huurauto: ${carRentals.map(c => `${c.company} ${c.category || c.carType} (${c.days} dagen)`).join('; ')}`);
  }
  
  // Price
  parts.push(`Totaalprijs: €${Math.round(totalPrice)} (€${Math.round(totalPrice / (travelers.adults || 1))} p.p.)`);
  
  // Travelers
  let travelerText = `${travelers.adults} volwassene${travelers.adults > 1 ? 'n' : ''}`;
  if (travelers.children > 0) {
    travelerText += `, ${travelers.children} kind${travelers.children > 1 ? 'eren' : ''}`;
  }
  parts.push(`Reizigers: ${travelerText}`);
  
  return parts.join('\n');
}
