/**
 * Advanced View Transitions API Controller
 * BuildBridge v63.0 - Fortune 500 Page Transitions
 * 
 * Features:
 * - Native View Transitions API support with fallbacks
 * - Smart prefetching on link hover
 * - Directional transitions based on navigation
 * - Reduced motion support
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    enablePrefetch: true,
    prefetchDelay: 100,
    transitionDuration: 500,
    fallbackDuration: 400,
    enableDirectionalTransitions: true,
    reducedMotionQuery: '(prefers-reduced-motion: reduce)'
  };

  // State
  let isTransitioning = false;
  let currentPage = window.location.pathname;
  let prefetchTimeout = null;
  let prefetchedUrls = new Set();
  
  // Check for View Transitions API support
  const supportsViewTransitions = 'startViewTransition' in document;
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia(config.reducedMotionQuery).matches;

  // Initialize
  function init() {
    if (prefersReducedMotion) {
      console.log('[ViewTransitions] Reduced motion preferred - minimal transitions');
      return;
    }

    setupLinkTransitions();
    setupPrefetching();
    setupBackButtonHandling();
    
    // Add transition overlay if not exists
    if (!document.querySelector('.page-transition-overlay')) {
      createTransitionOverlay();
    }
    
    console.log('[ViewTransitions] Initialized', supportsViewTransitions ? '(Native API)' : '(Fallback)');
  }

  // Create transition overlay
  function createTransitionOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.innerHTML = `
      <div class="page-transition-loader">
        <img src="assets/BuildBridge_Icon_Mark.svg" alt="" class="transition-logo" aria-hidden="true">
        <div class="transition-progress">
          <div class="transition-progress-bar"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  // Setup click handlers for internal links
  function setupLinkTransitions() {
    document.addEventListener('click', handleLinkClick, true);
  }

  // Handle link clicks
  async function handleLinkClick(e) {
    const link = e.target.closest('a');
    
    if (!link) return;
    
    // Skip external links, anchors, modifiers
    if (
      link.hostname !== window.location.hostname ||
      link.href.includes('#') && link.pathname === window.location.pathname ||
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      e.ctrlKey || e.metaKey || e.shiftKey ||
      isTransitioning
    ) {
      return;
    }

    e.preventDefault();
    
    const url = link.href;
    const direction = getTransitionDirection(link);
    
    await navigateTo(url, direction);
  }

  // Determine transition direction based on nav structure
  function getTransitionDirection(link) {
    if (!config.enableDirectionalTransitions) return 'fade';
    
    const navOrder = ['index.html', 'about.html', 'services.html', 'projects.html', 'contact.html'];
    const currentIndex = navOrder.findIndex(p => currentPage.includes(p) || (p === 'index.html' && currentPage.endsWith('/')));
    const targetIndex = navOrder.findIndex(p => link.pathname.includes(p) || (p === 'index.html' && link.pathname.endsWith('/')));
    
    if (currentIndex === -1 || targetIndex === -1) return 'fade';
    
    return targetIndex > currentIndex ? 'left' : 'right';
  }

  // Navigate to new page with transition
  async function navigateTo(url, direction = 'fade') {
    if (isTransitioning) return;
    isTransitioning = true;
    
    document.documentElement.classList.add('is-transitioning');
    
    if (supportsViewTransitions && !prefersReducedMotion) {
      await performNativeTransition(url, direction);
    } else {
      await performFallbackTransition(url, direction);
    }
  }

  // Native View Transitions API navigation
  async function performNativeTransition(url, direction) {
    const transitionClass = `slide-transition-${direction}`;
    document.documentElement.classList.add(transitionClass);
    
    try {
      const transition = document.startViewTransition(async () => {
        // Fetch new page content
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        
        // Update content
        const newMain = newDoc.querySelector('main') || newDoc.body;
        const currentMain = document.querySelector('main') || document.body;
        
        // Preserve scroll position during transition
        const scrollPos = window.scrollY;
        
        // Update document title
        document.title = newDoc.title;
        
        // Update body classes
        document.body.className = newDoc.body.className;
        
        // Update main content
        if (newMain && currentMain) {
          currentMain.innerHTML = newMain.innerHTML;
        }
        
        // Update URL
        history.pushState({}, '', url);
        currentPage = url;
        
        // Re-initialize features
        reinitializeFeatures();
        
        // Scroll to top
        window.scrollTo(0, 0);
      });
      
      await transition.finished;
      
    } catch (error) {
      console.error('[ViewTransitions] Transition failed:', error);
      window.location.href = url;
      return;
    }
    
    document.documentElement.classList.remove(transitionClass);
    document.documentElement.classList.remove('is-transitioning');
    document.documentElement.classList.add('transition-complete');
    isTransitioning = false;
    
    setTimeout(() => {
      document.documentElement.classList.remove('transition-complete');
    }, 100);
  }

  // Fallback transition for browsers without View Transitions API
  async function performFallbackTransition(url, direction) {
    const overlay = document.querySelector('.page-transition-overlay');
    
    // Show overlay
    overlay.classList.add('active');
    
    // Wait for exit animation
    await sleep(config.fallbackDuration / 2);
    
    try {
      // Fetch and update content
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');
      
      // Update page content
      document.title = newDoc.title;
      document.body.className = newDoc.body.className;
      
      const newMain = newDoc.querySelector('main') || newDoc.body;
      const currentMain = document.querySelector('main') || document.body;
      
      if (newMain && currentMain) {
        currentMain.innerHTML = newMain.innerHTML;
      }
      
      history.pushState({}, '', url);
      currentPage = url;
      window.scrollTo(0, 0);
      
      reinitializeFeatures();
      
    } catch (error) {
      console.error('[ViewTransitions] Fallback transition failed:', error);
      window.location.href = url;
      return;
    }
    
    // Hide overlay
    await sleep(config.fallbackDuration / 2);
    overlay.classList.remove('active');
    overlay.classList.remove('exiting');
    
    document.documentElement.classList.remove('is-transitioning');
    isTransitioning = false;
  }

  // Setup smart prefetching
  function setupPrefetching() {
    if (!config.enablePrefetch) return;
    
    document.addEventListener('mouseover', handlePrefetchHover, { passive: true });
    document.addEventListener('touchstart', handlePrefetchHover, { passive: true });
  }

  // Handle prefetch on hover
  function handlePrefetchHover(e) {
    const link = e.target.closest('a');
    
    if (!link) return;
    
    // Skip external, anchors, already prefetched
    if (
      link.hostname !== window.location.hostname ||
      link.href.includes('#') && link.pathname === window.location.pathname ||
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      prefetchedUrls.has(link.href)
    ) {
      return;
    }
    
    clearTimeout(prefetchTimeout);
    
    prefetchTimeout = setTimeout(() => {
      prefetchPage(link.href);
    }, config.prefetchDelay);
  }

  // Prefetch a page
  async function prefetchPage(url) {
    if (prefetchedUrls.has(url)) return;
    
    try {
      document.documentElement.classList.add('transition-prefetching');
      
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
      
      prefetchedUrls.add(url);
      
      setTimeout(() => {
        document.documentElement.classList.remove('transition-prefetching');
      }, 500);
      
      console.log('[ViewTransitions] Prefetched:', url);
    } catch (error) {
      console.warn('[ViewTransitions] Prefetch failed:', error);
    }
  }

  // Setup back button handling
  function setupBackButtonHandling() {
    window.addEventListener('popstate', () => {
      // Handle browser back/forward
      if (!isTransitioning) {
        const direction = 'right'; // Back is always right
        navigateTo(window.location.href, direction);
      }
    });
  }

  // Reinitialize features after page transition
  function reinitializeFeatures() {
    // Dispatch event for other scripts to handle
    window.dispatchEvent(new CustomEvent('page-transition-complete', {
      detail: { url: currentPage }
    }));
    
    // Initialize core features
    if (window.BuildBridgeFeatures) {
      window.BuildBridgeFeatures.initAll();
    }
    
    // Scroll reveal animations
    if (window.ScrollReveal) {
      window.ScrollReveal.sync();
    }
    
    // Lazy loading
    if (window.lazySizes) {
      window.lazySizes.init();
    }
    
    // Refresh any WebGL canvases
    document.querySelectorAll('canvas').forEach(canvas => {
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
    });
  }

  // Utility: Sleep promise
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API
  window.ViewTransitions = {
    init,
    navigateTo,
    prefetchPage,
    get supportsViewTransitions() { return supportsViewTransitions; },
    get isTransitioning() { return isTransitioning; }
  };

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
