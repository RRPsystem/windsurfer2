// Hotel Picker Modal for Accommodation API
class HotelPicker {
  static open() {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'mp-overlay';
      
      const drawer = document.createElement('div');
      drawer.className = 'mp-drawer hotel-picker-drawer';

      const header = document.createElement('div');
      header.className = 'mp-header';
      header.innerHTML = `
        <h3>🏨 Hotel Zoeken</h3>
        <button class="mp-close"><i class="fas fa-times"></i></button>
      `;

      const body = document.createElement('div');
      body.className = 'mp-body';
      body.innerHTML = `
        <div class="hotel-search-container">
          <div class="mp-row" style="gap: 8px;">
            <input type="text" class="form-control hotel-query" placeholder="Zoek op naam (bijv. Hilton Paris)" />
            <select class="form-control hotel-country" style="width: 150px;">
              <option value="">Alle landen</option>
              <option value="ES">Spanje</option>
              <option value="FR">Frankrijk</option>
              <option value="IT">Italië</option>
              <option value="NL">Nederland</option>
              <option value="DE">Duitsland</option>
              <option value="GB">Verenigd Koninkrijk</option>
              <option value="US">Verenigde Staten</option>
            </select>
            <button class="btn btn-primary btn-lg hotel-search"><i class="fas fa-search"></i> Zoeken</button>
          </div>
          
          <div class="hotel-results"></div>
          
          <div class="mp-row mp-between mp-more-row">
            <p class="hotel-note"></p>
          </div>
        </div>
      `;

      drawer.appendChild(header);
      drawer.appendChild(body);
      document.body.appendChild(overlay);
      document.body.appendChild(drawer);

      requestAnimationFrame(() => {
        overlay.classList.add('open');
        drawer.classList.add('open');
      });

      const close = () => {
        overlay.classList.remove('open');
        drawer.classList.remove('open');
        setTimeout(() => {
          try {
            if (overlay && overlay.parentNode) document.body.removeChild(overlay);
            if (drawer && drawer.parentNode) document.body.removeChild(drawer);
          } catch (err) {}
        }, 200);
        resolve(null);
      };
      
      header.querySelector('.mp-close').onclick = close;
      overlay.onclick = (e) => { if (e.target === overlay) close(); };

      const queryInput = body.querySelector('.hotel-query');
      const countrySelect = body.querySelector('.hotel-country');
      const searchBtn = body.querySelector('.hotel-search');
      const resultsDiv = body.querySelector('.hotel-results');
      const noteEl = body.querySelector('.hotel-note');

      let allHotels = [];

      const loadHotels = async () => {
        try {
          searchBtn.disabled = true;
          searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Laden...';
          noteEl.textContent = 'Hotels laden...';
          resultsDiv.innerHTML = '';

          const response = await fetch('/api/accommodations?first=0&limit=1000');
          if (!response.ok) throw new Error('Failed to fetch hotels');
          
          const data = await response.json();
          allHotels = data.accommodations || [];
          
          noteEl.textContent = `${allHotels.length} hotels geladen`;
          searchHotels();
        } catch (error) {
          console.error('[Hotel Picker] Error:', error);
          noteEl.textContent = 'Error: Werkt alleen lokaal met npm run dev';
          resultsDiv.innerHTML = '<p style="color: #ff6b6b; padding: 20px; background: #fff5f5; border-radius: 8px; border: 1px solid #ffc9c9;"><strong>⚠️ Hotel Picker werkt alleen lokaal</strong><br><br>Start de development server met <code style="background: #f1f3f5; padding: 2px 6px; border-radius: 4px;">npm run dev</code> om hotels te kunnen zoeken.</p>';
        } finally {
          searchBtn.disabled = false;
          searchBtn.innerHTML = '<i class="fas fa-search"></i> Zoeken';
        }
      };

      const searchHotels = () => {
        const query = queryInput.value.toLowerCase().trim();
        const country = countrySelect.value;

        let filtered = allHotels;
        if (country) filtered = filtered.filter(h => h.countryCode === country);
        if (query) filtered = filtered.filter(h => h.name.toLowerCase().includes(query));

        noteEl.textContent = `${filtered.length} hotels gevonden`;
        displayResults(filtered.slice(0, 20));
      };

      const displayResults = (hotels) => {
        resultsDiv.innerHTML = '';
        
        if (hotels.length === 0) {
          resultsDiv.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Geen hotels gevonden.</p>';
          return;
        }

        hotels.forEach(hotel => {
          const card = document.createElement('div');
          card.className = 'hotel-result-card';
          card.innerHTML = `
            <div class="hotel-info">
              <h4>${hotel.name}</h4>
              <p class="hotel-location">
                <i class="fas fa-map-marker-alt"></i> 
                ${hotel.geolocation ? `${hotel.geolocation.latitude.toFixed(4)}, ${hotel.geolocation.longitude.toFixed(4)}` : 'Locatie onbekend'}
                ${hotel.countryCode ? ` • ${hotel.countryCode}` : ''}
              </p>
              <p class="hotel-id">ID: ${hotel.id}${hotel.giataId ? ` • GIATA: ${hotel.giataId}` : ''}</p>
            </div>
            <button class="btn btn-primary hotel-select" data-id="${hotel.id}">
              <i class="fas fa-check"></i> Selecteer
            </button>
          `;
          
          const selectBtn = card.querySelector('.hotel-select');
          selectBtn.onclick = async () => {
            try {
              selectBtn.disabled = true;
              selectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
              
              const detailResponse = await fetch(`/api/accommodation-detail?id=${hotel.id}&lang=NL`);
              if (!detailResponse.ok) throw new Error('Failed to fetch hotel details');
              
              const hotelData = await detailResponse.json();
              resolve({ source: 'accommodation-api', hotel: hotelData });
              close();
            } catch (error) {
              console.error('[Hotel Picker] Error:', error);
              alert('Fout bij ophalen van hotel details.');
              selectBtn.disabled = false;
              selectBtn.innerHTML = '<i class="fas fa-check"></i> Selecteer';
            }
          };
          
          resultsDiv.appendChild(card);
        });
      };

      searchBtn.onclick = searchHotels;
      queryInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchHotels(); });
      countrySelect.addEventListener('change', searchHotels);

      loadHotels();
      
      if (!document.getElementById('hotel-picker-styles')) {
        const style = document.createElement('style');
        style.id = 'hotel-picker-styles';
        style.textContent = `
          .hotel-picker-drawer { width: 600px !important; max-width: 95vw !important; }
          .hotel-search-container { display: flex; flex-direction: column; gap: 16px; }
          .hotel-results { display: flex; flex-direction: column; gap: 12px; max-height: 60vh; overflow-y: auto; }
          .hotel-result-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #fff;
            transition: all 0.2s;
          }
          .hotel-result-card:hover {
            border-color: #3b82f6;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
          }
          .hotel-info { flex: 1; }
          .hotel-info h4 {
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
            color: #111827;
          }
          .hotel-location {
            margin: 4px 0;
            font-size: 14px;
            color: #6b7280;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .hotel-id {
            margin: 4px 0 0 0;
            font-size: 12px;
            color: #9ca3af;
          }
          .hotel-select {
            flex-shrink: 0;
            white-space: nowrap;
          }
          .hotel-note {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
          }
        `;
        document.head.appendChild(style);
      }
    });
  }
}

window.HotelPicker = HotelPicker;
