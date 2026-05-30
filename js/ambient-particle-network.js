/**
 * v131.0: Ambient Particle Network Background System
 * Fortune 500 Quality Interactive Particle Network
 * Creates elegant connected particles that respond to user interaction
 */

(function() {
  'use strict';
  
  // Feature detection
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLowPowerDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  
  // Skip on low-end devices or when reduced motion is preferred
  if (prefersReducedMotion || (isLowPowerDevice && isTouchDevice)) {
    return;
  }
  
  class AmbientParticleNetwork {
    constructor(container) {
      this.container = container;
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.container.appendChild(this.canvas);
      
      // Configuration
      this.config = {
        particleCount: isTouchDevice ? 30 : (isLowPowerDevice ? 40 : 60),
        connectionDistance: isTouchDevice ? 100 : 150,
        mouseRadius: 200,
        speed: 0.5,
        colors: {
          particle: 'rgba(201, 206, 214, 0.4)',
          line: 'rgba(201, 206, 214, 0.08)',
          hover: 'rgba(201, 206, 214, 0.8)'
        }
      };
      
      this.particles = [];
      this.mouse = { x: null, y: null, active: false };
      this.animationId = null;
      this.isVisible = true;
      
      this.init();
    }
    
    init() {
      this.resize();
      this.createParticles();
      this.bindEvents();
      this.observeVisibility();
      this.animate();
    }
    
    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;
      this.canvas.style.width = `${window.innerWidth}px`;
      this.canvas.style.height = `${window.innerHeight}px`;
      this.ctx.scale(dpr, dpr);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }
    
    createParticles() {
      this.particles = [];
      for (let i = 0; i < this.config.particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * this.config.speed,
          vy: (Math.random() - 0.5) * this.config.speed,
          radius: Math.random() * 2 + 1,
          originalRadius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.3
        });
      }
    }
    
    bindEvents() {
      // Mouse/touch movement
      const handleMove = (e) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        this.mouse.x = clientX;
        this.mouse.y = clientY;
        this.mouse.active = true;
        
        // Deactivate after delay
        clearTimeout(this.mouseTimeout);
        this.mouseTimeout = setTimeout(() => {
          this.mouse.active = false;
        }, 100);
      };
      
      window.addEventListener('mousemove', handleMove, { passive: true });
      window.addEventListener('touchmove', handleMove, { passive: true });
      
      // Leave detection
      window.addEventListener('mouseleave', () => {
        this.mouse.active = false;
      });
      
      // Resize
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => this.resize(), 200);
      }, { passive: true });
      
      // Pause when tab hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else {
          this.resume();
        }
      });
    }
    
    observeVisibility() {
      const observer = new IntersectionObserver((entries) => {
        this.isVisible = entries[0].isIntersecting;
        if (this.isVisible) {
          this.resume();
        } else {
          this.pause();
        }
      }, { threshold: 0 });
      
      observer.observe(this.container);
    }
    
    updateParticles() {
      this.particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > this.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > this.height) particle.vy *= -1;
        
        // Mouse interaction
        if (this.mouse.active) {
          const dx = this.mouse.x - particle.x;
          const dy = this.mouse.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < this.config.mouseRadius) {
            const force = (this.config.mouseRadius - distance) / this.config.mouseRadius;
            const angle = Math.atan2(dy, dx);
            particle.vx += Math.cos(angle) * force * 0.02;
            particle.vy += Math.sin(angle) * force * 0.02;
            particle.radius = particle.originalRadius * (1 + force * 0.5);
          } else {
            particle.radius = particle.originalRadius;
          }
        }
        
        // Speed limit
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const maxSpeed = this.config.speed * 2;
        if (speed > maxSpeed) {
          particle.vx = (particle.vx / speed) * maxSpeed;
          particle.vy = (particle.vy / speed) * maxSpeed;
        }
      });
    }
    
    drawParticles() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      
      // Draw connections
      this.ctx.strokeStyle = this.config.colors.line;
      this.ctx.lineWidth = 0.5;
      
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < this.config.connectionDistance) {
            const opacity = (1 - distance / this.config.connectionDistance) * 0.5;
            this.ctx.strokeStyle = `rgba(201, 206, 214, ${opacity * 0.15})`;
            this.ctx.beginPath();
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.stroke();
          }
        }
      }
      
      // Draw particles
      this.particles.forEach(particle => {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.config.colors.particle;
        this.ctx.fill();
        
        // Glow effect
        if (particle.radius > particle.originalRadius) {
          this.ctx.beginPath();
          this.ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(201, 206, 214, ${particle.opacity * 0.1})`;
          this.ctx.fill();
        }
      });
    }
    
    animate() {
      if (!this.isVisible) return;
      
      this.updateParticles();
      this.drawParticles();
      
      this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    pause() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
    
    resume() {
      if (!this.animationId && this.isVisible) {
        this.animate();
      }
    }
    
    destroy() {
      this.pause();
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }
  
  // Initialize when DOM is ready
  function init() {
    const container = document.querySelector('.ambient-particle-network');
    if (container) {
      new AmbientParticleNetwork(container);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose to global scope for manual control
  window.AmbientParticleNetwork = AmbientParticleNetwork;
})();
