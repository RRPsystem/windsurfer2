// api/booking-parse.js
// Vercel Serverless Function for PDF parsing

const { formidable } = require('formidable');
const fs = require('fs').promises;
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const { createCanvas } = require('canvas');

const VISION_EXTRACTION_PROMPT = `Je bent een expert in het analyseren van reisboekingsbevestigingen.

Analyseer deze PDF pagina's en extraheer ALLE reisgegevens die je ziet.
Kijk naar tabellen, headers, kleine tekst, voetnoten - ALLES.

BELANGRIJK: 
- Lees ALLE tekst op de pagina, ook kleine lettertjes
- Herken tabellen en extracteer data uit kolommen
- Zoek naar vluchtnummers, treinnummers, tijden, data
- Let op verschillende transport types (vlucht, trein, bus, etc)
- Vind hotel namen, adressen, check-in/out data

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

// Convert PDF to images
async function pdfToImages(pdfBuffer) {
  const images = [];
  
  try {
    // Load PDF
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      useSystemFonts: true
    });
    
    const pdf = await loadingTask.promise;
    console.log(`[PDFToImages] PDF loaded, ${pdf.numPages} pages`);
    
    // Convert each page to image (max 5 pages to save costs)
    const maxPages = Math.min(pdf.numPages, 5);
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
      
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Convert to base64
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
      images.push(imageBase64);
      
      console.log(`[PDFToImages] Page ${pageNum} converted`);
    }
    
    return images;
  } catch (error) {
    console.error('[PDFToImages] Error:', error);
    throw new Error(`PDF to image conversion failed: ${error.message}`);
  }
}

// Extract booking data using GPT-4o Vision
async function extractBookingDataWithVision(images) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // Build messages with images
  const imageMessages = images.map((base64, idx) => ({
    type: "image_url",
    image_url: {
      url: `data:image/jpeg;base64,${base64}`,
      detail: "high" // High detail for better text recognition
    }
  }));

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
              text: "Analyseer deze boekingsbevestiging en extraheer alle reisgegevens:"
            },
            ...imageMessages
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
    throw new Error(`OpenAI Vision API error: ${error}`);
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

    console.log('[BookingParse] Converting PDF to images...');
    
    // Convert PDF pages to images
    const images = await pdfToImages(pdfBuffer);
    
    console.log(`[BookingParse] Converted ${images.length} pages to images`);

    // Extract structured data with GPT-4o Vision
    console.log('[BookingParse] Analyzing with GPT-4o Vision...');
    const bookingData = await extractBookingDataWithVision(images);

    console.log('[BookingParse] Vision extraction successful:', JSON.stringify(bookingData, null, 2));

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
        pages: images.length,
        method: 'gpt-4o-vision'
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
