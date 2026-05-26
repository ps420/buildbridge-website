/**
 * BuildBridge Advanced Scroll-Triggered Counter
 * Fortune 500 Quality - Animated number counter with easing and formatting
 */

class AdvancedCounter {
  constructor(element, options = {}) {
    this.element = element;
    this.target = parseInt(element.dataset.target) || 0;
    this.prefix = element.dataset.prefix || '';
    this.suffix = element.dataset.suffix || '';
    this.duration = parseInt(element.dataset.duration) || 2000;
    this.easing = element.dataset.easing || 'easeOutExpo';
    this.startTime = null;
    this.hasAnimated = false;
    this.observer = null;
    
    this.init();
  }

  init() {
    // Set initial value
    this.updateDisplay(0);
    
    // Create intersection observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.start();
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px'
    });
    
    this.observer.observe(this.element);
  }

  start() {
    if (this.hasAnimated) return;
    this.hasAnimated = true;
    this.startTime = performance.now();
    this.animate();
    
    // Add animated class for CSS effects
    this.element.classList.add('counter--animated');
  }

  animate() {
    const elapsed = performance.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    
    // Apply easing
    const easedProgress = this.applyEasing(progress);
    const currentValue = Math.round(easedProgress * this.target);
    
    this.updateDisplay(currentValue);
    
    if (progress < 1) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.updateDisplay(this.target);
      this.element.classList.add('counter--complete');
    }
  }

  applyEasing(progress) {
    const easings = {
      linear: t => t,
      easeInQuad: t => t * t,
      easeOutQuad: t => 1 - (1 - t) * (1 - t),
      easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
      easeOutCubic: t => 1 - Math.pow(1 - t, 3),
      easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
      easeOutBack: t => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      }
    };
    
    return (easings[this.easing] || easings.easeOutExpo)(progress);
  }

  updateDisplay(value) {
    // Format number with commas
    const formatted = this.formatNumber(value);
    this.element.textContent = this.prefix + formatted + this.suffix;
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return num.toLocaleString();
    }
    return num.toString();
  }

  reset() {
    this.hasAnimated = false;
    this.startTime = null;
    this.updateDisplay(0);
    this.element.classList.remove('counter--animated', 'counter--complete');
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize all counters on page
document.addEventListener('DOMContentLoaded', () => {
  const counters = document.querySelectorAll('[data-counter], .enhanced-counter');
  
  counters.forEach(counter => {
    // Skip if already initialized
    if (counter.dataset.counterInitialized) return;
    counter.dataset.counterInitialized = 'true';
    
    new AdvancedCounter(counter, {
      duration: 2000,
      easing: 'easeOutExpo'
    });
  });
});

// Export for global access
window.AdvancedCounter = AdvancedCounter;

console.log('🔢 Advanced Counter initialized');
