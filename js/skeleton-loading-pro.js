/**
 * V87.4: SKELETON LOADING STATES PRO
 * Professional Loading Placeholder System
 * Fortune 500 Quality Loading Experience
 */

class SkeletonLoaderPro {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      type: options.type || 'card',
      count: options.count || 1,
      animation: options.animation || 'shimmer',
      theme: options.theme || 'dark',
      contentLoaded: options.contentLoaded || false,
      ...options
    };
    
    this.skeletons = [];
    this.init();
  }
  
  init() {
    this.createSkeletons();
  }
  
  createSkeletons() {
    for (let i = 0; i < this.options.count; i++) {
      const skeleton = this.createSkeletonElement();
      this.container.appendChild(skeleton);
      this.skeletons.push(skeleton);
    }
    
    if (this.options.contentLoaded) {
      this.hide();
    }
  }
  
  createSkeletonElement() {
    const wrapper = document.createElement('div');
    wrapper.className = `skeleton-pro skeleton-${this.options.type} skeleton-${this.options.theme}`;
    wrapper.setAttribute('role', 'status');
    wrapper.setAttribute('aria-label', 'Loading content');
    wrapper.setAttribute('aria-live', 'polite');
    
    switch (this.options.type) {
      case 'card':
        wrapper.innerHTML = this.getCardSkeleton();
        break;
      case 'text':
        wrapper.innerHTML = this.getTextSkeleton();
        break;
      case 'image':
        wrapper.innerHTML = this.getImageSkeleton();
        break;
      case 'list':
        wrapper.innerHTML = this.getListSkeleton();
        break;
      case 'table':
        wrapper.innerHTML = this.getTableSkeleton();
        break;
      case 'profile':
        wrapper.innerHTML = this.getProfileSkeleton();
        break;
      case 'article':
        wrapper.innerHTML = this.getArticleSkeleton();
        break;
      case 'stats':
        wrapper.innerHTML = this.getStatsSkeleton();
        break;
      case 'gallery':
        wrapper.innerHTML = this.getGallerySkeleton();
        break;
      case 'custom':
        wrapper.innerHTML = this.options.customTemplate || '';
        break;
      default:
        wrapper.innerHTML = this.getCardSkeleton();
    }
    
    return wrapper;
  }
  
  getCardSkeleton() {
    return `
      <div class="skeleton-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-title-group">
          <div class="skeleton-line skeleton-line-short"></div>
          <div class="skeleton-line skeleton-line-xs"></div>
        </div>
      </div>
      <div class="skeleton-media"></div>
      <div class="skeleton-content">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line skeleton-line-medium"></div>
      </div>
      <div class="skeleton-${this.options.animation}"></div>
    `;
  }
  
  getTextSkeleton() {
    return `
      <div class="skeleton-content skeleton-text-only">
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line skeleton-line-medium"></div>
        <div class="skeleton-line skeleton-line-short"></div>
      </div>
      <div class="skeleton-${this.options.animation}"></div>
    `;
  }
  
  getImageSkeleton() {
    return `
      <div class="skeleton-media skeleton-media-square">
        <div class="skeleton-image-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </div>
      </div>
      <div class="skeleton-${this.options.animation}"></div>
    `;
  }
  
  getListSkeleton() {
    return `
      <div class="skeleton-list">
        ${Array(5).fill(0).map(() => `
          <div class="skeleton-list-item">
            <div class="skeleton-avatar skeleton-avatar-sm"></div>
            <div class="skeleton-line-group">
              <div class="skeleton-line skeleton-line-short"></div>
              <div class="skeleton-line skeleton-line-xs"></div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="skeleton-${this.options.animation}"></div>
    `;
  }
  
  getTableSkeleton() {
    return `
      <div class="skeleton-table">
        <div class="skeleton-table-header">
          ${Array(4).fill(0).map(() => `
            <div class="skeleton-line skeleton-line-short"></div>
          `).join('')}
        </div>
        ${Array(5).fill(0).map(() => `
          <div class="skeleton-table-row">
            ${Array(4).fill(0).map(() => `
              <div class="skeleton-line"></div>
            `).join('')}
          </div>
        `).join('')}
      </div>
      <div class="skeleton-${this.options.animation}"></div>
    `;
  }
  
  getProfileSkeleton() {
    return `
      <div class="skeleton-profile">
        <div class="skeleton-cover"></div>
        <div class="skeleton-profile-content">
          <div class="skeleton-avatar skeleton-avatar-lg"></div>
          <div class="skeleton-profile-info">
            <div class="skeleton-line"></div>
            <div class="skeleton-line skeleton-line-medium"></div>
            <div class="skeleton-line skeleton-line-short"></div>
          </div>
        </div>
      </div>
      <div class="skeleton-${this.options.animation}"></div>
    `;
  }
  
  getArticleSkeleton() {
    return `
      <div class="skeleton-article">
        <div class="skeleton-media skeleton-media-wide"></div>
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-line-lg"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line skeleton-line-medium"></div>
          <div class="skeleton-gap"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line skeleton-line-short"></div>
        </div>
      </div>
      <div class="skeleton-${this.options.animation}"></div>
    `;
  }
  
  getStatsSkeleton() {
    return `
      <div class="skeleton-stats">
        ${Array(4).fill(0).map(() => `
          <div class="skeleton-stat-item">
            <div class="skeleton-circle"></div>
            <div class="skeleton-line skeleton-line-short"></div>
            <div class="skeleton-line skeleton-line-xs"></div>
          </div>
        `).join('')}
      </div>
      <div class="skeleton-${this.options.animation}"></div>
    `;
  }
  
  getGallerySkeleton() {
    return `
      <div class="skeleton-gallery">
        <div class="skeleton-gallery-main skeleton-media"></div>
        <div class="skeleton-gallery-thumbs">
          ${Array(4).fill(0).map(() => `
            <div class="skeleton-media skeleton-media-sm"></div>
          `).join('')}
        </div>
      </div>
      <div class="skeleton-${this.options.animation}"></div>
    `;
  }
  
  show() {
    this.skeletons.forEach(skeleton => {
      skeleton.style.display = 'block';
      skeleton.classList.remove('skeleton-fade-out');
    });
  }
  
  hide() {
    this.skeletons.forEach(skeleton => {
      skeleton.classList.add('skeleton-fade-out');
      setTimeout(() => {
        skeleton.style.display = 'none';
      }, 300);
    });
  }
  
  destroy() {
    this.skeletons.forEach(skeleton => {
      skeleton.remove();
    });
    this.skeletons = [];
  }
  
  // Static method for quick initialization
  static load(containerSelector, options = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) return null;
    return new SkeletonLoaderPro(container, options);
  }
}

// ========================================
// IMAGE LOADING WITH SKELETON
// ========================================

class SkeletonImageLoader {
  constructor(img, options = {}) {
    this.img = img;
    this.options = {
      backgroundColor: options.backgroundColor || '#1a1a22',
      animation: options.animation || 'shimmer',
      theme: options.theme || 'dark',
      ...options
    };
    
    this.wrapper = null;
    this.skeleton = null;
    
    this.init();
  }
  
  init() {
    // Wrap image
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'skeleton-image-wrapper';
    this.wrapper.style.cssText = `
      position: relative;
      background: ${this.options.backgroundColor};
      overflow: hidden;
    `;
    
    this.img.parentNode.insertBefore(this.wrapper, this.img);
    this.wrapper.appendChild(this.img);
    
    // Create skeleton
    this.skeleton = document.createElement('div');
    this.skeleton.className = `skeleton-pro skeleton-image-placeholder skeleton-${this.options.theme}`;
    this.skeleton.innerHTML = `<div class="skeleton-${this.options.animation}"></div>`;
    
    this.wrapper.appendChild(this.skeleton);
    
    // Hide image initially
    this.img.style.opacity = '0';
    this.img.style.transition = 'opacity 0.3s ease';
    
    // Listen for image load
    if (this.img.complete) {
      this.onImageLoad();
    } else {
      this.img.addEventListener('load', () => this.onImageLoad());
      this.img.addEventListener('error', () => this.onImageError());
    }
  }
  
  onImageLoad() {
    this.skeleton.classList.add('skeleton-fade-out');
    this.img.style.opacity = '1';
    
    setTimeout(() => {
      this.skeleton.remove();
    }, 300);
  }
  
  onImageError() {
    this.skeleton.innerHTML = `
      <div class="skeleton-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>Failed to load</span>
      </div>
    `;
    this.skeleton.classList.add('skeleton-error-state');
  }
}

// ========================================
// PROGRESSIVE LOADING MANAGER
// ========================================

class ProgressiveLoader {
  constructor() {
    this.observer = null;
    this.pendingImages = new Set();
    this.init();
  }
  
  init() {
    // Intersection Observer for lazy loading
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.observer.observe(img);
    });
  }
  
  loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;
    
    // Create skeleton loader
    const loader = new SkeletonImageLoader(img, {
      animation: img.dataset.skeletonAnimation || 'shimmer',
      theme: img.dataset.skeletonTheme || 'dark'
    });
    
    // Set src to load image
    img.src = src;
    img.removeAttribute('data-src');
  }
}

// ========================================
// AUTO-INITIALIZATION
// ========================================

function initSkeletonLoadingPro() {
  // Initialize progressive loader
  window.progressiveLoader = new ProgressiveLoader();
  
  // Auto-initialize skeleton containers
  document.querySelectorAll('[data-skeleton]').forEach(container => {
    const options = {
      type: container.dataset.skeleton || 'card',
      count: parseInt(container.dataset.skeletonCount) || 1,
      animation: container.dataset.skeletonAnimation || 'shimmer',
      theme: container.dataset.skeletonTheme || 'dark'
    };
    
    container._skeletonLoader = new SkeletonLoaderPro(container, options);
  });
  
  // Auto-initialize skeleton images
  document.querySelectorAll('img[data-skeleton-load]').forEach(img => {
    new SkeletonImageLoader(img);
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSkeletonLoadingPro);
} else {
  initSkeletonLoadingPro();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SkeletonLoaderPro, SkeletonImageLoader, ProgressiveLoader };
}
