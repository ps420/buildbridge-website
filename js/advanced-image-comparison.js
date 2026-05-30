/**
 * Advanced Image Comparison Slider
 * Fortune 500 Professional Before/After Component
 * 
 * Features:
 * - Smooth drag interactions
 * - Touch support for mobile
 * - Magnifying glass effect
 * - Keyboard accessibility
 * - Auto-animate on load option
 */

class AdvancedImageComparison {
  constructor(element, options = {}) {
    this.container = element;
    this.options = {
      startPosition: parseFloat(element.dataset.comparisonPosition) || 50,
      vertical: element.dataset.comparisonDirection === 'vertical',
      animateOnLoad: element.dataset.comparisonAnimate === 'true',
      showMagnifier: element.dataset.comparisonMagnifier !== 'false',
      ...options
    };
    
    this.position = this.options.startPosition;
    this.isDragging = false;
    this.isAnimating = false;
    
    this.init();
  }
  
  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.setupKeyboardAccessibility();
    
    // Set initial position
    this.updatePosition(this.position);
    
    // Handle image loading
    this.waitForImages();
  }
  
  cacheElements() {
    this.wrapper = this.container.querySelector('.advanced-image-comparison-wrapper');
    this.imageBefore = this.container.querySelector('.comparison-image-before');
    this.imageAfter = this.container.querySelector('.comparison-image-after');
    this.divider = this.container.querySelector('.comparison-divider');
    this.progress = this.container.querySelector('.comparison-progress');
    this.loadingOverlay = this.container.querySelector('.comparison-loading');
    this.magnifier = this.container.querySelector('.comparison-magnifier');
    this.infoValue = this.container.querySelector('.comparison-info-value');
  }
  
  setupEventListeners() {
    // Mouse events
    this.divider.addEventListener('mousedown', (e) => this.startDrag(e));
    this.wrapper.addEventListener('mousedown', (e) => this.onWrapperClick(e));
    document.addEventListener('mousemove', (e) => this.onDrag(e));
    document.addEventListener('mouseup', () => this.endDrag());
    
    // Touch events
    this.divider.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
    this.wrapper.addEventListener('touchstart', (e) => this.onWrapperTouch(e), { passive: false });
    document.addEventListener('touchmove', (e) => this.onDrag(e), { passive: false });
    document.addEventListener('touchend', () => this.endDrag());
    
    // Prevent context menu on divider
    this.divider.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Magnifier follow mouse
    if (this.options.showMagnifier && this.magnifier) {
      this.wrapper.addEventListener('mousemove', (e) => this.updateMagnifier(e));
    }
  }
  
  setupKeyboardAccessibility() {
    this.divider.setAttribute('tabindex', '0');
    this.divider.setAttribute('role', 'slider');
    this.divider.setAttribute('aria-label', 'Image comparison slider');
    this.divider.setAttribute('aria-valuemin', '0');
    this.divider.setAttribute('aria-valuemax', '100');
    this.divider.setAttribute('aria-valuenow', this.position);
    
    this.divider.addEventListener('keydown', (e) => this.onKeyDown(e));
  }
  
  async waitForImages() {
    const images = this.container.querySelectorAll('.comparison-image');
    const loadPromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
      });
    });
    
    await Promise.all(loadPromises);
    
    // Hide loading overlay
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.add('loaded');
    }
    
    // Optional: Animate on load
    if (this.options.animateOnLoad && !this.hasAnimated) {
      this.hasAnimated = true;
      this.animateReveal();
    }
  }
  
  startDrag(e) {
    e.preventDefault();
    this.isDragging = true;
    this.divider.classList.add('dragging');
    this.imageBefore && this.imageBefore.classList.add('dragging');
    this.progress && this.progress.classList.add('dragging');
    this.container.style.cursor = this.options.vertical ? 'ns-resize' : 'ew-resize';
  }
  
  onDrag(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    
    const pos = this.getPositionFromEvent(e);
    this.updatePosition(pos);
  }
  
  onWrapperClick(e) {
    if (this.isDragging) return;
    const pos = this.getPositionFromEvent(e);
    this.animateToPosition(pos);
  }
  
  onWrapperTouch(e) {
    if (e.target.closest('.comparison-divider')) return;
    const pos = this.getPositionFromTouch(e);
    this.animateToPosition(pos);
  }
  
  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.divider.classList.remove('dragging');
    this.imageBefore && this.imageBefore.classList.remove('dragging');
    this.progress && this.progress.classList.remove('dragging');
    this.container.style.cursor = '';
  }
  
  getPositionFromEvent(e) {
    const rect = this.wrapper.getBoundingClientRect();
    if (this.options.vertical) {
      return ((e.clientY - rect.top) / rect.height) * 100;
    }
    return ((e.clientX - rect.left) / rect.width) * 100;
  }
  
  getPositionFromTouch(e) {
    const rect = this.wrapper.getBoundingClientRect();
    const touch = e.touches[0];
    if (this.options.vertical) {
      return ((touch.clientY - rect.top) / rect.height) * 100;
    }
    return ((touch.clientX - rect.left) / rect.width) * 100;
  }
  
  updatePosition(pos) {
    this.position = Math.max(0, Math.min(100, pos));
    
    // Update clip-path
    if (this.imageBefore) {
      if (this.options.vertical) {
        this.imageBefore.style.clipPath = `inset(0 0 ${100 - this.position}% 0)`;
      } else {
        this.imageBefore.style.clipPath = `inset(0 ${100 - this.position}% 0 0)`;
      }
    }
    
    // Update divider position
    if (this.divider) {
      this.divider.style.left = this.options.vertical ? '0' : `${this.position}%`;
      this.divider.style.top = this.options.vertical ? `${this.position}%` : '0';
    }
    
    // Update progress bar
    if (this.progress) {
      this.progress.style.width = `${this.position}%`;
    }
    
    // Update ARIA
    this.divider.setAttribute('aria-valuenow', Math.round(this.position));
    
    // Update info text
    if (this.infoValue) {
      this.infoValue.textContent = `${Math.round(this.position)}%`;
    }
    
    // Trigger event
    this.container.dispatchEvent(new CustomEvent('comparisonUpdate', {
      detail: { position: this.position }
    }));
  }
  
  animateToPosition(targetPos) {
    const startPos = this.position;
    const diff = targetPos - startPos;
    const duration = 300;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      this.updatePosition(startPos + diff * easeOutCubic);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  animateReveal() {
    this.isAnimating = true;
    this.container.classList.add('animate-on-load');
    
    setTimeout(() => {
      this.container.classList.remove('animate-on-load');
      this.isAnimating = false;
    }, 2000);
  }
  
  updateMagnifier(e) {
    if (!this.magnifier || !this.imageBefore) return;
    
    const rect = this.wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Position magnifier
    this.magnifier.style.left = `${x - 75}px`;
    this.magnifier.style.top = `${y - 75}px`;
    
    // Update magnified image position
    const magnifierImg = this.magnifier.querySelector('.comparison-magnifier-image');
    if (magnifierImg) {
      const zoomLevel = 2;
      magnifierImg.style.width = `${rect.width * zoomLevel}px`;
      magnifierImg.style.left = `${-x * (zoomLevel - 1)}px`;
      magnifierImg.style.top = `${-y * (zoomLevel - 1)}px`;
    }
  }
  
  onKeyDown(e) {
    const step = e.shiftKey ? 10 : 5;
    
    switch(e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        this.animateToPosition(this.position - step);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        this.animateToPosition(this.position + step);
        break;
      case 'Home':
        e.preventDefault();
        this.animateToPosition(0);
        break;
      case 'End':
        e.preventDefault();
        this.animateToPosition(100);
        break;
    }
  }
  
  destroy() {
    // Remove event listeners
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.endDrag);
    document.removeEventListener('touchmove', this.onDrag);
    document.removeEventListener('touchend', this.endDrag);
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.advanced-image-comparison').forEach(el => {
    new AdvancedImageComparison(el);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedImageComparison;
}
