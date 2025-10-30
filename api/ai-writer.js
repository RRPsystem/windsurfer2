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

  const apiKey = process.env.OPENAI_API_KEY;
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
  } = body || {};

  // Use destination if provided, otherwise use country
  const location = destination || country;

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

  const system = `Je bent een reiscontent schrijver. Schrijf in ${language}. Toon geen disclaimers. Gebruik korte, concrete zinnen.`;

  const makePrompt = () => {
    switch (section) {
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
        return `Schrijf een korte paragraaf (80-120 woorden) over ${country}.`;
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
