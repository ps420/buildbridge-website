/**
 * Project Timeline Gantt Chart
 * v75.0: Fortune 500 Project Visualization System
 */

class ProjectTimelineGantt {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.options = {
      viewMode: options.viewMode || 'month', // 'month', 'week', 'day'
      filter: options.filter || 'all', // 'all', 'active', 'completed', 'pending'
      showWeekends: options.showWeekends !== false,
      ...options
    };
    
    this.projects = options.projects || this.getDefaultProjects();
    this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.tooltip = null;
    
    this.init();
  }
  
  init() {
    if (!this.container) return;
    
    this.createTooltip();
    this.render();
    this.bindEvents();
    this.animateBars();
  }
  
  getDefaultProjects() {
    const currentYear = new Date().getFullYear();
    return [
      {
        id: 1,
        name: 'Cape Town Office Tower',
        client: 'Metro Developments',
        startDate: new Date(currentYear, 0, 15),
        endDate: new Date(currentYear, 5, 30),
        progress: 75,
        status: 'active',
        type: 'commercial',
        image: 'assets/02_Website_Heroes/Hero_1.png',
        milestones: [
          { date: new Date(currentYear, 1, 15), name: 'Foundation Complete' },
          { date: new Date(currentYear, 3, 1), name: 'Structure Complete' }
        ]
      },
      {
        id: 2,
        name: 'Durban Residential Complex',
        client: 'Coastal Living',
        startDate: new Date(currentYear, 1, 1),
        endDate: new Date(currentYear, 7, 15),
        progress: 45,
        status: 'active',
        type: 'residential',
        image: 'assets/02_Website_Heroes/Hero_2.png',
        milestones: [
          { date: new Date(currentYear, 2, 15), name: 'Site Prep Done' }
        ]
      },
      {
        id: 3,
        name: 'Johannesburg Mall Renovation',
        client: 'Retail Properties Ltd',
        startDate: new Date(currentYear, 2, 10),
        endDate: new Date(currentYear, 8, 30),
        progress: 30,
        status: 'active',
        type: 'commercial',
        image: 'assets/03_Social_Campaign/Campaign_4.png',
        milestones: []
      },
      {
        id: 4,
        name: 'Pretoria Industrial Park',
        client: 'Logistics SA',
        startDate: new Date(currentYear, 3, 1),
        endDate: new Date(currentYear, 9, 15),
        progress: 15,
        status: 'pending',
        type: 'industrial',
        image: 'assets/03_Social_Campaign/Campaign_5.png',
        milestones: [
          { date: new Date(currentYear, 3, 15), name: 'Permits Approved' }
        ]
      },
      {
        id: 5,
        name: 'Stellenbosch Wine Estate',
        client: 'Cape Vineyards',
        startDate: new Date(currentYear - 1, 8, 1),
        endDate: new Date(currentYear, 2, 28),
        progress: 100,
        status: 'completed',
        type: 'residential',
        image: 'assets/02_Website_Heroes/Hero_3.png',
        milestones: [
          { date: new Date(currentYear - 1, 10, 1), name: 'Cellar Complete' },
          { date: new Date(currentYear, 1, 15), name: 'Tasting Room Open' }
        ]
      },
      {
        id: 6,
        name: 'Port Elizabeth Hospital Wing',
        client: 'Eastern Cape Health',
        startDate: new Date(currentYear, 4, 1),
        endDate: new Date(currentYear, 11, 31),
        progress: 0,
        status: 'pending',
        type: 'commercial',
        image: 'assets/02_Website_Heroes/Hero_1.png',
        milestones: []
      }
    ];
  }
  
  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'gantt-tooltip';
    this.tooltip.innerHTML = `
      <div class="gantt-tooltip-header">
        <span class="gantt-tooltip-status"></span>
        <span class="gantt-tooltip-title"></span>
      </div>
      <div class="gantt-tooltip-info">
        <div class="gantt-tooltip-row">
          <span class="gantt-tooltip-label">Duration:</span>
          <span class="gantt-tooltip-value duration"></span>
        </div>
        <div class="gantt-tooltip-row">
          <span class="gantt-tooltip-label">Progress:</span>
          <span class="gantt-tooltip-value progress"></span>
        </div>
        <div class="gantt-tooltip-row">
          <span class="gantt-tooltip-label">Client:</span>
          <span class="gantt-tooltip-value client"></span>
        </div>
      </div>
    `;
    document.body.appendChild(this.tooltip);
  }
  
  render() {
    const filteredProjects = this.getFilteredProjects();
    
    this.container.innerHTML = `
      <div class="timeline-controls">
        <div class="timeline-view-toggle">
          <button class="timeline-view-btn ${this.options.viewMode === 'month' ? 'active' : ''}" data-view="month">Months</button>
          <button class="timeline-view-btn ${this.options.viewMode === 'week' ? 'active' : ''}" data-view="week">Weeks</button>
        </div>
        <div class="timeline-filter">
          <button class="timeline-filter-btn ${this.options.filter === 'all' ? 'active' : ''}" data-filter="all">All Projects</button>
          <button class="timeline-filter-btn ${this.options.filter === 'active' ? 'active' : ''}" data-filter="active">Active</button>
          <button class="timeline-filter-btn ${this.options.filter === 'completed' ? 'active' : ''}" data-filter="completed">Completed</button>
        </div>
      </div>
      
      <div class="gantt-container ${this.options.viewMode === 'week' ? 'gantt-compact' : ''}">
        <div class="gantt-header">
          <div class="gantt-project-col">Project</div>
          <div class="gantt-timeline-col">
            ${this.renderTimelineHeader()}
          </div>
        </div>
        
        <div class="gantt-body">
          ${filteredProjects.map(project => this.renderProjectRow(project)).join('')}
        </div>
      </div>
      
      <div class="gantt-progress-overview">
        <div class="gantt-progress-card">
          <div class="gantt-progress-icon">📊</div>
          <div class="gantt-progress-number" data-count="${this.projects.length}">0</div>
          <div class="gantt-progress-label">Total Projects</div>
        </div>
        <div class="gantt-progress-card">
          <div class="gantt-progress-icon">✓</div>
          <div class="gantt-progress-number" data-count="this.getProjectsByStatus('completed').length}">0</div>
          <div class="gantt-progress-label">Completed</div>
        </div>
        <div class="gantt-progress-card">
          <div class="gantt-progress-icon">🔄</div>
          <div class="gantt-progress-number" data-count="${this.getProjectsByStatus('active').length}">0</div>
          <div class="gantt-progress-label">In Progress</div>
        </div>
        <div class="gantt-progress-card">
          <div class="gantt-progress-icon">📈</div>
          <div class="gantt-progress-number" data-count="${this.getAverageProgress()}">0</div>
          <div class="gantt-progress-label">Avg Progress %</div>
        </div>
      </div>
    `;
  }
  
  renderTimelineHeader() {
    const currentYear = new Date().getFullYear();
    
    if (this.options.viewMode === 'month') {
      return `
        <div class="gantt-months">
          ${this.months.map((month, i) => `
            <div class="gantt-month">${month} ${currentYear}</div>
          `).join('')}
        </div>
      `;
    } else {
      // Week view - simplified
      const weeks = [];
      for (let i = 1; i <= 52; i += 2) {
        weeks.push(`W${i}`);
      }
      return `
        <div class="gantt-weeks">
          ${weeks.map(week => `
            <div class="gantt-week">${week}</div>
          `).join('')}
        </div>
      `;
    }
  }
  
  renderProjectRow(project) {
    const barStyle = this.calculateBarStyle(project);
    
    return `
      <div class="gantt-row" data-project-id="${project.id}">
        <div class="gantt-project-info">
          <div class="gantt-project-avatar">
            <img src="${project.image}" alt="${project.name}" loading="lazy">
          </div>
          <div class="gantt-project-details">
            <h4>${project.name}</h4>
            <div class="gantt-project-meta">
              <span class="gantt-status-dot ${project.status}"></span>
              <span>${this.capitalizeFirst(project.status)}</span>
            </div>
          </div>
        </div>
        
        <div class="gantt-timeline">
          <div class="gantt-grid-lines">
            ${Array(12).fill(0).map(() => `
              <div class="gantt-grid-line"></div>
            `).join('')}
          </div>
          
          <div class="gantt-bar-wrapper">
            <div class="gantt-bar ${project.status}"
                 style="left: ${barStyle.left}%; width: ${barStyle.width}%"
                 data-project-id="${project.id}"
                 data-start="${project.startDate.toISOString()}"
                 data-end="${project.endDate.toISOString()}"
                 data-progress="${project.progress}"
                 data-client="${project.client}">
              <span class="gantt-bar-label">${project.progress}%</span>
              <div class="gantt-bar-progress" style="width: ${project.progress}%"></div>
            </div>
            ${project.milestones.map(m => this.renderMilestone(m, project)).join('')}
          </div>
        </div>
      </div>
    `;
  }
  
  renderMilestone(milestone, project) {
    const position = this.calculateMilestonePosition(milestone.date);
    return `
      <div class="gantt-milestone"
           style="left: ${position}%"
           data-milestone="${milestone.name}"
           data-date="${milestone.date.toLocaleDateString()}">
      </div>
    `;
  }
  
  calculateBarStyle(project) {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const yearEnd = new Date(new Date().getFullYear(), 11, 31);
    const yearDuration = yearEnd - yearStart;
    
    const projectStart = Math.max(project.startDate - yearStart, 0);
    const projectDuration = Math.min(project.endDate - project.startDate, yearDuration);
    
    const left = (projectStart / yearDuration) * 100;
    const width = (projectDuration / yearDuration) * 100;
    
    return { left: Math.max(0, left), width: Math.max(2, width) };
  }
  
  calculateMilestonePosition(date) {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const yearEnd = new Date(new Date().getFullYear(), 11, 31);
    const yearDuration = yearEnd - yearStart;
    const milestoneOffset = date - yearStart;
    
    return (milestoneOffset / yearDuration) * 100;
  }
  
  getFilteredProjects() {
    if (this.options.filter === 'all') return this.projects;
    return this.projects.filter(p => p.status === this.options.filter);
  }
  
  getProjectsByStatus(status) {
    return this.projects.filter(p => p.status === status);
  }
  
  getAverageProgress() {
    const total = this.projects.reduce((sum, p) => sum + p.progress, 0);
    return Math.round(total / this.projects.length);
  }
  
  bindEvents() {
    // View toggle
    this.container.querySelectorAll('.timeline-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.options.viewMode = btn.dataset.view;
        this.render();
        this.bindEvents();
        this.animateBars();
      });
    });
    
    // Filter buttons
    this.container.querySelectorAll('.timeline-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.options.filter = btn.dataset.filter;
        this.render();
        this.bindEvents();
        this.animateBars();
      });
    });
    
    // Bar tooltips
    this.container.querySelectorAll('.gantt-bar').forEach(bar => {
      bar.addEventListener('mouseenter', (e) => this.showTooltip(e, bar));
      bar.addEventListener('mouseleave', () => this.hideTooltip());
      bar.addEventListener('mousemove', (e) => this.moveTooltip(e));
    });
    
    // Milestone tooltips
    this.container.querySelectorAll('.gantt-milestone').forEach(milestone => {
      milestone.addEventListener('mouseenter', (e) => {
        const name = milestone.dataset.milestone;
        const date = milestone.dataset.date;
        this.tooltip.innerHTML = `
          <div class="gantt-tooltip-header">
            <span style="font-size: 16px;">🎯</span>
            <span class="gantt-tooltip-title">${name}</span>
          </div>
          <div style="font-size: 12px; color: var(--chrome); margin-top: 8px;">
            ${date}
          </div>
        `;
        this.tooltip.classList.add('visible');
      });
      milestone.addEventListener('mouseleave', () => this.hideTooltip());
    });
  }
  
  showTooltip(e, bar) {
    const start = new Date(bar.dataset.start);
    const end = new Date(bar.dataset.end);
    const progress = bar.dataset.progress;
    const client = bar.dataset.client;
    const status = bar.classList.contains('active') ? 'active' : 
                   bar.classList.contains('completed') ? 'completed' : 'pending';
    
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    this.tooltip.querySelector('.gantt-tooltip-status').className = `gantt-tooltip-status gantt-status-dot ${status}`;
    this.tooltip.querySelector('.gantt-tooltip-title').textContent = bar.querySelector('.gantt-bar-label').parentElement.parentElement.parentElement.querySelector('h4')?.textContent || 'Project';
    this.tooltip.querySelector('.duration').textContent = `${duration} days`;
    this.tooltip.querySelector('.progress').textContent = `${progress}%`;
    this.tooltip.querySelector('.client').textContent = client;
    
    this.tooltip.classList.add('visible');
    this.moveTooltip(e);
  }
  
  moveTooltip(e) {
    const x = e.clientX + 15;
    const y = e.clientY - 10;
    
    // Keep tooltip on screen
    const rect = this.tooltip.getBoundingClientRect();
    const finalX = x + rect.width > window.innerWidth - 20 ? e.clientX - rect.width - 15 : x;
    const finalY = y + rect.height > window.innerHeight - 20 ? e.clientY - rect.height - 10 : y;
    
    this.tooltip.style.left = `${finalX}px`;
    this.tooltip.style.top = `${finalY}px`;
  }
  
  hideTooltip() {
    this.tooltip.classList.remove('visible');
  }
  
  animateBars() {
    const bars = this.container.querySelectorAll('.gantt-bar');
    
    bars.forEach((bar, index) => {
      bar.style.width = '0';
      setTimeout(() => {
        const targetWidth = this.calculateBarStyle(
          this.projects.find(p => p.id == bar.dataset.projectId)
        ).width;
        bar.style.transition = 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        bar.style.width = `${targetWidth}%`;
      }, index * 100);
    });
    
    // Animate counters
    this.container.querySelectorAll('[data-count]').forEach(counter => {
      const target = parseInt(counter.dataset.count);
      this.animateCounter(counter, target);
    });
  }
  
  animateCounter(element, target) {
    let current = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    
    const update = () => {
      current += step;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    };
    
    update();
  }
  
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.project-timeline-gantt');
  containers.forEach(container => {
    new ProjectTimelineGantt(container);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectTimelineGantt;
}
