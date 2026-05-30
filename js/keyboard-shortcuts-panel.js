/**
 * Advanced Keyboard Shortcuts Help Panel
 * Fortune 500 Quality Keyboard Navigation
 * v91.0: Comprehensive keyboard shortcuts reference with search
 */

class KeyboardShortcutsPanel {
  constructor() {
    this.isOpen = false;
    this.searchTerm = '';
    this.activeCategory = 'all';
    
    // Default shortcuts configuration
    this.shortcuts = [
      // Navigation
      { id: 'nav-home', keys: ['g', 'h'], description: 'Go to Home', category: 'navigation', icon: '🏠' },
      { id: 'nav-about', keys: ['g', 'a'], description: 'Go to About', category: 'navigation', icon: 'ℹ️' },
      { id: 'nav-services', keys: ['g', 's'], description: 'Go to Services', category: 'navigation', icon: '🛠️' },
      { id: 'nav-projects', keys: ['g', 'p'], description: 'Go to Projects', category: 'navigation', icon: '📁' },
      { id: 'nav-contact', keys: ['g', 'c'], description: 'Go to Contact', category: 'navigation', icon: '📧' },
      
      // Actions
      { id: 'action-search', keys: ['Mod', 'k'], description: 'Open Search', category: 'actions', icon: '🔍' },
      { id: 'action-menu', keys: ['m'], description: 'Toggle Menu', category: 'actions', icon: '☰' },
      { id: 'action-top', keys: ['Home'], description: 'Go to Top', category: 'actions', icon: '⬆️' },
      { id: 'action-bottom', keys: ['End'], description: 'Go to Bottom', category: 'actions', icon: '⬇️' },
      { id: 'action-whatsapp', keys: ['w'], description: 'Open WhatsApp', category: 'actions', icon: '💬' },
      
      // Features
      { id: 'feature-theme', keys: ['t'], description: 'Toggle Theme', category: 'features', icon: '🌓' },
      { id: 'feature-focus', keys: ['f'], description: 'Focus Mode', category: 'features', icon: '👁️' },
      { id: 'feature-shortcuts', keys: ['?'], description: 'Show Shortcuts', category: 'features', icon: '⌨️' },
      
      // Scrolling
      { id: 'scroll-up', keys: ['k', 'ArrowUp'], description: 'Scroll Up', category: 'scrolling', icon: '↑' },
      { id: 'scroll-down', keys: ['j', 'ArrowDown'], description: 'Scroll Down', category: 'scrolling', icon: '↓' },
      { id: 'scroll-pageup', keys: ['PageUp'], description: 'Page Up', category: 'scrolling', icon: '⇞' },
      { id: 'scroll-pagedown', keys: ['PageDown'], description: 'Page Down', category: 'scrolling', icon: '⇟' },
      { id: 'scroll-next-section', keys: ['Space'], description: 'Next Section', category: 'scrolling', icon: '␣' },
      
      // Accessibility
      { id: 'a11y-skip', keys: ['Tab'], description: 'Skip to Content', category: 'accessibility', icon: '⏭️' },
      { id: 'a11y-shortcuts', keys: ['?'], description: 'Keyboard Help', category: 'accessibility', icon: '❓' }
    ];
    
    this.categories = {
      all: 'All Shortcuts',
      navigation: '🧭 Navigation',
      actions: '⚡ Actions',
      features: '✨ Features',
      scrolling: '📜 Scrolling',
      accessibility: '♿ Accessibility'
    };
    
    this.init();
  }
  
  init() {
    this.createModal();
    this.createHint();
    this.bindEvents();
    this.setupShortcuts();
    
    // Show hint after 3 seconds on desktop
    if (!this.isMobile()) {
      setTimeout(() => this.showHint(), 3000);
    }
  }
  
  isMobile() {
    return window.matchMedia('(pointer: coarse)').matches;
  }
  
  getModKey() {
    return navigator.platform.indexOf('Mac') > -1 ? '⌘' : 'Ctrl';
  }
  
  createModal() {
    const overlay = document.createElement('div');
    overlay.className = 'shortcuts-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Keyboard Shortcuts');
    
