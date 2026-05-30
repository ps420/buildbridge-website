// ========================================
// PREDICTIVE CONTENT PRELOADER - v130.0
// Fortune 500 Intelligent Page Prefetching
// Features: Hover prefetch, instant navigation,
// smart caching, connection awareness
// ========================================

class PredictiveContentPreloader {
  constructor() {
    this.cache = new Map();
    this.prefetchQueue = new Set();
    this.isPrefetching = false;
    this.connection = navigator.connection;
    this.isOnline = navigator.onLine;
    this.prefetchEnabled = this.shouldEnablePrefetch();
    
    // Configuration
    this.config = {
      hoverDelay: 100,        // ms before prefetch on hover
      maxCacheSize: 10,       // max pages to cache
      maxPrefetchConcurrent: 2,
      prefetchTimeout: 5000,  // timeout for prefetch
      enablePreviews: true,
      saveDataAware: true
    };
    
    this.init();
  }
  
  init() {
    this.createUI();
    this.bindEvents();
    this.observeLinks();
    
    console.log('🚀 Predictive preloader initialized');
  }
  
  shouldEnablePrefetch() {
    // Check for data saver mode
    if (this.connection?.saveData) return false;
    
    // Check for slow connections
    if (this.connection?.effectiveType === '2g') return false;
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    
    return true;
  }
  
  // ========================================
  // UI CREATION
  // ========================================
  
  createUI() {
    // Progress bar
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'prefetch-progress';
    document.body.appendChild(this.progressBar);
    
    // Status indicator
    this.statusIndicator = document.createElement('div');
    this.statusIndicator.className = 'prefetch-status';
    this.statusIndicator.innerHTML = `
      <span class="prefetch-status-icon"></span>
      <span class="prefetch-status-text">Preparing page...</span>
    `;
    document.body.appendChild(this.statusIndicator);
    
    // Page transition overlay
    this.transitionOverlay = document.createElement('div');
    this.transitionOverlay.className = 'page-transition-overlay';
    document.body.appendChild(this.transitionOverlay);
    
    // Instant load indicator
    this.loadIndicator = document.createElement('div');
    this.loadIndicator.className = 'instant-load-indicator';
    this.loadIndicator.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Instant load!</span>
    `;
    document.body.appendChild(this.loadIndicator);
    
    // Connection status
    this.connectionStatus = document.createElement('div');
    this.connectionStatus.className = 'prefetch-connection-status';
    this.connectionStatus.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="1" y1="1" x2="23" y2="23"></line>
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
        <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
        <line x1="12" y1="20" x2="12.01" y2="20"></line>
      </svg>
      <span>Offline mode - prefetch disabled</span>
    `;
    document.body.appendChild(this.connectionStatus);
    
    // Preview card
    this.previewCard = document.createElement('div');
    this.previewCard.className = 'prefetch-preview';
    document.body.appendChild(this.previewCard);
  }
  
  // ========================================
  // EVENT BINDING
  // ========================================
  
