/**
 * Advanced Image Comparison Slider v122.0
 * Fortune 500 Quality Before/After Component
 */

(function() {
  'use strict';

  class ImageComparison {
    constructor(container, options = {}) {
      this.container = container;
      this.options = {
        defaultPosition: options.defaultPosition || 50,
        vertical: options.vertical || false,
        ...options
      };
      
      this.isDragging = false;
      this.splitPosition = this.options.defaultPosition;
      
      this.init();
    }

    init() {
      // Get images
      this.beforeImage = this.container.querySelector('.comparison-image.before');
      this.afterImage = this.container.querySelector('.comparison-image.after');
      
      if (!this.beforeImage || !this.afterImage) return;
      
      // Create slider if not exists
      this.slider = this.container.querySelector('.comparison-slider');
      if (!this.slider) {
        this.slider = document.createElement('div');
        this.slider.className = 'comparison-slider';
        this.slider.innerHTML = `
          <div class="comparison-handle">
            <div class="comparison-handle-icon"></div>
          </div>
        `;
        this.container.appendChild(this.slider);
      }
      
      // Add vertical class if needed
      if (this.options.vertical) {
        this.container.classList.add('vertical');
      }
      
      // Setup initial position
      this.updatePosition(this.splitPosition);
      
      // Bind events
      this.bindEvents();
    }

    bindEvents() {
      // Mouse events
      this.slider.addEventListener('mousedown', this.handleStart.bind(this));
      document.addEventListener('mousemove', this.handleMove.bind(this));
      document.addEventListener('mouseup', this.handleEnd.bind(this));
      
      // Touch events
      this.slider.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
      document.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
      document.addEventListener('touchend', this.handleEnd.bind(this));
      
      // Click on container to jump
      this.container.addEventListener('click', (e) => {
        if (e.target === this.slider || this.slider.contains(e.target)) return;
        this.setPositionFromEvent(e);
      });

      // Prevent image dragging
      this.container.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', e => e.preventDefault());
      });
    }

    handleStart(e) {
      e.preventDefault();
      this.isDragging = true;
      this.slider.classList.add('dragging');
      this.container.classList.add('dragging');
    }

    handleMove(e) {
      if (!this.isDragging) return;
      e.preventDefault();
      this.setPositionFromEvent(e);
    }

    handleEnd() {
      this.isDragging = false;
      this.slider.classList.remove('dragging');
      this.container.classList.remove('dragging');
    }

    setPositionFromEvent(e) {
      const rect = this.container.getBoundingClientRect();
      let position;
      
      if (this.options.vertical) {
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        position = ((clientY - rect.top) / rect.height) * 100;
      } else {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        position = ((clientX - rect.left) / rect.width) * 100;
      }
      
      this.updatePosition(Math.max(0, Math.min(100, position)));
    }

    updatePosition(position) {
      this.splitPosition = position;
      
      const cssVar = this.options.vertical ? '--split-position-vertical' : '--split-position';
      this.container.style.setProperty(cssVar, `${position}%`);
      
      // Update clip path for before image
      if (this.options.vertical) {
        this.beforeImage.style.clipPath = `inset(${position}% 0 0 0)`;
      } else {
        this.beforeImage.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
      }
      
      // Move slider
      if (this.options.vertical) {
        this.slider.style.top = `${position}%`;
        this.slider.style.left = '0';
      } else {
        this.slider.style.left = `${position}%`;
        this.slider.style.top = '0';
      }
    }

    // Public API
    setPosition(position) {
      this.updatePosition(Math.max(0, Math.min(100, position)));
    }

    getPosition() {
      return this.splitPosition;
    }

    reset() {
      this.updatePosition(this.options.defaultPosition);
    }
  }

  // Carousel of Comparisons
  class ComparisonCarousel {
    constructor(container) {
      this.container = container;
      this.items = container.querySelectorAll('.advanced-image-comparison');
      this.currentIndex = 0;
      
      this.init();
    }

    init() {
      // Hide all but first
      this.items.forEach((item, index) => {
        item.style.display = index === 0 ? 'block' : 'none';
      });
      
      // Create nav dots
      this.createNav();
    }

    createNav() {
      const nav = document.createElement('div');
      nav.className = 'comparison-carousel-nav';
      
      this.items.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'comparison-carousel-dot' + (index === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `View comparison ${index + 1}`);
        dot.addEventListener('click', () => this.goTo(index));
        nav.appendChild(dot);
      });
      
      this.container.appendChild(nav);
      this.dots = nav.querySelectorAll('.comparison-carousel-dot');
    }

    goTo(index) {
      // Fade out current
      this.items[this.currentIndex].style.opacity = '0';
      
      setTimeout(() => {
        this.items[this.currentIndex].style.display = 'none';
        this.items[index].style.display = 'block';
        this.items[index].style.opacity = '0';
        
        // Update dots
        this.dots[this.currentIndex].classList.remove('active');
        this.dots[index].classList.add('active');
        
        this.currentIndex = index;
        
        // Fade in new
        requestAnimationFrame(() => {
          this.items[index].style.transition = 'opacity 0.4s ease';
          this.items[index].style.opacity = '1';
        });
      }, 300);
    }

    next() {
      const nextIndex = (this.currentIndex + 1) % this.items.length;
      this.goTo(nextIndex);
    }

    prev() {
      const prevIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
      this.goTo(prevIndex);
    }
  }

  // Initialize on DOM ready
  function init() {
    // Single comparisons
    document.querySelectorAll('.advanced-image-comparison:not(.carousel-item)').forEach(el => {
      const options = {
        defaultPosition: parseInt(el.dataset.defaultPosition) || 50,
        vertical: el.dataset.vertical === 'true'
      };
      new ImageComparison(el, options);
    });
    
    // Carousels
    document.querySelectorAll('.comparison-carousel').forEach(el => {
      new ComparisonCarousel(el);
    });
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose globally
  window.ImageComparison = ImageComparison;
  window.ComparisonCarousel = ComparisonCarousel;
})();
