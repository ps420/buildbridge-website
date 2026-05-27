/**
 * BuildBridge Project Comparison Tool
 * Fortune 500 Side-by-Side Project Analysis
 */

class ProjectComparisonTool {
  constructor(container) {
    this.container = container;
    this.selectedProjects = [];
    this.maxProjects = 3;
    this.currentFilter = 'all';
    
    // Project database
    this.projects = [
      {
        id: 1,
        name: "Cape Town Luxury Estate",
        location: "Camps Bay, Cape Town",
        province: "Western Cape",
        category: "luxury",
        type: "Residential",
        value: "R12M",
        duration: "8 months",
        area: "850 m²",
        bedrooms: 5,
        bathrooms: 4,
        parking: 3,
        completion: "2025",
        image: "assets/02_Website_Heroes/Hero_1.png",
        features: [
          "Smart home automation",
          "Infinity pool",
          "Wine cellar",
          "Home theatre",
          "Solar power system"
        ],
        contractor: "Elite Builders Cape Town",
        rating: 4.9
      },
      {
        id: 2,
        name: "Johannesburg Corporate HQ",
        location: "Sandton, Johannesburg",
        province: "Gauteng",
        category: "commercial",
        type: "Commercial",
        value: "R45M",
        duration: "18 months",
        area: "12,000 m²",
        floors: 12,
        parking: 200,
        completion: "2024",
        image: "assets/02_Website_Heroes/Hero_2.png",
        features: [
          "Grade A office space",
          "Green building certified",
          "Rooftop terrace",
          "Underground parking",
          "Conference facilities"
        ],
        contractor: "Metro Commercial Construction",
        rating: 4.8
      },
      {
        id: 3,
        name: "Durban Waterfront Complex",
        location: "Umhlanga, Durban",
        province: "KwaZulu-Natal",
        category: "mixed-use",
        type: "Mixed-Use",
        value: "R28M",
        duration: "14 months",
        area: "6,500 m²",
        units: 24,
        parking: 48,
        completion: "2024",
        image: "assets/03_Social_Campaign/Campaign_4.png",
        features: [
          "Ocean views",
          "Retail ground floor",
          "Gym & wellness center",
          "Secure parking",
          "24/7 security"
        ],
        contractor: "Coastal Developments",
        rating: 4.7
      },
      {
        id: 4,
        name: "Pretoria Industrial Park",
        location: "Silverton, Pretoria",
        province: "Gauteng",
        category: "industrial",
        type: "Industrial",
        value: "R65M",
        duration: "24 months",
        area: "25,000 m²",
        warehouse: "20,000 m²",
        office: "2,500 m²",
        completion: "2025",
        image: "assets/03_Social_Campaign/Campaign_5.png",
        features: [
          "Automated warehouse",
          "Solar power integration",
          "Loading docks",
          " Cold storage",
          "Advanced security"
        ],
        contractor: "Industrial Solutions SA",
        rating: 4.9
      },
      {
        id: 5,
        name: "Stellenbosch Wine Estate",
        location: "Stellenbosch",
        province: "Western Cape",
        category: "luxury",
        type: "Hospitality",
        value: "R22M",
        duration: "12 months",
        area: "3,200 m²",
        rooms: 8,
        vineyards: "15 hectares",
        completion: "2024",
        image: "assets/02_Website_Heroes/Hero_1.png",
        features: [
          "Guest cottages",
          "Tasting room",
          "Restaurant",
          "Event venue",
          "Spa facilities"
        ],
        contractor: "Heritage Builders",
        rating: 4.8
      },
      {
        id: 6,
        name: "PE Retail Center",
        location: "Summerstrand, Port Elizabeth",
        province: "Eastern Cape",
        category: "retail",
        type: "Retail",
        value: "R35M",
        duration: "16 months",
        area: "8,000 m²",
        shops: 45,
        parking: 300,
        completion: "2023",
        image: "assets/02_Website_Heroes/Hero_2.png",
        features: [
          "Anchor tenant ready",
          "Food court",
          "Entertainment zone",
          "Ample parking",
          "High visibility"
        ],
        contractor: "Retail Construction Co",
        rating: 4.6
      }
    ];
    
    this.comparisonCategories = [
      { id: 'overview', label: 'Overview', icon: 'info' },
      { id: 'price', label: 'Project Value', icon: 'dollar' },
      { id: 'timeline', label: 'Duration', icon: 'clock' },
      { id: 'specs', label: 'Specifications', icon: 'grid' },
      { id: 'features', label: 'Features', icon: 'check' },
      { id: 'contractor', label: 'Contractor', icon: 'users' }
    ];
    
    this.init();
  }
  
