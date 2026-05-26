/**
 * BuildBridge Confetti Celebration System
 * Fortune 500 Quality - Celebrates user actions with stunning particle effects
 * Triggers on: Form submissions, project completions, newsletter signups
 */

class ConfettiCelebration {
  constructor(options = {}) {
    this.colors = options.colors || [
      '#C9CED6', // Chrome
      '#F5F7FA', // White
      '#3B82F6', // Blue accent
      '#22c55e', // Success green
      '#f59e0b', // Amber
      '#ef4444', // Red
    ];
    this.particleCount = options.particleCount || 150;
    this.spread = options.spread || 70;
    this.origin = options.origin || { y: 0.7 };
    this.zIndex = options.zIndex || 99999;
    this.disableForReducedMotion = options.disableForReducedMotion !== false;
    
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.isActive = false;
    
    this.init();
  }
  
  init() {
    // Check for reduced motion preference
    if (this.disableForReducedMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    this.createCanvas();
    this.bindEvents();
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: ${this.zIndex};
    `;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    document.body.appendChild(this.canvas);
    
    window.addEventListener('resize', () => this.resize(), { passive: true });
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  bindEvents() {
    // Trigger on form submissions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        // Only trigger if form is valid
        if (form.checkValidity()) {
          this.celebrate({
            origin: { y: 0.5, x: 0.5 },
            colors: ['#22c55e', '#C9CED6', '#F5F7FA']
          });
        }
      });
    });
    
    // Newsletter subscription success
    document.addEventListener('newsletter-subscribed', () => {
      this.celebrate({
        origin: { y: 0.3, x: 0.5 },
        colors: ['#3B82F6', '#C9CED6', '#F5F7FA', '#22c55e'],
        particleCount: 200
      });
    });
    
    // WhatsApp click celebration (subtle)
    document.querySelectorAll('a[href*="wa.me"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.celebrate({
          origin: { y: 0.8, x: 0.9 },
          colors: ['#25D366', '#C9CED6'],
          particleCount: 80,
          spread: 40
        });
      });
    });
  }
  
  celebrate(options = {}) {
    const config = {
      colors: options.colors || this.colors,
      particleCount: options.particleCount || this.particleCount,
      spread: options.spread || this.spread,
      origin: options.origin || this.origin,
      gravity: options.gravity || 0.8,
      decay: options.decay || 0.96,
      ticks: options.ticks || 200,
      scalar: options.scalar || 1
    };
    
    this.fire(config);
  }
  
  fire(config) {
    const originX = (config.origin.x || 0.5) * this.canvas.width;
    const originY = (config.origin.y || 0.7) * this.canvas.height;
    
    for (let i = 0; i < config.particleCount; i++) {
      this.particles.push(this.createParticle(originX, originY, config));
    }
    
    if (!this.isActive) {
      this.isActive = true;
      this.animate();
    }
  }
  
  createParticle(x, y, config) {
    const angle = (Math.random() * config.spread - config.spread / 2) * (Math.PI / 180);
    const velocity = Math.random() * 15 + 10;
    const color = config.colors[Math.floor(Math.random() * config.colors.length)];
    
    return {
      x,
      y,
      vx: Math.sin(angle) * velocity * (0.5 + Math.random() * 0.5),
      vy: -Math.cos(angle) * velocity * (0.5 + Math.random() * 0.5),
      color,
      size: (Math.random() * 8 + 4) * config.scalar,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      friction: 0.99,
      gravity: config.gravity,
      decay: config.decay,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'circle' : 'square'
    };
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Update physics
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.opacity *= p.decay;
      
      // Draw particle
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      
      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }
      
      this.ctx.restore();
      
      // Remove dead particles
      if (p.opacity < 0.01 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
      }
    }
    
    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.isActive = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  
  burst(x, y, options = {}) {
    const config = {
      colors: options.colors || ['#22c55e', '#C9CED6', '#F5F7FA'],
      particleCount: options.particleCount || 60,
      spread: options.spread || 360,
      origin: { x: x / this.canvas.width, y: y / this.canvas.height },
      gravity: 0.5,
      decay: 0.95
    };
    this.fire(config);
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.confettiCelebration = new ConfettiCelebration();
  });
} else {
  window.confettiCelebration = new ConfettiCelebration();
}

// Export for manual triggering
window.ConfettiCelebration = ConfettiCelebration;
