/**
 * BuildBridge v27.0 - Advanced Page Transition System
 * Fortune 500 Quality Navigation Experience
 */

class AdvancedPageTransitions {
  constructor(options = {}) {
    this.options = {
      duration: 600,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      effect: 'curtain', // curtain, radial, split
      ...options
    };
    
    this.isTransitioning = false;
    this.overlay = null;
    this.init();
  }
  
  init() {
    this.createOverlay();
    this.bindLinks();
    this.handleInitialLoad();
  }
  
  createOverlay() {
    // Check if overlay already exists
    if (document.querySelector('.page-transition-overlay')) return;
    
    this.overlay = document.createElement('div');
    this.overlay.className = `page-transition-overlay ${this.options.effect}`;
    
    // Add appropriate content based on effect
    if (this.options.effect === 'split') {
      this.overlay.innerHTML = `
        <div class="split-panel"></div>
        <div class="split-panel"></div>
      `;
    }
    
    // Add logo
    const logo = document.createElement('div');
    logo.className = 'page-transition-logo';
    logo.innerHTML = `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="30" width="30" height="50" fill="#C9CED6"/>
        <rect x="45" y="20" width="30" height="60" fill="#F5F7FA"/>
        <line x1="25" y1="55" x2="60" y2="50" stroke="#0f0f10" stroke-width="3"/>
      </svg>
    `;
    this.overlay.appendChild(logo);
    
    // Add progress bar
    const progress = document.createElement('div');
    progress.className = 'page-transition-progress';
    this.overlay.appendChild(progress);
    
    document.body.appendChild(this.overlay);
  }
  
  bindLinks() {
    // Intercept all internal link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      
      const href = link.getAttribute('href');
      
      // Skip external links, anchors, and special links
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('https://wa.me') ||
        link.target === '_blank' ||
        link.hasAttribute('download') ||
        e.ctrlKey ||
        e.metaKey
      ) {
        return;
      }
      
      // Only handle same-origin links
      if (href.startsWith('http') && !href.includes(window.location.origin)) {
        return;
      }
      
      e.preventDefault();
      this.navigate(href);
    });
  }
  
  async navigate(url) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    // Add loading class to html
    document.documentElement.classList.add('is-transitioning');
    
    // Start exit animation
    this.overlay.classList.add('active');
    
    // Animate content out
    document.body.classList.add('content-exit');
    
    // Wait for exit animation
    await this.delay(this.options.duration * 0.5);
    
    try {
      // Prefetch or navigate
      if (window.fetch && url.startsWith(window.location.origin)) {
        // Try to prefetch the page
        const response = await fetch(url);
        const html = await response.text();
        
        // Parse the new page
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(html, 'text/html');
        
        // Wait for remaining animation
        await this.delay(this.options.duration * 0.5);
        
        // Update the page content
        this.updatePageContent(newDoc);
        
        // Update URL
        window.history.pushState({}, '', url);
        
        // Scroll to top
        window.scrollTo(0, 0);
        
      } else {
        // Fallback to full page load
        await this.delay(this.options.duration * 0.5);
        window.location.href = url;
        return;
      }
      
    } catch (error) {
      console.error('Page transition failed:', error);
      window.location.href = url;
      return;
    }
    
    // Start enter animation
    this.overlay.classList.remove('active');
    this.overlay.classList.add('exiting');
    
    // Remove exit class and add enter class
    document.body.classList.remove('content-exit');
    document.body.classList.add('content-enter');
    
    // Initialize stagger animations
    this.initStaggerAnimations();
    
    // Re-bind events for new content
    this.bindLinks();
    
    // Cleanup after animation
    await this.delay(this.options.duration);
    
    this.overlay.classList.remove('exiting');
    document.body.classList.remove('content-enter');
    document.documentElement.classList.remove('is-transitioning');
    
    this.isTransitioning = false;
  }
  
  updatePageContent(newDoc) {
    // Update title
    document.title = newDoc.title;
    
    // Update main content
    const currentMain = document.querySelector('main') || document.body;
    const newMain = newDoc.querySelector('main') || newDoc.body;
    
    if (currentMain && newMain) {
      currentMain.innerHTML = newMain.innerHTML;
    }
    
    // Update meta tags
    const metaSelectors = [
      'meta[name="description"]',
      'meta[property^="og:"]',
      'meta[name^="twitter:"]',
      'link[rel="canonical"]'
    ];
    
    metaSelectors.forEach(selector => {
      const newMeta = newDoc.querySelector(selector);
      const currentMeta = document.querySelector(selector);
      if (newMeta && currentMeta) {
        currentMeta.content = newMeta.content;
      }
    });
  }
  
  initStaggerAnimations() {
    const staggerContainers = document.querySelectorAll('.stagger-enter');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    staggerContainers.forEach(container => {
      observer.observe(container);
    });
  }
  
  handleInitialLoad() {
    // Add enter animation on initial load
    document.body.classList.add('content-enter');
    
    setTimeout(() => {
      document.body.classList.remove('content-enter');
      this.initStaggerAnimations();
    }, 500);
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Expose a global prefetch function
window.prefetchPage = function(url) {
  if (!window.fetch || !url.startsWith(window.location.origin)) return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pageTransitions = new AdvancedPageTransitions();
  });
} else {
  window.pageTransitions = new AdvancedPageTransitions();
}

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
  window.location.reload();
});
