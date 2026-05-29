/**
 * V87.2: 3D TILT CARDS WITH GLARE EFFECT
 * Professional Card Hover Interactions with Physics
 * Fortune 500 Quality Micro-interactions
 */

class TiltCard3D {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      maxTilt: options.maxTilt || 15,
      perspective: options.perspective || 1000,
      scale: options.scale || 1.02,
      speed: options.speed || 400,
      glare: options.glare !== false,
      maxGlare: options.maxGlare || 0.3,
      axis: options.axis || 'both', // 'both', 'x', 'y'
      ...options
    };
    
    this.isHovering = false;
    this.transitionTimeout = null;
    
    this.init();
  }
  
  init() {
    // Set perspective on parent
    this.element.style.transformStyle = 'preserve-3d';
    this.element.style.transformPerspective = `${this.options.perspective}px`;
    this.element.style.transition = `transform ${this.options.speed}ms ease-out`;
    
    // Create glare element if enabled
    if (this.options.glare) {
      this.createGlare();
    }
    
    // Create 3D depth layers
    this.createDepthLayers();
    
    // Bind events
    this.bindEvents();
  }
  
  createGlare() {
    this.glareElement = document.createElement('div');
    this.glareElement.className = 'card-glare';
    this.glareElement.style.cssText = `
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0) 40%,
        rgba(255, 255, 255, ${this.options.maxGlare}) 50%,
        rgba(255, 255, 255, 0) 60%,
        rgba(255, 255, 255, 0) 100%
      );
      pointer-events: none;
      opacity: 0;
      transition: opacity ${this.options.speed}ms ease-out;
      transform: translateZ(1px);
      border-radius: inherit;
    `;
    
    this.element.style.position = 'relative';
    this.element.appendChild(this.glareElement);
  }
  
  createDepthLayers() {
    // Find elements with data-tilt-depth attribute
    const depthElements = this.element.querySelectorAll('[data-tilt-depth]');
    
    depthElements.forEach(el => {
      const depth = parseFloat(el.dataset.tiltDepth) || 20;
      el.style.transform = `translateZ(${depth}px)`;
      el.style.transformStyle = 'preserve-3d';
    });
    
    // Auto-add depth to common elements if not specified
    const cardContent = this.element.querySelector('.card-content');
    if (cardContent && !cardContent.dataset.tiltDepth) {
      cardContent.style.transform = 'translateZ(30px)';
    }
    
    const cardIcon = this.element.querySelector('.service-icon, .card-icon');
    if (cardIcon && !cardIcon.dataset.tiltDepth) {
      cardIcon.style.transform = 'translateZ(50px)';
    }
  }
  
  bindEvents() {
    // Mouse enter
    this.element.addEventListener('mouseenter', (e) => {
      this.isHovering = true;
      this.element.style.transition = 'none';
      if (this.glareElement) {
        this.glareElement.style.transition = 'none';
      }
      this.handleMove(e);
    }, { passive: true });
    
    // Mouse move
    this.element.addEventListener('mousemove', (e) => {
      if (!this.isHovering) return;
      requestAnimationFrame(() => this.handleMove(e));
    }, { passive: true });
    
    // Mouse leave
    this.element.addEventListener('mouseleave', () => {
      this.isHovering = false;
      this.reset();
    }, { passive: true });
    
    // Touch support (subtle on mobile)
    this.element.addEventListener('touchstart', (e) => {
      this.isHovering = true;
      this.element.style.transition = 'none';
      this.handleTouch(e);
    }, { passive: true });
    
    this.element.addEventListener('touchmove', (e) => {
      if (!this.isHovering) return;
      this.handleTouch(e);
    }, { passive: true });
    
    this.element.addEventListener('touchend', () => {
      this.isHovering = false;
      this.reset();
    }, { passive: true });
  }
  
  handleMove(e) {
    const rect = this.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate mouse position relative to center (-1 to 1)
    const percentX = (e.clientX - centerX) / (rect.width / 2);
    const percentY = (e.clientY - centerY) / (rect.height / 2);
    
    // Calculate tilt angles
    let tiltX = 0;
    let tiltY = 0;
    
    if (this.options.axis === 'both' || this.options.axis === 'y') {
      tiltX = -percentY * this.options.maxTilt;
    }
    if (this.options.axis === 'both' || this.options.axis === 'x') {
      tiltY = percentX * this.options.maxTilt;
    }
    
    // Apply transform
    this.element.style.transform = `
      perspective(${this.options.perspective}px)
      rotateX(${tiltX}deg)
      rotateY(${tiltY}deg)
      scale3d(${this.options.scale}, ${this.options.scale}, ${this.options.scale})
    `;
    
    // Update glare position
    if (this.glareElement) {
      const glareX = (percentX + 1) / 2 * 100;
      const glareY = (percentY + 1) / 2 * 100;
      
      this.glareElement.style.background = `
        radial-gradient(
          circle at ${glareX}% ${glareY}%,
          rgba(255, 255, 255, ${this.options.maxGlare}) 0%,
          rgba(255, 255, 255, 0) 60%
        )
      `;
      this.glareElement.style.opacity = '1';
    }
    
    // Add magnetic pull to inner elements
    const magneticElements = this.element.querySelectorAll('[data-magnetic]');
    magneticElements.forEach(el => {
      const strength = parseFloat(el.dataset.magnetic) || 0.3;
      const moveX = percentX * 10 * strength;
      const moveY = percentY * 10 * strength;
      
      // Preserve existing transform
      const existingTransform = el.style.transform || '';
      const zTransform = existingTransform.match(/translateZ\([^)]+\)/);
      const zValue = zTransform ? zTransform[0] : 'translateZ(0)';
      
      el.style.transform = `translate(${moveX}px, ${moveY}px) ${zValue}`;
    });
  }
  
  handleTouch(e) {
    const touch = e.touches[0];
    if (!touch) return;
    
    const rect = this.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const percentX = (touch.clientX - centerX) / (rect.width / 2);
    const percentY = (touch.clientY - centerY) / (rect.height / 2);
    
    // More subtle on touch devices
    const touchMultiplier = 0.5;
    
    let tiltX = 0;
    let tiltY = 0;
    
    if (this.options.axis === 'both' || this.options.axis === 'y') {
      tiltX = -percentY * this.options.maxTilt * touchMultiplier;
    }
    if (this.options.axis === 'both' || this.options.axis === 'x') {
      tiltY = percentX * this.options.maxTilt * touchMultiplier;
    }
    
    this.element.style.transform = `
      perspective(${this.options.perspective}px)
      rotateX(${tiltX}deg)
      rotateY(${tiltY}deg)
      scale3d(${this.options.scale}, ${this.options.scale}, ${this.options.scale})
    `;
  }
  
  reset() {
    this.element.style.transition = `transform ${this.options.speed}ms ease-out`;
    this.element.style.transform = `
      perspective(${this.options.perspective}px)
      rotateX(0deg)
      rotateY(0deg)
      scale3d(1, 1, 1)
    `;
    
    if (this.glareElement) {
      this.glareElement.style.transition = `opacity ${this.options.speed}ms ease-out`;
      this.glareElement.style.opacity = '0';
    }
    
    // Reset magnetic elements
    const magneticElements = this.element.querySelectorAll('[data-magnetic]');
    magneticElements.forEach(el => {
      const existingTransform = el.style.transform || '';
      const zTransform = existingTransform.match(/translateZ\([^)]+\)/);
      const zValue = zTransform ? zTransform[0] : '';
      el.style.transform = zValue;
    });
  }
  
  destroy() {
    this.isHovering = false;
    this.reset();
    if (this.glareElement) {
      this.glareElement.remove();
    }
  }
}

