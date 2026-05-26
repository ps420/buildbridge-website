/**
 * BuildBridge Clip-Path Reveal Controller
 * Fortune 500 Quality - JavaScript controller for geometric reveal animations
 * Uses Intersection Observer for performant scroll-triggered reveals
 */

class ClipPathReveal {
  constructor(options = {}) {
    this.selector = options.selector || '[data-clip-reveal]';
    this.threshold = options.threshold || 0.2;
    this.rootMargin = options.rootMargin || '0px 0px -50px 0px';
    this.staggerDelay = options.staggerDelay || 100;
    this.once = options.once !== false;
    
    this.observer = null;
    this.elements = [];
    
    this.init();
  }
  
  init() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Show all elements immediately
      document.querySelectorAll(this.selector).forEach(el => {
        el.classList.add('revealed');
      });
      return;
    }
    
    this.createObserver();
    this.observeElements();
  }
  
  createObserver() {
    const options = {
      threshold: this.threshold,
      rootMargin: this.rootMargin
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.reveal(entry.target);
          
          if (this.once) {
            this.observer.unobserve(entry.target);
          }
        } else if (!this.once) {
          this.hide(entry.target);
        }
      });
    }, options);
  }
  
  observeElements() {
    this.elements = document.querySelectorAll(this.selector);
    
    this.elements.forEach(el => {
      // Add base clip-reveal class
      el.classList.add('clip-reveal');
      
      // Get specific clip type
      const clipType = el.dataset.clipReveal || 'circle';
      el.classList.add(`clip-reveal-${clipType}`);
      
      // Add speed modifier
      if (el.dataset.clipSpeed) {
        el.classList.add(`clip-reveal-${el.dataset.clipSpeed}`);
      }
      
      // Add easing modifier
      if (el.dataset.clipEase) {
        el.classList.add(`clip-reveal-${el.dataset.clipEase}`);
      }
      
      this.observer.observe(el);
    });
  }
  
  reveal(element) {
    // Handle stagger for child elements
    const staggerSelector = element.dataset.clipStagger;
    if (staggerSelector) {
      const children = element.querySelectorAll(staggerSelector);
      children.forEach((child, index) => {
        setTimeout(() => {
          child.classList.add('revealed');
        }, index * this.staggerDelay);
      });
    }
    
    // Handle group stagger
    const groupName = element.dataset.clipGroup;
    if (groupName) {
      const group = document.querySelectorAll(`[data-clip-group="${groupName}"]`);
      const index = Array.from(group).indexOf(element);
      setTimeout(() => {
        element.classList.add('revealed');
      }, index * this.staggerDelay);
    } else {
      element.classList.add('revealed');
    }
    
    // Dispatch custom event
    element.dispatchEvent(new CustomEvent('clipReveal', { 
      detail: { element, type: element.dataset.clipReveal } 
    }));
  }
  
  hide(element) {
    element.classList.remove('revealed');
  }
  
  revealAll() {
    this.elements.forEach(el => this.reveal(el));
  }
  
  hideAll() {
    this.elements.forEach(el => this.hide(el));
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
  
  // Static method for one-off reveals
  static reveal(element, type = 'circle', duration = 1000) {
    element.classList.add('clip-reveal', `clip-reveal-${type}`);
    
    // Force reflow
    void element.offsetWidth;
    
    element.classList.add('revealed');
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(element);
      }, duration);
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.clipPathReveal = new ClipPathReveal({
    threshold: 0.15,
    staggerDelay: 120
  });
});

// Export
window.ClipPathReveal = ClipPathReveal;
