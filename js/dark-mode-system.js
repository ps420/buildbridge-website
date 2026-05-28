/**
 * v47.0: DARK MODE SYSTEM - Fortune 500 Professional
 * Comprehensive theme management with smooth transitions
 */

class DarkModeSystem {
  constructor() {
    this.currentTheme = 'light';
    this.systemPreference = null;
    this.toggleButton = null;
    this.transitionOverlay = null;
    
    this.init();
  }

  init() {
    // Check for saved preference or system preference
    this.loadTheme();
    
    // Create toggle button
    this.createToggleButton();
    
    // Create transition overlay
    this.createTransitionOverlay();
    
    // Listen for system preference changes
    this.listenForSystemChanges();
    
    // Add keyboard shortcut (Cmd/Ctrl + Shift + L)
    this.addKeyboardShortcut();
    
    // Announce theme to screen readers
    this.announceTheme();
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('buildbridge-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else if (systemPrefersDark) {
      this.currentTheme = 'dark';
    }
    
    this.applyTheme(this.currentTheme, false);
  }

  applyTheme(theme, animate = true) {
    this.currentTheme = theme;
    
    // Disable transitions temporarily to prevent flash
    document.body.classList.add('no-theme-transition');
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);
    
    // Re-enable transitions
    setTimeout(() => {
      document.body.classList.remove('no-theme-transition');
    }, 100);
    
    // Update toggle button if exists
    if (this.toggleButton) {
      this.updateToggleButton(theme);
    }
    
    // Store preference
    localStorage.setItem('buildbridge-theme', theme);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme, previousTheme: theme === 'dark' ? 'light' : 'dark' }
    }));
    
    // Announce to screen readers
    this.announceTheme();
  }

  toggleTheme(e) {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    
    // Animate theme transition
    this.animateThemeTransition(e, newTheme);
  }

  animateThemeTransition(e, newTheme) {
    // If click event provided, use circular reveal
    if (e && e.clientX && e.clientY) {
      this.circularRevealTransition(e.clientX, e.clientY, newTheme);
    } else {
      // Fall back to fade transition
      this.fadeTransition(newTheme);
    }
  }

  circularRevealTransition(x, y, newTheme) {
    const circle = document.createElement('div');
    circle.className = 'theme-reveal-circle';
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    circle.style.width = '100vmax';
    circle.style.height = '100vmax';
    circle.style.marginLeft = '-50vmax';
    circle.style.marginTop = '-50vmax';
    
    document.body.appendChild(circle);
    
    // Trigger animation
    requestAnimationFrame(() => {
      circle.classList.add('expanding');
      
      // Apply theme mid-animation
      setTimeout(() => {
        this.applyTheme(newTheme);
      }, 200);
      
      // Clean up after animation
      setTimeout(() => {
        circle.remove();
      }, 600);
    });
  }

  fadeTransition(newTheme) {
    if (this.transitionOverlay) {
      this.transitionOverlay.classList.add('active');
      
      setTimeout(() => {
        this.applyTheme(newTheme);
        
        setTimeout(() => {
          this.transitionOverlay.classList.remove('active');
        }, 300);
      }, 300);
    } else {
      this.applyTheme(newTheme);
    }
  }

  createToggleButton() {
    // Check if button already exists
    if (document.querySelector('.dark-mode-toggle')) return;
    
    const button = document.createElement('button');
    button.className = 'dark-mode-toggle';
    button.setAttribute('aria-label', 'Toggle dark mode');
    button.setAttribute('title', 'Toggle dark mode (⌘/Ctrl + Shift + L)');
    button.innerHTML = `
      <svg class="toggle-icon toggle-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <svg class="toggle-icon toggle-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    `;
    
    button.addEventListener('click', (e) => this.toggleTheme(e));
    
    document.body.appendChild(button);
    this.toggleButton = button;
    
    // Update initial state
    this.updateToggleButton(this.currentTheme);
  }

  updateToggleButton(theme) {
    if (!this.toggleButton) return;
    
    this.toggleButton.setAttribute('aria-label', 
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  createTransitionOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'theme-transition-overlay';
    document.body.appendChild(overlay);
    this.transitionOverlay = overlay;
  }

  listenForSystemChanges() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      this.systemPreference = e.matches ? 'dark' : 'light';
      
      // Only auto-switch if user hasn't manually set preference
      const savedTheme = localStorage.getItem('buildbridge-theme');
      if (!savedTheme) {
        this.applyTheme(this.systemPreference);
      }
    });
  }

  addKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + Shift + L
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  announceTheme() {
    // Create or update live region for screen readers
    let announcer = document.getElementById('theme-announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'theme-announcer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(announcer);
    }
    
    announcer.textContent = `Switched to ${this.currentTheme} mode`;
  }

  // Public API
  getTheme() {
    return this.currentTheme;
  }

  setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      this.applyTheme(theme);
    }
  }

  resetToSystemPreference() {
    localStorage.removeItem('buildbridge-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyTheme(systemPrefersDark ? 'dark' : 'light');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.darkModeSystem = new DarkModeSystem();
  });
} else {
  window.darkModeSystem = new DarkModeSystem();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DarkModeSystem;
}
