/**
 * Smart ScrollSpy v2 v120.2
 * Fortune 500 Quality Section Navigation
 */

(function() {
  'use strict';

  class SmartScrollSpy {
    constructor(options = {}) {
      this.options = {
        offset: options.offset || 100,
        threshold: options.threshold || 0.3,
        smoothScroll: options.smoothScroll !== false,
        navClass: options.navClass || 'scrollspy-nav-v2',
        ...options
      };
      
      this.sections = [];
      this.navElement = null;
      this.activeIndex = -1;
      this.isScrolling = false;
      
      this.init();
    }

    init() {
      // Find all sections with data-section
      this.sections = Array.from(document.querySelectorAll('[data-section]'));
      
      if (this.sections.length === 0) return;
      
      // Create navigation
      this.createNavigation();
      
      // Bind events
      this.bindEvents();
      
      // Initial check
      this.updateActiveSection();
    }

    createNavigation() {
      // Check for existing nav or create new
      this.navElement = document.querySelector(`.${this.options.navClass}`);
      
      if (!this.navElement) {
        this.navElement = document.createElement('nav');
        this.navElement.className = this.options.navClass;
        this.navElement.setAttribute('aria-label', 'Page sections');
        document.body.appendChild(this.navElement);
      }
      
      // Clear existing
      this.navElement.innerHTML = '';
      
      // Create dots
      this.sections.forEach((section, index) => {
        const dot = document.createElement('button');
        dot.className = 'scrollspy-dot';
        dot.setAttribute('data-index', index);
        dot.setAttribute('aria-label', `Go to ${section.dataset.navLabel || section.dataset.section}`);
        dot.setAttribute('data-label', section.dataset.navLabel || section.dataset.section);
        
        if (section.dataset.sectionIcon) {
          dot.setAttribute('data-icon', section.dataset.sectionIcon);
        }
        
        dot.addEventListener('click', () => this.scrollToSection(index));
        
        this.navElement.appendChild(dot);
      });
      
      this.dots = this.navElement.querySelectorAll('.scrollspy-dot');
    }

    bindEvents() {
      // Scroll handler with throttle
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.updateActiveSection();
            this.updateReadingProgress();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
      
      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' && e.ctrlKey) {
          e.preventDefault();
          this.navigateNext();
        } else if (e.key === 'ArrowUp' && e.ctrlKey) {
          e.preventDefault();
          this.navigatePrev();
        }
      });
      
      // Show/hide on scroll direction
      this.lastScrollY = window.scrollY;
      this.scrollDirection = 'down';
    }

    updateActiveSection() {
      const scrollPosition = window.scrollY + this.options.offset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      let newActiveIndex = -1;
      
      // Find active section
      this.sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionMiddle = sectionTop + sectionHeight / 2;
        
        // Check if section is in viewport
        if (rect.top <= windowHeight * this.options.threshold && 
            rect.bottom >= windowHeight * 0.1) {
          newActiveIndex = index;
        }
      });
      
      // Handle last section
      if (scrollPosition + windowHeight >= documentHeight - 50) {
        newActiveIndex = this.sections.length - 1;
      }
      
      // Update if changed
      if (newActiveIndex !== -1 && newActiveIndex !== this.activeIndex) {
        this.setActiveIndex(newActiveIndex);
      }
      
      // Show/hide nav based on scroll
      this.toggleNavVisibility();
    }

    setActiveIndex(index) {
      // Remove active from old
      if (this.activeIndex !== -1 && this.dots[this.activeIndex]) {
        this.dots[this.activeIndex].classList.remove('active');
        this.sections[this.activeIndex].classList.remove('section-active');
      }
      
      // Add active to new
      this.activeIndex = index;
      this.dots[index].classList.add('active');
      this.sections[index].classList.add('section-active');
      
      // Trigger custom event
      this.sections[index].dispatchEvent(new CustomEvent('section:active', {
        detail: { index, section: this.sections[index] }
      }));
    }

    toggleNavVisibility() {
      const currentScrollY = window.scrollY;
      const heroHeight = this.sections[0]?.offsetHeight || 500;
      
      // Show after hero section
      if (currentScrollY > heroHeight * 0.5) {
        this.navElement.classList.remove('hidden');
      } else {
        this.navElement.classList.add('hidden');
      }
    }

    scrollToSection(index) {
      if (index < 0 || index >= this.sections.length) return;
      
      this.isScrolling = true;
      const section = this.sections[index];
      const targetPosition = section.offsetTop - this.options.offset + 50;
      
      // Temporarily disable scroll updates
      this.setActiveIndex(index);
      
      if (this.options.smoothScroll) {
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo(0, targetPosition);
      }
      
      // Re-enable after animation
      setTimeout(() => {
        this.isScrolling = false;
      }, 800);
    }

    navigateNext() {
      if (this.activeIndex < this.sections.length - 1) {
        this.scrollToSection(this.activeIndex + 1);
      }
    }

    navigatePrev() {
      if (this.activeIndex > 0) {
        this.scrollToSection(this.activeIndex - 1);
      }
    }

    updateReadingProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      // Update progress bar if exists
      const progressBar = document.querySelector('.scrollspy-reading-progress .progress-bar');
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
      
      // Update progress ring if exists
      const progressRing = document.querySelector('.scrollspy-progress-ring .progress');
      if (progressRing) {
        const circumference = 2 * Math.PI * 38;
        const offset = circumference - (progress / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;
      }
    }

    // Public API
    refresh() {
      this.init();
    }

    destroy() {
      if (this.navElement) {
        this.navElement.remove();
      }
    }
  }

  // Initialize on DOM ready
  function init() {
    // Auto-initialize if sections exist
    if (document.querySelectorAll('[data-section]').length > 0) {
      window.scrollSpy = new SmartScrollSpy();
    }
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose globally
  window.SmartScrollSpy = SmartScrollSpy;
})();
