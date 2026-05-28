/**
 * Morphing Blob Background
 * Organic Animated SVG Shapes
 * Fortune 500 Visual Experience
 * Version: v53.2
 */

class MorphingBlobBackground {
  constructor(options = {}) {
    this.container = null;
    this.svg = null;
    this.blobs = [];
    this.filters = [];
    this.animationFrame = null;
    this.isActive = true;
    this.time = 0;
    
    // Configuration
    this.config = {
      blobCount: options.blobCount || 4,
      colors: options.colors || [
        { r: 201, g: 206, b: 214 },  // Slate
        { r: 245, g: 247, b: 250 },  // Chrome
        { r: 201, g: 206, b: 214 },  // Slate light
        { r: 180, g: 185, b: 195 }   // Slate dark
      ],
      opacity: options.opacity || { min: 0.03, max: 0.08 },
      size: options.size || { min: 300, max: 600 },
      speed: options.speed || { min: 0.0003, max: 0.0008 },
      blur: options.blur || { min: 40, max: 80 },
      interactive: options.interactive !== false,
      mouseInfluence: options.mouseInfluence || 0.1,
      complexity: options.complexity || { points: 6, variance: 30 }
    };
    
    this.mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
    
    this.init();
  }
  
  init() {
    this.createContainer();
    this.createSVG();
    this.createFilters();
    this.createBlobs();
    this.bindEvents();
    this.animate();
  }
  
  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'morphing-blobs-bg';
    this.container.setAttribute('aria-hidden', 'true');
    
