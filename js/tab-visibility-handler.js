/**
 * Tab Visibility Handler
 * Pause expensive animations when tab is inactive for better performance
 */

class TabVisibilityHandler {
  constructor(options = {}) {
    this.options = {
      pauseAnimations: options.pauseAnimations !== false,
      pauseVideos: options.pauseVideos !== false,
      reduceFrameRate: options.reduceFrameRate !== false,
      frameRateWhenHidden: options.frameRateWhenHidden || 1, // fps
      resumeDelay: options.resumeDelay || 100, // ms delay before resuming
      ...options
    };
    
    this.isVisible = !document.hidden;
    this.animationFrameId = null;
    this.observers = new Set();
    this.pausedAnimations = new Set();
    this.intervals = [];
    this.timeouts = [];
    
    this.init();
  }
  
  init() {
    this.bindVisibilityChange();
    this.setupPerformanceObserver();
    
    // Log initial state
    console.log('[TabVisibility] Handler initialized. Tab is ' + (this.isVisible ? 'visible' : 'hidden'));
  }
  
  bindVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.onTabHidden();
      } else {
        this.onTabVisible();
      }
    });
    
    // Also handle window blur/focus for better detection
    window.addEventListener('blur', () => {
      if (!document.hidden) {
        this.onTabHidden();
      }
    });
    
    window.addEventListener('focus', () => {
      if (!document.hidden) {
        this.onTabVisible();
      }
    });
  }
  
  onTabHidden() {
    this.isVisible = false;
    console.log('[TabVisibility] Tab hidden - pausing expensive operations');
    
    if (this.options.pauseAnimations) {
      this.pauseCSSAnimations();
    }
    
    if (this.options.pauseVideos) {
      this.pauseMedia();
    }
    
    if (this.options.reduceFrameRate) {
      this.throttleAnimationFrame();
    }
    
    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('tabHidden'));
    
    // Update document title to show "away" state
    if (document.title && !document.title.startsWith('• ')) {
      this.originalTitle = document.title;
      document.title = '• ' + document.title;
    }
  }
  
  onTabVisible() {
    // Small delay to prevent flickering when quickly switching
    setTimeout(() => {
      if (document.hidden) return; // Still hidden
      
      this.isVisible = true;
      console.log('[TabVisibility] Tab visible - resuming operations');
      
      if (this.options.pauseAnimations) {
        this.resumeCSSAnimations();
      }
      
      if (this.options.pauseVideos) {
        this.resumeMedia();
      }
      
      this.restoreAnimationFrame();
      
      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('tabVisible'));
      
      // Restore original title
      if (this.originalTitle) {
        document.title = this.originalTitle;
      }
    }, this.options.resumeDelay);
  }
  
  pauseCSSAnimations() {
    // Get all animated elements
    const animatedElements = document.querySelectorAll(
      '.marquee-track, .particle-canvas, .orb, .custom-cursor, [class*="animate"], [class*="float"], [class*="pulse"]'
    );
    
    animatedElements.forEach(el => {
      const computedStyle = window.getComputedStyle(el);
      if (computedStyle.animationName !== 'none' || computedStyle.transitionDuration !== '0s') {
        el.style.animationPlayState = 'paused';
        this.pausedAnimations.add(el);
      }
    });
    
    // Pause canvas animations
    document.querySelectorAll('canvas').forEach(canvas => {
      if (canvas.dataset.animating !== 'false') {
        canvas.dataset.animating = 'false';
        canvas.dataset.wasAnimating = 'true';
      }
    });
  }
  
  resumeCSSAnimations() {
    this.pausedAnimations.forEach(el => {
      el.style.animationPlayState = '';
    });
    this.pausedAnimations.clear();
    
    // Resume canvas animations
    document.querySelectorAll('canvas[data-was-animating="true"]').forEach(canvas => {
      canvas.dataset.animating = 'true';
      canvas.dataset.wasAnimating = '';
    });
  }
  
  pauseMedia() {
    document.querySelectorAll('video, audio').forEach(media => {
      if (!media.paused) {
        media.dataset.wasPlaying = 'true';
        media.pause();
      }
    });
  }
  
  resumeMedia() {
    document.querySelectorAll('video, audio').forEach(media => {
      if (media.dataset.wasPlaying === 'true') {
        media.play().catch(() => {});
        media.dataset.wasPlaying = '';
      }
    });
  }
  
  throttleAnimationFrame() {
    // Override requestAnimationFrame to throttle when hidden
    this.originalRAF = window.requestAnimationFrame;
    this.originalCAF = window.cancelAnimationFrame;
    
    const targetInterval = 1000 / this.options.frameRateWhenHidden;
    let lastTime = 0;
    
    window.requestAnimationFrame = (callback) => {
      const now = performance.now();
      const elapsed = now - lastTime;
      
      if (elapsed >= targetInterval) {
        lastTime = now - (elapsed % targetInterval);
        return this.originalRAF(callback);
      }
      
      return setTimeout(() => callback(performance.now()), targetInterval - elapsed);
    };
  }
  
  restoreAnimationFrame() {
    if (this.originalRAF) {
      window.requestAnimationFrame = this.originalRAF;
    }
    if (this.originalCAF) {
      window.cancelAnimationFrame = this.originalCAF;
    }
  }
  
  setupPerformanceObserver() {
    // Monitor long tasks to detect performance issues
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 100) {
              console.warn('[Performance] Long task detected:', entry.duration.toFixed(2) + 'ms');
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Longtask not supported
      }
    }
  }
  
  // Public API for registering custom pause/resume handlers
  registerHandler(pauseFn, resumeFn) {
    this.observers.add({ pause: pauseFn, resume: resumeFn });
  }
  
  unregisterHandler(pauseFn) {
    this.observers.forEach(obs => {
      if (obs.pause === pauseFn) {
        this.observers.delete(obs);
      }
    });
  }
  
  // Pause specific intervals/timeouts when hidden
  createInterval(callback, delay) {
    const id = setInterval(() => {
      if (this.isVisible || delay > 5000) {
        callback();
      }
    }, delay);
    
    this.intervals.push(id);
    return id;
  }
  
  clearInterval(id) {
    clearInterval(id);
    this.intervals = this.intervals.filter(i => i !== id);
  }
  
  // Check if tab is currently visible
  isTabVisible() {
    return this.isVisible;
  }
  
  // Get time spent on page
  getTimeOnPage() {
    if (performance.now) {
      return performance.now();
    }
    return 0;
  }
}

