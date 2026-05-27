/**
 * Skeleton Loading States v20.0
 * Professional perceived loading experience
 */

class SkeletonLoader {
  constructor(options = {}) {
    this.config = {
      delay: options.delay || 300,
      fadeDuration: options.fadeDuration || 400,
      minDisplayTime: options.minDisplayTime || 800,
      autoInit: options.autoInit !== false,
      ...options
    };
    
    this.startTime = Date.now();
    this.elements = new Map();
    
    if (this.config.autoInit) {
      this.init();
    }
  }
  
  init() {
    // Show skeletons immediately
    this.showSkeletons();
    
    // Hide after content loads
    if (document.readyState === 'complete') {
      this.hideSkeletons();
    } else {
      window.addEventListener('load', () => this.hideSkeletons());
    }
  }
  
  showSkeletons() {
    // Add loading class to containers
    document.querySelectorAll('[data-skeleton]').forEach(container => {
      container.classList.add('content-loading');
      this.createSkeletonContent(container);
    });
    
    // Create skeletons for specific types
    document.querySelectorAll('[data-skeleton-type]').forEach(el => {
      this.createSkeletonForElement(el);
    });
  }
  
  createSkeletonContent(container) {
    const type = container.dataset.skeleton;
    const skeletonEl = document.createElement('div');
    skeletonEl.className = 'skeleton-content';
    
    switch(type) {
      case 'card':
        skeletonEl.innerHTML = `
          <div class="skeleton-card">
            <div class="skeleton-card-header">
              <div class="skeleton skeleton-avatar"></div>
              <div style="flex: 1;">
                <div class="skeleton skeleton-text skeleton-text--medium"></div>
                <div class="skeleton skeleton-text skeleton-text--short"></div>
              </div>
            </div>
            <div class="skeleton-card-body">
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text skeleton-text--medium"></div>
            </div>
          </div>
        `;
        break;
        
      case 'hero':
        skeletonEl.innerHTML = `
          <div class="skeleton-hero">
            <div class="skeleton-hero-content">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text skeleton-text--medium"></div>
              <div style="margin-top: 30px;">
                <div class="skeleton skeleton-button" style="display: inline-block; margin-right: 16px;"></div>
                <div class="skeleton skeleton-button" style="display: inline-block;"></div>
              </div>
            </div>
          </div>
        `;
        break;
        
      case 'stats':
        skeletonEl.innerHTML = `
          <div class="skeleton-stats-grid">
            ${Array(4).fill(0).map(() => `
              <div class="skeleton-stat-item">
                <div class="skeleton skeleton-stat-number"></div>
                <div class="skeleton skeleton-text skeleton-text--medium" style="margin: 0 auto; width: 80px;"></div>
              </div>
            `).join('')}
          </div>
        `;
        break;
        
      case 'image':
        skeletonEl.innerHTML = `
          <div class="skeleton skeleton-image"></div>
        `;
        break;
        
      default:
        skeletonEl.innerHTML = `
          <div class="skeleton-card">
            <div class="skeleton-card-body">
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text skeleton-text--medium"></div>
            </div>
          </div>
        `;
    }
    
    container.appendChild(skeletonEl);
    this.elements.set(container, skeletonEl);
  }
  
  createSkeletonForElement(el) {
    const type = el.dataset.skeletonType;
    el.classList.add('skeleton');
    
    switch(type) {
      case 'text':
        el.classList.add('skeleton-text');
        break;
      case 'title':
        el.classList.add('skeleton-title');
        break;
      case 'image':
        el.classList.add('skeleton-image');
        break;
      case 'avatar':
        el.classList.add('skeleton-avatar');
        break;
      case 'button':
        el.classList.add('skeleton-button');
        break;
    }
  }
  
  hideSkeletons() {
    const elapsed = Date.now() - this.startTime;
    const remaining = Math.max(0, this.config.minDisplayTime - elapsed);
    
    setTimeout(() => {
      document.querySelectorAll('[data-skeleton]').forEach(container => {
        container.classList.remove('content-loading');
        container.classList.add('content-loaded');
        
        // Remove skeleton elements
        const skeleton = this.elements.get(container);
        if (skeleton) {
          skeleton.style.opacity = '0';
          setTimeout(() => skeleton.remove(), this.config.fadeDuration);
        }
      });
      
      // Remove skeleton classes from typed elements
      document.querySelectorAll('[data-skeleton-type]').forEach(el => {
        el.classList.remove('skeleton', 'skeleton-text', 'skeleton-title', 'skeleton-image', 'skeleton-avatar', 'skeleton-button');
        el.removeAttribute('data-skeleton-type');
      });
    }, remaining);
  }
  
  // Show full page overlay loader
  showPageLoader() {
    this.pageLoader = document.createElement('div');
    this.pageLoader.className = 'skeleton-page-overlay';
    this.pageLoader.innerHTML = `
      <div class="skeleton-page-logo"></div>
      <div class="skeleton-page-progress">
        <div class="skeleton-page-progress-bar"></div>
      </div>
    `;
    document.body.appendChild(this.pageLoader);
    document.body.style.overflow = 'hidden';
  }
  
  hidePageLoader() {
    if (this.pageLoader) {
      this.pageLoader.classList.add('fade-out');
      setTimeout(() => {
        this.pageLoader.remove();
        document.body.style.overflow = '';
      }, 500);
    }
  }
  
  // Manual control for async content
  show(element) {
    element.classList.add('content-loading');
    element.classList.remove('content-loaded');
    if (!this.elements.has(element)) {
      this.createSkeletonContent(element);
    }
  }
  
  hide(element) {
    element.classList.remove('content-loading');
    element.classList.add('content-loaded');
    const skeleton = this.elements.get(element);
    if (skeleton) {
      skeleton.style.opacity = '0';
      setTimeout(() => skeleton.remove(), this.config.fadeDuration);
      this.elements.delete(element);
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.skeletonLoader = new SkeletonLoader();
  });
} else {
  window.skeletonLoader = new SkeletonLoader();
}
