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
      
      // Get canvas HTML and add inline styles to roadbook elements
      let canvasHTML = canvas.innerHTML;
      
      // Add inline styles to roadbook elements to ensure they work in preview
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = canvasHTML;
      
      // Style road line
      const roadLine = tempDiv.querySelector('.roadbook-road-line');
      if (roadLine) {
        roadLine.style.cssText = 'position: absolute !important; left: 50% !important; top: 0 !important; bottom: 0 !important; width: 6px !important; background: #9ca3af !important; transform: translateX(-50%) !important; z-index: 2 !important; pointer-events: none !important; height: 100% !important;';
        console.log('[PageExporter] Added inline styles to road line');
      }
      
      // Style timeline road container
      const timelineRoad = tempDiv.querySelector('.roadbook-timeline-road');
      if (timelineRoad) {
        timelineRoad.style.cssText = 'position: relative !important; max-width: 1400px !important; margin: 0 auto !important; padding: 0 20px 100px !important; min-height: 500px !important;';
        console.log('[PageExporter] Added inline styles to timeline road');
      }
      
      // Style car
      const car = tempDiv.querySelector('.roadbook-timeline-car');
      if (car) {
        car.style.cssText = 'position: absolute !important; left: 50% !important; transform: translateX(-50%) !important; width: 70px !important; height: 100px !important; z-index: 10 !important; filter: drop-shadow(0 6px 20px rgba(0,0,0,0.3)) !important; display: flex !important; align-items: center !important; justify-content: center !important; pointer-events: none !important; transition: top 0.3s ease-out !important; background: transparent !important; will-change: top !important; top: 0 !important;';
        console.log('[PageExporter] Added inline styles to car');
      }
      
      // Style timeline section
      const timelineSection = tempDiv.querySelector('.roadbook-animated-timeline-section');
      if (timelineSection) {
        const primaryColor = localStorage.getItem('brandSettings') ? JSON.parse(localStorage.getItem('brandSettings')).colors?.primary || '#84cc16' : '#84cc16';
        timelineSection.style.cssText = `width: 100% !important; background: linear-gradient(to bottom, ${primaryColor} 300px, #f9fafb 300px) !important; position: relative !important; overflow: visible !important;`;
        console.log('[PageExporter] Added inline styles to timeline section');
      }
      
      // Remove YouTube placeholder divs (edit-mode only)
      const placeholders = tempDiv.querySelectorAll('.hero-video-ph, .wb-media-ph');
      placeholders.forEach(ph => {
        console.log('[PageExporter] Removing YouTube placeholder:', ph.className);
        ph.remove();
      });
      
      // Process roadbook videos (inline to avoid async issues)
      this.processRoadbookVideosSync(tempDiv);
      
      return tempDiv.innerHTML;
    },
    
    processRoadbookVideosSync(tempDiv) {
      // Generate video playlists and YouTube iframes from dataset attributes for roadbook heroes
      const roadbookComponents = tempDiv.querySelectorAll('.wb-roadbook');
      console.log('[PageExporter] Found roadbook components:', roadbookComponents.length);
      roadbookComponents.forEach(component => {
        const videoType = component.dataset.heroVideoType;
        const hero = component.querySelector('.roadbook-hero');
        
        if (!hero) return;
        
        // Handle video playlists
        if (videoType === 'playlist' && component.dataset.heroVideoPlaylist) {
          try {
            console.log('[PageExporter] Found playlist dataset:', component.dataset.heroVideoPlaylist);
            const playlist = JSON.parse(component.dataset.heroVideoPlaylist);
            console.log('[PageExporter] Parsed playlist:', playlist);
            
            if (playlist && playlist.length > 0) {
              // Create video element for playlist
              const video = document.createElement('video');
              video.setAttribute('autoplay', '');
              video.setAttribute('muted', '');
              video.setAttribute('playsinline', '');
              video.autoplay = true;
              video.loop = false;
              video.muted = true;
              video.playsInline = true;
              video.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;';
              
              // Set first video as source
              video.src = playlist[0];
              console.log('[PageExporter] First video URL:', playlist[0]);
              
              // Add playlist logic
              video.dataset.playlist = JSON.stringify(playlist);
              video.dataset.currentIndex = '0';
              
              // Force play after load (for every video in playlist)
              video.addEventListener('loadeddata', function() {
                console.log('[Preview] Video loaded, attempting autoplay...');
                this.play().then(() => {
                  console.log('[Preview] ✅ Autoplay successful');
                }).catch(e => {
                  console.warn('[Preview] ⚠️ Autoplay blocked:', e.message);
                  console.warn('[Preview] User interaction required to start video');
                });
              });
              
              // Add event listener for playlist progression
              video.addEventListener('ended', function() {
                console.log('[Preview] Video ended, playing next...');
                const pl = JSON.parse(this.dataset.playlist);
                let idx = parseInt(this.dataset.currentIndex) + 1;
                if (idx >= pl.length) {
                  console.log('[Preview] Playlist complete, looping back to start');
                  idx = 0;
                }
                console.log('[Preview] Loading video', idx + 1, 'of', pl.length);
                this.src = pl[idx];
                this.dataset.currentIndex = idx.toString();
                // Play will be triggered by loadeddata event
              });
              
              hero.insertBefore(video, hero.firstChild);
              
              // Add inline script to force play after page load
              const script = document.createElement('script');
              script.textContent = `
                (function() {
                  console.log('[Preview Init] Setting up video autoplay...');
                  
                  function tryAutoplay() {
                    const videos = document.querySelectorAll('.roadbook-hero video');
                    videos.forEach(function(video) {
                      if (video.paused) {
                        console.log('[Preview Init] Attempting to play video...');
                        video.play().then(function() {
                          console.log('[Preview Init] ✅ Video playing');
                        }).catch(function(e) {
                          console.warn('[Preview Init] ⚠️ Autoplay failed:', e.message);
                          // Add click-to-play overlay
                          const overlay = document.createElement('div');
                          overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;';
                          overlay.innerHTML = '<div style="background:white;padding:20px 40px;border-radius:8px;font-size:18px;font-weight:600;">▶ Klik om video te starten</div>';
                          overlay.onclick = function() {
                            video.play();
                            overlay.remove();
                          };
                          video.parentElement.appendChild(overlay);
                        });
                      }
                    });
                  }
                  
                  // Try immediately
                  if (document.readyState === 'complete') {
                    tryAutoplay();
                  } else {
                    window.addEventListener('load', tryAutoplay);
                  }
                  
                  // Also try on any user interaction
                  document.addEventListener('click', function() {
                    tryAutoplay();
                  }, { once: true });
                })();
              `;
              tempDiv.appendChild(script);
              
              console.log('[PageExporter] ✅ Generated video playlist for roadbook hero:', playlist.length, 'videos');
            } else {
              console.warn('[PageExporter] Playlist is empty or invalid');
            }
          } catch (e) {
            console.error('[PageExporter] Failed to parse playlist:', e);
            console.error('[PageExporter] Dataset value:', component.dataset.heroVideoPlaylist);
          }
        }
        // Handle YouTube iframes
        else if (videoType === 'youtube') {
          const embedUrl = component.dataset.heroVideoEmbed;
          const videoId = component.dataset.heroVideoId;
          if (embedUrl && videoId) {
            // Create video wrapper
            let videoWrap = hero.querySelector('.hero-video');
            if (!videoWrap) {
              videoWrap = document.createElement('div');
              videoWrap.className = 'hero-video';
              videoWrap.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 0;';
              hero.insertBefore(videoWrap, hero.firstChild);
            }
            
            // Create iframe with proper sizing for cover effect
            const iframe = document.createElement('iframe');
            iframe.setAttribute('title', 'Hero Background Video');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.src = embedUrl;
            
            // Apply fitVideo logic for cover effect
            const heroWidth = 1200; // Default width assumption
            const heroHeight = 400; // From CSS fixed height
            const containerRatio = heroWidth / heroHeight;
            const videoRatio = 16 / 9;
            
            let iframeStyles = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border: none;';
            if (containerRatio < videoRatio) {
              // Container is taller -> match height, expand width
              iframeStyles += ` height: 100%; width: ${Math.ceil(heroHeight * videoRatio)}px;`;
            } else {
              // Container is wider -> match width, expand height
              iframeStyles += ` width: 100%; height: ${Math.ceil(heroWidth / videoRatio)}px;`;
            }
            iframe.style.cssText = iframeStyles;
            
            videoWrap.innerHTML = '';
            videoWrap.appendChild(iframe);
            console.log('[PageExporter] Generated YouTube iframe for roadbook hero:', embedUrl);
          }
        }
      });
      
      // Ensure YouTube iframes have autoplay in preview
      const youtubeIframes = tempDiv.querySelectorAll('.hero-video iframe, .roadbook-hero iframe');
      youtubeIframes.forEach(iframe => {
        const src = iframe.getAttribute('src');
        if (src && src.includes('youtube.com/embed')) {
          try {
            const url = new URL(src);
            // Ensure autoplay parameters are set for preview
            if (!url.searchParams.has('autoplay')) url.searchParams.set('autoplay', '1');
            if (!url.searchParams.has('mute')) url.searchParams.set('mute', '1');
            if (!url.searchParams.has('loop')) url.searchParams.set('loop', '1');
            if (!url.searchParams.has('controls')) url.searchParams.set('controls', '0');
            if (!url.searchParams.has('playsinline')) url.searchParams.set('playsinline', '1');
            iframe.setAttribute('src', url.toString());
            console.log('[PageExporter] Updated YouTube iframe with autoplay:', url.toString());
          } catch (e) {
            console.warn('[PageExporter] Could not parse YouTube URL:', src);
          }
        }
      });
    },
    
    async exportFullHTML() {
      // Get CSS files
      const mainCSS = await this.fetchCSS('/styles/main.css');
      const componentsCSS = await this.fetchCSS('/styles/components.css');
      
      // Try to fetch roadbook CSS, but don't fail if it doesn't exist
      let roadbookCSS = '';
      try {
        roadbookCSS = await this.fetchCSS('/styles/roadbook-timeline.css');
      } catch (e) {
        console.warn('[PageExporter] Could not load roadbook-timeline.css, using inline styles');
      }
      
      // Get brand settings
      const brandSettings = localStorage.getItem('brandSettings');
      let brandCSS = '';
      let brandLogoHTML = '';
      console.log('[PageExporter] Brand settings:', brandSettings);
      if (brandSettings) {
        const brand = JSON.parse(brandSettings);
        console.log('[PageExporter] Parsed brand:', brand);
        console.log('[PageExporter] Brand colors:', brand.colors);
        
        const primaryColor = (brand.colors && brand.colors.primary) || brand.primaryColor || '#84cc16';
        const secondaryColor = (brand.colors && brand.colors.secondary) || brand.secondaryColor || '#2196F3';
        const accentColor = (brand.colors && brand.colors.accent) || brand.accentColor || '#FF9800';
        
        console.log('[PageExporter] Using colors:', { primaryColor, secondaryColor, accentColor });
        
        brandCSS = `
          :root {
            --brand-primary: ${primaryColor};
            --brand-secondary: ${secondaryColor};
            --brand-accent: ${accentColor};
          }
          
          /* Apply brand colors to roadbook elements */
          .roadbook-intro-underline,
          .roadbook-stat-icon,
          .roadbook-card-badge,
          .roadbook-highlight-icon,
          .roadbook-hotel-bar i {
            background: ${primaryColor} !important;
            color: white !important;
          }
          
          .roadbook-day-item.active .roadbook-day-badge {
            background: ${primaryColor} !important;
            border-color: ${primaryColor} !important;
            color: white !important;
          }
          
          .roadbook-intro-subtitle,
          .roadbook-day-distance,
          .roadbook-read-more {
            color: ${primaryColor} !important;
          }
          
          .roadbook-nav-menu a:hover {
            color: ${primaryColor} !important;
          }
          
          .roadbook-animated-timeline-section {
            background: linear-gradient(to bottom, ${primaryColor} 180px, #f9fafb 180px) !important;
          }
        `;
        
        // Add logo replacement script
        if (brand.logo) {
          brandLogoHTML = `
            <script>
              // Replace logo in roadbook navigation
              document.addEventListener('DOMContentLoaded', function() {
                const logoImg = document.querySelector('.roadbook-nav-logo img');
                if (logoImg) {
                  logoImg.src = '${brand.logo.replace(/'/g, "\\'")}';
                }
              });
            </script>
          `;
        }
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

/* Roadbook Timeline CSS */
${roadbookCSS}

/* Critical Roadbook Inline Styles */
.roadbook-animated-timeline-section {
    width: 100% !important;
    background: linear-gradient(to bottom, var(--brand-primary, #84cc16) 300px, #f9fafb 300px) !important;
    position: relative !important;
    overflow: visible !important;
}

.roadbook-timeline-road {
    position: relative !important;
    max-width: 1400px !important;
    margin: 0 auto !important;
    padding: 0 20px 100px !important;
    min-height: 500px !important;
}

.roadbook-road-line {
    position: absolute !important;
    left: 50% !important;
    top: 0 !important;
    bottom: 0 !important;
    width: 6px !important;
    background: #9ca3af !important;
    transform: translateX(-50%) !important;
    z-index: 2 !important;
    pointer-events: none !important;
    height: 100% !important;
}

.roadbook-road-line::before {
    content: '' !important;
    position: absolute !important;
    left: 50% !important;
    top: 0 !important;
    width: 2px !important;
    height: 100% !important;
    background: white !important;
    transform: translateX(-50%) !important;
    background-image: repeating-linear-gradient(to bottom, white 0px, white 20px, transparent 20px, transparent 40px) !important;
}

.roadbook-timeline-car {
    position: absolute !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: 70px !important;
    height: 100px !important;
    z-index: 10 !important;
    filter: drop-shadow(0 6px 20px rgba(0,0,0,0.3)) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    pointer-events: none !important;
    transition: top 0.3s ease-out !important;
    background: transparent !important;
    will-change: top !important;
    top: 0 !important;
}

.roadbook-timeline-car img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
}

.roadbook-start-badge {
    position: absolute !important;
    left: 50% !important;
    top: -30px !important;
    transform: translateX(-50%) !important;
    background: #4b5563 !important;
    color: white !important;
    padding: 8px 20px !important;
    border-radius: 20px !important;
    font-weight: 600 !important;
    font-size: 0.9rem !important;
    z-index: 5 !important;
}

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

${brandLogoHTML}

<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Roadbook Timeline Animation -->
<script>
// Roadbook Timeline Animation for Preview
class RoadbookTimelineAnimation {
    constructor(container) {
        this.container = container;
        this.car = container.querySelector('.roadbook-timeline-car');
        this.roadContainer = container.querySelector('.roadbook-road-line');
        this.dayItems = container.querySelectorAll('.roadbook-day-item');
        this.isAnimating = false;
        
        console.log('[Timeline Preview] Initializing...', {
            container: !!this.container,
            car: !!this.car,
            roadContainer: !!this.roadContainer,
            dayItemsCount: this.dayItems.length
        });
        
        if (!this.car || !this.roadContainer || this.dayItems.length === 0) {
            console.warn('[Timeline Preview] Missing required elements:', {
                car: !!this.car,
                roadContainer: !!this.roadContainer,
                dayItems: this.dayItems.length
            });
            return;
        }
        
        console.log('[Timeline Preview] All elements found, initializing animation');
        this.init();
    }
    
    init() {
        const scrollHandler = () => this.onScroll();
        window.addEventListener('scroll', scrollHandler, { passive: true });
        window.addEventListener('resize', scrollHandler, { passive: true });
        
        setTimeout(() => {
            this.updateCarPosition();
            this.onScroll();
        }, 100);
        
        setInterval(() => {
            if (this.isVisible()) {
                this.updateCarPosition();
            }
        }, 100);
    }
    
    onScroll() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        requestAnimationFrame(() => {
            this.updateCarPosition();
            this.updateActiveDays();
            this.isAnimating = false;
        });
    }
    
    updateCarPosition() {
        if (!this.car || !this.roadContainer) return;
        
        const containerRect = this.roadContainer.getBoundingClientRect();
        const viewportMiddle = window.innerHeight / 2;
        const relativePosition = viewportMiddle - containerRect.top;
        const clampedPosition = Math.max(0, Math.min(relativePosition, containerRect.height));
        
        this.car.style.top = clampedPosition + 'px';
        
        // Debug logging (only log occasionally to avoid spam)
        if (Math.random() < 0.01) {
            console.log('[Timeline Preview] Car position updated:', {
                top: clampedPosition,
                containerHeight: containerRect.height,
                viewportMiddle: viewportMiddle,
                containerTop: containerRect.top
            });
        }
    }
    
    updateActiveDays() {
        const viewportMiddle = window.innerHeight / 2;
        
        this.dayItems.forEach(day => {
            const badge = day.querySelector('.roadbook-day-badge');
            if (!badge) return;
            
            const rect = badge.getBoundingClientRect();
            const badgeMiddle = rect.top + rect.height / 2;
            
            if (Math.abs(badgeMiddle - viewportMiddle) < 100) {
                day.classList.add('active');
            } else {
                day.classList.remove('active');
            }
        });
    }
    
    isVisible() {
        if (!this.container) return false;
        const rect = this.container.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    const timelines = document.querySelectorAll('.roadbook-animated-timeline-section');
    timelines.forEach(timeline => {
        new RoadbookTimelineAnimation(timeline);
    });
});
</script>
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
