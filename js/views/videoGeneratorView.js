// js/views/videoGeneratorView.js
// Video Generator View - Creates promotional videos from travel itineraries

(function() {
  const VideoGeneratorView = {
    travelData: null,
    selectedClips: [],
    voiceoverFile: null,
    renderId: null,
    statusInterval: null,

    mount(container, travelData = null) {
      if (!container) return;
      
      // Initialize with empty data if none provided (standalone mode)
      this.travelData = travelData || {
        title: 'Mijn Video',
        destinations: []
      };
      
      container.innerHTML = this.renderHTML();
      this.attachEventListeners(container);
      
      // Auto-preview clips if destinations available
      if (this.travelData.destinations && this.travelData.destinations.length > 0) {
        this.previewClips();
      }
    },

    renderHTML() {
      const destinations = this.travelData?.destinations || [];
      const title = this.travelData?.title || this.travelData?.name || 'Jouw Reis';
      
      return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 20px; min-height: 100vh;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">
                <i class="fas fa-video"></i> Video Generator
              </h1>
              <button id="importTravelIdBtn" class="btn btn-secondary" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white;">
                <i class="fas fa-download"></i> Importeer Travel ID
              </button>
            </div>
            <p style="margin: 0; opacity: 0.9; font-size: 14px;">
              Maak een promotievideo met AI-geselecteerde clips
            </p>
          </div>

          <!-- Travel Info -->
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">
                <i class="fas fa-plane-departure"></i> ${title}
              </h2>
              <input type="text" id="videoTitleInput" value="${title}" class="form-control" style="max-width: 300px; font-size: 14px;" placeholder="Video titel" />
            </div>
            <div style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">
              ${destinations.length} bestemming${destinations.length !== 1 ? 'en' : ''}
            </div>
            ${destinations.length === 0 ? `
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="text" id="travelIdInput" placeholder="Travel Compositor ID (optioneel)" 
                  style="flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;">
                <button id="loadTravelIdBtn" style="padding: 8px 16px; background: #8b5cf6; border: none; border-radius: 6px; color: white; font-size: 13px; font-weight: 500; cursor: pointer;">
                  <i class="fas fa-download"></i> Laden
                </button>
              </div>
            ` : ''}
          </div>

          <!-- Clip Preview -->
          <div id="clipPreview" style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #111827;">
              <i class="fas fa-film"></i> Video Clips
            </h3>
            
            <!-- Theme Buttons -->
            <div style="margin-bottom: 20px;">
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px; font-weight: 500;">Kies een thema:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <button class="theme-btn" data-theme="safari wildlife africa" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; font-size: 13px; color: #374151; cursor: pointer; transition: all 0.2s;">
                  🦁 Safari
                </button>
                <button class="theme-btn" data-theme="skiing snow mountains winter" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; font-size: 13px; color: #374151; cursor: pointer; transition: all 0.2s;">
                  ⛷️ Skiën
                </button>
                <button class="theme-btn" data-theme="hiking mountains trail nature" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; font-size: 13px; color: #374151; cursor: pointer; transition: all 0.2s;">
                  🥾 Hiking
                </button>
                <button class="theme-btn" data-theme="mountain biking cycling trail" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; font-size: 13px; color: #374151; cursor: pointer; transition: all 0.2s;">
                  🚵 Mountain Bike
                </button>
                <button class="theme-btn" data-theme="cruise ship ocean sailing" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; font-size: 13px; color: #374151; cursor: pointer; transition: all 0.2s;">
                  🚢 Cruise
                </button>
                <button class="theme-btn" data-theme="road trip car driving highway" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; font-size: 13px; color: #374151; cursor: pointer; transition: all 0.2s;">
                  🚗 Roadtrip
                </button>
                <button class="theme-btn" data-theme="tropical beach paradise ocean" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; font-size: 13px; color: #374151; cursor: pointer; transition: all 0.2s;">
                  🏝️ Tropisch Strand
                </button>
              </div>
            </div>

            <!-- Custom Search -->
            <div style="margin-bottom: 20px;">
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px; font-weight: 500;">Of zoek zelf:</div>
              <div style="display: flex; gap: 8px;">
                <input type="text" id="customSearchInput" placeholder="Bijv: sunset, cityscape, food..." 
                  style="flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;">
                <button id="customSearchBtn" style="padding: 8px 16px; background: #6366f1; border: none; border-radius: 6px; color: white; font-size: 13px; font-weight: 500; cursor: pointer;">
                  <i class="fas fa-search"></i> Zoek
                </button>
              </div>
            </div>

            <!-- Clips Grid -->
            <div id="clipGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; min-height: 120px;">
              <div style="text-align: center; padding: 40px; color: #9ca3af; grid-column: 1 / -1;">
                <i class="fas fa-film" style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;"></i>
                <div>Kies een thema of zoek zelf</div>
              </div>
            </div>
          </div>

          <!-- Settings -->
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #111827;">
              <i class="fas fa-sliders-h"></i> Video Instellingen
            </h3>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">
                <i class="fas fa-clock"></i> Duur per clip (seconden)
              </label>
              <input type="range" id="clipDuration" min="2" max="15" value="5" step="0.5" 
                style="width: 100%; height: 6px; border-radius: 5px; background: #e5e7eb; outline: none;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; margin-top: 4px;">
                <span>2s</span>
                <span id="durationValue">5s</span>
                <span>15s</span>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">
                <i class="fas fa-microphone"></i> Voice-over (optioneel)
              </label>
              <div style="display: flex; gap: 12px; align-items: center;">
                <input type="file" id="voiceoverInput" accept="audio/*" style="display: none;">
                <button id="uploadVoiceoverBtn" style="height: 40px; padding: 0 20px; background: #8b5cf6; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">
                  <i class="fas fa-upload"></i> Upload Audio
                </button>
                <div id="voiceoverStatus" style="font-size: 14px; color: #6b7280;"></div>
              </div>
              <div style="font-size: 12px; color: #9ca3af; margin-top: 6px;">
                Upload je eigen voice-over (MP3, WAV, max 10MB)
              </div>
            </div>
          </div>

          <!-- Generate Button -->
          <div style="text-align: center; margin-bottom: 24px;">
            <button id="generateVideoBtn" style="height: 56px; padding: 0 48px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); border: none; border-radius: 12px; color: white; font-weight: 700; font-size: 18px; cursor: pointer; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3); transition: transform 0.2s;">
              <i class="fas fa-magic"></i> Genereer Video
            </button>
          </div>

          <!-- Progress -->
          <div id="videoProgress" style="display: none; background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #111827;">
              <i class="fas fa-spinner fa-spin"></i> Video wordt gegenereerd...
            </h3>
            <div style="background: #f3f4f6; border-radius: 8px; height: 12px; overflow: hidden; margin-bottom: 12px;">
              <div id="progressBar" style="background: linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%); height: 100%; width: 0%; transition: width 0.3s;"></div>
            </div>
            <div id="progressText" style="text-align: center; color: #6b7280; font-size: 14px;">Voorbereiden...</div>
          </div>

          <!-- Result -->
          <div id="videoResult" style="display: none; background: white; border: 1px solid #22c55e; border-radius: 12px; padding: 24px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #16a34a;">
              <i class="fas fa-check-circle"></i> Video is klaar!
            </h3>
            <video id="resultVideo" controls style="width: 100%; border-radius: 8px; margin-bottom: 16px;"></video>
            
            <!-- Save to My Videos -->
            <div id="saveSection" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151; font-size: 14px;">
                <i class="fas fa-tag"></i> Video naam
              </label>
              <input type="text" id="videoNameInput" placeholder="Bijv. Amsterdam → Paris → Rome" 
                style="width: 100%; height: 40px; padding: 0 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; margin-bottom: 12px;">
              <button id="saveToMyVideosBtn" style="width: 100%; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; transition: transform 0.2s;">
                <i class="fas fa-save"></i> Opslaan naar Mijn Video's
              </button>
              <div id="saveStatus" style="margin-top: 8px; font-size: 13px; text-align: center;"></div>
            </div>
            
            <div style="display: flex; gap: 12px;">
              <a id="downloadVideoBtn" href="#" download style="flex: 1; height: 48px; display: flex; align-items: center; justify-content: center; background: #16a34a; border-radius: 8px; color: white; font-weight: 600; text-decoration: none;">
                <i class="fas fa-download"></i> Download Video
              </a>
              <button id="newVideoBtn" style="flex: 1; height: 48px; background: #6b7280; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">
                <i class="fas fa-redo"></i> Nieuwe Video
              </button>
            </div>
          </div>

          <!-- Back Button -->
          <div style="text-align: center; margin-top: 24px;">
            <button id="backBtn" style="height: 40px; padding: 0 24px; background: #6b7280; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">
              <i class="fas fa-arrow-left"></i> Terug
            </button>
          </div>
        </div>
      `;
    },

    attachEventListeners(container) {
      const generateBtn = container.querySelector('#generateVideoBtn');
      const uploadBtn = container.querySelector('#uploadVoiceoverBtn');
      const voiceoverInput = container.querySelector('#voiceoverInput');
      const durationSlider = container.querySelector('#clipDuration');
      const durationValue = container.querySelector('#durationValue');
      const backBtn = container.querySelector('#backBtn');
      const newVideoBtn = container.querySelector('#newVideoBtn');
      const saveBtn = container.querySelector('#saveToMyVideosBtn');
      const videoNameInput = container.querySelector('#videoNameInput');
      const importBtn = container.querySelector('#importTravelIdBtn');
      const titleInput = container.querySelector('#videoTitleInput');
      const themeButtons = container.querySelectorAll('.theme-btn');
      const customSearchInput = container.querySelector('#customSearchInput');
      const customSearchBtn = container.querySelector('#customSearchBtn');
      const travelIdInput = container.querySelector('#travelIdInput');
      const loadTravelIdBtn = container.querySelector('#loadTravelIdBtn');

      // Duration slider
      durationSlider?.addEventListener('input', (e) => {
        durationValue.textContent = `${e.target.value}s`;
      });

      // Voice-over upload
      uploadBtn?.addEventListener('click', () => voiceoverInput?.click());
      voiceoverInput?.addEventListener('change', (e) => this.handleVoiceoverUpload(e));

      // Generate video
      generateBtn?.addEventListener('click', () => this.generateVideo(container));

      // Save to My Videos
      saveBtn?.addEventListener('click', () => this.saveToMyVideos(container));

      // Auto-fill video name from travel data
      if (videoNameInput && this.travelData) {
        const title = this.travelData.title || this.travelData.name || '';
        if (title) {
          videoNameInput.value = title;
        }
      }

      // Back button
      backBtn?.addEventListener('click', () => {
        if (window.WB_setMode) window.WB_setMode('page');
      });

      // New video
      newVideoBtn?.addEventListener('click', () => {
        this.resetGenerator(container);
      });

      // Import Travel ID
      importBtn?.addEventListener('click', () => this.importTravelId(container));

      // Update title when changed
      titleInput?.addEventListener('change', (e) => {
        if (this.travelData) {
          this.travelData.title = e.target.value;
        }
      });

      // Theme buttons
      themeButtons?.forEach(btn => {
        btn.addEventListener('click', () => {
          const theme = btn.getAttribute('data-theme');
          this.searchClipsByTheme(theme, btn.textContent.trim());
        });
        
        // Hover effect
        btn.addEventListener('mouseenter', () => {
          btn.style.background = '#f3f4f6';
          btn.style.borderColor = '#9ca3af';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.background = 'white';
          btn.style.borderColor = '#d1d5db';
        });
      });

      // Custom search
      customSearchBtn?.addEventListener('click', () => {
        const searchTerm = customSearchInput?.value?.trim();
        if (searchTerm) {
          this.searchClipsByTheme(searchTerm, searchTerm);
        }
      });
      
      customSearchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          customSearchBtn?.click();
        }
      });

      // Travel ID input
      loadTravelIdBtn?.addEventListener('click', () => {
        const ideaId = travelIdInput?.value?.trim();
        if (ideaId) {
          this.importTravelId(container, ideaId);
        }
      });
      
      travelIdInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          loadTravelIdBtn?.click();
        }
      });
    },

    async previewClips() {
      const clipGrid = document.getElementById('clipGrid');
      if (!clipGrid) return;

      const destinations = this.travelData?.destinations || [];
      
      // Initialize selected clips storage
      if (!this.selectedClips) {
        this.selectedClips = [];
      }
      
      // Show destination cards with "Search Clips" button
      clipGrid.innerHTML = destinations.map(dest => {
        const destName = dest.name || dest;
        const destClips = this.selectedClips.filter(c => c.destination === destName);
        
        return `
          <div class="destination-card" data-destination="${destName}" style="border: 2px solid #e5e7eb; border-radius: 12px; padding: 16px; background: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h4 style="margin: 0; font-size: 16px; font-weight: 700; color: #111827;">${destName}</h4>
              <button class="btn btn-sm search-clips-btn" data-destination="${destName}" style="background: #8b5cf6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">
                <i class="fas fa-search"></i> Zoek clips
              </button>
            </div>
            <div class="clips-preview" data-destination="${destName}" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; min-height: 80px;">
              ${destClips.length === 0 ? `
                <div style="grid-column: 1/-1; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 14px; padding: 20px;">
                  <i class="fas fa-film" style="margin-right: 8px;"></i> Geen clips geselecteerd
                </div>
              ` : destClips.map(clip => `
                <div class="selected-clip" style="position: relative; border-radius: 6px; overflow: hidden;">
                  <img src="${clip.thumbnail}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;">
                  <button class="remove-clip-btn" data-clip-id="${clip.id}" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: white; border: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; font-size: 10px;">
                    <i class="fas fa-times"></i>
                  </button>
                  <div style="position: absolute; bottom: 4px; right: 4px; background: rgba(0,0,0,0.7); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
                    ${Math.round(clip.duration)}s
                  </div>
                </div>
              `).join('')}
            </div>
            <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
              ${destClips.length} clip${destClips.length !== 1 ? 's' : ''} geselecteerd
            </div>
          </div>
        `;
      }).join('');
      
      // Add "Add Custom Destination" button
      clipGrid.innerHTML += `
        <div style="border: 2px dashed #d1d5db; border-radius: 12px; padding: 16px; background: #f9fafb; display: flex; align-items: center; justify-content: center; min-height: 150px; cursor: pointer;" id="addCustomDestBtn">
          <div style="text-align: center; color: #6b7280;">
            <i class="fas fa-plus-circle" style="font-size: 32px; margin-bottom: 8px;"></i>
            <div style="font-weight: 600;">Voeg bestemming toe</div>
            <div style="font-size: 12px; margin-top: 4px;">Handmatig een gebied toevoegen</div>
          </div>
        </div>
      `;
      
      // Attach event listeners
      this.attachClipEventListeners(clipGrid);
    },
    
    getSmartSearchQuery(destination) {
      const dest = destination.toLowerCase();
      
      // Mountain/Ski destinations
      if (dest.includes('kitzbühel') || dest.includes('kitzbuehel')) {
        return 'Kitzbühel Austria ski resort mountains alpine';
      }
      if (dest.includes('alpen') || dest.includes('alps')) {
        return 'Alps mountains snow peaks aerial';
      }
      if (dest.includes('tirol') || dest.includes('tyrol')) {
        return 'Tirol Austria mountains alpine village';
      }
      if (dest.includes('salzburg')) {
        return 'Salzburg Austria city mountains architecture';
      }
      
      // Coastal/Beach destinations
      if (dest.includes('istria') || dest.includes('istrië')) {
        return 'Istria Croatia coast beach adriatic sea';
      }
      if (dest.includes('kroatië') || dest.includes('croatia')) {
        return 'Croatia coast adriatic sea beach aerial';
      }
      if (dest.includes('dalmatië') || dest.includes('dalmatia')) {
        return 'Dalmatia Croatia coast islands aerial';
      }
      
      // City destinations
      if (dest.includes('parijs') || dest.includes('paris')) {
        return 'Paris France Eiffel Tower city aerial';
      }
      if (dest.includes('rome') || dest.includes('roma')) {
        return 'Rome Italy Colosseum city architecture';
      }
      if (dest.includes('barcelona')) {
        return 'Barcelona Spain Sagrada Familia city aerial';
      }
      if (dest.includes('amsterdam')) {
        return 'Amsterdam Netherlands canals city aerial';
      }
      
      // Nature/Landscape destinations
      if (dest.includes('toscane') || dest.includes('tuscany')) {
        return 'Tuscany Italy countryside hills vineyards';
      }
      if (dest.includes('provence')) {
        return 'Provence France lavender fields countryside';
      }
      
      // Default: just use destination name for better, more specific results
      return `${destination}`;
    },
    
    attachClipEventListeners(clipGrid) {
      // Search clips buttons
      clipGrid.querySelectorAll('.search-clips-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const destination = e.currentTarget.dataset.destination;
          await this.openClipSelector(destination);
        });
      });
      
      // Remove clip buttons
      clipGrid.querySelectorAll('.remove-clip-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const clipId = e.currentTarget.dataset.clipId;
          this.removeClip(clipId);
        });
      });
      
      // Add custom destination button
      const addBtn = clipGrid.querySelector('#addCustomDestBtn');
      if (addBtn) {
        addBtn.addEventListener('click', () => this.addCustomDestination());
      }
    },
    
    async openClipSelector(destination) {
      console.log('[VideoGen] Opening clip selector for:', destination);
      
      // Check if MediaPicker is available
      if (!window.MediaPicker) {
        console.error('[VideoGen] MediaPicker not found on window');
        alert('Media Picker niet beschikbaar. Herlaad de pagina.');
        return;
      }
      
      if (!window.MediaPicker.openVideo) {
        console.error('[VideoGen] MediaPicker.openVideo not found');
        alert('Media Picker video functie niet beschikbaar.');
        return;
      }
      
      console.log('[VideoGen] MediaPicker available, opening...');
      
      try {
        // Check if modal is already open
        const existingOverlay = document.querySelector('.mp-overlay');
        if (existingOverlay) {
          console.warn('[VideoGen] Media Picker already open, closing first...');
          existingOverlay.remove();
        }
        
        // Open Media Picker in video mode with Pexels tab and auto-search
        // Use smart search terms based on destination type
        const searchQuery = this.getSmartSearchQuery(destination);
        console.log('[VideoGen] Calling MediaPicker.openVideo with:', { defaultTab: 'pexels', searchQuery });
        
        const result = await window.MediaPicker.openVideo({ 
          defaultTab: 'pexels',
          searchQuery: searchQuery
        });
        
        console.log('[VideoGen] MediaPicker returned, result:', result);
        
        if (!result) {
          console.log('[VideoGen] User cancelled or no result');
          return;
        }
        
        if (result.source === 'pexels') {
          // Add clip to selected clips
          const clip = {
            id: `${destination}-${Date.now()}`,
            destination: destination,
            thumbnail: result.thumbnail,
            url: result.videoUrl || result.url,
            duration: result.duration || 3
          };
          
          this.selectedClips.push(clip);
          console.log('[VideoGen] Clip added:', clip);
          
          // Refresh preview
          this.previewClips();
        } else {
          console.warn('[VideoGen] Result source is not pexels:', result.source);
        }
      } catch (error) {
        console.error('[VideoGen] Error opening MediaPicker:', error);
        alert('Fout bij openen Media Picker: ' + error.message);
      }
    },
    
    removeClip(clipId) {
      this.selectedClips = this.selectedClips.filter(c => c.id !== clipId);
      this.previewClips();
    },
    
    async addCustomDestination() {
      const name = prompt('Voer de naam van de bestemming in:');
      if (!name) return;
      
      // Add to travel data
      if (!this.travelData.destinations) {
        this.travelData.destinations = [];
      }
      this.travelData.destinations.push({ name: name });
      
      // Refresh preview
      this.previewClips();
    },

    async handleVoiceoverUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const status = document.getElementById('voiceoverStatus');
      if (!status) return;

      status.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Uploaden...';

      try {
        const formData = new FormData();
        formData.append('voiceover', file);

        const apiBase = this.getApiBase();
        const response = await fetch(`${apiBase}/api/video/upload-voiceover`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload mislukt');
        }

        const result = await response.json();
        this.voiceoverFile = result.url;
        
        status.innerHTML = `<i class="fas fa-check-circle" style="color: #22c55e;"></i> ${file.name}`;
      } catch (error) {
        console.error('[VideoGen] Upload error:', error);
        status.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #ef4444;"></i> Upload mislukt`;
      }
    },

    async generateVideo(container) {
      const progressDiv = container.querySelector('#videoProgress');
      const generateBtn = container.querySelector('#generateVideoBtn');
      const durationSlider = container.querySelector('#clipDuration');

      if (!progressDiv || !generateBtn) return;

      // Show progress
      progressDiv.style.display = 'block';
      generateBtn.disabled = true;
      generateBtn.style.opacity = '0.5';
      generateBtn.style.cursor = 'not-allowed';

      try {
        // Check if clips are selected
        if (!this.selectedClips || this.selectedClips.length === 0) {
          throw new Error('Selecteer eerst video clips voor je bestemmingen');
        }

        const destinations = this.travelData?.destinations?.map(d => ({
          name: d.name || d.title || d
        })) || [];

        const payload = {
          destinations,
          clips: this.selectedClips.map(clip => ({
            url: clip.url,
            destination: clip.destination,
            duration: clip.duration,
            thumbnail: clip.thumbnail
          })),
          title: this.travelData?.title || this.travelData?.name || 'Jouw Reis',
          voiceoverUrl: this.voiceoverFile,
          clipDuration: parseFloat(durationSlider?.value || 3)
        };

        const apiBase = this.getApiBase();
        console.log('[VideoGen] Sending request to:', `${apiBase}/api/video/generate`);
        console.log('[VideoGen] Payload:', payload);
        
        const response = await fetch(`${apiBase}/api/video/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        console.log('[VideoGen] Response status:', response.status);
        
        // Read response body once (either JSON or text)
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        
        let responseData;
        let errorMessage = 'Video generatie mislukt';
        
        try {
          if (isJson) {
            responseData = await response.json();
          } else {
            const text = await response.text();
            responseData = { error: text };
          }
        } catch (e) {
          console.error('[VideoGen] Failed to parse response:', e);
          throw new Error('Server response kon niet worden gelezen');
        }
        
        if (!response.ok) {
          // Extract error message from parsed data
          errorMessage = responseData.message || responseData.error || errorMessage;
          console.error('[VideoGen] Server error:', errorMessage);
          throw new Error(errorMessage);
        }

        const result = responseData;
        console.log('[VideoGen] Result:', result);
        this.renderId = result.renderId;

        // Start polling for status
        this.pollVideoStatus(container);

      } catch (error) {
        console.error('[VideoGen] Error:', error);
        this.showError(container, error.message);
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
        generateBtn.style.cursor = 'pointer';
      }
    },

    async pollVideoStatus(container) {
      if (!this.renderId) return;

      const progressBar = container.querySelector('#progressBar');
      const progressText = container.querySelector('#progressText');

      this.statusInterval = setInterval(async () => {
        try {
          const apiBase = this.getApiBase();
          const response = await fetch(`${apiBase}/api/video/status/${this.renderId}`);
          const status = await response.json();

          // Update progress
          if (progressBar) progressBar.style.width = `${status.progress}%`;
          if (progressText) progressText.textContent = status.message;

          // Check if done
          if (status.status === 'done') {
            clearInterval(this.statusInterval);
            this.showResult(container, status.url);
          } else if (status.status === 'failed') {
            clearInterval(this.statusInterval);
            this.showError(container, status.error || 'Video generatie mislukt');
          }
        } catch (error) {
          console.error('[VideoGen] Status check error:', error);
        }
      }, 3000); // Check every 3 seconds
    },

    showResult(container, videoUrl) {
      const progressDiv = container.querySelector('#videoProgress');
      const resultDiv = container.querySelector('#videoResult');
      const resultVideo = container.querySelector('#resultVideo');
      const downloadBtn = container.querySelector('#downloadVideoBtn');

      if (progressDiv) progressDiv.style.display = 'none';
      if (resultDiv) resultDiv.style.display = 'block';
      if (downloadBtn) downloadBtn.href = videoUrl;
      
      if (resultVideo) {
        resultVideo.src = videoUrl;
        
        // Generate poster from first frame when video loads
        resultVideo.addEventListener('loadeddata', () => {
          // Seek to first frame (0.1 sec to ensure frame is loaded)
          resultVideo.currentTime = 0.1;
        }, { once: true });
        
        resultVideo.addEventListener('seeked', () => {
          // Generate thumbnail from current frame
          try {
            const canvas = document.createElement('canvas');
            canvas.width = resultVideo.videoWidth || 1280;
            canvas.height = resultVideo.videoHeight || 720;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(resultVideo, 0, 0, canvas.width, canvas.height);
            const posterUrl = canvas.toDataURL('image/jpeg', 0.9);
            resultVideo.poster = posterUrl;
            resultVideo.currentTime = 0; // Reset to start
            console.log('[VideoGen] Poster generated from first frame');
          } catch (e) {
            console.warn('[VideoGen] Could not generate poster:', e);
          }
        }, { once: true });
      }
    },

    showError(container, message) {
      const progressDiv = container.querySelector('#videoProgress');
      if (progressDiv) {
        progressDiv.style.borderColor = '#ef4444';
        progressDiv.innerHTML = `
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #dc2626;">
            <i class="fas fa-exclamation-circle"></i> Fout
          </h3>
          <p style="margin: 0; color: #6b7280;">${message}</p>
        `;
      }
    },

    resetGenerator(container) {
      const resultDiv = container.querySelector('#videoResult');
      const progressDiv = container.querySelector('#videoProgress');
      const generateBtn = container.querySelector('#generateVideoBtn');

      if (resultDiv) resultDiv.style.display = 'none';
      if (progressDiv) progressDiv.style.display = 'none';
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
        generateBtn.style.cursor = 'pointer';
      }

      this.renderId = null;
      this.voiceoverFile = null;
      
      if (this.statusInterval) {
        clearInterval(this.statusInterval);
        this.statusInterval = null;
      }
    },

    async saveToMyVideos(container) {
      const videoNameInput = container.querySelector('#videoNameInput');
      const saveBtn = container.querySelector('#saveToMyVideosBtn');
      const saveStatus = container.querySelector('#saveStatus');
      const resultVideo = container.querySelector('#resultVideo');

      if (!resultVideo || !resultVideo.src) {
        if (saveStatus) saveStatus.innerHTML = '<span style="color:#ef4444;"><i class="fas fa-exclamation-circle"></i> Geen video om op te slaan</span>';
        return;
      }

      const videoName = videoNameInput?.value?.trim() || 'Untitled Video';

      // Disable button during upload
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.style.opacity = '0.5';
        saveBtn.style.cursor = 'not-allowed';
        saveBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Opslaan...';
      }

      if (saveStatus) saveStatus.innerHTML = '<span style="color:#6b7280;"><i class="fas fa-circle-notch fa-spin"></i> Video wordt opgeslagen...</span>';

      try {
        let videoUrl = resultVideo.src;
        let videoBlob = null;
        
        // Check if video is already an external URL (Pexels, Pixabay, Storyblocks, etc.)
        const isExternalUrl = videoUrl.startsWith('http') && (
          videoUrl.includes('pexels.com') ||
          videoUrl.includes('pixabay.com') ||
          videoUrl.includes('storyblocks.com') ||
          videoUrl.includes('graphicstock.com') ||
          videoUrl.includes('videos.pexels.com') ||
          videoUrl.includes('player.vimeo.com') ||
          videoUrl.includes('cdn.pixabay.com')
        );
        
        if (isExternalUrl) {
          // External URL - use directly, no upload needed
          console.log('[VideoGen] Using external video URL directly:', videoUrl);
          if (saveStatus) saveStatus.innerHTML = '<span style="color:#6b7280;"><i class="fas fa-circle-notch fa-spin"></i> Externe video wordt geregistreerd...</span>';
        } else if (videoUrl.startsWith('blob:') || videoUrl.startsWith('data:')) {
          // Local blob/data URL - use client-side direct upload to bypass 4.5MB serverless limit
          if (saveStatus) saveStatus.innerHTML = '<span style="color:#6b7280;"><i class="fas fa-circle-notch fa-spin"></i> Video wordt geüpload naar storage...</span>';
          
          videoBlob = await fetch(resultVideo.src).then(r => r.blob());
          
          // Check file size
          const sizeMB = videoBlob.size / (1024 * 1024);
          console.log('[VideoGen] Video size:', sizeMB.toFixed(2), 'MB');
          
          if (sizeMB > 4) {
            if (saveStatus) saveStatus.innerHTML = `<span style="color:#6b7280;"><i class="fas fa-circle-notch fa-spin"></i> Grote video (${sizeMB.toFixed(1)}MB) wordt geüpload...</span>`;
          }
          
          // Generate unique filename
          const timestamp = Date.now();
          const safeTitle = videoName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
          const filename = `videos/${timestamp}-${safeTitle}.mp4`;
          
          // Use streaming PUT upload to bypass 4.5MB serverless limit
          // The server streams directly to Vercel Blob without buffering
          const uploadResponse = await fetch('/api/videos/upload-direct', {
            method: 'PUT',
            headers: {
              'Content-Type': 'video/mp4',
              'X-Filename': `${timestamp}-${safeTitle}.mp4`
            },
            body: videoBlob
          });
          
          if (!uploadResponse.ok) {
            let errorMessage = 'Upload mislukt';
            try {
              const errorText = await uploadResponse.text();
              if (errorText.includes('FUNCTION_PAYLOAD_TOO_LARGE') || errorText.includes('Request Entity Too Large')) {
                errorMessage = `Video te groot (${sizeMB.toFixed(1)}MB). Maximum is ~100MB voor streaming upload.`;
              } else {
                try {
                  const errorJson = JSON.parse(errorText);
                  errorMessage = errorJson.detail || errorJson.error || errorMessage;
                } catch (e) {
                  errorMessage = errorText.substring(0, 200);
                }
              }
            } catch (e) {
              errorMessage = `HTTP ${uploadResponse.status}`;
            }
            throw new Error(errorMessage);
          }
          
          const uploadResult = await uploadResponse.json();
          videoUrl = uploadResult.url || uploadResult.blobUrl;
          
          if (!videoUrl) {
            throw new Error('Video URL niet ontvangen van storage');
          }
          
          console.log('[VideoGen] Video uploaded to storage:', videoUrl);
        }
        
        // videoUrl is now either the external URL or the uploaded blob URL

        if (!videoUrl) {
          throw new Error('Video URL niet ontvangen van storage');
        }

        console.log('[VideoGen] Video uploaded to storage:', videoUrl);
        if (saveStatus) saveStatus.innerHTML = '<span style="color:#6b7280;"><i class="fas fa-circle-notch fa-spin"></i> Credits registreren...</span>';

        // STAP 2: Registreer credits bij BOLT (alleen URL, geen video data!)
        const urlParams = new URLSearchParams(window.location.search);
        const brandId = urlParams.get('brand_id') ||
          window.websiteBuilder?._edgeCtx?.brand_id ||
          window.edgeCtx?.brand_id ||
          window.BOLT_DB?.brandId ||
          window.BRAND_ID ||
          null;

        if (!brandId) {
          // Geen brand context, video is opgeslagen maar geen credits afschrijving
          if (saveStatus) saveStatus.innerHTML = '<span style="color:#22c55e;"><i class="fas fa-check-circle"></i> Video opgeslagen! (Geen brand context voor credits)</span>';
        } else {
          const token = (urlParams.get('token') || window.CURRENT_TOKEN || '').trim();
          const apiKey = (urlParams.get('apikey') || urlParams.get('api_key') || (window.BOLT_API && window.BOLT_API.apiKey) || '').trim();

          const headers = { 'Content-Type': 'application/json' };
          if (token) headers.Authorization = `Bearer ${token}`;
          if (apiKey) headers['X-API-Key'] = apiKey;

          const billingRes = await fetch('/api/register-video-storage', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              brandId,
              videoUrl,
              videoTitle: videoName,
              fileSizeBytes: videoBlob?.size || 0,
              durationSeconds: Math.round(resultVideo.duration || 0)
            })
          });

          if (billingRes.ok) {
            const billingData = await billingRes.json();
            console.log('[VideoGen] Credits deducted:', billingData);
            const creditsDeducted = billingData.costCredits || 100;
            const creditsRemaining = billingData.creditsRemaining;
            
            if (saveStatus) {
              saveStatus.innerHTML = `<span style="color:#22c55e;"><i class="fas fa-check-circle"></i> Video opgeslagen! ${creditsDeducted} credits afgeschreven${creditsRemaining !== undefined ? ` (${creditsRemaining} resterend)` : ''}.</span>`;
            }
          } else {
            let billingMsg = 'Credits afschrijving mislukt';
            try {
              const ct = billingRes.headers.get('content-type');
              if (ct && ct.includes('application/json')) {
                const err = await billingRes.json();
                billingMsg = err.error || err.message || billingMsg;
              } else {
                billingMsg = (await billingRes.text()).substring(0, 120) || billingMsg;
              }
            } catch (e) {}

            console.warn('[VideoGen] Billing failed:', billingRes.status, billingMsg);
            if (saveStatus) {
              saveStatus.innerHTML = `<span style="color:#f59e0b;"><i class="fas fa-exclamation-triangle"></i> Video opgeslagen, maar credits afschrijving mislukt: ${billingMsg}</span>`;
            }
          }
        }
        
        // Re-enable button
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.style.opacity = '1';
          saveBtn.style.cursor = 'pointer';
          saveBtn.innerHTML = '<i class="fas fa-check"></i> Opgeslagen!';
          saveBtn.style.background = '#22c55e';
        }

        console.log('[VideoGen] Video saved successfully');

      } catch (error) {
        console.error('[VideoGen] Save error:', error);
        if (saveStatus) saveStatus.innerHTML = `<span style="color:#ef4444;"><i class="fas fa-exclamation-circle"></i> ${error.message}</span>`;
        
        // Re-enable button
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.style.opacity = '1';
          saveBtn.style.cursor = 'pointer';
          saveBtn.innerHTML = '<i class="fas fa-save"></i> Opslaan naar Mijn Video\'s';
        }
      }
    },

    blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    },

    async generateThumbnail(videoElement) {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        
        // Draw current frame
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnail);
      });
    },

    async searchClipsByTheme(searchQuery, displayName) {
      console.log('[VideoGen] Searching clips for theme:', searchQuery);

      try {
        // Check if modal is already open
        const existingOverlay = document.querySelector('.mp-overlay');
        if (existingOverlay) {
          console.warn('[VideoGen] Media Picker already open, closing first...');
          existingOverlay.remove();
        }
        
        // Open Media Picker with search query
        console.log('[VideoGen] Calling MediaPicker.openVideo with:', searchQuery);
        
        const result = await window.MediaPicker.openVideo({ 
          defaultTab: 'pexels',
          searchQuery: searchQuery.trim()
        });
        
        console.log('[VideoGen] MediaPicker returned, result:', result);
        
        if (!result) {
          console.log('[VideoGen] No clip selected');
          return;
        }

        // Add clip to collection
        if (!this.selectedClips) {
          this.selectedClips = [];
        }

        const newClip = {
          url: result.url,
          thumbnail: result.thumbnail || result.url,
          duration: result.duration || 10,
          title: displayName || searchQuery,
          searchTerm: searchQuery,
          destination: 'Freestyle' // No specific destination
        };

        this.selectedClips.push(newClip);
        console.log('[VideoGen] Clip added, total clips:', this.selectedClips.length);

        // Re-render clips
        this.renderSelectedClips();
        
      } catch (error) {
        console.error('[VideoGen] Theme search failed:', error);
        alert(`Fout bij zoeken: ${error.message}`);
      }
    },

    renderSelectedClips() {
      const clipGrid = document.getElementById('clipGrid');
      if (!clipGrid) return;

      if (!this.selectedClips || this.selectedClips.length === 0) {
        clipGrid.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #9ca3af;">
            <i class="fas fa-film" style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;"></i>
            <div>Klik op "Zoek Clips" om video's toe te voegen</div>
            <div style="font-size: 12px; margin-top: 8px;">Zoek op thema: safari, beach, mountains, etc.</div>
          </div>
        `;
        return;
      }

      clipGrid.innerHTML = this.selectedClips.map((clip, index) => `
        <div style="position: relative; border: 2px solid #10b981; border-radius: 8px; overflow: hidden; background: #f9fafb;">
          <img src="${clip.thumbnail}" alt="${clip.title || 'Clip'}" 
            style="width: 100%; height: 120px; object-fit: cover;">
          <div style="padding: 8px;">
            <div style="font-size: 12px; font-weight: 600; color: #111827; margin-bottom: 4px;">
              ${clip.title || clip.searchTerm || 'Clip ' + (index + 1)}
            </div>
            <div style="font-size: 11px; color: #6b7280;">
              ${clip.duration ? Math.round(clip.duration) + 's' : ''}
            </div>
          </div>
          <button onclick="window.VideoGeneratorView.removeClip(${index})" 
            style="position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; border-radius: 50%; background: rgba(239, 68, 68, 0.9); border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <i class="fas fa-times" style="font-size: 12px;"></i>
          </button>
        </div>
      `).join('');
    },

    async importTravelId(container, ideaId) {
      if (!ideaId || !ideaId.trim()) return;

      try {
        const response = await fetch(`/api/ideas/${ideaId.trim()}`);
        if (!response.ok) throw new Error('Reis niet gevonden');
        
        const data = await response.json();
        
        // Update travel data
        this.travelData = data;
        this.selectedClips = [];
        
        // Re-render
        container.innerHTML = this.renderHTML();
        this.attachEventListeners(container);
        this.previewClips();
        
        console.log(`[VideoGen] Reis "${data.title || data.name}" geladen met ${data.destinations?.length || 0} bestemmingen`);
      } catch (error) {
        console.error('[VideoGen] Import failed:', error);
        alert(`Fout bij laden: ${error.message}`);
      }
    },

    getApiBase() {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5050';
      }
      return '';
    }
  };

  // Export globally
  window.VideoGeneratorView = VideoGeneratorView;
})();
