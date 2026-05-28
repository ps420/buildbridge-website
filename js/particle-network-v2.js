/**
 * BuildBridge Particle Network Background v2.0
 * Fortune 500 Interactive Particle System
 * Canvas-based connected particles with mouse interaction
 * =====================================================
 */

class ParticleNetwork {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) return;
    
    // Configuration
    this.config = {
      particleCount: options.particleCount || 60,
      connectionDistance: options.connectionDistance || 150,
      mouseDistance: options.mouseDistance || 200,
      particleSpeed: options.particleSpeed || 0.5,
      particleSize: options.particleSize || { min: 2, max: 4 },
      lineWidth: options.lineWidth || 1,
      colors: options.colors || {
        particle: '201, 206, 214',
        line: '201, 206, 214'
      },
      opacity: options.opacity || {
        particle: { min: 0.3, max: 0.8 },
        line: 0.15
      },
      interactive: options.interactive !== false,
      responsive: options.responsive !== false,
      ...options
    };
    
    // State
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.animationId = null;
    this.isActive = true;
    this.dpr = window.devicePixelRatio || 1;
    
    this.init();
  }
  
  init() {
    this.createCanvas();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Set canvas size
    this.resize();
    
    // Add to container
    this.container.appendChild(this.canvas);
  }
  
  resize() {
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    
    this.ctx.scale(this.dpr, this.dpr);
  }
  
  createParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push(new Particle(
        this.width,
        this.height,
        this.config
      ));
    }
  }
  
  bindEvents() {
    // Mouse interaction
    if (this.config.interactive) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });
      
      this.canvas.addEventListener('mouseleave', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });
    }
    
    // Resize handler
    if (this.config.responsive) {
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.resize();
          this.createParticles();
        }, 250);
      });
    }
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      this.isActive = document.visibilityState === 'visible';
      if (this.isActive && !this.animationId) {
        this.animate();
      }
    });
  }
  
  animate() {
    if (!this.isActive) {
      this.animationId = null;
      return;
    }
    
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Update and draw particles
    this.particles.forEach((particle, i) => {
      particle.update(this.mouse, this.width, this.height);
      particle.draw(this.ctx);
      
      // Draw connections
      this.drawConnections(particle, i);
    });
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  drawConnections(particle, index) {
    for (let j = index + 1; j < this.particles.length; j++) {
      const other = this.particles[j];
      const dx = particle.x - other.x;
      const dy = particle.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.config.connectionDistance) {
        const opacity = (1 - distance / this.config.connectionDistance) * this.config.opacity.line;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(${this.config.colors.line}, ${opacity})`;
        this.ctx.lineWidth = this.config.lineWidth;
        this.ctx.moveTo(particle.x, particle.y);
        this.ctx.lineTo(other.x, other.y);
        this.ctx.stroke();
      }
    }
    
    // Mouse connections
    if (this.mouse.x !== null && this.mouse.y !== null) {
      const dx = particle.x - this.mouse.x;
      const dy = particle.y - this.mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.config.mouseDistance) {
        const opacity = (1 - distance / this.config.mouseDistance) * 0.3;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(${this.config.colors.particle}, ${opacity})`;
        this.ctx.lineWidth = this.config.lineWidth * 1.5;
        this.ctx.moveTo(particle.x, particle.y);
        this.ctx.lineTo(this.mouse.x, this.mouse.y);
        this.ctx.stroke();
      }
    }
  }
  
  // Public method to pause
  pause() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  // Public method to resume
  resume() {
    this.isActive = true;
    if (!this.animationId) {
      this.animate();
    }
  }
  
  // Public method to destroy
  destroy() {
    this.pause();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
  
  // Public method to update configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.createParticles();
  }
}

// =========================================
// PARTICLE CLASS
// =========================================
class Particle {
  constructor(canvasWidth, canvasHeight, config) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.config = config;
    
    this.reset();
  }
  
  reset() {
    this.x = Math.random() * this.canvasWidth;
    this.y = Math.random() * this.canvasHeight;
    
    // Random velocity
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * this.config.particleSpeed + 0.1;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    
    // Random size
    this.size = Math.random() * 
      (this.config.particleSize.max - this.config.particleSize.min) + 
      this.config.particleSize.min;
    
    // Random opacity
    this.opacity = Math.random() * 
      (this.config.opacity.particle.max - this.config.opacity.particle.min) + 
      this.config.opacity.particle.min;
    
    // Pulse animation
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.02 + Math.random() * 0.02;
  }
  
  update(mouse, canvasWidth, canvasHeight) {
    // Update canvas dimensions if changed
    if (canvasWidth !== this.canvasWidth || canvasHeight !== this.canvasHeight) {
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
    }
    
    // Mouse repulsion
    if (mouse.x !== null && mouse.y !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.config.mouseDistance) {
        const force = (this.config.mouseDistance - distance) / this.config.mouseDistance;
        const angle = Math.atan2(dy, dx);
        this.vx += Math.cos(angle) * force * 0.5;
        this.vy += Math.sin(angle) * force * 0.5;
      }
    }
    
    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;
    
    // Boundary check with bounce
    if (this.x < 0 || this.x > this.canvasWidth) {
      this.vx *= -1;
      this.x = Math.max(0, Math.min(this.x, this.canvasWidth));
    }
    
    if (this.y < 0 || this.y > this.canvasHeight) {
      this.vy *= -1;
      this.y = Math.max(0, Math.min(this.y, this.canvasHeight));
    }
    
    // Apply friction to keep speed in check
    this.vx *= 0.99;
    this.vy *= 0.99;
    
    // Maintain minimum speed
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed < 0.1) {
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * this.config.particleSpeed;
      this.vy = Math.sin(angle) * this.config.particleSpeed;
    }
    
    // Update pulse
    this.pulsePhase += this.pulseSpeed;
  }
  
  draw(ctx) {
    const pulseFactor = Math.sin(this.pulsePhase) * 0.3 + 0.7;
    const currentOpacity = this.opacity * pulseFactor;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.config.colors.particle}, ${currentOpacity})`;
    ctx.fill();
    
    // Glow effect
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.config.colors.particle}, ${currentOpacity * 0.2})`;
    ctx.fill();
  }
}

// =========================================
// AUTO-INITIALIZATION
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize main background
  const mainContainer = document.querySelector('.particle-network-bg');
  if (mainContainer) {
    new ParticleNetwork(mainContainer, {
      particleCount: window.matchMedia('(pointer: coarse)').matches ? 30 : 60,
      connectionDistance: 150,
      mouseDistance: 200
    });
  }
  
  // Initialize section-specific particles
  document.querySelectorAll('.section-particles').forEach(container => {
    new ParticleNetwork(container, {
      particleCount: 25,
      connectionDistance: 120,
      mouseDistance: 150,
      particleSpeed: 0.3
    });
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ParticleNetwork, Particle };
}
