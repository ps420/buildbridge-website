/**
 * BuildBridge v26.1 - Real-Time Activity Feed
 * Fortune 500 Quality Live Updates Component
 */

(function() {
  'use strict';

  const activities = [
    { type: 'project', icon: '🏗', title: 'Project Completed', message: 'Cape Town Luxury Estate handed over to client', time: 'Just now', location: 'Camps Bay', badge: 'R12M' },
    { type: 'review', icon: '⭐', title: '5-Star Review', message: 'Sarah M. rated their residential renovation', time: '2 min ago', location: 'Johannesburg' },
    { type: 'enquiry', icon: '📧', title: 'New Enquiry', message: 'Commercial development consultation requested', time: '5 min ago', location: 'Pretoria' },
    { type: 'project', icon: '🏢', title: 'Milestone Reached', message: 'Johannesburg HQ reached 75% completion', time: '12 min ago', location: 'Sandton', badge: 'R45M' },
    { type: 'achievement', icon: '🏆', title: 'Award Won', message: 'Best Construction Management Company 2024', time: '45 min ago', location: 'National' },
    { type: 'review', icon: '⭐', title: '5-Star Review', message: 'Michael O. praised our contractor matching', time: '1 hour ago', location: 'Durban' },
    { type: 'project', icon: '🏭', title: 'Project Started', message: 'Industrial Park construction commenced', time: '2 hours ago', location: 'Pretoria', badge: 'R65M' },
    { type: 'enquiry', icon: '📱', title: 'WhatsApp Enquiry', message: 'Luxury villa consultation via WhatsApp', time: '3 hours ago', location: 'Umhlanga' },
    { type: 'review', icon: '⭐', title: '5-Star Review', message: 'John D. commended our transparent communication', time: '4 hours ago', location: 'Cape Town' },
    { type: 'project', icon: '🏘', title: 'Site Inspection', message: 'Quality inspection passed for residential estate', time: '5 hours ago', location: 'Stellenbosch' },
    { type: 'achievement', icon: '📈', title: 'Quarterly Record', message: 'Highest project completion rate this quarter', time: '6 hours ago', location: 'Company' },
    { type: 'enquiry', icon: '📧', title: 'New Enquiry', message: 'Mixed-use development feasibility study', time: '7 hours ago', location: 'Bloemfontein' }
  ];

  const weeklyData = [45, 62, 38, 75, 55, 88, 95];

  class ActivityFeed {
    constructor(container) {
      this.container = container;
      this.feed = container.querySelector('.activity-feed');
      this.activities = [...activities];
      this.currentIndex = 0;
      
      this.init();
    }

    init() {
      this.renderInitialActivities();
      this.renderStats();
      this.startRealTimeSimulation();
    }

    renderInitialActivities() {
      this.activities.slice(0, 6).forEach(activity => {
        this.addActivityCard(activity, false);
      });
    }

    addActivityCard(activity, animate = true) {
      const card = document.createElement('div');
      card.className = `activity-card type-${activity.type} ${animate ? 'new' : ''}`;
      card.innerHTML = `
        <div class="activity-icon">${activity.icon}</div>
        <div class="activity-content">
          <h4>${activity.title}</h4>
          <p>${activity.message}</p>
          <div class="activity-meta">
            <span class="activity-time">🕐 ${activity.time}</span>
            <span class="activity-location">${activity.location}</span>
            ${activity.badge ? `<span class="activity-badge">${activity.badge}</span>` : ''}
          </div>
        </div>
      `;
      
      this.feed.insertBefore(card, this.feed.firstChild);
      
      // Remove old cards
      while (this.feed.children.length > 8) {
        this.feed.lastChild.remove();
      }
      
      // Remove new class after animation
      if (animate) {
        setTimeout(() => card.classList.remove('new'), 2000);
      }
    }

    renderStats() {
      const statCards = this.container.querySelectorAll('.stat-card-value');
      
      // Animate counters
      this.animateCounter(statCards[0], 0, 150, 2000, '+');
      this.animateCounter(statCards[1], 0, 98, 2000, '%');
      this.animateCounter(statCards[2], 0, 50, 2000, '+');
      
      // Render mini chart
      const miniChart = this.container.querySelector('.mini-chart');
      if (miniChart) {
        weeklyData.forEach((value, index) => {
          const bar = document.createElement('div');
          bar.className = 'chart-bar';
          bar.style.height = '0%';
          bar.style.transitionDelay = `${index * 100}ms`;
          bar.dataset.value = value;
          miniChart.appendChild(bar);
          
          setTimeout(() => {
            bar.style.height = `${value}%`;
          }, 100);
        });
      }
    }

    animateCounter(element, start, end, duration, suffix = '') {
      const range = end - start;
      const minTimer = 50;
      let stepTime = Math.abs(Math.floor(duration / range));
      stepTime = Math.max(stepTime, minTimer);
      
      let startTime = new Date().getTime();
      let endTime = startTime + duration;
      let timer;
      
      const run = () => {
        let now = new Date().getTime();
        let remaining = Math.max((endTime - now) / duration, 0);
        let value = Math.round(end - (remaining * range));
        element.textContent = value + suffix;
        if (value == end) clearInterval(timer);
      };
      
      timer = setInterval(run, stepTime);
      run();
    }

    startRealTimeSimulation() {
      // Simulate new activities every 15-45 seconds
      const simulateNewActivity = () => {
        const randomActivity = this.generateRandomActivity();
        this.addActivityCard(randomActivity, true);
        
        // Schedule next update
        const nextUpdate = Math.random() * 30000 + 15000;
        setTimeout(simulateNewActivity, nextUpdate);
      };
      
      // Start after initial render
      setTimeout(simulateNewActivity, 15000);
    }

    generateRandomActivity() {
      const types = ['project', 'review', 'enquiry', 'achievement'];
      const projects = [
        { title: 'Project Completed', icon: '🏗', badge: 'R12M' },
        { title: 'Milestone Reached', icon: '🏗', badge: 'R45M' },
        { title: 'Site Inspection', icon: '🔍', badge: null }
      ];
      const reviews = [
        { title: '5-Star Review', message: 'Client praised our communication', icon: '⭐' },
        { title: '5-Star Review', message: 'Excellent contractor matching', icon: '⭐' }
      ];
      const enquiries = [
        { title: 'New Enquiry', message: 'Residential consultation requested', icon: '📧' },
        { title: 'WhatsApp Enquiry', message: 'Commercial project inquiry', icon: '📱' }
      ];
      
      const locations = ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      let activity;
      switch(type) {
        case 'project':
          const proj = projects[Math.floor(Math.random() * projects.length)];
          activity = {
            type: 'project',
            icon: proj.icon,
            title: proj.title,
            message: `Project update from ${locations[Math.floor(Math.random() * locations.length)]}`,
            time: 'Just now',
            location: locations[Math.floor(Math.random() * locations.length)],
            badge: proj.badge
          };
          break;
        case 'review':
          const rev = reviews[Math.floor(Math.random() * reviews.length)];
          activity = {
            type: 'review',
            icon: rev.icon,
            title: rev.title,
            message: rev.message,
            time: 'Just now',
            location: locations[Math.floor(Math.random() * locations.length)]
          };
          break;
        case 'enquiry':
          const enq = enquiries[Math.floor(Math.random() * enquiries.length)];
          activity = {
            type: 'enquiry',
            icon: enq.icon,
            title: enq.title,
            message: enq.message,
            time: 'Just now',
            location: locations[Math.floor(Math.random() * locations.length)]
          };
          break;
        case 'achievement':
          activity = {
            type: 'achievement',
            icon: '🏆',
            title: 'Company Milestone',
            message: 'BuildBridge reached a new achievement',
            time: 'Just now',
            location: 'National'
          };
          break;
      }
      
      return activity;
    }
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.activity-feed-section').forEach(section => {
      new ActivityFeed(section);
    });
  });

  window.ActivityFeed = ActivityFeed;
})();
