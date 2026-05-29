/**
 * v74.0: Client Portal Preview
 * Dashboard-Style Teaser with Animations
 */

(function() {
  'use strict';

  const ClientPortal = {
    config: {
      animationDuration: 800,
      staggerDelay: 100
    },

    data: {
      stats: [
        { label: 'Active Projects', value: 12, icon: '📊', trend: '+3', trendUp: true },
        { label: 'Completed', value: 48, icon: '✓', trend: '+8', trendUp: true },
        { label: 'Total Value', value: 'R24M', icon: '💰', trend: '+12%', trendUp: true },
        { label: 'Days Saved', value: 156, icon: '⏱', trend: 'Avg 12', trendUp: true }
      ],
      projects: [
        { name: 'Luxury Villa Estate', location: 'Cape Town', value: 'R4.2M', status: 'active', thumb: 'Hero_1.png' },
        { name: 'Commercial Office', location: 'Johannesburg', value: 'R8.5M', status: 'progress', thumb: 'Campaign_4.png' },
        { name: 'Residential Complex', location: 'Durban', value: 'R6.1M', status: 'completed', thumb: 'Campaign_5.png' },
        { name: 'Retail Development', location: 'Pretoria', value: 'R3.8M', status: 'active', thumb: 'Hero_2.png' }
      ],
      activities: [
        { text: '<strong>Site inspection</strong> completed for Luxury Villa', time: '2 hours ago' },
        { text: '<strong>Milestone reached</strong> - Foundation complete', time: '5 hours ago' },
        { text: '<strong>New document</strong> uploaded - Floor plans v3', time: 'Yesterday' },
        { text: '<strong>Payment processed</strong> - R450,000', time: '2 days ago' },
        { text: '<strong>Contractor assigned</strong> to new project', time: '3 days ago' }
      ]
    },

    init() {
      this.container = document.querySelector('.client-portal-section');
      if (!this.container) return;

      this.renderStats();
      this.renderProjects();
      this.renderActivity();
      this.bindEvents();
      this.observeAnimations();
    },

    renderStats() {
      const container = this.container.querySelector('.dashboard-stats');
      if (!container) return;

      container.innerHTML = this.data.stats.map((stat, i) => `
        <div class="dashboard-stat-card" style="animation-delay: ${i * 0.1}s">
          <div class="dashboard-stat-header">
            <div class="dashboard-stat-icon">${stat.icon}</div>
            <div class="dashboard-stat-trend dashboard-stat-trend--${stat.trendUp ? 'up' : 'down'}">
              ${stat.trendUp ? '↑' : '↓'} ${stat.trend}
            </div>
          </div>
          <div class="dashboard-stat-value" data-count="${stat.value}">${stat.value}</div>
          <div class="dashboard-stat-label">${stat.label}</div>
        </div>
      `).join('');
    },

    renderProjects() {
      const container = this.container.querySelector('.project-list');
      if (!container) return;

      container.innerHTML = this.data.projects.map(project => `
        <div class="project-item">
          <div class="project-info">
            <img src="assets/02_Website_Heroes/${project.thumb}" alt="${project.name}" class="project-thumb">
            <div class="project-details">
              <h4>${project.name}</h4>
              <span>${project.location}</span>
            </div>
          </div>
          <div class="project-value">${project.value}</div>
          <div class="project-date">${this.getRandomDate()}</div>
          <div class="project-status project-status--${project.status}">
            <span class="status-dot"></span>
            ${project.status === 'active' ? 'Active' : project.status === 'progress' ? 'In Progress' : 'Completed'}
          </div>
        </div>
      `).join('');
    },

    renderActivity() {
      const container = this.container.querySelector('.timeline-items');
      if (!container) return;

      container.innerHTML = this.data.activities.map(activity => `
        <div class="timeline-item">
          <div class="timeline-content">
            <div class="timeline-text">${activity.text}</div>
            <div class="timeline-time">${activity.time}</div>
          </div>
        </div>
      `).join('');
    },

    getRandomDate() {
      const dates = ['Jan 15', 'Feb 2', 'Mar 8', 'Apr 12', 'May 20'];
      return dates[Math.floor(Math.random() * dates.length];
    },

    bindEvents() {
      // Sidebar navigation
      this.container.querySelectorAll('.sidebar-nav-item').forEach(item => {
        item.addEventListener('click', () => {
          this.container.querySelectorAll('.sidebar-nav-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
        });
      });

      // Quick action buttons
      this.container.querySelectorAll('.quick-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.querySelector('span:last-child')?.textContent;
          this.showNotification(`${action} - Coming Soon!`);
        });
      });
    },

    observeAnimations() {
      const dashboard = this.container.querySelector('.dashboard-preview');
      if (!dashboard) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            dashboard.classList.add('animate-in');
            this.animateCounters();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      observer.observe(dashboard);
    },

    animateCounters() {
      const counters = this.container.querySelectorAll('.dashboard-stat-value[data-count]');
      
      counters.forEach(counter => {
        const target = counter.dataset.count;
        const isCurrency = target.includes('R');
        const isString = isNaN(parseInt(target));
        
        if (isString) {
          counter.textContent = target;
          return;
        }

        const num = parseInt(target);
        let current = 0;
        const increment = num / 50;
        const duration = 1500;
        const stepTime = duration / 50;

        const timer = setInterval(() => {
          current += increment;
          if (current >= num) {
            current = num;
            clearInterval(timer);
          }
          counter.textContent = isCurrency ? `R${Math.floor(current)}M` : Math.floor(current);
        }, stepTime);
      });
    },

    showNotification(message) {
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: linear-gradient(135deg, #1a1a1d, #141416);
        color: #C9CED6;
        padding: 16px 24px;
        border-radius: 12px;
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        z-index: 9999;
        border: 1px solid rgba(201, 206, 214, 0.2);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        animation: notification-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      notification.textContent = message;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = 'notification-out 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  };

  // Add notification animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes notification-in {
      from { 
        opacity: 0; 
        transform: translateX(50px) scale(0.9); 
      }
      to { 
        opacity: 1; 
        transform: translateX(0) scale(1); 
      }
    }
    @keyframes notification-out {
      from { 
        opacity: 1; 
        transform: translateX(0); 
      }
      to { 
        opacity: 0; 
        transform: translateX(50px); 
      }
    }
  `;
  document.head.appendChild(style);

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ClientPortal.init());
  } else {
    ClientPortal.init();
  }

  window.BuildBridgePortal = ClientPortal;
})();
