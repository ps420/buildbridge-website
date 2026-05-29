/**
 * Advanced Card Tilt Effects v80.1
 * Fortune 500 3D Card Interactions
 */

(function() {
  'use strict';
  
  const CardTilt = {
    options: {
      maxTilt: 15,           // Maximum tilt angle (degrees)
      perspective: 1000,     // Perspective value
      scale: 1.02,          // Scale on hover
      speed: 400,           // Transition speed (ms)
      glare: true,          // Enable glare effect
      maxGlare: 0.3,        // Maximum glare opacity
      gyroscope: false      // Enable gyroscope on mobile
    },
    
    cards: [],
    
    init(selector = '.tilt-card-advanced-v2, .tilt-card-magnetic') {
      const cardElements = document.querySelectorAll(selector);
      
      cardElements.forEach(card => {
        this.createCard(card);
      });
      
      // Bind global events
      this.bindEvents();
    },
    
    createCard(element) {
      // Skip if already initialized
      if (element._tiltCard) return;
      
      const card = {
        element: element,
        inner: element.querySelector('.card-inner'),
        glare: element.querySelector('.card-glare'),
        rect: null,
        isHovering: false,
        animationId: null
      };
      
      // Add CSS classes
      element.style.transformStyle = 'preserve-3d';
      element.style.willChange = 'transform';
      
      // Create glare element if not exists and enabled
      if (this.options.glare && !card.glare) {
        card.glare = document.createElement('div');
        card.glare.className = 'card-glare';
        element.insertBefore(card.glare, element.firstChild);
      }
      
      // Mouse events
      element.addEventListener('mouseenter', (e) => this.onMouseEnter(e, card));
      element.addEventListener('mousemove', (e) => this.onMouseMove(e, card));
      element.addEventListener('mouseleave', (e) => this.onMouseLeave(e, card));
      
      // Touch events
      element.addEventListener('touchstart', (e) => this.onTouchStart(e, card), { passive: true });
      element.addEventListener('touchmove', (e) => this.onTouchMove(e, card), { passive: true });
      element.addEventListener('touchend', (e) => this.onTouchEnd(e, card));
      
      // Store reference
      element._tiltCard = card;
      this.cards.push(card);
    },
    
    bindEvents() {
      // Update rects on scroll/resize
      window.addEventListener('resize', () => this.updateRects(), { passive: true });
      window.addEventListener('scroll', () => this.updateRects(), { passive: true });
    },
    
    updateRects() {
      this.cards.forEach(card => {
        card.rect = card.element.getBoundingClientRect();
      });
    },
    
    onMouseEnter(e, card) {
      card.isHovering = true;
      card.rect = card.element.getBoundingClientRect();
      
      card.element.style.transition = `transform ${this.options.speed}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      
      // Add hover state
      requestAnimationFrame(() => {
        card.element.classList.add('tilt-active');
      });
    },
    
    onMouseMove(e, card) {
      if (!card.isHovering) return;
      
      const rect = card.rect || card.element.getBoundingClientRect();
      
      // Calculate mouse position relative to card
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate percentage position
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;
      
      // Update card tilt
      this.updateTilt(card, percentX, percentY, x, y, rect);
    },
    
    onMouseLeave(e, card) {
      card.isHovering = false;
      
      card.element.style.transition = `transform ${this.options.speed * 1.5}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      card.element.style.transform = `perspective(${this.options.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      
      if (card.glare) {
        card.glare.style.opacity = '0';
      }
      
      requestAnimationFrame(() => {
        card.element.classList.remove('tilt-active');
      });
    },
    
    onTouchStart(e, card) {
      card.isHovering = true;
      card.rect = card.element.getBoundingClientRect();
      
      const touch = e.touches[0];
      const rect = card.rect;
      
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;
      
      this.updateTilt(card, percentX, percentY, x, y, rect);
    },
    
    onTouchMove(e, card) {
      if (!card.isHovering) return;
      
      const touch = e.touches[0];
      const rect = card.rect || card.element.getBoundingClientRect();
      
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;
      
      this.updateTilt(card, percentX, percentY, x, y, rect);
    },
    
    onTouchEnd(e, card) {
      this.onMouseLeave(e, card);
    },
    
    updateTilt(card, percentX, percentY, mouseX, mouseY, rect) {
      // Calculate rotation (inverted for natural feel)
      const rotateX = percentY * -this.options.maxTilt;
      const rotateY = percentX * this.options.maxTilt;
      
      // Update card transform
      card.element.style.transition = 'transform 0.1s ease-out';
      card.element.style.transform = `
        perspective(${this.options.perspective}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(${this.options.scale}, ${this.options.scale}, ${this.options.scale})
      `;
      
      // Update glare position
      if (card.glare) {
        const glareX = (mouseX / rect.width) * 100;
        const glareY = (mouseY / rect.height) * 100;
        
        card.glare.style.setProperty('--mouse-x', `${glareX}%`);
        card.glare.style.setProperty('--mouse-y', `${glareY}%`);
        card.glare.style.opacity = this.options.maxGlare.toString();
      }
      
      // Update inner elements with parallax
      const innerElements = card.element.querySelectorAll('.card-content-3d, .card-icon-3d, .card-title-3d');
      innerElements.forEach((el, index) => {
        const depth = (index + 1) * 10;
        const translateZ = depth;
        const translateX = percentX * -5;
        const translateY = percentY * -5;
        
        el.style.transform = `translateZ(${translateZ}px) translate(${translateX}px, ${translateY}px)`;
      });
    },
    
    // Magnetic variant
    initMagnetic(selector = '.tilt-card-magnetic') {
      const elements = document.querySelectorAll(selector);
      
      elements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          const strength = parseFloat(el.dataset.magneticStrength) || 0.3;
          
          el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });
        
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'translate(0, 0)';
        });
      });
    },
    
    // Flip card variant
    initFlipCards(selector = '.tilt-card-flip') {
      const cards = document.querySelectorAll(selector);
      
      cards.forEach(card => {
        card.addEventListener('click', () => {
          card.classList.toggle('flipped');
        });
      });
    },
    
    // Destroy
    destroy() {
      this.cards.forEach(card => {
        card.element.style.transform = '';
        card.element.style.transition = '';
        delete card.element._tiltCard;
      });
      this.cards = [];
    },
    
    // Refresh (after DOM changes)
    refresh(selector = '.tilt-card-advanced-v2, .tilt-card-magnetic') {
      this.destroy();
      this.init(selector);
    }
  };
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      CardTilt.init();
      CardTilt.initMagnetic();
      CardTilt.initFlipCards();
    });
  } else {
    CardTilt.init();
    CardTilt.initMagnetic();
    CardTilt.initFlipCards();
  }
  
  // Expose to global scope
  window.BuildBridgeCardTilt = CardTilt;
})();
