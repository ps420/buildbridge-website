/**
 * PAGE VISIBILITY MANAGER - v44 Fortune 500
 * Intelligently pauses/resumes animations and heavy operations when tab is hidden
 * Saves battery life and improves performance
 */

class PageVisibilityManager {
  constructor() {
    this.isVisible = !document.hidden;
    this.isActive = true;
    this.pausedAnimations = new Map();
    this.pausedIntervals = new Map();
    this.pausedTimeouts = new Map();
    this.observers = new Set();
    this.frameId = null;
    this.stats = {
      timeHidden: 0,
      animationsPaused: 0,
      batterySaved: 0
    };
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.overrideNativeAPIs();
    this.initIntersectionObserver();
    this.initBatteryOptimization();
    this.startStatsTracking();
    
    console.log('🔋 Page Visibility Manager: Initialized');
  }
  
  bindEvents() {
    // Visibility change
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    
    // Window focus/blur
    window.addEventListener('blur', () => this.handleBlur());
    window.addEventListener('focus', () => this.handleFocus());
    
    // Page lifecycle events (if supported)
    if ('onfreeze' in document) {
      document.addEventListener('freeze', () => this.handleFreeze());
      document.addEventListener('resume', () => this.handleResume());
    }
    
    // Before unload
    window.addEventListener('beforeunload', () => this.handleBeforeUnload());
  }
  
  handleVisibilityChange() {
    this.isVisible = !document.hidden;
    
    if (this.isVisible) {
      this.resume();
      console.log('👁️ Page Visibility Manager: Tab became visible');
    } else {
      this.pause();
      console.log('👁️ Page Visibility Manager: Tab hidden, pausing operations');
    }
    
    this.notifyObservers('visibility', this.isVisible);
  }
  
  handleBlur() {
    this.isActive = false;
    // Don't pause immediately on blur - tab might still be visible
    setTimeout(() => {
      if (!this.isActive && this.isVisible) {
        this.reduceFrameRate();
      }
    }, 5000);
  }
  
  handleFocus() {
    this.isActive = true;
    this.restoreFrameRate();
  }
  
  handleFreeze() {
    console.log('❄️ Page Visibility Manager: Page frozen by browser');
    this.pause(true);
  }
  
  handleResume() {
    console.log('🔄 Page Visibility Manager: Page resumed');
    this.resume(true);
  }
  
  handleBeforeUnload() {
    this.dispose();
  }
  
  pause(aggressive = false) {
    const startTime = performance.now();
    
    // Pause CSS animations
    this.pauseCSSAnimations();
    
    // Pause WebGL/Canvas animations
    this.pauseCanvasAnimations();
    
    // Pause video playback
    this.pauseVideos();
    
    // Pause heavy JavaScript animations
    this.pauseJSAnimations();
    
    // Pause requestAnimationFrame loops
    this.pauseRAF();
    
    // Reduce timer frequency
    this.pauseTimers(aggressive);
    
    // Pause observers
    this.pauseObservers();
    
    // Stop network polling
    this.pauseNetworkActivity();
    
    if (aggressive) {
      // Clear non-critical caches
      this.clearNonCriticalCaches();
    }
    
    this.stats.animationsPaused++;
    console.log(`⏸️ Page Visibility Manager: Paused in ${Math.round(performance.now() - startTime)}ms`);
  }
  
  resume(force = false) {
    const startTime = performance.now();
    
    // Resume CSS animations
    this.resumeCSSAnimations();
    
    // Resume Canvas animations
    this.resumeCanvasAnimations();
    
    // Resume videos if they were playing
    this.resumeVideos();
    
    // Resume JS animations
    this.resumeJSAnimations();
    
    // Resume RAF
    this.resumeRAF();
    
    // Resume timers
    this.resumeTimers();
    
    // Resume observers
    this.resumeObservers();
    
    // Resume network activity
    this.resumeNetworkActivity();
    
    console.log(`▶️ Page Visibility Manager: Resumed in ${Math.round(performance.now() - startTime)}ms`);
  }
  
  // CSS Animation Management
  pauseCSSAnimations() {
    const animatedElements = document.querySelectorAll([
      '[class*="animate"]',
      '[class*="marquee"]',
      '[class*="pulse"]',
      '[class*="float"]',
      '.aurora-background',
      '.neural-network-bg',
      '.hero-typewriter'
    ].join(', '));
    
    animatedElements.forEach(el => {
      const computedStyle = window.getComputedStyle(el);
      if (computedStyle.animationPlayState === 'running') {
        this.pausedAnimations.set(el, {
          animationPlayState: 'running',
          transitionProperty: computedStyle.transitionProperty
        });
        el.style.animationPlayState = 'paused';
      }
    });
  }
  
