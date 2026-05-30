// ========================================
// SCROLL-LINKED 3D DEPTH SYSTEM - v128.0
// Fortune 500 Multi-Layer Parallax
// Features: True 3D perspective, scroll-linked
// transforms, mouse parallax, depth indicators
// ========================================

class Scroll3DDepthSystem {
  constructor() {
    this.containers = [];
    this.layers = [];
    this.scrollY = 0;
    this.lastScrollY = 0;
    this.scrollDirection = 0;
    this.scrollVelocity = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.rafId = null;
    this.isActive = true;
    
    // Configuration
    this.config = {
      parallaxStrength: 0.5,
      mouseParallaxStrength: 0.02,
      tiltAmount: 5,
      smoothFactor: 0.1,
      depthScaleFactor: 0.01
    };
    
    this.init();
  }
  
  init() {
    this.findContainers();
    this.findLayers();
    this.createDepthIndicators();
    this.bindEvents();
    this.animate();
    
    console.log('� depth 3D system initialized');
  }
  
  findContainers() {
    this.containers = document.querySelectorAll('.depth-container');
    this.containers.forEach(container => {
      // Set initial perspective
      container.style.perspective = container.dataset.perspective || '1000px';
      container.style.perspectiveOrigin = '50% 50%';
      container.style.transformStyle = 'preserve-3d';
    });
  }
  
  findLayers() {
    this.layers = document.querySelectorAll('[data-depth]');
    this.layers.forEach(layer => {
      const depth = parseFloat(layer.dataset.depth) || 0;
      const speed = parseFloat(layer.dataset.parallaxSpeed) || 0.5;
      
      layer._depthData = {
        depth: depth,
        speed: speed,
        baseTransform: this.getBaseTransform(depth)
      };
      
      layer.style.transformStyle = 'preserve-3d';
      layer.style.willChange = 'transform';
    });
  }
  
  getBaseTransform(depth) {
    const translateZ = depth * 10;
    const scale = 1 + (Math.abs(depth) * 0.01);
    return { translateZ, scale };
  }
  
  createDepthIndicators() {
    const sections = document.querySelectorAll('[data-section]');
    if (sections.length < 3) return;
    
    // Check if indicators already exist
    if (document.querySelector('.depth-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'depth-indicator';
    indicator.setAttribute('aria-label', 'Section navigation');
    
    sections.forEach((section, index) => {
      const dot = document.createElement('button');
      dot.className = 'depth-indicator-dot';
      dot.setAttribute('aria-label', `Go to ${section.dataset.section || `section ${index + 1}`}`);
      dot.dataset.index = index;
      dot.dataset.section = section.dataset.navLabel || section.id || `section-${index}`;
      
      dot.addEventListener('click', () => {
        section.scrollIntoView({ behavior: 'smooth' });
      });
      
      indicator.appendChild(dot);
    });
    
    document.body.appendChild(indicator);
    this.indicators = indicator.querySelectorAll('.depth-indicator-dot');
    
    // Observe active section
    this.observeSections(sections);
  }
  
  observeSections(sections) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Array.from(sections).indexOf(entry.target);
          this.updateActiveIndicator(index);
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '-20% 0px -20% 0px'
    });
    
