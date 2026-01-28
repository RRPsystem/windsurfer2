// Vercel Serverless Function: POST /api/video/generate
// Generates promotional video for a travel itinerary using Pexels + Shotstack

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      PEXELS_API_KEY = '',
      SHOTSTACK_API_KEY = '',
      SHOTSTACK_ENV = 'stage' // 'stage' or 'v1' (production)
    } = process.env;

    if (!PEXELS_API_KEY) {
      return res.status(500).json({ 
        error: 'Missing PEXELS_API_KEY',
        message: 'Voeg PEXELS_API_KEY toe aan environment variables (gratis op pexels.com/api)'
      });
    }

    if (!SHOTSTACK_API_KEY) {
      return res.status(500).json({ 
        error: 'Missing SHOTSTACK_API_KEY',
        message: 'Voeg SHOTSTACK_API_KEY toe aan environment variables (gratis trial op shotstack.io)'
      });
    }

    const { 
      clips = [], // User-selected clips from frontend
      destinations = [], 
      title = 'Jouw Reis',
      voiceoverUrl = null,
      clipDuration = 3, // seconds per clip (renamed from 'duration')
      transition = 'fade', // Transition type: fade, slideLeft, slideRight, wipeLeft, wipeRight, zoom, carouselLeft
      transitionDuration = 0.5, // Duration of transition in seconds
      travelData = null, // Full Travel Compositor data for hotel/flight info
      showHotelOverlay = true,
      showFlightOverlay = true,
      overlayDuration = 0.4 // How long overlays show (as fraction of clip duration)
    } = req.body;

    // Use user-selected clips if provided, otherwise search automatically
    let validClips = [];
    
    if (clips && clips.length > 0) {
      // Use clips selected by user in frontend
      console.log('[VideoGen] Using user-selected clips:', clips.length);
      validClips = clips.map(clip => ({
        destination: clip.destination,
        url: clip.url,
        duration: clip.duration,
        thumbnail: clip.thumbnail
      }));
    } else if (destinations && destinations.length > 0) {
      // Fallback: Auto-search clips (legacy behavior)
      console.log('[VideoGen] Auto-searching clips for destinations:', destinations.length);
      const clipsPerDestination = 2;
      const clipPromises = destinations.map(dest => 
        searchMultipleVideoClips(dest.name, PEXELS_API_KEY, clipsPerDestination)
      );
      const clipsPerDest = await Promise.all(clipPromises);
      validClips = clipsPerDest.flat().filter(c => c !== null);
    } else {
      return res.status(400).json({ error: 'Geen clips of bestemmingen opgegeven' });
    }
    
    if (validClips.length === 0) {
      return res.status(404).json({ error: 'Geen video clips beschikbaar' });
    }

    console.log('[VideoGen] Generating video with clips:', validClips.length);
    console.log('[VideoGen] Clips:', JSON.stringify(validClips.map((c, i) => ({
      index: i,
      dest: c.destination,
      url: c.url ? c.url.substring(0, 80) : 'NO URL'
    })), null, 2));
    
    // Check for duplicate URLs
    const uniqueUrls = new Set(validClips.map(c => c.url));
    if (uniqueUrls.size !== validClips.length) {
      console.warn('[VideoGen] WARNING: Duplicate clip URLs detected!', {
        total: validClips.length,
        unique: uniqueUrls.size
      });
    }
    
    // Debug: Log travelData structure
    if (travelData) {
      console.log('[VideoGen] travelData keys:', Object.keys(travelData));
      console.log('[VideoGen] hotels:', travelData.hotels ? `${travelData.hotels.length} hotels` : 'none');
      console.log('[VideoGen] flights:', travelData.flights ? `${travelData.flights.length} flights` : 'none');
      // TC data might have different structure - check for alternatives
      console.log('[VideoGen] accommodations:', travelData.accommodations ? `${travelData.accommodations.length}` : 'none');
      console.log('[VideoGen] transports:', travelData.transports ? `${travelData.transports.length}` : 'none');
    } else {
      console.log('[VideoGen] No travelData provided');
    }

    // Step 2: Create Shotstack timeline
    const overlayOptions = {
      travelData,
      showHotelOverlay,
      showFlightOverlay,
      overlayDuration,
      destinations
    };
    const timeline = createTimeline(validClips, title, clipDuration, voiceoverUrl, transition, transitionDuration, overlayOptions);
    console.log('[VideoGen] Timeline created, tracks:', timeline.timeline.tracks.length);

    // Step 3: Submit to Shotstack for rendering
    console.log('[VideoGen] Submitting to Shotstack...');
    const renderResponse = await submitToShotstack(timeline, SHOTSTACK_API_KEY, SHOTSTACK_ENV);

    console.log('[VideoGen] Render submitted:', renderResponse.id);

    return res.status(200).json({
      success: true,
      renderId: renderResponse.id,
      status: renderResponse.status,
      message: 'Video wordt gegenereerd. Dit kan 1-2 minuten duren.',
      clips: validClips.map(c => ({ destination: c.destination, url: c.url })),
      statusUrl: `/api/video/status/${renderResponse.id}`
    });

  } catch (error) {
    console.error('[VideoGen] Error:', error);
    console.error('[VideoGen] Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Video generatie mislukt', 
      message: error.message,
      detail: error.stack ? error.stack.split('\n')[0] : error.message
    });
  }
}

