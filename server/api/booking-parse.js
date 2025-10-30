// server/api/booking-parse.js
// PDF booking confirmation parser with OpenAI extraction

const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// OpenAI extraction prompt
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

// Export multer middleware and handler separately
const uploadMiddleware = upload.single('pdf');

// Main handler
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }

  try {
    console.log('[BookingParse] Processing PDF:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Parse PDF
    const pdfData = await pdfParse(req.file.buffer);
    const pdfText = pdfData.text;

    console.log('[BookingParse] PDF extracted, text length:', pdfText.length);

    // Extract structured data with OpenAI
    const bookingData = await extractBookingData(pdfText);

    console.log('[BookingParse] Extraction successful:', bookingData);

    // Return extracted data
    return res.json({
      success: true,
      data: bookingData,
      meta: {
        filename: req.file.originalname,
        pages: pdfData.numpages,
        textLength: pdfText.length
      }
    });

  } catch (error) {
    console.error('[BookingParse] Processing error:', error);
    return res.status(500).json({
      error: 'PDF processing failed',
      detail: error.message
    });
  }
}

module.exports = { uploadMiddleware, handler };
