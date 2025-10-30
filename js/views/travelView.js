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
        <div style="max-width: 100%; margin: 0 auto; padding: 20px; max-height: 90vh; overflow-y: auto;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 20px; margin-bottom: 20px; color: white;">
            <h1 style="margin: 0 0 4px 0; font-size: 24px; font-weight: 700;">
              <i class="fas fa-plane-departure"></i> Reis Toevoegen
            </h1>
            <p style="margin: 0; opacity: 0.9; font-size: 13px;">
              Kies hoe je de reis wilt aanmaken
            </p>
          </div>

          <!-- Import Method Selection (Compact 4 Buttons) -->
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #111827;">
              <i class="fas fa-wand-magic-sparkles"></i> Selecteer Import Methode
            </h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 16px;">
              <!-- Method 1: Travel Compositor -->
              <div class="import-method-card" data-method="tc" style="
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                box-shadow: 0 4px 12px -2px rgba(102, 126, 234, 0.3);
                transform: translateY(0);
              ">
                <div style="text-align: center; color: white;">
                  <div style="font-size: 32px; margin-bottom: 8px;">
                    <i class="fas fa-link"></i>
                  </div>
                  <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Travel Compositor</div>
                  <div style="font-size: 11px; opacity: 0.9;">Importeer via TC ID</div>
                </div>
              </div>

              <!-- Method 2: PDF Upload -->
              <div class="import-method-card" data-method="pdf" style="
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
                box-shadow: 0 4px 12px -2px rgba(245, 158, 11, 0.3);
                transform: translateY(0);
              ">
                <div style="text-align: center; color: white;">
                  <div style="font-size: 32px; margin-bottom: 8px;">
                    <i class="fas fa-file-pdf"></i>
                  </div>
                  <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">PDF Upload</div>
                  <div style="font-size: 11px; opacity: 0.9;">Boekingsbevestiging</div>
                </div>
              </div>

              <!-- Method 3: URL Import -->
              <div class="import-method-card" data-method="url" style="
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
                box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.3);
                transform: translateY(0);
              ">
                <div style="text-align: center; color: white;">
                  <div style="font-size: 32px; margin-bottom: 8px;">
                    <i class="fas fa-globe"></i>
                  </div>
                  <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">URL Importeren</div>
                  <div style="font-size: 11px; opacity: 0.9;">Online booking</div>
                </div>
              </div>

              <!-- Method 4: Manual -->
              <div class="import-method-card" data-method="manual" style="
                border-radius: 12px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                box-shadow: 0 4px 12px -2px rgba(139, 92, 246, 0.3);
                transform: translateY(0);
              ">
                <div style="text-align: center; color: white;">
                  <div style="font-size: 32px; margin-bottom: 8px;">
                    <i class="fas fa-pencil"></i>
                  </div>
                  <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">Handmatig</div>
                  <div style="font-size: 11px; opacity: 0.9;">Zelf samenstellen</div>
                </div>
              </div>
            </div>

            <div style="text-align: center;">
              <button 
                id="backToPageModeBtn" 
                style="height: 36px; padding: 0 20px; background: #6b7280; border: none; border-radius: 8px; color: white; font-weight: 600; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;"
              >
                <i class="fas fa-arrow-left"></i> Terug
              </button>
            </div>
          </div>

          <!-- Dynamic Content Area -->
          <div id="methodContent" style="display: none;"></div>

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
      const backBtn = container.querySelector('#backToPageModeBtn');
      const methodCards = container.querySelectorAll('.import-method-card');
      const methodContent = container.querySelector('#methodContent');

      this.selectedTemplate = '1';

      methodCards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 20px 35px -5px rgba(0, 0, 0, 0.3)';
        });
        card.addEventListener('mouseleave', (e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2)';
        });
        card.addEventListener('click', () => {
          const method = card.dataset.method;
          console.log('[TravelView] Import method selected:', method);
          this.currentMethod = method;
          this.showMethodContent(method, methodContent);
        });
      });

      if (backBtn) {
        backBtn.addEventListener('click', () => {
          if (window.WB_setMode) window.WB_setMode('page');
        });
      }
    },

    showMethodContent(method, container) {
      if (!container) return;
      container.style.display = 'block';
      setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
      switch(method) {
        case 'tc': this.renderTCForm(container); break;
        case 'pdf': this.renderPDFUpload(container); break;
        case 'url': this.renderURLImport(container); break;
        case 'manual': this.renderManualMode(container); break;
      }
    },

    renderTemplateSelector() {
      return `<div style="padding-top: 16px; border-top: 1px solid #e5e7eb; margin-top: 16px;">
        <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #374151; font-size: 13px;"><i class="fas fa-palette"></i> Kies Reis Template</label>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;">
          <div class="template-card" data-template="1" style="position: relative; border: 2px solid #a5b4fc; border-radius: 8px; padding: 8px; cursor: pointer; background: #f5f7ff;">
            <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 100%); border-radius: 4px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; color: #4f46e5; font-size: 18px;"><i class="fas fa-plane-departure"></i></div>
            <div style="font-weight: 600; font-size: 11px; color: #374151; text-align: center;">Standaard</div>
          </div>
          <div class="template-card" data-template="2" style="position: relative; border: 2px solid #e5e7eb; border-radius: 8px; padding: 8px; cursor: not-allowed; background: #f9fafb; opacity: 0.6;">
            <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, #fed7aa 0%, #fecaca 100%); border-radius: 4px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; color: #dc2626; font-size: 18px;"><i class="fas fa-mountain"></i></div>
            <div style="font-weight: 600; font-size: 11px; color: #6b7280; text-align: center;">Avontuur</div>
            <div style="position: absolute; top: 4px; right: 4px; background: #fbbf24; color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 700;">SOON</div>
          </div>
          <div class="template-card" data-template="3" style="position: relative; border: 2px solid #e5e7eb; border-radius: 8px; padding: 8px; cursor: not-allowed; background: #f9fafb; opacity: 0.6;">
            <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, #a7f3d0 0%, #a5f3fc 100%); border-radius: 4px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; color: #059669; font-size: 18px;"><i class="fas fa-umbrella-beach"></i></div>
            <div style="font-weight: 600; font-size: 11px; color: #6b7280; text-align: center;">Strand & Zon</div>
            <div style="position: absolute; top: 4px; right: 4px; background: #fbbf24; color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 700;">SOON</div>
          </div>
          <div class="template-card" data-template="4" style="position: relative; border: 2px solid #e5e7eb; border-radius: 8px; padding: 8px; cursor: not-allowed; background: #f9fafb; opacity: 0.6;">
            <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, #fdba74 0%, #fca5a5 100%); border-radius: 4px; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; color: #dc2626; font-size: 18px;"><i class="fas fa-ticket"></i></div>
            <div style="font-weight: 600; font-size: 11px; color: #6b7280; text-align: center;">Voucher</div>
            <div style="position: absolute; top: 4px; right: 4px; background: #fbbf24; color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 700;">SOON</div>
          </div>
        </div>
      </div>`;
    },

    attachTemplateListeners(container) {
      const templateCards = container.querySelectorAll('.template-card');
      templateCards.forEach(card => {
        card.addEventListener('click', () => {
          templateCards.forEach(c => { c.style.border = '2px solid #e5e7eb'; c.style.background = 'white'; });
          this.selectedTemplate = card.dataset.template;
          card.style.border = '2px solid #667eea';
          card.style.background = '#f8f9ff';
        });
      });
    },

    renderTCForm(container) {
      container.innerHTML = `<div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #111827;"><i class="fas fa-link" style="color: #667eea;"></i> Travel Compositor Import</h3>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">
          <div style="flex: 1; min-width: 200px;"><label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;"><i class="fas fa-hashtag"></i> Travel Compositor ID</label>
            <input type="text" id="tcIdeaIdInput" placeholder="Bijv. 12345" style="width: 100%; height: 40px; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px;" /></div>
          <div style="flex: 1; min-width: 200px;"><label style="display: block; margin-bottom: 6px; font-weight: 600; color: #374151; font-size: 14px;"><i class="fas fa-building"></i> Microsite ID</label>
            <input type="text" id="tcMicrositeIdInput" value="${this.micrositeId}" style="width: 100%; height: 40px; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px;" /></div>
        </div>
        ${this.renderTemplateSelector()}
        <div style="display: flex; gap: 12px; margin-top: 20px;">
          <button id="loadTravelBtn" style="height: 48px; padding: 0 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; border-radius: 8px; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;"><i class="fas fa-download"></i> Reis Laden</button>
          <button id="testApiBtn" style="height: 48px; padding: 0 24px; background: #6b7280; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;"><i class="fas fa-flask"></i> Test API</button>
        </div>
      </div>`;
      const loadBtn = container.querySelector('#loadTravelBtn');
      const testBtn = container.querySelector('#testApiBtn');
      const ideaInput = container.querySelector('#tcIdeaIdInput');
      const micrositeInput = container.querySelector('#tcMicrositeIdInput');
      this.attachTemplateListeners(container);
      if (loadBtn) {
        loadBtn.addEventListener('click', async () => {
          const ideaId = ideaInput?.value?.trim();
          const micrositeId = micrositeInput?.value?.trim();
          if (!ideaId || !micrositeId) { this.showStatus('error', 'Voer beide velden in'); return; }
          this.micrositeId = micrositeId;
          localStorage.setItem('tc_microsite_id', micrositeId);
          await this.loadTravel(ideaId, micrositeId, this.selectedTemplate);
        });
      }
      if (testBtn) testBtn.addEventListener('click', () => this.testApiConfiguration());
      if (ideaInput) ideaInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') loadBtn?.click(); });
    },

    renderPDFUpload(container) {
      container.innerHTML = `<div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #111827;"><i class="fas fa-file-pdf" style="color: #ef4444;"></i> PDF Boekingsbevestiging</h3>
        <div id="pdfDropZone" style="border: 2px dashed #d1d5db; border-radius: 12px; padding: 40px; text-align: center; background: #f9fafb; margin-bottom: 24px; transition: all 0.2s;">
          <div style="font-size: 48px; color: #9ca3af; margin-bottom: 16px;"><i class="fas fa-cloud-upload-alt"></i></div>
          <div style="font-weight: 600; color: #374151; margin-bottom: 8px;">Sleep PDF hier of klik om te uploaden</div>
          <div style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">Max 10MB</div>
          <input type="file" id="pdfFileInput" accept=".pdf" style="display: none;" />
          <button id="selectPdfBtn" style="height: 40px; padding: 0 24px; background: #ef4444; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;"><i class="fas fa-file-upload"></i> Selecteer PDF</button>
        </div>
        <div id="pdfPreview" style="display: none; padding: 16px; background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <i class="fas fa-file-pdf" style="font-size: 32px; color: #ef4444;"></i>
            <div style="flex: 1;">
              <div id="pdfFileName" style="font-weight: 600; color: #374151;"></div>
              <div id="pdfFileSize" style="font-size: 14px; color: #6b7280;"></div>
            </div>
            <button id="removePdfBtn" style="padding: 8px 16px; background: #ef4444; border: none; border-radius: 6px; color: white; cursor: pointer;"><i class="fas fa-times"></i></button>
          </div>
        </div>
        ${this.renderTemplateSelector()}
        <button id="uploadPdfBtn" disabled style="height: 48px; padding: 0 32px; background: #9ca3af; border: none; border-radius: 8px; color: white; font-weight: 700; cursor: not-allowed; display: flex; align-items: center; gap: 8px; margin-top: 20px;"><i class="fas fa-magic"></i> PDF Uitlezen & Reis Maken</button>
        <div style="margin-top: 16px; padding: 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 6px; font-size: 13px; color: #1e40af;">
          <strong><i class="fas fa-info-circle"></i> Wat wordt uitgelezen:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            <li>Vluchtgegevens (PNR, tijden, vluchtnummers)</li>
            <li>Hotelgegevens (naam, adres, kamertype)</li>
            <li>Klantgegevens en aantal personen</li>
            <li>Datums en prijzen</li>
          </ul>
        </div>
      </div>`;
      
      this.attachTemplateListeners(container);
      
      const selectBtn = container.querySelector('#selectPdfBtn');
      const fileInput = container.querySelector('#pdfFileInput');
      const uploadBtn = container.querySelector('#uploadPdfBtn');
      const preview = container.querySelector('#pdfPreview');
      const removeBtn = container.querySelector('#removePdfBtn');
      const dropZone = container.querySelector('#pdfDropZone');
      
      let selectedFile = null;
      
      // File select
      selectBtn?.addEventListener('click', () => fileInput?.click());
      
      // File input change
      fileInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
          selectedFile = file;
          this.showPDFPreview(file, preview, uploadBtn);
        } else if (file) {
          this.showStatus('error', 'Alleen PDF bestanden zijn toegestaan');
        }
      });
      
      // Drag and drop
      dropZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ef4444';
        dropZone.style.background = '#fef2f2';
      });
      
      dropZone?.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#d1d5db';
        dropZone.style.background = '#f9fafb';
      });
      
      dropZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#d1d5db';
        dropZone.style.background = '#f9fafb';
        
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type === 'application/pdf') {
          selectedFile = file;
          fileInput.files = e.dataTransfer.files;
          this.showPDFPreview(file, preview, uploadBtn);
        } else if (file) {
          this.showStatus('error', 'Alleen PDF bestanden zijn toegestaan');
        }
      });
      
      // Remove file
      removeBtn?.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        preview.style.display = 'none';
        uploadBtn.disabled = true;
        uploadBtn.style.background = '#9ca3af';
        uploadBtn.style.cursor = 'not-allowed';
      });
      
      // Upload and parse
      uploadBtn?.addEventListener('click', async () => {
        if (!selectedFile) return;
        await this.uploadAndParsePDF(selectedFile, this.selectedTemplate);
      });
    },
    
    showPDFPreview(file, preview, uploadBtn) {
      preview.style.display = 'block';
      preview.querySelector('#pdfFileName').textContent = file.name;
      preview.querySelector('#pdfFileSize').textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
      uploadBtn.disabled = false;
      uploadBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)';
      uploadBtn.style.cursor = 'pointer';
    },
    
    async uploadAndParsePDF(file, template) {
      this.showStatus('loading', '<i class="fas fa-circle-notch fa-spin"></i> PDF aan het uitlezen...');
      
      try {
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('template', template);
        
        const apiBase = this.getApiBase();
        const response = await fetch(`${apiBase}/api/booking/parse`, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || error.error || 'PDF parsing failed');
        }
        
        const result = await response.json();
        console.log('[TravelView] PDF parsed successfully:', result);
        
        this.showStatus('success', '<i class="fas fa-check-circle"></i> PDF succesvol uitgelezen!');
        
        // Convert booking data to travel idea format
        const travelData = this.convertBookingToTravel(result.data);
        
        // DEBUG: Log the final travel data being sent
        console.log('[TravelView] ===== FINAL TRAVEL DATA =====');
        console.log('[TravelView] Transports:', JSON.stringify(travelData.transports, null, 2));
        console.log('[TravelView] Hotels:', JSON.stringify(travelData.hotels, null, 2));
        console.log('[TravelView] Destinations:', JSON.stringify(travelData.destinations, null, 2));
        console.log('[TravelView] ==============================');
        
        // Store for debugging
        window.lastTravelData = travelData;
        
        setTimeout(() => {
          if (window.websiteBuilder && window.websiteBuilder.loadTravelIdea) {
            console.log('[TravelView] Calling loadTravelIdea with:', travelData);
            window.websiteBuilder.loadTravelIdea(travelData);
            if (window.WB_setMode) window.WB_setMode('page');
          }
        }, 1000);
        
      } catch (error) {
        console.error('[TravelView] PDF upload error:', error);
        this.showStatus('error', `<i class="fas fa-exclamation-circle"></i> Fout: ${error.message}`);
      }
    },
    
    convertBookingToTravel(bookingData) {
      console.log('[TravelView] Converting booking data:', bookingData);
      
      // Support both old 'flights' and new 'transports' format
      const rawTransports = bookingData.transports || bookingData.flights || [];
      console.log('[TravelView] Raw transports found:', rawTransports);
      
      // Convert to TC transport format
      const transports = rawTransports.map((transport, idx) => {
        console.log(`[TravelView] Converting transport ${idx}:`, transport);
        
        const converted = {
          type: transport.type || 'flight',
          departureCity: transport.from || transport.departureCity || '',
          arrivalCity: transport.to || transport.arrivalCity || '',
          from: transport.from || transport.departureCity || '',
          to: transport.to || transport.arrivalCity || '',
          departureDate: transport.date || transport.departureDate || '',
          departureTime: transport.time || transport.departureTime || '',
          flightNumber: transport.transportNumber || transport.flightNumber || '',
          airline: transport.carrier || transport.airline || '',
          duration: transport.duration || '',
          class: transport.class || ''
        };
        
        console.log(`[TravelView] Converted transport:`, converted);
        return converted;
      });
      
      console.log('[TravelView] All transports:', transports);
      
      // Convert hotel to hotels array (TC format)
      const hotels = [];
      if (bookingData.hotel) {
        hotels.push({
          name: bookingData.hotel.name || 'Hotel',
          hotelName: bookingData.hotel.name || 'Hotel',
          address: bookingData.hotel.address || '',
          checkIn: bookingData.hotel.checkIn || '',
          checkOut: bookingData.hotel.checkOut || '',
          roomType: bookingData.hotel.roomType || '',
          nights: bookingData.hotel.nights || 0,
          stars: 4, // Default
          board: 'Logies & Ontbijt'
        });
      }
      
      // Create destinations array from title or last transport destination
      const destinations = [];
      
      // Try to get destination from title
      let destinationName = bookingData.title || '';
      
      // Or from last transport arrival
      if (!destinationName && transports.length > 0) {
        const lastTransport = transports[transports.length - 1];
        destinationName = lastTransport.to || lastTransport.arrivalCity || '';
      }
      
      // Or from hotel address (last resort, take city part)
      if (!destinationName && bookingData.hotel?.address) {
        // Try to extract city from address (usually last part before country)
        const addressParts = bookingData.hotel.address.split(',').map(p => p.trim());
        destinationName = addressParts.length > 1 ? addressParts[addressParts.length - 2] : addressParts[0];
      }
      
      if (destinationName) {
        destinations.push({
          name: destinationName,
          title: destinationName,
          description: bookingData.hotel ? `Verblijf in ${bookingData.hotel.name || 'hotel'}` : '',
          nights: bookingData.hotel?.nights || 0
        });
      }
      
      // Convert to TC format
      const travelData = {
        name: bookingData.title || 'Nieuwe Reis',
        title: bookingData.title || 'Nieuwe Reis',
        description: bookingData.bookingReference 
          ? `Boeking ${bookingData.bookingReference}` 
          : 'Geïmporteerd uit PDF',
        bookingReference: bookingData.bookingReference,
        
        // TC format arrays
        transports: transports,
        hotels: hotels,
        destinations: destinations,
        transfers: [], // Can be added later
        
        // Additional data
        travelers: bookingData.travelers || [],
        price: {
          total: bookingData.price?.total || 0,
          currency: bookingData.price?.currency || 'EUR'
        },
        dates: bookingData.dates || {
          departure: rawTransports[0]?.date,
          return: rawTransports[rawTransports.length - 1]?.date
        }
      };
      
      console.log('[TravelView] Converted to TC format:', travelData);
      return travelData;
    },

    renderURLImport(container) {
      container.innerHTML = `<div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #111827;"><i class="fas fa-globe" style="color: #10b981;"></i> URL Importeren</h3>
        <div style="margin-bottom: 24px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;"><i class="fas fa-link"></i> Booking URL</label>
          <input type="url" id="urlInput" placeholder="https://example.com/booking/12345" style="width: 100%; height: 48px; padding: 0 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;" />
          <div style="font-size: 13px; color: #6b7280; margin-top: 6px;">Plak de volledige URL van de boekingspagina</div>
        </div>
        ${this.renderTemplateSelector()}
        <button id="importUrlBtn" style="height: 48px; padding: 0 32px; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); border: none; border-radius: 8px; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-top: 20px;"><i class="fas fa-download"></i> URL Importeren & Reis Maken</button>
        <div style="margin-top: 16px; padding: 12px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 6px; font-size: 13px; color: #1e40af;">
          <strong><i class="fas fa-info-circle"></i> Wat wordt uitgelezen:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            <li>Complete reisgegevens van de website</li>
            <li>Vlucht-, hotel- en activiteiteninfo</li>
            <li>Prijzen, datums en inclusies</li>
            <li>Foto's en beschrijvingen</li>
          </ul>
        </div>
      </div>`;
      
      this.attachTemplateListeners(container);
      
      const importBtn = container.querySelector('#importUrlBtn');
      const urlInput = container.querySelector('#urlInput');
      
      importBtn?.addEventListener('click', async () => {
        const url = urlInput?.value?.trim();
        if (!url) {
          this.showStatus('error', 'Voer een geldige URL in');
          return;
        }
        
        // Validate URL format
        try {
          new URL(url);
        } catch (e) {
          this.showStatus('error', 'Ongeldige URL. Zorg dat de URL begint met http:// of https://');
          return;
        }
        
        await this.importFromURL(url, this.selectedTemplate);
      });
      
      // Enter key support
      urlInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') importBtn?.click();
      });
    },
    
    async importFromURL(url, template) {
      this.showStatus('loading', '<i class="fas fa-circle-notch fa-spin"></i> Website aan het uitlezen...');
      
      try {
        const apiBase = this.getApiBase();
        const response = await fetch(`${apiBase}/api/booking/url-import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url, template })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || error.error || 'URL import failed');
        }
        
        const result = await response.json();
        console.log('[TravelView] URL imported successfully:', result);
        
        this.showStatus('success', '<i class="fas fa-check-circle"></i> Website succesvol uitgelezen!');
        
        // Load into builder
        setTimeout(() => {
          if (window.websiteBuilder && window.websiteBuilder.loadTravelIdea) {
            window.websiteBuilder.loadTravelIdea(result.data);
            if (window.WB_setMode) window.WB_setMode('page');
          }
        }, 1000);
        
      } catch (error) {
        console.error('[TravelView] URL import error:', error);
        this.showStatus('error', `<i class="fas fa-exclamation-circle"></i> Fout: ${error.message}`);
      }
    },

    renderManualMode(container) {
      container.innerHTML = `<div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #111827;"><i class="fas fa-pencil" style="color: #8b5cf6;"></i> Handmatig Samenstellen</h3>
        <div style="margin-bottom: 24px;"><label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;"><i class="fas fa-heading"></i> Reis Titel</label>
          <input type="text" id="manualTitleInput" placeholder="Bijv. Rondreis Japan" style="width: 100%; height: 48px; padding: 0 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;" /></div>
        ${this.renderTemplateSelector()}
        <button id="startManualBtn" style="height: 48px; padding: 0 32px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); border: none; border-radius: 8px; color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-top: 20px;"><i class="fas fa-play"></i> Start met Lege Template</button>
        <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-left: 3px solid #3b82f6; border-radius: 6px; font-size: 13px; color: #1e40af;"><strong><i class="fas fa-info-circle"></i> Info:</strong> Start met lege template en voeg reiskaarten toe</div>
      </div>`;
      this.attachTemplateListeners(container);
      const startBtn = container.querySelector('#startManualBtn');
      const titleInput = container.querySelector('#manualTitleInput');
      startBtn?.addEventListener('click', () => {
        const title = titleInput?.value?.trim() || 'Nieuwe Reis';
        if (window.websiteBuilder && window.websiteBuilder.loadTravelIdea) {
          window.websiteBuilder.loadTravelIdea({ name: title, title });
          if (window.WB_setMode) window.WB_setMode('page');
        } else {
          this.showStatus('error', 'Builder niet beschikbaar');
        }
      });
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

    async loadTravel(ideaId, micrositeId, template = '1') {
      this.showStatus('loading', `<i class="fas fa-circle-notch fa-spin"></i> Reis aan het laden met Template ${template}...`);

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
            <button id="generateVideoBtn" class="btn btn-video" style="display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); border: none; color: white;">
              <i class="fas fa-video"></i> Maak Video
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
      const generateVideoBtn = contentEl.querySelector('#generateVideoBtn');
      const viewJsonBtn = contentEl.querySelector('#viewJsonBtn');
      const closeJsonBtn = contentEl.querySelector('#closeJsonBtn');
      const jsonViewer = contentEl.querySelector('#jsonViewer');

      if (editBtn) {
        editBtn.addEventListener('click', () => {
          this.editInBuilder(data);
        });
      }

      if (generateVideoBtn) {
        generateVideoBtn.addEventListener('click', () => {
          this.openVideoGenerator(data);
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
    },

    openVideoGenerator(data) {
      console.log('[TravelView] Opening video generator with data:', data);
      
      // Check if VideoGeneratorView is loaded
      if (!window.VideoGeneratorView) {
        console.error('[TravelView] VideoGeneratorView not loaded!');
        alert('Video generator nog niet geladen. Herlaad de pagina.');
        return;
      }

      // Get or create video generator container
      let container = document.getElementById('videoGeneratorContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'videoGeneratorContainer';
        container.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #f9fafb; z-index: 10000; overflow-y: auto;';
        document.body.appendChild(container);
      }

      // Mount video generator
      window.VideoGeneratorView.mount(container, data);
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
