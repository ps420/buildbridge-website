/**
 * Image Comparison Slider Pro - v90.0
 * Before/After Project Showcase
 * Fortune 500 Quality Interactive Component
 */

class ImageComparisonSlider {
  constructor(element, options = {}) {
    this.container = element;
    this.options = {
      startPosition: 50,
      autoPlay: false,
      autoPlayDelay: 3000,
      ...options
    };
    
    this.isDragging = false;
    this.position = this.options.startPosition;
    this.touchId = null;
    
    this.init();
  }
  
  init() {
    this.createElements();
    this.cacheElements();
    this.bindEvents();
    this.setPosition(this.position);
    
    // Reveal animation
    setTimeout(() => {
      this.container.classList.add('revealed');
    }, 100);
    
    // Auto play if enabled
    if (this.options.autoPlay) {
      this.startAutoPlay();
    }
  }
  
  createElements() {
    // Add drag class handler
    this.container.classList.add('comparison-container');
    
    // Create hint if not exists
    if (!this.container.querySelector('.comparison-hint')) {
      const hint = document.createElement('div');
      hint.className = 'comparison-hint';
      hint.innerHTML = '<span class="comparison-hint-icon">↔</span> Drag to compare';
      this.container.querySelector('.comparison-images').appendChild(hint);
    }
    
    // Create ripple element
    if (!this.container.querySelector('.comparison-slider-ripple')) {
      const ripple = document.createElement('div');
      ripple.className = 'comparison-slider-ripple';
      this.container.querySelector('.comparison-slider').appendChild(ripple);
    }
  }
  
  cacheElements() {
    this.imagesWrapper = this.container.querySelector('.comparison-images');
    this.afterImage = this.container.querySelector('.comparison-after');
    this.slider = this.container.querySelector('.comparison-slider');
    this.hint = this.container.querySelector('.comparison-hint');
  }
  
  bindEvents() {
    // Mouse events
    this.slider.addEventListener('mousedown', this.handleStart.bind(this));
    this.container.addEventListener('mousemove', this.handleMove.bind(this));
    document.addEventListener('mouseup', this.handleEnd.bind(this));
    
    // Touch events
    this.slider.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleEnd.bind(this));
    
    // Container click
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.comparison-slider')) return;
      this.handleContainerClick(e);
    });
    
    // Keyboard accessibility
    this.slider.setAttribute('tabindex', '0');
    this.slider.setAttribute('role', 'slider');
    this.slider.setAttribute('aria-valuemin', '0');
    this.slider.setAttribute('aria-valuemax', '100');
    this.slider.setAttribute('aria-valuenow', this.position);
    this.slider.setAttribute('aria-label', 'Image comparison slider');
    
    this.slider.addEventListener('keydown', (e) => {
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
  
  handleStart(e) {
    e.preventDefault();
    this.isDragging = true;
    this.container.classList.add('dragging');
    this.stopAutoPlay();
    
    if (this.hint) {
      this.container.classList.add('interacted');
    }
  }
  
  handleTouchStart(e) {
    if (this.touchId !== null) return;
    
    const touch = e.touches[0];
    this.touchId = touch.identifier;
    this.isDragging = true;
    this.container.classList.add('dragging');
    this.stopAutoPlay();
    
    if (this.hint) {
      this.container.classList.add('interacted');
    }
  }
  
  handleMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    this.setPosition(Math.max(0, Math.min(100, percentage)));
  }
  
  handleTouchMove(e) {
    if (!this.isDragging || this.touchId === null) return;
    
    const touch = Array.from(e.touches).find(t => t.identifier === this.touchId);
    if (!touch) return;
    
    e.preventDefault();
    
    const rect = this.container.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    this.setPosition(Math.max(0, Math.min(100, percentage)));
  }
  
  handleEnd() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.touchId = null;
    this.container.classList.remove('dragging');
    
    // Dispatch event
    this.container.dispatchEvent(new CustomEvent('comparison:change', {
      detail: { position: this.position }
    }));
  }
  
  handleContainerClick(e) {
    if (this.isDragging) return;
    
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    this.setPosition(percentage);
    this.stopAutoPlay();
    
    if (this.hint) {
      this.container.classList.add('interacted');
    }
  }
  
  setPosition(percentage) {
    this.position = percentage;
    
    // Update clip-path for after image
    this.afterImage.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
    
    // Update slider position
    this.slider.style.left = `${percentage}%`;
    
    // Update aria
    this.slider.setAttribute('aria-valuenow', Math.round(percentage));
    
    // Dispatch event
    this.container.dispatchEvent(new CustomEvent('comparison:update', {
      detail: { position: percentage }
    }));
  }
  
  startAutoPlay() {
    if (this.autoPlayInterval) return;
    
    this.container.classList.add('auto-play');
    
    // Animate between positions
    let direction = 1;
    this.autoPlayInterval = setInterval(() => {
      const newPos = direction === 1 ? 70 : 30;
      this.setPosition(newPos);
      direction *= -1;
    }, this.options.autoPlayDelay);
  }
  
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
    this.container.classList.remove('auto-play');
  }
  
  destroy() {
    this.stopAutoPlay();
    // Event listeners are automatically cleaned up when element is removed
  }
}

