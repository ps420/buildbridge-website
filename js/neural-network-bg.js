/**
 * Neural Network Background - WebGL Connected Nodes
 * Fortune 500 Interactive Background System
 * Version: v53.0
 */

class NeuralNetworkBackground {
  constructor(options = {}) {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.connections = [];
    this.mouse = { x: null, y: null };
    this.animationFrame = null;
    this.isActive = true;
    this.lastTime = 0;
    
    // Configuration with Fortune 500 defaults
    this.config = {
      particleCount: options.particleCount || 80,
      connectionDistance: options.connectionDistance || 150,
      particleSize: options.particleSize || { min: 2, max: 5 },
      particleSpeed: options.particleSpeed || { min: 0.2, max: 0.8 },
      colors: options.colors || {
        particle: '201, 206, 214',
        connection: '201, 206, 214',
        mouse: '245, 247, 250'
      },
      mouseInteraction: options.mouseInteraction !== false,
      mouseRadius: options.mouseRadius || 200,
      responsive: options.responsive !== false,
      performanceMode: options.performanceMode || 'balanced' // 'low', 'balanced', 'high'
    };
    
    this.init();
  }
  
  init() {
    this.createCanvas();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }
  
  createCanvas() {
    const container = document.querySelector('.neural-network-bg');
    if (!container) return;
    
    this.canvas = container.querySelector('canvas');
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      container.appendChild(this.canvas);
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }
  
  resize() {
    if (!this.canvas) return;
    
    const container = this.canvas.parentElement;
    const dpr = this.config.performanceMode === 'high' ? Math.min(window.devicePixelRatio, 2) : 1;
    
    this.canvas.width = container.offsetWidth * dpr;
    this.canvas.height = container.offsetHeight * dpr;
    this.canvas.style.width = container.offsetWidth + 'px';
    this.canvas.style.height = container.offsetHeight + 'px';
    
    this.ctx.scale(dpr, dpr);
    this.width = container.offsetWidth;
    this.height = container.offsetHeight;
    
    // Adjust particle count based on screen size
    if (this.config.responsive) {
      const area = this.width * this.height;
      const baseArea = 1920 * 1080;
      const ratio = Math.sqrt(area / baseArea);
      this.adjustedParticleCount = Math.floor(this.config.particleCount * ratio);
      this.adjustedParticleCount = Math.max(30, Math.min(120, this.adjustedParticleCount));
    } else {
      this.adjustedParticleCount = this.config.particleCount;
    }
  }
  
