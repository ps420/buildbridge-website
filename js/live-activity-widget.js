/**
 * Live Activity Widget v64.0
 * Real-time visitor activity simulation
 * Fortune 500 Quality Social Proof System
 */

class LiveActivityWidget {
  constructor(options = {}) {
    this.options = {
      position: 'bottom-left',
      maxItems: 3,
      updateInterval: 4000,
      simulationMode: true,
      ...options
    };
    
    this.activities = [];
    this.widget = null;
    this.isVisible = false;
    this.isCollapsed = false;
    this.totalVisitors = 0;
    
    // Sample activity data for simulation
    this.activityTypes = [
      { type: 'viewing', icon: '👁️', actions: [
        'viewing Modern Residential',
        'viewing Corporate HQ project',
        'browsing services',
        'viewing about page',
        'checking team section'
      ]},
      { type: 'inquiry', icon: '✉️', actions: [
        'sent project inquiry',
        'requested consultation',
        'submitted contact form',
        'asked about pricing'
      ]},
      { type: 'quote', icon: '💰', actions: [
        'requested quote',
        'calculating project cost',
        'comparing projects'
      ]},
      { type: 'booking', icon: '📅', actions: [
        'scheduled consultation',
        'booked site visit',
        'requested callback'
      ]}
    ];
    
    this.locations = [
      'Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 
      'Port Elizabeth', 'Bloemfontein', 'Nelspruit', 'Polokwane'
    ];
    
    this.init();
  }
  
  init() {
    this.createWidget();
    this.bindEvents();
    
    // Show widget after delay
    setTimeout(() => this.show(), 2000);
    
    // Start simulation
    if (this.options.simulationMode) {
      this.startSimulation();
    }
    
    // Update visitor count
    this.updateVisitorCount();
  }
  
  createWidget() {
    this.widget = document.createElement('div');
    this.widget.className = 'live-activity-widget';
    this.widget.setAttribute('role', 'complementary');
    this.widget.setAttribute('aria-label', 'Live Activity');
    
    this.widget.innerHTML = `
      <div class="live-activity-header">
        <div class="live-activity-pulse" aria-hidden="true"></div>
        <span class="live-activity-title">Live Activity</span>
        <span class="live-activity-count" id="visitor-count">0 online</span>
      </div>
      <div class="live-activity-content" id="activity-content">
        <!-- Activity items will be inserted here -->
      </div>
      <div class="live-activity-footer">
        <span class="live-activity-stats"><strong id="total-views">0</strong> views today</span>
        <button class="live-activity-toggle" aria-label="Toggle activity feed">
          <span class="toggle-icon">−</span>
        </button>
      </div>
    `;
    
    document.body.appendChild(this.widget);
    
    // Cache elements
    this.contentEl = this.widget.querySelector('#activity-content');
    this.countEl = this.widget.querySelector('#visitor-count');
    this.viewsEl = this.widget.querySelector('#total-views');
    this.toggleBtn = this.widget.querySelector('.live-activity-toggle');
  }
  
  bindEvents() {
    // Toggle collapse
    this.toggleBtn.addEventListener('click', () => this.toggle());
    
    // Track real page views if analytics available
    this.trackPageView();
  }
  
  show() {
    this.isVisible = true;
    this.widget.classList.add('visible');
    
    // Add initial activities
    this.addActivity();
    setTimeout(() => this.addActivity(), 1500);
  }
  
  hide() {
    this.isVisible = false;
    this.widget.classList.remove('visible');
  }
  
  toggle() {
    this.isCollapsed = !this.isCollapsed;
    this.widget.classList.toggle('collapsed', this.isCollapsed);
    
    const icon = this.toggleBtn.querySelector('.toggle-icon');
    icon.textContent = this.isCollapsed ? '+' : '−';
    this.toggleBtn.setAttribute('aria-expanded', !this.isCollapsed);
  }
  
  addActivity() {
    const activityType = this.getRandomActivityType();
    const action = this.getRandomAction(activityType);
    const location = this.getRandomLocation();
    const time = 'just now';
    
    const activity = {
      id: Date.now() + Math.random(),
      type: activityType.type,
      icon: activityType.icon,
      action,
      location,
      time
    };
    
    this.activities.unshift(activity);
    
    // Keep max items
    if (this.activities.length > this.options.maxItems) {
      this.activities.pop();
    }
    
    this.render();
  }
  
  render() {
    this.contentEl.innerHTML = this.activities.map(activity => `
      <div class="live-activity-item ${activity.type}">
        <div class="live-activity-avatar">${activity.icon}</div>
        <div class="live-activity-text">
          <span class="live-activity-action">${activity.action}</span>
          <span class="live-activity-location">
            <span>📍</span> ${activity.location}
          </span>
        </div>
        <span class="live-activity-time">${activity.time}</span>
      </div>
    `).join('');
    
    // Animate items
    const items = this.contentEl.querySelectorAll('.live-activity-item');
    items.forEach((item, index) => {
      item.style.animationDelay = `${index * 0.1}s`;
    });
  }
  
  startSimulation() {
    // Add new activity periodically
    setInterval(() => {
      if (Math.random() > 0.3) {
        this.addActivity();
      }
    }, this.options.updateInterval);
    
    // Update visitor count periodically
    setInterval(() => this.updateVisitorCount(), 10000);
    
    // Update "time ago" periodically
    setInterval(() => this.updateTimes(), 60000);
  }
  
  updateTimes() {
    this.activities = this.activities.map(activity => ({
      ...activity,
      time: this.getTimeAgo(activity.id)
    }));
    this.render();
  }
  
  getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 120) return '1m ago';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  }
  
  updateVisitorCount() {
    // Simulate realistic visitor count (between 3 and 15)
    const baseCount = 3;
    const random = Math.floor(Math.random() * 12);
    this.totalVisitors = baseCount + random;
    
    if (this.countEl) {
      this.countEl.textContent = `${this.totalVisitors} online`;
    }
    
    // Update total views with slight increment
    if (this.viewsEl) {
      const currentViews = parseInt(this.viewsEl.textContent) || 1247;
      const increment = Math.floor(Math.random() * 5);
      this.viewsEl.textContent = (currentViews + increment).toLocaleString();
    }
  }
  
  getRandomActivityType() {
    const weights = [0.6, 0.2, 0.15, 0.05]; // viewing, inquiry, quote, booking
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return this.activityTypes[i];
      }
    }
    
    return this.activityTypes[0];
  }
  
  getRandomAction(activityType) {
    const actions = activityType.actions;
    return actions[Math.floor(Math.random() * actions.length)];
  }
  
  getRandomLocation() {
    return this.locations[Math.floor(Math.random() * this.locations.length)];
  }
  
  trackPageView() {
    // Get from localStorage or start fresh
    let views = parseInt(localStorage.getItem('bb_page_views')) || 1247;
    views++;
    localStorage.setItem('bb_page_views', views);
    
    if (this.viewsEl) {
      this.viewsEl.textContent = views.toLocaleString();
    }
  }
  
  destroy() {
    if (this.widget) {
      this.widget.remove();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.liveActivity = new LiveActivityWidget({
    position: 'bottom-left',
    maxItems: 3,
    updateInterval: 5000,
    simulationMode: true
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LiveActivityWidget;
}
