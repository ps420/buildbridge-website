/* ========================================
   v101.0: Interactive Project Timeline Visualizer
   Fortune 500 Quality Project Phase Display
   ======================================== */

class ProjectTimelineVisualizer {
  constructor() {
    this.currentProjectType = 'residential';
    this.currentWeek = 0;
    this.timelineData = {
      residential: {
        totalWeeks: 24,
        phases: [
          {
            id: 'planning',
            name: 'Planning & Design',
            icon: '📐',
            duration: 'Weeks 1-4',
            weekStart: 1,
            weekEnd: 4,
            description: 'Initial consultation, architectural drawings, permit applications, and finalizing project specifications.',
            tasks: [
              'Site assessment & measurements',
              'Architectural design drafts',
              'Engineering calculations',
              'Council permit applications',
              'Material selection & ordering'
            ],
            stats: { deliverables: 8, meetings: 5, milestones: 2 }
          },
          {
            id: 'prep',
            name: 'Site Preparation',
            icon: '🏗️',
            duration: 'Weeks 5-6',
            weekStart: 5,
            weekEnd: 6,
            description: 'Site clearing, excavation, foundation preparation, and utility connections setup.',
            tasks: [
              'Site clearing & demolition',
              'Excavation & grading',
              'Foundation marking',
              'Utility disconnections',
              'Site security setup'
            ],
            stats: { deliverables: 5, meetings: 3, milestones: 1 }
          },
          {
            id: 'foundation',
            name: 'Foundation & Structure',
            icon: '🧱',
            duration: 'Weeks 7-12',
            weekStart: 7,
            weekEnd: 12,
            description: 'Foundation pouring, structural framework, load-bearing walls, and roof structure installation.',
            tasks: [
              'Foundation pouring & curing',
              'Structural framework',
              'Load-bearing walls',
              'Roof truss installation',
              'Structural inspections'
            ],
            stats: { deliverables: 6, meetings: 4, milestones: 3 }
          },
          {
            id: 'envelope',
            name: 'Building Envelope',
            icon: '🏠',
            duration: 'Weeks 13-16',
            weekStart: 13,
            weekEnd: 16,
            description: 'Roofing, exterior walls, windows, doors, and weatherproofing installations.',
            tasks: [
              'Roof covering installation',
              'Exterior wall cladding',
              'Window & door installation',
              'Waterproofing systems',
              'Insulation installation'
            ],
            stats: { deliverables: 7, meetings: 3, milestones: 2 }
          },
          {
            id: 'systems',
            name: 'MEP Systems',
            icon: '⚡',
            duration: 'Weeks 17-20',
            weekStart: 17,
            weekEnd: 20,
            description: 'Electrical, plumbing, HVAC, and smart home system installations with full testing.',
            tasks: [
              'Electrical rough-in & fixtures',
              'Plumbing installations',
              'HVAC system setup',
              'Smart home wiring',
              'System testing & certification'
            ],
            stats: { deliverables: 8, meetings: 5, milestones: 3 }
          },
          {
            id: 'finishing',
            name: 'Interior Finishing',
            icon: '✨',
            duration: 'Weeks 21-23',
            weekStart: 21,
            weekEnd: 23,
            description: 'Drywall, flooring, painting, cabinetry, fixtures, and final interior touches.',
            tasks: [
              'Drywall & plastering',
              'Flooring installation',
              'Painting & finishing',
              'Cabinetry & countertops',
              'Fixture installations'
            ],
            stats: { deliverables: 10, meetings: 4, milestones: 2 }
          },
          {
            id: 'handover',
            name: 'Final & Handover',
            icon: '🔑',
            duration: 'Week 24',
            weekStart: 24,
            weekEnd: 24,
            description: 'Final inspections, snagging list completion, cleaning, documentation, and project handover.',
            tasks: [
              'Final inspections',
              'Snagging list completion',
              'Professional cleaning',
              'Documentation handover',
              'Warranty registration'
            ],
            stats: { deliverables: 6, meetings: 2, milestones: 1 }
          }
        ]
      },
      commercial: {
        totalWeeks: 36,
        phases: [
          {
            id: 'planning',
            name: 'Planning & Compliance',
            icon: '📋',
            duration: 'Weeks 1-6',
            weekStart: 1,
            weekEnd: 6,
            description: 'Comprehensive planning, contractor tendering, compliance reviews, and detailed scheduling.',
            tasks: [
              'Feasibility study',
              'Contractor tendering',
              'Compliance assessment',
              'Detailed scheduling',
              'Risk analysis'
            ],
            stats: { deliverables: 12, meetings: 8, milestones: 3 }
          },
          {
            id: 'prep',
            name: 'Site Mobilization',
            icon: '🚧',
            duration: 'Weeks 7-9',
            weekStart: 7,
            weekEnd: 9,
            description: 'Site establishment, hoarding, equipment mobilization, and preliminary works.',
            tasks: [
              'Site hoarding installation',
              'Equipment mobilization',
              'Site offices setup',
              'Safety systems',
              'Site signage'
            ],
            stats: { deliverables: 8, meetings: 5, milestones: 2 }
          },
          {
            id: 'foundation',
            name: 'Substructure',
            icon: '🏗️',
            duration: 'Weeks 10-16',
            weekStart: 10,
            weekEnd: 16,
            description: 'Deep foundations (if required), basement construction, and ground floor slab.',
            tasks: [
              'Piling (if required)',
              'Basement excavation',
              'Retaining walls',
              'Ground slab pouring',
              'Waterproofing'
            ],
            stats: { deliverables: 10, meetings: 6, milestones: 4 }
          },
          {
            id: 'superstructure',
            name: 'Superstructure',
            icon: '🏢',
            duration: 'Weeks 17-26',
            weekStart: 17,
            weekEnd: 26,
            description: 'Structural frame, floor slabs, core construction, and stair installations.',
            tasks: [
              'Structural steel/frame',
              'Floor slab construction',
              'Core & stair construction',
              'Structural glazing',
              'Fire protection'
            ],
            stats: { deliverables: 12, meetings: 8, milestones: 5 }
          },
          {
            id: 'envelope',
            name: 'Building Envelope',
            icon: '🪟',
            duration: 'Weeks 27-30',
            weekStart: 27,
            weekEnd: 30,
            description: 'Curtain walling, cladding, roofing, and building facade completion.',
            tasks: [
              'Curtain wall installation',
              'External cladding',
              'Roof systems',
              'Facade testing',
              'Weather sealing'
            ],
            stats: { deliverables: 8, meetings: 5, milestones: 3 }
          },
          {
            id: 'systems',
            name: 'Building Services',
            icon: '🔧',
            duration: 'Weeks 31-34',
            weekStart: 31,
            weekEnd: 34,
            description: 'MEP installations, fire systems, security, IT infrastructure, and BMS.',
            tasks: [
              'Electrical distribution',
              'Mechanical systems',
              'Fire protection systems',
              'Security & access control',
              'BMS installation'
            ],
            stats: { deliverables: 15, meetings: 10, milestones: 5 }
          },
          {
            id: 'finishing',
            name: 'Fit-Out & Finishing',
            icon: '🎨',
            duration: 'Weeks 35-35',
            weekStart: 35,
            weekEnd: 35,
            description: 'Tenant improvements, final finishes, signage, and furniture installation.',
            tasks: [
              'Partition installations',
              'Ceiling systems',
              'Flooring & finishes',
              'Signage installation',
              'Furniture & equipment'
            ],
            stats: { deliverables: 10, meetings: 6, milestones: 2 }
          },
          {
            id: 'handover',
            name: 'Commissioning & Handover',
            icon: '📊',
            duration: 'Week 36',
            weekStart: 36,
            weekEnd: 36,
            description: 'Systems commissioning, testing, training, documentation, and final handover.',
            tasks: [
              'Systems commissioning',
              'Performance testing',
              'Staff training',
              'Documentation',
              'Practical completion'
            ],
            stats: { deliverables: 8, meetings: 4, milestones: 2 }
          }
        ]
      },
      renovation: {
        totalWeeks: 16,
        phases: [
          {
            id: 'assessment',
            name: 'Assessment & Planning',
            icon: '🔍',
            duration: 'Weeks 1-2',
            weekStart: 1,
            weekEnd: 2,
            description: 'Existing condition survey, structural assessment, and renovation planning.',
            tasks: [
              'Condition survey',
              'Structural assessment',
              'Asbestos survey',
              'Renovation design',
              'Permit applications'
            ],
            stats: { deliverables: 6, meetings: 4, milestones: 2 }
          },
          {
            id: 'prep',
            name: 'Strip-Out & Prep',
            icon: '🔨',
            duration: 'Weeks 3-4',
            weekStart: 3,
            weekEnd: 4,
            description: 'Selective demolition, site protection, and preparation for new works.',
            tasks: [
              'Strip-out works',
              'Waste removal',
              'Site protection',
              'Existing services capping',
              'Temporary works'
            ],
            stats: { deliverables: 5, meetings: 3, milestones: 1 }
          },
          {
            id: 'structure',
            name: 'Structural Changes',
            icon: '🏗️',
            duration: 'Weeks 5-7',
            weekStart: 5,
            weekEnd: 7,
            description: 'Structural modifications, wall removals, extensions, and new openings.',
            tasks: [
              'Wall removals',
              'Beam installations',
              'Extension foundations',
              'Structural alterations',
              'Engineering sign-off'
            ],
            stats: { deliverables: 6, meetings: 4, milestones: 2 }
          },
          {
            id: 'services',
            name: 'Services Update',
            icon: '⚡',
            duration: 'Weeks 8-10',
            weekStart: 8,
            weekEnd: 10,
            description: 'Electrical rewiring, plumbing updates, heating/cooling upgrades.',
            tasks: [
              'Electrical rewiring',
              'Plumbing updates',
              'HVAC upgrades',
              'Smart home integration',
              'Safety compliance'
            ],
            stats: { deliverables: 8, meetings: 5, milestones: 3 }
          },
          {
            id: 'finishing',
            name: 'Finishing Works',
            icon: '✨',
            duration: 'Weeks 11-14',
            weekStart: 11,
            weekEnd: 14,
            description: 'Drywall, flooring, kitchen, bathrooms, painting, and fixtures.',
            tasks: [
              'Drywall & plastering',
              'Kitchen installation',
              'Bathroom renovation',
              'Flooring & tiling',
              'Painting & decorating'
            ],
            stats: { deliverables: 10, meetings: 5, milestones: 3 }
          },
          {
            id: 'handover',
            name: 'Completion',
            icon: '🔑',
            duration: 'Weeks 15-16',
            weekStart: 15,
            weekEnd: 16,
            description: 'Final touches, cleaning, snagging, and project completion.',
            tasks: [
              'Final inspections',
              'Snagging completion',
              'Professional cleaning',
              'Warranty docs',
              'Project handover'
            ],
            stats: { deliverables: 5, meetings: 3, milestones: 1 }
          }
        ]
      }
    };
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.renderTimeline(this.currentProjectType);
    this.renderPhases(this.currentProjectType);
  }
  
