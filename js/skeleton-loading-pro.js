/**
 * Skeleton Loading Pro - v39.0
 * Fortune 500 Professional Loading States
 * Features: Auto skeleton generation, progressive loading, image placeholders
 */

class SkeletonLoadingPro {
  constructor(options = {}) {
    this.options = {
      autoSkeleton: true,
      lazyImages: true,
      minDisplayTime: 800,
      fadeOutDuration: 400,
      ...options
    };
    
    this.loadingStates = new Map();
    this.observers = new Map();
    this.imageLoaders = new Map();
    
    this.init();
  }
  
  init() {
    if (this.options.autoSkeleton) {
      this.scanAndSkeleton();
    }
    
    if (this.options.lazyImages) {
      this.initLazyImages();
    }
    
    this.bindEvents();
    console.log('[Skeleton Loading Pro] Initialized');
  }
  
  scanAndSkeleton() {
    // Find elements with data-skeleton attribute
    document.querySelectorAll('[data-skeleton]').forEach(element => {
      const type = element.dataset.skeleton;
      this.createSkeleton(element, type);
    });
    
    // Auto-skeleton common patterns
    this.autoSkeletonSections();
  }
  
  autoSkeletonSections() {
    // Hero section skeleton
    const hero = document.querySelector('.hero');
    if (hero && !hero.dataset.skeletonInitialized) {
      this.createHeroSkeleton(hero);
    }
    
    // Services grid skeleton
    const services = document.querySelector('.services-grid');
    if (services && !services.dataset.skeletonInitialized) {
      this.createServicesSkeleton(services);
    }
    
    // Projects grid skeleton
    const projects = document.querySelector('.projects-grid');
    if (projects && !projects.dataset.skeletonInitialized) {
      this.createProjectsSkeleton(projects);
    }
    
    // Team grid skeleton
    const team = document.querySelector('.team-grid');
    if (team && !team.dataset.skeletonInitialized) {
      this.createTeamSkeleton(team);
    }
  }
  
  createSkeleton(container, type) {
    const skeletonId = 'skeleton-' + Math.random().toString(36).substr(2, 9);
    container.dataset.skeletonId = skeletonId;
    
    let skeletonHTML = '';
    
    switch (type) {
      case 'card':
        skeletonHTML = this.getCardSkeleton();
        break;
      case 'service':
        skeletonHTML = this.getServiceCardSkeleton();
        break;
      case 'project':
        skeletonHTML = this.getProjectCardSkeleton();
        break;
      case 'team':
        skeletonHTML = this.getTeamCardSkeleton();
        break;
      case 'hero':
        skeletonHTML = this.getHeroSkeleton();
        break;
      case 'stats':
        skeletonHTML = this.getStatsSkeleton();
        break;
      case 'text':
        skeletonHTML = this.getTextSkeleton();
        break;
      default:
        skeletonHTML = this.getCardSkeleton();
    }
    
    const wrapper = document.createElement('div');
    wrapper.className = 'skeleton-loading-enter';
    wrapper.innerHTML = skeletonHTML;
    
    // Store original content
    const originalContent = container.innerHTML;
    container.dataset.originalContent = btoa(originalContent);
    
    // Insert skeleton
    container.innerHTML = '';
    container.appendChild(wrapper);
    container.dataset.skeletonInitialized = 'true';
    
    // Store loading state
    this.loadingStates.set(skeletonId, {
      container: container,
      wrapper: wrapper,
      startTime: Date.now(),
      loaded: false
    });
    
    return skeletonId;
  }
  
  removeSkeleton(skeletonId) {
    const state = this.loadingStates.get(skeletonId);
    if (!state) return;
    
    const elapsed = Date.now() - state.startTime;
    const remaining = Math.max(0, this.options.minDisplayTime - elapsed);
    
    setTimeout(() => {
      // Add fade-out class
      state.wrapper.classList.add('skeleton-loaded');
      
      setTimeout(() => {
        // Restore original content with reveal animation
        const originalContent = atob(state.container.dataset.originalContent);
        state.container.innerHTML = originalContent;
        
        // Add reveal animation to children
        const children = state.container.children;
        Array.from(children).forEach((child, i) => {
          child.classList.add('content-reveal');
          child.style.transitionDelay = `${i * 100}ms`;
        });
        
        // Trigger reveal
        requestAnimationFrame(() => {
          Array.from(children).forEach(child => {
            child.classList.add('is-visible');
          });
        });
        
        this.loadingStates.delete(skeletonId);
      }, this.options.fadeOutDuration);
      
    }, remaining);
  }
  
  initLazyImages() {
    const images = document.querySelectorAll('img[data-lazy]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px'
    });
    
