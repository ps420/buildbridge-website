/**
 * Card Depth Effects v1.0
 * Fortune 500 3D Card Interactions
 * Features: Mouse tracking tilt, depth layering, parallax content
 */

class CardDepthEffects {
  constructor(options = {}) {
    this.options = {
      selector: options.selector || '.card-depth',
      maxTilt: options.maxTilt || 10,
      perspective: options.perspective || 1000,
      scale: options.scale || 1.02,
      glare: options.glare !== false,
      ...options
    };
    
    this.cards = [];
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    
    this.init();
  }
  
  init() {
    if (this.isTouch) return; // Disable on touch devices
    
    this.findCards();
    this.bindEvents();
    this.setupScrollReveal();
  }
  
  findCards() {
    const elements = document.querySelectorAll(this.options.selector);
    
    this.cards = Array.from(elements).map(element => {
      // Add perspective container if needed
      let container = element.parentElement;
      if (!container.classList.contains('card-3d-container')) {
        container = document.createElement('div');
        container.className = 'card-3d-container';
        element.parentNode.insertBefore(container, element);
        container.appendChild(element);
      }
      
      container.style.perspective = `${this.options.perspective}px`;
      
      // Create glare element if enabled
      let glareElement = null;
      if (this.options.glare) {
        glareElement = document.createElement('div');
        glareElement.className = 'card-glare';
        glareElement.style.cssText = `
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 10;
          border-radius: inherit;
        `;
        element.appendChild(glareElement);
      }
      
      return {
        element,
        container,
        glareElement,
        rect: null,
        isHovering: false,
        currentRotateX: 0,
        currentRotateY: 0,
        targetRotateX: 0,
        targetRotateY: 0
      };
    });
  }
  
  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.cards.forEach(card => this.handleMouseMove(card, e));
    });
    
    this.cards.forEach(card => {
      card.element.addEventListener('mouseenter', () => {
        card.isHovering = true;
        card.rect = card.element.getBoundingClientRect();
        this.animateCard(card);
      });
      
      card.element.addEventListener('mouseleave', () => {
        card.isHovering = false;
        this.resetCard(card);
      });
    });
    
    // Update rects on scroll/resize
    window.addEventListener('scroll', () => {
      this.cards.forEach(card => {
        if (card.isHovering) {
          card.rect = card.element.getBoundingClientRect();
        }
      });
    }, { passive: true });
    
    window.addEventListener('resize', () => {
      this.cards.forEach(card => {
        card.rect = card.element.getBoundingClientRect();
      });
    }, { passive: true });
  }
  
  handleMouseMove(card, e) {
    if (!card.isHovering || !card.rect) return;
    
    const rect = card.rect;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation (inverted for natural feel)
    card.targetRotateY = (mouseX / (rect.width / 2)) * this.options.maxTilt;
    card.targetRotateX = -(mouseY / (rect.height / 2)) * this.options.maxTilt;
    
    // Update glare position
    if (card.glareElement) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      card.glareElement.style.background = `
        radial-gradient(
          circle at ${glareX}% ${glareY}%,
          rgba(255, 255, 255, 0.15) 0%,
          rgba(255, 255, 255, 0.05) 30%,
          transparent 70%
        )
      `;
      card.glareElement.style.opacity = '1';
    }
  }
  
  animateCard(card) {
    if (!card.isHovering) return;
    
    // Smooth interpolation
    const ease = 0.15;
    card.currentRotateX += (card.targetRotateX - card.currentRotateX) * ease;
    card.currentRotateY += (card.targetRotateY - card.currentRotateY) * ease;
    
    // Apply transform
    const transform = `
      rotateX(${card.currentRotateX}deg)
      rotateY(${card.currentRotateY}deg)
      scale3d(${this.options.scale}, ${this.options.scale}, ${this.options.scale})
    `;
    
    card.element.style.transform = transform;
    
    // Update CSS custom properties for child elements
    card.element.style.setProperty('--rotate-x', `${card.currentRotateX}deg`);
    card.element.style.setProperty('--rotate-y', `${card.currentRotateY}deg`);
    
    requestAnimationFrame(() => this.animateCard(card));
  }
  
  resetCard(card) {
    card.element.style.transform = '';
    card.element.style.setProperty('--rotate-x', '0deg');
    card.element.style.setProperty('--rotate-y', '0deg');
    
    if (card.glareElement) {
      card.glareElement.style.opacity = '0';
    }
    
    card.currentRotateX = 0;
    card.currentRotateY = 0;
    card.targetRotateX = 0;
    card.targetRotateY = 0;
  }
  
  setupScrollReveal() {
    const revealCards = document.querySelectorAll('.card-reveal');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    });
    
    revealCards.forEach(card => observer.observe(card));
  }
}

// Magnetic Card Effect
class MagneticCards {
  constructor(options = {}) {
    this.options = {
      selector: options.selector || '.card-magnetic',
      strength: options.strength || 0.3,
      radius: options.radius || 150,
      ...options
    };
    
    this.cards = [];
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    
    this.init();
  }
  
  init() {
    if (this.isTouch) return;
    
    this.findCards();
    this.bindEvents();
  }
  
  findCards() {
    const elements = document.querySelectorAll(this.options.selector);
    
    this.cards = Array.from(elements).map(element => ({
      element,
      rect: null,
      isHovering: false,
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0
    }));
  }
  
  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.cards.forEach(card => this.handleMouseMove(card, e));
    });
    
    window.addEventListener('resize', () => {
      this.cards.forEach(card => {
        card.rect = card.element.getBoundingClientRect();
      });
    }, { passive: true });
  }
  
  handleMouseMove(card, e) {
    card.rect = card.element.getBoundingClientRect();
    const rect = card.rect;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    if (distance < this.options.radius) {
      const factor = 1 - (distance / this.options.radius);
      card.targetX = distX * this.options.strength * factor;
      card.targetY = distY * this.options.strength * factor;
      
      if (!card.isHovering) {
        card.isHovering = true;
        this.animateCard(card);
      }
    } else {
      card.targetX = 0;
      card.targetY = 0;
      card.isHovering = false;
    }
  }
  
  animateCard(card) {
    if (!card.isHovering && Math.abs(card.currentX) < 0.1 && Math.abs(card.currentY) < 0.1) {
      card.element.style.transform = '';
      return;
    }
    
    const ease = 0.1;
    card.currentX += (card.targetX - card.currentX) * ease;
    card.currentY += (card.targetY - card.currentY) * ease;
    
    card.element.style.transform = `translate3d(${card.currentX}px, ${card.currentY}px, 0)`;
    
    requestAnimationFrame(() => this.animateCard(card));
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.cardDepthEffects = new CardDepthEffects({
    maxTilt: 8,
    perspective: 1000,
    scale: 1.02,
    glare: true
  });
  
  window.magneticCards = new MagneticCards({
    strength: 0.2,
    radius: 100
  });
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CardDepthEffects, MagneticCards };
}
