/**
 * v31.0 - Animated Counter Rings
 * Fortune 500 Quality Animated Statistics with SVG Progress Rings
 */

(function() {
  'use strict';

  class AnimatedCounterRings {
    constructor() {
      this.items = document.querySelectorAll('.counter-ring-item');
      this.animated = new Set();
      this.init();
    }

    init() {
      if (this.items.length === 0) return;

      // Use Intersection Observer for scroll-triggered animation
      const observer = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        {
          threshold: 0.3,
          rootMargin: '0px 0px -50px 0px'
        }
      );

      this.items.forEach(item => {
        // Calculate progress offset based on data attribute
        const percentage = parseInt(item.dataset.percentage, 10) || 0;
        const circumference = 2 * Math.PI * 80; // r=80
        const offset = circumference - (percentage / 100) * circumference;
        item.style.setProperty('--progress-offset', offset);
        
        observer.observe(item);
      });
    }

    handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animated.has(entry.target)) {
          this.animateItem(entry.target);
          this.animated.add(entry.target);
        }
      });
    }

    animateItem(item) {
      // Add animate class for CSS transitions
      item.classList.add('animate');

      // Animate the number counting
      const numberEl = item.querySelector('.counter-ring-number');
      const targetValue = parseInt(item.dataset.value, 10) || 0;
      const suffix = item.dataset.suffix || '';
      const duration = 2500;

      this.countUp(numberEl, targetValue, duration, suffix);
    }

    countUp(element, target, duration, suffix) {
      const start = performance.now();
      const startValue = 0;

      const step = (timestamp) => {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function: easeOutExpo
        const easeProgress = 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(startValue + (target - startValue) * easeProgress);
        
        element.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          element.textContent = target.toLocaleString() + suffix;
        }
      };

      requestAnimationFrame(step);
    }

    // Static method to refresh (useful for dynamically added content)
    static refresh() {
      new AnimatedCounterRings();
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AnimatedCounterRings());
  } else {
    new AnimatedCounterRings();
  }

  // Expose to global scope
  window.AnimatedCounterRings = AnimatedCounterRings;
})();
