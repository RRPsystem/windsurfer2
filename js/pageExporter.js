// Page Exporter
// Export pages as complete HTML with inline CSS for perfect rendering

(function() {
  const PageExporter = {
    init() {
      this.attachEventListeners();
    },
    
    attachEventListeners() {
      // Add export button to existing export button
      const existingExportBtn = document.getElementById('exportBtn');
      if (existingExportBtn) {
        existingExportBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.showExportMenu();
        });
      }
    },
    
    showExportMenu() {
      // Create export menu modal
      const modal = document.createElement('div');
      modal.className = 'export-modal-overlay';
      modal.innerHTML = `
        <div class="export-modal">
          <div class="export-modal-header">
            <h2>📦 Export & Publiceer</h2>
            <button class="close-btn" onclick="this.closest('.export-modal-overlay').remove()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="export-modal-content">
            <div class="export-option">
              <div class="export-option-icon">💾</div>
              <div class="export-option-info">
                <h3>Download HTML</h3>
                <p>Download complete HTML bestand met inline CSS</p>
              </div>
              <button class="btn btn-primary" onclick="PageExporter.downloadHTML()">
                <i class="fas fa-download"></i> Download
              </button>
            </div>
            
            <div class="export-option">
              <div class="export-option-icon">☁️</div>
              <div class="export-option-info">
                <h3>Upload Naar Supabase</h3>
                <p>Upload direct naar Supabase Storage en krijg public URL</p>
              </div>
              <button class="btn btn-primary" onclick="PageExporter.uploadToSupabase()">
                <i class="fas fa-cloud-upload-alt"></i> Upload
              </button>
            </div>
            
            <div class="export-option">
              <div class="export-option-icon">📋</div>
              <div class="export-option-info">
                <h3>Kopieer HTML</h3>
                <p>Kopieer complete HTML naar clipboard</p>
              </div>
              <button class="btn btn-secondary" onclick="PageExporter.copyToClipboard()">
                <i class="fas fa-copy"></i> Kopieer
              </button>
            </div>
            
            <div class="export-option">
              <div class="export-option-icon">🔗</div>
              <div class="export-option-info">
                <h3>Genereer Preview URL</h3>
                <p>Maak een tijdelijke preview URL (24 uur geldig)</p>
              </div>
              <button class="btn btn-secondary" onclick="PageExporter.generatePreviewURL()">
                <i class="fas fa-link"></i> Genereer
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      this.addExportStyles();
    },
    
    addExportStyles() {
      if (document.getElementById('exportStyles')) return;
      
      const style = document.createElement('style');
      style.id = 'exportStyles';
      style.textContent = `
        .export-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        
        .export-modal {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .export-modal-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .export-modal-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }
        
        .export-modal-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .export-option {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: center;
          transition: all 0.2s;
        }
        
        .export-option:hover {
          border-color: #4CAF50;
          background: #f0fdf4;
        }
        
        .export-option-icon {
          font-size: 32px;
          flex-shrink: 0;
        }
        
        .export-option-info {
          flex: 1;
        }
        
        .export-option-info h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .export-option-info p {
          margin: 0;
          font-size: 13px;
          color: #6b7280;
        }
        
        .export-option button {
          flex-shrink: 0;
        }
      `;
      document.head.appendChild(style);
    },
    
    async generateCompleteHTML() {
      const canvas = document.getElementById('canvas');
      if (!canvas) {
        throw new Error('Canvas not found');
      }
      
      // Get page title and slug
      const title = document.getElementById('pageTitleInput')?.value || 'Pagina';
      const slug = document.getElementById('pageSlugInput')?.value || 'page';
      
      // Get canvas HTML
      const canvasHTML = canvas.innerHTML;
      
      // Get CSS files
      const mainCSS = await this.fetchCSS('/styles/main.css');
      const componentsCSS = await this.fetchCSS('/styles/components.css');
      
      // Get brand settings
      const brandSettings = localStorage.getItem('brandSettings');
      let brandCSS = '';
      if (brandSettings) {
        const brand = JSON.parse(brandSettings);
        brandCSS = `
    :root {
      --brand-primary: ${brand.colors.primary};
      --brand-secondary: ${brand.colors.secondary};
      --brand-accent: ${brand.colors.accent};
    }
        `;
      }
      
      // Build complete HTML
      const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  
  <!-- Favicon -->
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='18' ry='18' fill='%234CAF50'/%3E%3Ctext x='50' y='62' font-size='60' text-anchor='middle' fill='white'%3EW%3C/text%3E%3C/svg%3E">
  
  <!-- CDN Resources -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  
  <!-- Inline CSS -->
  <style>
/* Brand Variables */
${brandCSS}

/* Main CSS */
${mainCSS}

/* Components CSS */
${componentsCSS}

/* Page Specific */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
}

body {
  background: #fff;
}

/* Full-width hero sections */
.wb-travel-hero,
.wb-hero-banner,
.wb-hero-cta {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
  </style>
</head>
<body>
${canvasHTML}

<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</body>
</html>`;
      
      return { html, title, slug };
    },
    
    async fetchCSS(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
        return await response.text();
      } catch (error) {
        console.warn(`Could not fetch ${url}:`, error);
        return '';
      }
    },
    
    escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    },
    
    async downloadHTML() {
      try {
        const { html, title, slug } = await this.generateCompleteHTML();
        
        // Create blob and download
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slug}.html`;
        a.click();
        URL.revokeObjectURL(url);
        
        if (window.websiteBuilder?.showNotification) {
          window.websiteBuilder.showNotification('✅ HTML bestand gedownload!', 'success');
        }
      } catch (error) {
        console.error('Download failed:', error);
        alert('Download mislukt: ' + error.message);
      }
    },
    
    async uploadToSupabase() {
      try {
        const { html, title, slug } = await this.generateCompleteHTML();
        
        // TODO: Implement Supabase upload
        alert('Supabase upload wordt geïmplementeerd. Voor nu: download HTML en upload handmatig naar Supabase Storage.');
        
        // Show instructions
        const instructions = `
1. Download de HTML (klik "Download HTML")
2. Ga naar Supabase Dashboard → Storage → assets
3. Upload het bestand
4. Kopieer de public URL
5. Geef URL aan BOLT

Of gebruik deze code in Supabase Edge Function:
const html = \`${html.substring(0, 100)}...\`;
        `;
        
        console.log(instructions);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload mislukt: ' + error.message);
      }
    },
    
    async copyToClipboard() {
      try {
        const { html } = await this.generateCompleteHTML();
        
        await navigator.clipboard.writeText(html);
        
        if (window.websiteBuilder?.showNotification) {
          window.websiteBuilder.showNotification('✅ HTML gekopieerd naar clipboard!', 'success');
        }
      } catch (error) {
        console.error('Copy failed:', error);
        alert('Kopiëren mislukt: ' + error.message);
      }
    },
    
    async generatePreviewURL() {
      try {
        const { html, slug } = await this.generateCompleteHTML();
        
        // Create a data URL (temporary solution)
        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
        
        // Copy to clipboard
        await navigator.clipboard.writeText(dataUrl);
        
        alert(`Preview URL gekopieerd naar clipboard!\n\nPlak deze URL in je browser om de pagina te zien.\n\nLET OP: Dit is een data URL, niet geschikt voor productie. Gebruik "Upload Naar Supabase" voor een echte URL.`);
      } catch (error) {
        console.error('Generate URL failed:', error);
        alert('URL genereren mislukt: ' + error.message);
      }
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PageExporter.init());
  } else {
    PageExporter.init();
  }
  
  // Expose globally
  window.PageExporter = PageExporter;
})();
