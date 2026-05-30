/**
 * Page Transition Loader - v138.3
 * Fortune 500 Smooth Page Transition System
 * Provides visual feedback during navigation
 */

(function() {
  'use strict';

  const PageTransitionLoader = {
    config: {
      minLoadTime: 800,
      maxLoadTime: 5000,
      progressIncrement: 2,
      mode: 'auto', // 'full', 'minimal', 'corner', 'skeleton', 'auto'
      tips: [
        '💡 We\'ve delivered 150+ successful projects across South Africa',
        '💡 All our contractors are vetted and fully certified',
        '🏆 98% client satisfaction rate with 5-star reviews',
        '⚡ Average project completion time is 30% faster than industry standard',
        '💰 transparent pricing with no hidden costs',
        '📞 24/7 support available for urgent inquiries',
        '🏗️ Specializing in residential and commercial construction',
        '✓ All projects backed by our quality guarantee'
      ]
    },

    state: {
      isLoading: false,
      progress: 0,
      targetUrl: null,
      loadStartTime: 0,
      tipInterval: null,
      progressInterval: null,
      currentMode: 'auto'
    },

    init() {
      this.createLoader();
      this.bindEvents();
      this.prefetchLinks();
    },

    createLoader() {
      // Full loader
      const loader = document.createElement('div');
      loader.className = 'page-transition-loader';
      loader.setAttribute('role', 'status');
      loader.setAttribute('aria-live', 'polite');
      loader.setAttribute('aria-label', 'Page loading');
      
      loader.innerHTML = `
        <div class="page-transition-backdrop"></div>
        <div class="page-transition-content">
          <div class="page-transition-logo">
            <div class="page-transition-ring"></div>
            <div class="page-transition-logo-inner">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="15" y="35" width="25" height="50" rx="2"/>
                <rect x="45" y="15" width="25" height="70" rx="2"/>
                <rect x="75" y="45" width="15" height="40" rx="2"/>
              </svg>
            </div>
          </div>
          <div class="page-transition-text">Loading</div>
          <div class="page-transition-destination"></div>
          <div class="page-transition-progress">
            <div class="page-transition-progress-bar"></div>
          </div>
          <div class="page-transition-percent">0%</div>
          <div class="page-transition-tips"></div>
          <button class="page-transition-cancel">Cancel</button>
        </div>
      `;
      
      document.body.appendChild(loader);
      this.loader = loader;
      this.progressBar = loader.querySelector('.page-transition-progress-bar');
      this.percentEl = loader.querySelector('.page-transition-percent');
      this.destinationEl = loader.querySelector('.page-transition-destination');
      this.tipsEl = loader.querySelector('.page-transition-tips');

      // Top bar (minimal mode)
      const topBar = document.createElement('div');
      topBar.className = 'page-transition-top-bar';
      topBar.innerHTML = '<div class="page-transition-top-bar-fill"></div>';
      document.body.appendChild(topBar);
      this.topBar = topBar;
      this.topBarFill = topBar.querySelector('.page-transition-top-bar-fill');

      // Corner loader
      const corner = document.createElement('div');
      corner.className = 'page-transition-corner';
      corner.innerHTML = '<div class="page-transition-corner-spinner"></div>';
      document.body.appendChild(corner);
      this.corner = corner;

      // Shimmer overlay
      const shimmer = document.createElement('div');
      shimmer.className = 'page-transition-shimmer';
      document.body.appendChild(shimmer);
      this.shimmer = shimmer;
    },

    bindEvents() {
      // Intercept link clicks
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        // Skip external links, anchors, and special links
        const href = link.getAttribute('href');
        if (this.shouldSkipLink(href, link)) return;

        e.preventDefault();
        this.navigate(href, link.textContent.trim());
      });

      // Cancel button
      this.loader.querySelector('.page-transition-cancel').addEventListener('click', () => {
        this.cancel();
      });

      // Handle beforeunload
      window.addEventListener('beforeunload', () => {
        this.showTopBar();
      });

      // Page visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.state.isLoading) {
          this.complete();
        }
      });
    },

    shouldSkipLink(href, link) {
      // External links
      if (href.startsWith('http') && !href.includes(window.location.hostname)) {
        return true;
      }

      // Anchors
      if (href.startsWith('#')) return true;

      // JavaScript links
      if (href.startsWith('javascript:')) return true;

      // Downloads
      if (link.hasAttribute('download')) return true;

      // New tab
      if (link.target === '_blank') return true;

      // Has prevented attribute
      if (link.hasAttribute('data-no-transition')) return true;

      return false;
    },

    determineMode() {
      if (this.config.mode !== 'auto') return this.config.mode;

      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection) {
        if (connection.effectiveType === '4g' && !connection.saveData) {
          return 'full';
        } else if (connection.saveData) {
          return 'corner';
        }
      }

      // Default based on device
      return window.innerWidth < 768 ? 'top' : 'full';
    },

    navigate(url, title) {
      if (this.state.isLoading) return;

      this.state.isLoading = true;
      this.state.targetUrl = url;
      this.state.loadStartTime = Date.now();
      this.state.progress = 0;
      this.state.currentMode = this.determineMode();

      // Prefetch the page
      this.prefetchPage(url);

      // Show appropriate loader
      switch (this.state.currentMode) {
        case 'full':
          this.showFullLoader(title);
          break;
        case 'top':
        case 'minimal':
          this.showTopBar();
          break;
        case 'corner':
          this.showCornerLoader();
          break;
        case 'skeleton':
          this.showSkeletonLoader();
          break;
      }

      // Start progress simulation
      this.startProgress();

      // Navigate after minimum load time
      setTimeout(() => {
        this.performNavigation();
      }, this.config.minLoadTime);
    },

    prefetchPage(url) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    },

    showFullLoader(title) {
      this.destinationEl.textContent = title || 'New Page';
      this.loader.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Rotate tips
      this.rotateTips();
      this.state.tipInterval = setInterval(() => this.rotateTips(), 4000);
    },

    rotateTips() {
      const tip = this.config.tips[Math.floor(Math.random() * this.config.tips.length)];
      this.tipsEl.textContent = tip;
      this.tipsEl.style.animation = 'none';
      this.tipsEl.offsetHeight; // Trigger reflow
      this.tipsEl.style.animation = 'tipsFade 0.5s ease';
    },

    showTopBar() {
      this.topBar.classList.add('active');
    },

    showCornerLoader() {
      this.corner.classList.add('active');
    },

    showSkeletonLoader() {
      this.shimmer.classList.add('active');
    },

    startProgress() {
      this.state.progressInterval = setInterval(() => {
        if (this.state.progress >= 90) return;

        // Variable increment for realistic feel
        const increment = this.state.progress < 30 
          ? this.config.progressIncrement * 2
          : this.state.progress < 70
            ? this.config.progressIncrement
            : this.config.progressIncrement * 0.5;

        this.state.progress = Math.min(90, this.state.progress + increment);
        this.updateProgress();
      }, 100);
    },

    updateProgress() {
      const percent = Math.round(this.state.progress);

      if (this.progressBar) {
        this.progressBar.style.width = `${percent}%`;
      }

      if (this.percentEl) {
        this.percentEl.textContent = `${percent}%`;
      }

      if (this.topBarFill) {
        this.topBarFill.style.width = `${percent}%`;
      }
    },

    performNavigation() {
      // Complete progress
      this.state.progress = 100;
      this.updateProgress();

      // Small delay for visual completion
      setTimeout(() => {
        window.location.href = this.state.targetUrl;
      }, 200);
    },

    complete() {
      this.state.isLoading = false;
      this.clearIntervals();

      // Hide all loaders
      this.loader.classList.remove('active');
      this.topBar.classList.remove('active');
      this.corner.classList.remove('active');
      this.shimmer.classList.remove('active');

      document.body.style.overflow = '';

      // Reset for next time
      setTimeout(() => {
        this.state.progress = 0;
        this.updateProgress();
      }, 300);
    },

    cancel() {
      this.state.isLoading = false;
      this.state.targetUrl = null;
      this.complete();
    },

    clearIntervals() {
      if (this.state.tipInterval) {
        clearInterval(this.state.tipInterval);
        this.state.tipInterval = null;
      }
      if (this.state.progressInterval) {
        clearInterval(this.state.progressInterval);
        this.state.progressInterval = null;
      }
    },

    prefetchLinks() {
      // Prefetch links on hover
      let prefetchTimeout;
      
      document.addEventListener('mouseover', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (this.shouldSkipLink(href, link)) return;

        clearTimeout(prefetchTimeout);
        prefetchTimeout = setTimeout(() => {
          this.prefetchPage(href);
        }, 100);
      });
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PageTransitionLoader.init());
  } else {
    PageTransitionLoader.init();
  }

  // Expose to global scope
  window.PageTransitionLoader = PageTransitionLoader;
})();
