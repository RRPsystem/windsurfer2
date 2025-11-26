// Simple API route to serve the template checklist HTML
// URL: /api/checklist

import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // Read the HTML file
  const htmlPath = path.join(process.cwd(), 'public', 'checklist-new-template.html');
  
  try {
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    // Serve as HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.status(200).send(html);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to load checklist',
      message: error.message 
    });
  }
}
