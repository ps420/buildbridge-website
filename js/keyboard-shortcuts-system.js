/**
 * Keyboard Shortcuts System - v90.0
 * Power User Navigation & Commands
 * Fortune 500 Quality Productivity Features
 */

class KeyboardShortcutsSystem {
  constructor() {
    this.shortcuts = new Map();
    this.isModalOpen = false;
    this.isPaletteOpen = false;
    this.pressedKeys = new Set();
    
    // Default shortcuts configuration
    this.defaultShortcuts = [
      // Navigation
      { key: 'g h', action: () => this.navigate('/'), description: 'Go to Home', category: 'Navigation', icon: '🏠' },
      { key: 'g a', action: () => this.navigate('/about.html'), description: 'Go to About', category: 'Navigation', icon: 'ℹ️' },
      { key: 'g s', action: () => this.navigate('/services.html'), description: 'Go to Services', category: 'Navigation', icon: '🛠️' },
      { key: 'g p', action: () => this.navigate('/projects.html'), description: 'Go to Projects', category: 'Navigation', icon: '📁' },
      { key: 'g c', action: () => this.navigate('/contact.html'), description: 'Go to Contact', category: 'Navigation', icon: '📧' },
      
      // Actions
      { key: 'Alt+w', action: () => this.openWhatsApp(), description: 'Open WhatsApp Chat', category: 'Actions', icon: '💬' },
      { key: 'Alt+t', action: () => this.startTour(), description: 'Start Page Tour', category: 'Actions', icon: '🎯' },
      { key: 'Alt+s', action: () => this.toggleSearch(), description: 'Toggle Search', category: 'Actions', icon: '🔍' },
      { key: 'Alt+m', action: () => this.toggleMenu(), description: 'Toggle Menu', category: 'Actions', icon: '☰' },
      
      // Page
      { key: 'Alt+ArrowUp', action: () => this.scrollToTop(), description: 'Scroll to Top', category: 'Page', icon: '⬆️' },
      { key: 'Alt+ArrowDown', action: () => this.scrollToBottom(), description: 'Scroll to Bottom', category: 'Page', icon: '⬇️' },
      { key: 'j', action: () => this.scrollDown(), description: 'Scroll Down', category: 'Page', icon: '↓' },
      { key: 'k', action: () => this.scrollUp(), description: 'Scroll Up', category: 'Page', icon: '↑' },
      
      // Tools
      { key: 'Shift+?', action: () => this.showHelp(), description: 'Show Keyboard Shortcuts', category: 'Tools', icon: '⌨️' },
      { key: 'Alt+k', action: () => this.showHelp(), description: 'Show Keyboard Shortcuts', category: 'Tools', icon: '⌨️' },
      { key: 'Cmd+k', action: () => this.openCommandPalette(), description: 'Open Command Palette', category: 'Tools', icon: '⚡' },
      { key: 'Ctrl+k', action: () => this.openCommandPalette(), description: 'Open Command Palette', category: 'Tools', icon: '⚡' },
      { key: 'Escape', action: () => this.closeAll(), description: 'Close Modal/Menu', category: 'Tools', icon: '✕' },
    ];
    
    this.init();
  }
  
  init() {
    this.registerShortcuts(this.defaultShortcuts);
    this.createHelpModal();
    this.createCommandPalette();
    this.bindEvents();
    this.addShortcutHints();
  }
  
  registerShortcuts(shortcuts) {
    shortcuts.forEach(shortcut => {
      const normalizedKey = this.normalizeKey(shortcut.key);
      this.shortcuts.set(normalizedKey, shortcut);
    });
  }
  
  normalizeKey(key) {
    return key.toLowerCase()
      .replace(/cmd/g, 'meta')
      .replace(/ctrl/g, 'control')
      .replace(/\s+/g, '+');
  }
  
  bindEvents() {
    document.addEventListener('keydown', (e) => {
      this.pressedKeys.add(e.key.toLowerCase());
      
      // Show shortcut hints on Alt
      if (e.key === 'Alt') {
        document.body.classList.add('shortcuts-visible');
      }
      
      // Handle the shortcut
      this.handleKeyDown(e);
    });
    
    document.addEventListener('keyup', (e) => {
      this.pressedKeys.delete(e.key.toLowerCase());
      
      // Hide shortcut hints
      if (e.key === 'Alt') {
        document.body.classList.remove('shortcuts-visible');
      }
    });
    
    // Handle click outside to close
    document.addEventListener('click', (e) => {
      if (this.isModalOpen && !e.target.closest('.shortcuts-content')) {
        this.closeHelp();
      }
      if (this.isPaletteOpen && !e.target.closest('.command-palette')) {
        this.closeCommandPalette();
      }
    });
  }
  
