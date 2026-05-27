/**
 * Magnetic Image Reveal System
 * v25.0 Fortune 500 Professional Feature
 * Magnetic pull effects on images with cursor following
 */

class MagneticImageReveal {
  constructor(container, options = {}) {
    this.container = container;
    this.wrapper = container.querySelector('.magnetic-image-wrapper');
    this.image = container.querySelector('.magnetic-image');
    this.cursor = container.querySelector('.magnetic-cursor');
    
    this.config = {
      strength: options.strength || 0.3,      // Magnetic pull strength (0-1)
      ease: options.ease || 0.15,             // Smoothing factor
      maxDistance: options.maxDistance || 200, // Max distance for magnetic effect
      scale: options.scale || 1.05,           // Scale on hover
      tilt: options.tilt !== false,           // Enable 3D tilt
      ...options
    };
    
    this.mouse = { x: 0, y: 0 };
    this.position = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.rotation = { x: 0, y: 0 };
    this.isHovering = false;
    this.animationId = null;
    this.rect = null;
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.animate();
  }
  
  bindEvents() {
    this.container.addEventListener('mouseenter', (e) => this.onMouseEnter(e));
    this.container.addEventListener('mouseleave', () => this.onMouseLeave());
    this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
    
    // Handle click for ripple effect
    this.container.addEventListener('click', (e) => this.createRipple(e));
    
    // Update rect on resize
    window.addEventListener('resize', () => {
      this.rect = this.container.getBoundingClientRect();
    }, { passive: true });
  }
  
  onMouseEnter(e) {
    this.isHovering = true;
    this.rect = this.container.getBoundingClientRect();
    this.updateMousePosition(e);
  }
  
  onMouseLeave() {
    this.isHovering = false;
    this.target = { x: 0, y: 0 };
    
    if (this.cursor) {
      this.cursor.style.opacity = '0';
      this.cursor.style.transform = 'translate(-50%, -50%) scale(0)';
    }
  }
  
  onMouseMove(e) {
    if (!this.isHovering) return;
    this.updateMousePosition(e);
  }
  
  updateMousePosition(e) {
    if (!this.rect) return;
    
    this.mouse.x = e.clientX - this.rect.left;
    this.mouse.y = e.clientY - this.rect.top;
    
    // Calculate center-relative position
    const centerX = this.rect.width / 2;
    const centerY = this.rect.height / 2;
    
    // Calculate distance from center
    const deltaX = this.mouse.x - centerX;
    const deltaY = this.mouse.y - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Calculate magnetic strength based on distance
    const maxDist = Math.min(this.rect.width, this.rect.height) * 0.5;
    const strength = Math.max(0, 1 - distance / maxDist) * this.config.strength;
    
    // Target position (offset from center based on mouse position)
    this.target.x = (deltaX / centerX) * strength * 20;
    this.target.y = (deltaY / centerY) * strength * 20;
    
    // Calculate tilt
    if (this.config.tilt) {
      this.rotation.y = (deltaX / centerX) * 10;
      this.rotation.x = -(deltaY / centerY) * 10;
    }
    
    // Update cursor position
    this.updateCursor();
  }
  
  updateCursor() {
    if (!this.cursor) return;
    
    this.cursor.style.left = `${this.mouse.x}px`;
    this.cursor.style.top = `${this.mouse.y}px`;
  }
  
  animate() {
    // Smooth interpolation
    this.position.x += (this.target.x - this.position.x) * this.config.ease;
    this.position.y += (this.target.y - this.position.y) * this.config.ease;
    
    // Apply transforms
    if (this.wrapper) {
      const scale = this.isHovering ? this.config.scale : 1;
      const rotateX = this.isHovering && this.config.tilt ? this.rotation.x : 0;
      const rotateY = this.isHovering && this.config.tilt ? this.rotation.y : 0;
      
      this.wrapper.style.transform = `
        translate(${this.position.x}px, ${this.position.y}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(${scale})
      `;
    }
    
    if (this.image) {
      // Parallax effect on image
      const parallaxX = this.position.x * 0.3;
      const parallaxY = this.position.y * 0.3;
      this.image.style.transform = `translate(${parallaxX}px, ${parallaxY}px) scale(1.1)`;
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  createRipple(e) {
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.className = 'magnetic-ripple active';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '100px';
    ripple.style.height = '100px';
    
    this.container.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Initialize all magnetic image containers
class MagneticImageSystem {
  constructor() {
    this.instances = [];
    this.init();
  }
  
  init() {
    const containers = document.querySelectorAll('.magnetic-image-container');
    containers.forEach(container => {
      const options = this.parseOptions(container);
      const instance = new MagneticImageReveal(container, options);
      this.instances.push(instance);
    });
  }
  
  parseOptions(container) {
    const options = {};
    
    if (container.dataset.strength) {
      options.strength = parseFloat(container.dataset.strength);
    }
    if (container.dataset.ease) {
      options.ease = parseFloat(container.dataset.ease);
    }
    if (container.dataset.scale) {
      options.scale = parseFloat(container.dataset.scale);
    }
    if (container.dataset.tilt === 'false') {
      options.tilt = false;
    }
    
    return options;
  }
  
  refresh() {
    this.destroy();
    this.init();
  }
  
  destroy() {
    this.instances.forEach(instance => instance.destroy());
    this.instances = [];
  }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.magneticImageSystem = new MagneticImageSystem();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MagneticImageReveal, MagneticImageSystem };
}
