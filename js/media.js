// Simple Media Picker Modal
// Provides: MediaPicker.openImage(), MediaPicker.openVideo()
// Optional: window.MEDIA_CONFIG = { unsplashKey: '' }

class MediaPicker {
  static openImage(options = {}) {
    return this._open({ type: 'image', ...options });
  }

  static openVideo(options = {}) {
    return this._open({ type: 'video', ...options });
  }

  static _open({ type = 'image', defaultTab, searchQuery } = {}) {
    return new Promise((resolve, reject) => {
      // Overlay
      const overlay = document.createElement('div');
      overlay.className = 'mp-overlay';
      // Drawer
      const drawer = document.createElement('div');
      drawer.className = 'mp-drawer';

      // Header
      const header = document.createElement('div');
      header.className = 'mp-header';
      header.innerHTML = `
        <h3>Media Selector</h3>
        <button class="mp-close"><i class="fas fa-times"></i></button>
      `;

      // Body with tabs
      const body = document.createElement('div');
      body.className = 'mp-body';
      body.innerHTML = `
        <div class="media-tabs">
          <button class="btn btn-secondary tab-btn active" data-tab="upload"><i class="fas fa-upload"></i> Upload</button>
          <button class="btn btn-secondary tab-btn" data-tab="unsplash"><i class="fab fa-unsplash"></i> Unsplash</button>
          <button class="btn btn-secondary tab-btn" data-tab="pexels"><i class="fas fa-video"></i> Pexels</button>
          <button class="btn btn-secondary tab-btn" data-tab="youtube"><i class="fab fa-youtube"></i> YouTube</button>
          <button class="btn btn-secondary tab-btn" data-tab="my-videos"><i class="fas fa-film"></i> Mijn Video's</button>
        </div>

        <div class="tab-content" data-tab="upload">
          <input type="file" class="form-control" accept="${type === 'image' ? 'image/*' : 'video/*'}" />
          <p class="mp-help">Kies een bestand van je computer.</p>
        </div>

        <div class="tab-content" data-tab="unsplash" style="display:none;">
          <div class="mp-row">
            <input type="text" class="form-control unsplash-query" placeholder="Zoekterm (bv. mountains, beach)" />
            <button class="btn btn-primary btn-lg unsplash-search"><i class="fas fa-search"></i></button>
          </div>
          <div class="unsplash-grid"></div>
          <div class="mp-row mp-between mp-more-row">
            <p class="unsplash-note"></p>
            <button class="btn btn-primary btn-lg unsplash-more" disabled>Laad meer afbeeldingen</button>
          </div>
        </div>

        <div class="tab-content" data-tab="pexels" style="display:none;">
          <div class="mp-row">
            <input type="text" class="form-control pexels-query" placeholder="Zoek video's (bv. Paris travel, beach sunset)" />
            <button class="btn btn-primary btn-lg pexels-search"><i class="fas fa-search"></i></button>
          </div>
          <div class="pexels-grid"></div>
          <div class="mp-row mp-between mp-more-row">
            <p class="pexels-note"></p>
            <button class="btn btn-primary btn-lg pexels-more" disabled>Laad meer video's</button>
          </div>
        </div>

        <div class="tab-content" data-tab="youtube" style="display:none;">
          <div class="mp-row">
            <input type="text" class="form-control yt-query" placeholder="Zoek op YouTube (bv. travel vlog)" />
            <button class="btn btn-primary btn-lg yt-search"><i class="fas fa-search"></i></button>
            <div style="flex:1"></div>
            <label style="font-size:12px;color:#555;">Start (s)</label>
            <input type="number" class="form-control yt-start" value="0" min="0" step="1" style="width:80px;" />
          </div>
          <div class="yt-grid"></div>
          <div class="mp-row mp-between mp-more-row">
            <p class="yt-note"></p>
            <button class="btn btn-primary btn-lg yt-more" disabled>Laad meer video’s</button>
          </div>
          <div class="mp-help">Geen API key? Plak een URL hieronder:</div>
          <div class="mp-row">
            <input type="text" class="form-control yt-url" placeholder="Plak YouTube URL (https://youtu.be/...)" />
            <button class="btn btn-secondary yt-use">Gebruik URL</button>
          </div>
        </div>

        <div class="tab-content" data-tab="my-videos" style="display:none;">
          <div class="mp-row mp-between">
            <p class="my-videos-note">Jouw gegenereerde video's</p>
            <button class="btn btn-primary btn-lg my-videos-refresh"><i class="fas fa-sync-alt"></i> Ververs</button>
          </div>
          <div class="my-videos-grid"></div>
          <div class="my-videos-empty" style="display:none; text-align:center; padding:40px; color:#666;">
            <i class="fas fa-film" style="font-size:48px; margin-bottom:16px; opacity:0.3;"></i>
            <p>Nog geen video's gegenereerd</p>
            <p style="font-size:14px;">Gebruik de Video Generator om je eerste video te maken!</p>
          </div>
        </div>
      `;

      drawer.appendChild(header);
      drawer.appendChild(body);
      document.body.appendChild(overlay);
      document.body.appendChild(drawer);

      // Animate in
      requestAnimationFrame(() => {
        overlay.classList.add('open');
        drawer.classList.add('open');
      });

      const close = (e) => {
        if (e) e.stopPropagation();
        overlay.classList.remove('open');
        drawer.classList.remove('open');
        setTimeout(() => {
          try {
            if (overlay && overlay.parentNode) document.body.removeChild(overlay);
            if (drawer && drawer.parentNode) document.body.removeChild(drawer);
          } catch (err) {
            console.warn('Media Picker close error:', err);
          }
        }, 200);
        resolve(null); // Resolve with null when closed
      };
      
      const closeBtn = header.querySelector('.mp-close');
      if (closeBtn) {
        closeBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          close(e);
        };
      }
      
      overlay.onclick = (e) => {
        if (e.target === overlay) close(e);
      };

      // Tabs behavior
      const tabs = Array.from(body.querySelectorAll('.tab-btn'));
      const panes = Array.from(body.querySelectorAll('.tab-content'));
      const setTab = (name) => {
        tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === name));
        panes.forEach(p => p.style.display = (p.getAttribute('data-tab') === name ? '' : 'none'));
      };
      tabs.forEach(btn => btn.addEventListener('click', () => setTab(btn.getAttribute('data-tab'))));

