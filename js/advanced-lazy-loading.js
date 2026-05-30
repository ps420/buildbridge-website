/**
 * Advanced Lazy Loading - v137.3
 * Blur-up image loading with skeleton states and intersection observer
 * Fortune 500 Performance Optimization
 */

class AdvancedLazyLoading {
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.01,
      blurAmount: options.blurAmount || 20,
      preloadRatio: options.preloadRatio || 0.5,
      enableWebP: options.enableWebP !== false,
      enableAVIF: options.enableAVIF || false,
      placeholderColor: options.placeholderColor || null,
      ...options
    };

    this.observer = null;
    this.imageQueue = [];
    this.concurrentLoads = 0;
    this.maxConcurrentLoads = 3;
    this.loadedImages = new Set();

    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.processExistingImages();
    this.observeMutations();
  }

  setupIntersectionObserver() {
    const imageCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const container = entry.target;
          this.queueImageLoad(container);
          this.observer.unobserve(container);
        }
      });
    };

    this.observer = new IntersectionObserver(imageCallback, {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });
  }

  processExistingImages() {
    // Find all images with data-src or data-lazy attributes
    const lazyImages = document.querySelectorAll([
      'img[data-src]',
      'img[data-lazy]',
      'img[data-srcset]',
      '.lazy-image'
    ].join(', '));

    lazyImages.forEach(img => {
      this.wrapImage(img);
    });
  }

  wrapImage(img) {
    // Skip if already wrapped
    if (img.closest('.lazy-image-container')) return;

    const container = document.createElement('div');
    container.className = 'lazy-image-container';
    
    // Transfer aspect ratio if specified
    if (img.hasAttribute('data-ratio')) {
      container.classList.add(`aspect-${img.getAttribute('data-ratio')}`);
    }

    // Transfer fit mode
    if (img.hasAttribute('data-fit')) {
      container.classList.add(`fit-${img.getAttribute('data-fit')}`);
    }

    // Transfer reveal effect
    if (img.hasAttribute('data-reveal')) {
      container.classList.add(`reveal-${img.getAttribute('data-reveal')}`);
    }

    // Wrap the image
    img.parentNode.insertBefore(container, img);
    container.appendChild(img);

    // Add lazy class
    img.classList.add('lazy-image');

    // Create loading states
    this.createLoadingStates(container, img);

    // Observe for intersection
    this.observer.observe(container);
  }

  createLoadingStates(container, img) {
    const src = img.getAttribute('data-src') || img.getAttribute('data-lazy');
    const lqip = img.getAttribute('data-lqip');
    const dominantColor = img.getAttribute('data-color') || this.options.placeholderColor;
    const showProgress = img.hasAttribute('data-progress');

    // 1. Dominant color placeholder
    if (dominantColor) {
      const placeholder = document.createElement('div');
      placeholder.className = 'lazy-placeholder';
      placeholder.style.backgroundColor = dominantColor;
      container.appendChild(placeholder);
    }

    // 2. LQIP (Low Quality Image Placeholder) - blur up from tiny version
    if (lqip) {
      const lqipEl = document.createElement('div');
      lqipEl.className = 'lazy-lqip';
      lqipEl.style.backgroundImage = `url(${lqip})`;
      container.appendChild(lqipEl);
      container.dataset.hasLqip = 'true';
    }
    // 3. Blur placeholder from data-src with blur params
    else if (src && this.options.blurAmount > 0) {
      // Create blurred version placeholder
      const blurEl = document.createElement('div');
      blurEl.className = 'lazy-image-blur';
      
      // Try to use a tiny placeholder if available
      const tinySrc = img.getAttribute('data-tiny') || this.createTinyPlaceholder(src);
      if (tinySrc) {
        blurEl.style.backgroundImage = `url(${tinySrc})`;
      }
      
      container.appendChild(blurEl);
    }

    // 4. Skeleton loading
    const skeleton = document.createElement('div');
    skeleton.className = 'lazy-skeleton';
    container.appendChild(skeleton);

    // 5. Progress indicator (optional)
    if (showProgress) {
      const progress = document.createElement('div');
      progress.className = 'lazy-progress';
      progress.innerHTML = '<div class="lazy-progress-bar"></div>';
      container.appendChild(progress);
    }

    // 6. Error state
    const errorEl = document.createElement('div');
    errorEl.className = 'lazy-error';
    errorEl.innerHTML = `
      <svg class="lazy-error-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span class="lazy-error-text">Failed to load image</span>
      <button class="lazy-retry-btn">Retry</button>
    `;
    errorEl.querySelector('.lazy-retry-btn').addEventListener('click', () => {
      this.retryLoad(container, img);
    });
    container.appendChild(errorEl);
  }

  createTinyPlaceholder(src) {
    // For external images, we can't create a tiny placeholder on the fly
    // This is where you'd integrate with your image CDN for ?w=20&q=10 type URLs
    return null;
  }

  queueImageLoad(container) {
    if (this.concurrentLoads >= this.maxConcurrentLoads) {
      this.imageQueue.push(container);
      return;
    }

    this.loadImage(container);
  }

  async loadImage(container) {
    this.concurrentLoads++;
    container.classList.add('loading');

    const img = container.querySelector('.lazy-image');
    if (!img) {
      this.concurrentLoads--;
      this.processQueue();
      return;
    }

    const src = img.getAttribute('data-src') || img.getAttribute('data-lazy');
    const srcset = img.getAttribute('data-srcset');
    const sizes = img.getAttribute('data-sizes');

    if (!src && !srcset) {
      this.concurrentLoads--;
      this.processQueue();
      return;
    }

    try {
      await this.preloadImage(src, srcset, sizes, img);
      this.onImageLoaded(container, img);
    } catch (error) {
      this.onImageError(container, img, error);
    } finally {
      this.concurrentLoads--;
      this.processQueue();
    }
  }

  preloadImage(src, srcset, sizes, img) {
    return new Promise((resolve, reject) => {
      const tempImg = new Image();

      tempImg.onload = () => resolve(tempImg);
      tempImg.onerror = () => reject(new Error(`Failed to load: ${src}`));

      // Set srcset first if available (for responsive images)
      if (srcset) {
        tempImg.srcset = srcset;
        if (sizes) tempImg.sizes = sizes;
      }
      
      tempImg.src = src;
    });
  }

  onImageLoaded(container, img) {
    const src = img.getAttribute('data-src') || img.getAttribute('data-lazy');
    const srcset = img.getAttribute('data-srcset');
    const sizes = img.getAttribute('data-sizes');

    // Set the actual image attributes
    if (srcset) {
      img.srcset = srcset;
      if (sizes) img.sizes = sizes;
    }
    img.src = src;

    // Mark as loaded
    img.classList.add('loaded');
    container.classList.remove('loading');
    container.classList.add('loaded');

    // Fade out loading states
    const states = container.querySelectorAll('.lazy-skeleton, .lazy-image-blur, .lazy-lqip, .lazy-placeholder');
    states.forEach(state => state.classList.add('loaded'));

    // Track for analytics
    this.loadedImages.add(src);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('lazyImageLoaded', { 
      detail: { src, container, img } 
    }));

    // Clean up attributes
    img.removeAttribute('data-src');
    img.removeAttribute('data-lazy');
    img.removeAttribute('data-srcset');
  }

  onImageError(container, img, error) {
    console.warn('Lazy image failed to load:', error);
    
    container.classList.remove('loading');
    container.classList.add('error');

    // Dispatch event
    window.dispatchEvent(new CustomEvent('lazyImageError', { 
      detail: { error, container, img } 
    }));
  }

  retryLoad(container, img) {
    container.classList.remove('error');
    container.classList.add('loading');
    this.loadImage(container);
  }

  processQueue() {
    if (this.imageQueue.length > 0 && this.concurrentLoads < this.maxConcurrentLoads) {
      const container = this.imageQueue.shift();
      this.loadImage(container);
    }
  }

  observeMutations() {
    // Watch for dynamically added images
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the node itself is a lazy image
            if (node.matches && node.matches('[data-src], [data-lazy], .lazy-image')) {
              this.wrapImage(node);
            }
            // Check for nested lazy images
            const lazyImages = node.querySelectorAll ? 
              node.querySelectorAll('[data-src], [data-lazy], .lazy-image') : [];
            lazyImages.forEach(img => this.wrapImage(img));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Public API: Preload specific images
  preload(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Public API: Force load all images in a container
  loadAll(container = document) {
    const containers = container.querySelectorAll('.lazy-image-container:not(.loaded):not(.loading)');
    containers.forEach(c => {
      this.observer.unobserve(c);
      this.queueImageLoad(c);
    });
  }

  // Public API: Get loading statistics
  getStats() {
    return {
      loaded: this.loadedImages.size,
      queueLength: this.imageQueue.length,
      loading: this.concurrentLoads
    };
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.lazyLoader = new AdvancedLazyLoading();
  });
} else {
  window.lazyLoader = new AdvancedLazyLoading();
}

