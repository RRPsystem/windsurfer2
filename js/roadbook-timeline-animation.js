// Roadbook Animated Timeline - Car Animation

class RoadbookTimelineAnimation {
    constructor(container) {
        this.container = container;
        this.car = null;
        this.dayItems = [];
        this.roadLine = null;
        this.roadContainer = null;
        this.isAnimating = false;
        this.itineraryWrap = null;
        this.isFixedCar = false;
        this.scrollContainer = null;
        this._scrollHandler = null;
        
        this.init();
    }
    
    init() {
        console.log('[Timeline Init] ===== STARTING INITIALIZATION =====');
        // Get all day items - support both old and new class names
        this.dayItems = Array.from(this.container.querySelectorAll('.roadbook-day-item, .day'));
        this.roadContainer = this.container.querySelector('.roadbook-timeline-road, #itinerary-wrap');
        this.roadLine = this.container.querySelector('.roadbook-road-line');
        this.car = this.container.querySelector('.roadbook-timeline-car, #car');
        this.itineraryWrap = this.container.querySelector('#itinerary-wrap');
        this.isFixedCar = !!(this.car && (this.car.id === 'car' || getComputedStyle(this.car).position === 'fixed'));
        this.scrollContainer = this.findScrollContainer();
        
        console.log('[Timeline Init]', {
            container: !!this.container,
            dayItems: this.dayItems.length,
            roadContainer: !!this.roadContainer,
            roadLine: !!this.roadLine,
            car: !!this.car,
            itineraryWrap: !!this.itineraryWrap,
            isFixedCar: this.isFixedCar,
            scrollContainer: this.scrollContainer === window ? 'window' : 'element'
        });
        
        if (!this.car || this.dayItems.length === 0) {
            console.warn('[Timeline Init] Cannot initialize - missing car or days:', {
                hasCar: !!this.car,
                dayCount: this.dayItems.length
            });
            return;
        }
        
        console.log('[Timeline Init] ✅ All elements found, setting up animation...');
        
        // Position car at START badge only when the car is not fixed.
        // In layout 1 the car is fixed in the viewport (top: 50%), so do not override it.
        if (!this.isFixedCar) {
            setTimeout(() => {
                const startBadge = this.container.querySelector('.roadbook-start-badge');
                if (startBadge && this.roadContainer) {
                    const containerRect = this.roadContainer.getBoundingClientRect();
                    const badgeRect = startBadge.getBoundingClientRect();
                    const badgeMiddle = badgeRect.top + badgeRect.height / 2;
                    const relativeTop = badgeMiddle - containerRect.top - (this.car.offsetHeight / 2);
                    this.car.style.top = `${Math.max(0, relativeTop)}px`;
                }
            }, 100);
        }
        
        // Setup scroll listeners on the actual scroll container (Builder often scrolls inside a panel).
        this._scrollHandler = () => this.onScroll();
        if (this.scrollContainer === window) {
            window.addEventListener('scroll', this._scrollHandler, { passive: true });
        } else if (this.scrollContainer) {
            this.scrollContainer.addEventListener('scroll', this._scrollHandler, { passive: true });
        }
        window.addEventListener('resize', this._scrollHandler, { passive: true });
        
        console.log('[Timeline Init] Scroll listeners attached');
        
        // Force initial update after a delay to ensure layout is ready
        setTimeout(() => {
            this.updateCarPosition();
            this.onScroll();
        }, 100);
        
        // Also update on any scroll event globally and control car visibility
        setInterval(() => {
            this.updateCarVisibility();
            if (this.isVisible()) {
                this.updateCarPosition();
            }
        }, 100);
    }

    findScrollContainer() {
        // Prefer the nearest scrollable ancestor. Builder often scrolls inside a panel/canvas.
        let el = this.container;
        while (el && el !== document.body) {
            const style = getComputedStyle(el);
            const overflowY = style.overflowY;
            const isScrollable = (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 2;
            if (isScrollable) return el;
            el = el.parentElement;
        }
        return window;
    }

    getScrollTop() {
        if (!this.scrollContainer || this.scrollContainer === window) {
            return window.pageYOffset || document.documentElement.scrollTop || 0;
        }
        return this.scrollContainer.scrollTop || 0;
    }
    
    updateCarVisibility() {
        if (!this.car || !this.itineraryWrap) return;
        
        const wrapRect = this.itineraryWrap.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Show car only when itinerary-wrap is in view
        const isInView = wrapRect.top < viewportHeight && wrapRect.bottom > 0;
        
        if (isInView) {
            this.car.style.opacity = '1';
            this.car.style.visibility = 'visible';
        } else {
            this.car.style.opacity = '0';
            this.car.style.visibility = 'hidden';
        }
    }
    
    onScroll() {
        console.log('[Timeline] onScroll called, isAnimating:', this.isAnimating);
        if (this.isAnimating) return;
        
        requestAnimationFrame(() => {
            console.log('[Timeline] Updating car position...');
            // Move car with scroll and update active day styling
            this.updateCarPosition();
            this.updateActiveDays();
            this.isAnimating = false;
        });
        
        this.isAnimating = true;
    }
    
    updateCarPosition() {
        console.log('[Car] updateCarPosition called');
        if (!this.car || this.dayItems.length === 0 || !this.roadContainer) {
            console.warn('[Car] Cannot update - missing elements');
            return;
        }

        // In Roadbook layout 1 the car is intentionally fixed in the viewport.
        // Avoid fighting the CSS by not recalculating the top position.
        if (this.isFixedCar) {
            this.updateActiveDays();
            return;
        }
        
        // Get scroll position
        const scrollY = this.getScrollTop();
        const containerRect = this.roadContainer.getBoundingClientRect();
        const containerTop = scrollY + containerRect.top;
        
        // Calculate car position based on scroll
        // Car should be at viewport middle
        const viewportMiddle = window.innerHeight / 2;
        const carPositionInViewport = scrollY + viewportMiddle;
        
        // Convert to position relative to container
        let relativeTop = carPositionInViewport - containerTop - (this.car.offsetHeight / 2);
        
        // Clamp within container bounds
        relativeTop = Math.max(0, Math.min(relativeTop, this.roadContainer.offsetHeight - this.car.offsetHeight));
        
        console.log('[Car] ScrollY:', scrollY, 'RelativeTop:', relativeTop.toFixed(2));
        this.car.style.setProperty('top', `${relativeTop}px`, 'important');
        
        // Find and highlight closest day
        this.updateActiveDays();
    }
    
    updateActiveDays() {
        const viewportMiddle = window.innerHeight / 2;
        
        this.dayItems.forEach(day => {
            const badge = day.querySelector('.roadbook-day-badge, .dayNum');
            if (!badge) return;
            
            const rect = badge.getBoundingClientRect();
            const badgeMiddle = rect.top + rect.height / 2;
            
            // Check if badge is near viewport middle (where car is)
            if (Math.abs(badgeMiddle - viewportMiddle) < 100) {
                day.classList.add('active');
            } else {
                day.classList.remove('active');
            }
        });
    }
    
    isVisible() {
        if (!this.container) return false;
        const rect = this.container.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const timelines = document.querySelectorAll('.roadbook-animated-timeline-section');
    timelines.forEach(timeline => {
        new RoadbookTimelineAnimation(timeline);
    });
});

// Export for manual initialization
window.RoadbookTimelineAnimation = RoadbookTimelineAnimation;