      // Upload
      const uploadPane = body.querySelector('.tab-content[data-tab="upload"] input[type="file"]');
      if (uploadPane) uploadPane.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          resolve({ source: 'upload', type, dataUrl: ev.target.result, file });
          close();
        };
        reader.readAsDataURL(file);
      });

      // (No separate URL tab anymore)

      // Unsplash (if key present)
      if (true) {
        const unsplashPane = body.querySelector('.tab-content[data-tab="unsplash"]');
        const noteEl = unsplashPane ? unsplashPane.querySelector('.unsplash-note') : null;
        const moreBtn = unsplashPane ? unsplashPane.querySelector('.unsplash-more') : null;
        const key = (window.MEDIA_CONFIG && (window.MEDIA_CONFIG.unsplashAccessKey || window.MEDIA_CONFIG.unsplashKey))
          ? (window.MEDIA_CONFIG.unsplashAccessKey || window.MEDIA_CONFIG.unsplashKey)
          : '';
        if (!key) {
          if (noteEl) noteEl.textContent = 'Tip: voeg een Unsplash Access Key toe in js/config.local.js als window.MEDIA_CONFIG.unsplashAccessKey (of unsplashKey) om hier te zoeken.';
        }
        let currentPage = 1;
        let currentQuery = '';
        const runSearch = async (append = false) => {
          const qInput = unsplashPane ? unsplashPane.querySelector('.unsplash-query') : null;
          const q = (qInput && qInput.value ? qInput.value.trim() : '') || 'travel';
          const grid = unsplashPane ? unsplashPane.querySelector('.unsplash-grid') : null;
          if (!append) {
            if (grid) grid.innerHTML = '<div style="color:#666;">Zoeken...</div>';
            currentPage = 1;
            currentQuery = q;
          }
          try {
            if (!key) {
              const demo = [
                'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop'
              ];
              if (grid) grid.innerHTML = '';
              demo.forEach(url => {
                const img = document.createElement('img');
                img.src = url;
                img.className = 'mp-thumb';
                img.onclick = () => { resolve({ source: 'unsplash-demo', type: 'image', url }); close(); };
                if (grid) grid.appendChild(img);
              });
              if (moreBtn) moreBtn.disabled = true;
              return;
            }
            // Add better filters for hero/background images - focus on landmarks and highlights
            const enhancedQuery = `${q} landmark highlights iconic famous tourist attraction`;
            const resp = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(enhancedQuery)}&per_page=12&page=${currentPage}&orientation=landscape&order_by=relevant&content_filter=high` , {
              headers: { Authorization: `Client-ID ${key}` }
            });
            const data = await resp.json();
            if (!append && grid) grid.innerHTML = '';
            (data.results || []).forEach(item => {
              const urls = item.urls || {};
              const small = urls.small || urls.thumb || urls.regular;
              const regular = urls.regular || small;
              const full = urls.full || urls.raw || regular;
              const url = small;
              const img = document.createElement('img');
              img.src = url;
              img.className = 'mp-thumb';
              img.title = item.alt_description || '';
              const user = item.user || {};
              const links = item.links || {};
              img.onclick = () => { resolve({ source: 'unsplash', type: 'image', url, smallUrl: small, regularUrl: regular, fullUrl: full, credit: user.name || '', link: links.html || '' }); close(); };
              if (grid) grid.appendChild(img);
            });
            const totalPages = data.total_pages || 0;
            if (moreBtn) moreBtn.disabled = !(currentPage < totalPages);
          } catch (err) {
            if (grid) grid.innerHTML = '<div style="color:#c00;">Unsplash fout. Probeer later opnieuw.</div>';
            if (moreBtn) moreBtn.disabled = true;
          }
        };
        const unsplashSearchBtn = unsplashPane ? unsplashPane.querySelector('.unsplash-search') : null;
        if (unsplashSearchBtn) unsplashSearchBtn.addEventListener('click', () => runSearch(false));
        if (moreBtn) moreBtn.addEventListener('click', () => { currentPage += 1; runSearch(true); });
        // Auto-focus search input when tab opens and run default search
        const unsplashTabBtn = tabs.find(b => b.getAttribute('data-tab')==='unsplash');
        if (unsplashTabBtn) unsplashTabBtn.addEventListener('click', () => {
          setTimeout(() => {
            const uqi = unsplashPane ? unsplashPane.querySelector('.unsplash-query') : null;
            if (uqi) {
              uqi.focus();
              // Run default search if grid is empty
              if (grid && grid.children.length === 0) {
                runSearch(false);
              }
            }
          }, 0);
        });
        
        // Run default search if Unsplash is the default tab
        if (defaultTab === 'unsplash') {
          setTimeout(() => runSearch(false), 100);
        }
      }

      // Pexels Videos
      if (true) {
        const pexelsPane = body.querySelector('.tab-content[data-tab="pexels"]');
        const noteEl = pexelsPane ? pexelsPane.querySelector('.pexels-note') : null;
        const grid = pexelsPane ? pexelsPane.querySelector('.pexels-grid') : null;
        const moreBtnPexels = pexelsPane ? pexelsPane.querySelector('.pexels-more') : null;
        const key = (window.MEDIA_CONFIG && window.MEDIA_CONFIG.pexelsKey)
          ? window.MEDIA_CONFIG.pexelsKey
          : '';

        let currentPage = 1;
        let currentQuery = '';

        const runPexelsSearch = async (append = false) => {
          const qInput = pexelsPane ? pexelsPane.querySelector('.pexels-query') : null;
          const q = (qInput && qInput.value ? qInput.value.trim() : '') || 'travel';
          if (!append) {
            if (grid) grid.innerHTML = '<div style="color:#666;">Zoeken...</div>';
            currentPage = 1;
            currentQuery = q;
          }
          if (!key) {
            if (noteEl) noteEl.textContent = 'Tip: voeg window.MEDIA_CONFIG.pexelsKey toe voor Pexels video\'s (gratis op pexels.com/api).';
            if (grid) grid.innerHTML = '<div style="color:#666;">Geen API key: voeg PEXELS_API_KEY toe.</div>';
            if (moreBtnPexels) moreBtnPexels.style.display = 'none';
            return;
          }
          try {
            const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=12&page=${currentPage}&orientation=landscape`;
            const resp = await fetch(url, {
              headers: { 'Authorization': key }
            });
            const data = await resp.json();
            if (!append && grid) grid.innerHTML = '';
            
            // Render as 2-column thumbnail grid
            if (grid) {
              grid.style.display = 'grid';
              grid.style.gridTemplateColumns = '1fr 1fr';
              grid.style.gap = '10px';
            }
            
            (data.videos || []).forEach(video => {
              const videoFiles = video.video_files || [];
              const hdFile = videoFiles.find(f => f.quality === 'hd' && f.width >= 1280) || videoFiles[0];
              // Find a smaller preview file for hover
              const previewFile = videoFiles.find(f => (f.quality === 'sd' || f.width <= 640) && f.file_type === 'video/mp4') || 
                                  videoFiles.find(f => f.file_type === 'video/mp4') || 
                                  hdFile;
              if (!hdFile) return;
              
              const tile = document.createElement('div');
              tile.style.cssText = 'border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; background:#f8f9fa; cursor:pointer; position:relative; transition: transform 0.2s, box-shadow 0.2s;';
              
              // Thumbnail image (shown by default)
              const thumbnail = document.createElement('img');
              thumbnail.src = video.image;
              thumbnail.alt = '';
              thumbnail.style.cssText = 'width:100%;height:140px;object-fit:cover;display:block;';
              
              // Video preview (hidden by default, shown on hover)
              const videoPreview = document.createElement('video');
              videoPreview.preload = 'metadata'; // Preload metadata for faster start
              videoPreview.loop = true;
              videoPreview.muted = true;
              videoPreview.playsInline = true;
              videoPreview.setAttribute('crossorigin', 'anonymous');
              videoPreview.style.cssText = 'width:100%;height:140px;object-fit:cover;display:none;position:absolute;top:0;left:0;';
              
              // Duration badge
              const badge = document.createElement('div');
              badge.style.cssText = 'position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.7); color:white; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:600; z-index:2;';
              badge.innerHTML = `<i class="fas fa-play"></i> ${Math.floor(video.duration)}s`;
              
              // Play icon overlay (shows video is playable)
              const playIcon = document.createElement('div');
              playIcon.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:48px; height:48px; background:rgba(0,0,0,0.6); border-radius:50%; display:flex; align-items:center; justify-content:center; pointer-events:none; transition: opacity 0.2s;';
              playIcon.innerHTML = '<i class="fas fa-play" style="color:white; font-size:20px; margin-left:3px;"></i>';
              
              // Hover effect overlay
              const hoverOverlay = document.createElement('div');
              hoverOverlay.style.cssText = 'position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(102,126,234,0.1); opacity:0; transition: opacity 0.2s; pointer-events:none;';
              
              // Video info on hover
              const videoInfo = document.createElement('div');
              videoInfo.style.cssText = 'position:absolute; bottom:8px; left:8px; right:8px; background:rgba(0,0,0,0.8); color:white; padding:6px 8px; border-radius:4px; font-size:11px; opacity:0; transition: opacity 0.2s; z-index:3;';
              videoInfo.textContent = `${video.width || '?'}x${video.height || '?'} • ${Math.floor(video.duration)}s`;
              if (video.user && video.user.name) {
                videoInfo.textContent += ` • ${video.user.name}`;
              }
              
              tile.appendChild(thumbnail);
              tile.appendChild(videoPreview);
              tile.appendChild(hoverOverlay);
              tile.appendChild(badge);
              tile.appendChild(playIcon);
              tile.appendChild(videoInfo);
              
              let isVideoLoaded = false;
              let hoverTimeout = null;
              
              // Preload video on first hover
              tile.addEventListener('mouseenter', () => {
                tile.style.transform = 'scale(1.02)';
                tile.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                hoverOverlay.style.opacity = '1';
                videoInfo.style.opacity = '1';
                playIcon.style.opacity = '0';
                
                // Load and play video
                if (!isVideoLoaded) {
                  videoPreview.src = previewFile.link;
                  isVideoLoaded = true;
                }
                
                // Small delay to ensure video is ready
                hoverTimeout = setTimeout(() => {
                  thumbnail.style.display = 'none';
                  videoPreview.style.display = 'block';
                  
                  const playPromise = videoPreview.play();
                  if (playPromise !== undefined) {
                    playPromise.catch(e => {
                      console.warn('Video preview play failed:', e);
                      // Fallback: show thumbnail with play icon
                      thumbnail.style.display = 'block';
                      videoPreview.style.display = 'none';
                      playIcon.style.opacity = '1';
                    });
                  }
                }, 200);
              });
              
              tile.addEventListener('mouseleave', () => {
                clearTimeout(hoverTimeout);
                videoPreview.pause();
                videoPreview.currentTime = 0;
                videoPreview.style.display = 'none';
                thumbnail.style.display = 'block';
                tile.style.transform = 'scale(1)';
                tile.style.boxShadow = 'none';
                playIcon.style.opacity = '1';
              });
              
              tile.onclick = () => {
                resolve({ 
                  source: 'pexels', 
                  type: 'video', 
                  url: hdFile.link,
                  videoUrl: hdFile.link,
                  thumbnail: video.image,
                  duration: video.duration,
                  width: hdFile.width,
                  height: hdFile.height,
                  id: video.id
                });
                close();
              };
              if (grid) grid.appendChild(tile);
            });
            
            const totalResults = data.total_results || 0;
            const perPage = 12;
            const hasMore = (currentPage * perPage) < totalResults;
            if (moreBtnPexels) moreBtnPexels.disabled = !hasMore;
            if (noteEl) noteEl.textContent = `${totalResults} video's gevonden`;
          } catch (err) {
            console.error('Pexels error:', err);
            if (grid) grid.innerHTML = '<div style="color:#c00;">Pexels fout. Check API key.</div>';
            if (moreBtnPexels) moreBtnPexels.disabled = true;
          }
        };

        const pexelsSearchBtn = pexelsPane ? pexelsPane.querySelector('.pexels-search') : null;
        if (pexelsSearchBtn) pexelsSearchBtn.addEventListener('click', () => runPexelsSearch(false));
        if (moreBtnPexels) moreBtnPexels.addEventListener('click', () => { currentPage += 1; runPexelsSearch(true); });
        
        // Auto-focus search input when tab opens
        const pexelsTabBtn = tabs.find(b => b.getAttribute('data-tab')==='pexels');
        if (pexelsTabBtn) pexelsTabBtn.addEventListener('click', () => {
          setTimeout(() => {
            const pqi = pexelsPane ? pexelsPane.querySelector('.pexels-query') : null;
            if (pqi) pqi.focus();
          }, 0);
        });
      }

      // YouTube
      if (true) {
        const ytPane = body.querySelector('.tab-content[data-tab="youtube"]');
        const noteEl = ytPane ? ytPane.querySelector('.yt-note') : null;
        const grid = ytPane ? ytPane.querySelector('.yt-grid') : null;
        const moreBtnYt = ytPane ? ytPane.querySelector('.yt-more') : null;
        const key = (window.MEDIA_CONFIG && (window.MEDIA_CONFIG.youtubeApiKey || window.MEDIA_CONFIG.youtubeKey))
          ? (window.MEDIA_CONFIG.youtubeApiKey || window.MEDIA_CONFIG.youtubeKey)
          : '';

        let nextPageToken = '';
        let lastQuery = '';

        const runYtSearch = async (append = false) => {
          const qInput = ytPane ? ytPane.querySelector('.yt-query') : null;
          const q = (qInput && qInput.value ? qInput.value.trim() : '') || 'travel';
          if (!append) {
            if (grid) grid.innerHTML = '<div style="color:#666;">Zoeken...</div>';
            nextPageToken = '';
            lastQuery = q;
          }
          if (!key) {
            if (noteEl) noteEl.textContent = 'Tip: voeg window.MEDIA_CONFIG.youtubeKey toe voor YouTube-zoekresultaten. Gebruik anders de URL-invoer hieronder.';
            if (grid) grid.innerHTML = '<div style="color:#666;">Geen API key: gebruik de URL-invoer hieronder.</div>';
            if (moreBtnYt) moreBtnYt.style.display = 'none';
            return;
          }
          try {
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&q=${encodeURIComponent(q)}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}&key=${key}`;
            const resp = await fetch(url);
            const data = await resp.json();
            if (!append && grid) grid.innerHTML = '';
            // Render as 2-column thumbnail grid without titles
            if (grid) {
              grid.style.display = 'grid';
              grid.style.gridTemplateColumns = '1fr 1fr';
              grid.style.gap = '10px';
            }
            (data.items || []).forEach(item => {
              const idObj = item.id || {};
              const snippet = item.snippet || {};
              const thumbs = (snippet.thumbnails || {});
              const vid = idObj.videoId;
              const thumb = (thumbs.medium && thumbs.medium.url) || (thumbs.default && thumbs.default.url);
              if (!vid) return;
              const tile = document.createElement('div');
              tile.style.cssText = 'border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; background:#f8f9fa; cursor:pointer;';
              tile.innerHTML = `<img src="${thumb}" alt="" style="width:100%;height:140px;object-fit:cover;display:block;"/>`;
              tile.onclick = () => {
                const startInput = ytPane ? ytPane.querySelector('.yt-start') : null;
                const startSec = parseInt((startInput && startInput.value) ? startInput.value : '0', 10) || 0;
                const embed = `https://www.youtube.com/embed/${vid}${startSec>0?`?start=${startSec}`:''}`;
                resolve({ source: 'youtube', type: 'video', embedUrl: embed, id: vid, start: startSec });
                close();
              };
              if (grid) grid.appendChild(tile);
            });
            nextPageToken = data.nextPageToken || '';
            if (moreBtnYt) moreBtnYt.style.display = nextPageToken ? '' : 'none';
          } catch (err) {
            if (grid) grid.innerHTML = '<div style="color:#c00;">YouTube fout. Probeer later opnieuw.</div>';
            if (moreBtnYt) moreBtnYt.style.display = 'none';
          }
        };

        const ytSearchBtn = ytPane ? ytPane.querySelector('.yt-search') : null;
        if (ytSearchBtn) ytSearchBtn.addEventListener('click', () => runYtSearch(false));
        if (moreBtnYt) moreBtnYt.addEventListener('click', () => runYtSearch(true));
        const ytUseBtn = ytPane ? ytPane.querySelector('.yt-use') : null;
        if (ytUseBtn) ytUseBtn.addEventListener('click', () => {
          const urlInput = ytPane ? ytPane.querySelector('.yt-url') : null;
          const url = urlInput && urlInput.value ? urlInput.value.trim() : '';
          if (!url) return;
          const id = MediaPicker.extractYouTubeId(url);
          if (!id) return;
          const startInput = ytPane ? ytPane.querySelector('.yt-start') : null;
          const startSec = parseInt((startInput && startInput.value) ? startInput.value : '0', 10) || 0;
          const embed = `https://www.youtube.com/embed/${id}${startSec>0?`?start=${startSec}`:''}`;
          resolve({ source: 'youtube', type: 'video', embedUrl: embed, id, url, start: startSec });
          close();
        });
      }

      // My Videos
      if (true) {
        const myVideosPane = body.querySelector('.tab-content[data-tab="my-videos"]');
        const noteEl = myVideosPane ? myVideosPane.querySelector('.my-videos-note') : null;
        const grid = myVideosPane ? myVideosPane.querySelector('.my-videos-grid') : null;
        const emptyEl = myVideosPane ? myVideosPane.querySelector('.my-videos-empty') : null;
        const refreshBtn = myVideosPane ? myVideosPane.querySelector('.my-videos-refresh') : null;

        const loadMyVideos = async () => {
          if (grid) grid.innerHTML = '<div style="color:#666;padding:20px;text-align:center;"><i class="fas fa-spinner fa-spin"></i> Laden...</div>';
          if (emptyEl) emptyEl.style.display = 'none';

          try {
            const resp = await fetch('/api/videos/list');
            const data = await resp.json();

            if (!data.success || !data.videos || data.videos.length === 0) {
              if (grid) grid.innerHTML = '';
              if (emptyEl) emptyEl.style.display = 'block';
              if (noteEl) noteEl.textContent = 'Nog geen video\'s';
              return;
            }

            if (grid) grid.innerHTML = '';
            if (noteEl) noteEl.textContent = `${data.videos.length} video${data.videos.length !== 1 ? '\'s' : ''}`;

            // Render as 2-column thumbnail grid
            if (grid) {
              grid.style.display = 'grid';
              grid.style.gridTemplateColumns = '1fr 1fr';
              grid.style.gap = '10px';
            }

            data.videos.forEach(video => {
              const tile = document.createElement('div');
              tile.style.cssText = 'border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; background:#f8f9fa; position:relative; transition: transform 0.2s, box-shadow 0.2s;';

              // Thumbnail or video preview
              const thumbnail = document.createElement('img');
              thumbnail.src = video.thumbnail || video.videoUrl;
              thumbnail.alt = video.title;
              thumbnail.style.cssText = 'width:100%;height:140px;object-fit:cover;display:block;cursor:pointer;';
              thumbnail.onerror = () => {
                // Fallback if thumbnail doesn't exist
                thumbnail.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.style.cssText = 'width:100%;height:140px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);display:flex;align-items:center;justify-content:center;color:white;font-size:48px;cursor:pointer;';
                placeholder.innerHTML = '<i class="fas fa-film"></i>';
                tile.insertBefore(placeholder, tile.firstChild);
              };

              // Title overlay
              const titleOverlay = document.createElement('div');
              titleOverlay.style.cssText = 'position:absolute; bottom:0; left:0; right:0; background:linear-gradient(to top, rgba(0,0,0,0.8), transparent); color:white; padding:8px 8px 32px 8px; font-size:12px; font-weight:600; pointer-events:none;';
              titleOverlay.textContent = video.title;

              // Play icon
              const playIcon = document.createElement('div');
              playIcon.style.cssText = 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:48px; height:48px; background:rgba(102,126,234,0.9); border-radius:50%; display:flex; align-items:center; justify-content:center; pointer-events:none;';
              playIcon.innerHTML = '<i class="fas fa-play" style="color:white; font-size:20px; margin-left:3px;"></i>';

              // Action buttons (bottom right)
              const actionButtons = document.createElement('div');
              actionButtons.style.cssText = 'position:absolute; bottom:8px; right:8px; display:flex; gap:4px; z-index:2;';
              
              // Download button
              const downloadBtn = document.createElement('a');
              downloadBtn.href = video.videoUrl;
              downloadBtn.download = `${video.title}.mp4`;
              downloadBtn.style.cssText = 'width:32px; height:32px; background:rgba(34,197,94,0.95); border-radius:6px; display:flex; align-items:center; justify-content:center; color:white; text-decoration:none; transition:background 0.2s;';
              downloadBtn.innerHTML = '<i class="fas fa-download" style="font-size:14px;"></i>';
              downloadBtn.title = 'Download video';
              downloadBtn.onclick = (e) => {
                e.stopPropagation();
              };
              downloadBtn.addEventListener('mouseenter', () => {
                downloadBtn.style.background = 'rgba(34,197,94,1)';
              });
              downloadBtn.addEventListener('mouseleave', () => {
                downloadBtn.style.background = 'rgba(34,197,94,0.95)';
              });

              // Use button
              const useBtn = document.createElement('button');
              useBtn.style.cssText = 'width:32px; height:32px; background:rgba(102,126,234,0.95); border:none; border-radius:6px; display:flex; align-items:center; justify-content:center; color:white; cursor:pointer; transition:background 0.2s;';
              useBtn.innerHTML = '<i class="fas fa-check" style="font-size:14px;"></i>';
              useBtn.title = 'Gebruik in Hero';
              useBtn.onclick = (e) => {
                e.stopPropagation();
                resolve({
                  source: 'my-videos',
                  type: 'video',
                  url: video.videoUrl,
                  videoUrl: video.videoUrl,
                  thumbnail: video.thumbnail,
                  title: video.title,
                  id: video.id
                });
                close();
              };
              useBtn.addEventListener('mouseenter', () => {
                useBtn.style.background = 'rgba(102,126,234,1)';
              });
              useBtn.addEventListener('mouseleave', () => {
                useBtn.style.background = 'rgba(102,126,234,0.95)';
              });

              actionButtons.appendChild(downloadBtn);
              actionButtons.appendChild(useBtn);

              tile.appendChild(thumbnail);
              tile.appendChild(titleOverlay);
              tile.appendChild(playIcon);
              tile.appendChild(actionButtons);

              // Hover effects
              tile.addEventListener('mouseenter', () => {
                tile.style.transform = 'scale(1.02)';
                tile.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              });

              tile.addEventListener('mouseleave', () => {
                tile.style.transform = 'scale(1)';
                tile.style.boxShadow = 'none';
              });

              // Click on thumbnail to use video
              thumbnail.onclick = () => {
                resolve({
                  source: 'my-videos',
                  type: 'video',
                  url: video.videoUrl,
                  videoUrl: video.videoUrl,
                  thumbnail: video.thumbnail,
                  title: video.title,
                  id: video.id
                });
                close();
              };

              if (grid) grid.appendChild(tile);
            });

          } catch (error) {
            console.error('[MyVideos] Error loading videos:', error);
            if (grid) grid.innerHTML = '<div style="color:#c00;padding:20px;text-align:center;">Fout bij laden van video\'s</div>';
          }
        };

        // Refresh button
        if (refreshBtn) {
          refreshBtn.addEventListener('click', () => loadMyVideos());
        }

        // Auto-load when tab opens
        const myVideosTabBtn = tabs.find(b => b.getAttribute('data-tab') === 'my-videos');
        if (myVideosTabBtn) {
          myVideosTabBtn.addEventListener('click', () => {
            loadMyVideos();
          });
        }
      }

      // Default tab
      const hasYtKey = !!(window.MEDIA_CONFIG && (window.MEDIA_CONFIG.youtubeApiKey || window.MEDIA_CONFIG.youtubeKey));
      const hasPexelsKey = !!(window.MEDIA_CONFIG && window.MEDIA_CONFIG.pexelsKey);
      const initialTab = defaultTab || (type === 'video' && hasPexelsKey ? 'pexels' : type === 'video' && hasYtKey ? 'youtube' : 'unsplash');
      setTab(initialTab);
      
      // Auto-fill search query if provided (wait for DOM to be ready)
      if (searchQuery) {
        console.log('[MediaPicker] Auto-filling search query:', searchQuery);
        setTimeout(() => {
          if (initialTab === 'pexels') {
            const pexelsInput = body.querySelector('.pexels-query');
            console.log('[MediaPicker] Pexels input found:', !!pexelsInput);
            if (pexelsInput) {
              pexelsInput.value = searchQuery;
              console.log('[MediaPicker] Search query set, triggering search...');
              // Auto-trigger search
              const searchBtn = body.querySelector('.pexels-search');
              if (searchBtn) {
                searchBtn.click();
                console.log('[MediaPicker] Search button clicked');
              }
            }
          } else if (initialTab === 'unsplash') {
            const unsplashInput = body.querySelector('.unsplash-query');
            if (unsplashInput) {
              unsplashInput.value = searchQuery;
              // Auto-trigger search
              const searchBtn = body.querySelector('.unsplash-search');
              if (searchBtn) searchBtn.click();
            }
          }
        }, 300); // Increased timeout to ensure DOM is ready
      }

      // Inject minimal styles for drawer
      if (!document.getElementById('media-picker-styles')) {
        const style = document.createElement('style');
        style.id = 'media-picker-styles';
        style.textContent = `
          .mp-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); opacity: 0; transition: opacity .2s ease; z-index: 99998; }
          .mp-overlay.open { opacity: 1; }
          .mp-drawer { position: fixed; top: 0; right: 0; width: 420px; max-width: 92vw; height: 100%; background: #fff; box-shadow: -12px 0 30px rgba(0,0,0,.15); transform: translateX(100%); transition: transform .2s ease; z-index: 99999; display:flex; flex-direction:column; }
          .mp-drawer.open { transform: translateX(0); }
          .mp-header { display:flex; align-items:center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #e5e7eb; }
          .mp-header h3 { margin: 0; font-size: 16px; }
          .mp-header .mp-close { border: 0; background: transparent; cursor: pointer; font-size: 18px; }
          .mp-body { padding: 12px; overflow: auto; }
          .media-tabs { display:flex; gap:8px; margin-bottom: 12px; position: sticky; top: 0; background: #fff; padding: 8px 0 8px; z-index: 1; border-bottom: 1px solid #f1f5f9; }
          .media-tabs .tab-btn { border-color:#d1d5db; color:#374151; }
          .media-tabs .tab-btn.active { box-shadow: 0 0 0 2px rgba(59,130,246,0.15) inset; }
          .media-tabs .tab-btn[data-tab="unsplash"] { background:#ff7700; border-color:#ff7700; color:#fff; }
          .media-tabs .tab-btn[data-tab="unsplash"].active { filter: brightness(0.95); }
          .media-tabs .tab-btn[data-tab="pexels"] { background:#05A081; border-color:#05A081; color:#fff; }
          .media-tabs .tab-btn[data-tab="pexels"].active { filter: brightness(0.95); }
          .media-tabs .tab-btn[data-tab="youtube"] { background:#ff0000; border-color:#ff0000; color:#fff; }
          .media-tabs .tab-btn[data-tab="youtube"].active { filter: brightness(0.95); }
          .media-tabs .tab-btn[data-tab="my-videos"] { background:#667eea; border-color:#667eea; color:#fff; }
          .media-tabs .tab-btn[data-tab="my-videos"].active { filter: brightness(0.95); }
          .media-tabs .tab-btn[data-tab="upload"] { background:#f3f4f6; }
          .media-tabs .tab-btn[data-tab="url"] { background:#e0f2fe; border-color:#bae6fd; }
          .mp-help { color:#666; font-size: .9rem; margin-top: 8px; }
          .mp-row { display:flex; gap:8px; align-items:center; }
          .mp-between { justify-content: space-between; }
          .unsplash-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-top:12px; }
          .mp-more-row { margin-top: 14px; }
          .mp-thumb { width:100%; height:110px; object-fit: cover; border-radius: 8px; cursor: pointer; }
          .mp-body .btn.btn-lg { padding: 12px 20px; border-radius: 12px; font-weight: 700; }
          .mp-body .btn.btn-primary { background:#2563eb; border-color:#2563eb; color:#fff; }
          .mp-body .btn.btn-primary:hover { filter: brightness(0.95); }
          .btn.btn-primary[disabled] { opacity: .55; cursor: not-allowed; }
        `;
        document.head.appendChild(style);
      }
    });
  }

  static extractYouTubeId(url) {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  }
}

// Public alias for generic open
MediaPicker.open = MediaPicker._open;
window.MediaPicker = MediaPicker;

// Default config namespace
window.MEDIA_CONFIG = window.MEDIA_CONFIG || { unsplashKey: '' };
