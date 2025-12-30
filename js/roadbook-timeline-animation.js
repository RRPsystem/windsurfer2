// Roadbook Animated Timeline - Car Animation

class RoadbookTimelineAnimation {
    constructor(container) {
        this.container = container;
        this.car = null;
        this.dayItems = [];
        this.roadLine = null;
        this.roadContainer = null;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        console.log('[Timeline Init] ===== STARTING INITIALIZATION =====');
        // Get all day items
        this.dayItems = Array.from(this.container.querySelectorAll('.roadbook-day-item'));
        this.roadContainer = this.container.querySelector('.roadbook-timeline-road');
        this.roadLine = this.container.querySelector('.roadbook-road-line');
        this.car = this.container.querySelector('.roadbook-timeline-car');
        
        console.log('[Timeline Init]', {
            container: !!this.container,
            dayItems: this.dayItems.length,
            roadContainer: !!this.roadContainer,
            roadLine: !!this.roadLine,
            car: !!this.car
        });
        
        if (!this.car || this.dayItems.length === 0) {
            console.warn('[Timeline Init] Cannot initialize - missing car or days:', {
                hasCar: !!this.car,
                dayCount: this.dayItems.length
            });
            return;
        }
        
        console.log('[Timeline Init] ✅ All elements found, setting up animation...');
        
        // Position car at START badge initially (relative to road container)
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
        
        // Setup scroll listener - listen to ALL scroll events
        const scrollHandler = () => this.onScroll();
        document.addEventListener('scroll', scrollHandler, { passive: true, capture: true });
        window.addEventListener('scroll', scrollHandler, { passive: true });
        window.addEventListener('resize', scrollHandler, { passive: true });
        
        // Also check for scroll on parent containers
        let parent = this.container.parentElement;
        while (parent) {
            parent.addEventListener('scroll', scrollHandler, { passive: true });
            parent = parent.parentElement;
        }
        
        console.log('[Timeline Init] Scroll listeners attached');
        
        // Force initial update after a delay to ensure layout is ready
        setTimeout(() => {
            this.updateCarPosition();
            this.onScroll();
        }, 100);
        
        // Also update on any scroll event globally
        setInterval(() => {
            if (this.isVisible()) {
                this.updateCarPosition();
            }
        }, 100);
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
        
        // Get scroll position
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
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
            const badge = day.querySelector('.roadbook-day-badge');
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
