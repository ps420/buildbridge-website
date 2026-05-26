/**
 * BuildBridge Immersive Page Transitions v13.0
 * Fortune 500-grade smooth page navigation
 */

class ImmersiveTransitions {
  constructor(options = {}) {
    this.options = {
      duration: 800,
      easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
      style: 'panels', // panels, circle, blur, gradient
      showProgress: true,
      showLogo: true,
      prefetch: true,
      ...options
    };

    this.isTransitioning = false;
    this.transitionOverlay = null;
    this.currentPage = window.location.pathname;
    this.navigationHistory = [this.currentPage];
    
    this.init();
  }

  init() {
    this.createOverlay();
    this.bindEvents();
    this.initPrefetch();
    this.createRouteIndicator();
    
    // Mark current page in route indicator
    this.updateRouteIndicator();
    
    console.log('🎬 Immersive Transitions activated');
  }

  createOverlay() {
    this.transitionOverlay = document.createElement('div');
    this.transitionOverlay.className = 'transition-overlay';
    this.transitionOverlay.innerHTML = this.getOverlayHTML();
    document.body.appendChild(this.transitionOverlay);
  }

  getOverlayHTML() {
    const logoHTML = this.options.showLogo ? `
      <div class="transition-logo">
        <img src="assets/BuildBridge_Icon_Mark.svg" alt="BuildBridge">
      </div>
    ` : '';

    const progressHTML = this.options.showProgress ? `
      <div class="transition-progress">
        <div class="transition-progress-bar"></div>
      </div>
      <div class="transition-text">Loading</div>
    ` : '';

    switch (this.options.style) {
      case 'panels':
        return `
          <div class="transition-panels">
            <div class="transition-panel"></div>
            <div class="transition-panel"></div>
            <div class="transition-panel"></div>
            <div class="transition-panel"></div>
            <div class="transition-panel"></div>
          </div>
          ${logoHTML}
          ${progressHTML}
        `;
      
      case 'circle':
        return `
          <div class="transition-circle"></div>
          ${logoHTML}
          ${progressHTML}
        `;
      
      case 'blur':
        return `
          <div class="transition-blur"></div>
          ${logoHTML}
          ${progressHTML}
        `;
      
      case 'gradient':
        return `
          <div class="transition-gradient"></div>
          ${logoHTML}
          ${progressHTML}
        `;
      
      default:
        return '';
    }
  }

