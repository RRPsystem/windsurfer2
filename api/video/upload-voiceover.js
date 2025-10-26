// Vercel Serverless Function: POST /api/video/upload-voiceover
// Upload voice-over audio file (temporary storage for video generation)

const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

// Disable body parser for file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB max
      keepExtensions: true,
      filter: function ({ mimetype }) {
        // Accept audio files only
        return mimetype && mimetype.includes('audio');
      }
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const audioFile = files.voiceover?.[0] || files.audio?.[0];
    
    if (!audioFile) {
      return res.status(400).json({ error: 'Geen audio bestand gevonden' });
    }

    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll return a placeholder URL
    // You'll need to implement actual cloud storage upload here

    console.log('[VoiceoverUpload] File received:', {
      name: audioFile.originalFilename,
      size: audioFile.size,
      type: audioFile.mimetype
    });

    // TODO: Upload to cloud storage and return public URL
    // For development, you could use a service like:
    // - Cloudinary (free tier)
    // - AWS S3
    // - Vercel Blob Storage
    
    return res.status(200).json({
      success: true,
      message: 'Voice-over geüpload (cloud storage nog niet geconfigureerd)',
      filename: audioFile.originalFilename,
      size: audioFile.size,
      // url: 'https://your-cloud-storage.com/voiceover.mp3' // Replace with actual URL
      url: null,
      note: 'Configureer cloud storage (S3/Cloudinary) voor productie gebruik'
    });

  } catch (error) {
    console.error('[VoiceoverUpload] Error:', error);
    return res.status(500).json({ 
      error: 'Upload mislukt', 
      detail: error.message 
    });
  }
}
