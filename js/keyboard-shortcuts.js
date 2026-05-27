/**
 * BuildBridge v15.0 - Intelligent Keyboard Shortcuts
 * Fortune 500 accessibility and productivity system
 */

(function() {
  'use strict';

  class KeyboardShortcuts {
    constructor() {
      this.shortcuts = [];
      this.pressedKeys = new Set();
      this.isModalOpen = false;
      this.searchTerm = '';
      this.hintShown = localStorage.getItem('buildbridge_keyboard_hint_shown');

      this.init();
    }

    init() {
      this.defineShortcuts();
      this.createModal();
      this.createHelpButton();
      this.bindEvents();
      
      // Show hint on first visit
      if (!this.hintShown) {
        setTimeout(() => this.showHint(), 3000);
      }
    }

    defineShortcuts() {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? 'cmd' : 'ctrl';
      const modDisplay = isMac ? '⌘' : 'Ctrl';

      this.shortcuts = [
        {
          id: 'help',
          keys: ['?'],
          altKeys: isMac ? ['cmd', '/'] : ['ctrl', '/'],
          description: 'Show keyboard shortcuts',
          action: () => this.toggleModal(),
          category: 'General'
        },
        {
          id: 'search',
          keys: [modKey, 'k'],
          display: [modDisplay, 'K'],
          description: 'Quick search / command palette',
          action: () => this.triggerSearch(),
          category: 'Navigation'
        },
        {
          id: 'home',
          keys: ['g', 'h'],
          display: ['G', 'H'],
          description: 'Go to Home',
          action: () => this.navigate('index.html'),
          category: 'Navigation'
        },
        {
          id: 'services',
          keys: ['g', 's'],
          display: ['G', 'S'],
          description: 'Go to Services',
          action: () => this.navigate('services.html'),
          category: 'Navigation'
        },
        {
          id: 'projects',
          keys: ['g', 'p'],
          display: ['G', 'P'],
          description: 'Go to Projects',
          action: () => this.navigate('projects.html'),
          category: 'Navigation'
        },
        {
          id: 'contact',
          keys: ['g', 'c'],
          display: ['G', 'C'],
          description: 'Go to Contact',
          action: () => this.navigate('contact.html'),
          category: 'Navigation'
        },
        {
          id: 'about',
          keys: ['g', 'a'],
          display: ['G', 'A'],
          description: 'Go to About',
          action: () => this.navigate('about.html'),
          category: 'Navigation'
        },
        {
          id: 'top',
          keys: ['g', 't'],
          display: ['G', 'T'],
          description: 'Go to top of page',
          action: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
          category: 'Navigation'
        },
        {
          id: 'bottom',
          keys: ['g', 'b'],
          display: ['G', 'B'],
          description: 'Go to bottom of page',
          action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
          category: 'Navigation'
        },
        {
          id: 'whatsapp',
          keys: ['w'],
          display: ['W'],
          description: 'Open WhatsApp chat',
          action: () => window.open('https://wa.me/27661200064', '_blank'),
          category: 'Actions'
        },
        {
          id: 'quote',
          keys: ['q'],
          display: ['Q'],
          description: 'Request a quote',
          action: () => this.navigate('contact.html'),
          category: 'Actions'
        },
        {
          id: 'escape',
          keys: ['Escape'],
          display: ['Esc'],
          description: 'Close modal / Stop action',
          action: () => this.handleEscape(),
          category: 'General'
        },
        {
          id: 'darkmode',
          keys: [modKey, 'd'],
          display: [modDisplay, 'D'],
          description: 'Toggle dark mode (if available)',
          action: () => this.toggleTheme(),
          category: 'General'
        }
      ];
    }

    createModal() {
      const overlay = document.createElement('div');
      overlay.className = 'keyboard-shortcuts-overlay';
      overlay.innerHTML = `
        <div class="keyboard-shortcuts-modal">
          <div class="keyboard-shortcuts-header">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M6 8h0M6 12h0M6 16h0M10 8h8M10 12h8M10 16h5"/>
              </svg>
              Keyboard Shortcuts
            </h2>
            <button class="keyboard-shortcuts-close" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="keyboard-shortcuts-search">
            <input type="text" placeholder="Search shortcuts..." autocomplete="off">
          </div>
          <div class="keyboard-shortcuts-body">
            ${this.renderShortcutsList()}
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      this.modal = overlay;

      // Close button
      overlay.querySelector('.keyboard-shortcuts-close').addEventListener('click', () => {
        this.hideModal();
      });

      // Search
      const searchInput = overlay.querySelector('.keyboard-shortcuts-search input');
      searchInput.addEventListener('input', (e) => {
        this.filterShortcuts(e.target.value);
      });

      // Click outside
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hideModal();
        }
      });
    }

    createHelpButton() {
      const btn = document.createElement('button');
      btn.className = 'keyboard-help-btn';
      btn.setAttribute('aria-label', 'Keyboard shortcuts');
      btn.innerHTML = `
        <span>⌘</span>
        <span class="key-hint">?</span>
      `;
      btn.addEventListener('click', () => this.showModal());
      document.body.appendChild(btn);
    }

    renderShortcutsList() {
      const categories = {};
      
      this.shortcuts.forEach(shortcut => {
        if (!categories[shortcut.category]) {
          categories[shortcut.category] = [];
        }
        categories[shortcut.category].push(shortcut);
      });

      return Object.entries(categories).map(([category, items]) => `
        <div class="keyboard-shortcuts-section">
          <h3>${category}</h3>
          ${items.map(item => `
            <div class="keyboard-shortcut-item" data-id="${item.id}">
              <span class="keyboard-shortcut-description">${item.description}</span>
              <span class="keyboard-shortcut-keys">
                ${(item.display || item.keys).map(key => {
                  const keyClass = ['cmd', 'ctrl', 'alt', 'shift', 'esc', 'enter', 'tab', 'space'].includes(key.toLowerCase()) 
                    ? key.toLowerCase() 
                    : '';
                  return `<kbd class="keyboard-key ${keyClass}">${key}</kbd>`;
                }).join('<span class="keyboard-shortcut-plus">+</span>')}
              </span>
            </div>
          `).join('')}
        </div>
      `).join('');
    }

    bindEvents() {
      document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts in input fields (except Escape and modal is open)
        if (this.isInputField(e.target) && !this.isModalOpen) return;

        this.pressedKeys.add(e.key);

        // Check for shortcut match
        const match = this.findMatchingShortcut();
        if (match) {
          e.preventDefault();
          match.action();
          this.visualFeedback(match);
        }

        // Check for ? key to show help (if not in input)
        if (e.key === '?' && !this.isInputField(e.target)) {
          e.preventDefault();
          this.toggleModal();
        }
      });

      document.addEventListener('keyup', (e) => {
        this.pressedKeys.delete(e.key);
      });

      // Handle blur to reset keys
      window.addEventListener('blur', () => {
        this.pressedKeys.clear();
      });
    }

    findMatchingShortcut() {
      const currentKeys = Array.from(this.pressedKeys).map(k => k.toLowerCase());
      
      return this.shortcuts.find(shortcut => {
        const shortcutKeys = shortcut.keys.map(k => k.toLowerCase());
        const altKeys = shortcut.altKeys ? shortcut.altKeys.map(k => k.toLowerCase()) : [];
        
        // Check main keys
        const mainMatch = shortcutKeys.length === currentKeys.length && 
                         shortcutKeys.every(key => currentKeys.includes(key));
        
        // Check alt keys
        const altMatch = altKeys.length > 0 && 
                        altKeys.length === currentKeys.length && 
                        altKeys.every(key => currentKeys.includes(key));
        
        return mainMatch || altMatch;
      });
    }

    isInputField(element) {
      return ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName) || 
             element.isContentEditable;
    }

    filterShortcuts(term) {
      term = term.toLowerCase();
      const items = this.modal.querySelectorAll('.keyboard-shortcut-item');
      
      items.forEach(item => {
        const desc = item.querySelector('.keyboard-shortcut-description').textContent.toLowerCase();
        const keys = item.querySelector('.keyboard-shortcut-keys').textContent.toLowerCase();
        
        if (desc.includes(term) || keys.includes(term)) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });

      // Hide empty sections
      this.modal.querySelectorAll('.keyboard-shortcuts-section').forEach(section => {
        const visibleItems = section.querySelectorAll('.keyboard-shortcut-item:not(.hidden)');
        section.style.display = visibleItems.length > 0 ? 'block' : 'none';
      });
    }

    showModal() {
      this.isModalOpen = true;
      this.modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Focus search input
      setTimeout(() => {
        this.modal.querySelector('.keyboard-shortcuts-search input').focus();
      }, 100);
    }

    hideModal() {
      this.isModalOpen = false;
      this.modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    toggleModal() {
      if (this.isModalOpen) {
        this.hideModal();
      } else {
        this.showModal();
      }
    }

    handleEscape() {
      if (this.isModalOpen) {
        this.hideModal();
      } else {
        // Close other modals if open
        document.querySelectorAll('.modal-active, [class*="overlay"].active').forEach(el => {
          if (!el.classList.contains('keyboard-shortcuts-overlay')) {
            el.classList.remove('active');
          }
        });
      }
    }

    navigate(url) {
      window.location.href = url;
    }

    triggerSearch() {
      // Trigger command palette if available
      if (window.commandPalette) {
        window.commandPalette.toggle();
      } else {
        // Scroll to and focus any search input
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]');
        if (searchInput) {
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          searchInput.focus();
        }
      }
    }

    toggleTheme() {
      // Dispatch custom event for theme toggle
      window.dispatchEvent(new CustomEvent('toggle-theme'));
    }

    visualFeedback(shortcut) {
      // Find the shortcut item and animate it
      const item = document.querySelector(`.keyboard-shortcut-item[data-id="${shortcut.id}"]`);
      if (item) {
        const keys = item.querySelectorAll('.keyboard-key');
        keys.forEach(key => {
          key.classList.add('pressed');
          setTimeout(() => key.classList.remove('pressed'), 150);
        });
      }
    }

    showHint() {
      const hint = document.createElement('div');
      hint.className = 'keyboard-hint';
      hint.innerHTML = `
        <div class="keyboard-hint-icon">⌨️</div>
        <div class="keyboard-hint-content">
          <span class="keyboard-hint-title">Pro tip: Use keyboard shortcuts</span>
          <span class="keyboard-hint-text">Press <strong>?</strong> anytime to see available shortcuts</span>
          <div class="keyboard-hint-keys">
            <kbd class="keyboard-key small">?</kbd>
          </div>
        </div>
        <button class="keyboard-hint-close" aria-label="Dismiss hint">✕</button>
      `;

      document.body.appendChild(hint);

      // Animate in
      requestAnimationFrame(() => {
        hint.classList.add('visible');
      });

      // Auto hide
      setTimeout(() => {
        hint.classList.remove('visible');
        setTimeout(() => hint.remove(), 400);
      }, 8000);

      // Close button
      hint.querySelector('.keyboard-hint-close').addEventListener('click', () => {
        hint.classList.remove('visible');
        setTimeout(() => hint.remove(), 400);
      });

      // Mark as shown
      localStorage.setItem('buildbridge_keyboard_hint_shown', 'true');
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.keyboardShortcuts = new KeyboardShortcuts();
    });
  } else {
    window.keyboardShortcuts = new KeyboardShortcuts();
  }
})();
