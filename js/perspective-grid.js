/**
 * BuildBridge Perspective Grid Background v1.0
 * Fortune 500 3D Grid Experience
 * Creates a perspective grid that follows cursor movement
 * =====================================================
 */

class PerspectiveGrid {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;
    
    if (!this.container) return;
    
    // Skip on mobile
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.options = {
      gridSize: options.gridSize || 40,
      lineColor: options.lineColor || 'rgba(201, 206, 214, 0.05)',
      highlightColor: options.highlightColor || 'rgba(201, 206, 214, 0.15)',
      perspective: options.perspective || 1000,
      depth: options.depth || 800,
      mouseInfluence: options.mouseInfluence || 0.1,
      waveEffect: options.waveEffect !== false,
      waveSpeed: options.waveSpeed || 0.002,
      waveAmplitude: options.waveAmplitude || 10,
      ...options
    };
    
    this.state = {
      mouseX: 0,
      mouseY: 0,
      targetRotationX: 0,
      targetRotationY: 0,
      currentRotationX: 0,
      currentRotationY: 0,
      wavePhase: 0,
      isActive: true,
      rafId: null
    };
    
    this.elements = {};
    
    this.init();
  }
  
  init() {
    this.createGrid();
    this.bindEvents();
    this.animate();
  }
  
  createGrid() {
    // Create grid container
    this.elements.wrapper = document.createElement('div');
    this.elements.wrapper.className = 'perspective-grid-wrapper';
    
    // Create grid plane
    this.elements.grid = document.createElement('div');
    this.elements.grid.className = 'perspective-grid-plane';
    
    // Create lines
    const gridSize = this.options.gridSize;
    const linesH = [];
    const linesV = [];
    
    // Horizontal lines
    for (let i = 0; i <= 20; i++) {
      const line = document.createElement('div');
      line.className = 'grid-line grid-line-h';
      line.style.top = `${i * 5}%`;
      line.dataset.index = i;
      this.elements.grid.appendChild(line);
      linesH.push(line);
    }
    
    // Vertical lines
    for (let i = 0; i <= 20; i++) {
      const line = document.createElement('div');
      line.className = 'grid-line grid-line-v';
      line.style.left = `${i * 5}%`;
      line.dataset.index = i;
      this.elements.grid.appendChild(line);
      linesV.push(line);
    }
    
    this.elements.linesH = linesH;
    this.elements.linesV = linesV;
    
    // Add to container
    this.elements.wrapper.appendChild(this.elements.grid);
    this.container.appendChild(this.elements.wrapper);
    
    // Add CSS
    this.addStyles();
  }
  
  addStyles() {
    if (document.getElementById('perspective-grid-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'perspective-grid-styles';
    styles.textContent = `
      .perspective-grid-wrapper {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
        perspective: ${this.options.perspective}px;
        perspective-origin: 50% 50%;
      }
      
      .perspective-grid-plane {
        position: absolute;
        inset: -50%;
        width: 200%;
        height: 200%;
        transform-style: preserve-3d;
        transform: rotateX(60deg) translateZ(-200px);
        transition: transform 0.1s ease-out;
      }
      
      .grid-line {
        position: absolute;
        background: ${this.options.lineColor};
        transition: all 0.3s ease;
      }
      
      .grid-line-h {
        left: 0;
        right: 0;
        height: 1px;
        transform-origin: left center;
      }
      
      .grid-line-v {
        top: 0;
        bottom: 0;
        width: 1px;
        transform-origin: center top;
      }
      
      .grid-line.highlight {
        background: ${this.options.highlightColor};
        box-shadow: 0 0 10px ${this.options.highlightColor};
      }
      
      /* Wave animation */
      .perspective-grid-plane.wave-active .grid-line-h {
        animation: grid-wave-h 3s ease-in-out infinite;
      }
      
      .perspective-grid-plane.wave-active .grid-line-v {
        animation: grid-wave-v 3s ease-in-out infinite;
      }
      
      @keyframes grid-wave-h {
        0%, 100% { transform: translateZ(0); }
        50% { transform: translateZ(20px); }
      }
      
      @keyframes grid-wave-v {
        0%, 100% { transform: translateZ(0); }
        50% { transform: translateZ(20px); }
      }
      
      /* Staggered animation delays */
      .perspective-grid-plane.wave-active .grid-line-h:nth-child(1) { animation-delay: 0s; }
      .perspective-grid-plane.wave-active .grid-line-h:nth-child(2) { animation-delay: 0.1s; }
      .perspective-grid-plane.wave-active .grid-line-h:nth-child(3) { animation-delay: 0.2s; }
      .perspective-grid-plane.wave-active .grid-line-h:nth-child(4) { animation-delay: 0.3s; }
      .perspective-grid-plane.wave-active .grid-line-h:nth-child(5) { animation-delay: 0.4s; }
      .perspective-grid-plane.wave-active .grid-line-h:nth-child(6) { animation-delay: 0.5s; }
      .perspective-grid-plane.wave-active .grid-line-h:nth-child(7) { animation-delay: 0.6s; }
      .perspective-grid-plane.wave-active .grid-line-h:nth-child(8) { animation-delay: 0.7s; }
      .perspective-grid-plane.wave-active .grid-line-h:nth-child(9) { animation-delay: 0.8s; }
      .perspective-grid-plane.wave-active .grid-line-h:nth-child(10) { animation-delay: 0.9s; }
      
      .perspective-grid-plane.wave-active .grid-line-v:nth-child(11) { animation-delay: 0s; }
      .perspective-grid-plane.wave-active .grid-line-v:nth-child(12) { animation-delay: 0.1s; }
      .perspective-grid-plane.wave-active .grid-line-v:nth-child(13) { animation-delay: 0.2s; }
      .perspective-grid-plane.wave-active .grid-line-v:nth-child(14) { animation-delay: 0.3s; }
      .perspective-grid-plane.wave-active .grid-line-v:nth-child(15) { animation-delay: 0.4s; }
      .perspective-grid-plane.wave-active .grid-line-v:nth-child(16) { animation-delay: 0.5s; }
      .perspective-grid-plane.wave-active .grid-line-v:nth-child(17) { animation-delay: 0.6s; }
      .perspective-grid-plane.wave-active .grid-line-v:nth-child(18) { animation-delay: 0.7s; }
      .perspective-grid-plane.wave-active .grid-line-v:nth-child(19) { animation-delay: 0.8s; }
      .perspective-grid-plane.wave-active .grid-line-v:nth-child(20) { animation-delay: 0.9s; }
      
      /* Fade mesh at edges */
      .perspective-grid-wrapper::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(
          ellipse at 50% 50%,
          transparent 0%,
          transparent 30%,
          rgba(15, 15, 16, 0.8) 70%,
          rgba(15, 15, 16, 1) 100%
        );
        pointer-events: none;
      }
      
      /* Reduce motion */
      @media (prefers-reduced-motion: reduce) {
        .perspective-grid-plane {
          animation: none !important;
        }
        .grid-line {
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(styles);
  }
  
  bindEvents() {
    // Mouse movement
    document.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      
      // Normalize mouse position (-1 to 1)
      this.state.mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      this.state.mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      
      // Calculate target rotation based on mouse
      this.state.targetRotationY = this.state.mouseX * 5; // Max 5 degrees
      this.state.targetRotationX = 60 - this.state.mouseY * 5; // Base 60deg + offset
    });
    
    // Visibility
    document.addEventListener('visibilitychange', () => {
      this.state.isActive = document.visibilityState === 'visible';
    });
  }
  
  animate() {
    if (!this.state.isActive) {
      this.state.rafId = requestAnimationFrame(() => this.animate());
      return;
    }
    
    // Smooth interpolation
    const lerp = (start, end, factor) => start + (end - start) * factor;
    
    this.state.currentRotationX = lerp(
      this.state.currentRotationX,
      this.state.targetRotationX,
      0.05
    );
    
    this.state.currentRotationY = lerp(
      this.state.currentRotationY,
      this.state.targetRotationY,
      0.05
    );
    
    // Apply transform
    if (this.elements.grid) {
      this.elements.grid.style.transform = `
        rotateX(${this.state.currentRotationX}deg) 
        rotateY(${this.state.currentRotationY}deg) 
        translateZ(-200px)
      `;
    }
    
    // Update perspective origin
    const originX = 50 + this.state.mouseX * 20;
    const originY = 50 + this.state.mouseY * 20;
    this.elements.wrapper.style.perspectiveOrigin = `${originX}% ${originY}%`;
    
    // Highlight lines near cursor
    this.highlightNearestLines();
    
    this.state.rafId = requestAnimationFrame(() => this.animate());
  }
  
  highlightNearestLines() {
    const gridX = (this.state.mouseX + 1) / 2; // 0 to 1
    const gridY = (this.state.mouseY + 1) / 2; // 0 to 1
    
    const nearestH = Math.round(gridY * 20);
    const nearestV = Math.round(gridX * 20);
    
    this.elements.linesH.forEach((line, i) => {
      const distance = Math.abs(i - nearestH);
      if (distance < 3) {
        line.classList.add('highlight');
        line.style.opacity = 1 - distance * 0.3;
      } else {
        line.classList.remove('highlight');
        line.style.opacity = '';
      }
    });
    
    this.elements.linesV.forEach((line, i) => {
      const distance = Math.abs(i - nearestV);
      if (distance < 3) {
        line.classList.add('highlight');
        line.style.opacity = 1 - distance * 0.3;
      } else {
        line.classList.remove('highlight');
        line.style.opacity = '';
      }
    });
  }
  
  // Enable wave effect
  enableWave() {
    if (this.elements.grid) {
      this.elements.grid.classList.add('wave-active');
    }
  }
  
  // Disable wave effect
  disableWave() {
    if (this.elements.grid) {
      this.elements.grid.classList.remove('wave-active');
    }
  }
  
  // Set line color
  setLineColor(color) {
    this.options.lineColor = color;
    this.elements.linesH.forEach(line => line.style.background = color);
    this.elements.linesV.forEach(line => line.style.background = color);
  }
  
  // Destroy
  destroy() {
    cancelAnimationFrame(this.state.rafId);
    if (this.elements.wrapper) {
      this.elements.wrapper.remove();
    }
  }
}

// =========================================
// INITIALIZE
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize on body as default background
  new PerspectiveGrid(document.body, {
    gridSize: 50,
    lineColor: 'rgba(201, 206, 214, 0.03)',
    highlightColor: 'rgba(201, 206, 214, 0.1)',
    mouseInfluence: 0.1
  });
  
  // Initialize on specific sections
  document.querySelectorAll('[data-perspective-grid]').forEach(section => {
    const grid = new PerspectiveGrid(section, {
      gridSize: parseInt(section.dataset.gridSize) || 40,
      waveEffect: section.dataset.wave !== 'false'
    });
    
    if (section.dataset.wave === 'true') {
      grid.enableWave();
    }
  });
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerspectiveGrid };
}
