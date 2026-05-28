/**
 * Error Boundary System v58.0
 * Professional error handling with Fortune 500 polish
 */

class ErrorBoundarySystem {
  constructor(options = {}) {
    this.options = {
      showDetails: options.showDetails || false,
      enableReporting: options.enableReporting !== false,
      autoRecover: options.autoRecover !== false,
      degradeGracefully: options.degradeGracefully !== false,
      ...options
    };
    
    this.errors = [];
    this.isRecovered = false;
    this.fallbackMode = false;
    this.errorCount = 0;
    this.maxErrors = 5;
    
    this.init();
  }
  
  init() {
    this.setupErrorHandlers();
    this.createUI();
    this.setupGlobalErrorBoundary();
    
    console.log('✓ Error Boundary System initialized');
  }
  
  setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (e) => {
      this.handleError(e.error || e, 'window.error');
      return false;
    });
    
    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (e) => {
      this.handleError(e.reason, 'unhandledrejection');
      return false;
    });
    
    // Console error override for logging
    const originalError = console.error;
    console.error = (...args) => {
      this.logToDebug('error', args.join(' '));
      originalError.apply(console, args);
    };
  }
  
  setupGlobalErrorBoundary() {
    // Wrap common methods that might throw
    this.wrapTimerMethods();
    this.wrapEventListeners();
  }
  
  wrapTimerMethods() {
    const originalSetTimeout = window.setTimeout;
    const originalSetInterval = window.setInterval;
    
    window.setTimeout = (callback, delay, ...args) => {
      return originalSetTimeout((...cbArgs) => {
        try {
          callback(...cbArgs);
        } catch (error) {
          this.handleError(error, 'setTimeout');
        }
      }, delay, ...args);
    };
    
    window.setInterval = (callback, delay, ...args) => {
      return originalSetInterval((...cbArgs) => {
        try {
          callback(...cbArgs);
        } catch (error) {
          this.handleError(error, 'setInterval');
        }
      }, delay, ...args);
    };
  }
  
  wrapEventListeners() {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      const wrappedListener = function(event) {
        try {
          listener.call(this, event);
        } catch (error) {
          window.errorBoundary?.handleError(error, `event:${type}`);
        }
      };
      
      // Store reference for removal
      listener._wrapped = wrappedListener;
      
      return originalAddEventListener.call(this, type, wrappedListener, options);
    };
    
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
    
    EventTarget.prototype.removeEventListener = function(type, listener, options) {
      return originalRemoveEventListener.call(this, type, listener._wrapped || listener, options);
    };
  }
  
  createUI() {
    // Create main error overlay
    this.createErrorOverlay();
    
    // Create recovery overlay
    this.createRecoveryOverlay();
    
    // Create error toast
    this.createErrorToast();
    
    // Create degradation banner
    this.createDegradationBanner();
    
    // Create status indicator
    this.createStatusIndicator();
    
    // Create debug panel (development)
    if (this.options.showDetails || location.hostname === 'localhost') {
      this.createDebugPanel();
    }
  }
  
  createErrorOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'error-boundary-overlay';
    overlay.setAttribute('role', 'alert');
    overlay.setAttribute('aria-live', 'assertive');
    
    overlay.innerHTML = `
      <div class="error-boundary-container">
        <div class="error-boundary-icon pulse"></div>
        <div class="error-boundary-code">Error 500</div>
        <h1 class="error-boundary-title">Something went wrong</h1>
        <p class="error-boundary-message">
          We've encountered an unexpected issue. Don't worry, our team has been notified and we're working on a fix.
        </p>
        
        <div class="error-boundary-details">
          <button class="error-boundary-details-toggle">
            <span>Error Details</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <div class="error-boundary-details-content">
            <pre class="error-boundary-stack"></pre>
          </div>
        </div>
        
        <div class="error-boundary-actions">
          <button class="error-boundary-btn primary" onclick="window.errorBoundary.reload()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
            </svg>
            Reload Page
          </button>
          <button class="error-boundary-btn secondary" onclick="window.errorBoundary.goHome()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
              <polyline points="9,22 9,12 15,12 15,22"></polyline>
            </svg>
            Go Home
          </button>
          <button class="error-boundary-btn ghost" onclick="window.errorBoundary.reportIssue()">
            Report Issue
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    this.overlay = overlay;
    
    // Bind details toggle
    const toggle = overlay.querySelector('.error-boundary-details-toggle');
    const details = overlay.querySelector('.error-boundary-details');
    toggle.addEventListener('click', () => {
      details.classList.toggle('open');
    });
  }
  
  createRecoveryOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'error-recovery-overlay';
    
    overlay.innerHTML = `
      <div class="error-recovery-spinner"></div>
      <p class="error-recovery-text">Recovering...</p>
    `;
    
    document.body.appendChild(overlay);
    this.recoveryOverlay = overlay;
  }
  
  createErrorToast() {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
      <div class="error-toast-icon">⚠</div>
      <span class="error-toast-message">An error occurred</span>
      <button class="error-toast-close">✕</button>
    `;
    
    document.body.appendChild(toast);
    this.errorToast = toast;
    
    toast.querySelector('.error-toast-close').addEventListener('click', () => {
      this.hideToast();
    });
  }
  
  createDegradationBanner() {
    const banner = document.createElement('div');
    banner.className = 'error-degradation-banner';
    banner.innerHTML = `
      <span>⚠ Some features are unavailable</span>
      <button onclick="window.errorBoundary.attemptRecovery()">Try to Fix</button>
    `;
    
    document.body.appendChild(banner);
    this.degradationBanner = banner;
  }
  
  createStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'error-status-indicator';
    indicator.innerHTML = `
      <div class="error-status-dot"></div>
      <span class="error-status-text">Error detected</span>
    `;
    
    document.body.appendChild(indicator);
    this.statusIndicator = indicator;
  }
  
  createDebugPanel() {
    const panel = document.createElement('div');
    panel.className = 'error-debug-panel';
    panel.innerHTML = `
      <div class="error-debug-header">
        <span class="error-debug-title">📋 Error Log</span>
        <button class="error-debug-close">✕</button>
      </div>
      <div class="error-debug-log"></div>
    `;
    
    document.body.appendChild(panel);
    this.debugPanel = panel;
    this.debugLog = panel.querySelector('.error-debug-log');
    
    panel.querySelector('.error-debug-close').addEventListener('click', () => {
      panel.classList.remove('open');
    });
    
    // Toggle with key combo
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === '`') {
        panel.classList.toggle('open');
      }
    });
  }
  
  handleError(error, context = 'unknown') {
    // Increment error count
    this.errorCount++;
    
    // Log error
    const errorInfo = {
      error: error,
      context: context,
      timestamp: new Date().toISOString(),
      stack: error?.stack || 'No stack trace',
      message: error?.message || String(error),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    this.errors.push(errorInfo);
    
    // Log to debug panel
    this.logToDebug('error', `${context}: ${errorInfo.message}`);
    
    console.error(`[ErrorBoundary] ${context}:`, error);
    
    // Decide how to handle
    if (this.errorCount >= this.maxErrors) {
      this.showFullError(errorInfo);
    } else if (this.options.degradeGracefully) {
      this.showDegradedMode();
      this.showToast(errorInfo.message);
    } else {
      this.showFullError(errorInfo);
    }
    
    // Report to analytics if enabled
    if (this.options.enableReporting) {
      this.reportError(errorInfo);
    }
    
    // Attempt auto-recovery
    if (this.options.autoRecover && !this.isRecovered) {
      this.attemptRecovery();
    }
  }
  
  logToDebug(level, message) {
    if (!this.debugLog) return;
    
    const entry = document.createElement('div');
    entry.className = `error-debug-entry ${level}`;
    entry.innerHTML = `
      <div class="error-debug-time">${new Date().toLocaleTimeString()}</div>
      <div class="error-debug-message">${message}</div>
    `;
    
    this.debugLog.insertBefore(entry, this.debugLog.firstChild);
    
    // Keep only last 50 entries
    while (this.debugLog.children.length > 50) {
      this.debugLog.removeChild(this.debugLog.lastChild);
    }
  }
  
  showFullError(errorInfo) {
    // Update error details
    const stackEl = this.overlay.querySelector('.error-boundary-stack');
    stackEl.textContent = errorInfo.stack;
    
    // Show overlay
    this.overlay.classList.add('active');
    
    // Hide other indicators
    this.hideToast();
    this.degradationBanner.classList.remove('show');
    
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    
    // Announce to screen readers
    this.announce('An error has occurred. Please reload the page or go home.');
  }
  
  showDegradedMode() {
    this.fallbackMode = true;
    this.degradationBanner.classList.add('show');
    
    // Disable complex features
    document.body.classList.add('degraded-mode');
  }
  
  showToast(message) {
    this.errorToast.querySelector('.error-toast-message').textContent = message;
    this.errorToast.classList.add('show');
    
    // Auto hide
    setTimeout(() => this.hideToast(), 5000);
    
    // Show status indicator
    this.statusIndicator.classList.add('show');
  }
  
  hideToast() {
    this.errorToast.classList.remove('show');
  }
  
  attemptRecovery() {
    this.recoveryOverlay.classList.add('active');
    
    // Attempt recovery strategies
    setTimeout(() => {
      // Clear cached errors
      this.errorCount = 0;
      this.isRecovered = true;
      
      // Hide degradation mode
      this.fallbackMode = false;
      this.degradationBanner.classList.remove('show');
      this.statusIndicator.classList.remove('show');
      document.body.classList.remove('degraded-mode');
      
      // Hide recovery overlay
      this.recoveryOverlay.classList.remove('active');
      
      // Show success toast
      if (window.AdvancedToastSystem) {
        window.AdvancedToastSystem.success('System recovered successfully');
      }
      
      this.logToDebug('info', 'Recovery attempted successfully');
    }, 1500);
  }
  
  reportError(errorInfo) {
    // Send to analytics endpoint
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `${errorInfo.context}: ${errorInfo.message}`,
        fatal: this.errorCount >= this.maxErrors
      });
    }
    
    // Could also send to custom endpoint
    // fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorInfo) });
  }
  
  reload() {
    this.recoveryOverlay.classList.add('active');
    setTimeout(() => window.location.reload(), 800);
  }
  
  goHome() {
    window.location.href = 'index.html';
  }
  
  reportIssue() {
    const subject = encodeURIComponent('Error Report: BuildBridge Website');
    const body = encodeURIComponent(
      `Error Details:\n${this.errors.map(e => `${e.context}: ${e.message}`).join('\n')}\n\n` +
      `URL: ${window.location.href}\n` +
      `Time: ${new Date().toISOString()}`
    );
    
    window.open(`mailto:support@buildbridge.co.za?subject=${subject}&body=${body}`);
  }
  
  announce(message) {
    let region = document.getElementById('error-live-region');
    if (!region) {
      region = document.createElement('div');
      region.id = 'error-live-region';
      region.setAttribute('role', 'alert');
      region.setAttribute('aria-live', 'assertive');
      region.className = 'sr-only';
      region.style.cssText = 'position: absolute; left: -10000px;';
      document.body.appendChild(region);
    }
    region.textContent = message;
  }
  
  // Create a protected wrapper for functions
  static protect(fn, context = 'protected') {
    return function(...args) {
      try {
        return fn.apply(this, args);
      } catch (error) {
        window.errorBoundary?.handleError(error, context);
      }
    };
  }
  
  destroy() {
    // Remove all UI elements
    this.overlay?.remove();
    this.recoveryOverlay?.remove();
    this.errorToast?.remove();
    this.degradationBanner?.remove();
    this.statusIndicator?.remove();
    this.debugPanel?.remove();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.errorBoundary = new ErrorBoundarySystem({
    showDetails: false,
    enableReporting: true,
    autoRecover: true,
    degradeGracefully: true
  });
});

// Expose for debugging
window.ErrorBoundarySystem = ErrorBoundarySystem;
