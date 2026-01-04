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
    const debug = String((req.query && (req.query.debug ?? req.query._debug)) ?? '') === '1';
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
    let brandSlug = '';
    let brandError = null;
    try {
      brandSlug = getBrandSlug(req);
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
      brandError = String(e && e.message ? e.message : e);
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(slug));
    let trip = null;
    let tripError = null;
    let assignment = null;
    let lookupMode = isUuid ? 'uuid' : 'slug';
    let tripLookup = null;
    let tripLookupAttempts = [];
    let assignmentLookup = null;

    if (isUuid) {
      // 1) Prefer direct trip lookup by UUID
      const tripRes = await supabase
        .from('trips')
        .select('id,brand_id,title,slug,content,status')
        .eq('id', slug)
        .maybeSingle();

      trip = tripRes.data || null;
      tripError = tripRes.error || null;
      tripLookup = {
        tried: 'trips.id',
        found: !!trip,
        error: tripError ? (tripError.message || String(tripError)) : null
      };
      tripLookupAttempts.push(tripLookup);

      // 1b) Fallback: sometimes UUID-like values are stored as trips.slug
      if (!trip) {
        const tripBySlugRes = await supabase
          .from('trips')
          .select('id,brand_id,title,slug,content,status')
          .eq('slug', slug)
          .maybeSingle();

        const tripBySlug = tripBySlugRes.data || null;
        const tripBySlugErr = tripBySlugRes.error || null;
        const tripSlugAttempt = {
          tried: 'trips.slug (uuid-like)',
          found: !!tripBySlug,
          error: tripBySlugErr ? (tripBySlugErr.message || String(tripBySlugErr)) : null
        };
        tripLookupAttempts.push(tripSlugAttempt);

        if (tripBySlug) {
          trip = tripBySlug;
          tripError = tripBySlugErr;
          tripLookup = tripSlugAttempt;
          lookupMode = 'uuid_as_slug';
        }
      }

      // 2) Fallback: some public URLs might use trip_brand_assignments.id
      if (!trip) {
        const assignmentRes = await supabase
          .from('trip_brand_assignments')
          .select('id,trip_id,brand_id,is_published')
          .eq('id', slug)
          .maybeSingle();

        const maybeAssignment = assignmentRes.data || null;
        assignmentLookup = {
          tried: 'trip_brand_assignments.id',
          found: !!maybeAssignment,
          error: assignmentRes.error ? (assignmentRes.error.message || String(assignmentRes.error)) : null
        };

        if (maybeAssignment) {
          if (!maybeAssignment.is_published) {
            if (debug) {
              return res.status(200).json({
                ok: false,
                reason: 'assignment_not_published',
                host: String(req.headers.host || ''),
                brandSlug,
                brandId,
                brandError,
                slug,
                isUuid,
                lookupMode,
                tripLookup,
                tripLookupAttempts,
                assignmentLookup,
                assignment: { id: maybeAssignment.id, trip_id: maybeAssignment.trip_id, brand_id: maybeAssignment.brand_id, is_published: maybeAssignment.is_published }
              });
            }
            return res.status(404).send('Trip niet gepubliceerd');
          }

          // If we can resolve brand from subdomain, enforce brand match.
          if (brandId && maybeAssignment.brand_id && maybeAssignment.brand_id !== brandId) {
            if (debug) {
              return res.status(200).json({
                ok: false,
                reason: 'brand_mismatch',
                host: String(req.headers.host || ''),
                brandSlug,
                brandId,
                brandError,
                slug,
                isUuid,
                lookupMode,
                tripLookup,
                tripLookupAttempts,
                assignmentLookup,
                assignment: { id: maybeAssignment.id, trip_id: maybeAssignment.trip_id, brand_id: maybeAssignment.brand_id, is_published: maybeAssignment.is_published }
              });
            }
            return res.status(404).send('Trip niet gepubliceerd');
          }

          assignment = maybeAssignment;
          lookupMode = 'assignment_uuid';
          const tripByAssignRes = await supabase
            .from('trips')
            .select('id,brand_id,title,slug,content,status')
            .eq('id', maybeAssignment.trip_id)
            .maybeSingle();

          trip = tripByAssignRes.data || null;
          tripError = tripByAssignRes.error || null;
          tripLookup = {
            tried: 'trips.id via assignment.trip_id',
            found: !!trip,
            error: tripError ? (tripError.message || String(tripError)) : null
          };
        }
      }
    } else {
      const tripRes = await supabase
        .from('trips')
        .select('id,brand_id,title,slug,content,status')
        .eq('slug', slug)
        .maybeSingle();

      trip = tripRes.data || null;
      tripError = tripRes.error || null;
      tripLookup = {
        tried: 'trips.slug',
        found: !!trip,
        error: tripError ? (tripError.message || String(tripError)) : null
      };
    }

    if (tripError || !trip) {
      if (debug) {
        return res.status(200).json({
          ok: false,
          reason: 'trip_not_found',
          host: String(req.headers.host || ''),
          brandSlug,
          brandId,
          brandError,
          slug,
          isUuid,
          lookupMode,
          tripLookup,
          tripLookupAttempts,
          assignmentLookup
        });
      }
      return res.status(404).send('Trip niet gevonden');
    }

    // Verify publication
    if (!assignment) {
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
    }

    if (!assignment) {
      const tripStatus = String(trip && trip.status || '').trim().toLowerCase();
      const isPublicByStatus = (tripStatus === 'live' || tripStatus === 'published');
      const brandOk = !brandId || !trip.brand_id || trip.brand_id === brandId;
      if (isPublicByStatus && brandOk) {
        assignment = { id: null, is_published: true, _implicit: true, _via_status: tripStatus };
      }
    }

    if (!assignment) {
      if (debug) {
        return res.status(200).json({
          ok: false,
          reason: 'not_published',
          host: String(req.headers.host || ''),
          brandSlug,
          brandId,
          brandError,
          slug,
          isUuid,
          lookupMode,
          tripLookup,
          tripLookupAttempts,
          assignmentLookup,
          trip: { id: trip.id, brand_id: trip.brand_id, slug: trip.slug, title: trip.title, status: trip.status }
        });
      }
      return res.status(404).send('Trip niet gepubliceerd');
    }

    if (debug) {
      return res.status(200).json({
        ok: true,
        host: String(req.headers.host || ''),
        brandSlug,
        brandId,
        brandError,
        slug,
        isUuid,
        lookupMode,
        tripLookup,
        tripLookupAttempts,
        assignmentLookup,
        trip: { id: trip.id, brand_id: trip.brand_id, slug: trip.slug, title: trip.title, status: trip.status },
        assignment
      });
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
