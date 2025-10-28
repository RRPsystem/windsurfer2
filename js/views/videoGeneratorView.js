// js/views/videoGeneratorView.js
// Video Generator View - Creates promotional videos from travel itineraries

(function() {
  const VideoGeneratorView = {
    travelData: null,
    selectedClips: [],
    voiceoverFile: null,
    renderId: null,
    statusInterval: null,

    mount(container, travelData) {
      if (!container) return;
      
      this.travelData = travelData;
      container.innerHTML = this.renderHTML();
      this.attachEventListeners(container);
      
      // Auto-preview clips if destinations available
      if (travelData && travelData.destinations && travelData.destinations.length > 0) {
        this.previewClips();
      }
    },

    renderHTML() {
      const destinations = this.travelData?.destinations || [];
      const title = this.travelData?.title || this.travelData?.name || 'Jouw Reis';
      
      return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; color: white;">
            <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">
              <i class="fas fa-video"></i> Video Generator
            </h1>
            <p style="margin: 0; opacity: 0.9; font-size: 14px;">
              Maak een promotievideo van deze reis met AI-geselecteerde clips
            </p>
          </div>

          <!-- Travel Info -->
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #111827;">
              <i class="fas fa-plane-departure"></i> ${title}
            </h2>
            <div style="color: #6b7280; font-size: 14px;">
              ${destinations.length} bestemmingen
            </div>
          </div>

          <!-- Clip Preview -->
          <div id="clipPreview" style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #111827;">
              <i class="fas fa-film"></i> Video Clips
            </h3>
            <div id="clipGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
              <div style="text-align: center; padding: 40px; color: #9ca3af;">
                <i class="fas fa-circle-notch fa-spin" style="font-size: 32px; margin-bottom: 12px;"></i>
                <div>Clips laden...</div>
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
                <i class="fas fa-clock"></i> Duur per bestemming (seconden)
              </label>
              <input type="range" id="clipDuration" min="2" max="5" value="3" step="0.5" 
                style="width: 100%; height: 6px; border-radius: 5px; background: #e5e7eb; outline: none;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; margin-top: 4px;">
                <span>2s</span>
                <span id="durationValue">3s</span>
                <span>5s</span>
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
      if (!window.MediaPicker || !window.MediaPicker.openVideo) {
        alert('Media Picker niet beschikbaar. Herlaad de pagina.');
        return;
      }
      
      // Open Media Picker in video mode with Pexels tab
      const result = await window.MediaPicker.openVideo({ 
        defaultTab: 'pexels',
        searchQuery: `${destination} travel aerial city`
      });
      
      if (result && result.source === 'pexels') {
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
        const destinations = this.travelData?.destinations?.map(d => ({
          name: d.name || d.title || d
        })) || [];

        const payload = {
          destinations,
          title: this.travelData?.title || this.travelData?.name || 'Jouw Reis',
          voiceoverUrl: this.voiceoverFile,
          duration: parseFloat(durationSlider?.value || 3)
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
        
        if (!response.ok) {
          // Try to parse JSON error, fallback to text
          let errorMessage = 'Video generatie mislukt';
          try {
            const error = await response.json();
            errorMessage = error.message || error.error || errorMessage;
          } catch (e) {
            // Not JSON, try text
            const text = await response.text();
            console.error('[VideoGen] Server error (non-JSON):', text);
            errorMessage = `Server error (${response.status}): ${text.substring(0, 100)}`;
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
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
      if (resultVideo) resultVideo.src = videoUrl;
      if (downloadBtn) downloadBtn.href = videoUrl;
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

      if (saveStatus) saveStatus.innerHTML = '<span style="color:#6b7280;"><i class="fas fa-circle-notch fa-spin"></i> Video wordt geüpload...</span>';

      try {
        // Convert video to base64
        const videoBlob = await fetch(resultVideo.src).then(r => r.blob());
        const base64Video = await this.blobToBase64(videoBlob);

        // Generate thumbnail from video
        const thumbnail = await this.generateThumbnail(resultVideo);

        // Upload to Blob Storage
        const response = await fetch('/api/videos/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoData: base64Video,
            title: videoName,
            type: 'ai-generated',
            duration: resultVideo.duration || 0,
            width: resultVideo.videoWidth || 1920,
            height: resultVideo.videoHeight || 1080,
            thumbnail: thumbnail
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || 'Upload mislukt');
        }

        const result = await response.json();

        if (saveStatus) saveStatus.innerHTML = '<span style="color:#22c55e;"><i class="fas fa-check-circle"></i> Video opgeslagen! Beschikbaar in "Mijn Video\'s"</span>';
        
        // Re-enable button
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.style.opacity = '1';
          saveBtn.style.cursor = 'pointer';
          saveBtn.innerHTML = '<i class="fas fa-check"></i> Opgeslagen!';
          saveBtn.style.background = '#22c55e';
        }

        console.log('[VideoGen] Video saved:', result.video);

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
