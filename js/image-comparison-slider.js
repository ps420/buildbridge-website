/**
 * v65.4: Image Comparison Slider
 * Interactive before/after comparison slider
 * Fortune 500 Quality - Engaging Visual Tool
 */

class ImageComparisonSlider {
  constructor(element, options = {}) {
    this.container = typeof element === 'string' ? document.querySelector(element) : element;
    this.options = {
      startPosition: options.startPosition || 50,
      direction: options.direction || 'horizontal',
      labels: options.labels || { before: 'Before', after: 'After' },
      showLabels: options.showLabels !== false,
      ...options
    };
    
    this.isDragging = false;
    this.position = this.options.startPosition;
    
    if (this.container) {
      this.init();
    }
  }
  
  init() {
    this.parseImages();
    this.createStructure();
    this.createHandle();
    this.bindEvents();
    this.setPosition(this.options.startPosition);
  }
  
  parseImages() {
    const beforeSrc = this.container.dataset.before;
    const afterSrc = this.container.dataset.after;
    
    this.images = {
      before: beforeSrc || this.container.querySelector('img:first-child')?.src,
      after: afterSrc || this.container.querySelector('img:last-child')?.src
    };
    
    this.labels = {
      before: this.container.dataset.beforeLabel || this.options.labels.before,
      after: this.container.dataset.afterLabel || this.options.labels.after
    };
  }
  
  createStructure() {
    this.container.classList.add('comparison-slider');
    this.container.innerHTML = '';
    
    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'comparison-slider-image';
    
    // Before image (background)
    const beforeWrapper = document.createElement('div');
    beforeWrapper.className = 'comparison-slider-before';
    beforeWrapper.dataset.label = this.labels.before;
    
    const beforeImg = document.createElement('img');
    beforeImg.src = this.images.before;
    beforeImg.alt = this.labels.before;
    beforeWrapper.appendChild(beforeImg);
    
    // After image (foreground - clipped)
    this.afterWrapper = document.createElement('div');
    this.afterWrapper.className = 'comparison-slider-after';
    this.afterWrapper.dataset.label = this.labels.after;
    
    const afterImg = document.createElement('img');
    afterImg.src = this.images.after;
    afterImg.alt = this.labels.after;
    this.afterWrapper.appendChild(afterImg);
    
    imageContainer.appendChild(beforeWrapper);
    imageContainer.appendChild(this.afterWrapper);
    this.container.appendChild(imageContainer);
    
    // Accessibility: Add range input
    this.rangeInput = document.createElement('input');
    this.rangeInput.type = 'range';
    this.rangeInput.min = '0';
    this.rangeInput.max = '100';
    this.rangeInput.value = this.options.startPosition;
    this.rangeInput.className = 'comparison-slider-input';
    this.rangeInput.setAttribute('aria-label', 'Image comparison slider');
    this.container.appendChild(this.rangeInput);
  }
  
  createHandle() {
    this.handle = document.createElement('div');
    this.handle.className = 'comparison-slider-handle';
    this.handle.setAttribute('role', 'slider');
    this.handle.setAttribute('aria-valuemin', '0');
    this.handle.setAttribute('aria-valuemax', '100');
    this.handle.setAttribute('aria-valuenow', this.options.startPosition);
    this.handle.setAttribute('aria-label', 'Drag to compare images');
    
    const button = document.createElement('div');
    button.className = 'comparison-slider-button';
    button.innerHTML = `
      <span class="sr-only">Drag to compare</span>
    `;
    
    this.handle.appendChild(button);
    this.container.appendChild(this.handle);
    
    // Hide from screen readers (use range input instead)
    this.handle.setAttribute('aria-hidden', 'true');
  }
  
  bindEvents() {
    // Mouse events
    this.handle.addEventListener('mousedown', (e) => this.startDrag(e));
    document.addEventListener('mousemove', (e) => this.onDrag(e));
    document.addEventListener('mouseup', () => this.endDrag());
    
    // Touch events
    this.handle.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]), { passive: true });
    document.addEventListener('touchmove', (e) => this.onDrag(e.touches[0]), { passive: true });
    document.addEventListener('touchend', () => this.endDrag());
    
    // Range input for accessibility
    this.rangeInput.addEventListener('input', (e) => {
      this.setPosition(parseFloat(e.target.value));
    });
    
    // Click on container to jump
    this.container.addEventListener('click', (e) => {
      if (e.target === this.handle || this.handle.contains(e.target)) return;
      
      const rect = this.container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      
      this.animateTo(percentage);
    });
    
    // Keyboard navigation
    this.container.addEventListener('keydown', (e) => {
      let newPosition = this.position;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          newPosition = Math.max(0, this.position - 5);
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          newPosition = Math.min(100, this.position + 5);
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
      this.animateTo(newPosition);
    });
  }
  
  startDrag(e) {
    this.isDragging = true;
    this.container.classList.add('dragging');
    e.preventDefault();
  }
  
  onDrag(e) {
    if (!this.isDragging) return;
    
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    this.setPosition(percentage);
  }
  
  endDrag() {
    this.isDragging = false;
    this.container.classList.remove('dragging');
  }
  
  setPosition(percentage) {
    this.position = percentage;
    
    // Update after wrapper width
    this.afterWrapper.style.width = `${percentage}%`;
    
    // Update handle position
    this.handle.style.left = `${percentage}%`;
    
    // Update range input
    this.rangeInput.value = percentage;
    
    // Update ARIA
    this.handle.setAttribute('aria-valuenow', Math.round(percentage));
    
    // Trigger event
    this.container.dispatchEvent(new CustomEvent('comparison:change', {
      detail: { position: percentage }
    }));
  }
  
  animateTo(targetPosition) {
    this.container.classList.add('animating');
    
    const startPosition = this.position;
    const distance = targetPosition - startPosition;
    const duration = 300;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentPosition = startPosition + distance * easeProgress;
      
      this.setPosition(currentPosition);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.container.classList.remove('animating');
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  // Public methods
  setBeforeImage(src) {
    const img = this.container.querySelector('.comparison-slider-before img');
    if (img) img.src = src;
  }
  
  setAfterImage(src) {
    const img = this.container.querySelector('.comparison-slider-after img');
    if (img) img.src = src;
  }
  
  reset() {
    this.animateTo(this.options.startPosition);
  }
  
  destroy() {
    // Clean up event listeners
    this.handle.removeEventListener('mousedown', this.startDrag);
    this.container.removeEventListener('click', this.handleClick);
    this.rangeInput.removeEventListener('input', this.handleInput);
  }
}

// Auto-initialize sliders
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.before-after-slider, .comparison-slider').forEach(el => {
    new ImageComparisonSlider(el, {
      startPosition: 50,
      labels: {
        before: el.dataset.beforeLabel || 'Before',
        after: el.dataset.afterLabel || 'After'
      }
    });
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageComparisonSlider;
}
