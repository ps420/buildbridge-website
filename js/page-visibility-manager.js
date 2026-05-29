/**
 * v73.2: PAGE VISIBILITY & PERFORMANCE MANAGER
 * Fortune 500 Quality Resource Management
 */

class PageVisibilityManager {
  constructor(options = {}) {
    this.options = {
      pauseVideos: true,
      pauseAnimations: true,
      reduceFpsWhenHidden: true,
      hiddenFps: 1,
      resumeDelay: 100,
      ...options
    };
    
    this.isVisible = true;
    this.isFocused = true;
    this.pausedElements = new Set();
    this.intervals = new Map();
    this.timeouts = new Set();
    this.lowPowerMode = false;
    
    // Performance metrics
    this.metrics = {
      hiddenTime: 0,
      visibleTime: 0,
      lastVisibilityChange: Date.now(),
      frameDrops: 0,
      activeIntervals: 0
    };
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.setupBatteryMonitoring();
    this.setupPerformanceObserver();
  }
  
  bindEvents() {
    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.onHide();
      } else {
        this.onShow();
      }
    });
    
    // Window focus
    window.addEventListener('blur', () => this.onBlur());
    window.addEventListener('focus', () => this.onFocus());
    
    // Before unload
    window.addEventListener('beforeunload', () => this.onUnload());
    
    // Device orientation (mobile)
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', (e) => {
        this.handleOrientation(e);
      });
    }
  }
  
  onHide() {
    this.isVisible = false;
    this.metrics.lastVisibilityChange = Date.now();
    
    // Pause videos
    if (this.options.pauseVideos) {
      document.querySelectorAll('video').forEach(video => {
        if (!video.paused) {
          video.pause();
          this.pausedElements.add(video);
        }
      });
    }
    
    // Pause CSS animations
    if (this.options.pauseAnimations) {
      document.querySelectorAll('.animating, [data-animating]').forEach(el => {
        el.style.animationPlayState = 'paused';
        this.pausedElements.add(el);
      });
    }
    
    // Reduce RAF frequency
    if (this.options.reduceFpsWhenHidden) {
      this.throttleRAF();
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('visibility:hidden'));
    
    console.log('[PageVisibility] Paused for background');
  }
  
  onShow() {
    const hiddenDuration = Date.now() - this.metrics.lastVisibilityChange;
    this.metrics.hiddenTime += hiddenDuration;
    this.isVisible = true;
    
    // Resume videos after a short delay to avoid flash
    setTimeout(() => {
      this.pausedElements.forEach(el => {
        if (el.tagName === 'VIDEO') {
          el.play().catch(() => {});
        } else {
          el.style.animationPlayState = 'running';
        }
      });
      this.pausedElements.clear();
    }, this.options.resumeDelay);
    
    // Restore RAF
    this.restoreRAF();
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('visibility:visible', {
      detail: { hiddenDuration }
    }));
    
    console.log('[PageVisibility] Resumed after', hiddenDuration, 'ms');
  }
  
  onBlur() {
    this.isFocused = false;
    window.dispatchEvent(new CustomEvent('window:blur'));
  }
  
  onFocus() {
    this.isFocused = true;
    this.metrics.visibleTime += Date.now() - this.metrics.lastVisibilityChange;
    window.dispatchEvent(new CustomEvent('window:focus'));
  }
  
  onUnload() {
    // Cleanup
    this.intervals.forEach((id) => clearInterval(id));
    this.timeouts.forEach((id) => clearTimeout(id));
  }
  
  // Battery monitoring for power saving
  async setupBatteryMonitoring() {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        
        const updateBatteryStatus = () => {
          this.lowPowerMode = battery.level < 0.2 || !battery.charging;
          
          if (this.lowPowerMode) {
            this.enableLowPowerMode();
          }
          
          window.dispatchEvent(new CustomEvent('battery:change', {
            detail: {
              level: battery.level,
              charging: battery.charging,
              lowPower: this.lowPowerMode
            }
          }));
        };
        
        battery.addEventListener('levelchange', updateBatteryStatus);
        battery.addEventListener('chargingchange', updateBatteryStatus);
        updateBatteryStatus();
      } catch (e) {
        console.log('Battery API not available');
      }
    }
  }
  
  enableLowPowerMode() {
    // Reduce animations
    document.body.classList.add('low-power-mode');
    
    // Disable heavy effects
    document.querySelectorAll('[data-heavy-effect]').forEach(el => {
      el.style.display = 'none';
    });
    
    console.log('[PageVisibility] Low power mode enabled');
  }
  
  // Performance monitoring
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      // Long task observer
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.warn('[Performance] Long task detected:', entry.duration, 'ms');
            this.metrics.frameDrops++;
            
            window.dispatchEvent(new CustomEvent('performance:longtask', {
              detail: { duration: entry.duration }
            }));
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task observer not supported
      }
      
      // Layout shift observer
      try {
        const layoutObserver = new PerformanceObserver((list) => {
          let cls = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
          
          if (cls > 0.1) {
            console.warn('[Performance] High CLS detected:', cls);
          }
        });
        layoutObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Layout shift observer not supported
      }
    }
  }
  
  // Smart RAF throttling
  throttleRAF() {
    if (this._originalRAF) return;
    
    this._originalRAF = window.requestAnimationFrame;
    this._rafCallbacks = new Map();
    this._rafId = 0;
    
    window.requestAnimationFrame = (callback) => {
      const id = ++this._rafId;
      this._rafCallbacks.set(id, callback);
      return id;
    };
    
    // Run at reduced frame rate
    this._throttledLoop = setInterval(() => {
      this._rafCallbacks.forEach((callback, id) => {
        callback(performance.now());
      });
      this._rafCallbacks.clear();
    }, 1000 / this.options.hiddenFps);
  }
  
  restoreRAF() {
    if (!this._originalRAF) return;
    
    clearInterval(this._throttledLoop);
    window.requestAnimationFrame = this._originalRAF;
    
    // Execute any pending callbacks
    this._rafCallbacks?.forEach((callback) => {
      this._originalRAF(callback);
    });
    
    this._originalRAF = null;
    this._rafCallbacks = null;
  }
  
  // Smart interval management
  createSmartInterval(callback, delay, options = {}) {
    const id = Symbol('interval');
    let lastRun = 0;
    
    const wrappedCallback = () => {
      const now = Date.now();
      
      // Skip if page is hidden and option is set
      if (!this.isVisible && options.pauseWhenHidden) {
        lastRun = now;
        return;
      }
      
      // Adjust for missed time when hidden
      if (options.catchUp && lastRun > 0) {
        const missed = now - lastRun - delay;
        if (missed > delay) {
          callback(missed);
        }
      }
      
      lastRun = now;
      callback();
    };
    
    const intervalId = setInterval(wrappedCallback, delay);
    this.intervals.set(id, intervalId);
    this.metrics.activeIntervals++;
    
    return {
      id,
      clear: () => this.clearSmartInterval(id)
    };
  }
  
  clearSmartInterval(id) {
    const intervalId = this.intervals.get(id);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(id);
      this.metrics.activeIntervals--;
    }
  }
  
  // Visibility-aware timeout
  setSmartTimeout(callback, delay, options = {}) {
    const startTime = Date.now();
    let elapsedHidden = 0;
    
    const check = () => {
      if (!this.isVisible) {
        elapsedHidden += 100;
        setTimeout(check, 100);
        return;
      }
      
      const elapsed = Date.now() - startTime - elapsedHidden;
      
      if (elapsed >= delay) {
        callback();
      } else {
        setTimeout(check, Math.min(100, delay - elapsed));
      }
    };
    
    const timeoutId = setTimeout(check, delay);
    this.timeouts.add(timeoutId);
    
    return {
      clear: () => {
        clearTimeout(timeoutId);
        this.timeouts.delete(timeoutId);
      }
    };
  }
  
  // Device orientation handling
  handleOrientation(event) {
    // Pause heavy effects when device is moving rapidly (likely in pocket)
    if (event.alpha && event.beta && event.gamma) {
      const movement = Math.abs(event.alpha) + Math.abs(event.beta) + Math.abs(event.gamma);
      
      if (movement > 100) {
        document.body.classList.add('device-in-motion');
      } else {
        document.body.classList.remove('device-in-motion');
      }
    }
  }
  
  // Public API
  getMetrics() {
    return {
      ...this.metrics,
      isVisible: this.isVisible,
      isFocused: this.isFocused,
      lowPowerMode: this.lowPowerMode
    };
  }
  
  whenVisible(callback) {
    if (this.isVisible) {
      callback();
    } else {
      const handler = () => {
        callback();
        window.removeEventListener('visibility:visible', handler);
      };
      window.addEventListener('visibility:visible', handler);
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.visibilityManager = new PageVisibilityManager();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PageVisibilityManager;
}