  handleKeyDown(e) {
    // Don't trigger shortcuts when typing in inputs
    if (this.isInputActive()) return;
    
    // Build the key combination string
    const modifiers = [];
    if (e.metaKey || e.ctrlKey) modifiers.push(e.metaKey ? 'meta' : 'control');
    if (e.altKey) modifiers.push('alt');
    if (e.shiftKey) modifiers.push('shift');
    
    const key = e.key.toLowerCase();
    if (!['meta', 'control', 'alt', 'shift'].includes(key)) {
      modifiers.push(key);
    }
    
    const keyCombo = modifiers.join('+');
    const shortcut = this.shortcuts.get(keyCombo);
    
    if (shortcut) {
      e.preventDefault();
      shortcut.action();
      this.showToast(`Used: ${shortcut.description}`);
    }
  }
  
  isInputActive() {
    const activeElement = document.activeElement;
    return activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable
    );
  }
  
  // Actions
  navigate(path) {
    window.location.href = path;
  }
  
  openWhatsApp() {
    window.open('https://wa.me/27661200064', '_blank');
  }
  
  startTour() {
    if (window.buildBridgeTour) {
      window.buildBridgeTour.resetTour();
      window.buildBridgeTour.start();
    }
  }
  
  toggleSearch() {
    // Trigger existing search if available
    const searchInput = document.querySelector('.portfolio-search, .search-input');
    if (searchInput) {
      searchInput.focus();
    }
  }
  
  toggleMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (menuBtn) menuBtn.click();
  }
  
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
  
  scrollDown() {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
  }
  
  scrollUp() {
    window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
  }
  
  closeAll() {
    this.closeHelp();
    this.closeCommandPalette();
    
    // Close other modals
    document.querySelectorAll('.modal.active, .overlay.active').forEach(el => {
      el.classList.remove('active');
    });
  }
  
  // Help Modal
  createHelpModal() {
    const modal = document.createElement('div');
    modal.className = 'shortcuts-modal';
    modal.innerHTML = `
      <div class="shortcuts-backdrop"></div>
      <div class="shortcuts-content">
        <div class="shortcuts-header">
          <h2>
            <span class="shortcuts-header-icon">⌨️</span>
            Keyboard Shortcuts
          </h2>
          <button class="shortcuts-close" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="shortcuts-search">
          <input type="text" placeholder="Search shortcuts..." class="shortcuts-filter">
        </div>
        <div class="shortcuts-body">
          ${this.renderShortcutsList()}
        </div>
        <div class="shortcuts-footer">
          <span class="shortcuts-footer-tip">
            <kbd>?</kbd> to open this menu
          </span>
          <span class="shortcuts-footer-tip">
            <kbd>Esc</kbd> to close
          </span>
          <span class="shortcuts-footer-tip">
            <kbd>Alt</kbd> to show hints
          </span>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.helpModal = modal;
    
    // Bind close
    modal.querySelector('.shortcuts-close').addEventListener('click', () => this.closeHelp());
    modal.querySelector('.shortcuts-backdrop').addEventListener('click', () => this.closeHelp());
    
    // Bind filter
    const filterInput = modal.querySelector('.shortcuts-filter');
    filterInput.addEventListener('input', (e) => this.filterShortcuts(e.target.value));
  }
  
  renderShortcutsList() {
    const categories = {};
    
    this.shortcuts.forEach((shortcut, key) => {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = [];
      }
      categories[shortcut.category].push({ ...shortcut, key });
    });
    
    return Object.entries(categories).map(([category, items]) => `
      <div class="shortcuts-section">
        <div class="shortcuts-section-title">${category}</div>
        <div class="shortcuts-list">
          ${items.map(item => `
            <div class="shortcut-item" data-shortcut="${item.description.toLowerCase()}">
              <div class="shortcut-info">
                <div class="shortcut-icon">${item.icon}</div>
                <div class="shortcut-text">
                  <h4>${item.description}</h4>
                  <p>${item.category}</p>
                </div>
              </div>
              <div class="shortcut-keys">
                ${this.renderKeys(item.key)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }
  
  renderKeys(keyCombo) {
    const keys = keyCombo.toLowerCase().split('+');
    const keyMap = {
      'meta': '⌘',
      'control': 'Ctrl',
      'alt': 'Alt',
      'shift': '⇧',
      'arrowup': '↑',
      'arrowdown': '↓',
      'arrowleft': '←',
      'arrowright': '→',
    };
    
    const modifiers = ['meta', 'control', 'alt', 'shift'];
    const modifierKeys = keys.filter(k => modifiers.includes(k));
    const regularKeys = keys.filter(k => !modifiers.includes(k));
    
    const allKeys = [...modifierKeys, ...regularKeys];
    
    return allKeys.map((key, i) => {
      const isModifier = modifiers.includes(key);
      const display = keyMap[key] || key.toUpperCase();
      return `
        ${i > 0 ? '<span class="shortcut-plus">+</span>' : ''}
        <kbd class="shortcut-key ${isModifier ? 'modifier' : ''}">${display}</kbd>
      `;
    }).join('');
  }
  
  showHelp() {
    this.isModalOpen = true;
    this.helpModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus filter input
    setTimeout(() => {
      this.helpModal.querySelector('.shortcuts-filter').focus();
    }, 100);
  }
  
  closeHelp() {
    this.isModalOpen = false;
    this.helpModal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  filterShortcuts(query) {
    const items = this.helpModal.querySelectorAll('.shortcut-item');
    const sections = this.helpModal.querySelectorAll('.shortcuts-section');
    
    const lowerQuery = query.toLowerCase();
    
    items.forEach(item => {
      const searchText = item.getAttribute('data-shortcut');
      const shouldShow = searchText.includes(lowerQuery);
      item.classList.toggle('hidden', !shouldShow);
    });
    
    // Hide empty sections
    sections.forEach(section => {
      const visibleItems = section.querySelectorAll('.shortcut-item:not(.hidden)');
      section.style.display = visibleItems.length > 0 ? 'block' : 'none';
    });
  }
  
  // Command Palette
  createCommandPalette() {
    const palette = document.createElement('div');
    palette.className = 'command-palette';
    palette.innerHTML = `
      <div class="command-input-wrapper">
        <input type="text" class="command-input" placeholder="Type a command or search...">
      </div>
      <div class="command-list"></div>
    `;
    
    document.body.appendChild(palette);
    this.commandPalette = palette;
    this.commandInput = palette.querySelector('.command-input');
    this.commandList = palette.querySelector('.command-list');
    
    // Bind events
    this.commandInput.addEventListener('input', (e) => this.filterCommands(e.target.value));
    this.commandInput.addEventListener('keydown', (e) => this.handlePaletteKeydown(e));
  }
  
  openCommandPalette() {
    this.isPaletteOpen = true;
    this.commandPalette.classList.add('active');
    this.commandInput.value = '';
    this.commandInput.focus();
    this.renderCommands();
  }
  
  closeCommandPalette() {
    this.isPaletteOpen = false;
    this.commandPalette.classList.remove('active');
  }
  
  renderCommands(filter = '') {
    const commands = Array.from(this.shortcuts.values())
      .filter(s => s.description.toLowerCase().includes(filter.toLowerCase()));
    
    if (commands.length === 0) {
      this.commandList.innerHTML = '<div class="command-empty">No commands found</div>';
      return;
    }
    
    this.commandList.innerHTML = commands.map((cmd, i) => `
      <div class="command-item ${i === 0 ? 'selected' : ''}" data-index="${i}">
        <div class="command-item-icon">${cmd.icon}</div>
        <div class="command-item-text">
          <div class="command-item-title">${cmd.description}</div>
          <div class="command-item-subtitle">${cmd.category}</div>
        </div>
        <div class="command-item-shortcut">${cmd.key}</div>
      </div>
    `).join('');
    
    this.commandList.querySelectorAll('.command-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        this.executeCommand(commands[index]);
      });
    });
    
    this.currentCommands = commands;
    this.selectedIndex = 0;
  }
  
  filterCommands(query) {
    this.renderCommands(query);
  }
  
  handlePaletteKeydown(e) {
    const items = this.commandList.querySelectorAll('.command-item');
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        this.updateSelection(items);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.updateSelection(items);
        break;
      case 'Enter':
        e.preventDefault();
        if (this.currentCommands[this.selectedIndex]) {
          this.executeCommand(this.currentCommands[this.selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.closeCommandPalette();
        break;
    }
  }
  
  updateSelection(items) {
    items.forEach((item, i) => {
      item.classList.toggle('selected', i === this.selectedIndex);
    });
    
    // Scroll into view
    const selected = items[this.selectedIndex];
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }
  
  executeCommand(command) {
    this.closeCommandPalette();
    command.action();
  }
  
  // Shortcut Hints
  addShortcutHints() {
    // Add hints to navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    const shortcuts = { 'index.html': 'G H', 'about.html': 'G A', 'services.html': 'G S', 'projects.html': 'G P', 'contact.html': 'G C' };
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (shortcuts[href]) {
        link.setAttribute('data-shortcut', shortcuts[href]);
      }
    });
  }
  
  // Toast Notification
  showToast(message) {
    // Remove existing toast
    const existing = document.querySelector('.shortcut-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'shortcut-toast';
    toast.innerHTML = `
      <span class="shortcut-toast-icon">⌨️</span>
      <span class="shortcut-toast-text">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 2000);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.keyboardShortcuts = new KeyboardShortcutsSystem();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KeyboardShortcutsSystem;
}
