/**
 * v47.0: IMAGE LIGHTBOX PRO - Fortune 500 Professional
 * Advanced image gallery with zoom, pan, and keyboard navigation
 */

(function() {
  'use strict';

  window.ImageLightboxPro = {
    // Configuration
    config: {
      selector: '.gallery-trigger',
      animationDuration: 400,
      enableZoom: true,
      enablePan: true,
      enableThumbnails: true,
      enableKeyboard: true,
      doubleClickZoom: true,
      maxZoom: 4,
      minZoom: 1
    },

    // State
    state: {
      isOpen: false,
      currentIndex: 0,
      images: [],
      zoom: 1,
      panX: 0,
      panY: 0,
      isDragging: false,
      startX: 0,
      startY: 0,
      lastTap: 0
    },

    // DOM Elements
    elements: {},

    /**
     * Initialize the lightbox system
     */
    init(options = {}) {
      Object.assign(this.config, options);
      
      this.collectImages();
      this.createLightbox();
      this.bindTriggers();
      this.bindEvents();
      
      console.log('[ImageLightboxPro] Initialized with', this.state.images.length, 'images');
      
      return this;
    },

    /**
     * Collect all gallery images
     */
    collectImages() {
      const triggers = document.querySelectorAll(this.config.selector);
      
      this.state.images = Array.from(triggers).map((trigger, index) => {
        const img = trigger.querySelector('img');
        return {
          src: trigger.dataset.src || img?.dataset.src || img?.src,
          thumb: img?.src,
          title: trigger.dataset.title || img?.alt || '',
          description: trigger.dataset.description || '',
          element: trigger,
          index: index
        };
      }).filter(img => img.src);
    },

    /**
     * Create lightbox DOM structure
     */
    createLightbox() {
      // Remove existing
      const existing = document.getElementById('lightbox-pro');
      if (existing) existing.remove();

      // Create overlay
      const overlay = document.createElement('div');
      overlay.id = 'lightbox-pro';
      overlay.className = 'lightbox-pro-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Image gallery');
      
      overlay.innerHTML = `
        <div class="lightbox-pro-container">
          <!-- Progress Bar -->
          <div class="lightbox-pro-progress">
            <div class="lightbox-pro-progress-bar" style="width: 0%"></div>
          </div>
          
          <!-- Toolbar -->
          <div class="lightbox-pro-toolbar">
            <div class="lightbox-pro-toolbar-info">
              <div class="lightbox-pro-toolbar-title">Gallery</div>
              <div class="lightbox-pro-toolbar-counter">
                <span class="current">1</span> / <span class="total">${this.state.images.length}</span>
              </div>
            </div>
            <div class="lightbox-pro-toolbar-actions">
              <button class="lightbox-pro-btn lightbox-pro-download" title="Download" aria-label="Download image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                </svg>
              </button>
              <button class="lightbox-pro-btn lightbox-pro-share" title="Share" aria-label="Share image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
              <button class="lightbox-pro-btn lightbox-pro-close" title="Close (Esc)" aria-label="Close gallery">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Navigation -->
          <button class="lightbox-pro-nav prev" aria-label="Previous image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button class="lightbox-pro-nav next" aria-label="Next image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          
          <!-- Stage -->
          <div class="lightbox-pro-stage">
            <div class="lightbox-pro-image-wrapper">
              <img class="lightbox-pro-image" src="" alt="" draggable="false">
            </div>
            <div class="lightbox-pro-loading" style="display: none;">
              <div class="lightbox-pro-spinner"></div>
            </div>
          </div>
          
          <!-- Zoom Controls -->
          <div class="lightbox-pro-zoom-controls">
            <button class="lightbox-pro-zoom-btn zoom-in" title="Zoom in (+)">+</button>
            <button class="lightbox-pro-zoom-btn zoom-out" title="Zoom out (-)">−</button>
            <button class="lightbox-pro-zoom-btn zoom-reset" title="Reset zoom (0)">⟲</button>
          </div>
          
          <!-- Zoom Level -->
          <div class="lightbox-pro-zoom-level">100%</div>
          
          <!-- Caption -->
          <div class="lightbox-pro-caption">
            <h3></h3>
            <p></p>
          </div>
          
          <!-- Thumbnails -->
          <div class="lightbox-pro-thumbnails"></div>
          
          <!-- Keyboard Shortcuts -->
          <div class="lightbox-pro-shortcuts">
            <span class="lightbox-pro-shortcut"><kbd>←</kbd> Prev</span>
            <span class="lightbox-pro-shortcut"><kbd>→</kbd> Next</span>
            <span class="lightbox-pro-shortcut"><kbd>Esc</kbd> Close</span>
            <span class="lightbox-pro-shortcut"><kbd>+</kbd> Zoom</span>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      
      // Cache elements
      this.elements = {
        overlay: overlay,
        container: overlay.querySelector('.lightbox-pro-container'),
        stage: overlay.querySelector('.lightbox-pro-stage'),
        imageWrapper: overlay.querySelector('.lightbox-pro-image-wrapper'),
        image: overlay.querySelector('.lightbox-pro-image'),
        loading: overlay.querySelector('.lightbox-pro-loading'),
        caption: overlay.querySelector('.lightbox-pro-caption'),
        counter: overlay.querySelector('.lightbox-pro-toolbar-counter'),
        title: overlay.querySelector('.lightbox-pro-toolbar-title'),
        progressBar: overlay.querySelector('.lightbox-pro-progress-bar'),
        zoomLevel: overlay.querySelector('.lightbox-pro-zoom-level'),
        thumbnails: overlay.querySelector('.lightbox-pro-thumbnails'),
        navPrev: overlay.querySelector('.lightbox-pro-nav.prev'),
        navNext: overlay.querySelector('.lightbox-pro-nav.next')
      };

      // Create thumbnails
      this.createThumbnails();
    },

    /**
     * Create thumbnail strip
     */
    createThumbnails() {
      if (!this.config.enableThumbnails || this.state.images.length <= 1) {
        this.elements.thumbnails.style.display = 'none';
        return;
      }

      this.elements.thumbnails.innerHTML = this.state.images.map((img, i) => `
        <div class="lightbox-pro-thumb" data-index="${i}">
          <img src="${img.thumb || img.src}" alt="${img.title}">
        </div>
      `).join('');

      // Bind thumbnail clicks
      this.elements.thumbnails.querySelectorAll('.lightbox-pro-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
          this.goToImage(parseInt(thumb.dataset.index));
        });
      });
    },

    /**
     * Bind click events to gallery triggers
     */
    bindTriggers() {
      this.state.images.forEach((img, index) => {
        img.element.addEventListener('click', (e) => {
          e.preventDefault();
          this.open(index);
        });
      });
    },

    /**
     * Bind all event listeners
     */
    bindEvents() {
      // Close button
      this.elements.overlay.querySelector('.lightbox-pro-close').addEventListener('click', () => this.close());

      // Navigation
      this.elements.navPrev.addEventListener('click', () => this.prev());
      this.elements.navNext.addEventListener('click', () => this.next());

      // Zoom controls
      this.elements.overlay.querySelector('.zoom-in').addEventListener('click', () => this.zoomIn());
      this.elements.overlay.querySelector('.zoom-out').addEventListener('click', () => this.zoomOut());
      this.elements.overlay.querySelector('.zoom-reset').addEventListener('click', () => this.resetZoom());

      // Download
      this.elements.overlay.querySelector('.lightbox-pro-download').addEventListener('click', () => this.download());

      // Share
      this.elements.overlay.querySelector('.lightbox-pro-share').addEventListener('click', () => this.share());

      // Click outside to close
      this.elements.overlay.addEventListener('click', (e) => {
        if (e.target === this.elements.overlay || e.target === this.elements.container) {
          this.close();
        }
      });

      // Keyboard navigation
      if (this.config.enableKeyboard) {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
      }

      // Touch/Swipe support
      this.bindTouchEvents();

      // Mouse wheel zoom
      this.elements.stage.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

      // Pan functionality
      if (this.config.enablePan) {
        this.bindPanEvents();
      }

      // Window resize
      window.addEventListener('resize', () => this.handleResize());
    },

    /**
     * Bind touch events for swipe
     */
    bindTouchEvents() {
      let startX = 0;
      let startY = 0;
      let distX = 0;
      let distY = 0;

      this.elements.stage.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, { passive: true });

      this.elements.stage.addEventListener('touchmove', (e) => {
        if (!startX || !startY) return;
        distX = e.touches[0].clientX - startX;
        distY = e.touches[0].clientY - startY;
      }, { passive: true });

      this.elements.stage.addEventListener('touchend', () => {
        if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > 50) {
          if (distX > 0) {
            this.prev();
          } else {
            this.next();
          }
        }
        startX = 0;
        startY = 0;
        distX = 0;
        distY = 0;
      });

      // Double tap to zoom
      if (this.config.doubleClickZoom) {
        this.elements.stage.addEventListener('touchend', (e) => {
          const currentTime = new Date().getTime();
          const tapLength = currentTime - this.state.lastTap;
          
          if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
            if (this.state.zoom > 1) {
              this.resetZoom();
            } else {
              this.zoomIn();
            }
          }
          
          this.state.lastTap = currentTime;
        });
      }
    },

    /**
     * Bind pan events
     */
    bindPanEvents() {
      this.elements.stage.addEventListener('mousedown', (e) => {
        if (this.state.zoom <= 1) return;
        
        this.state.isDragging = true;
        this.state.startX = e.clientX - this.state.panX;
        this.state.startY = e.clientY - this.state.panY;
        this.elements.stage.style.cursor = 'grabbing';
      });

      document.addEventListener('mousemove', (e) => {
        if (!this.state.isDragging) return;
        
        e.preventDefault();
        this.state.panX = e.clientX - this.state.startX;
        this.state.panY = e.clientY - this.state.startY;
        this.updateTransform();
      });

      document.addEventListener('mouseup', () => {
        this.state.isDragging = false;
        this.elements.stage.style.cursor = this.state.zoom > 1 ? 'grab' : 'default';
      });
    },

    /**
     * Handle keyboard events
     */
    handleKeydown(e) {
      if (!this.state.isOpen) return;

      switch(e.key) {
        case 'Escape':
          this.close();
          break;
        case 'ArrowLeft':
          this.prev();
          break;
        case 'ArrowRight':
          this.next();
          break;
        case '+':
        case '=':
          e.preventDefault();
          this.zoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          this.zoomOut();
          break;
        case '0':
          e.preventDefault();
          this.resetZoom();
          break;
        case 'Home':
          e.preventDefault();
          this.goToImage(0);
          break;
        case 'End':
          e.preventDefault();
          this.goToImage(this.state.images.length - 1);
          break;
      }
    },

    /**
     * Handle mouse wheel for zoom
     */
    handleWheel(e) {
      if (!this.config.enableZoom) return;
      
      e.preventDefault();
      
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      this.setZoom(this.state.zoom + delta);
    },

    /**
     * Handle window resize
     */
    handleResize() {
      if (this.state.isOpen) {
        this.resetZoom();
      }
    },

    /**
     * Open lightbox
     */
    open(index = 0) {
      if (this.state.images.length === 0) return;

      this.state.isOpen = true;
      this.state.currentIndex = index;
      
      this.elements.overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      this.loadImage(index);
      this.updateThumbnails();
      
      // Focus management
      this.elements.overlay.focus();
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('lightbox:open', {
        detail: { index: index, image: this.state.images[index] }
      }));
    },

    /**
     * Close lightbox
     */
    close() {
      this.state.isOpen = false;
      this.resetZoom();
      
      this.elements.overlay.classList.remove('active');
      document.body.style.overflow = '';
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('lightbox:close'));
    },

    /**
     * Load image at index
     */
    loadImage(index) {
      const image = this.state.images[index];
      if (!image) return;

      // Show loading
      this.elements.loading.style.display = 'flex';
      
      // Update counter
      this.elements.counter.querySelector('.current').textContent = index + 1;
      
      // Update progress bar
      const progress = ((index + 1) / this.state.images.length) * 100;
      this.elements.progressBar.style.width = progress + '%';
      
      // Update title
      this.elements.title.textContent = image.title || 'Gallery';
      
      // Load image
      const img = new Image();
      img.onload = () => {
        this.elements.image.src = image.src;
        this.elements.image.alt = image.title;
        this.elements.loading.style.display = 'none';
        
        // Update caption
        this.elements.caption.querySelector('h3').textContent = image.title;
        this.elements.caption.querySelector('p').textContent = image.description;
      };
      img.src = image.src;
      
      // Update thumbnails
      this.updateThumbnails();
    },

    /**
     * Update thumbnail active state
     */
    updateThumbnails() {
      const thumbs = this.elements.thumbnails.querySelectorAll('.lightbox-pro-thumb');
      thumbs.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === this.state.currentIndex);
        if (i === this.state.currentIndex) {
          thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    },

    /**
     * Go to specific image
     */
    goToImage(index) {
      if (index < 0) index = this.state.images.length - 1;
      if (index >= this.state.images.length) index = 0;
      
      const direction = index > this.state.currentIndex ? 'next' : 'prev';
      this.state.currentIndex = index;
      
      // Add animation class
      this.elements.imageWrapper.classList.add(`switching-${direction}`);
      setTimeout(() => {
        this.elements.imageWrapper.classList.remove(`switching-${direction}`);
      }, this.config.animationDuration);
      
      this.resetZoom();
      this.loadImage(index);
    },

    /**
     * Go to previous image
     */
    prev() {
      this.goToImage(this.state.currentIndex - 1);
    },

    /**
     * Go to next image
     */
    next() {
      this.goToImage(this.state.currentIndex + 1);
    },

    /**
     * Zoom in
     */
    zoomIn() {
      this.setZoom(this.state.zoom + 0.5);
    },

    /**
     * Zoom out
     */
    zoomOut() {
      this.setZoom(this.state.zoom - 0.5);
    },

    /**
     * Reset zoom
     */
    resetZoom() {
      this.state.zoom = 1;
      this.state.panX = 0;
      this.state.panY = 0;
      this.updateTransform();
    },

    /**
     * Set zoom level
     */
    setZoom(level) {
      this.state.zoom = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, level));
      this.updateTransform();
    },

    /**
     * Update image transform
     */
    updateTransform() {
      const { zoom, panX, panY } = this.state;
      
      this.elements.imageWrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
      this.elements.zoomLevel.textContent = Math.round(zoom * 100) + '%';
      
      // Update cursor
      this.elements.stage.style.cursor = zoom > 1 ? 'grab' : 'default';
    },

    /**
     * Download current image
     */
    download() {
      const image = this.state.images[this.state.currentIndex];
      if (!image) return;

      const link = document.createElement('a');
      link.href = image.src;
      link.download = image.title || 'image';
      link.click();
    },

    /**
     * Share current image
     */
    async share() {
      const image = this.state.images[this.state.currentIndex];
      if (!image) return;

      if (navigator.share) {
        try {
          await navigator.share({
            title: image.title,
            text: image.description,
            url: window.location.href
          });
        } catch (err) {
          console.log('Share cancelled');
        }
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        if (window.ToastSystem) {
          window.ToastSystem.show({ message: 'Link copied to clipboard!', type: 'success' });
        }
      }
    }
  };

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.ImageLightboxPro.init());
  } else {
    window.ImageLightboxPro.init();
  }

})();
