/* ============================================
   v68.0: PROFESSIONAL LOADING STATES
   Fortune 500 Skeleton Screens & Loading UI
   ============================================ */

class LoadingStateManager {
  constructor() {
    this.activeLoaders = new Map();
    this.init();
  }
  
  init() {
    this.handleImages();
    this.handleButtons();
    this.handleForms();
  }
  
  // ============================================
  // IMAGE LOADING WITH BLUR-UP EFFECT
  // ============================================
  handleImages() {
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.setupImageLoader(img);
    });
  }
  
  setupImageLoader(img) {
    const container = document.createElement('div');
    container.className = 'image-loading-container';
    container.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    `;
    
    // Create placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    
    // Wrap image
    img.parentNode.insertBefore(container, img);
    container.appendChild(placeholder);
    container.appendChild(img);
    
    // Add blur-up class
    img.classList.add('image-blur-up');
    
    // Load handler
    img.addEventListener('load', () => {
      img.classList.add('loaded');
      setTimeout(() => {
        placeholder.remove();
      }, 500);
    });
    
    // Trigger load
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
  }
  
  // ============================================
  // BUTTON LOADING STATES
  // ============================================
  handleButtons() {
    document.querySelectorAll('button[data-loading-text]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (btn.classList.contains('btn-loading')) {
          e.preventDefault();
          return;
        }
        
        const form = btn.closest('form');
        if (form) {
          this.setButtonLoading(btn);
          
          // Auto-reset after form submission
          form.addEventListener('submit-complete', () => {
            this.clearButtonLoading(btn);
          }, { once: true });
        }
      });
    });
  }
  
  setButtonLoading(button, text = null) {
    const originalText = button.innerHTML;
    button.dataset.originalText = originalText;
    button.classList.add('btn-loading');
    
    if (text) {
      button.dataset.loadingText = text;
    }
  }
  
  clearButtonLoading(button) {
    button.classList.remove('btn-loading');
    if (button.dataset.originalText) {
      button.innerHTML = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  }
  
  // ============================================
  // FORM LOADING OVERLAY
  // ============================================
  handleForms() {
    document.querySelectorAll('form[data-loading-overlay]').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const overlay = this.createLoadingOverlay(form.dataset.loadingMessage || 'Submitting...');
        document.body.appendChild(overlay);
        
        // Show overlay
        requestAnimationFrame(() => {
          overlay.classList.add('active');
        });
        
        // Store reference for clearing
        this.activeLoaders.set(form, overlay);
      });
    });
  }
  
  createLoadingOverlay(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="spinner-gradient"></div>
      <div class="loading-overlay-content">
        <div class="loading-overlay-text">${message}</div>
        <div class="loading-overlay-progress">
          <div class="loading-overlay-progress-bar"></div>
        </div>
      </div>
    `;
    
    // Animate progress bar
    const progressBar = overlay.querySelector('.loading-overlay-progress-bar');
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90;
      progressBar.style.width = `${progress}%`;
    }, 500);
    
    overlay.dataset.progressInterval = progressInterval;
    
    return overlay;
  }
  
  hideLoadingOverlay(form) {
    const overlay = this.activeLoaders.get(form);
    if (!overlay) return;
    
    // Clear interval
    clearInterval(overlay.dataset.progressInterval);
    
    // Complete progress
    const progressBar = overlay.querySelector('.loading-overlay-progress-bar');
    progressBar.style.width = '100%';
    
    // Hide and remove
    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.remove();
        this.activeLoaders.delete(form);
      }, 300);
    }, 300);
  }
  
  // ============================================
  // SKELETON GENERATOR
  // ============================================
  static createSkeletonCard(options = {}) {
    const type = options.type || 'default';
    const hasImage = options.hasImage !== false;
    const hasAvatar = options.hasAvatar || false;
    const actionCount = options.actionCount || 0;
    
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    
    let html = '';
    
    if (hasAvatar) {
      html += `
        <div class="skeleton-card-header">
          <div class="skeleton skeleton-avatar"></div>
          <div class="skeleton-title-block">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-subtitle"></div>
          </div>
        </div>
      `;
    }
    
    if (hasImage) {
      html += `<div class="skeleton skeleton-image"></div>`;
    }
    
    html += `
      <div class="skeleton-content">
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line"></div>
      </div>
    `;
    
    if (actionCount > 0) {
      html += `<div class="skeleton-actions">`;
      for (let i = 0; i < actionCount; i++) {
        html += `<div class="skeleton skeleton-button ${i === 0 ? 'skeleton-button--primary' : ''}"></div>`;
      }
      html += `</div>`;
    }
    
    card.innerHTML = html;
    return card;
  }
  
  static createSkeletonGrid(count = 3, options = {}) {
    const grid = document.createElement('div');
    grid.className = 'skeleton-grid';
    
    for (let i = 0; i < count; i++) {
      grid.appendChild(LoadingStateManager.createSkeletonCard(options));
    }
    
    return grid;
  }
  
  static createSkeletonStats(count = 4) {
    const container = document.createElement('div');
    container.className = 'skeleton-stats';
    
    for (let i = 0; i < count; i++) {
      const stat = document.createElement('div');
      stat.className = 'skeleton-stat';
      stat.innerHTML = `
        <div class="skeleton skeleton-stat-number"></div>
        <div class="skeleton skeleton-stat-label"></div>
      `;
      container.appendChild(stat);
    }
    
    return container;
  }
  
  // ============================================
  // LAZY LOAD IMAGES WITH IO
  // ============================================
  static initLazyImages(options = {}) {
    const defaultOptions = {
      rootMargin: '50px',
      threshold: 0.01,
      ...options
    };
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          if (img.dataset.src) {
            // Create loading container
            const container = document.createElement('div');
            container.className = 'image-loading-container';
            container.style.cssText = `
              position: relative;
              width: 100%;
              padding-bottom: ${(img.height / img.width * 100) || 56.25}%;
            `;
            
            const placeholder = document.createElement('div');
            placeholder.className = 'image-placeholder';
            
            img.parentNode.insertBefore(container, img);
            container.appendChild(placeholder);
            container.appendChild(img);
            
            img.style.position = 'absolute';
            img.style.inset = '0';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            
            img.classList.add('image-blur-up');
            
            img.addEventListener('load', () => {
              img.classList.add('loaded');
              setTimeout(() => placeholder.remove(), 500);
            });
            
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          imageObserver.unobserve(img);
        }
      });
    }, defaultOptions);
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
    
    return imageObserver;
  }
}

