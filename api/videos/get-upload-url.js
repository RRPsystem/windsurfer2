// Vercel Serverless Function: POST /api/videos/get-upload-url
// Generate a client token for direct upload to Vercel Blob Storage
// This bypasses the 4.5MB serverless function payload limit

import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('[GetUploadUrl] BLOB_READ_WRITE_TOKEN not configured');
      return res.status(500).json({ 
        error: 'Blob Storage niet geconfigureerd',
        detail: 'Voeg BLOB_READ_WRITE_TOKEN toe aan Vercel environment variables'
      });
    }

    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // Validate the upload - you can add authentication here
        console.log('[GetUploadUrl] Generating token for:', pathname);
        return {
          allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png'],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB max
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Called after upload is complete
        console.log('[GetUploadUrl] Upload completed:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);

  } catch (error) {
    console.error('[GetUploadUrl] Error:', error);
    return res.status(400).json({ 
      error: error.message 
    });
  }
}
