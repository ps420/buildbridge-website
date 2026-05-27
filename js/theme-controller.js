/**
 * v28.0: Theme Controller
 * Dark/Light mode system with localStorage persistence and smooth transitions
 */

(function() {
  'use strict';
  
  const ThemeController = {
    // Configuration
    config: {
      storageKey: 'buildbridge-theme',
      defaultTheme: 'dark',
      toggleSelector: '.theme-toggle',
      transitionDuration: 500
    },
    
    // State
    currentTheme: 'dark',
    systemPreference: 'dark',
    isTransitioning: false,
    
    /**
     * Initialize the theme controller
     */
    init() {
      this.detectSystemPreference();
      this.loadSavedTheme();
      this.createToggleButton();
      this.applyTheme(this.currentTheme, false);
      this.bindEvents();
      this.observeSystemChanges();
      
      console.log('🎨 BuildBridge Theme Controller initialized:', this.currentTheme);
    },
    
    /**
     * Detect system color scheme preference
     */
    detectSystemPreference() {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        this.systemPreference = 'light';
      }
    },
    
    /**
     * Load saved theme from localStorage
     */
    loadSavedTheme() {
      try {
        const saved = localStorage.getItem(this.config.storageKey);
        if (saved && (saved === 'dark' || saved === 'light')) {
          this.currentTheme = saved;
        } else if (this.systemPreference) {
          this.currentTheme = this.systemPreference;
        }
      } catch (e) {
        console.warn('Could not access localStorage for theme');
      }
    },
    
    /**
     * Create the theme toggle button
     */
    createToggleButton() {
      // Check if button already exists
      if (document.querySelector(this.config.toggleSelector)) return;
      
      const button = document.createElement('button');
      button.className = 'theme-toggle';
      button.setAttribute('aria-label', 'Toggle dark/light mode');
      button.setAttribute('title', `Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} mode`);
      button.innerHTML = `
        <span class="icon sun">☀️</span>
        <span class="icon moon">🌙</span>
      `;
      
      document.body.appendChild(button);
      this.toggleButton = button;
    },
    
    /**
     * Apply theme to document
     */
    applyTheme(theme, animate = true) {
      if (this.isTransitioning) return;
      
      const root = document.documentElement;
      const oldTheme = this.currentTheme;
      
      if (animate) {
        this.isTransitioning = true;
        
        // Add transition overlay for smooth effect
        const overlay = document.createElement('div');
        overlay.className = 'theme-transition-overlay';
        document.body.appendChild(overlay);
        
        // Trigger reflow
        overlay.offsetHeight;
        
        // Fade in
        requestAnimationFrame(() => {
          overlay.classList.add('active');
        });
        
        // Switch theme during fade
        setTimeout(() => {
          root.setAttribute('data-theme', theme);
          this.currentTheme = theme;
          this.updateToggleButton();
          this.saveTheme();
          
          // Dispatch custom event
          window.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme, oldTheme }
          }));
          
          // Fade out
          setTimeout(() => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
            this.isTransitioning = false;
          }, 100);
        }, 200);
      } else {
        root.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.updateToggleButton();
      }
    },
    
    /**
     * Update toggle button state
     */
    updateToggleButton() {
      if (!this.toggleButton) return;
      
      this.toggleButton.setAttribute('title', 
        `Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} mode`
      );
      this.toggleButton.setAttribute('aria-pressed', this.currentTheme === 'dark');
    },
    
    /**
     * Toggle between themes
     */
    toggle() {
      const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      this.applyTheme(newTheme, true);
    },
    
    /**
     * Save theme preference
     */
    saveTheme() {
      try {
        localStorage.setItem(this.config.storageKey, this.currentTheme);
      } catch (e) {
        console.warn('Could not save theme preference');
      }
    },
    
    /**
     * Bind event listeners
     */
    bindEvents() {
      // Toggle button click
      document.addEventListener('click', (e) => {
        if (e.target.closest(this.config.toggleSelector)) {
          e.preventDefault();
          
          // Add switching animation class
          const btn = e.target.closest(this.config.toggleSelector);
          btn.classList.add('switching');
          setTimeout(() => btn.classList.remove('switching'), 500);
          
          this.toggle();
        }
      });
      
      // Keyboard shortcut (Alt+T)
      document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 't') {
          e.preventDefault();
          this.toggle();
          
          // Show toast notification
          if (window.Toast) {
            Toast.info(`Switched to ${this.currentTheme === 'dark' ? 'light' : 'dark'} mode`, {
              duration: 2000
            });
          }
        }
      });
    },
    
    /**
     * Watch for system preference changes
     */
    observeSystemChanges() {
      if (!window.matchMedia) return;
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set preference
        const hasUserPreference = localStorage.getItem(this.config.storageKey);
        if (!hasUserPreference) {
          const newTheme = e.matches ? 'light' : 'dark';
          this.applyTheme(newTheme, true);
        }
      });
    },
    
    /**
     * Get current theme
     */
    getTheme() {
      return this.currentTheme;
    },
    
    /**
     * Set theme programmatically
     */
    setTheme(theme, animate = true) {
      if (theme !== 'dark' && theme !== 'light') {
        console.warn('Invalid theme:', theme);
        return;
      }
      this.applyTheme(theme, animate);
    },
    
    /**
     * Check if dark mode is active
     */
    isDark() {
      return this.currentTheme === 'dark';
    },
    
    /**
     * Reset to system preference
     */
    reset() {
      try {
        localStorage.removeItem(this.config.storageKey);
        const theme = this.systemPreference;
        this.applyTheme(theme, true);
      } catch (e) {
        console.warn('Could not reset theme');
      }
    }
  };
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeController.init());
  } else {
    ThemeController.init();
  }
  
  // Expose to global scope
  window.ThemeController = ThemeController;
  
})();
