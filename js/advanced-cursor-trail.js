/**
 * v99.0: Advanced Cursor Trail System
 * Fortune 500 Quality - Particle Physics, Smooth Particle Effects
 * Creates sophisticated cursor trails with physics-based animations
 */
(function() {
  'use strict';

  class AdvancedCursorTrail {
    constructor(options = {}) {
      this.options = {
        particleCount: options.particleCount || 20,
        particleSize: options.particleSize || { min: 4, max: 12 },
        particleColor: options.particleColor || '201, 206, 214',
        trailLength: options.trailLength || 0.5,
        trailDecay: options.trailDecay || 0.96,
        gravity: options.gravity || 0.1,
        friction: options.friction || 0.95,
        enableAttractors: options.enableAttractors !== false,
        enableConnections: options.enableConnections !== false,
        connectionDistance: options.connectionDistance || 100,
        maxConnections: options.maxConnections || 3,
        glowEffect: options.glowEffect !== false,
        blendMode: options.blendMode || 'screen',
        ...options
      };

      this.canvas = null;
      this.ctx = null;
      this.particles = [];
      this.mouse = { x: 0, y: 0, vx: 0, vy: 0 };
      this.isActive = false;
      this.animationId = null;
      this.lastTime = 0;
      this.isTouch = window.matchMedia('(pointer: coarse)').matches;
      this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.init();
    }

    init() {
      if (this.isTouch || this.prefersReducedMotion) return;

      this.createCanvas();
      this.createParticles();
      this.attachEvents();
      this.start();

      console.log('✨ BuildBridge v99.0: Advanced Cursor Trail initialized');
    }

    createCanvas() {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'cursor-trail-canvas';
      this.ctx = this.canvas.getContext('2d');

      // Set canvas styles
      this.canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9997;
        mix-blend-mode: ${this.options.blendMode};
      `;

      document.body.appendChild(this.canvas);
      this.resize();

      // Handle resize
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.canvas.width = window.innerWidth * window.devicePixelRatio;
      this.canvas.height = window.innerHeight * window.devicePixelRatio;
      this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    }

    createParticles() {
      for (let i = 0; i < this.options.particleCount; i++) {
        this.particles.push(this.createParticle(i));
      }
    }

    createParticle(index) {
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: 0,
        vy: 0,
        size: Math.random() * (this.options.particleSize.max - this.options.particleSize.min) 
              + this.options.particleSize.min,
        life: 1,
        maxLife: 1 + Math.random() * 0.5,
        color: this.options.particleColor,
        alpha: Math.random() * 0.5 + 0.3,
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.02,
        index: index,
        connections: []
      };
    }

    attachEvents() {
      let mouseTimeout;
      let lastX = 0;
      let lastY = 0;
      let lastTime = Date.now();

      document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        const dt = (now - lastTime) / 1000;

        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.vx = (e.clientX - lastX) / dt * 0.1;
        this.mouse.vy = (e.clientY - lastY) / dt * 0.1;

        lastX = e.clientX;
        lastY = e.clientY;
        lastTime = now;

        this.isActive = true;

        clearTimeout(mouseTimeout);
        mouseTimeout = setTimeout(() => {
          this.isActive = false;
        }, 100);
      });

      // Hide on mouse leave
      document.addEventListener('mouseleave', () => {
        this.isActive = false;
      });

      // Pause on visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stop();
        } else {
          this.start();
        }
      });
    }

    update(deltaTime) {
      const dt = Math.min(deltaTime / 16, 2); // Cap delta time

      this.particles.forEach((particle, i) => {
        // Calculate force from mouse
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Spring force towards mouse position with delay based on index
        const delay = i * 0.05;
        const targetX = this.mouse.x - this.mouse.vx * delay;
        const targetY = this.mouse.y - this.mouse.vy * delay;
        
        const springStrength = 0.08 * (1 - i / this.particles.length);
        particle.vx += (targetX - particle.x) * springStrength;
        particle.vy += (targetY - particle.y) * springStrength;

        // Add mouse velocity influence
        const influence = 0.3 * (1 - i / this.particles.length);
        particle.vx += this.mouse.vx * influence;
        particle.vy += this.mouse.vy * influence;

        // Apply physics
        particle.vy += this.options.gravity * dt;
        particle.vx *= this.options.friction;
        particle.vy *= this.options.friction;

        // Add some noise/turbulence
        particle.vx += (Math.random() - 0.5) * 0.5;
        particle.vy += (Math.random() - 0.5) * 0.5;

        // Update position
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;

        // Update rotation
        particle.angle += particle.angularVelocity * dt;

        // Decay life and respawn
        particle.life -= 0.005 * dt;
        
        // Reset particle if it gets too far from mouse or life ends
        const distFromMouse = Math.sqrt(
          Math.pow(particle.x - this.mouse.x, 2) + 
          Math.pow(particle.y - this.mouse.y, 2)
        );

        if (particle.life <= 0 || distFromMouse > 300) {
          particle.life = particle.maxLife;
          // Respawn near mouse with some randomness
          const angle = Math.random() * Math.PI * 2;
          const radius = 20 + Math.random() * 30;
          particle.x = this.mouse.x + Math.cos(angle) * radius;
          particle.y = this.mouse.y + Math.sin(angle) * radius;
          particle.vx = this.mouse.vx * 0.5;
          particle.vy = this.mouse.vy * 0.5;
        }

        // Scale size based on life
        particle.currentSize = particle.size * particle.life;

        // Calculate alpha based on distance from mouse
        const maxDist = 200;
        const distAlpha = Math.max(0, 1 - distFromMouse / maxDist);
        particle.currentAlpha = particle.alpha * particle.life * distAlpha;
      });

      // Find connections between particles
      if (this.options.enableConnections) {
        this.updateConnections();
      }
    }

    updateConnections() {
      // Reset connections
      this.particles.forEach(p => p.connections = []);

      // Find nearby particles
      for (let i = 0; i < this.particles.length; i++) {
        const p1 = this.particles[i];
        let connections = 0;

        for (let j = i + 1; j < this.particles.length && connections < this.options.maxConnections; j++) {
          const p2 = this.particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < this.options.connectionDistance && p2.connections.length < this.options.maxConnections) {
            p1.connections.push({ particle: p2, distance: dist });
            p2.connections.push({ particle: p1, distance: dist });
            connections++;
          }
        }
      }
    }

    draw() {
      // Clear with fade effect
      this.ctx.fillStyle = 'rgba(15, 15, 16, 0.2)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Draw connections first
      if (this.options.enableConnections) {
        this.drawConnections();
      }

      // Draw particles
      this.particles.forEach(particle => {
        this.drawParticle(particle);
      });

      // Draw mouse glow
      if (this.isActive && this.options.glowEffect) {
        this.drawMouseGlow();
      }
    }

    drawParticle(particle) {
      const ctx = this.ctx;
      const { x, y, currentSize, currentAlpha, angle, color } = particle;

      if (currentAlpha <= 0.01) return;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Glow effect
      if (this.options.glowEffect) {
        ctx.shadowBlur = currentSize * 2;
        ctx.shadowColor = `rgba(${color}, ${currentAlpha})`;
      }

      // Main particle
      ctx.globalAlpha = currentAlpha;
      
      // Create gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize);
      gradient.addColorStop(0, `rgba(${color}, ${currentAlpha})`);
      gradient.addColorStop(0.4, `rgba(${color}, ${currentAlpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
      ctx.fill();

      // Inner core
      ctx.fillStyle = `rgba(${color}, ${currentAlpha * 1.5})`;
      ctx.beginPath();
      ctx.arc(0, 0, currentSize * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    drawConnections() {
      const ctx = this.ctx;

      this.particles.forEach(p1 => {
        p1.connections.forEach(conn => {
          const p2 = conn.particle;
          const dist = conn.distance;
          const maxDist = this.options.connectionDistance;
          const alpha = (1 - dist / maxDist) * Math.min(p1.currentAlpha, p2.currentAlpha) * 0.3;

          if (alpha <= 0.01) return;

          ctx.save();
          ctx.globalAlpha = alpha;
          
          // Create gradient line
          const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          gradient.addColorStop(0, `rgba(${p1.color}, 0)`);
          gradient.addColorStop(0.5, `rgba(${p1.color}, 1)`);
          gradient.addColorStop(1, `rgba(${p2.color}, 0)`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          ctx.restore();
        });
      });
    }

    drawMouseGlow() {
      const ctx = this.ctx;
      const { x, y } = this.mouse;
      const speed = Math.sqrt(this.mouse.vx * this.mouse.vx + this.mouse.vy * this.mouse.vy);
      const glowSize = 50 + Math.min(speed * 2, 50);

      ctx.save();
      
      // Outer glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
      gradient.addColorStop(0, 'rgba(201, 206, 214, 0.1)');
      gradient.addColorStop(0.5, 'rgba(201, 206, 214, 0.05)');
      gradient.addColorStop(1, 'rgba(201, 206, 214, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Speed streaks
      if (speed > 10) {
        const angle = Math.atan2(this.mouse.vy, this.mouse.vx);
        ctx.strokeStyle = `rgba(201, 206, 214, ${Math.min(speed / 100, 0.3)})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        for (let i = 0; i < 3; i++) {
          const streakLength = speed * (0.5 + i * 0.3);
          const offset = (i - 1) * 10;
          
          ctx.beginPath();
          ctx.moveTo(
            x - Math.cos(angle) * 30 + Math.cos(angle + Math.PI/2) * offset,
            y - Math.sin(angle) * 30 + Math.sin(angle + Math.PI/2) * offset
          );
          ctx.lineTo(
            x - Math.cos(angle) * (30 + streakLength) + Math.cos(angle + Math.PI/2) * offset,
            y - Math.sin(angle) * (30 + streakLength) + Math.sin(angle + Math.PI/2) * offset
          );
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    animate(currentTime) {
      if (!this.isActive) {
        // Still animate but with less intensity
        this.particles.forEach(p => {
          p.vx *= 0.9;
          p.vy *= 0.9;
        });
      }

      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      this.update(deltaTime);
      this.draw();

      this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    start() {
      if (this.animationId) return;
      this.lastTime = performance.now();
      this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    stop() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    destroy() {
      this.stop();
      if (this.canvas) {
        this.canvas.remove();
        this.canvas = null;
      }
    }

    // Public method to change color
    setColor(color) {
      this.options.particleColor = color;
      this.particles.forEach(p => p.color = color);
    }

    // Public method to set intensity
    setIntensity(intensity) {
      this.options.particleCount = Math.floor(20 * intensity);
      this.options.trailLength = 0.5 * intensity;
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AdvancedCursorTrail());
  } else {
    new AdvancedCursorTrail();
  }

  // Expose to global scope
  window.AdvancedCursorTrail = AdvancedCursorTrail;
})();
