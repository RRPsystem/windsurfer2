// js/views/travelView.js
// Travel Compositor integration view

(function() {
  const TravelView = {
    currentIdea: null,
    micrositeId: null,

    mount(container) {
      if (!container) return;
      
      // Get microsite ID from environment or config
      this.micrositeId = this.getMicrositeId();
      
      container.innerHTML = this.renderHTML();
      this.attachEventListeners(container);
    },

    getMicrositeId() {
      // Try to get from various sources
      return window.TC_MICROSITE_ID || 
             localStorage.getItem('tc_microsite_id') || 
             ''; // Will be prompted if empty
    },

    renderHTML() {
      return `
        <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; color: white;">
            <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">
              <i class="fas fa-plane-departure"></i> Travel Compositor Reizen
            </h1>
            <p style="margin: 0; opacity: 0.9; font-size: 14px;">
              Voer een Travel Compositor ID in om de reis te laden en te bewerken
            </p>
          </div>

          <!-- Input Section -->
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 200px;">
                <label for="tcIdeaIdInput" style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                  <i class="fas fa-hashtag"></i> Travel Compositor ID
                </label>
                <input 
                  type="text" 
                  id="tcIdeaIdInput" 
                  class="form-control" 
                  placeholder="Bijv. 12345"
                  style="width: 100%; height: 40px; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;"
                />
              </div>
              
              <div style="flex: 1; min-width: 200px;">
                <label for="tcMicrositeIdInput" style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;">
                  <i class="fas fa-building"></i> Microsite ID
                </label>
                <input 
                  type="text" 
                  id="tcMicrositeIdInput" 
                  class="form-control" 
                  placeholder="Microsite ID"
                  value="${this.micrositeId}"
                  style="width: 100%; height: 40px; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;"
                />
              </div>

              <button 
                id="loadTravelBtn" 
                class="btn btn-primary"
                style="height: 40px; padding: 0 24px; background: #667eea; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; white-space: nowrap;"
              >
                <i class="fas fa-download"></i> Reis laden
              </button>

              <button 
                id="backToPageModeBtn" 
                class="btn btn-secondary"
                style="height: 40px; padding: 0 20px; background: #6b7280; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; white-space: nowrap;"
              >
                <i class="fas fa-arrow-left"></i> Terug
              </button>
            </div>

            <!-- Quick tips -->
            <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-left: 3px solid #3b82f6; border-radius: 6px;">
              <div style="font-size: 13px; color: #1e40af;">
                <strong><i class="fas fa-info-circle"></i> Tips:</strong>
                <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                  <li>Voer het Travel Compositor ID in van de reis die je wilt laden</li>
                  <li>Het Microsite ID wordt automatisch opgehaald uit je configuratie</li>
                  <li>Na het laden kun je de reis bewerken en publiceren</li>
                </ul>
              </div>
            </div>

            <!-- Test API button -->
            <div style="margin-top: 12px;">
              <button 
                id="testApiBtn" 
                class="btn btn-sm"
                style="height: 32px; padding: 0 16px; background: #6b7280; border: none; border-radius: 6px; color: white; font-size: 12px; cursor: pointer;"
              >
                <i class="fas fa-flask"></i> Test API Configuratie
              </button>
            </div>
          </div>

          <!-- Status/Loading -->
          <div id="travelStatus" style="display: none; padding: 16px; border-radius: 8px; margin-bottom: 24px;"></div>

          <!-- Travel Content -->
          <div id="travelContent" style="display: none;">
            <!-- Will be populated with travel data -->
          </div>
        </div>
      `;
    },

    attachEventListeners(container) {
      const loadBtn = container.querySelector('#loadTravelBtn');
      const backBtn = container.querySelector('#backToPageModeBtn');
      const testApiBtn = container.querySelector('#testApiBtn');
      const ideaInput = container.querySelector('#tcIdeaIdInput');
      const micrositeInput = container.querySelector('#tcMicrositeIdInput');

      if (testApiBtn) {
        testApiBtn.addEventListener('click', async () => {
          await this.testApiConfiguration();
        });
      }

      if (loadBtn) {
        loadBtn.addEventListener('click', async () => {
          const ideaId = ideaInput?.value?.trim();
          const micrositeId = micrositeInput?.value?.trim();

          if (!ideaId) {
            this.showStatus('error', 'Voer een Travel Compositor ID in');
            return;
          }

          if (!micrositeId) {
            this.showStatus('error', 'Voer een Microsite ID in');
            return;
          }

          // Save microsite ID for future use
          this.micrositeId = micrositeId;
          localStorage.setItem('tc_microsite_id', micrositeId);

          await this.loadTravel(ideaId, micrositeId);
        });
      }

      if (backBtn) {
        backBtn.addEventListener('click', () => {
          if (window.WB_setMode) {
            window.WB_setMode('page');
          }
        });
      }

      // Allow Enter key to trigger load
      if (ideaInput) {
        ideaInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            loadBtn?.click();
          }
        });
      }
    },

    async testApiConfiguration() {
      this.showStatus('loading', '<i class="fas fa-circle-notch fa-spin"></i> API configuratie testen...');

      try {
        const apiBase = this.getApiBase();
        const url = `${apiBase}/api/ideas/test`;

        console.log('[TravelView] Testing API configuration:', url);

        const response = await fetch(url);
        const data = await response.json();

        console.log('[TravelView] API test result:', data);

        if (data.ok) {
          this.showStatus('success', `<i class="fas fa-check-circle"></i> API is correct geconfigureerd! (${data.config.authMode})`);
        } else {
          let missing = [];
          if (!data.config.hasBaseUrl) missing.push('TC_BASE_URL');
          if (!data.config.hasMicrositeId) missing.push('TC_MICROSITE_ID');
          if (!data.config.hasToken && !data.config.hasUsername) missing.push('TC_TOKEN of TC_USERNAME/TC_PASSWORD');
          
          this.showStatus('error', `<i class="fas fa-exclamation-circle"></i> Ontbrekende configuratie: ${missing.join(', ')}<br><small>Stel deze in via Vercel Environment Variables</small>`);
        }

        // Auto-hide after 5 seconds
        setTimeout(() => {
          const statusEl = document.getElementById('travelStatus');
          if (statusEl) statusEl.style.display = 'none';
        }, 5000);

      } catch (error) {
        console.error('[TravelView] API test failed:', error);
        this.showStatus('error', `<i class="fas fa-exclamation-circle"></i> API test mislukt: ${error.message}`);
      }
    },

    async loadTravel(ideaId, micrositeId) {
      this.showStatus('loading', '<i class="fas fa-circle-notch fa-spin"></i> Reis aan het laden...');

      try {
        // Determine API endpoint
        const apiBase = this.getApiBase();
        const url = `${apiBase}/api/ideas/${encodeURIComponent(ideaId)}?micrositeId=${encodeURIComponent(micrositeId)}&lang=NL`;

        console.log('[TravelView] Loading travel from:', url);

        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[TravelView] API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          
          // Show detailed error
          let errorMsg = errorData.error || `HTTP ${response.status}`;
          if (errorData.detail) {
            errorMsg += ': ' + (typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail));
          }
          if (errorData.authUrl) {
            console.error('[TravelView] Auth URL used:', errorData.authUrl);
          }
          
          throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log('[TravelView] Travel data loaded:', data);

        this.currentIdea = data;
        this.renderTravelContent(data);
        this.showStatus('success', '<i class="fas fa-check-circle"></i> Reis succesvol geladen!');

        // Hide status after 3 seconds
        setTimeout(() => {
          const statusEl = document.getElementById('travelStatus');
          if (statusEl) statusEl.style.display = 'none';
        }, 3000);

      } catch (error) {
        console.error('[TravelView] Error loading travel:', error);
        
        // Try to parse error response for more details
        let errorMsg = error.message;
        let errorDetails = null;
        
        try {
          const errorText = await response.text();
          errorDetails = JSON.parse(errorText);
          console.error('[TravelView] Error response:', errorDetails);
          
          if (errorDetails.detail) {
            errorMsg = typeof errorDetails.detail === 'string' 
              ? errorDetails.detail 
              : JSON.stringify(errorDetails.detail);
          }
          if (errorDetails.authUrl) {
            console.error('[TravelView] Auth URL:', errorDetails.authUrl);
          }
          if (errorDetails.status) {
            errorMsg = `HTTP ${errorDetails.status}: ${errorMsg}`;
          }
        } catch (e) {
          // Response already consumed or not JSON
        }
        
        this.showStatus('error', `<i class="fas fa-exclamation-circle"></i> Fout bij laden: ${errorMsg}<br><small>Check console voor details</small>`);
      }
    },

    getApiBase() {
      // Check if we're in development with local proxy
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Check if local proxy is running
        return 'http://localhost:5050';
      }
      // In production, use Vercel serverless functions
      return '';
    },

    showStatus(type, message) {
      const statusEl = document.getElementById('travelStatus');
      if (!statusEl) return;

      const colors = {
        loading: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
        success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534' },
        error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' }
      };

      const color = colors[type] || colors.loading;

      statusEl.style.display = 'block';
      statusEl.style.background = color.bg;
      statusEl.style.borderLeft = `3px solid ${color.border}`;
      statusEl.style.color = color.text;
      statusEl.innerHTML = message;
    },

    renderTravelContent(data) {
      const contentEl = document.getElementById('travelContent');
      if (!contentEl) return;

      // Extract key information
      const title = data.name || data.title || 'Reis';
      const description = data.description || data.intro || '';
      const days = data.days || [];
      const price = data.price || data.totalPrice || null;
      const currency = data.currency || 'EUR';
      const duration = data.duration || days.length || 0;
      const destination = data.destination || data.country || '';
      const image = data.image || data.mainImage || data.headerImage || '';

      contentEl.style.display = 'block';
      contentEl.innerHTML = `
        <!-- Travel Header -->
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          ${image ? `
            <div style="margin-bottom: 20px; border-radius: 8px; overflow: hidden; max-height: 300px;">
              <img src="${image}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          ` : ''}
          
          <h2 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; color: #111827;">
            ${title}
          </h2>

          <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 16px; color: #6b7280; font-size: 14px;">
            ${destination ? `
              <div style="display: flex; align-items: center; gap: 6px;">
                <i class="fas fa-map-marker-alt" style="color: #ef4444;"></i>
                <span>${destination}</span>
              </div>
            ` : ''}
            ${duration ? `
              <div style="display: flex; align-items: center; gap: 6px;">
                <i class="fas fa-calendar-days" style="color: #3b82f6;"></i>
                <span>${duration} dagen</span>
              </div>
            ` : ''}
            ${price ? `
              <div style="display: flex; align-items: center; gap: 6px;">
                <i class="fas fa-euro-sign" style="color: #22c55e;"></i>
                <span>${this.formatPrice(price, currency)}</span>
              </div>
            ` : ''}
          </div>

          ${description ? `
            <div style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              ${description}
            </div>
          ` : ''}

          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button id="editTravelBtn" class="btn btn-primary" style="display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-edit"></i> Bewerken in Builder
            </button>
            <button id="viewJsonBtn" class="btn btn-secondary" style="display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-code"></i> Bekijk JSON
            </button>
          </div>
        </div>

        <!-- Days/Itinerary -->
        ${days.length > 0 ? `
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #111827;">
              <i class="fas fa-route"></i> Reisschema
            </h3>
            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${days.map((day, index) => this.renderDay(day, index + 1)).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Raw JSON (hidden by default) -->
        <div id="jsonViewer" style="display: none; background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px; overflow: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; color: #f1f5f9; font-size: 18px;">
              <i class="fas fa-code"></i> Raw JSON Data
            </h3>
            <button id="closeJsonBtn" class="btn btn-sm" style="background: #475569; color: white; border: none; padding: 6px 12px; border-radius: 6px;">
              <i class="fas fa-times"></i> Sluiten
            </button>
          </div>
          <pre style="margin: 0; color: #e2e8f0; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(data, null, 2)}</pre>
        </div>
      `;

      // Attach event listeners for new buttons
      const editBtn = contentEl.querySelector('#editTravelBtn');
      const viewJsonBtn = contentEl.querySelector('#viewJsonBtn');
      const closeJsonBtn = contentEl.querySelector('#closeJsonBtn');
      const jsonViewer = contentEl.querySelector('#jsonViewer');

      if (editBtn) {
        editBtn.addEventListener('click', () => {
          this.editInBuilder(data);
        });
      }

      if (viewJsonBtn && jsonViewer) {
        viewJsonBtn.addEventListener('click', () => {
          jsonViewer.style.display = jsonViewer.style.display === 'none' ? 'block' : 'none';
        });
      }

      if (closeJsonBtn && jsonViewer) {
        closeJsonBtn.addEventListener('click', () => {
          jsonViewer.style.display = 'none';
        });
      }
    },

    renderDay(day, dayNumber) {
      const title = day.title || day.name || `Dag ${dayNumber}`;
      const description = day.description || day.text || '';
      const activities = day.activities || [];
      const accommodation = day.accommodation || day.hotel || null;
      const transport = day.transport || [];

      return `
        <div style="border-left: 3px solid #667eea; padding-left: 16px; position: relative;">
          <div style="position: absolute; left: -12px; top: 0; width: 20px; height: 20px; background: #667eea; border-radius: 50%; border: 3px solid white;"></div>
          
          <div style="font-weight: 700; font-size: 18px; color: #111827; margin-bottom: 8px;">
            ${title}
          </div>

          ${description ? `
            <div style="color: #6b7280; margin-bottom: 12px; line-height: 1.5;">
              ${description}
            </div>
          ` : ''}

          ${activities.length > 0 ? `
            <div style="margin-top: 12px;">
              <div style="font-weight: 600; color: #374151; margin-bottom: 6px; font-size: 14px;">
                <i class="fas fa-hiking"></i> Activiteiten:
              </div>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
                ${activities.map(act => `<li>${act.name || act.title || act}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${accommodation ? `
            <div style="margin-top: 12px; display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 14px;">
              <i class="fas fa-hotel" style="color: #f59e0b;"></i>
              <span>${accommodation.name || accommodation}</span>
            </div>
          ` : ''}

          ${transport.length > 0 ? `
            <div style="margin-top: 12px;">
              <div style="font-weight: 600; color: #374151; margin-bottom: 6px; font-size: 14px;">
                <i class="fas fa-plane"></i> Transport:
              </div>
              <div style="color: #6b7280; font-size: 14px;">
                ${transport.map(t => t.type || t.name || t).join(', ')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    },

    formatPrice(price, currency) {
      const num = typeof price === 'number' ? price : parseFloat(price);
      if (isNaN(num)) return price;

      const formatted = new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: currency || 'EUR'
      }).format(num);

      return formatted;
    },

    editInBuilder(data) {
      console.log('[TravelView] editInBuilder called with data:', data);
      // Switch to page mode and load the travel data into the builder
      if (window.websiteBuilder && typeof window.websiteBuilder.loadTravelIdea === 'function') {
        console.log('[TravelView] Calling websiteBuilder.loadTravelIdea...');
        window.websiteBuilder.loadTravelIdea(data);
        console.log('[TravelView] Switching to page mode...');
        if (window.WB_setMode) {
          window.WB_setMode('page');
        }
      } else {
        console.error('[TravelView] Builder not available!', {
          hasWebsiteBuilder: !!window.websiteBuilder,
          hasLoadTravelIdea: typeof window.websiteBuilder?.loadTravelIdea
        });
        alert('Builder functie nog niet beschikbaar. Implementeer websiteBuilder.loadTravelIdea()');
      }
    }
  };

  // Expose globally
  window.TravelView = TravelView;
  console.log('[TravelView] ✅ Module loaded and registered successfully');
  
  // Dispatch event to notify router that TravelView is ready
  try {
    window.dispatchEvent(new CustomEvent('travelViewReady'));
  } catch (e) {}
})();
