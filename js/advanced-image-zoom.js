/**
 * v104.2: Advanced Image Zoom Gallery - Fortune 500 Professional Image Viewer
 * Zoom, pan, thumbnails, keyboard navigation
 */

(function() {
  'use strict';

  class AdvancedImageZoom {
    constructor(options = {}) {
      this.options = {
        selector: '[data-zoom-gallery]',
        maxZoom: 4,
        zoomStep: 0.5,
        enablePan: true,
        enableThumbnails: true,
        ...options
      };
      
      this.currentIndex = 0;
      this.images = [];
      this.isOpen = false;
      this.currentZoom = 1;
      this.isDragging = false;
      this.panX = 0;
      this.panY = 0;
      this.lastX = 0;
      this.lastY = 0;
      
      this.init();
    }

    init() {
      this.findImages();
      this.createLightbox();
      this.bindEvents();
    }

    findImages() {
      // Find all images with zoom capability
      const galleries = document.querySelectorAll(this.options.selector);
      
      galleries.forEach(gallery => {
        const images = gallery.querySelectorAll('img');
        images.forEach((img, index) => {
          if (!img.closest('.zoom-trigger')) {
            this.wrapImage(img, index);
          }
        });
      });

      // Also find individual zoomable images
      document.querySelectorAll('[data-zoom]').forEach((img, index) => {
        if (!img.closest('.zoom-trigger')) {
          this.wrapImage(img, index);
        }
      });
    }

    wrapImage(img, index) {
      const wrapper = document.createElement('div');
      wrapper.className = 'zoom-trigger';
      wrapper.dataset.index = index;
      
      // Store image data
      this.images.push({
        src: img.dataset.src || img.src,
        alt: img.alt,
        title: img.dataset.title || '',
        description: img.dataset.description || ''
      });
      
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      
      // Add click handler
      wrapper.addEventListener('click', () => this.open(index));
    }

    createLightbox() {
      this.lightbox = document.createElement('div');
      this.lightbox.className = 'zoom-lightbox';
      this.lightbox.innerHTML = `
        <button class="zoom-close" aria-label="Close gallery">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        
        <div class="zoom-counter">
          <span class="current">1</span> / <span class="total">${this.images.length}</span>
        </div>
        
        <button class="zoom-nav prev" aria-label="Previous image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        
        <div class="zoom-lightbox-content">
          <div class="zoom-loading">
            <div class="zoom-loading-spinner"></div>
          </div>
          <div class="zoom-image-wrapper">
            <img class="zoom-image" src="" alt="">
          </div>
          <div class="zoom-pan-hint">Click and drag to pan</div>
        </div>
        
        <button class="zoom-nav next" aria-label="Next image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        
        <div class="zoom-controls">
          <button class="zoom-control-btn zoom-out" aria-label="Zoom out">−</button>
          <span class="zoom-level-indicator">100%</span>
          <button class="zoom-control-btn zoom-in" aria-label="Zoom in">+</button>
          <button class="zoom-control-btn zoom-reset" aria-label="Reset zoom">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/>
              <path d="M3 5v7h7"/>
            </svg>
          </button>
          <button class="zoom-control-btn zoom-info-toggle" aria-label="Toggle info">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </button>
        </div>
        
        <div class="zoom-thumbnails"></div>
        
        <div class="zoom-info">
          <h3 class="zoom-title"></h3>
          <p class="zoom-description"></p>
        </div>
        
        <div class="zoom-shortcuts">
          <h4>Keyboard Shortcuts</h4>
          <ul>
            <li><span>Close</span> <kbd>ESC</kbd></li>
            <li><span>Next</span> <kbd>→</kbd></li>
            <li><span>Previous</span> <kbd>←</kbd></li>
            <li><span>Zoom In</span> <kbd>+</kbd></li>
            <li><span>Zoom Out</span> <kbd>−</kbd></li>
            <li><span>Reset</span> <kbd>0</kbd></li>
          </ul>
        </div>
      `;
      
      document.body.appendChild(this.lightbox);
      
      // Cache elements
      this.elements = {
        close: this.lightbox.querySelector('.zoom-close'),
        prev: this.lightbox.querySelector('.zoom-nav.prev'),
        next: this.lightbox.querySelector('.zoom-nav.next'),
        image: this.lightbox.querySelector('.zoom-image'),
        imageWrapper: this.lightbox.querySelector('.zoom-image-wrapper'),
        loading: this.lightbox.querySelector('.zoom-loading'),
        counter: this.lightbox.querySelector('.zoom-counter'),
        current: this.lightbox.querySelector('.zoom-counter .current'),
        zoomIn: this.lightbox.querySelector('.zoom-in'),
        zoomOut: this.lightbox.querySelector('.zoom-out'),
        zoomReset: this.lightbox.querySelector('.zoom-reset'),
        zoomIndicator: this.lightbox.querySelector('.zoom-level-indicator'),
        thumbnails: this.lightbox.querySelector('.zoom-thumbnails'),
        info: this.lightbox.querySelector('.zoom-info'),
        infoToggle: this.lightbox.querySelector('.zoom-info-toggle'),
        title: this.lightbox.querySelector('.zoom-title'),
        description: this.lightbox.querySelector('.zoom-description'),
        panHint: this.lightbox.querySelector('.zoom-pan-hint'),
        shortcuts: this.lightbox.querySelector('.zoom-shortcuts')
      };

      this.createThumbnails();
    }

    createThumbnails() {
      if (!this.options.enableThumbnails) return;
      
      this.elements.thumbnails.innerHTML = this.images.map((img, i) => `
        <div class="zoom-thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}">
          <img src="${img.src}" alt="${img.alt}">
        </div>
      `).join('');
    }

    bindEvents() {
      // Close button
      this.elements.close.addEventListener('click', () => this.close());
      
      // Navigation
      this.elements.prev.addEventListener('click', () => this.prev());
      this.elements.next.addEventListener('click', () => this.next());
      
      // Zoom controls
      this.elements.zoomIn.addEventListener('click', () => this.zoomIn());
      this.elements.zoomOut.addEventListener('click', () => this.zoomOut());
      this.elements.zoomReset.addEventListener('click', () => this.resetZoom());
      
      // Thumbnails
      this.elements.thumbnails.addEventListener('click', (e) => {
        const thumb = e.target.closest('.zoom-thumbnail');
        if (thumb) {
          this.goTo(parseInt(thumb.dataset.index));
        }
      });
      
      // Info toggle
      this.elements.infoToggle.addEventListener('click', () => {
        this.elements.info.classList.toggle('visible');
      });
      
      // Pan functionality
      this.setupPanning();
      
      // Keyboard navigation
      document.addEventListener('keydown', (e) => this.handleKeydown(e));
      
      // Click outside to close
      this.lightbox.addEventListener('click', (e) => {
        if (e.target === this.lightbox) this.close();
      });
      
      // Show shortcuts on first use
      if (!localStorage.getItem('zoomShortcutsShown')) {
        setTimeout(() => {
          this.elements.shortcuts.classList.add('visible');
          setTimeout(() => {
            this.elements.shortcuts.classList.remove('visible');
          }, 4000);
          localStorage.setItem('zoomShortcutsShown', 'true');
        }, 500);
      }
    }

    setupPanning() {
      if (!this.options.enablePan) return;
      
      const wrapper = this.elements.imageWrapper;
      const image = this.elements.image;
      
      wrapper.addEventListener('mousedown', (e) => {
        if (this.currentZoom > 1) {
          this.isDragging = true;
          this.lastX = e.clientX;
          this.lastY = e.clientY;
          image.style.cursor = 'grabbing';
          e.preventDefault();
        }
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.lastX;
        const deltaY = e.clientY - this.lastY;
        
        this.panX += deltaX;
        this.panY += deltaY;
        
        this.updateTransform();
        
        this.lastX = e.clientX;
        this.lastY = e.clientY;
      });
      
      document.addEventListener('mouseup', () => {
        this.isDragging = false;
        image.style.cursor = this.currentZoom > 1 ? 'grab' : 'default';
      });
      
      // Touch support
      wrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1 && this.currentZoom > 1) {
          this.isDragging = true;
          this.lastX = e.touches[0].clientX;
          this.lastY = e.touches[0].clientY;
        }
      }, { passive: true });
      
      document.addEventListener('touchmove', (e) => {
        if (!this.isDragging || e.touches.length !== 1) return;
        
        const deltaX = e.touches[0].clientX - this.lastX;
        const deltaY = e.touches[0].clientY - this.lastY;
        
        this.panX += deltaX;
        this.panY += deltaY;
        
        this.updateTransform();
        
        this.lastX = e.touches[0].clientX;
        this.lastY = e.touches[0].clientY;
      }, { passive: true });
      
      document.addEventListener('touchend', () => {
        this.isDragging = false;
      });
    }

    handleKeydown(e) {
      if (!this.isOpen) return;
      
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
          this.zoomIn();
          break;
        case '-':
          this.zoomOut();
          break;
        case '0':
          this.resetZoom();
          break;
      }
    }

    open(index) {
      this.currentIndex = index;
      this.isOpen = true;
      this.lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      this.loadImage(index);
      this.updateUI();
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('zoomGalleryOpen', {
        detail: { index, image: this.images[index] }
      }));
    }

    close() {
      this.isOpen = false;
      this.lightbox.classList.remove('active');
      document.body.style.overflow = '';
      
      this.resetZoom();
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('zoomGalleryClose'));
    }

    loadImage(index) {
      const image = this.images[index];
      
      this.elements.loading.style.display = 'flex';
      
      const img = new Image();
      img.onload = () => {
        this.elements.image.src = image.src;
        this.elements.image.alt = image.alt;
        this.elements.loading.style.display = 'none';
      };
      img.src = image.src;
      
      // Update info
      this.elements.title.textContent = image.title || image.alt;
      this.elements.description.textContent = image.description || '';
    }

    updateUI() {
      this.elements.current.textContent = this.currentIndex + 1;
      
      // Update thumbnails
      this.elements.thumbnails.querySelectorAll('.zoom-thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === this.currentIndex);
      });
      
      // Update navigation buttons
      this.elements.prev.disabled = this.currentIndex === 0;
      this.elements.next.disabled = this.currentIndex === this.images.length - 1;
      
      // Scroll thumbnail into view
      const activeThumb = this.elements.thumbnails.querySelector('.zoom-thumbnail.active');
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }

    prev() {
      if (this.currentIndex > 0) {
        this.goTo(this.currentIndex - 1);
      }
    }

    next() {
      if (this.currentIndex < this.images.length - 1) {
        this.goTo(this.currentIndex + 1);
      }
    }

    goTo(index) {
      if (index === this.currentIndex) return;
      
      // Add transition effect
      this.elements.image.style.opacity = '0';
      
      setTimeout(() => {
        this.currentIndex = index;
        this.resetZoom();
        this.loadImage(index);
        this.updateUI();
        this.elements.image.style.opacity = '1';
      }, 200);
    }

    zoomIn() {
      if (this.currentZoom < this.options.maxZoom) {
        this.currentZoom = Math.min(this.currentZoom + this.options.zoomStep, this.options.maxZoom);
        this.updateTransform();
        this.showPanHint();
      }
    }

    zoomOut() {
      if (this.currentZoom > 1) {
        this.currentZoom = Math.max(this.currentZoom - this.options.zoomStep, 1);
        if (this.currentZoom === 1) {
          this.panX = 0;
          this.panY = 0;
        }
        this.updateTransform();
      }
    }

    resetZoom() {
      this.currentZoom = 1;
      this.panX = 0;
      this.panY = 0;
      this.updateTransform();
    }

    updateTransform() {
      this.elements.image.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.currentZoom})`;
      this.elements.image.style.cursor = this.currentZoom > 1 ? 'grab' : 'default';
      this.elements.zoomIndicator.textContent = `${Math.round(this.currentZoom * 100)}%`;
      
      // Update button states
      this.elements.zoomIn.disabled = this.currentZoom >= this.options.maxZoom;
      this.elements.zoomOut.disabled = this.currentZoom <= 1;
    }

    showPanHint() {
      if (this.currentZoom > 1) {
        this.elements.panHint.classList.add('visible');
        setTimeout(() => {
          this.elements.panHint.classList.remove('visible');
        }, 2000);
      }
    }
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AdvancedImageZoom());
  } else {
    new AdvancedImageZoom();
  }

  // Expose to global scope
  window.AdvancedImageZoom = AdvancedImageZoom;
})();
