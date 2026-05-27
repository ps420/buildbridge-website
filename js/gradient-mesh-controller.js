/**
 * BuildBridge - Gradient Mesh Controller v17.0
 * Controls and manages animated gradient mesh backgrounds
 * Fortune 500 Quality Visual Effects System
 */

(function() {
  'use strict';

  class GradientMeshController {
    constructor(options = {}) {
      this.options = {
        container: options.container || document.body,
        blobCount: options.blobCount || 4,
        enableOrbs: options.enableOrbs !== false,
        enableShapes: options.enableShapes !== false,
        responsive: options.responsive !== false,
        reducedMotionSupport: options.reducedMotionSupport !== false,
        ...options
      };
      
      this.container = null;
      this.blobs = [];
      this.orbs = [];
      this.shapes = [];
      this.isActive = false;
      this.resizeObserver = null;
      this.intersectionObserver = null;
      
      this.init();
    }
    
    init() {
      // Check for reduced motion preference
      if (this.options.reducedMotionSupport && this.prefersReducedMotion()) {
        return;
      }
      
      this.createContainer();
      this.createBlobs();
      
      if (this.options.enableOrbs) {
        this.createOrbs();
      }
      
      if (this.options.enableShapes) {
        this.createShapes();
      }
      
      this.setupEventListeners();
      this.setupIntersectionObserver();
      
      this.isActive = true;
      console.log('🎨 Gradient Mesh Controller initialized');
    }
    
    prefersReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    createContainer() {
      this.container = document.createElement('div');
      this.container.className = 'gradient-mesh-container';
      this.container.setAttribute('aria-hidden', 'true');
      
      // Insert as first child of body for proper z-index
      if (this.options.container === document.body) {
        document.body.insertBefore(this.container, document.body.firstChild);
      } else {
        this.options.container.appendChild(this.container);
      }
    }
    
    createBlobs() {
      for (let i = 0; i < this.options.blobCount; i++) {
        const blob = document.createElement('div');
        blob.className = `mesh-blob mesh-blob--${i + 1}`;
        this.container.appendChild(blob);
        this.blobs.push(blob);
      }
    }
    
    createOrbs() {
      const orbSizes = ['small', 'medium', 'large', 'small', 'medium'];
      const orbConfigs = [
        { top: '10%', left: '10%', delay: '0s' },
        { top: '60%', left: '80%', delay: '2s' },
        { top: '80%', left: '30%', delay: '4s' },
        { top: '30%', left: '70%', delay: '1s' },
        { top: '50%', left: '50%', delay: '3s' }
      ];
      
      const orbsContainer = document.createElement('div');
      orbsContainer.className = 'floating-orbs';
      
      orbConfigs.forEach((config, index) => {
        const orb = document.createElement('div');
        orb.className = `orb orb--${orbSizes[index]}`;
        orb.style.top = config.top;
        orb.style.left = config.left;
        orb.style.animationDelay = config.delay;
        orbsContainer.appendChild(orb);
        this.orbs.push(orb);
      });
      
      this.container.appendChild(orbsContainer);
    }
    
    createShapes() {
      const shapesContainer = document.createElement('div');
      shapesContainer.className = 'floating-orbs';
      
      const shapeConfigs = [
        { type: 'circle', top: '20%', left: '5%', size: '400px' },
        { type: 'square', top: '60%', left: '75%', size: '300px' },
        { type: 'ring', top: '40%', left: '40%', size: '500px' }
      ];
      
      shapeConfigs.forEach((config, index) => {
        const shape = document.createElement('div');
        shape.className = `bg-shape bg-shape--${config.type}`;
        shape.style.top = config.top;
        shape.style.left = config.left;
        shape.style.width = config.size;
        shape.style.height = config.size;
        shape.style.animationDelay = `${index * 5}s`;
        shapesContainer.appendChild(shape);
        this.shapes.push(shape);
      });
      
      this.container.appendChild(shapesContainer);
    }
    
    setupEventListeners() {
      // Handle visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else {
          this.resume();
        }
      });
      
      // Handle resize
      if (this.options.responsive) {
        window.addEventListener('resize', this.debounce(() => {
          this.handleResize();
        }, 250));
      }
    }
    
    setupIntersectionObserver() {
      if (!('IntersectionObserver' in window)) return;
      
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.resume();
          } else {
            this.pause();
          }
        });
      }, { threshold: 0.1 });
      
      this.intersectionObserver.observe(this.container);
    }
    
    handleResize() {
      // Adjust blob sizes based on viewport
      const isMobile = window.innerWidth < 768;
      
      this.blobs.forEach((blob, index) => {
        const baseSize = isMobile ? 200 : 400;
        const size = baseSize + (index * 50);
        blob.style.width = `${size}px`;
        blob.style.height = `${size}px`;
      });
    }
    
    pause() {
      if (!this.isActive) return;
      
      [...this.blobs, ...this.orbs, ...this.shapes].forEach(el => {
        el.style.animationPlayState = 'paused';
      });
    }
    
    resume() {
      if (!this.isActive || this.prefersReducedMotion()) return;
      
      [...this.blobs, ...this.orbs, ...this.shapes].forEach(el => {
        el.style.animationPlayState = 'running';
      });
    }
    
    destroy() {
      if (this.container) {
        this.container.remove();
      }
      
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
      }
      
      this.isActive = false;
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
  }
  
  // Section Mesh Enhancer - Adds mesh effects to specific sections
  class SectionMeshEnhancer {
    constructor() {
      this.sections = document.querySelectorAll('[data-mesh]');
      this.init();
    }
    
    init() {
      this.sections.forEach(section => {
        const meshType = section.dataset.mesh;
        section.classList.add(`section-mesh-${meshType}`);
        
        // Add intersection observer for reveal animation
        this.observeSection(section);
      });
    }
    
    observeSection(section) {
      if (!('IntersectionObserver' in window)) return;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('mesh-visible');
          }
        });
      }, { threshold: 0.2 });
      
      observer.observe(section);
    }
  }
  
  // Gradient Border Enhancer
  class GradientBorderEnhancer {
    constructor() {
      this.elements = document.querySelectorAll('[data-gradient-border]');
      this.init();
    }
    
    init() {
      this.elements.forEach(el => {
        el.classList.add('gradient-border-animated');
      });
    }
  }
  
  // Initialize when DOM is ready
  function initGradientMesh() {
    // Main background mesh
    const meshController = new GradientMeshController({
      blobCount: 4,
      enableOrbs: true,
      enableShapes: true
    });
    
    // Section enhancers
    new SectionMeshEnhancer();
    new GradientBorderEnhancer();
    
    // Expose to global for debugging
    window.BuildBridgeMesh = meshController;
  }
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGradientMesh);
  } else {
    initGradientMesh();
  }
})();
