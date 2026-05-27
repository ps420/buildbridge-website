/**
 * BuildBridge Performance Dashboard v14.1
 * Real-time Core Web Vitals & Performance Monitoring
 */

(function() {
  'use strict';

  // Only show in development or with ?perf URL param
  const urlParams = new URLSearchParams(window.location.search);
  const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const showPerf = isDev || urlParams.has('perf') || localStorage.getItem('perf-dashboard') === 'enabled';
  
  if (!showPerf) return;

  // ============================================
  // Performance Dashboard Class
  // ============================================
  class PerformanceDashboard {
    constructor() {
      this.metrics = {
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null,
        inp: null
      };
      
      this.history = {
        lcp: [],
        cls: [],
        fcp: [],
        fps: []
      };
      
      this.fps = 60;
      this.frameCount = 0;
      this.lastTime = performance.now();
      this.isVisible = false;
      
      this.init();
    }
    
    init() {
      this.createUI();
      this.observeWebVitals();
      this.startFPSCounter();
      this.measureResourceTiming();
      this.measureMemory();
      
      // Update every second
      setInterval(() => this.updateDisplay(), 1000);
    }
    
    createUI() {
      // Create toggle button
      const toggle = document.createElement('button');
      toggle.className = 'perf-toggle';
      toggle.innerHTML = `
        <span>📊</span>
        <span class="pulse-indicator"></span>
      `;
      toggle.setAttribute('aria-label', 'Toggle performance dashboard');
      document.body.appendChild(toggle);
      
      // Create dashboard panel
      const dashboard = document.createElement('div');
      dashboard.className = 'perf-dashboard';
      dashboard.id = 'perf-dashboard';
      dashboard.innerHTML = `
        <div class="perf-header">
          <h3>Performance Monitor</h3>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="perf-live-badge">Live</span>
            <button class="perf-close" aria-label="Close dashboard">&times;</button>
          </div>
        </div>
        
        <div class="perf-score-section">
          <div class="perf-score-ring">
            <svg width="100" height="100">
              <circle class="perf-score-circle-bg" cx="50" cy="50" r="45"></circle>
              <circle class="perf-score-circle" id="perf-score-circle" cx="50" cy="50" r="45"></circle>
            </svg>
            <span class="perf-score-value" id="perf-overall-score">--</span>
          </div>
          <p class="perf-score-label">Performance Score</p>
        </div>
        
        <div class="perf-vitals-grid">
          <div class="perf-vital-card" id="vital-lcp">
            <div class="perf-vital-icon">⏱️</div>
            <div class="perf-vital-name">LCP</div>
            <div class="perf-vital-value loading">--</div>
            <div class="perf-vital-target">< 2.5s</div>
          </div>
          <div class="perf-vital-card" id="vital-fid">
            <div class="perf-vital-icon">👆</div>
            <div class="perf-vital-name">FID</div>
            <div class="perf-vital-value loading">--</div>
            <div class="perf-vital-target">< 100ms</div>
          </div>
          <div class="perf-vital-card" id="vital-cls">
            <div class="perf-vital-icon">📐</div>
            <div class="perf-vital-name">CLS</div>
            <div class="perf-vital-value loading">--</div>
            <div class="perf-vital-target">< 0.1</div>
          </div>
        </div>
        
        <div class="perf-section">
          <h4 class="perf-section-title">Page Load Timeline</h4>
          <div class="perf-resource-bar" id="resource-bar">
            <div class="perf-resource-segment dns" style="width: 0%"></div>
            <div class="perf-resource-segment tcp" style="width: 0%"></div>
            <div class="perf-resource-segment ttfb" style="width: 0%"></div>
            <div class="perf-resource-segment download" style="width: 0%"></div>
            <div class="perf-resource-segment processing" style="width: 0%"></div>
          </div>
          <div class="perf-resource-legend">
            <div class="perf-legend-item">
              <span class="perf-legend-color" style="background: #635BFF"></span>
              <span>DNS</span>
            </div>
            <div class="perf-legend-item">
              <span class="perf-legend-color" style="background: #00D9C0"></span>
              <span>TCP</span>
            </div>
            <div class="perf-legend-item">
              <span class="perf-legend-color" style="background: #f59e0b"></span>
              <span>TTFB</span>
            </div>
            <div class="perf-legend-item">
              <span class="perf-legend-color" style="background: #10b981"></span>
              <span>Download</span>
            </div>
          </div>
        </div>
        
        <div class="perf-section">
          <h4 class="perf-section-title">Render Performance</h4>
          <div class="perf-metric-item">
            <span class="perf-metric-name">FPS</span>
            <span class="perf-fps-display">
              <span class="perf-fps-value" id="fps-value">--</span>
            </span>
          </div>
          <div class="perf-mini-chart" id="fps-chart"></div>
        </div>
        
        <div class="perf-section">
          <h4 class="perf-section-title">Memory Usage</h4>
          <div class="perf-metric-item">
            <span class="perf-metric-name">Used / Total</span>
            <span class="perf-metric-value" id="memory-value">--</span>
          </div>
          <div class="perf-memory-bar">
            <div class="perf-memory-fill" id="memory-fill" style="width: 0%"></div>
          </div>
        </div>
        
        <div class="perf-section">
          <h4 class="perf-section-title">Additional Metrics</h4>
          <div class="perf-metrics-list">
            <div class="perf-metric-item">
              <span class="perf-metric-name">🚀 FCP</span>
              <span class="perf-metric-value" id="metric-fcp">--</span>
            </div>
            <div class="perf-metric-item">
              <span class="perf-metric-name">⏳ TTFB</span>
              <span class="perf-metric-value" id="metric-ttfb">--</span>
            </div>
            <div class="perf-metric-item">
              <span class="perf-metric-name">⚡ INP</span>
              <span class="perf-metric-value" id="metric-inp">--</span>
            </div>
            <div class="perf-metric-item">
              <span class="perf-metric-name">📦 DOM Nodes</span>
              <span class="perf-metric-value" id="metric-nodes">--</span>
            </div>
          </div>
        </div>
        
        <div class="perf-section perf-recommendations" id="recommendations" style="display: none;">
          <h4 class="perf-section-title">Recommendations</h4>
          <div id="rec-list"></div>
        </div>
      `;
      document.body.appendChild(dashboard);
      
      // Create FPS chart bars
      const chart = document.getElementById('fps-chart');
      for (let i = 0; i < 20; i++) {
        const bar = document.createElement('div');
        bar.className = 'perf-mini-bar';
        bar.style.height = '4px';
        chart.appendChild(bar);
      }
      
      // Event listeners
      toggle.addEventListener('click', () => {
        this.isVisible = !this.isVisible;
        dashboard.classList.toggle('active', this.isVisible);
        toggle.classList.toggle('active', this.isVisible);
      });
      
      dashboard.querySelector('.perf-close').addEventListener('click', () => {
        this.isVisible = false;
        dashboard.classList.remove('active');
        toggle.classList.remove('active');
      });
      
      this.toggle = toggle;
      this.dashboard = dashboard;
    }
    
    observeWebVitals() {
      // LCP - Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
            this.updateVital('lcp', this.metrics.lcp, [
              { limit: 2500, status: 'good' },
              { limit: 4000, status: 'warning' }
            ], (v) => (v / 1000).toFixed(2) + 's');
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {}
        
        // FID - First Input Delay
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const firstEntry = list.getEntries()[0];
            this.metrics.fid = firstEntry.processingStart - firstEntry.startTime;
            this.updateVital('fid', this.metrics.fid, [
              { limit: 100, status: 'good' },
              { limit: 300, status: 'warning' }
            ], (v) => Math.round(v) + 'ms');
          });
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {}
        
        // CLS - Cumulative Layout Shift
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            this.metrics.cls = clsValue;
            this.updateVital('cls', clsValue, [
              { limit: 0.1, status: 'good' },
              { limit: 0.25, status: 'warning' }
            ], (v) => v.toFixed(3));
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {}
      }
      
      // FCP - First Contentful Paint
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('paint');
          const fcp = perfData.find(p => p.name === 'first-contentful-paint');
          if (fcp) {
            this.metrics.fcp = fcp.startTime;
            this.updateMetricValue('fcp', (fcp.startTime / 1000).toFixed(2) + 's');
            this.updateVital('fcp', fcp.startTime, [
              { limit: 1800, status: 'good' },
              { limit: 3000, status: 'warning' }
            ], (v) => (v / 1000).toFixed(2) + 's');
          }
          
          // TTFB
          const nav = performance.getEntriesByType('navigation')[0];
          if (nav) {
            this.metrics.ttfb = nav.responseStart;
            this.updateMetricValue('ttfb', (nav.responseStart / 1000).toFixed(2) + 's');
          }
        }, 100);
      });
    }
    
    updateVital(id, value, thresholds, formatter) {
      const card = document.getElementById(`vital-${id}`);
      if (!card) return;
      
      const valueEl = card.querySelector('.perf-vital-value');
      valueEl.textContent = formatter ? formatter(value) : value;
      valueEl.classList.remove('loading');
      
      // Remove status classes
      card.classList.remove('good', 'warning', 'error');
      
      // Add appropriate status
      if (value <= thresholds[0].limit) {
        card.classList.add('good');
      } else if (value <= thresholds[1].limit) {
        card.classList.add('warning');
      } else {
        card.classList.add('error');
      }
      
      this.calculateOverallScore();
    }
    
    updateMetricValue(id, value) {
      const el = document.getElementById(`metric-${id}`);
      if (el) el.textContent = value;
    }
    
    calculateOverallScore() {
      let score = 100;
      const weights = { lcp: 0.35, fid: 0.25, cls: 0.25, fcp: 0.15 };
      
      // LCP scoring
      if (this.metrics.lcp) {
        if (this.metrics.lcp > 4000) score -= weights.lcp * 50;
        else if (this.metrics.lcp > 2500) score -= weights.lcp * 25;
      }
      
      // FID scoring
      if (this.metrics.fid) {
        if (this.metrics.fid > 300) score -= weights.fid * 50;
        else if (this.metrics.fid > 100) score -= weights.fid * 25;
      }
      
      // CLS scoring
      if (this.metrics.cls) {
        if (this.metrics.cls > 0.25) score -= weights.cls * 50;
        else if (this.metrics.cls > 0.1) score -= weights.cls * 25;
      }
      
      score = Math.round(score);
      
      const scoreEl = document.getElementById('perf-overall-score');
      const circle = document.getElementById('perf-score-circle');
      
      if (scoreEl) scoreEl.textContent = score;
      
      if (circle) {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (score / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        
        circle.classList.remove('good', 'warning', 'error');
        if (score >= 90) circle.style.stroke = '#10b981';
        else if (score >= 70) {
          circle.style.stroke = '#f59e0b';
          circle.classList.add('warning');
        } else {
          circle.style.stroke = '#ef4444';
          circle.classList.add('error');
        }
      }
      
      // Update toggle indicator
      if (this.toggle) {
        this.toggle.classList.remove('warning', 'error');
        if (score < 70) this.toggle.classList.add('error');
        else if (score < 90) this.toggle.classList.add('warning');
      }
    }
    
    startFPSCounter() {
      let lastFrameTime = performance.now();
      let frameCount = 0;
      let lastFpsUpdate = performance.now();
      
      const updateFPS = () => {
        const now = performance.now();
        frameCount++;
        
        if (now - lastFpsUpdate >= 1000) {
          this.fps = frameCount;
          frameCount = 0;
          lastFpsUpdate = now;
          
          // Update history
          this.history.fps.push(this.fps);
          if (this.history.fps.length > 20) this.history.fps.shift();
        }
        
        requestAnimationFrame(updateFPS);
      };
      
      requestAnimationFrame(updateFPS);
    }
    
    measureResourceTiming() {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const nav = performance.getEntriesByType('navigation')[0];
          if (!nav) return;
          
          const dns = nav.domainLookupEnd - nav.domainLookupStart;
          const tcp = nav.connectEnd - nav.connectStart;
          const ttfb = nav.responseStart - nav.startTime;
          const download = nav.responseEnd - nav.responseStart;
          const processing = nav.loadEventStart - nav.responseEnd;
          
          const total = dns + tcp + ttfb + download + processing;
          
          // Update resource bar
          const bar = document.getElementById('resource-bar');
          if (bar) {
            const segments = bar.querySelectorAll('.perf-resource-segment');
            segments[0].style.width = (dns / total * 100) + '%';
            segments[1].style.width = (tcp / total * 100) + '%';
            segments[2].style.width = (ttfb / total * 100) + '%';
            segments[3].style.width = (download / total * 100) + '%';
            segments[4].style.width = (processing / total * 100) + '%';
          }
        }, 100);
      });
    }
    
    measureMemory() {
      if ('memory' in performance) {
        setInterval(() => {
          const memory = performance.memory;
          const used = (memory.usedJSHeapSize / 1048576).toFixed(1);
          const total = (memory.totalJSHeapSize / 1048576).toFixed(1);
          const percentage = (memory.usedJSHeapSize / memory.totalJSHeapSize * 100).toFixed(1);
          
          const valueEl = document.getElementById('memory-value');
          const fillEl = document.getElementById('memory-fill');
          
          if (valueEl) valueEl.textContent = `${used} / ${total} MB`;
          if (fillEl) fillEl.style.width = percentage + '%';
        }, 2000);
      }
    }
    
    updateDisplay() {
      // Update FPS
      const fpsEl = document.getElementById('fps-value');
      if (fpsEl) {
        fpsEl.textContent = this.fps + ' FPS';
        fpsEl.classList.remove('good', 'warning', 'error');
        if (this.fps >= 55) fpsEl.classList.add('good');
        else if (this.fps >= 30) fpsEl.classList.add('warning');
        else fpsEl.classList.add('error');
      }
      
      // Update FPS chart
      const chart = document.getElementById('fps-chart');
      if (chart) {
        const bars = chart.querySelectorAll('.perf-mini-bar');
        bars.forEach((bar, i) => {
          const fps = this.history.fps[i] || 0;
          const height = Math.max(4, (fps / 60) * 30);
          bar.style.height = height + 'px';
          bar.classList.remove('good', 'warning', 'error');
          if (fps >= 55) bar.classList.add('good');
          else if (fps >= 30) bar.classList.add('warning');
          else bar.classList.add('error');
        });
      }
      
      // Update DOM nodes
      const nodesEl = document.getElementById('metric-nodes');
      if (nodesEl) {
        nodesEl.textContent = document.querySelectorAll('*').length.toLocaleString();
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new PerformanceDashboard());
  } else {
    new PerformanceDashboard();
  }

})();
