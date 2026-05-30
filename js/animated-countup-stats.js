/**
 * v104.0: Animated Count-Up Stats - Fortune 500 Professional Counter System
 * Smooth, performant number counting with intersection observer
 */

(function() {
  'use strict';

  class AnimatedCountUp {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        duration: 2000,
        easing: 'easeOutExpo',
        separator: ',',
        decimal: '.',
        prefix: '',
        suffix: '',
        decimals: 0,
        ...options
      };
      
      this.target = parseFloat(element.dataset.target) || 0;
      this.prefix = element.dataset.prefix || this.options.prefix;
      this.suffix = element.dataset.suffix || this.options.suffix;
      this.decimals = parseInt(element.dataset.decimals) || this.options.decimals;
      this.duration = parseInt(element.dataset.duration) || this.options.duration;
      
      this.hasAnimated = false;
      this.startTime = null;
      this.startValue = 0;
      
      this.init();
    }

    init() {
      // Set up structure
      this.element.innerHTML = `
        <span class="prefix">${this.prefix}</span>
        <span class="number-value">0</span>
        <span class="suffix">${this.suffix}</span>
      `;
      
      this.valueElement = this.element.querySelector('.number-value');
      
      // Create observer
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.animate();
          }
        });
      }, { threshold: 0.3 });
      
      this.observer.observe(this.element.closest('.animated-stat-item'));
    }

    animate() {
      this.hasAnimated = true;
      this.startTime = performance.now();
      this.startValue = 0;
      
      // Add visible class to parent
      const parent = this.element.closest('.animated-stat-item');
      if (parent) {
        parent.classList.add('visible');
      }
      
      this.tick();
    }

    tick() {
      const now = performance.now();
      const elapsed = now - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      
      // Easing function
      const eased = this.easeOutExpo(progress);
      
      // Calculate current value
      const current = this.startValue + (this.target - this.startValue) * eased;
      
      // Format and display
      this.valueElement.textContent = this.formatNumber(current);
      
      if (progress < 1) {
        requestAnimationFrame(() => this.tick());
      } else {
        // Ensure final value is exact
        this.valueElement.textContent = this.formatNumber(this.target);
        this.onComplete();
      }
    }

    easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    formatNumber(num) {
      const fixed = num.toFixed(this.decimals);
      const parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.options.separator);
      return parts.join(this.options.decimal);
    }

    onComplete() {
      // Trigger any completion callbacks
      const event = new CustomEvent('countupComplete', { 
        detail: { target: this.target, element: this.element } 
      });
      this.element.dispatchEvent(event);
    }

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }

  // Initialize on DOM ready
  function init() {
    const statNumbers = document.querySelectorAll('.animated-stat-number[data-target]');
    
    statNumbers.forEach(el => {
      new AnimatedCountUp(el);
    });
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose to global scope for manual initialization
  window.AnimatedCountUp = AnimatedCountUp;
})();
