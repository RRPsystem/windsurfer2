// Vercel Serverless Function: POST /api/video/generate
// Generates promotional video for a travel itinerary using Pexels + Shotstack

const axios = require('axios');

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
      destinations = [], 
      title = 'Jouw Reis',
      voiceoverUrl = null,
      duration = 3 // seconds per destination
    } = req.body;

    if (!destinations || destinations.length === 0) {
      return res.status(400).json({ error: 'Geen bestemmingen opgegeven' });
    }

    console.log('[VideoGen] Generating video for:', { title, destinations: destinations.length });

    // Step 1: Search video clips for each destination
    const clipPromises = destinations.map(dest => searchVideoClip(dest.name, PEXELS_API_KEY));
    const clips = await Promise.all(clipPromises);

    // Filter out failed searches
    const validClips = clips.filter(c => c !== null);
    
    if (validClips.length === 0) {
      return res.status(404).json({ error: 'Geen video clips gevonden voor deze bestemmingen' });
    }

    console.log('[VideoGen] Found clips:', validClips.length);

    // Step 2: Create Shotstack timeline
    const timeline = createTimeline(validClips, title, duration, voiceoverUrl);

    // Step 3: Submit to Shotstack for rendering
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
    return res.status(500).json({ 
      error: 'Video generatie mislukt', 
      detail: error.message 
    });
  }
}

// Search for video clip on Pexels
async function searchVideoClip(destination, apiKey) {
  try {
    const query = `${destination} travel aerial city`;
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`;
    
    const response = await axios.get(url, {
      headers: { 'Authorization': apiKey }
    });

    if (response.data.videos && response.data.videos.length > 0) {
      // Get the best quality HD video
      const video = response.data.videos[0];
      const hdFile = video.video_files.find(f => f.quality === 'hd' && f.width >= 1280) 
                     || video.video_files[0];
      
      return {
        destination,
        url: hdFile.link,
        width: hdFile.width,
        height: hdFile.height,
        duration: video.duration,
        thumbnail: video.image
      };
    }
    
    console.warn(`[VideoGen] No clips found for: ${destination}`);
    return null;
  } catch (error) {
    console.error(`[VideoGen] Pexels search failed for ${destination}:`, error.message);
    return null;
  }
}

// Create Shotstack timeline
function createTimeline(clips, title, clipDuration, voiceoverUrl) {
  const tracks = [];
  let currentTime = 0;

  // Track 1: Video clips
  const videoClips = clips.map((clip, index) => {
    const start = currentTime;
    currentTime += clipDuration;
    
    return {
      asset: {
        type: 'video',
        src: clip.url,
        trim: 0 // Start from beginning of clip
      },
      start: start,
      length: clipDuration,
      fit: 'cover',
      scale: 1,
      transition: {
        in: 'fade',
        out: 'fade'
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
        background: 'rgba(0,0,0,0.5)',
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
        background: 'rgba(0,0,0,0.6)',
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

  // Track 4: Voice-over (if provided)
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
      resolution: 'hd',
      aspectRatio: '16:9',
      size: {
        width: 1280,
        height: 720
      },
      fps: 25,
      scaleTo: 'preview' // Use 'preview' for faster rendering, 'crop' for production
    }
  };
}

// Submit render to Shotstack
async function submitToShotstack(timeline, apiKey, env) {
  const baseUrl = env === 'v1' 
    ? 'https://api.shotstack.io/v1' 
    : 'https://api.shotstack.io/stage';
  
  const url = `${baseUrl}/render`;
  
  const response = await axios.post(url, timeline, {
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }
  });

  return {
    id: response.data.response.id,
    status: response.data.response.status,
    message: response.data.response.message
  };
}