    sections.forEach(section => observer.observe(section));
  }
  
  updateActiveIndicator(activeIndex) {
    this.indicators?.forEach((dot, index) => {
      dot.classList.toggle('active', index === activeIndex);
    });
  }
  
  bindEvents() {
    // Scroll events
    let ticking = false;
    window.addEventListener('scroll', () => {
      this.scrollY = window.scrollY;
      
      if (!ticking) {
        requestAnimationFrame(() => {
          this.calculateScrollData();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Mouse events for parallax
    document.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
      this.isActive = document.visibilityState === 'visible';
      if (this.isActive) this.animate();
    });
    
    // Reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.isActive = false;
    }
  }
  
  calculateScrollData() {
    this.scrollVelocity = this.scrollY - this.lastScrollY;
    this.scrollDirection = Math.sign(this.scrollVelocity);
    this.lastScrollY = this.scrollY;
  }
  
  animate() {
    if (!this.isActive) return;
    
    // Smooth mouse following
    this.mouseX += (this.targetMouseX - this.mouseX) * this.config.smoothFactor;
    this.mouseY += (this.targetMouseY - this.mouseY) * this.config.smoothFactor;
    
    // Update depth layers
    this.updateLayers();
    
    // Update tilt effects
    this.updateTiltEffects();
    
    // Update mouse parallax
    this.updateMouseParallax();
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }
  
  updateLayers() {
    const viewportHeight = window.innerHeight;
    
    this.layers.forEach(layer => {
      const rect = layer.getBoundingClientRect();
      const isInViewport = rect.top < viewportHeight && rect.bottom > 0;
      
      if (!isInViewport) return;
      
      const data = layer._depthData;
      const progress = 1 - (rect.top / viewportHeight);
      
      // Calculate scroll-linked offset
      const scrollOffset = (this.scrollY * data.speed * 0.1) % 100;
      
      // Combine with base transform
      const translateZ = data.baseTransform.translateZ;
      const scale = data.baseTransform.scale;
      
      // Apply transform
      const transform = `
        translateZ(${translateZ}px) 
        scale(${scale})
        translateY(${scrollOffset * data.depth * 0.1}px)
      `;
      
      layer.style.transform = transform;
    });
  }
  
  updateTiltEffects() {
    // Add subtle tilt based on scroll direction
    const tiltElements = document.querySelectorAll('.tilt-on-scroll');
    const tiltClass = this.scrollDirection > 0 ? 'tilt-scroll-down' : 
                      this.scrollDirection < 0 ? 'tilt-scroll-up' : '';
    
    tiltElements.forEach(el => {
      el.classList.remove('tilt-scroll-up', 'tilt-scroll-down');
      if (tiltClass) el.classList.add(tiltClass);
    });
    
    // Apply tilt to containers based on velocity
    if (Math.abs(this.scrollVelocity) > 5) {
      const tiltAmount = Math.min(this.config.tiltAmount, Math.abs(this.scrollVelocity) * 0.1);
      const tiltDirection = this.scrollDirection > 0 ? 1 : -1;
      
      this.containers.forEach(container => {
        const currentTransform = container.style.transform;
        container.style.transform = `rotateX(${tiltAmount * tiltDirection}deg)`;
      });
    } else {
      this.containers.forEach(container => {
        container.style.transform = 'rotateX(0deg)';
      });
    }
  }
  
  updateMouseParallax() {
    const parallaxContainers = document.querySelectorAll('.mouse-parallax-container');
    
    parallaxContainers.forEach(container => {
      const bg = container.querySelector('.mouse-parallax-bg');
      const mid = container.querySelector('.mouse-parallax-mid');
      const fg = container.querySelector('.mouse-parallax-fg');
      
      const strength = this.config.mouseParallaxStrength;
      
      if (bg) {
        bg.style.transform = `translateZ(-200px) scale(1.2) translate(${-this.mouseX * 20 * strength}px, ${-this.mouseY * 20 * strength}px)`;
      }
      if (mid) {
        mid.style.transform = `translate(${-this.mouseX * 10 * strength}px, ${-this.mouseY * 10 * strength}px)`;
      }
      if (fg) {
        fg.style.transform = `translateZ(100px) scale(0.9) translate(${-this.mouseX * 30 * strength}px, ${-this.mouseY * 30 * strength}px)`;
      }
    });
  }
  
  // Public API methods
  refresh() {
    this.findContainers();
    this.findLayers();
    this.createDepthIndicators();
  }
  
  setParallaxStrength(strength) {
    this.config.parallaxStrength = Math.max(0, Math.min(1, strength));
  }
  
  disable() {
    this.isActive = false;
    cancelAnimationFrame(this.rafId);
  }
  
  enable() {
    this.isActive = true;
    this.animate();
  }
}

// Layer Reveal Animation
class LayerRevealAnimation {
  constructor() {
    this.elements = document.querySelectorAll('.layer-reveal');
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    
    this.elements.forEach(el => observer.observe(el));
  }
}

// Curtain Reveal Animation
class CurtainRevealAnimation {
  constructor() {
    this.elements = document.querySelectorAll('.curtain-reveal');
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, 200);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    this.elements.forEach(el => observer.observe(el));
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.depthSystem = new Scroll3DDepthSystem();
    new LayerRevealAnimation();
    new CurtainRevealAnimation();
  });
} else {
  window.depthSystem = new Scroll3DDepthSystem();
  new LayerRevealAnimation();
  new CurtainRevealAnimation();
}

export { Scroll3DDepthSystem, LayerRevealAnimation, CurtainRevealAnimation };
