/**
 * v73.0: SCROLL-LINKED ANIMATIONS SYSTEM
 * Fortune 500 Quality Scroll-Driven Animation Engine
 */

class ScrollLinkedAnimations {
  constructor(options = {}) {
    this.options = {
      throttleMs: 16, // ~60fps
      smoothness: 0.1,
      debug: false,
      ...options
    };
    
    this.scrollProgress = 0;
    this.scrollVelocity = 0;
    this.lastScrollY = window.scrollY;
    this.lastTime = performance.now();
    this.rafId = null;
    this.isActive = true;
    
    this.elements = new Map();
    this.sections = [];
    this.observer = null;
    
    this.init();
  }
  
  init() {
    this.buildSectionMap();
    this.initIntersectionObserver();
    this.initElements();
    this.createProgressIndicator();
    this.bindEvents();
    this.startLoop();
    
    if (this.options.debug) {
      this.createDebugOverlay();
    }
  }
  
  buildSectionMap() {
    const sections = document.querySelectorAll('[data-section]');
    this.sections = Array.from(sections).map((section, index) => ({
      element: section,
      id: section.dataset.section,
      index: index + 1,
      rect: null
    }));
    
    this.updateSectionRects();
  }
  
  updateSectionRects() {
    this.sections.forEach(section => {
      section.rect = section.element.getBoundingClientRect();
    });
  }
  
  initIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px 0px -50% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        
        if (entry.isIntersecting) {
          element.classList.add('in-view');
          element.dataset.intersectionRatio = entry.intersectionRatio;
          
          // Trigger custom event
          element.dispatchEvent(new CustomEvent('scroll:enter', {
            detail: { ratio: entry.intersectionRatio }
          }));
        } else {
          if (entry.boundingClientRect.top > 0) {
            element.classList.remove('in-view');
          }
        }
      });
    }, options);
    
    // Observe all animated elements
    document.querySelectorAll('.io-animate, [data-scroll-animate]').forEach(el => {
      this.observer.observe(el);
    });
  }
  
  initElements() {
    // Collect all scroll-linked elements
    document.querySelectorAll('[data-scroll-animate]').forEach((el, index) => {
      this.elements.set(el, {
        type: el.dataset.scrollAnimate,
        start: parseFloat(el.dataset.scrollStart) || 0,
        end: parseFloat(el.dataset.scrollEnd) || 1,
        index: index
      });
    });
    
    // Set up stagger delays
    document.querySelectorAll('[data-scroll-stagger]').forEach(container => {
      const children = container.children;
      const amount = parseFloat(container.dataset.staggerAmount) || 0.1;
      
      Array.from(children).forEach((child, i) => {
        child.style.setProperty('--stagger-index', i);
        child.style.setProperty('--stagger-amount', `${amount}s`);
      });
    });
  }
  
  createProgressIndicator() {
    // Create reading progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'reading-progress-container';
    progressContainer.innerHTML = '<div class="reading-progress-bar"></div>';
    document.body.appendChild(progressContainer);
    
    // Create section counter
    if (this.sections.length > 3) {
      const counter = document.createElement('div');
      counter.className = 'section-counter';
      counter.innerHTML = `
        <span class="section-counter-current">01</span>
        <span class="section-counter-divider"></span>
        <span class="section-counter-total">${String(this.sections.length).padStart(2, '0')}</span>
      `;
      document.body.appendChild(counter);
      this.sectionCounter = counter;
    }
  }
  
  bindEvents() {
    // Throttled scroll handler
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.updateSectionRects();
      }, 250);
    });
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      this.isActive = document.visibilityState === 'visible';
    });
  }
  
  handleScroll() {
    const currentScrollY = window.scrollY;
    const currentTime = performance.now();
    const timeDelta = currentTime - this.lastTime;
    
    // Calculate velocity
    if (timeDelta > 0) {
      this.scrollVelocity = (currentScrollY - this.lastScrollY) / timeDelta;
    }
    
    this.lastScrollY = currentScrollY;
    this.lastTime = currentTime;
    
    // Calculate global scroll progress
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = docHeight > 0 ? currentScrollY / docHeight : 0;
    
    // Update progress bar
    const progressBar = document.querySelector('.reading-progress-bar');
    if (progressBar) {
      progressBar.style.setProperty('--scroll-percent', this.scrollProgress * 100);
    }
    
    // Update CSS variables
    document.documentElement.style.setProperty('--scroll-progress', this.scrollProgress);
    document.documentElement.style.setProperty('--scroll-percent', this.scrollProgress * 100);
    document.documentElement.style.setProperty('--scroll-velocity', this.scrollVelocity);
    document.documentElement.style.setProperty('--scroll-y', currentScrollY);
    
    // Update current section
    this.updateCurrentSection();
    
    // Update parallax elements
    this.updateParallax();
  }
  
  updateCurrentSection() {
    if (!this.sectionCounter) return;
    
    const viewportCenter = window.innerHeight / 2;
    let currentSection = this.sections[0];
    
    for (const section of this.sections) {
      const sectionCenter = section.rect.top + section.rect.height / 2;
      if (sectionCenter <= viewportCenter) {
        currentSection = section;
      }
    }
    
    const currentEl = this.sectionCounter.querySelector('.section-counter-current');
    if (currentEl && currentSection) {
      currentEl.textContent = String(currentSection.index).padStart(2, '0');
    }
  }
  
  updateParallax() {
    document.querySelectorAll('[data-parallax]').forEach(el => {
      const rect = el.getBoundingClientRect();
      const speed = parseFloat(el.dataset.parallaxSpeed) || 0.5;
      
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const offset = (window.innerHeight - rect.top) * speed * 0.1;
        el.style.setProperty('--parallax-offset', `${offset}px`);
      }
    });
  }
  
  startLoop() {
    const loop = () => {
      if (this.isActive) {
        this.updateElements();
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
  
  updateElements() {
    this.elements.forEach((config, element) => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate element's progress through viewport
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      // Progress from when element enters to when it exits
      const start = windowHeight;
      const end = -elementHeight;
      const range = start - end;
      
      let progress = (start - elementTop) / range;
      progress = Math.max(0, Math.min(1, progress));
      
      // Apply to element
      element.style.setProperty('--scroll-progress', progress);
      element.style.animationDelay = `-${progress}s`;
    });
  }
  
  createDebugOverlay() {
    const debug = document.createElement('div');
    debug.className = 'scroll-debug-overlay';
    debug.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.8);
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 4px;
      z-index: 99999;
      pointer-events: none;
    `;
    document.body.appendChild(debug);
    
    setInterval(() => {
      debug.innerHTML = `
        Scroll: ${(this.scrollProgress * 100).toFixed(1)}%<br>
        Velocity: ${this.scrollVelocity.toFixed(3)}<br>
        Elements: ${this.elements.size}<br>
        Sections: ${this.sections.length}
      `;
    }, 100);
  }
  
  // Public API
  scrollToSection(index) {
    const section = this.sections[index - 1];
    if (section) {
      section.element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  refresh() {
    this.updateSectionRects();
    this.initElements();
  }
  
  destroy() {
    cancelAnimationFrame(this.rafId);
    this.observer?.disconnect();
    window.removeEventListener('scroll', this.handleScroll);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.scrollAnimations = new ScrollLinkedAnimations({
    debug: window.location.hash === '#debug'
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollLinkedAnimations;
}
