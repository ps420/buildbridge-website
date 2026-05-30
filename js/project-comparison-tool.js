/**
 * Project Comparison Tool - v109.0
 * Fortune 500 Interactive Project Comparison
 */

class ProjectComparisonTool {
  constructor() {
    this.compareList = [];
    this.maxCompare = 4;
    this.projectsData = [];
    
    this.init();
  }
  
  init() {
    this.loadFromStorage();
    this.createModal();
    this.createTrigger();
    this.createComparisonBar();
    this.bindEvents();
    this.scanProjectCards();
  }
  
  // Project data - in production, this would come from an API or data attribute
  getProjectData() {
    return [
      {
        id: 'project-1',
        title: 'Modern Residential Complex',
        category: 'Residential',
        image: 'assets/02_Website_Heroes/Hero_2.png',
        location: 'Cape Town, SA',
        value: 'R 25M',
        duration: '18 months',
        size: '45 units',
        features: ['Smart Home Tech', 'Solar Power', 'Underground Parking'],
        rating: 4.9,
        status: 'Completed'
      },
      {
        id: 'project-2',
        title: 'Corporate Headquarters',
        category: 'Commercial',
        image: 'assets/03_Social_Campaign/Campaign_4.png',
        location: 'Johannesburg, SA',
        value: 'R 45M',
        duration: '24 months',
        size: '12,000 m²',
        features: ['LEED Gold', 'Open Plan', 'Rooftop Garden'],
        rating: 4.8,
        status: 'Completed'
      },
      {
        id: 'project-3',
        title: 'Luxury Villa Estate',
        category: 'Residential',
        image: 'assets/03_Social_Campaign/Campaign_5.png',
        location: 'Durban, SA',
        value: 'R 18M',
        duration: '14 months',
        size: '850 m²',
        features: ['Infinity Pool', 'Smart Security', 'Wine Cellar'],
        rating: 5.0,
        status: 'Completed'
      },
      {
        id: 'project-4',
        title: 'Industrial Warehouse',
        category: 'Industrial',
        image: 'assets/02_Website_Heroes/Hero_1.png',
        location: 'Port Elizabeth, SA',
        value: 'R 32M',
        duration: '16 months',
        size: '8,500 m²',
        features: ['High Ceilings', 'Loading Docks', 'Climate Control'],
        rating: 4.7,
        status: 'Completed'
      },
      {
        id: 'project-5',
        title: 'Shopping Mall Extension',
        category: 'Commercial',
        image: 'assets/03_Social_Campaign/Campaign_1.png',
        location: 'Pretoria, SA',
        value: 'R 55M',
        duration: '20 months',
        size: '15,000 m²',
        features: ['Multi-level', 'Food Court', 'Cinema Complex'],
        rating: 4.8,
        status: 'Completed'
      },
      {
        id: 'project-6',
        title: 'Beachfront Apartments',
        category: 'Mixed-Use',
        image: 'assets/03_Social_Campaign/Campaign_2.png',
        location: 'Cape Town, SA',
        value: 'R 38M',
        duration: '22 months',
        size: '60 units + retail',
        features: ['Ocean Views', 'Retail Space', 'Gym & Spa'],
        rating: 4.9,
        status: 'Completed'
      }
    ];
  }
  
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'project-comparison-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Project Comparison');
    
    modal.innerHTML = `
      <div class="comparison-container">
        <div class="comparison-header">
          <h2>Compare Projects</h2>
          <button class="comparison-close" aria-label="Close comparison">✕</button>
        </div>
        <div class="comparison-content">
          <div class="comparison-empty">
            <div class="comparison-empty-icon">📊</div>
            <h3>No Projects Selected</h3>
            <p>Add up to ${this.maxCompare} projects to compare side by side</p>
            <button class="comparison-btn comparison-btn-primary" onclick="projectComparison.closeModal()">Browse Projects</button>
          </div>
          <div class="comparison-table" style="display: none;"></div>
        </div>
        <div class="comparison-summary" style="display: none;">
          <div class="comparison-summary-text">
            Comparing <strong class="compare-count">0</strong> of <strong>${this.maxCompare}</strong> projects
          </div>
          <div class="comparison-summary-actions">
            <button class="comparison-btn comparison-btn-secondary" onclick="projectComparison.clearAll()">Clear All</button>
            <button class="comparison-btn comparison-btn-primary" onclick="projectComparison.enquireAll()">Enquire About All</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.modal = modal;
    
    // Bind close events
    modal.querySelector('.comparison-close').addEventListener('click', () => this.closeModal());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal();
    });
  }
  
  createTrigger() {
    const trigger = document.createElement('button');
    trigger.className = 'project-compare-trigger';
    trigger.setAttribute('aria-label', 'Open project comparison');
    trigger.innerHTML = '⚖️';
    
    trigger.addEventListener('click', () => this.openModal());
    
    document.body.appendChild(trigger);
    this.trigger = trigger;
    this.updateTrigger();
  }
  
  createComparisonBar() {
    const bar = document.createElement('div');
    bar.className = 'comparison-bar';
    bar.innerHTML = `
      <div class="comparison-bar-items"></div>
      <div class="comparison-bar-actions">
        <span class="comparison-bar-count"><strong>0</strong> / ${this.maxCompare} projects</span>
        <button class="comparison-btn comparison-btn-secondary" onclick="projectComparison.clearAll()">Clear</button>
        <button class="comparison-btn comparison-btn-primary" onclick="projectComparison.openModal()">Compare</button>
      </div>
    `;
    
    document.body.appendChild(bar);
    this.comparisonBar = bar;
    this.barItems = bar.querySelector('.comparison-bar-items');
    this.barCount = bar.querySelector('.comparison-bar-count strong');
  }
  
  scanProjectCards() {
    const cards = document.querySelectorAll('.project-card, [data-project-id]');
    
    cards.forEach((card, index) => {
      // Get project data
      let projectData = this.getProjectData()[index];
      if (!projectData) return;
      
      // Set data attribute for reference
      card.setAttribute('data-project-id', projectData.id);
      
      // Only add button if not already present
      if (!card.querySelector('.project-compare-btn')) {
        const btn = document.createElement('button');
        btn.className = 'project-compare-btn';
        btn.innerHTML = '<span>+</span> Compare';
        btn.setAttribute('data-project-id', projectData.id);
        
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleProject(projectData.id);
        });
        
        card.style.position = 'relative';
        card.appendChild(btn);
      }
    });
  }
  
  bindEvents() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });
  }
  
  toggleProject(projectId) {
    const index = this.compareList.indexOf(projectId);
    
    if (index > -1) {
      // Remove
      this.compareList.splice(index, 1);
      this.showToast('Project removed from comparison');
    } else {
      // Add
      if (this.compareList.length >= this.maxCompare) {
        this.showToast(`Maximum ${this.maxCompare} projects allowed`, 'error');
        return;
      }
      this.compareList.push(projectId);
      this.showToast('Project added to comparison');
    }
    
    this.saveToStorage();
    this.updateUI();
  }
  
  removeProject(projectId) {
    const index = this.compareList.indexOf(projectId);
    if (index > -1) {
      this.compareList.splice(index, 1);
      this.saveToStorage();
      this.updateUI();
      this.renderComparison();
    }
  }
  
  clearAll() {
    this.compareList = [];
    this.saveToStorage();
    this.updateUI();
    this.renderComparison();
    this.showToast('Comparison cleared');
  }
  
  updateUI() {
    this.updateTrigger();
    this.updateComparisonBar();
    this.updateCardButtons();
  }
  
  updateTrigger() {
    this.trigger.setAttribute('data-count', this.compareList.length);
    this.trigger.classList.toggle('has-items', this.compareList.length > 0);
  }
  
  updateComparisonBar() {
    const isActive = this.compareList.length > 0;
    this.comparisonBar.classList.toggle('active', isActive);
    this.barCount.textContent = this.compareList.length;
    
    // Update bar items
    this.barItems.innerHTML = this.compareList.map(id => {
      const project = this.getProjectData().find(p => p.id === id);
      if (!project) return '';
      
      return `
        <div class="comparison-bar-item" data-project-id="${id}">
          <img src="${project.image}" alt="${project.title}">
          <span class="remove" onclick="projectComparison.removeProject('${id}')">✕</span>
        </div>
      `;
    }).join('');
  }
  
  updateCardButtons() {
    document.querySelectorAll('.project-compare-btn').forEach(btn => {
      const projectId = btn.getAttribute('data-project-id');
      const isAdded = this.compareList.includes(projectId);
      
      btn.classList.toggle('added', isAdded);
      btn.innerHTML = isAdded ? '<span>✓</span> Added' : '<span>+</span> Compare';
    });
  }
  
  openModal() {
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.renderComparison();
    
    // Focus management
    setTimeout(() => {
      this.modal.querySelector('.comparison-close').focus();
    }, 100);
  }
  
  closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  renderComparison() {
    const emptyState = this.modal.querySelector('.comparison-empty');
    const table = this.modal.querySelector('.comparison-table');
    const summary = this.modal.querySelector('.comparison-summary');
    const countEl = this.modal.querySelector('.compare-count');
    
    if (this.compareList.length === 0) {
      emptyState.style.display = 'block';
      table.style.display = 'none';
      summary.style.display = 'none';
      return;
    }
    
    emptyState.style.display = 'none';
    table.style.display = 'grid';
    summary.style.display = 'flex';
    countEl.textContent = this.compareList.length;
    
    // Get projects
    const projects = this.compareList.map(id => 
      this.getProjectData().find(p => p.id === id)
    ).filter(Boolean);
    
    // Features to compare
    const features = [
      { key: 'location', label: '📍 Location', icon: '📍' },
      { key: 'value', label: '💰 Project Value', icon: '💰' },
      { key: 'duration', label: '⏱️ Duration', icon: '⏱️' },
      { key: 'size', label: '📐 Size', icon: '📐' },
      { key: 'rating', label: '⭐ Rating', icon: '⭐' },
      { key: 'features', label: '✨ Key Features', icon: '✨', isList: true }
    ];
    
    // Build table
    let html = `
      <div class="comparison-features">
        <div class="comparison-feature-header">
          <h3>Features</h3>
        </div>
        ${features.map(f => `
          <div class="comparison-feature-item">
            <span class="icon">${f.icon}</span>
            ${f.label}
          </div>
        `).join('')}
      </div>
    `;
    
    // Find best value (lowest is better for some metrics)
    const values = projects.map(p => parseFloat(p.value.replace(/[^0-9]/g, '')));
    const minValue = Math.min(...values);
    
    projects.forEach((project, index) => {
      const isWinner = parseFloat(project.value.replace(/[^0-9]/g, '')) === minValue;
      
      html += `
        <div class="comparison-project" style="animation-delay: ${index * 0.1}s">
          ${isWinner && projects.length > 1 ? '<div class="comparison-winner-badge">Best Value</div>' : ''}
          <button class="comparison-project-remove" onclick="projectComparison.removeProject('${project.id}')" aria-label="Remove ${project.title}">✕</button>
          <div class="comparison-project-header">
            <div class="comparison-project-image">
              <img src="${project.image}" alt="${project.title}">
            </div>
            <h4>${project.title}</h4>
            <span class="category">${project.category}</span>
          </div>
          <div class="comparison-project-data">${project.location}</div>
          <div class="comparison-project-data ${parseFloat(project.value.replace(/[^0-9]/g, '')) === minValue ? 'value-highlight' : ''}">${project.value}</div>
          <div class="comparison-project-data">${project.duration}</div>
          <div class="comparison-project-data">${project.size}</div>
          <div class="comparison-project-data">${project.rating} / 5.0</div>
          <div class="comparison-project-data" data-label="Key Features">
            ${project.features.slice(0, 3).join(', ')}
          </div>
        </div>
      `;
    });
    
    // Add empty slots
    for (let i = projects.length; i < this.maxCompare; i++) {
      html += `
        <div class="comparison-add-slot" onclick="projectComparison.closeModal()">
          <span class="icon">+</span>
          <span>Add Project</span>
        </div>
      `;
    }
    
    table.innerHTML = html;
  }
  
  enquireAll() {
    const projects = this.compareList.map(id => {
      const p = this.getProjectData().find(p => p.id === id);
      return p ? p.title : '';
    }).filter(Boolean);
    
    const message = `I'm interested in the following projects: ${projects.join(', ')}`;
    
    // Open WhatsApp with pre-filled message
    window.open(`https://wa.me/27661200064?text=${encodeURIComponent(message)}`, '_blank');
  }
  
  showToast(message, type = 'success') {
    // Use existing toast system or create simple one
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      // Simple fallback
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#ef4444' : '#c9a45c'};
        color: ${type === 'error' ? 'white' : '#0f0f10'};
        padding: 12px 24px;
        border-radius: 30px;
        font-weight: 600;
        z-index: 10000;
        animation: toast-in 0.3s ease;
      `;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }
  }
  
  saveToStorage() {
    try {
      localStorage.setItem('buildbridge_compare', JSON.stringify(this.compareList));
    } catch (e) {
      console.warn('Could not save to localStorage');
    }
  }
  
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('buildbridge_compare');
      if (saved) {
        this.compareList = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load from localStorage');
    }
  }
}

// Add toast animations
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  @keyframes toast-in {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes toast-out {
    from { opacity: 1; transform: translateX(-50%) translateY(0); }
    to { opacity: 0; transform: translateX(-50%) translateY(20px); }
  }
`;
document.head.appendChild(toastStyles);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.projectComparison = new ProjectComparisonTool();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectComparisonTool;
}
