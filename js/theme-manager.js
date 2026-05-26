/**
 * Theme Manager v9.0 - Fortune 500 Dark/Light Mode
 * System preference detection, manual toggle, and persistence
 */

(function() {
  'use strict';

  // Theme Manager Class
  class ThemeManager {
    constructor() {
      this.STORAGE_KEY = 'buildbridge-theme-preference';
      this.SYSTEM_PREFERS_KEY = 'buildbridge-system-preference';
      this.themeToggle = null;
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      
      this.init();
    }

    init() {
      // Create theme toggle button
      this.createToggleButton();
      
      // Initialize theme based on saved preference or system
      this.initializeTheme();
      
      // Listen for system theme changes
      this.mediaQuery.addEventListener('change', (e) => this.handleSystemChange(e));
      
      console.log('🌓 Theme Manager v9.0 initialized');
    }

    /**
     * Create the theme toggle button
     */
    createToggleButton() {
      const button = document.createElement('button');
      button.className = 'theme-toggle';
      button.setAttribute('aria-label', 'Toggle dark/light mode');
      button.setAttribute('data-tooltip', 'Toggle theme');
      button.innerHTML = `
        <div class="theme-toggle-icons">
          <span class="theme-toggle-sun">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          </span>
          <span class="theme-toggle-moon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </span>
        </div>
      `;

      // Add click handler with ripple effect
      button.addEventListener('click', (e) => this.handleToggle(e));
      
      document.body.appendChild(button);
      this.themeToggle = button;
      
      // Add keyboard shortcut (Alt+T)
      document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 't') {
          e.preventDefault();
          this.toggleTheme();
        }
      });
    }

    /**
     * Handle theme toggle click
     */
    handleToggle(event) {
      // Create ripple effect
      this.createRipple(event);
      
      // Toggle theme
      this.toggleTheme();
    }

    /**
     * Create ripple effect on button
     */
    createRipple(event) {
      const button = this.themeToggle;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(201, 206, 214, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `;
      
      button.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      this.applyTheme(newTheme);
      this.savePreference(newTheme);
      
      // Show toast notification
      this.showThemeToast(newTheme);
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('themechange', { 
        detail: { theme: newTheme } 
      }));
    }

    /**
     * Apply theme to document
     */
    applyTheme(theme) {
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }

    /**
     * Initialize theme on page load
     */
    initializeTheme() {
      const savedPreference = this.getSavedPreference();
      
      if (savedPreference) {
        // Use saved preference
        this.applyTheme(savedPreference);
      } else {
        // Check system preference
        const prefersLight = this.mediaQuery.matches;
        this.applyTheme(prefersLight ? 'light' : 'dark');
        
        // Save system preference for reference
        localStorage.setItem(this.SYSTEM_PREFERS_KEY, prefersLight ? 'light' : 'dark');
      }
    }

    /**
     * Handle system theme preference change
     */
    handleSystemChange(event) {
      // Only apply system change if user hasn't set a manual preference
      const savedPreference = this.getSavedPreference();
      
      if (!savedPreference) {
        const newTheme = event.matches ? 'light' : 'dark';
        this.applyTheme(newTheme);
      }
    }

    /**
     * Get saved theme preference
     */
    getSavedPreference() {
      try {
        return localStorage.getItem(this.STORAGE_KEY);
      } catch (e) {
        console.warn('LocalStorage not available for theme preference');
        return null;
      }
    }

    /**
     * Save theme preference
     */
    savePreference(theme) {
      try {
        localStorage.setItem(this.STORAGE_KEY, theme);
      } catch (e) {
        console.warn('Could not save theme preference');
      }
    }

    /**
     * Show theme change toast notification
     */
    showThemeToast(theme) {
      if (typeof Toast !== 'undefined') {
        const message = theme === 'light' 
          ? '☀️ Light mode activated' 
          : '🌙 Dark mode activated';
        
        Toast.info(message, {
          duration: 3000,
          position: 'bottom-left'
        });
      }
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    /**
     * Reset to system preference
     */
    resetToSystem() {
      localStorage.removeItem(this.STORAGE_KEY);
      const prefersLight = this.mediaQuery.matches;
      this.applyTheme(prefersLight ? 'light' : 'dark');
      
      if (typeof Toast !== 'undefined') {
        Toast.info('🔄 Theme set to system preference', { duration: 3000 });
      }
    }
  }

  // Add ripple animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ThemeManager());
  } else {
    new ThemeManager();
  }

  // Expose to global scope for debugging/manual control
  window.ThemeManager = ThemeManager;
})();
