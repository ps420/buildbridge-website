/**
 * Advanced Viewport Entrance Animations
 * v98.0: Fortune 500 Scroll-Triggered Reveal System
 * Uses IntersectionObserver with sophisticated animation presets
 */

class ViewportAnimations {
  constructor() {
    this.observer = null;
    this.animatedElements = new Set();
    this.scrollProgressElements = [];
    this.parallaxElements = [];
    this.config = {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1,
      once: true // Only animate once
    };
    
    this.init();
  }
  
  init() {
    if (!this.supportsIntersectionObserver()) {
      this.showAllElements();
      return;
    }
    
    this.createObserver();
    this.findElements();
    this.bindScrollEvents();
    
    console.log('✨ ViewportAnimations initialized');
  }
  
  supportsIntersectionObserver() {
    return 'IntersectionObserver' in window &&
           'IntersectionObserverEntry' in window &&
           'intersectionRatio' in window.IntersectionObserverEntry.prototype;
  }
  
  createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
          
          if (this.config.once) {
            this.observer.unobserve(entry.target);
          }
        } else if (!this.config.once) {
          this.resetElement(entry.target);
        }
      });
    }, {
      rootMargin: this.config.rootMargin,
      threshold: this.config.threshold
    });
  }
  
  findElements() {
    // Find all elements with viewport animation classes
    const selector = '[class*="vp-"]:not(.vp-animated):not(.vp-stagger-group)';
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(el => {
      if (this.shouldAnimate(el)) {
        this.observer.observe(el);
      }
    });
    
    // Handle stagger groups specially
    const staggerGroups = document.querySelectorAll('.vp-stagger-group:not(.vp-animated)');
    staggerGroups.forEach(group => {
      this.observer.observe(group);
    });
    
    // Find scroll progress elements
    this.scrollProgressElements = document.querySelectorAll('[class*="vp-scroll-"]');
    
    // Find parallax elements
    this.parallaxElements = document.querySelectorAll('.vp-parallax-slow, .vp-parallax-medium, .vp-parallax-fast');
  }
  
  shouldAnimate(element) {
    // Skip if already animated
    if (this.animatedElements.has(element)) return false;
    
    // Skip if element has vp-stagger-item (animated by parent)
    if (element.classList.contains('vp-stagger-item')) return false;
    
    // Check if element has any vp- animation class
    const classes = element.classList;
    for (let i = 0; i < classes.length; i++) {
      if (classes[i].startsWith('vp-') && 
          classes[i] !== 'vp-animate' &&
          classes[i] !== 'vp-stagger-group' &&
          classes[i] !== 'vp-stagger-item') {
        return true;
      }
    }
    return false;
  }
  
  animateElement(element) {
    // Add animated class to trigger CSS transition
    element.classList.add('vp-animated');
    this.animatedElements.add(element);
    
    // Dispatch custom event
    element.dispatchEvent(new CustomEvent('vpanimate', {
      bubbles: true,
      detail: { element }
    }));
    
    // Handle stagger children
    if (element.classList.contains('vp-stagger-group')) {
      const children = element.querySelectorAll('.vp-stagger-item');
      children.forEach((child, index) => {
        setTimeout(() => {
          child.classList.add('vp-animated');
        }, index * 80);
      });
    }
  }
  
  resetElement(element) {
    element.classList.remove('vp-animated');
    this.animatedElements.delete(element);
    
    // Reset stagger children
    if (element.classList.contains('vp-stagger-group')) {
      const children = element.querySelectorAll('.vp-stagger-item');
      children.forEach(child => {
        child.classList.remove('vp-animated');
      });
    }
  }
  
  bindScrollEvents() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateScrollProgress();
          this.updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
  
  updateScrollProgress() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Global scroll progress (0 to 1)
    const globalProgress = Math.min(scrollY / (documentHeight - windowHeight), 1);
    document.documentElement.style.setProperty('--scroll-progress', globalProgress);
    
    // Element-specific scroll progress
    this.scrollProgressElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementProgress = 1 - (rect.top / windowHeight);
      el.style.setProperty('--scroll-progress', Math.max(0, Math.min(1, elementProgress)));
    });
  }
  
  updateParallax() {
    const scrollY = window.scrollY;
    
    this.parallaxElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const offset = scrollY - elementTop + window.innerHeight;
      
      if (offset > -window.innerHeight && offset < rect.height + window.innerHeight * 2) {
        el.style.setProperty('--scroll-offset', offset);
      }
    });
  }
  
  showAllElements() {
    // Fallback: show all elements immediately
    document.querySelectorAll('[class*="vp-"]').forEach(el => {
      el.classList.add('vp-animated');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
  
  // Public API
  refresh() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.createObserver();
    this.findElements();
  }
  
  animate(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      this.animateElement(element);
    }
  }
  
  setConfig(config) {
    this.config = { ...this.config, ...config };
    this.refresh();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.viewportAnimations = new ViewportAnimations();
  });
} else {
  window.viewportAnimations = new ViewportAnimations();
}

// Re-initialize after dynamic content loads
window.addEventListener('contentloaded', () => {
  if (window.viewportAnimations) {
    window.viewportAnimations.refresh();
  }
});