/**
 * Smooth scroll performance optimization
 */
class SmoothScrollOptimizer {
  constructor() {
    this.init();
  }
  
  init() {
    // Use CSS scroll-behavior when possible, fallback to JS
    if (CSS.supports('scroll-behavior', 'smooth')) {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
    
    // Optimize scroll events with passive listeners
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    
    // Use Intersection Observer for scroll-triggered animations instead of scroll events
    this.setupIntersectionObservers();
  }
  
  handleScroll() {
    // Throttled scroll handling - avoid doing heavy work here
    if (this.scrollTimeout) {
      return;
    }
    
    this.scrollTimeout = setTimeout(() => {
      this.scrollTimeout = null;
    }, 16); // ~60fps
  }
  
  setupIntersectionObservers() {
    const observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          // Optionally unobserve after first trigger
          // observer.unobserve(entry.target);
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }, observerOptions);
    
    // Observe all animation-trigger elements
    document.querySelectorAll('[data-animate], .animate-on-scroll, .fade-in-up').forEach(el => {
      observer.observe(el);
    });
  }
}

/**
 * Image lazy loading optimization
 */
class LazyLoadOptimizer {
  constructor() {
    this.imageObserver = null;
    this.init();
  }
  
  init() {
    // Use native lazy loading where available
    if ('loading' in HTMLImageElement.prototype) {
      this.setupNativeLazyLoad();
    } else {
      this.setupIntersectionObserverLazyLoad();
    }
  }
  
  setupNativeLazyLoad() {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      // Native lazy loading is already set
    });
  }
  
  setupIntersectionObserverLazyLoad() {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.01
    };
    
    this.imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, options);
    
    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.imageObserver.observe(img);
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Create global instance
  window.tabVisibility = new TabVisibilityHandler({
    pauseAnimations: true,
    pauseVideos: true,
    reduceFrameRate: true,
    frameRateWhenHidden: 1
  });
  
  // Initialize optimizers
  new SmoothScrollOptimizer();
  new LazyLoadOptimizer();
  
  // Expose performance API
  window.getPagePerformance = () => ({
    timeOnPage: window.tabVisibility.getTimeOnPage(),
    isVisible: window.tabVisibility.isTabVisible(),
    memory: performance.memory ? {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    } : null
  });
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    TabVisibilityHandler, 
    SmoothScrollOptimizer, 
    LazyLoadOptimizer 
  };
}
