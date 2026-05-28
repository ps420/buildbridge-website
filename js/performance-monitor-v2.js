/**
 * Performance Monitor Dashboard v2.0
 * Fortune 500 Quality Real-time Performance Metrics
 * Tracks Core Web Vitals, FPS, Memory, and Resource Loading
 */

class PerformanceMonitorV2 {
  constructor() {
    this.isActive = false;
    this.metrics = {
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      ttfb: 0,
      fps: [],
      memory: [],
      domSize: 0,
      resourceCount: 0,
      pageLoadTime: 0
    };
    this.chartData = {
      fps: new Array(30).fill(60),
      memory: new Array(30).fill(0)
    };
    this.observers = {};
    this.animationId = null;
    this.lastTime = performance.now();
    this.frameCount = 0;
    
    this.init();
  }

  init() {
    this.createDashboard();
    this.attachEventListeners();
    this.observePerformanceEntries();
    this.startMonitoring();
    
    // Wait for page load to calculate initial metrics
    if (document.readyState === 'complete') {
      this.collectInitialMetrics();
    } else {
      window.addEventListener('load', () => this.collectInitialMetrics());
    }
  }

  createDashboard() {
    const container = document.createElement('div');
    container.className = 'performance-monitor';
    container.innerHTML = `
      <button class="performance-toggle" aria-label="Toggle Performance Monitor" title="Performance Monitor (Ctrl+Shift+P)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <span class="performance-indicator"></span>
      </button>
      
      <div class="performance-dashboard">
        <div class="dashboard-header">
          <div class="dashboard-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Performance Monitor
          </div>
          <div class="dashboard-status">
            <span class="status-dot"></span>
            <span class="status-text">Excellent</span>
          </div>
        </div>
        
        <div class="cwv-grid">
          <div class="cwv-card" data-metric="lcp">
            <div class="cwv-value">--</div>
            <div class="cwv-label">LCP</div>
            <div class="cwv-badge">Loading</div>
          </div>
          <div class="cwv-card" data-metric="fid">
            <div class="cwv-value">--</div>
            <div class="cwv-label">INP</div>
            <div class="cwv-badge">Interaction</div>
          </div>
          <div class="cwv-card" data-metric="cls">
            <div class="cwv-value">--</div>
            <div class="cwv-label">CLS</div>
            <div class="cwv-badge">Stability</div>
          </div>
        </div>
        
        <div class="performance-chart">
          <div class="chart-header">
            <span class="chart-title">Real-time Performance</span>
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-dot fps"></span>
                <span>FPS</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot memory"></span>
                <span>Memory</span>
              </div>
            </div>
          </div>
          <div class="chart-canvas">
            <svg class="chart-svg" preserveAspectRatio="none">
              <path class="chart-line fps" d=""/>
              <path class="chart-line memory" d=""/>
            </svg>
          </div>
        </div>
        
        <div class="resource-metrics">
          <div class="resource-metric">
            <div class="resource-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7z"/>
                <path d="M9 4v16"/>
              </svg>
            </div>
            <div class="resource-info">
              <div class="resource-label">DOM Elements</div>
              <div class="resource-value dom-size">--</div>
            </div>
          </div>
          <div class="resource-metric">
            <div class="resource-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <path d="M7 10l5 5 5-5"/>
                <path d="M12 15V3"/>
              </svg>
            </div>
            <div class="resource-info">
              <div class="resource-label">Resources</div>
              <div class="resource-value resource-count">--</div>
            </div>
          </div>
          <div class="resource-metric">
            <div class="resource-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div class="resource-info">
              <div class="resource-label">Load Time</div>
              <div class="resource-value load-time">--</div>
            </div>
          </div>
          <div class="resource-metric">
            <div class="resource-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div class="resource-info">
              <div class="resource-label">Viewport</div>
              <div class="resource-value viewport-size">--</div>
            </div>
          </div>
        </div>
        
        <div class="dashboard-actions">
          <button class="dashboard-btn" data-action="export">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <path d="M7 10l5 5 5-5"/>
              <path d="M12 15V3"/>
            </svg>
            Export
          </button>
          <button class="dashboard-btn dashboard-btn-primary" data-action="refresh">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(container);
    this.container = container;
    this.dashboard = container.querySelector('.performance-dashboard');
    this.toggle = container.querySelector('.performance-toggle');
    this.indicator = container.querySelector('.performance-indicator');
  }

  attachEventListeners() {
    // Toggle dashboard
    this.toggle.addEventListener('click', () => this.toggleDashboard());
    
    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        this.toggleDashboard();
      }
    });
    
    // Action buttons
    this.dashboard.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        if (action === 'export') this.exportMetrics();
        if (action === 'refresh') this.refreshMetrics();
      });
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target) && this.isActive) {
        this.toggleDashboard();
      }
    });
  }

  toggleDashboard() {
    this.isActive = !this.isActive;
    this.toggle.classList.toggle('active', this.isActive);
    this.dashboard.classList.toggle('active', this.isActive);
    
    if (this.isActive) {
      this.updateChart();
    }
  }

  observePerformanceEntries() {
    // Observe Core Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP
      try {
        this.observers.lcp = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
          this.updateCWVDisplay('lcp', this.metrics.lcp);
        });
        this.observers.lcp.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {}
      
      // FID/INP
      try {
        this.observers.fid = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.interactionId) {
              this.metrics.fid = entry.processingStart - entry.startTime;
              this.updateCWVDisplay('fid', this.metrics.fid);
            }
          });
        });
        this.observers.fid.observe({ entryTypes: ['first-input', 'event'] });
      } catch (e) {}
      
      // CLS
      try {
        this.observers.cls = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              this.metrics.cls += entry.value;
            }
          });
          this.updateCWVDisplay('cls', this.metrics.cls);
        });
        this.observers.cls.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {}
      
      // FCP
      try {
        this.observers.fcp = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
            }
          });
        });
        this.observers.fcp.observe({ entryTypes: ['paint'] });
      } catch (e) {}
      
      // Resource timing
      try {
        this.observers.resources = new PerformanceObserver((list) => {
          this.metrics.resourceCount = performance.getEntriesByType('resource').length;
          this.updateResourceMetrics();
        });
        this.observers.resources.observe({ entryTypes: ['resource'] });
      } catch (e) {}
    }
    
    // Navigation timing
    const navEntry = performance.getEntriesByType('navigation')[0];
    if (navEntry) {
      this.metrics.ttfb = navEntry.responseStart;
      this.metrics.pageLoadTime = navEntry.loadEventEnd - navEntry.startTime;
      this.updateResourceMetrics();
    }
  }

  collectInitialMetrics() {
    // DOM size
    this.metrics.domSize = document.querySelectorAll('*').length;
    
    // Resource count
    this.metrics.resourceCount = performance.getEntriesByType('resource').length;
    
    // Update display
    this.updateResourceMetrics();
  }

  startMonitoring() {
    const monitor = () => {
      this.frameCount++;
      const now = performance.now();
      const elapsed = now - this.lastTime;
      
      if (elapsed >= 1000) {
        const fps = Math.round((this.frameCount * 1000) / elapsed);
        this.metrics.fps.push(Math.min(fps, 120));
        if (this.metrics.fps.length > 30) this.metrics.fps.shift();
        
        // Memory usage
        if (performance.memory) {
          const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
          this.metrics.memory.push(memoryMB);
          if (this.metrics.memory.length > 30) this.metrics.memory.shift();
        }
        
        this.frameCount = 0;
        this.lastTime = now;
        
        if (this.isActive) {
          this.updateChart();
          this.updateOverallStatus();
        }
      }
      
      this.animationId = requestAnimationFrame(monitor);
    };
    
    this.animationId = requestAnimationFrame(monitor);
  }

  updateCWVDisplay(metric, value) {
    const card = this.dashboard.querySelector(`[data-metric="${metric}"]`);
    if (!card) return;
    
    const valueEl = card.querySelector('.cwv-value');
    const badgeEl = card.querySelector('.cwv-badge');
    
    let formattedValue, rating;
    
    switch(metric) {
      case 'lcp':
        formattedValue = value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(1)}s`;
        rating = value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor';
        break;
      case 'fid':
      case 'inp':
        formattedValue = `${Math.round(value)}ms`;
        rating = value < 100 ? 'good' : value < 200 ? 'needs-improvement' : 'poor';
        break;
      case 'cls':
        formattedValue = value.toFixed(3);
        rating = value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor';
        break;
    }
    
