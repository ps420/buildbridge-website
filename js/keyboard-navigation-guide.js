/**
 * Keyboard Navigation Guide - v138.4
 * Fortune 500 Accessibility Enhancement
 * Comprehensive keyboard shortcut system
 */

(function() {
  'use strict';

  const KeyboardNavigationGuide = {
    config: {
      triggerKey: '?',
      escapeKey: 'Escape',
      showQuickTip: true,
      quickTipDelay: 30000,
      storageKey: 'bb_keyboard_guide_seen'
    },

    state: {
      isOpen: false,
      activeCategory: 'all',
      searchQuery: ''
    },

    shortcuts: [
      // Navigation
      { key: 'g h', name: 'Go to Home', desc: 'Navigate to homepage', category: 'navigation', action: () => window.location.href = 'index.html' },
      { key: 'g a', name: 'Go to About', desc: 'View about page', category: 'navigation', action: () => window.location.href = 'about.html' },
      { key: 'g s', name: 'Go to Services', desc: 'View services page', category: 'navigation', action: () => window.location.href = 'services.html' },
      { key: 'g p', name: 'Go to Projects', desc: 'View projects gallery', category: 'navigation', action: () => window.location.href = 'projects.html' },
      { key: 'g c', name: 'Go to Contact', desc: 'Contact us page', category: 'navigation', action: () => window.location.href = 'contact.html' },
      { key: 'g w', name: 'WhatsApp Chat', desc: 'Open WhatsApp conversation', category: 'navigation', action: () => window.open('https://wa.me/27661200064', '_blank') },
      
      // Page Actions
      { key: '/', name: 'Search', desc: 'Open site search', category: 'actions', action: () => this.showToast('Search coming soon!', '/') },
      { key: 't', name: 'Toggle Theme', desc: 'Switch light/dark mode', category: 'actions', action: () => this.toggleTheme() },
      { key: '↑', name: 'Scroll to Top', desc: 'Jump to page top', category: 'actions', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
      { key: '↓', name: 'Scroll to Bottom', desc: 'Jump to page bottom', category: 'actions', action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) },
      
      // Accessibility
      { key: 'Tab', name: 'Next Focusable', desc: 'Navigate to next element', category: 'accessibility', preventDefault: false },
      { key: 'Shift+Tab', name: 'Previous Focusable', desc: 'Navigate to previous element', category: 'accessibility', preventDefault: false },
      { key: 'Enter', name: 'Activate', desc: 'Click focused element', category: 'accessibility', preventDefault: false },
      { key: 'Space', name: 'Scroll Down', desc: 'Page down or activate', category: 'accessibility', preventDefault: false },
      
      // Advanced
      { key: 'c p', name: 'Copy Page URL', desc: 'Copy current page link', category: 'advanced', action: () => this.copyToClipboard(window.location.href, 'Page URL copied!') },
      { key: 'p p', name: 'Print Page', desc: 'Open print dialog', category: 'advanced', action: () => window.print() },
      { key: 'r', name: 'Reload Page', desc: 'Refresh current page', category: 'advanced', action: () => window.location.reload() },
      { key: '?', name: 'Show Shortcuts', desc: 'Open this guide', category: 'advanced', action: () => this.open() }
    ],

    categories: [
      { id: 'all', name: 'All Shortcuts', icon: '⌨️' },
      { id: 'navigation', name: 'Navigation', icon: '🧭' },
      { id: 'actions', name: 'Page Actions', icon: '⚡' },
      { id: 'accessibility', name: 'Accessibility', icon: '♿' },
      { id: 'advanced', name: 'Advanced', icon: '🚀' }
    ],

    init() {
      this.createTrigger();
      this.createModal();
      this.bindEvents();
      this.showQuickTip();
    },

    createTrigger() {
      const trigger = document.createElement('button');
      trigger.className = 'keyboard-guide-trigger';
      trigger.setAttribute('aria-label', 'Open keyboard shortcuts guide');
      trigger.innerHTML = '⌨️';
      document.body.appendChild(trigger);
      this.trigger = trigger;
    },

    createModal() {
      const overlay = document.createElement('div');
      overlay.className = 'keyboard-guide-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', 'keyboard-guide-title');

      overlay.innerHTML = `
        <div class="keyboard-guide-modal">
          <div class="keyboard-guide-header">
            <div class="keyboard-guide-title">
              <div class="keyboard-guide-title-icon">⌨️</div>
              <span id="keyboard-guide-title" class="keyboard-guide-title-text">Keyboard Shortcuts</span>
            </div>
            <button class="keyboard-guide-close" aria-label="Close shortcuts guide">×</button>
          </div>
          
          <div class="keyboard-guide-content">
            <div class="keyboard-guide-search">
              <span class="keyboard-guide-search-icon">🔍</span>
              <input type="text" class="keyboard-guide-search-input" placeholder="Search shortcuts..." aria-label="Search shortcuts">
            </div>
            
            <div class="keyboard-guide-categories">
              ${this.categories.map(cat => `
                <button class="keyboard-guide-category-btn ${cat.id === 'all' ? 'active' : ''}" data-category="${cat.id}">
                  ${cat.icon} ${cat.name}
                </button>
              `).join('')}
            </div>
            
            <div class="keyboard-guide-shortcuts">
              ${this.renderShortcuts()}
            </div>
          </div>
        </div>
        
        <div class="keyboard-toast">
          <div class="keyboard-toast-icon">✓</div>
          <div class="keyboard-toast-text"></div>
          <div class="keyboard-toast-keys"></div>
        </div>
      `;

      document.body.appendChild(overlay);
      this.overlay = overlay;
      this.toast = overlay.querySelector('.keyboard-toast');
      this.shortcutsContainer = overlay.querySelector('.keyboard-guide-shortcuts');

      this.bindModalEvents();
    },

    renderShortcuts() {
      let html = '';
      const categories = [...new Set(this.shortcuts.map(s => s.category))];

      categories.forEach(category => {
        const catInfo = this.categories.find(c => c.id === category);
        const catShortcuts = this.shortcuts.filter(s => s.category === category);

        html += `
          <div class="keyboard-guide-section" data-category="${category}">
            <div class="keyboard-guide-section-title">${catInfo.icon} ${catInfo.name}</div>
            ${catShortcuts.map(shortcut => this.renderShortcut(shortcut)).join('')}
          </div>
        `;
      });

      return html;
    },

    renderShortcut(shortcut) {
      const keys = this.formatKey(shortcut.key);
      
      return `
        <div class="keyboard-guide-shortcut" data-category="${shortcut.category}" data-key="${shortcut.key.toLowerCase()}" data-name="${shortcut.name.toLowerCase()}">
          <div class="keyboard-guide-shortcut-info">
            <div class="keyboard-guide-shortcut-name">${shortcut.name}</div>
            <div class="keyboard-guide-shortcut-desc">${shortcut.desc}</div>
          </div>
          <div class="keyboard-guide-shortcut-keys">
            ${keys}
          </div>
        </div>
      `;
    },

    formatKey(keyCombo) {
      return keyCombo.split(' ').map(key => {
        if (key === '+') {
          return '<span class="keyboard-guide-key-plus">+</span>';
        }
        const isPrimary = ['g', 't', '/', 'c', 'p', 'r', '?'].includes(key);
        return `<span class="keyboard-guide-key ${isPrimary ? 'primary' : ''}">${key}</span>`;
      }).join('');
    },

    bindEvents() {
      // Open trigger
      this.trigger.addEventListener('click', () => this.open());

      // Keyboard shortcuts
      let keyBuffer = '';
      let bufferTimeout;

      document.addEventListener('keydown', (e) => {
        // Don't trigger when typing in inputs
        if (e.target.matches('input, textarea, [contenteditable]')) {
          if (e.key === 'Escape') {
            e.target.blur();
          }
          return;
        }

        // Close on escape
        if (e.key === this.config.escapeKey && this.state.isOpen) {
          this.close();
          return;
        }

        // Open on ?
        if (e.key === this.config.triggerKey && !e.shiftKey && !this.state.isOpen) {
          e.preventDefault();
          this.open();
          return;
        }

        // Handle shortcut sequences
        if (!this.state.isOpen) {
          // Clear buffer after delay
          clearTimeout(bufferTimeout);
          bufferTimeout = setTimeout(() => {
            keyBuffer = '';
          }, 1000);

          // Add to buffer
          const key = e.key.toLowerCase();
          keyBuffer += key;

          // Check for matching shortcuts
          const match = this.shortcuts.find(s => {
            const shortcutKey = s.key.toLowerCase().replace(/\+/g, '').replace(/\s/g, '');
            return shortcutKey === keyBuffer && s.action;
          });

          if (match) {
            e.preventDefault();
            keyBuffer = '';
            this.executeShortcut(match);
          }
        }
      });
    },

    bindModalEvents() {
      // Close button
      this.overlay.querySelector('.keyboard-guide-close').addEventListener('click', () => {
        this.close();
      });

      // Click outside
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });

      // Category filters
      this.overlay.querySelectorAll('.keyboard-guide-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const category = btn.dataset.category;
          this.setCategory(category);
          
          // Update active state
          this.overlay.querySelectorAll('.keyboard-guide-category-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.category === category);
          });
        });
      });

      // Search
      const searchInput = this.overlay.querySelector('.keyboard-guide-search-input');
      searchInput.addEventListener('input', (e) => {
        this.state.searchQuery = e.target.value.toLowerCase();
        this.filterShortcuts();
      });

      // Shortcut click to execute
      this.shortcutsContainer.addEventListener('click', (e) => {
        const shortcutEl = e.target.closest('.keyboard-guide-shortcut');
        if (!shortcutEl) return;

        const key = shortcutEl.dataset.key;
        const shortcut = this.shortcuts.find(s => s.key.toLowerCase() === key);
        
        if (shortcut && shortcut.action) {
          this.executeShortcut(shortcut);
        }
      });
    },

    setCategory(category) {
      this.state.activeCategory = category;
      this.filterShortcuts();
    },

    filterShortcuts() {
      const shortcuts = this.shortcutsContainer.querySelectorAll('.keyboard-guide-shortcut');

      shortcuts.forEach(el => {
        const matchesCategory = this.state.activeCategory === 'all' || 
                                el.dataset.category === this.state.activeCategory;
        const matchesSearch = this.state.searchQuery === '' ||
                             el.dataset.name.includes(this.state.searchQuery) ||
                             el.dataset.key.includes(this.state.searchQuery);

        el.classList.toggle('hidden', !matchesCategory || !matchesSearch);
      });

      // Show/hide sections
      this.shortcutsContainer.querySelectorAll('.keyboard-guide-section').forEach(section => {
        const visibleShortcuts = section.querySelectorAll('.keyboard-guide-shortcut:not(.hidden)');
        section.style.display = visibleShortcuts.length > 0 ? 'block' : 'none';
      });
    },

    executeShortcut(shortcut) {
      if (shortcut.preventDefault !== false) {
        // Execute action
        shortcut.action();
        
        // Show toast
        this.showToast(shortcut.name, shortcut.key);
      }
    },

    open() {
      if (this.state.isOpen) return;
      
      this.state.isOpen = true;
      this.overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Mark as seen
      localStorage.setItem(this.config.storageKey, 'true');

      // Focus search
      setTimeout(() => {
        this.overlay.querySelector('.keyboard-guide-search-input')?.focus();
      }, 100);
    },

    close() {
      if (!this.state.isOpen) return;
      
      this.state.isOpen = false;
      this.overlay.classList.remove('active');
      document.body.style.overflow = '';
    },

    showToast(message, keys) {
      this.toast.querySelector('.keyboard-toast-text').textContent = message;
      this.toast.querySelector('.keyboard-toast-keys').innerHTML = this.formatKey(keys);
      
      this.toast.classList.add('show');
      
      setTimeout(() => {
        this.toast.classList.remove('show');
      }, 2000);
    },

    toggleTheme() {
      if (window.ThemeManager) {
        window.ThemeManager.toggle();
        this.showToast('Theme toggled', 't');
      }
    },

    copyToClipboard(text, successMessage) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast(successMessage, 'c p');
      });
    },

    showQuickTip() {
      const hasSeen = localStorage.getItem(this.config.storageKey);
      if (hasSeen || !this.config.showQuickTip) return;

      setTimeout(() => {
        const tip = document.createElement('div');
        tip.className = 'keyboard-guide-quick-tip';
        tip.innerHTML = `
          <button class="keyboard-guide-quick-tip-close">×</button>
          <strong>💡 Pro tip:</strong> Press <span class="keyboard-guide-key primary">?</span> anytime to see keyboard shortcuts
        `;
        document.body.appendChild(tip);

        // Show after delay
        requestAnimationFrame(() => {
          tip.classList.add('show');
        });

        // Close button
        tip.querySelector('.keyboard-guide-quick-tip-close').addEventListener('click', () => {
          tip.classList.remove('show');
          setTimeout(() => tip.remove(), 300);
        });

        // Auto hide
        setTimeout(() => {
          if (tip.parentNode) {
            tip.classList.remove('show');
            setTimeout(() => tip.remove(), 300);
          }
        }, 8000);
      }, this.config.quickTipDelay);
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => KeyboardNavigationGuide.init());
  } else {
    KeyboardNavigationGuide.init();
  }

  // Expose to global scope
  window.KeyboardNavigationGuide = KeyboardNavigationGuide;
})();
