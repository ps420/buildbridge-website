/**
 * v50.0: Real-time Project Status Dashboard
 * Fortune 500 Professional Project Tracking System
 */

(function() {
  'use strict';

  // Sample Project Data
  const PROJECTS_DATA = [
    {
      id: 1,
      name: "Cape Town Luxury Estate",
      client: "Private Residence",
      location: "Camps Bay, Cape Town",
      status: "in-progress",
      progress: 68,
      value: "R12.5M",
      startDate: "2024-03-15",
      endDate: "2025-02-28",
      milestones: [
        { name: "Planning", status: "completed", icon: "📋" },
        { name: "Foundation", status: "completed", icon: "🏗️" },
        { name: "Structure", status: "completed", icon: "🏢" },
        { name: "Finishing", status: "active", icon: "✨" },
        { name: "Handover", status: "pending", icon: "🔑" }
      ],
      quickStats: {
        daysRemaining: 120,
        budgetUsed: "58%",
        teamSize: 24
      }
    },
    {
      id: 2,
      name: "Johannesburg Corporate HQ",
      client: "TechCorp Africa",
      location: "Sandton, Johannesburg",
      status: "in-progress",
      progress: 42,
      value: "R45M",
      startDate: "2024-06-01",
      endDate: "2025-08-15",
      milestones: [
        { name: "Planning", status: "completed", icon: "📋" },
        { name: "Foundation", status: "completed", icon: "🏗️" },
        { name: "Structure", status: "active", icon: "🏢" },
        { name: "MEP", status: "pending", icon: "⚡" },
        { name: "Finishing", status: "pending", icon: "✨" }
      ],
      quickStats: {
        daysRemaining: 320,
        budgetUsed: "35%",
        teamSize: 56
      }
    },
    {
      id: 3,
      name: "Durban Waterfront Complex",
      client: "OceanView Developments",
      location: "Durban North, KZN",
      status: "planning",
      progress: 15,
      value: "R28M",
      startDate: "2024-09-01",
      endDate: "2026-01-30",
      milestones: [
        { name: "Planning", status: "active", icon: "📋" },
        { name: "Permits", status: "pending", icon: "📄" },
        { name: "Site Prep", status: "pending", icon: "🏗️" },
        { name: "Construction", status: "pending", icon: "🏢" },
        { name: "Completion", status: "pending", icon: "🎉" }
      ],
      quickStats: {
        daysRemaining: 520,
        budgetUsed: "8%",
        teamSize: 12
      }
    },
    {
      id: 4,
      name: "Pretoria Industrial Park",
      client: "LogiTech Distribution",
      location: "Centurion, Pretoria",
      status: "completed",
      progress: 100,
      value: "R65M",
      startDate: "2023-01-10",
      endDate: "2024-05-20",
      milestones: [
        { name: "Planning", status: "completed", icon: "📋" },
        { name: "Foundation", status: "completed", icon: "🏗️" },
        { name: "Structure", status: "completed", icon: "🏢" },
        { name: "Systems", status: "completed", icon: "⚙️" },
        { name: "Handover", status: "completed", icon: "🔑" }
      ],
      quickStats: {
        daysRemaining: 0,
        budgetUsed: "98%",
        teamSize: 0
      }
    }
  ];

  // Recent Activity Data
  const RECENT_ACTIVITY = [
    {
      type: "milestone",
      project: "Cape Town Luxury Estate",
      title: "Milestone Completed",
      description: "Structural phase completed ahead of schedule",
      time: "2 hours ago",
      icon: "🏗️"
    },
    {
      type: "update",
      project: "Johannesburg Corporate HQ",
      title: "Progress Update",
      description: "Floor 8 concrete pour scheduled for tomorrow",
      time: "4 hours ago",
      icon: "📊"
    },
    {
      type: "alert",
      project: "Durban Waterfront Complex",
      title: "Approval Received",
      description: "Environmental impact assessment approved",
      time: "1 day ago",
      icon: "✅"
    },
    {
      type: "completed",
      project: "Pretoria Industrial Park",
      title: "Project Handed Over",
      description: "Final inspection passed, keys delivered",
      time: "3 days ago",
      icon: "🎉"
    },
    {
      type: "milestone",
      project: "Cape Town Luxury Estate",
      title: "Quality Check",
      description: "Interior finishing quality inspection passed",
      time: "4 days ago",
      icon: "✨"
    }
  ];

  class ProjectDashboard {
    constructor() {
      this.projects = [...PROJECTS_DATA];
      this.filter = 'all';
      this.searchTerm = '';
      this.sidebarOpen = false;
      this.init();
    }

    init() {
      this.createDOM();
      this.renderProjects();
      this.renderStats();
      this.attachEvents();
      this.startRealTimeUpdates();
    }

    createDOM() {
      const section = document.querySelector('#project-dashboard');
      if (!section) return;

      section.innerHTML = `
        <div class="dashboard-container">
          <div class="dashboard-header">
            <div class="dashboard-title">
              <h2>Project Dashboard</h2>
              <p>Real-time tracking of all active construction projects</p>
            </div>
            <div class="dashboard-controls">
              <div class="dashboard-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input type="text" id="dashboard-search" placeholder="Search projects...">
              </div>
              <button class="dashboard-filter" id="dashboard-filter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                Filter
              </button>
              <button class="dashboard-filter" id="activity-toggle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                Activity
              </button>
            </div>
          </div>

          <div class="dashboard-stats">
            <div class="stat-card active">
              <div class="stat-card-value">${this.projects.length}</div>
              <div class="stat-card-label">
                Active Projects
                <span class="stat-card-trend up">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                  +2
                </span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card-value">R150M+</div>
              <div class="stat-card-label">
                Total Value
                <span class="stat-card-trend up">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                  +15%
                </span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card-value">156</div>
              <div class="stat-card-label">
                Team Members
                <span class="stat-card-trend up">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                  +8
                </span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card-value">94%</div>
              <div class="stat-card-label">
                On Time
                <span class="stat-card-trend down">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                    <polyline points="17 18 23 18 23 12"/>
                  </svg>
                  -2%
                </span>
              </div>
            </div>
          </div>

          <div class="projects-grid-dashboard" id="projects-grid"></div>
        </div>

        <!-- Activity Sidebar -->
        <div class="dashboard-sidebar" id="activity-sidebar">
          <div class="sidebar-header">
            <h3>Recent Activity</h3>
            <button class="sidebar-close" id="sidebar-close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="sidebar-content" id="activity-content"></div>
        </div>
      `;

      this.projectsGrid = section.querySelector('#projects-grid');
      this.activitySidebar = section.querySelector('#activity-sidebar');
      this.activityContent = section.querySelector('#activity-content');
    }

    renderProjects() {
      let filtered = this.projects;

      // Apply filter
      if (this.filter !== 'all') {
        filtered = filtered.filter(p => p.status === this.filter);
      }

      // Apply search
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(term) ||
          p.client.toLowerCase().includes(term) ||
          p.location.toLowerCase().includes(term)
        );
      }

      this.projectsGrid.innerHTML = filtered.map(project => `
        <div class="project-status-card" data-project-id="${project.id}">
          <div class="project-status-header">
            <div class="project-status-info">
              <h3>${project.name}</h3>
              <div class="project-status-meta">
                <span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  ${project.location}
                </span>
                <span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  ${this.formatDate(project.endDate)}
                </span>
              </div>
            </div>
            <span class="status-badge ${project.status}">
              ${project.status.replace('-', ' ')}
            </span>
          </div>

          <div class="project-progress-section">
            <div class="progress-header">
              <span class="progress-label">Overall Progress</span>
              <span class="progress-value">${project.progress}%</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: ${project.progress}%"></div>
            </div>

            <div class="project-milestones">
              ${project.milestones.map(m => `
                <div class="milestone ${m.status}">
                  <div class="milestone-icon">${m.status === 'completed' ? '✓' : m.icon}</div>
                  <div class="milestone-label">${m.name}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="project-quick-stats">
            <div class="quick-stat">
              <div class="quick-stat-value">${project.quickStats.daysRemaining}</div>
              <div class="quick-stat-label">Days Left</div>
            </div>
            <div class="quick-stat">
              <div class="quick-stat-value">${project.quickStats.budgetUsed}</div>
              <div class="quick-stat-label">Budget Used</div>
            </div>
            <div class="quick-stat">
              <div class="quick-stat-value">${project.quickStats.teamSize}</div>
              <div class="quick-stat-label">Team Size</div>
            </div>
          </div>

          <button class="project-view-btn">
            View Details
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      `).join('');

      // Animate progress bars
      setTimeout(() => {
        this.projectsGrid.querySelectorAll('.progress-bar').forEach(bar => {
          const width = bar.style.width;
          bar.style.width = '0';
          setTimeout(() => bar.style.width = width, 100);
        });
      }, 100);
    }

    renderStats() {
      // Stats are already in DOM, but we could make them dynamic
    }

    renderActivity() {
      this.activityContent.innerHTML = RECENT_ACTIVITY.map(activity => `
        <div class="activity-item">
          <div class="activity-icon ${activity.type}">${activity.icon}</div>
          <div class="activity-content">
            <h4>${activity.title}</h4>
            <p>${activity.description}</p>
            <div class="activity-time">${activity.time} • ${activity.project}</div>
          </div>
        </div>
      `).join('');
    }

    attachEvents() {
      // Search
      const searchInput = document.getElementById('dashboard-search');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchTerm = e.target.value;
          this.renderProjects();
        });
      }

      // Filter
      const filterBtn = document.getElementById('dashboard-filter');
      if (filterBtn) {
        filterBtn.addEventListener('click', () => {
          const filters = ['all', 'in-progress', 'planning', 'completed'];
          const currentIndex = filters.indexOf(this.filter);
          this.filter = filters[(currentIndex + 1) % filters.length];
          filterBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            ${this.filter === 'all' ? 'Filter' : this.filter.replace('-', ' ')}
          `;
          this.renderProjects();
        });
      }

      // Activity Toggle
      const activityToggle = document.getElementById('activity-toggle');
      const sidebarClose = document.getElementById('sidebar-close');

      if (activityToggle) {
        activityToggle.addEventListener('click', () => this.toggleSidebar());
      }

      if (sidebarClose) {
        sidebarClose.addEventListener('click', () => this.closeSidebar());
      }

      // Close sidebar on outside click
      document.addEventListener('click', (e) => {
        if (this.sidebarOpen && 
            !this.activitySidebar.contains(e.target) && 
            !activityToggle?.contains(e.target)) {
          this.closeSidebar();
        }
      });
    }

    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
      this.activitySidebar.classList.toggle('open', this.sidebarOpen);
      if (this.sidebarOpen) {
        this.renderActivity();
      }
    }

    closeSidebar() {
      this.sidebarOpen = false;
      this.activitySidebar.classList.remove('open');
    }

    startRealTimeUpdates() {
      // Simulate real-time progress updates
      setInterval(() => {
        this.projects.forEach(project => {
          if (project.status === 'in-progress' && project.progress < 100) {
            // Random small increment
            if (Math.random() > 0.7) {
              project.progress = Math.min(100, project.progress + 0.1);
            }
          }
        });
        
        // Only update occasionally to avoid DOM thrashing
        if (Math.random() > 0.9) {
          this.updateProgressBars();
        }
      }, 5000);
    }

    updateProgressBars() {
      const cards = this.projectsGrid.querySelectorAll('.project-status-card');
      cards.forEach((card, index) => {
        const project = this.projects[index];
        if (project) {
          const bar = card.querySelector('.progress-bar');
          const value = card.querySelector('.progress-value');
          if (bar && value) {
            bar.style.width = project.progress + '%';
            value.textContent = Math.round(project.progress) + '%';
          }
        }
      });
    }

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-ZA', { 
        month: 'short', 
        year: 'numeric' 
      });
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ProjectDashboard());
  } else {
    new ProjectDashboard();
  }
})();
