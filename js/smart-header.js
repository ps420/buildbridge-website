/**
 * Smart Auto-Hiding Header v20.0
 * Context-aware navigation with intelligent show/hide behavior
 */

class SmartHeader {
  constructor(options = {}) {
    this.header = document.querySelector(options.selector || '.nav');
    if (!this.header) return;
    
    this.config = {
      hideThreshold: options.hideThreshold || 100,
      showThreshold: options.showThreshold || 50,
      offset: options.offset || 82,
      debug: options.debug || false,
      blurEffect: options.blurEffect !== false,
      backToTop: options.backToTop !== false,
      scrollProgress: options.scrollProgress !== false,
      ...options
    };
    
    this.state = {
      isHidden: false,
      lastScrollY: 0,
      scrollDirection: 'up',
      scrollProgress: 0
    };
    
    this.elements = {
      progress: null,
      backToTop: null
    };
    
    this.rafId = null;
    this.isScrolling = false;
    
    this.init();
  }
  
  init() {
    this.createElements();
    this.bindEvents();
    this.update();
  }
  
  createElements() {
    // Scroll progress bar
    if (this.config.scrollProgress) {
      this.elements.progress = document.createElement('div');
      this.elements.progress.className = 'nav-progress';
      this.header.appendChild(this.elements.progress);
    }
    
    // Back to top button
    if (this.config.backToTop) {
      this.elements.backToTop = document.createElement('button');
      this.elements.backToTop.className = 'nav-back-to-top';
      this.elements.backToTop.innerHTML = '↑';
      this.elements.backToTop.setAttribute('aria-label', 'Back to top');
      this.elements.backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      document.body.appendChild(this.elements.backToTop);
    }
  }
  
  bindEvents() {
    // Scroll handling with RAF
    window.addEventListener('scroll', () => {
      this.isScrolling = true;
      
      if (!this.rafId) {
        this.rafId = requestAnimationFrame(() => {
          this.handleScroll();
          this.rafId = null;
        });
      }
    }, { passive: true });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
    if (e.key === 'Home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
  
  handleScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Calculate scroll progress
    this.state.scrollProgress = (scrollY / docHeight) * 100;
    
    // Determine scroll direction
    this.state.scrollDirection = scrollY > this.state.lastScrollY ? 'down' : 'up';
    
    // Update header state
    this.updateHeaderState(scrollY);
    
    // Update progress
    if (this.elements.progress) {
      this.elements.progress.style.width = `${this.state.scrollProgress}%`;
    }
    
    // Update back to top button
    if (this.elements.backToTop) {
      if (scrollY > 500) {
        this.elements.backToTop.classList.add('visible');
      } else {
        this.elements.backToTop.classList.remove('visible');
      }
    }
    
    // Apply blur effect
    if (this.config.blurEffect) {
      if (scrollY > 50) {
        this.header.classList.add('nav--scrolled');
        this.header.classList.remove('nav--transparent');
      } else {
        this.header.classList.remove('nav--scrolled');
        this.header.classList.add('nav--transparent');
      }
    }
    
    this.state.lastScrollY = scrollY;
    this.isScrolling = false;
  }
  
  updateHeaderState(scrollY) {
    // Always show at top
    if (scrollY < this.config.showThreshold) {
      this.show();
      return;
    }
    
    // Hide on scroll down, show on scroll up
    if (this.state.scrollDirection === 'down') {
      if (scrollY > this.config.hideThreshold && !this.state.isHidden) {
        this.hide();
      }
    } else {
      if (this.state.isHidden) {
        this.show();
      }
    }
  }
  
  show() {
    this.header.classList.remove('nav--hidden');
    this.header.classList.add('nav--visible');
    this.state.isHidden = false;
  }
  
  hide() {
    // Don't hide if menu is open
    if (this.header.classList.contains('menu-open')) return;
    
    this.header.classList.add('nav--hidden');
    this.header.classList.remove('nav--visible');
    this.state.isHidden = true;
  }
  
  update() {
    this.handleScroll();
  }
  
  // Public API
  setHideThreshold(threshold) {
    this.config.hideThreshold = threshold;
  }
  
  setShowThreshold(threshold) {
    this.config.showThreshold = threshold;
  }
  
  forceShow() {
    this.show();
  }
  
  forceHide() {
    this.hide();
  }
  
  destroy() {
    if (this.elements.progress) {
      this.elements.progress.remove();
    }
    if (this.elements.backToTop) {
      this.elements.backToTop.remove();
    }
    this.header.classList.remove('nav--hidden', 'nav--visible', 'nav--scrolled');
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.smartHeader = new SmartHeader({
      hideThreshold: 150,
      showThreshold: 100,
      blurEffect: true,
      backToTop: true,
      scrollProgress: true
    });
  });
} else {
  window.smartHeader = new SmartHeader({
    hideThreshold: 150,
    showThreshold: 100,
    blurEffect: true,
    backToTop: true,
    scrollProgress: true
  });
}
