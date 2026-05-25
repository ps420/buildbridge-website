/**
 * BuildBridge Particle System v6.2
 * Fortune 500-quality ambient particle canvas
 */

class ParticleSystem {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.mouse = { x: null, y: null };
    this.isActive = true;
    
    // Configuration
    this.config = {
      particleCount: options.particleCount || 60,
      connectionDistance: options.connectionDistance || 150,
      mouseDistance: options.mouseDistance || 200,
      particleColor: options.particleColor || 'rgba(201, 206, 214, 0.6)',
      lineColor: options.lineColor || 'rgba(201, 206, 214, 0.15)',
      particleSize: options.particleSize || { min: 1, max: 3 },
      speed: options.speed || { min: 0.2, max: 0.8 },
      direction: options.direction || 'random', // 'random', 'up', 'down', 'left', 'right'
      interactive: options.interactive !== false,
      respawn: options.respawn !== false
    };
    
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
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }
  
  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push(this.createParticle());
    }
  }
  
  createParticle() {
    const size = Math.random() * (this.config.particleSize.max - this.config.particleSize.min) + this.config.particleSize.min;
    const speed = Math.random() * (this.config.speed.max - this.config.speed.min) + this.config.speed.min;
    
    let vx, vy;
    switch (this.config.direction) {
      case 'up': vx = (Math.random() - 0.5) * speed; vy = -speed; break;
      case 'down': vx = (Math.random() - 0.5) * speed; vy = speed; break;
      case 'left': vx = -speed; vy = (Math.random() - 0.5) * speed; break;
      case 'right': vx = speed; vy = (Math.random() - 0.5) * speed; break;
      default: vx = (Math.random() - 0.5) * speed; vy = (Math.random() - 0.5) * speed;
    }
    
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: vx,
      vy: vy,
      size: size,
      baseSize: size,
      opacity: Math.random() * 0.5 + 0.3,
      pulsePhase: Math.random() * Math.PI * 2
    };
  }
  
  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    
    if (this.config.interactive) {
      this.canvas.parentElement.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });
      
      this.canvas.parentElement.addEventListener('mouseleave', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });
    }
    
    // Visibility API
    document.addEventListener('visibilitychange', () => {
      this.isActive = document.visibilityState === 'visible';
    });
  }
  
  updateParticle(particle) {
    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;
    
    // Pulse effect
    particle.pulsePhase += 0.02;
    particle.size = particle.baseSize + Math.sin(particle.pulsePhase) * 0.5;
    
    // Mouse interaction
    if (this.config.interactive && this.mouse.x !== null) {
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.config.mouseDistance) {
        const force = (this.config.mouseDistance - distance) / this.config.mouseDistance;
        const angle = Math.atan2(dy, dx);
        particle.vx += Math.cos(angle) * force * 0.02;
        particle.vy += Math.sin(angle) * force * 0.02;
        
        // Grow near mouse
        particle.size = particle.baseSize * (1 + force * 0.5);
      }
    }
    
    // Damping
    particle.vx *= 0.99;
    particle.vy *= 0.99;
    
    // Keep minimum speed
    const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
    if (speed < 0.1) {
      particle.vx *= 1.01;
      particle.vy *= 1.01;
    }
    
    // Boundary handling
    if (this.config.respawn) {
      if (particle.x < -10) particle.x = this.width + 10;
      if (particle.x > this.width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = this.height + 10;
      if (particle.y > this.height + 10) particle.y = -10;
    } else {
      if (particle.x < 0 || particle.x > this.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.height) particle.vy *= -1;
    }
  }
  
  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < this.particles.length && connections < 3; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.connectionDistance) {
          const opacity = (1 - distance / this.config.connectionDistance) * 0.2;
          this.ctx.beginPath();
          this.ctx.strokeStyle = this.config.lineColor.replace('0.15', opacity.toFixed(3));
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
          connections++;
        }
      }
    }
  }
  
  drawParticles() {
    this.particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = this.config.particleColor.replace('0.6', particle.opacity.toFixed(2));
      this.ctx.fill();
      
      // Glow effect
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 3
      );
      gradient.addColorStop(0, this.config.particleColor.replace('0.6', (particle.opacity * 0.3).toFixed(2)));
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    });
  }
  
  animate() {
    if (!this.isActive) {
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }
    
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    this.particles.forEach(particle => this.updateParticle(particle));
    this.drawConnections();
    this.drawParticles();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', () => this.resize());
  }
}

// Ambient Particle Field - Full page background
class AmbientParticleField {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'particle-canvas';
    this.init();
  }
  
  init() {
    // Insert before body content
    document.body.insertBefore(this.canvas, document.body.firstChild);
    
    this.system = new ParticleSystem(this.canvas, {
      particleCount: 80,
      connectionDistance: 120,
      mouseDistance: 150,
      particleColor: 'rgba(201, 206, 214, 0.5)',
      lineColor: 'rgba(201, 206, 214, 0.08)',
      particleSize: { min: 1, max: 2.5 },
      speed: { min: 0.1, max: 0.4 },
      direction: 'random',
      interactive: true
    });
  }
}

// Section-specific particle effects
class SectionParticles {
  constructor(sectionSelector, options = {}) {
    this.sections = document.querySelectorAll(sectionSelector);
    this.systems = [];
    
    this.sections.forEach(section => {
      const canvas = document.createElement('canvas');
      canvas.className = 'section-particles';
      section.style.position = 'relative';
      section.insertBefore(canvas, section.firstChild);
      
      const system = new ParticleSystem(canvas, {
        particleCount: options.particleCount || 30,
        connectionDistance: options.connectionDistance || 100,
        mouseDistance: options.mouseDistance || 120,
        particleColor: options.particleColor || 'rgba(201, 206, 214, 0.4)',
        lineColor: options.lineColor || 'rgba(201, 206, 214, 0.06)',
        particleSize: options.particleSize || { min: 1, max: 2 },
        speed: options.speed || { min: 0.15, max: 0.4 },
        ...options
      });
      
      this.systems.push(system);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Full-page ambient particles
  new AmbientParticleField();
  
  // Hero section particles (faster, more energetic)
  const heroCanvas = document.createElement('canvas');
  heroCanvas.className = 'hero-particles';
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.position = 'relative';
    hero.insertBefore(heroCanvas, hero.querySelector('.hero-copy'));
    
    new ParticleSystem(heroCanvas, {
      particleCount: 50,
      connectionDistance: 140,
      mouseDistance: 180,
      particleColor: 'rgba(201, 206, 214, 0.5)',
      lineColor: 'rgba(201, 206, 214, 0.12)',
      particleSize: { min: 1.5, max: 3 },
      speed: { min: 0.3, max: 0.8 },
      direction: 'random',
      interactive: true
    });
  }
  
  console.log('%c✨ Particle System v6.2 Loaded', 'font-size: 11px; color: #C9CED6;');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ParticleSystem, AmbientParticleField, SectionParticles };
}
