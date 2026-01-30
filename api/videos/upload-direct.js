// Vercel Serverless Function: PUT /api/videos/upload-direct
// Direct streaming upload to Vercel Blob - bypasses 4.5MB payload limit
// Client sends video as raw binary body with PUT request

import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // Disable body parser to handle raw stream
  },
  maxDuration: 60,
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Filename, X-Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST = get upload instructions, PUT = actual upload
  if (req.method === 'POST') {
    // Return upload instructions
    return res.status(200).json({
      success: true,
      method: 'PUT',
      endpoint: '/api/videos/upload-direct',
      headers: {
        'Content-Type': 'video/mp4',
        'X-Filename': 'your-filename.mp4'
      },
      body: 'Raw video binary data'
    });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed. Use PUT for upload.' });
  }

  try {
    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[UploadDirect] BLOB_READ_WRITE_TOKEN not configured');
      return res.status(500).json({ 
        error: 'Blob Storage niet geconfigureerd',
        detail: 'Voeg BLOB_READ_WRITE_TOKEN toe aan Vercel environment variables'
      });
    }

    // Get filename from header or generate one
    const filename = req.headers['x-filename'] || `video-${Date.now()}.mp4`;
    const contentType = req.headers['content-type'] || 'video/mp4';
    
    const safeFilename = `videos/${filename.replace(/[^a-z0-9\-\.]/gi, '-')}`;

    console.log('[UploadDirect] Starting streaming upload:', {
      filename: safeFilename,
      contentType
    });

    // Stream the request body directly to Vercel Blob
    // This avoids loading the entire file into memory
    const blob = await put(safeFilename, req, {
      access: 'public',
      contentType: contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log('[UploadDirect] Upload successful:', blob.url);

    return res.status(200).json({
      success: true,
      url: blob.url,
      blobUrl: blob.url,
      filename: safeFilename,
      size: blob.size
    });

  } catch (error) {
    console.error('[UploadDirect] Error:', error);
    return res.status(500).json({ 
      error: 'Upload failed', 
      detail: error.message 
    });
  }
}
