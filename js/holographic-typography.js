/**
 * v132.0: Holographic Typography Controller
 * Fortune 500 Quality Interactive Text Effects
 * Mouse-responsive holographic text animations
 */

(function() {
  'use strict';
  
  class HolographicTypography {
    constructor() {
      this.elements = [];
      this.mouse = { x: 0, y: 0 };
      this.isActive = true;
      this.rafId = null;
      
      this.init();
    }
    
    init() {
      this.findElements();
      if (this.elements.length === 0) return;
      
      this.bindEvents();
      this.startAnimation();
    }
    
    findElements() {
      // Find all interactive holographic elements
      this.elements = Array.from(document.querySelectorAll('.holographic-text-interactive'));
      
      // Add data-text for shimmer effects
      document.querySelectorAll('.shimmer-text').forEach(el => {
        if (!el.hasAttribute('data-text')) {
          el.setAttribute('data-text', el.textContent);
        }
      });
    }
    
    bindEvents() {
      // Mouse movement tracking
      let lastX = 0, lastY = 0;
      let throttleTimeout = null;
      
      const handleMouseMove = (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        
        // Throttle processing
        if (!throttleTimeout) {
          throttleTimeout = setTimeout(() => {
            this.updateElements();
            throttleTimeout = null;
          }, 16); // ~60fps
        }
      };
      
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      
      // Handle touch
      document.addEventListener('touchmove', (e) => {
        if (e.touches[0]) {
          this.mouse.x = e.touches[0].clientX;
          this.mouse.y = e.touches[0].clientY;
        }
      }, { passive: true });
      
      // Visibility handling
      document.addEventListener('visibilitychange', () => {
        this.isActive = !document.hidden;
        if (this.isActive) {
          this.startAnimation();
        } else {
          this.stopAnimation();
        }
      });
      
      // Respect reduced motion
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (motionQuery.matches) {
        this.isActive = false;
      }
      motionQuery.addEventListener('change', (e) => {
        this.isActive = !e.matches;
      });
    }
    
    updateElements() {
      if (!this.isActive) return;
      
      this.elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate distance from mouse to element center
        const dx = this.mouse.x - centerX;
        const dy = this.mouse.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Maximum interaction radius
        const maxRadius = 300;
        
        if (distance < maxRadius) {
          // Calculate gradient position based on mouse
          const intensity = 1 - (distance / maxRadius);
          const offsetX = (dx / maxRadius) * 50 + 50;
          const offsetY = (dy / maxRadius) * 50 + 50;
          
          el.style.backgroundPosition = `${offsetX}% ${offsetY}%`;
          el.style.filter = `drop-shadow(0 0 ${20 + intensity * 30}px rgba(201, 206, 214, ${0.3 + intensity * 0.4}))`;
        }
      });
    }
    
    startAnimation() {
      if (this.rafId) return;
      
      const animate = () => {
        if (this.isActive) {
          this.updateElements();
        }
        this.rafId = requestAnimationFrame(animate);
      };
      
      this.rafId = requestAnimationFrame(animate);
    }
    
    stopAnimation() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }
    
    // Public method to add new elements dynamically
    refresh() {
      this.findElements();
    }
    
    destroy() {
      this.stopAnimation();
      this.elements = [];
    }
  }
  
  // Initialize on DOM ready
  function init() {
    if (window.holographicTypography) {
      window.holographicTypography.destroy();
    }
    window.holographicTypography = new HolographicTypography();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose to global scope
  window.HolographicTypography = HolographicTypography;
})();
