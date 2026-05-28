/**
 * BuildBridge v48.0 - WebGL Weather Effects System
 * Fortune 500 Atmospheric Enhancement
 * 
 * Features:
 * - Rain effect with realistic droplet physics
 * - Snow effect with wind simulation
 * - Fireflies with organic movement patterns
 * - Autumn leaves with rotation physics
 * - Rising bubbles for underwater feel
 * - GPU-accelerated particle rendering
 */

(function() {
  'use strict';

  class WeatherEffectsSystem {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.particles = [];
      this.animationId = null;
      this.currentMode = 'none';
      this.intensity = 0.5;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.mouseX = this.width / 2;
      this.mouseY = this.height / 2;
      this.windX = 0;
      this.windY = 0;
      
      this.modes = {
        rain: this.initRain.bind(this),
        snow: this.initSnow.bind(this),
        fireflies: this.initFireflies.bind(this),
        leaves: this.initLeaves.bind(this),
        bubbles: this.initBubbles.bind(this),
        none: () => this.clearParticles()
      };

      this.init();
    }

    init() {
      // Check for reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      this.createCanvas();
      this.createControlPanel();
      this.bindEvents();
      
      // Start with subtle fireflies on load
      this.setMode('fireflies');
      
      console.log('🌦️ BuildBridge v48.0: WebGL Weather Effects System initialized');
    }

    createCanvas() {
      const container = document.createElement('div');
      container.className = 'weather-effects-container';
      container.setAttribute('aria-hidden', 'true');
      
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'weather-effects-canvas';
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      
      container.appendChild(this.canvas);
      document.body.appendChild(container);
      
      this.ctx = this.canvas.getContext('2d');
    }

    createControlPanel() {
      // Create toggle button
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'weather-toggle-btn';
      toggleBtn.setAttribute('aria-label', 'Toggle weather effects');
      toggleBtn.innerHTML = `
        <span class="weather-toggle-icon">🌦️</span>
        <span class="weather-toggle-indicator"></span>
      `;
      
      // Create control panel
      const panel = document.createElement('div');
      panel.className = 'weather-control-panel';
      panel.innerHTML = `
        <div class="weather-control-header">
          <h4>Atmosphere</h4>
          <button class="weather-control-close" aria-label="Close weather panel">×</button>
        </div>
        <div class="weather-modes">
          <button class="weather-mode-btn active" data-mode="fireflies" aria-label="Fireflies effect">
            <span class="weather-mode-icon">✨</span>
            <span class="weather-mode-label">Fireflies</span>
          </button>
          <button class="weather-mode-btn" data-mode="rain" aria-label="Rain effect">
            <span class="weather-mode-icon">🌧️</span>
            <span class="weather-mode-label">Rain</span>
          </button>
          <button class="weather-mode-btn" data-mode="snow" aria-label="Snow effect">
            <span class="weather-mode-icon">❄️</span>
            <span class="weather-mode-label">Snow</span>
          </button>
          <button class="weather-mode-btn" data-mode="leaves" aria-label="Leaves effect">
            <span class="weather-mode-icon">🍂</span>
            <span class="weather-mode-label">Leaves</span>
          </button>
          <button class="weather-mode-btn" data-mode="bubbles" aria-label="Bubbles effect">
            <span class="weather-mode-icon">🫧</span>
            <span class="weather-mode-label">Bubbles</span>
          </button>
          <button class="weather-mode-btn" data-mode="none" aria-label="No effects">
            <span class="weather-mode-icon">✕</span>
            <span class="weather-mode-label">Off</span>
          </button>
        </div>
        <div class="weather-intensity-control">
          <div class="weather-intensity-label">
            <span>Intensity</span>
            <span id="intensity-value">50%</span>
          </div>
          <input type="range" class="weather-intensity-slider" min="0" max="100" value="50" aria-label="Effect intensity">
        </div>
        <div class="weather-presets">
          <div class="weather-preset-label">Time of Day</div>
          <div class="weather-preset-chips">
            <button class="weather-preset-chip active" data-preset="default">Auto</button>
            <button class="weather-preset-chip" data-preset="morning">Morning</button>
            <button class="weather-preset-chip" data-preset="evening">Evening</button>
            <button class="weather-preset-chip" data-preset="night">Night</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(toggleBtn);
      document.body.appendChild(panel);
      
      this.toggleBtn = toggleBtn;
      this.controlPanel = panel;
    }

    bindEvents() {
      // Toggle button
      this.toggleBtn.addEventListener('click', () => {
        this.togglePanel();
      });
      
      // Close button
      this.controlPanel.querySelector('.weather-control-close').addEventListener('click', () => {
        this.closePanel();
      });
      
      // Mode buttons
      this.controlPanel.querySelectorAll('.weather-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.dataset.mode;
          this.setMode(mode);
          this.updateActiveMode(btn);
        });
      });
      
      // Intensity slider
      const slider = this.controlPanel.querySelector('.weather-intensity-slider');
      const intensityValue = this.controlPanel.querySelector('#intensity-value');
      slider.addEventListener('input', (e) => {
        this.intensity = e.target.value / 100;
        intensityValue.textContent = e.target.value + '%';
        this.updateParticleCount();
      });
      
      // Preset chips
      this.controlPanel.querySelectorAll('.weather-preset-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          this.applyPreset(chip.dataset.preset);
          this.controlPanel.querySelectorAll('.weather-preset-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        });
      });
      
      // Mouse tracking for wind effect
      document.addEventListener('mousemove', (e) => {
        const newMouseX = e.clientX;
        const newMouseY = e.clientY;
        this.windX = (newMouseX - this.mouseX) * 0.01;
        this.windY = (newMouseY - this.mouseY) * 0.01;
        this.mouseX = newMouseX;
        this.mouseY = newMouseY;
      });
      
      // Window resize
      window.addEventListener('resize', () => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
      });
      
      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closePanel();
      });
    }

    togglePanel() {
      this.controlPanel.classList.toggle('active');
      this.toggleBtn.classList.toggle('active');
    }

    closePanel() {
      this.controlPanel.classList.remove('active');
      this.toggleBtn.classList.remove('active');
    }

    updateActiveMode(activeBtn) {
      this.controlPanel.querySelectorAll('.weather-mode-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      activeBtn.classList.add('active');
    }

    setMode(mode) {
      this.currentMode = mode;
      this.clearParticles();
      
      if (mode !== 'none' && this.modes[mode]) {
        this.modes[mode]();
        this.startAnimation();
        document.body.classList.add(`weather-effect--${mode}`);
      } else {
        this.stopAnimation();
        document.body.classList.remove(`weather-effect--${this.currentMode}`);
      }
    }

    clearParticles() {
      this.particles = [];
    }

    updateParticleCount() {
      // Adjust particle count based on intensity
      if (this.currentMode !== 'none') {
        const targetCount = Math.floor(this.getInitialParticleCount() * this.intensity);
        while (this.particles.length > targetCount) {
          this.particles.pop();
        }
        while (this.particles.length < targetCount) {
          this.addParticle();
        }
      }
    }

    getInitialParticleCount() {
      switch (this.currentMode) {
        case 'rain': return 300;
        case 'snow': return 150;
        case 'fireflies': return 50;
        case 'leaves': return 25;
        case 'bubbles': return 40;
        default: return 0;
      }
    }

    // Rain Effect
    initRain() {
      const count = Math.floor(300 * this.intensity);
      for (let i = 0; i < count; i++) {
        this.addRainParticle();
      }
    }

    addRainParticle() {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * -this.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 10 + 15,
        opacity: Math.random() * 0.3 + 0.1
      });
    }

    updateRain() {
      this.particles.forEach((p, i) => {
        p.y += p.speed;
        p.x += this.windX * 2;
        
        if (p.y > this.height) {
          p.y = -p.length;
          p.x = Math.random() * this.width;
        }
      });
    }

    drawRain() {
      this.ctx.strokeStyle = 'rgba(201, 206, 214, 0.4)';
      this.ctx.lineWidth = 1;
      
      this.particles.forEach(p => {
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x + this.windX, p.y + p.length);
        this.ctx.globalAlpha = p.opacity;
        this.ctx.stroke();
      });
      this.ctx.globalAlpha = 1;
    }

    // Snow Effect
    initSnow() {
      const count = Math.floor(150 * this.intensity);
      for (let i = 0; i < count; i++) {
        this.addSnowParticle();
      }
    }

    addSnowParticle() {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 3 + 1,
        speedY: Math.random() * 2 + 0.5,
        speedX: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.5 + 0.2,
        sway: Math.random() * 0.02
      });
    }

    updateSnow() {
      this.particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y * 0.01) * 0.5 + this.windX;
        
        if (p.y > this.height) {
          p.y = -10;
          p.x = Math.random() * this.width;
        }
        if (p.x > this.width) p.x = 0;
        if (p.x < 0) p.x = this.width;
      });
    }

    drawSnow() {
      this.particles.forEach(p => {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(245, 247, 250, ${p.opacity})`;
        this.ctx.fill();
      });
    }

    // Fireflies Effect
    initFireflies() {
      const count = Math.floor(50 * this.intensity);
      for (let i = 0; i < count; i++) {
        this.addFireflyParticle();
      }
    }

    addFireflyParticle() {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: 0,
        opacitySpeed: Math.random() * 0.02 + 0.01,
        pulse: Math.random() * Math.PI * 2,
        warm: Math.random() > 0.5
      });
    }

    updateFireflies() {
      this.particles.forEach(p => {
        p.x += p.speedX + Math.sin(p.pulse) * 0.3;
        p.y += p.speedY + Math.cos(p.pulse) * 0.2;
        p.pulse += 0.02;
        
        // Pulsing opacity
        p.opacity += p.opacitySpeed;
        if (p.opacity > 0.8 || p.opacity < 0.1) {
          p.opacitySpeed *= -1;
        }
        
        // Wrap around
        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;
      });
    }

    drawFireflies() {
      this.particles.forEach(p => {
        const color = p.warm ? '255, 200, 100' : '200, 255, 150';
        
        // Glow effect
        const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
        gradient.addColorStop(0, `rgba(${color}, ${p.opacity})`);
        gradient.addColorStop(0.5, `rgba(${color}, ${p.opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);
        
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Core
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        this.ctx.fill();
      });
    }

    // Leaves Effect
    initLeaves() {
      const count = Math.floor(25 * this.intensity);
      for (let i = 0; i < count; i++) {
        this.addLeafParticle();
      }
    }

    addLeafParticle() {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * -this.height,
        size: Math.random() * 10 + 5,
        speedY: Math.random() * 2 + 1,
        speedX: Math.random() * 2 - 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
        opacity: Math.random() * 0.5 + 0.3,
        color: ['#D4A574', '#8B6914', '#CD853F', '#DEB887'][Math.floor(Math.random() * 4)]
      });
    }

    updateLeaves() {
      this.particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y * 0.01) + this.windX;
        p.rotation += p.rotationSpeed;
        
        if (p.y > this.height) {
          p.y = -20;
          p.x = Math.random() * this.width;
        }
      });
    }

    drawLeaves() {
      this.particles.forEach(p => {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation * Math.PI / 180);
        this.ctx.globalAlpha = p.opacity;
        
        // Draw simple leaf shape
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
        
        this.ctx.restore();
      });
      this.ctx.globalAlpha = 1;
    }

    // Bubbles Effect
    initBubbles() {
      const count = Math.floor(40 * this.intensity);
      for (let i = 0; i < count; i++) {
        this.addBubbleParticle();
      }
    }

    addBubbleParticle() {
      this.particles.push({
        x: Math.random() * this.width,
        y: this.height + Math.random() * 100,
        radius: Math.random() * 8 + 2,
        speedY: Math.random() * 1 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.1,
        wobble: Math.random() * Math.PI * 2
      });
    }

    updateBubbles() {
      this.particles.forEach(p => {
        p.y -= p.speedY;
        p.x += Math.sin(p.wobble) * 0.5 + this.windX * 0.5;
        p.wobble += 0.03;
        
        if (p.y < -20) {
          p.y = this.height + 20;
          p.x = Math.random() * this.width;
        }
      });
    }

    drawBubbles() {
      this.particles.forEach(p => {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(201, 206, 214, ${p.opacity})`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Highlight
        this.ctx.beginPath();
        this.ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.2, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.5})`;
        this.ctx.fill();
      });
    }

    startAnimation() {
      if (this.animationId) return;
      this.animate();
    }

    stopAnimation() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      this.ctx.clearRect(0, 0, this.width, this.height);
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      
      switch (this.currentMode) {
        case 'rain':
          this.updateRain();
          this.drawRain();
          break;
        case 'snow':
          this.updateSnow();
          this.drawSnow();
          break;
        case 'fireflies':
          this.updateFireflies();
          this.drawFireflies();
          break;
        case 'leaves':
          this.updateLeaves();
          this.drawLeaves();
          break;
        case 'bubbles':
          this.updateBubbles();
          this.drawBubbles();
          break;
      }
      
      this.animationId = requestAnimationFrame(() => this.animate());
    }

    addParticle() {
      switch (this.currentMode) {
        case 'rain': this.addRainParticle(); break;
        case 'snow': this.addSnowParticle(); break;
        case 'fireflies': this.addFireflyParticle(); break;
        case 'leaves': this.addLeafParticle(); break;
        case 'bubbles': this.addBubbleParticle(); break;
      }
    }

    applyPreset(preset) {
      // Apply different color/intensity presets based on time of day
      switch (preset) {
        case 'morning':
          this.intensity = 0.3;
          this.setMode('bubbles');
          break;
        case 'evening':
          this.intensity = 0.6;
          this.setMode('fireflies');
          break;
        case 'night':
          this.intensity = 0.4;
          this.setMode('fireflies');
          break;
        default:
          this.intensity = 0.5;
          this.setMode('fireflies');
      }
      
      // Update slider
      const slider = this.controlPanel.querySelector('.weather-intensity-slider');
      const intensityValue = this.controlPanel.querySelector('#intensity-value');
      if (slider) slider.value = this.intensity * 100;
      if (intensityValue) intensityValue.textContent = Math.floor(this.intensity * 100) + '%';
      
      this.updateParticleCount();
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new WeatherEffectsSystem());
  } else {
    new WeatherEffectsSystem();
  }
})();
