/**
 * BuildBridge Before/After Image Slider
 * Interactive comparison slider for showcasing renovations and transformations
 * Version: 1.0.0
 */

class BeforeAfterSlider {
  constructor(element, options = {}) {
    this.container = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.container) return;
    
    this.options = {
      beforeImage: options.beforeImage || this.container.dataset.before,
      afterImage: options.afterImage || this.container.dataset.after,
      beforeLabel: options.beforeLabel || this.container.dataset.beforeLabel || 'Before',
      afterLabel: options.afterLabel || this.container.dataset.afterLabel || 'After',
      startPosition: options.startPosition || parseFloat(this.container.dataset.start) || 50,
      orientation: options.orientation || this.container.dataset.orientation || 'horizontal',
      ...options
    };
    
    this.isDragging = false;
    this.position = this.options.startPosition;
    this.touchStartX = 0;
    this.touchStartY = 0;
    
    this.init();
  }
  
  init() {
    this.createStructure();
    this.bindEvents();
    this.setPosition(this.position);
    this.addAccessibility();
  }
  
  createStructure() {
    const { beforeImage, afterImage, beforeLabel, afterLabel, orientation } = this.options;
    
    this.container.className = `before-after-slider before-after-${orientation}`;
    this.container.innerHTML = `
      <div class="before-after-wrapper">
        <div class="before-after-after">
          <img src="${afterImage}" alt="${afterLabel}" loading="lazy">
          <span class="before-after-label before-after-label-after">${afterLabel}</span>
        </div>
        <div class="before-after-before" style="clip-path: inset(0 ${100 - this.position}% 0 0);">
          <img src="${beforeImage}" alt="${beforeLabel}" loading="lazy">
          <span class="before-after-label before-after-label-before">${beforeLabel}</span>
        </div>
        <div class="before-after-handle" style="left: ${this.position}%" role="slider" 
             aria-valuemin="0" aria-valuemax="100" aria-valuenow="${this.position}" 
             aria-label="Drag to compare before and after images" tabindex="0">
          <div class="before-after-handle-line"></div>
          <div class="before-after-handle-arrows">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </div>
    `;
    
    this.wrapper = this.container.querySelector('.before-after-wrapper');
    this.beforeLayer = this.container.querySelector('.before-after-before');
    this.handle = this.container.querySelector('.before-after-handle');
  }
  
  bindEvents() {
    // Mouse events
    this.handle.addEventListener('mousedown', (e) => this.startDrag(e));
    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('mouseup', () => this.endDrag());
    
    // Touch events
    this.handle.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
    document.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
    document.addEventListener('touchend', () => this.endDrag());
    
    // Click on container to jump
    this.container.addEventListener('click', (e) => {
      if (e.target !== this.handle && !this.handle.contains(e.target)) {
        this.jumpToPosition(e);
      }
    });
    
    // Keyboard navigation
    this.handle.addEventListener('keydown', (e) => this.handleKeyboard(e));
    
    // Prevent image drag
    this.container.querySelectorAll('img').forEach(img => {
      img.addEventListener('dragstart', (e) => e.preventDefault());
    });
  }
  
  startDrag(e) {
    this.isDragging = true;
    this.handle.classList.add('dragging');
    this.container.classList.add('dragging');
    
    if (e.type === 'touchstart') {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }
    
    e.preventDefault();
  }
  
  drag(e) {
    if (!this.isDragging) return;
    
    const rect = this.wrapper.getBoundingClientRect();
    let clientX, clientY;
    
    if (e.type === 'touchmove') {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      // Prevent scrolling while dragging
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    let percentage;
    if (this.options.orientation === 'vertical') {
      percentage = ((clientY - rect.top) / rect.height) * 100;
    } else {
      percentage = ((clientX - rect.left) / rect.width) * 100;
    }
    
    this.setPosition(Math.max(0, Math.min(100, percentage)));
  }
  
  endDrag() {
    this.isDragging = false;
    this.handle.classList.remove('dragging');
    this.container.classList.remove('dragging');
  }
  
  jumpToPosition(e) {
    const rect = this.wrapper.getBoundingClientRect();
    let percentage;
    
    if (this.options.orientation === 'vertical') {
      percentage = ((e.clientY - rect.top) / rect.height) * 100;
    } else {
      percentage = ((e.clientX - rect.left) / rect.width) * 100;
    }
    
    this.animateToPosition(Math.max(0, Math.min(100, percentage)));
  }
  
  setPosition(percentage) {
    this.position = percentage;
    
    if (this.options.orientation === 'vertical') {
      this.beforeLayer.style.clipPath = `inset(${100 - percentage}% 0 0 0)`;
      this.handle.style.top = `${percentage}%`;
      this.handle.style.left = '50%';
    } else {
      this.beforeLayer.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
      this.handle.style.left = `${percentage}%`;
      this.handle.style.top = '50%';
    }
    
    // Update ARIA
    this.handle.setAttribute('aria-valuenow', Math.round(percentage));
  }
  
  animateToPosition(targetPercentage) {
    const startPercentage = this.position;
    const startTime = performance.now();
    const duration = 300;
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      
      const currentPercentage = startPercentage + (targetPercentage - startPercentage) * eased;
      this.setPosition(currentPercentage);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  handleKeyboard(e) {
    const step = 5;
    let newPosition = this.position;
    
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        newPosition = Math.max(0, this.position - step);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        newPosition = Math.min(100, this.position + step);
        break;
      case 'Home':
        newPosition = 0;
        break;
      case 'End':
        newPosition = 100;
        break;
      default:
        return;
    }
    
    e.preventDefault();
    this.animateToPosition(newPosition);
  }
  
  addAccessibility() {
    // Ensure images have proper alt text
    const images = this.container.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt) {
        img.alt = 'Comparison image';
      }
    });
  }
  
  destroy() {
    this.container.innerHTML = '';
    this.container.className = '';
  }
}

// Auto-initialize sliders with data attributes
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-before-after]').forEach(el => {
    new BeforeAfterSlider(el);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BeforeAfterSlider;
}
