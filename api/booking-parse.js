// api/booking-parse.js
// Vercel Serverless Function for PDF parsing

const pdfParse = require('pdf-parse');

const EXTRACTION_PROMPT = `Je bent een expert in het extraheren van reisgegevens uit boekingsbevestigingen.

Extraheer de volgende informatie uit deze boekingsbevestiging en geef het terug als JSON:

{
  "title": "Reis titel/bestemming",
  "bookingReference": "PNR/booking nummer",
  "travelers": [
    {"name": "Volledige naam", "type": "adult/child"}
  ],
  "flights": [
    {
      "from": "Vertrek luchthaven",
      "to": "Aankomst luchthaven", 
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "flightNumber": "Vluchtnummer",
      "airline": "Luchtvaartmaatschappij"
    }
  ],
  "hotel": {
    "name": "Hotel naam",
    "address": "Adres",
    "checkIn": "YYYY-MM-DD",
    "checkOut": "YYYY-MM-DD",
    "roomType": "Kamer type",
    "nights": aantal_nachten
  },
  "price": {
    "total": bedrag_als_nummer,
    "currency": "EUR"
  },
  "dates": {
    "departure": "YYYY-MM-DD",
    "return": "YYYY-MM-DD"
  }
}

Als informatie ontbreekt, gebruik null. Geef ALLEEN de JSON terug, geen extra tekst.`;

async function extractBookingData(pdfText) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

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
          content: EXTRACTION_PROMPT
        },
        {
          role: 'user',
          content: `Hier is de tekst uit de PDF:\n\n${pdfText}`
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
  
  return JSON.parse(content);
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

  try {
    // Vercel automatically parses multipart/form-data
    const { pdf } = req.body;
    
    if (!pdf) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log('[BookingParse] Processing PDF');

    // Convert base64 to buffer if needed
    let pdfBuffer;
    if (typeof pdf === 'string') {
      pdfBuffer = Buffer.from(pdf, 'base64');
    } else {
      pdfBuffer = pdf;
    }

    // Parse PDF
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;

    console.log('[BookingParse] PDF extracted, text length:', pdfText.length);

    // Extract structured data with OpenAI
    const bookingData = await extractBookingData(pdfText);

    console.log('[BookingParse] Extraction successful');

    return res.status(200).json({
      success: true,
      data: bookingData,
      meta: {
        pages: pdfData.numpages,
        textLength: pdfText.length
      }
    });

  } catch (error) {
    console.error('[BookingParse] Error:', error);
    return res.status(500).json({
      error: 'PDF processing failed',
      detail: error.message
    });
  }
}
