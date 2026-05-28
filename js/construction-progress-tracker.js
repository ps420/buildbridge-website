/**
 * CONSTRUCTION PROGRESS TRACKER - v41 Fortune 500
 * Animated project progress visualization
 */

class ConstructionProgressTracker {
  constructor() {
    this.currentProject = 0;
    this.projects = [
      {
        id: 1,
        name: 'Cape Town Luxury Residence',
        location: '📍 Cape Town, Western Cape',
        progress: 78,
        status: 'active',
        startDate: '2024-08-15',
        targetDate: '2025-06-30',
        value: 'R12.5M',
        phases: [
          { name: 'Planning', icon: '📋', completed: true },
          { name: 'Foundation', icon: '🏗️', completed: true },
          { name: 'Structure', icon: '🔨', completed: true },
          { name: 'Finishing', icon: '✨', completed: false, active: true },
          { name: 'Handover', icon: '🏠', completed: false }
        ],
        milestones: [
          { title: 'Site Preparation', description: 'Clearing and excavation completed', status: 'completed', date: 'Aug 2024', progress: 100, icon: '🚜' },
          { title: 'Foundation Laid', description: 'Concrete foundation poured and set', status: 'completed', date: 'Sep 2024', progress: 100, icon: '🏗️' },
          { title: 'Frame Construction', description: 'Structural framework erected', status: 'completed', date: 'Nov 2024', progress: 100, icon: '📐' },
          { title: 'Roof Installation', description: 'Roofing completed', status: 'completed', date: 'Jan 2025', progress: 100, icon: '🏠' },
          { title: 'Interior Finishing', description: 'Plastering, painting in progress', status: 'in-progress', date: 'Mar 2025', progress: 65, icon: '🎨' },
          { title: 'Final Inspection', description: 'Quality checks and handover prep', status: 'pending', date: 'Jun 2025', progress: 0, icon: '✓' }
        ]
      },
      {
        id: 2,
        name: 'Johannesburg Corporate HQ',
        location: '📍 Sandton, Gauteng',
        progress: 45,
        status: 'active',
        startDate: '2024-10-01',
        targetDate: '2026-02-28',
        value: 'R45M',
        phases: [
          { name: 'Planning', icon: '📋', completed: true },
          { name: 'Foundation', icon: '🏗️', completed: true },
          { name: 'Structure', icon: '🔨', completed: false, active: true },
          { name: 'Finishing', icon: '✨', completed: false },
          { name: 'Handover', icon: '🏠', completed: false }
        ],
        milestones: [
          { title: 'Concept Design', description: 'Architectural plans approved', status: 'completed', date: 'Oct 2024', progress: 100, icon: '📐' },
          { title: 'Permits Acquired', description: 'All regulatory approvals obtained', status: 'completed', date: 'Nov 2024', progress: 100, icon: '📄' },
          { title: 'Foundation Phase', description: 'Deep foundation for 12-story structure', status: 'completed', date: 'Jan 2025', progress: 100, icon: '🏗️' },
          { title: 'Steel Framework', description: 'Structural steel installation ongoing', status: 'in-progress', date: 'May 2025', progress: 45, icon: '🔩' },
          { title: 'Cladding Installation', description: 'Glass and aluminum facade', status: 'pending', date: 'Aug 2025', progress: 0, icon: '🪟' },
          { title: 'Interior Fit-out', description: 'Office space construction', status: 'pending', date: 'Dec 2025', progress: 0, icon: '🏢' }
        ]
      },
      {
        id: 3,
        name: 'Durban Waterfront Complex',
        location: '📍 Durban, KwaZulu-Natal',
        progress: 92,
        status: 'active',
        startDate: '2024-05-20',
        targetDate: '2025-04-15',
        value: 'R28M',
        phases: [
          { name: 'Planning', icon: '📋', completed: true },
          { name: 'Foundation', icon: '🏗️', completed: true },
          { name: 'Structure', icon: '🔨', completed: true },
          { name: 'Finishing', icon: '✨', completed: true },
          { name: 'Handover', icon: '🏠', completed: false, active: true }
        ],
        milestones: [
          { title: 'Site Acquisition', description: 'Waterfront property secured', status: 'completed', date: 'May 2024', progress: 100, icon: '🏝️' },
          { title: 'Marine Engineering', description: 'Coastal construction protocols', status: 'completed', date: 'Jun 2024', progress: 100, icon: '🌊' },
          { title: 'Substructure', description: 'Piling and base construction', status: 'completed', date: 'Aug 2024', progress: 100, icon: '🏗️' },
          { title: 'Superstructure', description: 'Building frame and floors', status: 'completed', date: 'Dec 2024', progress: 100, icon: '🏢' },
          { title: 'Luxury Finishes', description: 'Premium materials and details', status: 'completed', date: 'Feb 2025', progress: 100, icon: '✨' },
          { title: 'Final Walkthrough', description: 'Client inspection and acceptance', status: 'in-progress', date: 'Apr 2025', progress: 85, icon: '👁️' }
        ]
      }
    ];
    
    this.activities = [
      { type: 'completed', icon: '📋', text: 'Milestone completed: Roof Installation', time: '2 hours ago' },
      { type: 'progress', icon: '🎨', text: 'Interior Finishing phase at 65% completion', time: '5 hours ago' },
      { type: 'update', icon: '👷', text: '12 contractors on site today', time: '8 hours ago' },
      { type: 'completed', icon: '✓', text: 'Weekly quality inspection passed', time: '1 day ago' },
      { type: 'update', icon: '📊', text: 'Project remains on schedule and budget', time: '1 day ago' }
    ];
    
    this.init();
  }
  
