/**
 * v117.0: Smart Focus Mode
 * Fortune 500 Professional Feature
 * Distraction-free reading experience
 */

class SmartFocusMode {
  constructor(options = {}) {
    this.options = {
      contentSelector: options.contentSelector || 'article, .section, main',
      excludedSelectors: options.excludedSelectors || ['nav', 'footer', 'aside', '.ads'],
      showReadingTime: options.showReadingTime !== false,
      showWordCount: options.showWordCount !== false,
      keyboardShortcut: options.keyboardShortcut !== false,
      rememberState: options.rememberState !== false,
      ...options
    };
    
    this.isActive = false;
    this.contentElement = null;
    this.originalContent = '';
    this.readingSpeed = 200; // words per minute
    
    this.init();
  }
  
  init() {
    this.createElements();
    this.bindEvents();
    this.checkSavedState();
  }
  
  createElements() {
    // Create toggle button
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.className = 'focus-mode-toggle';
    this.toggleBtn.setAttribute('aria-label', 'Toggle focus mode');
    this.toggleBtn.setAttribute('title', 'Focus mode (F)');
    this.toggleBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6m4.22-10.22l4.24-4.24M6.34 17.66l-4.24 4.24M23 12h-6m-6 0H1m20.24 4.24l-4.24-4.24M6.34 6.34L2.1 2.1"/>
      </svg>
    `;
    document.body.appendChild(this.toggleBtn);
    
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'focus-mode-overlay';
    document.body.appendChild(this.overlay);
    
    // Create ambient background
    this.ambient = document.createElement('div');
    this.ambient.className = 'focus-mode-ambient';
    document.body.appendChild(this.ambient);
    
    // Create exit button
    this.exitBtn = document.createElement('button');
    this.exitBtn.className = 'focus-mode-exit';
    this.exitBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      Exit Focus Mode
    `;
    document.body.appendChild(this.exitBtn);
    
    // Create focus container
    this.container = document.createElement('div');
    this.container.className = 'focus-mode-container';
    this.container.setAttribute('role', 'main');
    this.container.setAttribute('aria-label', 'Focus mode content');
    document.body.appendChild(this.container);
    
    // Create progress indicator
    this.progress = document.createElement('div');
    this.progress.className = 'focus-mode-progress';
    document.body.appendChild(this.progress);
    
    // Create reading time indicator
    if (this.options.showReadingTime) {
      this.readingTimeEl = document.createElement('div');
      this.readingTimeEl.className = 'focus-mode-reading-time';
      document.body.appendChild(this.readingTimeEl);
    }
    
    // Create shortcut hint
    this.shortcutEl = document.createElement('div');
    this.shortcutEl.className = 'focus-mode-shortcut';
    this.shortcutEl.innerHTML = `Press <kbd>F</kbd> to exit`;
    document.body.appendChild(this.shortcutEl);
  }
  
  bindEvents() {
    // Toggle on button click
    this.toggleBtn.addEventListener('click', () => this.toggle());
    
    // Exit on button click
    this.exitBtn.addEventListener('click', () => this.deactivate());
    
    // Exit on overlay click
    this.overlay.addEventListener('click', () => this.deactivate());
    
    // Keyboard shortcut
    if (this.options.keyboardShortcut) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'f' || e.key === 'F') {
          // Don't trigger if typing in input
          if (e.target.matches('input, textarea, [contenteditable]')) return;
          
          e.preventDefault();
          this.toggle();
        }
        
