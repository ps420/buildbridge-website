/**
 * v106.0: Adaptive Theme System
 * Fortune 500 Dynamic Light/Dark Mode with Auto-Switching
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    storageKey: 'buildbridge-theme',
    autoSwitchKey: 'buildbridge-auto-theme',
    defaultTheme: 'dark',
    sunriseHour: 6,    // 6 AM
    sunsetHour: 18,    // 6 PM
    transitionDuration: 500
  };

  class ThemeManager {
    constructor() {
      this.currentTheme = null;
      this.autoSwitch = false;
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      this.init();
    }

    init() {
      this.loadSettings();
      this.applyTheme(this.currentTheme);
      this.bindEvents();
      this.checkAutoSwitch();
      
      console.log('🎨 Theme System v106.0 initialized:', this.currentTheme);
    }

    loadSettings() {
      // Load saved theme or detect system preference
      const savedTheme = localStorage.getItem(CONFIG.storageKey);
      const savedAutoSwitch = localStorage.getItem(CONFIG.autoSwitchKey);
      
      if (savedTheme) {
        this.currentTheme = savedTheme;
      } else {
        // Detect system preference
        this.currentTheme = this.mediaQuery.matches ? 'dark' : 'light';
      }
      
      this.autoSwitch = savedAutoSwitch === 'true';
    }

    saveSettings() {
      localStorage.setItem(CONFIG.storageKey, this.currentTheme);
      localStorage.setItem(CONFIG.autoSwitchKey, this.autoSwitch.toString());
    }

    applyTheme(theme, animate = true) {
      if (!theme) return;
      
      // Add transition class before changing
      if (animate) {
        document.documentElement.classList.add('theme-transitioning');
      }
      
      this.currentTheme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      
      // Update meta theme-color for mobile browsers
      this.updateMetaThemeColor(theme);
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme, previousTheme: this.currentTheme }
      }));
      
      // Remove transition class after animation
      if (animate) {
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transitioning');
        }, CONFIG.transitionDuration);
      }
      
      this.saveSettings();
    }

    updateMetaThemeColor(theme) {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f0f10' : '#FFFFFF');
      }
    }

    toggleTheme() {
      const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      this.applyTheme(newTheme);
      
      // Disable auto-switch when manually toggling
      if (this.autoSwitch) {
        this.setAutoSwitch(false);
      }
      
      // Show toast notification
      this.showThemeChangeToast(newTheme);
    }

    setTheme(theme) {
      if (['dark', 'light', 'auto'].includes(theme)) {
        if (theme === 'auto') {
          this.setAutoSwitch(true);
        } else {
          this.setAutoSwitch(false);
          this.applyTheme(theme);
        }
      }
    }

    setAutoSwitch(enabled) {
      this.autoSwitch = enabled;
      this.saveSettings();
      
      if (enabled) {
        this.checkAutoSwitch();
        this.startAutoSwitchTimer();
      } else {
        this.stopAutoSwitchTimer();
      }
    }

    checkAutoSwitch() {
      if (!this.autoSwitch) return;
      
      const hour = new Date().getHours();
      const isDaytime = hour >= CONFIG.sunriseHour && hour < CONFIG.sunsetHour;
      const expectedTheme = isDaytime ? 'light' : 'dark';
      
      if (this.currentTheme !== expectedTheme) {
        this.applyTheme(expectedTheme);
      }
    }

    startAutoSwitchTimer() {
      // Check every minute for time-based switching
      this.autoSwitchInterval = setInterval(() => {
        this.checkAutoSwitch();
      }, 60000);
    }

    stopAutoSwitchTimer() {
      if (this.autoSwitchInterval) {
        clearInterval(this.autoSwitchInterval);
        this.autoSwitchInterval = null;
      }
    }

    bindEvents() {
      // Listen for system theme changes
      this.mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem(CONFIG.storageKey)) {
          // Only auto-switch if user hasn't manually set a preference
          const newTheme = e.matches ? 'dark' : 'light';
          this.applyTheme(newTheme);
        }
      });

      // Listen for visibility changes (tab switching)
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.autoSwitch) {
          this.checkAutoSwitch();
        }
      });

      // Keyboard shortcut: Ctrl/Cmd + Shift + L
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
          e.preventDefault();
          this.toggleTheme();
        }
      });
    }

    showThemeChangeToast(theme) {
      // Create toast if toast system exists
      if (window.toast) {
        const message = theme === 'dark' ? '🌙 Dark mode activated' : '☀️ Light mode activated';
        window.toast.info(message, { duration: 2000 });
      }
    }

    getCurrentTheme() {
      return this.currentTheme;
    }

    isDarkMode() {
      return this.currentTheme === 'dark';
    }
  }

  /**
   * Theme Toggle Component
   */
  class ThemeToggle {
    constructor(container, options = {}) {
      this.container = container;
      this.options = {
        style: 'switch', // 'switch' or 'button'
        ...options
      };
      
      this.init();
    }

    init() {
      this.render();
      this.bindEvents();
    }

    render() {
      if (this.options.style === 'switch') {
        this.renderSwitch();
      } else {
        this.renderButton();
      }
    }

    renderSwitch() {
      this.container.innerHTML = `
        <label class="theme-toggle" title="Toggle theme (Ctrl+Shift+L)">
          <input type="checkbox" ${window.themeManager?.isDarkMode() ? 'checked' : ''}>
          <div class="theme-toggle-slider">
            <div class="theme-toggle-icons">
              <span class="theme-toggle-sun">☀️</span>
              <span class="theme-toggle-moon">🌙</span>
            </div>
            <div class="theme-toggle-thumb"></div>
          </div>
        </label>
      `;
      this.input = this.container.querySelector('input');
    }

    renderButton() {
      this.container.innerHTML = `
        <button class="theme-toggle-btn" title="Toggle theme (Ctrl+Shift+L)">
          <span class="icon-sun">☀️</span>
          <span class="icon-moon">🌙</span>
        </button>
      `;
      this.button = this.container.querySelector('button');
    }

    bindEvents() {
      const element = this.input || this.button;
      if (element) {
        element.addEventListener('change', () => {
          window.themeManager?.toggleTheme();
        });
        
        element.addEventListener('click', () => {
          if (this.button) {
            window.themeManager?.toggleTheme();
          }
        });
      }

      // Listen for theme changes
      window.addEventListener('themechange', (e) => {
        if (this.input) {
          this.input.checked = e.detail.theme === 'dark';
        }
      });
    }
  }

  /**
   * Theme Schedule Manager
   * For scheduled theme switching
   */
  class ThemeSchedule {
    constructor() {
      this.schedules = this.loadSchedules();
      this.init();
    }

    loadSchedules() {
      const saved = localStorage.getItem('buildbridge-theme-schedules');
      return saved ? JSON.parse(saved) : [];
    }

    saveSchedules() {
      localStorage.setItem('buildbridge-theme-schedules', JSON.stringify(this.schedules));
    }

    init() {
      this.checkSchedules();
      // Check every minute
      setInterval(() => this.checkSchedules(), 60000);
    }

    checkSchedules() {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const currentDay = now.getDay(); // 0 = Sunday

      this.schedules.forEach(schedule => {
        if (!schedule.enabled) return;
        
        const [hours, minutes] = schedule.time.split(':').map(Number);
        const scheduleTime = hours * 60 + minutes;
        
        // Check if within 1 minute window
        if (Math.abs(currentTime - scheduleTime) <= 1) {
          // Check day of week
          if (schedule.days.includes(currentDay)) {
            window.themeManager?.setTheme(schedule.theme);
          }
        }
      });
    }

    addSchedule(time, theme, days = [0, 1, 2, 3, 4, 5, 6]) {
      const id = Date.now().toString();
      this.schedules.push({
        id,
        time,
        theme,
        days,
        enabled: true
      });
      this.saveSchedules();
      return id;
    }

    removeSchedule(id) {
      this.schedules = this.schedules.filter(s => s.id !== id);
      this.saveSchedules();
    }

    toggleSchedule(id) {
      const schedule = this.schedules.find(s => s.id === id);
      if (schedule) {
        schedule.enabled = !schedule.enabled;
        this.saveSchedules();
      }
    }
  }

  // Initialize when DOM is ready
  function init() {
    // Create global theme manager
    window.themeManager = new ThemeManager();
    window.themeSchedule = new ThemeSchedule();
    
    // Expose ThemeToggle for manual initialization
    window.ThemeToggle = ThemeToggle;

    // Auto-initialize theme toggles
    document.querySelectorAll('[data-theme-toggle]').forEach(el => {
      const style = el.dataset.themeToggle || 'switch';
      new ThemeToggle(el, { style });
    });

    // Log initialization
    console.log('🎨 Adaptive Theme System v106.0 ready');
    console.log('   Current theme:', window.themeManager.getCurrentTheme());
    console.log('   Auto-switch:', window.themeManager.autoSwitch ? 'enabled' : 'disabled');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // API for external use
  window.ThemeAPI = {
    setTheme: (theme) => window.themeManager?.setTheme(theme),
    toggle: () => window.themeManager?.toggleTheme(),
    getTheme: () => window.themeManager?.getCurrentTheme(),
    isDark: () => window.themeManager?.isDarkMode(),
    setAutoSwitch: (enabled) => window.themeManager?.setAutoSwitch(enabled),
    
    // Schedule API
    schedule: {
      add: (time, theme, days) => window.themeSchedule?.addSchedule(time, theme, days),
      remove: (id) => window.themeSchedule?.removeSchedule(id),
      toggle: (id) => window.themeSchedule?.toggleSchedule(id)
    }
  };
})();
