// Vercel Serverless Function: POST /api/video/generate
// Generates promotional video for a travel itinerary using Pexels + Shotstack

import axios from 'axios';

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
      clipDuration = 3 // seconds per clip (renamed from 'duration')
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

    // Step 2: Create Shotstack timeline
    const timeline = createTimeline(validClips, title, clipDuration, voiceoverUrl);

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

// Search for multiple video clips per destination for more variety
async function searchMultipleVideoClips(destination, apiKey, count = 2) {
  try {
    const maxClips = Math.min(Math.max(1, count), 3); // Limit 1-3 clips
    const query = `${destination} travel aerial city`;
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${maxClips * 2}&orientation=landscape`;
    
    const response = await axios.get(url, {
      headers: { 'Authorization': apiKey }
    });

    if (response.data.videos && response.data.videos.length > 0) {
      const clips = [];
      const videos = response.data.videos.slice(0, maxClips);
      
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
