/**
 * v55.0: Content Reveal Engine
 * Fortune 500 - Scroll-driven content reveals with intersection observer
 */

class ContentRevealEngine {
  constructor(options = {}) {
    this.options = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px',
      once: true,
      staggerDelay: 100,
      ...options
    };
    
    this.observer = null;
    this.elements = [];
    this.revealedElements = new Set();
    
    this.init();
  }
  
  init() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.revealAllImmediately();
      return;
    }
    
    this.setupObserver();
    this.findElements();
    this.bindEvents();
  }
  
  setupObserver() {
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin
      }
    );
  }
  
  findElements() {
    // Find all elements with data-reveal attribute
    this.elements = document.querySelectorAll('[data-reveal]');
    
    this.elements.forEach(el => {
      // Determine reveal type
      const revealType = el.dataset.reveal || 'up';
      el.classList.add(`reveal-${revealType}`);
      
      // Set up staggered children
      if (el.dataset.revealChildren) {
        this.setupStaggeredChildren(el);
      }
      
      this.observer.observe(el);
    });
    
    console.log(`🔍 ContentRevealEngine: Found ${this.elements.length} elements to reveal`);
  }
  
  setupStaggeredChildren(parent) {
    const children = parent.children;
    Array.from(children).forEach((child, index) => {
      child.style.transitionDelay = `${index * (parent.dataset.staggerDelay || 100)}ms`;
    });
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.revealElement(entry.target);
        
        if (this.options.once) {
          this.observer.unobserve(entry.target);
        }
      } else if (!this.options.once) {
        this.hideElement(entry.target);
      }
    });
  }
  
  revealElement(el) {
    if (this.revealedElements.has(el)) return;
    
    // Add revealed class
    requestAnimationFrame(() => {
      el.classList.add('revealed');
      this.revealedElements.add(el);
      
      // Trigger custom event
      el.dispatchEvent(new CustomEvent('contentRevealed', {
        detail: { element: el, type: el.dataset.reveal }
      }));
      
      // Handle character reveal
      if (el.dataset.reveal === 'chars') {
        this.revealCharacters(el);
      }
      
      // Handle word reveal
      if (el.dataset.reveal === 'words') {
        this.revealWords(el);
      }
      
      // Handle cascade children
      if (el.classList.contains('cascade-reveal') || el.dataset.revealChildren) {
        this.cascadeRevealChildren(el);
      }
    });
  }
  
  hideElement(el) {
    el.classList.remove('revealed');
    this.revealedElements.delete(el);
  }
  
  revealCharacters(el) {
    const text = el.textContent;
    el.innerHTML = '';
    
    text.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.transitionDelay = `${index * 30}ms`;
      el.appendChild(span);
    });
    
    el.classList.add('char-reveal');
    
    requestAnimationFrame(() => {
      el.classList.add('revealed');
    });
  }
  
  revealWords(el) {
    const text = el.textContent;
    el.innerHTML = '';
    
    text.split(' ').forEach((word, index) => {
      const span = document.createElement('span');
      span.textContent = word + '\u00A0';
      span.style.transitionDelay = `${index * 100}ms`;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(20px)';
      span.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      el.appendChild(span);
      
      setTimeout(() => {
        span.style.opacity = '1';
        span.style.transform = 'translateY(0)';
      }, 50);
    });
  }
  
  cascadeRevealChildren(el) {
    const children = el.children;
    Array.from(children).forEach((child, index) => {
      setTimeout(() => {
        child.classList.add('revealed');
      }, index * (el.dataset.staggerDelay || this.options.staggerDelay));
    });
  }
  
  revealAllImmediately() {
    this.elements.forEach(el => {
      el.classList.add('revealed');
    });
  }
  
  bindEvents() {
    // Re-check on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.findElements();
      }, 250);
    }, { passive: true });
  }
  
  // Public API methods
  refresh() {
    this.findElements();
  }
  
  reveal(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => this.revealElement(el));
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.elements.forEach(el => {
      el.classList.remove('revealed');
    });
  }
}

