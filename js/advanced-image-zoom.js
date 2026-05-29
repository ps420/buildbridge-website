/**
 * v88.2: Advanced Image Zoom System
 * Fortune 500 Magnification for Project Details
 */

class AdvancedImageZoom {
  constructor() {
    this.images = [];
    this.currentIndex = 0;
    this.zoomLevel = 1;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.panOffset = { x: 0, y: 0 };
    this.touchStart = { x: 0, y: 0 };
    this.touchDistance = 0;
    
    this.init();
  }
  
  init() {
    this.findImages();
    this.createLightbox();
    this.bindEvents();
  }
  
  findImages() {
    // Find all images with data-zoom attribute or in project cards
    const zoomImages = document.querySelectorAll('[data-zoom], .project-card img, .before-after-slider img');
    
    zoomImages.forEach((img, index) => {
      if (!img.dataset.zoomInitialized) {
        img.dataset.zoomInitialized = 'true';
        img.dataset.zoomIndex = index;
        this.images.push({
          src: img.src,
          alt: img.alt,
          caption: img.closest('figure, .project-card, [data-caption]')?.textContent || img.alt
        });
        
        // Add zoom container wrapper
        this.wrapImage(img);
      }
    });
  }
  
  wrapImage(img) {
    const wrapper = document.createElement('div');
    wrapper.className = 'advanced-zoom-container';
    wrapper.dataset.zoomIndex = img.dataset.zoomIndex;
    
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    
    // Add zoom hint
    const hint = document.createElement('div');
    hint.className = 'zoom-hint';
    hint.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/></svg>
      Click to zoom
    `;
    wrapper.appendChild(hint);
    
    // Click to open lightbox
    wrapper.addEventListener('click', () => {
      this.open(parseInt(img.dataset.zoomIndex));
    });
  }
  
  createLightbox() {
    if (document.querySelector('.advanced-lightbox')) return;
    
    const lightbox = document.createElement('div');
    lightbox.className = 'advanced-lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-content-wrapper">
        <!-- Controls -->
        <div class="lightbox-controls">
          <button class="lightbox-control-btn zoom-in" title="Zoom In (+)">
            <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </button>
          <button class="lightbox-control-btn zoom-out" title="Zoom Out (-)">
            <svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
          </button>
          <button class="lightbox-control-btn reset-zoom" title="Reset Zoom (0)">
            <svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
          </button>
          <button class="lightbox-control-btn toggle-info" title="Toggle Info (I)">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </button>
          <button class="lightbox-control-btn close-lightbox" title="Close (Esc)">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        
        <!-- Zoom Level -->
        <div class="zoom-level">
          <span class="zoom-value">100%</span>
          <input type="range" class="zoom-slider" min="100" max="400" value="100" step="25">
        </div>
        
        <!-- Navigation -->
        <button class="lightbox-nav prev" title="Previous (←)">
          <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <button class="lightbox-nav next" title="Next (→)">
          <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
        
        <!-- Image Container -->
        <div class="lightbox-image-container">
          <div class="lightbox-loading" style="display: none;">
            <div class="lightbox-spinner"></div>
          </div>
          <img class="lightbox-image" src="" alt="">
        </div>
        
        <!-- Info Panel -->
        <div class="lightbox-info">
          <h3 class="lightbox-title"></h3>
          <p class="lightbox-description"></p>
          <div class="lightbox-info-meta">
            <div class="info-meta-item">
              <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              <span>High Resolution</span>
            </div>
            <div class="info-meta-item">
              <svg viewBox="0 0 24 24" width="16" height="16"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
              <span class="image-dimensions">-- x --</span>
            </div>
          </div>
        </div>
        
        <!-- Thumbnails -->
        <div class="lightbox-thumbnails"></div>
        
        <!-- Keyboard Shortcuts Hint -->
        <div class="keyboard-shortcuts-hint">
          <kbd>←</kbd> <kbd>→</kbd> Navigate <kbd>+</kbd> <kbd>-</kbd> Zoom <kbd>0</kbd> Reset <kbd>Esc</kbd> Close
        </div>
      </div>
    `;
    
    document.body.appendChild(lightbox);
    
    this.elements = {
      lightbox,
      backdrop: lightbox.querySelector('.lightbox-backdrop'),
      image: lightbox.querySelector('.lightbox-image'),
      imageContainer: lightbox.querySelector('.lightbox-image-container'),
      loading: lightbox.querySelector('.lightbox-loading'),
      title: lightbox.querySelector('.lightbox-title'),
      description: lightbox.querySelector('.lightbox-description'),
      dimensions: lightbox.querySelector('.image-dimensions'),
      zoomValue: lightbox.querySelector('.zoom-value'),
      zoomSlider: lightbox.querySelector('.zoom-slider'),
      thumbnails: lightbox.querySelector('.lightbox-thumbnails'),
      prevBtn: lightbox.querySelector('.lightbox-nav.prev'),
      nextBtn: lightbox.querySelector('.lightbox-nav.next')
    };
    
    this.renderThumbnails();
  }
  
  renderThumbnails() {
    this.elements.thumbnails.innerHTML = this.images.map((img, i) => `
      <div class="lightbox-thumbnail ${i === 0 ? 'active' : ''}" data-index="${i}">
        <img src="${img.src}" alt="${img.alt}">
      </div>
    `).join('');
    
    this.elements.thumbnails.querySelectorAll('.lightbox-thumbnail').forEach(thumb => {
      thumb.addEventListener('click', () => {
        this.navigateTo(parseInt(thumb.dataset.index));
      });
    });
  }
  
