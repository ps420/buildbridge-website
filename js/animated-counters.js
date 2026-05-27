/**
 * Animated Counters v16.0
 * Professional number counting animations with currency formatting
 */

(function() {
  'use strict';
  
  const AnimatedCounters = {
    config: {
      duration: 2000,
      easing: 'easeOutExpo',
      separator: ',',
      decimal: '.'
    },
    
    easingFunctions: {
      easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
      easeOutQuart: t => 1 - Math.pow(1 - t, 4),
      easeOutQuad: t => 1 - (1 - t) * (1 - t),
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      easeOutBack: t => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      }
    },
    
    init() {
      this.findCounters();
      this.setupObserver();
    },
    
    findCounters() {
      const counters = document.querySelectorAll('[data-counter]');
      counters.forEach(counter => {
        this.prepareCounter(counter);
      });
    },
    
    prepareCounter(element) {
      const target = parseFloat(element.dataset.counter);
      const prefix = element.dataset.prefix || '';
      const suffix = element.dataset.suffix || '';
      const decimals = parseInt(element.dataset.decimals) || 0;
      const duration = parseInt(element.dataset.duration) || this.config.duration;
      const easing = element.dataset.easing || this.config.easing;
      const odometer = element.dataset.odometer === 'true';
      
      // Store configuration
      element._counterConfig = {
        target,
        prefix,
        suffix,
        decimals,
        duration,
        easing,
        odometer
      };
      
      // Set initial value
      element.textContent = prefix + this.formatNumber(0, decimals) + suffix;
      
      // Add counter class
      element.classList.add('animated-counter');
    },
    
    setupObserver() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.5
      });
      
      document.querySelectorAll('[data-counter]').forEach(counter => {
        this.observer.observe(counter);
      });
    },
    
    animateCounter(element) {
      const config = element._counterConfig;
      if (!config) return;
      
      const startTime = performance.now();
      const startValue = 0;
      const endValue = config.target;
      const easingFn = this.easingFunctions[config.easing] || this.easingFunctions.easeOutExpo;
      
      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / config.duration, 1);
        const easedProgress = easingFn(progress);
        
        const currentValue = startValue + (endValue - startValue) * easedProgress;
        element.textContent = config.prefix + this.formatNumber(currentValue, config.decimals) + config.suffix;
        
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // Ensure final value is exact
          element.textContent = config.prefix + this.formatNumber(endValue, config.decimals) + config.suffix;
          element.classList.add('counted');
          element.dispatchEvent(new CustomEvent('counterComplete'));
        }
      };
      
      requestAnimationFrame(step);
    },
    
    formatNumber(value, decimals) {
      const fixed = value.toFixed(decimals);
      const parts = fixed.split('.');
      
      // Add thousand separators
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.config.separator);
      
      return parts.join(this.config.decimal);
    },
    
    /**
     * Create an odometer-style counter
     */
    createOdometer(element, target, config = {}) {
      const {
        duration = 2000,
        prefix = '',
        suffix = ''
      } = config;
      
      const digits = String(Math.floor(target)).split('');
      
      element.innerHTML = `
        ${prefix ? `<span class="counter-prefix">${prefix}</span>` : ''}
        <span class="counter-value odometer-digits">
          ${digits.map(() => `
            <span class="digit">
              <span class="digit-track">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
              </span>
            </span>
          `).join('')}
        </span>
        ${suffix ? `<span class="counter-suffix">${suffix}</span>` : ''}
      `;
      
      const digitTracks = element.querySelectorAll('.digit-track');
      
      // Animate each digit
      digitTracks.forEach((track, index) => {
        const digitValue = parseInt(digits[index]);
        const delay = (digits.length - index - 1) * 100;
        
        setTimeout(() => {
          track.style.transform = `translateY(-${digitValue * 10}%)`;
        }, delay);
      });
    },
    
    /**
     * Animate progress ring
     */
    animateProgressRing(element, targetPercent, duration = 2000) {
      const circle = element.querySelector('.progress-ring-fill');
      if (!circle) return;
      
      const radius = circle.r.baseVal.value;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (targetPercent / 100) * circumference;
      
      circle.style.strokeDasharray = circumference;
      circle.style.strokeDashoffset = circumference;
      
      // Trigger animation
      requestAnimationFrame(() => {
        circle.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        circle.style.strokeDashoffset = offset;
      });
      
      // Animate counter
      const counter = element.querySelector('.counter-value');
      if (counter) {
        counter.dataset.counter = targetPercent;
        counter.dataset.suffix = '%';
        this.prepareCounter(counter);
        this.animateCounter(counter);
      }
    }
  };
  
  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AnimatedCounters.init());
  } else {
    AnimatedCounters.init();
  }
  
  // Expose globally
  window.AnimatedCounters = AnimatedCounters;
})();
