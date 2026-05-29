/**
 * v88.0: Advanced Ripple Effects System
 * Fortune 500 Quality Interactive Touch Feedback
 */

(function() {
  'use strict';

  // Ripple Effect Class
  class RippleEffect {
    constructor(element, options = {}) {
      this.element = element;
      this.options = {
        color: options.color || 'rgba(201, 169, 104, 0.3)',
        duration: options.duration || 600,
        maxSize: options.maxSize || null,
        center: options.center || false,
        ...options
      };
      
      this.init();
    }

    init() {
      this.element.classList.add('ripple-container');
      this.element.addEventListener('click', this.createRipple.bind(this));
      
      // Add mouse position tracking for hover effects
      this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    createRipple(e) {
      const rect = this.element.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      
      // Calculate size
      const size = this.options.maxSize || Math.max(rect.width, rect.height);
      const radius = size / 2;
      
      // Calculate position
      let x, y;
      if (this.options.center) {
        x = rect.width / 2 - radius;
        y = rect.height / 2 - radius;
      } else {
        x = e.clientX - rect.left - radius;
        y = e.clientY - rect.top - radius;
      }
      
      // Apply styles
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: ${this.options.color};
        animation-duration: ${this.options.duration}ms;
      `;
      
      this.element.appendChild(ripple);
      
      // Remove after animation
      setTimeout(() => {
        ripple.remove();
      }, this.options.duration);
    }

    handleMouseMove(e) {
      const rect = this.element.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      this.element.style.setProperty('--mouse-x', `${x}%`);
      this.element.style.setProperty('--mouse-y', `${y}%`);

      this.element.style.setProperty('--ripple-x', `${x}%`);
      this.element.style.setProperty('--ripple-y', `${y}%`);
    }

    destroy() {
      this.element.removeEventListener('click', this.createRipple);
      this.element.removeEventListener('mousemove', this.handleMouseMove);
      this.element.classList.remove('ripple-container');
    }
  }

  // Initialize Ripple Effects
  function initRippleEffects() {
    // Button ripples
    document.querySelectorAll('.btn-ripple, .btn').forEach(btn => {
      if (!btn._rippleInstance) {
        btn._rippleInstance = new RippleEffect(btn, {
          color: 'rgba(201, 169, 104, 0.4)',
          duration: 600
        });
      }
    });

    // Card ripples
    document.querySelectorAll('.card-ripple, .service-card, .project-card').forEach(card => {
      if (!card._rippleInstance) {
        card._rippleInstance = new RippleEffect(card, {
          color: 'rgba(201, 169, 104, 0.2)',
          duration: 800,
          center: true
        });
      }
    });

    // Icon button ripples
    document.querySelectorAll('.icon-btn-ripple').forEach(btn => {
      if (!btn._rippleInstance) {
        btn._rippleInstance = new RippleEffect(btn, {
          color: 'rgba(255, 255, 255, 0.3)',
          duration: 400
        });
      }
    });

    // List item ripples
    document.querySelectorAll('.list-item-ripple').forEach(item => {
      if (!item._rippleInstance) {
        item._rippleInstance = new RippleEffect(item, {
          color: 'rgba(201, 169, 104, 0.15)',
          duration: 500
        });
      }
    });

    // Touch ripple for mobile
    if ('ontouchstart' in window) {
      document.querySelectorAll('.touch-ripple').forEach(el => {
        el.addEventListener('touchstart', function(e) {
          const rect = this.getBoundingClientRect();
          const touch = e.touches[0];
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          
          this.style.setProperty('--touch-x', `${x}px`);
          this.style.setProperty('--touch-y', `${y}px`);
        }, { passive: true });
      });
    }
  }

  // Magnetic Button Effect
  function initMagneticButtons() {
    const magneticElements = document.querySelectorAll('.magnetic-ripple');
    
    magneticElements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // Wave Ripple Animation
  function initWaveRipples() {
    document.querySelectorAll('.ripple-wave').forEach(el => {
      let animationId;
      
      el.addEventListener('mouseenter', () => {
        el.style.animationPlayState = 'running';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.animationPlayState = 'paused';
      });
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initRippleEffects();
      initMagneticButtons();
      initWaveRipples();
    });
  } else {
    initRippleEffects();
    initMagneticButtons();
    initWaveRipples();
  }

  // Re-initialize on dynamic content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const rippleElements = node.matches?.('.btn, .btn-ripple, .card-ripple, .icon-btn-ripple, .list-item-ripple, .service-card, .project-card') 
              ? [node] 
              : node.querySelectorAll?.('.btn, .btn-ripple, .card-ripple, .icon-btn-ripple, .list-item-ripple, .service-card, .project-card') || [];
            
            rippleElements.forEach(el => {
              if (!el._rippleInstance) {
                new RippleEffect(el);
              }
            });
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Export for global access
  window.RippleEffect = RippleEffect;
  window.initRippleEffects = initRippleEffects;

})();