        if (e.key === 'Escape' && this.isActive) {
          e.preventDefault();
          this.deactivate();
        }
      });
    }
    
    // Update progress on scroll
    window.addEventListener('scroll', () => {
      if (this.isActive) {
        this.updateProgress();
      }
    }, { passive: true });
    
    // Update progress on resize
    window.addEventListener('resize', () => {
      if (this.isActive) {
        this.updateProgress();
      }
    });
  }
  
  toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }
  
  activate() {
    if (this.isActive) return;
    
    // Find main content
    this.contentElement = document.querySelector(this.options.contentSelector);
    if (!this.contentElement) {
      this.contentElement = document.querySelector('main') || document.body;
    }
    
    // Clone and clean content
    const content = this.contentElement.cloneNode(true);
    this.cleanContent(content);
    
    // Set content
    this.container.innerHTML = '';
    this.container.appendChild(content);
    
    // Add stats footer
    if (this.options.showWordCount) {
      this.addContentStats();
    }
    
    // Update reading time
    if (this.options.showReadingTime) {
      this.updateReadingTime();
    }
    
    // Activate
    document.body.classList.add('focus-mode-active');
    this.toggleBtn.classList.add('active');
    this.isActive = true;
    
    // Save state
    if (this.options.rememberState) {
      sessionStorage.setItem('bb_focus_mode', 'true');
    }
    
    // Update progress
    this.updateProgress();
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('focusModeActivated'));
  }
  
  deactivate() {
    if (!this.isActive) return;
    
    document.body.classList.remove('focus-mode-active');
    this.toggleBtn.classList.remove('active');
    this.isActive = false;
    
    // Clear saved state
    if (this.options.rememberState) {
      sessionStorage.removeItem('bb_focus_mode');
    }
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('focusModeDeactivated'));
  }
  
  cleanContent(element) {
    // Remove unwanted elements
    this.options.excludedSelectors.forEach(selector => {
      element.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    // Remove scripts and styles
    element.querySelectorAll('script, style, link[rel="stylesheet"]').forEach(el => el.remove());
    
    // Remove hidden elements
    element.querySelectorAll('[hidden], [aria-hidden="true"]').forEach(el => {
      if (!el.matches('.focus-mode-container *')) {
        el.remove();
      }
    });
    
    // Clean up classes
    element.className = '';
    element.classList.add('focus-mode-content');
  }
  
  addContentStats() {
    const text = this.container.textContent;
    const wordCount = text.trim().split(/\s+/).length;
    const charCount = text.length;
    const readingTime = Math.ceil(wordCount / this.readingSpeed);
    
    const statsHTML = `
      <div class="focus-mode-stats">
        <div class="focus-mode-stat">
          <strong>${wordCount.toLocaleString()}</strong> words
        </div>
        <div class="focus-mode-stat">
          <strong>${charCount.toLocaleString()}</strong> characters
        </div>
        <div class="focus-mode-stat">
          <strong>${readingTime}</strong> min read
        </div>
      </div>
    `;
    
    const statsEl = document.createElement('div');
    statsEl.innerHTML = statsHTML;
    this.container.appendChild(statsEl);
  }
  
  updateReadingTime() {
    if (!this.readingTimeEl) return;
    
    const text = this.container.textContent;
    const wordCount = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / this.readingSpeed);
    
    this.readingTimeEl.innerHTML = `
      <span class="time-value">${minutes}</span> min read
    `;
  }
  
  updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    
    this.progress.style.height = `${Math.min(100, progress)}vh`;
    
    // Update reading time remaining
    if (this.options.showReadingTime && this.readingTimeEl) {
      const remaining = Math.ceil((100 - progress) / 100 * parseInt(this.readingTimeEl.textContent));
      if (remaining > 0) {
        this.readingTimeEl.innerHTML = `
          <span class="time-value">${remaining}</span> min remaining
        `;
      }
    }
  }
  
  checkSavedState() {
    if (this.options.rememberState && sessionStorage.getItem('bb_focus_mode') === 'true') {
      // Wait for page to fully load
      if (document.readyState === 'complete') {
        this.activate();
      } else {
        window.addEventListener('load', () => this.activate());
      }
    }
  }
  
  destroy() {
    this.deactivate();
    this.toggleBtn?.remove();
    this.overlay?.remove();
    this.ambient?.remove();
    this.exitBtn?.remove();
    this.container?.remove();
    this.progress?.remove();
    this.readingTimeEl?.remove();
    this.shortcutEl?.remove();
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.smartFocusMode = new SmartFocusMode();
  });
} else {
  window.smartFocusMode = new SmartFocusMode();
}
