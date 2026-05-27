/**
 * Network Status Indicator - Fortune 500 Quality
 * Real-time connectivity monitoring with visual feedback
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    offlineThreshold: 3000,
    checkInterval: 5000,
    slowConnectionThreshold: 2000,
    showIndicatorDelay: 1000,
    hideIndicatorDelay: 3000
  };

  // State
  let currentStatus = 'online';
  let lastPingTime = 0;
  let connectionSpeed = 'good';
  let latencyHistory = [];
  let indicatorTimeout = null;
  let hideTimeout = null;
  
  // DOM Elements
  let indicator = null;
  let overlay = null;
  let tooltip = null;

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    createIndicator();
    createOverlay();
    bindEvents();
    startMonitoring();
    
    // Initial check
    checkConnection();
    
    console.log('[Network Status] Monitoring initialized');
  }

  /**
   * Create the network status indicator
   */
  function createIndicator() {
    indicator = document.createElement('div');
    indicator.className = 'network-status visible online';
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-live', 'polite');
    indicator.setAttribute('aria-label', 'Network status: Online');
    
    indicator.innerHTML = `
      <div class="network-signal" aria-hidden="true">
        <div class="network-signal-bar"></div>
        <div class="network-signal-bar"></div>
        <div class="network-signal-bar"></div>
        <div class="network-signal-bar"></div>
      </div>
      <div class="network-status-dot"></div>
      <div class="network-status-text">
        <span class="network-status-label">Online</span>
        <span class="network-status-sublabel">Connected</span>
      </div>
      
      <div class="network-status-tooltip">
        <div class="network-tooltip-header">Connection Details</div>
        
        <div class="network-metric">
          <span class="network-metric-label">
            <span>🌐</span> Status
          </span>
          <span class="network-metric-value good" id="network-status-value">Online</span>
        </div>
        
        <div class="network-metric">
          <span class="network-metric-label">
            <span>📶</span> Signal
          </span>
          <span class="network-metric-value good" id="network-signal-value">Excellent</span>
        </div>
        
        <div class="network-metric">
          <span class="network-metric-label">
            <span>⏱️</span> Latency
          </span>
          <span class="network-metric-value good" id="network-latency-value">-- ms</span>
        </div>
        
        <div class="network-quality-bar">
          <div class="network-quality-fill excellent" id="network-quality-fill"></div>
        </div>
        
        <div class="network-sync-indicator" id="network-sync">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M21.34 5.5A10 10 0 1 1 11.26 2.5"/>
          </svg>
          <span>Syncing data...</span>
        </div>
      </div>
    `;

    document.body.appendChild(indicator);
  }

  /**
   * Create the offline overlay
   */
  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'network-status-overlay';
    overlay.setAttribute('role', 'alert');
    overlay.setAttribute('aria-live', 'assertive');
    
    overlay.innerHTML = `
      <div class="network-offline-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
      </div>
      <h2 class="network-offline-title">You're offline</h2>
      <p class="network-offline-message">
        Please check your internet connection. Some features may be unavailable until you reconnect.
      </p>
      <button class="network-offline-retry" id="network-retry-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        <span>Retry Connection</span>
      </button>
    `;

    document.body.appendChild(overlay);

    // Bind retry button
    overlay.querySelector('#network-retry-btn').addEventListener('click', handleRetry);
  }

  /**
   * Bind browser network events
   */
  function bindEvents() {
    // Network status events
    window.addEventListener('online', () => {
      updateStatus('online');
      hideOverlay();
      showIndicator();
      showToast('Connection restored', 'success');
    });

    window.addEventListener('offline', () => {
      updateStatus('offline');
      showOverlay();
      showIndicator();
      showToast('Connection lost', 'error');
    });

    // Page visibility - resume monitoring when tab becomes active
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkConnection();
      }
    });

    // Also monitor network connection changes (if supported)
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      connection.addEventListener('change', () => {
        analyzeConnectionType(connection);
      });
      
      analyzeConnectionType(connection);
    }
  }

  /**
   * Start periodic connection monitoring
   */
  function startMonitoring() {
    setInterval(checkConnection, CONFIG.checkInterval);
    
    // Monitor page load times as a proxy for connection speed
    measurePageLoadSpeed();
  }

  /**
   * Check actual connection by pinging
   */
  async function checkConnection() {
    if (!navigator.onLine) {
      updateStatus('offline');
      return;
    }

    const startTime = performance.now();
    
    try {
      // Try to fetch a small resource with cache-busting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.offlineThreshold);
      
      const response = await fetch(window.location.href + '?_netcheck=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const latency = Math.round(performance.now() - startTime);
      updateLatencyMetrics(latency);
      
      if (response.ok) {
        if (latency > CONFIG.slowConnectionThreshold) {
          updateStatus('slow');
        } else {
          updateStatus('online');
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        updateStatus('slow');
      } else {
        updateStatus('offline');
      }
    }
  }

  /**
   * Analyze connection type information
   */
  function analyzeConnectionType(connection) {
    const effectiveType = connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
    const saveData = connection.saveData;
    
    let signalQuality = 'excellent';
    
    switch(effectiveType) {
      case '2g':
      case 'slow-2g':
        signalQuality = 'poor';
        updateStatus('slow');
        break;
      case '3g':
        signalQuality = 'fair';
        break;
      case '4g':
        signalQuality = 'excellent';
        break;
    }
    
    if (saveData) {
      signalQuality = 'fair';
    }
    
    updateSignalQuality(signalQuality);
    updateConnectionInfo({
      type: effectiveType?.toUpperCase() || 'Unknown',
      saveData: saveData ? 'Enabled' : 'Disabled'
    });
  }

  /**
   * Update the status indicator
   */
  function updateStatus(status) {
    if (currentStatus === status) return;
    
    currentStatus = status;
    
    // Update indicator classes
    indicator.className = `network-status visible ${status}`;
    
    // Update text
    const label = indicator.querySelector('.network-status-label');
    const sublabel = indicator.querySelector('.network-status-sublabel');
    
    switch(status) {
      case 'online':
        label.textContent = 'Online';
        sublabel.textContent = 'Connected';
        indicator.setAttribute('aria-label', 'Network status: Online');
        updateSyncStatus('synced');
        break;
      case 'offline':
        label.textContent = 'Offline';
        sublabel.textContent = 'No connection';
        indicator.setAttribute('aria-label', 'Network status: Offline');
        updateSyncStatus('offline');
        break;
      case 'slow':
        label.textContent = 'Slow';
        sublabel.textContent = 'Poor connection';
        indicator.setAttribute('aria-label', 'Network status: Slow connection');
        updateSyncStatus('syncing');
        break;
    }
    
    // Update tooltip
    updateTooltipStatus(status);
    
    // Announce to screen readers
    announceToScreenReader(`Network status changed to ${status}`);
    
    // Update document for CSS hooks
    document.body.setAttribute('data-network-status', status);
  }

  /**
   * Update latency metrics
   */
  function updateLatencyMetrics(latency) {
    latencyHistory.push(latency);
    if (latencyHistory.length > 5) {
      latencyHistory.shift();
    }
    
    const avgLatency = Math.round(latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length);
    
    const latencyEl = document.getElementById('network-latency-value');
    if (latencyEl) {
      latencyEl.textContent = `${avgLatency} ms`;
      latencyEl.className = 'network-metric-value ' + getLatencyQuality(avgLatency);
    }
    
    lastPingTime = latency;
  }

  /**
   * Get quality class based on latency
   */
  function getLatencyQuality(latency) {
    if (latency < 100) return 'good';
    if (latency < 300) return 'warning';
    return 'error';
  }

  /**
   * Update signal quality display
   */
  function updateSignalQuality(quality) {
    const fill = document.getElementById('network-quality-fill');
    const signalValue = document.getElementById('network-signal-value');
    
    if (fill) {
      fill.className = 'network-quality-fill ' + quality;
    }
    
    if (signalValue) {
      signalValue.textContent = quality.charAt(0).toUpperCase() + quality.slice(1);
      signalValue.className = 'network-metric-value ' + (quality === 'excellent' || quality === 'good' ? 'good' : quality === 'fair' ? 'warning' : 'error');
    }
  }

  /**
   * Update tooltip status
   */
  function updateTooltipStatus(status) {
    const statusEl = document.getElementById('network-status-value');
    if (statusEl) {
      const labels = {
        online: 'Online',
        offline: 'Disconnected',
        slow: 'Slow'
      };
      const classes = {
        online: 'good',
        offline: 'error',
        slow: 'warning'
      };
      statusEl.textContent = labels[status];
      statusEl.className = 'network-metric-value ' + classes[status];
    }
  }

  /**
   * Update sync status indicator
   */
  function updateSyncStatus(type) {
    const syncEl = document.getElementById('network-sync');
    if (!syncEl) return;
    
    const spinner = syncEl.querySelector('svg');
    const text = syncEl.querySelector('span');
    
    switch(type) {
      case 'syncing':
        syncEl.classList.remove('synced');
        spinner.style.animationPlayState = 'running';
        text.textContent = 'Syncing data...';
        break;
      case 'synced':
        syncEl.classList.add('synced');
        spinner.style.animationPlayState = 'paused';
        text.textContent = 'All data synced';
        break;
      case 'offline':
        syncEl.classList.remove('synced');
        spinner.style.animationPlayState = 'paused';
        text.textContent = 'Waiting for connection...';
        break;
    }
  }

  /**
   * Update connection info
   */
  function updateConnectionInfo(info) {
    // Could be used to display connection type info
  }

  /**
   * Show the indicator
   */
  function showIndicator() {
    clearTimeout(hideTimeout);
    indicator.classList.add('visible');
    
    // Auto-hide after delay if online
    if (currentStatus === 'online') {
      hideTimeout = setTimeout(() => {
        indicator.classList.remove('visible');
      }, CONFIG.hideIndicatorDelay);
    }
  }

  /**
   * Show the offline overlay
   */
  function showOverlay() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Hide the offline overlay
   */
  function hideOverlay() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  /**
   * Handle retry button click
   */
  async function handleRetry() {
    const btn = overlay.querySelector('#network-retry-btn');
    btn.classList.add('retrying');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
      <span>Checking...</span>
    `;
    
    await checkConnection();
    
    btn.classList.remove('retrying');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
      <span>Retry Connection</span>
    `;
  }

  /**
   * Measure page load speed
   */
  function measurePageLoadSpeed() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        if (loadTime > 3000) {
          console.warn('[Network Status] Slow page load detected:', loadTime + 'ms');
        }
      }, 0);
    });
  }

  /**
   * Show toast notification
   */
  function showToast(message, type = 'info') {
    if (window.Toast) {
      window.Toast[type === 'error' ? 'error' : type === 'success' ? 'success' : 'info'](message, {
        duration: 4000
      });
    }
  }

  /**
   * Announce to screen readers
   */
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  // Expose API
  window.BuildBridgeNetwork = {
    getStatus: () => currentStatus,
    getLatency: () => lastPingTime,
    check: checkConnection,
    showIndicator,
    hideIndicator: () => indicator?.classList.remove('visible')
  };

})();
