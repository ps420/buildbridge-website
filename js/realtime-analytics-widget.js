/**
 * v71.1: REAL-TIME ANALYTICS WIDGET
 * Fortune 500 Live Metrics Dashboard
 * 
 * Simulates and displays real-time visitor analytics:
 * - Active visitors
 * - Page views per minute
 * - Average session duration
 * - Bounce rate
 * - Live activity graph
 */

class RealtimeAnalyticsWidget {
  constructor() {
    this.metrics = {
      activeVisitors: Math.floor(Math.random() * 50) + 10,
      pageViewsPerMin: Math.floor(Math.random() * 100) + 50,
      avgSessionDuration: Math.floor(Math.random() * 300) + 60,
      bounceRate: Math.floor(Math.random() * 30) + 30
    };
    
    this.activityHistory = new Array(20).fill(0).map(() => Math.floor(Math.random() * 100));
    this.isVisible = false;
    this.updateInterval = null;
    
    this.init();
  }
  
  init() {
    this.createWidget();
    this.attachEventListeners();
    this.startSimulation();
    
    // Show tab after a delay
    setTimeout(() => {
      this.showTab();
    }, 3000);
  }
  
  createWidget() {
    if (document.querySelector('.realtime-analytics-widget')) return;
    
    const widget = document.createElement('div');
    widget.className = 'realtime-analytics-widget';
    widget.innerHTML = `
      <div class="realtime-analytics-header">
        <div class="realtime-analytics-title">Live Analytics</div>
        <button class="realtime-analytics-minimize" aria-label="Minimize analytics">−</button>
      </div>
      <div class="realtime-analytics-metrics">
        <div class="analytics-metric" data-metric="visitors">
          <div class="analytics-icon">👥</div>
          <div class="analytics-info">
            <div class="analytics-label">Active Visitors</div>
            <div class="analytics-value">
              <span class="value">${this.metrics.activeVisitors}</span>
              <span class="analytics-change positive">+${Math.floor(Math.random() * 10)}%</span>
            </div>
          </div>
        </div>
        <div class="analytics-metric" data-metric="pageviews">
          <div class="analytics-icon">📄</div>
          <div class="analytics-info">
            <div class="analytics-label">Page Views / min</div>
            <div class="analytics-value">
              <span class="value">${this.metrics.pageViewsPerMin}</span>
              <span class="analytics-change positive">+${Math.floor(Math.random() * 15)}%</span>
            </div>
          </div>
        </div>
        <div class="analytics-metric" data-metric="duration">
          <div class="analytics-icon">⏱️</div>
          <div class="analytics-info">
            <div class="analytics-label">Avg. Session</div>
            <div class="analytics-value">
              <span class="value">${this.formatDuration(this.metrics.avgSessionDuration)}</span>
              <span class="analytics-change neutral">0%</span>
            </div>
          </div>
        </div>
        <div class="analytics-metric" data-metric="bounce">
          <div class="analytics-icon">📊</div>
          <div class="analytics-info">
            <div class="analytics-label">Bounce Rate</div>
            <div class="analytics-value">
              <span class="value">${this.metrics.bounceRate}%</span>
              <span class="analytics-change negative">-${Math.floor(Math.random() * 5)}%</span>
            </div>
          </div>
        </div>
      </div>
      <div class="analytics-activity">
        <div class="analytics-activity-header">
          <span class="analytics-activity-title">Live Activity</span>
          <span class="analytics-activity-value">High</span>
        </div>
        <div class="analytics-graph">
          ${this.activityHistory.map((val, i) => `
            <div class="analytics-graph-bar ${i === this.activityHistory.length - 1 ? 'active' : ''}" 
                 style="height: ${val}%"></div>
          `).join('')}
        </div>
      </div>
      <div class="session-replay-indicator">
        <div class="session-replay-dot"></div>
        <span class="session-replay-text">Session recording active</span>
      </div>
    `;
    
    const tab = document.createElement('button');
    tab.className = 'realtime-analytics-tab';
    tab.innerHTML = 'Live Stats';
    tab.setAttribute('aria-label', 'Open live analytics');
    
    document.body.appendChild(widget);
    document.body.appendChild(tab);
    
    this.widget = widget;
    this.tab = tab;
  }
  
