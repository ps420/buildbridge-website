/**
 * Advanced 3D Card Tilt with Glare Effect
 * Fortune 500 Premium Card Interactions
 * 
 * Features:
 * - Smooth 3D tilt based on mouse position
 * - Dynamic glare that follows mouse
 * - Parallax layers with different depth
 * - Magnetic hover effect
 * - Spring animation on hover
 */

class Card3DTilt {
  constructor(element, options = {}) {
    this.card = element;
    this.options = {
      maxTilt: parseFloat(element.dataset.tiltMax) || 15,
      perspective: parseFloat(element.dataset.tiltPerspective) || 1000,
      scale: parseFloat(element.dataset.tiltScale) || 1.02,
      speed: parseFloat(element.dataset.tiltSpeed) || 400,
      glare: element.dataset.tiltGlare !== 'false',
      glareOpacity: parseFloat(element.dataset.tiltGlareOpacity) || 0.3,
      magnetic: element.dataset.tiltMagnetic === 'true',
      magneticStrength: parseFloat(element.dataset.tiltMagneticStrength) || 0.3,
      ...options
    };
    
    this.tiltValues = { x: 0, y: 0 };
    this.glareValues = { x: 50, y: 50 };
    this.isHovering = false;
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    this.setupElements();
    this.setupEventListeners();
    this.setupStyles();
  }
  
  setupElements() {
    // Create inner container if not exists
    if (!this.card.querySelector('.card-inner')) {
      const inner = document.createElement('div');
      inner.className = 'card-inner';
      
      // Move all children to inner
      while (this.card.firstChild) {
        inner.appendChild(this.card.firstChild);
      }
      
      this.card.appendChild(inner);
    }
    
    this.inner = this.card.querySelector('.card-inner');
    
    // Create glare element if enabled
    if (this.options.glare && !this.card.querySelector('.tilt-card-glare')) {
      const glare = document.createElement('div');
      glare.className = 'tilt-card-glare';
      this.card.appendChild(glare);
    }
    
    this.glare = this.card.querySelector('.tilt-card-glare');
    
    // Create decoration elements
    if (!this.card.querySelector('.tilt-card-decoration-1')) {
      const decor1 = document.createElement('div');
      decor1.className = 'tilt-card-decoration tilt-card-decoration-1';
      this.inner.appendChild(decor1);
      
      const decor2 = document.createElement('div');
      decor2.className = 'tilt-card-decoration tilt-card-decoration-2';
      this.inner.appendChild(decor2);
    }
    
    // Create shadow element
    if (!this.card.querySelector('.tilt-card-shadow')) {
      const shadow = document.createElement('div');
      shadow.className = 'tilt-card-shadow';
      this.card.insertBefore(shadow, this.card.firstChild);
    }
    
    this.shadow = this.card.querySelector('.tilt-card-shadow');
  }
  
  setupStyles() {
    this.card.style.transformStyle = 'preserve-3d';
    this.card.style.perspective = `${this.options.perspective}px`;
    this.inner.style.transformStyle = 'preserve-3d';
  }
  
