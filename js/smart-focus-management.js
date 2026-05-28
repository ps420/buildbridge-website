/**
 * Smart Focus Management System v56.0
 * Fortune 500 Accessibility & Keyboard Navigation Standard
 */

class SmartFocusManager {
  constructor() {
    this.focusHistory = [];
    this.maxHistoryLength = 10;
    this.isKeyboardNavigation = false;
    this.focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]',
      'details > summary'
    ];
    this.trapContainers = new Set();
    this.init();
  }

  init() {
    this.detectInputMethod();
    this.setupSkipLinks();
    this.setupFocusIndicators();
    this.setupKeyboardShortcuts();
    this.setupFocusTraps();
    this.setupFocusTrail();
    this.setupSectionNavigation();
  }

  // Detect if user is navigating with keyboard
  detectInputMethod() {
    // Mouse/touch detection
    document.addEventListener('mousedown', () => {
      this.isKeyboardNavigation = false;
      document.body.classList.remove('keyboard-navigation');
    });

    document.addEventListener('touchstart', () => {
      this.isKeyboardNavigation = false;
      document.body.classList.remove('keyboard-navigation');
    }, { passive: true });

    // Keyboard detection
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' || e.key.startsWith('Arrow')) {
        this.isKeyboardNavigation = true;
        document.body.classList.add('keyboard-navigation');
        this.showTabNavigationHint();
      }
    });
  }

  // Show keyboard navigation hint
  showTabNavigationHint() {
    let hint = document.querySelector('.tab-navigation-indicator');
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'tab-navigation-indicator';
      hint.innerHTML = `
        <kbd>Tab</kbd>
        <span>to navigate</span>
        <kbd>Enter</kbd>
        <span>to select</span>
        <kbd>Esc</kbd>
        <span>to close</span>
      `;
      document.body.appendChild(hint);
    }

    hint.classList.add('visible');
    clearTimeout(this.hintTimeout);
    this.hintTimeout = setTimeout(() => {
      hint.classList.remove('visible');
    }, 3000);
  }

  // Enhanced skip links
  setupSkipLinks() {
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(skipLink.getAttribute('href'));
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Announce to screen readers
          this.announceToScreenReader(`Skipped to ${target.getAttribute('aria-label') || 'main content'}`);
        }
      });
    }
  }

  // Setup focus indicators for interactive elements
  setupFocusIndicators() {
    const interactiveElements = document.querySelectorAll('button, a, [role="button"]');
    interactiveElements.forEach(el => {
      el.classList.add('interactive-element');
      
      // Add focus indicator for buttons
      if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') {
        el.classList.add('focus-indicator-button');
      }
    });
  }

  // Keyboard shortcuts for navigation
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Skip link shortcut (Alt + 0)
      if (e.altKey && e.key === '0') {
        e.preventDefault();
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) skipLink.focus();
      }

      // Jump to main navigation (Alt + 1)
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        const nav = document.querySelector('#navbar, nav, [role="navigation"]');
        if (nav) {
          const firstLink = nav.querySelector('a, button');
          if (firstLink) firstLink.focus();
        }
      }

      // Jump to main content (Alt + 2)
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        const main = document.querySelector('#main-content, main, [role="main"]');
        if (main) {
          main.setAttribute('tabindex', '-1');
          main.focus();
        }
      }

      // Toggle tab order display (Alt + T)
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        document.body.classList.toggle('show-tab-order');
        if (document.body.classList.contains('show-tab-order')) {
          this.showTabOrderNumbers();
        } else {
          this.hideTabOrderNumbers();
        }
      }

      // Focus mode (Alt + F)
      if (e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        this.toggleFocusMode();
      }

      // Go back in focus history (Alt + ←)
      if (e.altKey && e.key === 'ArrowLeft' && this.focusHistory.length > 1) {
        e.preventDefault();
        this.focusHistory.pop(); // Remove current
        const previous = this.focusHistory.pop();
        if (previous && document.contains(previous)) {
          previous.focus();
        }
      }
    });
  }

  // Focus trap for modals and dialogs
  setupFocusTraps() {
    const trapContainers = document.querySelectorAll('[data-focus-trap]');
    trapContainers.forEach(container => {
      this.trapContainers.add(container);
      
      container.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          this.handleTabInTrap(e, container);
        }
        
        if (e.key === 'Escape') {
          this.releaseFocusTrap(container);
        }
      });
    });
  }

  handleTabInTrap(e, container) {
    const focusables = this.getFocusableElements(container);
    if (focusables.length === 0) return;

    const firstFocusable = focusables[0];
    const lastFocusable = focusables[focusables.length - 1];
    const activeElement = document.activeElement;

    if (e.shiftKey) {
      if (activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  activateFocusTrap(container) {
    container.classList.add('focus-trapped');
    container.setAttribute('aria-modal', 'true');
    
    // Store previously focused element
    this.previouslyFocused = document.activeElement;
    
    // Focus first element
    const focusables = this.getFocusableElements(container);
    if (focusables.length > 0) {
      setTimeout(() => focusables[0].focus(), 0);
    }
  }

  releaseFocusTrap(container) {
    container.classList.remove('focus-trapped');
    container.removeAttribute('aria-modal');
    
    // Return focus to previous element
    if (this.previouslyFocused && document.contains(this.previouslyFocused)) {
      this.previouslyFocused.focus();
    }
  }

  getFocusableElements(container) {
    return Array.from(container.querySelectorAll(this.focusableSelectors.join(', ')))
      .filter(el => {
        return el.offsetParent !== null && 
               !el.hasAttribute('disabled') &&
               !el.hasAttribute('aria-hidden');
      });
  }

  // Focus trail animation
  setupFocusTrail() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.addEventListener('focusin', (e) => {
      if (!this.isKeyboardNavigation) return;
      
      const rect = e.target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      this.createFocusTrailDot(centerX, centerY);
      this.addToFocusHistory(e.target);
    });
  }

  createFocusTrailDot(x, y) {
    const dot = document.createElement('div');
    dot.className = 'focus-history-dot';
    dot.style.left = `${x - 4}px`;
    dot.style.top = `${y - 4}px`;
    document.body.appendChild(dot);

    setTimeout(() => dot.remove(), 600);
  }

  addToFocusHistory(element) {
    this.focusHistory.push(element);
    if (this.focusHistory.length > this.maxHistoryLength) {
      this.focusHistory.shift();
    }
  }

  // Section navigation
  setupSectionNavigation() {
    const sections = document.querySelectorAll('section[id], [data-section]');
    
    sections.forEach((section, index) => {
      section.setAttribute('tabindex', '-1');
      section.setAttribute('data-section-index', index + 1);
      
      // Add section focus indicator
      const indicator = document.createElement('div');
      indicator.className = 'section-focus-indicator';
      section.appendChild(indicator);
    });

    // Navigate between sections with arrow keys
    document.addEventListener('keydown', (e) => {
      if (!e.altKey) return;
      
      const currentIndex = parseInt(document.activeElement?.getAttribute('data-section-index')) || 0;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = document.querySelector(`[data-section-index="${currentIndex + 1}"]`);
        if (next) {
          next.focus();
          next.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = document.querySelector(`[data-section-index="${currentIndex - 1}"]`);
        if (prev) {
          prev.focus();
          prev.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }

  // Show tab order numbers
  showTabOrderNumbers() {
    const focusables = document.querySelectorAll(this.focusableSelectors.join(', '));
    focusables.forEach((el, index) => {
      el.setAttribute('data-tab-order', index + 1);
    });
  }

  hideTabOrderNumbers() {
    const elements = document.querySelectorAll('[data-tab-order]');
    elements.forEach(el => el.removeAttribute('data-tab-order'));
  }

  // Focus mode - highlight focused element
  toggleFocusMode() {
    const overlay = document.querySelector('.focus-mode-overlay') || this.createFocusModeOverlay();
    overlay.classList.toggle('active');
    
    if (overlay.classList.contains('active')) {
      document.addEventListener('focusin', this.handleFocusModeFocus);
    } else {
      document.removeEventListener('focusin', this.handleFocusModeFocus);
      document.querySelectorAll('.focus-mode-target').forEach(el => {
        el.classList.remove('focus-mode-target');
      });
    }
  }

  createFocusModeOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'focus-mode-overlay';
    document.body.appendChild(overlay);
    return overlay;
  }

  handleFocusModeFocus(e) {
    document.querySelectorAll('.focus-mode-target').forEach(el => {
      el.classList.remove('focus-mode-target');
    });
    e.target.classList.add('focus-mode-target');
  }

  // Screen reader announcements
  announceToScreenReader(message, priority = 'polite') {
    const announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-announcer';
    announcer.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    
    document.body.appendChild(announcer);
    announcer.textContent = message;
    
    setTimeout(() => announcer.remove(), 1000);
  }

  // Focus first focusable element in a container
  focusFirst(container) {
    const focusables = this.getFocusableElements(container);
    if (focusables.length > 0) {
      focusables[0].focus();
      return true;
    }
    return false;
  }

  // Focus last focusable element in a container
  focusLast(container) {
    const focusables = this.getFocusableElements(container);
    if (focusables.length > 0) {
      focusables[focusables.length - 1].focus();
      return true;
    }
    return false;
  }

  // Check if element is focusable
  isFocusable(element) {
    return this.focusableSelectors.some(selector => element.matches(selector)) &&
           element.offsetParent !== null &&
           !element.hasAttribute('disabled');
  }
}

// Initialize focus manager
const focusManager = new SmartFocusManager();

// Export for use in other modules
window.SmartFocusManager = SmartFocusManager;
window.focusManager = focusManager;