  attachEventListeners() {
    // Tab click to show
    this.tab.addEventListener('click', () => this.show());
    
    // Minimize button
    this.widget.querySelector('.realtime-analytics-minimize').addEventListener('click', () => {
      this.hide();
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }
  
  showTab() {
    this.tab.classList.add('visible');
  }
  
  show() {
    this.widget.classList.add('active');
    this.tab.classList.remove('visible');
    this.isVisible = true;
  }
  
  hide() {
    this.widget.classList.remove('active');
    this.showTab();
    this.isVisible = false;
  }
  
  startSimulation() {
    // Update metrics every 3-8 seconds (random)
    const scheduleNextUpdate = () => {
      const delay = Math.random() * 5000 + 3000;
      setTimeout(() => {
        this.updateMetrics();
        scheduleNextUpdate();
      }, delay);
    };
    
    scheduleNextUpdate();
    
    // Update activity graph every second
    setInterval(() => {
      this.updateActivityGraph();
    }, 1000);
  }
  
  updateMetrics() {
    // Simulate realistic changes
    const visitorsChange = Math.floor(Math.random() * 10) - 5;
    this.metrics.activeVisitors = Math.max(5, this.metrics.activeVisitors + visitorsChange);
    
    const viewsChange = Math.floor(Math.random() * 20) - 10;
    this.metrics.pageViewsPerMin = Math.max(20, this.metrics.pageViewsPerMin + viewsChange);
    
    const durationChange = Math.floor(Math.random() * 20) - 10;
    this.metrics.avgSessionDuration = Math.max(30, this.metrics.avgSessionDuration + durationChange);
    
    const bounceChange = Math.floor(Math.random() * 6) - 3;
    this.metrics.bounceRate = Math.max(10, Math.min(90, this.metrics.bounceRate + bounceChange));
    
    this.updateDisplay();
  }
  
  updateDisplay() {
    // Update visitors
    const visitorsEl = this.widget.querySelector('[data-metric="visitors"] .value');
    if (visitorsEl) visitorsEl.textContent = this.metrics.activeVisitors;
    
    // Update page views
    const viewsEl = this.widget.querySelector('[data-metric="pageviews"] .value');
    if (viewsEl) viewsEl.textContent = this.metrics.pageViewsPerMin;
    
    // Update duration
    const durationEl = this.widget.querySelector('[data-metric="duration"] .value');
    if (durationEl) durationEl.textContent = this.formatDuration(this.metrics.avgSessionDuration);
    
    // Update bounce rate
    const bounceEl = this.widget.querySelector('[data-metric="bounce"] .value');
    if (bounceEl) bounceEl.textContent = this.metrics.bounceRate + '%';
  }
  
  updateActivityGraph() {
    // Shift history and add new value
    this.activityHistory.shift();
    const newValue = Math.floor(Math.random() * 80) + 20;
    this.activityHistory.push(newValue);
    
    // Update bars
    const bars = this.widget.querySelectorAll('.analytics-graph-bar');
    bars.forEach((bar, index) => {
      const value = this.activityHistory[index];
      bar.style.height = `${value}%`;
      bar.classList.toggle('active', index === bars.length - 1);
    });
    
    // Update activity status
    const avgActivity = this.activityHistory.reduce((a, b) => a + b, 0) / this.activityHistory.length;
    const statusEl = this.widget.querySelector('.analytics-activity-value');
    
    if (statusEl) {
      if (avgActivity > 70) {
        statusEl.textContent = 'Very High';
        statusEl.style.color = '#ef4444';
      } else if (avgActivity > 40) {
        statusEl.textContent = 'High';
        statusEl.style.color = '#22c55e';
      } else {
        statusEl.textContent = 'Normal';
        statusEl.style.color = '#C9CED6';
      }
    }
  }
  
  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  
  // Public API
  getMetrics() {
    return { ...this.metrics };
  }
  
  setVisible(visible) {
    visible ? this.show() : this.hide();
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.realtimeAnalytics = new RealtimeAnalyticsWidget();
  });
} else {
  window.realtimeAnalytics = new RealtimeAnalyticsWidget();
}
