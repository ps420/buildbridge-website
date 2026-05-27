/**
 * v31.0 - Image Comparison Slider
 * Interactive before/after image comparison component
 */

(function() {
  'use strict';

  class ImageComparisonSlider {
    constructor(element) {
      this.slider = element;
      this.handle = element.querySelector('.comparison-slider-handle');
      this.afterImage = element.querySelector('.comparison-image.after');
      this.beforeLabel = element.querySelector('.comparison-label.before');
      this.afterLabel = element.querySelector('.comparison-label.after');
      
      this.isDragging = false;
      this.position = 50; // Default 50%
      
      this.init();
    }

    init() {
      if (!this.handle || !this.afterImage) return;

      this.bindEvents();
      this.setPosition(this.position);
    }

    bindEvents() {
      // Mouse events
      this.slider.addEventListener('mousedown', (e) => this.startDrag(e));
      document.addEventListener('mousemove', (e) => this.onDrag(e));
      document.addEventListener('mouseup', () => this.endDrag());

      // Touch events
      this.slider.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]), { passive: true });
      document.addEventListener('touchmove', (e) => this.onDrag(e.touches[0]), { passive: true });
      document.addEventListener('touchend', () => this.endDrag());

      // Click to jump
      this.slider.addEventListener('click', (e) => {
        if (e.target === this.handle || e.target.closest('.comparison-slider-handle')) return;
        this.updatePosition(e);
      });

      // Keyboard accessibility
      this.handle.setAttribute('tabindex', '0');
      this.handle.setAttribute('role', 'slider');
      this.handle.setAttribute('aria-label', 'Image comparison slider');
      this.handle.setAttribute('aria-valuemin', '0');
      this.handle.setAttribute('aria-valuemax', '100');
      this.handle.setAttribute('aria-valuenow', this.position);

      this.handle.addEventListener('keydown', (e) => {
        switch(e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            this.setPosition(Math.max(0, this.position - 5));
            break;
          case 'ArrowRight':
            e.preventDefault();
            this.setPosition(Math.min(100, this.position + 5));
            break;
          case 'Home':
            e.preventDefault();
            this.setPosition(0);
            break;
          case 'End':
            e.preventDefault();
            this.setPosition(100);
            break;
        }
      });
    }

    startDrag(e) {
      this.isDragging = true;
      this.slider.style.cursor = 'grabbing';
      this.handle.style.transition = 'none';
      this.afterImage.style.transition = 'none';
    }

    onDrag(e) {
      if (!this.isDragging) return;
      this.updatePosition(e);
    }

    endDrag() {
      this.isDragging = false;
      this.slider.style.cursor = 'col-resize';
      this.handle.style.transition = '';
      this.afterImage.style.transition = '';
    }

    updatePosition(e) {
      const rect = this.slider.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      this.setPosition(percentage);
    }

    setPosition(percentage) {
      this.position = percentage;
      
      // Update handle position
      if (this.handle) {
        this.handle.style.left = `${percentage}%`;
        this.handle.setAttribute('aria-valuenow', Math.round(percentage));
      }
      
      // Update clip path for after image
      if (this.afterImage) {
        this.afterImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
      }

      // Fade labels based on position
      if (this.beforeLabel) {
        this.beforeLabel.style.opacity = percentage > 80 ? '0' : '1';
      }
      if (this.afterLabel) {
        this.afterLabel.style.opacity = percentage < 20 ? '0' : '1';
      }
    }
  }

  // Initialize all comparison sliders on page
  function initSliders() {
    document.querySelectorAll('.comparison-slider').forEach(slider => {
      new ImageComparisonSlider(slider);
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSliders);
  } else {
    initSliders();
  }

  // Expose to global scope
  window.ImageComparisonSlider = ImageComparisonSlider;
})();
