/**
 * Atmospheric Fog Particles
 * v25.0 Fortune 500 Professional Feature
 * Subtle depth-enhancing animated particle system
 */

class AtmosphericFog {
  constructor(container, options = {}) {
    this.container = container;
    this.canvas = container.querySelector('canvas') || this.createCanvas();
    this.ctx = this.canvas.getContext('2d');
    
    // Configuration
    this.config = {
      particleCount: options.particleCount || 50,
      particleSize: options.particleSize || { min: 1, max: 4 },
      particleOpacity: options.particleOpacity || { min: 0.1, max: 0.4 },
      speed: options.speed || { min: 0.1, max: 0.5 },
      drift: options.drift || { x: 0.2, y: -0.1 },
      connectParticles: options.connectParticles !== false,
      connectionDistance: options.connectionDistance || 150,
      mouseInfluence: options.mouseInfluence || 100,
      color: options.color || '201, 206, 214', // var(--chrome) in RGB
      ...options
    };
    
    this.particles = [];
    this.animationId = null;
    this.isActive = true;
    this.mouse = { x: null, y: null };
    this.frameCount = 0;
    
    this.init();
  }
  
  createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.className = 'atmospheric-fog-canvas';
    this.container.appendChild(canvas);
    return canvas;
  }
  
  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }
  
  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.container.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }
  
  createParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * this.config.speed.max * 2,
        vy: (Math.random() - 0.5) * this.config.speed.max * 2,
        size: this.randomRange(this.config.particleSize.min, this.config.particleSize.max),
        opacity: this.randomRange(this.config.particleOpacity.min, this.config.particleOpacity.max),
        originalOpacity: this.randomRange(this.config.particleOpacity.min, this.config.particleOpacity.max),
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02
      });
    }
  }
  
  randomRange(min, max) {
    return min + Math.random() * (max - min);
  }
  
  bindEvents() {
    // Resize handling
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.resize(), 250);
    }, { passive: true });
    
    // Mouse tracking for interaction
    const parent = this.container.closest('.with-fog') || this.container.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      }, { passive: true });
      
      parent.addEventListener('mouseleave', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      }, { passive: true });
    }
    
    // Visibility check
    this.setupIntersectionObserver();
    
    // Page visibility
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden;
      if (this.isActive) {
        this.animate();
      }
    });
  }
  
  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          this.isActive = entry.isIntersecting;
          if (this.isActive && !this.animationId) {
            this.animate();
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(this.container);
  }
  
  updateParticles() {
    this.particles.forEach(particle => {
      // Apply drift
      particle.x += particle.vx + this.config.drift.x;
      particle.y += particle.vy + this.config.drift.y;
      
      // Mouse influence
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.config.mouseInfluence) {
          const force = (this.config.mouseInfluence - dist) / this.config.mouseInfluence;
          particle.vx -= (dx / dist) * force * 0.5;
          particle.vy -= (dy / dist) * force * 0.5;
        }
      }
      
      // Apply slight randomness
      particle.vx += (Math.random() - 0.5) * 0.01;
      particle.vy += (Math.random() - 0.5) * 0.01;
      
      // Limit speed
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (speed > this.config.speed.max) {
        particle.vx = (particle.vx / speed) * this.config.speed.max;
        particle.vy = (particle.vy / speed) * this.config.speed.max;
      }
      
      // Wrap around edges
      if (particle.x < -10) particle.x = this.width + 10;
      if (particle.x > this.width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = this.height + 10;
      if (particle.y > this.height + 10) particle.y = -10;
      
      // Pulse opacity
      particle.phase += particle.pulseSpeed;
      particle.opacity = particle.originalOpacity + Math.sin(particle.phase) * 0.1;
    });
  }
  
  drawParticles() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw connections first (behind particles)
    if (this.config.connectParticles && this.frameCount % 2 === 0) {
      this.drawConnections();
    }
    
    // Draw particles
    this.particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      
      // Create gradient for soft particle look
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      gradient.addColorStop(0, `rgba(${this.config.color}, ${particle.opacity})`);
      gradient.addColorStop(1, `rgba(${this.config.color}, 0)`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    });
  }
  
  drawConnections() {
    const maxConnections = 3;
    
    for (let i = 0; i < this.particles.length; i++) {
      let connections = 0;
      
      for (let j = i + 1; j < this.particles.length && connections < maxConnections; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.config.connectionDistance) {
          const opacity = (1 - dist / this.config.connectionDistance) * 0.15;
          
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(${this.config.color}, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
          
          connections++;
        }
      }
    }
  }
  
  animate() {
    if (!this.isActive) {
      this.animationId = null;
      return;
    }
    
    this.frameCount++;
    this.updateParticles();
    this.drawParticles();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Auto-initialize atmospheric fog containers
document.addEventListener('DOMContentLoaded', () => {
  const fogContainers = document.querySelectorAll('.atmospheric-fog');
  
  fogContainers.forEach(container => {
    // Parse options from data attributes
    const options = {};
    if (container.dataset.particles) {
      options.particleCount = parseInt(container.dataset.particles);
    }
    if (container.dataset.density) {
      const densityMap = { low: 25, medium: 50, high: 100 };
      options.particleCount = densityMap[container.dataset.density] || 50;
    }
    if (container.dataset.speed) {
      const speedMap = { slow: 0.2, normal: 0.5, fast: 1 };
      const speed = speedMap[container.dataset.speed] || 0.5;
      options.speed = { min: speed * 0.3, max: speed };
    }
    if (container.dataset.color) {
      options.color = container.dataset.color;
    }
    
    new AtmosphericFog(container, options);
  });
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AtmosphericFog;
}
