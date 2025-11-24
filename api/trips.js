// GET /api/trips?brand_id=...
// Returns active trips for a brand by fetching each idea from TC /info endpoint

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const {
      TC_BASE_URL = '',
      TC_MICROSITE_ID = '',
      TC_TOKEN = '',
      TC_USERNAME = '',
      TC_PASSWORD = '',
      SUPABASE_URL = '',
      SUPABASE_SERVICE_ROLE_KEY = ''
    } = process.env;

    const brandId = req.query?.brand_id;
    if (!brandId) {
      return res.status(400).json({ error: 'Missing brand_id parameter' });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    if (!TC_BASE_URL || !TC_MICROSITE_ID) {
      return res.status(500).json({ error: 'Travel Compositor not configured' });
    }

    // Get active ideas for this brand from Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: ideas, error: ideasError } = await supabase
      .from('brand_travelideas')
      .select('idea_id, sort_order, highlight')
      .eq('brand_id', brandId)
      .eq('provider', 'travel_compositor')
      .eq('active', true)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (ideasError) {
      console.error('[trips] Supabase error:', ideasError);
      return res.status(500).json({ error: 'Failed to fetch brand trips' });
    }

    if (!ideas || ideas.length === 0) {
      return res.status(200).json({ items: [] });
    }

    console.log('[trips] Found', ideas.length, 'active ideas for brand', brandId);

    // Get auth token
    const base = TC_BASE_URL.replace(/\/$/, '');
    let token = TC_TOKEN;

    if (!token) {
      if (!TC_USERNAME || !TC_PASSWORD) {
        return res.status(500).json({ error: 'TC credentials missing' });
      }

      const authUrl = `${base}/resources/authentication/authenticate`;
      const authRes = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ 
          username: TC_USERNAME, 
          password: TC_PASSWORD, 
          micrositeId: TC_MICROSITE_ID 
        })
      });

      const authData = await authRes.json();
      if (!authRes.ok || !authData?.token) {
        console.error('[trips] Auth failed:', authData);
        return res.status(500).json({ error: 'TC authentication failed' });
      }

      token = authData.token;
    }

    // Fetch each idea via /info endpoint
    const items = [];
    const language = req.query?.language || 'NL';
    const currency = req.query?.currency || 'EUR';

    for (const idea of ideas) {
      const ideaId = idea.idea_id;
      try {
        const infoUrl = `${base}/resources/travelidea/${encodeURIComponent(TC_MICROSITE_ID)}/info/${encodeURIComponent(ideaId)}?lang=${language}&currency=${currency}`;
        
        const infoRes = await fetch(infoUrl, {
          headers: {
            'auth-token': token,
            'Accept': 'application/json'
          }
        });

        if (!infoRes.ok) {
          console.warn('[trips] Failed to fetch idea', ideaId, 'status:', infoRes.status);
          continue;
        }

        const ideaData = await infoRes.json();
        
        // Map TC data to our format
        items.push({
          id: ideaData.id || ideaId,
          title: ideaData.title || ideaData.largeTitle || 'Untitled',
          description: ideaData.description || '',
          subtitle: ideaData.largeTitle || '',
          image: ideaData.imageUrl || '',
          imageUrl: ideaData.imageUrl || '',
          priceFrom: ideaData.pricePerPerson?.amount || ideaData.totalPrice?.amount || null,
          price_from: ideaData.pricePerPerson?.amount || ideaData.totalPrice?.amount || null,
          currency: ideaData.pricePerPerson?.currency || ideaData.totalPrice?.currency || currency,
          duration: ideaData.counters?.hotelNights || ideaData.counters?.closedTours || null,
          destinations: ideaData.destinations || [],
          destination: ideaData.destinations?.[0]?.name || '',
          badge: ideaData.ribbonText || '',
          ribbonText: ideaData.ribbonText || '',
          url: ideaData.ideaUrl || `/trip/${ideaId}`,
          ideaUrl: ideaData.ideaUrl || `/trip/${ideaId}`,
          highlight: idea.highlight || false,
          sort_order: idea.sort_order,
          // Include raw data for debugging
          _raw: ideaData
        });

        console.log('[trips] Fetched idea:', ideaId, ideaData.title);
      } catch (err) {
        console.error('[trips] Error fetching idea', ideaId, err);
      }
    }

    console.log('[trips] Returning', items.length, 'items');

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json({ items });

  } catch (err) {
    console.error('[trips] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal error', detail: err.message });
  }
}
