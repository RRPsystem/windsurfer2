// Vercel Serverless Function: POST /api/research/destination
// Research destination using Google Custom Search API

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      GOOGLE_SEARCH_API_KEY = '',
      GOOGLE_SEARCH_CX = ''
    } = process.env;

    if (!GOOGLE_SEARCH_API_KEY || !GOOGLE_SEARCH_CX) {
      return res.status(500).json({ 
        error: 'Missing Google Search API credentials',
        message: 'Voeg GOOGLE_SEARCH_API_KEY en GOOGLE_SEARCH_CX toe aan environment variables'
      });
    }

    const { destination, language = 'nl' } = req.body;

    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    console.log('[Research] Researching destination:', destination);

    // Search queries for comprehensive information
    const queries = [
      `${destination} travel guide highlights attractions`,
      `${destination} best time to visit weather`,
      `${destination} local culture food traditions`,
      `${destination} unique experiences activities`
    ];

    // Execute searches in parallel
    const searchPromises = queries.map(query => 
      searchGoogle(query, GOOGLE_SEARCH_API_KEY, GOOGLE_SEARCH_CX, language)
    );

    const results = await Promise.all(searchPromises);

    // Parse and structure the information
    const research = {
      destination,
      highlights: extractHighlights(results[0]),
      bestTime: extractBestTime(results[1]),
      culture: extractCulture(results[2]),
      activities: extractActivities(results[3]),
      sources: results.flatMap(r => r.items || []).slice(0, 5).map(item => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet
      })),
      timestamp: new Date().toISOString()
    };

    console.log('[Research] Found:', {
      highlights: research.highlights.length,
      activities: research.activities.length,
      sources: research.sources.length
    });

    return res.status(200).json(research);

  } catch (error) {
    console.error('[Research] Error:', error);
    return res.status(500).json({ 
      error: 'Research failed', 
      message: error.message 
    });
  }
}

// Search Google Custom Search API
async function searchGoogle(query, apiKey, cx, language) {
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&lr=lang_${language}&num=5`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Search API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

// Extract highlights from search results
function extractHighlights(searchResult) {
  const highlights = [];
  const items = searchResult.items || [];

  for (const item of items) {
    const snippet = item.snippet || '';
    
    // Look for bullet points, numbered lists, or key phrases
    const sentences = snippet.split(/[.!?]\s+/);
    
    for (const sentence of sentences) {
      // Filter for highlight-worthy content
      if (sentence.length > 30 && sentence.length < 200) {
        if (
          sentence.toLowerCase().includes('known for') ||
          sentence.toLowerCase().includes('famous for') ||
          sentence.toLowerCase().includes('must-see') ||
          sentence.toLowerCase().includes('highlight') ||
          sentence.toLowerCase().includes('attraction')
        ) {
          highlights.push(sentence.trim());
        }
      }
    }
  }

  return [...new Set(highlights)].slice(0, 5); // Unique, max 5
}

// Extract best time to visit information
function extractBestTime(searchResult) {
  const items = searchResult.items || [];
  
  for (const item of items) {
    const text = (item.snippet || '').toLowerCase();
    
    // Look for time/season mentions
    const timePatterns = [
      /best time.*?(spring|summer|autumn|fall|winter|january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /visit.*?(spring|summer|autumn|fall|winter|january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /(spring|summer|autumn|fall|winter).*?best/i
    ];

    for (const pattern of timePatterns) {
      const match = item.snippet.match(pattern);
      if (match) {
        // Extract sentence containing the match
        const sentences = item.snippet.split(/[.!?]\s+/);
        for (const sentence of sentences) {
          if (sentence.toLowerCase().includes(match[0].toLowerCase())) {
            return sentence.trim();
          }
        }
      }
    }
  }

  return 'Het hele jaar door te bezoeken';
}

// Extract cultural information
function extractCulture(searchResult) {
  const culture = [];
  const items = searchResult.items || [];

  for (const item of items) {
    const snippet = item.snippet || '';
    const sentences = snippet.split(/[.!?]\s+/);
    
    for (const sentence of sentences) {
      if (sentence.length > 30 && sentence.length < 200) {
        const lower = sentence.toLowerCase();
        if (
          lower.includes('culture') ||
          lower.includes('tradition') ||
          lower.includes('food') ||
          lower.includes('cuisine') ||
          lower.includes('local')
        ) {
          culture.push(sentence.trim());
        }
      }
    }
  }

  return [...new Set(culture)].slice(0, 3);
}

// Extract activities
function extractActivities(searchResult) {
  const activities = [];
  const items = searchResult.items || [];

  for (const item of items) {
    const snippet = item.snippet || '';
    const sentences = snippet.split(/[.!?]\s+/);
    
    for (const sentence of sentences) {
      if (sentence.length > 30 && sentence.length < 200) {
        const lower = sentence.toLowerCase();
        if (
          lower.includes('activity') ||
          lower.includes('activities') ||
          lower.includes('experience') ||
          lower.includes('things to do') ||
          lower.includes('you can')
        ) {
          activities.push(sentence.trim());
        }
      }
    }
  }

  return [...new Set(activities)].slice(0, 5);
}
