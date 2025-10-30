// api/booking-parse.js
// Vercel Serverless Function for PDF parsing

const { formidable } = require('formidable');
const fs = require('fs').promises;
const { put } = require('@vercel/blob');

const VISION_EXTRACTION_PROMPT = `Je bent een expert in het analyseren van reisboekingsbevestigingen.

Analyseer deze PDF pagina's ZEER ZORGVULDIG en extraheer ALLE reisgegevens die je ziet.

KRITISCHE INSTRUCTIES:
1. Kijk naar ELKE regel tekst, tabellen, headers, voetnoten
2. Identificeer ALLE verschillende vervoersmiddelen (vlucht, trein, bus, ferry)
3. Elk vervoersmiddel is een APART item in de transports array
4. Lees vluchtnummers, treinnummers, vertrektijden EXACT zoals ze staan
5. Voor hotels: neem de EXACTE naam en adres over
6. Voor bestemmingen: gebruik de STAD naam, niet het hotel adres
7. Als je meerdere vluchten/treinen ziet, maak dan MEERDERE transport items

LET OP DUPLICATEN: Als je dezelfde vlucht/trein 2x ziet, neem hem dan maar 1x op!

{
  "title": "Bestemming of reis naam (bijv. 'Barcelona', 'Stedentrip Barcelona')",
  "bookingReference": "Booking/PNR nummer (bijv. 'RRP-10306', '6 letter PNR code')",
  "travelers": [
    {
      "name": "Volledige naam van reiziger",
      "type": "adult of child"
    }
  ],
  "transports": [
    {
      "type": "Type vervoer: 'flight', 'train', 'bus', 'ferry', 'car'",
      "from": "Vertrek stad/station/luchthaven",
      "to": "Aankomst stad/station/luchthaven",
      "date": "Datum in YYYY-MM-DD formaat",
      "time": "Vertrektijd in HH:MM formaat",
      "transportNumber": "Vlucht/trein nummer (bijv. 'KL1234', 'ICE 123')",
      "carrier": "Vervoerder naam (bijv. 'KLM', 'NS International', 'Thalys')",
      "duration": "Reisduur indien beschikbaar (bijv. '2u 15min')",
      "class": "Klasse indien van toepassing (bijv. 'Economy', '2e klas')"
    }
  ],
  "hotel": {
    "name": "Exacte hotel naam",
    "address": "Volledig adres of locatie",
    "checkIn": "Check-in datum YYYY-MM-DD",
    "checkOut": "Check-out datum YYYY-MM-DD",
    "roomType": "Kamer type (bijv. 'Standaard kamer', 'Deluxe')",
    "nights": aantal_nachten_als_nummer,
    "board": "Verblijfstype (bijv. 'Logies & Ontbijt', 'All Inclusive')"
  },
  "price": {
    "total": totaal_bedrag_als_nummer_zonder_valuta_symbool,
    "currency": "Valuta code (EUR, USD, etc.)"
  },
  "dates": {
    "departure": "Vertrekdatum YYYY-MM-DD",
    "return": "Retourdatum YYYY-MM-DD"
  }
}

Als informatie ECHT ontbreekt in de PDF, gebruik dan null. 
Maar probeer ALTIJD eerst de informatie te vinden voordat je null gebruikt.
Geef ALLEEN de JSON terug, geen extra tekst of uitleg.`;

// Upload PDF to Vercel Blob and return URL
async function uploadPDFToBlob(pdfBuffer, filename) {
  try {
    const blob = await put(filename, pdfBuffer, {
      access: 'public',
      addRandomSuffix: true,
    });
    
    console.log(`[UploadPDF] PDF uploaded to:`, blob.url);
    return blob.url;
  } catch (error) {
    console.error('[UploadPDF] Error:', error);
    throw new Error(`PDF upload failed: ${error.message}`);
  }
}

// Extract booking data using GPT-4o with PDF URL
async function extractBookingDataFromPDF(pdfUrl) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // OpenAI can read PDFs directly via URL!
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: VISION_EXTRACTION_PROMPT
        },
        {
          role: 'user',
          content: [
            {
              type: "text",
              text: "Analyseer deze PDF boekingsbevestiging en extraheer alle reisgegevens:"
            },
            {
              type: "image_url",
              image_url: {
                url: pdfUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 4096,
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

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('[BookingParse] Request received:', {
    method: req.method,
    url: req.url,
    contentType: req.headers['content-type']
  });

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    console.log('[BookingParse] OPTIONS request');
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log('[BookingParse] Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[BookingParse] Starting formidable parse...');
    // Parse multipart form data with formidable
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    console.log('[BookingParse] Files received:', Object.keys(files));

    // Get the PDF file
    const pdfFile = files.pdf?.[0] || files.pdf;
    
    if (!pdfFile) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log('[BookingParse] Processing PDF:', {
      filename: pdfFile.originalFilename || pdfFile.name,
      size: pdfFile.size,
      mimetype: pdfFile.mimetype
    });

    // Read the file buffer
    const pdfBuffer = await fs.readFile(pdfFile.filepath);

    console.log('[BookingParse] Uploading PDF to Vercel Blob...');
    
    // Upload PDF to Vercel Blob
    const pdfUrl = await uploadPDFToBlob(pdfBuffer, pdfFile.originalFilename || pdfFile.name || 'booking.pdf');
    
    console.log(`[BookingParse] PDF uploaded, analyzing with GPT-4o...`);

    // Extract structured data with GPT-4o (can read PDFs directly!)
    const bookingData = await extractBookingDataFromPDF(pdfUrl);

    console.log('[BookingParse] Extraction successful:', JSON.stringify(bookingData, null, 2));

    // Clean up temp file
    try {
      await fs.unlink(pdfFile.filepath);
    } catch (e) {
      console.warn('[BookingParse] Could not delete temp file:', e.message);
    }

    return res.status(200).json({
      success: true,
      data: bookingData,
      meta: {
        filename: pdfFile.originalFilename || pdfFile.name,
        pdfUrl: pdfUrl,
        method: 'gpt-4o-pdf-url'
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
