/**
 * v84.0: Enhanced Focus-Visible Navigation System
 * Fortune 500 Keyboard Accessibility System
 * 
 * Features:
 * - Keyboard navigation detection
 * - Focus trap for modals
 * - Skip link management
 * - Focus order optimization
 * - Section landmark navigation
 */

(function() {
  'use strict';

  // State
  const state = {
    isKeyboardNavigation: false,
    lastFocusedElement: null,
    focusTrapStack: [],
    focusIndicator: null,
    skipLinks: [],
    headings: []
  };

  // Selectors for focusable elements
  const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable]',
    'summary',
    'audio[controls]',
    'video[controls]'
  ].join(', ');

  /**
   * Detect keyboard navigation
   */
  function initKeyboardDetection() {
    // Track keyboard usage
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (!state.isKeyboardNavigation) {
          state.isKeyboardNavigation = true;
          document.body.classList.add('keyboard-navigation-active');
        }
      }
    });

    // Reset on mouse interaction
    document.addEventListener('mousedown', () => {
      if (state.isKeyboardNavigation) {
        state.isKeyboardNavigation = false;
        document.body.classList.remove('keyboard-navigation-active');
      }
    });

    // Track focus
    document.addEventListener('focusin', (e) => {
      state.lastFocusedElement = e.target;
      updateFocusIndicator(e.target);
    });
  }

  /**
   * Create visual focus indicator
   */
  function createFocusIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'nav-focus-indicator';
    indicator.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 10000;
      background: #C9CED6;
      border-radius: 2px;
      opacity: 0;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    document.body.appendChild(indicator);
    return indicator;
  }

  /**
   * Update focus indicator position
   */
  function updateFocusIndicator(element) {
    if (!state.focusIndicator) {
      state.focusIndicator = createFocusIndicator();
    }

    const rect = element.getBoundingClientRect();
    const indicator = state.focusIndicator;

    // Position indicator below focused element
    indicator.style.width = `${rect.width}px`;
    indicator.style.height = '3px';
    indicator.style.left = `${rect.left}px`;
    indicator.style.top = `${rect.bottom + 4}px`;
    indicator.style.opacity = state.isKeyboardNavigation ? '1' : '0';
  }

  /**
   * Initialize enhanced skip links
   */
  function initSkipLinks() {
    const skipContainer = document.createElement('div');
    skipContainer.className = 'skip-links-container';
    skipContainer.setAttribute('role', 'navigation');
    skipContainer.setAttribute('aria-label', 'Skip links');

    const mainContent = document.querySelector('main, [role="main"], #main-content');
    const nav = document.querySelector('nav, [role="navigation"]');
    const footer = document.querySelector('footer, [role="contentinfo"]');

    const links = [];

    if (mainContent) {
      mainContent.id = mainContent.id || 'main-content';
      links.push(createSkipLink('#main-content', 'Skip to main content'));
    }

    if (nav) {
      nav.id = nav.id || 'main-nav';
      links.push(createSkipLink('#main-nav', 'Skip to navigation'));
    }

    if (footer) {
      footer.id = footer.id || 'footer';
      links.push(createSkipLink('#footer', 'Skip to footer'));
    }

    links.push(createSkipLink('#', 'Skip to search (press /)', handleSearchFocus));

    links.forEach(link => skipContainer.appendChild(link));
    document.body.insertBefore(skipContainer, document.body.firstChild);

    // Handle skip link visibility
    let skipVisible = false;
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && !skipVisible) {
        skipContainer.querySelector('.skip-link-enhanced').focus();
        e.preventDefault();
        skipVisible = true;
      }
    });

    document.addEventListener('click', () => {
      skipVisible = false;
    });
  }

  /**
   * Create skip link element
   */
  function createSkipLink(href, text, onClick) {
    const link = document.createElement('a');
    link.href = href;
    link.className = 'skip-link-enhanced';
    link.textContent = text;
    
    if (onClick) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        onClick(e);
      });
    }

    return link;
  }

  /**
   * Focus search on / key
   */
  function handleSearchFocus(e) {
    const searchInput = document.querySelector('input[type="search"], [role="search"] input');
    if (searchInput) {
      searchInput.focus();
    }
  }

  /**
   * Focus trap for modals/dialogs
   */
  function createFocusTrap(container, options = {}) {
    const config = {
      initialFocus: options.initialFocus || null,
      returnFocus: options.returnFocus !== false,
      escapeDeactivates: options.escapeDeactivates !== false,
      clickOutsideDeactivates: options.clickOutsideDeactivates || false,
      onActivate: options.onActivate || null,
      onDeactivate: options.onDeactivate || null
    };

    const elements = {
      container,
      firstFocusable: null,
      lastFocusable: null
    };

    let previouslyFocused = null;

    function getFocusableElements() {
      return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS))
        .filter(el => {
          return el.offsetParent !== null && 
                 !el.disabled && 
                 !el.hasAttribute('hidden') &&
                 el.tabIndex >= 0;
        });
    }

    function updateFocusableElements() {
      const focusable = getFocusableElements();
      elements.firstFocusable = focusable[0] || null;
      elements.lastFocusable = focusable[focusable.length - 1] || null;
    }

    function handleKeyDown(e) {
      if (e.key === 'Tab') {
        updateFocusableElements();

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === elements.firstFocusable || !elements.firstFocusable) {
            e.preventDefault();
            if (elements.lastFocusable) {
              elements.lastFocusable.focus();
            }
          }
        } else {
          // Tab
          if (document.activeElement === elements.lastFocusable || !elements.lastFocusable) {
            e.preventDefault();
            if (elements.firstFocusable) {
              elements.firstFocusable.focus();
            }
          }
        }
      }

      if (e.key === 'Escape' && config.escapeDeactivates) {
        deactivate();
      }
    }

    function handleClickOutside(e) {
      if (config.clickOutsideDeactivates && !container.contains(e.target)) {
        deactivate();
      }
    }

    function activate() {
      previouslyFocused = document.activeElement;
      container.classList.add('focus-trap-active');
      container.setAttribute('aria-modal', 'true');
      
      document.addEventListener('keydown', handleKeyDown);
      
      if (config.clickOutsideDeactivates) {
        document.addEventListener('click', handleClickOutside);
      }

      updateFocusableElements();

      // Set initial focus
      if (config.initialFocus) {
        config.initialFocus.focus();
      } else if (elements.firstFocusable) {
        elements.firstFocusable.focus();
      }

      if (config.onActivate) {
        config.onActivate();
      }

      // Push to stack
      state.focusTrapStack.push(deactivate);
    }

    function deactivate() {
      container.classList.remove('focus-trap-active');
      container.removeAttribute('aria-modal');
      
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);

      if (config.returnFocus && previouslyFocused) {
        previouslyFocused.focus();
      }

      if (config.onDeactivate) {
        config.onDeactivate();
      }

      // Remove from stack
      const index = state.focusTrapStack.indexOf(deactivate);
      if (index > -1) {
        state.focusTrapStack.splice(index, 1);
      }
    }

    return {
      activate,
      deactivate,
      elements
    };
  }

  /**
   * Initialize heading navigation (for screen reader rotor)
   */
  function initHeadingNavigation() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headings.forEach((heading, index) => {
      heading.setAttribute('tabindex', '-1');
      heading.classList.add('heading-navigation-highlight');
      
      // Add ID if missing
      if (!heading.id) {
        const text = heading.textContent.trim().toLowerCase();
        heading.id = `heading-${text.replace(/[^a-z0-9]+/g, '-')}-${index}`;
      }
    });

    state.headings = Array.from(headings);
  }

  /**
   * Navigate to next/previous heading
   */
  function navigateHeadings(direction) {
    const focusedElement = document.activeElement;
    const currentIndex = state.headings.indexOf(focusedElement);
    
    let nextIndex;
    if (currentIndex === -1) {
      nextIndex = direction === 'next' ? 0 : state.headings.length - 1;
    } else {
      nextIndex = direction === 'next' 
        ? (currentIndex + 1) % state.headings.length
        : (currentIndex - 1 + state.headings.length) % state.headings.length;
    }

    const target = state.headings[nextIndex];
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Announce messages to screen readers
   */
  function announce(message, priority = 'polite') {
    const announcer = document.createElement('div');
    announcer.className = `aria-live-${priority}`;
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    
    document.body.appendChild(announcer);

    // Delay to ensure announcement
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);

    // Cleanup
    setTimeout(() => {
      announcer.remove();
    }, 1000);
  }

  /**
   * Manage focus on page load
   */
  function initPageFocus() {
    // Check for hash in URL
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        setTimeout(() => {
          target.setAttribute('tabindex', '-1');
          target.focus();
        }, 100);
      }
    }
  }

  /**
   * Keyboard shortcuts
   */
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Skip on input elements
      if (e.target.matches('input, textarea, select, [contenteditable]')) {
        return;
      }

      // H key - navigate headings
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        navigateHeadings(e.shiftKey ? 'prev' : 'next');
      }

      // / key - focus search
      if (e.key === '/') {
        e.preventDefault();
        handleSearchFocus();
      }

      // ? key - show keyboard shortcuts
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        showKeyboardShortcuts();
      }
    });
  }

  /**
   * Show keyboard shortcuts dialog
   */
  function showKeyboardShortcuts() {
    const shortcuts = [
      { key: 'Tab', description: 'Navigate to next focusable element' },
      { key: 'Shift + Tab', description: 'Navigate to previous focusable element' },
      { key: 'H', description: 'Jump to next heading' },
      { key: 'Shift + H', description: 'Jump to previous heading' },
      { key: '/', description: 'Focus search input' },
      { key: 'Shift + ?', description: 'Show keyboard shortcuts' },
      { key: 'Escape', description: 'Close modal or menu' }
    ];

    const html = `
      <div class="keyboard-shortcuts-dialog" role="dialog" aria-labelledby="shortcuts-title" aria-modal="true">
        <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
        <dl>
          ${shortcuts.map(s => `
            <dt><kbd>${s.key}</kbd></dt>
            <dd>${s.description}</dd>
          `).join('')}
        </dl>
        <button class="close-shortcuts">Close</button>
      </div>
    `;

    const overlay = document.createElement('div');
    overlay.className = 'keyboard-shortcuts-overlay';
    overlay.innerHTML = html;
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100000;
    `;

    const dialog = overlay.querySelector('.keyboard-shortcuts-dialog');
    dialog.style.cssText = `
      background: #1a1a22;
      padding: 32px;
      border-radius: 16px;
      max-width: 500px;
      width: 90%;
    `;

    document.body.appendChild(overlay);

    const trap = createFocusTrap(dialog, {
      onDeactivate: () => overlay.remove()
    });
    trap.activate();

    overlay.querySelector('.close-shortcuts').addEventListener('click', () => {
      trap.deactivate();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        trap.deactivate();
      }
    });
  }

  // Initialize all systems
  function init() {
    initKeyboardDetection();
    initSkipLinks();
    initHeadingNavigation();
    initPageFocus();
    initKeyboardShortcuts();

    console.log('⌨️ Enhanced Focus Navigation System initialized');
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.FocusNavigation = {
    createFocusTrap,
    navigateHeadings,
    announce,
    isKeyboardNavigation: () => state.isKeyboardNavigation,
    getLastFocused: () => state.lastFocusedElement
  };

})();
