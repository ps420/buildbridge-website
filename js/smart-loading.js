/**
 * SMART LOADING STATES MANAGER
 * Fortune 500 Loading Experience System
 * 
 * Features:
 * - Page loading overlay
 * - Button loading states
 * - Skeleton screens
 * - Lazy image loading
 * - Progressive content loading
 * - Upload progress tracking
 */

class SmartLoading {
  constructor(options = {}) {
    this.options = {
      showPageLoader: true,
      pageLoaderDuration: 1500,
      lazyLoadThreshold: 0.1,
      ...options
    };

    this.pageLoader = null;
    this.topBar = null;
    this.lazyObserver = null;
    this.progressiveObserver = null;

    this.init();
  }

  init() {
    if (this.options.showPageLoader) {
      this.createPageLoader();
    }

    this.createTopBar();
    this.initLazyLoading();
    this.initProgressiveLoading();
    this.bindEvents();
  }

  /* ============================================
     PAGE LOADER
     ============================================ */

  createPageLoader() {
    this.pageLoader = document.createElement('div');
    this.pageLoader.className = 'page-loader';
    this.pageLoader.innerHTML = `
      <div class="page-loader-brand">
        <img src="assets/BuildBridge_Icon_Mark.svg" alt="BuildBridge">
        <span>BuildBridge</span>
      </div>
      <div class="page-loader-bar">
        <div class="page-loader-progress"></div>
      </div>
      <div class="page-loader-text">Loading experience...</div>
    `;

    document.body.appendChild(this.pageLoader);

    // Simulate loading progress
    const progress = this.pageLoader.querySelector('.page-loader-progress');
    const text = this.pageLoader.querySelector('.page-loader-text');
    const stages = ['Initializing...', 'Loading assets...', 'Preparing content...', 'Almost there...'];
    
    let currentStage = 0;
    const stageInterval = setInterval(() => {
      currentStage++;
      if (currentStage < stages.length) {
        text.textContent = stages[currentStage];
      }
    }, this.options.pageLoaderDuration / stages.length);

    // Animate progress bar
    setTimeout(() => {
      progress.style.width = '30%';
    }, 100);
    
    setTimeout(() => {
      progress.style.width = '70%';
    }, this.options.pageLoaderDuration * 0.6);

    // Hide on load
    window.addEventListener('load', () => {
      clearInterval(stageInterval);
      progress.style.width = '100%';
      text.textContent = 'Ready!';

      setTimeout(() => {
        this.hidePageLoader();
      }, 300);
    });

    // Fallback: hide after max duration
    setTimeout(() => this.hidePageLoader(), 5000);
  }

  hidePageLoader() {
    if (!this.pageLoader) return;
    
    this.pageLoader.classList.add('hidden');
    document.body.classList.add('page-loaded');

    setTimeout(() => {
      if (this.pageLoader) {
        this.pageLoader.remove();
        this.pageLoader = null;
      }
    }, 500);
  }

  /* ============================================
     TOP PROGRESS BAR
     ============================================ */

  createTopBar() {
    this.topBar = document.createElement('div');
    this.topBar.className = 'loading-top-bar';
    this.topBar.innerHTML = '<div class="loading-top-bar-fill"></div>';
    document.body.appendChild(this.topBar);
  }

  showTopBar(indeterminate = false) {
    this.topBar.classList.add('active');
    if (indeterminate) {
      this.topBar.classList.add('indeterminate');
    }
  }

  updateTopBar(percent) {
    this.topBar.classList.remove('indeterminate');
    const fill = this.topBar.querySelector('.loading-top-bar-fill');
    fill.style.width = `${percent}%`;
  }

  hideTopBar() {
    this.updateTopBar(100);
    setTimeout(() => {
      this.topBar.classList.remove('active', 'indeterminate');
      setTimeout(() => {
        this.topBar.querySelector('.loading-top-bar-fill').style.width = '0%';
      }, 300);
    }, 200);
  }

  /* ============================================
     LAZY LOADING
     ============================================ */

  initLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all immediately
      document.querySelectorAll('[data-lazy]').forEach(el => this.loadElement(el));
      return;
    }

    this.lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadElement(entry.target);
          this.lazyObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px',
      threshold: this.options.lazyLoadThreshold
    });

    document.querySelectorAll('[data-lazy]').forEach(el => {
      this.lazyObserver.observe(el);
    });
  }

  loadElement(element) {
    const type = element.dataset.lazy;

    if (type === 'image') {
      this.loadLazyImage(element);
    } else if (type === 'background') {
      this.loadLazyBackground(element);
    } else if (type === 'iframe') {
      this.loadLazyIframe(element);
    } else if (type === 'content') {
      this.loadLazyContent(element);
    }
  }

  loadLazyImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (!src) return;

    // Create wrapper if needed
    let wrapper = img.parentElement;
    if (!wrapper.classList.contains('lazy-image-wrapper')) {
      wrapper = document.createElement('div');
      wrapper.className = 'lazy-image-wrapper';
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
    }

    // Add placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'lazy-image-placeholder';
    wrapper.appendChild(placeholder);

    // Load image
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      if (srcset) img.srcset = srcset;
      img.classList.add('loaded');
    };
    tempImg.src = src;
  }

  loadLazyBackground(element) {
    const src = element.dataset.background;
    if (!src) return;

    const img = new Image();
    img.onload = () => {
      element.style.backgroundImage = `url(${src})`;
      element.classList.add('loaded');
    };
    img.src = src;
  }

  loadLazyIframe(iframe) {
    const src = iframe.dataset.src;
    if (src) {
      iframe.src = src;
      iframe.classList.add('loaded');
    }
  }

  loadLazyContent(element) {
    const url = element.dataset.url;
    if (!url) return;

    fetch(url)
      .then(response => response.text())
      .then(html => {
        element.innerHTML = html;
        element.classList.add('loaded');
      })
      .catch(error => {
        console.error('Failed to load lazy content:', error);
        element.classList.add('error');
      });
  }

  /* ============================================
     PROGRESSIVE LOADING
     ============================================ */

  initProgressiveLoading() {
    this.progressiveObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('loaded');
          this.progressiveObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.progressive-load, .progressive-load-group').forEach(el => {
      this.progressiveObserver.observe(el);
    });
  }

  /* ============================================
     BUTTON LOADING STATES
     ============================================ */

  setButtonLoading(button, loading = true) {
    if (typeof button === 'string') {
      button = document.querySelector(button);
    }
    if (!button) return;

    if (loading) {
      button.dataset.originalText = button.textContent;
      button.classList.add('btn-loading');
      button.disabled = true;
    } else {
      button.classList.remove('btn-loading');
      button.disabled = false;
      if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
      }
    }
  }

  setButtonSuccess(button, message = 'Success!') {
    if (typeof button === 'string') {
      button = document.querySelector(button);
    }
    if (!button) return;

    button.classList.remove('btn-loading');
    button.classList.add('loading-success');
    button.innerHTML = `
      <span class="loading-success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5"/></svg>
      </span>
      ${message}
    `;

    setTimeout(() => {
      button.classList.remove('loading-success');
      button.disabled = false;
      if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
      }
    }, 2000);
  }

  setButtonError(button, message = 'Error') {
    if (typeof button === 'string') {
      button = document.querySelector(button);
    }
    if (!button) return;

    button.classList.remove('btn-loading');
    button.classList.add('loading-error');
    button.innerHTML = `
      <span class="loading-error-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </span>
      ${message}
    `;

    setTimeout(() => {
      button.classList.remove('loading-error');
      button.disabled = false;
      if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
      }
    }, 2000);
  }

  /* ============================================
     OVERLAY LOADING
     ============================================ */

  showOverlay(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (!element) return;

    let overlay = element.querySelector('.loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="loading-overlay-spinner"></div>';
      element.style.position = 'relative';
      element.appendChild(overlay);
    }

    overlay.classList.add('active');
    return overlay;
  }

  hideOverlay(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (!element) return;

    const overlay = element.querySelector('.loading-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  /* ============================================
     UPLOAD PROGRESS
     ============================================ */

  createUploadProgress(container, options = {}) {
    const id = `upload-${Date.now()}`;
    const filename = options.filename || 'Uploading...';

    const progressEl = document.createElement('div');
    progressEl.className = 'upload-progress';
    progressEl.id = id;
    progressEl.innerHTML = `
      <div class="upload-progress-header">
        <span class="upload-progress-filename">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
          ${filename}
        </span>
        <span class="upload-progress-percent">0%</span>
      </div>
      <div class="upload-progress-bar">
        <div class="upload-progress-fill" style="width: 0%"></div>
      </div>
      <div class="upload-progress-status">
        <span class="upload-progress-speed">-- MB/s</span>
        <button class="upload-progress-cancel">Cancel</button>
      </div>
    `;

    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    container.appendChild(progressEl);

    // Handle cancel
    const cancelBtn = progressEl.querySelector('.upload-progress-cancel');
    cancelBtn.addEventListener('click', () => {
      if (options.onCancel) {
        options.onCancel(id);
      }
      progressEl.remove();
    });

    return {
      id,
      element: progressEl,
      update: (percent, speed) => this.updateUploadProgress(progressEl, percent, speed),
      complete: () => this.completeUploadProgress(progressEl),
      error: (message) => this.errorUploadProgress(progressEl, message),
      remove: () => progressEl.remove()
    };
  }

  updateUploadProgress(element, percent, speed) {
    const fill = element.querySelector('.upload-progress-fill');
    const percentText = element.querySelector('.upload-progress-percent');
    const speedText = element.querySelector('.upload-progress-speed');

    fill.style.width = `${percent}%`;
    percentText.textContent = `${Math.round(percent)}%`;
    
    if (speed) {
      speedText.textContent = `${speed.toFixed(1)} MB/s`;
    }
  }

  completeUploadProgress(element) {
    element.classList.add('upload-complete');
    element.innerHTML = `
      <div class="loading-success">
        <span class="loading-success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5"/></svg>
        </span>
        Upload complete
      </div>
    `;

    setTimeout(() => {
      element.style.opacity = '0';
      setTimeout(() => element.remove(), 300);
    }, 2000);
  }

  errorUploadProgress(element, message = 'Upload failed') {
    element.classList.add('upload-error');
    element.innerHTML = `
      <div class="loading-error">
        <span class="loading-error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </span>
        ${message}
      </div>
    `;
  }

  /* ============================================
     SKELETON SCREENS
     ============================================ */

  createSkeleton(type, count = 1) {
    const types = {
      text: '<div class="skeleton skeleton-text"></div>',
      title: '<div class="skeleton skeleton-title"></div>',
      image: '<div class="skeleton skeleton-image"></div>',
      avatar: '<div class="skeleton skeleton-avatar"></div>',
      card: `
        <div class="skeleton-card">
          <div class="skeleton skeleton-title" style="width: 70%;"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text" style="width: 60%;"></div>
        </div>
      `
    };

    const template = types[type] || types.text;
    return template.repeat(count);
  }

  showSkeleton(container, type, count) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) return;

    container.dataset.originalContent = container.innerHTML;
    container.innerHTML = this.createSkeleton(type, count);
  }

  hideSkeleton(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    if (!container) return;

    if (container.dataset.originalContent) {
      container.innerHTML = container.dataset.originalContent;
      delete container.dataset.originalContent;
    }
  }

  /* ============================================
     EVENT BINDING
     ============================================ */

  bindEvents() {
    // Handle ajax page transitions
    document.addEventListener('pjax:start', () => {
      this.showTopBar(true);
    });

    document.addEventListener('pjax:end', () => {
      this.hideTopBar();
      this.initLazyLoading();
      this.initProgressiveLoading();
    });

    // Handle fetch API globally
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      this.showTopBar(true);
      try {
        const response = await originalFetch(...args);
        return response;
      } finally {
        this.hideTopBar();
      }
    };
  }

  /* ============================================
     UTILITY METHODS
     ============================================ */

  destroy() {
    if (this.lazyObserver) {
      this.lazyObserver.disconnect();
    }
    if (this.progressiveObserver) {
      this.progressiveObserver.disconnect();
    }
    if (this.pageLoader) {
      this.pageLoader.remove();
    }
    if (this.topBar) {
      this.topBar.remove();
    }
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.loadingManager = new SmartLoading();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartLoading;
}
