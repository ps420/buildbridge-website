/**
 * Multi-Layer Parallax System v36.0
 * Fortune 500 Depth-Based Scrolling Effects
 */

class MultiLayerParallax {
  constructor(container, options = {}) {
    this.container = container;
    this.layers = [];
    this.options = {
      speedFactor: options.speedFactor || 0.5,
      direction: options.direction || 'vertical',
      debug: options.debug || false,
      ...options
    };
    
    this.scrollY = 0;
    this.windowHeight = window.innerHeight;
    this.rafId = null;
    this.isActive = true;
    
    this.init();
  }
  
  init() {
    if (!this.container) return;
    
    this.layers = Array.from(this.container.querySelectorAll('[data-parallax-depth]'));
    
    if (this.layers.length === 0) {
      // Auto-create layers from child elements
      this.setupAutoLayers();
    }
    
    this.bindEvents();
    this.animate();
    
    if (this.options.debug) {
      this.addDebugInfo();
    }
  }
  
  setupAutoLayers() {
    const children = Array.from(this.container.children);
    const totalChildren = children.length;
    
    children.forEach((child, index) => {
      const depth = (index + 1) / totalChildren;
      child.setAttribute('data-parallax-depth', depth.toFixed(2));
      child.classList.add('parallax-layer');
      this.layers.push(child);
    });
  }
  
