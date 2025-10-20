// Route Overview - Shows travel route in sliding panel
window.showRouteOverview = function(travelData) {
  console.log('[Route Overview] Opening with data:', travelData);
  
  const overlay = document.createElement('div');
  overlay.className = 'mp-overlay';
  
  const drawer = document.createElement('div');
  drawer.className = 'mp-drawer';
  drawer.style.width = '500px';
  drawer.style.maxWidth = '95vw';
  
  const header = document.createElement('div');
  header.className = 'mp-header';
  header.innerHTML = `
    <h3>🗺️ Route Overzicht</h3>
    <button class="mp-close"><i class="fas fa-times"></i></button>
  `;
  
  const body = document.createElement('div');
  body.className = 'mp-body';
  body.style.overflowY = 'auto';
  body.style.flex = '1';
  body.style.padding = '20px';
  
  // Build route content
  const destinations = travelData.destinations || [];
  const hotels = travelData.hotels || [];
  const transports = travelData.transports || [];
  
  let routeHTML = `
    <div style="margin-bottom: 24px;">
      <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #111827;">
        ${travelData.name || 'Reis Route'}
      </h2>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        ${destinations.length} bestemmingen • ${hotels.length} hotels
      </p>
    </div>
  `;
  
  // Group by days
  const dayMap = new Map();
  
  destinations.forEach(dest => {
    for (let day = dest.fromDay; day <= dest.toDay; day++) {
      if (!dayMap.has(day)) {
        dayMap.set(day, { destinations: [], hotels: [], transports: [] });
      }
      dayMap.get(day).destinations.push(dest);
    }
  });
  
  hotels.forEach(hotel => {
    for (let day = hotel.fromDay; day <= hotel.toDay; day++) {
      if (!dayMap.has(day)) {
        dayMap.set(day, { destinations: [], hotels: [], transports: [] });
      }
      dayMap.get(day).hotels.push(hotel);
    }
  });
  
  transports.forEach(transport => {
    const day = transport.fromDay || transport.day || 1;
    if (!dayMap.has(day)) {
      dayMap.set(day, { destinations: [], hotels: [], transports: [] });
    }
    dayMap.get(day).transports.push(transport);
  });
  
  // Sort days
  const sortedDays = Array.from(dayMap.keys()).sort((a, b) => a - b);
  
  // Build timeline
  routeHTML += '<div style="position: relative; padding-left: 24px;">';
  
  sortedDays.forEach((day, index) => {
    const dayData = dayMap.get(day);
    const isLast = index === sortedDays.length - 1;
    
    routeHTML += `
      <div style="position: relative; margin-bottom: ${isLast ? '0' : '32px'};">
        <!-- Timeline line -->
        ${!isLast ? '<div style="position: absolute; left: -16px; top: 32px; bottom: -32px; width: 2px; background: #e5e7eb;"></div>' : ''}
        
        <!-- Day marker -->
        <div style="position: absolute; left: -24px; top: 4px; width: 16px; height: 16px; background: #667eea; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 0 2px #667eea;"></div>
        
        <!-- Day content -->
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;">
          <div style="font-weight: 700; color: #667eea; font-size: 14px; margin-bottom: 12px;">
            DAG ${day}
          </div>
          
          <!-- Destinations -->
          ${dayData.destinations.map(dest => `
            <div style="margin-bottom: 12px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="display: flex; align-items: start; gap: 8px;">
                <i class="fas fa-map-marker-alt" style="color: #ef4444; margin-top: 2px;"></i>
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: #111827; font-size: 14px;">${dest.name}</div>
                  ${dest.description ? `<div style="font-size: 13px; color: #6b7280; margin-top: 4px;">${dest.description.substring(0, 100)}...</div>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
          
          <!-- Hotels -->
          ${dayData.hotels.map(hotel => `
            <div style="margin-bottom: 12px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="display: flex; align-items: start; gap: 8px;">
                <i class="fas fa-hotel" style="color: #8b5cf6; margin-top: 2px;"></i>
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: #111827; font-size: 14px;">${hotel.name}</div>
                  <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">
                    ${'⭐'.repeat(hotel.stars || 3)}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
          
          <!-- Transports -->
          ${dayData.transports.map(transport => `
            <div style="margin-bottom: 12px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="display: flex; align-items: start; gap: 8px;">
                <i class="fas fa-plane" style="color: #3b82f6; margin-top: 2px;"></i>
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: #111827; font-size: 14px;">
                    ${transport.departureCity || transport.from} → ${transport.arrivalCity || transport.to}
                  </div>
                  ${transport.departureTime ? `<div style="font-size: 13px; color: #6b7280; margin-top: 4px;">${transport.departureTime}</div>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
  
  routeHTML += '</div>';
  
  body.innerHTML = routeHTML;
  
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
  };
  
  header.querySelector('.mp-close').onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };
};
