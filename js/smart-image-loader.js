/* ============================================
   v70.0: SMART IMAGE LOADER
   Progressive Loading with Blur-up & LQIP
   ============================================ */

class SmartImageLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.01,
      enableLqip: options.enableLqip !== false,
      enableBlurUp: options.enableBlurUp !== false,
      enableSkeleton: options.enableSkeleton !== false,
      transitionDelay: options.transitionDelay || 100,
      ...options
    };
    
    this.observer = null;
    this.imageCache = new Map();
    this.loadingQueue = [];
    this.maxConcurrent = 3;
    this.currentlyLoading = 0;
    
    this.init();
  }
  
  init() {
    this.createObserver();
    this.processImages();
    this.processBackgroundImages();
  }
  
  createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });
  }
  
  processImages() {
    // Find all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.prepareImage(img);
    });
    
    // Find all images with data-lazy
    document.querySelectorAll('img[data-lazy="true"]').forEach(img => {
      this.prepareImage(img);
    });
  }
  
  prepareImage(img) {
    const container = this.createContainer(img);
    
    // Add skeleton if enabled
    if (this.options.enableSkeleton) {
      this.addSkeleton(container);
    }
    
    // Add LQIP if there's a data-lqip attribute
    if (this.options.enableLqip && img.dataset.lqip) {
      this.addLqip(container, img.dataset.lqip);
    }
    
    // Prepare image
    img.classList.add('blur-up-image');
    if (!img.classList.contains('blur-up-image') && 
        !img.classList.contains('fade-in-image') &&
        !img.classList.contains('zoom-in-image') &&
        !img.classList.contains('slide-up-image')) {
      img.classList.add('blur-up-image');
    }
    
    // Observe
    this.observer.observe(container);
  }
  
  createContainer(img) {
    // Check if already wrapped
    if (img.parentElement?.classList?.contains('lazy-image-container')) {
      return img.parentElement;
    }
    
    const container = document.createElement('div');
    container.className = 'lazy-image-container';
    
    // Transfer aspect ratio if specified
    if (img.dataset.aspect) {
      container.dataset.aspect = img.dataset.aspect;
    }
    
    // Check for natural dimensions
    if (img.width && img.height) {
      const ratio = img.height / img.width;
      if (!container.dataset.aspect) {
        // Set inline aspect ratio
        container.style.aspectRatio = `${img.width} / ${img.height}`;
      }
    }
    
    // Wrap image
    img.parentNode.insertBefore(container, img);
    container.appendChild(img);
    
    // Add loading indicator if it's a large image
    const sizeAttr = img.dataset.size || 'normal';
    if (sizeAttr === 'large' || img.dataset.progress === 'true') {
      this.addLoadingIndicator(container);
    }
    
    return container;
  }
  
  addSkeleton(container) {
    const skeleton = document.createElement('div');
    skeleton.className = 'lazy-image-skeleton';
    container.appendChild(skeleton);
    container.dataset.skeleton = 'true';
  }
  
  addLqip(container, lqipUrl) {
    const lqip = document.createElement('div');
    lqip.className = 'lqip-placeholder';
    lqip.style.backgroundImage = `url(${lqipUrl})`;
    container.appendChild(lqip);
  }
  
  addLoadingIndicator(container) {
    const indicator = document.createElement('div');
    indicator.className = 'image-loading-indicator';
    indicator.innerHTML = '<div class="image-loading-progress"></div>';
    container.appendChild(indicator);
    container.classList.add('loading');
  }
  
  loadImage(container) {
    const img = container.querySelector('img');
    if (!img) return;
    
    const src = img.dataset.src || img.dataset.srcset || img.src;
    if (!src || src === img.src) {
      this.onImageLoaded(container, img);
      return;
    }
    
    // Check cache
    if (this.imageCache.has(src)) {
      this.onImageLoaded(container, img, src);
      return;
    }
    
    // Add to queue
    this.loadingQueue.push({ container, img, src });
    this.processQueue();
  }
  
  processQueue() {
    while (this.currentlyLoading < this.maxConcurrent && this.loadingQueue.length > 0) {
      const { container, img, src } = this.loadingQueue.shift();
      this.loadImageSrc(container, img, src);
    }
  }
  
  loadImageSrc(container, img, src) {
    this.currentlyLoading++;
    
    const tempImg = new Image();
    const startTime = performance.now();
    
    tempImg.onload = () => {
      this.currentlyLoading--;
      this.imageCache.set(src, true);
      this.onImageLoaded(container, img, src, startTime);
      this.processQueue();
    };
    
    tempImg.onerror = () => {
      this.currentlyLoading--;
      this.onImageError(container, img);
      this.processQueue();
    };
    
    tempImg.src = src;
  }
  
  onImageLoaded(container, img, src, startTime) {
    // Update src if provided
    if (src && img.src !== src) {
      img.src = src;
    }
    
    // Remove data attributes
    img.removeAttribute('data-src');
    img.removeAttribute('data-lqip');
    img.removeAttribute('data-lazy');
    
    // Wait for actual load event on the DOM element
    if (!img.complete) {
      img.addEventListener('load', () => this.revealImage(container, img), { once: true });
    } else {
      this.revealImage(container, img);
    }
  }
  
  revealImage(container, img) {
    // Small delay for smoother transition
    setTimeout(() => {
      // Remove skeleton
      const skeleton = container.querySelector('.lazy-image-skeleton');
      if (skeleton) {
        skeleton.style.opacity = '0';
        setTimeout(() => skeleton.remove(), 300);
      }
      
      // Remove loading state
      container.classList.remove('loading');
      
      // Trigger image transition
      img.classList.add('loaded');
      
      // Add loaded class to container
      container.classList.add('loaded');
      
      // Dispatch event
      container.dispatchEvent(new CustomEvent('imageLoaded', { 
        detail: { img, container } 
      }));
      
      // Check for caption fade-in
      const caption = container.querySelector('.lazy-image-caption');
      if (caption) {
        caption.style.transform = 'translateY(0)';
      }
    }, this.options.transitionDelay);
  }
  
  onImageError(container, img) {
    container.classList.remove('loading');
    
    // Check for existing error state
    let errorEl = container.querySelector('.lazy-image-error');
    
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'lazy-image-error';
      errorEl.innerHTML = `
        <div class="lazy-image-error-icon">⚠️</div>
        <div class="lazy-image-error-text">Failed to load image</div>
        <button class="lazy-image-error-retry">Retry</button>
      `;
      container.appendChild(errorEl);
      
      // Retry button
      errorEl.querySelector('.lazy-image-error-retry').addEventListener('click', () => {
        errorEl.classList.remove('visible');
        const src = img.dataset.src;
        if (src) {
          this.loadImageSrc(container, img, src);
        }
      });
    }
    
    errorEl.classList.add('visible');
    
    // Remove skeleton
    const skeleton = container.querySelector('.lazy-image-skeleton');
    if (skeleton) skeleton.remove();
  }
  
  // ============================================
  // BACKGROUND IMAGE LOADING
  // ============================================
  processBackgroundImages() {
    document.querySelectorAll('[data-bg-src]').forEach(el => {
      this.prepareBackgroundImage(el);
    });
  }
  
  prepareBackgroundImage(el) {
    el.classList.add('lazy-bg');
    this.observer.observe(el);
  }
  
  loadBackgroundImage(el) {
    const src = el.dataset.bgSrc;
    if (!src) return;
    
    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage = `url(${src})`;
      el.classList.add('loaded');
      el.removeAttribute('data-bg-src');
    };
    img.src = src;
  }
  
  // ============================================
  // PREFETCH IMAGES
  // ============================================
  prefetchImages(selectors) {
    const images = document.querySelectorAll(selectors);
    images.forEach(img => {
      const src = img.dataset.src;
      if (src && !this.imageCache.has(src)) {
        const prefetchImg = new Image();
        prefetchImg.src = src;
        this.imageCache.set(src, true);
      }
    });
  }
  
  // ============================================
  // REFRESH OBSERVER
  // ============================================
  refresh() {
    this.processImages();
    this.processBackgroundImages();
  }
  
  // ============================================
  // DESTROY
  // ============================================
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.imageCache.clear();
  }
}

