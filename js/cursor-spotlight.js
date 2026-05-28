/**
 * v65.0: Cursor Spotlight Effect
 * Subtle illuminated gradient following cursor
 * Fortune 500 Quality - Professional & Subtle
 */

class CursorSpotlight {
  constructor(options = {}) {
    this.options = {
      size: options.size || 400,
      intensity: options.intensity || 0.08,
      smoothing: options.smoothing || 0.1,
      color: options.color || '201, 206, 214',
      ...options
    };
    
    this.spotlight = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.spotlightX = 0;
    this.spotlightY = 0;
    this.isActive = false;
    this.rafId = null;
    this.lastMouseMove = 0;
    this.mouseTimeout = null;
    
    // Check if touch device
    this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    
    this.init();
  }
  
  init() {
    if (this.isTouchDevice) return;
    
    this.createSpotlight();
    this.bindEvents();
  }
  
  createSpotlight() {
    this.spotlight = document.createElement('div');
    this.spotlight.className = 'cursor-spotlight';
    this.spotlight.style.cssText = `
      position: fixed;
      width: ${this.options.size}px;
      height: ${this.options.size}px;
      background: radial-gradient(
        circle at center,
        rgba(${this.options.color}, ${this.options.intensity}) 0%,
        rgba(${this.options.color}, ${this.options.intensity * 0.4}) 30%,
        transparent 70%
      );
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 0.4s ease;
      will-change: transform;
      mix-blend-mode: screen;
    `;
    
    document.body.prepend(this.spotlight);
  }
  
  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.lastMouseMove = Date.now();
      
      if (!this.isActive) {
        this.isActive = true;
        this.spotlight.classList.add('active');
        this.animate();
      }
      
      // Reset inactive timeout
      clearTimeout(this.mouseTimeout);
      this.mouseTimeout = setTimeout(() => {
        this.spotlight.classList.remove('active');
        this.isActive = false;
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
      }, 100);
    }, { passive: true });
    
    // Handle mouse leaving window
    document.addEventListener('mouseleave', () => {
      this.spotlight.classList.remove('active');
      this.isActive = false;
    });
    
    // Add enhanced glow on interactive elements
    this.addInteractiveGlow();
  }
  
  animate() {
    if (!this.isActive) return;
    
    // Smooth interpolation
    this.spotlightX += (this.mouseX - this.spotlightX) * this.options.smoothing;
    this.spotlightY += (this.mouseY - this.spotlightY) * this.options.smoothing;
    
    this.spotlight.style.left = `${this.spotlightX}px`;
    this.spotlight.style.top = `${this.spotlightY}px`;
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }
  
  addInteractiveGlow() {
    const interactiveElements = document.querySelectorAll(
      'a, button, .btn, .magnetic, .service-card, .project-card, .testimonial-card'
    );
    
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.spotlight.style.transform = 'translate(-50%, -50%) scale(1.3)';
        this.spotlight.style.opacity = '0.15';
      });
      
      el.addEventListener('mouseleave', () => {
        this.spotlight.style.transform = 'translate(-50%, -50%) scale(1)';
        this.spotlight.style.opacity = '';
      });
    });
  }
  
  destroy() {
    if (this.spotlight) {
      this.spotlight.remove();
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    clearTimeout(this.mouseTimeout);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) {
    window.cursorSpotlight = new CursorSpotlight({
      size: 500,
      intensity: 0.06,
      smoothing: 0.12
    });
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CursorSpotlight;
}