  setupEventListeners() {
    // Mouse events
    this.card.addEventListener('mouseenter', (e) => this.onMouseEnter(e));
    this.card.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.card.addEventListener('mouseleave', () => this.onMouseLeave());
    
    // Touch events for mobile
    this.card.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
    this.card.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
    this.card.addEventListener('touchend', () => this.onMouseLeave());
    
    // Device orientation for mobile tilt
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => this.onDeviceOrientation(e));
    }
  }
  
  onMouseEnter(e) {
    this.isHovering = true;
    this.card.classList.add('spring-in');
    
    setTimeout(() => {
      this.card.classList.remove('spring-in');
    }, 400);
    
    this.update(e);
  }
  
  onMouseMove(e) {
    if (!this.isHovering) return;
    this.update(e);
  }
  
  onMouseLeave() {
    this.isHovering = false;
    this.reset();
  }
  
  onTouchStart(e) {
    this.isHovering = true;
    this.update(e.touches[0]);
  }
  
  onTouchMove(e) {
    if (!this.isHovering) return;
    this.update(e.touches[0]);
  }
  
  onDeviceOrientation(e) {
    if (this.isHovering) return; // Don't conflict with touch
    
    const tiltX = (e.gamma || 0) / 45; // Left/right tilt
    const tiltY = (e.beta || 0) / 45;  // Front/back tilt
    
    this.tiltValues = {
      x: Math.max(-1, Math.min(1, tiltX)) * this.options.maxTilt,
      y: Math.max(-1, Math.min(1, tiltY)) * this.options.maxTilt
    };
    
    this.applyTransform();
  }
  
  update(e) {
    const rect = this.card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate tilt values (-1 to 1)
    const rotateX = (mouseY / (rect.height / 2)) * -1;
    const rotateY = mouseX / (rect.width / 2);
    
    // Apply max tilt
    this.tiltValues = {
      x: rotateX * this.options.maxTilt,
      y: rotateY * this.options.maxTilt
    };
    
    // Calculate glare position (0 to 100)
    this.glareValues = {
      x: 50 + (rotateY * 50),
      y: 50 + (rotateX * 50)
    };
    
    // Magnetic effect
    if (this.options.magnetic) {
      this.applyMagneticEffect(mouseX, mouseY, rect);
    }
    
    this.applyTransform();
  }
  
  applyMagneticEffect(mouseX, mouseY, rect) {
    const strength = this.options.magneticStrength;
    const maxOffset = 20;
    
    const offsetX = (mouseX / rect.width) * maxOffset * strength;
    const offsetY = (mouseY / rect.height) * maxOffset * strength;
    
    this.card.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  }
  
  applyTransform() {
    const { x, y } = this.tiltValues;
    
    // Apply 3D rotation with scale
    this.inner.style.transform = `
      rotateX(${x}deg) 
      rotateY(${y}deg) 
      scale3d(${this.options.scale}, ${this.options.scale}, ${this.options.scale})
    `;
    
    // Update glare position
    if (this.glare) {
      this.glare.style.backgroundPosition = `${this.glareValues.x}% ${this.glareValues.y}%`;
    }
    
    // Update shadow position (opposite direction)
    if (this.shadow) {
      const shadowX = -y * 2;
      const shadowY = x * 2;
      this.shadow.style.transform = `
        translateZ(-50px) 
        translate(${shadowX}px, ${shadowY}px)
      `;
    }
    
    // Parallax effect for content
    const content = this.card.querySelectorAll('.tilt-card-content, .tilt-card-icon, .tilt-card-title');
    content.forEach((el, index) => {
      const depth = (index + 1) * 10;
      const moveX = y * depth / 10;
      const moveY = -x * depth / 10;
      el.style.transform = `translateX(${moveX}px) translateY(${moveY}px) translateZ(${depth}px)`;
    });
  }
  
  reset() {
    // Smooth reset animation
    this.inner.style.transition = `transform ${this.options.speed}ms cubic-bezier(0.23, 1, 0.32, 1)`;
    this.inner.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    
    if (this.card.style.transform) {
      this.card.style.transition = `transform ${this.options.speed}ms cubic-bezier(0.23, 1, 0.32, 1)`;
      this.card.style.transform = '';
    }
    
    // Reset glare
    if (this.glare) {
      this.glare.style.transition = `background-position ${this.options.speed}ms ease`;
      this.glare.style.backgroundPosition = '50% 50%';
    }
    
    // Reset shadow
    if (this.shadow) {
      this.shadow.style.transition = `transform ${this.options.speed}ms ease`;
      this.shadow.style.transform = 'translateZ(-50px)';
    }
    
    // Reset content parallax
    const content = this.card.querySelectorAll('.tilt-card-content, .tilt-card-icon, .tilt-card-title');
    content.forEach(el => {
      el.style.transition = `transform ${this.options.speed}ms ease`;
      el.style.transform = '';
    });
    
    // Remove transitions after animation
    setTimeout(() => {
      this.inner.style.transition = '';
      this.card.style.transition = '';
      if (this.glare) this.glare.style.transition = '';
      if (this.shadow) this.shadow.style.transition = '';
      content.forEach(el => el.style.transition = '');
    }, this.options.speed);
  }
  
  destroy() {
    // Remove event listeners
    this.card.removeEventListener('mouseenter', this.onMouseEnter);
    this.card.removeEventListener('mousemove', this.onMouseMove);
    this.card.removeEventListener('mouseleave', this.onMouseLeave);
  }
}

// Batch initialization for performance
class Card3DTiltManager {
  constructor() {
    this.cards = [];
    this.init();
  }
  
  init() {
    // Use Intersection Observer for lazy initialization
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.initCard(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('[data-tilt-3d]').forEach(card => {
      observer.observe(card);
    });
  }
  
  initCard(card) {
    if (!card._tiltInstance) {
      card._tiltInstance = new Card3DTilt(card);
      this.cards.push(card._tiltInstance);
    }
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  new Card3DTiltManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Card3DTilt, Card3DTiltManager };
}
