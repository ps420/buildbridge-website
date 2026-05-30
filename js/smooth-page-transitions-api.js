// ========================================
// v124.0: SMOOTH PAGE TRANSITIONS API
// Modern View Transitions with Fallback
// ========================================

class SmoothPageTransitions {
  constructor(options = {}) {
    this.options = {
      defaultTransition: 'fade',
      duration: 400,
      fallback: true,
      prefetch: true,
      preloadDistance: 100, // px from viewport to prefetch
      ...options
    };
    
    this.isTransitioning = false;
    this.prefetchedPages = new Set();
    this.transitionOverlay = null;
    this.progressBar = null;
    this.loadingIndicator = null;
    
    // Check for View Transitions API support
    this.hasViewTransitions = 'startViewTransition' in document;
    
    this.init();
  }
  
  init() {
    this.createOverlay();
    this.createProgressBar();
    this.bindLinks();
    this.setupPrefetching();
    
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state?.transition) {
        this.handlePopState(e.state);
      }
    });
    
    console.log(`[BuildBridge Transitions] View Transitions API: ${this.hasViewTransitions ? 'supported' : 'fallback mode'}`);
  }
  
  createOverlay() {
    if (this.hasViewTransitions) return;
    
    this.transitionOverlay = document.createElement('div');
    this.transitionOverlay.className = 'page-transition-overlay-v2';
    this.transitionOverlay.innerHTML = `
      <img src="assets/BuildBridge_Icon_Mark.svg" alt="BuildBridge" class="transition-logo">
    `;
    document.body.appendChild(this.transitionOverlay);
  }
  
  createProgressBar() {
    this.progressBarContainer = document.createElement('div');
    this.progressBarContainer.className = 'page-transition-progress';
    this.progressBarContainer.innerHTML = '<div class="page-transition-progress-bar"></div>';
    document.body.appendChild(this.progressBarContainer);
    
    this.progressBar = this.progressBarContainer.querySelector('.page-transition-progress-bar');
  }
  
  bindLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-transition]') || 
                   e.target.closest('a[href^="."]') ||
                   e.target.closest('a[href^="/"]');
      
      if (!link) return;
      
      const href = link.getAttribute('href');
      
      // Skip external links
      if (!href || 
          href.startsWith('http') || 
          href.startsWith('#') || 
          href.startsWith('mailto') ||
          href.startsWith('tel') ||
          href.startsWith('javascript') ||
          link.hasAttribute('download') ||
          link.getAttribute('target') === '_blank') {
        return;
      }
      
      e.preventDefault();
      
      const transitionType = link.dataset.transition || this.options.defaultTransition;
      this.navigate(href, transitionType);
    });
  }
  
  async navigate(url, transitionType = 'fade') {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    // Update progress bar
    this.showProgress();
    
    // Add transition class for styling
    document.body.classList.add('vt-transitioning');
    document.documentElement.classList.add('vt-active');
    
    try {
      if (this.hasViewTransitions) {
        await this.transitionWithViewTransitions(url, transitionType);
      } else {
        await this.transitionWithFallback(url, transitionType);
      }
      
      // Update URL and history
      history.pushState({ transition: transitionType, url }, '', url);
      
      // Trigger analytics
      this.trackNavigation(url);
      
    } catch (error) {
      console.error('[BuildBridge Transitions] Navigation failed:', error);
      // Fallback to regular navigation
      window.location.href = url;
    } finally {
      this.isTransitioning = false;
      this.hideProgress();
      document.body.classList.remove('vt-transitioning');
    }
  }
  
  async transitionWithViewTransitions(url, type) {
    // Add transition type class
    document.documentElement.classList.add(`vt-${type}`);
    
    const transition = document.startViewTransition(async () => {
      // Fetch new page content
      const content = await this.fetchPage(url);
      
      // Update DOM
      this.updateDOM(content);
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    await transition.finished;
    
    // Clean up transition class
    document.documentElement.classList.remove(`vt-${type}`);
  }
  
  async transitionWithFallback(url, type) {
    // Show overlay
    this.transitionOverlay.classList.add('active');
    
    // Simulate progress
    this.updateProgressBar(20);
    await this.delay(100);
    
    // Fetch content
    this.updateProgressBar(50);
    const content = await this.fetchPage(url);
    
    this.updateProgressBar(70);
    await this.delay(100);
    
    // Update DOM
    this.updateDOM(content);
    
    this.updateProgressBar(90);
    await this.delay(150);
    
    // Hide overlay and scroll
    this.transitionOverlay.classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    this.updateProgressBar(100);
  }
  
  async fetchPage(url) {
    try {
      const response = await fetch(url, {
        headers: { 
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'text/html'
        }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      return await response.text();
    } catch (error) {
      // If fetch fails, try to use prefetched content
      if (this.prefetchedPages.has(url)) {
        const cached = sessionStorage.getItem(`prefetch:${url}`);
        if (cached) return cached;
      }
      throw error;
    }
  }
  
  updateDOM(html) {
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(html, 'text/html');
    
    // Update title
    document.title = newDoc.title;
    
    // Update body content
    document.body.innerHTML = newDoc.body.innerHTML;
    
    // Update meta tags
    const metaTags = newDoc.querySelectorAll('meta[name], meta[property]');
    metaTags.forEach(meta => {
      const existing = document.querySelector(`meta[name="${meta.name}"]`);
      if (existing) {
        existing.content = meta.content;
      } else {
        document.head.appendChild(meta.cloneNode(true));
      }
    });
    
    // Re-initialize scripts
    this.reinitializeScripts();
    
    // Re-initialize BuildBridge components
    this.reinitializeComponents();
  }
  
  reinitializeScripts() {
    // Re-execute inline scripts
    document.querySelectorAll('script:not([src])').forEach(script => {
      const newScript = document.createElement('script');
      newScript.textContent = script.textContent;
      script.parentNode.replaceChild(newScript, script);
    });
    
    // Reload external scripts if needed
    document.querySelectorAll('script[data-reload]').forEach(script => {
      const newScript = document.createElement('script');
      newScript.src = script.src;
      newScript.dataset.reload = 'true';
      script.parentNode.replaceChild(newScript, script);
    });
  }
  
  reinitializeComponents() {
    // Dispatch event for other scripts to reinitialize
    window.dispatchEvent(new CustomEvent('page-transition-complete', {
      detail: { url: window.location.href }
    }));
    
    // Re-initialize scroll behavior
    if (window.smoothScroll) {
      window.smoothScroll.init();
    }
    
    // Re-initialize other known components
    if (window.Fortune500Toast) {
      window.toastSystem = window.Fortune500Toast;
    }
  }
  
  handlePopState(state) {
    if (state?.url) {
      this.navigate(state.url, state.transition || 'fade');
    }
  }
  
  setupPrefetching() {
    if (!this.options.prefetch) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target;
          const url = link.getAttribute('href');
          if (url && !this.prefetchedPages.has(url)) {
            this.prefetchPage(url);
          }
        }
      });
    }, {
      rootMargin: `${this.options.preloadDistance}px`
    });
    
    // Observe all internal links
    document.querySelectorAll('a[href^="."], a[href^="/"]').forEach(link => {
      observer.observe(link);
    });
  }
  
  async prefetchPage(url) {
    if (this.prefetchedPages.has(url)) return;
    
    try {
      const response = await fetch(url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      
      if (response.ok) {
        const html = await response.text();
        sessionStorage.setItem(`prefetch:${url}`, html);
        this.prefetchedPages.add(url);
        
        // Clean old entries
        this.cleanPrefetchCache();
      }
    } catch (e) {
      // Silent fail
    }
  }
  
  cleanPrefetchCache() {
    const maxCache = 10;
    const keys = Object.keys(sessionStorage).filter(k => k.startsWith('prefetch:'));
    
    if (keys.length > maxCache) {
      keys.slice(0, keys.length - maxCache).forEach(key => {
        sessionStorage.removeItem(key);
        this.prefetchedPages.delete(key.replace('prefetch:', ''));
      });
    }
  }
  
  showProgress() {
    this.progressBarContainer.classList.add('active');
    this.updateProgressBar(10);
  }
  
  hideProgress() {
    setTimeout(() => {
      this.progressBarContainer.classList.remove('active');
      this.updateProgressBar(0);
    }, 300);
  }
  
  updateProgressBar(percent) {
    this.progressBar.style.width = `${percent}%`;
  }
  
  trackNavigation(url) {
    // Analytics tracking
    if (window.gtag) {
      gtag('config', 'GA_TRACKING_ID', { page_path: url });
    }
    
    if (window.plausible) {
      plausible('pageview', { u: url });
    }
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Public API methods
  go(url, transition = 'fade') {
    return this.navigate(url, transition);
  }
  
  back() {
    history.back();
  }
  
  forward() {
    history.forward();
  }
  
  // Programmatic transition
  async transition(callback, type = 'fade') {
    if (this.hasViewTransitions) {
      document.documentElement.classList.add(`vt-${type}`);
      const vt = document.startViewTransition(callback);
      await vt.finished;
      document.documentElement.classList.remove(`vt-${type}`);
    } else {
      this.transitionOverlay.classList.add('active');
      await this.delay(200);
      await callback();
      await this.delay(200);
      this.transitionOverlay.classList.remove('active');
    }
  }
}

// ========================================
// Initialize on DOM Ready
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  window.pageTransitions = new SmoothPageTransitions({
    defaultTransition: 'fade',
    prefetch: true,
    preloadDistance: 200
  });
  
  // Expose global API
  window.navigateTo = (url, transition) => window.pageTransitions.go(url, transition);
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SmoothPageTransitions };
}
