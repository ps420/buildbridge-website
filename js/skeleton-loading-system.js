/**
 * v28.0: Skeleton Loading System
 * Fortune 500 Quality Loading Experience
 * Progressive loading with shimmer effects and content reveals
 */

(function() {
  'use strict';
  
  const SkeletonLoader = {
    // Configuration
    config: {
      shimmerDuration: 1500,
      revealDelay: 100,
      progressiveLoadDelay: 200,
      imageLoadTimeout: 10000
    },
    
    // State
    loadedImages: new Set(),
    observers: [],
    
    /**
     * Initialize skeleton loading system
     */
    init() {
      this.setupProgressiveImages();
      this.setupContentReveals();
      this.setupPageSkeleton();
      console.log('💀 BuildBridge Skeleton Loading System initialized');
    },
    
    /**
     * Setup progressive image loading
     */
    setupProgressiveImages() {
      const images = document.querySelectorAll('img[data-src]');
      
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target);
              imageObserver.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: '50px 0px',
          threshold: 0.01
        });
        
        images.forEach(img => {
          // Wrap in skeleton container
          this.wrapImageWithSkeleton(img);
          imageObserver.observe(img);
        });
        
        this.observers.push(imageObserver);
      } else {
        // Fallback: load all images immediately
        images.forEach(img => this.loadImage(img));
      }
    },
    
    /**
     * Wrap image with skeleton loader
     */
    wrapImageWithSkeleton(img) {
      if (img.parentElement?.classList?.contains('progressive-image')) return;
      
      const wrapper = document.createElement('div');
      wrapper.className = 'progressive-image';
      
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton skeleton-image';
      
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(skeleton);
      wrapper.appendChild(img);
    },
    
    /**
     * Load image with fade-in
     */
    loadImage(img) {
      const src = img.dataset.src;
      if (!src || this.loadedImages.has(src)) return;
      
      const wrapper = img.closest('.progressive-image');
      
      // Create new image for preloading
      const preloadImg = new Image();
      
      preloadImg.onload = () => {
        img.src = src;
        img.removeAttribute('data-src');
        this.loadedImages.add(src);
        
        if (wrapper) {
          requestAnimationFrame(() => {
            wrapper.classList.add('loaded');
          });
        }
        
        // Trigger custom event
        img.dispatchEvent(new CustomEvent('imageLoaded', { detail: { src } }));
      };
      
      preloadImg.onerror = () => {
        console.warn('Failed to load image:', src);
        img.dispatchEvent(new CustomEvent('imageError', { detail: { src } }));
      };
      
      // Start loading
      preloadImg.src = src;
      
      // Timeout fallback
      setTimeout(() => {
        if (!preloadImg.complete) {
          console.warn('Image load timeout:', src);
        }
      }, this.config.imageLoadTimeout);
    },
    
    /**
     * Setup content reveal animations
     */
    setupContentReveals() {
      const reveals = document.querySelectorAll('.content-reveal');
      
      if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                entry.target.classList.add('loaded');
              }, index * this.config.revealDelay);
              revealObserver.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        });
        
        reveals.forEach(el => revealObserver.observe(el));
        this.observers.push(revealObserver);
      } else {
        // Fallback: show all immediately
        reveals.forEach(el => el.classList.add('loaded'));
      }
    },
    
    /**
     * Create skeleton card grid
     */
    createSkeletonGrid(count = 4, type = 'default') {
      const grid = document.createElement('div');
      grid.className = 'skeleton-card-grid';
      
      for (let i = 0; i < count; i++) {
        const card = this.createSkeletonCard(type);
        grid.appendChild(card);
      }
      
      return grid;
    },
    
    /**
     * Create skeleton card
     */
    createSkeletonCard(type = 'default') {
      const card = document.createElement('div');
      card.className = 'skeleton-card-item';
      
      switch(type) {
        case 'project':
          card.innerHTML = `
            <div class="skeleton skeleton-image" style="aspect-ratio: 16/9;"></div>
            <div class="skeleton skeleton-text heading" style="width: 70%;"></div>
            <div class="skeleton skeleton-text medium"></div>
            <div class="card-skeleton-footer">
              <div class="skeleton skeleton-button" style="width: 100px; height: 36px;"></div>
            </div>
          `;
          break;
          
        case 'team':
          card.innerHTML = `
            <div class="skeleton skeleton-avatar large" style="margin: 0 auto;"></div>
            <div class="skeleton skeleton-text heading" style="width: 60%; margin: 0 auto;"></div>
            <div class="skeleton skeleton-text short" style="margin: 0 auto;"></div>
          `;
          break;
          
        case 'testimonial':
          card.innerHTML = `
            <div class="card-skeleton-header">
              <div class="skeleton skeleton-avatar medium"></div>
              <div style="flex: 1;">
                <div class="skeleton skeleton-text" style="width: 50%;"></div>
                <div class="skeleton skeleton-text short" style="width: 30%;"></div>
              </div>
            </div>
            <div class="card-skeleton-body">
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text medium"></div>
            </div>
          `;
          break;
          
        default:
          card.innerHTML = `
            <div class="card-skeleton-header">
              <div class="skeleton skeleton-avatar medium"></div>
              <div style="flex: 1;">
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text short"></div>
              </div>
            </div>
            <div class="card-skeleton-body">
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text"></div>
            </div>
          `;
      }
      
      return card;
    },
    
    /**
     * Create page skeleton overlay
     */
    createPageSkeleton() {
      const overlay = document.createElement('div');
      overlay.className = 'page-skeleton-overlay';
      overlay.id = 'page-skeleton';
      
      overlay.innerHTML = `
        <div class="page-skeleton-header">
          <div class="skeleton page-skeleton-logo"></div>
          <div class="page-skeleton-nav">
            <div class="skeleton page-skeleton-nav-item"></div>
            <div class="skeleton page-skeleton-nav-item"></div>
            <div class="skeleton page-skeleton-nav-item"></div>
            <div class="skeleton page-skeleton-nav-item"></div>
          </div>
        </div>
        <div class="page-skeleton-hero">
          <div class="page-skeleton-hero-text">
            <div class="skeleton page-skeleton-hero-title"></div>
            <div class="skeleton page-skeleton-hero-subtitle"></div>
            <div class="skeleton skeleton-button"></div>
          </div>
          <div class="skeleton page-skeleton-hero-image"></div>
        </div>
        <div class="page-skeleton-section">
          <div class="skeleton page-skeleton-section-header"></div>
          <div class="page-skeleton-grid">
            <div class="skeleton skeleton-card" style="height: 250px;"></div>
            <div class="skeleton skeleton-card" style="height: 250px;"></div>
            <div class="skeleton skeleton-card" style="height: 250px;"></div>
            <div class="skeleton skeleton-card" style="height: 250px;"></div>
          </div>
        </div>
      `;
      
      return overlay;
    },
    
    /**
     * Setup page skeleton
     */
    setupPageSkeleton() {
      // Don't show on subsequent visits
      if (sessionStorage.getItem('skeleton-shown')) return;
      
      const skeleton = this.createPageSkeleton();
      document.body.appendChild(skeleton);
      
      // Hide when page is loaded
      window.addEventListener('load', () => {
        setTimeout(() => {
          skeleton.classList.add('hidden');
          sessionStorage.setItem('skeleton-shown', 'true');
          setTimeout(() => skeleton.remove(), 500);
        }, 800);
      });
      
      // Fallback hide
      setTimeout(() => {
        if (skeleton.parentNode) {
          skeleton.classList.add('hidden');
          setTimeout(() => skeleton.remove(), 500);
        }
      }, 3000);
    },
    
    /**
     * Show loading state on element
     */
    showLoading(element, type = 'spinner') {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      if (!element) return;
      
      element.classList.add('smart-loading');
      
      if (type === 'dots') {
        const dots = document.createElement('span');
        dots.className = 'loading-dots';
        dots.innerHTML = '<span></span><span></span><span></span>';
        element.appendChild(dots);
      }
    },
    
    /**
     * Hide loading state
     */
    hideLoading(element) {
      if (typeof element === 'string') {
        element = document.querySelector(element);
      }
      if (!element) return;
      
      element.classList.remove('smart-loading');
      const dots = element.querySelector('.loading-dots');
      if (dots) dots.remove();
    },
    
    /**
     * Create loading bar
     */
    createLoadingBar() {
      const bar = document.createElement('div');
      bar.className = 'loading-bar';
      bar.style.width = '0%';
      document.body.appendChild(bar);
      
      return {
        element: bar,
        setProgress(percent) {
          bar.style.width = percent + '%';
        },
        complete() {
          bar.style.width = '100%';
          setTimeout(() => {
            bar.style.opacity = '0';
            setTimeout(() => bar.remove(), 300);
          }, 300);
        },
        error() {
          bar.style.background = '#e74c3c';
          setTimeout(() => {
            bar.style.opacity = '0';
            setTimeout(() => bar.remove(), 300);
          }, 1000);
        }
      };
    },
    
    /**
     * Set button loading state
     */
    setButtonLoading(button, loading = true) {
      if (typeof button === 'string') {
        button = document.querySelector(button);
      }
      if (!button) return;
      
      if (loading) {
        button.dataset.originalText = button.textContent;
        button.classList.add('loading');
        button.disabled = true;
      } else {
        button.classList.remove('loading');
        button.disabled = false;
        if (button.dataset.originalText) {
          button.textContent = button.dataset.originalText;
        }
      }
    },
    
    /**
     * Reveal content with stagger
     */
    revealContent(selector, stagger = 100) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('loaded');
        }, index * stagger);
      });
    },
    
    /**
     * Destroy all observers
     */
    destroy() {
      this.observers.forEach(obs => obs.disconnect());
      this.observers = [];
    }
  };
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SkeletonLoader.init());
  } else {
    SkeletonLoader.init();
  }
  
  // Expose to global scope
  window.SkeletonLoader = SkeletonLoader;
  
})();
