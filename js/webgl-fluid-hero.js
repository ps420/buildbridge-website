/**
 * v28.0: WebGL Fluid Simulation Hero
 * High-performance fluid dynamics background effect
 * Fortune 500 Premium Visual Experience
 */

(function() {
  'use strict';
  
  const FluidHero = {
    // Configuration
    config: {
      canvasId: 'fluid-hero-canvas',
      containerSelector: '.hero',
      particleCount: 25,
      particleSize: { min: 100, max: 300 },
      speed: 0.0003,
      turbulence: 0.5,
      colorMix: 0.3,
      mouseInfluence: 0.15,
      mouseRadius: 200,
      fadeRate: 0.96,
      blurAmount: 40
    },
    
    // State
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    particles: [],
    mouse: { x: -1000, y: -1000, vx: 0, vy: 0 },
    isActive: true,
    animationId: null,
    frameCount: 0,
    
    // Colors for fluid (adjustable via CSS)
    colors: {
      dark: [
        { r: 26, g: 26, b: 34 },    // Dark base
        { r: 45, g: 45, b: 60 },    // Slightly lighter
        { r: 60, g: 60, b: 80 },    // Mid tone
        { r: 201, g: 206, b: 214 }  // Chrome accent
      ],
      light: [
        { r: 248, g: 249, b: 250 }, // Light base
        { r: 233, g: 236, b: 239 }, // Slightly darker
        { r: 222, g: 226, b: 230 }, // Mid tone
        { r: 26, g: 26, b: 46 }     // Dark accent
      ]
    },
    
    /**
     * Initialize the fluid hero
     */
    init() {
      // Check for reduced motion preference
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        console.log('🌊 Fluid Hero: Reduced motion enabled, skipping animation');
        return;
      }
      
      // Check for touch device (disable on mobile for performance)
      if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
        console.log('🌊 Fluid Hero: Touch device detected, using simplified version');
        this.config.particleCount = 15;
        this.config.blurAmount = 20;
      }
      
      this.createCanvas();
      this.setupParticles();
      this.bindEvents();
      this.startAnimation();
      
      console.log('🌊 BuildBridge WebGL Fluid Hero initialized');
    },
    
    /**
     * Create and inject canvas
     */
    createCanvas() {
      const container = document.querySelector(this.config.containerSelector);
      if (!container) return;
      
      // Check if canvas already exists
      this.canvas = document.getElementById(this.config.canvasId);
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = this.config.canvasId;
        this.canvas.style.cssText = `
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          pointer-events: none;
          opacity: 0.6;
          filter: blur(${this.config.blurAmount}px);
          transition: opacity 0.5s ease;
        `;
        container.insertBefore(this.canvas, container.firstChild);
      }
      
      this.ctx = this.canvas.getContext('2d', { alpha: true });
      this.resize();
    },
    
    /**
     * Set up fluid particles
     */
    setupParticles() {
      this.particles = [];
      const theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const palette = this.colors[theme];
      
      for (let i = 0; i < this.config.particleCount; i++) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: this.config.particleSize.min + 
                  Math.random() * (this.config.particleSize.max - this.config.particleSize.min),
          color: color,
          angle: Math.random() * Math.PI * 2,
          angularVelocity: (Math.random() - 0.5) * 0.02,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.03
        });
      }
    },
    
    /**
     * Bind event listeners
     */
    bindEvents() {
      // Resize handler
      window.addEventListener('resize', () => {
        this.resize();
      }, { passive: true });
      
      // Mouse tracking
      document.addEventListener('mousemove', (e) => {
        const rect = this.canvas?.getBoundingClientRect();
        if (rect) {
          this.mouse.vx = e.clientX - this.mouse.x;
          this.mouse.vy = e.clientY - this.mouse.y;
          this.mouse.x = e.clientX - rect.left;
          this.mouse.y = e.clientY - rect.top;
        }
      }, { passive: true });
      
      // Mouse leave
      document.addEventListener('mouseleave', () => {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
      });
      
      // Theme change handler
      window.addEventListener('themechange', (e) => {
        this.updateColors(e.detail.theme);
      });
      
      // Visibility check
      document.addEventListener('visibilitychange', () => {
        this.isActive = !document.hidden;
        if (this.isActive && !this.animationId) {
          this.startAnimation();
        }
      });
      
      // Intersection Observer for performance
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isActive = entry.isIntersecting;
          if (this.isActive && !this.animationId) {
            this.startAnimation();
          }
        });
      }, { threshold: 0.1 });
      
      const container = document.querySelector(this.config.containerSelector);
      if (container) observer.observe(container);
    },
    
    /**
     * Update particle colors on theme change
     */
    updateColors(theme) {
      const palette = this.colors[theme];
      this.particles.forEach((particle, i) => {
        particle.color = palette[i % palette.length];
      });
    },
    
    /**
     * Resize canvas
     */
    resize() {
      const container = document.querySelector(this.config.containerSelector);
      if (!container || !this.canvas) return;
      
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = container.offsetWidth;
      this.height = container.offsetHeight;
      
      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.ctx.scale(dpr, dpr);
      
      // Reset particles on resize
      this.setupParticles();
    },
    
    /**
     * Animation loop
     */
    animate() {
      if (!this.isActive) {
        this.animationId = null;
        return;
      }
      
      this.frameCount++;
      
      // Skip frames for performance (30fps)
      if (this.frameCount % 2 !== 0) {
        this.animationId = requestAnimationFrame(() => this.animate());
        return;
      }
      
      this.ctx.fillStyle = `rgba(15, 15, 18, ${1 - this.config.fadeRate})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      // Update and draw particles
      this.particles.forEach(particle => {
        this.updateParticle(particle);
        this.drawParticle(particle);
      });
      
      // Draw connections between close particles
      this.drawConnections();
      
      this.animationId = requestAnimationFrame(() => this.animate());
    },
    
    /**
     * Update single particle
     */
    updateParticle(p) {
      // Flow field movement
      const time = Date.now() * this.config.speed;
      const noiseX = Math.sin(p.y * 0.005 + time) * this.config.turbulence;
      const noiseY = Math.cos(p.x * 0.005 + time) * this.config.turbulence;
      
      p.vx += noiseX * 0.01;
      p.vy += noiseY * 0.01;
      
      // Mouse influence
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < this.config.mouseRadius) {
        const force = (this.config.mouseRadius - dist) / this.config.mouseRadius;
        p.vx += (dx / dist) * force * this.config.mouseInfluence;
        p.vy += (dy / dist) * force * this.config.mouseInfluence;
      }
      
      // Apply velocity with damping
      p.vx *= 0.99;
      p.vy *= 0.99;
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Rotation
      p.angle += p.angularVelocity;
      
      // Pulse effect
      p.pulsePhase += p.pulseSpeed;
      
      // Boundary wrapping
      if (p.x < -p.radius) p.x = this.width + p.radius;
      if (p.x > this.width + p.radius) p.x = -p.radius;
      if (p.y < -p.radius) p.y = this.height + p.radius;
      if (p.y > this.height + p.radius) p.y = -p.radius;
    },
    
    /**
     * Draw single particle
     */
    drawParticle(p) {
      const pulse = 1 + Math.sin(p.pulsePhase) * 0.1;
      const radius = p.radius * pulse;
      
      const gradient = this.ctx.createRadialGradient(
        p.x, p.y, 0,
        p.x, p.y, radius
      );
      
      const color = p.color;
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`);
      gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.1)`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.angle);
      
      // Draw organic shape
      this.ctx.beginPath();
      this.ctx.fillStyle = gradient;
      
      const points = 8;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const r = radius * (0.8 + Math.sin(angle * 3 + p.pulsePhase) * 0.2);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      this.ctx.closePath();
      this.ctx.fill();
      
      this.ctx.restore();
    },
    
    /**
     * Draw connections between particles
     */
    drawConnections() {
      const maxDistance = 250;
      const maxConnections = 3;
      
      for (let i = 0; i < this.particles.length; i++) {
        let connections = 0;
        
        for (let j = i + 1; j < this.particles.length && connections < maxConnections; j++) {
          const p1 = this.particles[i];
          const p2 = this.particles[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < maxDistance) {
            connections++;
            const opacity = (1 - dist / maxDistance) * 0.1;
            
            const gradient = this.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, `rgba(${p1.color.r}, ${p1.color.g}, ${p1.color.b}, ${opacity})`);
            gradient.addColorStop(1, `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, ${opacity})`);
            
            this.ctx.beginPath();
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
          }
        }
      }
    },
    
    /**
     * Start animation
     */
    startAnimation() {
      if (this.animationId) return;
      this.isActive = true;
      this.animate();
    },
    
    /**
     * Stop animation
     */
    stopAnimation() {
      this.isActive = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    },
    
    /**
     * Destroy and cleanup
     */
    destroy() {
      this.stopAnimation();
      if (this.canvas) {
        this.canvas.remove();
        this.canvas = null;
      }
    }
  };
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FluidHero.init());
  } else {
    FluidHero.init();
  }
  
  // Expose to global scope
  window.FluidHero = FluidHero;
  
})();