  createParticles() {
    this.particles = [];
    const count = this.adjustedParticleCount || this.config.particleCount;
    
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * this.config.particleSpeed.max,
        vy: (Math.random() - 0.5) * this.config.particleSpeed.max,
        size: Math.random() * (this.config.particleSize.max - this.config.particleSize.min) + this.config.particleSize.min,
        opacity: Math.random() * 0.5 + 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03
      });
    }
  }
  
  bindEvents() {
    if (this.config.mouseInteraction) {
      document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
      document.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }
    
    if (this.config.responsive) {
      window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    }
    
    // Pause when tab is hidden for performance
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Intersection Observer for performance
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isActive = entry.isIntersecting;
          if (this.isActive && !this.animationFrame) {
            this.animate();
          }
        });
      }, { threshold: 0.1 });
      
      if (this.canvas) {
        this.observer.observe(this.canvas);
      }
    }
  }
  
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }
  
  handleMouseLeave() {
    this.mouse.x = null;
    this.mouse.y = null;
  }
  
  handleResize() {
    this.resize();
    this.createParticles();
  }
  
  handleVisibilityChange() {
    this.isActive = document.visibilityState === 'visible';
    if (this.isActive && !this.animationFrame) {
      this.animate();
    }
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  updateParticles() {
    const time = Date.now() * 0.001;
    
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Boundary wrapping
      if (particle.x < 0) particle.x = this.width;
      if (particle.x > this.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.height;
      if (particle.y > this.height) particle.y = 0;
      
      // Pulsing size
      particle.pulsePhase += particle.pulseSpeed;
      particle.currentSize = particle.size + Math.sin(particle.pulsePhase) * 1;
      
      // Mouse interaction - gentle repulsion
      if (this.config.mouseInteraction && this.mouse.x !== null) {
        const dx = particle.x - this.mouse.x;
        const dy = particle.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.mouseRadius && distance > 0) {
          const force = (this.config.mouseRadius - distance) / this.config.mouseRadius;
          const angle = Math.atan2(dy, dx);
          const pushX = Math.cos(angle) * force * 2;
          const pushY = Math.sin(angle) * force * 2;
          
          particle.x += pushX;
          particle.y += pushY;
        }
      }
    });
  }
  
  drawParticles() {
    this.particles.forEach(particle => {
      const opacity = particle.opacity + Math.sin(particle.pulsePhase) * 0.1;
      
      // Glow effect
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.currentSize * 3
      );
      gradient.addColorStop(0, `rgba(${this.config.colors.particle}, ${opacity})`);
      gradient.addColorStop(0.5, `rgba(${this.config.colors.particle}, ${opacity * 0.3})`);
      gradient.addColorStop(1, `rgba(${this.config.colors.particle}, 0)`);
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.currentSize * 3, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      
      // Core
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.currentSize * 0.5, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${this.config.colors.particle}, ${opacity + 0.3})`;
      this.ctx.fill();
    });
  }
  
  drawConnections() {
    const maxConnections = this.config.performanceMode === 'low' ? 2 : 3;
    
    for (let i = 0; i < this.particles.length; i++) {
      let connections = 0;
      
      for (let j = i + 1; j < this.particles.length; j++) {
        if (connections >= maxConnections) break;
        
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.connectionDistance) {
          const opacity = (1 - distance / this.config.connectionDistance) * 0.3;
          
          // Create gradient line
          const gradient = this.ctx.createLinearGradient(
            this.particles[i].x, this.particles[i].y,
            this.particles[j].x, this.particles[j].y
          );
          gradient.addColorStop(0, `rgba(${this.config.colors.connection}, ${opacity})`);
          gradient.addColorStop(0.5, `rgba(${this.config.colors.connection}, ${opacity * 1.5})`);
          gradient.addColorStop(1, `rgba(${this.config.colors.connection}, ${opacity})`);
          
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = gradient;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
          
          connections++;
        }
      }
    }
  }
  
  drawMouseConnections() {
    if (!this.config.mouseInteraction || this.mouse.x === null) return;
    
    this.particles.forEach(particle => {
      const dx = particle.x - this.mouse.x;
      const dy = particle.y - this.mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.config.mouseRadius) {
        const opacity = (1 - distance / this.config.mouseRadius) * 0.4;
        
        const gradient = this.ctx.createLinearGradient(
          particle.x, particle.y, this.mouse.x, this.mouse.y
        );
        gradient.addColorStop(0, `rgba(${this.config.colors.particle}, ${opacity})`);
        gradient.addColorStop(1, `rgba(${this.config.colors.mouse}, ${opacity * 1.5})`);
        
        this.ctx.beginPath();
        this.ctx.moveTo(particle.x, particle.y);
        this.ctx.lineTo(this.mouse.x, this.mouse.y);
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    });
    
    // Draw mouse glow
    const mouseGradient = this.ctx.createRadialGradient(
      this.mouse.x, this.mouse.y, 0,
      this.mouse.x, this.mouse.y, 30
    );
    mouseGradient.addColorStop(0, `rgba(${this.config.colors.mouse}, 0.3)`);
    mouseGradient.addColorStop(1, `rgba(${this.config.colors.mouse}, 0)`);
    
    this.ctx.beginPath();
    this.ctx.arc(this.mouse.x, this.mouse.y, 30, 0, Math.PI * 2);
    this.ctx.fillStyle = mouseGradient;
    this.ctx.fill();
  }
  
  animate() {
    if (!this.isActive) {
      this.animationFrame = null;
      return;
    }
    
    // Frame skipping for performance
    const now = Date.now();
    const delta = now - this.lastTime;
    const fps = this.config.performanceMode === 'low' ? 30 : 60;
    const frameTime = 1000 / fps;
    
    if (delta < frameTime) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
      return;
    }
    
    this.lastTime = now - (delta % frameTime);
    
    // Clear canvas with trail effect
    this.ctx.fillStyle = 'rgba(15, 15, 18, 0.15)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.updateParticles();
    this.drawConnections();
    this.drawMouseConnections();
    this.drawParticles();
    
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    this.isActive = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseleave', this.handleMouseLeave);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('resize', this.handleResize);
  }
  
  // Public API for external control
  setParticleCount(count) {
    this.config.particleCount = count;
    this.createParticles();
  }
  
  setColors(colors) {
    Object.assign(this.config.colors, colors);
  }
  
  pause() {
    this.isActive = false;
  }
  
  resume() {
    this.isActive = true;
    if (!this.animationFrame) {
      this.animate();
    }
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.neuralNetworkBg = new NeuralNetworkBackground();
  });
} else {
  window.neuralNetworkBg = new NeuralNetworkBackground();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NeuralNetworkBackground;
}
