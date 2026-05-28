/**
 * v57.0: Advanced Card Effects v2
 * Fortune 500 - Premium 3D card interactions and animations
 */

class AdvancedCardEffects {
  constructor(options = {}) {
    this.options = {
      tiltIntensity: 0.15,
      spotlightIntensity: 0.15,
      magneticStrength: 0.3,
      enable3DTilt: true,
      enableSpotlight: true,
      enableMagnetic: true,
      enableRipple: true,
      ...options
    };
    
    this.cards = [];
    this.rafId = null;
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    
    this.init();
  }
  
  init() {
    if (this.isTouch) {
      this.initTouchCards();
    } else {
      this.findCards();
      this.bindEvents();
    }
    
    console.log('🎴 AdvancedCardEffects v57.0 initialized');
  }
  
  findCards() {
    // Find all cards with data attributes
    this.cards = Array.from(document.querySelectorAll('[data-card-effect]'));
    
    this.cards.forEach(card => {
      const effectType = card.dataset.cardEffect;
      card.classList.add(`${effectType}-card`);
      
      // Store original transforms
      card._originalTransform = card.style.transform;
      card._rect = card.getBoundingClientRect();
    });
  }
  
  bindEvents() {
    if (this.isTouch) return;
    
    this.cards.forEach(card => {
      const effectType = card.dataset.cardEffect;
      
      // 3D Tilt Effect
      if (this.options.enable3DTilt && effectType === 'tilt') {
        this.bindTiltEffect(card);
      }
      
      // Spotlight Effect
      if (this.options.enableSpotlight && effectType === 'spotlight') {
        this.bindSpotlightEffect(card);
      }
      
      // Magnetic Effect
      if (this.options.enableMagnetic && effectType === 'magnetic') {
        this.bindMagneticEffect(card);
      }
      
      // Ripple Effect
      if (this.options.enableRipple) {
        this.bindRippleEffect(card);
      }
      
      // General hover effects
      card.addEventListener('mouseenter', (e) => this.handleMouseEnter(e, card));
      card.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, card));
    });
    
    // Global mouse move for all cards
    document.addEventListener('mousemove', (e) => this.handleGlobalMouseMove(e), { passive: true });
  }
  
  bindTiltEffect(card) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / centerY * -10 * this.options.tiltIntensity;
      const rotateY = (x - centerX) / centerX * 10 * this.options.tiltIntensity;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.5s ease';
      
      setTimeout(() => {
        card.style.transition = '';
      }, 500);
    });
  }
  
  bindSpotlightEffect(card) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--spotlight-x', `${x}px`);
      card.style.setProperty('--spotlight-y', `${y}px`);
    });
  }
  
  bindMagneticEffect(card) {
    const magneticElements = card.querySelectorAll('[data-magnetic]');
    
    magneticElements.forEach(el => {
      const strength = parseFloat(el.dataset.magnetic) || this.options.magneticStrength;
      
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
        el.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
          el.style.transition = '';
        }, 300);
      });
    });
  }
  
  bindRippleEffect(card) {
    card.addEventListener('click', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      card.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }
  
  handleMouseEnter(e, card) {
    card.classList.add('card-hover');
    
    // Trigger custom event
    card.dispatchEvent(new CustomEvent('cardHover', { 
      detail: { card, type: 'enter' } 
    }));
  }
  
  handleMouseLeave(e, card) {
    card.classList.remove('card-hover');
    
    // Reset transforms
    if (!card.dataset.cardEffect?.includes('tilt')) {
      card.style.transform = card._originalTransform || '';
    }
    
    // Trigger custom event
    card.dispatchEvent(new CustomEvent('cardHover', { 
      detail: { card, type: 'leave' } 
    }));
  }
  
  handleGlobalMouseMove(e) {
    // Can be used for global effects
  }
  
  initTouchCards() {
    // Simplified interactions for touch devices
    this.cards = Array.from(document.querySelectorAll('[data-card-effect]'));
    
    this.cards.forEach(card => {
      card.addEventListener('touchstart', () => {
        card.classList.add('card-active');
      });
      
      card.addEventListener('touchend', () => {
        setTimeout(() => {
          card.classList.remove('card-active');
        }, 300);
      });
    });
  }
  
  // Public API
  refresh() {
    this.findCards();
    this.bindEvents();
  }
  
  destroy() {
    this.cards.forEach(card => {
      card.style.transform = '';
      card.classList.remove('card-hover');
    });
  }
}

// Card Parallax System
class CardParallaxSystem {
  constructor(selector = '[data-card-parallax]') {
    this.cards = document.querySelectorAll(selector);
    this.layers = [];
    
    this.init();
  }
  
  init() {
    this.cards.forEach(card => {
      const layers = card.querySelectorAll('[data-parallax-layer]');
      
      layers.forEach(layer => {
        const depth = parseFloat(layer.dataset.parallaxLayer) || 1;
        this.layers.push({
          element: layer,
          depth: depth,
          card: card
        });
      });
      
      card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card, layers));
      card.addEventListener('mouseleave', () => this.handleMouseLeave(layers));
    });
  }
  
  handleMouseMove(e, card, layers) {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    layers.forEach(layer => {
      const depth = parseFloat(layer.dataset.parallaxLayer) || 1;
      const moveX = x * 30 * depth;
      const moveY = y * 30 * depth;
      
      layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  }
  
  handleMouseLeave(layers) {
    layers.forEach(layer => {
      layer.style.transition = 'transform 0.5s ease';
      layer.style.transform = 'translate3d(0, 0, 0)';
      
      setTimeout(() => {
        layer.style.transition = '';
      }, 500);
    });
  }
}

// Flip Card Handler
class FlipCardHandler {
  constructor() {
    this.init();
  }
  
  init() {
    const flipContainers = document.querySelectorAll('.flip-card-container');
    
    flipContainers.forEach(container => {
      // On mobile, toggle on tap
      if (window.matchMedia('(pointer: coarse)').matches) {
        container.addEventListener('click', () => {
          container.classList.toggle('flipped');
        });
      }
    });
  }
}

// Stats Card Animation
class StatsCardAnimation {
  constructor() {
    this.cards = document.querySelectorAll('[data-stats-card]');
    this.observer = null;
    
    this.init();
  }
  
  init() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCard(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    this.cards.forEach(card => {
      this.observer.observe(card);
    });
  }
  
  animateCard(card) {
    const fills = card.querySelectorAll('.stats-card-fill');
    
    fills.forEach((fill, index) => {
      const percentage = fill.dataset.percentage || 75;
      
      setTimeout(() => {
        fill.style.width = `${percentage}%`;
      }, index * 150);
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Main card effects
  window.advancedCards = new AdvancedCardEffects({
    tiltIntensity: 0.12,
    magneticStrength: 0.25
  });
  
  // Parallax system
  window.cardParallax = new CardParallaxSystem();
  
  // Flip cards
  window.flipCards = new FlipCardHandler();
  
  // Stats cards
  window.statsCards = new StatsCardAnimation();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    AdvancedCardEffects, 
    CardParallaxSystem, 
    FlipCardHandler,
    StatsCardAnimation
  };
}
