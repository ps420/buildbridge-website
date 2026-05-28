/**
 * Cursor Spotlight Enhanced - v39.0
 * Fortune 500 Professional Cursor System
 * Features: Magnetic effects, context awareness, trail effect, click animations
 */

class CursorSpotlightEnhanced {
  constructor(options = {}) {
    this.options = {
      magneticStrength: 0.3,
      trailEnabled: true,
      trailLength: 8,
      spotlightEnabled: true,
      clickEffect: true,
      contextLabels: true,
      performanceMode: false,
      ...options
    };
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.cursorX = 0;
    this.cursorY = 0;
    this.ringX = 0;
    this.ringY = 0;
    this.velocity = { x: 0, y: 0 };
    this.lastMouseTime = Date.now();
    this.isMoving = false;
    this.trail = [];
    this.magneticElements = [];
    this.currentContext = null;
    
    // Check for touch device
    this.isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    
    if (!this.isTouchDevice) {
      this.init();
    }
  }
  
  init() {
    this.createCursorElements();
    this.findMagneticElements();
    this.bindEvents();
    this.animate();
    
    // Add active class to body
    document.body.classList.add('custom-cursor-active');
    
    if (this.options.performanceMode) {
      document.body.classList.add('cursor-performance-mode');
    }
    
    console.log('[Cursor Spotlight] Initialized');
  }
  
  createCursorElements() {
    // Main container
    this.container = document.createElement('div');
    this.container.className = 'custom-cursor-container';
    
    // Dot
    this.dot = document.createElement('div');
    this.dot.className = 'cursor-dot';
    this.container.appendChild(this.dot);
    
    // Ring
    this.ring = document.createElement('div');
    this.ring.className = 'cursor-ring';
    this.container.appendChild(this.ring);
    
    // Spotlight
    if (this.options.spotlightEnabled) {
      this.spotlight = document.createElement('div');
      this.spotlight.className = 'cursor-spotlight';
      this.container.appendChild(this.spotlight);
    }
    
    // Label
    if (this.options.contextLabels) {
      this.label = document.createElement('div');
      this.label.className = 'cursor-label';
      this.container.appendChild(this.label);
    }
    
    // Magnetic field indicator
    this.magneticField = document.createElement('div');
    this.magneticField.className = 'cursor-magnetic-field';
    this.magneticField.style.width = '150px';
    this.magneticField.style.height = '150px';
    this.container.appendChild(this.magneticField);
    
    // Click effect container
    this.clickContainer = document.createElement('div');
    this.clickContainer.className = 'cursor-click-container';
    this.container.appendChild(this.clickContainer);
    
    // Trail elements
    if (this.options.trailEnabled) {
      for (let i = 0; i < this.options.trailLength; i++) {
        const trailDot = document.createElement('div');
        trailDot.className = 'cursor-trail';
        trailDot.style.opacity = 1 - (i / this.options.trailLength);
        this.container.appendChild(trailDot);
        this.trail.push({
          element: trailDot,
          x: 0,
          y: 0
        });
      }
    }
    
    document.body.appendChild(this.container);
  }
  
