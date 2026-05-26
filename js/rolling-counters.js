/**
 * BuildBridge v12.0 - Rolling Counter Animations
 * Fortune 500 Quality Number Counting with Scroll Trigger
 */

(function() {
  'use strict';

  class RollingCounter {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        duration: 2000,
        easing: 'easeOutExpo',
        separator: ',',
        decimal: '.',
        prefix: '',
        suffix: '',
        startOnView: true,
        once: true,
        ...options
      };
      
      this.target = parseInt(element.dataset.target) || 0;
      this.prefix = element.dataset.prefix || this.options.prefix;
      this.suffix = element.dataset.suffix || this.options.suffix;
      this.hasAnimated = false;
      
      this.init();
    }
    
    init() {
      this.setupElement();
      
      if (this.options.startOnView) {
        this.observeIntersection();
      } else {
        this.animate();
      }
    }
    
    setupElement() {
      this.element.classList.add('rolling-counter-container');
      this.element.innerHTML = `
        <span class="rolling-counter-prefix">${this.prefix}</span>
        <span class="rolling-counter-digits"></span>
        <span class="rolling-counter-suffix">${this.suffix}</span>
      `;
      this.digitsContainer = this.element.querySelector('.rolling-counter-digits');
    }
    
    observeIntersection() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.animate();
            if (this.options.once) {
              this.hasAnimated = true;
            }
          }
        });
      }, {
        threshold: 0.5,
        rootMargin: '0px 0px -10% 0px'
      });
      
      observer.observe(this.element);
    }
    
    animate() {
      const targetStr = this.target.toString();
      const digits = targetStr.split('');
      
      // Create digit rollers
      this.digitsContainer.innerHTML = digits.map((digit, index) => `
        <span class="rolling-counter-digit" data-digit="${digit}" data-index="${index}">
          <span class="rolling-counter-digit-inner">
            ${this.generateDigitSequence(parseInt(digit))}
          </span>
        </span>
      `).join('');
      
      // Animate each digit with staggered delay
      const digitElements = this.digitsContainer.querySelectorAll('.rolling-counter-digit-inner');
      digitElements.forEach((el, index) => {
        const targetDigit = parseInt(digits[index]);
        const rollPercentage = -(targetDigit * 10);
        
        setTimeout(() => {
          el.style.setProperty('--roll-target', `${rollPercentage}%`);
          el.classList.add('rolling');
        }, index * 100);
      });
      
      // Add completion effect
      setTimeout(() => {
        this.element.classList.add('animated');
        this.addPlusAnimation();
      }, this.options.duration);
    }
    
    generateDigitSequence(targetDigit) {
      let sequence = '';
      for (let i = 0; i <= 9; i++) {
        sequence += `<span class="digit">${i}</span>`;
      }
      // Add target digit at the end for landing
      sequence += `<span class="digit">${targetDigit}</span>`;
      return sequence;
    }
    
    addPlusAnimation() {
      const suffix = this.element.querySelector('.rolling-counter-suffix');
      if (suffix && this.suffix.includes('+')) {
        const plus = document.createElement('span');
        plus.className = 'counter-suffix-plus';
        plus.textContent = '+';
        suffix.innerHTML = '';
        suffix.appendChild(plus);
        
        requestAnimationFrame(() => {
          plus.classList.add('visible');
        });
      }
    }
  }

  // Enhanced Counter with slot machine effect
  class SlotCounter {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        duration: 1500,
        delay: 0,
        ...options
      };
      
      this.target = parseInt(element.dataset.target) || 0;
      this.prefix = element.dataset.prefix || '';
      this.suffix = element.dataset.suffix || '';
      
      this.init();
    }
    
    init() {
      this.element.classList.add('slot-counter');
      this.observeIntersection();
    }
    
    observeIntersection() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => this.animate(), this.options.delay);
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(this.element);
    }
    
    animate() {
      const targetStr = this.target.toString().padStart(3, '0');
      const digits = targetStr.split('');
      
      this.element.innerHTML = `
        ${this.prefix ? `<span class="rolling-counter-prefix">${this.prefix}</span>` : ''}
        ${digits.map((digit, i) => `
          <span class="rolling-counter-digit" style="animation-delay: ${i * 0.1}s">
            <span class="rolling-counter-digit-inner" style="--roll-target: -${(parseInt(digit) + 9) * 10}%">
              ${Array.from({length: 10}, (_, j) => `<span class="digit">${j}</span>`).join('')}
              ${Array.from({length: 10}, (_, j) => `<span class="digit">${j}</span>`).join('')}
            </span>
          </span>
        `).join('')}
        ${this.suffix ? `<span class="rolling-counter-suffix">${this.suffix}</span>` : ''}
      `;
      
      // Trigger reflow
      this.element.offsetHeight;
      
      // Add rolling class to all digits
      this.element.querySelectorAll('.rolling-counter-digit-inner').forEach((el, i) => {
        setTimeout(() => el.classList.add('rolling'), i * 100);
      });
    }
  }

  // Percentage Circle Counter
  class PercentageCounter {
    constructor(element) {
      this.element = element;
      this.target = parseInt(element.dataset.percentage) || 0;
      this.init();
    }
    
    init() {
      this.element.innerHTML = `
        <svg width="120" height="120" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#d4af37"/>
              <stop offset="50%" style="stop-color:#f4e4ba"/>
              <stop offset="100%" style="stop-color:#d4af37"/>
            </linearGradient>
          </defs>
          <circle class="percentage-counter-circle" cx="60" cy="60" r="54"/>
          <circle class="percentage-counter-progress" cx="60" cy="60" r="54"/>
        </svg>
        <span class="percentage-counter-value">0%</span>
      `;
      
      this.progressCircle = this.element.querySelector('.percentage-counter-progress');
      this.valueElement = this.element.querySelector('.percentage-counter-value');
      
      this.observeIntersection();
    }
    
    observeIntersection() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animate();
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(this.element);
    }
    
    animate() {
      const circumference = 2 * Math.PI * 54;
      const offset = circumference - (this.target / 100) * circumference;
      
      this.progressCircle.style.strokeDashoffset = offset;
      
      // Animate number
      let current = 0;
      const increment = this.target / 60;
      const timer = setInterval(() => {
        current += increment;
        if (current >= this.target) {
          current = this.target;
          clearInterval(timer);
        }
        this.valueElement.textContent = Math.round(current) + '%';
      }, 25);
    }
  }

  // Initialize all counters
  function initRollingCounters() {
    // Standard rolling counters
    document.querySelectorAll('[data-rolling-counter]').forEach(el => {
      new RollingCounter(el);
    });
    
    // Enhanced counters with data-target
    document.querySelectorAll('.enhanced-counter[data-target]').forEach(el => {
      new RollingCounter(el, { duration: 2000 });
    });
    
    // Slot machine counters
    document.querySelectorAll('[data-slot-counter]').forEach(el => {
      new SlotCounter(el);
    });
    
    // Percentage circle counters
    document.querySelectorAll('[data-percentage-counter]').forEach(el => {
      new PercentageCounter(el);
    });
  }

  // Expose to global scope
  window.RollingCounter = RollingCounter;
  window.SlotCounter = SlotCounter;
  window.PercentageCounter = PercentageCounter;
  window.initRollingCounters = initRollingCounters;

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRollingCounters);
  } else {
    initRollingCounters();
  }

  console.log('🎯 BuildBridge Rolling Counters v12.0 initialized');
})();
