/**
 * BuildBridge 3D Tilt Cards v3.0
 * Fortune 500 Interactive Card System with Spotlight Effect
 * Advanced 3D transforms with glare and depth layers
 * =====================================================
 */

class TiltCardV3 {
  constructor(element, options = {}) {
    this.element = typeof element === 'string' 
      ? document.querySelector(element) 
      : element;
    
    if (!this.element) return;
    
    // Skip on mobile
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    this.options = {
      maxTilt: options.maxTilt || 15,
      perspective: options.perspective || 1000,
      scale: options.scale || 1.02,
      speed: options.speed || 400,
      glare: options.glare !== false,
      glareOpacity: options.glareOpacity || 0.4,
      spotLight: options.spotLight !== false,
      floatingElements: options.floatingElements !== false,
      magneticPull: options.magneticPull !== false,
      gyroscope: options.gyroscope === true,
      ...options
    };
    
    this.state = {
      isHovering: false,
      mouseX: 0,
      mouseY: 0,
      tiltX: 0,
      tiltY: 0,
      glareX: 50,
      glareY: 50,
      rafId: null
    };
    
    this.elements = {};
    this.floatingItems = [];
    
    this.init();
  }
  
  init() {
    this.wrapContent();
    this.createGlare();
    this.createSpotlight();
    this.createFloatingElements();
    this.bindEvents();
    this.addParallaxLayers();
  }
  
  wrapContent() {
    // Wrap inner content to preserve structure
    const content = this.element.innerHTML;
    this.element.innerHTML = '';
    
    this.elements.tiltContainer = document.createElement('div');
    this.elements.tiltContainer.className = 'tilt-container-v3';
    this.element.appendChild(this.elements.tiltContainer);
    
    this.elements.contentWrapper = document.createElement('div');
    this.elements.contentWrapper.className = 'tilt-content-wrapper';
    this.elements.contentWrapper.innerHTML = content;
    this.elements.tiltContainer.appendChild(this.elements.contentWrapper);
    
    // Set base styles
    this.element.style.perspective = `${this.options.perspective}px`;
    this.element.style.transformStyle = 'preserve-3d';
  }
  
  createGlare() {
    if (!this.options.glare) return;
    
    this.elements.glare = document.createElement('div');
    this.elements.glare.className = 'tilt-glare';
    this.elements.tiltContainer.appendChild(this.elements.glare);
  }
  
  createSpotlight() {
    if (!this.options.spotLight) return;
    
    this.elements.spotlight = document.createElement('div');
    this.elements.spotlight.className = 'tilt-spotlight';
    this.elements.tiltContainer.appendChild(this.elements.spotlight);
  }
  
  createFloatingElements() {
    if (!this.options.floatingElements) return;
    
    // Create decorative floating elements
    const positions = [
      { top: '10%', left: '10%', delay: '0s', size: '20px' },
      { top: '20%', right: '15%', delay: '0.5s', size: '12px' },
      { bottom: '25%', left: '20%', delay: '1s', size: '16px' },
      { bottom: '15%', right: '10%', delay: '1.5s', size: '24px' }
    ];
    
    positions.forEach((pos, i) => {
      const float = document.createElement('div');
      float.className = 'tilt-float-element';
      float.style.cssText = `
        position: absolute;
        width: ${pos.size};
        height: ${pos.size};
        background: rgba(201, 206, 214, 0.1);
        border-radius: 50%;
        pointer-events: none;
        transition: transform 0.3s ease;
        animation: tilt-float 3s ease-in-out infinite;
        animation-delay: ${pos.delay};
      `;
      
      Object.entries(pos).forEach(([key, value]) => {
        if (key !== 'delay' && key !== 'size') {
          float.style[key] = value;
        }
      });
      
      this.elements.tiltContainer.appendChild(float);
      this.floatingItems.push({
        element: float,
        originalX: parseFloat(pos.left || pos.right) || 10,
        originalY: parseFloat(pos.top || pos.bottom) || 10,
        depth: (i + 1) * 20
      });
    });
  }
  
  addParallaxLayers() {
    // Find elements to add depth to
    const layers = this.elements.contentWrapper.querySelectorAll('h3, p, .icon, .btn');
    
    layers.forEach((layer, i) => {
      layer.classList.add('tilt-parallax-layer');
      layer.style.transformStyle = 'preserve-3d';
      layer.dataset.depth = (i % 3 + 1) * 10;
    });
  }
  
