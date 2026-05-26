/**
 * Smooth Page Transitions
 * App-like navigation with animated transitions
 */

(function() {
  'use strict';

  let isTransitioning = false;
  let transitionOverlay = null;
  let prefetchCache = new Map();

  // Initialize
  function init() {
    createTransitionOverlay();
    wrapContent();
    bindLinks();
    bindHistory();
    prefetchVisibleLinks();
    
    // Add enter animation class on load
    document.body.classList.add('page-loaded');
    const wrapper = document.querySelector('.main-content-wrapper');
    if (wrapper) {
      wrapper.classList.add('page-entered');
    }
  }

  // Create transition overlay
  function createTransitionOverlay() {
    transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'page-transition-overlay';
    transitionOverlay.innerHTML = `
      <div class="page-transition-panel">
        <div class="page-transition-brand">
          <img src="assets/BuildBridge_Icon_Mark.svg" alt="">
          <span>BuildBridge</span>
        </div>
        <div class="page-transition-progress">
          <div class="page-transition-progress-bar"></div>
        </div>
      </div>
    `;
    document.body.appendChild(transitionOverlay);
  }

  // Wrap main content for animation
  function wrapContent() {
    const body = document.body;
    const children = Array.from(body.children);
    
    // Find elements that aren't scripts, styles, or the overlay
    const contentElements = children.filter(el => 
      !el.matches('script, style, link, meta, .page-transition-overlay, noscript')
    );
    
    if (contentElements.length === 0) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'main-content-wrapper';
    
    contentElements.forEach(el => {
      wrapper.appendChild(el);
    });
    
    body.insertBefore(wrapper, transitionOverlay);
  }

  // Bind internal navigation links
  function bindLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      // Skip external links
      if (link.hostname !== location.hostname || link.target === '_blank') {
        return;
      }

      // Skip anchors on same page
      if (link.pathname === location.pathname && link.hash) {
        handleAnchorScroll(link.hash);
        e.preventDefault();
        return;
      }

      // Skip mailto/tel
      if (link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
        return;
      }

      e.preventDefault();
      navigateTo(link.href);
    });

    // Hover preview
    let previewTimeout;
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a');
      if (!link || !shouldShowPreview(link)) return;

      clearTimeout(previewTimeout);
      previewTimeout = setTimeout(() => {
        showLinkPreview(link);
      }, 300);
    });

    document.addEventListener('mouseout', (e) => {
      const link = e.target.closest('a');
      if (link) {
        clearTimeout(previewTimeout);
        hideLinkPreview();
      }
    });
  }

  function shouldShowPreview(link) {
    return link.hostname === location.hostname && 
           !link.hash && 
           link.pathname !== location.pathname &&
           !link.target;
  }

  let previewEl = null;
  function showLinkPreview(link) {
    if (!previewEl) {
      previewEl = document.createElement('div');
      previewEl.className = 'link-preview';
      document.body.appendChild(previewEl);
    }

    const pageName = getPageName(link.pathname);
    previewEl.innerHTML = `
      <div class="link-preview-icon">→</div>
      <span>Navigate to ${pageName}</span>
    `;
    
    requestAnimationFrame(() => {
      previewEl.classList.add('visible');
    });
  }

  function hideLinkPreview() {
    if (previewEl) {
      previewEl.classList.remove('visible');
    }
  }

  function getPageName(pathname) {
    const map = {
      '/': 'Home',
      '/index.html': 'Home',
      '/about.html': 'About',
      '/services.html': 'Services',
      '/projects.html': 'Projects',
      '/contact.html': 'Contact'
    };
    return map[pathname] || pathname.replace(/^\//, '').replace('.html', '');
  }

  // Navigate with transition
  function navigateTo(url) {
    if (isTransitioning) return;
    isTransitioning = true;

    const panel = transitionOverlay.querySelector('.page-transition-panel');
    const wrapper = document.querySelector('.main-content-wrapper');

    // Start exit animation
    panel.classList.add('entering');
    wrapper.classList.add('page-exit');

    // Preload the page
    prefetchPage(url).then(() => {
      // Small delay for animation
      setTimeout(() => {
        // Update history and load page
        history.pushState({ url }, '', url);
        loadPage(url);
      }, 400);
    });
  }

  // Load page content
  async function loadPage(url) {
    try {
      const response = await fetch(url, {
        headers: { 'X-Requested-With': 'PageTransition' }
      });
      const html = await response.text();
      
      // Parse new content
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');
      
      // Update document
      updateDocument(newDoc, url);
      
      // Complete transition
      completeTransition();
      
    } catch (error) {
      console.error('Page transition failed:', error);
      window.location.href = url; // Fallback
    }
  }

  // Update document with new content
  function updateDocument(newDoc, url) {
    // Update title
    document.title = newDoc.title;
    
    // Update meta tags
    const metaSelectors = ['meta[name="description"]', 'meta[property^="og:"]', 'meta[name="twitter:"]'];
    metaSelectors.forEach(selector => {
      const newMeta = newDoc.querySelector(selector);
      const currentMeta = document.querySelector(selector);
      if (newMeta && currentMeta) {
        currentMeta.content = newMeta.content;
      }
    });

    // Get new content wrapper
    const newWrapper = newDoc.querySelector('.main-content-wrapper');
    const currentWrapper = document.querySelector('.main-content-wrapper');
    
    if (newWrapper && currentWrapper) {
      // Preserve scripts by re-executing them
      const scripts = newWrapper.querySelectorAll('script[src]');
      scripts.forEach(script => {
        // Re-execute external scripts
        const newScript = document.createElement('script');
        newScript.src = script.src;
        document.head.appendChild(newScript);
      });

      // Update content
      currentWrapper.innerHTML = newWrapper.innerHTML;
    }

    // Scroll to top or hash
    const hash = new URL(url, location.origin).hash;
    if (hash) {
      handleAnchorScroll(hash);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Re-bind events on new content
    bindLinks();
    
    // Dispatch page change event
    window.dispatchEvent(new CustomEvent('pagechange', { detail: { url } }));
  }

  // Complete transition animation
  function completeTransition() {
    const panel = transitionOverlay.querySelector('.page-transition-panel');
    const wrapper = document.querySelector('.main-content-wrapper');

    // Reset and animate in
    wrapper.classList.remove('page-exit');
    wrapper.classList.add('page-enter');
    
    panel.classList.remove('entering');
    panel.classList.add('exiting');

    // Clean up
    setTimeout(() => {
      panel.classList.remove('exiting');
      wrapper.classList.remove('page-enter');
      wrapper.classList.add('page-entered');
      isTransitioning = false;
      
      // Re-trigger any scroll animations
      retriggerScrollAnimations();
    }, 600);
  }

  // Handle anchor scroll
  function handleAnchorScroll(hash) {
    const target = document.querySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      
      // Update URL without triggering transition
      history.replaceState(null, '', hash);
    }
  }

  // History handling
  function bindHistory() {
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.url) {
        navigateTo(e.state.url);
      }
    });
  }

  // Prefetch visible links
  function prefetchVisibleLinks() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target;
          prefetchPage(link.href);
          observer.unobserve(link);
        }
      });
    }, { rootMargin: '100px' });

    document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]').forEach(link => {
      if (link.hostname === location.hostname) {
        observer.observe(link);
      }
    });
  }

  // Prefetch a page
  async function prefetchPage(url) {
    if (prefetchCache.has(url)) {
      return prefetchCache.get(url);
    }

    try {
      const promise = fetch(url).then(r => r.text());
      prefetchCache.set(url, promise);
      return promise;
    } catch (e) {
      return null;
    }
  }

  // Retrigger scroll animations
  function retriggerScrollAnimations() {
    // Reset scroll-triggered animations
    document.querySelectorAll('[data-reveal], .fade-in-up, .reveal-section').forEach(el => {
      el.classList.remove('revealed', 'in-view');
    });

    // Trigger scroll event to re-check
    window.dispatchEvent(new Event('scroll'));
    
    // Re-initialize any libraries
    if (window.scrollReveal) {
      window.scrollReveal.sync();
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