// Parallax Depth System
class ParallaxDepthSystem {
  constructor(options = {}) {
    this.options = {
      layers: [],
      sensitivity: 0.5,
      smoothness: 0.1,
      ...options
    };
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.isActive = false;
    this.rafId = null;
    
    this.init();
  }
  
  init() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    this.findLayers();
    this.bindEvents();
    this.startAnimation();
  }
  
  findLayers() {
    const layers = document.querySelectorAll('[data-parallax-depth]');
    
    this.options.layers = Array.from(layers).map(el => {
      const depth = parseFloat(el.dataset.parallaxDepth) || 0.5;
      return {
        element: el,
        depth: depth,
        baseX: 0,
        baseY: 0
      };
    });
  }
  
  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    
    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isActive = false;
      } else {
        this.isActive = true;
      }
    });
  }
  
  startAnimation() {
    this.isActive = true;
    this.animate();
  }
  
  animate() {
    if (!this.isActive) {
      this.rafId = requestAnimationFrame(() => this.animate());
      return;
    }
    
    // Smooth interpolation
    this.targetX = this.mouseX * this.options.sensitivity * 50;
    this.targetY = this.mouseY * this.options.sensitivity * 50;
    
    this.currentX += (this.targetX - this.currentX) * this.options.smoothness;
    this.currentY += (this.targetY - this.currentY) * this.options.smoothness;
    
    // Apply transforms to layers
    this.options.layers.forEach(layer => {
      const moveX = this.currentX * layer.depth;
      const moveY = this.currentY * layer.depth;
      
      layer.element.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
    
    this.rafId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    this.isActive = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

// Scroll Velocity Tracker
class ScrollVelocityTracker {
  constructor(callback) {
    this.callback = callback;
    this.lastScrollY = window.scrollY;
    this.lastTime = Date.now();
    this.velocity = 0;
    this.rafId = null;
    
    this.init();
  }
  
  init() {
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    this.update();
  }
  
  handleScroll() {
    const currentScrollY = window.scrollY;
    const currentTime = Date.now();
    const deltaY = currentScrollY - this.lastScrollY;
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime > 0) {
      this.velocity = deltaY / deltaTime;
    }
    
    this.lastScrollY = currentScrollY;
    this.lastTime = currentTime;
  }
  
  update() {
    // Decay velocity
    this.velocity *= 0.95;
    
    if (Math.abs(this.velocity) > 0.01) {
      this.callback(this.velocity);
    }
    
    this.rafId = requestAnimationFrame(() => this.update());
  }
  
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

// Velocity-based Skew Effect
class VelocitySkewEffect {
  constructor() {
    this.elements = [];
    this.tracker = null;
    
    this.init();
  }
  
  init() {
    this.elements = document.querySelectorAll('[data-velocity-skew]');
    if (this.elements.length === 0) return;
    
    this.tracker = new ScrollVelocityTracker((velocity) => {
      this.applySkew(velocity);
    });
  }
  
  applySkew(velocity) {
    const maxSkew = 3;
    const skew = Math.max(-maxSkew, Math.min(maxSkew, velocity * 10));
    
    this.elements.forEach(el => {
      const intensity = parseFloat(el.dataset.velocitySkew) || 1;
      el.style.transform = `skewY(${skew * intensity}deg)`;
    });
  }
  
  destroy() {
    if (this.tracker) {
      this.tracker.destroy();
    }
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRevealEngine);
} else {
  initRevealEngine();
}

function initRevealEngine() {
  // Initialize Content Reveal Engine
  window.contentReveal = new ContentRevealEngine({
    threshold: 0.15,
    once: true
  });
  
  // Initialize Parallax Depth System
  window.parallaxDepth = new ParallaxDepthSystem({
    sensitivity: 0.3
  });
  
  // Initialize Velocity Skew Effect
  window.velocitySkew = new VelocitySkewEffect();
  
  console.log('✨ ContentRevealEngine v55.0 initialized: Scroll-driven reveals, Parallax depth, Velocity effects');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ContentRevealEngine, ParallaxDepthSystem, ScrollVelocityTracker, VelocitySkewEffect };
}
