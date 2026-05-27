/**
 * Scroll-Triggered Animations - v23.0
 * GSAP-like scroll animations without external dependencies
 * Supports: IntersectionObserver-based triggers, parallax, pinning, and progress-driven animations
 */

class ScrollAnimations {
  constructor(options = {}) {
    this.options = {
      root: null,
      rootMargin: options.rootMargin || '0px 0px -10% 0px',
      threshold: options.threshold || 0.1,
      once: options.once !== false, // Only animate once by default
      parallaxEnabled: options.parallaxEnabled !== false,
      pinEnabled: options.pinEnabled !== false,
      ...options
    };
    
    this.observer = null;
    this.elements = [];
    this.parallaxElements = [];
    this.pinnedElements = [];
    this.progressElements = [];
    this.scrollY = 0;
    this.scrollVelocity = 0;
    this.lastScrollY = 0;
    this.isTicking = false;
    
    this.init();
  }
  
  init() {
    // Check for reduced motion preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (this.prefersReducedMotion) {
      this.showAllElements();
      return;
    }
    
    this.setupIntersectionObserver();
    this.collectElements();
    this.bindEvents();
  }
  
  showAllElements() {
    // Show all animated elements immediately if reduced motion is preferred
    document.querySelectorAll('[data-scroll-animate], [data-scroll-stagger]').forEach(el => {
      el.classList.add('is-visible');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
  
  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.triggerAnimation(entry.target);
          
          if (this.options.once) {
            this.observer.unobserve(entry.target);
          }
        } else if (!this.options.once) {
          this.resetAnimation(entry.target);
        }
      });
    }, {
      root: this.options.root,
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });
  }
  
  collectElements() {
    // Collect all scroll-animated elements
    const selectors = [
      '[data-scroll-animate]',
      '[data-scroll-stagger]',
      '[data-scroll-split]'
    ];
    
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        this.elements.push(el);
        this.observer.observe(el);
      });
    });
    
    // Collect parallax elements
    if (this.options.parallaxEnabled) {
      document.querySelectorAll('[data-scroll-parallax]').forEach(el => {
        this.parallaxElements.push({
          element: el,
          speed: parseFloat(el.dataset.scrollParallax) || 0.5,
          direction: el.dataset.scrollDirection || 'vertical'
        });
      });
    }
    
    // Collect progress-based elements
    document.querySelectorAll('[data-scroll-progress]').forEach(el => {
      this.progressElements.push({
        element: el,
        property: el.dataset.scrollProgress || 'opacity',
        start: parseFloat(el.dataset.scrollStart) || 0,
        end: parseFloat(el.dataset.scrollEnd) || 1
      });
    });
    
    // Handle text splitting
    document.querySelectorAll('[data-scroll-split]').forEach(el => {
      this.splitText(el);
    });
  }
  
  splitText(element) {
    const text = element.textContent;
    element.innerHTML = '';
    
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.transitionDelay = `${i * 0.03}s`;
      element.appendChild(span);
    });
  }
  
  triggerAnimation(element) {
    // Add slight random delay for natural feel
    const baseDelay = parseInt(element.dataset.scrollDelay) || 0;
    const randomDelay = Math.random() * 50;
    
    setTimeout(() => {
      element.classList.add('is-visible');
    }, baseDelay + randomDelay);
  }
  
  resetAnimation(element) {
    element.classList.remove('is-visible');
  }
  
  bindEvents() {
    // Scroll handler with RAF throttling
    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
      
      if (!this.isTicking) {
        requestAnimationFrame(() => {
          this.onScroll();
          this.isTicking = false;
        });
        this.isTicking = true;
      }
    }, { passive: true });
    
    // Resize handler
    window.addEventListener('resize', () => {
      this.onResize();
    }, { passive: true });
  }
  
  onScroll() {
    // Calculate scroll velocity
    this.scrollVelocity = this.scrollY - this.lastScrollY;
    this.lastScrollY = this.scrollY;
    
    // Add velocity class to body for CSS hooks
    document.body.classList.toggle('velocity-fast', Math.abs(this.scrollVelocity) > 50);
    document.body.classList.toggle('velocity-slow', Math.abs(this.scrollVelocity) < 10);
    
    // Update parallax elements
    this.updateParallax();
    
    // Update progress elements
    this.updateProgressElements();
    
    // Clear velocity classes after scroll stops
    clearTimeout(this.velocityTimeout);
    this.velocityTimeout = setTimeout(() => {
      document.body.classList.remove('velocity-fast', 'velocity-slow');
    }, 150);
  }
  
  updateParallax() {
    const windowHeight = window.innerHeight;
    
    this.parallaxElements.forEach(item => {
      const rect = item.element.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const windowCenter = windowHeight / 2;
      const distance = elementCenter - windowCenter;
      
      // Calculate parallax offset
      let offset = distance * item.speed * -0.1;
      
      // Apply transform
      if (item.direction === 'horizontal') {
        item.element.style.transform = `translateX(${offset}px)`;
      } else if (item.direction === 'rotate') {
        item.element.style.transform = `rotate(${offset * 0.1}deg)`;
      } else if (item.direction === 'scale') {
        const scale = 1 + (distance / windowHeight) * item.speed * 0.1;
        item.element.style.transform = `scale(${Math.max(0.8, Math.min(1.2, scale))})`;
      } else {
        item.element.style.transform = `translateY(${offset}px)`;
      }
    });
  }
  
  updateProgressElements() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = Math.min(1, Math.max(0, this.scrollY / docHeight));
    
    this.progressElements.forEach(item => {
      const localProgress = (scrollProgress - item.start) / (item.end - item.start);
      const clampedProgress = Math.min(1, Math.max(0, localProgress));
      
      item.element.style.setProperty('--scroll-progress', clampedProgress);
      
      // Apply different properties based on type
      switch(item.property) {
        case 'opacity':
          item.element.style.opacity = clampedProgress;
          break;
        case 'scale':
          item.element.style.transform = `scale(${0.5 + clampedProgress * 0.5})`;
          break;
        case 'rotate':
          item.element.style.transform = `rotate(${clampedProgress * 360}deg)`;
          break;
        case 'translateX':
          item.element.style.transform = `translateX(${(clampedProgress - 0.5) * 100}px)`;
          break;
        case 'translateY':
          item.element.style.transform = `translateY(${(clampedProgress - 0.5) * 100}px)`;
          break;
      }
    });
  }
  
  onResize() {
    // Recalculate any position-based values
    this.updateParallax();
  }
  
  // Public API methods
  refresh() {
    // Re-collect and observe new elements
    this.observer.disconnect();
    this.elements = [];
    this.parallaxElements = [];
    this.progressElements = [];
    this.collectElements();
  }
  
  disable() {
    this.observer.disconnect();
    this.showAllElements();
  }
  
  destroy() {
    this.observer.disconnect();
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onResize);
  }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.scrollAnimations = new ScrollAnimations({
    once: true,
    parallaxEnabled: true,
    rootMargin: '0px 0px -10% 0px'
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollAnimations;
}
