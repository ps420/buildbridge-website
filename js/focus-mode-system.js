/**
 * Focus Mode System v87.2 - Fortune 500 Distraction-Free Reading
 * Immersive reading experience with customization options
 */

(function() {
  'use strict';

  const FocusModeSystem = {
    isActive: false,
    originalContent: null,
    readingStartTime: null,
    scrollProgress: 0,
    settings: {
      fontSize: 'medium',
      theme: 'dark',
      lineFocus: false
    },

    init() {
      this.createToggle();
      this.createOverlay();
      this.bindEvents();
      this.checkFocusableContent();
      
      console.log('🎯 Focus Mode System initialized');
    },

    createToggle() {
      const toggle = document.createElement('button');
      toggle.className = 'focus-mode-toggle';
      toggle.setAttribute('aria-label', 'Enter focus mode for distraction-free reading');
      toggle.setAttribute('title', 'Focus Mode');
      toggle.innerHTML = '👁️';
      
      toggle.addEventListener('click', () => this.toggle());
      
      document.body.appendChild(toggle);
      this.toggle = toggle;
    },

    createOverlay() {
      const overlay = document.createElement('div');
      overlay.className = 'focus-mode-overlay';
      overlay.id = 'focusModeOverlay';
      overlay.setAttribute('aria-hidden', 'true');
      
      overlay.innerHTML = `
        <div class="focus-mode-toolbar">
          <div class="focus-mode-title">Focus Mode</div>
          <div class="focus-mode-controls">
            <button class="focus-mode-btn" data-action="font-decrease" title="Decrease font size">A-</button>
            <button class="focus-mode-btn" data-action="font-increase" title="Increase font size">A+</button>
            <button class="focus-mode-btn" data-action="theme" title="Toggle theme">🎨</button>
            <button class="focus-mode-btn" data-action="line-focus" title="Toggle line focus">📖</button>
            <button class="focus-mode-btn exit" data-action="exit">
              <span>✕</span>
              <span>Exit</span>
            </button>
          </div>
        </div>
        <div class="focus-mode-progress">
          <div class="focus-mode-progress-fill"></div>
        </div>
        <div class="focus-mode-content"></div>
        <div class="focus-mode-reading-time">
          <span>⏱️</span>
          <span><span class="time-remaining">--</span> min remaining</span>
        </div>
        <div class="focus-mode-line-highlight"></div>
      `;
      
      document.body.appendChild(overlay);
      this.overlay = overlay;
      this.content = overlay.querySelector('.focus-mode-content');
      this.progressFill = overlay.querySelector('.focus-mode-progress-fill');
      this.timeRemaining = overlay.querySelector('.time-remaining');
      this.toolbar = overlay.querySelector('.focus-mode-toolbar');
    },

    toggle() {
      if (this.isActive) {
        this.exit();
      } else {
        this.enter();
      }
    },

    enter() {
      const article = this.findMainContent();
      if (!article) return;

      this.isActive = true;
      this.readingStartTime = Date.now();
      this.originalContent = article.innerHTML;
      
      // Clone content
      this.content.innerHTML = article.innerHTML;
      
      // Add title if available
      const h1 = document.querySelector('h1');
      if (h1 && !this.content.querySelector('h1')) {
        this.content.insertAdjacentHTML('afterbegin', `<h1>${h1.textContent}</h1>`);
      }
      
      // Calculate reading time
      const text = this.content.textContent;
      const wordCount = text.trim().split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);
      this.timeRemaining.textContent = readingTime;
      
      // Show overlay
      this.overlay.classList.add('active');
      this.overlay.setAttribute('aria-hidden', 'false');
      this.toggle.classList.add('active');
      
      // Apply settings
      this.applySettings();
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      
      // Update toolbar title
      const title = document.querySelector('h1');
      if (title) {
        this.toolbar.querySelector('.focus-mode-title').textContent = title.textContent;
      }
      
      // Start tracking
      this.startTracking();
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('focusModeEntered'));
      
      // Accessibility announcement
      this.announce('Focus mode activated. Use controls at top to customize or exit.');
    },

    exit() {
      this.isActive = false;
      
      this.overlay.classList.add('exiting');
      
      setTimeout(() => {
        this.overlay.classList.remove('active', 'exiting');
        this.overlay.setAttribute('aria-hidden', 'true');
        this.content.innerHTML = '';
      }, 300);
      
      this.toggle.classList.remove('active');
      document.body.style.overflow = '';
      
      this.stopTracking();
      
      window.dispatchEvent(new CustomEvent('focusModeExited'));
      this.announce('Exited focus mode');
    },

    findMainContent() {
      // Try to find main content area
      const selectors = [
        'article',
        'main',
        '[role="main"]',
        '.section',
        '#main-content',
        '.content'
      ];
      
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent.length > 500) {
          return el;
        }
      }
      
      // Fallback to body content
      return document.querySelector('body');
    },

    checkFocusableContent() {
      // Show toggle only on pages with significant content
      const content = this.findMainContent();
      if (content && content.textContent.length > 1000) {
        setTimeout(() => {
          this.toggle.classList.add('visible');
        }, 1000);
      }
    },

    applySettings() {
      this.content.className = `focus-mode-content focus-mode-font-${this.settings.fontSize}`;
      this.overlay.className = `focus-mode-overlay focus-mode-${this.settings.theme}`;
      
      if (this.settings.lineFocus) {
        this.overlay.classList.add('line-focus');
      }
    },

    startTracking() {
      this.overlay.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
      this.onScroll();
      
      // Update reading time every minute
      this.readingInterval = setInterval(() => this.updateReadingTime(), 60000);
    },

    stopTracking() {
      this.overlay.removeEventListener('scroll', this.onScroll.bind(this));
      clearInterval(this.readingInterval);
    },

    onScroll() {
      const scrollTop = this.overlay.scrollTop;
      const scrollHeight = this.overlay.scrollHeight - this.overlay.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      
      this.scrollProgress = progress;
      this.progressFill.style.width = `${progress}%`;
      
      // Update toolbar shadow
      if (scrollTop > 50) {
        this.toolbar.classList.add('scrolled');
      } else {
        this.toolbar.classList.remove('scrolled');
      }
      
      // Update line focus position
      if (this.settings.lineFocus) {
        const highlight = this.overlay.querySelector('.focus-mode-line-highlight');
        const viewportCenter = this.overlay.clientHeight / 2;
        highlight.style.top = `${scrollTop + viewportCenter - 24}px`;
      }
      
      // Update reading time
      const remaining = Math.max(0, Math.ceil(this.calculateRemainingTime()));
      this.timeRemaining.textContent = remaining;
    },

    calculateRemainingTime() {
      const text = this.content.textContent;
      const wordCount = text.trim().split(/\s+/).length;
      const totalTime = wordCount / 200; // 200 wpm
      const remainingRatio = 1 - (this.scrollProgress / 100);
      return totalTime * remainingRatio;
    },

    updateReadingTime() {
      const remaining = Math.max(0, Math.ceil(this.calculateRemainingTime()));
      this.timeRemaining.textContent = remaining;
    },

    bindEvents() {
      // Toolbar controls
      this.overlay.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        
        const action = btn.dataset.action;
        
        switch(action) {
          case 'exit':
            this.exit();
            break;
          case 'font-increase':
            this.changeFontSize(1);
            break;
          case 'font-decrease':
            this.changeFontSize(-1);
            break;
          case 'theme':
            this.toggleTheme();
            break;
          case 'line-focus':
            this.toggleLineFocus();
            break;
        }
      });

      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        if (!this.isActive) {
          // Quick enter with F9
          if (e.key === 'F9') {
            e.preventDefault();
            this.enter();
          }
          return;
        }
        
        switch(e.key) {
          case 'Escape':
            this.exit();
            break;
          case '+':
          case '=':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              this.changeFontSize(1);
            }
            break;
          case '-':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              this.changeFontSize(-1);
            }
            break;
          case 't':
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              this.toggleTheme();
            }
            break;
        }
      });

      // Hide toggle when reaching footer
      const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.toggle.classList.remove('visible');
          } else {
            this.checkFocusableContent();
          }
        });
      }, { threshold: 0.1 });

      const footer = document.querySelector('footer, .footer');
      if (footer) {
        footerObserver.observe(footer);
      }
    },

    changeFontSize(direction) {
      const sizes = ['small', 'medium', 'large', 'xl'];
      const currentIndex = sizes.indexOf(this.settings.fontSize);
      const newIndex = Math.max(0, Math.min(sizes.length - 1, currentIndex + direction));
      
      this.settings.fontSize = sizes[newIndex];
      this.applySettings();
      
      this.announce(`Font size set to ${this.settings.fontSize}`);
    },

    toggleTheme() {
      this.settings.theme = this.settings.theme === 'dark' ? 'sepia' : 'dark';
      this.applySettings();
      
      this.announce(`Theme set to ${this.settings.theme}`);
    },

    toggleLineFocus() {
      this.settings.lineFocus = !this.settings.lineFocus;
      this.applySettings();
      
      if (this.settings.lineFocus) {
        this.onScroll(); // Position highlight
      }
      
      this.announce(`Line focus ${this.settings.lineFocus ? 'enabled' : 'disabled'}`);
    },

    announce(message) {
      const announcer = document.createElement('div');
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.className = 'sr-only';
      announcer.textContent = message;
      
      document.body.appendChild(announcer);
      setTimeout(() => announcer.remove(), 1000);
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => FocusModeSystem.init());
  } else {
    FocusModeSystem.init();
  }

  window.FocusModeSystem = FocusModeSystem;
})();
