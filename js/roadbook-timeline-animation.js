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
        
        // Setup scroll listener
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        window.addEventListener('resize', () => this.onScroll(), { passive: true });
        
        // Initial update
        this.updateCarPosition();
        this.onScroll();
    }
    
    onScroll() {
        if (this.isAnimating) return;
        
        requestAnimationFrame(() => {
            // Move car with scroll and update active day styling
            this.updateCarPosition();
            this.updateActiveDays();
            this.isAnimating = false;
        });
        
        this.isAnimating = true;
    }
    
    updateCarPosition() {
        if (!this.car || this.dayItems.length === 0 || !this.roadContainer) return;
        
        const containerRect = this.roadContainer.getBoundingClientRect();
        const viewportMiddle = window.innerHeight / 2;
        
        // Find closest day badge to viewport middle
        let closestDay = null;
        let closestDistance = Infinity;
        
        this.dayItems.forEach(day => {
            const badge = day.querySelector('.roadbook-day-badge');
            if (!badge) return;
            
            const rect = badge.getBoundingClientRect();
            const badgeMiddle = rect.top + rect.height / 2;
            const distance = Math.abs(badgeMiddle - viewportMiddle);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestDay = badge;
            }
        });
        
        if (closestDay) {
            const badgeRect = closestDay.getBoundingClientRect();
            const badgeMiddle = badgeRect.top + badgeRect.height / 2;
            let relativeTop = badgeMiddle - containerRect.top - (this.car.offsetHeight / 2);
            // clamp within container
            relativeTop = Math.max(0, Math.min(relativeTop, this.roadContainer.scrollHeight - this.car.offsetHeight));
            this.car.style.top = `${relativeTop}px`;
        }
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
