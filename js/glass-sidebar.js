/**
 * Glass Sidebar Navigation Controller
 * BuildBridge v63.0 - Fortune 500 Premium Navigation
 * 
 * Features:
 * - Gesture support for swipe to open/close
 * - Keyboard navigation (Arrow keys, Escape)
 * - Focus trap when open
 * - Animated active indicator
 * - Collapsible submenus
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    swipeThreshold: 50,
    swipeVelocity: 0.5,
    animationDuration: 400,
    persistentBreakpoint: 1400
  };

  // State
  let sidebar = null;
  let toggle = null;
  let overlay = null;
  let isOpen = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouching = false;
  let focusableElements = [];
  let lastFocusedElement = null;

  // Initialize
  function init() {
    sidebar = document.querySelector('.glass-sidebar');
    if (!sidebar) {
      console.log('[GlassSidebar] No sidebar found - creating default');
      createDefaultSidebar();
      return;
    }

    setupElements();
    setupEventListeners();
    setupKeyboardNavigation();
    setupTouchGestures();
    setupFocusTrap();
    setupActiveIndicator();
    
    // Check for persistent sidebar on desktop
    checkPersistentSidebar();
    
    console.log('[GlassSidebar] Initialized');
  }

  // Create default sidebar if not exists
  function createDefaultSidebar() {
    // This would create a default sidebar - skipping for now as site has custom nav
  }

  // Setup element references
  function setupElements() {
    toggle = document.querySelector('.sidebar-toggle');
    overlay = document.querySelector('.sidebar-overlay');
    
    // Create overlay if not exists
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
    }
    
    // Create toggle if not exists
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.className = 'sidebar-toggle';
      toggle.setAttribute('aria-label', 'Toggle navigation menu');
      toggle.innerHTML = `
        <span class="toggle-icon">
          <span></span>
          <span></span>
          <span></span>
        </span>
      `;
      document.body.appendChild(toggle);
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    // Toggle button
    toggle.addEventListener('click', toggleSidebar);
    
    // Overlay click
    overlay.addEventListener('click', closeSidebar);
    
    // Close button in sidebar
    const closeBtn = sidebar.querySelector('.sidebar-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeSidebar);
    }
    
    // Submenu toggles
    sidebar.querySelectorAll('.has-submenu').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.submenu-toggle') || e.currentTarget === e.target) {
          e.preventDefault();
          toggleSubmenu(item);
        }
      });
    });
    
    // Window resize
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Page transitions - reinitialize
    window.addEventListener('page-transition-complete', () => {
      updateActiveLink();
    });
  }

  // Toggle sidebar open/close
  function toggleSidebar() {
    isOpen ? closeSidebar() : openSidebar();
  }

  // Open sidebar
  function openSidebar() {
    if (isOpen) return;
    isOpen = true;
    
    // Store last focused element
    lastFocusedElement = document.activeElement;
    
    // Show sidebar
    sidebar.classList.add('is-open');
    overlay.classList.add('is-visible');
    toggle.setAttribute('aria-expanded', 'true');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus first focusable element
    setTimeout(() => {
      updateFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, config.animationDuration);
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('sidebar-open'));
  }

  // Close sidebar
  function closeSidebar() {
    if (!isOpen) return;
    isOpen = false;
    
    // Hide sidebar
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    toggle.setAttribute('aria-expanded', 'false');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Restore focus
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('sidebar-close'));
  }

  // Toggle submenu
  function toggleSubmenu(item) {
    const submenu = item.nextElementSibling;
    if (!submenu || !submenu.classList.contains('sidebar-submenu')) return;
    
    const isExpanded = item.classList.contains('is-open');
    
    // Close other submenus at same level
    const parent = item.closest('.sidebar-nav-list') || item.closest('.sidebar-submenu-list');
    if (parent) {
      parent.querySelectorAll('.has-submenu.is-open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          const openSubmenu = openItem.nextElementSibling;
          if (openSubmenu) openSubmenu.classList.remove('is-open');
        }
      });
    }
    
    // Toggle current
    item.classList.toggle('is-open');
    submenu.classList.toggle('is-open');
    item.setAttribute('aria-expanded', !isExpanded);
  }

  // Setup keyboard navigation
  function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (!isOpen) {
        // Alt + M to open menu
        if (e.altKey && e.key === 'm') {
          e.preventDefault();
          openSidebar();
        }
        return;
      }
      
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          closeSidebar();
          break;
          
        case 'Tab':
          handleTabNavigation(e);
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          navigateFocus(1);
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          navigateFocus(-1);
          break;
          
        case 'ArrowRight':
        case 'Enter':
          handleSubmenuOpen(e);
          break;
          
        case 'ArrowLeft':
          handleSubmenuClose(e);
          break;
      }
    });
  }

  // Handle Tab navigation with focus trap
  function handleTabNavigation(e) {
    updateFocusableElements();
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }

  // Navigate focus up/down
  function navigateFocus(direction) {
    updateFocusableElements();
    
    const currentIndex = focusableElements.indexOf(document.activeElement);
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) newIndex = focusableElements.length - 1;
    if (newIndex >= focusableElements.length) newIndex = 0;
    
    focusableElements[newIndex].focus();
  }

  // Handle submenu open
  function handleSubmenuOpen(e) {
    const active = document.activeElement;
    if (active.classList.contains('has-submenu')) {
      e.preventDefault();
      const submenu = active.nextElementSibling;
      if (submenu && !submenu.classList.contains('is-open')) {
        toggleSubmenu(active);
        // Focus first submenu item
        const firstSubItem = submenu.querySelector('.sidebar-submenu-link');
        if (firstSubItem) firstSubItem.focus();
      }
    }
  }

  // Handle submenu close
  function handleSubmenuClose(e) {
    const active = document.activeElement;
    const parentSubmenu = active.closest('.sidebar-submenu');
    if (parentSubmenu) {
      e.preventDefault();
      const parentLink = parentSubmenu.previousElementSibling;
      if (parentLink) {
        toggleSubmenu(parentLink);
        parentLink.focus();
      }
    }
  }

  // Setup touch gestures
  function setupTouchGestures() {
    // Swipe from left edge to open
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isTouching = true;
  }

  function handleTouchMove(e) {
    if (!isTouching) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX;
    const deltaY = touchY - touchStartY;
    
    // Swipe from left edge to open
    if (!isOpen && touchStartX < 30 && deltaX > config.swipeThreshold && Math.abs(deltaY) < 50) {
      openSidebar();
      isTouching = false;
    }
    
    // Swipe left to close
    if (isOpen && deltaX < -config.swipeThreshold && Math.abs(deltaY) < 50) {
      closeSidebar();
      isTouching = false;
    }
  }

  function handleTouchEnd() {
    isTouching = false;
  }

  // Setup focus trap
  function setupFocusTrap() {
    updateFocusableElements();
  }

  function updateFocusableElements() {
    if (!sidebar) return;
    focusableElements = Array.from(sidebar.querySelectorAll(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.disabled && el.offsetParent !== null);
  }

  // Setup animated active indicator
  function setupActiveIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'sidebar-active-indicator';
    sidebar.querySelector('.sidebar-nav')?.appendChild(indicator);
    
    updateActiveLink();
    
    // Update on route change
    window.addEventListener('popstate', updateActiveLink);
  }

  // Update active link
  function updateActiveLink() {
    const currentPath = window.location.pathname;
    const links = sidebar.querySelectorAll('.sidebar-nav-link, .sidebar-submenu-link');
    
    links.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && currentPath.includes(href.replace('.html', ''))) {
        link.classList.add('active');
        
        // Open parent submenu if needed
        const parentSubmenu = link.closest('.sidebar-submenu');
        if (parentSubmenu) {
          const parentLink = parentSubmenu.previousElementSibling;
          if (parentLink && !parentLink.classList.contains('is-open')) {
            toggleSubmenu(parentLink);
          }
        }
      }
    });
    
    updateActiveIndicator();
  }

  // Update active indicator position
  function updateActiveIndicator() {
    const indicator = sidebar.querySelector('.sidebar-active-indicator');
    const activeLink = sidebar.querySelector('.sidebar-nav-link.active');
    
    if (!indicator || !activeLink) {
      indicator?.classList.remove('is-visible');
      return;
    }
    
    const navRect = sidebar.querySelector('.sidebar-nav')?.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    
    if (navRect && linkRect) {
      indicator.style.top = (linkRect.top - navRect.top + sidebar.querySelector('.sidebar-nav').scrollTop) + 'px';
      indicator.classList.add('is-visible');
    }
  }

  // Check for persistent sidebar
  function checkPersistentSidebar() {
    const isDesktop = window.innerWidth >= config.persistentBreakpoint;
    const shouldBePersistent = sidebar.classList.contains('persistent');
    
    if (isDesktop && shouldBePersistent) {
      document.body.classList.add('has-persistent-sidebar');
      sidebar.classList.add('is-visible');
    } else {
      document.body.classList.remove('has-persistent-sidebar');
      sidebar.classList.remove('is-visible');
    }
  }

  // Handle window resize
  function handleResize() {
    checkPersistentSidebar();
    
    // Close mobile sidebar on resize to desktop
    if (window.innerWidth >= config.persistentBreakpoint && isOpen) {
      closeSidebar();
    }
  }

  // Public API
  window.GlassSidebar = {
    init,
    open: openSidebar,
    close: closeSidebar,
    toggle: toggleSidebar,
    get isOpen() { return isOpen; },
    updateActiveLink
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
