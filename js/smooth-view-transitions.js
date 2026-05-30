/**
 * v104.1: Smooth View Transitions API - Modern Page Transition System
 * Progressive enhancement with fallback for unsupported browsers
 */

(function() {
  'use strict';

  class ViewTransitionManager {
    constructor() {
      this.isSupported = 'startViewTransition' in document;
      this.currentPage = window.location.pathname;
      this.navigationHistory = [];
      this.pageMap = this.buildPageMap();
      
      this.init();
    }

    init() {
      // Build navigation map
      this.buildNavigation();
      
      // Add transition support to links
      this.enhanceLinks();
      
      // Create UI elements
      this.createUI();
      
      // Listen for navigation events
      this.bindEvents();
      
      console.log(`🎬 View Transitions API: ${this.isSupported ? 'Enabled' : 'Using fallback'}`);
    }

    buildPageMap() {
      return [
        { url: 'index.html', name: 'Home', order: 0 },
        { url: 'about.html', name: 'About', order: 1 },
        { url: 'services.html', name: 'Services', order: 2 },
        { url: 'projects.html', name: 'Projects', order: 3 },
        { url: 'contact.html', name: 'Contact', order: 4 }
      ];
    }

    buildNavigation() {
      const currentOrder = this.getCurrentPageOrder();
      this.prevPage = this.pageMap.find(p => p.order === currentOrder - 1);
      this.nextPage = this.pageMap.find(p => p.order === currentOrder + 1);
    }

    getCurrentPageOrder() {
      const path = window.location.pathname;
      const page = this.pageMap.find(p => 
        path.includes(p.url) || (p.url === 'index.html' && (path.endsWith('/') || path.endsWith('/BuildBridge/')))
      );
      return page ? page.order : 0;
    }

    createUI() {
      // Create navigation bar
      const nav = document.createElement('div');
      nav.className = 'page-transition-nav';
      nav.innerHTML = `
        <button class="page-transition-btn prev" ${!this.prevPage ? 'disabled' : ''} data-nav="prev">
          ${this.prevPage ? this.prevPage.name : 'Start'}
        </button>
        <button class="page-transition-btn next" ${!this.nextPage ? 'disabled' : ''} data-nav="next">
          ${this.nextPage ? this.nextPage.name : 'End'}
        </button>
      `;
      document.body.appendChild(nav);
      this.navBar = nav;

      // Create progress bar
      const progress = document.createElement('div');
      progress.className = 'page-transition-progress';
      document.body.appendChild(progress);
      this.progressBar = progress;

      // Create loading overlay (fallback)
      if (!this.isSupported) {
        const overlay = document.createElement('div');
        overlay.className = 'page-loading-overlay';
        overlay.innerHTML = `
          <div class="page-loading-content">
            <img src="assets/BuildBridge_Icon_Mark.svg" alt="BuildBridge" class="page-loading-logo">
            <p class="page-loading-text">Loading<span class="page-loading-dots"></span></p>
          </div>
        `;
        document.body.appendChild(overlay);
        this.loadingOverlay = overlay;
      }

      // Show nav on scroll
      this.setupNavVisibility();
    }

    setupNavVisibility() {
      let lastScrollY = window.scrollY;
      let ticking = false;

      const updateNav = () => {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollY / docHeight;

        // Show nav when scrolled past 30% or near bottom
        if (scrollPercent > 0.3 || scrollY > 500) {
          this.navBar.classList.add('visible');
        } else {
          this.navBar.classList.remove('visible');
        }

        lastScrollY = scrollY;
        ticking = false;
      };

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateNav);
          ticking = true;
        }
      }, { passive: true });
    }

    enhanceLinks() {
      document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        
        // Skip external links and anchors
        if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
          return;
        }

        // Add transition attribute
        link.setAttribute('data-transition', 'fade');
        
        // Handle click
        link.addEventListener('click', (e) => {
          if (e.ctrlKey || e.metaKey || e.shiftKey) return; // Allow normal behavior for modifier clicks
          
          e.preventDefault();
          this.navigate(href, 'fade');
        });
      });
    }

    bindEvents() {
      // Navigation buttons
      this.navBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.page-transition-btn');
        if (!btn || btn.disabled) return;

        const direction = btn.dataset.nav;
        const targetPage = direction === 'prev' ? this.prevPage : this.nextPage;
        
        if (targetPage) {
          this.navigate(targetPage.url, direction === 'prev' ? 'slide-right' : 'slide-left');
        }
      });

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.altKey && e.key === 'ArrowLeft' && this.prevPage) {
          e.preventDefault();
          this.navigate(this.prevPage.url, 'slide-right');
        } else if (e.altKey && e.key === 'ArrowRight' && this.nextPage) {
          e.preventDefault();
          this.navigate(this.nextPage.url, 'slide-left');
        }
      });

      // Browser back/forward
      window.addEventListener('popstate', () => {
        this.handlePopState();
      });
    }

    async navigate(url, transitionType = 'fade') {
      // Start progress
      this.progressBar.classList.add('loading');

      if (this.isSupported) {
        try {
          const transition = document.startViewTransition(async () => {
            await this.loadPage(url);
          });

          await transition.ready;
          
          // Update transition type for specific elements
          document.documentElement.style.setProperty('--transition-type', transitionType);
          
          await transition.finished;
        } catch (error) {
          console.error('View transition failed:', error);
          await this.fallbackTransition(url);
        }
      } else {
        await this.fallbackTransition(url);
      }

      // Complete progress
      this.progressBar.classList.add('complete');
      setTimeout(() => {
        this.progressBar.classList.remove('loading', 'complete');
      }, 300);

      // Update navigation
      this.currentPage = url;
      this.buildNavigation();
      this.updateNavButtons();
      this.enhanceLinks();
    }

    async loadPage(url) {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract and update content
        const newContent = doc.querySelector('main') || doc.body;
        const currentMain = document.querySelector('main') || document.body;
        
        // Update document title
        document.title = doc.title;

        // Update main content
        if (newContent && currentMain) {
          currentMain.innerHTML = newContent.innerHTML;
        }

        // Update URL
        window.history.pushState({}, '', url);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Reinitialize page scripts
        this.reinitializeScripts();

      } catch (error) {
        console.error('Failed to load page:', error);
        window.location.href = url; // Fallback to normal navigation
      }
    }

    async fallbackTransition(url) {
      if (this.loadingOverlay) {
        this.loadingOverlay.classList.add('active');
      }

      await this.loadPage(url);

      if (this.loadingOverlay) {
        this.loadingOverlay.classList.remove('active');
      }
    }

    updateNavButtons() {
      const prevBtn = this.navBar.querySelector('[data-nav="prev"]');
      const nextBtn = this.navBar.querySelector('[data-nav="next"]');

      if (prevBtn) {
        prevBtn.disabled = !this.prevPage;
        prevBtn.textContent = this.prevPage ? this.prevPage.name : 'Start';
      }

      if (nextBtn) {
        nextBtn.disabled = !this.nextPage;
        nextBtn.textContent = this.nextPage ? this.nextPage.name : 'End';
      }
    }

    reinitializeScripts() {
      // Dispatch event for other scripts to reinitialize
      window.dispatchEvent(new CustomEvent('pageTransitionComplete', {
        detail: { url: this.currentPage }
      }));

      // Reinitialize known components
      if (window.AnimatedCountUp) {
        document.querySelectorAll('.animated-stat-number[data-target]').forEach(el => {
          new window.AnimatedCountUp(el);
        });
      }
    }

    handlePopState() {
      const newUrl = window.location.pathname;
      if (newUrl !== this.currentPage) {
        this.navigate(newUrl, 'fade');
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ViewTransitionManager());
  } else {
    new ViewTransitionManager();
  }

  // Expose to global scope
  window.ViewTransitionManager = ViewTransitionManager;
})();
