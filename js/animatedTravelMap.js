// Animated Travel Map using Mapbox GL JS
// Creates animated routes between destinations with custom transport icons

class AnimatedTravelMap {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.map = null;
    this.routes = options.routes || [];
    this.currentRouteIndex = 0;
    this.isAnimating = false;
    this.markers = [];
    this.iconSize = options.iconSize || 32; // Default 32px
    this.animationSpeed = options.animationSpeed || 1; // 1 = normal, 2 = 2x faster, 0.5 = 2x slower
    
    // Transport icons - Modern SVG for rotation support
    this.transportIcons = {
      flight: (size) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#667eea"><path d="M20.56 3.91c.59.59.59 1.54 0 2.12l-3.89 3.89 2.12 9.19-1.41 1.41-3.89-7.78-4.24 4.24.71 2.83-1.06 1.06-2.12-3.54-3.54-2.12 1.06-1.06 2.83.71 4.24-4.24-7.78-3.89 1.41-1.41 9.19 2.12 3.89-3.89c.59-.59 1.54-.59 2.12 0l.36.36z"/></svg>`,
      car: '🚗',
      train: '🚂',
      boat: '⛴️',
      bus: '🚌',
      bike: '🚴'
    };
    
    this.init();
  }
  
  init() {
    // Check if Mapbox is loaded
    if (typeof mapboxgl === 'undefined') {
      console.error('[AnimatedTravelMap] Mapbox GL JS not loaded');
      return;
    }
    
    // Get Mapbox token from config or use default
    const token = (window.MEDIA_CONFIG && window.MEDIA_CONFIG.mapboxToken) 
      || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example'; // Replace with actual token
    
    mapboxgl.accessToken = token;
    
    // Calculate bounds for all routes
    const bounds = this.calculateBounds();
    
    // Create map
    this.map = new mapboxgl.Map({
      container: this.container,
      style: this.options.style || 'mapbox://styles/mapbox/streets-v12',
      center: bounds.center,
      zoom: this.options.zoom || 4,
      pitch: this.options.pitch || 0,
      bearing: this.options.bearing || 0
    });
    
    // Wait for map to load
    this.map.on('load', () => {
      this.onMapLoad();
    });
  }
  
  calculateBounds() {
    if (this.routes.length === 0) {
      return { center: [0, 0], bounds: null };
    }
    
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    this.routes.forEach(route => {
      [route.from.coords, route.to.coords].forEach(([lng, lat]) => {
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      });
    });
    
    return {
      center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
      bounds: [[minLng, minLat], [maxLng, maxLat]]
    };
  }
  
  onMapLoad() {
    console.log('[AnimatedTravelMap] Map loaded');
    
    // Fit to bounds
    const bounds = this.calculateBounds();
    if (bounds.bounds) {
      this.map.fitBounds(bounds.bounds, { padding: 50 });
    }
    
    // Add destination markers
    this.addDestinationMarkers();
    
    // Start animation if autoplay
    if (this.options.autoplay !== false) {
      setTimeout(() => this.startAnimation(), 1000);
    }
  }
  
  addDestinationMarkers() {
    // Collect unique destinations with their coordinates
    const destinations = new Map();
    
    this.routes.forEach(route => {
      // Use coordinates as key to prevent duplicate locations
      const fromKey = `${route.from.coords[0]},${route.from.coords[1]}`;
      const toKey = `${route.to.coords[0]},${route.to.coords[1]}`;
      
      if (!destinations.has(fromKey)) {
        destinations.set(fromKey, { name: route.from.name, coords: route.from.coords });
      }
      if (!destinations.has(toKey)) {
        destinations.set(toKey, { name: route.to.name, coords: route.to.coords });
      }
    });
    
    // Add markers
    destinations.forEach((dest) => {
      const el = document.createElement('div');
      el.className = 'travel-map-marker';
      el.innerHTML = `
        <div style="
          background: #667eea;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          white-space: nowrap;
        ">${dest.name}</div>
      `;
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat(dest.coords)
        .addTo(this.map);
      
      this.markers.push(marker);
    });
    
    // Create current location label (will be updated during animation)
    const labelEl = document.createElement('div');
    labelEl.className = 'current-location-label';
    labelEl.style.cssText = `
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(102, 126, 234, 0.95);
      color: white;
      padding: 12px 24px;
      border-radius: 24px;
      font-size: 16px;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10;
      white-space: nowrap;
      display: none;
    `;
    this.container.parentElement.appendChild(labelEl);
    this.currentLocationLabel = labelEl;
  }
  
  async startAnimation() {
    if (this.isAnimating) {
      console.log('[AnimatedTravelMap] Animation already running');
      return;
    }
    
    // Check if map is loaded
    if (!this.map || !this.map.loaded()) {
      console.error('[AnimatedTravelMap] Cannot start animation - map not loaded');
      return;
    }
    
    console.log('[AnimatedTravelMap] Starting animation with', this.routes.length, 'routes');
    
    this.isAnimating = true;
    this.currentRouteIndex = 0;
    
    for (let i = 0; i < this.routes.length; i++) {
      console.log('[AnimatedTravelMap] Animating route', i + 1, 'of', this.routes.length);
      await this.animateRoute(this.routes[i]);
      this.currentRouteIndex++;
    }
    
    this.isAnimating = false;
    console.log('[AnimatedTravelMap] Animation complete');
    
    // Trigger complete event
    if (this.options.onComplete) {
      this.options.onComplete();
    }
  }
  
  async animateRoute(route) {
    return new Promise((resolve) => {
      const { from, to, mode, duration = 3000 } = route;
      
      // Check if map is loaded
      if (!this.map || !this.map.loaded()) {
        console.error('[AnimatedTravelMap] Map not loaded yet');
        resolve();
        return;
      }
      
      // Update current location label
      if (this.currentLocationLabel) {
        this.currentLocationLabel.textContent = `${from.name} → ${to.name}`;
        this.currentLocationLabel.style.display = 'block';
      }
      
      // Create route line
      const routeId = `route-${Date.now()}`;
      const sourceId = `${routeId}-source`;
      
      // Calculate arc for flights (curved line)
      const coordinates = mode === 'flight' 
        ? this.createArc(from.coords, to.coords, 50)
        : [from.coords, to.coords];
      
      // Add source
      this.map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        }
      });
      
      // Add line layer
      this.map.addLayer({
        id: routeId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': mode === 'flight' ? '#667eea' : '#764ba2',
          'line-width': 3,
          'line-opacity': 0.8
        }
      });
      
      // Create moving marker
      const iconFunc = this.transportIcons[mode];
      const icon = typeof iconFunc === 'function' ? iconFunc(this.iconSize) : (iconFunc || '📍');
      const markerEl = document.createElement('div');
      markerEl.innerHTML = `
        <div style="
          width: ${this.iconSize}px;
          height: ${this.iconSize}px;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        ">${icon}</div>
      `;
      
      const movingMarker = new mapboxgl.Marker(markerEl)
        .setLngLat(from.coords)
        .addTo(this.map);
      
      // Animate marker along route
      const steps = 60;
      const adjustedDuration = duration / this.animationSpeed;
      const stepDuration = adjustedDuration / steps;
      let step = 0;
      
      const animate = () => {
        if (step >= steps) {
          movingMarker.remove();
          // Update label to show arrival
          if (this.currentLocationLabel) {
            this.currentLocationLabel.textContent = `✓ ${to.name}`;
            setTimeout(() => {
              if (this.currentLocationLabel) {
                this.currentLocationLabel.style.display = 'none';
              }
            }, 1000);
          }
          resolve();
          return;
        }
        
        const progress = step / steps;
        const index = Math.floor(progress * (coordinates.length - 1));
        const nextIndex = Math.min(index + 1, coordinates.length - 1);
        const segmentProgress = (progress * (coordinates.length - 1)) - index;
        
        const lng = coordinates[index][0] + (coordinates[nextIndex][0] - coordinates[index][0]) * segmentProgress;
        const lat = coordinates[index][1] + (coordinates[nextIndex][1] - coordinates[index][1]) * segmentProgress;
        
        movingMarker.setLngLat([lng, lat]);
        
        // Calculate rotation angle for the icon to follow the path
        if (mode === 'flight' && nextIndex > index) {
          const dx = coordinates[nextIndex][0] - coordinates[index][0];
          const dy = coordinates[nextIndex][1] - coordinates[index][1];
          // Calculate bearing angle (0° = North, 90° = East)
          const angle = Math.atan2(dx, dy) * (180 / Math.PI);
          // Apply rotation to the marker element
          const iconDiv = markerEl.querySelector('div');
          if (iconDiv) {
            iconDiv.style.transform = `rotate(${angle}deg)`;
          }
        }
        
        step++;
        setTimeout(animate, stepDuration);
      };
      
      animate();
    });
  }
  
  createArc(start, end, numPoints = 50) {
    // Create curved arc for flights
    const [startLng, startLat] = start;
    const [endLng, endLat] = end;
    
    const points = [];
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      
      // Linear interpolation
      const lng = startLng + (endLng - startLng) * t;
      const lat = startLat + (endLat - startLat) * t;
      
      // Add arc height (parabola)
      const arcHeight = Math.sin(t * Math.PI) * 5; // 5 degrees max height
      
      points.push([lng, lat + arcHeight]);
    }
    
    return points;
  }
  
  reset() {
    // Check if map is loaded
    if (!this.map || !this.map.loaded()) {
      console.warn('[AnimatedTravelMap] Cannot reset - map not loaded');
      return;
    }
    
    // Remove all route layers and sources
    const style = this.map.getStyle();
    if (style && style.layers) {
      style.layers.forEach(layer => {
        if (layer.id.startsWith('route-')) {
          try {
            this.map.removeLayer(layer.id);
          } catch (e) {
            console.warn('[AnimatedTravelMap] Error removing layer:', e);
          }
        }
      });
    }
    
    if (style && style.sources) {
      Object.keys(style.sources).forEach(sourceId => {
        if (sourceId.startsWith('route-')) {
          try {
            this.map.removeSource(sourceId);
          } catch (e) {
            console.warn('[AnimatedTravelMap] Error removing source:', e);
          }
        }
      });
    }
    
    this.currentRouteIndex = 0;
    this.isAnimating = false;
  }
  
  destroy() {
    if (this.map) {
      this.markers.forEach(marker => marker.remove());
      this.map.remove();
      this.map = null;
    }
    
    // Remove location label
    if (this.currentLocationLabel && this.currentLocationLabel.parentElement) {
      this.currentLocationLabel.parentElement.removeChild(this.currentLocationLabel);
      this.currentLocationLabel = null;
    }
  }
  
  // Export as video frames (for video generator)
  async exportFrames(fps = 30) {
    const frames = [];
    const canvas = this.map.getCanvas();
    
    // TODO: Implement frame capture
    // This would require running animation and capturing canvas at intervals
    
    return frames;
  }
}

// Export for use in components
window.AnimatedTravelMap = AnimatedTravelMap;
