/**
 * V87.1: PARTICLE CONSTELLATION BACKGROUND
 * Interactive WebGL-inspired Canvas Particle System
 * Creates a connected network of particles that respond to mouse movement
 * Fortune 500 Quality Visual Effect
 */

class ParticleConstellation {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Configuration
    this.config = {
      particleCount: options.particleCount || 80,
      connectionDistance: options.connectionDistance || 150,
      mouseDistance: options.mouseDistance || 200,
      particleSpeed: options.particleSpeed || 0.5,
      particleSize: options.particleSize || 2,
      particleColor: options.particleColor || '201, 206, 214',
      lineColor: options.lineColor || '201, 206, 214',
      mouseColor: options.mouseColor || '255, 255, 255',
      responsive: options.responsive !== false,
      ...options
    };
    
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.animationId = null;
    this.isActive = true;
    this.frameCount = 0;
    
    this.init();
  }
  
  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }
  
  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.width = rect.width;
    this.height = rect.height;
    
    // Adjust particle count for smaller screens
    if (this.config.responsive && this.width < 768) {
      this.config.particleCount = Math.floor(this.config.particleCount * 0.6);
    }
  }
  
  createParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * this.config.particleSpeed,
        vy: (Math.random() - 0.5) * this.config.particleSpeed,
        size: Math.random() * this.config.particleSize + 1,
        opacity: Math.random() * 0.5 + 0.3,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
  }
  
  bindEvents() {
    // Mouse movement
    const handleMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      this.mouse.x = null;
      this.mouse.y = null;
    };
    
    this.canvas.addEventListener('mousemove', handleMouseMove, { passive: true });
    this.canvas.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    
    // Touch support
    const handleTouch = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.mouse.x = touch.clientX - rect.left;
      this.mouse.y = touch.clientY - rect.top;
    };
    
    this.canvas.addEventListener('touchmove', handleTouch, { passive: true });
    this.canvas.addEventListener('touchend', handleMouseLeave, { passive: true });
    
    // Resize handling with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.resize(), 250);
    }, { passive: true });
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      this.isActive = document.visibilityState === 'visible';
      if (this.isActive && !this.animationId) {
        this.animate();
      }
    });
  }
  
  drawParticles() {
    this.particles.forEach((particle, i) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = this.width;
      if (particle.x > this.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.height;
      if (particle.y > this.height) particle.y = 0;
      
      // Pulse effect
      particle.pulsePhase += 0.02;
      const pulse = Math.sin(particle.pulsePhase) * 0.3 + 0.7;
      
      // Mouse interaction
      let mouseInfluence = 0;
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.mouseDistance) {
          mouseInfluence = 1 - (distance / this.config.mouseDistance);
          
          // Gentle attraction to mouse
          const force = mouseInfluence * 0.02;
          particle.vx += dx * force * 0.01;
          particle.vy += dy * force * 0.01;
          
          // Limit velocity
          const maxVel = this.config.particleSpeed * 2;
          particle.vx = Math.max(-maxVel, Math.min(maxVel, particle.vx));
          particle.vy = Math.max(-maxVel, Math.min(maxVel, particle.vy));
        }
      }
      
      // Draw particle
      const size = particle.size * pulse * (1 + mouseInfluence * 0.5);
      const opacity = particle.opacity * (1 + mouseInfluence * 0.5);
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${this.config.particleColor}, ${opacity})`;
      this.ctx.fill();
      
      // Draw glow for mouse-near particles
      if (mouseInfluence > 0.3) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, size * 3, 0, Math.PI * 2);
        const gradient = this.ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size * 3
        );
        gradient.addColorStop(0, `rgba(${this.config.mouseColor}, ${mouseInfluence * 0.3})`);
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
      }
    });
  }
  
  drawConnections() {
    // Optimization: only check every 2nd frame
    if (this.frameCount % 2 !== 0) return;
    
    for (let i = 0; i < this.particles.length; i++) {
      let connections = 0;
      const maxConnections = 3;
      
      for (let j = i + 1; j < this.particles.length; j++) {
        if (connections >= maxConnections) break;
        
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.connectionDistance) {
          connections++;
          const opacity = (1 - distance / this.config.connectionDistance) * 0.3;
          
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(${this.config.lineColor}, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
  }
  
  drawMouseConnections() {
    if (this.mouse.x === null || this.mouse.y === null) return;
    
    // Find particles near mouse
    let mouseConnections = 0;
    const maxMouseConnections = 5;
    
    this.particles.forEach(particle => {
      if (mouseConnections >= maxMouseConnections) return;
      
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.config.mouseDistance * 0.6) {
        mouseConnections++;
        const opacity = (1 - distance / (this.config.mouseDistance * 0.6)) * 0.6;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.mouse.x, this.mouse.y);
        this.ctx.lineTo(particle.x, particle.y);
        this.ctx.strokeStyle = `rgba(${this.config.mouseColor}, ${opacity})`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    });
    
    // Draw mouse cursor glow
    const gradient = this.ctx.createRadialGradient(
      this.mouse.x, this.mouse.y, 0,
      this.mouse.x, this.mouse.y, 30
    );
    gradient.addColorStop(0, `rgba(${this.config.mouseColor}, 0.2)`);
    gradient.addColorStop(1, 'transparent');
    
    this.ctx.beginPath();
    this.ctx.arc(this.mouse.x, this.mouse.y, 30, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
  }
  
  animate() {
    if (!this.isActive) {
      this.animationId = null;
      return;
    }
    
    this.frameCount++;
    
    // Clear canvas with slight fade for trail effect
    this.ctx.fillStyle = 'rgba(15, 15, 16, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw connections first (behind particles)
    this.drawConnections();
    this.drawMouseConnections();
    
    // Draw particles
    this.drawParticles();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
  
  // Public API
  pause() {
    this.isActive = false;
  }
  
  resume() {
    this.isActive = true;
    if (!this.animationId) {
      this.animate();
    }
  }
  
  updateConfig(newConfig) {
    Object.assign(this.config, newConfig);
    this.createParticles();
  }
}

// ========================================
// INITIALIZATION
// ========================================

function initParticleConstellation() {
  // Create container if it doesn't exist
  let container = document.querySelector('.particle-constellation-bg');
  
  if (!container) {
    container = document.createElement('div');
    container.className = 'particle-constellation-bg';
    container.innerHTML = '<canvas></canvas>';
    
    // Insert as first child of body
    document.body.insertBefore(container, document.body.firstChild);
  }
  
  const canvas = container.querySelector('canvas');
  
  // Initialize particle system
  const particleSystem = new ParticleConstellation(canvas, {
    particleCount: window.matchMedia('(pointer: coarse)').matches ? 40 : 80,
    connectionDistance: 150,
    mouseDistance: 200,
    particleSpeed: 0.5,
    particleSize: 2,
    particleColor: '201, 206, 214',
    lineColor: '201, 206, 214',
    mouseColor: '255, 255, 255'
  });
  
  // Store instance for global access
  window.particleConstellation = particleSystem;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initParticleConstellation);
} else {
  initParticleConstellation();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParticleConstellation;
}
