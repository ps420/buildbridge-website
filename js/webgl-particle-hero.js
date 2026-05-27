/**
 * v30.0: WebGL Interactive Particle Hero
 * Fortune 500 Immersive Background System
 * 
 * Features:
 * - Interactive particle field reacting to mouse
 * - Connection lines between nearby particles
 * - Multiple color themes
 * - Performance optimized with requestAnimationFrame
 * - Touch support for mobile
 */

class WebGLParticleSystem {
  constructor(options = {}) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container = options.container || document.body;
    
    // Configuration
    this.config = {
      particleCount: options.particleCount || (window.innerWidth < 768 ? 30 : 60),
      connectionDistance: options.connectionDistance || 150,
      mouseDistance: options.mouseDistance || 200,
      particleSpeed: options.particleSpeed || 0.5,
      particleSize: options.particleSize || { min: 2, max: 4 },
      colors: options.colors || ['#C9CED6', '#F5F7FA', '#A0A8B0'],
      lineOpacity: options.lineOpacity || 0.15,
      mouseRepel: options.mouseRepel !== false,
      ...options
    };
    
    // State
    this.particles = [];
    this.mouse = { x: null, y: null, active: false };
    this.animationId = null;
    this.isActive = true;
    this.frameCount = 0;
    
    // Initialize
    this.init();
  }
  
  init() {
    // Setup canvas container
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'webgl-particle-container';
    this.wrapper.appendChild(this.canvas);
    this.container.insertBefore(this.wrapper, this.container.firstChild);
    
    // Setup canvas
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
    
    // Add vignette overlay
    this.vignette = document.createElement('div');
    this.vignette.className = 'particle-vignette';
    this.wrapper.appendChild(this.vignette);
    
    // Show controls
    this.addControls();
    this.addStats();
    
    console.log('✨ WebGL Particle System initialized');
  }
  
  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.scale(this.dpr, this.dpr);
  }
  
  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * this.config.particleSpeed,
        vy: (Math.random() - 0.5) * this.config.particleSpeed,
        size: Math.random() * (this.config.particleSize.max - this.config.particleSize.min) + this.config.particleSize.min,
        color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
        alpha: Math.random() * 0.5 + 0.3,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }
  
  bindEvents() {
    // Mouse/Touch tracking
    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      this.mouse.x = clientX;
      this.mouse.y = clientY;
      this.mouse.active = true;
    };
    
    const handleLeave = () => {
      this.mouse.active = false;
      this.mouse.x = null;
      this.mouse.y = null;
    };
    
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('mouseleave', handleLeave);
    window.addEventListener('touchend', handleLeave);
    
    // Resize handling
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.resize(), 200);
    }, { passive: true });
    
    // Visibility handling
    document.addEventListener('visibilitychange', () => {
      this.isActive = document.visibilityState === 'visible';
      if (this.isActive) this.animate();
    });
  }
  
  updateParticles() {
    this.particles.forEach(p => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Boundary check with wrapping
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;
      
      // Mouse interaction
      if (this.mouse.active && this.config.mouseRepel) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.config.mouseDistance) {
          const force = (this.config.mouseDistance - dist) / this.config.mouseDistance;
          p.x += dx * force * 0.02;
          p.y += dy * force * 0.02;
        }
      }
      
      // Pulse animation
      p.pulse += 0.02;
    });
  }
  
  drawParticles() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw connection lines
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.config.connectionDistance) {
          const opacity = (1 - dist / this.config.connectionDistance) * this.config.lineOpacity;
          this.ctx.strokeStyle = `rgba(201, 206, 214, ${opacity})`;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }
    
    // Draw particles
    this.particles.forEach(p => {
      const pulseSize = p.size + Math.sin(p.pulse) * 0.5;
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fill();
      
      // Glow effect
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, pulseSize * 2, 0, Math.PI * 2);
      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseSize * 2);
      gradient.addColorStop(0, `rgba(201, 206, 214, ${p.alpha * 0.3})`);
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    });
    
    this.ctx.globalAlpha = 1;
  }
  
  animate() {
    if (!this.isActive) return;
    
    this.frameCount++;
    
    // Render every 2nd frame on mobile for performance
    const skipFrame = window.innerWidth < 768 && this.frameCount % 2 === 0;
    
    if (!skipFrame) {
      this.updateParticles();
      this.drawParticles();
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  addControls() {
    const controls = document.createElement('div');
    controls.className = 'particle-controls';
    controls.innerHTML = `
      <button class="particle-control-btn" data-action="toggle" title="Pause/Resume">
        ⏸️
      </button>
      <button class="particle-control-btn" data-action="reset" title="Reset Particles">
        🔄
      </button>
      <button class="particle-control-btn" data-action="theme" title="Change Theme">
        🎨
      </button>
    `;
    
    document.body.appendChild(controls);
    
    // Show after delay
    setTimeout(() => controls.classList.add('visible'), 1000);
    
    // Bind controls
    controls.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        
        switch(action) {
          case 'toggle':
            this.isActive = !this.isActive;
            e.currentTarget.textContent = this.isActive ? '⏸️' : '▶️';
            if (this.isActive) this.animate();
            break;
          case 'reset':
            this.createParticles();
            break;
          case 'theme':
            this.cycleTheme();
            break;
        }
      });
    });
  }
  
  addStats() {
    const stats = document.createElement('div');
    stats.className = 'particle-stats';
    stats.innerHTML = `
      <div class="particle-stats-row">
        <span>Particles</span>
        <span class="particle-stats-value">${this.config.particleCount}</span>
      </div>
      <div class="particle-stats-row">
        <span>Connections</span>
        <span class="particle-stats-value" id="particle-connections">0</span>
      </div>
      <div class="particle-stats-row">
        <span>FPS</span>
        <span class="particle-stats-value" id="particle-fps">60</span>
      </div>
    `;
    
    document.body.appendChild(stats);
    setTimeout(() => stats.classList.add('visible'), 1500);
    
    // Update stats periodically
    let lastTime = performance.now();
    let frames = 0;
    
    setInterval(() => {
      const now = performance.now();
      const fps = Math.round(frames * 1000 / (now - lastTime));
      const fpsEl = document.getElementById('particle-fps');
      if (fpsEl) fpsEl.textContent = fps;
      
      // Count connections
      let connections = 0;
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < this.config.connectionDistance) {
            connections++;
          }
        }
      }
      const connEl = document.getElementById('particle-connections');
      if (connEl) connEl.textContent = connections;
      
      lastTime = now;
      frames = 0;
    }, 1000);
    
    // Track frames
    const trackFrame = () => {
      frames++;
      if (this.isActive) requestAnimationFrame(trackFrame);
    };
    trackFrame();
  }
  
  cycleTheme() {
    const themes = [
      ['#C9CED6', '#F5F7FA', '#A0A8B0'], // Chrome/Slate
      ['#FFD700', '#FFA500', '#FF6B6B'], // Gold/Warm
      ['#00CED1', '#48D1CC', '#20B2AA'], // Teal/Cool
      ['#FF6B9D', '#C44569', '#F8B500'], // Pink/Sunset
    ];
    
    const currentIndex = themes.findIndex(t => 
      JSON.stringify(t) === JSON.stringify(this.config.colors)
    );
    const nextIndex = (currentIndex + 1) % themes.length;
    this.config.colors = themes[nextIndex];
    
    this.particles.forEach(p => {
      p.color = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
    });
  }
  
  destroy() {
    this.isActive = false;
    cancelAnimationFrame(this.animationId);
    if (this.wrapper) this.wrapper.remove();
    document.querySelectorAll('.particle-controls, .particle-stats').forEach(el => el.remove());
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.particleSystem = new WebGLParticleSystem();
  });
} else {
  window.particleSystem = new WebGLParticleSystem();
}

// Export for global access
window.WebGLParticleSystem = WebGLParticleSystem;
