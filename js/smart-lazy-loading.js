/**
 * v47.0: SMART LAZY LOADING SYSTEM - Fortune 500 Professional
 * Advanced lazy loading with Intersection Observer, blur-up effect, and progress tracking
 */

class SmartLazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.01,
      enableBlurUp: options.enableBlurUp !== false,
      enableProgress: options.enableProgress || false,
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
    this.setupIntersectionObserver();
    this.processExistingElements();
    this.observeMutations();
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    );
  }

  processExistingElements() {
    // Images
    document.querySelectorAll('img[data-src]:not([data-lazy-processed])').forEach(img => {
      this.prepareImage(img);
    });

    // Videos
    document.querySelectorAll('video[data-src]:not([data-lazy-processed])').forEach(video => {
      this.prepareVideo(video);
    });

    // Iframes
    document.querySelectorAll('iframe[data-src]:not([data-lazy-processed])').forEach(iframe => {
      this.prepareIframe(iframe);
    });

    // Background images
    document.querySelectorAll('[data-bg-src]:not([data-lazy-processed])').forEach(el => {
      this.prepareBackgroundImage(el);
    });
  }

  prepareImage(img) {
    const container = img.closest('.lazy-image-container') || this.createImageContainer(img);
    img.setAttribute('data-lazy-processed', 'true');
    
    // Create skeleton loader
    if (!container.querySelector('.skeleton-loader')) {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-loader';
      container.appendChild(skeleton);
    }

    // Set up blur-up placeholder if data-placeholder exists
    const placeholderUrl = img.getAttribute('data-placeholder');
    if (placeholderUrl && this.options.enableBlurUp) {
      this.createBlurPlaceholder(container, placeholderUrl);
    }

    // Add progress bar if enabled
    if (this.options.enableProgress) {
      this.createProgressBar(container, img);
    }

    this.observer.observe(container);
  }

  createImageContainer(img) {
    const container = document.createElement('div');
    container.className = 'lazy-image-container';
    container.style.aspectRatio = img.getAttribute('data-aspect-ratio') || '16/9';
    
    img.parentNode.insertBefore(container, img);
    container.appendChild(img);
    img.classList.add('lazy-image');
    
    return container;
  }

  createBlurPlaceholder(container, url) {
    const placeholder = document.createElement('img');
    placeholder.className = 'lazy-placeholder';
    placeholder.src = url;
    placeholder.alt = '';
    container.insertBefore(placeholder, container.firstChild);
  }

  createProgressBar(container, img) {
    const progress = document.createElement('div');
    progress.className = 'lazy-progress';
    container.appendChild(progress);
    
    // Track loading progress
    if (img.src) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', img.src, true);
      xhr.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100;
          progress.style.width = `${percent}%`;
        }
      };
      xhr.onload = () => {
        progress.style.width = '100%';
        setTimeout(() => progress.remove(), 300);
      };
      xhr.send();
    }
  }

  prepareVideo(video) {
    const container = video.closest('.lazy-video-container') || this.createVideoContainer(video);
    video.setAttribute('data-lazy-processed', 'true');
    this.observer.observe(container);
  }

  createVideoContainer(video) {
    const container = document.createElement('div');
    container.className = 'lazy-video-container';
    container.style.aspectRatio = video.getAttribute('data-aspect-ratio') || '16/9';
    
    // Create poster if exists
    const posterUrl = video.getAttribute('data-poster');
    if (posterUrl) {
      const poster = document.createElement('img');
      poster.className = 'video-poster';
      poster.src = posterUrl;
      poster.alt = 'Video thumbnail';
      container.appendChild(poster);
    }

    // Create play overlay
    const playOverlay = document.createElement('div');
    playOverlay.className = 'video-play-overlay';
    playOverlay.innerHTML = `
      <div class="video-play-button">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
    `;
    playOverlay.addEventListener('click', () => {
      video.play();
      container.classList.add('playing');
    });
    container.appendChild(playOverlay);
    
    video.parentNode.insertBefore(container, video);
    container.appendChild(video);
    
    return container;
  }

  prepareIframe(iframe) {
    const container = iframe.closest('.lazy-iframe-container') || this.createIframeContainer(iframe);
    iframe.setAttribute('data-lazy-processed', 'true');
    this.observer.observe(container);
  }

  createIframeContainer(iframe) {
    const container = document.createElement('div');
    container.className = 'lazy-iframe-container';
    container.style.aspectRatio = iframe.getAttribute('data-aspect-ratio') || '16/9';
    
    // Create placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'iframe-placeholder';
    placeholder.innerHTML = `
      <div class="iframe-placeholder-icon">
        ${iframe.getAttribute('data-icon') || '🌐'}
      </div>
      <div class="iframe-placeholder-text">
        ${iframe.getAttribute('data-placeholder-text') || 'Click to load external content'}
      </div>
    `;
    placeholder.addEventListener('click', () => {
      this.loadIframe(iframe, container);
    });
    
    container.appendChild(placeholder);
    iframe.parentNode.insertBefore(container, iframe);
    container.appendChild(iframe);
    
    return container;
  }

  prepareBackgroundImage(el) {
    el.setAttribute('data-lazy-processed', 'true');
    el.classList.add('lazy-bg-container');
    this.observer.observe(el);
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        this.queueForLoading(element);
        this.observer.unobserve(element);
      }
    });
  }

  queueForLoading(element) {
    this.loadingQueue.push(element);
    this.processQueue();
  }

  processQueue() {
    while (this.currentlyLoading < this.maxConcurrent && this.loadingQueue.length > 0) {
      const element = this.loadingQueue.shift();
      this.loadElement(element);
    }
  }

  loadElement(element) {
    this.currentlyLoading++;
    
    if (element.classList.contains('lazy-image-container')) {
      this.loadImage(element);
    } else if (element.classList.contains('lazy-video-container')) {
      this.loadVideo(element);
    } else if (element.classList.contains('lazy-iframe-container')) {
      // Iframes are loaded on click, not intersection
      this.currentlyLoading--;
      element.classList.add('loaded');
    } else if (element.classList.contains('lazy-bg-container')) {
      this.loadBackgroundImage(element);
    }
  }

  loadImage(container) {
    const img = container.querySelector('img[data-src]');
    if (!img) {
      this.currentlyLoading--;
      this.processQueue();
      return;
    }

    const src = img.getAttribute('data-src');
    const srcset = img.getAttribute('data-srcset');
    const sizes = img.getAttribute('data-sizes');

    // Check cache
    if (this.imageCache.has(src)) {
      this.applyImage(container, img, src, srcset, sizes);
      return;
    }

    // Load image
    const tempImg = new Image();
    
    tempImg.onload = () => {
      this.imageCache.set(src, true);
      this.applyImage(container, img, src, srcset, sizes);
    };
    
    tempImg.onerror = () => {
      container.classList.add('lazy-error');
      this.currentlyLoading--;
      this.processQueue();
    };

    tempImg.src = src;
  }

  applyImage(container, img, src, srcset, sizes) {
    img.src = src;
    if (srcset) img.srcset = srcset;
    if (sizes) img.sizes = sizes;
    
    img.onload = () => {
      container.classList.add('loaded');
      
      // Remove skeleton after transition
      setTimeout(() => {
        const skeleton = container.querySelector('.skeleton-loader');
        if (skeleton) skeleton.remove();
      }, 600);
      
      this.currentlyLoading--;
      this.processQueue();
      
      // Dispatch event
      container.dispatchEvent(new CustomEvent('lazyLoaded', { detail: { src } }));
    };
  }

  loadVideo(container) {
    const video = container.querySelector('video[data-src]');
    if (!video) {
      this.currentlyLoading--;
      this.processQueue();
      return;
    }

    const src = video.getAttribute('data-src');
    video.src = src;
    
    video.onloadeddata = () => {
      container.classList.add('loaded');
      this.currentlyLoading--;
      this.processQueue();
      
      // Auto-play if data-autoplay is set
      if (video.hasAttribute('data-autoplay')) {
        video.play();
        container.classList.add('playing');
      }
    };

    video.onerror = () => {
      container.classList.add('lazy-error');
      this.currentlyLoading--;
      this.processQueue();
    };
  }

  loadIframe(iframe, container) {
    const src = iframe.getAttribute('data-src');
    iframe.src = src;
    
    iframe.onload = () => {
      container.classList.add('loaded');
      const placeholder = container.querySelector('.iframe-placeholder');
      if (placeholder) placeholder.remove();
    };
  }

  loadBackgroundImage(el) {
    const src = el.getAttribute('data-bg-src');
    const srcset = el.getAttribute('data-bg-srcset');
    
    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage = `url(${src})`;
      if (srcset) {
        // Handle srcset for background images
        const matchedSrc = this.getSrcFromSrcset(srcset);
        if (matchedSrc) {
          el.style.backgroundImage = `url(${matchedSrc})`;
        }
      }
      el.classList.add('loaded');
      this.currentlyLoading--;
      this.processQueue();
    };
    
    img.onerror = () => {
      el.classList.add('lazy-error');
      this.currentlyLoading--;
      this.processQueue();
    };
    
    img.src = src;
  }

  getSrcFromSrcset(srcset) {
    // Simplified srcset parser - returns first src
    return srcset.split(',')[0].split(' ')[0];
  }

  observeMutations() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check for lazy elements in added nodes
            node.querySelectorAll?.('img[data-src]:not([data-lazy-processed])').forEach(img => {
              this.prepareImage(img);
            });
            node.querySelectorAll?.('video[data-src]:not([data-lazy-processed])').forEach(video => {
              this.prepareVideo(video);
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Public API
  refresh() {
    this.processExistingElements();
  }

  preload(src) {
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

  preloadAll() {
    const images = document.querySelectorAll('img[data-src]');
    const promises = Array.from(images).map(img => {
      return this.preload(img.getAttribute('data-src'));
    });
    return Promise.all(promises);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.lazyLoader = new SmartLazyLoader({
      enableBlurUp: true,
      enableProgress: false,
      rootMargin: '100px'
    });
  });
} else {
  window.lazyLoader = new SmartLazyLoader({
    enableBlurUp: true,
    enableProgress: false,
    rootMargin: '100px'
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartLazyLoader;
}
