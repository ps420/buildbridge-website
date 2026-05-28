/**
 * PROGRESSIVE BLUR IMAGE LOADING v55.0
 * Modern Image Loading Pattern with LQIP Support
 */

(function() {
  'use strict';

  const config = {
    rootMargin: '50px 0px',
    threshold: 0.01,
    blurAmount: 20,
    transitionDuration: 500
  };

  const imageCache = new Map();
  const observerCallbacks = new Map();

  /**
   * Initialize progressive image loading
   */
  function init() {
    // Create intersection observer
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: config.rootMargin,
      threshold: config.threshold
    });

    // Process existing images
    document.querySelectorAll('[data-lazy-src], .progressive-image, .lqip-container').forEach(img => {
      observer.observe(img);
    });

    // Watch for new images
    observeNewImages(observer);

    // Preload critical images
    preloadCriticalImages();
  }

  /**
   * Handle intersection events
   */
  function handleIntersection(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        loadImage(element);
        observer.unobserve(element);
      }
    });
  }

  /**
   * Load an image progressively
   */
  function loadImage(element) {
    // Handle different element types
    if (element.classList.contains('lqip-container')) {
      loadLQIPImage(element);
    } else if (element.classList.contains('progressive-image')) {
      loadProgressiveImage(element);
    } else if (element.hasAttribute('data-lazy-src')) {
      loadLazyImage(element);
    }
  }

  /**
   * Load LQIP (Low Quality Image Placeholder) pattern
   */
  function loadLQIPImage(container) {
    const mainImg = container.querySelector('.lqip-main');
    if (!mainImg) return;

    const src = mainImg.dataset.src || mainImg.src;
    
    // Check cache
    if (imageCache.has(src)) {
      applyLoadedState(container, mainImg, imageCache.get(src));
      return;
    }

    // Load high-res image
    const img = new Image();
    
    img.onload = () => {
      imageCache.set(src, img);
      applyLoadedState(container, mainImg, img);
    };
    
    img.onerror = () => {
      container.classList.add('error');
    };
    
    img.src = src;
  }

  /**
   * Apply loaded state to LQIP container
   */
  function applyLoadedState(container, imgElement, loadedImg) {
    // Update src if needed
    if (imgElement.dataset.src) {
      imgElement.src = imgElement.dataset.src;
    }
    
    // Trigger transition
    requestAnimationFrame(() => {
      container.classList.add('loaded');
      
      // Dispatch event
      container.dispatchEvent(new CustomEvent('imageLoaded', {
        detail: { image: loadedImg }
      }));
    });
  }

  /**
   * Load progressive blur image
   */
  function loadProgressiveImage(container) {
    const img = container.querySelector('img');
    if (!img) return;

    const src = img.dataset.src || img.src;
    
    // Create tiny placeholder if not exists
    if (!container.querySelector('.img-placeholder')) {
      createPlaceholder(container, src);
    }

    container.classList.add('loading');

    // Check cache
    if (imageCache.has(src)) {
      finalizeProgressiveLoad(container, img);
      return;
    }

    // Load image
    const loaderImg = new Image();
    
    loaderImg.onload = () => {
      imageCache.set(src, loaderImg);
      finalizeProgressiveLoad(container, img);
    };
    
    loaderImg.src = src;
  }

  /**
   * Create blurred placeholder
   */
  function createPlaceholder(container, src) {
    // Try to get tiny version or generate from canvas
    const placeholder = document.createElement('div');
    placeholder.className = 'img-placeholder';
    
    // Use canvas to create blur preview
    generateBlurPreview(src, placeholder);
    
    container.insertBefore(placeholder, container.firstChild);
  }

  /**
   * Generate blur preview using canvas
   */
  function generateBlurPreview(src, placeholder) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Create tiny thumbnail
      canvas.width = 40;
      canvas.height = Math.round(40 * (img.height / img.width));
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get average color for fallback
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const dominantColor = getDominantColor(imageData.data);
        placeholder.style.backgroundColor = dominantColor;
      } catch (e) {
        // CORS issue, use default
      }
      
      // Set as background
      placeholder.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg', 0.1)})`;
    };
    
    img.src = src;
  }

  /**
   * Get dominant color from image data
   */
  function getDominantColor(data) {
    let r = 0, g = 0, b = 0;
    const count = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    
    return `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`;
  }

  /**
   * Finalize progressive load
   */
  function finalizeProgressiveLoad(container, img) {
    container.classList.remove('loading');
    container.classList.add('loaded');
    
    if (img.dataset.src) {
      img.src = img.dataset.src;
    }

    // Dispatch event
    container.dispatchEvent(new CustomEvent('imageLoaded'));
  }

  /**
   * Load simple lazy image
   */
  function loadLazyImage(img) {
    const src = img.dataset.lazySrc;
    if (!src) return;

    img.classList.add('loading');

    const loader = new Image();
    
    loader.onload = () => {
      img.src = src;
      img.classList.remove('loading');
      img.classList.add('loaded');
      img.removeAttribute('data-lazy-src');
      
      // Apply blur transition if requested
      if (img.classList.contains('lazy-blur')) {
        img.style.filter = 'blur(0)';
      }
    };
    
    loader.src = src;
  }

  /**
   * Watch for new images added to DOM
   */
  function observeNewImages(observer) {
    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element
            const images = node.matches?.('[data-lazy-src], .progressive-image, .lqip-container') 
              ? [node] 
              : node.querySelectorAll?.('[data-lazy-src], .progressive-image, .lqip-container') || [];
            
            images.forEach(img => observer.observe(img));
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Preload critical images
   */
  function preloadCriticalImages() {
    const criticalImages = document.querySelectorAll('[data-priority="high"]');
    
    criticalImages.forEach(img => {
      const src = img.dataset.src || img.dataset.lazySrc;
      if (src) {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = src;
        document.head.appendChild(preloadLink);
        
        // Also start loading
        loadImage(img);
      }
    });
  }

  /**
   * Force load all images (for print, etc)
   */
  function loadAllImages() {
    document.querySelectorAll('[data-lazy-src], .progressive-image:not(.loaded), .lqip-container:not(.loaded)').forEach(loadImage);
  }

  /**
   * Create LQIP container programmatically
   */
  function createLQIPContainer(src, lqipSrc, options = {}) {
    const container = document.createElement('div');
    container.className = `lqip-container ${options.className || ''}`;
    container.style.aspectRatio = options.aspectRatio || '16/9';
    
    container.innerHTML = `
      <div class="lqip-blur" style="background-image: url(${lqipSrc})"></div>
      <img class="lqip-main" data-src="${src}" alt="${options.alt || ''}" loading="lazy">
    `;
    
    return container;
  }

  /**
   * Batch preload images
   */
  function preloadImages(srcs) {
    srcs.forEach(src => {
      if (!imageCache.has(src)) {
        const img = new Image();
        img.src = src;
        imageCache.set(src, img);
      }
    });
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.ProgressiveImageLoader = {
    loadImage,
    loadAllImages,
    createLQIPContainer,
    preloadImages,
    cache: imageCache
  };

})();
