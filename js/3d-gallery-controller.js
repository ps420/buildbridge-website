/**
 * BuildBridge - 3D Gallery Controller v17.3
 * Controls 3D carousel, card stack, and coverflow galleries
 * Fortune 500 Quality Interactive Gallery System
 */

(function() {
  'use strict';

  // 3D Carousel Controller
  class Carousel3D {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
      
      if (!this.container) return;
      
      this.options = {
        autoRotate: options.autoRotate || false,
        autoRotateSpeed: options.autoRotateSpeed || 5000,
        draggable: options.draggable !== false,
        ...options
      };
      
      this.items = this.container.querySelectorAll('.carousel-3d__item');
      this.currentIndex = 0;
      this.rotation = 0;
      this.isDragging = false;
      this.startX = 0;
      this.autoRotateInterval = null;
      
      this.init();
    }
    
    init() {
      this.setupEventListeners();
      this.updatePositions();
      
      if (this.options.autoRotate) {
        this.startAutoRotate();
      }
    }
    
    setupEventListeners() {
      if (this.options.draggable) {
        // Touch events
        this.container.addEventListener('touchstart', (e) => this.handleDragStart(e.touches[0].clientX));
        this.container.addEventListener('touchmove', (e) => this.handleDragMove(e.touches[0].clientX));
        this.container.addEventListener('touchend', () => this.handleDragEnd());
        
        // Mouse events
        this.container.addEventListener('mousedown', (e) => this.handleDragStart(e.clientX));
        this.container.addEventListener('mousemove', (e) => this.handleDragMove(e.clientX));
        this.container.addEventListener('mouseup', () => this.handleDragEnd());
        this.container.addEventListener('mouseleave', () => this.handleDragEnd());
      }
      
      // Item click
      this.items.forEach((item, index) => {
        item.addEventListener('click', () => this.goTo(index));
      });
      
      // Pause auto-rotate on hover
      this.container.addEventListener('mouseenter', () => this.stopAutoRotate());
      this.container.addEventListener('mouseleave', () => {
        if (this.options.autoRotate) this.startAutoRotate();
      });
    }
    
    handleDragStart(x) {
      this.isDragging = true;
      this.startX = x;
      this.stopAutoRotate();
    }
    
    handleDragMove(x) {
      if (!this.isDragging) return;
      
      const diff = x - this.startX;
      const rotation = (diff / this.container.offsetWidth) * 72;
      this.container.querySelector('.carousel-3d').style.transform = 
        `rotateY(${this.rotation + rotation}deg)`;
    }
    
    handleDragEnd() {
      if (!this.isDragging) return;
      
      this.isDragging = false;
      const diff = this.startX - (event.changedTouches?.[0]?.clientX || event.clientX);
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      } else {
        this.updatePositions();
      }
      
      if (this.options.autoRotate) {
        this.startAutoRotate();
      }
    }
    
    updatePositions() {
      const angleStep = 360 / this.items.length;
      this.rotation = -this.currentIndex * angleStep;
      
      const carousel = this.container.querySelector('.carousel-3d');
      if (carousel) {
        carousel.style.transform = `rotateY(${this.rotation}deg)`;
      }
      
      this.items.forEach((item, index) => {
        item.classList.toggle('active', index === this.currentIndex);
      });
    }
    
    next() {
      this.currentIndex = (this.currentIndex + 1) % this.items.length;
      this.updatePositions();
    }
    
    prev() {
      this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
      this.updatePositions();
    }
    
    goTo(index) {
      this.currentIndex = index;
      this.updatePositions();
    }
    
    startAutoRotate() {
      this.stopAutoRotate();
      this.autoRotateInterval = setInterval(() => this.next(), this.options.autoRotateSpeed);
    }
    
    stopAutoRotate() {
      if (this.autoRotateInterval) {
        clearInterval(this.autoRotateInterval);
        this.autoRotateInterval = null;
      }
    }
    
    destroy() {
      this.stopAutoRotate();
    }
  }

  // 3D Card Stack Controller
  class CardStack3D {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
      
      if (!this.container) return;
      
      this.options = {
        threshold: options.threshold || 100,
        ...options
      };
      
      this.cards = Array.from(this.container.querySelectorAll('.card-stack-3d__card'));
      this.currentIndex = 0;
      this.isDragging = false;
      this.startX = 0;
      this.currentX = 0;
      
      this.init();
    }
    
    init() {
      this.setupEventListeners();
    }
    
    setupEventListeners() {
      this.cards.forEach((card, index) => {
        // Touch events
        card.addEventListener('touchstart', (e) => this.handleDragStart(e, index));
        card.addEventListener('touchmove', (e) => this.handleDragMove(e));
        card.addEventListener('touchend', (e) => this.handleDragEnd(e));
        
        // Mouse events
        card.addEventListener('mousedown', (e) => this.handleDragStart(e, index));
        card.addEventListener('mousemove', (e) => this.handleDragMove(e));
        card.addEventListener('mouseup', (e) => this.handleDragEnd(e));
        card.addEventListener('mouseleave', (e) => this.handleDragEnd(e));
      });
    }
    
    handleDragStart(e, index) {
      if (index !== this.currentIndex) return;
      
      this.isDragging = true;
      this.startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      this.cards[index].style.transition = 'none';
    }
    
    handleDragMove(e) {
      if (!this.isDragging) return;
      
      e.preventDefault();
      this.currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      
      const diff = this.currentX - this.startX;
      const rotation = (diff / this.container.offsetWidth) * 30;
      
      this.cards[this.currentIndex].style.transform = 
        `translateX(${diff}px) rotateZ(${rotation}deg)`;
    }
    
    handleDragEnd(e) {
      if (!this.isDragging) return;
      
      this.isDragging = false;
      const diff = this.currentX - this.startX;
      const card = this.cards[this.currentIndex];
      
      card.style.transition = '';
      
      if (Math.abs(diff) > this.options.threshold) {
        // Swipe away
        const direction = diff > 0 ? 'right' : 'left';
        card.classList.add(`swiping-${direction}`);
        
        setTimeout(() => {
          card.classList.remove(`swiping-${direction}`);
          this.moveToBack();
        }, 600);
      } else {
        // Snap back
        card.style.transform = '';
      }
    }
    
    moveToBack() {
      const card = this.cards.shift();
      this.cards.push(card);
      
      // Reset styles
      card.style.transform = '';
      card.classList.remove('swiping-left', 'swiping-right');
      
      // Update z-index and positions
      this.updateStack();
      
      // Trigger event
      this.container.dispatchEvent(new CustomEvent('cardchanged', {
        detail: { currentIndex: this.currentIndex }
      }));
    }
    
    updateStack() {
      this.cards.forEach((card, index) => {
        const zIndex = this.cards.length - index;
        const scale = 1 - (index * 0.05);
        const translateZ = -index * 50;
        const translateY = index * 10;
        const rotate = [ -2, 2, -1, 3, -2 ][index] || 0;
        
        card.style.zIndex = zIndex;
        card.style.opacity = 1 - (index * 0.1);
        card.style.transform = 
          `translateZ(${translateZ}px) translateY(${translateY}px) rotateZ(${rotate}deg) scale(${scale})`;
      });
    }
  }

  // Cover Flow Controller
  class CoverFlow {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
      
      if (!this.container) return;
      
      this.items = this.container.querySelectorAll('.coverflow-3d__item');
      this.currentIndex = 0;
      
      this.init();
    }
    
    init() {
      this.updatePositions();
      this.setupEventListeners();
    }
    
    setupEventListeners() {
      this.items.forEach((item, index) => {
        item.addEventListener('click', () => this.goTo(index));
      });
      
      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      });
    }
    
    updatePositions() {
      this.items.forEach((item, index) => {
        item.classList.remove('prev', 'active', 'next', 'hidden');
        
        if (index === this.currentIndex) {
          item.classList.add('active');
        } else if (index === this.currentIndex - 1) {
          item.classList.add('prev');
        } else if (index === this.currentIndex + 1) {
          item.classList.add('next');
        } else {
          item.classList.add('hidden');
        }
      });
    }
    
    next() {
      if (this.currentIndex < this.items.length - 1) {
        this.currentIndex++;
        this.updatePositions();
      }
    }
    
    prev() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.updatePositions();
      }
    }
    
    goTo(index) {
      this.currentIndex = index;
      this.updatePositions();
    }
  }

  // 3D Tilt Controller
  class Tilt3D {
    constructor(elements, options = {}) {
      this.elements = typeof elements === 'string' 
        ? document.querySelectorAll(elements) 
        : elements;
      
      this.options = {
        maxTilt: options.maxTilt || 15,
        perspective: options.perspective || 1000,
        scale: options.scale || 1.02,
        shine: options.shine !== false,
        ...options
      };
      
      this.init();
    }
    
    init() {
      this.elements.forEach(el => {
        this.setupTilt(el);
      });
    }
    
    setupTilt(element) {
      element.style.transformStyle = 'preserve-3d';
      element.style.transform = `perspective(${this.options.perspective}px)`;
      
      if (this.options.shine) {
        const shine = document.createElement('div');
        shine.className = 'tilt-card-3d__shine';
        element.appendChild(shine);
      }
      
      element.addEventListener('mousemove', (e) => this.handleMouseMove(e, element));
      element.addEventListener('mouseleave', () => this.handleMouseLeave(element));
    }
    
    handleMouseMove(e, element) {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -this.options.maxTilt;
      const rotateY = ((x - centerX) / centerX) * this.options.maxTilt;
      
      element.style.transform = `
        perspective(${this.options.perspective}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(${this.options.scale})
      `;
      
      // Update shine position
      const shine = element.querySelector('.tilt-card-3d__shine');
      if (shine) {
        const shineX = (x / rect.width) * 100;
        const shineY = (y / rect.height) * 100;
        shine.style.background = `
          radial-gradient(
            circle at ${shineX}% ${shineY}%,
            rgba(255, 255, 255, 0.2) 0%,
            transparent 60%
          )
        `;
      }
    }
    
    handleMouseLeave(element) {
      element.style.transform = `perspective(${this.options.perspective}px)`;
      
      const shine = element.querySelector('.tilt-card-3d__shine');
      if (shine) {
        shine.style.background = '';
      }
    }
  }

  // Initialize all galleries
  function init3DGalleries() {
    // Initialize 3D carousels
    document.querySelectorAll('[data-carousel-3d]').forEach(container => {
      const options = {
        autoRotate: container.dataset.autoRotate === 'true',
        autoRotateSpeed: parseInt(container.dataset.autoRotateSpeed) || 5000,
        draggable: container.dataset.draggable !== 'false'
      };
      new Carousel3D(container, options);
    });
    
    // Initialize card stacks
    document.querySelectorAll('[data-card-stack-3d]').forEach(container => {
      new CardStack3D(container);
    });
    
    // Initialize cover flows
    document.querySelectorAll('[data-coverflow-3d]').forEach(container => {
      new CoverFlow(container);
    });
    
    // Initialize tilt effects
    document.querySelectorAll('[data-tilt-3d]').forEach(el => {
      const options = {
        maxTilt: parseFloat(el.dataset.tiltMax) || 15,
        perspective: parseInt(el.dataset.tiltPerspective) || 1000,
        scale: parseFloat(el.dataset.tiltScale) || 1.02
      };
      new Tilt3D(el, options);
    });
    
    console.log('🎭 3D Gallery Controller initialized');
  }

  // Expose to global
  window.Carousel3D = Carousel3D;
  window.CardStack3D = CardStack3D;
  window.CoverFlow = CoverFlow;
  window.Tilt3D = Tilt3D;

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DGalleries);
  } else {
    init3DGalleries();
  }
})();