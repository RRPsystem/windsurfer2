// Inline CSS Generator
// Generates HTML with inline CSS for BOLT previews

import fs from 'fs';
import path from 'path';

/**
 * Reads CSS files and returns combined CSS string
 */
function getCombinedCSS() {
  const mainCSS = fs.readFileSync(path.join(process.cwd(), 'styles/main.css'), 'utf8');
  const componentsCSS = fs.readFileSync(path.join(process.cwd(), 'styles/components.css'), 'utf8');
  
  return mainCSS + '\n\n' + componentsCSS;
}

/**
 * Wraps page HTML with full document structure including inline CSS
 */
function wrapWithInlineCSS(contentHTML, pageTitle = 'Pagina', pageDescription = '') {
  const css = getCombinedCSS();
  
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(pageDescription)}">
  <title>${escapeHtml(pageTitle)}</title>
  
  <!-- Favicon -->
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='18' ry='18' fill='%234CAF50'/%3E%3Ctext x='50' y='62' font-size='60' text-anchor='middle' fill='white'%3EW%3C/text%3E%3C/svg%3E">
  
  <!-- CDN Resources -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  
  <!-- Inline CSS -->
  <style>
${css}
  </style>
</head>
<body>
${contentHTML}

<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</body>
</html>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Process a page object and return HTML with inline CSS
 */
export function generatePageHTML(page) {
  return wrapWithInlineCSS(
    page.html || page.content || '',
    page.title || 'Pagina',
    page.description || ''
  );
}

/**
 * CLI usage
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const testHTML = '<h1>Test Pagina</h1><p>Dit is een test.</p>';
  const result = wrapWithInlineCSS(testHTML, 'Test Pagina');
  console.log(result);
}

export { wrapWithInlineCSS, getCombinedCSS };
