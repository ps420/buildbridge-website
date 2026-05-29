/**
 * v73.3: SMOOTH SCROLL REVEAL WITH INTERSECTION OBSERVER V2
 * Fortune 500 Quality Reveal Animation System
 */

class SmoothScrollReveal {
  constructor(options = {}) {
    this.options = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
      duration: 600,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      distance: '40px',
      origin: 'bottom',
      scale: 0.95,
      opacity: 0,
      delay: 0,
      interval: 100,
      reset: false,
      cleanup: true,
      ...options
    };
    
    this.elements = new Map();
    this.observer = null;
    this.isPaused = false;
    
    this.init();
  }
  
  init() {
    // Check for reduced motion preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (this.prefersReducedMotion) {
      this.revealAll();
      return;
    }
    
    this.initIntersectionObserver();
    this.scanForElements();
    this.bindEvents();
  }
  
  initIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    };
    
    // Use IntersectionObserver v2 if available
    const observerOptions = window.IntersectionObserverEntry?.prototype?.isVisible !== undefined
      ? { ...options, trackVisibility: true, delay: 100 }
      : options;
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        
        if (entry.isIntersecting) {
          // Check visibility for v2
          if (entry.isVisible === false) {
            return;
          }
          
          this.reveal(element);
        } else if (this.options.reset) {
          this.hide(element);
        }
      });
    }, observerOptions);
  }
  
  scanForElements() {
    // Elements with data-reveal attribute
    document.querySelectorAll('[data-reveal]').forEach(el => {
      const options = this.parseOptions(el);
      this.addElement(el, options);
    });
    
    // Auto-scan sections
    document.querySelectorAll('section h2, section .section-header').forEach(el => {
      if (!el.hasAttribute('data-reveal')) {
        this.addElement(el, { origin: 'bottom', distance: '30px' });
      }
    });
  }
  
  parseOptions(element) {
    const revealType = element.dataset.reveal;
    
    // Preset configurations
    const presets = {
      'fade-up': { origin: 'bottom', distance: '40px' },
      'fade-down': { origin: 'top', distance: '40px' },
      'fade-left': { origin: 'right', distance: '60px' },
      'fade-right': { origin: 'left', distance: '60px' },
      'zoom-in': { scale: 0.8, origin: 'center', distance: '0' },
      'zoom-out': { scale: 1.2, origin: 'center', distance: '0' },
      'flip-left': { rotate: { x: 0, y: 90, z: 0 } },
      'flip-right': { rotate: { x: 0, y: -90, z: 0 } },
      'flip-up': { rotate: { x: -90, y: 0, z: 0 } },
      'flip-down': { rotate: { x: 90, y: 0, z: 0 } },
      'slide-up': { origin: 'bottom', distance: '100px', duration: 800 },
      'slide-down': { origin: 'top', distance: '100px', duration: 800 },
      'blur-in': { filter: 'blur(20px)', duration: 1000 },
      'clip-reveal': { clipPath: 'inset(0 100% 0 0)' },
      'char-reveal': { perChar: true, duration: 800 }
    };
    
    const preset = presets[revealType] || {};
    
    // Parse inline options
    return {
      ...this.options,
      ...preset,
      duration: parseInt(element.dataset.revealDuration) || preset.duration || this.options.duration,
      delay: parseInt(element.dataset.revealDelay) || this.options.delay,
      distance: element.dataset.revealDistance || preset.distance || this.options.distance,
      origin: element.dataset.revealOrigin || preset.origin || this.options.origin,
      scale: parseFloat(element.dataset.revealScale) || preset.scale || this.options.scale,
      easing: element.dataset.revealEasing || this.options.easing,
      stagger: parseInt(element.dataset.revealStagger) || 0,
      filter: preset.filter || element.dataset.revealFilter,
      clipPath: preset.clipPath || element.dataset.revealClip,
      rotate: preset.rotate,
      perChar: preset.perChar || element.dataset.revealPerChar === 'true'
    };
  }
  
  addElement(element, options = {}) {
    if (this.elements.has(element)) return;
    
    const config = { ...this.options, ...options };
    this.elements.set(element, config);
    
    // Prepare element
    this.prepareElement(element, config);
    
    // Observe
    this.observer.observe(element);
  }
  
  prepareElement(element, config) {
    // Store original display
    if (!element.dataset._originalDisplay) {
      element.dataset._originalDisplay = getComputedStyle(element).display;
    }
    
    // Set initial styles
    element.style.willChange = 'transform, opacity';
    element.style.transition = `all ${config.duration}ms ${config.easing}`;
    
    // Apply initial transform based on origin
    const transforms = [];
    
    if (config.origin !== 'center') {
      const distance = config.distance;
      switch (config.origin) {
        case 'top': transforms.push(`translateY(-${distance})`); break;
        case 'bottom': transforms.push(`translateY(${distance})`); break;
        case 'left': transforms.push(`translateX(-${distance})`); break;
        case 'right': transforms.push(`translateX(${distance})`); break;
      }
    }
    
    if (config.scale && config.scale !== 1) {
      transforms.push(`scale(${config.scale})`);
    }
    
    if (config.rotate) {
      transforms.push(`rotateX(${config.rotate.x}deg) rotateY(${config.rotate.y}deg) rotateZ(${config.rotate.z}deg)`);
    }
    
    element.style.transform = transforms.join(' ') || 'none';
    element.style.opacity = config.opacity;
    
    if (config.filter) {
      element.style.filter = config.filter;
    }
    
    if (config.clipPath) {
      element.style.clipPath = config.clipPath;
    }
    
    // Handle per-character animation
    if (config.perChar) {
      this.splitText(element, config);
    }
    
    // Handle staggered children
    if (config.stagger > 0) {
      this.setupStagger(element, config);
    }
  }
  
  splitText(element, config) {
    const text = element.textContent;
    element.innerHTML = '';
    element.style.display = 'inline-block';
    
    const chars = text.split('').map((char, i) => {
      if (char === ' ') {
        return ' ';
      }
      const span = document.createElement('span');
      span.textContent = char;
      span.style.cssText = `
        display: inline-block;
        opacity: 0;
        transform: translateY(100%) rotateX(-90deg);
        transition: all ${config.duration}ms ${config.easing};
        transition-delay: ${i * 30}ms;
      `;
      return span;
    });
    
    chars.forEach(node => {
      if (typeof node === 'string') {
        element.appendChild(document.createTextNode(node));
      } else {
        element.appendChild(node);
      }
    });
    
    element.dataset._isSplit = 'true';
  }
  
  setupStagger(element, config) {
    const children = Array.from(element.children);
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * config.stagger}ms`;
    });
  }
  
  reveal(element) {
    if (this.isPaused) return;
    
    const config = this.elements.get(element);
    if (!config) return;
    
    // Set revealed state
    element.classList.add('revealed');
    element.dataset.revealed = 'true';
    
    // Apply delay
    const delay = config.delay;
    
    setTimeout(() => {
      // Reset transforms
      element.style.transform = 'none';
      element.style.opacity = '1';
      
      if (config.filter) {
        element.style.filter = 'none';
      }
      
      if (config.clipPath) {
        element.style.clipPath = 'inset(0 0 0 0)';
      }
      
      // Reveal split characters
      if (element.dataset._isSplit) {
        element.querySelectorAll('span').forEach(span => {
          span.style.opacity = '1';
          span.style.transform = 'none';
        });
      }
      
      // Dispatch event
      element.dispatchEvent(new CustomEvent('reveal', { detail: config }));
      
      // Cleanup
      if (config.cleanup) {
        setTimeout(() => {
          element.style.willChange = 'auto';
          this.observer.unobserve(element);
        }, config.duration + delay + 100);
      }
    }, delay);
  }
  
  hide(element) {
    const config = this.elements.get(element);
    if (!config) return;
    
    element.classList.remove('revealed');
    element.dataset.revealed = 'false';
    
    // Re-apply initial styles
    this.prepareElement(element, config);
    
    this.observer.observe(element);
  }
  
  revealAll() {
    this.elements.forEach((config, element) => {
      element.style.transition = 'none';
      element.style.transform = 'none';
      element.style.opacity = '1';
      element.style.filter = 'none';
      element.style.clipPath = 'none';
      element.classList.add('revealed');
    });
  }
  
  bindEvents() {
    // Re-scan on DOM changes
    if ('MutationObserver' in window) {
      this.mutationObserver = new MutationObserver((mutations) => {
        let shouldScan = false;
        
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1) { // Element node
                if (node.matches?.('[data-reveal]') || node.querySelector?.('[data-reveal]')) {
                  shouldScan = true;
                }
              }
            });
          }
        });
        
        if (shouldScan) {
          this.scanForElements();
        }
      });
      
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
    });
    
    // Reduced motion preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      if (e.matches) {
        this.revealAll();
      }
    });
  }
  
  // Public API
  refresh() {
    this.scanForElements();
  }
  
  sync() {
    this.elements.forEach((config, element) => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible && !element.classList.contains('revealed')) {
        this.reveal(element);
      }
    });
  }
  
  clean(target) {
    const element = typeof target === 'string' 
      ? document.querySelector(target) 
      : target;
      
    if (element) {
      element.style.willChange = 'auto';
      element.style.transform = 'none';
      element.style.opacity = '1';
      this.observer.unobserve(element);
      this.elements.delete(element);
    }
  }
  
  destroy() {
    this.observer?.disconnect();
    this.mutationObserver?.disconnect();
    this.revealAll();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.scrollReveal = new SmoothScrollReveal();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmoothScrollReveal;
}
