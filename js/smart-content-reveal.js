/**
 * Smart Content Reveal System v87.0 - Fortune 500 Progressive Disclosure
 * Advanced scroll-triggered content reveals with intersection observers
 */

(function() {
  'use strict';

  const SmartContentReveal = {
    observer: null,
    progressDots: [],
    sections: [],
    config: {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
      revealOnce: false
    },

    init(options = {}) {
      this.config = { ...this.config, ...options };
      this.setupObserver();
      this.findRevealItems();
      this.createProgressIndicator();
      this.setupReadingMode();
      this.bindEvents();
      
      // Initial check
      this.checkExistingElements();
      
      console.log('🎯 Smart Content Reveal System initialized');
    },

    setupObserver() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.revealElement(entry.target);
            if (this.config.revealOnce) {
              this.observer.unobserve(entry.target);
            }
          } else if (!this.config.revealOnce) {
            this.hideElement(entry.target);
          }
        });
      }, {
        threshold: this.config.threshold,
        rootMargin: this.config.rootMargin
      });
    },

    findRevealItems() {
      // Find all reveal items
      const items = document.querySelectorAll('.reveal-item, [data-reveal]');
      items.forEach(item => {
        // Add reveal-item class if not present
        if (!item.classList.contains('reveal-item')) {
          item.classList.add('reveal-item');
        }
        this.observer.observe(item);
      });

      // Find cascade reveals and set indices
      document.querySelectorAll('.cascade-reveal').forEach(container => {
        container.querySelectorAll('.reveal-item').forEach((item, index) => {
          item.style.setProperty('--index', index);
        });
      });

      // Find reveal sections
      this.sections = Array.from(document.querySelectorAll('section[data-section], .reveal-section'));
      this.sections.forEach(section => {
        section.classList.add('reveal-section');
        this.observer.observe(section);
      });
    },

    revealElement(element) {
      element.classList.add('revealed');
      element.setAttribute('data-revealed', 'true');
      
      // Update progress dots
      this.updateProgressDots();
      
      // Trigger custom event
      element.dispatchEvent(new CustomEvent('contentRevealed', {
        bubbles: true,
        detail: { element }
      }));
      
      // Cascade parent effect
      if (element.closest('.cascade-reveal')) {
        this.triggerCascade(element);
      }
    },

    hideElement(element) {
      element.classList.remove('revealed');
      element.removeAttribute('data-revealed');
    },

    triggerCascade(element) {
      const container = element.closest('.cascade-reveal');
      if (!container) return;
      
      const siblings = Array.from(container.querySelectorAll('.reveal-item'));
      const index = siblings.indexOf(element);
      
      // Reveal siblings with delay
      siblings.slice(index + 1, index + 4).forEach((sibling, i) => {
        setTimeout(() => {
          sibling.classList.add('revealed');
        }, (i + 1) * 100);
      });
    },

    createProgressIndicator() {
      if (window.matchMedia('(pointer: coarse)').matches) return; // Skip on touch
      
      const progress = document.createElement('div');
      progress.className = 'reveal-progress';
      progress.setAttribute('aria-hidden', 'true');
      
      // Create dots for each section
      this.sections.forEach((section, index) => {
        const dot = document.createElement('button');
        dot.className = 'reveal-progress-dot';
        dot.setAttribute('aria-label', `Jump to ${section.dataset.navLabel || `Section ${index + 1}`}`);
        dot.dataset.index = index;
        
        dot.addEventListener('click', () => {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          dot.classList.add('active');
        });
        
        this.progressDots.push(dot);
        progress.appendChild(dot);
      });
      
      document.body.appendChild(progress);
    },

    updateProgressDots() {
      if (!this.progressDots.length) return;
      
      this.sections.forEach((section, index) => {
        const dot = this.progressDots[index];
        if (!dot) return;
        
        const rect = section.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight * 0.5 && rect.bottom > 0;
        const isRevealed = section.classList.contains('in-view') || section.classList.contains('revealed');
        
        dot.classList.toggle('active', isInView);
        dot.classList.toggle('revealed', isRevealed);
      });
    },

    setupReadingMode() {
      const readingContainers = document.querySelectorAll('.reading-reveal');
      
      readingContainers.forEach(container => {
        const paragraphs = container.querySelectorAll('p, li');
        
        const readingObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reading');
              entry.target.classList.remove('read');
            } else if (entry.boundingClientRect.top < 0) {
              entry.target.classList.remove('reading');
              entry.target.classList.add('read');
            }
          });
        }, { threshold: 0.5 });
        
        paragraphs.forEach(p => readingObserver.observe(p));
      });
    },

    checkExistingElements() {
      // Check for elements already in viewport on load
      document.querySelectorAll('.reveal-item, .reveal-section').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          this.revealElement(el);
        }
      });
    },

    bindEvents() {
      // Update progress on scroll
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.updateProgressDots();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      // Handle dynamic content
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              if (node.matches && node.matches('.reveal-item, [data-reveal]')) {
                this.observer.observe(node);
              }
              if (node.querySelectorAll) {
                node.querySelectorAll('.reveal-item, [data-reveal]').forEach(el => {
                  this.observer.observe(el);
                });
              }
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });

      // Section visibility tracking
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else {
            entry.target.classList.remove('in-view');
          }
        });
      }, { threshold: 0.3 });

      this.sections.forEach(section => sectionObserver.observe(section));
    },

    // Public API
    revealAll() {
      document.querySelectorAll('.reveal-item').forEach(el => this.revealElement(el));
    },

    reset() {
      document.querySelectorAll('.reveal-item').forEach(el => this.hideElement(el));
    },

    setThreshold(value) {
      this.config.threshold = value;
      this.setupObserver();
      this.findRevealItems();
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SmartContentReveal.init());
  } else {
    SmartContentReveal.init();
  }

  // Expose to global
  window.SmartContentReveal = SmartContentReveal;

})();
