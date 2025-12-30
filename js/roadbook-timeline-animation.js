// Roadbook Animated Timeline - Car Animation

class RoadbookTimelineAnimation {
    constructor(container) {
        this.container = container;
        this.car = document.getElementById('car');
        this.tube = container.querySelector('.tube');
        this.tubeTop = 0;
        this.tubeBottom = 0;
        
        if (!this.car || !this.tube) {
            console.warn('[Roadbook] Missing car or tube');
            return;
        }
        
        this.calculateBounds();
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        window.addEventListener('resize', () => this.calculateBounds(), { passive: true });
        setTimeout(() => this.onScroll(), 100);
    }
    
    calculateBounds() {
        if (!this.tube) return;
        const rect = this.tube.getBoundingClientRect();
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        this.tubeTop = scrollY + rect.top;
        this.tubeBottom = scrollY + rect.bottom;
    }
    
    onScroll() {
        if (!this.car || !this.tube) return;
        
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const viewportMiddle = scrollY + (window.innerHeight / 2);
        
        // Show car only when viewport middle is within tube bounds
        if (viewportMiddle >= this.tubeTop && viewportMiddle <= this.tubeBottom) {
            this.car.classList.add('visible');
        } else {
            this.car.classList.remove('visible');
        }
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.roadbook-animated-timeline-section').forEach(el => {
        new RoadbookTimelineAnimation(el);
    });
});

window.RoadbookTimelineAnimation = RoadbookTimelineAnimation;