  bindEvents() {
    // Close handlers
    this.elements.lightbox.querySelector('.close-lightbox').addEventListener('click', () => this.close());
    this.elements.backdrop.addEventListener('click', () => this.close());
    
    // Zoom controls
    this.elements.lightbox.querySelector('.zoom-in').addEventListener('click', () => this.zoomIn());
    this.elements.lightbox.querySelector('.zoom-out').addEventListener('click', () => this.zoomOut());
    this.elements.lightbox.querySelector('.reset-zoom').addEventListener('click', () => this.resetZoom());
    
    // Zoom slider
    this.elements.zoomSlider.addEventListener('input', (e) => {
      this.setZoom(parseInt(e.target.value) / 100);
    });
    
    // Toggle info
    this.elements.lightbox.querySelector('.toggle-info').addEventListener('click', () => {
      this.elements.lightbox.classList.toggle('info-visible');
    });
    
    // Navigation
    this.elements.prevBtn.addEventListener('click', () => this.prev());
    this.elements.nextBtn.addEventListener('click', () => this.next());
    
    // Image click to zoom
    this.elements.image.addEventListener('click', (e) => {
      if (this.zoomLevel === 1) {
        this.zoomIn();
      } else {
        this.resetZoom();
      }
    });
    
    // Pan when zoomed
    this.elements.image.addEventListener('mousedown', (e) => this.startPan(e));
    document.addEventListener('mousemove', (e) => this.pan(e));
    document.addEventListener('mouseup', () => this.endPan());
    
    // Mouse wheel zoom
    this.elements.imageContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      this.setZoom(Math.max(1, Math.min(4, this.zoomLevel + delta)));
    });
    
    // Keyboard
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Touch gestures
    this.bindTouchEvents();
  }
  
  bindTouchEvents() {
    let touchStartTime = 0;
    
    this.elements.imageContainer.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      
      if (e.touches.length === 1) {
        this.touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        this.touchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });
    
    this.elements.imageContainer.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const distance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = distance / this.touchDistance;
        this.setZoom(Math.max(1, Math.min(4, this.zoomLevel * scale)));
        this.touchDistance = distance;
      }
    }, { passive: false });
    
    this.elements.imageContainer.addEventListener('touchend', (e) => {
      const touchDuration = Date.now() - touchStartTime;
      
      // Tap to zoom if quick tap
      if (touchDuration < 200 && e.changedTouches.length === 1) {
        if (this.zoomLevel === 1) {
          this.zoomIn();
        } else {
          this.resetZoom();
        }
      }
    });
  }
  
  open(index = 0) {
    this.currentIndex = index;
    this.elements.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.loadImage();
  }
  
  close() {
    this.elements.lightbox.classList.remove('active', 'info-visible');
    document.body.style.overflow = '';
    this.resetZoom();
  }
  
  loadImage() {
    const image = this.images[this.currentIndex];
    
    this.elements.loading.style.display = 'flex';
    this.elements.image.style.opacity = '0.5';
    
    // Update thumbnails
    this.elements.thumbnails.querySelectorAll('.lightbox-thumbnail').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === this.currentIndex);
    });
    
    // Load new image
    const img = new Image();
    img.onload = () => {
      this.elements.image.src = image.src;
      this.elements.image.alt = image.alt;
      this.elements.title.textContent = image.alt;
      this.elements.description.textContent = image.caption;
      this.elements.dimensions.textContent = `${img.naturalWidth} x ${img.naturalHeight}`;
      this.elements.loading.style.display = 'none';
      this.elements.image.style.opacity = '1';
      this.resetZoom();
    };
    img.src = image.src;
  }
  
  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.loadImage();
  }
  
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.loadImage();
  }
  
  navigateTo(index) {
    this.currentIndex = index;
    this.loadImage();
  }
  
  zoomIn() {
    this.setZoom(Math.min(4, this.zoomLevel + 0.5));
  }
  
  zoomOut() {
    this.setZoom(Math.max(1, this.zoomLevel - 0.5));
  }
  
  resetZoom() {
    this.setZoom(1);
    this.panOffset = { x: 0, y: 0 };
    this.updateTransform();
  }
  
  setZoom(level) {
    this.zoomLevel = level;
    this.elements.zoomValue.textContent = Math.round(level * 100) + '%';
    this.elements.zoomSlider.value = level * 100;
    this.elements.image.classList.toggle('zoomed', level > 1);
    this.elements.image.classList.toggle('pan-mode', level > 1);
    this.updateTransform();
  }
  
  startPan(e) {
    if (this.zoomLevel === 1) return;
    this.isPanning = true;
    this.panStart = { x: e.clientX - this.panOffset.x, y: e.clientY - this.panOffset.y };
  }
  
  pan(e) {
    if (!this.isPanning || this.zoomLevel === 1) return;
    e.preventDefault();
    this.panOffset = {
      x: e.clientX - this.panStart.x,
      y: e.clientY - this.panStart.y
    };
    this.updateTransform();
  }
  
  endPan() {
    this.isPanning = false;
  }
  
  updateTransform() {
    const transform = `scale(${this.zoomLevel}) translate(${this.panOffset.x}px, ${this.panOffset.y}px)`;
    this.elements.image.style.transform = transform;
  }
  
  handleKeydown(e) {
    if (!this.elements.lightbox.classList.contains('active')) return;
    
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
      case 'i':
      case 'I':
        this.elements.lightbox.classList.toggle('info-visible');
        break;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new AdvancedImageZoom());
} else {
  new AdvancedImageZoom();
}

// Re-scan for new images periodically (for dynamically loaded content)
setInterval(() => {
  const zoom = window.advancedImageZoom;
  if (zoom) {
    zoom.findImages();
  }
}, 5000);