// ========================================
// BATCH INITIALIZATION
// ========================================

function initTiltCards() {
  // Skip on touch-only devices for performance
  if (window.matchMedia('(pointer: coarse)').matches) {
    return;
  }
  
  const cards = document.querySelectorAll('.tilt-card-3d, [data-tilt]');
  
  cards.forEach(card => {
    // Skip if already initialized
    if (card._tiltCard) return;
    
    const options = {
      maxTilt: parseFloat(card.dataset.tiltMax) || 15,
      scale: parseFloat(card.dataset.tiltScale) || 1.02,
      glare: card.dataset.tiltGlare !== 'false',
      maxGlare: parseFloat(card.dataset.tiltGlareMax) || 0.3,
      axis: card.dataset.tiltAxis || 'both',
      speed: parseInt(card.dataset.tiltSpeed) || 400
    };
    
    card._tiltCard = new TiltCard3D(card, options);
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTiltCards);
} else {
  initTiltCards();
}

// Re-initialize on dynamic content
const tiltObserver = new MutationObserver((mutations) => {
  let shouldInit = false;
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) {
        if (node.matches?.('.tilt-card-3d, [data-tilt]') ||
            node.querySelector?.('.tilt-card-3d, [data-tilt]')) {
          shouldInit = true;
        }
      }
    });
  });
  
  if (shouldInit) {
    initTiltCards();
  }
});

tiltObserver.observe(document.body, { childList: true, subtree: true });

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TiltCard3D;
}
