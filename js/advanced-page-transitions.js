/**
 * ADVANCED PAGE TRANSITION SYSTEM v46.0
 * Fortune 500 Quality Cinematic Transitions
 * Smooth, professional page transitions with multiple animation types
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    defaultTransition: 'circle',
    duration: 800,
    prefetchDelay: 100,
    enablePrefetch: true,
    enableProgress: true,
    cachePages: true
  };

  // State
  const state = {
    isTransitioning: false,
    cachedPages: new Map(),
    prefetchQueue: new Set(),
    currentTransition: null
  };

  // Transition Types
  const TRANSITIONS = {
    curtain: createCurtainTransition,
    wipe: createWipeTransition,
    circle: createCircleTransition,
    panels: createPanelsTransition,
    diagonal: createDiagonalTransition
  };

  /**
   * Initialize the page transition system
   */
  function init() {
    // Create transition container
    createTransitionContainer();
    
    // Setup link interception
    setupLinkInterception();
    
    // Setup prefetch on hover
    if (CONFIG.enablePrefetch) {
      setupPrefetch();
    }
    
    // Handle initial page load animation
    handleInitialLoad();
    
    // Setup content reveal animations
    setupContentReveals();
    
    console.log('[PageTransitions] Initialized with type:', CONFIG.defaultTransition);
  }

  /**
   * Create the transition container
   */
  function createTransitionContainer() {
    const container = document.createElement('div');
    container.className = 'page-transition-container';
    container.id = 'page-transition-container';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);
    
    // Create prefetch indicator
    const prefetchIndicator = document.createElement('div');
    prefetchIndicator.className = 'prefetch-indicator';
    prefetchIndicator.id = 'prefetch-indicator';
    prefetchIndicator.innerHTML = `
      <div class="prefetch-indicator-icon"></div>
      <span>Preparing...</span>
    `;
    document.body.appendChild(prefetchIndicator);
    
    return container;
  }

  /**
   * Setup link interception for SPA-like transitions
   */
  function setupLinkInterception() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      
      if (!link) return;
      
      // Skip if transition in progress
      if (state.isTransitioning) {
        e.preventDefault();
        return;
      }
      
      // Skip external links
      if (link.hostname !== window.location.hostname) return;
      
      // Skip anchor links (smooth scroll instead)
      if (link.hash && link.pathname === window.location.pathname) {
        e.preventDefault();
        smoothScrollTo(link.hash);
        return;
      }
      
      // Skip links with data-no-transition
      if (link.dataset.noTransition) return;
      
      // Skip download links
      if (link.download) return;
      
      // Handle transition
      e.preventDefault();
      navigateWithTransition(link.href, link.dataset.transition);
    });
  }

  /**
   * Navigate with transition effect
   */
  async function navigateWithTransition(url, transitionType = CONFIG.defaultTransition) {
    if (state.isTransitioning) return;
    state.isTransitioning = true;
    
    const container = document.getElementById('page-transition-container');
    const transition = TRANSITIONS[transitionType] || TRANSITIONS[CONFIG.defaultTransition];
    
    try {
      // Start transition animation
      const transitionEl = transition();
      container.appendChild(transitionEl);
      
      // Trigger entrance animation
      await wait(50);
      transitionEl.classList.add('active');
      
      // Fade out current page
      document.body.classList.add('page-exit');
      
      // Wait for animation
      await wait(CONFIG.duration * 0.6);
      
      // Fetch new page content
      const content = await fetchPageContent(url);
      
      // Prepare for page swap
      transitionEl.classList.add('exit');
      
      // Swap content
      await swapPageContent(content, url);
      
      // Animate in
      document.body.classList.remove('page-exit');
      document.body.classList.add('page-enter');
      
      // Clean up
      await wait(CONFIG.duration * 0.5);
      transitionEl.remove();
      document.body.classList.remove('page-enter');
      
      // Trigger content reveals
      triggerContentReveals();
      
    } catch (error) {
      console.error('[PageTransitions] Navigation failed:', error);
      // Fallback to normal navigation
      window.location.href = url;
    } finally {
      state.isTransitioning = false;
    }
  }

  /**
   * Create curtain transition
   */
  function createCurtainTransition() {
    const layer = document.createElement('div');
    layer.className = 'transition-layer transition-curtain';
    layer.innerHTML = `
      <div class="transition-content">
        <img src="assets/BuildBridge_Icon_Mark.svg" alt="" class="transition-logo">
        <div class="transition-text">Loading</div>
        <div class="transition-progress">
          <div class="transition-progress-bar"></div>
        </div>
      </div>
    `;
    return layer;
  }

  /**
   * Create wipe transition
   */
  function createWipeTransition() {
    const layer = document.createElement('div');
    layer.className = 'transition-layer transition-wipe';
    return layer;
  }

  /**
   * Create circle expand transition
   */
  function createCircleTransition() {
    const layer = document.createElement('div');
    layer.className = 'transition-layer transition-circle';
    layer.innerHTML = `
      <div class="transition-content">
        <img src="assets/BuildBridge_Icon_Mark.svg" alt="" class="transition-logo">
        <div class="transition-text">Loading</div>
      </div>
    `;
    return layer;
  }

  /**
   * Create panels transition
   */
  function createPanelsTransition() {
    const layer = document.createElement('div');
    layer.className = 'transition-layer transition-panels';
    layer.innerHTML = `
      <div class="transition-panel"></div>
      <div class="transition-panel"></div>
      <div class="transition-panel"></div>
      <div class="transition-panel"></div>
      <div class="transition-panel"></div>
    `;
    return layer;
  }

  /**
   * Create diagonal split transition
   */
  function createDiagonalTransition() {
    const layer = document.createElement('div');
    layer.className = 'transition-layer transition-diagonal';
    layer.innerHTML = `
      <div class="transition-diagonal-left"></div>
      <div class="transition-diagonal-right"></div>
    `;
    return layer;
  }

  /**
   * Fetch page content
   */
  async function fetchPageContent(url) {
    // Check cache first
    if (CONFIG.cachePages && state.cachedPages.has(url)) {
      return state.cachedPages.get(url);
    }
    
    try {
      const response = await fetch(url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const content = {
        title: doc.title,
        body: doc.body.innerHTML,
        head: doc.head.innerHTML
      };
      
      // Cache the page
      if (CONFIG.cachePages) {
        state.cachedPages.set(url, content);
      }
      
      return content;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Swap page content
   */
  async function swapPageContent(content, url) {
    // Update title
    document.title = content.title;
    
    // Update body content
    document.body.innerHTML = content.body;
    
    // Update URL without reload
    window.history.pushState({}, content.title, url);
    
    // Re-initialize scripts
    reinitializeScripts();
    
    // Scroll to top
    window.scrollTo(0, 0);
  }

  /**
   * Reinitialize scripts after page swap
   */
  function reinitializeScripts() {
    // Re-run any inline scripts
    const scripts = document.querySelectorAll('script:not([src])');
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      newScript.textContent = script.textContent;
      script.parentNode.replaceChild(newScript, script);
    });
    
    // Dispatch page change event
    window.dispatchEvent(new CustomEvent('page:change', {
      detail: { url: window.location.href }
    }));
  }

  /**
   * Setup prefetch on hover
   */
  function setupPrefetch() {
    let prefetchTimer;
    const prefetchIndicator = document.getElementById('prefetch-indicator');
    
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a');
      
      if (!link) return;
      if (link.hostname !== window.location.hostname) return;
      if (state.cachedPages.has(link.href)) return;
      if (state.prefetchQueue.has(link.href)) return;
      
      clearTimeout(prefetchTimer);
      
      prefetchTimer = setTimeout(() => {
        prefetchPage(link.href);
        
        // Show indicator
        if (prefetchIndicator) {
          prefetchIndicator.classList.add('visible');
        }
        
        setTimeout(() => {
          if (prefetchIndicator) {
            prefetchIndicator.classList.remove('visible');
          }
        }, 1500);
      }, CONFIG.prefetchDelay);
    });
    
    document.addEventListener('mouseout', () => {
      clearTimeout(prefetchTimer);
    });
  }

  /**
   * Prefetch a page
   */
  async function prefetchPage(url) {
    if (state.prefetchQueue.has(url)) return;
    state.prefetchQueue.add(url);
    
    try {
      const response = await fetch(url);
      if (!response.ok) return;
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      state.cachedPages.set(url, {
        title: doc.title,
        body: doc.body.innerHTML,
        head: doc.head.innerHTML
      });
      
      console.log('[PageTransitions] Prefetched:', url);
    } catch (error) {
      console.warn('[PageTransitions] Prefetch failed:', url);
    }
  }

  /**
   * Handle initial page load
   */
  function handleInitialLoad() {
    document.body.classList.add('page-enter');
    
    setTimeout(() => {
      document.body.classList.remove('page-enter');
    }, 600);
  }

  /**
   * Setup content reveal animations
   */
  function setupContentReveals() {
    const reveals = document.querySelectorAll('.content-reveal');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    reveals.forEach(el => observer.observe(el));
  }

  /**
   * Trigger content reveals after page transition
   */
  function triggerContentReveals() {
    const reveals = document.querySelectorAll('.content-reveal');
    reveals.forEach((el, index) => {
      el.classList.remove('revealed');
      el.style.animationDelay = `${index * 0.1}s`;
      setTimeout(() => el.classList.add('revealed'), 100);
    });
  }

  /**
   * Smooth scroll to anchor
   */
  function smoothScrollTo(hash) {
    const target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', hash);
    }
  }

  /**
   * Wait utility
   */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Trigger a page transition programmatically
   */
  function transitionTo(url, type) {
    return navigateWithTransition(url, type);
  }

  /**
   * Clear page cache
   */
  function clearCache() {
    state.cachedPages.clear();
    state.prefetchQueue.clear();
    console.log('[PageTransitions] Cache cleared');
  }

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    if (!state.isTransitioning) {
      window.location.reload();
    }
  });

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.PageTransitions = {
    navigate: transitionTo,
    clearCache: clearCache,
    setTransition: (type) => { CONFIG.defaultTransition = type; },
    isTransitioning: () => state.isTransitioning,
    getCachedPages: () => Array.from(state.cachedPages.keys())
  };

})();
