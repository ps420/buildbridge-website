/**
 * Project Analytics Dashboard - v82.2
 * Fortune 500 Real-Time Metrics Visualization
 * Features: Live data simulation, interactive charts, real-time updates
 */

class ProjectAnalyticsDashboard {
  constructor() {
    this.widget = null;
    this.isOpen = false;
    this.isMinimized = false;
    this.metrics = {
      projects: { value: 156, trend: 12, target: 200 },
      value: { value: 52.8, suffix: 'M', trend: 18, target: 75 },
      satisfaction: { value: 98.4, suffix: '%', trend: 2.1, target: 99 },
      timeline: { value: 94, suffix: '%', trend: -2, target: 95 }
    };
    this.projectStatus = {
      active: 23,
      pending: 8,
      completed: 125
    };
    this.regionalData = [
      { region: 'WC', value: 45, label: 'Western Cape' },
      { region: 'GP', value: 62, label: 'Gauteng' },
      { region: 'KZN', value: 28, label: 'KwaZulu-Natal' },
      { region: 'EC', value: 15, label: 'Eastern Cape' },
      { region: 'Other', value: 6, label: 'Other' }
    ];
    this.activities = [];
    this.chartData = this.generateChartData();
    
    this.init();
  }

  init() {
    this.createWidget();
    this.attachEventListeners();
    this.startRealtimeUpdates();
    this.generateActivities();
    
    // Show widget after delay
    setTimeout(() => this.show(), 3000);
  }