// Support for responsive images with srcset
class ResponsiveLazyImage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const src = this.getAttribute('src');
    const srcset = this.getAttribute('srcset');
    const sizes = this.getAttribute('sizes');
    const alt = this.getAttribute('alt') || '';
    const ratio = this.getAttribute('ratio') || '16/9';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .container { 
          position: relative; 
          aspect-ratio: ${ratio};
          overflow: hidden;
          background: #2a2d34;
        }
        img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        img.loaded { opacity: 1; }
        .skeleton {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #2a2d34 25%, rgba(201,206,214,0.1) 50%, #2a2d34 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      </style>
      <div class="container">
        <div class="skeleton"></div>
        <img data-src="${src}" ${srcset ? `data-srcset="${srcset}"` : ''} ${sizes ? `data-sizes="${sizes}"` : ''} alt="${alt}">
      </div>
    `;

    const img = this.shadowRoot.querySelector('img');
    const skeleton = this.shadowRoot.querySelector('.skeleton');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          img.onload = () => {
            img.classList.add('loaded');
            skeleton.style.opacity = '0';
          };
          
          if (srcset) {
            img.srcset = srcset;
            if (sizes) img.sizes = sizes;
          }
          img.src = src;
          
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '50px' });

    observer.observe(this);
  }
}

// Register custom element
customElements.define('lazy-image', ResponsiveLazyImage);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdvancedLazyLoading, ResponsiveLazyImage };
}
