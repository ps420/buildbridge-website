/**
 * v98.0: Real-time Activity Stream
 * Fortune 500 Quality - WebSocket Simulation, Live Activity Feed
 * Creates a sense of live, ongoing work and engagement
 */
(function() {
  'use strict';

  class RealtimeActivityStream {
    constructor(options = {}) {
      this.options = {
        container: options.container || '#activity-stream',
        maxItems: options.maxItems || 8,
        updateInterval: options.updateInterval || 5000,
        simulationMode: options.simulationMode !== false,
        showEngagementMetrics: options.showEngagementMetrics !== false,
        ...options
      };

      this.activities = [];
      this.isRunning = false;
      this.simulationInterval = null;
      this.engagementMetrics = {
        visitors: 0,
        projectsViewed: 0,
        quotesRequested: 0,
        lastUpdate: Date.now()
      };

      // Activity templates
      this.activityTypes = [
        { icon: '👁️', text: 'Someone viewed {project}', type: 'view' },
        { icon: '📊', text: '{name} requested a quote', type: 'quote' },
        { icon: '🏗️', text: 'New project started: {location}', type: 'project' },
        { icon: '⭐', text: 'New 5-star review received', type: 'review' },
        { icon: '📞', text: 'Consultation call scheduled', type: 'call' },
        { icon: '💬', text: 'New inquiry from {location}', type: 'inquiry' },
        { icon: '📍', text: 'Site visit completed in {location}', type: 'visit' },
        { icon: '🎯', text: 'Project milestone reached', type: 'milestone' }
      ];

      this.names = ['John', 'Sarah', 'Mike', 'Lisa', 'David', 'Emma', 'Chris', 'Anna', 'Tom', 'Jane'];
      this.projects = ['Cape Town Villa', 'Sandton Office', 'Sea Point Condo', 'Stellenbosch Estate', 'Durban Complex'];
      this.locations = ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth', 'Stellenbosch', 'Sandton'];

      this.init();
    }

    init() {
      this.createDOM();
      this.startSimulation();
      this.startEngagementMetrics();
      
      console.log('📡 BuildBridge v98.0: Real-time Activity Stream initialized');
    }

    createDOM() {
      const container = document.querySelector(this.options.container);
      if (!container) return;

      container.innerHTML = `
        <div class="activity-stream-widget">
          <div class="activity-stream-header">
            <div class="activity-status">
              <span class="live-pulse"></span>
              <span class="status-text">LIVE</span>
            </div>
            <h4 class="activity-title">Recent Activity</h4>
            <button class="activity-toggle" aria-label="Toggle activity panel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </div>
          
          <div class="activity-stream-content">
            <ul class="activity-list"></ul>
            
            ${this.options.showEngagementMetrics ? `
              <div class="engagement-metrics">
                <div class="metric-item">
                  <span class="metric-icon">👥</span>
                  <div class="metric-info">
                    <span class="metric-value" data-metric="visitors">24</span>
                    <span class="metric-label">Active visitors</span>
                  </div>
                </div>
                <div class="metric-item">
                  <span class="metric-icon">📈</span>
                  <div class="metric-info">
                    <span class="metric-value" data-metric="projects">156</span>
                    <span class="metric-label">Projects viewed today</span>
                  </div>
                </div>
                <div class="metric-item">
                  <span class="metric-icon">📋</span>
                  <div class="metric-info">
                    <span class="metric-value" data-metric="quotes">12</span>
                    <span class="metric-label">Quotes requested</span>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
          
          <div class="activity-stream-footer">
            <span class="last-updated">Updated just now</span>
          </div>
        </div>
      `;

      this.addStyles();
      this.attachEvents();
    }

    addStyles() {
      const style = document.createElement('style');
      style.textContent = `
        /* ===== ACTIVITY STREAM WIDGET ===== */
        .activity-stream-widget {
          background: rgba(15, 15, 16, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(201, 206, 214, 0.1);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(201, 206, 214, 0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .activity-stream-widget:hover {
          border-color: rgba(201, 206, 214, 0.2);
          box-shadow: 
            0 30px 60px -12px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(201, 206, 214, 0.1);
        }
        
        /* Header */
        .activity-stream-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(201, 206, 214, 0.1);
        }
        
        .activity-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 20px;
        }
        
        .live-pulse {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: livePulseActivity 2s ease-in-out infinite;
        }
        
        @keyframes livePulseActivity {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          50% { 
            opacity: 0.5; 
            transform: scale(0.8);
            box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
          }
        }
        
        .status-text {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #22c55e;
        }
        
        .activity-title {
          flex: 1;
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #F5F7FA;
          margin: 0;
        }
        
        .activity-toggle {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 206, 214, 0.1);
          border: none;
          border-radius: 8px;
          color: rgba(201, 206, 214, 0.8);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .activity-toggle:hover {
          background: rgba(201, 206, 214, 0.15);
          color: #F5F7FA;
        }
        
        .activity-toggle svg {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }
        
        .activity-stream-widget.collapsed .activity-toggle svg {
          transform: rotate(180deg);
        }
        
        /* Content */
        .activity-stream-content {
          padding: 16px 20px;
        }
        
        .activity-stream-widget.collapsed .activity-stream-content {
          display: none;
        }
        
        /* Activity List */
        .activity-list {
          list-style: none;
          margin: 0;
          padding: 0;
          max-height: 280px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(201, 206, 214, 0.2) transparent;
        }
        
        .activity-list::-webkit-scrollbar {
          width: 4px;
        }
        
        .activity-list::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .activity-list::-webkit-scrollbar-thumb {
          background: rgba(201, 206, 214, 0.2);
          border-radius: 2px;
        }
        
        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(201, 206, 214, 0.05);
          opacity: 0;
          transform: translateX(-20px);
          animation: activitySlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .activity-item:last-child {
          border-bottom: none;
        }
        
        @keyframes activitySlideIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .activity-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(201, 206, 214, 0.08);
          border-radius: 10px;
          font-size: 16px;
          flex-shrink: 0;
        }
        
        .activity-content {
          flex: 1;
          min-width: 0;
        }
        
        .activity-text {
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          color: rgba(245, 247, 250, 0.9);
          line-height: 1.4;
        }
        
        .activity-time {
          font-family: 'Poppins', sans-serif;
          font-size: 11px;
          color: rgba(201, 206, 214, 0.5);
          margin-top: 2px;
        }
        
        /* Engagement Metrics */
        .engagement-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(201, 206, 214, 0.1);
        }
        
        .metric-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: rgba(201, 206, 214, 0.05);
          border-radius: 12px;
          transition: all 0.3s ease;
        }
        
        .metric-item:hover {
          background: rgba(201, 206, 214, 0.08);
          transform: translateY(-2px);
        }
        
        .metric-icon {
          font-size: 20px;
        }
        
        .metric-info {
          display: flex;
          flex-direction: column;
        }
        
        .metric-value {
          font-family: 'Montserrat', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #F5F7FA;
          transition: all 0.3s ease;
        }
        
        .metric-value.updating {
          color: #22c55e;
          transform: scale(1.1);
        }
        
        .metric-label {
          font-family: 'Poppins', sans-serif;
          font-size: 10px;
          color: rgba(201, 206, 214, 0.5);
        }
        
        /* Footer */
        .activity-stream-footer {
          padding: 12px 20px;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid rgba(201, 206, 214, 0.05);
        }
        
        .last-updated {
          font-family: 'Poppins', sans-serif;
          font-size: 11px;
          color: rgba(201, 206, 214, 0.4);
        }
        
        /* Responsive */
        @media (max-width: 480px) {
          .engagement-metrics {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          
          .activity-stream-widget {
            border-radius: 16px;
          }
        }
        
        /* Toast notification for new activity */
        .activity-toast {
          position: fixed;
          bottom: 30px;
          right: 30px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: rgba(15, 15, 16, 0.98);
          border: 1px solid rgba(201, 206, 214, 0.1);
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10000;
          pointer-events: none;
        }
        
        .activity-toast.show {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        .activity-toast-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(34, 197, 94, 0.15);
          border-radius: 10px;
          font-size: 18px;
        }
        
        .activity-toast-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .activity-toast-text {
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          color: #F5F7FA;
        }
        
        .activity-toast-subtext {
          font-family: 'Poppins', sans-serif;
          font-size: 11px;
          color: rgba(201, 206, 214, 0.6);
        }
      `;
      document.head.appendChild(style);
    }

    attachEvents() {
      const container = document.querySelector(this.options.container);
      if (!container) return;

      const toggle = container.querySelector('.activity-toggle');
      if (toggle) {
        toggle.addEventListener('click', () => {
          container.querySelector('.activity-stream-widget').classList.toggle('collapsed');
        });
      }
    }

    generateActivity() {
      const type = this.activityTypes[Math.floor(Math.random() * this.activityTypes.length)];
      const name = this.names[Math.floor(Math.random() * this.names.length)];
      const project = this.projects[Math.floor(Math.random() * this.projects.length)];
      const location = this.locations[Math.floor(Math.random() * this.locations.length)];

      let text = type.text
        .replace('{name}', name)
        .replace('{project}', project)
        .replace('{location}', location);

      return {
        id: Date.now() + Math.random(),
        icon: type.icon,
        text: text,
        type: type.type,
        time: new Date(),
        timestamp: Date.now()
      };
    }

    addActivity(activity, showToast = false) {
      const container = document.querySelector(this.options.container);
      if (!container) return;

      const list = container.querySelector('.activity-list');
      if (!list) return;

      this.activities.unshift(activity);
      if (this.activities.length > this.options.maxItems) {
        this.activities.pop();
      }

      const item = document.createElement('li');
      item.className = 'activity-item';
      item.innerHTML = `
        <div class="activity-icon">${activity.icon}</div>
        <div class="activity-content">
          <div class="activity-text">${activity.text}</div>
          <div class="activity-time">Just now</div>
        </div>
      `;

      list.insertBefore(item, list.firstChild);

      // Remove old items
      while (list.children.length > this.options.maxItems) {
        list.removeChild(list.lastChild);
      }

      // Update timestamps
      this.updateTimestamps();

      // Show toast if enabled
      if (showToast) {
        this.showToast(activity);
      }
    }

    updateTimestamps() {
      const container = document.querySelector(this.options.container);
      if (!container) return;

      const items = container.querySelectorAll('.activity-item');
      items.forEach((item, index) => {
        const activity = this.activities[index];
        if (activity) {
          const timeEl = item.querySelector('.activity-time');
          if (timeEl) {
            timeEl.textContent = this.formatTime(activity.time);
          }
        }
      });
    }

    formatTime(date) {
      const now = new Date();
      const diff = Math.floor((now - date) / 1000);

      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    }

    showToast(activity) {
      // Remove existing toast
      const existing = document.querySelector('.activity-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.className = 'activity-toast';
      toast.innerHTML = `
        <div class="activity-toast-icon">${activity.icon}</div>
        <div class="activity-toast-content">
          <div class="activity-toast-text">${activity.text}</div>
          <div class="activity-toast-subtext">BuildBridge Activity</div>
        </div>
      `;

      document.body.appendChild(toast);

      // Trigger animation
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });

      // Remove after delay
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
      }, 4000);
    }

    updateMetrics() {
      const container = document.querySelector(this.options.container);
      if (!container) return;

      // Simulate metric updates
      const visitorsEl = container.querySelector('[data-metric="visitors"]');
      const projectsEl = container.querySelector('[data-metric="projects"]');
      const quotesEl = container.querySelector('[data-metric="quotes"]');

      if (visitorsEl) {
        const newValue = parseInt(visitorsEl.textContent) + Math.floor(Math.random() * 3);
        this.animateMetric(visitorsEl, newValue);
      }

      if (projectsEl) {
        const newValue = parseInt(projectsEl.textContent) + Math.floor(Math.random() * 2);
        this.animateMetric(projectsEl, newValue);
      }

      if (quotesEl && Math.random() > 0.7) {
        const newValue = parseInt(quotesEl.textContent) + 1;
        this.animateMetric(quotesEl, newValue);
      }

      // Update timestamp
      const lastUpdated = container.querySelector('.last-updated');
      if (lastUpdated) {
        lastUpdated.textContent = 'Updated just now';
      }
    }

    animateMetric(element, newValue) {
      element.classList.add('updating');
      setTimeout(() => {
        element.textContent = newValue;
        setTimeout(() => element.classList.remove('updating'), 300);
      }, 150);
    }

    startSimulation() {
      if (!this.options.simulationMode) return;

      // Initial activities
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const activity = this.generateActivity();
          activity.time = new Date(Date.now() - Math.random() * 3600000);
          this.addActivity(activity);
        }, i * 100);
      }

      // Periodic new activities
      this.simulationInterval = setInterval(() => {
        if (Math.random() > 0.3) {
          const activity = this.generateActivity();
          this.addActivity(activity, true);
        }
      }, this.options.updateInterval);
    }

    startEngagementMetrics() {
      setInterval(() => {
        this.updateMetrics();
        this.updateTimestamps();
      }, 30000);
    }

    stop() {
      if (this.simulationInterval) {
        clearInterval(this.simulationInterval);
        this.simulationInterval = null;
      }
      this.isRunning = false;
    }

    destroy() {
      this.stop();
      const container = document.querySelector(this.options.container);
      if (container) {
        container.innerHTML = '';
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new RealtimeActivityStream());
  } else {
    new RealtimeActivityStream();
  }

  // Expose to global scope
  window.RealtimeActivityStream = RealtimeActivityStream;
})();
