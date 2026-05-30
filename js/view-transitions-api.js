/**
 * View Transitions API Integration
 * Fortune 500 Quality Page Navigation
 * v91.0: Smooth page transitions using native View Transitions API
 */

class ViewTransitionsManager {
  constructor() {
    this.isSupported = 'startViewTransition' in document;
    this.currentTransition = null;
    this.navigationStack = [];
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.init();
  }
  
  init() {
    // Add feature class to html
    if (this.isSupported) {
      document.documentElement.classList.add('vt-supported');
    } else {
      document.documentElement.classList.add('vt-fallback');
      this.initFallback();
    }
    
    // Add transition loading indicator
    this.createLoadingIndicator();
    
    // Intercept link clicks
    this.interceptLinks();
    
    // Handle popstate (back/forward buttons)
    window.addEventListener('popstate', (e) => this.handlePopState(e));
    
    // Listen for reduced motion preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
    });
  }
  
  createLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'vt-loading-indicator';
    indicator.innerHTML = '<div class="vt-loading-bar"></div>';
    indicator.setAttribute('aria-hidden', 'true');
    document.body.appendChild(indicator);
    this.loadingIndicator = indicator;
  }
  
  showLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.add('active');
    }
  }
  
  hideLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.remove('active');
    }
  }
  
  interceptLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      
      if (!link) return;
      
      // Skip external links
      if (link.hostname !== window.location.hostname) return;
      
      // Skip anchor links
      if (link.hash && link.pathname === window.location.pathname) return;
      
      // Skip links with download attribute
      if (link.hasAttribute('download')) return;
      
      // Skip links with target=_blank
      if (link.target === '_blank') return;
      
      // Skip links with no-transition class
      if (link.classList.contains('no-vt')) return;
      
      // Skip modifier key clicks
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      
      e.preventDefault();
      
      const url = link.href;
      const transitionType = link.dataset.vtType || 'default';
      
      this.navigateTo(url, transitionType);
    });
  }
  
  async navigateTo(url, type = 'default') {
    // Add to navigation stack
    this.navigationStack.push(window.location.href);
    
    // Show loading
    this.showLoading();
    
    // Track analytics
    this.trackNavigation(url);
    
    if (this.isSupported && !this.prefersReducedMotion) {
      await this.performViewTransition(url, type);
    } else {
      await this.performFallbackTransition(url);
    }
  }
  
  async performViewTransition(url, type) {
    // Prepare view transition names for elements
    this.prepareTransitionNames(type);
    
    // Start view transition
    const transition = document.startViewTransition(async () => {
      await this.loadPage(url);
    });
    
    this.currentTransition = transition;
    
    try {
      await transition.finished;
      this.hideLoading();
      this.currentTransition = null;
    } catch (err) {
      console.error('View transition failed:', err);
      this.hideLoading();
    }
  }
  
  async performFallbackTransition(url) {
    // Create fallback transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);
    
    // Fade out
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        overlay.classList.add('active');
        setTimeout(resolve, 400);
      });
    });
    
    // Load new page
    await this.loadPage(url);
    
    // Fade in
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 400);
    
    this.hideLoading();
  }
  
  prepareTransitionNames(type) {
    // Add view-transition-name attributes based on type
    const elements = {
      navbar: document.querySelector('.nav, header, #navbar'),
      'hero-content': document.querySelector('.hero-copy, .hero-content, .hero'),
      'transition-image': document.querySelector('.hero-visual img, .hero-image, .hero-main-image'),
      'card-grid': document.querySelector('.services-grid, .projects-grid, .grid'),
      'text-content': document.querySelector('.section-header, .content'),
      footer: document.querySelector('footer, .footer')
    };
    
    Object.entries(elements).forEach(([name, element]) => {
      if (element) {
        element.style.viewTransitionName = name;
      }
    });
    
    // Store for cleanup
    this.transitionElements = elements;
  }
  
  cleanupTransitionNames() {
    if (this.transitionElements) {
      Object.values(this.transitionElements).forEach(element => {
        if (element) {
          element.style.viewTransitionName = '';
        }
      });
      this.transitionElements = null;
    }
  }
  
  async loadPage(url) {
    try {
      const response = await fetch(url, {
        headers: { 'X-Requested-With': 'ViewTransition' }
      });
      
      if (!response.ok) throw new Error('Failed to load page');
      
      const html = await response.text();
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');
      
      // Update document title
      document.title = newDoc.title;
      
      // Update meta tags
      this.updateMetaTags(newDoc);
      
      // Replace body content
      const newBody = newDoc.body;
      document.body.innerHTML = newBody.innerHTML;
      
      // Execute scripts
      this.executeScripts(newBody);
      
      // Update URL without reloading
      window.history.pushState({ url }, '', url);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('pagetransitioncomplete', {
        detail: { url }
      }));
      
      // Re-initialize any page-specific scripts
      this.reinitializePageScripts();
      
    } catch (error) {
      console.error('Page load failed:', error);
      // Fallback to normal navigation
      window.location.href = url;
    }
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
      } else if (newMeta && !currentMeta) {
        document.head.appendChild(newMeta.cloneNode(true));
      }
    });
  }
  
  executeScripts(sourceBody) {
    const scripts = sourceBody.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      
      // Copy attributes
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy content
      newScript.textContent = oldScript.textContent;
      
      // Replace
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }
  
  reinitializePageScripts() {
    // Re-create loading indicator since DOM was replaced
    this.createLoadingIndicator();
    
    // Re-attach link interceptors
    this.interceptLinks();
    
    // Dispatch event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('pageload'));
    
    // Initialize any existing page scripts
    if (typeof initPageScripts === 'function') {
      initPageScripts();
    }
  }
  
  handlePopState(e) {
    if (e.state && e.state.url) {
      this.loadPage(e.state.url);
    }
  }
  
  initFallback() {
    // Create fallback overlay for browsers without View Transitions API
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);
  }
  
  trackNavigation(url) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: new URL(url).pathname
      });
    }
    
    // Console log
    console.log(`[ViewTransition] Navigating to: ${url}`);
  }
  
  // Public API for manual transitions
  static transition(callback, options = {}) {
    if (!document.startViewTransition) {
      return callback();
    }
    
    const transition = document.startViewTransition(callback);
    
    if (options.onReady) {
      transition.ready.then(options.onReady);
    }
    
    if (options.onFinished) {
      transition.finished.then(options.onFinished);
    }
    
    return transition;
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ViewTransitionsManager());
} else {
  new ViewTransitionsManager();
}

// Export for global access
window.ViewTransitionsManager = ViewTransitionsManager;

export default ViewTransitionsManager;
