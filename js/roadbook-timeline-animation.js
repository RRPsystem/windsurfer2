// Roadbook Animated Timeline - Car Animation

class RoadbookTimelineAnimation {
    constructor(container) {
        this.container = container;
        this.car = null;
        this.dayItems = [];
        this.roadLine = null;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        // Get all day items
        this.dayItems = Array.from(this.container.querySelectorAll('.roadbook-day-item'));
        this.roadLine = this.container.querySelector('.roadbook-road-line');
        this.car = this.container.querySelector('.roadbook-timeline-car');
        
        if (!this.car || this.dayItems.length === 0) return;
        
        // Position car at START badge initially
        setTimeout(() => {
            const startBadge = this.container.querySelector('.roadbook-start-badge');
            if (startBadge) {
                const badgeRect = startBadge.getBoundingClientRect();
                const scrollTop = window.pageYOffset;
                const carTop = badgeRect.top + scrollTop + 40; // Position below START
                this.car.style.top = `${carTop}px`;
            }
        }, 100);
        
        // Setup scroll listener
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        
        // Initial update
        this.onScroll();
    }
    
    onScroll() {
        if (this.isAnimating) return;
        
        requestAnimationFrame(() => {
            this.updateCarPosition();
            this.updateActiveDays();
            this.isAnimating = false;
        });
        
        this.isAnimating = true;
    }
    
    updateCarPosition() {
        const scrollTop = window.pageYOffset;
        const viewportHeight = window.innerHeight;
        const viewportCenter = scrollTop + (viewportHeight / 2);
        
        // Find closest day item
        let closestDay = null;
        let closestDistance = Infinity;
        
        this.dayItems.forEach(day => {
            const badge = day.querySelector('.roadbook-day-badge');
            if (!badge) return;
            
            const badgeTop = badge.getBoundingClientRect().top + scrollTop;
            const distance = Math.abs(viewportCenter - badgeTop);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestDay = day;
            }
        });
        
        // Position car at closest day
        if (closestDay && this.car) {
            const badge = closestDay.querySelector('.roadbook-day-badge');
            if (badge) {
                const badgeRect = badge.getBoundingClientRect();
                const carTop = badgeRect.top + (badgeRect.height / 2);
                
                // Update car position (fixed, so just update top)
                this.car.style.top = `${carTop}px`;
            }
        }
    }
    
    updateActiveDays() {
        const scrollTop = window.pageYOffset;
        const viewportHeight = window.innerHeight;
        const triggerPoint = scrollTop + (viewportHeight * 0.6);
        
        this.dayItems.forEach(day => {
            const badge = day.querySelector('.roadbook-day-badge');
            if (!badge) return;
            
            const badgeTop = badge.getBoundingClientRect().top + scrollTop;
            
            // Activate day when it reaches trigger point
            if (badgeTop <= triggerPoint) {
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
