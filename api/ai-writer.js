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
  try { body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}'); } catch {}
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
        return `Schrijf een korte inleiding (80-120 woorden) voor een bestemmingspagina over ${country}. Toon 1 alinea, toon geen titel.`;
      case 'highlights':
        return `Geef ${count} highlights voor ${country}. Voor elk item: titel (3-5 woorden) en 1 korte samenvatting (10-20 woorden). Geef JSON: [{"title":"..","summary":".."}]`;
      case 'activities':
        return `Geef ${count} activiteiten voor ${country}. Voor elk item: titel (3-5 woorden), korte samenvatting (10-20 woorden) en een geschikt Font Awesome 6 icon-naam (fa-...)
Als JSON: [{"title":"..","summary":"..","icon":"fa-..."}]`;
      case 'extra':
        return `Schrijf een extra tekstblok (80-120 woorden) met praktische tips of context voor ${country}. Eén alinea.`;
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
      try { parsed = JSON.parse(content); } catch { /* if model returned prose, fallback below */ }
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
