/**
 * Floating Particles Enhanced - v24.2
 * Premium particle system with interactive effects
 * Fortune 500 Quality Visual Enhancement
 */

class FloatingParticlesEnhanced {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) {
      console.warn('[Floating Particles] Container not found');
      return;
    }
    
    this.options = {
      particleCount: options.particleCount || 30,
      color: options.color || '201, 206, 214',
      minSize: options.minSize || 2,
      maxSize: options.maxSize || 6,
      speed: options.speed || 0.3,
      connectDistance: options.connectDistance || 100,
      mouseRadius: options.mouseRadius || 150,
      direction: options.direction || 'up', // up, down, random
      shape: options.shape || 'circle', // circle, square, triangle
      blur: options.blur || false,
      glow: options.glow !== false,
      interactive: options.interactive !== false,
      ...options
    };
    
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.animationId = null;
    this.isActive = true;
    this.time = 0;
    
    this.init();
  }
  
  init() {
    // Skip on reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    this.createCanvas();
    this.createParticles();
    this.bindEvents();
    this.animate();
    
    console.log('[Floating Particles] Initialized with', this.options.particleCount, 'particles');
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'floating-particles-canvas';
    this.canvas.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    `;
    
    // Insert at beginning of container
    this.container.insertBefore(this.canvas, this.container.firstChild);
    
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }
  
  createParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        baseX: 0,
        baseY: 0,
        vx: (Math.random() - 0.5) * this.options.speed,
        vy: this.getInitialVelocity(),
        size: Math.random() * (this.options.maxSize - this.options.minSize) + this.options.minSize,
        opacity: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      });
    }
    
    // Store base positions
    this.particles.forEach(p => {
      p.baseX = p.x;
      p.baseY = p.y;
    });
  }
  
  getInitialVelocity() {
    switch(this.options.direction) {
      case 'up':
        return -Math.random() * this.options.speed - 0.1;
      case 'down':
        return Math.random() * this.options.speed + 0.1;
      default:
        return (Math.random() - 0.5) * this.options.speed;
    }
  }
  
  bindEvents() {
    window.addEventListener('resize', () => this.resize(), { passive: true });
    
    if (this.options.interactive) {
      this.container.addEventListener('mousemove', (e) => {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      }, { passive: true });
      
      this.container.addEventListener('mouseleave', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });
    }
    
    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden;
      if (this.isActive) this.animate();
    });
  }
  
  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }
  
  updateParticle(p) {
    this.time += 0.01;
    
    // Pulsing opacity
    const pulse = Math.sin(this.time * 2 + p.pulseOffset);
    p.currentOpacity = p.opacity + pulse * 0.1;
    
    // Update position
    p.x += p.vx + Math.sin(this.time + p.pulseOffset) * 0.1;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;
    
    // Interactive mouse effect
    if (this.options.interactive && this.mouse.x !== null && this.mouse.y !== null) {
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < this.options.mouseRadius && dist > 0) {
        const force = (this.options.mouseRadius - dist) / this.options.mouseRadius;
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * force * 0.5;
        p.vy += Math.sin(angle) * force * 0.5;
        
        // Increase opacity near mouse
        p.currentOpacity = Math.min(1, p.currentOpacity + force * 0.3);
      }
    }
    
    // Apply damping
    p.vx *= 0.99;
    p.vy *= 0.99;
    
    // Return to base velocity
    const targetVy = this.getInitialVelocity();
    p.vy += (targetVy - p.vy) * 0.01;
    
    // Wrap edges
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;
    
    if (this.options.direction === 'up' && p.y < -p.size) {
      p.y = height + p.size;
      p.x = Math.random() * width;
    } else if (this.options.direction === 'down' && p.y > height + p.size) {
      p.y = -p.size;
      p.x = Math.random() * width;
    } else {
      if (p.x < -p.size) p.x = width + p.size;
      if (p.x > width + p.size) p.x = -p.size;
      if (p.y < -p.size) p.y = height + p.size;
      if (p.y > height + p.size) p.y = -p.size;
    }
  }
  
  drawParticle(p) {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    
    // Apply blur if enabled
    if (this.options.blur) {
      ctx.filter = `blur(${p.size * 0.3}px)`;
    }
    
    // Glow effect
    if (this.options.glow) {
      ctx.shadowBlur = p.size * 2;
      ctx.shadowColor = `rgba(${this.options.color}, ${p.currentOpacity * 0.5})`;
    }
    
    ctx.fillStyle = `rgba(${this.options.color}, ${p.currentOpacity})`;
    
    // Draw shape
    switch(this.options.shape) {
      case 'square':
        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
        break;
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -p.size/2);
        ctx.lineTo(p.size/2, p.size/2);
        ctx.lineTo(-p.size/2, p.size/2);
        ctx.closePath();
        ctx.fill();
        break;
      default: // circle
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
  }
  
  drawConnections() {
    const ctx = this.ctx;
    const maxConnections = 3;
    
    for (let i = 0; i < this.particles.length; i++) {
      let connections = 0;
      
      for (let j = i + 1; j < this.particles.length; j++) {
        if (connections >= maxConnections) break;
        
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.options.connectDistance) {
          connections++;
          const opacity = (1 - dist / this.options.connectDistance) * 0.15;
          
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${this.options.color}, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }
  
  animate() {
    if (!this.isActive) return;
    
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;
    
    this.ctx.clearRect(0, 0, width, height);
    
    // Draw connections first (behind particles)
    this.drawConnections();
    
    // Update and draw particles
    this.particles.forEach(p => {
      this.updateParticle(p);
      this.drawParticle(p);
    });
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    this.isActive = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
  
  // Public API
  addParticles(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.options.speed,
        vy: this.getInitialVelocity(),
        size: Math.random() * (this.options.maxSize - this.options.minSize) + this.options.minSize,
        opacity: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      });
    }
  }
  
  setDirection(direction) {
    this.options.direction = direction;
    this.particles.forEach(p => {
      p.vy = this.getInitialVelocity();
    });
  }
}

// Auto-initialize on common sections
document.addEventListener('DOMContentLoaded', () => {
  // Hero particles
  const hero = document.querySelector('.hero');
  if (hero) {
    new FloatingParticlesEnhanced(hero, {
      particleCount: 20,
      direction: 'up',
      speed: 0.2,
      minSize: 2,
      maxSize: 4,
      connectDistance: 80,
      color: '201, 206, 214'
    });
  }
  
  // CTA section particles
  const cta = document.querySelector('.cta');
  if (cta) {
    new FloatingParticlesEnhanced(cta, {
      particleCount: 15,
      direction: 'random',
      speed: 0.15,
      minSize: 3,
      maxSize: 6,
      connectDistance: 0,
      glow: true,
      color: '201, 206, 214'
    });
  }
  
  // Stats section particles
  const stats = document.querySelector('.stats-section');
  if (stats) {
    new FloatingParticlesEnhanced(stats, {
      particleCount: 12,
      direction: 'down',
      speed: 0.1,
      minSize: 2,
      maxSize: 3,
      connectDistance: 60,
      color: '201, 206, 214'
    });
  }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloatingParticlesEnhanced;
}