  generateChartData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return {
      projects: months.map(() => Math.floor(Math.random() * 30) + 15),
      value: months.map(() => Math.floor(Math.random() * 15) + 5)
    };
  }

  createWidget() {
    this.widget = document.createElement('div');
    this.widget.className = 'analytics-dashboard-widget';
    this.widget.innerHTML = `
      <div class="analytics-header">
        <div class="analytics-title">
          <div class="analytics-icon">📊</div>
          <div class="analytics-title-text">
            <h4>Project Analytics</h4>
            <span>Real-time metrics</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="analytics-live-badge">
            <span class="analytics-live-dot"></span>
            <span>Live</span>
          </div>
          <button class="analytics-toggle" aria-label="Toggle dashboard">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="analytics-content">
        ${this.renderMetricsGrid()}
        ${this.renderChart()}
        ${this.renderProjectStatus()}
        ${this.renderRegionalDistribution()}
        ${this.renderActivityTimeline()}
      </div>
    `;
    
    document.body.appendChild(this.widget);
    
    // Create toggle button
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.className = 'analytics-toggle-widget';
    this.toggleBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 3v18h18"/>
        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
      </svg>
    `;
    this.toggleBtn.addEventListener('click', () => this.show());
    document.body.appendChild(this.toggleBtn);
  }

  renderMetricsGrid() {
    return `
      <div class="analytics-metrics-grid">
        <div class="analytics-metric-card projects">
          <div class="analytics-metric-label">Projects</div>
          <div class="analytics-metric-value" data-metric="projects">
            ${this.metrics.projects.value}+
          </div>
          <div class="analytics-metric-trend up">
            <span>↑</span> ${this.metrics.projects.trend}% this month
          </div>
        </div>
        <div class="analytics-metric-card value">
          <div class="analytics-metric-label">Value Managed</div>
          <div class="analytics-metric-value" data-metric="value">
            R${this.metrics.value.value}${this.metrics.value.suffix}
          </div>
          <div class="analytics-metric-trend up">
            <span>↑</span> ${this.metrics.value.trend}% this quarter
          </div>
        </div>
        <div class="analytics-metric-card satisfaction">
          <div class="analytics-metric-label">Satisfaction</div>
          <div class="analytics-metric-value" data-metric="satisfaction">
            ${this.metrics.satisfaction.value}${this.metrics.satisfaction.suffix}
          </div>
          <div class="analytics-metric-trend up">
            <span>↑</span> ${this.metrics.satisfaction.trend}%
          </div>
        </div>
        <div class="analytics-metric-card timeline">
          <div class="analytics-metric-label">On-Time Delivery</div>
          <div class="analytics-metric-value" data-metric="timeline">
            ${this.metrics.timeline.value}${this.metrics.timeline.suffix}
          </div>
          <div class="analytics-metric-trend down">
            <span>↓</span> ${Math.abs(this.metrics.timeline.trend)}%
          </div>
        </div>
      </div>
    `;
  }

  renderChart() {
    const maxValue = Math.max(...this.chartData.projects);
    const points = this.chartData.projects.map((value, index) => {
      const x = (index / (this.chartData.projects.length - 1)) * 100;
      const y = 100 - (value / maxValue) * 80;
      return `${x},${y}`;
    }).join(' ');
    
    return `
      <div class="analytics-chart-section">
        <div class="analytics-chart-header">
          <h5>Project Pipeline</h5>
          <div class="analytics-chart-legend">
            <div class="analytics-legend-item">
              <div class="analytics-legend-dot" style="background: #60a5fa;"></div>
              <span>Projects</span>
            </div>
            <div class="analytics-legend-item">
              <div class="analytics-legend-dot" style="background: #34d399;"></div>
              <span>Value</span>
            </div>
          </div>
        </div>
        <div class="analytics-chart-container">
          <svg class="analytics-chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-gradient-projects" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:0" />
              </linearGradient>
            </defs>
            <polyline class="analytics-chart-line" points="${points}" stroke="#60a5fa" />
            <polygon class="analytics-chart-area" points="0,100 ${points} 100,100" fill="url(#chart-gradient-projects)" />
          </svg>
        </div>
      </div>
    `;
  }

  renderProjectStatus() {
    return `
      <div class="analytics-status-section">
        <h5 class="analytics-status-header">Project Status</h5>
        <div class="analytics-status-list">
          <div class="analytics-status-item">
            <div class="analytics-status-bar active"></div>
            <div class="analytics-status-info">
              <div class="analytics-status-name">Active Projects</div>
              <div class="analytics-status-count">Currently in progress</div>
            </div>
            <div class="analytics-status-value" data-status="active">${this.projectStatus.active}</div>
          </div>
          <div class="analytics-status-item">
            <div class="analytics-status-bar pending"></div>
            <div class="analytics-status-info">
              <div class="analytics-status-name">Pending Review</div>
              <div class="analytics-status-count">Awaiting approval</div>
            </div>
            <div class="analytics-status-value" data-status="pending">${this.projectStatus.pending}</div>
          </div>
          <div class="analytics-status-item">
            <div class="analytics-status-bar completed"></div>
            <div class="analytics-status-info">
              <div class="analytics-status-name">Completed</div>
              <div class="analytics-status-count">Successfully delivered</div>
            </div>
            <div class="analytics-status-value" data-status="completed">${this.projectStatus.completed}</div>
          </div>
        </div>
      </div>
    `;
  }

  renderRegionalDistribution() {
    const maxValue = Math.max(...this.regionalData.map(d => d.value));
    
    return `
      <div class="analytics-regional-section">
        <h5 class="analytics-regional-header">Regional Distribution</h5>
        <div class="analytics-regional-chart">
          ${this.regionalData.map(data => `
            <div class="analytics-regional-bar">
              <div class="analytics-regional-bar-fill" 
                   style="height: ${(data.value / maxValue) * 100}%" 
                   data-value="${data.value}"></div>
              <span class="analytics-regional-bar-label">${data.region}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderActivityTimeline() {
    return `
      <div class="analytics-activity-section">
        <div class="analytics-activity-header">
          <h5>Recent Activity</h5>
          <button class="analytics-activity-refresh" aria-label="Refresh">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
        </div>
        <div class="analytics-activity-list">
          ${this.activities.slice(0, 4).map(activity => `
            <div class="analytics-activity-item">
              <div class="analytics-activity-icon">${activity.icon}</div>
              <div class="analytics-activity-content">
                <div class="analytics-activity-text">${activity.text}</div>
                <div class="analytics-activity-time">${activity.time}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  generateActivities() {
    const activityTypes = [
      { icon: '🏗️', text: 'New <strong>commercial project</strong> started in Sandton', timeOffset: 2 },
      { icon: '✅', text: '<strong>Luxury villa</strong> completed in Camps Bay', timeOffset: 5 },
      { icon: '💰', text: '<strong>R2.5M milestone</strong> reached on Waterfront project', timeOffset: 8 },
      { icon: '🤝', text: 'New <strong>contractor partnership</strong> signed', timeOffset: 12 },
      { icon: '📋', text: '<strong>5 permits approved</strong> for Pretoria development', timeOffset: 15 },
      { icon: '⭐', text: '5-star review from <strong>Cape Town client</strong>', timeOffset: 20 }
    ];
    
    this.activities = activityTypes.map(activity => ({
      ...activity,
      time: this.getTimeAgo(activity.timeOffset)
    }));
  }

  getTimeAgo(minutes) {
    if (minutes < 5) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  }

  attachEventListeners() {
    // Header click to minimize
    const header = this.widget.querySelector('.analytics-header');
    header.addEventListener('click', (e) => {
      if (!e.target.closest('.analytics-toggle')) {
        this.toggleMinimize();
      }
    });
    
    // Toggle button
    const toggle = this.widget.querySelector('.analytics-toggle');
    toggle.addEventListener('click', () => this.toggleMinimize());
    
    // Refresh button
    const refresh = this.widget.querySelector('.analytics-activity-refresh');
    if (refresh) {
      refresh.addEventListener('click', () => {
        refresh.style.animation = 'spin 0.5s linear';
        setTimeout(() => {
          refresh.style.animation = '';
          this.refreshData();
        }, 500);
      });
    }
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.widget.classList.toggle('minimized', this.isMinimized);
    
    const toggle = this.widget.querySelector('.analytics-toggle svg');
    if (toggle) {
      toggle.style.transform = this.isMinimized ? 'rotate(180deg)' : '';
    }
  }

  startRealtimeUpdates() {
    // Simulate live updates
    setInterval(() => {
      this.simulateMetricUpdate();
    }, 5000);
    
    // Add new activity occasionally
    setInterval(() => {
      if (Math.random() > 0.7) {
        this.addNewActivity();
      }
    }, 15000);
  }

  simulateMetricUpdate() {
    // Randomly update a metric
    const metrics = Object.keys(this.metrics);
    const randomMetric = metrics[Math.floor(Math.random() * metrics.length)];
    const metric = this.metrics[randomMetric];
    
    // Small random change
    const change = (Math.random() - 0.5) * 0.5;
    metric.value = Math.max(0, metric.value + change);
    
    // Update DOM
    const element = this.widget.querySelector(`[data-metric="${randomMetric}"]`);
    if (element) {
      element.style.transform = 'scale(1.05)';
      element.style.color = change > 0 ? '#34d399' : '#f87171';
      setTimeout(() => {
        element.textContent = randomMetric === 'value' 
          ? `R${metric.value.toFixed(1)}${metric.suffix}` 
          : `${metric.value.toFixed(1)}${metric.suffix}`;
        element.style.transform = '';
        element.style.color = '';
      }, 200);
    }
  }

  addNewActivity() {
    const newActivities = [
      { icon: '📞', text: 'New <strong>consultation request</strong> from Johannesburg' },
      { icon: '🏆', text: '<strong>Industry award</strong> nomination received' },
      { icon: '📈', text: 'Website traffic <strong>+23%</strong> this week' },
      { icon: '🔨', text: 'New <strong>equipment</strong> added to fleet' }
    ];
    
    const activity = newActivities[Math.floor(Math.random() * newActivities.length)];
    this.activities.unshift({
      ...activity,
      time: 'Just now'
    });
    
    if (this.activities.length > 10) {
      this.activities.pop();
    }
    
    // Update activity list
    const activityList = this.widget.querySelector('.analytics-activity-list');
    if (activityList) {
      activityList.innerHTML = this.activities.slice(0, 4).map(a => `
        <div class="analytics-activity-item">
          <div class="analytics-activity-icon">${a.icon}</div>
          <div class="analytics-activity-content">
            <div class="analytics-activity-text">${a.text}</div>
            <div class="analytics-activity-time">${a.time}</div>
          </div>
        </div>
      `).join('');
    }
  }

  refreshData() {
    // Simulate data refresh
    this.metrics.projects.value = 156 + Math.floor(Math.random() * 10);
    this.metrics.value.value = 52.8 + (Math.random() * 5);
    
    // Update DOM
    const metrics = this.widget.querySelectorAll('.analytics-metric-value');
    metrics.forEach(el => {
      el.style.opacity = '0.5';
      setTimeout(() => {
        el.style.opacity = '1';
      }, 300);
    });
    
    this.generateActivities();
    const activityList = this.widget.querySelector('.analytics-activity-list');
    if (activityList) {
      activityList.innerHTML = this.renderActivityTimeline();
    }
  }

  show() {
    this.isOpen = true;
    this.widget.classList.add('active');
    this.toggleBtn.classList.add('hidden');
    this.isMinimized = false;
    this.widget.classList.remove('minimized');
  }

  hide() {
    this.isOpen = false;
    this.widget.classList.remove('active');
    this.toggleBtn.classList.remove('hidden');
  }

  toggle() {
    if (this.isOpen) this.hide();
    else this.show();
  }
}

// Add spin animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.BuildBridgeAnalytics = new ProjectAnalyticsDashboard();
  });
} else {
  window.BuildBridgeAnalytics = new ProjectAnalyticsDashboard();
}

console.log('📊 BuildBridge v82.2: Project Analytics Dashboard loaded - Fortune 500 real-time metrics visualization');
