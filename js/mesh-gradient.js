/**
 * Animated Mesh Gradient Background
 * Canvas-based flowing gradient animation
 */

(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (prefersReducedMotion || isMobile) {
    // Fall back to CSS-only aurora effect
    document.body.classList.add('mesh-gradient-fallback');
    return;
  }

  class MeshGradient {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.animationId = null;
      this.isVisible = true;
      
      // Gradient blobs
      this.blobs = [
        { x: 0.3, y: 0.3, r: 0.4, color: [248, 199, 77], speed: 0.0003, phase: 0 },
        { x: 0.7, y: 0.6, r: 0.35, color: [201, 206, 214], speed: 0.0004, phase: 2 },
        { x: 0.5, y: 0.8, r: 0.3, color: [248, 199, 77], speed: 0.00035, phase: 4 },
        { x: 0.2, y: 0.7, r: 0.25, color: [180, 180, 190], speed: 0.0005, phase: 1 },
        { x: 0.8, y: 0.2, r: 0.3, color: [248, 199, 77], speed: 0.00045, phase: 3 }
      ];
      
      this.time = 0;
      this.pixelRatio = Math.min(window.devicePixelRatio, 2);
      
      this.init();
    }

    init() {
      this.resize();
      this.setupEventListeners();
      this.start();
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * this.pixelRatio;
      this.canvas.height = this.height * this.pixelRatio;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.scale(this.pixelRatio, this.pixelRatio);
    }

    setupEventListeners() {
      window.addEventListener('resize', () => {
        this.resize();
      }, { passive: true });

      // Pause when tab is hidden
      document.addEventListener('visibilitychange', () => {
        this.isVisible = document.visibilityState === 'visible';
        if (this.isVisible) {
          this.start();
        } else {
          this.stop();
        }
      });
    }

    createGradientBlob(blob) {
      const centerX = blob.x * this.width;
      const centerY = blob.y * this.height;
      const radius = blob.r * Math.min(this.width, this.height);
      
      const gradient = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      
      const [r, g, b] = blob.color;
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`);
      gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.05)`);
      gradient.addColorStop(1, 'transparent');
      
      return gradient;
    }

    updateBlobs() {
      this.time += 16; // Approximate ms per frame
      
      this.blobs.forEach(blob => {
        // Animate position with sine waves
        const offsetX = Math.sin(this.time * blob.speed + blob.phase) * 0.15;
        const offsetY = Math.cos(this.time * blob.speed * 0.8 + blob.phase) * 0.1;
        
        blob.currentX = blob.x + offsetX;
        blob.currentY = blob.y + offsetY;
        
        // Wrap around
        if (blob.currentX < -0.2) blob.currentX = 1.2;
        if (blob.currentX > 1.2) blob.currentX = -0.2;
        if (blob.currentY < -0.2) blob.currentY = 1.2;
        if (blob.currentY > 1.2) blob.currentY = -0.2;
      });
    }

    draw() {
      // Clear with dark background
      this.ctx.fillStyle = '#0f0f12';
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      // Use additive blending for glow effect
      this.ctx.globalCompositeOperation = 'screen';
      
      // Draw each blob
      this.blobs.forEach(blob => {
        const centerX = blob.currentX * this.width;
        const centerY = blob.currentY * this.height;
        const radius = blob.r * Math.min(this.width, this.height);
        
        const gradient = this.ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, radius
        );
        
        const [r, g, b] = blob.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.12)`);
        gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, 0.04)`);
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
      });
      
      // Reset composite operation
      this.ctx.globalCompositeOperation = 'source-over';
    }

    animate() {
      if (!this.isVisible) return;
      
      this.updateBlobs();
      this.draw();
      
      this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
      if (this.animationId) return;
      this.animate();
    }

    stop() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
  }

  // Initialize
  function init() {
    const container = document.createElement('div');
    container.className = 'mesh-gradient-canvas';
    
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    document.body.insertBefore(container, document.body.firstChild);
    
    new MeshGradient(canvas);
    
    // Add noise overlay
    const noiseOverlay = document.createElement('div');
    noiseOverlay.className = 'mesh-noise-overlay';
    document.body.appendChild(noiseOverlay);
    
    // Add aurora background
    const auroraBg = document.createElement('div');
    auroraBg.className = 'aurora-bg';
    auroraBg.innerHTML = `
      <div class="aurora-layer"></div>
      <div class="aurora-layer"></div>
      <div class="aurora-layer"></div>
    `;
    document.body.insertBefore(auroraBg, document.body.firstChild);
    
    console.log('🎨 Mesh Gradient Background initialized');
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
