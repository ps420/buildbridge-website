/**
 * Card Depth Effects v120.3
 * Fortune 500 Quality 3D Card Interactions
 */

(function() {
  'use strict';

  class CardDepthEffect {
    constructor(card, options = {}) {
      this.card = card;
      this.options = {
        maxRotation: options.maxRotation || 15,
        perspective: options.perspective || 1000,
        scale: options.scale || 1.02,
        glare: options.glare !== false,
        ...options
      };
      
      this.bounds = null;
      this.isHovering = false;
      
      this.init();
    }

    init() {
      // Set up container
      this.card.style.transformStyle = 'preserve-3d';
      this.card.style.willChange = 'transform';
      
      // Add glare element if enabled
      if (this.options.glare) {
        this.addGlareEffect();
      }
      
      // Bind events
      this.card.addEventListener('mouseenter', this.handleEnter.bind(this));
      this.card.addEventListener('mouseleave', this.handleLeave.bind(this));
      this.card.addEventListener('mousemove', this.handleMove.bind(this));
      
      // Touch events for mobile
      this.card.addEventListener('touchstart', this.handleTouch.bind(this), { passive: true });
      this.card.addEventListener('touchmove', this.handleTouch.bind(this), { passive: true });
      this.card.addEventListener('touchend', this.handleLeave.bind(this));
    }

    addGlareEffect() {
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      glare.style.cssText = `
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.25) 0%,
          rgba(255, 255, 255, 0.1) 40%,
          transparent 60%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 10;
      `;
      this.card.appendChild(glare);
      this.glare = glare;
    }

    handleEnter() {
      this.bounds = this.card.getBoundingClientRect();
      this.isHovering = true;
      this.card.style.transition = 'transform 0.1s ease';
    }

    handleLeave() {
      this.isHovering = false;
      this.card.style.transition = 'transform 0.5s ease';
      this.card.style.transform = `perspective(${this.options.perspective}px) rotateX(0) rotateY(0) scale(1)`;
      
      if (this.glare) {
        this.glare.style.opacity = '0';
      }
    }

    handleMove(e) {
      if (!this.isHovering || !this.bounds) return;
      
      const x = e.clientX - this.bounds.left;
      const y = e.clientY - this.bounds.top;
      
      this.updateTransform(x, y);
    }

    handleTouch(e) {
      if (!e.touches.length) return;
      
      this.bounds = this.card.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - this.bounds.left;
      const y = touch.clientY - this.bounds.top;
      
      this.updateTransform(x, y);
    }

    updateTransform(x, y) {
      const centerX = this.bounds.width / 2;
      const centerY = this.bounds.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -this.options.maxRotation;
      const rotateY = ((x - centerX) / centerX) * this.options.maxRotation;
      
      this.card.style.transform = `
        perspective(${this.options.perspective}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(${this.options.scale})
      `;
      
      // Update glare position
      if (this.glare) {
        this.glare.style.opacity = '1';
        const glareX = (x / this.bounds.width) * 100;
        const glareY = (y / this.bounds.height) * 100;
        this.glare.style.background = `
          radial-gradient(
            circle at ${glareX}% ${glareY}%,
            rgba(255, 255, 255, 0.3) 0%,
            rgba(255, 255, 255, 0.1) 25%,
            transparent 50%
          )
        `;
      }
      
      // Update content layers
      this.updateContentDepth(rotateX, rotateY);
    }

    updateContentDepth(rotateX, rotateY) {
      const layers = this.card.querySelectorAll('.card-content-layer, .card-icon-layer, .card-title-layer');
      
      layers.forEach(layer => {
        const depth = layer.classList.contains('card-icon-layer') ? 50 :
                     layer.classList.contains('card-title-layer') ? 40 :
                     layer.classList.contains('card-action-layer') ? 60 : 30;
        
        layer.style.transform = `
          translateZ(${depth}px)
          translateX(${rotateY * 0.5}px)
          translateY(${rotateX * 0.5}px)
        `;
      });
    }
  }

  // Magnetic Card Effect
  class MagneticCard {
    constructor(card, options = {}) {
      this.card = card;
      this.options = {
        strength: options.strength || 0.3,
        ...options
      };
      
      this.init();
    }

    init() {
      this.card.addEventListener('mousemove', this.handleMagnetic.bind(this));
      this.card.addEventListener('mouseleave', this.resetMagnetic.bind(this));
    }

    handleMagnetic(e) {
      const rect = this.card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      this.card.style.transform = `
        translateX(${x * this.options.strength}px)
        translateY(${y * this.options.strength}px)
      `;
    }

    resetMagnetic() {
      this.card.style.transform = 'translateX(0) translateY(0)';
    }
  }

  // Stacked Card Effect
  class StackedCards {
    constructor(container, options = {}) {
      this.container = container;
      this.cards = Array.from(container.children);
      this.options = {
        offset: options.offset || 10,
        scale: options.scale || 0.05,
        ...options
      };
      
      this.init();
    }

    init() {
      this.cards.forEach((card, index) => {
        card.style.position = 'relative';
        card.style.zIndex = this.cards.length - index;
        card.style.transform = `
          translateY(${index * this.options.offset}px)
          scale(${1 - index * this.options.scale})
        `;
        card.style.opacity = index === 0 ? 1 : 0.7 - index * 0.1;
      });
      
      this.container.addEventListener('mouseenter', () => this.expand());
      this.container.addEventListener('mouseleave', () => this.collapse());
    }

    expand() {
      this.cards.forEach((card, index) => {
        card.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        card.style.transform = 'translateY(0) scale(1)';
        card.style.opacity = 1;
      });
    }

    collapse() {
      this.cards.forEach((card, index) => {
        card.style.transform = `
          translateY(${index * this.options.offset}px)
          scale(${1 - index * this.options.scale})
        `;
        card.style.opacity = index === 0 ? 1 : 0.7 - index * 0.1;
      });
    }
  }

  // Reveal Card on Scroll
  class ScrollRevealCard {
    constructor(card, options = {}) {
      this.card = card;
      this.options = {
        threshold: options.threshold || 0.2,
        delay: options.delay || 0,
        ...options
      };
      
      this.init();
    }

    init() {
      this.card.style.opacity = '0';
      this.card.style.transform = 'translateY(40px)';
      this.card.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              this.card.style.opacity = '1';
              this.card.style.transform = 'translateY(0)';
            }, this.options.delay);
            observer.unobserve(this.card);
          }
        });
      }, { threshold: this.options.threshold });
      
      observer.observe(this.card);
    }
  }

  // Initialize on DOM ready
  function init() {
    // Initialize 3D tilt cards
    document.querySelectorAll('.card-depth, .tilt-card-3d').forEach(card => {
      new CardDepthEffect(card, {
        maxRotation: parseFloat(card.dataset.tiltMax) || 15,
        scale: parseFloat(card.dataset.tiltScale) || 1.02
      });
    });
    
    // Initialize magnetic cards
    document.querySelectorAll('.card-magnetic, [data-magnetic]').forEach(card => {
      new MagneticCard(card, {
        strength: parseFloat(card.dataset.magnetic) || 0.3
      });
    });
    
    // Initialize stacked cards
    document.querySelectorAll('.card-stack-container, [data-card-stack]').forEach(container => {
      new StackedCards(container);
    });
    
    // Initialize scroll reveal cards
    document.querySelectorAll('.card-reveal-scroll, [data-reveal-scroll]').forEach((card, index) => {
      new ScrollRevealCard(card, {
        delay: index * 100
      });
    });
    
    console.log('🎴 Card Depth Effects v120.3 initialized');
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose globally
  window.CardDepthEffect = CardDepthEffect;
  window.MagneticCard = MagneticCard;
  window.StackedCards = StackedCards;
})();
