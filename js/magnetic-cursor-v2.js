/**
 * BuildBridge Magnetic Cursor v2.0
 * Fortune 500 Custom Cursor Controller
 * Spring physics-based cursor with magnetic effects
 * =====================================================
 */

class MagneticCursor {
  constructor(options = {}) {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.options = {
      trailLength: options.trailLength || 8,
      trailDelay: options.trailDelay || 50,
      springStiffness: options.springStiffness || 0.15,
      springDamping: options.springDamping || 0.75,
      magneticStrength: options.magneticStrength || 0.3,
      magneticRadius: options.magneticRadius || 100,
      ...options
    };
    
    this.state = {
      mouseX: 0,
      mouseY: 0,
      cursorX: 0,
      cursorY: 0,
      velocityX: 0,
      velocityY: 0,
      isActive: true,
      isHovering: false,
      hoverType: null
    };
    
    this.elements = {
      main: null,
      ring: null,
      trail: [],
      label: null
    };
    
    this.magneticElements = [];
    this.rafId = null;
    
    this.init();
  }
  
  init() {
    this.createCursorElements();
    this.bindEvents();
    this.startAnimation();
    this.findMagneticElements();
  }
  
  createCursorElements() {
    // Main cursor dot
    this.elements.main = document.createElement('div');
    this.elements.main.className = 'cursor-main';
    document.body.appendChild(this.elements.main);
    
    // Outer ring
    this.elements.ring = document.createElement('div');
    this.elements.ring.className = 'cursor-ring';
    document.body.appendChild(this.elements.ring);
    
    // Trail dots
    for (let i = 0; i < this.options.trailLength; i++) {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail-dot';
      trail.style.opacity = (1 - i / this.options.trailLength) * 0.5;
      document.body.appendChild(trail);
      this.elements.trail.push({
        el: trail,
        x: 0,
        y: 0
      });
    }
    
    // Label
    this.elements.label = document.createElement('div');
    this.elements.label.className = 'cursor-label';
    document.body.appendChild(this.elements.label);
  }
  
