/**
 * Smart Scroll Spy Navigation v80.0
 * Fortune 500 Active Section Highlighting
 */

(function() {
  'use strict';
  
  const ScrollSpy = {
    options: {
      offset: 100,              // Offset from top for active detection
      throttle: 50,             // Scroll event throttle (ms)
      highlightFirst: true,     // Highlight first section on load
      updateHash: false,        // Update URL hash on scroll
      smoothScroll: true        // Smooth scroll on click
    },
    
    state: {
      sections: [],
      navItems: [],
      currentSection: null,
      isScrolling: false,
      progress: 0
    },
    
    init(options = {}) {
      this.options = { ...this.options, ...options };
      
      // Find all sections with data-nav-label
      this.state.sections = Array.from(document.querySelectorAll('[data-nav-label]'));
      
      if (this.state.sections.length === 0) return;
      
      this.createNav();
      this.bindEvents();
      this.updateActiveSection();
      
      // Show nav after delay
      setTimeout(() => {
        const nav = document.querySelector('.scroll-spy-nav');
        if (nav) nav.classList.add('visible');
      }, 1000);
    },
    
    createNav() {
      // Remove existing nav
      const existingNav = document.querySelector('.scroll-spy-nav');
      if (existingNav) existingNav.remove();
      
      const nav = document.createElement('nav');
      nav.className = 'scroll-spy-nav';
      nav.setAttribute('aria-label', 'Page sections');
      
      // Progress bar
      const progress = document.createElement('div');
      progress.className = 'scroll-spy-progress';
      const progressFill = document.createElement('div');
      progressFill.className = 'scroll-spy-progress-fill';
      progress.appendChild(progressFill);
      nav.appendChild(progress);
      
      // Create nav items
      this.state.sections.forEach((section, index) => {
        const label = section.getAttribute('data-nav-label') || `Section ${index + 1}`;
        const sectionId = section.id || `section-${index}`;
        
        // Ensure section has ID for anchor links
        if (!section.id) section.id = sectionId;
        
        const item = document.createElement('button');
        item.className = 'scroll-spy-item';
        item.setAttribute('data-section', sectionId);
        item.setAttribute('aria-label', `Navigate to ${label}`);
        
        const dot = document.createElement('span');
        dot.className = 'scroll-spy-dot';
        
        const labelSpan = document.createElement('span');
        labelSpan.className = 'scroll-spy-label';
        labelSpan.textContent = label;
        
        item.appendChild(dot);
        item.appendChild(labelSpan);
        nav.appendChild(item);
        
        // Store reference
        this.state.navItems.push({
          element: item,
          section: section,
          id: sectionId
        });
        
        // Click handler
        item.addEventListener('click', (e) => {
          e.preventDefault();
          this.scrollToSection(section);
        });
      });
      
      // Section counter
      const counter = document.createElement('div');
      counter.className = 'scroll-spy-counter';
      counter.innerHTML = `<span class="current">1</span> / ${this.state.sections.length}`;
      nav.appendChild(counter);
      
      document.body.appendChild(nav);
    },
    
    bindEvents() {
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.updateActiveSection();
            this.updateProgress();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
      
      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' && e.altKey) {
          e.preventDefault();
          this.navigateNext();
        } else if (e.key === 'ArrowUp' && e.altKey) {
          e.preventDefault();
          this.navigatePrev();
        }
      });
    },
    
    updateActiveSection() {
      const scrollPos = window.scrollY + this.options.offset + window.innerHeight / 3;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      let activeFound = false;
      let activeIndex = 0;
      
      // Find active section
      for (let i = 0; i < this.state.sections.length; i++) {
        const section = this.state.sections[i];
        const rect = section.getBoundingClientRect();
        const sectionTop = window.scrollY + rect.top;
        const sectionBottom = sectionTop + rect.height;
        
        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
          this.setActiveSection(i);
          activeFound = true;
          activeIndex = i;
          break;
        }
      }
      
      // If at bottom, activate last section
      if (!activeFound && window.scrollY >= docHeight - 50) {
        this.setActiveSection(this.state.sections.length - 1);
        activeIndex = this.state.sections.length - 1;
      }
      
      // Update counter
      const counter = document.querySelector('.scroll-spy-counter .current');
      if (counter) counter.textContent = activeIndex + 1;
    },
    
    setActiveSection(index) {
      this.state.navItems.forEach((item, i) => {
        if (i === index) {
          item.element.classList.add('active');
        } else {
          item.element.classList.remove('active');
        }
      });
      
      this.state.currentSection = this.state.sections[index];
    },
    
    updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      
      const progressFill = document.querySelector('.scroll-spy-progress-fill');
      if (progressFill) {
        progressFill.style.height = `${Math.min(100, Math.max(0, progress))}%`;
      }
    },
    
    scrollToSection(section) {
      const offset = 80; // Header offset
      const rect = section.getBoundingClientRect();
      const targetPos = window.scrollY + rect.top - offset;
      
      this.state.isScrolling = true;
      
      window.scrollTo({
        top: targetPos,
        behavior: 'smooth'
      });
      
      // Reset scrolling flag
      setTimeout(() => {
        this.state.isScrolling = false;
      }, 800);
      
      // Update hash if enabled
      if (this.options.updateHash && section.id) {
        history.pushState(null, null, `#${section.id}`);
      }
    },
    
    navigateNext() {
      const currentIndex = this.state.navItems.findIndex(
        item => item.element.classList.contains('active')
      );
      
      if (currentIndex < this.state.navItems.length - 1) {
        this.scrollToSection(this.state.sections[currentIndex + 1]);
      }
    },
    
    navigatePrev() {
      const currentIndex = this.state.navItems.findIndex(
        item => item.element.classList.contains('active')
      );
      
      if (currentIndex > 0) {
        this.scrollToSection(this.state.sections[currentIndex - 1]);
      }
    },
    
    // Public API
    refresh() {
      this.state.sections = Array.from(document.querySelectorAll('[data-nav-label]'));
      this.state.navItems = [];
      this.createNav();
      this.updateActiveSection();
    },
    
    destroy() {
      const nav = document.querySelector('.scroll-spy-nav');
      if (nav) nav.remove();
      this.state.sections = [];
      this.state.navItems = [];
    }
  };
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ScrollSpy.init());
  } else {
    ScrollSpy.init();
  }
  
  // Expose to global scope
  window.BuildBridgeScrollSpy = ScrollSpy;
})();