  init() {
    this.createSection();
    this.render();
    this.animateProgress();
    this.startRealtimeUpdates();
  }
  
  createSection() {
    // Check if section already exists
    if (document.getElementById('progress-tracker')) return;
    
    const section = document.createElement('section');
    section.id = 'progress-tracker';
    section.className = 'progress-tracker-section';
    section.dataset.section = 'Progress';
    section.dataset.navLabel = 'Progress';
    
    // Insert after stats section
    const statsSection = document.getElementById('stats');
    if (statsSection) {
      statsSection.after(section);
    } else {
      document.body.appendChild(section);
    }
    
    this.section = section;
  }
  
  render() {
    const project = this.projects[this.currentProject];
    
    this.section.innerHTML = `
      <div class="progress-tracker-container">
        <div class="progress-tracker-header">
          <p class="eyebrow">Live Project Tracking</p>
          <h2>Construction <span>Progress</span></h2>
          <p>Real-time updates on our active construction projects across South Africa</p>
        </div>
        
        <div class="project-selector">
          ${this.projects.map((p, i) => `
            <button class="project-selector-btn ${i === this.currentProject ? 'active' : ''}" data-index="${i}">
              <span class="project-status-dot ${p.status}"></span>
              ${p.name}
            </button>
          `).join('')}
        </div>
        
        <div class="progress-main-display">
          <div class="progress-header-row">
            <div class="progress-project-info">
              <h3>${project.name}</h3>
              <p class="project-location">${project.location}</p>
            </div>
            <div class="progress-stats-row">
              <div class="progress-stat">
                <div class="progress-stat-value">${project.value}</div>
                <div class="progress-stat-label">Value</div>
              </div>
              <div class="progress-stat">
                <div class="progress-stat-value">${this.calculateDaysLeft(project.targetDate)}</div>
                <div class="progress-stat-label">Days Left</div>
              </div>
            </div>
          </div>
          
          <div class="progress-circular-container">
            <div class="progress-circular">
              <svg viewBox="0 0 220 220">
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#C9CED6"/>
                    <stop offset="100%" style="stop-color:#F5F7FA"/>
                  </linearGradient>
                </defs>
                <circle class="progress-circular-bg" cx="110" cy="110" r="100"/>
                <circle class="progress-circular-fill" cx="110" cy="110" r="100" 
                        style="stroke-dashoffset: ${628 - (628 * project.progress / 100)}"/>
              </svg>
              <div class="progress-circular-content">
                <div class="progress-percentage">${project.progress}%</div>
                <div class="progress-label">Complete</div>
              </div>
            </div>
          </div>
          
          <div class="progress-phases">
            ${project.phases.map(phase => `
              <div class="progress-phase ${phase.completed ? 'completed' : ''} ${phase.active ? 'active' : ''}">
                <div class="progress-phase-icon">${phase.icon}</div>
                <div class="progress-phase-name">${phase.name}</div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="progress-milestones">
          ${project.milestones.map(m => `
            <div class="milestone-card ${m.status}">
              <div class="milestone-header">
                <div class="milestone-icon">${m.icon}</div>
                <span class="milestone-status ${m.status}">${m.status.replace('-', ' ')}</span>
              </div>
              <h4 class="milestone-title">${m.title}</h4>
              <p class="milestone-description">${m.description}</p>
              <div class="milestone-bar">
                <div class="milestone-bar-fill ${m.status}" style="width: ${m.progress}%"></div>
              </div>
              <div class="milestone-meta">
                <span class="milestone-date">📅 ${m.date}</span>
                <span class="milestone-progress-mini">${m.progress}%</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="progress-activity">
          <div class="activity-header">
            <h4>🔔 Recent Activity</h4>
            <div class="activity-live-indicator">
              <span class="activity-live-dot"></span>
              Live Updates
            </div>
          </div>
          <div class="activity-list">
            ${this.activities.map(a => `
              <div class="activity-item">
                <div class="activity-icon ${a.type}">${a.icon}</div>
                <div class="activity-content">
                  <p class="activity-text">${a.text}</p>
                  <span class="activity-time">${a.time}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    this.bindEvents();
  }
  
  bindEvents() {
    const buttons = this.section.querySelectorAll('.project-selector-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentProject = parseInt(btn.dataset.index);
        this.render();
        this.animateProgress();
      });
    });
  }
  
  animateProgress() {
    // Animate circular progress
    const circle = this.section.querySelector('.progress-circular-fill');
    if (circle) {
      const project = this.projects[this.currentProject];
      const offset = 628 - (628 * project.progress / 100);
      
      // Reset first
      circle.style.strokeDashoffset = '628';
      
      // Trigger animation
      requestAnimationFrame(() => {
        setTimeout(() => {
          circle.style.strokeDashoffset = offset;
        }, 100);
      });
    }
    
    // Animate milestone bars
    const bars = this.section.querySelectorAll('.milestone-bar-fill');
    bars.forEach((bar, i) => {
      const width = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.width = width;
      }, 200 + (i * 100));
    });
  }
  
  calculateDaysLeft(targetDate) {
    const target = new Date(targetDate);
    const now = new Date();
    const diff = target - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
  
  startRealtimeUpdates() {
    // Simulate real-time progress updates
    setInterval(() => {
      if (Math.random() > 0.7) {
        const project = this.projects[this.currentProject];
        if (project.progress < 100 && project.status === 'active') {
          project.progress = Math.min(100, project.progress + 1);
          
          // Update milestone if needed
          const activeMilestone = project.milestones.find(m => m.status === 'in-progress');
          if (activeMilestone && activeMilestone.progress < 100) {
            activeMilestone.progress = Math.min(100, activeMilestone.progress + 2);
            if (activeMilestone.progress >= 100) {
              activeMilestone.status = 'completed';
              // Move to next milestone
              const nextMilestone = project.milestones.find(m => m.status === 'pending');
              if (nextMilestone) {
                nextMilestone.status = 'in-progress';
                nextMilestone.progress = 10;
              }
            }
          }
          
          this.render();
          this.animateProgress();
        }
      }
    }, 15000); // Check every 15 seconds
    
    // Simulate new activities
    setInterval(() => {
      if (Math.random() > 0.8) {
        const activityTypes = [
          { type: 'completed', icon: '✓', text: 'Task completed by contractor team' },
          { type: 'progress', icon: '📈', text: 'Daily progress target achieved' },
          { type: 'update', icon: '👷', text: 'New materials delivered to site' },
          { type: 'completed', icon: '🔍', text: 'Quality checkpoint passed' }
        ];
        
        const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        this.activities.unshift({
          ...randomActivity,
          time: 'Just now'
        });
        
        // Keep only 5 activities
        if (this.activities.length > 5) {
          this.activities.pop();
        }
        
        // Update times
        this.activities[1].time = 'A moment ago';
        
        this.render();
      }
    }, 20000);
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ConstructionProgressTracker());
} else {
  new ConstructionProgressTracker();
}
