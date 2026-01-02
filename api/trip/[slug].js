import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://huaaogdxxdcakxryecnw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getBrandSlug(req) {
  try {
    const hostRaw = String(req.headers.host || '');
    const host = hostRaw.split(':')[0];
    const fromQuery = (req.query && (req.query.brand || req.query.brand_slug)) || '';
    if (fromQuery) return String(fromQuery);
    const parts = host.split('.');
    if (parts.length >= 3) return parts[0];
    return '';
  } catch (e) {
    return '';
  }
}

function extractTripHtml(trip) {
  try {
    const c = trip && trip.content;
    if (!c) return '';
    if (typeof c === 'string') return c;
    if (typeof c === 'object') {
      if (typeof c.html === 'string') return c.html;
      if (c.content && typeof c.content.html === 'string') return c.content.html;
      if (typeof c.body_html === 'string') return c.body_html;
    }
    return '';
  } catch (e) {
    return '';
  }
}

function stripContentEditable(html) {
  try {
    const s = String(html || '');
    return s
      .replace(/\scontenteditable\s*=\s*(["'])?(?:true|plaintext-only)\1/gi, '')
      .replace(/\scontenteditable\b/gi, '');
  } catch (e) {
    return String(html || '');
  }
}

function stripScripts(html) {
  try {
    const s = String(html || '');
    return s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  } catch (e) {
    return String(html || '');
  }
}

function buildTripViewerHtml({ title, html }) {
  const safeTitle = escapeHtml(title || 'Reis');
  const cleanedBody = stripContentEditable(stripScripts(html));
  const body = cleanedBody || '<div style="padding:40px;text-align:center;color:#64748b;">Geen content</div>';

  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
  <link rel="stylesheet" href="/styles/main.css?v=tripviewer">
  <link rel="stylesheet" href="/styles/components.css?v=tripviewer">
  <link rel="stylesheet" href="/styles/roadbook-timeline.css?v=tripviewer">
  <link rel="stylesheet" href="/styles/roadbook-timeline-new.css?v=tripviewer" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body { height: auto; min-height: 100vh; }
    body{ background:#fff; margin:0; padding:0; overflow-x:hidden; overflow-y:auto; }
    main{ width: 100%; margin: 0; padding: 0; }
    .wb-component { margin-top: 0 !important; margin-bottom: 0 !important; }
  </style>
</head>
<body>
  <main id="trip-body">${body}</main>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="/js/components.js?v=tripviewer"></script>
  <script src="/js/roadbook-timeline-animation.js?v=tripviewer"></script>
  <script>
    (function(){
      function initRoadbooks() {
        try {
          if (window.ComponentFactory && typeof window.ComponentFactory.initRoadbookRouteMaps === 'function') {
            window.ComponentFactory.initRoadbookRouteMaps(document);
          }
        } catch (e) {}

        try {
          var timelines = document.querySelectorAll('.roadbook-animated-timeline-section, .roadbook-animated-timeline');
          timelines.forEach(function(timeline){
            try {
              var itineraryWrap = timeline.querySelector('#itinerary-wrap');
              var tube = itineraryWrap ? itineraryWrap.querySelector('.roadbook-road') : null;
              var line = itineraryWrap ? itineraryWrap.querySelector('.roadbook-road-line') : null;
              var itinerary = itineraryWrap ? itineraryWrap.querySelector('.itinerary') : null;
              if (itineraryWrap && tube && line && itinerary) {
                var updateRoadHeight = function(){
                  var days = Array.from(itinerary.querySelectorAll('.day'));
                  var height = 500;
                  if (days.length > 0) {
                    var lastDay = days[days.length - 1];
                    height = Math.max(lastDay.offsetTop + lastDay.offsetHeight, 500);
                  }
                  tube.style.height = height + 'px';
                  line.style.height = height + 'px';
                };
                updateRoadHeight();
                setTimeout(updateRoadHeight, 500);
                setTimeout(updateRoadHeight, 1200);
                window.addEventListener('resize', updateRoadHeight);
              }

              if (window.RoadbookTimelineAnimation) {
                new window.RoadbookTimelineAnimation(timeline);
              }
            } catch (e2) {}
          });
        } catch (e3) {}
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRoadbooks);
      } else {
        initRoadbooks();
      }
    })();
  </script>
</body>
</html>`;
}

export default async function handler(req, res) {
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
    const slug = req.query && req.query.slug;
    if (!slug) {
      return res.status(400).json({ error: 'Slug is required' });
    }

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Brand is optional for the trip viewer: if brand slug is present and found, enforce assignment
    // for that brand. Otherwise fall back to any published assignment.
    let brandId = null;
    try {
      const brandSlug = getBrandSlug(req);
      if (brandSlug) {
        const { data: brand } = await supabase
          .from('brands')
          .select('id')
          .eq('slug', brandSlug)
          .single();
        if (brand && brand.id) brandId = brand.id;
      }
    } catch (e) {
      brandId = null;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(slug));
    let tripQuery = supabase
      .from('trips')
      .select('id,title,slug,content,status');

    tripQuery = isUuid ? tripQuery.eq('id', slug) : tripQuery.eq('slug', slug);
    const { data: trip, error: tripError } = await tripQuery.single();

    if (tripError || !trip) {
      return res.status(404).send('Trip niet gevonden');
    }

    // Verify publication
    let assignment = null;
    try {
      let q = supabase
        .from('trip_brand_assignments')
        .select('id,is_published')
        .eq('trip_id', trip.id)
        .eq('is_published', true);
      if (brandId) q = q.eq('brand_id', brandId);
      const { data, error: assignError } = await q.limit(1).maybeSingle();
      if (assignError) throw assignError;
      assignment = data;
    } catch (e) {
      assignment = null;
    }

    if (!assignment) {
      return res.status(404).send('Trip niet gepubliceerd');
    }

    const html = extractTripHtml(trip);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    return res.status(200).send(buildTripViewerHtml({ title: trip.title, html }));
  } catch (e) {
    console.error('[trip-viewer] Error:', e);
    return res.status(500).send('Serverfout');
  }
}
