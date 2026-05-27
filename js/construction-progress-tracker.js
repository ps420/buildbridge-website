/**
 * BuildBridge Construction Progress Tracker
 * v34.0 - Interactive Project Timeline
 * Demonstrates BuildBridge's methodology with animated progression
 */

class ConstructionProgressTracker {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;
    
    this.phases = [
      {
        id: 1,
        phase: 'Phase 01',
        title: 'Discovery & Planning',
        description: 'We start with comprehensive site assessments, feasibility studies, and detailed project scoping. Our team analyzes your requirements, budget constraints, and timeline to create a solid foundation for success.',
        icon: '🔍',
        cardTitle: 'Project Initiation',
        duration: '1-2 Weeks',
        deliverables: 'Site Plan, Budget, Timeline',
        progress: 100,
        status: 'completed'
      },
      {
        id: 2,
        phase: 'Phase 02',
        title: 'Design & Documentation',
        description: 'Architectural blueprints, engineering specifications, and permit applications. We coordinate with designers and regulatory bodies to ensure every detail meets local building codes and your vision.',
        icon: '📐',
        cardTitle: 'Technical Design',
        duration: '3-4 Weeks',
        deliverables: 'Blueprints, Permits, Specs',
        progress: 100,
        status: 'completed'
      },
      {
        id: 3,
        phase: 'Phase 03',
        title: 'Contractor Selection',
        description: 'Leveraging our vetted network of 50+ qualified contractors, we match your project with the perfect team. Rigorous evaluation ensures expertise alignment, competitive pricing, and proven track records.',
        icon: '👥',
        cardTitle: 'Team Assembly',
        duration: '2-3 Weeks',
        deliverables: 'Signed Contracts, Schedules',
        progress: 75,
        status: 'active'
      },
      {
        id: 4,
        phase: 'Phase 04',
        title: 'Construction Management',
        description: 'Full oversight of the build process with real-time tracking, quality control checkpoints, and transparent communication. We manage timelines, coordinate subcontractors, and ensure adherence to specifications.',
        icon: '🏗️',
        cardTitle: 'Active Build',
        duration: 'Ongoing',
        deliverables: 'Weekly Reports, Inspections',
        progress: 0,
        status: 'pending'
      },
      {
        id: 5,
        phase: 'Phase 05',
        title: 'Quality Assurance',
        description: 'Rigorous inspections at every milestone ensure workmanship meets our exacting standards. We conduct final walkthroughs, address punch list items, and ensure complete client satisfaction before handover.',
        icon: '✓',
        cardTitle: 'Final Inspection',
        duration: '1 Week',
        deliverables: 'Certificate, Warranty, Keys',
        progress: 0,
        status: 'pending'
      }
    ];
    
    this.currentPhase = 2; // 0-indexed, so 2 = Phase 3
    this.observer = null;
    this.hasAnimated = false;
    
