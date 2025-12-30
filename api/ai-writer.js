// Helper to get base URL for internal API calls
function getBaseUrl(req) {
  const host = req.headers.host || 'localhost:5050';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || process.env.OPENAI_APIKEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured' });
  }

  let body = {};
  try { body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}'); } catch (e) {}
  const {
    section = 'intro',
    country = '',
    destination = '', // Specific destination (e.g., "Victoria Island")
    tone = 'inspiring',
    language = 'nl',
    count = 6,
    images = [],
    useResearch = true, // Enable Google Search research
    // Builder/editor fields (content_block)
    page_title = '',
    section_title = '',
    content_mode = '',
    currentText = '',
    trip_title = '',
    travel_context = '',
    // Route (optional)
    route_mode = false,
    route_from = '',
    route_to = '',
    route_stops = 3,
  } = body || {};

  // Use destination if provided, otherwise use country
  const location = destination || country || page_title;

  // Fetch Google Search research if enabled
  let research = null;
  if (useResearch && location) {
    try {
      console.log('[AI Writer] Fetching research for:', location);
      const researchResponse = await fetch(`${getBaseUrl(req)}/api/research/destination`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: location, language })
      });
      
      if (researchResponse.ok) {
        research = await researchResponse.json();
        console.log('[AI Writer] Research loaded:', {
          highlights: research.highlights?.length || 0,
          activities: research.activities?.length || 0
        });
      }
    } catch (error) {
      console.warn('[AI Writer] Research failed, continuing without:', error.message);
    }
  }

  const stripHtml = (s) => {
    try {
      return String(s || '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    } catch (e) {
      return '';
    }
  };

  let routeDetails = null;
  try {
    const wantRoute = !!route_mode && String(route_from || '').trim() && String(route_to || '').trim();
    const gKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (wantRoute && gKey) {
      const origin = encodeURIComponent(String(route_from).trim());
      const dest = encodeURIComponent(String(route_to).trim());
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=driving&units=metric&language=${encodeURIComponent(String(language || 'nl'))}&key=${encodeURIComponent(gKey)}`;
      const rr = await fetch(url);
      if (rr.ok) {
        const rj = await rr.json();
        const leg = rj?.routes?.[0]?.legs?.[0] || null;
        if (leg) {
          const steps = Array.isArray(leg.steps) ? leg.steps : [];
          routeDetails = {
            distanceText: leg.distance?.text || '',
            durationText: leg.duration?.text || '',
            startAddress: leg.start_address || '',
            endAddress: leg.end_address || '',
            steps: steps.slice(0, 8).map((st) => {
              const inst = stripHtml(st.html_instructions || '');
              const dist = st.distance?.text || '';
              return `${inst}${dist ? ` (${dist})` : ''}`.trim();
            }).filter(Boolean)
          };
        }
      }
    }
  } catch (e) {}

  const toneHint = (() => {
    switch (String(tone || '').toLowerCase()) {
      case 'luxury': return 'Schrijf luxe, premium en verfijnd, zonder overdreven superlatieven.';
      case 'informative': return 'Schrijf informatief, praktisch en concreet, zonder marketingtaal.';
      case 'friendly': return 'Schrijf warm, vriendelijk en toegankelijk.';
      default: return 'Schrijf inspirerend, concreet en beeldend.';
    }
  })();

  const system = `Je bent een professionele reis-copywriter. Schrijf in ${language}. Toon geen disclaimers. Gebruik korte, concrete zinnen. ${toneHint} Geef alleen de tekst terug, zonder titel of extra uitleg.`;

  const makePrompt = () => {
    switch (section) {
      case 'content_block': {
        const topic = (page_title || location || country || '').trim();
        const instruction = (section_title || '').trim();
        const hasCurrent = !!String(currentText || '').trim();
        const hasCtx = !!String(travel_context || '').trim();
        const trip = String(trip_title || '').trim();
        const base = topic ? `Context: ${topic}.` : '';
        const mode = String(content_mode || '').trim().toLowerCase();
        const isDayplan = mode === 'dayplan';
        const isRoute = (!!route_mode) || (mode === 'route');
        const nStops = Math.max(1, Math.min(6, parseInt(String(route_stops || 3), 10) || 3));
        const from = String(route_from || '').trim();
        const to = String(route_to || '').trim();
        const instr = instruction
          ? `Opdracht: ${instruction}`
          : (isRoute
            ? 'Opdracht: Maak een routebeschrijving (rijdag) voor het roadbook.'
            : (isDayplan
              ? 'Opdracht: Maak een dagplanning (verblijfsdag) voor het roadbook.'
              : 'Opdracht: Schrijf een aantrekkelijke, concrete tekst voor een reisprogramma.'));
        const rewrite = hasCurrent ? `\n\nHuidige tekst (mag je verbeteren en herschrijven):\n"""\n${String(currentText || '').trim()}\n"""` : '';
        const ctxBlock = hasCtx ? `\n\nReiscontext (gebruik dit om specifiek te schrijven):\n"""\n${String(travel_context || '').trim()}\n"""` : '';
        const specRule = hasCtx ?
          '\n- Gebruik minimaal 2 concrete details uit de reiscontext (plaatsnamen, dag-indeling, hotel/activiteiten/vervoer)'
          : '\n- Als er geen reiscontext is: schrijf neutraal maar nog steeds concreet (geen algemene vage reis-clichés)';
        const tripRule = trip ? `\n- Het gaat om deze reis: ${trip}` : '';

        const routeBlock = (() => {
          if (!isRoute) return '';
          let s = '';
          if (from || to) s += `\n\nRoute: ${from || '[onbekend]'} → ${to || '[onbekend]'}`;
          if (routeDetails) {
            s += `\nGoogle route details:`;
            if (routeDetails.distanceText) s += `\n- Afstand: ${routeDetails.distanceText}`;
            if (routeDetails.durationText) s += `\n- Reistijd (zonder stops): ${routeDetails.durationText}`;
            if (routeDetails.steps && routeDetails.steps.length) {
              s += `\n- Belangrijkste stappen:`;
              routeDetails.steps.forEach((st, i) => { s += `\n  ${i + 1}. ${st}`; });
            }
          } else {
            s += `\n(Geen Google route details beschikbaar; schat afstand en reistijd realistisch.)`;
          }
          return s;
        })();

        if (isRoute) {
          return `${base}\n${instr}${ctxBlock}${routeBlock}\n\nVereisten:\n- Schrijf als een roadbook voor een rijdag\n- Geef een Route-overzicht met: totale afstand, reistijd zonder stops, reistijd met stops (realistische schatting)\n- Geef een korte routebeschrijving in maximaal 8 stappen (kort en duidelijk)\n- Licht ${nStops} leuke stops onderweg uit (naam/plaats + 1-2 zinnen wat je daar doet/ziet + waarom het leuk is)\n- Voeg 3 praktische tips toe (tankstop, pauzes, veiligheid, laatste boodschappen)${tripRule}${specRule}\n- Geen disclaimers\n- Geen aanhalingstekens om de output\n\nGeef alleen de uiteindelijke tekst.${rewrite}`;
        }

        if (isDayplan) {
          const dayTopic = topic || 'deze plek';
          return `${base}\n${instr}${ctxBlock}\n\nVereisten:\n- Schrijf als een dagplanning voor een verblijfsdag (geen verplaatsing van A naar B)\n- Gebruik duidelijke kopjes met: Ochtend, Middag, Avond\n- Voeg 6-10 concrete suggesties toe (activiteiten, highlights, eten/drinken), passend bij ${dayTopic}\n- Gebruik korte bullets of korte zinnen waar dat helpt voor leesbaarheid\n- Voeg 2-4 praktische tips toe (planning, tickets/reserveren, tijden, vervoer/looproutes, rustmomenten)\n- Sluit af met één Extra tip${tripRule}${specRule}\n- Geen disclaimers\n- Geen aanhalingstekens om de output\n\nGeef alleen de uiteindelijke tekst.${rewrite}`;
        }

        return `${base}\n${instr}${ctxBlock}\n\nVereisten:\n- Schrijf 80-140 woorden (tenzij de opdracht duidelijk anders vraagt)\n- Vermijd clichés en vage claims${tripRule}${specRule}\n- Gebruik concrete details, sfeer en (indien passend) 1-2 praktische tips\n- Geen opsommingen tenzij de opdracht erom vraagt\n- Geen aanhalingstekens om de output\n\nGeef alleen de uiteindelijke tekst.${rewrite}`;
      }
      case 'intro':
        let introPrompt = `Schrijf een concrete, informatieve inleiding van ongeveer 200 woorden over ${location}. 

VERMIJD clichés zoals "land van tegenstellingen", "absoluut de moeite waard" of vage taal. Gebruik in plaats daarvan:
- Specifieke voorbeelden van steden, regio's of bezienswaardigheden
- Concrete contrasten (bijv. moderne steden vs. traditionele dorpen)
- Unieke culturele aspecten met voorbeelden

Schrijf in 2-3 alinea's. Geen titel, geen subtitel. Direct beginnen met de tekst.`;

        if (research && research.highlights && research.highlights.length > 0) {
          introPrompt += `\n\nGebruik deze specifieke informatie in je tekst:\n${research.highlights.slice(0, 3).map((h, i) => `${i + 1}. ${h}`).join('\n')}`;
        }
        
        if (research && research.places && research.places.length > 0) {
          introPrompt += `\n\nTop attracties (met ratings):\n${research.places.slice(0, 3).map((p, i) => `${i + 1}. ${p.name}${p.rating ? ` (${p.rating}★, ${p.reviews.toLocaleString()} reviews)` : ''}`).join('\n')}`;
        }
        
        if (research && research.culture && research.culture.length > 0) {
          introPrompt += `\n\nCulturele context:\n${research.culture.slice(0, 2).join('\n')}`;
        }
        
        return introPrompt;

      case 'highlights':
        return `Geef ${count} specifieke highlights voor ${country}. Wees concreet en uniek!

Voorbeelden van GOEDE highlights:
- "Kaasmarkt Alkmaar" - Proef Goudse kaas op de traditionele markt
- "Fietsen in Amsterdam" - Verken de grachten op de fiets
- "Molens van Kinderdijk" - Bezoek 19 authentieke windmolens
- "Kroket uit de muur" - Typisch Nederlandse snack ervaring
- "Fushimi Inari" - Wandel door duizenden rode torii poorten
- "Sagrada Familia" - Gaudí's iconische basiliek in Barcelona

Voorbeelden van SLECHTE highlights (NIET doen):
- "Rijke culturele geschiedenis"
- "Prachtige natuurlijke landschappen"
- "Diverse activiteiten"

Geef JSON array met title (2-5 woorden) en summary (8-15 woorden):
[{"title":"Kaasmarkt Alkmaar","summary":"Proef authentieke Goudse kaas op de traditionele kaasmarkt"}]`;

      case 'activities':
        let activitiesPrompt = `Geef ${count} specifieke activiteiten voor ${location}. Wees concreet!

Voorbeelden van GOEDE activiteiten:
- {"title":"Fushimi Inari","summary":"Wandel door duizenden rode torii poorten naar de bergtop"}
- {"title":"Rijksmuseum","summary":"Bewonder Rembrandts Nachtwacht en Vermeers Melkmeisje"}
- {"title":"Grachtenrondvaart","summary":"Vaar door de UNESCO grachten van Amsterdam"}
- {"title":"Anne Frank Huis","summary":"Bezoek het achterhuis waar Anne Frank haar dagboek schreef"}

Voorbeelden van SLECHTE activiteiten (NIET doen):
- {"title":"Activiteit 1","summary":"Bezoek historische bezienswaardigheden"}
- {"title":"Activiteit 2","summary":"Proef de lokale keuken"}

Voor elk item:
- title: naam van plek/activiteit (2-5 woorden)
- summary: wat je doet/ziet (8-15 woorden)`;

        if (research && research.activities && research.activities.length > 0) {
          activitiesPrompt += `\n\nGebruik deze informatie voor inspiratie:\n${research.activities.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;
        }
        
        activitiesPrompt += `\n\nGeef JSON array: [{"title":"..","summary":".."}]`;
        return activitiesPrompt;

      case 'extra':
        return `Schrijf een praktisch, informatief tekstblok van ongeveer 200 woorden over ${country}. Focus op:

1. **Beste reistijd**: Specifieke maanden per regio, vermijd drukke periodes (bijv. Chinese Nieuwjaar, Golden Week)
2. **Eten & cultuur**: Concrete gerechten per regio, eetgewoonten, etiquette, lokale gewoonten

Schrijf in 2 korte alinea's (elk ~100 woorden). Geen titel, geen subtitel. Wees concreet en feitelijk correct. Vermijd vage adviezen en GEEN informatie over betalen, SIM-kaarten of apps.`;

      case 'gallery_captions':
        return `Geef bij ${images.length} foto\'s over ${country} een korte caption (6-10 woorden) die algemeen past.
Als JSON: [{"caption":".."}] met dezelfde volgorde als de foto\'s.`;
      default:
        return `Schrijf een korte paragraaf (80-120 woorden) over ${location || country}.`;
    }
  };

  const prompt = makePrompt();

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      })
    });

    if (!r.ok) {
      const text = await r.text().catch(()=> '');
      return res.status(500).json({ error: 'OpenAI request failed', detail: text });
    }
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content?.trim() || '';

    let parsed = null;
    if (section === 'highlights' || section === 'activities' || section === 'gallery_captions') {
      try { parsed = JSON.parse(content); } catch (e) { /* if model returned prose, fallback below */ }
    }

    if (section === 'intro') return res.json({ intro: { text: content } });
    if (section === 'extra') return res.json({ extra: { text: content } });
    if (section === 'highlights') return res.json({ highlights: Array.isArray(parsed) ? parsed : [] });
    if (section === 'activities') return res.json({ activities: Array.isArray(parsed) ? parsed : [] });
    if (section === 'gallery_captions') return res.json({ gallery_captions: Array.isArray(parsed) ? parsed : images.map(()=>({ caption: '' })) });

    return res.json({ text: content });
  } catch (err) {
    return res.status(500).json({ error: 'AI generation failed', detail: String(err?.message || err) });
  }
}
