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
        
        // Position car at START badge initially (relative to road container)
        setTimeout(() => {
            const startBadge = this.container.querySelector('.roadbook-start-badge');
            if (startBadge && this.roadLine) {
                const roadRect = this.roadLine.getBoundingClientRect();
                const badgeRect = startBadge.getBoundingClientRect();
                const relativeTop = badgeRect.top - roadRect.top + 40;
                this.car.style.top = `${relativeTop}px`;
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
            this.updateActiveDays();
            this.isAnimating = false;
        });
        
        this.isAnimating = true;
    }
    
    updateCarPosition() {
        if (!this.car || this.dayItems.length === 0 || !this.roadLine) return;
        
        const roadRect = this.roadLine.getBoundingClientRect();
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
            const relativeTop = badgeRect.top - roadRect.top;
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
