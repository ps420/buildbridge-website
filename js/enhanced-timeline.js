// BuildBridge - Fortune 500 Enhanced Timeline
// Scroll-driven timeline with animated progress indicators
// Version 1.0

class EnhancedTimeline {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) return;
    
    this.options = {
      progressBarColor: 'linear-gradient(180deg, #C9CED6, #525862)',
      nodeActiveColor: '#C9CED6',
      nodeInactiveColor: '#2A2D34',
      lineColor: 'rgba(201, 206, 214, 0.2)',
      animationDuration: 600,
      ...options
    };
    
    this.items = [];
    this.progressBar = null;
    this.timelineLine = null;
    this.observer = null;
    
    this.init();
  }
  
  init() {
    this.items = Array.from(this.container.querySelectorAll('.timeline-item'));
    if (!this.items.length) return;
    
    this.createStructure();
    this.createProgressBar();
    this.bindEvents();
    this.observeItems();
  }
  
  createStructure() {
    // Add enhanced classes
    this.container.classList.add('enhanced-timeline');
    
    this.items.forEach((item, index) => {
      item.style.opacity = '0.3';
      item.style.transform = 'translateY(30px)';
      item.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      
      const node = item.querySelector('.timeline-node');
      if (node) {
        node.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        node.style.transform = 'scale(0.8)';
      }
      
      const content = item.querySelector('.timeline-content');
      if (content) {
        content.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      }
      
      const icon = item.querySelector('.timeline-icon');
      if (icon) {
        icon.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        icon.style.transform = 'rotate(-10deg) scale(0.9)';
      }
    });
    
    // Create connecting line
    this.timelineLine = document.createElement('div');
    this.timelineLine.className = 'timeline-connecting-line';
    this.timelineLine.style.cssText = `
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 2px;
      background: ${this.options.lineColor};
      transform: translateX(-50%);
      z-index: 1;
    `;
    
    this.container.style.position = 'relative';
    this.container.insertBefore(this.timelineLine, this.container.firstChild);
  }
  
  createProgressBar() {
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'timeline-progress-bar';
    this.progressBar.style.cssText = `
      position: absolute;
      left: 50%;
      top: 0;
      width: 2px;
      height: 0%;
      background: ${this.options.progressBarColor};
      transform: translateX(-50%);
      z-index: 2;
      transition: height 0.3s ease-out;
      box-shadow: 0 0 10px rgba(201, 206, 214, 0.3);
    `;
    
    this.container.insertBefore(this.progressBar, this.container.firstChild);
  }
  
  bindEvents() {
    window.addEventListener('scroll', () => this.updateProgress(), { passive: true });
    window.addEventListener('resize', () => this.updateProgress(), { passive: true });
  }
  
  observeItems() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const item = entry.target;
        const node = item.querySelector('.timeline-node');
        const icon = item.querySelector('.timeline-icon');
        const content = item.querySelector('.timeline-content');
        
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          // Activate item
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
          item.classList.add('active');
          
          if (node) {
            node.style.transform = 'scale(1)';
            node.style.background = this.options.nodeActiveColor;
            node.style.borderColor = this.options.nodeActiveColor;
            node.style.boxShadow = '0 0 20px rgba(201, 206, 214, 0.4)';
          }
          
          if (icon) {
            icon.style.transform = 'rotate(0deg) scale(1)';
          }
          
          if (content) {
            content.style.transform = 'translateX(0)';
          }
          
          // Trigger pulse animation on node
          this.pulseNode(node);
        }
      });
    }, {
      threshold: [0, 0.3, 0.5, 1],
      rootMargin: '-10% 0px -10% 0px'
    });
    
    this.items.forEach(item => this.observer.observe(item));
  }
  
  pulseNode(node) {
    if (!node) return;
    
    node.style.animation = 'node-pulse 0.6s ease';
    setTimeout(() => {
      node.style.animation = '';
    }, 600);
  }
  
  updateProgress() {
    if (!this.container || !this.progressBar) return;
    
    const containerRect = this.container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const containerTop = containerRect.top;
    const containerHeight = containerRect.height;
    
    // Calculate scroll progress through timeline
    let progress = 0;
    
    if (containerTop <= windowHeight * 0.5) {
      const scrolled = (windowHeight * 0.5) - containerTop;
      progress = (scrolled / (containerHeight - windowHeight * 0.3)) * 100;
    }
    
    progress = Math.max(0, Math.min(100, progress));
    
    this.progressBar.style.height = `${progress}%`;
    
    // Update active state based on progress
    this.items.forEach((item, index) => {
      const itemProgress = ((index + 1) / this.items.length) * 100;
      
      if (progress >= itemProgress - 15) {
        item.classList.add('passed');
      }
    });
  }
  
  // Public API
  refresh() {
    this.updateProgress();
  }
  
  jumpTo(index) {
    if (index >= 0 && index < this.items.length) {
      this.items[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.timelineLine) {
      this.timelineLine.remove();
    }
    if (this.progressBar) {
      this.progressBar.remove();
    }
  }
}

// Add CSS animations
const timelineStyles = document.createElement('style');
timelineStyles.textContent = `
  @keyframes node-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  
  @keyframes icon-bounce {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(-10deg) scale(1.1); }
    75% { transform: rotate(10deg) scale(1.1); }
  }
  
  .timeline-item.active .timeline-icon {
    animation: icon-bounce 0.6s ease;
  }
  
  .timeline-item {
    position: relative;
    z-index: 3;
  }
  
  .timeline-node {
    position: relative;
    z-index: 4;
  }
  
  /* Pulse ring around active nodes */
  .timeline-item.active .timeline-node::after {
    content: '';
    position: absolute;
    inset: -8px;
    border: 1px solid rgba(201, 206, 214, 0.3);
    border-radius: 50%;
    animation: ring-expand 2s ease-out infinite;
  }
  
  @keyframes ring-expand {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
  }
`;
document.head.appendChild(timelineStyles);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const timeline = document.querySelector('.process-timeline');
  if (timeline) {
    window.processTimeline = new EnhancedTimeline(timeline);
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedTimeline;
}
