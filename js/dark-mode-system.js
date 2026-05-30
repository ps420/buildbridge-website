/**
 * Fortune 500 Dark Mode Toggle System
 * v97.0: Comprehensive Light/Dark Theme Management
 * Features: System preference detection, persistent state, smooth transitions
 */

class DarkModeManager {
  constructor() {
    this.STORAGE_KEY = 'buildbridge-theme';
    this.currentTheme = 'dark'; // Default to dark (BuildBridge brand)
    this.systemPreference = null;
    this.mediaQuery = null;
    this.toggleButtons = [];
    
    this.init();
  }
  
  init() {
    // Detect system preference
    this.detectSystemPreference();
    
    // Load saved preference
    this.loadSavedTheme();
    
    // Apply theme immediately (before DOM ready to prevent flash)
    this.applyTheme(this.currentTheme, false);
    
    // Setup when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
    
    console.log(`✨ DarkModeManager initialized (${this.currentTheme})`);
  }
  
  detectSystemPreference() {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemPreference = this.mediaQuery.matches ? 'dark' : 'light';
    
    // Listen for system preference changes
    this.mediaQuery.addEventListener('change', (e) => {
      this.systemPreference = e.matches ? 'dark' : 'light';
      
      // Only auto-switch if no user preference is saved
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.setTheme(this.systemPreference);
      }
    });
  }
  
  loadSavedTheme() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved && ['light', 'dark', 'auto'].includes(saved)) {
        this.currentTheme = saved === 'auto' ? this.systemPreference : saved;
      } else {
        // No saved preference, use system or default
        this.currentTheme = this.systemPreference || 'dark';
      }
    } catch (e) {
      console.warn('Could not access localStorage:', e);
      this.currentTheme = 'dark';
    }
  }
  
  setup() {
    this.findToggleButtons();
    this.createDefaultToggle();
    this.bindEvents();
    
    // Add loaded class after initial setup
    requestAnimationFrame(() => {
      document.body.classList.remove('theme-transitioning');
    });
  }
  
  findToggleButtons() {
    this.toggleButtons = document.querySelectorAll(
      '[data-theme-toggle], .dark-mode-toggle, .dark-mode-icon-toggle'
    );
    
    this.toggleButtons.forEach(btn => {
      this.updateToggleState(btn);
    });
  }
  
  createDefaultToggle() {
    // Only create if none exist in navigation
    if (this.toggleButtons.length > 0) return;
    
    const nav = document.querySelector('.nav, header, nav');
    if (!nav) return;
    
    const toggle = document.createElement('button');
    toggle.className = 'dark-mode-icon-toggle';
    toggle.setAttribute('data-theme-toggle', '');
    toggle.setAttribute('aria-label', 'Toggle dark mode');
    toggle.innerHTML = this.getToggleIcon();
    
    nav.appendChild(toggle);
    this.toggleButtons = [toggle];
    this.updateToggleState(toggle);
  }
  
  getToggleIcon() {
    return `
      <span class="icon">
        <span class="icon-sun">☀️</span>
        <span class="icon-moon" style="display: none;">🌙</span>
      </span>
    `;
  }
  
  bindEvents() {
    // Theme toggle clicks
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('[data-theme-toggle], .dark-mode-toggle, .dark-mode-icon-toggle');
      if (toggle) {
        e.preventDefault();
        this.toggle();
      }
    });
    
    // Keyboard shortcut: Ctrl/Cmd + Shift + L
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        this.toggle();
      }
    });
  }
  
  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
  
  setTheme(theme, save = true) {
    if (theme === this.currentTheme) return;
    
    // Enable transitions after first render
    document.body.classList.add('theme-transitioning');
    
    this.currentTheme = theme;
    this.applyTheme(theme, true);
    
    if (save) {
      this.saveTheme(theme);
    }
    
    // Update all toggle buttons
    this.toggleButtons.forEach(btn => this.updateToggleState(btn));
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: this.currentTheme }
    }));
    
    // Remove transition lock after animation
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 350);
    
    console.log(`Theme changed to: ${theme}`);
  }
  
  applyTheme(theme, animate = true) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f0f10' : '#ffffff');
    }
  }
  
  saveTheme(theme) {
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Could not save theme preference:', e);
    }
  }
  
  updateToggleState(button) {
    const isDark = this.currentTheme === 'dark';
    button.classList.toggle('active', isDark);
    button.setAttribute('aria-pressed', isDark);
    
    // Update icon if using icon toggle
    const sunIcon = button.querySelector('.icon-sun, .toggle-icon-sun');
    const moonIcon = button.querySelector('.icon-moon, .toggle-icon-moon');
    
    if (sunIcon && moonIcon) {
      sunIcon.style.display = isDark ? 'none' : 'inline';
      moonIcon.style.display = isDark ? 'inline' : 'none';
    }
    
    // Update toggle label if present
    const label = button.querySelector('.dark-mode-switch-label');
    if (label) {
      label.textContent = isDark ? 'Dark' : 'Light';
    }
  }
  
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  isDark() {
    return this.currentTheme === 'dark';
  }
  
  // Helper for components that need theme awareness
  onThemeChange(callback) {
    window.addEventListener('themechange', (e) => {
      callback(e.detail.theme);
    });
    
    // Call immediately with current theme
    callback(this.currentTheme);
  }
}

// Initialize theme manager
window.themeManager = new DarkModeManager();

// Prevent flash of wrong theme (FOUT)
(function() {
  const saved = localStorage.getItem('buildbridge-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.add('theme-transitioning');
})();
