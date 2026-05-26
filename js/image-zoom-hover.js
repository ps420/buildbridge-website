/**
 * Image Zoom Hover Effect
 * Magnifying zoom for project and hero images
 */

class ImageZoomHover {
  constructor(container, options = {}) {
    this.container = container;
    this.img = container.querySelector('img');
    if (!this.img) return;
    
    this.options = {
      zoomLevel: options.zoomLevel || 2.5,
      lensSize: options.lensSize || 150,
      resultSize: options.resultSize || 300,
      showLens: options.showLens !== false,
      fullscreenOnClick: options.fullscreenOnClick !== false,
      ...options
    };
    
    this.lens = null;
    this.result = null;
    this.isZooming = false;
    
    this.init();
  }
  
  init() {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      this.enableFullscreenClick();
      return;
    }
    
    this.setupContainer();
    this.createLens();
    this.createResultWindow();
    this.bindEvents();
    this.enableFullscreenClick();
  }
  
  setupContainer() {
    this.container.classList.add('zoom-container', 'magnify');
    this.container.classList.add('zoom-enabled');
    
    // Wrap image if not already wrapped
    if (!this.img.parentElement.classList.contains('zoom-container')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'zoom-container';
      this.img.parentNode.insertBefore(wrapper, this.img);
      wrapper.appendChild(this.img);
      this.container = wrapper;
    }
  }
  
  createLens() {
    if (!this.options.showLens) return;
    
    this.lens = document.createElement('div');
    this.lens.className = 'zoom-lens';
    this.lens.style.cssText = `
      width: ${this.options.lensSize}px;
      height: ${this.options.lensSize}px;
    `;
    this.container.appendChild(this.lens);
  }
  
  createResultWindow() {
    this.result = document.createElement('div');
    this.result.className = 'zoom-result';
    this.result.style.cssText = `
      width: ${this.options.resultSize}px;
      height: ${this.options.resultSize}px;
      background-image: url('${this.img.src}');
      background-size: ${this.img.offsetWidth * this.options.zoomLevel}px ${this.img.offsetHeight * this.options.zoomLevel}px;
    `;
    
    // Position based on viewport space
    const rect = this.container.getBoundingClientRect();
    if (rect.left > this.options.resultSize + 40) {
      this.result.classList.add('zoom-result--left');
    } else {
      this.result.classList.add('zoom-result--right');
    }
    
    this.container.style.position = 'relative';
    this.container.appendChild(this.result);
  }
  
  bindEvents() {
    // Mouse enter - activate zoom
    this.container.addEventListener('mouseenter', () => {
      this.isZooming = true;
      if (this.result) this.result.classList.add('active');
    });
    
    // Mouse leave - deactivate zoom
    this.container.addEventListener('mouseleave', () => {
      this.isZooming = false;
      if (this.result) this.result.classList.remove('active');
    });
    
    // Mouse move - update zoom position
    this.container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    
    // Update on window resize
    window.addEventListener('resize', () => this.updateBackgroundSize());
    
    // Update when image loads
    this.img.addEventListener('load', () => this.updateBackgroundSize());
  }
  
  handleMouseMove(e) {
    if (!this.isZooming) return;
    
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update CSS custom properties for spotlight effect
    this.container.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    this.container.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    
    if (this.lens) {
      this.lens.style.left = `${x}px`;
      this.lens.style.top = `${y}px`;
    }
    
    if (this.result) {
      // Calculate background position
      const bgX = (x / rect.width) * 100;
      const bgY = (y / rect.height) * 100;
      this.result.style.backgroundPosition = `${bgX}% ${bgY}%`;
    }
  }
  
  updateBackgroundSize() {
    if (!this.result) return;
    const rect = this.container.getBoundingClientRect();
    this.result.style.backgroundSize = 
      `${rect.width * this.options.zoomLevel}px ${rect.height * this.options.zoomLevel}px`;
  }
  
  enableFullscreenClick() {
    if (!this.options.fullscreenOnClick) return;
    
    this.container.classList.add('fullscreen-zoom');
    this.container.addEventListener('click', () => this.openFullscreen());
  }
  
  openFullscreen() {
    const modal = document.createElement('div');
    modal.className = 'zoom-modal';
    modal.innerHTML = `
      <div class="zoom-modal-backdrop"></div>
      <div class="zoom-modal-content">
        <button class="zoom-modal-close">&times;</button>
        <img class="zoom-modal-image" src="${this.img.src}" alt="${this.img.alt}">
        ${this.img.alt ? `
          <div class="zoom-modal-info">
            <h4>${this.img.alt}</h4>
            <p>BuildBridge Project</p>
          </div>
        ` : ''}
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Show modal
    requestAnimationFrame(() => modal.classList.add('active'));
    
    // Close handlers
    const closeModal = () => {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = '';
      }, 300);
    };
    
    modal.querySelector('.zoom-modal-backdrop').addEventListener('click', closeModal);
    modal.querySelector('.zoom-modal-close').addEventListener('click', closeModal);
    
    // Keyboard close
    const keyHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', keyHandler);
      }
    };
    document.addEventListener('keydown', keyHandler);
  }
}

/**
 * Initialize zoom on all project cards
 */
class ProjectZoomManager {
  constructor() {
    this.init();
  }
  
  init() {
    // Initialize on project cards
    document.querySelectorAll('.project-card').forEach(card => {
      new ImageZoomHover(card, {
        zoomLevel: 2,
        lensSize: 120,
        resultSize: 250,
        showLens: false // Cleaner without lens on cards
      });
    });
    
    // Initialize on hero image
    const heroWrapper = document.querySelector('.hero-image-wrapper');
    if (heroWrapper) {
      new ImageZoomHover(heroWrapper, {
        zoomLevel: 1.8,
        lensSize: 150,
        resultSize: 350,
        showLens: true
      });
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new ProjectZoomManager();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ImageZoomHover, ProjectZoomManager };
}