    valueEl.textContent = formattedValue;
    valueEl.className = `cwv-value ${rating}`;
    card.className = `cwv-card ${rating}`;
    badgeEl.className = `cwv-badge ${rating}`;
    badgeEl.textContent = rating === 'good' ? 'Good' : rating === 'needs-improvement' ? 'Fair' : 'Poor';
  }

  updateResourceMetrics() {
    const domSizeEl = this.dashboard.querySelector('.dom-size');
    const resourceCountEl = this.dashboard.querySelector('.resource-count');
    const loadTimeEl = this.dashboard.querySelector('.load-time');
    const viewportEl = this.dashboard.querySelector('.viewport-size');
    
    if (domSizeEl) domSizeEl.textContent = this.metrics.domSize.toLocaleString();
    if (resourceCountEl) resourceCountEl.textContent = this.metrics.resourceCount.toLocaleString();
    if (loadTimeEl) loadTimeEl.textContent = `${this.metrics.pageLoadTime.toFixed(0)}ms`;
    if (viewportEl) viewportEl.textContent = `${window.innerWidth}×${window.innerHeight}`;
  }

  updateChart() {
    const svg = this.dashboard.querySelector('.chart-svg');
    if (!svg) return;
    
    const width = svg.clientWidth || 300;
    const height = svg.clientHeight || 80;
    
    // Update FPS line
    const fpsLine = svg.querySelector('.chart-line.fps');
    const fpsPath = this.createChartPath(this.chartData.fps, width, height, 0, 120);
    fpsLine.setAttribute('d', fpsPath);
    
    // Update Memory line if available
    if (this.chartData.memory.some(m => m > 0)) {
      const maxMemory = Math.max(...this.chartData.memory, 100);
      const memoryLine = svg.querySelector('.chart-line.memory');
      const memoryPath = this.createChartPath(this.chartData.memory, width, height, 0, maxMemory);
      memoryLine.setAttribute('d', memoryPath);
    }
  }

  createChartPath(data, width, height, min, max) {
    const range = max - min;
    const stepX = width / (data.length - 1);
    
    return data.map((value, index) => {
      const x = index * stepX;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  updateOverallStatus() {
    const statusEl = this.dashboard.querySelector('.dashboard-status');
    const statusText = statusEl.querySelector('.status-text');
    const indicator = this.indicator;
    
    let status = 'good';
    
    // Check Core Web Vitals
    if (this.metrics.lcp > 4000 || this.metrics.fid > 200 || this.metrics.cls > 0.25) {
      status = 'poor';
    } else if (this.metrics.lcp > 2500 || this.metrics.fid > 100 || this.metrics.cls > 0.1) {
      status = 'needs-improvement';
    }
    
    // Check FPS
    const avgFps = this.chartData.fps.reduce((a, b) => a + b, 0) / this.chartData.fps.length;
    if (avgFps < 30) status = 'poor';
    else if (avgFps < 50 && status === 'good') status = 'needs-improvement';
    
    statusEl.className = `dashboard-status ${status === 'poor' ? 'critical' : status}`;
    statusText.textContent = status === 'good' ? 'Excellent' : status === 'needs-improvement' ? 'Fair' : 'Poor';
    indicator.className = `performance-indicator ${status}`;
  }

  refreshMetrics() {
    // Reset and recollect metrics
    this.metrics.cls = 0;
    this.collectInitialMetrics();
    
    // Trigger status update
    this.updateOverallStatus();
    
    // Show toast notification
    if (window.ToastSystem) {
      window.ToastSystem.success('Metrics refreshed successfully');
    }
  }

  exportMetrics() {
    const data = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: {
        coreWebVitals: {
          lcp: this.metrics.lcp,
          fid: this.metrics.fid,
          cls: this.metrics.cls,
          fcp: this.metrics.fcp,
          ttfb: this.metrics.ttfb
        },
        performance: {
          fps: this.chartData.fps,
          memory: this.chartData.memory,
          pageLoadTime: this.metrics.pageLoadTime
        },
        resources: {
          domElements: this.metrics.domSize,
          resourceCount: this.metrics.resourceCount,
          viewport: { width: window.innerWidth, height: window.innerHeight }
        }
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buildbridge-performance-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    if (window.ToastSystem) {
      window.ToastSystem.success('Performance report exported');
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    Object.values(this.observers).forEach(observer => {
      if (observer) observer.disconnect();
    });
    
    if (this.container) {
      this.container.remove();
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor = new PerformanceMonitorV2();
  });
} else {
  window.performanceMonitor = new PerformanceMonitorV2();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitorV2;
}
