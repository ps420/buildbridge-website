// BuildBridge - Scroll Smear / Motion Blur Effect
// Fortune 500-style velocity-based motion blur
// Version 5.0 Professional Enhancement

class ScrollSmearEffect {
  constructor() {
    this.elements = [];
    this.velocity = 0;
    this.lastScrollY = 0;
    this.isActive = true;
    
    // Use CSS custom properties for performance
    this.supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(10px)');
    
    this.init();
  }
  
  init() {
    this.findElements();
    this.bindScroll();
    this.animate();
  }
  
  findElements() {
    // Find elements that should have smear effect
    document.querySelectorAll('[data-smear]').forEach(el => {
      this.elements.push({
        element: el,
        intensity: parseFloat(el.dataset.smear) || 1,
        maxBlur: parseFloat(el.dataset.smearMax) || 10,
        direction: el.dataset.smearDirection || 'vertical' // 'vertical', 'horizontal', 'both'
      });
    });
    
    // Auto-add smear to certain elements if enabled globally
    if (document.body.dataset.smearGlobal === 'true') {
      document.querySelectorAll('img, .hero-visual, .project-card img').forEach(el => {
        if (!el.closest('[data-no-smear]')) {
          el.dataset.smear = '0.5';
          this.elements.push({
            element: el,
            intensity: 0.5,
            maxBlur: 5,
            direction: 'vertical'
          });
        }
      });
    }
  }
  
  bindScroll() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.calculateVelocity();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      this.isActive = document.visibilityState === 'visible';
    });
  }
  
  calculateVelocity() {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - this.lastScrollY;
    
    // Smooth velocity calculation
    this.velocity = this.velocity * 0.8 + delta * 0.2;
    
    this.lastScrollY = currentScrollY;
  }
  
  animate() {
    if (!this.isActive) {
      requestAnimationFrame(() => this.animate());
      return;
    }
    
    // Decay velocity when not scrolling
    this.velocity *= 0.95;
    
    // Apply effects if velocity is significant
    if (Math.abs(this.velocity) > 0.5) {
      this.applyEffects();
    } else {
      this.resetEffects();
    }
    
    requestAnimationFrame(() => this.animate());
  }
  
  applyEffects() {
    const absVelocity = Math.abs(this.velocity);
    
    this.elements.forEach(item => {
      const { element, intensity, maxBlur, direction } = item;
      const blur = Math.min(absVelocity * intensity, maxBlur);
      
      // Calculate directional blur
      let blurX = 0, blurY = 0;
      
      if (direction === 'vertical' || direction === 'both') {
        blurY = blur;
      }
      if (direction === 'horizontal' || direction === 'both') {
        blurX = blur;
      }
      
      // Apply blur transform
      if (blurX > 0 || blurY > 0) {
        element.style.filter = `blur(${blurX}px ${blurY}px)`;
        element.style.transform = `scale(${1 + blur * 0.01})`;
        element.style.opacity = Math.max(0.7, 1 - blur * 0.02);
      }
    });
  }
  
  resetEffects() {
    this.elements.forEach(item => {
      const { element } = item;
      
      if (element.style.filter) {
        element.style.filter = '';
        element.style.transform = '';
        element.style.opacity = '';
      }
    });
  }
}

// Advanced motion trail effect
class MotionTrailEffect {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      trailCount: options.trailCount || 5,
      trailInterval: options.trailInterval || 50,
      trailDecay: options.trailDecay || 0.9,
      color: options.color || null,
      ...options
    };
    
    this.trails = [];
    this.lastPosition = { x: 0, y: 0 };
    this.isMoving = false;
    
    this.init();
  }
  
  init() {
    // Create trail elements
    for (let i = 0; i < this.options.trailCount; i++) {
      const trail = document.createElement('div');
      trail.className = 'motion-trail';
      trail.style.cssText = `
        position: absolute;
        pointer-events: none;
        opacity: 0;
        transition: opacity ${this.options.trailDecay}s ease;
      `;
      
      if (this.options.color) {
        trail.style.backgroundColor = this.options.color;
      }
      
      this.element.offsetParent?.appendChild(trail);
      this.trails.push({
        element: trail,
        x: 0,
        y: 0,
        opacity: 0
      });
    }
    
    this.bindEvents();
  }
  
  bindEvents() {
    // Create trail on mouse move
    let lastTrailTime = 0;
    
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      
      if (now - lastTrailTime > this.options.trailInterval) {
        this.createTrailPoint(e.clientX, e.clientY);
        lastTrailTime = now;
      }
    }, { passive: true });
    
    // Also for the element itself
    this.element.addEventListener('mousemove', (e) => {
      const rect = this.element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.createTrailPoint(x + rect.left, y + rect.top, true);
    });
  }
  
  createTrailPoint(x, y, isLocal = false) {
    // Shift all trails
    for (let i = this.trails.length - 1; i > 0; i--) {
      this.trails[i].x = this.trails[i - 1].x;
      this.trails[i].y = this.trails[i - 1].y;
      this.trails[i].opacity = this.trails[i - 1].opacity * this.options.trailDecay;
    }
    
    // Set new position
    this.trails[0].x = x;
    this.trails[0].y = y;
    this.trails[0].opacity = 1;
    
    // Update DOM
    this.trails.forEach((trail, index) => {
      trail.element.style.left = trail.x + 'px';
      trail.element.style.top = trail.y + 'px';
      trail.element.style.opacity = trail.opacity * (1 - index / this.trails.length);
    });
  }
  
  destroy() {
    this.trails.forEach(trail => {
      trail.element.remove();
    });
    this.trails = [];
  }
}

// Velocity-based tilt effect
class VelocityTilt {
  constructor() {
    this.tiltedElements = [];
    this.velocity = 0;
    this.lastScroll = 0;
    this.maxTilt = 5;
    
    this.init();
  }
  
  init() {
    this.findElements();
    this.bindScroll();
    this.animate();
  }
  
  findElements() {
    document.querySelectorAll('[data-velocity-tilt]').forEach(el => {
      this.tiltedElements.push({
        element: el,
        maxTilt: parseFloat(el.dataset.velocityTilt) || 5,
        direction: el.dataset.tiltDirection || 'x'
      });
    });
  }
  
  bindScroll() {
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      this.velocity = currentScroll - this.lastScroll;
      this.lastScroll = currentScroll;
    }, { passive: true });
  }
  
  animate() {
    this.velocity *= 0.9; // Decay
    
    this.tiltedElements.forEach(item => {
      const { element, maxTilt, direction } = item;
      const tiltAmount = Math.max(-maxTilt, Math.min(maxTilt, this.velocity * 0.1));
      
      if (Math.abs(tiltAmount) > 0.1) {
        if (direction === 'x') {
          element.style.transform = `perspective(1000px) rotateX(${tiltAmount}deg)`;
        } else {
          element.style.transform = `perspective(1000px) rotateY(${tiltAmount}deg)`;
        }
      } else {
        element.style.transform = '';
      }
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Only enable on non-touch devices for performance
  if (!window.matchMedia('(pointer: coarse)').matches) {
    window.scrollSmear = new ScrollSmearEffect();
    window.velocityTilt = new VelocityTilt();
  }
  
  // Initialize motion trails for specific elements
  document.querySelectorAll('[data-motion-trail]').forEach(el => {
    new MotionTrailEffect(el, {
      color: el.dataset.trailColor || undefined,
      trailCount: parseInt(el.dataset.trailCount) || 5
    });
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ScrollSmearEffect, MotionTrailEffect, VelocityTilt };
}
