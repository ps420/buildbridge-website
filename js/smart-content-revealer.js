/**
 * Smart Content Revealer v36.2
 * Fortune 500 Intelligent Stagger Reveal System
 * Context-aware animations with intersection observer
 */

class SmartContentRevealer {
  constructor(options = {}) {
    this.options = {
      selector: '.smart-reveal-item',
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
      once: true,
      staggerDelay: 100,
      ...options
    };
    
    this.observer = null;
    this.revealedElements = new Set();
    this.containers = new Map();
    
    this.init();
  }
  
  init() {
    this.setupIntersectionObserver();
    this.findAndObserveElements();
    this.setupContainerStagger();
    this.setupTextReveal();
    this.setupGridAwareness();
    this.setupRipplePattern();
  }
  
  setupIntersectionObserver() {
    const observerOptions = {
      threshold: this.options.threshold,
      rootMargin: this.options.rootMargin
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.reveal(entry.target);
          
          if (this.options.once) {
            this.observer.unobserve(entry.target);
          }
        } else if (!this.options.once) {
          this.hide(entry.target);
        }
      });
    }, observerOptions);
  }
  
  findAndObserveElements() {
    const elements = document.querySelectorAll(this.options.selector);
    elements.forEach(el => {
      el.classList.add('smart-reveal-pending');
      this.observer.observe(el);
    });
  }
  
  setupContainerStagger() {
    const containers = document.querySelectorAll('.smart-reveal-container, .smart-reveal-grid, .smart-reveal-cascade');
    
    containers.forEach(container => {
      const items = container.querySelectorAll('.smart-reveal-item');
      const pattern = this.detectPattern(container);
      
      this.containers.set(container, {
        items: Array.from(items),
        pattern: pattern,
        staggerDelay: parseInt(getComputedStyle(container).getPropertyValue('--reveal-stagger')) || this.options.staggerDelay
      });
      
      this.applyPattern(container, pattern);
    });
  }
  
  detectPattern(container) {
    if (container.classList.contains('smart-reveal-cascade')) return 'cascade';
    if (container.classList.contains('smart-reveal-wave')) return 'wave';
    if (container.classList.contains('smart-reveal-ripple')) return 'ripple';
    if (container.classList.contains('smart-reveal-grid')) return 'grid';
    return 'default';
  }
  
  applyPattern(container, pattern) {
    const items = container.querySelectorAll('.smart-reveal-item');
    
    switch(pattern) {
      case 'grid':
        this.applyGridStagger(container, items);
        break;
      case 'ripple':
        this.applyRippleStagger(container, items);
        break;
      case 'wave':
        this.applyWaveStagger(container, items);
        break;
      case 'cascade':
        this.applyCascadeStagger(items);
        break;
    }
  }
  
  applyGridStagger(container, items) {
    const gridStyles = getComputedStyle(container);
    const columns = gridStyles.gridTemplateColumns.split(' ').length;
    
    items.forEach((item, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const distance = Math.sqrt(row * row + col * col);
      
      item.style.setProperty('--grid-index', col);
      item.style.setProperty('--row-index', row);
      item.style.setProperty('--distance-from-center', distance);
    });
  }
  
  applyRippleStagger(container, items) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    items.forEach(item => {
      const itemRect = item.getBoundingClientRect();
      const itemCenterX = itemRect.left - rect.left + itemRect.width / 2;
      const itemCenterY = itemRect.top - rect.top + itemRect.height / 2;
      const distance = Math.sqrt(
        Math.pow(itemCenterX - centerX, 2) + Math.pow(itemCenterY - centerY, 2)
      );
      const normalizedDistance = distance / Math.max(rect.width, rect.height);
      
      item.style.setProperty('--distance-from-center', normalizedDistance.toFixed(2));
    });
  }
  
  applyWaveStagger(container, items) {
    items.forEach((item, index) => {
      item.style.setProperty('--item-index', index);
    });
  }
  
  applyCascadeStagger(items) {
    items.forEach((item, index) => {
      item.style.transitionDelay = `${index * 80}ms`;
    });
  }
  
  setupTextReveal() {
    const textElements = document.querySelectorAll('.smart-reveal-text');
    
    textElements.forEach(element => {
      const text = element.textContent;
      element.innerHTML = '';
      
      text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.transitionDelay = `${index * 30}ms`;
        element.appendChild(span);
      });
    });
  }
  
  setupGridAwareness() {
    const grids = document.querySelectorAll('.smart-reveal-grid');
    
    grids.forEach(grid => {
      const updateGridColumns = () => {
        const styles = getComputedStyle(grid);
        const columns = styles.gridTemplateColumns.split(' ').length;
        grid.style.setProperty('--grid-columns', columns);
      };
      
      updateGridColumns();
      window.addEventListener('resize', this.debounce(updateGridColumns, 250));
    });
  }
  
  setupRipplePattern() {
    const rippleContainers = document.querySelectorAll('.smart-reveal-ripple');
    
    const updateRippleDistances = () => {
      rippleContainers.forEach(container => {
        this.applyRippleStagger(
          container,
          container.querySelectorAll('.smart-reveal-item')
        );
      });
    };
    
    window.addEventListener('resize', this.debounce(updateRippleDistances, 250));
    updateRippleDistances();
  }
  
  reveal(element) {
    if (this.revealedElements.has(element)) return;
    
    this.revealedElements.add(element);
    element.classList.remove('smart-reveal-pending');
    element.classList.add('revealed');
    
    // Trigger counter animation if present
    const counter = element.querySelector('.counter-value');
    if (counter) {
      this.animateCounter(counter);
    }
    
    // Dispatch custom event
    element.dispatchEvent(new CustomEvent('smartReveal', {
      detail: { element, timestamp: Date.now() }
    }));
  }
  
  hide(element) {
    this.revealedElements.delete(element);
    element.classList.remove('revealed');
    element.classList.add('smart-reveal-pending');
  }
  
  animateCounter(element) {
    const target = parseInt(element.dataset.target) || parseInt(element.textContent) || 0;
    const duration = parseInt(element.dataset.duration) || 2000;
    const start = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(target * easeOutQuart);
      
      element.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = target.toLocaleString();
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  revealAll() {
    document.querySelectorAll('.smart-reveal-item').forEach(el => this.reveal(el));
  }
  
  resetAll() {
    document.querySelectorAll('.smart-reveal-item').forEach(el => this.hide(el));
    this.revealedElements.clear();
    this.findAndObserveElements();
  }
  
  refresh() {
    this.resetAll();
    this.setupContainerStagger();
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.revealedElements.clear();
    this.containers.clear();
  }
}

