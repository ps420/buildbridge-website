/**
 * v94.0: Enhanced Magnetic Cursor System
 * Fortune 500 Interactive Cursor Experience with Physics-based Movement
 */

class EnhancedMagneticCursor {
  constructor(options = {}) {
    this.options = {
      magneticStrength: options.magneticStrength || 0.3,
      magneticRadius: options.magneticRadius || 100,
      cursorSize: options.cursorSize || 12,
      trailCount: options.trailCount || 3,
      trailDelay: options.trailDelay || 0.1,
      enableGlow: options.enableGlow !== false,
      enableTrails: options.enableTrails !== false,
      enableSnap: options.enableSnap !== false,
      ...options
    };
    
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.velocity = { x: 0, y: 0 };
    this.isActive = true;
    this.magneticElements = [];
    this.isHovering = false;
    
    // Check for touch device
    this.isTouchDevice = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
    
    if (!this.isTouchDevice) {
      this.init();
    }
  }
  
  init() {
    this.createCursor();
    this.findMagneticElements();
    this.bindEvents();
    this.animate();
    
    // Enable body class
    document.body.classList.add('magnetic-cursor-enabled');
  }
  
  createCursor() {
    // Main cursor dot
    this.cursorElement = document.createElement('div');
    this.cursorElement.className = 'magnetic-cursor';
    document.body.appendChild(this.cursorElement);
    
    // Cursor ring
    this.ringElement = document.createElement('div');
    this.ringElement.className = 'magnetic-cursor-ring';
    document.body.appendChild(this.ringElement);
    
    // Cursor trails
    if (this.options.enableTrails) {
      this.trails = [];
      for (let i = 0; i < this.options.trailCount; i++) {
        const trail = document.createElement('div');
        trail.className = 'magnetic-cursor-trail';
        trail.style.opacity = 1 - (i / this.options.trailCount) * 0.7;
        document.body.appendChild(trail);
        this.trails.push({
          element: trail,
          x: this.cursor.x,
          y: this.cursor.y
        });
      }
    }
    
    // Cursor label
    this.labelElement = document.createElement('div');
    this.labelElement.className = 'magnetic-cursor-label';
    document.body.appendChild(this.labelElement);
    
    // Glow effect
    if (this.options.enableGlow) {
      this.glowElement = document.createElement('div');
      this.glowElement.className = 'cursor-glow';
      document.body.appendChild(this.glowElement);
    }
  }
  
  findMagneticElements() {
    this.magneticElements = Array.from(document.querySelectorAll('[data-magnetic]'));
    
    this.magneticElements.forEach(el => {
      const strength = parseFloat(el.dataset.magnetic) || this.options.magneticStrength;
      const rect = el.getBoundingClientRect();
      
      el._magnetic = {
        strength: strength,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        originalTransform: el.style.transform
      };
    });
  }
  