// ============================================
// PAGE PRELOADER WITH PROGRESS
// ============================================
class PagePreloader {
  constructor(options = {}) {
    this.assets = [];
    this.loaded = 0;
    this.options = {
      minDisplayTime: options.minDisplayTime || 1500,
      showProgress: options.showProgress !== false,
      ...options
    };
    
    this.init();
  }
  
  init() {
    this.findAssets();
    this.createPreloader();
    this.startLoading();
  }
  
  findAssets() {
    // Find all images
    document.querySelectorAll('img').forEach(img => {
      if (img.src && !img.complete) {
        this.assets.push({ type: 'image', src: img.src, element: img });
      }
    });
    
    // Find all stylesheets
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      this.assets.push({ type: 'stylesheet', src: link.href });
    });
    
    // Find all scripts
    document.querySelectorAll('script[src]').forEach(script => {
      this.assets.push({ type: 'script', src: script.src });
    });
  }
  
  createPreloader() {
    this.preloader = document.createElement('div');
    this.preloader.className = 'loading-overlay';
    this.preloader.id = 'page-preloader';
    this.preloader.innerHTML = `
      <img src="assets/BuildBridge_Icon_Mark.svg" alt="BuildBridge" style="width: 60px; height: 60px;">
      <div class="loading-overlay-content">
        <div class="loading-overlay-text">Loading Experience...</div>
        ${this.options.showProgress ? `
          <div class="loading-overlay-progress">
            <div class="loading-overlay-progress-bar" id="preloader-progress"></div>
          </div>
          <div style="margin-top: 8px; font-size: 12px; color: rgba(201,206,214,0.5);">
            <span id="preloader-count">0</span> / ${this.assets.length} assets
          </div>
        ` : ''}
      </div>
    `;
    
    document.body.appendChild(this.preloader);
    this.progressBar = this.preloader.querySelector('#preloader-progress');
    this.countEl = this.preloader.querySelector('#preloader-count');
  }
  
  startLoading() {
    const startTime = Date.now();
    
    // Show preloader
    requestAnimationFrame(() => {
      this.preloader.classList.add('active');
    });
    
    // Track loading
    let completedAssets = 0;
    
    const updateProgress = () => {
      completedAssets++;
      const progress = (completedAssets / this.assets.length) * 100;
      
      if (this.progressBar) {
        this.progressBar.style.width = `${progress}%`;
      }
      if (this.countEl) {
        this.countEl.textContent = completedAssets;
      }
      
      if (completedAssets >= this.assets.length) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, this.options.minDisplayTime - elapsed);
        
        setTimeout(() => this.hide(), remaining);
      }
    };
    
    // If no assets, hide immediately after min time
    if (this.assets.length === 0) {
      setTimeout(() => this.hide(), this.options.minDisplayTime);
      return;
    }
    
    // Track each asset
    this.assets.forEach(asset => {
      if (asset.type === 'image') {
        if (asset.element.complete) {
          updateProgress();
        } else {
          asset.element.addEventListener('load', updateProgress);
          asset.element.addEventListener('error', updateProgress);
        }
      } else {
        // For stylesheets and scripts, check if loaded
        updateProgress();
      }
    });
  }
  
  hide() {
    if (this.progressBar) {
      this.progressBar.style.width = '100%';
    }
    
    setTimeout(() => {
      this.preloader.classList.remove('active');
      setTimeout(() => {
        this.preloader.remove();
        document.dispatchEvent(new CustomEvent('preloader:complete'));
      }, 300);
    }, 300);
  }
}

// ============================================
// AUTO-INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize loading state manager
  window.loadingManager = new LoadingStateManager();
  
  // Initialize lazy loading
  LoadingStateManager.initLazyImages();
  
  // Page preloader (optional - can be enabled by adding data-preload to body)
  if (document.body.dataset.preload !== undefined) {
    window.pagePreloader = new PagePreloader();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LoadingStateManager, PagePreloader };
}