  bindEvents() {
    // Mouse movement
    document.addEventListener('mousemove', (e) => {
      this.state.mouseX = e.clientX;
      this.state.mouseY = e.clientY;
      this.state.isActive = true;
    });
    
    // Mouse down/up
    document.addEventListener('mousedown', () => {
      this.elements.main.classList.add('clicking');
      this.elements.ring.classList.add('clicking');
    });
    
    document.addEventListener('mouseup', () => {
      this.elements.main.classList.remove('clicking');
      this.elements.ring.classList.remove('clicking');
    });
    
    // Hover detection
    this.setupHoverDetection();
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      this.state.isActive = document.visibilityState === 'visible';
    });
    
    // Re-scan for magnetic elements on DOM changes
    const observer = new MutationObserver(() => {
      this.findMagneticElements();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  setupHoverDetection() {
    // Link hover
    document.querySelectorAll('a, button, [data-cursor="link"]').forEach(el => {
      el.addEventListener('mouseenter', () => this.setHoverState('link'));
      el.addEventListener('mouseleave', () => this.clearHoverState());
    });
    
    // Button hover
    document.querySelectorAll('.btn, [data-cursor="button"]').forEach(el => {
      el.addEventListener('mouseenter', () => this.setHoverState('button'));
      el.addEventListener('mouseleave', () => this.clearHoverState());
    });
    
    // Image hover
    document.querySelectorAll('img, [data-cursor="image"]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.setHoverState('image');
        this.setLabel('View');
      });
      el.addEventListener('mouseleave', () => {
        this.clearHoverState();
        this.clearLabel();
      });
    });
    
    // Text hover (for editing)
    document.querySelectorAll('input, textarea, [contenteditable], [data-cursor="text"]').forEach(el => {
      el.addEventListener('mouseenter', () => this.setHoverState('text'));
      el.addEventListener('mouseleave', () => this.clearHoverState());
    });
  }
  
  findMagneticElements() {
    this.magneticElements = [];
    
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      const strength = parseFloat(el.dataset.magnetic) || this.options.magneticStrength;
      this.magneticElements.push({
        el,
        strength,
        rect: el.getBoundingClientRect(),
        originalX: 0,
        originalY: 0
      });
    });
    
    // Update magnetic element positions on scroll
    window.addEventListener('scroll', () => {
      this.magneticElements.forEach(item => {
        item.rect = item.el.getBoundingClientRect();
      });
    }, { passive: true });
  }
  
  setHoverState(type) {
    this.state.isHovering = true;
    this.state.hoverType = type;
    
    this.elements.main.classList.add(`hover-${type}`);
    this.elements.ring.classList.add(`hover-${type}`);
  }
  
  clearHoverState() {
    this.state.isHovering = false;
    this.state.hoverType = null;
    
    this.elements.main.classList.remove('hover-link', 'hover-button', 'hover-image', 'hover-text');
    this.elements.ring.classList.remove('hover-link', 'hover-button', 'hover-image', 'hover-text');
  }
  
  setLabel(text) {
    this.elements.label.textContent = text;
    this.elements.label.classList.add('visible');
  }
  
  clearLabel() {
    this.elements.label.classList.remove('visible');
  }
  
  calculateMagneticOffset() {
    let offsetX = 0;
    let offsetY = 0;
    
    this.magneticElements.forEach(item => {
      const centerX = item.rect.left + item.rect.width / 2;
      const centerY = item.rect.top + item.rect.height / 2;
      
      const dx = this.state.mouseX - centerX;
      const dy = this.state.mouseY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.options.magneticRadius) {
        const force = (1 - distance / this.options.magneticRadius) * item.strength;
        
        // Move element toward cursor (magnetic pull)
        const moveX = dx * force;
        const moveY = dy * force;
        
        item.el.style.transform = `translate(${moveX}px, ${moveY}px)`;
        
        // Also attract cursor toward element center
        offsetX += (centerX - this.state.mouseX) * force * 0.3;
        offsetY += (centerY - this.state.mouseY) * force * 0.3;
      } else {
        item.el.style.transform = '';
      }
    });
    
    return { x: offsetX, y: offsetY };
  }
  
  startAnimation() {
    const animate = () => {
      if (!this.state.isActive) {
        this.rafId = requestAnimationFrame(animate);
        return;
      }
      
      // Calculate magnetic offset
      const magneticOffset = this.calculateMagneticOffset();
      const targetX = this.state.mouseX + magneticOffset.x;
      const targetY = this.state.mouseY + magneticOffset.y;
      
      // Spring physics for smooth cursor following
      const ax = (targetX - this.state.cursorX) * this.options.springStiffness;
      const ay = (targetY - this.state.cursorY) * this.options.springStiffness;
      
      this.state.velocityX += ax;
      this.state.velocityY += ay;
      this.state.velocityX *= this.options.springDamping;
      this.state.velocityY *= this.options.springDamping;
      
      this.state.cursorX += this.state.velocityX;
      this.state.cursorY += this.state.velocityY;
      
      // Update main cursor
      this.elements.main.style.transform = `translate(${this.state.cursorX}px, ${this.state.cursorY}px) translate(-50%, -50%)`;
      
      // Update ring (slightly delayed)
      const ringX = this.state.cursorX - this.state.velocityX * 2;
      const ringY = this.state.cursorY - this.state.velocityY * 2;
      this.elements.ring.style.left = `${ringX}px`;
      this.elements.ring.style.top = `${ringY}px`;
      
      // Update trail
      this.updateTrail();
      
      // Update label position
      this.elements.label.style.left = `${this.state.cursorX}px`;
      this.elements.label.style.top = `${this.state.cursorY - 40}px`;
      
      this.rafId = requestAnimationFrame(animate);
    };
    
    this.rafId = requestAnimationFrame(animate);
  }
  
  updateTrail() {
    let prevX = this.state.cursorX;
    let prevY = this.state.cursorY;
    
    this.elements.trail.forEach((trail, i) => {
      const delay = (i + 1) * this.options.trailDelay * 0.001;
      
      trail.x += (prevX - trail.x) * (0.3 - i * 0.02);
      trail.y += (prevY - trail.y) * (0.3 - i * 0.02);
      
      trail.el.style.transform = `translate(${trail.x}px, ${trail.y}px) translate(-50%, -50%)`;
      
      prevX = trail.x;
      prevY = trail.y;
    });
  }
  
  // Public methods
  hide() {
    this.elements.main.style.opacity = '0';
    this.elements.ring.style.opacity = '0';
    this.elements.trail.forEach(t => t.el.style.opacity = '0');
  }
  
  show() {
    this.elements.main.style.opacity = '1';
    this.elements.ring.style.opacity = '1';
  }
  
  setMode(mode) {
    document.body.className = document.body.className.replace(/cursor-mode--\w+/g, '');
    if (mode) {
      document.body.classList.add(`cursor-mode--${mode}`);
    }
  }
  
  destroy() {
    cancelAnimationFrame(this.rafId);
    [this.elements.main, this.elements.ring, this.elements.label, ...this.elements.trail.map(t => t.el)]
      .forEach(el => el?.remove());
  }
}

// =========================================
// MAGNETIC BUTTON ENHANCER
// =========================================
class MagneticButton {
  constructor(element, options = {}) {
    this.el = element;
    this.options = {
      strength: options.strength || 0.3,
      radius: options.radius || 150,
      ...options
    };
    
    this.isHovering = false;
    this.rect = null;
    this.center = { x: 0, y: 0 };
    
    this.init();
  }
  
  init() {
    this.el.addEventListener('mouseenter', () => {
      this.isHovering = true;
      this.updateRect();
    });
    
    this.el.addEventListener('mouseleave', () => {
      this.isHovering = false;
      this.el.style.transform = '';
    });
    
    this.el.addEventListener('mousemove', (e) => {
      if (!this.isHovering) return;
      
      const x = e.clientX - this.center.x;
      const y = e.clientY - this.center.y;
      
      this.el.style.transform = `translate(${x * this.options.strength}px, ${y * this.options.strength}px)`;
    });
  }
  
  updateRect() {
    this.rect = this.el.getBoundingClientRect();
    this.center = {
      x: this.rect.left + this.rect.width / 2,
      y: this.rect.top + this.rect.height / 2
    };
  }
}

// =========================================
// INITIALIZE
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize magnetic cursor
  const cursor = new MagneticCursor({
    trailLength: 6,
    springStiffness: 0.12,
    springDamping: 0.72,
    magneticStrength: 0.25
  });
  
  // Initialize magnetic buttons
  document.querySelectorAll('.btn-magnetic, [data-magnetic]').forEach(btn => {
    new MagneticButton(btn, {
      strength: parseFloat(btn.dataset.magnetic) || 0.3
    });
  });
  
  // Expose globally
  window.MagneticCursor = cursor;
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MagneticCursor, MagneticButton };
}
