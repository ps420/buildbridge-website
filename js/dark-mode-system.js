/**
 * BuildBridge Dark Mode System v13.0
 * Fortune 500-grade theme switching with persistent state
 */

class DarkModeSystem {
  constructor(options = {}) {
    this.options = {
      storageKey: 'buildbridge-theme',
      defaultTheme: 'dark',
      togglePosition: 'fixed',
      respectSystemPreference: true,
      transitionDuration: 300,
      ...options
    };

    this.currentTheme = this.getInitialTheme();
    this.toggle = null;
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme, false);
    this.createToggle();
    this.bindEvents();
    this.notifyThemeChange();
    
    console.log(`🌓 Dark Mode System activated - Current theme: ${this.currentTheme}`);
  }

  getInitialTheme() {
    // Check localStorage first
    const saved = localStorage.getItem(this.options.storageKey);
    if (saved) return saved;

    // Check system preference
    if (this.options.respectSystemPreference) {
      return this.mediaQuery.matches ? 'dark' : 'light';
    }

    return this.options.defaultTheme;
  }

  applyTheme(theme, animate = true) {
    this.currentTheme = theme;

    if (animate) {
      // Add transition class
      document.documentElement.classList.add('theme-transition');
      
      // Remove after transition
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, this.options.transitionDuration);
    }

    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f0f10' : '#fafafa');
    }

    // Update toggle state
    this.updateToggleState();

    // Store preference
    localStorage.setItem(this.options.storageKey, theme);

    // Dispatch event
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { theme, previousTheme: this.currentTheme === 'dark' ? 'light' : 'dark' }
    }));
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme, true);
    
    // Show toast notification
    if (window.Toast) {
      Toast.success(`Switched to ${newTheme} mode`, {
        duration: 2000
      });
    }
  }

  createToggle() {
    // Create icon-only toggle
    this.toggle = document.createElement('button');
    this.toggle.className = 'theme-toggle-icon';
    this.toggle.setAttribute('aria-label', 'Toggle dark mode');
    this.toggle.setAttribute('aria-pressed', this.currentTheme === 'dark');
    this.toggle.innerHTML = `
      <svg class="moon-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
      </svg>
      <svg class="sun-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>
    `;

    document.body.appendChild(this.toggle);
    this.updateToggleState();
  }

  updateToggleState() {
    if (!this.toggle) return;
    
    const isDark = this.currentTheme === 'dark';
    this.toggle.setAttribute('aria-pressed', isDark);
    this.toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  bindEvents() {
    // Toggle click
    this.toggle.addEventListener('click', () => this.toggleTheme());

    // Keyboard shortcut (Ctrl/Cmd + Shift + L)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        this.toggleTheme();
      }
    });

    // Listen for system preference changes
    if (this.options.respectSystemPreference) {
      this.mediaQuery.addEventListener('change', (e) => {
        // Only apply if user hasn't set a preference
        if (!localStorage.getItem(this.options.storageKey)) {
          this.applyTheme(e.matches ? 'dark' : 'light', true);
        }
      });
    }

    // Listen for theme change from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === this.options.storageKey) {
        this.applyTheme(e.newValue || this.options.defaultTheme, true);
      }
    });
  }

  notifyThemeChange() {
    // Notify any waiting components
    window.dispatchEvent(new CustomEvent('themeReady', { 
      detail: { theme: this.currentTheme }
    }));
  }

  // Public API
  getTheme() {
    return this.currentTheme;
  }

  setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      this.applyTheme(theme, true);
    }
  }

  isDark() {
    return this.currentTheme === 'dark';
  }

  onChange(callback) {
    window.addEventListener('themeChange', (e) => callback(e.detail));
  }

  // Force a theme without saving to storage
  previewTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Revert preview
  revertPreview() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.darkMode = new DarkModeSystem();
});

// Expose to global
window.DarkModeSystem = DarkModeSystem;
