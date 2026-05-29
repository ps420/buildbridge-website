/**
 * v84.0: Project Status Dashboard
 * Fortune 500 Real-Time Project Tracking System
 */

(function() {
  'use strict';

  // Project Data
  const projectData = {
    'residential-complex': {
      name: 'Modern Residential Complex',
      location: '📍 Cape Town, South Africa',
      status: 'in-progress',
      progress: 65,
      budget: 'R24.5M',
      spent: 'R15.8M',
      days: 142,
      totalDays: 218,
      milestones: [
        { name: 'Planning', date: 'Jan 15', status: 'completed', icon: '📋' },
        { name: 'Design', date: 'Feb 28', status: 'completed', icon: '✏️' },
        { name: 'Foundation', date: 'Apr 10', status: 'completed', icon: '🏗️' },
        { name: 'Structure', date: 'Jun 30', status: 'in-progress', icon: '🏢' },
        { name: 'Finishing', date: 'Aug 15', status: 'pending', icon: '✨' }
      ],
      phases: [
        { name: 'Site Prep', icon: '🚧', progress: 100, status: 'completed' },
        { name: 'Foundation', icon: '🏗️', progress: 100, status: 'completed' },
        { name: 'Framing', icon: '🏢', progress: 75, status: 'in-progress' },
        { name: 'Systems', icon: '⚡', progress: 30, status: 'in-progress' }
      ],
      activities: [
        { icon: '🏗️', text: 'Concrete pouring completed for <strong>Block B</strong>', time: '2 hours ago', type: 'completed' },
        { icon: '✅', text: 'Electrical rough-in inspection <strong>passed</strong>', time: '5 hours ago', type: 'completed' },
        { icon: '📊', text: 'Weekly progress report <strong>submitted</strong>', time: '1 day ago', type: 'update' },
        { icon: '🚚', text: 'Steel delivery scheduled for <strong>tomorrow</strong>', time: '1 day ago', type: 'update' }
      ],
      team: [
        { name: 'John Anderson', role: 'Project Manager', avatar: 'JA', online: true },
        { name: 'Sarah Mitchell', role: 'Site Supervisor', avatar: 'SM', online: true },
        { name: 'Mike Okonkwo', role: 'Safety Officer', avatar: 'MO', online: false }
      ]
    },
    'corporate-hq': {
      name: 'Corporate Headquarters',
      location: '📍 Johannesburg, South Africa',
      status: 'planning',
      progress: 25,
      budget: 'R45M',
      spent: 'R11.2M',
      days: 45,
      totalDays: 365,
      milestones: [
        { name: 'Planning', date: 'May 01', status: 'completed', icon: '📋' },
        { name: 'Design', date: 'Jun 15', status: 'in-progress', icon: '✏️' },
        { name: 'Permits', date: 'Aug 01', status: 'pending', icon: '📄' },
        { name: 'Groundwork', date: 'Sep 15', status: 'pending', icon: '🏗️' },
        { name: 'Structure', date: 'Dec 31', status: 'pending', icon: '🏢' }
      ],
      phases: [
        { name: 'Planning', icon: '📋', progress: 100, status: 'completed' },
        { name: 'Design', icon: '✏️', progress: 60, status: 'in-progress' },
        { name: 'Permits', icon: '📄', progress: 20, status: 'pending' },
        { name: 'Prep', icon: '🚧', progress: 10, status: 'pending' }
      ],
      activities: [
        { icon: '✅', text: 'Architectural drawings <strong>approved</strong>', time: '3 hours ago', type: 'completed' },
        { icon: '📊', text: 'Environmental impact assessment <strong>submitted</strong>', time: '1 day ago', type: 'update' },
        { icon: '🤝', text: 'Contractor selection <strong>in progress</strong>', time: '2 days ago', type: 'update' }
      ],
      team: [
        { name: 'Lisa van der Berg', role: 'Lead Architect', avatar: 'LB', online: true },
        { name: 'John Anderson', role: 'Project Manager', avatar: 'JA', online: true },
        { name: 'David Chen', role: 'Structural Engineer', avatar: 'DC', online: false }
      ]
    },
    'luxury-villa': {
      name: 'Luxury Villa Estate',
      location: '📍 Durban, South Africa',
      status: 'completed',
      progress: 100,
      budget: 'R18.2M',
      spent: 'R17.9M',
      days: 180,
      totalDays: 180,
      milestones: [
        { name: 'Planning', date: 'Nov 01', status: 'completed', icon: '📋' },
        { name: 'Design', date: 'Dec 15', status: 'completed', icon: '✏️' },
        { name: 'Construction', date: 'Apr 30', status: 'completed', icon: '🏗️' },
        { name: 'Finishing', date: 'Jun 15', status: 'completed', icon: '✨' },
        { name: 'Handover', date: 'Jul 01', status: 'completed', icon: '🎉' }
      ],
      phases: [
        { name: 'Site Prep', icon: '🚧', progress: 100, status: 'completed' },
        { name: 'Structure', icon: '🏢', progress: 100, status: 'completed' },
        { name: 'Finishing', icon: '✨', progress: 100, status: 'completed' },
        { name: 'Landscape', icon: '🌳', progress: 100, status: 'completed' }
      ],
      activities: [
        { icon: '🎉', text: 'Final walkthrough <strong>completed</strong>', time: '2 weeks ago', type: 'completed' },
        { icon: '✅', text: 'Client handover <strong>successful</strong>', time: '2 weeks ago', type: 'completed' },
        { icon: '🏆', text: 'Quality certification <strong>achieved</strong>', time: '3 weeks ago', type: 'completed' }
      ],
      team: [
        { name: 'Sarah Mitchell', role: 'Project Manager', avatar: 'SM', online: false },
        { name: 'Tom Bradley', role: 'Site Foreman', avatar: 'TB', online: false }
      ]
    }
  };

  class ProjectStatusDashboard {
    constructor() {
      this.currentProject = 'residential-complex';
      this.container = null;
      this.init();
    }

    init() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    setup() {
      this.container = document.querySelector('.project-status-dashboard');
      if (!this.container) return;

      this.render();
      this.attachEventListeners();
      this.animateProgress();
    }

    render() {
      const project = projectData[this.currentProject];
      
      this.container.innerHTML = `
        <svg class="dashboard-gradient-defs">
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#22c55e"/>
              <stop offset="100%" style="stop-color:#3b82f6"/>
            </linearGradient>
          </defs>
        </svg>
        
        <div class="dashboard-header">
          <p class="eyebrow">Live Tracking</p>
          <h2 class="scramble-text">Project Dashboard</h2>
          <p>Real-time insights into your construction projects. Track progress, milestones, and team activity.</p>
        </div>

        <div class="dashboard-container">
          <!-- Project Selector -->
          <div class="project-tabs">
            ${Object.entries(projectData).map(([key, data]) => `
              <button class="project-tab ${key === this.currentProject ? 'active' : ''}" data-project="${key}">
                <span class="status-dot ${data.status === 'in-progress' ? 'active-project' : data.status}"></span>
                ${data.name.split(' ')[0]}
              </button>
            `).join('')}
          </div>

          <!-- Dashboard Grid -->
          <div class="dashboard-grid">
            <!-- Project Overview -->
            <div class="project-overview-card dashboard-animate">
              <div class="project-status-badge ${project.status}">
                ${project.status === 'in-progress' ? 'Active Project' : project.status === 'completed' ? 'Completed' : 'Planning Phase'}
              </div>
              <h3 class="project-title">${project.name}</h3>
              <p class="project-location">${project.location}</p>

              <div class="project-stats-row">
                <div class="project-stat">
                  <div class="project-stat-value">${project.budget}</div>
                  <div class="project-stat-label">Total Budget</div>
                </div>
                <div class="project-stat">
                  <div class="project-stat-value">${project.spent}</div>
                  <div class="project-stat-label">Spent to Date</div>
                </div>
              </div>

              <div class="progress-ring-container" style="position: relative;">
                <svg class="progress-ring" viewBox="0 0 160 160">
                  <circle class="progress-ring-bg" cx="80" cy="80" r="70"/>
                  <circle class="progress-ring-fill" cx="80" cy="80" r="70" 
                    stroke-dasharray="440" 
                    stroke-dashoffset="${440 - (440 * project.progress / 100)}"/>
                </svg>
                <div class="progress-ring-text">
                  <div class="progress-percentage" data-target="${project.progress}">0%</div>
                  <div class="progress-label">Complete</div>
                </div>
              </div>

              <div class="project-stats-row" style="margin-top: 20px;">
                <div class="project-stat">
                  <div class="project-stat-value">${project.days}</div>
                  <div class="project-stat-label">Days Elapsed</div>
                </div>
                <div class="project-stat">
                  <div class="project-stat-value">${project.totalDays - project.days}</div>
                  <div class="project-stat-label">Days Remaining</div>
                </div>
              </div>
            </div>

            <!-- Timeline -->
            <div class="project-timeline dashboard-animate" style="animation-delay: 0.1s;">
              <div class="timeline-header">
                <h3 class="timeline-title">Project Timeline</h3>
                <div class="timeline-legend">
                  <div class="legend-item">
                    <span class="legend-dot completed"></span>
                    Completed
                  </div>
                  <div class="legend-item">
                    <span class="legend-dot in-progress"></span>
                    In Progress
                  </div>
                  <div class="legend-item">
                    <span class="legend-dot pending"></span>
                    Pending
                  </div>
                </div>
              </div>

              <div class="visual-timeline">
                <div class="timeline-track"></div>
                <div class="timeline-progress-line" style="width: ${project.progress}%"></div>
                <div class="timeline-milestones">
                  ${project.milestones.map((milestone, index) => `
                    <div class="timeline-milestone ${milestone.status}" data-index="${index}">
                      <div class="milestone-node">${milestone.icon}</div>
                      <div class="milestone-info">
                        <div class="milestone-name">${milestone.name}</div>
                        <div class="milestone-date">${milestone.date}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="phase-cards">
                ${project.phases.map(phase => `
                  <div class="phase-card ${phase.status}">
                    <div class="phase-icon">${phase.icon}</div>
                    <div class="phase-name">${phase.name}</div>
                    <div class="phase-status">${phase.status === 'completed' ? 'Completed' : phase.status === 'in-progress' ? 'In Progress' : 'Pending'}</div>
                    <div class="phase-progress-bar">
                      <div class="phase-progress-fill" style="width: ${phase.progress}%"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Bottom Section -->
          <div class="dashboard-bottom">
            <div class="activity-card dashboard-animate" style="animation-delay: 0.2s;">
              <div class="card-header">
                <h4 class="card-title">Recent Activity</h4>
                <button class="view-all-btn">View All</button>
              </div>
              <div class="activity-list">
                ${project.activities.map(activity => `
                  <div class="activity-item">
                    <div class="activity-icon ${activity.type}">${activity.icon}</div>
                    <div class="activity-content">
                      <div class="activity-text">${activity.text}</div>
                      <div class="activity-time">${activity.time}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="team-card dashboard-animate" style="animation-delay: 0.3s;">
              <div class="card-header">
                <h4 class="card-title">Project Team</h4>
                <button class="view-all-btn">Contact</button>
              </div>
              <div class="team-list">
                ${project.team.map(member => `
                  <div class="team-member">
                    <div class="member-avatar">${member.avatar}</div>
                    <div class="member-info">
                      <div class="member-name">${member.name}</div>
                      <div class="member-role">${member.role}</div>
                    </div>
                    ${member.online ? '<div class="member-status">Online</div>' : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    attachEventListeners() {
      // Tab switching
      const tabs = this.container.querySelectorAll('.project-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const projectKey = tab.dataset.project;
          if (projectKey !== this.currentProject) {
            this.currentProject = projectKey;
            this.render();
            this.attachEventListeners();
            this.animateProgress();
          }
        });
      });

      // Milestone hover effects
      const milestones = this.container.querySelectorAll('.timeline-milestone');
      milestones.forEach(milestone => {
        milestone.addEventListener('mouseenter', () => {
          this.showMilestoneTooltip(milestone);
        });
        milestone.addEventListener('mouseleave', () => {
          this.hideMilestoneTooltip();
        });
      });
    }

    showMilestoneTooltip(milestone) {
      const index = parseInt(milestone.dataset.index);
      const project = projectData[this.currentProject];
      const milestoneData = project.milestones[index];

      // Remove existing tooltip
      this.hideMilestoneTooltip();

      const tooltip = document.createElement('div');
      tooltip.className = 'milestone-tooltip';
      tooltip.innerHTML = `
        <div style="
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 15, 16, 0.98);
          border: 1px solid rgba(201, 206, 214, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 10px;
          white-space: nowrap;
          z-index: 100;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        ">
          <div style="font-weight: 600; margin-bottom: 4px;">${milestoneData.name}</div>
          <div style="color: var(--slate); font-size: 12px;">${milestoneData.date}</div>
        </div>
      `;
      
      milestone.style.position = 'relative';
      milestone.appendChild(tooltip);
    }

    hideMilestoneTooltip() {
      const tooltip = this.container.querySelector('.milestone-tooltip');
      if (tooltip) tooltip.remove();
    }

    animateProgress() {
      // Animate percentage counter
      const percentageEl = this.container.querySelector('.progress-percentage');
      if (!percentageEl) return;

      const target = parseInt(percentageEl.dataset.target);
      let current = 0;
      const duration = 1500;
      const increment = target / (duration / 16);

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          percentageEl.textContent = Math.floor(current) + '%';
          requestAnimationFrame(updateCounter);
        } else {
          percentageEl.textContent = target + '%';
        }
      };

      // Use IntersectionObserver for animation trigger
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            updateCounter();
            observer.disconnect();
          }
        });
      }, { threshold: 0.5 });

      observer.observe(percentageEl);
    }
  }

  // Initialize dashboard
  new ProjectStatusDashboard();

})();
