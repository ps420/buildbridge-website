/**
 * v88.0: Scroll Section Dots Navigation
 * Fortune 500 Quality Section Navigation Indicator
 */

(function() {
  'use strict';

  class ScrollSectionDots {
    constructor(options = {}) {
      this.options = {
        container: options.container || document.body,
        sections: options.sections || '[data-section]',
        offset: options.offset || 100,
        style: options.style || 'dots', // dots, lines, numbers, minimal
        showLabels: options.showLabels !== undefined ? options.showLabels : true,
        mobileBottom: options.mobileBottom !== undefined ? options.mobileBottom : true,
        ...options
      };
      
      this.sections = [];
      this.currentSection = 0;
      this.nav = null;
      this.isScrolling = false;
      
      this.init();
    }

    init() {
      this.findSections();
      this.createNavigation();
      this.bindEvents();
      this.updateActiveSection();
    }

    findSections() {
      const sectionElements = document.querySelectorAll(this.options.sections);
      this.sections = Array.from(sectionElements).map((el, index) => ({
        element: el,
        id: el.id || `section-${index}`,
        label: el.dataset.navLabel || el.dataset.section || `Section ${index + 1}`,
        offset: 0
      }));
    }

    createNavigation() {
      // Main container
      this.nav = document.createElement('nav');
      this.nav.className = `scroll-section-${this.options.style}`;
      this.nav.setAttribute('aria-label', 'Page sections');
      this.nav.style.opacity = '0';
      this.nav.style.visibility = 'hidden';

      // Create navigation items
      this.sections.forEach((section, index) => {
        const item = this.createNavItem(section, index);
        this.nav.appendChild(item);
      });

      this.options.container.appendChild(this.nav);

      // Create mobile bottom nav if enabled
      if (this.options.mobileBottom && window.innerWidth <= 768) {
        this.createMobileNav();
      }

      // Show after a delay
      setTimeout(() => {
        this.nav.classList.add('visible');
      }, 1000);
    }

    createNavItem(section, index) {
      const item = document.createElement('button');
      item.className = this.options.style === 'dots' ? 'scroll-dot' : 
                       this.options.style === 'lines' ? 'scroll-line' :
                       this.options.style === 'numbers' ? 'scroll-number' : 'scroll-dot-mini';
      
      item.setAttribute('data-index', index);
      item.setAttribute('aria-label', `Go to ${section.label}`);
      item.setAttribute('type', 'button');

      // Add index for numbers style
      if (this.options.style === 'numbers') {
        item.textContent = (index + 1).toString().padStart(2, '0');
      }

      // Add label
      if (this.options.showLabels && this.options.style !== 'minimal') {
        const label = document.createElement('span');
        label.className = `${this.options.style === 'dots' ? 'scroll-dot-label' :
                          this.options.style === 'lines' ? 'scroll-line-label' : 'scroll-number-label'}`;
        label.textContent = section.label;
        item.appendChild(label);
      }

      // Add progress ring for dots style
      if (this.options.style === 'dots') {
        const progress = document.createElement('div');
        progress.className = 'scroll-dot-progress';
        progress.innerHTML = '<div class="scroll-dot-progress-inner"></div>';
        item.appendChild(progress);
      }

      // Click handler
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToSection(index);
      });

      return item;
    }

    createMobileNav() {
      this.mobileNav = document.createElement('nav');
      this.mobileNav.className = 'scroll-section-dots-mobile';
      this.mobileNav.setAttribute('aria-label', 'Page sections mobile');

      this.sections.forEach((section, index) => {
        const dot = document.createElement('button');
        dot.className = 'scroll-dot';
        dot.setAttribute('data-index', index);
        dot.setAttribute('aria-label', `Go to ${section.label}`);
        dot.setAttribute('type', 'button');
        dot.addEventListener('click', () => this.scrollToSection(index));
        this.mobileNav.appendChild(dot);
      });

      document.body.appendChild(this.mobileNav);

      setTimeout(() => {
        this.mobileNav.classList.add('visible');
      }, 1000);
    }

    bindEvents() {
      // Scroll event with throttle
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            if (!this.isScrolling) {
              this.updateActiveSection();
            }
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
          e.preventDefault();
          this.navigateToSection('next');
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          e.preventDefault();
          this.navigateToSection('prev');
        }
      });

      // Resize handler
      window.addEventListener('resize', () => {
        this.updateSectionOffsets();
      }, { passive: true });

      // Initial offset calculation
      this.updateSectionOffsets();
    }

    updateSectionOffsets() {
      this.sections.forEach(section => {
        section.offset = section.element.offsetTop - this.options.offset;
      });
    }

    updateActiveSection() {
      const scrollPos = window.scrollY;
      let activeIndex = 0;

      // Find current section
      for (let i = 0; i < this.sections.length; i++) {
        if (scrollPos >= this.sections[i].offset - window.innerHeight / 3) {
          activeIndex = i;
        }
      }

      // Calculate progress within section
      const currentSection = this.sections[activeIndex];
      const sectionHeight = currentSection.element.offsetHeight;
      const progressInSection = Math.min(
        100,
        Math.max(
          0,
          ((scrollPos - currentSection.offset + window.innerHeight / 3) / sectionHeight) * 100
        )
      );

      // Update active state
      if (activeIndex !== this.currentSection) {
        this.currentSection = activeIndex;
        this.highlightActiveSection();
      }

      // Update progress
      this.updateProgress(activeIndex, progressInSection);
    }

    highlightActiveSection() {
      const items = this.nav.querySelectorAll('button');
      items.forEach((item, index) => {
        if (index === this.currentSection) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // Update mobile nav if exists
      if (this.mobileNav) {
        const mobileItems = this.mobileNav.querySelectorAll('button');
        mobileItems.forEach((item, index) => {
          if (index === this.currentSection) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    }

    updateProgress(index, progress) {
      const items = this.nav.querySelectorAll('button');
      const currentItem = items[index];
      
      if (currentItem && this.options.style === 'dots') {
        const progressEl = currentItem.querySelector('.scroll-dot-progress');
        if (progressEl) {
          progressEl.style.setProperty('--progress', `${progress}%`);
        }
      }

      // Update line progress
      if (this.options.style === 'lines') {
        items.forEach((item, i) => {
          if (i < index) {
            item.style.setProperty('--progress', '100%');
          } else if (i === index) {
            item.style.setProperty('--progress', `${progress}%`);
          } else {
            item.style.setProperty('--progress', '0%');
          }
        });
      }
    }

    scrollToSection(index) {
      if (index < 0 || index >= this.sections.length) return;

      this.isScrolling = true;
      const section = this.sections[index];
      
      window.scrollTo({
        top: section.offset + 50,
        behavior: 'smooth'
      });

      // Reset scrolling flag after animation
      setTimeout(() => {
        this.isScrolling = false;
        this.currentSection = index;
        this.highlightActiveSection();
      }, 800);
    }

    navigateToSection(direction) {
      let newIndex;
      if (direction === 'next') {
        newIndex = Math.min(this.currentSection + 1, this.sections.length - 1);
      } else {
        newIndex = Math.max(this.currentSection - 1, 0);
      }
      this.scrollToSection(newIndex);
    }

    destroy() {
      if (this.nav) {
        this.nav.remove();
      }
      if (this.mobileNav) {
        this.mobileNav.remove();
      }
    }

    // Public method to refresh sections
    refresh() {
      this.findSections();
      this.nav.innerHTML = '';
      this.sections.forEach((section, index) => {
        const item = this.createNavItem(section, index);
        this.nav.appendChild(item);
      });
      this.updateSectionOffsets();
      this.highlightActiveSection();
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.scrollSectionDots = new ScrollSectionDots({
        style: 'dots',
        showLabels: true,
        offset: 150
      });
    });
  } else {
    window.scrollSectionDots = new ScrollSectionDots({
      style: 'dots',
      showLabels: true,
      offset: 150
    });
  }

  // Export
  window.ScrollSectionDots = ScrollSectionDots;

})();