  bindEvents() {
    // Mouse move
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });
    
    // Mouse down/up for click states
    document.addEventListener('mousedown', () => {
      this.cursorElement.classList.add('click');
      this.ringElement.classList.add('click');
    });
    
    document.addEventListener('mouseup', () => {
      this.cursorElement.classList.remove('click');
      this.ringElement.classList.remove('click');
    });
    
    // Interactive element detection
    document.addEventListener('mouseover', (e) => {
      const target = e.target;
      
      // Check for hover states
      if (target.matches('a, button, [data-cursor-hover], [role="button"]')) {
        this.cursorElement.classList.add('hover');
        this.ringElement.classList.add('hover');
        this.isHovering = true;
        
        // Show custom label if set
        const label = target.dataset.cursorText;
        if (label) {
          this.labelElement.textContent = label;
          this.labelElement.classList.add('visible');
        }
      }
      
      // Text input fields
      if (target.matches('input[type="text"], textarea, [contenteditable]')) {
        this.cursorElement.classList.add('text');
      }
      
      // Hide cursor on iframes/videos
      if (target.matches('iframe, video')) {
        this.cursorElement.classList.add('hide');
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      const target = e.target;
      
      if (target.matches('a, button, [data-cursor-hover], [role="button"]')) {
        this.cursorElement.classList.remove('hover');
        this.ringElement.classList.remove('hover');
        this.isHovering = false;
        this.labelElement.classList.remove('visible');
      }
      
      if (target.matches('input[type="text"], textarea, [contenteditable]')) {
        this.cursorElement.classList.remove('text');
      }
      
      if (target.matches('iframe, video')) {
        this.cursorElement.classList.remove('hide');
      }
    });
    
    // Update magnetic element positions on scroll/resize
    window.addEventListener('scroll', () => this.updateMagneticPositions(), { passive: true });
    window.addEventListener('resize', () => this.updateMagneticPositions());
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden;
    });
    
    // Handle drag states
    document.addEventListener('dragstart', () => {
      this.cursorElement.classList.add('drag');
    });
    
    document.addEventListener('dragend', () => {
      this.cursorElement.classList.remove('drag');
    });
  }
  
  updateMagneticPositions() {
    this.magneticElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      el._magnetic.centerX = rect.left + rect.width / 2;
      el._magnetic.centerY = rect.top + rect.height / 2;
    });
  }
  
  animate() {
    if (!this.isActive) {
      requestAnimationFrame(() => this.animate());
      return;
    }
    
    // Smooth cursor following with lerp
    const ease = 0.15;
    this.velocity.x = (this.mouse.x - this.cursor.x) * ease;
    this.velocity.y = (this.mouse.y - this.cursor.y) * ease;
    
    this.cursor.x += this.velocity.x;
    this.cursor.y += this.velocity.y;
    
    // Check magnetic elements
    let magneticOffset = { x: 0, y: 0 };
    
    if (this.options.enableSnap && !this.isHovering) {
      this.magneticElements.forEach(el => {
        const mag = el._magnetic;
        const dx = this.mouse.x - mag.centerX;
        const dy = this.mouse.y - mag.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.options.magneticRadius) {
          const force = (1 - distance / this.options.magneticRadius) * mag.strength;
          magneticOffset.x += dx * force * 0.5;
          magneticOffset.y += dy * force * 0.5;
          
          // Move element toward cursor
          const moveX = -dx * force * 0.3;
          const moveY = -dy * force * 0.3;
          el.style.transform = `translate(${moveX}px, ${moveY}px)`;
        } else {
          // Reset element position
          if (el.style.transform !== mag.originalTransform) {
            el.style.transform = mag.originalTransform || '';
          }
        }
      });
    }
    
    // Apply cursor position
    const finalX = this.cursor.x + magneticOffset.x;
    const finalY = this.cursor.y + magneticOffset.y;
    
    this.cursorElement.style.left = `${finalX}px`;
    this.cursorElement.style.top = `${finalY}px`;
    
    // Ring follows with more delay
    this.ringElement.style.left = `${this.cursor.x}px`;
    this.ringElement.style.top = `${this.cursor.y}px`;
    
    // Update trails
    if (this.options.enableTrails && this.trails) {
      this.trails.forEach((trail, index) => {
        const delay = this.options.trailDelay * (index + 1);
        trail.x += (this.cursor.x - trail.x) * (0.3 - index * 0.05);
        trail.y += (this.cursor.y - trail.y) * (0.3 - index * 0.05);
        trail.element.style.left = `${trail.x}px`;
        trail.element.style.top = `${trail.y}px`;
      });
    }
    
    // Update label position
    if (this.labelElement.classList.contains('visible')) {
      this.labelElement.style.left = `${finalX}px`;
      this.labelElement.style.top = `${finalY - 40}px`;
    }
    
    // Update glow
    if (this.options.enableGlow && this.glowElement) {
      this.glowElement.style.left = `${this.cursor.x}px`;
      this.glowElement.style.top = `${this.cursor.y}px`;
    }
    
    requestAnimationFrame(() => this.animate());
  }
  
  setLabel(text) {
    this.labelElement.textContent = text;
    this.labelElement.classList.add('visible');
  }
  
  hideLabel() {
    this.labelElement.classList.remove('visible');
  }
  
  setCursorState(state) {
    this.cursorElement.className = 'magnetic-cursor';
    if (state) {
      this.cursorElement.classList.add(state);
    }
  }
  
  destroy() {
    this.isActive = false;
    document.body.classList.remove('magnetic-cursor-enabled');
    
    this.cursorElement?.remove();
    this.ringElement?.remove();
    this.labelElement?.remove();
    this.glowElement?.remove();
    this.trails?.forEach(t => t.element.remove());
  }
  
  // Static initialization
  static init(options = {}) {
    return new EnhancedMagneticCursor(options);
  }
}

// Magnetic Follower - elements that follow cursor
class MagneticFollower {
  constructor(element, options = {}) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;
    
    this.options = {
      strength: options.strength || 0.3,
      radius: options.radius || 200,
      ease: options.ease || 0.1,
      ...options
    };
    
    this.mouse = { x: 0, y: 0 };
    this.position = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.animate();
  }
  
  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });
  }
  
  animate() {
    const rect = this.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dx = this.mouse.x - centerX;
    const dy = this.mouse.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < this.options.radius) {
      const force = (1 - distance / this.options.radius) * this.options.strength;
      this.target.x = dx * force;
      this.target.y = dy * force;
    } else {
      this.target.x = 0;
      this.target.y = 0;
    }
    
    // Smooth interpolation
    this.position.x += (this.target.x - this.position.x) * this.options.ease;
    this.position.y += (this.target.y - this.position.y) * this.options.ease;
    
    this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    
    requestAnimationFrame(() => this.animate());
  }
  
  static init(selector = '[data-magnetic-follow]', options = {}) {
    document.querySelectorAll(selector).forEach(el => {
      const strength = parseFloat(el.dataset.magneticFollow) || 0.3;
      new MagneticFollower(el, { ...options, strength });
    });
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  EnhancedMagneticCursor.init({
    magneticStrength: 0.3,
    enableTrails: true,
    enableGlow: true
  });
  
  MagneticFollower.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EnhancedMagneticCursor, MagneticFollower };
}
