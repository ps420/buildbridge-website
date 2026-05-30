/**
 * Reading Focus Mode System
 * Fortune 500 Quality Distraction-Free Reading
 * v91.0: Intelligent focus mode with progress tracking and customization
 */

class FocusModeSystem {
  constructor() {
    this.isActive = false;
    this.currentContainer = null;
    this.fontSize = 100; // percentage
    this.theme = 'dark';
    this.lineWidth = 'medium';
    this.readingProgress = 0;
    this.scrollListener = null;
    this.paragraphObserver = null;
    
    this.init();
  }
  
  init() {
    this.createToggleButton();
    this.createControls();
    this.createProgressBar();
    this.createInfoPanel();
    this.bindEvents();
    this.loadSettings();
  }
  
  createToggleButton() {
    const button = document.createElement('button');
    button.className = 'focus-mode-toggle';
    button.setAttribute('aria-label', 'Toggle focus mode');
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
      <span class="focus-mode-tooltip">Focus Mode (F)</span>
    `;
    
    button.addEventListener('click', () => this.toggle());
    document.body.appendChild(button);
    this.toggleButton = button;
  }
  
  createControls() {
    const controls = document.createElement('div');
    controls.className = 'focus-mode-controls';
    controls.innerHTML = `
      <!-- Font Size -->
      <div class="focus-mode-controls-section">
        <span class="focus-mode-control-label">Size</span>
        <div class="focus-mode-font-size">
          <button class="focus-mode-btn" data-action="font-decrease" aria-label="Decrease font size">A-</button>
          <button class="focus-mode-btn" data-action="font-increase" aria-label="Increase font size">A+</button>
        </div>
      </div>
      
      <!-- Theme -->
      <div class="focus-mode-controls-section">
        <span class="focus-mode-control-label">Theme</span>
        <div class="focus-mode-themes">
          <button class="focus-mode-theme focus-mode-theme-dark active" data-theme="dark" aria-label="Dark theme"></button>
          <button class="focus-mode-theme focus-mode-theme-light" data-theme="light" aria-label="Light theme"></button>
          <button class="focus-mode-theme focus-mode-theme-sepia" data-theme="sepia" aria-label="Sepia theme"></button>
        </div>
      </div>
      
      <!-- Line Width -->
      <div class="focus-mode-controls-section">
        <span class="focus-mode-control-label">Width</span>
        <div class="focus-mode-width">
          <div class="focus-mode-width-option focus-mode-width-narrow" data-width="narrow" aria-label="Narrow width">
            <div class="focus-mode-width-bar">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="focus-mode-width-option focus-mode-width-medium active" data-width="medium" aria-label="Medium width">
            <div class="focus-mode-width-bar">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="focus-mode-width-option focus-mode-width-wide" data-width="wide" aria-label="Wide width">
            <div class="focus-mode-width-bar">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Exit -->
      <button class="focus-mode-exit" data-action="exit">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
        Exit
      </button>
    `;
    
    document.body.appendChild(controls);
    this.controls = controls;
    
    // Bind control events
    controls.querySelector('[data-action="font-decrease"]').addEventListener('click', () => this.adjustFontSize(-10));
    controls.querySelector('[data-action="font-increase"]').addEventListener('click', () => this.adjustFontSize(10));
    controls.querySelector('[data-action="exit"]').addEventListener('click', () => this.deactivate());
    
    // Theme buttons
    controls.querySelectorAll('.focus-mode-theme').forEach(btn => {
      btn.addEventListener('click', () => this.setTheme(btn.dataset.theme));
    });
    
    // Width options
    controls.querySelectorAll('.focus-mode-width-option').forEach(option => {
      option.addEventListener('click', () => this.setLineWidth(option.dataset.width));
    });
  }
  
  createProgressBar() {
    const progress = document.createElement('div');
    progress.className = 'focus-mode-progress';
    progress.innerHTML = '<div class="focus-mode-progress-bar"></div>';
    document.body.appendChild(progress);
    this.progressBar = progress.querySelector('.focus-mode-progress-bar');
  }
  
  createInfoPanel() {
    const info = document.createElement('div');
    info.className = 'focus-mode-info';
    info.innerHTML = `
      <div class="focus-mode-info-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        Reading Stats
      </div>
      <div class="focus-mode-info-stats">
        <div class="focus-mode-stat">
          <div class="focus-mode-stat-value" id="focusWordCount">0</div>
          <div class="focus-mode-stat-label">Words</div>
        </div>
        <div class="focus-mode-stat">
          <div class="focus-mode-stat-value" id="focusProgress">0%</div>
          <div class="focus-mode-stat-label">Progress</div>
        </div>
      </div>
      <div class="focus-mode-reading-time">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        <span id="focusReadingTime">2 min read</span>
      </div>
    `;
    
    document.body.appendChild(info);
    this.infoPanel = info;
    this.wordCountEl = info.querySelector('#focusWordCount');
    this.progressEl = info.querySelector('#focusProgress');
    this.readingTimeEl = info.querySelector('#focusReadingTime');
  }
  
  bindEvents() {
    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
          return;
        }
        e.preventDefault();
        this.toggle();
      }
      
      if (e.key === 'Escape' && this.isActive) {
        this.deactivate();
      }
    });
    
    // Detect scrollable content areas
    this.detectContentAreas();
  }
  
  detectContentAreas() {
    // Find main content sections that could be focusable
    const sections = document.querySelectorAll('section, article, .section, .content');
    sections.forEach(section => {
      const textContent = section.textContent || '';
      const wordCount = textContent.trim().split(/\s+/).length;
      
      // Only make sections focusable if they have substantial content
      if (wordCount > 100) {
        section.classList.add('potential-focus-container');
        
        // Add double-click to focus
        section.addEventListener('dblclick', (e) => {
          if (!this.isActive) {
            this.activate(section);
          }
        });
      }
    });
  }
  
  toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      // Find the most suitable content container
      const container = this.findBestContainer();
      this.activate(container);
    }
  }
  
  findBestContainer() {
    // Try to find the current section in viewport
    const sections = document.querySelectorAll('.potential-focus-container, section, article');
    const viewportCenter = window.scrollY + window.innerHeight / 2;
    
    let bestContainer = null;
    let bestDistance = Infinity;
    
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = window.scrollY + rect.top + rect.height / 2;
      const distance = Math.abs(sectionCenter - viewportCenter);
      
      if (rect.height > 200 && distance < bestDistance) {
        bestDistance = distance;
        bestContainer = section;
      }
    });
    
    // Fallback to main content or hero
    return bestContainer || 
           document.querySelector('#main-content') || 
           document.querySelector('.hero') ||
           document.querySelector('main') ||
           document.body;
  }
  
  activate(container) {
    if (!container) return;
    
    this.currentContainer = container;
    this.isActive = true;
    
    // Add classes
    document.body.classList.add('focus-mode', 'active');
    container.classList.add('focus-container', 'active');
    this.toggleButton.classList.add('active');
    
    // Calculate reading stats
    this.calculateStats();
    
    // Start progress tracking
    this.startProgressTracking();
    
    // Apply current settings
    this.applySettings();
    
    // Add paragraph indicators
    this.addParagraphIndicators();
    
    // Store reference
    this.updateParagraphObserver();
    
    // Show toast
    if (window.showToast) {
      window.showToast('Focus mode enabled. Press ESC to exit.', 'info');
    }
    
    // Save state
    localStorage.setItem('focusModeActive', 'true');
  }
  
  deactivate() {
    this.isActive = false;
    
    // Remove classes
    document.body.classList.remove('focus-mode', 'active', 'focus-mode-light', 'focus-mode-sepia');
    
    if (this.currentContainer) {
      this.currentContainer.classList.remove('focus-container', 'active');
      this.removeParagraphIndicators();
    }
    
    this.toggleButton.classList.remove('active');
    
    // Stop progress tracking
    this.stopProgressTracking();
    
    // Disconnect observer
    if (this.paragraphObserver) {
      this.paragraphObserver.disconnect();
      this.paragraphObserver = null;
    }
    
    // Reset styles
    if (this.currentContainer) {
      this.currentContainer.style.fontSize = '';
      this.currentContainer.style.maxWidth = '';
      this.currentContainer.style.margin = '';
    }
    
    this.currentContainer = null;
    
    // Remove saved state
    localStorage.removeItem('focusModeActive');
  }
  
  calculateStats() {
    if (!this.currentContainer) return;
    
    const text = this.currentContainer.textContent || '';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200); // Average reading speed
    
    if (this.wordCountEl) this.wordCountEl.textContent = words.toLocaleString();
    if (this.readingTimeEl) this.readingTimeEl.textContent = `${minutes} min read`;
  }
  
  startProgressTracking() {
    if (!this.currentContainer) return;
    
    this.scrollListener = () => {
      const container = this.currentContainer;
      const rect = container.getBoundingClientRect();
      const containerHeight = container.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // Calculate how much of the container has been scrolled through
      const scrollTop = -rect.top;
      const scrollableHeight = containerHeight - viewportHeight;
      
      let progress = 0;
      if (scrollableHeight > 0) {
        progress = Math.max(0, Math.min(100, (scrollTop / scrollableHeight) * 100));
      }
      
      this.readingProgress = Math.round(progress);
      
      if (this.progressBar) {
        this.progressBar.style.width = `${this.readingProgress}%`;
      }
      
      if (this.progressEl) {
        this.progressEl.textContent = `${this.readingProgress}%`;
      }
    };
    
    window.addEventListener('scroll', this.scrollListener, { passive: true });
    this.scrollListener(); // Initial call
  }
  
  stopProgressTracking() {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = null;
    }
    
    this.readingProgress = 0;
    if (this.progressBar) this.progressBar.style.width = '0%';
  }
  
  addParagraphIndicators() {
    if (!this.currentContainer) return;
    
    const paragraphs = this.currentContainer.querySelectorAll('p');
    paragraphs.forEach((p, i) => {
      p.style.position = 'relative';
      
      // Add indicator
      const indicator = document.createElement('span');
      indicator.className = 'focus-paragraph-indicator';
      indicator.dataset.index = i;
      p.appendChild(indicator);
    });
  }
  
  removeParagraphIndicators() {
    if (!this.currentContainer) return;
    
    const indicators = this.currentContainer.querySelectorAll('.focus-paragraph-indicator');
    indicators.forEach(ind => ind.remove());
    
    const currentParagraphs = this.currentContainer.querySelectorAll('.current-paragraph');
    currentParagraphs.forEach(p => p.classList.remove('current-paragraph'));
  }
  
  updateParagraphObserver() {
    if (!this.currentContainer) return;
    
    const paragraphs = this.currentContainer.querySelectorAll('p');
    
    this.paragraphObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          // Remove current from others
          paragraphs.forEach(p => p.classList.remove('current-paragraph'));
          // Add to current
          entry.target.classList.add('current-paragraph');
        }
      });
    }, {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: [0, 0.5, 1]
    });
    
    paragraphs.forEach(p => this.paragraphObserver.observe(p));
  }
  
  adjustFontSize(delta) {
    this.fontSize = Math.max(80, Math.min(150, this.fontSize + delta));
    this.applyFontSize();
    this.saveSettings();
  }
  
  applyFontSize() {
    if (this.currentContainer) {
      this.currentContainer.style.fontSize = `${this.fontSize}%`;
    }
  }
  
  setTheme(theme) {
    this.theme = theme;
    
    // Update button states
    this.controls.querySelectorAll('.focus-mode-theme').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    
    // Apply theme classes
    document.body.classList.remove('focus-mode-light', 'focus-mode-sepia');
    if (theme !== 'dark') {
      document.body.classList.add(`focus-mode-${theme}`);
    }
    
    this.saveSettings();
  }
  
  setLineWidth(width) {
    this.lineWidth = width;
    
    // Update UI
    this.controls.querySelectorAll('.focus-mode-width-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.width === width);
    });
    
    // Apply width
    if (this.currentContainer) {
      const widths = {
        narrow: '600px',
        medium: '800px',
        wide: '1000px'
      };
      this.currentContainer.style.maxWidth = widths[width];
      this.currentContainer.style.margin = '0 auto';
    }
    
    this.saveSettings();
  }
  
  applySettings() {
    this.applyFontSize();
    this.setTheme(this.theme);
    this.setLineWidth(this.lineWidth);
  }
  
  saveSettings() {
    localStorage.setItem('focusModeSettings', JSON.stringify({
      fontSize: this.fontSize,
      theme: this.theme,
      lineWidth: this.lineWidth
    }));
  }
  
  loadSettings() {
    const saved = localStorage.getItem('focusModeSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      this.fontSize = settings.fontSize || 100;
      this.theme = settings.theme || 'dark';
      this.lineWidth = settings.lineWidth || 'medium';
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new FocusModeSystem());
} else {
  new FocusModeSystem();
}

export default FocusModeSystem;
