/**
 * Live Visitor Counter Widget - v138.0
 * Fortune 500 Real-Time Activity Indicator
 * Simulates realistic visitor activity with intelligent fluctuations
 */

(function() {
  'use strict';

  const LiveVisitorCounter = {
    config: {
      baseVisitors: 12,
      maxVisitors: 47,
      minVisitors: 3,
      updateInterval: 5000,
      activityInterval: 8000,
      showAfter: 3000,
      storageKey: 'bb_visitor_closed',
      activities: [
        { icon: '👀', text: 'Viewing projects gallery', weight: 25 },
        { icon: '📋', text: 'Reading about services', weight: 20 },
        { icon: '📞', text: 'Requesting consultation', weight: 15 },
        { icon: '🏠', text: 'Browsing residential projects', weight: 18 },
        { icon: '🏢', text: 'Exploring commercial services', weight: 12 },
        { icon: '📄', text: 'Downloading brochure', weight: 8 },
        { icon: '💬', text: 'Starting WhatsApp chat', weight: 10 },
        { icon: '📍', text: 'Viewing location map', weight: 7 },
        { icon: '⭐', text: 'Reading testimonials', weight: 14 },
        { icon: '📧', text: 'Subscribing to newsletter', weight: 5 }
      ],
      locations: ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'Stellenbosch', 'Paarl']
    },

    state: {
      currentVisitors: 0,
      trend: 'up',
      lastUpdate: Date.now(),
      activities: [],
      isVisible: false,
      isClosed: false
    },

    init() {
      // Check if user previously closed the widget
      if (localStorage.getItem(this.config.storageKey)) {
        return;
      }

      this.createWidget();
      this.simulateBaseCount();
      this.startSimulation();
      this.bindEvents();
      
      // Show after delay
      setTimeout(() => {
        if (!this.state.isClosed) {
          this.show();
        }
      }, this.config.showAfter);
    },

    createWidget() {
      const widget = document.createElement('div');
      widget.className = 'live-visitor-widget';
      widget.setAttribute('role', 'status');
      widget.setAttribute('aria-live', 'polite');
      widget.setAttribute('aria-label', 'Live visitor counter');
      
      widget.innerHTML = `
        <button class="live-visitor-close" aria-label="Close visitor counter">×</button>
        <div class="live-visitor-pulse"></div>
        <div class="live-visitor-content">
          <div class="live-visitor-label">Currently Viewing</div>
          <div class="live-visitor-count">
            <span class="live-visitor-number">${this.config.baseVisitors}</span>
            <span class="live-visitor-trend up">↗</span>
          </div>
          <div class="live-visitor-activity">
            <span class="live-visitor-activity-text">Active visitors right now</span>
          </div>
        </div>
        <div class="live-visitor-popup">
          <div class="live-visitor-popup-title">Recent Activity</div>
          <div class="live-visitor-activity-list"></div>
        </div>
      `;
      
      document.body.appendChild(widget);
      this.widget = widget;
      this.countEl = widget.querySelector('.live-visitor-number');
      this.trendEl = widget.querySelector('.live-visitor-trend');
      this.activityTextEl = widget.querySelector('.live-visitor-activity-text');
      this.activityListEl = widget.querySelector('.live-visitor-activity-list');
    },

    simulateBaseCount() {
      // Generate realistic base count based on time of day
      const hour = new Date().getHours();
      let timeMultiplier = 1;
      
      if (hour >= 9 && hour <= 17) {
        timeMultiplier = 1.5; // Business hours
      } else if (hour >= 18 && hour <= 21) {
        timeMultiplier = 1.2; // Evening browsing
      } else if (hour >= 0 && hour <= 6) {
        timeMultiplier = 0.3; // Night time
      }
      
      this.state.currentVisitors = Math.floor(
        this.config.baseVisitors * timeMultiplier + 
        Math.random() * 8
      );
      
      this.updateDisplay();
    },

    startSimulation() {
      // Update visitor count periodically
      setInterval(() => this.updateVisitorCount(), this.config.updateInterval);
      
      // Update activity feed
      setInterval(() => this.updateActivity(), this.config.activityInterval);
      
      // Initial activity feed
      this.updateActivity();
      this.updateActivity();
      this.updateActivity();
    },

    updateVisitorCount() {
      const hour = new Date().getHours();
      const isBusinessHours = hour >= 8 && hour <= 18;
      
      // Fluctuate count
      const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
      let newCount = this.state.currentVisitors + change;
      
      // Apply business hours modifier
      if (isBusinessHours) {
        newCount = Math.max(this.config.minVisitors, Math.min(this.config.maxVisitors, newCount));
      } else {
        newCount = Math.max(1, Math.min(Math.floor(this.config.maxVisitors * 0.6), newCount));
      }
      
      // Update trend
      this.state.trend = newCount > this.state.currentVisitors ? 'up' : 
                        newCount < this.state.currentVisitors ? 'down' : 'stable';
      
      this.state.currentVisitors = newCount;
      this.updateDisplay();
    },

    updateDisplay() {
      if (!this.countEl) return;
      
      // Animate number change
      this.animateNumber(this.countEl, parseInt(this.countEl.textContent), this.state.currentVisitors);
      
      // Update trend indicator
      this.trendEl.className = `live-visitor-trend ${this.state.trend}`;
      this.trendEl.textContent = this.state.trend === 'up' ? '↗' : 
                                  this.state.trend === 'down' ? '↘' : '→';
    },

    animateNumber(element, from, to) {
      const duration = 500;
      const start = performance.now();
      
      const animate = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        const current = Math.floor(from + (to - from) * easeProgress);
        element.textContent = current;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    },

    updateActivity() {
      // Weighted random activity selection
      const totalWeight = this.config.activities.reduce((sum, a) => sum + a.weight, 0);
      let random = Math.random() * totalWeight;
      
      let selectedActivity;
      for (const activity of this.config.activities) {
        random -= activity.weight;
        if (random <= 0) {
          selectedActivity = activity;
          break;
        }
      }
      
      const location = this.config.locations[Math.floor(Math.random() * this.config.locations.length)];
      const timeAgo = Math.floor(Math.random() * 3) + 1; // 1-3 minutes ago
      
      const activityItem = {
        icon: selectedActivity.icon,
        text: `${selectedActivity.text} from ${location}`,
        time: `${timeAgo}m ago`
      };
      
      this.state.activities.unshift(activityItem);
      if (this.state.activities.length > 4) {
        this.state.activities.pop();
      }
      
      this.renderActivities();
      
      // Update main activity text occasionally
      if (Math.random() > 0.5) {
        this.activityTextEl.textContent = `${selectedActivity.text}...`;
        this.activityTextEl.style.animation = 'none';
        this.activityTextEl.offsetHeight; // Trigger reflow
        this.activityTextEl.style.animation = 'activityFade 0.5s ease';
      }
    },

    renderActivities() {
      if (!this.activityListEl) return;
      
      this.activityListEl.innerHTML = this.state.activities.map(activity => `
        <div class="live-visitor-activity-item">
          <div class="live-visitor-activity-icon">${activity.icon}</div>
          <div class="live-visitor-activity-text">${activity.text}</div>
          <div class="live-visitor-activity-time">${activity.time}</div>
        </div>
      `).join('');
    },

    show() {
      this.state.isVisible = true;
      this.widget.classList.add('visible');
    },

    hide() {
      this.state.isVisible = false;
      this.widget.classList.remove('visible');
    },

    close() {
      this.state.isClosed = true;
      this.hide();
      localStorage.setItem(this.config.storageKey, Date.now().toString());
      
      // Remove after animation
      setTimeout(() => {
        this.widget.remove();
      }, 500);
    },

    bindEvents() {
      // Close button
      this.widget.querySelector('.live-visitor-close').addEventListener('click', () => {
        this.close();
      });

      // Track real user activity
      document.addEventListener('click', (e) => {
        // Update activity based on what was clicked
        const target = e.target.closest('a, button, .service-card, .project-card');
        if (target) {
          this.recordRealActivity(target);
        }
      });
    },

    recordRealActivity(element) {
      // Occasionally show that someone else did the same action
      if (Math.random() > 0.7) {
        setTimeout(() => {
          const activity = {
            icon: '👆',
            text: 'Viewed same section',
            time: 'Just now'
          };
          this.state.activities.unshift(activity);
          if (this.state.activities.length > 4) {
            this.state.activities.pop();
          }
          this.renderActivities();
        }, 2000 + Math.random() * 3000);
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LiveVisitorCounter.init());
  } else {
    LiveVisitorCounter.init();
  }

  // Expose to global scope for debugging
  window.LiveVisitorCounter = LiveVisitorCounter;
})();
