/**
 * v62.0: Advanced Page Transition System
 * Fortune 500 Quality Smooth Navigation with Multiple Effects
 * Features: Wave, circle, split, panel transitions with prefetching
 */

class PageTransitionSystem {
  constructor(options = {}) {
    this.options = {
      type: 'wave', // wave, circle, split, panels, fade
      duration: 800,
      prefetch: true,
      showLoader: true,
      showBrand: true,
      ...options
    };
    
    this.overlay = null;
    this.isTransitioning = false;
    this.prefetchedPages = new Set();
    this.currentPage = window.location.pathname;
    
    this.init();
  }
  
  init() {
    this.createOverlay();
    this.bindLinkClicks();
    this.setupPrefetch();
    this.setupProgressBar();
    
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.url) {
        this.handleNavigation(e.state.url, false);
      }
    });
    
    console.log('🔄 Page Transition System initialized');
  }
  
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'page-transition-overlay';
    this.overlay.setAttribute('aria-hidden', 'true');
    
    // Create transition element based on type
    switch (this.options.type) {
      case 'wave':
        this.overlay.innerHTML = '<div class="page-transition-wave"></div>';
        break;
      case 'circle':
        this.overlay.innerHTML = '<div class="page-transition-circle"></div>';
        break;
      case 'split':
        this.overlay.innerHTML = `
          <div class="page-transition-split">
            <div class="page-transition-split-panel"></div>
            <div class="page-transition-split-panel"></div>
          </div>
        `;
        break;
      case 'panels':
        this.overlay.innerHTML = `
          <div class="page-transition-panels">
            ${Array(5).fill('<div class="page-transition-panel"></div>').join('')}
          </div>
        `;
        break;
    }
    
    // Add loader
    if (this.options.showLoader) {
      const loader = document.createElement('div');
      loader.className = 'page-transition-loader';
      loader.innerHTML = '<div class="page-transition-spinner"></div>';
      this.overlay.appendChild(loader);
    }
    
    // Add brand
    if (this.options.showBrand) {
      const brand = document.createElement('div');
      brand.className = 'page-transition-brand';
      brand.innerHTML = `
        <img src="assets/BuildBridge_Icon_Mark.svg" alt="BuildBridge" style="width:36px;height:36px;">
        <span>BuildBridge</span>
      `;
      this.overlay.appendChild(brand);
    }
    
    document.body.appendChild(this.overlay);
  }
  
  bindLinkClicks() {
    // Delegate click events for internal links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      
      // Only handle internal links
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || 
          href.startsWith('tel:') || href.startsWith('http')) {
        return;
      }
      
      // Don't handle if modifiers are pressed
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      
      e.preventDefault();
      this.navigateTo(href);
    });
  }
  
  async navigateTo(url) {
    if (this.isTransitioning || url === this.currentPage) return;
    
    this.isTransitioning = true;
    this.currentPage = url;
    
    // Update progress bar
    this.showProgressBar();
    
    // Start exit transition
    await this.startExitTransition();
    
    // Fetch new page content
    try {
      const content = await this.fetchPage(url);
      this.updateProgressBar(80);
      
      // Update URL and history
      window.history.pushState({ url }, '', url);
      
      // Replace content
      await this.replaceContent(content);
      this.updateProgressBar(100);
      
      // Start enter transition
      await this.startEnterTransition();
      
      // Reset state
      this.hideProgressBar();
      this.isTransitioning = false;
      
    } catch (error) {
      console.error('Page transition failed:', error);
      window.location.href = url; // Fallback
    }
  }
  
  async handleNavigation(url, addToHistory = true) {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    
    this.showProgressBar();
    await this.startExitTransition();
    
    try {
      const content = await this.fetchPage(url);
      
      if (addToHistory) {
        window.history.pushState({ url }, '', url);
      }
      
      await this.replaceContent(content);
      await this.startEnterTransition();
      
      this.hideProgressBar();
      this.isTransitioning = false;
      
    } catch (error) {
      window.location.href = url;
    }
  }
  
  startExitTransition() {
    return new Promise((resolve) => {
      document.documentElement.classList.add('page-transitioning');
      
      // Add type-specific class
      this.overlay.classList.add(`${this.options.type}-active`);
      this.overlay.classList.add('active');
      
      // Fade out current content
      document.querySelectorAll('.page-content, main').forEach(el => {
        el.classList.add('page-exit');
      });
      
      setTimeout(resolve, this.options.duration * 0.5);
    });
  }
  
  startEnterTransition() {
    return new Promise((resolve) => {
      // Fade in new content
      document.querySelectorAll('.page-content, main').forEach(el => {
        el.classList.remove('page-exit');
        el.classList.add('page-enter');
      });
      
      // Remove overlay
      this.overlay.classList.remove('active');
      this.overlay.classList.remove(`${this.options.type}-active`);
      
      setTimeout(() => {
        document.documentElement.classList.remove('page-transitioning');
        document.querySelectorAll('.page-content, main').forEach(el => {
          el.classList.remove('page-enter');
        });
        resolve();
      }, this.options.duration * 0.5);
    });
  }
  
  async fetchPage(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Page not found');
    return response.text();
  }
  
  replaceContent(html) {
    return new Promise((resolve) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Update title
      document.title = doc.title;
      
      // Update meta tags
      doc.querySelectorAll('meta').forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        if (name) {
          const existing = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
          if (existing) {
            existing.content = meta.content;
          }
        }
      });
      
      // Replace main content
      const newMain = doc.querySelector('main') || doc.body;
      const currentMain = document.querySelector('main') || document.body;
      
      if (newMain && currentMain) {
        // Preserve elements that shouldn't change
        const persistentElements = document.querySelectorAll('[data-persist]');
        
        // Replace content
        if (document.querySelector('main')) {
          document.querySelector('main').innerHTML = newMain.innerHTML;
        }
        
        // Re-attach persistent elements
        persistentElements.forEach(el => {
          document.body.appendChild(el);
        });
      }
      
      // Re-initialize scripts
      this.reevaluateScripts();
      
      // Scroll to top
      window.scrollTo(0, 0);
      
      resolve();
    });
  }
  
  reevaluateScripts() {
    // Find and execute new scripts
    document.querySelectorAll('script').forEach(oldScript => {
      if (oldScript.dataset.evaluated) return;
      
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      newScript.dataset.evaluated = 'true';
      
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }
  
  // Prefetching
  setupPrefetch() {
    if (!this.options.prefetch) return;
    
    // Prefetch on link hover
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href || this.prefetchedPages.has(href)) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || 
          href.startsWith('tel:') || href.startsWith('http')) return;
      
      this.prefetchPage(href);
    }, { passive: true });
  }
  
  prefetchPage(url) {
    if (this.prefetchedPages.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
    
    this.prefetchedPages.add(url);
    this.showPrefetchIndicator(`Prefetched: ${url}`);
  }
  
  showPrefetchIndicator(text) {
    let indicator = document.querySelector('.page-prefetch-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'page-prefetch-indicator';
      document.body.appendChild(indicator);
    }
    
    indicator.textContent = text;
    indicator.classList.add('visible');
    
    setTimeout(() => {
      indicator.classList.remove('visible');
    }, 2000);
  }
  
  // Progress bar
  setupProgressBar() {
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'page-load-progress';
    document.body.appendChild(this.progressBar);
  }
  
  showProgressBar() {
    this.progressBar.classList.add('loading');
  }
  
  updateProgressBar(percent) {
    this.progressBar.style.width = `${percent}%`;
  }
  
  hideProgressBar() {
    this.progressBar.classList.add('complete');
    setTimeout(() => {
      this.progressBar.classList.remove('loading', 'complete');
      this.progressBar.style.width = '0%';
    }, 300);
  }
  
  // Public API: Change transition type
  setTransitionType(type) {
    this.options.type = type;
    this.overlay.remove();
    this.createOverlay();
  }
  
  // Public API: Disable transitions
  disable() {
    this.options.type = 'none';
  }
  
  // Public API: Enable transitions
  enable(type = 'wave') {
    this.options.type = type;
  }
}

