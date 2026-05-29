/**
 * v73.4: ADVANCED CUSTOM CURSOR SYSTEM
 * Fortune 500 Quality Interactive Cursor
 */

class CustomCursor {
  constructor(options = {}) {
    this.options = {
      size: 40,
      dotSize: 8,
      color: '#C9CED6',
      trail: true,
      trailLength: 5,
      magneticStrength: 0.3,
      idleTime: 3000,
      enableSpotlight: false,
      ...options
    };
    
    this.cursor = null;
    this.dot = null;
    this.ring = null;
    this.trail = [];
    this.spotlight = null;
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.cursorX = 0;
    this.cursorY = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    
    this.isActive = true;
    this.isIdle = false;
    this.idleTimeout = null;
    this.rafId = null;
    
    // Check for touch device
    this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    
    // Check for reduced motion
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!this.isTouchDevice && !this.prefersReducedMotion) {
      this.init();
    }
  }
  
  init() {
    this.createElements();
    this.bindEvents();
    this.detectInteractiveElements();
    this.startLoop();
    
    document.body.classList.add('custom-cursor-active');
  }
  
  createElements() {
    // Main cursor container
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    this.cursor.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 99999;
      will-change: transform;
    `;
    
    // Center dot
    this.dot = document.createElement('div');
    this.dot.className = 'cursor-dot';
    this.dot.style.cssText = `
      position: absolute;
      width: ${this.options.dotSize}px;
      height: ${this.options.dotSize}px;
      background: ${this.options.color};
      border-radius: 50%;
      transform: translate(-50%, -50%);
    `;
    
    // Outer ring
    this.ring = document.createElement('div');
    this.ring.className = 'cursor-ring';
    this.ring.style.cssText = `
      position: absolute;
      width: ${this.options.size}px;
      height: ${this.options.size}px;
      border: 1px solid ${this.options.color};
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    
    // Label
    this.label = document.createElement('span');
    this.label.className = 'cursor-label';
    
    // Trail elements
    if (this.options.trail) {
      for (let i = 0; i < this.options.trailLength; i++) {
        const trailDot = document.createElement('div');
        trailDot.className = 'cursor-trail';
        trailDot.style.cssText = `
          position: absolute;
          width: ${this.options.dotSize * (1 - i / this.options.trailLength)}px;
          height: ${this.options.dotSize * (1 - i / this.options.trailLength)}px;
          background: ${this.options.color};
          border-radius: 50%;
          opacity: ${0.5 - i * 0.1};
          transform: translate(-50%, -50%);
        `;
        this.trail.push({
          element: trailDot,
          x: 0,
          y: 0
        });
        this.cursor.appendChild(trailDot);
      }
    }
    
    // Spotlight effect
    if (this.options.enableSpotlight) {
      this.spotlight = document.createElement('div');
      this.spotlight.className = 'cursor-spotlight';
      document.body.appendChild(this.spotlight);
    }
    
    // Assemble cursor
    this.ring.appendChild(this.label);
    this.cursor.appendChild(this.dot);
    this.cursor.appendChild(this.ring);
    document.body.appendChild(this.cursor);
  }
  
  bindEvents() {
    // Mouse move
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.resetIdle();
    }, { passive: true });
    
    // Mouse interactions
    document.addEventListener('mousedown', () => this.onMouseDown());
    document.addEventListener('mouseup', () => this.onMouseUp());
    document.addEventListener('mouseleave', () => this.hide());
    document.addEventListener('mouseenter', () => this.show());
    
    // Click effects
    document.addEventListener('click', (e) => this.createClickRipple(e));
    
    // Hover detection
    this.setupHoverDetection();
  }
  
  setupHoverDetection() {
    const selectors = {
      link: 'a, [role="link"]',
      button: 'button, [role="button"], .btn',
      input: 'input, textarea, select',
      image: 'img, [data-cursor="image"]',
      drag: '[draggable="true"]'
    };
    
    Object.entries(selectors).forEach(([type, selector]) => {
      document.querySelectorAll(selector).forEach(el => {
        el.addEventListener('mouseenter', () => this.onElementHover(type, el));
        el.addEventListener('mouseleave', () => this.onElementLeave(type));
      });
    });
    
    // Dynamic elements
    const observer = new MutationObserver(() => {
      this.detectInteractiveElements();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  detectInteractiveElements() {
    // Add data attributes to elements for better targeting
    document.querySelectorAll('a').forEach(el => el.dataset.cursorTarget = 'link');
    document.querySelectorAll('button').forEach(el => el.dataset.cursorTarget = 'button');
    document.querySelectorAll('img').forEach(el => el.dataset.cursorTarget = 'image');
  }
  
  onElementHover(type, element) {
    this.ring.classList.add('hover');
    
    // Add specific class based on type
    this.cursor.classList.add(`cursor-hover-${type}`);
    
    // Update label if element has one
    if (element.dataset.cursorLabel) {
      this.label.textContent = element.dataset.cursorLabel;
      this.label.style.opacity = '1';
    }
    
    // Magnetic effect
    if (element.hasAttribute('data-magnetic')) {
      this.applyMagneticEffect(element);
    }
    
    // Custom cursor state
    if (element.dataset.cursorState) {
      this.setState(element.dataset.cursorState);
    }
  }
  
  onElementLeave(type) {
    this.ring.classList.remove('hover');
    this.cursor.classList.remove(`cursor-hover-${type}`);
    this.label.style.opacity = '0';
    this.resetMagnetic();
  }
  
  onMouseDown() {
    this.ring.classList.add('click');
    this.createParticles();
  }
  
  onMouseUp() {
    this.ring.classList.remove('click');
  }
  
  setState(state) {
    this.ring.dataset.state = state;
  }
  
  applyMagneticEffect(element) {
    const strength = parseFloat(element.dataset.magnetic) || this.options.magneticStrength;
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (this.mouseX - centerX) * strength;
    const deltaY = (this.mouseY - centerY) * strength;
    
    element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  }
  
  resetMagnetic() {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.style.transform = '';
    });
  }
  
  createClickRipple(e) {
    const ripple = document.createElement('div');
    ripple.className = 'cursor-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
  
  createParticles() {
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('div');
      particle.className = 'cursor-particle';
      particle.style.left = this.cursorX + 'px';
      particle.style.top = this.cursorY + 'px';
      particle.style.setProperty('--particle-x', `${(Math.random() - 0.5) * 40}px`);
      particle.style.setProperty('--particle-y', `${(Math.random() - 0.5) * 40}px`);
      document.body.appendChild(particle);
      
      setTimeout(() => particle.remove(), 1000);
    }
  }
  
  resetIdle() {
    this.isIdle = false;
    this.cursor.classList.remove('cursor-idle');
    
    clearTimeout(this.idleTimeout);
    this.idleTimeout = setTimeout(() => {
      this.isIdle = true;
      this.cursor.classList.add('cursor-idle');
    }, this.options.idleTime);
  }
  
  startLoop() {
    const loop = () => {
      if (this.isActive) {
        this.updatePosition();
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
  
  updatePosition() {
    // Smooth follow with easing
    const ease = 0.15;
    this.velocityX = (this.mouseX - this.cursorX) * ease;
    this.velocityY = (this.mouseY - this.cursorY) * ease;
    
    this.cursorX += this.velocityX;
    this.cursorY += this.velocityY;
    
    // Apply position
    this.cursor.style.transform = `translate3d(${this.cursorX}px, ${this.cursorY}px, 0)`;
    
    // Update trail
    this.trail.forEach((item, index) => {
      const trailEase = 0.1 - index * 0.015;
      item.x += (this.cursorX - item.x) * trailEase;
      item.y += (this.cursorY - item.y) * trailEase;
      item.element.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
    });
    
    // Update spotlight
    if (this.spotlight) {
      document.documentElement.style.setProperty('--cursor-x', this.cursorX + 'px');
      document.documentElement.style.setProperty('--cursor-y', this.cursorY + 'px');
    }
    
    // Velocity-based skew
    const skewAmount = Math.min(Math.abs(this.velocityX) * 0.5, 15);
    if (Math.abs(this.velocityX) > 2) {
      this.ring.style.transform = `translate(-50%, -50%) skewX(${this.velocityX > 0 ? skewAmount : -skewAmount}deg)`;
    }
  }
  
  show() {
    this.cursor.style.opacity = '1';
  }
  
  hide() {
    this.cursor.style.opacity = '0';
  }
  
  // Public API
  setColor(color) {
    this.dot.style.background = color;
    this.ring.style.borderColor = color;
    this.trail.forEach(t => t.element.style.background = color);
  }
  
  setSize(size) {
    this.ring.style.width = size + 'px';
    this.ring.style.height = size + 'px';
  }
  
  enableSpotlight() {
    if (!this.spotlight) {
      this.spotlight = document.createElement('div');
      this.spotlight.className = 'cursor-spotlight';
      document.body.appendChild(this.spotlight);
    }
    this.spotlight.classList.add('active');
  }
  
  disableSpotlight() {
    this.spotlight?.classList.remove('active');
  }
  
  destroy() {
    cancelAnimationFrame(this.rafId);
    this.cursor?.remove();
    this.spotlight?.remove();
    document.body.classList.remove('custom-cursor-active');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.customCursor = new CustomCursor({
    enableSpotlight: false,
    trail: true,
    trailLength: 3
  });
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomCursor;
}