  bindEvents() {
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
    
    // IntersectionObserver for performance
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isActive = entry.isIntersecting;
        if (this.isActive && !this.rafId) {
          this.animate();
        }
      });
    }, { threshold: 0 });
    
    this.observer.observe(this.container);
  }
  
  handleScroll() {
    this.scrollY = window.pageYOffset || document.documentElement.scrollTop;
  }
  
  handleResize() {
    this.windowHeight = window.innerHeight;
  }
  
  animate() {
    if (!this.isActive) {
      this.rafId = null;
      return;
    }
    
    this.updateLayers();
    this.rafId = requestAnimationFrame(() => this.animate());
  }
  
  updateLayers() {
    const containerRect = this.container.getBoundingClientRect();
    const containerTop = containerRect.top;
    const containerHeight = containerRect.height;
    
    // Calculate scroll progress through container
    const scrollProgress = -containerTop / containerHeight;
    
    this.layers.forEach((layer, index) => {
      const depth = parseFloat(layer.dataset.parallaxDepth) || ((index + 1) / this.layers.length);
      const speed = parseFloat(layer.dataset.parallaxSpeed) || (depth * this.options.speedFactor);
      
      let translateValue = 0;
      
      if (this.options.direction === 'vertical') {
        translateValue = scrollProgress * speed * containerHeight;
        layer.style.transform = `translate3d(0, ${translateValue}px, 0)`;
      } else if (this.options.direction === 'horizontal') {
        translateValue = scrollProgress * speed * 100;
        layer.style.transform = `translate3d(${translateValue}px, 0, 0)`;
      } else if (this.options.direction === 'both') {
        const translateY = scrollProgress * speed * containerHeight;
        const translateX = scrollProgress * speed * 50;
        layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
      }
      
      // Apply additional effects if specified
      if (layer.dataset.parallaxBlur) {
        const blurAmount = Math.abs(translateValue / 100) * parseFloat(layer.dataset.parallaxBlur);
        layer.style.filter = `blur(${Math.min(blurAmount, 10)}px)`;
      }
      
      if (layer.dataset.parallaxScale) {
        const scaleAmount = 1 + (scrollProgress * parseFloat(layer.dataset.parallaxScale));
        layer.style.transform += ` scale(${scaleAmount})`;
      }
      
      if (layer.dataset.parallaxOpacity) {
        const opacity = 1 - (Math.abs(scrollProgress) * parseFloat(layer.dataset.parallaxOpacity));
        layer.style.opacity = Math.max(0.2, Math.min(1, opacity));
      }
    });
  }
  
  addDebugInfo() {
    const debugPanel = document.createElement('div');
    debugPanel.className = 'parallax-debug';
    debugPanel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: #0f0;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 99999;
      max-width: 300px;
    `;
    document.body.appendChild(debugPanel);
    
    const updateDebug = () => {
      const containerRect = this.container.getBoundingClientRect();
      debugPanel.innerHTML = `
        <div><strong>Parallax Debug</strong></div>
        <div>Layers: ${this.layers.length}</div>
        <div>ScrollY: ${Math.round(this.scrollY)}px</div>
        <div>Container Y: ${Math.round(containerRect.top)}px</div>
        <div>Direction: ${this.options.direction}</div>
        <div>Active: ${this.isActive}</div>
      `;
      requestAnimationFrame(updateDebug);
    };
    updateDebug();
  }
  
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
  }
}

// Mouse-based parallax effect
class MouseParallax {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      intensity: options.intensity || 20,
      easing: options.easing || 0.1,
      ...options
    };
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.rafId = null;
    
    this.init();
  }
  
  init() {
    if (!this.container) return;
    
    this.layers = this.container.querySelectorAll('.mouse-parallax-layer');
    
    this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    
    this.animate();
  }
  
  handleMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    this.mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }
  
  handleMouseLeave() {
    this.mouseX = 0;
    this.mouseY = 0;
  }
  
  animate() {
    this.currentX += (this.mouseX - this.currentX) * this.options.easing;
    this.currentY += (this.mouseY - this.currentY) * this.options.easing;
    
    this.layers.forEach((layer, index) => {
      const depth = parseFloat(layer.dataset.parallaxDepth) || ((index + 1) / this.layers.length);
      const x = this.currentX * this.options.intensity * depth;
      const y = this.currentY * this.options.intensity * depth;
      
      layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

// Floating animation controller
class FloatingElements {
  constructor(container) {
    this.container = container || document;
    this.elements = [];
    this.init();
  }
  
  init() {
    this.elements = this.container.querySelectorAll('.parallax-floating');
    
    this.elements.forEach((el, index) => {
      // Stagger animations
      el.style.animationDelay = `${index * 0.5}s`;
      
      // Randomize slightly for organic feel
      const randomDuration = 6 + Math.random() * 4;
      el.style.animationDuration = `${randomDuration}s`;
    });
  }
}

// Parallax Cards with 3D tilt
class ParallaxCards {
  constructor(container) {
    this.container = container;
    this.cards = [];
    this.init();
  }
  
  init() {
    this.cards = this.container.querySelectorAll('.parallax-card');
    
    this.cards.forEach(card => {
      card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
      card.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, card));
    });
  }
  
  handleMouseMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px)`;
  }
  
  handleMouseLeave(e, card) {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
  }
}

// Initialize all parallax systems
document.addEventListener('DOMContentLoaded', () => {
  // Multi-layer parallax containers
  document.querySelectorAll('.multi-layer-parallax-container').forEach(container => {
    new MultiLayerParallax(container, {
      speedFactor: parseFloat(container.dataset.parallaxSpeed) || 0.5,
      direction: container.dataset.parallaxDirection || 'vertical'
    });
  });
  
  // Mouse parallax
  document.querySelectorAll('.mouse-parallax-container').forEach(container => {
    new MouseParallax(container, {
      intensity: parseFloat(container.dataset.mouseIntensity) || 20
    });
  });
  
  // Floating elements
  new FloatingElements();
  
  // Parallax cards
  document.querySelectorAll('.parallax-cards-container').forEach(container => {
    new ParallaxCards(container);
  });
  
  // Parallax sections
  document.querySelectorAll('.parallax-section').forEach(section => {
    const bg = section.querySelector('.parallax-section__bg img');
    if (bg) {
      window.addEventListener('scroll', () => {
        const rect = section.getBoundingClientRect();
        const scrollProgress = -rect.top / rect.height;
        const translateY = scrollProgress * 100;
        bg.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }, { passive: true });
    }
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MultiLayerParallax, MouseParallax, FloatingElements, ParallaxCards };
}
