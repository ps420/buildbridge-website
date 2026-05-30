/**
 * v90.0: Section Progress Indicators
 * Individual progress bars for each major section
 */

(function() {
  'use strict';

  class SectionProgressIndicators {
    constructor(options = {}) {
      this.options = {
        selector: '[data-section]',
        trackerPosition: 'left', // 'left', 'right', 'dots', 'rings'
        showLabels: true,
        offset: 100,
        ...options
      };
      
      this.sections = [];
      this.currentSection = null;
      this.tracker = null;
      this.sectionProgressBars = new Map();
      
      this.init();
    }

    init() {
      this.findSections();
      if (this.sections.length === 0) return;
      
      this.createTracker();
      this.bindEvents();
      this.updateProgress();
    }

    findSections() {
      const sectionElements = document.querySelectorAll(this.options.selector);
      this.sections = Array.from(sectionElements).map((el, index) => ({
        element: el,
        id: el.id || `section-${index}`,
        label: el.dataset.navLabel || el.dataset.section || `Section ${index + 1}`,
        index
      }));
    }

    createTracker() {
      const existing = document.querySelector('.section-progress-tracker, .section-progress-ring-container, .section-dots-minimal');
      if (existing) existing.remove();

      switch(this.options.trackerPosition) {
        case 'left':
          this.createLeftTracker();
          break;
        case 'right':
          this.createRingTracker();
          break;
        case 'dots':
          this.createDotTracker();
          break;
        default:
          this.createLeftTracker();
      }
    }

    createLeftTracker() {
      this.tracker = document.createElement('div');
      this.tracker.className = 'section-progress-tracker';
      
      this.sections.forEach((section, index) => {
        const item = document.createElement('div');
        item.className = 'section-progress-item';
        item.dataset.index = index;
        
        const dot = document.createElement('div');
        dot.className = 'section-progress-dot';
        
        item.appendChild(dot);
        
        if (this.options.showLabels) {
          const label = document.createElement('span');
          label.className = 'section-progress-label';
          label.textContent = section.label;
          item.appendChild(label);
        }
        
        item.addEventListener('click', () => this.scrollToSection(index));
        this.tracker.appendChild(item);
      });
      
      document.body.appendChild(this.tracker);
    }

    createRingTracker() {
      this.tracker = document.createElement('div');
      this.tracker.className = 'section-progress-ring-container';
      
      this.sections.forEach((section, index) => {
        const ring = document.createElement('div');
        ring.className = 'section-progress-ring';
        ring.dataset.index = index;
        
        const svg = `
          <svg viewBox="0 0 44 44">
            <circle class="section-progress-ring-bg" cx="22" cy="22" r="20"></circle>
            <circle class="section-progress-ring-fill" cx="22" cy="22" r="20"></circle>
          </svg>
          <span class="section-progress-ring-icon">${index + 1}</span>
        `;
        
        ring.innerHTML = svg;
        
        if (this.options.showLabels) {
          const label = document.createElement('span');
          label.className = 'section-progress-ring-label';
          label.textContent = section.label;
          ring.appendChild(label);
        }
        
        ring.addEventListener('click', () => this.scrollToSection(index));
        this.tracker.appendChild(ring);
      });
      
      document.body.appendChild(this.tracker);
    }

    createDotTracker() {
      this.tracker = document.createElement('div');
      this.tracker.className = 'section-dots-minimal';
      
      this.sections.forEach((section, index) => {
        const dot = document.createElement('div');
        dot.className = 'section-dot-minimal';
        dot.dataset.index = index;
        dot.dataset.label = section.label;
        dot.addEventListener('click', () => this.scrollToSection(index));
        this.tracker.appendChild(dot);
      });
      
      document.body.appendChild(this.tracker);
    }

    createSectionProgressBar(section) {
      if (section.element.querySelector('.section-scroll-progress')) return;
      
      const progress = document.createElement('div');
      progress.className = 'section-scroll-progress';
      
      const bar = document.createElement('div');
      bar.className = 'section-scroll-progress-bar';
      
      progress.appendChild(bar);
      section.element.style.position = 'relative';
      section.element.insertBefore(progress, section.element.firstChild);
      
      this.sectionProgressBars.set(section.id, bar);
    }

    bindEvents() {
      window.addEventListener('scroll', this.throttle(() => {
        this.updateProgress();
      }, 16));
      
      window.addEventListener('resize', this.debounce(() => {
        this.findSections();
      }, 250));
    }

    updateProgress() {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      
      let activeIndex = 0;
      
      this.sections.forEach((section, index) => {
        const rect = section.element.getBoundingClientRect();
        const sectionTop = rect.top + scrollTop;
        const sectionHeight = rect.height;
        
        // Calculate section visibility
        const sectionProgress = Math.max(0, Math.min(1, 
          (scrollTop + windowHeight - sectionTop) / (windowHeight + sectionHeight)
        ));
        
        // Update section progress bar
        const progressBar = this.sectionProgressBars.get(section.id);
        if (progressBar) {
          progressBar.style.transform = `scaleX(${sectionProgress})`;
        }
        
        // Determine active section
        if (rect.top <= this.options.offset + 200) {
          activeIndex = index;
        }
        
        // Update ring progress
        if (this.options.trackerPosition === 'right') {
          const rings = this.tracker?.querySelectorAll('.section-progress-ring');
          const ring = rings?.[index];
          if (ring) {
            const fill = ring.querySelector('.section-progress-ring-fill');
            if (fill) {
              const circumference = 2 * Math.PI * 20;
              const offset = circumference - (sectionProgress * circumference);
              fill.style.strokeDashoffset = offset;
            }
          }
        }
        
        // Mark as viewed
        if (sectionProgress > 0.5) {
          this.markAsViewed(index);
        }
      });
      
      this.setActiveSection(activeIndex);
    }

    setActiveSection(index) {
      if (this.currentSection === index) return;
      this.currentSection = index;
      
      const items = this.tracker?.querySelectorAll(
        '.section-progress-item, .section-progress-ring, .section-dot-minimal'
      );
      
      items?.forEach((item, i) => {
        item.classList.toggle('active', i === index);
      });
    }

    markAsViewed(index) {
      const items = this.tracker?.querySelectorAll(
        '.section-progress-item, .section-progress-ring, .section-dot-minimal'
      );
      
      items?.forEach((item, i) => {
        if (i < index) {
          item.classList.add('viewed', 'completed');
        }
      });
    }

    scrollToSection(index) {
      const section = this.sections[index];
      if (!section) return;
      
      const offsetTop = section.element.offsetTop - this.options.offset;
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }

    throttle(fn, wait) {
      let lastTime = 0;
      return function(...args) {
        const now = Date.now();
        if (now - lastTime >= wait) {
          lastTime = now;
          fn.apply(this, args);
        }
      };
    }

    debounce(fn, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), wait);
      };
    }

    destroy() {
      this.tracker?.remove();
      this.sectionProgressBars.forEach(bar => bar.parentElement?.remove());
      this.sectionProgressBars.clear();
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.sectionProgress = new SectionProgressIndicators();
    });
  } else {
    window.sectionProgress = new SectionProgressIndicators();
  }
})();
