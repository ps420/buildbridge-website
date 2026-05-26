/**
 * BuildBridge Magnetic Cursor Effect
 * Fortune 500 Quality - Magnetic attraction for interactive elements
 */

class MagneticCursor {
  constructor(options = {}) {
    this.strength = options.strength || 0.3;
    this.radius = options.radius || 100;
    this.ease = options.ease || 0.15;
    this.selector = options.selector || '[data-magnetic], .magnetic, .btn, .service-card, .project-card';
    this.elements = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    this.isRunning = false;
    this.rafId = null;
    
    this.init();
  }

  init() {
    // Don't run on touch devices
    if (this.isTouch) return;
    
    this.findElements();
    this.setupEventListeners();
    this.start();
  }

  findElements() {
    const elements = document.querySelectorAll(this.selector);
    
    this.elements = Array.from(elements).map(el => {
      // Get custom strength from data attribute
      const customStrength = parseFloat(el.dataset.magnetic) || this.strength;
      
      return {
        el: el,
        strength: customStrength,
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        rect: el.getBoundingClientRect(),
        isHovering: false
      };
    });
  }

  setupEventListeners() {
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }, { passive: true });

    // Update rects on scroll and resize
    window.addEventListener('scroll', () => this.updateRects(), { passive: true });
    window.addEventListener('resize', () => this.updateRects(), { passive: true });

    // Handle dynamic content
    const observer = new MutationObserver(() => {
      this.findElements();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  updateRects() {
    this.elements.forEach(item => {
      item.rect = item.el.getBoundingClientRect();
    });
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }

  animate() {
    if (!this.isRunning) return;

    this.elements.forEach(item => {
      const centerX = item.rect.left + item.rect.width / 2;
      const centerY = item.rect.top + item.rect.height / 2;
      
      const distX = this.mouseX - centerX;
      const distY = this.mouseY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      // Check if mouse is within magnetic radius
      if (distance < this.radius) {
        item.isHovering = true;
        // Calculate magnetic pull (stronger when closer)
        const pull = 1 - (distance / this.radius);
        item.targetX = distX * item.strength * pull;
        item.targetY = distY * item.strength * pull;
        
        // Add hover class
        item.el.classList.add('magnetic--active');
      } else {
        item.isHovering = false;
        item.targetX = 0;
        item.targetY = 0;
        item.el.classList.remove('magnetic--active');
      }

      // Smooth easing to target
      item.x += (item.targetX - item.x) * this.ease;
      item.y += (item.targetY - item.y) * this.ease;

      // Apply transform
      if (Math.abs(item.x) > 0.01 || Math.abs(item.y) > 0.01) {
        item.el.style.transform = `translate(${item.x}px, ${item.y}px)`;
      } else if (!item.isHovering) {
        item.el.style.transform = '';
      }
    });

    this.rafId = requestAnimationFrame(() => this.animate());
  }

  // Public methods
  refresh() {
    this.findElements();
    this.updateRects();
  }

  destroy() {
    this.stop();
    this.elements.forEach(item => {
      item.el.style.transform = '';
      item.el.classList.remove('magnetic--active');
    });
    this.elements = [];
  }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  window.magneticCursor = new MagneticCursor({
    strength: 0.25,
    radius: 120,
    ease: 0.12
  });
});

// Export for global access
window.MagneticCursor = MagneticCursor;

console.log('🧲 Magnetic Cursor initialized');