/**
 * Scroll-Linked Parallax Reveals
 */
class ScrollLinkedRevealer {
  constructor() {
    this.elements = [];
    this.ticking = false;
    
    this.init();
  }
  
  init() {
    this.findElements();
    this.bindScroll();
  }
  
  findElements() {
    this.elements = Array.from(document.querySelectorAll('.smart-reveal-parallax'));
  }
  
  bindScroll() {
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => this.update());
        this.ticking = true;
      }
    }, { passive: true });
  }
  
  update() {
    const viewportHeight = window.innerHeight;
    
    this.elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const distance = elementCenter - viewportCenter;
      const maxDistance = viewportHeight;
      
      // Calculate progress (0 to 1) based on element position in viewport
      let progress = 1 - (Math.abs(distance) / (maxDistance / 2));
      progress = Math.max(0, Math.min(1, progress));
      
      element.style.setProperty('--scroll-progress', progress.toFixed(3));
    });
    
    this.ticking = false;
  }
}

/**
 * Reveal Sequencer - Chain multiple reveals together
 */
class RevealSequencer {
  constructor() {
    this.sequences = new Map();
  }
  
  add(name, elements) {
    this.sequences.set(name, {
      elements: Array.isArray(elements) ? elements : [elements],
      currentIndex: 0,
      completed: false
    });
  }
  
  play(name) {
    const sequence = this.sequences.get(name);
    if (!sequence) return;
    
    sequence.elements.forEach((element, index) => {
      setTimeout(() => {
        if (typeof element === 'string') {
          document.querySelectorAll(element).forEach(el => {
            el.classList.add('revealed');
          });
        } else if (element instanceof Element) {
          element.classList.add('revealed');
        }
      }, index * 200);
    });
    
    sequence.completed = true;
  }
  
  playAll() {
    this.sequences.forEach((_, name) => this.play(name));
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) {
    window.smartRevealer = new SmartContentRevealer();
    window.scrollLinkedRevealer = new ScrollLinkedRevealer();
    window.revealSequencer = new RevealSequencer();
  } else {
    // Reveal all immediately for reduced motion
    document.querySelectorAll('.smart-reveal-item, .smart-reveal-text, .smart-reveal-mask').forEach(el => {
      el.classList.add('revealed');
    });
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SmartContentRevealer, ScrollLinkedRevealer, RevealSequencer };
}
