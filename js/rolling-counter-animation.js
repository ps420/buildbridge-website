/**
 * v30.0: Rolling Counter Animation
 * Fortune 500 Animated Statistics System
 * 
 * Features:
 * - Slot-machine style number rolling
 * - Count-up animations with easing
 * - Human-readable formatting (K, M, B)
 * - Intersection Observer for scroll triggers
 * - Simultaneous digit animation
 */

class RollingCounter {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      startValue: options.startValue || 0,
      endValue: options.endValue || parseInt(element.dataset.target) || 100,
      duration: options.duration || parseInt(element.dataset.duration) || 2000,
      prefix: options.prefix || element.dataset.prefix || '',
      suffix: options.suffix || element.dataset.suffix || '',
      separator: options.separator || ',',
      decimals: options.decimals || parseInt(element.dataset.decimals) || 0,
      easing: options.easing || 'easeOutExpo',
      humanize: options.humanize !== false,
      ...options
    };
    
    this.isAnimating = false;
    this.rafId = null;
    
    this.init();
  }
  
  init() {
    // Set initial value
    this.element.textContent = this.formatNumber(this.options.startValue);
    
    // Add tabular nums for consistent width
    this.element.style.fontVariantNumeric = 'tabular-nums';
    
    // Create slot machine digits if enabled
    if (this.element.dataset.slotMachine === 'true') {
      this.createSlotMachine();
    }
  }
  
  createSlotMachine() {
    const digits = String(this.options.endValue).length;
    this.element.innerHTML = '';
    this.element.classList.add('slot-machine-counter');
    
    // Add prefix
    if (this.options.prefix) {
      const prefix = document.createElement('span');
      prefix.className = 'counter-prefix';
      prefix.textContent = this.options.prefix;
      this.element.appendChild(prefix);
    }
    
    // Create digit reels
    this.reels = [];
    for (let i = 0; i < digits; i++) {
      const reel = document.createElement('span');
      reel.className = 'counter-reel';
      reel.innerHTML = `
        <span class="reel-strip">
          ${Array.from({length: 10}, (_, j) => `<span class="reel-digit">${j}</span>`).join('')}
        </span>
      `;
      this.element.appendChild(reel);
      this.reels.push(reel);
    }
    
    // Add suffix
    if (this.options.suffix) {
      const suffix = document.createElement('span');
      suffix.className = 'counter-suffix';
      suffix.textContent = this.options.suffix;
      this.element.appendChild(suffix);
    }
  }
  
  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    const startTime = performance.now();
    const startValue = this.options.startValue;
    const endValue = this.options.endValue;
    const duration = this.options.duration;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply easing
      const easedProgress = this.ease(progress, this.options.easing);
      
      // Calculate current value
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      
      // Update display
      if (this.reels) {
        this.updateSlotMachine(currentValue);
      } else {
        this.element.textContent = this.formatNumber(currentValue);
      }
      
      if (progress < 1) {
        this.rafId = requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
        // Ensure final value is exact
        if (this.reels) {
          this.updateSlotMachine(endValue, true);
        } else {
          this.element.textContent = this.formatNumber(endValue);
        }
        this.emitComplete();
      }
    };
    
    this.rafId = requestAnimationFrame(animate);
  }
  
  updateSlotMachine(value, isFinal = false) {
    const digits = String(Math.floor(value)).padStart(this.reels.length, '0');
    
    this.reels.forEach((reel, index) => {
      const digit = parseInt(digits[index]) || 0;
      const strip = reel.querySelector('.reel-strip');
      const translateY = -digit * 100;
      
      strip.style.transform = `translateY(${translateY}%)`;
      strip.style.transition = isFinal ? 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
    });
  }
  
  formatNumber(value) {
    let num = parseFloat(value);
    
    // Humanize large numbers
    if (this.options.humanize && num >= 1000) {
      const suffixes = ['', 'K', 'M', 'B', 'T'];
      const suffixIndex = Math.floor(Math.log10(num) / 3);
      if (suffixIndex > 0 && suffixIndex < suffixes.length) {
        num = num / Math.pow(1000, suffixIndex);
        const formatted = num.toFixed(this.options.decimals);
        return this.options.prefix + formatted + suffixes[suffixIndex] + this.options.suffix;
      }
    }
    
    // Format with separators
    const parts = num.toFixed(this.options.decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.options.separator);
    
    return this.options.prefix + parts.join('.') + this.options.suffix;
  }
  
  ease(t, type) {
    switch (type) {
      case 'linear':
        return t;
      case 'easeInQuad':
        return t * t;
      case 'easeOutQuad':
        return 1 - (1 - t) * (1 - t);
      case 'easeInOutQuad':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'easeOutExpo':
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      case 'easeOutElastic':
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
      default:
        return t;
    }
  }
  
  emitComplete() {
    this.element.dispatchEvent(new CustomEvent('counterComplete', {
      detail: { value: this.options.endValue }
    }));
  }
  
  reset() {
    this.isAnimating = false;
    cancelAnimationFrame(this.rafId);
    this.element.textContent = this.formatNumber(this.options.startValue);
  }
  
  destroy() {
    this.reset();
    this.reels = null;
  }
}

// Auto-initialize counters
class RollingCounterSystem {
  constructor() {
    this.counters = [];
    this.observer = null;
    this.init();
  }
  
  init() {
    // Find all counter elements
    const elements = document.querySelectorAll('[data-counter], .rolling-counter, .counter-animate');
    
    if (elements.length === 0) return;
    
    // Setup intersection observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = this.counters.find(c => c.element === entry.target);
          if (counter && !counter.isAnimating) {
            // Delay for visual effect
            setTimeout(() => counter.start(), 200);
          }
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px'
    });
    
    // Initialize each counter
    elements.forEach(el => {
      const options = {
        endValue: parseInt(el.dataset.target) || parseInt(el.dataset.counter) || 100,
        duration: parseInt(el.dataset.duration) || 2000,
        prefix: el.dataset.prefix || '',
        suffix: el.dataset.suffix || '',
        decimals: parseInt(el.dataset.decimals) || 0,
        humanize: el.dataset.humanize !== 'false'
      };
      
      const counter = new RollingCounter(el, options);
      this.counters.push(counter);
      this.observer.observe(el);
    });
    
    console.log(`✨ Rolling Counter System initialized (${this.counters.length} counters)`);
  }
  
  refresh() {
    // Clear existing
    this.counters.forEach(c => c.destroy());
    this.counters = [];
    
    // Re-init
    this.init();
  }
  
  startAll() {
    this.counters.forEach(c => c.start());
  }
  
  resetAll() {
    this.counters.forEach(c => c.reset());
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.rollingCounterSystem = new RollingCounterSystem();
  });
} else {
  window.rollingCounterSystem = new RollingCounterSystem();
}

// Export for global access
window.RollingCounter = RollingCounter;
window.RollingCounterSystem = RollingCounterSystem;