// Gallery Manager
class ComparisonGallery {
  constructor(container) {
    this.container = container;
    this.sliders = [];
    this.currentIndex = 0;
    
    this.init();
  }
  
  init() {
    const sliders = this.container.querySelectorAll('.comparison-container');
    sliders.forEach((slider, index) => {
      const instance = new ImageComparisonSlider(slider, {
        autoPlay: index === 0
      });
      this.sliders.push(instance);
      
      // Hide all except first initially
      if (index !== 0) {
        slider.style.display = 'none';
      }
    });
    
    this.createNavigation();
    this.bindKeyboardNav();
  }
  
  createNavigation() {
    const nav = this.container.querySelector('.comparison-nav');
    if (!nav) return;
    
    const buttons = nav.querySelectorAll('.comparison-nav-btn');
    buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => this.showSlide(index));
    });
  }
  
  showSlide(index) {
    if (index === this.currentIndex) return;
    
    const sliders = this.container.querySelectorAll('.comparison-container');
    const buttons = this.container.querySelectorAll('.comparison-nav-btn');
    
    // Hide current
    sliders[this.currentIndex].style.display = 'none';
    this.sliders[this.currentIndex].stopAutoPlay();
    
    // Show new
    sliders[index].style.display = 'block';
    sliders[index].classList.add('revealed');
    
    // Update nav
    buttons.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });
    
    this.currentIndex = index;
    
    // Dispatch event
    this.container.dispatchEvent(new CustomEvent('gallery:change', {
      detail: { index }
    }));
  }
  
  bindKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        const newIndex = Math.max(0, this.currentIndex - 1);
        this.showSlide(newIndex);
      } else if (e.key === 'ArrowRight') {
        const newIndex = Math.min(this.sliders.length - 1, this.currentIndex + 1);
        this.showSlide(newIndex);
      }
    });
  }
}

// Intersection Observer for reveal animations
const initComparisonReveal = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  });
  
  document.querySelectorAll('.comparison-container').forEach(el => {
    observer.observe(el);
  });
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initialize individual sliders
  document.querySelectorAll('.comparison-container').forEach(container => {
    if (!container.dataset.sliderInitialized) {
      new ImageComparisonSlider(container);
      container.dataset.sliderInitialized = 'true';
    }
  });
  
  // Initialize galleries
  document.querySelectorAll('.comparison-gallery').forEach(gallery => {
    new ComparisonGallery(gallery);
  });
  
  // Initialize reveal animations
  initComparisonReveal();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ImageComparisonSlider, ComparisonGallery };
}
