// Pixabay Video Search API Route
// Proxies requests to Pixabay API using server-side API key

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

  const { query, page = 1, per_page = 20 } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter required' });
  }

  const apiKey = process.env.PIXABAY_API_KEY;

  if (!apiKey) {
    console.error('[Pixabay API] PIXABAY_API_KEY not found in environment variables');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Enhance city searches with country context for better results
    let searchQuery = query.trim();
    
    // Map of cities to their countries for better search context
    const cityCountryMap = {
      'belfast': 'Belfast Northern Ireland',
      'dublin': 'Dublin Ireland',
      'amsterdam': 'Amsterdam Netherlands',
      'paris': 'Paris France',
      'london': 'London England',
      'rome': 'Rome Italy',
      'barcelona': 'Barcelona Spain',
      'lisbon': 'Lisbon Portugal',
      'prague': 'Prague Czech',
      'vienna': 'Vienna Austria',
      'berlin': 'Berlin Germany',
      'munich': 'Munich Germany',
      'brussels': 'Brussels Belgium',
      'copenhagen': 'Copenhagen Denmark',
      'stockholm': 'Stockholm Sweden',
      'oslo': 'Oslo Norway',
      'helsinki': 'Helsinki Finland',
      'reykjavik': 'Reykjavik Iceland',
      'edinburgh': 'Edinburgh Scotland',
      'glasgow': 'Glasgow Scotland',
      'cork': 'Cork Ireland',
      'galway': 'Galway Ireland'
    };
    
    // Check if query contains a known city and enhance it
    const queryLower = searchQuery.toLowerCase();
    for (const [city, enhanced] of Object.entries(cityCountryMap)) {
      if (queryLower.includes(city)) {
        const enhancedWords = enhanced.toLowerCase().split(' ');
        const alreadyHasCountry = enhancedWords.some(word => 
          word.length > 3 && queryLower.includes(word) && word !== city
        );
        
        if (!alreadyHasCountry) {
          searchQuery = searchQuery.replace(new RegExp(city, 'i'), enhanced);
          break;
        }
      }
    }
    
    console.log('[Pixabay API] Searching:', searchQuery, 'page:', page);

    // Pixabay Video API endpoint
    const url = `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${per_page}&safesearch=true&video_type=film`;
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Pixabay API] Error response:', errorText);
      return res.status(response.status).json({ 
        error: 'Pixabay API error',
        status: response.status,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('[Pixabay API] Success:', data.totalHits || 0, 'results');

    // Filter out irrelevant results for European/Irish city searches
    const originalQuery = query.toLowerCase();
    const europeanCities = ['belfast', 'dublin', 'london', 'paris', 'amsterdam', 'rome', 'barcelona', 'lisbon', 'prague', 'vienna', 'berlin', 'munich', 'brussels', 'copenhagen', 'stockholm', 'oslo', 'helsinki', 'edinburgh', 'glasgow', 'cork', 'galway', 'reykjavik', 'madrid', 'milan', 'venice', 'florence', 'athens', 'budapest', 'warsaw', 'krakow'];
    const isEuropeanSearch = europeanCities.some(city => originalQuery.includes(city));
    
    // Keywords that indicate irrelevant content for European city searches
    const irrelevantKeywords = [
      // Asia
      'thailand', 'thai', 'vietnam', 'vietnamese', 'cambodia', 'indonesia', 'bali', 'philippines', 'malaysia', 'singapore', 'china', 'chinese', 'japan', 'japanese', 'korea', 'korean', 'india', 'indian', 'asia', 'asian', 'tropical', 'maldives', 'sri lanka', 'myanmar', 'laos', 'nepal', 'tibet',
      // Turkey/Middle East
      'turkey', 'turkish', 'cappadocia', 'pamukkale', 'istanbul', 'dubai', 'uae', 'emirates', 'qatar', 'saudi', 'oman', 'jordan', 'petra', 'morocco', 'marrakech',
      // Africa
      'egypt', 'cairo', 'pyramid', 'sahara', 'safari', 'serengeti', 'kenya', 'tanzania', 'south africa', 'cape town', 'african',
      // Americas (tropical)
      'mexico', 'cancun', 'caribbean', 'cuba', 'jamaica', 'bahamas', 'brazil', 'rio', 'peru', 'machu picchu', 'costa rica',
      // Australia/Pacific
      'australia', 'australian', 'new zealand', 'fiji', 'tahiti', 'bora bora', 'hawaii', 'polynesia',
      // Generic irrelevant for cities
      'desert', 'jungle', 'rainforest', 'savanna', 'coral reef', 'palm beach', 'rice field', 'rice terrace', 'bamboo', 'elephant', 'monkey', 'temple asia'
    ];

    let filteredHits = data.hits || [];
    
    if (isEuropeanSearch && filteredHits.length > 0) {
      const beforeCount = filteredHits.length;
      
      // Get the city name from the query
      const searchedCity = europeanCities.find(city => originalQuery.includes(city));
      
      filteredHits = filteredHits.filter(video => {
        const tags = (video.tags || '').toLowerCase();
        
        // First: filter out obviously irrelevant content
        const isIrrelevant = irrelevantKeywords.some(keyword => tags.includes(keyword));
        if (isIrrelevant) return false;
        
        // Second: for city searches, require the video to have relevant tags
        // Either the city name, country name, or related terms
        if (searchedCity) {
          const cityCountryTerms = {
            'belfast': ['belfast', 'northern ireland', 'ireland', 'irish', 'uk', 'united kingdom', 'britain'],
            'dublin': ['dublin', 'ireland', 'irish', 'eire'],
            'cork': ['cork', 'ireland', 'irish'],
            'galway': ['galway', 'ireland', 'irish'],
            'london': ['london', 'england', 'uk', 'united kingdom', 'britain', 'british'],
            'edinburgh': ['edinburgh', 'scotland', 'scottish', 'uk'],
            'glasgow': ['glasgow', 'scotland', 'scottish', 'uk'],
            'paris': ['paris', 'france', 'french', 'eiffel'],
            'amsterdam': ['amsterdam', 'netherlands', 'dutch', 'holland'],
            'rome': ['rome', 'roma', 'italy', 'italian', 'colosseum'],
            'barcelona': ['barcelona', 'spain', 'spanish', 'catalonia'],
            'lisbon': ['lisbon', 'lisboa', 'portugal', 'portuguese'],
            'prague': ['prague', 'praha', 'czech', 'bohemia'],
            'vienna': ['vienna', 'wien', 'austria', 'austrian'],
            'berlin': ['berlin', 'germany', 'german'],
            'munich': ['munich', 'munchen', 'germany', 'german', 'bavaria'],
            'brussels': ['brussels', 'belgium', 'belgian'],
            'copenhagen': ['copenhagen', 'denmark', 'danish'],
            'stockholm': ['stockholm', 'sweden', 'swedish'],
            'oslo': ['oslo', 'norway', 'norwegian'],
            'helsinki': ['helsinki', 'finland', 'finnish'],
            'reykjavik': ['reykjavik', 'iceland', 'icelandic']
          };
          
          const relevantTerms = cityCountryTerms[searchedCity] || [searchedCity];
          const hasRelevantTag = relevantTerms.some(term => tags.includes(term));
          
          // Also allow generic city/urban content
          const genericCityTerms = ['city', 'urban', 'downtown', 'street', 'architecture', 'building', 'skyline', 'aerial city'];
          const hasGenericCityTag = genericCityTerms.some(term => tags.includes(term));
          
          return hasRelevantTag || hasGenericCityTag;
        }
        
        return true;
      });
      
      console.log(`[Pixabay API] Filtered ${beforeCount - filteredHits.length} irrelevant results for European search "${searchedCity}"`);
    }

    // Transform to consistent format
    const videos = filteredHits.map(video => ({
      id: video.id,
      title: video.tags || '',
      thumbnail: video.videos?.tiny?.thumbnail || video.videos?.small?.thumbnail || `https://i.vimeocdn.com/video/${video.picture_id}_295x166.jpg`,
      duration: video.duration || 0,
      width: video.videos?.large?.width || video.videos?.medium?.width || 1920,
      height: video.videos?.large?.height || video.videos?.medium?.height || 1080,
      // Video URLs by quality
      preview_url: video.videos?.tiny?.url || video.videos?.small?.url,
      download_url: video.videos?.large?.url || video.videos?.medium?.url || video.videos?.small?.url,
      // All available qualities
      videos: video.videos,
      user: video.user,
      user_url: video.userImageURL,
      page_url: video.pageURL,
      tags: video.tags
    }));

    return res.status(200).json({
      success: true,
      videos: videos,
      total_results: data.totalHits || 0,
      page: parseInt(page),
      per_page: parseInt(per_page)
    });

  } catch (error) {
    console.error('[Pixabay API] Exception:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}
