/**
 * BuildBridge v27.0 - Advanced 3D Card Effects
 * Fortune 500 Quality Card Interactions
 */

class AdvancedCardEffects {
  constructor(options = {}) {
    this.options = {
      cardSelector: '.advanced-card',
      tiltMaxAngle: 15,
      tiltSpeed: 400,
      spotlightIntensity: 0.15,
      magneticStrength: 0.3,
      enableTilt: true,
      enableSpotlight: true,
      enableMagnetic: true,
      enableRipple: true,
      ...options
    };
    
    this.cards = [];
    this.rafId = null;
    this.mouseX = 0;
    this.mouseY = 0;
    
    this.init();
  }
  
  init() {
    this.findCards();
    this.bindEvents();
  }
  
  findCards() {
    const cardElements = document.querySelectorAll(this.options.cardSelector);
    
    this.cards = Array.from(cardElements).map(card => {
      return {
        element: card,
        rect: card.getBoundingClientRect(),
        isHovered: false,
        tiltX: 0,
        tiltY: 0,
        targetTiltX: 0,
        targetTiltY: 0,
        spotlightX: 50,
        spotlightY: 50
      };
    });
  }
  
  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      
      if (this.options.enableTilt || this.options.enableSpotlight) {
        this.updateCards();
      }
    }, { passive: true });
    
    this.cards.forEach(card => {
      card.element.addEventListener('mouseenter', () => {
        card.isHovered = true;
        card.element.classList.add('is-hovered');
      });
      
      card.element.addEventListener('mouseleave', () => {
        card.isHovered = false;
        card.element.classList.remove('is-hovered');
        this.resetCard(card);
      });
      
      if (this.options.enableRipple) {
        card.element.addEventListener('click', (e) => {
          this.createRipple(card.element, e);
        });
      }
      
      if (this.options.enableMagnetic) {
        const magneticElements = card.element.querySelectorAll('[data-magnetic]');
        magneticElements.forEach(el => {
          this.initMagnetic(el);
        });
      }
    });
    
    window.addEventListener('resize', () => this.updateRects());
    window.addEventListener('scroll', () => this.updateRects(), { passive: true });
    
    this.animate();
  }
  
  updateRects() {
    this.cards.forEach(card => {
      card.rect = card.element.getBoundingClientRect();
    });
  }
  
  updateCards() {
    this.cards.forEach(card => {
      if (!card.isHovered) return;
      
      const rect = card.rect;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = this.mouseX - centerX;
      const mouseY = this.mouseY - centerY;
      
      if (this.options.enableTilt && card.element.classList.contains('card-3d-tilt')) {
        const rotateX = (mouseY / (rect.height / 2)) * -this.options.tiltMaxAngle;
        const rotateY = (mouseX / (rect.width / 2)) * this.options.tiltMaxAngle;
        
        card.targetTiltX = Math.max(-this.options.tiltMaxAngle, Math.min(this.options.tiltMaxAngle, rotateX));
        card.targetTiltY = Math.max(-this.options.tiltMaxAngle, Math.min(this.options.tiltMaxAngle, rotateY));
      }
      
      if (this.options.enableSpotlight && card.element.classList.contains('card-spotlight')) {
        const spotlightX = ((this.mouseX - rect.left) / rect.width) * 100;
        const spotlightY = ((this.mouseY - rect.top) / rect.height) * 100;
        
        card.element.style.setProperty('--mouse-x', `${spotlightX}%`);
        card.element.style.setProperty('--mouse-y', `${spotlightY}%`);
      }
    });
  }
  
  animate() {
    this.cards.forEach(card => {
      if (card.element.classList.contains('card-3d-tilt')) {
        const ease = 0.1;
        card.tiltX += (card.targetTiltX - card.tiltX) * ease;
        card.tiltY += (card.targetTiltY - card.tiltY) * ease;
        
        card.element.style.transform = `
          perspective(1000px)
          rotateX(${card.tiltX}deg)
          rotateY(${card.tiltY}deg)
          scale3d(1.02, 1.02, 1.02)
        `;
      }
    });
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }
  
  resetCard(card) {
    if (card.element.classList.contains('card-3d-tilt')) {
      card.targetTiltX = 0;
      card.targetTiltY = 0;
      
      setTimeout(() => {
        if (!card.isHovered) {
          card.element.style.transform = '';
        }
      }, this.options.tiltSpeed);
    }
  }
  
  createRipple(element, event) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
  
  initMagnetic(element) {
    const strength = parseFloat(element.dataset.magnetic) || this.options.magneticStrength;
    
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.transform = '';
    });
  }
  
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.advancedCardEffects = new AdvancedCardEffects();
  });
} else {
  window.advancedCardEffects = new AdvancedCardEffects();
}
