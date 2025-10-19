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

  static _open({ type = 'image', defaultTab } = {}) {
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
          <button class="btn btn-secondary tab-btn" data-tab="youtube"><i class="fab fa-youtube"></i> YouTube</button>
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
            const resp = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=12&page=${currentPage}` , {
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
        // Auto-focus search input when tab opens
        const unsplashTabBtn = tabs.find(b => b.getAttribute('data-tab')==='unsplash');
        if (unsplashTabBtn) unsplashTabBtn.addEventListener('click', () => {
          setTimeout(() => {
            const uqi = unsplashPane ? unsplashPane.querySelector('.unsplash-query') : null;
            if (uqi) uqi.focus();
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

      // Default tab
      const hasYtKey = !!(window.MEDIA_CONFIG && (window.MEDIA_CONFIG.youtubeApiKey || window.MEDIA_CONFIG.youtubeKey));
      const initialTab = defaultTab || (type === 'video' && hasYtKey ? 'youtube' : 'unsplash');
      setTab(initialTab);

      // Inject minimal styles for drawer
      if (!document.getElementById('media-picker-styles')) {
        const style = document.createElement('style');
        style.id = 'media-picker-styles';
        style.textContent = `
          .mp-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); opacity: 0; transition: opacity .2s ease; z-index: 9998; }
          .mp-overlay.open { opacity: 1; }
          .mp-drawer { position: fixed; top: 0; right: 0; width: 420px; max-width: 92vw; height: 100%; background: #fff; box-shadow: -12px 0 30px rgba(0,0,0,.15); transform: translateX(100%); transition: transform .2s ease; z-index: 9999; display:flex; flex-direction:column; }
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
          .media-tabs .tab-btn[data-tab="youtube"] { background:#ff0000; border-color:#ff0000; color:#fff; }
          .media-tabs .tab-btn[data-tab="youtube"].active { filter: brightness(0.95); }
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
