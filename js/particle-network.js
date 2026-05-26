/**
 * BuildBridge Ambient Particle Network
 * Fortune 500 Quality - Subtle ambient background particle network
 */

class ParticleNetwork {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.isRunning = false;
    this.rafId = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.isMouseActive = false;
    this.mouseTimeout = null;
    
    // Configuration
    this.config = {
      particleCount: options.particleCount || 25,
      connectionDistance: options.connectionDistance || 150,
      particleSpeed: options.particleSpeed || 0.3,
      particleSize: options.particleSize || 2,
      lineWidth: options.lineWidth || 0.5,
      opacity: options.opacity || 0.15,
      color: options.color || '147, 197, 253', // Blue-300 in RGB
      interactive: options.interactive !== false
    };
    
    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.setupEventListeners();
    this.start();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
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
        vx: (Math.random() - 0.5) * this.config.particleSpeed,
        vy: (Math.random() - 0.5) * this.config.particleSpeed,
        size: Math.random() * this.config.particleSize + 1,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
  }

  setupEventListeners() {
    // Resize handler
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    }, { passive: true });

    // Mouse interaction
    if (this.config.interactive) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        this.isMouseActive = true;
        
        clearTimeout(this.mouseTimeout);
        this.mouseTimeout = setTimeout(() => {
          this.isMouseActive = false;
        }, 100);
      }, { passive: true });
    }

    // Visibility check for performance
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;

      // Keep in bounds
      p.x = Math.max(0, Math.min(this.width, p.x));
      p.y = Math.max(0, Math.min(this.height, p.y));

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${this.config.color}, ${p.opacity * this.config.opacity})`;
      this.ctx.fill();

      // Draw connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.config.connectionDistance) {
          const opacity = (1 - distance / this.config.connectionDistance) * this.config.opacity;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(${this.config.color}, ${opacity})`;
          this.ctx.lineWidth = this.config.lineWidth;
          this.ctx.stroke();
        }
      }

      // Mouse interaction
      if (this.config.interactive && this.isMouseActive) {
        const dx = p.x - this.mouseX;
        const dy = p.y - this.mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.config.connectionDistance * 1.5) {
          const opacity = (1 - distance / (this.config.connectionDistance * 1.5)) * this.config.opacity * 2;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(this.mouseX, this.mouseY);
          this.ctx.strokeStyle = `rgba(${this.config.color}, ${opacity})`;
          this.ctx.lineWidth = this.config.lineWidth * 1.5;
          this.ctx.stroke();
        }
      }
    }

    this.rafId = requestAnimationFrame(() => this.animate());
  }
}

// Initialize particle network
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  // Don't run on mobile/tablet for performance
  if (window.matchMedia('(pointer: coarse)').matches) return;

  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-network';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0.6;
  `;
  
  document.body.insertBefore(canvas, document.body.firstChild);
  
  // Initialize particle network
  window.particleNetwork = new ParticleNetwork(canvas, {
    particleCount: 30,
    connectionDistance: 180,
    particleSpeed: 0.2,
    particleSize: 2,
    lineWidth: 0.8,
    opacity: 0.2,
    color: '147, 197, 253',
    interactive: true
  });
});

// Export for global access
window.ParticleNetwork = ParticleNetwork;

console.log('✨ Ambient Particle Network initialized');
