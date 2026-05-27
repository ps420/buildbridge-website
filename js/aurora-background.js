/**
 * Aurora Background Effect v20.0
 * Canvas-based animated gradient system
 * Creates flowing, organic aurora-like color movements
 */

class AuroraBackground {
  constructor(options = {}) {
    this.container = options.container || document.querySelector('.aurora-background');
    if (!this.container) return;
    
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.isActive = true;
    
    // Configuration
    this.config = {
      colors: options.colors || [
        { r: 42, g: 45, b: 52 },      // gun metal
        { r: 82, g: 88, b: 98 },      // slate
        { r: 201, g: 206, b: 214 },   // chrome
        { r: 26, g: 26, b: 34 },      // dark night
        { r: 15, g: 15, b: 22 }       // near black
      ],
      blobCount: options.blobCount || 5,
      speed: options.speed || 0.3,
      blur: options.blur || 80,
      opacity: options.opacity || 0.6,
      interactive: options.interactive !== false
    };
    
    this.blobs = [];
    this.mouse = { x: 0.5, y: 0.5, active: false };
    this.time = 0;
    
    this.init();
  }
  
  init() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.showFallback();
      return;
    }
    
    // Check for mobile/touch - use fallback
    if (window.matchMedia('(pointer: coarse)').matches) {
      this.showFallback();
      return;
    }
    
    this.createCanvas();
    this.createBlobs();
    this.bindEvents();
    this.animate();
    
    // Visibility API for performance
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden;
      if (this.isActive && !this.animationId) {
        this.animate();
      }
    });
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'aurora-canvas';
    this.ctx = this.canvas.getContext('2d');
    
    // Set canvas size
    this.resize();
    
    this.container.appendChild(this.canvas);
    
    // Handle resize
    window.addEventListener('resize', () => this.resize(), { passive: true });
  }
  
  resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.scale(dpr, dpr);
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }
  
  createBlobs() {
    for (let i = 0; i < this.config.blobCount; i++) {
      this.blobs.push({
        x: Math.random(),
        y: Math.random(),
        radius: 0.2 + Math.random() * 0.3,
        color: this.config.colors[i % this.config.colors.length],
        speedX: (Math.random() - 0.5) * 0.001,
        speedY: (Math.random() - 0.5) * 0.001,
        phase: Math.random() * Math.PI * 2,
        amplitude: 0.1 + Math.random() * 0.2
      });
    }
  }
  
  bindEvents() {
    if (!this.config.interactive) return;
    
    let mouseTimeout;
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX / this.width;
      this.mouse.y = e.clientY / this.height;
      this.mouse.active = true;
      
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        this.mouse.active = false;
      }, 100);
    }, { passive: true });
  }
  
  animate() {
    if (!this.isActive) {
      this.animationId = null;
      return;
    }
    
    this.time += 0.01 * this.config.speed;
    
    // Clear with fade effect for trails
    this.ctx.fillStyle = 'rgba(15, 15, 16, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw blobs
    this.blobs.forEach((blob, index) => {
      this.drawBlob(blob, index);
    });
    
    // Add blur effect
    this.ctx.filter = `blur(${this.config.blur}px)`;
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  drawBlob(blob, index) {
    // Calculate position with organic movement
    const baseX = blob.x + Math.sin(this.time + blob.phase) * blob.amplitude;
    const baseY = blob.y + Math.cos(this.time + blob.phase * 0.7) * blob.amplitude;
    
    // Mouse influence
    let targetX = baseX;
    let targetY = baseY;
    
    if (this.mouse.active) {
      const influence = 0.1;
      targetX += (this.mouse.x - 0.5) * influence;
      targetY += (this.mouse.y - 0.5) * influence;
    }
    
    // Keep within bounds
    targetX = Math.max(0.1, Math.min(0.9, targetX));
    targetY = Math.max(0.1, Math.min(0.9, targetY));
    
    const x = targetX * this.width;
    const y = targetY * this.height;
    const radius = blob.radius * Math.min(this.width, this.height);
    
    // Create radial gradient
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    
    const color = blob.color;
    const opacity = this.config.opacity;
    
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
    gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.5})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  showFallback() {
    // Show CSS-based fallback
    const fallback = document.createElement('div');
    fallback.className = 'aurora-fallback';
    this.container.appendChild(fallback);
  }
  
  destroy() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.auroraBackground = new AuroraBackground();
  });
} else {
  window.auroraBackground = new AuroraBackground();
}
