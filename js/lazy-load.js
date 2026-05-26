/**
 * Lazy Loading with Skeleton Screens
 * Progressive image loading for optimal UX
 */

(function() {
  'use strict';

  const config = {
    rootMargin: '100px 0px',
    threshold: 0.01,
    fadeDuration: 500,
    enableLQIP: true,
    placeholderColor: 'rgba(201, 206, 214, 0.05)'
  };

  let imageObserver;
  let skeletonObserver;

  // Initialize
  function init() {
    // Check for IntersectionObserver support
    if (!('IntersectionObserver' in window)) {
      loadAllImages();
      return;
    }

    createObservers();
    processImages();
    processSkeletons();
    initProgressiveImages();
  }

  // Create intersection observers
  function createObservers() {
    // Image observer
    imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadImage(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: config.rootMargin,
      threshold: config.threshold
    });

    // Skeleton observer for cards
    skeletonObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          skeletonObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
  }

  // Process all lazy images
  function processImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    images.forEach(img => {
      // Wrap in skeleton container if not already wrapped
      if (!img.closest('.skeleton-wrapper')) {
        wrapImage(img);
      }
      
      imageObserver.observe(img);
    });
  }

  // Wrap image in skeleton container
  function wrapImage(img) {
    const wrapper = document.createElement('div');
    wrapper.className = 'skeleton-wrapper';
    wrapper.style.aspectRatio = img.width && img.height 
      ? `${img.width} / ${img.height}` 
      : 'auto';

    // Add loading spinner
    const loader = document.createElement('div');
    loader.className = 'image-loader';
    wrapper.appendChild(loader);

    // Wrap the image
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    // Add lazy-image class
    img.classList.add('lazy-image');
  }

  // Load an image
  function loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    const wrapper = img.closest('.skeleton-wrapper');

    if (!src) return;

    // Create new image to preload
    const preloadImg = new Image();
    
    preloadImg.onload = () => {
      // Update actual image
      img.src = src;
      if (srcset) img.srcset = srcset;
      
      // Remove data attributes
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
      
      // Trigger load animation
      requestAnimationFrame(() => {
        img.classList.add('loaded');
        if (wrapper) {
          wrapper.classList.add('loaded', 'loading');
          
          // Remove loader after fade
          setTimeout(() => {
            wrapper.classList.remove('loading');
          }, config.fadeDuration);
        }
      });

      // Dispatch event
      img.dispatchEvent(new CustomEvent('lazyloaded', { detail: { src } }));
    };

    preloadImg.onerror = () => {
      img.classList.add('error');
      if (wrapper) {
        wrapper.classList.add('error');
        wrapper.style.background = 'rgba(255, 0, 0, 0.05)';
      }
    };

    preloadImg.src = src;
  }

  // Process skeleton elements
  function processSkeletons() {
    const skeletons = document.querySelectorAll('.skeleton-card, [data-skeleton]');
    skeletons.forEach(el => skeletonObserver.observe(el));
  }

  // Initialize progressive image loading
  function initProgressiveImages() {
    const progressiveImages = document.querySelectorAll('.progressive-image, [data-progressive]');
    
    progressiveImages.forEach(container => {
      const preview = container.querySelector('.preview, [data-preview]');
      const full = container.querySelector('.full, [data-full]');
      
      if (!preview || !full) return;

      // Load full image
      const fullSrc = full.dataset.src;
      if (fullSrc) {
        const img = new Image();
        img.onload = () => {
          full.src = fullSrc;
          container.classList.add('loaded');
        };
        img.src = fullSrc;
      }
    });
  }

  // Create skeleton for dynamic content
  window.SkeletonLoader = {
    // Create card skeleton
    createCard: function(count = 1) {
      let html = '';
      for (let i = 0; i < count; i++) {
        html += `
          <div class="skeleton-card">
            <div class="skeleton-card-image"></div>
            <div class="skeleton-card-content">
              <div class="skeleton-card-title"></div>
              <div class="skeleton-card-text"></div>
              <div class="skeleton-card-text short"></div>
            </div>
          </div>
        `;
      }
      return html;
    },

    // Create text skeleton
    createText: function(lines = 3) {
      let html = '';
      for (let i = 0; i < lines; i++) {
        const width = i === 0 ? '70%' : i === lines - 1 ? '40%' : '90%';
        html += `<div class="skeleton-text" style="width: ${width}; margin-bottom: 8px;"></div>`;
      }
      return html;
    },

    // Create avatar skeleton
    createAvatar: function(size = 'medium') {
      const sizeClass = size === 'large' ? 'large' : size === 'small' ? 'small' : '';
      return `<div class="skeleton-avatar ${sizeClass}"></div>`;
    },

    // Replace skeleton with content
    replace: function(skeletonEl, contentHTML, delay = 300) {
      skeletonEl.style.opacity = '1';
      skeletonEl.style.transition = 'opacity 0.3s ease';
      
      setTimeout(() => {
        skeletonEl.style.opacity = '0';
        
        setTimeout(() => {
          skeletonEl.innerHTML = contentHTML;
          skeletonEl.classList.remove('skeleton-card');
          skeletonEl.style.opacity = '1';
        }, 300);
      }, delay);
    }
  };

  // Fallback for browsers without IntersectionObserver
  function loadAllImages() {
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
      img.classList.add('loaded');
    });
  }

  // Refresh observer after dynamic content changes
  window.refreshLazyLoad = function() {
    if (imageObserver) {
      processImages();
    }
  };

  // Utility: Check if images are in viewport on load
  function checkVisibleImages() {
    const images = document.querySelectorAll('img[data-src]');
    const viewportHeight = window.innerHeight;
    
    images.forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.top < viewportHeight && rect.bottom > 0) {
        loadImage(img);
        if (imageObserver) {
          imageObserver.unobserve(img);
        }
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also check on load for any missed images
  window.addEventListener('load', checkVisibleImages);

  // Listen for page transitions (if using page-transitions.js)
  window.addEventListener('pagechange', () => {
    setTimeout(processImages, 100);
  });

})();
