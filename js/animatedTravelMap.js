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
    
    // Transport icons (Font Awesome classes)
    this.transportIcons = {
      flight: '✈️',
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
    // Collect unique destinations
    const destinations = new Map();
    
    this.routes.forEach(route => {
      if (!destinations.has(route.from.name)) {
        destinations.set(route.from.name, route.from.coords);
      }
      if (!destinations.has(route.to.name)) {
        destinations.set(route.to.name, route.to.coords);
      }
    });
    
    // Add markers
    destinations.forEach((coords, name) => {
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
        ">${name}</div>
      `;
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat(coords)
        .addTo(this.map);
      
      this.markers.push(marker);
    });
  }
  
  async startAnimation() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.currentRouteIndex = 0;
    
    for (let i = 0; i < this.routes.length; i++) {
      await this.animateRoute(this.routes[i]);
      this.currentRouteIndex++;
    }
    
    this.isAnimating = false;
    
    // Trigger complete event
    if (this.options.onComplete) {
      this.options.onComplete();
    }
  }
  
  async animateRoute(route) {
    return new Promise((resolve) => {
      const { from, to, mode, duration = 3000 } = route;
      
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
      const icon = this.transportIcons[mode] || '📍';
      const markerEl = document.createElement('div');
      markerEl.innerHTML = `
        <div style="
          font-size: 24px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          animation: bounce 0.5s ease-in-out infinite alternate;
        ">${icon}</div>
      `;
      
      const movingMarker = new mapboxgl.Marker(markerEl)
        .setLngLat(from.coords)
        .addTo(this.map);
      
      // Animate marker along route
      const steps = 60;
      const stepDuration = duration / steps;
      let step = 0;
      
      const animate = () => {
        if (step >= steps) {
          movingMarker.remove();
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
    // Remove all route layers and sources
    const style = this.map.getStyle();
    if (style && style.layers) {
      style.layers.forEach(layer => {
        if (layer.id.startsWith('route-')) {
          this.map.removeLayer(layer.id);
        }
      });
    }
    
    if (style && style.sources) {
      Object.keys(style.sources).forEach(sourceId => {
        if (sourceId.startsWith('route-')) {
          this.map.removeSource(sourceId);
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
