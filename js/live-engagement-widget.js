/**
 * v32.0 - Live Engagement Widget
 * Fortune 500 Real-Time Activity & Social Proof System
 */

(function() {
  'use strict';

  class LiveEngagementWidget {
    constructor() {
      this.widget = null;
      this.isOpen = false;
      this.visitorCount = Math.floor(Math.random() * 50) + 20;
      this.todayCount = Math.floor(Math.random() * 500) + 300;
      
      // Simulated user data
      this.names = [
        'John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'Chris', 'Anna',
        'James', 'Maria', 'Robert', 'Jennifer', 'William', 'Patricia', 'Thomas', 'Linda'
      ];
      
      this.actions = [
        'viewing the projects page',
        'requesting a quote',
        'browsing services',
        'reading testimonials',
        'checking pricing',
        'viewing contact info',
        'exploring portfolio',
        'viewing residential projects',
        'checking commercial builds',
        'reading about our process'
      ];
      
      this.locations = [
        { name: 'Cape Town', flag: '🇿🇦', percent: 45 },
        { name: 'Johannesburg', flag: '🇿🇦', percent: 30 },
        { name: 'Durban', flag: '🇿🇦', percent: 15 },
        { name: 'Pretoria', flag: '🇿🇦', percent: 10 }
      ];

      this.activities = [];
      this.maxActivities = 6;
      
      this.init();
    }

    init() {
      this.createWidget();
      this.bindEvents();
      this.startSimulation();
      this.updateVisitorCount();
      
      console.log('👥 BuildBridge v32.0: Live Engagement Widget initialized');
    }

    createWidget() {
      this.widget = document.createElement('div');
      this.widget.className = 'live-engagement-widget';
      
      this.widget.innerHTML = `
        <button class="engagement-toggle" aria-label="View live activity">
          <span class="live-pulse"></span>
          <span class="engagement-toggle-text">Live Activity</span>
          <span class="engagement-toggle-count">${this.visitorCount} online</span>
        </button>
        
        <div class="engagement-panel" role="dialog" aria-label="Live site activity">
          <div class="engagement-header">
            <div class="engagement-header-title">
              <span class="live-pulse"></span>
              Live Activity Feed
            </div>
            <button class="engagement-header-close" aria-label="Close panel">×</button>
          </div>
          
          <div class="visitor-counter">
            <div class="counter-item">
              <div class="counter-item-value" id="liveCounter">${this.visitorCount}</div>
              <div class="counter-item-label">Online Now</div>
            </div>
            <div class="counter-item">
              <div class="counter-item-value" id="todayCounter">${this.todayCount}</div>
              <div class="counter-item-label">Visitors Today</div>
            </div>
          </div>
          
          <div class="engagement-activity" id="activityFeed">
            <!-- Activity items will be added here -->
          </div>
          
          <div class="engagement-geography">
            <div class="geography-header">Visitors by Location</div>
            <div class="geography-bars">
              ${this.locations.map(loc => `
                <div class="geo-bar">
                  <div class="geo-bar-label">${loc.flag} ${loc.name}</div>
                  <div class="geo-bar-progress">
                    <div class="geo-bar-fill" style="width: ${loc.percent}%"></div>
                  </div>
                  <div class="geo-bar-value">${loc.percent}%</div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="social-proof-bar">
            <div class="social-proof-text">
              <span>✓</span>
              <span>${Math.floor(Math.random() * 10) + 3} projects quoted today</span>
            </div>
            <div class="social-proof-avatars">
              <div class="social-proof-avatar">👤</div>
              <div class="social-proof-avatar">👤</div>
              <div class="social-proof-avatar">👤</div>
              <div class="social-proof-more">+${Math.floor(Math.random() * 20) + 5}</div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(this.widget);

      // Cache elements
      this.toggle = this.widget.querySelector('.engagement-toggle');
      this.panel = this.widget.querySelector('.engagement-panel');
      this.closeBtn = this.widget.querySelector('.engagement-header-close');
      this.activityFeed = this.widget.querySelector('#activityFeed');
      this.liveCounter = this.widget.querySelector('#liveCounter');
      this.todayCounter = this.widget.querySelector('#todayCounter');
      this.visitorCountEl = this.widget.querySelector('.engagement-toggle-count');
    }

    bindEvents() {
      // Toggle panel
      this.toggle.addEventListener('click', () => this.togglePanel());
      
      // Close button
      this.closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closePanel();
      });
      
      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closePanel();
        }
      });

      // Don't close when clicking inside panel
      this.panel.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Close when clicking outside
      document.addEventListener('click', () => {
        if (this.isOpen) {
          this.closePanel();
        }
      });
    }

    togglePanel() {
      if (this.isOpen) {
        this.closePanel();
      } else {
        this.openPanel();
      }
    }

    openPanel() {
      this.isOpen = true;
      this.widget.classList.add('active');
      this.panel.setAttribute('aria-hidden', 'false');
    }

    closePanel() {
      this.isOpen = false;
      this.widget.classList.remove('active');
      this.panel.setAttribute('aria-hidden', 'true');
    }

    startSimulation() {
      // Add initial activities
      for (let i = 0; i < 4; i++) {
        this.addActivity(false);
      }

      // Add new activity periodically
      setInterval(() => {
        if (Math.random() > 0.3) {
          this.addActivity(true);
        }
      }, 5000 + Math.random() * 5000);

      // Update visitor count periodically
      setInterval(() => this.updateVisitorCount(), 10000);

      // Show occasional toast notification
      setInterval(() => {
        if (!this.isOpen && Math.random() > 0.7) {
          this.showToast();
        }
      }, 15000);
    }

    addActivity(animate = true) {
      const name = this.names[Math.floor(Math.random() * this.names.length)];
      const action = this.actions[Math.floor(Math.random() * this.actions.length)];
      const avatar = this.getRandomAvatar();
      const time = this.getTimeAgo();

      const activityItem = document.createElement('div');
      activityItem.className = 'activity-item';
      activityItem.innerHTML = `
        <div class="activity-avatar">${avatar}</div>
        <div class="activity-content">
          <div class="activity-text"><strong>${name}</strong> is ${action}</div>
          <div class="activity-time">${time}</div>
        </div>
      `;

      this.activityFeed.insertBefore(activityItem, this.activityFeed.firstChild);

      // Remove old activities
      const items = this.activityFeed.querySelectorAll('.activity-item');
      if (items.length > this.maxActivities) {
        items[items.length - 1].remove();
      }

      // Update today counter
      this.todayCount++;
      this.todayCounter.textContent = this.todayCount.toLocaleString();
    }

    getRandomAvatar() {
      const avatars = ['👨', '👩', '👨‍💼', '👩‍💼', '🏠', '🏢', '🔨', '📋'];
      return avatars[Math.floor(Math.random() * avatars.length)];
    }

    getTimeAgo() {
      const times = ['Just now', '1 min ago', '2 mins ago', 'Just now', 'Just now'];
      return times[Math.floor(Math.random() * times.length)];
    }

    updateVisitorCount() {
      // Random fluctuation
      const change = Math.floor(Math.random() * 7) - 3;
      this.visitorCount = Math.max(10, this.visitorCount + change);
      
      // Update displays
      this.liveCounter.textContent = this.visitorCount;
      this.visitorCountEl.textContent = `${this.visitorCount} online`;
      
      // Visual feedback on change
      if (change !== 0) {
        this.liveCounter.classList.add('changed');
        setTimeout(() => {
          this.liveCounter.classList.remove('changed');
        }, 300);
      }
    }

    showToast() {
      // Remove existing toast
      const existingToast = this.widget.querySelector('.engagement-toast');
      if (existingToast) {
        existingToast.remove();
      }

      const name = this.names[Math.floor(Math.random() * this.names.length)];
      const action = this.actions[Math.floor(Math.random() * this.actions.length)];
      const avatar = this.getRandomAvatar();

      const toast = document.createElement('div');
      toast.className = 'engagement-toast';
      toast.innerHTML = `
        <div class="toast-avatar">${avatar}</div>
        <div class="toast-content">
          <div class="toast-text"><strong>${name}</strong> ${action}</div>
          <div class="toast-time">Just now</div>
        </div>
      `;

      this.widget.appendChild(toast);

      // Remove after delay
      setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    // Public methods
    setVisitorCount(count) {
      this.visitorCount = count;
      this.liveCounter.textContent = count;
      this.visitorCountEl.textContent = `${count} online`;
    }

    addCustomActivity(name, action, avatar = '👤') {
      const activityItem = document.createElement('div');
      activityItem.className = 'activity-item';
      activityItem.innerHTML = `
        <div class="activity-avatar">${avatar}</div>
        <div class="activity-content">
          <div class="activity-text"><strong>${name}</strong> ${action}</div>
          <div class="activity-time">Just now</div>
        </div>
      `;

      this.activityFeed.insertBefore(activityItem, this.activityFeed.firstChild);

      const items = this.activityFeed.querySelectorAll('.activity-item');
      if (items.length > this.maxActivities) {
        items[items.length - 1].remove();
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new LiveEngagementWidget());
  } else {
    new LiveEngagementWidget();
  }

  // Expose to global scope
  window.LiveEngagementWidget = LiveEngagementWidget;
})();
