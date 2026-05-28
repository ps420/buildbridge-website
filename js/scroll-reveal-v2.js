/**
 * BuildBridge Scroll Reveal v2.0
 * Fortune 500 Scroll-Triggered Animation Controller
 * Advanced reveal system with multiple animation types
 * =====================================================
 */

class ScrollReveal {
  constructor(options = {}) {
    this.options = {
      threshold: options.threshold || 0.15,
      rootMargin: options.rootMargin || '0px 0px -50px 0px',
      once: options.once !== false,
      ...options
    };
    
    this.elements = new Map();
    this.observer = null;
    this.isEnabled = true;
    
    this.init();
  }
  
  init() {
    this.createObserver();
    this.scanElements();
    this.bindEvents();
  }
  
  createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.reveal(entry.target);
          
          if (this.options.once) {
            this.observer.unobserve(entry.target);
            this.elements.delete(entry.target);
          }
        } else if (!this.options.once) {
          this.hide(entry.target);
        }
      });
    }, {
      threshold: this.options.threshold,
      rootMargin: this.options.rootMargin
    });
  }
  
  scanElements() {
    // Find all elements with reveal attributes
    const selectors = [
      '[data-reveal]',
      '[data-reveal-children]',
      '[data-reveal-img]',
      '[data-reveal-parallax]'
    ];
    
    document.querySelectorAll(selectors.join(', ')).forEach(el => {
      this.addElement(el);
    });
  }
  
  addElement(el) {
    if (this.elements.has(el)) return;
    
    const type = el.dataset.reveal;
    const config = {
      type,
      stagger: parseInt(el.dataset.stagger) || 0,
      duration: el.dataset.duration || 'normal',
      delay: parseFloat(el.dataset.delay) || 0
    };
    
    // Handle text splitting for character/word animations
    if (type === 'chars') {
      this.splitIntoChars(el);
    } else if (type === 'words') {
      this.splitIntoWords(el);
    } else if (type === 'lines') {
      this.splitIntoLines(el);
    }
    
    // Apply stagger delays to children
    if (el.hasAttribute('data-reveal-children')) {
      this.applyStaggerToChildren(el);
    }
    
    this.elements.set(el, config);
    this.observer.observe(el);
  }
  
  splitIntoChars(el) {
    const text = el.textContent;
    el.innerHTML = '';
    el.style.opacity = '1';
    
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.transitionDelay = `${i * 0.03}s`;
      span.style.transitionDuration = '0.6s';
      span.style.transitionProperty = 'opacity, transform';
      span.style.transitionTimingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
      el.appendChild(span);
    });
  }
  
  splitIntoWords(el) {
    const text = el.textContent;
    el.innerHTML = '';
    el.style.opacity = '1';
    
    text.split(' ').forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word + ' ';
      span.style.transitionDelay = `${i * 0.1}s`;
      span.style.transitionDuration = '0.6s';
      span.style.transitionProperty = 'opacity, transform';
      span.style.transitionTimingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
      el.appendChild(span);
    });
  }
  
  splitIntoLines(el) {
    const text = el.textContent;
    el.innerHTML = '';
    el.style.opacity = '1';
    
    // Simple line split by existing breaks or sentences
    const lines = text.split(/\n|<br\/?>|(?<=[.!?])\s+/).filter(l => l.trim());
    
    lines.forEach((line, i) => {
      const lineWrapper = document.createElement('span');
      lineWrapper.className = 'line';
      
      const lineInner = document.createElement('span');
      lineInner.className = 'line-inner';
      lineInner.textContent = line.trim();
      lineInner.style.transitionDelay = `${i * 0.15}s`;
      lineInner.style.transitionDuration = '0.7s';
      lineInner.style.transitionProperty = 'transform';
      lineInner.style.transitionTimingFunction = 'cubic-bezier(0.16, 1, 0.3, 1)';
      
      lineWrapper.appendChild(lineInner);
      el.appendChild(lineWrapper);
    });
  }
  
  applyStaggerToChildren(el) {
    const children = el.children;
    Array.from(children).forEach((child, i) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(40px)';
      child.style.transition = `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`;
    });
  }
  
  reveal(el) {
    const config = this.elements.get(el);
    
    // Apply custom delay before revealing
    if (config && config.delay > 0) {
      setTimeout(() => {
        el.classList.add('revealed');
        this.revealChildren(el);
      }, config.delay * 1000);
    } else {
      el.classList.add('revealed');
      this.revealChildren(el);
    }
    
    // Trigger custom event
    el.dispatchEvent(new CustomEvent('revealed', {
      detail: { element: el, config }
    }));
  }
  
  revealChildren(el) {
    if (el.hasAttribute('data-reveal-children')) {
      Array.from(el.children).forEach(child => {
        child.style.opacity = '1';
        child.style.transform = 'translateY(0)';
      });
    }
  }
  
  hide(el) {
    el.classList.remove('revealed');
    
    if (el.hasAttribute('data-reveal-children')) {
      Array.from(el.children).forEach(child => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(40px)';
      });
    }
  }
  
  bindEvents() {
    // Re-scan on dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            if (node.matches && node.matches('[data-reveal], [data-reveal-children], [data-reveal-img], [data-reveal-parallax]')) {
              this.addElement(node);
            }
            if (node.querySelectorAll) {
              node.querySelectorAll('[data-reveal], [data-reveal-children], [data-reveal-img], [data-reveal-parallax]')
                .forEach(el => this.addElement(el));
            }
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  // Parallax scroll handler
  handleParallax() {
    const parallaxElements = document.querySelectorAll('[data-reveal-parallax]');
    
    parallaxElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        const progress = 1 - (rect.top / windowHeight);
        const offset = (progress - 0.5) * 100;
        
        el.style.setProperty('--parallax-offset', `${offset}px`);
        el.style.setProperty('--parallax-progress', progress);
      }
    });
  }
  
  // Public methods
  refresh() {
    this.scanElements();
  }
  
  revealAll() {
    this.elements.forEach((config, el) => {
      this.reveal(el);
    });
  }
  
  disable() {
    this.isEnabled = false;
    this.observer.disconnect();
  }
  
  enable() {
    this.isEnabled = true;
    this.createObserver();
    this.elements.forEach((config, el) => {
      this.observer.observe(el);
    });
  }
  
  destroy() {
    this.observer.disconnect();
    this.elements.clear();
  }
}

