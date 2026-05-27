/**
 * PERFORMANCE MONITOR DASHBOARD v35.0
 * Fortune 500 Real-Time Site Analytics
 */

(function() {
  'use strict';

  // Performance Dashboard State
  let state = {
    isOpen: false,
    isActive: false,
    metrics: {
      fps: [],
      loadTime: 0,
      domInteractive: 0,
      domComplete: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      memory: { used: 0, total: 0 },
      domNodes: 0,
      domDepth: 0
    },
    fpsHistory: new Array(60).fill(60),
    lastFrameTime: performance.now(),
    frameCount: 0,
    animationId: null
  };

  // Configuration
  const config = {
    maxFpsHistory: 60,
    updateInterval: 1000,
    graphHeight: 80,
    graphWidth: 364
  };

  // Initialize Performance Dashboard
  function init() {
    collectInitialMetrics();
    createDashboard();
    setupEventListeners();
    startMonitoring();
    
    console.log('✅ Performance Monitor Dashboard initialized');
    console.log('📊 Page Load Time:', state.metrics.loadTime.toFixed(2) + 'ms');
    console.log('🎨 FCP:', state.metrics.firstContentfulPaint.toFixed(2) + 'ms');
  }

  // Collect Initial Page Metrics
  function collectInitialMetrics() {
    if (window.performance && performance.timing) {
      const timing = performance.timing;
      state.metrics.loadTime = timing.loadEventEnd - timing.navigationStart;
      state.metrics.domInteractive = timing.domInteractive - timing.navigationStart;
      state.metrics.domComplete = timing.domComplete - timing.navigationStart;
    }

    // Web Vitals via Performance Observer
    if (window.PerformanceObserver) {
      // FCP
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries.find(e => e.name === 'first-contentful-paint');
        if (fcp) {
          state.metrics.firstContentfulPaint = fcp.startTime;
        }
      });
      
      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {}

      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          state.metrics.largestContentfulPaint = lastEntry.startTime;
        }
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {}

      // CLS
      const clsObserver = new PerformanceObserver((list) => {
        let cls = 0;
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        });
        state.metrics.cumulativeLayoutShift = cls;
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {}
    }

    // DOM Metrics
    state.metrics.domNodes = document.querySelectorAll('*').length;
    state.metrics.domDepth = calculateDOMDepth();
  }

  // Calculate DOM Depth
  function calculateDOMDepth() {
    let maxDepth = 0;
    const elements = document.querySelectorAll('*');
    
    elements.forEach(el => {
      let depth = 0;
      let parent = el;
      while (parent) {
        depth++;
        parent = parent.parentElement;
      }
      maxDepth = Math.max(maxDepth, depth);
    });
    
    return maxDepth;
  }

  // Create Dashboard HTML
  function createDashboard() {
    const widget = document.createElement('div');
    widget.className = 'performance-monitor-widget';
    widget.id = 'perfMonitor';
    widget.setAttribute('role', 'region');
    widget.setAttribute('aria-label', 'Performance Monitor Dashboard');
    
    widget.innerHTML = `
      <div class="performance-dashboard" id="perfDashboard">
        <svg width="0" height="0" style="position: absolute;">
          <defs>
            <linearGradient id="perfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#4CAF50"/>
              <stop offset="100%" style="stop-color:#8BC34A"/>
            </linearGradient>
          </defs>
        </svg>
        
        <div class="perf-header">
          <div class="perf-header-title">
            <div class="perf-header-icon">📊</div>
            <div class="perf-header-text">
              <h3>Performance</h3>
              <span>Real-time metrics</span>
            </div>
          </div>
          <button class="perf-header-close" aria-label="Close performance dashboard">✕</button>
        </div>
        
        <div class="perf-overall-score">
          <div class="perf-score-circle">
            <svg class="perf-score-ring" viewBox="0 0 100 100">
              <circle class="perf-score-ring-bg" cx="50" cy="50" r="42"/>
              <circle class="perf-score-ring-progress" id="perfScoreRing" cx="50" cy="50" r="42"
                      stroke-dasharray="264" stroke-dashoffset="66"/>
            </svg>
            <div class="perf-score-value" id="perfScoreValue">75<span>/100</span></div>
          </div>
          <div class="perf-score-info">
            <h4>Performance Score</h4>
            <p>Based on Core Web Vitals</p>
            <span class="perf-score-badge excellent" id="perfScoreBadge">Excellent</span>
          </div>
        </div>
        
        <div class="perf-metrics-grid">
          <div class="perf-metric-item">
            <div class="perf-metric-icon speed">⚡</div>
            <div class="perf-metric-content">
              <div class="perf-metric-label">Load Time</div>
              <div class="perf-metric-value">
                <span id="perfLoadTime">--</span>
                <span class="perf-metric-trend up">fast</span>
              </div>
            </div>
          </div>
          <div class="perf-metric-item">
            <div class="perf-metric-icon memory">🧠</div>
            <div class="perf-metric-content">
              <div class="perf-metric-label">Memory</div>
              <div class="perf-metric-value">
                <span id="perfMemory">--</span>
                <span class="perf-metric-trend down">MB</span>
              </div>
            </div>
          </div>
          <div class="perf-metric-item">
            <div class="perf-metric-icon fps">🎯</div>
            <div class="perf-metric-content">
              <div class="perf-metric-label">FPS</div>
              <div class="perf-metric-value">
                <span id="perfFps">60</span>
                <span class="perf-metric-trend up">smooth</span>
              </div>
            </div>
          </div>
          <div class="perf-metric-item">
            <div class="perf-metric-icon dom">🌳</div>
            <div class="perf-metric-content">
              <div class="perf-metric-label">DOM Nodes</div>
              <div class="perf-metric-value">
                <span id="perfDomNodes">${state.metrics.domNodes}</span>
                <span class="perf-metric-trend">elements</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="perf-resources">
          <div class="perf-resources-title">Resource Usage</div>
          <div class="perf-resource-bar">
            <div class="perf-resource-header">
              <span class="perf-resource-name">JavaScript</span>
              <span class="perf-resource-value" id="perfJsSize">-- MB</span>
            </div>
            <div class="perf-resource-track">
              <div class="perf-resource-fill low" id="perfJsBar" style="width: 0%"></div>
            </div>
          </div>
          <div class="perf-resource-bar">
            <div class="perf-resource-header">
              <span class="perf-resource-name">CSS</span>
              <span class="perf-resource-value" id="perfCssSize">-- KB</span>
            </div>
            <div class="perf-resource-track">
              <div class="perf-resource-fill low" id="perfCssBar" style="width: 0%"></div>
            </div>
          </div>
          <div class="perf-resource-bar">
            <div class="perf-resource-header">
              <span class="perf-resource-name">Images</span>
              <span class="perf-resource-value" id="perfImgSize">-- MB</span>
            </div>
            <div class="perf-resource-track">
              <div class="perf-resource-fill medium" id="perfImgBar" style="width: 0%"></div>
            </div>
          </div>
        </div>
        
        <div class="perf-fps-graph">
          <div class="perf-fps-title">
            <span>Frame Rate History</span>
            <span class="perf-fps-current" id="perfFpsLabel">60 FPS</span>
          </div>
          <canvas class="perf-fps-canvas" id="perfFpsCanvas" width="364" height="80"></canvas>
        </div>
        
        <div class="perf-actions">
          <button class="perf-action-btn" id="perfToggleMonitoring">
            <span>⏸️</span> Pause
          </button>
          <button class="perf-action-btn primary" id="perfOptimizeBtn">
            <span>🚀</span> Optimize
          </button>
        </div>
      </div>
      
      <button class="performance-monitor-toggle" id="perfToggle" aria-label="Open performance dashboard">
        <span class="perf-pulse"></span>
        <span class="perf-icon">📊</span>
      </button>
    `;
    
    document.body.appendChild(widget);
    
    // Initialize FPS canvas
    initFpsCanvas();
    
    // Update display with initial values
    updateDisplay();
  }

  // Initialize FPS Canvas
  function initFpsCanvas() {
    const canvas = document.getElementById('perfFpsCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }

  // Draw FPS Graph
  function drawFpsGraph() {
    const canvas = document.getElementById('perfFpsCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = 'rgba(201, 206, 214, 0.03)';
    ctx.fillRect(0, 0, width, height);
    
    // Grid lines
    ctx.strokeStyle = 'rgba(201, 206, 214, 0.1)';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach(y => {
      ctx.beginPath();
      ctx.moveTo(0, height * y);
      ctx.lineTo(width, height * y);
      ctx.stroke();
    });
    
    // Draw FPS line
    const step = width / (state.fpsHistory.length - 1);
    
    ctx.beginPath();
    ctx.moveTo(0, height - (state.fpsHistory[0] / 60) * height);
    
    for (let i = 1; i < state.fpsHistory.length; i++) {
      const x = i * step;
      const y = height - (Math.min(state.fpsHistory[i], 60) / 60) * height;
      ctx.lineTo(x, y);
    }
    
    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(76, 175, 80, 0.4)');
    gradient.addColorStop(1, 'rgba(76, 175, 80, 0.05)');
    
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Fill area under line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Toggle button
    const toggle = document.getElementById('perfToggle');
    const closeBtn = document.querySelector('.perf-header-close');
    const dashboard = document.getElementById('perfDashboard');
    
    if (toggle) {
      toggle.addEventListener('click', toggleDashboard);
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', closeDashboard);
    }
    
    // Pause/Resume monitoring
    const toggleMonitoring = document.getElementById('perfToggleMonitoring');
    if (toggleMonitoring) {
      toggleMonitoring.addEventListener('click', toggleMonitoringState);
    }
    
    // Optimize button (simulated)
    const optimizeBtn = document.getElementById('perfOptimizeBtn');
    if (optimizeBtn) {
      optimizeBtn.addEventListener('click', runOptimization);
    }
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isOpen) {
        closeDashboard();
      }
    });
  }

  // Toggle Dashboard
  function toggleDashboard() {
    state.isOpen = !state.isOpen;
    const dashboard = document.getElementById('perfDashboard');
    const toggle = document.getElementById('perfToggle');
    
    dashboard.classList.toggle('active', state.isOpen);
    toggle.classList.toggle('active', state.isOpen);
    
    if (state.isOpen) {
      updateDisplay();
    }
  }

  // Close Dashboard
  function closeDashboard() {
    state.isOpen = false;
    const dashboard = document.getElementById('perfDashboard');
    const toggle = document.getElementById('perfToggle');
    
    dashboard.classList.remove('active');
    toggle.classList.remove('active');
  }

  // Toggle Monitoring State
  function toggleMonitoringState() {
    state.isActive = !state.isActive;
    const btn = document.getElementById('perfToggleMonitoring');
    
    if (state.isActive) {
      btn.innerHTML = '<span>▶️</span> Resume';
      cancelAnimationFrame(state.animationId);
    } else {
      btn.innerHTML = '<span>⏸️</span> Pause';
      startFpsMonitoring();
    }
  }

  // Run Optimization (Simulation)
  function runOptimization() {
    const btn = document.getElementById('perfOptimizeBtn');
    btn.innerHTML = '<span>⏳</span> Running...';
    btn.disabled = true;
    
    setTimeout(() => {
      // Simulate optimizations
      collectInitialMetrics();
      updateDisplay();
      
      btn.innerHTML = '<span>✅</span> Optimized!';
      setTimeout(() => {
        btn.innerHTML = '<span>🚀</span> Optimize';
        btn.disabled = false;
      }, 2000);
    }, 1500);
  }

  // Start Monitoring
  function startMonitoring() {
    state.isActive = true;
    startFpsMonitoring();
    
    // Update metrics periodically
    setInterval(() => {
      if (state.isActive && state.isOpen) {
        updateMetrics();
        updateDisplay();
      }
    }, config.updateInterval);
  }

  // Start FPS Monitoring
  function startFpsMonitoring() {
    if (!state.isActive) return;
    
    const now = performance.now();
    const delta = now - state.lastFrameTime;
    
    if (delta >= 1000 / 60) {
      const fps = Math.round(1000 / delta);
      state.fpsHistory.push(Math.min(fps, 60));
      state.fpsHistory.shift();
      
      state.lastFrameTime = now;
    }
    
    if (state.isOpen) {
      drawFpsGraph();
    }
    
    state.animationId = requestAnimationFrame(startFpsMonitoring);
  }

  // Update Metrics
  function updateMetrics() {
    // Memory usage
    if (performance.memory) {
      state.metrics.memory.used = Math.round(performance.memory.usedJSHeapSize / 1048576);
      state.metrics.memory.total = Math.round(performance.memory.totalJSHeapSize / 1048576);
    }
    
    // DOM nodes
    state.metrics.domNodes = document.querySelectorAll('*').length;
    
    // Resource usage estimation
    calculateResourceUsage();
  }

  // Calculate Resource Usage
  function calculateResourceUsage() {
    if (!window.performance || !performance.getEntriesByType) return;
    
    const resources = performance.getEntriesByType('resource');
    let jsSize = 0;
    let cssSize = 0;
    let imgSize = 0;
    
    resources.forEach(r => {
      const size = r.transferSize || 0;
      if (r.name.endsWith('.js')) {
        jsSize += size;
      } else if (r.name.endsWith('.css')) {
        cssSize += size;
      } else if (r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        imgSize += size;
      }
    });
    
    state.metrics.resources = {
      js: jsSize / 1048576,
      css: cssSize / 1024,
      img: imgSize / 1048576
    };
  }

  // Calculate Overall Score
  function calculateScore() {
    let score = 100;
    
    // Load time scoring
    if (state.metrics.loadTime > 3000) score -= 15;
    else if (state.metrics.loadTime > 2000) score -= 10;
    else if (state.metrics.loadTime > 1000) score -= 5;
    
    // FCP scoring
    if (state.metrics.firstContentfulPaint > 3000) score -= 15;
    else if (state.metrics.firstContentfulPaint > 1800) score -= 10;
    else if (state.metrics.firstContentfulPaint > 1000) score -= 5;
    
    // CLS scoring
    if (state.metrics.cumulativeLayoutShift > 0.25) score -= 15;
    else if (state.metrics.cumulativeLayoutShift > 0.1) score -= 10;
    
    // Memory scoring
    if (state.metrics.memory.used > 100) score -= 10;
    else if (state.metrics.memory.used > 50) score -= 5;
    
    // DOM complexity scoring
    if (state.metrics.domNodes > 1500) score -= 10;
    else if (state.metrics.domNodes > 800) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }

  // Update Display
  function updateDisplay() {
    // Calculate score
    const score = calculateScore();
    const ring = document.getElementById('perfScoreRing');
    const scoreValue = document.getElementById('perfScoreValue');
    const scoreBadge = document.getElementById('perfScoreBadge');
    
    if (ring) {
      const circumference = 2 * Math.PI * 42;
      const offset = circumference - (score / 100) * circumference;
      ring.style.strokeDashoffset = offset;
    }
    
    if (scoreValue) {
      scoreValue.innerHTML = `${Math.round(score)}<span>/100</span>`;
    }
    
    if (scoreBadge) {
      scoreBadge.className = 'perf-score-badge';
      if (score >= 90) {
        scoreBadge.classList.add('excellent');
        scoreBadge.textContent = 'Excellent';
      } else if (score >= 70) {
        scoreBadge.classList.add('good');
        scoreBadge.textContent = 'Good';
      } else {
        scoreBadge.classList.add('needs-improvement');
        scoreBadge.textContent = 'Needs Work';
      }
    }
    
    // Update metrics
    const loadTimeEl = document.getElementById('perfLoadTime');
    if (loadTimeEl) {
      loadTimeEl.textContent = (state.metrics.loadTime / 1000).toFixed(2) + 's';
    }
    
    const memoryEl = document.getElementById('perfMemory');
    if (memoryEl && state.metrics.memory.used) {
      memoryEl.textContent = state.metrics.memory.used;
    }
    
    const fpsEl = document.getElementById('perfFps');
    if (fpsEl && state.fpsHistory.length > 0) {
      const avgFps = Math.round(state.fpsHistory.reduce((a, b) => a + b, 0) / state.fpsHistory.length);
      fpsEl.textContent = avgFps;
    }
    
    const fpsLabel = document.getElementById('perfFpsLabel');
    if (fpsLabel) {
      fpsLabel.textContent = state.fpsHistory[state.fpsHistory.length - 1] + ' FPS';
    }
    
    const domNodesEl = document.getElementById('perfDomNodes');
    if (domNodesEl) {
      domNodesEl.textContent = state.metrics.domNodes;
    }
    
    // Update resource bars
    if (state.metrics.resources) {
      updateResourceBar('perfJsSize', 'perfJsBar', state.metrics.resources.js, ' MB', 5);
      updateResourceBar('perfCssSize', 'perfCssBar', state.metrics.resources.css, ' KB', 100);
      updateResourceBar('perfImgSize', 'perfImgBar', state.metrics.resources.img, ' MB', 10);
    }
    
    // Draw graph
    drawFpsGraph();
  }

  // Update Resource Bar
  function updateResourceBar(sizeId, barId, value, unit, max) {
    const sizeEl = document.getElementById(sizeId);
    const barEl = document.getElementById(barId);
    
    if (sizeEl) {
      sizeEl.textContent = value.toFixed(2) + unit;
    }
    
    if (barEl) {
      const pct = Math.min(100, (value / max) * 100);
      barEl.style.width = pct + '%';
      
      barEl.className = 'perf-resource-fill';
      if (pct < 50) {
        barEl.classList.add('low');
      } else if (pct < 80) {
        barEl.classList.add('medium');
      } else {
        barEl.classList.add('high');
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API
  window.PerformanceMonitor = {
    toggle: toggleDashboard,
    close: closeDashboard,
    getMetrics: () => state.metrics,
    getScore: calculateScore
  };

})();
