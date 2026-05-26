/**
 * Scroll Progress Ring
 * Circular progress indicator with smooth animations
 */

class ScrollProgressRing {
  constructor(options = {}) {
    this.options = {
      showAfter: options.showAfter || 200,
      circumference: 2 * Math.PI * 25, // r=25
      ...options
    };
    
    this.element = null;
    this.ringFill = null;
    this.percentageEl = null;
    this.scrollPercent = 0;
    
    this.init();
  }
  
  init() {
    this.createElement();
    this.bindEvents();
    this.updateProgress();
  }
  
  createElement() {
    // Create container
    this.element = document.createElement('div');
    this.element.className = 'scroll-progress-ring';
    this.element.setAttribute('role', 'button');
    this.element.setAttribute('aria-label', 'Scroll to top');
    this.element.setAttribute('tabindex', '0');
    
    // Create SVG with gradient
    this.element.innerHTML = `
      <svg viewBox="0 0 56 56">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#c9ced6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ffffff;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle class="scroll-progress-ring-bg" cx="28" cy="28" r="25"/>
        <circle class="scroll-progress-ring-fill" cx="28" cy="28" r="25"/>
      </svg>
      <div class="scroll-progress-ring-inner">
        <span class="scroll-progress-ring-arrow">↑</span>
        <span class="scroll-progress-percentage">0%</span>
      </div>
    `;
    
    this.ringFill = this.element.querySelector('.scroll-progress-ring-fill');
    this.percentageEl = this.element.querySelector('.scroll-progress-percentage');
    
    document.body.appendChild(this.element);
  }
  
  bindEvents() {
    // Click to scroll to top
    this.element.addEventListener('click', () => {
      this.scrollToTop();
    });
    
    // Keyboard accessibility
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.scrollToTop();
      }
    });
    
    // Scroll event with RAF throttling
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
  
  updateProgress() {
    const scrollTop = window.scrollY || window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollPercent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
    
    // Update ring stroke
    const offset = this.options.circumference - (this.scrollPercent / 100) * this.options.circumference;
    this.ringFill.style.strokeDashoffset = offset;
    
    // Update percentage text
    if (this.percentageEl) {
      this.percentageEl.textContent = Math.round(this.scrollPercent) + '%';
    }
    
    // Show/hide based on scroll position
    if (scrollTop > this.options.showAfter) {
      this.element.classList.add('visible');
    } else {
      this.element.classList.remove('visible');
    }
    
    // Add complete class at 100%
    if (this.scrollPercent >= 99) {
      this.element.classList.add('complete');
    } else {
      this.element.classList.remove('complete');
    }
  }
  
  scrollToTop() {
    // Smooth scroll with easing
    const startPosition = window.scrollY;
    const duration = 800;
    const startTime = performance.now();
    
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      
      window.scrollTo(0, startPosition * (1 - eased));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on non-touch devices or larger screens
  if (window.matchMedia('(min-width: 768px)').matches) {
    new ScrollProgressRing({
      showAfter: 300
    });
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollProgressRing;
}