  init() {
    this.createHTML();
    this.bindEvents();
    this.render();
  }
  
  createHTML() {
    this.container.innerHTML = `
      <div class="comparison-container">
        <div class="comparison-toolbar">
          <div class="comparison-toolbar-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
            </svg>
            Project Comparison
          </div>
          <div class="comparison-actions">
            <button class="comparison-btn" id="clearComparison">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Clear All
            </button>
            <button class="comparison-btn primary" id="printComparison">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2"/>
                <path d="M17 9V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4"/>
                <rect x="7" y="15" width="10" height="8" rx="1"/>
              </svg>
              Print / PDF
            </button>
          </div>
        </div>
        
        <div class="comparison-grid" id="comparisonGrid">
          <!-- Dynamic content will be inserted here -->
        </div>
        
        ${this.selectedProjects.length > 0 ? `
        <div class="comparison-summary">
          <div class="comparison-summary-title">Summary Statistics</div>
          <div class="comparison-summary-grid" id="comparisonSummary">
            <!-- Dynamic summary -->
          </div>
        </div>
        ` : ''}
      </div>
      
      <!-- Project Selector Modal -->
      <div class="project-selector-modal" id="projectSelectorModal">
        <div class="project-selector-content">
          <div class="project-selector-header">
            <h3>Select a Project to Compare</h3>
            <button class="project-selector-close" id="closeProjectSelector">&times;</button>
          </div>
          <div class="project-selector-search">
            <input type="text" id="projectSearchInput" placeholder="Search projects by name, location, or type...">
          </div>
          <div class="project-list-grid" id="projectListGrid">
            <!-- Project cards -->
          </div>
        </div>
      </div>
    `;
  }
  
