/**
 * BuildBridge Smart Sticky Navigation
 * Fortune 500 Professional Auto Hide/Show System
 * 
 * Features:
 * - Hides when scrolling down
 * - Shows when scrolling up
 * - Compacts when scrolled past threshold
 * - Smooth transitions with cubic-bezier easing
 * - Scroll progress indicator
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    scrollThreshold: 100,        // Pixels to scroll before compact mode
    hideThreshold: 200,          // Pixels to scroll before hiding capability
    tolerance: 10,               // Scroll delta tolerance to prevent jitter
    hideDelay: 100,              // Delay before hiding (ms)
    showDelay: 50,               // Delay before showing (ms)
  };

  // State
  let state = {
    lastScrollY: 0,
    ticking: false,
    isHidden: false,
    isCompact: false,
    scrollDirection: 'none',
    hideTimeout: null,
    showTimeout: null
  };

  // DOM Elements
  let nav = null;
  let navProgressBar = null;

  /**
   * Initialize the smart sticky navigation
   */
  function init() {
    // Add class to existing nav or create enhanced version
    nav = document.getElementById('navbar');
    
    if (!nav) {
      console.warn('Smart Sticky Nav: Navigation element not found');
      return;
    }

    // Add smart sticky classes
    nav.classList.add('smart-sticky-nav', 'nav--at-top', 'nav--visible');
    
    // Create progress bar
    createProgressBar();
    
    // Bind events
    bindEvents();
    
    // Initial check
    handleScroll();
    
    console.log('✓ Smart Sticky Navigation initialized');
  }

  /**
   * Create scroll progress bar
   */
  function createProgressBar() {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'nav-progress-container';
    
    navProgressBar = document.createElement('div');
    navProgressBar.className = 'nav-progress-bar';
    
    progressContainer.appendChild(navProgressBar);
    nav.appendChild(progressContainer);
  }

  /**
   * Bind scroll events with RAF for performance
   */
  function bindEvents() {
    // Use passive listener for better performance
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Also handle resize
    window.addEventListener('resize', onResize, { passive: true });
  }

  /**
   * Scroll handler with requestAnimationFrame
   */
  function onScroll() {
    if (!state.ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        state.ticking = false;
      });
      state.ticking = true;
    }
  }

  /**
   * Handle scroll logic
   */
  function handleScroll() {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - state.lastScrollY;
    const scrollPercent = (currentScrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    
    // Update progress bar
    if (navProgressBar) {
      navProgressBar.style.width = Math.min(scrollPercent, 100) + '%';
    }
    
    // Determine scroll direction
    if (Math.abs(scrollDelta) > CONFIG.tolerance) {
      state.scrollDirection = scrollDelta > 0 ? 'down' : 'up';
    }
    
    // At top state
    if (currentScrollY <= 0) {
      nav.classList.add('nav--at-top');
      nav.classList.remove('nav--scrolled');
      showNav();
    } else {
      nav.classList.remove('nav--at-top');
      
      // Check if scrolled past threshold for compact mode
      if (currentScrollY > CONFIG.scrollThreshold) {
        if (!state.isCompact) {
          nav.classList.add('nav--scrolled');
          state.isCompact = true;
        }
      } else {
        if (state.isCompact) {
          nav.classList.remove('nav--scrolled');
          state.isCompact = false;
        }
      }
      
      // Hide/show logic only after scroll threshold
      if (currentScrollY > CONFIG.hideThreshold) {
        if (state.scrollDirection === 'down' && scrollDelta > CONFIG.tolerance) {
          // Scrolling down - hide nav after delay
          scheduleHide();
        } else if (state.scrollDirection === 'up' && scrollDelta < -CONFIG.tolerance) {
          // Scrolling up - show nav immediately
          scheduleShow();
        }
      } else {
        showNav();
      }
    }
    
    state.lastScrollY = currentScrollY;
  }

  /**
   * Schedule navigation hide with delay
   */
  function scheduleHide() {
    clearTimeout(state.showTimeout);
    
    if (!state.hideTimeout && !state.isHidden) {
      state.hideTimeout = setTimeout(() => {
        hideNav();
        state.hideTimeout = null;
      }, CONFIG.hideDelay);
    }
  }

  /**
   * Schedule navigation show with delay
   */
  function scheduleShow() {
    clearTimeout(state.hideTimeout);
    
    if (!state.showTimeout && state.isHidden) {
      state.showTimeout = setTimeout(() => {
        showNav();
        state.showTimeout = null;
      }, CONFIG.showDelay);
    } else if (!state.isHidden) {
      showNav();
    }
  }

  /**
   * Hide navigation
   */
  function hideNav() {
    if (!state.isHidden) {
      nav.classList.remove('nav--visible');
      nav.classList.add('nav--hidden');
      state.isHidden = true;
      
      // Emit event for other components
      emitEvent('nav:hidden');
    }
  }

  /**
   * Show navigation
   */
  function showNav() {
    if (state.isHidden) {
      nav.classList.remove('nav--hidden');
      nav.classList.add('nav--visible');
      state.isHidden = false;
      
      // Emit event for other components
      emitEvent('nav:visible');
    }
  }

  /**
   * Handle resize
   */
  function onResize() {
    // Recalculate on resize
    handleScroll();
  }

  /**
   * Emit custom event
   */
  function emitEvent(name) {
    window.dispatchEvent(new CustomEvent(name, {
      detail: { 
        scrollY: window.scrollY,
        isCompact: state.isCompact 
      }
    }));
  }

  /**
   * Public API
   */
  window.SmartStickyNav = {
    init,
    show: showNav,
    hide: hideNav,
    isHidden: () => state.isHidden,
    isCompact: () => state.isCompact,
    getState: () => ({ ...state })
  };

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
