/**
 * v59.0: Smart Progressive Image Loading System
 * Fortune 500 Quality Image Loading with Blur-Up Effect
 * Features: Intersection Observer lazy loading, skeleton placeholders, smooth transitions
 */

class ProgressiveImageLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px 0px',
      threshold: 0.01,
      enableSkeleton: true,
      enableBlurUp: true,
      enableParallax: false,
      ...options
    };
    
    this.imageObserver = null;
    this.loadedImages = new Set();
    this.init();
  }
  
  init() {
    // Check for IntersectionObserver support
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: this.options.rootMargin,
          threshold: this.options.threshold
        }
      );
    }
    
    // Process all progressive images
    this.processImages();
    
    // Listen for dynamically added images
    this.observeDOM();
    
    console.log('🖼️ Progressive Image Loader initialized');
  }
  
  processImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => this.setupImage(img));
  }
  
  setupImage(img) {
    // Skip if already processed
    if (img.dataset.progressiveProcessed) return;
    img.dataset.progressiveProcessed = 'true';
    
    // Create container if not already wrapped
    let container = img.parentElement;
    if (!container.classList.contains('progressive-image-container')) {
      container = document.createElement('div');
      container.className = 'progressive-image-container';
      if (img.classList.contains('progressive-aspect-16-9')) {
        container.classList.add('progressive-aspect-16-9');
      } else if (img.classList.contains('progressive-aspect-4-3')) {
        container.classList.add('progressive-aspect-4-3');
      } else if (img.classList.contains('progressive-aspect-1-1')) {
        container.classList.add('progressive-aspect-1-1');
      }
      
      // Insert container and move image into it
      img.parentNode.insertBefore(container, img);
      container.appendChild(img);
    }
    
    // Add skeleton loading
    if (this.options.enableSkeleton) {
      const skeleton = document.createElement('div');
      skeleton.className = 'progressive-skeleton';
      container.appendChild(skeleton);
    }
    
    // Create placeholder if blur-up is enabled
    if (this.options.enableBlurUp && img.dataset.placeholder) {
      const placeholder = document.createElement('img');
      placeholder.className = 'progressive-image-placeholder';
      placeholder.src = img.dataset.placeholder;
      placeholder.alt = '';
      placeholder.setAttribute('aria-hidden', 'true');
      container.insertBefore(placeholder, img);
    }
    
    // Add loading spinner
    const loader = document.createElement('div');
    loader.className = 'progressive-loader';
    container.appendChild(loader);
    
    // Style the main image
    img.classList.add('progressive-image');
    img.removeAttribute('src'); // Remove empty src
    
    // Add reveal animation class based on data attribute
    if (img.dataset.reveal) {
      img.classList.add(`progressive-reveal-${img.dataset.reveal}`);
    }
    
    // Add fade animation
    if (img.dataset.fade) {
      img.classList.add(`progressive-fade-${img.dataset.fade}`);
    }
    
    // Observe for intersection
    if (this.imageObserver) {
      this.imageObserver.observe(img);
    } else {
      // Fallback: load immediately
      this.loadImage(img);
    }
    
    // Error handling
    img.addEventListener('error', () => this.handleError(img));
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        this.loadImage(img);
        this.imageObserver.unobserve(img);
      }
    });
  }
  
  loadImage(img) {
    const src = img.dataset.src;
    if (!src || this.loadedImages.has(src)) return;
    
    const container = img.closest('.progressive-image-container');
    const loader = container?.querySelector('.progressive-loader');
    
    // Create a new image to preload
    const preloadImg = new Image();
    
    preloadImg.onload = () => {
      // Set the actual src
      img.src = src;
      img.dataset.loading = 'false';
      this.loadedImages.add(src);
      
      // Trigger animations
      requestAnimationFrame(() => {
        // Hide loader
        if (loader) {
          loader.classList.add('hidden');
        }
        
        // Add loaded class to trigger CSS transitions
        img.classList.add('loaded');
        
        // Fade out placeholder
        const placeholder = container?.querySelector('.progressive-image-placeholder');
        if (placeholder) {
          placeholder.classList.add('loaded');
        }
        
        // Remove skeleton
        const skeleton = container?.querySelector('.progressive-skeleton');
        if (skeleton) {
          skeleton.style.opacity = '0';
          setTimeout(() => skeleton.remove(), 300);
        }
        
        // Dispatch custom event
        img.dispatchEvent(new CustomEvent('imageLoaded', {
          detail: { src, container }
        }));
      });
      
      // Apply parallax if enabled
      if (this.options.enableParallax && img.dataset.parallax) {
        this.applyParallax(img);
      }
    };
    
    preloadImg.onerror = () => this.handleError(img);
    
    // Start loading
    img.dataset.loading = 'true';
    preloadImg.src = src;
  }
  
  handleError(img) {
    const container = img.closest('.progressive-image-container');
    
    // Create error overlay
    let errorOverlay = container?.querySelector('.progressive-error');
    if (!errorOverlay) {
      errorOverlay = document.createElement('div');
      errorOverlay.className = 'progressive-error';
      errorOverlay.innerHTML = `
        <div class="progressive-error-icon">⚠️</div>
        <div class="progressive-error-text">Failed to load image</div>
      `;
      container?.appendChild(errorOverlay);
    }
    
    errorOverlay.classList.add('show');
    
    // Hide loader
    const loader = container?.querySelector('.progressive-loader');
    if (loader) loader.classList.add('hidden');
    
    console.warn('Failed to load progressive image:', img.dataset.src);
  }
  
  applyParallax(img) {
    const speed = parseFloat(img.dataset.parallax) || 0.5;
    
    const handleScroll = () => {
      const rect = img.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = scrolled * speed;
      
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        img.style.transform = `translateY(${rate}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  
  observeDOM() {
    // Watch for new images added to DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Check if the node itself is an image
            if (node.matches && node.matches('img[data-src]')) {
              this.setupImage(node);
            }
            // Check for images within the node
            const images = node.querySelectorAll?.('img[data-src]');
            if (images) {
              images.forEach(img => this.setupImage(img));
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Public API: Refresh and process new images
  refresh() {
    this.processImages();
  }
  
  // Public API: Load all images immediately
  loadAll() {
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.loadImage(img);
    });
  }
  
  // Public API: Preload specific images
  preload(src) {
    const img = new Image();
    img.src = src;
    return new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
  }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.progressiveImageLoader = new ProgressiveImageLoader();
  });
} else {
  window.progressiveImageLoader = new ProgressiveImageLoader();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgressiveImageLoader;
}
