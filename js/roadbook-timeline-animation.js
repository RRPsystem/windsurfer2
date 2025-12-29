// Roadbook Animated Timeline - Car Animation (WordPress ScrollMagic style)

class RoadbookTimelineAnimation {
    constructor(container) {
        this.container = container;
        this.car = null;
        this.tube = null;
        this.dayItems = [];
        this.tubeTop = 0;
        this.tubeBottom = 0;
        
        this.init();
    }
    
    init() {
        // Get elements - WordPress structure
        this.car = document.getElementById('car');
        this.tube = this.container.querySelector('.tube') || this.container.querySelector('.roadbook-road');
        this.dayItems = Array.from(this.container.querySelectorAll('.day'));
        
        console.log('[Timeline] Init:', {
            car: !!this.car,
            tube: !!this.tube,
            days: this.dayItems.length
        });
        
        if (!this.car || !this.tube) {
            console.warn('[Timeline] Missing car or tube');
            return;
        }
        
        // Calculate tube bounds
        this.calculateBounds();
        
        // Setup scroll listener
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        window.addEventListener('resize', () => this.calculateBounds(), { passive: true });
        
        // Initial check
        setTimeout(() => this.onScroll(), 100);
    }
    
    calculateBounds() {
        if (!this.tube) return;
        
        const rect = this.tube.getBoundingClientRect();
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        this.tubeTop = scrollY + rect.top;
        this.tubeBottom = scrollY + rect.bottom;
        
        console.log('[Timeline] Tube bounds:', this.tubeTop, 'to', this.tubeBottom);
    }
    
    onScroll() {
        if (!this.car || !this.tube) return;
        
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const viewportMiddle = scrollY + (window.innerHeight / 2);
        
        // Check if viewport middle is within tube bounds
        const isOnRoad = viewportMiddle >= this.tubeTop && viewportMiddle <= this.tubeBottom;
        
        if (isOnRoad) {
            // Show car when on road
            this.car.classList.add('visible');
        } else {
            // Hide car when not on road
            this.car.classList.remove('visible');
        }
        
        // Update active days
        this.updateActiveDays();
    }
    
    updateActiveDays() {
        const viewportMiddle = window.innerHeight / 2;
        
        this.dayItems.forEach(day => {
            const dayNum = day.querySelector('.dayNum');
            if (!dayNum) return;
            
            const rect = dayNum.getBoundingClientRect();
            const badgeMiddle = rect.top + rect.height / 2;
            
            if (Math.abs(badgeMiddle - viewportMiddle) < 150) {
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
