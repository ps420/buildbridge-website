/**
 * v36.0: Multi-Layer Deep Parallax System
 * Fortune 500 Immersive Depth Architecture
 * Multiple z-depth layers for realistic parallax effects
 */

class MultiLayerParallax {
  constructor() {
    this.sections = [];
    this.compositions = [];
    this.mouseParallax = [];
    this.scrollSpeed = 0;
    this.lastScrollY = 0;
    this.isActive = true;
    this.rafId = null;
    this.preferReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.init();
  }
  
  init() {
    if (this.preferReducedMotion) return;
    
    this.findSections();
    this.findCompositions();
    this.findMouseParallax();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }
  
  findSections() {
    document.querySelectorAll('.multi-parallax-section').forEach(section => {
      const layers = section.querySelectorAll('.multi-parallax-layer');
      
      this.sections.push({
        element: section,
        layers: Array.from(layers).map((layer, index) => ({
          element: layer,
          speed: parseFloat(layer.dataset.speed) || (index + 1) * 0.1,
          direction: layer.dataset.direction || 'vertical',
          offset: parseFloat(layer.dataset.offset) || 0,
          currentY: 0,
          currentX: 0
        })),
        rect: null
      });
    });
  }
  
  findCompositions() {
    document.querySelectorAll('.parallax-composition').forEach(comp => {
      const inner = comp.querySelector('.parallax-composition-inner');
      const layers = inner.querySelectorAll('.parallax-composition-layer');
      
      this.compositions.push({
        element: comp,
        inner: inner,
        layers: Array.from(layers).map((layer, index) => ({
          element: layer,
          speed: parseFloat(layer.dataset.speed) || (index + 1) * 0.15,
          scale: parseFloat(layer.dataset.scale) || 1,
          opacity: parseFloat(layer.dataset.opacity) || 1,
          targetY: 0,
          targetScale: 1,
          targetOpacity: 1,
          currentY: 0,
          currentScale: 1,
          currentOpacity: 1
        }))
      });
    });
  }
  
  findMouseParallax() {
    document.querySelectorAll('.mouse-parallax-container').forEach(container => {
      const layers = container.querySelectorAll('.mouse-parallax-layer');
      
      this.mouseParallax.push({
        element: container,
        layers: Array.from(layers).map((layer, index) => ({
          element: layer,
          depth: parseFloat(layer.dataset.depth) || (index + 1) * 0.1,
          currentX: 0,
          currentY: 0,
          targetX: 0,
          targetY: 0
        })),
        mouseX: 0,
        mouseY: 0,
        rect: null
      });
    });
  }
  