    // Insert before first child or append to body
    const body = document.body;
    if (body.firstChild) {
      body.insertBefore(this.container, body.firstChild);
    } else {
      body.appendChild(this.container);
    }
  }
  
  createSVG() {
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('class', 'morphing-blobs-svg');
    this.svg.setAttribute('viewBox', '0 0 1000 1000');
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    this.svg.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    
    // Create defs for filters
    this.defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    this.svg.appendChild(this.defs);
    
    this.container.appendChild(this.svg);
  }
  
  createFilters() {
    // Create blob filter with turbulence and displacement
    for (let i = 0; i < this.config.blobCount; i++) {
      const filterId = `blob-filter-${i}`;
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.setAttribute('id', filterId);
      filter.setAttribute('x', '-50%');
      filter.setAttribute('y', '-50%');
      filter.setAttribute('width', '200%');
      filter.setAttribute('height', '200%');
      
      // Turbulence for organic shape
      const turbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
      turbulence.setAttribute('type', 'fractalNoise');
      turbulence.setAttribute('baseFrequency', '0.01');
      turbulence.setAttribute('numOctaves', '3');
      turbulence.setAttribute('result', 'noise');
      
      // Displacement map
      const displacement = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
      displacement.setAttribute('in', 'SourceGraphic');
      displacement.setAttribute('in2', 'noise');
      displacement.setAttribute('scale', '100');
      displacement.setAttribute('xChannelSelector', 'R');
      displacement.setAttribute('yChannelSelector', 'G');
      
      // Gaussian blur
      const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      blur.setAttribute('stdDeviation', String(this.config.blur.min + (this.config.blur.max - this.config.blur.min) * (i / this.config.blobCount)));
      
      filter.appendChild(turbulence);
      filter.appendChild(displacement);
      filter.appendChild(blur);
      
      this.defs.appendChild(filter);
      this.filters.push({ filter, turbulence, displacement, blur });
    }
    
    // Create gradient definitions
    this.config.colors.forEach((color, i) => {
      const gradientId = `blob-gradient-${i}`;
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
      gradient.setAttribute('id', gradientId);
      gradient.setAttribute('cx', '50%');
      gradient.setAttribute('cy', '50%');
      gradient.setAttribute('r', '50%');
      
      const opacity = this.config.opacity.min + (this.config.opacity.max - this.config.opacity.min) * (1 - i / this.config.colors.length);
      
      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
      
      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      
      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      this.defs.appendChild(gradient);
    });
  }
  
  createBlobs() {
    for (let i = 0; i < this.config.blobCount; i++) {
      const blob = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      const size = this.config.size.min + Math.random() * (this.config.size.max - this.config.size.min);
      const speed = this.config.speed.min + Math.random() * (this.config.speed.max - this.config.speed.min);
      const phase = Math.random() * Math.PI * 2;
      
      const blobData = {
        element: blob,
        x: 100 + Math.random() * 800,
        y: 100 + Math.random() * 800,
        size: size,
        baseSize: size,
        speed: speed,
        phase: phase,
        colorIndex: i % this.config.colors.length,
        points: [],
        targetPoints: [],
        velocity: { x: 0, y: 0 }
      };
      
      // Generate initial blob shape points
      const numPoints = this.config.complexity.points;
      for (let j = 0; j < numPoints; j++) {
        const angle = (j / numPoints) * Math.PI * 2;
        const variance = this.config.complexity.variance;
        blobData.points.push({
          angle: angle,
          radius: 1 + (Math.random() - 0.5) * (variance / 100)
        });
        blobData.targetPoints.push({
          angle: angle,
          radius: 1 + (Math.random() - 0.5) * (variance / 100)
        });
      }
      
      blob.setAttribute('fill', `url(#blob-gradient-${blobData.colorIndex})`);
      blob.setAttribute('filter', `url(#blob-filter-${i})`);
      
      this.svg.appendChild(blob);
      this.blobs.push(blobData);
    }
  }
  
  generateBlobPath(blob) {
    const points = blob.points;
    const numPoints = points.length;
    const commands = [];
    
    for (let i = 0; i < numPoints; i++) {
      const point = points[i];
      const nextPoint = points[(i + 1) % numPoints];
      
      const x = blob.x + Math.cos(point.angle) * (blob.size * point.radius);
      const y = blob.y + Math.sin(point.angle) * (blob.size * point.radius);
      
      const nextX = blob.x + Math.cos(nextPoint.angle) * (blob.size * nextPoint.radius);
      const nextY = blob.y + Math.sin(nextPoint.angle) * (blob.size * nextPoint.radius);
      
      // Calculate control point for smooth curve
      const cpX = (x + nextX) / 2;
      const cpY = (y + nextY) / 2;
      
      if (i === 0) {
        commands.push(`M ${x} ${y}`);
      }
      
      commands.push(`Q ${x} ${y} ${cpX} ${cpY}`);
    }
    
    commands.push('Z');
    return commands.join(' ');
  }
  
  bindEvents() {
    if (this.config.interactive) {
      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = e.clientX / window.innerWidth;
        this.mouse.targetY = e.clientY / window.innerHeight;
      }, { passive: true });
    }
    
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));
    
    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      this.isActive = document.visibilityState === 'visible';
      if (this.isActive && !this.animationFrame) {
        this.animate();
      }
    });
  }
  
  handleResize() {
    // Adjust blob positions based on new viewport
    this.blobs.forEach(blob => {
      blob.x = 100 + Math.random() * 800;
      blob.y = 100 + Math.random() * 800;
    });
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  updateBlobs() {
    this.time += 1;
    
    // Smooth mouse following
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;
    
    this.blobs.forEach((blob, i) => {
      // Update turbulence frequency for organic movement
      const filter = this.filters[i];
      if (filter) {
        const freq = 0.008 + Math.sin(this.time * blob.speed + blob.phase) * 0.004;
        filter.turbulence.setAttribute('baseFrequency', String(freq));
        
        const scale = 50 + Math.sin(this.time * blob.speed * 2 + blob.phase) * 30;
        filter.displacement.setAttribute('scale', String(scale));
      }
      
      // Animate blob points for morphing effect
      blob.points.forEach((point, j) => {
        const target = blob.targetPoints[j];
        
        // Slowly morph towards target
        point.radius += (target.radius - point.radius) * 0.02;
        
        // Occasionally set new target
        if (Math.random() < 0.001) {
          target.radius = 0.7 + Math.random() * 0.6;
        }
        
        // Add time-based variation
        const timeOffset = this.time * blob.speed + j * 0.5;
        point.radius += Math.sin(timeOffset) * 0.002;
        point.radius = Math.max(0.5, Math.min(1.5, point.radius));
      });
      
      // Update position with gentle floating
      const floatX = Math.sin(this.time * blob.speed + blob.phase) * 30;
      const floatY = Math.cos(this.time * blob.speed * 0.7 + blob.phase) * 30;
      
      // Mouse influence
      const mouseOffsetX = (this.mouse.x - 0.5) * 100 * this.config.mouseInfluence * (i + 1);
      const mouseOffsetY = (this.mouse.y - 0.5) * 100 * this.config.mouseInfluence * (i + 1);
      
      // Apply position
      const currentX = blob.x + floatX + mouseOffsetX;
      const currentY = blob.y + floatY + mouseOffsetY;
      
      // Subtle size pulsing
      const sizePulse = 1 + Math.sin(this.time * blob.speed * 0.5) * 0.1;
      blob.size = blob.baseSize * sizePulse;
      
      // Generate path
      const path = this.generateBlobPath({
        ...blob,
        x: currentX,
        y: currentY
      });
      
      blob.element.setAttribute('d', path);
    });
  }
  
  animate() {
    if (!this.isActive) {
      this.animationFrame = null;
      return;
    }
    
    this.updateBlobs();
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }
  
  // Public API
  setColors(colors) {
    this.config.colors = colors;
    // Regenerate gradients
    this.defs.innerHTML = '';
    this.createFilters();
  }
  
  setSpeed(speed) {
    this.blobs.forEach(blob => {
      blob.speed = speed;
    });
  }
  
  pause() {
    this.isActive = false;
  }
  
  resume() {
    this.isActive = true;
    if (!this.animationFrame) {
      this.animate();
    }
  }
  
  destroy() {
    this.isActive = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.container) {
      this.container.remove();
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.morphingBlobs = new MorphingBlobBackground();
  });
} else {
  window.morphingBlobs = new MorphingBlobBackground();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MorphingBlobBackground;
}
