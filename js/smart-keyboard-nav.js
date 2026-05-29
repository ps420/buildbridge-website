/**
 * Smart Keyboard Navigation v87.3 - Fortune 500 Accessibility Enhancement
 * Comprehensive keyboard navigation with shortcuts and indicators
 */

(function() {
  'use strict';

  const SmartKeyboardNav = {
    isKeyboardUser: false,
    sections: [],
    currentSectionIndex: -1,
    shortcuts: new Map(),
    focusableSelectors: [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ],

    init() {
      this.detectInputMethod();
      this.findSections();
      this.createUI();
      this.registerDefaultShortcuts();
      this.bindEvents();
      
      console.log('⌨️ Smart Keyboard Navigation initialized');
    },

    detectInputMethod() {
      // Detect if user is using keyboard
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          this.setKeyboardUser(true);
        }
      }, { once: true });

      document.addEventListener('mousedown', () => {
        this.setKeyboardUser(false);
      });

      document.addEventListener('touchstart', () => {
        this.setKeyboardUser(false);
      });
    },

    setKeyboardUser(isKeyboard) {
      this.isKeyboardUser = isKeyboard;
      document.body.classList.toggle('keyboard-focus-visible', isKeyboard);
      
      if (isKeyboard) {
        this.showIndicator();
      }
    },

    findSections() {
      this.sections = Array.from(document.querySelectorAll('section[id], [data-section]'));
    },

    createUI() {
      this.createSkipLinks();
      this.createIndicator();
      this.createQuickNav();
      this.createShortcutsModal();
    },

    createSkipLinks() {
      const container = document.createElement('div');
      container.className = 'skip-section-links';
      container.id = 'skipSectionLinks';
      container.setAttribute('role', 'navigation');
      container.setAttribute('aria-label', 'Skip to section');
      
      let html = '<h3>Jump to Section</h3>';
      
      this.sections.forEach((section, index) => {
        const label = section.dataset.navLabel || section.id || `Section ${index + 1}`;
        const id = section.id || `section-${index}`;
        
        html += `
          <a href="#${id}" class="skip-section-link" data-section-index="${index}">
            <span>${label}</span>
            <kbd>${index < 9 ? index + 1 : '⌘'}</kbd>
          </a>
        `;
      });
      
      container.innerHTML = html;
      document.body.appendChild(container);
      this.skipLinks = container;
    },

    createIndicator() {
      const indicator = document.createElement('div');
      indicator.className = 'keyboard-nav-indicator';
      indicator.innerHTML = `
        <div class="keyboard-nav-indicator-icon">⌨️</div>
        <div class="keyboard-nav-indicator-text">
          <strong>Keyboard Navigation Active</strong>
          <span>Press ? for shortcuts</span>
        </div>
      `;
      document.body.appendChild(indicator);
      this.indicator = indicator;
    },

    showIndicator() {
      this.indicator.classList.add('visible');
      
      // Hide after 5 seconds
      clearTimeout(this.indicatorTimeout);
      this.indicatorTimeout = setTimeout(() => {
        this.indicator.classList.remove('visible');
      }, 5000);
    },

    createQuickNav() {
      const panel = document.createElement('nav');
      panel.className = 'quick-nav-panel';
      panel.setAttribute('aria-label', 'Quick navigation');
      panel.id = 'quickNavPanel';
      
      let html = '<h4>Quick Nav</h4><div class="quick-nav-list">';
      
      this.sections.forEach((section, index) => {
        const label = section.dataset.navLabel || section.id || `Section ${index + 1}`;
        const id = section.id || `section-${index}`;
        
        html += `
          <a href="#${id}" class="quick-nav-item" data-section-index="${index}">
            <span>${label}</span>
            <kbd>${index + 1}</kbd>
          </a>
        `;
      });
      
      html += '</div>';
      panel.innerHTML = html;
      document.body.appendChild(panel);
      this.quickNav = panel;
    },

    createShortcutsModal() {
      const modal = document.createElement('div');
      modal.className = 'keyboard-shortcuts-modal';
      modal.id = 'keyboardShortcutsModal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-labelledby', 'shortcutsTitle');
      modal.setAttribute('aria-modal', 'true');
      
      modal.innerHTML = `
        <div class="keyboard-shortcuts-content">
          <div class="keyboard-shortcuts-header">
            <h2 id="shortcutsTitle">Keyboard Shortcuts</h2>
            <button class="keyboard-shortcuts-close" aria-label="Close shortcuts">✕</button>
          </div>
          <div class="keyboard-shortcuts-grid">
            <div class="keyboard-shortcuts-group">
              <h3>Navigation</h3>
              <div class="keyboard-shortcut-item">
                <span class="keyboard-shortcut-desc">Next section</span>
                <span class="keyboard-shortcut-keys"><kbd>PgDn</kbd> or <kbd>Space</kbd></span>
              </div>
              <div class="keyboard-shortcut-item">
                <span class="keyboard-shortcut-desc">Previous section</span>
                <span class="keyboard-shortcut-keys"><kbd>PgUp</kbd></span>
              </div>
              <div class="keyboard-shortcut-item">
                <span class="keyboard-shortcut-desc">Jump to section</span>
                <span class="keyboard-shortcut-keys"><kbd>1</kbd>-<kbd>9</kbd></span>
              </div>
              <div class="keyboard-shortcut-item">
                <span class="keyboard-shortcut-desc">Go to top</span>
                <span class="keyboard-shortcut-keys"><kbd>Home</kbd></span>
              </div>
              <div class="keyboard-shortcut-item">
                <span class="keyboard-shortcut-desc">Go to bottom</span>
                <span class="keyboard-shortcut-keys"><kbd>End</kbd></span>
              </div>
            </div>
            <div class="keyboard-shortcuts-group">
              <h3>Features</h3>
              <div class="keyboard-shortcut-item">
                <span class="keyboard-shortcut-desc">Focus mode</span>
                <span class="keyboard-shortcut-keys"><kbd>F9</kbd></span>
              </div>
              <div class="keyboard-shortcut-item">
                <span class="keyboard-shortcut-desc">Search</span>
                <span class="keyboard-shortcut-keys"><kbd>Ctrl</kbd>+<kbd>K</kbd></span>
              </div>
              <div class="keyboard-shortcut-item">
                <span class="keyboard-shortcut-desc">Quick nav panel</span>
                <span class="keyboard-shortcut-keys"><kbd>\</kbd></span>
              </div>
              <div class="keyboard-shortcut-item">
                <span class="keyboard-shortcut-desc">This help</span>
                <span class="keyboard-shortcut-keys"><kbd>?</kbd> or <kbd>/</kbd></span>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      this.shortcutsModal = modal;
      
      // Close handlers
      modal.querySelector('.keyboard-shortcuts-close').addEventListener('click', () => {
        this.closeShortcutsModal();
      });
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeShortcutsModal();
      });
    },

    openShortcutsModal() {
      this.shortcutsModal.classList.add('active');
      this.trapFocus(this.shortcutsModal);
      document.body.style.overflow = 'hidden';
    },

    closeShortcutsModal() {
      this.shortcutsModal.classList.remove('active');
      document.body.style.overflow = '';
      this.releaseFocus();
    },

    registerDefaultShortcuts() {
      // Navigation shortcuts
      this.register('Home', () => this.scrollToSection(0));
      this.register('End', () => this.scrollToSection(this.sections.length - 1));
      this.register('PageDown', () => this.nextSection());
      this.register('PageUp', () => this.prevSection());
      this.register(' ', (e) => {
        if (!e.target.matches('input, textarea')) {
          e.preventDefault();
          this.nextSection();
        }
      });

      // Number keys for sections 1-9
      for (let i = 1; i <= 9; i++) {
        this.register(i.toString(), () => this.scrollToSection(i - 1));
      }

      // Special shortcuts
      this.register('\\', () => this.toggleQuickNav());
      this.register('?', () => this.openShortcutsModal());
      this.register('/', () => this.openShortcutsModal());
      this.register('k', (e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.openSearch();
        }
      });

      // ESC closes
      this.register('Escape', () => {
        if (this.shortcutsModal.classList.contains('active')) {
          this.closeShortcutsModal();
        } else if (this.quickNav.classList.contains('active')) {
          this.toggleQuickNav();
        } else if (this.skipLinks.classList.contains('active')) {
          this.skipLinks.classList.remove('active');
        }
      });
    },

    register(key, handler) {
      this.shortcuts.set(key.toLowerCase(), handler);
    },

    bindEvents() {
      // Global keyboard handler
      document.addEventListener('keydown', (e) => {
        // Skip if in input
        if (e.target.matches('input, textarea, [contenteditable]') && 
            e.key !== 'Escape' && e.key !== '?') {
          return;
        }

        const key = e.key.toLowerCase();
        const handler = this.shortcuts.get(key);
        
        if (handler) {
          handler(e);
        }
      });

      // Skip links toggle
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && !this.skipLinks.classList.contains('active')) {
          this.skipLinks.classList.add('active');
        }
      });

      // Update current section on scroll
      window.addEventListener('scroll', this.throttle(() => {
        this.updateCurrentSection();
      }, 100), { passive: true });

      // Quick nav item clicks
      this.quickNav.addEventListener('click', (e) => {
        const item = e.target.closest('.quick-nav-item');
        if (item) {
          e.preventDefault();
          const index = parseInt(item.dataset.sectionIndex);
          this.scrollToSection(index);
          this.toggleQuickNav();
        }
      });

      // Skip link clicks
      this.skipLinks.addEventListener('click', (e) => {
        const link = e.target.closest('.skip-section-link');
        if (link) {
          e.preventDefault();
          const index = parseInt(link.dataset.sectionIndex);
          this.scrollToSection(index);
          this.skipLinks.classList.remove('active');
        }
      });

      // Trap focus when needed
      document.addEventListener('focusin', (e) => {
        if (this.focusTrap) {
          this.handleFocusTrap(e);
        }
      });
    },

    nextSection() {
      const newIndex = Math.min(this.currentSectionIndex + 1, this.sections.length - 1);
      this.scrollToSection(newIndex);
    },

    prevSection() {
      const newIndex = Math.max(this.currentSectionIndex - 1, 0);
      this.scrollToSection(newIndex);
    },

    scrollToSection(index) {
      if (index < 0 || index >= this.sections.length) return;
      
      const section = this.sections[index];
      const offset = section.offsetTop - 100;
      
      window.scrollTo({
        top: offset,
        behavior: 'smooth'
      });
      
      this.currentSectionIndex = index;
      this.updateQuickNav();
      
      // Set focus
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    },

    updateCurrentSection() {
      const scrollPos = window.scrollY + window.innerHeight / 3;
      
      for (let i = this.sections.length - 1; i >= 0; i--) {
        if (this.sections[i].offsetTop <= scrollPos) {
          if (this.currentSectionIndex !== i) {
            this.currentSectionIndex = i;
            this.updateQuickNav();
          }
          break;
        }
      }
    },

    updateQuickNav() {
      this.quickNav.querySelectorAll('.quick-nav-item').forEach((item, i) => {
        item.classList.toggle('current', i === this.currentSectionIndex);
      });
    },

    toggleQuickNav() {
      this.quickNav.classList.toggle('active');
      
      if (this.quickNav.classList.contains('active')) {
        this.trapFocus(this.quickNav);
      } else {
        this.releaseFocus();
      }
    },

    trapFocus(container) {
      this.focusTrap = container;
      this.focusTrapContainer = container;
      document.body.classList.add('focus-trap-active');
      
      // Find first focusable
      const focusable = container.querySelectorAll(this.focusableSelectors.join(', '));
      if (focusable.length) {
        this.firstFocusable = focusable[0];
        this.lastFocusable = focusable[focusable.length - 1];
        this.firstFocusable.focus();
      }
    },

    handleFocusTrap(e) {
      if (!this.focusTrap) return;
      
      const isInTrap = this.focusTrap.contains(e.target);
      
      if (!isInTrap) {
        e.target.blur();
        this.firstFocusable.focus();
        return;
      }
      
      if (e.target === this.lastFocusable && !e.shiftKey) {
        e.preventDefault();
        this.firstFocusable.focus();
      } else if (e.target === this.firstFocusable && e.shiftKey) {
        e.preventDefault();
        this.lastFocusable.focus();
      }
    },

    releaseFocus() {
      this.focusTrap = null;
      this.focusTrapContainer = null;
      this.firstFocusable = null;
      this.lastFocusable = null;
      document.body.classList.remove('focus-trap-active');
    },

    openSearch() {
      // Trigger existing search
      const searchTrigger = document.querySelector('[data-search-trigger], .search-trigger');
      if (searchTrigger) {
        searchTrigger.click();
      }
    },

    throttle(fn, wait) {
      let time = Date.now();
      return function() {
        if ((time + wait - Date.now()) < 0) {
          fn.apply(this, arguments);
          time = Date.now();
        }
      };
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SmartKeyboardNav.init());
  } else {
    SmartKeyboardNav.init();
  }

  window.SmartKeyboardNav = SmartKeyboardNav;
})();
