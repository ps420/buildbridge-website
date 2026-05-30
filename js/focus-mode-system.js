/**
 * Focus Mode System - v137.2
 * Distraction-free reading experience
 * Fortune 500 Professional UX
 */

class FocusModeSystem {
  constructor(options = {}) {
    this.options = {
      showToggle: options.showToggle !== false,
      showTriggers: options.showTriggers !== false,
      animationDuration: options.animationDuration || 400,
      ...options
    };

    this.isActive = false;
    this.currentSection = null;
    this.fontSize = 'medium';
    this.theme = 'dark';
    this.readingProgress = 0;

    this.elements = {
      toggle: null,
      overlay: null,
      section: null,
      toolbar: null,
      progressBar: null
    };

    this.init();
  }

  init() {
    if (this.options.showToggle) {
      this.createToggle();
    }
    this.createOverlay();
    this.createSection();
    this.createToolbar();
    this.bindEvents();

    if (this.options.showTriggers) {
      this.addSectionTriggers();
    }
  }

  createToggle() {
    this.elements.toggle = document.createElement('button');
    this.elements.toggle.className = 'focus-mode-toggle';
    this.elements.toggle.setAttribute('aria-label', 'Enter focus mode');
    this.elements.toggle.setAttribute('title', 'Focus Mode (F)');
    this.elements.toggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
      <span class="focus-mode-tooltip">Focus Mode (F)</span>
    `;
    document.body.appendChild(this.elements.toggle);
  }

  createOverlay() {
    this.elements.overlay = document.createElement('div');
    this.elements.overlay.className = 'focus-overlay';
    this.elements.overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(this.elements.overlay);
  }

  createSection() {
    this.elements.section = document.createElement('div');
    this.elements.section.className = 'focus-section';
    this.elements.section.setAttribute('role', 'dialog');
    this.elements.section.setAttribute('aria-modal', 'true');
    this.elements.section.setAttribute('aria-labelledby', 'focus-section-title');
    this.elements.section.setAttribute('tabindex', '-1');
    
    this.elements.section.innerHTML = `
      <div class="focus-reading-progress">
        <div class="focus-reading-progress-bar"></div>
      </div>
      <div class="focus-section-header">
        <div>
          <h2 id="focus-section-title" class="focus-section-title">Focus Mode</h2>
          <div class="focus-section-meta">Press ESC or click X to exit</div>
        </div>
        <button class="focus-close-btn" aria-label="Close focus mode">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="24" height="24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="focus-section-content"></div>
    `;

    document.body.appendChild(this.elements.section);

    this.elements.progressBar = this.elements.section.querySelector('.focus-reading-progress-bar');
    this.elements.sectionContent = this.elements.section.querySelector('.focus-section-content');
    this.elements.sectionTitle = this.elements.section.querySelector('.focus-section-title');
    this.elements.closeBtn = this.elements.section.querySelector('.focus-close-btn');
  }

  createToolbar() {
    this.elements.toolbar = document.createElement('div');
    this.elements.toolbar.className = 'focus-toolbar';
    this.elements.toolbar.innerHTML = `
      <button class="focus-toolbar-btn" data-action="font-small" aria-label="Small font size">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>
      <button class="focus-toolbar-btn active" data-action="font-medium" aria-label="Medium font size">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button class="focus-toolbar-btn" data-action="font-large" aria-label="Large font size">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
      <div class="focus-toolbar-divider"></div>
      <button class="focus-toolbar-btn" data-action="theme-dark" aria-label="Dark theme">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
      <button class="focus-toolbar-btn" data-action="theme-light" aria-label="Light theme">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>
      <button class="focus-toolbar-btn" data-action="theme-sepia" aria-label="Sepia theme">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </button>
      <div class="focus-toolbar-divider"></div>
      <button class="focus-toolbar-btn" data-action="close" aria-label="Exit focus mode">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    `;

    document.body.appendChild(this.elements.toolbar);
  }

  bindEvents() {
    // Toggle button
    if (this.elements.toggle) {
      this.elements.toggle.addEventListener('click', () => this.toggle());
    }

    // Close button
    this.elements.closeBtn.addEventListener('click', () => this.deactivate());

    // Overlay click
    this.elements.overlay.addEventListener('click', () => this.deactivate());

    // Toolbar buttons
    this.elements.toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.focus-toolbar-btn');
      if (btn) {
        const action = btn.getAttribute('data-action');
        this.handleToolbarAction(action, btn);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // F key to toggle
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tagName = document.activeElement?.tagName;
        if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
          e.preventDefault();
          this.toggle();
        }
      }

      // ESC to close
      if (e.key === 'Escape' && this.isActive) {
        this.deactivate();
      }
    });

    // Scroll progress
    this.elements.section.addEventListener('scroll', () => {
      this.updateReadingProgress();
    });

    // Prevent body scroll when focus mode is active
    this.elements.section.addEventListener('wheel', (e) => {
      const isScrollingUp = e.deltaY < 0;
      const isScrollingDown = e.deltaY > 0;
      const isAtTop = this.elements.section.scrollTop === 0;
      const isAtBottom = this.elements.section.scrollTop + this.elements.section.clientHeight >= this.elements.section.scrollHeight - 1;

      if ((isScrollingUp && isAtTop) || (isScrollingDown && isAtBottom)) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  addSectionTriggers() {
    // Find all major sections and add focus triggers
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
      const trigger = document.createElement('button');
      trigger.className = 'section-focus-trigger';
      trigger.setAttribute('aria-label', `Enter focus mode for ${section.getAttribute('data-nav-label') || 'this section'}`);
      trigger.setAttribute('title', 'Read in focus mode');
      trigger.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      `;

      trigger.addEventListener('click', () => {
        this.activateForSection(section);
      });

      // Position the section relatively if not already
      if (getComputedStyle(section).position === 'static') {
        section.style.position = 'relative';
      }

      section.appendChild(trigger);
    });
  }

  toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activateForCurrentView();
    }
  }

  activateForCurrentView() {
    // Extract main content
    const mainContent = this.extractMainContent();
    this.elements.sectionContent.innerHTML = mainContent;
    this.elements.sectionTitle.textContent = document.title;
    
    this.activate();
  }

  activateForSection(section) {
    const title = section.querySelector('h2')?.textContent || 
                  section.getAttribute('data-nav-label') || 
                  'Section Content';
    
    const content = section.cloneNode(true);
    
    // Remove interactive elements
    content.querySelectorAll('.section-focus-trigger, .btn, .actions, form').forEach(el => el.remove());
    
    this.elements.sectionContent.innerHTML = content.innerHTML;
    this.elements.sectionTitle.textContent = title;
    
    this.activate();
  }

  extractMainContent() {
    // Try to find main content area
    const main = document.querySelector('main') || document.querySelector('#main-content');
    if (main) {
      return main.innerHTML;
    }

    // Fallback: extract from all sections
    const sections = document.querySelectorAll('section');
    let content = '';
    sections.forEach(section => {
      const clone = section.cloneNode(true);
      clone.querySelectorAll('.section-focus-trigger, .btn.ghost').forEach(el => el.remove());
      content += clone.innerHTML;
    });

    return content;
  }

  activate() {
    this.isActive = true;
    document.body.classList.add('focus-mode-active');
    
    if (this.elements.toggle) {
      this.elements.toggle.classList.add('active');
      this.elements.toggle.setAttribute('aria-label', 'Exit focus mode');
    }

    // Focus the section for accessibility
    setTimeout(() => {
      this.elements.section.focus();
    }, this.options.animationDuration);

    // Dispatch event
    window.dispatchEvent(new CustomEvent('focusmodeactivated'));

    // Pause any background animations
    document.body.classList.add('pause-animations');
  }

  deactivate() {
    this.isActive = false;
    document.body.classList.remove('focus-mode-active');
    
    if (this.elements.toggle) {
      this.elements.toggle.classList.remove('active');
      this.elements.toggle.setAttribute('aria-label', 'Enter focus mode');
    }

    // Reset scroll
    this.elements.section.scrollTop = 0;
    this.updateReadingProgress();

    // Dispatch event
    window.dispatchEvent(new CustomEvent('focusmodedeactivated'));

    // Resume animations
    document.body.classList.remove('pause-animations');
  }

  handleToolbarAction(action, btn) {
    switch (action) {
      case 'font-small':
      case 'font-medium':
      case 'font-large':
        this.setFontSize(action.replace('font-', ''));
        this.updateActiveToolbarBtn(btn);
        break;
      case 'theme-dark':
      case 'theme-light':
      case 'theme-sepia':
        this.setTheme(action.replace('theme-', ''));
        this.updateActiveToolbarBtn(btn, 'theme');
        break;
      case 'close':
        this.deactivate();
        break;
    }
  }

  setFontSize(size) {
    document.body.classList.remove('focus-font-small', 'focus-font-medium', 'focus-font-large');
    document.body.classList.add(`focus-font-${size}`);
    this.fontSize = size;
    
    // Save preference
    localStorage.setItem('focusModeFontSize', size);
  }

  setTheme(theme) {
    document.body.classList.remove('focus-theme-dark', 'focus-theme-light', 'focus-theme-sepia');
    document.body.classList.add(`focus-theme-${theme}`);
    this.theme = theme;
    
    // Save preference
    localStorage.setItem('focusModeTheme', theme);
  }

  updateActiveToolbarBtn(activeBtn, group = null) {
    if (group === 'theme') {
      // For theme buttons, allow multiple selections (not applicable here, but good pattern)
      this.elements.toolbar.querySelectorAll('[data-action^="theme-"]').forEach(btn => {
        btn.classList.remove('active');
      });
    } else {
      // For font size, only one active
      this.elements.toolbar.querySelectorAll('[data-action^="font-"]').forEach(btn => {
        btn.classList.remove('active');
      });
    }
    activeBtn.classList.add('active');
  }

  updateReadingProgress() {
    if (!this.elements.section) return;
    
    const scrollTop = this.elements.section.scrollTop;
    const scrollHeight = this.elements.section.scrollHeight - this.elements.section.clientHeight;
    
    if (scrollHeight > 0) {
      this.readingProgress = (scrollTop / scrollHeight) * 100;
      this.elements.progressBar.style.width = `${this.readingProgress}%`;
    }
  }

  loadPreferences() {
    const savedFontSize = localStorage.getItem('focusModeFontSize');
    const savedTheme = localStorage.getItem('focusModeTheme');
    
    if (savedFontSize) {
      this.setFontSize(savedFontSize);
    }
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.focusMode = new FocusModeSystem();
  });
} else {
  window.focusMode = new FocusModeSystem();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FocusModeSystem;
}
