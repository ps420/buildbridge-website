/**
 * DARK MODE SYSTEM - v41 Fortune 500
 * Professional theme toggle with persistence and system preference
 */

class DarkModeSystem {
  constructor() {
    this.currentTheme = 'dark';
    this.init();
  }
  
  init() {
    this.loadTheme();
    this.createUI();
    this.applyTheme();
    this.bindEvents();
  }
  
  createUI() {
    // Create toggle button
    const toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    toggle.setAttribute('aria-label', 'Toggle dark mode');
    toggle.innerHTML = `
      <div class="theme-toggle-icons">
        <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </div>
    `;
    document.body.appendChild(toggle);
    this.toggle = toggle;
    
    // Create theme menu
    const menu = document.createElement('div');
    menu.className = 'theme-menu';
    menu.innerHTML = `
      <div class="theme-menu-header">Appearance</div>
      <div class="theme-option ${this.currentTheme === 'light' ? '' : 'active'}" data-theme="dark">
        <div class="theme-option-icon">🌙</div>
        <div>
          <div class="theme-option-text">Dark</div>
          <div class="theme-option-desc">Easier on the eyes</div>
        </div>
      </div>
      <div class="theme-option ${this.currentTheme === 'light' ? 'active' : ''}" data-theme="light">
        <div class="theme-option-icon">☀️</div>
        <div>
          <div class="theme-option-text">Light</div>
          <div class="theme-option-desc">Classic look</div>
        </div>
      </div>
      <div class="theme-option" data-theme="system">
        <div class="theme-option-icon">💻</div>
        <div>
          <div class="theme-option-text">System</div>
          <div class="theme-option-desc">Follow OS setting</div>
        </div>
      </div>
    `;
    document.body.appendChild(menu);
    this.menu = menu;
  }
  
  bindEvents() {
    // Toggle click
    this.toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.menu.classList.toggle('active');
    });
    
    // Menu option click
    this.menu.addEventListener('click', (e) => {
      const option = e.target.closest('.theme-option');
      if (option) {
        this.setTheme(option.dataset.theme);
        this.menu.classList.remove('active');
      }
    });
    
    // Close menu on outside click
    document.addEventListener('click', () => {
      this.menu.classList.remove('active');
    });
    
    // Listen for system preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.currentTheme === 'system') {
          this.applyTheme();
        }
      });
    }
  }
  
  setTheme(theme) {
    this.currentTheme = theme;
    this.saveTheme();
    this.applyTheme();
    this.updateMenuUI();
  }
  
  applyTheme() {
    const isDark = this.getEffectiveTheme() === 'dark';
    
    document.body.classList.toggle('light-mode', !isDark);
    document.body.classList.toggle('dark-mode', isDark);
    
    // Update meta theme-color
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.content = isDark ? '#0f0f10' : '#F5F7FA';
    }
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: isDark ? 'dark' : 'light' }
    }));
  }
  
  getEffectiveTheme() {
    if (this.currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return this.currentTheme;
  }
  
  updateMenuUI() {
    const options = this.menu.querySelectorAll('.theme-option');
    options.forEach(option => {
      option.classList.toggle('active', 
        (option.dataset.theme === this.currentTheme) || 
        (this.currentTheme === 'system' && option.dataset.theme === 'system')
      );
    });
  }
  
  saveTheme() {
    try {
      localStorage.setItem('buildbridge_theme', this.currentTheme);
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  loadTheme() {
    try {
      const saved = localStorage.getItem('buildbridge_theme');
      if (saved && ['dark', 'light', 'system'].includes(saved)) {
        this.currentTheme = saved;
      } else {
        // Default to system preference
        this.currentTheme = 'dark';
      }
    } catch (e) {
      this.currentTheme = 'dark';
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new DarkModeSystem());
} else {
  new DarkModeSystem();
}
