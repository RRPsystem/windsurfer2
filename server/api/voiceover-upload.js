// Server-side handler for voice-over upload
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/voiceovers');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'voiceover-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: function (req, file, cb) {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Alleen audio bestanden zijn toegestaan'));
    }
  }
});

module.exports = function(req, res) {
  const uploadSingle = upload.single('voiceover');
  
  uploadSingle(req, res, function(err) {
    if (err) {
      console.error('[VoiceoverUpload] Error:', err);
      return res.status(400).json({ 
        error: 'Upload mislukt', 
        detail: err.message 
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Geen bestand gevonden' });
    }

    console.log('[VoiceoverUpload] File uploaded:', {
      name: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });

    // Return local URL for development
    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    const localUrl = `/uploads/voiceovers/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Voice-over geüpload',
      filename: req.file.originalname,
      size: req.file.size,
      url: localUrl,
      note: 'Voor productie: upload naar cloud storage (S3/Cloudinary)'
    });
  });
};
