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
    tone = 'inspiring',
    language = 'nl',
    count = 6,
    images = [],
  } = body || {};

  const system = `Je bent een reiscontent schrijver. Schrijf in ${language}. Toon geen disclaimers. Gebruik korte, concrete zinnen.`;

  const makePrompt = () => {
    switch (section) {
      case 'intro':
        return `Schrijf een concrete, informatieve inleiding van ongeveer 200 woorden over ${country}. 

VERMIJD clichés zoals "land van tegenstellingen" of vage taal. Gebruik in plaats daarvan:
- Specifieke voorbeelden van steden, regio's of bezienswaardigheden
- Concrete contrasten (bijv. moderne steden vs. traditionele dorpen)
- Unieke culturele aspecten met voorbeelden

Schrijf in 2-3 alinea's. Geen titel, geen subtitel. Direct beginnen met de tekst.`;

      case 'highlights':
        return `Geef ${count} zeer specifieke, unieke highlights voor ${country}. GEEN algemene beschrijvingen!

Denk aan concrete, unieke ervaringen zoals:
- Voor Nederland: "Kaas eten op de kaasmarkt", "Kroket uit de muur", "Fietsen door Amsterdam", "Molens van Kinderdijk", "Wandelen op de Veluwe", "Deltawerken bezoeken"
- Voor Japan: "Fushimi Inari torii poorten", "Onsen (warmwaterbron)", "Sumo worstelen", "Kersenbloesem hanami"
- Voor Spanje: "Tapas in Barcelona", "Flamenco show", "Sagrada Familia"

Voor elk item: een korte, pakkende titel (2-5 woorden) en een concrete beschrijving (8-15 woorden).
Geef JSON: [{"title":"Kaasmarkt Alkmaar","summary":"Proef authentieke Goudse kaas op de traditionele kaasmarkt"}]`;

      case 'activities':
        return `Geef ${count} specifieke, uitvoerbare activiteiten voor ${country}. Voor elk item:
- Titel: de naam van de plek of activiteit (2-4 woorden)
- Summary: wat je daar doet of ziet (8-15 woorden)

Bijvoorbeeld: {"title":"Fushimi Inari","summary":"Wandel door duizenden rode torii poorten naar de bergtop"}
Geef JSON: [{"title":"..","summary":".."}]`;

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