  bindEvents() {
    // Online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.prefetchEnabled = this.shouldEnablePrefetch();
      this.hideConnectionStatus();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.prefetchEnabled = false;
      this.showConnectionStatus();
    });
    
    // Link click interception
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (link && this.shouldHandleLink(link)) {
        this.handleLinkClick(e, link);
      }
    });
    
    // Visibility change - clear cache when hidden for a while
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        setTimeout(() => {
          if (document.hidden) this.clearCache();
        }, 60000);
      }
    });
    
    // Before unload - clear transition
    window.addEventListener('beforeunload', () => {
      this.hideTransition();
    });
  }
  
  // ========================================
  // LINK OBSERVATION
  // ========================================
  
  observeLinks() {
    if (!this.prefetchEnabled) return;
    
    const links = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    
    links.forEach(link => {
      if (!this.shouldHandleLink(link)) return;
      
      link.classList.add('prefetch-link');
      
      let hoverTimeout;
      
      // Hover intent - prefetch after delay
      link.addEventListener('mouseenter', (e) => {
        hoverTimeout = setTimeout(() => {
          this.prefetchPage(link.href);
          this.showPreview(link, e);
        }, this.config.hoverDelay);
      });
      
      link.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
        this.hidePreview();
      });
      
      // Touch start - prefetch immediately on touch
      link.addEventListener('touchstart', () => {
        this.prefetchPage(link.href);
      }, { passive: true });
    });
  }
  
  shouldHandleLink(link) {
    const href = link.getAttribute('href');
    
    // Skip external links
    if (href.startsWith('http') && !href.includes(window.location.hostname)) {
      return false;
    }
    
    // Skip anchors
    if (href.startsWith('#')) return false;
    
    // Skip javascript
    if (href.startsWith('javascript:')) return false;
    
    // Skip mailto/tel
    if (href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    
    // Skip current page
    if (href === window.location.pathname) return false;
    
    return true;
  }
  
  // ========================================
  // PREFETCH LOGIC
  // ========================================
  
  async prefetchPage(url) {
    if (!this.prefetchEnabled || !this.isOnline) return;
    if (this.cache.has(url)) return;
    if (this.prefetchQueue.has(url)) return;
    
    // Check cache size
    if (this.cache.size >= this.config.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.prefetchQueue.add(url);
    this.updateLinkStatus(url, 'prefetching');
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.prefetchTimeout);
      
      const response = await fetch(url, {
        signal: controller.signal,
        credentials: 'same-origin'
      });
      
      clearTimeout(timeout);
      
      if (response.ok) {
        const html = await response.text();
        this.cache.set(url, {
          html,
          timestamp: Date.now(),
          title: this.extractTitle(html)
        });
        this.updateLinkStatus(url, 'prefetched');
      }
    } catch (err) {
      console.log('Prefetch failed:', url, err.message);
    } finally {
      this.prefetchQueue.delete(url);
    }
  }
  
  updateLinkStatus(url, status) {
    const links = document.querySelectorAll(`a[href="${url}"]`);
    links.forEach(link => {
      link.classList.remove('prefetching', 'prefetched');
      link.classList.add(status);
    });
  }
  
  extractTitle(html) {
    const match = html.match(/<title>(.*?)<\/title>/i);
    return match ? match[1] : 'Page';
  }
  
  // ========================================
  // LINK CLICK HANDLING
  // ========================================
  
  handleLinkClick(e, link) {
    const url = link.href;
    
    // Check if cached
    if (this.cache.has(url)) {
      e.preventDefault();
      this.instantNavigate(url);
    } else {
      // Show transition for non-cached pages
      this.showTransition();
    }
  }
  
  async instantNavigate(url) {
    const cached = this.cache.get(url);
    if (!cached) {
      window.location.href = url;
      return;
    }
    
    // Show instant load indicator
    this.showLoadIndicator();
    
    // Animate transition
    this.showTransition();
    
    // Small delay for visual feedback
    await this.delay(300);
    
    // Use View Transitions API if available
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.injectPage(cached.html, url);
      });
    } else {
      this.injectPage(cached.html, url);
    }
    
    // Hide transition after navigation
    setTimeout(() => this.hideTransition(), 400);
  }
  
  injectPage(html, url) {
    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Update document
    document.title = doc.title;
    document.querySelector('main')?.replaceWith(doc.querySelector('main') || doc.body);
    
    // Update URL
    history.pushState({}, '', url);
    
    // Reinitialize scripts
    this.reinitializeScripts();
    
    // Update prefetch links on new page
    this.observeLinks();
  }
  
  reinitializeScripts() {
    // Re-run any page-specific initialization
    if (window.depthSystem) window.depthSystem.refresh();
    if (window.microInteractions) window.microInteractions.refresh();
    if (window.aiChatWidget) window.aiChatWidget.refresh();
  }
  
  // ========================================
  // UI FEEDBACK
  // ========================================
  
  showTransition() {
    this.transitionOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
  
  hideTransition() {
    this.transitionOverlay.classList.remove('visible');
    document.body.style.overflow = '';
  }
  
  showLoadIndicator() {
    this.loadIndicator.classList.add('visible');
    setTimeout(() => this.loadIndicator.classList.remove('visible'), 2000);
  }
  
  showConnectionStatus() {
    this.connectionStatus.classList.add('visible');
    setTimeout(() => this.hideConnectionStatus(), 5000);
  }
  
  hideConnectionStatus() {
    this.connectionStatus.classList.remove('visible');
  }
  
  showProgress() {
    this.progressBar.classList.add('visible', 'loading');
  }
  
  hideProgress() {
    this.progressBar.classList.add('complete');
    setTimeout(() => {
      this.progressBar.classList.remove('visible', 'loading', 'complete');
      this.progressBar.style.width = '0%';
    }, 500);
  }
  
  showStatus(text) {
    this.statusIndicator.querySelector('.prefetch-status-text').textContent = text;
    this.statusIndicator.classList.add('visible');
  }
  
  hideStatus() {
    this.statusIndicator.classList.remove('visible');
  }
  
  showPreview(link, e) {
    if (!this.config.enablePreviews) return;
    
    const url = link.href;
    const cached = this.cache.get(url);
    
    if (cached) {
      this.previewCard.innerHTML = `
        <div class="prefetch-preview-header">
          <div class="prefetch-preview-icon">⚡</div>
          <div class="prefetch-preview-title">${cached.title}</div>
        </div>
        <div class="prefetch-preview-desc">Ready to load instantly</div>
      `;
    } else {
      this.previewCard.innerHTML = `
        <div class="prefetch-preview-header">
          <div class="prefetch-preview-icon">🔄</div>
          <div class="prefetch-preview-title">Loading...</div>
        </div>
        <div class="prefetch-preview-loading">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      `;
    }
    
    // Position preview
    const rect = link.getBoundingClientRect();
    this.previewCard.style.left = `${rect.left}px`;
    this.previewCard.style.top = `${rect.bottom + 10}px`;
    this.previewCard.classList.add('visible');
  }
  
  hidePreview() {
    this.previewCard.classList.remove('visible');
  }
  
  // ========================================
  // UTILITY
  // ========================================
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  clearCache() {
    this.cache.clear();
    document.querySelectorAll('.prefetch-link').forEach(link => {
      link.classList.remove('prefetched', 'prefetching');
    });
  }
  
  // ========================================
  // PUBLIC API
  // ========================================
  
  enable() {
    this.prefetchEnabled = true;
    this.observeLinks();
  }
  
  disable() {
    this.prefetchEnabled = false;
    this.clearCache();
  }
  
  prefetch(url) {
    return this.prefetchPage(url);
  }
  
  isCached(url) {
    return this.cache.has(url);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.prefetcher = new PredictiveContentPreloader();
  });
} else {
  window.prefetcher = new PredictiveContentPreloader();
}

export default PredictiveContentPreloader;