  bindEvents() {
    // Intercept link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      // Check if it's an internal link
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      // Check for modifier keys
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;

      e.preventDefault();
      this.navigate(href);
    });

    // Handle popstate (back/forward buttons)
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.path) {
        this.navigate(e.state.path, false);
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        this.navigateNext();
      } else if (e.key === 'ArrowLeft') {
        this.navigatePrev();
      }
    });
  }

  async navigate(url, pushState = true) {
    if (this.isTransitioning || url === window.location.pathname) return;
    
    this.isTransitioning = true;

    // Start exit transition
    await this.exitTransition();

    try {
      // Fetch new page content
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');
      const newContent = newDoc.querySelector('body');

      // Update page content
      document.body.innerHTML = newContent.innerHTML;

      // Update title
      document.title = newDoc.title;

      // Update URL
      if (pushState) {
        history.pushState({ path: url }, '', url);
        this.navigationHistory.push(url);
      }

      // Re-initialize scripts
      this.reinitializeScripts();

      // Start enter transition
      await this.enterTransition();

      // Update route indicator
      this.updateRouteIndicator();

      // Scroll to top
      window.scrollTo(0, 0);

    } catch (error) {
      console.error('Navigation failed:', error);
      // Fallback to regular navigation
      window.location.href = url;
    }

    this.isTransitioning = false;
  }

  exitTransition() {
    return new Promise((resolve) => {
      this.transitionOverlay.classList.add('active');
      
      if (this.options.style === 'circle') {
        this.transitionOverlay.classList.add('circle-active');
      } else if (this.options.style === 'blur') {
        this.transitionOverlay.classList.add('blur-active');
      } else if (this.options.style === 'gradient') {
        this.transitionOverlay.classList.add('gradient-active');
      }

      setTimeout(resolve, this.options.duration * 0.6);
    });
  }

  enterTransition() {
    return new Promise((resolve) => {
      this.transitionOverlay.classList.add('exiting');
      
      setTimeout(() => {
        this.transitionOverlay.classList.remove('active', 'exiting', 'circle-active', 'blur-active', 'gradient-active');
        resolve();
      }, this.options.duration * 0.4);
    });
  }

  reinitializeScripts() {
    // Re-create overlay
    this.createOverlay();
    this.createRouteIndicator();

    // Re-initialize cursor if exists
    if (window.premiumCursor) {
      window.premiumCursor.destroy();
      window.premiumCursor = new PremiumCursor();
    }

    // Re-run main scripts
    const scripts = document.querySelectorAll('script[src*="scripts.js"], script[src*="unified-feature-loader"]');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      newScript.src = oldScript.src;
      document.body.appendChild(newScript);
    });

    // Dispatch page loaded event
    window.dispatchEvent(new CustomEvent('pageTransitionComplete'));
  }

  initPrefetch() {
    if (!this.options.prefetch) return;

    const links = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = link.getAttribute('href');
        if (href && !this.prefetched.has(href)) {
          this.prefetch(href);
        }
      }, { once: true });
    });

    this.prefetched = new Set();
  }

  prefetch(url) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
    this.prefetched.add(url);
  }

  createRouteIndicator() {
    const sections = document.querySelectorAll('[data-section]');
    if (sections.length < 2) return;

    const indicator = document.createElement('div');
    indicator.className = 'route-indicator';
    
    sections.forEach((section, index) => {
      const dot = document.createElement('div');
      dot.className = 'route-dot';
      dot.dataset.section = section.dataset.section;
      dot.dataset.label = section.dataset.navLabel || section.dataset.section;
      dot.addEventListener('click', () => {
        section.scrollIntoView({ behavior: 'smooth' });
      });
      indicator.appendChild(dot);
    });

    document.body.appendChild(indicator);
    this.routeIndicator = indicator;

    // Scroll spy
    this.initScrollSpy(sections);
  }

  initScrollSpy(sections) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.updateRouteIndicator(entry.target.dataset.section);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach(section => observer.observe(section));
  }

  updateRouteIndicator(activeSection) {
    if (!this.routeIndicator) return;
    
    this.routeIndicator.classList.add('visible');
    
    this.routeIndicator.querySelectorAll('.route-dot').forEach(dot => {
      dot.classList.toggle('active', dot.dataset.section === activeSection);
    });
  }

  navigateNext() {
    const currentIndex = this.navigationHistory.length - 1;
    const pages = ['index.html', 'about.html', 'services.html', 'projects.html', 'contact.html'];
    const currentPage = this.navigationHistory[currentIndex].split('/').pop() || 'index.html';
    const currentPageIndex = pages.indexOf(currentPage);
    
    if (currentPageIndex < pages.length - 1) {
      this.navigate(pages[currentPageIndex + 1]);
    }
  }

  navigatePrev() {
    const currentIndex = this.navigationHistory.length - 1;
    const pages = ['index.html', 'about.html', 'services.html', 'projects.html', 'contact.html'];
    const currentPage = this.navigationHistory[currentIndex].split('/').pop() || 'index.html';
    const currentPageIndex = pages.indexOf(currentPage);
    
    if (currentPageIndex > 0) {
      this.navigate(pages[currentPageIndex - 1]);
    }
  }

  // Public API
  setStyle(style) {
    this.options.style = style;
    this.transitionOverlay.remove();
    this.createOverlay();
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.immersiveTransitions = new ImmersiveTransitions();
});

// Expose to global scope
window.ImmersiveTransitions = ImmersiveTransitions;