// Search for multiple video clips per destination for more variety
async function searchMultipleVideoClips(destination, apiKey, count = 2) {
  try {
    const maxClips = Math.min(Math.max(1, count), 3); // Limit 1-3 clips
    const query = `${destination} travel aerial city`;
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${maxClips * 2}&orientation=landscape`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': apiKey }
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.videos && data.videos.length > 0) {
      const clips = [];
      const videos = data.videos.slice(0, maxClips);
      
      for (const video of videos) {
        const hdFile = video.video_files.find(f => f.quality === 'hd' && f.width >= 1280) 
                       || video.video_files[0];
        
        if (hdFile) {
          clips.push({
            destination,
            url: hdFile.link,
            width: hdFile.width,
            height: hdFile.height,
            duration: video.duration,
            thumbnail: video.image
          });
        }
      }
      
      console.log(`[VideoGen] Found ${clips.length} clips for: ${destination}`);
      return clips;
    }
    
    console.warn(`[VideoGen] No clips found for: ${destination}`);
    return [];
  } catch (error) {
    console.error(`[VideoGen] Pexels search failed for ${destination}:`, error.message);
    return [];
  }
}

// Legacy function for backward compatibility
async function searchVideoClip(destination, apiKey) {
  const clips = await searchMultipleVideoClips(destination, apiKey, 1);
  return clips.length > 0 ? clips[0] : null;
}

// Available transitions for Shotstack
const TRANSITIONS = {
  fade: { in: 'fade', out: 'fade' },
  slideLeft: { in: 'slideLeft', out: 'slideLeft' },
  slideRight: { in: 'slideRight', out: 'slideRight' },
  slideUp: { in: 'slideUp', out: 'slideUp' },
  slideDown: { in: 'slideDown', out: 'slideDown' },
  wipeLeft: { in: 'wipeLeft', out: 'wipeLeft' },
  wipeRight: { in: 'wipeRight', out: 'wipeRight' },
  zoom: { in: 'zoom', out: 'zoom' },
  carouselLeft: { in: 'carouselLeft', out: 'carouselLeft' },
  carouselRight: { in: 'carouselRight', out: 'carouselRight' },
  reveal: { in: 'reveal', out: 'reveal' },
  // Mixed transitions for variety
  mixed: null // Will be handled specially
};

// Create Shotstack timeline
function createTimeline(clips, title, clipDuration, voiceoverUrl, transitionType = 'fade', transitionDuration = 0.5, overlayOptions = {}) {
  const { travelData, showHotelOverlay, showFlightOverlay, overlayDuration = 0.4, destinations = [] } = overlayOptions;
  const tracks = [];
  let currentTime = 0;
  
  // Get transition config
  const getTransition = (index) => {
    if (transitionType === 'mixed') {
      // Alternate between different transitions for variety
      const mixedTransitions = ['fade', 'slideLeft', 'wipeRight', 'zoom', 'carouselLeft'];
      const t = mixedTransitions[index % mixedTransitions.length];
      return TRANSITIONS[t];
    }
    return TRANSITIONS[transitionType] || TRANSITIONS.fade;
  };

  // Track 1: Video clips with transitions
  const videoClips = clips.map((clip, index) => {
    const start = currentTime;
    // Overlap clips slightly for smoother transitions
    currentTime += clipDuration - transitionDuration;
    
    const trans = getTransition(index);
    
    return {
      asset: {
        type: 'video',
        src: clip.url,
        trim: 1 // Skip first second to avoid black frames
      },
      start: start,
      length: clipDuration,
      fit: 'cover',
      scale: 1,
      transition: {
        in: trans.in,
        out: trans.out
      }
    };
  });

  tracks.push({
    clips: videoClips
  });

  // Track 2: Title overlay (first 3 seconds)
  tracks.push({
    clips: [{
      asset: {
        type: 'title',
        text: title,
        style: 'future',
        color: '#ffffff',
        size: 'large',
        position: 'center'
      },
      start: 0,
      length: 3,
      transition: {
        in: 'fade',
        out: 'fade'
      }
    }]
  });

  // Track 3: Destination name overlays
  const textClips = clips.map((clip, index) => {
    return {
      asset: {
        type: 'title',
        text: clip.destination,
        style: 'minimal',
        color: '#ffffff',
        size: 'medium',
        position: 'bottomLeft'
      },
      start: index * clipDuration,
      length: clipDuration,
      offset: {
        x: 0.05,
        y: -0.1
      },
      transition: {
        in: 'slideLeft',
        out: 'slideLeft'
      }
    };
  });

  tracks.push({
    clips: textClips
  });

  // Track 4: Hotel info overlays (if enabled and data available)
  // Support both 'hotels' and 'accommodations' (TC uses accommodations)
  const hotels = travelData?.hotels || travelData?.accommodations || [];
  if (showHotelOverlay && hotels.length > 0) {
    const hotelClips = [];
    
    // Show hotel info for each destination that has a hotel
    clips.forEach((clip, index) => {
      // Find hotel for this destination
      const destName = clip.destination?.toLowerCase() || '';
      const hotel = hotels.find(h => {
        const hotelCity = (h.city || h.location || '').toLowerCase();
        return hotelCity.includes(destName) || destName.includes(hotelCity);
      }) || hotels[index % hotels.length]; // Fallback to cycling through hotels
      
      if (hotel) {
        const hotelName = hotel.name || 'Hotel';
        const hotelStars = hotel.stars ? '★'.repeat(hotel.stars) : '';
        const hotelText = hotelStars ? `🏨 ${hotelName} ${hotelStars}` : `🏨 ${hotelName}`;
        
        // Show hotel info in the second half of the clip
        const clipStart = index * (clipDuration - transitionDuration);
        const infoStart = clipStart + (clipDuration * 0.5);
        const infoDuration = clipDuration * overlayDuration;
        
        hotelClips.push({
          asset: {
            type: 'title',
            text: hotelText,
            style: 'subtitle',
            color: '#ffffff',
            size: 'small',
            position: 'bottomRight'
          },
          start: infoStart,
          length: infoDuration,
          offset: {
            x: -0.05,
            y: -0.15
          },
          transition: {
            in: 'fade',
            out: 'fade'
          }
        });
      }
    });
    
    if (hotelClips.length > 0) {
      tracks.push({ clips: hotelClips });
      console.log('[VideoGen] Added hotel overlay track with', hotelClips.length, 'clips');
    }
  }

  // Track 5: Flight info overlay (if enabled and data available)
  // Support both 'flights' and 'transports' (TC uses transports)
  const flights = travelData?.flights || travelData?.transports?.filter(t => t.type === 'flight' || t.transportType === 'FLIGHT') || [];
  if (showFlightOverlay && flights.length > 0) {
    const flight = flights[0]; // Use first flight
    const flightInfo = [];
    
    // Build flight text - support various TC data structures
    let flightText = '✈️';
    const departure = flight.departure || flight.departureCity || flight.from || flight.origin;
    const arrival = flight.arrival || flight.arrivalCity || flight.to || flight.destination;
    const airline = flight.airline || flight.carrier || flight.companyName;
    const flightNum = flight.flightNumber || flight.number || flight.code;
    
    if (departure && arrival) {
      flightText += ` ${departure} → ${arrival}`;
    } else if (airline) {
      flightText += ` ${airline}`;
    }
    if (flightNum) {
      flightText += ` (${flightNum})`;
    }
    
    // Show flight info at the beginning of the video (after title)
    if (flightText.length > 2) {
      flightInfo.push({
        asset: {
          type: 'title',
          text: flightText,
          style: 'subtitle',
          color: '#ffffff',
          size: 'small',
          position: 'topRight'
        },
        start: 3, // After title
        length: clipDuration,
        offset: {
          x: -0.05,
          y: 0.1
        },
        transition: {
          in: 'slideRight',
          out: 'fade'
        }
      });
      
      tracks.push({ clips: flightInfo });
      console.log('[VideoGen] Added flight overlay track');
    }
  }

  // Track 6: Voice-over (if provided)
  if (voiceoverUrl) {
    tracks.push({
      clips: [{
        asset: {
          type: 'audio',
          src: voiceoverUrl,
          volume: 1
        },
        start: 0,
        length: currentTime
      }]
    });
  }

  return {
    timeline: {
      background: '#000000',
      tracks: tracks
    },
    output: {
      format: 'mp4',
      resolution: 'sd',
      aspectRatio: '16:9',
      fps: 25
    }
  };
}

// Submit render to Shotstack
async function submitToShotstack(timeline, apiKey, env) {
  const baseUrl = env === 'v1' 
    ? 'https://api.shotstack.io/v1' 
    : 'https://api.shotstack.io/stage';
  
  const url = `${baseUrl}/render`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(timeline)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Shotstack API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  return {
    id: data.response.id,
    status: data.response.status,
    message: data.response.message
  };
}