  resumeCSSAnimations() {
    this.pausedAnimations.forEach((state, el) => {
      el.style.animationPlayState = 'running';
    });
    this.pausedAnimations.clear();
  }
  
  // Canvas/WebGL Animation Management
  pauseCanvasAnimations() {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      if (canvas.dataset.animating === 'true') {
        canvas.dataset.wasAnimating = 'true';
        canvas.dataset.animating = 'false';
      }
    });
  }
  
  resumeCanvasAnimations() {
    const canvases = document.querySelectorAll('canvas[data-was-animating="true"]');
    canvases.forEach(canvas => {
      canvas.dataset.animating = 'true';
      canvas.dataset.wasAnimating = 'false';
    });
  }
  
  // Video Management
  pauseVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      if (!video.paused) {
        video.dataset.wasPlaying = 'true';
        video.pause();
      }
    });
  }
  
  resumeVideos() {
    const videos = document.querySelectorAll('video[data-was-playing="true"]');
    videos.forEach(video => {
      video.play().catch(() => {}); // Ignore autoplay restrictions
      video.removeAttribute('data-was-playing');
    });
  }
  
  // JavaScript Animation Management
  pauseJSAnimations() {
    // Pause GSAP/Tween animations if present
    if (window.gsap && window.gsap.globalTimeline) {
      window.gsap.globalTimeline.pause();
    }
    
    // Pause custom animation libraries
    document.dispatchEvent(new CustomEvent('visibility:pause'));
  }
  
  resumeJSAnimations() {
    if (window.gsap && window.gsap.globalTimeline) {
      window.gsap.globalTimeline.resume();
    }
    
    document.dispatchEvent(new CustomEvent('visibility:resume'));
  }
  
  // RequestAnimationFrame Management
  pauseRAF() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
  
  resumeRAF() {
    // RAF will be restarted by individual components listening to visibility events
  }
  
  // Timer Management
  pauseTimers(aggressive) {
    // Store original setInterval
    if (!window._originalSetInterval) {
      window._originalSetInterval = window.setInterval;
      window.setInterval = this.createWrappedInterval.bind(this);
    }
    
    if (!window._originalSetTimeout) {
      window._originalSetTimeout = window.setTimeout;
      window.setTimeout = this.createWrappedTimeout.bind(this);
    }
    
    // Reduce frequency of existing intervals when hidden
    if (aggressive) {
      this.pausedIntervals.forEach((info, id) => {
        window._originalClearInterval(id);
      });
    }
  }
  
  resumeTimers() {
    // Timers will be recreated as needed
  }
  
  createWrappedInterval(callback, delay, ...args) {
    const id = window._originalSetInterval(() => {
      if (!document.hidden || delay <= 1000) {
        callback(...args);
      }
    }, delay);
    
    this.pausedIntervals.set(id, { callback, delay, args });
    return id;
  }
  
  createWrappedTimeout(callback, delay, ...args) {
    const id = window._originalSetTimeout(() => {
      callback(...args);
      this.pausedTimeouts.delete(id);
    }, delay);
    
    this.pausedTimeouts.set(id, { callback, delay, args });
    return id;
  }
  
  // Observer Management
  pauseObservers() {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (e) {}
    });
  }
  
  resumeObservers() {
    this.initIntersectionObserver();
  }
  
  // Network Activity Management
  pauseNetworkActivity() {
    // Pause real-time updates
    document.dispatchEvent(new CustomEvent('network:pause'));
    
    // Reduce fetch frequency
    if (window.EventSource) {
      const eventSources = document.querySelectorAll('[data-eventsource]');
      eventSources.forEach(source => {
        if (source._eventSource) {
          source._eventSource.close();
        }
      });
    }
  }
  
  resumeNetworkActivity() {
    document.dispatchEvent(new CustomEvent('network:resume'));
  }
  
  // Cache Management
  clearNonCriticalCaches() {
    // Clear image caches that aren't currently visible
    const images = document.querySelectorAll('img[data-src]:not([data-loaded])');
    images.forEach(img => {
      img.removeAttribute('src');
    });
  }
  
  // Frame Rate Management
  reduceFrameRate() {
    document.body.style.setProperty('--animation-play-state', 'paused');
  }
  
  restoreFrameRate() {
    document.body.style.removeProperty('--animation-play-state');
  }
  
  // Override Native APIs for consistent behavior
  overrideNativeAPIs() {
    // Wrap requestAnimationFrame
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      if (document.hidden) {
        // Defer until visible
        return setTimeout(() => {
          if (!document.hidden) {
            originalRAF(callback);
          }
        }, 100);
      }
      return originalRAF(callback);
    };
    
    // Store references for cleanup
    window._originalRequestAnimationFrame = originalRAF;
  }
  
  // Intersection Observer for off-screen elements
  initIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;
    
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        
        if (entry.isIntersecting) {
          el.dataset.inViewport = 'true';
          // Resume animations for visible elements
          if (el.style.animationPlayState === 'paused') {
            el.style.animationPlayState = 'running';
          }
        } else {
          el.dataset.inViewport = 'false';
          // Pause animations for off-screen elements
          if (!document.hidden && el.dataset.alwaysAnimate !== 'true') {
            el.style.animationPlayState = 'paused';
          }
        }
      });
    }, {
      root: null,
      rootMargin: '50px',
      threshold: 0
    });
    
    // Observe animated elements
    const animatedElements = document.querySelectorAll([
      '.marquee-track',
      '.floating-stats',
      '.counter-gold',
      '.aurora-background',
      '[class*="animate"]'
    ].join(', '));
    
    animatedElements.forEach(el => {
      this.intersectionObserver.observe(el);
    });
  }
  
  // Battery Optimization
  initBatteryOptimization() {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        this.battery = battery;
        
        battery.addEventListener('levelchange', () => this.handleBatteryChange());
        battery.addEventListener('chargingchange', () => this.handleBatteryChange());
        
        this.handleBatteryChange();
      });
    }
  }
  
  handleBatteryChange() {
    if (!this.battery) return;
    
    const isLowBattery = this.battery.level < 0.2 && !this.battery.charging;
    
    if (isLowBattery) {
      document.body.classList.add('low-battery-mode');
      this.applyBatteryOptimizations();
    } else {
      document.body.classList.remove('low-battery-mode');
      this.removeBatteryOptimizations();
    }
  }
  
  applyBatteryOptimizations() {
    // Disable non-essential animations
    document.documentElement.style.setProperty('--disable-animations', '1');
    
    // Reduce polling frequency
    this.stopNonCriticalTimers();
    
    console.log('🔋 Battery optimization enabled');
  }
  
  removeBatteryOptimizations() {
    document.documentElement.style.removeProperty('--disable-animations');
    console.log('🔋 Battery optimization disabled');
  }
  
  stopNonCriticalTimers() {
    // Clear non-critical intervals
    this.pausedIntervals.forEach((info, id) => {
      if (info.delay < 5000) { // Non-critical = less frequent than 5 seconds
        window._originalClearInterval(id);
      }
    });
  }
  
  // Stats Tracking
  startStatsTracking() {
    setInterval(() => {
      if (document.hidden) {
        this.stats.timeHidden += 1;
        this.stats.batterySaved += this.estimateBatterySavings();
      }
    }, 1000);
  }
  
  estimateBatterySavings() {
    // Rough estimate based on typical animation CPU usage
    return this.pausedAnimations.size * 0.5; // mWh per second
  }
  
  getStats() {
    return {
      ...this.stats,
      currentState: {
        isVisible: this.isVisible,
        isActive: this.isActive,
        animationsPaused: this.pausedAnimations.size
      }
    };
  }
  
  // Observer Pattern for Components
  subscribe(callback) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }
  
  notifyObservers(type, data) {
    this.observers.forEach(callback => {
      try {
        callback(type, data);
      } catch (e) {
        console.error('Error in visibility observer:', e);
      }
    });
  }
  
  // Public API
  onVisibilityChange(callback) {
    return this.subscribe((type, data) => {
      if (type === 'visibility') {
        callback(data);
      }
    });
  }
  
  onPause(callback) {
    document.addEventListener('visibility:pause', callback);
    return () => document.removeEventListener('visibility:pause', callback);
  }
  
  onResume(callback) {
    document.addEventListener('visibility:resume', callback);
    return () => document.removeEventListener('visibility:resume', callback);
  }
  
  isPageVisible() {
    return this.isVisible;
  }
  
  isPageActive() {
    return this.isActive;
  }
  
  dispose() {
    this.resume();
    this.observers.clear();
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    console.log('🧹 Page Visibility Manager: Disposed');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.pageVisibilityManager = new PageVisibilityManager();
});

// Expose to global for debugging
window.PageVisibilityManager = PageVisibilityManager;
