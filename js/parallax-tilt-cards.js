/**
 * BuildBridge Parallax Tilt Cards
 * Fortune 500 Quality - 3D perspective tilt effect on hover
 * Creates an immersive depth experience for cards and interactive elements
 */

class ParallaxTiltCards {
  constructor(options = {}) {
    this.selector = options.selector || '[data-tilt]';
    this.maxTilt = options.maxTilt || 15;
    this.perspective = options.perspective || 1000;
    this.scale = options.scale || 1.05;
    this.speed = options.speed || 400;
    this.glare = options.glare !== false;
    this.maxGlare = options.maxGlare || 0.3;
    
    this.cards = [];
    
    this.init();
  }
  
  init() {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.cards = document.querySelectorAll(this.selector);
    this.cards.forEach(card => this.setupCard(card));
  }
  
  setupCard(card) {
    // Check if already initialized
    if (card.dataset.tiltInitialized) return;
    card.dataset.tiltInitialized = 'true';
    
    // Set perspective on parent
    card.style.transformStyle = 'preserve-3d';
    card.style.transform = 'perspective(1000px)';
    card.style.transition = `transform ${this.speed}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    
    // Create glare element
    let glareElement = null;
    if (this.glare && !card.querySelector('.tilt-glare')) {
      glareElement = document.createElement('div');
      glareElement.className = 'tilt-glare';
      glareElement.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255,255,255,${this.maxGlare}) 0%, transparent 60%);
        opacity: 0;
        transition: opacity ${this.speed}ms ease;
        pointer-events: none;
        border-radius: inherit;
        z-index: 10;
      `;
      card.appendChild(glareElement);
    }
    
    // Mouse move handler
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      const rotateX = (mouseY / (rect.height / 2)) * -this.maxTilt;
      const rotateY = (mouseX / (rect.width / 2)) * this.maxTilt;
      
      card.style.transform = `
        perspective(${this.perspective}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(${this.scale}, ${this.scale}, ${this.scale})
      `;
      
      // Update glare
      if (glareElement) {
        const glareX = ((e.clientX - rect.left) / rect.width) * 100;
        const glareY = ((e.clientY - rect.top) / rect.height) * 100;
        glareElement.style.background = `
          radial-gradient(circle at ${glareX}% ${glareY}%, 
          rgba(255,255,255,${this.maxGlare}) 0%, 
          transparent 60%)
        `;
        glareElement.style.opacity = '1';
      }
      
      // Parallax inner elements
      card.querySelectorAll('[data-tilt-parallax]').forEach(inner => {
        const depth = parseFloat(inner.dataset.tiltParallax) || 20;
        const moveX = (mouseX / rect.width) * depth;
        const moveY = (mouseY / rect.height) * depth;
        inner.style.transform = `translate3d(${moveX}px, ${moveY}px, ${depth}px)`;
        inner.style.transition = 'transform 0.1s ease-out';
      });
    });
    
    // Mouse leave handler
    card.addEventListener('mouseleave', () => {
      card.style.transform = `
        perspective(${this.perspective}px)
        rotateX(0deg)
        rotateY(0deg)
        scale3d(1, 1, 1)
      `;
      
      if (glareElement) {
        glareElement.style.opacity = '0';
      }
      
      // Reset inner elements
      card.querySelectorAll('[data-tilt-parallax]').forEach(inner => {
        inner.style.transform = '';
      });
    });
    
    // Mouse enter handler
    card.addEventListener('mouseenter', () => {
      card.style.transition = `transform ${this.speed}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    });
  }
  
  destroy() {
    this.cards.forEach(card => {
      card.style.transform = '';
      card.style.transition = '';
      const glare = card.querySelector('.tilt-glare');
      if (glare) glare.remove();
      delete card.dataset.tiltInitialized;
    });
  }
  
  refresh() {
    this.destroy();
    this.init();
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.parallaxTiltCards = new ParallaxTiltCards({
    maxTilt: 12,
    scale: 1.03,
    glare: true,
    maxGlare: 0.2
  });
});

// Export
window.ParallaxTiltCards = ParallaxTiltCards;
