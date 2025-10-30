// api/url-import.js
// Vercel Serverless Function for URL import

const axios = require('axios');
const cheerio = require('cheerio');

const EXTRACTION_PROMPT = `Je bent een expert in het extraheren van complete reisgegevens uit booking websites.

Extraheer ALLE beschikbare informatie en geef het terug als JSON in dit formaat:

{
  "name": "Reis naam/titel",
  "title": "Reis titel",
  "description": "Volledige beschrijving",
  "intro": "Korte intro tekst",
  "destination": "Bestemming/land",
  "country": "Land",
  "region": "Regio",
  "city": "Stad",
  "bookingReference": "PNR/booking nummer",
  "duration": aantal_dagen,
  "travelers": [{"name": "Naam", "type": "adult/child/infant", "age": leeftijd_optioneel}],
  "flights": [{"from": "Code", "fromName": "Naam", "to": "Code", "toName": "Naam", "date": "YYYY-MM-DD", "time": "HH:MM", "arrivalDate": "YYYY-MM-DD", "arrivalTime": "HH:MM", "flightNumber": "Nr", "airline": "Maatschappij", "class": "Economy/Business", "duration": minuten}],
  "hotel": {"name": "Naam", "address": "Adres", "city": "Stad", "country": "Land", "checkIn": "YYYY-MM-DD", "checkOut": "YYYY-MM-DD", "roomType": "Type", "nights": aantal, "board": "All-inclusive/etc", "stars": aantal, "amenities": ["faciliteit"]},
  "days": [{"day": nr, "title": "Titel", "description": "Beschrijving", "activities": [{"name": "Naam", "description": "Beschrijving", "time": "HH:MM", "duration": minuten}], "accommodation": "Hotel", "meals": ["breakfast", "lunch", "dinner"], "transport": [{"type": "flight/bus/train", "from": "Van", "to": "Naar", "time": "HH:MM"}]}],
  "price": {"total": bedrag, "currency": "EUR", "perPerson": bedrag, "deposit": bedrag, "included": ["wat"], "excluded": ["wat"]},
  "dates": {"departure": "YYYY-MM-DD", "return": "YYYY-MM-DD", "bookingDate": "YYYY-MM-DD"},
  "inclusions": ["Wat is inbegrepen"],
  "exclusions": ["Wat niet"],
  "highlights": ["Hoogtepunten"],
  "itinerary": {"summary": "Samenvatting", "map": "URL"},
  "images": [{"url": "URL", "caption": "Beschrijving", "type": "main/gallery/day"}],
  "contacts": {"agency": "Naam", "phone": "Nr", "email": "Email", "emergencyContact": "Contact"},
  "documents": {"visa": "Info", "passport": "Vereisten", "insurance": "Info", "vaccination": "Vereisten"},
  "cancellationPolicy": "Voorwaarden",
  "importantInfo": ["Belangrijke info"]
}

Als informatie ontbreekt, gebruik null of lege array. Geef ALLEEN de JSON terug.`;

async function extractFromHTML(html, url) {
  const $ = cheerio.load(html);
  
  const extracted = {
    title: $('h1').first().text().trim() || $('title').text().trim(),
    description: $('meta[name="description"]').attr('content') || '',
    images: []
  };
  
  $('img').each((i, elem) => {
    const src = $(elem).attr('src');
    const alt = $(elem).attr('alt');
    if (src && !src.includes('logo') && !src.includes('icon')) {
      extracted.images.push({
        url: src.startsWith('http') ? src : new URL(src, url).href,
        caption: alt || '',
        type: i === 0 ? 'main' : 'gallery'
      });
    }
  });
  
  return extracted;
}

async function extractWithAI(html, cheerioData) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const $ = cheerio.load(html);
  const textContent = $('body').text().replace(/\s+/g, ' ').trim();
  
  const prompt = `URL: ${cheerioData.url || 'N/A'}
Titel: ${cheerioData.title || 'N/A'}
Beschrijving: ${cheerioData.description || 'N/A'}

HTML Content:
${textContent.substring(0, 15000)}

${EXTRACTION_PROMPT}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Je bent een expert in het extraheren van complete reisgegevens. Geef altijd valide JSON terug.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  const extracted = JSON.parse(content);
  
  if (!extracted.images || extracted.images.length === 0) {
    extracted.images = cheerioData.images;
  }
  
  return extracted;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log('[URLImport] Fetching URL:', url);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000,
      maxRedirects: 5
    });

    const html = response.data;
    console.log('[URLImport] HTML fetched, length:', html.length);

    const cheerioData = await extractFromHTML(html, url);
    cheerioData.url = url;

    console.log('[URLImport] Cheerio extraction done');

    const travelData = await extractWithAI(html, cheerioData);

    console.log('[URLImport] AI extraction successful');

    return res.status(200).json({
      success: true,
      data: travelData,
      meta: {
        url: url,
        extractedAt: new Date().toISOString(),
        method: 'cheerio + openai'
      }
    });

  } catch (error) {
    console.error('[URLImport] Error:', error);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(400).json({
        error: 'URL niet bereikbaar',
        detail: 'De opgegeven URL kon niet worden geladen.'
      });
    }
    
    if (error.response?.status === 403 || error.response?.status === 401) {
      return res.status(400).json({
        error: 'Toegang geweigerd',
        detail: 'De website blokkeert automatische toegang.'
      });
    }

    return res.status(500).json({
      error: 'URL import failed',
      detail: error.message
    });
  }
}
