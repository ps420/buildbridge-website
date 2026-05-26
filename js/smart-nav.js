/**
 * Smart Navigation
 * Hides on scroll down, shows on scroll up
 * With scroll progress and section indicators
 */

(function() {
  'use strict';

  const config = {
    scrollThreshold: 50,
    hideDelay: 100,
    showDelay: 0,
    touchThreshold: 10
  };

  let nav = null;
  let lastScrollY = 0;
  let ticking = false;
  let hideTimeout = null;
  let isNavHidden = false;
  let touchStartY = 0;
  let sections = [];
  let currentSection = '';

  // Initialize
  function init() {
    nav = document.querySelector('.nav');
    if (!nav) return;

    // Add initial load animation
    nav.classList.add('nav-initial-load');
    
    // Create progress bar
    createProgressBar();
    
    // Build sections map
    buildSectionsMap();
    
    // Bind events
    bindEvents();
    
    // Initial check
    handleScroll();
  }

  // Create reading progress bar
  function createProgressBar() {
    let progressBar = document.querySelector('.reading-progress');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'reading-progress';
      document.body.insertBefore(progressBar, document.body.firstChild);
    }
  }

  // Build map of sections for scroll spy
  function buildSectionsMap() {
    const sectionElements = document.querySelectorAll('[data-section], section[id]');
    sections = Array.from(sectionElements).map(el => {
      const id = el.id || el.dataset.section;
      const label = el.dataset.navLabel || id;
      return {
        element: el,
        id: id,
        label: label,
        offset: el.offsetTop - 100
      };
    });
  }

  // Bind scroll and touch events
  function bindEvents() {
    // Scroll handler with RAF
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Touch events for mobile
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      if (!touchStartY) return;
      
      const touchY = e.touches[0].clientY;
      const diff = touchStartY - touchY;
      
      // Show nav on scroll up (swipe down)
      if (diff < -config.touchThreshold && isNavHidden) {
        showNav();
      }
      // Hide nav on scroll down (swipe up)
      if (diff > config.touchThreshold && window.scrollY > config.scrollThreshold) {
        hideNav();
      }
      
      touchStartY = touchY;
    }, { passive: true });
    
    // Reset touch on end
    document.addEventListener('touchend', () => {
      touchStartY = 0;
    }, { passive: true });
    
    // Show nav when mouse approaches top
    document.addEventListener('mousemove', (e) => {
      if (e.clientY < 50 && isNavHidden) {
        showNav();
      }
    });
    
    // Rebuild sections on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(buildSectionsMap, 200);
    });
    
    // Handle page changes
    window.addEventListener('pagechange', () => {
      setTimeout(() => {
        buildSectionsMap();
        updateProgressBar();
      }, 100);
    });
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  // Main scroll handler
  function handleScroll() {
    const scrollY = window.scrollY;
    const scrollDelta = scrollY - lastScrollY;
    const scrollPercent = (scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    
    // Update progress bar
    updateProgressBar(scrollPercent);
    
    // Update section indicator
    updateSectionIndicator(scrollY);
    
    // Update nav classes
    updateNavState(scrollY);
    
    // Determine scroll direction and hide/show nav
    if (scrollY < config.scrollThreshold) {
      // Near top - always show
      showNav();
      nav.classList.add('at-top');
      nav.classList.remove('scrolled');
    } else {
      nav.classList.remove('at-top');
      nav.classList.add('scrolled');
      
      // Check scroll direction
      if (scrollDelta > 0 && scrollY > config.scrollThreshold) {
        // Scrolling down - hide nav after delay
        if (!hideTimeout) {
          hideTimeout = setTimeout(() => {
            hideNav();
            hideTimeout = null;
          }, config.hideDelay);
        }
      } else if (scrollDelta < 0) {
        // Scrolling up - show nav immediately
        clearTimeout(hideTimeout);
        hideTimeout = null;
        showNav();
      }
    }
    
    lastScrollY = scrollY;
  }

  // Update progress bar width
  function updateProgressBar(percent) {
    const progressBar = document.querySelector('.reading-progress');
    if (progressBar) {
      progressBar.style.width = Math.min(percent || 0, 100) + '%';
    }
  }

  // Update section indicator
  function updateSectionIndicator(scrollY) {
    // Find current section
    let foundSection = null;
    
    for (let i = sections.length - 1; i >= 0; i--) {
      if (scrollY >= sections[i].offset) {
        foundSection = sections[i];
        break;
      }
    }
    
    if (foundSection && foundSection.label !== currentSection) {
      currentSection = foundSection.label;
      
      // Update indicator text
      let indicator = nav.querySelector('.nav-section-indicator');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'nav-section-indicator';
        nav.appendChild(indicator);
      }
      indicator.textContent = currentSection;
      
      // Update active nav link
      updateActiveNavLink(foundSection.id);
    }
  }

  // Update active state on nav links
  function updateActiveNavLink(sectionId) {
    const links = nav.querySelectorAll('.nav-links a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${sectionId}` || href.includes(sectionId)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Update nav state classes
  function updateNavState(scrollY) {
    // Check if in hero section (immersive mode)
    const hero = document.querySelector('.hero');
    if (hero) {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      if (scrollY < heroBottom - 100) {
        nav.classList.add('immersive');
      } else {
        nav.classList.remove('immersive');
      }
    }
  }

  // Hide navigation
  function hideNav() {
    if (isNavHidden) return;
    
    // Don't hide if mobile menu is open
    const mobileMenu = nav.querySelector('.nav-links');
    if (mobileMenu && mobileMenu.classList.contains('active')) {
      return;
    }
    
    nav.classList.add('nav-hidden');
    nav.classList.remove('nav-visible');
    isNavHidden = true;
  }

  // Show navigation
  function showNav() {
    if (!isNavHidden) return;
    
    nav.classList.remove('nav-hidden');
    nav.classList.add('nav-visible');
    isNavHidden = false;
  }

  // Public API
  window.SmartNav = {
    show: showNav,
    hide: hideNav,
    refresh: buildSectionsMap,
    getCurrentSection: () => currentSection,
    sections: () => sections
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
