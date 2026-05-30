/**
 * Smart Reading Time Widget - v138.2
 * Fortune 500 Content Consumption Indicator
 * Calculates reading time and tracks progress
 */

(function() {
  'use strict';

  const ReadingTimeWidget = {
    config: {
      wordsPerMinute: {
        slow: 150,
        average: 200,
        fast: 300
      },
      minWords: 100,
      updateInterval: 1000,
      showAfterScroll: 300,
      storageKey: 'bb_reading_speed'
    },

    state: {
      totalWords: 0,
      readingTime: 0,
      currentSpeed: 'average',
      scrollProgress: 0,
      isVisible: false,
      isMinimized: false,
      hasCompleted: false,
      startTime: Date.now(),
      sections: []
    },

    init() {
      // Load preferred speed from storage
      const savedSpeed = localStorage.getItem(this.config.storageKey);
      if (savedSpeed && this.config.wordsPerMinute[savedSpeed]) {
        this.state.currentSpeed = savedSpeed;
      }

      this.calculateReadingTime();
      this.analyzeSections();
      this.createWidget();
      this.bindEvents();
    },

    calculateReadingTime() {
      // Get all text content from main content areas
      const contentSelectors = [
        'main',
        'article',
        '[data-section]',
        '.section',
        '.service-card',
        '.project-card'
      ];

      let totalText = '';
      contentSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          totalText += ' ' + el.textContent;
        });
      });

      // Clean and count words
      const cleanText = totalText
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .trim();
      
      this.state.totalWords = cleanText.split(/\s+/).filter(w => w.length > 0).length;
      this.updateReadingTime();
    },

    updateReadingTime() {
      const wpm = this.config.wordsPerMinute[this.state.currentSpeed];
      this.state.readingTime = Math.max(1, Math.ceil(this.state.totalWords / wpm));
    },

    analyzeSections() {
      const sections = document.querySelectorAll('[data-section], section[id]');
      
      sections.forEach((section, index) => {
        const text = section.textContent || '';
        const words = text.split(/\s+/).filter(w => w.length > 0).length;
        const time = Math.max(1, Math.ceil(words / this.config.wordsPerMinute[this.state.currentSpeed]));
        
        this.state.sections.push({
          element: section,
          words: words,
          time: time,
          index: index
        });

        // Add section indicator
        this.addSectionIndicator(section, time);
      });
    },

    addSectionIndicator(section, minutes) {
      if (minutes < 1) return;
      
      const indicator = document.createElement('div');
      indicator.className = 'reading-time-section-indicator';
      indicator.innerHTML = `⏱️ ${minutes} min read`;
      indicator.setAttribute('aria-hidden', 'true');
      
      section.style.position = 'relative';
      section.appendChild(indicator);
    },

    createWidget() {
      if (this.state.totalWords < this.config.minWords) return;

      const widget = document.createElement('div');
      widget.className = 'reading-time-widget';
      widget.setAttribute('role', 'complementary');
      widget.setAttribute('aria-label', 'Reading time tracker');
      
      widget.innerHTML = `
        <button class="reading-time-toggle" aria-label="Minimize reading time widget">−</button>
        
        <div class="reading-time-header">
          <div class="reading-time-icon">⏱️</div>
          <div class="reading-time-title">Reading Time</div>
        </div>
        
        <div class="reading-time-content">
          <div class="reading-time-main">
            <span class="reading-time-value">${this.state.readingTime}</span>
            <span class="reading-time-unit">min</span>
          </div>
          
          <div class="reading-time-progress-container">
            <div class="reading-time-progress-bar">
              <div class="reading-time-progress-fill" style="width: 0%"></div>
            </div>
            <div class="reading-time-stats">
              <span class="reading-time-percent">0% complete</span>
              <span class="reading-time-remaining">${this.state.readingTime} min left</span>
            </div>
          </div>
          
          <div class="reading-time-details">
            <div class="reading-time-detail-item">
              <span class="reading-time-detail-label">Words</span>
              <span class="reading-time-detail-value">${this.state.totalWords.toLocaleString()}</span>
            </div>
            <div class="reading-time-detail-item">
              <span class="reading-time-detail-label">Sections</span>
              <span class="reading-time-detail-value">${this.state.sections.length}</span>
            </div>
          </div>
          
          <div class="reading-time-speed-selector">
            <button class="reading-time-speed-btn ${this.state.currentSpeed === 'slow' ? 'active' : ''}" data-speed="slow">Slow</button>
            <button class="reading-time-speed-btn ${this.state.currentSpeed === 'average' ? 'active' : ''}" data-speed="average">Avg</button>
            <button class="reading-time-speed-btn ${this.state.currentSpeed === 'fast' ? 'active' : ''}" data-speed="fast">Fast</button>
          </div>
        </div>
        
        <div class="reading-time-completion">
          <div class="reading-time-completion-icon">🎉</div>
          <div class="reading-time-completion-text">Great job!</div>
        </div>
      `;
      
      document.body.appendChild(widget);
      this.widget = widget;
      this.progressFill = widget.querySelector('.reading-time-progress-fill');
      this.percentEl = widget.querySelector('.reading-time-percent');
      this.remainingEl = widget.querySelector('.reading-time-remaining');
      this.valueEl = widget.querySelector('.reading-time-value');
      this.completionEl = widget.querySelector('.reading-time-completion');
      
      this.bindWidgetEvents();
    },

    bindWidgetEvents() {
      // Minimize toggle
      const toggle = this.widget.querySelector('.reading-time-toggle');
      toggle.addEventListener('click', () => {
        this.state.isMinimized = !this.state.isMinimized;
        this.widget.classList.toggle('minimized', this.state.isMinimized);
        toggle.textContent = this.state.isMinimized ? '+' : '−';
        toggle.setAttribute('aria-label', 
          this.state.isMinimized ? 'Expand reading time widget' : 'Minimize reading time widget'
        );
      });

      // Speed selector
      this.widget.querySelectorAll('.reading-time-speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const speed = btn.dataset.speed;
          this.setReadingSpeed(speed);
          
          // Update active states
          this.widget.querySelectorAll('.reading-time-speed-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.speed === speed);
          });
        });
      });
    },

    setReadingSpeed(speed) {
      this.state.currentSpeed = speed;
      localStorage.setItem(this.config.storageKey, speed);
      
      // Recalculate
      this.updateReadingTime();
      
      // Update display
      if (this.valueEl) {
        this.valueEl.textContent = this.state.readingTime;
      }
      
      // Update remaining time
      this.updateRemainingTime();
    },

    bindEvents() {
      // Show on scroll
      let scrollTimeout;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        
        if (!this.state.isVisible && window.scrollY > this.config.showAfterScroll) {
          this.show();
        }
        
        // Throttled progress update
        scrollTimeout = setTimeout(() => {
          this.updateProgress();
        }, 100);
      }, { passive: true });

      // Periodic updates
      setInterval(() => this.updateProgress(), this.config.updateInterval);
    },

    show() {
      if (!this.widget || this.state.isVisible) return;
      
      this.state.isVisible = true;
      this.widget.classList.add('visible');
    },

    updateProgress() {
      if (!this.widget) return;

      // Calculate scroll progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      
      this.state.scrollProgress = progress;

      // Update progress bar
      if (this.progressFill) {
        this.progressFill.style.width = `${progress}%`;
      }

      // Update stats
      if (this.percentEl) {
        this.percentEl.textContent = `${Math.round(progress)}% complete`;
      }

      this.updateRemainingTime();

      // Check for completion
      if (progress >= 95 && !this.state.hasCompleted) {
        this.showCompletion();
      }
    },

    updateRemainingTime() {
      if (!this.remainingEl) return;
      
      const remainingMinutes = Math.max(0, Math.ceil(
        (this.state.readingTime * (100 - this.state.scrollProgress) / 100)
      ));
      
      this.remainingEl.textContent = remainingMinutes === 0 
        ? 'Almost done!' 
        : `${remainingMinutes} min left`;
    },

    showCompletion() {
      this.state.hasCompleted = true;
      
      if (this.completionEl) {
        this.completionEl.classList.add('show');
        
        // Hide after celebration
        setTimeout(() => {
          this.completionEl.classList.remove('show');
        }, 3000);
      }

      // Track event
      this.trackEvent('reading_completed', {
        time_spent: Math.round((Date.now() - this.state.startTime) / 1000),
        total_words: this.state.totalWords
      });
    },

    trackEvent(eventName, params = {}) {
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          event_category: 'reading_time',
          ...params
        });
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ReadingTimeWidget.init());
  } else {
    ReadingTimeWidget.init();
  }

  // Expose to global scope
  window.ReadingTimeWidget = ReadingTimeWidget;
})();