    overlay.innerHTML = `
      <div class="shortcuts-modal">
        <div class="shortcuts-header">
          <h2 class="shortcuts-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M6 8h.01M6 16h.01M8 12h8"/>
            </svg>
            Keyboard Shortcuts
          </h2>
          <button class="shortcuts-close" aria-label="Close shortcuts">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="shortcuts-search-container">
          <div class="shortcuts-search">
            <span class="shortcuts-search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input type="text" placeholder="Search shortcuts..." aria-label="Search shortcuts">
            <button class="shortcuts-search-clear" aria-label="Clear search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="shortcuts-categories">
          ${Object.entries(this.categories).map(([key, label]) => `
            <button class="shortcuts-category ${key === 'all' ? 'active' : ''}" data-category="${key}">
              ${label}
            </button>
          `).join('')}
        </div>
        
        <div class="shortcuts-content">
          ${this.renderShortcuts()}
        </div>
        
        <div class="shortcuts-footer">
          <div class="shortcuts-footer-left">
            <span>Press <kbd>?</kbd> anytime to show this panel</span>
            <a href="#accessibility">Accessibility Statement</a>
          </div>
          <span>${this.shortcuts.length} shortcuts available</span>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    this.overlay = overlay;
    this.modal = overlay.querySelector('.shortcuts-modal');
    this.searchInput = overlay.querySelector('.shortcuts-search input');
    this.content = overlay.querySelector('.shortcuts-content');
    
    // Bind modal events
    overlay.querySelector('.shortcuts-close').addEventListener('click', () => this.close());
    overlay.querySelector('.shortcuts-search-clear').addEventListener('click', () => this.clearSearch());
    
    // Category filtering
    overlay.querySelectorAll('.shortcuts-category').forEach(btn => {
      btn.addEventListener('click', () => {
        overlay.querySelectorAll('.shortcuts-category').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.dataset.category;
        this.filterShortcuts();
      });
    });
    
    // Search
    this.searchInput.addEventListener('input', (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.filterShortcuts();
    });
    
    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });
  }
  
  renderShortcuts() {
    return Object.entries(this.categories)
      .filter(([key]) => key !== 'all')
      .map(([category, label]) => {
        const categoryShortcuts = this.shortcuts.filter(s => s.category === category);
        return `
          <div class="shortcuts-section" data-category="${category}">
            <h3 class="shortcuts-section-title">${label}</h3>
            <div class="shortcuts-grid">
              ${categoryShortcuts.map(shortcut => this.renderShortcutItem(shortcut)).join('')}
            </div>
          </div>
        `;
      }).join('');
  }
  
  renderShortcutItem(shortcut) {
    return `
      <div class="shortcut-item" data-id="${shortcut.id}" data-keys="${shortcut.keys.join(' ').toLowerCase()}" data-desc="${shortcut.description.toLowerCase()}">
        <div class="shortcut-info">
          <div class="shortcut-icon">${shortcut.icon}</div>
          <div class="shortcut-details">
            <h4>${shortcut.description}</h4>
            <p>${this.categories[shortcut.category]}</p>
          </div>
        </div>
        <div class="shortcut-keys">
          ${shortcut.keys.map((key, i) => {
            const displayKey = key === 'Mod' ? this.getModKey() : key;
            const isModifier = ['Mod', 'Ctrl', 'Alt', 'Shift', '⌘', '⌥'].includes(key) || displayKey === this.getModKey();
            return `
              ${i > 0 ? '<span class="shortcut-plus">+</span>' : ''}
              <kbd class="${isModifier ? 'modifier' : ''}" data-key="${key}">${displayKey}</kbd>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
  
  filterShortcuts() {
    const items = this.content.querySelectorAll('.shortcut-item');
    const sections = this.content.querySelectorAll('.shortcuts-section');
    
    items.forEach(item => {
      const keys = item.dataset.keys;
      const desc = item.dataset.desc;
      const section = item.closest('.shortcuts-section').dataset.category;
      
      const matchesSearch = !this.searchTerm || 
        keys.includes(this.searchTerm) || 
        desc.includes(this.searchTerm);
      
      const matchesCategory = this.activeCategory === 'all' || section === this.activeCategory;
      
      item.classList.toggle('hidden', !(matchesSearch && matchesCategory));
    });
    
    // Show/hide sections based on visible items
    sections.forEach(section => {
      const visibleItems = section.querySelectorAll('.shortcut-item:not(.hidden)');
      section.style.display = visibleItems.length > 0 ? 'block' : 'none';
    });
    
    // Show no results message if needed
    const anyVisible = this.content.querySelectorAll('.shortcut-item:not(.hidden)').length > 0;
    this.renderNoResults(!anyVisible);
  }
  
  renderNoResults(show) {
    let noResults = this.content.querySelector('.shortcuts-no-results');
    
    if (show) {
      if (!noResults) {
        noResults = document.createElement('div');
        noResults.className = 'shortcuts-no-results';
        noResults.innerHTML = `
          <div class="shortcuts-no-results-icon">⌨️</div>
          <h4>No shortcuts found</h4>
          <p>Try a different search term</p>
        `;
        this.content.appendChild(noResults);
      }
      noResults.style.display = 'block';
    } else if (noResults) {
      noResults.style.display = 'none';
    }
  }
  
  clearSearch() {
    this.searchTerm = '';
    this.searchInput.value = '';
    this.searchInput.focus();
    this.filterShortcuts();
  }
  
  createHint() {
    if (this.isMobile()) return;
    
    const hint = document.createElement('div');
    hint.className = 'keyboard-hint';
    hint.innerHTML = `
      Press <kbd>${this.getModKey()}</kbd> + <kbd>K</kbd> to search
    `;
    hint.addEventListener('click', () => this.open());
    document.body.appendChild(hint);
    this.hint = hint;
  }
  
  showHint() {
    if (this.hint && !this.isOpen) {
      this.hint.classList.add('show');
      setTimeout(() => {
        this.hint.classList.remove('show');
      }, 6000);
    }
  }
  
  bindEvents() {
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
        return;
      }
      
      // Open with ?
      if (e.key === '?' && !this.isInputFocused()) {
        e.preventDefault();
        this.toggle();
      }
    });
  }
  
  isInputFocused() {
    const active = document.activeElement;
    return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
  }
  
  setupShortcuts() {
    // Sequence detection for multi-key shortcuts
    this.keySequence = [];
    this.sequenceTimeout = null;
    
    document.addEventListener('keydown', (e) => {
      if (this.isInputFocused()) return;
      
      const key = e.key;
      
      // Check for Mod+K (search)
      if ((e.metaKey || e.ctrlKey) && key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openCommandPalette ? this.openCommandPalette() : this.open();
        return;
      }
      
      // Handle single key shortcuts
      if (key === 't' && !this.isOpen) {
        e.preventDefault();
        this.toggleTheme();
      }
      else if (key === 'f' && !this.isOpen) {
        e.preventDefault();
        this.toggleFocusMode();
      }
      else if (key === 'm' && !this.isOpen) {
        e.preventDefault();
        this.toggleMenu();
      }
      else if (key === 'w' && !this.isOpen) {
        e.preventDefault();
        window.open('https://wa.me/27661200064', '_blank');
      }
      else if (key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      else if (key === 'End') {
        e.preventDefault();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
      
      // Navigation sequence (g + key)
      if (key === 'g' && !this.isOpen) {
        this.keySequence = ['g'];
        clearTimeout(this.sequenceTimeout);
        this.sequenceTimeout = setTimeout(() => {
          this.keySequence = [];
        }, 1000);
        return;
      }
      
      if (this.keySequence[0] === 'g') {
        const navMap = {
          'h': 'index.html',
          'a': 'about.html',
          's': 'services.html',
          'p': 'projects.html',
          'c': 'contact.html'
        };
        
        if (navMap[key]) {
          e.preventDefault();
          window.location.href = navMap[key];
          this.keySequence = [];
        }
      }
    });
  }
  
  toggleTheme() {
    document.documentElement.classList.toggle('light-theme');
    const isLight = document.documentElement.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    // Show toast notification
    if (window.showToast) {
      window.showToast(isLight ? 'Light theme enabled' : 'Dark theme enabled', 'info');
    }
  }
  
  toggleFocusMode() {
    document.body.classList.toggle('focus-mode');
    const isFocus = document.body.classList.contains('focus-mode');
    
    if (window.showToast) {
      window.showToast(isFocus ? 'Focus mode enabled' : 'Focus mode disabled', 'info');
    }
  }
  
  toggleMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (menuBtn) menuBtn.click();
  }
  
  open() {
    this.isOpen = true;
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.searchInput.focus();
    
    // Hide hint
    if (this.hint) this.hint.classList.remove('show');
  }
  
  close() {
    this.isOpen = false;
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
    this.searchInput.blur();
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  // Public API
  static getInstance() {
    if (!window.keyboardShortcutsPanel) {
      window.keyboardShortcutsPanel = new KeyboardShortcutsPanel();
    }
    return window.keyboardShortcutsPanel;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => KeyboardShortcutsPanel.getInstance());
} else {
  KeyboardShortcutsPanel.getInstance();
}

// Expose globally
window.KeyboardShortcutsPanel = KeyboardShortcutsPanel;

export default KeyboardShortcutsPanel;
