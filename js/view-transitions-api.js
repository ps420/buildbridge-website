/**
 * View Transitions API Implementation (v37.0)
 * Native browser page transitions with graceful fallback
 */

class ViewTransitionManager {
  constructor() {
    this.isSupported = this.checkSupport();
    this.activeTransition = null;
    this.navigationHistory = [];
    this.options = {
      duration: 600,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fallbackDuration: 500
    };
    
    this.init();
  }
  
  checkSupport() {
    return 'startViewTransition' in document;
  }
  
  init() {
    if (!this.isSupported) {
      console.log('View Transitions API not supported, using fallback');
      this.initFallback();
      return;
    }
    
    this.bindNavigation();
    this.setupPageTransitions();
    this.setupSectionTransitions();
  }
  
  // Bind navigation with view transitions
  bindNavigation() {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      
      // Only internal links
      if (this.isInternalLink(href)) {
        link.addEventListener('click', (e) => {
          if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
            e.preventDefault();
            this.navigate(href, link.dataset.transition || 'default');
          }
        });
      }
    });
  }
  
  isInternalLink(href) {
    return href && 
           !href.startsWith('http') && 
           !href.startsWith('#') && 
           !href.startsWith('mailto') && 
           !href.startsWith('tel') &&
           !href.startsWith('javascript');
  }
  
  async navigate(url, transitionType = 'default') {
    // Don't interrupt active transitions
    if (this.activeTransition) return;
    
    // Add to history
    this.navigationHistory.push({ url, timestamp: Date.now() });
    
    // Start view transition
    if (this.isSupported) {
      this.activeTransition = document.startViewTransition(() => {
        return this.performNavigation(url, transitionType);
      });
      
      try {
        await this.activeTransition.finished;
      } catch (error) {
        console.error('View transition failed:', error);
      } finally {
        this.activeTransition = null;
      }
    } else {
      // Fallback
      await this.performFallbackTransition(url, transitionType);
    }
  }
  
  async performNavigation(url, transitionType) {
    // Add transition class for additional effects
    document.body.classList.add(`transition-${transitionType}`);
    
    try {
      // Fetch new page content
      const response = await fetch(url, {
        headers: { 'X-Requested-With': 'ViewTransition' }
      });
      
      if (!response.ok) throw new Error('Navigation failed');
      
      const html = await response.text();
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');
      
      // Update document
      this.updateDocument(newDoc);
      
      // Update URL
      history.pushState({ viewTransition: true }, '', url);
      
      // Scroll to top
      window.scrollTo(0, 0);
      
      // Reinitialize scripts
      this.reinitializeScripts();
      
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = url; // Full page load fallback
    } finally {
      document.body.classList.remove(`transition-${transitionType}`);
    }
  }
  
  updateDocument(newDoc) {
    // Preserve elements with [data-preserve] attribute
    const preservedElements = document.querySelectorAll('[data-preserve]');
    const preservedData = new Map();
    
    preservedElements.forEach(el => {
      preservedData.set(el.id, el.cloneNode(true));
    });
    
    // Update main content
    const newMain = newDoc.querySelector('main') || newDoc.body;
    const currentMain = document.querySelector('main') || document.body;
    
    if (newMain && currentMain) {
      // Use view-transition-name for smooth element transitions
      this.assignTransitionNames(currentMain, newMain);
      currentMain.innerHTML = newMain.innerHTML;
    }
    
    // Update title
    if (newDoc.title) document.title = newDoc.title;
    
    // Update meta tags
    this.updateMetaTags(newDoc);
    
    // Restore preserved elements
    preservedData.forEach((clone, id) => {
      const placeholder = document.getElementById(id);
      if (placeholder) {
        placeholder.replaceWith(clone);
      }
    });
  }
  
  assignTransitionNames(oldContainer, newContainer) {
    // Match corresponding elements and assign transition names
    const elements = oldContainer.querySelectorAll('[data-transition-name]');
    elements.forEach(el => {
      const name = el.dataset.transitionName;
      el.style.viewTransitionName = name;
    });
  }
  
  updateMetaTags(newDoc) {
    const metaSelectors = [
      'meta[name="description"]',
      'meta[property^="og:"]',
      'meta[name="twitter:"]',
      'link[rel="canonical"]'
    ];
    
    metaSelectors.forEach(selector => {
      const newMeta = newDoc.querySelector(selector);
      const currentMeta = document.querySelector(selector);
      
      if (newMeta && currentMeta) {
        currentMeta.content = newMeta.content;
      }
    });
  }
  
  reinitializeScripts() {
    // Re-bind navigation
    this.bindNavigation();
    
    // Dispatch event for other scripts
    window.dispatchEvent(new CustomEvent('page-transition-complete'));
    
    // Reinitialize scroll-based animations
    if (window.ScrollAnimationEngine) {
      window.scrollAnimationEngine?.refresh();
    }
  }
  
  // Setup section-level transitions
  setupSectionTransitions() {
    const sections = document.querySelectorAll('[data-section-transition]');
    
    sections.forEach(section => {
      section.style.viewTransitionName = `section-${section.id || 'unnamed'}`;
      
      // Observe for scroll-based reveal
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && this.isSupported) {
            this.transitionSection(section);
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(section);
    });
  }
  
  async transitionSection(section) {
    if (!this.isSupported) return;
    
    const transition = document.startViewTransition(() => {
      section.classList.add('section-revealed');
    });
    
    await transition.finished;
  }
  
  // Fallback for unsupported browsers
  initFallback() {
    // Use CSS-based fallback
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      
      if (this.isInternalLink(href)) {
        link.addEventListener('click', (e) => {
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            this.performFallbackTransition(href);
          }
        });
      }
    });
  }
  
  async performFallbackTransition(url, type = 'default') {
    const overlay = this.createTransitionOverlay();
    document.body.appendChild(overlay);
    
    // Trigger reflow
    overlay.offsetHeight;
    
    // Fade in overlay
    overlay.classList.add('active');
    
    // Wait for animation
    await this.delay(this.options.fallbackDuration * 0.6);
    
    // Navigate
    window.location.href = url;
  }
  
  createTransitionOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'transition-overlay';
    overlay.innerHTML = `
      <div class="transition-overlay-content">
        <img src="assets/BuildBridge_Icon_Mark.svg" alt="BuildBridge" class="transition-overlay-logo">
        <div class="transition-overlay-text">Loading...</div>
      </div>
    `;
    return overlay;
  }
  
  setupPageTransitions() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      if (e.state?.viewTransition) {
        this.navigate(location.href, 'popstate');
      }
    });
  }
  
  // Utility to transition specific elements
  async transitionElement(element, callback, name = 'element') {
    if (!this.isSupported) {
      callback();
      return;
    }
    
    element.style.viewTransitionName = name;
    
    const transition = document.startViewTransition(() => {
      callback();
    });
    
    await transition.finished;
    element.style.viewTransitionName = '';
  }
  
  // Batch multiple element transitions
  async transitionBatch(elements, callback) {
    if (!this.isSupported) {
      callback();
      return;
    }
    
    elements.forEach((el, i) => {
      el.style.viewTransitionName = `batch-item-${i}`;
    });
    
    const transition = document.startViewTransition(() => {
      callback();
    });
    
    await transition.finished;
    
    elements.forEach(el => {
      el.style.viewTransitionName = '';
    });
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Public API for programmatic transitions
  static async to(url, options = {}) {
    if (!window.viewTransitionManager) {
      window.viewTransitionManager = new ViewTransitionManager();
    }
    return window.viewTransitionManager.navigate(url, options.type);
  }
  
  static async element(element, callback, name) {
    if (!window.viewTransitionManager) {
      window.viewTransitionManager = new ViewTransitionManager();
    }
    return window.viewTransitionManager.transitionElement(element, callback, name);
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.viewTransitionManager = new ViewTransitionManager();
  });
} else {
  window.viewTransitionManager = new ViewTransitionManager();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ViewTransitionManager;
}