  bindEvents() {
    // Mouse enter
    this.element.addEventListener('mouseenter', () => {
      this.state.isHovering = true;
      this.element.classList.add('tilt-active');
      this.animate();
    });
    
    // Mouse move
    this.element.addEventListener('mousemove', (e) => {
      const rect = this.element.getBoundingClientRect();
      
      this.state.mouseX = (e.clientX - rect.left) / rect.width;
      this.state.mouseY = (e.clientY - rect.top) / rect.height;
      
      // Calculate tilt
      this.state.tiltX = (this.state.mouseY - 0.5) * -this.options.maxTilt * 2;
      this.state.tiltY = (this.state.mouseX - 0.5) * this.options.maxTilt * 2;
      
      // Calculate glare position
      this.state.glareX = this.state.mouseX * 100;
      this.state.glareY = this.state.mouseY * 100;
    });
    
    // Mouse leave
    this.element.addEventListener('mouseleave', () => {
      this.state.isHovering = false;
      this.element.classList.remove('tilt-active');
      
      // Reset on leave
      this.state.tiltX = 0;
      this.state.tiltY = 0;
      this.state.glareX = 50;
      this.state.glareY = 50;
    });
    
    // Gyroscope support
    if (this.options.gyroscope && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (this.state.isHovering) return;
        
        const tiltX = (e.beta / 90) * this.options.maxTilt;
        const tiltY = (e.gamma / 90) * this.options.maxTilt;
        
        this.state.tiltX = Math.max(-this.options.maxTilt, Math.min(tiltX, this.options.maxTilt));
        this.state.tiltY = Math.max(-this.options.maxTilt, Math.min(tiltY, this.options.maxTilt));
        
        this.animate();
      });
    }
  }
  
  animate() {
    if (!this.state.isHovering && Math.abs(this.state.tiltX) < 0.1 && Math.abs(this.state.tiltY) < 0.1) {
      // Reset complete
      this.elements.tiltContainer.style.transform = 'rotateX(0) rotateY(0) scale(1)';
      return;
    }
    
    // Apply tilt transform
    const scale = this.state.isHovering ? this.options.scale : 1;
    this.elements.tiltContainer.style.transform = `
      rotateX(${this.state.tiltX}deg) 
      rotateY(${this.state.tiltY}deg) 
      scale(${scale})
    `;
    
    // Apply glare
    if (this.elements.glare) {
      this.elements.glare.style.background = `
        radial-gradient(
          circle at ${this.state.glareX}% ${this.state.glareY}%,
          rgba(255, 255, 255, ${this.options.glareOpacity}) 0%,
          rgba(255, 255, 255, 0) 60%
        )
      `;
    }
    
    // Apply spotlight
    if (this.elements.spotlight) {
      this.elements.spotlight.style.background = `
        radial-gradient(
          circle at ${this.state.glareX}% ${this.state.glareY}%,
          rgba(201, 206, 214, 0.15) 0%,
          transparent 50%
        )
      `;
    }
    
    // Animate floating elements
    this.floatingItems.forEach(item => {
      const x = this.state.tiltY * item.depth * 0.5;
      const y = this.state.tiltX * item.depth * 0.5;
      item.element.style.transform = `translate(${x}px, ${y}px)`;
    });
    
    // Animate parallax layers
    const layers = this.elements.contentWrapper.querySelectorAll('.tilt-parallax-layer');
    layers.forEach(layer => {
      const depth = parseFloat(layer.dataset.depth) || 10;
      const x = this.state.tiltY * depth * 0.3;
      const y = this.state.tiltX * depth * 0.3;
      layer.style.transform = `translateZ(${depth}px) translate(${x}px, ${y}px)`;
    });
    
    // Continue animation
    if (this.state.isHovering || Math.abs(this.state.tiltX) > 0.1 || Math.abs(this.state.tiltY) > 0.1) {
      this.state.rafId = requestAnimationFrame(() => this.animate());
    }
  }
  
  destroy() {
    if (this.state.rafId) {
      cancelAnimationFrame(this.state.rafId);
    }
  }
}

// =========================================
// CSS STYLES
// =========================================
const tiltStyles = document.createElement('style');
tiltStyles.textContent = `
  .tilt-card-v3 {
    position: relative;
    transform-style: preserve-3d;
    cursor: pointer;
  }
  
  .tilt-container-v3 {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.1s ease-out;
    border-radius: 12px;
    overflow: hidden;
  }
  
  .tilt-card-v3.tilt-active .tilt-container-v3 {
    transition: none;
  }
  
  .tilt-content-wrapper {
    position: relative;
    z-index: 2;
    transform-style: preserve-3d;
    padding: inherit;
  }
  
  .tilt-glare {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 3;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .tilt-card-v3.tilt-active .tilt-glare {
    opacity: 1;
  }
  
  .tilt-spotlight {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    border-radius: inherit;
  }
  
  .tilt-float-element {
    z-index: 1;
  }
  
  @keyframes tilt-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  .tilt-parallax-layer {
    transition: transform 0.3s ease-out;
    will-change: transform;
  }
  
  /* Card shine border effect */
  .tilt-card-v3::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    padding: 1px;
    background: linear-gradient(
      var(--border-angle, 135deg),
      rgba(201, 206, 214, 0.2),
      rgba(201, 206, 214, 0.05) 50%,
      rgba(201, 206, 214, 0.2)
    );
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .tilt-card-v3.tilt-active::before {
    opacity: 1;
    animation: border-rotate 4s linear infinite;
  }
  
  @property --border-angle {
    syntax: '<angle>';
    initial-value: 135deg;
    inherits: false;
  }
  
  @keyframes border-rotate {
    to { --border-angle: 495deg; }
  }
  
  /* Magnetic effect for buttons inside */
  .tilt-card-v3 .btn {
    transition: transform 0.2s ease;
  }
  
  /* Enhanced shadow on hover */
  .tilt-card-v3 {
    transition: box-shadow 0.3s ease;
  }
  
  .tilt-card-v3.tilt-active {
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(201, 206, 214, 0.1);
  }
`;
document.head.appendChild(tiltStyles);

// =========================================
// INITIALIZE
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  // Auto-initialize cards with data attribute
  document.querySelectorAll('[data-tilt-v3], .tilt-card-v3').forEach(card => {
    new TiltCardV3(card, {
      maxTilt: parseFloat(card.dataset.tiltMax) || 15,
      glare: card.dataset.tiltGlare !== 'false',
      spotLight: card.dataset.tiltSpotlight !== 'false',
      floatingElements: card.dataset.tiltFloat !== 'false'
    });
  });
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TiltCardV3 };
}
