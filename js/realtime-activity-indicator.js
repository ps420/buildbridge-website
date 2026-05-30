/**
 * v104.3: Real-Time Activity Indicators - Fortune 500 Live User Activity System
 * Live visitor counter, activity toasts, and real-time notifications
 */

(function() {
  'use strict';

  class RealtimeActivityIndicator {
    constructor(options = {}) {
      this.options = {
        minUsers: 12,
        maxUsers: 47,
        updateInterval: 5000,
        toastInterval: 15000,
        enableToasts: true,
        enablePanel: true,
        ...options
      };
      
      this.currentUsers = this.getRandomUsers();
      this.activityHistory = [];
      this.isInitialized = false;
      
      // Simulated activity data
      this.activityTypes = [
        { action: 'viewing', subject: 'the Project Gallery', emoji: '🖼️' },
        { action: 'reading', subject: 'About BuildBridge', emoji: '📖' },
        { action: 'exploring', subject: 'Services', emoji: '🏗️' },
        { action: 'viewing', subject: 'Contact Information', emoji: '📞' },
        { action: 'browsing', subject: 'Recent Projects', emoji: '🏢' },
        { action: 'viewing', subject: 'Testimonials', emoji: '⭐' },
        { action: 'calculating', subject: 'Project Costs', emoji: '💰' },
        { action: 'exploring', subject: 'Service Areas', emoji: '🗺️' },
        { action: 'scheduled', subject: 'a Site Inspection', emoji: '📅' }
      ];
      
      this.avatars = ['👤', '👨', '👩', '🧑', '👴', '👵', '👷', '🧑‍💼', '🧑‍🔧'];
      this.locations = ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth', 'Stellenbosch', 'Sandton', 'Pietermaritzburg'];
      this.names = ['Someone', 'A visitor', 'A client', 'A contractor', 'A prospect'];
      
      this.init();
    }

    init() {
      this.createElements();
      this.bindEvents();
      this.startSimulation();
      this.isInitialized = true;
      
      console.log('🟢 Real-time Activity Indicator initialized');
    }

    getRandomUsers() {
      return Math.floor(Math.random() * (this.options.maxUsers - this.options.minUsers + 1)) + this.options.minUsers;
    }

    createElements() {
      // Create main container
      this.container = document.createElement('div');
      this.container.className = 'activity-indicator';
      
      // Live users badge
      this.usersBadge = document.createElement('div');
      this.usersBadge.className = 'live-users-badge';
      this.usersBadge.innerHTML = `
        <span class="live-indicator"></span>
        <span class="live-users-text">
          <span class="live-users-count">${this.currentUsers}</span> people viewing now
        </span>
      `;
      
      // Activity panel
      if (this.options.enablePanel) {
        this.activityPanel = document.createElement('div');
        this.activityPanel.className = 'activity-panel';
        this.activityPanel.innerHTML = `
          <div class="activity-panel-header">
            <span class="activity-panel-title">Live Activity</span>
            <button class="activity-panel-close" aria-label="Close panel">✕</button>
          </div>
          <div class="activity-feed"></div>
        `;
        document.body.appendChild(this.activityPanel);
        this.activityFeed = this.activityPanel.querySelector('.activity-feed');
        
        // Panel toggle button
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.className = 'activity-toggle';
        this.toggleBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span class="notification-dot"></span>
        `;
        document.body.appendChild(this.toggleBtn);
      }
      
      // Add to container
      this.container.appendChild(this.usersBadge);
      document.body.appendChild(this.container);
      
      // Add project view counters to project cards
      this.addProjectCounters();
    }

    addProjectCounters() {
      const projectCards = document.querySelectorAll('.project-card, [data-view-counter]');
      projectCards.forEach(card => {
        const views = Math.floor(Math.random() * 500) + 50;
        const counter = document.createElement('div');
        counter.className = 'project-view-counter';
        counter.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span>${views} views</span>
        `;
        card.style.position = 'relative';
        card.appendChild(counter);
      });
    }

    bindEvents() {
      // Panel toggle
      if (this.toggleBtn) {
        this.toggleBtn.addEventListener('click', () => {
          this.activityPanel.classList.toggle('visible');
          this.toggleBtn.querySelector('.notification-dot').style.display = 'none';
        });
      }
      
      // Panel close
      if (this.activityPanel) {
        this.activityPanel.querySelector('.activity-panel-close').addEventListener('click', () => {
          this.activityPanel.classList.remove('visible');
        });
      }
      
      // Click outside to close panel
      document.addEventListener('click', (e) => {
        if (this.activityPanel && 
            !this.activityPanel.contains(e.target) && 
            !this.toggleBtn.contains(e.target) &&
            this.activityPanel.classList.contains('visible')) {
          this.activityPanel.classList.remove('visible');
        }
      });
    }

    startSimulation() {
      // Update user count periodically
      setInterval(() => {
        this.updateUserCount();
      }, this.options.updateInterval);
      
      // Show activity toasts
      if (this.options.enableToasts) {
        setInterval(() => {
          this.showActivityToast();
        }, this.options.toastInterval);
        
        // Initial toast
        setTimeout(() => this.showActivityToast(), 5000);
      }
      
      // Add activities to feed
      this.addActivityToFeed();
      setInterval(() => {
        this.addActivityToFeed();
      }, 8000);
    }

    updateUserCount() {
      const change = Math.random() > 0.5 ? 1 : -1;
      const newCount = this.currentUsers + (Math.random() > 0.7 ? change * Math.floor(Math.random() * 3 + 1) : 0);
      
      // Keep within bounds
      this.currentUsers = Math.max(this.options.minUsers, Math.min(this.options.maxUsers, newCount));
      
      // Animate the update
      const countEl = this.usersBadge.querySelector('.live-users-count');
      countEl.style.transform = 'scale(1.2)';
      countEl.style.color = change > 0 ? '#22c55e' : '#ef4444';
      
      setTimeout(() => {
        countEl.textContent = this.currentUsers;
        countEl.style.transform = 'scale(1)';
        countEl.style.color = '';
      }, 200);
    }

    showActivityToast() {
      const activity = this.generateActivity();
      
      // Create toast
      const toast = document.createElement('div');
      toast.className = 'activity-toast';
      toast.innerHTML = `
        <div class="activity-avatar">${activity.avatar}</div>
        <div class="activity-content">
          <div class="activity-message"><strong>${activity.name}</strong> from ${activity.location} is ${activity.action} ${activity.subject}</div>
          <div class="activity-time">Just now</div>
        </div>
        <button class="activity-close" aria-label="Dismiss">✕</button>
      `;
      
      this.container.appendChild(toast);
      
      // Show with animation
      requestAnimationFrame(() => {
        toast.classList.add('visible');
      });
      
      // Auto dismiss
      const dismissTimeout = setTimeout(() => {
        this.dismissToast(toast);
      }, 6000);
      
      // Manual dismiss
      toast.querySelector('.activity-close').addEventListener('click', () => {
        clearTimeout(dismissTimeout);
        this.dismissToast(toast);
      });
    }

    dismissToast(toast) {
      toast.classList.remove('visible');
      setTimeout(() => {
        toast.remove();
      }, 500);
    }

    generateActivity() {
      const type = this.activityTypes[Math.floor(Math.random() * this.activityTypes.length)];
      return {
        avatar: this.avatars[Math.floor(Math.random() * this.avatars.length)],
        name: this.names[Math.floor(Math.random() * this.names.length)],
        location: this.locations[Math.floor(Math.random() * this.locations.length)],
        action: type.action,
        subject: type.subject,
        emoji: type.emoji,
        time: new Date()
      };
    }

    addActivityToFeed() {
      const activity = this.generateActivity();
      
      const item = document.createElement('div');
      item.className = 'activity-feed-item';
      item.innerHTML = `
        <div class="activity-feed-avatar">${activity.emoji}</div>
        <div class="activity-feed-content">
          <div class="activity-feed-message"><strong>${activity.location}</strong> - ${activity.action} ${activity.subject}</div>
          <div class="activity-feed-time">Just now</div>
        </div>
      `;
      
      // Add to feed with animation
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      
      this.activityFeed.insertBefore(item, this.activityFeed.firstChild);
      
      requestAnimationFrame(() => {
        item.style.transition = 'all 0.4s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      });
      
      // Keep only last 10 items
      while (this.activityFeed.children.length > 10) {
        this.activityFeed.lastChild.remove();
      }
      
      // Show notification dot on toggle button
      if (!this.activityPanel.classList.contains('visible')) {
        this.toggleBtn.querySelector('.notification-dot').style.display = 'block';
      }
    }

    // Public API
    getCurrentUserCount() {
      return this.currentUsers;
    }

    showCustomToast(message, options = {}) {
      const toast = document.createElement('div');
      toast.className = 'activity-toast';
      toast.innerHTML = `
        <div class="activity-avatar">${options.emoji || '💬'}</div>
        <div class="activity-content">
          <div class="activity-message">${message}</div>
          <div class="activity-time">${options.time || 'Just now'}</div>
        </div>
        <button class="activity-close" aria-label="Dismiss">✕</button>
      `;
      
      this.container.appendChild(toast);
      
      requestAnimationFrame(() => {
        toast.classList.add('visible');
      });
      
      setTimeout(() => {
        this.dismissToast(toast);
      }, options.duration || 6000);
    }
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new RealtimeActivityIndicator());
  } else {
    new RealtimeActivityIndicator();
  }

  // Expose to global scope
  window.RealtimeActivityIndicator = RealtimeActivityIndicator;
})();
