/**
 * SVG Path Draw System - v23.0
 * Scroll-triggered SVG path drawing animations
 */

class SVGDrawSystem {
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '-10% 0px',
      threshold: options.threshold || 0.2,
      once: options.once !== false,
      ...options
    };
    
    this.observer = null;
    this.elements = [];
    this.progressElements = [];
    this.isTicking = false;
    
    this.init();
  }
  
  init() {
    // Check for reduced motion
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (this.prefersReducedMotion) {
      this.showAllSVGs();
      return;
    }
    
    this.setupIntersectionObserver();
    this.collectElements();
    this.bindEvents();
    this.preparePaths();
  }
  
  showAllSVGs() {
    document.querySelectorAll('[data-svg-draw], [data-svg-draw-progress], [data-svg-morph]').forEach(el => {
      el.classList.add('is-drawn');
    });
  }
  
  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.triggerDraw(entry.target);
          if (this.options.once) {
            this.observer.unobserve(entry.target);
          }
        } else if (!this.options.once) {
          this.resetDraw(entry.target);
        }
      });
    }, {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });
  }
  
  collectElements() {
    const selectors = ['[data-svg-draw]', '[data-svg-morph]'];
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        this.elements.push(el);
        this.observer.observe(el);
      });
    });
    
    document.querySelectorAll('[data-svg-draw-progress]').forEach(el => {
      this.progressElements.push(el);
    });
  }
  
  preparePaths() {
    this.elements.forEach(container => {
      const paths = container.querySelectorAll('path, line, circle, rect, polyline, polygon');
      paths.forEach(path => {
        try {
          const length = path.getTotalLength ? path.getTotalLength() : 1000;
          path.style.setProperty('--path-length', length);
          path.style.strokeDasharray = length;
          path.style.strokeDashoffset = length;
        } catch (e) {
          path.style.setProperty('--path-length', 1000);
        }
      });
    });
    
    this.progressElements.forEach(container => {
      const paths = container.querySelectorAll('path, line, circle, rect, polyline, polygon');
      paths.forEach(path => {
        try {
          const length = path.getTotalLength ? path.getTotalLength() : 1000;
          path.style.setProperty('--path-length', length);
          path.style.strokeDasharray = length;
        } catch (e) {
          path.style.setProperty('--path-length', 1000);
        }
      });
    });
  }
  
  triggerDraw(element) {
    const delay = parseInt(element.dataset.svgDelay) || 0;
    setTimeout(() => {
      element.classList.add('is-drawn');
    }, delay);
  }
  
  resetDraw(element) {
    element.classList.remove('is-drawn');
  }
  
  bindEvents() {
    if (this.progressElements.length > 0) {
      window.addEventListener('scroll', () => {
        if (!this.isTicking) {
          requestAnimationFrame(() => {
            this.updateProgressDrawings();
            this.isTicking = false;
          });
          this.isTicking = true;
        }
      }, { passive: true });
    }
  }
  
  updateProgressDrawings() {
    const windowHeight = window.innerHeight;
    
    this.progressElements.forEach(container => {
      const rect = container.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      let progress = 0;
      if (elementTop < windowHeight && elementTop + elementHeight > 0) {
        progress = (windowHeight - elementTop) / (windowHeight + elementHeight);
        progress = Math.max(0, Math.min(1, progress));
      }
      
      container.style.setProperty('--draw-progress', progress);
    });
  }
  
  refresh() {
    this.preparePaths();
  }
  
  destroy() {
    this.observer.disconnect();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.svgDrawSystem = new SVGDrawSystem({
    once: true,
    rootMargin: '-10% 0px',
    threshold: 0.3
  });
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SVGDrawSystem;
}
