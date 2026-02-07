// Vercel Serverless Function: GET /api/travelbro/list-travels
// Lists all travels (ideas) from Travel Compositor for a given microsite
// Parameters: ?micrositeId=rondreis-planner&language=NL
// v1.1 - Fixed: TC API returns data.idea (singular) not data.ideas

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      TC_BASE_URL = '',
      TC_MICROSITE_ID = '',
      TC_MICROSITES = '',
      TC_TOKEN = '',
      TC_USERNAME = '',
      TC_PASSWORD = '',
      TC_TENANT_ID = ''
    } = process.env;

    // Get query parameters
    const { 
      micrositeId: micrositeIdParam,
      language = 'NL',
      currency = 'EUR'
    } = req.query || {};

    const micrositeId = String(micrositeIdParam || TC_MICROSITE_ID);
    
    if (!micrositeId) {
      return res.status(400).json({ 
        success: false,
        error: 'micrositeId parameter is required' 
      });
    }

    if (!TC_BASE_URL) {
      return res.status(500).json({ 
        success: false,
        error: 'Missing TC_BASE_URL configuration' 
      });
    }

    console.log('[list-travels] Fetching travels for microsite:', micrositeId);

    // Get credentials for this specific microsite
    let username = TC_USERNAME;
    let password = TC_PASSWORD;
    
    // Method 1: TC_MICROSITES JSON (supports multiple microsites in one variable)
    if (TC_MICROSITES) {
      try {
        const micrositesConfig = JSON.parse(TC_MICROSITES);
        if (micrositesConfig[micrositeId]) {
          username = micrositesConfig[micrositeId].username || username;
          password = micrositesConfig[micrositeId].password || password;
          console.log('[list-travels] Using credentials from TC_MICROSITES for:', micrositeId);
        }
      } catch (e) {
        console.warn('[list-travels] Failed to parse TC_MICROSITES:', e.message);
      }
    }
    
    // Method 2: Numbered suffix pattern (TC_MICROSITE_ID_2, TC_USERNAME_2, etc.)
    for (let i = 2; i <= 10; i++) {
      const suffixedMicrositeId = process.env[`TC_MICROSITE_ID_${i}`];
      if (suffixedMicrositeId === micrositeId) {
        username = process.env[`TC_USERNAME_${i}`] || username;
        password = process.env[`TC_PASSWORD_${i}`] || password;
        console.log(`[list-travels] Using credentials from TC_*_${i} for microsite:`, micrositeId);
        break;
      }
    }

    // Remove trailing slash and /resources if present
    const base = TC_BASE_URL.replace(/\/$/, '').replace(/\/resources\/?$/, '');
    const AUTH_PATH = process.env.TC_AUTH_PATH || '/resources/authentication/authenticate';

    // Acquire Bearer token
    const headers = { Accept: 'application/json' };
    if (TC_TENANT_ID) headers['X-Tenant-Id'] = String(TC_TENANT_ID);
    
    let bearer = TC_TOKEN;
    if (!bearer) {
      if (!username || !password || !micrositeId) {
        return res.status(500).json({ 
          success: false,
          error: 'Missing TC credentials to authenticate' 
        });
      }
      
      const authBody = { 
        username, 
        password, 
        micrositeId: parseInt(micrositeId) || micrositeId
      };
      
      console.log('[list-travels] Authenticating with TC...');
      
      const authRes = await fetch(`${base}${AUTH_PATH}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip'
        },
        body: JSON.stringify(authBody)
      });
      
      const authText = await authRes.text();
      let authJson;
      try { authJson = JSON.parse(authText); } catch (e) { authJson = null; }
      
      if (!authRes.ok || !authJson?.token) {
        console.error('[list-travels] Auth failed:', authRes.status);
        return res.status(authRes.status || 500).json({ 
          success: false,
          error: 'Authentication failed',
          detail: authJson?.message || authText
        });
      }
      
      bearer = authJson.token;
      console.log('[list-travels] Auth successful');
    }
    
    // Set auth token header
    headers['auth-token'] = bearer;

    // Build the ideas list URL
    // TC API: GET /resources/travelidea/{micrositeId} (without /ideas suffix)
    // See docs/travel-compositor.md: "List ideas: GET .../travelidea/<MICROSITE_ID>"
    const params = new URLSearchParams();
    params.set('language', String(language));
    params.set('lang', String(language));
    params.set('currency', String(currency));
    
    const ideasPath = `/resources/travelidea/${encodeURIComponent(micrositeId)}`;
    const ideasUrl = `${base}${ideasPath}?${params.toString()}`;
    
    console.log('[list-travels] Fetching ideas from:', ideasUrl);
    
    const ideasRes = await fetch(ideasUrl, { headers });
    const ideasText = await ideasRes.text();
    let ideasData;
    try { ideasData = JSON.parse(ideasText); } catch (e) { ideasData = null; }
    
    // Debug: Log the RAW response (truncated to avoid log overflow)
    console.log('[list-travels] Response status:', ideasRes.status);
    console.log('[list-travels] RAW RESPONSE (first 2000 chars):', ideasText.substring(0, 2000));
    console.log('[list-travels] Response type:', typeof ideasData);
    console.log('[list-travels] Is array:', Array.isArray(ideasData));
    if (ideasData && !Array.isArray(ideasData)) {
      console.log('[list-travels] Response keys:', Object.keys(ideasData));
      // Log ALL first level values to understand structure
      for (const key of Object.keys(ideasData)) {
        const val = ideasData[key];
        if (Array.isArray(val)) {
          console.log(`[list-travels] ${key}: Array(${val.length})`, val.length > 0 ? `first item keys: ${Object.keys(val[0] || {})}` : '');
        } else if (typeof val === 'object' && val !== null) {
          console.log(`[list-travels] ${key}: Object with keys:`, Object.keys(val));
        } else {
          console.log(`[list-travels] ${key}:`, val);
        }
      }
    }
    
    if (!ideasRes.ok) {
      console.error('[list-travels] Failed to fetch ideas:', ideasRes.status);
      return res.status(ideasRes.status).json({ 
        success: false,
        error: 'Failed to fetch travels from Travel Compositor',
        detail: ideasData || ideasText
      });
    }

    // Transform the response to the expected format
    // TC might return data in various structures - check all possibilities
    let rawIdeas = [];
    if (Array.isArray(ideasData)) {
      rawIdeas = ideasData;
    } else if (ideasData) {
      // Check ALL possible TC response structures
      // NOTE: TC API returns "idea" (singular) not "ideas" (plural)!
      rawIdeas = ideasData.idea || ideasData.ideas || ideasData.data || ideasData.travelIdeas || 
                 ideasData.items || ideasData.results || ideasData.list ||
                 ideasData.travels || ideasData.trips || ideasData.content ||
                 ideasData.travelIdea || ideasData.response || [];
      
      // If still empty, check if the response itself contains idea-like properties
      if (rawIdeas.length === 0 && ideasData.id) {
        // Single idea returned instead of list
        rawIdeas = [ideasData];
      }
      
      // If still empty but we have an object, maybe the ideas are nested differently
      if (rawIdeas.length === 0) {
        // Try to find any array in the response
        for (const key of Object.keys(ideasData)) {
          if (Array.isArray(ideasData[key]) && ideasData[key].length > 0) {
            console.log(`[list-travels] Found array in key "${key}" with ${ideasData[key].length} items`);
            rawIdeas = ideasData[key];
            break;
          }
        }
      }
    }
    
    console.log('[list-travels] Parsed rawIdeas count:', rawIdeas.length);
    if (rawIdeas.length > 0) {
      console.log('[list-travels] First idea keys:', Object.keys(rawIdeas[0]));
      console.log('[list-travels] First idea sample:', JSON.stringify(rawIdeas[0]).substring(0, 500));
    }
    
    const travels = rawIdeas.map(idea => ({
      id: String(idea.id || idea.ideaId || ''),
      title: idea.title || idea.name || idea.description || 'Untitled',
      nights: idea.nights || idea.duration || idea.numberOfNights || 0,
      price: idea.price || idea.totalPrice || idea.priceFrom || idea.startingPrice || 0,
      image: idea.image || idea.mainImage || idea.thumbnail || idea.images?.[0] || null,
      // Include some extra fields that might be useful
      description: idea.description || idea.shortDescription || '',
      destinations: idea.destinations || [],
      category: idea.category || idea.type || ''
    }));

    console.log('[list-travels] Found', travels.length, 'travels');

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 'public, max-age=300');
    
    return res.status(200).json({
      success: true,
      micrositeId: micrositeId,
      language: language,
      count: travels.length,
      travels: travels
    });

  } catch (error) {
    console.error('[list-travels] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      detail: error?.message || String(error)
    });
  }
}
