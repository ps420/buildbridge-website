/**
 * Theme Toggle System v1.0
 * Dark/Light Mode with Persistence and Animations
 */

class ThemeToggle {
  constructor(options = {}) {
    this.key = options.storageKey || 'buildbridge-theme';
    this.defaultTheme = options.defaultTheme || 'dark';
    this.transitionDuration = options.transitionDuration || 500;
    this.toggleButton = null;
    this.currentTheme = this.defaultTheme;
    
    this.init();
  }

  init() {
    this.loadTheme();
    this.createToggleButton();
    this.applyTheme();
    this.setupSystemPreferenceListener();
  }

  loadTheme() {
    const saved = localStorage.getItem(this.key);
    if (saved) {
      this.currentTheme = saved;
    } else if (window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme = prefersDark ? 'dark' : 'light';
    }
  }

  saveTheme() {
    localStorage.setItem(this.key, this.currentTheme);
  }

  createToggleButton() {
    // Check if button already exists
    if (document.querySelector('.theme-toggle')) {
      this.toggleButton = document.querySelector('.theme-toggle');
      this.bindToggleEvents();
      return;
    }

    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'theme-toggle';
    this.toggleButton.setAttribute('aria-label', 'Toggle dark/light theme');
    this.toggleButton.innerHTML = `
      <span class="theme-toggle-ripple"></span>
      <span class="theme-toggle-icon sun-icon">☀️</span>
      <span class="theme-toggle-icon moon-icon">🌙</span>
    `;

    document.body.appendChild(this.toggleButton);
    this.bindToggleEvents();

    // Show with animation
    setTimeout(() => {
      this.toggleButton.style.opacity = '1';
      this.toggleButton.style.transform = 'scale(1)';
    }, 100);
  }

  bindToggleEvents() {
    this.toggleButton.addEventListener('click', (e) => this.toggle(e));

    // Keyboard shortcut (T)
    document.addEventListener('keydown', (e) => {
      if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't trigger if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          return;
        }
        this.toggle();
      }
    });
  }

  toggle(e) {
    // Add animating class for ripple
    if (this.toggleButton) {
      this.toggleButton.classList.add('animating');
      setTimeout(() => {
        this.toggleButton.classList.remove('animating');
      }, 600);
    }

    // Switch theme
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
    this.saveTheme();

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: this.currentTheme }
    }));

    // Show toast notification
    if (window.Toast) {
      const message = this.currentTheme === 'dark' 
        ? 'Switched to dark mode' 
        : 'Switched to light mode';
      Toast.info(message, { duration: 2000 });
    }
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', 
        this.currentTheme === 'dark' ? '#0f0f10' : '#F5F7FA'
      );
    }

    // Update button state
    if (this.toggleButton) {
      this.toggleButton.setAttribute('aria-pressed', this.currentTheme === 'dark');
    }
  }

  setupSystemPreferenceListener() {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set preference
        if (!localStorage.getItem(this.key)) {
          this.currentTheme = e.matches ? 'dark' : 'light';
          this.applyTheme();
        }
      });
    } else if (mediaQuery.addListener) {
      // Older API fallback
      mediaQuery.addListener((e) => {
        if (!localStorage.getItem(this.key)) {
          this.currentTheme = e.matches ? 'dark' : 'light';
          this.applyTheme();
        }
      });
    }
  }

  // Public API
  setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      this.currentTheme = theme;
      this.applyTheme();
      this.saveTheme();
    }
  }

  getTheme() {
    return this.currentTheme;
  }

  isDark() {
    return this.currentTheme === 'dark';
  }

  isLight() {
    return this.currentTheme === 'light';
  }

  destroy() {
    if (this.toggleButton) {
      this.toggleButton.remove();
    }
    document.documentElement.removeAttribute('data-theme');
  }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  window.themeToggle = new ThemeToggle({
    storageKey: 'buildbridge-theme',
    defaultTheme: 'dark'
  });
});

// Export for module usage
window.ThemeToggle = ThemeToggle;
