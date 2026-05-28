/**
 * SMOOTH SCROLL NAVIGATION - BuildBridge
 * v36.0 Fortune 500 Scrolling Experience
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    scrollOffset: 80,          // Offset for fixed header
    scrollDuration: 800,       // Duration for smooth scroll (ms)
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Easing function
    snapThreshold: 0.1,        // Threshold for scroll snap
    revealThreshold: 0.15,     // Threshold for reveal animations
    parallaxElements: true,    // Enable parallax effects
    velocityTracking: true     // Track scroll velocity
  };

  // State
  let state = {
    currentSection: 0,
    isScrolling: false,
    scrollVelocity: 0,
    lastScrollTop: 0,
    ticking: false,
    sections: [],
    navDots: []
  };

  // DOM Elements
  let elements = {};

  /**
   * Initialize smooth scroll navigation
   */
  function init() {
    // Cache elements
    cacheElements();
    
    // Build section map
    buildSectionMap();
    
    // Create section navigation dots
    createSectionNav();
    
    // Create scroll indicator
    createScrollIndicator();
    
    // Bind events
    bindEvents();
    
    // Initialize scroll reveal
    initScrollReveal();
    
    // Initialize parallax
    if (CONFIG.parallaxElements) {
      initParallax();
    }
    
    // Initial check
    handleScroll();
  }

  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements = {
      nav: document.querySelector('.nav'),
      navLinks: document.querySelectorAll('.nav-links a'),
      sections: document.querySelectorAll('section[data-section]'),
      backToTop: document.querySelector('.back-to-top')
    };
  }

  /**
   * Build section map for navigation
   */
  function buildSectionMap() {
    state.sections = Array.from(elements.sections).map((section, index) => ({
      element: section,
      id: section.id || `section-${index}`,
      label: section.dataset.navLabel || section.dataset.section || `Section ${index + 1}`,
      offsetTop: 0,
      height: 0
    }));
    
    updateSectionPositions();
  }

  /**
   * Update section positions (call on resize)
   */
  function updateSectionPositions() {
    state.sections.forEach(section => {
      const rect = section.element.getBoundingClientRect();
      section.offsetTop = window.pageYOffset + rect.top;
      section.height = rect.height;
    });
  }

  /**
   * Create section navigation dots
   */
  function createSectionNav() {
    const nav = document.createElement('div');
    nav.className = 'section-nav';
    nav.id = 'section-nav';
    
    // Progress line
    const progress = document.createElement('div');
    progress.className = 'section-nav-progress';
    progress.innerHTML = '<div class="section-nav-progress-fill"></div>';
    nav.appendChild(progress);
    
    // Navigation dots
    state.sections.forEach((section, index) => {
      const dot = document.createElement('button');
      dot.className = 'section-nav-dot';
      dot.setAttribute('data-index', index);
      dot.setAttribute('data-label', section.label);
      dot.setAttribute('aria-label', `Go to ${section.label}`);
      
      if (index === 0) dot.classList.add('active');
      
      dot.addEventListener('click', () => scrollToSection(index));
      
      nav.appendChild(dot);
      state.navDots.push(dot);
    });
    
    document.body.appendChild(nav);
    
    // Store reference
    elements.sectionNav = nav;
    elements.sectionNavProgress = nav.querySelector('.section-nav-progress-fill');
  }

  /**
   * Create scroll progress indicator
   */
  function createScrollIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-progress-indicator';
    indicator.id = 'scroll-progress-indicator';
    indicator.innerHTML = `
      <span class="scroll-progress-text" id="scroll-section-name">Home</span>
      <div class="scroll-progress-bar">
        <div class="scroll-progress-fill" id="scroll-progress-fill"></div>
      </div>
      <span class="scroll-progress-text" id="scroll-percent">0%</span>
    `;
    
    document.body.appendChild(indicator);
    
    elements.scrollIndicator = indicator;
    elements.scrollSectionName = indicator.querySelector('#scroll-section-name');
    elements.scrollProgressFill = indicator.querySelector('#scroll-progress-fill');
    elements.scrollPercent = indicator.querySelector('#scroll-percent');
  }

  /**
   * Bind scroll and resize events
   */
  function bindEvents() {
    // Scroll event with RAF throttling
    window.addEventListener('scroll', () => {
      if (!state.ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          state.ticking = false;
        });
        state.ticking = true;
      }
    }, { passive: true });
    
    // Resize event
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateSectionPositions, 100);
    }, { passive: true });
    
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', handleAnchorClick);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNav);
  }

  /**
   * Handle scroll events
   */
  function handleScroll() {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    
    // Calculate scroll velocity
    state.scrollVelocity = scrollTop - state.lastScrollTop;
    state.lastScrollTop = scrollTop;
    
    // Find current section
    const currentSectionIndex = findCurrentSection(scrollTop);
    
    if (currentSectionIndex !== state.currentSection) {
      state.currentSection = currentSectionIndex;
      updateActiveStates(currentSectionIndex);
    }
    
    // Update scroll progress
    updateScrollProgress(scrollTop, docHeight, windowHeight);
    
    // Show/hide back to top
    updateBackToTop(scrollTop);
    
    // Update navbar state
    updateNavbarState(scrollTop);
    
    // Update section nav visibility
    updateSectionNavVisibility(scrollTop);
    
    // Update reveal animations
    updateRevealAnimations();
    
    // Update parallax
    if (CONFIG.parallaxElements) {
      updateParallax();
    }
  }

  /**
   * Find current section based on scroll position
   */
  function findCurrentSection(scrollTop) {
    const viewportCenter = scrollTop + window.innerHeight / 3;
    
    for (let i = state.sections.length - 1; i >= 0; i--) {
      if (state.sections[i].offsetTop <= viewportCenter) {
        return i;
      }
    }
    
    return 0;
  }

  /**
   * Update active states for navigation
   */
  function updateActiveStates(index) {
    // Update nav dots
    state.navDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    
    // Update nav links
    elements.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      const sectionId = state.sections[index]?.element.id;
      link.classList.toggle('active', href === `#${sectionId}` || href === window.location.pathname + `#${sectionId}`);
    });
    
    // Update section name in indicator
    if (elements.scrollSectionName) {
      elements.scrollSectionName.textContent = state.sections[index]?.label || '';
    }
    
    // Update section nav progress
    if (elements.sectionNavProgress) {
      const progress = ((index + 1) / state.sections.length) * 100;
      elements.sectionNavProgress.style.height = `${progress}%`;
    }
  }

  /**
   * Update scroll progress indicator
   */
  function updateScrollProgress(scrollTop, docHeight, windowHeight) {
    const scrollable = docHeight - windowHeight;
    const progress = Math.min(100, Math.max(0, (scrollTop / scrollable) * 100));
    
    if (elements.scrollProgressFill) {
      elements.scrollProgressFill.style.width = `${progress}%`;
    }
    
    if (elements.scrollPercent) {
      elements.scrollPercent.textContent = `${Math.round(progress)}%`;
    }
  }

  /**
   * Update back to top button visibility
   */
  function updateBackToTop(scrollTop) {
    if (elements.backToTop) {
      elements.backToTop.classList.toggle('visible', scrollTop > 500);
    }
  }

  /**
   * Update navbar state based on scroll
   */
  function updateNavbarState(scrollTop) {
    if (elements.nav) {
      // Add scrolled class
      elements.nav.classList.toggle('nav-scrolled', scrollTop > 100);
      
      // Hide on scroll down, show on scroll up
      if (scrollTop > 200) {
        if (state.scrollVelocity > 5) {
          elements.nav.classList.add('nav-hidden');
          elements.nav.classList.remove('nav-visible');
        } else if (state.scrollVelocity < -5) {
          elements.nav.classList.remove('nav-hidden');
          elements.nav.classList.add('nav-visible');
        }
      } else {
        elements.nav.classList.remove('nav-hidden');
        elements.nav.classList.add('nav-visible');
      }
    }
  }

  /**
   * Update section nav visibility
   */
  function updateSectionNavVisibility(scrollTop) {
    if (elements.sectionNav) {
      const show = scrollTop > window.innerHeight * 0.5;
      elements.sectionNav.style.opacity = show ? '1' : '0';
      elements.sectionNav.style.visibility = show ? 'visible' : 'hidden';
    }
    
    if (elements.scrollIndicator) {
      elements.scrollIndicator.classList.toggle('visible', scrollTop > window.innerHeight * 0.3);
    }
  }

  /**
   * Handle anchor link clicks
   */
  function handleAnchorClick(e) {
    const href = this.getAttribute('href');
    if (!href.startsWith('#')) return;
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      
      const sectionIndex = state.sections.findIndex(s => s.element === target);
      if (sectionIndex !== -1) {
        scrollToSection(sectionIndex);
      } else {
        smoothScrollTo(target);
      }
    }
  }

  /**
   * Scroll to specific section
   */
  function scrollToSection(index) {
    if (index < 0 || index >= state.sections.length) return;
    
    const section = state.sections[index];
    const targetPosition = section.offsetTop - CONFIG.scrollOffset;
    
    smoothScrollTo(targetPosition);
  }

  /**
   * Smooth scroll to position or element
   */
  function smoothScrollTo(target) {
    let targetPosition;
    
    if (typeof target === 'number') {
      targetPosition = target;
    } else if (target instanceof Element) {
      targetPosition = target.getBoundingClientRect().top + window.pageYOffset - CONFIG.scrollOffset;
    } else {
      return;
    }
    
    state.isScrolling = true;
    
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / CONFIG.scrollDuration, 1);
      
      // Easing function (ease-out)
      const ease = 1 - Math.pow(1 - progress, 3);
      
      window.scrollTo(0, startPosition + distance * ease);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        state.isScrolling = false;
      }
    }
    
    requestAnimationFrame(animate);
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeyboardNav(e) {
    // Arrow key navigation
    if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      scrollToSection(Math.min(state.currentSection + 1, state.sections.length - 1));
    } else if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      scrollToSection(Math.max(state.currentSection - 1, 0));
    }
    
    // Home/End keys
    if (e.key === 'Home' && e.ctrlKey) {
      e.preventDefault();
      scrollToSection(0);
    } else if (e.key === 'End' && e.ctrlKey) {
      e.preventDefault();
      scrollToSection(state.sections.length - 1);
    }
  }

  /**
   * Initialize scroll reveal animations
   */
  function initScrollReveal() {
    // Add scroll-reveal class to elements
    const revealSelectors = [
      '.section-header',
      '.service-card',
      '.project-card',
      '.stat-item',
      '.team-card',
      '.faq-item',
      '.testimonial-carousel-card'
    ];
    
    revealSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.classList.contains('scroll-reveal')) {
          el.classList.add('scroll-reveal');
        }
      });
    });
  }

  /**
   * Update reveal animations based on scroll position
   */
  function updateRevealAnimations() {
    const revealElements = document.querySelectorAll('.scroll-reveal:not(.revealed)');
    const windowHeight = window.innerHeight;
    const triggerPoint = windowHeight * (1 - CONFIG.revealThreshold);
    
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < triggerPoint) {
        el.classList.add('revealed');
      }
    });
    
    // Check reveal groups
    document.querySelectorAll('.scroll-reveal-group:not(.revealed)').forEach(group => {
      const rect = group.getBoundingClientRect();
      if (rect.top < triggerPoint) {
        group.classList.add('revealed');
      }
    });
  }

  /**
   * Initialize parallax effects
   */
  function initParallax() {
    document.querySelectorAll('[data-parallax]').forEach(el => {
      el.classList.add('parallax-layer');
      
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      el.style.setProperty('--parallax-speed', speed);
    });
  }

  /**
   * Update parallax element positions
   */
  function updateParallax() {
    const scrollTop = window.pageYOffset;
    
    document.querySelectorAll('.parallax-layer').forEach(el => {
      const speed = parseFloat(el.style.getPropertyValue('--parallax-speed')) || 0.5;
      const yPos = -(scrollTop * speed);
      el.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  }

  /**
   * Public API
   */
  window.SmoothScrollNav = {
    init,
    scrollToSection,
    smoothScrollTo,
    getCurrentSection: () => state.currentSection,
    getSections: () => state.sections,
    refresh: updateSectionPositions
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
