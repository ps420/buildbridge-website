/**
 * v107.0: Intelligent Prefetch System
 * Fortune 500 Predictive Performance Optimization
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    hoverDelay: 100,           // ms to wait before prefetch on hover
    viewportThreshold: 0.5,    // visibility ratio to trigger prefetch
    connectionSpeedThreshold: {
      slow: 0.5,              // Mbps - below this = slow
      fast: 2.0               // Mbps - above this = fast
    },
    maxConcurrentPrefetches: 3,
    cacheExpiry: 5 * 60 * 1000, // 5 minutes
    storageKey: 'buildbridge-prefetch-data'
  };

  /**
   * Intelligent Prefetch Manager
   */
  class PrefetchManager {
    constructor() {
      this.prefetchQueue = new Set();
      this.activePrefetches = new Map();
      this.prefetchedUrls = new Set();
      this.cache = new Map();
      this.connectionSpeed = 'fast';
      this.dataSaver = false;
      this.prefetchEnabled = true;
      this.stats = {
        prefetched: 0,
        used: 0,
        saved: 0
      };
      
      this.init();
    }

    init() {
      this.detectCapabilities();
      this.bindEvents();
      this.initIntersectionObserver();
      this.loadSettings();
      
      console.log('⚡ Intelligent Prefetch System v107.0 initialized');
    }

    detectCapabilities() {
      // Detect connection speed
      if ('connection' in navigator) {
        const connection = navigator.connection;
        this.dataSaver = connection.saveData || false;
        
        if (connection.effectiveType) {
          const speeds = { '4g': 'fast', '3g': 'medium', '2g': 'slow', 'slow-2g': 'slow' };
          this.connectionSpeed = speeds[connection.effectiveType] || 'fast';
        }
        
        // Listen for connection changes
        connection.addEventListener('change', () => {
          this.detectCapabilities();
        });
      }

      // Detect if user prefers reduced data
      this.dataSaver = this.dataSaver || (navigator.connection?.saveData);
    }

    bindEvents() {
      // Hover intent prefetching
      document.addEventListener('mouseover', (e) => this.handleMouseOver(e));
      document.addEventListener('mouseout', (e) => this.handleMouseOut(e));

      // Touch intent for mobile
      document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });

      // Visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.resumePrefetching();
        } else {
          this.pausePrefetching();
        }
      });

      // Before unload - prefetch likely next page
      window.addEventListener('beforeunload', () => this.handleBeforeUnload());
    }

    handleMouseOver(e) {
      const link = e.target.closest('a');
      if (!link || !this.shouldPrefetch(link)) return;

      // Set hover timer
      link._prefetchTimeout = setTimeout(() => {
        this.prefetch(link.href, 'hover');
      }, CONFIG.hoverDelay);
    }

    handleMouseOut(e) {
      const link = e.target.closest('a');
      if (link && link._prefetchTimeout) {
        clearTimeout(link._prefetchTimeout);
        delete link._prefetchTimeout;
      }
    }

    handleTouchStart(e) {
      const link = e.target.closest('a');
      if (!link || !this.shouldPrefetch(link)) return;

      // Prefetch on touch start for faster mobile response
      this.prefetch(link.href, 'touch');
    }

    initIntersectionObserver() {
      // Prefetch links as they come into viewport
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= CONFIG.viewportThreshold) {
            const link = entry.target;
            this.prefetch(link.href, 'viewport');
            observer.unobserve(link);
          }
        });
      }, {
        threshold: CONFIG.viewportThreshold,
        rootMargin: '100px'
      });

      // Observe all internal links
      document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]').forEach(link => {
        if (this.shouldPrefetch(link)) {
          observer.observe(link);
        }
      });
    }

    shouldPrefetch(link) {
      if (!this.prefetchEnabled) return false;
      if (this.dataSaver) return false;
      if (this.connectionSpeed === 'slow') return false;
      if (this.prefetchedUrls.has(link.href)) return false;
      if (this.activePrefetches.has(link.href)) return false;
      if (link.target === '_blank') return false;
      if (link.href.startsWith('mailto:') || link.href.startsWith('tel:')) return false;
      if (link.href.includes('#')) return false;
      if (link.hostname !== location.hostname) return false;
      
      return true;
    }

    async prefetch(url, trigger = 'manual') {
      if (!this.shouldPrefetch({ href: url })) return;

      // Check cache first
      if (this.cache.has(url)) {
        const cached = this.cache.get(url);
        if (Date.now() - cached.time < CONFIG.cacheExpiry) {
          return;
        }
      }

      // Check concurrent limit
      if (this.activePrefetches.size >= CONFIG.maxConcurrentPrefetches) {
        this.prefetchQueue.add(url);
        return;
      }

      this.activePrefetches.set(url, { startTime: Date.now(), trigger });
      this.showPrefetchIndicator(url);

      try {
        // Use fetch with proper headers
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          priority: 'low',
          credentials: 'same-origin'
        });

        clearTimeout(timeout);

        if (response.ok) {
          const html = await response.text();
          
          // Parse and extract critical resources
          const resources = this.extractResources(html, url);
          
          // Prefetch critical resources
          await this.prefetchResources(resources);
          
          // Cache the page
          this.cache.set(url, {
            html,
            resources,
            time: Date.now(),
            size: new Blob([html]).size
          });

          this.prefetchedUrls.add(url);
          this.stats.prefetched++;
          
          // Dispatch event
          window.dispatchEvent(new CustomEvent('pageprefetched', {
            detail: { url, trigger, size: this.cache.get(url).size }
          }));
        }
      } catch (error) {
        console.warn('Prefetch failed:', url, error.message);
      } finally {
        this.activePrefetches.delete(url);
        this.hidePrefetchIndicator();
        this.processQueue();
      }
    }

    extractResources(html, baseUrl) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const resources = {
        styles: [],
        scripts: [],
        images: [],
        fonts: []
      };

      // Extract stylesheets
      doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        resources.styles.push(new URL(link.href, baseUrl).href);
      });

      // Extract critical scripts
      doc.querySelectorAll('script[src]:not([async]):not([defer])').forEach(script => {
        resources.scripts.push(new URL(script.src, baseUrl).href);
      });

      // Extract critical images (first 5 images)
      doc.querySelectorAll('img').forEach((img, index) => {
        if (index < 5) {
          resources.images.push(new URL(img.src, baseUrl).href);
        }
      });

      return resources;
    }

    async prefetchResources(resources) {
      const allResources = [
        ...resources.styles.slice(0, 2),  // Limit to 2 stylesheets
        ...resources.scripts.slice(0, 1), // Limit to 1 script
        ...resources.images.slice(0, 3)   // Limit to 3 images
      ];

      await Promise.all(
        allResources.map(url => this.prefetchResource(url))
      );
    }

    async prefetchResource(url) {
      try {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = this.getResourceType(url);
        document.head.appendChild(link);
        
        // Remove after some time to keep DOM clean
        setTimeout(() => link.remove(), 10000);
      } catch (e) {
        console.warn('Resource prefetch failed:', url);
      }
    }

    getResourceType(url) {
      if (url.endsWith('.css')) return 'style';
      if (url.endsWith('.js')) return 'script';
      if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)) return 'image';
      if (/\.(woff|woff2|ttf|otf)$/i.test(url)) return 'font';
      return 'document';
    }

    processQueue() {
      if (this.prefetchQueue.size === 0) return;
      
      const url = this.prefetchQueue.values().next().value;
      this.prefetchQueue.delete(url);
      this.prefetch(url, 'queued');
    }

    showPrefetchIndicator(url) {
      // Show subtle indicator that prefetch is happening
      if (this.activePrefetches.size === 1) {
        document.body.classList.add('is-prefetching');
      }
    }

    hidePrefetchIndicator() {
      if (this.activePrefetches.size === 0) {
        document.body.classList.remove('is-prefetching');
      }
    }

    pausePrefetching() {
      this.prefetchQueue.clear();
      this.prefetchEnabled = false;
    }

    resumePrefetching() {
      this.prefetchEnabled = true;
    }

    handleBeforeUnload() {
      // Save stats to localStorage
      localStorage.setItem(CONFIG.storageKey, JSON.stringify({
        stats: this.stats,
        lastVisit: Date.now()
      }));
    }

    loadSettings() {
      const saved = localStorage.getItem(CONFIG.storageKey);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.stats = data.stats || this.stats;
        } catch (e) {
          console.warn('Failed to load prefetch settings');
        }
      }
    }

    // Public API
    enable() {
      this.prefetchEnabled = true;
    }

    disable() {
      this.prefetchEnabled = false;
    }

    getStats() {
      return { ...this.stats };
    }

    clearCache() {
      this.cache.clear();
      this.prefetchedUrls.clear();
    }
  }

  /**
   * Quick Link Preloader
   * For instant page transitions
   */
  class QuickLinkPreloader {
    constructor() {
      this.prefetchedPages = new Map();
      this.init();
    }

    init() {
      // Intercept link clicks for instant navigation to prefetched pages
      document.addEventListener('click', (e) => this.handleLinkClick(e));
    }

    handleLinkClick(e) {
      const link = e.target.closest('a');
      if (!link) return;
      if (link.hostname !== location.hostname) return;
      if (link.target === '_blank') return;

      const cached = window.prefetchManager?.cache.get(link.href);
      if (cached) {
        // We have the page cached, could do instant navigation here
        // For now, just mark it as used
        window.prefetchManager.stats.used++;
      }
    }

    injectCachedPage(url) {
      const cached = window.prefetchManager?.cache.get(url);
      if (!cached) return false;

      // Parse and inject the cached HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(cached.html, 'text/html');
      
      // Animate transition
      document.body.style.opacity = '0';
      
      setTimeout(() => {
        // Replace content
        document.documentElement.innerHTML = doc.documentElement.innerHTML;
        
        // Restore opacity
        document.body.style.opacity = '1';
        
        // Update URL
        history.pushState(null, '', url);
        
        // Re-initialize scripts
        this.reinitializeScripts();
      }, 300);

      return true;
    }

    reinitializeScripts() {
      // Re-run critical initialization scripts
      document.querySelectorAll('script[data-reinit]').forEach(script => {
        const newScript = document.createElement('script');
        newScript.src = script.src;
        document.head.appendChild(newScript);
      });
    }
  }

  /**
   * Resource Hints Manager
   * Adds DNS prefetch, preconnect hints
   */
  class ResourceHintsManager {
    constructor() {
      this.init();
    }

    init() {
      this.addDNSPrefetch();
      this.addPreconnect();
    }

    addDNSPrefetch() {
      const domains = [
        'fonts.googleapis.com',
        'fonts.gstatic.com'
      ];

      domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        document.head.appendChild(link);
      });
    }

    addPreconnect() {
      const domains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
      ];

      domains.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    }
  }

  // Initialize when DOM is ready
  function init() {
    window.prefetchManager = new PrefetchManager();
    window.quickLinkPreloader = new QuickLinkPreloader();
    window.resourceHintsManager = new ResourceHintsManager();

    // Expose API
    window.PrefetchAPI = {
      prefetch: (url) => window.prefetchManager?.prefetch(url),
      enable: () => window.prefetchManager?.enable(),
      disable: () => window.prefetchManager?.disable(),
      getStats: () => window.prefetchManager?.getStats(),
      clearCache: () => window.prefetchManager?.clearCache()
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