// =========================================
// SCROLL PROGRESS CONTROLLER
// =========================================
class ScrollProgress {
  constructor(selector, options = {}) {
    this.element = document.querySelector(selector);
    if (!this.element) return;
    
    this.options = {
      target: options.target || document.body,
      property: options.property || '--scroll-progress',
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.updateProgress();
    
    window.addEventListener('scroll', () => {
      requestAnimationFrame(() => this.updateProgress());
    }, { passive: true });
  }
  
  updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(1, Math.max(0, scrollTop / docHeight));
    
    this.element.style.setProperty(this.options.property, progress);
    
    // Update CSS custom property on body for global access
    document.body.style.setProperty('--scroll-progress', progress);
    document.body.style.setProperty('--scroll-y', `${scrollTop}px`);
  }
}

// =========================================
// STICKY REVEAL CONTROLLER
// =========================================
class StickyReveal {
  constructor(elements, options = {}) {
    this.elements = typeof elements === 'string' 
      ? document.querySelectorAll(elements)
      : elements;
    
    this.options = {
      activeClass: options.activeClass || 'is-sticky-active',
      threshold: options.threshold || 0.5,
      ...options
    };
    
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(this.options.activeClass);
        } else {
          entry.target.classList.remove(this.options.activeClass);
        }
      });
    }, {
      threshold: this.options.threshold
    });
    
    this.elements.forEach(el => observer.observe(el));
  }
}

// =========================================
// INITIALIZE
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  // Main scroll reveal
  const scrollReveal = new ScrollReveal({
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
    once: true
  });
  
  // Scroll progress
  new ScrollProgress('body');
  
  // Expose globally
  window.ScrollReveal = scrollReveal;
  window.ScrollProgress = ScrollProgress;
  window.StickyReveal = StickyReveal;
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ScrollReveal, ScrollProgress, StickyReveal };
}
