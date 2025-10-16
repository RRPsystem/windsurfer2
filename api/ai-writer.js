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
        return `Schrijf een inspirerende inleiding van ongeveer 200 woorden voor een bestemmingspagina over ${country}. Beschrijf wat het land uniek maakt, de cultuur, natuur en waarom bezoekers het moeten ervaren. Schrijf in 2-3 alinea's. Toon geen titel.`;
      case 'highlights':
        return `Geef ${count} specifieke highlights voor ${country}. Denk aan iconische bezienswaardigheden, unieke ervaringen, bekende plaatsen. Voor elk item: een korte titel (2-4 woorden) en een beknopte beschrijving (8-15 woorden). Geef JSON: [{"title":"Sagrada Familia","summary":"Gaudí's meesterwerk in Barcelona"}]`;
      case 'activities':
        return `Geef ${count} specifieke activiteiten voor ${country}. Voor elk item: een korte titel (2-4 woorden) en een beschrijving (8-15 woorden) wat je daar doet. Bijvoorbeeld: {"title":"Fushimi Inari","summary":"Bezoek de iconische tempel met duizenden rode torii poorten"}. Geef JSON: [{"title":"..","summary":".."}]`;
      case 'extra':
        return `Schrijf een aanvullend tekstblok van ongeveer 200 woorden over ${country}. Focus op praktische informatie, beste reistijd, lokale tips, of verdieping over cultuur en tradities. Schrijf in 2-3 alinea's. Toon geen titel.`;
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
