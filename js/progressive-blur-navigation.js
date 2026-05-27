/**
 * PROGRESSIVE BLUR & GLASSMORPHISM NAVIGATION v35.0
 * Fortune 500 Dynamic Navigation System
 */

(function() {
  'use strict';

  // Navigation State
  let state = {
    scrollY: 0,
    scrollLevel: 0,
    lastScrollY: 0,
    scrollDirection: 'none',
    sections: [],
    currentSection: 0,
    ticking: false,
    isHidden: false
  };

  // Configuration
  const config = {
    scrollThresholds: [50, 150, 300], // Pixels to trigger each blur level
    hideThreshold: 100, // Pixels of scroll down before hiding
    showThreshold: 50, // Pixels of scroll up before showing
    sectionOffset: 100 // Offset for section detection
  };

  // Initialize Navigation
  function init() {
    if (!document.querySelector('.nav-glassmorphism')) {
      transformExistingNav();
    }
    
    setupEventListeners();
    detectSections();
    updateNavigation();
    
    console.log('✅ Progressive Blur Navigation initialized');
  }

  // Transform existing nav to new system
  function transformExistingNav() {
    const existingNav = document.querySelector('.nav, header, nav');
    if (!existingNav) return;
    
    const brand = existingNav.querySelector('.brand, .logo');
    const links = existingNav.querySelectorAll('.nav-links a, .menu a');
    const cta = existingNav.querySelector('.quote-btn, .cta-btn');
    
    const newNav = document.createElement('nav');
    newNav.className = 'nav-glassmorphism';
    newNav.setAttribute('data-scroll', '0');
    newNav.innerHTML = `
      <div class="nav-blur-layer nav-blur-layer-1"></div>
      <div class="nav-blur-layer nav-blur-layer-2"></div>
      <div class="nav-blur-layer nav-blur-layer-3"></div>
      <div class="nav-progress"></div>
      <div class="nav-section-indicator"></div>
      <div class="nav-container">
        ${brand ? brand.outerHTML : '<a href="index.html" class="nav-brand"><span>BuildBridge</span></a>'}
        <ul class="nav-menu">
          ${Array.from(links).map(link => `<a href="${link.href}" class="nav-link ${link.classList.contains('active') ? 'active' : ''}">${link.textContent}</a>`).join('')}
        </ul>
        ${cta ? cta.outerHTML.replace(/class="[^"]*"/, 'class="nav-cta"') : '<a href="contact.html" class="nav-cta">Get Quote</a>'}
        <button class="nav-mobile-toggle" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    `;
    
    existingNav.parentNode.replaceChild(newNav, existingNav);
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Scroll handler with RAF
    window.addEventListener('scroll', () => {
      state.scrollY = window.scrollY;
      state.scrollDirection = state.scrollY > state.lastScrollY ? 'down' : 'up';
      
      if (!state.ticking) {
        requestAnimationFrame(() => {
          updateNavigation();
          state.ticking = false;
        });
        state.ticking = true;
      }
    }, { passive: true });
    
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.nav-mobile-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Link click smooth scroll
    document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
      link.addEventListener('click', handleSmoothScroll);
    });
    
    // Resize handler
    window.addEventListener('resize', () => {
      detectSections();
      updateSectionIndicator();
    }, { passive: true });
  }

  // Main Update Function
  function updateNavigation() {
    calculateScrollLevel();
    updateBlurLayers();
    updateProgressBar();
    updateCurrentSection();
    handleNavVisibility();
    state.lastScrollY = state.scrollY;
  }

  // Calculate Scroll Level (0-3)
  function calculateScrollLevel() {
    let level = 0;
    for (let i = 0; i < config.scrollThresholds.length; i++) {
      if (state.scrollY >= config.scrollThresholds[i]) {
        level = i + 1;
      }
    }
    state.scrollLevel = level;
  }

  // Update Blur Layers
  function updateBlurLayers() {
    const nav = document.querySelector('.nav-glassmorphism');
    if (!nav) return;
    
    nav.setAttribute('data-scroll', state.scrollLevel);
    
    // Add CSS custom properties for fine-tuned control
    nav.style.setProperty('--scroll-percent', Math.min(1, state.scrollY / 500));
    nav.style.setProperty('--nav-opacity', Math.min(1, 0.7 + (state.scrollY / 1000)));
  }

  // Update Progress Bar
  function updateProgressBar() {
    const progress = document.querySelector('.nav-progress');
    if (!progress) return;
    
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (state.scrollY / docHeight) * 100;
    progress.style.width = `${scrollPercent}%`;
  }

  // Detect Page Sections
  function detectSections() {
    state.sections = [];
    const indicators = document.querySelector('.nav-section-indicator');
    
    // Look for sections with data-section attribute
    document.querySelectorAll('[data-section], section[id]').forEach((section, index) => {
      const id = section.id || section.dataset.section;
      const rect = section.getBoundingClientRect();
      
      state.sections.push({
        id: id,
        element: section,
        offsetTop: section.offsetTop
      });
    });
    
    // Update section indicators
    if (indicators && state.sections.length > 0) {
      indicators.innerHTML = state.sections.map((_, i) => 
        `<div class="section-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`
      ).join('');
    }
  }

  // Update Current Section
  function updateCurrentSection() {
    const scrollPos = state.scrollY + config.sectionOffset;
    let activeIndex = 0;
    
    for (let i = 0; i < state.sections.length; i++) {
      if (scrollPos >= state.sections[i].offsetTop) {
        activeIndex = i;
      }
    }
    
    if (activeIndex !== state.currentSection) {
      state.currentSection = activeIndex;
      updateSectionIndicator();
      highlightNavLinks();
    }
  }

  // Update Section Visual Indicator
  function updateSectionIndicator() {
    const dots = document.querySelectorAll('.section-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index <= state.currentSection);
    });
  }

  // Highlight Navigation Links
  function highlightNavLinks() {
    const currentSection = state.sections[state.currentSection];
    if (!currentSection) return;
    
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      const isMatch = href === `#${currentSection.id}` || 
                      href.includes(currentSection.id) ||
                      (currentSection.id === 'hero' && href === 'index.html');
      
      link.classList.toggle('active', isMatch);
    });
  }

  // Handle Nav Visibility (hide on scroll down, show on scroll up)
  function handleNavVisibility() {
    const nav = document.querySelector('.nav-glassmorphism');
    if (!nav) return;
    
    const scrollDelta = state.scrollY - state.lastScrollY;
    
    if (state.scrollDirection === 'down' && state.scrollY > config.hideThreshold) {
      if (!state.isHidden && scrollDelta > 5) {
        nav.classList.add('hide-on-scroll');
        state.isHidden = true;
      }
    } else if (state.scrollDirection === 'up') {
      if (state.isHidden && Math.abs(scrollDelta) > 3) {
        nav.classList.remove('hide-on-scroll');
        state.isHidden = false;
      }
    }
    
    // Always show at top
    if (state.scrollY < 50) {
      nav.classList.remove('hide-on-scroll');
      state.isHidden = false;
    }
  }

  // Toggle Mobile Menu
  function toggleMobileMenu() {
    const toggle = document.querySelector('.nav-mobile-toggle');
    const menu = document.querySelector('.nav-menu');
    
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
  }

  // Handle Smooth Scroll
  function handleSmoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const target = document.querySelector(targetId);
    
    if (target) {
      const offset = 100; // Account for fixed nav
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      
      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
      
      // Close mobile menu if open
      const menu = document.querySelector('.nav-menu');
      if (menu && menu.classList.contains('active')) {
        toggleMobileMenu();
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.ProgressiveNav = {
    refresh: detectSections,
    getState: () => state,
    toggleMobileMenu
  };

})();