// ============================================
// PICTURE ELEMENT LAZY LOADING
// ============================================
class PictureLazyLoader {
  constructor() {
    this.init();
  }
  
  init() {
    document.querySelectorAll('picture[data-lazy]').forEach(picture => {
      const sources = picture.querySelectorAll('source[data-srcset]');
      const img = picture.querySelector('img[data-src]');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Load sources
            sources.forEach(source => {
              source.srcset = source.dataset.srcset;
              source.removeAttribute('data-srcset');
            });
            
            // Load image
            if (img && img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '50px' });
      
      observer.observe(picture);
    });
  }
}

// ============================================
// NATIVE LAZY LOADING FALLBACK
// ============================================
class NativeLazyLoader {
  constructor() {
    this.supportsNativeLazy = 'loading' in HTMLImageElement.prototype;
    this.init();
  }
  
  init() {
    if (this.supportsNativeLazy) {
      // Use native lazy loading for supported browsers
      document.querySelectorAll('img[data-lazy="native"]').forEach(img => {
        img.loading = 'lazy';
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
      });
    }
  }
}

// ============================================
// AUTO-INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize smart image loader
  window.smartImageLoader = new SmartImageLoader({
    rootMargin: '100px',
    threshold: 0.01,
    enableLqip: true,
    enableBlurUp: true,
    enableSkeleton: true
  });
  
  // Initialize picture lazy loader
  window.pictureLazyLoader = new PictureLazyLoader();
  
  // Initialize native lazy loader
  window.nativeLazyLoader = new NativeLazyLoader();
  
  // Expose global refresh function
  window.refreshLazyImages = () => {
    window.smartImageLoader.refresh();
  };
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SmartImageLoader,
    PictureLazyLoader,
    NativeLazyLoader
  };
}
