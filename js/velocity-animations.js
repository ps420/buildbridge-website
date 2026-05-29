/**
 * Velocity-Aware Animations v87.4 - Fortune 500 Scroll Speed Effects
 * Animations that respond to scroll velocity and direction
 */

(function() {
  'use strict';

  const VelocityAnimations = {
    lastScrollY: 0,
    lastScrollTime: performance.now(),
    velocity: 0,
    direction: 0, // 1 = down, -1 = up
    smoothedVelocity: 0,
    rafId: null,
    containers: [],
    config: {
      smoothing: 0.1,
      maxVelocity: 50,
      threshold: 2
    },

    init() {
      this.detectContainers();
      this.createMomentumIndicator();
      this.bindEvents();
      this.startLoop();
      
      console.log('⚡ Velocity Animations initialized');
    },

    detectContainers() {
      this.containers = Array.from(document.querySelectorAll('.velocity-container, [data-velocity]'));
      if (this.containers.length === 0) {
        // Default to body
        this.containers = [document.body];
        document.body.classList.add('velocity-container');
      }
    },

    createMomentumIndicator() {
      if (window.matchMedia('(pointer: coarse)').matches) return; // Skip on touch
      
      const indicator = document.createElement('div');
      indicator.className = 'scroll-momentum-indicator';
      indicator.innerHTML = `
        <div class="scroll-momentum-indicator-bar"></div>
        <div class="scroll-momentum-indicator-bar negative"></div>
      `;
      indicator.setAttribute('aria-hidden', 'true');
      
      document.body.appendChild(indicator);
      this.momentumIndicator = indicator;
      this.momentumBar = indicator.querySelector('.scroll-momentum-indicator-bar:not(.negative)');
      this.momentumBarNegative = indicator.querySelector('.scroll-momentum-indicator-bar.negative');
    },

    calculateVelocity() {
      const currentScrollY = window.scrollY;
      const currentTime = performance.now();
      const deltaY = currentScrollY - this.lastScrollY;
      const deltaTime = currentTime - this.lastScrollTime;
      
      if (deltaTime > 0) {
        // Calculate instant velocity
        const instantVelocity = (deltaY / deltaTime) * 16; // Normalize to ~60fps
        
        // Clamp velocity
        this.velocity = Math.max(-this.config.maxVelocity, 
                                 Math.min(this.config.maxVelocity, instantVelocity));
        
        // Smooth velocity
        this.smoothedVelocity += (this.velocity - this.smoothedVelocity) * this.config.smoothing;
        
        // Detect direction
        if (Math.abs(this.smoothedVelocity) > this.config.threshold) {
          this.direction = this.smoothedVelocity > 0 ? 1 : -1;
        }
        
        // Update header scroll state
        this.updateHeaderState(deltaY);
      }
      
      this.lastScrollY = currentScrollY;
      this.lastScrollTime = currentTime;
    },

    updateHeaderState(deltaY) {
      const header = document.querySelector('header, .nav, .velocity-header');
      if (!header) return;
      
      // Hide header when scrolling down fast
      if (deltaY > 5 && Math.abs(this.smoothedVelocity) > 10) {
        header.classList.add('scrolling-down');
        header.classList.remove('scrolling-up');
      } else if (deltaY < -5) {
        header.classList.add('scrolling-up');
        header.classList.remove('scrolling-down');
      }
      
      // Add fast-scroll class
      if (Math.abs(this.smoothedVelocity) > 20) {
        header.classList.add('fast-scroll');
        document.body.classList.add('fast-scroll');
      } else {
        header.classList.remove('fast-scroll');
        document.body.classList.remove('fast-scroll');
      }
    },

    applyEffects() {
      const absVelocity = Math.abs(this.smoothedVelocity);
      
      // Update CSS custom properties
      this.containers.forEach(container => {
        container.style.setProperty('--scroll-velocity', this.smoothedVelocity.toFixed(2));
        container.style.setProperty('--scroll-direction', this.direction);
        container.style.setProperty('--velocity-scale', (1 - absVelocity * 0.001).toFixed(4));
      });
      
      // Update momentum indicator
      if (this.momentumIndicator && absVelocity > 5) {
        this.momentumIndicator.classList.add('visible');
        
        const offset = Math.min(50, (this.smoothedVelocity / this.config.maxVelocity) * 50);
        
        if (this.momentumBar) {
          this.momentumBar.style.transform = `translateY(${-Math.abs(Math.min(0, offset))}%)`;
          this.momentumBar.style.setProperty('--momentum-offset', `${-Math.abs(Math.min(0, offset))}%`);
        }
        
        if (this.momentumBarNegative) {
          this.momentumBarNegative.style.transform = `translateY(${Math.abs(Math.max(0, offset))}%)`;
          this.momentumBarNegative.style.setProperty('--momentum-offset', `${Math.abs(Math.max(0, offset))}%`);
        }
      } else if (this.momentumIndicator) {
        this.momentumIndicator.classList.remove('visible');
      }
      
      // Apply velocity-specific classes
      this.applyVelocityClasses();
      
      // Update sections in view
      this.updateSectionsInView();
    },

    applyVelocityClasses() {
      const absVelocity = Math.abs(this.smoothedVelocity);
      
      // Apply velocity-specific classes to elements
      document.querySelectorAll('.velocity-stagger').forEach(el => {
        el.classList.toggle('fast-scroll', absVelocity > 20);
      });
      
      document.querySelectorAll('.velocity-snap-scroll').forEach(el => {
        el.classList.toggle('fast-scroll', absVelocity > 30);
      });
    },

    updateSectionsInView() {
      if (Math.abs(this.smoothedVelocity) > 20) return; // Skip during fast scroll
      
      const viewportCenter = window.scrollY + window.innerHeight / 2;
      
      document.querySelectorAll('.velocity-section-entrance').forEach(section => {
        const rect = section.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2 + window.scrollY;
        const distance = Math.abs(viewportCenter - elementCenter);
        const threshold = window.innerHeight * 0.6;
        
        section.classList.toggle('in-view', distance < threshold);
      });
    },

    startLoop() {
      const loop = () => {
        this.calculateVelocity();
        this.applyEffects();
        
        // Decay velocity when not scrolling
        if (Math.abs(this.smoothedVelocity) > 0.01) {
          this.smoothedVelocity *= 0.95;
        } else {
          this.smoothedVelocity = 0;
        }
        
        this.rafId = requestAnimationFrame(loop);
      };
      
      this.rafId = requestAnimationFrame(loop);
    },

    bindEvents() {
      // Scroll event for velocity calculation
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
      
      // Touch events for mobile velocity
      let touchStartY = 0;
      let touchStartTime = 0;
      
      document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartTime = performance.now();
      }, { passive: true });
      
      document.addEventListener('touchmove', (e) => {
        if (!touchStartY) return;
        
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        const deltaTime = performance.now() - touchStartTime;
        
        if (deltaTime > 0) {
          this.smoothedVelocity = (deltaY / deltaTime) * 16;
          this.direction = this.smoothedVelocity > 0 ? 1 : -1;
        }
        
        touchStartY = touchY;
        touchStartTime = performance.now();
      }, { passive: true });
      
      document.addEventListener('touchend', () => {
        touchStartY = 0;
      }, { passive: true });

      // MutationObserver for dynamic content
      const observer = new MutationObserver((mutations) => {
        let shouldDetect = false;
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            shouldDetect = true;
          }
        });
        
        if (shouldDetect) {
          this.detectContainers();
        }
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
    },

    // Public API
    getVelocity() {
      return this.smoothedVelocity;
    },

    getDirection() {
      return this.direction;
    },

    setMaxVelocity(value) {
      this.config.maxVelocity = value;
    },

    destroy() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
      
      this.containers.forEach(container => {
        container.style.removeProperty('--scroll-velocity');
        container.style.removeProperty('--scroll-direction');
        container.style.removeProperty('--velocity-scale');
      });
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => VelocityAnimations.init());
  } else {
    VelocityAnimations.init();
  }

  window.VelocityAnimations = VelocityAnimations;
})();