    images.forEach(img => {
      // Create skeleton placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'skeleton skeleton-image skeleton-image-landscape';
      placeholder.style.position = 'absolute';
      placeholder.style.inset = '0';
      
      img.parentElement.style.position = 'relative';
      img.parentElement.insertBefore(placeholder, img);
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.5s ease';
      
      this.imageLoaders.set(img, placeholder);
      imageObserver.observe(img);
    });
  }
  
  loadImage(img) {
    const placeholder = this.imageLoaders.get(img);
    const src = img.dataset.lazy;
    
    // Create new image for preloading
    const preloadImg = new Image();
    
    preloadImg.onload = () => {
      img.src = src;
      img.removeAttribute('data-lazy');
      
      // Fade in image and remove skeleton
      requestAnimationFrame(() => {
        img.style.opacity = '1';
        if (placeholder) {
          placeholder.classList.add('skeleton-loaded');
          setTimeout(() => placeholder.remove(), 400);
        }
      });
      
      this.imageLoaders.delete(img);
    };
    
    preloadImg.onerror = () => {
      // Show error state
      if (placeholder) {
        placeholder.style.background = 'rgba(201, 206, 214, 0.1)';
        placeholder.innerHTML = '<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:rgba(201,206,214,0.4);font-size:24px;">⚠️</span>';
      }
    };
    
    preloadImg.src = src;
  }
  
  // Skeleton Templates
  getCardSkeleton() {
    return `
      <div class="skeleton-card">
        <div class="skeleton-card__header">
          <div class="skeleton skeleton--avatar"></div>
          <div style="flex:1">
            <div class="skeleton skeleton--title" style="width:60%"></div>
            <div class="skeleton skeleton--text" style="width:40%"></div>
          </div>
        </div>
        <div class="skeleton-card__content">
          <div class="skeleton skeleton--paragraph"></div>
          <div class="skeleton skeleton--paragraph"></div>
          <div class="skeleton skeleton--paragraph"></div>
        </div>
        <div class="skeleton-card__footer">
          <div class="skeleton skeleton--button-small"></div>
          <div class="skeleton skeleton--badge"></div>
        </div>
      </div>
    `;
  }
  
  getServiceCardSkeleton() {
    return `
      <div class="skeleton-service-card">
        <div class="skeleton skeleton-service-card__icon"></div>
        <div class="skeleton skeleton-service-card__title"></div>
        <div class="skeleton skeleton-service-card__text"></div>
        <div class="skeleton skeleton-service-card__text" style="width:80%"></div>
        <div class="skeleton skeleton-service-card__text" style="width:60%"></div>
      </div>
    `;
  }
  
  getProjectCardSkeleton() {
    return `
      <div class="skeleton-project-card">
        <div class="skeleton skeleton-project-card__image"></div>
        <div class="skeleton-project-card__content">
          <div class="skeleton skeleton-project-card__title"></div>
          <div class="skeleton skeleton-project-card__subtitle"></div>
        </div>
      </div>
    `;
  }
  
  getTeamCardSkeleton() {
    return `
      <div class="skeleton-team-card">
        <div class="skeleton skeleton-team-card__avatar"></div>
        <div class="skeleton skeleton-team-card__name"></div>
        <div class="skeleton skeleton-team-card__role"></div>
      </div>
    `;
  }
  
  getHeroSkeleton() {
    return `
      <div class="skeleton-hero">
        <div class="skeleton-hero__content">
          <div class="skeleton skeleton--badge" style="margin-bottom:16px"></div>
          <div class="skeleton skeleton--heading"></div>
          <div class="skeleton skeleton--paragraph"></div>
          <div class="skeleton skeleton--paragraph" style="width:90%"></div>
          <div class="skeleton skeleton--button" style="margin-top:24px"></div>
        </div>
        <div class="skeleton skeleton-hero__image"></div>
      </div>
    `;
  }
  
  getStatsSkeleton() {
    return `
      <div class="skeleton-stats">
        ${Array(4).fill(0).map(() => `
          <div class="skeleton-stat">
            <div class="skeleton skeleton-stat__number"></div>
            <div class="skeleton skeleton-stat__label"></div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  getTextSkeleton() {
    return `
      <div class="skeleton-text">
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton skeleton--paragraph"></div>
        <div class="skeleton skeleton--paragraph"></div>
        <div class="skeleton skeleton--paragraph"></div>
        <div class="skeleton skeleton--paragraph" style="width:70%"></div>
      </div>
    `;
  }
  
  // Public API
  showLoading(selector, type = 'card') {
    const elements = document.querySelectorAll(selector);
    const ids = [];
    
    elements.forEach(el => {
      const id = this.createSkeleton(el, type);
      ids.push(id);
    });
    
    return ids;
  }
  
  hideLoading(ids) {
    if (Array.isArray(ids)) {
      ids.forEach(id => this.removeSkeleton(id));
    } else {
      this.removeSkeleton(ids);
    }
  }
  
  showGlobalLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'skeleton-overlay';
    overlay.id = 'global-skeleton-loading';
    overlay.innerHTML = '<div class="skeleton-overlay__spinner"></div>';
    document.body.appendChild(overlay);
    
    document.body.style.overflow = 'hidden';
  }
  
  hideGlobalLoading() {
    const overlay = document.getElementById('global-skeleton-loading');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
      }, 300);
    }
  }
  
  bindEvents() {
    // Handle page load
    window.addEventListener('load', () => {
      // Auto-remove skeletons after load
      this.loadingStates.forEach((state, id) => {
        this.removeSkeleton(id);
      });
    });
    
    // Handle AJAX content
    document.addEventListener('contentLoaded', (e) => {
      if (e.detail && e.detail.selector) {
        this.scanAndSkeleton();
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.skeletonLoader = new SkeletonLoadingPro();
  });
} else {
  window.skeletonLoader = new SkeletonLoadingPro();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkeletonLoadingPro;
}