  bindEvents() {
    // Tab switching
    document.querySelectorAll('.timeline-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const type = tab.dataset.type;
        this.switchProjectType(type);
      });
    });
    
    // Timeline node clicks
    document.querySelector('.timeline-track').addEventListener('click', (e) => {
      const node = e.target.closest('.timeline-node');
      if (node) {
        const phaseId = node.dataset.phase;
        this.highlightPhase(phaseId);
      }
    });
    
    // Phase card clicks
    document.querySelector('.timeline-phases-container').addEventListener('click', (e) => {
      const card = e.target.closest('.phase-card');
      if (card) {
        const phaseId = card.dataset.phase;
        this.togglePhaseDetails(phaseId);
      }
    });
    
    // Timeline slider
    const slider = document.querySelector('.timeline-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        this.currentWeek = parseInt(e.target.value);
        this.updateWeekIndicator();
        this.updatePhaseProgress();
      });
    }
  }
  
  switchProjectType(type) {
    if (type === this.currentProjectType) return;
    
    // Update tabs
    document.querySelectorAll('.timeline-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.timeline-tab[data-type="${type}"]`).classList.add('active');
    
    this.currentProjectType = type;
    this.currentWeek = 0;
    
    // Animate transition
    const container = document.querySelector('.timeline-display');
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      this.renderTimeline(type);
      this.renderPhases(type);
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 300);
  }
  
  renderTimeline(type) {
    const data = this.timelineData[type];
    const track = document.querySelector('.timeline-track');
    
    // Clear and rebuild nodes
    track.innerHTML = '';
    
    data.phases.forEach((phase, index) => {
      const node = document.createElement('div');
      node.className = 'timeline-node';
      node.dataset.phase = phase.id;
      node.innerHTML = `
        <div class="node-marker">
          <span class="node-icon">${phase.icon}</span>
          <span class="node-number">${index + 1}</span>
        </div>
        <div class="node-label">${phase.name}</div>
        <div class="node-duration">${phase.duration}</div>
      `;
      track.appendChild(node);
    });
    
    // Update progress line
    const progressLine = document.querySelector('.timeline-progress-line');
    if (progressLine) {
      progressLine.style.width = '0%';
    }
    
    // Update slider max
    const slider = document.querySelector('.timeline-slider');
    if (slider) {
      slider.max = data.totalWeeks;
      slider.value = 0;
    }
    
    this.updateWeekLabels(type);
  }
  
  renderPhases(type) {
    const data = this.timelineData[type];
    const container = document.querySelector('.timeline-phases-container');
    
    container.innerHTML = '';
    
    data.phases.forEach((phase, index) => {
      const card = document.createElement('div');
      card.className = 'phase-card';
      card.dataset.phase = phase.id;
      
      const tasksHtml = phase.tasks.map(task => `
        <li>
          <span class="task-check">✓</span>
          ${task}
        </li>
      `).join('');
      
      card.innerHTML = `
        <div class="phase-header">
          <div class="phase-icon">${phase.icon}</div>
          <div class="phase-title-group">
            <h3>${phase.name}</h3>
            <div class="duration">
              <span>⏱️</span> ${phase.duration}
            </div>
          </div>
        </div>
        <p class="phase-description">${phase.description}</p>
        <ul class="phase-tasks">
          ${tasksHtml}
        </ul>
        <div class="phase-details">
          <div class="phase-stats">
            <div class="phase-stat">
              <div class="value">${phase.stats.deliverables}</div>
              <div class="label">Deliverables</div>
            </div>
            <div class="phase-stat">
              <div class="value">${phase.stats.meetings}</div>
              <div class="label">Meetings</div>
            </div>
            <div class="phase-stat">
              <div class="value">${phase.stats.milestones}</div>
              <div class="label">Milestones</div>
            </div>
            <div class="phase-stat">
              <div class="value">${phase.weekEnd - phase.weekStart + 1}</div>
              <div class="label">Weeks</div>
            </div>
          </div>
        </div>
      `;
      
      container.appendChild(card);
    });
  }
  
  updateWeekLabels(type) {
    const data = this.timelineData[type];
    const labelsContainer = document.querySelector('.timeline-weeks');
    
    if (!labelsContainer) return;
    
    const milestones = [1, Math.ceil(data.totalWeeks / 2), data.totalWeeks];
    
    labelsContainer.innerHTML = milestones.map(week => `
      <div class="week-label">
        <span>Week ${week}</span>
        ${week === 1 ? 'Start' : week === data.totalWeeks ? 'Complete' : 'Midpoint'}
      </div>
    `).join('');
  }
  
  highlightPhase(phaseId) {
    // Remove active from all
    document.querySelectorAll('.timeline-node').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.phase-card').forEach(c => c.classList.remove('active'));
    
    // Add active to selected
    const node = document.querySelector(`.timeline-node[data-phase="${phaseId}"]`);
    const card = document.querySelector(`.phase-card[data-phase="${phaseId}"]`);
    
    if (node) node.classList.add('active');
    if (card) {
      card.classList.add('active');
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  togglePhaseDetails(phaseId) {
    const card = document.querySelector(`.phase-card[data-phase="${phaseId}"]`);
    if (!card) return;
    
    const isActive = card.classList.contains('active');
    
    // Close all
    document.querySelectorAll('.phase-card').forEach(c => c.classList.remove('active'));
    
    // Open clicked if wasn't active
    if (!isActive) {
      card.classList.add('active');
    }
    
    // Sync with timeline node
    document.querySelectorAll('.timeline-node').forEach(n => n.classList.remove('active'));
    if (!isActive) {
      const node = document.querySelector(`.timeline-node[data-phase="${phaseId}"]`);
      if (node) node.classList.add('active');
    }
  }
  
  updateWeekIndicator() {
    const indicator = document.querySelector('.current-week-indicator');
    if (!indicator) return;
    
    indicator.textContent = `W${this.currentWeek}`;
    
    // Position indicator based on slider
    const slider = document.querySelector('.timeline-slider');
    const data = this.timelineData[this.currentProjectType];
    const percentage = (this.currentWeek / data.totalWeeks) * 100;
    indicator.style.left = `${percentage}%`;
  }
  
  updatePhaseProgress() {
    const data = this.timelineData[this.currentProjectType];
    
    // Update progress line
    const progressLine = document.querySelector('.timeline-progress-line');
    if (progressLine) {
      const percentage = (this.currentWeek / data.totalWeeks) * 100;
      progressLine.style.width = `${percentage}%`;
    }
    
    // Mark completed phases
    data.phases.forEach(phase => {
      const node = document.querySelector(`.timeline-node[data-phase="${phase.id}"]`);
      if (node) {
        if (this.currentWeek >= phase.weekEnd) {
          node.classList.add('completed');
        } else {
          node.classList.remove('completed');
        }
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const timelineSection = document.querySelector('.project-timeline-section');
  if (timelineSection) {
    window.projectTimeline = new ProjectTimelineVisualizer();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectTimelineVisualizer;
}
