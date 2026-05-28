/**
 * v58.0: Smart Image Loader
 * Fortune 500 - Progressive image loading with blur-up and intersection observer
 */

class SmartImageLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px 0px',
      threshold: 0.01,
      blurAmount: 20,
      transitionDuration: 500,
      enableBlurUp: true,
      enableSkeleton: true,
      preloadBuffer: 2,
      ...options
    };
    
    this.observer = null;
    this.imageQueue = [];
    this.loadedImages = new Set();
    this.isWebPSupported = false;
    
    this.init();
  }
  
  async init() {
    await this.checkWebPSupport();
    this.setupObserver();
    this.findImages();
    this.bindEvents();
    
    console.log('🖼️ SmartImageLoader v58.0 initialized');
  }
  
  async checkWebPSupport() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = () => {
        this.isWebPSupported = true;
        document.body.classList.add('webp-support');
        resolve(true);
      };
      webP.onerror = () => {
        document.body.classList.add('no-webp-support');
        resolve(false);
      };
      webP.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    });
  }
  
  setupObserver() {
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    );
  }
  
  findImages() {
    // Find all lazy images
    const lazyImages = document.querySelectorAll('[data-lazy], [data-src]');
    
    lazyImages.forEach(img => {
      // Skip already processed
      if (img.dataset.smartImage) return;
      
      img.dataset.smartImage = 'true';
      
      // Create wrapper if needed
      if (!img.parentElement.classList.contains('smart-image-container')) {
        this.wrapImage(img);
      }
      
      this.observer.observe(img);
    });
    
    // Find progressive images
    const progressiveImages = document.querySelectorAll('.progressive-image');
    progressiveImages.forEach(container => {
      this.setupProgressiveImage(container);
    });
  }
  
  wrapImage(img) {
    const wrapper = document.createElement('div');
    wrapper.className = 'smart-image-container';
    
    if (this.options.enableSkeleton) {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-loader';
      wrapper.appendChild(skeleton);
    }
    
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
  }
  
  setupProgressiveImage(container) {
    const fullImg = container.querySelector('.full');
    if (!fullImg) return;
    
    const hqSrc = fullImg.dataset.src || fullImg.src;
    
    // Load high quality image
    this.loadImage(hqSrc).then(() => {
      if (fullImg.tagName === 'IMG') {
        fullImg.src = hqSrc;
      }
      container.classList.add('loaded');
    });
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImageElement(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }
  
  async loadImageElement(img) {
    const src = img.dataset.src || img.dataset.lazy;
    const srcset = img.dataset.srcset;
    const sizes = img.dataset.sizes;
    
    if (!src) return;
    
    try {
      // Add loading class
      img.classList.add('image-loading');
      
      // Blur-up effect
      if (this.options.enableBlurUp && img.dataset.lqip) {
        await this.loadWithBlurUp(img, src);
      } else {
        await this.loadImage(src);
        img.src = src;
      }
      
      // Set srcset if available
      if (srcset) {
        img.srcset = srcset;
      }
      
      if (sizes) {
        img.sizes = sizes;
      }
      
      // Mark as loaded
      img.classList.add('loaded', 'lazy-loaded');
      img.classList.remove('image-loading');
      this.loadedImages.add(img);
      
      // Remove wrapper skeleton
      const container = img.closest('.smart-image-container');
      if (container) {
        const skeleton = container.querySelector('.skeleton-loader');
        if (skeleton) {
          skeleton.style.opacity = '0';
          setTimeout(() => skeleton.remove(), 300);
        }
      }
      
      // Trigger event
      img.dispatchEvent(new CustomEvent('imageLoaded', { detail: { img, src } }));
      
    } catch (error) {
      console.warn('Failed to load image:', src, error);
      img.classList.add('image-error');
    }
  }
  
  async loadWithBlurUp(img, src) {
    const lqip = img.dataset.lqip;
    
    // Create dual-layer setup
    const wrapper = img.closest('.smart-image-container') || img.parentElement;
    wrapper.classList.add('smart-image');
    
    // Set LQIP as background/preview
    const preview = document.createElement('div');
    preview.className = 'lqip';
    preview.style.backgroundImage = `url(${lqip})`;
    preview.style.backgroundSize = 'cover';
    preview.style.backgroundPosition = 'center';
    
    // Prepare high quality image
    img.classList.add('hq-image');
    
    wrapper.insertBefore(preview, img);
    
    // Load high quality
    await this.loadImage(src);
    img.src = src;
    
    // Trigger transition
    requestAnimationFrame(() => {
      wrapper.classList.add('loaded');
    });
  }
  
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = reject;
      
      // Handle cached images
      if (img.complete) {
        resolve(img);
      } else {
        img.src = src;
      }
    });
  }
  
  bindEvents() {
    // Refresh on dynamic content
    const observer = new MutationObserver(() => {
      this.findImages();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Handle window resize for art direction
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.handleResize();
      }, 250);
    }, { passive: true });
  }
  
  handleResize() {
    // Update srcset/sizes if needed
    const responsiveImages = document.querySelectorAll('[data-sizes="auto"]');
    responsiveImages.forEach(img => {
      img.sizes = Math.ceil(img.getBoundingClientRect().width) + 'px';
    });
  }
  
  // Public API
  refresh() {
    this.findImages();
  }
  
  preload(urls) {
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }
  
  getLoadedCount() {
    return this.loadedImages.size;
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Gallery Progressive Loader
class GalleryLoader {
  constructor(selector = '.gallery-grid, .masonry-grid') {
    this.containers = document.querySelectorAll(selector);
    this.init();
  }
  
  init() {
    this.containers.forEach(container => {
      const items = container.querySelectorAll('.gallery-item, .masonry-item');
      
      items.forEach((item, index) => {
        item.style.transitionDelay = `${index * 100}ms`;
        
        const img = item.querySelector('img');
        if (img) {
          img.addEventListener('load', () => {
            img.classList.add('loaded');
            item.classList.add('loaded');
          });
          
          // Trigger load if cached
          if (img.complete) {
            img.classList.add('loaded');
            item.classList.add('loaded');
          }
        }
      });
    });
  }
}

// LQIP Generator (for build-time use)
class LQIPGenerator {
  static async generate(src, options = {}) {
    const { width = 20, blur = 20 } = options;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = width;
        canvas.height = (img.height / img.width) * width;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.1));
      };
      
      img.src = src;
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.smartImageLoader = new SmartImageLoader({
    rootMargin: '100px 0px',
    enableBlurUp: true,
    enableSkeleton: true
  });
  
  window.galleryLoader = new GalleryLoader();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    SmartImageLoader, 
    GalleryLoader, 
    LQIPGenerator 
  };
}
