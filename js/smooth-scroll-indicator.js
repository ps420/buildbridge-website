/**
 * v90.0: Smooth Scroll Indicator
 * Context-aware scroll progress and navigation
 */

(function() {
  'use strict';

  class SmoothScrollIndicator {
    constructor(options = {}) {
      this.options = {
        showScrollProgress: true,
        showCircleProgress: true,
        showSectionAware: true,
        showScrollTop: true,
        ...options
      };
      
      this.sections = [];
      this.currentSection = null;
      this.progressBar = null;
      this.circleProgress = null;
      this.sectionAware = null;
      this.scrollTopBtn = null;
      
      this.init();
    }

    init() {
      if (this.options.showScrollProgress) this.createScrollProgress();
      if (this.options.showCircleProgress) this.createCircleProgress();
      if (this.options.showSectionAware) this.createSectionAware();
      if (this.options.showScrollTop) this.createScrollTopButton();
      
      this.findSections();
      this.bindEvents();
      this.updateProgress();
    }

    findSections() {
      this.sections = Array.from(document.querySelectorAll('[data-section]')).map(el => ({
        element: el,
        id: el.id,
        label: el.dataset.navLabel || el.dataset.section || el.id
      }));
    }

    createScrollProgress() {
      // Check if exists
      if (document.querySelector('.scroll-progress-top')) return;
      
      const bar = document.createElement('div');
      bar.className = 'scroll-progress-top';
      bar.innerHTML = '<div class="scroll-progress-bar-top"></div>';
      
      document.body.appendChild(bar);
      this.progressBar = bar.querySelector('.scroll-progress-bar-top');
    }

    createCircleProgress() {
      if (document.querySelector('.scroll-progress-circle')) return;
      
      const circle = document.createElement('div');
      circle.className = 'scroll-progress-circle';
      circle.innerHTML = `
        <svg viewBox="0 0 60 60">
          <circle class="scroll-progress-circle-bg" cx="30" cy="30" r="28"></circle>
          <circle class="scroll-progress-circle-fill" cx="30" cy="30" r="28"></circle>
        </svg>
        <span class="scroll-progress-percentage">0%</span>
      `;
      
      document.body.appendChild(circle);
      this.circleProgress = {
        container: circle,
        fill: circle.querySelector('.scroll-progress-circle-fill'),
        text: circle.querySelector('.scroll-progress-percentage')
      };
    }

    createSectionAware() {
      if (document.querySelector('.section-scroll-aware')) return;
      
      const widget = document.createElement('div');
      widget.className = 'section-scroll-aware hidden';
      widget.innerHTML = `
        <div class="section-aware-info">
          <span class="section-aware-label">Current Section</span>
          <span class="section-aware-name">Overview</span>
        </div>
        <div class="section-aware-progress">
          <div class="section-aware-progress-bar"></div>
        </div>
      `;
      
      document.body.appendChild(widget);
      this.sectionAware = {
        container: widget,
        name: widget.querySelector('.section-aware-name'),
        progressBar: widget.querySelector('.section-aware-progress-bar')
      };
    }

    createScrollTopButton() {
      if (document.querySelector('.scroll-top-progress')) return;
      
      const btn = document.createElement('button');
      btn.className = 'scroll-top-progress';
      btn.setAttribute('aria-label', 'Scroll to top');
      btn.innerHTML = `
        <svg viewBox="0 0 56 56">
          <circle class="scroll-top-progress-circle" cx="28" cy="28" r="26"></circle>
          <circle class="scroll-top-progress-fill" cx="28" cy="28" r="26"></circle>
        </svg>
        <span class="scroll-top-progress-icon">↑</span>
      `;
      
      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      
      document.body.appendChild(btn);
      this.scrollTopBtn = {
        element: btn,
        fill: btn.querySelector('.scroll-top-progress-fill')
      };
    }

    bindEvents() {
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.updateProgress();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
      
      // Show/hide scroll to top
      if (this.scrollTopBtn) {
        window.addEventListener('scroll', this.throttle(() => {
          if (window.pageYOffset > 500) {
            this.scrollTopBtn.element.classList.add('visible');
          } else {
            this.scrollTopBtn.element.classList.remove('visible');
          }
        }, 100), { passive: true });
      }
    }

    updateProgress() {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      
      // Update top progress bar
      if (this.progressBar) {
        this.progressBar.style.transform = `scaleX(${scrollPercent / 100})`;
      }
      
      // Update circle progress
      if (this.circleProgress) {
        const circumference = 2 * Math.PI * 28;
        const offset = circumference - (scrollPercent / 100) * circumference;
        this.circleProgress.fill.style.strokeDashoffset = offset;
        this.circleProgress.text.textContent = `${Math.round(scrollPercent)}%`;
      }
      
      // Update section aware widget
      this.updateSectionAware(scrollTop, scrollPercent);
      
      // Update scroll to top progress
      if (this.scrollTopBtn) {
        const circumference = 2 * Math.PI * 26;
        const offset = circumference - (scrollPercent / 100) * circumference;
        this.scrollTopBtn.fill.style.strokeDashoffset = offset;
      }
    }

    updateSectionAware(scrollTop, totalProgress) {
      if (!this.sectionAware || this.sections.length === 0) return;
      
      let activeSection = null;
      let sectionProgress = 0;
      
      for (let i = 0; i < this.sections.length; i++) {
        const section = this.sections[i];
        const rect = section.element.getBoundingClientRect();
        const sectionTop = rect.top + scrollTop;
        const sectionHeight = rect.height;
        
        if (scrollTop + 200 >= sectionTop) {
          activeSection = section;
          const sectionScroll = scrollTop - sectionTop + 200;
          sectionProgress = Math.min(100, Math.max(0, (sectionScroll / sectionHeight) * 100));
        }
      }
      
      if (activeSection) {
        if (this.currentSection !== activeSection.id) {
          this.currentSection = activeSection.id;
          this.sectionAware.name.textContent = activeSection.label;
          this.animateSectionChange();
        }
        
        this.sectionAware.progressBar.style.width = `${sectionProgress}%`;
        this.sectionAware.container.classList.remove('hidden');
      } else if (totalProgress < 5) {
        this.sectionAware.container.classList.add('hidden');
      }
    }

    animateSectionChange() {
      if (!this.sectionAware) return;
      
      this.sectionAware.name.style.opacity = '0';
      this.sectionAware.name.style.transform = 'translateY(-5px)';
      
      setTimeout(() => {
        this.sectionAware.name.style.transition = 'all 0.3s ease';
        this.sectionAware.name.style.opacity = '1';
        this.sectionAware.name.style.transform = 'translateY(0)';
      }, 50);
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
  }

  // Reading Progress Widget
  class ReadingProgressWidget {
    constructor() {
      this.widget = null;
      this.stats = {
        words: 0,
        readTime: 0,
        progress: 0
      };
      this.init();
    }

    init() {
      this.calculateStats();
      this.createWidget();
      this.bindEvents();
    }

    calculateStats() {
      const content = document.querySelector('main, article') || document.body;
      const text = content.textContent || '';
      this.stats.words = text.trim().split(/\s+/).length;
      this.stats.readTime = Math.max(1, Math.ceil(this.stats.words / 200));
    }

    createWidget() {
      if (document.querySelector('.reading-progress-widget')) return;
      
      const widget = document.createElement('div');
      widget.className = 'reading-progress-widget';
      widget.innerHTML = `
        <div class="reading-progress-header">
          <h4 class="reading-progress-title">Reading Progress</h4>
          <button class="reading-progress-toggle" aria-label="Minimize">−</button>
        </div>
        <div class="reading-progress-content">
          <div class="reading-progress-stats">
            <div class="reading-stat">
              <span class="reading-stat-label">Words</span>
              <span class="reading-stat-value" data-words>${this.stats.words.toLocaleString()}</span>
            </div>
            <div class="reading-stat">
              <span class="reading-stat-label">Read Time</span>
              <span class="reading-stat-value" data-time>${this.stats.readTime} min</span>
            </div>
          </div>
          <div class="reading-progress-bar-container">
            <div class="reading-progress-bar">
              <div class="reading-progress-bar-fill"></div>
            </div>
          </div>
          <p class="reading-progress-text"><span data-percent>0</span>% complete</p>
        </div>
      `;
      
      document.body.appendChild(widget);
      this.widget = widget;
      this.barFill = widget.querySelector('.reading-progress-bar-fill');
      this.percentText = widget.querySelector('[data-percent]');
      
      // Toggle minimize
      const toggle = widget.querySelector('.reading-progress-toggle');
      toggle.addEventListener('click', () => {
        widget.classList.toggle('minimized');
        toggle.textContent = widget.classList.contains('minimized') ? '+' : '−';
      });
    }

    bindEvents() {
      window.addEventListener('scroll', this.throttle(() => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.round((scrollTop / docHeight) * 100);
        
        this.barFill.style.width = `${progress}%`;
        this.percentText.textContent = progress;
      }, 100), { passive: true });
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
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.smoothScrollIndicator = new SmoothScrollIndicator();
      window.readingProgressWidget = new ReadingProgressWidget();
    });
  } else {
    window.smoothScrollIndicator = new SmoothScrollIndicator();
    window.readingProgressWidget = new ReadingProgressWidget();
  }
})();
