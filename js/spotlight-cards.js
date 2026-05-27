/**
 * Spotlight Card Effect v20.0
 * Mouse-tracking highlight cards with organic glow
 */

class SpotlightCards {
  constructor(options = {}) {
    this.cards = document.querySelectorAll(options.selector || '.spotlight-card');
    if (!this.cards.length) return;
    
    this.config = {
      glowSize: options.glowSize || 300,
      intensity: options.intensity || 0.15,
      smoothness: options.smoothness || 0.1,
      ...options
    };
    
    this.mousePositions = new Map();
    this.rafId = null;
    
    this.init();
  }
  
  init() {
    // Don't initialize on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.cards.forEach(card => {
      this.setupCard(card);
    });
    
    this.animate();
  }
  
  setupCard(card) {
    // Initialize mouse position for this card
    this.mousePositions.set(card, { x: 50, y: 50, targetX: 50, targetY: 50 });
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      const pos = this.mousePositions.get(card);
      pos.targetX = x;
      pos.targetY = y;
    });
    
    card.addEventListener('mouseleave', () => {
      const pos = this.mousePositions.get(card);
      pos.targetX = 50;
      pos.targetY = 50;
    });
  }
  
  animate() {
    this.cards.forEach(card => {
      const pos = this.mousePositions.get(card);
      if (!pos) return;
      
      // Smooth interpolation
      pos.x += (pos.targetX - pos.x) * this.config.smoothness;
      pos.y += (pos.targetY - pos.y) * this.config.smoothness;
      
      // Update CSS custom properties
      card.style.setProperty('--mouse-x', `${pos.x}%`);
      card.style.setProperty('--mouse-y', `${pos.y}%`);
    });
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.mousePositions.clear();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.spotlightCards = new SpotlightCards();
  });
} else {
  window.spotlightCards = new SpotlightCards();
}
