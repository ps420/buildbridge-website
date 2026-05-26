/**
 * Atmospheric Fog Particles v13.0
 * Fortune 500 Ambient Background Effect
 * Provides subtle, atmospheric animated fog layers
 */

(function() {
  'use strict';

  class FogParticles {
    constructor(options = {}) {
      this.options = {
        particleCount: options.particleCount || 15,
        maxParticles: options.maxParticles || 25,
        colors: options.colors || [
          'rgba(201, 206, 214, 0.05)',
          'rgba(82, 88, 98, 0.08)',
          'rgba(42, 45, 52, 0.1)'
        ],
        minSize: options.minSize || 100,
        maxSize: options.maxSize || 400,
        speed: options.speed || 1,
        container: options.container || document.body
      };

      this.particles = [];
      this.mouseX = 0;
      this.mouseY = 0;
      this.isActive = true;
      this.rafId = null;

      this.init();
    }

    init() {
      // Check for reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      // Create container
      this.container = document.createElement('div');
      this.container.className = 'fog-container';
      this.container.setAttribute('aria-hidden', 'true');
      
      // Create canvas for high-performance particles
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'fog-canvas';
      this.ctx = this.canvas.getContext('2d');
      
      this.container.appendChild(this.canvas);
      document.body.insertBefore(this.container, document.body.firstChild);

      // Set canvas size
      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });

      // Create particle array
      this.createParticles();

      // Mouse tracking for interactive glow
      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      }, { passive: true });

      // Start animation
      this.animate();

      // Pause when tab hidden
      document.addEventListener('visibilitychange', () => {
        this.isActive = document.visibilityState === 'visible';
        if (this.isActive && !this.rafId) {
          this.animate();
        }
      });
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
    }

    createParticles() {
      for (let i = 0; i < this.options.particleCount; i++) {
        this.particles.push(this.createParticle());
      }
    }

    createParticle() {
      const size = this.options.minSize + Math.random() * (this.options.maxSize - this.options.minSize);
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: size,
        color: this.options.colors[Math.floor(Math.random() * this.options.colors.length)],
        vx: (Math.random() - 0.5) * this.options.speed * 0.5,
        vy: (Math.random() - 0.5) * this.options.speed * 0.3 - 0.2,
        opacity: 0.1 + Math.random() * 0.4,
        pulseSpeed: 0.002 + Math.random() * 0.003,
        pulsePhase: Math.random() * Math.PI * 2
      };
    }

    animate() {
      if (!this.isActive) {
        this.rafId = null;
        return;
      }

      this.rafId = requestAnimationFrame(() => this.animate());

      // Clear canvas
      this.ctx.clearRect(0, 0, this.width, this.height);

      const time = Date.now() * 0.001;

      // Update and draw particles
      this.particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around screen
        if (particle.x < -particle.size) particle.x = this.width + particle.size;
        if (particle.x > this.width + particle.size) particle.x = -particle.size;
        if (particle.y < -particle.size) particle.y = this.height + particle.size;
        if (particle.y > this.height + particle.size) particle.y = -particle.size;

        // Calculate pulse opacity
        const pulse = Math.sin(time * particle.pulseSpeed * 100 + particle.pulsePhase);
        const currentOpacity = particle.opacity * (0.7 + pulse * 0.3);

        // Interactive mouse repulsion
        const dx = this.mouseX - particle.x;
        const dy = this.mouseY - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 300;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * 0.02;
          particle.x -= dx * force;
          particle.y -= dy * force;
        }

        // Draw particle
        const gradient = this.ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size / 2
        );

        // Parse color and apply opacity
        const baseColor = particle.color.replace(/[\d.]+\)$/, `${currentOpacity})`);
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, particle.color.replace(/[\d.]+\)$/, '0)'));

        this.ctx.beginPath();
        this.ctx.fillStyle = gradient;
        this.ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      });

      // Draw subtle mouse glow
      const mouseGradient = this.ctx.createRadialGradient(
        this.mouseX, this.mouseY, 0,
        this.mouseX, this.mouseY, 400
      );
      mouseGradient.addColorStop(0, 'rgba(201, 206, 214, 0.03)');
      mouseGradient.addColorStop(1, 'rgba(201, 206, 214, 0)');
      
      this.ctx.beginPath();
      this.ctx.fillStyle = mouseGradient;
      this.ctx.arc(this.mouseX, this.mouseY, 400, 0, Math.PI * 2);
      this.ctx.fill();
    }

    destroy() {
      this.isActive = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.fogParticles = new FogParticles({
        particleCount: 12,
        maxParticles: 20,
        speed: 0.8
      });
    });
  } else {
    window.fogParticles = new FogParticles({
      particleCount: 12,
      maxParticles: 20,
      speed: 0.8
    });
  }

  // Expose for global access
  window.FogParticles = FogParticles;
})();
