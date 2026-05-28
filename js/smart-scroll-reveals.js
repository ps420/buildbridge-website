/**
 * v45.0: Smart Scroll-Triggered Reveals
 * Fortune 500 Content Animation System
 */

(function() {
  'use strict';

  class SmartScrollReveals {
    constructor() {
      this.elements = [];
      this.parallaxElements = [];
      this.scrollProgressElements = [];
      this.observer = null;
      this.ticking = false;
      
      this.init();
    }

    init() {
      this.findElements();
      this.createObserver();
      this.bindScroll();
      this.observeElements();
    }

    findElements() {
      // Find all reveal elements
      this.elements = Array.from(document.querySelectorAll('[data-reveal]'));
      
      // Find parallax elements
      this.parallaxElements = Array.from(document.querySelectorAll('[data-parallax]'));
      
      // Find scroll progress elements
      this.scrollProgressElements = Array.from(document.querySelectorAll('[data-scroll-progress]'));
      
      // Find reveal groups
      this.revealGroups = Array.from(document.querySelectorAll('.reveal-group, .cascade-reveal'));
    }

    createObserver() {
      const options = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.revealElement(entry.target);
            
            // Unobserve if not re-triggerable
            if (!entry.target.dataset.revealRepeat) {
              this.observer.unobserve(entry.target);
            }
          } else if (entry.target.dataset.revealRepeat) {
            this.hideElement(entry.target);
          }
        });
      }, options);
    }

    observeElements() {
      // Observe individual elements
      this.elements.forEach(el => {
        // Set initial state
        this.setInitialState(el);
        this.observer.observe(el);
      });

      // Observe groups
      this.revealGroups.forEach(group => {
        this.observer.observe(group);
      });
    }

    setInitialState(el) {
      const direction = el.dataset.reveal || 'up';
      
      // Add reveal class based on type
      switch(direction) {
        case 'up':
          el.style.transform = 'translateY(40px)';
          break;
        case 'down':
          el.style.transform = 'translateY(-40px)';
          break;
        case 'left':
          el.style.transform = 'translateX(40px)';
          break;
        case 'right':
          el.style.transform = 'translateX(-40px)';
          break;
        case 'scale':
          el.style.transform = 'scale(0.9)';
          break;
        case 'scale-up':
          el.style.transform = 'scale(0.8) translateY(40px)';
          break;
        case 'rotate':
          el.style.transform = 'rotate(-5deg) translateY(40px)';
          break;
        case 'blur':
          el.style.filter = 'blur(10px)';
          break;
        case 'clip-left':
          el.style.clipPath = 'inset(0 100% 0 0)';
          break;
        case 'clip-right':
          el.style.clipPath = 'inset(0 0 0 100%)';
          break;
        case 'clip-up':
          el.style.clipPath = 'inset(100% 0 0 0)';
          break;
        case 'clip-down':
          el.style.clipPath = 'inset(0 0 100% 0)';
          break;
        case 'clip-center':
          el.style.clipPath = 'inset(50%)';
          break;
        case 'fade':
        default:
          // Just fade, no transform
          break;
      }
      
      el.style.opacity = '0';
    }

    revealElement(el) {
      // Add revealed class
      el.classList.add('revealed');
      
      // Trigger custom event
      el.dispatchEvent(new CustomEvent('reveal', { 
        bubbles: true,
        detail: { element: el }
      }));

      // Handle reveal groups
      if (el.classList.contains('reveal-group') || el.classList.contains('cascade-reveal')) {
        el.classList.add('revealed');
      }

      // Handle image reveal wrappers
      if (el.classList.contains('image-reveal-wrapper')) {
        el.classList.add('revealed');
      }
    }

    hideElement(el) {
      el.classList.remove('revealed');
      this.setInitialState(el);
    }

    bindScroll() {
      let scrollTimeout;
      
      window.addEventListener('scroll', () => {
        if (!this.ticking) {
          requestAnimationFrame(() => {
            this.handleScroll();
            this.ticking = false;
          });
          this.ticking = true;
        }
        
        // Clear existing timeout
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.handleScrollEnd();
        }, 150);
      }, { passive: true });
    }

    handleScroll() {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Update parallax elements
      this.parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        const rect = el.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;
        const distance = (centerY - viewportCenter) * speed;
        
        el.style.transform = `translateY(${distance}px)`;
      });

      // Update scroll progress elements
      this.scrollProgressElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top;
        const elementHeight = rect.height;
        
        // Calculate progress through element
        let progress = (windowHeight - elementTop) / (windowHeight + elementHeight);
        progress = Math.max(0, Math.min(1, progress));
        
        // Update CSS custom property
        el.style.setProperty('--scroll-progress', progress);
        
        // Update progress line if present
        const progressLine = el.querySelector('.scroll-progress-line');
        if (progressLine) {
          progressLine.style.height = `${progress * 100}%`;
        }
      });
    }

    handleScrollEnd() {
      // Any cleanup after scroll stops
    }

    // Public API methods
    reveal(el) {
      this.revealElement(el);
    }

    hide(el) {
      this.hideElement(el);
    }

    refresh() {
      this.findElements();
      this.observeElements();
    }

    // Batch reveal for dynamic content
    revealBatch(els) {
      els.forEach((el, i) => {
        setTimeout(() => {
          this.revealElement(el);
        }, i * 100);
      });
    }
  }

  // Image Reveal Handler
  class ImageReveal {
    constructor(wrapper) {
      this.wrapper = wrapper;
      this.init();
    }

    init() {
      // Ensure wrapper has proper classes
      this.wrapper.classList.add('image-reveal-wrapper');
      
      // Create overlay if not exists
      if (!this.wrapper.querySelector('.image-reveal-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'image-reveal-overlay';
        this.wrapper.appendChild(overlay);
      }

      // Observe for reveal
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.wrapper.classList.add('revealed');
            observer.unobserve(this.wrapper);
          }
        });
      }, { threshold: 0.3 });

      observer.observe(this.wrapper);
    }
  }

  // Initialize everything
  function init() {
    // Create global instance
    window.scrollReveals = new SmartScrollReveals();

    // Initialize image reveals
    document.querySelectorAll('[data-image-reveal]').forEach(wrapper => {
      new ImageReveal(wrapper);
    });

    // Handle dynamically added content
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            // Check for reveal elements
            if (node.matches && node.matches('[data-reveal]')) {
              window.scrollReveals.setInitialState(node);
              window.scrollReveals.observer.observe(node);
            }
            
            // Check children
            const revealChildren = node.querySelectorAll && node.querySelectorAll('[data-reveal]');
            if (revealChildren) {
              revealChildren.forEach(el => {
                window.scrollReveals.setInitialState(el);
                window.scrollReveals.observer.observe(el);
              });
            }
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.SmartScrollReveals = SmartScrollReveals;
  window.ImageReveal = ImageReveal;
})();
