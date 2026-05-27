/**
 * Elegant Mouse Trail v20.0
 * Smooth particle trail following cursor movement
 */

class MouseTrail {
  constructor(options = {}) {
    this.config = {
      particleCount: options.particleCount || 12,
      particleLife: options.particleLife || 1000,
      trailDelay: options.trailDelay || 50,
      maxDistance: options.maxDistance || 100,
      decay: options.decay || 0.95,
      size: options.size || 8,
      cursor: options.cursor || false,
      clickRipple: options.clickRipple !== false,
      ...options
    };
    
    this.particles = [];
    this.mouse = { x: 0, y: 0, lastX: 0, lastY: 0 };
    this.container = null;
    this.cursorEl = null;
    this.isActive = true;
    this.rafId = null;
    
    // Check if should initialize
    if (this.shouldInitialize()) {
      this.init();
    }
  }
  
  shouldInitialize() {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
      return false;
    }
    
    // Skip if reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    
    // Skip on low-power devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      return false;
    }
    
    return true;
  }
  
  init() {
    this.createContainer();
    if (this.config.cursor) {
      this.createCursor();
    }
    this.bindEvents();
    this.animate();
    
    // Add body class
    document.body.classList.add('mouse-trail-active');
    
    // Handle visibility
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden;
      if (this.isActive && !this.rafId) {
        this.animate();
      }
    });
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'mouse-trail-container';
    document.body.appendChild(this.container);
  }
  
  createCursor() {
    this.cursorEl = document.createElement('div');
    this.cursorEl.className = 'mouse-trail-cursor';
    document.body.appendChild(this.cursorEl);
    
    // Track hoverable elements
    const hoverables = document.querySelectorAll('a, button, [role="button"], input, textarea, select');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => this.cursorEl.classList.add('hover'));
      el.addEventListener('mouseleave', () => this.cursorEl.classList.remove('hover'));
    });
  }
  
  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      
      // Create particle at interval
      const now = Date.now();
      if (!this.lastParticleTime || now - this.lastParticleTime > this.config.trailDelay) {
        this.createParticle(e.clientX, e.clientY);
        this.lastParticleTime = now;
      }
    }, { passive: true });
    
    // Click ripple effect
    if (this.config.clickRipple) {
      document.addEventListener('click', (e) => {
        this.createRipple(e.clientX, e.clientY);
        if (this.cursorEl) {
          this.cursorEl.classList.add('click');
          setTimeout(() => this.cursorEl.classList.remove('click'), 150);
        }
      });
    }
    
    // Handle mouse leaving window
    document.addEventListener('mouseleave', () => {
      if (this.cursorEl) {
        this.cursorEl.style.opacity = '0';
      }
    });
    
    document.addEventListener('mouseenter', () => {
      if (this.cursorEl) {
        this.cursorEl.style.opacity = '1';
      }
    });
  }
  
  createParticle(x, y) {
    if (this.particles.length >= this.config.particleCount) {
      const old = this.particles.shift();
      old.element.remove();
    }
    
    const element = document.createElement('div');
    element.className = 'mouse-trail-particle';
    element.style.left = x + 'px';
    element.style.top = y + 'px';
    element.style.width = this.config.size + 'px';
    element.style.height = this.config.size + 'px';
    
    this.container.appendChild(element);
    
    this.particles.push({
      element,
      x,
      y,
      life: this.config.particleLife,
      maxLife: this.config.particleLife,
      scale: 1
    });
  }
  
  createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'mouse-trail-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.transform = 'translate(-50%, -50%)';
    
    this.container.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
  
  animate() {
    if (!this.isActive) {
      this.rafId = null;
      return;
    }
    
    // Update cursor position
    if (this.cursorEl) {
      this.cursorEl.style.left = this.mouse.x + 'px';
      this.cursorEl.style.top = this.mouse.y + 'px';
    }
    
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= 16; // ~60fps
      
      if (p.life <= 0) {
        p.element.remove();
        this.particles.splice(i, 1);
        continue;
      }
      
      const progress = p.life / p.maxLife;
      const opacity = progress * progress; // Ease out
      const scale = 0.5 + progress * 0.5;
      
      p.element.style.opacity = opacity;
      p.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    this.isActive = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.container) {
      this.container.remove();
    }
    if (this.cursorEl) {
      this.cursorEl.remove();
    }
    document.body.classList.remove('mouse-trail-active');
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mouseTrail = new MouseTrail({
      particleCount: 8,
      trailDelay: 40,
      cursor: true
    });
  });
} else {
  window.mouseTrail = new MouseTrail({
    particleCount: 8,
    trailDelay: 40,
    cursor: true
  });
}
