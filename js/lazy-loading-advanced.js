/**
 * BuildBridge v15.0 - Advanced Lazy Loading System
 * Fortune 500 performance optimization with intelligent loading
 */

(function() {
  'use strict';

  class AdvancedLazyLoader {
    constructor(options = {}) {
      this.options = {
        rootMargin: '100px',
        threshold: 0.01,
        enableBlurUp: true,
        enableResponsive: true,
        preloadOffset: 2,
        ...options
      };

      this.imageCache = new Map();
      this.loadingQueue = [];
      this.observer = null;
      this.progressiveLoader = null;

      this.init();
    }

    init() {
      this.setupIntersectionObserver();
      this.processImages();
      this.setupProgressiveLoader();
    }

    setupIntersectionObserver() {
      const config = {
        root: null,
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, config);
    }

    processImages() {
      const images = document.querySelectorAll('img[data-src]:not([data-ll-processed])');
      
      images.forEach((img, index) => {
        img.setAttribute('data-ll-processed', 'true');
        img.setAttribute('data-ll-index', index);
        
        // Add loading state
        this.addLoadingState(img);
        
        // Add to blur-up placeholder if enabled
        if (this.options.enableBlurUp) {
          this.addBlurUpPlaceholder(img);
        }
        
        // Observe for lazy loading
        this.observer.observe(img);
      });
    }

    addLoadingState(img) {
      // Wrap in container
      const wrapper = document.createElement('div');
      wrapper.className = 'lazy-image-wrapper';
      wrapper.style.cssText = `
        position: relative;
        overflow: hidden;
        display: inline-block;
        width: 100%;
        height: 100%;
      `;
      
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);

      // Add shimmer loader
      const shimmer = document.createElement('div');
      shimmer.className = 'lazy-shimmer';
      shimmer.style.cssText = `
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          rgba(201, 206, 214, 0.05) 25%,
          rgba(201, 206, 214, 0.1) 50%,
          rgba(201, 206, 214, 0.05) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        z-index: 1;
      `;
      wrapper.appendChild(shimmer);

      // Add styles
      if (!document.getElementById('lazy-loader-styles')) {
        const style = document.createElement('style');
        style.id = 'lazy-loader-styles';
        style.textContent = `
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          .lazy-image-wrapper img {
            opacity: 0;
            transition: opacity 0.5s ease;
          }
          .lazy-image-wrapper.loaded img {
            opacity: 1;
          }
          .lazy-image-wrapper.loaded .lazy-shimmer {
            display: none;
          }
          .lazy-image-wrapper.loaded .blur-up-placeholder {
            opacity: 0;
          }
        `;
        document.head.appendChild(style);
      }
    }

    addBlurUpPlaceholder(img) {
      const wrapper = img.closest('.lazy-image-wrapper');
      if (!wrapper || !img.dataset.srcLow) return;

      const placeholder = document.createElement('div');
      placeholder.className = 'blur-up-placeholder';
      placeholder.style.cssText = `
        position: absolute;
        inset: 0;
        background-image: url('${img.dataset.srcLow}');
        background-size: cover;
        background-position: center;
        filter: blur(20px);
        transform: scale(1.1);
        transition: opacity 0.5s ease;
        z-index: 0;
      `;
      wrapper.insertBefore(placeholder, img);
    }

    loadImage(img) {
      const src = img.dataset.src;
      const srcset = img.dataset.srcset;
      const sizes = img.dataset.sizes;

      if (!src) return;

      // Check cache
      if (this.imageCache.has(src)) {
        this.applyImageSource(img, src, srcset, sizes);
        return;
      }

      // Create new image to preload
      const preloadImg = new Image();
      
      preloadImg.onload = () => {
        this.imageCache.set(src, true);
        this.applyImageSource(img, src, srcset, sizes);
      };

      preloadImg.onerror = () => {
        this.handleImageError(img);
      };

      // Handle srcset
      if (srcset) {
        preloadImg.srcset = srcset;
        preloadImg.sizes = sizes || '100vw';
      }
      preloadImg.src = src;
    }

    applyImageSource(img, src, srcset, sizes) {
      if (srcset) {
        img.srcset = srcset;
        img.sizes = sizes || '100vw';
      }
      img.src = src;
      
      const wrapper = img.closest('.lazy-image-wrapper');
      if (wrapper) {
        wrapper.classList.add('loaded');
      }

      // Remove data attributes
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
      img.removeAttribute('data-src-low');

      // Trigger custom event
      img.dispatchEvent(new CustomEvent('lazyLoaded', { detail: { src } }));
    }

    handleImageError(img) {
      const wrapper = img.closest('.lazy-image-wrapper');
      if (wrapper) {
        wrapper.classList.add('error');
      }
      
      // Fallback to placeholder
      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
      
      console.warn('Failed to load image:', img.dataset.src);
    }

    setupProgressiveLoader() {
      // Preload images near viewport
      const preloadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const index = parseInt(img.dataset.llIndex || 0);
            this.preloadNearby(index);
          }
        });
      }, {
        rootMargin: '200px'
      });

      // Observe visible images for preloading neighbors
      document.querySelectorAll('img[data-ll-processed]').forEach(img => {
        preloadObserver.observe(img);
      });
    }

    preloadNearby(currentIndex) {
      const offset = this.options.preloadOffset;
      const images = document.querySelectorAll('img[data-ll-processed]');
      
      for (let i = currentIndex + 1; i <= currentIndex + offset && i < images.length; i++) {
        const img = images[i];
        if (img.dataset.src && !this.imageCache.has(img.dataset.src)) {
          const preloadImg = new Image();
          preloadImg.src = img.dataset.src;
        }
      }
    }

    // Public API
    refresh() {
      this.processImages();
    }

    preload(src) {
      if (this.imageCache.has(src)) return Promise.resolve();
      
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          this.imageCache.set(src, true);
          resolve(src);
        };
        img.onerror = reject;
        img.src = src;
      });
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.advancedLazyLoader = new AdvancedLazyLoader();
    });
  } else {
    window.advancedLazyLoader = new AdvancedLazyLoader();
  }
})();
