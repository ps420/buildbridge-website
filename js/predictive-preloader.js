/**
 * BuildBridge v15.0 - Predictive Preloading System
 * Fortune 500 page performance with intelligent prefetching
 */

(function() {
  'use strict';

  class PredictivePreloader {
    constructor(options = {}) {
      this.options = {
        prefetchDelay: 100,
        hoverThreshold: 100,
        maxConcurrent: 3,
        maxCacheSize: 50,
        enableDebug: false,
        ...options
      };

      this.cache = new Map();
      this.prefetchQueue = [];
      this.activePrefetches = 0;
      this.navigationHistory = [];
      this.userBehavior = {
        linkHoverTimes: new Map(),
        clickPatterns: [],
        scrollDepth: 0
      };

      this.init();
    }

    init() {
      this.createUI();
      this.bindEvents();
      this.monitorConnection();
      this.log('Predictive Preloader initialized');
    }

    createUI() {
      // Progress indicator
      const preloader = document.createElement('div');
      preloader.className = 'predictive-preloader';
      preloader.innerHTML = '<div class="predictive-progress" style="height: 0%"></div>';
      document.body.appendChild(preloader);
      this.preloader = preloader;

      // Connection status
      const status = document.createElement('div');
      status.className = 'connection-status online';
      status.innerHTML = `
        <span class="status-dot"></span>
        <span class="status-text">Connected</span>
      `;
      document.body.appendChild(status);
      this.statusIndicator = status;

      // Prefetch indicator (debug mode)
      if (this.options.enableDebug) {
        const indicator = document.createElement('div');
        indicator.className = 'prefetch-indicator';
        indicator.innerHTML = `
          <div class="prefetch-spinner"></div>
          <span>Preloading:</span> <span class="prefetch-target">-</span>
        `;
        document.body.appendChild(indicator);
        this.prefetchIndicator = indicator;
      }

      // Page transition overlay
      const overlay = document.createElement('div');
      overlay.className = 'page-transition-overlay';
      overlay.innerHTML = '<div class="page-transition-loader"></div>';
      document.body.appendChild(overlay);
      this.transitionOverlay = overlay;
    }

    bindEvents() {
      // Track link hovers for predictive prefetching
      document.addEventListener('mouseover', (e) => {
        const link = e.target.closest('a[href]');
        if (link && this.shouldPrefetch(link)) {
          this.handleLinkHover(link);
        }
      }, { passive: true });

      // Track clicks for behavior analysis
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (link && !link.getAttribute('href').startsWith('#')) {
          this.handleLinkClick(link, e);
        }
      });

      // Track scroll depth
      let scrollTimeout;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.userBehavior.scrollDepth = Math.max(
            this.userBehavior.scrollDepth,
            window.scrollY / (document.body.scrollHeight - window.innerHeight)
          );
        }, 250);
      }, { passive: true });

      // Prefetch visible links
      this.prefetchVisibleLinks();

      // Before unload
      window.addEventListener('beforeunload', () => {
        this.transitionOverlay.classList.add('active');
      });

      // Page show/hide
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.prefetchVisibleLinks();
        }
      });
    }

    shouldPrefetch(link) {
      const href = link.getAttribute('href');
      if (!href) return false;
      
      // Skip external links, anchors, javascript
      if (href.startsWith('http') || href.startsWith('#') || href.startsWith('javascript:')) {
        return false;
      }
      
      // Skip already cached
      if (this.cache.has(href)) return false;
      
      // Skip non-HTML resources
      const skipExt = ['.pdf', '.zip', '.mp4', '.mp3'];
      if (skipExt.some(ext => href.toLowerCase().includes(ext))) return false;

      return true;
    }

    handleLinkHover(link) {
      const href = link.getAttribute('href');
      const now = Date.now();
      
      // Track hover start time
      this.userBehavior.linkHoverTimes.set(href, now);

      // Prefetch after threshold
      setTimeout(() => {
        if (this.userBehavior.linkHoverTimes.get(href) === now) {
          this.queuePrefetch(href, 'hover');
          link.classList.add('preloading');
        }
      }, this.options.hoverThreshold);

      // Remove tracking on mouseout
      const onMouseOut = () => {
        this.userBehavior.linkHoverTimes.delete(href);
        link.classList.remove('preloading');
        link.removeEventListener('mouseout', onMouseOut);
      };
      link.addEventListener('mouseout', onMouseOut);
    }

    handleLinkClick(link, event) {
      const href = link.getAttribute('href');
      
      // Track click pattern
      this.userBehavior.clickPatterns.push({
        href,
        timestamp: Date.now(),
        scrollDepth: this.userBehavior.scrollDepth
      });

      // Show transition for non-cached pages
      if (!this.cache.has(href)) {
        this.transitionOverlay.classList.add('active');
        
        // Update progress bar
        this.preloader.classList.add('active');
        this.updateProgress(0);

        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress >= 90) {
            progress = 90;
            clearInterval(interval);
          }
          this.updateProgress(progress);
        }, 100);

        // Complete on page load
        window.addEventListener('pageshow', () => {
          clearInterval(interval);
          this.updateProgress(100);
          setTimeout(() => {
            this.preloader.classList.remove('active');
            this.transitionOverlay.classList.remove('active');
          }, 300);
        }, { once: true });
      }
    }

    queuePrefetch(href, reason = 'auto') {
      if (this.cache.has(href) || this.prefetchQueue.includes(href)) return;
      
      // Prioritize based on user behavior
      const priority = this.calculatePriority(href);
      
      this.prefetchQueue.push({ href, reason, priority });
      this.prefetchQueue.sort((a, b) => b.priority - a.priority);
      
      this.processQueue();
    }

    calculatePriority(href) {
      let priority = 1;
      
      // Higher priority for homepage
      if (href === 'index.html' || href === '/') priority += 5;
      
      // Higher priority for recently clicked patterns
      const recentClicks = this.userBehavior.clickPatterns.filter(
        p => p.href === href && Date.now() - p.timestamp < 3600000
      ).length;
      priority += recentClicks * 2;
      
      // Higher priority for visible links
      const link = document.querySelector(`a[href="${href}"]`);
      if (link && this.isInViewport(link)) priority += 3;
      
      return priority;
    }

    processQueue() {
      if (this.activePrefetches >= this.options.maxConcurrent) return;
      if (this.prefetchQueue.length === 0) return;

      const item = this.prefetchQueue.shift();
      this.prefetch(item.href, item.reason);
    }

    prefetch(href, reason) {
      if (this.cache.has(href)) return;

      this.activePrefetches++;
      this.showPrefetchIndicator(href);

      // Use Intersection Observer API for prefetch hints
      const linkEl = document.createElement('link');
      linkEl.rel = 'prefetch';
      linkEl.href = href;
      document.head.appendChild(linkEl);

      // Fetch and cache
      fetch(href, { method: 'GET', cache: 'force-cache' })
        .then(response => {
          if (response.ok) {
            this.cache.set(href, {
              timestamp: Date.now(),
              reason,
              size: response.headers.get('content-length')
            });
            
            // Manage cache size
            if (this.cache.size > this.options.maxCacheSize) {
              const oldest = this.cache.keys().next().value;
              this.cache.delete(oldest);
            }
          }
        })
        .catch(() => {
          // Silently fail for prefetch
        })
        .finally(() => {
          this.activePrefetches--;
          this.hidePrefetchIndicator();
          this.processQueue();
        });
    }

    prefetchVisibleLinks() {
      const links = document.querySelectorAll('a[href]');
      links.forEach(link => {
        if (this.shouldPrefetch(link) && this.isInViewport(link)) {
          this.queuePrefetch(link.getAttribute('href'), 'visible');
        }
      });
    }

    isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= -100 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight + 100) &&
        rect.right <= window.innerWidth
      );
    }

    monitorConnection() {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        
        const updateConnectionStatus = () => {
          const type = connection.effectiveType;
          const saveData = connection.saveData;
          
          if (saveData) {
            this.setConnectionStatus('slow', 'Data Saver On');
            this.options.maxConcurrent = 1;
          } else if (type === '4g') {
            this.setConnectionStatus('online', 'Fast Connection');
            this.options.maxConcurrent = 3;
          } else if (type === '3g') {
            this.setConnectionStatus('online', 'Good Connection');
            this.options.maxConcurrent = 2;
          } else {
            this.setConnectionStatus('slow', 'Slow Connection');
            this.options.maxConcurrent = 1;
          }
        };

        connection.addEventListener('change', updateConnectionStatus);
        updateConnectionStatus();
      }

      // Online/offline detection
      window.addEventListener('online', () => {
        this.setConnectionStatus('online', 'Connected');
      });
      
      window.addEventListener('offline', () => {
        this.setConnectionStatus('offline', 'Offline');
      });
    }

    setConnectionStatus(status, text) {
      this.statusIndicator.className = `connection-status ${status} visible`;
      this.statusIndicator.querySelector('.status-text').textContent = text;
      
      setTimeout(() => {
        this.statusIndicator.classList.remove('visible');
      }, 3000);
    }

    updateProgress(percent) {
      const progress = this.preloader.querySelector('.predictive-progress');
      progress.style.height = `${Math.min(100, percent)}%`;
    }

    showPrefetchIndicator(href) {
      if (!this.prefetchIndicator) return;
      
      const filename = href.split('/').pop() || 'Page';
      this.prefetchIndicator.querySelector('.prefetch-target').textContent = filename;
      this.prefetchIndicator.classList.add('visible');
    }

    hidePrefetchIndicator() {
      if (!this.prefetchIndicator) return;
      this.prefetchIndicator.classList.remove('visible');
    }

    log(...args) {
      if (this.options.enableDebug) {
        console.log('[PredictivePreloader]', ...args);
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.predictivePreloader = new PredictivePreloader();
    });
  } else {
    window.predictivePreloader = new PredictivePreloader();
  }
})();
