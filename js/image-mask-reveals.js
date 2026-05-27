/**
 * Image Mask Reveal Effects v16.0
 * Professional scroll-triggered image reveal animations
 */

(function() {
  'use strict';
  
  const ImageMaskReveals = {
    config: {
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.15,
      once: true
    },
    
    init() {
      this.setupObserver();
      this.findRevealElements();
    },
    
    setupObserver() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.revealElement(entry.target);
            
            if (this.config.once) {
              this.observer.unobserve(entry.target);
            }
          }
        });
      }, {
        rootMargin: this.config.rootMargin,
        threshold: this.config.threshold
      });
    },
    
    findRevealElements() {
      // Find all mask reveal containers
      const maskElements = document.querySelectorAll([
        '.mask-reveal',
        '.mask-reveal--diagonal',
        '.mask-reveal--circle',
        '.mask-reveal--split-h',
        '.mask-reveal--split-v',
        '.mask-reveal--curtain',
        '.mask-reveal--diamond',
        '.mask-reveal--slide-up',
        '.mask-reveal--blinds',
        '.mask-reveal--gradient',
        '.mask-reveal--zoom',
        '.mask-reveal--blocks',
        '.mask-reveal--wave',
        '.mask-reveal--grid',
        '.mask-reveal--shutter'
      ].join(','));
      
      maskElements.forEach(el => {
        // Ensure image is loaded before revealing
        const img = el.querySelector('img');
        if (img) {
          if (img.complete) {
            this.observer.observe(el);
          } else {
            img.addEventListener('load', () => {
              this.observer.observe(el);
            });
            img.addEventListener('error', () => {
              el.classList.add('revealed'); // Show anyway on error
            });
          }
        } else {
          this.observer.observe(el);
        }
      });
      
      // Find text reveal elements
      const textReveals = document.querySelectorAll([
        '.reveal-up',
        '.reveal-fade',
        '.reveal-scale'
      ].join(','));
      
      textReveals.forEach(el => this.observer.observe(el));
    },
    
    revealElement(element) {
      // Add revealed class to trigger CSS animation
      requestAnimationFrame(() => {
        element.classList.add('revealed');
        
        // Emit custom event for other systems
        element.dispatchEvent(new CustomEvent('revealed', {
          bubbles: true,
          detail: { element }
        }));
      });
      
      // Handle staggered children
      if (element.classList.contains('stagger-children')) {
        const children = element.children;
        Array.from(children).forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('revealed');
          }, index * 100);
        });
      }
    },
    
    // Manual reveal method for programmatic control
    reveal(selector) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => this.revealElement(el));
    },
    
    // Reset reveal (for re-animation)
    reset(selector) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.classList.remove('revealed');
        this.observer.observe(el);
      });
    }
  };
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ImageMaskReveals.init());
  } else {
    ImageMaskReveals.init();
  }
  
  // Expose globally
  window.ImageMaskReveals = ImageMaskReveals;
})();
