/**
 * Project Countdown Widget - v68.0
 * Fortune 500 Professional Project Timeline Display
 * Real-time countdown timers for project milestones
 */

(function() {
  'use strict';

  const ProjectCountdown = {
    // Project data with deadlines
    projects: [
      {
        id: 'project-1',
        name: 'Cape Town Luxury Estate',
        category: 'Residential',
        location: 'Cape Town, Western Cape',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // Started 120 days ago
        milestone: 'Project Completion',
        status: 'active',
        image: 'assets/02_Website_Heroes/Hero_1.png',
        featured: true
      },
      {
        id: 'project-2',
        name: 'Johannesburg Corporate HQ',
        category: 'Commercial',
        location: 'Sandton, Gauteng',
        deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        milestone: 'Structural Handover',
        status: 'active',
        image: 'assets/02_Website_Heroes/Hero_2.png',
        featured: false
      },
      {
        id: 'project-3',
        name: 'Durban Waterfront Complex',
        category: 'Mixed-Use',
        location: 'Durban, KwaZulu-Natal',
        deadline: new Date(Date.now() + 210 * 24 * 60 * 60 * 1000), // 210 days
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        milestone: 'Foundation Complete',
        status: 'upcoming',
        image: 'assets/03_Social_Campaign/Campaign_4.png',
        featured: false
      },
      {
        id: 'project-4',
        name: 'Pretoria Industrial Park',
        category: 'Industrial',
        location: 'Pretoria, Gauteng',
        deadline: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000), // 85 days
        startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        milestone: 'Final Inspection',
        status: 'active',
        image: 'assets/03_Social_Campaign/Campaign_5.png',
        featured: false
      }
    ],

    // Configuration
    config: {
      updateInterval: 1000, // 1 second
      animationDuration: 300
    },

    // State
    intervals: {},
    initialized: false,

    init() {
      if (this.initialized) return;
      this.initialized = true;

      this.createSection();
      this.createCountdowns();
      this.startTimers();
      this.initIntersectionObserver();
      this.bindEvents();
    },

    createSection() {
      if (document.getElementById('project-countdowns')) return;

      const section = document.createElement('section');
      section.id = 'project-countdowns';
      section.className = 'project-countdown-section';
      section.setAttribute('data-section', 'ProjectCountdowns');
      section.setAttribute('data-nav-label', 'Project Timelines');

      section.innerHTML = `
        <div class="countdown-section-header">
          <span class="eyebrow">Live Tracking</span>
          <h2>Project <span>Countdowns</span></h2>
          <p>Real-time progress tracking for our active construction projects. See exactly when each milestone is approaching.</p>
        </div>
        <div class="countdown-widget-grid" id="countdownWidgetGrid"></div>
      `;

      // Insert before footer or after projects section
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        projectsSection.after(section);
      } else {
        const footer = document.querySelector('footer');
        if (footer) {
          footer.before(section);
        } else {
          document.body.appendChild(section);
        }
      }
    },

    createCountdowns() {
      const grid = document.getElementById('countdownWidgetGrid');
      if (!grid) return;

      this.projects.forEach((project, index) => {
        const card = this.createCountdownCard(project, index);
        grid.appendChild(card);
      });
    },

    createCountdownCard(project, index) {
      const card = document.createElement('div');
      card.className = `countdown-card ${project.featured ? 'countdown-featured' : ''}`;
      card.dataset.projectId = project.id;
      card.style.transitionDelay = `${index * 100}ms`;

      const isFeatured = project.featured;
      const statusClass = project.status;
      const statusText = project.status === 'active' ? 'Active' : 
                         project.status === 'upcoming' ? 'Upcoming' : 'Completed';

      // Calculate progress
      const totalDuration = project.deadline - project.startDate;
      const elapsed = Date.now() - project.startDate;
      const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      const remaining = Math.max(0, project.deadline - Date.now());

      const html = isFeatured ? this.getFeaturedTemplate(project, statusClass, statusText, progress) :
                                this.getStandardTemplate(project, statusClass, statusText, progress);

      card.innerHTML = html;
      return card;
    },

    getStandardTemplate(project, statusClass, statusText, progress) {
      return `
        <div class="countdown-status ${statusClass}">${statusText}</div>
        
        <div class="countdown-project-info">
          <span class="countdown-project-category">${project.category}</span>
          <h3 class="countdown-project-name">${project.name}</h3>
          <p class="countdown-project-location">${project.location}</p>
        </div>
        
        <div class="countdown-display" data-deadline="${project.deadline.toISOString()}">
          <div class="countdown-unit">
            <span class="countdown-value days" data-unit="days">00</span>
            <span class="countdown-label">Days</span>
          </div>
          <div class="countdown-unit">
            <span class="countdown-value hours" data-unit="hours">00</span>
            <span class="countdown-label">Hours</span>
          </div>
          <div class="countdown-unit">
            <span class="countdown-value minutes" data-unit="minutes">00</span>
            <span class="countdown-label">Mins</span>
          </div>
          <div class="countdown-unit">
            <span class="countdown-value seconds" data-unit="seconds">00</span>
            <span class="countdown-label">Secs</span>
          </div>
        </div>
        
        <div class="countdown-progress-wrapper">
          <div class="countdown-progress-header">
            <span class="countdown-progress-label">Project Progress</span>
            <span class="countdown-progress-value">${Math.round(progress)}%</span>
          </div>
          <div class="countdown-progress-track">
            <div class="countdown-progress-fill" style="width: ${progress}%"></div>
          </div>
        </div>
        
        <div class="countdown-milestone">
          <div class="countdown-milestone-icon">🎯</div>
          <div class="countdown-milestone-info">
            <span class="countdown-milestone-label">Next Milestone</span>
            <span class="countdown-milestone-name">${project.milestone}</span>
          </div>
          <div class="countdown-milestone-date">${this.formatDate(project.deadline)}</div>
        </div>
        
        <div class="countdown-actions">
          <a href="projects.html" class="countdown-btn primary">View Details</a>
          <button class="countdown-btn" onclick="ProjectCountdown.subscribeToUpdates('${project.id}')">Get Updates</button>
        </div>
      `;
    },

    getFeaturedTemplate(project, statusClass, statusText, progress) {
      return `
        <div class="countdown-featured-content">
          <div class="countdown-status ${statusClass}">${statusText}</div>
          
          <div class="countdown-project-info">
            <span class="countdown-project-category">${project.category}</span>
            <h3 class="countdown-project-name">${project.name}</h3>
            <p class="countdown-project-location">${project.location}</p>
          </div>
          
          <div class="countdown-display" data-deadline="${project.deadline.toISOString()}">
            <div class="countdown-unit">
              <span class="countdown-value days" data-unit="days">00</span>
              <span class="countdown-label">Days</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-value hours" data-unit="hours">00</span>
              <span class="countdown-label">Hours</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-value minutes" data-unit="minutes">00</span>
              <span class="countdown-label">Minutes</span>
            </div>
            <div class="countdown-unit">
              <span class="countdown-value seconds" data-unit="seconds">00</span>
              <span class="countdown-label">Seconds</span>
            </div>
          </div>
          
          <div class="countdown-progress-wrapper">
            <div class="countdown-progress-header">
              <span class="countdown-progress-label">Overall Progress</span>
              <span class="countdown-progress-value">${Math.round(progress)}% Complete</span>
            </div>
            <div class="countdown-progress-track">
              <div class="countdown-progress-fill" style="width: ${progress}%"></div>
            </div>
          </div>
          
          <div class="countdown-actions">
            <a href="projects.html" class="countdown-btn primary">See Full Details →</a>
            <button class="countdown-btn" onclick="ProjectCountdown.subscribeToUpdates('${project.id}')">📧 Subscribe</button>
          </div>
        </div>
        
        <div class="countdown-featured-visual">
          <img src="${project.image}" alt="${project.name}" loading="lazy">
          <div class="countdown-featured-overlay"></div>
          <span class="countdown-featured-badge">Featured Project</span>
        </div>
      `;
    },

    startTimers() {
      const updateAll = () => {
        document.querySelectorAll('.countdown-display').forEach(display => {
          const deadline = new Date(display.dataset.deadline);
          this.updateTimer(display, deadline);
        });
      };

      // Initial update
      updateAll();

      // Start interval
      this.timerInterval = setInterval(updateAll, this.config.updateInterval);
    },

    updateTimer(display, deadline) {
      const now = Date.now();
      const remaining = deadline - now;

      if (remaining <= 0) {
        // Timer complete
        display.querySelectorAll('.countdown-value').forEach(el => {
          el.textContent = '00';
        });
        return;
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      this.updateUnit(display, 'days', days);
      this.updateUnit(display, 'hours', hours);
      this.updateUnit(display, 'minutes', minutes);
      this.updateUnit(display, 'seconds', seconds);
    },

    updateUnit(display, unit, value) {
      const element = display.querySelector(`[data-unit="${unit}"]`);
      if (!element) return;

      const formatted = value.toString().padStart(2, '0');
      const current = element.textContent;

      if (current !== formatted) {
        element.textContent = formatted;
        element.classList.add('countdown-updated');
        setTimeout(() => element.classList.remove('countdown-updated'), 300);
      }
    },

    formatDate(date) {
      return date.toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    },

    subscribeToUpdates(projectId) {
      // Show subscription modal or toast
      if (window.Toast) {
        Toast.success('You\'ll receive updates about this project!', {
          title: 'Subscribed',
          duration: 4000
        });
      } else {
        alert('You\'ll receive email updates about this project!');
      }
      
      console.log(`Subscribed to updates for project: ${projectId}`);
    },

    initIntersectionObserver() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('countdown-visible');
            
            // Animate progress bars
            const progressBar = entry.target.querySelector('.countdown-progress-fill');
            if (progressBar) {
              const targetWidth = progressBar.style.width;
              progressBar.style.width = '0%';
              setTimeout(() => {
                progressBar.style.width = targetWidth;
              }, 200);
            }
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      });

      document.querySelectorAll('.countdown-card').forEach(card => {
        observer.observe(card);
      });
    },

    createTooltip() {
      const tooltip = document.createElement('div');
      tooltip.className = 'countdown-tooltip';
      tooltip.id = 'countdownTooltip';
      document.body.appendChild(tooltip);
      return tooltip;
    },

    bindEvents() {
      const tooltip = this.createTooltip();

      // Tooltip for countdown units
      document.addEventListener('mouseover', (e) => {
        const unit = e.target.closest('.countdown-unit');
        if (unit) {
          const display = unit.closest('.countdown-display');
          const card = display.closest('.countdown-card');
          const projectId = card.dataset.projectId;
          const project = this.projects.find(p => p.id === projectId);
          
          if (project) {
            const deadline = new Date(display.dataset.deadline);
            const now = Date.now();
            const remaining = Math.max(0, deadline - now);
            const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
            
            tooltip.innerHTML = `
              <h4>${project.name}</h4>
              <p>${project.milestone} approaching in ${days} days. Subscribe to get milestone notifications and progress updates.</p>
              <div class="countdown-tooltip-meta">
                <div class="countdown-tooltip-meta-item">
                  <span class="countdown-tooltip-meta-label">Category</span>
                  <span class="countdown-tooltip-meta-value">${project.category}</span>
                </div>
                <div class="countdown-tooltip-meta-item">
                  <span class="countdown-tooltip-meta-label">Location</span>
                  <span class="countdown-tooltip-meta-value">${project.location}</span>
                </div>
              </div>
            `;
            tooltip.classList.add('visible');
          }
        }
      });

      document.addEventListener('mouseout', (e) => {
        const unit = e.target.closest('.countdown-unit');
        if (unit) {
          tooltip.classList.remove('visible');
        }
      });

      document.addEventListener('mousemove', (e) => {
        if (tooltip.classList.contains('visible')) {
          const x = e.clientX + 15;
          const y = e.clientY + 15;
          
          const rect = tooltip.getBoundingClientRect();
          const winWidth = window.innerWidth;
          const winHeight = window.innerHeight;
          
          let finalX = x;
          let finalY = y;
          
          if (x + rect.width > winWidth) finalX = e.clientX - rect.width - 15;
          if (y + rect.height > winHeight) finalY = e.clientY - rect.height - 15;
          
          tooltip.style.left = `${finalX}px`;
          tooltip.style.top = `${finalY}px`;
        }
      });

      // Clean up on page unload
      window.addEventListener('beforeunload', () => {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
      });
    },

    // Public API to add/remove projects
    addProject(project) {
      this.projects.push(project);
      const grid = document.getElementById('countdownWidgetGrid');
      if (grid) {
        const card = this.createCountdownCard(project, this.projects.length - 1);
        grid.appendChild(card);
        
        // Trigger visibility check
        setTimeout(() => {
          card.classList.add('countdown-visible');
        }, 100);
      }
    },

    removeProject(projectId) {
      const index = this.projects.findIndex(p => p.id === projectId);
      if (index > -1) {
        this.projects.splice(index, 1);
        const card = document.querySelector(`.countdown-card[data-project-id="${projectId}"]`);
        if (card) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => card.remove(), 500);
        }
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProjectCountdown.init());
  } else {
    ProjectCountdown.init();
  }

  // Expose to global scope
  window.ProjectCountdown = ProjectCountdown;

})();
