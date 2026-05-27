/**
 * THEME MANAGER v21.0
 * Fortune 500 Theme System
 * Dark/Light Mode with Auto Detection
 */

(function() {
  'use strict';
  
  const ThemeManager = {
    currentTheme: 'dark',
    storageKey: 'buildbridge-theme',
    audioContext: null,
    
    /**
     * Initialize theme manager
     */
    init() {
      this.loadTheme();
      this.createToggle();
      this.setupListeners();
      this.setupSystemPreference();
      
      console.log('🎨 Theme Manager initialized');
    },
    
    /**
     * Load saved theme or detect system preference
     */
    loadTheme() {
      const savedTheme = localStorage.getItem(this.storageKey);
      
      if (savedTheme) {
        this.setTheme(savedTheme, false);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark ? 'dark' : 'light', false);
      }
    },
    
    /**
     * Set theme
     */
    setTheme(theme, animate = true) {
      if (theme === this.currentTheme && !animate) return;
      
      const oldTheme = this.currentTheme;
      this.currentTheme = theme;
      
      if (animate) {
        this.animateTransition(() => {
          document.documentElement.setAttribute('data-theme', theme);
          this.updateToggleIcon(theme);
        });
      } else {
        document.documentElement.setAttribute('data-theme', theme);
        this.updateToggleIcon(theme);
      }
      
      localStorage.setItem(this.storageKey, theme);
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { theme, oldTheme }
      }));
      
      // Play sound effect if enabled
      if (animate) {
        this.playToggleSound();
      }
    },
    
    /**
     * Toggle theme
     */
    toggle() {
      const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme, true);
    },
    
    /**
     * Animate theme transition
     */
    animateTransition(callback) {
      // Create transition overlay
      const overlay = document.createElement('div');
      overlay.className = 'theme-transition-overlay';
      document.body.appendChild(overlay);
      
      // Force reflow
      overlay.offsetHeight;
      
      // Fade in
      overlay.classList.add('active');
      
      setTimeout(() => {
        callback();
        
        // Fade out
        overlay.classList.remove('active');
        
        setTimeout(() => {
          overlay.remove();
        }, 300);
      }, 300);
    },
    
    /**
     * Create theme toggle button
     */
    createToggle() {
      const toggle = document.createElement('button');
      toggle.className = 'theme-toggle';
      toggle.setAttribute('aria-label', 'Toggle theme');
      toggle.setAttribute('title', 'Toggle theme (press T)');
      toggle.innerHTML = `
        <svg class="sun-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
        <svg class="moon-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      `;
      
      toggle.addEventListener('click', () => this.toggle());
      
      document.body.appendChild(toggle);
      this.updateToggleIcon(this.currentTheme);
    },
    
    /**
     * Update toggle icon
     */
    updateToggleIcon(theme) {
      // Icons are handled via CSS based on data-theme attribute
    },
    
    /**
     * Setup event listeners
     */
    setupListeners() {
      // Keyboard shortcut
      document.addEventListener('keydown', (e) => {
        if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
          // Don't trigger if typing in an input
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
          }
          e.preventDefault();
          this.toggle();
        }
      });
    },
    
    /**
     * Setup system preference detection
     */
    setupSystemPreference() {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem(this.storageKey)) {
          this.setTheme(e.matches ? 'dark' : 'light', true);
        }
      });
    },
    
    /**
     * Play toggle sound effect
     */
    playToggleSound() {
      try {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        if (this.currentTheme === 'dark') {
          // Lower pitch for dark mode
          oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + 0.1);
        } else {
          // Higher pitch for light mode
          oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.1);
        }
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
      } catch (e) {
        // Audio not supported or blocked
      }
    },
    
    /**
     * Get current theme
     */
    getTheme() {
      return this.currentTheme;
    },
    
    /**
     * Check if dark mode
     */
    isDark() {
      return this.currentTheme === 'dark';
    },
    
    /**
     * Reset to auto (system preference)
     */
    reset() {
      localStorage.removeItem(this.storageKey);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light', true);
    }
  };
  
  // Expose to global scope
  window.ThemeManager = ThemeManager;
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
  } else {
    ThemeManager.init();
  }
})();