  bindEvents() {
    // Clear comparison
    this.container.querySelector('#clearComparison')?.addEventListener('click', () => {
      this.clearAll();
    });
    
    // Print comparison
    this.container.querySelector('#printComparison')?.addEventListener('click', () => {
      this.printComparison();
    });
    
    // Modal close
    this.container.querySelector('#closeProjectSelector')?.addEventListener('click', () => {
      this.closeModal();
    });
    
    // Close modal on backdrop click
    this.container.querySelector('#projectSelectorModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'projectSelectorModal') {
        this.closeModal();
      }
    });
    
    // Search
    const searchInput = this.container.querySelector('#projectSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterProjects(e.target.value);
      });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }
  
  render() {
    if (this.selectedProjects.length === 0) {
      this.renderEmptyState();
    } else {
      this.renderComparison();
    }
  }
  
  renderEmptyState() {
    const grid = this.container.querySelector('#comparisonGrid');
    grid.innerHTML = `
      <div class="comparison-empty" style="grid-column: 1 / -1;">
        <div class="comparison-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
          </svg>
        </div>
        <h3>Compare Projects</h3>
        <p>Select up to ${this.maxProjects} projects to compare side-by-side and make informed decisions.</p>
        <button class="comparison-btn primary" id="addFirstProject">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add Your First Project
        </button>
      </div>
    `;
    
    this.container.querySelector('#addFirstProject').addEventListener('click', () => {
      this.openModal();
    });
    
    // Remove summary
    const summary = this.container.querySelector('.comparison-summary');
    if (summary) summary.remove();
  }
  
  renderComparison() {
    const grid = this.container.querySelector('#comparisonGrid');
    
    // Create grid with labels column + project columns
    let html = `
      <!-- Labels Column -->
      <div class="comparison-labels">
        ${this.comparisonCategories.map(cat => `
          <div class="comparison-label ${cat.id === 'overview' ? 'category-label' : ''}">
            ${cat.label}
          </div>
        `).join('')}
      </div>
    `;
    
    // Project columns
    this.selectedProjects.forEach((projectId, index) => {
      const project = this.projects.find(p => p.id === projectId);
      if (!project) return;
      
      html += `
        <div class="comparison-project" data-project-id="${project.id}">
          <div class="comparison-project-header">
            <img src="${project.image}" alt="${project.name}" class="comparison-project-image">
            <div class="comparison-project-overlay"></div>
            <span class="comparison-project-category">${project.type}</span>
            <button class="comparison-project-remove" data-project-id="${project.id}" title="Remove from comparison">
              &times;
            </button>
            <div class="comparison-project-title">
              <h4>${project.name}</h4>
              <p>${project.location}</p>
            </div>
          </div>
          
          <div class="comparison-project-data value-highlight">
            ${project.value}
          </div>
          
          <div class="comparison-project-data">
            <div class="comparison-value">
              <span class="comparison-value-primary">${project.duration}</span>
              <span class="comparison-value-secondary">Completion: ${project.completion}</span>
            </div>
          </div>
          
          <div class="comparison-project-data">
            <div class="comparison-features">
              <div class="comparison-feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
                ${project.area} Total Area
              </div>
              ${project.bedrooms ? `
              <div class="comparison-feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
                ${project.bedrooms} Bedrooms
              </div>
              ` : ''}
              ${project.floors ? `
              <div class="comparison-feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
                ${project.floors} Floors
              </div>
              ` : ''}
              ${project.units ? `
              <div class="comparison-feature">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
                ${project.units} Units
              </div>
              ` : ''}
            </div>
          </div>
          
          <div class="comparison-project-data">
            <div class="comparison-features">
              ${project.features.slice(0, 4).map(feature => `
                <div class="comparison-feature">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                  ${feature}
                </div>
              `).join('')}
              ${project.features.length > 4 ? `
                <div class="comparison-feature" style="color: var(--slate);">
                  +${project.features.length - 4} more
                </div>
              ` : ''}
            </div>
          </div>
          
          <div class="comparison-project-data">
            <div class="comparison-value">
              <span class="comparison-value-primary">${project.contractor}</span>
              <span class="comparison-value-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                ${project.rating}/5.0
              </span>
            </div>
          </div>
        </div>
      `;
    });
    
    // Add Project button column (if under max)
    if (this.selectedProjects.length < this.maxProjects) {
      html += `
        <div class="comparison-add-project" id="addProjectColumn">
          <div class="comparison-add-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <span>Add Project</span>
        </div>
      `;
    }
    
    grid.innerHTML = html;
    
    // Bind remove buttons
    grid.querySelectorAll('.comparison-project-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        this.removeProject(parseInt(btn.dataset.projectId));
      });
    });
    
    // Bind add project
    const addBtn = grid.querySelector('#addProjectColumn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.openModal();
      });
    }
    
    this.renderSummary();
  }
  
  renderSummary() {
    // Calculate statistics
    const selectedProjectsData = this.selectedProjects
      .map(id => this.projects.find(p => p.id === id))
      .filter(Boolean);
    
    const totalValue = selectedProjectsData.reduce((sum, p) => {
      const value = parseFloat(p.value.replace(/[^0-9.]/g, ''));
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
    
    const avgRating = selectedProjectsData.reduce((sum, p) => sum + p.rating, 0) / selectedProjectsData.length;
    
    const totalArea = selectedProjectsData.reduce((sum, p) => {
      const area = parseFloat(p.area.replace(/[^0-9.]/g, ''));
      return sum + (isNaN(area) ? 0 : area);
    }, 0);
    
    const summary = this.container.querySelector('#comparisonSummary');
    if (!summary) return;
    
    summary.innerHTML = `
      <div class="comparison-summary-item">
        <div class="comparison-summary-value">${selectedProjectsData.length}</div>
        <div class="comparison-summary-label">Projects</div>
      </div>
      <div class="comparison-summary-item">
        <div class="comparison-summary-value">R${totalValue.toFixed(0)}M</div>
        <div class="comparison-summary-label">Total Value</div>
      </div>
      <div class="comparison-summary-item">
        <div class="comparison-summary-value">${totalArea.toLocaleString()}</div>
        <div class="comparison-summary-label">Total Area (m²)</div>
      </div>
      <div class="comparison-summary-item">
        <div class="comparison-summary-value">${avgRating.toFixed(1)}</div>
        <div class="comparison-summary-label">Avg Rating</div>
      </div>
    `;
  }
  
  openModal() {
    const modal = this.container.querySelector('#projectSelectorModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    this.renderProjectList();
    
    // Focus search
    setTimeout(() => {
      this.container.querySelector('#projectSearchInput')?.focus();
    }, 100);
  }
  
  closeModal() {
    const modal = this.container.querySelector('#projectSelectorModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  renderProjectList(searchTerm = '') {
    const grid = this.container.querySelector('#projectListGrid');
    
    const filtered = this.projects.filter(project => {
      // Exclude already selected
      if (this.selectedProjects.includes(project.id)) return false;
      
      // Filter by search
      if (!searchTerm) return true;
      
      const search = searchTerm.toLowerCase();
      return (
        project.name.toLowerCase().includes(search) ||
        project.location.toLowerCase().includes(search) ||
        project.type.toLowerCase().includes(search) ||
        project.province.toLowerCase().includes(search)
      );
    });
    
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--slate);">
          <p>No projects found${searchTerm ? ' matching your search' : ''}.</p>
        </div>
      `;
      return;
    }
    
    grid.innerHTML = filtered.map(project => `
      <div class="project-select-card" data-project-id="${project.id}">
        <div class="project-select-image">
          <img src="${project.image}" alt="${project.name}">
        </div>
        <div class="project-select-info">
          <h4>${project.name}</h4>
          <p>${project.type} • ${project.value}</p>
        </div>
      </div>
    `).join('');
    
    // Bind clicks
    grid.querySelectorAll('.project-select-card').forEach(card => {
      card.addEventListener('click', () => {
        this.addProject(parseInt(card.dataset.projectId));
        this.closeModal();
      });
    });
  }
  
  filterProjects(searchTerm) {
    this.renderProjectList(searchTerm);
  }
  
  addProject(projectId) {
    if (this.selectedProjects.length >= this.maxProjects) {
      this.showNotification('Maximum of ' + this.maxProjects + ' projects allowed', 'warning');
      return;
    }
    
    if (this.selectedProjects.includes(projectId)) {
      this.showNotification('Project already in comparison', 'info');
      return;
    }
    
    this.selectedProjects.push(projectId);
    this.render();
    
    // Save to session storage
    this.saveToStorage();
  }
  
  removeProject(projectId) {
    this.selectedProjects = this.selectedProjects.filter(id => id !== projectId);
    this.render();
    this.saveToStorage();
  }
  
  clearAll() {
    if (this.selectedProjects.length === 0) return;
    
    if (confirm('Clear all projects from comparison?')) {
      this.selectedProjects = [];
      this.render();
      sessionStorage.removeItem('projectComparison');
    }
  }
  
  saveToStorage() {
    sessionStorage.setItem('projectComparison', JSON.stringify(this.selectedProjects));
  }
  
  loadFromStorage() {
    const saved = sessionStorage.getItem('projectComparison');
    if (saved) {
      this.selectedProjects = JSON.parse(saved);
      this.render();
    }
  }
  
  printComparison() {
    window.print();
  }
  
  showNotification(message, type = 'info') {
    // Use existing toast system or create simple notification
    if (window.Toast) {
      window.Toast.info(message);
    } else {
      // Simple fallback notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        padding: 16px 32px;
        background: var(--gun);
        border: 1px solid rgba(201, 206, 214, 0.2);
        border-radius: 8px;
        color: var(--white);
        font-size: 14px;
        z-index: 99999;
        animation: fadeInUp 0.3s ease;
      `;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('projectComparison');
  if (container) {
    window.comparisonTool = new ProjectComparisonTool(container);
    window.comparisonTool.loadFromStorage();
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectComparisonTool;
}
