/**
 * v84.0: Smart Skeleton Loading v2
 * Fortune 500 Enhanced Loading States
 * 
 * Features:
 * - Intelligent content detection
 * - Progressive loading with blur-up images
 * - Staggered reveal animations
 * - Accessibility announcements
 * - Performance optimized
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    defaultDelay: 0,
    fadeDuration: 400,
    staggerDelay: 100,
    minDisplayTime: 300
  };

  // State
  const state = {
    loaders: new Map(),
    observer: null
  };

  /**
   * Create skeleton element from template
   */
  function createSkeleton(options = {}) {
    const {
      type = 'text',
      variant = 'default',
      count = 1,
      className = ''
    } = options;

    const container = document.createElement('div');
    container.className = `skeleton-v2-container ${className}`;
    
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = `skeleton-v2 skeleton-v2__${type} skeleton-v2--${variant}`;
      container.appendChild(skeleton);
    }

    return container;
  }

  /**
   * Create card skeleton layout
   */
  function createCardSkeleton(options = {}) {
    const {
      hasImage = true,
      hasAvatar = false,
      lineCount = 3,
      className = ''
    } = options;

    const card = document.createElement('div');
    card.className = `skeleton-v2-card ${className}`;
    
    let html = '';
    
    if (hasImage) {
      html += '<div class="skeleton-v2 skeleton-v2__image skeleton-v2--wave"></div>';
    }
    
    if (hasAvatar) {
      html += `
        <div class="skeleton-v2-card__header">
          <div class="skeleton-v2 skeleton-v2__avatar"></div>
          <div class="skeleton-v2-card__content" style="flex:1">
            <div class="skeleton-v2 skeleton-v2__text skeleton-v2__text--medium"></div>
          </div>
        </div>
      `;
    }
    
    html += '<div class="skeleton-v2-card__content">';
    html += '<div class="skeleton-v2 skeleton-v2__title skeleton-v2--wave"></div>';
    for (let i = 0; i < lineCount; i++) {
      const width = i === lineCount - 1 ? 'skeleton-v2__text--short' : 'skeleton-v2__text--long';
      html += `<div class="skeleton-v2 skeleton-v2__text ${width} skeleton-v2--shimmer"></div>`;
    }
    html += '</div>';
    
    card.innerHTML = html;
    return card;
  }

  /**
   * Create grid skeleton layout
   */
  function createGridSkeleton(options = {}) {
    const {
      columns = 3,
      rows = 2,
      className = ''
    } = options;

    const grid = document.createElement('div');
    grid.className = `skeleton-v2-grid skeleton-v2-grid--${columns} skeleton-v2-stagger ${className}`;
    
    const count = columns * rows;
    for (let i = 0; i < count; i++) {
      const card = createCardSkeleton({ hasImage: true, lineCount: 2 });
      grid.appendChild(card);
    }

    return grid;
  }

  /**
   * Skeleton Loader Class
   */
  class SkeletonLoader {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        delay: config.defaultDelay,
        fadeDuration: config.fadeDuration,
        onLoaded: null,
        ...options
      };
      
      this.skeleton = null;
      this.content = null;
      this.startTime = Date.now();
      this.isLoaded = false;
      
      this.init();
    }

    init() {
      // Wrap content if not already wrapped
      if (!this.element.querySelector('.skeleton-v2-content')) {
        this.wrapContent();
      }
      
      // Create skeleton overlay
      this.createSkeleton();
      
      // Hide content initially
      this.content = this.element.querySelector('.skeleton-v2-content');
      if (this.content) {
        this.content.style.opacity = '0';
      }
    }

    wrapContent() {
      const children = Array.from(this.element.children);
      const wrapper = document.createElement('div');
      wrapper.className = 'skeleton-v2-content';
      
      children.forEach(child => {
        wrapper.appendChild(child);
      });
      
      this.element.appendChild(wrapper);
    }

    createSkeleton() {
      const type = this.element.dataset.skeletonType || 'text';
      const variant = this.element.dataset.skeletonVariant || 'wave';
      
      this.skeleton = document.createElement('div');
      this.skeleton.className = `skeleton-v2-overlay skeleton-v2-${type}`;
      this.skeleton.setAttribute('role', 'status');
      this.skeleton.setAttribute('aria-label', 'Loading content...');
      this.skeleton.setAttribute('aria-live', 'polite');
      
      // Generate appropriate skeleton based on type
      let skeletonContent;
      switch (type) {
        case 'card':
          skeletonContent = createCardSkeleton({
            hasImage: this.element.dataset.skeletonImage !== 'false',
            lineCount: parseInt(this.element.dataset.skeletonLines) || 3
          });
          break;
        case 'grid':
          skeletonContent = createGridSkeleton({
            columns: parseInt(this.element.dataset.skeletonColumns) || 3,
            rows: parseInt(this.element.dataset.skeletonRows) || 2
          });
          break;
        case 'image':
          skeletonContent = createSkeleton({
            type: 'image',
            variant,
            className: 'skeleton-v2-corner'
          });
          break;
        case 'text':
        default:
          const lineCount = parseInt(this.element.dataset.skeletonLines) || 3;
          skeletonContent = document.createElement('div');
          skeletonContent.className = 'skeleton-v2-list';
          for (let i = 0; i < lineCount; i++) {
            const line = createSkeleton({
              type: 'text',
              variant,
              className: i === lineCount - 1 ? 'skeleton-v2__text--short' : 'skeleton-v2__text--long'
            });
            skeletonContent.appendChild(line.firstChild);
          }
          break;
      }
      
      this.skeleton.appendChild(skeletonContent);
      this.element.insertBefore(this.skeleton, this.element.firstChild);
    }

    load() {
      if (this.isLoaded) return Promise.resolve();
      
      return new Promise(resolve => {
        const elapsed = Date.now() - this.startTime;
        const remainingDelay = Math.max(0, this.options.delay - elapsed);
        
        setTimeout(() => {
          this.hideSkeleton();
          this.showContent();
          this.isLoaded = true;
          
          if (this.options.onLoaded) {
            this.options.onLoaded();
          }
          
          resolve();
        }, remainingDelay);
      });
    }

    hideSkeleton() {
      if (!this.skeleton) return;
      
      this.skeleton.classList.add('hidden');
      this.skeleton.setAttribute('aria-hidden', 'true');
      
      setTimeout(() => {
        if (this.skeleton && this.skeleton.parentNode) {
          this.skeleton.remove();
        }
      }, 500);
    }

    showContent() {
      if (!this.content) return;
      
      this.content.classList.add('loaded');
      this.content.style.opacity = '1';
      
      // Stagger child animations if enabled
      if (this.element.dataset.skeletonStagger === 'true') {
        this.staggerChildren();
      }
    }

    staggerChildren() {
      const children = this.content.children;
      Array.from(children).forEach((child, i) => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          child.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
        }, i * config.staggerDelay);
      });
    }

    destroy() {
      if (this.skeleton) {
        this.skeleton.remove();
      }
      state.loaders.delete(this.element);
    }
  }

  /**
   * Initialize lazy loading for images with skeleton
   */
  function initLazyImages() {
    const lazyImages = document.querySelectorAll('[data-skeleton-lazy]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          loadImageWithSkeleton(img);
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });

    lazyImages.forEach(img => {
      // Create skeleton placeholder
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-v2 skeleton-v2__image skeleton-v2--wave skeleton-v2-corner';
      skeleton.style.position = 'absolute';
      skeleton.style.inset = '0';
      
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      wrapper.style.width = '100%';
      
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(skeleton);
      wrapper.appendChild(img);
      
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';
      
      imageObserver.observe(img);
    });
  }

  /**
   * Load image with skeleton transition
   */
  function loadImageWithSkeleton(img) {
    const skeleton = img.previousElementSibling;
    const src = img.dataset.src || img.src;
    
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      
      if (skeleton) {
        skeleton.style.opacity = '0';
        setTimeout(() => skeleton.remove(), 400);
      }
      
      img.style.opacity = '1';
    };
    tempImg.src = src;
  }

  /**
   * Initialize all skeleton loaders
   */
  function initSkeletons() {
    const elements = document.querySelectorAll('[data-skeleton]');
    
    elements.forEach(el => {
      const loader = new SkeletonLoader(el, {
        delay: parseInt(el.dataset.skeletonDelay) || config.defaultDelay,
        onLoaded: () => {
          el.classList.add('skeleton-loaded');
          el.dispatchEvent(new CustomEvent('skeletonLoaded'));
        }
      });
      
      state.loaders.set(el, loader);
    });

    // Observe for lazy loading
    initLazyImages();
  }

  /**
   * Load all skeletons
   */
  function loadAll() {
    const promises = [];
    state.loaders.forEach(loader => {
      promises.push(loader.load());
    });
    return Promise.all(promises);
  }

  /**
   * Load specific skeleton
   */
  function load(element) {
    const loader = state.loaders.get(element);
    if (loader) {
      return loader.load();
    }
    return Promise.reject(new Error('Skeleton loader not found'));
  }

  // Initialize when DOM is ready
  function init() {
    initSkeletons();
    console.log('💀 Smart Skeleton Loading v2 initialized');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.SkeletonLoading = {
    loadAll,
    load,
    createSkeleton,
    createCardSkeleton,
    createGridSkeleton,
    SkeletonLoader
  };

})();