// Link Preview on Hover
class LinkPreview {
  constructor() {
    this.preview = null;
    this.cache = new Map();
    this.init();
  }
  
  init() {
    this.createPreview();
    this.bindEvents();
  }
  
  createPreview() {
    this.preview = document.createElement('div');
    this.preview.className = 'page-link-preview';
    this.preview.innerHTML = `
      <img class="page-link-preview-image" src="" alt="">
      <div class="page-link-preview-title"></div>
    `;
    document.body.appendChild(this.preview);
  }
  
  bindEvents() {
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a');
      if (!link) {
        this.hide();
        return;
      }
      
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || 
          href.startsWith('tel:')) {
        this.hide();
        return;
      }
      
      this.show(link, href, e.clientX, e.clientY);
    });
    
    document.addEventListener('mousemove', (e) => {
      if (this.preview.classList.contains('visible')) {
        this.position(e.clientX, e.clientY);
      }
    });
  }
  
  async show(link, href, x, y) {
    // Check cache
    if (!this.cache.has(href)) {
      try {
        const response = await fetch(href);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const title = doc.title;
        const image = doc.querySelector('meta[property="og:image"]')?.content || 
                     doc.querySelector('img')?.src || 
                     'assets/02_Website_Heroes/Hero_1.png';
        
        this.cache.set(href, { title, image });
      } catch {
        return;
      }
    }
    
    const data = this.cache.get(href);
    this.preview.querySelector('.page-link-preview-image').src = data.image;
    this.preview.querySelector('.page-link-preview-title').textContent = data.title;
    
    this.position(x, y);
    this.preview.classList.add('visible');
  }
  
  position(x, y) {
    const offset = 20;
    let left = x + offset;
    let top = y + offset;
    
    // Keep in viewport
    const rect = this.preview.getBoundingClientRect();
    if (left + rect.width > window.innerWidth) {
      left = x - rect.width - offset;
    }
    if (top + rect.height > window.innerHeight) {
      top = y - rect.height - offset;
    }
    
    this.preview.style.left = `${left}px`;
    this.preview.style.top = `${top}px`;
  }
  
  hide() {
    this.preview.classList.remove('visible');
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pageTransition = new PageTransitionSystem();
    window.linkPreview = new LinkPreview();
  });
} else {
  window.pageTransition = new PageTransitionSystem();
  window.linkPreview = new LinkPreview();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PageTransitionSystem, LinkPreview };
}
