/**
 * Animated Timeline with SVG Connections
 * v25.0 Fortune 500 Professional Feature
 * Timeline with animated SVG path connections
 */

class AnimatedTimelineSVG {
  constructor(container, options = {}) {
    this.container = container;
    this.timeline = container.querySelector('.animated-timeline');
    this.items = Array.from(container.querySelectorAll('.timeline-item'));
    this.svgContainer = container.querySelector('.timeline-svg-container');
    this.svg = container.querySelector('.timeline-svg');
    this.path = container.querySelector('.timeline-path-active');
    this.progressVertical = container.querySelector('.timeline-progress-vertical');
    
    this.config = {
      pathAnimation: options.pathAnimation !== false,
      itemReveal: options.itemReveal !== false,
      progressIndicator: options.progressIndicator !== false,
      highlightActive: options.highlightActive !== false,
      ...options
    };
    
    this.scrollProgress = 0;
    this.activeIndex = -1;
    this.pathLength = 0;
    this.dots = [];
    
    this.init();
  }
  
  init() {
    this.setupSVG();
    this.createProgressIndicators();
    this.bindEvents();
    this.createConnectionDots();
    
    // Initial render
    this.onScroll();
  }
  
  setupSVG() {
    if (!this.svg || !this.path) return;
    
    // Get path length for animation
    this.pathLength = this.path.getTotalLength();
    
    // Set initial state
    this.path.style.strokeDasharray = this.pathLength;
    this.path.style.strokeDashoffset = this.pathLength;
  }
  
  createProgressIndicators() {
    if (!this.progressVertical || !this.config.progressIndicator) return;
    
    this.items.forEach((item, index) => {
      const indicator = document.createElement('div');
      indicator.className = 'timeline-progress-item';
      indicator.dataset.index = index;
      
      // Get label from item
      const title = item.querySelector('.timeline-title');
      if (title) {
        indicator.dataset.label = title.textContent.trim();
      }
      
      indicator.addEventListener('click', () => this.scrollToItem(index));
      this.progressVertical.appendChild(indicator);
    });
  }
  
  createConnectionDots() {
    // Create floating dots along the path for visual interest
    const dotCount = Math.floor(this.items.length * 3);
    
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('div');
      dot.className = 'timeline-dot';
      dot.style.top = `${(i / (dotCount - 1)) * 100}%`;
      this.container.appendChild(dot);
      this.dots.push({
        element: dot,
        position: i / (dotCount - 1)
      });
    }
  }
  
  bindEvents() {
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    window.addEventListener('resize', () => this.onResize(), { passive: true });
  }
  
  onScroll() {
    const containerRect = this.container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate progress through the timeline
    const startOffset = windowHeight * 0.3;
    const totalHeight = containerRect.height + windowHeight;
    const scrolled = -containerRect.top + startOffset;
    
    this.scrollProgress = Math.max(0, Math.min(1, scrolled / totalHeight));
    
    // Update SVG path
    this.updatePath();
    
    // Update items visibility
    this.updateItems();
    
    // Update progress indicators
    this.updateProgress();
    
    // Update connection dots
    this.updateDots();
  }
  
  updatePath() {
    if (!this.path || !this.config.pathAnimation) return;
    
    const offset = this.pathLength * (1 - this.scrollProgress);
    this.path.style.strokeDashoffset = offset;
  }
  
  updateItems() {
    if (!this.config.itemReveal) return;
    
    this.items.forEach((item, index) => {
      const itemRect = item.getBoundingClientRect();
      const triggerPoint = window.innerHeight * 0.7;
      
      if (itemRect.top < triggerPoint) {
        item.classList.add('visible');
        
        // Track active index
        if (itemRect.top < window.innerHeight * 0.5) {
          this.activeIndex = index;
        }
      } else {
        item.classList.remove('visible');
      }
    });
  }
  
  updateProgress() {
    if (!this.progressVertical) return;
    
    const indicators = this.progressVertical.querySelectorAll('.timeline-progress-item');
    
    indicators.forEach((indicator, index) => {
      indicator.classList.remove('active', 'completed');
      
      if (index === this.activeIndex) {
        indicator.classList.add('active');
      } else if (index < this.activeIndex) {
        indicator.classList.add('completed');
      }
    });
  }
  
  updateDots() {
    this.dots.forEach(dot => {
      if (dot.position <= this.scrollProgress) {
        dot.element.classList.add('active');
      } else {
        dot.element.classList.remove('active');
      }
    });
  }
  
  scrollToItem(index) {
    const item = this.items[index];
    if (!item) return;
    
    const offset = item.offsetTop - window.innerHeight * 0.3;
    
    window.scrollTo({
      top: this.container.offsetTop + offset,
      behavior: 'smooth'
    });
  }
  
  onResize() {
    // Recalculate on resize
    setTimeout(() => this.onScroll(), 100);
  }
  
  // Public method to refresh
  refresh() {
    this.setupSVG();
    this.onScroll();
  }
}

// Auto-initialize animated timeline sections
document.addEventListener('DOMContentLoaded', () => {
  const timelines = document.querySelectorAll('.animated-timeline-section');
  timelines.forEach(timeline => new AnimatedTimelineSVG(timeline));
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimatedTimelineSVG;
}
