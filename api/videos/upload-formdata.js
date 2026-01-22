// Vercel Serverless Function: POST /api/videos/upload-formdata
// Upload generated video to Vercel Blob Storage using FormData (for large files)

import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for FormData
  },
  maxDuration: 60,
};

// Parse multipart form data manually
async function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';
      const boundary = contentType.split('boundary=')[1];
      
      if (!boundary) {
        reject(new Error('No boundary found in content-type'));
        return;
      }
      
      const parts = buffer.toString('binary').split('--' + boundary);
      const result = { fields: {}, files: {} };
      
      for (const part of parts) {
        if (part.includes('Content-Disposition')) {
          const nameMatch = part.match(/name="([^"]+)"/);
          const filenameMatch = part.match(/filename="([^"]+)"/);
          
          if (nameMatch) {
            const name = nameMatch[1];
            // Find the content after the headers (double newline)
            const contentStart = part.indexOf('\r\n\r\n');
            if (contentStart !== -1) {
              let content = part.substring(contentStart + 4);
              // Remove trailing \r\n--
              content = content.replace(/\r\n--$/, '').replace(/\r\n$/, '');
              
              if (filenameMatch) {
                // It's a file
                result.files[name] = {
                  filename: filenameMatch[1],
                  data: Buffer.from(content, 'binary'),
                };
              } else {
                // It's a field
                result.fields[name] = content.trim();
              }
            }
          }
        }
      }
      
      resolve(result);
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[VideoUpload] BLOB_READ_WRITE_TOKEN not configured');
      return res.status(500).json({ 
        error: 'Blob Storage niet geconfigureerd',
        detail: 'Voeg BLOB_READ_WRITE_TOKEN toe aan Vercel environment variables'
      });
    }

    // Parse the FormData
    const formData = await parseFormData(req);
    const { fields, files } = formData;
    
    const videoFile = files.video;
    if (!videoFile) {
      return res.status(400).json({ error: 'Geen video bestand ontvangen' });
    }

    const title = fields.title || 'Untitled Video';
    const type = fields.type || 'generated';
    const duration = parseFloat(fields.duration) || 0;
    const width = parseInt(fields.width) || 1920;
    const height = parseInt(fields.height) || 1080;

    // Generate unique filename
    const timestamp = Date.now();
    const safeTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `videos/${timestamp}-${safeTitle}.mp4`;

    console.log('[VideoUpload] Uploading to Blob Storage:', {
      filename,
      size: videoFile.data.length,
      title
    });

    // Upload to Vercel Blob Storage
    const blob = await put(filename, videoFile.data, {
      access: 'public',
      contentType: 'video/mp4',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Build response
    const videoMetadata = {
      id: `vid_${timestamp}`,
      title: title,
      type: type,
      url: blob.url,
      videoUrl: blob.url,
      thumbnail: null,
      duration: duration,
      width: width,
      height: height,
      size: videoFile.data.length,
      createdAt: new Date().toISOString(),
    };

    console.log('[VideoUpload] Upload successful:', videoMetadata.id, blob.url);

    return res.status(200).json({
      success: true,
      video: videoMetadata,
      url: blob.url,
      size: videoFile.data.length,
    });

  } catch (error) {
    console.error('[VideoUpload] Error:', error);
    
    return res.status(500).json({ 
      error: 'Upload mislukt', 
      detail: error.message 
    });
  }
}
