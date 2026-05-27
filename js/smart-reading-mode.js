/**
 * Smart Reading Mode - v33.0
 * Fortune 500 Focused Reading Experience
 * 
 * Features:
 * - Toggle between normal and focused reading modes
 * - Hides distracting UI elements for better focus
 * - Smooth transitions and animations
 * - Persists user preference
 * - Keyboard shortcut: Shift + F
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    storageKey: 'buildbridge-reading-mode',
    shortcutKey: 'F',
    shortcutModifier: 'shift'
  };

  // State
  let isReadingMode = false;

  /**
   * Initialize Smart Reading Mode
   */
  function init() {
    // Check for saved preference
    const savedMode = localStorage.getItem(CONFIG.storageKey);
    if (savedMode === 'true') {
      enableReadingMode(false);
    }

    // Create toggle button
    createToggleButton();

    // Create indicator
    createIndicator();

    // Setup keyboard shortcut
    setupKeyboardShortcut();

    // Add to console
    console.log('📖 BuildBridge Smart Reading Mode v33.0 loaded | Shortcut: Shift+F');
  }

  /**
   * Create the reading mode toggle button
   */
  function createToggleButton() {
    const button = document.createElement('button');
    button.className = 'reading-mode-toggle';
    button.setAttribute('aria-label', 'Toggle reading mode');
    button.setAttribute('title', 'Toggle Focus Mode (Shift+F)');
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
      </svg>
    `;

    button.addEventListener('click', toggleReadingMode);

    document.body.appendChild(button);
  }

  /**
   * Create the reading mode indicator
   */
  function createIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'reading-mode-indicator';
    indicator.innerHTML = `
      <span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
        Focus Mode Active — Press Shift+F to exit
      </span>
    `;

    document.body.appendChild(indicator);
  }

  /**
   * Toggle reading mode
   */
  function toggleReadingMode() {
    if (isReadingMode) {
      disableReadingMode();
    } else {
      enableReadingMode();
    }
  }

  /**
   * Enable reading mode
   * @param {boolean} animate - Whether to animate the transition
   */
  function enableReadingMode(animate = true) {
    isReadingMode = true;
    document.body.classList.add('reading-mode');
    
    const toggle = document.querySelector('.reading-mode-toggle');
    if (toggle) toggle.classList.add('active');

    // Save preference
    localStorage.setItem(CONFIG.storageKey, 'true');

    // Show toast notification
    if (window.Toast && animate) {
      window.Toast.info('Focus Mode enabled. Distractions hidden.', {
        duration: 3000,
        icon: '📖'
      });
    }

    // Track engagement
    trackEvent('reading_mode_enabled');

    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('readingModeEnabled'));
  }

  /**
   * Disable reading mode
   */
  function disableReadingMode() {
    isReadingMode = false;
    document.body.classList.remove('reading-mode');
    
    const toggle = document.querySelector('.reading-mode-toggle');
    if (toggle) toggle.classList.remove('active');

    // Save preference
    localStorage.setItem(CONFIG.storageKey, 'false');

    // Show toast notification
    if (window.Toast) {
      window.Toast.info('Focus Mode disabled.', {
        duration: 2000,
        icon: '📖'
      });
    }

    // Track engagement
    trackEvent('reading_mode_disabled');

    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('readingModeDisabled'));
  }

  /**
   * Setup keyboard shortcut (Shift + F)
   */
  function setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Check for Shift + F
      if (e.shiftKey && e.key.toLowerCase() === CONFIG.shortcutKey.toLowerCase()) {
        e.preventDefault();
        toggleReadingMode();
      }

      // Exit reading mode with Escape
      if (e.key === 'Escape' && isReadingMode) {
        disableReadingMode();
      }
    });
  }

  /**
   * Track engagement event
   * @param {string} event - Event name
   */
  function trackEvent(event) {
    if (window.gtag) {
      window.gtag('event', event, {
        event_category: 'reading_mode',
        event_label: 'Smart Reading Mode v33.0'
      });
    }
  }

  // Auto-hide nav on scroll in reading mode
  let lastScrollY = 0;
  let scrollTimeout;

  function handleScroll() {
    if (!isReadingMode) return;

    clearTimeout(scrollTimeout);
    
    const currentScrollY = window.scrollY;
    const nav = document.querySelector('.nav');
    
    if (nav) {
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        nav.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up
        nav.style.transform = 'translateY(0)';
      }
    }
    
    lastScrollY = currentScrollY;

    // Reset after scroll stops
    scrollTimeout = setTimeout(() => {
      if (nav) nav.style.transform = 'translateY(-100%)';
    }, 3000);
  }

  document.addEventListener('scroll', handleScroll, { passive: true });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.ReadingMode = {
    enable: () => enableReadingMode(),
    disable: disableReadingMode,
    toggle: toggleReadingMode,
    isActive: () => isReadingMode
  };
})();