    this.init();
  }
  
  init() {
    this.createStructure();
    this.createObserver();
    this.bindEvents();
  }
  
  createStructure() {
    const html = `
      <div class="progress-tracker-header">
        <p class="eyebrow">Our Methodology</p>
        <h2>Construction <span>Process</span></h2>
        <p>A proven five-phase approach that ensures transparency, quality, and successful project delivery every time.</p>
      </div>
      
      <div class="progress-container">
        <div class="progress-line-container">
          <div class="progress-line-bg"></div>
          <div class="progress-line-fill"></div>
          <div class="progress-line-glow"></div>
        </div>
        
        ${this.phases.map((phase, index) => this.createPhaseHTML(phase, index)).join('')}
      </div>
      
      <div class="progress-controls">
        <button class="progress-btn" data-action="prev">
          <span>←</span> Previous Phase
        </button>
        <button class="progress-btn primary" data-action="simulate">
          <span>▶</span> Simulate Project
        </button>
        <button class="progress-btn" data-action="next">
          Next Phase <span>→</span>
        </button>
      </div>
    `;
    
    this.container.innerHTML = html;
    this.cacheElements();
  }
  
  createPhaseHTML(phase, index) {
    const isCompleted = index < this.currentPhase;
    const isActive = index === this.currentPhase;
    const statusClass = isCompleted ? 'completed' : (isActive ? 'active' : '');
    
    return `
      <div class="progress-item ${statusClass}" data-phase="${index}">
        <div class="progress-content">
          <span class="progress-phase">${phase.phase}</span>
          <h3 class="progress-title">${phase.title}</h3>
          <p class="progress-description">${phase.description}</p>
        </div>
        
        <div class="progress-node">${phase.id}</div>
        
        <div class="progress-visual">
          <div class="progress-card" style="--rotate-y: ${index % 2 === 0 ? '5deg' : '-5deg'}">
            <div class="progress-card-header">
              <div class="progress-card-icon">${phase.icon}</div>
              <div>
                <div class="progress-card-title">${phase.cardTitle}</div>
                <div class="progress-card-status">${isCompleted ? '✓ Completed' : (isActive ? '● In Progress' : '○ Pending')}</div>
              </div>
            </div>
            
            <div class="progress-mini-bar">
              <div class="progress-mini-fill" style="width: ${isCompleted ? 100 : phase.progress}%"></div>
            </div>
            
            <div class="progress-metrics">
              <div class="progress-metric">
                <span class="progress-metric-value">${phase.duration}</span>
                <span class="progress-metric-label">Duration</span>
              </div>
              <div class="progress-metric">
                <span class="progress-metric-value">${phase.deliverables.split(',').length}</span>
                <span class="progress-metric-label">Deliverables</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  cacheElements() {
    this.items = this.container.querySelectorAll('.progress-item');
    this.lineFill = this.container.querySelector('.progress-line-fill');
    this.lineGlow = this.container.querySelector('.progress-line-glow');
    this.controls = this.container.querySelectorAll('.progress-btn');
  }
  
  createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.animateProgress();
          this.hasAnimated = true;
        }
      });
    }, { threshold: 0.2 });
    
    this.observer.observe(this.container);
  }
  
  animateProgress() {
    // Animate progress line
    const progressPercent = ((this.currentPhase) / (this.phases.length - 1)) * 100;
    this.lineFill.style.height = `${progressPercent}%`;
    this.lineGlow.style.opacity = '1';
    this.lineGlow.style.top = `${progressPercent}%`;
    
    // Animate items sequentially
    this.items.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
        
        if (index < this.currentPhase || index === this.currentPhase) {
          item.classList.add(index < this.currentPhase ? 'completed' : 'active');
        }
        
        // Animate mini progress bars
        const miniFill = item.querySelector('.progress-mini-fill');
        if (miniFill) {
          const targetWidth = index < this.currentPhase ? 100 : 
                             (index === this.currentPhase ? this.phases[index].progress : 0);
          setTimeout(() => {
            miniFill.style.width = `${targetWidth}%`;
          }, 300);
        }
      }, index * 200);
    });
  }
  
  bindEvents() {
    this.controls.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        this.handleControl(action);
      });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        this.navigatePhase(-1);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        this.navigatePhase(1);
      }
    });
  }
  
  handleControl(action) {
    switch(action) {
      case 'prev':
        this.navigatePhase(-1);
        break;
      case 'next':
        this.navigatePhase(1);
        break;
      case 'simulate':
        this.simulateProject();
        break;
    }
  }
  
  navigatePhase(direction) {
    const newPhase = Math.max(0, Math.min(this.phases.length - 1, this.currentPhase + direction));
    
    if (newPhase !== this.currentPhase) {
      // Remove active from current
      this.items[this.currentPhase].classList.remove('active');
      
      // Update phase
      this.currentPhase = newPhase;
      
      // Add active to new current
      this.items[this.currentPhase].classList.add('active');
      
      // Scroll to phase
      this.items[this.currentPhase].scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      this.updateProgressLine();
    }
  }
  
  updateProgressLine() {
    const progressPercent = (this.currentPhase / (this.phases.length - 1)) * 100;
    this.lineFill.style.height = `${progressPercent}%`;
    this.lineGlow.style.top = `${progressPercent}%`;
  }
  
  simulateProject() {
    const simulateBtn = this.container.querySelector('[data-action="simulate"]');
    simulateBtn.innerHTML = '<span class="simulating">◐</span> Simulating...';
    simulateBtn.disabled = true;
    
    // Reset all phases
    this.items.forEach((item, index) => {
      item.classList.remove('completed', 'active');
      const miniFill = item.querySelector('.progress-mini-fill');
      if (miniFill) miniFill.style.width = '0%';
    });
    
    this.currentPhase = 0;
    this.lineFill.style.height = '0%';
    
    // Simulate progression through phases
    let currentSimPhase = 0;
    
    const advancePhase = () => {
      if (currentSimPhase >= this.phases.length) {
        simulateBtn.innerHTML = '<span>▶</span> Simulate Again';
        simulateBtn.disabled = false;
        
        // Show completion toast
        if (window.showToast) {
          window.showToast('Project simulation completed! Your build journey awaits.', 'success');
        }
        return;
      }
      
      // Mark previous as completed
      if (currentSimPhase > 0) {
        this.items[currentSimPhase - 1].classList.remove('active');
        this.items[currentSimPhase - 1].classList.add('completed');
        const prevMiniFill = this.items[currentSimPhase - 1].querySelector('.progress-mini-fill');
        if (prevMiniFill) prevMiniFill.style.width = '100%';
      }
      
      // Activate current
      this.items[currentSimPhase].classList.add('active');
      this.currentPhase = currentSimPhase;
      this.updateProgressLine();
      
      // Scroll to current phase
      this.items[currentSimPhase].scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      currentSimPhase++;
      setTimeout(advancePhase, 1500);
    };
    
    advancePhase();
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const tracker = new ConstructionProgressTracker('#construction-progress');
  
  // Expose for debugging
  window.progressTracker = tracker;
});
