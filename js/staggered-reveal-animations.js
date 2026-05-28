/**
 * Staggered Reveal Animations - v40.0
 * Fortune 500 Sequential Element Animations
 * Intersection Observer-based with custom timing controls
 */

class StaggeredRevealSystem {
  constructor(options = {}) {
    this.options = {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1,
      defaultDuration: 800,
      defaultDelay: 100,
      once: true,
      ...options
    };
    
    this.observer = null;
    this.elements = [];
    this.init();
  }
  
  init() {
    this.createObserver();
    this.scanElements();
    this.bindEvents();
  }
  
  createObserver() {
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: null,
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    );
  }
  
  scanElements() {
    // Find all reveal elements
    const revealElements = document.querySelectorAll('[data-reveal], [data-split-reveal], [data-mask-reveal], [data-blur-reveal], [data-flip-reveal], [data-circle-reveal], [data-underline-reveal]');
    
    revealElements.forEach(el => {
      this.observeElement(el);
    });
  }
  
  observeElement(element) {
    if (this.elements.includes(element)) return;
    
    this.elements.push(element);
    
    // Handle split text reveals
    if (element.hasAttribute('data-split-reveal')) {
      this.prepareSplitReveal(element);
    }
    
    // Start observing
    this.observer.observe(element);
  }
  
  prepareSplitReveal(element) {
    const type = element.getAttribute('data-split-reveal');
    const text = element.textContent;
    
    if (type === 'chars') {
      // Split into characters
      element.innerHTML = text
        .split('')
        .map(char => char === ' ' 
          ? '<span class="char">&nbsp;</span>' 
          : `<span class="char">${char}</span>`
        )
        .join('');
      
      // Add staggered delays
      element.querySelectorAll('.char').forEach((char, i) => {
        char.style.transitionDelay = `${i * 20}ms`;
      });
      
    } else if (type === 'words') {
      // Split into words
      element.innerHTML = text
        .split(' ')
        .map(word => `<span class="word">${word}</span>`)
        .join(' ');
      
      element.querySelectorAll('.word').forEach((word, i) => {
        word.style.transitionDelay = `${i * 80}ms`;
      });
      
    } else if (type === 'lines') {
      // Split into lines (requires fixed width)
      element.innerHTML = text
        .split('\n')
        .map(line => `<span class="line"><span class="line-inner">${line}</span></span>`)
        .join('');
      
      element.querySelectorAll('.line-inner').forEach((line, i) => {
        line.style.transitionDelay = `${i * 150}ms`;
      });
    }
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.revealElement(entry.target);
        
        if (this.options.once) {
          this.observer.unobserve(entry.target);
        }
      } else if (!this.options.once) {
        this.hideElement(entry.target);
      }
    });
  }
  
  revealElement(element) {
    // Add revealed class
    element.classList.add('is-revealed');
    
    // Trigger counter animations if present
    const counters = element.querySelectorAll('[data-counter]');
    counters.forEach(counter => this.animateCounter(counter));
    
    // Trigger progress circles if present
    const circles = element.querySelectorAll('[data-circle-reveal]');
    circles.forEach(circle => {
      const progress = circle.querySelector('circle.progress');
      if (progress) {
        const delay = parseInt(circle.style.transitionDelay) || 0;
        setTimeout(() => {
          circle.classList.add('is-revealed');
        }, delay);
      }
    });
    
    // Fire custom event
    element.dispatchEvent(new CustomEvent('revealed', {
      bubbles: true,
      detail: { element }
    }));
  }
  
  hideElement(element) {
    element.classList.remove('is-revealed');
  }
  
  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-counter')) || 0;
    const suffix = element.getAttribute('data-suffix') || '';
    const prefix = element.getAttribute('data-prefix') || '';
    const duration = parseInt(element.getAttribute('data-duration')) || 2000;
    
    const startTime = performance.now();
    const startValue = 0;
    
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeProgress = 1 - Math.pow(2, -10 * progress);
      const currentValue = Math.floor(startValue + (target - startValue) * easeProgress);
      
      element.textContent = prefix + currentValue.toLocaleString() + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }
  
  bindEvents() {
    // Re-scan on dynamic content changes
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.hasAttribute('data-reveal') || 
                  node.querySelector('[data-reveal], [data-split-reveal], [data-mask-reveal]')) {
                shouldScan = true;
              }
            }
          });
        }
      });
      
      if (shouldScan) {
        setTimeout(() => this.scanElements(), 100);
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Scroll-linked reveals
    this.bindScrollLinkedReveals();
  }
  
  bindScrollLinkedReveals() {
    const scrollElements = document.querySelectorAll('[data-scroll-reveal]');
    
    if (scrollElements.length === 0) return;
    
    const updateScrollProgress = () => {
      scrollElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementHeight = rect.height;
        
        // Calculate progress based on element position
        const progress = Math.max(0, Math.min(1, 
          (windowHeight - rect.top) / (windowHeight + elementHeight)
        ));
        
        el.style.setProperty('--scroll-progress', progress.toFixed(3));
      });
    };
    
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
  }
  
  // Public API
  reveal(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => this.revealElement(el));
  }
  
  hide(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => this.hideElement(el));
  }
  
  refresh() {
    this.scanElements();
  }
  
  destroy() {
    this.observer.disconnect();
    this.elements = [];
  }
}

// Parallax Text Effect
class ParallaxTextEffect {
  constructor(options = {}) {
    this.options = {
      speed: 0.1,
      direction: 'vertical',
      ...options
    };
    
    this.elements = [];
    this.init();
  }
  
  init() {
    this.scanElements();
    this.bindEvents();
  }
  
  scanElements() {
    document.querySelectorAll('[data-parallax-text]').forEach(el => {
      const speed = parseFloat(el.dataset.parallaxText) || this.options.speed;
      this.elements.push({ element: el, speed });
    });
  }
  
  bindEvents() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updatePositions();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
  
  updatePositions() {
    const scrollY = window.scrollY;
    
    this.elements.forEach(({ element, speed }) => {
      const rect = element.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const offset = (centerY - viewportCenter) * speed;
      
      element.style.transform = `translateY(${offset}px)`;
    });
  }
}

// Wave Animation for Groups
class WaveRevealEffect {
  constructor(selector, options = {}) {
    this.options = {
      delay: 100,
      duration: 800,
      ...options
    };
    
    this.elements = document.querySelectorAll(selector);
    this.init();
  }
  
  init() {
    this.elements.forEach(el => {
      el.classList.add('wave-reveal-container');
      
      const children = el.children;
      Array.from(children).forEach((child, i) => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(40px)';
        child.style.transition = `all ${this.options.duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        child.style.transitionDelay = `${i * this.options.delay}ms`;
      });
      
      // Trigger reveal
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            Array.from(children).forEach(child => {
              child.style.opacity = '1';
              child.style.transform = 'translateY(0)';
            });
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.2 });
      
      observer.observe(el);
    });
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.revealSystem = new StaggeredRevealSystem();
    window.parallaxText = new ParallaxTextEffect();
  });
} else {
  window.revealSystem = new StaggeredRevealSystem();
  window.parallaxText = new ParallaxTextEffect();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StaggeredRevealSystem, ParallaxTextEffect, WaveRevealEffect };
}