  createParticles() {
    document.querySelectorAll('.multi-parallax-particles').forEach(container => {
      const particleCount = parseInt(container.dataset.particles) || 20;
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'multi-parallax-particle';
        
        const size = Math.random() * 4 + 2;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const depth = Math.random();
        
        particle.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          left: ${x}%;
          top: ${y}%;
          --depth: ${depth};
          opacity: ${0.2 + depth * 0.3};
        `;
        
        container.appendChild(particle);
      }
    });
  }
  
  bindEvents() {
    // Scroll
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    // Mouse movement for parallax containers
    this.mouseParallax.forEach(mp => {
      mp.element.addEventListener('mousemove', (e) => {
        const rect = mp.element.getBoundingClientRect();
        mp.mouseX = (e.clientX - rect.left - rect.width / 2) / rect.width;
        mp.mouseY = (e.clientY - rect.top - rect.height / 2) / rect.height;
      }, { passive: true });
    });
    
    // Resize
    window.addEventListener('resize', () => {
      this.updateRects();
    }, { passive: true });
    
    // Visibility
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden;
    });
    
    this.updateRects();
  }
  
  updateRects() {
    this.sections.forEach(section => {
      section.rect = section.element.getBoundingClientRect();
    });
    
    this.mouseParallax.forEach(mp => {
      mp.rect = mp.element.getBoundingClientRect();
    });
  }
  
  updateScroll() {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    
    // Calculate scroll speed
    this.scrollSpeed = Math.abs(scrollY - this.lastScrollY);
    this.lastScrollY = scrollY;
    
    // Update sections
    this.sections.forEach(section => {
      const rect = section.element.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      
      // Calculate progress through section
      const progress = (viewportHeight - sectionTop) / (viewportHeight + sectionHeight);
      const clampedProgress = Math.max(0, Math.min(1, progress));
      
      section.layers.forEach(layer => {
        if (layer.direction === 'vertical') {
          layer.targetY = (clampedProgress - 0.5) * layer.speed * 200;
        } else if (layer.direction === 'horizontal') {
          layer.targetX = (clampedProgress - 0.5) * layer.speed * 200;
        }
      });
    });
    
    // Update compositions
    this.compositions.forEach(comp => {
      const rect = comp.element.getBoundingClientRect();
      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const clampedProgress = Math.max(0, Math.min(1, progress));
      
      comp.layers.forEach((layer, index) => {
        const layerProgress = (clampedProgress - 0.5) * 2;
        
        // Different animations based on layer index
        layer.targetY = layerProgress * layer.speed * 300;
        layer.targetScale = layer.scale + Math.abs(layerProgress) * 0.1;
        layer.targetOpacity = Math.max(0, layer.opacity - Math.abs(layerProgress) * 0.3);
      });
    });
  }
  
  animate() {
    if (!this.isActive) {
      this.rafId = requestAnimationFrame(() => this.animate());
      return;
    }
    
    // Smooth interpolation factor
    const lerp = 0.1;
    
    // Animate section layers
    this.sections.forEach(section => {
      section.layers.forEach(layer => {
        layer.currentY += (layer.targetY - layer.currentY) * lerp;
        layer.currentX += (layer.targetX - layer.currentX) * lerp;
        
        layer.element.style.transform = `translate3d(${layer.currentX}px, ${layer.currentY}px, 0)`;
      });
    });
    
    // Animate compositions
    this.compositions.forEach(comp => {
      comp.layers.forEach(layer => {
        layer.currentY += (layer.targetY - layer.currentY) * lerp;
        layer.currentScale += (layer.targetScale - layer.currentScale) * lerp;
        layer.currentOpacity += (layer.targetOpacity - layer.currentOpacity) * lerp;
        
        layer.element.style.transform = `translate3d(0, ${layer.currentY}px, 0) scale(${layer.currentScale})`;
        layer.element.style.opacity = layer.currentOpacity;
      });
    });
    
    // Animate mouse parallax
    this.mouseParallax.forEach(mp => {
      mp.layers.forEach(layer => {
        const maxMove = 30 * layer.depth;
        layer.targetX = mp.mouseX * maxMove;
        layer.targetY = mp.mouseY * maxMove;
        
        layer.currentX += (layer.targetX - layer.currentX) * lerp;
        layer.currentY += (layer.targetY - layer.currentY) * lerp;
        
        layer.element.style.transform = `translate3d(${-layer.currentX}px, ${-layer.currentY}px, 0)`;
      });
    });
    
    // Decay scroll speed
    this.scrollSpeed *= 0.9;
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }
  
  // Public API
  pause() {
    this.isActive = false;
  }
  
  resume() {
    this.isActive = true;
  }
  
  setSpeed(percentage) {
    this.sections.forEach(section => {
      section.layers.forEach(layer => {
        layer.speed = layer.speed * percentage;
      });
    });
  }
  
  destroy() {
    this.isActive = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

// Card Stack Parallax Controller
class CardStackParallax {
  constructor(element) {
    this.element = element;
    this.inner = element.querySelector('.parallax-card-stack-inner');
    this.cards = Array.from(element.querySelectorAll('.parallax-card-stack-item'));
    this.scrollProgress = 0;
    
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
  }
  
  update() {
    const rect = this.element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const progress = (viewportHeight - rect.top) / (rect.height);
    const clampedProgress = Math.max(0, Math.min(1, progress));
    
    this.cards.forEach((card, index) => {
      const cardProgress = (clampedProgress * this.cards.length) - index;
      const clampedCardProgress = Math.max(-1, Math.min(2, cardProgress));
      
      const y = -clampedCardProgress * 30;
      const scale = 1 - clampedCardProgress * 0.05;
      const opacity = 1 - Math.abs(clampedCardProgress) * 0.3;
      const zIndex = this.cards.length - index;
      
      card.style.transform = `translate3d(0, ${y}%, 0) scale(${scale})`;
      card.style.opacity = Math.max(0, opacity);
      card.style.zIndex = zIndex;
    });
  }
}

// Zoom Parallax Controller
class ZoomParallax {
  constructor(element) {
    this.element = element;
    this.inner = element.querySelector('.parallax-zoom-inner');
    this.image = element.querySelector('.parallax-zoom-image');
    this.content = element.querySelector('.parallax-zoom-content');
    
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
  }
  
  update() {
    const rect = this.element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const progress = (viewportHeight - rect.top) / (rect.height);
    const clampedProgress = Math.max(0, Math.min(1, progress));
    
    // Calculate zoom phase
    const zoomPhase = clampedProgress < 0.5 
      ? clampedProgress * 2  // First half: zoom in
      : 1 - (clampedProgress - 0.5) * 2;  // Second half: zoom out
    
    const scale = 1 + zoomPhase * 0.3;
    const blur = (1 - zoomPhase) * 5;
    
    this.image.style.transform = `scale(${scale})`;
    this.image.style.filter = `blur(${blur}px)`;
    
    if (this.content) {
      this.content.style.opacity = zoomPhase;
    }
  }
}

// Initialize systems
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.multiLayerParallax = new MultiLayerParallax();
    
    // Initialize card stacks
    document.querySelectorAll('.parallax-card-stack').forEach(stack => {
      new CardStackParallax(stack);
    });
    
    // Initialize zoom parallax
    document.querySelectorAll('.parallax-zoom-container').forEach(zoom => {
      new ZoomParallax(zoom);
    });
  });
} else {
  window.multiLayerParallax = new MultiLayerParallax();
  
  document.querySelectorAll('.parallax-card-stack').forEach(stack => {
    new CardStackParallax(stack);
  });
  
  document.querySelectorAll('.parallax-zoom-container').forEach(zoom => {
    new ZoomParallax(zoom);
  });
}