  findMagneticElements() {
    this.magneticElements = [];
    
    const selectors = [
      '[data-magnetic]',
      '.magnetic',
      '.btn',
      'a',
      'button',
      '.service-card',
      '.project-card',
      '.team-card'
    ];
    
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        const strength = parseFloat(el.dataset.magnetic) || this.options.magneticStrength;
        const rect = el.getBoundingClientRect();
        
        this.magneticElements.push({
          element: el,
          strength: strength,
          rect: rect,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2
        });
      });
    });
    
    // Update on resize
    window.addEventListener('resize', () => {
      this.magneticElements.forEach(item => {
        const rect = item.element.getBoundingClientRect();
        item.rect = rect;
        item.centerX = rect.left + rect.width / 2;
        item.centerY = rect.top + rect.height / 2;
      });
    }, { passive: true });
  }
  
  bindEvents() {
    // Mouse movement
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.isMoving = true;
      
      clearTimeout(this.moveTimeout);
      this.moveTimeout = setTimeout(() => {
        this.isMoving = false;
      }, 100);
    }, { passive: true });
    
    // Mouse down/up
    document.addEventListener('mousedown', () => this.handleMouseDown());
    document.addEventListener('mouseup', () => this.handleMouseUp());
    
    // Hover detection
    document.addEventListener('mouseover', (e) => this.handleMouseOver(e));
    document.addEventListener('mouseout', (e) => this.handleMouseOut(e));
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.container.style.opacity = '0';
      } else {
        this.container.style.opacity = '1';
      }
    });
    
    // Scroll-based magnetic update
    window.addEventListener('scroll', () => {
      this.magneticElements.forEach(item => {
        const rect = item.element.getBoundingClientRect();
        item.rect = rect;
        item.centerX = rect.left + rect.width / 2;
        item.centerY = rect.top + rect.height / 2;
      });
    }, { passive: true });
  }
  
  handleMouseDown() {
    this.dot.style.transform = 'translate(-50%, -50%) scale(0.8)';
    this.ring.style.transform = 'translate(-50%, -50%) scale(0.9)';
    
    if (this.options.clickEffect) {
      this.createClickEffect();
    }
  }
  
  handleMouseUp() {
    this.dot.style.transform = 'translate(-50%, -50%) scale(1)';
    this.ring.style.transform = 'translate(-50%, -50%) scale(1)';
  }
  
  createClickEffect() {
    const effect = document.createElement('div');
    effect.className = 'cursor-click-effect';
    effect.style.left = this.mouseX + 'px';
    effect.style.top = this.mouseY + 'px';
    this.clickContainer.appendChild(effect);
    
    // Trigger animation
    requestAnimationFrame(() => {
      effect.classList.add('animate');
    });
    
    // Remove after animation
    setTimeout(() => {
      effect.remove();
    }, 500);
  }
  
  handleMouseOver(e) {
    const target = e.target;
    
    // Determine context
    let context = null;
    let label = '';
    
    if (target.closest('a') || target.closest('button')) {
      const element = target.closest('a') || target.closest('button');
      
      if (element.classList.contains('btn')) {
        context = 'button';
        label = 'Click';
      } else {
        context = 'link';
        label = 'View';
      }
      
      // Check for custom label
      if (element.dataset.cursorLabel) {
        label = element.dataset.cursorLabel;
      }
      
    } else if (target.closest('img') || target.closest('[data-cursor="zoom"]')) {
      context = 'image';
      label = 'View';
    } else if (target.closest('[data-cursor="drag"]')) {
      context = 'drag';
      label = 'Drag';
    } else if (target.closest('input, textarea, select')) {
      context = 'text';
      label = 'Type';
    }
    
    if (context) {
      this.setCursorContext(context, label);
    }
  }
  
  handleMouseOut(e) {
    const target = e.target;
    
    if (target.closest('a, button, img, input, textarea, [data-cursor]')) {
      this.clearCursorContext();
    }
  }
  
  setCursorContext(context, label) {
    this.currentContext = context;
    
    // Update classes
    this.dot.className = 'cursor-dot hover-' + context;
    this.ring.className = 'cursor-ring hover-' + context;
    
    // Update label
    if (this.label && label) {
      this.label.textContent = label;
      this.label.classList.add('is-visible');
    }
  }
  
  clearCursorContext() {
    this.currentContext = null;
    this.dot.className = 'cursor-dot';
    this.ring.className = 'cursor-ring';
    
    if (this.label) {
      this.label.classList.remove('is-visible');
    }
  }
  
  animate() {
    // Smooth cursor following
    const ease = 0.15;
    this.cursorX += (this.mouseX - this.cursorX) * ease;
    this.cursorY += (this.mouseY - this.cursorY) * ease;
    
    // Calculate velocity
    const now = Date.now();
    const dt = now - this.lastMouseTime;
    if (dt > 0) {
      this.velocity.x = (this.mouseX - this.cursorX) / dt * 16;
      this.velocity.y = (this.mouseY - this.cursorY) / dt * 16;
    }
    this.lastMouseTime = now;
    
    // Update dot
    this.dot.style.left = this.cursorX + 'px';
    this.dot.style.top = this.cursorY + 'px';
    
    // Magnetic effect calculation
    let magneticPullX = 0;
    let magneticPullY = 0;
    let inMagneticField = false;
    
    this.magneticElements.forEach(item => {
      const dx = this.mouseX - item.centerX;
      const dy = this.mouseY - item.centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const magneticRadius = Math.max(item.rect.width, item.rect.height) * 1.5;
      
      if (distance < magneticRadius) {
        const force = (1 - distance / magneticRadius) * item.strength;
        magneticPullX += dx * force * -0.3;
        magneticPullY += dy * force * -0.3;
        inMagneticField = true;
      }
    });
    
    // Update magnetic field indicator
    if (inMagneticField) {
      this.magneticField.style.left = this.cursorX + 'px';
      this.magneticField.style.top = this.cursorY + 'px';
      this.magneticField.classList.add('is-active');
    } else {
      this.magneticField.classList.remove('is-active');
    }
    
    // Update ring with magnetic pull
    const ringTargetX = this.mouseX + magneticPullX;
    const ringTargetY = this.mouseY + magneticPullY;
    const ringEase = 0.1;
    
    this.ringX += (ringTargetX - this.ringX) * ringEase;
    this.ringY += (ringTargetY - this.ringY) * ringEase;
    
    this.ring.style.left = this.ringX + 'px';
    this.ring.style.top = this.ringY + 'px';
    
    // Update spotlight
    if (this.spotlight) {
      this.spotlight.style.left = this.cursorX + 'px';
      this.spotlight.style.top = this.cursorY + 'px';
    }
    
    // Update label
    if (this.label) {
      this.label.style.left = this.cursorX + 'px';
      this.label.style.top = this.cursorY + 'px';
    }
    
    // Update trail
    if (this.options.trailEnabled && this.trail.length > 0) {
      this.updateTrail();
    }
    
    requestAnimationFrame(() => this.animate());
  }
  
  updateTrail() {
    // Shift trail positions
    for (let i = this.trail.length - 1; i > 0; i--) {
      this.trail[i].x += (this.trail[i - 1].x - this.trail[i].x) * 0.3;
      this.trail[i].y += (this.trail[i - 1].y - this.trail[i].y) * 0.3;
    }
    
    // Set first trail to cursor position
    this.trail[0].x = this.cursorX;
    this.trail[0].y = this.cursorY;
    
    // Update trail elements
    this.trail.forEach((item, i) => {
      item.element.style.left = item.x + 'px';
      item.element.style.top = item.y + 'px';
      item.element.style.transform = `translate(-50%, -50%) scale(${1 - i * 0.1})`;
    });
  }
  
  // Public methods
  setPerformanceMode(enabled) {
    this.options.performanceMode = enabled;
    document.body.classList.toggle('cursor-performance-mode', enabled);
  }
  
  addMagneticElement(element, strength = 0.3) {
    const rect = element.getBoundingClientRect();
    
    this.magneticElements.push({
      element: element,
      strength: strength,
      rect: rect,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2
    });
  }
  
  destroy() {
    if (this.container) {
      this.container.remove();
    }
    document.body.classList.remove('custom-cursor-active', 'cursor-performance-mode');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cursorSpotlight = new CursorSpotlightEnhanced();
  });
} else {
  window.cursorSpotlight = new CursorSpotlightEnhanced();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CursorSpotlightEnhanced;
}
